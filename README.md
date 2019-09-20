# Serverless-React-Native-News-App
### A react native news app with acknowledgement/quiz built with AWS Serverless Stack


### Features:

Full aws serverless stack + Expo(React Native) App, API Gateway + Lambda + DynamoDB + Cognito (for authentication)

Login, ForgetPassword, Login with biometrics enabled

News Portal with acknowledge function (Able to know who acknowledge the news)

Able to switch language of the news (English/Chinese) or any other languages u prefer

Able to do multiple choice quiz before acknowledging


### Setup:

Change the splash image directory to your liking under app.json

Change app package to your preferred name under app.json

Tab1Screen: Change logo image to your liking. At Line 405 Tab1Screen.js

Search for "API ADDRESS HERE" , replace the api to your api of your choice (the parsing here is coded to suit AWS API Gateway)

This app uses AWS Serverless stack , you would need to create an aws account and use AWS Amplify
https://aws-amplify.github.io/docs/js/start?ref=amplify-rn-btn&platform=react-native

U would need to setup Amplify Auth (For login)

Setup your firebase for push notifications, add google-services.json to your project
root folder

### ToDo:

-Improve readme page

-Add api authentication

-Facebook style of liking and commenting

-Group Chat


Feel free to merge. 





