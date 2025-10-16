import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, 
TouchableOpacity, Keyboard, ScrollView, Platform, Modal, FlatList } from 'react-native';
import Task from './components/Task';
import FallBack from './FallBack';
import AntDesign from '@expo/vector-icons/AntDesign';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType, RewardedInterstitialAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

const path = `${FileSystem.documentDirectory}ip.txt`;

// --- Initialize Ads ---
const interstitial = InterstitialAd.createForAdRequest(TestIds.INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true
});
const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(TestIds.REWARDED_INTERSTITIAL, {
  requestNonPersonalizedAdsOnly: true
});


export default function App() {
  const [task, setTask] = useState('');
  const [taskItems, setTaskItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedInterstitialLoaded, setRewardedInterstitialLoaded] = useState(false);

  const SERVER_URL = 'http://192.168.129.17:3000';
 

  // --- Ads events ---
  useEffect(() => {
    const unsubscribeLoadedInterstitial = interstitial.addAdEventListener(AdEventType.LOADED, () => setInterstitialLoaded(true));
    const unsubscribeClosedInterstitial = interstitial.addAdEventListener(AdEventType.CLOSED, () => { setInterstitialLoaded(false); interstitial.load(); });
    interstitial.load();

    const unsubscribeLoadedRewarded = rewardedInterstitial.addAdEventListener(RewardedAdEventType.LOADED, () => setRewardedInterstitialLoaded(true));
    const unsubscribeClosedRewarded = rewardedInterstitial.addAdEventListener(AdEventType.CLOSED, () => { setRewardedInterstitialLoaded(false); rewardedInterstitial.load(); });
    const unsubscribeEarnedReward = rewardedInterstitial.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => console.log(`Reward earned: ${reward.amount} ${reward.type}`));
    rewardedInterstitial.load();

    return () => {
      unsubscribeLoadedInterstitial();
      unsubscribeClosedInterstitial();
      unsubscribeLoadedRewarded();
      unsubscribeClosedRewarded();
      unsubscribeEarnedReward();
    };
  }, []);

  // --- Load tasks from MongoDB at start ---
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/tasks`);
        setTaskItems(res.data);
      } catch (err) {
        console.error('Erreur chargement tâches:', err);
      }
    };
    loadTasks();
  }, []);
  
  useEffect(() => {
  const createIpFile = async () => {
    const path = `${FileSystem.documentDirectory}ip.txt`;
    const fileInfo = await FileSystem.getInfoAsync(path);
    if (!fileInfo.exists) {
      await FileSystem.writeAsStringAsync(path, '', { encoding: FileSystem.EncodingType.UTF8 });
    } else {
      console.log('Fichier ip.txt déjà existant à :', path);
    }
  };

  createIpFile();
  }, []);



  // --- Add or edit task ---
  const handleAddTask = async () => {
    Keyboard.dismiss();
    if (!task) return;

    try {
      if (editingIndex !== null) {
        const taskId = taskItems[editingIndex]._id;
        const oldText = taskItems[editingIndex].text;

        await axios.put(`${SERVER_URL}/tasks/${taskId}`, { text: task });

        const updatedTasks = [...taskItems];
        updatedTasks[editingIndex].text = task;
        setTaskItems(updatedTasks);
        setEditingIndex(null);
        setHistory(prev => [...prev, { type: 'edit', old: oldText, new: task }]);
      } else {
        const res = await axios.post(`${SERVER_URL}/tasks`, { text: task });
        setTaskItems([...taskItems, res.data]);
      }
      setTask('');
    } catch (err) {
      console.error('Erreur ajout tâche:', err);
    }
  }

  // --- Delete task ---
  const completeTask = async (index) => {
    try {
      const taskId = taskItems[index]._id;
      await axios.delete(`${SERVER_URL}/tasks/${taskId}`);

      setHistory(prev => [...prev, { type: 'delete', old: taskItems[index].text }]);
      const updatedTasks = [...taskItems];
      updatedTasks.splice(index, 1);
      setTaskItems(updatedTasks);
    } catch (err) {
      console.error('Erreur suppression tâche:', err);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Today's tasks</Text>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <AntDesign name="history" size={26} color="#2f4f4f" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
        <View style={styles.items}>
          {taskItems.length === 0 && <FallBack />}
          {taskItems.map((item, index) => (
            <View key={item._id}>
              <Task
                text={item.text}
                onDelete={() => completeTask(index)}
                onEdit={() => { setTask(item.text); setEditingIndex(index); }}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.writeTaskWrapper}>
        <TextInput
          style={styles.input}
          placeholder={'Write a task'}
          value={task}
          onChangeText={text => setTask(text)}
        />
        <TouchableOpacity onPress={handleAddTask}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Banner Ad */}
      <View style={styles.bannerContainer}>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.LARGE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>

      {/* History Modal */}
      <Modal visible={showHistory} animationType="slide">
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <AntDesign name="close-circle" size={24} color="#2f4f4f" />
            </TouchableOpacity>
          </View>
          {history.length === 0 ? (
            <Text style={styles.noHistory}>No history yet</Text>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  {item.type === 'delete' ? (
                    <Text style={styles.historyText}>🗑️ Deleted: {item.old}</Text>
                  ) : (
                    <Text style={styles.historyText}>✏ Edited: "{item.old}" ➜ "{item.new}"</Text>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d3d3d3',
  },
  header: {
    marginTop: 80,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
  },
  tasksWrapper: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  items: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 115 : 110,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#dcdcdc',
    borderRadius: 60,
    borderColor: '#778899',
    borderWidth: 1,
    width: 250,
    shadowRadius: 3,
    shadowOpacity: 0.1,
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#dcdcdc',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#778899',
    borderWidth: 1,
    shadowRadius: 3,
    shadowOpacity: 0.1,
  },
  addText: {
    color: '#778899',
    fontSize: 24,
  },
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#d3d3d3',
    alignItems: 'center',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    paddingVertical: 1,
  },
  // history modal
  historyContainer: {
    flex: 1,
    backgroundColor: '#dcdcdc',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2f4f4f',
  },
  historyItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  historyText: {
    fontSize: 16,
    color: '#333',
  },
  noHistory: {
    marginTop: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});