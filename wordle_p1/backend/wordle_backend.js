/**
 * read    GET - Safe, Idempotent, Cachable
 * update  PUT - Idempotent
 * delete  DELETE - Idempotent
 * create  POST
 *
 * https://restfulapi.net/http-methods/
 * https://restfulapi.net/http-status-codes/
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
 * https://restfulapi.net/rest-put-vs-post/
 **/

const port = 8000; 
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const fs = require('fs').promises;
const Wordle = require("./model.js");

const database = {};
const sessions = {};
var words = ["words"]; // just in case!!
let id = 1;

/******************************************************************************
 * word routines
 ******************************************************************************/

async function loadWords() {
    try {
        const data = await fs.readFile('./words.5', 'utf8');
        words = data.split("\n");
    } catch (err) {
        console.error('Error loading words: ', err);
    }
}

(async () => {
	await loadWords();

/******************************************************************************
 * middleware
 ******************************************************************************/
app.use(express.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser()); // cookies 

// https://expressjs.com/en/starter/static-files.html
// app.use(express.static('static-content')); 

/******************************************************************************
 * routes
 ******************************************************************************/

app.get('/api/username/', function (req, res) {
	let sessionID = req.cookies['sessionID'];
	let username;
	if (sessionID && sessionID in sessions) {
		username = sessions[sessionID];
	} else {
		let wordle=new Wordle(words);
		username = wordle.getUsername();
		sessionID = id;
		sessions[sessionID] = username;
		id += 1;
		res.cookie('sessionID', sessionID, {maxAge: 3600000});
	}
	res.json({"username": username});
});

app.put('/api/username/:username/newgame', function (req, res) {
	let username=req.params.username;
	let target;
	if(!(username in database)){
		let wordle=new Wordle(words);
		wordle.setUsername(username);
		database[username]=wordle;
	} 
	database[username].reset();
	target = database[username].target;
	res.json({'target': target});
});

// Add another guess against the current secret word
app.post('/api/username/:username/guess/:guess', function (req, res) {
	let username=req.params.username;
	let guess=req.params.guess;

	if(! username in database){
		res.status(409);
		res.json({"error":`${username} does not have an active game`});
		return;
	}
	var data = database[username].makeGuess(guess);
	res.json(data);
});

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

})();