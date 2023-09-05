const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


module.exports = {

    create: function(bar){
        
        fetch(process.env.mainAPIurl + "/bars" , {
            method : "POST",
            headers: { 'Content-Type': 'application/json' },
            body : JSON.stringify(bar)

       }).catch(err => console.log(err))
    },

    update: function(bar){
        fetch(process.env.mainAPIurl + "/bars/" + bar.id , {
            method : "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bar)
        }).catch(err => console.log(err))
    },

    delete: function(id){

        fetch(process.env.mainAPIurl + "/bars/" + id, {
            method: 'DELETE'
        }).then(response => console.log("RES" + response)).catch(err => console.error(err));

    }


}