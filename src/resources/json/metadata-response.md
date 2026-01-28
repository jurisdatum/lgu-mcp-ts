# Metadata Response Format

**Experimental JSON format** for `get_legislation_metadata` tool responses.

This tool returns structured metadata for a specific piece of legislation, parsed from the underlying XML into clean JSON.

## LegislationMetadata

### Core Identification

- **id** (string) - Simplified document identifier
  - Format: `{type}/{year}/{number}`
  - Example: `"ukpga/2020/2"`
  - Note: Strips `http(s)://www.legislation.gov.uk/` and `/id/` prefixes for cleaner JSON

- **type** (string) - Legislation type code
  - Example: `"ukpga"`
  - Use this with `get_legislation` tool
  - See `types://guide` for complete list of type codes

- **year** (number) - Year of enactment or making
  - Example: `2020`
  - Extracted from `<ukm:Year>` element (calendar year, not regnal year)

- **number** (number) - Legislation number
  - Example: `2`
  - Extracted from `<ukm:Number>` element

- **title** (string) - Human-readable title
  - Example: `"Direct Payments to Farmers (Legislative Continuity) Act 2020"`

### Version Status

- **status** (string, optional) - Document version status
  - Values: `"draft"`, `"final"`, `"revised"`, `"proposed"`
  - `"final"` = original published version before editorial processing
  - `"revised"` = version processed by editorial system (includes in-force metadata)
  - See `clml://metadata/in-force` for detailed explanation

### Geographical Extent

- **extent** (array of strings, optional) - Jurisdictions where legislation applies
  - Values: `"E"` (England), `"W"` (Wales), `"S"` (Scotland), `"NI"` (Northern Ireland)
  - Example: `["E", "W"]` (England and Wales only)
  - Example: `["E", "W", "S", "NI"]` (United Kingdom-wide)
  - Note: Normalized from `N.I.` to `NI` for consistency
  - See `clml://metadata/extent` for detailed extent information

### Important Dates

All date fields use **ISO 8601 date format** (YYYY-MM-DD).

- **enactmentDate** (string, optional) - When the Act received Royal Assent (primary legislation only)
  - Format: ISO 8601 date (YYYY-MM-DD)
  - Example: `"2020-01-22"`

- **madeDate** (string, optional) - When the instrument was made (secondary legislation only)
  - Format: ISO 8601 date (YYYY-MM-DD)
  - Example: `"2020-12-15"`

### In-Force Status

**Important:** These fields are only present in "revised" versions. If `status` is `"final"`, these fields will be `undefined`.

All date fields use **ISO 8601 date format** (YYYY-MM-DD).

- **startDate** (string, optional) - When legislation came into force
  - Format: ISO 8601 date (YYYY-MM-DD)
  - Example: `"2025-01-16"`
  - Extracted from `RestrictStartDate` attribute on root element
  - If absent in a "revised" version, legislation is not yet in force
  - See `clml://metadata/in-force` for complete guidance

- **endDate** (string, optional) - When legislation was repealed or ceased
  - Format: ISO 8601 date (YYYY-MM-DD)
  - Example: `"2023-12-31"`
  - Extracted from `RestrictEndDate` attribute on root element
  - Present only if legislation has been repealed

### Additional Metadata

- **isbn** (string, optional) - ISBN for published version
  - Example: `"9780105700203"`
  - Status: TODO - Not yet extracted

## Complete Example (Primary Legislation - Revised Version)

```json
{
  "id": "ukpga/2020/2",
  "type": "ukpga",
  "year": 2020,
  "number": 2,
  "title": "Direct Payments to Farmers (Legislative Continuity) Act 2020",
  "status": "revised",
  "extent": ["E", "W", "S", "NI"],
  "enactmentDate": "2020-01-30",
  "startDate": "2024-01-01"
}
```

## Complete Example (Secondary Legislation - Not In Force)

```json
{
  "id": "nisr/2026/1",
  "type": "nisr",
  "year": 2026,
  "number": 1,
  "title": "The Shellfish Gathering (Conservation) Regulations (Northern Ireland) 2026",
  "status": "revised",
  "extent": ["NI"],
  "madeDate": "2026-01-06"
}
```

Note: No `startDate` field means this legislation is not yet in force (prospective).

## Date Field Comparison

**Metadata vs Search:**
- Search results use a single **date** field (simplified for lists)
- Metadata uses separate **enactmentDate** and **madeDate** fields (precise legal terminology)

This reflects different use cases:
- Search: Scanning and sorting documents
- Metadata: Detailed information requiring legal precision

## Using with Other Tools

```javascript
// Search for legislation
search_legislation(title="Fire Safety")

// Get detailed metadata for a result
get_legislation_metadata(type="ukpga", year="2021", number="24")

// Get full document
get_legislation(type="ukpga", year="2021", number="24")
```

## Related Resources

- `json://search-response` - Search results format
- `clml://metadata/extent` - Understanding geographical extent
- `clml://metadata/in-force` - Understanding in-force status and version types
- `clml://schema-guide` - Full CLML XML structure
- `types://guide` - Legislation types reference
- `cookbook://check-extent` - Example workflow using metadata
