"""
Public Routes
Public-facing pages for the website
"""

from flask import Blueprint, render_template, request
from utils.sheets import db

public_bp = Blueprint('public', __name__)


@public_bp.route('/')
def home():
    """Homepage"""
    # Get featured geckos (available ones)
    animals = db.get_all_records('Animals')
    featured = [a for a in animals if a.get('Web_Display') == 'Yes'][:6]
    return render_template('public/index.html', featured_geckos=featured)


@public_bp.route('/geckos')
def geckos_list():
    """Available geckos page"""
    animals = db.get_all_records('Animals')

    # Filter to only web-visible, listed animals
    available = [a for a in animals if
                 a.get('Web_Display') == 'Yes' and
                 'Listed' in str(a.get('Sale_Status', ''))]

    # Apply filters
    species_filter = request.args.get('species', '')
    sort_by = request.args.get('sort', 'newest')

    if species_filter:
        available = [a for a in available if a.get('Species') == species_filter]

    # Sort
    if sort_by == 'price_low':
        available = sorted(available, key=lambda x: float(x.get('Web_Price', 0) or 0))
    elif sort_by == 'price_high':
        available = sorted(available, key=lambda x: float(x.get('Web_Price', 0) or 0), reverse=True)
    elif sort_by == 'newest':
        available = sorted(available, key=lambda x: x.get('Date_Added', ''), reverse=True)

    # Get species list for filter
    species_list = list(set(a.get('Species', '') for a in animals if a.get('Species')))

    return render_template('public/geckos.html',
                           geckos=available,
                           species_list=sorted(species_list),
                           current_filters={
                               'species': species_filter,
                               'sort': sort_by
                           })


@public_bp.route('/geckos/<animal_id>')
def gecko_detail(animal_id):
    """Individual gecko detail page"""
    animal = db.get_record_by_id('Animals', 'Animal_ID', animal_id)

    if not animal or animal.get('Web_Display') != 'Yes':
        return render_template('public/404.html'), 404

    # Get parent info if available
    sire = None
    dam = None
    breeders = db.get_all_records('Breeders')

    if animal.get('Sire_ID'):
        sire = next((b for b in breeders if b.get('Breeder_ID') == animal['Sire_ID']), None)
    if animal.get('Dam_ID'):
        dam = next((b for b in breeders if b.get('Breeder_ID') == animal['Dam_ID']), None)

    return render_template('public/gecko_detail.html',
                           gecko=animal,
                           sire=sire,
                           dam=dam)
