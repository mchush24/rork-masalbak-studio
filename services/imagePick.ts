import * as ImagePicker from 'expo-image-picker';

export async function pickFromLibrary(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.9,
  });
  
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}

export async function captureWithCamera(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    alert('Kamera izni gerekli');
    return null;
  }
  
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.9,
  });
  
  if (result.canceled || !result.assets?.[0]?.uri) return null;
  return result.assets[0].uri;
}
