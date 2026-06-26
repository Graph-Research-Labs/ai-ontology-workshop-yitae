# The methodology in one page

A seven-beat arc that takes an ontology from initial framing to production-ready. The arc is iterative — re-enter at any beat as the ontology evolves. The arc is also modular — each beat works as a standalone activity.

| Beat | Purpose | Human's job | LLM's job |
|---|---|---|---|
| 1. **Frame** | Establish what the ontology is for — measurable competency questions. | Provide domain description and scope. | Generate, expand, and clarify CQs. |
| 2. **Generate** | Produce or extend ontology structure to answer the CQs. | Provide patterns and existing structure. | Suggest additions and refinements. |
| 3. **Critique** | Surface weaknesses adversarially before they reach the audit step. | Configure the adversarial perspectives. | Play the antagonist roles. |
| 4. **Fix** | Apply the human-decided fix to the ontology. | Decide what to change and apply it. | Pair-modeller dialogue; sanity-check. |
| 5. **Validate** | Re-run reasoner, re-run CQ tests, re-run lint. | Run the tools. | Generate or regenerate SHACL shapes. |
| 6. **Conform** | Score against the conformance criteria. | Read the report; decide what to fix next. | Summarise findings; suggest priorities. |
| 7. **Productionise** | Sign-off, version, document, release. | Sign-off and decision documentation. | Generate change-log entries; documentation. |

## Five key principles

1. **Augment, not generate.** The LLM is an assistant; it does not author the ontology. The human ontologist remains responsible for every axiom that ends up in the published artefact.
2. **Patterns and focus.** LLMs excel at applying known patterns to new material and at focusing on narrow, well-formed questions. They struggle with unconstrained generation. Provide the pattern; provide the focus; let the LLM apply.
3. **Always validate after change.** Every edit must be followed by a reasoner run, a SHACL run, a lint run, and a CQ test re-run. The validation cadence is what makes the methodology trustworthy.
4. **Sync downstream artefacts.** SHACL shapes, JSON-LD contexts, OpenAPI specs, SQL schemas, documentation — every dependent artefact must be regenerated whenever the ontology changes.
5. **Antagonistic agents elevate quality.** LLMs are sycophantic by default. Adversarial framings — sceptical reviewer, domain expert, regulator, first-principles thinker — reliably surface weaknesses that direct review misses.

## Six places where the LLM should be excluded or treated with suspicion

1. **Foundational class structure.** Upper-level distinctions of your ontology — particularly when aligned to gist, BFO, DOLCE, or another upper ontology — should be human-authored.
2. **Equivalence axioms.** `owl:equivalentClass` and `owl:equivalentProperty` declarations have profound reasoning consequences.
3. **Anything load-bearing for downstream reasoning.** If a critical inference depends on it, do not let the LLM author it.
4. **Areas of legitimate domain disagreement.** The LLM will pick a side without telling you.
5. **Naming of stable identifiers.** IRI structure and identifier patterns should be standardised by the team.
6. **Anything safety- or compliance-critical.** Self-evident.

The full methodology, with worked examples and the lightweight conformance template, is in the workshop handout you took home from the session.
