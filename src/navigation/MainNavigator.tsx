import React from 'react';
import {Text} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import VoiceInputScreen from '../screens/VoiceInputScreen';
import DataScreen from '../screens/DataScreen';
import RestTimerScreen from '../screens/RestTimerScreen';

export type MainTabParamList = {
  VoiceInput: undefined;
  Data: undefined;
  RestTimer: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="VoiceInput"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#ecf0f1',
          paddingVertical: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
      }}>
      <Tab.Screen
        name="VoiceInput"
        component={VoiceInputScreen}
        options={{
          tabBarLabel: '音声入力',
          tabBarIcon: ({color}) => <TabIcon color={color} name="🎤" />,
        }}
      />
      <Tab.Screen
        name="Data"
        component={DataScreen}
        options={{
          tabBarLabel: '保存データ',
          tabBarIcon: ({color}) => <TabIcon color={color} name="📊" />,
        }}
      />
      <Tab.Screen
        name="RestTimer"
        component={RestTimerScreen}
        options={{
          tabBarLabel: 'レストタイマー',
          tabBarIcon: ({color}) => <TabIcon color={color} name="⏰" />,
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji-based icon component
function TabIcon({color, name}: {color: string; name: string}) {
  return (
    <Text
      style={{
        fontSize: 24,
        opacity: color === '#3498db' ? 1 : 0.6,
      }}>
      {name}
    </Text>
  );
}
