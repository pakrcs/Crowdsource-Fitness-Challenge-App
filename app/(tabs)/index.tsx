import { Text, View, StyleSheet, ScrollView, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { getHomeContent, ChallengePreview, CommunityMessage } from '../api/homeAPI';

export default function Index() {
  const [challenges, setChallenges] = useState<ChallengePreview[]>([]);
  const [chat, setChat] = useState<CommunityMessage[]>([]);

  useEffect(() => {
    async function loadHome() {
      try {
        const data = await getHomeContent();
        setChallenges(data.latest_challenges);
        setChat(data.latest_community_messages);
      } catch (err) {
        console.error('Error loading home content:', err);
      }
    }

    loadHome();
  }, []);

  return (
    <View style={styles.container}>
      {/* Welcome banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Welcome to the Fitness Challenge App!</Text>
      </View>

      {/* Preview of the latest user challenges */}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>Latest Challenges</Text>
        <ScrollView style={styles.challengesContainer}>
          {challenges.map((challenge, index) => (
            <View key={index} style={styles.challengeItem}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDescription}>{challenge.description}</Text>
              <Text style={styles.challengeDifficulty}>Difficulty: {challenge.difficulty}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Preview of the latest user chat messages */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Latest From the Community</Text>
        <ScrollView style={styles.feedContainer}>
          {chat.map((chat, index) => (
            <View key={index} style={styles.feedItem}>
              <Text style={styles.feedUser}>{chat.user}</Text>
              <Text style={styles.feedText}>{chat.text}</Text>
              {chat.image_url && (
                <Image
                  source={{ uri: chat.image_url }}
                  style={styles.chatImage}
                  resizeMode="cover"
                />
              )}
            </View>
          ))}
        </ScrollView>
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
    backgroundColor: '#007bff',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  bannerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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
  // Challenges Preview
  challengesContainer: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 10,
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
    marginBottom: 4,
  },
  challengeDescription: {
    color: '#ddd',
    fontSize: 16,
    marginBottom: 4,
  },
  challengeDifficulty: {
    color: '#ddd',
    fontSize: 14,
  },
  feedSection: {
    width: '100%',
    flex: 1,
    marginTop: 10,
  },
  // Chat Preview
  feedContainer: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 10,
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
  chatImage: {
    width: 200,
    height: 200,
    borderRadius: 4,
    marginTop: 8,
    resizeMode: 'contain',
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
