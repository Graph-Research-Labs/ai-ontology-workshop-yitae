# Artefact 5 — Test data and CQ test generation

## Purpose

Generate synthetic instance data and SPARQL test queries that exercise the competency questions. The output is a regression test suite for your ontology.

## When to use

After your competency questions have been adversarially critiqued and you have an agreed set. Re-run whenever the ontology changes; failing tests indicate either a bug in the ontology change or a CQ that needs updating.

## The prompt

```
You are going to generate two artefacts: synthetic instance data and SPARQL test
queries derived from a set of competency questions.

For the synthetic instance data:
  - Generate 25 to 40 instances spanning the classes referenced by the CQs.
  - Ensure that for every CQ, there is at least one instance configuration that
    answers "yes" and one that answers "no".
  - Cover edge cases: empty collections, boundary values, instances missing optional
    properties, instances with maximum cardinality.
  - Use realistic-looking but obviously synthetic identifiers (e.g. :Payment_TST001
    not :Payment_MT103_REAL42).
  - Output Turtle.

For the SPARQL test queries:
  - Generate one query per CQ.
  - For each query, also generate the expected result against the synthetic
    instance data.
  - Output a JSON manifest mapping each query to its expected result count and a
    sample result row, suitable for use as a regression test suite.

ONTOLOGY CLASSES AND PROPERTIES (in Turtle):
  <paste the relevant class and property declarations>

COMPETENCY QUESTIONS WITH SPARQL SKELETONS:
  <paste the CQs with their SPARQL skeletons from Artefact 1>

Generate the instance data first, then the test queries. Stop after each section so
I can review.
```

## Notes and variations

- For internationalised test data, add: *Generate labels in <list of languages>. Every instance must have a label in every language.*
- For regulated domains, add: *Every instance must have provenance: who created it, when, and the synthetic-data flag.*
- If the data ends up trivially answering every CQ, re-run with: *The current instance data is too uniform. Add adversarial cases: instances that look like they should answer the CQ but should not, and instances that look like they should not but do.*
