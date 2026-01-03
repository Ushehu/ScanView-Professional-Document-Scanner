import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';

export default function ImageCompressorScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string>('');
  const [compressedUri, setCompressedUri] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<number>(0.7);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setCompressedUri('');
      
      // Get original file size
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if ('size' in fileInfo && fileInfo.size) {
        setOriginalSize(fileInfo.size);
      }
    }
  };

  const compressImage = async () => {
    if (!imageUri) return;

    try {
      setIsCompressing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const compressed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1920 } }],
        {
          compress: compressionLevel,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      setCompressedUri(compressed.uri);

      // Get compressed file size
      const fileInfo = await FileSystem.getInfoAsync(compressed.uri);
      if ('size' in fileInfo && fileInfo.size) {
        setCompressedSize(fileInfo.size);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Compression error:', error);
      Alert.alert('Error', 'Failed to compress image');
    } finally {
      setIsCompressing(false);
    }
  };

  const shareImage = async () => {
    if (!compressedUri) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const canShare = await Sharing.isAvailableAsync();
    
    if (canShare) {
      await Sharing.shareAsync(compressedUri);
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const savedPercentage = originalSize && compressedSize
    ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-900 text-xl font-bold">Image Compressor</Text>
              <Text className="text-gray-500 text-sm">Reduce file size</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 p-6">
        {!imageUri ? (
          // Empty State
          <View className="flex-1 items-center justify-center">
            <View className="bg-blue-50 w-24 h-24 rounded-full items-center justify-center mb-6">
              <Ionicons name="image" size={48} color="#3B82F6" />
            </View>
            <Text className="text-gray-900 text-xl font-bold mb-2">Select an Image</Text>
            <Text className="text-gray-500 text-center mb-8">
              Choose an image from your gallery to compress
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-blue-600 px-8 py-4 rounded-2xl flex-row items-center"
            >
              <Ionicons name="images" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Pick Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Image Preview & Controls
          <View className="flex-1">
            {/* Image Preview */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-3">Preview</Text>
              <Image
                source={{ uri: compressedUri || imageUri }}
                className="w-full h-64 rounded-xl"
                resizeMode="contain"
              />
            </View>

            {/* Stats */}
            {compressedUri && (
              <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-gray-900 font-bold mb-3">Compression Results</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-600">Original Size</Text>
                    <Text className="text-gray-900 font-bold">{formatFileSize(originalSize)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-600">Compressed Size</Text>
                    <Text className="text-gray-900 font-bold">{formatFileSize(compressedSize)}</Text>
                  </View>
                  <View className="h-px bg-gray-200" />
                  <View className="flex-row justify-between items-center py-2">
                    <Text className="text-gray-900 font-bold">Saved</Text>
                    <View className="bg-green-100 px-3 py-1 rounded-full">
                      <Text className="text-green-700 font-bold">{savedPercentage}%</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Compression Level */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-3">Compression Quality</Text>
              <View className="flex-row justify-between mb-2">
                {[
                  { level: 0.3, label: 'Low' },
                  { level: 0.5, label: 'Medium' },
                  { level: 0.7, label: 'High' },
                  { level: 0.9, label: 'Best' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    onPress={() => {
                      setCompressionLevel(option.level);
                      setCompressedUri('');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className={`flex-1 mx-1 py-3 rounded-xl items-center ${
                      compressionLevel === option.level
                        ? 'bg-blue-600'
                        : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`font-bold text-sm ${
                        compressionLevel === option.level ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text className="text-gray-500 text-xs text-center mt-2">
                Lower quality = smaller file size
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={compressImage}
                disabled={isCompressing}
                className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
              >
                {isCompressing ? (
                  <>
                    <ActivityIndicator color="white" />
                    <Text className="text-white font-bold ml-2">Compressing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="contract" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">
                      {compressedUri ? 'Compress Again' : 'Compress Image'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {compressedUri && (
                <TouchableOpacity
                  onPress={shareImage}
                  className="bg-green-600 py-4 rounded-2xl flex-row items-center justify-center"
                >
                  <Ionicons name="share" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Share Compressed Image</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={pickImage}
                className="bg-gray-200 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="images" size={20} color="#374151" />
                <Text className="text-gray-700 font-bold ml-2">Pick Another Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}