import { Text, View, StyleSheet, TextInput, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getToken } from '../firebase/firebaseAuth';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setEmail('');
        try {
          const fetchedToken = await getToken();
          setToken(fetchedToken ?? null);
        } catch {
          setToken('Failed to fetch token');
        }
      } else {
        setToken(null);
      }
      setPassword('');
    });
    return unsubscribe;
  }, []);
  

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      Alert.alert("Logged out");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Logged in: {user.email}</Text>
          <Text>Token: {token}</Text>
          <Button title="Logout" onPress={handleLogout} color="#d9534f" />
        </>
      ) : (
        <>
          <Text style={styles.title}>Log In / Register</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter a password - minimum 6 letters"
            placeholderTextColor="#aaaaaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
          <View style={styles.buttonContainer}>
            <Button title="Login" onPress={handleLogin} color="#00bfff" />
            <Button title="Register" onPress={handleRegister} color="#32cd32" />
          </View>
        </>
      )}
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
