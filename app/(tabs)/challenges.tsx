import { Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';

//--API test--
import { createChallenge } from '../api/challengeAPI';
import { Alert, Button } from 'react-native';
//------------

export default function ChallengesScreen() {
  // Dummy data for now before backend itegration
  const challenges = [
    { id: '1', title: 'Run a mile' },
    { id: '2', title: '7-day weight training' },
    { id: '3', title: 'Zumba classes' },
    { id: '4', title: 'etc...' },
    { id: '5', title: 'will replace with backend integration to database' }
  ];

  return (
    <View style={styles.container}>
      {/* Title for the screen*/}
      <Text style={styles.title}>Fitness Challenges</Text>

      {/* Search bar and filter button */}
      <View style={styles.searchFilterRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search challenges"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Challenge list to add BACKEND integration later
        * Using dummy data for now (see challenges const above)
        */}
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.challengeItem}>
            <Text style={styles.challengeText}>{item.title}</Text>

            {/* Sample details button to nav to new screen.
              * Functionality replaced by pressing on the imported database item to nav to specific details 
              */}
            {item.title === '7-day weight training' && (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push('/challengedetails')}
              >
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* ------------------API TESTING----------------------*/}  
      <Button
        title="Create Test Challenge"
        onPress={async () => {
          try {
            const result = await createChallenge({
              title: "Frontend Test Challenge",
              description: "Created from Expo app!"
            });
            console.log("Challenge created:", result);
            Alert.alert("Success", "Challenge created!");
          } catch (error) {
            console.error("Error creating challenge:", error);
            Alert.alert("Error", "Failed to create challenge.");
          }
        }}
        color="#32cd32"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchFilterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#3a3f47',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  filterButton: {
    backgroundColor: '#5a5d65',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    paddingTop: 8,
  },
  challengeItem: {
    backgroundColor: '#3a3f47',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  challengeText: {
    color: '#fff',
    fontSize: 16,
  },
  // Replace later
  detailsButton: {
    backgroundColor: '#5a5d65',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
