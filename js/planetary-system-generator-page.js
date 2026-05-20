import handlebarHelper from './handlebar-helper.js';
import planetarySystemGenerator from './planetary-system-generator.js';
import planetarySystemVisualization from './planetary-system-visualization.js';

// Promise compatibility shim for legacy code using jQuery's Deferred
Promise.prototype.done = Promise.prototype.then;

export let planetarySystem = {};
let currentSelectedObjectName = null;

function updateGlowEffect() {
    const vis = document.querySelector("#systemVis");
    if (!vis) return;
    vis.querySelectorAll(".glow-effect").forEach(el => {
        el.classList.remove("glow-effect");
    });

    const selectedObjectTab = document.getElementById("selectedObjectInfo");
    if (selectedObjectTab && selectedObjectTab.style.display !== "none" && currentSelectedObjectName) {
        const targetEl = vis.querySelector(`[data-name="${currentSelectedObjectName.replace(/"/g, '\\"')}"]`);
        if (targetEl) {
            targetEl.classList.add("glow-effect");
        }
    }
}

let starInfo = {};
let starTypeInfo = {};

const templates = {
    systemSummary: {
        source: "./template/system-summary.hbs",
        template: null
    },
    starGroups: {
        source: "./template/star-groups.hbs",
        template: null,
    },
    starTable: {
        source: "./template/star-table.hbs",
        template: null,
    },
    planetTable: {
        source: "./template/planet-table.hbs",
        template: null,
    },
    lifeTable: {
        source: "./template/life-table.hbs",
        template: null
    },
    resourceTable: {
        source: "./template/resource-table.hbs",
        template: null
    },
    starInfo: {
        source: "./template/star-info.hbs",
        template: null,
    },
    planetInfo: {
        source: "./template/planet-info.hbs",
        template: null,
    },
    moonInfo: {
        source: "./template/moon-info.hbs",
        template: null,
    }
};

// JSON Viewer (Global loaded in index.html)
const jsonViewer = new JSONViewer();

/*
 * Page initialization method.
 */
function init() {
    // Load Tables
    planetarySystemGenerator.loadResources().then(() => {
        // Initialize Visualization Callbacks
        planetarySystemVisualization.init({
            renderStarInfo,
            renderPlanetInfo,
            renderMoonInfo,
            renderSummary,
            getSystem: () => planetarySystem,
            updateGlow: updateGlowEffect
        });

        // Load templates
        handlebarHelper.init();
        handlebarHelper.getTemplates(templates);

        // Functionality
        const dropdownTrigger = document.querySelector("div.header a.dropdown-trigger");
        if (dropdownTrigger) {
            M.Dropdown.init(dropdownTrigger, { coverTrigger: false });
        }

        document.querySelectorAll("a.load-dialog-button").forEach(el => el.addEventListener("click", openLoadDataPopup));
        document.querySelectorAll("a.save-dialog-button").forEach(el => el.addEventListener("click", openSaveDataPopup));
        document.querySelectorAll("a.data-viewer-button").forEach(el => el.addEventListener("click", openDataViewerPopup));

        document.querySelectorAll("a.roll-button, a.roll-icon").forEach(el => el.addEventListener("click", handleRoll));
        
        const loadBtn = document.querySelector("a.load-button");
        if (loadBtn) loadBtn.addEventListener("click", loadData);

        const visRefreshBtn = document.getElementById("visRefreshButton");
        if (visRefreshBtn) {
            visRefreshBtn.addEventListener("click", () => {
                planetarySystemVisualization.renderStellarGroups("#systemVis", planetarySystem);
            });
        }

        // JSON Viewer
        const dataModalContent = document.querySelector("div#dataModal div.modal-content");
        if (dataModalContent) {
            dataModalContent.appendChild(jsonViewer.getContainer());
        }

        // Init Tabs
        M.Tabs.init(document.querySelectorAll(".tabs"), {
            onShow: function(tabContent) {
                updateGlowEffect();
            }
        });

        // INIT Modals
        M.Modal.init(document.querySelectorAll(".modal"));

        // Save Modal specific reset
        const saveModalClose = document.querySelector("div#saveModal a.modal-close");
        if (saveModalClose) {
            saveModalClose.addEventListener("click", () => {
                const dataDiv = document.querySelector("div#saveModal div.data-div");
                if (dataDiv) {
                    dataDiv.innerHTML = "<textarea></textarea>";
                }
            });
        }
        // Enable roll-button and dropdown-trigger elements
        document.querySelectorAll("a.roll-button, a.dropdown-trigger").forEach(el => el.classList.remove("disabled"));

        // Hide loading indicator
        const loader = document.getElementById("loadingIndicator");
        if (loader) {
            loader.style.display = "none";
        }

        console.log("init completed!");

        // Attach click listener for interactive object links
        document.addEventListener("click", function (event) {
            const link = event.target.closest(".object-link");
            if (link) {
                event.preventDefault();
                const name = link.getAttribute("data-name");
                if (name) {
                    selectObjectByName(name);
                }
            }
        });

        // Attach click listener for stats chips
        const infoSummary = document.getElementById("infoSummary");
        if (infoSummary) {
            infoSummary.addEventListener("click", function (event) {
                const chip = event.target.closest(".chip[data-code]");
                if (chip) {
                    const code = chip.getAttribute("data-code");
                    const type = chip.getAttribute("data-type");
                    const name = chip.textContent.split(" | ")[0];
                    showReferencedObjects(code, type, name);
                }
            });
        }
    }).catch(err => {
        console.error("Initialization failed: ", err);
        const loader = document.getElementById("loadingIndicator");
        if (loader) {
            loader.style.display = "none";
        }
    });
}

/*
 * Method Responsible for Handling Roll
 */
function handleRoll(event) {
    planetarySystem = planetarySystemGenerator.generateSystem();
    renderAll();
}

/*
 * Method Responsible for loading Data
 */
function loadData() {
    const dataTextarea = document.querySelector("textarea#data");
    if (dataTextarea && dataTextarea.value.trim()) {
        planetarySystem = JSON.parse(dataTextarea.value);
        dataTextarea.value = " ";
        renderAll();
    }
}

/*
 * Render all Elements
 */
function renderAll() {
    currentSelectedObjectName = null;
    renderSummary();
    renderStarGroups();
    renderStarTable();
    renderPlanets();
    renderPointsOfInterest();
    M.Tooltip.init(document.querySelectorAll(".info-container .tooltipped"));

    planetarySystemVisualization.renderStellarGroups("#systemVis", planetarySystem);

    document.querySelectorAll("#visRefreshButton, div.visualization-container").forEach(el => {
        el.classList.remove("hidden");
    });

    // Hide Instructions
    const instructions = document.querySelector("div.container.instructions");
    if (instructions) {
        instructions.classList.add("hidden");
    }
}

/*
 * Render System Summary
 */
function renderSummary() {
    const infoSummary = document.getElementById("infoSummary");
    if (infoSummary) {
        infoSummary.innerHTML = templates.systemSummary.template(planetarySystem);
        M.Tooltip.init(infoSummary.querySelectorAll(".tooltipped"));
    }

    const tabsEl = document.querySelector(".tabs");
    if (tabsEl) {
        const instance = M.Tabs.getInstance(tabsEl);
        if (instance) {
            instance.select("infoSummary");
        }
    }
    
    const infoContainer = document.querySelector("div.info-container");
    if (infoContainer) {
        infoContainer.classList.remove("hidden");
    }
}

/*
 * Render Stellar Group Info
 */
function renderStarGroups() {
    const infoStellarGroups = document.getElementById("infoStellarGroups");
    if (infoStellarGroups) {
        infoStellarGroups.innerHTML = templates.starGroups.template(planetarySystem);
    }
}

/*
 * Render Star Table
 */
function renderStarTable() {
    const infoStars = document.getElementById("infoStars");
    if (infoStars) {
        infoStars.innerHTML = templates.starTable.template(planetarySystem);
    }
}

/*
 * Render Planet Table
 */
function renderPlanets() {
    const infoPlanets = document.getElementById("infoPlanets");
    if (infoPlanets) {
        infoPlanets.innerHTML = templates.planetTable.template(planetarySystem);
    }
}

function renderPointsOfInterest() {
    const infoPointsOfInterest = document.getElementById("infoPointsOfInterest");
    if (infoPointsOfInterest) {
        infoPointsOfInterest.innerHTML = 
            templates.resourceTable.template(planetarySystem.stats.resourceRich) +
            templates.lifeTable.template(planetarySystem.stats.life);
    }
}

function selectTab(tabId) {
    const tabsEl = document.querySelector(".tabs");
    if (tabsEl) {
        const instance = M.Tabs.getInstance(tabsEl);
        if (instance) {
            instance.select(tabId);
        }
    }
}

export function renderStarInfo(star) {
    currentSelectedObjectName = star.name;
    const selectedObjectInfo = document.getElementById("selectedObjectInfo");
    if (selectedObjectInfo) {
        selectedObjectInfo.innerHTML = templates.starInfo.template(star);
        M.Tooltip.init(selectedObjectInfo.querySelectorAll(".tooltipped"));
    }
    selectTab("selectedObjectInfo");
    updateGlowEffect();
}

export function renderPlanetInfo(planet) {
    currentSelectedObjectName = planet.name;
    const selectedObjectInfo = document.getElementById("selectedObjectInfo");
    if (selectedObjectInfo) {
        selectedObjectInfo.innerHTML = templates.planetInfo.template(planet);
        M.Tooltip.init(selectedObjectInfo.querySelectorAll(".tooltipped"));
    }
    selectTab("selectedObjectInfo");
    updateGlowEffect();
}

export function renderMoonInfo(satellite) {
    currentSelectedObjectName = satellite.name;
    const selectedObjectInfo = document.getElementById("selectedObjectInfo");
    if (selectedObjectInfo) {
        selectedObjectInfo.innerHTML = templates.moonInfo.template(satellite);
        M.Tooltip.init(selectedObjectInfo.querySelectorAll(".tooltipped"));
    }
    selectTab("selectedObjectInfo");
    updateGlowEffect();
}

/*
 * Method Responsible for Opening Load Data Dialog
 */
function openLoadDataPopup() {
    const modal = document.getElementById("loadModal");
    if (modal) {
        const instance = M.Modal.getInstance(modal);
        if (instance) instance.open();
    }
}

/*
 * Method Responsible for Opening Save Data Dialog
 */
function openSaveDataPopup() {
    const modal = document.getElementById("saveModal");
    if (modal) {
        const instance = M.Modal.getInstance(modal);
        if (instance) {
            instance.open();
            const textarea = modal.querySelector("div.data-div textarea");
            if (textarea) textarea.value = JSON.stringify(planetarySystem);
        }
    }
}

/*
 * Data Viewer to Inspect JSON Data
 */
function openDataViewerPopup() {
    jsonViewer.showJSON(planetarySystem, -1, 1);
    const modal = document.getElementById("dataModal");
    if (modal) {
        const instance = M.Modal.getInstance(modal);
        if (instance) instance.open();
    }
}

/*
 * Find an object (group, star, planet, satellite) by its name.
 */
function findObjectByName(name, system) {
    if (!system) return null;
    
    // 1. Check if name matches a star group name
    if (system.starGroup) {
        for (let group of system.starGroup) {
            if (group.name === name) {
                return { type: 'group', object: group };
            }
        }
    }
    
    // Helper to search within a star or a group's planets/moons
    function searchPlanets(planets, parent) {
        for (let planet of planets) {
            if (planet.name === name) {
                return { type: 'planet', object: planet, parent: parent };
            }
            if (planet.satellites) {
                for (let satellite of planet.satellites) {
                    if (satellite.name === name) {
                        return { type: 'satellite', object: satellite, parent: planet };
                    }
                }
            }
        }
        return null;
    }

    // 2. Check stars and their planets/moons
    if (system.stars) {
        for (let star of system.stars) {
            if (star.name === name) {
                return { type: 'star', object: star };
            }
            const found = searchPlanets(star.planets || [], star);
            if (found) return found;
        }
    }

    // 3. Check starGroups planets/moons (circumbinary)
    if (system.starGroup) {
        for (let group of system.starGroup) {
            const found = searchPlanets(group.planets || [], group);
            if (found) return found;
        }
    }

    return null;
}

/*
 * Select and focus on the given object by name.
 */
function selectObjectByName(name) {
    if (!planetarySystem) return;
    
    const result = findObjectByName(name, planetarySystem);
    if (!result) return;
    
    const target = "#systemVis";
    
    if (result.type === 'group') {
        planetarySystemVisualization.renderStellarGroup(target, result.object);
    } else if (result.type === 'star') {
        planetarySystemVisualization.renderPlanetarySystem(target, result.object);
        renderStarInfo(result.object);
    } else if (result.type === 'planet') {
        if (result.parent) {
            if (result.parent.stars) {
                planetarySystemVisualization.renderStellarGroup(target, result.parent);
            } else {
                planetarySystemVisualization.renderPlanetarySystem(target, result.parent);
            }
        }
        if (result.object.satelliteCount > 0 || (result.object.satellites && result.object.satellites.length > 0)) {
            planetarySystemVisualization.renderLunarSystem(null, result.object, target);
        }
        renderPlanetInfo(result.object);
    } else if (result.type === 'satellite') {
        if (result.parent) {
            planetarySystemVisualization.renderLunarSystem(null, result.parent, target);
        }
        renderMoonInfo(result.object);
    }
}

/*
 * Find all planets or moons in the system by their classification/stat code.
 */
function findObjectsByCode(code, type) {
    const list = [];
    
    function searchPlanets(planets) {
        planets.forEach(planet => {
            if (type === "planet" && planet.code === code) {
                list.push(planet);
            }
            if (planet.satellites) {
                planet.satellites.forEach(satellite => {
                    if (type === "moon" && satellite.code === code) {
                        list.push(satellite);
                    }
                });
            }
        });
    }

    if (planetarySystem.stars) {
        planetarySystem.stars.forEach(star => {
            searchPlanets(star.planets || []);
        });
    }
    
    if (planetarySystem.starGroup) {
        planetarySystem.starGroup.forEach(group => {
            searchPlanets(group.planets || []);
        });
    }

    return list;
}

/*
 * Show objects in a modal list.
 */
function showReferencedObjects(code, type, name) {
    const objects = findObjectsByCode(code, type);
    const modal = document.getElementById("chipModal");
    if (!modal) return;

    const titleEl = modal.querySelector(".modal-title");
    if (titleEl) {
        titleEl.textContent = `${name} Referenced Objects`;
    }

    const listEl = modal.querySelector(".modal-object-list");
    if (listEl) {
        listEl.innerHTML = "";
        if (objects.length === 0) {
            listEl.innerHTML = `<div class="grey-text">No objects found.</div>`;
        } else {
            objects.forEach(obj => {
                const link = document.createElement("a");
                link.href = "#!";
                link.className = "object-link modal-close blue-text text-lighten-2";
                link.style.display = "block";
                link.style.padding = "8px 0";
                link.style.borderBottom = "1px solid #333";
                link.style.fontSize = "16px";
                link.setAttribute("data-name", obj.name);
                link.textContent = obj.name;
                listEl.appendChild(link);
            });
        }
    }

    const instance = M.Modal.getInstance(modal);
    if (instance) instance.open();
}

// On Page Ready call Init Method
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
