const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');

const url = 'https://www.stw-muenster.de/de/essen-trinken/mensen/da-vinci';

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

module.exports = {
	getStews
}
