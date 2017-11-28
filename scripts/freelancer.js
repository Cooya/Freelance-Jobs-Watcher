module.exports = {
	hostname: 'https://www.freelancer.com',
	jobsListUrl: 'https://www.freelancer.com/jobs/1/',

	listJobs: function() {
		var jobs = [];
		$('.JobSearchCard-item').each(function(i, elt) {
			var link = $(elt).find('.JobSearchCard-primary-heading > a');
			jobs.push({host: 'freelancer.com', url: link.attr('href').trim()});
		});
		return jobs;
	},

	getJob: function() {
		if($('#main h3').text() === 'Project Deleted')
			return {nothing: true};

		if($('#fb-login-btn').length) // need to log in for see the job
			return {nothing: true};

		if(!$('#main').children().length) // empty page (not a public project)
			return {nothing: true};

		if($('.logoutHero').length) { // contest
			return {
				title: $('h1.logoutHero-column-header').text().trim(),
				description: $('p.contest-brief').html().trim(),
				date: Date.now(),
				bidsCount: parseInt($('li.logoutHero-contestItem:nth-child(3)').text().replace('Entries Received:', '').trim()),
				skills: $('ul.logoutHero-recommendedSkills > li').map(function(i, elt) {
					return $(elt).text().trim();
				}).get(),
				budget: $('li.logoutHero-contestItem:nth-child(2)').text().replace('Prize:', '').trim(),
			};
		}
		else {
			var description = '';
			$('div.PageProjectViewLogout-detail > p').each(function(i, elt) {
				if(i > 10)
					return;
				const text = $(elt).text().trim();
				if(text.length > 0)
					description += text + '<br>';
			});
			if(description === '') // on freelancer.com, it is possible to create a project without description...
				description = 'No description.';

			var bidsCount = parseInt($('h2.Card-heading:first-child').text().split(' ')[0].trim());
			if(!bidsCount)
				bidsCount = 0;

			return {
				title: $('h1.PageProjectViewLogout-header-title').text().trim(),
				//title: $('h1.project_name').text().trim(),
				description: description.replace(/Project ID: #[0-9]+/, ''),
				date: Date.now(),
				//bidsCount: parseInt($('#num-bids').text().trim()),
				bidsCount: bidsCount,
				skills: $('a.PageProjectViewLogout-detail-tags-link--highlight').map(function(i, elt) {
					return $(elt).text().trim();
				}).get(),
				budget: $('p.PageProjectViewLogout-header-byLine').text().replace('Budget', '').trim(),
				//budget: $('div.project-budget').text().trim()
			};
		}
	}
};