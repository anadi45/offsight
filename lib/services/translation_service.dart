import 'dart:async';
import 'dart:convert';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:cactus/cactus.dart';
import 'package:http/http.dart' as http;
import '../config/api_keys.dart';

/// Translation service using Google OCR + Cactus LLM for translation
class TranslationService {
  static TextRecognizer? _textRecognizer;
  static CactusLM? _cactusLM;
  static bool _isInitialized = false;
  
  // Language code to language name mapping
  static const Map<String, String> languageNames = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
  };

  // OpenRouter API URL for cloud fallback translation
  static const String _openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  /// Pre-initialize the OCR + translation service
  static Future<void> preInitialize() async {
    try {
      // Initialize OCR
      _textRecognizer = TextRecognizer();
      
      // Initialize Cactus LLM for translation
      _cactusLM = CactusLM();
      await _cactusLM!.downloadModel(
        model: 'qwen3-0.5b', // Back to working model
        downloadProcessCallback: (progress, status, isError) {
          if (isError) {
            print('Translation model download error: $status');
          } else {
            print('Translation model: $status ${progress != null ? '(${(progress * 100).toStringAsFixed(1)}%)' : ''}');
          }
        },
      );
      
      await _cactusLM!.initializeModel(
        params: CactusInitParams(
          model: 'qwen3-0.5b',
          contextSize: 512, // Smaller context for faster translation
        ),
      );
      
      _isInitialized = true;
      print('Google OCR + Cactus translation service pre-initialized successfully');
    } catch (e) {
      print('Pre-initialization failed: $e');
      _isInitialized = false;
    }
  }

  /// Extract text using Google OCR and translate using Cactus LLM
  static Future<String> translateImageText(
    String imagePath,
    String targetLanguage,
  ) async {
    try {
      // Initialize services if not already done
      if (!_isInitialized) {
        await preInitialize();
      }
      
      _textRecognizer ??= TextRecognizer();
      
      final targetLanguageName = languageNames[targetLanguage] ?? targetLanguage;
      
      print('Starting OCR + translation process for image: $imagePath');
      print('Target language: $targetLanguageName');
      
      // Step 1: Extract text using Google ML Kit OCR
      print('Extracting text from image using Google OCR...');
      final inputImage = InputImage.fromFilePath(imagePath);
      final RecognizedText recognizedText = await _textRecognizer!.processImage(inputImage);
      
      if (recognizedText.text.isEmpty) {
        throw Exception('No text found in image');
      }
      
      final extractedText = recognizedText.text.trim();
      print('Extracted text: $extractedText');
      
      // Step 2: Translate using Cactus LLM
      print('Translating text to $targetLanguageName...');
      final translationResult = await _cactusLM!.generateCompletion(
        messages: [
          ChatMessage(
            content: 'You are a direct translator. Translate the following text to $targetLanguageName. Only respond with the translation, nothing else. Do not add explanations, thinking, or any other text.',
            role: 'system',
          ),
          ChatMessage(
            content: extractedText,
            role: 'user',
          ),
        ],
        params: CactusCompletionParams(
          temperature: 0.0,
        ),
      );
      
      if (translationResult.success && translationResult.response.trim().isNotEmpty) {
        print('Raw LLM response: "${translationResult.response}"');
        
        // Extract translated text from response
        var translation = _extractTranslatedText(translationResult.response.trim(), targetLanguage);
        print('Extracted translation: "$translation"');
        
        if (translation.isNotEmpty) {
          return translation;
        }
      }
      
      // Step 3: Fallback to OpenRouter API if Cactus LLM failed
      print('Cactus LLM translation failed, trying OpenRouter API fallback...');
      try {
        final openRouterTranslation = await _translateWithOpenRouter(extractedText, targetLanguage);
        if (openRouterTranslation.isNotEmpty) {
          print('OpenRouter translation successful: $openRouterTranslation');
          return openRouterTranslation;
        }
      } catch (e) {
        print('OpenRouter API fallback failed: $e');
      }
      
      // If all translation methods failed, return error message
      print('All translation methods failed - returning original text');
      return '[Translation unavailable]';
      
    } catch (e) {
      print('Error in OCR + translation process: $e');
      throw Exception('Translation error: $e');
    }
  }
  
  /// Check if OCR + translation service is available
  static Future<bool> isAvailable() async {
    try {
      _textRecognizer ??= TextRecognizer();
      return _isInitialized;
    } catch (e) {
      return false;
    }
  }

  /// Clean up resources
  static void dispose() {
    _textRecognizer?.close();
    _textRecognizer = null;
    _cactusLM?.unload();
    _cactusLM = null;
    _isInitialized = false;
  }
  
  /// Translate text using OpenRouter API as fallback
  static Future<String> _translateWithOpenRouter(
    String text,
    String targetLanguage,
  ) async {
    try {
      final targetLanguageName = languageNames[targetLanguage] ?? targetLanguage;
      
      final response = await http.post(
        Uri.parse(_openRouterApiUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $openRouterApiKey',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Offsight Translation App',
        },
        body: jsonEncode({
          'model': 'anthropic/claude-3.5-sonnet',
          'messages': [
            {
              'role': 'system',
              'content': 'You are a direct translator. Translate the following text to $targetLanguageName. Only respond with the translation, nothing else. Do not add explanations, thinking, or any other text.',
            },
            {
              'role': 'user',
              'content': text,
            },
          ],
          'temperature': 0.0,
        }),
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        final translatedText = jsonResponse['choices']?[0]?['message']?['content'] as String?;
        
        if (translatedText != null && translatedText.trim().isNotEmpty) {
          return translatedText.trim();
        }
      } else {
        print('OpenRouter API error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('OpenRouter API exception: $e');
    }
    
    return '';
  }

  /// Extract translated text from LLM response, filtering out English thinking patterns
  static String _extractTranslatedText(String response, String targetLanguage) {
    // Split into lines and look for translated content
    var lines = response.split('\n');
    var translatedTexts = <String>[];
    
    // Language-specific regex patterns for detecting translated text
    final languagePatterns = {
      'hi': RegExp(r'[\u0900-\u097F]'), // Devanagari (Hindi)
      'ar': RegExp(r'[\u0600-\u06FF]'), // Arabic
      'zh': RegExp(r'[\u4e00-\u9fff]'), // Chinese
      'ja': RegExp(r'[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]'), // Japanese
      'ko': RegExp(r'[\uAC00-\uD7AF]'), // Korean
      'ru': RegExp(r'[\u0400-\u04FF]'), // Cyrillic (Russian)
    };
    
    final pattern = languagePatterns[targetLanguage];
    
    for (var line in lines) {
      var trimmed = line.trim();
      
      // Skip thinking patterns and English explanations
      if (trimmed.toLowerCase().contains('think') ||
          trimmed.toLowerCase().startsWith('okay') ||
          trimmed.toLowerCase().startsWith('let') ||
          trimmed.toLowerCase().contains('translation') ||
          trimmed.startsWith('<') ||
          trimmed.isEmpty) {
        continue;
      }
      
      // If pattern exists, check for target language script
      if (pattern != null && pattern.hasMatch(trimmed)) {
        translatedTexts.add(trimmed);
      } else if (pattern == null) {
        // For languages without special script (like Spanish, French), 
        // accept any non-empty line that doesn't match thinking patterns
        translatedTexts.add(trimmed);
      }
    }
    
    return translatedTexts.join(' ').trim();
  }
}

