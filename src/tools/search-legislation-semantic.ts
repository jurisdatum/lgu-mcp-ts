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

IMPORTANT: This tool searches a pre-computed vector index that may not reflect the most recent legislation.
The index is a snapshot and may be days or weeks behind the live legislation.gov.uk dataset. For critical
research or to ensure you have the latest amendments, verify results against search_legislation or the
live website.

Returned fields:
- id: Legislation identifier (e.g., "ukpga/2018/12")
- title: Act title
- year, number, type: Citation components
- enactmentDate: When enacted (primary legislation only; secondary legislation dates not available)
- sections: Best-matching sections with:
  - number: Section identifier (e.g., "1", "2A")
  - provisionType: Type (e.g., "section", "regulation")
  - score: Semantic similarity score (0.0-1.0, higher = more relevant)

Note: Section identifiers only, NOT the actual text

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
