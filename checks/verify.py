"""Validate the static repository with the Python standard library. Run from any directory."""
import collections
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = "https://browsersignal.site"
PUBLISHER = "ca-pub-4542287035866555"
SCRIPT = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + PUBLISHER
EMAIL = "snapexdua@gmail.com"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.relative = path.relative_to(ROOT).as_posix()
        self.route = "/" + self.relative.removesuffix("index.html")
        self.tags = collections.defaultdict(list)
        self.ids = set()
        self.references = []
        self.current = ""
        self.titles = []
        self.schemas = []
        self.feed(path.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        self.tags[tag].append(props)
        if "id" in props:
            assert props["id"] not in self.ids, f"Duplicate id in {self.route}: {props['id']}"
            self.ids.add(props["id"])
        for key in ("href", "src"):
            if key in props:
                self.references.append((tag, props[key]))
        self.current = tag if tag == "title" else ""
        if tag == "script" and props.get("type") == "application/ld+json":
            self.current = "schema"

    def handle_endtag(self, tag):
        self.current = ""

    def handle_data(self, data):
        if self.current == "schema":
            self.schemas.append(json.loads(data))
        if self.current == "title":
            self.titles.append(data)


def run():
    pages = {p.route: p for p in (Page(f) for f in ROOT.rglob("*.html"))}
    content = {k: v for k, v in pages.items() if k != "/404.html" and not k.startswith("/assets/")}
    graph = collections.defaultdict(set)
    internal_links = 0
    titles, descriptions, ads_pages = [], [], set()
    for route, page in pages.items():
        assert len(page.tags["h1"]) == 1, route
        assert len(page.tags["main"]) == 1, route
        assert page.tags["html"][0].get("lang") == "en", route
        assert len(page.titles) == 1, route
        if route in content:
            titles.extend(page.titles)
            desc = [m.get("content") for m in page.tags["meta"] if m.get("name") == "description"]
            assert len(desc) == 1 and desc[0], route
            descriptions.extend(desc)
            assert [l.get("href") for l in page.tags["link"] if l.get("rel") == "canonical"] == [ORIGIN + route], route
            assert [m.get("content") for m in page.tags["meta"] if m.get("property") == "og:url"] == [ORIGIN + route], route
            assert len(page.schemas) == 1 and page.schemas[0]["url"] == ORIGIN + route, route
            assert [m.get("content") for m in page.tags["meta"] if m.get("name") == "google-adsense-account"] == [PUBLISHER], route
            assert not any("noindex" in (m.get("content") or "").lower() for m in page.tags["meta"] if m.get("name") == "robots"), route
            if page.schemas[0]["@type"] == "Article":
                assert page.schemas[0]["author"]["name"] == "Lilik Hartanti", route
                assert page.schemas[0]["datePublished"] <= page.schemas[0]["dateModified"], route
        else:
            assert any(m.get("name") == "robots" and "noindex" in m["content"] for m in page.tags["meta"]), route
        ad = [s for s in page.tags["script"] if "adsbygoogle.js" in str(s.get("src", ""))]
        if ad:
            assert len(ad) == 1 and ad[0]["src"] == SCRIPT and ad[0].get("crossorigin") == "anonymous" and "async" in ad[0], route
            ads_pages.add(route)
        for tag, ref in page.references:
            assert ref, f"Empty {tag} link on {route}"
            dest = urlsplit(urljoin(ORIGIN + route, ref))
            if dest.scheme == "mailto":
                assert dest.path == EMAIL, (route, ref)
                continue
            if dest.netloc != "browsersignal.site":
                assert dest.scheme == "https" and dest.netloc, (route, ref)
                continue
            target = unquote(dest.path)
            file = ROOT / target.lstrip("/")
            if target.endswith("/"):
                file /= "index.html"
            assert file.is_file(), (route, ref)
            if dest.fragment:
                assert target in pages and unquote(dest.fragment) in pages[target].ids, (route, ref)
            if tag == "a":
                internal_links += 1
                if target in content:
                    graph[route].add(target)
    assert len(set(titles)) == len(titles), "Duplicate document title"
    assert len(set(descriptions)) == len(descriptions), "Duplicate page description"
    seen = set()
    remaining = ["/"]
    while remaining:
        current = remaining.pop()
        if current in seen:
            continue
        seen.add(current)
        remaining.extend(graph[current] - seen)
    assert seen == set(content), "Unreachable from homepage: " + str(set(content) - seen)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locations = [e.text for e in ElementTree.parse(ROOT / "sitemap.xml").findall(".//s:loc", ns)]
    assert len(set(locations)) == len(locations) and set(locations) == {ORIGIN + key for key in content}
    assert (ROOT / "ads.txt").read_text().strip() == "google.com, pub-4542287035866555, DIRECT, f08c47fec0942fa0"
    assert "Sitemap: " + ORIGIN + "/sitemap.xml" in (ROOT / "robots.txt").read_text()
    articles = {route for route, p in content.items() if p.schemas[0]["@type"] == "Article"}
    assert ads_pages == articles | {"/"}, "Check ad inclusion by page type"
    assert not (ROOT / "assets/evidence/not-published.css").exists(), "This specimen must produce a real 404"
    assert (ROOT / "assets/probe.txt").read_text().strip() == "BrowserSignal probe v1"
    print(f"{len(content)} canonical pages, {len(articles)} articles, {len(ads_pages)} pages with the publisher script")
    print(f"{internal_links} internal anchor links checked. All canonical pages reachable from home.")
    print("Internal assets and fragments, sitemap, ads.txt, language, dates, contact links and schema passed.")


if __name__ == "__main__":
    run()
