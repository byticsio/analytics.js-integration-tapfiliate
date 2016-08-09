'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');

/**
 * Expose `Tapfiliate` integration.
 */

var Tapfiliate = module.exports = integration('Tapfiliate')
  .global('tap')
  .option('account-id', '')
  .tag('<script src="//static.tapfiliate.com/tapfiliate.js">');

/**
 * Initialize.
 *
 * @api public
 */

Tapfiliate.prototype.initialize = function() {
  /* eslint-disable */
  (function(w) {
    var i;
    window['TapfiliateObject'] = i = 'tap';
    w[i] = w[i] || function () {
        (w[i].q = w[i].q || []).push(arguments);
    };
  })(window);
  /* eslint-enable */

  window.tap('create', this.options['account-id']);

  this.load(this.ready);
};

/**
 * Loaded?
 *
 * @api private
 * @return {boolean}
 */

Tapfiliate.prototype.loaded = function() {
  return !!(window.tap && window.tap.Conversion);
};

/**
 * Page.
 *
 * @param {String} category (optional)
 */

Tapfiliate.prototype.page = function() {
  window.tap('detectClick');
};

/**
 * Track.
 *
 * @api public
 * @param {Track} track
 */

Tapfiliate.prototype.track = function(track) {
  var props = track.properties();
  var evt = track.event();
  var opts = track.options(this.name);

  if (!opts.conversion) return;

  var externalId = props.orderId || null;
  var amount = props.value || props.revenue || null;

  var meta = {
    event: evt
  };

  for (var key in props) {
    if (!(/string|number|boolean/).test(typeof props[key]) || ['orderId', 'value', 'revenue'].indexOf(key) !== -1) continue;
    meta[key] = props[key];
  }

  window.tap('conversion', externalId, amount, { meta_data: meta });
};
