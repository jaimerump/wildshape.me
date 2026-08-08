/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/**
 * Script to apply hand-maintained updates to beasts_2014.json from beast_updates.json
 *
 * beast_updates.json holds data the source stat blocks don't provide in a
 * usable form: the bodyType classification, plus overrides for traits the
 * calculations can't derive from the stat block (a frog's Standing Leap, a
 * lion's Running Leap, a mule's Beast of Burden). Each entry is keyed by
 * beast name and its fields are merged onto the matching beast.
 *
 * Usage: node src/datasource/applyBeastUpdates.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const BEASTS_2014_PATH = path.join(__dirname, '../data/beasts_2014.json');
const UPDATES_PATH = path.join(__dirname, '../data/beast_updates.json');

try {
  // Read the beast_updates.json file
  console.log('Reading updates from:', UPDATES_PATH);
  const updatesData = fs.readFileSync(UPDATES_PATH, 'utf8');
  const updates = JSON.parse(updatesData);

  console.log(`Found ${updates.length} beast update entries`);

  // Create a map of beast name -> fields to apply (everything but the key)
  const updateMap = new Map();
  for (const { name, ...fields } of updates) {
    updateMap.set(name, fields);
  }

  // Read the beasts_2014.json file
  console.log('Reading beasts from:', BEASTS_2014_PATH);
  const beastsData = fs.readFileSync(BEASTS_2014_PATH, 'utf8');
  const beasts = JSON.parse(beastsData);

  console.log(`Found ${beasts.length} beasts`);

  // Merge each beast's update fields onto it
  let updated = 0;
  let notFound = 0;
  const updatedBeasts = beasts.map((beast) => {
    const fields = updateMap.get(beast.name);

    if (fields === undefined) {
      notFound++;
      console.warn(
        `⚠ Warning: No update entry for "${beast.name}", using bodyType "unassigned"`
      );
      return {
        ...beast,
        bodyType: 'unassigned',
      };
    }

    const updatedBeast = { ...beast, ...fields };
    if (JSON.stringify(updatedBeast) !== JSON.stringify(beast)) {
      updated++;
    }
    return updatedBeast;
  });

  // Write back to the file with pretty printing
  console.log('Writing updated beasts to:', BEASTS_2014_PATH);
  fs.writeFileSync(
    BEASTS_2014_PATH,
    JSON.stringify(updatedBeasts, null, 2),
    'utf8'
  );

  console.log(`✓ Successfully updated beasts_2014.json:`);
  console.log(`  - ${updated} beasts had fields updated`);
  console.log(
    `  - ${beasts.length - updated - notFound} beasts already up to date`
  );
  if (notFound > 0) {
    console.log(`  - ${notFound} beasts had no update entry`);
  }
  console.log(`  - ${beasts.length} total beasts`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
