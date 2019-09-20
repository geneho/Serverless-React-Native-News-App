import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableHighlight,
  Image,
  Animated,
  Easing,
  Alert
} from 'react-native';
import { Auth } from 'aws-amplify';
import { connect } from 'react-redux';

class SideMenu extends React.Component {
  constructor() {
    super();
    this.animatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.animate();
  }
  animate() {
    this.animatedValue.setValue(0);
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear
    }).start(() => this.animate());
  }

  signOut() {
    Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
    this.props.navigation.navigate('Tab1');
  }

  render() {
    const marginLeft = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 185]
    });
    const opacity = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 0]
    });
    const movingMargin = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 185, 0]
    });

    return (
      <View style={styles.container}>
        <ScrollView>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10
            }}
          >
            <Image
              style={{ width: 64, height: 64 }}
              source={require('../assets/images/profileuser.png')}
            />

            <Text>{this.props.user}</Text>
          </View>
          <View style={styles.navSectionStyle}>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('NewsDashBoard')}
            >
              <Text style={styles.navItemStyle}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate('AboutScreen')}
            >
              <Text style={styles.navItemStyle}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Not enough criteria to run')}
            >
              <Text style={styles.navItemStyle}>First Company</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Not enough criteria to run')}
            >
              <Text style={styles.navItemStyle}>Second Company</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <View style={{ marginBottom: 50 }}>
          <Animated.View
            style={{
              marginLeft,
              height: 20,
              width: 30,
              backgroundColor: 'red'
            }}
          />
          <Animated.View
            style={{
              opacity,
              marginTop: 2,
              height: 20,
              width: 30,
              backgroundColor: 'blue'
            }}
          />
          <Animated.View
            style={{
              marginLeft: movingMargin,
              marginTop: 2,
              height: 20,
              width: 30,
              backgroundColor: 'orange'
            }}
          />
        </View>
        <View style={styles.footerContainer}>
          <TouchableOpacity
            onPress={() => {
              this.signOut();
            }}
          >
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1
  },
  navItemStyle: {
    padding: 10
  },
  navSectionStyle: {},
  footerContainer: {
    padding: 20,
    backgroundColor: 'lightgrey'
  }
});

const mapStateToProps = state => ({
  user: state.user.userData
});

export default connect(mapStateToProps)(SideMenu);
