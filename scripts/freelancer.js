module.exports = {
	hostname: 'https://www.freelancer.com',
	jobsListUrl: 'https://www.freelancer.com/jobs/1/',

	listJobs: function() {
		var jobs = [];
		$('.JobSearchCard-item').each(function(i, elt) {
			elt = $(elt);

			var titleElt = elt.find('div.JobSearchCard-primary-heading > a');
			var title = titleElt.text();
			if(title.indexOf('Project for ') != -1 || title.indexOf('Private project or contest') != -1)
				return;

			var description = elt.find('p.JobSearchCard-primary-description').text().trim();
			if(description == '') // a description may be null
				description = 'No description.';

			var skills = elt.find('a.JobSearchCard-primary-tagsLink').map(function(i, elt) {
				return $(elt).text().trim();
			}).get();

			jobs.push({
				host: 'freelancer.com',
				title: title.trim(),
				url: titleElt.attr('href').trim(),
				description: description,
				skills: skills,
				bidsCount: parseInt(elt.find('div.JobSearchCard-secondary-entry').text().replace(' entries', '').replace(' bids', '').trim())
			});
		});
		return jobs;
	},

	getJob: function() {
		if(window.location.href == 'https://www.freelancer.com/job/')
			return {nothing: true, id: 1};

		const heading = $('#main h3');
		if(heading && heading.text() == 'Project Deleted')
			return {nothing: true, id: 2};

		const error = $('#span_err_header');
		if(error && error.text() == 'Error')
			return {nothing: true, id: 3};

		if($('h1').text() == 'Sign Non-Disclosure Agreement')
			return {private: true};

		if($('#login_form_container').length) // need to log in for see the job
			return {private: true};

		if(!$('#main').children().length) // empty page (not a public project)
			return {private: true};

		if($('.logoutHero').length) { // contest
			var description = $('p.contest-brief');
			description = description.length ? description.html().trim() : 'No description.'; // a description may be null

			return {
				description: description,
				budget: $('li.logoutHero-contestItem:nth-child(2)').text().replace('Prize:', '').trim()
			};
		}
		else {
			var description = '';
			$('div.PageProjectViewLogout-detail > p:not(.PageProjectViewLogout-detail-tags)').each(function(i, elt) {
				const text = $(elt).text().trim();
				if(text.length)
					description += '<p>' + text + '</p>';
			});
			if(description == '') // on freelancer.com, it is possible to create a project without description...
				description = 'No description.';

			return {
				description: description,
				budget: $('p.PageProjectViewLogout-header-byLine').text().replace('Budget', '').trim()
			};
		}
	}
};