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

  const firstX = text.indexOf(n)
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + firstX, head: from + firstX + n.length },
  })
  view.focus()
}

/**
 * Cyrillic characters that visually match Roman numeral symbols.
 */
const CYR_TO_LAT: Record<string, string> = {
  "Х": "X", "х": "x", "С": "C", "с": "c", "М": "M", "м": "m", "І": "I", "і": "i",
}
const CYR_ROMAN_RE = /[ХхСсМмІі]/

/**
 * Corrects text after OCR recognition.
 *
 * 1. All whitespace except \n → regular space.
 * 2. Hyphenated word at end of line ("-\n") → join word parts.
 * 3. Remaining single \n within a paragraph → space (double \n preserved).
 * 4. Hyphen used as dash → em dash "—".
 * 5. Cyrillic lookalike letters in Roman numerals → Latin equivalents.
 * 6. Add space after period in abbreviations/initials.
 * 7. Multiple consecutive spaces → single space.
 */
function correctOcrText(str: string): string {
  // 1. All whitespace except \n → regular space
  str = str.replace(/[^\S\n]/g, " ")
  // 2. Hyphenated word: "-\n" (not before end of string or blank line) → ""
  str = str.replace(/-\n(?!($|\n))/g, "")
  // 3. Remaining single \n → space (double \n preserved)
  str = str.replace(/(?<!\n)\n(?!($|\n))/g, " ")
  // 4a. Double hyphen → em dash
  str = str.replace(/--/g, "\u2014")
  // 4b. Hyphen after punctuation (with optional space before it) → "punct — "
  str = str.replace(/([,.:;!?»)]) ?- /g, "$1 \u2014 ")
  // 4c. Single hyphen between spaces → em dash
  str = str.replace(/ - /g, " \u2014 ")
  // 5. Cyrillic lookalikes in Roman numerals → Latin
  str = str.replace(
    /(?<![а-яёА-ЯЁa-zA-Z0-9.])[IVXLCDMivxlcdmХхСсМмІі]+(?![а-яёА-ЯЁa-zA-Z0-9])/g,
    (match) => {
      if (!CYR_ROMAN_RE.test(match)) return match
      return match.replace(/[ХхСсМмІі]/g, (ch) => CYR_TO_LAT[ch])
    },
  )
  // 6. Abbreviations/initials: letter + period + (letter or digit) without space → add space
  str = str.replace(/([а-яёА-ЯЁa-zA-Z])\.(?=[а-яёА-ЯЁa-zA-Z0-9])/g, "$1. ")
  // 7. Multiple consecutive spaces → single space
  str = str.replace(/ {2,}/g, " ")
  return str
}

export function correctText(view: EditorView) {
  const original = view.state.doc.toString()
  const corrected = correctOcrText(original)
  if (corrected !== original) {
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
