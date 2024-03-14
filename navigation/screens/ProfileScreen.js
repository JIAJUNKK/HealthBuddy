import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { FIREBASE_AUTH, FIREBASE_DATABASE, FIREBASE_STORAGE } from '../../FirebaseConfig';
import { ref, get, remove, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { deleteUser, updateProfile, sendEmailVerification } from 'firebase/auth';

import DeleteAccountModal from '../profileScreens/deleteAccountModal';
import ImageSelectionModal from '../profileScreens/imageSelectionModal';

const signOutUser = async (navigation) => {
  try {
    await FIREBASE_AUTH.signOut();
  } catch (error) {
    console.error('Error signing out:', error.message);
  }
};

const deleteAccount = async (navigation) => {
  try {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      throw new Error('User not authenticated.');
    }
    await remove(ref(FIREBASE_DATABASE, 'users/' + user.uid));
    await remove(ref(FIREBASE_DATABASE, 'usersFood/' + user.uid));
    await remove(ref(FIREBASE_DATABASE, 'userPreference/' + user.uid));
    const storageReference = storageRef(FIREBASE_STORAGE, `profilePictures/${user.uid}`);
    deleteObject(storageReference);

    await deleteUser(user);
    Alert.alert('Success', 'Your account has been deleted.');
  } catch (error) {
    console.error('Error deleting account:', error.message);
    Alert.alert('Error', 'Failed to delete your account.');
  }
};

export default function SettingScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [isSelectImageModalVisible, setIsSelectImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isNotified, setIsNotified] = useState(false)

  const SECTIONS = [
    {
      items: [
        {
          icon: 'edit',
          color: '#fe9400',
          label: 'Edit Preference',
          type: 'link',
          screen: 'EditPreference',
        },


        {
          icon: 'music',
          color: '#32c759',
          label: 'Notification',
          type: 'boolean',
          value: isNotified, 
          action: toggleNotification
        },
        {
          icon: 'mail',
          color: '#32c759',
          label: isEmailVerified ? 'Email Verified' : 'Verify Email',
          type: 'action',
          action: verifyEmail,
        },

        {
          icon: 'log-out',
          color: '#fd2d54',
          label: 'Log out',
          type: 'link',
        },
        {
          icon: 'trash-2',
          color: '#fd2d54',
          label: 'Delete Account',
          type: 'confirmation',
        },
      ],
    },
  ];

  useEffect(() => {
    const retrieveSelectedImage = async () => {
      try {
        const storageReference = storageRef(FIREBASE_STORAGE, `profilePictures/${FIREBASE_AUTH.currentUser.uid}`);
        const downloadURL = await getDownloadURL(storageReference);
        if (downloadURL !== null) {
          setSelectedImage(downloadURL);
        }
      } catch (error) {
      }
    };
    retrieveSelectedImage();

    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDatabaseRef = ref(FIREBASE_DATABASE, 'users/' + user.uid);
          const snapshot = await get(userDatabaseRef);

          if (snapshot.exists()) {
            setUserData(snapshot.val());
            setIsNotified(snapshot.val().notificationPreference);
          } else {
            Alert.alert('User data not found in the database.');
          }
          setIsEmailVerified(user.emailVerified);
        } catch (error) {
          console.error('Error fetching user data:', error.message);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const verifyEmail = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        await sendEmailVerification(user);
        Alert.alert('Success', 'Verification email sent. Please check your email inbox.');
        const intervalId = setInterval(async () => {
          await user.reload();
          if (user.emailVerified) {
            clearInterval(intervalId);
            setIsEmailVerified(true);
            Alert.alert('Success', 'Your email has been verified.');
          }
        }, 5000);
      } else {
        throw new Error('User not authenticated.');
      }
    } catch (error) {
      console.error('Error verifying email:', error.message);
      Alert.alert('Error', 'Failed to send verification email.');
    }
  };

  const handleUsernameChange = async (newUsername) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        // Update username in Firebase Authentication
        await updateProfile(user, { displayName: newUsername });

        // Update username in the database
        const userDatabaseRef = ref(FIREBASE_DATABASE, 'users/' + user.uid);
        await update(userDatabaseRef, { username: newUsername });

        setUserData({ ...userData, username: newUsername });
      }
    } catch (error) {
      console.error('Error updating username:', error.message);
      Alert.alert('Error', 'Failed to update username. Please try again.');
    }
  };

  const handleCalorieTargetChange = async (newTargetCalorie) => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const calorieTargetRef = ref(FIREBASE_DATABASE, "users/" + user.uid);
    await update(calorieTargetRef, { targetCalorie: parseInt(newTargetCalorie) });
  };

  const handleWaterTargetChange = async (newTargetWater) => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    const targetWaterRef = ref(FIREBASE_DATABASE, "users/" + user.uid);
    await update(targetWaterRef, { targetWater: parseInt(newTargetWater) });
  };

  const handleSelectPhoto = async (uri) => {
    setSelectedImage(uri);
    await uploadImageToStorage(uri);
  };

  const handleImageSelection = async () => {
    setIsSelectImageModalVisible(true);
  };

  const uploadImageToStorage = async (uri) => {
    console.log('Uploading Image');
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageReference = storageRef(FIREBASE_STORAGE, `profilePictures/${FIREBASE_AUTH.currentUser.uid}`);
      await uploadBytes(storageReference, blob);

      const downloadURL = await getDownloadURL(storageReference);

      const user = FIREBASE_AUTH.currentUser;
      await updateProfile(user, { photoURL: downloadURL });

      const userDatabaseRef = ref(FIREBASE_DATABASE, 'users/' + FIREBASE_AUTH.currentUser.uid);
      await update(userDatabaseRef, { photoURL: downloadURL });

      console.log('Image uploaded successfully.');
    } catch (error) {
      console.error('Error uploading image to Firebase:', error.message);
    }
  };

  const removeProfilePicture = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const storageReference = storageRef(FIREBASE_STORAGE, `profilePictures/${user.uid}`);
        deleteObject(storageReference);

        await updateProfile(user, { photoURL: 'undefined' });

        const userDatabaseRef = ref(FIREBASE_DATABASE, 'users/' + user.uid);
        await update(userDatabaseRef, { photoURL: null });

        setSelectedImage(null);
        await user.reload();
        console.log("Removed Profile Picture")
      }
    } catch (error) {
      console.error('Error removing profile picture:', error.message);
    }
  };
  const toggleNotification = async () => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const updatedValue = !isNotified;
        setIsNotified(updatedValue);    
        const userDatabaseRef = ref(FIREBASE_DATABASE, 'users/' + user.uid);
        await update(userDatabaseRef, { notificationPreference: updatedValue });
        if (!updatedValue){
          Alert.alert("Notification has been turned off")
        }else{
          Alert.alert("Notification has been turned on")
        }
      }
    } catch (error) {
      console.error('Error toggling notification:', error.message);
      Alert.alert('Error', 'Failed to toggle notification preference.');
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#eef7ed'}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
          <TouchableOpacity onPress={handleImageSelection}>
            <View style={styles.profileAvatarWrapper}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.profileAvatar} />
              ) : (
                <Image
                  source={{
                    uri: 'https://as2.ftcdn.net/v2/jpg/00/65/77/27/1000_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg',
                  }}
                  style={styles.profileAvatar}
                />
              )}
              <View style={styles.profileAction}>
                <FeatherIcon color="green" name="camera" size={15} />
              </View>
            </View>
          </TouchableOpacity>

          {userData ? (
            <View>
              <Text style={styles.profileName}>{userData.username}</Text>
              <Text style={styles.profileEmail}>{userData.email}</Text>
            </View>
          ) : (
            <Text>Loading user data...</Text>
          )}
        </View>

        {SECTIONS.map(({ items }) => (
          <View style={styles.section} key={Math.random().toString()}>
            {items.map(({ label, icon, type, value, color, screen }, index) => {
              return (
                <TouchableOpacity
                  key={index.toString()} // Assign a unique key here
                  onPress={() => {
                    if (label === 'Edit Preference') {
                      navigation.navigate(screen, { handleUsernameChange, handleCalorieTargetChange, handleWaterTargetChange});
                    } else if (label === 'Delete Account') {
                      setIsDeleteModalVisible(true);
                    } else if (label === 'Log out') {
                      signOutUser(navigation);
                    } else if (label === 'Verify Email') {
                      verifyEmail();
                    } else if (label === 'Notification') {
                      console.log("toggling here");
                      toggleNotification();
                    } else {
                    }
                  }}>
                  <View style={styles.row}>
                    <View style={[styles.rowIcon, { backgroundColor: color }]}>
                      <FeatherIcon color="#fff" name={icon} size={18} />
                    </View>

                    <Text style={styles.rowLabel}>{label}</Text>

                    <View style={styles.rowSpacer} />

                    {type === 'boolean' && label === 'Notification' &&<Switch value={isNotified} onValueChange={toggleNotification} />}

                    {type === 'link' && (
                      <FeatherIcon color="#0c0c0c" name="chevron-right" size={22} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <DeleteAccountModal
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onConfirm={() => {
          deleteAccount(navigation);
          setIsDeleteModalVisible(false);
        }}
      />

      <ImageSelectionModal
        visible={isSelectImageModalVisible}
        onSelectPhoto={handleSelectPhoto}
        onRemovePhoto={removeProfilePicture}
        hasProfilePicture={!!selectedImage}
        onClose={() => setIsSelectImageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  /** Profile */
  profile: {
    padding: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: '#c7dcbf',
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: '#414d63',
    textAlign: 'center',
  },
  profileEmail: {
    marginTop: 5,
    fontSize: 16,
    color: '#989898',
    textAlign: 'center',
  },

  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    backgroundColor: '#c7dcbf',
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderColor: 'green', // Set the border color here
    borderWidth: 2, // Set the border width
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },

});
