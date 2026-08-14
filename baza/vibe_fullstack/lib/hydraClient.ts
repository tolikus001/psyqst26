/**
 * Hydra AI Client Helper SDK
 * Simple pre-built helper for calling Hydra AI backend API endpoints
 */

export interface HydraPersonaInput {
  niche: string;
  productName?: string;
}

export interface HydraGenerateInput {
  niche: string;
  topic: string;
  audience?: string;
}

export interface HydraAuthorInput {
  name: string;
  position?: string;
  raw_bio?: string;
}

export interface HydraSequenceInput {
  leadMagnetTitle: string;
  productToPitch?: string;
  stepCount?: number;
}

export class HydraClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/hydra') {
    this.baseUrl = baseUrl;
  }

  async generatePersona(input: HydraPersonaInput) {
    const res = await fetch(`${this.baseUrl}/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  async generateLeadMagnet(input: HydraGenerateInput) {
    const res = await fetch(`${this.baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }

  async generateAuthor(authorInfo: HydraAuthorInput) {
    const res = await fetch(`${this.baseUrl}/author`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorInfo }),
    });
    return res.json();
  }

  async generateSequence(input: HydraSequenceInput) {
    const res = await fetch(`${this.baseUrl}/sequence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    return res.json();
  }
}
