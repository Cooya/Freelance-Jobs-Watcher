module.exports = {
	hostname: 'https://www.codeur.com/',
	jobsListUrl: 'https://www.codeur.com/',

	listJobs: function() {
		var jobs = [];
		$('div.row.mb-2').each(function(i, elt) {
			var url = $(elt).find('h5.small-project-title > a').attr('href').trim();

			var skills = [];
			$(elt).find('ul.categories > li').each(function(i, elt) {
				skills.push($(elt).text().trim());
			});

			jobs.push({host: 'codeur.com', url: url, skills: skills})
		});
		return jobs;
	},

	getJob: function() {
		return {
			title: $('h1.display-5').text().trim(),
			description: $('div.content:nth-child(1)').html().trim(),
			date: $('table.project-specs tr:nth-child(2) strong').text().trim(),
			bidsCount: parseInt($('div.banner-subtitle > span:nth-child(3)').text().replace('offres', '').trim()),
			budget: $('table.project-specs tr:nth-child(1) strong').text().trim()
		};
	}
};