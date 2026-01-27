/**
 * SITEMAP GENERATOR FOR THE LAB REPTILES
 * 
 * This script automatically generates sitemap.xml from your inventory and collection data.
 * Run this whenever you update your animals to keep sitemap current.
 * 
 * Requirements: Node.js installed
 * Usage: node generate-sitemap.js
 */

const fs = require('fs');

// Import your data (adjust paths if needed)
const inventory = require('./inventory.js').inventory || [];
const collection = require('./collection.js').collection || [];

// Configuration
const DOMAIN = 'https://thelabreptiles.com';
const TODAY = new Date().toISOString().split('T')[0];

// Start building sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

    <!-- Homepage - Highest Priority -->
    <url>
        <loc>${DOMAIN}/</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Available Inventory - High Priority, Changes Frequently -->
    <url>
        <loc>${DOMAIN}/available.html</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    <!-- Breeding Collection - High Priority -->
    <url>
        <loc>${DOMAIN}/collection.html</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- Contact Page - Important for Conversions -->
    <url>
        <loc>${DOMAIN}/contact.html</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>

    <!-- Care Resources - Educational Content -->
    <url>
        <loc>${DOMAIN}/caresheets.html</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>

`;

// Add individual animal profiles from inventory
if (inventory && inventory.length > 0) {
    sitemap += `    <!-- Individual Animal Profiles -->\n`;
    
    inventory.forEach(animal => {
        // Only include available animals (or all if you want sold ones indexed too)
        if (!animal.sold) {
            sitemap += `    <url>
        <loc>${DOMAIN}/profile.html?id=${encodeURIComponent(animal.id)}</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>

`;
        }
    });
}

// Add breeder profiles from collection
if (collection && collection.length > 0) {
    sitemap += `    <!-- Breeder Profiles -->\n`;
    
    collection.forEach(breeder => {
        sitemap += `    <url>
        <loc>${DOMAIN}/breeder-profile.html?id=${encodeURIComponent(breeder.id)}</loc>
        <lastmod>${TODAY}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>

`;
    });
}

// Close the sitemap
sitemap += `</urlset>`;

// Write to file
try {
    fs.writeFileSync('sitemap.xml', sitemap, 'utf8');
    console.log('✅ Sitemap generated successfully!');
    console.log(`📊 Total URLs: ${inventory.filter(a => !a.sold).length + collection.length + 5}`);
    console.log(`📅 Last updated: ${TODAY}`);
    console.log('📁 File saved as: sitemap.xml');
} catch (error) {
    console.error('❌ Error generating sitemap:', error);
}

// Generate a summary
console.log('\n📋 Sitemap Summary:');
console.log(`   - Main pages: 5`);
console.log(`   - Available animals: ${inventory.filter(a => !a.sold).length}`);
console.log(`   - Breeder profiles: ${collection.length}`);
console.log(`\n🚀 Next steps:`);
console.log(`   1. Upload sitemap.xml to your website root`);
console.log(`   2. Submit to Google Search Console`);
console.log(`   3. Re-run this script whenever you update inventory`);