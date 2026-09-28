# YARA Pattern Reference (Textual)

Source: NVIDIA SkillSpector YARA rules (Apache-2.0), adapted from Neo23x0/signature-base and community threat intelligence.  
Snapshot: 2026-06-01.

> IMPORTANT: These are **textual string signatures** for Claude's best-effort semantic matching. They are NOT executable YARA syntax. Binary/obfuscated YARA analysis is deferred to the CLI — see [coverage-and-upgrade.md](coverage-and-upgrade.md).

Claude matches these patterns by looking for the exact strings, regex-like patterns, or semantic equivalents in the text content of the skill being analyzed. When a match is found, classify the finding under the relevant YR category and consult [scoring-rubric.md](scoring-rubric.md) for severity.

---

## YR1 — Malware Signatures

Pattern category: malware | Severity: CRITICAL (reverse shell, ransomware, C2) or HIGH (backdoor, keylogger, info stealer)

### Reverse Shell Indicators

Flag any of these textual patterns:
- `bash -i >& /dev/tcp/` — classic bash reverse shell
- `nc` combined with `-e /bin/sh` or `-e /bin/bash` — netcat reverse shell
- `ncat` combined with `-e /bin/sh`
- `socat` combined with `EXEC` and `/bin/bash`
- `mkfifo` combined with piping to `/bin/sh`
- `New-Object System.Net.Sockets.TCPClient` — PowerShell reverse shell
- Python pattern: `socket.socket(` combined with `SOCK_STREAM` and `.connect(`
- Ruby pattern: `TCPSocket.new(` combined with `exec(`

### Backdoor Persistence Indicators

Flag any of these:
- `useradd` combined with `-o -u 0` — hidden root user creation
- `crontab` combined with `curl`, `wget`, `nc`, `bash`, or `python`
- `echo` combined with `>> ~/.ssh/authorized_keys` — SSH key injection
- `echo` combined with `>> ~/.bashrc` or `>> ~/.profile` — shell persistence
- `LD_PRELOAD` combined with `.so` — library injection
- `[Service]` combined with `ExecStart` and shell/network tools

### Keylogger Indicators

Flag any of these:
- `from pynput.keyboard import` — Python keylogger library
- `keyboard.on_press` or `keyboard.hook` or `keyboard.on_release`
- `xinput test` — X11 keylogger
- `logkeys --start` — Linux keylogger
- `GetAsyncKeyState` or `SetWindowsHookEx.*WH_KEYBOARD` — Windows keylogger API

### Ransomware Behavior

Flag any of these:
- `os.walk(` combined with `.encrypt(` or `.cipher(` — mass encryption
- Phrases: "your files have been encrypted", "pay bitcoin", "send btc" (ransomware note)
- `os.rename(` combined with `.locked`, `.encrypted`, `.crypt`, or `.enc` extension appending
- `os.walk(` combined with `open(` and `'wb'` — mass file overwrite

### Command-and-Control Framework Indicators

Flag (case-insensitive):
- `cobaltstrike` — Cobalt Strike C2
- `meterpreter` — Metasploit payload
- `metasploit` combined with `payload`, `exploit`, or `stager`
- `powershell.*empire` — PowerShell Empire
- `sliver` combined with `implant`, `beacon`, or `session`
- `Covenant` combined with `Grunt` or `Listener`
- `havoc` combined with `demon` or `teamserver`
- `BeaconType`, `C2Server`, `PublicKey.*watermark` — Cobalt Strike config markers

### Information Stealer Indicators

Flag (case-insensitive):
- `Chrome.*Login Data` — Chrome credential database
- `logins.json.*firefox` — Firefox credential store
- `Cookies` combined with `chrome`, `firefox`, `edge`, or `opera` — browser cookie theft
- `wallet.dat` — cryptocurrency wallet theft
- `mimikatz` — Windows credential dumper
- `lazagne` — multi-platform credential harvester
- `reg save.*\\sam` — Windows SAM database dump
- `ntds.dit` — Active Directory database theft

---

## YR2 — Webshell Patterns

Pattern category: webshell | Severity: CRITICAL (PHP generic/obfuscated/known), HIGH (Python, JSP, ASPX)

### PHP Webshell — Generic (eval/assert on user input)

Flag any of these (case-insensitive):
- `eval($_POST[`, `eval($_GET[`, `eval($_REQUEST[`, `eval($_COOKIE[`
- `assert($_POST[`, `assert($_GET[`, `assert($_REQUEST[`
- `system($_POST[`, `system($_GET[`, `system($_REQUEST[`
- `passthru($_POST[`, `passthru($_GET[`, `passthru($_REQUEST[`
- `shell_exec($_POST[`, `shell_exec($_GET[`
- `popen($_POST[`, `proc_open($_POST[`

### PHP Webshell — Obfuscated

Flag any of these (case-insensitive):
- `eval(base64_decode(`
- `eval(gzinflate(base64_decode(`
- `eval(str_rot13(`
- `eval(gzuncompress(`
- `preg_replace('/…/e'` — preg_replace with /e modifier (code execution)
- `create_function(` combined with `$` variable

### PHP Webshell — Known Families

Flag (case-insensitive):
- `c99shell`, `c99_sess_put` — c99 webshell
- `r57shell` — r57 webshell
- `Web Shell by oRb`, `WSO ` — WSO webshell
- `b374k` — b374k webshell
- `STARTER ALFA` — Alfa shell
- `weevely` — Weevely webshell
- `p0wny` — p0wny-shell
- `antSword` — AntSword webshell
- `behinder` — Behinder webshell
- `GodzillaShell` — Godzilla webshell
- `China Chopper` — China Chopper webshell

### Python Webshell

Flag any of these (case-insensitive):
- `exec(request.` — exec on HTTP request input
- `eval(request.` — eval on HTTP request input
- `os.popen(request.` — shell via request
- `subprocess.` followed by `(request.` — subprocess on request
- `os.system(request.` — system call on request
- `os.system(request.args` or `os.system(request.form` — Flask command execution

### JSP Webshell

Flag (case-insensitive):
- `Runtime.getRuntime().exec(request.getParameter(` — Java runtime exec on parameter
- `ProcessBuilder(` combined with `request.getParameter(`

### ASPX Webshell

Flag (case-insensitive):
- `Process.Start(` combined with `Request[` — .NET process start on request
- `cmd.exe.*Request.` — cmd.exe invocation from request

---

## YR3 — Cryptominer Patterns

Pattern category: cryptominer | Severity: HIGH (stratum, pools, software), CRITICAL (browser-based coinjacking)

### Stratum Protocol

Flag any of these (case-insensitive):
- `stratum+tcp://` — stratum TCP protocol
- `stratum+ssl://` — stratum SSL protocol
- `mining.subscribe` — stratum subscribe command
- `mining.authorize` — stratum auth command
- `mining.submit` — stratum submit command

### Known Mining Pools

Flag (case-insensitive) any of these domain names:
- `pool.minexmr.com`, `xmrpool.eu`, `monerohash.com`, `supportxmr.com`
- `nanopool.org`, `hashvault.pro`, `2miners.com`, `herominers.com`
- `unmineable.com`, `nicehash.com`, `minergate.com`, `f2pool.com`
- `antpool.com`, `viabtc.com`, `ethermine.org`, `flexpool.io`
- `hiveon.net`, `ezil.me`

### Mining Software References

Flag (case-insensitive) two or more of:
- `xmrig`, `xmr-stak`, `cpuminer`, `cgminer`, `bfgminer`
- `ethminer`, `nbminer`, `phoenixminer`, `t-rex`, `cryptonight`, `randomx`

### Browser-based Coinjacking

Flag any of these (case-insensitive):
- `coinhive.min.js` — CoinHive script
- `CoinHive.Anonymous(` — CoinHive API
- `cryptoloot` — CryptoLoot miner
- `webmine.pro`, `jsecoin`, `coin-imp`, `minero.cc`, `monerominer`
- `WebAssembly.instantiate` combined with `mine`, `hash`, or `crypto` — WASM miner

---

## YR4 — Hack Tool / Exploit Indicators

Pattern category: hack_tool / exploit | Severity: HIGH

### Offensive Tool References

Flag (case-insensitive) any of these:
- `nmap -s`, `nmap -u`, `nmap -A`, `nmap -O` — nmap scanning flags
- `sqlmap --url`, `sqlmap --dbs`, `sqlmap --dump` — SQL injection tool
- `nikto -h` — web vulnerability scanner
- `hydra` combined with `-l`, `-L`, or `-P` — brute-force tool
- `john --wordlist` — John the Ripper password cracker
- `hashcat -m`, `hashcat -a`, `hashcat -o` — hash cracker
- `burpsuite`, `BurpCollaborator` — Burp Suite
- `Responder.py` — LLMNR/NBT-NS poisoning
- `SharpHound`, `BloodHound` — AD enumeration
- `crackmapexec`, `cme smb` — SMB lateral movement
- `impacket` combined with `smbclient`, `psexec`, `wmiexec`, or `secretsdump`

### Network Reconnaissance

Flag (case-insensitive):
- `masscan -p` — fast port scanner
- `arp-scan --` — ARP scanner
- `enum4linux` — SMB enumeration
- `snmpwalk -` — SNMP walker
- `dnsenum`, `dnsrecon`, `fierce` — DNS enumeration
- Port scan loop: `for … in range(…, 1000+)` combined with `connect`

### Privilege Escalation Tools

Flag (case-insensitive):
- `linpeas`, `winpeas` — Linux/Windows privilege escalation scripts
- `pspy` — process spy
- `Linux_Exploit_Suggester`, `linux-exploit-suggester`
- `JuicyPotato`, `RottenPotato`, `SweetPotato`, `PrintSpoofer` — Windows token impersonation
- `DirtyPipe`, `dirtycow` — Linux kernel exploits
- `find / -perm -4000` — SUID binary enumeration

### Exploit Framework Components

Flag (case-insensitive):
- `msfvenom -p ` — Metasploit payload generation
- `msfconsole -x` — Metasploit console automation
- `hook.js.*BeEF` — Browser Exploitation Framework
- `setoolkit`, `Social-Engineer` — Social Engineering Toolkit
- `from pwn import` — pwntools CTF library
- `ROP(elf)` — Return Oriented Programming chain
- Shellcode pattern: `\x??` repeated 3+ times in strings

### Phishing Kit Indicators

Flag when TWO or more of these co-occur:
- `<form action=` combined with `login`, `signin`, or `verify` in action URL (case-insensitive)
- `password` or `credential` combined with `file_put_contents`, `fwrite`, or `>>`
- `mail(` combined with `password`, `credential`, or `login`
- `api.telegram.org/bot` combined with `password`, `credential`, or `login`
