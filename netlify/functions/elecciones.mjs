import { getStore } from "@netlify/blobs";

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
    let state = (await store.get("state", { type: "json" })) || {};

    if (req.method === "POST") {
      const body = await req.json();
      if (body && body.reset === true) {
        state = {};
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
