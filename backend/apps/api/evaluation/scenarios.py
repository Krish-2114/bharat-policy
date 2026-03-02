"""
Evaluation scenarios — predefined test cases for each agent.
Used to benchmark accuracy, confidence, retrieval precision.
"""

# Each scenario: {name, agent, input, expected fields in output}
EVAL_SCENARIOS = [
    # ── Compliance Agent ──────────────────────────────
    {
        "name": "compliance_clear_violation",
        "agent": "compliance",
        "input": "An employee was not given any notice before termination",
        "expected_verdict_contains": ["VIOLATION"],
        "expected_risk_levels": ["HIGH", "CRITICAL", "MEDIUM"],
        "tags": ["compliance", "employment"],
    },
    {
        "name": "compliance_no_violation",
        "agent": "compliance",
        "input": "Employee submitted leave request 30 days in advance as required",
        "expected_verdict_contains": ["NO_VIOLATION"],
        "expected_risk_levels": ["LOW", "MEDIUM"],
        "tags": ["compliance", "leave"],
    },
    {
        "name": "compliance_partial",
        "agent": "compliance",
        "input": "Contractor submitted report 2 days late but with all required information",
        "expected_verdict_contains": ["PARTIAL_VIOLATION", "VIOLATION", "NO_VIOLATION"],
        "expected_risk_levels": ["LOW", "MEDIUM", "HIGH"],
        "tags": ["compliance", "reporting"],
    },

    # ── Policy Analyst ────────────────────────────────
    {
        "name": "analyst_extract_obligations",
        "agent": "policy_analyst",
        "input": "What are the obligations in this policy?",
        "expected_fields": ["obligations", "summary", "stakeholders"],
        "tags": ["analyst"],
    },
    {
        "name": "analyst_extract_deadlines",
        "agent": "policy_analyst",
        "input": "What are all the deadlines and timeframes?",
        "expected_fields": ["deadlines", "obligations"],
        "tags": ["analyst"],
    },

    # ── Risk Agent ────────────────────────────────────
    {
        "name": "risk_full_assessment",
        "agent": "risk_assessment",
        "input": "Assess all risks in this policy",
        "expected_fields": ["overall_risk_score", "risk_level", "top_risks"],
        "expected_score_range": (0, 10),
        "tags": ["risk"],
    },

    # ── Gap Analysis ──────────────────────────────────
    {
        "name": "gap_enforcement_weakness",
        "agent": "gap_analysis",
        "input": "Find enforcement weaknesses and undefined responsibilities",
        "expected_fields": ["weak_enforcement_areas", "undefined_responsibilities"],
        "tags": ["gap"],
    },

    # ── Amendment Agent ───────────────────────────────
    {
        "name": "amendment_strengthen",
        "agent": "amendment_drafting",
        "input": "Strengthen weak enforcement clauses",
        "expected_fields": ["amendments", "amendment_summary"],
        "tags": ["amendment"],
    },
]
