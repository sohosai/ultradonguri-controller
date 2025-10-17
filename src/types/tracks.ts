export type MusicTrackRef = {
  type: "music";
  performanceId: string;
  musicId: string;
};

export type ConversionTrackRef = {
  type: "conversion";
  conversionId: string;
};

export type TrackRef = MusicTrackRef | ConversionTrackRef;
