const Database = require('@coya/database');
const Logs = require('@coya/logs');
const { Task } = require('@coya/task-manager');
const dbCredentials = require('./db_credentials.js');

const JOBS_COLLECTION = 'watcher.jobs';

module.exports = class CleaningTask extends Task {
	constructor(name, timeInterval) {
		super(name, timeInterval);
		this.logs = new Logs(name);
	}

	run() {
		const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;

		return Database.connect(dbCredentials)
		.then(Database.selectCollection.bind(null, JOBS_COLLECTION))
		.then(Database.deleteDocsByPattern.bind(null, JOBS_COLLECTION, {date: {$lt: twoDaysAgo}}))
		.then((result) => {
			this.logs.info(result.deletedCount + ' jobs have been removed from the database.');
		});
	}
}