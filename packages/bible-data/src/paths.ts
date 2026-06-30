import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** packages/bible-data/data */
export const DATA_DIR = path.resolve(here, "..", "data");
/** Cached raw source responses (gitignored). */
export const RAW_DIR = path.join(DATA_DIR, "raw");
/** Normalized canonical-verse JSON, one file per translation (gitignored). */
export const NORMALIZED_DIR = path.join(DATA_DIR, "normalized");
/** Generated static index shipped to the web app (gitignored). */
export const DIST_INDEX_DIR = path.resolve(here, "..", "dist-index");
/** apps/web/public/index — where the web app serves the index from (gitignored). */
export const WEB_INDEX_DIR = path.resolve(here, "..", "..", "..", "apps", "web", "public", "index");
