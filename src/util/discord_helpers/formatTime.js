export default function formatTime(ms) {
  const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;
  const days = roundTowardsZero(ms / 86400000);
  const hours = roundTowardsZero(ms / 3600000) % 24;
  const minutes = roundTowardsZero(ms / 60000) % 60;
  const seconds = roundTowardsZero(ms / 1000) % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
