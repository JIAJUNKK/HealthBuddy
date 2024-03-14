// Importing necessary modules from React and React Native
import * as React from "react";
import {
  View,
  SafeAreaView,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";

// Importing Firebase configuration and utilities for database and authentication
import { FIREBASE_DATABASE } from "../../FirebaseConfig";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { ref, onValue } from "firebase/database";

// Static assets are imported for use in the UI


// Definition of the HomeScreen component
export default function HomeScreen({ navigation }) {
  const [progress, setProgress] = React.useState(0);
  const [targetWater, setTargetWater] = React.useState(0);

  const [targetCalorie, setTargetCalorie] = React.useState(0); // 1. Added state for targetCalorie
  const [calorieProgress, setcalorieProgress] = React.useState(0);

  const [backgroundImage, setBackgroundImage] = React.useState("");
  const [charceterImage, setCharacterImage] = React.useState("");
  const [treeImage, setTreeImage] = React.useState("");

  const allTrees = {
    treeImages: {
      tree1: require("../../assets/trees/original/tree-1.png"),
      tree2: require("../../assets/trees/original/tree-2.png"),
      tree3: require("../../assets/trees/original/tree-3.png"),
      tree4: require("../../assets/trees/original/tree-4.png"),
    },
    cactusImages: {
      tree1: require("../../assets/trees/cactus/cactus-1.png"),
      tree2: require("../../assets/trees/cactus/cactus-2.png"),
      tree3: require("../../assets/trees/cactus/cactus-3.png"),
      tree4: require("../../assets/trees/cactus/cactus-4.png"),
    },
    cherryBlossomImages: {
      tree1: require("../../assets/trees/cherry/cherry-blossom-1.png"),
      tree2: require("../../assets/trees/cherry/cherry-blossom-2.png"),
      tree3: require("../../assets/trees/cherry/cherry-blossom-3.png"),
      tree4: require("../../assets/trees/cherry/cherry-blossom-4.png"),
    },
  };

  const allImages = {
    dessert: require('../../assets/bg/dessert-landscape.png'),
    greenLandscape: require('../../assets/bg/green-landscape.png'),
    iceLandscape:  require('../../assets/bg/ice-landscape.png'),
  }
 
  const allCharacter = {
    penguin: {
      animal1: require("../../assets/animals/penguin/penguin-1.png"),
      animal2: require("../../assets/animals/penguin/penguin-2.png"),
      animal3: require("../../assets/animals/penguin/penguin-3.png"),
      animal4: require("../../assets/animals/penguin/penguin-4.png"),
    },
    koala: {
      animal1: require("../../assets/animals/koala/koala-1.png"),
      animal2: require("../../assets/animals/koala/koala-2.png"),
      animal3: require("../../assets/animals/koala/koala-3.png"),
      animal4: require("../../assets/animals/koala/koala-4.png"),
    },
    racoon: {
      animal1: require("../../assets/animals/racoon/racoon-1.png"),
      animal2: require("../../assets/animals/racoon/racoon-2.png"),
      animal3: require("../../assets/animals/racoon/racoon-3.png"),
      animal4: require("../../assets/animals/racoon/racoon-4.png"),
    },
  };

  // useEffect hook to fetch and listen to user data from Firebase on component mount
  React.useEffect(() => {
    const user = FIREBASE_AUTH.currentUser; // Getting the current user
    if (!user) return; // If no user is logged in, exit the effect

    // References to the user-specific paths in the Firebase database
    const targetWaterRef = ref(
      FIREBASE_DATABASE,
      "users/" + user.uid + "/targetWater"
    );
    const targetCalorieRef = ref(
      // Reference to targetCalorie
      FIREBASE_DATABASE,
      "users/" + user.uid + "/targetCalorie"
    );
    const progressRef = ref(
      FIREBASE_DATABASE,
      "users/" + user.uid + "/drinkingProgress"
    );

    const backgroundRef = ref(
      FIREBASE_DATABASE, 
      "userPreference/" + user.uid + "/background"
    );

    const treeRef = ref(
      FIREBASE_DATABASE, 
      "userPreference/" + user.uid + "/tree"
    );

    const animalRef = ref(
      FIREBASE_DATABASE, 
      "userPreference/" + user.uid + "/animal"
    );

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Month is zero-indexed, so add 1
    const day = today.getDate();
    const formattedDate = `${year}-${month < 10 ? "0" + month : month}-${
      day < 10 ? "0" + day : day
    }`;
    const calorieProgressRef = ref(
      FIREBASE_DATABASE,
      `users/${user.uid}/calories/${formattedDate}`
    );

    // Setting up real-time listeners for the progress and target water values in the database
    const progressListener = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      if (data || data === 0) {
        setProgress(data); // Updating progress state if data is valid
      }
    });

    const targetWaterListener = onValue(targetWaterRef, (snapshot) => {
      const data = snapshot.val(); // Extracting data from snapshot
      if (data || data === 0) {
        setTargetWater(data); // Updating targetWater state if data is valid
      }
    });

    const calorieProgressListener = onValue(calorieProgressRef, (snapshot) => {
      const data = snapshot.val();
      if (data || data === 0) {
        setcalorieProgress(data);
      }
    });

    const targetCalorieListener = onValue(targetCalorieRef, (snapshot) => {
      // Listener for targetCalorie
      const data = snapshot.val();
      if (data || data === 0) {
        setTargetCalorie(data); // Updating targetCalorie state if data is valid
      }
    });

    const backgroundListener = onValue(backgroundRef, (snapshot) => {
      // Listener for targetCalorie
      const data = snapshot.val();
      if (data || data === 0) {
        setBackgroundImage(data); // Updating targetCalorie state if data is valid
      }
    });

    const treeListener = onValue(treeRef, (snapshot) => {
      // Listener for targetCalorie
      const data = snapshot.val();
      if (data || data === 0) {
        setTreeImage(data); // Updating targetCalorie state if data is valid
      }
    });
    const animalListener = onValue(animalRef, (snapshot) => {
      // Listener for targetCalorie
      const data = snapshot.val();
      if (data || data === 0) {
        setCharacterImage(data); // Updating targetCalorie state if data is valid
      }
    });

    // Cleanup function to unsubscribe from the listeners when the component unmounts
    return () => {
      progressListener();
      calorieProgressListener();
      targetWaterListener();
      targetCalorieListener();
      backgroundListener();
      animalListener();
      treeListener();
    };
  }, []);


  const goToWaterScreen = () => {
    navigation.navigate('Water');
  };

  const goToFoodScreen = () => {
    navigation.navigate('Food');
  };



  const getBackgroundImage = () =>{
    if (!backgroundImage){
      return;
    }
    return allImages[backgroundImage];
  }

  //Change the size of the tree accordingly
  const getTreeImage = () => {
    if (!treeImage) {
      return;
    }
    const waterPercentage = (progress / targetWater) * 100;
    if (waterPercentage <= 25) {
      return allTrees[treeImage].tree1;
    } else if (waterPercentage <= 50) {
      return allTrees[treeImage].tree2;
    } else if (waterPercentage <= 75) {
      return allTrees[treeImage].tree3;
    } else {
      return allTrees[treeImage].tree4;
    }
  };

  const getCharacterImage = () => {
    if (!charceterImage) {
      return;
    }
    const caloriePercentage = (calorieProgress / targetCalorie) * 100;
    if (caloriePercentage <= 25) {
      return allCharacter[charceterImage].animal4;
    } else if (caloriePercentage <= 50) {
      return allCharacter[charceterImage].animal3;
    } else if (caloriePercentage <= 75) {
      return allCharacter[charceterImage].animal2;
    } else {
      return allCharacter[charceterImage].animal1;
    }
  };

  //Getting the style of the tree accordingly
  const getTreeImageStyle = () => {
    let style = {};
    const waterPercentage = (progress / targetWater) * 100;
    const referencePointX = 0.5;
    const referencePointY = 1;
    style = {
      position: "absolute",
      top: `${referencePointY}%`,
      left: `${referencePointX * 80 - 15}%`,
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    };
    // }
    return style;
  };

  // The component's rendered UI
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
        {/* Progress bars visualization */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarContent}>
            {/* Calories */}
            <View style={styles.progressBarAndImage}>
              <Image
                source={require("../../assets/icons/calories.png")}
                style={styles.barIcon}
              />
              <View style={styles.progressBar}>
                {/* ! Change this for calories progress and targetCalories */}
                {calorieProgress <= targetCalorie ? (
                  <View
                    style={{
                      width: `${(calorieProgress / targetCalorie) * 100}%`,
                      height: "100%",
                      backgroundColor: "#fc9039",
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#fc9039",
                      borderRadius: 10,
                    }}
                  />
                )}
                <Text style={{ color: "white", fontSize: 12, marginTop: 2 }}>
                  {calorieProgress}/{targetCalorie}
                </Text>
              </View>
            </View>

            {/* Water */}
            <View style={styles.progressBarAndImage}>
              <Image
                source={require("../../assets/icons/water-drop.png")}
                style={styles.barIcon}
              />
              <View style={styles.progressBar}>
                {progress <= targetWater ? (
                  <View
                    style={{
                      width: `${(progress / targetWater) * 100}%`,
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
                <Text style={{ color: "white", fontSize: 12, marginTop: 2 }}>
                  {progress}/{targetWater}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Static images for decoration */}
        <Image source={getCharacterImage()} style={styles.animal} />


        <TouchableOpacity style={styles.petButton} onPress={goToFoodScreen}>
          <Text style={styles.petButtonText}>Food</Text>
        </TouchableOpacity>



        <View style={styles.treeTouch}>
          <Image source={getTreeImage()} style={getTreeImageStyle()} />
        </View>


        <TouchableOpacity style={styles.treeButton} onPress={goToWaterScreen}>
          <Text style={styles.treeButtonText}>Water</Text>
        </TouchableOpacity>


      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Takes full height of the parent
    height: "100%",
    width: "100%",
    backgroundColor: "white",
    zIndex: 0,
    position: "relative",
  },
  imageBack: {
    flex: 1, // Background image takes full container space
  },
  progressBarAndImage: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
  },
  progressBar: {
    height: 20, // Fixed height for the progress bar
    backgroundColor: "white", // Background color for the progress bar
    width: "80%",
    borderRadius: 15,
  },
  progressBarContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 110,
    position: "absolute",
    display: "flex",
    top: 25,
    width: "100%",
    zIndex: 100,
  },
  progressBarContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6);",
    height: 115,
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    width: "95%",
    gap: 20,
    borderRadius: 15,
    paddingBottom: 2,
  },
  barIcon: {
    position: "relative",
    width: 30,
    height: 30,
  },
  animal: {
    position: "relative", // Positioned relative to its normal position
    top: "55%", // Pushed down to 55% from the top of its parent
    height: 200,
    width: 200,
    resizeMode: "contain",
    zIndex: 40,
  },

  treeTouch: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "start",
  },


  petButton: {
    alignSelf: 'center', // Center the button horizontally
    backgroundColor: '#FF6347', // Example button color, you can choose your own
    paddingHorizontal: 30, // Horizontal padding
    paddingVertical: 15, // Vertical padding
    borderRadius: 25, // Rounded corners
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius

    elevation: 5, // Elevation for Android (adds shadow)
    top: 445,
    right: 90,
    zIndex: 10,
  },

  petButtonText: {
    color: 'white', // Button text color
    fontSize: 16, // Button text size
    fontWeight: 'bold', // Button text weight
  },




  treeButton: {
    alignSelf: 'center', // Center the button horizontally
    // backgroundColor: '#007BFF', // Example button color, you can choose your own
    
    backgroundColor: '#0099FF', // A lighter, water-themed blue color

    paddingHorizontal: 30, // Horizontal padding
    paddingVertical: 15, // Vertical padding
    borderRadius: 25, // Rounded corners
    shadowColor: "#000", // Shadow color
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur radius

    elevation: 5, // Elevation for Android (adds shadow)
    top: 395,
    left: 100,
  },

  treeButtonText: {
    color: 'white', // Button text color
    fontSize: 16, // Button text size
    fontWeight: 'bold', // Button text weight
  },

});