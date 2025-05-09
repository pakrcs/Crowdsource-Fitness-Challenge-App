import { Text, View, StyleSheet, TextInput, Button, ScrollView } from 'react-native';
import { useState } from 'react';

export default function Index() {
  const [challenges] = useState([
      { title: '5K Run Challenge', description: 'Complete three 5K runs within 7 days.' },
      { title: '7-Day Plank Challenge', description: 'Hold a plank for 1 minute a day for 7 days.' },
      { title: 'Push-up Master', description: 'Do 50 push-ups a day for 7 days.' },
    ]);

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { user: 'Billy', text: 'Just finished my first 5K run today!' },
    { user: 'Bob', text: 'Started the plank challenge today and my core burns.' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChat([...chat, { user: 'You', text: message }]);
      setMessage('');
    }
  };

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

      {/* Community feed for user interaction 
        * Will need to store chats in database later. This is for testing.
        */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        <ScrollView style={styles.feedContainer}>
          {chat.map((post, index) => (
            <View key={index} style={styles.feedItem}>
              <Text style={styles.feedUser}>{post.user}</Text>
              <Text style={styles.feedText}>{post.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Messaging bar */}
        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
          />
          <Button title="Send" onPress={handleSendMessage} color="#00bfff" />
        </View>
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
