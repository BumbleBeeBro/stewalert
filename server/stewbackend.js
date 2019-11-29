const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const { Expo } = require('expo-server-sdk');
const schedule = require('node-schedule');
const moment = require('moment');

const app = express();

let expo = new Expo();

app.use(express.json());

const url = 'https://www.stw-muenster.de/de/essen-trinken/mensen/da-vinci';

const clientTokens = [];

let stews = [];

let messages = [];

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };

const getStews = async () => {
	let response = await axios(url)

	const html = response.data;
	const $ = cheerio.load(html);

	const days = $('li.accordion-item');

	const eintoepfe = [];

	days.each(function () {
		const meals = $(this).find('div.food');

		const date = $(this).find('a.accordion-title').find('span').text().trim();

		//console.log(date);


		let eintopf = false;

		meals.each(function () {
			const meal = $(this).find('span.food-menu-title').text().trim();

			if (meal === 'Eintopf') {
				eintopf = true;
			}

			//console.log(meal);

			//console.log(eintopf);

		});

		if (eintopf) {
			eintoepfe.push({
				datestring: date.slice(-10),
				date: moment(date.slice(-10), 'DD.MM.YYYY').toDate().getTime(),
				eintopf: eintopf
			});
		}

	})

	return eintoepfe;

}

const sendMessages = (message) => {
	for (let token of clientTokens) {

		console.log("Starting to send Messages to token: " + token);

		if (!Expo.isExpoPushToken(token)) {
			console.error(`Push token ${token} is not a valid Expo push token`);
			continue;
		}

		messages.push({
			to: token,
			sound: 'default',
			body: "Den nächsten Eintopf gibt es " + message + "(" + stews[0].datestring + ")",
			title: "Eintopf Alert",
		});

		console.log("starting to send chunks");

		let chunks = expo.chunkPushNotifications(messages);
		let tickets = [];
		(async () => {
			for (let chunk of chunks) {
				try {
					let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
					console.log(ticketChunk);
					tickets.push(...ticketChunk);

				} catch (error) {
					console.error(error);
				}
			}
		})();

		let receiptIds = [];
		for (let ticket of tickets) {
			// NOTE: Not all tickets have IDs; for example, tickets for notifications
			// that could not be enqueued will have error information and no receipt ID.
			if (ticket.id) {
				receiptIds.push(ticket.id);
			}
		}

		console.log("waiting for receipts");

		let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
		(async () => {
			// Like sending notifications, there are different strategies you could use
			// to retrieve batches of receipts from the Expo service.
			for (let chunk of receiptIdChunks) {
				try {
					let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
					console.log(receipts);

					// The receipts specify whether Apple or Google successfully received the
					// notification and information about an error, if one occurred.
					for (let receipt of receipts) {
						if (receipt.status === 'ok') {
							continue;
						} else if (receipt.status === 'error') {
							console.error(`There was an error sending a notification: ${receipt.message}`);
							if (receipt.details && receipt.details.error) {
								// The error codes are listed in the Expo documentation:
								// https://docs.expo.io/versions/latest/guides/push-notifications#response-format
								// You must handle the errors appropriately.
								console.error(`The error code is ${receipt.details.error}`);
							}
						}
					}
				} catch (error) {
					console.error(error);
				}
			}
		})();

	}
}


app.get('/send-notifications', function (req, res) {
	sendMessages();
	res.send("Done")
})

app.get('/stews', function (req, res) {

	getStews(url).then(response => {
		stews = response;
		res.send(response);
	});
});

app.post('/client-id', function (req, res) {

	const token = req.body.token;

	if (clientTokens.find(elem => elem == token) != undefined) {
		console.log("ID already present: " + token);
		res.send("ID already present: " + token);
	} else {

		clientTokens.push(token);
		console.log("Saved Id: " + token);
		res.send("Saved Id: " + token);

	}

});

schedule.scheduleJob('0 10 * * *', () => {

	

	stews.forEach(stew => {

		const currentDate = new Date().getTime();

		const days = Math.round((stew.date - date) / (1000 * 3600 * 24));

		if (days <= 0) {
			console.log("sending notifications at: " + Date.now());
			getStews()
			sendMessages("heute");
		} else {
			console.log("sending notifications at: " + Date.now());
			getStews()
			sendMessages("in " + days + " Tagen");
		}
		stew.date
	})
	
	getStews()
	sendMessages();
})

app.listen(5000, function () {
	getStews(url).then(response => {
		stews = response;
		console.log('Example app listening on port 5000!');
	})
});
