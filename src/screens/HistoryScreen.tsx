
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

const HistoryScreen = (props: any) => {
  const { completedTimers } = props.route.params; 

  console.log(completedTimers)

  const renderHistoryItem = ({ item }: { item: { name: string, completionTime: string } }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyText}>Timer: {item.name}</Text>
      <Text style={styles.historyText}>Completed At: {item.completionTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Completed Timers History</Text>
      <FlatList
        data={completedTimers}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  historyItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default HistoryScreen;