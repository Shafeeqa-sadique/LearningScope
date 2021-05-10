/* ========================================================================== */
/*                      DATABASE CONNECTION PROVIDER FOR WHOLE APP            */
/* ========================================================================== */
var Connection  = require('tedious').Connection;
var Request     = require('tedious').Request;
var config      = require('./config');

var connection = new Connection(config);

/*-------------------  CONNECTION SETTINGS STATUS ------------------- */ 

connection.on('connect', connected);
connection.on('infoMessage', infoError);
connection.on('errorMessage', infoError);
connection.on('end', end);
connection.on('debug', debug);

/*-------------------  CONNECTION CONNECTED STATUS ------------------- */ 

function connected(err) {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    process.stdin.resume();
  
    process.stdin.on('data', function (chunk) {
      exec(chunk);
    });
  
    process.stdin.on('end', function () {
      process.exit(0);
    });
}

/*-------------------  CONNECTION CONNECTED execute ------------------- */ 

function exec(sql) {
    sql = sql.toString();
  
    request = new Request(sql, statementComplete)
    request.on('columnMetadata', columnMetadata);
      request.on('row', row);
      request.on('done', requestDone);
  
    connection.execSql(request);
}

/*-------------------  CONNECTION CONNECTED REQUEST ------------------- */ 

function requestDone(rowCount, more) {
    console.log(rowCount + ' rows');
}
 
/*-------------------  CONNECTION CONNECTED COMPLETE ------------------- */ 

function statementComplete(err, rowCount) {
    if (err) {
      console.log('Statement failed: ' + err);
    } else {
      console.log(rowCount + ' rows');
    }
}

/*-------------------  CONNECTION CONNECTED END ------------------- */ 
  
function end() {
    console.log('Connection closed');
    process.exit(0);
}

/*-------------------  CONNECTION CONNECTED ERROR INFORMATION ------------------- */ 

function infoError(info) {
    console.log(info.number + ' : ' + info.message);
}
  
/*-------------------  CONNECTION CONNECTED DEBUG DETAIL ------------------- */ 

function debug(message) {
}

/*-------------------  CONNECTION CONNECTED COLUMN DETAIL ------------------- */ 

function columnMetadata(columnsMetadata) {
    columnsMetadata.forEach(function(column) {
    });
}

/*-------------------  CONNECTION CONNECTED ROW DETAILS ------------------- */ 

function row(columns) {
    var values = '';
  
    columns.forEach(function(column) {
      if (column.value === null) {
        value = 'NULL';
      } else {
        value = column.value;
      }
  
      values += value + '\t';
    });
  
    console.log(values);
}

module.exports = connection;