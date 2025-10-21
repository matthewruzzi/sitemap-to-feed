import { parseArgs } from "@std/cli/parse-args";
import Sitemapper from "sitemapper";
import { Feed } from "feed";

if (import.meta.main) {
  const args = parseArgs(Deno.args, {
    string: ["sitemap", "title", "site", "output"],
    alias: { "output": "o" },
  });

  const sitemapURL = args.sitemap ?? "https://sitemaps.org/sitemap.xml";
  const title = args.title ?? "Sitemaps";
  const site = args.site ?? "https://sitemaps.org/";
  const outputFileName = args.output;

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

  sites.forEach((page) => {
    feed.addItem({
      title: page.loc,
      link: page.loc,
      date: new Date(page.lastmod) ?? new Date(2000, 0, 1),
    });
  });

  console.log(feed.rss2());

  if (outputFileName) {
    await Deno.writeTextFile(outputFileName, feed.rss2());
  }
}
