const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


module.exports = {

    create: function(restaurant){
        fetch(process.env.mainAPIurl + '/restaurants' , {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restaurant)
        }).catch(err => console.error(err));

    },
    
    delete: function(id){
        fetch(process.env.mainAPIurl + '/restaurants/' + id, {
            method : 'DELETE',
        }).then(response => console.log(response)).catch(err => console.error(err));

    },

    update: function(restaurant){
        fetch(process.env.mainAPIurl + '/restaurants/' + restaurant.id, {
            method : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restaurant)

        }).catch(err => console.error(err));
    }
}