module.exports = {
	hostname: 'https://www.peopleperhour.com',
	jobsListUrl: 'https://www.peopleperhour.com/freelance-jobs',

	listJobs: function() {
		var jobs = [];
		$('div.job-list-item').each(function(i, elt) {
			var link = $(elt).find('h3 > a');
			jobs.push({host: 'peopleperhour.com', url: link.attr('href').trim()})
		});
		return jobs;
	},

	getJob: function() {
		const title = $('h1').text().trim();
		if(title == 'This Job is no longer available' || title == 'This Job has been moderated')
			return {nothing: true};

		var skills = [];
		$('a.tag-item').each(function(i, elt) {
			skills.push($(elt).text().trim());
		});

		return {
			title: title,
			description: $('div.project-description').html().trim(),
			date: $('time.info-value').text().trim(),
			bidsCount: parseInt($('span.info-value').text().trim()),
			skills: skills,
			budget: $('div.price-tag:eq(1)').text().trim()
		};
	}
};