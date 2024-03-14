import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

const SECTIONS = [
  {
    items: [
        { 
          color: '#fe9400',
          label: 'Change Username',
          type: 'link' 
        },
        {
          label: 'Change Password',
          value: false,
          type: 'link',
        },
        {
          color: '#007afe',
          label: 'Change Email',
          type: 'link',
        },
        { 
          color: '#32c759',
          label: 'Change Target Intakes',
          type: 'link' 
        },
    ]
  },
];

export default function Example() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profile}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.profileAvatarWrapper}>
              <Image
                alt=""
                source={{
                    uri: 'https://as2.ftcdn.net/v2/jpg/00/65/77/27/1000_F_65772719_A1UV5kLi5nCEWI0BNLLiFaBPEkUbv5Fv.jpg',
                  }}
                style={styles.profileAvatar} />

              <TouchableOpacity
                onPress={() => {
                  // handle onPress
                }}>
                <View style={styles.profileAction}>
                <FeatherIcon
                    color="#fff"
                    name="camera"
                    size={15} />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {SECTIONS.map(({ items }) => (
          <View style={styles.section} key={Math.random().toString()}>
            {items.map(({ label, type}) => {
              return (
                <TouchableOpacity
                  key={Math.random().toString()} // Assign a unique key here
                  onPress={() => {
                    // handle onPress
                  }}>
                  <View style={styles.row}>

                    <Text style={styles.rowLabel}>{label}</Text>

                    <View style={styles.rowSpacer} />

                    {type === 'link' && (
                      <FeatherIcon
                        color="#0c0c0c"
                        name="chevron-right"
                        size={22} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 12,
    paddingRight: 12,
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});