import { type SQLiteDatabase } from "expo-sqlite";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import * as Sentry from "@sentry/react-native";

// NOTE: Metro requires asset `require()` calls to be statically analyzable.
// Do NOT build these paths dynamically (e.g. `.map(require)`), or bundling will fail.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const migrations = [require("./initial_schema.sql")];

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  try {
    // Use WAL mode for better concurrent performance on mobile
    await db.execAsync("PRAGMA journal_mode = WAL;");

    const migrationAssets = await Asset.loadAsync(migrations);

    const versionResult = await db.getFirstAsync<{
      user_version: number;
    }>("PRAGMA user_version");

    const currentVersion = versionResult?.user_version ?? 0;
    console.log(`Current database version: ${currentVersion}`);

    for (const [index, { localUri, name }] of migrationAssets.entries()) {
      if (!localUri) continue;

      const content = await new File(localUri).text();

      const version = index + 1;

      if (version > currentVersion) {
        await db.execAsync(content);
        await db.execAsync(`PRAGMA user_version = ${version}`);
        console.log(`Applied migration ${name}; new version: ${version}`);
      }
    }
  } catch (error) {
    Sentry.captureException(error);
    console.error(error);
  }
}
