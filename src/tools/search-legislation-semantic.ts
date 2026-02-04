/**
 * Tool: search_legislation_semantic
 *
 * Semantic search across legislation using the Lex API.
 */

import { LexClient } from "../api/lex-client.js";
import { mapLegislationSearchResponse } from "../api/lex-mapper.js";

export const name = "search_legislation_semantic";

export const description = `Semantic search across legislation using a vector index.

Returns Acts ranked by relevance to your query, based on their best-matching sections.

Results may not match the live legislation.gov.uk dataset exactly.

Returned fields:
- id: Legislation identifier (e.g., "ukpga/2018/12")
- title: Act title
- year, number, type: Citation components
- enactmentDate: When enacted (primary legislation only; secondary legislation dates not available)
- sections: Best-matching sections (number, provisionType, score) - identifiers only, NOT the actual text

To get section text after finding relevant Acts:
- Use search_legislation_sections_semantic to find sections across all legislation
- For the full Act: use get_legislation`;

export const inputSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Natural language query for semantic search",
    },
    types: {
      type: "array",
      items: { type: "string" },
      description: "Legislation type codes (e.g., ukpga, uksi)",
    },
    yearFrom: {
      type: "number",
      description: "Start year (inclusive)",
    },
    yearTo: {
      type: "number",
      description: "End year (inclusive)",
    },
    offset: {
      type: "number",
      description: "Pagination offset",
    },
    limit: {
      type: "number",
      description: "Max results (default: 10)",
    },
  },
  required: ["query"],
};


export async function execute(
  args: {
    query: string;
    types?: string[];
    yearFrom?: number;
    yearTo?: number;
    offset?: number;
    limit?: number;
  },
  client: LexClient
) {
  try {
    const results = await client.searchLegislation({
      query: args.query,
      legislation_type: args.types,
      year_from: args.yearFrom,
      year_to: args.yearTo,
      offset: args.offset,
      limit: args.limit,
    });

    const mapped = mapLegislationSearchResponse(results);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(mapped, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching legislation (semantic): ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}
