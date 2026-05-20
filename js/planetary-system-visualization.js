import starSystem from './star-system.js';

/*
 * Planetary System visualization
 */

const localChance = new Chance(new Date());
let pageCallbacks = {};

const config = {
    maxDim: 340,
    maxPlanetDim: 200,
    maxSatelliteDim: 50,
    minDim: 20
};

const ringImage = ["./image/planets/rings/ring01.png", "./image/planets/rings/ring02.png", "./image/planets/rings/ring03.png"];

let scrollState = {
    target: 0,
    current: 0
};

function init(callbacks) {
    pageCallbacks = callbacks || {};

    const vis = document.querySelector("#systemVis");
    if (vis) {
        vis.addEventListener("mousemove", (e) => {
            const rect = vis.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const pct = x / rect.width;

            const maxScroll = vis.scrollWidth - vis.clientWidth;
            if (maxScroll > 0) {
                scrollState.target = maxScroll * pct;
            }
        });

        // Smooth interpolation loop
        function updateScroll() {
            const maxScroll = vis.scrollWidth - vis.clientWidth;
            if (maxScroll > 0) {
                scrollState.current += (scrollState.target - scrollState.current) * 0.1;
                vis.scrollLeft = scrollState.current;

                // Parallax background scroll (30% speed)
                const bgOffset = -scrollState.current * 0.3;
                vis.style.backgroundPositionX = bgOffset + "px";
            } else {
                vis.scrollLeft = 0;
                vis.style.backgroundPositionX = "0px";
            }
            requestAnimationFrame(updateScroll);
        }
        requestAnimationFrame(updateScroll);
    }
}

/*
 * Render list of Objects, could be stars planets esc
 */
function renderStellarGroups(target, data, context) {
    const vis = document.querySelector(target);
    if (!vis) return;
    const nav = vis.previousElementSibling || document.querySelector("nav");
    const breadcrumbContainer = nav ? nav.querySelector("div.nav-wrapper > div.col") : null;
    
    let breadcrumbEntry = null;
    if (breadcrumbContainer) {
        breadcrumbEntry = breadcrumbContainer.querySelector(`a[data="System: ${data.name}"]`);
    }

    if (pageCallbacks.renderSummary) pageCallbacks.renderSummary();

    // Cleanup Tooltips
    document.querySelectorAll("div.material-tooltip").forEach(el => el.remove());

    // Set Defaults
    if (typeof context === "undefined") {
        scrollState.target = 0;
        scrollState.current = 0;
        context = {
            solarRadiusMax: getLargestRadius(data.stars)
        };

        // System View Label
        vis.innerHTML = "";

        if (breadcrumbContainer) {
            if (!breadcrumbEntry) {
                breadcrumbContainer.innerHTML = "";
                const link = document.createElement("a");
                link.href = "#!";
                link.className = "breadcrumb";
                link.setAttribute("data", "System: " + data.name);
                link.textContent = "[System] " + data.name;
                link.addEventListener("click", () => renderStellarGroups(target, data));
                breadcrumbContainer.appendChild(link);
            } else {
                let next = breadcrumbEntry.nextElementSibling;
                while (next) {
                    const temp = next.nextElementSibling;
                    next.remove();
                    next = temp;
                }
            }
        }
    }

    data.starGroup.forEach((group, i) => {
        context.i = i;
        renderStellarGroup(target, group, context);
    });

    if (data.type.code == "table.starSystem.singleStar" && data.starGroup.length == 1) {
        vis.innerHTML = "";
        if (breadcrumbContainer) {
            const groupEntry = breadcrumbContainer.querySelector(`a[data="Group: ${data.starGroup[0].name}"]`);
            if (groupEntry) {
                let next = groupEntry.nextElementSibling;
                while (next) {
                    const temp = next.nextElementSibling;
                    next.remove();
                    next = temp;
                }
            }
        }
        renderStellarGroup(target, data.starGroup[0], context);
    }
}

/*
 * Render single stellar group
 */
function renderStellarGroup(target, group, context) {
    const vis = document.querySelector(target);
    if (!vis) return;
    const nav = vis.previousElementSibling || document.querySelector("nav");
    const breadcrumbContainer = nav ? nav.querySelector("div.nav-wrapper > div.col") : null;
    let breadcrumbEntry = breadcrumbContainer ? breadcrumbContainer.querySelector(`a[data="Group: ${group.name}"]`) : null;

    if (pageCallbacks.renderSummary) pageCallbacks.renderSummary();

    // Set Defaults
    if (typeof context === "undefined") {
        scrollState.target = 0;
        scrollState.current = 0;
        context = {
            solarRadiusMax: getLargestRadius(group.stars),
            i: 0
        };

        // Cleanup Tooltips
        document.querySelectorAll("div.material-tooltip").forEach(el => el.remove());

        vis.innerHTML = "";

        if (breadcrumbContainer) {
            if (!breadcrumbEntry) {
                const link = document.createElement("a");
                link.href = "#!";
                link.className = "breadcrumb";
                link.setAttribute("data", "Group: " + group.name);
                link.textContent = "[Group] " + group.name;
                link.addEventListener("click", () => {
                    vis.innerHTML = "";
                    let next = link.nextElementSibling;
                    while (next) {
                        const temp = next.nextElementSibling;
                        next.remove();
                        next = temp;
                    }
                    renderStellarGroup(target, group, context);
                });
                breadcrumbContainer.appendChild(link);
            } else {
                let next = breadcrumbEntry.nextElementSibling;
                while (next) {
                    const temp = next.nextElementSibling;
                    next.remove();
                    next = temp;
                }
            }
        }
    }

    // Group Visualization Here
    const groupElement = document.createElement("div");
    groupElement.id = "stellarGroup" + context.i;
    groupElement.className = "stellar-group";
    let smallStarDim;

    group.stars.forEach((star, j) => {
        // Calculate rendered scale based on relative size to largest.
        let dim = (star.radius / context.solarRadiusMax) * config.maxDim;

        // Enforce a minimum render size so we don't get elements too small to see.
        if (dim < config.minDim) { dim = config.minDim; }
        if (dim > config.maxDim) { dim = config.maxDim; }

        if (typeof smallStarDim === "undefined" || smallStarDim > dim) { smallStarDim = dim; }

        const starElement = document.createElement("img");
        starElement.className = "tooltipped star cursor-pointer";
        starElement.src = "./" + star.info.image;
        starElement.setAttribute("data-name", star.name);
        starElement.setAttribute("data-position", "bottom");
        starElement.setAttribute("data-tooltip", star.name);
        starElement.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
        starElement.style.height = dim + "px";
        starElement.style.width = dim + "px";
        
        starElement.addEventListener("click", function () {
            const starName = this.getAttribute("data-name");
            const system = pageCallbacks.getSystem ? pageCallbacks.getSystem() : null;
            if (system) {
                const filteredStar = system.stars.filter(st => st.name == starName);
                if (filteredStar.length > 0) {
                    renderPlanetarySystem(target, filteredStar[0]);
                }
            }
        });

        groupElement.appendChild(starElement);
    });

    if (group.planets.length > 0) {
        const planetRadiusMax = getSmallestRadius(group.stars) * 60;
        let planetarySystemScale = 1;

        // Quick Scale Modal
        if (planetRadiusMax <= 3) { planetarySystemScale = 0.25; }

        const borderSvg = createSystemBorder();
        groupElement.appendChild(borderSvg);

        group.planets.forEach((planet, k) => {
            renderPlanet(groupElement, planetRadiusMax, planetarySystemScale, planet, k, target);
        });
    }

    vis.appendChild(groupElement);
    M.Tooltip.init(vis.querySelectorAll(".tooltipped"));

    const system = pageCallbacks.getSystem ? pageCallbacks.getSystem() : null;
    if (system && system.type.code == "table.starSystem.singleStar" && group.stars.length == 1) {
        renderPlanetarySystem(target, group.stars[0]);
    }
    if (pageCallbacks.updateGlow) pageCallbacks.updateGlow();
}

/*
 * Render list of Objects, could be stars planets esc
 */
function renderPlanetarySystem(target, star) {
    scrollState.target = 0;
    scrollState.current = 0;
    const vis = document.querySelector(target);
    if (!vis) return;
    const nav = vis.previousElementSibling || document.querySelector("nav");
    const breadcrumbContainer = nav ? nav.querySelector("div.nav-wrapper > div.col") : null;
    const breadcrumbEntry = breadcrumbContainer ? breadcrumbContainer.querySelector(`a[data="Star: ${star.name}"]`) : null;

    const planetRadiusMax = getLargestPlanetRadius(star.planets);
    let planetarySystemScale = 1;

    if (pageCallbacks.renderSummary) pageCallbacks.renderSummary();

    // Quick Scale Modal
    if (planetRadiusMax <= 3) { planetarySystemScale = 0.25; }

    // Cleanup Tooltips
    document.querySelectorAll("div.material-tooltip").forEach(el => el.remove());

    vis.innerHTML = "";

    if (breadcrumbContainer) {
        if (!breadcrumbEntry) {
            const link = document.createElement("a");
            link.href = "#!";
            link.className = "breadcrumb";
            link.setAttribute("data", "Star: " + star.name);
            link.textContent = "[Star] " + star.name;
            link.addEventListener("click", () => renderPlanetarySystem(target, star));
            breadcrumbContainer.appendChild(link);
        } else {
            let next = breadcrumbEntry.nextElementSibling;
            while (next) {
                const temp = next.nextElementSibling;
                next.remove();
                next = temp;
            }
        }
    }

    const starElement = document.createElement("img");
    starElement.className = "tooltipped star cursor-pointer";
    starElement.src = "./" + star.info.image;
    starElement.setAttribute("data-name", star.name);
    starElement.setAttribute("data-position", "bottom");
    starElement.setAttribute("data-tooltip", star.name);
    starElement.style.transform = "rotate(" + Math.floor(Math.random() * 360) + "deg)";
    starElement.style.height = config.maxDim + "px";
    starElement.style.width = config.maxDim + "px";
    starElement.addEventListener("click", () => {
        if (pageCallbacks.renderStarInfo) pageCallbacks.renderStarInfo(star);
    });

    vis.appendChild(starElement);

    star.planets.forEach((planet, j) => {
        renderPlanet(vis, planetRadiusMax, planetarySystemScale, planet, j, target);
    });

    M.Tooltip.init(vis.querySelectorAll(".tooltipped"));
    if (pageCallbacks.updateGlow) pageCallbacks.updateGlow();
}

/*
 * Render Lunar System
 */
function renderLunarSystem(targetEl, planet, targetSelector) {
    scrollState.target = 0;
    scrollState.current = 0;
    const vis = document.querySelector(targetSelector);
    if (!vis) return;
    const nav = vis.previousElementSibling || document.querySelector("nav");
    const breadcrumbContainer = nav ? nav.querySelector("div.nav-wrapper > div.col") : null;
    const breadcrumbEntry = breadcrumbContainer ? breadcrumbContainer.querySelector(`a[data="Planet: ${planet.name}"]`) : null;

    if (pageCallbacks.renderSummary) pageCallbacks.renderSummary();

    const satelliteRadiusMax = getLargestPlanetRadius(planet.satellites);

    // Cleanup Tooltips
    document.querySelectorAll("div.material-tooltip").forEach(el => el.remove());

    vis.innerHTML = "";

    if (breadcrumbContainer) {
        if (!breadcrumbEntry) {
            const link = document.createElement("a");
            link.href = "#!";
            link.className = "breadcrumb";
            link.setAttribute("data", "Planet: " + planet.name);
            link.textContent = "[Planet] " + planet.name;
            link.addEventListener("click", () => renderLunarSystem(targetEl, planet, targetSelector));
            breadcrumbContainer.appendChild(link);
        } else {
            let next = breadcrumbEntry.nextElementSibling;
            while (next) {
                const temp = next.nextElementSibling;
                next.remove();
                next = temp;
            }
        }
    }

    const planetWidth = config.maxDim;
    const planetHeight = config.maxDim;
    const hasRing = hasRings(planet);
    const containerWidth = hasRing ? planetWidth * 2.3 : planetWidth;
    const containerHeight = planetHeight;

    const planetContainer = document.createElement("div");
    planetContainer.className = "planet-container tooltipped cursor-pointer";
    planetContainer.setAttribute("data-name", planet.name);
    planetContainer.setAttribute("data-position", "bottom");
    planetContainer.setAttribute("data-tooltip", planet.name);
    planetContainer.style.width = containerWidth + "px";
    planetContainer.style.height = containerHeight + "px";
    planetContainer.addEventListener("click", () => {
        if (pageCallbacks.renderPlanetInfo) pageCallbacks.renderPlanetInfo(planet);
    });

    const tilt = (typeof planet.axialTilt === "undefined") ? 0 : planet.axialTilt.value;

    const planetElement = document.createElement("img");
    planetElement.className = "planet";
    planetElement.src = "./" + planet.image;
    planetElement.style.width = planetWidth + "px";
    planetElement.style.height = planetHeight + "px";
    planetElement.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    planetContainer.appendChild(planetElement);

    // Check for and Render Rings
    if (hasRing) {
        const ringElement = document.createElement("img");
        ringElement.className = "planet-ring";
        const ringIndex = Math.abs(planet.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % ringImage.length;
        ringElement.src = "./" + ringImage[ringIndex];
        ringElement.style.width = (planetWidth * 2.3) + "px";
        ringElement.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
        planetContainer.appendChild(ringElement);
    }

    vis.appendChild(planetContainer);

    // Render Moons
    planet.satellites.forEach((satellite, k) => {
        renderSatellite(vis, satelliteRadiusMax, satellite, k);
    });

    M.Tooltip.init(vis.querySelectorAll(".tooltipped"));
    if (pageCallbacks.updateGlow) pageCallbacks.updateGlow();
}

/*
 * Render planet
 */
function renderPlanet(target, planetRadiusMax, planetarySystemScale, planet, j, targetSelector) {
    // Calculate rendered scale based on relative size to largest.
    let dim = (planet.planetaryRadius / planetRadiusMax) * config.maxPlanetDim;

    // Enforce a minimum render size so we don't get elements too small to see.
    if (dim < config.minDim) { dim = config.minDim; }
    if (dim > config.maxPlanetDim) { dim = config.maxPlanetDim; }

    // Apply Scale
    dim = dim * planetarySystemScale;

    const planetWidth = dim;
    const planetHeight = dim;
    const hasRing = hasRings(planet);
    const containerWidth = hasRing ? planetWidth * 2.3 : planetWidth;
    const containerHeight = planetHeight;

    const planetContainer = document.createElement("div");
    planetContainer.className = "planet-container tooltipped cursor-pointer";
    planetContainer.setAttribute("data-name", planet.name);
    planetContainer.setAttribute("data-position", "bottom");
    planetContainer.setAttribute("data-tooltip", planet.name + ((!planet.className) ? "" : " (" + planet.className + ")"));
    planetContainer.style.width = containerWidth + "px";
    planetContainer.style.height = containerHeight + "px";
    planetContainer.addEventListener("click", () => {
        if (planet.satelliteCount > 0) {
            renderLunarSystem(target, planet, targetSelector);
        } else {
            if (pageCallbacks.renderPlanetInfo) pageCallbacks.renderPlanetInfo(planet);
        }
    });

    const tilt = (typeof planet.axialTilt === "undefined") ? 0 : planet.axialTilt.value;

    const planetElement = document.createElement("img");
    planetElement.className = "planet";
    planetElement.src = "./" + planet.image;
    planetElement.style.width = planetWidth + "px";
    planetElement.style.height = planetHeight + "px";
    planetElement.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
    planetContainer.appendChild(planetElement);

    // Check for and Render Rings
    if (hasRing) {
        const ringElement = document.createElement("img");
        ringElement.className = "planet-ring";
        const ringIndex = Math.abs(planet.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % ringImage.length;
        ringElement.src = "./" + ringImage[ringIndex];
        ringElement.style.width = (planetWidth * 2.3) + "px";
        ringElement.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`;
        planetContainer.appendChild(ringElement);
    }

    target.appendChild(planetContainer);
}

/*
 * Render satellite
 */
function renderSatellite(target, satelliteRadiusMax, satellite, k) {
    // Escape if Rings
    if (satellite.code == "planet.rings") { return; }

    // Calculate rendered scale based on relative size to largest.
    let dim = (satellite.planetaryRadius / satelliteRadiusMax) * config.maxSatelliteDim;

    // Enforce a minimum render size so we don't get elements too small to see.
    if (dim < config.minDim) { dim = config.minDim; }
    if (dim > config.maxSatelliteDim) { dim = config.maxSatelliteDim; }

    const satelliteElement = document.createElement("img");
    satelliteElement.className = "tooltipped planet cursor-pointer";
    satelliteElement.src = "./" + satellite.image;
    satelliteElement.setAttribute("data-name", satellite.name);
    satelliteElement.setAttribute("data-position", "bottom");
    satelliteElement.setAttribute("data-tooltip", satellite.name + ((!satellite.className) ? "" : " (" + satellite.className + ")"));
    satelliteElement.style.transform = "rotate(" + ((typeof satellite.axialTilt === "undefined") ? 0 : satellite.axialTilt.value) + "deg)";
    satelliteElement.style.height = dim + "px";
    satelliteElement.style.width = dim + "px";

    satelliteElement.addEventListener("click", () => {
        if (pageCallbacks.renderMoonInfo) pageCallbacks.renderMoonInfo(satellite);
    });

    target.appendChild(satelliteElement);
}

/*
 * Accepts a list of json objects (stars) and returns the largest radius.
 */
function getLargestRadius(data) {
    let largestRadius = -1;
    data.forEach((body) => {
        if (body.radius > largestRadius) { largestRadius = body.radius; }
    });
    return largestRadius;
}

/*
 * Accepts a list of json objects (stars) and returns the smallest radius.
 */
function getSmallestRadius(data) {
    let smallestRadius = 10000000000;
    data.forEach((body) => {
        if (body.radius < smallestRadius) { smallestRadius = body.radius; }
    });
    return smallestRadius;
}

/*
 * Accepts a list of json objects (planets) and returns the largest radius.
 */
function getLargestPlanetRadius(data) {
    let largestRadius = -1;
    data.forEach((body) => {
        if (body.planetaryRadius > largestRadius) { largestRadius = body.planetaryRadius; }
    });
    return largestRadius;
}

/*
 * Returns whether the planet has rings.
 */
function hasRings(planet) {
    if (!planet.satellites) { return false; }
    return planet.satellites.filter(satellite => satellite.code === "planet.rings").length > 0;
}

/*
 * Create SVG system border arc.
 */
function createSystemBorder() {
    const container = document.createElement("div");
    container.setAttribute("class", "system-border-container tooltipped");
    container.setAttribute("data-position", "bottom");
    container.setAttribute("data-tooltip", "Inner System(s) Boundary");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "system-border");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "340");
    svg.setAttribute("viewBox", "0 0 100 340");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M30,10 Q70,170 30,330");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(255, 255, 255, 0.3)");
    path.setAttribute("stroke-width", "12");
    path.setAttribute("stroke-linecap", "round");

    svg.appendChild(path);
    container.appendChild(svg);
    return container;
}

// Return Methods and Values
const planetarySystemVisualization = {
    init: init,
    renderStellarGroups: renderStellarGroups,
    renderStellarGroup: renderStellarGroup,
    renderPlanetarySystem: renderPlanetarySystem,
    renderLunarSystem: renderLunarSystem
};

export default planetarySystemVisualization;
