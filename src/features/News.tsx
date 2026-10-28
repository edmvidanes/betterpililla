import news from '../data/cavinti-news.json'
import { formatDate } from '../i18n/locales'
import { LinkArrow, PageIntro, type CivicProps } from './Civic'

export const newsIds = news.articles.map(article => article.id)

export default function News({ locale, href }: CivicProps) {
  const fil = locale === 'fil'
  return <>
    <PageIntro title={fil ? 'Balita' : 'News'}>{fil ? 'Mga balitang inilathala sa opisyal na portal ng Cavinti. Nananatili ang orihinal na wika at petsa ng pinagmulan.' : 'News published on the official Cavinti portal, retaining the source’s original language and dates.'}</PageIntro>
    <p className="civic-meta">{fil ? 'Nakuhang archive noong' : 'Archive captured'} {formatDate(news.metadata.capturedAt, locale)} · <a href={news.metadata.sourceUrl}>{fil ? 'Opisyal na archive' : 'Official archive'} <LinkArrow /></a></p>
    <ul className="record-list">{news.articles.map(article => <li key={article.id}>
      <h2><a href={href(`news/${encodeURIComponent(article.id)}`)}>{article.title}</a></h2>
      <p className="civic-meta">{article.date} · {article.category}</p>
      {article.paragraphs[0] && <p lang="fil">{article.paragraphs[0].length > 240 ? `${article.paragraphs[0].slice(0, 240).trimEnd()}…` : article.paragraphs[0]}</p>}
      <a href={href(`news/${encodeURIComponent(article.id)}`)}>{fil ? 'Basahin ang balita' : 'Read article'} <LinkArrow /></a>
    </li>)}</ul>
  </>
}

export function NewsDetail({ locale, href, recordId }: CivicProps & { recordId: string }) {
  const fil = locale === 'fil'
  const article = news.articles.find(item => item.id === recordId)
  if (!article) return <><PageIntro title={fil ? 'Hindi nahanap ang balita' : 'Article not found'} /><p><a href={href('news')}>{fil ? 'Lahat ng balita' : 'All news'} <LinkArrow /></a></p></>
  return <>
    <p><a href={href('news')}>{fil ? 'Lahat ng balita' : 'All news'} <LinkArrow /></a></p>
    <article>
      <header><h1>{article.title}</h1><p className="civic-meta">{article.date} · {article.category} · {article.author}</p></header>
      <p className="civic-meta">{fil ? 'Orihinal na teksto; walang nasuring salin.' : 'Original source text; no reviewed translation is available.'}</p>
      {article.paragraphs.length ? <div lang="fil">{article.paragraphs.map((paragraph, index) => <p key={index} style={{ whiteSpace: 'pre-line' }}>{paragraph}</p>)}</div> : <p>{fil ? 'Walang tekstong lumitaw sa katawan ng artikulo; tingnan ang opisyal na pahina para sa nilalamang nasa larawan.' : 'No text appeared in the article body; see the official page for content presented in an image.'}</p>}
      {article.bodyImageUrls.length > 0 && article.paragraphs.length > 0 && <p>{fil ? 'May larawan din sa orihinal na artikulo; tingnan ang opisyal na pahina.' : 'The original article also contains an image; see the official page.'}</p>}
    </article>
    <p><a href={article.url}>{fil ? 'Basahin sa opisyal na portal ng Cavinti' : 'Read on the official Cavinti portal'} <LinkArrow /></a></p>
    <p className="civic-meta">{fil ? 'Nakuhang archive noong' : 'Archive captured'} {formatDate(news.metadata.capturedAt, locale)}. {fil ? 'Hindi kinopya ang mga larawan; hindi pa nasusuri ang mga karapatan sa bawat isa.' : 'Images have not been copied; individual image rights have not been reviewed.'}</p>
  </>
}
