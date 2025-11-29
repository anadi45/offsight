import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/storage.dart';

class LanguageProvider extends ChangeNotifier {
  final SharedPreferences _prefs;
  String? _selectedLanguage;

  LanguageProvider(this._prefs) {
    _loadSelectedLanguage();
  }

  String? get selectedLanguage => _selectedLanguage;

  bool get hasSelectedLanguage => _selectedLanguage != null;

  Future<void> _loadSelectedLanguage() async {
    _selectedLanguage = await getSelectedLanguage();
    notifyListeners();
  }

  Future<void> setSelectedLanguage(String languageCode) async {
    await saveSelectedLanguage(languageCode);
    _selectedLanguage = languageCode;
    notifyListeners();
  }

  String getLanguageName(String? code) {
    if (code == null) return 'Not selected';
    final language = supportedLanguages.firstWhere(
      (lang) => lang.code == code,
      orElse: () => Language(code: code, name: code),
    );
    return language.name;
  }
}

