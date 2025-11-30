// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from 'https://esm.sh/@supabase/supabase-js';  // Import Supabase

// // Init Supabase (use your project URL and anon key from .env or dashboard)
// const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

// serve(async (req) => {
//   const { filePath } = await req.json();
//   const token = Deno.env.get("HUGGING_FACE_TOKEN");
//   const { data: fileData } = await supabase.storage.from('evidence').download(filePath);
//   if (!fileData) return new Response("File not found", { status: 404 });

//   const arrayBuffer = await fileData.arrayBuffer();
//   const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));  // Convert file to base64 for AI

//   const hfResponse = await fetch("https://api-inference.huggingface.co/models/microsoft/trocr-base-printed", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ inputs: base64 }),
//   });

//   if (!hfResponse.ok) return new Response(await hfResponse.text(), { status: hfResponse.status });
//   const result = await hfResponse.json();
//   const extractedText = result[0]?.generated_text || "";

//   return new Response(JSON.stringify({ extractedText }));
// });
 // FAILED TO DEPLOYED DUE TO ACCOUNT RESTRICTION (FRRE PLAN  LIMITATION)
 // DEPLOYMENT COMMAND USED:
 // supabase functions deploy ocr 