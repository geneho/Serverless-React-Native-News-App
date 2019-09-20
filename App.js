import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import { Provider } from 'react-redux';
import AppNavigator from './navigation/AppNavigator';
import store from './store';
import { YellowBox } from 'react-native';
import Amplify, { Auth } from 'aws-amplify';
import awsmobile from './aws-exports';
Amplify.configure(awsmobile);

YellowBox.ignoreWarnings(['Require cycle', 'Remote debugger']);
console.disableYellowBox = true;

export default class App extends React.Component {
  state = {
    isLoadingComplete: false
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <Provider store={store}>
          <View style={styles.container}>
            {Platform.OS === 'ios' && <StatusBar barStyle='default' />}
            <AppNavigator />
          </View>
        </Provider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
        require('./assets/images/loading.mp4'),
        require('./assets/images/success-tick.mp4'),
        require('./assets/video/trimmedIntro.mp4'),
        require('./assets/images/fingerprint.png')
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        'neue-haas-unica-pro-regular': require('./assets/fonts/neue-haas-unica-pro-regular.ttf'),
        'BebasNeue-Bold': require('./assets/fonts/BebasNeue-Bold.ttf'),
        'AlegreySans-LightItalic': require('./assets/fonts/AlegreyaSans-LightItalic.ttf')
      })
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});
