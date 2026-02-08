import type { EditorView } from "@codemirror/view"

export function wrapSelection(view: EditorView, before: string, after: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  view.dispatch({
    changes: { from, to, insert: `${before}${selected}${after}` },
    selection: { anchor: from + before.length, head: to + before.length },
  })
  view.focus()
}

export function applyHeading(view: EditorView, action: string) {
  const { from } = view.state.selection.main
  const line = view.state.doc.lineAt(from)
  const lineText = line.text

  // Remove existing heading markers
  const stripped = lineText.replace(/^#{1,3}\s*/, "")

  let newText: string
  switch (action) {
    case "h1":
      newText = `# ${stripped}`
      break
    case "h2":
      newText = `## ${stripped}`
      break
    case "h3":
      newText = `### ${stripped}`
      break
    default:
      newText = stripped
  }

  view.dispatch({
    changes: { from: line.from, to: line.to, insert: newText },
  })
  view.focus()
}

export function insertFootnote(view: EditorView, template: string) {
  const { from, to } = view.state.selection.main
  const selected = view.state.sliceDoc(from, to)
  const n = "X"

  let text: string
  switch (template) {
    case "reference":
      text = `${selected}[^${n}]`
      break
    case "single":
      text = `[^${n}]{${selected}}[^${n}]`
      break
    case "start":
      text = `[^${n}]{${selected}~[^${n}]`
      break
    case "continuation":
      text = `[^${n}]~${selected}~[^${n}]`
      break
    case "end":
      text = `[^${n}]~${selected}}[^${n}]`
      break
    default:
      text = selected
  }

  view.dispatch({
    changes: { from, to, insert: text },
  })
  view.focus()
}

export function correctText(view: EditorView) {
  const text = view.state.doc.toString()
  const corrected = text.replace(/(?<!\n)\n(?!($|\n))/g, " ")
  if (corrected !== text) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: corrected },
    })
  }
  view.focus()
}

export const PARAGRAPH_ITEMS = [
  { label: "Заголовок 1", action: "h1" },
  { label: "Заголовок 2", action: "h2" },
  { label: "Заголовок 3", action: "h3" },
  { label: "Параграф", action: "paragraph" },
]

export const FOOTNOTE_ITEMS = [
  { label: "Ссылка", action: "reference" },
  { label: "Одностраничная", action: "single" },
  { label: "Начало", action: "start" },
  { label: "Продолжение", action: "continuation" },
  { label: "Окончание", action: "end" },
]
