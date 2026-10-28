import { getStore } from "@netlify/blobs";

const SEED_CHOICES = {"1026": "juez", "1077": "fiscal", "1082": "fiscal", "1097": "fiscal", "1120": "juez", "1123": "juez", "116": "juez", "1177": "juez", "1193": "juez", "1215": "juez", "1223": "juez", "1240": "juez", "1257": "juez", "1264": "juez", "1280": "fiscal", "1645": "juez", "165": "juez", "1671": "juez", "1697": "juez", "1718": "fiscal", "1720": "juez", "1784": "fiscal", "1792": "fiscal", "1807": "fiscal", "1822": "juez", "184": "juez", "1844": "juez", "1848": "fiscal", "1878": "juez", "1917": "fiscal", "1930": "juez", "1946": "fiscal", "1988": "juez", "2242": "juez", "2310": "juez", "2311": "juez", "2314": "juez", "2344": "fiscal", "2390": "juez", "2392": "juez", "2428": "juez", "2430": "juez", "2432": "juez", "2448": "juez", "2454": "fiscal", "2484": "juez", "2569": "juez", "2574": "fiscal", "2591": "juez", "2797": "juez", "2823": "juez", "2842": "fiscal", "2845": "fiscal", "2855": "juez", "2899": "fiscal", "2937": "fiscal", "2989": "fiscal", "3010": "juez", "3028": "fiscal", "3082": "juez", "3378": "fiscal", "3391": "juez", "3415": "fiscal", "3443": "fiscal", "3500": "juez", "3522": "juez", "3537": "fiscal", "3540": "fiscal", "3556": "juez", "413": "juez", "477": "fiscal", "490": "juez", "5": "fiscal", "506": "fiscal", "526": "juez", "530": "fiscal", "533": "juez", "560": "juez", "627": "fiscal", "632": "fiscal", "665": "juez", "78": "juez"};

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate"
};

export default async (req, context) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const store = getStore({ name: "elecciones", consistency: "strong" });

  try {
    let stored = await store.get("state", { type: "json" });
    let state;
    if (!stored || typeof stored !== "object" || Object.keys(stored).length === 0) {
      state = { ...SEED_CHOICES };
      await store.setJSON("state", state);
    } else {
      state = { ...SEED_CHOICES, ...stored };
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (body && body.reset === true) {
        state = { ...SEED_CHOICES };
        await store.setJSON("state", state);
      } else if (body && body.bulk && typeof body.bulk === "object") {
        for (const [k, v] of Object.entries(body.bulk)) {
          const key = String(Number(k));
          if (v === "juez" || v === "fiscal") {
            state[key] = v;
          } else if (v === null || v === "") {
            delete state[key];
          }
        }
        await store.setJSON("state", state);
      } else if (body && body.num != null) {
        const key = String(Number(body.num));
        if (body.carrera === "juez" || body.carrera === "fiscal") {
          state[key] = body.carrera;
        } else if (body.carrera === null || body.carrera === "") {
          delete state[key];
        }
        await store.setJSON("state", state);
      }
    }

    const items = Object.entries(state).map(([num, carrera]) => ({
      num: Number(num),
      carrera
    }));

    return new Response(JSON.stringify({ ok: true, choices: state, items }), {
      status: 200,
      headers
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers
    });
  }
};
