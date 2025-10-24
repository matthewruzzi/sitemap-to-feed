import { parseArgs } from "@std/cli/parse-args";
import Sitemapper from "sitemapper";
import { Feed } from "feed";
import * as cheerio from "cheerio";

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    string: ["sitemap", "title", "site", "output", "cache-file"],
    boolean: ["scrape-titles", "help"],
    alias: { "output": "o", "help": "h" },
  });

  if (args.help) {
    console.log(`
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
`);
    Deno.exit(0);
  }

  const sitemapURL = args.sitemap ?? "https://sitemaps.org/sitemap.xml";
  const title = args.title ?? "Sitemaps";
  const site = args.site ?? "https://sitemaps.org/";
  const outputFileName = args.output;
  const scrapeTitlesEnabled = args["scrape-titles"];
  const cacheFile = args["cache-file"];

  let kv;

  if (cacheFile) {
    kv = await Deno.openKv(cacheFile);
  }

  const Sitemap = new Sitemapper({
    url: sitemapURL,
    timeout: 15000, // 15 seconds
    concurrency: 10,
    fields: { loc: true, lastmod: true },
  });

  const sitemap = await Sitemap.fetch();
  const sites = sitemap.sites;

  const feed = new Feed({
    title: title,
    id: site,
    copyright: "",
  });

  for (const page of sites) {
    if (scrapeTitlesEnabled) {
      const pageTitle = await getPageTitleCached(page.loc, kv);
      if (pageTitle) {
        feed.addItem({
          title: pageTitle,
          link: page.loc,
          date: new Date(page.lastmod) ?? new Date(2000, 0, 1),
        });
      } else {
        feed.addItem({
          title: page.loc,
          link: page.loc,
          date: new Date(page.lastmod) ?? new Date(2000, 0, 1),
        });
      }
    } else {
      feed.addItem({
        title: page.loc,
        link: page.loc,
        date: new Date(page.lastmod) ?? new Date(2000, 0, 1),
      });
    }
  }

  console.log(feed.rss2());

  if (outputFileName) {
    await Deno.writeTextFile(outputFileName, feed.rss2());
  }
}

async function getPageTitle(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.statusText}`);
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    return $("title").text();
  } catch (error) {
    console.error(`Error fetching or parsing ${url}:`, error);
    return null;
  }
}

async function getPageTitleCached(url: string, kv: Deno.Kv | undefined) {
  if (kv) {
    const entry = await kv.get(["titles", url]);
    if (entry.value) {
      return entry.value;
    } else {
      const title = await getPageTitle(url);
      if (title) {
        await kv.set(["titles", url], title);
        return title;
      }
    }
  } else {
    return await getPageTitle(url);
  }
}
