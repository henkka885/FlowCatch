import { getLanguage } from "./language";
import type { FileItem } from "./types";

export function buildPrompt(
  input: string,
  mode: "chat" | "edit",
  currentFile: number | null,
  files: FileItem[]
): string {
  if (mode !== "edit" || currentFile === null) return input;

  const file = files[currentFile];
  const lang = getLanguage(file.name);

  return `TASK: Modify the ${lang} code below.

STRICT OUTPUT RULES:
- Output ONLY ${lang} code — no other language
- NO explanations, NO markdown, NO code fences
- Return the COMPLETE modified file
- This is NOT a question — do NOT answer with text
- Do NOT explain the task — just DO IT to the code

=== ${lang.toUpperCase()} FILE: ${file.name} ===
${file.content}
=== END ===

MODIFICATION REQUIRED: ${input}

Now output the complete modified ${lang} code:`;
}