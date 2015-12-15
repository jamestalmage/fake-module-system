import test from 'ava';
import MockSystem from './';
const mockSystem = MockSystem;
const MockModule = MockSystem.Module;
const mockModule = MockModule;

test('a module > simply stores the code and filename passet to `_compile`', t => {
	const module = new MockModule();
	module._compile('foo', './foo.js');
	t.is(module.code, 'foo');
	t.is(module.file, './foo.js');
});

test('a module > does not require the `new` keyword.', t => {
	const module = mockModule();
	module._compile('bar', './bar.js');
	t.is(module.code, 'bar');
	t.is(module.file, './bar.js');
});

test('a module > will throw if compiled a second time using the default _compile method', t => {
	// You should *never* call the default _compile method twice.
	// You *can* temporarily replace _compile with your own interceptor before calling another hook.
	const module = mockModule();
	module._compile('foo', './foo.js');
	t.throws(t => module._compile('foo', './foo.js'));
});

test('a system > loads modules from mock content store', t=> {
	const system = new MockSystem();
	system.content['./foo.js'] = 'bar';
	const module = system.load('./foo.js');
	t.is(module.code, 'bar');
});

test('a system > can be created without the `new` keyword', t=> {
	const system = mockSystem();
	system.content['./foo.js'] = 'bar';
	const module = system.load('./foo.js');
	t.is(module.code, 'bar');
});

test('a system > will accept content map as a constructor param', t => {
	const system = new MockSystem({'./foo.js': 'foo'});
	const module = system.load('./foo.js');
	t.is(module.code, 'foo');
});

test('a system > can have require.extensions applied', t => {
	const system = new MockSystem({'./foo.js': 'foo'});

	// Install a hook that append "bar"
	const originalHook = system.extensions['.js'];
	system.extensions['.js'] = function (module, filename) {
		const originalCompile = module._compile;
		module._compile = function (code, filename) {
			code = code + 'bar';
			module._compile = originalCompile;
			module._compile(code, filename);
		};
		originalHook(module, filename);
	};

	const module = system.load('./foo.js');
	t.is(module.code, 'foobar');
});

test('a system > provides convenience method for installing transforms', t => {
	const system = new MockSystem({'/foo.js': 'foo'});

	system.installTransform((code, filename) => {
		t.is(code, 'foo');
		t.is(filename, '/foo.js');
		return 'bar';
	});

	const module = system.load('/foo.js');

	t.is(module.code, 'bar');
});

test('convenience transform plays nice with transforms added after', t => {
	const system = new MockSystem({'/foo.js': 'foo'});

	system.installTransform(code => code + ' bar');

	// Install a hook that append "bar"
	const originalHook = system.extensions['.js'];
	system.extensions['.js'] = function (module, filename) {
		const originalCompile = module._compile;
		module._compile = function (code, filename) {
			code = code.toUpperCase();
			module._compile = originalCompile;
			module._compile(code, filename);
		};
		originalHook(module, filename);
	};

	const module = system.load('/foo.js');

	t.is(module.code, 'FOO BAR');
});

test('convenience transform plays nice with transforms added before', t => {
	const system = new MockSystem({'/foo.js': 'foo'});

	// Install a hook that append "bar"
	const originalHook = system.extensions['.js'];
	system.extensions['.js'] = function (module, filename) {
		const originalCompile = module._compile;
		module._compile = function (code, filename) {
			code = code.toUpperCase();
			module._compile = originalCompile;
			module._compile(code, filename);
		};
		originalHook(module, filename);
	};

	system.installTransform(code => code + ' bar');

	const module = system.load('/foo.js');

	t.is(module.code, 'FOO bar');
});

test('convenience transform throws if transform fails to return a string', t => {
	const system = new MockSystem({'/foo.js': 'foo'});

	system.installTransform(code => null);

	t.throws(() => system.load('/foo.js'));
});
