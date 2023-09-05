const update = require('../update/updateStudentWork')

const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

var mapData = new Map();
//var studentWorkModel = require('../../models/studentWorkModel.js');
//FIXME those companies that are not in Maribor we should search by the location of work if posiible or just remove their location
module.exports = {
    update: async function (dataSeriesId) {
        var dat = []
        fetch('http://localhost:3000/studentWork/seriesList/' + dataSeriesId)
            .then(response => response.json())
            .then(async studentWork => {

                //console.log(studentWork)
                /* mapData = studentWork.reduce(function (map, obj) {
                     obj.re = newsolved = false;
                     map[obj.fetchId] = obj;
                     return map;
                 }, {});*/
                //mapData = new Map();

                studentWork.forEach(object => {
                    object.resolved = false;
                    mapData.set(object.fetchId, object);
                });
                // console.log(mapData)

                var awaitdata = await Promise.all([fetch('https://www.mjob.si/api/getJobOffers')
                    .then(response => response.json())
                    .then(data => {
                        var result = data.filter(data => data.KrajDela == "Maribor")
                        var test = result.slice(0, 10)
                        //console.log(test)
                        //console.log(result)
                        //var job = result[0]
                        test.forEach(job => {
                            job.Naslov = job.Naslov.toLowerCase()
                            var array = job.Naslov.split(' ')
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

                            street = street.slice(0, -1)
                            //console.log(street)

                            var data = fetch(`http://oskardolenc.eu:591/search.php?street=${street}&city=${job.Kraj.toLowerCase()}&format=jsonv2`)
                                .then(response => response.json())
                                .then(data => {
                                    //console.log(`http://oskardolenc.eu:591/search.php?street=${street}&city=${job.Kraj.toLowerCase()}&format=jsonv2`)
                                    job.lat = data[0].lat
                                    job.lon = data[0].lon

                                    //var jobDB = studentWork.find(x => x.fetchId == job.StevilkaDela)ž
                                    // console.log(job)
                                    //console.log(job.StevilkaDela, mapData[job.StevilkaDela])

                                    if (mapData.get(job.StevilkaDela.toString()) == undefined) {
                                        console.log(job.StevilkaDela)
                                        update.create(createObj(job, dataSeriesId))
                                        //console.log(job, mapData[job.StevilkaDela])
                                        console.log("creating")
                                    } else {
                                        compare(mapData.get(job.StevilkaDela.toString()), job)
                                        job.resolved = true;
                                        console.log("resolved")
                                        mapData.set(job.StevilkaDela.toString(), job)

                                    }

                                });
                        })
                    }).then(

                    )])
                console.log(awaitdata)
                if (awaitdata != undefined) {
                    console.log("in here ??")
                    mapData.forEach(job => {
                        //console.log(job)
                        if (!job.resolved) {
                            console.log("deleting")
                            //update.delete(job._id)
                        }
                    })
                }


            }).catch(err => console.log(err));
    }
}

function createObj(obj, dataSeriesId) {//naredi data series
    if (obj.NetoOd != null) {
        var bruto = (parseFloat(obj.NetoOd) * 1.183).toFixed(2)
    } else {
        var bruto = ""
    }

    var studentWork = {
        type: obj.VrstaDela,
        subType: obj.VrstaDelaPrviNivo,
        payNET: obj.NetoOd,
        payGROSS: bruto,
        descripction: obj.OpisNarocnik,
        length: obj.length,
        workTime: obj.DelovniCasNaziv,
        company: obj.Podjetje,
        email: obj.KontaktEmail,
        phone: obj.KontaktTelefon,
        address: `${obj.Naslov.toLowerCase()}, ${obj.Posta} ${obj.Kraj.toLowerCase()}`,
        location: {
            type: 'Point',
            coordinates: [parseFloat(obj.lon), parseFloat(obj.lat)]
        },
        link: obj.UrlNaslov,
        fetchId: obj.StevilkaDela,
        dataSeries: dataSeriesId
    };
    return studentWork
}

function deleteWork(obj) {//TODO popravi
    studentWorkModel.findByIdAndRemove(obj.id, function (err, studentWork) {
        if (err) {
            return {
                message: 'Error when deleting the studentWork.',
                error: err
            };
        }

        return true
    });
}

//compares two job and if they are different then it updates
function compare(studentWork, obj, dataSeriesId) {
    if (
        studentWork.type != obj.VrstaDela ||
        studentWork.subType != obj.VrstaDelaPrviNivo ||
        studentWork.payNET != obj.NetoOd ||
        studentWork.descripction != obj.OpisNarocnik ||
        studentWork.length != obj.length ||
        studentWork.workTime != obj.DelovniCasNaziv ||
        studentWork.company != obj.Podjetje ||
        studentWork.email != obj.KontaktEmail ||
        studentWork.phone != obj.KontaktTelefon ||
        studentWork.address != `${obj.Naslov.toLowerCase()}|| ${obj.Posta} ${obj.Kraj.toLowerCase()}` ||
        studentWork.link != obj.UrlNaslov ||
        studentWork.fetchId != obj.StevilkaDela ||
        studentWork.dataSeries != dataSeriesId
    ) {
        update.update(createObj(obj, dataSeriesId))
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
