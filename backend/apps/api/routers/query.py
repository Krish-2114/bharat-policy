"""Query router — semantic retrieval via pgvector."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from apps.api.database import get_db
from apps.api.rag.embedder import EmbeddingService

router = APIRouter(tags=["query"])


class QueryRequest(BaseModel):
    query: str


class ClauseResult(BaseModel):
    policy_id: int
    clause_id: int
    clause_number: str
    text: str
    score: float


class QueryResponse(BaseModel):
    results: list[ClauseResult]


@router.post("/query", response_model=QueryResponse)
def semantic_query(
    request: QueryRequest,
    db: Session = Depends(get_db),
) -> QueryResponse:
    """
    Embed the query with Bedrock, retrieve top 5 clauses by pgvector cosine similarity.
    """
    try:
        embedder = EmbeddingService()
        embedding_vector = embedder.embed_text(request.query)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Embedding service error: {str(e)}")

    if not embedding_vector or len(embedding_vector) != 1024:
        raise HTTPException(status_code=503, detail="Invalid embedding vector returned from Bedrock.")

    vec_str = "[" + ",".join(str(x) for x in embedding_vector) + "]"
    stmt = text("""
        SELECT id, policy_id, clause_number, text,
               1 - (embedding <=> CAST(:vec AS vector)) AS score
        FROM clauses
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:vec AS vector)
        LIMIT 5
    """)
    rows = db.execute(stmt, {"vec": vec_str}).fetchall()

    results = [
        ClauseResult(
            policy_id=r.policy_id,
            clause_id=r.id,
            clause_number=r.clause_number,
            text=r.text,
            score=round(r.score, 6),
        )
        for r in rows
    ]
    return QueryResponse(results=results)
