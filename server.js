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
var rimraf   = require('rimraf');
var Busboy = require('busboy');

var path = require('path');
var mime = require('mime');

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
app.use(bodyParser.urlencoded({extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating

// adding favicon
app.use(favicon(__dirname + '/public/favicon.png'));

// upload files

app.post('/upload', function (req, res) {

  var bboy = new Busboy({
        headers : req.headers,
        limits  : {fileSize: 200, files: 1}
      });

      var limited = [];
      bboy.on('file', function(fieldname, file, filename, encoding, mimetype){
        file.on('limit', function() {
          // this is where you would remove data from wherever you were
          // storing it up until this point.
          // e.g. if you were writing to disk, remove the temporary file
          limited.push(filename);
        });

        // consume stream, e.g. write to temporary file on disk, etc.
        file.resume();
      });
      bboy.on('end', function() {
        var resp;
      if (limited.length) {
          res.statusCode = 413;
          resp = 'Ignored files:\n';
          resp += limited.join('\n');
        } else {
          res.statusCode = 200;
          resp = 'All files uploaded successfully';
        }
        res.end(resp);
      });
      req.pipe(bboy);

    // var busboy = new Busboy({
    //   headers: req.headers,
    //   limist: { files: 1, fileSize: 5000 }});
    //
    // var limited = [];
    // busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    //   file.on('limit', function() {
    //     // this is where you would remove data from wherever you were
    //     // storing it up until this point.
    //     // e.g. if you were writing to disk, remove the temporary file
    //     limited.push(filename);
    //   });
    //   file.resume();
    //   var saveTo = path.join('./uploads', filename);
    //   console.log('Uploading: ' + saveTo);
    //   file.pipe(fs.createWriteStream(saveTo));
    // });
    // busboy.on('finish', function() {
    //   var resp;
    //   if (limited.length) {
    //     res.statusCode = 413;
    //     resp = 'Ignored files:\n';
    //     resp += limited.join('\n');
    //     console.log('Upload complete');
    //     res.redirect('/profile');
    //   }
    // });
    // return req.pipe(busboy);

});

// app.use(upload({
//   limits: { fileSize: 200000000 }, // 200 000 000 bytes = 200 mb
// }));
//
// app.get("profile",function(req,res){
//   res.sendFile(__dirname+"/profile.ejs");
// })
//
// app.post('/upload', function(req, res) {
//   if (req.files) {
//     var file = req.files.filename,
//       filename = file.name;
//     file.mv("./uploads/" + filename, function(err) {
//       if(err) {
//         console.log(err)
//         res.send("error occured")
//       }
//       else {
//         res.send("Done!");
//     //     res.send('<ul>'
//     // + '<li>Download <a href="/new.jpg">new.jpg</a>.</li>'
//     // + '</ul>');
//       }
//     })
//   }
// })

// download files
app.get('/upload', function(req, res, next) {
  var file = req.params.file
  , path = __dirname + '/uploads' + file;

  res.download(path);
})

// app.get('/download', function(req, res) {
//
//   var file = __dirname + '/uploads/new.jpg';
//
//   var filename = path.basename(file);
//   var mimetype = mime.lookup(file);
//
//   res.setHeader('Content-disposition', 'attachment; filename=' + filename);
//   res.setHeader('Content-type', mimetype);
//
//   var filestream = fs.createReadStream(file);
//   filestream.pipe(res);
//   res.download(file); // Set disposition and send it.
//
// });

//display files
var fs = require('fs');
fs.readdir('./uploads', function (err, files) {
  if (err) throw err;

  var filenames = [];
  for (var index in files) {
    console.log(files[index]);
    filenames.push(files[index]);
  }
});

//expiration
fs.readdir('./uploads', function(err, files) {
  files.forEach(function(file, index) {
    fs.stat(path.join('./uploads', file), function(err, stat) {
      var endTime, now;
      if (err) {
        return console.error(err);
      }
      now = new Date().getTime();
      endTime = new Date(stat.ctime).getTime() + 60000; // 5 184 000 000 miliseconds = 60 days
      if (now > endTime) {
        return rimraf(path.join('./uploads', file), function(err) {
          if (err) {
            return console.error(err);
          }
          console.log('successfully deleted');
        });
      }
    });
  });
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
