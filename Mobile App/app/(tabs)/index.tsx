import { Image, StyleSheet, TextInput, Platform, useColorScheme, View, Button,KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard } from 'react-native';
import React,{ useState, useEffect } from 'react';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { setUrl } from '../_GlobalStateContext';



export default function HomeScreen() {
  const [url, setInput] = useState('http://4.233.148.168:80');

  const saveUrl = () => {
    setUrl(url);
    alert('URL saved!');
  };

  const isDarkMode = useColorScheme() === 'dark';

  // Styles dynamically based on the theme
  const input_styles = isDarkMode ? darkTheme : lightTheme;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/connect.png')}
          style={styles.Logo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to Green Control!</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText>
        To get started, please enter the MQTT server URL in the designated field.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Configuration:</ThemedText>
        <ThemedText>
          Please enter your MQTT server here.
        </ThemedText>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
            <View style={input_styles.container}>
              <TextInput
                style={input_styles.input}
                onChangeText={setInput}
                value={url}
                placeholder="https://www.example.com"
                placeholderTextColor={isDarkMode ? '#888' : '#666'}
              />
            </View>
            <ThemedView>
              <Button
                title="Save URL"
                onPress={saveUrl}
                color={isDarkMode ? styles.darkButton.color : styles.lightButton.color}
              />
            </ThemedView>
          {/* </TouchableWithoutFeedback> */}
        </KeyboardAvoidingView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  Logo: {
    height: 298,
    width: 390,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "red"
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
