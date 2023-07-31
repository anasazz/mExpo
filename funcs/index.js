const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore();

// Function to update user's subscription status
exports.manageSubscription = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const userBefore = change.before.data();
    const userAfter = change.after.data();

    if (userBefore.subscribed !== userAfter.subscribed) {
      if (userAfter.subscribed) {
        console.log('User subscribed:', userId);
        await sendNotification(userId);
      } else {
        console.log('User unsubscribed:', userId);
        // Handle any cleanup or future changes if needed when user unsubscribes
      }
    }
  });

// Function to send notifications at scheduled times
exports.scheduleNotifications = functions.pubsub
  // .schedule('every 2 minutes')

  .schedule('every 24 hours')
  .timeZone('America/New_York') // Replace 'Your_Timezone' with the desired time zone
  .onRun(async (context) => {
    console.log('Sending scheduled notifications');
    const userIds = await fetchSubscribedUsers();

    for (const userId of userIds) {
      await sendNotification(userId);
    }
  });

async function fetchSubscribedUsers() {
  try {
    const querySnapshot = await firestore.collection('users').where('subscribed', '==', true).get();
    return querySnapshot.docs.map((doc) => doc.id);
  } catch (error) {
    console.error('Error fetching subscribed users:', error);
    return [];
  }
}


async function sendNotification(userId) {
    try {
      // Fetch a random message from the Firestore table
      const messagesRef = firestore.collection('messages');
      const messagesSnapshot = await messagesRef.get();
      const messagesData = messagesSnapshot.docs.map((doc) => doc.data());
      const randomIndex = Math.floor(Math.random() * messagesData.length);
      const randomMessage = messagesData[randomIndex];
  
      // Prepare the notification payload
      const notification = {
        notification: {
          title: `A quote from ${randomMessage.quoteAuthor} `,
          body: randomMessage.quote,
        },
        data: {
          title: `${randomMessage.quoteAuthor} : ${randomMessage.quote}`,
          body: randomMessage.quote,
          submittedBy: randomMessage.submittedBy,
          quoteAuthor: randomMessage.quoteAuthor,
        },
      };
  
      // Send the notification to the user using their Expo push token
      const userRef = firestore.collection('users').doc(userId);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();
      if (userData && userData.expoPushToken) {
        const expoPushToken = userData.expoPushToken;
        await admin.messaging().sendToDevice(expoPushToken, notification);
        console.log('Notification sent to user:', userId);
      }
    } catch (error) {
      console.error('Error fetching messages or sending notification:', error);
    }
  }