const test = require('node:test');
const assert = require('node:assert');

const { sampleSideColors, blendColor, letterboxSideWidth } = require('../ambient-color.js');

function pixels(width, height, color) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  }
  return data;
}

test('sampleSideColors averages the left and right edge regions', () => {
  const width = 9;
  const height = 10;
  const data = pixels(width, height, [0, 0, 0]);
  for (let y = 1; y < 9; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      const offset = (y * width + x) * 4;
      data[offset] = 240;
      data[offset + 1] = 20;
      data[offset + 2] = 10;
    }
    for (let x = 6; x < 9; x += 1) {
      const offset = (y * width + x) * 4;
      data[offset] = 10;
      data[offset + 1] = 30;
      data[offset + 2] = 230;
    }
  }

  assert.deepEqual(sampleSideColors(data, width, height), {
    left: [240, 20, 10],
    right: [10, 30, 230],
  });
});

test('blendColor smooths a new sample and clamps its amount', () => {
  assert.deepEqual(blendColor([0, 100, 255], [100, 0, 0], 0.5), [50, 50, 128]);
  assert.deepEqual(blendColor([0, 0, 0], [255, 128, 64], 2), [255, 128, 64]);
});

test('letterboxSideWidth returns the two pillarbox widths', () => {
  assert.equal(letterboxSideWidth(2560, 1440, 1920, 1080), 0);
  assert.equal(letterboxSideWidth(2560, 1440, 1024, 768), 320);
  assert.equal(letterboxSideWidth(1920, 1080, 1080, 1920), 656.25);
});
