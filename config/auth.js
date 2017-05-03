// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : '619846698210222',
        'clientSecret'    : 'd8adaba88b92c99f6d365900729e0c23',
        //'callbackURL'     : 'http://sharenify.com/auth/facebook/callback',
        'callbackURL'     : 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.9/me?fields=first_name,last_name,email'

    },

    'twitterAuth' : {
        'consumerKey'        : 'DW5daICN4k7SoS5IXvcqX5B8D',
        'consumerSecret'     : '8wxuGkDBKBGjiRkVCoDZY2KgVQs5HvRWxwiwkTt7nbIxbKZGnI',
        //'callbackURL'        : 'http://sharenify.com/auth/twitter/callback'
        'callbackURL'        : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'         : '960159422480-v57unhi6p5s4ommafep1b65skgq4bi64.apps.googleusercontent.com',
        'clientSecret'     : 'EPv2YJr69i1uwJNAIf2TtMi4',
        //'callbackURL'      : 'http://sharenify.com/auth/google/callback'
        'callbackURL'      : 'http://localhost:8080/auth/google/callback'
    }

};
