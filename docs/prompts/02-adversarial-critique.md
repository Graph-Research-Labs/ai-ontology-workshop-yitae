# Artefact 2 — Adversarial critique

## Purpose

Run any LLM-generated artefact through four antagonistic perspectives that probe for weaknesses the LLM is unlikely to surface in direct review. The output is a list of weaknesses, each tied to a specific perspective, that you then either fix, accept as out of scope, or escalate to a domain expert.

## When to use

After every generation step. After every fix. Before every commit. The adversarial pass is not optional in this methodology.

## The prompt

```
You are going to critique the artefact below from four adversarial perspectives. Treat
each perspective independently. Do not soften your criticism. Your job is to surface
weaknesses, not to validate.

PERSPECTIVE 1 — Sceptical reviewer.
  Assume the artefact is wrong somewhere. Find what is wrong. Report at least three
  specific weaknesses. For each, name the weakness, explain why it matters, and propose
  a fix.

PERSPECTIVE 2 — Domain expert.
  Assume you are a senior practitioner in the relevant domain. Find what is
  domain-naive — what would a real practitioner spot as ignorant of how the work
  actually happens? Report at least two specific weaknesses with the same structure
  as Perspective 1.

PERSPECTIVE 3 — Regulator or auditor.
  Assume you have to certify the ontology for use in a regulated domain (clinical,
  defence, finance — pick the most relevant). What would block certification? What
  is missing for audit, traceability, or compliance? Report at least two weaknesses.

PERSPECTIVE 4 — First-principles thinker.
  Strip away the assumptions. What is being taken for granted that should not be?
  Where is the artefact applying a pattern by reflex when a different pattern would
  serve better? Report at least two weaknesses.

After all four perspectives, give a final ranked list of the top five weaknesses across
all perspectives, ordered by severity. For each, indicate: severity (high/medium/low),
estimated effort to fix (small/medium/large), and whether it should block release.

ARTEFACT TO CRITIQUE:
<paste the artefact here>

Begin with Perspective 1.
```

## Notes and variations

- Substitute perspectives based on context. For an academic ontology, swap "regulator" for "peer reviewer". For a startup, swap "regulator" for "maintainer who inherits this in three years".
- If the LLM softens its critique, add to each perspective: *You are graded on weaknesses found, not on collegiality. A perspective that returns no weaknesses has failed its task.*
- Run each perspective in a separate fresh conversation if you find that running them together produces less independent critique.
- Always end with the ranked list. Without it, the output is too long to act on.
