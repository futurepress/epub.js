URL.js
======

**An API for working with URLs in JavaScript.**
URL.js can be used in both **server-side** and **client-side** JavaScript environments,
it has **no dependencies** on any other libraries, and is easy to use for common URL-related tasks.

Oh and since I built this to use on [TipTheWeb](http://tiptheweb.org/),
you should [**tip this project**](http://tiptheweb.org/tip/?link=https://github.com/ericf/urljs) if you find it useful! :-D

Design & Approach
-----------------

I had some very specific URL-related programming tasks I needed to do:
validate and normalize user input of URLs and URL-like strings within the browser,
and resolve URLs against each other on the server (in a YQL table to be specific).
Both of these tasks require a very good URL parser, so URL.js centers around parsing.
The design of the API and features of URL.js center around these four main concepts:

* Parsing
* Normalization
* Resolving
* Mutating/Building

**`URL` is both a namespace for utility methods and a constructor/factory to create instances of URL Objects.**

The static utility methods make it convenient when you just want to work with Strings since they return Strings.
When you want to retain a reference to a parsed URL you can easily create a URL instance;
these instances have useful methods, most serve as both an accessor/mutator to a specific part of the URL.

**Currently URL.js only works with HTTP URLs**, albiet the most popular type of URL; 
I have plans to extend the functionality to include support [for all URL schemes](http://www.w3.org/Addressing/URL/url-spec.txt).
Internal to the library is the distiction between absolute and relative URLs.
Absolute URLs are ones which contain a scheme or are scheme-relative, and contain a host.
Relative URLs have slightly looser contraints but the relavence is maintained, either host- or path- relative.

Usage
-----

**`URL` is both a namespace for utility methods and a constructor/factory to create instances of URL Objects.**

### Using Static Utilites

There are two static methods: `normalize` and `resolve`

#### `URL.normalize`:

Takes in a dirty URL and makes it nice and clean.

    URL.normalize('Http://Example.com');          // 'http://example.com/'
    URL.normalize('Http://Example.com?foo=#bar'); // 'http://example.com/?foo#bar'

This should be suffient to serve the use-case of want to clean up URLs,
especially if were inputted by a user.

#### `URL.resolve`:

Given a base URL, this will resolve another URL against it; this method is inspired by what browsers do.
Normalizing is part of resolving, so a normalized and resolved URL `String` is returned.

    URL.resolve('http://example.com/foo/bar', 'baz/index.html');        // 'http://example.com/foo/baz/index.html'
    URL.resolve('https://example.com/foo/, '//example.com/bar.css');    // 'https://example.com/bar.css'
    URL.resolve('http://example.com/foo/bar/zee/', '../../crazy#whoa'); // 'http://example.com/foo/crazy#whoa'

Resolving URLs is a pain in the ass, trust me, you don’t want to have to do this by hand.
The implementation of `resolve` is using all parts of this library’s API to pull it off.

### Using URL Instances

The `URL` `Object` is also a constructor/factory for creating instances of `URL`s.
When creating an instance, **the `new` keyword is optional**.

    var url = URL('http://www.example.com');
    
    // Accessor/Mutator Methods
    
    url.scheme();      // 'http'
    url.userInfo();    // undefined
    url.host();        // 'www.example.com'
    url.port();        // undefined
    url.path();        // '/'
    url.query();       // undefined
    url.queryString(); // ''
    url.fragment();    // undefined
    
    // Convenience Methods
    
    url.original();       // 'http://www.example.com'
    url.isValid();        // true
    url.isAbsolute();     // true
    url.isRelative();     // false
    url.isHostRelative(); // false
    url.type();           // 'absolute' === URL.ABSOLUTE
    url.domain();         // 'example.com'
    url.authority();      // 'www.example.com'
    
    // Output Methods
    
    url.toString();                  // 'http://www.example.com'
    url.resolve('/foo/').toString(); // 'http://www.example.com/foo/'

**Yeah, `URL` instances are packed full of useful URL-ly jazz!**

Here are a few more “complex” examples of what you can do with mutation, chaining, building, and resolving:

    // switch the scheme, resolve a path with a fragment, and navigate to it
    window.location = URL(window.location.toString()).scheme('https').resolve('/about/#people').toString();
    
    // turn 'http://example.com' -> 'http://example.com/?foo=bar#baz'
    URL('http://example.com').query([['foo', 'bar']]).fragment('baz');
    
    // build up a URL to: http://tiptheweb.org/tip/?link=https://github.com/ericf/urljs
    URL()
        .scheme('http')
        .host('tiptheweb.org')
        .path('/tip/')
        .query([['link', 'https://github.com/ericf/urljs']]);
    
License
-------

Copyright (c) 2011 Eric Ferraiuolo (http://eric.ferraiuolo.name/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
