// STRUCT-002 — Missing annotation
// Workshop-introduced rule (OOPS! P08 equivalent; OntOLinter does not yet have it).
//
// Every class and property in the domain namespace should carry skos:prefLabel
// and skos:definition (team convention). rdfs:label and rdfs:comment are
// accepted as fallback annotations but flagged as a style violation in a
// separate beat.

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  function hasAnnotation(store, subject) {
    for (const q of store.getQuads(subject, NS.SKOS + 'prefLabel', null, null)) return true;
    for (const q of store.getQuads(subject, NS.SKOS + 'definition', null, null)) return true;
    return false;
  }

  window.GRLLinter.registerRule({
    id: 'STRUCT-002',
    name: 'Missing annotation',
    category: 'structural',
    severity: 'info',
    blurb: 'Domain classes and properties should carry skos:prefLabel and skos:definition. Missing annotations make the ontology hard to consume.',

    check(store, meta) {
      const targets = new Set();

      // Classes in the domain namespace
      for (const cls of H.namedClasses(store)) {
        if (meta.domainNamespace && !cls.startsWith(meta.domainNamespace)) continue;
        if (H.inWellKnownNs(cls)) continue;
        targets.add(cls);
      }
      // Object and datatype properties in the domain namespace
      for (const propType of [NS.OWL + 'ObjectProperty', NS.OWL + 'DatatypeProperty', NS.OWL + 'AnnotationProperty']) {
        for (const q of store.getQuads(null, NS.RDF + 'type', propType, null)) {
          if (q.subject.termType !== 'NamedNode') continue;
          const iri = q.subject.value;
          if (meta.domainNamespace && !iri.startsWith(meta.domainNamespace)) continue;
          if (H.inWellKnownNs(iri)) continue;
          targets.add(iri);
        }
      }

      const violations = [];
      for (const subj of targets) {
        if (hasAnnotation(store, subj)) continue;
        violations.push({
          subject: subj,
          message: `No skos:prefLabel or skos:definition. Add both to make the entity human-readable.`,
        });
      }
      return violations;
    },
  });
})();
