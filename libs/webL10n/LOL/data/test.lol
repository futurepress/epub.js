/* vim: ft=javascript:ts=4:sw=4
 */

/* strings */
<newFile "New File">
<close "Close">

/* parameters */
<luckyNum "Your lucky number is: {{num}}">
<signedIn "You're signed in as {{login}}">

/* attributes */
<nameInput
    placeholder: "Write your name"
    title: "You can give us your nickname if you prefer">

/* content + attributes */
<buttonClick "Click me"
    info: "{{buttonClick.title}}"
    title: "use Ctrl+{{buttonClick.accesskey}}"
    accesskey: "c">

/* arrays */
<drinks[num] [
    "Coca Cola",
    "Gatorade",
    "Water"
]>

/* lists */
<cookie[form] {
    one: "Cookie",
    many: "Cookies"
}>

/* nested lists */
<moreDrinks[type,num] {
    cup: { one: "Cup", many: "Cups" },
    pot: { one: "Pot", many: "Pots" }
}>

/* macros */
<plural(n) { n == 1 ? 'one' : 'many' }>
<download[plural(count)] {
    one: "one download",
    many: "{{count}} downloads"
}>

