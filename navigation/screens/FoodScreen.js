import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_DATABASE, FIREBASE_AUTH } from "../../FirebaseConfig";
import { ref, get, onValue, off } from "firebase/database";
import { Calendar } from "react-native-calendars";

// Initializing global variables for input management and default options
let input = "";
let new_options = Array(5).fill("Search for Options");

// Function to log added food data for debugging purposes
function save_data(name, kcal) {
  console.log("added food: ", name, " Kcal: ", kcal);
}

// Async function to retrieve autocomplete suggestions from an external API based on the user's input
async function retrieve_key_word(input_value) {
  // Replaces spaces with URL-encoded spaces for API requests
  input_value = input_value.replace(/ /g, "%20");
  // Constructs the API URL with the user's input and API keys
  const url = 'https://api.edamam.com/auto-complete?app_id=1544b4d7&app_key=aebeff211a657ec36454ae9d6f5f1c34&q=' + input_value + '&limit=6';
  // Fetches data from the API
  const res = await fetch(url);
  const data = await res.json(); // Parses the JSON response
  return data; // Returns the parsed data
}

// Async function to retrieve food data by barcode using an external API
async function retrieve_barcode_data(barcode, navigation) {
  console.log(barcode); // Logging the barcode for debugging
  // Constructs the API URL with the scanned barcode and API keys
  const url = 'https://api.edamam.com/api/food-database/v2/parser?app_id=1544b4d7&app_key=aebeff211a657ec36454ae9d6f5f1c34&upc=' + barcode + '&nutrition-type=cooking';
  // Fetches data from the API
  const res = await fetch(url);
  const data = await res.json(); // Parses the JSON response
  // Checks if the barcode was recognized and processes the data accordingly
  if (data.error !== "not_found") {
    // Extracts necessary information from the response
    const information = data.hints;
    const knownAs = information[0].food.knownAs;
    const kcal = information[0].food.nutrients.ENERC_KCAL;
    // Navigates to the FoodDetails screen with the retrieved data
    navigation.navigate("FoodDetails", { foodName: knownAs, kcal });
  } else {
    Alert.alert("barcode not recognized"); // Logs if the barcode is not recognized
  }
}

// Similar to retrieve_barcode_data but retrieves data based on text input rather than barcode
async function retrieve_food_data(input_value) {
  // URL encodes the input value for the API request
  const url_input_value = input_value.replace(/ /g, "%20");
  // Constructs the API URL with the user's input and API keys
  const url = 'https://api.edamam.com/api/food-database/v2/parser?app_id=1544b4d7&app_key=aebeff211a657ec36454ae9d6f5f1c34&ingr=' + url_input_value + '&nutrition-type=cooking';
  // Fetches data from the API
  const res = await fetch(url);
  const data = await res.json(); // Parses the JSON response
  // Processes the API response and returns relevant food data if available
  const choices = data.hints;
  for (let i = 0; i < choices.length; i++) {
    const choice = choices[i];
    if (choice.food.knownAs.toLowerCase() === input_value.toLowerCase()) {
      // Destructures the necessary information from the choice
      const {
        knownAs,
        nutrients: { ENERC_KCAL: kcal },
      } = choice.food;
      // Logs the saved data for debugging
      save_data(knownAs, kcal);
      return { knownAs, kcal }; // Returns the food name and calorie content
    }
  }
  return null; // Returns null if no matching food is found
}

// Function to perform a basic search for food options based on the global `input` variable
async function basic_search() {
  // Retrieves autocomplete suggestions based on the user's input
  const values = await retrieve_key_word(input);
  // Updates the options for display based on the API response
  new_options = values.slice(0, 6);
  console.log(new_options); // Logs the new options for debugging
  return new_options; // Returns the new options
}

// The main functional component for the Food Screen
export default function FoodScreen({}) {
  const [text_0, setText_0] = useState("...");
  const [text_1, setText_1] = useState("...");
  const [text_2, setText_2] = useState("...");
  const [text_3, setText_3] = useState("...");
  const [text_4, setText_4] = useState("...");
  const [text_5, setText_5] = useState("...");
  const [modalVisible, setModalVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const [showResults, setShowResults] = useState(false);
  const [userFoods, setUserFoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State to store manually entered date
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [customInputModalVisible, setCustomInputModalVisible] = useState(false);
  const [customInputName, setCustomInputName] = useState('');
  const [customInputCalories, setCustomInputCalories] = useState('');

  const handleSave = () => {
    console.log('Custom Input Name:', customInputName);
    console.log('Custom Input Calories:', customInputCalories);
    setCustomInputCalories('')
    setCustomInputName('')
    setCustomInputModalVisible(false);
    navigation.navigate("FoodDetails", {
      foodName: customInputName,
      kcal: customInputCalories,
      clearSearchInput,
    });

  };

  // Function to toggle the visibility of the calendar
  const toggleCalendarVisibility = () => {
    setCalendarVisible(!calendarVisible);
  };

  const [markedDates, setMarkedDates] = useState({
    [new Date().toISOString().split("T")[0]]: {
      selected: true,
      selectedColor: "#26994b", // Specify the color for the selected date
    },
  });

  // UseEffect hook for fetching data and managing permissions on component mount
  useEffect(() => {
    // Defines an async function for fetching user-specific food data from Firebase
    const fetchData = async () => {
      try {
        const user = FIREBASE_AUTH.currentUser;
        if (user) {
          // Fetch user foods initially
          const userFoodsRef = ref(FIREBASE_DATABASE, `usersFood/${user.uid}`);
          const snapshot = await get(userFoodsRef);
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const foods = Object.values(userData).map(async (item) => {
              const { foodName, time } = item;
              const kcal = item.calorie
              return { foodName, time, kcal };
            });
            Promise.all(foods).then((completedFoods) => {
              setUserFoods(completedFoods);
            });
          }

          // Listen for changes in user foods
          const foodRef = ref(FIREBASE_DATABASE, `usersFood/${user.uid}`);
          const foodRefOnValueChange = onValue(foodRef, (snapshot) => {
            const foods = Object.values(snapshot.val()).map(async (item) => {
              const { foodName, time } = item;
              const kcal = item.calorie;
              return { foodName, time, kcal };
            });
            Promise.all(foods).then((completedFoods) => {
              setUserFoods(completedFoods);
            });
          });
          return () => off(foodRef, "value", foodRefOnValueChange);
        }
      } catch (error) {
        console.error("Error fetching user foods:", error.message);
      }
    };

    // Defines an async function for requesting barcode scanner permissions
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    fetchData();
    getBarCodeScannerPermissions();
  }, []);

  const renderGroupedFoods = () => {
    const selectedDateString = selectedDate.toISOString().split("T")[0];
    const foodsEnteredForSelectedDate = userFoods.filter((food) => {
      const foodDate = new Date(food.time).toISOString().split("T")[0];
      return foodDate === selectedDateString;
    });
    const groupedFoods = groupFoodsByTime(foodsEnteredForSelectedDate);

    return Object.entries(groupedFoods).map(([time, foods], index) => (
      <View key={index} style={styles.foodGroup}>
        <Text style={styles.foodGroupTitle}>{`${time}:00 hour`}</Text>
        {foods.map((food, foodIndex) => (
          <View key={foodIndex} style={styles.userFoodItem}>
            <Text>{food.foodName}</Text>
            <Text>{food.time}</Text>
            <Text>Kcal: {(food.kcal).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    ));
  };

  // Handler for barcode scan events
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setModalVisible(!modalVisible);
    console.log("getting data");
    information = retrieve_barcode_data(data, navigation);
  };

  // Function to update the search input and fetch new options based on the input
  async function set_input(text, ...funcs) {
    input = text;
    setShowResults(text.trim() !== "");
    const new_options_2 = await basic_search();
    funcs.forEach((func, index) => func(new_options_2[index] || "..."));
  }

  // Clears the search input and resets related states
  function clearSearchInput() {
    input = "";
    setShowResults(false);
    setText_0("...");
    setText_1("...");
    setText_2("...");
    setText_3("...");
    setText_4("...");
    setText_5("...");
  }

  // Handles selection of a search option
  async function option_selected(known_as_label) {
    console.log("selected");
    if (known_as_label === "Search for Options") {
      console.log("select options first");
      return;
    }
    console.log("This is known as label: ", known_as_label);
    try {
      const { knownAs, kcal } = await retrieve_food_data(known_as_label);
      navigation.navigate("FoodDetails", {
        foodName: knownAs,
        kcal,
        clearSearchInput,
      });
    } catch (error) {
      console.error("Error retrieving food data:", error);
      Alert.alert(
        "Error",
        "Failed to retrieve food data. Please try again later."
      );
    }
  }

  // Groups foods by time for display
  const groupFoodsByTime = (foods) => {
    const groupedFoods = {};
    foods.forEach((food) => {
      const time = new Date(food.time).getHours();
      if (!groupedFoods[time]) {
        groupedFoods[time] = [];
      }
      groupedFoods[time].push(food);
    });
    return groupedFoods;
  };

  // Handler for calendar day presses
  const handleDayPress = (day) => {
    setSelectedDate(new Date(day.dateString));
    const updatedMarkedDates = {};

    // Marks the selected day
    updatedMarkedDates[day.dateString] = {
      selected: true,
      selectedColor: "#26994b", // Specify the color for the selected date
    };
    setMarkedDates(updatedMarkedDates);
  };

  // Checks for barcode scanner permission status and renders appropriate content
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  // Define state to manage the visibility of the calendar
  // JSX for rendering the component's UI
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Input and Scan Button at the bottom */}
        <View style={styles.bottomContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={"🔍 Search ... "}
              onChangeText={(text) =>
                set_input(
                  text,
                  setText_0,
                  setText_1,
                  setText_2,
                  setText_3,
                  setText_4,
                  setText_5
                )
              }
            />
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => setModalVisible(true)}
            >
              <FontAwesome5 name="barcode" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* List of options at the top */}
        {showResults && (
          <View style={styles.resultsContainer}>
            {[text_0, text_1, text_2, text_3, text_4, text_5].map(
              (option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.results}
                  onPress={() => option_selected(new_options[index])}
                >
                  <Text>{option}</Text>
                  <Button
                    title="View Details"
                    onPress={() => option_selected(new_options[index])}
                    color="#26994b"
                  />
                </TouchableOpacity>
              )
            )}
          </View>
        )}

        {/* Existing code for calendar */}
        {/* Button to toggle visibility of the calendar */}
        <TouchableOpacity
          style={styles.toggleCalendarButton}
          onPress={toggleCalendarVisibility}
        >
          <Text style={styles.toggleCalendarButtonText}>
            {calendarVisible ? "Hide Calendar" : "Show Calendar"}
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.toggleCalendarButton}
          onPress={() => setCustomInputModalVisible(true)}
        >
          <Text style={styles.toggleCalendarButtonText}>Open Custom Input Modal</Text>
        </TouchableOpacity>

        {/* Calendar */}
        {calendarVisible && (
          <Calendar
            onDayPress={handleDayPress}
            markingType={"multi-dot"}
            markedDates={markedDates} // Pass the markedDates prop
            theme={{
              todayTextColor: undefined, // Remove highlight from today's date
            }}
          />
        )}
        
        {/* User foods */}
        {userFoods.length > 0 ? (
          renderGroupedFoods()
        ) : (
          <Text>No food items found.</Text>
        )}

        {/* Modal for barcode scanner */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Barcode Scanner</Text>
              <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.barcodeScanner}
              />
              {scanned && (
                <Button
                  title="Tap to Scan Again"
                  onPress={() => setScanned(false)}
                />
              )}
              <Pressable
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <View style={styles.container}>
      
        <Modal
          animationType="slide"
          transparent={true}
          visible={customInputModalVisible}
          onRequestClose={() => setCustomInputModalVisible(false)}
        >
        <View style={style_input.modalContainer}>
          <View style={style_input.modalContent}>
            <Text style={styles.modalTitle}>Custom Input</Text>
            <Text style={style_input.label}>Name:</Text>
            <TextInput
              style={style_input.input}
              placeholder="Enter name"
              value={customInputName}
              onChangeText={(text) => setCustomInputName(text)}
            />
            <Text style={style_input.label}>Calories:</Text>
            <TextInput
              style={style_input.input}
              placeholder="Enter calories"
              keyboardType="numeric"
              value={customInputCalories}
              onChangeText={(text) => setCustomInputCalories(text)}
            />
            <View style={style_input.buttonContainer}>
              <Pressable
                style={style_input.cancelButton}
                onPress={() => setCustomInputModalVisible(false)}
              >
                <Text style={style_input.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={style_input.saveButton}
                onPress={handleSave}
              >
                <Text style={style_input.buttonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
        </Modal>

    </View>
      </View>
    </ScrollView>
  );
}

// StyleSheet for styling the component
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#eef7ed",
  },
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: "#eef7ed",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    padding: 10,
    fontSize: 18,
    backgroundColor: "white",
    borderRadius: 10,
  },
  scanButton: {
    backgroundColor: "#26994b",
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
  resultsContainer: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "white",
    padding: 10,
  },
  results: {
    padding: 15,
    fontSize: 16,
    backgroundColor: "#c1e7c3",
    marginBottom: 10,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#26994b",
  },
  barcodeScanner: {
    width: 300,
    height: 300,
    marginBottom: 20,
    borderRadius: 10,
  },
  userFoodItem: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  foodGroup: {
    marginBottom: 20,
  },
  foodGroupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10, marginTop: 10,
  },
  closeButton: {
    backgroundColor: "#26994b",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 18,
  },
  toggleCalendarButton: {
    backgroundColor: "#26994b",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  toggleCalendarButtonText: {
    color: "white",
    fontSize: 16,
  },
});


const style_input = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background color for the modal container
  },
  modalContent: {
    backgroundColor: '#26994b', // Background color for the modal content
    paddingRight: 20,
    paddingBottom: 20,
    paddingLeft: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingRight: 50,
    paddingLeft: 5,
    backgroundColor: '#ffffff', // Background color for the input field
    color: '#26994b', // Text color for the input field
  },
  label: {
    color: '#ffffff', // Text color for labels
    marginBottom: 5,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#ff3333', // Background color for the cancel button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#ffffff', // Background color for the save button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#26994b', // Text color for buttons
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

