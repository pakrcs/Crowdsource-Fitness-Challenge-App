import { Text, View, StyleSheet, TextInput, Button, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import { getCommunityMessages, postCommunityMessage } from '../api/communityAPI';

export default function CommunityScreen() {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chat, setChat] = useState<Array<{
    id: number;
    user: string;
    text: string;
    image_url: string | null;
    timestamp: string;
  }>>([]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getCommunityMessages();
        setChat(messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, []);

  // Send message to backend
  const handleSendMessage = async () => {
    if (message.trim() || selectedImage) {
      try {
        await postCommunityMessage({
          user: 'You',
          text: message,
          image_url: selectedImage || undefined,
        });

        const updatedMessages = await getCommunityMessages();
        setChat(updatedMessages);
        setMessage('');
        setSelectedImage(null);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // Select an image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Community Feed</Text>
        <ScrollView style={styles.feedContainer}>
          {[...chat].reverse().map((post, index) => (
            <View key={post.id || index} style={styles.feedItem}>
              <Text style={styles.feedUser}>{post.user}</Text>
              <Text style={styles.feedText}>{post.text}</Text>
              {post.image_url && (
                <Image source={{ uri: post.image_url }} style={styles.feedImage} />
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.chatInputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={message}
            onChangeText={setMessage}
          />
          <MaterialIcons name="attach-file" size={24} color="white" onPress={pickImage} style={styles.attachIcon} />
          <Button title="Send" onPress={handleSendMessage} color="#007bff" />
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
  },
});
