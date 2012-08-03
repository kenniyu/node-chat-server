
/**
 * Module dependencies.
 */

var express = require('express'),
		routes = require('./routes'),
		connect = require('connect'),
		ejs = require('ejs'),
		nowjs = require('now');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(3000, function(){
  console.log("Chat server listening on port %d in %s mode", app.address().port, app.settings.env);
});

var everyone = nowjs.initialize(app),		// everyone is initialized
		usersHash = {},
		usersCount = 1;

// when a client connects to this page
nowjs.on('connect', function() {	
	// get user data
	var user = this.user,
			clientId = user.clientId,
			username = 'user' + usersCount;
						
	// set user id and name
	userKey = clientId;

	userValue = {
		id: clientId,
		username: username
	}
	
	
	// add user to hash
	usersHash[userKey] = userValue;

	// increment user count
	usersCount++;	
	
	// broadcast join
	
	userObj = usersHash[clientId];
	// broadcast_message(user_obj, 'join');
	
	// update everyone's client list
	// updateUsersList();
});

// when a client disconnects from the page
nowjs.on('disconnect', function() {
	var clientId = this.user.clientId,
			userObj	= usersHash[clientId];
	// broadcast_message(user_obj, 'leave');
	delete usersHash[clientId];
	// everyone_update_clients_list();
});

everyone.now.submitChat = function(message) {
	var clientId 	= this.user.clientId,
			userObj		= usersHash[clientId];
	everyone.now.updateChat(userObj, message);
}

function updateUsersList() {
	everyone.now.updateUsersList(usersHash);
}

// encode HTML
function encodeHTML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function urlify(text) {
	var urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlRegex, function(url) {
		return '<a href="' + url + '" target="_blank">' + url + '</a>';
	});
}