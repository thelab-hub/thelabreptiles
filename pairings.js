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
            id: "pairing-2026-002",
            male: {
                name: "Tempest",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/tempest-1.jpg"
            },
            female: {
                name: "Hestia",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/hestia-1.jpg"
            },
            project: "Bacon Line",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "Hatchlings with clean lines and deep saturation",
            notes: "",
            eggs: null,
            hatchDate: null
        },
        {
            id: "pairing-2026-001",
            male: {
                name: "Tempest",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/tempest-1.jpg"
            },
            female: {
                name: "Demeter",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/Demeter1.jpg"
            },
            project: "Bacon Line",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "High-contrast Bacon Quad Stripe offspring with deep red and orange coloration",
            notes: "Proven pairing producing consistent, high-quality offspring",
            eggs: null,
            hatchDate: null
        },
        {
            id: "pairing-2026-407",
            male: {
                name: "Tex",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/tex-1.jpg"
            },
            female: {
                name: "Thalia",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/thalia-1.jpg"
            },
            project: "Bacon Line",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "We are hoping with this project the white base will come through with Tex's strong colours",
            notes: "",
            eggs: null,
            hatchDate: null
        },
        {
            id: "pairing-2026-258",
            male: {
                name: "Tex",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/tex-1.jpg"
            },
            female: {
                name: "Athena",
                morph: "Bacon Quad Stripe",
                photo: "images/breeders/athena-1.jpg"
            },
            project: "Bacon",
            status: "Active",
            statusColor: "#00ff00",
            expectedOutcome: "Athena has made some high contrast hatchlings, combining with Tex should make some clean lines with her high contrast!",
            notes: "",
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
