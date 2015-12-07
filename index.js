'use strict';
var path = require('path');

function MockModule() {
	if (!(this instanceof MockModule)) {
		return new MockModule();
	}
	this._compiled = false;
}

MockModule.prototype._compile = function (code, file) {
	if (this._compiled) {
		throw new Error('compiled twice');
	}
	this._compiled = true;
	this.code = code;
	this.file = file;
};

module.exports = MockModule;

function MockSystem(content) {
	if (!(this instanceof MockSystem)) {
		return new MockSystem(content);
	}
	var self = this;
	this.content = content || {};
	this.Module = MockModule;

	function defaultExtension(module, filename) {
		module._compile(self.content[filename], filename);
	}

	this.extensions = {
		'.js': defaultExtension
	};

	this.load = function (filename) {
		var module = new MockModule();
		var extension = path.extname(filename);
		self.extensions[extension](module, filename);
		return module;
	};
}

module.exports = MockSystem;
module.exports.Module = MockModule;

