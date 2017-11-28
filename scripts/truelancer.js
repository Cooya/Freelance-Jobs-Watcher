module.exports = {
	hostname: 'https://www.truelancer.com',
	jobsListUrl: 'https://www.truelancer.com/freelance-jobs',

	listJobs: function() {
		var jobs = [];
		$('li.job_item').each(function(i, elt) {
			var link = $(elt).find('h3 > a');
			jobs.push({host: 'truelancer.com', url: link.attr('href').trim()});
		});
		return jobs;
	},

	getJob: function() {
		if($('div.alert-danger > strong').text().trim() == 'Private Project!')
			return {nothing: true};

		var title = $('h3.col-md-12');
		if(title.length)
			title = title.text().trim();
		else
			title = $('h3.col-md-11').text().trim();

		return {
			title: title,
			description: $('div.job-description').html().trim(),
			date: $('ul.metainfo > li:first-child').text().replace('Posted at : ', '').trim(),
			bidsCount: parseInt($('div.project-table > div:nth-child(2) > span.value').text().trim()),
			skills: $('li.skillsmall').map(function(i, elt) {
				return $(elt).text().trim();
			}).get(),
			budget: '$' + $('div.project-table > div:first-child > span.value').text().trim(),
		};
	}
};