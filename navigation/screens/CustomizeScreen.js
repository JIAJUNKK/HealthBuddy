import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Button} from 'react-native';
import { FIREBASE_DATABASE, FIREBASE_AUTH } from '../../FirebaseConfig';
import { ref, onValue} from 'firebase/database';

export default function CustomizeScreen({ navigation }) {
    const [backgroundImage, setBackgroundImage] = useState("");
    const [charceterImage, setCharacterImage] = useState("");
    const [treeImage, setTreeImage] = useState("");

    const mainImages = {
        backgrounds: require('../../assets/bg/allBackgrounds.png'),
        animals: require('../../assets/animals/allAnimals.png'),
        trees: require('../../assets/trees/allTrees.png'),
    }

    const allImages = {
        dessert: require('../../assets/bg/dessert-landscape.png'),
        greenLandscape: require('../../assets/bg/green-landscape.png'),
        iceLandscape:  require('../../assets/bg/ice-landscape.png'),
    }
    const allCharacters = {
        koala: require('../../assets/animals/koala/koala-3.png'),
        penguin: require('../../assets/animals/penguin/penguin-3.png'),
        racoon: require('../../assets/animals/racoon/racoon-3.png'),
    }
    const allTrees = {
        treeImages: require('../../assets/trees/original/tree-4.png'),
        cactusImages: require('../../assets/trees/cactus/cactus-4.png'),
        cherryBlossomImages: require('../../assets/trees/cherry/cherry-blossom-4.png'),
    }

    useEffect(() => {
        const user = FIREBASE_AUTH.currentUser; 
        if (!user) return; 
        const backgroundRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/background"
        );
        const treeRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/tree"
        );
        const animalRef = ref(
            FIREBASE_DATABASE, 
            "userPreference/" + user.uid + "/animal"
        );

        const backgroundListener = onValue(backgroundRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (data || data === 0) {
                setBackgroundImage(data); 
            }
        });
        const treeListener = onValue(treeRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (data || data === 0) {
                setTreeImage(data); 
            }
        });
        const animalListener = onValue(animalRef, (snapshot) => {
            const data = snapshot.val();
            console.log(data);
            if (data || data === 0) {
                setCharacterImage(data); 
            }
        });
        return () => {
            backgroundListener();
            animalListener();
            treeListener();
          };
    }, []); 

    return (
        <View style={styles.container}>
            <View style={styles.background} />

            <View stlye={styles.content}>
                <View style={styles.containerRow}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Choose Your Background')}>
                            <Image source={allImages[backgroundImage]} style={styles.selectedImage} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <Image source={mainImages['backgrounds']} style={styles.selectedImage} />
                        <Button
                        title="Customize"
                        onPress={() => navigation.navigate('Choose Your Background')}
                        color="#008000" 
                        style={styles.buttonStyle} 
                        />
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.containerRow}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Choose Your Animal')}>
                            <Image source={allCharacters[charceterImage]} style={styles.selectedImage} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Image source={mainImages['animals']} style={styles.selectedImage} />
                        <Button
                            title="Customize"
                            onPress={() => navigation.navigate('Choose Your Animal')}
                            color="#008000" 
                            style={styles.buttonStyle} 
                        />                    
                    </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.containerRow}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Choose Your Tree')}>
                            <Image source={allTrees[treeImage]} style={styles.selectedImage} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.buttonContainer}>
                        <Image source={mainImages['trees']} style={styles.selectedImage} />
                        <Button
                            title="Customize"
                            onPress={() => navigation.navigate('Choose Your Tree')}
                            color="#008000" 
                            style={styles.buttonStyle} 
                            />                    
                    </View>
                </View>
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

    content:{
        display: 'flex', 
        flexDirection: 'column',

        justifyContent: 'space-between',
        alignItems: 'center'
    },

    containerRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        // paddingHorizontal: 20,
        marginVertical: 10,
        gap: 10,
    },
    itemContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    selectedImage: {
        width: 200,
        height: 150,
        // marginBottom: 0,
        resizeMode: 'contain'
    },
    buttonContainer: {
        // width: '30%',
        // marginLeft: 20,
    },
    separator: {
        height: 5,
        backgroundColor: '#008000',
        marginTop: 0,
        paddingHorizontal: 20,
    },
    buttonStyle: {
        backgroundColor: '#008000', 
        borderColor: '#008000', 
        borderRadius: 10, 
        paddingHorizontal: 10, 
        paddingVertical: 5, 
        elevation: 0,
    },
});
