/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/**
 * Script to update bodyType field in beasts_2014.json from beast_body_types.json
 *
 * Reads body type mappings from beast_body_types.json and updates the bodyType
 * field for each beast in beasts_2014.json, using the beast name as the key.
 *
 * Usage: node src/datasource/addBodyTypeToBeasts.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const BEASTS_2014_PATH = path.join(__dirname, '../data/beasts_2014.json');
const BODY_TYPES_PATH = path.join(__dirname, '../data/beast_body_types.json');

try {
  // Read the beast_body_types.json file
  console.log('Reading body types from:', BODY_TYPES_PATH);
  const bodyTypesData = fs.readFileSync(BODY_TYPES_PATH, 'utf8');
  const bodyTypes = JSON.parse(bodyTypesData);

  console.log(`Found ${bodyTypes.length} body type mappings`);

  // Create a map of beast name -> body type
  const bodyTypeMap = new Map();
  for (const entry of bodyTypes) {
    bodyTypeMap.set(entry.name, entry.bodyType);
  }

  // Read the beasts_2014.json file
  console.log('Reading beasts from:', BEASTS_2014_PATH);
  const beastsData = fs.readFileSync(BEASTS_2014_PATH, 'utf8');
  const beasts = JSON.parse(beastsData);

  console.log(`Found ${beasts.length} beasts`);

  // Update bodyType field for each beast
  let updated = 0;
  let notFound = 0;
  const updatedBeasts = beasts.map((beast) => {
    const bodyType = bodyTypeMap.get(beast.name);

    if (bodyType !== undefined) {
      if (beast.bodyType !== bodyType) {
        updated++;
      }
      return {
        ...beast,
        bodyType: bodyType,
      };
    } else {
      notFound++;
      console.warn(
        `⚠ Warning: No body type found for "${beast.name}", using "unassigned"`
      );
      return {
        ...beast,
        bodyType: 'unassigned',
      };
    }
  });

  // Write back to the file with pretty printing
  console.log('Writing updated beasts to:', BEASTS_2014_PATH);
  fs.writeFileSync(
    BEASTS_2014_PATH,
    JSON.stringify(updatedBeasts, null, 2),
    'utf8'
  );

  console.log(`✓ Successfully updated beasts_2014.json:`);
  console.log(`  - ${updated} beasts had body types updated`);
  console.log(
    `  - ${beasts.length - updated - notFound} beasts kept existing body types`
  );
  if (notFound > 0) {
    console.log(`  - ${notFound} beasts not found in body types mapping`);
  }
  console.log(`  - ${beasts.length} total beasts`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
