module.exports = {
	hostname: 'https://www.truelancer.com',
	jobsListUrl: 'https://www.truelancer.com/freelance-jobs',

	listJobs: function() {
		var jobs = [];
		$('li.job_item').each(function(i, elt) {
			var title = $(elt).find('h3 > a');

			var skills = $(elt).find('li.skillsmall').map(function(i, elt) {
				return $(elt).text().trim();
			}).get();

			var bidsCount;
			var proposals = $(elt).find('div.read-reviews h5').text();
			if(proposals == 'Be the first')
				bidsCount = 0;
			else
				bidsCount = parseInt(proposals.replace(/proposals|proposal/, '').trim());

			jobs.push({
				host: 'truelancer.com',
				title: title.text().trim(),
				url: title.attr('href').trim(),
				description: $(elt).find('> div:nth-child(1) > div:nth-child(3)').text().trim(),
				skills: skills,
				bidsCount: bidsCount
			});
		});
		return jobs;
	},

	getJob: function() {
		if($('div.alert-danger > strong').text().trim() == 'Private Project!')
			return {private: true};

		return {
			description: $('div.job-description').html().trim(),
			date: $('ul.metainfo > li:first-child').text().replace('Posted at : ', '').trim(),
			budget: '$' + $('div.project-table > div:first-child > span.value').text().trim()
		};
	}
};