#!/usr/bin/env node

/**
 * Generate resource manifest from src/resources/ directory
 *
 * Scans the resources directory and creates a manifest with:
 * - URI based on file path (namespace://path/to/file)
 * - Name extracted from markdown heading or metadata
 * - Description from content or metadata
 * - MIME type based on file extension
 */

import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync } from 'fs';
import { join, relative, parse, sep } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RESOURCES_DIR = join(__dirname, '..', 'src', 'resources');
const OUTPUT_DIR = join(__dirname, '..', 'src', 'generated');
const OUTPUT_FILE = join(OUTPUT_DIR, 'resource-manifest.json');
const METADATA_FILE = join(RESOURCES_DIR, '_metadata.json');

/**
 * Recursively scan directory for resource files
 */
function scanDirectory(dir, baseDir = dir) {
  const resources = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    // Skip metadata file and hidden files
    if (entry.startsWith('_') || entry.startsWith('.')) {
      continue;
    }

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      resources.push(...scanDirectory(fullPath, baseDir));
    } else if (stat.isFile()) {
      const ext = parse(entry).ext;
      if (ext === '.md' || ext === '.json') {
        resources.push(processFile(fullPath, baseDir));
      }
    }
  }

  return resources;
}

/**
 * Process a single file into a resource entry
 */
function processFile(filePath, baseDir) {
  const relativePath = relative(baseDir, filePath);
  const pathParts = relativePath.split(sep);

  // First directory is the namespace
  const namespace = pathParts[0];

  // Rest of path (without extension) becomes the URI path
  const parsed = parse(relativePath);
  const pathWithoutExt = parsed.dir ? join(parsed.dir, parsed.name) : parsed.name;

  // Remove namespace from path for URI
  const uriPath = pathParts.slice(1).join('/').replace(/\.\w+$/, '');

  // Generate URI
  const uri = uriPath ? `${namespace}://${uriPath}` : `${namespace}://${parsed.name}`;

  // Detect MIME type
  const mimeType = parsed.ext === '.json' ? 'application/json' : 'text/markdown';

  // Read file content
  const content = readFileSync(filePath, 'utf-8');

  // Extract name and description
  const { name, description } = extractMetadata(content, parsed.ext, uri);

  return {
    uri,
    name,
    description,
    mimeType,
    filePath: relativePath
  };
}

/**
 * Extract name and description from file content
 */
function extractMetadata(content, extension, uri) {
  let name = uri;
  let description = '';

  if (extension === '.md') {
    // Extract first heading as name
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
      name = headingMatch[1].trim();
    }

    // Extract first paragraph as description
    const lines = content.split('\n');
    let foundHeading = false;
    let descLines = [];

    for (const line of lines) {
      if (line.match(/^#+\s+/)) {
        foundHeading = true;
        continue;
      }

      if (foundHeading && line.trim()) {
        descLines.push(line.trim());
        if (descLines.join(' ').length > 100) {
          break;
        }
      } else if (foundHeading && descLines.length > 0) {
        break;
      }
    }

    description = descLines.join(' ').substring(0, 200);
    if (description.length === 200 && content.length > 200) {
      description += '...';
    }
  } else if (extension === '.json') {
    // For JSON files, try to extract description from structure
    try {
      const data = JSON.parse(content);
      if (data.description) {
        description = data.description;
      }
      if (data.name) {
        name = data.name;
      }
    } catch (e) {
      // If parsing fails, use defaults
    }
  }

  return { name, description };
}

/**
 * Apply custom metadata overrides from _metadata.json
 */
function applyMetadataOverrides(resources) {
  try {
    const metadata = JSON.parse(readFileSync(METADATA_FILE, 'utf-8'));

    return resources.map(resource => {
      // Check for resource-specific overrides
      const override = metadata.resources?.[resource.uri];
      if (override) {
        return {
          ...resource,
          ...override
        };
      }

      return resource;
    });
  } catch (e) {
    // No metadata file or parsing error, return as-is
    return resources;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Generating resource manifest...');
  console.log(`Scanning: ${RESOURCES_DIR}`);

  // Scan directory
  let resources = scanDirectory(RESOURCES_DIR);

  // Apply metadata overrides
  resources = applyMetadataOverrides(resources);

  // Sort by URI for consistency
  resources.sort((a, b) => a.uri.localeCompare(b.uri));

  // Create output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write manifest
  const manifest = { resources };
  writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));

  console.log(`Generated manifest with ${resources.length} resources:`);
  for (const resource of resources) {
    console.log(`  - ${resource.uri}`);
  }
  console.log(`Written to: ${OUTPUT_FILE}`);
}

main();
