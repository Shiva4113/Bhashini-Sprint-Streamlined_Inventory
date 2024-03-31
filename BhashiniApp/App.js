import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import SignUpPage from "./screens/signup";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Settings from "./screens/settings";
import ChangePassword from "./screens/changepassword";
import YourProfile from "./screens/YourProfile";
import NotificationsPage from "./screens/notification";
import Inventory from "./screens/Inventory";
import AddItem from "./screens/AddInventory";
import EditItem from "./screens/EditItem";

// import PlayAudioFile from "./screens/reading_audiofile";
import LanguageSelectionScreen from "./screens/LanguageSelection";
const Stack = createNativeStackNavigator();


const App = () => {
  const [hideSplashScreen, setHideSplashScreen] = React.useState(true);

  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <NavigationContainer>
      {hideSplashScreen ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="signup"
            component={SignUpPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerShown: true }}
          />
          
          <Stack.Screen
            name="Changepassword"
            component={ChangePassword}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="YourProfile"
            component={YourProfile}
            options={{ headerShown: true }}
          /> 
          <Stack.Screen
            name="NotificationsPage"
            component={NotificationsPage}
            options={{ headerShown: true }}
          /> 
          <Stack.Screen
            name="Inventory"
            component={Inventory}
            options={{ headerShown: true }}
          /> 
          <Stack.Screen
            name="AddItem"
            component={AddItem}
            options={{ headerShown: true }}
          /> 
          <Stack.Screen
            name="LanguageSelection"
            component={LanguageSelectionScreen}
            options={{ headerShown: true }}
          /> 
          <Stack.Screen
            name="EditItem"
            component={EditItem}
            options={{ headerShown: true }}
          /> 

        </Stack.Navigator>
      ) : null}
    </NavigationContainer>
  );
};

export default App;
