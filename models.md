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

Array of special abilities and traits:

- **Name**: string
- **Description**: string (text describing the trait)
- **Source**: enum - "species", "class", or "feat"
  - Indicates where the trait originates (used for Wild Shape stat merging)
  - "species": Inherent racial/species traits (e.g., Darkvision from being an Elf, Keen Hearing from being a Wolf)
  - "class": Class features (e.g., Spellcasting, Wild Shape, Rage)
  - "feat": Traits from feats (e.g., Alert, Lucky)

#### Actions

Array of actions the creature can take:

- **Name**: string
- **Description**: string (text describing the action)
- **Source**: enum - "species", "class", or "feat"
  - Indicates where the action originates (used for Wild Shape stat merging)
  - "species": Natural attacks and abilities (e.g., Bite, Claw, Multiattack for beasts)
  - "class": Class-granted actions (e.g., Wild Shape activation, Channel Divinity)
  - "feat": Actions from feats (e.g., special maneuvers)
- **Action Type**: enum - "Action", "Bonus Action", or "Reaction"
- **Attack Type**: enum - "Melee", "Ranged", or null (for non-attack actions)
- **Attack Bonus**: number | null
- **Reach**: number (in feet) | null (for melee attacks)
- **Range**: string | null (e.g., "30/120" for ranged attacks)
- **Damage Dice**: string | null (e.g., "2d6")
- **Damage Type**: string | null (e.g., "piercing", "slashing")
- **Save DC**: number | null
- **Save Type**: string | null (e.g., "Strength", "Dexterity")
- **Effects**: string | null (description of additional effects)

## Beast

The Beast model represents creatures that a Druid can Wild Shape into.

### Inherits from Creature

All properties from the Creature base model.

### Additional Properties

- **Challenge Rating**: number - The beast's CR (used to calculate proficiency bonus)
  - Proficiency bonus formula: floor(CR / 4) + 2

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
