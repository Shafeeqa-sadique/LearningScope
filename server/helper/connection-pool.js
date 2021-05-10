/* ========================================================================== */
/*                      DATABASE CONNECTION POOL FOR WHOLE APP                */
/* ========================================================================== */

var ConnectionPool  = require('tedious-connection-pool');
var config          = require('./config');

/*-------------------  POOL CONFIGURATION ------------------- */ 

var poolConfig = {
  min: 2,
  max: 4,
  log: true,
  acquire: 30000,
  idle: 10000
};

/*------------------- CREATE THE POOL ------------------- */ 

var pool = new ConnectionPool(poolConfig, config);

pool.on('error', function(err) {
  console.error(err);
});

module.exports = pool;