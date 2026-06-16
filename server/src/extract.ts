import { extract } from '@extractus/article-extractor';

export interface Extracted {
  title?: string;
  text: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Fetch a URL and return clean article title + text. Throws if nothing usable. */
export async function extractArticle(url: string): Promise<Extracted> {
  const article = await extract(url);
  if (!article || !article.content) {
    throw new Error(`Could not extract article content from ${url}`);
  }
  const text = stripHtml(article.content);
  if (text.length === 0) {
    throw new Error(`Extracted empty article text from ${url}`);
  }
  return { title: article.title ?? undefined, text };
}
