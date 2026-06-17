from prompt import build_system_prompt, build_user_content


def test_system_prompt_names_every_category():
    prompt = build_system_prompt()
    for category in ("Technology", "Business", "Science", "Health", "Culture", "Other"):
        assert category in prompt


def test_user_content_includes_title_when_present():
    out = build_user_content("Body text.", "My Title")
    assert out.startswith("Title: My Title")
    assert "Article:\nBody text." in out


def test_user_content_omits_title_header_when_absent():
    out = build_user_content("Body text.")
    assert "Title:" not in out
    assert out == "Article:\nBody text."


def test_user_content_trims_whitespace():
    out = build_user_content("  Body.  ", "  T  ")
    assert out == "Title: T\n\nArticle:\nBody."
