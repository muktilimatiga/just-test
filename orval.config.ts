import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    output: {
      mode: 'tags-split',
      target: 'src/services/generated/api.ts',
      schemas: 'src/services/generated/model',
      client: 'react-query',
      mock: false,
    },
    input: {
      target: './openapi.json',
    },
  },
});