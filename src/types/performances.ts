export type Music = {
  id: string;
  title: string;
  artist: string;
  should_be_muted: boolean;
  intro: string;
};

export type Conversion = {
  id: string;
  title: string;
  description?: string;
};

export type Performance = {
  id: string;
  title: string;
  performer: string;
  description: string;
  starts_at: string;
  ends_at: string;
  musics: Music[];
};
