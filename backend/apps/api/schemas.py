"""Pydantic schemas for request/response."""

from pydantic import BaseModel, ConfigDict


class PolicyCreate(BaseModel):
    """Schema for creating a policy."""

    title: str
    description: str | None = None


class PolicyResponse(BaseModel):
    """Schema for policy response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None


class ClauseResponse(BaseModel):
    """Schema for clause response."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    policy_id: int
    clause_number: str
    text: str


class PolicyWithClausesResponse(BaseModel):
    """Schema for policy with nested clauses."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None = None
    clauses: list[ClauseResponse] = []
