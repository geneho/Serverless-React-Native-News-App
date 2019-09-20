import React, { Component } from 'react';
import { View, Animated, StyleSheet, TextInput } from 'react-native';
import { string, func, bool } from 'prop-types';

export class FloatingTitleTextInputField extends Component {
  static propTypes = {
    attrName: string.isRequired,
    title: string.isRequired,
    value: string.isRequired,
    updateMasterState: func.isRequired,
    secure: bool.isRequired,
    autoCaps: string.isRequired
  };

  constructor(props) {
    super(props);
    const { value } = this.props;
    this.position = new Animated.Value(value ? 1 : 0);
    this.state = {
      isFieldActive: false
    };
  }

  _handleFocus = () => {
    if (!this.state.isFieldActive) {
      this.setState({ isFieldActive: true });
      Animated.timing(this.position, {
        toValue: 1,
        duration: 150
      }).start();
    }
  };

  _handleBlur = () => {
    if (this.state.isFieldActive && !this.props.value) {
      this.setState({ isFieldActive: false });
      Animated.timing(this.position, {
        toValue: 0,
        duration: 150
      }).start();
    }
  };

  _onChangeText = updatedValue => {
    const { attrName, updateMasterState } = this.props;
    updateMasterState(attrName, updatedValue);
  };

  _returnAnimatedTitleStyles = () => {
    const { isFieldActive } = this.state;
    return {
      top: this.position.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 0]
      }),
      fontSize: isFieldActive ? 11.5 : 15,
      color: isFieldActive ? 'black' : 'dimgrey'
    };
  };

  render() {
    return (
      <View style={Styles.container}>
        <Animated.Text
          style={[Styles.titleStyles, this._returnAnimatedTitleStyles()]}
        >
          {this.props.title}
        </Animated.Text>
        <TextInput
          value={this.props.value}
          style={Styles.textInput}
          underlineColorAndroid='transparent'
          onFocus={this._handleFocus}
          onBlur={this._handleBlur}
          onChangeText={this._onChangeText}
          secureTextEntry={this.props.secure}
          autoCapitalize={this.props.autoCaps}
        />
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    width: '94%',
    borderRadius: 3,
    borderStyle: 'solid',
    borderWidth: 0.5,
    height: 50,
    marginVertical: 4
  },
  textInput: {
    fontSize: 15,
    marginTop: 17,
    paddingLeft: 5,
    //fontFamily: 'Avenir-Medium',
    color: 'black'
  },
  titleStyles: {
    position: 'absolute',
    // fontFamily: 'Avenir-Medium',
    left: 3,
    left: 4
  }
});
