import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ParsedTask } from '../services/voiceParser';

interface TaskFormProps {
  initialData?: Partial<ParsedTask>;
  onSubmit: (task: {
    name: string;
    description?: string;
    dueDate?: string;
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    reminderMinutes?: number;
    dependency?: string;
  }) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>(
    initialData?.priority || 'Medium'
  );
  const [category, setCategory] = useState(initialData?.category || 'Personal');
  const [customCategory, setCustomCategory] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | undefined>(
    initialData?.reminderMinutes
  );
  const [dependency, setDependency] = useState(initialData?.dependency || '');
  const [error, setError] = useState('');

  const categories = ['Family', 'Personal', 'Office', 'Other'];
  const reminderOptions = [5, 10, 20, 25];

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Task name is required');
      return;
    }

    const finalCategory = category === 'Other' ? customCategory : category;

    if (category === 'Other' && !customCategory.trim()) {
      setError('Please enter a custom category');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate?.toISOString(),
      priority,
      category: finalCategory,
      reminderMinutes,
      dependency: dependency.trim() || undefined,
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = dueDate || new Date();
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDueDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = dueDate || new Date();
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add Task</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Task Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter task name"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Due Date & Time</Text>
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>
            {dueDate ? dueDate.toLocaleDateString() : 'Select Date'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateButtonText}>
            {dueDate ? dueDate.toLocaleTimeString() : 'Select Time'}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.optionsRow}>
          {(['Low', 'Medium', 'High'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.optionButton, priority === p && styles.optionButtonActive]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[styles.optionButtonText, priority === p && styles.optionButtonTextActive]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.optionsRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.optionButton, category === c && styles.optionButtonActive]}
              onPress={() => setCategory(c)}
            >
              <Text
                style={[styles.optionButtonText, category === c && styles.optionButtonTextActive]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {category === 'Other' && (
          <TextInput
            style={[styles.input, styles.marginTop]}
            value={customCategory}
            onChangeText={setCustomCategory}
            placeholder="Enter custom category"
            placeholderTextColor="#999"
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Reminder (minutes before)</Text>
        <View style={styles.optionsRow}>
          {reminderOptions.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.optionButton,
                reminderMinutes === minutes && styles.optionButtonActive,
              ]}
              onPress={() =>
                setReminderMinutes(reminderMinutes === minutes ? undefined : minutes)
              }
            >
              <Text
                style={[
                  styles.optionButtonText,
                  reminderMinutes === minutes && styles.optionButtonTextActive,
                ]}
              >
                {minutes}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dependency (optional)</Text>
        <TextInput
          style={styles.input}
          value={dependency}
          onChangeText={setDependency}
          placeholder="Enter task dependency"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1a1a1a',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#333',
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  marginTop: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 40,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
  },
});
