import { View, Text, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export default function QRScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState<string>('');
  const [torchOn, setTorchOn] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'QR Code Scanned',
        data,
        [
          { text: 'Copy', onPress: () => handleCopy(data) },
          { text: 'Share', onPress: () => handleShare(data) },
          { text: 'Open', onPress: () => handleOpen(data) },
          { text: 'Scan Again', onPress: () => setScanned(false), style: 'cancel' },
        ]
      );
    }
  };

  const handleCopy = async (data: string) => {
    await Clipboard.setStringAsync(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'QR code content copied to clipboard');
  };

  const handleShare = async (data: string) => {
    await Share.share({ message: data });
  };

  const handleOpen = async (data: string) => {
    if (data.startsWith('http://') || data.startsWith('https://')) {
      const canOpen = await Linking.canOpenURL(data);
      if (canOpen) {
        await Linking.openURL(data);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } else {
      Alert.alert('Not a URL', 'This QR code does not contain a valid URL');
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
          Please enable camera access in your device settings to scan QR codes
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
      {/* Camera View */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'pdf417'],
        }}
        enableTorch={torchOn}
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
              
              <Text className="text-white text-xl font-bold">Scan QR Code</Text>
              
              <TouchableOpacity
                onPress={() => {
                  setTorchOn(!torchOn);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              >
                <Ionicons name={torchOn ? "flash" : "flash-off"} size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Scanning Frame */}
        <View className="flex-1 items-center justify-center">
          <View className="relative">
            {/* Corner Borders */}
            <View className="w-64 h-64 border-4 border-white/30 rounded-3xl">
              {/* Top Left */}
              <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              {/* Top Right */}
              <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              {/* Bottom Left */}
              <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              {/* Bottom Right */}
              <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
            </View>

            {/* Scanning Line Animation */}
            {!scanned && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-56 h-1 bg-blue-500 opacity-75" />
              </View>
            )}
          </View>

          {/* Instructions */}
          <View className="mt-8 px-8">
            <Text className="text-white text-center text-base font-semibold mb-2">
              {scanned ? '✓ QR Code Scanned!' : 'Position QR code within frame'}
            </Text>
            <Text className="text-white/70 text-center text-sm">
              {scanned ? 'Check the alert above' : 'The scanner will detect it automatically'}
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        {scanned && (
          <View className="absolute bottom-0 left-0 right-0 pb-8">
            <View className="mx-6">
              <TouchableOpacity
                onPress={() => setScanned(false)}
                className="bg-blue-600 py-4 rounded-2xl flex-row items-center justify-center"
              >
                <Ionicons name="scan" size={20} color="white" />
                <Text className="text-white font-bold text-base ml-2">Scan Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </CameraView>
    </View>
  );
}