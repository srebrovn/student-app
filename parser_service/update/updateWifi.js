const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {

    create: function(wifi){
        
        fetch(process.env.mainAPIurl + "/wifi" , {
            method : "POST",
            headers: { 'Content-Type': 'application/json' },
            body : JSON.stringify(wifi)

       }).catch(err => console.log(err))
    },

    update: function(wifi){
        fetch(process.env.mainAPIurl + "/wifi/" + wifi.id , {
            method : "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(wifi)
        }).catch(err => console.log(err))
    },

    delete: function(id){

        fetch(process.env.mainAPIurl + "/wifi/" + id, {
            method: 'DELETE'
        }).then(response => console.log("RES" + response)).catch(err => console.error(err));

    }

}