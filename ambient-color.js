(() => {
  'use strict';

  function clampByte(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function averageRegion(data, width, height, xStart, xEnd, yStart, yEnd) {
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let y = yStart; y < yEnd; y += 1) {
      for (let x = xStart; x < xEnd; x += 1) {
        const offset = (y * width + x) * 4;
        const alpha = data[offset + 3];
        if (alpha === 0) continue;
        red += data[offset];
        green += data[offset + 1];
        blue += data[offset + 2];
        count += 1;
      }
    }

    if (!count) return [0, 0, 0];
    return [red / count, green / count, blue / count].map(clampByte);
  }

  function sampleSideColors(data, width, height) {
    const third = Math.max(1, Math.floor(width / 3));
    const top = Math.floor(height * 0.12);
    const bottom = Math.max(top + 1, Math.ceil(height * 0.88));
    return {
      left: averageRegion(data, width, height, 0, third, top, bottom),
      right: averageRegion(data, width, height, width - third, width, top, bottom),
    };
  }

  function blendColor(previous, next, amount) {
    const factor = amount === undefined ? 0.35 : Math.max(0, Math.min(1, amount));
    return previous.map((value, index) => clampByte(value + (next[index] - value) * factor));
  }

  function letterboxSideWidth(playerWidth, playerHeight, videoWidth, videoHeight) {
    if (![playerWidth, playerHeight, videoWidth, videoHeight].every(Number.isFinite)) return 0;
    if (playerWidth <= 0 || playerHeight <= 0 || videoWidth <= 0 || videoHeight <= 0) return 0;

    const videoAspect = videoWidth / videoHeight;
    const playerAspect = playerWidth / playerHeight;
    if (videoAspect >= playerAspect) return 0;
    return Math.max(0, (playerWidth - playerHeight * videoAspect) / 2);
  }

  const api = { sampleSideColors, blendColor, letterboxSideWidth };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else window.wfsAmbientColors = api;
})();
