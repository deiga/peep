'use strict';

var tool = module.exports = {};

var node_path = require('path');

// Concat `supplier` to `receiver`, and prevent duplication
tool.pushUnique = function (receiver, subject) {
    if( !~ receiver.indexOf(subject) ){
        receiver.push(subject);
    } 
};


tool.concatUnique = function (receiver, supplier) {
    supplier.forEach(function (item) {
        tool.pushUnique(receiver, item);
    });
};


// Are descendant path(s) contained within ancestor path? Note: does not test
// if paths actually exist.
// @param {path} container absolute path
// @param {path} path absolute path
tool.pathContains = function(container, path) {
    var relative = node_path.relative(path, container);

    if (

        // if `container` and `path` are the same
        relative === '' ||
        /\w+/.test(relative)
    ) {
        return false;
    }

    return true;
};