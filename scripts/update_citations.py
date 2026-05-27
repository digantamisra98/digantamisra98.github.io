import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

AUTHOR_ID = "LwiJwNYAAAAJ"
INDEX_HTML = os.path.join(os.path.dirname(__file__), "..", "index.html")


def fetch_citations(api_key):
    params = urllib.parse.urlencode({
        "engine": "google_scholar_author",
        "author_id": AUTHOR_ID,
        "api_key": api_key,
    })
    url = f"https://serpapi.com/search.json?{params}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.loads(resp.read())

    # Surface any API-level error
    if "error" in data:
        print(f"SerpAPI error: {data['error']}", file=sys.stderr)
        sys.exit(1)

    articles = data.get("articles", [])
    print(f"Articles returned by SerpAPI: {len(articles)}")
    for a in articles:
        title = a.get("title", "")
        count = (a.get("cited_by") or {}).get("value", "?")
        print(f"  [{count}] {title!r}")

    mish = None
    triplet = None
    for article in articles:
        title = article.get("title", "").lower()
        count = (article.get("cited_by") or {}).get("value") or 0
        if "mish" in title:
            mish = count
        elif "triplet attention" in title or "rotate to attend" in title:
            triplet = count

    return mish, triplet


def floor100(n):
    return (n // 100) * 100


def fmt(n):
    return f"{floor100(n):,}+"


def update_html(mish, triplet):
    with open(INDEX_HTML, "r") as f:
        content = f.read()

    original = content

    content = re.sub(
        r"(BMVC 2020 &nbsp;·&nbsp; )[\d,]+\+ citations",
        lambda m: f"{m.group(1)}{fmt(mish)} citations",
        content,
    )
    content = re.sub(
        r"(WACV 2021 &nbsp;·&nbsp; )[\d,]+\+ citations",
        lambda m: f"{m.group(1)}{fmt(triplet)} citations",
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
        print("ERROR: SERPAPI_KEY environment variable not set", file=sys.stderr)
        sys.exit(1)

    try:
        mish, triplet = fetch_citations(api_key)
    except urllib.error.URLError as e:
        print(f"ERROR fetching from SerpAPI: {e}", file=sys.stderr)
        sys.exit(1)

    if mish is None or triplet is None:
        print(
            f"ERROR: paper not found in author profile. mish={mish}, triplet={triplet}",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Mish:    {mish} -> {fmt(mish)}")
    print(f"Triplet: {triplet} -> {fmt(triplet)}")

    changed = update_html(mish, triplet)
    print("index.html updated." if changed else "No change needed.")
