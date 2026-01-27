/**
 * THE LAB REPTILES - INVENTORY DATA
 * Optimized inventory management system
 * 
 * Structure:
 * - Clean data organization
 * - Consistent property naming
 * - Easy to maintain and update
 */

const inventory = [
    {
        id: "GG-ATH-03-1-25",
        name: "Bacon Quad Stripe",
        price: "$350",
        weight: "10g",
        sex: "Unsexed",
        hatch: "July 14, 2025",
        lineage: "Tempest x Athena",
        description: "This is a really clean example of our Red Stripe project. The orange-red striping is solid and has a nice saturation that stands out well against the darker sides.",
        sold: false,
        mmLink: "https://www.morphmarket.com/ca/c/reptiles/lizards/gargoyle-geckos/3534691",
        photos: [
            "ReptilePhotos/GG-ATH-03-1-25-1.jpg",
            "ReptilePhotos/GG-ATH-03-1-25-2.jpg",
            "ReptilePhotos/GG-ATH-03-1-25-3.jpg"
        ]
    },
    {
        id: "GG-ATH-03-2-25",
        name: "Bacon Quad Stripe",
        price: "$225",
        weight: "10g",
        sex: "Unsexed",
        hatch: "July 14, 2025",
        lineage: "Tempest x Athena",
        description: "Consistent patterns from the neck all the way down. This little one is growing well and has a great appetite for Repashy.",
        sold: false,
        mmLink: "https://www.morphmarket.com/ca/c/reptiles/lizards/gargoyle-geckos/3534654",
        photos: [
            "ReptilePhotos/GG-ATH-03-2-25-1.jpg",
            "ReptilePhotos/GG-ATH-03-2-25-2.jpg",
            "ReptilePhotos/GG-ATH-03-2-25-3.jpg"
        ]
    },
    {
        id: "AT-24-01-02",
        name: "Red Stripe",
        price: "$200",
        weight: "16g",
        sex: "Unsexed",
        hatch: "Jul 22, 2024",
        lineage: "Tempest x Athena",
        description: "This Gargoyle Gecko features a bold, clean Red Stripe. It has great color saturation against a light base, showing off excellent contrast. This individual is healthy, active, and feeding well on Repashy diet. A high-quality choice for anyone looking to add strong red lines to their collection.",
        sold: false,
        mmLink: "https://www.morphmarket.com/us/c/all?seller=thelabreptiles&state=for_sale",
        photos: [
            "ReptilePhotos/AT-24-01-02-1.jpg",
            "ReptilePhotos/AT-24-01-02-2.jpg",
            "ReptilePhotos/AT-24-01-02-3.jpg"
        ]
    },
    {
        id: "CER-24-03-02",
        name: "Bacon Quad Stripe",
        price: "$200",
        weight: "11g",
        sex: "Unsexed",
        hatch: "Aug 18, 2024",
        lineage: "Vulcan x Ceres",
        description: "This Gargoyle Gecko displays good coloring along its back. It features a darker, earthy base tone that provides a nice contrast for the orange and red. This individual is healthy, active, and feeding well on Repashy diet. A great animal for anyone.",
        sold: false,
        mmLink: "https://www.morphmarket.com/us/c/all?seller=thelabreptiles&state=for_sale",
        photos: [
            "ReptilePhotos/CER-24-03-02-1.jpg",
            "ReptilePhotos/CER-24-03-02-2.jpg",
            "ReptilePhotos/CER-24-03-02-3.jpg"
        ]
    },
    {
        id: "TLR-GG-0000-023",
        name: "Orange Blotch",
        price: "$275",
        weight: "40g",
        sex: "Female",
        hatch: "2023",
        lineage: "Triton x Salacia",
        description: "This Gargoyle Gecko features a nice orange blotch pattern with a white base. It has solid color contrast and good overall structure. This individual is healthy, active, and feeding well on Repashy diet. Great choice for a pet or a future breeding project.",
        sold: false,
        mmLink: "https://www.morphmarket.com/us/c/all?seller=thelabreptiles&state=for_sale",
        photos: [
            "ReptilePhotos/TRxSE14-1.jpg",
            "ReptilePhotos/TRxSE14-2.jpg",
            "ReptilePhotos/TRxSE14-3.jpg"
        ]
    },
    {
        id: "GG-VE-01-1-24",
        name: "Orange Stripe",
        price: "$200",
        weight: "16g",
        sex: "Unsexed",
        hatch: "July 21, 2024",
        lineage: "Solomon x Vega",
        description: "High-contrast look with bright orange stripes sitting over a nice light base. Raised exclusively on Repashy.",
        sold: false,
        mmLink: "https://www.morphmarket.com/ca/c/reptiles/lizards/gargoyle-geckos/353464",
        photos: [
            "ReptilePhotos/GG-VE-01-01-24-1.jpg",
            "ReptilePhotos/GG-VE-01-01-24-2.jpg",
            "ReptilePhotos/GG-VE-01-01-24-3.jpg"
        ]
    },
    {
        id: "GG-HES-03-1-24",
        name: "Bacon Quad Stripe",
        price: "$400",
        weight: "13g",
        sex: "Unsexed",
        hatch: "Sept 15, 2024",
        lineage: "Tex x Hestia",
        description: "Great example of our Red Stripe lineage—the orange-red stripes are solid and saturated. Growing exactly as it should.",
        sold: false,
        mmLink: "https://www.morphmarket.com/ca/c/reptiles/lizards/gargoyle-geckos/3534654",
        photos: [
            "ReptilePhotos/GG-HES-03-1-24-1.jpg",
            "ReptilePhotos/GG-HES-03-1-24-2.jpg",
            "ReptilePhotos/GG-HES-03-1-24-3.jpg"
        ]
    }
];

/**
 * Utility Functions for Inventory Management
 */

// Get available animals only
function getAvailableInventory() {
    return inventory.filter(animal => !animal.sold);
}

// Get sold animals
function getSoldInventory() {
    return inventory.filter(animal => animal.sold);
}

// Find animal by ID
function findAnimalById(id) {
    return inventory.find(animal => animal.id === id);
}

// Get animals by lineage
function getAnimalsByLineage(lineage) {
    return inventory.filter(animal => 
        animal.lineage.toLowerCase().includes(lineage.toLowerCase())
    );
}

// Get animals by price range
function getAnimalsByPriceRange(min, max) {
    return inventory.filter(animal => {
        const price = parseFloat(animal.price.replace('$', ''));
        return price >= min && price <= max;
    });
}

// Sort animals by price
function sortByPrice(ascending = true) {
    return [...inventory].sort((a, b) => {
        const priceA = parseFloat(a.price.replace('$', ''));
        const priceB = parseFloat(b.price.replace('$', ''));
        return ascending ? priceA - priceB : priceB - priceA;
    });
}

// Sort animals by hatch date (newest first)
function sortByHatchDate(newestFirst = true) {
    return [...inventory].sort((a, b) => {
        const dateA = new Date(a.hatch);
        const dateB = new Date(b.hatch);
        return newestFirst ? dateB - dateA : dateA - dateB;
    });
}

// Get inventory statistics
function getInventoryStats() {
    const available = getAvailableInventory();
    const sold = getSoldInventory();
    
    return {
        total: inventory.length,
        available: available.length,
        sold: sold.length,
        averagePrice: (
            available.reduce((sum, animal) => 
                sum + parseFloat(animal.price.replace('$', '')), 0
            ) / available.length
        ).toFixed(2)
    };
}

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        inventory,
        getAvailableInventory,
        getSoldInventory,
        findAnimalById,
        getAnimalsByLineage,
        getAnimalsByPriceRange,
        sortByPrice,
        sortByHatchDate,
        getInventoryStats
    };
}