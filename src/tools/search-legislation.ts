/**
 * Tool: search_legislation
 *
 * Search for UK legislation by keyword, title, or other criteria
 */

import { LegislationClient } from "../api/legislation-client.js";

export const name = "search_legislation";

export const description = `Search for UK legislation by keyword, title, or other criteria.

This tool provides flexible search across all UK legislation hosted on legislation.gov.uk.

Search parameters:
- title: Search in legislation titles (e.g., "theft", "coronavirus")
- text: Full-text search across legislation content
- type: Filter by legislation type (ukpga, uksi, asp, etc.)
- year: Filter by specific year
- startYear/endYear: Filter by year range

Examples:
- search_legislation(title="theft") → All legislation with "theft" in the title
- search_legislation(title="coronavirus", year="2020") → COVID legislation from 2020
- search_legislation(text="data protection", type="ukpga") → Acts containing "data protection"
- search_legislation(type="uksi", startYear="2020", endYear="2023") → SIs from 2020-2023

Returns an Atom feed (XML format) with matching documents including metadata (title, year, number, citation).

**For help parsing Atom feed results, read the resource at: atom://feed-guide**
**For help converting document types, read the resource at: types://guide**

Use the type, year, and number from search results with get_legislation to retrieve the full document.`;

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
  },
  client: LegislationClient
): Promise<any> {
  try {
    const results = await client.search(args);

    // Results are already in Atom feed XML format
    return {
      content: [
        {
          type: "text",
          text: results,
        },
      ],
    };
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
