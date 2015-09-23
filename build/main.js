'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _es6Promise = require('es6-promise');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('./utils');

var _endpoints = require('./endpoints');

var _endpoints2 = _interopRequireDefault(_endpoints);

if (!global.fetch) {
    require('isomorphic-fetch');
}

// import fetch from 'isomorphic-fetch';

var HOST = 'https://www.bungie.net/platform/Destiny/'; // the is address to Bungie's API

/** FIXME: this could potentially be broken up into smaller blocks
 *
 * appends a spec to the lirary via iteration.
 *
 * lib - Object, intially empty.
 * item - Object, Destiny::Method.
 */
var createRequest = function createRequest(lib, method) {

    var template = _lodash2['default'].template(method.url); // README: so that we can have parametised URLs

    lib[method.name] = function (params, headers) {
        return _es6Promise.Promise.resolve(params).then(function (params) {

            if (method.options && method.options.method === 'POST' && !_lodash2['default'].isObject(headers)) {
                _utils.UTILS.error('You are not providing the headers needed for Destiny.' + method.name + '() please see README.');
            }

            // throw if parameters isn't an object
            if (!_lodash2['default'].isObject(params)) {
                _utils.UTILS.error('Argument must be an Object containing: ' + method.required.join(', ') + '.');
            }

            // iterate over required fields to aggregate missing ones if not present in current call
            var missing = method.required.filter(function (field) {
                return !params.hasOwnProperty(field);
            });

            // throw for any missing required fields
            if (missing.length > 0) {
                _utils.UTILS.error('Please provide [' + missing.join(', ') + '] to Destiny.' + method.name + '()');
            }

            return params;
        }).then(function (params) {
            return fetch(HOST + template(params), _lodash2['default'].assign(method.options, { headers: _utils.UTILS.HEADERS, body: JSON.stringify(params) }));
        }).then(_utils.UTILS.json).then(_utils.UTILS.unwrapDestinyResponse);
    };

    return lib;
};

/**
 * preparing library for export
 */
var Destiny = function Destiny(config) {

    if (_lodash2['default'].isString(config.host)) {
        HOST = config.host;
    } else {
        HOST = 'https://www.bungie.net/platform/Destiny/';
    }

    _utils.UTILS.HEADERS['X-API-Key'] = config.apiKey;

    return _endpoints2['default'].reduce(createRequest, {});
};

exports['default'] = Destiny;
module.exports = exports['default'];