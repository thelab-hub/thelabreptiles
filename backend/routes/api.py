"""
API Routes
RESTful API endpoints for admin operations and public data
"""

from flask import Blueprint, request, jsonify
from utils.auth import admin_required
from utils.sheets import db
from datetime import datetime

api_bp = Blueprint('api', __name__)


# ==================== PUBLIC API ====================

@api_bp.route('/geckos')
def api_geckos():
    """Get all available geckos (public)"""
    animals = db.get_all_records('Animals')

    # Filter to only web-visible, listed animals
    available = [a for a in animals if
                 a.get('Web_Display') == 'Yes' and
                 'Listed' in str(a.get('Sale_Status', ''))]

    # Return only safe fields
    safe_fields = ['Animal_ID', 'Species', 'Morph', 'Sex', 'Hatch_Date',
                   'Weight_Grams', 'Web_Price', 'Photo_Album_Link', 'Project']

    result = []
    for gecko in available:
        safe_gecko = {k: gecko.get(k, '') for k in safe_fields}
        result.append(safe_gecko)

    return jsonify(result)


@api_bp.route('/geckos/<animal_id>')
def api_gecko_detail(animal_id):
    """Get single gecko details (public)"""
    animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)

    if not animal or animal.get('Web_Display') != 'Yes':
        return jsonify({'error': 'Not found'}), 404

    safe_fields = ['Animal_ID', 'Species', 'Morph', 'Sex', 'Hatch_Date',
                   'Weight_Grams', 'Web_Price', 'Photo_Album_Link', 'Project',
                   'Sire_ID', 'Dam_ID']

    result = {k: animal.get(k, '') for k in safe_fields}

    # Get parent names if available
    breeders = db.get_all_records('Breeders')
    if animal.get('Sire_ID'):
        sire = next((b for b in breeders if b.get('Breeder_ID') == animal['Sire_ID']), None)
        if sire:
            result['Sire_Name'] = sire.get('Name', '')
    if animal.get('Dam_ID'):
        dam = next((b for b in breeders if b.get('Breeder_ID') == animal['Dam_ID']), None)
        if dam:
            result['Dam_Name'] = dam.get('Name', '')

    return jsonify(result)


@api_bp.route('/inquiry', methods=['POST'])
def api_inquiry():
    """Submit inquiry form (public)"""
    data = request.json or request.form

    animal_id = data.get('animal_id')
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone', '')
    message = data.get('message', '')

    if not all([animal_id, name, email]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Get animal info
    animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404

    # Generate lead ID
    lead_id = db.generate_lead_id()

    # Create lead record
    lead_data = {
        'Lead_ID': lead_id,
        'Date_Received': datetime.now().strftime('%Y-%m-%d'),
        'Source': 'Website',
        'Customer_Name': name,
        'Contact_Info': f"Email: {email}" + (f", Phone: {phone}" if phone else ""),
        'Animal_Interested_In': f"{animal.get('Morph', '')} {animal.get('Species', '')}",
        'Animal_ID': animal_id,
        'Status': 'New Lead',
        'Notes': message,
        'Last_Contact_Date': ''
    }

    db.append_record('Sales_Pipeline', lead_data)

    # TODO: Send email notification to admin
    # TODO: Send auto-response to customer

    return jsonify({
        'success': True,
        'message': 'Thank you for your inquiry! We will respond within 24 hours.',
        'lead_id': lead_id
    })


# ==================== ADMIN API ====================

@api_bp.route('/admin/animals')
@admin_required
def api_admin_animals():
    """Get all animals (admin)"""
    animals = db.get_all_records('Animals')
    return jsonify(animals)


@api_bp.route('/admin/animals/<animal_id>')
@admin_required
def api_admin_animal_detail(animal_id):
    """Get single animal (admin)"""
    animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)
    if not animal:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(animal)


@api_bp.route('/admin/animals', methods=['POST'])
@admin_required
def api_admin_animal_create():
    """Create new animal (admin)"""
    data = request.json

    # Generate Animal ID
    animal_id = db.generate_animal_id(data['Species'], data['Hatch_Date'])
    data['Animal_ID'] = animal_id
    data['Date_Added'] = datetime.now().strftime('%Y-%m-%d')

    db.append_record('Animals', data)
    return jsonify({'success': True, 'animal_id': animal_id})


@api_bp.route('/admin/animals/<animal_id>', methods=['PUT'])
@admin_required
def api_admin_animal_update(animal_id):
    """Update animal (admin)"""
    data = request.json
    db.update_record('Animals', 'Animal_ID', animal_id, data)
    return jsonify({'success': True})


@api_bp.route('/admin/animals/<animal_id>', methods=['DELETE'])
@admin_required
def api_admin_animal_delete(animal_id):
    """Delete animal (admin)"""
    db.delete_record('Animals', 'Animal_ID', animal_id)
    return jsonify({'success': True})


@api_bp.route('/admin/sales')
@admin_required
def api_admin_sales():
    """Get all sales (admin)"""
    sales = db.get_all_records('Sales_Transactions')
    return jsonify(sales)


@api_bp.route('/admin/sales', methods=['POST'])
@admin_required
def api_admin_sale_create():
    """Record new sale (admin)"""
    data = request.json

    # Get animal details
    animal = db.get_record_by_id('Animals', 'Animal_ID', data['animal_id'])
    if not animal:
        return jsonify({'error': 'Animal not found'}), 404

    # Calculate net revenue
    sale_price = float(data.get('sale_price', 0))
    shipping_charged = float(data.get('shipping_charged', 0))
    shipping_paid = float(data.get('shipping_paid', 0))
    net_revenue = sale_price + shipping_charged - shipping_paid

    # Generate transaction ID
    transaction_id = db.generate_transaction_id(data.get('sale_date'))

    sale_data = {
        'Transaction_ID': transaction_id,
        'Sale_Date': data.get('sale_date'),
        'Animal_ID': data['animal_id'],
        'Species': animal.get('Species', ''),
        'Morph': animal.get('Morph', ''),
        'Sale_Price': sale_price,
        'Buyer_Name': data.get('buyer_name'),
        'Payment_Method': data.get('payment_method'),
        'Shipping_Charged': shipping_charged,
        'Shipping_Paid': shipping_paid,
        'Sale_Platform': data.get('sale_platform'),
        'Net_Revenue': net_revenue,
        'Project': animal.get('Project', ''),
        'Notes': data.get('notes', '')
    }

    db.append_record('Sales_Transactions', sale_data)

    # Update animal status
    db.update_record('Animals', 'Animal_ID', data['animal_id'], {
        'Sale_Status': 'Sold',
        'Transaction_ID': transaction_id,
        'Web_Display': 'No'
    })

    return jsonify({'success': True, 'transaction_id': transaction_id})


@api_bp.route('/admin/expenses')
@admin_required
def api_admin_expenses():
    """Get all expenses (admin)"""
    expenses = db.get_all_records('Expenses')
    return jsonify(expenses)


@api_bp.route('/admin/expenses', methods=['POST'])
@admin_required
def api_admin_expense_create():
    """Create new expense (admin)"""
    data = request.json
    expense_id = db.generate_expense_id(data.get('date'))
    data['Expense_ID'] = expense_id

    db.append_record('Expenses', data)
    return jsonify({'success': True, 'expense_id': expense_id})


@api_bp.route('/admin/leads')
@admin_required
def api_admin_leads():
    """Get all leads (admin)"""
    leads = db.get_all_records('Sales_Pipeline')
    return jsonify(leads)


@api_bp.route('/admin/dashboard')
@admin_required
def api_admin_dashboard():
    """Get dashboard metrics (admin)"""
    metrics = db.get_dashboard_metrics()
    return jsonify(metrics)
