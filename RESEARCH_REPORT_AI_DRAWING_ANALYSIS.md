# Comprehensive Research Report: AI-Powered Child Drawing Analysis

## For Renkioo Product Strategy | February 2026

---

## Table of Contents

1. [Topic 1: AI-Powered Child Drawing Analysis](#topic-1-ai-powered-child-drawing-analysis)
2. [Topic 2: Best Practices in Projective Drawing Tests](#topic-2-best-practices-in-projective-drawing-tests)
3. [Topic 3: UX/UI for Psychological Assessment Apps](#topic-3-uxui-for-psychological-assessment-apps)
4. [Topic 4: Ethical & Clinical Considerations](#topic-4-ethical--clinical-considerations)
5. [Competitor Analysis](#competitor-analysis)
6. [Recommendations for Renkioo](#recommendations-for-renkioo)
7. [Sources](#sources)

---

## Topic 1: AI-Powered Child Drawing Analysis

### Current State of the Field

AI-powered analysis of children's drawings has moved from theoretical research to practical consumer applications between 2023-2026. The field sits at the intersection of computer vision, developmental psychology, and clinical assessment.

### Key Academic Research

#### 1. "From Crayons to Code" (AAAI 2025)

- **Authors:** Farhad, M., Masud, M. M., Alnaqbi, A., et al.
- **Published in:** Proceedings of the AAAI Conference on Artificial Intelligence, 39(28), 28923-28929
- **Approach:** A novel AI technique to automate psychological screening using the Draw-a-Person (DAP) test
- **Method:** Children's drawings were collected and labeled by experts as "need" or "no need" (indicating whether the child needs further psychological referral)
- **Significance:** This is the first AAAI-published work specifically on AI-driven child mental health screening through drawings, giving the approach mainstream AI research credibility

#### 2. DrawAA-Net (AIED 2025)

- **Authors:** Wang, S., Liu, W., Wang, J., Yi, Y., Xu, J.
- **Published in:** 26th International Conference on Artificial Intelligence in Education (AIED 2025)
- **What it does:** Automates evaluation of children's drawings using deep learning and computer vision
- **Focus:** Assesses multiple dimensions including technical skills and aesthetic quality
- **Key benefit:** Provides consistent, real-time feedback while balancing scientific rigor with human aesthetic preferences
- **Open source:** Available at https://github.com/Nancywsn/DrawAA

#### 3. Deep Learning DAP-IQ Screening (MDPI 2025)

- **Published in:** Big Data and Cognitive Computing, Volume 9, Issue 7
- **Approach:** Uses MobileNet deep learning model to classify DAP drawings into IQ ranges
- **Accuracy:** 99% accuracy for "High Average" and "Average" classifications; lower accuracy (51%) for "Very Superior" class
- **Key finding:** Strong classification for mid-range IQ levels, reduced accuracy at extremes
- **Implication:** AI is viable for screening but not for edge-case diagnostic precision

#### 4. HTP Object Detection Analysis (ScienceDirect)

- **What it does:** Uses object detection to analyze House-Tree-Person test drawings
- **Method:** Extracts information about the number, size, and location of detected objects, then generates psychological analysis tables
- **Significance:** Demonstrates that standard projective tests can be decomposed into machine-readable features

#### 5. Stanford Children's Drawing Study (2024)

- **Key finding:** Children's ability to draw and recognize objects develops in parallel
- **Dataset:** 37,000+ children's drawings analyzed with machine learning
- **Age range:** 2 to 10 years old
- **Relevance:** Establishes normative baselines for what children _should_ draw at each age

#### 6. Fine Motor Skill Detection (Springer 2021)

- **What it does:** Machine learning classifiers determine children's age category based on drawing features related to fine motor skills
- **Result:** Surpassed both previous work and human evaluators in accuracy

### Key Technical Approaches Being Used

| Approach                       | Description                                                                              | Maturity                |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ----------------------- |
| **Object Detection**           | Identifies specific elements (body parts, house features, tree features)                 | High - Well-established |
| **Image Classification**       | Classifies entire drawing into categories (needs referral / no referral)                 | Medium-High             |
| **Feature Extraction + Rules** | Extracts measurable features (size, placement, pressure) and applies psychological rules | Medium                  |
| **Multimodal LLMs (GPT-4V)**   | Vision-language models providing narrative interpretation                                | Medium - Emerging       |
| **CNN/Deep Learning Scoring**  | Automated scoring of standardized tests (DAP-IQ, Bender-Gestalt)                         | Medium                  |

### Industry Trend: Assistive AI, Not Replacement AI

PAR (Psychological Assessment Resources), the leading assessment publisher, reports that in 2026:

- AI is moving from "experimental pilots to everyday workflows"
- The emphasis is on **assistive AI** -- tools that enhance clinician efficiency while reinforcing the clinician's role as decision-maker
- Focus areas: explainability, bias mitigation, integration with established platforms
- PAR's AI Report Writer already saves early adopters an average of 6 hours per week

### Young Lives Foundation (Turkey) -- Directly Relevant to Renkioo

The Young Lives Foundation (Turkiye) developed an AI-powered child drawing analysis model specifically based on the Draw-a-Person Test, presented at ICTurkiye 2025 International Brokerage Event.

**Their approach:**

- Evaluates children's emotional, cognitive, and developmental characteristics
- Uses criteria: anatomical completeness, proportionality, level of detail, pressure/clarity of lines, spatial placement
- Interprets indicators based on the child's age and developmental stage
- Combines traditional DAP evaluation criteria with thousands of hand-analyzed illustrations collected by psychologists during fieldwork
- Designed as a scalable, evidence-based tool for preventive and responsive psychological interventions

**Relevance to Renkioo:** This is essentially a Turkish competitor or potential partner working on the exact same problem domain.

---

## Topic 2: Best Practices in Projective Drawing Tests

### Overview of Major Drawing Tests

| Test          | Full Name                                         | Primary Use                       | Age Range            | Admin Time |
| ------------- | ------------------------------------------------- | --------------------------------- | -------------------- | ---------- |
| **DAP**       | Draw-a-Person                                     | Cognitive/developmental screening | 5-11 years (primary) | 5-15 min   |
| **DAP:IQ**    | Draw-a-Person Intellectual Ability                | IQ estimation                     | Children to adults   | 5-15 min   |
| **DAP:SPED**  | DAP Screening Procedure for Emotional Disturbance | Emotional screening               | 6-17 years           | 5-15 min   |
| **HTP**       | House-Tree-Person                                 | Personality assessment            | All ages             | 15-30 min  |
| **KFD**       | Kinetic Family Drawing                            | Family dynamics                   | 5-20 years           | 10-20 min  |
| **Koppitz-2** | Koppitz Developmental Scoring System              | Visual-motor integration          | 5-85+ years          | 5-10 min   |
| **S-HTP**     | Synthetic House-Tree-Person                       | Anxiety screening                 | All ages             | 10-15 min  |
| **DAFPT**     | Draw-a-Family Picture Test                        | Family perceptions                | Children             | 10-20 min  |

### Screening vs. Comprehensive Assessment

#### Quick Screening

- **Purpose:** Identify whether there is a potential concern requiring further investigation
- **Characteristics:** Brief, inexpensive, easy to administer, not diagnostic
- **Tools:** PSC-17, SDQ, Vanderbilt Assessment Scale, single drawing tests (DAP)
- **Key principle:** "Screenings are fast, inexpensive, and easy to administer -- but they are not diagnostic on their own"
- **Follow-up:** A positive screen triggers recommendation for comprehensive assessment

#### Comprehensive Assessment

- **Purpose:** Complete clinical picture, diagnosis, and treatment recommendations
- **Characteristics:** Multi-domain, multiple informants, time-intensive
- **Tools:** Full test batteries, clinical interviews, behavioral observations, multiple drawing tests
- **Domains covered:** Depression, anxiety, ADHD, learning disabilities, autism spectrum, trauma, personality, environmental factors

#### Critical Insight for Renkioo

**A single drawing test is a SCREENING tool, not a diagnostic tool.** The DAP test is described by experts as "primarily a screening device, most effective for children aged 5 to 11 years." Expert consensus is: "Use them as part of a larger assessment that includes structured tools, interviews, and observations for more reliable results."

### Multi-Test Battery Approach vs. Single Test

**Why batteries are preferred:**

- A single test may not provide enough information to answer complex referral questions
- Batteries help clinicians identify **patterns** across various tasks
- Multiple perspectives (cognitive, emotional, personality, social) provide convergent validity
- Example: A decline in both memory and attention may suggest neurological impairment, while a deficit in one area could point to something different

**Limitations of batteries:**

- Time-consuming and exhausting for patients
- Not all patients have stamina to complete entire batteries
- May not address specific referral questions
- More expensive and require more training

**Best practice for Renkioo's context (parent-facing app):**

- Use a **quick screening** approach with a single drawing test (DAP or free drawing)
- Frame results as **observations** and **areas to explore**, not diagnoses
- Offer optional additional drawing tasks (HTP, KFD) for deeper insight
- Always recommend professional follow-up for concerning findings

### Scoring Systems: Objective vs. Subjective

**Objective/Quantitative Scoring:**

- DAP:IQ uses 23 specific indicators for feature selection
- DAP:SPED provides more standardized emotional disturbance screening
- S-HTP identifies 26 anxiety-related drawing features scored as 0/1
- Koppitz-2 provides standard scores, percentile ranks, and age equivalents

**Subjective/Qualitative Scoring:**

- Traditional HTP relies on 350-page manual by John Buck
- Highly dependent on examiner training and experience
- Low inter-rater reliability -- a major criticism of projective tests
- "Instructions given, questions asked, and interpretations made are flexible, making it difficult to compare results between children"

**Key criticism:** "Low reliability, lack of standard scoring, and examiner subjectivity can affect the accuracy of results"

**Implication for AI:** AI-based scoring actually **addresses** the main criticism of projective tests (subjectivity) by providing consistent, standardized analysis. This is a strong selling point.

### Digital Era Considerations

A 2025 systematic review in the journal _Children_ examined construction projective techniques in clinical settings for ages 4-18 (studies from 2010-2024), finding growing research into digital administration but limited adoption of fully computerized scoring.

Key digital challenges:

- Reproducing the tactile experience of drawing (pressure sensitivity, paper texture)
- Capturing drawing process (order, hesitation, erasures) vs. just final product
- Ensuring digital medium doesn't alter drawing behavior
- Maintaining test standardization across different devices

---

## Topic 3: UX/UI for Psychological Assessment Apps

### Core Design Principles for Mental Health Apps

#### 1. Emotional Sensitivity First

- Soft tones and minimal interfaces reduce anxiety
- Empathetic copy and flexible flows are crucial
- "Emotional design involves crafting interactions that make users feel understood, valued, and delighted"
- Never pressure users; use opt-in personalization

#### 2. Reduce Cognitive Load

- "Make mood tracking nearly invisible, then surface insights in a clean dashboard that shows patterns, not noise"
- Assessment tests should feel effortless, not clinical
- Minimize required inputs; gather context progressively

#### 3. Privacy as a Core Feature

- HIPAA/GDPR compliance is table stakes
- Transparent data collection practices
- Clear guidelines for crisis support
- User control over data deletion

#### 4. Progressive Disclosure for Results

This is CRITICAL for Renkioo's drawing analysis results presentation:

**Level 1 - Summary:** High-level overview (emoji/color indicator + one-sentence summary)
**Level 2 - Details:** Expandable sections with specific observations
**Level 3 - Deep Dive:** Full analysis report with educational context

**Design rules:**

- Keep disclosure levels below 3 with clear navigation
- Start with the most important information on the surface
- Use expandable/collapsible sections for deeper content
- Tabs for different analysis dimensions (emotional, cognitive, social)
- Tooltips for psychological terminology

### Presenting Results to Non-Clinical Parents

#### Best Practices (from school psychology and clinical feedback research):

1. **Strengths-Based Approach:** "A good report should emphasize what the child CAN DO, as well as areas where they may need support"
2. **Whole-Child Snapshot:** Include information from multiple sources, not just numbers
3. **Avoid Technical Jargon:** "Language that is too technical can make the assessment hard for non-professionals to understand"
4. **Actionable Recommendations:** Every observation should have a "what you can do" follow-up
5. **Normalize Variations:** Help parents understand that variation is normal
6. **Dual Reports:** In school settings, experts recommend two versions -- one for professionals, one for parents/families in accessible language
7. **Interactive Feedback:** Allow parents to ask questions about results (Renkioo's chatbot feature is perfect for this)

#### What NOT To Do

- Never present raw scores without context
- Never use diagnostic labels ("your child shows signs of depression")
- Never present findings without normative comparison ("this is typical for age X")
- Never overwhelm with too many data points at once

### Child Development Tracking App Features (2025-2026)

From a review of successful child development apps (Kinedu, CDC Milestone Tracker, etc.):

**Must-have features:**

- Simple, intuitive interface with minimal learning curve
- Soft, calming colors
- One-handed use capability
- Accessibility features (voice commands, large touchpoints)
- Dark mode
- Progress tracking and milestone visualization
- AI-based analytics and personalized recommendations
- Multi-user access (both parents)
- Interactive media (storytelling, video, games)

**Engagement strategies:**

- Interactive media and progress tracking are the two key retention drivers
- Dual-user apps (parent + child) show higher engagement
- Personalized content based on child's age and developmental stage

### Retention Crisis in Mental Health Apps

**Alarming statistics:**

- ~4% of users continue using a mental health app after 15 days
- ~3% continue after 30 days
- More popular apps receive better UX ratings but UX alone does not predict sustained engagement

**Implication for Renkioo:** The drawing analysis feature should be designed for **repeat use** with clear value demonstrated each time. Show progression over time, new insights with each drawing, and maintain novelty.

### Aiberry Case Study: Gold Standard for AI Mental Health Screening

Aiberry is the most clinically validated AI mental health screening platform and provides a model for Renkioo:

**What they did right:**

- Collaborated with UT Austin, Georgetown University, and University of Arizona for clinical validation
- Multi-modal analysis (text, audio, video cues)
- Demonstrated clinical equivalence to gold-standard depression questionnaires
- No evidence of bias related to gender, age, or race
- Clear positioning: "Aiberry provides the nuance clinicians need that gold-standard forms lack"

**What Renkioo can learn:** Clinical partnerships and validation studies, even small ones, dramatically increase credibility and trust.

---

## Topic 4: Ethical & Clinical Considerations

### APA Ethical Guidance for AI (June 2025)

The American Psychological Association released comprehensive guidance in June 2025 titled "Ethical Guidance for AI in the Professional Practice of Health Service Psychology." Key principles:

#### 1. Informed Consent & Transparency

- Patients/users must understand "every aspect of their care, including when and how AI tools are involved"
- Transparency is framed as "respect for patient autonomy," not mere procedure
- If AI scribes write notes or AI guides treatment decisions, explicit informed consent is needed

#### 2. Clinical Judgment Primacy

- "AI should augment, not replace, clinical judgment"
- Clinicians must maintain "conscious oversight" for AI-generated content
- Professional reasoning must remain central to records and decisions

#### 3. Accuracy & Validation

- "Critical evaluation of AI outputs" is an ethical obligation
- Clinical documentation becomes part of permanent records -- accuracy prevents harm
- Tools must be validated before clinical deployment

#### 4. Bias Vigilance

- Practitioners must remain "vigilant about how AI tools may differentially impact various populations"
- Advocate for tools tested across diverse groups
- Monitor for potential biases in outputs

#### 5. Human Oversight

- Technology should "enhance, rather than compromise, the quality of care"
- The therapeutic relationship must remain "a sanctuary" where AI serves only supportive functions

#### 6. Competence & Accountability

- Clinicians bear responsibility for understanding tools they use
- Ongoing professional development is required as AI tools evolve

### Specific Ethical Concerns for AI Drawing Analysis

#### 1. Assessment Basis

APA Ethics Code Standard 9.01b states that psychologists provide opinions of psychological characteristics "only after they have conducted an examination adequate to support their statements." An AI analyzing a single uploaded drawing does NOT meet this standard for clinical assessment.

#### 2. Automated Scoring Responsibility

"The psychologist conducting the assessment retains ultimate responsibility for what the report contains. The use of an automated service does not in any manner attenuate a psychologist's responsibility."

**Implication for Renkioo:** The app CANNOT position itself as providing psychological assessment. It must be framed as educational insight, developmental observation, or screening suggestion.

#### 3. Passive Screening Ethics

"Prior to implementation of psychological assessment via social media machine learning, the field must first consider whether it is ethical to consider passive screening tactics an adequate basis for assessment."

**Relevance:** Renkioo's approach (parent actively uploads drawing with context) is more ethical than passive screening, but still requires disclaimers.

### Recommended Disclaimer Framework for Renkioo

Based on competitor analysis and ethical guidelines, Renkioo should include:

**Tier 1 - Prominent (shown before every analysis):**

> "This analysis provides developmental observations based on AI pattern recognition and child psychology research. It is NOT a clinical diagnosis or psychological assessment. It is designed for educational and informational purposes only."

**Tier 2 - Results page:**

> "Every child is unique. Drawing characteristics can be influenced by many factors including mood, environment, materials used, and recent experiences. These observations are starting points for understanding, not conclusions."

**Tier 3 - Concerning findings:**

> "If you have concerns about your child's development or emotional well-being, we recommend consulting a qualified child psychologist or pediatrician. This tool is designed to support, not replace, professional guidance."

### JMIR Review: AI Apps for Child Mental Health (2025)

A comprehensive review published in JMIR mHealth and uHealth in 2025 examined 27 AI-based mobile apps for child mental health:

**Key findings:**

- 3 functional categories: chatbots (15 apps), journal logging (9 apps), psychotherapeutic treatment (3 apps)
- 74% used NLP technology
- Average MARS quality score: 3.45/5.0 (indicating need for improvement)
- **Only 2 out of 27 apps had undergone clinical trials** -- a major gap
- Average subscription cost: $20.16/month for paid apps (20 of 27 were paid)
- Only 7 apps (26%) were free to use

**Critical conclusion:** "AI-based mental health apps hold significant potential but face critical limitations in design, accessibility, and validation. Future development should focus on integrating child-centric design principles, ensuring affordability, and prioritizing rigorous clinical testing."

### Key Ethical Challenges Summary

| Challenge                            | Description                                          | Renkioo Mitigation                                               |
| ------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------- |
| **Misdiagnosis risk**                | Parents may over-interpret AI findings               | Use observational language, never diagnostic labels              |
| **False reassurance**                | "No concerns" result may delay needed intervention   | Always note limitations, encourage professional check-ups        |
| **Cultural bias**                    | Drawing norms vary across cultures                   | Train on diverse dataset, acknowledge cultural context           |
| **Age-inappropriate interpretation** | Applying adult psychological frameworks to children  | Age-adjusted analysis with developmental norms                   |
| **Data privacy**                     | Children's psychological data is extremely sensitive | Encryption, local processing where possible, clear data policies |
| **Over-reliance**                    | Parents substituting app for professional help       | Consistent messaging about app as "starting point"               |
| **Consent**                          | Children cannot consent to psychological screening   | Ensure parent consent, child-friendly framing                    |

---

## Competitor Analysis

### Direct Competitors

#### 1. ChildDrawingAnalysis.com

- **Type:** Web-based service
- **Approach:** Upload drawing + context questions -> AI analysis
- **Pricing:** Free (with social share), $1 (minimum), $3 (standard), $5.47 (cost-coverage). Planning subscription model.
- **Technology:** "Trained on a vast dataset of children's drawings, analyzed by child psychology experts"
- **Disclaimer:** "Educational and entertainment purposes only"
- **Weakness:** Generic FAQ responses, no detailed methodology transparency, no mobile app
- **Threat level to Renkioo:** LOW-MEDIUM (web only, no ecosystem)

#### 2. ChildArtLab.com

- **Type:** Web-based service
- **Approach:** Upload drawing + context -> psychological analysis (savable as PDF)
- **Pricing:** Intro $0.29, Light $0.99/mo (3 analyses, 1 child), Family $1.99/mo (10 analyses, 3 children), Pro $4.99/mo (50 analyses, unlimited children)
- **Psychological basis:** Carl Jung (unconscious expression), Karen Machover (DAP), Cathy Malchiodi (art therapy)
- **Features:** Identifies anxiety/stress/fears, family attitudes, emotional tension; analyzes color, lines, placement, composition
- **Disclaimer:** "Results are just a guideline, not professional diagnosis"
- **Privacy:** Encrypted data, no third-party sharing, user-deletable
- **Threat level to Renkioo:** MEDIUM (affordable, structured plans, but web only)

#### 3. Kidzo App (iOS)

- **Type:** Native mobile app
- **Approach:** AI analysis informed by child psychology concepts
- **Pricing:** Premium subscription (monthly/yearly) for full features
- **Features:** AI drawing analysis (colors, shapes, symbols), emotional insights, art gallery/timeline, privacy-focused
- **Premium includes:** Full emotional insight reports, unlimited analyses, extended history, advanced psychological symbol detection
- **Threat level to Renkioo:** MEDIUM-HIGH (mobile native, subscription model, similar feature set)

#### 4. crAion App (iOS)

- **Type:** Native mobile app
- **Approach:** AI-powered drawing analysis for hidden meanings and emotions
- **Status:** Some technical issues reported by users
- **Threat level to Renkioo:** LOW (technical quality issues)

#### 5. AI Kid Draw Analysis (Android - Google Play)

- **Type:** Native mobile app
- **Approach:** Upload drawing for psychological meaning analysis
- **Threat level to Renkioo:** LOW (Android only, limited features)

#### 6. Artalyze (iOS)

- **Type:** Native mobile app
- **Approach:** Expert analysis with child psychology insights
- **Claims:** "Supportive guidance from child psychology experts"
- **Threat level to Renkioo:** LOW-MEDIUM

#### 7. ChildArt.net

- **Type:** Web-based (built on Bubble.io -- currently down/redirecting)
- **Approach:** AI analysis for children's drawings
- **Status:** Appears to be non-functional
- **Threat level to Renkioo:** NEGLIGIBLE

### Indirect Competitors / Adjacent Players

#### 8. Young Lives Foundation (Turkey)

- **Type:** NGO / Research project (not commercial app)
- **Approach:** AI model based on DAP test for rapid psychosocial assessment
- **Method:** Combines traditional DAP criteria with hand-analyzed illustrations from fieldwork
- **Presented at:** ICTurkiye 2025 International Brokerage Event
- **Significance:** Operating in the same country/market as Renkioo
- **Threat/Opportunity:** Could be a PARTNER rather than competitor

#### 9. Aiberry

- **Type:** Clinical AI platform (mental health screening)
- **Not drawing-specific** but sets the standard for AI mental health assessment
- **Key differentiator:** Clinical validation with UT Austin, Georgetown, University of Arizona
- **Relevance:** Model for how to validate and position AI screening tools

### Competitive Landscape Summary

| Competitor           | Platform            | Price           | Drawing Types     | Multi-Child | Timeline/History | AI Chatbot | Integrated Ecosystem                 |
| -------------------- | ------------------- | --------------- | ----------------- | ----------- | ---------------- | ---------- | ------------------------------------ |
| ChildDrawingAnalysis | Web                 | $0-5.47/drawing | Free drawing      | No          | No               | No         | No                                   |
| ChildArtLab          | Web                 | $0.29-4.99/mo   | Free drawing      | Yes (Pro)   | No               | No         | No                                   |
| Kidzo                | iOS                 | Subscription    | Free drawing      | Unknown     | Yes              | No         | No                                   |
| crAion               | iOS                 | Unknown         | Free drawing      | Unknown     | Unknown          | No         | No                                   |
| AI Kid Draw          | Android             | Unknown         | Free drawing      | Unknown     | No               | No         | No                                   |
| **Renkioo**          | **iOS+Android+Web** | **TBD**         | **Free + Guided** | **Yes**     | **Yes**          | **Yes**    | **Yes (Stories, Coloring, Chatbot)** |

### Renkioo's Competitive Advantages

1. **Cross-platform:** Only true cross-platform solution (iOS + Android + Web)
2. **Integrated ecosystem:** Drawing analysis is part of a larger child development platform (stories, coloring, chatbot)
3. **Multi-child support:** Built into the architecture from the start
4. **AI chatbot:** No competitor offers follow-up conversation about results
5. **Turkish market knowledge:** Local language, cultural understanding, potential partnership with Young Lives Foundation
6. **Professional tier:** No competitor offers a clinician-facing version
7. **Longitudinal tracking:** Can track development across multiple drawings over time

---

## Recommendations for Renkioo

### 1. Quick Analysis System Design

Based on all research findings, the ideal quick analysis system for Renkioo should follow this architecture:

#### Step 1: Drawing Capture (30 seconds)

- Photo upload from camera/gallery
- Optional: In-app drawing canvas (captures process data: stroke order, pressure, hesitations)
- Auto-detect if image contains a drawing vs. photo

#### Step 2: Context Collection (30-60 seconds)

- Child selector (already built in Renkioo)
- Drawing prompt: "What did your child draw?" (free drawing / person / family / house-tree-person)
- Optional: "Was there anything special happening today?" (1-2 sentence context)
- Child's mood before drawing (emoji picker -- ties into IooEmotionCheckIn)

#### Step 3: AI Analysis (10-30 seconds processing)

Use a **layered analysis approach:**

**Layer A - Vision Analysis (GPT-4V or equivalent):**

- Object identification (what is drawn)
- Spatial analysis (placement, size relationships)
- Color analysis (palette, dominance, absence of expected colors)
- Detail level (age-appropriate complexity assessment)
- Line quality (pressure, consistency, confidence)

**Layer B - Psychological Pattern Matching:**

- Compare identified features against DAP scoring criteria
- Match against age-normalized developmental expectations
- Flag potential indicators using published psychological frameworks (Koppitz, Machover, Malchiodi)
- Cross-reference with child's historical drawings for changes

**Layer C - Contextual Integration:**

- Factor in child's age, gender, cultural context
- Consider provided mood/situation context
- Compare against child's own baseline (longitudinal analysis)

#### Step 4: Results Presentation (Progressive Disclosure)

**Screen 1 - Summary Card (always shown):**

```
[Observation Icon] Drawing Insights for [Child Name]
[Date] | Age: [X years, Y months]

Overall: "Your child's drawing shows [age-appropriate / rich / developing]
         expression with [key positive observation]."

[3 insight chips: "Creative Expression" | "Emotional Awareness" | "Detail-Oriented"]

[See Full Analysis ->]
```

**Screen 2 - Detailed Observations (expandable sections):**

```
Developmental Observations
  - Body awareness: [observation + age context]
  - Spatial organization: [observation]
  - Detail richness: [observation]

Emotional Expression
  - Color choices: [observation]
  - Character expressions: [observation]
  - Overall mood of drawing: [observation]

Creative Elements
  - Imagination indicators: [observation]
  - Unique elements: [observation]

[Compare with Previous Drawings ->]
[Talk to Ioo about this ->]    (opens chatbot)
[Share with Professional ->]   (generates PDF report)
```

**Screen 3 - Timeline View (for returning users):**

- Visual progression of analysis themes over time
- Growth indicators
- Highlighted changes or patterns

### 2. Language & Framing Guidelines

**ALWAYS use:**

- "Observations" not "findings"
- "May suggest" not "indicates"
- "Typical for this age" not "normal"
- "Areas to explore" not "concerns"
- "Your child's unique expression" not "results"
- "Developmental snapshot" not "assessment"

**NEVER use:**

- Diagnostic labels (anxiety, depression, ADHD)
- Clinical severity terms (mild, moderate, severe)
- Definitive statements ("your child is...")
- Comparison to other children ("below average")
- Alarming language without immediate support resources

### 3. Technical Architecture Recommendations

**AI Pipeline:**

1. Image preprocessing (orientation correction, background removal, enhancement)
2. GPT-4V (or Claude Vision) for primary analysis with structured prompt
3. Custom scoring model for DAP-specific features (train on labeled dataset)
4. Age-normalization layer (adjust all outputs for child's developmental stage)
5. Longitudinal comparison engine (compare against child's own history)
6. Report generation with progressive disclosure templates

**Prompt Engineering Strategy:**

- Create structured analysis prompts that output JSON with specific fields
- Include developmental psychology frameworks in the system prompt
- Require the AI to always note limitations and alternative explanations
- Force age-contextualization for every observation
- Require strengths-first ordering of observations

### 4. Ethical Implementation Checklist

- [ ] Prominent disclaimer before every analysis
- [ ] Never use diagnostic language in any output
- [ ] Always provide professional referral resources for concerning findings
- [ ] Implement age-appropriate interpretation (don't apply adult frameworks to children)
- [ ] Train AI on diverse, cross-cultural dataset (critical for Turkey's diverse population)
- [ ] Allow parents to contest/flag analysis results
- [ ] Encrypt all drawing data at rest and in transit
- [ ] Offer local-only processing option for privacy-conscious users
- [ ] Clear data retention and deletion policies
- [ ] Informed consent flow before first analysis
- [ ] Regular bias audits of AI outputs across demographics

### 5. Differentiation Strategy

**Short-term (0-3 months):**

- Launch quick analysis with free drawing + DAP-style guided drawing
- Progressive disclosure results with Ioo mascot presenting findings
- Basic longitudinal tracking (show change over time)
- Chatbot integration for follow-up questions

**Medium-term (3-6 months):**

- Add HTP and KFD guided drawing prompts (multi-test approach)
- Professional tier for clinicians with detailed scoring
- Partner with 1-2 Turkish universities for validation study
- Cultural adaptation (Turkish family dynamics, school contexts)

**Long-term (6-12 months):**

- In-app drawing canvas with process capture (stroke order, pressure, timing)
- Multi-informant integration (parent observations + drawing analysis)
- Norm tables built from Renkioo's own anonymized dataset
- API for integration with school counseling platforms
- Explore partnership with Young Lives Foundation

### 6. Pricing Recommendation

Based on competitor analysis:

| Tier             | Price      | Analyses/Month | Features                                       |
| ---------------- | ---------- | -------------- | ---------------------------------------------- |
| Free             | $0         | 1              | Basic summary only                             |
| Plus             | ~$2-3/mo   | 5              | Full analysis + history + chatbot              |
| Family           | ~$5-6/mo   | 15             | Multi-child + PDF reports + timeline           |
| Pro (Clinicians) | ~$15-20/mo | Unlimited      | Professional scoring + batch analysis + export |

Current competitors are underpricing (often $0-5/mo) because they offer only drawing analysis. Renkioo's integrated ecosystem (stories + coloring + analysis + chatbot) justifies premium pricing within the family tier.

---

## Sources

### Academic Papers & Research

- [From Crayons to Code: AI-Driven Insights into a Child's Mental Health (AAAI 2025)](https://ojs.aaai.org/index.php/AAAI/article/view/35160)
- [DrawAA-Net: An AI-Supported Evaluation Tool for Children's Drawings (AIED 2025)](https://link.springer.com/chapter/10.1007/978-3-031-98414-3_22)
- [Deep Learning-Based Draw-a-Person IQ Screening (MDPI 2025)](https://www.mdpi.com/2504-2289/9/7/164)
- [Generating Psychological Analysis Tables for Children's Drawings Using Deep Learning (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S0169023X2300126X)
- [AI-Driven Classification of Children's Drawings for Pediatric Psychological Evaluation (ResearchGate)](https://www.researchgate.net/publication/391699915)
- [Learning from Children's Drawings (Stanford 2024)](https://news.stanford.edu/stories/2024/02/learning-childrens-drawings)
- [Detecting Children's Fine Motor Skill Development Using ML (Springer)](https://link.springer.com/article/10.1007/s40593-021-00279-7)
- [Projective Techniques in the Digital Era -- Systematic Review (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12025577/)
- [Children's Drawings: Evidence-Based Research and Practice (Frontiers)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1250556/full)
- [AuDrA: An Automated Drawing Assessment Platform (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11133150/)
- [AI-Based Mobile Phone Apps for Child Mental Health: Comprehensive Review (JMIR 2025)](https://mhealth.jmir.org/2025/1/e58597)
- [Development of a Scoring System for the Kinetic HTP (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S1569186111000313)
- [A Children's Mental Health Detection Model by Drawing Analysis (ResearchGate)](https://www.researchgate.net/publication/381352877)
- [Ethical Challenges and Strategic Responses to AI in Psychological Assessment (Springer)](https://link.springer.com/article/10.1007/s43681-025-00788-4)
- [The AI-Driven Age Detection in Children's Drawings (ResearchGate)](https://www.researchgate.net/publication/385017726)

### Ethical Guidelines & Standards

- [APA Ethical Guidance for AI in Professional Practice (June 2025)](https://www.apa.org/topics/artificial-intelligence-machine-learning/ethical-guidance-professional-practice.pdf)
- [APA Guidelines for Psychological Assessment and Evaluation](https://www.apa.org/about/policy/guidelines-psychological-assessment-evaluation.pdf)
- [APA's New Ethical Guidance: A Clinician's Perspective (Videra Health)](https://www.viderahealth.com/2025/07/03/apa-ai-ethical-guidance-clinician-perspective/)
- [Ethical Use of AI in Psychology (PAR)](https://www.parinc.com/learning-center/par-blog/detail/blog/2025/06/04/the-ethical-use-of-ai-in-psychology--how-can-psychologists-save-time-with-ai)
- [Considerations for Ethical Implementation of Psychological Assessment via ML (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8261642/)
- [Ethical Considerations for Using AI in Psychological Testing (Psico-Smart)](https://psico-smart.com/en/blogs/blog-ethical-considerations-of-using-ai-in-psychological-testing-164502)
- [Regulating AI in Mental Health: Ethics of Care (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11450345/)
- [Making AI Safe for Mental Health Use (Psychology Today)](https://www.psychologytoday.com/us/blog/experimentations/202506/making-ai-safe-for-mental-health-use)

### UX/UI & App Design

- [Mental Health App Development Guide 2026 (TopFlight Apps)](https://topflightapps.com/ideas/how-to-build-a-mental-health-app/)
- [Best Practices in Mental Health App Design (Biz4Group)](https://www.biz4group.com/blog/best-practices-in-mental-health-design)
- [Mental Health UX in Healthcare (Number Analytics)](https://www.numberanalytics.com/blog/mental-health-ux-in-healthcare)
- [Progressive Disclosure in UX (Interaction Design Foundation)](https://www.interaction-design.org/literature/topics/progressive-disclosure)
- [Progressive Disclosure Types and Use Cases (LogRocket)](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/)
- [Mobile Apps for Children's Health and Wellbeing (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10785842/)
- [Quality of Mobile Apps for Child Development Support (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9682452/)
- [mHealth Solutions for Mental Health Screening: User Perspectives (Frontiers)](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2022.857304/full)
- [User Experience, Engagement, and Popularity in Mental Health Apps (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8844980/)

### Competitor & Industry

- [ChildDrawingAnalysis.com](https://childdrawinganalysis.com/)
- [ChildDrawingAnalysis Pricing](https://childdrawinganalysis.com/page/pricing/)
- [ChildArtLab.com](https://childartlab.com/)
- [Kidzo App (iOS)](https://apps.apple.com/us/app/kidzo-kids-draw-psychology/id6755327024)
- [crAion App (iOS)](https://apps.apple.com/us/app/craion-kids-drawings-analysis/id6473756867)
- [AI Kid Draw Analysis (Android)](https://play.google.com/store/apps/details?id=com.kiddrawanalysis&hl=en)
- [Artalyze App (iOS)](https://apps.apple.com/us/app/artalyze-drawing-analysis/id6479255398)
- [Aiberry Mental Health Platform](https://www.aiberry.com/)
- [Aiberry Clinical Validation Study](https://www.aiberry.com/news/landmark-study-demonstrates-clinical-validation-of-aiberry-ai-powered-mental-health-assessments)
- [Young Lives Foundation AI Drawing Analysis (ICTurkiye 2025)](https://b2match.com/e/icturkiye-2025-international-brokerage/opportunities/UGFydGljaXBhdGlvbk9wcG9ydHVuaXR5OjE1NDM1NA==)
- [Emerging Trends in Psychological Assessment for 2026 (PAR)](https://www.parinc.com/learning-center/par-blog/detail/blog/2025/10/28/emerging-trends-in-psychological-assessment-for-2026)

### Assessment Tools & Standards

- [DAP:IQ -- Draw-A-Person Intellectual Ability Test (PRO-ED)](https://www.proedinc.com/Products/10695/dapiq-drawaperson-intellectual-ability-test.aspx)
- [Koppitz-2 Scoring System (Pearson)](https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Cognition-&-Neuro/Koppitz-Developmental-Scoring-System-for-the-Bender-Gestalt-Test-|-Second-Edition/p/100000475.html)
- [Draw-A-Person Test Overview (Wikipedia)](https://en.wikipedia.org/wiki/Draw-a-Person_test)
- [Benefits of DAP Test in Occupational Therapy (Your Therapy Source)](https://www.yourtherapysource.com/blog1/2025/01/03/draw-a-person-test/)
- [Screening vs. Assessment: APA Guidance](https://www.apaservices.org/practice/reimbursement/billing/assessment-screening)
- [Clinical Practice Guidelines for Assessment of Children (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6345125/)
- [Psychological Assessment of Children (Yale Medicine)](https://www.yalemedicine.org/conditions/pediatric-psychological-assessment)

### Feedback & Result Presentation

- [Assessment Feedback With Parents and Preadolescent Children (Therapeutic Assessment)](https://www.therapeuticassessment.com/docs/Tharinger_Finn_Hersh_Wilkinson_Christopher_Tran_2008.pdf)
- [How to Talk to Parents about Psychoeducational Assessments (Linden Education)](https://www.linden-education.com/post/how-to-talk-to-parents-about-psychoeducational-assessments)
- [Psychological Assessment in School Contexts: Ethical Issues (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11335701/)

---

_Report compiled: February 2026_
_For internal use by Renkioo product team_
