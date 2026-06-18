/**
 * Formatea una duración en milisegundos a un formato legible HH:MM:SS.
 * @param {number} ms - Duración en milisegundos.
 * @returns {string} - Cadena con formato HH:MM:SS.
 */
function formatMsToTime(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) {
    return '00:00:00';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
}

module.exports = {
  formatMsToTime
};
