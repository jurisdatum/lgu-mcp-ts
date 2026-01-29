/**
 * Tool: get_legislation_metadata
 *
 * Retrieve structured metadata for a specific piece of UK legislation
 */

import { LegislationClient } from "../api/legislation-client.js";
import { MetadataParser } from "../parsers/metadata-parser.js";

export const name = "get_legislation_metadata";

export const description = `Retrieve structured metadata for a specific piece of UK legislation.

This tool fetches metadata and returns it as clean, structured JSON with key fields extracted.
This is more efficient than fetching the full document when you only need metadata.

**Usage recipes:**
- cookbook://check-extent - Check geographical extent

Returned fields:
- id: Simplified identifier (e.g., "ukpga/2020/2")
- type: Legislation type code (e.g., "ukpga")
- year: Year of enactment/making (number, e.g., 2020)
- number: Legislation number (number, e.g., 2)
- title: Human-readable title
- status: Version status ("draft", "final", "revised", "proposed")
- extent: Geographical extent as array (e.g., ["E", "W", "S", "NI"])
- enactmentDate/madeDate: Key dates in YYYY-MM-DD format

Common legislation types:
- ukpga: UK Public General Acts (Acts of Parliament)
- uksi: UK Statutory Instruments (secondary legislation)
- ukla: UK Local Acts
- asp: Acts of the Scottish Parliament
- anaw: Acts of the National Assembly for Wales
- asc: Acts of Senedd Cymru (Welsh Parliament)
- nia: Northern Ireland Acts

Examples:
- get_legislation_metadata(type="ukpga", year="2020", number="2") → Metadata for Direct Payments to Farmers Act 2020
- get_legislation_metadata(type="ukpga", year="2021", number="24") → Metadata for Fire Safety Act 2021
- get_legislation_metadata(type="ukpga", year="2020", number="2", version="2024-01-01") → Metadata as it stood on 1 Jan 2024
- get_legislation_metadata(type="ukpga", year="2025", number="1", version="enacted") → Original enacted version metadata

Version parameter:
- Date (YYYY-MM-DD): Retrieve metadata as it stood on that date
- "enacted": Original version for UK primary legislation (status="final")
- "made": Original version for UK secondary legislation (status="final")
- "created": Original version for uncommon UK types like Church Instruments (status="final")
- "adopted": Original version for EU legislation (status="final")`;

export const inputSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      description: "Type of legislation (e.g., ukpga, uksi, asp, ukla)",
    },
    year: {
      type: "string",
      description: "Year of enactment (e.g., 2020)",
    },
    number: {
      type: "string",
      description: "Legislation number (e.g., 2, 1234)",
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
    version?: string;
  },
  client: LegislationClient
) {
  const { type, year, number, version } = args;

  // Fetch metadata XML
  const xml = await client.getDocumentMetadata(type, year, number, { version });

  // Parse to structured JSON
  const parser = new MetadataParser();
  const metadata = parser.parse(xml);

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(metadata, null, 2)
      }
    ]
  };
}
