import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SettingsScreen = () => {


    const handleSingOut = async () => {
        await signOut(auth)
        await AsyncStorage.removeItem('@user')
    }  
  return (
    <View>

      <Button title='Log Out'  onPress={ () => handleSingOut() }/>
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({})