import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

import {useAuth} from '../contexts/AuthContext';
import LoadingScreen from '../screens/LoadingScreen';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import TrainerNavigator from './TrainerNavigator';

export default function RootNavigator() {
  const {user, role, loading} = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  // Role-based navigation
  const getMainNavigator = () => {
    switch (role) {
      case 'trainer':
        return <TrainerNavigator />;
      case 'individual':
      default:
        return <MainNavigator />;
    }
  };

  return <NavigationContainer>{getMainNavigator()}</NavigationContainer>;
}
