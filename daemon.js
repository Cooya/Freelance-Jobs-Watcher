const fs = require('fs');
const http = require('http');
const net = require('net');
const path = require('path');

const Logs = require('@coya/logs');
const Contact = require('@coya/contact');
const { TaskManager } = require('@coya/task-manager');
const CleaningTask = require('./cleaning_task');
const ScrapingTask = require('./scraping_task');

const config = require('./config.js');

const clients = [];
const logs = new Logs('daemon_server', config);
const httpAddress = 'http://localhost/jobs/binding';
Contact.init(config);
const sendErrorByEmail = Contact.sendEmailToMe.bind(null, 'contact@nicodev.fr', 'Error from jobs watcher daemon');

const server = net.createServer(function(client) {
	logs.info('New client connected.');
	clients.push(client);

	client.on('end', function() {
		logs.info('Client deconnected.');
		clients.splice(clients.indexOf(client), 1);
		logs.debug('Number of clients : ' + clients.length + '.');
	});
});

server.on('error', function(err) {
	logs.error(err);
	if(err.code == 'EACCESS')
		proces.exit(1);
});

fs.access(config.ipcAddress, (err) => {
	if(!err)
		fs.unlinkSync(config.ipcAddress); // need to remove the pipe file on linux

	server.listen(config.ipcAddress, function() {
		logs.info('Daemon server started on "' + server.address() + '".');
		http.get(httpAddress).on('error', (e) => {  // notify the server
			logs.warning('HTTP server not started.');
		});
	});
});

function sendJobsToClients(job) {
	logs.debug(job);
	clients.forEach(function(client) {
		client.write(JSON.stringify(job));
		client.pipe(client);
	});
}

function closeServer() {
	server.close(function() {
		logs.info('Daemon server stopped.');
	});
}

const cleaningTask = new CleaningTask('cleaning', 3600, config);

const freelancerTask = new ScrapingTask('freelancer', 120, config);
freelancerTask.on('job', sendJobsToClients);
freelancerTask.on('error', sendErrorByEmail);

const pphTask = new ScrapingTask('pph', 120, config);
pphTask.on('job', sendJobsToClients);
pphTask.on('error', sendErrorByEmail);

const guruTask = new ScrapingTask('guru', 120, config);
guruTask.on('job', sendJobsToClients);
guruTask.on('error', sendErrorByEmail);

const truelancerTask = new ScrapingTask('truelancer', 120, config);
truelancerTask.on('job', sendJobsToClients);
truelancerTask.on('error', sendErrorByEmail);

const twagoTask = new ScrapingTask('twago', 120, config);
twagoTask.on('job', sendJobsToClients);
twagoTask.on('error', sendErrorByEmail);

const codeurTask = new ScrapingTask('codeur', 120, config);
codeurTask.on('job', sendJobsToClients);
codeurTask.on('error', sendErrorByEmail);

//const upworkTask = new ScrapingTask('upwork', 120, config);
//upworkTask.on('job', sendJobsToClients);
//upworkTask.on('error', sendErrorByEmail);

//const fiverrTask = new ScrapingTask('fiverr', 300, config);
//fiverrTask.on('job', sendJobsToClients);
//fiverrTask.on('error', sendErrorByEmail);

const taskManager = new TaskManager(config);
taskManager.onTaskEnd((task) => {
	sendErrorByEmail('The task "' + task.name + '" has been removed from the task manager.');
});
taskManager.onEnd(() => {
	taskManager.logs.info('Task manager shutted down.');
	ScrapingTask.closeScraper();
	closeServer();
});
taskManager.processAsynchronousTasks([cleaningTask, freelancerTask, pphTask, guruTask, truelancerTask, twagoTask, codeurTask]);