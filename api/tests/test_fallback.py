from fallback import fallback_digest
from schema import CATEGORIES


def test_fallback_returns_a_valid_digest_shape():
    text = (
        "Researchers published a new study on quantum physics. "
        "The experiment measured energy at low temperature. "
        "Scientists called the discovery important for the field."
    )
    out = fallback_digest(text)
    assert out["summary"]
    assert 1 <= len(out["key_points"]) <= 5
    assert 1 <= len(out["tags"]) <= 5
    assert out["suggested_category"] in CATEGORIES


def test_fallback_summary_is_first_two_sentences():
    text = "First sentence. Second sentence. Third sentence."
    out = fallback_digest(text)
    assert out["summary"] == "First sentence. Second sentence."


def test_fallback_categorizes_by_keyword():
    text = "The startup raised funding and grew revenue with a new product for customers."
    assert fallback_digest(text)["suggested_category"] == "Business"


def test_fallback_tags_are_lowercase_and_deduped():
    text = "Software software code Code data data data."
    tags = fallback_digest(text)["tags"]
    assert tags == [t.lower() for t in tags]
    assert len(tags) == len(set(tags))


def test_fallback_handles_empty_text_without_crashing():
    out = fallback_digest("")
    assert out["key_points"]
    assert out["tags"] == ["untagged"]
    assert out["suggested_category"] == "Other"
