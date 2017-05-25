'use strict';

var Analytics = require('@segment/analytics.js-core').constructor;
var integration = require('@segment/analytics.js-integration');
var sandbox = require('@segment/clear-env');
var tester = require('@segment/analytics.js-integration-tester');
var Tapfiliate = require('../lib/');

describe('Tapfiliate', function() {
  var analytics;
  var tapfiliate;
  var options = {
    'account-id': '123-abc'
  };

  beforeEach(function() {
    analytics = new Analytics();
    tapfiliate = new Tapfiliate(options);
    analytics.use(Tapfiliate);
    analytics.use(tester);
    analytics.add(tapfiliate);
  });

  afterEach(function() {
    analytics.restore();
    analytics.reset();
    tapfiliate.reset();
    sandbox();
  });

  it('should have the right settings', function() {
    analytics.compare(Tapfiliate, integration('Tapfiliate')
      .global('tap')
      .option('account-id', ''));
  });

  describe('before loading', function() {
    beforeEach(function() {
      analytics.stub(tapfiliate, 'load');
    });

    describe('#initialize', function() {
      it('should create the window.tap object', function() {
        analytics.assert(!window.tap);
        analytics.initialize();
        analytics.assert(window.tap);
      });

      it('should call #load', function() {
        analytics.initialize();
        analytics.called(tapfiliate.load);
      });
    });
  });

  describe('loading', function() {
    it('should load', function(done) {
      analytics.initialize();
      analytics.load(tapfiliate, done);
    });
  });

  describe('after loading', function() {
    beforeEach(function(done) {
      analytics.once('ready', done);
      analytics.initialize();
    });

    describe('#page', function() {
      beforeEach(function() {
        analytics.stub(window.tap, 'page');
      });

      it('should call detectClick when page is loaded', function() {
        analytics.spy(window, 'tap');
        analytics.page();
        analytics.called(window.tap, 'detectClick');
      });
    });

    describe('#track', function() {
      beforeEach(function() {
        analytics.stub(window.tap, 'track');
      });

      it('should not send event if conversion option is not provided', function() {
        analytics.spy(window, 'tap');
        analytics.track('Event Name');
        analytics.didNotCall(window.tap);
      });

      it('should send an event, properties and options', function() {
        analytics.spy(window, 'tap');
        analytics.track('my-event', { revenue: 1, foo: 'bar', orderId: 'ORD123' }, { Tapfiliate: { conversion: true } });
        analytics.called(window.tap, 'conversion', 'ORD123', 1, { meta_data: { event: 'my-event', foo: 'bar' } });
      });
    });
  });
});
