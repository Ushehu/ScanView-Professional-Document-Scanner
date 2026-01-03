import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ActionButton({
  icon,
  onPress,
  style,
  size = 28,
  color = 'white',
  backgroundColor = '#3B82F6',
}: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});