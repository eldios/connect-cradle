
# connect-cradle Connect Session Store with Cradle

connect-cradle is a Cradle session store backed by [cradle](https://github.com/cloudhead/cradle), and is insanely fast :). Requires cradle >= `0.1.0` for the _SETEX_ command.

## Installation

	  $ npm install connect-cradle

## Options

  - `host` Redis server hostname
  - `port` Redis server portno
  - `db` Database index to use
  - `pass` Password for Redis authentication
  - ...    Remaining options passed to the redis `createClient()` method.

## Usage

 Due to npm 1.x changes, we now need to pass connect to the function `connect-cradle` exports in order to extend `connect.session.Store`:

    var connect = require('connect')
	 	  , CradleStore = require('connect-cradle')(connect);

    connect.createServer(
      connect.cookieParser(),
      // 5 minutes
      connect.session({ store: new CradleStore, secret: 'keyboard cat' })
    );

 This means express users may do the following, since `express.session.Store` points to the `connect.session.Store` function:
 
    var RedisStore = require('connect-cradle')(express);

## Readme.md Thanks

  Tj I almost feel shame to copy bit-a-bit most of your connect-redis code but I'm a really lazy programmer :P
  Thanks for all your work! \o/
