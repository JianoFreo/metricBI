import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/common/context/auth.context';
import { Button, Input, ErrorMessage } from '@/common/components';

/**
 * Register Screen
 */
export default function RegisterScreen() {
  const { register, isLoading, error } = useAuth();
  const [companyId, setCompanyId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleRegister = async () => {
    if (!companyId || !firstName || !lastName || !email || !password || !confirmPassword) {
      setFormError('Company ID, name, email and password are required');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        companyId,
        firstName,
        lastName,
        email,
        password,
      });
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const displayError = formError || error;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>Create Account</Text>
          <Text style={styles.subtitle}>Join MetricBI today</Text>
        </View>

        {displayError && (
          <ErrorMessage
            message={displayError}
            onDismiss={() => setFormError('')}
          />
        )}

        <View style={styles.formContainer}>
          <Input
            label="Company ID"
            placeholder="your-company-id"
            value={companyId}
            onChangeText={setCompanyId}
            autoCapitalize="none"
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="First Name"
            placeholder="John"
            value={firstName}
            onChangeText={setFirstName}
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChangeText={setLastName}
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Input
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
            containerStyle={styles.inputContainer}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
          />

          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable hitSlop={10} style={styles.signinLinkButton}>
              <Text style={styles.signinLink}>Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 32,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  formContainer: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signinText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signinLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  signinLinkButton: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
});
