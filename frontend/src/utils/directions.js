/**
 * Universal Google Maps directions URL — works across platforms (opens the
 * native Maps app on mobile via the same URL, falls back to Google Maps in
 * the browser on desktop). No API key required since it's just a deep link,
 * not an embedded map or API call.
 */
export function directionsUrl(latitude, longitude) {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
