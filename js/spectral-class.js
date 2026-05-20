import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Template Table and Functions
 */

let localChance = new Chance(new Date());

let tableParameters = { };

let settings = {
    dice: {
        rollFunction: localChance.d6,
        iterations: 3,
        maxRoll: 18,
        minRoll: 3
    }
};

let modifiers = null;
let table = null;

let modifiersPromise = null;
let tablePromise = null;

// Objects
// function generateObject(index) {
//     return  {
//         roll: index,
//         name: "Object",
//         code: "object.object",
//         description: "Object"
//     };
// }

// Generate Table
function generateTable() {
    if(table == null) {
        tablePromise = tableHelper.getTable("./data/spectral-class/spectral-class.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/spectral-class/spectral-class-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        spectralClass.table = data;
    });

    modifiersPromise.done(function(data){
        spectralClass.modifiers = data;
    });

    return spectralClass.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), spectralClass.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        spectralClass: resultHelper.clone(result),
        rolls: {
            spectralClass: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { spectralClass: output.spectralClass };
        output.spectralClass = resultHelper.clone(subResult);
        output.rolls.spectralClassSubRoll = subroll
    }

    // Cleanup
    delete output.spectralClass.roll;

    return output;
}

// Return Methods and Values
const spectralClass = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default spectralClass;
