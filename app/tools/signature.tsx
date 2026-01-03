import { View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Point = { x: number; y: number };

export default function SignatureScreen() {
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleGestureEvent = (event: any) => {
    const { x, y } = event.nativeEvent;
    
    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    } else {
      setCurrentPath([...currentPath, { x, y }]);
    }
  };

  const handleGestureEnd = () => {
    if (currentPath.length > 0) {
      setPaths([...paths, currentPath]);
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaths([]);
    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (paths.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPaths(paths.slice(0, -1));
    }
  };

  const handleSave = async () => {
    if (paths.length === 0) {
      Alert.alert('Empty Signature', 'Please draw your signature first');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Alert.alert(
        'Save Signature',
        'Signature saving requires additional setup.\n\nFor now, you can use the signature preview.',
        [{ text: 'OK' }]
      );

      // IMPLEMENTATION NOTE:
      // To capture and save the signature:
      /*
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        const fileName = `signature-${Date.now()}.png`;
        const destination = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.copyAsync({
          from: uri,
          to: destination,
        });
        
        Alert.alert('Saved', 'Signature saved successfully');
      }
      */
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save signature');
    }
  };

  const handleShare = async () => {
    if (paths.length === 0) {
      Alert.alert('Empty Signature', 'Please draw your signature first');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Share Signature',
      'Signature sharing requires react-native-view-shot package.\n\nInstall it with:\nnpm install react-native-view-shot',
      [{ text: 'OK' }]
    );
  };

  const pathToSvgPath = (points: Point[]) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const allPaths = [...paths];
  if (currentPath.length > 0) {
    allPaths.push(currentPath);
  }

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
              <Text className="text-gray-900 text-xl font-bold">Signature Tool</Text>
              <Text className="text-gray-500 text-sm">Draw your signature</Text>
            </View>
          </View>
          <View className="bg-purple-100 px-3 py-1 rounded-full">
            <Text className="text-purple-700 font-bold text-xs">PRO</Text>
          </View>
        </View>
      </View>

      {/* Signature Canvas */}
      <View className="flex-1 p-4">
        <View className="bg-white rounded-2xl flex-1 overflow-hidden">
          {/* Instructions */}
          <View className="bg-purple-50 px-4 py-3 border-b border-purple-100">
            <View className="flex-row items-center">
              <Ionicons name="create" size={20} color="#A855F7" />
              <Text className="text-purple-900 font-semibold ml-2">
                Sign below with your finger
              </Text>
            </View>
          </View>

          {/* Drawing Area */}
          <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
              onGestureEvent={handleGestureEvent}
              onEnded={handleGestureEnd}
            >
              <View className="flex-1 bg-white">
                <Svg width={SCREEN_WIDTH - 32} height="100%" style={{ position: 'absolute' }}>
                  {allPaths.map((path, index) => (
                    <Path
                      key={index}
                      d={pathToSvgPath(path)}
                      stroke="#000000"
                      strokeWidth={3}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </Svg>

                {/* Empty State */}
                {paths.length === 0 && currentPath.length === 0 && (
                  <View className="flex-1 items-center justify-center">
                    <Ionicons name="pencil-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 mt-4 text-lg">Draw your signature here</Text>
                  </View>
                )}

                {/* Signature Line */}
                <View className="absolute bottom-12 left-8 right-8 h-px bg-gray-300" />
              </View>
            </PanGestureHandler>
          </GestureHandlerRootView>
        </View>
      </View>

      {/* Toolbar */}
      <View className="bg-white border-t border-gray-100 px-4 py-4">
        <View className="flex-row justify-around mb-3">
          <TouchableOpacity
            onPress={handleUndo}
            disabled={paths.length === 0}
            className={`items-center ${paths.length === 0 ? 'opacity-40' : ''}`}
          >
            <View className="bg-gray-100 w-14 h-14 rounded-2xl items-center justify-center">
              <Ionicons name="arrow-undo" size={24} color="#374151" />
            </View>
            <Text className="text-gray-700 text-xs mt-1 font-medium">Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClear}
            disabled={paths.length === 0}
            className={`items-center ${paths.length === 0 ? 'opacity-40' : ''}`}
          >
            <View className="bg-red-50 w-14 h-14 rounded-2xl items-center justify-center">
              <Ionicons name="trash" size={24} color="#EF4444" />
            </View>
            <Text className="text-gray-700 text-xs mt-1 font-medium">Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            disabled={paths.length === 0}
            className={`items-center ${paths.length === 0 ? 'opacity-40' : ''}`}
          >
            <View className="bg-blue-50 w-14 h-14 rounded-2xl items-center justify-center">
              <Ionicons name="share" size={24} color="#3B82F6" />
            </View>
            <Text className="text-gray-700 text-xs mt-1 font-medium">Share</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={paths.length === 0}
          className={`py-4 rounded-2xl flex-row items-center justify-center ${
            paths.length === 0 ? 'bg-gray-300' : 'bg-purple-600'
          }`}
        >
          <Ionicons name="save" size={20} color="white" />
          <Text className="text-white font-bold ml-2">Save Signature</Text>
        </TouchableOpacity>

        {/* Package Info */}
        <View className="bg-purple-50 rounded-xl p-3 mt-3">
          <Text className="text-purple-700 text-xs text-center">
            💡 Full signature capture requires react-native-view-shot and react-native-gesture-handler
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}