import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert, Modal, Animated } from "react-native";
import SelectAnimal from "../IntroductionFlow/selectAnimal";
import SelectTree from "../IntroductionFlow/selectTree";
import SelectBackground from "../IntroductionFlow/selectBackground";
import SetDetails from "../IntroductionFlow/setDetails";
import { FIREBASE_AUTH, FIREBASE_DATABASE } from '../../FirebaseConfig';
import { ref, update } from "firebase/database";

const IntroductionFlow = ({ onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showFinishButton, setShowFinishButton] = useState(false); // State to manage showing the Finish button

  const [backgroundSelected, setBackgroundSelected] = useState(false); 
  const [characterSelected, setCharacterSelected] = useState(false); 
  const [treeSelected, setTreeSelected] = useState(false); 

  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState(null);
  const [slideAnimation] = useState(new Animated.Value(0));

  const steps = [
    {
      title: "Select Background",
      component: <SelectBackground type="background" setBackgroundSelected={setBackgroundSelected} />, 
    },
    { 
      title: "Select Character", 
      component: <SelectAnimal type="character" setCharacterSelected={setCharacterSelected}/> 
    },
    { 
      title: "Select Tree", 
      component: <SelectTree type="tree" setTreeSelected={setTreeSelected}/> 
    },
    { title: " ", component: <SetDetails isVisible={(success) => setShowFinishButton(success)} />},
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      if (
        (currentStep === 0 && backgroundSelected) ||
        (currentStep === 1 && characterSelected) ||
        (currentStep === 2 && treeSelected)
      ) {
        setCurrentStep((prevCurrentStep) => prevCurrentStep + 1);
      } else {
        Alert.alert("Please select an option first!")
      }
    } else {
      handleComplete();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prevCurrentStep) => prevCurrentStep - 1);
    } else {
      return;
    }
  };

  const handleComplete = () => {
    setShowNotificationModal(true);
    if (notificationPreference !== null) {
      setCompleted(true);
      onComplete(true);
    }
  };

  const hideNotificationModal = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowNotificationModal(false);
    });
  };

  const handleNotificationPreference = (status) => {
    setNotificationPreference(status);    
    hideNotificationModal();
    if (status) {
      // If notification preference is true, update the database
      const currentUserUid = FIREBASE_AUTH.currentUser.uid;
      const userRef = ref(FIREBASE_DATABASE, `users/${currentUserUid}`);
      update(userRef, { notificationPreference: status });
    }
  };

  if (!isVisible || completed) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Main content */}
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
        {steps[currentStep].component}
        {/* Buttons container */}
        <View style={styles.buttonsContainer}>
          {/* Button for previous step */}
          <TouchableOpacity
            style={[styles.nextButton, currentStep === 0 && { opacity: 0 }]}
            onPress={currentStep > 0 ? handlePreviousStep : undefined}
            disabled={currentStep === 0}
          >
            <Text style={styles.nextButtonText}>←</Text>
          </TouchableOpacity>
          {/* Button for next step */}
          {(currentStep < steps.length - 1 || showFinishButton) && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === (steps.length - 1 && showFinishButton)
                  ? "Finish"
                  : "→"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.space}>‎</Text>

      </View>
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotificationModal}
        onRequestClose={() => {
          hideNotificationModal();
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}></View>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Would you like to receive notifications and updates from the Health Buddy?
            </Text>
            <View style={styles.notificationButtons}>
              <TouchableOpacity
                style={[styles.notificationButton, styles.yesButton]}
                onPress={() => handleNotificationPreference(true)}
              >
                <Text style={styles.notificationButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notificationButton, styles.noButton]}
                onPress={() => handleNotificationPreference(false)}
              >
                <Text style={styles.notificationButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    backgroundColor: "white", // Light green background color
  },
  stepContainer: {
    width: "90%",
    backgroundColor: "#F0FFF0",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#008000", // Green step title color
  },
  nextButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#008000", // Green button background color
    borderRadius: 5,
    marginTop: 10,
  },
  nextButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black color
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    padding: 35,
    alignItems: "center",
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    color: "#008000", // Green text color
    fontWeight: "bold",
    fontSize: 18
  },
  notificationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%"
  },
  notificationButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: "45%"
  },
  yesButton: {
    backgroundColor: "#008000",
  },
  noButton: {
    backgroundColor: "#FF0000",
  },
  notificationButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  space:{
    paddingBottom: 20
  }
});

export default IntroductionFlow;
