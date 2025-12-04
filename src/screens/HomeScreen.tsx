import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export const HomeScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Home</Text>
    <StatusBar style="auto" />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
});
