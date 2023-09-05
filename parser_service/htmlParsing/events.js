const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const syncFetch = require('sync-fetch')
const cheerio = require('cheerio')
const update = require('../update/updateEvents');
const url = "https://mariborinfo.com/dogodki";
let mapData = new Map();
let events = [];

module.exports = {

    update: function(dataSeriesId){
        fetch(process.env.mainAPIurl + '/events/seriesList/' + dataSeriesId)
        .then(res => res.json())
        .then(eventData =>{ 
            console.log("In events")
            eventData.forEach(obj => {
                
                obj.resolved = false;
                mapData.set(obj.eventId, obj)
            })

            fetch(url)
            .then(res => res.text())
            .then(html => {
                
                const $ = cheerio.load(html);
                $('.view-row-group').each((i,value) =>{
                    let eventId, eventUrl, title, startTime, endTime = "", address, content = "", fetchAddress;
                    let longitude = 0
                    let latitude = 0
                    eventId = $(value).find('article').attr('data-history-node-id');
                    eventUrl = "https://mariborinfo.com/" + $(value).find('a').attr('href')
                    let articleHTML = syncFetch(eventUrl);
                    const $$ = cheerio.load(articleHTML.text())
                    title = $$('.page-title').text()
                    
                    let jump = false; //Used for jumping the end of event time
                    $$('time').each((i,val) =>{
                        
                        if(!jump){
                            startTime = $(val).attr('datetime')
                            jump = true
                        }else{
                            endTime = $(val).attr('datetime')
                        }
                    })

                    address  = $$('.field__item > a').text()
                    let splitAddress = "";
                    fetchAddress = address;
                    if (address.indexOf(',') > -1){
                        splitAddress = address.split(',');
                        if(splitAddress.length == 2){
                            fetchAddress = splitAddress[0]
                        }else{
                            fetchAddress = splitAddress[1]
                        }
                    }

                    let addressAPI = syncFetch( process.env.nominatimAPIurl + `/search.php?street=${fetchAddress}&city=maribor&format=jsonv2`)
                    addressAPI = addressAPI.json()
                    if (addressAPI[0] != undefined) {
                        latitude = addressAPI[0].lat
                        longitude = addressAPI[0].lon
                    }

                    $$('.field__item > p').each((i,val) => {
                        content = content + $(val).text() + "\n"
                    })
                    
                    let event = {
                        title: title,
                        content: content,
                        start: startTime,
                        end: endTime,
                        url: eventUrl,
                        address: address,
                        latitude: latitude,
                        longitude: longitude,
                        dataSeries: dataSeriesId,
                        eventId: eventId
                    }
                    events.push(event)

                })
                
                events.forEach(event =>{
                
                    if(mapData.get(event.eventId.toString()) == undefined){
                        console.log("Events Object Created")
                        update.create(event);

                    }else{
                        console.log("WIFI Object already exists")
                        compare(mapData.get(event.eventId), event, dataSeriesId)
                        event.resolved = true;
                        mapData.set(event.eventId, event)
                    }
        
                })
                mapData.forEach(event =>{
                    if(!event.resolved){
                        update.delete(event._id)
                    }
                })
            })
        })
    }
}

function compare(event, obj, dataSeriesId) {

    if (
        event.title != obj.title ||
        event.address != obj.address ||
        event.url != obj.url ||
        event.eventId != obj.eventId 
    ) {
        obj.id = event._id
        obj.dataSeries = dataSeriesId
        console.log("WIFI Object Updated")
        update.update(obj);
    }
};