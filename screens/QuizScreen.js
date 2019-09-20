import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Picker,
  Button,
  Image,
  Dimensions
} from 'react-native';
import Question from '../components/Question';
import { connect } from 'react-redux';
import moment from 'moment';
import { NavigationActions, StackActions } from 'react-navigation';
import Toast from 'react-native-root-toast';
import Spinner from 'react-native-loading-spinner-overlay';
import Dialog, {
  DialogTitle,
  DialogContent,
  DialogFooter,
  DialogButton,
  SlideAnimation,
  ScaleAnimation
} from 'react-native-popup-dialog';
import { Video } from 'expo';

const { width, height } = Dimensions.get('window');

class QuizScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loadingSpinner: false,
      questions: [],
      totalqns: 0,
      current: 0,
      correctScore: 5,
      totalScore: 50,

      results: {
        score: 0,
        correctAnswers: 0,
        attemptedTries: 1
      },
      completed: false,
      quizResultBool: false,
      quizResultData: '',
      acknowledgedDialog: false,
      processingAck: true
    };
  }

  //Reset parent stack(News Home) once done for either if else
  resetStack = () => {
    console.log('Reset');
    this.props.navigation.dispatch(
      StackActions.reset({
        index: 0,
        actions: [
          NavigationActions.navigate({
            routeName: 'NewsDashBoardTabNavigator'
          })
        ]
      })
    );
  };

  retrieveQuizResults = async () => {
    /*
    1.Get email from redux state
    2.retrieveQuizResults
      Store in state 
      Set boolean
    */
    const response = await fetch(`API ADDRESS HERE` + this.props.email);
    const data = await response.json();

    console.log(data);

    if (data.Count != 0) {
      this.setState({
        quizResultBool: true,
        quizResultData: data.Items[0].resultsObjectTable
      });
    }
  };

  fetchQuestions = async () => {
    await this.setState({ loading: true });
    const response = await fetch(`API ADDRESS HERE` + this.state.id);

    console.log(response);

    const question = await response.json();

    console.log(question);
    console.log(question.Items[0]);
    if (question.Count != 0) {
      if (this.state.chineseLanguageToggle == true) {
        const questions = JSON.parse(question.Items[0].chineseResults);

        await this.setState({ totalqns: questions.length });
        const results = questions;
        results.forEach(item => {
          item.id = Math.floor(Math.random() * 10000);
        });

        await this.setState({ questions: results, loading: false });
      } else {
        const questions = JSON.parse(question.Items[0].results);

        await this.setState({ totalqns: questions.length });
        const results = questions;
        results.forEach(item => {
          item.id = Math.floor(Math.random() * 10000);
        });
        await this.setState({ questions: results, loading: false });
      }
    }
    //unable to retrieve quiz
    else {
      //simple acknowledgement
      if (this.state.quizResultBool == false) {
        //create new object
        var Object = [];
        Object.push({
          newsID: this.state.id,
          noOfTries: 'noQuiz',
          dateTime: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
        });
        console.log(Object);

        const payload = {
          email: this.props.email,
          resultsObjectTable: JSON.stringify(Object)
        };

        console.log(payload);

        //upload to AWS
        let response = await fetch('API ADDRESS HERE', {
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        let responseJson = await response.json();
        console.log(responseJson);
      } else if (this.state.quizResultBool == true) {
        //update statement
        //create new object
        var Object = JSON.parse(this.state.quizResultData);

        console.log('Before:');
        console.log(Object);

        Object.push({
          newsID: this.state.id,
          noOfTries: 'noQuiz',
          dateTime: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
        });

        console.log('After:');
        console.log(Object);

        const payload = {
          email: this.props.email,
          resultsObjectTable: JSON.stringify(Object)
        };

        console.log('Payload');
        console.log(payload);

        //upload to AWS
        let response = await fetch('API ADDRESS HERE', {
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        let responseJson = await response.json();
        console.log(responseJson);
      }

      // let toast = Toast.show('News Acknowledged!', {
      //   duration: Toast.durations.LONG,
      //   position: Toast.positions.BOTTOM,
      //   shadow: true,
      //   animation: true,
      //   hideOnPress: true,
      //   delay: 0
      // });
      // setTimeout(function() {
      //   Toast.hide(toast);
      // }, 2000);

      //DialogPopup modal
      this.setState({
        acknowledgedDialog: true
      });

      //reset back to homepage
      //this.resetStack();
    }
  };

  reset = () => {
    var attemptedTriesVal = this.state.results.attemptedTries + 1;
    this.setState(
      {
        questions: [],
        current: 0,
        results: {
          score: 0,
          correctAnswers: 0,
          attemptedTries: attemptedTriesVal
        },
        completed: false
      },
      () => {
        console.log('Tries' + attemptedTriesVal);
        this.fetchQuestions();
      }
    );
  };

  updateResult = async () => {
    this.setState({
      loadingSpinner: true,
      processingAck: false
    });

    console.log(this.state.quizResultBool);
    console.log(this.state.quizResultData);

    if (this.state.quizResultBool == false) {
      //create new object
      var Object = [];
      Object.push({
        newsID: this.state.id,
        noOfTries: this.state.results.attemptedTries,
        dateTime: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
      });
      console.log(Object);

      const payload = {
        email: this.props.email,
        resultsObjectTable: JSON.stringify(Object)
      };

      console.log(payload);

      //upload to AWS
      let response = await fetch('API ADDRESS HERE', {
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseJson = await response.json();
      console.log(responseJson);
    } else if (this.state.quizResultBool == true) {
      //update statement
      //create new object
      var Object = JSON.parse(this.state.quizResultData);

      console.log('Before:');
      console.log(Object);

      Object.push({
        newsID: this.state.id,
        noOfTries: this.state.results.attemptedTries,
        dateTime: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
      });

      console.log('After:');
      console.log(Object);

      const payload = {
        email: this.props.email,
        resultsObjectTable: JSON.stringify(Object)
      };

      console.log('Payload');
      console.log(payload);

      //upload to AWS
      let response = await fetch('API ADDRESS HERE', {
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let responseJson = await response.json();
      console.log(responseJson);
    }

    // let toast = Toast.show('News Acknowledged!', {
    //   duration: Toast.durations.LONG,
    //   position: Toast.positions.BOTTOM,
    //   shadow: true,
    //   animation: true,
    //   hideOnPress: true,
    //   delay: 0
    // });
    // setTimeout(function() {
    //   Toast.hide(toast);
    // }, 2000);

    //DialogPopup modal
    this.setState({
      acknowledgedDialog: true
    });

    //reset back to homepage
    this.setState({
      loadingSpinner: false
    });
    //this.resetStack();
  };

  submitAnswer = (index, answer) => {
    const question = this.state.questions[index];
    const isCorrect = question.correct_answer === answer;
    const results = { ...this.state.results };

    results.score = isCorrect ? results.score + 5 : results.score;
    results.correctAnswers = isCorrect
      ? results.correctAnswers + 1
      : results.correctAnswers;

    this.setState({
      current: index + 1,
      results,
      completed: index === this.state.totalqns - 1 ? true : false
    });
  };

  componentDidMount() {
    console.log('test: ' + this.props.navigation.getParam('chineseLanguage'));
    let id = this.props.navigation.getParam('id');
    console.log('id:' + id);
    this.setState({ id: id });
    let chineseLanguage = this.props.navigation.getParam('chineseLanguage');
    this.setState({ chineseLanguageToggle: chineseLanguage });

    this.fetchQuestions();
    this.retrieveQuizResults();
  }

  displayAckOrRetry() {
    var value = Math.round(
      (this.state.results.correctAnswers / this.state.totalqns) * 100
    );
    if (value >= 50) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text>Passed!</Text>
          {!!this.state.processingAck && (
            <Button title='Acknowledge Article' onPress={this.updateResult} />
          )}
        </View>
      );
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text>Failed!</Text>
          <Button title='Restart Quiz' onPress={this.reset} />
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {!!this.state.loading && (
          <View style={styles.loadingQuestions}>
            <Video
              source={require('../assets/images/loading.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={true}
              resizeMode='contain'
              shouldPlay
              isLooping
              style={{ width: 80, height: 80, paddingBottom: 5 }}
            />
            <Text>Working on it...</Text>
          </View>
        )}

        <Dialog
          onDismiss={() => {
            this.setState({ acknowledgedDialog: false }, () => {
              this.resetStack();
            });
          }}
          onTouchOutside={() => {
            this.setState({ acknowledgedDialog: false }, () => {
              //setTimeout(this.resetStack(), 1000);
            });
          }}
          width={0.8}
          visible={this.state.acknowledgedDialog}
          rounded
          actionsBordered
          // actionContainerStyle={{
          //   height: 100,
          //   flexDirection: 'column',
          // }}
          dialogTitle={
            <DialogTitle
              title='Success'
              style={{
                backgroundColor: '#F7F7F8'
              }}
              hasTitleBar={false}
              align='center'
            />
          }
          footer={
            <DialogFooter>
              <DialogButton
                text='OK'
                onPress={() => {
                  this.setState({ acknowledgedDialog: false }, () => {
                    //setTimeout(this.resetStack(), 1000);
                  });
                }}
              />
            </DialogFooter>
          }
        >
          <DialogContent
            style={{
              backgroundColor: 'white',
              justifyContents: 'center',
              alignItems: 'center'
            }}
          >
            <Video
              source={require('../assets/images/success-tick.mp4')}
              rate={1.0}
              volume={1.0}
              isMuted={true}
              resizeMode='contain'
              shouldPlay
              isLooping
              style={{ width: 250, height: 250 }}
            />

            <Text>All Set! Article Acknowledged!</Text>
          </DialogContent>
        </Dialog>

        {!!this.state.questions.length > 0 && this.state.completed === false && (
          <View style={{ height: height }}>
            <Question
              showAnswer={this.state.showAnswer}
              onSelect={answer => {
                this.setState({ showAnswer: true });
                var that = this;
                setTimeout(function() {
                  that.submitAnswer(that.state.current, answer);
                  that.setState({ showAnswer: false });
                }, 3000);
              }}
              question={this.state.questions[this.state.current]}
              correctPosition={Math.floor(Math.random() * 3)}
              current={this.state.current}
            />
          </View>
        )}

        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          {this.state.completed === true && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 25 }}>Quiz Completed</Text>
              <Text>Correct Answers: {this.state.results.correctAnswers}</Text>
              <Text>
                Incorrect Answers:{' '}
                {this.state.totalqns - this.state.results.correctAnswers}
              </Text>
              <Text>
                Percentage Score :{' '}
                {Math.round(
                  (this.state.results.correctAnswers / this.state.totalqns) *
                    100
                )}
                %
              </Text>
              <Text>Total Tries:{this.state.results.attemptedTries} </Text>
              {this.displayAckOrRetry()}
            </View>
          )}
        </View>

        <Spinner
          //visibility of Overlay Loading Spinner
          visible={this.state.loadingSpinner}
          //Text with the Spinner
          //textContent={'Loading...'}
          //Text style of the Spinner Text
          textStyle={styles.spinnerTextStyle}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: '100%'
  },

  loadingQuestions: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = state => {
  console.log('state:', state);
  return { user: state.user.userData, email: state.user.emailData };
};

export default connect(mapStateToProps)(QuizScreen);
