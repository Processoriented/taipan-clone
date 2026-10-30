import { useEffect, useRef } from 'react'

export function LegacyFrame({
  html,
  inputText
}: {
  html: string
  inputText: string
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    root.innerHTML = html
    const input = root.querySelector('#input')
    if (input) input.textContent = inputText
  }, [html, inputText])

  useEffect(() => {
    const id = window.setInterval(() => {
      const cursor = ref.current?.querySelector('#cursor')
      if (!(cursor instanceof HTMLElement)) return
      cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden'
    }, 500)
    return () => window.clearInterval(id)
  }, [html])

  return <div ref={ref} />
}
