# Artefact 3 — SHACL generation

## Purpose

Generate SHACL shapes that enforce the structural constraints implied by your competency questions and class definitions. SHACL turns the ontology into a checkable contract — every instance datum is testable against the shapes.

## When to use

Whenever a class or property changes. Whenever a competency question is added or modified. As part of the resync discipline in the Assess phase of the methodology.

## The prompt

```
You are an expert in SHACL shape authoring. Your task is to generate SHACL shapes that
enforce the structural constraints implied by the class definitions and competency
questions provided below.

For each class, generate a NodeShape that:
  - Targets the class.
  - Declares the cardinality of every essential property (minCount, maxCount).
  - Declares the value type or value class for every property (datatype, class).
  - Declares any disjointness, equivalence, or value range constraints implied by the
    class definition.
  - Includes a sh:message in plain English for every constraint, suitable for surfacing
    to a non-technical user.

For each competency question that implies a structural constraint (for example, "every
Payment must have at least one SettlementLeg"), generate a corresponding PropertyShape or
NodeShape.

Use the prefix sh: <http://www.w3.org/ns/shacl#> and assume the ontology prefix is :.
Output Turtle. Do not include the ontology declarations themselves; only the SHACL.

Order the output: NodeShapes first (one block per class), then standalone
PropertyShapes derived from competency questions.

CLASS DEFINITIONS:
<paste class definitions here, one per class, in the form: ClassName: description>

COMPETENCY QUESTIONS:
<paste your CQs here, one per line>

Begin.
```

## Notes and variations

- For closed shapes (no extra properties allowed), add: *All NodeShapes must use sh:closed true with sh:ignoredProperties (rdf:type).*
- For language tag enforcement on labels, add: *For every rdfs:label or skos:prefLabel, declare sh:languageIn ( 'en' 'fr' … ) with the working languages.*
- Always run the generated SHACL through pyshacl or topbraid before commit.
- Do not let the LLM regenerate SHACL you have hand-curated.
