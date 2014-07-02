var util = require('util');
var url = require('url');
var WS = require('ws');
var EventEmitter = require('events').EventEmitter;
var superagent = require('superagent');
var xml2js = require('xml2js'); 

function App(device, appName) {
	EventEmitter.call(this);
	this.name = appName;
	this.device = device;
	this.base = this.device.appsBase+this.name;
}
util.inherits(App, EventEmitter);

App.prototype.info = function(cb) {
	var request = superagent.get(this.base);
	request.buffer();
	request.type('xml');
	request.set('Content-Length', '0');
	request.end(function(err, res) {
		if (err) return cb(err);
		xml2js.parseString(res.text, function (err, result) {
		    cb(null, result.service);
		});
	});
	return this;
};

App.prototype.start = function(data, cb) {
	var request = superagent.post(this.base);
	request.buffer();

	// support sending with data
	// the spec says this is up to the app so we support json and text
	if (typeof data === 'function') {
		cb = data;
		data = null;
		request.set('Content-Length', '0');
	} else if (typeof data === 'string') {
		request.type('text');
		request.send(data);
	} else if (typeof data === 'object') {
		request.type('json');
		request.send(data);
	}

	request.end(function(err, res){
		if (cb) cb(err);
	});
	return this;
};

App.prototype.stop = function(cb) {
	var request = superagent.del(this.base);
	request.buffer();
	request.set('Content-Length', '0');
	request.end(function(err, res){
		cb(err);
	});
	return this;
};

module.exports = App;
