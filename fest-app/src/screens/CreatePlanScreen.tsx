import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeColors } from '../theme';
import { CreatePlanForm } from './CreatePlanForm';

export const CreatePlanScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();

  const handleDone = (newPlanId: string) => {
    (navigation as any).navigate('PlansTab', {
      screen: 'PlanDetails',
      params: { planId: newPlanId },
    });
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <CreatePlanForm onDone={handleDone} />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
});
