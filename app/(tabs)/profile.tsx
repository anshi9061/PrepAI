import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center py-4 border-b border-slate-100">
      <Ionicons name={icon} size={20} color="#64748b" />
      <Text className="text-slate-600 text-base ml-3 flex-1">{label}</Text>
      {value && <Text className="text-slate-400 text-sm">{value}</Text>}
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.user_metadata?.full_name || 'Student';
  const email = user?.email || '';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    supabase.auth.signOut();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="flex-1 px-5 pt-8">
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-brand-blue rounded-full items-center justify-center mb-3">
            <Text className="text-white text-2xl font-bold">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="text-xl font-bold text-brand-navy">{displayName}</Text>
          <Text className="text-slate-400 mt-1">{email}</Text>
        </View>

        <View className="bg-white rounded-2xl px-5 shadow-sm">
          <ProfileRow icon="person" label="Full Name" value={displayName} />
          <ProfileRow icon="mail" label="Email" value={email} />
          <ProfileRow icon="school" label="Subscription" value="Free" />
          {memberSince ? <ProfileRow icon="calendar" label="Member Since" value={memberSince} /> : null}
        </View>

        <TouchableOpacity
          className="bg-red-50 rounded-2xl py-4 items-center mt-6 border border-red-100"
          onPress={() => setShowLogoutConfirm(true)}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text className="text-red-500 font-semibold text-base ml-2">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-8">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-lg font-bold text-brand-navy mb-2">Sign Out</Text>
            <Text className="text-slate-500 mb-6">Are you sure you want to sign out?</Text>
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 bg-slate-100 rounded-xl py-3 items-center mr-2"
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text className="text-slate-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-xl py-3 items-center ml-2"
                onPress={handleLogout}
              >
                <Text className="text-white font-semibold">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
