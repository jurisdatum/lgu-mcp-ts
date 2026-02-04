# Geographical Extent in CLML

Understanding the `restrictExtent` attribute in UK legislation XML.

## Overview

The `restrictExtent` attribute indicates the geographical extent of legislation - which parts of the UK (England, Wales, Scotland, Northern Ireland) a particular piece of legislation applies to.

## Format Cross-Reference

Extent is represented differently in CLML XML vs JSON responses:

| CLML RestrictExtent | JSON extent array | Meaning |
|---------------------|-------------------|---------|
| `E+W` | `["E", "W"]` | England and Wales |
| `E+W+S` | `["E", "W", "S"]` | Great Britain |
| `E+W+S+N.I.` | `["E", "W", "S", "NI"]` | United Kingdom (all) |
| `E` | `["E"]` | England only |
| `W` | `["W"]` | Wales only |
| `S` | `["S"]` | Scotland only |
| `N.I.` | `["NI"]` | Northern Ireland only |

**Note:** CLML uses `N.I.` (with period) but JSON normalizes to `NI` (no period).

## Common Values

The `restrictExtent` attribute uses jurisdiction codes:

- `E+W` - England and Wales
- `E+W+S` - England, Wales, and Scotland (Great Britain)
- `E+W+S+N.I.` - England, Wales, Scotland, and Northern Ireland (United Kingdom)
- `S` - Scotland only
- `N.I.` - Northern Ireland only
- `E` - England only
- `W` - Wales only

## Where It Appears

The `restrictExtent` attribute can appear on:

1. **Top-level legislation** (`<Legislation>` element)
   - Indicates the overall extent of the Act or SI

2. **Sections** (`<P1>`, `<P2>`, etc.)
   - Individual provisions may have different extents
   - A section may apply to England & Wales but not Scotland

3. **Subsections and paragraphs**
   - Granular extent can vary within sections

## Example

```xml
<Legislation
  xsi:schemaLocation="http://www.legislation.gov.uk/namespaces/legislation ..."
  SchemaVersion="1.0"
  RestrictExtent="E+W+S">

  <Primary>
    <PrimaryPrelims>
      <Title>Theft Act 1968</Title>
    </PrimaryPrelims>

    <Body>
      <!-- This section applies to all of Great Britain -->
      <P1group RestrictExtent="E+W+S">
        <Title>Basic definition of theft</Title>
        <P1 id="section-1">
          <Pnumber>1</Pnumber>
          <P1para>
            <Text>A person is guilty of theft if he dishonestly appropriates...</Text>
          </P1para>
        </P1>
      </P1group>

      <!-- This section only applies to England and Wales -->
      <P1group RestrictExtent="E+W">
        <Title>Special provisions for Wales</Title>
        <P1 id="section-42">
          <Pnumber>42</Pnumber>
          <P1para>
            <Text>This section applies only in England and Wales...</Text>
          </P1para>
        </P1>
      </P1group>
    </Body>
  </Primary>
</Legislation>
```

## Why It Matters

Understanding extent is crucial when:

1. **Determining applicability** - Which jurisdictions does a law apply to?
2. **Legal research** - Finding England-only vs. UK-wide provisions
3. **Devolution analysis** - Understanding the effect of devolved powers
4. **Territorial boundaries** - Identifying cross-border issues

## Practical Usage

When parsing CLML, check the `RestrictExtent` attribute to:

1. Filter legislation by jurisdiction
2. Display extent information to users
3. Handle territorial variations in law
4. Build jurisdiction-specific legal databases

## Related Attributes

- `RestrictStartDate` - When a provision comes into force
- `RestrictEndDate` - When a provision is repealed
- `Status` - Current legal status (e.g., "Prospective", "Repealed")

These attributes often work together to define the full applicability of a provision across both geography and time.
