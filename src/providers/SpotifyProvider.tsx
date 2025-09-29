import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react'
import { useSpotifyAuth } from '../hooks/useSpotifyAuth'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'

type Ctx = {
  authReady: boolean
  authError: string | null
  authorize: () => Promise<void> | void
  logout: () => void
  token: string | null

  playerReady: boolean
  playerError: string | null
  state: Spotify.PlaybackState | null
  deviceId: string | null

  audioActivated: boolean
  activateAudio: () => Promise<void>

  // controls
  togglePlay: () => Promise<void>
  next: () => Promise<void>
  previous: () => Promise<void>
  setVolume: (v: number) => Promise<void>
  getVolume?: () => Promise<number>

  transferPlayback: (opts?: { play?: boolean }) => Promise<void>
}

const SpotifyCtx = createContext<Ctx | null>(null)

export const SpotifyProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { token, ready: authReady, error: authError, authorize, logout } = useSpotifyAuth()
  const {
    state,
    deviceId,
    ready: playerReady,
    error: playerError,
    activateAudio,
    audioActivated,
    togglePlay,
    next,
    previous,
    transferPlayback,
    setVolume,
    getVolume
  } = useSpotifyPlayer({ token: token ?? null })

  const transferredOnce = useRef(false)

  // Transfer playback to this device once the player is ready
  useEffect(() => {
    if (!transferredOnce.current && playerReady && deviceId && token) {
      transferredOnce.current = true
      transferPlayback({ play: false }).catch(() => {})
    }
  }, [playerReady, deviceId, token, transferPlayback])

  const value = useMemo<Ctx>(() => ({
    authReady,
    authError,
    authorize,
    logout,
    token: token ?? null,

    playerReady,
    playerError,
    state,
    deviceId,

    audioActivated,
    activateAudio,

    togglePlay,
    next,
    previous,
    setVolume,
    getVolume,

    transferPlayback
  }), [
    authReady, authError, authorize, logout, token,
    playerReady, playerError, state, deviceId,
    audioActivated, activateAudio,
    togglePlay, next, previous, setVolume, getVolume, transferPlayback
  ])

  return <SpotifyCtx.Provider value={value}>{children}</SpotifyCtx.Provider>
}

export function useSpotify() {
  const ctx = useContext(SpotifyCtx)
  if (!ctx) throw new Error('useSpotify must be used within SpotifyProvider')
  return ctx
}