# Frameworks Catalog — GTM Strategist

Domain tags: **[Universal]** applies to B2B and B2C | **[B2B]** primarily B2B | **[B2C]** primarily B2C

The full framework library is sourced remotely from mac-registry. This file provides guidance on each framework for selection and application. Always fetch the full framework YAML from `LOCAL_CACHE/frameworks/{id}.yaml` before running.

---

## Category 1 — GTM & Growth

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 1 | **AARRR (Pirate Metrics)** | [Universal] | Diagnosing the primary growth constraint across Acquisition, Activation, Retention, Revenue, Referral | Internal metrics only |
| 2 | **Growth Loops** | [Universal] | Designing self-reinforcing acquisition/expansion loops that compound over time | Internal only |
| 3 | **GTM Motions** | [Universal] | Selecting and sequencing the right revenue architecture before scaling | Internal only |
| 4 | **ICP + Buying Committee** | [B2B] | Defining the ideal customer profile and full decision-making unit | Optional |
| 5 | **Land and Expand** | [B2B] | Architecting expansion revenue — land efficiently, then scale within accounts | Internal only |
| 6 | **Marketing Revenue Funnel Model** | [Universal] | Modeling the full demand gen / consumer funnel with stage conversion, velocity, and pipeline contribution | Internal only |
| 7 | **PLG / Hybrid PLG** | [Universal] | Designing product-led growth mechanics; deciding when and how to layer a sales or paid motion on top | Internal only |
| 8 | **Product-Market Fit Diagnostic** | [Universal] | Assessing PMF maturity across retention, engagement, and willingness-to-pay signals | Internal only |
| 9 | **Startup GTM Stage Model** | [Universal] | Mapping GTM strategy to company stage (Pre-Fit → Post-Fit → Scale) with stage-appropriate resource allocation | Internal only |
| 10 | **SWOT** | [Universal] | Structured strategic synthesis: internal capabilities × external conditions → strategic moves | Optional |
| 11 | **B2B Win/Loss Analysis** | [B2B] | Understanding why deals are won, lost, or stall — translating patterns into targeting, messaging, and sales improvements | Internal CRM data |

### Framework details — Category 1

**#1 AARRR Pirate Metrics**
- **B2B application:** Diagnosing the primary B2B growth constraint across the funnel — from MQL generation through activation, retention, expansion, and referral.
- **B2C application:** Consumer funnel optimization — acquisition (paid, organic, referral), activation (first purchase, app install, trial conversion), retention (repeat purchase, subscription renewal), referral (word-of-mouth, UGC, creator), revenue (LTV, AOV, ARPU). The most important B2C diagnostic for identifying where growth is constrained.
- **Templates:** Pairs well with `retention-lifecycle-plan` when retention is the constraint.
- **Chaining:** → Growth Loops (fix the identified constraint) → North Star Metric (set the right KPI)

**#2 Growth Loops**
- **B2B application:** Designing self-reinforcing B2B loops — referral, community, content, and network effects that compound acquisition over time.
- **B2C application:** Consumer-native growth loops — social sharing, UGC, referral programs, creator/influencer compounding, marketplace network effects, community-driven growth.
- **Chaining:** → AARRR (measure the loop) → PLG/Hybrid (if product is the loop driver)

**#3 GTM Motions**
- **B2B application:** Selecting and sequencing the right B2B revenue architecture (PLG, sales-led, channel, etc.) before scaling.
- **B2C application:** Channel mix and route-to-market strategy. DTC vs retail vs marketplace vs app store vs subscription. Helps brands decide which motion fits their product, consumer, and stage — not just which channel spends to add.
- **Templates:** → `channel-strategy`
- **Chaining:** → AARRR (instrument the motion) → Marketing Revenue Funnel (model the economics)

**#6 Marketing Revenue Funnel Model**
- **B2B application:** Modeling the full B2B demand gen funnel with stage conversion, velocity, and pipeline contribution.
- **B2C application:** Full-funnel consumer marketing model — awareness to first purchase to LTV. Useful for campaign planning, budget allocation, and identifying conversion drop-offs.
- **Templates:** → `campaign-brief`
- **Chaining:** → Attribution Lenses → AARRR

**#7 PLG / Hybrid PLG**
- **B2B application:** Designing product-led growth mechanics; deciding when and how to layer sales motion on top.
- **B2C application:** Product-led acquisition for consumer apps, freemium products, and subscription tiers. Maps free-to-paid conversion mechanics and identifies the activation moment that drives upgrade.
- **B2C Archetypes:** Freemium App Evaluator, Subscription-Fatigued
- **Chaining:** → AARRR (measure activation) → Pricing Strategy (freemium tier design)

**#8 Product-Market Fit Diagnostic**
- **B2B application:** Assessing PMF across retention, NPS, and pipeline signals — before scaling GTM investment.
- **B2C application:** Validates whether the product has earned genuine consumer pull — not just ad-driven demand. Useful before scaling spend or entering retail.
- **Chaining:** → GTM Stage Model → GTM Motions

**#9 Startup GTM Stage Model**
- **B2B application:** Mapping B2B GTM strategy to company stage (Pre-Fit → Post-Fit → Scale) with stage-appropriate resource allocation.
- **B2C application:** Stage-gate framework for consumer brands — from pre-launch validation through retail distribution. Maps the stage-appropriate priorities and pitfalls.
- **Chaining:** → GTM Motions → AARRR

---

## Category 2 — Positioning & Narrative

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 12 | **April Dunford 5-Step Positioning** | [Universal] | Deliberately selecting competitive context, articulating differentiated value, defining category frame | Optional |
| 13 | **Brand Architecture Model** | [Universal] | Designing corporate brand / product brand / sub-brand relationships for multi-product companies | Internal only |
| 14 | **Corporate Narrative / Master Story** | [Universal] | Building the overarching company or brand story for investor decks, website, sales decks, and brand campaigns | Internal only |
| 15 | **Jobs to Be Done (JTBD)** | [Universal] | Understanding the real jobs customers/consumers are hiring the product to do; uncovering switching triggers | Optional |
| 16 | **Messaging Architecture** | [Universal] | Building the complete messaging system: core message, pillars, proof points, audience-specific messages, elevator pitches | Internal only |
| 17 | **Positioning Statement** | [Universal] | Writing a precise, testable positioning statement that aligns the team | Internal only |
| 18 | **Value Proposition Canvas** | [Universal] | Mapping product capabilities to customer jobs, pains, and gains | Internal only |
| 19 | **VOC Thematic Analysis** | [Universal] | Structuring voice-of-customer data (interviews, reviews, surveys) into actionable messaging themes | Internal + optional research |

### Framework details — Category 2

**#12 April Dunford 5-Step Positioning**
- **B2B application:** Deliberately selecting competitive context, articulating differentiated value, defining category frame for B2B buyers.
- **B2C application:** Works well for consumer brands that compete in crowded categories or need to reframe how they're perceived. Especially useful for challenger brands, category entrants, or repositioning plays.
- **Templates:** → `messaging-positioning-workbook`
- **Chaining:** → Positioning Statement (#17) → Messaging Architecture (#16)

**#13 Brand Architecture Model**
- **B2B application:** Designing corporate brand / product brand / sub-brand relationships for multi-product B2B companies.
- **B2C application:** Portfolio brand structure — masterbrand vs house of brands vs sub-brands. Useful for multi-product DTC brands, CPG portfolios, and brand extension decisions.
- **Templates:** → `brand-guidelines-brief`
- **Chaining:** → Corporate Narrative → Messaging Architecture

**#14 Corporate Narrative / Master Story**
- **B2B application:** Building the overarching company story for investor decks, website, and sales decks.
- **B2C application:** Brand origin story, "why we exist" narrative, and mission-driven positioning for consumer audiences. Foundation for brand campaigns, social content, and retail packaging copy.
- **Templates:** → `brand-guidelines-brief`
- **Chaining:** → Brand Architecture → Messaging Architecture

**#15 JTBD (Jobs to Be Done)**
- **B2B application:** Understanding the real jobs B2B buyers are hiring the product to do; uncovering switching triggers.
- **B2C application:** Uncovers the functional, emotional, and social jobs consumers are hiring the product to do. Critical for creative briefs, campaign concepts, and product development direction.
- **B2C Archetypes:** Apply the relevant consumer archetype to calibrate job framing.
- **Chaining:** → Value Proposition Canvas → Positioning Statement

**#16 Messaging Architecture**
- **B2B application:** Building the complete B2B messaging system: core message, pillars, proof points, audience-specific messages, elevator pitches.
- **B2C application:** Structured messaging pillars for consumer brand — campaign messaging, packaging copy, digital advertising, social content, and agency briefs.
- **Templates:** → `messaging-positioning-workbook`
- **Chaining:** → Brand Architecture → Corporate Narrative

**#17 Positioning Statement**
- **B2B application:** Writing a precise, testable B2B positioning statement that aligns the team.
- **B2C application:** A tight, testable consumer positioning statement using the classic Geoffrey Moore format or April Dunford's alternative. Useful for aligning creative teams, agency briefs, and packaging copy.
- **Chaining:** → Messaging Architecture → Corporate Narrative

**#18 Value Proposition Canvas**
- **B2B application:** Mapping product capabilities to B2B customer jobs, pains, and gains.
- **B2C application:** Maps consumer pains, gains, and jobs to product features and benefits. Essential for creative briefs, landing page copy, and campaign headline testing.
- **B2C Archetypes:** Apply relevant consumer archetype for calibration.
- **Chaining:** → Positioning Statement → Messaging Architecture

---

## Category 3 — Market & Category Strategy

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 20 | **AI-Native Data Advantage** | [Universal] | Assessing and designing data moats and AI-native competitive advantages | Internal + optional |
| 21 | **Category Design** | [Universal] | Deliberately creating or redefining a market category to make competition irrelevant | ⚠️ Yes — market landscape |
| 22 | **Competitive Strategy Deep Dive** | [Universal] | Structured competitive landscape analysis: who wins, why, and how to design a winning position | ⚠️ Yes — competitor research |
| 23 | **Crossing the Chasm** | [Universal] | Navigating the technology adoption gap between early adopters and mainstream market | Optional |
| 24 | **Launching to Leading** | [Universal] | Full launch-to-market-leadership playbook for new products or category entries | ⚠️ Yes — market + competitive |
| 25 | **PESTLE** | [Universal] | Systematic scan of Political, Economic, Social, Technological, Legal, Environmental forces | ⚠️ Yes — external required |
| 26 | **Porter's Five Forces** | [Universal] | Analyzing industry competitive intensity: suppliers, buyers, substitutes, entrants, rivalry | ⚠️ Yes — industry research |
| 27 | **STEEPLE** | [Universal] | Extended PESTLE adding Ethics — for ESG-sensitive or regulated industries | ⚠️ Yes — external required |
| 28 | **STP (Segmentation, Targeting, Positioning)** | [Universal] | Full segmentation-to-positioning process | Optional |
| 29 | **TAM / SAM / SOM** | [Universal] | Sizing the total addressable market, serviceable segment, and near-term opportunity | ⚠️ Yes — market data required |

### Framework details — Category 3

**#20 AI-Native Data Advantage**
- **B2B application:** Assessing and designing data moats and AI-native competitive advantages for B2B companies.
- **B2C application:** Consumer data strategy — first-party data collection, personalization infrastructure, and AI-driven lifecycle marketing. Increasingly relevant as third-party cookies deprecate.
- **B2C Operators:** Consumer Analytics Manager, CRM/Email/SMS Manager

**#21 Category Design**
- **B2B application:** Deliberately creating or redefining a market category to make competition irrelevant.
- **B2C application:** Creating or redefining the category a consumer brand competes in. High ambition play — requires brand, product, and communications alignment.
- **Research:** Always required.
- **Chaining:** → Corporate Narrative → Positioning Statement

**#22 Competitive Strategy Deep Dive**
- **B2B application:** Structured competitive landscape analysis: who wins, why, and how to design a winning B2B position.
- **B2C application:** Consumer brand competitive analysis — category leaders, challenger brands, private label, international entrants. Maps positioning, pricing, channel, and creative differentiation.
- **Research:** Always required.
- **Templates:** → `competitive-teardown-b2c` (B2C); `sales-battlecard` (B2B)
- **Chaining:** → April Dunford Positioning → Value Proposition Canvas

**#23 Crossing the Chasm**
- **B2B application:** Navigating the technology adoption gap between early adopters and mainstream enterprise buyers.
- **B2C application:** Consumer mainstream adoption strategy — moving from early adopters (Gen Z, enthusiasts, niche communities) to mainstream consumers.
- **B2C Archetypes:** Maps early adopters vs mainstream archetypes.
- **Chaining:** → GTM Motions → AARRR

**#24 Launching to Leading**
- **B2B application:** Full B2B launch-to-market-leadership playbook.
- **B2C application:** Full brand launch or relaunch playbook — consumer narrative, launch channels, retail execution, and PR strategy.
- **Templates:** → `product-launch-plan-b2c` (B2C)
- **Chaining:** → GTM Motions → AARRR

**#25 PESTLE**
- **B2B application:** Systematic scan of macro forces affecting B2B markets.
- **B2C application:** Macro environment scan — consumer confidence, regulatory (FTC, COPPA, data privacy), social trends, platform algorithm shifts, economic pressures on spending.
- **Research:** Always required.
- **Chaining:** → SWOT → Scenario Planning

**#28 STP (Segmentation, Targeting, Positioning)**
- **B2B application:** Full B2B segmentation-to-positioning process.
- **B2C application:** Consumer segmentation — demographic, psychographic, behavioral, and occasion-based. Foundation for multi-archetype campaign planning.
- **B2C Archetypes:** Maps each segment to the appropriate consumer archetype profile.
- **Templates:** → `consumer-persona-profile`
- **Chaining:** → JTBD → April Dunford Positioning

---

## Category 4 — Enterprise Revenue Systems [B2B]

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 30 | **Account-Based Marketing (ABM)** | [B2B] | Target account program design: ICP-driven account selection, multi-threaded engagement, ABM measurement | Internal CRM + optional |
| 31 | **Multi-Threaded Enterprise Outreach** | [B2B] | Structuring multi-stakeholder engagement across enterprise buying committees | Internal only |
| 32 | **Outbound Prospecting Architecture** | [B2B] | Designing a scalable outbound system: ICP, sequencing, messaging, SDR enablement | Internal only |
| 33 | **Sales Cadence Architecture** | [B2B] | Building optimized cadences across channels and personas | Internal only |
| 34 | **Sales Methodology Lens** | [B2B] | Evaluating and selecting the right sales methodology (MEDDIC, Challenger, SPIN, etc.) | Internal only |

---

## Category 5 — Governance & Performance

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 35 | **Attribution Lenses** | [Universal] | Evaluating marketing attribution models and selecting the right approach | Internal only |
| 36 | **Investor Narrative** | [Universal] | Building the investor-grade narrative: market, problem, solution, why now, why us | Internal only |
| 37 | **McKinsey 7-S Org Alignment** | [Universal] | Diagnosing organizational alignment across strategy, structure, systems, staff, skills, style, values | Internal only |
| 38 | **North Star Metric + Driver Tree** | [Universal] | Defining the single metric that captures product value and mapping the driver tree | Internal only |
| 39 | **OKRs** | [Universal] | Setting quarterly objectives and key results with alignment, scoring, and operating cadence | Internal only |
| 40 | **Pricing Strategy** | [Universal] | Designing or auditing pricing: model, value metric, tier structure, competitive positioning | Optional |
| 41 | **Prioritization (RICE / ICE / MoSCoW)** | [Universal] | Scoring and stack-ranking initiatives, features, or campaigns | Internal only |
| 42 | **Revenue Operations Operating Model** | [Universal] | Designing the RevOps/lifecycle marketing function: systems, process ownership, data governance, cross-functional alignment | Internal only |
| 43 | **Scenario Planning / Risk Matrix** | [Universal] | Mapping strategic scenarios and risk-weighting them to stress-test plans | Optional |

### Framework details — Category 5

**#35 Attribution Lenses**
- **B2B application:** Evaluating marketing attribution models for B2B pipeline and revenue.
- **B2C application:** Consumer attribution modeling — last-touch vs multi-touch vs incrementality testing. Critical for DTC brands managing paid/owned/earned channel mix.
- **B2C Operators:** Consumer Analytics Manager, Head of Performance, Paid Media Manager
- **Chaining:** → North Star Metric → RevOps Operating Model

**#36 Investor Narrative**
- **B2B application:** Building the B2B investor-grade narrative: market, problem, solution, why now, why us.
- **B2C application:** Consumer brand investor story — LTV/CAC ratio, cohort retention, category thesis, competitive moat, and TAM. Used for fundraising rounds and board decks.
- **Templates:** → `board-deck`
- **Chaining:** → North Star Metric → TAM/SAM/SOM

**#38 North Star Metric + Driver Tree**
- **B2B application:** Defining the single B2B metric that captures product value and mapping the driver tree.
- **B2C application:** Defining the one metric that best captures the brand's growth health (e.g., subscriber LTV, monthly active buyers, net revenue retention) and the driver tree below it. Essential before setting OKRs.
- **B2C Operators:** CMO, Head of Growth, Consumer Analytics Manager
- **Chaining:** → OKRs → AARRR

**#40 Pricing Strategy**
- **B2B application:** Designing or auditing B2B pricing: model, value metric, tier structure, competitive positioning.
- **B2C application:** Consumer pricing architecture — promotional cadence, subscription tier design, entry-point pricing, bundle strategy, and price elasticity.
- **B2C Archetypes:** Price-Sensitive Shopper, Subscription-Fatigued for calibration.
- **Chaining:** → Value Proposition Canvas → Competitive Strategy

**#42 Revenue Operations Operating Model**
- **B2B application:** Designing the RevOps function: systems, process ownership, data governance, cross-functional alignment between marketing and sales.
- **B2C application:** Lifecycle marketing operations — CRM, email/SMS, loyalty programs, subscription management, and attribution infrastructure.
- **B2C Operators:** CRM/Email/SMS Manager, Head of Loyalty

---

## Category 6 — Gartner Frameworks [B2B]

| # | Framework | Tag | Best For | Research? |
|---|---|---|---|---|
| 44 | **Gartner Brand Marketing Framework** | [B2B] | Evaluating and improving brand marketing effectiveness across six dimensions | Internal + optional |
| 45 | **Gartner Customer Journey / B2B Buying Journey** | [B2B] | Mapping the non-linear B2B buying journey — aligning marketing and sales to each stage | Optional |
| 46 | **Gartner Customer Proof / Case Study Framework** | [B2B] | Developing structured customer proof assets that demonstrate measurable business outcomes | Internal only |
| 47 | **Gartner Go-To-Market Strategy Framework** | [B2B] | Aligning growth strategy with revenue execution | Internal + optional |
| 48 | **Gartner Marketing Strategic Planning Framework** | [B2B] | Aligning marketing strategy with enterprise business objectives | Internal only |
| 49 | **Gartner Messaging & Positioning Framework** | [B2B] | Defining differentiated product positioning and messaging that motivates buyers to act | Internal + optional |
| 50 | **Gartner Product Marketing Framework** | [B2B] | Structuring product marketing across market understanding, differentiation, messaging, and revenue enablement | Internal + optional |
| 51 | **Gartner Product Positioning Framework** | [B2B] | Defining a product's differentiated value relative to alternatives — aligning product, marketing, and sales teams | Internal + optional |

---

## Category 7 — B2C Consumer Growth [B2C]

These frameworks are B2C-specific and do not have direct B2B equivalents.

### B2C GTM Motions
Channel mix and route-to-market selection specific to consumer businesses — DTC vs retail vs marketplace vs app store vs subscription. Determines which motion fits the product, consumer, and stage before committing channel spend.
**Templates:** → `channel-strategy`

### Consumer Acquisition Funnel
Full-funnel consumer acquisition model — top-of-funnel awareness through first purchase conversion. Includes paid, organic, influencer, and referral channel attribution. Diagnostic for identifying the acquisition constraint.
**Operators:** Head of Growth, Paid Media Manager, Head of Performance Marketing

### B2C Stage Model
Consumer brand lifecycle stage-gating — from pre-launch validation through DTC, retail entry, and omnichannel scale. Maps stage-appropriate investment priorities, channel expansion triggers, and organizational readiness signals.

### Hook Model
Maps the four-phase behavioral loop (trigger → action → variable reward → investment) that drives consumer habit formation. Used for product design, retention campaign design, and engagement mechanics.
**Chaining:** → Growth Loops, AARRR

### Viral Loop / K-Factor Analysis
Quantifies the viral coefficient driving organic consumer acquisition — referral rates, sharing mechanics, and loop velocity. Inputs: invites sent per user, conversion rate of invites, cycle time.
**Templates:** → referral program tracking
**Chaining:** → Referral Program Design → AARRR

### Referral Program Design
End-to-end referral program architecture — incentive structure, attribution mechanics, friction reduction, and success metrics. Combines unit economics (CAC vs reward cost) with behavioral design.
**Chaining:** → Viral Loop/K-Factor Analysis → Growth Loops

### Influencer & Creator Marketing Strategy
Strategic framework for building and scaling creator programs — tier selection (nano/micro/macro/mega), content brief design, usage rights, exclusivity terms, performance measurement (EMV, ROAS, attributable DTC revenue).
**Templates:** → `influencer-creator-brief`
**Operators:** Influencer & Creator Manager

### Community-Led Growth
Designs brand community strategy as a growth and retention moat — platform selection, community charter, moderation model, content engine, and community-to-acquisition flywheel measurement.
**Chaining:** → Growth Loops

### Paid Media Mix Model
Multi-channel paid media strategy — budget allocation across search, social, display, video, and emerging channels. Includes incrementality testing framework, diminishing returns identification, and channel mix optimization.
**Operators:** Paid Media Manager, Head of Performance Marketing
**Chaining:** → Consumer Acquisition Funnel

---

## Category 8 — B2C Consumer Brand & Experience [B2C]

### Keller's CBBE Pyramid (Customer-Based Brand Equity)
Maps brand equity across four levels: salience (identity), performance/imagery (meaning), judgments/feelings (response), and resonance (relationships). Diagnostic for identifying which equity layer is limiting brand growth.
**Chaining:** → Messaging Architecture

### Consumer Decision Journey
Maps the consumer's path from awareness through consideration, purchase, loyalty, and advocacy — across all touchpoints. Non-linear model that identifies where the brand loses consumers and where competitors intercept them.
**Chaining:** → Customer Experience Mapping → NPS/CSAT/CES Strategy

### Customer Experience Mapping
End-to-end experience map across all consumer touchpoints — digital, physical, post-purchase. Identifies friction points, delight moments, and service recovery opportunities. Used for brand, product, and ops alignment.
**Chaining:** → NPS/CSAT/CES Strategy

### NPS / CSAT / CES Strategy
Framework for selecting, deploying, and acting on customer satisfaction measurement. Covers metric selection (Net Promoter Score vs Customer Satisfaction vs Customer Effort Score), survey design, response routing, and closed-loop feedback systems.
**Operators:** CMO/VP Marketing, Head of Brand
**Chaining:** → OKRs, Churn Diagnosis

### Brand Loyalty Ladder
Maps the consumer relationship progression from awareness → trial → repeat → loyalty → advocacy. Designs program mechanics and communications for each rung transition.
**Chaining:** → Customer Lifecycle Marketing, RFM Analysis

### Consumer Persona + Purchase Influence Map
Structured consumer archetype profile combining behavioral motivations, media consumption, purchase triggers, barriers, and influence network (who they trust). Foundation for campaign briefs, creative direction, and channel strategy.
**Templates:** → `consumer-persona-profile`
**Chaining:** → STP, Messaging Architecture

---

## Category 9 — B2C Retention & Lifecycle [B2C]

### Trial-to-Premium / Upsell Path Design
Maps the conversion path from free trial or entry-tier to paid or premium — identifying the activation moment, upgrade triggers, value demonstration timing, and upgrade CTA design.
**Pre-check:** PLG/Hybrid PLG
**Chaining:** → Subscription Economics

### RFM Analysis (Recency, Frequency, Monetary)
Segments the existing customer base by purchase recency, frequency, and spend — enabling targeted lifecycle campaigns, win-back sequencing, and LTV optimization.
**Chaining:** → Customer Lifecycle Marketing

### Cohort Retention Analysis
Tracks retention by acquisition cohort — identifies when consumers drop off, which acquisition channels produce the best-retained cohorts, and whether product or messaging changes improved retention over time.
**Chaining:** → Churn Diagnosis & Prevention

### Customer Lifecycle Marketing
Full lifecycle campaign architecture — from onboarding through activation, retention, win-back, and advocacy. Maps trigger events, channel selection, message cadence, and success metrics for each lifecycle stage.
**Templates:** → `retention-lifecycle-plan`
**Operators:** CRM/Email/SMS Manager

### Subscription Economics
Models the unit economics of subscription businesses — CAC, MRR, ARR, churn rate, net revenue retention, LTV/CAC ratio, payback period. Identifies the economic levers most affecting profitability.
**Chaining:** → Trial-to-Premium/Upsell Path

### Churn Diagnosis & Prevention
Systematic churn analysis framework — identifies churn drivers by segment, distinguishes voluntary vs involuntary churn, maps the pre-churn signal window, and designs intervention sequences.
**Operators:** CRM/Email/SMS Manager, Head of Loyalty
**Chaining:** → Cohort Retention Analysis → Customer Lifecycle Marketing

---

## Category 10 — B2C Commerce & Channel [B2C]

### DTC Economics Model
Models the unit economics of direct-to-consumer brands — blended CAC, contribution margin, COGS, fulfillment cost, first-order economics vs LTV. Identifies whether DTC is sustainably profitable at current scale.
**Chaining:** → Consumer Acquisition Funnel → Subscription Economics

### Marketplace / Platform Economics
Models the economics of selling on third-party platforms (Amazon, DTC marketplaces) — fee structure, organic vs sponsored placement, fulfillment options, competitive dynamics, and platform dependency risk.
**Operators:** Marketplace Operator
**Chaining:** DTC Economics Model

### Omnichannel Strategy
Designs the integration of DTC, retail, marketplace, and social commerce channels — inventory visibility, pricing consistency, customer data unification, and channel-specific margin management.
**Chaining:** → Retail Distribution Strategy

### Retail Distribution Strategy
Designs the retail channel expansion strategy — retail partner selection, sell-in pitch structure, trade terms, promotional calendar, category management, and retail marketing (FSIs, co-op, in-store execution).
**Operators:** Retail & Omnichannel Manager

### Consumer Pricing Psychology
Applies behavioral economics principles to consumer pricing decisions — anchoring, decoy pricing, charm pricing, bundle framing, and promotional mechanics. Inputs from willingness-to-pay research.
**Chaining:** → Conjoint Analysis/WTP → Pricing Strategy

---

## Category 11 — Consumer Insights [B2C]

### Consumer Segmentation
Multidimensional segmentation of the consumer base — demographic, psychographic, behavioral (purchase frequency, occasion, basket), and attitudinal. Foundation for persona development, campaign targeting, and media planning.
**Chaining:** → Consumer Persona + Purchase Influence Map, STP

### Conjoint Analysis / WTP (Willingness to Pay)
Research-based framework for understanding which product attributes consumers value most and the price they're willing to pay. Requires survey data. Used for pricing decisions, feature prioritization, and packaging design.
**Chaining:** → Consumer Pricing Psychology

### Social Listening & Sentiment Analysis
Systematic monitoring of brand mentions, category conversations, and competitor sentiment across social platforms and review sites. Identifies emerging trends, crisis signals, and authentic consumer language for creative.
**Operators:** Head of Brand, Social & Community Manager

---

## Research-Required Frameworks

Category Design (#21), Competitive Strategy Deep Dive (#22), Launching to Leading (#24),
PESTLE (#25), Porter's Five Forces (#26), STEEPLE (#27), TAM/SAM/SOM (#29)

B2C-specific: all Conjoint Analysis/WTP outputs require survey data.

---

## Framework-to-Template Mapping — Messaging & Positioning Workbook

When a framework produces messaging, positioning, or value chain output, it can populate
specific sheets in the `messaging-positioning-workbook` template (multi-sheet Excel workbook).

| Framework | # | Populates Sheet(s) |
|---|---|---|
| April Dunford 5-Step Positioning | 12 | Positioning Statement |
| JTBD | 15 | Key Messaging (Pain Points rows) |
| Messaging Architecture | 16 | Key Messaging (full matrix) |
| Positioning Statement | 17 | Positioning Statement, About Copy Blocks |
| Value Proposition Canvas | 18 | Value Filtering |
| Competitive Strategy Deep Dive | 22 | Value Filtering (competitive scoring column) |
| Launching to Leading | 24 | All 6 sheets (full workbook) |
| Gartner Messaging & Positioning | 49 | Key Messaging + Viewpoint Story |
| Gartner Product Positioning | 51 | Positioning Statement |

**Usage:** When running any of the above frameworks, check whether the user wants
the output in workbook format. If Launching to Leading (#24) is run, default to the
full workbook output. For individual frameworks, populate only the mapped sheets and
note which sheets remain empty for future framework runs.

---

## Framework Chaining — Combined Sequences

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
