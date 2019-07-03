const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const cors = require('cors');

mongoose.Promise = global.Promise;

// Setting up port
var PORT = process.env.PORT || 8000;
var app = express();

app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));

const dbConfig = require('./config/dbconfig.js');

mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
}).then(() => {
  console.log("successfuly connected to the database");
}).catch(err => {
  console.log('couuld not connect to database . Exiting now...',err);
  process.exit();
});

mongoose.set('debug', true);



// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


require('./models/Users');
app.use(require('./routes'));
require('./config/passport');

//this will listen to and show all activities on our terminal to 
//let us know what is happening in our app
app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });