var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var passport = require("passport");
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

var app = express();
require('dotenv').load();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());


var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = process.env.SECRET;


var strategy = new JwtStrategy( jwtOptions, function(jwt_payload, next) {
  next(null,true);
});

passport.use(strategy);

app.get("/", function(req, res) {
  res.json({ message: "Express server is running " });
});

app.post("/register", function(req, res) {
  var payload = {
    clientId : req.body.clientId ,
    subject :'Initiate registration to on-board device',
    issuer : 'https://mso.micronets.com',
    audience : 'https://cablelabs.idora.com',
    algorithm : "HS256",
    expiresIn: Math.floor( Date.now() / 1000) + (60 * 60)   // Expires in an hour
  };
  var token = jwt.sign( payload, jwtOptions.secretOrKey );
  res.json({message: "Ok", token: token});

});

app.get("/key", passport.authenticate('jwt', { session: false }), function(req, res){
  res.json({ key: process.env.SECRET });
});


app.get("/test", passport.authenticate('jwt', { session: false }), function(req, res){
  res.json({ message: "Success! You accessed a restricted resource using JWT token" });
});

app.get("/validate", passport.authenticate('jwt', { session: false }), function(req, res){
  const token = req.header('Authorization').split(" ")[1];
  var claims = jwt.decode( token , process.env.SECRET );

  // TODO : Remove fake logic.Add check user token logic
  if( claims.clientId != undefined ) {
    res.json({message:'User is valid'})
  }
  else {
    res.json({ message:'Error .... invalid user '})
  }

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
