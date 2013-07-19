/*!
 * URL.js
 *
 * Copyright 2011 Eric Ferraiuolo
 * https://github.com/ericf/urljs
 */

/**
 * URL constructor and utility.
 * Provides support for validating whether something is a URL,
 * formats and cleans up URL-like inputs into something nice and pretty,
 * ability to resolve one URL against another and returned the formatted result,
 * and is a convenient API for working with URL Objects and the various parts of URLs.
 *
 * @constructor URL
 * @param       {String | URL}  url - the URL String to parse or URL instance to copy
 * @return      {URL}           url - instance of a URL all nice and parsed
 */
var URL = function () {

    var u = this;

    if ( ! (u && u.hasOwnProperty && (u instanceof URL))) {
        u = new URL();
    }

    return u._init.apply(u, arguments);
};

(function(){

var ABSOLUTE            = 'absolute',
    RELATIVE            = 'relative',

    HTTP                = 'http',
    HTTPS               = 'https',
    COLON               = ':',
    SLASH_SLASH         = '//',
    AT                  = '@',
    DOT                 = '.',
    SLASH               = '/',
    DOT_DOT             = '..',
    DOT_DOT_SLASH       = '../',
    QUESTION            = '?',
    EQUALS              = '=',
    AMP                 = '&',
    HASH                = '#',
    EMPTY_STRING        = '',

    TYPE                = 'type',
    SCHEME              = 'scheme',
    USER_INFO           = 'userInfo',
    HOST                = 'host',
    PORT                = 'port',
    PATH                = 'path',
    QUERY               = 'query',
    FRAGMENT            = 'fragment',

    URL_TYPE_REGEX      = /^(?:(https?:\/\/|\/\/)|(\/|\?|#)|[^;:@=\.\s])/i,
    URL_ABSOLUTE_REGEX  = /^(?:(https?):\/\/|\/\/)(?:([^:@\s]+:?[^:@\s]+?)@)?((?:[^;:@=\/\?\.\s]+\.)+[A-Za-z0-9\-]{2,})(?::(\d+))?(?=\/|\?|#|$)([^\?#]+)?(?:\?([^#]+))?(?:#(.+))?/i,
    URL_RELATIVE_REGEX  = /^([^\?#]+)?(?:\?([^#]+))?(?:#(.+))?/i,

    OBJECT              = 'object',
    STRING              = 'string',
    TRIM_REGEX          = /^\s+|\s+$/g,

    trim, isObject, isString;


// *** Utilities *** //

trim = String.prototype.trim ? function (s) {
    return ( s && s.trim ? s.trim() : s );
} : function (s) {
    try {
        return s.replace(TRIM_REGEX, EMPTY_STRING);
    } catch (e) { return s; }
};

isObject = function (o) {
    return ( o && typeof o === OBJECT );
};

isString = function (o) {
    return typeof o === STRING;
};


// *** Static *** //

/**
 *
 */
URL.ABSOLUTE = ABSOLUTE;

/**
 *
 */
URL.RELATIVE = RELATIVE;

/**
 *
 */
URL.normalize = function (url) {
    return new URL(url).toString();
};

/**
 * Returns a resolved URL String using the baseUrl to resolve the url against.
 * This attempts to resolve URLs like a browser would on a web page.
 *
 * @static
 * @method  resolve
 * @param   {String | URL}  baseUrl     - the URL String, or URL instance as the resolving base
 * @param   {String | URL}  url         - the URL String, or URL instance to resolve
 * @return  {String}        resolvedUrl - a resolved URL String
 */
URL.resolve = function (baseUrl, url) {
    return new URL(baseUrl).resolve(url).toString();
};


// *** Prototype *** //

URL.prototype = {

    // *** Lifecycle Methods *** //

    /**
     * Initializes a new URL instance, or re-initializes an existing one.
     * The URL constructor delegates to this method to do the initializing,
     * and the mutator instance methods call this to re-initialize when something changes.
     *
     * @protected
     * @method  _init
     * @param   {String | URL}  url - the URL String, or URL instance
     * @return  {URL}           url - instance of a URL all nice and parsed/re-parsed
     */
    _init : function (url) {

        this.constructor = URL;

        url = isString(url) ? url : url instanceof URL ? url.toString() : null;

        this._original  = url;
        this._url       = {};
        this._isValid   = this._parse(url);

        return this;
    },

    // *** Object Methods *** //

    /**
     * Returns the formatted URL String.
     * Overridden Object toString method to do something useful.
     *
     * @public
     * @method  toString
     * @return  {String}    url - formatted URL string
     */
    toString : function () {

        var url         = this._url,
            urlParts    = [],
            type        = url[TYPE],
            scheme      = url[SCHEME],
            path        = url[PATH],
            query       = url[QUERY],
            fragment    = url[FRAGMENT];

        if (type === ABSOLUTE) {
            urlParts.push(
                scheme ? (scheme + COLON + SLASH_SLASH) : SLASH_SLASH,
                this.authority()
            );
            if (path && path.indexOf(SLASH) !== 0) {    // this should maybe go in _set
                path = SLASH + path;
            }
        }

        urlParts.push(
            path,
            query ? (QUESTION + this.queryString()) : EMPTY_STRING,
            fragment ? (HASH + fragment) : EMPTY_STRING
        );

        return urlParts.join(EMPTY_STRING);
    },

    // *** Accessor/Mutator Methods *** //

    original : function () {
        return this._original;
    },

    /**
     * Whether parsing from initialization or re-initialization produced something valid.
     *
     * @public
     * @method  isValid
     * @return  {Boolean}   valid   - whether the URL is valid
     */
    isValid : function () {
        return this._isValid;
    },

    /**
     * URL is absolute if it has a scheme or is scheme-relative (//).
     *
     * @public
     * @method  isAbsolute
     * @return  {Boolean}   absolute    - whether the URL is absolute
     */
    isAbsolute : function () {
        return this._url[TYPE] === ABSOLUTE;
    },

    /**
     * URL is relative if it host or path relative, i.e. doesn't contain a host.
     *
     * @public
     * @method  isRelative
     * @return  {Boolean}   relative    - whether the URL is relative
     */
    isRelative : function () {
        return this._url[TYPE] === RELATIVE;
    },

    /**
     * URL is host relative if it's relative and the path begins with '/'.
     *
     * @public
     * @method  isHostRelative
     * @return  {Boolean}   hostRelative    - whether the URL is host-relative
     */
     isHostRelative : function () {
        var path = this._url[PATH];
        return ( this.isRelative() && path && path.indexOf(SLASH) === 0 );
     },

    /**
     * Returns the type of the URL, either: URL.ABSOLUTE or URL.RELATIVE.
     *
     * @public
     * @method  type
     * @return  {String}    type    - the type of the URL: URL.ABSOLUTE or URL.RELATIVE
     */
    type : function () {
        return this._url[TYPE];
    },

    /**
     * Returns or sets the scheme of the URL.
     * If URL is determined to be absolute (i.e. contains a host) and no scheme is provided,
     * the scheme will default to http.
     *
     * @public
     * @method  scheme
     * @param   {String}        scheme  - Optional scheme to set on the URL
     * @return  {String | URL}  the URL scheme or the URL instance
     */
    scheme : function (scheme) {
        return ( arguments.length ? this._set(SCHEME, scheme) : this._url[SCHEME] );
    },

    /**
     * Returns or set the user info of the URL.
     * The user info can optionally contain a password and is only valid for absolute URLs.
     *
     * @public
     * @method  userInfo
     * @param   {String}        userInfo    - Optional userInfo to set on the URL
     * @return  {String | URL}  the URL userInfo or the URL instance
     */
    userInfo : function (userInfo) {
        return ( arguments.length ? this._set(USER_INFO, userInfo) : this._url[USER_INFO] );
    },

    /**
     * Returns or sets the host of the URL.
     * The host name, if set, must be something valid otherwise the URL will become invalid.
     *
     * @public
     * @method  host
     * @param   {String}        host    - Optional host to set on the URL
     * @return  {String | URL}  the URL host or the URL instance
     */
    host : function (host) {
        return ( arguments.length ? this._set(HOST, host) : this._url[HOST] );
    },

    /**
     * Returns the URL's domain, where the domain is the TLD and SLD of the host.
     * e.g. foo.example.com -> example.com
     *
     * @public
     * @method  domain
     * @return  {String}    domain  - the URL domain
     */
    domain : function () {
        var host = this._url[HOST];
        return ( host ? host.split(DOT).slice(-2).join(DOT) : undefined );
    },

    /**
     * Returns or sets the port of the URL.
     *
     * @public
     * @method  port
     * @param   {Number}        port    - Optional port to set on the URL
     * @return  {Number | URL}  the URL port or the URL instance
     */
    port : function (port) {
        return ( arguments.length ? this._set(PORT, port) : this._url[PORT] );
    },

    /**
     * Returns the URL's authority which is the userInfo, host, and port combined.
     * This only makes sense for absolute URLs
     *
     * @public
     * @method  authority
     * @return  {String}    authority   - the URL's authority (userInfo, host, and port)
     */
    authority : function () {

        var url         = this._url,
            userInfo    = url[USER_INFO],
            host        = url[HOST],
            port        = url[PORT];

        return [

            userInfo ? (userInfo + AT) : EMPTY_STRING,
            host,
            port ? (COLON + port) : EMPTY_STRING,

        ].join(EMPTY_STRING);
    },

    /**
     * Returns or sets the path of the URL.
     *
     * @public
     * @method  path
     * @param   {String}        path    - Optional path to set on the URL
     * @return  {String | URL}  the URL path or the URL instance
     */
    path : function (path) {
        return ( arguments.length ? this._set(PATH, path) : this._url[PATH] );
    },

    /**
     * Returns or sets the query of the URL.
     * This takes or returns the parsed query as an Array of Arrays.
     *
     * @public
     * @method  query
     * @param   {Array}         query   - Optional query to set on the URL
     * @return  {Array | URL}   the URL query or the URL instance
     */
    query : function (query) {
        return ( arguments.length ? this._set(QUERY, query) : this._url[QUERY] );
    },

    /**
     * Returns or sets the query of the URL.
     * This takes or returns the query as a String; doesn't include the '?'
     *
     * @public
     * @method  queryString
     * @param   {String}        queryString - Optional queryString to set on the URL
     * @return  {String | URL}  the URL queryString or the URL instance
     */
    queryString : function (queryString) {

        // parse and set queryString
        if (arguments.length) {
            return this._set(QUERY, this._parseQuery(queryString));
        }

        queryString = EMPTY_STRING;

        var query = this._url[QUERY],
            i, len;

        if (query) {
            for (i = 0, len = query.length; i < len; i++) {
                queryString += query[i].join(EQUALS);
                if (i < len - 1) {
                    queryString += AMP;
                }
            }
        }

        return queryString;
    },

    /**
     * Returns or sets the fragment on the URL.
     * The fragment does not contain the '#'.
     *
     * @public
     * @method  fragment
     * @param   {String}        fragment    - Optional fragment to set on the URL
     * @return  {String | URL}  the URL fragment or the URL instance
     */
    fragment : function (fragment) {
        return ( arguments.length ? this._set(FRAGMENT, fragment) : this._url[FRAGMENT] );
    },

    /**
     * Returns a new, resolved URL instance using this as the baseUrl.
     * The URL passed in will be resolved against the baseUrl.
     *
     * @public
     * @method  resolve
     * @param   {String | URL}  url - the URL String, or URL instance to resolve
     * @return  {URL}           url - a resolved URL instance
     */
    resolve : function (url) {

        url = (url instanceof URL) ? url : new URL(url);

        var resolved, path;

        if ( ! (this.isValid() && url.isValid())) { return this; } // not sure what to do???

        // the easy way
        if (url.isAbsolute()) {
            return ( this.isAbsolute() ? url.scheme() ? url : new URL(url).scheme(this.scheme()) : url );
        }

        // the hard way
        resolved = new URL(this.isAbsolute() ? this : null);

        if (url.path()) {

            if (url.isHostRelative() || ! this.path()) {
                path = url.path();
            } else {
                path = this.path().substring(0, this.path().lastIndexOf(SLASH) + 1) + url.path();
            }

            resolved.path(this._normalizePath(path)).query(url.query()).fragment(url.fragment());

        } else if (url.query()) {
            resolved.query(url.query()).fragment(url.fragment());
        } else if (url.fragment()) {
            resolved.fragment(url.fragment());
        }

        return resolved;
    },

    /**
     * Returns a new, reduced relative URL instance using this as the baseUrl.
     * The URL passed in will be compared to the baseUrl with the goal of
     * returning a reduced-down URL to one that’s relative to the base (this).
     * This method is basically the opposite of resolve.
     *
     * @public
     * @method  reduce
     * @param   {String | URL}  url - the URL String, or URL instance to resolve
     * @return  {URL}           url - the reduced URL instance
     */
    reduce : function (url) {

        url = (url instanceof URL) ? url : new URL(url);

        var reduced = this.resolve(url);

        if (this.isAbsolute() && reduced.isAbsolute()) {
            if (reduced.scheme() === this.scheme() && reduced.authority() === this.authority()) {
                reduced.scheme(null).userInfo(null).host(null).port(null);
            }
        }

        return reduced;
    },

    // *** Private Methods *** //

    /**
     * Parses a URL into usable parts.
     * Reasonable defaults are applied to parts of the URL which weren't present in the input,
     * e.g. 'http://example.com' -> { type: 'absolute', scheme: 'http', host: 'example.com', path: '/' }
     * If nothing or a falsy value is returned, the URL wasn't something valid.
     *
     * @private
     * @method  _parse
     * @param   {String}    url     - the URL string to parse
     * @param   {String}    type    - Optional type to seed parsing: URL.ABSOLUTE or URL.RELATIVE
     * @return  {Boolean}   parsed  - whether or not the URL string was parsed
     */
    _parse : function (url, type) {

        // make sure we have a good string
        url = trim(url);
        if ( ! (isString(url) && url.length > 0)) {
            return false;
        }

        var urlParts, parsed;

        // figure out type, absolute or relative, or quit
        if ( ! type) {
            type = url.match(URL_TYPE_REGEX);
            type = type ? type[1] ? ABSOLUTE : type[2] ? RELATIVE : null : null;
        }

        switch (type) {

            case ABSOLUTE:
                urlParts = url.match(URL_ABSOLUTE_REGEX);
                if (urlParts) {
                    parsed              = {};
                    parsed[TYPE]        = ABSOLUTE;
                    parsed[SCHEME]      = urlParts[1] ? urlParts[1].toLowerCase() : undefined;
                    parsed[USER_INFO]   = urlParts[2];
                    parsed[HOST]        = urlParts[3].toLowerCase();
                    parsed[PORT]        = urlParts[4] ? parseInt(urlParts[4], 10) : undefined;
                    parsed[PATH]        = urlParts[5] || SLASH;
                    parsed[QUERY]       = this._parseQuery(urlParts[6]);
                    parsed[FRAGMENT]    = urlParts[7];
                }
                break;

            case RELATIVE:
                urlParts = url.match(URL_RELATIVE_REGEX);
                if (urlParts) {
                    parsed              = {};
                    parsed[TYPE]        = RELATIVE;
                    parsed[PATH]        = urlParts[1];
                    parsed[QUERY]       = this._parseQuery(urlParts[2]);
                    parsed[FRAGMENT]    = urlParts[3];
                }
                break;

            // try to parse as absolute, if that fails then as relative
            default:
                return ( this._parse(url, ABSOLUTE) || this._parse(url, RELATIVE) );
                break;

        }

        if (parsed) {
            this._url = parsed;
            return true;
        } else {
            return false;
        }
    },

    /**
     * Helper to parse a URL query string into an array of arrays.
     * Order of the query paramerters is maintained, an example structure would be:
     * queryString: 'foo=bar&baz' -> [['foo', 'bar'], ['baz']]
     *
     * @private
     * @method  _parseQuery
     * @param   {String}    queryString - the query string to parse, should not include '?'
     * @return  {Array}     parsedQuery - array of arrays representing the query parameters and values
     */
    _parseQuery : function (queryString) {

        if ( ! isString(queryString)) { return; }

        queryString = trim(queryString);

        var query       = [],
            queryParts  = queryString.split(AMP),
            queryPart, i, len;

        for (i = 0, len = queryParts.length; i < len; i++) {
            if (queryParts[i]) {
                queryPart = queryParts[i].split(EQUALS);
                query.push(queryPart[1] ? queryPart : [queryPart[0]]);
            }
        }

        return query;
    },

    /**
     * Helper for mutators to set a new URL-part value.
     * After the URL-part is updated, the URL will be toString'd and re-parsed.
     * This is a brute, but will make sure the URL stays in sync and is re-validated.
     *
     * @private
     * @method  _set
     * @param   {String}    urlPart - the _url Object member String name
     * @param   {Object}    val     - the new value for the URL-part, mixed type
     * @return  {URL}       this    - returns this URL instance, chainable
     */
    _set : function (urlPart, val) {

        this._url[urlPart] = val;

        if (val                     && (
            urlPart === SCHEME      ||
            urlPart === USER_INFO   ||
            urlPart === HOST        ||
            urlPart === PORT        )){
            this._url[TYPE] = ABSOLUTE; // temp, set this to help clue parsing
        }
        if ( ! val && urlPart === HOST) {
            this._url[TYPE] = RELATIVE; // temp, no host means relative
        }

        this._isValid = this._parse(this.toString());

        return this;
    },

    /**
     * Returns a normalized path String, by removing ../'s.
     *
     * @private
     * @method  _normalizePath
     * @param   {String}    path            — the path String to normalize
     * @return  {String}    normalizedPath  — the normalized path String
     */
    _normalizePath : function (path) {

        var pathParts, pathPart, pathStack, normalizedPath, i, len;

        if (path.indexOf(DOT_DOT_SLASH) > -1) {

            pathParts = path.split(SLASH);
            pathStack = [];

            for ( i = 0, len = pathParts.length; i < len; i++ ) {
                pathPart = pathParts[i];
                if (pathPart === DOT_DOT) {
                    pathStack.pop();
                } else if (pathPart) {
                    pathStack.push(pathPart);
                }
            }

            normalizedPath = pathStack.join(SLASH);

            // prepend slash if needed
            if (path[0] === SLASH) {
                normalizedPath = SLASH + normalizedPath;
            }

            // append slash if needed
            if (path[path.length - 1] === SLASH && normalizedPath.length > 1) {
                normalizedPath += SLASH;
            }

        } else {

            normalizedPath = path;

        }

        return normalizedPath;
    }

};

}());
