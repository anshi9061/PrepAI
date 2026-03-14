import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { ChatMessage } from '@shared/types';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: "Hi! I'm PREP AI, your study assistant. Ask me anything about your exam topics, concepts, or study strategies. I'm here to help you succeed!",
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
    };
    setMessages((prev: ChatMessage[]) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    // Placeholder AI response until Supabase Edge Function is configured
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: getPlaceholderResponse(text),
      };
      setMessages((prev: ChatMessage[]) => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-5 pt-4 pb-3 border-b border-slate-100 bg-white">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-brand-blue rounded-full items-center justify-center mr-3">
            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-brand-navy">Study Assistant</Text>
            <Text className="text-xs text-slate-400">Powered by AI</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg: ChatMessage) => (
            <View
              key={msg.id}
              className={`mb-3 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              <View
                className={`rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-brand-blue rounded-br-sm'
                    : 'bg-white rounded-bl-sm shadow-sm'
                }`}
              >
                <Text
                  className={`text-sm leading-5 ${
                    msg.role === 'user' ? 'text-white' : 'text-brand-navy'
                  }`}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="mb-3 self-start">
              <View className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm flex-row items-center">
                <ActivityIndicator size="small" color="#4B8BFF" />
                <Text className="text-slate-400 text-sm ml-2">Thinking...</Text>
              </View>
            </View>
          )}
          <View className="h-4" />
        </ScrollView>

        <View className="px-4 py-3 bg-white border-t border-slate-100">
          <View className="flex-row items-end bg-slate-50 rounded-2xl border border-slate-200 pr-2">
            <TextInput
              className="flex-1 px-4 py-3 text-base text-brand-navy max-h-24"
              placeholder="Ask anything..."
              placeholderTextColor="#94a3b8"
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              className="w-10 h-10 bg-brand-blue rounded-xl items-center justify-center mb-1"
              onPress={handleSend}
              disabled={!input.trim() || loading}
              activeOpacity={0.7}
              style={{ opacity: input.trim() && !loading ? 1 : 0.5 }}
            >
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getPlaceholderResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('newton') || q.includes('force') || q.includes('motion'))
    return "Newton's Laws of Motion are fundamental to classical mechanics. The First Law (inertia) states an object remains at rest or in uniform motion unless acted upon by a force. The Second Law relates force, mass, and acceleration (F=ma). The Third Law states every action has an equal and opposite reaction. Would you like me to explain any of these in more detail?";
  if (q.includes('photosynthesis') || q.includes('plant'))
    return "Photosynthesis is the process by which green plants convert light energy into chemical energy. The overall equation is: 6CO\u2082 + 6H\u2082O \u2192 C\u2086H\u2081\u2082O\u2086 + 6O\u2082. It occurs in the chloroplasts and involves light-dependent reactions (in thylakoids) and the Calvin cycle (in stroma). Shall I break down either stage?";
  if (q.includes('quadratic') || q.includes('equation'))
    return "A quadratic equation has the form ax\u00b2 + bx + c = 0. You can solve it using the quadratic formula: x = (-b \u00b1 \u221a(b\u00b2 - 4ac)) / 2a. The discriminant (b\u00b2 - 4ac) tells you about the nature of roots: positive = two real roots, zero = one repeated root, negative = complex roots. Want to try some practice problems?";
  if (q.includes('tip') || q.includes('strategy') || q.includes('study'))
    return "Here are some effective study strategies: 1) Use spaced repetition \u2014 review material at increasing intervals. 2) Practice active recall \u2014 test yourself instead of re-reading. 3) Take practice tests under timed conditions. 4) Focus on your weakest topics first. 5) Get enough sleep \u2014 it's crucial for memory consolidation. Which strategy would you like to learn more about?";
  return `That's a great question! Here's what I know about "${question.slice(0, 50)}": This topic is commonly tested in competitive exams. I recommend reviewing the fundamentals first, then working through practice problems. Once the AI backend is fully connected, I'll be able to give you much more detailed, personalized explanations. For now, try using the Quiz feature to test your knowledge on this topic!`;
}
