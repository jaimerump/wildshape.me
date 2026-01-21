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

#### Actions
Array of actions the creature can take:
- **Name**: string
- **Description**: string (text describing the action)
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
- Wild Shape restrictions (max CR, flying speed, swimming speed) are determined by Druid Level and Druid Circle
- **Base Druid Wild Shape CR Limits (2024 rules)**:
  - Level 2-3: CR ≤ 1/4, no flying or swimming speed
  - Level 4-7: CR ≤ 1/2, no flying speed
  - Level 8+: CR ≤ 1, any movement types allowed
- **Circle of the Moon Wild Shape CR Limits (2024 rules)**:
  - Max CR = floor(druid level / 3), with same level-based movement restrictions as base druid
  - Examples:
    - Level 6 Moon Druid: CR 2 (6/3 = 2), no flying
    - Level 9 Moon Druid: CR 3 (9/3 = 3), flying allowed
    - Level 15 Moon Druid: CR 5 (15/3 = 5), any movement
- Multiclassing considerations are not currently implemented
