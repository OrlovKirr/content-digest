from datetime import datetime, timezone

from card import INSERT_COLUMNS, Card, insert_values, row_to_card, synthesize_card

DIGEST = {
    "summary": "A summary.",
    "key_points": ["one", "two"],
    "tags": ["ai", "data"],
    "suggested_category": "Technology",
}


def test_insert_values_orders_and_maps_category_from_suggested():
    values = insert_values("https://x.test", "Title", DIGEST, card_id="fixed-id")
    # Aligns 1:1 with INSERT_COLUMNS order.
    assert len(values) == len(INSERT_COLUMNS)
    by_col = dict(zip(INSERT_COLUMNS, values))
    assert by_col["id"] == "fixed-id"
    assert by_col["url"] == "https://x.test"
    assert by_col["title"] == "Title"
    assert by_col["summary"] == "A summary."
    assert by_col["key_points"] == ["one", "two"]
    assert by_col["tags"] == ["ai", "data"]
    assert by_col["category"] == "Technology"


def test_insert_values_defaults_empty_url_and_title():
    by_col = dict(zip(INSERT_COLUMNS, insert_values(None, None, DIGEST, card_id="i")))
    assert by_col["url"] == ""
    assert by_col["title"] == ""


def test_insert_values_generates_a_unique_id_when_none_given():
    a = dict(zip(INSERT_COLUMNS, insert_values("u", "t", DIGEST)))["id"]
    b = dict(zip(INSERT_COLUMNS, insert_values("u", "t", DIGEST)))["id"]
    assert a and b and a != b


def test_row_to_card_maps_a_db_record_into_a_card():
    created = datetime(2026, 6, 17, 12, 0, tzinfo=timezone.utc)
    row = {
        "id": "abc-123",
        "url": "https://x.test",
        "title": "Title",
        "summary": "A summary.",
        "key_points": ["one", "two"],
        "tags": ["ai"],
        "category": "Science",
        "created_at": created,
    }
    card = row_to_card(row)
    assert isinstance(card, Card)
    assert card.id == "abc-123"
    assert card.category == "Science"
    assert card.key_points == ["one", "two"]
    assert card.created_at == created


def test_row_to_card_stringifies_non_string_ids():
    import uuid

    raw_id = uuid.uuid4()
    row = {
        "id": raw_id,
        "url": "",
        "title": "",
        "summary": "S",
        "key_points": [],
        "tags": [],
        "category": "Other",
        "created_at": datetime.now(timezone.utc),
    }
    assert row_to_card(row).id == str(raw_id)


def test_synthesize_card_builds_a_full_card_without_a_db():
    now = datetime(2026, 6, 17, tzinfo=timezone.utc)
    card = synthesize_card("https://x.test", "Title", DIGEST, now=now, card_id="i")
    assert card.id == "i"
    assert card.url == "https://x.test"
    assert card.category == "Technology"
    assert card.created_at == now


def test_synthesize_card_generates_id_and_timestamp_when_omitted():
    card = synthesize_card(None, None, DIGEST)
    assert card.id
    assert card.url == ""
    assert isinstance(card.created_at, datetime)
