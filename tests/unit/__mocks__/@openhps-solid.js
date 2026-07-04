// Mock for @openhps/solid
function createClass() {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

module.exports = {
    SolidClientService: function(opts) {
        this.on = function() {};
        this.once = function() {};
        this.emitAsync = function() {};
        this.login = function() { return Promise.resolve(); };
        this.logout = function() { return Promise.resolve(); };
        this.handleLogin = function() { return Promise.resolve({ info: { webId: '', isLoggedIn: false } }); };
        this.getThing = function() { return Promise.resolve({}); };
        this.session = { info: { webId: '', isLoggedIn: false }, fetch: fetch };
    },
    SolidSession: createClass(),
};
