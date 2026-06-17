from schema import CATEGORIES, normalize_digest


def test_categories_are_the_fixed_taxonomy():
    assert CATEGORIES == (
        "Technology",
        "Business",
        "Science",
        "Health",
        "Culture",
        "Other",
    )


def test_normalize_trims_and_clamps_key_points_to_five():
    raw = {
        "summary": "  A summary.  ",
        "key_points": [" one ", "two", "", "three", "four", "five", "six"],
        "tags": ["alpha"],
        "suggested_category": "Science",
    }
    out = normalize_digest(raw)
    assert out["summary"] == "A summary."
    assert out["key_points"] == ["one", "two", "three", "four", "five"]


def test_normalize_lowercases_dedupes_and_clamps_tags():
    raw = {
        "summary": "S",
        "key_points": ["k"],
        "tags": [" AI ", "ai", "Data", "data", "Cloud", "edge", "ml", "io"],
        "suggested_category": "Technology",
    }
    out = normalize_digest(raw)
    assert out["tags"] == ["ai", "data", "cloud", "edge", "ml"]


def test_normalize_unknown_category_falls_back_to_other():
    raw = {
        "summary": "S",
        "key_points": ["k"],
        "tags": ["t"],
        "suggested_category": "Politics",
    }
    assert normalize_digest(raw)["suggested_category"] == "Other"


def test_normalize_empty_key_points_defaults_to_summary():
    raw = {
        "summary": "Only the summary.",
        "key_points": ["", "   "],
        "tags": [],
        "suggested_category": "Other",
    }
    out = normalize_digest(raw)
    assert out["key_points"] == ["Only the summary."]
    assert out["tags"] == ["untagged"]
