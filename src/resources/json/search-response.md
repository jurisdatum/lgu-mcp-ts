# Search Response Format

**Experimental JSON format** for `search_legislation` tool responses.

This is the default response format when using the search tool. Set `format="xml"` to get the raw Atom feed instead.

## SearchResponse Envelope

```json
{
  "documents": [...]
}
```

### Fields

- **documents** (array) - Array of search results

## SearchResult

Each document in the results array has these fields:

### Core Identification

- **id** (string) - Simplified document identifier
  - Format: `{type}/{year}/{number}`
  - Example: `"ukpga/2026/3"`
  - Note: Strips `http(s)://www.legislation.gov.uk/` and `/id/` prefixes for cleaner JSON

- **type** (string) - Legislation type code
  - Example: `"ukpga"`
  - Use this with `get_legislation` tool
  - See `types://guide` for complete list of type codes

- **year** (number) - Year of enactment or making
  - Example: `2026`
  - Extracted from `<ukm:Year>` element

- **number** (number) - Legislation number
  - Example: `3`
  - Extracted from `<ukm:Number>` element

- **title** (string) - Human-readable title
  - Example: `"Holocaust Memorial Act 2026"`

### Date Information

- **date** (string, optional) - Creation date in ISO 8601 date format (YYYY-MM-DD)
  - For primary legislation: enactment date
  - For secondary legislation: made date
  - Example: `"2026-01-22"`
  - Note: Simplified single date field (see `json://metadata-response` for separate enactment/made dates)

## Complete Example

```json
{
  "documents": [
    {
      "id": "ukpga/2026/3",
      "type": "ukpga",
      "year": 2026,
      "number": 3,
      "title": "Holocaust Memorial Act 2026",
      "date": "2026-01-22"
    },
    {
      "id": "ukpga/2021/24",
      "type": "ukpga",
      "year": 2021,
      "number": 24,
      "title": "Fire Safety Act 2021",
      "date": "2021-04-29"
    }
  ]
}
```

## Using Search Results

To retrieve the full document for a search result:

```javascript
// From search result
{
  "id": "ukpga/2026/3",
  "type": "ukpga",
  "year": 2026,
  "number": 3
}

// Use with get_legislation (converts to strings)
get_legislation(type="ukpga", year="2026", number="3")
```

## Future Enhancements

Pagination metadata may be added in a future version:

```json
{
  "meta": {
    "itemsPerPage": 20,
    "startIndex": 1,
    "page": 1,
    "morePages": 12
  },
  "documents": [...]
}
```

## Related Resources

- `atom://feed-guide` - Raw Atom XML format (when using `format="xml"`)
- `json://metadata-response` - Detailed metadata format
- `types://guide` - Legislation types reference
- `cookbook://check-extent` - Example workflows using search
