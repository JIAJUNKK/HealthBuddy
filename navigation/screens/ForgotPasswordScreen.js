// ForgotPasswordScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Image,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { LinearGradient } from "expo-linear-gradient";

export const TextBox = ({
  placeHolder,
  value,
  onChangeText,
  secureTextEntry,
}) => {
  return (
    <View>
      <TextInput
        style={{
          height: 40,
          width: 250,
          borderColor: "green",
          borderWidth: 2,
          marginBottom: 10,
          paddingHorizontal: 10,
          borderRadius: 10,
          backgroundColor: "white",
        }}
        placeholder={placeHolder}
        value={value}
        multiline={false}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

export const ForgotPasswordScreen = ({ goBack }) => {
  const [email, setEmail] = useState();

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(FIREBASE_AUTH, email);
      Alert.alert(
        "Password reset email sent. Check your email for instructions."
      );
      goBack();
    } catch (error) {
      Alert.alert(`Forgot password failed: \n${error.message}`);
      console.error("Error sending password reset email:", error.message);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <StatusBar barStyle="dark-content" />
      {/* Gradient */}
      <LinearGradient
        colors={["white", "#e3f7e3", "#54f756"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 130, height: 130, marginBottom: 30 }}
        />
        <Text
          style={{
            color: "black",
            fontSize: 22,
            fontWeight: 500,
            marginBottom: 30,
          }}
        >
          Find your password
        </Text>
        <View>
          <Text
            style={{
              color: "black",
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 2,
            }}
          >
            Email
          </Text>
          <TextBox placeHolder="Email" value={email} onChangeText={setEmail} />
        </View>

        <TouchableOpacity
          onPress={handleResetPassword}
          style={{
            fontWeight: "bold",
            borderRadius: 10,
            marginTop: 20,
            borderWidth: 2,
            borderColor: "black",
            backgroundColor: "green",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 30,
              paddingRight: 30,
              color: "white",
            }}
          >
            Reset Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goBack}
          style={{
            fontSize: 15,
            fontWeight: "bold",
            color: "purple",
            paddingTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "black",
              paddingTop: 20,
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default ForgotPasswordScreen;
