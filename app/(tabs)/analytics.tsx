import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuizStats, useQuizResultStore, type QuizResult } from '@/lib/store';

type TimeFilter = 'week' | 'month' | 'all';

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  color,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: color + '20' }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text className="text-slate-500 text-sm">{label}</Text>
      </View>
      <Text className="text-3xl font-bold text-brand-navy">{value}</Text>
      {subtitle && <Text className="text-slate-400 text-sm mt-1">{subtitle}</Text>}
    </View>
  );
}

function StrengthBar({ topic, pct }: { topic: string; pct: number }) {
  const color =
    pct >= 75 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-sm text-brand-navy font-medium">{topic}</Text>
        <Text className="text-sm font-semibold" style={{ color }}>
          {pct}%
        </Text>
      </View>
      <View className="bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <View className="flex-row items-end justify-between h-32 mt-2">
      {data.map((d, i) => (
        <View key={i} className="items-center flex-1 mx-0.5">
          <View
            className="bg-brand-blue rounded-t-md w-full"
            style={{
              height: `${Math.max((d.value / maxVal) * 100, 4)}%`,
              minHeight: 4,
            }}
          />
          <Text className="text-xs text-slate-400 mt-1">{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

function QuizHistoryRow({ result }: { result: QuizResult }) {
  const pct = result.percentage;
  const color = pct >= 75 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';
  return (
    <View className="flex-row items-center py-3 border-b border-slate-50">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: color + '20' }}
      >
        <Text className="text-sm font-bold" style={{ color }}>{pct}%</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-brand-navy">{result.examName} - {result.topic}</Text>
        <Text className="text-xs text-slate-400 mt-0.5">
          {result.mode} &middot; {result.score}/{result.total} &middot;{' '}
          {new Date(result.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}

function getFilteredResults(results: QuizResult[], filter: TimeFilter): QuizResult[] {
  if (filter === 'all') return results;
  const now = Date.now();
  const cutoff = filter === 'week' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  return results.filter((r) => now - r.timestamp < cutoff);
}

function getChartData(results: QuizResult[], filter: TimeFilter): { label: string; value: number }[] {
  if (results.length === 0) {
    const labels = filter === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['W1', 'W2', 'W3', 'W4'];
    return labels.map((label) => ({ label, value: 0 }));
  }

  const dateMap = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const key = r.date;
    const existing = dateMap.get(key) || { correct: 0, total: 0 };
    dateMap.set(key, { correct: existing.correct + r.score, total: existing.total + r.total });
  }

  const entries = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7);

  return entries.map(([date, { correct, total }]) => ({
    label: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
    value: Math.round((correct / total) * 100),
  }));
}

export default function AnalyticsScreen() {
  const [filter, setFilter] = useState<TimeFilter>('week');
  const stats = useQuizStats();
  const results = useQuizResultStore((s) => s.results);
  const filteredResults = getFilteredResults(results, filter);
  const chartData = getChartData(filteredResults, filter);

  const hasData = results.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-brand-navy mb-1">Analytics</Text>
        <Text className="text-slate-500 mb-6">Your performance overview</Text>

        <View className="flex-row mb-3">
          <View className="flex-1 mr-2">
            <MetricCard
              label="Total Questions"
              value={hasData ? stats.totalQuestions.toString() : '0'}
              icon="checkmark-done"
              color="#4B8BFF"
            />
          </View>
          <View className="flex-1 ml-2">
            <MetricCard
              label="Avg Accuracy"
              value={hasData ? `${stats.avgAccuracy}%` : '--'}
              icon="analytics"
              color="#7C53FF"
            />
          </View>
        </View>

        <MetricCard
          label="Current Streak"
          value={stats.streak > 0 ? `${stats.streak} day${stats.streak === 1 ? '' : 's'}` : 'No streak'}
          subtitle={stats.streak >= 3 ? "Keep it going! You're on fire." : 'Take a quiz to start your streak'}
          icon="flame"
          color="#f97316"
        />

        <View className="bg-white rounded-2xl p-5 mt-1 mb-3 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-base font-bold text-brand-navy">Accuracy Trend</Text>
            <View className="flex-row bg-slate-100 rounded-lg">
              {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  className={`px-3 py-1.5 rounded-lg ${filter === f ? 'bg-brand-blue' : ''}`}
                  onPress={() => setFilter(f)}
                >
                  <Text
                    className={`text-xs font-semibold ${filter === f ? 'text-white' : 'text-slate-500'}`}
                  >
                    {f === 'week' ? 'Week' : f === 'month' ? 'Month' : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {chartData.length > 0 ? (
            <MiniBarChart data={chartData} />
          ) : (
            <View className="items-center py-8">
              <Text className="text-slate-400 text-sm">No data for this period</Text>
            </View>
          )}
        </View>

        {stats.topicStrengths.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mt-1 mb-3 shadow-sm">
            <Text className="text-base font-bold text-brand-navy mb-4">
              Topic Strengths
            </Text>
            {stats.topicStrengths.map((s) => (
              <StrengthBar key={s.topic} topic={s.topic} pct={s.pct} />
            ))}
          </View>
        )}

        {filteredResults.length > 0 && (
          <View className="bg-white rounded-2xl p-5 mt-1 mb-3 shadow-sm">
            <Text className="text-base font-bold text-brand-navy mb-2">Quiz History</Text>
            {filteredResults.slice(0, 10).map((r) => (
              <QuizHistoryRow key={r.id} result={r} />
            ))}
          </View>
        )}

        {!hasData && (
          <View className="items-center py-8">
            <Ionicons name="bar-chart-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-center">
              Complete some quizzes to see your analytics here.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
