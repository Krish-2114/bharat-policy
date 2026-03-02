"""Text extraction and clause splitting. Deterministic, no AI."""

import re
from pathlib import Path

from pypdf import PdfReader
from io import BytesIO


def extract_text(content: bytes, filename: str) -> str:
    """
    Extract plain text from file content.
    Supports .txt and .pdf. Raises ValueError for unsupported types.
    """
    path = Path(filename)
    suffix = path.suffix.lower()

    if suffix == ".txt":
        return content.decode("utf-8", errors="replace").strip()
    if suffix == ".pdf":
        reader = PdfReader(BytesIO(content))
        parts = []
        for page in reader.pages:
            parts.append(page.extract_text() or "")
        return "\n".join(parts).strip()
    raise ValueError(f"Unsupported file type: {suffix}. Use .txt or .pdf.")


def split_into_clauses(text: str) -> list[tuple[str, str]]:
    """
    Split document text into clauses by numbered headings or Section N.
    Returns list of (clause_number, clause_text).
    If no numbering pattern is found, splits by paragraphs and numbers as "1", "2", ...
    """
    if not text or not text.strip():
        return []

    text = text.strip()
    # Pattern: at line start, optional whitespace, then either:
    # - digit(s) with optional .digit blocks, optional trailing dot (e.g. 1., 1.1, 2.1.3.)
    # - or "Section" followed by digits (e.g. Section 1, Section 3)
    numbered = re.compile(
        r"(?m)^\s*((?:\d+(?:\.\d+)*\.?)|(?:Section\s+\d+))\s*[.:]?\s*",
        re.IGNORECASE,
    )
    matches = list(numbered.finditer(text))

    if not matches:
        return _split_by_paragraphs(text)

    clauses: list[tuple[str, str]] = []
    for i, m in enumerate(matches):
        clause_number = _normalize_clause_number(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        clause_text = text[start:end].strip()
        if clause_text:
            clauses.append((clause_number, clause_text))

    # If we only found one clause and it's the whole doc, fall back to paragraphs
    if len(clauses) <= 1 and len(text) > 500:
        return _split_by_paragraphs(text)

    return clauses if clauses else _split_by_paragraphs(text)


def _normalize_clause_number(raw: str) -> str:
    """Normalize heading to clause number string (e.g. '1.' -> '1', 'Section 3' -> 'Section 3')."""
    raw = raw.strip()
    if re.match(r"^\d+(?:\.\d+)*\.?$", raw):
        return raw.rstrip(".")
    return raw


def _split_by_paragraphs(text: str) -> list[tuple[str, str]]:
    """Split by one or more blank lines; number clauses as 1, 2, 3, ..."""
    blocks = re.split(r"\n\s*\n+", text)
    clauses: list[tuple[str, str]] = []
    for i, block in enumerate(blocks, start=1):
        block = block.strip()
        if block:
            clauses.append((str(i), block))
    return clauses
