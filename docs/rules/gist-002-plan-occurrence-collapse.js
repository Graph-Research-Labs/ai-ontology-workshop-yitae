// GIST-002 — Plan/occurrence collapse
// Ported from OntOLinter:
// ontolint/ontolint-rules/src/main/java/com/grl/ontolint/rules/gist/PlanOccurrenceCollapseRule.java

(function () {
  const H  = window.GRLLinter.helpers;
  const NS = window.GRLLinter.NS;

  // From GistVocabulary.DISJOINT_PAIRS (Java).
  const DISJOINT_PAIRS = [
    ['Event',         'Task'],
    ['Place',         'Equipment'],
    ['Place',         'Person'],
    ['Specification', 'Magnitude'],
    ['Category',      'Specification'],
  ];

  function pairMatches(localA, localB, ruleA, ruleB) {
    return (localA === ruleA && localB === ruleB) ||
           (localA === ruleB && localB === ruleA);
  }

  window.GRLLinter.registerRule({
    id: 'GIST-002',
    name: 'Plan/occurrence collapse',
    category: 'gist',
    severity: 'warning',
    blurb: 'A single class is asserted as a subclass of two gist classes that the methodology treats as distinct modelling roles — most often gist:Event (the actual occurrence) and gist:Task (the plan). These two are not formally disjoint in gist (gist:Task is in fact a subclass of gist:Event), so a reasoner will not flag it, but the dual-subclass pattern reliably indicates that the modeller has conflated the plan and the occurrence into one class. The fix is to split them: one class extending gist:Task for the plan, one extending gist:Event for the occurrence, linked by an object property.',

    check(store) {
      // Map each subject to the set of gist parent local names it has via rdfs:subClassOf
      const parentsBySubject = new Map();
      for (const q of H.quads(store, null, NS.RDFS + 'subClassOf', null)) {
        if (q.object.termType !== 'NamedNode') continue;
        if (q.subject.termType !== 'NamedNode') continue;
        const local = H.gistLocalName(q.object.value);
        if (!local) continue;
        if (!parentsBySubject.has(q.subject.value)) parentsBySubject.set(q.subject.value, new Set());
        parentsBySubject.get(q.subject.value).add(local);
      }

      const violations = [];
      for (const [subj, parents] of parentsBySubject) {
        const arr = [...parents];
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            for (const [a, b] of DISJOINT_PAIRS) {
              if (pairMatches(arr[i], arr[j], a, b)) {
                violations.push({
                  subject: subj,
                  message: `Class is rdfs:subClassOf both gist:${arr[i]} and gist:${arr[j]} which the gist methodology treats as disjoint. Split the class into two distinct concepts.`,
                });
              }
            }
          }
        }
      }
      return violations;
    },
  });
})();
