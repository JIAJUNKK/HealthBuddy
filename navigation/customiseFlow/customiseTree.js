import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView} from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, onValue, update} from 'firebase/database';

const saveUserPreferences = async (userId, preferences) => {
    try {
        await update(ref(FIREBASE_DATABASE, `userPreference/${userId}`), preferences);
    } catch (error) {
        console.error('Error saving user preferences:', error);
    }
};


export default function CustomizeTree() {
    const [selectedTreeKey, setSelectedTreeKey] = useState(null);
    const [treeImage, setTreeImage] = useState("");
    const allTrees = {
        treeImages: require('../../assets/trees/original/tree-4.png'),
        cactusImages: require('../../assets/trees/cactus/cactus-4.png'),
        cherryBlossomImages: require('../../assets/trees/cherry/cherry-blossom-4.png'),
    }

    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser; 
        if (!user) return; 
        const treeRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/tree"
        );
        const treeListener = onValue(treeRef, (snapshot) => {
            const data = snapshot.val();
            if (data || data === 0) {
              setTreeImage(data); 
            }
        });
        return () => {
            treeListener();
        };
    }, []);

    const handleTreeImageSelect = async (key) => {
        const userId = FIREBASE_AUTH.currentUser.uid;
        saveUserPreferences(userId, { tree: key });
        setSelectedTreeKey(key);
    };
    return (
        <View style={styles.container}>
            <View style={styles.background} />
            <View style={styles.content}>
                <View style={styles.selectedTreeContainer}>
                    <Text style={styles.sectionTitle}>Selected Tree</Text>
                    {treeImage !== null && (
                        <Image source={allTrees[treeImage]} style={styles.selectedTreeImage} />
                    )}
                </View>

                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>Options</Text>

                <ScrollView
                    horizontal={true}
                    contentContainerStyle={styles.optionsContainer}
                >
                    {Object.keys(allTrees).map((key, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleTreeImageSelect(key, index)}
                            style={[styles.optionItem, selectedTreeKey === key && styles.selectedOptionItem]}
                        >
                            <Image source={allTrees[key]} style={styles.optionImage} />
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
    selectedTreeContainer: {
        alignItems: 'center',
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    selectedTreeImage: {
        width: 240,
        height: 310,
        marginBottom: 0,
        resizeMode: 'contain',
    },
    separator: {
        height: 5,
        backgroundColor: 'black',
        marginTop: 0,
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    optionItem: {
        margin: 5,
        borderRadius: 10,
        padding: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    selectedOptionItem: {
        borderColor: 'green',
        borderWidth: 2,
    },
    optionImage: {
        width: 100,
        height: 150,
        resizeMode: 'contain',
    },
});
