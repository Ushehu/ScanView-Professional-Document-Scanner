import { View, Text, TextInput, TouchableOpacity, Alert, Share, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';

export default function TextEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [text, setText] = useState(params.text as string || '');
  const [isSaved, setIsSaved] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const handleUndo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Undo', 'Undo feature coming soon!');
  };

  const handleRedo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Redo', 'Redo feature coming soon!');
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const handlePaste = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    setText(text + clipboardText);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear all text?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setText('') },
      ]
    );
  };

  const handleSave = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const fileName = `edited-text-${Date.now()}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, text);
      
      setIsSaved(true);
      
      Alert.alert(
        'Saved',
        'Text saved successfully!',
        [
          { text: 'OK' },
          { text: 'Share', onPress: handleShare },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save text');
    }
  };

  const handleShare = async () => {
    await Share.share({ message: text });
  };

  const ToolButton = ({ icon, label, onPress, color = '#3B82F6' }: {
    icon: any;
    label: string;
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="items-center"
      style={{ minWidth: 70 }}
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mb-1"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text className="text-gray-700 text-xs font-medium">{label}</Text>
    </TouchableOpacity>
  );

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
              <Text className="text-gray-900 text-xl font-bold">Text Editor</Text>
              <Text className="text-gray-500 text-sm">
                {wordCount} words • {charCount} chars
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            {isSaved && (
              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 text-xs font-bold">Saved ✓</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-600 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-bold text-sm">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Toolbar */}
      <View className="bg-white border-b border-gray-100">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 16 }}
        >
          <ToolButton icon="copy-outline" label="Copy" onPress={handleCopy} />
          <ToolButton icon="clipboard-outline" label="Paste" onPress={handlePaste} />
          <ToolButton icon="arrow-undo" label="Undo" onPress={handleUndo} color="#8B5CF6" />
          <ToolButton icon="arrow-redo" label="Redo" onPress={handleRedo} color="#8B5CF6" />
          <ToolButton icon="share-outline" label="Share" onPress={handleShare} color="#10B981" />
          <ToolButton icon="trash-outline" label="Clear" onPress={handleClear} color="#EF4444" />
        </ScrollView>
      </View>

      {/* Text Editor */}
      <View className="flex-1 p-4">
        <View className="bg-white rounded-2xl flex-1 overflow-hidden">
          <TextInput
            value={text}
            onChangeText={(newText) => {
              setText(newText);
              setIsSaved(false);
            }}
            placeholder="Start typing or paste text here..."
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            className="flex-1 p-4 text-gray-900 text-base"
            style={{
              fontFamily: 'System',
              lineHeight: 24,
            }}
          />
        </View>
      </View>

      {/* Quick Stats */}
      {text && (
        <View className="bg-white border-t border-gray-100 px-6 py-3">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-gray-500 text-xs">Words</Text>
              <Text className="text-gray-900 font-bold text-lg">{wordCount}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs">Characters</Text>
              <Text className="text-gray-900 font-bold text-lg">{charCount}</Text>
            </View>
            <View className="w-px bg-gray-200" />
            <View className="items-center">
              <Text className="text-gray-500 text-xs">Lines</Text>
              <Text className="text-gray-900 font-bold text-lg">
                {text.split('\n').length}
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}