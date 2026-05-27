import os
import re
import sys
import urllib.error
import urllib.request

SCHOLAR_URL = (
    "https://scholar.google.com/citations"
    "?user=LwiJwNYAAAAJ&hl=en&pagesize=100"
)
INDEX_HTML = os.path.join(os.path.dirname(__file__), "..", "index.html")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def fetch_html():
    req = urllib.request.Request(SCHOLAR_URL, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_citations(html):
    if "g-recaptcha" in html or "not a robot" in html.lower():
        print("ERROR: Google Scholar returned a CAPTCHA — runner IP is blocked.", file=sys.stderr)
        sys.exit(1)

    rows = re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', html, re.DOTALL)
    print(f"Found {len(rows)} papers on author page")

    mish = None
    triplet = None

    for row in rows:
        title_m = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', row, re.DOTALL)
        cite_m = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(\d+)<', row)
        if not title_m:
            continue
        title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip()
        cites = int(cite_m.group(1)) if cite_m else 0
        print(f"  [{cites:5d}] {title!r}")
        tl = title.lower()
        if "mish" in tl:
            mish = cites
        elif "triplet attention" in tl or "rotate to attend" in tl:
            triplet = cites

    return mish, triplet


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
    try:
        html = fetch_html()
    except urllib.error.URLError as e:
        print(f"ERROR fetching Google Scholar: {e}", file=sys.stderr)
        sys.exit(1)

    mish, triplet = parse_citations(html)

    if mish is None or triplet is None:
        print(f"ERROR: paper not found. mish={mish}, triplet={triplet}", file=sys.stderr)
        sys.exit(1)

    print(f"Mish:    {mish} -> {fmt(mish)}")
    print(f"Triplet: {triplet} -> {fmt(triplet)}")

    changed = update_html(mish, triplet)
    print("index.html updated." if changed else "No change needed.")
