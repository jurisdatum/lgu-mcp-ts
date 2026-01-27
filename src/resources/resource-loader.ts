/**
 * Dynamic resource loader that uses the generated manifest
 *
 * Loads resources on-demand from the file system based on the
 * manifest generated at build time.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

interface ResourceMetadata {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  filePath: string;
}

interface ResourceContent {
  uri: string;
  mimeType: string;
  text: string;
}

interface Manifest {
  resources: ResourceMetadata[];
}

export class ResourceLoader {
  private resourcesDir: string;
  private resources: ResourceMetadata[];

  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    this.resourcesDir = join(__dirname, '..', 'resources');

    // Load manifest from file
    const manifestPath = join(__dirname, '..', 'generated', 'resource-manifest.json');
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    const manifest: Manifest = JSON.parse(manifestContent);
    this.resources = manifest.resources;
  }

  /**
   * List all available resources
   */
  listResources(): ResourceMetadata[] {
    return this.resources.map(({ uri, name, description, mimeType }) => ({
      uri,
      name,
      description,
      mimeType,
      filePath: '' // Don't expose internal file paths in list
    }));
  }

  /**
   * Read a specific resource by URI
   */
  readResource(uri: string): ResourceContent {
    const resource = this.resources.find(r => r.uri === uri);
    if (!resource) {
      throw new Error(`Resource not found: ${uri}`);
    }

    const content = readFileSync(
      join(this.resourcesDir, resource.filePath),
      'utf-8'
    );

    return {
      uri: resource.uri,
      mimeType: resource.mimeType,
      text: content
    };
  }
}
