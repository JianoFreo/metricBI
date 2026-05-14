import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
    {onDismiss && (
      <Text style={styles.dismissText} onPress={onDismiss}>
        Dismiss
      </Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dismissText: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
