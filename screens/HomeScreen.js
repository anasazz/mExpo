import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { View, Text, Button, TouchableOpacity, Image } from 'react-native';
import Subscription from '../components/Subscription';
import { auth } from '../firebase';

const HomePage = () => {
  const [userId, setUserId] = useState(null);


  

  console.log("home userId" , userId);
  useEffect(() => {

    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    } else {
        alert('not current user')
    }
  }, []);

  if (!auth.currentUser){
    return <Text>No user</Text>
  }




  const navigation = useNavigation()

  console.log(auth?.currentUser?.photoURL);

  return (
    <View>
      {/* App Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 90 , paddingHorizontal:50 }}>
        <Image source={require('../assets/reactlogo.png')} style={{ width: 30, height: 30 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Image
  source={{ uri: auth?.currentUser?.photoURL }}
  style={{ width: 30, height: 30 }}
/>
        </TouchableOpacity>
      </View>

      

      <Subscription userId={userId} userInfo={auth?.currentUser} />

 
    </View>
  );
};

export default HomePage;
