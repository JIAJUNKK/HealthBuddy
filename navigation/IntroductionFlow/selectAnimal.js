import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, update} from 'firebase/database';

const saveUserPreferences = async (userId, preferences) => {
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};

export default function SelectAnimal({setCharacterSelected}) {
    const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(null);
    useEffect(() => {
        setCharacterSelected(selectedCharacterIndex !== null);
      }, [selectedCharacterIndex]);

    const allCharacters = {
        koala: require('../../assets/animals/koala/koala-3.png'),
        penguin: require('../../assets/animals/penguin/penguin-3.png'),
        racoon: require('../../assets/animals/racoon/racoon-3.png'),
    }

    const handleCharacterImageSelect = async (key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { animal: key });
        setSelectedCharacterIndex(key);
        setCharacterSelected(true); 
    };

    return (
    <View style={styles.characterContainer}>
        {Object.keys(allCharacters).map((key, index) => (
            <TouchableOpacity
                key={index}
                onPress={() => handleCharacterImageSelect(key)}
                style={[styles.imageItem, selectedCharacterIndex === key && styles.selectedImageItem]}
            >
                <ImageBackground source={allCharacters[key]} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
        ))}
    </View>
    );
}

const styles = StyleSheet.create({
    characterContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageItem: {
        margin: 5,
        overflow: 'hidden',
    },
    selectedImageItem: {
        borderColor: 'green',
        borderWidth: 5,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});
