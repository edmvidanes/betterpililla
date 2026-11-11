import { useEffect, useState } from 'react'

/** Keep prerendered controls disabled until their client handlers are attached. */
export function useClientReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  return ready
}
