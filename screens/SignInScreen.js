import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SignInScreen = ({promptAsync}) => {

    const handleGoogleSignIn = () => {

    }
  return (
    <View style={{marginVertical:200}}>

      <Button title='Sign in With Google' onPress={() => promptAsync()} />
      


    </View>
  )
}

export default SignInScreen

const styles = StyleSheet.create({})