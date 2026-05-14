import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const variantStyles = {
    primary: {
      backgroundColor: '#4F46E5',
      borderColor: '#4F46E5',
    },
    secondary: {
      backgroundColor: '#E5E7EB',
      borderColor: '#E5E7EB',
    },
    danger: {
      backgroundColor: '#EF4444',
      borderColor: '#EF4444',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#4F46E5',
    },
  };

  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 10,
    },
  };

  const textColors = {
    primary: '#FFFFFF',
    secondary: '#000000',
    danger: '#FFFFFF',
    outline: '#4F46E5',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={[
        styles.button,
        {
          ...variantStyles[variant],
          ...sizeStyles[size],
          opacity: disabled || isLoading ? 0.6 : 1,
          borderWidth: variant === 'outline' ? 2 : 0,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: textColors[variant],
              fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
  },
});
