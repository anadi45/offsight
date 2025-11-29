import 'package:shared_preferences/shared_preferences.dart';

const String languageStorageKey = '@offsight:selected_language';

class Language {
  final String code;
  final String name;

  const Language({
    required this.code,
    required this.name,
  });
}

const List<Language> supportedLanguages = [
  Language(code: 'en', name: 'English'),
  Language(code: 'es', name: 'Spanish'),
  Language(code: 'fr', name: 'French'),
  Language(code: 'de', name: 'German'),
  Language(code: 'it', name: 'Italian'),
  Language(code: 'pt', name: 'Portuguese'),
  Language(code: 'ru', name: 'Russian'),
  Language(code: 'ja', name: 'Japanese'),
  Language(code: 'ko', name: 'Korean'),
  Language(code: 'zh', name: 'Chinese'),
  Language(code: 'ar', name: 'Arabic'),
  Language(code: 'hi', name: 'Hindi'),
];

Future<String?> getSelectedLanguage() async {
  try {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(languageStorageKey);
  } catch (error) {
    print('Error getting selected language: $error');
    return null;
  }
}

Future<void> saveSelectedLanguage(String languageCode) async {
  try {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(languageStorageKey, languageCode);
  } catch (error) {
    print('Error saving selected language: $error');
  }
}

