import type { OcrData, OcrWord } from "@/types/models"

export function findHighlightedWords(
  ocrData: OcrData,
  selectionFrom: number,
  selectionTo: number,
): OcrWord[] {
  return ocrData.words.filter((word) => {
    const wordStart = word.char_offset
    const wordEnd = word.char_offset + word.text.length
    return wordStart < selectionTo && wordEnd > selectionFrom
  })
}
