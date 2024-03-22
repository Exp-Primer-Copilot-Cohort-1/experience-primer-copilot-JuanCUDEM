//create web server
var http = require('http');
//create file system
var fs = require('fs');
//create path
var path = require('path');
//create mime
var mime = require('mime');
//create cache
var cache = {};

//send 404 error
function send404(response) {
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found');
	response.end();
}

//send file data
function sendFile(response, filePath, fileContents) {
	response.writeHead(
		200,
		{"content-type": mime.lookup(path.basename(filePath))}
	);
	response.end(fileContents);
}

//serve static files
function serveStatic(response, cache, absPath) {
	//check if file is in cache
	if (cache[absPath]) {
		//serve file from memory
		sendFile(response, absPath, cache[absPath]);
	} else {
		//check if file exists
		fs.exists(absPath, function(exists) {
			if (exists) {
				//read file from disk
				fs.readFile(absPath, function(err, data) {
					if (err) {
						send404(response);
					} else {
						//cache file
						cache[absPath] = data;
						//serve file read from disk
						sendFile(response, absPath, data);
					}
				});
			} else {
				//send 404 response
				send404(response);
			}
		});
	}
}

//create http server
var server = http.createServer(function(request, response) {
	var filePath = false;
	//determine HTML file to be served by default
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	//serve file
	serveStatic(response, cache, absPath);
});

//start server
server.listen(3000, function() {
	console.log("Server listening on port 3000.");
});

//create chat server
var chatServer = require('./lib/chat_server');
chatServer.listen(server);