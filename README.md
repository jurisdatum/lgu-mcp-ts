# legislation.gov.uk MCP Server

Model Context Protocol (MCP) server providing AI assistants with access to UK legislation from [legislation.gov.uk](https://www.legislation.gov.uk).

## Features

### Tools

- **search_legislation** - Search for legislation by title, text, type, or year
- **get_legislation** - Retrieve full legislation documents in XML, Akoma Ntoso, or HTML formats
- **get_legislation_metadata** - Get structured JSON metadata for legislation (experimental)

### Resources

The server provides comprehensive documentation resources:

- `guide://getting-started` - Overview and basic workflow
- `clml://schema-guide` - CLML XML structure reference
- `clml://metadata/extent` - Geographical extent guide
- `atom://feed-guide` - Search result parsing guide
- `types://guide` - Legislation types reference
- `types://data` - Legislation types JSON data
- `cookbook://check-extent` - Step-by-step recipes for common tasks

## Installation

```bash
npm install
npm run build
```

**Note:** The build process generates a resource manifest from files in `src/resources/`. This manifest is required at runtime and is created automatically during the build.

## Usage

### With MCP Inspector

```bash
npm run inspector
```

### As a Standalone Server

```bash
npm start
```

### In Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "legislation-gov-uk": {
      "command": "node",
      "args": ["/path/to/legislation-gov-uk/build/index.js"]
    }
  }
}
```

## Development

```bash
# Watch mode (auto-rebuild on changes)
npm run watch

# Build only
npm run build

# Generate resource manifest
npm run generate-manifest
```

## Architecture

The server uses a convention-based resource system:

- Resources are organized hierarchically in `src/resources/`
- Top-level directories become URI namespaces (e.g., `clml://`, `guide://`)
- Build process generates a manifest mapping URIs to files
- Resources are loaded on-demand at runtime

## License

Licensed under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).

Contains public sector information licensed under the Open Government Licence v3.0.

## Author

[The National Archives](https://www.nationalarchives.gov.uk/)
