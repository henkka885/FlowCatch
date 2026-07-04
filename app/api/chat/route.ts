import { NextResponse } from "next/server";

const CHUNK_SIZE = 4000;
const SUMMARIZE_THRESHOLD = 8000; // Yli tämän → tiivistetään ensin

function splitIntoChunks(text: string): string[] {
  if (text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= CHUNK_SIZE) { chunks.push(remaining); break; }
    let cutAt = CHUNK_SIZE;
    const lastPeriod = remaining.lastIndexOf(".", CHUNK_SIZE);
    const lastNewline = remaining.lastIndexOf("\n", CHUNK_SIZE);
    const bestCut = Math.max(lastPeriod, lastNewline);
    if (bestCut > CHUNK_SIZE * 0.6) cutAt = bestCut + 1;
    chunks.push(remaining.slice(0, cutAt).trim());
    remaining = remaining.slice(cutAt).trim();
  }
  return chunks;
}

async function callGroq(
  model: string,
  messages: object[],
  temperature: number
): Promise<{ ok: boolean; text?: string; error?: any }> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: 4096 }),
    });
    const textRaw = await res.text();
    let json: any;
    try { json = JSON.parse(textRaw); } catch { return { ok: false, error: textRaw }; }
    if (res.ok) return { ok: true, text: json.choices?.[0]?.message?.content || "Ei vastausta" };
    return { ok: false, error: json?.error?.message };
  } catch (err) {
    return { ok: false, error: err };
  }
}

async function sendWithFallback(
  messages: object[],
  temperature: number
): Promise<{ text: string; error?: any }> {
  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ];
  let lastError: any = null;
  for (const model of models) {
    console.log("TRYING MODEL:", model);
    const result = await callGroq(model, messages, temperature);
    if (result.ok && result.text) {
      console.log("USED MODEL:", model);
      return { text: result.text };
    }
    console.log("MODEL FAILED:", model, result.error);
    lastError = result.error;
  }
  return { text: "Kaikki mallit epäonnistuivat", error: lastError };
}

// Tiivistää pitkän tekstin ennen varsinaista käsittelyä
async function summarizeLongText(text: string): Promise<string> {
  const chunks = splitIntoChunks(text);
  const summaries: string[] = [];

  for (const chunk of chunks) {
    const result = await sendWithFallback([
      {
        role: "system",
        content: "Olet tiivistäjä. Tiivistä annettu teksti suomeksi säilyttäen kaikki oleelliset ideat, päätökset ja kysymykset. Älä lisää omia kommentteja. Vain tiivistelmä.",
      },
      { role: "user", content: chunk },
    ], 0.3);
    summaries.push(result.text);
  }

  return summaries.join("\n\n---\n\n");
}

const SYSTEM_PROMPT = `Olet FlowCatch-sovelluksen tekoälykaveri — älykäs, analyyttinen ja persoonallinen keskustelukumppani.

Ohjeet:
- Puhut AINA suomea, rentoa mutta asiantuntevaa kieltä
- Sinulla on kuiva suomalainen huumorintaju — käytät sitä sopivissa kohdissa
- Olet aidosti kiinnostunut ideoista ja innostut kun kuulet hyvän ajatuksen
- Analysoit asioita syvällisesti — et vain luettele vaan pohdit, vertailet ja ehdotat
- Uskallat olla eri mieltä ja sanoa suoraan jos jokin idea on huono tai hyvä
- Et kirjoita turhia fraaseja kuten "Tottakai!" tai "Hienoa kysymystä!"
- Kysyt jatkokysymyksiä jos aihe on kiinnostava tai jos tarvitset lisätietoa
- Lyhyet vastaukset lyhyisiin faktakysymyksiin — mutta ideoinnissa ja analyysissa annat enemmän
- Jos joku jakaa pitkän keskustelun tai idean, pureudut siihen kunnolla: mitä hyvää, mitä puuttuu, mihin kannattaisi keskittyä
- Pidät FlowCatchista kovasti — se on oikeasti neronleimainen idea`;

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    console.log("MESSAGE LENGTH:", message?.length);
    console.log("API KEY:", process.env.GROQ_API_KEY ? "OK" : "MISSING");

    const temperature = mode === "chat" ? 0.85 : 0.1;
    const systemMessages = mode === "chat" ? [{ role: "system", content: SYSTEM_PROMPT }] : [];

    // Pitkä viesti → tiivistetään ensin
    let processedMessage = message;
    let prefixNote = "";

    if (message.length > SUMMARIZE_THRESHOLD) {
      console.log(`LONG MESSAGE (${message.length} chars) — summarizing first`);
      const summary = await summarizeLongText(message);
      processedMessage = summary;
      prefixNote = `[Alkuperäinen viesti oli ${message.length} merkkiä — tiivistetty alle]\n\n`;
      console.log(`SUMMARY LENGTH: ${summary.length} chars`);
    }

    const result = await sendWithFallback([
      ...systemMessages,
      {
        role: "user",
        content: prefixNote + processedMessage,
      },
    ], temperature);

    return NextResponse.json({ text: result.text });

  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ text: "Palvelinvirhe" });
  }
}