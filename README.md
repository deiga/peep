# Peep

Peep is a smart `fs.watch` wrapper which is lighter and faster. It uses as less `fs.FSWatcher`s as possible, and could prevent duplicate watching.

Peep has a better `.add()` method which could automatically detect nested structures between the current watched files and directories, and choose the best strategy to make it fast and of less resources usage.

## Installation

	npm install peep --save
	
## Usage

```js
var peep = require('peep')();

peep
	.on('all', function(event, path){
	    console.log(event, path);
	})
	.add('test/foo.js')
	.add('test') // 'test' contains 'test/foo.js'
```

Peep doesn't depend on `'globule'` module. If you prefer the feature of globbing files, you could do this:

```js
var globule = require('globule');

peep.add( globule.find('test/**/*.js') );
```

## Methods

#### peep.add(path[, path, ...])
#### peep.add(paths)

Adds file(s) or directories to be watched


```js
peep.add('test/foo.js', 'test/foo2.js');
peep.add(['test/foo.js', 'test/foo2.js']);
```

#### peep.remove(path[, path, ...])
#### peep.remove(paths)

Removes file(s) or directories from being watched.

#### peep.remove()
Removes all watched files and directories.

#### peep.watched()

##### Returns `Array.<String>`

The current watched files.


## Events

What's comming...
