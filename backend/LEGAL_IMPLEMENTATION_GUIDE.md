# Legal Implementation Guide for Zuna

**Document Purpose:** Comprehensive guide for implementing Privacy Policy and Terms of Service
**Last Updated:** November 24, 2025
**Status:** Implementation Roadmap

---

## Table of Contents

1. [Critical Legal Obligations](#1-critical-legal-obligations)
2. [Document Structure Analysis](#2-document-structure-analysis)
3. [Key Legal Clauses - Must Include](#3-key-legal-clauses---must-include)
4. [Sensitive Areas - Specific Language](#4-sensitive-areas---specific-language)
5. [Best Practices from Similar Apps](#5-best-practices-from-similar-apps)
6. [Common Pitfalls to Avoid](#6-common-pitfalls-to-avoid)
7. [Implementation Checklist](#7-implementation-checklist)
8. [Technical Implementation](#8-technical-implementation)
9. [Compliance Monitoring](#9-compliance-monitoring)
10. [Action Items](#10-action-items)

---

## 1. Critical Legal Obligations

### 1.1 GDPR Compliance (EU Users)

**Requirements:**
- ✅ Lawful basis for processing (consent, legitimate interest, contract)
- ✅ Data minimization - collect only what's necessary
- ✅ Purpose limitation - use data only for stated purposes
- ✅ Transparent processing - clear, plain language
- ✅ Data subject rights (access, deletion, portability, rectification)
- ✅ Data Protection Impact Assessment (DPIA) for high-risk processing
- ✅ Privacy by design and by default
- ✅ Data breach notification (72 hours to authority, without delay to users)

**Child-Specific (GDPR-K):**
- ✅ Enhanced protection for children's data
- ✅ Parental consent for children under 16 (age varies by member state)
- ✅ Age-appropriate language and notices
- ✅ Private-by-default settings (as of 2025 DSA requirements)

**Implementation Status:**
- Privacy Policy: ✅ Complete
- DPIA: ⚠️ Required - to be completed
- Consent mechanisms: ⚠️ To be implemented in UI
- Data breach procedures: ⚠️ To be documented

### 1.2 KVKK Compliance (Turkey)

**Requirements:**
- ✅ Processing principles (lawfulness, fairness, accuracy, purpose limitation, data minimization, retention limits)
- ✅ Explicit consent for processing
- ✅ Information obligation (disclosure to data subjects)
- ✅ Data security measures (technical and administrative)
- ✅ Data subject rights (access, correction, deletion, objection)
- ✅ VERBİS registration (if thresholds met: >50 employees OR processing sensitive data)
- ✅ Data breach notification (72 hours to KVKK Authority)
- ✅ Data inventory maintenance
- ✅ Cross-border transfer safeguards

**Implementation Status:**
- Privacy Policy: ✅ Complete with KVKK provisions
- VERBİS registration: ⚠️ To be determined based on user volume (register if >50 employees or processing sensitive data)
- Explicit consent UI: ⚠️ To be implemented
- Data inventory: ⚠️ To be created and maintained
- Breach procedures: ⚠️ To be documented

### 1.3 COPPA Considerations (US - Child-Related Data)

**Key Points:**
- ✅ Zuna is NOT directed at children under 13
- ✅ Age gate: Users must be 18+ (exceeds COPPA requirement)
- ✅ Parental intermediary model: Parents upload child data, not children
- ✅ If we gain "actual knowledge" of <13 users, must obtain verifiable parental consent
- ✅ No direct collection from children

**Implementation Status:**
- Age gating: ⚠️ To be implemented in registration flow
- Terms clearly state 18+ requirement: ✅ Complete
- Privacy Policy disclaims child users: ✅ Complete

### 1.4 AI-Specific Compliance

**EU AI Act (Applicable if targeting EU users):**
- ⚠️ Classification: Likely "Limited Risk" system (requires transparency obligations)
- ✅ Transparency: Users must be informed they're interacting with AI
- ✅ AI disclaimers: Clear statement that content is AI-generated
- ✅ No high-risk classification (we're not making medical decisions)
- ⚠️ Documentation: Maintain technical documentation of AI system

**OpenAI Usage Policies:**
- ✅ No use to harm, exploit, or sexualize children (we comply - analysis only)
- ✅ Must be 13+ for OpenAI services (we require 18+)
- ✅ Cannot use for medical advice/diagnosis (we have strong disclaimers)

**Implementation Status:**
- AI disclaimers in ToS: ✅ Complete
- AI transparency in app UI: ⚠️ To be implemented
- Technical documentation: ⚠️ To be created

---

## 2. Document Structure Analysis

### 2.1 Privacy Policy Structure (15 Sections)

**Structure Overview:**
```
1. Introduction (who we are, what we do, 18+ requirement)
2. Information We Collect (user data, drawings, generated content, analytics)
3. How We Use Your Information (services, improvement, legal)
4. Legal Basis for Processing (GDPR/KVKK compliance)
5. Data Sharing and Third-Party Services (OpenAI, Supabase)
6. Children's Privacy (COPPA, GDPR-K, KVKK - detailed protections)
7. Data Security (technical, administrative, storage)
8. Data Retention (specific timeframes for each data type)
9. Your Rights and Choices (GDPR/KVKK rights, how to exercise)
10. International Data Transfers (SCCs, adequacy, KVKK Article 9)
11. Cookies and Tracking (types, third-party, opt-outs)
12. Changes to Privacy Policy (notification process)
13. Contact Us (data controller info, DPO, response times)
14. Additional Information (CCPA, VERBİS, automated decisions, breaches)
15. Compliance Summary (checkmarks for all regulations)
```

**Why This Structure:**
- Comprehensive coverage of all major regulations
- Layered approach: summary upfront, details in sections
- Specific sections for sensitive topics (children, AI, third parties)
- Clear action items for users (how to exercise rights)
- Multi-jurisdictional compliance (EU, Turkey, US, California)

### 2.2 Terms of Service Structure (16 Sections)

**Structure Overview:**
```
1. Agreement to Terms (binding nature, age requirement, changes)
2. Description of Service (what we offer, technology, availability)
3. Critical Disclaimers (NOT medical/diagnostic, AI limitations, parental responsibility) ⭐
4. Account Registration and Security (creation, restrictions, termination)
5. Acceptable Use Policy (permitted/prohibited uses, moderation, reporting)
6. Intellectual Property Rights (our IP, your content, AI-generated content, DMCA)
7. Third-Party Services (OpenAI, Supabase, links, no warranties)
8. Payment Terms (future paid features - placeholder)
9. Limitation of Liability (disclaimers, cap on damages, indemnification) ⭐
10. Dispute Resolution (governing law, arbitration, time limits)
11. Service Modifications and Termination (changes, shutdown procedures)
12. Privacy and Data Protection (link to Privacy Policy, consent)
13. Miscellaneous (entire agreement, severability, assignment, force majeure)
14. Special Provisions for Specific Jurisdictions (EU, Turkey, California, UK)
15. Acknowledgment and Acceptance (user acknowledgments, parental responsibility)
16. Questions and Contact (support, legal, abuse reporting)
```

**Why This Structure:**
- Strong disclaimers upfront (Section 3 - most critical)
- Protects company from liability (Sections 3, 9)
- Clear user obligations (Sections 4, 5)
- Intellectual property protection (Section 6)
- Jurisdiction-specific provisions (Section 14)
- Multi-layered acceptance and acknowledgment (Section 15)

---

## 3. Key Legal Clauses - Must Include

### 3.1 Privacy Policy - Essential Clauses

#### A. Information Collection Clause
**Why Critical:** Transparency obligation under GDPR/KVKK
**What to Include:**
- Complete list of data collected (explicit enumeration)
- Sources of data (directly from user, automatically, third parties)
- Categories of data (personal, sensitive, child-related)
- Voluntary vs. required data

**Example from our Privacy Policy:**
```markdown
### 2.1 Information You Provide Directly
- Email address (required)
- Name (optional)
- Child's age (1-18 years) for age-appropriate analysis
```

**Legal Compliance:**
- GDPR Article 13/14 (information to be provided)
- KVKK Article 10 (information obligation)

#### B. Legal Basis for Processing
**Why Critical:** GDPR requires explicit legal basis; KVKK requires lawful processing
**What to Include:**
- Consent (explicit, informed, freely given)
- Contract performance (to provide the service)
- Legitimate interests (balanced against user rights)
- Legal obligations (compliance)

**Example from our Privacy Policy:**
```markdown
## 4. Legal Basis for Processing (GDPR/KVKK)
- Consent: You have given explicit consent for processing
- Contract Performance: Processing is necessary to provide the Service
- Legitimate Interests: Service improvement, security, analytics
- Legal Obligations: Compliance with laws
```

#### C. Data Subject Rights
**Why Critical:** GDPR Articles 15-22, KVKK Article 11 mandate these rights
**What to Include:**
- Right to access (get copy of data)
- Right to rectification (correct inaccurate data)
- Right to erasure (delete data)
- Right to restriction (limit processing)
- Right to data portability (receive in machine-readable format)
- Right to object (opt out)
- Right to withdraw consent
- Right to lodge complaint (with data protection authority)
- HOW to exercise rights (clear instructions, contact info, timeframes)

**Example from our Privacy Policy:**
```markdown
### 9.1 Data Subject Rights (GDPR/KVKK)
You have the following rights... [detailed enumeration]

### 9.2 How to Exercise Your Rights
- In-app controls
- Email requests to privacy@zuna.app
- Response within 30 days
```

#### D. Third-Party Disclosures
**Why Critical:** GDPR Article 13(1)(e), user trust, transparency
**What to Include:**
- Name each third party (OpenAI, Supabase)
- Purpose of data sharing (AI processing, storage)
- Data shared with each party (specific data types)
- Third party's privacy policy link
- Third party's location (international transfers)
- Safeguards in place (SCCs, encryption)

**Example from our Privacy Policy:**
```markdown
### 5.1 Third-Party Service Providers

**OpenAI (AI Processing):**
- Purpose: AI-powered drawing analysis
- Data Shared: Drawing images, child's age, task descriptions
- Privacy Policy: [link]
- Location: United States
```

#### E. Data Retention
**Why Critical:** GDPR Article 5(1)(e), KVKK principle of retention limits
**What to Include:**
- Specific timeframes for each data type (not vague "as long as necessary")
- Retention justification
- Deletion process (automated or manual)
- Backup retention
- Exceptions (legal hold, anonymized data)

**Example from our Privacy Policy:**
```markdown
### 8.1 Retention Periods
**Account Data:** Retained while active; deleted within 90 days of deletion request
**Drawing Images:** Retained while active; deleted within 30 days of account deletion
**Analysis Results:** Deleted within 90 days of account deletion
```

#### F. Children's Privacy Section
**Why Critical:** COPPA, GDPR-K, heightened sensitivity
**What to Include:**
- Age restrictions (18+ for account holders)
- How child data is collected (through parents only)
- Parental consent mechanisms
- Enhanced protections for child data
- Data minimization for children
- NOT directed at children statement
- What to do if child data improperly collected

**Example from our Privacy Policy:**
```markdown
## 6. Children's Privacy
### 6.1 COPPA Compliance
Zuna is NOT directed to children under 13. [detailed provisions]

### 6.2 GDPR-K Compliance
Enhanced protections for EU children... [specific measures]
```

#### G. Data Breach Notification
**Why Critical:** GDPR Article 33/34, KVKK Article 12/A
**What to Include:**
- Commitment to notify (72 hours to authority, without undue delay to users)
- What notification includes (nature, consequences, measures)
- When users will be notified (severe breaches)

**Example from our Privacy Policy:**
```markdown
### 14.4 Data Breach Notification
- Notify affected users within 72 hours
- Report to data protection authorities
- Include nature of breach, consequences, mitigation
```

#### H. International Data Transfers
**Why Critical:** GDPR Chapter V, KVKK Article 9
**What to Include:**
- Where data is transferred (specific countries)
- Safeguards for transfers (SCCs, adequacy decisions)
- User consent for transfers (if required)

**Example from our Privacy Policy:**
```markdown
## 10. International Data Transfers
### 10.1 Data Location
Primary Storage: European Union
Third-Party Processing: OpenAI (United States)

### 10.2 Transfer Safeguards
- Standard Contractual Clauses (SCCs)
- Your explicit consent
```

### 3.2 Terms of Service - Essential Clauses

#### A. Disclaimers (MOST CRITICAL)
**Why Critical:** Limit liability, manage expectations, avoid misleading users
**What to Include:**
- NOT medical/diagnostic tool (prominent, repeated)
- NOT substitute for professional advice
- AI limitations (inaccuracies, incompleteness)
- No warranties (express or implied)
- When to seek professional help (emergencies, concerns)

**Example from our ToS:**
```markdown
## 3. Critical Disclaimers
### 3.1 NOT A DIAGNOSTIC OR MEDICAL TOOL
**READ CAREFULLY - IMPORTANT LEGAL NOTICE**

Zuna is an educational and informational tool ONLY. Our Service is NOT:
❌ A substitute for professional psychological evaluation
❌ Medical advice, diagnosis, or treatment
❌ A diagnostic tool for mental health conditions
[...detailed disclaimers with visual formatting]
```

**Best Practices:**
- Use attention-grabbing formatting (❌, ✓, bold, ALL CAPS for emphasis)
- Place early in Terms (Section 3, immediately after service description)
- Repeat in multiple sections
- Require explicit acknowledgment during signup (checkbox)
- Display in app UI when showing analysis results

#### B. Limitation of Liability
**Why Critical:** Cap financial exposure, protect business viability
**What to Include:**
- Disclaimer of warranties ("AS IS" service)
- Types of damages excluded (indirect, consequential, punitive)
- Cap on total liability (amount paid or fixed amount like $100)
- Exceptions (death, personal injury, fraud - cannot be disclaimed)
- Jurisdiction-specific adjustments (some jurisdictions don't allow full disclaimers)

**Example from our ToS:**
```markdown
### 9.1 DISCLAIMER OF WARRANTIES
THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE"...

### 9.2 LIMITATION OF LIABILITY
TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF:
(a) Amount paid in last 12 months, OR
(b) USD $100

### 9.3 Indemnification
You agree to indemnify, defend, and hold harmless Zuna...
```

**Legal Note:** Some jurisdictions (EU consumer law) restrict disclaimer enforceability. Include "to the maximum extent permitted by law" language.

#### C. Acceptable Use Policy
**Why Critical:** Prevent abuse, protect platform, comply with third-party ToS (OpenAI)
**What to Include:**
- Prohibited content (illegal, harmful, abusive)
- Prohibited activities (hacking, scraping, reverse engineering)
- Consequences of violations (account termination)
- Reporting mechanism

**Example from our ToS:**
```markdown
### 5.2 Prohibited Uses
❌ Upload content depicting violence, abuse, or exploitation of children
❌ Reverse engineer or decompile the Service
❌ Introduce malware or malicious code
[...comprehensive list with reasoning]
```

#### D. Intellectual Property Rights
**Why Critical:** Protect company IP, clarify user content ownership, define license terms
**What to Include:**
- Company's ownership (software, trademarks, algorithms)
- User's content ownership (drawings uploaded)
- License user grants to company (to operate service)
- License scope limitations (not for public sharing/resale)
- AI-generated content ownership (ambiguous in some jurisdictions)
- DMCA compliance (takedown procedures)

**Example from our ToS:**
```markdown
### 6.2 Your Content Ownership
You retain ownership of drawings uploaded.

### 6.3 License You Grant to Zuna
You grant us a worldwide, non-exclusive license to:
- Use, store, reproduce, modify your content
- Solely for: providing service, improving AI, legal compliance

Scope Limitations:
- NOT publicly shared without consent
- NOT used for marketing without permission
- NOT sold to third parties
```

**Legal Note:** Be specific about AI-generated content. In some jurisdictions, AI output may not be copyrightable. Grant users a license to use for personal purposes, but retain rights for commercial exploitation.

#### E. Dispute Resolution and Governing Law
**Why Critical:** Define legal framework, reduce litigation costs, provide clarity
**What to Include:**
- Governing law (Turkish law for Turkish company)
- Jurisdiction (which courts have authority)
- Dispute resolution process (informal negotiation first, then arbitration/courts)
- Consumer dispute resolution (mandatory for consumer services in some jurisdictions)
- Class action waiver (where permitted)
- Time limit for claims (statute of limitations)

**Example from our ToS:**
```markdown
### 10.1 Governing Law
Turkish law governs these Terms

### 10.2 Dispute Resolution Process
1. Informal resolution (60 days, good faith)
2. Mediation (optional)
3. Consumer Arbitration Committees (Turkey, for disputes <~107k TRY)
4. Consumer Courts (larger disputes)

### 10.6 Time Limitation
Claims must be brought within ONE (1) YEAR
```

**Jurisdiction-Specific:**
- **Turkey:** Consumer Arbitration Committees (Tüketici Hakem Heyeti) for small claims
- **EU:** Mandatory Alternative Dispute Resolution (ADR) for consumer contracts
- **US:** Arbitration clauses common, but class action waivers limited in some states

#### F. Termination Clauses
**Why Critical:** Define how accounts end, data deletion, refund obligations
**What to Include:**
- User's right to terminate (how, effects)
- Company's right to terminate (reasons, notice)
- Effects of termination (data deletion, loss of access)
- Survival provisions (which terms continue after termination)

**Example from our ToS:**
```markdown
### 4.3 Account Termination by User
Delete account anytime via Settings or email
Effects: Data deleted within 90 days, permanent, cannot be undone

### 4.4 Account Suspension by Zuna
Immediate termination if:
- Violate Terms
- Fraudulent activity
- Required by law

### 11.2 Service Termination by Zuna
90 days' notice if shutting down permanently
Opportunity to export data
```

---

## 4. Sensitive Areas - Specific Language

### 4.1 Child Data - Recommended Language

**Context:** Collecting information about children (even through parents) is highly sensitive and regulated.

**Key Principles:**
1. **Emphasize parental intermediary model** - parents are users, not children
2. **Data minimization** - collect only age, not name or other identifiers
3. **Enhanced security** - stronger measures for child data
4. **Parental control** - parents can delete anytime
5. **NOT directed at children** - avoid COPPA "directed to" classification

**Recommended Language:**

**In Privacy Policy:**
```markdown
## Children's Privacy

**IMPORTANT:** Zuna is designed for adults (18+) only. We do NOT collect
personal information directly from children under 13.

**How We Protect Children's Data:**
- Only parents/guardians (18+) can create accounts
- We collect children's information (age, drawings) ONLY through parents
- Parents maintain full control over their child's information
- Parents can delete their child's data at any time
- No direct identifiers of children required (no name, photo, etc.)

**If You're a Parent:**
You are solely responsible for:
- Deciding what drawings to upload
- Protecting your child's privacy and best interests
- Ensuring uploaded content is appropriate
- Seeking professional help if you have concerns about your child
```

**In Terms of Service:**
```markdown
### Age Requirements
You must be at least 18 years old to use this Service.

By creating an account, you represent and warrant that:
- You are 18 years of age or older
- You have parental responsibility or legal guardianship for any child
  whose information you provide
- Sharing this information is in the child's best interest

### Parental Responsibility
As a parent using this Service, you acknowledge:
✓ You exercise independent judgment about your child's well-being
✓ You protect your child's privacy and safety
✓ You will seek professional help for any serious concerns
✓ AI-generated insights are NOT a substitute for professional evaluation
```

**Why This Language:**
- Avoids classifying service as "directed to children" under COPPA
- Emphasizes parental agency and responsibility
- Provides legal protection (parents acknowledge risks)
- Complies with GDPR-K (enhanced protection for minors)
- Aligns with KVKK (explicit consent from data controller/parent)

### 4.2 AI Analysis Disclaimers - Recommended Language

**Context:** AI-generated psychological insights could be misinterpreted as professional advice, creating legal liability.

**Key Principles:**
1. **NOT medical/diagnostic** - repeated, prominent disclaimers
2. **AI limitations** - acknowledge potential inaccuracies
3. **Seek professional help** - when and where
4. **No guarantee of accuracy** - manage expectations
5. **For informational purposes only** - clear use case

**Recommended Language:**

**In Terms of Service (Section 3 - Critical Disclaimers):**
```markdown
## 3. CRITICAL DISCLAIMERS

### 3.1 NOT A DIAGNOSTIC OR MEDICAL TOOL

⚠️ **READ CAREFULLY - IMPORTANT LEGAL NOTICE** ⚠️

Zuna is an educational and informational tool ONLY. Our Service is NOT:

❌ A substitute for professional psychological evaluation, therapy, or counseling
❌ Medical advice, diagnosis, or treatment
❌ A diagnostic tool for mental health conditions
❌ Intended to diagnose, treat, or prevent any psychological disorder
❌ A replacement for consultation with licensed healthcare professionals

### 3.2 AI-Generated Content Limitations

The insights provided by Zuna are generated by artificial intelligence and
are subject to inherent limitations:

✓ NOT reviewed by licensed psychologists or mental health professionals
✓ MAY produce incorrect, incomplete, or misleading information
✓ Based on visual pattern recognition, NOT comprehensive assessment
✓ General guidance that may not apply to your specific child or situation
✓ Cannot account for full cultural, familial, or individual context

**WE MAKE NO REPRESENTATIONS about the accuracy, reliability, or
completeness of AI-generated content.**

### 3.3 When to Seek Professional Help

⚠️ **IMPORTANT:** You should consult licensed healthcare professionals if:
- You have concerns about your child's emotional or psychological well-being
- Your child exhibits concerning behaviors or symptoms
- You need diagnosis, treatment, or therapeutic intervention
- You have questions about your child's mental health

**EMERGENCIES:** If your child is in immediate danger or experiencing a
mental health crisis, do NOT rely on Zuna. Contact:
- Emergency services (112 in Turkey, 911 in US)
- Crisis hotlines
- Your child's healthcare provider

### 3.4 Parental Responsibility

YOU, as the parent or guardian, are responsible for:
✓ Exercising your own judgment about your child's well-being
✓ Interpreting and evaluating AI-generated insights critically
✓ Seeking professional help when appropriate
✓ Making parenting and care decisions independently
✓ Protecting your child's privacy and best interests
```

**In-App Display (on Analysis Results Screen):**
```markdown
ℹ️ **This analysis is AI-generated for informational purposes only.**

This is NOT professional psychological advice. If you have concerns about
your child's development or well-being, please consult a licensed professional.

[Learn More] [Dismiss]
```

**Why This Language:**
- Legally defensible (clear, repeated, prominent disclaimers)
- Manages user expectations (AI is imperfect)
- Provides actionable guidance (when/how to seek professional help)
- Uses visual formatting (symbols, bold, formatting) to draw attention
- Covers emergency situations (immediate danger protocols)
- Protects against malpractice claims (not providing professional services)

**Legal Rationale:**
- **Duty of Care:** By disclaiming professional advice, we avoid assuming a duty of care
- **Informed Consent:** Users acknowledge limitations before using service
- **Causation:** If user relies on AI and harm occurs, disclaimers break causation chain
- **Comparative Negligence:** User's failure to seek professional help may reduce our liability

### 4.3 Third-Party Services (OpenAI, Supabase) - Recommended Language

**Context:** We rely on third parties for core functionality. Need to disclose and disclaim liability for their actions.

**Key Principles:**
1. **Transparency** - name third parties, explain their role
2. **User awareness** - link to third-party policies
3. **Data sharing disclosure** - what data, why
4. **Disclaim liability** - not responsible for third-party issues
5. **International transfers** - OpenAI is in US

**Recommended Language:**

**In Privacy Policy:**
```markdown
### 5.1 Third-Party Service Providers

We use third-party services to operate Zuna. When you use our Service,
your data may be shared with these providers:

**OpenAI (AI Processing):**
- **Purpose:** AI-powered drawing analysis and story generation using GPT-4 models
- **Data Shared:** Drawing images (base64 encoded), child's age, task descriptions, language preference
- **Privacy Policy:** https://openai.com/policies/row-privacy-policy/
- **Data Retention:** OpenAI does not retain data sent via API for training (as of [date])
- **Location:** United States (International data transfer)
- **Safeguards:** Standard Contractual Clauses, encryption in transit

**Supabase (Database & Storage):**
- **Purpose:** Secure data storage, user authentication, file storage
- **Data Shared:** User account info, drawing images, analysis results
- **Privacy Policy:** https://supabase.com/privacy
- **Security:** Industry-standard encryption, SOC 2 Type II certified
- **Location:** European Union (configurable, our instance in EU)

### 5.2 No Selling of Personal Data
We do NOT sell, rent, or trade your personal information or your child's
information to third parties for marketing purposes.

### 5.3 Why We Share Data
We share data with third parties ONLY to:
- Provide the Service you requested (AI analysis, secure storage)
- Improve Service quality and performance
- Comply with legal obligations

You consent to this data sharing by using our Service.
```

**In Terms of Service:**
```markdown
### 7.1 Third-Party AI Providers

Our Service relies on OpenAI for AI-powered analysis:
- Subject to OpenAI's Terms: https://openai.com/policies/row-terms-of-use/
- Subject to OpenAI's Usage Policies: https://openai.com/policies/usage-policies/

You acknowledge that:
- OpenAI's services are beyond our control
- We are NOT responsible for OpenAI's availability, performance, or output quality
- OpenAI has restrictions on use (e.g., no use to harm children)
- Your content is processed by OpenAI's systems in the United States

### 7.4 No Warranties for Third Parties

WE MAKE NO WARRANTIES regarding third-party services and DISCLAIM ALL
LIABILITY for:
- Third-party service outages or unavailability
- Data loss or corruption by third parties
- Terms violations by third-party providers
- Changes to third-party services
```

**Why This Language:**
- **Transparency:** Users know exactly who has access to their data
- **Informed Consent:** Users can read third-party policies before agreeing
- **Liability Shield:** We disclaim responsibility for third-party issues
- **GDPR Compliance:** Article 13(1)(e) requires disclosure of recipients
- **KVKK Compliance:** Article 10 requires disclosure of data sharing
- **International Transfer Disclosure:** Users aware of US data processing (OpenAI)

### 4.4 Data Retention - Recommended Language

**Context:** Users want to know how long data is kept. Regulations require retention limits.

**Key Principles:**
1. **Specific timeframes** - not vague "as long as necessary"
2. **Different retention for different data types**
3. **User control** - ability to delete anytime
4. **Legal retention** - exceptions for legal obligations
5. **Backup policies** - when backups are deleted

**Recommended Language:**

**In Privacy Policy:**
```markdown
## 8. Data Retention

We retain your data only as long as necessary for the purposes outlined in
this Privacy Policy, or as required by law.

### 8.1 Retention Periods

**Account Data (email, name, child age):**
- Retained while your account is active
- Deleted within 90 days of account deletion request
- Justification: Necessary for account management and service provision

**Drawing Images:**
- Retained while your account is active
- You can delete individual drawings at any time (immediate deletion)
- All drawings deleted within 30 days of account deletion
- Justification: Core functionality (analysis history, re-analysis)

**Analysis Results (AI-generated insights):**
- Retained for development tracking purposes while account is active
- Deleted within 90 days of account deletion
- You can delete individual analyses at any time
- Justification: Historical tracking, personalized recommendations

**Generated Stories:**
- Retained for 90 days after generation (or until account deletion, whichever is sooner)
- Can be deleted individually by users at any time
- Justification: Allow users to re-access stories

**Usage Analytics (anonymized):**
- Retained for 24 months
- Cannot be linked to individuals after anonymization
- Justification: Service improvement, trend analysis

**Backups:**
- Backups retained for 30 days, then permanently deleted
- Deleted data removed from backups after 30-day cycle completes
- Justification: Disaster recovery, data integrity

### 8.2 Legal Retention
We may retain certain information longer if required by:
- Legal obligations (e.g., tax records, dispute resolution)
- Ongoing litigation or investigations
- Fraud prevention and security (suspicious account data)

Such retained data will be minimized and secured.

### 8.3 Anonymized Data
We may retain anonymized, aggregated data indefinitely for:
- Research and analytics
- Service improvement
- Industry benchmarking

This data CANNOT be used to identify individuals.
```

**Why This Language:**
- **GDPR Article 5(1)(e):** Storage limitation principle - specific timeframes
- **User Trust:** Transparency builds confidence
- **User Control:** Ability to delete anytime (GDPR Article 17 - right to erasure)
- **Legal Compliance:** Exceptions for legal obligations (GDPR Article 17(3))
- **Business Justification:** Each retention period has a stated reason

---

## 5. Best Practices from Similar Apps

### 5.1 Parenting & Child Development Apps

**Studied Examples:**
- Better Kids (educational app) - https://betterkids.education/privacy-policy
- Wonder Weeks (baby development tracking)
- Kinedu (child development activities)
- Tinybeans (family photo journal)

**Key Takeaways:**

1. **Age Gating:**
   - All require 18+ for account creation
   - Clear "for parents" positioning
   - Avoid any features that could attract children directly

2. **Parental Control Features:**
   - Ability to view all child data
   - One-click deletion of child information
   - Export feature (GDPR portability)
   - Parent dashboard for privacy settings

3. **Data Minimization:**
   - Don't ask for child's name (use "my child" or "Child 1")
   - Optional fields where possible
   - Only collect age/birthdate, not full profile

4. **Visual Privacy Settings:**
   - Toggle switches for data sharing
   - Icons showing what data is private vs. shared
   - Privacy status indicators (shield icons)

**Implementation for Zuna:**
- ✅ 18+ age gate at signup
- ⚠️ Add parent dashboard for privacy controls
- ⚠️ Implement data export feature (JSON/CSV)
- ⚠️ Use "Child's Age" not "Child's Name"
- ⚠️ Add visual privacy indicators in app

### 5.2 Mental Health & Psychology Apps

**Studied Examples:**
- Headspace (meditation app)
- BetterHelp (therapy platform)
- Talkspace (online therapy)
- Woebot (AI mental health chatbot)

**Key Takeaways:**

1. **Strong Disclaimers:**
   - Prominent "not a substitute for therapy" on every screen showing insights
   - "Crisis resources" always accessible (emergency button)
   - Clear distinction between educational content and professional advice

2. **Professional Advice Prompts:**
   - "When to seek help" checklist
   - Directory of licensed professionals (by region)
   - Crisis hotline integration (clickable phone numbers)

3. **AI Transparency:**
   - "AI-generated" badge on all automated content
   - Explanation of how AI works (simple language)
   - Limitations section in Help Center

4. **Content Warnings:**
   - Trigger warnings for sensitive content
   - Ability to skip certain topics
   - Gradual disclosure (don't overwhelm with all insights at once)

**Implementation for Zuna:**
- ✅ Strong disclaimers in ToS and Privacy Policy
- ⚠️ Add "AI-generated" badge to analysis results
- ⚠️ Add "When to Seek Professional Help" in-app guide
- ⚠️ Integrate crisis hotline links (Turkey: 112, mental health support numbers)
- ⚠️ Add "Learn How Zuna Works" explainer with AI limitations

### 5.3 AI-Powered Apps (Using OpenAI, Similar APIs)

**Studied Examples:**
- ChatGPT mobile app
- Notion AI
- Copy.ai
- Jasper.ai

**Key Takeaways:**

1. **AI Disclosures:**
   - Every AI-generated output labeled as "AI-generated"
   - Tooltip explaining AI may produce errors
   - "Regenerate" button (acknowledges non-deterministic nature)

2. **User Content Ownership:**
   - Clear: "You own your inputs, we license to operate"
   - Clear: "AI outputs are non-exclusive, you can use but not claim authorship"
   - Transparency about training data use (or non-use)

3. **Third-Party API Disclosures:**
   - Name the AI provider (OpenAI, Anthropic, etc.)
   - Link to provider's terms and privacy policy
   - Explain data goes to third party (international transfer)

4. **Fallback Mechanisms:**
   - What happens if AI fails (error messages, fallback content)
   - Retry mechanisms
   - Status page for service health

**Implementation for Zuna:**
- ✅ Terms disclose OpenAI usage
- ⚠️ Add "AI-generated by OpenAI GPT-4" label on analysis results
- ⚠️ Add tooltip: "AI may not be accurate. Use as general guidance only."
- ⚠️ Add "Regenerate Analysis" button (acknowledges variability)
- ⚠️ Implement error handling with fallback messages

### 5.4 Turkish Apps (KVKK Compliance Examples)

**Studied Examples:**
- BiTaksi (ride-sharing)
- Getir (delivery)
- Trendyol (e-commerce)
- İyzico (payments)

**Key Takeaways:**

1. **KVKK Compliance Display:**
   - "KVKK Aydınlatma Metni" (KVKK Information Text) prominently linked
   - Explicit consent checkbox at signup: "I have read and accept the KVKK Information Text"
   - Data inventory available on request

2. **Turkish Language:**
   - Primary language Turkish, English secondary
   - Legal documents in both languages
   - Turkish version governs in case of conflict (for Turkish users)

3. **Local Data Protection Authority:**
   - Contact info for KVKK (https://www.kvkk.gov.tr/)
   - Complaint filing instructions
   - VERBİS registration number (if applicable)

4. **Consumer Protection:**
   - Reference to Tüketici Hakem Heyeti (Consumer Arbitration Committee)
   - Clear dispute resolution process
   - Consumer rights under Turkish law

**Implementation for Zuna:**
- ⚠️ Add "KVKK Aydınlatma Metni" as Turkish-language privacy notice
- ⚠️ Explicit consent checkbox at signup (checked by user, not pre-checked)
- ⚠️ Display VERBİS registration number (once registered)
- ⚠️ Add KVKK complaint process to Privacy Policy
- ⚠️ Translate Privacy Policy and ToS to Turkish
- ⚠️ Reference Tüketici Hakem Heyeti in dispute resolution

---

## 6. Common Pitfalls to Avoid

### 6.1 Vague or Ambiguous Language

❌ **Pitfall:** "We may share your data with partners."
✅ **Fix:** "We share your data with OpenAI (US-based) for AI analysis and Supabase (EU-based) for storage. We do NOT sell data."

❌ **Pitfall:** "We retain data as long as necessary."
✅ **Fix:** "Account data: 90 days after deletion. Drawings: 30 days after deletion. Analysis: 90 days after deletion."

❌ **Pitfall:** "AI may not be perfect."
✅ **Fix:** "AI-generated insights may be incorrect, incomplete, or misleading. This is NOT professional advice. Consult a licensed psychologist for concerns."

**Why This Matters:**
- GDPR requires clear, plain language (Article 12)
- Vague terms are unenforceable in some jurisdictions
- Users must understand what they're consenting to

### 6.2 Insufficient Disclaimers

❌ **Pitfall:** Single disclaimer buried in Section 15 of Terms
✅ **Fix:**
  - Prominent disclaimer in Section 3 (Critical Disclaimers)
  - Repeated in Privacy Policy (Section 6.4)
  - Displayed in app UI on analysis results screen
  - Required acknowledgment checkbox at signup

❌ **Pitfall:** Generic "not medical advice" disclaimer
✅ **Fix:** Specific disclaimers:
  - NOT diagnostic
  - NOT substitute for professional evaluation
  - NOT for treating mental health conditions
  - When to seek professional help (actionable guidance)
  - Emergency contact info

**Why This Matters:**
- Inadequate disclaimers = potential liability for professional negligence
- Some jurisdictions require "clear and conspicuous" warnings
- Multiple touchpoints ensure user awareness

### 6.3 Ignoring Child Privacy Laws

❌ **Pitfall:** Treating child data same as adult data
✅ **Fix:**
  - Enhanced protections (Section 6 of Privacy Policy)
  - Age gate (18+ only)
  - Parental intermediary model
  - Data minimization (age only, not name)
  - Prominent parental control features

❌ **Pitfall:** Assuming COPPA doesn't apply ("parents are users")
✅ **Fix:**
  - Still implement COPPA-aligned protections
  - Clear "NOT directed at children" statement
  - If gaining "actual knowledge" of child users, have parental consent flow

**Why This Matters:**
- Child privacy violations = significant fines and PR damage
- FTC (US) and KVKK (Turkey) actively enforce child privacy
- GDPR-K has heightened scrutiny (2025 DSA requirements)

### 6.4 Weak Data Security Provisions

❌ **Pitfall:** "We use industry-standard security."
✅ **Fix:** Specific measures:
  - Encryption in transit (TLS 1.3)
  - Encryption at rest (AES-256)
  - Access controls (role-based, MFA for admins)
  - Regular security audits
  - Incident response procedures

❌ **Pitfall:** No data breach notification procedures
✅ **Fix:**
  - 72-hour notification to users and authorities (GDPR, KVKK)
  - Incident response plan documented
  - Designated breach notification contact

**Why This Matters:**
- GDPR Article 32 requires "appropriate" security measures
- KVKK Article 12 requires technical/administrative safeguards
- Data breaches without proper response = exponential fines

### 6.5 Unclear Intellectual Property Rights

❌ **Pitfall:** "All content belongs to us."
✅ **Fix:**
  - Users retain ownership of uploaded content (drawings)
  - Users grant license to us (to operate service)
  - License scope clearly defined (not for resale/public sharing)
  - AI-generated content ownership clarified (ambiguous in some jurisdictions)

❌ **Pitfall:** No DMCA compliance procedures
✅ **Fix:**
  - DMCA notice and counter-notice procedures (Section 6.6)
  - Designated DMCA agent (dmca@zuna.app)
  - Repeat infringer policy

**Why This Matters:**
- IP disputes = expensive litigation
- DMCA safe harbor protects platforms from user copyright violations
- Clear ownership = fewer disputes

### 6.6 Forgetting Jurisdiction-Specific Requirements

❌ **Pitfall:** One-size-fits-all policy for all countries
✅ **Fix:**
  - Section 14 (ToS): Special Provisions for Specific Jurisdictions
  - Section 9 (Privacy Policy): Jurisdiction-specific rights
  - Turkish users: KVKK, Tüketici Hakem Heyeti
  - EU users: GDPR, 14-day withdrawal right
  - California users: CCPA/CPRA rights

❌ **Pitfall:** Ignoring local dispute resolution mechanisms
✅ **Fix:**
  - Turkey: Consumer Arbitration Committees for small claims
  - EU: Alternative Dispute Resolution (ADR) requirements
  - US: Arbitration clauses (with opt-outs where required)

**Why This Matters:**
- Local laws override generic ToS in consumer contracts
- Some provisions unenforceable in certain jurisdictions (e.g., class action waivers in EU)
- Consumer protection authorities enforce jurisdiction-specific rules

### 6.7 Not Keeping Documents Updated

❌ **Pitfall:** Set-and-forget policy from 2020
✅ **Fix:**
  - Review privacy policy every 6 months
  - Update when laws change (e.g., new GDPR guidelines, KVKK amendments)
  - Update when service changes (new features, new third parties)
  - Version control (date stamps, changelog)

❌ **Pitfall:** Not notifying users of changes
✅ **Fix:**
  - Email notification for material changes (30 days' notice)
  - In-app notification (banner or modal)
  - "Last Updated" date prominently displayed
  - Version history available on request

**Why This Matters:**
- Outdated policies = non-compliance with new laws
- Users must consent to updated terms (continued use = acceptance, but notification required)
- Some changes require explicit re-consent (GDPR)

### 6.8 No Mechanisms to Exercise User Rights

❌ **Pitfall:** Policy lists rights but no way to exercise them
✅ **Fix:**
  - In-app controls (Settings > Privacy > Export Data, Delete Account)
  - Email contact (privacy@zuna.app with response within 30 days)
  - Clear instructions in Privacy Policy (Section 9.2)
  - Identity verification process (to prevent unauthorized requests)

❌ **Pitfall:** Manual, opaque process for data export
✅ **Fix:**
  - Automated data export (JSON/CSV download)
  - Includes all user data (account, drawings, analyses)
  - GDPR-compliant format (machine-readable)

**Why This Matters:**
- GDPR/KVKK require "easy" exercise of rights
- Data protection authorities investigate complaints about unresponsive companies
- Automation reduces operational burden

### 6.9 Overpromising in Marketing vs. Policy

❌ **Pitfall:** Marketing says "100% secure, AI never wrong" but policy says "no warranties"
✅ **Fix:**
  - Align marketing language with legal disclaimers
  - Marketing: "AI-powered insights to support your parenting journey" ✅
  - Marketing: "Accurate psychological diagnosis for your child" ❌

❌ **Pitfall:** Claiming "HIPAA compliant" when not applicable
✅ **Fix:**
  - Don't claim compliance with inapplicable regulations
  - Zuna is NOT HIPAA-covered (we're not a healthcare provider)
  - Can say: "We protect data with security measures similar to HIPAA requirements"

**Why This Matters:**
- False advertising = regulatory action (FTC in US, KVKK in Turkey)
- Misrepresentation voids disclaimers (can't disclaim what you promised)
- Users may rely on marketing claims (detrimental reliance)

### 6.10 Inadequate Third-Party Vendor Management

❌ **Pitfall:** No data processing agreements (DPAs) with vendors
✅ **Fix:**
  - Signed DPAs with OpenAI and Supabase (required under GDPR Article 28)
  - Regular vendor security audits
  - Vendor compliance verification (SOC 2, ISO 27001)
  - Contractual liability provisions

❌ **Pitfall:** No contingency plan if vendor discontinues service
✅ **Fix:**
  - Backup vendors identified (alternative AI providers, database providers)
  - Data portability from vendors (can export if switching)
  - Force majeure provisions in Terms (Section 13.5)

**Why This Matters:**
- GDPR Article 28: Controllers liable for processors' violations
- KVKK: Controllers must ensure processor compliance
- Vendor failures = service disruptions and potential data loss

---

## 7. Implementation Checklist

### 7.1 Legal Documents

- [x] **Privacy Policy Created** - 15 sections, comprehensive (PRIVACY_POLICY.md)
- [x] **Terms of Service Created** - 16 sections, strong disclaimers (TERMS_OF_SERVICE.md)
- [ ] **Turkish Translation** - Translate both documents to Turkish (required for Turkish users)
- [ ] **KVKK Aydınlatma Metni** - Separate Turkish-language KVKK notice (best practice)
- [ ] **Cookie Policy** - If using cookies beyond essential (GDPR requires separate notice)
- [ ] **Data Processing Agreements (DPAs)** - Signed agreements with OpenAI and Supabase
- [ ] **Data Protection Impact Assessment (DPIA)** - Required for high-risk processing (child data, AI profiling)
- [ ] **Records of Processing Activities** - GDPR Article 30 register of processing operations

**Priority:** High
**Timeline:** 1-2 weeks

### 7.2 UI/UX Implementation

#### At Signup/Onboarding:
- [ ] **Age Gate** - "Are you 18 years or older?" (block if No)
- [ ] **Consent Checkboxes:**
  - [ ] "I have read and agree to the Terms of Service" (required, link to ToS)
  - [ ] "I have read and understand the Privacy Policy" (required, link to Privacy Policy)
  - [ ] "I consent to my data being processed as described" (required for GDPR/KVKK)
  - [ ] "I have parental responsibility for any child information I provide" (required)
  - [ ] "I agree to receive promotional emails" (optional, unchecked by default)
- [ ] **Disclaimer Acknowledgment:**
  - [ ] Modal: "Important: Zuna is NOT a diagnostic tool. AI insights are for informational purposes only. Consult professionals for medical concerns." [I Understand]

#### In App:
- [ ] **AI-Generated Badge** - All analysis results labeled "AI-Generated by OpenAI GPT-4"
- [ ] **Tooltip on Analysis** - Hover/tap info icon: "AI may produce errors. This is general guidance, not professional advice."
- [ ] **Persistent Disclaimer** - Footer on analysis screens: "Not professional advice. Seek licensed professional for concerns."
- [ ] **Crisis Resources** - Always accessible button: "Need Help? Crisis Hotlines" with local numbers (Turkey: 112, mental health support)
- [ ] **Privacy Dashboard** - Settings > Privacy:
  - [ ] View what data is collected
  - [ ] Export my data (JSON/CSV)
  - [ ] Delete specific drawings/analyses
  - [ ] Delete my account (with confirmation)
  - [ ] Manage email preferences (opt-out of marketing)
- [ ] **About AI Link** - "How Zuna's AI Works" explainer page (limitations, how to interpret results)

#### Legal Document Access:
- [ ] **Footer Links** - Every screen bottom: Privacy Policy | Terms of Service | Contact
- [ ] **Settings > Legal** - Dedicated section with:
  - [ ] Privacy Policy (full text, scrollable)
  - [ ] Terms of Service (full text, scrollable)
  - [ ] Version history
  - [ ] "Last Updated" dates
  - [ ] Contact: privacy@zuna.app, legal@zuna.app

**Priority:** High (signup flow), Medium (in-app features)
**Timeline:** 2-3 weeks

### 7.3 Backend/Technical Implementation

#### Data Security:
- [x] **Encryption in Transit** - HTTPS/TLS for all API calls (already implemented via Hono/tRPC)
- [ ] **Encryption at Rest** - Verify Supabase encryption settings (should be default)
- [ ] **Access Controls** - Role-based access control (RBAC) for admin/support access to database
- [ ] **API Key Security** - Rotate OpenAI and Supabase keys regularly (quarterly)
- [ ] **Audit Logging** - Log all access to sensitive data (who, when, what) for GDPR/KVKK compliance

#### Data Retention Automation:
- [ ] **Scheduled Jobs:**
  - [ ] Delete accounts marked for deletion (90 days after request)
  - [ ] Delete orphaned drawings (30 days after account deletion)
  - [ ] Delete old stories (90 days after generation)
  - [ ] Anonymize old analytics (24 months)
  - [ ] Purge backups (30 days)
- [ ] **Data Deletion API Endpoint** - User-triggered deletion (instant for drawings/stories)

#### Data Export:
- [ ] **Export API Endpoint** - Generate JSON/CSV of user data (account, drawings, analyses)
- [ ] **Export Format:** GDPR-compliant machine-readable format
  ```json
  {
    "user": { "email": "...", "name": "...", "child_age": ... },
    "drawings": [{ "id": "...", "uploaded_at": "...", "image_url": "..." }],
    "analyses": [{ "id": "...", "drawing_id": "...", "insights": "...", "created_at": "..." }]
  }
  ```

#### User Rights Implementation:
- [ ] **Access (View Data)** - GET /api/user/data endpoint
- [ ] **Rectification (Update Data)** - PUT /api/user/profile endpoint
- [ ] **Erasure (Delete Data)** - DELETE /api/user/account endpoint (soft delete, hard delete after 90 days)
- [ ] **Restriction (Pause Processing)** - POST /api/user/restrict endpoint (freeze account, no AI processing)
- [ ] **Portability (Export Data)** - GET /api/user/export endpoint
- [ ] **Objection (Opt-Out)** - POST /api/user/objection endpoint (opt out of analytics, marketing)

#### Breach Notification System:
- [ ] **Incident Response Plan** - Documented procedures (detect, assess, contain, notify)
- [ ] **Notification Templates** - Email templates for user and authority notifications
- [ ] **Breach Log** - Record of all security incidents (even if no breach)
- [ ] **Responsible Parties** - Designate: Security Officer, Data Protection Officer (if required), Legal Counsel

**Priority:** High (security, deletion), Medium (export, rights endpoints)
**Timeline:** 3-4 weeks

### 7.4 Compliance & Documentation

#### GDPR:
- [ ] **DPIA (Data Protection Impact Assessment)** - Required for child data + AI profiling
  - Assess: Necessity, proportionality, risks to rights and freedoms
  - Mitigations: Encryption, anonymization, access controls, data minimization
- [ ] **Records of Processing Activities (ROPA)** - Article 30 register:
  - Name and contact details of controller (Zuna)
  - Purposes of processing (analysis, storage, improvement)
  - Categories of data subjects (parents, children via parents)
  - Categories of data (email, age, drawings, AI insights)
  - Recipients (OpenAI, Supabase)
  - International transfers (OpenAI in US - SCCs)
  - Retention periods (90 days account, 30 days drawings, etc.)
  - Security measures (encryption, access controls)
- [ ] **Data Processing Agreements (DPAs)** - Article 28 contracts with processors:
  - OpenAI DPA (if available, request from OpenAI)
  - Supabase DPA (standard DPA available on their site)
- [ ] **Legal Basis Documentation** - For each processing activity, document legal basis:
  - Account management: Contract performance
  - Drawing analysis: Consent
  - Service improvement: Legitimate interest (with balancing test)
- [ ] **EU Representative** - If applicable (if we have >occasional targeting of EU users without EU establishment)

#### KVKK (Turkey):
- [ ] **VERBİS Registration** - Register if:
  - >50 employees, OR
  - Processing sensitive personal data (child data may qualify)
  - Check thresholds: https://www.kvkk.gov.tr/
  - Registration portal: https://verbis.kvkk.gov.tr/
- [ ] **Data Inventory** - Detailed inventory for KVKK compliance:
  - What data (email, child age, drawings, AI insights)
  - Why collected (service provision, analysis, tracking)
  - How long retained (specific periods)
  - Where stored (Supabase EU, processed by OpenAI US)
  - Security measures (encryption, access controls)
- [ ] **KVKK Aydınlatma Metni** - Turkish-language information notice (can be Turkish translation of Privacy Policy Section 1-4)
- [ ] **Explicit Consent Records** - Log user consents (timestamp, IP, what consented to) for KVKK Article 5

#### COPPA (US):
- [x] **Age Gate** - 18+ requirement (exceeds COPPA 13+ requirement)
- [x] **Parental Intermediary Model** - Parents are users, not children (documented in ToS/Privacy Policy)
- [ ] **If Actual Knowledge of Child User** - Process to obtain verifiable parental consent:
  - Collect parent email and verify (send confirmation email)
  - Options: Credit card transaction ($0.01 charge), government ID verification, video call
  - Document parental consent in database

#### Other Jurisdictions:
- [ ] **California (CCPA/CPRA)** - "Do Not Sell My Personal Information" notice
  - Add to Privacy Policy (already included in Section 14.1)
  - Add to website footer: "Your Privacy Choices" (if selling data - we don't, so just informational)
- [ ] **UK GDPR** - Post-Brexit UK data protection (similar to EU GDPR)
  - If significant UK user base, may need UK representative

**Priority:** High (DPIA, VERBİS check), Medium (DPAs, ROPA)
**Timeline:** 2-4 weeks

### 7.5 Operational Processes

#### Customer Support:
- [ ] **Privacy Requests SOP** - Standard Operating Procedure for handling:
  - Data access requests (respond within 30 days with JSON export)
  - Deletion requests (process within 30 days, confirm via email)
  - Rectification requests (update data within 30 days)
  - Objection requests (stop processing, offer account restriction)
- [ ] **Identity Verification** - Process to verify requestor identity (prevent unauthorized access):
  - Email confirmation (send link to registered email)
  - Additional verification for sensitive requests (security questions, two-factor auth)
- [ ] **Support Training** - Train support staff on:
  - User privacy rights (GDPR/KVKK)
  - How to process requests
  - When to escalate to legal/privacy team
  - Confidentiality obligations

#### Monitoring & Audits:
- [ ] **Quarterly Privacy Review** - Check:
  - Policy still accurate (any service changes?)
  - New laws or regulations (GDPR updates, KVKK amendments)
  - User complaints or requests (any patterns?)
  - Vendor compliance (OpenAI, Supabase still secure?)
- [ ] **Annual External Audit** - Consider hiring:
  - Data protection consultant
  - Legal counsel specialized in privacy law
  - Security auditor (penetration testing, vulnerability assessment)
- [ ] **Metrics Tracking** - Monitor:
  - Number of privacy requests (access, deletion, etc.)
  - Average response time
  - User complaints to data protection authorities
  - Security incidents (even if no breach)

#### Incident Response:
- [ ] **Breach Notification Workflow:**
  1. **Detect** - Automated alerts for suspicious activity (failed logins, unauthorized access)
  2. **Assess** - Determine if breach occurred, scope, affected users
  3. **Contain** - Immediately mitigate (revoke access, patch vulnerability)
  4. **Notify** - Within 72 hours:
     - Data protection authority (KVKK in Turkey, relevant EU DPA if EU users affected)
     - Affected users (email with details: what happened, what data, what we're doing, what they should do)
  5. **Document** - Log incident, response, lessons learned
  6. **Remediate** - Long-term fixes to prevent recurrence

- [ ] **Breach Notification Templates:**
  - Email to users
  - Notification to KVKK (Turkish template)
  - Notification to EU DPA (English template)
  - Public disclosure (if required by law or for transparency)

**Priority:** Medium (processes), High (breach response)
**Timeline:** Ongoing (set up within 4 weeks, refine continuously)

### 7.6 Third-Party Vendor Management

#### OpenAI:
- [ ] **Review OpenAI Terms** - https://openai.com/policies/row-terms-of-use/
  - Confirm our use case complies (child-related data: allowed if parent is user, not for harm)
  - Understand data retention (API data not used for training - as of current OpenAI policy)
- [ ] **Request DPA** - Email OpenAI for Data Processing Agreement (if available for API customers)
- [ ] **Monitor OpenAI Policy Changes** - Subscribe to OpenAI policy updates
- [ ] **Fallback Plan** - Identify alternative AI provider (Anthropic Claude, Google Gemini, Azure OpenAI) in case OpenAI discontinues service or changes ToS

#### Supabase:
- [ ] **Review Supabase Terms** - https://supabase.com/terms
- [ ] **Download Supabase DPA** - https://supabase.com/legal (they have standard DPA)
- [ ] **Verify Security Certifications** - SOC 2 Type II, ISO 27001 (check Supabase security page)
- [ ] **Data Location Settings** - Confirm our Supabase instance is in EU region (for GDPR compliance)
- [ ] **Backup Strategy** - Regular backups outside Supabase (in case of Supabase failure)

#### Future Third Parties:
- [ ] **Vendor Approval Process** - Before adding new vendor:
  - Legal review of vendor's ToS and Privacy Policy
  - Security assessment (certifications, encryption, access controls)
  - DPA negotiation (if vendor is data processor)
  - Risk assessment (what if vendor fails? alternatives?)
  - User notification (update Privacy Policy with new vendor disclosure)

**Priority:** Medium
**Timeline:** 2-3 weeks

---

## 8. Technical Implementation

### 8.1 Consent Management System (CMS)

**Purpose:** Track user consents for GDPR/KVKK compliance

**Database Schema:**
```sql
CREATE TABLE user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- 'terms', 'privacy', 'data_processing', 'marketing'
  consent_given BOOLEAN NOT NULL,
  consent_text TEXT, -- Full text of what user consented to (version control)
  consent_method VARCHAR(50), -- 'checkbox', 'button_click', 'electronic_signature'
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ, -- If consent later withdrawn
  UNIQUE(user_id, consent_type, timestamp)
);

CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX idx_user_consents_type ON user_consents(consent_type);
```

**Implementation:**
- Log consent at signup (terms, privacy, data processing)
- Log consent for marketing (opt-in checkbox)
- Allow consent withdrawal (update withdrawn_at)
- Audit trail for KVKK/GDPR compliance

### 8.2 Data Export Implementation

**API Endpoint:**
```typescript
// backend/trpc/routes/user/export-data.ts
import { publicProcedure } from "../../create-context";
import { z } from "zod";
import { supabase } from "../../../lib/supabase";

export const exportDataProcedure = publicProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .mutation(async ({ input }) => {
    // Fetch all user data
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', input.userId)
      .single();

    const { data: drawings } = await supabase
      .from('drawings')
      .select('*')
      .eq('user_id', input.userId);

    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', input.userId);

    // Return GDPR-compliant JSON
    return {
      export_date: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        child_age: user.child_age,
        created_at: user.created_at,
      },
      drawings: drawings.map(d => ({
        id: d.id,
        uploaded_at: d.created_at,
        image_url: d.image_url,
        task_type: d.task_type,
      })),
      analyses: analyses.map(a => ({
        id: a.id,
        drawing_id: a.drawing_id,
        title: a.title,
        insights: a.insights,
        emotions: a.emotions,
        themes: a.themes,
        created_at: a.created_at,
      })),
    };
  });
```

**UI:**
```typescript
// In Settings > Privacy screen
<Button onPress={handleExportData}>
  Download My Data (JSON)
</Button>

// Handler
const handleExportData = async () => {
  const data = await trpc.user.exportData.mutate({ userId: currentUser.id });
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Trigger download (web) or share (mobile)
  // Mobile: use expo-sharing or save to device
};
```

### 8.3 Automated Data Deletion

**Scheduled Job (using cron or Supabase Edge Functions):**
```typescript
// backend/jobs/cleanup-deleted-accounts.ts
import { supabase } from "../lib/supabase";

export async function cleanupDeletedAccounts() {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Find accounts marked for deletion 90+ days ago
  const { data: accountsToDelete } = await supabase
    .from('users')
    .select('id')
    .eq('deletion_requested', true)
    .lt('deletion_requested_at', ninetyDaysAgo.toISOString());

  for (const account of accountsToDelete) {
    // Delete user data
    await supabase.from('analyses').delete().eq('user_id', account.id);
    await supabase.from('drawings').delete().eq('user_id', account.id);
    await supabase.storage.from('drawings').remove([`${account.id}/*`]);
    await supabase.from('users').delete().eq('id', account.id);

    console.log(`Deleted account ${account.id} (90 days after request)`);
  }
}

// Run daily via cron job or Supabase scheduled function
// Example: Vercel Cron Job, AWS EventBridge, or Supabase pg_cron
```

**Delete Account Endpoint:**
```typescript
// backend/trpc/routes/user/delete-account.ts
export const deleteAccountProcedure = publicProcedure
  .input(z.object({ userId: z.string().uuid() }))
  .mutation(async ({ input }) => {
    // Mark account for deletion (soft delete)
    const { error } = await supabase
      .from('users')
      .update({
        deletion_requested: true,
        deletion_requested_at: new Date().toISOString(),
      })
      .eq('id', input.userId);

    if (error) throw new Error('Failed to delete account');

    return { message: 'Account will be deleted within 90 days. You can cancel anytime by logging in.' };
  });
```

### 8.4 Age Gate Implementation

**Signup Screen:**
```typescript
// app/(onboarding)/signup.tsx
import { useState } from 'react';

export default function SignupScreen() {
  const [agreedToAge, setAgreedToAge] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const canProceed = agreedToAge && agreedToTerms && agreedToPrivacy;

  return (
    <View>
      <Text>Create Your Zuna Account</Text>

      {/* Age Gate */}
      <Checkbox
        value={agreedToAge}
        onValueChange={setAgreedToAge}
        label="I am 18 years of age or older"
        required
      />

      {/* Terms */}
      <Checkbox
        value={agreedToTerms}
        onValueChange={setAgreedToTerms}
        label={
          <Text>
            I agree to the <Link href="/terms">Terms of Service</Link>
          </Text>
        }
        required
      />

      {/* Privacy */}
      <Checkbox
        value={agreedToPrivacy}
        onValueChange={setAgreedToPrivacy}
        label={
          <Text>
            I have read and understand the <Link href="/privacy">Privacy Policy</Link>
          </Text>
        }
        required
      />

      {/* Disclaimer Modal (shown after checkboxes) */}
      {canProceed && (
        <Modal>
          <Text style={{ fontWeight: 'bold' }}>Important Notice</Text>
          <Text>
            Zuna is NOT a diagnostic or medical tool. AI-generated insights are for
            informational purposes only. Always consult licensed professionals for
            medical or psychological concerns.
          </Text>
          <Button onPress={handleAcceptDisclaimer}>I Understand</Button>
        </Modal>
      )}

      <Button disabled={!canProceed} onPress={handleSignup}>
        Create Account
      </Button>
    </View>
  );
}
```

### 8.5 AI Disclaimer UI

**Analysis Results Screen:**
```typescript
// app/(tabs)/analysis-result.tsx
export default function AnalysisResultScreen({ analysis }) {
  return (
    <ScrollView>
      {/* AI Badge */}
      <View style={styles.aiBadge}>
        <Icon name="sparkles" />
        <Text>AI-Generated by OpenAI GPT-4</Text>
        <Tooltip content="This analysis is created by AI and may contain errors. Use as general guidance only.">
          <Icon name="info" />
        </Tooltip>
      </View>

      {/* Analysis Content */}
      <Text style={styles.title}>{analysis.title}</Text>
      <Text>{analysis.insights}</Text>

      {/* Persistent Disclaimer */}
      <View style={styles.disclaimer}>
        <Icon name="alert-circle" color="orange" />
        <Text style={styles.disclaimerText}>
          This is not professional advice. If you have concerns about your child's
          development or well-being, please consult a licensed psychologist or pediatrician.
        </Text>
      </View>

      {/* Help Button */}
      <Button onPress={() => navigation.navigate('CrisisResources')}>
        Need Professional Help? View Resources
      </Button>
    </ScrollView>
  );
}
```

---

## 9. Compliance Monitoring

### 9.1 Metrics to Track

**Privacy Request Metrics:**
- Number of data access requests (monthly)
- Number of deletion requests (monthly)
- Average response time (target: <30 days per GDPR/KVKK)
- Number of requests escalated to legal

**Security Metrics:**
- Number of security incidents (even if no breach)
- Failed login attempts (potential brute force attacks)
- Unauthorized access attempts
- Time to detect and respond to incidents (target: <72 hours for breaches)

**Compliance Metrics:**
- Percentage of users who consented to terms/privacy (should be 100%)
- Number of users who withdrew consent (marketing)
- Percentage of data deletion requests completed on time (target: 100%)

**User Trust Metrics:**
- User complaints to data protection authorities (target: 0)
- Privacy-related support tickets (trend over time)
- User satisfaction with privacy controls (survey)

### 9.2 Audit Schedule

**Monthly:**
- Review privacy request log (access, deletion, rectification)
- Review security incident log (even minor incidents)
- Check data deletion job ran successfully (automated cleanup)

**Quarterly:**
- Review Privacy Policy and Terms for needed updates (law changes, service changes)
- Review third-party vendor compliance (OpenAI, Supabase - check for policy updates)
- Review user consent records (any anomalies?)

**Annually:**
- Conduct Data Protection Impact Assessment (DPIA) review
- External security audit (penetration testing, vulnerability assessment)
- Legal counsel review of all policies
- VERBİS registration renewal (if applicable in Turkey)

### 9.3 Red Flags to Watch

**Immediate Action Required:**
- Data breach detected (activate incident response plan)
- Complaint filed with data protection authority (respond within 30 days, engage legal)
- Vendor security incident affecting our users (notify users if required)
- Law change requiring policy update (e.g., new GDPR guidelines)

**High Priority:**
- Spike in data deletion requests (investigate: bad PR? service issue?)
- Unusual privacy-related support tickets (ambiguous policy? missing feature?)
- Third-party vendor changes terms (review impact on compliance)

**Medium Priority:**
- Slow response time to privacy requests (improve process)
- User confusion about privacy controls (improve UI/UX)
- Competitor privacy incident (learn lessons, review our practices)

---

## 10. Action Items

### 10.1 Immediate (Week 1-2)

**Priority: CRITICAL**

1. **Legal Review** (External)
   - [ ] Hire Turkish privacy lawyer to review Privacy Policy and ToS
   - [ ] Hire EU GDPR consultant if targeting EU users significantly
   - [ ] Budget: $2,000-$5,000 for initial review

2. **Turkish Translation**
   - [ ] Translate Privacy Policy to Turkish
   - [ ] Translate Terms of Service to Turkish
   - [ ] Create KVKK Aydınlatma Metni (Turkish KVKK notice)
   - [ ] Budget: $500-$1,000 for professional legal translation

3. **Age Gate Implementation**
   - [ ] Add age gate to signup flow (18+ requirement)
   - [ ] Block account creation if user indicates <18
   - [ ] Developer time: 4-8 hours

4. **Consent Checkboxes**
   - [ ] Add required checkboxes at signup (Terms, Privacy, Data Processing, Parental Responsibility)
   - [ ] Log consents to database with timestamp, IP, user agent
   - [ ] Developer time: 8-16 hours

**Deliverables:** Age-gated signup with logged consents, Turkish legal documents reviewed by lawyer

### 10.2 Short-Term (Week 3-4)

**Priority: HIGH**

1. **AI Disclaimers in App**
   - [ ] Add "AI-Generated" badge to analysis results
   - [ ] Add tooltip: "AI may contain errors. Not professional advice."
   - [ ] Add persistent disclaimer footer on analysis screens
   - [ ] Developer time: 8-12 hours

2. **Privacy Dashboard**
   - [ ] Settings > Privacy section with:
     - View my data
     - Export my data (JSON)
     - Delete specific drawings/analyses
     - Delete my account
   - [ ] Developer time: 16-24 hours

3. **Data Export API**
   - [ ] Implement tRPC endpoint for data export
   - [ ] Generate GDPR-compliant JSON file
   - [ ] Test export functionality
   - [ ] Developer time: 12-16 hours

4. **Automated Data Deletion**
   - [ ] Implement soft delete (mark for deletion)
   - [ ] Scheduled job to hard delete after 90 days
   - [ ] Test deletion flow (manual trigger for testing)
   - [ ] Developer time: 12-20 hours

5. **DPIA (Data Protection Impact Assessment)**
   - [ ] Complete DPIA for child data processing + AI profiling
   - [ ] Document necessity, proportionality, risks, mitigations
   - [ ] Review with legal counsel
   - [ ] Time: 16-24 hours (legal + internal)

**Deliverables:** App has AI disclaimers, privacy controls functional, DPIA completed

### 10.3 Medium-Term (Month 2)

**Priority: MEDIUM**

1. **VERBİS Registration (Turkey)**
   - [ ] Determine if registration required (>50 employees OR sensitive data)
   - [ ] If required, complete VERBİS registration: https://verbis.kvkk.gov.tr/
   - [ ] Add VERBİS registration number to Privacy Policy
   - [ ] Time: 8-16 hours (application process)

2. **Data Processing Agreements (DPAs)**
   - [ ] Request DPA from OpenAI (if available)
   - [ ] Download and sign Supabase DPA
   - [ ] Store signed DPAs securely
   - [ ] Time: 4-8 hours (legal review + signing)

3. **Records of Processing Activities (ROPA)**
   - [ ] Create GDPR Article 30 register
   - [ ] Document all processing activities (purposes, data types, recipients, retention)
   - [ ] Maintain as living document (update when service changes)
   - [ ] Time: 8-12 hours

4. **Crisis Resources Integration**
   - [ ] Add "Need Help?" button in app (always accessible)
   - [ ] Crisis hotline page with local numbers (Turkey: 112, mental health support)
   - [ ] Link from analysis results: "Concerned? Get Professional Help"
   - [ ] Developer time: 4-8 hours

5. **About AI Explainer**
   - [ ] Create in-app page: "How Zuna's AI Works"
   - [ ] Explain: what AI is, how it analyzes drawings, limitations, how to interpret results
   - [ ] Link from onboarding and analysis screens
   - [ ] Content writing: 4-6 hours, Development: 4-6 hours

**Deliverables:** Compliance documentation complete (DPAs, ROPA), user-facing resources (crisis hotlines, AI explainer)

### 10.4 Long-Term (Month 3+)

**Priority: LOW (but important)

1. **External Audits**
   - [ ] Security audit (penetration testing, vulnerability assessment)
   - [ ] Privacy compliance audit (GDPR, KVKK)
   - [ ] Budget: $5,000-$15,000 for professional audits
   - [ ] Schedule: Annually

2. **User Privacy Education**
   - [ ] Blog post: "How Zuna Protects Your Family's Privacy"
   - [ ] In-app tutorials: "Understanding Your Privacy Rights"
   - [ ] Email series: Privacy tips for parents
   - [ ] Time: Ongoing content creation

3. **Privacy Policy Monitoring**
   - [ ] Subscribe to legal updates (GDPR, KVKK, COPPA changes)
   - [ ] Quarterly review of policies (any service changes?)
   - [ ] Annual legal counsel review
   - [ ] Time: 2-4 hours quarterly, 8 hours annually

4. **Vendor Management**
   - [ ] Annual review of OpenAI and Supabase compliance
   - [ ] Identify alternative vendors (contingency planning)
   - [ ] Negotiate enterprise agreements (better DPAs, SLAs)
   - [ ] Time: 8-16 hours annually

**Deliverables:** Ongoing compliance maintenance, user trust building, risk mitigation

---

## Conclusion

This implementation guide provides a comprehensive roadmap for legally sound, user-friendly Privacy Policy and Terms of Service for Zuna.

**Key Takeaways:**

1. **Strong Disclaimers Are Essential:** AI-generated psychological insights require prominent, repeated disclaimers to avoid liability.

2. **Child Privacy Is Highly Regulated:** Even though parents are the users, child data requires enhanced protections (GDPR-K, KVKK, COPPA-aligned practices).

3. **Transparency Builds Trust:** Clear disclosure of data practices, third-party sharing, and AI limitations creates user confidence.

4. **Multi-Jurisdictional Compliance:** Turkish app serving potential EU/US users requires KVKK + GDPR + COPPA awareness.

5. **Implementation Is Ongoing:** Privacy compliance isn't one-and-done; requires continuous monitoring, updates, and user support.

**Next Steps:**
1. Legal review by Turkish privacy lawyer (CRITICAL)
2. Implement age gate and consent logging (CRITICAL)
3. Add AI disclaimers in app UI (HIGH PRIORITY)
4. Build privacy dashboard with data export and deletion (HIGH PRIORITY)
5. Complete DPIA and VERBİS registration (if applicable) (MEDIUM PRIORITY)

**Timeline Summary:**
- **Week 1-2:** Legal review, translations, age gate
- **Week 3-4:** AI disclaimers, privacy dashboard, data export, DPIA
- **Month 2:** VERBİS, DPAs, ROPA, crisis resources, AI explainer
- **Month 3+:** Audits, ongoing monitoring, user education

**Estimated Budget:**
- Legal review: $2,000-$5,000
- Translations: $500-$1,000
- Development time: 80-120 hours ($8,000-$18,000 at $100/hour)
- External audits (annual): $5,000-$15,000
- **Total initial investment:** ~$15,000-$40,000

**Questions or Clarifications:**
Contact legal@zuna.app for any questions about this implementation guide.

---

**Document Version:** 1.0
**Last Updated:** November 24, 2025
**Author:** Legal & Compliance Team
