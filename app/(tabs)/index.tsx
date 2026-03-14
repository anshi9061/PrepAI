import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useQuizStats } from '@/lib/store';

function StatCard({
  icon,
  label,
  value,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 flex-1 mr-3 shadow-sm"
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={18} color={color} />
        <Text className="text-slate-500 text-xs ml-1.5">{label}</Text>
      </View>
      <Text className="text-2xl font-bold text-brand-navy">{value}</Text>
    </TouchableOpacity>
  );
}

function QuickAction({
  icon,
  label,
  subtitle,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-3 flex-row items-center shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon} size={22} color="#4B8BFF" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-brand-navy">{label}</Text>
        <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </TouchableOpacity>
  );
}

function RecentQuizRow({
  examName,
  topic,
  percentage,
  date,
}: {
  examName: string;
  topic: string;
  percentage: number;
  date: string;
}) {
  const color = percentage >= 75 ? '#22c55e' : percentage >= 50 ? '#eab308' : '#ef4444';
  return (
    <View className="flex-row items-center py-3 border-b border-slate-50">
      <View
        className="w-9 h-9 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: color + '20' }}
      >
        <Text className="text-xs font-bold" style={{ color }}>{percentage}%</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-brand-navy">{examName}</Text>
        <Text className="text-xs text-slate-400">{topic}</Text>
      </View>
      <Text className="text-xs text-slate-400">{date}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const stats = useQuizStats();
  const displayName =
    user?.user_metadata?.full_name?.split(' ')[0] || 'Student';

  const streakDisplay = stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : '0';
  const rankDisplay = stats.avgAccuracy > 0 ? `Top ${Math.max(5, 100 - stats.avgAccuracy)}%` : '--';
  const todayDisplay = stats.todayAccuracy > 0 ? `${stats.todayAccuracy}%` : '--';

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-slate-400 text-sm">Welcome back,</Text>
          <Text className="text-2xl font-bold text-brand-navy">{displayName}</Text>
        </View>

        <View className="flex-row mb-6">
          <StatCard icon="flame" label="Streak" value={streakDisplay} color="#f97316" />
          <StatCard
            icon="trophy"
            label="Rank"
            value={rankDisplay}
            color="#eab308"
            onPress={() => router.push('/(tabs)/rank-details')}
          />
          <StatCard icon="checkmark-circle" label="Today" value={todayDisplay} color="#22c55e" />
        </View>

        {stats.recentResults.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="text-base font-bold text-brand-navy mb-1">Recent Quizzes</Text>
            {stats.recentResults.slice(0, 3).map((r) => (
              <RecentQuizRow
                key={r.id}
                examName={r.examName}
                topic={r.topic}
                percentage={r.percentage}
                date={new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
            ))}
          </View>
        )}

        <Text className="text-lg font-bold text-brand-navy mb-3">Quick Actions</Text>

        <QuickAction
          icon="flash"
          label="Daily Challenge"
          subtitle="5 questions across all subjects"
          onPress={() => router.push('/(tabs)/quiz')}
        />
        <QuickAction
          icon="create"
          label="Practice Quiz"
          subtitle="Pick a topic and start practicing"
          onPress={() => router.push('/(tabs)/quiz')}
        />
        <QuickAction
          icon="timer"
          label="Mock Test"
          subtitle="Full exam simulation with timer"
          onPress={() => router.push('/(tabs)/quiz')}
        />
        <QuickAction
          icon="chatbubble-ellipses"
          label="Chat Assistant"
          subtitle="Ask AI about any topic"
          onPress={() => router.push('/(tabs)/chat')}
        />
        <QuickAction
          icon="image"
          label="Image Studio"
          subtitle="Scan questions & generate diagrams"
          onPress={() => router.push('/(tabs)/image-studio')}
        />
        <QuickAction
          icon="document-text"
          label="Past Papers"
          subtitle="Browse papers by exam and year"
          onPress={() => router.push('/(tabs)/papers')}
        />
        <QuickAction
          icon="bar-chart"
          label="View Analytics"
          subtitle="Track your progress over time"
          onPress={() => router.push('/(tabs)/analytics')}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
