import { Reading } from "./supabase";

export interface ShowerSession {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  peakTemperature: number;
}

export interface ShowerAnalysis {
  showers: ShowerSession[];
  totalHotWaterMinutes: number;
  baseline: number;
  threshold: number;
}

/**
 * Detect shower sessions from temperature readings.
 *
 * Algorithm:
 * 1. Auto-detect baseline as the 10th percentile of all temperatures.
 * 2. Threshold = baseline + 3°C (a meaningful rise indicates hot water flow).
 * 3. Mark all readings above threshold as "hot".
 * 4. Group consecutive hot readings into sessions, allowing gaps of up to
 *    GAP_TOLERANCE_SEC seconds (brief pauses like soaping up).
 */
const GAP_TOLERANCE_SEC = 30;
const THRESHOLD_DELTA = 3; // °C above baseline
const MIN_SHOWER_DURATION_SEC = 30; // ignore very short spikes

export function detectShowers(readings: Reading[]): ShowerAnalysis {
  if (readings.length === 0) {
    return { showers: [], totalHotWaterMinutes: 0, baseline: 0, threshold: 0 };
  }

  // 1. Compute baseline (10th percentile)
  const sortedTemps = readings.map((r) => r.temperature).sort((a, b) => a - b);
  const p10Index = Math.floor(sortedTemps.length * 0.1);
  const baseline = sortedTemps[p10Index];
  const threshold = baseline + THRESHOLD_DELTA;

  // 2. Find hot water periods
  const sessions: ShowerSession[] = [];
  let sessionStart: Date | null = null;
  let sessionEnd: Date | null = null;
  let peakTemp = 0;
  let totalHotSeconds = 0;

  for (let i = 0; i < readings.length; i++) {
    const reading = readings[i];
    const ts = new Date(reading.timestamp);
    const isHot = reading.temperature >= threshold;

    if (isHot) {
      if (!sessionStart) {
        // Start new session
        sessionStart = ts;
      }
      sessionEnd = ts;
      peakTemp = Math.max(peakTemp, reading.temperature);
    } else if (sessionStart && sessionEnd) {
      // Temperature dropped below threshold — check if gap is within tolerance
      const gapSec = (ts.getTime() - sessionEnd.getTime()) / 1000;

      if (gapSec > GAP_TOLERANCE_SEC) {
        // Session is over — finalize it
        const durationSec =
          (sessionEnd.getTime() - sessionStart.getTime()) / 1000;

        if (durationSec >= MIN_SHOWER_DURATION_SEC) {
          const durationMin = Math.round(durationSec / 60);
          sessions.push({
            startTime: sessionStart,
            endTime: sessionEnd,
            durationMinutes: Math.max(1, durationMin),
            peakTemperature: peakTemp,
          });
          totalHotSeconds += durationSec;
        }

        sessionStart = null;
        sessionEnd = null;
        peakTemp = 0;
      }
      // else: within gap tolerance, keep session open
    }
  }

  // Close any open session
  if (sessionStart && sessionEnd) {
    const durationSec =
      (sessionEnd.getTime() - sessionStart.getTime()) / 1000;

    if (durationSec >= MIN_SHOWER_DURATION_SEC) {
      const durationMin = Math.round(durationSec / 60);
      sessions.push({
        startTime: sessionStart,
        endTime: sessionEnd,
        durationMinutes: Math.max(1, durationMin),
        peakTemperature: peakTemp,
      });
      totalHotSeconds += durationSec;
    }
  }

  return {
    showers: sessions,
    totalHotWaterMinutes: Math.round(totalHotSeconds / 60),
    baseline: Math.round(baseline * 10) / 10,
    threshold: Math.round(threshold * 10) / 10,
  };
}
