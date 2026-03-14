import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => { setError(null); setSuccess(null); };

  const handleRegister = async () => {
    clearMessages();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSuccess('Account created! Check your email for a confirmation link.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 py-12">
          <View className="items-center mb-10">
            <View className="w-16 h-16 bg-brand-blue rounded-2xl items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">P</Text>
            </View>
            <Text className="text-3xl font-bold text-brand-navy">Create Account</Text>
            <Text className="text-slate-500 mt-2 text-center">
              Start your exam preparation journey
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {error && (
              <View className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}
            {success && (
              <View className="bg-green-50 rounded-xl p-3 mb-4 border border-green-200">
                <Text className="text-green-700 text-sm">{success}</Text>
              </View>
            )}

            <Text className="text-sm font-medium text-slate-600 mb-2">Full Name</Text>
            <TextInput
              className="bg-slate-50 rounded-xl px-4 py-3 text-base text-brand-navy mb-4 border border-slate-200"
              placeholder="Your full name"
              placeholderTextColor="#94a3b8"
              value={fullName}
              onChangeText={(t: string) => { setFullName(t); clearMessages(); }}
            />

            <Text className="text-sm font-medium text-slate-600 mb-2">Email</Text>
            <TextInput
              className="bg-slate-50 rounded-xl px-4 py-3 text-base text-brand-navy mb-4 border border-slate-200"
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={(t: string) => { setEmail(t); clearMessages(); }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text className="text-sm font-medium text-slate-600 mb-2">Password</Text>
            <TextInput
              className="bg-slate-50 rounded-xl px-4 py-3 text-base text-brand-navy mb-6 border border-slate-200"
              placeholder="At least 6 characters"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={(t: string) => { setPassword(t); clearMessages(); }}
              secureTextEntry
            />

            <TouchableOpacity
              className="bg-brand-blue rounded-xl py-4 items-center"
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-brand-blue font-semibold">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
