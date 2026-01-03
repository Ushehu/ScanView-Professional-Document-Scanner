import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const frameWidth = width * 0.85;

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Enable torch mode when flash is on (continuous light)
  const [enableTorch, setEnableTorch] = useState(false);

  if (!permission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-base">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-6">
        <View className="bg-white rounded-3xl p-8 items-center">
          <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
            <Ionicons name="camera" size={48} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            ScanView needs camera access to scan documents
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="bg-blue-600 px-8 py-4 rounded-2xl active:scale-95"
          >
            <Text className="text-white font-bold text-base">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;
    
    try {
      setIsCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.95,
        skipProcessing: false,
      });

      if (photo?.uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push({
          pathname: '/document/edit',
          params: { imageUri: photo.uri },
        });
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        router.push({
          pathname: '/document/edit',
          params: { imageUri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const toggleFlash = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableTorch(current => !current);
    setFlash(current => current === 'off' ? 'on' : 'off');
  };

  const toggleFacing = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={facing}
        flash={flash}
        enableTorch={enableTorch}
      />

      {/* Top Bar Overlay */}
      <View className="absolute top-0 left-0 right-0 z-10">
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          className={`flex-row justify-between items-center px-5 pb-5 ${Platform.OS === 'ios' ? 'pt-[50px]' : 'pt-10'}`}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-black/30 items-center justify-center active:scale-95"
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={toggleFlash}
              className={`w-11 h-11 rounded-full items-center justify-center active:scale-95 ${
                enableTorch ? 'bg-yellow-400/40' : 'bg-black/30'
              }`}
            >
              <Ionicons
                name={enableTorch ? 'flash' : 'flash-off'}
                size={24}
                color={enableTorch ? '#FCD34D' : 'white'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={toggleFacing}
              className="w-11 h-11 rounded-full bg-black/30 items-center justify-center active:scale-95"
            >
              <Ionicons name="camera-reverse" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Center Frame Overlay */}
      <View className="absolute inset-0 justify-center items-center px-5 z-20" pointerEvents="none">
        <View 
          className="border-[3px] border-white/50 rounded-2xl relative"
          style={{ width: frameWidth, aspectRatio: 0.7 }}
        >
          {/* Top Left Corner */}
          <View className="absolute -top-[2px] -left-[2px] w-10 h-10 border-t-4 border-l-4 border-blue-600 rounded-tl-2xl" />
          
          {/* Top Right Corner */}
          <View className="absolute -top-[2px] -right-[2px] w-10 h-10 border-t-4 border-r-4 border-blue-600 rounded-tr-2xl" />
          
          {/* Bottom Left Corner */}
          <View className="absolute -bottom-[2px] -left-[2px] w-10 h-10 border-b-4 border-l-4 border-blue-600 rounded-bl-2xl" />
          
          {/* Bottom Right Corner */}
          <View className="absolute -bottom-[2px] -right-[2px] w-10 h-10 border-b-4 border-r-4 border-blue-600 rounded-br-2xl" />
          
          {/* Grid Lines */}
          <View className="absolute inset-0">
            <View className="absolute left-0 right-0 h-[1px] bg-white/20" style={{ top: '33%' }} />
            <View className="absolute left-0 right-0 h-[1px] bg-white/20" style={{ top: '66%' }} />
            <View className="absolute top-0 bottom-0 w-[1px] bg-white/20" style={{ left: '33%' }} />
            <View className="absolute top-0 bottom-0 w-[1px] bg-white/20" style={{ left: '66%' }} />
          </View>
        </View>

        {/* Instruction Badge */}
        <View className="mt-6">
          <View className="flex-row items-center bg-black/60 px-5 py-3 rounded-full gap-2">
            <Ionicons name="document-text-outline" size={16} color="white" />
            <Text className="text-white text-sm font-semibold">
              Position document within frame
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls Overlay */}
      <View className="absolute bottom-0 left-0 right-0 z-10">
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          className={`flex-row items-center justify-between px-10 pt-8 ${Platform.OS === 'ios' ? 'pb-10' : 'pb-8'}`}
        >
          {/* Gallery Button */}
          <TouchableOpacity
            onPress={pickImage}
            className="items-center gap-2 active:scale-95"
          >
            <View className="w-14 h-14 rounded-full bg-white/15 items-center justify-center">
              <Ionicons name="images" size={24} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold">Gallery</Text>
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            onPress={takePicture}
            disabled={isCapturing}
            className="items-center gap-2 active:scale-95"
          >
            <View className="w-20 h-20 rounded-full bg-white items-center justify-center shadow-2xl">
              <View 
                className="w-[68px] h-[68px] rounded-full bg-blue-600"
                style={{
                  backgroundColor: isCapturing ? '#1D4ED8' : '#3B82F6',
                  transform: [{ scale: isCapturing ? 0.9 : 1 }]
                }}
              />
            </View>
            <Text className="text-white text-sm font-bold">Capture</Text>
          </TouchableOpacity>

          {/* Auto Button */}
          <TouchableOpacity
            className="items-center gap-2 opacity-50 active:scale-95"
          >
            <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center">
              <Ionicons name="flash-outline" size={24} color="#9CA3AF" />
            </View>
            <Text className="text-gray-400 text-xs font-semibold">Auto</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}