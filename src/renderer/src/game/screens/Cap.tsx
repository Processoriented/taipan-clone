export function Cap({ text }: { text: string }): React.JSX.Element {
  return (
    <>
      <span className="cap">{text.charAt(0)}</span>
      {text.slice(1)}
    </>
  )
}
