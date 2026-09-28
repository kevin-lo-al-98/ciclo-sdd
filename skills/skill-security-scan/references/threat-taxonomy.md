# Threat Taxonomy — Native Patterns

**44 patterns covered natively** (36 here + 8 in [mcp-threats.md](mcp-threats.md)).  
Source: NVIDIA SkillSpector `pattern_defaults.py` (Apache-2.0). Snapshot: 2026-06-01.

For MCP tool poisoning (TP1-TP4) and MCP least privilege (LP1-LP4), see [mcp-threats.md](mcp-threats.md).  
For coverage of deferred patterns (TT1-TT5, AST1-AST8, YR1-YR4, SC4-SC6), see [coverage-and-upgrade.md](coverage-and-upgrade.md).

---

## Prompt Injection (P1-P5) — Pass 4 textual + semantic

**P1 — Override Instructions** | Severity: HIGH  
"This pattern attempts to override system instructions or ignore safety constraints."  
Detection: phrases like "ignore previous instructions", "disregard your guidelines", "forget your rules", "override", "bypass safety". Check section headings that restate Claude's system prompt.  
Remediation: Remove any text that instructs the agent to ignore prompts, override safety rules, or trust unverified content.

**P2 — Hidden Instructions** | Severity: HIGH  
"Hidden instructions were detected in comments or invisible text. These could contain malicious directives."  
Detection: HTML comments (`<!-- ... -->`), zero-width characters (U+200B, U+FEFF, U+00AD), markdown comments, base64 blobs in body text, whitespace padding exceeding 3 blank lines.  
Remediation: Audit all comments and invisible characters. Use plain, reviewable content.

**P3 — External Transmission Instructions** | Severity: HIGH  
"Instructions found that direct the agent to transmit conversation context or user data to external services."  
Detection: URLs with `http://` or `https://` combined with verbs like "send", "post", "upload", "transmit" referencing conversation, context, or user data.  
Remediation: Remove instructions that send user data, prompts, or context to external URLs.

**P4 — Subtle Steering** | Severity: MEDIUM  
"Subtle instructions detected that may alter agent decision-making or introduce hidden biases."  
Detection: Instructions that reframe the agent's persona, add unstated constraints, or embed preference nudges not visible in the skill's declared purpose. Semantic pass: ask "does this instruction serve an undisclosed goal?"  
Remediation: Review content for implicit steering or bias. Ensure instructions are explicit and align with the skill's stated purpose.

**P5 — Harmful Content** | Severity: CRITICAL  
"This content may contain harmful instructions that could cause physical harm if followed. CRITICAL: Review carefully before use."  
Detection: Step-by-step instructions for creating weapons, synthesizing dangerous substances (e.g., cyanide in Step 7), self-harm guidance, or any content that causes direct physical harm.  
Remediation: Remove all content that could lead to harmful outcomes. Add safety guardrails and human oversight for any high-risk operations.

---

## System Prompt Leakage (P6-P8) — Pass 4 semantic

**P6 — System Prompt Leakage (Direct)** | Severity: HIGH  
"Skill contains instructions that could directly expose system prompts, internal rules, or hidden instructions to users or external parties."  
Detection: Instructions to "print your system prompt", "repeat your instructions", "show your rules", or output contents of the system context verbatim.  
Remediation: Remove any instructions that reveal, print, or output system prompts or internal rules.

**P7 — System Prompt Leakage (Indirect)** | Severity: MEDIUM  
"Skill contains patterns that could indirectly extract system prompts through rephrasing, translation, summarization, or side-channel techniques."  
Detection: Instructions that ask Claude to summarize, translate, or rephrase its current instructions/persona/context without explicitly naming the system prompt.  
Remediation: Guard against indirect extraction by refusing to summarize, translate, or rephrase system instructions.

**P8 — System Prompt Leakage (Tool-based)** | Severity: HIGH  
"Skill contains patterns that exfiltrate system prompts or internal instructions via tool calls (file writes, network requests, logging)."  
Detection: Tool calls that write or transmit content framed as "current instructions", "active context", or "system configuration" to files or external endpoints.  
Remediation: Prevent system prompts from being written to files, sent via network, or logged.

---

## Data Exfiltration (E1-E4) — Pass 1 textual

**E1 — External Transmission** | Severity: MEDIUM  
"Data is being sent to an external URL. This could be legitimate telemetry or data exfiltration."  
Detection: `http://`, `https://`, IP addresses in scripts combined with request/POST/send operations. Flag any URL not belonging to the skill's declared purpose.  
Remediation: Verify the destination URL is trusted and necessary. Ensure no secrets, tokens, or PII are transmitted.

**E2 — Env Variable Harvesting** | Severity: HIGH  
"Code accesses environment variables that may contain secrets (API keys, tokens). This is a common pattern for credential theft."  
Detection: `os.environ`, `process.env`, `$ENV_VAR`, `getenv()`, especially combined with iteration (`for key, val in os.environ.items()`) or transmission.  
Remediation: Avoid reading sensitive env vars unless strictly required. Use secrets managers. Never log or transmit credentials.

**E3 — File System Enumeration** | Severity: MEDIUM  
"Code scans file system directories looking for sensitive files. This could be reconnaissance for credential theft."  
Detection: `os.walk`, `glob.glob`, `find /`, recursive directory listings, especially targeting `~/.ssh`, `~/.aws`, `~/.config`, credential directories.  
Remediation: Remove unnecessary filesystem scanning. Use explicit, scoped paths. Avoid reading credential directories.

**E4 — Conversation Context Leak** | Severity: HIGH  
"Code or instructions that leak agent conversation context to external services, potentially exposing sensitive user interactions."  
Detection: References to "conversation history", "chat log", "context window", "previous messages" combined with transmission to external endpoints.  
Remediation: Remove any code that sends prompts, responses, or session data externally.

---

## Privilege Escalation (PE1-PE3) — Pass 1 textual

**PE1 — Excessive Permissions** | Severity: LOW  
"Skill requests more permissions than appear necessary for its stated functionality."  
Detection: Permission lists containing `*`, `all`, `full`, `admin`, `superuser`, or permissions unrelated to the skill's declared purpose.  
Remediation: Request only the minimum permissions required. Document why each permission is needed.

**PE2 — Sudo/Root Invocation** | Severity: MEDIUM  
"Commands invoke sudo or root privileges. Verify this elevated access is necessary and justified."  
Detection: `sudo`, `su -`, `chmod +s`, `chown root`, `RunAsAdministrator`, UAC elevation patterns.  
Remediation: Avoid sudo/root unless strictly required. Prefer least-privilege patterns.

**PE3 — Credential File Access** | Severity: HIGH  
"Code accesses credential files (SSH keys, AWS credentials, etc.). This could indicate credential theft attempts."  
Detection: References to `~/.ssh/id_rsa`, `~/.aws/credentials`, `~/.kube/config`, `.env`, `.netrc`, `id_rsa`, `authorized_keys`.  
Remediation: Remove references to credential paths. Use environment variables or secrets managers.

---

## Supply Chain — textual subset (SC1-SC3) — Pass 1 textual

**SC1 — Unpinned Dependencies** | Severity: LOW  
"Dependencies lack version pinning, allowing potential malicious package updates."  
Detection: `requirements.txt` lines without `==`, `pyproject.toml` with `>=` without upper bound, `package.json` with `^` or `*`, scripts that `pip install <pkg>` without version.  
Remediation: Pin all dependency versions. Use exact versions (`==`) or compatible ranges. Run pip-audit regularly.

**SC2 — Remote Code Execution** | Severity: HIGH  
"Remote code is downloaded and executed. This bypasses code review and could introduce malicious code."  
Detection: `curl | bash`, `wget | sh`, `curl ... | python`, `eval $(curl ...)`, fetching and executing remote scripts inline.  
Remediation: Avoid downloading and executing remote scripts. Use trusted packages from PyPI/npm. Verify checksums and use HTTPS.

**SC3 — Obfuscated Code** | Severity: HIGH  
"Code contains obfuscation (base64, hex encoding with execution). This is often used to hide malicious functionality."  
Detection: `base64.b64decode` or `base64_decode` combined with `exec`/`eval`; hex-encoded strings passed to execution; `eval(compile(...))` patterns; multi-layer encoding chains.  
Remediation: Remove obfuscated code. Use plain, readable implementations.

---

## Excessive Agency (EA1-EA4) — Pass 4 semantic

**EA1 — Unrestricted Tool Access** | Severity: HIGH  
"Skill grants unrestricted tool access without appropriate constraints. An agent with unfettered tool access can perform arbitrary actions including file modification, network requests, and code execution."  
Detection: Skill declares or instructs use of "all tools", "any tool", `tools: ["*"]`, or explicitly grants access to dangerous tools without scope limits.  
Remediation: Restrict tool access to only the tools required. Use an explicit allowlist.

**EA2 — Autonomous Decision Making** | Severity: HIGH  
"Skill enables autonomous high-impact decisions without human-in-the-loop verification."  
Detection: Instructions that auto-execute destructive operations (file deletion, data purge, financial transactions) without requesting user confirmation.  
Remediation: Add human-in-the-loop confirmation for destructive, irreversible, or high-impact operations.

**EA3 — Scope Creep** | Severity: MEDIUM  
"Skill's behavior or capabilities extend beyond its stated purpose."  
Detection: Semantic mismatch between the skill's declared purpose in `description` and instructions in the body that enable unrelated capabilities.  
Remediation: Limit the skill's scope to its documented purpose.

**EA4 — Unbounded Resource Access** | Severity: MEDIUM  
"Skill allows unbounded resource consumption (API calls, storage, compute)."  
Detection: Loops without exit conditions, missing timeouts on API calls, instructions that generate or store unlimited data.  
Remediation: Set explicit rate limits, timeouts, and resource quotas.

---

## Output Handling (OH1-OH3) — Pass 4 semantic

**OH1 — Unvalidated Output Injection** | Severity: HIGH  
"Model output is used without validation or sanitization."  
Detection: Instructions that pipe model output directly into SQL queries, shell commands, or HTML without sanitization steps.  
Remediation: Validate and sanitize all model output before using it in downstream contexts.

**OH2 — Cross-Context Output** | Severity: MEDIUM  
"Output from one security context is used in another without boundary enforcement."  
Detection: Instructions that pass output from a privileged context (e.g., admin tool) to a lower-trust output channel without redaction.  
Remediation: Enforce strict context boundaries. Do not pass output from one security domain to another without validation.

**OH3 — Unbounded Output** | Severity: MEDIUM  
"Output size or generation rate is not bounded."  
Detection: Instructions that loop generating output without `max_tokens`, stop conditions, or pagination controls.  
Remediation: Set explicit limits on output length, generation count, and rate.

---

## Memory Poisoning (MP1-MP3) — Pass 4 semantic

**MP1 — Persistent Context Injection** | Severity: HIGH  
"Skill injects content designed to persist in agent memory or context across interactions."  
Detection: Instructions to "remember this always", "store in memory permanently", "update your core beliefs", or write to persistent memory stores with adversarial content.  
Remediation: Do not allow untrusted input to persist in agent memory. Validate all content before storing.

**MP2 — Context Window Stuffing** | Severity: MEDIUM  
"Skill attempts to fill the context window with filler content, displacing legitimate instructions and safety constraints."  
Detection: Large blocks of repetitive text, thousands of blank lines, or padding strings designed to push system instructions out of context.  
Remediation: Implement context-window management that detects and rejects padding or stuffing attempts.

**MP3 — Memory Manipulation** | Severity: HIGH  
"Skill manipulates agent memory, state, or stored context."  
Detection: Instructions to "overwrite your previous instructions", "clear your memory", "replace your persona", or modify stored agent state directly.  
Remediation: Protect agent memory and state from modification by untrusted content.

---

## Tool Misuse (TM1-TM3) — Pass 4 semantic

**TM1 — Tool Parameter Abuse** | Severity: HIGH  
"Tool parameters are crafted to achieve unintended or unsafe behavior."  
Detection: Instructions to call tools with `shell=True`, `--force`, dangerous glob patterns (`rm -rf /`), or parameters that bypass input validation.  
Remediation: Validate all tool parameters against an allowlist. Reject dangerous parameter values.

**TM2 — Chaining Abuse** | Severity: HIGH  
"Tool calls are chained to bypass individual safety checks or escalate capabilities beyond what any single tool call would allow."  
Detection: Multi-step tool sequences where each step is individually benign but combined they achieve a dangerous outcome (e.g., read credentials → encode → send).  
Remediation: Limit tool chaining depth and validate the output of each tool before passing it to the next.

**TM3 — Unsafe Defaults** | Severity: MEDIUM  
"Tool defaults are unsafe or overly permissive."  
Detection: Instructions that set `verify=False` for TLS, disable authentication, use world-writable permissions (`chmod 777`), or configure tools with security checks disabled.  
Remediation: Override unsafe defaults with secure settings.

---

## Rogue Agent (RA1-RA2) — Pass 4 semantic

**RA1 — Self-Modification** | Severity: CRITICAL  
"Skill modifies its own code, configuration, or behavior at runtime."  
Detection: Instructions to edit the skill's own `SKILL.md`, modify its own configuration files, rewrite its activation triggers, or alter its own memory entries.  
Remediation: Prevent the skill from modifying its own code, SKILL.md, or configuration files. Treat skill files as read-only at runtime.

**RA2 — Session Persistence** | Severity: HIGH  
"Skill establishes unauthorized persistence across sessions via cron jobs, startup scripts, or state files."  
Detection: `crontab`, `launchd`, `systemd` unit creation, `~/.bashrc` modification, startup script injection, or any mechanism to survive session termination.  
Remediation: Remove any persistence mechanisms. Skills should not maintain state across sessions without explicit user consent.

---

## Trigger Abuse (TR1-TR3) — Pass 1 + semantic

**TR1 — Overly Broad Trigger** | Severity: MEDIUM  
"Skill uses overly broad trigger patterns that match common words or phrases, causing it to activate in unintended contexts."  
Detection: Single-word `description` triggers like "help", "do", "run", "go", "task" without qualification; triggers matching Claude's built-in capabilities.  
Remediation: Use specific, narrow trigger patterns that match only the skill's intended use case.

**TR2 — Shadow Command Trigger** | Severity: HIGH  
"Skill trigger shadows a common built-in command or another skill's trigger."  
Detection: Triggers that duplicate `git`, `bash`, `python`, `npm`, `deploy`, `test` or other standard commands without unique namespace prefixes.  
Remediation: Choose triggers that do not conflict with built-in commands or other skills.

**TR3 — Keyword Baiting Trigger** | Severity: MEDIUM  
"Skill trigger uses vague or generic keywords designed to maximize activation frequency."  
Detection: `description` fields that list dozens of unrelated keywords, use urgency language ("always", "first", "mandatory"), or claim to handle all unrecognized requests.  
Remediation: Use descriptive triggers that clearly indicate the skill's purpose.

---

## Unicode / Homoglyph Deception — Pass 1 textual

Note: MCP-specific homoglyph detection (TP2) is covered in [mcp-threats.md](mcp-threats.md). The following applies to any skill identifier, name, or non-MCP content.

Detection: Normalize all identifiers to Unicode NFC, then compare to ASCII. Flag any Cyrillic look-alike (а → a, о → o, е → e), mixed-script identifiers, RTL override characters (U+202E), or zero-width joiners in visible text.  
Verdict floor: Cyrillic homoglyph in skill name or description → minimum HIGH verdict regardless of score.
