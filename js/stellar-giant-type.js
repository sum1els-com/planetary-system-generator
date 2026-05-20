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
        maxRoll: 19,
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
        tablePromise = tableHelper.getTable("./data/stellar-giant/stellar-giant.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/stellar-giant/stellar-giant-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        stellarGiantType.table = data;
    });

    modifiersPromise.done(function(data){
        stellarGiantType.modifiers = data;
    });

    return stellarGiantType.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), stellarGiantType.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        stellarGiantType: resultHelper.clone(result),
        rolls: {
            stellarGiantType: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { stellarGiantType: output.stellarGiantType };
        output.stellarGiantType = resultHelper.clone(subResult);
        output.rolls.stellarGiantTypeSubRoll = subroll
    }

    // Cleanup
    delete output.stellarGiantType.roll;

    return output;
}

// Return Methods and Values
const stellarGiantType = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default stellarGiantType;
