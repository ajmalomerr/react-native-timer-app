import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import HistoryScreen from './screens/HistoryScreen';
import Test from './screens/Test';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, }} />
      <Stack.Screen name="HistoryScreen" component={HistoryScreen} options={{
        headerShown: true, headerTitle: "History Screen", headerStyle: {
        }, headerTitleStyle: { fontSize: 18 }
      }} />
      <Stack.Screen name="test" component={Test} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
