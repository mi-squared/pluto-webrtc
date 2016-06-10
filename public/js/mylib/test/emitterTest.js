/**
 * Created by alykoshin on 9/3/14.
 */

"use strict";

var test    = require('tape');
var Emitter = require('../emitter.js');

test('basic connection establishment', function (t) {

  var obj = {};
  Emitter(obj);

  obj.on('event1', function(p1, p2, p3) { if (p1 === 'p1' && p2 === 'p2' && p3 === 'p3') {
      t.pass('multiple params passed ok: p1='+p1+'; p2='+p2+'; p2='+p2);
    } else {
      t.fail('multiple params fail: p1='+p1+'; p2='+p2+'; p3='+p3);
    } } );
  obj.emit('event1', 'p1', 'p2', 'p3');
  obj.off('event1');

  var n = 1;
  obj.on('event1', function() { if (n === 1) {t.pass('multiple handler order ok: 1='+n ); n++} else {t.fail('multiple handler order fail: 1='+n); } } );
  obj.on('event1', function() { if (n === 2) {t.pass('multiple handler order ok: 2='+n ); n++} else {t.fail('multiple handler order fail: 2='+n); } } );
  obj.on('event1', function() { if (n === 3) {t.pass('multiple handler order ok: 3='+n ); n++} else {t.fail('multiple handler order fail: 3='+n); } } );
  obj.emit('event1');
  obj.off('event1');

  obj.on('event2', function() { t.fail('-3 event off fail.') } );
  obj.off('event2');
  obj.emit('event2');

  obj.on('abc*',    function(p) { if (p === 'abc') {t.pass('wildcard ok: abc='+p )} else {t.fail('wildcard fail: abc='+p)} } );
  obj.on('def*',    function(p) { if (p === 'def') {t.pass('wildcard ok: def='+p )} else {t.fail('wildcard fail: def='+p)} } );
  obj.emit('abc1', 'abc');
  obj.emit('def2', 'def');
  obj.off('abc*');
  obj.off('def*');
  obj.emit('abc1', 'no such event: abc1');
  obj.emit('def2', 'no such event: def2');

  t.end();
});
