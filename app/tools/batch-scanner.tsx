import { View, Text, TouchableOpacity, Image, Alert, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useDocuments } from '@/hooks/useDocuments';
import { Page } from '@/types';

export default function BatchScannerScreen() {
  const router = useRouter();
  const { createDocument } = useDocuments();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedPages, setScannedPages] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [flash, setFlash] = useState(false);
  const [documentName, setDocumentName] = useState('');

  useState(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  });

  const capturePhoto = async () => {
    try {
      if (!hasPermission) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Simulate camera capture (in real implementation, use camera.takePictureAsync())
      Alert.alert(
        'Camera Capture',
        'In a real implementation, this would capture from the camera.\n\nFor demo, would you like to pick an image from gallery?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pick Image',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
              });

              if (!result.canceled && result.assets[0]) {
                setScannedPages([...scannedPages, result.assets[0].uri]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const removePage = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScannedPages(scannedPages.filter((_, i) => i !== index));
  };

  const handleSaveDocument = async () => {
    if (scannedPages.length === 0) {
      Alert.alert('No Pages', 'Please scan at least one page');
      return;
    }

    if (!documentName.trim()) {
      Alert.alert('Document Name', 'Please enter a name for your document');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const pages: Page[] = scannedPages.map((uri, index) => ({
        id: index.toString(),
        uri: uri,
        timestamp: Date.now(),
      }));

      await createDocument(documentName.trim(), pages);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        '✅ Success',
        `Saved document with ${scannedPages.length} pages`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save document');
    }
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-600">Requesting camera permission...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="bg-red-100 w-20 h-20 rounded-full items-center justify-center mb-4">
          <Ionicons name="videocam-off" size={40} color="#EF4444" />
        </View>
        <Text className="text-gray-900 text-xl font-bold mb-2">Camera Access Required</Text>
        <Text className="text-gray-500 text-center mb-6">
          Please enable camera access to use batch scanner
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {isCameraActive ? (
        // Camera View
        <View className="flex-1">
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            enableTorch={flash}
          >
            {/* Header */}
            <SafeAreaView className="absolute top-0 left-0 right-0">
              <View className="px-6 py-4 bg-black/50 backdrop-blur-md">
                <View className="flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <Text className="text-white text-xl font-bold">Batch Scanner</Text>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setFlash(!flash);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                  >
                    <Ionicons name={flash ? "flash" : "flash-off"} size={24} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Page Counter */}
                <View className="mt-4 bg-teal-500/30 backdrop-blur-sm border border-teal-400/50 px-4 py-2 rounded-xl self-center">
                  <Text className="text-white font-bold text-lg">
                    📄 {scannedPages.length} {scannedPages.length === 1 ? 'page' : 'pages'} scanned
                  </Text>
                </View>
              </View>
            </SafeAreaView>

            {/* Scanning Frame */}
            <View className="flex-1 items-center justify-center">
              <View className="w-64 h-80 border-4 border-white/30 rounded-3xl">
                <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
              </View>
              <Text className="text-white text-center mt-6 text-base font-semibold">
                Position document within frame
              </Text>
            </View>

            {/* Bottom Controls */}
            <View className="absolute bottom-0 left-0 right-0 pb-8">
              <View className="flex-row items-center justify-around px-6">
                {/* View Pages */}
                <TouchableOpacity
                  onPress={() => setIsCameraActive(false)}
                  className="items-center"
                  disabled={scannedPages.length === 0}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                    scannedPages.length > 0 ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    <Ionicons name="images" size={28} color="white" />
                    {scannedPages.length > 0 && (
                      <View className="absolute -top-2 -right-2 bg-teal-500 w-6 h-6 rounded-full items-center justify-center">
                        <Text className="text-white text-xs font-bold">{scannedPages.length}</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-white text-xs mt-2">View</Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  onPress={capturePhoto}
                  className="w-20 h-20 rounded-full bg-white items-center justify-center"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <View className="w-16 h-16 rounded-full bg-teal-500" />
                </TouchableOpacity>

                {/* Done Button */}
                <TouchableOpacity
                  onPress={() => setIsCameraActive(false)}
                  className="items-center"
                  disabled={scannedPages.length === 0}
                >
                  <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                    scannedPages.length > 0 ? 'bg-teal-500' : 'bg-white/10'
                  }`}>
                    <Ionicons name="checkmark" size={28} color="white" />
                  </View>
                  <Text className="text-white text-xs mt-2">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      ) : (
        // Review Pages View
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="bg-white px-6 py-4 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setIsCameraActive(true)}
                  className="mr-4"
                >
                  <Ionicons name="arrow-back" size={24} color="#3B82F6" />
                </TouchableOpacity>
                <View>
                  <Text className="text-gray-900 text-xl font-bold">Review Pages</Text>
                  <Text className="text-gray-500 text-sm">{scannedPages.length} pages</Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 p-4">
            {/* Document Name */}
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-2">Document Name</Text>
              <TextInput
                value={documentName}
                onChangeText={setDocumentName}
                placeholder="Enter document name..."
                placeholderTextColor="#9CA3AF"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 text-base"
              />
            </View>

            {/* Pages */}
            <Text className="text-gray-900 font-bold mb-3">Scanned Pages</Text>
            {scannedPages.map((uri, index) => (
              <View key={index} className="bg-white rounded-2xl p-3 mb-3 flex-row items-center">
                <View className="bg-teal-50 px-2 py-1 rounded-lg mr-3">
                  <Text className="text-teal-600 font-bold">{index + 1}</Text>
                </View>
                
                <Image
                  source={{ uri }}
                  className="w-16 h-20 rounded-lg mr-3"
                  resizeMode="cover"
                />
                
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold">Page {index + 1}</Text>
                  <Text className="text-gray-500 text-sm">Tap to edit</Text>
                </View>

                <TouchableOpacity
                  onPress={() => removePage(index)}
                  className="bg-red-50 w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add More */}
            <TouchableOpacity
              onPress={() => setIsCameraActive(true)}
              className="bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="add-circle" size={20} color="#374151" />
              <Text className="text-gray-700 font-bold ml-2">Scan More Pages</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Save Button */}
          <View className="bg-white border-t border-gray-100 p-4">
            <TouchableOpacity
              onPress={handleSaveDocument}
              className="bg-teal-600 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="save" size={20} color="white" />
              <Text className="text-white font-bold ml-2">
                Save Document ({scannedPages.length} pages)
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}