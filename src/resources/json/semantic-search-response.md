# Semantic Search Response Format

Response format for `search_legislation_semantic` tool.

## Overview

The semantic search tool returns legislation ranked by semantic relevance to your query, with the best-matching sections identified by their similarity scores.

## Response Structure

```typescript
{
  results: MappedLegislationActResult[];
  total: number;
  offset: number;
  limit: number;
}
```

## MappedLegislationActResult Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | Normalized legislation identifier | `"ukpga/2018/12"` |
| `title` | string | Full legislation title | `"Data Protection Act 2018"` |
| `type` | string (optional) | Legislation type code | `"ukpga"` |
| `year` | number (optional) | Year of enactment | `2018` |
| `number` | number (optional) | Legislation number | `12` |
| `enactmentDate` | string (optional) | When enacted (primary legislation only, ISO 8601) | `"2018-05-23"` |
| `modifiedDate` | string (optional) | Last modification date (ISO 8601) | `"2023-10-26"` |
| `description` | string (optional) | Brief description | `"An Act to make provision..."` |
| `publisher` | string (optional) | Publishing authority | `"Queen's Printer of Acts of Parliament"` |
| `status` | string (optional) | Legislative status | `"final"` |
| `extent` | string[] (optional) | Geographical extent codes | `["E", "W", "S", "NI"]` |
| `sections` | SectionMatch[] (optional) | Best-matching sections | See below |

### SectionMatch Object

Each section match contains:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `number` | string | Section identifier | `"1"`, `"2A"`, `"Schedule 1"` |
| `provisionType` | string | Type of provision | `"section"`, `"regulation"`, `"article"` |
| `score` | number | Semantic similarity score (0.0-1.0) | `0.87` (higher = more relevant) |

**Important:** The `sections` array contains only section *identifiers* with scores, not the actual text. To retrieve section text, use `search_legislation_sections_semantic` or `get_legislation`.

## Extent Codes

The `extent` field uses normalized jurisdiction codes:

| Code | Meaning |
|------|---------|
| `E` | England |
| `W` | Wales |
| `S` | Scotland |
| `NI` | Northern Ireland |

Example: `["E", "W"]` means England and Wales only.

## Complete Example

```json
{
  "results": [
    {
      "id": "ukpga/2018/12",
      "type": "ukpga",
      "year": 2018,
      "number": 12,
      "title": "Data Protection Act 2018",
      "description": "An Act to make provision for the regulation of the processing of information relating to individuals; to make provision in connection with the Information Commissioner's functions under certain regulations relating to information; to make provision for a direct marketing code of conduct; and for connected purposes.",
      "publisher": "Queen's Printer of Acts of Parliament",
      "status": "final",
      "extent": ["E", "W", "S", "NI"],
      "enactmentDate": "2018-05-23",
      "modifiedDate": "2023-10-26",
      "sections": [
        {
          "number": "1",
          "provisionType": "section",
          "score": 0.92
        },
        {
          "number": "2",
          "provisionType": "section",
          "score": 0.89
        },
        {
          "number": "3",
          "provisionType": "section",
          "score": 0.85
        }
      ]
    }
  ],
  "total": 1,
  "offset": 0,
  "limit": 10
}
```

## Pagination Fields

| Field | Description |
|-------|-------------|
| `total` | Total number of matching results |
| `offset` | Starting position in result set (for pagination) |
| `limit` | Maximum results returned in this response |

## Important Notes

1. **Data Freshness**: Results come from a pre-computed vector index that may be days or weeks behind live legislation.gov.uk data. Always verify critical results using `search_legislation`.

2. **Secondary Legislation Dates**: `enactmentDate` is only populated for primary legislation. Secondary legislation uses different date fields (madeDate, etc.) which are not included in semantic search results.

3. **Section Text**: This response does NOT include actual section text. Use `search_legislation_sections_semantic` or `get_legislation` to retrieve full text.

4. **Score Interpretation**: Scores are semantic similarity measures (0.0-1.0). Higher scores indicate better conceptual matches to your query. There's no fixed threshold for "relevant" - it depends on your use case.

5. **Missing Fields**: Optional fields may be absent if not available in the source data. Always check for field existence before using.

## Related Resources

- **`json://semantic-section-response`** - Format for section-level semantic search results
- **`json://metadata-response`** - Format for get_legislation_metadata results
- **`json://search-response`** - Format for standard search_legislation results
