import { useEffect, useState } from 'react'
import CheckedLink from './CheckedLink'
import StatusBadge from './StatusBadge'
import help from '../data/public-help.json'
import { formatDate, type Locale } from '../i18n/locales'
import './live-utility.css'

const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=14.48&longitude=121.315&current=temperature_2m,weather_code&timezone=Asia%2FManila&forecast_days=1'
const exchangeUrl = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=PHP'
type Weather = { temperature: number; time: string }
type Rate = { value: number; date: string }

export default function LiveUtility({ locale, href }: { locale: Locale; href: (path: string) => string }) {
  const fil = locale === 'fil'
  const [now, setNow] = useState<Date | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [rate, setRate] = useState<Rate | null>(null)
  const [weatherStatus, setWeatherStatus] = useState('loading')
  const [rateStatus, setRateStatus] = useState('loading')
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick(); const timer = window.setInterval(tick, 60_000)
    return () => window.clearInterval(timer)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    async function load(kind: 'weather' | 'rate') {
      try {
        const response = await fetch(kind === 'weather' ? weatherUrl : exchangeUrl, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]) })
        if (!response.ok) throw new Error('Source unavailable')
        const data = await response.json()
        if (kind === 'weather') {
          if (!Number.isFinite(data.current?.temperature_2m) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(data.current?.time)) throw new Error('Missing weather')
          const time = data.current.time + '+08:00'
          if (Math.abs(Date.now() - Date.parse(time)) > 3_600_000) throw new Error('Weather is stale')
          setWeather({ temperature: data.current.temperature_2m, time }); setWeatherStatus('ready')
        } else {
          if (data.base !== 'USD' || data.amount !== 1 || !Number.isFinite(data.rates?.PHP) || data.rates.PHP <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Missing rate')
          const age = Date.now() - Date.parse(data.date)
          if (age < -86_400_000 || age > 10 * 86_400_000) throw new Error('Rate date is stale')
          setRate({ value: data.rates.PHP, date: data.date }); setRateStatus('ready')
        }
      } catch {
        if (controller.signal.aborted) return
        if (kind === 'weather') { setWeather(null); setWeatherStatus('unavailable') } else { setRate(null); setRateStatus('unavailable') }
      }
    }
    void load('weather'); void load('rate')
    const weatherTimer = window.setInterval(() => void load('weather'), 15 * 60_000)
    const rateTimer = window.setInterval(() => void load('rate'), 6 * 60 * 60_000)
    return () => { controller.abort(); window.clearInterval(weatherTimer); window.clearInterval(rateTimer) }
  }, [])
  const clock = now && new Intl.DateTimeFormat(fil ? 'fil-PH' : 'en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(now)
  return <div className="live-utility">
    <span className="live-rate" title={rate ? `Reference rate · ${formatDate(rate.date, locale)} · Frankfurter / ECB` : 'Frankfurter / ECB'}><span aria-hidden="true">$</span> {rate ? <>1 USD = ₱{rate.value.toFixed(2)} <small>{formatDate(rate.date, locale)}</small></> : rateStatus === 'loading' ? (fil ? 'Kinukuha ang palitan…' : 'Loading exchange rate…') : (fil ? 'Hindi available ang palitan' : 'Exchange rate unavailable')}</span>
    <span className="live-weather" title={weather ? `Open-Meteo · ${weather.time}` : 'Open-Meteo'}><span aria-hidden="true">☁</span> {weather ? `Pililla ${weather.temperature.toFixed(1)}°C` : weatherStatus === 'loading' ? (fil ? 'Kinukuha ang panahon…' : 'Loading weather…') : (fil ? 'Hindi available ang panahon' : 'Weather unavailable')}</span>
    <span className="live-clock"><span aria-hidden="true">◷</span> {now ? <time dateTime={now.toISOString()}>{clock} PHT</time> : (fil ? 'Oras sa Pilipinas' : 'Philippine time')}</span>
    <details className="hotline-menu"><summary><span aria-hidden="true">☎</span> {fil ? 'Mga emergency hotline' : 'Emergency hotlines'} <span aria-hidden="true">⌄</span></summary><div className="hotline-dropdown">
      <div className="hotline-note">{fil ? 'Mga numerong inilathala ng Lalawigan ng Rizal; hindi pa nasusubukan sa pagtawag.' : 'Numbers published by Rizal Province; operational checks pending.'} <StatusBadge status="validation" locale={locale} /></div>
      <ul>{help.hotlines.map(row => <li key={row.name}><span>{row.name}</span>{row.phones.map(phone => <a key={phone} href={`tel:+63${phone.replace(/\D/g, '').replace(/^0/, '')}`}>{phone}</a>)}</li>)}</ul>
      <CheckedLink href={`${href('services/public-contacts')}#hotlines`}>{fil ? 'Tingnan ang mga sanggunian at detalye' : 'View sources and contact details'} →</CheckedLink>
    </div></details>
  </div>
}
