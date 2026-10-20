import { useEffect, useRef } from 'react'
import { unstable_useRouterState as useRouterState } from 'react-router-dom'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const state = useRouterState()

  useEffect(() => {
    if (state.pending) {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [state.pending])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
