// Result Helper
function getResult(source, roll) {
    return source.find(element => element.roll == roll.total);
}

function getResultFromTable(source, roll) {
    return source.find(element => element.roll == roll.roll);
}

function getModifier(source, code) {
    return source.find(element => element.code == code);
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

function nextChar(c) {
    return String.fromCharCode(c.charCodeAt(0) + 1);
}

function romanize(num) {
    if (isNaN(num)) { return NaN; }

    let digits = String(+num).split("");
    let key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
               "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
               "","I","II","III","IV","V","VI","VII","VIII","IX"];
    let roman = "";
    let i = 3;

    while (i--) { roman = (key[+digits.pop() + (i * 10)] || "") + roman; }

    return Array(+digits.join("") + 1).join("M") + roman;
}

const resultHelper = {
    clone: clone,
    get: getResult,
    getFromTable: getResultFromTable,
    getModifier: getModifier,
    nextChar: nextChar,
    romanize: romanize
};

export default resultHelper;
