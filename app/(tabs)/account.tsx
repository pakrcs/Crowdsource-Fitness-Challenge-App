import { Text, View, StyleSheet, TextInput, Button, Alert, FlatList, Image, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getToken } from '../firebase/firebaseAuth';
import { auth } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { getAccountInfo, createAccount } from '../api/accountAPI';
import { getChallengesByCreator, Challenge } from '../api/challengeAPI';
import { getGoals, createGoal, deleteGoal } from '../api/goalAPI';
import { getFavorites, FavoriteChallenge, deleteFavorite } from '../api/favoriteAPI'
import { useFocusEffect } from '@react-navigation/native';
import { useCallback }         from 'react';
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

  // Goals
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false)

  // Favorites
  const [favorites, setFavorites] = useState<FavoriteChallenge[]>([])
  const [showFavModal, setShowFavModal] = useState(false)
  const [selectedFav, setSelectedFav] = useState<FavoriteChallenge | null>(null)
  const loadFavorites = async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error: any) {
      Alert.alert('Error loading favorites', error.message);
    }
  };

  // Setup
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const bronze = userInfo?.bronze_badges || 0
  const silver = userInfo?.silver_badges || 0
  const gold = userInfo?.gold_badges || 0
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

  // Get goals
  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }
    (async () => {
      try {
        const g = await getGoals();
        setGoals(g);
      } catch (error) {
        console.warn('Failed to load goals', error);
      }
    })();
  }, [user]);

  // Get favorites
  useEffect(() => {
    (async () => {
      try {
        const favs = await getFavorites()
        setFavorites(favs)
      } catch (error) {
        Alert.alert('Error loading favorites', error.message)
      }
    })()
  }, [user])

  // Update favs
  useEffect(() => {
    if (user) loadFavorites();
    else setFavorites([]);
  }, [user]);

  
  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFavorites();
      }
    }, [user])
  );

  // Delete favorite
  const handleRemoveFavorite = async () => {
    if (!selectedFav) return
    try {
      await deleteFavorite(selectedFav.id)
      setFavorites(favs => favs.filter(f => f.id !== selectedFav.id))
      setShowFavModal(false)
      setSelectedFav(null)
    } catch (error) {
      Alert.alert('Error', error.message)
    }
  }

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

  // Add goal
  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      const g = await createGoal(newTitle, newDesc);
      setGoals(current => [g, ...current]);
      setNewTitle(''); setNewDesc(''); setShowGoalModal(false);
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // Delete goal
  const handleDelete = async (id: number) => {
    try {
      await deleteGoal(id);
      setGoals(current => current.filter(g => g.id !== id));
    } catch (error) {
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#282c34' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (error) {
    return <Text style={{ color: 'red' }}>Error: {error}</Text>;
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
                  <Image source={{ uri: "https://cdn.pixabay.com/photo/2017/07/18/23/23/user-2517433_1280.png" }} style={styles.profilePic} />
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
                <TouchableOpacity style={[styles.box, styles.topRow, { marginLeft: 5, alignItems: 'center', justifyContent: 'center' }]}
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
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.goalRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.goalTitle}>{item.title}</Text>
                        {item.description ? (
                          <Text style={styles.goalDesc}>{item.description}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Text style={{ marginRight: 8, fontSize: 12, color: 'white' }}>Done & Delete</Text>
                        <Icon name="check" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={<Text>No goals yet</Text>}
                />

                <TouchableOpacity
                  style={[styles.buttonContainer, { justifyContent: 'center' }]}
                  onPress={() => setShowGoalModal(true)}
                >
                  <Text style={{ color: '#fff', fontSize: 15 }}>Add New Goal +</Text>
                </TouchableOpacity>
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
                <FlatList
                  data={favorites}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.listItem}
                      onPress={() => {
                        setSelectedFav(item)
                        setShowFavModal(true)
                      }}
                    >
                      <Text style={styles.itemText}>{item.title}</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={styles.infoText}>No favorites yet</Text>}
                />
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
      </ScrollView >

      {/* REGISTER MODAL */}
      < Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowRegisterModal(false)
        }
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
      </Modal >

      {/* ADD GOAL MODAL */}
      <Modal
        visible={showGoalModal}
        transparent
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: '#000' }]}>New Goal</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Description"
              value={newDesc}
              onChangeText={setNewDesc}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setShowGoalModal(false)} />
              <Button title="Add" onPress={handleAdd} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Favorites MODAL */}
      <Modal
        visible={showFavModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFavModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFav?.title}</Text>
            {selectedFav && (
              <ScrollView>
                <Text>Creator: {selectedFav.creator}</Text>
                <Text>Description: {selectedFav.description}</Text>
                <Text>Goal: {selectedFav.goal} {selectedFav.unit}</Text>
                <Text>Difficulty: {selectedFav.difficulty}</Text>
                <Text>Start: {selectedFav.start_date}</Text>
                <Text>End: {selectedFav.end_date}</Text>
                <Text>Created At: {selectedFav.created_at}</Text>
                <Text>Goal List:</Text>
                {selectedFav.goal_list?.map((g, i) => (
                  <Text key={i}>• {g}</Text>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={handleRemoveFavorite}
              style={{ backgroundColor: 'red', padding: 10, borderRadius: 5 }}
            >
              <Text style={{ color: 'white', textAlign: 'center' }}>
                REMOVE FROM FAVORITES
              </Text>
            </TouchableOpacity>
            <Button title="Close" onPress={() => setShowFavModal(false)} />
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
    marginBottom: 6,
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
    backgroundColor: '#292f36',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 4,
    width: '100%',
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
  },
  addContainer: {
    width: '100%',
    backgroundColor: '#323743',
    borderRadius: 10,
    padding: 16,
    marginVertical: 10,
  },
  goalTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  goalDesc: {
    color: '#ccc',
    fontSize: 14,
  }
});
