from extract import strip_html


def test_strip_html_removes_tags_and_collapses_whitespace():
    html = "<p>Hello   <b>world</b></p>\n<p>Second  line</p>"
    assert strip_html(html) == "Hello world Second line"


def test_strip_html_decodes_simple_entities():
    assert strip_html("a&nbsp;b&amp;c") == "a b c"


def test_strip_html_empty_input():
    assert strip_html("") == ""
