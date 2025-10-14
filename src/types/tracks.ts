export type TrackRef = {
  type: "music" | "conversion";
  performanceId?: string;
  musicId?: string;
  conversionId?: string;
};
