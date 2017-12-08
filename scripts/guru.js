module.exports = {
	hostname: 'http://www.guru.com',
	jobsListUrl: 'http://www.guru.com/d/jobs/',

	listJobs: function() {
		var jobs = [];
		$('li.serviceItem').each(function(i, elt) {
			jobs.push({host: 'guru.com', url: $(elt).find('h2 > a:nth-child(1)').attr('href').trim()})
		});
		return jobs;
	},

	getJob: function() {
		if($('h1.guruNotFound-title').length)
			return {nothing: true};

		var skills = [];
		$('a.skillItem').each(function(i, elt) {
			skills.push($(elt).text().trim());
		});

		var title = $('h1.projectTitle');
		if(title.length > 1) // sometimes there is another hidden title
			title = $(title[0]);

		return {
			title: title.text().trim(),
			description: $('.jobDetail-section pre').html().replace(/<em>.+<\/em>/, '').trim(),
			date: $('span.dt-style1 > span').text().trim(),
			bidsCount: parseInt($('#snpProposalCount').text().trim()),
			skills: skills,
			budget: $('.budget > ul > li:nth-child(2)').text().trim()
		};
	}
};