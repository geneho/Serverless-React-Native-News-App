import React from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { RadioGroup, RadioButton } from 'react-native-flexi-radio-button';
import { Content, Card, CardItem, Body, Right } from 'native-base';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default class Question extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      answer: null,
      selectedAnswer: null,
      index: null
    };
  }

  renderOptions = question => {
    if (question.type === 'boolean') {
      return [
        <RadioButton value={'True'} key={1}>
          <Text style={styles.radioText}>True</Text>
        </RadioButton>,

        <RadioButton value={'False'} key={2}>
          <Text style={styles.radioText}>False</Text>
        </RadioButton>
      ];
    } else {
      const result = [];

      question.incorrect_answers.forEach((item, index) => {
        let key = `${question.id}-${index}`;

        if (index === this.props.correctPosition) {
          let key2 = `${question.id}-100`;
          result.push(
            <RadioButton value={question.correct_answer} key={key2}>
              <Text style={styles.radioText}>{question.correct_answer}</Text>
            </RadioButton>
          );
        }

        result.push(
          <RadioButton value={item} key={key}>
            <Text style={styles.radioText}>{item}</Text>
          </RadioButton>
        );
      });

      return result;
    }
  };

  render() {
    return (
      <View style={{ flex: 1, height: height }}>
        <Text
          style={{
            fontSize: 10,
            color: '#666',
            textAlign: 'right',
            paddingTop: 5,
            paddingBottom: 5,
            paddingRight: 3
          }}
        >
          Question {this.props.current + 1}
        </Text>

        <Card>
          <CardItem>
            <Body>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: '#3498db',
                  paddingTop: 20,
                  paddingBottom: 20
                }}
              >
                {this.props.question.question}
              </Text>
            </Body>
          </CardItem>
        </Card>

        <View style={{ flex: 1 }}>
          <RadioGroup
            onSelect={(index, answer) => this.setState({ answer, index })}
            selectedIndex={this.state.index}
          >
            {this.renderOptions(this.props.question)}
          </RadioGroup>
        </View>

        <View style={{ flex: 1 }}>
          {!this.props.showAnswer && (
            <View>
              <TouchableOpacity
                onPress={() => {
                  console.log(this.state.answer);
                  console.log('test' + this.props.question.correct_answer);
                  this.props.onSelect(this.state.answer);
                  this.setState({ index: null });
                }}
              >
                <Button
                  style={{ zIndex: 99, marginBottom: 5 }}
                  title='Submit Answers'
                  onPress={() => {
                    console.log(this.state.answer);
                    console.log('test' + this.props.question.correct_answer);
                    this.props.onSelect(this.state.answer);
                    this.setState({ index: null });
                  }}
                />
              </TouchableOpacity>
            </View>
          )}
          {this.props.showAnswer && (
            <Text>Correct Ans: {this.props.question.correct_answer}</Text>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  radioText: {
    fontSize: 14
  }
});
