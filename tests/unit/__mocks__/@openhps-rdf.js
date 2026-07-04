// Mock for @openhps/rdf
function createClass() {
    return class MockClass {
        constructor() {}
        clone() { return this; }
    };
}

module.exports = {
    IriString: String,
    Subject: createClass(),
    User: createClass(),
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
    ogc: {
        hasGeometry: 'http://www.opengis.net/ont/geosparql#hasGeometry',
        asWKT: 'http://www.opengis.net/ont/geosparql#asWKT',
        asGML: 'http://www.opengis.net/ont/geosparql#asGML',
    },
    xsd: { anyURI: 'http://www.w3.org/2001/XMLSchema#anyURI' },
    DataFactory: { namedNode: function(id) { return { id: id }; } },
    NamedNode: function(value) { this.id = value; },
    Store: createClass(),
    Thing: createClass(),
    SPARQLDataDriver: createClass(),
    DefaultEngine: createClass(),
};
