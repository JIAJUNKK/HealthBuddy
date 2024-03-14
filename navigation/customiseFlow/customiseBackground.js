import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, onValue,update} from 'firebase/database';

const saveUserPreferences = async (userId, preferences) => {
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};

export default function Customizebackground() {
    const [selectedImageKey, setSelectedImageKey] = useState(null);
    const [backgroundImage, setBackgroundImage] = useState("");

    const allImages = {
        dessert: require('../../assets/bg/dessert-landscape.png'),
        greenLandscape: require('../../assets/bg/green-landscape.png'),
        iceLandscape:  require('../../assets/bg/ice-landscape.png'),
    }

    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser; 
        if (!user) return; 
        const animalRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/background"
        );
        const backgroundListener = onValue(animalRef, (snapshot) => {
            const data = snapshot.val();
            if (data || data === 0) {
              setBackgroundImage(data); 
            }
        });
        return () => {
            backgroundListener();
        };
    }, []);


    const handleBackgroundImageSelect = async (key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { background: key });
        setSelectedImageKey(key);
    };    

    return (
        <View style={styles.container}>
            <ImageBackground source={allImages[backgroundImage]} style={styles.backgroundImage}>
                <View style={styles.imageContainer}>
                    {Object.keys(allImages).map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleBackgroundImageSelect(key)}
                            style={[styles.imageItem, selectedImageKey === key && styles.selectedImageItem]}
                        >
                            <ImageBackground source={allImages[key]} style={styles.image} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        display: 'flex',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'contain',
        justifyContent: 'start',
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 500, 
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'white',
        borderRadius: 15,
        alignSelf: 'center',

    },
    characterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 45, // Adjust as needed

    },
    treeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 45, // Adjust as needed


        
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
