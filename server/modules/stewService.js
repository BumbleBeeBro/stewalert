const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const url = 'https://muenster.my-mensa.de/essen.php?mensa=davinci';

const getStews = async () => {
	let response = await axios(url)

	const html = response.data;
	//root element of page to scrape
	const $ = cheerio.load(html);

	const day = $('ul.checkgroupdividers');

	const meals = [];

	const stews = []

	const currDate = new Date();

	//check if today is a weekend day subject to put in seperate function
	if (currDate.getDay() === 0) {
		date.setDate(date.getDate() + 1)
	} else if (currDate.getDay() === 6) {
		date.setDate(date.getDate() + 2)
	}

	let currMeal = {
		heading: null,
		parts: [],
		eintopf: false,
		date: null
	};

	day.children().each((_, elem) => {

		let menuHeading = $(elem).find('div').text().trim();

		if (menuHeading === '') {
			let part = $(elem).find('h3.text2share').text();
			currMeal.parts.push(part);
		} else if (menuHeading.includes("Menü 1")) {
			currDate.setDate(currDate.getDate() + 1)

			//check if today is a weekend day
			if (currDate.getDay() === 0) {
				currDate.setDate(currDate.getDate() + 1)
			} else if (currDate.getDay() === 6) {
				currDate.setDate(currDate.getDate() + 2)
			}
		} else {
			//for first iteration, populate object before pushing it
			if (currMeal.heading == null) {
				currMeal.heading = menuHeading;
				currMeal.parts = []
				currMeal.date = new Date(currDate.getTime())
				meals.push(Object.assign({}, currMeal));
			} else {
				meals.push(Object.assign({}, currMeal));
				currMeal.heading = menuHeading;
				currMeal.parts = []
				currMeal.date = new Date(currDate.getTime())

			}
		}
	});

	meals[3].heading = 'Eintopf';

	meals.forEach((meal) => {
		if (meal.heading.includes('Eintopf')) {
			meal.eintopf = true;

			stews.push({
				datestring: `${meal.date.getDate()}.${meal.date.getMonth() + 1}.${meal.date.getFullYear()}`,
				date: meal.date,
				eintopf: meal.parts[0]
			})
		}
	});

	return stews;

}

module.exports = {
	getStews
}
