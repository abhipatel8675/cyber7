import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { MaterialIcons } from '@expo/vector-icons';

interface SettingsItem {
  label: string;
  value: any;
  onToggle?: () => void;
  icon: any;
  type?: 'toggle' | 'static';
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const SettingsContent: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = React.useState(true);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const settingsSections: SettingsSection[] = [
    {
      title: 'Notifications',
      items: [
        { 
          label: 'Push Notifications', 
          value: notifications, 
          onToggle: () => setNotifications(!notifications),
          icon: 'notifications' as any,
          type: 'toggle'
        },
        { 
          label: 'Sound Effects', 
          value: soundEnabled, 
          onToggle: () => setSoundEnabled(!soundEnabled),
          icon: 'volume-up' as any,
          type: 'toggle'
        },
      ]
    },
    {
      title: 'System',
      items: [
        { 
          label: 'Auto Refresh', 
          value: autoRefresh, 
          onToggle: () => setAutoRefresh(!autoRefresh),
          icon: 'refresh' as any,
          type: 'toggle'
        },
        { 
          label: 'Dark Mode', 
          value: theme.isDark, 
          onToggle: toggleTheme,
          icon: (theme.isDark ? 'dark-mode' : 'light-mode') as any,
          type: 'toggle'
        },
      ]
    },
    {
      title: 'About',
      items: [
        { 
          label: 'Version', 
          value: '2.1.0', 
          type: 'static',
          icon: 'info' as any
        },
        { 
          label: 'Build', 
          value: '2024.03.06', 
          type: 'static',
          icon: 'build' as any
        },
      ]
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
      
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
          
          <View style={[styles.sectionContent, { backgroundColor: theme.colors.surface }]}>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={[
                styles.settingItem, 
                { borderBottomColor: theme.colors.border }
              ]}>
                <View style={styles.settingLeft}>
                  <MaterialIcons 
                    name={item.icon} 
                    size={22} 
                    color={theme.colors.textSecondary} 
                  />
                  <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                    {item.label}
                  </Text>
                </View>
                
                {item.type === 'static' ? (
                  <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                    {item.value}
                  </Text>
                ) : (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={theme.colors.surface}
                    ios_backgroundColor={theme.colors.border}
                  />
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionContent: {
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
});

export default SettingsContent;
