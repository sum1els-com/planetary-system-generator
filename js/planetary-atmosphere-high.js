import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Table 10.7iii: Atmosphere (High Gravity) Table and Functions
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
        tablePromise = tableHelper.getTable("./data/atmosphere/atmosphere-high-gravity.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/atmosphere/atmosphere-high-gravity-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        planetaryAtmosphereHigh.table = data;
    });

    modifiersPromise.done(function(data){
        planetaryAtmosphereHigh.modifiers = data;
    });

    return planetaryAtmosphereHigh.table;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getTable(), planetaryAtmosphereHigh.settings.dice);
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        planetaryAtmosphereHigh: resultHelper.clone(result),
        rolls: {
            planetaryAtmosphereHigh: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { planetaryAtmosphereHigh: output.planetaryAtmosphereHigh };
        output.planetaryAtmosphereHigh = resultHelper.clone(subResult);
        output.rolls.planetaryAtmosphereHighSubRoll = subroll
    }

    // Cleanup
    delete output.planetaryAtmosphereHigh.roll;

    return output;
}

// Return Methods and Values
const planetaryAtmosphereHigh = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default planetaryAtmosphereHigh;
