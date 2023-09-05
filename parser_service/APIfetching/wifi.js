const update = require('../update/updateWifi');
const tj = require("@tmcw/togeojson");
const fs = require("fs");
const https = require("https");
const url = "https://aai.arnes.si/static/eduroam/kml/si.kml";
const { features } = require('process');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

let newWifi = [];
const LONGITUDE_MIN = 15.600410;
const LONGITUDE_MAX = 15.701860;
const LATITUDE_MIN = 46.537040;
const LATITUDE_MAX = 46.569740;
let mapData = new Map();
module.exports = {

    update: function(dataSeriesId){
        fetch(process.env.mainAPIurl + '/wifi/seriesList/' + dataSeriesId)
        .then(res => res.json())
        .then (async wifi => {
            console.log("In wifi")
            
            let download = new Promise((resolve,reject) => {

                https.get(url, (res) => {
                    const path = "./si.kml";
                    const writeStream = fs.createWriteStream(path);
    
                    res.pipe(writeStream);
    
                    writeStream.on("finish", () => {
                        writeStream.close()
                        console.log("File Download Completed")
                        resolve()
                    })
                    writeStream.on('error', () =>{
                        reject()
                    })
                })

            })

            download.then(() => {
                wifi.forEach(obj =>{
                    obj.resolved = false;
                    mapData.set(obj.wifiId, obj)
                })
                
                const DOMParser = require('xmldom').DOMParser;
                const kml = new DOMParser().parseFromString(fs.readFileSync("./si.kml", "utf8"));
                const converted = tj.kml(kml)
                let features = converted.features;

                features.forEach(obj => {
                    if(obj.geometry.coordinates[0] >= LONGITUDE_MIN 
                        && obj.geometry.coordinates[0] <= LONGITUDE_MAX
                        && obj.geometry.coordinates[1] >= LATITUDE_MIN
                        && obj.geometry.coordinates[1] <= LATITUDE_MAX
                    ){
                        let wifiObj = {
                            name: obj.properties.name,
                            password: "",
                            latitude : obj.geometry.coordinates[1],
                            longitude : obj.geometry.coordinates[0],
                            dataSeries : dataSeriesId,
                            wifiId: obj.id
                        }
                        newWifi.push(wifiObj)
                        
                    }
                })
                
                newWifi.forEach(obj => {
                    
                    if(mapData.get(obj.wifiId) == undefined){
                        console.log("WIFI Object Created")
                        update.create(obj)
                    }else{
                        console.log("WIFI Object already exists")
                        obj.resolved = true;
                        mapData.set(obj.wifiId, obj)
                    }
                })
    
                mapData.forEach(wifi => {
                    if (!wifi.resolved){
                        console.log("WIFI Object Deleted")
                        update.delete(wifi._id)
                    }
                })

            })
        })
    }
}
