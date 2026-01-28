/**
 * THE LAB REPTILES - BREEDING PAIRINGS DATA
 * Track current and planned breeding pairings
 *
 * Structure:
 * - Year-based organization
 * - Male/Female pairing information
 * - Expected outcomes and status
 */

const breedingPairings = {
    // Current year pairings
    2026: [
        {
            id: "pairing-2026-001",
            male: {
                name: "Tempest",
                morph: "Bacon Quad Stripe",
                photo: "ReptilePhotos/Demeter1.jpg" // Placeholder - update with actual male photo
            },
            female: {
                name: "Demeter",
                morph: "Bacon Quad Stripe",
                photo: "ReptilePhotos/Demeter1.jpg"
            },
            project: "Bacon Line",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "High-contrast Bacon Quad Stripe offspring with deep red and orange coloration",
            notes: "Proven pairing producing consistent, high-quality offspring",
            eggs: null, // Number of eggs if laid
            hatchDate: null // Expected hatch date
        },
        {
            id: "pairing-2026-002",
            male: {
                name: "Vulcan",
                morph: "Bacon Red Stripe",
                photo: "ReptilePhotos/Demeter1.jpg" // Placeholder
            },
            female: {
                name: "Ceres",
                morph: "Quad Stripe",
                photo: "ReptilePhotos/Demeter1.jpg" // Placeholder
            },
            project: "Bacon Line",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "Bacon Quad Stripe offspring with strong structural cresting",
            notes: "Second season pairing",
            eggs: null,
            hatchDate: null
        }
    ],

    // Future planned pairings
    2027: [
        {
            id: "pairing-2027-001",
            male: {
                name: "TBD",
                morph: "Red Line Male",
                photo: null
            },
            female: {
                name: "Artemis",
                morph: "Red Bicolour Crested Gecko",
                photo: "ReptilePhotos/Artemis1.jpg"
            },
            project: "Red Line",
            status: "Planned",
            statusColor: "#ff9100",
            expectedOutcome: "High-saturation red offspring",
            notes: "Artemis will be ready for breeding in 2027",
            eggs: null,
            hatchDate: null
        },
        {
            id: "pairing-2027-002",
            male: {
                name: "TBD",
                morph: "Red Line Male",
                photo: null
            },
            female: {
                name: "Kybele",
                morph: "Deep Red Lily White",
                photo: "ReptilePhotos/Kybele1.jpg"
            },
            project: "Lily White",
            status: "Planned",
            statusColor: "#ff9100",
            expectedOutcome: "Red Lily White offspring with exceptional pattern clarity",
            notes: "Kybele will be ready for breeding in 2027",
            eggs: null,
            hatchDate: null
        }
    ]
};

/**
 * Utility Functions for Pairings Management
 */

// Get pairings for a specific year
function getPairingsByYear(year) {
    return breedingPairings[year] || [];
}

// Get current year pairings
function getCurrentYearPairings() {
    const currentYear = new Date().getFullYear();
    return getPairingsByYear(currentYear);
}

// Get all active pairings
function getActivePairings() {
    const allPairings = [];
    Object.values(breedingPairings).forEach(yearPairings => {
        yearPairings.forEach(pairing => {
            if (pairing.status === 'Active') {
                allPairings.push(pairing);
            }
        });
    });
    return allPairings;
}

// Get pairings by project/line
function getPairingsByProject(project) {
    const matchingPairings = [];
    Object.values(breedingPairings).forEach(yearPairings => {
        yearPairings.forEach(pairing => {
            if (pairing.project.toLowerCase().includes(project.toLowerCase())) {
                matchingPairings.push(pairing);
            }
        });
    });
    return matchingPairings;
}

// Get pairings statistics
function getPairingsStats() {
    let totalPairings = 0;
    let activePairings = 0;
    let plannedPairings = 0;
    const projects = new Set();

    Object.values(breedingPairings).forEach(yearPairings => {
        yearPairings.forEach(pairing => {
            totalPairings++;
            if (pairing.status === 'Active') activePairings++;
            if (pairing.status === 'Planned') plannedPairings++;
            projects.add(pairing.project);
        });
    });

    return {
        total: totalPairings,
        active: activePairings,
        planned: plannedPairings,
        projects: projects.size
    };
}

// Get all years with pairings
function getPairingYears() {
    return Object.keys(breedingPairings).map(Number).sort((a, b) => b - a);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        breedingPairings,
        getPairingsByYear,
        getCurrentYearPairings,
        getActivePairings,
        getPairingsByProject,
        getPairingsStats,
        getPairingYears
    };
}
