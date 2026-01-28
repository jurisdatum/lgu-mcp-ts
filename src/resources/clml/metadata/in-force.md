# Determining In-Force Status from CLML

## Overview

UK legislation can be "in force" (legally effective) or "not in force" (enacted but not yet effective). The CLML XML format indicates in-force status through specific attributes and metadata fields.

**Key Concept:** Only **revised** versions of legislation contain in-force metadata. The original **enacted/made** versions do not include this information.

## Version Types

### Understanding DocumentStatus Values

The `<ukm:DocumentStatus>` element can have four possible values:

- **`draft`** - Draft legislation before enactment/making
- **`final`** - The original XML from the publishing system, before editorial processing
- **`revised`** - Any version edited by the editorial system (including the "first revised version")
- **`proposed`** - Proposed legislation

**Important:** The value `"final"` is somewhat misleadingly named. It does **not** mean "the final version" of the legislation. Rather, it means the original enacted/made version as it came from the publishing system, before any editorial work was done by the Statute Law Database team.

### Final Version (No In-Force Metadata)

The first published version of legislation after enactment or making, before editorial processing:

```xml
<ukm:PrimaryMetadata>
  <ukm:DocumentClassification>
    <ukm:DocumentStatus Value="final"/>
  </ukm:DocumentClassification>
</ukm:PrimaryMetadata>
```

**Characteristics:**
- `DocumentStatus` is `"final"`
- No `RestrictStartDate`, `RestrictEndDate`, or `RestrictExtent` attributes
- No section-level commencement dates
- Publisher: "King's Printer of Acts of Parliament" (not "Statute Law Database")

**When you get this version:**
- You explicitly requested `/enacted` or `/made` in the URL
- The API redirected to `/enacted` or `/made` when you requested the current version (indicating no revised version exists yet)
- Identified by checking `<dc:publisher>` or `DocumentStatus`

**Important:** If you get a "final" version (either by redirect or explicit request), you **cannot determine in-force status** from the XML. Only revised versions contain in-force metadata.

### Revised Version (Contains In-Force Metadata)

Any version processed by the editorial system, which includes both the "first revised version" and subsequent updates incorporating amendments:

```xml
<Legislation RestrictStartDate="2025-01-16">
  <ukm:Metadata>
    <ukm:PrimaryMetadata>
      <ukm:DocumentClassification>
        <ukm:DocumentStatus Value="revised"/>
      </ukm:DocumentClassification>
    </ukm:PrimaryMetadata>
  </ukm:Metadata>
</Legislation>
```

**Characteristics:**
- `DocumentStatus` is `"revised"`
- Has `RestrictStartDate`, `RestrictEndDate`, and/or `RestrictExtent` attributes
- Publisher: "Statute Law Database"
- May contain section-level commencement information
- May incorporate amendments and updates

**The "First Revised Version":**

The very first revised version is typically just the "final" (enacted/made) version with the `Restrict*` attributes added by editors. It usually has the same text content as the final version, but now includes:
- `RestrictStartDate` - when it came into force
- `RestrictEndDate` - when/if it was repealed
- `RestrictExtent` - geographical extent (E, W, S, NI)

Subsequent revised versions may incorporate amendments, corrections, and other editorial changes.

## Document-Level In-Force Status

Check the root `<Legislation>` element:

### In Force

```xml
<Legislation RestrictStartDate="2025-01-16" RestrictExtent="E+W+S+N.I.">
```

**Meaning:** The legislation came into force on 2025-01-16.

### Not Yet In Force

```xml
<Legislation Status="Prospective" RestrictExtent="N.I.">
```

**Meaning:** The legislation has been made but is not yet in force.
- No `RestrictStartDate` attribute
- May have `Status="Prospective"` attribute

### Repealed/Ceased

```xml
<Legislation RestrictStartDate="2010-01-01" RestrictEndDate="2020-12-31">
```

**Meaning:** The legislation was in force from 2010-01-01 to 2020-12-31 and is now repealed.

## Section-Level In-Force Status

Individual sections (or other divisions) may come into force at different times.

### Example: Different Commencement Dates

```xml
<Body RestrictStartDate="2021-04-29">
  <P1group RestrictStartDate="2022-05-16">
    <Title>Main provisions</Title>
    <P1 id="section-1">
      <Pnumber>1</Pnumber>
      <!-- Section 1 came into force on 2022-05-16 -->
    </P1>
  </P1group>

  <P1group RestrictStartDate="2021-06-29">
    <Title>Power provisions</Title>
    <P1 id="section-2">
      <Pnumber>2</Pnumber>
      <!-- Section 2 came into force earlier on 2021-06-29 -->
    </P1>
  </P1group>
</Body>
```

**Finding section-level dates:**
1. Locate the section's `<P1group>` wrapper element
2. Check for `RestrictStartDate` attribute
3. If missing, check parent elements (may inherit from Body or root)

## Workflow: Determining In-Force Status

### Step 1: Fetch the Current Version

Request the legislation **without** specifying a version:

```
GET /ukpga/2025/1/data.xml
```

**What You'll Get:**

When you request the current version without specifying a version parameter, the API will return:

1. **A revised version** (if available) - Contains in-force metadata
2. **A redirect to `/enacted` or `/made`** - Only the original "final" version exists (no in-force metadata)

**Important:** If you're using MCP tools (`get_legislation` or `get_legislation_metadata`), redirects are followed automatically and you won't see the HTTP status codes. Instead, check the `status` field in the returned data (Step 2) to determine what version you received.

**Version Keywords:**

You can explicitly request specific versions:
- `enacted` - Original version for UK primary legislation (status="final")
- `made` - Original version for UK secondary legislation (status="final")
- `created` - Original version for uncommon UK types like Church Instruments (status="final")
- `adopted` - Original version for EU legislation (status="final")
- `YYYY-MM-DD` - Point-in-time version as it stood on a specific date

### Step 2: Check Document Status (Most Important Step)

Look at `<ukm:DocumentStatus>`:

- **If `Value="final"`:** You have the original published version before editorial processing. In-force information is **not available** in this XML.
- **If `Value="revised"`:** The document has been processed by the editorial system. Continue to Step 3.
- **If `Value="draft"` or `Value="proposed"`:** Pre-enactment versions (rare in the published dataset).

Alternative check: Look at `<dc:publisher>`:
- "King's Printer of Acts of Parliament" → final (original) version
- "Statute Law Database" → revised version

### Step 3: Check Root Element

For document-level status, examine the root `<Legislation>` element:

```xml
<Legislation RestrictStartDate="YYYY-MM-DD" RestrictEndDate="YYYY-MM-DD">
```

- **Has `RestrictStartDate`:** In force since that date
- **No `RestrictStartDate`:** Not in force (check for `Status="Prospective"`)
- **Has `RestrictEndDate`:** Repealed/ceased on that date

### Step 4: Check Section-Level (Optional)

To determine if a specific section is in force:

1. Find the section's `<P1group>` wrapper
2. Check its `RestrictStartDate` attribute
3. If absent, the section inherits the document-level date

## Real Examples

### Example 1: Fully In Force

**UKPGA 2025/1** - Lords Spiritual (Women) Act 2015 (Extension) Act 2025

```xml
<Legislation RestrictStartDate="2025-01-16">
  <ukm:PrimaryMetadata>
    <ukm:DocumentStatus Value="revised"/>
  </ukm:PrimaryMetadata>
</Legislation>
```

**Status:** In force since 2025-01-16

### Example 2: Not Yet In Force

**NISR 2026/1** - Shellfish Gathering Regulations

```xml
<Legislation Status="Prospective" RestrictExtent="N.I.">
  <ukm:SecondaryMetadata>
    <ukm:DocumentStatus Value="revised"/>
    <ukm:ComingIntoForce>
      <ukm:DateTime Date="2026-02-06"/>
    </ukm:ComingIntoForce>
  </ukm:SecondaryMetadata>
</Legislation>
```

**Status:** Not yet in force (will come into force on 2026-02-06)
**Note:** Future commencement date is in `<ukm:ComingIntoForce>`, not `RestrictStartDate`

### Example 3: Partial Commencement

**UKPGA 2021/24** - Fire Safety Act 2021

```xml
<Legislation RestrictStartDate="2021-04-29">
  <Body RestrictStartDate="2022-05-16">
    <P1group RestrictStartDate="2022-05-16">
      <!-- Section 1: in force 2022-05-16 -->
    </P1group>
    <P1group RestrictStartDate="2021-06-29">
      <!-- Section 2: in force 2021-06-29 -->
    </P1group>
  </Body>
</Legislation>
```

**Status:** Different sections came into force on different dates

## Additional Metadata

### ComingIntoForce Element

Secondary legislation often includes explicit commencement information:

```xml
<ukm:ComingIntoForce>
  <ukm:DateTime Date="2026-02-06"/>
</ukm:ComingIntoForce>
```

**Important:** This indicates the **intended** commencement date, but the actual in-force status is determined by the `RestrictStartDate` attribute.

### UnappliedEffects

The metadata may include `<ukm:UnappliedEffects>` describing future commencement:

```xml
<ukm:UnappliedEffect Type="coming into force" ...>
  <ukm:InForceDates>
    <ukm:InForce Applied="false" Date="2026-02-06"
                  Qualification="wholly in force"/>
  </ukm:InForceDates>
</ukm:UnappliedEffect>
```

**Meaning:** Editorial annotation about future commencement. The `Applied="false"` indicates this effect hasn't yet been applied to the XML structure.

## Common Pitfalls

1. **Not checking the `DocumentStatus` field:** Always check `<ukm:DocumentStatus Value="...">` before looking for in-force attributes:
   - `"final"` = original version, no in-force metadata
   - `"revised"` = editorial version, in-force metadata should be present
   - If using MCP tools, check the `status` field in the returned metadata

2. **Requesting the `/enacted` or `/made` version explicitly:** Always fetch the current version (no version suffix) first. The original published versions have `DocumentStatus="final"` and lack `Restrict*` attributes.

3. **Misunderstanding "final":** The `DocumentStatus="final"` value doesn't mean "the final/latest version" - it means "the original version before editorial processing." For in-force data, you need `DocumentStatus="revised"`.

4. **Ignoring document status:** Always check `DocumentStatus` before looking for in-force attributes. A `"final"` document won't have them.

5. **Missing section-level differences:** Some provisions may have different commencement dates than the Act as a whole. Always check section-level `RestrictStartDate` attributes.

6. **Confusing ComingIntoForce with RestrictStartDate:**
   - `<ukm:ComingIntoForce>` = planned/intended commencement date
   - `RestrictStartDate` attribute = actual in-force date (authoritative)

## Summary

| Scenario | Indicators | Status |
|----------|-----------|--------|
| Original published version | `DocumentStatus="final"` | Cannot determine in-force status from XML |
| Draft/proposed legislation | `DocumentStatus="draft"` or `"proposed"` | Pre-enactment |
| Revised, in force | `DocumentStatus="revised"` + `RestrictStartDate` present | In force since that date |
| Revised, not in force | `DocumentStatus="revised"` + no `RestrictStartDate` | Not yet in force (may have `Status="Prospective"`) |
| Repealed | `RestrictEndDate` present | Ceased on that date |
| Partial commencement | Section-level `RestrictStartDate` varies | Check each section individually |

## See Also

- `clml://metadata/extent` - Understanding geographical extent
- `clml://schema-guide` - CLML XML structure overview
