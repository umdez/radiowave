'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    ltx = require('ltx');

function Router() {
    EventEmitter.call(this);
}

util.inherits(Router, EventEmitter);

/**
 * verify if a given stanza can be handled by this module
 */
Router.prototype.match = function (stanza) {};

/**
 * handles xmpp stanzas
 */
Router.prototype.handle = function (stanza) {};

/**
 * send messages and start routing
 */
Router.prototype.send = function (stanza) {
    console.log('send stanza: ' + stanza.toString());
    this.emit('send', stanza);
};

/**
 * Send an error to the original sender of the message
 *
 * @params stanza original message from the sender
 */
Router.prototype.sendError = function (stanza, err) {
    var response = new ltx.Element(stanza.getName(), {
        from: stanza.attrs.to,
        to: stanza.attrs.from,
        id: stanza.attrs.id,
        type: 'error'
    });

    // attach error detail
    if (err) {
        response.cnode(err);
    }

    this.send(response);
};

/**
 * Respond with success to the original message
 *
 * @params stanza original message from the sender
 */
Router.prototype.sendSuccess = function (stanza, detail) {
    var response = new ltx.Element('iq', {
        from: stanza.attrs.to,
        to: stanza.attrs.from,
        id: stanza.attrs.id,
        type: 'result'
    });

    // attach error detail
    if (detail) {
        response.cnode(detail);
    }

    this.send(response);
};

Router.prototype.chain = function (router) {
    var self = this;

    this.on('stanza',function(stanza){
        router.handle(stanza);
    });

    router.on('send', function (stanza) {
        self.send(stanza);
    });

    return router;
};

module.exports = Router;