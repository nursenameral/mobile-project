import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, StyleSheet, View} from 'react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import GraphScreen from '../screens/GraphScreen';
import InvoiceScreen from '../screens/InvoiceScreen';
import CameraScreen from '../screens/CameraScreen';
import ReceiptsScreen from '../screens/ReceiptsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: undefined;
};

export type MainTabParamList = {
  Graph: undefined;
  Invoice: undefined;
  Camera: undefined;
  Receipts: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#9DB4C0',
          height: 90,
          paddingBottom: 25,
          paddingTop: 15,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#5C6B73',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: -5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}>
      <Tab.Screen
        name="Graph"
        component={GraphScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabIcon]}>
              <Image
                source={require('../pics/graph.png')}
                style={[
                  styles.tabIcon,
                  {tintColor: '#FFFFFF'},
                ]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Invoice"
        component={InvoiceScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabIcon]}>
              <Image
                source={require('../pics/invoice.png')}
                style={[
                  styles.tabIcon,
                  {tintColor: '#FFFFFF'},
                ]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={styles.centerTabIcon}>
              <Image
                source={require('../pics/Camera.png')}
                style={[
                  styles.centerIcon,
                  {tintColor: '#FFFFFF'},
                ]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Receipts"
        component={ReceiptsScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabIcon]}>
              <Image
                source={require('../pics/receipts.png')}
                style={[
                  styles.tabIcon,
                  {tintColor: '#FFFFFF'},
                ]}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({focused}) => (
            <View style={[styles.tabIconContainer, focused && styles.activeTabIcon]}>
              <Image
                source={require('../pics/profile.png')}
                style={[
                  styles.tabIcon,
                  {tintColor: '#FFFFFF'},
                ]}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

interface AppNavigatorProps {
  initialRoute?: keyof RootStackParamList;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ initialRoute = 'Welcome' }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({current, layouts}) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 34,
    height: 34,
  },
  tabIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#253237',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTabIcon: {
    backgroundColor: '#253237',
    borderColor: '#FFFFFF',
  },
  centerTabIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#253237',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  centerIcon: {
    width: 28,
    height: 28,
  },
});

export default AppNavigator;