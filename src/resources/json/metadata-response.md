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

### Geographical Extent

- **extent** (array of strings, optional) - Jurisdictions where legislation applies
  - Values: `"E"` (England), `"W"` (Wales), `"S"` (Scotland), `"NI"` (Northern Ireland)
  - Example: `["E", "W"]` (England and Wales only)
  - Example: `["E", "W", "S", "NI"]` (United Kingdom-wide)
  - Note: Normalized from `N.I.` to `NI` for consistency
  - See `clml://metadata/extent` for detailed extent information

### Important Dates

- **enactmentDate** (string, optional) - When the Act received Royal Assent (primary legislation only)
  - Format: YYYY-MM-DD
  - Example: `"2020-01-22"`

- **madeDate** (string, optional) - When the instrument was made (secondary legislation only)
  - Format: YYYY-MM-DD
  - Example: `"2020-12-15"`

- **laidDate** (string, optional) - When laid before Parliament (secondary legislation)
  - Format: YYYY-MM-DD
  - Status: TODO - Not yet extracted

- **comingIntoForceDates** (array of strings, optional) - When provisions came/come into force
  - Format: Array of YYYY-MM-DD dates
  - Example: `["2020-02-01", "2020-04-01"]`
  - Status: TODO - Not yet extracted
  - Note: Legislation can have multiple commencement dates for different provisions

### Additional Metadata

- **isbn** (string, optional) - ISBN for published version
  - Example: `"9780105700203"`
  - Status: TODO - Not yet extracted

## Complete Example (Primary Legislation)

```json
{
  "id": "ukpga/2020/2",
  "type": "ukpga",
  "year": 2020,
  "number": 2,
  "title": "Direct Payments to Farmers (Legislative Continuity) Act 2020",
  "extent": ["E", "W", "S", "NI"],
  "enactmentDate": "2020-01-22"
}
```

## Complete Example (Secondary Legislation)

```json
{
  "id": "uksi/2020/1234",
  "type": "uksi",
  "year": 2020,
  "number": 1234,
  "title": "The Example Regulations 2020",
  "extent": ["E", "W"],
  "madeDate": "2020-12-15"
}
```

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
- `clml://schema-guide` - Full CLML XML structure
- `types://guide` - Legislation types reference
- `cookbook://check-extent` - Example workflow using metadata
