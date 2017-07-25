'use strict'

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const messages = require('./messages');

const app = express();

app.set('port', (process.env.PORT || 6080));

//Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//read config values from json file
var config_file = fs.readFileSync('./config/default.json');
var config_values = JSON.parse(config_file);

//assign the values
const app_secret = config_values.appSecret;
const validation_token = config_values.validationToken;
const page_access_token = config_values.pageAccessToken;
const server_url = config_values.serverURL;

exports.page_access_token = page_access_token;

console.log(" ");
console.log(" ");
console.log(" ");
console.log(" ");
console.log(" ");
console.log(" ");


//Routes
app.get('/', function(req, res){
	res.send("hi, I am a fleeky chatbot");
});

app.get('/webview', function(req, res){
	res.redirect('https://fintech-webviews.herokuapp.com/home?param=seethis&another=seeanother');
});

app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === validation_token ){
		console.log("Token Validated");
		res.status(200).send(req.query['hub.challenge'])
	}
	else{
		console.log("Failed token validation, make sure the tokens match");
		res.status(403).send("Wrong token");
	}
});

//messages.addGetStartedButton();
//messages.removeGetStartedButton();
app.post('/webhook', function(req, res) {

	var messaging_events = req.body.entry[0].messaging;

	for(let i = 0; i < messaging_events.length; i++) {
		var event = messaging_events[i];
		var sender = event.sender.id;
		if(event.message && event.message.text){
			var text = event.message.text;
			console.log(text);
			//messages.sendText(sender, "Text echo: "+ text.substring(0, 100));
			messages.decideResponse(sender, text);
		}
		if(event.postback){
			var text = JSON.stringify(event.postback.payload);
			console.log(text);
			messages.decideResponse(sender,text);
			continue;
		}
	}

	res.sendStatus(200);
});

messages.addPersistentMenu();
//messages.removePersistentMenu();

/*function sendText(sender, text){
	var messageData = {text: text};
	//console.log(messageData);
	sendRequest(sender, messageData);
}

sendRequest: function(sender, messageData){
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token : page_access_token},
		method: 'POST',
		json: {
			recipient: {id : sender},
			message: messageData
		}
	}, function(error, response){
		if(error){
			console.log("sending an error");
		}else if(response.body.error){
			console.log("response body error");
		}
	});
}
*/

app.listen(app.get('port'), function(){
	console.log("running: port " + app.get('port'));
});