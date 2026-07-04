const { defineComponent } = require('vue');

// Vue-facing-decorator mock: Vue should be a class that can be extended
class VueBase {}

// Prop decorator needs to return a valid property descriptor factory
function PropDecorator(options) {
    return function(target, key) {
        // No-op for tests
    };
}

module.exports = {
    Vue: VueBase,
    Component: function(options) {
        return function(target) {
            Object.assign(target, options);
        };
    },
    Prop: PropDecorator,
    Ref: function(name) {
        return function(target, key) {
            // No-op for tests
        };
    },
    Watch: function(path) {
        return function(target, key) {
            // No-op for tests
        };
    }
};
