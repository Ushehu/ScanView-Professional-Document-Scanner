import { useRef } from 'react';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

export function useCamera() {
  const cameraRef = useRef<CameraView>(null);

  const capturePhoto = async () => {
    if (!cameraRef.current) {
      console.log('Camera ref is null');
      return null;
    }
    
    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
      });
      
      console.log('Photo taken:', photo?.uri);
      
      if (photo?.uri) {
        // Copy to permanent storage
        const filename = `photo_${Date.now()}.jpg`;
        const directory = `${FileSystem.documentDirectory}scanview/`;
        const newPath = `${directory}${filename}`;
        
        console.log('Checking directory:', directory);
        
        // Ensure directory exists
        const dirInfo = await FileSystem.getInfoAsync(directory);
        if (!dirInfo.exists) {
          console.log('Creating directory...');
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        }
        
        console.log('Copying photo from', photo.uri, 'to', newPath);
        
        // Copy the photo
        await FileSystem.copyAsync({
          from: photo.uri,
          to: newPath,
        });
        
        console.log('Photo saved successfully to:', newPath);
        return newPath;
      }
      return null;
    } catch (error) {
      console.error('Error capturing photo:', error);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      console.log('Opening image picker...');
      
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission denied');
        return null;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
        allowsEditing: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        // Copy to permanent storage
        const filename = `imported_${Date.now()}.jpg`;
        const directory = `${FileSystem.documentDirectory}scanview/`;
        const newPath = `${directory}${filename}`;
        
        console.log('Checking directory:', directory);
        
        const dirInfo = await FileSystem.getInfoAsync(directory);
        if (!dirInfo.exists) {
          console.log('Creating directory...');
          await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        }
        
        console.log('Copying image from', result.assets[0].uri, 'to', newPath);
        
        await FileSystem.copyAsync({
          from: result.assets[0].uri,
          to: newPath,
        });
        
        console.log('Image saved successfully to:', newPath);
        return newPath;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  return {
    cameraRef,
    capturePhoto,
    pickImage,
  };
}