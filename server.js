// server.js

// set up ======================================================================
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var favicon  = require('express-favicon');
var flash    = require('connect-flash');
var upload   = require('express-fileupload');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// adding favicon
app.use(favicon(__dirname + '/public/favicon.png'));

// upload files
app.use(upload({
  limits: {fileSize: 50 * 1024 * 1024 },
}));

app.get("profile",function(req,res){
  res.sendFile(__dirname+"/profile.ejs");
})

app.post('/upload', function(req, res) {
  if (req.files) {
    var file = req.files.filename,
      filename = file.name;
    file.mv("./uploads/" + filename, function(err) {
      if(err) {
        console.log(err)
        res.send("error occured")
      }
      else {
        res.send("Done!")
      }
    })
  }
})

//display files
var fs = require('fs');
fs.readdir('./uploads', function (err, files) {
  if (err) throw err;

  var filenames = [];
  for (var index in files) {
    console.log(files[index]);
    filenames.push(files[index]);
  }

  // do something with "filenames"
  // ['file1.js', 'file2.js', 'file3.js']
});

// required for passport
app.use(session({
    secret: 'shelovesit', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('srv-Sharenify started on ' + port);
