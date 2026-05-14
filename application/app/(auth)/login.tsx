import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/common/context/auth.context';
import { Button, Input, ErrorMessage } from '@/common/components';

/**
 * Login Screen
 */
export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();
  const [companyId, setCompanyId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleLogin = async () => {
    if (!companyId || !email || !password) {
      setFormError('Company ID, email and password are required');
      return;
    }

    try {
      await login({ companyId, email, password });
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>MetricBI</Text>
          <Text style={styles.subtitle}>Business Intelligence Dashboard</Text>
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

          <Button
            title="Sign In"
            onPress={handleLogin}
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Text style={styles.signupLink}>Sign up</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 MetricBI. All rights reserved.</Text>
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
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4F46E5',
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
  loginButton: {
    marginTop: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
