l10n.js used to support 'LOL' files from the [Mozilla l20n](https://wiki.mozilla.org/L20n)
project.

'LOL' files (Localizable Object List) are a flat list of localized entities.
Our project requires a way to group entities by selectors (language selection,
media queries), so we proposed a simplification of the LOL format to make it
more extensible and get a Localizable Object *Tree* — see these two wiki pages:

 * [l10n data: \*.lol](https://github.com/fabi1cazenave/webL10n/wiki/l10n-data%3a-*.lol)
 * [l10n data: \*.intl](https://github.com/fabi1cazenave/webL10n/wiki/l10n-data%3a-*.intl)

This parser is able to read both ``*.lol`` and ``*.intl`` formats.  
**Online demo:** <http://kazhack.org/tmp/convert/lol/>

As the idea of nestable entities has been strongly rejected by the l20n team,
we’re now looking for a more flexible alternative and our l20n-related features
have been removed from l10n.js.

