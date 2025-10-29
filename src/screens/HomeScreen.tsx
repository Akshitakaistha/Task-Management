import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { TaskForm } from '../components/TaskForm';
import { TaskListScreen } from './TaskListScreen';
import { parseVoiceInput } from '../services/voiceParser';
import { scheduleTaskNotification } from '../services/notifications';
import { addTask } from '../services/storage';
import { Mic, Plus } from 'lucide-react-native';
import {
  useSpeechRecognitionEvent,
  setSpeechRecognitionIsEnabled,
} from 'expo-speech-recognition';

export const HomeScreen: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      setSpeechRecognitionIsEnabled(true);
    }
    return () => {
      if (Platform.OS !== 'web') {
        setSpeechRecognitionIsEnabled(false);
      }
    };
  }, []);

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      handleVoiceResult(transcript);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    Alert.alert('Error', `Speech recognition failed: ${event.error}`);
  });

  const startVoiceRecognition = async () => {
    if (Platform.OS === 'web') {
      if (!('webkitSpeechRecognition' in window)) {
        Alert.alert('Not Supported', 'Speech recognition is not supported in this browser');
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceResult(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        Alert.alert('Error', `Speech recognition failed: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      const { ExpoSpeechRecognitionModule, getPermissionsAsync, requestPermissionsAsync } =
        await import('expo-speech-recognition');

      const { status } = await getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await requestPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Microphone permission is required for voice input');
          return;
        }
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: false,
        contextualStrings: [],
      });
    }
  };

  const handleVoiceResult = (text: string) => {
    const parsed = parseVoiceInput(text);

    if (parsed.isComplete) {
      createTaskFromParsed(parsed);
    } else {
      const missing: string[] = [];
      if (!parsed.name || parsed.name === 'New Task') missing.push('Task name');
      if (!parsed.dueDate) missing.push('Due date');

      Alert.alert(
        'Some Details Missing',
        `I understood: ${getRecognizedFieldsSummary(parsed)}\n\nMissing: ${missing.join(', ')}\n\nPlease fill in the missing details.`,
        [{ text: 'OK' }]
      );
      setParsedData(parsed);
      setMissingFields(missing);
      setShowForm(true);
    }
  };

  const getRecognizedFieldsSummary = (parsed: any): string => {
    const recognized: string[] = [];
    if (parsed.name && parsed.name !== 'New Task') recognized.push(`Task: ${parsed.name}`);
    if (parsed.dueDate) recognized.push('Date');
    if (parsed.priority && parsed.priority !== 'Medium') recognized.push('Priority');
    if (parsed.category) recognized.push('Category');
    if (parsed.reminderMinutes) recognized.push('Reminder');
    return recognized.length > 0 ? recognized.join(', ') : 'Nothing clear';
  };

  const createTaskFromParsed = async (parsed: any) => {
    try {
      const taskData = {
        name: parsed.name,
        description: parsed.description,
        dueDate: parsed.dueDate,
        priority: parsed.priority,
        category: parsed.category || 'Personal',
        reminderMinutes: parsed.reminderMinutes,
        dependency: parsed.dependency,
        createdAt: new Date().toISOString(),
      };

      let notificationId: string | undefined;
      if (taskData.dueDate && taskData.reminderMinutes) {
        notificationId = await scheduleTaskNotification(
          taskData.name,
          taskData.dueDate,
          taskData.reminderMinutes
        );
      }

      await addTask({
        ...taskData,
        notificationId,
      });

      setRefreshKey((prev) => prev + 1);
      Alert.alert('Success', 'Task created successfully!');
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleFormSubmit = async (task: any) => {
    try {
      let notificationId: string | undefined;
      if (task.dueDate && task.reminderMinutes) {
        notificationId = await scheduleTaskNotification(
          task.name,
          task.dueDate,
          task.reminderMinutes
        );
      }

      await addTask({
        ...task,
        createdAt: new Date().toISOString(),
        notificationId,
      });

      setShowForm(false);
      setParsedData(null);
      setMissingFields([]);
      setRefreshKey((prev) => prev + 1);
      Alert.alert('Success', 'Task saved successfully!');
    } catch (error) {
      console.error('Error saving task:', error);
      Alert.alert('Error', 'Failed to save task. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TaskListScreen key={refreshKey} />

      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setParsedData(null);
            setMissingFields([]);
            setShowForm(true);
          }}
        >
          <Plus size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={startVoiceRecognition}
          disabled={isListening}
        >
          {isListening ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Mic size={28} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowForm(false);
          setParsedData(null);
          setMissingFields([]);
        }}
      >
        <TaskForm
          initialData={parsedData}
          missingFields={missingFields}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setParsedData(null);
            setMissingFields([]);
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'column',
    gap: 16,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: '#e74c3c',
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
