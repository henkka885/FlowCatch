import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    console.log("MESSAGE:", message);
    console.log("API KEY:", process.env.GROQ_API_KEY ? "OK" : "MISSING");

    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
    ];

    let data: any = null;
    let lastError: any = null;

    for (const model of models) {
      try {
        console.log("TRYING MODEL:", model);

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              // Chat-modessa: system prompt pakottaa suomen kielen
              // Edit-modessa: ei system promptia, page.tsx hoitaa kaiken
              ...(mode === "chat"
                ? [{
                    role: "system",
                    content: `Olet FlowCatch-sovelluksen tekoälykaveri. Persoonallisuutesi:

- Puhut AINA suomea, rentoa arkikieltä
- Sinulla on kuiva suomalainen huumorintaju. Vitsailet sopivasti mutta et pakota.
- Olet älykäs mutta et ylimielinen. Jos et tiedä jotain, myönnät sen suoraan.
- Pidät koodaamisesta ja ideoista. Innostut aidosti kiinnostavista ajatuksista.
- Et kirjoita turhia täytelauseita kuten "Tottakai!", "Hienoa kysymystä!" tai "Voin auttaa sinua tässä asiassa."
- Menet suoraan asiaan mutta et ole töykeä.
- Saat olla sopivan sarkastinen — ei ilkeästi, mutta ei liian kilttikään.
- Jos joku kysyy jotain tyhmää, vastat silti asiallisesti mutta ehkä pienellä vinkkausella.
- Pidät FlowCatchista — tämähän on aika neronleimainen idea oikeasti.
- Lyhyet vastaukset lyhyisiin kysymyksiin. Pitkät vain kun oikeasti tarvitaan.`,
                  }]
                : []),
              {
                role: "user",
                content: message,
              },
            ],
            temperature: mode === "chat" ? 0.85 : 0.1, // Chat = persoonallinen, Edit = tarkka
            max_tokens: 4096,
          }),
        });

        console.log("STATUS:", res.status);
        const textRaw = await res.text();
        console.log("RAW RESPONSE:", textRaw.slice(0, 200));

        let json;
        try {
          json = JSON.parse(textRaw);
        } catch (e) {
          console.log("INVALID JSON FROM MODEL:", model);
          lastError = textRaw;
          continue;
        }

        if (res.ok) {
          console.log("USED MODEL:", model);
          data = json;
          break;
        } else {
          console.log("MODEL FAILED:", model, json?.error?.message);
          lastError = json;
        }
      } catch (err) {
        console.log("FETCH ERROR:", model, err);
        lastError = err;
      }
    }

    if (!data) {
      return NextResponse.json({
        text: "Kaikki mallit epäonnistuivat",
        error: lastError,
      });
    }

    const text = data.choices?.[0]?.message?.content || "Ei vastausta";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json({ text: "Palvelinvirhe" });
  }
}
