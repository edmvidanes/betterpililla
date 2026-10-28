import news from '../../data/cavinti-news.json'
import { newsImages } from '../news-images'
import type { Locale } from '../../i18n/locales'
import './latest-news.css'

export default function LatestNews({ locale, href }: { locale: Locale; href: (path: string) => string }) {
  const fil = locale === 'fil'
  const articles = [...news.articles].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 3)
  return <section className="atlas-inner latest-news" aria-labelledby="latest-news-title">
    <div className="latest-news-heading">
      <div><h2 id="latest-news-title">{fil ? 'Mga bagong balita' : 'Latest news'}</h2><p>{fil ? 'Mula sa opisyal na archive ng Cavinti' : 'From the official Cavinti archive'}</p></div>
      <a href={href('news')}>{fil ? 'Lahat ng balita' : 'All news'} <span aria-hidden="true">→</span></a>
    </div>
    <div className="latest-news-grid">
      {articles.map(article => <article className={`latest-news-card${newsImages[article.id]?.cover ? '' : ' latest-news-card-text'}`} key={article.id}>
        <a href={href(`news/${encodeURIComponent(article.id)}`)}>
          {newsImages[article.id]?.cover && <img src={`${import.meta.env.BASE_URL}${newsImages[article.id].cover}`} alt="" loading="lazy" />}
          <div className="latest-news-copy"><p>{article.date} · {article.category}</p><h3>{article.title}</h3><span>{fil ? 'Basahin ang balita' : 'Read article'} <span aria-hidden="true">→</span></span></div>
        </a>
      </article>)}
    </div>
  </section>
}
