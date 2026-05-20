export type AnalyticsEvent =
  | "page_view"
  | "test_start"
  | "question_answered"
  | "test_completed"
  | "image_generated"
  | "image_saved"
  | "share_clicked";

export type AnalyticsPayload = Record<string, unknown>;

export function track(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
  console.log("[analytics]", event, {
    ...payload,
    timestamp: new Date().toISOString()
  });
}

export const analytics = {
  track
};
