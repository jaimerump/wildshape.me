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
- **Linting**: ESLint
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

## Deployment

### Web Deployment to AWS S3

The web version of the app is hosted as a static site on AWS S3 and served via the wildshape.me domain.

#### Build Process

1. **Build the web app**:
   ```bash
   npx expo export --platform web
   ```
   This compiles TypeScript to JavaScript and outputs static files to the `dist/` directory.

2. **Verify build output**:
   - Check that `dist/` contains `index.html`, JavaScript bundles, and assets
   - Test locally by serving the `dist/` directory

#### AWS S3 Setup

1. **Create S3 Bucket**:
   - Bucket name: `wildshape.me` (should match domain name)
   - Region: Choose closest to target audience
   - Disable "Block all public access"

2. **Configure Bucket for Static Website Hosting**:
   - Enable static website hosting in bucket properties
   - Set index document: `index.html`
   - Set error document: `index.html` (for client-side routing)

3. **Set Bucket Policy** (allow public read access):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::wildshape.me/*"
       }
     ]
   }
   ```

4. **Upload Build Files**:
   ```bash
   aws s3 sync dist/ s3://wildshape.me --delete
   ```
   - The `--delete` flag removes files from S3 that are no longer in the build
   - Ensure AWS CLI is configured with appropriate credentials

#### Domain Configuration

1. **DNS Setup**:
   - Point `wildshape.me` domain to S3 bucket endpoint
   - Create CNAME or A record depending on DNS provider

2. **SSL/HTTPS (Optional but Recommended)**:
   - Use AWS CloudFront as CDN in front of S3 bucket
   - CloudFront provides free SSL certificates via AWS Certificate Manager
   - Configure CloudFront distribution to use S3 bucket as origin
   - Point domain to CloudFront distribution instead of S3 directly

#### Deployment Checklist

- [ ] Run `npx expo export --platform web`
- [ ] Test build locally
- [ ] Upload to S3: `aws s3 sync dist/ s3://wildshape.me --delete`
- [ ] Verify website is accessible via S3 endpoint
- [ ] Confirm domain points to S3 bucket (or CloudFront)
- [ ] Test website at wildshape.me
- [ ] Verify mobile responsiveness
- [ ] Check browser console for errors

#### CI/CD (Future)

Consider setting up automated deployments:
- GitHub Actions workflow triggered on push to `main` branch
- Automatically build and deploy to S3
- Invalidate CloudFront cache if using CDN

### Mobile App Deployment

Mobile apps are built and distributed using Expo Application Services (EAS).

#### iOS Deployment

1. **Prerequisites**:
   - Apple Developer account
   - App Store Connect app created

2. **Build**:
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

#### Android Deployment

1. **Prerequisites**:
   - Google Play Console account
   - App created in Play Console

2. **Build**:
   ```bash
   eas build --platform android
   ```

3. **Submit to Play Store**:
   ```bash
   eas submit --platform android
   ```

#### EAS Configuration

Create `eas.json` in project root:
```json
{
  "build": {
    "production": {
      "node": "18.x.x"
    }
  },
  "submit": {
    "production": {}
  }
}
```

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
