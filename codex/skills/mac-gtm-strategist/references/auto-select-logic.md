# Auto-Select Logic — GTM Strategist

> This document defines how the skill maps user problems to frameworks automatically in Auto Mode.
> Domain detection: auto-select B2B or B2C routing based on business model in §4 Q5.
> If business model is ambiguous, check for B2B signals (enterprise, SaaS, buying committee) vs
> B2C signals (consumer, DTC, subscription, retail) in the problem description.

---

## B2B Problem-to-Framework Routing Map

### "We don't know why we're winning or losing deals"
→ **B2B Win/Loss Analysis** (#11)
→ Follow-on: Messaging Architecture, April Dunford Positioning

### "Our growth has stalled / we're not growing"
→ **AARRR Pirate Metrics** (#1) — to find the constraint
→ If constraint identified: **Growth Loops** (#2) or **GTM Motions** (#3)

### "We need to rethink our positioning" / "How do we differentiate?"
→ **April Dunford 5-Step Positioning** (#12)
→ Follow-on: Positioning Statement (#17), Messaging Architecture (#16)

### "We need to write our messaging" / "What's our value prop?"
→ **Value Proposition Canvas** (#18) — if exploratory
→ **Messaging Architecture** (#16) — if positioning is known
→ **Positioning Statement** (#17) — if they need a crisp, testable statement

### "Who should we be selling to?" / "We need to define our ICP"
→ **ICP + Buying Committee** (#4)
→ Follow-on: STP (#28), ABM (#30)

### "Should we go product-led or sales-led?"
→ **GTM Motions** (#3) → **PLG/Hybrid PLG** (#7)
→ Pre-check: **Product-Market Fit Diagnostic** (#8)

### "How big is our market?" / "We need a TAM slide"
→ **TAM/SAM/SOM** (#29)
→ ⚠️ Research prompt required

### "Who are our competitors and how do we win?"
→ **Competitive Strategy Deep Dive** (#22)
→ ⚠️ Research prompt required
→ Follow-on: April Dunford Positioning (#12), Win/Loss (#11)

### "We need to design a demand gen program"
→ **Marketing Revenue Funnel Model** (#6)
→ If ABM: **ABM Framework** (#30)
→ If outbound: **Outbound Prospecting Architecture** (#32)

### "We need to set our OKRs / quarterly goals"
→ **OKRs** (#39)
→ Pre-check: **North Star Metric + Driver Tree** (#38)

### "We're not sure if we have product-market fit"
→ **Product-Market Fit Diagnostic** (#8)
→ Follow-on: GTM Stage Model (#9), GTM Motions (#3)

### "We need a company story / investor narrative"
→ **Corporate Narrative / Master Story** (#14) — for website, sales decks
→ **Investor Narrative** (#36) — specifically for investor/board context

### "We need to understand the macro environment / do a market scan"
→ **PESTLE** (#25) or **STEEPLE** (#27)
→ ⚠️ Research prompt required

### "We need to understand our industry structure"
→ **Porter's Five Forces** (#26)
→ ⚠️ Research prompt required

### "We're trying to create a new category"
→ **Category Design** (#21)
→ ⚠️ Research prompt required
→ Pre-work: TAM/SAM/SOM (#29), Porter's Five Forces (#26)

### "We need to prioritize our roadmap / initiatives"
→ **Prioritization: RICE/ICE/MoSCoW** (#41)

### "We need to fix our pricing"
→ **Pricing Strategy** (#40)

### "We need to think about expansion / land and expand"
→ **Land and Expand Architecture** (#5)
→ Pre-check: ICP + Buying Committee (#4)

### "We're struggling with attribution / measuring ROI"
→ **Attribution Lenses** (#35)
→ Pre-check: Marketing Revenue Funnel Model (#6)

### "We need to organize our RevOps / align marketing and sales"
→ **Revenue Operations Operating Model** (#42)

### "We're doing scenario planning / stress-testing"
→ **Scenario Planning / Risk Matrix** (#43)

### "We need to understand our customers better"
→ **JTBD** (#15) — if exploring unmet needs
→ **VOC Thematic Analysis** (#19) — if synthesizing existing customer data
→ **Gartner Customer Journey / B2B Buying Journey** (#45) — if mapping how buyers move through a complex purchase decision

### "We need to build a case study / customer proof asset"
→ **Gartner Customer Proof / Case Study Framework** (#46)
→ Follow-on: Corporate Narrative (#14), Gartner Brand Marketing (#44)

### "We need to build our marketing plan / annual marketing strategy"
→ **Gartner Marketing Strategic Planning Framework** (#48)
→ Pre-check: OKRs (#39), North Star Metric (#38)
→ Follow-on: Gartner Go-To-Market Strategy (#47)

### "We need to align our GTM model to revenue execution"
→ **Gartner Go-To-Market Strategy Framework** (#47)
→ If already have GTM basics: compare vs **GTM Motions** (#3) — Gartner is better for enterprise/mature companies
→ Follow-on: Gartner Marketing Strategic Planning (#48), ABM (#30)

### "We need product positioning — Gartner-aligned" / "We're working with Gartner analysts"
→ **Gartner Product Positioning Framework** (#51)
→ Follow-on: Gartner Messaging & Positioning (#49), Gartner Product Marketing (#50)

### "We need to improve our product marketing function / PMM team"
→ **Gartner Product Marketing Framework** (#50)
→ Follow-on: Gartner Messaging & Positioning (#49), Messaging Architecture (#16)

### "We need to strengthen our brand" / "How do we measure brand health?"
→ **Gartner Brand Marketing Framework** (#44)
→ Follow-on: Corporate Narrative (#14), Gartner Marketing Strategic Planning (#48)

### Gartner vs. Classic Framework Selector
When the user is in an enterprise context, works with analysts, or explicitly mentions Gartner methodology, prefer Gartner frameworks:
- Positioning → Gartner Product Positioning (#51) over April Dunford (#12) — or run both in sequence
- GTM strategy → Gartner GTM Strategy (#47) over GTM Motions (#3) for mature companies
- Marketing planning → Gartner Marketing Strategic Planning (#48) over OKRs (#39) alone
- Messaging → Gartner Messaging & Positioning (#49) alongside Messaging Architecture (#16)

### "We need a messaging/positioning workbook" / "Build me a messaging workbook"
→ **Messaging Architecture** (#16) → apply `messaging-positioning-workbook` template
→ If positioning is undefined: start with **April Dunford 5-Step Positioning** (#12) first
→ If user wants the full Launching to Leading methodology: **Launching to Leading** (#24) → full workbook (all 6 sheets)
→ If Gartner-aligned: **Gartner Messaging & Positioning** (#49) → `gartner-messaging` variation

---

## B2C Problem-to-Framework Routing Map

### "Our growth has stalled / we're not acquiring enough customers"
→ **AARRR Pirate Metrics** — identify the constraint (acquisition, activation, retention, referral, or revenue)
→ If acquisition: **Growth Loops** or **GTM Motions**
→ If retention/churn: see "Our subscribers/customers are churning" below

### "We don't know who our target consumer is" / "We need to define our consumer segments"
→ **STP (Segmentation, Targeting, Positioning)**
→ Follow-on: JTBD (to understand motivations), Positioning Statement

### "Our subscribers/customers are churning" / "We need to improve retention"
→ **AARRR** (retention/revenue section) → **retention-lifecycle-plan** template
→ Follow-on: OKRs (retention KPIs), Attribution (identify retention levers)

### "We need to rethink our brand positioning" / "How do we differentiate in the market?"
→ **April Dunford 5-Step Positioning** (adapted for consumer brand)
→ Follow-on: Positioning Statement, Messaging Architecture

### "We need to write our brand messaging" / "What's our brand story?"
→ **Corporate Narrative / Master Story** — for brand voice and story
→ **Messaging Architecture** — for structured pillar-based messaging
→ **Value Proposition Canvas** — if starting from consumer insights

### "We're launching a new product or line"
→ **GTM Motions** → **product-launch-plan-b2c** template
→ Pre-check: **Product-Market Fit Diagnostic**
→ ⚠️ Research prompt required for market context

### "We need to understand what drives our consumers to buy" / "Why do people really buy this?"
→ **JTBD (Jobs to Be Done)**
→ Follow-on: Value Proposition Canvas, Positioning Statement
→ Consumer Archetype persona required

### "Who are our competitors and how do we win against them?"
→ **Competitive Strategy Deep Dive** → **competitive-teardown-b2c** template
→ ⚠️ Research prompt required
→ Follow-on: April Dunford Positioning, Positioning Statement

### "We need a campaign brief" / "We're planning a seasonal campaign"
→ **Marketing Revenue Funnel Model** (for funnel logic) → **campaign-brief** template
→ Consumer Archetype persona required

### "We need an influencer / creator strategy"
→ **Growth Loops** (creator/referral loop) → **influencer-creator-brief** template
→ Check: social-proof-driven or gen-z archetype for audience calibration

### "We need a channel strategy" / "Which channels should we be in?"
→ **GTM Motions** → **channel-strategy** template
→ Follow-on: AARRR (to validate channel efficiency)

### "We need to set our OKRs / quarterly goals"
→ **OKRs**
→ Pre-check: **North Star Metric + Driver Tree** (set the right north star first)

### "How big is our market?" / "We need a TAM slide"
→ **TAM/SAM/SOM**
→ ⚠️ Research prompt required

### "We need to understand macro trends in our category"
→ **PESTLE** or **STEEPLE**
→ ⚠️ Research prompt required

### "We're not sure if we have product-market fit"
→ **Product-Market Fit Diagnostic**
→ Follow-on: GTM Stage Model, GTM Motions

### "We need to understand our consumer's psychology / motivations"
→ **JTBD** (functional/emotional/social jobs) → **VOC Thematic Analysis**
→ Consumer Archetype persona required

### "We need a brand brief" / "We're briefing an agency"
→ **Brand Architecture** → **brand-guidelines-brief** template

### "We need a consumer persona profile"
→ **ICP + Buying Committee** (adapted for consumer segmentation) → **consumer-persona-profile** template
→ Consumer Archetype from library as starting point

### "We need to price this product / subscription"
→ **Pricing Strategy**
→ Pre-check: Value Proposition Canvas (understand willingness-to-pay anchors)

### "We need to set up attribution" / "We don't know what's driving our growth"
→ **Attribution Lenses**
→ Pre-check: AARRR (to identify which funnel stage to instrument first)

### "We should think about going product-led" / "Can we add a freemium tier?"
→ **PLG/Hybrid PLG**
→ Freemium App Evaluator or Subscription-Fatigued archetype for calibration

### "We need an investor narrative" / "Board deck time"
→ **Investor Narrative** (#36) → **board-deck** template
→ Pre-check: North Star Metric, OKRs

### "We're entering a new market or category"
→ **Category Design** → **Corporate Narrative**
→ ⚠️ Research prompt required

---

## B2C-Unique Problem Routing (frameworks new in v2.0.0)

### "We need to understand why consumers buy / habit formation"
→ **Hook Model** — maps trigger → action → variable reward → investment loop
→ Follow-on: Growth Loops, AARRR

### "We need to design a referral or viral program"
→ **Viral Loop/K-Factor Analysis** → **Referral Program Design**
→ Follow-on: AARRR (measure the loop)

### "We need an influencer or creator strategy"
→ **Influencer & Creator Marketing Strategy** → `influencer-creator-brief` template
→ Apply social-proof-driven or gen-z archetype

### "We need to build a community around our brand"
→ **Community-Led Growth**
→ Follow-on: Growth Loops

### "We need to model our paid media mix"
→ **Paid Media Mix Model** → follow-on: Consumer Acquisition Funnel
→ Apply: Head of Performance Marketing operator persona

### "How do consumers think about our brand relative to competitors?"
→ **Keller's CBBE Pyramid** — maps brand equity across salience, performance, imagery, resonance
→ Follow-on: Messaging Architecture

### "We need to map the consumer journey"
→ **Consumer Decision Journey** → **Customer Experience Mapping**
→ Follow-on: NPS/CSAT/CES Strategy

### "We need to measure and improve customer satisfaction"
→ **NPS/CSAT/CES Strategy**
→ Follow-on: OKRs, Churn Diagnosis

### "We need to design a loyalty program"
→ **Brand Loyalty Ladder**
→ Follow-on: Customer Lifecycle Marketing, RFM Analysis

### "We need to convert free users to paid / design an upsell path"
→ **Trial-to-Premium/Upsell Path Design**
→ Pre-check: PLG/Hybrid PLG
→ Follow-on: Subscription Economics

### "We need to segment our customers for campaigns"
→ **RFM Analysis** (if you have purchase data) → **Customer Lifecycle Marketing**
→ Pre-check: Cohort Retention Analysis

### "We need to understand our churn drivers"
→ **Cohort Retention Analysis** → **Churn Diagnosis & Prevention**
→ Apply: CRM/Email/SMS Manager operator persona

### "We need to model subscription unit economics"
→ **Subscription Economics**
→ Pre-check: AARRR (retention section)

### "We need to model DTC profitability"
→ **DTC Economics Model**
→ Follow-on: Consumer Acquisition Funnel, AARRR

### "We're on Amazon / a marketplace — how do we optimize?"
→ **Marketplace/Platform Economics**
→ Apply: Marketplace Operator or Retail & Omnichannel Manager persona

### "We need to go omnichannel / add retail"
→ **Omnichannel Strategy** → **Retail Distribution Strategy**

### "We need to understand consumer price sensitivity"
→ **Consumer Pricing Psychology** → **Conjoint Analysis/WTP**
→ Follow-on: Pricing Strategy

### "We need to segment our consumer base"
→ **Consumer Segmentation**
→ Follow-on: Consumer Persona + Purchase Influence Map, STP

### "We need social listening / brand monitoring"
→ **Social Listening & Sentiment Analysis**
→ Apply: Head of Brand or Social & Community Manager persona

---

## When No Single Framework Fits
If the problem spans multiple frameworks or is ambiguous:
1. Name the 2–3 candidate frameworks
2. Explain the difference in one sentence each
3. Ask the user to choose, or recommend a starting point and sequence

---

## Framework Chaining — Unified Sequences

### B2B Sequences

```
Positioning Path:
Competitive Deep Dive (#22) → April Dunford (#12) → Positioning Statement (#17) → Messaging Architecture (#16)

Gartner Positioning Path:
Gartner Product Positioning (#51) → Gartner Messaging & Positioning (#49) → Gartner Product Marketing (#50) → Messaging Architecture (#16)

GTM Design Path:
PMF Diagnostic (#8) → GTM Motions (#3) → GTM Stage Model (#9) → OKRs (#39)

Gartner GTM Path:
Gartner Go-To-Market Strategy (#47) → Gartner Customer Journey (#45) → ABM (#30) → Gartner Marketing Strategic Planning (#48)

Market Entry Path:
TAM/SAM/SOM (#29) → Porter's Five Forces (#26) → Category Design (#21) → Launching to Leading (#24)

Growth Optimization Path:
AARRR (#1) → Growth Loops (#2) → PLG/Hybrid PLG (#7) → North Star Metric (#38)

Enterprise Sales Path:
ICP + Buying Committee (#4) → ABM (#30) → Multi-Threaded Outreach (#31) → Win/Loss (#11)

Proof & Brand Path:
Gartner Customer Proof (#46) → Gartner Brand Marketing (#44) → Corporate Narrative (#14)

Messaging & Positioning Workbook Path:
April Dunford (#12) → Positioning Statement (#17) → Messaging Architecture (#16) → Value Proposition Canvas (#18) → messaging-positioning-workbook template
```

### B2C Sequences

```
Consumer Positioning Path:
STP → JTBD → April Dunford Positioning → Positioning Statement → Messaging Architecture → Brand Architecture

Launch Path:
Product-Market Fit Diagnostic → GTM Motions → AARRR → Growth Loops → Marketing Revenue Funnel

Retention Path:
AARRR (retention section) → North Star Metric → OKRs → Attribution → RevOps Operating Model

Category Play:
TAM/SAM/SOM → Category Design → Corporate Narrative → Positioning Statement

Competitive Response:
Competitive Strategy Deep Dive → April Dunford Positioning → Value Proposition Canvas → Messaging Architecture

Brand Refresh:
VOC Thematic Analysis → JTBD → Brand Architecture → Messaging Architecture → Corporate Narrative
```

### New B2C Sequences (v2.0.0)

```
Consumer Acquisition Path:
Consumer Segmentation → Consumer Acquisition Funnel → Paid Media Mix Model → AARRR → Growth Loops

Retention & Lifecycle Path:
Cohort Retention Analysis → RFM Analysis → Customer Lifecycle Marketing → Churn Diagnosis & Prevention

Brand Equity Path:
Keller's CBBE Pyramid → Consumer Decision Journey → Customer Experience Mapping → NPS/CSAT/CES Strategy

DTC Profitability Path:
DTC Economics Model → Consumer Acquisition Funnel → Subscription Economics → Attribution Lenses

Community & Creator Path:
Community-Led Growth → Influencer & Creator Marketing Strategy → Viral Loop/K-Factor → Growth Loops
```
