import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function ImageStudioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="flex-1 px-5 pt-8">
        <Text className="text-2xl font-bold text-brand-navy mb-1">Image Studio</Text>
        <Text className="text-slate-500 mb-8">
          AI-powered image tools for studying
        </Text>

        <View className="bg-white rounded-2xl p-6 shadow-sm items-center">
          <View className="w-20 h-20 bg-purple-50 rounded-full items-center justify-center mb-4">
            <Ionicons name="image" size={36} color="#7C53FF" />
          </View>
          <Text className="text-lg font-bold text-brand-navy mb-2 text-center">
            Coming Soon
          </Text>
          <Text className="text-slate-400 text-center text-sm leading-5 mb-6">
            Image Studio will let you scan questions from photos, generate
            diagrams, and get visual explanations of complex topics using AI.
          </Text>

          <View className="w-full">
            <FeatureRow
              icon="camera"
              title="Scan Questions"
              desc="Take a photo and get instant solutions"
            />
            <FeatureRow
              icon="color-palette"
              title="Generate Diagrams"
              desc="Create visual aids for any topic"
            />
            <FeatureRow
              icon="eye"
              title="Visual Explanations"
              desc="See step-by-step visual breakdowns"
            />
          </View>
        </View>

        <TouchableOpacity
          className="bg-slate-100 rounded-2xl py-4 items-center mt-6"
          activeOpacity={0.7}
          disabled
        >
          <Text className="text-slate-400 font-semibold text-base">Notify Me When Available</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({
  icon,
  title,
  desc,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  desc: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-slate-50">
      <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
        <Ionicons name={icon} size={18} color="#7C53FF" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-brand-navy">{title}</Text>
        <Text className="text-xs text-slate-400 mt-0.5">{desc}</Text>
      </View>
    </View>
  );
}
