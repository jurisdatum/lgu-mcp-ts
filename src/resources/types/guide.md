# UK Legislation Types Reference

UK legislation comes in many different types, each with a **short code** (used in URLs) and a **long name** (used in metadata and Atom feeds).

## Categories

### Primary Legislation
Acts of Parliament and devolved legislatures. These are the main laws passed by legislative bodies with full law-making powers.

### Secondary Legislation
Delegated or subordinate legislation made under powers granted by primary legislation. Also known as statutory instruments, regulations, or orders.

### EU Retained Law
European Union legislation that was retained in UK law following Brexit under the European Union (Withdrawal) Act 2018.

## Short Code ↔ Long Name Mapping

When working with legislation.gov.uk data:
- **URLs use short codes**: `https://www.legislation.gov.uk/ukpga/2023/34`
- **Atom feeds use long names**: `<ukm:DocumentMainType Value="UnitedKingdomPublicGeneralAct"/>`
- **You need to convert between them** to use search results with `get_legislation`

### Common Types Quick Reference

| Short Code | Long Name | Category | Description |
|------------|-----------|----------|-------------|
| **ukpga** | UnitedKingdomPublicGeneralAct | Primary | UK Acts of Parliament |
| **uksi** | UnitedKingdomStatutoryInstrument | Secondary | UK Statutory Instruments |
| **asp** | ScottishAct | Primary | Scottish Parliament Acts |
| **ssi** | ScottishStatutoryInstrument | Secondary | Scottish Statutory Instruments |
| **anaw** | WelshNationalAssemblyAct | Primary | Welsh Assembly Acts (old) |
| **asc** | WelshParliamentAct | Primary | Welsh Parliament Acts (Senedd) |
| **wsi** | WelshStatutoryInstrument | Secondary | Welsh Statutory Instruments |
| **nia** | NorthernIrelandAct | Primary | Northern Ireland Assembly Acts |
| **nisr** | NorthernIrelandStatutoryRule | Secondary | Northern Ireland Statutory Rules |

### All Primary Legislation Types

**UK Parliament:**
- `ukpga` / `UnitedKingdomPublicGeneralAct` - Acts of the UK Parliament
- `ukla` / `UnitedKingdomLocalAct` - UK Local Acts
- `ukppa` / `UnitedKingdomPrivateOrPersonalAct` - UK Private Acts
- `ukcm` / `UnitedKingdomChurchMeasure` - Church Measures

**Scottish Parliament:**
- `asp` / `ScottishAct` - Scottish Parliament Acts (1999-)
- `aosp` / `ScottishOldAct` - Old Scottish Acts (pre-1707)

**Welsh Parliament:**
- `asc` / `WelshParliamentAct` - Senedd Cymru Acts (2020-)
- `anaw` / `WelshNationalAssemblyAct` - National Assembly for Wales Acts (2011-2020)
- `mwa` / `WelshAssemblyMeasure` - Assembly Measures (2008-2011)

**Northern Ireland:**
- `nia` / `NorthernIrelandAct` - Northern Ireland Assembly Acts (1999-)
- `apni` / `NorthernIrelandParliamentAct` - Old NI Parliament Acts (1921-1972)
- `mnia` / `NorthernIrelandAssemblyMeasure` - Assembly Measures

**Historical:**
- `aep` / `EnglandAct` - Old English Acts (pre-1707)
- `aip` / `IrelandAct` - Old Irish Acts (pre-1800)
- `apgb` / `GreatBritainAct` - Great Britain Acts (1707-1800)
- `gbla` / `GreatBritainLocalAct` - GB Local Acts (1707-1800)
- `gbppa` / `GreatBritainPrivateOrPersonalAct` - GB Private Acts (1707-1800)

### All Secondary Legislation Types

**UK Wide:**
- `uksi` / `UnitedKingdomStatutoryInstrument` - UK Statutory Instruments
- `ukmd` / `UnitedKingdomMinisterialDirection` - Ministerial Directions
- `ukmo` / `UnitedKingdomMinisterialOrder` - Ministerial Orders
- `uksro` / `UnitedKingdomStatutoryRuleOrOrder` - Statutory Rules/Orders (pre-1948)
- `ukci` / `UnitedKingdomChurchInstrument` - Church Instruments

**Devolved:**
- `ssi` / `ScottishStatutoryInstrument` - Scottish Statutory Instruments
- `wsi` / `WelshStatutoryInstrument` - Welsh Statutory Instruments
- `nisr` / `NorthernIrelandStatutoryRule` - Northern Ireland Statutory Rules
- `nisi` / `NorthernIrelandOrderInCouncil` - NI Orders in Council
- `nisro` / `NorthernIrelandStatutoryRuleOrOrder` - NI Rules/Orders (pre-1974)

**Draft Instruments (not yet in force):**
- `ukdsi` / `UnitedKingdomDraftStatutoryInstrument` - UK Draft SIs
- `sdsi` / `ScottishDraftStatutoryInstrument` - Scottish Draft SSIs
- `nidsr` / `NorthernIrelandDraftStatutoryRule` - NI Draft Rules

### EU Retained Law

- `eur` / `EuropeanUnionRegulation` - EU Regulations
- `eudn` / `EuropeanUnionDecision` - EU Decisions
- `eudr` / `EuropeanUnionDirective` - EU Directives
- `eut` / `EuropeanUnionTreaty` - EU Treaties

## Conversion Examples

### From Atom Feed to get_legislation

**Atom feed entry:**
```xml
<entry>
  <title>Data Protection Act 2018</title>
  <ukm:DocumentMainType Value="UnitedKingdomPublicGeneralAct"/>
  <ukm:Year Value="2018"/>
  <ukm:Number Value="12"/>
</entry>
```

**Conversion:**
- `UnitedKingdomPublicGeneralAct` → `ukpga`

**Call:**
```
get_legislation(type="ukpga", year="2018", number="12")
```

### From URL to Long Name

**URL:**
```
https://www.legislation.gov.uk/asp/2003/7
```

**Conversion:**
- `asp` → `ScottishAct`

## Practical Usage

1. **Search** returns Atom feed with `<ukm:DocumentMainType Value="..."/>`
2. **Look up** the long name in the types reference
3. **Convert** to short code
4. **Use short code** with `get_legislation` tool

## Notes

- Short codes are always lowercase
- Long names use PascalCase (no spaces)
- The same legislation body may have multiple types (e.g., Welsh Parliament has `anaw`, `asc`, and `mwa` for different periods)
- Draft instruments (`ukdsi`, `sdsi`, `nidsr`) are proposed legislation not yet in force
- Historical types (`aep`, `aip`, `apgb`, etc.) cover legislation from before the current UK constitutional structure
