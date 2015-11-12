var irc = require('irc');

var channelOwner = process.env.TWITCH_USER;
var password = process.env.TWITCH_AUTH;
var channel = '#' + channelOwner;

var options = {
	userName: channelOwner, // mandatory
	realName: 'nodeJS IRC client',
	// port: 6667,
	// localAddress: null,
	debug: true,
	showErrors: true,
	// autoRejoin: false,
	autoConnect: false,
	// channels: [channel],
	// secure: false,
	// selfSigned: falsße,
	// certExpired: false,
	// floodProtection: false,
	// floodProtectionDelay: 1000,
	sasl: true, // mandatory
	password: password // twitch token
		// stripColors: false,
		// channelPrefixes: "&#",
		// messageSplit: 512,
		// encoding: ''
};

// talk to twitch
var client = new irc.Client('irc.twitch.tv', channelOwner, options);
var currentVotes = {};
setInterval(consumeVotes, 15000);

exports.consumeVotes = function() {
	"use strict";
	var votes = [];

	Object.keys(currentVotes).forEach(function(key) {
		votes.push(currentVotes[key]);
		console.log("votes are: ", votes);
	});

	// here's where we'd get the valid ones
	var legalMoves = game.getValidMoves(votes);
	console.log("legalMoves are: ", legalMoves);
	console.log(countVotes(legalMoves));
	currentVotes = {};
};


exports.countVotes = function(voteList) {
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

exports.getIrcFeed = function() {

	client.connect(function() {
		console.log(channel);
		client.join(channel, function() {
			client.say(channel, "Hello Twitch!");
			client.addListener('message', function(from, to, message) {
				if (from !== channelOwner) {
					// global map of all msg
					currentVotes[from] = message;
				}
				console.log(from, to, message);
				// if (from !== channelOwner) {
				//  client.say(channel, message);
				// }
				// // put in db
				// db.serialize(function() {
				//  // preparing a statement
				//  var stmt = db.prepare("INSERT INTO Game_Command_History VALUES (?, ?)");
				//  stmt.run("msg:" + message, from);
				//  stmt.finalize();
				//  // give me these things in the db - query Game_Command_History
				//  db.each("SELECT rowid AS id, command, user FROM Game_Command_History", function(err, row) {
				//      console.log(row);
				//      console.log(row.id + ": " + row.command + ": " + row.user);
				//  });
				// });
				// db.close();
			});
		});
	});
};