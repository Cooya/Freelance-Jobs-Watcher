module.exports = {
	hostname: 'https://www.twago.com',
	jobsListUrl: 'https://www.twago.com/s/projects/',

	listJobs: function() {
		var jobs = [];
		$('div.search-result').each(function(i, elt) {
			var match = $(elt).find('div.search-result-additional-component > a').text().trim().match(/([0-9]{1,2}) Bids/);
			jobs.push({
				host: 'twago.com',
				url: $(elt).find('div.project-name > a').attr('href').trim(),
				bidsCount: match ? parseInt(match[1]) : 0
			});
		});
		return jobs;
	},

	getJob: function() {
		var skills = $('span.job-public-tag').map(function(i, elt) {
			return $(elt).text().trim();
		}).get();

		var budget;
		var date;
		if($('div.job-public-create-info').length) {
			budget = $('div.job-proposal-content:nth-child(3) > p').text().trim();
			date = $('dl:nth-child(1) > dd').text().trim();
		}
		else {
			date = $('div.job-proposal-content:nth-child(2) > p').text().trim();
			budget = $('div.job-proposal-content:nth-child(1) > p').text().trim();
		}

		return {
			title: $('div.job-controls-info > h1').text().trim(),
			description: $('div.job-public-description-text').html().trim(),
			date: date,
			skills: skills,
			budget: budget
		};
	}
};