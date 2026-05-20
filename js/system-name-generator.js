import resultHelper from './result-helper.js';
import rollHelper from './roll-helper.js';
import tableHelper from './table-helper.js';

/*
 * Template Table and Functions
 */

let localChance = new Chance(new Date());

let prefixTableParameters = {
    code: "generator.starName.type.prefix"
};

let suffixTableParameters = {
    code: "generator.starName.type.suffix"
};

let settings = {
    dice: {
        rollFunction: localChance.d6,
        iterations: 3,
        maxRoll: 19,
        minRoll: 3
    }
};

let prefixTable = null;
let suffixTable = null;

let prefixTablePromise = null;
let suffixTablePromise = null;
let modifiersPromise = null;

// Generate Table
function generatePrefixTable() {
    if(prefixTable == null) {
        prefixTablePromise = tableHelper.getTable("./data/system-name/system-name-prefix.json", {});
        modifiersPromise = tableHelper.getModifiers("./data/system-name/system-name-prefix-modifiers.json");

        prefixTable = prefixTablePromise.then(function (data) {
            return data;
        });

        prefixTable = getPrefixTable();
    }

    return prefixTablePromise;
}

function generateSuffixTable() {
    if(suffixTable == null) {
        suffixTablePromise = tableHelper.getTable("./data/system-name/system-name-suffix.json", {});
        modifiersPromise = tableHelper.getModifiers("./data/system-name/system-name-suffix-modifiers.json");

        suffixTable = suffixTablePromise.then(function (data) {
            return data;
        });

        suffixTable = getSuffixTable();
    }

    return suffixTablePromise;
}

function getPrefixTable() {
    prefixTablePromise.done(function(data){
        systemName.prefixTable = data;
    });

    return systemName.prefixTable;
}

function getSuffixTable() {
    suffixTablePromise.done(function(data){
        systemName.suffixTable = data;
    });

    return systemName.suffixTable;
}

// Roll on Table 3d6
function roll() {
    return rollFn(getPrefixTable(), getSuffixTable());
}

function rollFn(prefixSource, suffixSource) {
    let prefixRoll = rollHelper.rollTable(prefixSource);
    let suffixRoll = rollHelper.rollTable(suffixSource);

    let prefixResult = resultHelper.getFromTable(prefixSource, prefixRoll);
    let suffixResult = resultHelper.getFromTable(suffixSource, suffixRoll);

    // Format Output
    let output = {
        systemName: {
            name: prefixResult.name + suffixResult.name,
            prefix: resultHelper.clone(prefixResult),
            suffix: resultHelper.clone(suffixResult),
        },
        rolls: {
            systemNamePrefix: prefixRoll,
            systemNameSuffix: suffixRoll
        }
    };

    // Cleanup
    // delete output.systemName.roll;

    return output;
}

// Return Methods and Values
const systemName = {
    settings: settings,
    prefixTable: prefixTable,
    suffixTable: suffixTable,
    generatePrefixTable: generatePrefixTable,
    generateSuffixTable: generateSuffixTable,
    getPrefixTable: getPrefixTable,
    getSuffixTable: getSuffixTable,
    roll: roll
};

export default systemName;
