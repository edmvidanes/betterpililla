import { Pagination, usePagination } from '../components/Pagination'
import news from '../data/cavinti-news.json'
import { formatDate } from '../i18n/locales'
import { LinkArrow, PageIntro, type CivicProps } from './Civic'
import { newsImages } from './news-images'
import './news.css'

const imagePath = (path: string) => `${import.meta.env.BASE_URL}${path}`

export default function News({ locale, href }: CivicProps) {
  const fil = locale === 'fil'
  const { visible, page, pages, setPage } = usePagination(news.articles)
  return <div className="news-page">
    <PageIntro title={fil ? 'Balita' : 'News'} />
    <p className="civic-meta news-source">{fil ? 'Nakuhang archive noong' : 'Archive captured'} {formatDate(news.metadata.capturedAt, locale)} · <a href={news.metadata.sourceUrl}>{fil ? 'Opisyal na archive' : 'Official archive'} <LinkArrow /></a></p>
    <ul className="news-list">{visible.map(article => <li key={article.id} className={`news-item${newsImages[article.id]?.cover ? '' : ' news-item-text'}`}>
      {newsImages[article.id]?.cover && <a className="news-thumbnail" href={href(`news/${encodeURIComponent(article.id)}`)} tabIndex={-1} aria-hidden="true"><img src={imagePath(newsImages[article.id].cover!)} alt="" loading="lazy" /></a>}
      <div className="news-item-content"><p className="civic-meta">{article.date} · {article.category}</p>
        <h2><a href={href(`news/${encodeURIComponent(article.id)}`)}>{article.title}</a></h2>
        {article.paragraphs[0] && <p lang="fil">{article.paragraphs[0].length > 240 ? `${article.paragraphs[0].slice(0, 240).trimEnd()}…` : article.paragraphs[0]}</p>}
        <a className="news-read" href={href(`news/${encodeURIComponent(article.id)}`)} aria-label={`${fil ? 'Basahin ang balita' : 'Read article'}: ${article.title}`}>{fil ? 'Basahin ang balita' : 'Read article'} <LinkArrow /></a>
      </div>
    </li>)}</ul>
    <Pagination page={page} pages={pages} setPage={setPage} locale={locale} label={fil ? 'Mga pahina ng balita' : 'News pages'} />
  </div>
}

export function NewsDetail({ locale, href, recordId }: CivicProps & { recordId: string }) {
  const fil = locale === 'fil'
  const article = news.articles.find(item => item.id === recordId)
  if (!article) return <><PageIntro title={fil ? 'Hindi nahanap ang balita' : 'Article not found'} /><p><a href={href('news')}>{fil ? 'Lahat ng balita' : 'All news'} <LinkArrow /></a></p></>
  const images = newsImages[article.id]
  return <div className="news-detail">
    <p><a className="news-back" href={href('news')}>{fil ? 'Lahat ng balita' : 'All news'} <LinkArrow /></a></p>
    <article>
      <header className="news-header"><h1>{article.title}</h1><p className="civic-meta">{article.date} · {article.category} · {article.author}</p></header>
      {images?.cover && <figure className="news-hero"><img src={imagePath(images.cover)} alt="" /><figcaption>{fil ? 'Larawan mula sa' : 'Image from'} <a href={article.url}>Cavinti E-Gov</a></figcaption></figure>}
      <div className="news-body"><p className="civic-meta">{fil ? 'Orihinal na teksto; walang nasuring salin.' : 'Original source text; no reviewed translation is available.'}</p>
        {article.paragraphs.length ? <div lang="fil">{article.paragraphs.map((paragraph, index) => <p key={index} className="news-paragraph">{paragraph}</p>)}</div> : <p>{fil ? 'Walang tekstong lumitaw sa katawan ng artikulo.' : 'No text appeared in the article body.'}</p>}
        {images?.body.map((image, index) => <figure className="news-body-image" key={image}><img src={imagePath(image)} alt={fil ? `Larawan sa orihinal na balita ${index + 1}` : `Image ${index + 1} from the original article`} loading="lazy" /><figcaption>{fil ? 'Larawan mula sa' : 'Image from'} <a href={article.url}>Cavinti E-Gov</a></figcaption></figure>)}
        <p><a className="news-read" href={article.url}>{fil ? 'Basahin sa opisyal na portal ng Cavinti' : 'Read on the official Cavinti portal'} <LinkArrow /></a></p>
        <p className="civic-meta">{fil ? 'Nakuhang archive noong' : 'Archive captured'} {formatDate(news.metadata.capturedAt, locale)} · <a href="https://www.cavinti-egov.com/contact">{fil ? 'Pahayag ng pinagmulan tungkol sa mga karapatan' : 'Source rights statement'}</a></p>
      </div>
    </article>
  </div>
}
