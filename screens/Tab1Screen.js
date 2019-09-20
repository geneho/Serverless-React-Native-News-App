import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
  Keyboard,
  AsyncStorage
} from 'react-native';
//import { Video } from 'expo';
//import Video from "react-native-video";
const { width, height } = Dimensions.get('window');
import { Auth } from 'aws-amplify';
import { Button, Form, Content, Input, Item } from 'native-base';
import Spinner from 'react-native-loading-spinner-overlay';
import DialogInput from 'react-native-dialog-input';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
  SlideAnimation,
  ScaleAnimation
} from 'react-native-popup-dialog';
import * as LocalAuthentication from 'expo-local-authentication';
import { Video } from 'expo-av';
import Icon from '@expo/vector-icons/MaterialIcons';
//redux

import { toggleTheme } from '../actions';
import { connect } from 'react-redux';
import Toast from 'react-native-root-toast';

class Tab1Screen extends React.Component {
  state = {
    username: '',
    password: '',
    user: {},
    loading: false,
    isDialogVisible: false,
    defaultAnimationDialog: true,
    loadingDialog: false,
    arrayStrings: ['QOTD1', 'QOTD2', 'QOTD3', 'QOTD4', 'QOTD5'],
    arrayValue: '',
    androidBiometric: false
  };

  storeUser = async () => {
    try {
      await AsyncStorage.setItem('usernameKey', this.state.username);
      await AsyncStorage.setItem('passwordKey', this.state.password);
    } catch (error) {
      // Error saving data
    }
  };

  retrieveUser = async () => {
    try {
      const value = await AsyncStorage.getItem('usernameKey');
      if (value !== null) {
        this.setState({
          username: value
        });
        console.log(value);
      }
    } catch (error) {
      console.log(error);
      // Error retrieving data
    }
  };

  onChangeText(key, value) {
    this.setState({
      [key]: value
    });
  }

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

  twoFAChallenge(inputText) {
    console.log('Hi From 2Fa challenge: ' + inputText);
    Auth.confirmSignUp(this.state.username, inputText)
      .then(() => {
        this.toast('Account verified successfully') ||
          this.setState({
            isDialogVisible: false
          });
      })
      .catch(err => this.toast('error signing up!: ' + err));
  }

  signIn() {
    const { username, password } = this.state;

    this.setState({
      //for loading spinner
      loading: true
    });

    Auth.signIn(username.replace(/\s/g, ''), password)
      .then(user => {
        console.log(user);
        if (user.attributes.email_verified == true) {
          this.setState({ user });
          //Redux
          this.props.toggleTheme([
            user.attributes['custom:realName'],
            user.username
          ]);
          // console.log(
          //   this.props.toggleTheme([
          //     user.attributes['custom:realName'],
          //     user.username
          //   ])
          // );
          // console.log(
          //   'successful sign in! ' + user.attributes['custom:realName']
          // );
          this.setState({
            //for loading spinner
            loading: false
          });

          this.storeUser();

          this.props.navigation.navigate('NewsDashBoard');
        } else {
          this.toast('Unable to establish connection, please try again later.');
          this.setState({
            //for loading spinner
            loading: false
          });
        }
      })
      .catch(err => {
        console.log('error signing in!: ', err);
        if (err.code == 'UserNotConfirmedException') {
          //pop up dialog to enter 2FA , to retrigger
          this.toast('Account not verified yet');
          this.setState({
            //for loading spinner
            loading: false,
            isDialogVisible: true
          });
        } else if (err.code == 'PasswordResetRequiredException') {
          this.setState({
            //for loading spinner
            loading: false
          });
          this.toast('Existing user found. Please reset your password.');
        } else if (err.code == 'NotAuthorizedException') {
          this.setState({
            //for loading spinner
            loading: false
          });
          this.toast('Wrong username or password');
        } else if (err.code == 'UserNotFoundException') {
          this.setState({
            //for loading spinner
            loading: false
          });
          this.toast('Wrong username or password');
        } else {
          this.setState({
            //for loading spinner
            loading: false
          });
          this.toast('Unexpected Error. Please contact administrator.');
        }
        this.setState({
          //for loading spinner
          loading: false
        });
      });
  }

  componentDidMount() {
    console.log('Props:' + this.props.user);

    //random picking of qotd
    var rand = this.state.arrayStrings[
      Math.floor(Math.random() * this.state.arrayStrings.length)
    ];
    this.setState({
      arrayValue: rand
    });
    if (Platform.OS === 'android') {
      //close any previously opened authentication
      LocalAuthentication.cancelAuthenticate();
    }
    //retrieve username
    this.retrieveUser();
  }

  biometricLogin = async () => {
    try {
      const value = await AsyncStorage.getItem('biometricsLogin');
      if (value == 'true') {
        if (Platform.OS === 'android') {
          this.showAndroidBioScan();
        } else {
          this.scanBiometrics();
        }
      } else {
        this.toast('Please go to settings to turn on this feature.');
        console.log('Please go to settings to turn on this feature.');
      }
    } catch (error) {
      console.log(error);
      // Error retrieving data
    }
  };

  showAndroidBioScan = async () => {
    // Alert.alert(
    //   'Fingerprint Scan',
    //   'Place your finger over the fingerprint sensor.'
    // );
    this.setState({ androidBiometric: true });
    this.scanBiometrics();
  };

  scanBiometrics = async () => {
    let result = await LocalAuthentication.authenticateAsync('Scan to Login');
    if (result.success) {
      console.log('Scan Success!');
      this.setState({ androidBiometric: false });
      try {
        const pw = await AsyncStorage.getItem('passwordKey');
        if (pw != null) {
          this.setState({
            password: pw
          });
          this.signIn();
        } else {
          console.log(
            'Unable to retrieve password. Please use normal password Login.'
          );
          this.toast(
            'Unable to retrieve password. Please use normal password Login.'
          );
        }
      } catch (error) {
        console.log(error);
        this.setState({ androidBiometric: false });
        this.toast('Error 101. Please use normal password Login.');
        // Error retrieving data
      }
    } else {
      this.setState({ androidBiometric: false });
      console.log('Scan Fail');
      this.toast('Biometric Scan Fail. Please try again');
    }
  };

  render() {
    return (
      <View>
        <Video
          source={require('../assets/video/trimmedIntro.mp4')}
          style={styles.backgroundVideo}
          isMuted={true}
          isLooping={true}
          resizeMode='cover'
          shouldPlay
          rate={1.0}
        />

        <Dialog
          onDismiss={() => {}}
          onTouchOutside={() => {
            LocalAuthentication.cancelAuthenticate();
            this.setState({ androidBiometric: false });
          }}
          width={0.8}
          visible={this.state.androidBiometric}
          rounded
          actionsBordered
          dialogTitle={
            <DialogTitle
              title='Biometric Scan'
              style={{
                backgroundColor: '#F7F7F8'
              }}
              hasTitleBar={false}
              align='center'
            />
          }
        >
          <DialogContent
            style={{
              backgroundColor: 'white',
              justifyContents: 'center',
              alignItems: 'center',
              height: 150
            }}
          >
            <Text style={{ paddingTop: 20, textAlign: 'center' }}>
              Please scan your fingerprint on your device biometric scanner.
            </Text>
            <Image
              style={{
                width: 50,
                height: 50,
                position: 'absolute',
                bottom: 15
              }}
              source={require('../assets/images/fingerprint.png')}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          onDismiss={() => {}}
          onTouchOutside={() => {}}
          width={0.8}
          visible={this.state.loading}
          rounded
          actionsBordered
          dialogTitle={
            <DialogTitle
              title='Safety Principle'
              style={{
                backgroundColor: '#F7F7F8'
              }}
              hasTitleBar={false}
              align='center'
            />
          }
        >
          <DialogContent
            style={{
              backgroundColor: 'white',
              justifyContents: 'center',
              alignItems: 'center',
              height: 150
            }}
          >
            <Text style={{ paddingTop: 20, textAlign: 'center' }}>
              {this.state.arrayValue}
            </Text>

            <Video
              source={require('../assets/images/loading.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={true}
              resizeMode='contain'
              shouldPlay
              isLooping
              style={{ width: 80, height: 80, position: 'absolute', bottom: 5 }}
            />
          </DialogContent>
        </Dialog>

        <DialogInput
          isDialogVisible={this.state.isDialogVisible}
          title={'2 Factor Authentication'}
          message={
            'Please check your email/junk folder for the verification code.'
          }
          hintInput={'6 Numeric Digits'}
          submitInput={inputText => {
            this.twoFAChallenge(inputText);
          }}
          closeDialog={() => {
            console.log('Closed... Do nothing');
          }}
        />

        <View
          style={{
            width: width,
            height: height,
            justifyContents: 'space-between',
            padding: 20,
            alignItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'rgba(255,255,255,0.8)'
          }}
        >
          {/* <Image
            style={{ width: 200, height: 200, resizeMode: 'contain' }}
            source={require('../assets/images/YOURLOGOHERE.png')}
          /> */}
          <Content style={{ width: width * 0.8 }}>
            <Form>
              <Item style={{ height: 50 }} fixedLabel>
                <Input
                  placeholder='username'
                  autoCapitalize='none'
                  onChangeText={value => this.onChangeText('username', value)}
                  value={this.state.username}
                />
              </Item>
              <Item style={{ height: 50 }} fixedLabel>
                <Input
                  autoCapitalize='none'
                  secureTextEntry={true}
                  placeholder='password'
                  onChangeText={value => this.onChangeText('password', value)}
                  value={this.state.password}
                />
              </Item>
              <View style={{ flexDirection: 'row' }}>
                <Button
                  block
                  warning
                  style={{
                    marginVertical: 5,
                    width: width * 0.6
                  }}
                  onPress={() => {
                    this.signIn() || Keyboard.dismiss();
                  }}
                >
                  <Text>Sign In</Text>
                </Button>
                <Button
                  style={{
                    marginLeft: width * 0.01,
                    marginVertical: 5,
                    backgroundColor: '#d7e4ff',
                    width: width * 0.19,
                    justifyContent: 'center'
                  }}
                  onPress={() => {
                    this.biometricLogin();
                  }}
                >
                  <Icon
                    style={{ marginLeft: 0, marginRight: 0 }}
                    size={34}
                    active
                    name='fingerprint'
                  />
                </Button>
              </View>

              <Button
                block
                light
                style={{ marginVertical: 5 }}
                onPress={() => {
                  this.props.navigation.navigate('SignUp');
                }}
              >
                <Text>Sign Up</Text>
              </Button>
              <Button
                block
                light
                style={{ marginVertical: 5 }}
                onPress={() => {
                  this.props.navigation.navigate('ResetPassword');
                }}
              >
                <Text>Reset Password</Text>
              </Button>
            </Form>
          </Content>
        </View>
        <Text
          style={{ position: 'absolute', bottom: 2, right: 15, fontSize: 15 }}
        >
          1117G
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  backgroundVideo: {
    height: height,
    zIndex: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'stretch',
    bottom: 0,
    right: 0
  }
});

const mapStateToProps = state => ({
  user: state.user.userData,
  email: state.user.emailData
});

const mapDispatchToProps = dispatch => ({
  toggleTheme: user => dispatch(toggleTheme(user))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tab1Screen);
