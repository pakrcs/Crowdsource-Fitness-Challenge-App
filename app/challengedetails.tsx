import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';

/* This is placeholder info until database is setup. Will be pulled from the sql table.
   Title, Description, Difficulty, Goals
   Example of how the detail screen can look.
*/
export default function ChallengeDetailsScreen() {
  {/* Data will be fetched from Flask backend. Should be something like this:
      useEffect(() => {
        fetch(`SQL route/challenges/$ID`)
          .then((response) => response.json())
          .then((data) => setChallenge(data))
          .catch((error) => console.error(error));
      }, [challengeId]);
  */}

  // Example goals
  const goals = [
    'Complete first workout',
    'Skip dessert on Day 4',
    'Finish the 7th workout'
  ];

  const [currentGoal, setCurrentGoal] = useState(0);

  const advanceProgress = () => {
    if (currentGoal < goals.length) {
      setCurrentGoal(currentGoal + 1);
    }

    // If all goals are completed, show the "badge earned" popup
    if (currentGoal + 1 === goals.length) {
      alert('Congratulations, you have earned a badge for completing the challenge!')
    }
  };

  // Current hardcoded data to visually show functionality and interaction with app
  return (
    <View style={styles.container}>
      {/* Data from table displayed like this:
          <Text style={styles.title}>{challenge.title}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
          <Text style={styles.difficulty}>Difficulty: {challenge.difficulty}</Text> 
      */}

      {/* Title */}
      <Text style={styles.title}>7-day Weight Training</Text>

      {/* Description */}
      <Text style={styles.description}>
        A 7-day bodyweight workout challenge designed to improve overall strength and fitness.{'\n'} 
        Perfect for beginners and can be done at home with no equipment required. Start slow and focus on form.{'\n'}
        Complete 8 reps and 3 sets of each exercise.{'\n'}
        Day 1: Squats, Push-ups, and Planks.{'\n'}
        Day 2: Easy neighborhood walk.{'\n'}
        Day 3: Lunges and Sit-ups.{'\n'}
        Day 4: Rest your body!{'\n'}
        Day 5: Squats, Push-ups, and 20 second Mountain Climbers.{'\n'}
        Day 6: Easy neighborhood walk.{'\n'}
        Day 7: 1 set of Push-ups, Squats, and Lunges until failure.
      </Text>

      {/* Difficulty */}
      <Text style={styles.difficulty}>Difficulty: Intermediate</Text>

      {/* Goal list */}
      <ScrollView contentContainerStyle={styles.goalsContainer}>
        {goals.map((goal, index) => (
          <View
            key={index}
            style={[
              styles.goalItem,
              index < currentGoal ? styles.completedGoal : null,
            ]}
          >
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Progress button turns completed goals green */}
      <TouchableOpacity
        style={styles.progressButton}
        onPress={advanceProgress}
        disabled={currentGoal >= goals.length}
      >
        <Text style={styles.progressButtonText}>
          {currentGoal < goals.length ? 'Progress' : 'Completed!'}
        </Text>
      </TouchableOpacity>
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
  description: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  difficulty: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  goalsContainer: {
    marginBottom: 16,
  },
  goalItem: {
    backgroundColor: '#444',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  completedGoal: {
    backgroundColor: '#00c853',
  },
  goalText: {
    color: '#fff',
    fontSize: 16,
  },
  progressButton: {
    backgroundColor: '#5a5d65',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
