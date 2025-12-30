
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './drizzle',
    schema: './src/lib/schema.ts',
    dialect: 'sqlite',
    dbCredentials: {
        url: 'fitness.db',
    },
});
