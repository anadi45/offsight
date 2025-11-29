import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Button, Linking, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { LanguageSelector } from '@/components/language-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { translateImageText } from '@/src/features/translation/utils/translation';
import { getSelectedLanguage, SUPPORTED_LANGUAGES } from '@/src/utils/storage';

export default function CameraScreen() {
  const cameraRef = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back');
  const device = useCameraDevice(cameraPosition);
  const { hasPermission, requestPermission } = useCameraPermission();
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    loadSelectedLanguage();
  }, []);

  async function loadSelectedLanguage() {
    const language = await getSelectedLanguage();
    setSelectedLanguage(language);
  }

  function getLanguageName(code: string | null): string {
    if (!code) return 'Not selected';
    const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
    return language?.name || code;
  }

  async function handleLanguageSelected(languageCode: string) {
    setSelectedLanguage(languageCode);
    // Language is already saved by LanguageSelector component
  }

  function handleFlipCamera() {
    setCameraPosition((prev) => (prev === 'back' ? 'front' : 'back'));
  }

  if (!hasPermission) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button
          onPress={async () => {
            try {
              const result = await requestPermission();
              if (!result) {
                // Permission denied, open settings
                if (Platform.OS === 'ios') {
                  await Linking.openURL('app-settings:');
                } else {
                  await Linking.openSettings();
                }
              }
            } catch (error) {
              console.error('Error requesting camera permission:', error);
              // If permission request fails, try to open settings
              try {
                if (Platform.OS === 'ios') {
                  await Linking.openURL('app-settings:');
                } else {
                  await Linking.openSettings();
                }
              } catch (linkError) {
                console.error('Error opening settings:', linkError);
              }
            }
          }}
          title="Grant Permission"
        />
      </ThemedView>
    );
  }

  if (!device) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Camera device not available</ThemedText>
      </ThemedView>
    );
  }

  async function handleTakePhoto() {
    if (!cameraRef.current || !selectedLanguage) {
      return;
    }

    try {
      setIsProcessing(true);
      setTranslatedText(null);

      // Take a photo
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      if (!photo?.path) {
        throw new Error('Failed to capture photo');
      }

      // Use CactusLM vision model to extract text and translate it in one step
      // Note: react-native-vision-camera returns a file path
      // The vision model expects a file path, not a URI
      const imagePath = photo.path;
      const translation = await translateImageText(imagePath, selectedLanguage);
      
      setTranslatedText(translation);
      setShowResult(true);
    } catch (error) {
      console.error('Error processing photo:', error);
      // TODO: Show error message to user
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <Camera ref={cameraRef} device={device} isActive={true} photo={true} style={styles.camera} />
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageSelector(true)}>
          <ThemedText style={styles.languageText} lightColor="white" darkColor="white">
            {getLanguageName(selectedLanguage)}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.flipButton} onPress={handleFlipCamera}>
          <ThemedText style={styles.flipButtonText} lightColor="white" darkColor="white">
            🔄
          </ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <ThemedText style={styles.text} lightColor="white" darkColor="white">
              Close
            </ThemedText>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
          onPress={handleTakePhoto}
          disabled={isProcessing || !selectedLanguage}>
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={styles.captureButtonInner} />
          )}
        </TouchableOpacity>
      </View>
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onLanguageSelected={handleLanguageSelected}
      />
      <Modal
        visible={showResult}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResult(false)}>
        <ThemedView style={styles.resultModalOverlay}>
          <View style={styles.resultModalContent}>
            <View style={styles.resultHeader}>
              <ThemedText type="title" style={styles.resultTitle}>
                Translation
              </ThemedText>
              <TouchableOpacity onPress={() => setShowResult(false)} style={styles.closeResultButton}>
                <ThemedText style={styles.closeResultButtonText}>✕</ThemedText>
              </TouchableOpacity>
            </View>
            {translatedText && (
              <ThemedText 
                style={styles.resultText}
                lightColor="#000000"
                darkColor="#FFFFFF">
                {translatedText}
              </ThemedText>
            )}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowResult(false)}>
              <ThemedText style={styles.dismissButtonText}>Dismiss</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  languageButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButtonText: {
    fontSize: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 10,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  closeButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeResultButton: {
    padding: 5,
  },
  closeResultButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  resultText: {
    fontSize: 18,
    lineHeight: 28,
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontWeight: '600',
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dismissButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

