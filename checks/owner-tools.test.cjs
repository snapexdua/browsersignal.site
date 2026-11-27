'use strict';
const assert = require('node:assert/strict');
const {calculateWindow, duration, interpret} = require('../assets/owner-tools.js');

const scenarios = [
  [3600, 300, 20, 2400, 300, 2400],
  [3600, 300, 60, 0, 300, 300],
  [3600, 300, 120, 0, 300, 300],
  [3600, 300, 0, 3600, 0, 3600],
  [180, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [3600, 3600, 1, 3540, 3600, 3600],
  [2147483647, 3, 1, 2147483587, 3, 2147483587]
];
for (const [previous, reduced, lead, remaining, shortWindow, overlap] of scenarios) {
  assert.deepEqual(calculateWindow(previous, reduced, lead), {remaining, shortWindow, overlap});
}
for (const input of [['',1,1],[5,'',1],[5,1,''],[-1,1,1],[5,-1,1],[5,1,-1],[2,3,0],[5,1,.5],[2147483648,2,1],[5,2,35791396],['oops',0,5]]) {
  assert.throws(() => calculateWindow(...input), RangeError);
}
assert.equal(duration(90061), '1 day 1 hour 1 minute 1 second');
assert.equal(duration(0), '0 seconds');
assert.equal(duration(2400), '40 minutes');
assert.match(interpret(200, 'text/css', 'body{}'), /matches a stylesheet/);
assert.match(interpret(200, 'text/html', '<!doctype html>'), /HTML document/);
assert.match(interpret(200, 'text/css', '<html lang="en">'), /HTML document/);
assert.match(interpret(200, '', 'body{}'), /does not declare/);
assert.match(interpret(404, 'text/html', '<html>'), /missing resource/);
assert.match(interpret(503, 'text/html', '<html>'), /status needs investigation/);
assert.match(interpret(204, 'text/css', ''), /empty/);
console.log('DNS arithmetic, invalid inputs, duration formatting and HTTP interpretations passed.');
