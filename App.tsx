import "react-native-gesture-handler";
import React, { useState } from "react";
import { AppRegistry } from "react-native";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, ApolloLink, concat } from "@apollo/client";
import {setContext} from "@apollo/client/link/context";
import FlashCard from "./src/screens/Flashcard";
import ListFlashCards from "./src/screens/ListFlashCards";
import { screenNames } from "./src/utils/screenNames";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { NavigationContainer, ParamListBase } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from "./src/utils/AuthContext";
import { ClassroomContext } from "./src/utils/ClassroomContext";
import * as SecureStore from 'expo-secure-store';
import AuthScreen from "./src/screens/AuthScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator<ParamListBase>();
const Drawer = createDrawerNavigator();

//Apollo instance creatation
//==========================================================
const httpLink = createHttpLink({
  uri : 'http://192.168.1.43:5000/',
})

const authLink = setContext (async(_, { headers }) => {
  const token = await SecureStore.getItemAsync('userToken')
  return {
    headers: {
      ...headers,
      Authorization: token ? `${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions : {
    query : {
      fetchPolicy :"network-only",
      errorPolicy :"all",
    },
    watchQuery : {
      fetchPolicy :"network-only",
      errorPolicy : "all",
    }
  }
});
//==========================================================

const MainStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name={screenNames.listFlashCards.name}
        component={ListFlashCards}
        options={{ title: screenNames.listFlashCards.title }}
      />
      <Stack.Screen
        name={screenNames.flashCard.name}
        component={FlashCard}
        options={{
          title: screenNames.flashCard.title,
          headerStyle: {
            backgroundColor: "#FCC300",
          },
        }}
      />
    </Stack.Navigator>
  );
};

const AppDrawer = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen
        name={"listFlashCardsDrawer"}
        component={MainStackNavigator}
        options={{
          title: screenNames.listFlashCards.title,
        }}
      />
      <Drawer.Screen
        name={"settingsDrawer"}
        component={SettingsScreen}
        options={{
          title: screenNames.settingsScreen.title,
        }}
      />
    </Drawer.Navigator>
  );
};

//=========================================
export default function App() {
  const [classroomId, setClassroomId] = useState<any>("");

  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  const authContext = React.useMemo(
    () => ({
      signIn: async (data: any) => {
        await client.resetStore();
        await SecureStore.setItemAsync("userToken", data.token);
        dispatch({ type: "SIGN_IN", data });
      },
      signOut: async() => {
        await client.resetStore();
        await SecureStore.deleteItemAsync("userToken")
        dispatch({ type: "SIGN_OUT" })
      }
    }),
    []
  );


  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={authContext}>
        <ClassroomContext.Provider value={{classroomId, setClassroomId}}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {state.userToken === null || ""? (
                <Stack.Screen
                  name={screenNames.authScreen.name}
                  component={AuthScreen}
                  options={{ title: screenNames.authScreen.title }}
                />
              ) : (
                <Stack.Screen
                  name={screenNames.root.name}
                  component={AppDrawer}
                  options={{ title: screenNames.root.title }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ClassroomContext.Provider>
      </AuthContext.Provider>
    </ApolloProvider>
  );
}
AppRegistry.registerComponent("MyApplication", () => App);
