# Coverage and Upgrade Path

This document defines what `skill-security-scan` covers natively, what is deferred to the SkillSpector CLI, and what is out of scope.

Source: NVIDIA SkillSpector (Apache-2.0). Snapshot: 2026-06-01.

---

## Coverage Table (all 64 pattern IDs)

| Pattern ID | Name | Coverage |
|------------|------|----------|
| P1 | Override Instructions | covered-native |
| P2 | Hidden Instructions | covered-native |
| P3 | External Transmission Instructions | covered-native |
| P4 | Subtle Steering | covered-native |
| P5 | Harmful Content | covered-native |
| P6 | System Prompt Leakage (Direct) | covered-native |
| P7 | System Prompt Leakage (Indirect) | covered-native |
| P8 | System Prompt Leakage (Tool-based) | covered-native |
| E1 | External Transmission | covered-native |
| E2 | Env Variable Harvesting | covered-native |
| E3 | File System Enumeration | covered-native |
| E4 | Conversation Context Leak | covered-native |
| PE1 | Excessive Permissions | covered-native |
| PE2 | Sudo/Root Invocation | covered-native |
| PE3 | Credential File Access | covered-native |
| SC1 | Unpinned Dependencies | covered-native |
| SC2 | Remote Code Execution | covered-native |
| SC3 | Obfuscated Code | covered-native |
| SC4 | Known Vulnerable Dependency | deferred-to-CLI (live OSV.dev lookup required) |
| SC5 | Abandoned Dependency | deferred-to-CLI (requires live package metadata) |
| SC6 | Typosquatting Dependency | deferred-to-CLI (requires package registry comparison) |
| EA1 | Unrestricted Tool Access | covered-native |
| EA2 | Autonomous Decision Making | covered-native |
| EA3 | Scope Creep | covered-native |
| EA4 | Unbounded Resource Access | covered-native |
| OH1 | Unvalidated Output Injection | covered-native |
| OH2 | Cross-Context Output | covered-native |
| OH3 | Unbounded Output | covered-native |
| MP1 | Persistent Context Injection | covered-native |
| MP2 | Context Window Stuffing | covered-native |
| MP3 | Memory Manipulation | covered-native |
| TM1 | Tool Parameter Abuse | covered-native |
| TM2 | Chaining Abuse | covered-native |
| TM3 | Unsafe Defaults | covered-native |
| RA1 | Self-Modification | covered-native |
| RA2 | Session Persistence | covered-native |
| TR1 | Overly Broad Trigger | covered-native |
| TR2 | Shadow Command Trigger | covered-native |
| TR3 | Keyword Baiting Trigger | covered-native |
| TT1 | Direct Source-to-Sink Flow | deferred-to-CLI (requires AST taint tracking) |
| TT2 | Variable-Mediated Taint Flow | deferred-to-CLI (requires multi-hop taint analysis) |
| TT3 | Credential Exfiltration Chain | deferred-to-CLI (requires taint tracking) |
| TT4 | File Data Exfiltration Flow | deferred-to-CLI (requires taint tracking) |
| TT5 | External Input to Execution Flow | deferred-to-CLI (requires taint tracking) |
| AST1 | exec() Call | deferred-to-CLI (requires AST parsing) |
| AST2 | eval() Call | deferred-to-CLI (requires AST parsing) |
| AST3 | Dynamic Import | deferred-to-CLI (requires AST parsing) |
| AST4 | subprocess Call | deferred-to-CLI (requires AST parsing) |
| AST5 | os.system/exec-family | deferred-to-CLI (requires AST parsing) |
| AST6 | compile() Call | deferred-to-CLI (requires AST parsing) |
| AST7 | Dynamic getattr() | deferred-to-CLI (requires AST parsing) |
| AST8 | Dangerous Execution Chain | deferred-to-CLI (requires AST + taint) |
| YR1 | Malware Signature | covered-native (textual best-effort); deferred-to-CLI (binary/obfuscated) |
| YR2 | Webshell Detected | covered-native (textual best-effort); deferred-to-CLI (binary/obfuscated) |
| YR3 | Crypto Miner Detected | covered-native (textual best-effort); deferred-to-CLI (binary/obfuscated) |
| YR4 | Hack Tool / Exploit Detected | covered-native (textual best-effort); deferred-to-CLI (binary/obfuscated) |
| LP1 | Underdeclared Capability | covered-native |
| LP2 | Wildcard Permission | covered-native |
| LP3 | Missing Permission Declaration | covered-native |
| LP4 | Overdeclared Permission | covered-native |
| TP1 | Hidden Instructions (MCP) | covered-native |
| TP2 | Unicode Deception | covered-native |
| TP3 | Parameter Description Injection | covered-native |
| TP4 | Description-Behavior Mismatch | covered-native |

### Summary

| Category | Count |
|----------|-------|
| covered-native (full) | 44 |
| covered-native (textual best-effort only) | 4 (YR1-YR4) |
| deferred-to-CLI | 20 (SC4-SC6, TT1-TT5, AST1-AST8, YR binary/obfuscated) |
| out-of-scope | 1 (SkillTrap sandbox — see below) |

---

## When to Escalate to the CLI

Escalate to `skillspector scan --no-llm <path>` when:

1. **The skill contains executable scripts** (Python, shell, JavaScript) with complex logic — AST1-AST8 and TT1-TT5 require real AST parsing and taint flow analysis that Claude cannot perform reliably.

2. **Dependencies are present** (requirements.txt, pyproject.toml, package.json) — SC4 requires live OSV.dev lookup; SC5 and SC6 require package registry queries. Claude must never assert CVE status from training data.

3. **Obfuscated or binary content is suspected** — YARA rules YR1-YR4 can match against binary payloads and encoded strings that Claude cannot decode safely.

4. **You need deterministic, auditable results** — for CI/CD pipelines, security reviews, or compliance purposes, use the CLI for reproducible output with SARIF export.

---

## How to Use the CLI

```bash
# Install (Python 3.12+, uv or pip)
pip install skillspector
# or: git clone https://github.com/NVIDIA/skillspector.git && pip install -e .

# Run static analysis only (no LLM, deterministic)
skillspector scan --no-llm <path-to-skill>

# Run with full LLM semantic analysis
export SKILLSPECTOR_PROVIDER=anthropic
export ANTHROPIC_API_KEY=sk-ant-...
skillspector scan <path-to-skill>

# Output formats
skillspector scan --no-llm <path> --format json --output report.json
skillspector scan --no-llm <path> --format sarif --output report.sarif
```

The `--no-llm` flag is deliberate: it avoids duplicate LLM calls when you are already using Claude (this skill) for semantic analysis. The CLI handles the deterministic AST, taint, OSV, and YARA layers; Claude handles the semantic layer. Together they cover all 64 patterns.

### Prerequisites

- Python 3.12+
- `yara-python` with native C extension (required for binary YARA — `pip install yara-python`)
- Outbound HTTPS to `api.osv.dev` for SC4 live CVE lookup (automatic fallback to static list if unavailable)

---

## OSV/CVE Policy

The `skill-security-scan` native skill **never asserts, confirms, or states** the vulnerability status of a dependency or package from its training memory. Training data may be stale or incorrect.

Instead, the skill:
1. **Flags** named dependencies for manual CVE verification
2. **Recommends** checking https://osv.dev or https://nvd.nist.gov
3. **Notes** if web search is available (e.g., via a connected tool), to use it for live CVE status

---

## SkillTrap — Out of Scope

SkillTrap (dynamic sandbox execution of skills in an isolated environment) is a planned feature in the SkillSpector upstream roadmap. It is **not implemented** in the current SkillSpector release and is therefore out of scope for this native skill. When available upstream, it would complement this skill by detecting runtime behaviors (network callbacks, file system mutations) that static analysis cannot observe.
