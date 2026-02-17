/**
 * Tool: get_legislation_fragment
 *
 * Retrieve a specific fragment (portion) of a UK legislation document
 */

import { LegislationClient, LegislationResponse } from "../api/legislation-client.js";
import { CLMLTextParser } from "../parsers/clml-text-parser.js";

export const name = "get_legislation_fragment";

export const description = `Retrieve a specific fragment (section, part, chapter, etc.) of a UK legislation document.

Fetches structural portions of legislation from legislation.gov.uk. Returns readable plain text by default. Use get_legislation_table_of_contents to discover fragment IDs.

Available formats:
- text (default): Readable plain text with markdown-inspired headings and structure
- xml: CLML (Crown Legislation Markup Language) - full legislative XML with metadata
- akn: Akoma Ntoso - international LegalDocML standard
- html: Rendered HTML

Fragment types supported:
- section: Individual sections (e.g., "section/5")
- part: Parts of legislation (e.g., "part/1")
- chapter: Chapters within parts (e.g., "part/1/chapter/2")
- crossheading: Cross-headings (e.g., "crossheading/example")
- Hierarchical combinations (e.g., "part/2/chapter/3/section/10")
- regulation: For statutory instruments (e.g., "regulation/5")

Note: The legislation.gov.uk API does not support retrieval below the Subsection level.

Examples:
- get_legislation_fragment(type="ukpga", year="1968", number="60", fragmentId="section/1") → Section 1 of Theft Act 1968
- get_legislation_fragment(type="ukpga", year="2020", number="1", fragmentId="part/2/chapter/1") → Part 2, Chapter 1
- get_legislation_fragment(type="ukpga", year="2020", number="1", fragmentId="section/10", version="2023-01-01") → As it stood on 1 Jan 2023

Version parameter:
- Date (YYYY-MM-DD): Retrieve fragment as it stood on that date
- "enacted": Original version for UK primary legislation (Acts)
- "made": Original version for UK secondary legislation (SIs, etc.)
- "created": Original version for uncommon UK types (e.g., Church Instruments)
- "adopted": Original version for EU legislation`;

export const inputSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      description: "Type of legislation (e.g., ukpga, uksi, asp, ukla)",
    },
    year: {
      type: "string",
      description: "Year of enactment. A 4-digit calendar year (e.g., 2020) works for all legislation. For pre-1963 Acts, the canonical identifier uses a regnal year in Reign/Number format (e.g., Vict/63, Geo5/26) — but a calendar year will usually work too, as the API redirects. Use regnal years when you need to disambiguate (a calendar year can span two regnal years). See the years://regnal resource for valid identifiers.",
    },
    number: {
      type: "string",
      description: "Legislation number (e.g., 18, 1234)",
    },
    fragmentId: {
      type: "string",
      description: "Fragment identifier path (e.g., section/5, part/1/chapter/2, regulation/10)",
    },
    format: {
      type: "string",
      enum: ["xml", "text", "akn", "html"],
      description: "Response format (default: text for readable plain text, xml for CLML, akn for Akoma Ntoso, html for rendered version)",
    },
    version: {
      type: "string",
      description: "Optional: Version to retrieve. Use enacted/made/created/adopted for original version, or YYYY-MM-DD for legislation as it stood on that date. Dates before first version return an error.",
    },
  },
  required: ["type", "year", "number", "fragmentId"],
};

export async function execute(
  args: {
    type: string;
    year: string;
    number: string;
    fragmentId: string;
    format?: "xml" | "text" | "akn" | "html";
    version?: string;
  },
  client: LegislationClient
): Promise<any> {
  const { type, year, number, fragmentId, format = "text", version } = args;

  try {
    const apiFormat = format === "text" ? "xml" : format;
    const result = await client.getFragment(type, year, number, fragmentId, {
      format: apiFormat,
      version,
    });

    if (result.kind === "disambiguation") {
      return formatDisambiguation(result);
    }

    const content = format === "text"
      ? new CLMLTextParser().parse(result.content)
      : result.content;

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving legislation fragment: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}

function formatDisambiguation(result: Extract<LegislationResponse, { kind: "disambiguation" }>) {
  const list = result.alternatives
    .map(a => `- ${a.title} → use year="${a.year}", number="${a.number}"`)
    .join("\n");
  return {
    content: [
      {
        type: "text" as const,
        text: `Ambiguous request: the calendar year matched multiple regnal years. Retry with a specific regnal year:\n${list}`,
        annotations: { audience: ["assistant" as const], priority: 1 },
      },
    ],
  };
}
