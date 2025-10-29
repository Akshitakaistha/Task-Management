import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchFilteredTasks, clearFilter, fetchTasks } from '../redux/tasksSlice';
import { parseSmartQuery } from '../services/voiceParser';
import { TaskCard } from '../components/TaskCard';
import { cancelNotification } from '../services/notifications';
import { removeTask } from '../redux/tasksSlice';
import { Mic, Search, X } from 'lucide-react-native';
import { format } from 'date-fns';

export const SmartQueryScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks, loading, currentFilter } = useSelector((state: RootState) => state.tasks);
  const [queryText, setQueryText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  const handleSmartQuery = (text: string) => {
    const query = parseSmartQuery(text);

    if (query.type === 'filter' && query.filter) {
      dispatch(fetchFilteredTasks(query.filter));
      setSuggestion(`Showing tasks with filters applied`);
    } else if (query.type === 'time-based' && query.timeAvailable) {
      const quickTasks = tasks.filter((task) => {
        return true;
      });
      setSuggestion(
        `Based on ${query.timeAvailable} minutes, you can work on ${quickTasks.length} task(s)`
      );
    } else {
      Alert.alert('Unclear Query', "I couldn't understand that query. Try something like:\n\n• Show today's high priority tasks\n• I have 15 minutes");
    }
  };

  const startVoiceQuery = () => {
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
        setQueryText(transcript);
        handleSmartQuery(transcript);
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
      Alert.alert(
        'Voice Input',
        'Voice recognition on mobile requires native modules. For now, please type your query.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleClearFilter = () => {
    dispatch(clearFilter());
    dispatch(fetchTasks());
    setSuggestion('');
    setQueryText('');
  };

  const handleDeleteTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (task?.notificationId) {
      await cancelNotification(task.notificationId);
    }
    dispatch(removeTask(id));
  };

  const quickFilters = [
    { label: "Today's High Priority", query: "show today's high priority tasks" },
    { label: "All Office Tasks", query: "show office tasks" },
    { label: "Family Tasks", query: "show family tasks" },
    { label: "Quick 15 min", query: "I have 15 minutes" },
  ];

  const hasActiveFilter = Object.keys(currentFilter).length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Smart Assistant</Text>
        <Text style={styles.subtitle}>Ask about your tasks</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            value={queryText}
            onChangeText={setQueryText}
            placeholder="Ask me anything..."
            placeholderTextColor="#999"
            onSubmitEditing={() => handleSmartQuery(queryText)}
          />
          {queryText.length > 0 && (
            <TouchableOpacity onPress={() => setQueryText('')}>
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
            onPress={startVoiceQuery}
            disabled={isListening}
          >
            {isListening ? <ActivityIndicator color="#fff" /> : <Mic size={20} color="#fff" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => handleSmartQuery(queryText)}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.quickFilters}>
        <Text style={styles.quickFiltersTitle}>Quick Filters</Text>
        <View style={styles.quickFiltersGrid}>
          {quickFilters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickFilterButton}
              onPress={() => {
                setQueryText(filter.query);
                handleSmartQuery(filter.query);
              }}
            >
              <Text style={styles.quickFilterText}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {suggestion && (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionText}>{suggestion}</Text>
        </View>
      )}

      {hasActiveFilter && (
        <View style={styles.filterHeader}>
          <Text style={styles.filterHeaderText}>Filtered Results</Text>
          <TouchableOpacity onPress={handleClearFilter}>
            <Text style={styles.clearFilterText}>Clear Filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => <TaskCard task={item} onDelete={handleDeleteTask} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  voiceButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
  },
  voiceButtonActive: {
    backgroundColor: '#e74c3c',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    borderRadius: 12,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickFilters: {
    padding: 16,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  quickFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quickFiltersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickFilterButton: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  quickFilterText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  suggestionText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e6f2ff',
  },
  filterHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  clearFilterText: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
