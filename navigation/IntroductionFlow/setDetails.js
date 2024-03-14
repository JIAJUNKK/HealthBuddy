import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DATABASE } from "../../FirebaseConfig";
import { ref, get, set, update } from "firebase/database";

export default function SetDetails({ isVisible }) {
  const [waterTarget, setWaterTarget] = useState('');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [weightPreference, setWeightPreference] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false); // State variable for success message

  // Function to handle setting water target
  const setWaterTargetHandler = (value) => {
    setWaterTarget(value);
  };

  // Function to handle setting calorie target
  const setCalorieTargetHandler = (value) => {
    setCalorieTarget(value);
  };

  // Function to handle setting weight preference
  const setWeightPreferenceHandler = (value) => {
    setWeightPreference(value);
  };

  // Function to handle setting gender
  const setGenderHandler = (value) => {
    setGender(value);
  };

  // Function to handle setting age
  const setAgeHandler = (value) => {
    setAge(value);
  };

  const handleSubmit = async () => {
    const currentUserUid = FIREBASE_AUTH.currentUser.uid;
    const data = {
      targetWater: waterTarget,
      targetCalorie: calorieTarget,
      weightPreference: weightPreference,
      gender: gender,
      age: age
    };

    if (data.gender === 'male'){
      console.log("this is male");
    }
    else if (data.gender === 'female'){
      console.log('this is female');
    }
    else if (data.gender === 'preferNotToSay'){
      console.log("this is crazzy");
    }
    
    if(data.targetWater < 1500){
        Alert.alert("You must enter more than 1500ml")
    }
    else{
        isVisible(true); 
        const userRef = ref(FIREBASE_DATABASE, `users/${currentUserUid}`);
        try {
          // Check if data already exists at the specified location
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            // Data exists, update it
            await update(userRef, data);
            console.log("Data updated successfully");
            setUploadSuccess(true); // Set upload success message
          } else {
            // Data doesn't exist, set it for the first time
            await set(userRef, data);
            console.log("Data set successfully");
            setUploadSuccess(true); // Set upload success message
            Alert.alert("Data uploaded successfully!");
          }   
        } catch (error) {
            console.error("Error updating data:", error);
            Alert.alert("Error updating data. Please try again later.");
          }
    }

   

  };

  // Render the UI components
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
        <Text style={styles.header}>Set Your Target</Text>

        {/* Input for setting water target */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Water Target (ml)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter water target in ml"
            value={waterTarget}
            onChangeText={setWaterTargetHandler}
          />
        </View>

        {/* Input for setting calorie target */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Calorie Target</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter calorie target"
            value={calorieTarget}
            onChangeText={setCalorieTargetHandler}
          />
        </View>

        {/* Input for setting weight preference */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Calorie Progress Preference</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                weightPreference === "gain" && styles.selectedOption,
              ]}
              onPress={() => setWeightPreferenceHandler("gain")}
            >
              <Text style={[styles.radioText, weightPreference === 'gain' && styles.selectedText]}>Gain</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                weightPreference === "loss" && styles.selectedOption,
              ]}
              onPress={() => setWeightPreferenceHandler("loss")}
            >
              <Text style={[styles.radioText, weightPreference === 'loss' && styles.selectedText]}>Loss</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.radioOption,
                weightPreference === "maintain" && styles.selectedOption,
              ]}
              onPress={() => setWeightPreferenceHandler("maintain")}
            >
              <Text style={[styles.radioText, weightPreference === 'maintain' && styles.selectedText]}>Maintain</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Input for setting gender */}
        <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRadioContainer}>
            <TouchableOpacity
            style={[
                styles.radioOption,
                gender === "male" && styles.selectedOption,
            ]}
            onPress={() => setGenderHandler("male")}
            >
            <Text style={[styles.radioText, gender === 'male' && styles.selectedText]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[
                styles.radioOption,
                gender === "female" && styles.selectedOption,
            ]}
            onPress={() => setGenderHandler("female")}
            >
            <Text style={[styles.radioText, gender === 'female' && styles.selectedText]}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={[
                styles.radioOption,
                gender === "preferNotToSay" && styles.selectedOption,
            ]}
            onPress={() => setGenderHandler("preferNotToSay")}
            >
            <Text style={[styles.radioText, gender === 'preferNotToSay' && styles.selectedText]}>Prefer not to say</Text>
            </TouchableOpacity>
        </View>
        </View>


        {/* Input for setting age */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Enter your age"
            value={age}
            onChangeText={setAgeHandler}
          />
        </View>

        {/* Button to submit */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.text}>SET TARGET</Text>
        </TouchableOpacity>

        {/* Display success message if upload was successful */}
        {uploadSuccess && (
          <Text style={styles.successMessage}>Data uploaded successfully! You can press finish and start using HealthBuddy</Text>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0FFF0", // Light green background color
    width: "100%",
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#008000", // Green header text color
  },
  inputContainer: {
    marginBottom: 20,
    width: "80%",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#008000", // Green label text color
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#FFF", // White input background color
  },
  button: {
    backgroundColor: "#008000", // Green button background color
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  text: {
    color: "white", // White button text color
    fontWeight: 'bold',
    // fontSize: 16,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderRadioContainer:{
    display: 'flex',
    flexDirection: "column",
    gap: 5,
    marginTop: 10,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FFF0", // Green default radio option background color
    padding: 10,
    borderRadius: 5,
    marginRight: 10,      
    borderWidth: 1, // Add border width
    borderColor: "#008000", // Border color set to green
  },
  selectedOption: {
    backgroundColor: "#006400", // Darker green selected radio option background color
  },
  radioText: {
    paddingHorizontal: 2,
    color: 'black', // Default text color
    textAlign: 'center'
  },
  selectedText: {
    color: 'white', // Text color when the option is selected
  },
  successMessage: {
    color: "green",
    marginTop: 10,
    textAlign: 'center',
    fontWeight: "bold",
  },
});
