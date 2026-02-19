# Domain Models Specification

This document describes the core domain models for the Wildshape.me application.

## Overview

The application has two core models: **Druid** and **Beast**. Both are specialized versions of a **Creature**.

## Creature (Base Model)

The Creature model represents any entity with stats in D&D 5th edition.

### Properties

#### Basic Information

- **Name**: string - The creature's name
- **Edition**: enum - Either "2014" or "2024"
- **Size**: enum - Tiny, Small, Medium, Large, Huge, or Gargantuan

#### Ability Scores

All six standard ability scores, stored as raw values (modifiers are calculated):

- **Strength**: number (1-30)
- **Dexterity**: number (1-30)
- **Constitution**: number (1-30)
- **Intelligence**: number (1-30)
- **Wisdom**: number (1-30)
- **Charisma**: number (1-30)

#### Hit Points

- **Maximum HP**: number
- **Current HP**: number
- **Temporary HP**: number

#### Defenses

- **Armor Class**: number
- **Saving Throw Proficiencies**: array of ability names
  - Example: ["Dexterity", "Wisdom"]
  - Modifiers are calculated from ability scores and proficiency bonus

#### Senses

Object containing sense types and their ranges:

- **Darkvision**: number (range in feet) | null
- **Blindsight**: number (range in feet) | null
- **Tremorsense**: number (range in feet) | null
- **Truesight**: number (range in feet) | null

#### Movement

Object containing movement types and their speeds:

- **Walking**: number (speed in feet) | null
- **Swimming**: number (speed in feet) | null
- **Flying**: number (speed in feet) | null
- **Climbing**: number (speed in feet) | null
- **Burrowing**: number (speed in feet) | null

#### Skills

Array of skill proficiencies with proficiency level:

- **Skill Name**: string (e.g., "Perception", "Stealth")
- **Proficiency Level**: enum - "proficient" or "expertise"

Skill bonuses are calculated from:

- Appropriate ability score modifier
- Proficiency bonus (from Challenge Rating for Beasts, or Total Character Level for Druids)
- Proficiency level (proficient = 1x, expertise = 2x)

#### Traits

Traits are a discriminated union on the `source` field. Each source variant carries different required fields:

| Source        | Required fields                                | Description                                                     |
| ------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `"species"`   | name, description                              | Inherent racial/species traits (e.g., Darkvision, Keen Hearing) |
| `"class"`     | name, description, className, levelRequirement | Class features (e.g., Spellcasting, Wild Shape)                 |
| `"feat"`      | name, description                              | Traits from feats (e.g., Alert, Lucky)                          |
| `"equipment"` | name, description, equipmentName               | Traits granted by a specific piece of equipment                 |

**Class trait additional fields**:

- **className**: string — The class that grants this trait (e.g., "Druid")
- **levelRequirement**: number — Minimum class level required to have this trait
- **subclass**: string (optional) — If present, this trait only applies to the named subclass

**Equipment trait additional fields**:

- **equipmentName**: string (required) — Must match the `name` of an item in the character's equipment list

#### Actions

Actions are a discriminated union on the `source` field, following the same pattern as Traits. Each source variant carries different required fields:

| Source        | Required fields                                            | Description                                                |
| ------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `"species"`   | name, actionType, description                              | Natural attacks and abilities (e.g., Bite, Claw)           |
| `"class"`     | name, actionType, description, className, levelRequirement | Class-granted actions (e.g., Wild Shape, Channel Divinity) |
| `"feat"`      | name, actionType, description                              | Actions from feats                                         |
| `"equipment"` | name, actionType, description, equipmentName               | Actions granted by a specific piece of equipment           |

**Class action additional fields** (same as class traits):

- **className**: string — The class that grants this action
- **levelRequirement**: number — Minimum class level required
- **subclass**: string (optional) — If present, only applies to the named subclass

**Equipment action additional fields**:

- **equipmentName**: string (required) — Must match a piece of equipment in the character's list

**All action variants also support these optional combat fields**:

- **Action Type**: enum - "Action", "Bonus Action", or "Reaction"
- **Attack Type**: enum - "Melee", "Ranged", or undefined (for non-attack actions)
- **Attack Bonus**: number | undefined
- **Reach**: number (in feet) | undefined (for melee attacks)
- **Range**: string | undefined (e.g., "30/120" for ranged attacks)
- **Damage Dice**: string | undefined (e.g., "2d6")
- **Damage Type**: string | undefined (e.g., "piercing", "slashing")
- **Additional Effects**: string | undefined (description of additional effects)

## Equipment

The Equipment model represents items that a character carries or wears, such as weapons, armor, magical items, and other gear.

### Properties

- **Name**: string - The name of the equipment item
- **Description**: string - What the item does and any relevant details
- **Type**: enum - The category of equipment
  - `"armor"` - Body armor (leather, chain mail, plate, etc.)
  - `"shield"` - Shields
  - `"ring"` - Rings
  - `"weapon"` - Weapons, rods, staves, and wands
  - `"clothing"` - Headwear, boots, cloaks, gloves, and other wearable items
  - `"other"` - Miscellaneous items that don't fit other categories
- **Minimum Size**: enum - Smallest creature size that can use this equipment
  - Uses the Size type: `Tiny`, `Small`, `Medium`, `Large`, `Huge`, `Gargantuan`
  - Example: A longsword might have `minSize: "Small"`
- **Maximum Size**: enum - Largest creature size that can use this equipment
  - Uses the Size type: `Tiny`, `Small`, `Medium`, `Large`, `Huge`, `Gargantuan`
  - Example: A longsword might have `maxSize: "Large"`

### Equipment-Sourced Traits and Actions

Equipment can grant traits and actions to characters who carry them. When a trait or action has `source: 'equipment'`:

1. The trait/action must include an `equipmentName` field
2. The `equipmentName` must match a piece of equipment in the character's equipment list
3. The trait/action should only apply while the character has that equipment

**Example:**

```typescript
// Equipment
{
  name: "Ring of Protection",
  description: "+1 bonus to AC and saving throws",
  type: "ring",
  minSize: "Tiny",
  maxSize: "Large"
}

// Trait from this equipment
{
  name: "Protection",
  description: "+1 bonus to AC and saving throws",
  source: "equipment",
  equipmentName: "Ring of Protection"
}
```

### Equipment in Wild Shape

When a druid transforms using Wild Shape, equipment-sourced traits and actions are only included if the beast form can physically use that equipment.

#### Compatibility Requirements

1. **Size**: Beast's size must be between the equipment's `minSize` and `maxSize` (inclusive)
2. **Body Type**: Beast's body type must support the equipment type

#### Body Type Compatibility Table

| Body Type  | Compatible Equipment Types                         |
| ---------- | -------------------------------------------------- |
| Primate    | All (armor, shield, ring, weapon, clothing, other) |
| Octopus    | Rings, weapons, shields                            |
| Bird       | Rings only                                         |
| Lizard     | Rings only                                         |
| Snake      | Rings only                                         |
| Fish       | None                                               |
| Insect     | None                                               |
| Quadruped  | None                                               |
| Unassigned | None                                               |

**Example:**
A druid wearing a Ring of Protection (+1 AC) transforms into a wolf:

- Wolf body type: quadruped
- Quadrupeds cannot use any equipment
- Result: Ring of Protection trait is NOT included in wildshaped form

A druid wearing a Ring of Protection transforms into an ape:

- Ape body type: primate
- Ape size: Medium, ring size range: Tiny-Large (compatible)
- Result: Ring of Protection trait IS included in wildshaped form

### Notes

- Equipment properties are intentionally simple - no weight, cost, or magical properties tracked in the model
- Size restrictions help determine if equipment can be used in Wild Shape form (application logic)
- Potions and scrolls are intentionally excluded as they cannot be used while wildshaped
- Equipment handling during Wild Shape is determined by application logic, not the model

## DnDClass

The DnDClass model represents a D&D class with its leveled feature progression. It allows class features to be defined as data and derived for a specific character level and subclass.

### Properties

- **name**: string — The class name (e.g., "Druid", "Fighter")
- **edition**: Edition — Which edition's rules this class uses ("2014" or "2024")
- **subclassUnlockLevel**: number — The first level at which subclass features become accessible
  - Example: 2 for the 2014 Druid, 3 for the 2024 Druid
- **traits**: ClassTrait[] — All class traits, including subclass-specific traits
- **actions**: ClassAction[] — All class actions, including subclass-specific actions

### Subclass Features

Subclass-specific features are stored flat in the `traits` and `actions` arrays alongside base class features. They are distinguished by the `subclass` field on each `ClassTrait` / `ClassAction`:

- Features **without** a `subclass` field are base class features available to all subclasses
- Features **with** a `subclass` field only apply to characters with that subclass, AND only once the character reaches `subclassUnlockLevel`

### Feature Filtering

Use `getActiveClassTraits(classDef, level, subclassName)` and `getActiveClassActions(classDef, level, subclassName)` from `src/utils/calculations/classFeatures.ts` to retrieve the features a character qualifies for at a given level and subclass.

A feature is included when:

1. `feature.levelRequirement <= level`, AND
2. Either the feature has no `subclass` (base feature), OR the feature's `subclass` matches `subclassName` AND `level >= classDef.subclassUnlockLevel`

### Example

```typescript
const druid2024: DnDClass = {
  name: 'Druid',
  edition: '2024',
  subclassUnlockLevel: 3,
  traits: [
    // Base class feature — available to all druids at level 1
    {
      source: 'class',
      name: 'Druidic',
      description: '...',
      className: 'Druid',
      levelRequirement: 1,
    },
    // Subclass feature — only Moon druids, from level 3
    {
      source: 'class',
      name: 'Combat Wild Shape',
      description: '...',
      className: 'Druid',
      levelRequirement: 3,
      subclass: 'Circle of the Moon',
    },
  ],
  actions: [],
};
```

## Beast

The Beast model represents creatures that a Druid can Wild Shape into.

### Inherits from Creature

All properties from the Creature base model.

### Additional Properties

- **Challenge Rating**: number - The beast's CR (used to calculate proficiency bonus)
  - Proficiency bonus formula: floor(CR / 4) + 2
- **Body Type**: enum - The beast's physical body structure, used for categorization and filtering
  - Valid values: `"unassigned"`, `"bird"`, `"fish"`, `"insect"`, `"lizard"`, `"octopus"`, `"primate"`, `"quadruped"`, `"snake"`
  - Defaults to `"unassigned"` for beasts that haven't been categorized yet
  - Used to determine whether equipment is compatible with wildshape forms

### Notes

- Wild Shape limitations (such as CR restrictions based on Druid level) are handled by Druid logic, not stored on the Beast model
- Beast eligibility for specific Druid subclasses (e.g., Moon Druid) is determined by application logic

## Druid

The Druid model represents the player character who uses Wild Shape.

### Inherits from Creature

All properties from the Creature base model.

### Additional Properties

#### Character Information

- **Total Character Level**: number (1-20) - Used to calculate proficiency bonus
  - Proficiency bonus formula: floor((level - 1) / 4) + 2
- **Druid Level**: number (1-20) - Determines Wild Shape capabilities
- **Druid Circle**: string | null - The druid's subclass (e.g., "Circle of the Moon", "Circle of the Land")
  - Affects Wild Shape CR limits and other abilities
  - null for druids who haven't chosen a circle yet (level 1)
- **Species**: string - The character's species (e.g., "Human", "Elf")
- **Subspecies**: string | null - The character's subspecies (e.g., "High Elf", "Wood Elf")
- **Background**: string - The character's background (e.g., "Sage", "Outlander")
- **Feats**: array of strings - List of feat names the character has taken

#### Equipment

- **Equipment**: array of Equipment - All items the druid is carrying
  - Includes weapons, armor, magical items, and other gear
  - Equipment can grant traits and actions with `source: 'equipment'`
  - Equipment handling during Wild Shape is determined by application logic
  - See the Equipment model for details on item properties

### Notes

- Wild Shape restrictions (max CR, flying speed, swimming speed) are determined by Druid Level, Druid Circle, and Edition
- **2024 Edition Rules**:
  - **Base Druid Wild Shape CR Limits**:
    - Level 2-3: CR ≤ 1/4, no flying speed
    - Level 4-7: CR ≤ 1/2, no flying speed
    - Level 8+: CR ≤ 1, any movement types allowed
    - **Swimming**: No restriction (can swim at any Wild Shape level)
  - **Circle of the Moon Wild Shape CR Limits**:
    - Max CR = floor(druid level / 3), with same level-based movement restrictions as base druid
    - Examples:
      - Level 3 Moon Druid: CR 1 (3/3 = 1), no flying or swimming
      - Level 6 Moon Druid: CR 2 (6/3 = 2), no flying
      - Level 9 Moon Druid: CR 3 (9/3 = 3), flying allowed
- **2014 Edition Rules**:
  - **Base Druid Wild Shape CR Limits**:
    - Level 2-3: CR ≤ 1/4, no flying or swimming speed
    - Level 4-7: CR ≤ 1/2, no flying speed
    - Level 8+: CR ≤ 1, any movement types allowed
  - **Circle of the Moon Wild Shape CR Limits**:
    - Level 2: CR ≤ 1 (special case for Moon druids)
    - Level 3+: Max CR = floor(druid level / 3), with same level-based movement restrictions as base druid
    - Examples:
      - Level 2 Moon Druid: CR 1 (special rule), no flying or swimming
      - Level 6 Moon Druid: CR 2 (6/3 = 2), no flying, swimming allowed
      - Level 9 Moon Druid: CR 3 (9/3 = 3), flying and swimming allowed
- Multiclassing considerations are not currently implemented

## WildshapedDruid

The WildshapedDruid model represents a druid in Wild Shape form, with a hybrid stat block merging the druid's and beast's properties according to D&D 5e 2024 edition rules.

### Inherits from Creature

All properties from the Creature base model, with values calculated as described below.

### Additional Properties

#### Source References

- **Source Druid**: reference to the original Druid object
- **Source Beast**: reference to the Beast being transformed into

#### Wild Shape Specific

- **Temporary Hit Points**: number - Equal to the druid's level (2024 rule)

#### Computed Bonuses

These are pre-calculated final bonuses after merging druid and beast stats:

- **Saving Throw Bonuses**: object mapping ability names to final save bonuses
  - Uses the higher value between druid's save (with hybrid abilities) and beast's save (with original abilities)
- **Skill Bonuses**: object mapping skill names to final skill bonuses
  - Uses the higher value between druid's skill (with hybrid abilities) and beast's skill (with original abilities)

#### Retained Druid Properties

The following druid properties are retained for reference:

- **Total Character Level**: number - The druid's total level
- **Druid Level**: number - The druid's class level
- **Druid Circle**: string | null - The druid's subclass
- **Other Class Levels**: object | undefined - Multiclass levels if applicable

### 2024 Wild Shape Stat Merging Rules

When a 2024 edition druid uses Wild Shape, the wildshaped druid's stats are calculated as follows:

#### Ability Scores

- **Physical Scores** (Strength, Dexterity, Constitution): Use **beast's** values
- **Mental Scores** (Intelligence, Wisdom, Charisma): Use **druid's** values

This creates "hybrid ability scores" used for further calculations.

#### Hit Points and Defenses

- **Hit Points**: Use **druid's** current HP and maximum HP
- **Hit Dice**: Use **druid's** hit dice
- **Temporary Hit Points**: Gain temporary HP equal to **druid level**
- **Armor Class**: Use **beast's** AC
- **Proficiency Bonus**: Calculate from **druid's total character level**

#### Saving Throws

For each of the six abilities:

1. Calculate druid's save bonus:
   - Use **hybrid ability score** (physical from beast, mental from druid)
   - Add proficiency bonus if druid is proficient
2. Calculate beast's save bonus:
   - Use **beast's original ability score**
   - Add proficiency bonus if beast is proficient
3. Use the **higher** of the two values

Example: A level 5 druid (Wisdom 16, proficient in Wisdom saves, PB +3) transforms into a Wolf (Wisdom 12, not proficient, PB +2):

- Druid's Wisdom save: +3 (mod) + 3 (PB) = +6
- Wolf's Wisdom save: +1 (mod) = +1
- Final Wisdom save: +6 (druid's is higher)

#### Skills

For each of the 18 skills:

1. Calculate druid's skill bonus:
   - Use **hybrid ability score** (physical from beast, mental from druid)
   - Add proficiency bonus if druid is proficient (1x PB) or has expertise (2x PB)
2. Calculate beast's skill bonus:
   - Use **beast's original ability score**
   - Add proficiency bonus if beast is proficient (1x PB) or has expertise (2x PB)
3. Use the **higher** of the two values

Example: A level 5 druid (Wisdom 16, proficient in Perception, PB +3) transforms into a Wolf (Wisdom 12, proficient in Perception, PB +2):

- Druid's Perception: +3 (mod) + 3 (PB) = +6
- Wolf's Perception: +1 (mod) + 2 (PB) = +3
- Final Perception: +6 (druid's is higher)

#### Passive Perception

- Recalculated as **10 + final Perception skill bonus**

#### Movement and Senses

- **Movement**: Use **beast's** movement speeds (walking, swimming, flying, climbing, burrowing)
- **Senses**: Use **beast's** senses (darkvision, blindsight, tremorsense, truesight)
- **Size**: Use **beast's** size

#### Languages

- **Languages**: Use **druid's** languages
- Note: In Wild Shape, the druid understands their known languages but cannot speak (UI/rules consideration, not enforced in the model)

#### Traits and Actions (Source-Based Merging)

Traits and actions are filtered by their **source** property:

- **Include from Beast**: All traits and actions with `source === 'species'`
  - The wildshaped druid gains the beast's natural abilities and attacks
- **Include from Druid**: All traits and actions with `source === 'class'` or `source === 'feat'`
  - The druid retains class features and feat-granted abilities
- **Exclude from Druid**: Traits and actions with `source === 'species'`
  - The druid's racial/species traits are lost during Wild Shape

Example: A Wood Elf druid transforms into a Wolf:

- **Gains**: Wolf's Bite attack (`source: 'species'`), Wolf's Keen Hearing trait (`source: 'species'`)
- **Retains**: Druid's Wild Shape action (`source: 'class'`), Alert feat benefits (`source: 'feat'`)
- **Loses**: Elf's Darkvision trait (`source: 'species'`), Elf's Fey Ancestry trait (`source: 'species'`)

#### Name and Edition

- **Name**: Use **beast's** name (UI can display as "Druid Name (Beast Form)")
- **Edition**: Use **beast's** edition (must match druid's edition for transformation to be valid)

### 2014 Wild Shape Stat Merging Rules

When a 2014 edition druid uses Wild Shape, most rules are the same as 2024, with these key differences:

#### Differences from 2024

**Hit Points and Defenses**:

- **Hit Points**: Use **beast's** current HP and maximum HP (2024 uses druid's)
- **Hit Dice**: Use **beast's** hit dice (2024 uses druid's)
- **Temporary Hit Points**: **None** (0) - 2014 does not grant temporary HP (2024 grants druid level)
- **Armor Class**: Same as 2024 - use beast's AC

**Traits and Actions (No Source Filtering)**:

- **Include ALL traits from beast**: All beast traits regardless of source
- **Include ALL traits from druid**: All druid traits including species, class, and feat traits
- **Include ALL actions from beast**: All beast actions regardless of source
- **Include ALL actions from druid**: All druid actions including species, class, and feat actions

Example: A Wood Elf druid (2014) transforms into a Wolf:

- **Gains from Beast**: Wolf's Bite attack, Wolf's Keen Hearing trait
- **Retains from Druid**:
  - Druid's Wild Shape action (class)
  - Druid's Spellcasting trait (class)
  - Elf's Fey Ancestry trait (species) ← 2014 keeps this, 2024 removes it
  - Elf's Trance trait (species) ← 2014 keeps this, 2024 removes it

**Important Note on Senses**:
While 2014 druids retain ALL traits (including species traits), **senses** are a separate property from traits. Senses (darkvision, blindsight, etc.) come ONLY from the beast in both 2014 and 2024 editions.

#### Same as 2024

The following work identically in both editions:

- **Ability Scores**: Physical from beast, mental from druid
- **Saving Throws**: Use higher bonus between druid and beast
- **Skills**: Use higher bonus between druid and beast
- **Passive Perception**: Recalculated from merged Perception skill
- **Movement**: From beast
- **Senses**: From beast only (not from druid)
- **Languages**: From druid (understand but cannot speak)
- **Proficiency Bonus**: From druid's total character level
- **Size**: From beast

### Notes

- Wild Shape stat calculation is supported for both **2024** and **2014** editions
- The druid and beast must both use the same edition
- All normal Wild Shape restrictions apply (CR limits, movement restrictions based on level)
- The transformation must pass eligibility checks before stats can be calculated
