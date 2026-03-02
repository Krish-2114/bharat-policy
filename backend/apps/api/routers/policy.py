"""Policy CRUD and upload endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.models import Clause, Policy
from apps.api.schemas import (
    ClauseResponse,
    PolicyCreate,
    PolicyResponse,
)

router = APIRouter(prefix="/policies", tags=["policies"])


@router.post("", response_model=PolicyResponse)
def create_policy(payload: PolicyCreate, db: Session = Depends(get_db)):
    """Create a new policy."""
    policy = Policy(title=payload.title, description=payload.description)
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("", response_model=list[PolicyResponse])
def list_policies(db: Session = Depends(get_db)):
    """List all policies."""
    return db.query(Policy).order_by(Policy.id).all()


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    """Get a policy by id."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.get("/{policy_id}/clauses", response_model=list[ClauseResponse])
def get_policy_clauses(policy_id: int, db: Session = Depends(get_db)):
    """Get all clauses for a policy."""
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    clauses = db.query(Clause).filter(Clause.policy_id == policy_id).order_by(Clause.id).all()
    return clauses
