import { createContext } from 'react'
import type { Locale } from './locales'

export const LocaleContext = createContext<Locale>('en')
