import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";

import { FIREBASE_AUTH } from "../FirebaseConfig";
import { FIREBASE_DATABASE } from "../FirebaseConfig";
import { ref, get, onValue } from "firebase/database";

import HomeScreen from "./screens/HomeScreen";
import WaterScreen from "./screens/WaterScreen";

import ProfileScreen from "./screens/ProfileScreen";
import FoodScreen from "./screens/FoodScreen";
import FoodDetailScreen from "./screens/FoodDetailsScreen";
import CustomizeScreen from "./screens/CustomizeScreen";
import LoginScreen from "./screens/LoginScreen";
import EditDetailsScreen from "./profileScreens/editDetails";
import IntroductionFlow from "./screens/IntroductionFlow";
import HistoryScreen from "./screens/HistoryScreen";

import CustomizeTree from "./customiseFlow/customiseTree";
import CustomizeAnimal from "./customiseFlow/customiseAnimal";
import Customizebackground from "./customiseFlow/customiseBackground";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name=" " component={ProfileScreen} />
      <Stack.Screen name="EditPreference" component={EditDetailsScreen} />
    </Stack.Navigator>
  );
};

const FoodStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name=" " component={FoodScreen} />
      <Stack.Screen name="FoodDetails" component={FoodDetailScreen} />
    </Stack.Navigator>
  );
};

const CustomiseStack = () =>{
  return (
    <Stack.Navigator>
      <Stack.Screen name=" " component={CustomizeScreen} />
      <Stack.Screen name="Choose Your Tree" component={CustomizeTree} />
      <Stack.Screen name="Choose Your Animal" component={CustomizeAnimal} />
      <Stack.Screen name="Choose Your Background" component={Customizebackground} />
    </Stack.Navigator>
  )
}

const MainContainer = () => {
  const [userSignedIn, setUserSignedIn] = useState(false);
  const [showIntroductionFlow, setShowIntroductionFlow] = useState(true);
  
  useEffect(() => {
    const unsubscribe = FIREBASE_AUTH.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDatabaseRef = ref(FIREBASE_DATABASE, "users/" + user.uid);
          const userDataSnapshot = await get(userDatabaseRef);
          const userData = userDataSnapshot.val();
          if (!userData || !userData.targetWater || !userData.targetCalorie) {
            setShowIntroductionFlow(true);
          } else {
            setShowIntroductionFlow(false);
          }
          setUserSignedIn(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserSignedIn(false);
        }
      } else {
        setUserSignedIn(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (!userSignedIn) {
    return (
      <NavigationContainer>
        <LoginScreen />
      </NavigationContainer>
    );
  }

  if (showIntroductionFlow) {
    return <IntroductionFlow onComplete={() => setShowIntroductionFlow(false)} isVisible={showIntroductionFlow} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let rn = route.name;

            if (rn === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (rn === "Water") {
              iconName = focused ? "water" : "water-outline";
            } else if (rn === "Food") {
              iconName = focused ? "fast-food" : "fast-food-outline";
            } else if (rn === "Customize") {
              iconName = focused ? "shirt" : "shirt-outline";
            } else if (rn === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            } else if (rn === "History"){
              iconName = focused ? "bar-chart" : "bar-chart-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "grey",
          tabBarLabelStyle: {
            paddingBottom: 10,
            fontSize: 10,
          },
          tabBarStyle: {
            display: "flex",
          },
        })}
      >
        {/* Remove header title from home screen to gain more screen */}
        <Tab.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/> 
        <Tab.Screen name="Water" component={WaterScreen} />
        <Tab.Screen name="Food" component={FoodStack} />
        <Tab.Screen name="Customize" component={CustomiseStack} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Settings" component={ProfileStack} />

      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default MainContainer;
