import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function NotFoundScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.text}>This screen doesn't exist.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Tabs')}>
        <Text style={styles.buttonText}>Go to home screen!</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#111',
    fontFamily: 'Inter-Bold',
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
});
