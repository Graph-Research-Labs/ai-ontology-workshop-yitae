// GIST-003 — Instance as subclass
// Ported from OntOLinter:
// ontolint/ontolint-rules/src/main/java/com/grl/ontolint/rules/gist/InstanceAsSubclassRule.java

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  // Same regex as the Java rule.
  const INSTANCE_PATTERN = /(.*[_\-][A-Z]+\d+.*|.*\d{2,}$)/;

  // A class is "no own axioms beyond subClassOf and label" if every triple with it
  // as subject uses one of these predicates.
  const ALLOWED_PREDICATES = new Set([
    NS.RDF  + 'type',
    NS.RDFS + 'subClassOf',
    NS.RDFS + 'label',
    NS.RDFS + 'comment',
    NS.SKOS + 'prefLabel',
    NS.SKOS + 'definition',
  ]);

  function hasNoOwnAxiomsBeyondSubclassAndLabel(store, cls) {
    for (const q of store.getQuads(cls, null, null, null)) {
      if (!ALLOWED_PREDICATES.has(q.predicate.value)) return false;
    }
    return true;
  }

  window.GRLLinter.registerRule({
    id: 'GIST-003',
    name: 'Instance as subclass',
    category: 'gist',
    severity: 'warning',
    blurb: 'A class looks like an individual modelled as a class (e.g. MT103_Payment_TXN001). Consider modelling as a gist:Category instance.',

    check(store) {
      const classes      = H.namedClasses(store);
      const nonLeaves    = H.nonLeafClasses(store);
      const withInstance = H.classesWithInstances(store);

      const violations = [];
      for (const cls of classes) {
        if (!INSTANCE_PATTERN.test(H.localName(cls))) continue;

        let supporting = 0;
        if (!nonLeaves.has(cls)) supporting++;
        if (!withInstance.has(cls)) supporting++;
        if (hasNoOwnAxiomsBeyondSubclassAndLabel(store, cls)) supporting++;

        if (supporting >= 3) {
          violations.push({
            subject: cls,
            message: `Class looks like an individual modelled as a class. Model as a gist:Category instance with gist:isCategorizedBy linking from the parent class.`,
          });
        }
      }
      return violations;
    },
  });
})();
