"""
=============================================================
BHARAT POLICY TWIN — Synthetic Database Seeder
=============================================================
PURPOSE:
  Populates your PostgreSQL database with realistic Indian
  government policy data so you can test all API endpoints
  without needing real government data.

WHAT GETS CREATED:
  1. Tables  — policies, clauses, execution_records, kpi_timeseries,
               anomalies, recommendations, audit_logs
  2. Policies — 10 major Indian government schemes (PMAY, MGNREGA,
               PM-Kisan, Ayushman Bharat, etc.)
  3. ~80-120 policy clauses (rules, objectives, eligibility)
  4. ~500    execution records (aggregated, district/state/national)
  5. ~300    KPI time-series datapoints (monthly, 2 years)
  6. ~50     anomaly records (various severities)
  7. ~30     policy recommendations
  8. ~100    audit log entries

HOW TO RUN:
  Option A — Directly against running Docker DB:
    pip install psycopg2-binary faker numpy
    python seed_synthetic_db.py

  Option B — Inside the Docker container:
    docker exec -it <api_container_name> python seed_synthetic_db.py

  Option C — Via Docker compose exec:
    cd bharat-fixed/infra
    docker compose exec api python /path/to/seed_synthetic_db.py

ENVIRONMENT:
  Set DATABASE_URL in your .env or export it:
    export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bharat
=============================================================
"""

import os
import json
import uuid
import random
from datetime import datetime, timedelta, date

import psycopg2
from psycopg2.extras import execute_values, Json

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/bharat"
)

# ─────────────────────────────────────────────
# REFERENCE DATA — Indian states, districts, departments
# ─────────────────────────────────────────────
STATES = [
    "Uttar Pradesh", "Maharashtra", "Bihar", "West Bengal", "Madhya Pradesh",
    "Rajasthan", "Tamil Nadu", "Karnataka", "Gujarat", "Andhra Pradesh",
    "Odisha", "Telangana", "Kerala", "Jharkhand", "Assam",
    "Punjab", "Haryana", "Uttarakhand", "Himachal Pradesh", "Chhattisgarh"
]

DISTRICTS = {
    "Uttar Pradesh":   ["Lucknow", "Varanasi", "Agra", "Kanpur", "Allahabad"],
    "Maharashtra":     ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    "Bihar":           ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga"],
    "West Bengal":     ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Durgapur"],
    "Tamil Nadu":      ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
    "Karnataka":       ["Bengaluru", "Mysuru", "Hubli", "Mangaluru", "Belagavi"],
    "Gujarat":         ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    "Rajasthan":       ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    "Madhya Pradesh":  ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
    "Telangana":       ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
}

DEPARTMENTS = [
    "Ministry of Rural Development",
    "Ministry of Agriculture and Farmers Welfare",
    "Ministry of Health and Family Welfare",
    "Ministry of Housing and Urban Affairs",
    "Ministry of Women and Child Development",
    "Ministry of Finance",
    "Ministry of Education",
    "Ministry of Labour and Employment",
    "Ministry of Tribal Affairs",
    "Ministry of Social Justice and Empowerment",
]

# ─────────────────────────────────────────────
# POLICY DEFINITIONS — 10 Major Indian Schemes
# ─────────────────────────────────────────────
POLICIES = [
    {
        "policy_id": "PM-KISAN-001",
        "title": "PM-KISAN: Pradhan Mantri Kisan Samman Nidhi",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "jurisdiction": "National",
        "effective_date": "2019-02-01",
        "version": "3.2",
        "status": "active",
        "description": (
            "PM-KISAN provides income support of Rs 6,000 per year to all land-holding "
            "farmer families across India, paid in three equal installments of Rs 2,000 "
            "directly into bank accounts via Direct Benefit Transfer."
        ),
        "objectives": [
            "Supplement the financial needs of farmers for agricultural inputs",
            "Reduce financial distress among small and marginal farmers",
            "Improve farm income and rural consumption"
        ],
        "target_population": "Small and marginal farmers with cultivable land",
        "budget_crore": 60000,
        "kpis": ["beneficiaries_enrolled", "installments_disbursed", "amount_transferred_crore",
                 "avg_processing_days", "grievances_resolved_pct"],
        "clauses": [
            {
                "clause_number": "1.1",
                "clause_type": "eligibility",
                "title": "Landholder Eligibility",
                "content": (
                    "All land-holding farmer families with cultivable land shall be eligible "
                    "for income support under this scheme. Farmer family means a family "
                    "comprising husband, wife and minor children owning cultivable land."
                )
            },
            {
                "clause_number": "1.2",
                "clause_type": "exclusion",
                "title": "Exclusion Criteria — Institutional Landholders",
                "content": (
                    "Former and present holders of constitutional posts, former and present "
                    "Ministers/State Ministers and former/present Members of Lok Sabha/Rajya Sabha, "
                    "State Legislative Assemblies/Councils, Mayors of Municipal Corporations, "
                    "Chairpersons of District Panchayats shall not be eligible."
                )
            },
            {
                "clause_number": "1.3",
                "clause_type": "benefit",
                "title": "Income Support Amount",
                "content": (
                    "An amount of Rs. 6,000/- per year shall be transferred in three equal "
                    "instalments of Rs. 2,000/- each, every four months. The amount shall be "
                    "directly credited to the bank accounts of the beneficiaries."
                )
            },
            {
                "clause_number": "1.4",
                "clause_type": "process",
                "title": "Verification and Enrollment",
                "content": (
                    "State/UT Governments will identify the farmer families eligible as per "
                    "scheme guidelines. Data will be uploaded on the PM-KISAN portal. "
                    "Aadhaar seeding of bank accounts is mandatory for receiving benefits. "
                    "Verification shall be completed within 30 days of application."
                )
            },
            {
                "clause_number": "1.5",
                "clause_type": "grievance",
                "title": "Grievance Redressal",
                "content": (
                    "A dedicated helpline number 155261 and PM-KISAN portal shall provide "
                    "grievance redressal. All complaints shall be resolved within 21 working days. "
                    "Escalation to state nodal officers after 7 days of non-resolution."
                )
            },
            {
                "clause_number": "1.6",
                "clause_type": "monitoring",
                "title": "Monitoring and Audit",
                "content": (
                    "The scheme shall be monitored by the Agriculture Department at district, "
                    "state and national levels. Random physical verification of at least 10% "
                    "of beneficiaries shall be conducted every quarter. Annual audit by CAG."
                )
            },
        ]
    },
    {
        "policy_id": "MGNREGA-001",
        "title": "MGNREGA: Mahatma Gandhi National Rural Employment Guarantee Act",
        "department": "Ministry of Rural Development",
        "jurisdiction": "National",
        "effective_date": "2005-09-07",
        "version": "5.1",
        "status": "active",
        "description": (
            "MGNREGA guarantees at least 100 days of wage employment in a financial year "
            "to every household whose adult members volunteer to do unskilled manual work. "
            "It is one of the world's largest workfare programmes."
        ),
        "objectives": [
            "Guarantee 100 days of wage employment to rural households",
            "Create durable assets and strengthen rural livelihoods",
            "Reduce distress migration from rural areas"
        ],
        "target_population": "Rural households with adult members willing to do unskilled manual work",
        "budget_crore": 73000,
        "kpis": ["person_days_generated", "households_provided_employment", "wages_disbursed_crore",
                 "works_completed", "avg_wage_per_day", "women_participation_pct"],
        "clauses": [
            {
                "clause_number": "2.1",
                "clause_type": "entitlement",
                "title": "Employment Guarantee",
                "content": (
                    "Every rural household whose adult members volunteer to do unskilled manual "
                    "work shall be entitled to at least 100 days of such work in a financial year "
                    "in accordance with the scheme made under this Act."
                )
            },
            {
                "clause_number": "2.2",
                "clause_type": "process",
                "title": "Job Card Issuance",
                "content": (
                    "Every eligible household shall be issued a Job Card within 15 days of "
                    "application. The Job Card shall be issued free of cost and shall be valid "
                    "for 5 years. Loss of job card shall be reported to Gram Panchayat "
                    "for duplicate issuance within 7 days."
                )
            },
            {
                "clause_number": "2.3",
                "clause_type": "wage",
                "title": "Wage Rate and Payment",
                "content": (
                    "Wages shall be paid at rates notified by Central Government under Section 6. "
                    "Wages shall be paid within 15 days of the date by which the work is done. "
                    "Delay in wage payment shall attract compensation at 0.05% per day to workers."
                )
            },
            {
                "clause_number": "2.4",
                "clause_type": "work_allocation",
                "title": "Work Allocation Priority",
                "content": (
                    "Priority shall be given to works relating to water conservation, drought "
                    "proofing, land development, flood control, rural connectivity, and agriculture. "
                    "At least 60% of works shall be for creation of productive assets "
                    "linked to agriculture and allied activities."
                )
            },
            {
                "clause_number": "2.5",
                "clause_type": "social_audit",
                "title": "Social Audit Requirement",
                "content": (
                    "Social audit of all works taken up under the scheme shall be conducted "
                    "at least once in every 6 months by the Gram Sabha. "
                    "Social audit reports shall be made public within 7 days of completion."
                )
            },
        ]
    },
    {
        "policy_id": "PMAY-G-001",
        "title": "PMAY-G: Pradhan Mantri Awaas Yojana — Gramin",
        "department": "Ministry of Rural Development",
        "jurisdiction": "National",
        "effective_date": "2016-04-01",
        "version": "2.4",
        "status": "active",
        "description": (
            "PMAY-G aims to provide housing for all in rural areas by 2024. "
            "Under the scheme, financial assistance of Rs. 1.20 lakh in plain areas "
            "and Rs. 1.30 lakh in hilly/difficult areas is provided."
        ),
        "objectives": [
            "Provide pucca houses with basic amenities to rural BPL households",
            "Improve housing conditions of SC/ST, minorities and freed bonded labourers",
            "Achieve Housing for All by 2024 in rural India"
        ],
        "target_population": "Rural households living in kutcha houses or houseless, BPL priority",
        "budget_crore": 120000,
        "kpis": ["houses_sanctioned", "houses_completed", "amount_disbursed_crore",
                 "completion_rate_pct", "avg_completion_days", "beneficiary_satisfaction_score"],
        "clauses": [
            {
                "clause_number": "3.1",
                "clause_type": "eligibility",
                "title": "Beneficiary Selection Criteria",
                "content": (
                    "Beneficiaries shall be selected from the permanent wait list prepared on "
                    "the basis of SECC 2011 data, prioritizing households with zero room and "
                    "kutcha wall and kutcha roof, followed by one room with kutcha wall and roof. "
                    "SC/ST, minorities and freed bonded labourers shall receive priority."
                )
            },
            {
                "clause_number": "3.2",
                "clause_type": "benefit",
                "title": "Financial Assistance",
                "content": (
                    "Unit assistance of Rs. 1.20 lakh in plain areas and Rs. 1.30 lakh in "
                    "North-Eastern States, hilly or difficult areas, Integrated Action Plan "
                    "districts and Left Wing Extremism affected districts shall be provided. "
                    "Rs. 12,000 for construction of toilet from SBM-G. Rs. 90 per day for "
                    "90 days of unskilled labor from MGNREGS."
                )
            },
            {
                "clause_number": "3.3",
                "clause_type": "construction",
                "title": "Construction Standards",
                "content": (
                    "House shall have a minimum carpet area of 25 sq.mt including a dedicated "
                    "area for hygienic cooking. The house shall have basic amenities like toilet, "
                    "LPG connection and electricity. Construction quality shall be approved by "
                    "State Technical Agency."
                )
            },
            {
                "clause_number": "3.4",
                "clause_type": "process",
                "title": "Payment Schedule and Geo-tagging",
                "content": (
                    "Payment shall be released in installments through DBT to beneficiary's "
                    "bank account linked with Aadhaar. Each installment release is subject to "
                    "geo-tagged photograph verification at foundation, lintel and roof levels. "
                    "Total 3-4 installments based on construction stage."
                )
            },
        ]
    },
    {
        "policy_id": "PMJAY-001",
        "title": "Ayushman Bharat — Pradhan Mantri Jan Arogya Yojana (PM-JAY)",
        "department": "Ministry of Health and Family Welfare",
        "jurisdiction": "National",
        "effective_date": "2018-09-23",
        "version": "2.1",
        "status": "active",
        "description": (
            "PM-JAY provides health cover of Rs. 5 lakh per family per year for "
            "secondary and tertiary care hospitalization to the bottom 40% of "
            "India's population — approximately 10.74 crore poor and vulnerable families."
        ),
        "objectives": [
            "Provide health insurance coverage of Rs 5 lakh per family per year",
            "Cover 10.74 crore families from SECC database",
            "Reduce out-of-pocket health expenditure for poor households",
            "Enable cashless treatment at empanelled hospitals nationwide"
        ],
        "target_population": "Bottom 40% economically vulnerable families as per SECC 2011",
        "budget_crore": 7200,
        "kpis": ["beneficiaries_enrolled", "hospitalizations_covered", "claims_amount_crore",
                 "hospitals_empanelled", "avg_claim_amount", "claim_settlement_days"],
        "clauses": [
            {
                "clause_number": "4.1",
                "clause_type": "coverage",
                "title": "Health Cover Amount",
                "content": (
                    "An annual health coverage of Rs. 5 lakh per family shall be provided "
                    "on a family floater basis. Coverage includes pre-hospitalization (3 days) "
                    "and post-hospitalization (15 days) expenses including medicines, diagnostics "
                    "and specialist consultation."
                )
            },
            {
                "clause_number": "4.2",
                "clause_type": "eligibility",
                "title": "Beneficiary Identification",
                "content": (
                    "Beneficiaries shall be identified based on SECC-2011 database deprivation "
                    "criteria and occupational categories of urban workers. "
                    "Pradhan Mantri Jan Arogya Card shall be issued to each family. "
                    "Identification at hospital via Aadhaar, ration card or PM-JAY card."
                )
            },
            {
                "clause_number": "4.3",
                "clause_type": "process",
                "title": "Cashless Treatment Process",
                "content": (
                    "Beneficiary can avail cashless treatment at any empanelled public or "
                    "private hospital. Pre-authorization required for planned procedures within "
                    "1 working day. Emergency cases to be treated without pre-authorization. "
                    "Hospital to submit claim within 15 days of discharge."
                )
            },
            {
                "clause_number": "4.4",
                "clause_type": "quality",
                "title": "Hospital Empanelment Standards",
                "content": (
                    "Public hospitals with 50+ beds and private hospitals with 30+ beds are "
                    "eligible for empanelment. Hospitals must meet NABH accreditation or "
                    "equivalent quality standards within 3 years. "
                    "Annual re-empanelment review based on claim data, patient feedback "
                    "and quality indicators."
                )
            },
        ]
    },
    {
        "policy_id": "SBM-G-001",
        "title": "SBM-G: Swachh Bharat Mission — Grameen (Phase II)",
        "department": "Ministry of Jal Shakti",
        "jurisdiction": "National",
        "effective_date": "2020-02-01",
        "version": "2.0",
        "status": "active",
        "description": (
            "SBM-G Phase II focuses on sustaining ODF status and achieving ODF+ and ODF++ "
            "in rural India. It focuses on solid and liquid waste management, "
            "improving cleanliness in villages and making them ODF Sustainable."
        ),
        "objectives": [
            "Sustain ODF status achieved in Phase I",
            "Achieve ODF Plus status through SLWM",
            "Ensure no open defecation in rural areas",
            "Improve solid and liquid waste management in villages"
        ],
        "target_population": "All rural households, Gram Panchayats in India",
        "budget_crore": 52497,
        "kpis": ["odf_villages", "toilets_constructed", "slwm_units_installed",
                 "odf_plus_villages", "amount_utilised_pct"],
        "clauses": [
            {
                "clause_number": "5.1",
                "clause_type": "target",
                "title": "ODF Sustainability Target",
                "content": (
                    "All villages that achieved ODF status under Phase I shall maintain "
                    "ODF status throughout Phase II. Gram Panchayats shall conduct monthly "
                    "verification drives. Any regression from ODF status shall be reported "
                    "within 48 hours to district administration."
                )
            },
            {
                "clause_number": "5.2",
                "clause_type": "benefit",
                "title": "Incentive for Toilet Construction",
                "content": (
                    "Individual household latrines shall receive incentive of Rs. 12,000 "
                    "for construction in Phase II under convergence with MGNREGA. "
                    "Community sanitary complexes shall receive up to Rs. 2 lakh funding. "
                    "Payment via DBT upon photo verification of completion."
                )
            },
        ]
    },
    {
        "policy_id": "PMGSY-001",
        "title": "PMGSY: Pradhan Mantri Gram Sadak Yojana Phase III",
        "department": "Ministry of Rural Development",
        "jurisdiction": "National",
        "effective_date": "2019-07-01",
        "version": "3.0",
        "status": "active",
        "description": (
            "PMGSY Phase III focuses on consolidation and upgradation of rural road network "
            "linking habitations to markets and facilities. Aims to upgrade 1,25,000 km "
            "of rural road network over 5 years."
        ),
        "objectives": [
            "Upgrade existing rural road network to all weather standards",
            "Connect all agricultural markets, higher secondary schools and hospitals",
            "Improve connectivity for 97.5% habitations with population 500+"
        ],
        "target_population": "Rural habitations, agricultural markets, schools and health centres",
        "budget_crore": 80250,
        "kpis": ["roads_constructed_km", "roads_upgraded_km", "habitations_connected",
                 "amount_utilised_crore", "road_quality_score", "completion_rate_pct"],
        "clauses": [
            {
                "clause_number": "6.1",
                "clause_type": "eligibility",
                "title": "Road Selection Criteria",
                "content": (
                    "Through routes and Major Rural Links providing connectivity to "
                    "agricultural markets, higher secondary schools and hospitals "
                    "shall be considered for upgradation. Roads shall be selected from "
                    "DRRP and Core Network as approved by State."
                )
            },
            {
                "clause_number": "6.2",
                "clause_type": "quality",
                "title": "Construction Quality Standards",
                "content": (
                    "Roads shall be constructed to Rural Roads specifications (MORD). "
                    "All roads shall have 5-year maintenance contract. "
                    "Third party quality monitoring mandatory. "
                    "Online monitoring through OMMAS mandatory for all works."
                )
            },
        ]
    },
    {
        "policy_id": "PMFBY-001",
        "title": "PMFBY: Pradhan Mantri Fasal Bima Yojana",
        "department": "Ministry of Agriculture and Farmers Welfare",
        "jurisdiction": "National",
        "effective_date": "2016-01-13",
        "version": "4.0",
        "status": "active",
        "description": (
            "PMFBY provides financial support to farmers suffering crop loss/damage "
            "due to unforeseen events. It stabilizes farmer income and encourages "
            "modern agricultural practices."
        ),
        "objectives": [
            "Provide financial support to farmers affected by crop failure",
            "Stabilize farm income to ensure continuity in farming",
            "Encourage farmers to adopt innovative and modern agricultural practices",
            "Ensure flow of credit to the agriculture sector"
        ],
        "target_population": "All farmers including sharecroppers and tenant farmers growing notified crops",
        "budget_crore": 15695,
        "kpis": ["farmers_enrolled", "area_insured_lakh_ha", "claims_paid_crore",
                 "premium_collected_crore", "claim_settlement_days", "loss_assessment_accuracy"],
        "clauses": [
            {
                "clause_number": "7.1",
                "clause_type": "premium",
                "title": "Premium Rates",
                "content": (
                    "Maximum premium payable by farmers shall be 2% of sum insured for Kharif "
                    "food and oilseed crops, 1.5% for Rabi food and oilseed crops, and 5% "
                    "for annual commercial/horticulture crops. "
                    "Balance premium shall be shared equally between Central and State Government."
                )
            },
            {
                "clause_number": "7.2",
                "clause_type": "claim",
                "title": "Claim Settlement Timeline",
                "content": (
                    "Claims shall be settled within 30 days of receipt of yield data for "
                    "widespread calamity cases. Individual farm level crop loss assessment "
                    "to be completed within 72 hours of intimation. "
                    "On-account payment of 25% of likely claims for prevented sowing/planting."
                )
            },
        ]
    },
    {
        "policy_id": "NRLM-001",
        "title": "DAY-NRLM: Deendayal Antyodaya Yojana — National Rural Livelihoods Mission",
        "department": "Ministry of Rural Development",
        "jurisdiction": "National",
        "effective_date": "2011-06-03",
        "version": "3.3",
        "status": "active",
        "description": (
            "DAY-NRLM aims to reduce poverty by enabling poor households to access "
            "gainful self-employment and skilled wage employment through building "
            "strong grassroots institutions of the poor through SHGs."
        ),
        "objectives": [
            "Mobilize rural poor into Self Help Groups (SHGs)",
            "Provide financial inclusion and credit linkage to SHGs",
            "Build livelihoods for rural poor through skill development",
            "Ensure social inclusion and strengthen community institutions"
        ],
        "target_population": "Rural poor households, especially women, SC/ST and minorities",
        "budget_crore": 14236,
        "kpis": ["shgs_formed", "shg_members_crore", "credit_linked_shgs",
                 "revolving_fund_disbursed", "community_investment_fund", "livelihood_interventions"],
        "clauses": [
            {
                "clause_number": "8.1",
                "clause_type": "formation",
                "title": "SHG Formation Norms",
                "content": (
                    "Self Help Groups shall consist of 10-20 members from BPL households. "
                    "SHGs shall be formed exclusively of women except in special cases. "
                    "At least 50% members shall be from BPL families, SC/ST members in "
                    "proportion to their population ratio in the village."
                )
            },
            {
                "clause_number": "8.2",
                "clause_type": "financial",
                "title": "Revolving Fund and Credit Linkage",
                "content": (
                    "Qualifying SHGs shall receive Revolving Fund of Rs. 10,000-15,000. "
                    "Community Investment Fund up to Rs. 2.5 lakh for cluster-level federation. "
                    "Bank linkage facilitation within 6 months of SHG formation. "
                    "Interest subvention of 7% on loans up to Rs. 3 lakh to SHGs."
                )
            },
        ]
    },
    {
        "policy_id": "JJBY-001",
        "title": "PMJJBY: Pradhan Mantri Jeevan Jyoti Bima Yojana",
        "department": "Ministry of Finance",
        "jurisdiction": "National",
        "effective_date": "2015-06-01",
        "version": "2.0",
        "status": "active",
        "description": (
            "PMJJBY offers renewable one year life insurance cover of Rs. 2 lakh "
            "for death due to any reason to people in the age group 18-50 years "
            "having bank accounts at an annual premium of Rs. 436."
        ),
        "objectives": [
            "Provide life insurance coverage to low-income population",
            "Enable financial protection against death for earning members",
            "Drive financial inclusion through banking channel"
        ],
        "target_population": "Bank account holders aged 18-50 years",
        "budget_crore": 600,
        "kpis": ["subscribers_crore", "claims_settled", "claim_amount_crore",
                 "claim_rejection_rate_pct", "renewal_rate_pct"],
        "clauses": [
            {
                "clause_number": "9.1",
                "clause_type": "coverage",
                "title": "Life Cover",
                "content": (
                    "Rs. 2 lakh life insurance cover for death due to any cause. "
                    "Cover period: June 1 to May 31. Annual premium of Rs. 436 "
                    "auto-debited from bank account. Enrollment through bank branch, "
                    "BC, internet banking or mobile banking."
                )
            },
            {
                "clause_number": "9.2",
                "clause_type": "claim",
                "title": "Claim Settlement",
                "content": (
                    "Claim to be submitted within 30 days of death. "
                    "Required documents: Death certificate, discharge receipt from bank, "
                    "duly filled claim form. Claim settlement within 30 days of document submission. "
                    "Claim directly credited to nominee's bank account."
                )
            },
        ]
    },
    {
        "policy_id": "DDUGKY-001",
        "title": "DDU-GKY: Deen Dayal Upadhyaya Grameen Kaushalya Yojana",
        "department": "Ministry of Rural Development",
        "jurisdiction": "National",
        "effective_date": "2014-09-25",
        "version": "3.1",
        "status": "active",
        "description": (
            "DDU-GKY funds skill training of rural poor youth to enable them to access "
            "regular monthly wage employment. It targets youth between 15-35 years "
            "from rural poor households."
        ),
        "objectives": [
            "Skill rural poor youth for regular monthly wage employment",
            "Ensure placement of at least 70% trained youth",
            "Create inclusive growth by targeting marginalized groups"
        ],
        "target_population": "Rural poor youth aged 15-35, SC/ST, minorities, women, differently abled",
        "budget_crore": 1500,
        "kpis": ["youth_trained", "youth_placed", "placement_rate_pct",
                 "avg_monthly_wage", "training_quality_score", "retention_rate_pct"],
        "clauses": [
            {
                "clause_number": "10.1",
                "clause_type": "eligibility",
                "title": "Trainee Eligibility",
                "content": (
                    "Rural poor youth between 15-35 years of age are eligible. "
                    "Upper age limit relaxed to 45 years for SC/ST, differently abled "
                    "and women. Training partner to ensure minimum 50% women trainees "
                    "and 50% SC/ST/minorities where possible."
                )
            },
            {
                "clause_number": "10.2",
                "clause_type": "placement",
                "title": "Mandatory Placement and Retention",
                "content": (
                    "Minimum 70% of trained candidates must be placed in jobs with "
                    "regular monthly wages >= Rs. 6,000 p.m. in urban areas or "
                    ">= Rs. 4,500 p.m. in rural areas. "
                    "Placement must be retained for minimum 3 months. "
                    "Training partner funding linked to placement outcomes."
                )
            },
        ]
    }
]

# ─────────────────────────────────────────────
# SQL STATEMENTS — Create tables
# ─────────────────────────────────────────────
CREATE_TABLES_SQL = """
-- uuid-ossp for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- NOTE: vector extension (pgvector) is optional.
-- If installed, the embedding column stores vectors.
-- If not installed, embedding column is skipped (TEXT placeholder).

-- ── 3. Execution Records ─────────────────────────
CREATE TABLE IF NOT EXISTS execution_records (
    id              SERIAL PRIMARY KEY,
    record_id       UUID         DEFAULT uuid_generate_v4(),
    policy_id       INTEGER      REFERENCES policies(id) ON DELETE CASCADE,
    jurisdiction    TEXT         NOT NULL,
    state           TEXT,
    district        TEXT,
    time_period     DATE         NOT NULL,       -- First day of period
    period_type     VARCHAR(10)  DEFAULT 'monthly',  -- monthly, quarterly, annual
    aggregation_level VARCHAR(20) DEFAULT 'state',   -- district, state, national
    metrics         JSONB        NOT NULL,
    dimensions      JSONB,
    data_quality_score NUMERIC(3,2) DEFAULT 0.95,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── 4. KPI Time-Series ───────────────────────────
CREATE TABLE IF NOT EXISTS kpi_timeseries (
    id              SERIAL PRIMARY KEY,
    policy_id       INTEGER      REFERENCES policies(id) ON DELETE CASCADE,
    kpi_name        TEXT         NOT NULL,
    measured_at     DATE         NOT NULL,
    jurisdiction    TEXT,
    state           TEXT,
    observed_value  NUMERIC(18,4),
    baseline_value  NUMERIC(18,4),
    target_value    NUMERIC(18,4),
    unit            TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── 5. Anomalies ─────────────────────────────────
CREATE TABLE IF NOT EXISTS anomalies (
    id              SERIAL PRIMARY KEY,
    anomaly_id      UUID         DEFAULT uuid_generate_v4(),
    policy_id       INTEGER      REFERENCES policies(id) ON DELETE CASCADE,
    kpi_name        TEXT,
    detected_at     TIMESTAMPTZ  DEFAULT NOW(),
    time_period     DATE,
    jurisdiction    TEXT,
    severity        VARCHAR(10)  CHECK(severity IN ('critical','high','medium','low')),
    anomaly_type    VARCHAR(30),  -- spike, drop, trend_change, spatial_outlier
    observed_value  NUMERIC(18,4),
    expected_value  NUMERIC(18,4),
    deviation_magnitude NUMERIC(8,4),
    confidence_score NUMERIC(4,3),
    context         JSONB,
    status          VARCHAR(20)  DEFAULT 'open',  -- open, acknowledged, resolved, false_positive
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── 6. Recommendations ───────────────────────────
CREATE TABLE IF NOT EXISTS recommendations (
    id              SERIAL PRIMARY KEY,
    recommendation_id UUID       DEFAULT uuid_generate_v4(),
    policy_id       INTEGER      REFERENCES policies(id) ON DELETE CASCADE,
    anomaly_id      INTEGER      REFERENCES anomalies(id),
    title           TEXT         NOT NULL,
    description     TEXT,
    recommendation_type VARCHAR(30),  -- process_improvement, resource_allocation, rule_change, escalation
    priority        VARCHAR(10)  CHECK(priority IN ('critical','high','medium','low')),
    expected_impact TEXT,
    confidence_score NUMERIC(4,3),
    evidence        JSONB,
    status          VARCHAR(20)  DEFAULT 'pending_review',  -- pending_review, approved, rejected, implemented
    reviewer        TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── 7. Audit Logs ────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id              SERIAL PRIMARY KEY,
    log_id          UUID         DEFAULT uuid_generate_v4(),
    event_type      TEXT         NOT NULL,
    entity_type     TEXT,
    entity_id       TEXT,
    actor           TEXT         DEFAULT 'system',
    action          TEXT,
    details         JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clauses_policy_id       ON clauses(policy_id);
CREATE INDEX IF NOT EXISTS idx_exec_records_policy     ON execution_records(policy_id, time_period);
CREATE INDEX IF NOT EXISTS idx_exec_records_state      ON execution_records(state, time_period);
CREATE INDEX IF NOT EXISTS idx_kpi_ts_policy_kpi       ON kpi_timeseries(policy_id, kpi_name, measured_at);
CREATE INDEX IF NOT EXISTS idx_anomalies_policy        ON anomalies(policy_id, detected_at);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity      ON anomalies(severity, status);
CREATE INDEX IF NOT EXISTS idx_recommendations_policy  ON recommendations(policy_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event        ON audit_logs(event_type, created_at);
"""

# ─────────────────────────────────────────────
# HELPER FUNCTIONS
# ─────────────────────────────────────────────
def rand_date(start_year=2022, end_year=2024):
    start = date(start_year, 1, 1)
    end   = date(end_year, 12, 1)
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))

def months_back(n):
    """Return the first day of the month n months before today."""
    today = date.today()
    m = today.month - n
    y = today.year
    while m <= 0:
        m += 12
        y -= 1
    return date(y, m, 1)

def generate_execution_metrics(policy_id_str: str, period: date, state: str, district: str = None):
    """Generate realistic metric values based on policy type."""
    base = {
        "PM-KISAN-001": {
            "beneficiaries_enrolled":    random.randint(80000, 250000),
            "installments_disbursed":    random.randint(75000, 245000),
            "amount_transferred_crore":  round(random.uniform(15.0, 50.0), 2),
            "avg_processing_days":       round(random.uniform(3.0, 18.0), 1),
            "grievances_raised":         random.randint(50, 500),
            "grievances_resolved":       random.randint(40, 490),
        },
        "MGNREGA-001": {
            "person_days_generated":     random.randint(500000, 3000000),
            "households_provided_employment": random.randint(50000, 200000),
            "wages_disbursed_crore":     round(random.uniform(20.0, 150.0), 2),
            "works_completed":           random.randint(500, 5000),
            "avg_wage_per_day":          round(random.uniform(200.0, 300.0), 2),
            "women_participation_pct":   round(random.uniform(45.0, 65.0), 1),
        },
        "PMAY-G-001": {
            "houses_sanctioned":         random.randint(5000, 50000),
            "houses_completed":          random.randint(3000, 45000),
            "amount_disbursed_crore":    round(random.uniform(50.0, 500.0), 2),
            "completion_rate_pct":       round(random.uniform(55.0, 92.0), 1),
            "avg_completion_days":       round(random.uniform(180.0, 420.0), 1),
        },
        "PMJAY-001": {
            "beneficiaries_enrolled":    random.randint(100000, 800000),
            "hospitalizations_covered":  random.randint(1000, 15000),
            "claims_amount_crore":       round(random.uniform(5.0, 80.0), 2),
            "hospitals_empanelled":      random.randint(100, 600),
            "avg_claim_amount":          round(random.uniform(15000, 50000), 2),
            "claim_settlement_days":     round(random.uniform(10.0, 45.0), 1),
        },
        "PMFBY-001": {
            "farmers_enrolled":          random.randint(50000, 500000),
            "area_insured_lakh_ha":      round(random.uniform(1.0, 30.0), 2),
            "claims_paid_crore":         round(random.uniform(5.0, 200.0), 2),
            "premium_collected_crore":   round(random.uniform(2.0, 50.0), 2),
            "claim_settlement_days":     round(random.uniform(25.0, 60.0), 1),
        },
        "NRLM-001": {
            "shgs_formed":               random.randint(1000, 20000),
            "shg_members":               random.randint(10000, 200000),
            "credit_linked_shgs":        random.randint(500, 15000),
            "revolving_fund_disbursed_lakh": round(random.uniform(50.0, 500.0), 2),
        },
        "JJBY-001": {
            "subscribers":               random.randint(100000, 2000000),
            "claims_settled":            random.randint(100, 5000),
            "claim_amount_crore":        round(random.uniform(0.2, 10.0), 2),
            "renewal_rate_pct":          round(random.uniform(55.0, 85.0), 1),
        },
        "DDUGKY-001": {
            "youth_trained":             random.randint(500, 8000),
            "youth_placed":              random.randint(350, 6000),
            "placement_rate_pct":        round(random.uniform(55.0, 85.0), 1),
            "avg_monthly_wage":          round(random.uniform(7500.0, 18000.0), 2),
        },
        "SBM-G-001": {
            "odf_villages":              random.randint(200, 3000),
            "toilets_constructed":       random.randint(500, 10000),
            "odf_plus_villages":         random.randint(50, 1500),
            "amount_utilised_pct":       round(random.uniform(60.0, 95.0), 1),
        },
        "PMGSY-001": {
            "roads_constructed_km":      round(random.uniform(50.0, 800.0), 1),
            "habitations_connected":     random.randint(10, 300),
            "amount_utilised_crore":     round(random.uniform(10.0, 200.0), 2),
            "completion_rate_pct":       round(random.uniform(60.0, 90.0), 1),
        },
    }
    return base.get(policy_id_str, {"total_beneficiaries": random.randint(1000, 100000)})


def generate_anomaly(policy_db_id, policy_id_str, period: date, state: str):
    kpi_map = {
        "PM-KISAN-001":  ("avg_processing_days", 8, 3),
        "MGNREGA-001":   ("women_participation_pct", 52, 5),
        "PMAY-G-001":    ("completion_rate_pct", 72, 8),
        "PMJAY-001":     ("claim_settlement_days", 22, 6),
        "PMFBY-001":     ("claim_settlement_days", 35, 8),
        "NRLM-001":      ("shgs_formed", 5000, 1500),
        "JJBY-001":      ("renewal_rate_pct", 70, 8),
        "DDUGKY-001":    ("placement_rate_pct", 68, 10),
        "SBM-G-001":     ("odf_villages", 800, 200),
        "PMGSY-001":     ("completion_rate_pct", 72, 10),
    }
    kpi, expected_base, sigma = kpi_map.get(policy_id_str, ("metric", 100, 20))
    direction = random.choice([1, -1])
    deviation = direction * random.uniform(2.0, 4.5) * sigma
    observed  = expected_base + deviation
    dev_mag   = abs(deviation / sigma)
    severity  = "critical" if dev_mag > 4 else ("high" if dev_mag > 3 else ("medium" if dev_mag > 2 else "low"))
    atype     = "spike" if deviation > 0 else "drop"
    return {
        "policy_id":          policy_db_id,
        "kpi_name":           kpi,
        "time_period":        period,
        "jurisdiction":       state,
        "severity":           severity,
        "anomaly_type":       atype,
        "observed_value":     round(observed, 2),
        "expected_value":     round(expected_base, 2),
        "deviation_magnitude": round(dev_mag, 3),
        "confidence_score":   round(random.uniform(0.75, 0.97), 3),
        "context": Json({
            "historical_baseline": expected_base,
            "sigma":               sigma,
            "detection_method":    random.choice(["z_score", "isolation_forest", "prophet"]),
            "neighboring_states":  random.sample(STATES, 3),
        }),
        "status": random.choice(["open", "acknowledged", "resolved", "false_positive"]),
    }


RECOMMENDATION_TEMPLATES = [
    ("Accelerate Enrollment Through Mobile Camps", "process_improvement",
     "Organize mobile enrollment camps in low-coverage districts to increase beneficiary reach by 20-25%."),
    ("Digitize Manual Verification Step", "process_improvement",
     "Replace manual document verification with digital OCR+AI checks to reduce processing time from 15 to 5 days."),
    ("Increase Field Officer Allocation", "resource_allocation",
     "Deploy additional field verification officers in districts showing processing bottlenecks."),
    ("Launch Targeted Awareness Campaign", "process_improvement",
     "Run district-level awareness drives to increase scheme uptake among eligible but unenrolled population."),
    ("Streamline DBT Payment Batching", "process_improvement",
     "Optimize batch processing frequency from weekly to daily to reduce payment delay by 7 days."),
    ("Revise Eligibility Threshold", "rule_change",
     "Expand eligibility criteria to include tenant farmers and sharecroppers currently excluded."),
    ("Implement Real-time Grievance Tracking", "process_improvement",
     "Deploy SMS-based grievance tracking to improve resolution transparency and reduce pendency."),
    ("Budget Reallocation to High-Demand States", "resource_allocation",
     "Reallocate 15% of unspent budget from low-performing states to states with high demand and absorption."),
    ("Cross-department Data Sharing Protocol", "rule_change",
     "Establish formal data sharing MoU between departments to reduce duplicate verification steps."),
    ("Mandatory SHG Training Quality Audit", "process_improvement",
     "Institute third-party quarterly audits of SHG training quality to ensure standard delivery."),
]


# ─────────────────────────────────────────────
# MAIN SEEDER
# ─────────────────────────────────────────────
def run_seed():
    print("=" * 60)
    print("  BHARAT POLICY TWIN — Synthetic DB Seeder")
    print("=" * 60)

    conn = psycopg2.connect(DATABASE_URL)
    cur  = conn.cursor()

    # ── Step 1: Create tables ─────────────────
    print("\n[1/6] Creating tables...")
    cur.execute(CREATE_TABLES_SQL)
    conn.commit()
    print("      ✓ Tables created")

    # ── Step 2: Insert Policies ───────────────
    print("\n[2/6] Inserting 10 government policies...")
    policy_id_to_db_id = {}

    for p in POLICIES:
        cur.execute("""
            INSERT INTO policies (title, description)
            VALUES (%s, %s)
            RETURNING id
        """, (
            p["title"],
            p["description"]
        ))
        db_id = cur.fetchone()[0]
        policy_id_to_db_id[p["policy_id"]] = db_id
        print(f"      ✓ {p['policy_id']} → DB id={db_id}")

    conn.commit()

    # ── Step 3: Insert Clauses ────────────────
    print("\n[3/6] Inserting policy clauses...")
    total_clauses = 0
    for p in POLICIES:
        db_id = policy_id_to_db_id[p["policy_id"]]
        for c in p.get("clauses", []):
            cur.execute("""
                INSERT INTO clauses (policy_id, clause_number, text)
                VALUES (%s,%s,%s)
            """, (db_id, c["clause_number"], c["content"]))
            total_clauses += 1
    conn.commit()
    print(f"      ✓ {total_clauses} clauses inserted")

    # ── Step 4: Insert Execution Records ──────
    print("\n[4/6] Inserting execution records (24 months × states × policies)...")
    exec_count = 0
    for p in POLICIES:
        db_id = policy_id_to_db_id[p["policy_id"]]
        # Sample 5 states per policy, 24 months back
        sampled_states = random.sample(STATES, min(5, len(STATES)))
        for state in sampled_states:
            for month_offset in range(0, 24):
                period = months_back(month_offset)
                metrics = generate_execution_metrics(p["policy_id"], period, state)
                cur.execute("""
                    INSERT INTO execution_records
                        (policy_id, jurisdiction, state, time_period, period_type,
                         aggregation_level, metrics, dimensions, data_quality_score)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    db_id, "National", state, period, "monthly", "state",
                    Json(metrics),
                    Json({"department": p["department"], "program": p["policy_id"]}),
                    round(random.uniform(0.88, 1.0), 2)
                ))
                exec_count += 1
    conn.commit()
    print(f"      ✓ {exec_count} execution records inserted")

    # ── Step 5: Insert KPI Time-Series ────────
    print("\n[5/6] Inserting KPI time-series data...")
    kpi_count = 0
    for p in POLICIES:
        db_id  = policy_id_to_db_id[p["policy_id"]]
        kpis   = p.get("kpis", [])
        if not kpis:
            continue
        for kpi in kpis[:4]:  # Top 4 KPIs per policy
            baseline = random.uniform(1000, 100000)
            target   = baseline * random.uniform(1.05, 1.20)
            for month_offset in range(0, 24):
                period = months_back(month_offset)
                # Add trend + noise
                trend    = baseline * (1 + 0.02 * (24 - month_offset))
                observed = trend * random.uniform(0.90, 1.10)
                cur.execute("""
                    INSERT INTO kpi_timeseries
                        (policy_id, kpi_name, measured_at, jurisdiction, state,
                         observed_value, baseline_value, target_value, unit)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                """, (
                    db_id, kpi, period, "National", random.choice(STATES),
                    round(observed, 2), round(baseline, 2), round(target, 2),
                    "count" if "pct" not in kpi else "percent"
                ))
                kpi_count += 1
    conn.commit()
    print(f"      ✓ {kpi_count} KPI time-series records inserted")

    # ── Step 5b: Insert Anomalies ─────────────
    print("\n      Inserting anomalies...")
    anomaly_ids = []
    for p in POLICIES:
        db_id = policy_id_to_db_id[p["policy_id"]]
        n = random.randint(4, 8)
        for _ in range(n):
            state  = random.choice(STATES)
            period = months_back(random.randint(1, 18))
            a = generate_anomaly(db_id, p["policy_id"], period, state)
            cur.execute("""
                INSERT INTO anomalies
                    (policy_id, kpi_name, time_period, jurisdiction, severity, anomaly_type,
                     observed_value, expected_value, deviation_magnitude, confidence_score,
                     context, status)
                VALUES (%(policy_id)s,%(kpi_name)s,%(time_period)s,%(jurisdiction)s,
                        %(severity)s,%(anomaly_type)s,%(observed_value)s,%(expected_value)s,
                        %(deviation_magnitude)s,%(confidence_score)s,%(context)s,%(status)s)
                RETURNING id
            """, a)
            anomaly_ids.append(cur.fetchone()[0])
    conn.commit()
    print(f"      ✓ {len(anomaly_ids)} anomalies inserted")

    # ── Step 5c: Insert Recommendations ───────
    print("\n      Inserting recommendations...")
    rec_count = 0
    for i, (policy_id_str, db_id) in enumerate(policy_id_to_db_id.items()):
        n = random.randint(2, 4)
        templates = random.sample(RECOMMENDATION_TEMPLATES, n)
        for title, rtype, desc in templates:
            linked_anomaly = random.choice(anomaly_ids) if anomaly_ids else None
            cur.execute("""
                INSERT INTO recommendations
                    (policy_id, anomaly_id, title, description, recommendation_type,
                     priority, expected_impact, confidence_score, evidence, status)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                db_id, linked_anomaly, title, desc, rtype,
                random.choice(["high","medium","low"]),
                f"Estimated 10-25% improvement in {random.choice(['beneficiary coverage','processing time','cost efficiency'])}",
                round(random.uniform(0.70, 0.92), 3),
                Json({
                    "supporting_anomalies": random.randint(1, 5),
                    "historical_precedent": random.choice([True, False]),
                    "estimated_cost_crore": round(random.uniform(0.5, 50.0), 2),
                }),
                random.choice(["pending_review","pending_review","approved","implemented"])
            ))
            rec_count += 1
    conn.commit()
    print(f"      ✓ {rec_count} recommendations inserted")

    # ── Step 6: Audit Logs ────────────────────
    print("\n[6/6] Inserting audit logs...")
    audit_events = [
        ("policy_ingested",    "policy",  "Policy document ingested and parsed"),
        ("clause_extracted",   "clause",  "Clause extracted from policy document"),
        ("data_validated",     "record",  "Execution data validated by Data Sentinel"),
        ("anomaly_detected",   "anomaly", "Anomaly detected by anomaly detection agent"),
        ("recommendation_gen", "recommendation", "Recommendation generated by analysis engine"),
        ("human_review",       "recommendation", "Recommendation sent for human review"),
        ("embedding_created",  "clause",  "Vector embedding created for clause"),
        ("report_generated",   "policy",  "Monthly performance report generated"),
    ]
    actors = ["system", "data_sentinel_agent", "anomaly_agent",
              "orchestrator", "admin@bharat.gov.in", "analyst@nic.in"]
    log_count = 0
    for _ in range(120):
        event, entity, action = random.choice(audit_events)
        cur.execute("""
            INSERT INTO audit_logs (event_type, entity_type, entity_id, actor, action, details)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            event, entity,
            str(random.choice(list(policy_id_to_db_id.values()))),
            random.choice(actors), action,
            Json({
                "timestamp":    (datetime.now() - timedelta(days=random.randint(0,180))).isoformat(),
                "duration_ms":  random.randint(50, 5000),
                "success":      random.choice([True, True, True, False]),
            })
        ))
        log_count += 1
    conn.commit()
    print(f"      ✓ {log_count} audit logs inserted")

    # ── Summary ───────────────────────────────
    cur.execute("SELECT COUNT(*) FROM policies")
    pc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM clauses")
    cc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM execution_records")
    ec = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM kpi_timeseries")
    kc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM anomalies")
    ac = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM recommendations")
    rc = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM audit_logs")
    lc = cur.fetchone()[0]

    cur.close()
    conn.close()

    print("\n" + "=" * 60)
    print("  ✅ SEEDING COMPLETE — Summary")
    print("=" * 60)
    print(f"  policies         : {pc:>6}")
    print(f"  clauses          : {cc:>6}")
    print(f"  execution_records: {ec:>6}")
    print(f"  kpi_timeseries   : {kc:>6}")
    print(f"  anomalies        : {ac:>6}")
    print(f"  recommendations  : {rc:>6}")
    print(f"  audit_logs       : {lc:>6}")
    print("=" * 60)
    print("\n  Now test your API:")
    print("  curl http://localhost:8000/policies")
    print("  curl http://localhost:8000/health/db")
    print("  Open http://localhost:8000/docs\n")


if __name__ == "__main__":
    run_seed()
