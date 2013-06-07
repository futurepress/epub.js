webL10n is a client-side, cross-browser i18n/l10n library (internationalization / localization), designed with modern web applications in mind.

Unlike other i18n/l10n libraries, webL10n supports:

* declarative localization: elements with `l10n-*` attributes are automatically translated when the document is loaded;
* named variables instead of printf-like `%s` tokens;
* a simple and full-featured pluralization system;
* server-less language negotiation (think of offline webapps);

We don’t focus on the gettext format: the bullet-proof `*.properties` format, used in Mozilla and GWT projects, is preferred — at least, by default.

Demo: <http://fabi1cazenave.github.com/webL10n/> (outdated — feel free to submit a new one! ^^)

This library is also used by the FirefoxOS front-end (Gaia) with a different JavaScript API: a modern API for FirefoxOS/Gaia (with web standards in mind), a basic cross-browser one in webL10n (compatibility with IE6/IE7/IE8).

[More information on the Wiki.](https://github.com/fabi1cazenave/webL10n/wiki)

Quick Start
-----------

Here’s a quick way to get a multilingual HTML page:

```html
<html>
<head>
  <script type="text/javascript" src="l10n.js"></script>
  <link rel="prefetch" type="application/l10n" href="data.ini" />
</head>
<body>
  <button data-l10n-id="test" title="click me!">This is a test</button>
</body>
</html>
```

* l10n resource files are associated to the HTML document with a ``<link>`` element;
* translatable elements carry a ``data-l10n-id`` attribute;
* l10n resources are stored in a bullet-proof ``*.ini`` file:

```ini
[en-US]
test = This is a test
test.title = click me!
[fr]
test = Ceci est un test
test.title = cliquez-moi !
```


JavaScript API
--------------

`l10n.js` exposes a rather simple `document.webL10n` object.

```javascript
// Set the 'lang' and 'dir' attributes to <html> when the page is translated
window.addEventListener('localized', function() {
  document.documentElement.lang = document.webL10n.getLanguage();
  document.documentElement.dir = document.webL10n.getDirection();
}, false);
```
* `localized` event: fired when the page has been translated;
* `getLanguage` / `setLanguage` method: get/set the ISO-639-1 code of the current locale;
* `getDirection` method: direction (ltr|rtl) of the current language;
* `get` method: get a translated string.

```javascript
var message = document.webL10n.get('test');
alert(message);
```

You will probably use a gettext-like alias:

```javascript
var _ = document.webL10n.get;
alert(_('test'));
```

To handle complex strings, the `get()` method can accept optional arguments:

```javascript
alert(_('welcome', { user: "John" }));
```

where `welcome` is defined like this:

```ini
[en-US]
welcome = welcome, {{user}}!
[fr]
welcome = bienvenue, {{user}} !
```


Advanced usage
--------------

### l10n arguments

You can specify a default value in JSON for any argument in the HTML document with the `data-l10n-args` attribute. In the last example, that would be:

```html
<p data-l10n-id="welcome" data-l10n-args='{ "user": "your awesomeness" }'>Welcome!</p>
```

### @import rules

If you don’t want to have all your locales in a single file or if you want to
share strings between several pages, you can use CSS-like `@import` rules.

More information on the [Language Selection](https://github.com/fabi1cazenave/webL10n/wiki/Language-Selection) page.

### Pluralization

The following strings might be gramatically incorrect when `n` equals zero or one:

```ini
[en-US]
unread = You have {{n}} unread messages
[fr]
unread = Vous avez {{n}} nouveaux messages
```

This can be solved by using the pre-defined `plural()` macro:

```ini
[en-US]
unreadMessages = {[ plural(n) ]}
unreadMessages[zero]  = You have no unread messages
unreadMessages[one]   = You have one unread message
unreadMessages[other] = You have {{n}} unread messages
[fr]
unreadMessages = {[ plural(n) ]}
unreadMessages[zero]  = Vous n’avez pas de nouveau message
unreadMessages[one]   = Vous avez un nouveau message
unreadMessages[other] = Vous avez {{n}} nouveaux messages
```

Here, `unreadMessages` is an array and `{[plural(n)]}` points to the selected index.

`plural()` returns zero | one | two | few | many | other, depending on `n` and the current language, as specified in the Unicode rules. If one of these indexes isn’t found, the `[other]` index will be used by default.


### innerHTML

By default, we currently assume that all strings are applied as `textContent`.
However, you can modify the `innerHTML` property with a simple rule:

```ini
welcome.innerHTML = welcome, <strong>{{user}}</strong>!
```

Warning: this raises a few security questions that we haven’t addressed yet. In a future version we might:
* sanitize the localized string before applying it as `innerHTML` (like in the PHP ``strip_tags`` method)
* provide text-to-HTML methods (e.g. markdown) throught pseudo-properties, for example:

```ini
welcome#text = welcome, {{user}}!
welcome#html = welcome, <strong>{{user}}</strong>!
welcome#mark = welcome, **{{user}}**!
```


Further thoughts
----------------

### Media queries

For mobile apps, here’s what I’d like to do:

```html
<link rel="prefetch" type="application/l10n" href="data.ini" />
<link rel="prefetch" type="application/l10n" href="mobile.ini"
      media="screen and (max-width: 640px)" />
```

### Multi-line strings

Multi-line and wrapped strings aren’t supported at the moment. The *.properties way to extend a string on several lines is to use a backslash at the end of line… but there could be sharper/easier ways to handle that.

YAML handles multi-line / wrapped strings nicely with the pipe and backslash operators, maybe we could reuse that in webL10n?


### More structured syntax

There are cases where the entity has to be an array or a list (e.g. to handle plural rules), instead of a string. Currently we use the `entity[key]` notation but a more compact syntax could be supported as well.

Alternatively, we could use a JSON- or YAML-like file format to handle the whole structure in a more modern way.


### Logical expressions

The Mozilla l20n/LOL project introduces the concept of “expression”, which can be used to address most grammatical rules or some very specific situations.

The `plural()` macro above could be easily defined as an expression:

```ini
plural(n) = { n == 0 ? 'zero' : (n == 1 ? 'one' : 'other') }
```


Browser support
---------------

Tested on Firefox, Chrome, Opera and Internet Explorer 6 to 10.


License
-------

BSD/MIT/WTFPL license. Use at your own risk.

