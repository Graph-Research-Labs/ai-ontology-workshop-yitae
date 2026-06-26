# Artefact 7 — Production readiness checklist

## Purpose

A twelve-point checklist that an ontology should pass before being released for production use. The threshold between "useful in research" and "safe to depend on".

## When to use

Before every production release. As an audit tool when inheriting an ontology from a previous team. As the success criterion for a remediation project.

## The checklist

| Check | Tool | Done |
|---|---|---|
| All competency questions have a passing SPARQL test against the canonical instance data. | SPARQL runner | ☐ |
| The reasoner runs without inconsistencies or unsatisfiable classes. | HermiT / Pellet / ELK | ☐ |
| Every NodeShape in the SHACL graph validates without violation against the canonical instance data. | pyshacl / topbraid | ☐ |
| The ontology declares its OWL 2 profile and has no profile violations. | OWL profile checker / OntOLinter | ☐ |
| No undeclared classes, properties, or annotation properties. | OntOLinter | ☐ |
| Every class has skos:prefLabel and skos:definition (or your team's equivalent). | OntOLinter / workshop linter | ☐ |
| The ontology has owl:versionIRI set to the release version. | Manual | ☐ |
| The ontology change-log records the deltas since the previous release. | Diff tool | ☐ |
| All decisions about alternative modelling options are documented (Y-statements). | Manual | ☐ |
| Downstream artefacts are regenerated and tested: SHACL, JSON-LD context, OpenAPI spec, SQL DDL, documentation. | Plugin / manual | ☐ |
| The ontology has been adversarially critiqued by at least three perspectives and findings actioned. | Artefact 2 prompt | ☐ |
| A peer reviewer has signed off the release. | Manual | ☐ |

## Reading the checklist

Every item must be ticked or explicitly waived with a documented reason. A waived item is not a failed item, but every waiver should be reviewed at the next release.

The checklist is also the basis for the lightweight conformance template in the workshop handout.
