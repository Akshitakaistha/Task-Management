import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Trash2, Clock, AlertCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { Task } from '../services/database';

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onPress }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#e74c3c';
      case 'Medium':
        return '#f39c12';
      case 'Low':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return null;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.taskName} numberOfLines={2}>
              {task.name}
            </Text>
            <View
              style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}
            >
              <Text style={styles.priorityText}>{task.priority}</Text>
            </View>
          </View>
        </View>

        {task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.metaInfo}>
            {task.dueDate && (
              <View style={styles.metaItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.metaText}>{formatDate(task.dueDate)}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.categoryText}>{task.category}</Text>
            </View>
            {task.reminderMinutes && (
              <View style={styles.metaItem}>
                <AlertCircle size={14} color="#666" />
                <Text style={styles.metaText}>{task.reminderMinutes}m before</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          if (task.id) onDelete(task.id);
        }}
      >
        <Trash2 size={20} color="#e74c3c" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    flex: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  categoryText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
