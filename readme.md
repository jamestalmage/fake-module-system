# fake-module-system [![Build Status](https://travis-ci.org/jamestalmage/fake-module-system.svg?branch=master)](https://travis-ci.org/jamestalmage/fake-module-system)

> A mock module system for testing require extensions.


## Install

```
$ npm install --save-dev fake-module-system
```


## Usage

```js
import System from 'fake-module-system';

const system = new System({
  './foo.js': 'bar'  // a file named foo wi
  // th content "bar"
}); 

// alternate method from setting content in the constructor. 
system.content['./foo.js'] = 'bar';

let module = system.load('./foo.js');

// A module is not actually evaled, or ran. It just stores the code and filename
assert(module.code === 'bar');
assert(module.file === './foo.js');

// You can add custom require extensions for testing (the whole point of this module).
// This unrealisticly simple one just adds "quz" at the end of every file.
system.extensions['.js'] = appendQuzTransform(); 
module = system.load('./foo.js');
assert(module.code === 'barquz');
```

Related:
 - [How require extensions work](https://gist.github.com/jamestalmage/df922691475cff66c7e6), step by step.

## License

MIT © [James Talmage](http://github.com/jamestalmage)