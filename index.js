'use strict';
var path = require('path');
var matchRequire = require('match-require');

function MockModule(system) {
	if (!(this instanceof MockModule)) {
		return new MockModule(system);
	}
	this._compiled = false;
	this._system = system;
}

MockModule.prototype._compile = function (code, file) {
	if (this._compiled) {
		throw new Error('compiled twice');
	}
	this._compiled = true;
	this.code = code;
	this.file = file;
	this.required = {};
	var required = matchRequire.findAll(code);
	if (!(required && required.length)) {
		return;
	}
	if (!this._system) {
		throw new Error('System not set: code can not use require');
	}
	required.forEach(function (name) {
		this.required[name] = this._system.load(name);
	}, this);
};

module.exports = MockModule;

function MockSystem(content) {
	if (!(this instanceof MockSystem)) {
		return new MockSystem(content);
	}
	var self = this;
	this.content = content || {};
	this.cache = {};
	this.Module = MockModule;

	function defaultExtension(module, filename) {
		module._compile(self.content[filename], filename);
	}

	this.extensions = {
		'.js': defaultExtension
	};

	this.load = function (filename) {
		if (self.cache[filename]) {
			return self.cache[filename];
		}
		var module = self.cache[filename] = new MockModule(self);
		var extension = path.extname(filename);
		try {
			self.extensions[extension](module, filename);
		} catch (e) {
			delete self.cache[filename];
			throw e;
		}
		return module;
	};

	this.installTransform = function (transformFn, ext) {
		ext = ext || '.js';
		var oldExtension = self.extensions[ext];
		self.extensions[ext] = function (module, filename) {
			var oldCompile = module._compile;
			module._compile = function (code, filename) {
				module._compile = oldCompile;
				code = transformFn(code, filename);
				if (typeof code !== 'string') {
					throw new Error('transformFn must always return a string');
				}
				module._compile(code, filename);
			};
			oldExtension(module, filename);
		};
	};
}

module.exports = MockSystem;
module.exports.Module = MockModule;

