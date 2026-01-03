import { View, Text, TextInput, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

export default function WordCounterScreen() {
  const router = useRouter();
  const [text, setText] = useState('');

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\n+/).filter(p => p.trim()).length : 0;
  const readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min

  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setText('');
  };

  const handlePaste = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const clipboardText = await Clipboard.getStringAsync();
    setText(clipboardText);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const stats = `Word Counter Results:\n\n` +
      `Words: ${words}\n` +
      `Characters: ${characters}\n` +
      `Characters (no spaces): ${charactersNoSpaces}\n` +
      `Sentences: ${sentences}\n` +
      `Paragraphs: ${paragraphs}\n` +
      `Reading time: ${readingTime} min`;
    
    await Share.share({ message: stats });
  };

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) => (
    <View className="bg-white rounded-2xl p-4 flex-1" style={{ minWidth: '45%' }}>
      <View className="flex-row items-center justify-between mb-2">
        <View className={`w-10 h-10 rounded-xl items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
      </View>
      <Text className="text-gray-500 text-sm font-medium">{label}</Text>
      <Text className="text-gray-900 text-2xl font-bold mt-1">{value.toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#3B82F6" />
            </TouchableOpacity>
            <View>
              <Text className="text-gray-900 text-xl font-bold">Word Counter</Text>
              <Text className="text-gray-500 text-sm">Count words & characters</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleShare}
            disabled={!text}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              text ? 'bg-blue-50' : 'bg-gray-100'
            }`}
          >
            <Ionicons name="share-outline" size={20} color={text ? "#3B82F6" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Stats Grid */}
        <View className="p-4">
          <View className="flex-row flex-wrap gap-3 mb-4">
            <StatCard icon="text" label="Words" value={words} color="#3B82F6" />
            <StatCard icon="list" label="Characters" value={characters} color="#8B5CF6" />
            <StatCard icon="create" label="No Spaces" value={charactersNoSpaces} color="#10B981" />
            <StatCard icon="document-text" label="Sentences" value={sentences} color="#F59E0B" />
            <StatCard icon="albums" label="Paragraphs" value={paragraphs} color="#EC4899" />
            <StatCard icon="time" label="Reading (min)" value={readingTime} color="#06B6D4" />
          </View>

          {/* Text Input Area */}
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-bold text-base">Enter Text</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handlePaste}
                  className="bg-blue-50 px-3 py-1.5 rounded-lg flex-row items-center"
                >
                  <Ionicons name="clipboard" size={16} color="#3B82F6" />
                  <Text className="text-blue-600 font-semibold text-sm ml-1">Paste</Text>
                </TouchableOpacity>
                {text && (
                  <TouchableOpacity
                    onPress={handleClear}
                    className="bg-red-50 px-3 py-1.5 rounded-lg flex-row items-center"
                  >
                    <Ionicons name="trash" size={16} color="#EF4444" />
                    <Text className="text-red-600 font-semibold text-sm ml-1">Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type or paste your text here to count words, characters, and more..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="bg-gray-50 rounded-xl p-4 text-gray-900 text-base min-h-[200px]"
              style={{ fontFamily: 'System' }}
            />
          </View>

          {/* Quick Info */}
          {text && (
            <View className="bg-blue-50 rounded-2xl p-4 mt-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-900 font-bold ml-2">Quick Stats</Text>
              </View>
              <Text className="text-blue-700 text-sm leading-5">
                • Average word length: {words > 0 ? (charactersNoSpaces / words).toFixed(1) : 0} characters{'\n'}
                • Average sentence length: {sentences > 0 ? (words / sentences).toFixed(1) : 0} words{'\n'}
                • Estimated speaking time: {Math.ceil(words / 130)} minutes (at 130 words/min)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}