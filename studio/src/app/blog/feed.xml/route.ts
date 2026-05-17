import { NextResponse } from 'next/server';
import { blogService } from '@/services/blog.service';

const SITE_URL = 'https://radbitstudios.co.zw';

export async function GET() {
  const posts = await blogService.listPublished();
  const now = new Date().toUTCString();
  const lastBuild = posts[0]?.createdAt?.toDate()?.toUTCString() || now;

  const items = posts.map(post => {
    const pubDate = post.createdAt?.toDate()?.toUTCString() || now;
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${post.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('')}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>RadBit Studios Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Business resources, tips, and insights for SMEs in Zimbabwe</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
