"""Policy file upload endpoint."""

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from apps.api.database import get_db
from services.policy_service import ingest_policy

router = APIRouter(tags=["upload"])


@router.post("/upload-policy")
async def upload_policy(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload a policy document (.txt or .pdf).
    Extracts text, splits into clauses, embeds via Bedrock, stores in DB.
    Returns policy_id and clause_count.
    """
    suffix = (file.filename or "").lower()
    if not suffix.endswith(".txt") and not suffix.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .pdf files are supported.",
        )

    content = await file.read()
    try:
        policy_id, clause_count = ingest_policy(db, title, content, file.filename or "document")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ingestion error (check AWS credentials/Bedrock access): {str(e)}")

    return {"policy_id": policy_id, "clause_count": clause_count}
