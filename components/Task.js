import React, {useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Feather } from '@expo/vector-icons';


const Task = (props) => {
  // edit task
  const [editingIndex, setEditingIndex] = useState(null);
  const [task, setTask] = useState(null); 
  
  return (
    <TouchableOpacity 
      onPress={props.onEdit ? props.onEdit : () => {}}
    >
    <View style={styles.item}>
    {/* Task item */}
      <View style={styles.itemLeft}>
        <View style={styles.square}></View>
        <Text style={styles.itemText}>{String(props.text)}</Text>
      </View>
      {/* Delete task */}
      <TouchableOpacity onPress={props.onDelete}>
        <AntDesign name="delete" size={24} color="lightslategrey" />
      </TouchableOpacity>
      </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#dcdcdc',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    shadowRadius: 3,
    shadowOpacity: 0.1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  square: {
    width: 24,
    height: 24,
    backgroundColor: '#778899',
    opacity: 0.4,
    borderRadius: 5,
    marginRight: 6,
  },
  itemText: {
    maxWidth: '100%',
  },
  circular: {
    width: 12,
    height: 12,
    borderColor: '#2f4f4f',
    borderWidth: 2,
    borderRadius: 5,
  },
});

export default Task;