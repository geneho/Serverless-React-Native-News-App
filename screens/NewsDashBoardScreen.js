import React, { Component, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableWithoutFeedback,
  ScrollView,
  RefreshControl,
  AsyncStorage,
  TouchableOpacity
} from 'react-native';
import Carousel, {
  ParallaxImage,
  Pagination
} from 'react-native-snap-carousel';
import { sliderWidth, itemWidth } from '../styles/SliderEntry.style';
import SliderEntry from '../components/SliderEntry';
import styles, { colors } from '../styles/index.style';
import { Card, ButtonGroup } from 'react-native-elements';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button } from 'native-base';
import moment from 'moment';
import Placeholder, {
  Line,
  Media,
  Paragraph,
  ImageContent
} from 'rn-placeholder';
import Toast from 'react-native-root-toast';
import { connect } from 'react-redux';
import { Auth } from 'aws-amplify';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
//Plugin from https://github.com/archriss/react-native-snap-carousel , take a look at ParallaxImage
const featuredNews = [
  {
    id: '1',
    title: 'Loading',
    subtitle: 'Please wait..',
    illustration: 'null',
    newsId: '1'
  },
  {
    id: '2',
    title: 'Loading',
    subtitle: 'Please wait..',
    illustration: 'null',
    newsId: '2'
  },
  {
    id: '3',
    title: 'Loading',
    subtitle: 'Please wait..',
    illustration: 'null',
    newsId: '3'
  }
];

const titles = [
  {
    id: 'Safety',
    name: 'Section1'
  },
  {
    id: 'KSL',
    name: 'Section2'
  }
];

const SLIDER_1_FIRST_ITEM = 1;

class NewsDashBoardScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
      isReady: false,
      featuredNews: featuredNews,
      refreshing: false,
      newsDefaultTopic: 'Safety',
      newsBackUp: '',
      selectedIndex: null
    };
    this.updateIndex = this.updateIndex.bind(this);
  }

  componentDidMount() {
    this.retrieveNewsList();
    this.retrieveFeaturedNewsList();
    //this.retrieveAcknowledgementList();

    console.log(
      'Props NewsDashBoard:' + this.props.user + ' , ' + this.props.email
    );

    Auth.currentSession()
      .then(data => console.log(data))
      .catch(err => console.log(err));

    async function registerForPushNotificationsAsync(username) {
      console.log('Username:' + username);

      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;

      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }

      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return;
      }

      // Get the token that uniquely identifies this device
      let token = await Notifications.getExpoPushTokenAsync();
      console.log('Token: ' + token);

      //Try To Retrieve If There is Device Id (Based on username , email = userName)
      const response = await fetch(`API ADDRESS HERE` + username);

      let bodyData = {
        email: username,
        token: JSON.stringify(token)
      };

      console.log(bodyData);

      const data = await response.json();
      console.log(data);
      if (data.Count != 0) {
        //means there is entry for this
        //check if token match , if matches do nothing,
        //if does not match, update token
        console.log('Existing Push Token Found');

        if (data.Items[0].token == token) {
          console.log('Token Match');
        } else {
          console.log("Token doesn't match");
          //update the existing token
          let response2 = await fetch('API ADDRESS HERE', {
            method: 'POST',
            header: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
          });

          let responseJson2 = await response2.json();
          console.log(responseJson2);
        }
      } else {
        //no entry, insert into dynamoDB
        let response = await fetch('API ADDRESS HERE', {
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyData)
        });

        let responseJson = await response.json();
        console.log(responseJson);
      }
    }

    registerForPushNotificationsAsync(this.props.email);
  }

  retrieveNewsList() {
    return fetch('API_ADDRESS_HERE')
      .then(response => response.json())
      .then(responseJson => {
        let sortedObj = responseJson.Items.sort(function(a, b) {
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
        console.log(sortedObj);
        this.setState({
          newsBackUp: sortedObj,
          news: sortedObj,
          isReady: true
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  retrieveFeaturedNewsList() {
    return fetch('API ADDRESS HERE')
      .then(response => response.json())
      .then(responseJson => {
        this.setState(
          {
            featuredNews: responseJson.Items
          },
          function() {
            console.log(responseJson);
          }
        );
      })
      .catch(error => {
        console.error(error);
      });
  }

  _renderItemWithParallax({ item, index }, parallaxProps) {
    return (
      <SliderEntry
        data={item}
        even={(index + 1) % 2 === 0}
        parallax={true}
        parallaxProps={parallaxProps}
      />
    );
  }

  _keyExtractor(item, index) {
    return index.toString();
  }

  updateIndex(selectedIndex) {
    console.log(selectedIndex);
    //change selected Value
    this.setState({ selectedIndex });
    let selectedValue;
    if (this.state.isReady == true) {
      if (selectedIndex == 0) {
        selectedValue = 'Safety';
      }
      if (selectedIndex == 1) {
        selectedValue = 'KSL';
      }
      let filteredResult = this.state.newsBackUp.filter(function(el) {
        return el.topic == selectedValue;
      });
      console.log(filteredResult);

      this.setState({
        news: filteredResult
      });
    } else {
      this.toast('Please wait for articles to finish loading');
      this.setState({
        selectedIndex: null
      });
    }
  }

  filterNews(id) {
    console.log(id);
    //using backup news state as we are modifying the news directly
    if (this.state.isReady == true) {
      let filteredResult = this.state.newsBackUp.filter(function(el) {
        return el.topic == id;
      });
      console.log(filteredResult);

      this.setState({
        news: filteredResult
      });
    } else {
      this.toast('Please wait for articles to finish loading');
    }
  }

  toast(msg) {
    let toast = Toast.show(msg, {
      duration: 3000,
      position: Toast.positions.BOTTOM,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0
    });
    setTimeout(function() {
      Toast.hide(toast);
    }, 3000);
  }

  _renderItem({ item, index }) {
    return (
      //Note: showsHorizontalScrollIndicator not working, need to investigate further(to remove scrollbar)
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={() => this.filterNews(item.id)}>
          <Text
            style={{
              paddingVertical: 10,
              paddingHorizontal: 30,
              fontWeight: 'bold'
            }}
          >
            {item.name}
          </Text>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }

  _renderNewsListItem({ item, index }) {
    if (item.status == 'approved') {
      return (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            this.props.navigation.navigate('NewsHomeScreen', {
              id: item.NewsId
            })
          }
        >
          <Card
            title={item.title}
            // image={require('../assets/images/sample.jpg')}>
            image={{ uri: item.image }}
          >
            <Text style={{ marginBottom: 10 }}>{item.content}</Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end'
              }}
            >
              <Ionicons
                name='md-time'
                size={14}
                style={{ paddingRight: 3, color: 'grey' }}
              />
              <Text style={{ fontSize: 12, color: 'grey' }}>
                {moment(new Date(item.dateTime)).fromNow()}
              </Text>
            </View>
            <Button
              block
              warning
              //backgroundColor='#F0AD4E'
              style={{
                marginLeft: 0,
                marginRight: 0,
                marginBottom: 0
              }}
              onPress={() =>
                this.props.navigation.navigate('NewsHomeScreen', {
                  id: item.NewsId
                })
              }
            >
              <Text>VIEW NOW</Text>
            </Button>
          </Card>
        </TouchableOpacity>
      );
    }
  }

  _onRefresh = () => {
    this.setState({ refreshing: true, selectedIndex: null });

    this.retrieveFeaturedNewsList();
    this.retrieveNewsList().then(() => {
      this.setState({ refreshing: false });
    });
  };

  render() {
    const { slider1ActiveSlide } = this.state;
    const buttons = ['Button1', 'Button2'];
    const { selectedIndex } = this.state;

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        <View style={{ flex: 0.8, justifyContent: 'center' }}>
          <Text
            style={{
              fontFamily: 'BebasNeue-Bold',
              fontSize: 28,
              marginTop: 5,
              textAlign: 'center'
            }}
          >
            Featured
          </Text>
          <View style={{ flex: 1 }}>
            <Carousel
              ref={c => (this._slider1Ref = c)}
              data={this.state.featuredNews}
              renderItem={this._renderItemWithParallax}
              sliderWidth={sliderWidth}
              itemWidth={itemWidth}
              hasParallaxImages={true}
              firstItem={SLIDER_1_FIRST_ITEM}
              inactiveSlideScale={0.94}
              inactiveSlideOpacity={0.7}
              // inactiveSlideShift={20}
              containerCustomStyle={styles.slider}
              contentContainerCustomStyle={styles.sliderContentContainer}
              loop={true}
              loopClonesPerSide={2}
              autoplay={true}
              autoplayDelay={500}
              autoplayInterval={3000}
              onSnapToItem={index =>
                this.setState({ slider1ActiveSlide: index })
              }
            />
            {/* <Pagination
                  dotsLength={ENTRIES1.length}
                  activeDotIndex={slider1ActiveSlide}
                  containerStyle={styles.paginationContainer}
                  dotColor={'rgba(255, 255, 255, 0.92)'}
                  dotStyle={styles.paginationDot}
                  inactiveDotColor={colors.black}
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                  carouselRef={this._slider1Ref}
                  tappableDots={!!this._slider1Ref}
                /> */}
          </View>

          <View style={{ flex: 1 }}>
            {/* 
            <View style={{ height: 40 }}>
              <FlatList
                style={{ borderWidth: 1, borderColor: 'grey' }}
                data={titles}
                keyExtractor={this._keyExtractor.bind(this)}
                renderItem={this._renderItem.bind(this)}
                horizontal={true}
              />
            </View>
            */}
            <View>
              <ButtonGroup
                onPress={this.updateIndex}
                selectedIndex={selectedIndex}
                buttons={buttons}
                containerStyle={{
                  height: 40,
                  width: '100%',
                  marginLeft: 0
                }}
                textStyle={{ fontWeight: 'bold' }}
                selectedButtonStyle={{ backgroundColor: '#F0AD4E' }}
              />
            </View>
            {/* 
            <View style={{ height: 20 }}>
              <Text
                style={{
                  fontFamily: 'BebasNeue-Bold',
                  fontSize: 23,
                  textAlign: 'center'
                }}
              >
                Articles
              </Text>
            </View>
            */}
            <FlatList
              style={{ borderColor: 'grey', flex: 0 }}
              data={this.state.news}
              initialNumToRender={200}
              keyExtractor={this._keyExtractor.bind(this)}
              renderItem={this._renderNewsListItem.bind(this)}
            />
            <View />
            <View style={{ marginTop: 20 }}>
              <ImageContent
                animation='fade'
                position='left'
                hasRadius
                lineNumber={5}
                textSize={14}
                lineSpacing={5}
                color='#D3D3D3'
                width='100%'
                lastLineWidth='30%'
                firstLineWidth='10%'
                isReady={this.state.isReady}
              >
                {null}
              </ImageContent>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

// const mapStateToProps = state => (

// {
//   user: state.user.userData,
//   email: state.user.emailData
// });

const mapStateToProps = state => {
  console.log('state:', state);
  return { user: state.user.userData, email: state.user.emailData };
};

export default connect(mapStateToProps)(NewsDashBoardScreen);
