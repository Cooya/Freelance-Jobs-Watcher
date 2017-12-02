module.exports = {
	hostname: 'https://www.freelancer.com',
	jobsListUrl: 'https://www.freelancer.com/jobs/1/',

	listJobs: function() {
		var jobs = [];
		$('.JobSearchCard-item').each(function(i, elt) {
			jobs.push({
				host: 'freelancer.com',
				url: $(elt).find('.JobSearchCard-primary-heading > a').attr('href').trim(),
				bidsCount: parseInt($(elt).find('div.JobSearchCard-secondary-entry').text().replace(' entries', '').replace(' bids', '').trim())
			});
		});
		return jobs;
	},

	getJob: function() {
		if(window.location.href == 'https://www.freelancer.com/job/')
			return {nothing: true};

		if($('#main h3').text() == 'Project Deleted')
			return {nothing: true};

		if($('#fb-login-btn').length) // need to log in for see the job
			return {nothing: true};

		if(!$('#main').children().length) // empty page (not a public project)
			return {nothing: true};

		if($('.logoutHero').length) { // contest
			var description = $('p.contest-brief');
			description = description.length ? description.html().trim() : 'No description.'; // a description may be null

			return {
				title: $('h1.logoutHero-column-header').text().trim(),
				description: description,
				date: Date.now(),
				skills: $('ul.logoutHero-recommendedSkills > li').map(function(i, elt) {
					return $(elt).text().trim();
				}).get(),
				budget: $('li.logoutHero-contestItem:nth-child(2)').text().replace('Prize:', '').trim()
			};
		}
		else {
			var title = $('h1.PageProjectViewLogout-header-title').text().trim();
			if(title.startsWith('Project for '))
				return {nothing: true};

			var description = '';
			$('div.PageProjectViewLogout-detail > p:not(.PageProjectViewLogout-detail-tags)').each(function(i, elt) {
				const text = $(elt).text().trim();
				if(text.length)
					description += '<p>' + text + '</p>';
			});
			if(description == '') // on freelancer.com, it is possible to create a project without description...
				description = 'No description.';

			return {
				title: title,
				description: description,
				date: Date.now(),
				skills: $('a.PageProjectViewLogout-detail-tags-link--highlight').map(function(i, elt) {
					return $(elt).text().trim();
				}).get(),
				budget: $('p.PageProjectViewLogout-header-byLine').text().replace('Budget', '').trim()
			};
		}
	}
};