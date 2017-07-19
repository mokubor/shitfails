'use strict'

const request = require('request');
const index = require('./index');

module.exports = {
	sendText: function(sender, text){
		var messageData = {text: text};
		//console.log(messageData);
		sendRequest(sender, messageData);
	},

	decideResponse: function(sender, text1){
		var text = text1.toLowerCase();
		
		if(text.includes("hello") || text.includes("hi")|| text.includes("hey")){
			/*send some pleasant message. 
			*/

		}
		else if(text.includes("greeting")){
			/**
				Check if users facebook id is linked.
				if yes, display main menu. 
				else send linking message
			*/
			this.sendText(sender, "Account would be linked at this step." )
		}
		else{
			this.sendText(sender, "Text echo: "+ text.substring(0, 100));
		}
	},

	addPersistentMenu: function(){
		this.addGetStartedButton();
		request({
			url: "https://graph.facebook.com/v2.8/me/messenger_profile",
			qs: {access_token: index.page_access_token},
			method: "POST",
			json:{
				persistent_menu : [
				{
					locale : "default",
					composer_input_disabled : false,
					call_to_actions : [
						{
							type: "nested",
							title: "Make A Transaction",
							call_to_actions : [
								{
									type: "postback",
									title: "Purchase Airtime",
									payload: "AIRTIME_PURCHASE"
								},
								{
									type: "postback",
									title: "Transfer Money",
									payload: "TRANSFER"
								}
							]
						},
						{
							type: "postback",
							title: "Balance Check",
							payload: "CHECK_BALANCE"
						},
						{
							type: "postback",
							title: "Manage Account Alerts",
							payload: "MANAGE_ALERTS"
						}
					]
				}]
			}
		}, function(error, response, body) {
			console.log("adding menu" + response);
			if(error){
				console.log('sending error');
				console.log('Error sending messages: ', error);
			}else if(response.body.error){
				console.log('response body error');
				console.log('Error: ', response.body.error);
			}
		});
	},

	removePersistentMenu: function(){
 		request({
    		url: 'https://graph.facebook.com/v2.8/me/messenger_profile',
    		qs: { access_token: index.page_access_token },
    		method: 'DELETE',
    		json:{
        		fields : [
        			"persistent_menu"
        		]
    		}

		}, function(error, response, body) {
    		console.log("removing menu" + response.body);
    		if (error) {
    			console.log('sending error')
       			console.log('Error sending messages: ', error);
    		} else if (response.body.error) {
    			console.log('response body error');
        		console.log('Error: ', response.body.error);
    		}
		});
 	},

 	addGetStartedButton: function(){
 		request({
    		url: 'https://graph.facebook.com/v2.8/me/messenger_profile',
    		qs: { access_token: index.page_access_token },
    		method: 'POST',
    		json:{
        		get_started : {
        			payload : "GREETING"
        		}
    		}
		}, function(error, response, body) {
    		console.log("adding get started button" + response);
    		if (error) {
    			console.log('sending error')
       			console.log('Error sending messages: ', error);
    		} else if (response.body.error) {
    			console.log('response body error');
        		console.log('Error: ', response.body.error);
    		}
		});
 	}, 

 	removeGetStartedButton: function(){
 		request({
    		url: 'https://graph.facebook.com/v2.8/me/messenger_profile',
    		qs: { access_token: index.page_access_token },
    		method: 'DELETE',
    		json:{
        		fields : [
        			"get_started"
        		]
    		}

		}, function(error, response, body) {
    		console.log("removing get started button" + response.body);
    		if (error) {
    			console.log('sending error')
       			console.log('Error sending messages: ', error);
    		} else if (response.body.error) {
    			console.log('response body error');
        		console.log('Error: ', response.body.error);
    		}
		});
 	}



};

function sendLinkingMessage(sender, text){
	var messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
						"title":"Welcome to Bank 737",
						"subtitle": "Simple Banking",
						"image_url":"http://thengmag.com/blogimages/gtbank-lead.jpg",
						"buttons":[{
							"type": "account_link",
							"url": "",
							"title": "Link Account"
						}]
					}
				]
			}
		}
	}

	sendRequest(sender, messageData);
}

function sendRequest(sender, messageData){
	request({
		url: 'https://graph.facebook.com/v2.8/me/messages',
		qs: {access_token : index.page_access_token},
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
