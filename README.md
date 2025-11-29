# Offsight

A React Native app for camera-based translation using Metro bundler.

## Prerequisites

- Node.js (v18 or higher)
- React Native development environment set up
  - For iOS: Xcode and CocoaPods
  - For Android: Android Studio and Android SDK

## Initial Setup

Since this project was migrated from Expo, you need to initialize the native iOS and Android projects first.

### Option 1: Initialize Native Projects (Recommended)

1. Create a temporary React Native project to get the native folders:

   ```bash
   npx react-native init TempProject --version 0.81.5
   ```

2. Copy the native folders to your project:

   ```bash
   cp -r TempProject/ios .
   cp -r TempProject/android .
   rm -rf TempProject
   ```

3. Update the native project names:
   - **iOS**: Open `ios/offsight.xcworkspace` in Xcode and update the project name if needed
   - **Android**: Update `android/app/src/main/res/values/strings.xml` with your app name

### Option 2: Use React Native CLI (Alternative)

If you have React Native CLI installed globally:

```bash
npx @react-native-community/cli init OffsightTemp --skip-install
cp -r OffsightTemp/ios .
cp -r OffsightTemp/android .
rm -rf OffsightTemp
```

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. For iOS, install CocoaPods dependencies

   ```bash
   cd ios && pod install && cd ..
   ```

3. Start the Metro bundler

   ```bash
   npm start
   ```

4. Run the app

   For iOS:
   ```bash
   npm run ios
   ```

   For Android:
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

## Development

The app uses:
- **React Navigation** for navigation
- **Metro bundler** for JavaScript bundling
- **react-native-vision-camera** for camera functionality
- **TypeScript** for type safety

## Learn more

- [React Native documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation documentation](https://reactnavigation.org/)
- [Metro bundler documentation](https://metrobundler.dev/)
