import React from 'react';
import { ScrollView, Text } from 'react-native';
import {
  createSwitchNavigator,
  createStackNavigator,
  createBottomTabNavigator,
  createDrawerNavigator,
  DrawerItems
} from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import NewsDashBoardScreen from '../screens/NewsDashBoardScreen';
import Tab1Screen from '../screens/Tab1Screen';
import Tab3Screen from '../screens/Tab3Screen';
import Icon from '@expo/vector-icons/Ionicons';
import NewsHomeScreen from '../screens/NewsHomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import QuizScreen from '../screens/QuizScreen';
import SideMenu from '../screens/SideMenu';
import AboutScreen from '../screens/AboutScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

//React navigation : look at https://www.youtube.com/watch?v=w24FE9PZpzk for guide

const Tab1Stack = createStackNavigator({
  NewsDashBoardScreen: {
    screen: NewsDashBoardScreen,
    navigationOptions: ({ navigation }) => {
      return {
        headerLeft: (
          <Icon
            style={{ paddingLeft: 10 }}
            onPress={() => navigation.openDrawer()}
            name='md-menu'
            size={30}
          />
        )
      };
    }
  },
  NewsHomeScreen: {
    screen: NewsHomeScreen
  },
  QuizScreen: {
    screen: QuizScreen
  },
  AboutScreen: {
    screen: AboutScreen
  }
});

//to ensure that once we move into the tabstack, inner child we remove the tab bar for all 3
Tab1Stack.navigationOptions = ({ navigation }) => {
  //To: DELETE once tab navigator is ready (TABNAVIGATOR MODULE)
  const { routeName } = navigation.state.routes[navigation.state.index];
  return {
    header: null,
    headerTitle: routeName
  };

  //To: uncomment once tab navigator is ready (TABNAVIGATOR MODULE)
  // let tabBarVisible = true;
  // if (navigation.state.index > 0) {
  //   tabBarVisible = false;
  // }

  // return {
  //   tabBarVisible,
  // };
};

//add bottomTabNavigator
const NewsDashBoardTabNavigator = createBottomTabNavigator(
  {
    Tab1Stack,
    Tab3Screen
  },
  {
    navigationOptions: ({ navigation }) => {
      const { routeName } = navigation.state.routes[navigation.state.index];
      return {
        header: null,
        headerTitle: routeName
      };
    }
  }
);

//add StackNavigator into tab navigator
const NewsDashBoardStackNavigator = createStackNavigator(
  {
    //To: uncomment once tab navigator is ready (TABNAVIGATOR MODULE)
    //NewsDashBoardTabNavigator:NewsDashBoardTabNavigator

    //To: DELETE once tab navigator is ready (TABNAVIGATOR MODULE)
    NewsDashBoardTabNavigator: Tab1Stack
  },
  {
    defaultNavigationOptions: ({ navigation }) => {
      return {
        headerLeft: (
          <Icon
            style={{ paddingLeft: 10 }}
            onPress={() => navigation.openDrawer()}
            name='md-menu'
            size={30}
          />
        )
      };
    }
  }
);

//add DrawerNavigator
const AppDrawerNavigator = createDrawerNavigator(
  {
    NewsDashBoard: NewsDashBoardStackNavigator,
    Tab1: Tab1Screen,
    AboutScreen: AboutScreen
  },
  {
    contentComponent: SideMenu,
    drawerWidth: 220,
    drawerLockMode: 'locked-closed'
  }
);

const AppSwitchNavigator = createSwitchNavigator({
  //inital point
  // Welcome:WelcomeScreen,
  Tab1: Tab1Screen,
  SignUp: SignUpScreen,
  ResetPassword: ResetPasswordScreen,

  //to remove below move to a stack on loginStack
  //use appDrawerNavigator so once login , we are able to use the drawer functionalities
  NewsDashBoard: AppDrawerNavigator
});

export default AppSwitchNavigator;
