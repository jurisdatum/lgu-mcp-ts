# Checking In-Force Status

This recipe shows how to determine whether UK legislation is currently in force.

**Note:** This recipe currently covers document-level in-force status (entire Acts or SIs). Section-level queries (e.g., "Is section 3 in force?") will be supported in a future version.

## Prerequisites

You need to know the legislation's:
- **type** (e.g., "ukpga", "uksi")
- **year** (e.g., 2020)
- **number** (e.g., 2)

If you don't have these, start with `search_legislation` to find the document.

## Step 1: Get Metadata

Use `get_legislation_metadata` to retrieve structured metadata including in-force status:

```javascript
get_legislation_metadata(
  type: "ukpga",
  year: "2020",
  number: "2"
)
```

## Step 2: Check the Response

The response includes three key fields for in-force status:

### status Field

The `status` field tells you what kind of version you received:

- **"revised"** - Editorial version with in-force metadata available
- **"final"** - Original published version without in-force metadata

**If status is "final":** You cannot determine in-force status from the data. The document is likely very new and hasn't been processed by editors yet.

**If status is "revised":** Continue to check the in-force dates.

### startDate Field

If `status` is `"revised"`:

- **startDate present** (e.g., `"2024-01-01"`) - Legislation **is in force** since that date
- **startDate absent** (undefined/null) - Legislation **is not yet in force** (prospective)

### endDate Field

If `status` is `"revised"` and `endDate` is present:

- Legislation was **repealed** or ceased on that date
- If today's date is after `endDate`, the legislation is no longer in force

## Examples

### Example 1: In Force

```json
{
  "id": "ukpga/2020/2",
  "type": "ukpga",
  "year": 2020,
  "number": 2,
  "title": "Direct Payments to Farmers (Legislative Continuity) Act 2020",
  "status": "revised",
  "startDate": "2024-01-01"
}
```

**Answer:** ✅ **In force since 2024-01-01**

### Example 2: Not Yet In Force

```json
{
  "id": "nisr/2026/1",
  "type": "nisr",
  "year": 2026,
  "number": 1,
  "title": "The Shellfish Gathering (Conservation) Regulations (Northern Ireland) 2026",
  "status": "revised"
}
```

**Answer:** ❌ **Not yet in force** (no `startDate` field)

### Example 3: Repealed

```json
{
  "id": "ukpga/2000/1",
  "type": "ukpga",
  "year": 2000,
  "number": 1,
  "title": "Example Act 2000",
  "status": "revised",
  "startDate": "2000-06-01",
  "endDate": "2020-12-31"
}
```

**Answer:** ⚠️ **Was in force 2000-06-01 to 2020-12-31, now repealed**

### Example 4: Too New (No Editorial Version)

```json
{
  "id": "ukpga/2026/5",
  "type": "ukpga",
  "year": 2026,
  "number": 5,
  "title": "Very Recent Act 2026",
  "status": "final",
  "enactmentDate": "2026-01-20"
}
```

**Answer:** ❓ **Cannot determine** (no revised version available yet)

## Complete Workflow

Here's a complete workflow from search to in-force determination:

### 1. Find the Legislation

```javascript
search_legislation(title: "Fire Safety", year: "2021")
```

Response excerpt:
```json
{
  "documents": [
    {
      "id": "ukpga/2021/24",
      "type": "ukpga",
      "year": 2021,
      "number": 24,
      "title": "Fire Safety Act 2021"
    }
  ]
}
```

### 2. Get Metadata

```javascript
get_legislation_metadata(type: "ukpga", year: "2021", number: "24")
```

Response:
```json
{
  "id": "ukpga/2021/24",
  "type": "ukpga",
  "year": 2021,
  "number": 24,
  "title": "Fire Safety Act 2021",
  "status": "revised",
  "extent": ["E", "W"],
  "enactmentDate": "2021-04-29",
  "startDate": "2021-04-29"
}
```

### 3. Interpret the Result

- ✅ `status` is `"revised"` (in-force data available)
- ✅ `startDate` is present: `"2021-04-29"`
- ✅ No `endDate` (not repealed)

**Answer:** Fire Safety Act 2021 is **in force since 2021-04-29**

## Decision Logic

Here's the complete decision logic in pseudocode:

```
if status is "final":
  return "Cannot determine in-force status (no revised version available)"

if status is "revised":
  if startDate is absent:
    return "Not yet in force (prospective)"

  if endDate is present and endDate < today:
    return "No longer in force (repealed on {endDate})"

  if endDate is present and endDate >= today:
    return "In force since {startDate}, will be repealed on {endDate}"

  return "In force since {startDate}"
```

## Limitations

**Current Version:**
- ✅ Can determine if entire Act/SI is in force
- ✅ Can determine if entire Act/SI is not yet in force (prospective)
- ❌ Cannot determine if specific sections are in force
- ❌ Cannot handle partial commencement (different sections with different dates)

**Future Support:**
Section-level in-force checking will require fetching the full CLML XML document and parsing section-specific `RestrictStartDate` attributes.

## Related Resources

- `clml://metadata/in-force` - Understanding in-force status in CLML XML
- `json://metadata-response` - Metadata response format reference
- `types://guide` - Legislation type codes reference
