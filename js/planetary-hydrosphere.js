import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Table 10.7A: Hydrosphere Table and Functions
 */

let localChance = new Chance(new Date());

let tableParameters = { };

let settings = {
    dice: {
        rollFunction: localChance.d6,
        iterations: 2,
        maxRoll: 12,
        minRoll: 2
    },
    detailDice: {
        rollFunction: localChance.d11,
        iterations: 1,
        maxRoll: 10,
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
        tablePromise = tableHelper.getTable("./data/hydrosphere/hydrosphere.json", tableParameters);
        modifiersPromise = tableHelper.getModifiers("./data/hydrosphere/hydrosphere-modifiers.json");

        table = tablePromise.then(function (data) {
            return data;
        });

        table = getTable();
    }

    return tablePromise;
}

function getTable() {
    tablePromise.done(function(data){
        planetaryHydrosphere.table = data;
    });

    modifiersPromise.done(function(data){
        planetaryHydrosphere.modifiers = data;
    });

    return planetaryHydrosphere.table;
}

// Roll on Table 3d6
function roll(dice) {
    let localDice = (typeof dice == "undefined") ? settings.dice : dice;
    let result = rollFn(getTable(), localDice);

    if(result.planetaryHydrosphere.code == "table.hydrosphere.percentage") {
        result.rolls.planetaryHydrosphereDetail = rollHelper.roll(settings.detailDice);
        result.planetaryHydrosphere.value = (result.rolls.planetaryHydrosphere.total * 10) + (result.rolls.planetaryHydrosphereDetail.total - 6);
        result.planetaryHydrosphere.name = result.planetaryHydrosphere.value + "%";
    }

    return result;
}

function rollFn(source, rollDef) {
    let roll = rollHelper.roll(rollDef);
    let result = resultHelper.get(source, roll);

    // Format Output
    let output = {
        planetaryHydrosphere: resultHelper.clone(result),
        rolls: {
            planetaryHydrosphere: roll
        }
    };

    // Subroll
    if(typeof result.subroll != "undefined") {
        let subroll = rollHelper.roll(result.subroll.dice);
        let subResult = resultHelper.get(result.subroll.data, subroll);

        output.archive = { planetaryHydrosphere: output.planetaryHydrosphere };
        output.planetaryHydrosphere = resultHelper.clone(subResult);
        output.rolls.planetaryHydrosphereSubRoll = subroll
    }

    // Cleanup
    delete output.planetaryHydrosphere.roll;

    return output;
}

// Return Methods and Values
const planetaryHydrosphere = {
    settings: settings,
    modifiers: modifiers,
    table: table,
    generateTable: generateTable,
    roll: roll
};

export default planetaryHydrosphere;
