import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  StyleSheet,
  Image,
  Modal,
  Button,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FIREBASE_AUTH } from "../../FirebaseConfig";
import { FIREBASE_DATABASE } from "../../FirebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { ref, set } from "firebase/database";


import ForgotPasswordScreen, { TextBox } from "./ForgotPasswordScreen";

const SignupBubble = ({passStrength}) => (<View><Text>{passStrength}</Text></View>)


const LoginScreen = ({navigation}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passStrength,setPassStrength] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);

  //Checks if an email looks like an actual email
  function validateEmail(email){
    const emailExpression=/^[^@]+@\w+(\.\w+)+\w£/
    if (!emailExpression.test(email)) {
      return "Please give us a proper email"
    }
    return true
  }
  //Ensures we only accept Strong passwords
  function validatePassword(password){
    if (password.length<6) {

      return "This password is lesser than 6 characters"
    }
    if (password.length>16) {
      return "This password is much longer than 16 characters"
    }
    if (!password.match(/[a-z]+/)){
      return "This password does not contain a lower letter"
    }
    //Least 1 upper letter
    if (!password.match(/[A-Z]+/)){
      return "This password does not contain a Capital letter"
    }
    //Least 1 Number
    if (!password.match(/[0-9]+/)){
      return "This password does not contain a number"
    }
    if (!password.match(/[~`!@#$%^&*()\-+={}\[\]|\\:;'<,>.?\/]/)){
      return "This password does not have a special character"
    }

    //validated = true
    return ""
  }

  const signUp = async () => {
    try {
      if (!username || !email || !password) {
        Alert.alert("Error", "Please fill in all required fields");
        return;
      }

     

      if (validatePassword(password)!==""){
        
        Alert.alert("Error Poor Password, please try again");
        return;
      }

      setShowTermsPopup(true)
    } catch (error) {
      Alert.alert(`Create account failed: \n${error.message}`);
      console.error("Error signing up:", error.message);
    }
  };

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        email,
        password
      );
      const user = userCredential.user;
      console.log("User signed in:", user.displayName);
      Alert.alert(`Welcome back ${user.displayName}`);
    } catch (error) {
      Alert.alert(`Sign in failed: \n${error.message}`);
      console.error("Error signing in:", error.message);
    }
  };

  const forgotPassword = () => {
    setShowForgotPassword(true);
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "login" ? "signup" : "login"));
  };

  if (showForgotPassword) {
    return <ForgotPasswordScreen goBack={() => setShowForgotPassword(false)} />;
  }

  const TermsAndConditionsPopup = ({ visible, onAgree, onClose }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Terms and Conditions</Text>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.content}>
              Please read these Terms and Conditions carefully before using the Health Buddy application.
            {'\n'} {'\n'}
Your access to and use of Health Buddy is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use Health Buddy.
{'\n'} {'\n'}
By accessing or using Health Buddy, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access Health Buddy.
{'\n'} {'\n'}
1. Accounts
{'\n'} {'\n'}
1.1. When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
{'\n'} {'\n'}
1.2. You are responsible for safeguarding the password that you use to access Health Buddy and for any activities or actions under your password, whether your password is with our Service or a third-party service.
{'\n'} {'\n'}
1.3. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
{'\n'} {'\n'}
2. Use of Health Buddy
{'\n'} {'\n'}
2.1. Health Buddy is intended to track water and calorie intake for fitness and health purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
{'\n'} {'\n'}
2.2. You understand and acknowledge that Health Buddy relies on the information provided by you regarding your water and calorie intake. We do not guarantee the accuracy, completeness, or reliability of such information.
{'\n'} {'\n'}
2.3. You agree to use Health Buddy only for lawful purposes and in a manner consistent with all applicable laws and regulations.
{'\n'} {'\n'}
3. Privacy
{'\n'} {'\n'}
3.1. Your privacy is important to us. Our Privacy Policy governs your use of Health Buddy and outlines our practices concerning the collection, use, and disclosure of your personal information.
{'\n'} {'\n'}
3.2. By using Health Buddy, you consent to the collection and use of your information in accordance with our Privacy Policy.
{'\n'} {'\n'}
4. Intellectual Property
{'\n'} {'\n'}
4.1. Health Buddy and its original content, features, and functionality are and will remain the exclusive property of Health Buddy and its licensors.
{'\n'} {'\n'}
4.2. Health Buddy is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Health Buddy.
{'\n'} {'\n'}
5. Termination
{'\n'} {'\n'}
5.1. We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
{'\n'} {'\n'}
5.2. Upon termination, your right to use Health Buddy will immediately cease. If you wish to terminate your account, you may simply discontinue using Health Buddy.
{'\n'} {'\n'}
6. Limitation of Liability
{'\n'} {'\n'}
6.1. In no event shall Health Buddy, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use Health Buddy; (ii) any conduct or content of any third party on Health Buddy; (iii) any content obtained from Health Buddy; and (iv) unauthorized access, use, or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence), or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
 {'\n'} {'\n'}
7. Governing Law
{'\n'} {'\n'}
7.1. These Terms shall be governed and construed in accordance with the laws of [Your Country], without regard to its conflict of law provisions.
{'\n'} {'\n'}
8. Changes
{'\n'} {'\n'}
8.1. We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
{'\n'} {'\n'}
8.2. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using Health Buddy.
{'\n'} {'\n'}
By using Health Buddy, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </Text>
            </ScrollView>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={onAgree}>
                <Text style={styles.buttonText}>Agree</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Disagree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
    const handleAgree = async () => {
      
      try {
        // Hide the terms and conditions popup
        setShowTermsPopup(false);

        

        //Proceed with sign-up
        
        const userCredential = await createUserWithEmailAndPassword(
          FIREBASE_AUTH,
          email,
          password
        );
        const user = userCredential.user;
  
        await updateProfile(userCredential.user, { displayName: username });
  
        const userDatabaseRef = ref(FIREBASE_DATABASE, "users/" + user.uid);
  
        await set(userDatabaseRef, {
         email: email,
         username: username,
        });  
      } catch (error) {
        Alert.alert(`Create account failed: \n${error.message}`);
        console.error("Error signing up:", error.message);
      }
    };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Gradient */}
      <LinearGradient
        colors={["white", "#e3f7e3", "#54f756"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={{ width: 130, height: 130, marginBottom: 30 }}
        />

        {/* Email textbox */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.textBoxTitle}>Email</Text>
          <TextBox placeHolder="Email" value={email} onChangeText={setEmail} />
        </View>

        {/* Username textbox */}
        {mode === "signup" && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.textBoxTitle}>Username</Text>
            <TextBox
              placeHolder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </View>
        )}

        {/* Password textbox */}
        <View style={{ marginBottom: 10 , width :250 }}>
          <Text style={styles.textBoxTitle}>Password</Text>
          <TextBox
            placeHolder="Password"
            value={password}
            onChangeText={(text)=> {setPassword(text); setPassStrength(validatePassword(text))}}
            secureTextEntry
          />

          {/* Forgot Password */}
          {mode === "login" && (
            <TouchableOpacity
              onPress={forgotPassword}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordButtonText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}
          {mode !== "login" ? (<SignupBubble passStrength={passStrength}/>) : null}
        </View>

        {/* Log In Button */}
        <TouchableOpacity
          onPress={mode === "login" ? signIn : signUp}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {mode === "login" ? "Log in" : "Sign up"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        {/* Create account button */}
        <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {mode === "login" ? "Create Account" : "Log in"}
          </Text>
        </TouchableOpacity>

        {/* Terms and Conditions Popup */}
        <TermsAndConditionsPopup
          visible={showTermsPopup}
          onAgree={handleAgree}
          onClose={() => setShowTermsPopup(false)}
        />

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    fontSize: 26,
    fontWeight: "bold",
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 2,
    borderColor: "black",
    backgroundColor: "green",
  },
  textBoxTitle: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 30,
    paddingRight: 30,
    color: "white",
  },
  orText: {
    fontSize: 16,
    color: "grey",
    marginTop: 10,
  },
  toggleButton: {
    fontSize: 18,
    fontWeight: "bold",
    color: "blue",
    marginTop: 10,
  },
  toggleButtonText: {
    fontSize: 18,
    fontWeight: "500",
    color: "black",
  },
  forgotPasswordButton: {
    fontSize: 15,
    fontWeight: "bold",
  },
  forgotPasswordButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4c4c4c",
    textAlign: "right",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  innerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#008000", 
  },
  scrollView: {
    maxHeight: 500,
    marginBottom: 20,
  },
  content: {
    color: 'black', // Green content text color
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    backgroundColor: "#008000", // Green button background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white", // White button text color
    fontWeight: "bold",
  },
});

export default LoginScreen;
