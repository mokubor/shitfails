// require the path module
var path = require("path");
// require express and create the express app
var express = require("express");
// require bodyParser since we need to handle post data for adding a user
var bodyParser = require("body-parser");
/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gtchatbot');
var UserSchema = new mongoose.Schema({
 name: String,
 phone: String,
 seventhreesevenstatus: Number,
 userid: Number
})
var User = mongoose.model('User', UserSchema);*/

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// static content
app.use(express.static(path.join(__dirname, "./static")));
// set the views folder and set up ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

var url_parameters;
// root route
app.get('/', function(req, res) {
 // This is where we would get the users from the database and send them to the index view to be displayed.
 res.render('indexpage');
})


app.get('/home', function(req, res) {
 // This is where we would get the users from the database and send them to the index view to be displayed.
 res.render('home');
})

app.get('/action/:id', function(req, res) {
 // This is where we would get the users from the database and send them to the index view to be displayed.
 res.render('action', {id: req.params.id});
})


app.post('/get_user', function (req, res){
    // first parameter is the query document. Second parameter is the callback
  console.log('IN get user');
  console.log("SENT FROM VIEW: ", req.body);
	
	//retrieve url parameters like redirect uri etc
	url_parameters = req.body.url_params;
	
	send_verification(req.body.number);
  res.writeHead(200, {'content-type': 'text/json' });
  res.write( JSON.stringify({phone: req.body.number}) );
	res.end('\n');
    
})

/**
Check Verification code sent by system against users input found in req.body.verify
Check backend database if user is profiled for 737 service
-1 return value for invalid verification code
0 return status for non-737 user
 return status if already profiled for 737
*/
app.post('/verify_code', function(req, res){

	console.log('IN verify code');
	console.log("SENT FROM VIEW: " + req.body);
	check_verification(req.body.verify, function(result){
		if(result == '0'){//verification code does not match
			res.writeHead(200, {'content_type': 'text/json'});
			res.write(JSON.stringify({status: '-1'}));
			res.end('/n');
		}
		else{//verification code matches
			check_seventhreeseven_status(req.body.number, function(result){
				if(result == '0'){//fb users number is not profiled for 737
					res.writeHead(200, {'content_type': 'text/json'});
					res.write(JSON.stringify({status: '0'}));
					res.end('/n');
				}else{//fb users number is profiled for 737
					res.writeHead(200, {'content_type': 'text/json'});
					res.write(JSON.stringify({status: '1'}));
					res.end('/n');
				}
			});
		}
	});
})

/*
verify that user input pin is indeed pin attached to users 737 profile
true if it matches,
false if it does not
*/
app.post('/verify_pin', function(req, res){
	console.log('IN verify pin');
	console.log("SENT FROM VIEW: " + req.body);
	
	check_pin(req.body, function(result){
		if(result){
			res.writeHead(200, {'content_type': 'text/json'});
			res.write(JSON.stringify({isPin: true}));
			res.end('/n');
		}else{
			res.writeHead(200, {'content_type': 'text/json'});
			res.write(JSON.stringify({isPin: false}));
			res.end('/n');
		}
	});
	
})

/*
*/
app.post('/register_number', function(req, res){
	get_user_account(req.body.number, function(error, result){
		if(error){
			//come back
			var location = url_parameters.redirect_uri+
				'?account_linking_token='+
				url_parameters.account_linking_token;
			
			res.redirect(location);
		} else{
			confirm_card_details(req.body.card, result.account_id, function(error, validated){
				if(error){
					//come back
					var location = url_parameters.redirect_uri+
						'?account_linking_token='+
						url_parameters.account_linking_token;
			
					res.redirect(location);
				} else{
					if(validated){
						register_user(req.body.number, function(error, registered){
							if(error){
								//come back
								var location = url_parameters.redirect_uri+
									'?account_linking_token='+
									url_parameters.account_linking_token;
			
								res.redirect(location);
							}else{
								if(registered){
									res.writeHead(200, {'content_type': 'text/json'});
									res.write(JSON.stringify({isRegistered: false}));
									res.end('/n');
								}else{
									var location = url_parameters.redirect_uri+
										'?account_linking_token='+
										url_parameters.account_linking_token;
									
									res.redirect(location);
								}
							}
						});
						
					}else{
						var location = url_parameters.redirect_uri+
							'?account_linking_token='+
							url_parameters.account_linking_token;
			
						res.redirect(location);
					}
				}
			});
		}
	});
})

/*
This post method retrieves the users GT user id and nuban
Then saves all the details, phone number, facebook id, pin, nuban, account id, and status to DB
On successful save, redirect with fb redirect uri and linking token. 
*/
app.post('/link_user', function(req, res) {
	console.log("POST DATA", req.body);

	get_user_account(req.body.number, function(error, result){
		if(error){
			var location = url_parameters.redirect_uri+
				'?account_linking_token='+
				url_parameters.account_linking_token;
			
			res.redirect(location);
		}
		else{
			var user = new User({
				phoneNumber: req.body.number, 
				pin: req.body.pin, 
				status: true, 
				accountID: result.account_id,
				nuban: result.nuban,
				facebookID: url_parameters.sender 
			});
		
			user.save(function(err) {
	  	  if(err) {
	  	    console.log('Unable to add user with number '+req.body.number);
					var location = url_parameters.redirect_uri+
						'?account_linking_token='+
						url_parameters.account_linking_token;
			
					res.redirect(location);
	  	  } else {
	  	    console.log('Successfully added a user with number '+req.body.number);
					var location = url_parameters.redirect_uri+
						'?account_linking_token='+
						url_parameters.account_linking_token+
						'&authorization_code='+req.nody.number;
					res.redirect(location);
				}
			});
			
		}
	});
		
	
})
// listen on 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})

/*
#########################################################################################################
Functions to be completed by APPDEV. 
All current instructions return default test values. 
*/

/*
Send OTP or verification code to number provided
*/
function send_verification(number){

}

/*
if verification code sent by service  equals user input
return 1
else
return 0
*/
function check_verification(code, callback){
	var test_code = '123456';
	
	if( test_code == code ){
		callback('1');
	}else{
		callback('0');
	}
}


/*
if users number is profiled for 737 service return 
return 1
else
return 0
*/
function check_seventhreeseven_status(number, callback){
	var test_number = '08056059032';
	
	if(test_number == number){
		callback('1');
	}else{
		callback('0');
	}
}


/*
Access users 737 profile to compare their pre-registered pin to their input. 
return true if they match 
return false if they are not the same
*/
function check_pin(user, callback){
	var test_pin = '0720';
	
	//get 737 profile details for user.number and compare profile pin to user.pin
	
	if(user.pin == test_pin){
		callback(true);
	}else{
		callback(false);
	}
}

/*
Using the usern umber provided via facebook, 
retireve the account user_id (bra_code, cus_num) and 
Nuban for the primary account(i.e. 737 default)
*/
function get_user_account(number, callback){
	test_nuban = 0225303680;
	test_account_id = 2148166591;
	
	callback(JSON.stringify({
		nuban: test_nuban,
		account_id: test_account_id
	}));
}

/*
using the userid retrieved, confirm that the last 6 digits entered match users card details
return true if they match and false if not
*/
function confirm_card_details(card, user_id, callback){
	callback(true);
}

/*
call the process to register a user (using the provided number) for the 
GT 737 service.
*/
function register_user(number, callback){
	callback(true);
}










