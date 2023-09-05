const update = require('../update/updateStudentWork')
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const syncFetch = require ('sync-fetch');
const cheerio = require('cheerio');
let pages = 0;
let page = 1;
let mapData = new Map();
let articles = [];
const opts = {
    headers: {
        cookie: '_gcl_au=1.1.1344305366.1652197828; _gid=GA1.2.1086623127.1652197828; pageType=studenti; twk_idm_key=VND5BUT-W1Nu3xCYnLaSk; cc_cookie_decline=null; cc_cookie_accept=cc_cookie_accept; __cookiePolicy=1; _dc_gtm_UA-39328711-1=1; user_auth=eyJpdiI6ImxtWktoTkoxV3RVM2xqbW81cXdYdUE9PSIsInZhbHVlIjoiZWozS3BMaU5ER3JnNnVjMWpEV0FCTXhVTktxZ00xNjRlWmVkblZJdUJUa0VJbDdQeTJnbGpsdmxQTG5SWHBwVW5mOTl6VnBSVmtoWmduQnUxV1EydDFBK0RnZExBSXlsMVBMaENLUU5kZlQyQWdaZnp4eGgxQVp0TDNDSE5qeWhxWmxBXC84eHJGdngwdnNDa3NQMWJETWlYVHNUV2g5N0NCcDV1ajAzdEZcL0U9IiwibWFjIjoiMTU5ZjA5NTczMGU3NGM2YTJjNjA4YmI5YWI4YjQyYjM3ZDE2ZmMwNDY4NjA1MDNiZGRjNDhjZjg0Y2NlMzU5YiJ9; ess_session=eyJpdiI6IldDNTdBejYzQjZwU1k1UWJVdkgrZ3c9PSIsInZhbHVlIjoiRHZcL2o4ell6ZTNXenpaK3MzUDJNRVwvaFF2cVhEelJVSFhZeU9CNktaeUliVmNLSjZEV2FLekI5Ykg0R2ZKbVwvXC9Vd1VhR2V0MG9pUHBcL2g3S3JwR3V1OTJkKzM2bUFcL3lzcGpWR3l1VkpDaVlEdHBwMVpFWTJxOGlndzZZWEtpeDkiLCJtYWMiOiJjYWIxMzY3N2NiZDI4OTQ0ZGI5ZDdlOGZmNTg5MjNkYWVjYWU1ZDc0MGMyNGM4NjFmMzIzMWYxYWJiOGI2MzU4In0=; _ga_V0R3DZK25P=GS1.1.1652216496.4.1.1652217338.0; _ga=GA1.2.112694377.1652197828; TawkConnectionTime=0; twk_uuid_6038a454385de407571a41d2={"uuid":"1.OxhEhr5RWb5N5grKDYoeQ55bJIqTv3nwP8rybA6xRs0nR97TQtCQOMkULzvmGXH18smQNdc4nsqDnF2qzQ2pwWPBZttxcjpvEZShgrKIHkszgLlIBMe9sQpqRfVQcbRUY9AaigOkcCPuw5opWGxstaXUOio9","version":3,"domain":"studentski-servis.com","ts":1652217339353}'
    }
};


module.exports = {
    update: function(dataSeriesId){
        fetch(process.env.mainAPIurl + '/studentWork/seriesList/' + dataSeriesId)
        .then(res => res.json())
        .then(studentWork =>{
            
            parseFun(page, dataSeriesId);
            let studentWorkParsed = articles;
            // // mapping data
            studentWork.forEach(object => {
                
                object.resolved = false;
                mapData.set(object.fetchId, object);
            });
            
            studentWorkParsed.forEach(job =>{
                
                if(mapData.get(job.fetchId.toString()) == undefined){
                    console.log("EServis Object Created")
                    update.create(job);
                }else{
                    console.log("EServis Object already exists")
                    compare(mapData.get(job.fetchId), job, dataSeriesId)
                    job.resolved = true;
                    mapData.set(job.fetchId, job);
                }
            })
            mapData.forEach(job => {
                if (!job.resolved) {
                    update.delete(job._id)
                }
            })
        })
    }
}

//compares two job and if they are different then it updates
function compare(studentWork, obj, dataSeriesId) {


    if (
        studentWork.type != obj.type ||
        studentWork.email != obj.email ||
        studentWork.phone != obj.phone ||
        studentWork.fetchId != obj.fetchId ||
        studentWork.link != obj.link
    ) {
        obj.id = studentWork._id
        obj.dataSeries = dataSeriesId
        console.log("EServis Object Updated")
        update.update(obj);
    }
};


function parseFun(number, dataSeriesId) {
   
    try {
        
        let url = "https://www.studentski-servis.com/studenti/prosta-dela/?kljb=&page="+number+"&regija%5B%5D=maribor-z-okolico";
        let html = syncFetch(url,opts);
        const $ = cheerio.load(html.text());

        if(pages === 0){
            let a = $('#results .pagination .page-items').children('div').last();
            pages = $(a).find("a").text();
        }

        $('article').each(function(i,value) {
            const fetchId = $(value).attr('data-jobid');
            const type = $(value).find("h3").text();
            const subType = $(value).find("h5").text();
            const description = $(value).find(".description").text();
            const pay = $(value).find(".job-payment a").text();
            let payNETT = 0;
            let payGROSS = 0;
            let length;
            let workTime;
            let company;
            let address;
            let contactPerson;
            let phoneNumber = "";
            let email = "";
            let lon;
            let lat;
            const urlPhone = "https://www.studentski-servis.com/studenti/reveal.php?id=" + fetchId + "&type=T"
            const urlEmail = "https://www.studentski-servis.com/studenti/reveal.php?id=" + fetchId + "&type=E"

            
            phoneHTML = syncFetch(urlPhone, opts);
            const $$ = cheerio.load(phoneHTML.text());
            phoneNumber = $$('a').text()
            
            emailHTML = syncFetch(urlEmail,opts);
            const $$$ = cheerio.load(emailHTML.text());
            email = $$$('a').text();
            

            const regexPay = /[0-9]+[.|,]?[0-9]+/g;
            if(pay.match(regexPay)){
                const matches = pay.matchAll(regexPay);
                let counter = 0;
                for(const match of matches){
                    if(counter == 0){
                        payNETT = match[0];
                        counter++
                        continue
                    }
                    payGROSS = match[0];
                }
            } 

            const regexLength = /Trajanje:(.+)/g;
            const regexWorkTime = /Delovnik:(.+)/g;
            $(value).find(".row .col-md .job-attributes li").each((i,value) =>{
                
                if($(value).text().match(regexLength)){
                    const matches = $(value).text().matchAll(regexLength)
                    for(const match of matches){
                        length = match[1]
                    }
                }else if ($(value).text().match(regexWorkTime)){
                    const matches = $(value).text().matchAll(regexWorkTime)
                    for(const match of matches){
                    workTime = match[1]
                    }
                }
            });
            const regexCompany = /Podjetje: (.+)/g;
            const regexAddress = /Naslov: (.+)/g;
            $(value).find(".collapse .job-detail .list-underlined li").each((i,value) => {
                    
                    if($(value).text().match(regexCompany)){
                        const matches = $(value).text().matchAll(regexCompany)
                        for(match of matches){
                            company = match[1]
                        }
                    }else if($(value).text().match(regexAddress)){
                        const matches = $(value).text().matchAll(regexAddress)
                        for(match of matches){
                            address = match[1]
                        }
                    }     
            });
            const regexContactPerson = /Kontaktna oseba: (.+)/g;
            if($(value).find(".collapse .row .col div p").text().match(regexContactPerson)){
                const matches = $(value).find(".collapse .row .col div p").text().matchAll(regexContactPerson);
                for(match of matches){
                    contactPerson = match[1]
                }
            }
            
            let addressToLower = address.toLowerCase();
            let addressSplit = addressToLower.split(' ');
           
            let addressAPI = syncFetch(`http://oskardolenc.eu:591/search.php?street=${addressSplit}&city=maribor&format=jsonv2`)
            addressAPI = addressAPI.json()
            if (addressAPI[0] == undefined) {
                lat = 0
                lon = 0
            } else {
                lat = addressAPI[0].lat
                lon = addressAPI[0].lon
            }
            let article = {
                fetchId: fetchId,
                type : type,
                subType : subType,
                payNET : payNETT,
                payGROSS : payGROSS,
                description : description,
                length : length,
                workTime : workTime,
                company : company,
                email : email,
                phone: phoneNumber,
                address : address,
                contactPerson: contactPerson,
                latutude: lat,
                longitude: lon,
                link: url,
                dataSeries: dataSeriesId
            
            }
            console.log("In eservis")
            articles.push(article);
            
        });

        // if(page < pages){
        //     page++;
        //     parseFun(page);
        // }
        return 0;
    } catch (error) {
        console.log("error" + error);
    }
    
}
