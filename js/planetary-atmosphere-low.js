import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Table 10.7i: Atmosphere (Low Gravity) Table and Functions
 */

let localChance = new Chance(new Date());

let tableParameters = { };

let settings = {
    dice: {
        rollFunction: localChance.d6,
        iterations: 1,
        maxRoll: 6,
        minRoll: 1
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
        tablePromise = tableHelper.getTable("./data/atmosphere/atmosphere-low-gravity.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/atmosphere/atmosphere-low-gravity-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        planetaryAtmosphereLow.table = data;
    });

    modifiersPromise.done(function(data){
        planetaryAtmosphereLow.modifiers = data;
    });

    return planetaryAtmosphereLow.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), planetaryAtmosphereLow.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        planetaryAtmosphereLow: resultHelper.clone(result),
        rolls: {
            planetaryAtmosphereLow: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { planetaryAtmosphereLow: output.planetaryAtmosphereLow };
        output.planetaryAtmosphereLow = resultHelper.clone(subResult);
        output.rolls.planetaryAtmosphereLowSubRoll = subroll
    }

    // Cleanup
    delete output.planetaryAtmosphereLow.roll;

    return output;
}

// Return Methods and Values
const planetaryAtmosphereLow = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default planetaryAtmosphereLow;
