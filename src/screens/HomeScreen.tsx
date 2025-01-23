import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    Alert,
    TouchableOpacity,
    StyleSheet,
    Switch,
    SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CompletionModal from "../Component/CompletionModal";
import FlashMessage, { showMessage } from "react-native-flash-message"

type Timer = {
    id: string;
    name: string;
    duration: number;
    remainingTime: number;
    status: "Paused" | "Running" | "Completed";
    category: string;
    halfwayAlert: boolean;
};

const HomeScreen = ({ navigation }: any) => {
    const [timers, setTimers] = useState<Timer[]>([]);
    const [name, setName] = useState("");
    const [duration, setDuration] = useState("");
    const [category, setCategory] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [completedTimers, setCompletedTimers] = useState<{ name: string; completionTime: string }[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [completedTimerDetails, setCompletedTimerDetails] = useState<{ name: string } | null>(null);
    const [halfwayAlert, setHalfwayAlert] = useState(false);


    const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({});

    useEffect(() => {
        const loadTimers = async () => {
            try {
                const storedTimers = await AsyncStorage.getItem("@timers");
                const storedCompletedTimers = await AsyncStorage.getItem("@completedTimers");

                if (storedTimers) {
                    setTimers(JSON.parse(storedTimers));
                }
                if (storedCompletedTimers) {
                    setCompletedTimers(JSON.parse(storedCompletedTimers));
                }
            } catch (error) {
                console.error("Failed to load timers or history:", error);
            }
        };
        loadTimers();
    }, []);

    const saveCompletedTimers = async (completedTimers: { name: string; completionTime: string }[]) => {
        try {
            await AsyncStorage.setItem("@completedTimers", JSON.stringify(completedTimers));
        } catch (error) {
            console.error("Failed to save completed timers:", error);
        }
    };

    const handleTimerCompletion = (timer: Timer) => {
        const completionTime = new Date().toLocaleString();
        const newCompletedTimer = { name: timer.name, completionTime };

        setCompletedTimers((prevHistory) => {
            const updatedHistory = [...prevHistory, newCompletedTimer];
            saveCompletedTimers(updatedHistory);
            return updatedHistory;
        });

        setCompletedTimerDetails({ name: timer.name });
        setModalVisible(true);
    };

    // Save timers to AsyncStorage
    const saveTimers = async (timers: Timer[]) => {
        try {
            await AsyncStorage.setItem("@timers", JSON.stringify(timers));
        } catch (error) {
            console.error("Failed to save timers:", error);
        }
    };

    // Add a new timer
    const handleAddTimer = () => {
        if (!name || !duration || !category) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        const newTimer: Timer = {
            id: Date.now().toString(),
            name,
            duration: parseInt(duration),
            remainingTime: parseInt(duration),
            status: "Paused",
            category,
            halfwayAlert,
        };
        const updatedTimers = [...timers, newTimer];
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
        setName("");
        setDuration("");
        setCategory("");
    };

    const startTimer = (id: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.id === id && timer.status === "Paused") {
                return { ...timer, status: "Running" };
            }
            return timer;
        });

        setTimers(updatedTimers);
        saveTimers(updatedTimers);

        if (!intervalRefs.current[id]) {
            intervalRefs.current[id] = setInterval(() => {
                setTimers((prevTimers) =>
                    prevTimers.map((timer) => {
                        if (timer.id === id && timer.status === "Running") {
                            if (timer.remainingTime > 0) {
                                const halfwayPoint = Math.floor(timer.duration / 2);
                                if (timer.remainingTime === halfwayPoint && timer.halfwayAlert) {
                                    showMessage({
                                        message: "Halfway Alert",
                                        description: `Timer "${timer.name}" is halfway done!`,
                                        type: "info",
                                        duration: 3000,
                                    });
                                }
                                return { ...timer, remainingTime: timer.remainingTime - 1 };
                            } else {
                                clearInterval(intervalRefs.current[id]!);
                                intervalRefs.current[id] = null;
                                handleTimerCompletion(timer);
                                return { ...timer, status: "Completed" };
                            }
                        }
                        return timer;
                    })
                );
            }, 1000);
        }
    };

    // Pause a single timer
    const pauseTimer = (id: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.id === id && timer.status === "Running") {
                return { ...timer, status: "Paused" };
            }
            return timer;
        });

        setTimers(updatedTimers);
        saveTimers(updatedTimers);

        if (intervalRefs.current[id]) {
            clearInterval(intervalRefs.current[id]!);
            intervalRefs.current[id] = null;
        }
    };

    // Reset a single timer
    const resetTimer = (id: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.id === id) {
                return { ...timer, remainingTime: timer.duration, status: "Paused" };
            }
            return timer;
        });

        setTimers(updatedTimers);
        saveTimers(updatedTimers);
    };

    // Delete timer
    const deleteTimer = (id: string) => {
        const updatedTimers = timers.filter((timer) => timer.id !== id);
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
    };

    // Toggle category expansion
    const toggleCategory = (category: string) => {
        if (expandedCategories.includes(category)) {
            setExpandedCategories(expandedCategories.filter((cat) => cat !== category));
        } else {
            setExpandedCategories([...expandedCategories, category]);
        }
    };

    // Render timer item
    const renderTimerItem = (timer: Timer) => {
        const progress = (timer.remainingTime / timer.duration) * 100;
        const displayTime =
            Math.floor(timer.remainingTime / 60)
                .toString()
                .padStart(2, "0") +
            ":" +
            (timer.remainingTime % 60).toString().padStart(2, "0");

        return (
            <View style={styles.timerItem}>
                <Text style={styles.timerName}>{timer.name}</Text>
                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${progress}%`, backgroundColor: progress > 20 ? "#4caf50" : "#f44336" },
                        ]}
                    />
                </View>
                <Text style={styles.timerInfo}>
                    Time Left: {displayTime} | {progress.toFixed(0)}% | Status: {timer.status}
                </Text>
                <View style={styles.timerControls}>
                    <Button title="Start" onPress={() => startTimer(timer.id)} disabled={timer.status === "Running" || timer.status === "Completed"} />
                    <Button title="Pause" onPress={() => pauseTimer(timer.id)} disabled={timer.status !== "Running"} />
                    <Button title="Reset" onPress={() => resetTimer(timer.id)} />
                    <Button title="Delete" onPress={() => deleteTimer(timer.id)} color="#f44336" />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                    <Text style={{ marginRight: 10 }}>Halfway Alert</Text>
                    <Switch
                        value={timer.halfwayAlert}
                        onValueChange={(value) => {
                            const updatedTimers = timers.map((t) =>
                                t.id === timer.id ? { ...t, halfwayAlert: value } : t
                            );
                            setTimers(updatedTimers);
                            saveTimers(updatedTimers);
                        }}
                    />
                </View>
            </View>
        );
    };

    const startAllTimersInCategory = (category: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.category === category && timer.status === "Paused") {
                return { ...timer, status: "Running" };
            }
            return timer;
        });
        setTimers(updatedTimers);
        saveTimers(updatedTimers);

        setHalfwayAlert(false)

        updatedTimers.forEach((timer: any) => {
            if (timer.status === "Running" && !intervalRefs.current[timer.id]) {
                intervalRefs.current[timer.id] = setInterval(() => {
                    setTimers((prevTimers) =>
                        prevTimers.map((prevTimer) => {
                            if (prevTimer.id === timer.id && prevTimer.status === "Running") {
                                if (prevTimer.remainingTime > 0) {
                                    const halfwayPoint = Math.floor(timer.duration / 2);
                                    if (prevTimer.remainingTime === halfwayPoint && timer.halfwayAlert) {
                                        showMessage({
                                            message: "Halfway Alert",
                                            description: `Timer "${prevTimer.name}" is halfway done!`,
                                            type: "info",
                                            duration: 3000,
                                        });
                                    }
                                    return { ...prevTimer, remainingTime: prevTimer.remainingTime - 1 };
                                } else {
                                    clearInterval(intervalRefs.current[prevTimer.id]!);
                                    intervalRefs.current[prevTimer.id] = null;
                                    return { ...prevTimer, status: "Completed" };
                                }
                            }
                            return prevTimer;
                        })
                    );
                }, 1000);
            }
        });
    };

    const pauseAllTimersInCategory = (category: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.category === category && timer.status === "Running") {
                clearInterval(intervalRefs.current[timer.id]!);
                intervalRefs.current[timer.id] = null;
                return { ...timer, status: "Paused" };
            }
            return timer;
        });
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
    };

    const resetAllTimersInCategory = (category: string) => {
        const updatedTimers: any = timers.map((timer) => {
            if (timer.category === category) {
                clearInterval(intervalRefs.current[timer.id]!);
                intervalRefs.current[timer.id] = null;
                return { ...timer, remainingTime: timer.duration, status: "Paused" };
            }
            return timer;
        });
        setTimers(updatedTimers);
        saveTimers(updatedTimers);
    };

    // Render category section
    const renderCategorySection = ({ item: category }: { item: string }) => {
        const categoryTimers = timers.filter((timer) => timer.category === category);

        return (
            <View>
                <TouchableOpacity onPress={() => toggleCategory(category)} style={styles.categoryHeader}>
                    <Text style={styles.categoryText}>{category}</Text>
                    <Text style={styles.toggleIcon}>
                        {expandedCategories.includes(category) ? "-" : "+"}
                    </Text>
                </TouchableOpacity>

                {expandedCategories.includes(category) && (
                    <View>
                        <View style={styles.categoryControls}>
                            <Button title="Start All" onPress={() => startAllTimersInCategory(category)} />
                            <Button title="Pause All" onPress={() => pauseAllTimersInCategory(category)} />
                            <Button title="Reset All" onPress={() => resetAllTimersInCategory(category)} />
                        </View>
                        <FlatList
                            data={categoryTimers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => renderTimerItem(item)}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                )}
            </View>
        );
    };

    // Get unique categories
    const categories = [...new Set(timers.map((timer) => timer.category))];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <View style={styles.headerView}>
                    <Text style={styles.heading}>Create New Timer</Text>
                    <Button title="Go to History" onPress={() => navigation.navigate("HistoryScreen", { completedTimers: completedTimers, })} />
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Duration (in seconds)"
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                />
                <Button title="Add Timer" onPress={handleAddTimer} />

                <Text style={styles.subHeading}>Timers List</Text>
                {categories.length > 0 ? (
                    <FlatList
                        data={categories}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                        keyExtractor={(item) => item}
                        renderItem={renderCategorySection}
                    />
                ) : (
                    <Text>No timers found.</Text>
                )}

                <CompletionModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    timerDetails={completedTimerDetails?.name}
                />
                <FlashMessage position="top" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f4f4f4",
    },
    headerView: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginVertical: 20,
    },
    subHeading: {
        fontSize: 20,
        marginVertical: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    timerItem: {
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    timerName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    progressBarContainer: {
        height: 10,
        width: "100%",
        backgroundColor: "#e0e0e0",
        marginVertical: 5,
    },
    progressBar: {
        height: "100%",
        borderRadius: 5,
    },
    timerInfo: {
        fontSize: 14,
        marginVertical: 5,
    },
    timerControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        backgroundColor: "#ddd",
        borderRadius: 5,
        marginBottom: 5,
    },
    categoryText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    toggleIcon: {
        fontSize: 18,
    },
    categoryControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
});


export default HomeScreen;
