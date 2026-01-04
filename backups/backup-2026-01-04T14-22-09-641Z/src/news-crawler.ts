/**
 * News Crawler for ClimbHero
 * AI-powered news collection with Gemini translation
 * Collects top climbing news from worldwide sources
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

// World's top climbing news sources
const NEWS_SOURCES = [
  // International (English)
  { name: 'Rock and Ice', url: 'https://rockandice.com/feed/', lang: 'en' },
  { name: 'Climbing Magazine', url: 'https://www.climbing.com/feed/', lang: 'en' },
  { name: 'UKClimbing', url: 'https://www.ukclimbing.com/news/rss.php', lang: 'en' },
  { name: 'PlanetMountain', url: 'https://www.planetmountain.com/rss.php?lang=eng', lang: 'en' },
  // IFSC Official
  { name: 'IFSC News', url: 'https://www.ifsc-climbing.org/index.php/component/obrss/ifsc-news?format=feed&type=rss', lang: 'en' },
]

/**
 * Translate using Gemini API
 */
export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  geminiApiKey: string
): Promise<string> {
  if (!text || sourceLang === targetLang) return text
  
  const langNames: Record<string, string> = {
    'ja': 'Japanese', 'en': 'English', 'zh': 'Chinese', 'ko': 'Korean'
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional climbing news translator with 30+ years of experience.

Translate this climbing/bouldering news text from ${langNames[sourceLang] || sourceLang} to ${langNames[targetLang] || targetLang}.

IMPORTANT RULES:
1. Keep climbing grades unchanged (V10, 5.14a, 8c, 9a, etc.)
2. Preserve proper nouns (climber names, crag names, competition names)
3. Use natural, fluent language for the target audience
4. Maintain the original tone and excitement
5. Do NOT add any explanation, prefix, or commentary
6. Do NOT add leading/trailing whitespace or newlines
7. Output ONLY the translated text itself

Text to translate:
${text}`
            }]
          }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      }
    )
    
    const data = await response.json()
    const translated = data.candidates?.[0]?.content?.parts?.[0]?.text || text
    // Remove any leading/trailing whitespace and newlines
    return translated.trim().replace(/^[\s\n]+|[\s\n]+$/g, '')
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Summarize article using Gemini
 */
export async function summarizeArticle(
  content: string,
  targetLang: string,
  geminiApiKey: string
): Promise<string> {
  if (!content) return ''
  
  const langNames: Record<string, string> = {
    'ja': 'Japanese', 'en': 'English', 'zh': 'Chinese', 'ko': 'Korean'
  }
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional climbing journalist with 30+ years of experience.

Summarize this climbing news article in ${langNames[targetLang] || 'Japanese'}.

REQUIREMENTS:
1. Write 4-6 detailed sentences (approximately 300-500 characters)
2. Include specific details: WHO, WHAT, WHERE, WHEN, and WHY it matters
3. Preserve all climbing grades (V10, 5.14a, 8c, 9a, etc.) exactly as written
4. Use enthusiastic, professional tone that captures climbing culture
5. Include technical details and context that climbers care about
6. Do NOT add any prefix, commentary, or explanation
7. Do NOT add leading/trailing whitespace or blank lines
8. Output ONLY the summary itself

Article content:
${content.substring(0, 3000)}

Write the detailed summary now:`
            }]
          }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        })
      }
    )
    
    const data = await response.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || content.substring(0, 200)
    // Remove any leading/trailing whitespace and newlines
    return summary.trim().replace(/^[\s\n]+|[\s\n]+$/g, '')
  } catch (error) {
    console.error('Summarize error:', error)
    return content.substring(0, 200)
  }
}

/**
 * Translate article to all 4 languages
 */
export async function translateArticle(article: NewsArticle, apiKey: string) {
  const lang = article.language || 'en'
  
  // Parallel translation for efficiency
  const [t_ja, t_en, t_zh, t_ko] = await Promise.all([
    lang === 'ja' ? article.title : translateText(article.title, lang, 'ja', apiKey),
    lang === 'en' ? article.title : translateText(article.title, lang, 'en', apiKey),
    lang === 'zh' ? article.title : translateText(article.title, lang, 'zh', apiKey),
    lang === 'ko' ? article.title : translateText(article.title, lang, 'ko', apiKey)
  ])
  
  const [s_ja, s_en, s_zh, s_ko] = await Promise.all([
    lang === 'ja' ? article.summary : translateText(article.summary, lang, 'ja', apiKey),
    lang === 'en' ? article.summary : translateText(article.summary, lang, 'en', apiKey),
    lang === 'zh' ? article.summary : translateText(article.summary, lang, 'zh', apiKey),
    lang === 'ko' ? article.summary : translateText(article.summary, lang, 'ko', apiKey)
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
              text: `Classify this climbing news into exactly ONE of these genres:
- competition (contests, IFSC, World Cup, Olympics)
- achievement (first ascents, records, sends)
- athlete (pro climber profiles, interviews)
- gear (equipment, shoes, reviews)
- technique (training, tips, how-to)
- facility (gyms, new routes, crags)
- accident (safety, incidents, rescue)
- event (festivals, meetups, community)
- general (other news)

Title: ${title}
Summary: ${summary}

Output ONLY the genre name in lowercase.`
            }]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 20 }
        })
      }
    )
    
    const data = await response.json()
    const genre = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'general'
    const validGenres = ['competition', 'achievement', 'athlete', 'gear', 'technique', 'facility', 'accident', 'event', 'general']
    return validGenres.includes(genre) ? genre : 'general'
  } catch (error) {
    return 'general'
  }
}

/**
 * Extract image URL from article page
 */
export async function extractImageFromPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ClimbHero News Bot/1.0' }
    })
    const html = await response.text()
    
    // Try Open Graph image first
    const ogMatch = /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i.exec(html)
    if (ogMatch) return ogMatch[1]
    
    // Try Twitter image
    const twitterMatch = /<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i.exec(html)
    if (twitterMatch) return twitterMatch[1]
    
    // Try first large image in article
    const imgMatch = /<img[^>]+src="([^"]+)"[^>]*(?:width|height)=["']?(\d+)/gi
    let match
    while ((match = imgMatch.exec(html)) !== null) {
      const size = parseInt(match[2])
      if (size >= 300) return match[1]
    }
    
    return null
  } catch (error) {
    console.error('Image extraction error:', error)
    return null
  }
}

/**
 * Fetch RSS feed and parse articles
 */
async function fetchRSS(url: string, sourceName: string, lang: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ClimbHero News Bot/1.0' }
    })
    
    if (!response.ok) {
      console.error(`RSS fetch failed: ${url} - ${response.status}`)
      return []
    }
    
    const xml = await response.text()
    const articles: NewsArticle[] = []
    
    // Parse RSS items
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xml)) !== null && articles.length < 10) {
      const item = match[1]
      
      // Extract fields with CDATA handling
      const extractField = (tag: string) => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
        const m = regex.exec(item)
        if (!m) return ''
        return m[1]
          .replace(/<!\[CDATA\[|\]\]>/g, '')
          .replace(/<[^>]+>/g, '')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim()
      }
      
      const title = extractField('title')
      const link = extractField('link')
      const description = extractField('description')
      const pubDate = extractField('pubDate')
      
      // Extract image from media:content, media:thumbnail, or enclosure
      let imageUrl = ''
      const mediaMatch = /url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i.exec(item)
      if (mediaMatch) imageUrl = mediaMatch[1]
      
      if (title && link) {
        articles.push({
          title,
          summary: description.substring(0, 500),
          url: link,
          source_name: sourceName,
          image_url: imageUrl || undefined,
          published_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          language: lang
        })
      }
    }
    
    return articles
  } catch (error) {
    console.error(`RSS error for ${url}:`, error)
    return []
  }
}

/**
 * Main crawler - Collect top news from worldwide sources
 */
export async function crawlNews(): Promise<NewsArticle[]> {
  console.log('🌍 Starting worldwide climbing news crawl...')
  
  const allArticles: NewsArticle[] = []
  
  // Fetch from all sources in parallel
  const results = await Promise.allSettled(
    NEWS_SOURCES.map(source => fetchRSS(source.url, source.name, source.lang))
  )
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${NEWS_SOURCES[index].name}: ${result.value.length} articles`)
      allArticles.push(...result.value)
    } else {
      console.error(`❌ ${NEWS_SOURCES[index].name}: Failed`)
    }
  })
  
  // Remove duplicates by URL
  const uniqueArticles = Array.from(
    new Map(allArticles.map(a => [a.url, a])).values()
  )
  
  // Sort by date (newest first) and take top articles
  const sortedArticles = uniqueArticles
    .sort((a, b) => {
      const dateA = a.published_date ? new Date(a.published_date).getTime() : 0
      const dateB = b.published_date ? new Date(b.published_date).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 20)
  
  console.log(`📰 Total unique articles: ${sortedArticles.length}`)
  
  return sortedArticles
}

/**
 * Get top 5 trending articles by view count
 */
export function getTopTrending(articles: any[], limit: number = 5): any[] {
  return [...articles]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, limit)
}
