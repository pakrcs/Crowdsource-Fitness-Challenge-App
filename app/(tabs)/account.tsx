import { Text, View, StyleSheet, TextInput, Button, Alert, FlatList, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getToken } from '../firebase/firebaseAuth';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';


// Sample user data
const sampleUserData = {
  username: "sampleUser",
  email: "sample@email.com",
  badgeCount: 7666,
  bronze: 32,
  silver: 7,
  gold: 3,
  profilePic: "https://randomuser.me/api/portraits/women/92.jpg", 
  createdChallenges: [
    { id: '1', title: "Mile run" },
    { id: '2', title: "One pushup everyday" }
  ],
  favoriteChallenges: [
    { id: '3', title: "Morning yoga stretches" },
    { id: '4', title: "Plank for 2 minutes" }
  ]
};

export default function AccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Sample Data Goals
  const [goals, setGoals] = useState<string[]>([
    "Run a marathon",
    "Workout 5x week"
  ]);

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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View style={styles.container}>
      {user ? (
        <>
          {/* USER INFO / BADGES ROW */}
          <View style={styles.row}>
            {/* USER INFO BOX */}
            <View style={[styles.box, styles.topRow, { marginRight: 5, alignItems: "center" }]}>
              <Image source={{ uri: sampleUserData.profilePic }} style={styles.profilePic} />
              <Text style={styles.infoText}>
                <Text style={styles.label}>Username:</Text> {sampleUserData.username}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.label}>Email:</Text> {user.email}
              </Text>
              
              {/* SOCIAL MEDIA BUTTONS */}
              <View style={{ flexDirection: 'row', marginVertical: 10 }}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="google" size={24} color="#db4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="twitter" size={24} color="#1da1f2" /> 
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="facebook-square" size={28} color="#4267B2" />
                </TouchableOpacity>
              </View>

              <View style={styles.logoutButton}>
                <Button 
                  title="Logout" 
                  onPress={handleLogout}
                  color="#d9534f" 
                />
              </View>
            </View>

            {/* WALL OF FAME BOX: Update with w/e system decided on */}
            <View style={[styles.box, styles.topRow, { marginLeft: 5, alignItems: "center", justifyContent: "center" }]}>
              <Text style={styles.wofTitle}>Wall of Fame Placeholder</Text>
              <Text style={styles.infoText}>Rank #1 You have</Text>
              <Text style={styles.badgeCount}>{sampleUserData.badgeCount}</Text>
              <Text style={styles.infoText}>badges!</Text>
            </View>
          </View>

          {/* BADGES SECTION */}
          <View style={[styles.box, styles.badgesSection]}>
            <Text style={styles.boxTitle}>Badges</Text>
            <View style={styles.badgeRow}>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeLabel}>Bronze</Text>
                <Text style={styles.badgeNumber}>{sampleUserData.bronze}</Text>
              </View>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeLabel}>Silver</Text>
                <Text style={styles.badgeNumber}>{sampleUserData.silver}</Text>
              </View>
              <View style={styles.badgeItem}>
                <Text style={styles.badgeLabel}>Gold</Text>
                <Text style={styles.badgeNumber}>{sampleUserData.gold}</Text>
              </View>
            </View>
          </View>

          {/* GOALS SECTION */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Your Goals</Text>
            <FlatList
              data={goals}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <View style={styles.listItem}>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              )}
            />
          </View>

          {/* USER CHALLENGES BOX: Update when challenge system decided */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Your Exercise Challenges</Text>
            {sampleUserData.createdChallenges.map((ch) => (
              <View key={ch.id} style={styles.listItem}>
                <Text style={styles.itemText}>{ch.title}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/challenges')}>
              <Text style={styles.challengesLink}>Go to challenges → </Text>
            </TouchableOpacity>
          </View>

          {/* FAVORITE CHALLENGES BOX */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Favorited Exercise Challenges</Text>
            {sampleUserData.favoriteChallenges.map((fav) => (
              <View key={fav.id} style={styles.listItem}>
                <Text style={styles.itemText}>{fav.title}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={() => router.push('/challenges')}>
              <Text style={styles.challengesLink}>Go to challenges → </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* LOG IN / REGISTER */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  row: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 10,
  },
  topRow: {
    flex: 1,
    minWidth: "47%",
    maxWidth: "50%",
  },
  box: {
    backgroundColor: '#323743',
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
    width: '100%',
  },
  boxTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: "center",
  },
  label: {
    color: '#ff1',
    fontWeight: 'bold',
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  wofTitle: {
    color: '#ffd700',
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 2,              
    textShadowColor: '#ff1',
    textShadowRadius: 21,
    textTransform: 'uppercase',    
    fontFamily: 'serif',           
  },
  badgeCount: {
    color: '#32cd32',
    fontWeight: 'bold',
    fontSize: 30,
    marginVertical: 4,
    textAlign: "center",
  },
  badgesSection: {
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  badgeItem: {
    flex: 1,
    alignItems: 'center',
  },
  badgeLabel: {
    color: '#fff',
    fontSize: 16,
    marginTop: 2,
  },
  badgeNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 2,
  },  
  itemText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 2,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#32cd32"
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
    marginTop: 15,
    gap: 10,
    padding: 3,
  },
  logoutButton: {
    paddingTop: 10,
    alignItems: 'center',    
    justifyContent: 'center',
    width: '40%',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  listItem: {
    backgroundColor: '#292f36',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 4,
    marginHorizontal: 2,
    minHeight: 32,
  },
  challengesLink: {
    paddingHorizontal: 6,
    color: '#d3d3d3',
    fontWeight: 'bold'
  },
  socialButton: {
    marginHorizontal: 10,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#fff'
  }  
});
