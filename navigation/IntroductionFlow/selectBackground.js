import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, update } from 'firebase/database';


const saveUserPreferences = async (userId, preferences) => {
    console.log(userId);
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};
export default function SelectBackground({setBackgroundSelected}) {
    const [selectedBackgroundIndex, setselectedBackgroundIndex] = useState(null);
    useEffect(() => {
        setBackgroundSelected(selectedBackgroundIndex !== null);
      }, [selectedBackgroundIndex]);

    const allBackground = {
        dessert: require('../../assets/bg/dessert-landscape.png'),
        greenLandscape: require('../../assets/bg/green-landscape.png'),
        iceLandscape:  require('../../assets/bg/ice-landscape.png'),
    }

    const handleBackgroundImageSelect = async (key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { background: key });
        setselectedBackgroundIndex(key);
        setBackgroundSelected(true); 
    };

    return (
        <View style={styles.imageContainer}>
            {Object.keys(allBackground).map((key, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => handleBackgroundImageSelect(key)}
                    style={[styles.imageItem, selectedBackgroundIndex === key && styles.selectedImageItem]}
                >
                    <ImageBackground source={allBackground[key]} style={styles.image} />
                </TouchableOpacity>
            ))}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageItem: {
        margin: 5,
        borderRadius: 10,
        overflow: 'hidden',
    },
    selectedImageItem: {
        borderColor: 'green',
        borderWidth: 5,
    },
    image: {
        width: 100,
        height: 100,
    },
});
