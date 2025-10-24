# sitemap-to-feed

## Usage
```
Usage: sitemap-to-feed [options]

Options: 
  --help, -h           Show this help message
  --sitemap <url>      Sitemap URL
  --title <title>      Feed title
  --site <url>         Site homepage
  --output, -o <file>  Write feed to file (optional)
  --scrape-titles      Enable title scraping (optional)
  --cache-file <file>  Path to save cache file (optional)

Note: Output is always sent to stdout.

Examples
  sitemap-to-feed --sitemap "https://sitemaps.org/sitemap.xml" --title "Sitemaps" --site "https://sitemaps.org/"
  sitemap-to-feed --sitemap "https://sitemaps.org/sitemap.xml" --title "Sitemaps" --site "https://sitemaps.org/" > "feed.rss"
  sitemap-to-feed --sitemap "https://sitemaps.org/sitemap.xml" --title "Sitemaps" --site "https://sitemaps.org/" --output "feed.rss"
  sitemap-to-feed --sitemap "https://sitemaps.org/sitemap.xml" --title "Sitemaps" --site "https://sitemaps.org/" --scrape-titles
  sitemap-to-feed --sitemap "https://sitemaps.org/sitemap.xml" --title "Sitemaps" --site "https://sitemaps.org/" --scrape-titles --cache-file kv.sqlite3
```

## Install
```sh
git clone https://github.com/matthewruzzi/sitemap-to-feed.git
cd sitemap-to-feed
deno install --global --config deno.json --name sitemap-to-feed --unstable-kv --allow-net --allow-read --allow-write main.ts
```

Requires [Deno](https://deno.com)
