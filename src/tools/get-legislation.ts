/**
 * Tool: get_legislation
 *
 * Retrieve a specific piece of UK legislation by citation
 */

import { LegislationClient } from "../api/legislation-client.js";

export const name = "get_legislation";

export const description = `Retrieve a specific piece of UK legislation by citation in CLML (Crown Legislation Markup Language) XML format.

This tool fetches full legislation documents from legislation.gov.uk by their type, year, and number.

Returns CLML XML by default - a structured, machine-readable format that preserves all legislative metadata and content.

**For help parsing CLML XML structure, read the resource at: clml://schema-guide**
**For step-by-step examples, see: cookbook://check-extent**

Available formats:
- xml (default): CLML format - UK-specific legislative XML schema
- akn: Akoma Ntoso format - international LegalDocML standard
- html: Rendered HTML for human reading

Common legislation types:
- ukpga: UK Public General Acts (Acts of Parliament)
- uksi: UK Statutory Instruments (secondary legislation)
- ukla: UK Local Acts
- asp: Acts of the Scottish Parliament
- ukia: UK Impact Assessments
- anaw: Acts of the National Assembly for Wales
- asc: Acts of Senedd Cymru (Welsh Parliament)
- nia: Northern Ireland Acts

Examples:
- get_legislation(type="ukpga", year="1968", number="60") → Theft Act 1968 in CLML XML
- get_legislation(type="uksi", year="2020", number="1234") → Specific SI in CLML XML
- get_legislation(type="ukpga", year="2020", number="1", version="2023-01-01") → As it stood on 1 Jan 2023
- get_legislation(type="ukpga", year="2025", number="1", version="enacted") → Original enacted version
- get_legislation(type="ukpga", year="1968", number="60", format="akn") → Akoma Ntoso XML format
- get_legislation(type="ukpga", year="1968", number="60", format="html") → HTML rendering

Version parameter:
- Date (YYYY-MM-DD): Retrieve legislation as it stood on that date
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
      description: "Year of enactment (e.g., 2020, 1968)",
    },
    number: {
      type: "string",
      description: "Legislation number (e.g., 18, 1234)",
    },
    format: {
      type: "string",
      enum: ["xml", "akn", "html"],
      description: "Response format (default: xml for CLML, akn for Akoma Ntoso, html for rendered version)",
    },
    version: {
      type: "string",
      description: "Optional: Version to retrieve. Use enacted/made/created/adopted for original version, or YYYY-MM-DD for legislation as it stood on that date. Dates before first version return an error.",
    },
  },
  required: ["type", "year", "number"],
};

export async function execute(
  args: {
    type: string;
    year: string;
    number: string;
    format?: "xml" | "akn" | "html";
    version?: string;
  },
  client: LegislationClient
): Promise<any> {
  const { type, year, number, format = "xml", version } = args;

  try {
    const document = await client.getDocument(type, year, number, {
      format,
      version,
    });

    // Return XML/HTML as-is (already a string from the API)
    return {
      content: [
        {
          type: "text",
          text: typeof document === "string" ? document : JSON.stringify(document, null, 2),
        },
      ],
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error retrieving legislation: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
}
