import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

INDEX_HTML = os.path.join(os.path.dirname(__file__), "..", "index.html")

PAPERS = {
    "mish": "Mish Self Regularized Non-Monotonic Neural Activation Function Diganta Misra",
    "triplet": "Rotate to Attend Convolutional Triplet Attention Module Diganta Misra",
}


def search_citations(api_key, query):
    params = urllib.parse.urlencode({
        "engine": "google_scholar",
        "q": query,
        "api_key": api_key,
    })
    url = f"https://serpapi.com/search.json?{params}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        data = json.loads(resp.read())

    if "error" in data:
        print(f"SerpAPI error: {data['error']}", file=sys.stderr)
        sys.exit(1)

    results = data.get("organic_results", [])
    print(f"  {len(results)} results")
    for r in results:
        title = r.get("title", "")
        count = (r.get("inline_links") or {}).get("cited_by", {}).get("total", 0) or 0
        print(f"    [{count:5d}] {title!r}")

    # Return max citation count across all results (handles duplicate entries)
    counts = [
        (r.get("inline_links") or {}).get("cited_by", {}).get("total", 0) or 0
        for r in results
    ]
    return max(counts) if counts else None


def floor100(n):
    return (n // 100) * 100


def fmt(n):
    return f"{floor100(n):,}+"


def update_html(mish, triplet):
    with open(INDEX_HTML) as f:
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
        print("ERROR: SERPAPI_KEY not set", file=sys.stderr)
        sys.exit(1)

    print("Searching Mish...")
    try:
        mish = search_citations(api_key, PAPERS["mish"])
        print(f"\nSearching Triplet Attention...")
        triplet = search_citations(api_key, PAPERS["triplet"])
    except urllib.error.URLError as e:
        print(f"ERROR contacting SerpAPI: {e}", file=sys.stderr)
        sys.exit(1)

    if not mish or not triplet:
        print(f"ERROR: could not find citations. mish={mish}, triplet={triplet}", file=sys.stderr)
        sys.exit(1)

    print(f"\nMish:    {mish} -> {fmt(mish)}")
    print(f"Triplet: {triplet} -> {fmt(triplet)}")

    changed = update_html(mish, triplet)
    print("index.html updated." if changed else "No change needed.")
