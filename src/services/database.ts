import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id?: number;
  name: string;
  description?: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  category: string;
  reminderMinutes?: number;
  dependency?: string;
  createdAt: string;
  notificationId?: string;
}

const TASKS_KEY = '@tasks';

export const initDatabase = async () => {
  return;
};

const getTasks = async (): Promise<Task[]> => {
  try {
    const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
};

const setTasks = async (tasks: Task[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error setting tasks:', error);
  }
};

export const addTask = async (task: Task): Promise<number> => {
  const tasks = await getTasks();
  const newTask = {
    ...task,
    id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 1,
  };
  tasks.unshift(newTask);
  await setTasks(tasks);
  return newTask.id!;
};

export const getAllTasks = async (): Promise<Task[]> => {
  return getTasks();
};

export const getTaskById = async (id: number): Promise<Task | null> => {
  const tasks = await getTasks();
  return tasks.find(t => t.id === id) || null;
};

export const deleteTask = async (id: number): Promise<void> => {
  const tasks = await getTasks();
  const filtered = tasks.filter(t => t.id !== id);
  await setTasks(filtered);
};

export const updateTask = async (id: number, task: Partial<Task>): Promise<void> => {
  const tasks = await getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...task };
    await setTasks(tasks);
  }
};

export const getTasksByFilter = async (filter: {
  priority?: string;
  category?: string;
  date?: string;
}): Promise<Task[]> => {
  const tasks = await getTasks();
  return tasks.filter(task => {
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.category && task.category !== filter.category) return false;
    if (filter.date && task.dueDate) {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      if (taskDate !== filter.date) return false;
    }
    return true;
  });
};
