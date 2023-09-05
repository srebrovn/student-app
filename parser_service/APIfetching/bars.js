const update = require('../update/updateBars');

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


let mapData = new Map();
let urlBars = `https://nominatim.openstreetmap.org/search?q=[amenity=bar]&format=json&bounded=true&viewbox=15.60041,46.56974,15.70186,46.53704&limit=100`;
let urlCaffe = `https://nominatim.openstreetmap.org/search?q=[amenity=cafe]&format=json&bounded=true&viewbox=15.60041,46.56974,15.70186,46.53704&limit=100`;
let urlPubs = `https://nominatim.openstreetmap.org/search.php?q=Bar&viewbox=15.53363%2C46.57975%2C15.77739%2C46.51139&bounded=1&dedupe=0&limit=200&exclude_place_ids=203168837&format=jsonv2`;
let amenities = [];

module.exports = {

    update: function(dataSeriesId){
        fetch(process.env.mainAPIurl + '/bars/seriesList/' + dataSeriesId)
            .then(res => res.json())
                .then(async bars =>{
                    console.log("In bars")
                    bars.forEach(obj => {
                        obj.resolved = false;
                        mapData.set(obj.place_id, obj)
                    })
                    
                    let resBars = await fetch(urlBars);
                    let barsFetch = await resBars.json();
                    let resCaffe = await fetch(urlCaffe);
                    let caffe = await resCaffe.json();
                    let resPubs = await fetch(urlPubs);
                    let pubs = await resPubs.json()
                    for(let i in barsFetch){
                        
                        let tmpNameAddress = barsFetch[i].display_name;
                        let name = tmpNameAddress.substring(0, tmpNameAddress.indexOf(','));
                        let address = tmpNameAddress.substring(tmpNameAddress.indexOf(',') + 1);
                        let tmp = {
                            place_id : barsFetch[i].place_id,
                            latitude: barsFetch[i].lat,
                            longitude: barsFetch[i].lon,
                            name : name,
                            address, address,
                            type: barsFetch[i].type,
                            dataSeries: dataSeriesId
                        }
                        amenities.push(tmp)
                    }
                    
                    for(let i in pubs){
                        
                        let tmpNameAddress = pubs[i].display_name;
                        let name = tmpNameAddress.substring(0, tmpNameAddress.indexOf(','));
                        let address = tmpNameAddress.substring(tmpNameAddress.indexOf(',') + 1);
                        let tmp = {
                            place_id : pubs[i].place_id,
                            latitude: pubs[i].lat,
                            longitude: pubs[i].lon,
                            name : name,
                            address, address,
                            type: pubs[i].type,
                            dataSeries: dataSeriesId
                        }
                        amenities.push(tmp)
                    }

                    for(let i in caffe){
                      
                        let tmpNameAddress = caffe[i].display_name;
                        let name = tmpNameAddress.substring(0, tmpNameAddress.indexOf(','));
                        let address = tmpNameAddress.substring(tmpNameAddress.indexOf(',') + 1);
                        let tmp = {
                            place_id : caffe[i].place_id,
                            latitude: caffe[i].lat,
                            longitude: caffe[i].lon,
                            name : name,
                            address, address,
                            type: caffe[i].type,
                            dataSeries: dataSeriesId
                        }
                        amenities.push(tmp)
                    }
                   
                    for(let i in amenities){
                        if(mapData.get(amenities[i].place_id) == undefined){                       
                            console.log("Bar Object Created")
                            update.create(amenities[i]);
                        }else{                         
                            console.log("Bar Object already exists")
                            compare(mapData.get(amenities[i].place_id), (amenities[i]), dataSeriesId)
                            amenities[i].resolved = true;
                            mapData.set(amenities[i].place_id, amenities[i])
                        }
                    }
                    
                    mapData.forEach(bar =>{
                        if(!bar.resolved){
                            
                            update.delete(bar._id)
                        }
                     })
                     
                })     
    }
}

function compare(bar, obj, dataSeriesId) {
    
    
    if (
        bar.place_id != obj.place_id ||
        bar.name != obj.name ||
        bar.type != obj.type
        
    ) {
        console.log("Bar Object Updated")
        obj.id = bar._id
        obj.dataSeries = dataSeriesId
        update.update(obj);
    }
};


/*Object template:

{   "name": "Kava bar Bella",
    "address": " 90, Zrkovska cesta, Pobrežje, Maribor, 2000, Slovenija",
    "location": {    "type": "Point",    "coordinates": [      46.5546521,      15.6745896    ]  },
    "dataSeries": {    "$oid": "62895ea5753769e046b1eaae"  },
    "place_id": 58509135,  
    "type": "cafe", 
    }
*/