const update = require('../update/updateStudentWork')
const mjobAPIgetJobs = 'https://www.mjob.si/api/getJobOffers'

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Syncfetch = require('sync-fetch')

var mapData = new Map();
//var studentWorkModel = require('../../models/studentWorkModel.js');
//FIXME those companies that are not in Maribor we should search by the location of work if posiible or just remove their location
module.exports = {
    update: function (dataSeriesId) {
        fetch(process.env.mainAPIurl + '/studentWork/seriesList/' + dataSeriesId)
            .then(response => response.json())
            .then(studentWork => {
                console.log("In mjob")
                // mapping data
                studentWork.forEach(object => {
                    object.resolved = false;
                    mapData.set(object.fetchId, object);
                });
                
                //requesting the data
                var response = Syncfetch(mjobAPIgetJobs).json();
                
                // var result = response.filter(data => data.city == "Maribor")
                var result = response.data.filter( function (el){
                    return el.city == "Maribor";
                });
                console.log(result)
                //var test = result.slice(0, 10) //for testing

                //going thru every result and
                result.forEach(job => {
                    //parsing the street address for the request
                    job.Naslov = job.jobName.toLowerCase()
                    var array = job.jobName.split(' ')
                    var street = ""
                    var prevAtribute = undefined //previous attribute is added to preven street=cestav+rošpoh+22&city=kamnica  should be cesta+v
                    array.forEach(attribute => {
                        if (attribute.length == 1 && isNaN(attribute) && !isNaN(prevAtribute)) { // checking if adreess has a number and ther is a space before it i should be 8a but is 8 a
                            street = street.slice(0, -1)//removing the +
                            street += attribute + "+"
                        } else {
                            street += attribute + "+"
                        }
                        prevAtribute = attribute
                    })
                    street = street.slice(0, -1)//removing the last plus
                    //requesting lat and lon from nominatim API
                    var data = Syncfetch(process.env.nominatimAPIurl + `/search.php?street=${street}&city=${job.city.toLowerCase()}&format=jsonv2`)
                    data = data.json()
                    //setting lat and lon
                    if (data[0] == undefined) {
                        job.lat = 0
                        job.lon = 0
                    } else {
                        job.lat = data[0].lat
                        job.lon = data[0].lon
                    }
                    
                    if (mapData.get(job.id.toString()) == undefined) {
                        console.log("Mjob Object Created")
                        update.create(createObj(job, dataSeriesId))
                    } else {
                        //compares two jobs if they are different it is updated
                        console.log("Mjob Object already exists")
                        compare(mapData.get(job.id.toString()), job, dataSeriesId)
                        //resolved
                        job.resolved = true;
                        mapData.set(job.id.toString(), job)
                    }
                })
                //checking if all the jobs still exist, if not it deletes them
                mapData.forEach(job => {
                    if (!job.resolved) {
                        update.delete(job._id)
                    }
                })
            })
    }
}

function createObj(obj, dataSeriesId) {//naredi data series
    if (obj.minPay != null) {
        var bruto = (parseFloat(obj.minPay) * 1.183).toFixed(2)
    } else {
        var bruto = 0
        obj.NetoOd = 0
    }

    var studentWork = {
        type: obj.workType,
        subType: obj.workTypeFirstLevel,
        payNET: parseFloat(obj.minPay),
        payGROSS: parseFloat(bruto),
        description: obj.description,
        length: obj.durationOfWork,
        workTime: obj.workTimeName,
        company: obj.companyName,
        email: obj.contactEmail,
        phone: obj.contactPhone,
        address: `${obj.location.toLowerCase()}, ${obj.post} ${obj.city.toLowerCase()}`,
        longitude: obj.lon,
        latitude: obj.lat,
        link: obj.urlAddress,
        fetchId: obj.id.toString(),
        dataSeries: dataSeriesId
    };
    
    return studentWork
}

//compares two job and if they are different then it updates
function compare(studentWork, obj, dataSeriesId) {
    var compare = createObj(obj, dataSeriesId);

    if (
        studentWork.type != compare.type ||
        studentWork.subType != compare.subType ||
        studentWork.payNET != compare.payNET ||
        studentWork.descripction != compare.descripction ||
        studentWork.length != compare.length ||
        studentWork.workTime != compare.workTime ||
        studentWork.company != compare.company ||
        studentWork.email != compare.email ||
        studentWork.phone != compare.phone ||
        studentWork.address != compare.address ||
        studentWork.link != compare.link ||
        studentWork.fetchId != compare.fetchId ||
        studentWork.dataSeries != compare.dataSeries
    ) {
        compare.id = studentWork._id
        console.log("Mjob Object Updated")
        update.update(compare);
    }
};
/*
//format of data recieved
    StevilkaDela: 187656,
    DatumUra: '06.05.2022',
    VrstaDelaId: 818,
    VrstaDela: 'DELO V TRAFIKI',
    VrstaDelaIdPrviNivo: 752,
    VrstaDelaPrviNivo: 'Prodaja, promocije, trženje',
    UrnaPostavka: '',
    Spol: 'vseeno',
    SpolObvezen: 'moški/ženski',
    Status: 0,
    StatusNaziv: 'dijak/študent/absolvent',
    DelovniCas: 0,
    DelovniCasNaziv: 'po dogovoru',
    Telefon: '02 23 43 400',
    KrajDela: 'Maribor',
    RegijaId: 164,
    RegijaNaziv: 'Maribor z okolico',
    Utez: 3,
    OpisDela: 'Prodaja v trafiki in loteriji.',
    SteviloDelovnihMest: '1',
    TrajanjeDela: 'dlje časa',
    StarostOd: 18,
    StarostDo: 0,
    PrijavaNaDelo: 'D',
    DodatniPogoji: 'Polnoletnost,\r\nprijaznost,\r\nveselje do dela z ljudmi',
    Podjetje: 'MOJCA FRAS S.P., POSREDNIŠTVO PRI PRODAJI',
    Naslov: 'PEKEL 32B',
    Posta: '2211',
    Kraj: 'PESNICA PRI MARIBORU',
    KontaktOseba: 'ga. Mojca Fras',
    KontaktTelefon: '040 551 160',
    KontaktEmail: '',
    naziv: 'Delo v trafiki',
    Kontakt: '',
    Nudimo: '',
    Obseg: '',
    Pricakujemo: '',
    Izvor: 'S',
    TipOglasaId: 2,
    TipOglasaNaziv: 'dolgotrajno delo',
    UrlNaslov: 'https://mjob.si/prosta-dela/?id=187656',
    VrstaDelaSlika: '753',
    OpisNarocnik: 'Podjetje potrebuje polnoletno, odgovorno osebo za pomoč pri prodaji v trafiki oziroma loteriji. Delovni čas je po dogovoru. V kolikor te delo zanima se hitro prijavi. Ne pozabi povedati, da si oglas videl na Mjob-u. V kolikor se dogovoriš za delo, nam sporoči, da ti uredimo napotnico.',
    ZahtevanaZnanja: '',
    VozniskiIzpit: '',
    LastenPrevoz: '',
    JezikNaziv: '',
    Kupec: '936710',
    ImgKupec: '',
    KupecKratkiNaziv: '',
    Veljavnost: '11.05.2022',
    OpisFooter: '',
    NetoTip: 1,
    NetoOd: '5.21',
    NetoDo: null,
    VD_ID: 6,
    KD_ID: 2,
    Doma: '',
    Sodelovanje: 0,
    LokacijaDela: 'Maribor'*/
