// Table Helper
function getTable(url, parameters) {
    let targetUrl = url;
    if (parameters) {
        const query = new URLSearchParams(parameters).toString();
        if (query) targetUrl += "?" + query;
    }

    const context = {
        url: url,
        parameters: parameters,
        data: null
    };

    return fetch(targetUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            context.data = data;
            return checkForSubrolls(context).then(() => context.data);
        });
}

function checkForSubrolls(context) {
    const promises = [];
    for (const key in context.data) {
        const obj = context.data[key];

        if (obj.subroll != null) {
            const p = getSubroll(context, obj).then(subroll => {
                obj.subroll = subroll;
            });
            promises.push(p);
        } else {
            delete obj.subroll;
        }
    }
    return Promise.all(promises);
}

function getSubroll(context, object) {
    const subroll = {};
    const promises = [
        getRollTable(context, object, subroll),
        getSubTable(context, object, subroll)
    ];
    return Promise.all(promises).then(() => subroll);
}

function getRollTable(context, object, subroll) {
    let url = "";

    if (object.subroll == "roll.type.1d6") { url = "./data/roll-type/1d6.json"; }
    else if (object.subroll == "roll.type.2d6*10") { url = "./data/roll-type/2d6x10.json"; }
    else if (object.subroll == "roll.type.2d6*100") { url = "./data/roll-type/2d6x100.json"; }

    if (url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                processSubrollData(context, subroll, data);
            })
            .catch(err => console.error("Error fetching roll table: " + url, err));
    }
    return Promise.resolve();
}

function processSubrollData(context, subroll, data) {
    subroll.dice = data[0];
    subroll.dice.rollFunction = getFunctionByName(subroll.dice.rollFunction);
}

function getSubTable(context, object, subroll) {
    const query = new URLSearchParams({
        subtable: 1,
        parentCode: object.code
    }).toString();
    
    return fetch(`${context.url}?${query}`)
        .then(response => response.json())
        .then(data => {
            processSubtableData(context, subroll, data);
        })
        .catch(err => console.error("Error fetching subtable from: " + context.url, err));
}

function processSubtableData(context, subroll, data) {
    subroll.data = data;
}

function getModifiers(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
}

function getFunctionByName(functionName) {
    let context = window;
    const namespaces = functionName.split(".");
    const func = namespaces.pop();

    for (let i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func];
}

function getByCode(array, code) {
    return array.find(element => element.code == code);
}

function getByValue(array, value) {
    return array.find(element => element.value == value);
}

const tableHelper = {
    getModifiers: getModifiers,
    getTable: getTable,
    getRollTable: getRollTable,
    getSubroll: getSubroll,
    getFunctionByName: getFunctionByName,
    getByCode: getByCode,
    getByValue: getByValue
};

export default tableHelper;
