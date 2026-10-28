import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import './smooth-scroll.css'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother)
    const motion = gsap.matchMedia()
    motion.add('(prefers-reduced-motion: no-preference)', () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapper.current!,
        content: content.current!,
        smooth: 1,
        onUpdate: self => content.current?.style.setProperty('--smooth-scroll-y', `${self.scrollTop()}px`),
      })
      if (smoother.smooth()) wrapper.current?.classList.add('smooth-active')
      return () => {
        wrapper.current?.classList.remove('smooth-active')
        content.current?.style.removeProperty('--smooth-scroll-y')
        smoother.kill()
      }
    })
    return () => motion.revert()
  }, [])

  return <div ref={wrapper}><div ref={content}>{children}</div></div>
}
