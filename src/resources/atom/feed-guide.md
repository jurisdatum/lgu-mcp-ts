# Atom Feed Guide for legislation.gov.uk

The search results from legislation.gov.uk are returned in **Atom feed format** (XML), which is a standard syndication format with custom extensions for legislative metadata.

## Namespace

Custom elements use the `ukm:` prefix with namespace URI:
```
http://www.legislation.gov.uk/namespaces/metadata
```

## Feed Structure

```xml
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata">
  <title>Search Results</title>
  <id>...</id>
  <updated>...</updated>

  <entry>
    <!-- Each search result is an <entry> -->
  </entry>

  <entry>
    <!-- Another result -->
  </entry>
</feed>
```

## Entry Elements (Each Search Result)

### Standard Atom Elements

- **`<id>`** - Unique identifier URI for the legislation
  - Example: `http://www.legislation.gov.uk/id/ukpga/2023/34`
  - Format: `http://www.legislation.gov.uk/id/{type}/{year}/{number}`

- **`<title>`** - Full title of the legislation
  - Example: `Equipment Theft (Prevention) Act 2023`

- **`<updated>`** - Last updated timestamp
  - Example: `2024-01-20T00:10:00Z`

- **`<published>`** - Publication timestamp
  - Example: `2023-07-24T16:31:35.297516Z`

- **`<summary>`** - Brief description of the legislation's purpose
  - Example: `An Act to make provision to prevent the theft and re-sale of equipment...`

### Link Elements

Multiple `<link>` elements provide different representations and related resources:

**Primary Link** (no rel attribute):
```xml
<link href="http://www.legislation.gov.uk/ukpga/2023/34/2024-01-20"/>
```
This is the current version URL with point-in-time date.

**Self Link**:
```xml
<link rel="self" href="http://www.legislation.gov.uk/id/ukpga/2023/34"/>
```
Canonical identifier for this legislation.

**Data Format Links** (rel="alternate"):
- `application/xml` - CLML XML format (`.../data.xml`)
- `application/akn+xml` - Akoma Ntoso XML (`.../data.akn`)
- `application/xhtml+xml` - HTML snippet (`.../data.xht`)
- `application/akn+xhtml` - HTML5 full page (`.../data.html`)
- `text/html` - Website default view (`.../data.htm`)
- `application/rdf+xml` - RDF/XML linked data (`.../data.rdf`)
- `text/csv` - CSV export (`.../data.csv`)
- `application/pdf` - PDF version (`.../data.pdf`)

**Table of Contents Link**:
```xml
<link rel="http://purl.org/dc/terms/tableOfContents"
      type="application/xml"
      href="http://www.legislation.gov.uk/ukpga/2023/34/contents"/>
```

### Custom Metadata Elements (ukm: namespace)

These elements provide structured metadata about the legislation:

- **`<ukm:DocumentMainType Value="..."/>`** - Type of legislation
  - `UnitedKingdomPublicGeneralAct` - UK Public General Act (ukpga)
  - `UnitedKingdomStatutoryInstrument` - UK Statutory Instrument (uksi)
  - `UnitedKingdomLocalAct` - UK Local Act (ukla)
  - `ScottishAct` - Act of Scottish Parliament (asp)
  - And many others...

- **`<ukm:Year Value="2023"/>`** - Year of enactment

- **`<ukm:Number Value="34"/>`** - Legislation number

- **`<ukm:ISBN Value="..."/>`** - ISBN if available

- **`<ukm:CreationDate Date="2023-07-20"/>`** - Date the legislation was created/enacted

## Extracting Key Information

To use `get_legislation` tool with search results, extract:

1. **Type** - From `<ukm:DocumentMainType Value="..."/>`
   - `UnitedKingdomPublicGeneralAct` → `ukpga`
   - `UnitedKingdomStatutoryInstrument` → `uksi`
   - `ScottishAct` → `asp`
   - etc.

2. **Year** - From `<ukm:Year Value="..."/>`

3. **Number** - From `<ukm:Number Value="..."/>`

### Example Extraction

```xml
<entry>
  <title>Equipment Theft (Prevention) Act 2023</title>
  <ukm:DocumentMainType Value="UnitedKingdomPublicGeneralAct"/>
  <ukm:Year Value="2023"/>
  <ukm:Number Value="34"/>
</entry>
```

**To retrieve this document:**
```
get_legislation(type="ukpga", year="2023", number="34")
```

## Document Type Mappings

| DocumentMainType Value | Short Type Code | Description |
|------------------------|-----------------|-------------|
| UnitedKingdomPublicGeneralAct | ukpga | UK Public General Acts |
| UnitedKingdomStatutoryInstrument | uksi | UK Statutory Instruments |
| UnitedKingdomLocalAct | ukla | UK Local Acts |
| ScottishAct | asp | Acts of Scottish Parliament |
| ScottishStatutoryInstrument | ssi | Scottish Statutory Instruments |
| WelshAssemblyAct | anaw | Acts of National Assembly for Wales |
| WelshParliamentAct | asc | Acts of Senedd Cymru |
| NorthernIrelandAct | nia | Northern Ireland Acts |
| NorthernIrelandStatutoryRule | nisr | Northern Ireland Statutory Rules |
| UnitedKingdomChurchInstrument | ukci | UK Church Instruments |
| UnitedKingdomChurchMeasure | ukcm | UK Church Measures |

## Practical Usage Pattern

1. **Search** for legislation by title/keyword
2. **Parse** the Atom feed XML response
3. **Extract** each `<entry>` element
4. **Read** the `<title>` and `<summary>` to identify relevant legislation
5. **Extract** `ukm:DocumentMainType`, `ukm:Year`, and `ukm:Number`
6. **Convert** DocumentMainType to short code
7. **Call** `get_legislation` with extracted parameters

## URL Structure in Results

Links in search results include point-in-time dates:
```
http://www.legislation.gov.uk/ukpga/2023/34/2024-01-20
```

The date (`2024-01-20`) represents the version as it stood on that date. This can be used as the `version` parameter in `get_legislation` to retrieve historical versions.

## Tips

- Always prefer the `<link rel="alternate" type="application/xml">` URL for CLML format
- Use `<link rel="alternate" type="application/akn+xml">` for Akoma Ntoso format
- The `<summary>` element provides a human-readable description of the legislation's purpose
- Multiple entries in a feed represent multiple search results - process each `<entry>` separately
