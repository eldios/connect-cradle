/*!
 * Connect - Cradle
 * Copyleft 2011 ElDios aka 'Lele' <lele@amicofigo.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var cradle = require('cradle');

/**
 * One day in seconds.
 */

var oneDay = 86400;

/**
 * Return the `CradleStore` extending `connect`'s session Store.
 *
 * @param {object} connect
 * @return {Function}
 * @api public
 */

module.exports = function(connect){

  /**
   * Connect's Store.
   */

  var Store = connect.session.Store;

  /**
   * Initialize CradleStore with the given `options`.
   *
   * @param {Object} options
   * @api public
   */

  function CradleStore(options) {
    options = options || {};
    Store.call(this, options);
    // modify lines below
    // this.client = new cradle.createClient(options.port || options.socket, options.host, options);
    // if (options.pass) {
    //   this.client.auth(options.pass, function(err){
    //     if (err) throw err;
    //   });    
    // }

    if (options.db) {
      var self = this;
      self.client.select(options.db);
    }
  };

  /**
   * Inherit from `Store`.
   */

  CradleStore.prototype.__proto__ = Store.prototype;

  /**
   * Attempt to fetch session by the given `sid`.
   *
   * @param {String} sid
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.get = function(sid, fn){
    this.client.get(sid, function(err, data){
      try {
        if (!data) return fn();
        fn(null, JSON.parse(data.toString()));
      } catch (err) {
        fn(err);
      } 
    });
  };

  /**
   * Commit the given `sess` object associated with the given `sid`.
   *
   * @param {String} sid
   * @param {Session} sess
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.set = function(sid, sess, fn){
    try {
      var maxAge = sess.cookie.maxAge
        , ttl = 'number' == typeof maxAge
          ? maxAge / 1000 | 0
          : oneDay
        , sess = JSON.stringify(sess);
      this.client.setex(sid, ttl, sess, function(){
        fn && fn.apply(this, arguments);
      });
    } catch (err) {
      fn && fn(err);
    } 
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @api public
   */

  CradleStore.prototype.destroy = function(sid, fn){
    this.client.del(sid, fn);
  };

  /**
   * Fetch number of sessions.
   *
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.length = function(fn){
    this.client.dbsize(fn);
  };

  /**
   * Clear all sessions.
   *
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.clear = function(fn){
    this.client.flushdb(fn);
  };

  return CradleStore;
};