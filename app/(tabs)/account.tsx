import { Text, View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import React, { useState } from 'react';
import { registerUser, loginUser } from '../firebase/firebaseAuth';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      Alert.alert("Success", "User registered.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      Alert.alert("Success", "User logged in.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In / Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry = {true}
      />
      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color="#00bfff" />
        <Button title="Register" onPress={handleRegister} color="#32cd32" />
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#ffffff',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    marginBottom: 20,
    padding: 5,
  },
  input: {
    width: '100%',
    backgroundColor: '#3b3b3b',
    color: '#ffffff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
    gap: 10,
    padding: 3,
  },
});
