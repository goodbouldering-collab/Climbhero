/**
 * News Crawler for ClimbHero
 * Automatically crawls climbing news and translates to 4 languages
 */

export interface NewsArticle {
  title: string
  summary: string
  url: string
  source_name: string
  source_url?: string
  image_url?: string
  published_date?: string
  category?: string
  genre?: string
  language: string
}

/**
 * Translate using Gemini API (on-demand translation)
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  geminiApiKey: string
): Promise<string> {
  if (sourceLang === targetLang) return text
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Translate this climbing news from ${sourceLang} to ${targetLang}. Maintain technical accuracy:\n\n${text}`
            }]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
        })
      }
    )
    
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Translate article to all 4 languages
 */
export async function translateArticle(article: NewsArticle, apiKey: string) {
  const lang = article.language || 'en'
  
  const [t_ja, t_en, t_zh, t_ko] = await Promise.all([
    translateText(article.title, lang, 'ja', apiKey),
    translateText(article.title, lang, 'en', apiKey),
    translateText(article.title, lang, 'zh', apiKey),
    translateText(article.title, lang, 'ko', apiKey)
  ])
  
  const [s_ja, s_en, s_zh, s_ko] = await Promise.all([
    translateText(article.summary, lang, 'ja', apiKey),
    translateText(article.summary, lang, 'en', apiKey),
    translateText(article.summary, lang, 'zh', apiKey),
    translateText(article.summary, lang, 'ko', apiKey)
  ])
  
  return {
    title: { ja: t_ja, en: t_en, zh: t_zh, ko: t_ko },
    summary: { ja: s_ja, en: s_en, zh: s_zh, ko: s_ko }
  }
}

/**
 * Classify genre using AI
 */
export async function classifyGenre(title: string, summary: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Classify this climbing news into ONE genre: achievement, event, facility, research, history, competition, gear, technique, accident, general.\n\nTitle: ${title}\nSummary: ${summary}\n\nOutput only the genre name.`
            }]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 50 }
        })
      }
    )
    
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'general'
  } catch (error) {
    return 'general'
  }
}

/**
 * Fetch RSS feed
 */
async function fetchRSS(url: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(url)
    const xml = await response.text()
    
    const articles: NewsArticle[] = []
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1]
      const title = /<title[^>]*>([\s\S]*?)<\/title>/.exec(item)?.[1]
      const link = /<link[^>]*>([\s\S]*?)<\/link>/.exec(item)?.[1]
      const desc = /<description[^>]*>([\s\S]*?)<\/description>/.exec(item)?.[1]
      const pubDate = /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/.exec(item)?.[1]
      const imageMatch = /<media:content[^>]*url="([^"]+)"/.exec(item)
      
      if (title && link) {
        articles.push({
          title: title.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim(),
          summary: desc ? desc.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').substring(0, 300).trim() : '',
          url: link.trim(),
          source_name: '',
          image_url: imageMatch ? imageMatch[1] : undefined,
          published_date: pubDate ? new Date(pubDate).toISOString() : undefined,
          language: 'en'
        })
      }
    }
    
    return articles
  } catch (error) {
    console.error('RSS fetch error:', error)
    return []
  }
}

/**
 * Main crawler
 */
export async function crawlNews(): Promise<NewsArticle[]> {
  const sources = [
    { name: 'Rock and Ice', url: 'https://rockandice.com/feed/' },
    { name: 'Climbing Magazine', url: 'https://www.climbing.com/feed/' },
    { name: 'UKClimbing', url: 'https://www.ukclimbing.com/news/rss.php' }
  ]
  
  const all: NewsArticle[] = []
  
  for (const source of sources) {
    const articles = await fetchRSS(source.url)
    articles.forEach(a => a.source_name = source.name)
    all.push(...articles)
  }
  
  return Array.from(new Map(all.map(a => [a.url, a])).values()).slice(0, 20)
}
