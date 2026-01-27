# Check Geographical Extent

**Question:** "Does the Fire Safety Act 2021 apply to Scotland?"

This recipe shows how to determine which UK jurisdictions a piece of legislation applies to.

## Two Approaches

There are two ways to check geographical extent:

**Approach A: Using Metadata Tool (Easy, Recommended)**
- Use `get_legislation_metadata` to get structured JSON
- Check the `extent` array directly
- Fast and simple for common questions

**Approach B: Using Full Document (Detailed)**
- Use `get_legislation` to get full CLML XML
- Parse the `RestrictExtent` attribute
- Better when you need full document context

---

## Approach A: Using Metadata Tool (Recommended)

### 1. Search for the legislation

**Tool:** `search_legislation`

**Parameters:**
```json
{
  "title": "Fire Safety Act 2021"
}
```

**Result:** Clean JSON with array of matching documents:
```json
{
  "documents": [
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

**What to extract:** The `type`, `year`, and `number` fields (or parse them from `id`).

**Resource:** See `json://search-response` for complete field documentation.

### 2. Get structured metadata

**Tool:** `get_legislation_metadata`

**Parameters:**
```json
{
  "type": "ukpga",
  "year": "2021",
  "number": "24"
}
```

**Result:** Clean JSON with extent already parsed:
```json
{
  "id": "ukpga/2021/24",
  "type": "ukpga",
  "year": 2021,
  "number": 24,
  "title": "Fire Safety Act 2021",
  "extent": ["E", "W"],
  "enactmentDate": "2021-04-29"
}
```

**Resource:** See `json://metadata-response` for complete field documentation.

### 3. Check the extent array

Simply check if "S" (Scotland) is in the array:
- `["E", "W"]` does NOT include "S"
- Therefore: Does not apply to Scotland

**Answer:** "No, the Fire Safety Act 2021 does not apply to Scotland. It only applies to England and Wales (extent: E+W)."

---

## Approach B: Using Full Document

### 1. Search for the legislation (same as Approach A)

**Tool:** `search_legislation`

**Parameters:**
```json
{
  "title": "Fire Safety Act 2021"
}
```

**Result:** JSON array of documents (or use `format="xml"` for Atom feed)

Extract `type`, `year`, and `number` from the first matching document.

**Resource:** See `json://search-response` for JSON format or `atom://feed-guide` for XML.

### 2. Retrieve the full document

**Tool:** `get_legislation`

**Parameters:**
```json
{
  "type": "ukpga",
  "year": "2021",
  "number": "24",
  "format": "xml"
}
```

**Result:** CLML XML document containing the full legislation with metadata and content.

**Resource:** See `clml://schema-guide` for CLML structure.

### 3. Parse the RestrictExtent attribute

**Location:** Look for the `RestrictExtent` attribute on the root `<Legislation>` element:

```xml
<Legislation RestrictExtent="E+W" ...>
  ...
</Legislation>
```

**Common patterns:**
- `RestrictExtent` on `<Legislation>` = overall extent
- `RestrictExtent` on `<P1>`, `<P2>`, etc. = section-level extent (may differ)

**Resource:** See `clml://schema-guide` for CLML structure.

### 4. Interpret the extent code and formulate answer

**Extent code from XML:** `E+W`

**Meaning:** England and Wales only

**Common codes:**
- `E+W` = England and Wales
- `E+W+S` = England, Wales, and Scotland (Great Britain)
- `E+W+S+N.I.` = England, Wales, Scotland, and Northern Ireland (United Kingdom)
- `S` = Scotland only
- `N.I.` = Northern Ireland only

**Resource:** See `clml://metadata/extent` for comprehensive guide to extent codes.

**Analysis:**
- Legislation has extent: `E+W`
- Question asks about: Scotland
- Scotland is not included in `E+W`

**Answer:**
"No, the Fire Safety Act 2021 does not apply to Scotland. It only applies to England and Wales (extent: E+W)."

## Important Notes

### Section-Level Extent

Some legislation has mixed extent - the overall Act may apply UK-wide, but individual sections may have different extents:

```xml
<Legislation RestrictExtent="E+W+S+N.I.">
  ...
  <P1 RestrictExtent="E+W">
    <!-- This section only applies to England and Wales -->
  </P1>
  <P1 RestrictExtent="S">
    <!-- This section only applies to Scotland -->
  </P1>
</Legislation>
```

If you're asked about a specific section, check both:
1. The section's own `RestrictExtent` attribute
2. The document-level extent (as fallback if section has no attribute)

### Welsh Language Legislation

Welsh legislation (type `asc` or `anaw`) may have extent codes specific to Wales:
- `W` = Wales only
- `E+W` = England and Wales

### Historical Changes

Extent can change over time due to:
- Devolution of powers
- Amendments
- Repeals

Use the `version` parameter in `get_legislation` to check historical extent:

```json
{
  "type": "ukpga",
  "year": "2021",
  "number": "24",
  "version": "2022-01-01"
}
```

## Related Recipes

- `cookbook://find-by-title` - How to search for legislation by title
- `cookbook://point-in-time` - How to retrieve historical versions
- `cookbook://find-specific-section` - How to check extent of specific provisions

## Example Queries This Recipe Answers

- "Does [Act name] apply to Scotland?"
- "Is [Act name] UK-wide or just England and Wales?"
- "What's the geographical extent of [Act name]?"
- "Which jurisdictions does [Act name] cover?"
- "Does [Act name] apply in Northern Ireland?"
