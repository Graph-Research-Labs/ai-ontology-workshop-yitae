// Shared helpers for all rules.
// Each rule file calls GRLLinter.registerRule({...}) on load.

(function () {
  if (window.GRLLinter) return;
  window.GRLLinter = {
    rules: [],
    registerRule(rule) { this.rules.push(rule); },
  };
})();

window.GRLLinter.NS = {
  RDF:    'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  RDFS:   'http://www.w3.org/2000/01/rdf-schema#',
  OWL:    'http://www.w3.org/2002/07/owl#',
  XSD:    'http://www.w3.org/2001/XMLSchema#',
  SKOS:   'http://www.w3.org/2004/02/skos/core#',
  GIST_CURRENT: 'https://w3id.org/semanticarts/ns/ontology/gist/',
  GIST_LEGACY:  'https://w3id.org/semanticarts/ontology/gistCore#',
};

window.GRLLinter.helpers = (function () {
  const NS = window.GRLLinter.NS;

  function localName(iri) {
    if (!iri) return '';
    const hash  = iri.lastIndexOf('#');
    const slash = iri.lastIndexOf('/');
    const sep   = Math.max(hash, slash);
    return sep >= 0 ? iri.substring(sep + 1) : iri;
  }

  function inGistNamespace(iri) {
    return !!iri && (iri.startsWith(NS.GIST_CURRENT) || iri.startsWith(NS.GIST_LEGACY));
  }

  function gistLocalName(iri) {
    if (!iri) return null;
    if (iri.startsWith(NS.GIST_CURRENT)) return iri.substring(NS.GIST_CURRENT.length);
    if (iri.startsWith(NS.GIST_LEGACY))  return iri.substring(NS.GIST_LEGACY.length);
    return null;
  }

  function inWellKnownNs(iri) {
    if (!iri) return false;
    return iri.startsWith(NS.RDF)  || iri.startsWith(NS.RDFS) ||
           iri.startsWith(NS.OWL)  || iri.startsWith(NS.XSD)  ||
           iri.startsWith(NS.SKOS) || inGistNamespace(iri)    ||
           iri.startsWith('http://purl.org/dc/terms/')        ||
           iri.startsWith('http://www.w3.org/ns/prov#');
  }

  // Iterate quads from an N3 Store with the given pattern (any param can be null).
  function* quads(store, s, p, o) {
    for (const q of store.getQuads(s, p, o, null)) yield q;
  }

  // Set of subjects with at least one rdfs:subClassOf <something> triple.
  function classesWithAnySuperclass(store) {
    const out = new Set();
    for (const q of store.getQuads(null, NS.RDFS + 'subClassOf', null, null)) {
      if (q.subject.termType === 'NamedNode') out.add(q.subject.value);
    }
    return out;
  }

  // Set of named classes (rdf:type owl:Class).
  function namedClasses(store) {
    const out = new Set();
    for (const q of store.getQuads(null, NS.RDF + 'type', NS.OWL + 'Class', null)) {
      if (q.subject.termType === 'NamedNode') out.add(q.subject.value);
    }
    return out;
  }

  // Set of class IRIs that appear as superclass of something (i.e. they are non-leaf).
  function nonLeafClasses(store) {
    const out = new Set();
    for (const q of store.getQuads(null, NS.RDFS + 'subClassOf', null, null)) {
      if (q.object.termType === 'NamedNode') out.add(q.object.value);
    }
    return out;
  }

  // Set of class IRIs that have at least one instance (something rdf:type X).
  function classesWithInstances(store) {
    const out = new Set();
    for (const q of store.getQuads(null, NS.RDF + 'type', null, null)) {
      if (q.object.termType === 'NamedNode' &&
          q.object.value !== NS.OWL + 'Class' &&
          q.object.value !== NS.OWL + 'ObjectProperty' &&
          q.object.value !== NS.OWL + 'DatatypeProperty' &&
          q.object.value !== NS.OWL + 'AnnotationProperty' &&
          q.object.value !== NS.OWL + 'NamedIndividual' &&
          q.object.value !== NS.OWL + 'Ontology' &&
          q.object.value !== NS.RDF + 'Property') {
        out.add(q.object.value);
      }
    }
    return out;
  }

  // Detect the ontology IRI from a rdf:type owl:Ontology declaration.
  function detectOntologyIri(store) {
    for (const q of store.getQuads(null, NS.RDF + 'type', NS.OWL + 'Ontology', null)) {
      if (q.subject.termType === 'NamedNode') return q.subject.value;
    }
    return null;
  }

  // Detect the primary domain namespace by counting non-well-known IRI prefixes.
  function detectDomainNamespace(store) {
    const counts = new Map();
    for (const q of store.getQuads(null, null, null, null)) {
      for (const term of [q.subject, q.predicate, q.object]) {
        if (term.termType !== 'NamedNode') continue;
        if (inWellKnownNs(term.value)) continue;
        const sep = Math.max(term.value.lastIndexOf('#'), term.value.lastIndexOf('/'));
        if (sep < 0) continue;
        const ns = term.value.substring(0, sep + 1);
        counts.set(ns, (counts.get(ns) || 0) + 1);
      }
    }
    let best = null, bestCount = 0;
    for (const [ns, c] of counts) {
      if (c > bestCount) { best = ns; bestCount = c; }
    }
    return best;
  }

  // Has the ontology declared an owl:imports?
  function hasUpperOntologyImport(store) {
    for (const q of store.getQuads(null, NS.OWL + 'imports', null, null)) {
      if (q.object.termType === 'NamedNode') return true;
    }
    return false;
  }

  return {
    localName, inGistNamespace, gistLocalName, inWellKnownNs, quads,
    classesWithAnySuperclass, namedClasses, nonLeafClasses,
    classesWithInstances, detectOntologyIri, detectDomainNamespace,
    hasUpperOntologyImport,
  };
})();
