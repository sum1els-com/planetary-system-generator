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
        iterations: 5,
        maxRoll: 30,
        minRoll: 5
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
        tablePromise = tableHelper.getTable("./data/stellar-classification/stellar-classification.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/stellar-classification/stellar-classification-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        stellarClassification.table = data;
    });

    modifiersPromise.done(function(data){
        stellarClassification.modifiers = data;
    });

    return stellarClassification.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), stellarClassification.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        stellarClassification: resultHelper.clone(result),
        rolls: {
            stellarClassification: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { stellarClassification: output.stellarClassification };
        output.stellarClassification = resultHelper.clone(subResult);
        output.rolls.stellarClassificationSubRoll = subroll
    }

    // Cleanup
    delete output.stellarClassification.roll;

    return output;
}

// Return Methods and Values
const stellarClassification = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default stellarClassification;
