"""
Admin Routes
Password-protected admin console for managing inventory, sales, and expenses
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from utils.auth import admin_required, login_user, logout_user, is_logged_in
from utils.sheets import db
from datetime import datetime

admin_bp = Blueprint('admin', __name__)


# ==================== AUTHENTICATION ====================

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Admin login page"""
    if is_logged_in():
        return redirect(url_for('admin.dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '')
        password = request.form.get('password', '')

        success, message = login_user(username, password)

        if success:
            flash(message, 'success')
            return redirect(url_for('admin.dashboard'))
        else:
            flash(message, 'error')

    return render_template('admin/login.html')


@admin_bp.route('/logout')
def logout():
    """Log out admin user"""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('admin.login'))


# ==================== DASHBOARD ====================

@admin_bp.route('/')
@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    """Admin dashboard with quick stats"""
    metrics = db.get_dashboard_metrics()
    return render_template('admin/dashboard.html', metrics=metrics)


# ==================== ANIMALS MANAGEMENT ====================

@admin_bp.route('/animals')
@admin_required
def animals_list():
    """List all animals with filtering"""
    animals = db.get_all_records('Animals')

    # Apply filters from query params
    species_filter = request.args.get('species', '')
    status_filter = request.args.get('status', '')
    search = request.args.get('search', '')

    if species_filter:
        animals = [a for a in animals if a.get('Species') == species_filter]
    if status_filter:
        animals = [a for a in animals if a.get('Sale_Status') == status_filter]
    if search:
        search_lower = search.lower()
        animals = [a for a in animals if
                   search_lower in str(a.get('Animal_ID', '')).lower() or
                   search_lower in str(a.get('Morph', '')).lower()]

    # Get unique values for filter dropdowns
    all_animals = db.get_all_records('Animals')
    species_list = list(set(a.get('Species', '') for a in all_animals if a.get('Species')))
    status_list = list(set(a.get('Sale_Status', '') for a in all_animals if a.get('Sale_Status')))

    return render_template('admin/animals.html',
                           animals=animals,
                           species_list=sorted(species_list),
                           status_list=sorted(status_list),
                           current_filters={
                               'species': species_filter,
                               'status': status_filter,
                               'search': search
                           })


@admin_bp.route('/animals/new', methods=['GET', 'POST'])
@admin_required
def animal_new():
    """Add new animal"""
    if request.method == 'POST':
        data = {
            'Species': request.form.get('species'),
            'Hatch_Date': request.form.get('hatch_date'),
            'Morph': request.form.get('morph'),
            'Sex': request.form.get('sex'),
            'Weight_Grams': request.form.get('weight', ''),
            'Project': request.form.get('project', ''),
            'Sale_Status': request.form.get('sale_status', 'Keeper'),
            'Web_Display': request.form.get('web_display', 'No'),
            'Web_Price': request.form.get('web_price', ''),
            'Photo_Album_Link': request.form.get('photo_link', ''),
            'Sire_ID': request.form.get('sire_id', ''),
            'Dam_ID': request.form.get('dam_id', ''),
            'Notes': request.form.get('notes', '')
        }

        # Generate Animal ID
        animal_id = db.generate_animal_id(data['Species'], data['Hatch_Date'])
        data['Animal_ID'] = animal_id

        # Add timestamp
        data['Date_Added'] = datetime.now().strftime('%Y-%m-%d')

        # Save to database
        db.append_record('Animals', data)

        flash(f'Animal {animal_id} added successfully!', 'success')
        return redirect(url_for('admin.animals_list'))

    # Get breeders for parent dropdowns
    breeders = db.get_all_records('Breeders')

    return render_template('admin/animal_form.html',
                           animal=None,
                           breeders=breeders,
                           mode='new')


@admin_bp.route('/animals/edit/<animal_id>', methods=['GET', 'POST'])
@admin_required
def animal_edit(animal_id):
    """Edit existing animal"""
    animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)

    if not animal:
        flash('Animal not found.', 'error')
        return redirect(url_for('admin.animals_list'))

    if request.method == 'POST':
        updates = {
            'Species': request.form.get('species'),
            'Hatch_Date': request.form.get('hatch_date'),
            'Morph': request.form.get('morph'),
            'Sex': request.form.get('sex'),
            'Weight_Grams': request.form.get('weight', ''),
            'Project': request.form.get('project', ''),
            'Sale_Status': request.form.get('sale_status'),
            'Web_Display': request.form.get('web_display'),
            'Web_Price': request.form.get('web_price', ''),
            'Photo_Album_Link': request.form.get('photo_link', ''),
            'Sire_ID': request.form.get('sire_id', ''),
            'Dam_ID': request.form.get('dam_id', ''),
            'Notes': request.form.get('notes', '')
        }

        db.update_record('Animals', 'Animal_ID', animal_id, updates)
        flash(f'Animal {animal_id} updated successfully!', 'success')
        return redirect(url_for('admin.animals_list'))

    breeders = db.get_all_records('Breeders')
    return render_template('admin/animal_form.html',
                           animal=animal,
                           breeders=breeders,
                           mode='edit')


@admin_bp.route('/animals/delete/<animal_id>', methods=['POST'])
@admin_required
def animal_delete(animal_id):
    """Delete an animal"""
    db.delete_record('Animals', 'Animal_ID', animal_id)
    flash(f'Animal {animal_id} deleted.', 'info')
    return redirect(url_for('admin.animals_list'))


# ==================== SALES MANAGEMENT ====================

@admin_bp.route('/sales')
@admin_required
def sales_list():
    """List all sales"""
    sales = db.get_all_records('Sales_Transactions')
    # Sort by date descending
    sales = sorted(sales, key=lambda x: x.get('Sale_Date', ''), reverse=True)
    return render_template('admin/sales.html', sales=sales)


@admin_bp.route('/sales/new', methods=['GET', 'POST'])
@admin_required
def sale_new():
    """Record new sale"""
    if request.method == 'POST':
        animal_id = request.form.get('animal_id')
        sale_date = request.form.get('sale_date')
        sale_price = float(request.form.get('sale_price', 0))
        shipping_charged = float(request.form.get('shipping_charged', 0) or 0)
        shipping_paid = float(request.form.get('shipping_paid', 0) or 0)

        # Get animal details
        animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)
        if not animal:
            flash('Animal not found.', 'error')
            return redirect(url_for('admin.sale_new'))

        # Calculate net revenue
        net_revenue = sale_price + shipping_charged - shipping_paid

        # Generate transaction ID
        transaction_id = db.generate_transaction_id(sale_date)

        sale_data = {
            'Transaction_ID': transaction_id,
            'Sale_Date': sale_date,
            'Animal_ID': animal_id,
            'Species': animal.get('Species', ''),
            'Morph': animal.get('Morph', ''),
            'Sale_Price': sale_price,
            'Buyer_Name': request.form.get('buyer_name'),
            'Payment_Method': request.form.get('payment_method'),
            'Shipping_Charged': shipping_charged,
            'Shipping_Paid': shipping_paid,
            'Sale_Platform': request.form.get('sale_platform'),
            'Net_Revenue': net_revenue,
            'Project': animal.get('Project', ''),
            'Notes': request.form.get('notes', '')
        }

        # Record the sale
        db.append_record('Sales_Transactions', sale_data)

        # Update animal status
        db.update_record('Animals', 'Animal_ID', animal_id, {
            'Sale_Status': 'Sold',
            'Transaction_ID': transaction_id,
            'Web_Display': 'No'
        })

        # Add/update customer record
        customer_data = {
            'Customer_Name': request.form.get('buyer_name'),
            'Email': request.form.get('buyer_email', ''),
            'Phone': request.form.get('buyer_phone', ''),
            'Last_Purchase_Date': sale_date,
            'Total_Purchases': 1  # Would need to increment if existing
        }
        db.append_record('Customers', customer_data)

        flash(f'Sale {transaction_id} recorded successfully!', 'success')
        return redirect(url_for('admin.sales_list'))

    # Get available animals for sale
    animals = db.get_all_records('Animals')
    available = [a for a in animals if 'Listed' in str(a.get('Sale_Status', ''))]

    return render_template('admin/sale_form.html', animals=available)


# ==================== EXPENSES MANAGEMENT ====================

@admin_bp.route('/expenses')
@admin_required
def expenses_list():
    """List all expenses"""
    expenses = db.get_all_records('Expenses')
    # Sort by date descending
    expenses = sorted(expenses, key=lambda x: x.get('Date', ''), reverse=True)
    return render_template('admin/expenses.html', expenses=expenses)


@admin_bp.route('/expenses/new', methods=['GET', 'POST'])
@admin_required
def expense_new():
    """Add new expense"""
    if request.method == 'POST':
        expense_date = request.form.get('date')
        expense_id = db.generate_expense_id(expense_date)

        expense_data = {
            'Expense_ID': expense_id,
            'Date': expense_date,
            'PO_Number': request.form.get('po_number', ''),
            'Category': request.form.get('category'),
            'Description': request.form.get('description'),
            'Vendor': request.form.get('vendor', ''),
            'Amount': float(request.form.get('amount', 0)),
            'Payment_Method': request.form.get('payment_method'),
            'Tax_Deductible': request.form.get('tax_deductible', 'No'),
            'Project_Allocated': request.form.get('project', 'All'),
            'Notes': request.form.get('notes', '')
        }

        db.append_record('Expenses', expense_data)
        flash(f'Expense {expense_id} added successfully!', 'success')
        return redirect(url_for('admin.expenses_list'))

    return render_template('admin/expense_form.html')


# ==================== LEADS/PIPELINE MANAGEMENT ====================

@admin_bp.route('/leads')
@admin_required
def leads_list():
    """List all leads in sales pipeline"""
    leads = db.get_all_records('Sales_Pipeline')
    return render_template('admin/leads.html', leads=leads)


@admin_bp.route('/leads/update/<lead_id>', methods=['POST'])
@admin_required
def lead_update_status(lead_id):
    """Quick update lead status"""
    new_status = request.form.get('status')
    db.update_record('Sales_Pipeline', 'Lead_ID', lead_id, {
        'Status': new_status,
        'Last_Contact_Date': datetime.now().strftime('%Y-%m-%d')
    })
    flash(f'Lead {lead_id} updated to {new_status}', 'success')
    return redirect(url_for('admin.leads_list'))


# ==================== REPORTS ====================

@admin_bp.route('/reports')
@admin_required
def reports():
    """Financial reports page"""
    # Get all data for reports
    sales = db.get_all_records('Sales_Transactions')
    expenses = db.get_all_records('Expenses')

    # Calculate totals
    total_revenue = sum(float(s.get('Net_Revenue', 0) or 0) for s in sales)
    total_expenses = sum(float(e.get('Amount', 0) or 0) for e in expenses)
    net_profit = total_revenue - total_expenses

    # Sales by platform
    platform_sales = {}
    for sale in sales:
        platform = sale.get('Sale_Platform', 'Other')
        if platform not in platform_sales:
            platform_sales[platform] = {'count': 0, 'revenue': 0}
        platform_sales[platform]['count'] += 1
        platform_sales[platform]['revenue'] += float(sale.get('Net_Revenue', 0) or 0)

    # Sales by project
    project_sales = {}
    for sale in sales:
        project = sale.get('Project', 'General')
        if project not in project_sales:
            project_sales[project] = {'count': 0, 'revenue': 0}
        project_sales[project]['count'] += 1
        project_sales[project]['revenue'] += float(sale.get('Net_Revenue', 0) or 0)

    return render_template('admin/reports.html',
                           total_revenue=total_revenue,
                           total_expenses=total_expenses,
                           net_profit=net_profit,
                           platform_sales=platform_sales,
                           project_sales=project_sales,
                           sales=sales,
                           expenses=expenses)
