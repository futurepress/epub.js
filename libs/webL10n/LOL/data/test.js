// vim: ft=javascript:ts=4:sw=4
//   entity = (value)
//   macro { (expression) }

// strings
newFile = "New File";
close = "Close";

// parameters
luckyNum = "Your lucky number is: {{num}}";
signedIn = "You're signed in as {{login}}";

// attributes
nameInput.placeholder = "Write your name";
nameInput.title = "You can give us your nickname if you prefer";

// attributes, compact variant
nameInput = {
    placeholder: "Write your name",
    title: "You can give us your nickname if you prefer"
};

// content + attributes
buttonClick = "Click me";
buttonClick.info = "{{buttonClick.title}}";
buttonClick.title = "use Ctrl+{{buttonClick.accesskey}}";
buttonClick.accesskey = "c";

// content + attributes, compact variant
buttonClick = {
    ~: "Click me",
    info: "{{.title}}",
    title: "use Ctrl+{{.accesskey}}",
    accesskey: "c"
};

// arrays
drinks[num] = [
    "Coca Cola",
    "Gatorade",
    "Water"
];

// lists
cookie[form] = {
    one: "Cookie",
    many: "Cookies"
};

// nested lists
drinks[type, num] = {
    cup: { one: "Cup", many: "Cups" },
    pot: { one: "Pot", many: "Pots" }
};

// macros
plural(n) { n == 1 ? 'one' : 'many' }
drinks[plural(num)] = {
    one: "Cup",
    many: "Cups"
};

