import { 
  Image, StyleSheet, TextInput, Platform, useColorScheme, View, Button, KeyboardAvoidingView 
} from 'react-native';
import React, { useState } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getUrl } from '../_GlobalStateContext';

const sendData = async (tempmoy: number, hummoy: number, pollmax: number, moistmin: number) => {
  const url = getUrl(); // Ensure this function is defined and returns a valid URL
  const data = {
    tempmoy,
    hummoy,
    pollmax,
    moistmin,
  };

  try {
    const response = await fetch(url, {
      method: 'POST', // Use POST to send JSON data
      headers: {
        'Content-Type': 'application/json', // Specify the content type
      },
      body: JSON.stringify(data), // Convert data to JSON
      cache: 'no-store', // Prevent caching
    });

    if (response.ok) {
      const jsonResponse = await response.json(); // Parse JSON response if needed
      console.log('Response:', jsonResponse);
    } else {
      console.error('HTTP error:', response.status);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
};



export default function HomeScreen() {
  const [tempmoy, tempmoysetInput] = useState('37');
  const [hummoy, hummoysetInput] = useState('50');
  const [pollmax, pollmaxsetInput] = useState('75');
  const [moistmin, moistminsetInput] = useState('30');

  const saveSettings = () => {
    sendData(
      parseFloat(tempmoy), 
      parseFloat(hummoy), 
      parseFloat(pollmax), 
      parseFloat(moistmin)
    );
    alert('configuration saved!');
  };

  const isDarkMode = useColorScheme() === 'dark';

  const inputStyles = isDarkMode ? darkTheme : lightTheme;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/connect.png')}
          style={styles.logo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Configure Thresholds</ThemedText>
      </ThemedView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {[
          { label: 'Temperature moyenne', value: tempmoy, onChange: tempmoysetInput },
          { label: 'Humidité moyenne', value: hummoy, onChange: hummoysetInput },
          { label: 'Pollution maximale', value: pollmax, onChange: pollmaxsetInput },
          { label: 'Humidité minimale', value: moistmin, onChange: moistminsetInput },
        ].map(({ label, value, onChange }, index) => (
          <ThemedView key={index} style={styles.inputContainer}>
            <ThemedText type="subtitle">{label}:</ThemedText>
            <View style={inputStyles.container}>
              <TextInput
                style={inputStyles.input}
                onChangeText={onChange}
                value={value}
                placeholder={label}
                placeholderTextColor={isDarkMode ? '#888' : '#666'}
                keyboardType="numeric"
              />
            </View>
          </ThemedView>
        ))}
        <ThemedView style={styles.saveButtonContainer}>
          <Button
            title="Save Settings"
            onPress={saveSettings}
            color={isDarkMode ? styles.darkButton.color : styles.lightButton.color}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  logo: {
    height: 298,
    width: 390,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  darkButton: {
    color: '#BB86FC', // Purple accent for dark theme
  },
  lightButton: {
    color: '#1E88E5', // Blue accent for light theme
  },
});

const lightTheme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#000000', // Text color
    backgroundColor: '#f5f5f5',
    width: '100%',
  },
});

const darkTheme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#ffffff', // Text color
    backgroundColor: '#1e1e1e',
    width: '100%',
  },
});
