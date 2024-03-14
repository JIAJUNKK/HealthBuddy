import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Button } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { FIREBASE_AUTH, FIREBASE_DATABASE } from "../../FirebaseConfig";
import { ref, get, set } from "firebase/database";

const HistoryScreen = () => {
    const [userId, setUserId] = useState('');
    const [date, setDate] = useState('');
    const [calories, setCalories] = useState('');
    const [selectedTimeRange, setSelectedTimeRange] = useState('week');

    const [caloriesData, setCaloriesData] = useState({
        labels: ["mon",],
        datasets: [
            {
                data: [0,],
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    });
    const [waterData, setWaterData] = useState({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                data: [4, 5, 6, 5.5, 6.5, 7],
                color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    });



    useEffect(() => {
        getCurrentDate();
        setUserId(FIREBASE_AUTH.currentUser.uid);
        fetchDataForTimeRange(selectedTimeRange)
    },[]); // Empty dependency array to ensure this effect runs only once
    const [count, setCount] = useState(0);
      
    useEffect(() => {
        const intervalId = setInterval(() => {
            getCurrentDate();
            setUserId(FIREBASE_AUTH.currentUser.uid);
            fetchDataForTimeRange(selectedTimeRange)
            setCount(prevCount => prevCount + 1);
        }, 10000);
    
        return () => clearInterval(intervalId);
    }, [selectedTimeRange]);
    

    const getCurrentDate = () => {
        const dateObj = new Date();
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}`;
        setDate(formattedDate);
    };

    const db = FIREBASE_DATABASE;




    const fetchCaloriesDataForLast7Days = () => {
        const currentDate = new Date();
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - i);
            last7Days.push(formatDate(date));
        }
        const promises = last7Days.map(date => {
            const userCaloriesRef = ref(db, `users/${FIREBASE_AUTH.currentUser.uid}/calories/${date}`);
            return get(userCaloriesRef).then(snapshot => ({
                date,
                calories: snapshot.val() ||0
            
            }));
        });
        Promise.all(promises)
            .then(results => {
                setCaloriesData({
                    
                    labels:[getThreeLetterDay(results[6].date),getThreeLetterDay(results[5].date),getThreeLetterDay(results[4].date),getThreeLetterDay(results[3].date),getThreeLetterDay(results[2].date),getThreeLetterDay(results[1].date),getThreeLetterDay(results[0].date)],
                    datasets: [
                        {
                            data: [results[6].calories,results[5].calories,results[4].calories,results[3].calories,results[2].calories,results[1].calories,results[0].calories],
                            color: (opacity = 1) => `rgba(38, 153, 75, ${opacity})`,
                            strokeWidth: 2,
                        },
                    ],
                
                })
            })
            .catch(error => {
                console.error("Error fetching calorie data for last 7 days:", error);
            });
    };

    const fetchWaterDataForLast7Days = () => {
        const currentDate = new Date();
        const last7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - i);
            last7Days.push(formatDate(date));
        }
        const promises = last7Days.map(date => {
            const userWaterRef = ref(db, `users/${FIREBASE_AUTH.currentUser.uid}/water/${date}`); // Adjust reference path
            return get(userWaterRef).then(snapshot => ({
                date,
                water: snapshot.val() || 0 // Update property name to 'water'
            }));
        });
        Promise.all(promises)
            .then(results => {
                setWaterData({
                    
                    labels:[getThreeLetterDay(results[6].date),getThreeLetterDay(results[5].date),getThreeLetterDay(results[4].date),getThreeLetterDay(results[3].date),getThreeLetterDay(results[2].date),getThreeLetterDay(results[1].date),getThreeLetterDay(results[0].date)],
                    datasets: [
                        {
                            data: [results[6].water,results[5].water,results[4].water,results[3].water,results[2].water,results[1].water,results[0].water],
                            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                            strokeWidth: 2,
                        },
                    ],
                
                })
            })
            .catch(error => {
                console.error("Error fetching water data for last 7 days:", error);
            });
    };
    

    const fetchCaloriesDataForLast30Days = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
    
        const promises = [];
        const totalCaloriesByMonth = Array(12).fill(0); // Initialize array to store total calories for each month    
        const userCaloriesRef = ref(db, `users/${FIREBASE_AUTH.currentUser.uid}/calories`);
        promises.push(get(userCaloriesRef).then(snapshot => {
            snapshot.forEach(childSnapshot => {
                const date = new Date(childSnapshot.key);
                const month = date.getMonth();
                const calories = childSnapshot.val() || 0;
                totalCaloriesByMonth[month] += calories;
            });
        }));
    
        Promise.all(promises)
            .then(() => {
                const formattedData = {
                    labels: [],
                    datasets: [{ data: [], color: (opacity = 1) => `rgba(38, 153, 75, ${opacity})`, strokeWidth: 2 }]
                };    
                for (let i = 0; i < 12; i++) {
                    const monthLabel = getThreeLetterMonth(new Date(currentYear, i, 1));
                    formattedData.labels.push(monthLabel);
                    formattedData.datasets[0].data.push(totalCaloriesByMonth[i]);
                }
    
                setCaloriesData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching calorie data for last 30 days:", error);
        });
    };
    
    
    const fetchWaterDataForLast30Days = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
    
        const promises = [];
        const totalWaterByMonth = Array(12).fill(0); // Initialize array to store total water consumption for each month
    
        // Query the database for water data within the current month
        const userWaterRef = ref(db, `users/${FIREBASE_AUTH.currentUser.uid}/water`);
        promises.push(get(userWaterRef).then(snapshot => {
            snapshot.forEach(childSnapshot => {
                const date = new Date(childSnapshot.key);
                const month = date.getMonth();
                const water = childSnapshot.val() || 0;
                totalWaterByMonth[month] += water;
            });
        }));
    
        Promise.all(promises)
            .then(() => {
                const formattedData = {
                    labels: [],
                    datasets: [{ data: [], color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 }]
                };
    
                // Populate labels and data array with total water consumption for each month
                for (let i = 0; i < 12; i++) {
                    const monthLabel = getThreeLetterMonth(new Date(currentYear, i, 1));
                    formattedData.labels.push(monthLabel);
                    formattedData.datasets[0].data.push(totalWaterByMonth[i]);
                }
    
                setWaterData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching water data for last 30 days:", error);
            });
    };
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const getThreeLetterDay = (dateString) => {
        const date = new Date(dateString);
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const dayIndex = date.getDay();
        return daysOfWeek[dayIndex];
    };

    const getThreeLetterMonth = (dateString) => {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = date.getMonth();
        return months[monthIndex];
    };
    
    const fetchDataForTimeRange = (timeRange) => {
        if (timeRange === 'week') {
            fetchCaloriesDataForLast7Days();
            fetchWaterDataForLast7Days();
        } else if (timeRange === 'month') {
            fetchCaloriesDataForLast30Days();
            fetchWaterDataForLast30Days();
        }
    };

    const switchTimeRange = (timeRange) => {
        console.log("switched to : ", timeRange)
        setSelectedTimeRange(timeRange);
        fetchDataForTimeRange(timeRange);
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.graphTitle}>Food Consumption</Text>
                <LineChart
                    data={caloriesData}
                    width={350}
                    height={200}
                    chartConfig={{
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        color: (opacity = 1) => `rgba(38, 153, 75, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(38, 153, 75, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: '#26994b',
                        },
                        verticalLabelRotation: 90, // Rotate labels vertically

                    }}
                />
            </View>

            <View>
                <Text style={styles.graphTitle}>Water Consumption</Text>
                <LineChart
                    data={waterData}
                    width={350}
                    height={200}
                    chartConfig={{
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        color: (opacity = 1) => `rgba(83, 208, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(38, 128, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '4',
                            strokeWidth: '2',
                            stroke: '#011f4b',
                        },
                    }}
                />
            </View>

            <View style={styles.timeRangeButtons}>
                <TouchableOpacity
                    style={[styles.timeRangeButton, selectedTimeRange === 'week' && styles.selectedTimeRange]}
                    onPress={() => switchTimeRange('week')}>
                    <Text style={{ color: selectedTimeRange === 'week' ? '#fff' : '#000' }}>View Week</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.timeRangeButton, selectedTimeRange === 'month' && styles.selectedTimeRange]}
                    onPress={() => switchTimeRange('month')}>
                    <Text style={{ color: selectedTimeRange === 'month' ? '#fff' : '#000' }}>View Month</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    graphTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    timeRangeButtons: {
        flexDirection: 'row',
        marginTop: 20,
    },
    timeRangeButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: '#eee',
        borderRadius: 10,
    },
    selectedTimeRange: {
        backgroundColor: '#26994b',
        color: '#fff',
    },
});

export default HistoryScreen;
