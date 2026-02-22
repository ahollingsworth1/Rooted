import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface BibleVerse {
  id: string;
  reference: string;
  text: string;
  isLoading?: boolean;
}

interface DiscussionQuestion {
  id: string;
  question: string;
}

export default function BibleVerseInput() {
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discussionQuestions, setDiscussionQuestions] = useState<DiscussionQuestion[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Function to generate discussion questions using OpenAI
  const generateDiscussionQuestions = async (verseTexts: string[]) => {
    if (verseTexts.length === 0) {
      Alert.alert('Error', 'Please add at least one verse before generating questions');
      return;
    }

    setIsGeneratingQuestions(true);

    try {
      // Format the verses for the prompt
      const versesText = verseTexts.join(', ');
      const prompt = `Based on these verses: [${versesText}], generate 3 thoughtful discussion questions for a couple. Format your response as a JSON array of strings, like: ["Question 1", "Question 2", "Question 3"]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Try to parse the JSON response
      let questions: string[];
      try {
        // Remove any markdown formatting and parse JSON
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        questions = JSON.parse(cleanContent);
      } catch {
        // If JSON parsing fails, try to extract questions from text
        const lines = content.split('\n').filter((line: string) => line.trim().length > 0);
        questions = lines.slice(0, 3).map((line: string) => line.replace(/^\d+\.\s*/, '').trim());
      }

      // Create discussion question objects
      const questionObjects: DiscussionQuestion[] = questions.map((question, index) => ({
        id: `question-${Date.now()}-${index}`,
        question: question,
      }));

      setDiscussionQuestions(questionObjects);
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'Failed to generate discussion questions. Please try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Function to fetch Bible verse text from API
  const fetchVerseText = async (reference: string): Promise<string> => {
    try {
      // Using bible-api.com (free API)
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(reference)}?formatting=plain`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }
      
      const data = await response.json();
      return data.text || 'Verse text not found';
    } catch (error) {
      console.error('Error fetching verse:', error);
      return 'Error loading verse text';
    }
  };

  // Function to add a new verse
  const addVerse = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a Bible verse reference');
      return;
    }

    const newVerse: BibleVerse = {
      id: Date.now().toString(),
      reference: inputText.trim(),
      text: '',
      isLoading: true,
    };

    setVerses(prev => [...prev, newVerse]);
    setInputText('');

    try {
      const verseText = await fetchVerseText(newVerse.reference);
      setVerses(prev =>
        prev.map(verse =>
          verse.id === newVerse.id
            ? { ...verse, text: verseText, isLoading: false }
            : verse
        )
      );
    } catch {
      setVerses(prev =>
        prev.map(verse =>
          verse.id === newVerse.id
            ? { ...verse, text: 'Error loading verse', isLoading: false }
            : verse
        )
      );
    }
  };

  // Function to remove a verse
  const removeVerse = (id: string) => {
    setVerses(prev => prev.filter(verse => verse.id !== id));
  };

  // Function to submit verses to Firestore
  const submitVerses = async () => {
    if (verses.length === 0) {
      Alert.alert('Error', 'Please add at least one verse before submitting');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      const weekData = {
        userId: user.uid,
        verses: verses.map(verse => ({
          reference: verse.reference,
          text: verse.text,
        })),
        discussionQuestions: discussionQuestions.map(q => q.question),
        createdAt: serverTimestamp(),
        weekStart: new Date(), // You might want to calculate the actual week start
      };

      await addDoc(collection(db, 'weeks'), weekData);
      
      Alert.alert('Success', 'Verses and questions saved successfully!');
      setVerses([]);
      setDiscussionQuestions([]);
    } catch (error) {
      console.error('Error saving verses:', error);
      Alert.alert('Error', 'Failed to save verses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render individual verse item
  const renderVerseItem = ({ item }: { item: BibleVerse }) => (
    <View style={[styles.verseCard, { backgroundColor: colors.background }]}>
      <View style={styles.verseHeader}>
        <ThemedText type="subtitle" style={styles.reference}>
          {item.reference}
        </ThemedText>
        <TouchableOpacity
          onPress={() => removeVerse(item.id)}
          style={[styles.removeButton, { backgroundColor: '#ff6b6b' }]}
        >
          <ThemedText style={styles.removeButtonText}>×</ThemedText>
        </TouchableOpacity>
      </View>
      
      {item.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.tint} />
          <ThemedText style={styles.loadingText}>Loading verse...</ThemedText>
        </View>
      ) : (
        <ThemedText style={styles.verseText}>{item.text}</ThemedText>
      )}
    </View>
  );

  // Render individual discussion question item
  const renderQuestionItem = ({ item }: { item: DiscussionQuestion }) => (
    <View style={[styles.questionCard, { backgroundColor: colors.background }]}>
      <ThemedText style={styles.questionText}>{item.question}</ThemedText>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Bible Verses
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Add Bible verse references to track your weekly reading
        </ThemedText>
      </ThemedView>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.icon,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Enter verse reference (e.g., John 3:16)"
          placeholderTextColor={colors.icon}
          onSubmitEditing={addVerse}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={addVerse}
        >
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={verses}
        renderItem={renderVerseItem}
        keyExtractor={item => item.id}
        style={styles.verseList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.verseListContent}
      />

      {verses.length > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              {
                backgroundColor: isGeneratingQuestions ? colors.icon : '#4CAF50',
              },
            ]}
            onPress={() => generateDiscussionQuestions(verses.map(v => v.text))}
            disabled={isGeneratingQuestions}
          >
            {isGeneratingQuestions ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.generateButtonText}>
                Generate Discussion Questions
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}

      {discussionQuestions.length > 0 && (
        <View style={styles.questionsContainer}>
          <ThemedText type="subtitle" style={styles.questionsTitle}>
            Discussion Questions
          </ThemedText>
          <FlatList
            data={discussionQuestions}
            renderItem={renderQuestionItem}
            keyExtractor={item => item.id}
            style={styles.questionsList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {verses.length > 0 && (
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting ? colors.icon : colors.tint,
              },
            ]}
            onPress={submitVerses}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                Save to Week ({verses.length} verses{discussionQuestions.length > 0 ? `, ${discussionQuestions.length} questions` : ''})
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  addButton: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  verseList: {
    flex: 1,
  },
  verseListContent: {
    paddingBottom: 20,
  },
  verseCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reference: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
  verseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionContainer: {
    marginBottom: 20,
  },
  generateButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  questionsContainer: {
    marginBottom: 20,
  },
  questionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  questionsList: {
    maxHeight: 300,
  },
  questionCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  submitContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 