# Claude.md - Technical Specification

This document contains technical details, architecture decisions, and setup instructions for the Wildshape.me project.

## Technology Stack

### Core Technologies
- **Language**: TypeScript
- **Framework**: React Native (via Expo)
- **Platform Targets**: Web (responsive) and Mobile (iOS/Android)
- **Package Manager**: npm

### Key Libraries
- **UI Framework**: React Native (Expo)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Local Storage**: AsyncStorage (React Native) / localStorage (Web)

### Development Tools
- **Build System**: Expo
- **Type Checking**: TypeScript
- **Linting**: ESLint (to be configured)
- **Formatting**: Prettier (to be configured)

## Project Setup

### Prerequisites
- Node.js (LTS version recommended)
- npm
- Expo CLI (`npm install -g expo-cli`)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd wildshape.me

# Install dependencies
npm install

# Start development server
npm start
```

### Running the App
```bash
# Web
npm run web

# iOS (requires macOS)
npm run ios

# Android
npm run android
```

## Project Structure

```
wildshape.me/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/          # Screen components (main views)
│   ├── models/           # TypeScript type definitions (from models.md)
│   ├── store/            # Zustand stores for state management
│   ├── data/             # Bundled JSON data (beast stat blocks)
│   ├── utils/            # Utility functions and helpers
│   │   ├── calculations/ # Game mechanic calculations
│   │   └── storage/      # Local storage helpers
│   ├── hooks/            # Custom React hooks
│   └── constants/        # App constants and configuration
├── assets/               # Images, fonts, and other static assets
├── models.md             # Domain model specification
├── claude.md             # This file - technical specification
└── README.md             # Project overview
```

## Architecture

### State Management with Zustand

Zustand is used for global state management. The app uses multiple stores organized by domain:

```typescript
// Example store structure
src/store/
├── useDruidStore.ts      # Druid character state
├── useBeastStore.ts      # Available beasts and current beast form
└── useWildShapeStore.ts  # Wild Shape session state
```

**Store Patterns**:
- Keep stores focused on specific domains
- Use computed values via selectors when possible
- Persist relevant stores to AsyncStorage
- Avoid prop drilling by accessing stores in components that need them

### Data Storage

**Current Approach**: Local Storage
- Druids: Stored in AsyncStorage/localStorage (persisted Zustand stores)
- Beasts: Bundled as JSON files in `src/data/beasts/`
- User preferences: Stored in AsyncStorage/localStorage

**Future Consideration**: May migrate to cloud storage/backend API

### Data Layer

```
src/data/
├── beasts/
│   ├── 2014/             # Beasts from 2014 edition
│   │   ├── cr0.json
│   │   ├── cr1.json
│   │   └── ...
│   └── 2024/             # Beasts from 2024 edition
│       ├── cr0.json
│       ├── cr1.json
│       └── ...
└── index.ts              # Data access functions
```

## Styling with NativeWind

NativeWind allows using Tailwind CSS utility classes in React Native components.

**Setup Requirements**:
1. Install NativeWind: `npm install nativewind`
2. Install Tailwind CSS: `npm install --dev tailwindcss`
3. Configure `tailwind.config.js`
4. Configure `babel.config.js` to include NativeWind

**Usage Example**:
```tsx
import { View, Text } from 'react-native';

function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-2xl font-bold text-blue-600">
        Wildshape.me
      </Text>
    </View>
  );
}
```

**Styling Conventions**:
- Use Tailwind utility classes for most styling
- Create custom components for repeated patterns
- Use responsive design utilities for web/tablet layouts
- Keep platform-specific styles minimal

## Type Definitions

All domain models defined in `models.md` should be implemented as TypeScript interfaces/types in `src/models/`.

```typescript
// src/models/index.ts
export interface Creature {
  name: string;
  edition: Edition;
  // ... other properties from models.md
}

export interface Beast extends Creature {
  challengeRating: number;
}

export interface Druid extends Creature {
  totalCharacterLevel: number;
  druidLevel: number;
  // ... other properties from models.md
}
```

## Game Calculations

All D&D 5e game mechanic calculations should be pure functions in `src/utils/calculations/`:

```
src/utils/calculations/
├── abilityScores.ts      # Modifier calculations
├── proficiencyBonus.ts   # PB from CR or level
├── skills.ts             # Skill bonus calculations
├── savingThrows.ts       # Saving throw calculations
└── wildShape.ts          # Wild Shape eligibility logic
```

**Calculation Principles**:
- Pure functions (no side effects)
- Well-tested (unit tests for all calculations)
- Documented with JSDoc comments
- Handle both 2014 and 2024 edition rules

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components and hooks
- Use meaningful variable and function names
- Keep components small and focused
- Extract business logic into utility functions

### Component Patterns
- **Presentational Components**: Pure UI components in `src/components/`
- **Screen Components**: Top-level views in `src/screens/`
- **Custom Hooks**: Reusable logic in `src/hooks/`

### Testing Strategy (Future)
- Unit tests for calculation utilities
- Integration tests for state management
- Component tests for critical UI flows
- E2E tests for main user journeys

## Expo Configuration

### Web Support
Expo provides built-in web support via `expo-cli`. The app should be responsive and work on:
- Desktop browsers
- Tablet browsers
- Mobile browsers

### Mobile App
Expo allows building standalone apps for:
- iOS (via EAS Build or local build)
- Android (via EAS Build or local build)

## Performance Considerations

- **Beast Data Loading**: Lazy load beast data by CR to avoid loading entire dataset
- **List Rendering**: Use `FlatList` with proper `keyExtractor` for large lists
- **State Updates**: Use Zustand selectors to prevent unnecessary re-renders
- **Images/Assets**: Optimize asset sizes for mobile
- **Bundle Size**: Monitor and optimize JavaScript bundle size

## Accessibility

- Use semantic HTML elements when rendering to web
- Provide proper accessibility labels for React Native components
- Ensure sufficient color contrast
- Support keyboard navigation on web
- Test with screen readers

## Future Enhancements

Potential features to consider:
- Backend API for cloud sync
- User authentication
- Sharing druids/builds with other users
- Offline-first architecture with sync
- Dark mode support
- Multiple druid character management
- Wild Shape history/favorites
- Combat encounter tools

## References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)
