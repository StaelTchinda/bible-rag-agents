import { ask } from "./ask";
import { buildIndex } from "./build-index";
import { ingest } from "./normalize";
import { search } from "./search";
import { verify } from "./verify";

/**
 * bible-data CLI — fetch, normalize, and index public-domain Bibles.
 *
 *   ingest       download sources and normalize to canonical verse JSON
 *   build-index  chunk + embed + quantize → the prebuilt static index (Phase 2)
 *   verify       sanity-check verse counts and 66-book coverage
 */
const command = process.argv[2];

async function main(): Promise<void> {
  switch (command) {
    case "ingest":
      await ingest();
      break;
    case "verify": {
      const ok = await verify();
      if (!ok) process.exitCode = 1;
      break;
    }
    case "build-index":
      await buildIndex();
      break;
    case "search": {
      const query = process.argv.slice(3).join(" ") || "love your enemies";
      await search(query);
      break;
    }
    case "ask": {
      const query = process.argv.slice(3).join(" ") || "How should I treat my enemies?";
      await ask(query);
      break;
    }
    default:
      console.log("Usage: bible-data <ingest|build-index|verify|search <query>|ask <query>>");
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
