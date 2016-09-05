'use strict';

function Node(pos, node) {
  Object.defineProperty(this, 'cache', {value: {}});
  for (var key in node) this[key] = node[key];
  return pos(this);
}

Object.defineProperty(Node.prototype, 'parent', {
  configurable: true,
  set: function(parent) {
    this.cache.parent = parent;
    if (parent.nodes) parent.nodes.push(this);
  },
  get: function() {
    return this.cache.parent || null;
  }
});

module.exports = Node;
