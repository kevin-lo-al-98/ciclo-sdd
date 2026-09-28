# Scoring Rubric

Source: NVIDIA SkillSpector scoring model (Apache-2.0). Snapshot: 2026-06-01.

---

## Score Calculation

### Base Weights (per finding)

| Severity | Points |
|----------|--------|
| CRITICAL | +50 |
| HIGH     | +25 |
| MEDIUM   | +10 |
| LOW      | +5  |

Sum all finding weights. Multiple findings of the same pattern stack.

### Executable Script Multiplier

If the skill includes **executable scripts** (Python, shell, JavaScript, or any runnable code outside Markdown prose), apply a **1.3x multiplier** to the raw score before capping.

> Basis: Skills with executable scripts are 2.12x more likely to be vulnerable (Liu et al., 2026).

### Cap

Final score is capped at **100**.

### Formula

```
raw_score = sum(weight for each finding)
if skill_has_executable_scripts:
    raw_score = raw_score * 1.3
score = min(100, round(raw_score))
```

---

## Verdict Bands

| Score | Verdict  | Recommendation |
|-------|----------|----------------|
| 0–20  | SAFE     | Install with normal caution |
| 21–50 | CAUTION  | Review flagged findings before installing |
| 51–80 | HIGH     | DO NOT INSTALL — remediate first |
| 81–100| CRITICAL | DO NOT INSTALL — likely malicious |

---

## Verdict Floors (override score-based band)

Certain finding types set a minimum verdict regardless of numeric score:

| Condition | Minimum Verdict |
|-----------|-----------------|
| P5 (harmful content) found | CRITICAL |
| RA1 (self-modification) found | CRITICAL |
| Malicious intent confirmed by semantic pass | CRITICAL |
| Inspector manipulation attempt detected (Anti-Manipulation Guard triggered) | HIGH |
| Cyrillic homoglyph in skill name or description (TP2) | HIGH |
| TT3 or TT5 found (credential/code execution taint) | HIGH |

> A floor means: even if the numeric score would yield SAFE or CAUTION, the verdict is raised to the floor level.

---

## Per-Finding Output Format

Each finding must include:

```
id:        <pattern ID, e.g. P3>
severity:  <CRITICAL | HIGH | MEDIUM | LOW>
location:  <file path and section/line, e.g. SKILL.md § Scan Workflow, line ~42>
evidence:  <literal quote from the analyzed content — exact text, no paraphrase>
rationale: <why this matches the pattern and why it is dangerous>
```

---

## Global Verdict Format

```
verdict:   <SAFE | CAUTION | HIGH | CRITICAL>
score:     <0–100>
coverage:  <"44 patterns checked natively (36 static/semantic + 8 MCP). Deferred to CLI: TT1-TT5 (taint), AST1-AST8 (AST), YR1-YR4 (YARA binary), SC4-SC6 (live CVE).">
action:    <"Safe to install" | "Review findings before installing" | "DO NOT INSTALL — remediate first" | "DO NOT INSTALL — likely malicious">
findings:  <list of per-finding records above, or "No findings" if SAFE>
```

---

## Severity Reference (from SkillSpector pattern_defaults.py)

| ID  | Severity | Pattern Name |
|-----|----------|--------------|
| P1  | HIGH     | Override Instructions |
| P2  | HIGH     | Hidden Instructions |
| P3  | HIGH     | External Transmission Instructions |
| P4  | MEDIUM   | Subtle Steering |
| P5  | CRITICAL | Harmful Content |
| P6  | HIGH     | System Prompt Leakage (Direct) |
| P7  | MEDIUM   | System Prompt Leakage (Indirect) |
| P8  | HIGH     | System Prompt Leakage (Tool-based) |
| E1  | MEDIUM   | External Transmission |
| E2  | HIGH     | Env Variable Harvesting |
| E3  | MEDIUM   | File System Enumeration |
| E4  | HIGH     | Conversation Context Leak |
| PE1 | LOW      | Excessive Permissions |
| PE2 | MEDIUM   | Sudo/Root Invocation |
| PE3 | HIGH     | Credential File Access |
| SC1 | LOW      | Unpinned Dependencies |
| SC2 | HIGH     | Remote Code Execution |
| SC3 | HIGH     | Obfuscated Code |
| EA1 | HIGH     | Unrestricted Tool Access |
| EA2 | HIGH     | Autonomous Decision Making |
| EA3 | MEDIUM   | Scope Creep |
| EA4 | MEDIUM   | Unbounded Resource Access |
| OH1 | HIGH     | Unvalidated Output Injection |
| OH2 | MEDIUM   | Cross-Context Output |
| OH3 | MEDIUM   | Unbounded Output |
| MP1 | HIGH     | Persistent Context Injection |
| MP2 | MEDIUM   | Context Window Stuffing |
| MP3 | HIGH     | Memory Manipulation |
| TM1 | HIGH     | Tool Parameter Abuse |
| TM2 | HIGH     | Chaining Abuse |
| TM3 | MEDIUM   | Unsafe Defaults |
| RA1 | CRITICAL | Self-Modification |
| RA2 | HIGH     | Session Persistence |
| TR1 | MEDIUM   | Overly Broad Trigger |
| TR2 | HIGH     | Shadow Command Trigger |
| TR3 | MEDIUM   | Keyword Baiting Trigger |
| TP1 | HIGH     | Hidden Instructions (MCP) |
| TP2 | HIGH     | Unicode Deception |
| TP3 | MEDIUM   | Parameter Description Injection |
| TP4 | MEDIUM   | Description-Behavior Mismatch |
| LP1 | HIGH     | Underdeclared Capability |
| LP2 | MEDIUM   | Wildcard Permission |
| LP3 | MEDIUM   | Missing Permission Declaration |
| LP4 | LOW      | Overdeclared Permission |
