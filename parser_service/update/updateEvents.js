const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));


module.exports = {

    create: function(event){
        fetch(process.env.mainAPIurl + '/events' , {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        }).catch(err => console.error(err));

    },
    
    delete: function(id){
        fetch(process.env.mainAPIurl + '/events/' + id, {
            method : 'DELETE',
        }).then(response => console.log(response)).catch(err => console.error(err));

    },

    update: function(event){
        fetch(process.env.mainAPIurl + '/events/' + event.id, {
            method : 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)

        }).catch(err => console.error(err));
    }
}