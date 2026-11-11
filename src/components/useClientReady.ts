import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const clientReady = () => true
const serverReady = () => false

/** Keep prerendered controls disabled until their client handlers are attached. */
export function useClientReady() {
  return useSyncExternalStore(subscribe, clientReady, serverReady)
}
