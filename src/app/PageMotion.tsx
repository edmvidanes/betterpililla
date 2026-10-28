import { useEffect } from 'react'
import { gsap } from 'gsap'

// Animate actual entries, not controls, nested evidence or the landing page's existing choreography.
const entries = '.record-list > li, .directory-grid > li, .service-grid > li, .dataset-list > li, .news-list > li, .barangay-bars > li, .latest-news-grid > article, .atlas-links > li, .atlas-service-badges > li, .atlas-history-timeline > li, .atlas-history-notes > article'

export default function PageMotion({ ready, home }: { ready: boolean; home: boolean }) {
  useEffect(() => {
    if (!ready) return
    const main = document.querySelector<HTMLElement>('#main')
    if (!main) return
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const seen = new WeakSet<Element>()
      let frame = 0
      let pending: Element[] = []
      if (!home) {
        const heading = main.querySelector('h1')
        if (heading) gsap.fromTo(heading, { opacity: .8, y: 6 }, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', clearProps: 'opacity,transform' })
      }
      const observer = new IntersectionObserver(changes => {
        for (const change of changes) {
          if (!change.isIntersecting) continue
          observer.unobserve(change.target)
          pending.push(change.target)
        }
        if (pending.length && !frame) frame = requestAnimationFrame(() => {
          const targets = pending.filter(element => element.isConnected)
          pending = []
          frame = 0
          if (targets.length) gsap.fromTo(targets, { opacity: .8, y: 6 }, {
            opacity: 1, y: 0, duration: .5, ease: 'power2.out',
            stagger: { amount: Math.min(.16, (targets.length - 1) * .035) },
            clearProps: 'opacity,transform',
          })
        })
      }, { threshold: .05 })
      const scan = () => main.querySelectorAll(entries).forEach(element => {
        if (!seen.has(element)) {
          seen.add(element)
          observer.observe(element)
        }
      })
      scan()
      const mutations = new MutationObserver(scan)
      mutations.observe(main, { childList: true, subtree: true })
      return () => {
        const targets = main.querySelectorAll(entries)
        gsap.killTweensOf(targets)
        gsap.set(targets, { clearProps: 'opacity,transform' })
        mutations.disconnect()
        observer.disconnect()
        cancelAnimationFrame(frame)
      }
    })
    return () => media.revert()
  }, [ready, home])
  return null
}
