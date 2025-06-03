import { Text, View, StyleSheet, TextInput, Button, Alert, FlatList, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getToken } from '../firebase/firebaseAuth';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { getAccountInfo, createAccount } from '../api/accountAPI';
import { getChallengesByCreator, Challenge } from '../api/challengeAPI';


// Sample user data
const sampleUserData = {
  username: "sampleUser",
  email: "sample@email.com",
  badgeCount: 7666,
  bronze: 32,
  silver: 7,
  gold: 3,
  profilePic: "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png", 
  createdChallenges: [
    { id: '1', title: "Mile run" },
    { id: '2', title: "One pushup everyday" }
  ],
  favoriteChallenges: [
    { id: '3', title: "IN PROGRESS" },
    { id: '4', title: "Plank for 2 minutes" }
  ]
};

// Default User Info
const initialUserInfo = {
  username: '',
  profilePic: '',
  bronze_badges: 0,
  silver_badges: 0,
  gold_badges: 0,
}


export default function AccountScreen() {
  // User Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userInfo, setUserInfo] = useState({
    username: '',
    profilePic: '',
    bronze_badges: 0,
    silver_badges: 0,
    gold_badges: 0,
  });
   // Sample Data Goals
  const [goals, setGoals] = useState<string[]>([
    "IN PROGRESS",
    "Workout 5x week"
  ]);

  const [token, setToken] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const router = useRouter();

  // Register modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [createdChallenges, setCreatedChallenges] = useState<Challenge[]>([]);


  // Point calculation
  const bronze = userInfo?.bronze_badges  || 0
  const silver = userInfo?.silver_badges  || 0
  const gold   = userInfo?.gold_badges    || 0
  const pointTotal = bronze * 1 + silver * 2 + gold * 3  

  // Get user 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);

      if (!firebaseUser) {
        // Sign out and clear info
        setUserInfo(initialUserInfo);
        setLoading(false);
        return;
      }

      if (isRegistering) {
        return;
      }

      // Signed in and fetch backend data
      setLoading(true);
      try {
        const info = await getAccountInfo();
        setUserInfo(info);
      } catch (err: any) {
        setError(err.message || 'Could not load account info');
        setUserInfo(initialUserInfo);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [isRegistering]);

  // Get challenges
  useEffect(() => {
    if (!user?.uid) {
      setCreatedChallenges([]);
      return;
    }
    (async () => {
      try {
        const { challenges } = await getChallengesByCreator(user.uid);
        setCreatedChallenges(challenges);
      } catch (e) {
        console.warn('Could not load created challenges', e);
      }
    })();
  }, [user]);

  // Register user
  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      Alert.alert("Success", "User registered.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Login user
  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      Alert.alert("Success", "User logged in.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Logout user
  const handleLogout = async () => {
    try {
      await logoutUser();
      Alert.alert("Logged out");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Registration modal
  const openRegister = () => {
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setRegError(null);
    setShowRegisterModal(true);
  };

  // Handle backend account creation
  const handleRegisterSubmit = async () => {
    if (!regUsername || !regEmail || !regPassword) {
      setRegError('All fields are required');
      return;
    }
    setRegLoading(true);
    setRegError(null);
    setIsRegistering(true); 

    try {
      // Create firebase user
      await registerUser(regEmail, regPassword);
      // Create backend account 
      await createAccount(regUsername);
      // Update info
      const freshInfo = await getAccountInfo();
+     setUserInfo(freshInfo);

      Alert.alert('Success', 'Account created.');
      setShowRegisterModal(false);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setRegLoading(false);
      setIsRegistering(false); 
    }
  };

  // Loading screen
  if (loading) {
    return (
      <View style={{ flex:1,justifyContent:'center',alignItems:'center', backgroundColor: '#282c34' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return <Text style={{color:'red'}}>Error: {error}</Text>;
  }

return (
    <>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {user ? (
            <>
              {/* USER INFO ROW */}
              <View style={styles.row}>
                <View style={[styles.box, styles.topRow, { marginRight: 5, alignItems: "center" }]}>
                  <Image source={{ uri: userInfo?.profilePic || sampleUserData.profilePic }} style={styles.profilePic}/>
                  <Text style={styles.infoText}>
                    <Text style={styles.label}>Username:</Text>{' '}
                    {userInfo?.username}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.label}>Email:</Text> {user.email}
                  </Text>

                  {/* SOCIAL MEDIA BUTTONS */}
                  <View style={styles.socialRow}>
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

                  {/* LOGOUT BUTTON */}
                  <View style={styles.logoutButton}>
                    <Button
                      title="Logout"
                      onPress={handleLogout}
                      color="#d9534f"
                    />
                  </View>
                </View>

                {/* WALL OF FAME BOX */}
                <TouchableOpacity style={[styles.box, styles.topRow, {marginLeft: 5, alignItems: 'center', justifyContent: 'center'}]}
                activeOpacity={0.7}
                onPress={() => router.push('/wallOfFame')}
                >
                  <Text style={styles.wofTitle}>Wall of Fame</Text>
                  <Text style={styles.infoText}>You have</Text>
                  <Text style={styles.badgeCount}>{pointTotal}</Text>
                  <Text style={styles.infoText}>points!</Text>
                </TouchableOpacity>
              </View>

              {/* BADGES SECTION */}
              <View style={[styles.box, styles.badgesSection]}>
                <Text style={styles.boxTitle}>Badges</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badgeItem}>
                    <Text style={styles.badgeLabel}>Bronze</Text>
                    <Text style={styles.badgeNumber}>{userInfo.bronze_badges ?? 0}</Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <Text style={styles.badgeLabel}>Silver</Text>
                    <Text style={styles.badgeNumber}>{userInfo.silver_badges ?? 0}</Text>
                  </View>
                  <View style={styles.badgeItem}>
                    <Text style={styles.badgeLabel}>Gold</Text>
                    <Text style={styles.badgeNumber}>{userInfo.gold_badges ?? 0}</Text>
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

              {/* USER CHALLENGES BOX */}
              <View style={styles.box}>
                <Text style={styles.boxTitle}>Your Exercise Challenges</Text>
                {createdChallenges.length > 0 ? (
                  <FlatList
                    data={createdChallenges}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.listItem}>
                        <Text style={styles.itemText}>{item.title}</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.infoText}>You haven’t created any challenges yet.</Text>
                )}
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
              {/* LOGIN / OPEN REGISTER */}
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
                placeholder="Enter your password"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <View style={styles.buttonContainer}>
                <Button
                  title="Login"
                  onPress={handleLogin}
                  color="#00bfff"
                />
                <Button
                  title="Register"
                  onPress={openRegister}
                  color="#32cd32"
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* REGISTER MODAL */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Account</Text>
            {regError ? (
              <Text style={styles.modalError}>{regError}</Text>
            ) : null}
            <TextInput
              style={styles.modalInput}
              placeholder="Username"
              value={regUsername}
              onChangeText={setRegUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              value={regEmail}
              onChangeText={setRegEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              value={regPassword}
              onChangeText={setRegPassword}
              secureTextEntry
            />
            {regLoading ? (
              <ActivityIndicator style={{ margin: 10 }} />
            ) : (
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowRegisterModal(false)}
                  color="#888"
                />
                <Button
                  title="Create"
                  onPress={handleRegisterSubmit}
                  color="#32cd32"
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',   
    flexWrap: 'nowrap',         
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  modalTitle: { 
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalError: { 
    color: 'red',
    marginBottom: 8
  },
  modalInput: {
    backgroundColor: 'd3d3d3',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
