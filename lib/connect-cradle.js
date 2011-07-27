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
   * Initialize CradleStore with the given `options` or defaults if a specific option is not provided
   *
   * @param {Object} options
   * @api public
   */

  function CradleStore(options) {
    options = options || {} ,
    options.dbName = options.dbName || 'sessions' ,
    options.hostname = options.hostname || '127.0.0.1' ,
    options.port = ( typeof options.port == 'number' && options.port >= 1 && options.port < 65535 ) ? options.port : '5984' ,
    options.auth = ( (typeof options.auth.username == 'string' && typeof options.auth.password == 'string') ? options.auth : '' ) ,
    options.cache = ( typeof options.cache == 'boolean' ? options.cache : true ),
    options.raw = ( typeof options.raw == 'boolean' ? options.auth : false ) ;

    Store.call(this, options);
    return this.client = new cradle.Connection(options.hostname,options.port,{
      auth: options.auth ,
      cache: options.cache ,
      raw: options.raw 
    }).database(options.dbName);
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
    return this.client.get(sid, function(err, data){
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
      this.client.save(sid, sess, function(){
        return fn && fn.apply(this, arguments);
      });
    } catch (err) {
      return fn && fn(err);
    } 
  };

  /**
   * Destroy the session associated with the given `sid`.
   *
   * @param {String} sid
   * @api public
   */

  CradleStore.prototype.destroy = function(sid, fn){
    return this.client.remove(sid, fn);
  };

  /**
   * Fetch number of sessions.
   *
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.length = function(fn){
    return this.client.all(fn);
  };

  /**
   * Clear all sessions.
   *
   * @param {Function} fn
   * @api public
   */

  CradleStore.prototype.clear = function(fn){
    return this.client.remove('*','',fn);
  };

  return CradleStore;
};