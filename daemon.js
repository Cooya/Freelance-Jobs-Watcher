const http = require('http');
const net = require('net');
const path = require('path');

const Logs = require('@coya/logs');
const Contact = require('@coya/contact');
const { TaskManager } = require('@coya/task-manager');
const CleaningTask = require('./cleaning_task');
const ScrapingTask = require('./scraping_task');

Contact.init({
	smtpHost: 'mail22.lwspanel.com',
	smtpPort: 587,
	smtpLogin: 'contact@nicodev.fr',
	smtpPassword: 'pepino47420',
	smtpRecipient: 'contact@nicodev.fr'
});

const clients = [];
const logs = new Logs('daemon_server');
const ipcAddress = path.join('\\\\?\\pipe', 'daemon_jobs');
const httpAddress = 'http://localhost/jobs/binding';
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
});

server.listen(ipcAddress, function() {
	logs.info('Daemon server started on "' + server.address() + '".');
	http.get(httpAddress).on('error', (e) => {  // notify the server
		logs.warning('HTTP server not started.');
	});
});

function sendJobsToClients(job) {
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

const cleaningTask = new CleaningTask('cleaning', 3600);

const freelancerTask = new ScrapingTask('freelancer', 120);
freelancerTask.on('job', sendJobsToClients);
freelancerTask.on('error', sendErrorByEmail);

const pphTask = new ScrapingTask('pph', 120);
pphTask.on('job', sendJobsToClients);
pphTask.on('error', sendErrorByEmail);

const guruTask = new ScrapingTask('guru', 120);
guruTask.on('job', sendJobsToClients);
guruTask.on('error', sendErrorByEmail);

const truelancerTask = new ScrapingTask('truelancer', 120);
truelancerTask.on('job', sendJobsToClients);
truelancerTask.on('error', sendErrorByEmail);

//const upworkTask = new ScrapingTask('upwork', 120);
//upworkTask.on('job', sendJobsToClients);
//upworkTask.on('error', sendErrorByEmail);

//const fiverrTask = new ScrapingTask('fiverr', 300);
//fiverrTask.on('job', sendJobsToClients);
//fiverrTask.on('error', sendErrorByEmail);

const taskManager = new TaskManager();
taskManager.end(() => {
	taskManager.logs.info('Task manager shutted down.');
	ScrapingTask.closeScraper();
	closeServer();
});
taskManager.processAsynchronousTasks([cleaningTask, freelancerTask, pphTask, guruTask, truelancerTask]);