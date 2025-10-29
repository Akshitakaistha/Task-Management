import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, getAllTasks, addTask, deleteTask, updateTask, getTasksByFilter } from '../services/database';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentFilter: {
    priority?: string;
    category?: string;
    date?: string;
  };
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  currentFilter: {},
};

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const tasks = await getAllTasks();
  return tasks;
});

export const fetchFilteredTasks = createAsyncThunk(
  'tasks/fetchFilteredTasks',
  async (filter: { priority?: string; category?: string; date?: string }) => {
    const tasks = await getTasksByFilter(filter);
    return { tasks, filter };
  }
);

export const createTask = createAsyncThunk('tasks/createTask', async (task: Task) => {
  const id = await addTask(task);
  return { ...task, id };
});

export const removeTask = createAsyncThunk('tasks/removeTask', async (id: number) => {
  await deleteTask(id);
  return id;
});

export const modifyTask = createAsyncThunk(
  'tasks/modifyTask',
  async ({ id, task }: { id: number; task: Partial<Task> }) => {
    await updateTask(id, task);
    return { id, task };
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearFilter: (state) => {
      state.currentFilter = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(fetchFilteredTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.currentFilter = action.payload.filter;
      })
      .addCase(fetchFilteredTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(modifyTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload.task };
        }
      });
  },
});

export const { clearFilter } = tasksSlice.actions;
export default tasksSlice.reducer;
