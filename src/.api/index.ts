// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// serve(async (req) => {
//   const { text } = await req.json();
//   const token = Deno.env.get("HUGGING_FACE_TOKEN");

//   const hfResponse = await fetch(
//     "https://api-inference.huggingface.co/models/unitary/toxic-bert",
//     {
//       // method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ inputs: text }),
//     }
//   );

//   if (!hfResponse.ok) {
//     return new Response(await hfResponse.text(), {
//       status: hfResponse.status,
//     });
//   }

//   const result = await hfResponse.json();
//   const toxicityScore =
//     result[0]?.find((item: any) => item.label === "toxic")?.score || 0;

//   const threats = text.match(/blackmail|threat|harass/i)
//     ? "High Threat"
//     : "Low";

//   return new Response(JSON.stringify({ toxicityScore, threats }), {
//     headers: { "Content-Type": "application/json" },
//   });
// });
