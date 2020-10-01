import firebase from 'react-native-firebase';
import {Platform} from 'react-native';

const FirebaseNotifications = () => {
  const requestPermission = async () => {
    await firebase
      .messaging()
      .requestPermission()
      .then(() => {
        //User has authorised.
        createChannel();
        notificationListener();
        notificationOpenedListener();
        notificationOpenBackListener();
      }) // User decline permission.
      .catch((error) => console.log(error + ' permission rejected'));
  };

  const checkPermission = async () => {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      createChannel();
      notificationListener();
      notificationOpenedListener();
      notificationOpenBackListener();
    } else {
      requestPermission();
    }
  };

  const createChannel = () => {
    const channel = new firebase.notifications.Android.Channel(
      CHANNEL_NOTIFICATIONS.CHANNEL_ID,
      CHANNEL_NOTIFICATIONS.CHANNEL_NAME,
      firebase.notifications.Android.Importance.Max,
    )
      .setDescription(
        'A channel to manage the notifications related to Application',
      )
      .enableVibration(true)
      .setSound('default');
    firebase.notifications().android.createChannel(channel);
  };

  /*
   * Triggered when a particular notification has been received in foreground
   * */
  const notificationListener = () =>
    firebase.notifications().onNotification((notification) => {
      // Process your notification as required
      displayNotification(notification);
    });

  // Display notification in device
  const displayNotification = (notification) => {
    if (Platform.OS === 'android') {
      const localNotification = new firebase.notifications.Notification({
        sound: 'default',
        priority: 'high',
        show_in_foreground: true,
      })
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setSubtitle(notification.subtitle)
        .setBody(notification.body)
        .setData(notification.data)
        .android.setChannelId(Configurations.CHANNEL_NOTIFICATION) // e.g. the id you chose above
        .android.setSmallIcon('ic_launcher') // create this icon in Android Studio
        .android.setColor(Colors.primary) // you can set a color here
        .android.setVibrate(1000)
        .android.setAutoCancel(true) // Remove on press
        .android.setPriority(firebase.notifications.Android.Priority.High);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => {
          console.log(err);
        });
    } else if (Platform.OS === 'ios') {
      const localNotification = new firebase.notifications.Notification()
        .setNotificationId(notification.notificationId)
        .setTitle(notification.title)
        .setSubtitle(notification.subtitle)
        .setBody(notification.body)
        .setData(notification.data)
        .ios.setBadge(notification.ios.badge);

      firebase
        .notifications()
        .displayNotification(localNotification)
        .catch((err) => {
          console.log(err);
        });
    }
  };

  /*
   * If your app is in background, you can listen for when a notification is clicked / tapped / opened 
   as follows:
   * */
  const notificationOpenedListener = () =>
    firebase.notifications().onNotificationOpened((notificationOpen) => {
      openNotification(notificationOpen);
    });

  /*
   * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
   * */
  const notificationOpenBackListener = async () => {
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();

    if (notificationOpen) {
      openNotification(notificationOpen);
    }
  };

  const openNotification = (notificationOpen) => {
    if (notificationOpen.hasOwnProperty('notification')) {
      if (notificationOpen.notification.hasOwnProperty('_data')) {
        if (notificationOpen.notification.data.hasOwnProperty('id')) {
          if (notificationOpen.notification.data.id !== '') {
            RootNavigation.navigate('Order Tab', {
              screen: 'OrderDetail',
              initial: false,
              params: {
                id: notificationOpen.notification.data.id,
                name: `${OrderStrings.labelOrder} #${notificationOpen.notification.data.name}`,
                isRefresh: true,
              },
            });
          }
        }
      }
    }
  };

  return {
    checkPermission,
    notificationListener,
    notificationOpenedListener,
  };
};

export default FirebaseNotifications;
