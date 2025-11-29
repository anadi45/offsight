import 'dart:io';
import 'dart:async';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:cactus/cactus.dart';

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

  /// Pre-initialize the OCR + translation service
  static Future<void> preInitialize() async {
    try {
      // Initialize OCR
      _textRecognizer = TextRecognizer();
      
      // Initialize Cactus LLM for translation
      _cactusLM = CactusLM();
      await _cactusLM!.downloadModel(
        model: 'qwen3-0.6', // Small, fast text model
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
          model: 'qwen3-0.6',
          contextSize: 1024, // Smaller context for faster translation
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
            content: 'Translate the following text to $targetLanguageName. Only return the translation, no explanations:\n\n"$extractedText"',
            role: 'user',
          ),
        ],
        params: CactusCompletionParams(
          maxTokens: 200,
          temperature: 0.1, // Low temperature for consistent translations
          stopSequences: ["\n\n", "."],
        ),
      );
      
      if (translationResult.success && translationResult.response.trim().isNotEmpty) {
        final translation = translationResult.response.trim();
        print('Translation completed: $translation');
        return 'Original: $extractedText\n\nTranslation ($targetLanguageName): $translation';
      } else {
        print('Translation failed, returning extracted text only');
        return 'Extracted text: $extractedText\n\n(Translation failed - model may still be loading)';
      }
      
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
}

