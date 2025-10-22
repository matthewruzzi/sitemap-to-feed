import { parseArgs } from "@std/cli/parse-args";
import Sitemapper from "sitemapper";
import { Feed } from "feed";
import * as cheerio from "cheerio";

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    string: ["sitemap", "title", "site", "output"],
    boolean: ["scrape-titles"],
    alias: { "output": "o" },
  });

  const sitemapURL = args.sitemap ?? "https://sitemaps.org/sitemap.xml";
  const title = args.title ?? "Sitemaps";
  const site = args.site ?? "https://sitemaps.org/";
  const outputFileName = args.output;
  const scrapeTitlesEnabled = args["scrape-titles"];

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
      const pageTitle = await getPageTitle(page.loc);
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
