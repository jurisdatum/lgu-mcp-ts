/**
 * Client for the legislation.gov.uk public API
 *
 * This client wraps the legacy public API endpoints at legislation.gov.uk,
 * providing methods for retrieving legislation data in various formats.
 *
 * Most endpoints return XML (CLML format) or HTML. Some endpoints may support
 * other formats like Atom feeds or RDF.
 */

export class LegislationClient {
  private baseUrl = "https://www.legislation.gov.uk";

  /**
   * Retrieve a full legislation document by citation
   * Returns CLML XML by default, Akoma Ntoso if requested, or HTML
   */
  async getDocument(
    type: string,
    year: string,
    number: string,
    options: {
      format?: "xml" | "akn" | "html";
      version?: string; // Point-in-time date (YYYY-MM-DD)
    } = {}
  ): Promise<string> {
    const { format = "xml", version } = options;

    const versionPath = version ? `/${version}` : "";
    const url = `${this.baseUrl}/${type}/${year}/${number}${versionPath}/data.${format}`;

    return this.fetchText(url);
  }

  /**
   * Retrieve metadata only for a legislation document (without full content)
   * Returns metadata in XML format
   *
   * This is more efficient than fetching the full document when you only need
   * metadata like title, year, number, extent, dates, etc.
   *
   * Endpoint: /type/year/number[/version]/resources/data.xml
   */
  async getDocumentMetadata(
    type: string,
    year: string,
    number: string,
    options: {
      version?: string; // Point-in-time date (YYYY-MM-DD)
    } = {}
  ): Promise<string> {
    const { version } = options;

    const versionPath = version ? `/${version}` : "";
    const url = `${this.baseUrl}/${type}/${year}/${number}${versionPath}/resources/data.xml`;

    return this.fetchText(url);
  }

  /**
   * Retrieve a specific fragment of a legislation document
   * Returns CLML XML by default, Akoma Ntoso if requested, or HTML
   *
   * Fragments can be Parts, Chapters, Cross-Headings, Sections, or Subsections.
   * The fragmentId should be a path like "section/5" or "part/1/chapter/2".
   */
  async getFragment(
    type: string,
    year: string,
    number: string,
    fragmentId: string,
    options: {
      format?: "xml" | "akn" | "html";
      version?: string; // Point-in-time date (YYYY-MM-DD)
    } = {}
  ): Promise<string> {
    const { format = "xml", version } = options;

    const versionPath = version ? `/${version}` : "";
    const url = `${this.baseUrl}/${type}/${year}/${number}${versionPath}/${fragmentId}/data.${format}`;

    return this.fetchText(url);
  }

  /**
   * Search for legislation by various criteria
   * Returns Atom feed (XML format)
   */
  async search(params: {
    title?: string;
    text?: string;
    type?: string;
    year?: string;
    startYear?: string;
    endYear?: string;
  }): Promise<string> {
    const queryParams = new URLSearchParams();

    if (params.title) queryParams.append("title", params.title);
    if (params.text) queryParams.append("text", params.text);
    if (params.type) queryParams.append("type", params.type);
    if (params.year) queryParams.append("year", params.year);
    if (params.startYear) queryParams.append("start-year", params.startYear);
    if (params.endYear) queryParams.append("end-year", params.endYear);

    const url = `${this.baseUrl}/search/data.feed?${queryParams.toString()}`;

    return this.fetchText(url);
  }

  /**
   * Fetch helper for text responses (XML, HTML)
   */
  private async fetchText(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "legislation-mcp-server/0.1.0"
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Not found: ${url}`);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
      }
      throw error;
    }
  }
}
