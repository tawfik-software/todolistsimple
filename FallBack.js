import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

const FallBack = () => {
  return (
    <View style={{ alignItems: "center"}}>
      <Image 
       source={require("./assets/appstore2.png")}
       style={{ height: 200, width: 300 }}
       />
       <Text>Start Adding Your First Task</Text>
    </View>
  )
}

export default FallBack;

const styles = StyleSheet.create({});