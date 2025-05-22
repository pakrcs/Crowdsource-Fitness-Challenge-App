import React, { useState, useEffect } from 'react';
import {Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ScrollView, SafeAreaView} from 'react-native';
import { router } from 'expo-router';
import { getChallenges } from '../api/challengeAPI';

// Define the structure of a challenge object
type Challenge = {
  id: number;
  title: string;
  description?: string;
  goal?: number;
  unit?: string;
  difficulty?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  creator?: string;
};

export default function ChallengesScreen() {
  const [search, setSearch] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [expandedDifficulty, setExpandedDifficulty] = useState<string | null>(null);

  // Fetch challenges from backend API on initial component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getChallenges(); // Call API to get challenges
        setChallenges(data.challenges || []);
      } catch (error) {
        console.error('Failed to load challenges:', error);
      }
    };
    fetchData();
  }, []);

  // Automatically expand a difficulty section if a matching challenge is found from search input
  // useEffect(() => {
  //   if (search.trim() !== '') {
  //     const match = challenges.find(c =>
  //       c.title.toLowerCase().includes(search.toLowerCase())
  //     );
  //     // If a match is found and it has a difficulty, expand that section
  //     if (match?.difficulty) {
  //       setExpandedDifficulty(match.difficulty.toLowerCase() || null);
  //     }
  //   } else {
  //     setExpandedDifficulty(null);
  //   }
  // }, [search, challenges]);
  useEffect(() => {
    if (search.trim() !== '') {
      setExpandedDifficulty('all');  // Show all difficulties
    } else {
      setExpandedDifficulty(null);   // Collapse when search is cleared
    }
  }, [search]);

  // Add a challenge to the user's active list, preventing duplicates
  const handleAddChallenge = (challenge: Challenge) => {
    if (!activeChallenges.some(c => c.id === challenge.id)) {
      setActiveChallenges(prev => [...prev, challenge]);
    } else {
      Alert.alert('Already added', `${challenge.title} is already in your challenges.`);
    }
  };

  // Remove a challenge from the user's active list by ID
  const handleRemoveChallenge = (id: number) => {
    setActiveChallenges(prev => prev.filter(c => c.id !== id));
  };

  // Toggle a difficulty section open/closed
  const toggleSection = (difficulty: string) => {
    setExpandedDifficulty(prev =>
      search.trim() === '' && prev === difficulty ? null : difficulty
    );
  };

  // Predefined difficulty levels
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  // Group challenges by their difficulty level
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const key = (challenge.difficulty || 'other').toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(challenge);
    return acc;
  }, {} as { [key: string]: Challenge[] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Fitness Challenges</Text>

        {/* Search bar and filter */}
        <View style={styles.searchFilterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search challenges"
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Select a difficulty level to view available challenges
        </Text>

        {/* Top section: collapsible difficulty challenges */}
        <ScrollView
          style={styles.wrapper}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {difficulties.map(level => (
            <View key={level}>
              {/* Difficulty header toggle */}
              <TouchableOpacity
                style={styles.difficultyHeader}
                onPress={() => toggleSection(level)}
              >
                <Text style={styles.difficultyHeaderText}>
                  {expandedDifficulty === level
                    ? `▼ ${level.charAt(0).toUpperCase() + level.slice(1)}`
                    : `► ${level.charAt(0).toUpperCase() + level.slice(1)}`}
                </Text>
              </TouchableOpacity>

              {/* List challenges if this section is expanded or all are expanded */}
              {(expandedDifficulty === level || expandedDifficulty === 'all') &&
                groupedChallenges[level]
                  ?.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
                  .map(item => (
                    <View key={item.id} style={styles.challengeItem}>
                      <View style={styles.rowContainer}>
                        <Text style={styles.challengeText}>{item.title}</Text>
                        <View style={{ flexDirection: 'row' }}>
                          <TouchableOpacity
                            style={[
                              styles.detailsButton,
                              { backgroundColor: '#32cd32' },
                            ]}
                            onPress={() => handleAddChallenge(item)}
                          >
                            <Text style={styles.detailsButtonText}>Add</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
            </View>
          ))}
        </ScrollView>

        {/* Bottom section: fixed height and scrollable list */}
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionHeader}>Your Current Challenges</Text>
          <FlatList
            data={activeChallenges}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.challengeItem}>
                <View style={styles.rowContainer}>
                  <Text style={styles.challengeText}>{item.title}</Text>
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.detailsButton, { marginRight: 8 }]}
                      onPress={() =>
                        router.push({
                          pathname: '/challengedetails',
                          params: { id: item.id.toString() },
                        })
                      }
                    >
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.detailsButton, { backgroundColor: '#d9534f' }]}
                      onPress={() => handleRemoveChallenge(item.id)}
                    >
                      <Text style={styles.detailsButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={{
              paddingBottom: 80,
              paddingHorizontal: 16,
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  searchFilterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
    paddingHorizontal: 16,
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
  sectionHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
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
    flexShrink: 1,
  },
  detailsButton: {
    backgroundColor: '#5a5d65',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  difficultyHeader: {
    backgroundColor: '#3a3f47',
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
  },
  difficultyHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});