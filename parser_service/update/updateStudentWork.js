const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {

    create: function (studentWork) {

        fetch(process.env.mainAPIurl + "/studentWork", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentWork)
        }).catch(err => console.error(err));
    },
    delete: function (id) {
        fetch(process.env.mainAPIurl + "/studentWork/" + id, {
            method: 'DELETE'
        }).then(response => console.log("Delete response" + response)).catch(err => console.error(err));
    },
    update: function (studentWork) {
        fetch(process.env.mainAPIurl + "/studentWork/" + studentWork.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentWork)
        }).catch(err => console.error(err));
    }
}