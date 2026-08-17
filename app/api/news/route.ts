import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const dynamic = "force-dynamic";

const parser = new Parser();

const RSS_SOURCES = [
  { url: "https://cafef.vn/tai-chinh-ngan-hang.rss", source: "CafeF" },
  { url: "https://vnexpress.net/rss/kinh-doanh.rss", source: "VnExpress" },
];

export async function GET() {
  try {
    const feedPromises = RSS_SOURCES.map(async (item) => {
      try {
        const feed = await parser.parseURL(item.url);
        return feed.items.slice(0, 5).map((entry) => ({
          title: entry.title || "",
          link: entry.link || "#",
          pubDate: entry.pubDate || new Date().toISOString(),
          source: item.source,
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allNews = results.flat();

    allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return NextResponse.json(allNews.slice(0, 6));
  } catch {
    return NextResponse.json({ error: "Lỗi lấy tin tức" }, { status: 500 });
  }
}