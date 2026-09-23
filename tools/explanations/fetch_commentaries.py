# -*- coding: utf-8 -*-
"""
Download the Jamieson-Fausset-Brown and John Gill commentaries from the HelloAO
Bible API (public domain, CC0) into tools/explanations/cache/, one JSON file per
chapter. Files already in the cache are skipped, so a rerun only fetches what is
missing.

    python tools/explanations/fetch_commentaries.py
"""
import json, os, time, urllib.request
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "cache")

API = "https://bible.helloao.org/api/c"
COMMENTARIES = ["jamieson-fausset-brown", "john-gill"]


def get(url, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return r.read()
        except Exception as e:
            if getattr(e, "code", None) == 404:
                return None
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def fetch(job):
    cid, book, chapter = job
    path = os.path.join(CACHE, cid, f"{book}_{chapter}.json")
    if os.path.exists(path):
        return "cached"
    data = get(f"{API}/{cid}/{book}/{chapter}.json")
    if data is None:
        return "missing"
    with open(path, "wb") as f:
        f.write(data)
    return "ok"


def main():
    jobs = []
    for cid in COMMENTARIES:
        os.makedirs(os.path.join(CACHE, cid), exist_ok=True)
        raw = get(f"{API}/{cid}/books.json")
        # Gill covers all 66 books; build_explanations.py maps book ids from it
        if cid == "john-gill":
            with open(os.path.join(CACHE, "books.json"), "wb") as f:
                f.write(raw)
        books = json.loads(raw)["books"]
        jobs += [(cid, b["id"], c) for b in books for c in range(1, b["numberOfChapters"] + 1)]

    results = {}
    with ThreadPoolExecutor(8) as pool:
        for n, r in enumerate(pool.map(fetch, jobs), 1):
            results[r] = results.get(r, 0) + 1
            if n % 250 == 0:
                print(n, "/", len(jobs), flush=True)
    print(results)


if __name__ == "__main__":
    main()
