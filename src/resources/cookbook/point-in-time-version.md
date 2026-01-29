# Point‑in‑Time Retrieval (Versioning)

**Question:** "Show me this Act as it stood on a specific date."

This recipe shows how to retrieve historical versions of legislation using the `version` parameter. It works for Acts, SIs, and other legislation types that provide point‑in‑time versions.

## Prerequisites

You need the legislation's:
- **type** (e.g., "ukpga", "uksi")
- **year** (e.g., 2024)
- **number** (e.g., 1)

If you don't have these, start with `search_legislation` to find the document.

## Step 1: Identify the Document (Optional)

**Tool:** `search_legislation`

**Parameters:**
```json
{
  "title": "Sample Act Title"
}
```

**What to extract:** The `type`, `year`, and `number` fields.

**Resource:** See `json://search-response` for field details.

## Step 2: Retrieve the Original Version

Use a **version keyword** to get the original published version:

```json
{
  "type": "ukpga",
  "year": "2024",
  "number": "1",
  "version": "enacted"
}
```

**Version keywords:**
- `enacted` – Original version for UK primary legislation
- `made` – Original version for UK secondary legislation
- `created` – Original version for certain uncommon UK types
- `adopted` – Original version for EU legislation

**Result:** CLML XML (default) for the original published version.

## Step 3: Retrieve a Point‑in‑Time Version

Use a **date** to get the legislation as it stood on that date:

```json
{
  "type": "ukpga",
  "year": "2024",
  "number": "1",
  "version": "2024-10-18"
}
```

**Result:** CLML XML reflecting amendments and editorial updates as of that date.

## Worked Example: UKPGA 2024/1

This Act has multiple versions:

### 1) Original enacted version (as published)
```json
{
  "type": "ukpga",
  "year": "2024",
  "number": "1",
  "version": "enacted"
}
```

### 2) First revised version (same text, editorial metadata added)
```json
{
  "type": "ukpga",
  "year": "2024",
  "number": "1",
  "version": "2024-01-25"
}
```

### 3) Later revised version (incorporates amendments)
```json
{
  "type": "ukpga",
  "year": "2024",
  "number": "1",
  "version": "2024-10-18"
}
```

**Note:** The enacted version and the first revised version often have identical text. The revised version usually adds editorial metadata (such as extent or status attributes).

## Interpreting Versions

### When to use `enacted` / `made`
- You want the **original published text**
- You want the unedited version as issued by the publishing system

### When to use a date
- You want the legislation **as it stood** on that date
- You need changes after commencement or amendments

## Decision Logic (Pseudocode)

```
if you need the original published version:
  use version="enacted" (or "made" for SIs)

if you need a historical snapshot:
  use version="YYYY-MM-DD"

if you need the current version:
  omit the version parameter
```

## Notes and Limitations

- You can request **any date** and get the legislation as it stood on that day - you don't need to know when specific versions were created.
- Dates **before the first available version** return **an error**, which is indistinguishable from "document not found."
- Point‑in‑time versions only exist after editorial processing. Very recent legislation may return only the original version.
- To confirm which version you received, call `get_legislation_metadata` with the same version and check the `status` field (`final` vs `revised`).
- For human‑readable output, use `format: "html"` instead of CLML XML.

## Related Resources

- `clml://schema-guide` – CLML XML structure
- `json://metadata-response` – Metadata response format
- `types://guide` – Legislation type codes
