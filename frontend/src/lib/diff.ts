import { diffWords } from "diff"

export interface DiffSegment {
  value: string
  added?: boolean
  removed?: boolean
}

export function computeWordDiff(oldText: string, newText: string): DiffSegment[] {
  return diffWords(oldText, newText)
}
