import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { fetchTasks } from '../redux/tasksSlice';
import { cancelAllNotifications, getAllScheduledNotifications } from '../services/notifications';
import { Bell, Database, Info, Trash2 } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [notificationCount, setNotificationCount] = useState(0);

  const loadNotificationCount = async () => {
    const notifications = await getAllScheduledNotifications();
    setNotificationCount(notifications.length);
  };

  React.useEffect(() => {
    loadNotificationCount();
  }, []);

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            setNotificationCount(0);
            Alert.alert('Success', 'All notifications have been cleared');
          },
        },
      ]
    );
  };

  const handleRefreshData = async () => {
    await dispatch(fetchTasks());
    Alert.alert('Success', 'Data refreshed successfully');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Info size={20} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Smart Voice Notes & Task Assistant</Text>
              <Text style={styles.infoText}>Version 1.0.0</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <TouchableOpacity style={styles.card} onPress={handleRefreshData}>
          <View style={styles.settingRow}>
            <Database size={20} color="#27ae60" />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Refresh Data</Text>
              <Text style={styles.settingDescription}>Reload all tasks from local database</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Bell size={20} color="#f39c12" />
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Scheduled Notifications</Text>
              <Text style={styles.settingDescription}>
                {notificationCount} notification{notificationCount !== 1 ? 's' : ''} scheduled
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.card} onPress={handleClearAllNotifications}>
          <View style={styles.settingRow}>
            <Trash2 size={20} color="#e74c3c" />
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.dangerText]}>
                Clear All Notifications
              </Text>
              <Text style={styles.settingDescription}>
                Remove all scheduled reminder notifications
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>
            This app stores all your data locally on your device. No data is sent to any server or
            cloud service.
          </Text>
          <Text style={styles.aboutText}>
            Voice recognition works offline using your device's built-in speech recognition
            capabilities.
          </Text>
          <Text style={styles.aboutText}>
            All tasks are stored in a local SQLite database and notifications are scheduled locally
            using Expo Notifications.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Privacy-First • Offline-Capable • Secure</Text>
      </View>
    </ScrollView>
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
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dangerText: {
    color: '#e74c3c',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
