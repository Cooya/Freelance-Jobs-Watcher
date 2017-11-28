module.exports = {
	hostname: 'https://www.upwork.com',
	jobsListUrl: 'https://www.upwork.com/o/jobs/browse/',

	listJobs: function() {
		var jobs = [];
		var link;
		$('section.job-tile').each(function(i, elt) {
			link = $(elt).find('h2 a');
			jobs.push({title: link.text(), url: link.attr('href')})
		});
		return jobs;
	},

	getJob: function() {
		if($('h1').text() === 'Access is restricted to Upwork users only.')
            return {nothing: true};
		if($('p.alert-danger > strong').text() === 'Cancelled')
			return {nothing: true};
		return {description: $('p.break').text()};
	}
};