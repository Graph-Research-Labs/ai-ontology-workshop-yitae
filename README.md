# AI-Assisted Ontology Engineering — Workshop Toolkit

The takeaway materials from the **AI-Assisted Ontology Engineering** workshop at the **Korean Graph User Group (KGUG)** session in Seoul, 2 July 2026.

## What's in here

- **`docs/`** — the GRL Workshop Linter, a single-page web app that runs seven pitfall checks ported from [GRL OntOLinter](https://www.graphresearchlabs.com/ontolinter) directly in your browser. Hosted via GitHub Pages at `https://graph-research-labs.github.io/ai-ontology-workshop-yitae/`.
- **`prompts/`** — the seven prompt artefacts from the workshop handout: competency-question generation, adversarial critique, SHACL generation, modeller dialogue, test data generation, the style-guide-as-system-prompt template, and the production readiness checklist.
- **`examples/cbpa/`** — the Cross-Border Payments and AML Ontology used as the workshop's demonstration exemplar. Five files: clean reference (`bank-clean.ttl`), the deliberately flawed version (`bank-flawed.ttl`), the SHACL shapes for the clean ontology, sample instance data (validates clean against the shapes), and twelve worked competency questions.

## Before the workshop

You need:

1. A modern web browser (Chrome, Firefox, Safari, Edge).
2. An ontology editor — [Protégé](https://protege.stanford.edu/) is free and what the workshop's hands-on instructions reference.
3. Access to an LLM. Claude is recommended; GPT-class and Gemini-class models work too with minor prompt adaptation.
4. An ontology you actually work on (or use the CBPA sample).

That's it. No Python, no terminal, no install steps.

**Bookmark** `https://graph-research-labs.github.io/ai-ontology-workshop-yitae/` and test it loads.

## Using the linter

Open the bookmarked URL. Drop a Turtle file onto the page. The page runs seven rules in your browser and shows a findings report. Your ontology is never uploaded anywhere — everything happens locally.

The seven rules:

| ID | Name | Source | What it catches |
|---|---|---|---|
| **GIST-001** | Parallel property invention | OntOLinter | A user-namespace property duplicates a well-known gist property (for example `containsAccount` instead of `gist:isDirectPartOf`, or `hasType` instead of `gist:isCategorizedBy`). |
| **GIST-002** | Plan/occurrence collapse | OntOLinter | A single class is asserted as `rdfs:subClassOf` of two gist classes the methodology treats as distinct modelling roles — most often `gist:Event` (the actual occurrence) and `gist:Task` (the plan). The two are not formally disjoint in gist (`gist:Task` is a subclass of `gist:Event`), so a reasoner will not flag the dual-subclass — but the pattern reliably indicates plan and occurrence have been conflated into one class. Split them. |
| **GIST-003** | Instance as subclass | OntOLinter | A class looks like an individual modelled as a class (for example `MT103_Payment_TXN001`). The fix is to model it as an individual with `gist:isCategorizedBy` linking to a `gist:Category` instance. |
| **GIST-004** | Specification mis-typed as Category | OntOLinter | A class is `rdfs:subClassOf gist:Category` but its name or properties suggest a `gist:Specification` (for example `AMLAlertStatus` or `CustomerRiskScore`). |
| **GIST-005** | Orphan domain class | Workshop | A domain class lacks an upper-ontology parent despite the ontology declaring an `owl:imports` (for example `Customer` or `Branch` floating at the root). |
| **GIST-008** | Type as subclass | Workshop (back-ported to OntOLinter — see backlog) | A class names itself `<modelDesignator>_<parentClassName>` (e.g. `MT103_Payment` subClassOf `Payment`) and has no own axioms — the intermediate layer of a deep-hierarchy explosion. Model the variant as a `gist:Category` instance instead. |
| **STRUCT-002** | Missing annotation | Workshop | A class or property in the domain namespace lacks both `skos:prefLabel` and `skos:definition`. |

Seven rules out of OntOLinter's thirty-plus. This is a teaching tool, not a production linter.

## The CBPA worked example

The five files in `examples/cbpa/` form a complete worked example for the methodology:

- **`bank-clean.ttl`** — the reference ontology. Twenty-four classes extending gist 14 by IRI. Account aligned to `gist:Agreement`, Payment to `gist:Event`, PaymentInstruction to `gist:Task`, Bank to `gist:Organization`, Branch to `gist:GeoRegion`. All categorical discrimination (channel, currency, purpose, status) lives in `gist:Category` instances.
- **`bank-flawed.ttl`** — the same domain mismodelled. Drop it on the linter and you get 52 findings across all seven rules.
- **`cbpa-shacl-clean.ttl`** — SHACL shapes for the clean ontology, with `sh:message` on every constraint. The marquee shapes `PaymentShape` and `PaymentInstructionShape` enforce plan/occurrence disjointness through `sh:maxCount 0` clauses, so any mis-attached planning property on a Payment (or occurrence property on an Instruction) shows up as a validation failure.
- **`cbpa-instances-sample.ttl`** — synthetic instance data. Four banks (including two correspondent banks), three branches, six Korean and international customers across five risk ratings, eight accounts spanning KRW/USD/JPY/EUR, eight payments, nine payment instructions, three KYC reviews, two suspicious activity reports. Validates clean against the SHACL shapes, and answers every CQ with both a yes-case and a no-case.
- **`cbpa-cqs.txt`** — twelve competency questions covering the canonical AML and cross-border payment use cases. Each has a use case, the elements it exercises, and a SPARQL skeleton.

## Production-grade auditing — GRL OntOLinter

For real ontology auditing — full OWL profile compliance (DL/EL/QL/RL), the complete rule library across STRUCTURAL/SEMANTIC/SKOS/PROFILE/REASONER/STYLE/GIST categories, custom rule configuration, SARIF and JSON output, CI integration — see the productised [GRL OntOLinter](https://www.graphresearchlabs.com/ontolinter) or get in touch at `dougal.watt@graphresearchlabs.com`.

## After the workshop

The methodology is in [METHODOLOGY.md](METHODOLOGY.md). The seven prompt artefacts are in `prompts/`. The handout you took home has worked examples and the lightweight conformance template.

If you want a free OntOLinter conformance report on your own ontology — the production-grade equivalent of what this linter shows — email `dougal.watt@graphresearchlabs.com` with your ontology attached. One report per attendee within ten working days.

## Licence

Apache 2.0. See [LICENSE](LICENSE).

The workshop linter ports rule logic from GRL OntOLinter (proprietary). The ports are released under Apache 2.0 with permission, deliberately limited in scope so they remain a teaching tool rather than a competing product.
