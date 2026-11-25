// Adaptador de Netlify (se mantiene por si se vuelve a publicar allí). El código está en src/api.mjs.
import { getStore } from "@netlify/blobs";
import fs from "node:fs";
import path from "node:path";
import { handle } from "../../src/api.mjs";

function content() {
  const tries = [path.resolve("content"), path.resolve(process.cwd(), "content"), path.join(path.dirname(new URL(import.meta.url).pathname), "../../content")];
  for (const dir of tries) {
    try { return { data: JSON.parse(fs.readFileSync(path.join(dir, "data.json"), "utf8")), res: JSON.parse(fs.readFileSync(path.join(dir, "res.json"), "utf8")) }; } catch (e) {}
  }
  throw new Error("No se encuentra el contenido");
}
export default (req) => handle(req, { env: process.env, store: getStore({ name: "opo-atc", consistency: "strong" }), content });
export const config = { path: "/api/*" };
