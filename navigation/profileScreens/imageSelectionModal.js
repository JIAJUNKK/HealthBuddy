import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ImageSelectionModal = ({ visible, onSelectPhoto, onClose, onRemovePhoto, hasProfilePicture}) => {
    const handleSelectFromLibrary = async () => {
        onClose();
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          onSelectPhoto(result.assets[0].uri); // Access selected asset from the assets array
        }
      };
      
      const handleTakePhoto = async () => {
        onClose();
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
        if (!result.canceled) {
          onSelectPhoto(result.assets[0].uri); 
        }
      };

      const handleRemovePhoto = () => {
        onClose();
        onRemovePhoto(); 
      };
      
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.option} onPress={handleSelectFromLibrary}>
            <Text>Select from Library</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={handleTakePhoto}>
            <Text>Take Photo</Text>
          </TouchableOpacity>

          {hasProfilePicture &&(
            <TouchableOpacity style={styles.option} onPress={handleRemovePhoto}>
            <Text>Remove Profile Picture</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelButtonText: {
    color: 'red',
  },
});

export default ImageSelectionModal;
