// GIST-004 — Specification mis-typed as Category
// Adapted from OntOLinter:
// ontolint/ontolint-rules/src/main/java/com/grl/ontolint/rules/gist/SpecificationMistypedAsCategoryRule.java
//
// The Java rule checks for state-bearing properties (numeric, dateTime, boolean)
// directly on the class. We extend with a second heuristic: local names that
// suggest a Specification (Capability, ReadinessState, Configuration, ...)
// being modelled as a Category subclass.

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  const NUMERIC_RANGES = new Set([
    NS.XSD + 'decimal',  NS.XSD + 'integer',
    NS.XSD + 'double',   NS.XSD + 'float',
    NS.XSD + 'short',    NS.XSD + 'long',  NS.XSD + 'int',
    NS.XSD + 'dateTime', NS.XSD + 'date',  NS.XSD + 'boolean',
  ]);

  const SPECIFICATION_PATTERNS = [
    /capability/i, /readiness/i, /configuration/i, /state\b/i,
    /condition/i,  /status$/i,   /score/i,         /level$/i,
  ];

  // True if the class has any datatype property restriction with a numeric range.
  function hasStateBearingProperty(store, cls) {
    // Look for <cls> rdfs:subClassOf [ owl:onProperty ?p ; owl:someValuesFrom XSD ]
    // or for direct datatype-property assertions.
    for (const q of store.getQuads(cls, NS.RDFS + 'subClassOf', null, null)) {
      if (q.object.termType !== 'BlankNode') continue;
      const restriction = q.object;
      // Look for someValuesFrom / allValuesFrom / qualifiedCardinality data range
      for (const r of store.getQuads(restriction, null, null, null)) {
        if (r.object.termType !== 'NamedNode') continue;
        if (NUMERIC_RANGES.has(r.object.value)) return true;
      }
    }
    return false;
  }

  function nameLooksLikeSpecification(local) {
    return SPECIFICATION_PATTERNS.some(re => re.test(local));
  }

  window.GRLLinter.registerRule({
    id: 'GIST-004',
    name: 'Specification mis-typed as Category',
    category: 'gist',
    severity: 'warning',
    blurb: 'A class is rdfs:subClassOf gist:Category but its name or properties suggest it should be a gist:Specification.',

    check(store) {
      // Find direct subclasses of gist:Category
      const categorySubclasses = new Set();
      for (const q of H.quads(store, null, NS.RDFS + 'subClassOf', null)) {
        if (q.object.termType !== 'NamedNode') continue;
        if (q.subject.termType !== 'NamedNode') continue;
        const local = H.gistLocalName(q.object.value);
        if (local === 'Category') categorySubclasses.add(q.subject.value);
      }

      // A Category subclass that has at least one instance is almost
      // certainly correctly typed (it's an enumeration). Only flag
      // Category subclasses with NO instances and a state-bearing
      // name or properties.
      function hasInstances(cls) {
        for (const q of store.getQuads(null, NS.RDF + 'type', cls, null)) {
          if (q.subject.termType === 'NamedNode') return true;
        }
        return false;
      }

      const violations = [];
      for (const cls of categorySubclasses) {
        const local = H.localName(cls);
        if (/Category$/.test(local))      continue;        // overt Category
        if (hasInstances(cls))            continue;        // populated enumeration

        const stateBearing = hasStateBearingProperty(store, cls);
        const nameLooks    = nameLooksLikeSpecification(local);
        if (stateBearing || nameLooks) {
          const reason = stateBearing
            ? 'carries state-bearing properties'
            : 'has a name that suggests a Specification';
          violations.push({
            subject: cls,
            message: `Class is rdfs:subClassOf gist:Category but ${reason} and has no enumerated instances. Model as a gist:Specification subclass instead — Categories are type discriminators only.`,
          });
        }
      }
      return violations;
    },
  });
})();
