import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, }} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{
        headerShown: true, headerTitle: "History Screen", headerStyle: {
        }, headerTitleStyle: { fontSize: 18 }
      }} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
