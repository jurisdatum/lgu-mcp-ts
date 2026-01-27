/**
 * Tool: search_legislation
 *
 * Search for UK legislation by keyword, title, or other criteria
 */

import { LegislationClient } from "../api/legislation-client.js";
import { AtomParser } from "../parsers/atom-parser.js";

export const name = "search_legislation";

export const description = `Search for UK legislation by keyword, title, or other criteria (experimental JSON format).

This tool provides flexible search across all UK legislation hosted on legislation.gov.uk.

Returns clean JSON by default with an array of matching documents. Set format="xml" for raw Atom feed.

**Experimental Feature**: JSON format parses Atom XML into structured results for improved AI usability.

Returned fields (JSON format):
- id: Simplified identifier (e.g., "ukpga/2021/24")
- type: Legislation type code (e.g., "ukpga")
- year: Year of enactment/making (number, e.g., 2021)
- number: Legislation number (number, e.g., 24)
- title: Human-readable title
- date: Creation date (optional, e.g., "2021-04-29")

Search parameters:
- title: Search in legislation titles (e.g., "theft", "coronavirus")
- text: Full-text search across legislation content
- type: Filter by legislation type (ukpga, uksi, asp, etc.)
- year: Filter by specific year
- startYear/endYear: Filter by year range
- format: Response format (json or xml, default: json)

Examples:
- search_legislation(title="theft") → All legislation with "theft" in the title
- search_legislation(title="coronavirus", year="2020") → COVID legislation from 2020
- search_legislation(text="data protection", type="ukpga") → Acts containing "data protection"
- search_legislation(type="uksi", startYear="2020", endYear="2023") → SIs from 2020-2023

Use the id, type, year, and number from search results with get_legislation to retrieve the full document.`;

export const inputSchema = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Search in legislation titles",
    },
    text: {
      type: "string",
      description: "Full-text search across legislation content",
    },
    type: {
      type: "string",
      description: "Filter by legislation type (e.g., ukpga, uksi, asp)",
    },
    year: {
      type: "string",
      description: "Filter by specific year",
    },
    startYear: {
      type: "string",
      description: "Start of year range (inclusive)",
    },
    endYear: {
      type: "string",
      description: "End of year range (inclusive)",
    },
    format: {
      type: "string",
      enum: ["json", "xml"],
      description: "Response format (default: json for structured results, xml for raw Atom feed)",
    },
  },
};

export async function execute(
  args: {
    title?: string;
    text?: string;
    type?: string;
    year?: string;
    startYear?: string;
    endYear?: string;
    format?: "json" | "xml";
  },
  client: LegislationClient
): Promise<any> {
  const { format = "json", ...searchParams } = args;

  try {
    const results = await client.search(searchParams);

    // Return JSON by default, XML if explicitly requested
    if (format === "json") {
      const parser = new AtomParser();
      const parsed = parser.parse(results);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(parsed, null, 2),
          },
        ],
      };
    } else {
      // Return raw XML
      return {
        content: [
          {
            type: "text",
            text: results,
          },
        ],
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching legislation: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}
