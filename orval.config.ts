import { defineConfig } from 'orval';

export default defineConfig({
  petstore: {
    output: {
      mode: 'tags-split',
      target: 'src/services/generated/api.ts',
      schemas: 'src/services/generated/model',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/services/api.ts',
          name: 'customInstance',
        },
      },
    },
    input: {
      target: './openapi.json',
    },
  },
});