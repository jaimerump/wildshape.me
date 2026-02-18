/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * Script to generate/update beast body types file from beasts_2014.json
 *
 * Reads all beasts from src/data/beasts_2014.json and merges with existing
 * src/data/beast_body_types.json. Preserves existing body type assignments
 * and only adds new beasts with "unassigned" body type.
 *
 * Usage: node src/datasource/beastBodyTypes.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const BEASTS_2014_PATH = path.join(__dirname, '../data/beasts_2014.json');
const OUTPUT_PATH = path.join(__dirname, '../data/beast_body_types.json');

try {
  // Read the beasts_2014.json file
  console.log('Reading beasts from:', BEASTS_2014_PATH);
  const beastsData = fs.readFileSync(BEASTS_2014_PATH, 'utf8');
  const beasts = JSON.parse(beastsData);

  console.log(`Found ${beasts.length} beasts`);

  // Try to read existing beast_body_types.json file
  let existingBodyTypes = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    console.log('Reading existing body types from:', OUTPUT_PATH);
    const existingData = fs.readFileSync(OUTPUT_PATH, 'utf8');
    existingBodyTypes = JSON.parse(existingData);
    console.log(`Found ${existingBodyTypes.length} existing body type entries`);
  } else {
    console.log('No existing body types file found, creating new one');
  }

  // Create a map of existing body types by beast name
  const existingMap = new Map();
  for (const entry of existingBodyTypes) {
    existingMap.set(entry.name, entry.bodyType);
  }

  // Merge: keep existing entries, add new beasts with "unassigned"
  const beastBodyTypes = beasts.map((beast) => ({
    name: beast.name,
    bodyType: existingMap.get(beast.name) || 'unassigned',
  }));

  // Count how many were preserved vs newly added
  const preserved = beastBodyTypes.filter((b) =>
    existingMap.has(b.name)
  ).length;
  const added = beastBodyTypes.length - preserved;

  // Write to output file with pretty printing
  console.log('Writing to:', OUTPUT_PATH);
  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(beastBodyTypes, null, 2),
    'utf8'
  );

  console.log(`✓ Successfully updated beast_body_types.json:`);
  console.log(`  - ${preserved} existing entries preserved`);
  console.log(`  - ${added} new entries added with bodyType "unassigned"`);
  console.log(`  - ${beastBodyTypes.length} total entries`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
