import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

AUTHOR_ID = "LwiJwNYAAAAJ"
INDEX_HTML = os.path.join(os.path.dirname(__file__), "..", "index.html")

# Read merged citation counts straight from the (public) Google Scholar profile via
# SerpAPI's google_scholar_author engine. This returns Scholar's own combined count
# per paper -- all version-clusters merged -- so it matches the profile exactly.
# Requires the profile to be public; if it is set private again, Google serves a 404
# and the endpoint returns zero articles (handled below with a clear error).
#
# Each paper is matched by a lowercased title prefix; "venue" is the marker in
# index.html whose citation count gets updated.
PAPERS = {
    "mish": {
        "prefix": "mish: a self regularized non-monotonic activation function",
        "venue": "BMVC 2020",
    },
    "triplet": {
        "prefix": "rotate to attend",
        "venue": "WACV 2021",
    },
}


def fetch_articles(api_key):
    params = urllib.parse.urlencode({
        "engine": "google_scholar_author",
        "author_id": AUTHOR_ID,
        "hl": "en",
        "num": "100",
        "api_key": api_key,
    })
    url = f"https://serpapi.com/search.json?{params}"
    with urllib.request.urlopen(url, timeout=60) as resp:
        data = json.loads(resp.read())

    if "error" in data:
        print(f"SerpAPI error: {data['error']}", file=sys.stderr)
        sys.exit(1)

    articles = data.get("articles", [])
    if not articles:
        print(
            "ERROR: author endpoint returned no articles. The Google Scholar "
            "profile is likely private again (Google serves a 404 to public "
            "clients). Re-enable 'Make my profile public' in Scholar.",
            file=sys.stderr,
        )
        sys.exit(1)
    return articles


def find_count(articles, prefix):
    """Citation count of the article whose title starts with prefix (lowercased)."""
    for a in articles:
        if a.get("title", "").lower().startswith(prefix):
            return (a.get("cited_by") or {}).get("value") or 0
    return None


def floor100(n):
    return (n // 100) * 100


def fmt(n):
    # Floored, so the "+" suffix ("at least N") is always truthful.
    return f"{floor100(n):,}+"


def current_value(content, venue):
    """The number currently shown in index.html for a venue, or None."""
    m = re.search(rf"{re.escape(venue)} &nbsp;·&nbsp; ([\d,]+)\+ citations", content)
    return int(m.group(1).replace(",", "")) if m else None


def update_html(values):
    with open(INDEX_HTML) as f:
        content = f.read()
    original = content

    for key, count in values.items():
        venue = PAPERS[key]["venue"]
        new_floor = floor100(count)
        # Citations only ever increase. A computed value below what is already
        # displayed means something broke; refuse to write a regression.
        existing = current_value(content, venue)
        if existing is not None and new_floor < existing:
            print(
                f"ERROR: {key} dropped from {existing} to {new_floor} "
                f"(raw {count}); refusing to write a regression.",
                file=sys.stderr,
            )
            sys.exit(1)
        content = re.sub(
            rf"({re.escape(venue)} &nbsp;·&nbsp; )[\d,]+\+ citations",
            lambda m: f"{m.group(1)}{fmt(count)} citations",
            content,
        )

    if content == original:
        return False
    with open(INDEX_HTML, "w") as f:
        f.write(content)
    return True


if __name__ == "__main__":
    api_key = os.environ.get("SERPAPI_KEY", "")
    if not api_key:
        print("ERROR: SERPAPI_KEY not set", file=sys.stderr)
        sys.exit(1)

    print("Fetching author profile...")
    try:
        articles = fetch_articles(api_key)
    except urllib.error.URLError as e:
        print(f"ERROR contacting SerpAPI: {e}", file=sys.stderr)
        sys.exit(1)
    print(f"  {len(articles)} articles returned")

    values = {}
    for key, cfg in PAPERS.items():
        count = find_count(articles, cfg["prefix"])
        if not count:
            print(f"ERROR: '{key}' not found on profile.", file=sys.stderr)
            sys.exit(1)
        print(f"  {key}: {count} -> {fmt(count)}")
        values[key] = count

    changed = update_html(values)
    print("index.html updated." if changed else "No change needed.")
