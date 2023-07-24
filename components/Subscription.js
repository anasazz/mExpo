import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { auth, firestore } from '../firebase';
import { collection, doc, updateDoc, getDoc, setDoc, addDoc, getDocs } from 'firebase/firestore';

const Subscription = ({userId , userInfo}) => {
    console.log("userId", userId);
    
  const [subscribed, setSubscribed] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');
  const [quoteList, setQuoteList] = useState([]);
  const [showQuoteInput, setShowQuoteInput] = useState(false);

  // Function to update the user's subscription status in Firestore
  const updateSubscriptionStatus = async (status) => {
    console.log(userId);
    if (!userId) return; // Guard clause to prevent empty userId

    const userRef = doc(collection(firestore, 'users'), userId);

    try {
      await updateDoc(userRef, { subscribed: status });
      setSubscribed(status);
    } catch (error) {
      if (error.code === 'not-found') {
        // If the document does not exist, create it with the initial subscription status
        await setDoc(userRef, { subscribed: status });
        setSubscribed(status);
      } else {
        console.log('Error updating subscription status:', error);
      }
    }
  };

  const fetchMessages = async () => {
    try {
      const messagesRef = collection(firestore, 'messages');
      const querySnapshot = await getDocs(messagesRef);
      const messagesData = querySnapshot.docs.map((doc) => doc.data());
      setQuoteList(messagesData);
    } catch (error) {
      console.log('Error fetching messages from Firestore:', error);
    }
  };



    const handleSubmitQuote = async () => {
      if (!quoteInput) {
        console.log('Quote input is empty.');
        return;
      }
  
      const newQuote = {
        quote: quoteInput,
        submittedBy: userId, // Replace with the actual user's name
        quoteAuthor: userInfo.displayName, // Replace with the actual quote author if available
      };
  
      try {
        const messagesRef = collection(firestore, 'messages');
        await addDoc(messagesRef, newQuote);
        setQuoteList([...quoteList, newQuote]);
        setQuoteInput('');
        setShowQuoteInput(false);
        console.log('Quote added to Firestore:', newQuote);
      } catch (error) {
        console.log('Error adding quote to Firestore:', error);
      }
    };
  
    // ... (Other parts of the component)
  
    const handleAddQuote = () => {
      setShowQuoteInput(!showQuoteInput)
    }

  useEffect(() => {
    fetchMessages()
    // Fetch the user's subscription status from Firestore
    const fetchSubscriptionStatus = async () => {
      if (!userId) return; // Guard clause to prevent empty userId

      const userRef = doc(collection(firestore, 'users'), userId);

      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("======", userData);
          setSubscribed(userData.subscribed);
        } else {
          // If the document does not exist, create it with the initial subscription status
          await setDoc(userRef, { subscribed: false });
        }
      } catch (error) {
        console.log('Error fetching subscription status:', error);
      }
    };

    fetchSubscriptionStatus();
  }, [userId]);



  const handleSubscription = () => {
    if (subscribed) {
      updateSubscriptionStatus(false); // Unsubscribe the user
    } else {
      updateSubscriptionStatus(true); // Subscribe the user
    }
  };

  return (
    <View>
      {subscribed ?
      <>
      {/* Subscription */}
      <Button
        title={subscribed ? 'Unsubscribe' : 'Subscribe'}
        onPress={handleSubscription}
      />
      <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>
        Please STAY Subscribed for Notifications
      </Text>
 

        
      {/* Add Quote */}
      {subscribed && (
        <Button

          title="Add A Quote"
          onPress={handleAddQuote}
        />
      )}

      {/* Quote Input */}

      {showQuoteInput && 
      
      
   

        <View>
          <TextInput
            style={{ borderWidth: 1, margin: 10, padding: 5 }}
            placeholder="Enter a quote"
            value={quoteInput}
            onChangeText={text => setQuoteInput(text)}
          />
          <Button
            title="Submit"
            onPress={handleSubmitQuote}
          />
        </View>   }


      {/* Quote List */}
      <Text>list of quotes: </Text>
      {quoteList.map((quote, index) => (
        <Text key={index} style={{ marginVertical: 5 }}>
          {quote.quote} - {quote.quoteAuthor} 
        </Text>
      ))}
      </>
      
    
    :
    <>
      {/* Subscription */}
      <Text style={{ textAlign: 'center', fontSize: 18, marginTop: 20 }}>
        Please Subscribe for Notifications
      </Text>
      <Button
        title={subscribed ? 'Unsubscribe' : 'Subscribe'}
        onPress={handleSubscription}
      />
      </>
    
    
    }
      
    </View>
  );
};

export default Subscription;
