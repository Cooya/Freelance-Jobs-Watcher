const Database = require('@coya/database');
const Logs = require('@coya/logs');
const { Task } = require('@coya/task-manager');

const JOBS_COLLECTION = 'watcher.jobs';

module.exports = class CleaningTask extends Task {
	constructor(name, timeInterval, config) {
		super(name, timeInterval);
		this.config = config;
		this.logs = new Logs(name, config);
	}

	run() {
		const twoDaysAgo = Date.now() - 48 * 60 * 60 * 1000;

		return Database.connect(this.config)
		.then(Database.selectCollection.bind(null, JOBS_COLLECTION))
		.then(Database.deleteDocsByPattern.bind(null, JOBS_COLLECTION, {date: {$lt: twoDaysAgo}}))
		.then((result) => {
			this.logs.info(result.deletedCount + ' jobs have been removed from the database.');
		});
	}
};