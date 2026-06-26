// GIST-001 — Parallel property invention
// Ported from OntOLinter:
// ontolint/ontolint-rules/src/main/java/com/grl/ontolint/rules/gist/ParallelPropertyInventionRule.java

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  // Lifted from GistVocabulary.SYNONYMS (Java) — keys are lowercased local names.
  const SYNONYMS = {
    'containscomponent':  'hasPart',
    'consistsof':         'hasPart',
    'comprises':          'hasPart',
    'hascomponent':       'hasPart',
    'containspart':       'hasPart',
    'belongsto':          'isMemberOf',
    'memberof':           'isMemberOf',
    'partof':             'isPartOf',
    'hasunit':            'hasUnitOfMeasure',
    'hasuom':             'hasUnitOfMeasure',
    'unitofmeasure':      'hasUnitOfMeasure',
    'hasvalue':           'numericValue',
    'numericvalue':       'numericValue',
    'value':              'numericValue',
    'categorizedby':      'isCategorizedBy',
    'hascategory':        'isCategorizedBy',
    'hastype':            'isCategorizedBy',
    'haskind':            'isCategorizedBy',
    'actualstarttime':    'actualStartDateTime',
    'starttime':          'actualStartDateTime',
    'beganat':            'actualStartDateTime',
  };

  window.GRLLinter.registerRule({
    id: 'GIST-001',
    name: 'Parallel property invention',
    category: 'gist',
    severity: 'warning',
    blurb: 'A user-namespace property duplicates a well-known gist property. Reuse the gist property instead.',

    check(store) {
      const violations = [];
      const seen = new Set();
      const propertyTypes = new Set([NS.OWL + 'ObjectProperty', NS.OWL + 'DatatypeProperty']);

      for (const q of H.quads(store, null, NS.RDF + 'type', null)) {
        if (q.object.termType !== 'NamedNode') continue;
        if (!propertyTypes.has(q.object.value)) continue;
        if (q.subject.termType !== 'NamedNode') continue;

        const iri = q.subject.value;
        if (H.inGistNamespace(iri)) continue;
        if (seen.has(iri)) continue;
        seen.add(iri);

        const local = H.localName(iri).toLowerCase();
        const suggestion = SYNONYMS[local];
        if (!suggestion) continue;

        violations.push({
          subject: iri,
          message: `Property duplicates gist:${suggestion}. Reuse the gist property rather than inventing a parallel one.`,
        });
      }
      return violations;
    },
  });
})();
