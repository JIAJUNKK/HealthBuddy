import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, update, onValue} from 'firebase/database';

const saveUserPreferences = async (userId, preferences) => {
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};

export default function CustomizeAnimal() {
    const [selectedCharacterIndex, setSelectedCharacterIndex] = useState(null);
    const [charceterImage, setCharacterImage] = useState("");

    const allCharacters = {
        koala: require('../../assets/animals/koala/koala-3.png'),
        penguin: require('../../assets/animals/penguin/penguin-3.png'),
        racoon: require('../../assets/animals/racoon/racoon-3.png'),
    }

    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser; 
        if (!user) return; 
        const animalRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/animal"
        );
        const animalListener = onValue(animalRef, (snapshot) => {
            const data = snapshot.val();
            if (data || data === 0) {
              setCharacterImage(data); 
            }
        });
        return () => {
            animalListener();
        };
    }, []);
    

    const handleCharacterImageSelect = async(key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { animal: key });
        setSelectedCharacterIndex(key);
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.background} />
            
            <View style={styles.content}>
                <View style={styles.selectedAnimalContainer}>
                    <Text style={styles.sectionTitle}>Selected Animal</Text>
                    {charceterImage !== null && (
                        <Image source={allCharacters[charceterImage]} style={styles.selectedAnimalImage} />
                    )}
                </View>
                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Options</Text>

                <ScrollView
                    horizontal={true}
                    contentContainerStyle={styles.animalOptionsContainer}
                >
                    {Object.keys(allCharacters).map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleCharacterImageSelect(key, index)}
                            style={[styles.animalOptionItem, selectedCharacterIndex === key && styles.selectedAnimalOptionItem]}
                        >
                            <Image source={allCharacters[key]} style={styles.animalOptionImage} />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#eef7ed', // Change to desired background color
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    selectedAnimalContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    selectedAnimalImage: {
        width: 300,
        height: 300,
        marginBottom: 0,
        resizeMode: 'contain',
    },
    separator: {
        height: 5,
        backgroundColor: 'black',
        marginTop: 0,
    },
    animalOptionsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    animalOptionItem: {
        margin: 5,
        borderRadius: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    selectedAnimalOptionItem: {
        borderColor: 'green',
        borderWidth: 2,
    },
    animalOptionImage: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});
