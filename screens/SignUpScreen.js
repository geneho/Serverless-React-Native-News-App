import React from 'react';
import {
  TextInput,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native';
import { FloatingTitleTextInputField } from '../components/floating_title_text_input_field';
import { Form, Button, Content, Picker, Icon } from 'native-base';
import { Auth } from 'aws-amplify';
import Toast from 'react-native-root-toast';
const { width, height } = Dimensions.get('window');
import Spinner from 'react-native-loading-spinner-overlay';
import { min } from 'moment';

export default class SignUpScreen extends React.Component {
  state = {
    username: '',
    password: '',
    phone_number: '',
    email: '',
    confirmationCode: '',
    realName: '',
    loginSection: true,
    twoFASection: false,
    loading: false,
    company: 'FirstCompany',
    countryCode: '+65'
  };
  onChangeText(key, value) {
    this.setState({
      [key]: value
    });
  }

  _updateMasterState = (attrName, value) => {
    this.setState({ [attrName]: value });
  };

  signUp() {
    if (
      this.state.email != null ||
      this.state.email != '' ||
      this.state.phone_number != null ||
      this.state.phone_number != '' ||
      this.state.realName != null ||
      this.state.realName != '' ||
      this.state.countryCode != null ||
      this.state.countryCode != ''
    ) {
      this.setState({ loading: true });
      Auth.signUp({
        username: this.state.username.toLowerCase(),
        password: this.state.password,
        attributes: {
          email: this.state.email,
          phone_number: this.state.countryCode + this.state.phone_number,
          'custom:realName': this.state.realName,
          'custom:company': this.state.company
        }
      })
        .then(() => {
          this.setState({ loading: false }) ||
            this.toast('Please check your mailbox for the confirmation code') ||
            this.setState({
              loginSection: false,
              twoFASection: true
            });
        })
        .catch(err => {
          console.log(err);
          if (err.code == 'UsernameExistsException') {
            this.setState({
              loading: false
            });
            this.toast('Username taken. Please choose another username.');
          } else if (err.code == 'InvalidPasswordException') {
            this.toast('Invalid Password Entered.');
            this.setState({ loading: false });
          } else {
            this.toast('Please screenshot and contact administrator');
            this.setState({ loading: false });
          }
        });
    } else {
      //empty fields
      this.toast('Please fill in all the fields. ');
    }
  }
  confirmSignUp() {
    this.setState({ loading: true });
    Auth.confirmSignUp(
      this.state.username.toLowerCase(),
      this.state.confirmationCode
    )
      .then(() => {
        this.setState({ loading: false }) ||
          this.toast('Account verified successfully') ||
          this.props.navigation.navigate('Tab1');
      })
      .catch(
        err =>
          this.toast('error signing up!: ' + err) ||
          this.setState({ loading: false })
      );
  }

  toast(msg) {
    let toast = Toast.show(msg, {
      duration: Toast.durations.LONG,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
    });
    setTimeout(function() {
      Toast.hide(toast);
    }, 2000);
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
        <Spinner
          //visibility of Overlay Loading Spinner
          visible={this.state.loading}
          //Text with the Spinner
          //textContent={'Loading...'}
          //Text style of the Spinner Text
          textStyle={styles.spinnerTextStyle}
        />
        {this.state.loginSection && (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <Form style={{ marginLeft: 10, marginRight: 10, marginTop: 20 }}>
              <Text
                style={{
                  fontFamily: 'BebasNeue-Bold',
                  fontSize: 34,
                  textAlign: 'center'
                }}
              >
                Account Creation
              </Text>
              <Text
                style={{
                  marginTop: 5,
                  marginBottom: 5
                }}
              >
                Please fill up the following fields to create an account with
                us!
              </Text>

              <FloatingTitleTextInputField
                attrName='username'
                title='Username'
                value={this.state.username}
                updateMasterState={this._updateMasterState}
                secure={false}
                autoCaps='none'
              />
              <FloatingTitleTextInputField
                attrName='password'
                title='Password (Min 8 Characters)'
                value={this.state.password}
                updateMasterState={this._updateMasterState}
                secure={true}
                autoCaps='none'
              />

              <Picker
                selectedValue={this.state.company}
                iosIcon={<Icon name='arrow-down' />}
                placeholder='Select your company'
                placeholderStyle={{ color: '#bfc6ea' }}
                placeholderIconColor='#007aff'
                style={{ height: 50, width: '94%' }}
                mode='dropdown'
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ company: itemValue })
                }
              >
                <Picker.Item label='FirstCompany' value='FirstCompany' />
                <Picker.Item label='SecondCompany' value='SecondCompany' />
                <Picker.Item label='ThirdCompany' value='ThirdCompany' />
              </Picker>

              <FloatingTitleTextInputField
                attrName='countryCode'
                title='Country Code'
                value={this.state.countryCode}
                updateMasterState={this._updateMasterState}
                secure={false}
                autoCaps='none'
              />

              <FloatingTitleTextInputField
                attrName='phone_number'
                title='Phone Number'
                value={this.state.phone_number}
                updateMasterState={this._updateMasterState}
                secure={false}
                autoCaps='none'
              />

              <FloatingTitleTextInputField
                attrName='realName'
                title='Preferred Name'
                value={this.state.realName}
                updateMasterState={this._updateMasterState}
                secure={false}
                autoCaps='words'
              />

              <FloatingTitleTextInputField
                attrName='email'
                title='Email'
                value={this.state.email}
                updateMasterState={this._updateMasterState}
                secure={false}
                autoCaps='none'
              />

              <Button
                warning
                style={styles.input}
                onPress={this.signUp.bind(this)}
              >
                <Text>Sign Up</Text>
              </Button>

              <Button
                light
                style={styles.input}
                onPress={() => this.props.navigation.navigate('Tab1')}
              >
                <Text>Back</Text>
              </Button>
            </Form>
          </ScrollView>
        )}
        {this.state.twoFASection && (
          <View style={styles.container}>
            <TextInput
              onChangeText={value =>
                this.onChangeText('confirmationCode', value)
              }
              style={styles.TextField}
              placeholder='confirmation Code'
            />
            <Button
              warning
              style={styles.input}
              onPress={this.confirmSignUp.bind(this)}
            >
              <Text>Confirm Sign Up</Text>
            </Button>
          </View>
        )}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    width: width,
    height: height,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(255,255,255,0.8)'
  },
  input: {
    height: 50,
    marginTop: 10,
    width: '94%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  TextField: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    height: 50,
    margin: 10,
    width: '90%'
  }
});
