var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var fs = require("fs");
var game = require('./game');
var twitchirc = require('./twitchirc');

var app = express();
var currentMessages = [];
var chalk = require('chalk');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

setInterval(function () {
  currentMessages = twitchirc.getCurrentMessages();
  voteHash = consumeMessages(currentMessages);

}, 15000);

twitchirc.startIrcFeed();

var consumeMessages = function(messages) {
  "use strict";
  var votes = [];

  Object.keys(messages).forEach(function(key) {
    votes.push(messages[key]);
  });

  // here's where we'd get the valid ones
  var legalMoves = game.getValidMoves(votes);
  printVotes(sortVotes(countVotes(legalMoves)));
  return votes;
};

var countVotes = function(voteList) {
  return voteList.reduce(function(result, current) {
    console.log(result, current, voteList);
    if (typeof(result[current]) === "undefined") {
      result[current] = 1;
    } else {
      result[current] += 1;
    }
    return result;
  }, {});
};

 var sortVotes = function(votes) {
     var sortedVotes = [];
     var done = false;
     Object.keys(votes).forEach(function(language) {
      // sortedVotes.forEach(function(element, index, array) {
         for (var i = 0; i < sortedVotes.length && !done; i++) {
             console.log("language", language, "votes[language]", votes[language]);
             if (sortedVotes.length === 0) {
                 sortedVotes.push({
                     "langName": language,
                     "totalVotes": votes[language]
                 });
                 done = true;
             } else if (votes[language] > sortedVotes[i]["totalVotes"]) {
                 sortedVotes.splice(i, 0, {
                     "langName": language,
                     "totalVotes": votes[language]
                 });
                 done = true;
             }
         }
         if (!done) {
             sortedVotes.push({
                 "langName": language,
                 "totalVotes": votes[language]
             });
         }
         done = false;
     });
     return (sortedVotes);
 };

  var printVotes = function(votes) {

    if(votes == undefined || votes.length === 0) {
        // console.log(chalk.red("Sorry - voter apathy is at an all time high!"));
    } else {
        console.log("The winner is:\t", chalk.green(votes[0]["langName"]), 
                    "with", chalk.green(votes[0]["totalVotes"]), (votes[0]["totalVotes"]>1)?"votes!":"vote!");
        for (var i = 1; i < votes.length; i++) {
            if (i ===1) {

                console.log("\nAnd your runners up!");
            }
            console.log("             \t", chalk.yellow(votes[i]["langName"]), 
                    ":", chalk.yellow(votes[i]["totalVotes"]));
        }
    }
 };