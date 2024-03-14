// Import necessary React and React Native modules along with Firebase services
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import { FIREBASE_AUTH, FIREBASE_DATABASE } from "../../FirebaseConfig";
import { ref, get, update, onValue, set } from "firebase/database";
import { LinearGradient } from "expo-linear-gradient";

// Initial progress value for water intake
const initialProgress = 0;

// Main component for the water tracking screen
export default function WaterScreen({ navigation }) {
  // State variables for managing water target, progress, units, modals visibility, and input values
  const [target, setTarget] = useState(null);
  const [progress, setProgress] = useState(initialProgress);
  const [units, setUnits] = useState("Metric");
  const [showSetTargetModal, setShowSetTargetModal] = useState(false);
  const [showIncreaseTargetModal, setShowAdjustTargetModal] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [customInputValue, setCustomInputValue] = useState("");
  const [startOfDay, setStartOfDay] = useState(getStartOfDay());



//circle series
  const Circle = () => (
    <View style={styles.circle} />
  );
  


  const [dayDetails, setDayDetails] = useState([]);

  useEffect(() => {
    const fetchDayDetails = async () => {
      const userId = FIREBASE_AUTH.currentUser?.uid;
      if (!userId) {
        Alert.alert("Not logged in", "You need to be logged in to check water intake status.");
        return;
      }
  
      const details = [];
      for (let i = 4; i >= 0; i--) { // Start from 4 days ago to today
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Format the date as DD.MM
        const formattedDate = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}`;
  
        const targetMetRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${date.toISOString().split('T')[0]}/targetMet`);
  
        const snapshot = await get(targetMetRef);
        const color = snapshot.exists() ? (snapshot.val() ? 'green' : 'red') : 'red'; // Determine color
        details.push({ color, date: formattedDate });
      }
      setDayDetails(details);
    };
  
    fetchDayDetails();
  }, []);
  

  const fetchDayDetails = async () => {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
      Alert.alert("Not logged in", "You need to be logged in to check water intake status.");
      return;
    }
  
    const details = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}`;
  
      const targetMetRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${date.toISOString().split('T')[0]}/targetMet`);
  
      try {
        const snapshot = await get(targetMetRef);
        const color = snapshot.exists() && snapshot.val() ? 'green' : 'red'; // Determine color based on targetMet value
        details.push({ color, date: formattedDate });
      } catch (error) {
        console.error("Error fetching target met status for", formattedDate, ":", error);
        // If there's an error, you might want to add a default color or handle the error differently
        details.push({ color: 'grey', date: formattedDate });
      }
    }
    setDayDetails(details);
  };
  







  // useEffect hook to listen for changes in Firebase and to reset progress daily
  useEffect(() => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) return;

    // References to the user's target water intake and progress in Firebase
    const targetWaterRef = ref(
      FIREBASE_DATABASE,
      "users/" + user.uid + "/targetWater"
    );
    const progressRef = ref(
      FIREBASE_DATABASE,
      "users/" + user.uid + "/drinkingProgress"
    );

    // Firebase listeners for target water intake and progress, updating state accordingly
    const targetWaterListener = onValue(targetWaterRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTarget(data);
      } else {
        setShowSetTargetModal(true);
      }
    });

    const progressListener = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      if (data || data === 0) {
        setProgress(data);
      }
    });

    // Interval to check and reset the progress at the start of a new day
      const resetID = setInterval(() => {
      const currentDate = new Date();
      const currentTime = currentDate.getTime();

      if (currentTime >= startOfDay.getTime()) {
        console.log("Reset");
        const nextDay = new Date(startOfDay);
        nextDay.setDate(nextDay.getDate() + 1);
        setStartOfDay(nextDay);

        setProgress(initialProgress);
        update(ref(FIREBASE_DATABASE), {
          ["users/" + user.uid + "/drinkingProgress"]: initialProgress,
        });
      }
    }, 10000);

    // Cleanup function to remove listeners and interval on component unmount
    return () => {
      targetWaterListener();
      progressListener();
      clearInterval(resetID);
    };
  }, [startOfDay]);

  // useEffect hook to show an alert when the user exceeds their target
  useEffect(() => {
    if (target && progress >= target) {
      Alert.alert("Congratulations!", "You have exceeded your target!");
    }
  }, [progress, target]);




  // Function to submit new progress values
  function submit(value) {
    const newProgress = progress + value;
    addMoreWaterForUser(value);
    setProgress(newProgress);
    dailyWaterCheck(value);
    suggestMoreWater();
    

    fetchDayDetails(); // Call fetchDayDetails to update the day details and circle colors


    const user = FIREBASE_AUTH.currentUser;
    if (user) {
      update(ref(FIREBASE_DATABASE), {
        ["users/" + user.uid + "/drinkingProgress"]: newProgress,
      });
    }
  }



  // function submit(value) {
  //   const newProgress = progress + value;
  //   addMoreWaterForUser(value);
  //   setProgress(newProgress);
  //   dailyWaterCheck(value);
  //   suggestMoreWater();

  //   const user = FIREBASE_AUTH.currentUser;
  //   if (user) {
  //       update(ref(FIREBASE_DATABASE), {
  //           ["users/" + user.uid + "/drinkingProgress"]: newProgress,
  //       }).then(() => {
  //           // Call fetchDayDetails after successfully updating the progress
  //           fetchDayDetails();
  //       }).catch((error) => {
  //           console.error("Error updating water progress:", error);
  //       });
  //   }
  // }












  // Function to handle custom input submission
  function submitCustom() {
    fetchDayDetails(); // Call fetchDayDetails to update the day details and circle colors

    suggestMoreWater();


    if (customInputValue.trim() === "") {
      return;
    }
    const value = parseInt(customInputValue);
    if (!isNaN(value)) {
      submit(value);
      setCustomInputValue("");
    } else {
      Alert.alert("Invalid Input", "Please enter a valid number.");
    }
  }
  
  //function to handle adding water to database
  const addMoreWaterForUser = (water) => {
    const userId = FIREBASE_AUTH.currentUser.uid;
    db = FIREBASE_DATABASE;
    const userWaterRef = ref(
      db,
      `users/${userId}/water/${new Date().toISOString().split("T")[0]}/`
    );

    get(userWaterRef)
      .then((snapshot) => {
        const currentWater = snapshot.val() || 0;
        const updatedWater = currentWater + parseInt(water);
        console.log(water);

        set(userWaterRef, updatedWater)
          .then(() => {
            console.log("water updated successfully for");
          })
          .catch((error) => {
            console.error("Error updating water for", ":", error);
          });
      })
      .catch((error) => {
        console.error("Error retrieving current calories for", ":", error);
      });
  };


  // //function to handle reset
  // function resetButton() {
  //   // Set progress to the initial value
  //   setProgress(initialProgress);

  //   // Get the current user from Firebase Auth
  //   const user = FIREBASE_AUTH.currentUser;

  //   // Check if a user is logged in
  //   if (user) {
  //     // Update the progress in Firebase Database to the initial value
  //     update(ref(FIREBASE_DATABASE), {
  //       ["users/" + user.uid + "/drinkingProgress"]: initialProgress,
  //     });
  //     Alert.alert("Reset Successful", "You have reset your progress.");
  //   } else {
  //     // If no user is logged in, you may want to handle this case (e.g., show an error message)
  //     Alert.alert("Error", "No user logged in.");
  //   }
  // }


  function resetButton() {

    fetchDayDetails(); // Call fetchDayDetails to update the day details and circle colors

    suggestMoreWater();


    // Set progress to the initial value
    setProgress(initialProgress);
  
    // Get the current user from Firebase Auth
    const user = FIREBASE_AUTH.currentUser;
  
    // Check if a user is logged in
    if (user) {
      // Update the progress in Firebase Database to the initial value
      update(ref(FIREBASE_DATABASE), {
        ["users/" + user.uid + "/drinkingProgress"]: initialProgress,
      });
  
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];
  
      // Reset the water intake data for the current day to 0
      const userWaterRef = ref(FIREBASE_DATABASE, `users/${user.uid}/water/${today}`);
      set(userWaterRef, 0)
        .then(() => {
          Alert.alert("Reset Successful", "You have reset your progress and today's water intake.");
        })
        .catch((error) => {
          console.error("Error resetting water intake for", today, ":", error);
          Alert.alert("Reset Failed", "There was a problem resetting your progress.");
        });
    } else {
      // If no user is logged in, handle this case (e.g., show an error message)
      Alert.alert("Error", "No user logged in.");
    }
  }
  
  
  // function dailyWaterCheck() {
  //   const userId = FIREBASE_AUTH.currentUser.uid;
  //   if (!userId) {
  //     console.error("User not logged in");
  //     return;
  //   }
  
  //   const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  //   const userWaterRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${today}`);
  //   const targetWaterRef = ref(FIREBASE_DATABASE, `users/${userId}/targetWater`);
  
  //   // Retrieve the current water intake and target water from the database
  //   get(userWaterRef).then((waterSnapshot) => {
  //     const currentWaterIntake = waterSnapshot.val() || 0;
  
  //     get(targetWaterRef).then((targetSnapshot) => {
  //       const targetWaterIntake = targetSnapshot.val() || 0;
  
  //       // Check if the current water intake meets or exceeds the target
  //       const targetMet = currentWaterIntake >= targetWaterIntake;
  
  //       // Update the database with the target met status for the current day
  //       const updateRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${today}`);
  //       update(updateRef, { amount: currentWaterIntake, targetMet: targetMet })
  //         .then(() => {
  //           console.log("Target met status updated successfully");
  //         })
  //         .catch((error) => {
  //           console.error("Error updating target met status:", error);
  //         });
  //     }).catch((error) => {
  //       console.error("Error fetching target water intake:", error);
  //     });
  //   }).catch((error) => {
  //     console.error("Error fetching current water intake:", error);
  //   });
  // }
  

  function dailyWaterCheck(waterToAdd) {
    const userId = FIREBASE_AUTH.currentUser.uid;
    if (!userId) {
      console.error("User not logged in");
      return;
    }
  
    console.log("Water to add:", waterToAdd); // Debugging log
  
    const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const userWaterRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${today}`);
  
    // Fetch the current water data for today
    get(userWaterRef).then((snapshot) => {
      let data = snapshot.val();
      console.log("Current water data:", data); // Debugging log
  
      waterToAdd = Number(waterToAdd); // Ensure 'waterToAdd' is numeric
      if (isNaN(waterToAdd)) {
        console.error("Invalid waterToAdd value:", waterToAdd);
        return;
      }
  
      if (data) {
        // If there's already an entry for today, update it
        let updatedAmount = (data.amount || 0) + waterToAdd; // Ensure existing amount is numeric
        let targetMet = updatedAmount >= target; // Check against 'target'
  
        update(userWaterRef, { amount: updatedAmount, targetMet: targetMet }).then(() => {
          console.log("Water check updated successfully for", today);
        }).catch((error) => {
          console.error("Error updating water check for", today, ":", error);
        });
      } else {
        // If there's no entry for today, initialize with 'waterToAdd'
        let targetMet = waterToAdd >= target; // Check against 'target'
  
        set(userWaterRef, { amount: waterToAdd, targetMet: targetMet }).then(() => {
          console.log("Water check initialized successfully for", today);
        }).catch((error) => {
          console.error("Error initializing water check for", today, ":", error);
        });
      }
    }).catch((error) => {
      console.error("Error fetching water data for", today, ":", error);
    });
  }
  
  
  // function suggestMoreWater() {
  //   const userId = FIREBASE_AUTH.currentUser?.uid;
  //   if (!userId) {
  //       console.error("User not logged in");
  //       return;
  //   }

  //   let daysChecked = 0;
  //   let daysTargetNotMet = 0;

  //   for (let i = 1; i <= 3; i++) { // Check the last 3 days
  //       const date = new Date();
  //       date.setDate(date.getDate());
  //       const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

  //       const targetMetRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${formattedDate}/targetMet`);

  //       get(targetMetRef).then((snapshot) => {
  //           daysChecked++;
  //           if (snapshot.exists()) {
  //               const targetMet = snapshot.val();
  //               if (!targetMet) {
  //                   daysTargetNotMet++;
  //               }
  //           } else {
  //               console.log(`No data available for ${formattedDate}`);
  //               // You might want to treat no data as target not met or ignore it based on your app's logic
  //           }

  //           // After checking all days, suggest actions if needed
  //           if (daysChecked === 1) { // Ensure all days have been checked
  //               if (daysTargetNotMet > 0) {
  //                   console.log(`You didn't meet your water target on ${daysTargetNotMet} out of the last 3 days. Consider increasing your water intake.`);
  //                   // Perform any action here, such as updating UI or sending a notification
  //               } else {
  //                   console.log("Great job! You've met your water target for the last 3 days.");
  //                   // Optionally perform actions for successfully meeting targets
  //               }
  //           }
  //       }).catch((error) => {
  //           console.error(`Error fetching target met status for ${formattedDate}:`, error);
  //           daysChecked++;
  //           // Handle errors, consider incrementing daysTargetNotMet if necessary for your app's logic
  //       });
  //   }
  // }
 


  function suggestMoreWater() {
    const userId = FIREBASE_AUTH.currentUser?.uid;
    if (!userId) {
        Alert.alert("Not logged in", "You need to be logged in to check water intake status.");
        return;
    }

    let daysChecked = 0;
    let daysTargetMet = 0;

    for (let i = 1; i <= 3; i++) {
        const date = new Date();
        // date.setDate(date.getDate() - i);
        date.setDate(date.getDate());
        const formattedDate = date.toISOString().split('T')[0];

        const targetMetRef = ref(FIREBASE_DATABASE, `users/${userId}/water/${formattedDate}/targetMet`);
        


        get(targetMetRef).then((snapshot) => {
            daysChecked++;
            if (snapshot.exists() && snapshot.val()) {
                daysTargetMet++;
            }

            if (daysChecked === 1) {
                if ((daysTargetMet === 1)&&(target < 4000)) {
                  Alert.alert(
                    "Great Job!", // Alert Title
                    "You've met your water target for the last 3 days. Consider increasing your daily water intake to challenge yourself further.",
                    [
                      {
                        text: "Cancel",
                        style: "cancel",
                      },
                      {
                        text: "Adjust daily target",
                        onPress: () => setShowAdjustTargetModal(true), // Call the adjustTarget function here
                        style: "destructive", // This styles the button with a red color to indicate a potentially destructive action
                      },
                    ]
                  );     




                   
                } else {
                    // Alert.alert(
                    //     "Keep Going!",
                    //     `You didn't meet your water target on ${3 - daysTargetMet} out of the last 3 days. Try to reach your target every day!`,
                    //     [
                    //         {text: "OK", onPress: () => console.log("OK Pressed")}
                    //     ],
                    //     {cancelable: false}
                    // );
                }
            }
        }).catch((error) => {
            console.error(`Error fetching target met status for ${formattedDate}:`, error);
            daysChecked++;
            if (daysChecked === 3) {
                // Handle the case where there was an error fetching data for all days
                Alert.alert(
                    "Error",
                    "There was a problem fetching your water intake data. Please try again later.",
                    [
                        {text: "OK", onPress: () => console.log("OK Pressed")}
                    ],
                    {cancelable: false}
                );
            }
        });
    }
}






  function confirmAndResetProgress() {
    Alert.alert(
      "Confirm Reset", // Alert Title
      "Are you sure you want to reset your water intake progress? This action cannot be undone.", // Alert Message
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: () => resetButton(), // Call the resetProgress function here
          style: "destructive", // This styles the button with a red color to indicate a potentially destructive action
        },
      ]
    );
  }

  // Function to set a new target and close the modal


  // Function to toggle between Metric and Imperial units
  function switchUnit() {
    setUnits(units === "Metric" ? "Imperial" : "Metric");
  }

  // Function to get the start of the current day
  function getStartOfDay(date) {
    const d = date || new Date();
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    return startOfDay;
  }

  // Function to adjust the target intake by a specified amount
  function adjustTarget(amount) {
    const newTarget = parseInt(target) + parseInt(amount); // Convert both vars to numbers to avoid concatenation
    console.log(newTarget);
    if (newTarget < 1500) {
      Alert.alert("You must drink at least 1.5 liters of water a day");
    } else {
      setTarget(newTarget);
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        const userDatabaseRef = ref(FIREBASE_DATABASE, "users/" + user.uid);
        update(userDatabaseRef, { targetWater: newTarget });
      }
      setShowAdjustTargetModal(false);
    }
  }

  const excess = progress - target; // Calculate excess water intake

  // Render the UI components
  return (
    <View style={styles.container}>
      {/* Gradient */}
      <LinearGradient
        colors={["white", "white", "white", "lightcyan"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.containerGradient}
      >
        {/* Conditional rendering based on whether a target is set */}
        {target && (
          <>
            {/* Progress title + Progress Bar */}
            <View style={{ marginTop: 20 }} />
            <Text style={styles.excessText}>
              Progress: {progress}/{target} ml{" "}
              {progress > target && <> - Excess: {progress - target} ml</>}
            </Text>

            <View style={styles.progressBar}>
              {/* Dynamic styling for the progress bar based on current progress */}
              {progress <= target ? (
                <View
                  style={{
                    width: `${(progress / target) * 100}%`,
                    height: "100%",
                    backgroundColor: "#53d0ff",
                    borderRadius: 10,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#53d0ff",
                    borderRadius: 10,
                  }}
                />
              )}
            </View>
            {/* End of Progress title + Progress Bar */}

            {/* Pre-defined buttons for adding water intake */}

            <Text style={{ marginTop: 30, marginBottom: 5 }}>Add water</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                title="330 ml"
                onPress={() => submit(330)}
                style={styles.button}
              >
                <Text>330ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                title="500 ml"
                onPress={() => submit(500)}
                style={styles.button}
                color="#841584"
                accessibilityLabel="Add 500ml to your water progress"
              >
                <Text>500ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                title="1 L"
                onPress={() => submit(1000)}
                style={styles.button}
              >
                <Text>1 Litre</Text>
              </TouchableOpacity>
              <TouchableOpacity
                title="1 Pint"
                onPress={() => submit(568)}
                style={styles.button}
              >
                <Text>1 Pint</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: "grey", marginVertical: 20 }}>Or</Text>

            {/* Custom input for water intake */}
            <View style={styles.customContainer}>
              <Text style={{ marginBottom: 5 }}>
                Add a specific amount (ml)
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="0"
                value={customInputValue}
                onChangeText={(text) => setCustomInputValue(text)}
              />
              <TouchableOpacity style={styles.button} onPress={submitCustom}>
                <Text>Submit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.reset}
                onPress={confirmAndResetProgress}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>



            
            {/* <View style={styles.circlesContainer}>
              <View style={styles.circle}></View>
              <View style={styles.circle}></View>
              <View style={styles.circle}></View>
              <View style={styles.circle}></View>
              <View style={styles.circle}></View>
            </View> */}



          <View style={styles.circlesContainer}>
            {dayDetails.map((detail, index) => (
              <View key={index} style={[styles.circle, { backgroundColor: detail.color }]}>
                <Text style={styles.circleText}>{detail.date}</Text>
              </View>
            ))}
          </View>







            {/* ! Remove unit switcher */}
            {/* Unit switcher
            <View style={styles.unitContainer}>
              <Text style={styles.label}>Units: {units}</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={switchUnit}
              >
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
            </View> */}

            {/* Button to adjust the daily target */}
            <View style={styles.adjustTarget}>
              <Text style={{ color: "grey" }}>
                Want to adjust your daily target?
              </Text>
              <TouchableOpacity
                title="Adjust Daily Target"
                onPress={() => setShowAdjustTargetModal(true)}
                style={styles.button}
              >
                <Text>Adjust Daily Target</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal for adjusting the daily target */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showIncreaseTargetModal}
          onRequestClose={() => setShowAdjustTargetModal(false)}
        >
          {/* Modal UI for adjusting target */}
          <View style={styles.modalBackground}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalHeader}>
                  Adjust Daily Water Target
                </Text>
                {/* Buttons for increasing or decreasing the target */}
                <TouchableOpacity
                  style={styles.adjustModalButton}
                  onPress={() => adjustTarget(100)}
                >
                  <Text style={styles.modalButtonText}>Increase by 100 ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.adjustModalButton}
                  onPress={() => adjustTarget(200)}
                >
                  <Text style={styles.modalButtonText}>Increase by 200 ml</Text>
                </TouchableOpacity>
                {/* Additional buttons for target adjustment */}
                {/* Cancel button to close the modal */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAdjustTargetModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    height: "100%",
  },
  containerGradient: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#ffffff",
    width: "100%",
    height: "100%",
    padding: 30,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  customContainer: {
    alignItems: "center",
  },
  input: {
    width: 200,
    height: 30,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "black",
    backgroundColor: "white",
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  unitContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeButton: {
    backgroundColor: "#007bff",
    borderRadius: 5,
  },

  reset: {
    borderWidth: 2,
    borderColor: "#d9534f", // A shade of red to signify a reset/clear action
    backgroundColor: "#f9d6d5", // A lighter shade for the background to keep it less aggressive
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10, // Add some space above the reset button
  },
  resetButtonText: {
    color: "#d9534f", // Text color that matches the border
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // reset: {
  //   borderWidth: 2,
  //   borderColor: "darkcyan",
  //   backgroundColor: "red",
  //   paddingVertical: 5,
  //   paddingHorizontal: 15,
  //   borderRadius: 10,
  // },
  button: {
    borderWidth: 2,
    borderColor: "darkcyan",
    backgroundColor: "lightcyan",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  progressBar: {
    height: 20,
    backgroundColor: "#e0e0e0",
    width: "90%",
    borderRadius: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  excessText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  adjustModalButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ff0000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  adjustTarget: {
    position: "absolute",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    bottom: 200,
  },









  // circlesContainer: {
  //   flexDirection: 'row', // Align circles horizontally
  //   justifyContent: 'center', // Center circles horizontally
  //   alignItems: 'center', // Center circles vertically
  //   marginTop: 20, // Adjust as needed for spacing from other elements
  // },
  
  // circle: {
  //   width: 60, // Increase if the text doesn't fit
  //   height: 60, // Make sure width and height are the same for a perfect circle
  //   borderRadius: 30, // Half of width/height
  //   backgroundColor: 'skyblue', // Adjust as needed
  //   marginHorizontal: 10, // Space between circles
  //   justifyContent: 'center', // Center text vertically
  //   alignItems: 'center', // Center text horizontally
  // },
  
  // circleText: {
  //   color: 'white', // Ensure good contrast with circle background
  //   fontSize: 14, // Adjust as needed. Decrease if text doesn't fit
  // },





  circlesContainer: {
    flexDirection: 'row', // Keep circles aligned horizontally
    justifyContent: 'space-around', // Distribute circles evenly in the container
    alignItems: 'center', // Align circles vertically in the middle
    marginTop: 30, // Increase top margin for better spacing from other elements
    marginHorizontal: 20, // Add horizontal margin for breathing space on sides
    paddingVertical: 20, // Add vertical padding inside the container
    backgroundColor: '#f0f0f0', // Light background color for the container
    borderRadius: 10, // Rounded corners for the container
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1, // Light shadow
    shadowRadius: 3.84,
    elevation: 5, // Elevation for Android
    top: 90,
  },

  

  circle: {
    width: 70, // Slightly larger circles
    height: 70, // Keep width and height the same
    borderRadius: 35, // Half of width/height to maintain the circle shape
    backgroundColor: '#009688', // Use a more vibrant color for the circle
    marginHorizontal: 5, // Reduce space between circles if necessary
    justifyContent: 'center', // Ensure text is centered vertically
    alignItems: 'center', // Ensure text is centered horizontally
    borderWidth: 2, // Thin border for definition
    borderColor: '#ffffff', // White border for contrast
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2, // Moderate shadow
    shadowRadius: 1.41,
    elevation: 2, // Slight elevation for Android
  },

  
  circleText: {
    color: '#ffffff', // White color for better contrast and readability
    fontSize: 16, // Slightly larger font size for better visibility
    fontWeight: 'bold', // Bold font weight for emphasis
  },
  
  
  
  
});
