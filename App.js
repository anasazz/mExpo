import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import SignInScreen from './screens/SignInScreen';
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential
} from 'firebase/auth'
import { useEffect, useRef, useState } from 'react';
import { auth, firestore } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomePage from './screens/HomeScreen';
import Navigation from './navigation/Navigation';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { collection, doc, updateDoc, setDoc } from 'firebase/firestore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

WebBrowser.maybeCompleteAuthSession()

export default function App() {
  const [userInfo, setuserInfo] = useState()
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const [request, response , promptAsync] = Google.useAuthRequest({
    iosClientId : '167743995911-9m3glq30jqbvjshv0rtup1gvoea4c2hd.apps.googleusercontent.com',
    androidClientId: '167743995911-644t0gbog7u3ipua4dhd8lrn3prp7bn8.apps.googleusercontent.com'
  })

  useEffect(() => {
    if(response?.type == 'success'){
      const {id_token} = response.params
      const credential = GoogleAuthProvider.credential(id_token)
      signInWithCredential(auth , credential)
    }
  
    return () => {
      
    }
  }, [response])


  async function saveOrUpdateExpoToken(user) {
    const token = await registerForPushNotificationsAsync();
    console.log('Expo push token:', token);
  
    if (!user || !token) {
      console.log('User or token is missing, unable to update Firebase.');
      return;
    }
    if (userInfo ) {
      console.log('User already connected');
      return;
    }
  
    const userRef = doc(collection(firestore, 'users'), user.uid);
  
    try {
      await updateDoc(userRef, { expoPushToken: token });
      console.log('Expo push token updated in Firestore.');
    } catch (error) {
      if (error.code === 'not-found') {
        // If the document does not exist, create it with the initial subscription status and Expo push token
        await setDoc(userRef, { expoPushToken: token, subscribed: false });
        console.log('User document created with initial subscription status and Expo push token.');
      } else {
        console.log('Error updating or creating user document:', error);
      }
    }
  }

  const displaySimpleNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: null, // Immediately show the notification
    });
  
    // console.log('Scheduled notification with ID:', notificationId);
  };
  
  // Call the displaySimpleNotification function to show the notification

  // display blank one
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const remoteMessage = notification?.request?.trigger?.remoteMessage;
      
      if (remoteMessage) {
        const notificationData = remoteMessage.notification;
        console.log("Received notification:", notificationData);
  
        // Display the received notification as an in-app alert
        Alert.alert(notificationData.title, notificationData.body);
      } else {
        console.log("Received notification with no content.");
      }
    });
  
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  
  



  // useEffect(() => {
  //   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
  
  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     const notificationObject = notification?.request?.trigger?.remoteMessage?.notification;
  
  //     setNotification(notificationObject);
  //     if (notificationObject) {
  //       console.log("Received notification:", notificationObject);
  
  //       // Display the received notification as an in-app alert
  //       Alert.alert(notificationObject.title, notificationObject.body);
  //       displaySimpleNotification(notificationObject.title , notificationObject?.body)
  //     } else {
  //       console.log("Received notification with no content.");
  //     }
  //   });
  
  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log("Notification response:", response);
  //   });
  
  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener.current);
  //     Notifications.removeNotificationSubscription(responseListener.current);
  //   };
  // }, []);

  

  const checkLocalUser =  async () => {
    try {
      const userJson = await AsyncStorage.getItem('@user')
      const userData = userJson ? JSON.parse(userJson) : null;
      console.log('Local user is null', userData);

      setuserInfo(userData)
    } catch (error) {
      console.log('error');
    }
  }

  

  useEffect(() => {
    checkLocalUser();
    const unsub = onAuthStateChanged(auth , async (user) => {
      if(user) {
        console.log('user mmm' , JSON.stringify(user , null , 2));
        setuserInfo(user);
        await AsyncStorage.setItem('@user' , JSON.stringify(user))
        saveOrUpdateExpoToken(user); // Save or update the Expo push token

      } else {
        console.log('no user found');
      }

    })
    
  

    return () => unsub()
  }, [])
  

  return userInfo && auth.currentUser ? 
  <>
    <Navigation />

     {/* <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
      }}>
      <Text>Your expo push token: {expoPushToken}</Text>
  
     
    </View> */}

  </>
  
  :  <SignInScreen promptAsync={promptAsync} />;

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});



async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    try {
      token = (await Notifications.getDevicePushTokenAsync()).data;
      console.log('Expo push token:', token);
    } catch (error) {
      console.log('Error getting Expo push token:', error);
    }
  } else {
    alert('Must use a physical device for Push Notifications');
  }

  return token;
}