module.exports = {
	hostname: 'https://www.codeur.com/',
	jobsListUrl: 'https://www.codeur.com/',

	listJobs: function() {
		var jobs = [];
		$('div.row.mb-2').each(function(i, elt) {
			var title = $(elt).find('h5.small-project-title > a');

			var skills = $(elt).find('ul.categories > li').map(function(i, elt) {
				return $(elt).text().trim();
			}).get();

			jobs.push({
				host: 'codeur.com',
				title: title.text().trim(),
				url: title.attr('href').trim(),
				description: $(elt).find('div.summary-text').text().trim(),
				date: $(elt).find('time').text().trim(),
				skills: skills,
				budget: $(elt).find('div.small-project-meta > span:nth-child(2)').text().trim(),
				bidsCount: parseInt($(elt).find('div.small-project-meta > span:nth-child(3)').text().replace('offres', '').trim())
			});
		});
		return jobs;
	},

	getJob: function() {
		if($('span.badge').text().trim() == 'Caché')
			return {}; // the scraping task will also check everything

		return {
			description: $('div.content:nth-child(1)').html().trim()
		};
	}
};