import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

type Language = {
  code: string;
  name: string;
  flag: string;
};

export default function TranslatorScreen() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);

  const languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  ];

  const translateText = async () => {
    if (!sourceText.trim()) {
      Alert.alert('Error', 'Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Using LibreTranslate free API
      const response = await fetch('https://libretranslate.de/translate', {
        method: 'POST',
        body: JSON.stringify({
          q: sourceText,
          source: sourceLang,
          target: targetLang,
          format: 'text',
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();
      
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Error', 'Failed to translate. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const handleSwapLanguages = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const LanguageSelector = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: string; 
    onChange: (code: string) => void; 
    label: string;
  }) => {
    const [showPicker, setShowPicker] = useState(false);
    const selected = languages.find(l => l.code === value);

    return (
      <View className="flex-1">
        <Text className="text-gray-600 font-semibold mb-2 text-sm">{label}</Text>
        <TouchableOpacity
          onPress={() => {
            setShowPicker(!showPicker);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          className="bg-white border-2 border-gray-200 rounded-xl p-3 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">{selected?.flag}</Text>
            <Text className="text-gray-900 font-bold">{selected?.name}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>

        {showPicker && (
          <View className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 z-10 max-h-64">
            <ScrollView>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  onPress={() => {
                    onChange(lang.code);
                    setShowPicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`p-3 flex-row items-center ${
                    lang.code === value ? 'bg-blue-50' : ''
                  }`}
                >
                  <Text className="text-2xl mr-3">{lang.flag}</Text>
                  <Text className={`font-semibold ${
                    lang.code === value ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {lang.name}
                  </Text>
                  {lang.code === value && (
                    <Ionicons name="checkmark" size={20} color="#3B82F6" className="ml-auto" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

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
              <Text className="text-gray-900 text-xl font-bold">Translator</Text>
              <Text className="text-gray-500 text-sm">Translate to any language</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Language Selectors */}
        <View className="flex-row items-center gap-3 mb-4">
          <LanguageSelector
            value={sourceLang}
            onChange={setSourceLang}
            label="From"
          />
          
          <TouchableOpacity
            onPress={handleSwapLanguages}
            className="bg-blue-600 w-12 h-12 rounded-xl items-center justify-center mt-6"
          >
            <Ionicons name="swap-horizontal" size={24} color="white" />
          </TouchableOpacity>

          <LanguageSelector
            value={targetLang}
            onChange={setTargetLang}
            label="To"
          />
        </View>

        {/* Source Text Input */}
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-bold">Enter Text</Text>
            <TouchableOpacity
              onPress={() => handleCopy(sourceText)}
              disabled={!sourceText}
              className="flex-row items-center"
            >
              <Ionicons name="copy-outline" size={18} color={sourceText ? "#3B82F6" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={sourceText}
            onChangeText={setSourceText}
            placeholder="Type or paste text to translate..."
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-gray-900 text-base min-h-[120px]"
            textAlignVertical="top"
          />
          <Text className="text-gray-400 text-xs mt-2">
            {sourceText.length} characters
          </Text>
        </View>

        {/* Translate Button */}
        <TouchableOpacity
          onPress={translateText}
          disabled={isTranslating || !sourceText.trim()}
          className={`py-4 rounded-2xl flex-row items-center justify-center mb-4 ${
            isTranslating || !sourceText.trim() ? 'bg-gray-300' : 'bg-blue-600'
          }`}
        >
          {isTranslating ? (
            <>
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold ml-2">Translating...</Text>
            </>
          ) : (
            <>
              <Ionicons name="language" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Translate</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Translated Text Output */}
        {translatedText && (
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-bold">Translation</Text>
              <TouchableOpacity
                onPress={() => handleCopy(translatedText)}
                className="flex-row items-center"
              >
                <Ionicons name="copy-outline" size={18} color="#3B82F6" />
                <Text className="text-blue-600 font-semibold ml-1 text-sm">Copy</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-gray-900 text-base leading-6">
              {translatedText}
            </Text>
          </View>
        )}

        {/* Info */}
        <View className="bg-blue-50 rounded-2xl p-4 mt-4">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text className="text-blue-900 font-bold ml-2">Free Translation</Text>
          </View>
          <Text className="text-blue-700 text-sm">
            Powered by LibreTranslate - a free and open-source translation service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}