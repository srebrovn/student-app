var schedule = require('node-schedule');
const update = require('./update/update');
require("dotenv").config();

var Counter = 0;
// var j = schedule.scheduleJob('0 0 */1 * * *', function () {  // this for every hour
    update.update();
    console.log("Counter: " + Counter)
    Counter++
// });