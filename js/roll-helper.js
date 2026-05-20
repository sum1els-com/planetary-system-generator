// Roll Helper
let localChance = new Chance(new Date());

let debug = false;
let debugRoll = 1;

function roll(rollDef) {
    let roll = {};

    roll.total = 0;
    roll.iterations = [];

    for(let i = 0; i < rollDef.iterations; i++) {
        roll.iterations[i] = rollDef.rollFunction();

        // console.log("rollHelper => roll: " + roll);

        roll.total = roll.total + roll.iterations[i];
    }

    // Handle Modifier
    if(typeof rollDef.modifier != "undefined") {
        roll.modifier = rollDef.modifier;
        roll.total = roll.total + rollDef.modifier;
    }

    // Handle Multiplier
    if(typeof rollDef.multiplier != "undefined") {
        roll.multiplier = rollDef.multiplier;
        roll.total = roll.total * rollDef.multiplier;
    }

    if(roll.total < rollDef.minRoll) { roll.total = rollDef.minRoll; }
    else if(roll.total > rollDef.maxRoll) { roll.total = rollDef.maxRoll; }

    if(rollHelper.debug == true) {
        roll.total = rollHelper.debugRoll
    }

    return roll;
}

function rollTable(table) {
    let options = {};

    options.min = table[0].roll;
    options.max = table[table.length - 1].roll;

    return rollTableOp(table, options);
}

function rollTableOp(table, options) {
    let output = {};

    output.roll = (rollHelper.debug == true) ? rollHelper.debugRoll : localChance.natural(options);
    output.result = clone(table.find(element => element.roll == output.roll));

    return output;
}

function rollArray(zoneArray) {
    let output = {
        roll: {
            planet: {
                options: {
                    min: 0,
                    max: (zoneArray.length - 1)
                }
            }
        }
    };

    output.roll.planet.total = (rollHelper.debug == true) ? rollHelper.debugRoll : localChance.natural(output.roll.planet.options);
    output.result = clone(zoneArray[output.roll.planet.total]);

    return output;
}

function rollAverage() {

}

function generateEmptyResult() {
    return {
        total: null,
        iterations: null
    };
}

function clone(object) {
    return JSON.parse(JSON.stringify(object));
}

const rollHelper = {
    debug: debug,
    debugRoll: debugRoll,
    generateEmptyResult: generateEmptyResult,
    roll: roll,
    rollArray: rollArray,
    rollAverage: rollAverage,
    rollTable: rollTable,
    rollTableOp: rollTableOp
};

export default rollHelper;
