/* vim: ft=javascript:ts=4:sw=4
 */

/* macros */
<plural(n) { n == 1 ? 'one' : 'many' }>
<download[plural(count)] {
    one: "one download",
    many: "{{count}} downloads"
}>

