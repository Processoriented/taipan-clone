export function PromptInput({
  value,
  cursor
}: {
  value: string
  cursor: boolean
}): React.JSX.Element {
  return (
    <span className="prompt-input">
      {value}
      {cursor ? <span className="prompt-cursor">_</span> : null}
    </span>
  )
}
