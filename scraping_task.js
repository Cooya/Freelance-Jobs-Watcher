const EventEmitter = require('events');
const { Task } = require('@coya/task-manager');
const { ScraperClient } = require('@coya/web-scraper');
const Database = require('@coya/database');
const Logs = require('@coya/logs');
const Time = require('@coya/time');

const JOBS_COLLECTION = 'watcher.jobs';
const SKILLS_COLLECTION = 'watcher.skills';
const SCRIPTS_FOLDER = __dirname + '/scripts/';

// private static variables
let isInit = false;
let savedSkills = [];

module.exports = class ScrapingTask extends Task {
	constructor(name, timeInterval, config) {
		super(name, timeInterval);
		this.config = config;
		this.scraper = ScraperClient.getInstance();
		this.logs = new Logs(name + '_scraping_task', this.config);
		this.scriptPath = SCRIPTS_FOLDER + name + '.js';
		let script = require(this.scriptPath);
		this.hostname = script.hostname;
		this.jobsListUrl = script.jobsListUrl;
		this.eventEmitter = new EventEmitter();
		this.eventEmitter.setMaxListeners(1);
	}

	run() {
		return initDatabaseConnection(this.config)
		.then(getJobsList.bind(this))
		.then((jobs) => {
			if(!jobs) {
				return Promise.reject({
					msg: 'No jobs have been found.',
					task: this.name,
					stop: true // critical error => remove the task from the task list
				});
			}

			return loop((job) => {
				if(!jobFormattingFirstStep.call(this, job)) {
					return Promise.reject({
						msg: 'The first step of job checking has failed.',
						job: job
					});
				}

				return Database.getOneDoc(JOBS_COLLECTION, {url: job.url})
				.then((exists) => {
					if(exists) // the job has already been processed and inserted into the database
						return Promise.resolve();

					return getSingleJob.call(this, job.url)
					.then((result) => {
						if(!result) {
							return Promise.reject({
								msg: 'The result returned by the web scraper is null.',
								url: job.url
							});
						}

						if(result['nothing'])
							return Promise.resolve();

						Object.assign(job, result); // merge "result" into "job"
						if(!jobFormattingSecondStep.call(this, job)) {
							return Promise.reject({
								msg: 'The second step of job checking has failed.',
								job: job
							});
						}

						// the request has succeeded and job data are faultless
						this.eventEmitter.emit('job', job);
						saveSkills.call(this, job.skills);
						return Database.addDocs(JOBS_COLLECTION, job);
					});
				});
			}, jobs);
		})
		.catch((error) => {
			this.logs.error(error);
			this.eventEmitter.emit('error', JSON.stringify(error));
			return Promise.reject(error); // critical error => stop the task manager
		});
	}

	on(eventName, handler) {
		this.eventEmitter.on(eventName, handler);
	}

	static closeScraper() {
		ScraperClient.getInstance().closeScraper();
	}
};

// private method
function getJobsList() {
	this.logs.info('Loading ' + this.name + ' jobs list...');
	return this.scraper.request({
		url: this.jobsListUrl,
		scriptPath: this.scriptPath,
		function: 'listJobs',
		args: {
			referer: this.hostname
		}
	});
}

// private method
function jobFormattingFirstStep(job) {
	if(!job || !job.host || !job.url)
		return false;
	let pos = job.url.indexOf('&');
	if(pos != -1)
		job.url = job.url.substr(0, pos);
	if(job.url[0] == '/')
		job.url = this.hostname + job.url;
	return true;
}

// private method
function getSingleJob(url) {
	this.logs.info('Retrieving job data with url = "' + url + '"...');
	return this.scraper.request({
		url: url, 
		scriptPath: this.scriptPath,
		function: 'getJob',
		args: {
			referer: this.jobsListUrl
		}
	});
}

// private method
function jobFormattingSecondStep(job) {
	if(!job || !job.title || !job.description || !job.date || (!job.bidsCount && job.bidsCount != 0) || !job.skills || !job.budget)
		return false;
	job.date = Time.convertReadableToMilliseconds(job.date);
	job.skills = job.skills.map((skill) => {
		return skill.toLowerCase();
	});
	return !!job.date;
}

// private method
function saveSkills(jobSkills) {
	jobSkills.forEach((skill) => {
		if(savedSkills.indexOf(skill) == -1) {
			this.logs.info('Adding skill "' + skill + '" to database...');
			savedSkills.push(skill);
			Database.addDocs(SKILLS_COLLECTION, {skillName: skill})
			.catch(() => {
				this.logs.error('The skill has not been added to the database.');
			});
		}
	});
}

// private static method
function initDatabaseConnection(config) {
	if(isInit)
		return Promise.resolve();
	else {
		isInit = true;
		return Database.connect(config)
		.then(Database.createCollection.bind(null, JOBS_COLLECTION))
		.then(Database.createIndex.bind(null, JOBS_COLLECTION, {date: -1}))
		.then(Database.selectCollection.bind(null, SKILLS_COLLECTION))
		.then(getSkillsFromDatabase);
	}
}

// private static method
function getSkillsFromDatabase() {
	return Database.getDocs(SKILLS_COLLECTION)
	.then(function(skills) {
		skills.forEach(function(skill) {
			savedSkills.push(skill.skillName);
		});
	});
}

// private static method
function loop(action, array, i = 0) {
	return action(array[i]).then(function() {
		if(++i < array.length)
			return loop(action, array, i);
	});
}