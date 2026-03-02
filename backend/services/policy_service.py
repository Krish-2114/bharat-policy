"""Policy ingestion service. Creates policy and clauses from uploaded file."""

from sqlalchemy.orm import Session

from apps.api.models import Clause, Policy
from apps.api.rag.embedder import EmbeddingService
from utils.text_parser import extract_text, split_into_clauses

_embedder = EmbeddingService()


def ingest_policy(
    db: Session,
    title: str,
    file_content: bytes,
    filename: str,
) -> tuple[int, int]:
    """
    Ingest a policy document: extract text, split into clauses, persist.
    Generates embedding via Bedrock and stores in clause.embedding.
    Returns (policy_id, clause_count).
    """
    text = extract_text(file_content, filename)
    policy = Policy(title=title, description=None)
    db.add(policy)
    db.flush()

    clauses_data = split_into_clauses(text)
    clause_objects: list[Clause] = []

    for clause_number, clause_text in clauses_data:
        clause = Clause(
            policy_id=policy.id,
            clause_number=clause_number,
            text=clause_text,
        )
        db.add(clause)
        clause_objects.append(clause)

    db.commit()
    db.refresh(policy)

    for clause in clause_objects:
        db.refresh(clause)
        embedding = _embedder.embed_text(clause.text)
        if not embedding or len(embedding) != 1024:
            raise ValueError("Embedding dimension mismatch during ingest")
        clause.embedding = embedding
        db.add(clause)
    db.commit()

    return policy.id, len(clauses_data)
