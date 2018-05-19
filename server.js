var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path     = require('path');
//WEBSOCKET
var WebSocketServer = require('ws').Server;
var PORT = 8087;
var wss = new WebSocketServer({port: PORT});
var messages = [];



var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport').passport(passport); // pass passport for configuration


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport, path, express); // load our routes and pass in our app and fully configured passport



// websocket ===================================================================

wss.on('connection', function (ws) {
    messages.forEach(function(message){
        ws.send(message);
    });
    ws.on('message', function (message) {
        messages.push(message);
        console.log('Message Received: %s', message);
        wss.clients.forEach(function (conn) {
            conn.send(message);
        });
    });
});

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);





