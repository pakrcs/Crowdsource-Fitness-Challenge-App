import { Text, View, StyleSheet, TextInput, Button, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';

export default function CommunityScreen() {
  // Dummy data until database is integrated
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ user: string; text: string; image: string | null }>>([
    { user: 'Billy',  text: 'Just finished my first 5K run today! Feeling amazing.', image: null },
    { user: 'Emily',  text: 'Day 3 of the plank challenge. My abs are on fire!', image: null },
    { user: 'Carlos', text: 'Crushed 50 push-ups today. Never thought I could!', image: null },
    { user: 'Mike',   text: 'Anyone want to join a weekend yoga session outdoors?', image: null },
    { user: 'Tyler',  text: 'Took my dog on a 5K run. We both needed it!', image: null },
    { user: 'Mark',   text: 'Rest day today, but I’m still tracking nutrition.', image: null },
    { user: 'Mason',  text: 'Joined the squat challenge! 100 a day for 7 days', image: null },
    { user: 'Bob',    text: 'Completed 10K steps before 10am. Small wins!', image: null },
    { user: 'Liam',   text: 'Any tips for sore muscles after push-ups?', image: null }
  ]);

  // Hold the image URI
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSendMessage = () => {
    if (message.trim() || selectedImage) {
      // Add the message to the chat
      setChat([...chat, { user: 'You', text: message, image: selectedImage }]);
      setMessage('');
      setSelectedImage(null);
    }
  };

  // Open the image picker and select a user image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    // Match to result format
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Community feed for user interaction */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        <ScrollView style={styles.feedContainer}>
          {chat.map((post, index) => (
            <View key={index} style={styles.feedItem}>
              <Text style={styles.feedUser}>{post.user}</Text>
              <Text style={styles.feedText}>{post.text}</Text>
              {post.image && (
                <Image source={{ uri: post.image }} style={styles.feedImage} />
              )}
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
          {/* This icon is for attaching an image */}
          <MaterialIcons name="attach-file" size={24} color="white" onPress={pickImage} style={styles.attachIcon}/>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  feedSection: {
    width: '100%',
    flex: 1,
    marginTop: 10,
  },
  // Change the size of the chat container here
  feedContainer: {
    width: '100%',
    maxHeight: 600,
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
  feedImage: {
    width: 250,
    height: 250,
    borderRadius: 4,
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
  attachIcon: {
    marginRight: 10,
  }
});
