import { NextResponse } from "next/server";

const RSS_SOURCES = [
  { url: "https://cafef.vn/tai-chinh-ngan-hang.rss", source: "CafeF" },
  { url: "https://vnexpress.net/rss/kinh-doanh.rss", source: "VnExpress" },
];

// Hàm bóc tách thẻ HTML/CDATA thuần JavaScript
function extractTagContent(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return "";
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1") // Xóa CDATA
    .replace(/<[^>]+>/g, "") // Xóa thẻ HTML dư thừa
    .trim();
}

export async function GET() {
  try {
    const feedPromises = RSS_SOURCES.map(async (item) => {
      try {
        const res = await fetch(item.url, { next: { revalidate: 300 } }); // Cache 5 phút
        const xmlText = await res.text();

        // Lấy các thẻ <item> trong RSS
        const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

        return itemMatches.slice(0, 5).map((itemXml) => ({
          title: extractTagContent(itemXml, "title"),
          link: extractTagContent(itemXml, "link"),
          pubDate:
            extractTagContent(itemXml, "pubDate") ||
            extractTagContent(itemXml, "dc:date") ||
            new Date().toISOString(),
          source: item.source,
        }));
      } catch {
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const allNews = results
      .flat()
      .filter((news) => news.title && news.link);

    // Sắp xếp bài viết mới nhất lên đầu
    allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    return NextResponse.json(allNews.slice(0, 6));
  } catch {
    return NextResponse.json({ error: "Lỗi lấy tin tức" }, { status: 500 });
  }
}