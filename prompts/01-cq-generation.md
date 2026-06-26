# Artefact 1 — Competency question generation

## Purpose

Generate ten to twelve competency questions that define what your ontology should be able to answer. Competency questions are the contract between the ontology and the application; they make the ontology testable and they make "done" measurable.

## When to use

At the start of every modelling session. For greenfield ontologies, before any class definition. For existing ontologies, as a structured way to surface the implicit purpose so it can be made explicit.

## The prompt

```
You are an expert ontology engineer experienced in gist, BFO, and domain-specific upper
ontologies. Reuse upper-ontology classes by IRI; do not redefine them. Your task is to
generate competency questions for the ontology I am about to describe.

Competency questions must be:
  - Measurable: each question must have a clear pass/fail answer condition.
  - Scoped: each question must be answerable using only the ontology and instance data.
  - Useful: each question must reflect a real use case — something a downstream
    application or a domain user would actually ask.
  - Distinct: no two questions should ask substantially the same thing.

For each competency question, provide:
  1. The question in plain language.
  2. The use case it serves.
  3. The ontology elements (classes, properties) that would need to exist for it to be
     answerable.
  4. A draft SPARQL skeleton (do not worry about correctness; sketch the shape).

Generate 10 to 12 competency questions covering the breadth of the domain. Avoid
lookup-style questions (e.g. "what is the label of X"); favour questions that exercise
structural inference, classification, or aggregation.

DOMAIN DESCRIPTION:
<paste your one-paragraph domain description here>

Begin.
```

## Notes and variations

- If you get back lookup-style questions, add: *No lookup questions. Every question must require at least two hops or a classification.*
- If you get back vague questions, add: *Each question must specify the answer type and the answer condition. 'Find Payments that…' is acceptable; 'Tell me about Payments' is not.*
- If your ontology is multilingual, add: *The working language is <language>. All questions must be expressible in <language>.*
- If you are working module-by-module on a large ontology, scope the prompt to one module at a time and reference the upstream modules by IRI.
