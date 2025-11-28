import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { LanguageSelector } from '@/components/language-selector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSelectedLanguage } from '@/src/utils/storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);

  useEffect(() => {
    checkSelectedLanguage();
  }, []);

  async function checkSelectedLanguage() {
    const language = await getSelectedLanguage();
    setHasSelectedLanguage(!!language);
  }

  function handleCameraPress() {
    if (hasSelectedLanguage) {
      router.push('/camera');
    } else {
      setShowLanguageSelector(true);
    }
  }

  function handleLanguageSelected() {
    setHasSelectedLanguage(true);
    router.push('/camera');
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={handleCameraPress}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.cameraButtonText}
          lightColor="white"
          darkColor="white">
          Camera translation
        </ThemedText>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
