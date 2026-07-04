// Comprehensive mock for @openhps/* packages
function createClass(name) {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

const BLEAltBeacon = createClass('BLEAltBeacon');
const BLEBeaconObject = createClass('BLEBeaconObject');
const BLEEddystone = createClass('BLEEddystone');
const BLEEddystoneTLM = createClass('BLEEddystoneTLM');
const BLEEddystoneUID = createClass('BLEEddystoneUID');
const BLEEddystoneURL = createClass('BLEEddystoneURL');
const BLEiBeacon = createClass('BLEiBeacon');

const rfModule = {
    BLEAltBeacon: BLEAltBeacon,
    BLEBeaconObject: BLEBeaconObject,
    BLEEddystone: BLEEddystone,
    BLEEddystoneTLM: BLEEddystoneTLM,
    BLEEddystoneUID: BLEEddystoneUID,
    BLEEddystoneURL: BLEEddystoneURL,
    BLEiBeacon: BLEiBeacon,
    BLEUUID: { fromString: function(s) { return s; } },
    RelativeRSSI: createClass('RelativeRSSI'),
};

const DataObject = createClass('DataObject');
const DataFrame = createClass('DataFrame');
const GeographicalPosition = createClass('GeographicalPosition');
const Absolute2DPosition = createClass('Absolute2DPosition');
const AbsoluteOrientationSensor = createClass('AbsoluteOrientationSensor');
const RelativeDistance = createClass('RelativeDistance');
const WorkerNode = createClass('WorkerNode');
const FrameMergeNode = createClass('FrameMergeNode');

const CallbackSinkNode = class CallbackSinkNode { constructor(fn) {} };

const coreModule = {
    DataObject: DataObject,
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
    GeographicalPosition: GeographicalPosition,
    Absolute2DPosition: Absolute2DPosition,
    AbsoluteOrientationSensor: AbsoluteOrientationSensor,
    RelativeDistance: RelativeDistance,
    DataFrame: DataFrame,
    Model: createClass('Model'),
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
    CallbackSinkNode: CallbackSinkNode,
    TimeUnit: { MILLISECOND: 'ms', SECOND: 's' },
    FrameMergeNode: FrameMergeNode,
    WorkerNode: WorkerNode,
    Vector2: function(x, y) { this.x = x; this.y = y; },
    GCS: { EPSG3857: 'EPSG:3857' },
    TimeService: { now: function() { return Date.now(); } },
    Serializable: {},
};

const User = createClass('User');
const rdfModule = {
    IriString: String,
    Subject: createClass('Subject'),
    User: User,
    rdfs: { seeAlso: 'http://www.w3.org/2000/01/rdf-schema#seeAlso' },
    RDFSerializer: {
        initialize: function() {},
        deserializeFromSubjects: function() { return {}; },
        deserializeFromSubject: function() { return {}; },
        deserialize: function() { return {}; },
        deserializeFromStore: function() { return {}; },
    },
    schema: {
        Map__workaround: 'http://schema.org/Map',
        image: 'http://schema.org/image',
        spatialCoverage: 'http://schema.org/spatialCoverage',
        hasMap: 'http://schema.org/hasMap',
    },
    xsd: { anyURI: 'http://www.w3.org/2001/XMLSchema#anyURI' },
    DataFactory: { namedNode: function(id) { return { id: id }; } },
    NamedNode: function(value) { this.id = value; },
    Store: createClass('Store'),
    Thing: createClass('Thing'),
    SPARQLDataDriver: createClass('SPARQLDataDriver'),
    DefaultEngine: createClass('DefaultEngine'),
};

const geospatialModule = {
    Building: createClass('Building'),
    Floor: createClass('Floor'),
    SymbolicSpace: createClass('SymbolicSpace'),
    SymbolicSpaceService: function(driver) {},
};

const solidModule = {
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
    SolidSession: createClass('SolidSession'),
};

const localstorageModule = {
    LocalStorageDriver: function(fn, opts) {},
};

module.exports = new (require('util').types.isProxy ? Proxy : Object)({}, {
    get: function(target, prop) {
        if (prop === 'rf') return rfModule;
        if (prop === 'core') return coreModule;
        if (prop === 'rdf') return rdfModule;
        if (prop === 'geospatial') return geospatialModule;
        if (prop === 'solid') return solidModule;
        if (prop === 'localstorage') return localstorageModule;
        return {};
    },
});
