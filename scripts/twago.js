module.exports = {
	hostname: 'https://www.twago.com',
	jobsListUrl: 'https://www.twago.com/s/projects/',

	listJobs: function() {
		var jobs = [];
		$('div.search-result').each(function(i, elt) {
			var elt = $(elt);

			var match = elt.find('div.search-result-additional-component > a').text().trim().match(/([0-9]{1,2}) Bids/);

			jobs.push({
				host: 'twago.com',
				title: elt.find('div.project-name').text().trim(),
				url: elt.find('div.project-name > a').attr('href').trim(),
				description: elt.find('p.search-result-description').text().trim(),
				budget: elt.find('div.search-result-additional > *:first').text().trim(),
				bidsCount: match ? parseInt(match[1]) : 0
			});
		});
		return jobs;
	},

	getJob: function() {
		if($('h1').text().trim() == 'NDA request') // private project
			return {};

		if($('h2').text().trim() == 'This project has been sent to outer space!') // project removed
			return {nothing: true};

		var date;
		if($('div.job-public-create-info').length)
			date = $('dl:nth-child(1) > dd').text().trim();
		else
			date = $('div.job-proposal-content:nth-child(2) > p').text().trim();

		var skills = $('span.job-public-tag').map(function(i, elt) {
			return $(elt).text().trim();
		}).get();

		return {
			description: $('div.job-public-description-text').html().trim(),
			date: date,
			skills: skills
		};
	}
};