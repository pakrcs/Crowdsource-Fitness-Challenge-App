import { Alert, View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { getChallengeById } from './api/challengeAPI';
import { updateProgress } from './api/challengeAPI';
import { addFavorite } from './api/favoriteAPI'; 

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
  goal_list?: string[];
};

export default function ChallengeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [isFavorited, setIsFavorited]   = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const data = await getChallengeById(Number(id));
        setChallenge(data);
      } catch (error) {
        console.error('Failed to fetch challenge details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const handleComplete = async () => {
    if (!challenge) return;

    try {
      const res = await updateProgress(challenge.id);
      console.log("Backend response:", res);

      if (res.completed) {
        setCompleted(true);
        console.log("setCompleted(true) called");
      } else {
        console.log("res.completed was false");
      }
    } catch (err) {
      console.error("updateProgress failed:", err);
      Alert.alert("Error", "Could not update progress.");
    }
  };

  const handleFavorite = async () => {
    if (!challenge) return;
    try {
      await addFavorite(challenge.id);
      setIsFavorited(true);
      Alert.alert('Success', 'Added to Favorites.');
    } catch (error: any) {
      console.error('addFavorite failed:', error);
      Alert.alert('Error', error.message || 'Could not add to favorites.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!challenge) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Challenge not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.label}>Description:</Text>
      <Text style={styles.value}>{challenge.description || 'No description.'}</Text>

      <Text style={styles.label}>Goal:</Text>
      <Text style={styles.value}>
        {challenge.goal} {challenge.unit}
      </Text>

      <Text style={styles.label}>Difficulty:</Text>
      <Text style={styles.value}>{challenge.difficulty}</Text>

      <Text style={styles.label}>Start Date:</Text>
      <Text style={styles.value}>{challenge.start_date}</Text>

      <Text style={styles.label}>End Date:</Text>
      <Text style={styles.value}>{challenge.end_date}</Text>

      <Text style={styles.label}>Created At:</Text>
      <Text style={styles.value}>{challenge.created_at}</Text>

      <Text style={styles.label}>Creator UID:</Text>
      <Text style={styles.value}>{challenge.creator}</Text>

      <View style={styles.buttonContainer}>
        <Text style={styles.completionLabel}>
          {completed ? "✅ Completed!" : ""}
        </Text>
        {!completed && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <Text style={styles.buttonText}>Add to Favorites</Text>
          </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 12,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  errorText: {
    color: '#f88',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 40,
  },
  completeButton: {
    backgroundColor: '#32cd32',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  favoriteButton: {
    backgroundColor: '#00bfff',
    paddingVertical: 12,
    paddingHorizontal: 36,
    borderRadius: 8,
    marginTop: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#32cd32',
    marginBottom: 12,
  }
});
