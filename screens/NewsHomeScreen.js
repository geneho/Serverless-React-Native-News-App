import React from 'react';
import { Font } from 'expo';
import { Image } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'native-base';
import ImageViewer from 'react-native-image-zoom-viewer';
import Placeholder, {
  Line,
  Media,
  Paragraph,
  ImageContent
} from 'rn-placeholder';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ActivityIndicator,
  Dimensions,
  SafeAreaView
} from 'react-native';

import { connect } from 'react-redux';

class NewsHomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <TouchableOpacity onPress={navigation.getParam('changeLanguage')}>
          <Ionicons
            name='md-globe'
            size={32}
            style={{ marginRight: 10 }}
            onPress={navigation.getParam('changeLanguage')}
          />
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);
    const url = 'DEFAULT LOADER IMAGE HERE/OR HARDCODED IMAGE URL ';
    this.state = {
      modalVisible: false,
      isReady: false,
      error: false,
      acknowledgeVisible: false,
      chineseLanguageToggle: false,
      englishNewsContent: '',
      englishNewsTitle: '',
      chineseNewsAvailable: false,
      newsContent: {
        AuthorDateTime: '',
        NewsContent: '',
        newsID: '',
        Tags: '',
        Title: '',
        Image: url
      }
    };
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  componentDidMount() {
    let id = this.props.navigation.getParam('id');
    console.log(id);
    this.retrieveNewsContent(id);
    this.retrieveQuizResults();

    this.setState({
      acknowledgeVisible: false
    });

    //for the change language, fucking ley chay
    this.props.navigation.setParams({ changeLanguage: this._changeLanguage });

    console.log('state:' + this.state.acknowledgeVisible);
  }

  _changeLanguage = () => {
    console.log('CHINESE LANGUAGE!!!');
    if (this.state.chineseLanguageToggle == false) {
      if (this.state.chineseNewsAvailable == true) {
        this.setState({ chineseLanguageToggle: true });
        this.state.newsContent.NewsContent = this.state.newsContent.chineseNewsContent;
        this.state.newsContent.Title = this.state.newsContent.chineseNewsTitle;
      } else {
        alert('Unable to find other language variants for this article');
      }
    } else {
      //if its in chinese and need change back to english
      this.setState({ chineseLanguageToggle: false });
      this.state.newsContent.NewsContent = this.state.englishNewsContent;
      this.state.newsContent.Title = this.state.englishNewsTitle;
    }
  };

  retrieveQuizResults = async () => {
    /*
    1.Get email from redux state
    2.retrieveQuizResults
      Store in state 
      Set boolean
    */

    console.log('RetrieveQuizResult Mtd--');
    const response = await fetch(`API ADDRESS HERE` + this.props.email);
    const data = await response.json();

    console.log(data);

    if (data.Count != 0) {
      let obj = JSON.parse(data.Items[0].resultsObjectTable);

      console.log('Obj');
      console.log(obj);
      var valueToSearch = this.props.navigation.getParam('id');

      let objA = obj.find(objA => objA.newsID == valueToSearch);

      console.log(objA);
      if (objA != undefined) {
        console.log('found');
        this.setState({
          acknowledgeVisible: false
        });
      } else {
        console.log('not found');
        this.setState({
          acknowledgeVisible: true
        });
      }
    } else {
      //no data (new user) so can acknowledge any
      this.setState({
        acknowledgeVisible: true
      });
    }
  };

  retrieveNewsContent(id) {
    return fetch('API ADDRESS HERE' + id)
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson.Count);
        if (responseJson.Count != '0') {
          console.log(responseJson.Items[0]);
          this.setState(
            {
              newsContent: responseJson.Items[0],
              englishNewsContent: responseJson.Items[0].NewsContent,
              englishNewsTitle: responseJson.Items[0].Title,
              isReady: true,
              id: id
            },
            function() {
              console.log('id:' + this.state.id);
            }
          );

          //check if there is any chineseNewsAvailable
          if (
            'chineseNewsContent' in responseJson.Items[0] &&
            responseJson.Items[0].chineseNewsContent != ''
          ) {
            this.setState({ chineseNewsAvailable: true });
          } else {
            this.setState({ chineseNewsAvailable: false });
          }
        } else {
          this.setState({
            error: true,
            isReady: true
          });
          console.log('Unexpected Error Occurred!');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    let that = this;
    const win = Dimensions.get('window');
    //URL IMAGE TO DO
    //const images = [{url: 'https://avatars2.githubusercontent.com/u/7970947?v=3&s=460',}]
    const images = [
      {
        url: this.state.newsContent.Image
      }
    ];

    return (
      <View style={styles.topContainer} key={this.state.uniqueValue}>
        {/* Main Image */}
        <TouchableOpacity
          onPress={() => {
            this.setModalVisible(true);
          }}
        >
          <Image
            //source={{ uri: `${this.state.newsContent.Image}` }}
            source={{ uri: this.state.newsContent.Image }}
            style={{
              width: win.width,
              height: 200,
              borderWidth: 1,
              borderColor: 'black'
            }}
            PlaceholderContent={<ActivityIndicator />}
          />
        </TouchableOpacity>

        {/*Pop up full image modal */}
        <Modal
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(!this.state.modalVisible);
          }}
        >
          <SafeAreaView
            style={{
              flex: 0.12,
              justifyContent: 'center',
              backgroundColor: 'white'
            }}
          >
            <TouchableOpacity
              style={{ alignItems: 'center', backgroundColor: 'white' }}
              onPress={() => this.setModalVisible(!this.state.modalVisible)}
            >
              <Text
                style={{
                  color: 'blue',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center'
                }}
              >
                Close Image
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
          <ImageViewer imageUrls={images} />
        </Modal>

        <Paragraph
          style={{ paddingTop: 10 }}
          animation='fade'
          lineNumber={10}
          textSize={14}
          lineSpacing={8}
          color='#D3D3D3'
          width='100%'
          lastLineWidth='70%'
          firstLineWidth='50%'
          isReady={this.state.isReady}
        >
          {null}
        </Paragraph>

        {!!this.state.isReady && !this.state.error && (
          <ScrollView>
            <View style={styles.container}>
              <Text style={styles.customFontsHeader}>
                {that.state.newsContent.Title}
              </Text>

              <Text style={styles.customFontsFooter}>
                {that.state.newsContent.AuthorDateTime}
              </Text>
            </View>

            {/*Main text frame*/}
            <View style={styles.container}>
              <Text style={styles.customFonts}>
                {that.state.newsContent.NewsContent}
              </Text>
            </View>

            <View style={styles.newDefaultContainer}>
              <Text style={styles.customTagFonts}>
                {that.state.newsContent.Tags}
              </Text>
            </View>

            {!!this.state.acknowledgeVisible && (
              <View style={styles.footerContainer}>
                <Button
                  block
                  warning
                  style={{ width: '100%', alignSelf: 'center' }}
                  raised={true}
                  onPress={() => {
                    console.log(
                      'Before: ' + this.state.chineseLanguageToggle
                    ) ||
                      this.props.navigation.navigate('QuizScreen', {
                        id: this.state.id,
                        chineseLanguage: this.state.chineseLanguageToggle
                      }) ||
                      this.setState({
                        acknowledgeVisible: false
                      });
                  }}
                >
                  <Text>Acknowledge</Text>
                </Button>
              </View>
            )}
          </ScrollView>
        )}

        {!!this.state.error && (
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text>
              Seems like there's a loading issue. Please try again later.
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingRight: 10
  },
  newDefaultContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  footerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    paddingLeft: 10,
    paddingRight: 10
  },
  customFonts: {
    marginTop: '2%',
    fontFamily: 'neue-haas-unica-pro-regular',
    fontSize: 14
  },
  customFontsHeader: {
    margin: 5,
    fontFamily: 'BebasNeue-Bold',
    fontSize: 28,
    textAlign: 'center'
  },
  customFontsFooter: {
    marginTop: '2%',
    color: 'grey',
    fontSize: 12,
    fontFamily: 'neue-haas-unica-pro-regular',
    alignSelf: 'center'
  },
  customTagFonts: {
    fontSize: 12,
    fontFamily: 'neue-haas-unica-pro-regular'
  }
});

const mapStateToProps = state => {
  console.log('state:', state);
  return { user: state.user.userData, email: state.user.emailData };
};

export default connect(mapStateToProps)(NewsHomeScreen);
