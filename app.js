/*
* goal: http server
* tenant: vodafone partial solution
* author: (c) 19/10/2018 Nacho Ariza
* MIT license
*/
'use strict';
let express = require('express');
let cluster = require('cluster');
let https = require('https');
let http = require('http');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let fs = require('fs');
let app = express();
let cnf = {
	http_port: process.env.PORT || 3000,
	https_port: process.env.PORT || 3443,
	environment: process.env.ENV || 'develop',
};
let theHTTPLog = morgan(':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms', {
	'stream': {
		write: function (str) {
			console.log(str);
		}
	}
});
let key = fs.readFileSync('./cert/server.key'); // your server.key && pem files
let cert = fs.readFileSync('./cert/server.pem')
let https_options = {
	key: key,
	cert: cert
};
let recoverCache = (filename) => {
	return JSON.parse(fs.readFileSync('cache/' + filename, 'UTF-8'));
};
let serviceCache = recoverCache('service.cache.json');
// to detect json changes,,,
fs.watch('cache', (event, filename) => {
	console.log('event is: ' + event);
	if (filename) {
		console.log('reload cache to: ' + filename);
		serviceCache = recoverCache(filename);
	} else {
		console.log('filename not provided');
	}
});

let start = (app) => {
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json({limit: '5mb'}));
		app.use(function (req, res, next) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			next();
		});
		app.use(theHTTPLog);
		// routes
		app.get('/api/service.cache', (req, res) => {
			res.json(serviceCache);
		});
		
		https.createServer(https_options, app).listen(cnf.https_port).on('error', (err) => {
			if (err) {
				console.error(err);
				process.exit(1);
			}
		}).on('listening', () => {
			console.log(process.pid + ' - https listening on port:' + cnf.https_port);
		});
		http.createServer(app).listen(cnf.http_port).on('error', (err) => {
			if (err) {
				lconsole.error(err);
				process.exit(1);
			}
		}).on('listening', () => {
			console.log(process.pid + ' - http listening on port:' + cnf.http_port);
		});
	}
;

let startCluster = (app) => {
	if (!cluster.isMaster) {
		start(app);
	}
	else {
		console.log('config  =>');
		console.log(cnf);
		let threads = require('os').cpus().length;
		while (threads--) cluster.fork();
		cluster.on('death', (worker) => {
			cluster.fork();
			console.log('Process died and restarted, pid:', worker.pid);
		});
	}
};

startCluster(app);

