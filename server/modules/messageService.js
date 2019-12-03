const { Expo } = require('expo-server-sdk');

let expo = new Expo();

const clientTokens = [];

const sendMessages =  (message, stew) => {

	let messages = [];
	
	for (let token of clientTokens) {

		console.log("Starting to send Messages to token: " + token);

		if (!Expo.isExpoPushToken(token)) {
			console.error(`Push token ${token} is not a valid Expo push token`);
			continue;
		}

		messages.push({
			to: token,
			sound: 'default',
			body: "Den nächsten Eintopf gibt es " + message + " (" + stew.datestring + ")",
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

module.exports = {
	clientTokens,
	sendMessages
}


