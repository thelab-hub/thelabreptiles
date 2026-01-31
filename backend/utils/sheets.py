"""
Google Sheets Integration Utility
Handles all database operations via Google Sheets API
Falls back to local Excel file for development
"""

import os
import json
from datetime import datetime
from pathlib import Path

# Try to import Google Sheets libraries
try:
    import gspread
    from google.oauth2.service_account import Credentials
    GSPREAD_AVAILABLE = True
except ImportError:
    GSPREAD_AVAILABLE = False

# Try to import pandas for Excel handling
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False


class SheetsDB:
    """
    Database abstraction layer for Google Sheets
    Falls back to local Excel/JSON for development
    """

    def __init__(self):
        self.client = None
        self.spreadsheet = None
        self.use_local = True
        self.local_data = {}
        self.local_data_path = Path(__file__).parent.parent / 'admin' / 'data'

        # Try to connect to Google Sheets
        if GSPREAD_AVAILABLE and os.environ.get('GOOGLE_SHEET_ID'):
            try:
                self._connect_google_sheets()
                self.use_local = False
            except Exception as e:
                print(f"Google Sheets connection failed: {e}")
                print("Falling back to local data...")

        # Load local data if using local mode
        if self.use_local:
            self._load_local_data()

    def _connect_google_sheets(self):
        """Connect to Google Sheets using service account"""
        scopes = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive'
        ]

        # Check for credentials file or environment variable
        creds_path = os.environ.get('GOOGLE_CREDENTIALS_PATH', 'credentials.json')
        creds_json = os.environ.get('GOOGLE_CREDENTIALS_JSON')

        if creds_json:
            # Use credentials from environment variable (for Railway)
            creds_dict = json.loads(creds_json)
            credentials = Credentials.from_service_account_info(creds_dict, scopes=scopes)
        elif os.path.exists(creds_path):
            # Use credentials file
            credentials = Credentials.from_service_account_file(creds_path, scopes=scopes)
        else:
            raise FileNotFoundError("Google credentials not found")

        self.client = gspread.authorize(credentials)
        self.spreadsheet = self.client.open_by_key(os.environ['GOOGLE_SHEET_ID'])

    def _load_local_data(self):
        """Load data from local Excel or JSON files"""
        # Try to load from Excel file
        xlsx_path = self.local_data_path / 'Animal_Management_BACKEND_READY.xlsx'
        json_path = self.local_data_path / 'data.json'

        if PANDAS_AVAILABLE and xlsx_path.exists():
            print(f"Loading data from {xlsx_path}")
            self._load_from_excel(xlsx_path)
        elif json_path.exists():
            print(f"Loading data from {json_path}")
            with open(json_path, 'r') as f:
                self.local_data = json.load(f)
        else:
            # Initialize empty data structure
            print("No data file found, initializing empty database")
            self.local_data = {
                'Animals': [],
                'Breeders': [],
                'Sales_Transactions': [],
                'Expenses': [],
                'Customers': [],
                'Sales_Pipeline': [],
                'Financial_Dashboard': [],
                'Inquiry_Templates': []
            }
            self._save_local_data()

    def _load_from_excel(self, xlsx_path):
        """Load data from Excel file"""
        xlsx = pd.ExcelFile(xlsx_path)
        for sheet_name in xlsx.sheet_names:
            df = pd.read_excel(xlsx, sheet_name=sheet_name)
            # Convert DataFrame to list of dicts, handling NaN values
            records = df.where(pd.notnull(df), None).to_dict('records')
            # Clean up records
            clean_records = []
            for record in records:
                clean_record = {}
                for key, value in record.items():
                    if pd.isna(value):
                        clean_record[key] = ''
                    elif isinstance(value, datetime):
                        clean_record[key] = value.strftime('%Y-%m-%d')
                    else:
                        clean_record[key] = value
                clean_records.append(clean_record)
            self.local_data[sheet_name] = clean_records
        self._save_local_data()

    def _save_local_data(self):
        """Save local data to JSON file"""
        json_path = self.local_data_path / 'data.json'
        self.local_data_path.mkdir(parents=True, exist_ok=True)
        with open(json_path, 'w') as f:
            json.dump(self.local_data, f, indent=2, default=str)

    # ==================== READ OPERATIONS ====================

    def get_all_records(self, sheet_name):
        """Get all records from a sheet"""
        if self.use_local:
            return self.local_data.get(sheet_name, [])
        else:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            return worksheet.get_all_records()

    def get_record_by_id(self, sheet_name, id_column, id_value):
        """Get a single record by ID"""
        records = self.get_all_records(sheet_name)
        for record in records:
            if str(record.get(id_column, '')) == str(id_value):
                return record
        return None

    def get_filtered_records(self, sheet_name, filters):
        """Get records matching filter criteria"""
        records = self.get_all_records(sheet_name)
        filtered = []
        for record in records:
            match = True
            for key, value in filters.items():
                if isinstance(value, list):
                    # Check if record value is in list
                    if record.get(key) not in value:
                        match = False
                        break
                elif callable(value):
                    # Custom filter function
                    if not value(record.get(key)):
                        match = False
                        break
                else:
                    # Exact match or contains
                    record_val = str(record.get(key, ''))
                    if str(value) not in record_val:
                        match = False
                        break
            if match:
                filtered.append(record)
        return filtered

    # ==================== WRITE OPERATIONS ====================

    def append_record(self, sheet_name, record):
        """Append a new record to a sheet"""
        if self.use_local:
            if sheet_name not in self.local_data:
                self.local_data[sheet_name] = []
            self.local_data[sheet_name].append(record)
            self._save_local_data()
            return True
        else:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            # Get headers
            headers = worksheet.row_values(1)
            # Create row in correct order
            row = [record.get(h, '') for h in headers]
            worksheet.append_row(row)
            return True

    def update_record(self, sheet_name, id_column, id_value, updates):
        """Update an existing record"""
        if self.use_local:
            records = self.local_data.get(sheet_name, [])
            for i, record in enumerate(records):
                if str(record.get(id_column, '')) == str(id_value):
                    records[i].update(updates)
                    self._save_local_data()
                    return True
            return False
        else:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            # Find the row
            cell = worksheet.find(str(id_value))
            if cell:
                headers = worksheet.row_values(1)
                for key, value in updates.items():
                    if key in headers:
                        col = headers.index(key) + 1
                        worksheet.update_cell(cell.row, col, value)
                return True
            return False

    def delete_record(self, sheet_name, id_column, id_value):
        """Delete a record"""
        if self.use_local:
            records = self.local_data.get(sheet_name, [])
            self.local_data[sheet_name] = [
                r for r in records
                if str(r.get(id_column, '')) != str(id_value)
            ]
            self._save_local_data()
            return True
        else:
            worksheet = self.spreadsheet.worksheet(sheet_name)
            cell = worksheet.find(str(id_value))
            if cell:
                worksheet.delete_rows(cell.row)
                return True
            return False

    # ==================== ID GENERATION ====================

    def generate_animal_id(self, species, hatch_date):
        """Generate unique Animal ID"""
        species_codes = {
            'Gargoyle Gecko': 'GG',
            'Crested Gecko': 'CG',
            'Leachianus Gecko': 'LG',
            'Chahoua Gecko': 'CHG'
        }
        code = species_codes.get(species, 'XX')

        # Extract year from hatch_date
        if isinstance(hatch_date, str):
            year = hatch_date[:4]
        else:
            year = str(hatch_date.year)

        # Count existing for this species+year
        animals = self.get_all_records('Animals')
        count = len([a for a in animals if
                     a.get('Species') == species and
                     str(a.get('Hatch_Date', '')).startswith(year)])

        return f"TLR-{code}-{year}-{count+1:03d}"

    def generate_transaction_id(self, date=None):
        """Generate unique Transaction ID"""
        if date is None:
            date = datetime.now()
        elif isinstance(date, str):
            date = datetime.strptime(date[:10], '%Y-%m-%d')

        year = date.year
        sales = self.get_all_records('Sales_Transactions')
        count = len([s for s in sales if
                     str(s.get('Transaction_ID', '')).startswith(f'SAL-{year}')])

        return f"SAL-{year}-{count+1:03d}"

    def generate_expense_id(self, date=None):
        """Generate unique Expense ID"""
        if date is None:
            date = datetime.now()
        elif isinstance(date, str):
            date = datetime.strptime(date[:10], '%Y-%m-%d')

        year = date.year
        expenses = self.get_all_records('Expenses')
        count = len([e for e in expenses if
                     str(e.get('Expense_ID', '')).startswith(f'EXP-{year}')])

        return f"EXP-{year}-{count+1:03d}"

    def generate_lead_id(self):
        """Generate unique Lead ID"""
        leads = self.get_all_records('Sales_Pipeline')
        count = len(leads)
        return f"LEAD-{count+1:04d}"

    # ==================== DASHBOARD METRICS ====================

    def get_dashboard_metrics(self):
        """Get metrics for admin dashboard"""
        from datetime import datetime

        animals = self.get_all_records('Animals')
        sales = self.get_all_records('Sales_Transactions')
        leads = self.get_all_records('Sales_Pipeline')

        # Current month
        now = datetime.now()
        month_start = now.strftime('%Y-%m-01')

        # Count metrics
        total_animals = len(animals)
        available = len([a for a in animals if a.get('Web_Display') == 'Yes'])

        # Sales this month
        month_sales = [s for s in sales if
                       str(s.get('Sale_Date', '')) >= month_start]
        sales_count = len(month_sales)
        revenue = sum(float(s.get('Net_Revenue', 0) or 0) for s in month_sales)

        # Active leads
        active_statuses = ['New Lead', 'Contacted', 'Negotiating']
        active_leads = len([l for l in leads if l.get('Status') in active_statuses])

        return {
            'total_animals': total_animals,
            'available_for_sale': available,
            'sold_this_month': sales_count,
            'revenue_this_month': revenue,
            'active_leads': active_leads,
            'recent_sales': sales[-5:][::-1] if sales else [],
            'recent_leads': leads[-5:][::-1] if leads else []
        }


# Global instance
db = SheetsDB()
