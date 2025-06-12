import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {Text} from 'react-native';

import DataScreen from '../screens/DataScreen';
import RestTimerScreen from '../screens/RestTimerScreen';
import ClientSelectionScreen from '../screens/trainer/ClientSelectionScreen';
import VoiceInputScreen from '../screens/VoiceInputScreen';

export type TrainerTabParamList = {
  ClientSelection: undefined;
  VoiceInput: undefined;
  Data: undefined;
  RestTimer: undefined;
};

export type TrainerStackParamList = {
  ClientSelection: undefined;
  ClientSession: {clientId: string; clientName: string};
};

const Tab = createBottomTabNavigator<TrainerTabParamList>();
const Stack = createStackNavigator<TrainerStackParamList>();

// Stack navigator for trainer flow (client selection -> session)
function TrainerStack() {
  return (
    <Stack.Navigator
      initialRouteName="ClientSelection"
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ClientSelection" component={ClientSelectionScreen} />
      <Stack.Screen name="ClientSession" component={TrainerMainTabs} />
    </Stack.Navigator>
  );
}

// Tab navigator for when trainer is in a client session
function TrainerMainTabs() {
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

export default function TrainerNavigator() {
  return <TrainerStack />;
}
