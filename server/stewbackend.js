const express = require('express');
const schedule = require('node-schedule');
const messageService = require('./modules/messageService.js');
const stewService = require('./modules/stewService.js');
const moment = require('moment');

const app = express();

app.use(express.json());

let stews = [];

app.get('/send-notifications', function (req, res) {
	messageService.sendMessages();
	res.send("Done")
})

app.get('/stews', function (req, res) {

	stewService.getStews().then(response => {
		stews = response;
		res.send(response);
	});
});

app.post('/client-id', function (req, res) {

	const token = req.body.token;

	if (messageService.clientTokens.find(elem => elem == token) != undefined) {
		console.log("ID already present: " + token);
		res.send("ID already present: " + token);
	} else {

		messageService.clientTokens.push(token);
		console.log("Saved Id: " + token);
		res.send("Saved Id: " + token);

	}

});

schedule.scheduleJob('0 10 * * *', async () => {

	console.log("sending notifications at: " + moment().format('MMMM Do YYYY, h:mm:ss a'));

	stews = await stewService.getStews();

	let nextStew = null;

	try {
		nextStew = stews[0];
	} catch (error) {
		console.log("Error: " + error);
		
	}

	stews.forEach(stew => {
		if (stew.date < nextStew.date) {
			nextStew = stew
		}
	})

	const currentDate = new Date().getTime();

	try {
		const days = Math.round(((nextStew.date - currentDate) / (1000 * 3600 * 24)) + 0.5);
		if (days <= 0) {

			console.log("Sending Message for stew today");
			messageService.sendMessages("heute", nextStew);
		} else if (days <= 1) {

			console.log("Sending Message for stew in " + days);
			messageService.sendMessages("in " + days + " Tag", nextStew);
		}
		else {

			console.log("Sending Message for stew in " + days);
			messageService.sendMessages("in " + days + " Tagen", nextStew);
		}
	} catch (error) {
		console.log("No stew soon, " + error);
		messageService.sendMessages("in mehr als 10 Tagen", nextStew);
	}
})

app.listen(5000, function () {
	stewService.getStews().then(response => {
		stews = response;
		console.log('Example app listening on port 5000!');
	})
});
