import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FoodLogScreen = () => {
  const navigation = useNavigation();

  // Function to navigate to FoodScreen when search bar is pressed
  const handleSearchPress = () => {
    navigation.navigate('FoodSearch');
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity onPress={handleSearchPress}>
        <Text>Search for Food</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FoodLogScreen;
