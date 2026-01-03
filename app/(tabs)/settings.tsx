import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [autoSave, setAutoSave] = useState(true);
  const [highQuality, setHighQuality] = useState(true);
  const [autoEnhance, setAutoEnhance] = useState(false);

  const SettingRow = ({ 
    iconName,
    iconComponent: IconComponent = Ionicons,
    title, 
    subtitle, 
    value, 
    onValueChange,
    onPress,
    showArrow = false,
  }: { 
    iconName: string;
    iconComponent?: any;
    title: string; 
    subtitle?: string; 
    value?: boolean; 
    onValueChange?: (val: boolean) => void;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      className="bg-white px-6 py-4 flex-row items-center justify-between active:bg-gray-50"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View className="flex-row items-center gap-4 flex-1">
        <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center">
          <IconComponent name={iconName} size={22} color="#3b82f6" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{title}</Text>
          {subtitle && (
            <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {onValueChange && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#f3f4f6'}
          ios_backgroundColor="#e5e7eb"
        />
      )}
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-6 py-3 bg-gray-50">
      <Text className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-gray-900 text-2xl font-bold">Settings</Text>
            <Text className="text-gray-500 text-sm mt-0.5">Customize your experience</Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Scanning Settings */}
        <SectionHeader title="Scanning" />
        <View className="mb-3">
          <SettingRow
            iconName="save-outline"
            title="Auto Save"
            subtitle="Automatically save scanned documents"
            value={autoSave}
            onValueChange={setAutoSave}
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="camera-outline"
            title="High Quality"
            subtitle="Use maximum image quality"
            value={highQuality}
            onValueChange={setHighQuality}
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="sparkles-outline"
            title="Auto Enhance"
            subtitle="Automatically enhance scanned images"
            value={autoEnhance}
            onValueChange={setAutoEnhance}
          />
        </View>

        {/* Storage */}
        <SectionHeader title="Storage" />
        <View className="mb-3">
          <View className="bg-white px-6 py-5">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-4">
                <View className="bg-blue-50 w-10 h-10 rounded-xl items-center justify-center">
                  <Ionicons name="folder-open-outline" size={22} color="#3b82f6" />
                </View>
                <View>
                  <Text className="text-gray-900 font-semibold text-base">Storage Used</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">0 MB of unlimited</Text>
                </View>
              </View>
            </View>
            <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <View className="bg-blue-600 h-full w-0" />
            </View>
          </View>
          <View className="h-px bg-gray-100 ml-6" />
          <SettingRow
            iconName="trash-outline"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* Help & Support */}
        <SectionHeader title="Help & Support" />
        <View className="mb-3">
          <SettingRow
            iconName="help-circle-outline"
            title="Help Center"
            onPress={() => {}}
            showArrow
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="chatbubble-outline"
            title="Contact Support"
            onPress={() => {}}
            showArrow
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="star-outline"
            title="Rate App"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View className="mb-3">
          <SettingRow
            iconName="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="document-text-outline"
            title="Terms of Service"
            onPress={() => {}}
            showArrow
          />
          <View className="h-px bg-gray-100 ml-20" />
          <SettingRow
            iconName="lock-closed-outline"
            title="Privacy Policy"
            onPress={() => {}}
            showArrow
          />
        </View>

        {/* App Info */}
        <View className="px-6 py-8 items-center">
          <View className="bg-blue-50 w-16 h-16 rounded-2xl items-center justify-center mb-3">
            <Ionicons name="document-text" size={32} color="#3b82f6" />
          </View>
          <Text className="text-gray-900 font-bold text-lg mb-1">ScanView</Text>
          <Text className="text-gray-500 text-sm">Modern Document Scanner</Text>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}