# Smart Voice Notes & Task Assistant

A privacy-first, offline-capable task and note management app that uses voice commands and local device storage. Built with React Native (Expo).

## Features

### Core Functionalities

- **Voice Input**: Use voice commands to quickly add tasks
  - Example: "Add a task to buy groceries tomorrow at 5 PM"
  - Intelligent parsing of task name, date/time, and priority
  - Falls back to manual form if voice is unclear

- **Manual Task Entry**: Comprehensive form with:
  - Task Name (required)
  - Description
  - Date & Time picker
  - Priority (Low/Medium/High)
  - Category (Family/Personal/Office/Other)
  - Reminder time (5, 10, 20, or 25 minutes before)
  - Task dependencies

- **Smart Task List**:
  - Clean card-based interface
  - Priority badges with color coding
  - Due dates and category tags
  - Swipe or tap to complete/delete tasks

- **Smart Assistant**:
  - Natural language queries
  - Examples:
    - "Show today's high-priority tasks"
    - "I have 15 minutes - what can I finish?"
  - Quick filter buttons for common queries

- **Local Notifications**:
  - Schedule reminders for tasks
  - Works completely offline
  - Configurable reminder times

- **Settings**:
  - View scheduled notifications
  - Clear all notifications
  - Refresh data
  - App information

## Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Redux Toolkit
- **Local Database**: SQLite (via expo-sqlite)
- **Notifications**: Expo Notifications
- **Voice Input**: Web Speech API (browser) / expo-speech
- **UI Components**: Custom components with Lucide icons
- **Date Handling**: date-fns
- **Offline-First**: No backend or API calls required

## Project Structure

```
/app                        # Expo Router screens
  /(tabs)                   # Tab navigation
    /index.tsx             # Home screen
    /smart-query.tsx       # Smart assistant
    /settings.tsx          # Settings screen
    /_layout.tsx           # Tab layout configuration
  /_layout.tsx             # Root layout with Redux Provider
  /+not-found.tsx          # 404 screen

/src
  /components              # Reusable UI components
    /TaskCard.tsx          # Task display card
    /TaskForm.tsx          # Task input form
  /redux                   # Redux state management
    /store.ts              # Redux store configuration
    /tasksSlice.ts         # Tasks state slice
  /screens                 # Screen components
    /HomeScreen.tsx        # Main home screen with voice button
    /TaskListScreen.tsx    # Task list display
    /SmartQueryScreen.tsx  # Smart query interface
    /SettingsScreen.tsx    # Settings and info
  /services                # Core services
    /database.ts           # SQLite operations
    /notifications.ts      # Local notification handling
    /voiceParser.ts        # Voice-to-task parsing logic

/types                     # TypeScript type definitions
```

## Key Features

### Offline-First Architecture

All data is stored locally on the device:
- Tasks stored in SQLite database
- No cloud sync or external API calls
- Voice processing happens locally
- Notifications scheduled locally

### Privacy-First

- Zero data collection
- No analytics or tracking
- All processing happens on-device
- No account or login required

### Voice Recognition

On web platforms, uses the browser's built-in Web Speech API:
- Real-time speech-to-text
- Intelligent parsing of natural language
- Extracts task details automatically

Natural Language Processing features:
- Priority detection (urgent, important, low, etc.)
- Category detection (work, family, personal, etc.)
- Date/time parsing (tomorrow, today, next week, at 5 PM, etc.)
- Reminder time extraction

### Smart Queries

The assistant can understand queries like:
- "Show today's high priority tasks"
- "Show office tasks"
- "I have 15 minutes" (suggests quick tasks)

## Data Storage

| Data Type | Storage | Retention |
|-----------|---------|-----------|
| Tasks/Notes | SQLite | Until marked complete |
| Completed Tasks | Deleted | Immediately upon completion |
| Voice Data | Not stored | Processed and discarded |
| Reminders | Local notifications | Cleared after firing |

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build for Web

```bash
npm run build
```

## Usage

### Adding a Task with Voice

1. Tap the blue microphone button
2. Say your task (e.g., "Add urgent task to call client tomorrow at 2 PM")
3. Task will be created automatically or form will open with pre-filled details

### Adding a Task Manually

1. Tap the green "+" button
2. Fill in the task details
3. Tap "Save Task"

### Using Smart Assistant

1. Go to the "Assistant" tab
2. Type or speak your query
3. Use quick filter buttons for common queries
4. View filtered results

### Managing Tasks

- Tap the trash icon to delete a task
- Tasks are permanently deleted (no undo)
- Filter tasks using the smart assistant

## Platform Support

- **Web**: Full support including voice recognition
- **iOS**: Full support (native voice recognition requires additional setup)
- **Android**: Full support (native voice recognition requires additional setup)

## Notifications

Notifications work offline and are scheduled locally:
- Set reminder time when creating a task
- Choose from 5, 10, 20, or 25 minutes before due time
- Manage all notifications in Settings

## Dependencies

Key dependencies:
- `expo-sqlite`: Local database
- `expo-notifications`: Local notifications
- `expo-speech`: Text-to-speech
- `@reduxjs/toolkit`: State management
- `react-redux`: React bindings for Redux
- `date-fns`: Date manipulation
- `lucide-react-native`: Icons

## License

Private project - All rights reserved
