import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.cameraButton}
        onPress={() => router.push('/camera')}>
        <ThemedText
          type="defaultSemiBold"
          style={styles.cameraButtonText}
          lightColor="white"
          darkColor="white">
          Camera translation
        </ThemedText>
      </TouchableOpacity>
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
