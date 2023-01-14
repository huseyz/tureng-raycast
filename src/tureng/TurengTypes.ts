export interface LookupResponse {
  trToEN: LookupResponseItem[],
  enToTR: LookupResponseItem[]
}

export interface LookupResponseItem {
  id: number,
  term: string,
  category: string,
  type: string
}