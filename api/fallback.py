"""Deterministic, network-free, key-free digest used when OPENROUTER_API_KEY is unset.

Ported from server/src/digest/fallback.ts to keep the PRD "works without an AI
key" criterion under the new stack.
"""
import re
from typing import Dict, List, Optional

from schema import CATEGORIES

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for",
    "with", "as", "at", "by", "from", "into", "is", "are", "was", "were", "be",
    "this", "that", "these", "those", "it", "its", "they", "them", "their", "we",
    "our", "you", "your", "not", "no", "so", "than", "then", "there", "here",
    "all", "any", "every", "new", "more", "most", "very", "just", "also", "only",
    "one", "two", "now", "near", "back", "like", "well",
}

# Real (non-"Other") categories scored by keyword hits.
KEYWORDS: Dict[str, set] = {
    "Technology": {"software", "code", "data", "tech", "digital", "algorithm", "app", "computer", "cloud", "machine", "ai", "programming", "internet"},
    "Business": {"business", "market", "revenue", "funding", "startup", "company", "customer", "sales", "profit", "investment", "economy", "growth", "product", "money"},
    "Science": {"science", "research", "study", "physics", "chemistry", "biology", "experiment", "theory", "space", "quantum", "climate", "energy", "discovery"},
    "Health": {"health", "medical", "disease", "doctor", "patient", "hospital", "medicine", "mental", "diet", "virus", "vaccine", "therapy", "treatment"},
    "Culture": {"art", "music", "film", "book", "culture", "history", "food", "travel", "fashion", "design", "story", "game", "movie"},
}


def _sentences(text: str) -> List[str]:
    collapsed = re.sub(r"\s+", " ", text).strip()
    if not collapsed:
        return []
    parts = re.split(r"(?<=[.!?])\s+", collapsed)
    return [s.strip() for s in parts if s.strip()]


def _content_words(text: str) -> List[str]:
    words = re.findall(r"[a-z0-9]+", text.lower())
    return [w for w in words if len(w) >= 2 and w not in STOPWORDS]


def _suggest_category(words: List[str]) -> str:
    scores: Dict[str, int] = {}
    for word in words:
        for category, keywords in KEYWORDS.items():
            if word in keywords:
                scores[category] = scores.get(category, 0) + 1
    best = "Other"
    best_score = 0
    for category in CATEGORIES:
        if category == "Other":
            continue
        score = scores.get(category, 0)
        if score > best_score:
            best_score = score
            best = category
    return best if best_score > 0 else "Other"


def fallback_digest(text: str, title: Optional[str] = None) -> Dict[str, object]:
    clean = text.strip()
    sentences = _sentences(clean)
    words = _content_words(clean)

    summary = " ".join(sentences[:2]) or clean

    scored = [
        {"sentence": s, "idx": i, "score": len(_content_words(s))}
        for i, s in enumerate(sentences)
    ]
    top = sorted(scored, key=lambda s: (-s["score"], s["idx"]))[: min(4, len(scored))]
    key_points = [s["sentence"] for s in sorted(top, key=lambda s: s["idx"])]

    counts: Dict[str, int] = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    tags = [
        word
        for word, _ in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:5]
    ]

    return {
        "summary": summary,
        "key_points": key_points if key_points else [summary],
        "tags": tags if tags else ["untagged"],
        "suggested_category": _suggest_category(words),
    }
