/**
 * Client for the Lex FastAPI backend (semantic search API).
 *
 * This client mirrors Lex endpoint shapes and parameter names exactly.
 * It does not normalize or reinterpret responses; the MCP tool layer is
 * responsible for translation to MCP-facing schemas.
 */

export type LexLegislationCategory =
  | "primary"
  | "secondary"
  | "european"
  | "euretained";

export type LexLegislationType = string;

export interface LexLegislationActSearchRequest {
  query: string;
  year_from?: number;
  year_to?: number;
  legislation_type?: LexLegislationType[];
  offset?: number;
  limit?: number;
  include_text?: boolean;
}

export interface LexLegislationSectionSearchRequest {
  query: string;
  legislation_id?: string;
  legislation_category?: LexLegislationCategory[];
  legislation_type?: LexLegislationType[];
  year_from?: number;
  year_to?: number;
  offset?: number;
  size?: number;
  include_text?: boolean;
}

export interface LexLegislationActSectionMatch {
  number: string;
  provision_type: string;
  score: number;
}

export interface LexLegislationActResult {
  id: string;
  uri?: string;
  title: string;
  description?: string;
  text?: string;
  enactment_date?: string;
  valid_date?: string;
  modified_date?: string;
  publisher?: string;
  category?: LexLegislationCategory;
  type?: LexLegislationType;
  year?: number;
  number?: number;
  status?: string;
  extent?: unknown[];
  number_of_provisions?: number;
  provenance_source?: string | null;
  provenance_model?: string | null;
  provenance_prompt_version?: string | null;
  provenance_timestamp?: string | null;
  provenance_response_id?: string | null;
  sections?: LexLegislationActSectionMatch[];
  [key: string]: unknown;
}

export interface LexLegislationSearchResponse {
  results: LexLegislationActResult[];
  total: number;
  offset: number;
  limit: number;
}

export interface LexLegislationSection {
  id: string;
  uri?: string;
  legislation_id: string;
  title?: string;
  text?: string;
  extent?: unknown[];
  provision_type?: string;
  number?: number;
  legislation_type?: LexLegislationType;
  legislation_year?: number;
  legislation_number?: number;
  provenance_source?: string | null;
  provenance_model?: string | null;
  provenance_prompt_version?: string | null;
  provenance_timestamp?: string | null;
  provenance_response_id?: string | null;
  [key: string]: unknown;
}

export interface LexClientOptions {
  baseUrl?: string;
  apiKey?: string;
  userAgent?: string;
}

export class LexClient {
  private baseUrl: string;
  private apiKey?: string;
  private userAgent?: string;

  constructor(options: LexClientOptions = {}) {
    const envBaseUrl = process.env.LEX_API_BASE_URL;
    this.baseUrl = (options.baseUrl ?? envBaseUrl ?? "http://localhost:8000").replace(
      /\/+$/,
      ""
    );
    this.apiKey = options.apiKey ?? process.env.LEX_API_KEY;
    this.userAgent = options.userAgent ?? process.env.LEX_API_USER_AGENT;
  }

  async searchLegislation(
    request: LexLegislationActSearchRequest
  ): Promise<LexLegislationSearchResponse> {
    return this.postJson<LexLegislationSearchResponse>(
      "/legislation/search",
      request
    );
  }

  async searchLegislationSections(
    request: LexLegislationSectionSearchRequest
  ): Promise<LexLegislationSection[]> {
    return this.postJson<LexLegislationSection[]>(
      "/legislation/section/search",
      request
    );
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (this.userAgent) {
      headers["User-Agent"] = this.userAgent;
    }

    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch {
          // ignore response body parsing errors
        }

        const detail = errorBody ? ` - ${errorBody}` : "";
        throw new Error(`Lex API request failed: ${response.status} ${response.statusText}${detail}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch ${url}: ${error.message}`);
      }
      throw error;
    }
  }
}
