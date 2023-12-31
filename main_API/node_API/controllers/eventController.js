const eventModel = require('../models/eventModel.js');
var EventModel = require('../models/eventModel.js');

/**
 * eventController.js
 *
 * @description :: Server-side logic for managing events.
 */
module.exports = {

    /**
     * eventController.list()
     */
    list: function (req, res) {
        EventModel.find().sort({ start: 1 }).exec(function (err, events) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting event.',
                    error: err
                });
            }

            return res.json(events);
        });
    },

    /**
     * eventController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        EventModel.findOne({ _id: id }, function (err, event) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting event.',
                    error: err
                });
            }

            if (!event) {
                return res.status(404).json({
                    message: 'No such event'
                });
            }

            return res.json(event);
        });
    },

    /**
     * eventController.create()
     */
    create: function (req, res) {
        var event = new EventModel({
            title: req.body.title,
            content: req.body.content,
            start: req.body.start,
            end: req.body.end,
            address: req.body.address,
            url : req.body.url,
            location: {
                type: 'Point',
                coordinates: [parseFloat(req.body.latitude), parseFloat(req.body.longitude)]
            },
            eventId: req.body.eventId,
            dataSeries: req.body.dataSeries
        });

        event.save(function (err, event) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating event',
                    error: err
                });
            }

            return res.status(201).json(event);
        });
    },

    /**
     * eventController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        EventModel.findOne({ _id: id }, function (err, event) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting event',
                    error: err
                });
            }

            if (!event) {
                return res.status(404).json({
                    message: 'No such event'
                });
            }

            event.name = req.body.name ? req.body.name : event.name;
            event.start = req.body.start ? req.body.start : event.start;
            event.finish = req.body.finish ? req.body.finish : event.finish;
            event.address = req.body.address ? req.body.address : event.address;
            event.location = req.body.location ? req.body.location : event.location;
            event.dataSeries = req.body.dataSeries ? req.body.dataSeries : event.dataSeries;

            event.save(function (err, event) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating event.',
                        error: err
                    });
                }

                return res.json(event);
            });
        });
    },

    /**
     * eventController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        EventModel.findByIdAndRemove(id, function (err, event) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the event.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    seriesList: function (req, res) {
        let id = req.params.id;
        EventModel.find({ seriesList: id }, function (err, events) {
            if (err) {
                return res.status(500).json({
                    message: "Error when getting Events using seriesList",
                    error: err
                });
            }
            return res.json(events);
        })
    },
    search: function (req, res) {
        var tag = req.body.search;
        var distance = req.body.distance;
        var longitude = req.body.longitude;
        var latitude = req.body.latitude;

        var searchConditions = {
            $and: [
                { name: { $regex: tag, $options: 'i' } },
            ]
        };
        if (distance != undefined && distance != '' && distance != 0
            && longitude != 0 && latitude != 0
            && longitude != undefined && latitude != undefined) {
            searchConditions.$and.push({
                location:
                {
                    $geoWithin:
                    {
                        $centerSphere: [[parseFloat(latitude), parseFloat(longitude)], parseFloat(distance) / 6378.15214]
                    }
                }
            });
        }
        EventModel.find(searchConditions).sort({ start: 1 }).exec(function (err, events) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting bars.',
                    error: err
                });
            }

            return res.json(events);
        })
    }
};
