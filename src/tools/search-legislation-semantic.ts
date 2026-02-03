/**
 * Tool: search_legislation_semantic
 *
 * Semantic search across legislation using the Lex API.
 */

import {
  LexClient,
  LexLegislationSearchResponse,
} from "../api/lex-client.js";

export const name = "search_legislation_semantic";

export const description = `Semantic search across legislation using a vector index.

Returns Acts ranked by relevance to your query, based on their best-matching sections.

Results may not match the live legislation.gov.uk dataset exactly.

Returned fields:
- id: Legislation identifier (e.g., "ukpga/2018/12")
- title: Act title
- year, number, type: Citation components
- sections: Best-matching sections (number, provision_type, score) - identifiers only, NOT the actual text

To get section text after finding relevant Acts:
- For specific sections: call search_legislation_sections_semantic with legislationId set to the Act's id (e.g., legislationId: "ukpga/2015/30")
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
    includeText: {
      type: "boolean",
      description: "Include section text in results (slower)",
    },
  },
  required: ["query"],
};

export function normalizeId(value?: string): string | undefined {
  if (!value) return undefined;
  return value.replace(/^https?:\/\/www\.legislation\.gov\.uk\/(id\/)?/, "");
}

function normalizeSearchResponse(
  response: LexLegislationSearchResponse
): LexLegislationSearchResponse {
  const results = response.results.map((result) => {
    const normalized = { ...result };
    const normalizedId = normalizeId(
      typeof result.id === "string" ? result.id : undefined
    );
    const normalizedUri = normalizeId(
      typeof result.uri === "string" ? result.uri : undefined
    );

    if (normalizedId) {
      normalized.id = normalizedId;
    } else if (normalizedUri) {
      normalized.id = normalizedUri;
    }

    return normalized;
  });

  return { ...response, results };
}

export async function execute(
  args: {
    query: string;
    types?: string[];
    yearFrom?: number;
    yearTo?: number;
    offset?: number;
    limit?: number;
    includeText?: boolean;
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
      include_text: args.includeText,
    });

    const normalized = normalizeSearchResponse(results);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(normalized, null, 2),
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
