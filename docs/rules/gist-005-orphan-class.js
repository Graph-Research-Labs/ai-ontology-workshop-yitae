// GIST-005 — Orphan domain class
// Workshop-introduced rule (not yet in OntOLinter proper).
//
// When an ontology declares an owl:imports of an upper ontology, every domain
// class should ultimately subclass something in the upper ontology. Classes
// that sit at the root of the asserted hierarchy with no upper-ontology parent
// fragment the taxonomy and defeat cross-ontology alignment.

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  // True if the class has rdfs:subClassOf to ANYTHING other than owl:Thing.
  function hasNonThingSuperclass(store, cls) {
    for (const q of store.getQuads(cls, NS.RDFS + 'subClassOf', null, null)) {
      if (q.object.termType === 'BlankNode') continue;             // restriction
      if (q.object.termType !== 'NamedNode') continue;
      if (q.object.value === NS.OWL + 'Thing') continue;
      return true;
    }
    return false;
  }

  window.GRLLinter.registerRule({
    id: 'GIST-005',
    name: 'Orphan domain class',
    category: 'gist',
    severity: 'warning',
    blurb: 'A domain class lacks an upper-ontology parent. With an upper ontology in scope, every domain class should subclass something in it.',

    check(store, meta) {
      if (!H.hasUpperOntologyImport(store)) return [];           // no imports → no opinion

      const violations = [];
      for (const cls of H.namedClasses(store)) {
        // Only consider classes in the domain namespace, not gist or anything else.
        if (meta.domainNamespace && !cls.startsWith(meta.domainNamespace)) continue;
        if (H.inWellKnownNs(cls)) continue;
        if (hasNonThingSuperclass(store, cls)) continue;

        violations.push({
          subject: cls,
          message: `Class has no upper-ontology parent. Subclass it under an appropriate gist class (e.g. gist:GeoRegion, gist:Composite, gist:Equipment) so the taxonomy stays connected.`,
        });
      }
      return violations;
    },
  });
})();
