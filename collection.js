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
        statusColor: "#00ff00",
        sex: "Female",
        lineage: "Foundational Bacon Line",
        description: "Demeter is a powerhouse within our Gargoyle project. Her saturation is a hall mark of the Bacon Line.",
        photos: [
            "images/breeders/Demeter1.jpg",
            "images/breeders/Demeter2.jpg",
            "images/breeders/Demeter3.jpg"
        ]
    },
    {
        id: "Artemis",
        name: "Artemis",
        morph: "Red Bicolour Crested Gecko",
        badge: "Red Line",
        status: "BREEDING 2027",
        statusColor: "#ff9100",
        sex: "Female",
        lineage: "Venus x Eros",
        description: "Artemis represents our future in high-saturation Reds. She is currently being grown out for our 2027 season. Her vibrant bicolour pattern and robust health make her an exciting addition to our breeding program.",
        photos: [
            "images/breeders/Artemis1.jpg",
            "images/breeders/Artemis2.jpg",
            "images/breeders/Artemis3.jpg"
        ]
    },
    {
        id: "Kybele",
        name: "Kybele",
        morph: "Deep Red Lily White",
        badge: "Lily White",
        status: "BREEDING 2027",
        statusColor: "#ff9100",
        sex: "Female",
        lineage: "Red Lineage",
        description: "Kybele is a project-defining female, combining the cleanliness of the Lily White trait with deep, velvet reds. This unique combination will produce stunning offspring for collectors seeking both pattern clarity and rich coloration.",
        photos: [
            "images/breeders/Kybele1.jpg",
            "images/breeders/Kybele2.jpg",
            "images/breeders/Kybele3.jpg"
        ]
    },
    {
        id: "TEM",
        name: "Tempest",
        morph: "Bacon Quad Stripe",
        badge: "Bacon",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00",
        sex: "Male",
        lineage: "Foundational Bacon Line",
        description: "Tempest provides some amazing quality to the bacon line. His white base mixed with the clean lines and colours really makes him pop!",
        photos: [
            "images/breeders/tempest-1.jpg",
            "images/breeders/tempest-2.jpg",
            "images/breeders/tempest-3.jpg"
        ]
    },
    {
        id: "TEX",
        name: "Tex",
        morph: "Bacon Quad Stripe",
        badge: "Red Bacon",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00",
        sex: "Male",
        lineage: "Foundational Bacon Line",
        description: "Tex provides a lot of depth to the bacon lineage. his red base with deeply saturated lines mean he shows crazy contrast fired down and look like a red ball fired up!",
        photos: [
            "images/breeders/tex-1.jpg",
            "images/breeders/tex-2.jpg",
            "images/breeders/tex-3.jpg"
        ]
    },
    {
        id: "ATH",
        name: "Athena",
        morph: "Bacon Quad Stripe",
        badge: "Bacon line",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00",
        sex: "Female",
        lineage: "Foundational Bacon Line",
        description: "Athena is another white base high contrast animal. She really adds a beautiful element of colour to her hatchlings!",
        photos: [
            "images/breeder/athena-1.jpg",
            "images/breeder/athena-2.jpg",
            "images/breeder/athena-3.jpg"
        ]
    },
    {
        id: "THA",
        name: "Thalia",
        morph: "Bacon Quad Stripe",
        badge: "Bacon Line",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00",
        sex: "Female",
        lineage: "Bacon",
        description: "Thalia is a very similar female to athena, she provides another great base and gives us diversifedi genetics!",
        photos: [
            "images/breeders/thalia-1.jpg",
            "images/breeders/thalia-2.jpg",
            "images/breeders/thalia-3.jpg"
        ]
    },
    {
        id: "HES",
        name: "Hestia",
        morph: "Bacon Quad Stripe",
        badge: "Bacon Line",
        status: "CURRENTLY BREEDING",
        statusColor: "#00ff00",
        sex: "Female",
        lineage: "Foundational Bacon",
        description: "Hestia produces consistently beautiful hatchlings. We purchased her from NDReptiles. The hard part with Hestia is picking who isn't a holdback.",
        photos: [
            "images/breeders/hestia-1.jpg",
            "images/breeders/hestia-2.jpg",
            "images/breeders/hestia-3.jpg"
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
