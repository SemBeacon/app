// Mock for @openhps/geospatial
function createClass() {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

module.exports = {
    Building: createClass(),
    Floor: createClass(),
    SymbolicSpace: createClass(),
    SymbolicSpaceService: function(driver) {},
};
