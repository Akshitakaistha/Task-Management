import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  reminderMinutes?: number;
  dependency?: string;
  notificationId?: string;
  createdAt: string;
}

const TASKS_KEY = '@smart_voice_tasks';

export const saveTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
};

export const getTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

export const addTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  try {
    const tasks = await getTasks();
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
    tasks.push(newTask);
    await saveTasks(tasks);
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<void> => {
  try {
    const tasks = await getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== id);
    await saveTasks(filteredTasks);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
  try {
    const tasks = await getTasks();
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    await saveTasks(updatedTasks);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};
