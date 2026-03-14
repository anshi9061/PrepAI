import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 justify-center px-8">
        <View className="items-center mb-12">
          <View className="w-16 h-16 bg-brand-blue rounded-2xl items-center justify-center mb-4">
            <Text className="text-white text-2xl font-bold">P</Text>
          </View>
          <Text className="text-3xl font-bold text-brand-navy">PREP AI</Text>
          <Text className="text-slate-500 mt-2 text-center">
            AI-powered exam preparation
          </Text>
        </View>

        <View className="bg-white rounded-2xl p-6 shadow-sm">
          {error && (
            <View className="bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
              <Text className="text-red-600 text-sm">{error}</Text>
            </View>
          )}

          <Text className="text-sm font-medium text-slate-600 mb-2">Email</Text>
          <TextInput
            className="bg-slate-50 rounded-xl px-4 py-3 text-base text-brand-navy mb-4 border border-slate-200"
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={(t: string) => { setEmail(t); setError(null); }}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="text-sm font-medium text-slate-600 mb-2">Password</Text>
          <TextInput
            className="bg-slate-50 rounded-xl px-4 py-3 text-base text-brand-navy mb-6 border border-slate-200"
            placeholder="Your password"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={(t: string) => { setPassword(t); setError(null); }}
            secureTextEntry
          />

          <TouchableOpacity
            className="bg-brand-blue rounded-xl py-4 items-center"
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-500">Don&apos;t have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-brand-blue font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
