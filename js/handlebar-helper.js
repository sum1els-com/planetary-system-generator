// handlebar Helper
// INIT
function init() {
    HandlebarsIntl.registerWith(Handlebars);
    Handlebars.registerHelper('replace', replaceHelper);
}

function replaceHelper(string, replace, replacement) {
    return (string || '').replace(replace, replacement);
}

function getTemplates(templates) {
    Object.entries(templates).forEach(([key, instance]) => {
        fetch(instance.source)
            .then(response => response.text())
            .then(data => {
                instance.template = Handlebars.compile(data);
            })
            .catch(err => console.error("Error loading template " + instance.source, err));
    });
}

const handlebarHelper = {
    init: init,
    getTemplates: getTemplates
};

export default handlebarHelper;
