import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Table 10.5: Star System Table and Functions
 */

let localChance = new Chance(new Date());

let tableParameters = { };

let settings = {
    dice: {
        rollFunction: localChance.d6,
        iterations: 2,
        maxRoll: 12,
        minRoll: 2
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
        tablePromise = tableHelper.getTable("./data/star-system/star-system.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/star-system/star-system-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        starSystem.table = data;
    });

    modifiersPromise.done(function(data){
        starSystem.modifiers = data;
    });

    return starSystem.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), starSystem.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        starSystem: resultHelper.clone(result),
        rolls: {
            starSystem: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { starSystem: output.starSystem };
        output.starSystem = resultHelper.clone(subResult);
        output.rolls.starSystemSubRoll = subroll
    }

    // Cleanup
    delete output.starSystem.roll;

    return output;
}

// Return Methods and Values
const starSystem = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    getTable: getTable,
    roll: roll
};

export default starSystem;
