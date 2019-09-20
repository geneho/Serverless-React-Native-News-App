import React, { Component } from 'react';
import { Text, View,Button,StyleSheet,TextInput, TouchableOpacity } from 'react-native';

import { Auth } from 'aws-amplify';

export default class WelcomeScreen extends React.Component {

  state = {
    username: '',
    password: '',
    user: {},
  };
  onChangeText(key, value) {
    this.setState({
      [key]: value,
    });
  }

  signIn() {
    const { username, password } = this.state;
    Auth.signIn(username, password)
      .then(user => {
        console.log(user);
        this.setState({ user });
        console.log('successful sign in!');
      })
      .catch(err => console.log('error signing in!: ', err));
  }

  render() {
    return (
      <View style={styles.container}>
          <TextInput
          onChangeText={value => this.onChangeText('username', value)}
          style={styles.input}
          placeholder="username"
        />
        <TextInput
          onChangeText={value => this.onChangeText('password', value)}
          style={styles.input}
          secureTextEntry={true}
          placeholder="password"
        />
        <TouchableOpacity
            style={[styles.button]}
            onPress={() => {this.signIn.bind(this)}}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>


        <TouchableOpacity
            style={[styles.button]}
            onPress={() => {this.props.navigation.navigate('NewsDashBoard')}}
        >
          <Text style={styles.buttonText}>NewsList(ToRemove)</Text>
        </TouchableOpacity>


        <TouchableOpacity
            style={[styles.button]}
            onPress={() => {this.props.navigation.navigate('SignUp')}}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16,
  },
  button:{
    marginTop:10,
    backgroundColor:'#2196F3',
    borderColor: '#2196F3',
    padding:10,
    borderRadius:5,
    borderWidth: 1,
  },
  buttonText:{
    fontFamily: 'neue-haas-unica-pro-regular', 
    fontSize:16,
    color:'white',
    textAlign:'center'
  }
});