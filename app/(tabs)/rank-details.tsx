import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuizStats, useQuizResultStore } from '@/lib/store';

function RankCard({
  exam,
  percentile,
  quizCount,
}: {
  exam: string;
  percentile: number;
  quizCount: number;
}) {
  const color =
    percentile >= 80 ? '#22c55e' : percentile >= 50 ? '#eab308' : '#ef4444';
  return (
    <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-brand-navy">{exam}</Text>
        <View className="px-3 py-1 rounded-full" style={{ backgroundColor: color + '20' }}>
          <Text className="text-sm font-bold" style={{ color }}>
            Top {100 - percentile}%
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <View className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${percentile}%`, backgroundColor: color }}
          />
        </View>
        <Text className="text-xs text-slate-400 ml-3">{quizCount} quizzes</Text>
      </View>
    </View>
  );
}

export default function RankDetailsScreen() {
  const results = useQuizResultStore((s) => s.results);
  const { totalQuestions, avgAccuracy } = useQuizStats();

  const examMap = new Map<string, { correct: number; total: number; count: number }>();
  for (const r of results) {
    const key = r.examName;
    const existing = examMap.get(key) || { correct: 0, total: 0, count: 0 };
    examMap.set(key, {
      correct: existing.correct + r.score,
      total: existing.total + r.total,
      count: existing.count + 1,
    });
  }

  const examRanks = Array.from(examMap.entries())
    .map(([exam, { correct, total, count }]) => ({
      exam,
      percentile: Math.round((correct / total) * 100),
      quizCount: count,
    }))
    .sort((a, b) => b.percentile - a.percentile);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-brand-navy mb-1">Rank Details</Text>
        <Text className="text-slate-500 mb-6">Your ranking across exams</Text>

        <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm items-center">
          <View className="w-16 h-16 bg-yellow-50 rounded-full items-center justify-center mb-3">
            <Ionicons name="trophy" size={28} color="#eab308" />
          </View>
          <Text className="text-3xl font-bold text-brand-navy">
            {avgAccuracy > 0 ? `Top ${Math.max(5, 100 - avgAccuracy)}%` : '--'}
          </Text>
          <Text className="text-slate-400 text-sm mt-1">Overall Rank Percentile</Text>
          <View className="flex-row mt-4">
            <View className="items-center px-6">
              <Text className="text-lg font-bold text-brand-navy">{totalQuestions}</Text>
              <Text className="text-xs text-slate-400">Questions</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center px-6">
              <Text className="text-lg font-bold text-brand-navy">{avgAccuracy}%</Text>
              <Text className="text-xs text-slate-400">Accuracy</Text>
            </View>
            <View className="w-px bg-slate-100" />
            <View className="items-center px-6">
              <Text className="text-lg font-bold text-brand-navy">{examRanks.length}</Text>
              <Text className="text-xs text-slate-400">Exams</Text>
            </View>
          </View>
        </View>

        {examRanks.length > 0 ? (
          <>
            <Text className="text-lg font-bold text-brand-navy mb-3">Per-Exam Breakdown</Text>
            {examRanks.map((r) => (
              <RankCard
                key={r.exam}
                exam={r.exam}
                percentile={r.percentile}
                quizCount={r.quizCount}
              />
            ))}
          </>
        ) : (
          <View className="items-center py-12">
            <Ionicons name="medal-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-center">
              Complete some quizzes to see your rank breakdown across exams.
            </Text>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
