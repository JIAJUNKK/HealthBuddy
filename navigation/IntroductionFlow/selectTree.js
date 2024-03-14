import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, update} from 'firebase/database';


const saveUserPreferences = async (userId, preferences) => {
    console.log(userId);
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};

export default function SelectTree({ setTreeSelected }) {
    const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

    useEffect(() => {
        setTreeSelected(selectedTreeIndex !== null);
      }, [selectedTreeIndex]);
    

    const allTrees = {
        treeImages: require('../../assets/trees/original/tree-4.png'),
        cactusImages: require('../../assets/trees/cactus/cactus-4.png'),
        cherryBlossomImages: require('../../assets/trees/cherry/cherry-blossom-4.png'),
    }
    const treeImages = [
        require('../../assets/trees/original/tree-4.png'),
        require('../../assets/trees/cactus/cactus-4.png'),
        require('../../assets/trees/cherry/cherry-blossom-4.png'),
    ];

    const handleTreeImageSelect = async (key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { tree: key });
        setSelectedTreeIndex(key);
        setTreeSelected(true);
        // Handle any other logic related to tree image selection if needed
    };
    return (
        <View style={styles.treeContainer}>
            {Object.keys(allTrees).map((key, index) => (
                <TouchableOpacity
                    key={index}
                    onPress={() => handleTreeImageSelect(key)}
                    style={[styles.imageItem, selectedTreeIndex === key && styles.selectedImageItem]}
                >
                    <ImageBackground source={allTrees[key]} style={styles.image} resizeMode="contain" />
                </TouchableOpacity>
            ))}
        </View>
        
    );
}

const styles = StyleSheet.create({
    treeContainer: {
        flexDirection: 'column',
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
        width: 150,
        height: 150,
    },

});
