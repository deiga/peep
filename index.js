'use strict';

module.exports = peep;

var node_fs     = require('fs');
var node_path   = require('path');
var node_util   = require('util');
var EE          = require('events').EventEmitter;

var tool        = require('./lib/tool');

function peep (options){
    return new Peep(options);
};

peep.Peep = Peep;
peep.GLOBAL_DELAY = 100;

function Peep (options){
    EE.call(this);
    this._init();
};

node_util.inherits(Peep, EE);


var AP_slice = Array.prototype.slice;

function overload(method) {
    return function () {
        AP_slice.call(arguments)

        // flatten
        .reduce(function (prev, current) {
            return prev.concat(current);
        }, [])

        .forEach(function (path) {
            this[method]( this._resolve(path) );

        }, this);

        return this;
    }
};


// Add a file/directory,
// Or add files to watch according to the pattern
// .add('a')
// .add(['a', 'b'])
Peep.prototype.add = overload('_add');


// @param {string=} pattern
// - globule pattern
// - file or dir path
// - no argument: remove all
Peep.prototype.remove = overload('_remove');


// @returns {Array} the currently watched files
Peep.prototype.watched = function () {
    var containers = this._containers;

    return Object.keys(containers).reduce(function (prev, current) {
        return prev.concat(containers[current]);
    }, []);
};


// Private methods
////////////////////////////////////////////////////////////////////////

// Initialize
Peep.prototype._init = function () {

    // @_ontainers are the real watchers
    this._containers = {};
    this._watchers = {};
};

// Add a file or directory to be watched
// @param {path} path absolute path
Peep.prototype._add = function (path) {
    var containers = Object.keys(this._containers);

    if(
        containers.some(function (container) {

            // if is contained in a certain container, add to that container
            if( tool.pathContains(container, path) ){
                this._add_to_container(container, path);
                return true;
            }
        }, this)
    ){
        return;
    }

    var dirname;
    if (node_fs.lstatSync(path).isDirectory()) {
        	dirname = path;
    } else {
        	dirname = node_path.dirname(path);
    }

    // Or add a new container
    this._add_container(dirname);
    this._add_to_container(dirname, path);

    containers
        .filter(function (container) {
            return tool.pathContains(dirname, container);
        })

        .forEach(function (container) {
            this._abdicate_to(container, dirname);
        }, this);
};

var REGEX_ENDING_SLASH = /\/$/;
Peep.prototype._resolve = function (path) {
    // Remove the ending slash
    return node_path.resolve(path).replace(REGEX_ENDING_SLASH, '');
};


Peep.prototype._add_to_container = function (container, path) {
    this._containers[container].push(path);
};


// Abdicate the container to another
Peep.prototype._abdicate_to = function (from, to) {
    var containers = this._containers;
    containers[to] = containers[to].concat(containers[from]);
    this._remove_container(from);
};


Peep.prototype._remove_container = function (container) {
    // Close fs.FSWatcher
    this._watchers[container].close();
    delete this._watchers[container];

    // Remove sub items
    this._containers[container].length = 0;
    delete this._containers[container];
};


Peep.prototype._remove = function (path) {
    var containers = this._containers;
    var container;
    var paths;
    var index;

    for(container in containers){
        paths = containers[container];
        index = paths.indexOf(path);

        // if is contained in a certain container, add to that container
        if( ~ index ){
            paths.splice(index, 1);

            if( paths === 0 ){
                this._remove_container(container);
            }
        }
    }
};


// Main method
// Add a new container
Peep.prototype._add_container = function (container) {
    var paths = this._containers[container] = [];

    console.log('watch', container);

    this._watchers[container] = node_fs.watch(container, function (event, path) {
        console.log(event, path);
    });
};

