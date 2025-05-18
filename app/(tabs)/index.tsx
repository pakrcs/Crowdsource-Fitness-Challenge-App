import { Text, View, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Index() {
  const [challenges] = useState([
    { title: '5K Run Challenge', description: 'Complete three 5K runs within 7 days.' },
    { title: '7-Day Plank Challenge', description: 'Hold a plank for 1 minute a day for 7 days.' },
    { title: 'Push-up Master', description: 'Do 50 push-ups a day for 7 days.' }
  ]);

  // Generated dummy data till database
  const [chat] = useState([
    { user: 'Billy',  text: 'Just finished my first 5K run today! Feeling amazing.' },
    { user: 'Emily',  text: 'Day 3 of the plank challenge. My abs are on fire!' },
    { user: 'Carlos', text: 'Crushed 50 push-ups today. Never thought I could!' },
    { user: 'Mike',   text: 'Anyone want to join a weekend yoga session outdoors?' },
    { user: 'Tyler',  text: 'Took my dog on a 5K run. We both needed it!' },
    { user: 'Mark',   text: 'Rest day today, but I’m still tracking nutrition.' },
    { user: 'Mason',  text: 'Joined the squat challenge! 100 a day for 7 days' },
    { user: 'Bob',    text: 'Completed 10K steps before 10am. Small wins!' },
    { user: 'Liam',   text: 'Any tips for sore muscles after push-ups?' }
  ]);

  return (
    <View style={styles.container}>
      {/* Welcome */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome to the Fitness Challenge App!</Text>
      </View>

      {/* Popular challenges that users see*/}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>Popular Challenges</Text>
        <ScrollView style={styles.challengesContainer}>
          {challenges.map((challenge, index) => (
            <View key={index} style={styles.challengeItem}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Community chat preview */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Latest From the Community</Text>
        {/* Shows last 5 messages from the database. Can change number. */}
        {chat.slice(-5).map((post, index) => (
          <View key={index} style={styles.feedItem}>
            <Text style={styles.feedUser}>{post.user}</Text>
            <Text style={styles.feedText}>{post.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  banner: {
    width: '100%',
    backgroundColor: '#00bfff',
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  challengesSection: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  challengesContainer: {
    width: '100%',
    maxHeight: 200,
    marginBottom: 20,
  },
  challengeItem: {
    backgroundColor: '#3e3e47',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  challengeDescription: {
    color: '#ddd',
    fontSize: 14,
  },
  feedSection: {
    width: '100%',
    flex: 1,
    marginTop: 10,
  },
  feedContainer: {
    width: '100%',
    maxHeight: 300,
    marginBottom: 20,
  },
  feedItem: {
    marginBottom: 12,
  },
  feedUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  feedText: {
    color: '#ddd',
    fontSize: 14,
  },
  chatInputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3e3e47',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#3e3e47',
    borderRadius: 20,
    paddingHorizontal: 10,
    color: '#fff',
    marginRight: 10,
  },
});
