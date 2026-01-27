# CLML Schema Guide

CLML (Crown Legislation Markup Language) is the XML format used by legislation.gov.uk to represent UK legislation.

**Full Schema**: https://www.legislation.gov.uk/schema/legislation.xsd

## Basic Document Structure

```xml
<Legislation xmlns="http://www.legislation.gov.uk/namespaces/legislation">
  <ukm:Metadata xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata">
    <!-- Document metadata: title, dates, status, etc. -->
  </ukm:Metadata>

  <Primary>
    <PrimaryPrelims>
      <!-- Title, long title, enactment date -->
    </PrimaryPrelims>

    <Body>
      <!-- Main legislative content -->
    </Body>

    <Schedules>
      <!-- Schedules (if any) -->
    </Schedules>
  </Primary>
</Legislation>
```

## Key Elements

### Metadata
- `<ukm:Metadata>` - Document metadata wrapper
- `<dc:title>` - Short title (e.g., "Theft Act 1968")
- `<ukm:DocumentMainType Value="..."/>` - Document type (e.g., "UnitedKingdomPublicGeneralAct")
- `<ukm:Year Value="..."/>` - Year of the legislation
- `<ukm:Number Value="..."/>` - Chapter/instrument number
- `<ukm:EnactmentDate Date="..."/>` - Date of enactment (primary legislation)
- `<ukm:MadeDate Date="..."/>` - Date made (secondary legislation)
- `<ukm:ISBN Value="..."/>` - ISBN identifier

### Important Attributes

**`RestrictExtent`** - Geographical extent (which UK jurisdictions the legislation applies to)
- Can appear on `<Legislation>`, `<P1>`, `<P2>`, and other structural elements
- Common values: `E+W`, `E+W+S`, `E+W+S+N.I.`, `S`, `N.I.`, etc.
- **For detailed information about geographical extent, see: `clml://metadata/extent`**

### Sections and Provisions
- `<P1>` - Top-level provision (usually a section)
- `<Pnumber>` - Section/provision number (e.g., "1", "2A")
- `<P1para>` - Section content wrapper
- `<P2>` - Second-level provision (usually subsection)
- `<P2para>` - Subsection content
- `<P3>`, `<P4>`, etc. - Further nested levels

### Text Content
- `<Text>` - Main text content within provisions
- `<Title>` - Section headings/titles
- `<Number>` - Alternative number representation

### Structural Elements
- `<Part>` - Major division of an Act
- `<Chapter>` - Subdivision within a Part
- `<Pblock>` - Group of related provisions
- `<Schedule>` - Appendix to the main Act

## Finding Section Numbers and Headings

**Section Number**: Look for `<Pnumber>` inside `<P1>`:
```xml
<P1 id="section-1">
  <Pnumber>1</Pnumber>
  <P1para>
    <Title>Basic definition of theft</Title>
    <Text>A person is guilty of theft if...</Text>
  </P1para>
</P1>
```

**Section Heading**: Usually in `<Title>` element within the provision

**Section Text**: Within `<Text>` elements, may be nested at multiple levels

## Common Patterns

### Simple Section
```xml
<P1>
  <Pnumber>5</Pnumber>
  <P1para>
    <Text>The main section text here.</Text>
  </P1para>
</P1>
```

### Section with Subsections
```xml
<P1>
  <Pnumber>10</Pnumber>
  <P1para>
    <Text>Introductory text.</Text>
    <P2>
      <Pnumber>1</Pnumber>
      <P2para><Text>First subsection.</Text></P2para>
    </P2>
    <P2>
      <Pnumber>2</Pnumber>
      <P2para><Text>Second subsection.</Text></P2para>
    </P2>
  </P1para>
</P1>
```

### Part Headers
```xml
<Part>
  <Number>Part 1</Number>
  <Title>Preliminary</Title>
  <P1>
    <!-- Sections within the part -->
  </P1>
</Part>
```

## Tips for Parsing

1. **Find sections**: Search for `<P1>` elements
2. **Get section number**: Look at `<Pnumber>` child of `<P1>`
3. **Get section title**: Look for `<Title>` within `<P1para>`
4. **Get section text**: Collect all `<Text>` elements within the section
5. **Handle subsections**: Look for `<P2>`, `<P3>` etc. nested within
6. **Navigate structure**: Use Part/Chapter elements for document organization

This is a simplified guide focusing on the most common elements. The full CLML schema supports many additional features for complex legislative structures, amendments, commentary, and metadata.
