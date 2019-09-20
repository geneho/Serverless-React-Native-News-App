import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Auth } from 'aws-amplify';
import { Button, Form, Content, Input, Item } from 'native-base';
const { width, height } = Dimensions.get('window');
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-root-toast';

export default class ResetPasswordScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      confirmationCode: '',
      password: '',
      loading: false,
      twoConfCodeSection: false
    };
  }
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

  getCode() {
    this.setState({ loading: true });
    Auth.forgotPassword(this.state.username.replace(/\s/g, ''))
      .then(
        data =>
          this.setState({ loading: false }) ||
          this.setState({ twoConfCodeSection: true }) ||
          setTimeout(() => {
            Alert.alert(
              'Password Recovery',
              'Your code has been sent to : ' +
                data.CodeDeliveryDetails.Destination
            );
          }, 500)
      )
      .catch(err => {
        console.log(err);

        this.setState({ loading: false });
        if (err.code == 'UserNotFoundException') {
          this.toast('Username not found. Please check and try again.');
        }
        if (err.code == 'LimitExceededException') {
          this.toast(
            'Too much attempts in a short period. Please try again later.'
          );
        }
      });
  }

  resetPassword() {
    this.setState({
      //for loading spinner
      loading: true
    });

    Auth.forgotPasswordSubmit(
      this.state.username.replace(/\s/g, ''),
      this.state.confirmationCode.replace(/\s/g, ''),
      this.state.password
    )
      .then(
        data =>
          this.setState({ loading: false }) ||
          this.toast('Password changed successfully! Please login.') ||
          this.props.navigation.navigate('Tab1')
      )
      .catch(
        err =>
          console.log(err) ||
          this.setState({ loading: false }) ||
          setTimeout(() => {
            Alert.alert('Password Recovery', err.message);
          }, 500)
      );
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: 50,
          width: width,
          height: height,
          justifyContents: 'center',
          padding: 20,
          alignItems: 'center',
          flexDirection: 'column',
          backgroundColor: 'rgba(255,255,255,0.8)'
        }}
      >
        <Spinner
          //visibility of Overlay Loading Spinner
          visible={this.state.loading}
          textStyle={styles.spinnerTextStyle}
        />
        <Content>
          <Form>
            <Text
              style={{
                fontFamily: 'BebasNeue-Bold',
                fontSize: 34,
                textAlign: 'center',
                margin: 10
              }}
            >
              Reset Password
            </Text>
            <Text style={{ margin: 5 }}>Please enter your username</Text>

            <TextInput
              onChangeText={value => this.onChangeText('username', value)}
              autoCapitalize='none'
              style={styles.TextField}
              placeholder='username'
            />
            <Button
              warning
              style={styles.input}
              onPress={this.getCode.bind(this)}
            >
              <Text>Get Confirmation Code</Text>
            </Button>

            {!this.state.twoConfCodeSection && (
              <Button
                light
                style={styles.input}
                onPress={() => this.props.navigation.navigate('Tab1')}
              >
                <Text>Back</Text>
              </Button>
            )}

            {this.state.twoConfCodeSection && (
              <KeyboardAvoidingView behavior={'padding'}>
                <TextInput
                  onChangeText={value =>
                    this.onChangeText('confirmationCode', value)
                  }
                  style={styles.TextField}
                  placeholder='confirmation code'
                />

                <TextInput
                  onChangeText={value => this.onChangeText('password', value)}
                  autoCapitalize='none'
                  style={styles.TextField}
                  secureTextEntry={true}
                  placeholder='New Password (Min 8 Characters)'
                />

                <Button
                  warning
                  style={styles.input}
                  onPress={this.resetPassword.bind(this)}
                >
                  <Text>Change Password</Text>
                </Button>
                <Button
                  light
                  style={styles.input}
                  onPress={() => this.props.navigation.navigate('Tab1')}
                >
                  <Text>Back</Text>
                </Button>
              </KeyboardAvoidingView>
            )}
          </Form>
        </Content>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    margin: 10,
    width: 200,
    justifyContent: 'center'
  },
  TextField: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    height: 50,
    margin: 10,
    width: 200
  }
});
