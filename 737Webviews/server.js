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
	
	send_verification(req.body.number);
  res.writeHead(200, {'content-type': 'text/json' });
  res.write( JSON.stringify({phone: req.body.number}) );
	res.end('\n');
    
})

app.post('/verify_code', function(req, res){
	/**
	Check Verification code sent by system against users input found in req.body.verify
	Check backend database if user is profiled for 737 service
	-1 return status for invalid verification code
	0 return status for non-737 user
	1 return status if already profiled for 737
	*/
	console.log('IN verify code');
	console.log("SENT FROM VIEW: " + req.body.verify);
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

app.post('/make_user', function(req, res) {
	console.log("POST DATA", req.body);
	/*var user = new User({name: req.body.name, phone: req.body.phone, seventhreesevenstatus: req.body.seventhreesevenstatus, userid: req.body.userid});
	  // try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	  user.save(function(err) {
	    // if there is an error console.log that something went wrong!
	    if(err) {
	      console.log('something went wrong');
	    } else { // else console.log that we did well and then redirect to the root route
	      console.log('successfully added a user!');
	      res.redirect('/');
	    }
	  })*/
})
// listen on 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})

/*
#########################################################################################################
Functions to be completed by APPDEV
*/

/*
Send OTP or verification code. 
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











