var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var Sandbox = require('./sandbox');
var async = require('async');

var callbacks = {};

function SandboxWrapper(file, id, params, apiHandler, debug) {
	EventEmitter.call(this);

	if (typeof file !== "string" || file === undefined || file === null) {
		throw new Error("First argument should be a path to file to launch in vm");
	}

	if (typeof id !== "string" || id === undefined || id === null) {
		throw new Error("Second argument should be a id of dapp");
	}

	if (typeof apiHandler !== "function" || apiHandler === undefined || apiHandler === null) {
		throw new Error("Third argument should be a api hanlder callback");
	}

	this.params = params;
	this.file = file;
	this.id = id;
	this.apiHandler = apiHandler;
	this.child = null;
	this.debug = debug || false;
	this.callbackCounter = 1;
}

util.inherits(SandboxWrapper, EventEmitter);

SandboxWrapper.prototype._getCallbackCounter = function() {
	return this.callbackCounter++;
}

SandboxWrapper.prototype._parse = function (data) {
	//console.log('receive dapp msg', data);
	try {
		var json = JSON.parse(data);
	} catch (e) {
		return this._onError(new Error("Can't parse JSON response from DApp: \n" + data + "\n" + e.toString()));
	}

	if (json.callback_id === null || json.callback_id === undefined) {
		return this._onError(new Error("Incorrect response from vm, missed callback id field"));
	}

	try {
		var callback_id = parseInt(json.callback_id);
	} catch (e) {
		return this._onError(new Error("Incorrect callback_id field, callback_id should be a number"));
	}

	if (isNaN(callback_id)) {
		return this._onError(new Error("Incorrect callback_id field, callback_id should be a number"));
	}

	if (json.type == "dapp_response") {
		var callback = callbacks[callback_id];

		if (!callback) {
			return this._onError(new Error("Asch can't find callback_id from vm"));
		}

		var error = json.error;
		var response = json.response;

		delete callbacks[callback_id];
		setImmediate(callback, error, response);
	} else if (json.type == "dapp_call") {
		var message = json.message;

		if (message === null || message === undefined) {
			return this._onError(new Error("Asch can't find message for request from vm"));
		}

		message.dappid = this.id;

		this.apiHandler(message, function (err, response) {
			var responseObj = {
				type: "asch_response",
				callback_id: callback_id,
				error: err,
				response: response || {}
			};

			try {
				var responseString = JSON.stringify(responseObj);
			} catch (e) {
				return this._onError(new Error("Can't make response: " + e.toString()));
			}

			this.child.postMessage(responseString);
		}.bind(this));
	} else {
		this._onError(new Error("Incorrect response type from vm"));
	}
}

SandboxWrapper.prototype.run = function () {
	this.child = new Sandbox();
	var self = this;
	fs.readFile(this.file, 'utf8', function(err, code) {
		if (err) {
			return self._onError('failed to read dapp entry point file: ' + err);
		}
		self.child.run(code, function(err) {
			return self._onError('dapp exit with reason: ' + err.result);
		});
		
		self.child.on('error', self._onError.bind(self));
		if (self.debug) {
			self.child.on('stdout', self._debug.bind(self));	
		}
		self.child.on('stderr', self._debug.bind(self));
		self.child.on('message', self._parse.bind(self));
	});
}

SandboxWrapper.prototype.setApi = function (apiHanlder) {
	if (typeof apiHanlder != "function" || apiHanlder === null || apiHanlder === undefined) {
		throw new Error("First argument should be a function");
	}
	this.apiHandler = apiHanlder;
}

SandboxWrapper.prototype.sendMessage = function (message, callback) {
	var callback_id = this._getCallbackCounter();
	var messageObj = {
		callback_id: callback_id,
		type: "asch_call",
		message: message
	};
	
	try {
		var messageString = JSON.stringify(messageObj);
	} catch (e) {
		return setImmediate(callback, "Can't stringify message: " + e.toString());
	}

	callbacks[callback_id] = callback;
	this.child.postMessage(messageString);
}

SandboxWrapper.prototype.exit = function () {
	if (this.child) {
		// this.child.kill();
		this.emit("exit");
	}
}

SandboxWrapper.prototype._debug = function (data) {
	console.log("Debug " + this.file + ": \n");
	console.log(data.toString('utf8'));
}

SandboxWrapper.prototype._onError = function (err) {
	console.log(err.stack)
	this.exit();
	this.emit("error", err);
}

module.exports = SandboxWrapper;
