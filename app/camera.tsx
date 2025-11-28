import { CameraView, useCameraPermissions } from 'expo-camera';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LanguageSelector } from '@/components/language-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSelectedLanguage, SUPPORTED_LANGUAGES } from '@/src/utils/storage';

export default function CameraScreen() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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

  if (!permission) {
    // Camera permissions are still loading
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera permissions...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <Button onPress={requestPermission} title="Grant Permission" />
      </ThemedView>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <ThemedView style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => setShowLanguageSelector(true)}>
            <ThemedText style={styles.languageText} lightColor="white" darkColor="white">
              {getLanguageName(selectedLanguage)}
            </ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <ThemedText style={styles.text} lightColor="white" darkColor="white">
              Flip Camera
            </ThemedText>
          </TouchableOpacity>
          <Link href="/" asChild>
            <TouchableOpacity style={styles.closeButton}>
              <ThemedText style={styles.text} lightColor="white" darkColor="white">
                Close
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </View>
      </CameraView>
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        onLanguageSelected={handleLanguageSelected}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
    alignItems: 'center',
    zIndex: 1,
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
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    gap: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
  },
  closeButton: {
    flex: 1,
    alignSelf: 'flex-end',
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
});

