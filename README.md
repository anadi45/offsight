# offsight

A React Native app for camera-based translation.

## Prerequisites

- Node.js (v18 or higher)
- React Native development environment
  - **iOS**: Xcode and CocoaPods
  - **Android**: Android Studio and Android SDK

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install iOS CocoaPods dependencies:

   ```bash
   cd ios && pod install && cd ..
   ```

3. Start the Metro bundler:

   ```bash
   npm start
   ```

4. Run the app:

   **iOS:**
   ```bash
   npm run ios
   ```

   **Android:**
   ```bash
   npm run android
   ```

## Project Structure

- `App.tsx` - Root component with navigation setup
- `app/` - Screen components
  - `(tabs)/` - Tab navigation screens
  - `camera.tsx` - Camera translation screen
  - `modal.tsx` - Modal screen
- `components/` - Reusable UI components
- `src/` - Feature modules and utilities
- `hooks/` - Custom React hooks

## Tech Stack

- **React Native** 0.81.5
- **React Navigation** - Navigation
- **react-native-vision-camera** - Camera functionality
- **TypeScript** - Type safety
- **Metro bundler** - JavaScript bundling

## Troubleshooting

### iOS Build Errors

If you encounter build errors when running `npm run ios`, you can debug them by opening the project in Xcode:

1. Open the Xcode workspace:
   ```bash
   open ios/offsight.xcworkspace
   ```
