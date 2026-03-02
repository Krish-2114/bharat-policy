"""AWS Bedrock Titan Embeddings. Uses boto3 bedrock-runtime."""

import json

import boto3
from botocore.config import Config

from apps.api.config import (
    AWS_ACCESS_KEY_ID,
    AWS_REGION,
    AWS_SECRET_ACCESS_KEY,
    BEDROCK_EMBEDDING_MODEL_ID,
)


class EmbeddingService:
    """
    Produces 1024-dimensional embeddings via AWS Bedrock Titan Embeddings.
    Uses environment variables for model ID and region; no hardcoded credentials.
    boto3 client is initialized lazily on first use to avoid import-time failures.
    """

    DIMENSION = 1024

    def __init__(self) -> None:
        self._client = None  # lazy — created on first call
        self._model_id = BEDROCK_EMBEDDING_MODEL_ID

    def _get_client(self):
        """Return (and lazily create) the Bedrock runtime client."""
        if self._client is None:
            kwargs: dict = {"region_name": AWS_REGION}
            if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY:
                kwargs["aws_access_key_id"] = AWS_ACCESS_KEY_ID
                kwargs["aws_secret_access_key"] = AWS_SECRET_ACCESS_KEY
            self._client = boto3.client(
                "bedrock-runtime",
                **kwargs,
                config=Config(retries={"mode": "standard", "max_attempts": 3}),
            )
        return self._client

    def embed_text(self, text: str) -> list[float]:
        """
        Embed text using Bedrock Titan. Returns 1024-dim list[float].
        """
        if not text or not text.strip():
            raise ValueError("Text must be non-empty")
        body = json.dumps({"inputText": text.strip()})
        response = self._get_client().invoke_model(
            modelId=self._model_id,
            contentType="application/json",
            accept="application/json",
            body=body,
        )
        result = json.loads(response["body"].read())
        embedding = result.get("embedding")
        if not embedding or len(embedding) != self.DIMENSION:
            raise ValueError(f"Invalid embedding returned from Titan (expected {self.DIMENSION} dims)")
        return list(embedding)
