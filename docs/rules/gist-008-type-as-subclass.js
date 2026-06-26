// GIST-008 — Type as subclass (intermediate typing layer)
// Workshop-introduced rule; backlogged for OntOLinter.
//
// Catches the intermediate layer of the deep-hierarchy explosion
// anti-pattern. Where GIST-003 catches the leaf level (MT103_Payment_TXN001
// modelled as a class), this rule catches the typing layer above it
// (MT103_Payment, MT202_Payment, PACS008_Payment) — where a model
// designator is being grafted onto a parent class name to fake a type
// system, instead of using gist:Category instances with
// gist:isCategorizedBy.
//
// Heuristic (all three required to fire):
//   1. Class's local name = <prefix>_<parentLocalName>, where
//      <parentLocalName> is the local name of one of its rdfs:subClassOf
//      parents. (e.g. MT103_Payment is subClassOf Payment, suffix
//      "Payment" matches.)
//   2. <prefix> is a model-designator-like token: capital letters and/or
//      digits with optional hyphens, contains at least one digit.
//      (Filters out compound English words like "Wheelchair" or
//      "Biological".)
//   3. Class has at least one subclass AND has no own axioms beyond
//      rdfs:subClassOf and rdfs:label / skos:prefLabel / skos:definition.
//      (Confirms it's a typing layer, not a real class with behaviour.)
//
// Counter-signals (skip if any true):
//   - Parent is in the gist namespace.
//   - Class has any direct instance assertion.

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  // Model-designator prefix: caps/digits/hyphens, must contain a digit,
  // no lowercase letters. Matches MT103, MT202, PACS008, AH-64D, B777-300ER.
  const MODEL_DESIGNATOR = /^[A-Z0-9\-]+$/;
  function looksLikeModelDesignator(token) {
    return MODEL_DESIGNATOR.test(token) && /\d/.test(token);
  }

  const ALLOWED_PREDICATES = new Set([
    NS.RDF  + 'type',
    NS.RDFS + 'subClassOf',
    NS.RDFS + 'label',
    NS.RDFS + 'comment',
    NS.SKOS + 'prefLabel',
    NS.SKOS + 'definition',
  ]);

  function hasOnlyAllowedDeclarations(store, cls) {
    for (const q of store.getQuads(cls, null, null, null)) {
      if (!ALLOWED_PREDICATES.has(q.predicate.value)) return false;
      // rdfs:subClassOf to a blank node (restriction) counts as own axiom
      if (q.predicate.value === NS.RDFS + 'subClassOf'
          && q.object.termType === 'BlankNode') return false;
    }
    return true;
  }

  function hasAnySubclass(store, cls) {
    for (const q of store.getQuads(null, NS.RDFS + 'subClassOf', cls, null)) {
      if (q.subject.termType === 'NamedNode') return true;
    }
    return false;
  }

  function hasDirectInstance(store, cls) {
    for (const q of store.getQuads(null, NS.RDF + 'type', cls, null)) {
      if (q.subject.termType === 'NamedNode') return true;
    }
    return false;
  }

  function namedSuperclasses(store, cls) {
    const out = [];
    for (const q of store.getQuads(cls, NS.RDFS + 'subClassOf', null, null)) {
      if (q.object.termType === 'NamedNode') out.push(q.object.value);
    }
    return out;
  }

  window.GRLLinter.registerRule({
    id: 'GIST-008',
    name: 'Type as subclass',
    category: 'gist',
    severity: 'warning',
    blurb: 'A class looks like a type/variant grafted onto a parent class name (e.g. MT103_Payment subClassOf Payment) — the intermediate layer of a deep-hierarchy explosion. Model the variant as a gist:Category instance with gist:isCategorizedBy instead.',

    check(store, meta) {
      const violations = [];
      for (const cls of H.namedClasses(store)) {
        if (meta.domainNamespace && !cls.startsWith(meta.domainNamespace)) continue;
        if (H.inWellKnownNs(cls)) continue;
        if (hasDirectInstance(store, cls)) continue;
        if (!hasAnySubclass(store, cls)) continue;            // must be intermediate
        if (!hasOnlyAllowedDeclarations(store, cls)) continue; // must have no own logic

        const local = H.localName(cls);
        const lastUnderscore = local.lastIndexOf('_');
        if (lastUnderscore <= 0) continue;
        const prefix = local.substring(0, lastUnderscore);
        const suffix = local.substring(lastUnderscore + 1);

        if (!looksLikeModelDesignator(prefix)) continue;

        // Suffix must equal the local name of one of the named superclasses,
        // and that superclass must NOT be in the gist namespace.
        let parentMatched = null;
        for (const parent of namedSuperclasses(store, cls)) {
          if (H.inGistNamespace(parent)) continue;
          if (H.localName(parent) === suffix) { parentMatched = parent; break; }
        }
        if (!parentMatched) continue;

        violations.push({
          subject: cls,
          message: `Class name "${local}" suffixes parent class "${suffix}" with model designator "${prefix}". This grafts a typing layer onto the class hierarchy. Model "${prefix}" as a gist:Category instance and link via gist:isCategorizedBy on the parent class.`,
        });
      }
      return violations;
    },
  });
})();
