import { useState } from 'react'
import documents from '../data/cavinti-other-documents.json'
import documentsUrl from '../data/cavinti-other-documents.json?url'
import { formatDate, formatNumber, type Locale } from '../i18n/locales'
import './civic-sections.css'

export default function OtherDocuments({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState('')
  const matching = documents.documents.filter(document => document.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const fil = locale === 'fil'
  return <section className="other-documents" aria-labelledby="other-documents-title">
    <h2 id="other-documents-title">{fil ? 'Iba pang mga dokumento' : 'Other documents'}</h2>
    <p>{fil ? 'Mga pampublikong tala mula sa ' : 'Public records from the '}<a href={documents.sourceUrl}>Cavinti E-Gov Other Documents</a>. {fil ? 'Mga pamagat at link lamang ang nakalap; hindi nasuri ang nilalaman o kasalukuyang availability ng mga dokumento.' : 'Only titles and links were captured; document contents and current availability have not been verified.'}</p>
    <p className="civic-meta other-documents-source">{fil ? 'Nakuha noong' : 'Captured'}: {formatDate(documents.capturedAt, locale)}. {fil ? 'Maaaring luma na ang talaan; tingnan ang opisyal na pahina para sa pinakabago.' : 'This snapshot may be stale; check the official page for the latest catalog.'} <a href={documentsUrl} download>{fil ? 'I-download ang metadata (JSON)' : 'Download metadata (JSON)'}</a></p>
    <div className="directory-tools"><label htmlFor="other-documents-query">{fil ? 'Maghanap ng pamagat' : 'Search document titles'}<input id="other-documents-query" type="search" value={query} onChange={event => setQuery(event.target.value)} /></label><p role="status">{formatNumber(matching.length, locale)} {fil ? 'tala' : 'records'}</p></div>
    {!matching.length && <p className="civic-empty">{fil ? 'Walang nahanap na tala.' : 'No records found.'}</p>}
    <ul className="directory-grid other-documents-list">{matching.map((document, index) => <li key={`${document.url}-${index}`}><h3 id={`other-document-title-${index}`} lang="en">{document.title}</h3><p className="civic-meta">{fil ? 'Inilathala' : 'Published'}: {formatDate(document.publishedDate, locale)} · <span lang="en">{document.access}</span></p><a href={document.url} aria-labelledby={`other-document-action-${index} other-document-title-${index}`}><span id={`other-document-action-${index}`}>{fil ? 'Buksan ang opisyal na dokumento' : 'Open official document'}</span></a></li>)}</ul>
  </section>
}
