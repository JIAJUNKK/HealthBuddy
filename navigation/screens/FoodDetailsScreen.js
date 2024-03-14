import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig'; // Import your Firebase configuration
import { ref, push,get,set } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider'; // Import Slider from @react-native-community/slider
import { ScrollView } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const FoodDetailScreen = ({ route }) => {
  const { clearSearchInput, foodName, kcal} = route.params;
  const [selectedServing, setSelectedServing] = useState(1);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours()); // Set initial hour to current hour
  const [selectedMinute, setSelectedMinute] = useState(new Date().getMinutes()); // Set initial minute to current minute
  const navigation = useNavigation();
  
  const handleSelectServing = (serving) => {
    setSelectedServing(serving);
  };

  const handleHourChange = (value) => {
    setSelectedHour(Math.floor(value));
  };

  const handleMinuteChange = (value) => {
    setSelectedMinute(Math.floor(value));
  };

  const addMoreCaloriesForUser = (calories) => {
    const userId = FIREBASE_AUTH.currentUser.uid;
    db = FIREBASE_DATABASE
    const userCaloriesRef = ref(db, `users/${userId}/calories/${new Date().toISOString().split('T')[0]}/`);

    get(userCaloriesRef)
        .then((snapshot) => {
            const currentCalories = snapshot.val() || 0;
            const updatedCalories = currentCalories + parseInt(calories);
            console.log(calories);

            set(userCaloriesRef, updatedCalories)
                .then(() => {
                    console.log("Calories updated successfully for");
                })
                .catch((error) => {
                    console.error("Error updating calories for",  ":", error);
                });
        })
        .catch((error) => {
            console.error("Error retrieving current calories for",  ":", error);
        });
};

  const handleAddFood = () => {
    const user = FIREBASE_AUTH.currentUser;
    const currentTime = new Date();
    const date = currentTime.toISOString().split('T')[0];
    const time = `${selectedHour}:${selectedMinute}`;
    addMoreCaloriesForUser((kcal * selectedServing));

    if (user) {
      const foodRef = ref(FIREBASE_DATABASE, `usersFood/${user.uid}`);
      const foodKey = push(foodRef).key;
      const compositeKey = `${user.uid}_${foodKey}`;

      push(foodRef, {
        id: compositeKey,
        foodName: foodName,
        servings: selectedServing,
        time: `${date} ${time}`,
        calorie: kcal * selectedServing
      }).then(() => {
        console.log('Food added successfully');
        Alert.alert(`Added ${foodName} successfully`);
        clearSearchInput();
        navigation.goBack(); // Navigate back to previous screen
      }).catch((error) => {
        console.error('Error adding food: ', error);
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Food Name: {foodName}</Text>
      <Text style={styles.divider}></Text>

      <Text style={styles.subTitle}>Serving: {selectedServing}</Text>
      <View style={styles.servingOptions}>
        <TouchableOpacity
          style={[styles.servingButton, selectedServing === 1 && styles.selectedButton]}
          onPress={() => handleSelectServing(1)}
        >
          <Text style={styles.servingText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.servingButton, selectedServing === 0.5 && styles.selectedButton]}
          onPress={() => handleSelectServing(0.5)}
        >
          <Text style={styles.servingText}>0.5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.servingButton, selectedServing === 0.25 && styles.selectedButton]}
          onPress={() => handleSelectServing(0.25)}
        >
          <Text style={styles.servingText}>0.25</Text>
        </TouchableOpacity>

      </View>


      <Text style={styles.subTitle}>Custom Amount</Text>
      <View style={styles.customContainerWrapper}>
        <View style={styles.customContainer}>
        <TextInput
        onChangeText={(text) => setSelectedServing(text)}
        style={[styles.customText, { color: 'white' }]}
        keyboardType="numeric"
        />
      </View>

      </View>
      <Text style={styles.divider}></Text>

      <Text style={styles.subTitle}>Time:</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Hour: {selectedHour}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={23}
          step={1}
          value={selectedHour}
          onValueChange={handleHourChange}
        />
        <Text style={styles.sliderLabel}>Minute: {selectedMinute}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={59}
          step={1}
          value={selectedMinute}
          onValueChange={handleMinuteChange}
        />
      </View>

      {/* Nutrition Information based on servings */}
      {/* Replace placeholder values with actual nutrition information */}
      <Text style={styles.subTitle}>Nutrition Information (Per Serving)</Text>
      <Text style={styles.nutritionInfo}>Calories: {(kcal * selectedServing).toFixed(2)} kcal</Text>
      {/* Add more nutrition information as needed */}

      <View style={styles.divider}></View>

      {/* Add food button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
        <Text style={styles.addButtonText}>Add Food</Text>
      </TouchableOpacity>

      <Text style={styles.space}>‎</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#eef7ed',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#26994b',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#26994b',
    textAlign: 'center',
  },
  divider: {
    borderBottomColor: '#26994b',
    borderBottomWidth: 2,
    marginBottom: 20,
  },
  servingOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  servingButton: {
    backgroundColor: '#26994b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 1,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#176831',
  },
  servingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nutritionInfo: {
    fontSize: 18,
    marginBottom: 10,
    color: '#26994b',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#26994b',
    padding: 15,
    borderRadius: 5,
    alignSelf: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sliderContainer: {
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#26994b',
  },
  slider: {
    width: '80%',
    marginBottom: 20,
  },
  space : {
    padding : 20,
  },
  customContainerWrapper: {
    alignItems: 'center',
  },
  customContainer: {
    backgroundColor: "#26994b",
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 1,
    minWidth: '10%', maxWidth: '40%'
  },
  customText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',  },
});

export default FoodDetailScreen;
