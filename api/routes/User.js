'use strict';

var ApiError = require('../utils/ApiError'),
    winston = require('winston'),
    logger = winston.loggers.get('webapi');

var UserManager = require('../lib/user');

var routes = function (app, storage) {
    logger.info('register user routes');

    var usrManager = new UserManager(storage);

    function getJid(req) {
        // req.user.username;
        console.log(JSON.stringify(req.user));
        return req.user.jid;
    }

    /**
     * Get the authenticated user
     */
    app.get('/api/user', function (req, res) {
        res.json({});
    });

    /**
     * Get a single user
     */
    app.get('/api/users/:user', function (req, res) {
        res.json({});
    });

    /**
     * List rooms for the authenticated user.
     */
    app.get('/api/user/rooms', function (req, res) {
        var jid = getJid(req);
        var type = req.query.type; // all, owner, member.

        usrManager.findUser(jid).then(function(user){
            return usrManager.getRooms(user, type);
        }).then(function(rooms) {
            res.json(rooms);
        }).catch(function(err) {
            res.json(400, new ApiError());
        });

    });

    /**
     * Create a new rooms for the authenticated user.
     * {
     *    "name" : "room_name"
     * }
     */
    app.post('/api/user/rooms', function (req, res) {
        var jid = getJid(req);
        var data = req.body;

        // check that all required parameters are properly set
        if (!data || !data.name ||  data.name === '' ||  data.name === null) {
            res.json(new ApiError('name is missing'));
        }

        usrManager.findUser(jid).then(function(user){
            logger.debug('found user: ' + JSON.stringify(user));
            return usrManager.addRoom(user, data);
        }).then(function(room){
            logger.debug('found room: ' + JSON.stringify(room));
            res.json(room);
        }).catch(function(err) {
            console.error(err);
            logger.error(err);
            res.json(400, new ApiError());
        });
        
    });

    /**
     * List channels for the authenticated user.
     */
    app.get('/api/user/channels', function (req, res) {
        var jid = getJid(req);
        var type = req.query.type; // all, owner, member.

        usrManager.findUser(jid).then(function(user){
            return usrManager.getChannels(user, type);
        }).then(function(room){
            res.json(room);
        }).catch(function(err) {
            res.json(400, new ApiError());
        });

    });

    app.post('/api/user/channels', function (req, res) {
        var jid = getJid(req);
        var data = req.body;

        // check that all required parameters are properly set
        if (!data || !data.name ||  data.name === '' ||  data.name === null) {
            res.json(new ApiError('name is missing'));
        }

        usrManager.findUser(jid).then(function(user){
            return usrManager.addChannel(user, data);
        }).then(function(room){
            res.json(room);
        }).catch(function(err) {
            res.json(400, new ApiError());
        });
    });
};

// Expose routes
module.exports = routes;