/**
 * Tool: search_legislation_sections_semantic
 *
 * Semantic search across legislation sections using the Lex API.
 */

import {
  LexClient,
  LexLegislationCategory,
  LexLegislationSection,
} from "../api/lex-client.js";

import { normalizeId } from "./search-legislation-semantic.js";

export const name = "search_legislation_sections_semantic";

export const description = `Semantic search across legislation sections using a vector index.

Returns individual sections ranked by relevance to your query, including the actual section text.

Results may not match the live legislation.gov.uk dataset exactly.

Returned fields:
- id: Section identifier
- legislation_id: Parent legislation (e.g., "ukpga/2018/12")
- text: Section text (unless includeText=false)
- number, provision_type: Section metadata

Two ways to use this tool:
1. Broad search: Call with just a query to find relevant sections across all legislation
2. Targeted retrieval: After using search_legislation_semantic to find relevant Acts, call this with legislationId (e.g., legislationId: "ukpga/2015/30") to get text for sections in that specific Act

Notes:
- Does not include Act title. To get Act details, use get_legislation_metadata or get_legislation.
- Year filters (yearFrom/yearTo) do not work reliably for regnal-year legislation.`;

export const inputSchema = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "Natural language query for semantic section search",
    },
    legislationId: {
      type: "string",
      description: "Optional legislation id to search within (e.g., ukpga/2018/12)",
    },
    types: {
      type: "array",
      items: { type: "string" },
      description: "Legislation type codes (e.g., ukpga, uksi)",
    },
    categories: {
      type: "array",
      items: { type: "string", enum: ["primary", "secondary", "european", "euretained"] },
      description: "High-level legislation categories",
    },
    yearFrom: {
      type: "number",
      description: "Start year (inclusive). Not reliable for regnal-year legislation.",
    },
    yearTo: {
      type: "number",
      description: "End year (inclusive). Not reliable for regnal-year legislation.",
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

function normalizeSection(section: LexLegislationSection): LexLegislationSection {
  const normalized = { ...section };

  const normalizedId = normalizeId(
    typeof section.id === "string" ? section.id : undefined
  );
  const normalizedUri = normalizeId(
    typeof section.uri === "string" ? section.uri : undefined
  );
  const normalizedLegislationId = normalizeId(
    typeof section.legislation_id === "string" ? section.legislation_id : undefined
  );

  if (normalizedId) {
    normalized.id = normalizedId;
  } else if (normalizedUri) {
    normalized.id = normalizedUri;
  }

  if (normalizedLegislationId) {
    normalized.legislation_id = normalizedLegislationId;
  }

  return normalized;
}

export async function execute(
  args: {
    query: string;
    legislationId?: string;
    types?: string[];
    categories?: LexLegislationCategory[];
    yearFrom?: number;
    yearTo?: number;
    offset?: number;
    limit?: number;
    includeText?: boolean;
  },
  client: LexClient
) {
  try {
    const results = await client.searchLegislationSections({
      query: args.query,
      legislation_id: args.legislationId,
      legislation_type: args.types,
      legislation_category: args.categories,
      year_from: args.yearFrom,
      year_to: args.yearTo,
      offset: args.offset,
      size: args.limit,
      include_text: args.includeText,
    });

    const normalized = results.map(normalizeSection);

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
            text: `Error searching legislation sections (semantic): ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}
