import fetch, { RequestInit } from 'node-fetch';
import { LookupResponse, LookupResponseItem } from './TurengTypes';
import { Md5 } from 'ts-md5';

interface SearchResponse {
  ExceptionMessage: string;
  IsSuccessful: boolean;
  MobileResult: {
    IsFound: number;
    IsTRToEN: number;
    Suggestions: string[];
    Results: {  
      CategoryEN: string;
      CategoryTR: string;
      Term: string;
      TypeEN: string;
      TypeTR: string;
    }[]
    Term: string;
    VoiceURLs: string[];
  };
}

type SearchResultItem = SearchResponse["MobileResult"]["Results"][0];

export default class TurengAPI {

  public static instance = new TurengAPI;

  private readonly SECRET = "46E59BAC-E593-4F4F-A4DB-960857086F9C";
  private readonly REQUEST_HEADERS = {
    'User-Agent': 'CFNetwork/548.0.3 Darwin/11.2.0',
    'Content-Type': 'application/json',
  }
  private readonly SEARCH_URL = "http://ws.tureng.com/TurengSearchServiceV4.svc/Search";
  private readonly AUTOCOMPLETE_URL = "https://ac.tureng.co?t=";

  private idCounter = 0;

  public async complete(term: string): Promise<string[]> {
    if (!term) {
      return [];
    }
    term = encodeURIComponent(term);
    const url = this.AUTOCOMPLETE_URL + encodeURIComponent(term)
    try {
      const response = await fetch(url);
      return (await response.json()) as string[];
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  public async lookup(word: string): Promise<LookupResponse> {
    const emptyLookupResponse = {
      enToTR: [],
      trToEN: []
    };
    const response = await fetch(this.SEARCH_URL, this.searchRequest(word));
    const searchResponse = await response.json() as SearchResponse;
    if (searchResponse.IsSuccessful && searchResponse.MobileResult.IsFound === 1) {
      return searchResponse.MobileResult.Results.reduce((prev: LookupResponse, curr: SearchResultItem): LookupResponse => {
        const enToTR = curr.CategoryEN.includes('en->tr');
        const item = this.toLookupResponseItem(curr, this.idCounter++, enToTR);
        (enToTR ? prev.enToTR : prev.trToEN).push(item);
        return prev;
      }, emptyLookupResponse);
    }
    return emptyLookupResponse;
  }
  
 private searchRequest(word: string): RequestInit {
  return {
    method: 'POST',
    headers: this.REQUEST_HEADERS,
    body: JSON.stringify({
      Term: word,
      Code: Md5.hashStr(`${word}${this.SECRET}`)
    }),
  };
 }

 private toLookupResponseItem(result: SearchResultItem, id: number, enToTR: boolean): LookupResponseItem {
  return {
    id: id,
    term: result.Term,
    category: enToTR ? result.CategoryTR : result.CategoryEN,
    type: enToTR ? result.TypeTR : result.TypeEN,
  };
 }

}
