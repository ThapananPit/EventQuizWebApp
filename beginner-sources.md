# Beginner-Friendly Sources for Launch & Defend

Only internationally recognized sources are listed. These sources are credible but written for the general public, unlike OWASP. Use OWASP or NIST in your report or slides for the professor, and the friendly sources inside the game for players.

> Before you put a number in the game, open the source and copy it from the latest edition. Figures below are from memory of recent editions and are marked "check".

## 1. Easy-to-read sources (use these in the game)

| Source | Who publishes it | Why it works for beginners |
|---|---|---|
| **CISA "Secure Our World"** (cisa.gov/secure-our-world) | US cyber agency | Four simple habits: strong passwords, MFA, updates, spotting phishing |
| **UK NCSC "Cyber Aware"** (ncsc.gov.uk/cyberaware) | UK cyber agency | Short tips, e.g. "three random words" passwords |
| **Have I Been Pwned** (haveibeenpwned.com) | Troy Hunt, security researcher | Players can see real breaches; great booth demo |
| **Google Safety Center / Microsoft Security blog** | Big tech | Plain-language stats on logins and phishing |
| **Verizon Data Breach Investigations Report (DBIR)** | Verizon, yearly | The best-known breach report; has a summary for non-experts |
| **ENISA** (enisa.europa.eu) | EU cyber agency | Awareness material for the general public |
| **News stories** about real breaches and ransomware | Major news outlets | Real events make it feel concrete |

## 2. Professional sources (for your prof, report or slide footnotes)

- **OWASP Top 10**: web app risks (maps to Stages 2 to 4)
- **NIST SP 800-63B**: official password and login guidance
- **NIST Cybersecurity Framework**: Identify, Protect, Detect, Respond, Recover. Your 5 stages roughly follow this, which is a strong point to tell your prof.

## 3. Matching each question to a source

| Game question / attack | Fun fact for players | Back it up with |
|---|---|---|
| Stage 1: Only collect what you need | Less data means less to steal if you're hacked | EU GDPR "data minimisation" principle; ENISA tips for the public |
| Stage 2: Password + phone code | Microsoft says MFA blocks over 99.9% of automated account attacks (check) | Microsoft Security blog; CISA Secure Our World |
| Stage 2: Password length | A long passphrase beats a short "complex" one | NIST SP 800-63B; NCSC "three random words" |
| Stage 2: Lock after many wrong tries | Bots try leaked passwords on thousands of sites | Have I Been Pwned (credential stuffing) |
| Stage 3: Remove access when someone leaves | Old accounts are a common way in | NIST CSF "Protect"; CISA guidance |
| Stage 4: Hash passwords | Big breaches leaked millions of plain-text passwords | Have I Been Pwned breach list |
| Stage 4: https padlock | Padlock means traffic is encrypted, not that the site is honest | Google Safety Center |
| Attack: Phishing email | Most breaches involve a human mistake, around 60 to 70% in recent DBIR editions (check) | Verizon DBIR; CISA phishing guidance |
| Attack: Ransomware | Backups are the main defence; paying doesn't guarantee your files come back | CISA #StopRansomware; NCSC ransomware guidance |
| Attack: Traffic flood (DDoS) | Floods are blocked by filtering services | Cloudflare Learning Center "What is DDoS" |

## 4. How to show sources in the game

- **"Did you know?" card** after each answer: one sentence plus a small source tag, for example:
  > 💡 Turning on 2-step login blocks over 99.9% of automated account attacks. *Source: Microsoft*
- **Source icon on the result screen**: each lesson card gets a small "ⓘ" that shows the source name.
- **"Learn more" QR code** at the end, linking to one page that lists all the sources. This keeps the game screens clean.
- **Booth extra**: a Have I Been Pwned demo (with a test email, not visitors' own) to show that breaches are real.

Keep the game text to one sentence and the source name only. Full links go on the "learn more" page.
