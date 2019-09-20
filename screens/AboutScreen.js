import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  Linking,
  Image,
  AsyncStorage
} from 'react-native';
import {
  Container,
  Content,
  Switch,
  ListItem,
  Left,
  Right,
  Button,
  Body,
  Text,
  icon
} from 'native-base';
import Icon from '@expo/vector-icons/MaterialIcons';
import * as LocalAuthentication from 'expo-local-authentication';
import Toast from 'react-native-root-toast';

export default class AboutScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      biometricState: false
    };
  }
  checkForBiometrics = async () => {
    let biometricRecords = await LocalAuthentication.isEnrolledAsync();
    if (!biometricRecords) {
      console.log(
        'Please ensure you have set up biometrics in your phone setting (FingerPrint/Face)'
      );
      this.toast(
        'Please ensure you have set up biometrics in your phone setting (FingerPrint/Face)'
      );
      await AsyncStorage.setItem('biometricsLogin', 'false');
      this.setState({
        biometricState: false
      });
    } else {
      console.log('Biometrics detected, all good!');
      this.toast('Biometrics Login Enabled');
      await AsyncStorage.setItem('biometricsLogin', 'true');
    }
  };

  checkDeviceForHardware = async () => {
    let compatible = await LocalAuthentication.hasHardwareAsync();
    this.setState({ compatible });
    console.log('Hardware Compatible');
    this.checkForBiometrics();
    if (!compatible) {
      console.log('Hardware Incompatible');
      this.toast('Your phone do not support biometrics.');
      this.setState({
        biometricState: false
      });
    }
  };

  getBiometricState = async () => {
    //getBioMetricState and set switch to true/false
    try {
      const value = await AsyncStorage.getItem('biometricsLogin');
      if (value == 'true') {
        this.setState({
          biometricState: true
        });
      }
    } catch (error) {
      console.log(error);
      // Error retrieving data
    }
  };

  toast(msg) {
    let toast = Toast.show(msg, {
      duration: 5000,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
    });
    setTimeout(function() {
      Toast.hide(toast);
    }, 5000);
  }

  componentDidMount() {
    this.getBiometricState();
  }

  test(value) {
    console.log('Hiiiii' + value);
    if (this.state.biometricState == false) {
      this.checkDeviceForHardware();
      this.setState({
        biometricState: true
      });
    } else {
      this.setState({
        biometricState: false
      });
      console.log('Disabled Biometrics');
      this.toast('Biometrics Login Disabled');
      AsyncStorage.setItem('biometricsLogin', 'false');
    }
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Container>
            <Content>
              <Text
                style={{
                  fontFamily: 'BebasNeue-Bold',
                  fontSize: 30,
                  paddingBottom: 10,
                  paddingTop: 10,
                  textAlign: 'center'
                }}
              >
                Settings/Features
              </Text>

              <ListItem icon>
                <Left>
                  <Button style={{ backgroundColor: '#F0AD4E' }}>
                    <Icon size={20} active name='fingerprint' />
                  </Button>
                </Left>
                <Body style={{ fontSize: 8 }}>
                  <Text>Biometric Ez Login</Text>
                </Body>
                <Right>
                  <Switch
                    value={this.state.biometricState}
                    onValueChange={value => this.test(value)}
                  />
                </Right>
              </ListItem>
            </Content>
          </Container>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'BebasNeue-Bold',
              fontSize: 30,
              paddingBottom: 10
            }}
          >
            Collaboration/Feedback
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:kiagene@hotmail.com')}
          >
            <Text>Contact us at kiagene@hotmail.com !</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
