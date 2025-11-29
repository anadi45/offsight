# Offsight - Flutter Camera Translation App

A Flutter application for translating text from camera images using vision models.

## Features

- 📷 Camera interface for capturing images
- 🌍 Multi-language translation support (13 languages)
- 💾 Persistent language preferences
- 🎨 Modern Material Design 3 UI
- 🌓 Dark mode support

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)

## Setup

1. Make sure you have Flutter installed:
   ```bash
   flutter --version
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Run the app:
   ```bash
   flutter run
   ```

## Builds

A pre-built release APK is available in the root directory:
- [app-release.apk](app-release.apk) - Release build of the app ready for installation on Android devices

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── screens/
│   ├── home_screen.dart      # Home screen with camera button
│   ├── camera_screen.dart    # Camera interface
│   └── explore_screen.dart   # Explore/info screen
├── widgets/
│   └── language_selector.dart # Language selection dialog
├── providers/
│   └── language_provider.dart # Language state management
├── services/
│   └── translation_service.dart # Translation service (placeholder)
└── utils/
    └── storage.dart          # Storage utilities
```

## Translation Service Integration

The translation service currently uses a placeholder implementation. To enable actual translation:

1. **CactusLM Integration**: If CactusLM has Flutter support, integrate it via platform channels or a Flutter plugin
2. **Alternative APIs**: Consider using:
   - Google ML Kit
   - Firebase ML Vision
   - Custom vision API service

## Permissions

The app requires camera permission. On first launch, users will be prompted to grant camera access.

## Development

This project uses:
- **Provider** for state management
- **go_router** for navigation
- **camera** for camera functionality
- **shared_preferences** for local storage

## Notes

- The translation service needs to be integrated with an actual vision model API
- Camera functionality is fully implemented
- Language selection and storage are working
- UI follows Material Design 3 guidelines
