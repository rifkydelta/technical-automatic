import os
import re
import requests
import concurrent.futures
from datetime import datetime, timedelta
import urllib3
urllib3.disable_warnings()

# Determine absolute path to sitemaps.txt
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SITEMAPS_FILE = os.path.join(BASE_DIR, "sitemaps.txt")

def extract_sitemaps(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        urls = re.findall(r'https?://[^\s<"]+\.xml', content)
        return list(set(urls))
    except Exception:
        return []

def format_title_from_url(url, ticker):
    # E.g., https://www.emitennews.com/news/tebar-dividen-332-triliun-bank-bca-bbca
    slug = url.rstrip('/').split('/')[-1]
    
    # Remove file extensions if any (like .html)
    slug = re.sub(r'\.[a-zA-Z0-9]+$', '', slug)
    
    # Replace dashes/underscores with spaces
    title_raw = slug.replace('-', ' ').replace('_', ' ')
    
    words = title_raw.split()
    
    acronyms = {"ihsg", "bei", "ojk", "bi", "fed", "lq45", "idx", "usd", "idr", "rp"}
    lowercase_words = {"dan", "di", "ke", "dari", "pada", "dalam", "untuk", "dengan", "yang", "vs"}
    # Known big cap / popular tickers
    known_tickers = {
        "bbca","bbri","bmri","bbni","asii","tlkm","goto","bren","pgeo","ammn",
        "antm","pgas","ptba","itmg","adro","unvr","icbp","indf","klbf","brpt",
        "inco","bbtn","arci","srtg","brms","mdka","hrum","untr","bsde","ctra",
        "akra","medc","smgr","intp","cpcl","mbma","mtel","bfin","mncn","sido"
    }
    
    formatted_words = []
    for i, w in enumerate(words):
        wl = w.lower()
        if wl == ticker.lower() or wl in acronyms or wl in known_tickers:
            formatted_words.append(wl.upper())
        elif wl == "pt":
            formatted_words.append("PT")
        elif wl == "tbk":
            formatted_words.append("Tbk")
        elif wl == "cs":
            formatted_words.append("Cs")
        elif wl in lowercase_words and i > 0:
            formatted_words.append(wl.lower())
        else:
            # Jika 4 huruf, dan bukan kata umum Indonesia, kadang bisa jadi ticker yang tidak ada di list
            # Tapi untuk aman, kita capitalize biasa kecuali kita yakin itu ticker
            formatted_words.append(wl.capitalize())
            
    title = " ".join(formatted_words)
    
    # If the title is too short, return a fallback
    if len(title) < 10:
        title = f"Berita Terbaru {ticker.upper()}"
        
    return title

def fetch_and_search_sitemap(sitemap_url, ticker, keywords=None):
    if keywords is None:
        keywords = []
    matches = []
    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        response = requests.get(sitemap_url, headers=headers, timeout=10, verify=False)
        if response.status_code == 200:
            url_blocks = re.findall(r'<url\b[^>]*>(.*?)</url>', response.text, re.DOTALL | re.IGNORECASE)
            for block in url_blocks:
                loc_match = re.search(r'<loc>(.*?)</loc>', block, re.IGNORECASE)
                if not loc_match:
                    continue
                url = loc_match.group(1).strip()
                
                if '.xml' in url:
                    continue
                    
                # Check if ticker or any keyword is in the URL
                url_lower = url.lower()
                is_match = False
                if ticker.lower() in url_lower:
                    is_match = True
                else:
                    for kw in keywords:
                        if kw in url_lower:
                            is_match = True
                            break
                            
                if is_match:
                    date_str = None
                    lastmod_match = re.search(r'<lastmod>(.*?)</lastmod>', block, re.IGNORECASE)
                    if lastmod_match:
                        date_str = lastmod_match.group(1).strip()
                    else:
                        pub_match = re.search(r'<news:publication_date>(.*?)</news:publication_date>', block, re.IGNORECASE)
                        if pub_match:
                            date_str = pub_match.group(1).strip()
                            
                    if date_str:
                        matches.append({"url": url, "date": date_str})
    except Exception:
        pass
    return matches

def get_news_by_ticker(ticker: str, company_name: str = None) -> list:
    if not ticker:
        return []
        
    keywords = []
    if company_name:
        # Clean up company name to generate search keywords
        clean_name = company_name.lower()
        clean_name = re.sub(r'^pt\s+', '', clean_name)
        clean_name = re.sub(r'\s+tbk.*$', '', clean_name)
        clean_name = re.sub(r'\s+-\s+idx.*$', '', clean_name)
        clean_name = re.sub(r'\(.*?\)', '', clean_name) # Remove texts in brackets like (persero)
        clean_name = re.sub(r'[^\w\s]', '', clean_name).strip()
        
        if clean_name:
            words = clean_name.split()
            
            # 1. Full name joined by hyphens (e.g., "energi-mega-persada")
            keywords.append("-".join(words))
            
            # 2. Full name without spaces (e.g., "energimegapersada")
            keywords.append("".join(words))
            
            # 3. If there are >= 3 words, try the first 2 words (e.g., "energi-mega")
            if len(words) >= 3:
                keywords.append(f"{words[0]}-{words[1]}")
                
            # 4. If there are >= 4 words, try the first 3 words
            if len(words) >= 4:
                keywords.append(f"{words[0]}-{words[1]}-{words[2]}")
                
    sitemaps = extract_sitemaps(SITEMAPS_FILE)
    if not sitemaps:
        return []
        
    all_urls = []
    
    # Limit max workers to 20 for speed but prevent overload
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        future_to_url = {executor.submit(fetch_and_search_sitemap, url, ticker, keywords): url for url in sitemaps}
        for future in concurrent.futures.as_completed(future_to_url):
            try:
                matches = future.result()
                all_urls.extend(matches)
            except Exception:
                pass

    # Deduplicate URLs
    unique_matches = {}
    for match in all_urls:
        if match["url"] not in unique_matches or match["date"]:
            unique_matches[match["url"]] = match["date"]
            
    two_weeks_ago = datetime.now() - timedelta(days=14)
    
    results = []
    for url, date_str in unique_matches.items():
        title = format_title_from_url(url, ticker)
        display_date = ""
        keep = True
        
        if date_str:
            match_dt = re.search(r'(\d{4}-\d{2}-\d{2})', date_str)
            if match_dt:
                try:
                    dt = datetime.strptime(match_dt.group(1), "%Y-%m-%d")
                    if dt < two_weeks_ago:
                        keep = False
                    display_date = match_dt.group(1)
                except:
                    pass
                    
        if keep:
            results.append({
                "title": title,
                "url": url,
                "date": display_date
            })
            
    # Sort by date descending
    results.sort(key=lambda x: x["date"] if x["date"] else "0000-00-00", reverse=True)
    return results[:20]