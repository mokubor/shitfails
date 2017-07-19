// require the path module
var path = require("path");
// require express and create the express app
var express = require("express");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/gtchatbot');
var UserSchema = new mongoose.Schema({
 name: String,
 phone: String,
 seventhreesevenstatus: Number,
 userid: Number
})
var User = mongoose.model('User', UserSchema);

var app = express();
// require bodyParser since we need to handle post data for adding a user
var bodyParser = require("body-parser");
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

app.get('/chatInterface', function(req, res) {
 // This is where we would get the users from the database and send them to the index view to be displayed.
 res.render('chat');
})

app.get('/action/:id', function(req, res) {
 // This is where we would get the users from the database and send them to the index view to be displayed.
 res.render('action', {id: req.params.id});
})
app.post('/get_user', function (req, res){
    // first parameter is the query document. Second parameter is the callback
    console.log('IN get user');
    console.log("SENT NUMBER: ", req.body);
    User.findOne({phone: req.body.number}, function (err, user){
        // loads a view called 'user.ejs' and passed the user object to the view!
        console.log(user)
        res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify(user) );
      	res.end('\n');

        // res.render('user', {user: user});
    })
    
})
app.post('/make_user', function(req, res) {
	console.log("POST DATA", req.body);
	var user = new User({name: req.body.name, phone: req.body.phone, seventhreesevenstatus: req.body.seventhreesevenstatus, userid: req.body.userid});
	  // try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	  user.save(function(err) {
	    // if there is an error console.log that something went wrong!
	    if(err) {
	      console.log('something went wrong');
	    } else { // else console.log that we did well and then redirect to the root route
	      console.log('successfully added a user!');
	      res.redirect('/');
	    }
	  })
})
// listen on 8000
var server = app.listen(8000, function() {
 console.log("listening on port 8000");
})
const {Wit, log} = require('node-wit');
const client = new Wit({accessToken: 'UC2FRHQWCW2LRF34ECB2XEE5S7L7ZJNJ'});
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
var io = require('socket.io').listen(server) 
io.sockets.on('connection', function (socket) {
  console.log("WE ARE USING SOCKETS!");
  console.log(socket.id);

  socket.on("user_sent", function (data){
    client.message(data.reason, {})
    .then((data) => {
      console.log('Yay, got Wit.ai response: ' + Object.keys(data.entities));
      if (Object.keys(data.entities) == "greetings"){
        socket.emit('server_response', {response: "What do you need help with?"});
      }
      else if (Object.size(data.entities) === 0){
        socket.emit('server_response', {response: "I didn't quite get that. Try rephrasing your question."});
      }
      else if (Object.keys(data.entities) == "contact"){
        socket.emit('server_response', {response: "Nice to meet you "+data._text+". What do you want to know?"});
      }
      else if(Object.keys(data.entities) == "intent"){
        if (data.entities.intent[0].value == "merchant_bot_info"){
          socket.emit('server_response', {response: "All merchants will have BOTs "});
        }
        else if (data.entities.intent[0].value == "merchant_tribe_post_info"){
          socket.emit('server_response', {response: "Merchant and Verified tribes’ posts are controlled, only an admin can post in these tribes. Followers can only like, share, comment and or buy posts. While ‘clan - tribe’ tribes have the option to enable or disable post by tribe members."});
        }
        else if (data.entities.intent[0].value == "tribe_creation_info"){
          socket.emit('server_response', {response: "A tribe can be created by Habari Admin and, existing clans with X number of active members can rise to become a tribe."});
        }
        else if (data.entities.intent[0].value == "clan_lifespan_info"){
          socket.emit('server_response', {response: "Clans will have expiry dates, after which if there’s no activity and several notifications sent to the admin of the clan, it will be deleted."});
        }
        else if (data.entities.intent[0].value == "clan_deletion_info"){
          socket.emit('server_response', {response: "Clans can be deleted by their admin but tribes cannot be deleted."});
        }
        else if (data.entities.intent[0].value == "clan_creation_info"){
          socket.emit('server_response', {response: "Users cannot create a clan with an existing clan or tribe name."});
        }
        else if (data.entities.intent[0].value == "village_tribe_difference_info"){
          socket.emit('server_response', {response: "A village is a private tribe where members join by invitation unlike a tribe which is public and anyone can join. Going public makes it faster for a transitioned clan to get discovered and grow to have more followers as users can easily search and add themselves to the tribe instead of requesting to be added."});
        }
      }
    })
    .catch(console.error);
    console.log('Someone clicked a button!  Reason: ' + data.reason);
    
})
})