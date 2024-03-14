import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import FeatherIcon from 'react-native-vector-icons/Feather';
import Ionicons from "react-native-vector-icons/Ionicons";
import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../../FirebaseConfig';
import { ref, get } from "firebase/database";

export default function EditDetailsScreen({ route }) {
  const user = FIREBASE_AUTH.currentUser;
  const targetCalorieRef = ref(FIREBASE_DATABASE, 'users/' + user.uid + "/targetCalorie")
  const targetWaterRef = ref(FIREBASE_DATABASE, 'users/' + user.uid + "/targetWater")

  const [username, setUsername] = useState(user.displayName);
  const [calorieTarget, setCalorieTarget] = useState(null);
  const [waterTarget, setWaterTarget] = useState(null);

  const navigation = useNavigation();

  const handleUsernameChange  = route.params.handleUsernameChange;
  const handleCalorieTargetChange = route.params.handleCalorieTargetChange;
  const handleWaterTargetChange = route.params.handleWaterTargetChange;

  useEffect(() => {
    get(targetCalorieRef).then((snapshot) => {
      if (snapshot.exists()) {
        setCalorieTarget(snapshot.val().toString()); 
      } 
    }).catch((error) => {
      console.error('Error fetching default calorie target:', error.message);
    });
    get(targetWaterRef).then((snapshot) => {
      if (snapshot.exists()) {
        setWaterTarget(snapshot.val().toString()); 
      } 
    }).catch((error) => {
      console.error('Error fetching default calorie target:', error.message);
    });

  }, []);

  const handleSave = async () => {
    try {
      await handleUsernameChange(username);
      if (parseInt(calorieTarget) < 2000) {
        Alert.alert('Error', 'Calorie target cannot be less than 2000kcal.');
        return; 
      }
      if (parseInt(waterTarget) < 1500) {
        Alert.alert('Error', 'Water target cannot be less than 1.5litres.');
        return; 
      }
      await handleCalorieTargetChange(calorieTarget);
      await handleWaterTargetChange(waterTarget);
      navigation.goBack();
      Alert.alert("Preference Updated");
    } catch (error) {
      console.error('Error saving details:', error.message);
      Alert.alert('Error', 'Failed to save details. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Details</Text>
      <View style={styles.inputContainer}>
        <FeatherIcon name="user" size={20} color="#26994b" />
        <TextInput
          style={styles.input}
          placeholder="Enter new username"
          value={username}
          onChangeText={(text) => setUsername(text)}
        />
      </View>

      <Text style={styles.title}>Edit Calorie Target</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="flame" size={20} color="red" />
        <TextInput
          style={styles.input}
          placeholder="Enter new calorie target"
          value={calorieTarget}
          onChangeText={(text) => setCalorieTarget(text)}
        />
      </View>
      
      <Text style={styles.title}>Edit Water Target</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="water" size={20} color="blue" />
        <TextInput
          style={styles.input}
          placeholder="Enter new water target"
          value={waterTarget}
          onChangeText={(text) => setWaterTarget(text)}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#eef7ed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#26994b',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'green',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: '#26994b',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
