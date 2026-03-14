import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  getExamLevels,
  getAllStates,
  getCategoriesForContext,
  getExamsByContext,
  getAvailableYears,
  getPapersForYear,
} from '@shared/services/paper-catalog';
import type { ExamLevel, ExamCategory, ExamProfile, PaperResource } from '@shared/types';

type PaperView = 'LEVEL' | 'STATE' | 'CATEGORY' | 'EXAM' | 'YEAR' | 'SUBJECT' | 'PAPERS';

export default function PapersScreen() {
  const [view, setView] = useState<PaperView>('LEVEL');
  const [selectedLevel, setSelectedLevel] = useState<ExamLevel | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamProfile | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [papers, setPapers] = useState<PaperResource[]>([]);

  const goBack = () => {
    if (view === 'STATE') { setView('LEVEL'); setSelectedLevel(null); }
    else if (view === 'CATEGORY') {
      if (selectedLevel === 'State') { setView('STATE'); setSelectedState(null); }
      else { setView('LEVEL'); setSelectedLevel(null); }
    }
    else if (view === 'EXAM') { setView('CATEGORY'); setSelectedCategory(null); }
    else if (view === 'YEAR') { setView('EXAM'); setSelectedExam(null); }
    else if (view === 'SUBJECT') { setView('YEAR'); setSelectedYear(null); }
    else if (view === 'PAPERS') {
      if (selectedExam?.hasSubjects && selectedExam.subjects?.length) {
        setView('SUBJECT'); setSelectedSubject(null);
      } else {
        setView('YEAR'); setSelectedYear(null);
      }
      setPapers([]);
    }
  };

  const levels = getExamLevels();
  const states = getAllStates();
  const categories = selectedLevel
    ? getCategoriesForContext(selectedLevel, selectedState ?? undefined)
    : [];
  const exams =
    selectedLevel && selectedCategory
      ? getExamsByContext(selectedLevel, selectedCategory, selectedState ?? undefined)
      : [];
  const years = selectedExam ? getAvailableYears(selectedExam.id).slice(0, 10) : [];

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    if (selectedExam?.hasSubjects && selectedExam.subjects?.length) {
      setView('SUBJECT');
    } else {
      const p = getPapersForYear(selectedExam!.id, year);
      setPapers(p);
      setView('PAPERS');
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    const p = getPapersForYear(selectedExam!.id, selectedYear!, subject);
    setPapers(p);
    setView('PAPERS');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {view !== 'LEVEL' && (
          <TouchableOpacity className="flex-row items-center mb-4" onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#4B8BFF" />
            <Text className="text-brand-blue font-medium ml-1">Back</Text>
          </TouchableOpacity>
        )}

        {view === 'LEVEL' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">Past Papers</Text>
            <Text className="text-slate-500 mb-6">Browse by exam level</Text>
            {levels.map((lvl) => (
              <TouchableOpacity
                key={lvl.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => {
                  setSelectedLevel(lvl.id);
                  if (lvl.id === 'State') setView('STATE');
                  else setView('CATEGORY');
                }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{lvl.label}</Text>
                <Text className="text-slate-400 text-sm mt-1">{lvl.desc}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'STATE' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">Select State</Text>
            <Text className="text-slate-500 mb-6">Choose your state</Text>
            {states.map((s) => (
              <TouchableOpacity
                key={s}
                className="bg-white rounded-2xl p-4 mb-2 shadow-sm"
                onPress={() => { setSelectedState(s); setView('CATEGORY'); }}
                activeOpacity={0.7}
              >
                <Text className="text-base text-brand-navy">{s}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'CATEGORY' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">
              {selectedLevel === 'State' ? selectedState : selectedLevel} Exams
            </Text>
            <Text className="text-slate-500 mb-6">Select a category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => { setSelectedCategory(cat); setView('EXAM'); }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{cat}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'EXAM' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">{selectedCategory}</Text>
            <Text className="text-slate-500 mb-6">Select an exam</Text>
            {exams.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => { setSelectedExam(exam); setView('YEAR'); }}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{exam.name}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'YEAR' && selectedExam && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">
              {selectedExam.shortName}
            </Text>
            <Text className="text-slate-500 mb-6">Select a year</Text>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                className="bg-white rounded-2xl p-4 mb-2 flex-row items-center justify-between shadow-sm"
                onPress={() => handleYearSelect(year)}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{year}</Text>
                <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
            {years.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                <Text className="text-slate-400 mt-4">No papers available yet</Text>
              </View>
            )}
          </>
        )}

        {view === 'SUBJECT' && selectedExam?.subjects && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">
              {selectedExam.shortName} {selectedYear}
            </Text>
            <Text className="text-slate-500 mb-6">Select a subject</Text>
            {selectedExam.subjects.map((sub) => (
              <TouchableOpacity
                key={sub}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
                onPress={() => handleSubjectSelect(sub)}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-brand-navy">{sub}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {view === 'PAPERS' && (
          <>
            <Text className="text-2xl font-bold text-brand-navy mb-1">
              {selectedExam?.shortName} {selectedYear}
              {selectedSubject ? ` - ${selectedSubject}` : ''}
            </Text>
            <Text className="text-slate-500 mb-6">Available papers</Text>
            {papers.map((paper) => (
              <View
                key={paper.id}
                className="bg-white rounded-2xl p-5 mb-3 shadow-sm"
              >
                <Text className="text-base font-semibold text-brand-navy mb-2">{paper.title}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-400 text-sm">{paper.fileSize || 'PDF'}</Text>
                  <TouchableOpacity
                    className="bg-brand-blue rounded-lg px-4 py-2 flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="download" size={16} color="#fff" />
                    <Text className="text-white font-medium text-sm ml-1.5">Download</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {papers.length === 0 && (
              <View className="items-center py-12">
                <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
                <Text className="text-slate-400 mt-4">No papers available</Text>
              </View>
            )}
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
