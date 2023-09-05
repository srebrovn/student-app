const mjob = require('../APIfetching/mjob');
const eServis = require ('../htmlParsing/eServis');
const bars = require('../APIfetching/bars')
const restaurants = require('../htmlParsing/studentskaPrehrana');
const events = require('../htmlParsing/events');
const wifi = require('../APIfetching/wifi')
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

var updateUnit = 60;

module.exports = {
    update: function () {
        fetch(process.env.mainAPIurl + '/dataSeries')
            .then(response => response.json())
            .then(data => {
                

                var mapData = new Map();
                data.forEach(object => {
                    object.lastUpdated = new Date(object.lastUpdated)
                    mapData.set(object.title, object);
                });

                // <========== Mjob ==========>
                var mjobSeries = mapData.get("MjobSWork")

                //refresh_rate * update_enota + last updated > Trenutni cas

                var timeToUpdate = mjobSeries.settings.refresh_rate * updateUnit;
                console.log("timeToUpdate: " + timeToUpdate);
                var newDateObj = new Date();
                newDateObj.setTime(mjobSeries.lastUpdated.getTime() + (timeToUpdate * 1000));
                // if (newDateObj.getTime() - 500 <= Date.now()) { //removing half a second to ensure stability 
                    
                    // mjobSeries.lastUpdated = Date.now();
                    // update(mjobSeries)
                    // mjob.update(mjobSeries._id)
                // }

                // <========== eServis ==========> // Needs update
                // let eServisSeries = mapData.get("eservisSWork");
                // timeToUpdate = eServisSeries.settings.refresh_rate * updateUnit;
                // newDateObj = new Date();
                // newDateObj.setTime(eServisSeries.lastUpdated.getTime() + (timeToUpdate * 1000));
                // if (newDateObj.getTime() - 500 <= Date.now()){
                    
                //     eServisSeries.lastUpdated = Date.now();
                //     update(eServisSeries);
                //     eServis.update(eServisSeries._id)
                // }

                // <========== BARS ==========>
                // let barsSeries = mapData.get("bars");
                // timeToUpdate = barsSeries.settings.refresh_rate * updateUnit;
                // newDateObj = new Date();
                // newDateObj.setTime(barsSeries.lastUpdated.getTime() + (timeToUpdate * 1000));
                // if(newDateObj.getTime() - 500 <= Date.now()){
                    
                    // barsSeries.lastUpdated = Date.now()
                    // update(barsSeries)
                    // bars.update(barsSeries._id)

                // }

                // <========== RESTAURANTS ==========>
                // let restaurantsSeries = mapData.get("restaurants");
                // timeToUpdate = restaurantsSeries.settings.refresh_rate * updateUnit;
                // newDateObj = new Date();
                // newDateObj.setTime(restaurantsSeries.lastUpdated.getTime() + (timeToUpdate * 1000))
                
                // if(newDateObj.getTime() - 500 <= Date.now()){
                    
                    // restaurantsSeries.lastUpdated = Date.now()
                    // update(restaurantsSeries)
                    // restaurants.update(restaurantsSeries._id)

                // }

                 // <========== EVENTS ==========>
                // let eventSeries = mapData.get('events');
                // timeToUpdate = eventSeries.settings.refresh_rate * updateUnit;
                // newDateObj = new Date();
                // newDateObj.setTime(eventSeries.lastUpdated.getTime() + (timeToUpdate * 1000))
                
                // if(newDateObj.getTime() - 500 <= Date.now()){
                    // eventSeries.lastUpdated = Date.now()
                    // update(eventSeries)
                    // events.update(eventSeries._id)
                // }

                 // <========== WIFI ==========>
                let wifiSeries = mapData.get('wifisEduroam')
                timeToUpdate = wifiSeries.settings.refresh_rate * updateUnit;
                newDateObj = new Date();
                newDateObj.setTime(wifiSeries.lastUpdated.getTime() + (timeToUpdate * 1000))
               
                // if(newDateObj.getTime() - 500 <= Date.now()){
                    wifiSeries.lastUpdated = Date.now()
                    update(wifiSeries)
                    wifi.update(wifiSeries._id)
                // }

            }).catch(function (error) {
                console.log("data Series fetch", error);
            });
    }
}

function update(series) {
    fetch(process.env.mainAPIurl + '/dataSeries/' + series._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(series)
    }).catch(function (error) {
        console.log("Update v update.js error" + error);
    });
}