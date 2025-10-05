import React, {useState} from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, 
TouchableOpacity, Keyboard, ScrollView, Platform, Modal, FlatList} from 'react-native';
import Task from './components/Task';
import FallBack from './FallBack';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function App() {
  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [history, setHistory] = useState([]); 
  const [showHistory, setShowHistory] = useState(false);

  // Add Item Task 
  const handleAddTask = () => {
    Keyboard.dismiss();
    if (!task) return;

    if (editingIndex !== null) {
      let itemsCopy = [...taskItems];
      setHistory(prev => [...prev, { type: 'edit', old: itemsCopy[editingIndex], new: task}]);
      itemsCopy[editingIndex] = task;
      setTaskItems(itemsCopy);
      setEditingIndex(null);
    } else {
      setTaskItems([...taskItems, task]);     
    }
    setTask('');
  }
 
  // complete Task
  const completeTask = (index) => {
    let itemsCopy = [...taskItems];
    setHistory(prev => [...prev, { type: 'delete', old: itemsCopy[index]}]);
    itemsCopy.splice(index, 1);
    setTaskItems(itemsCopy)
  }

  return (
    <View style={styles.container}>
      {/* --- Header with button history --- */}
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Today's tasks</Text>
        <TouchableOpacity onPress={() => setShowHistory(true)}>
          <AntDesign name="history" size={26} color="#2f4f4f" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.items}>
        {taskItems.length === 0 && <FallBack />}
          {/* This is where the tasks will go! */}
          {
            taskItems.map((item, index) => {
              if (item == null) return null;
              return (
                <View key={index}>
                  <Task 
                  text={item.toString()} 
                  onDelete={() => completeTask(index)} 
                  onEdit={() => {
                    setTask(item);
                    setEditingIndex(index);
                  }
                  }
                  /> 
                </View>
              )
            })
          }
        </View>
        
      </ScrollView>

      {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
      {/* Write a task */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.writeTaskWrapper}
      >
        <TextInput style={styles.input} placeholder={'Write a task'} value={task} onChangeText={text => setTask(text)} />
          {/* Button + Add Task */}
        <TouchableOpacity onPress={() => handleAddTask()}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* 🕒 Modal Historic */}
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
                    <Text style={styles.historyText}>
                      ✏ Edited: "{item.old}" ➜ "{item.new}"
                    </Text>
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
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    color: '#778899'
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