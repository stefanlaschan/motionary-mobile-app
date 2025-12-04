import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ProfileScreenProps = {
  onLogout: () => void;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Profile</Text>
    <TouchableOpacity style={styles.button} onPress={onLogout}>
      <Text style={styles.buttonText}>Log out</Text>
    </TouchableOpacity>
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
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
