// Mock for @openhps/core
function createClass() {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

module.exports = {
    DataObject: createClass(),
    SerializableObject: function() { return function(target) { return target; }; },
    SerializableMember: function() { return function(target, key) {}; },
    DataSerializer: {
        serialize: function(data) { return JSON.stringify(data); },
        deserialize: function(data) { return typeof data === 'string' ? JSON.parse(data) : data; },
    },
    MemoryDataService: class MemoryDataService {
        constructor(dataType, options) {}
        add(item) {}
        remove(id) {}
        find(id) { return null; }
        findAll() { return []; }
        clear() {}
        size() { return 0; }
    },
    Constructor: {},
    DataServiceOptions: {},
    GeographicalPosition: createClass(),
    Absolute2DPosition: createClass(),
    AbsoluteOrientationSensor: createClass(),
    RelativeDistance: createClass(),
    DataFrame: createClass(),
    Model: createClass(),
    ModelBuilder: {
        create: function() {
            return {
                from: function() { return { to: function() { return { build: function() { return Promise.resolve({}); } }; } }; },
                addShape: function() { return { from: function() { return { to: function() { return { build: function() { return Promise.resolve({}); } }; } }; } }; },
            };
        },
    },
    GraphBuilder: {
        create: function() {
            return {
                from: function() { return { debounce: function() { return { to: function() { return {}; } }; } }; },
            };
        },
    },
    CallbackSinkNode: class CallbackSinkNode { constructor(fn) {} },
    TimeUnit: { MILLISECOND: 'ms', SECOND: 's' },
    FrameMergeNode: createClass(),
    WorkerNode: createClass(),
    Vector2: function(x, y) { this.x = x; this.y = y; },
    GCS: { EPSG3857: 'EPSG:3857' },
    TimeService: { now: function() { return Date.now(); } },
    Serializable: {},
};
