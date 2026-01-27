/**
 * THE LAB REPTILES - BREEDING COLLECTION DATA
 * Optimized collection management system
 * 
 * Structure:
 * - Clean data organization
 * - Consistent property naming
 * - Status tracking for breeding pairs
 * - Easy to maintain and update
 */

const collection = [
    {
        id: "Demeter",
        name: "Demeter",
        morph: "Bacon Quad Stripe Gargoyle",
        badge: "Bacon Line",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00", // Green
        sex: "Female",
        lineage: "Foundational Bacon Line",
        description: "Demeter is a powerhouse within our Gargoyle project. Her saturation and structural cresting are hallmarks of the Bacon lineage. She consistently produces high-quality offspring with exceptional red and orange coloration.",
        photos: [
            "ReptilePhotos/Demeter1.jpg", 
            "ReptilePhotos/Demeter2.jpg", 
            "ReptilePhotos/Demeter3.jpg"
        ]
    },
    {
        id: "Artemis",
        name: "Artemis",
        morph: "Red Bicolour Crested Gecko",
        badge: "Red Line",
        status: "BREEDING 2027",
        statusColor: "#ff9100", // Orange
        sex: "Female",
        lineage: "Venus x Eros",
        description: "Artemis represents our future in high-saturation Reds. She is currently being grown out for our 2027 season. Her vibrant bicolour pattern and robust health make her an exciting addition to our breeding program.",
        photos: [
            "ReptilePhotos/Artemis1.jpg", 
            "ReptilePhotos/Artemis2.jpg", 
            "ReptilePhotos/Artemis3.jpg"
        ]
    },
    {
        id: "Kybele",
        name: "Kybele",
        morph: "Deep Red Lily White",
        badge: "Lily White",
        status: "BREEDING 2027",
        statusColor: "#ff9100", // Orange
        sex: "Female",
        lineage: "Red Lineage",
        description: "Kybele is a project-defining female, combining the cleanliness of the Lily White trait with deep, velvet reds. This unique combination will produce stunning offspring for collectors seeking both pattern clarity and rich coloration.",
        photos: [
            "ReptilePhotos/Kybele1.jpg", 
            "ReptilePhotos/Kybele2.jpg", 
            "ReptilePhotos/Kybele3.jpg"
        ]
    }
];

/**
 * Utility Functions for Collection Management
 */

// Get currently breeding animals
function getCurrentlyBreeding() {
    return collection.filter(breeder => 
        breeder.status.toUpperCase().includes('CURRENTLY BREEDING')
    );
}

// Get animals breeding in specific year
function getBreedingByYear(year) {
    return collection.filter(breeder => 
        breeder.status.includes(year.toString())
    );
}

// Find breeder by ID
function findBreederById(id) {
    return collection.find(breeder => breeder.id === id);
}

// Get breeders by badge/line
function getBreedersByLine(line) {
    return collection.filter(breeder => 
        breeder.badge.toLowerCase().includes(line.toLowerCase())
    );
}

// Get breeders by morph
function getBreedersByMorph(morph) {
    return collection.filter(breeder => 
        breeder.morph.toLowerCase().includes(morph.toLowerCase())
    );
}

// Get breeders by sex
function getBreedersBySex(sex) {
    return collection.filter(breeder => 
        breeder.sex.toLowerCase() === sex.toLowerCase()
    );
}

// Get collection statistics
function getCollectionStats() {
    const currentlyBreeding = getCurrentlyBreeding();
    const femaleCount = collection.filter(b => b.sex === 'Female').length;
    const maleCount = collection.filter(b => b.sex === 'Male').length;
    
    return {
        total: collection.length,
        currentlyBreeding: currentlyBreeding.length,
        females: femaleCount,
        males: maleCount,
        lines: [...new Set(collection.map(b => b.badge))].length
    };
}

// Get breeding pairs (if you track pairings)
function getBreedingPairs() {
    // This is a placeholder for future pairing tracking
    // You can expand this to track which breeders are paired together
    return [];
}

// Sort collection by status (currently breeding first)
function sortByBreedingStatus() {
    return [...collection].sort((a, b) => {
        const aActive = a.status.toUpperCase().includes('CURRENTLY');
        const bActive = b.status.toUpperCase().includes('CURRENTLY');
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return 0;
    });
}

// Export for use in other scripts (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        collection,
        getCurrentlyBreeding,
        getBreedingByYear,
        findBreederById,
        getBreedersByLine,
        getBreedersByMorph,
        getBreedersBySex,
        getCollectionStats,
        getBreedingPairs,
        sortByBreedingStatus
    };
}