export interface Citation {
  chunk_id: string;
  chapter_title: string;
  section_title: string;
  url_fragment: string;
  relevance_score: number;
}

export interface ChatTurn {
  id: string;
  query: string;
  answer: string;
  citations: Citation[];
  scope: 'global' | 'selected_text';
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  turns: ChatTurn[];
}
