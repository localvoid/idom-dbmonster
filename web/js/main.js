'use strict';

var I = 0;
var N = 100;

var IncrementalDOM = require('incremental-dom');
var elementOpen = IncrementalDOM.elementOpen;
var elementClose = IncrementalDOM.elementClose;
var elementVoid = IncrementalDOM.elementVoid;
var text = IncrementalDOM.text;
var patch = IncrementalDOM.patch;

var data = require('./data');

function update(dbs) {
  for (var i = 0; i < dbs.length; i++) {
    dbs[i].update();
  }
}

function formatElapsed(v) {
  if (!v) return '';

  var str = parseFloat(v).toFixed(2);

  if (v > 60) {
    var minutes = Math.floor(v / 60);
    var comps = (v % 60).toFixed(2).split('.');
    var seconds = comps[0];
    var ms = comps[1];
    str = minutes + ":" + seconds + "." + ms;
  }

  return str;
}

function labelClass(count) {
  if (count >= 20) {
    return 'label label-important';
  } else if (count >= 10) {
    return 'label label-warning';
  }
  return 'label label-success';
}

function elapsedClass(t) {
  if (t >= 10.0) {
    return 'Query elapsed warn_long';
  } else if (t >= 1.0) {
    return 'Query elapsed warn';
  }
  return 'Query elapsed short';
}

var TABLE_STATICS = ['class', 'table table-striped table-latest-data'];
var DBNAME_STATICS = ['class', 'dbname'];
var QC_STATICS = ['class', 'query-count'];
var POPOVER_STATICS = ['class', 'popover left'];
var POPOVER_CONTENT_STATICS = ['class', 'popover-content'];
var POPOVER_ARROW_STATICS = ['class', 'arrow'];

function render(dbs) {
  elementOpen('table', null, TABLE_STATICS);
  elementOpen('tbody');
  for (var i = 0; i < dbs.length; i++) {
    var db = dbs[i];
    var topFiveQueries = db.getTopFiveQueries();
    var count = db.queries.length;

    elementOpen('tr', db.id);

    // name
    elementOpen('td', null, DBNAME_STATICS);
    text(db.name);
    elementClose('td');

    // count
    elementOpen('td', null, QC_STATICS);
    elementOpen('span', null, null,
                'class', labelClass(count));
    text(count);
    elementClose('span');
    elementClose('td');

    // queries
    for (var j = 0; j < 5; j++) {
      var q = topFiveQueries[j];
      var elapsed = q.elapsed;
      elementOpen('td', null, null,
                  'class', elapsedClass(elapsed));
      text(formatElapsed(elapsed));

      elementOpen('div', null, POPOVER_STATICS);
      elementOpen('div', null, POPOVER_CONTENT_STATICS);
      text(q.query);
      elementClose('div');

      elementOpen('div', null, POPOVER_ARROW_STATICS);
      elementClose('div');
      elementClose('div');

      elementClose('td');
    }
    elementClose('tr');
  }
  elementClose('tbody');
  elementClose('table');
}

document.addEventListener('DOMContentLoaded', function() {
  main();
});

function main() {
  var dbs = [];
  for (var i = 0; i < N; i++) {
    dbs.push(new data.Database('cluster' + i));
    dbs.push(new data.Database('cluster' + i + 'slave'));
  }

  setInterval(function() {
    update(dbs);
  }, I);

  function domUpdate() {
    patch(document.body, function() {
      render(dbs);
    });
    requestAnimationFrame(domUpdate);
  }
  domUpdate();
}
