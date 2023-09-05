const cheerio = require('cheerio');
const got = require('got');
const vgmUrl= 'https://www.studentska-prehrana.si/sl/restaurant';
const update = require('../update/updateRestaurants');
const syncFetch = require ('sync-fetch');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
var mapData = new Map();

module.exports = {

      update: function(dataSeriesId){
        fetch(process.env.mainAPIurl+ '/restaurants/seriesList/' + dataSeriesId)
          .then(res => res.json())
            .then(restaurant => {
              
              restaurant.forEach(obj => {
                obj.resolved = false;
                mapData.set(obj.restaurantId, obj);
              })
              
             
              got(vgmUrl).then(response => {
                const $ = cheerio.load(response.body);
              
                $('#restaurant-list').find('div').each((i,value) => {
                  
                  if($(value).attr('data-city') == 'MARIBOR'){
                      let name,price = 0,surcharge = 0,address = "",lat = 0,lon = 0, id, href;
            
                      id = $(value).attr('data-posid');
                      name = $(value).attr('data-lokal');
                      address = $(value).attr('data-naslov');
                      price = $(value).attr('data-cena');
                      price = price.replace(',', '.') // The main format is x,xx which can not be parsed to Float!
                      surcharge = $(value).attr('data-doplacilo');
                      surcharge = surcharge.replace(',', '.')
                      lat = $(value).attr('data-lat');
                      lon = $(value).attr('data-lon');
                      href = $(value).attr('data-detailslink');
                      
                      let url = `https://www.studentska-prehrana.si${href}`;
                      restaurantHTML = syncFetch(url);
                      const $$ = cheerio.load(restaurantHTML.text());
                      let workTime = $$("#menu > div > div.col.col-md-4 > div.col-md-12.margin-top-20 > div:nth-child(1) > div.row > div")
                      .text().replace(/\s+/g,' ').trim();

                    
                      let tmpObj = {
                        name : name,
                        surcharge : surcharge,
                        price : price,
                        address : address,
                        workTime : workTime,
                        latitude: lat,
                        longitude: lon,
                        restaurantId : id,
                        dataSeries : dataSeriesId
                      }
                      
                      if(mapData.get(tmpObj.restaurantId) == undefined){
                        console.log("Prehrana Object Created")
                        update.create(tmpObj);
                      }else{
                        console.log("Prehrana Object already exists")
                        compare(mapData.get(tmpObj.restaurantId.toString()), tmpObj)
                        tmpObj.resolved = true;
                        mapData.set(tmpObj.restaurantId.toString(), tmpObj)
                      }
                    }
            
                  })
                  mapData.forEach(restaurant =>{
                    if(!restaurant.resolved){
                      update.delete(restaurant._id)
                    }
                }) 
                
                }).catch(err => {
                  console.log("Prehrana error" + err);
                });
                 
          })
      }
}

function compare(restaurant, newRestaurant){

  if (
      restaurant.name != newRestaurant.name ||
      restaurant.surcharge != newRestaurant.surcharge ||
      restaurant.price != newRestaurant.price ||
      restaurant.address != newRestaurant.address ||
      restaurant.restaurantId != newRestaurant.restaurantId ||
      restaurant.dataSeries != newRestaurant.dataSeries
  ) {
      newRestaurant.id = restaurant._id
      console.log("Prehrana Object Updated")
      update.update(newRestaurant);
  }

}


