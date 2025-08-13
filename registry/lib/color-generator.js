/**
 * Color Palette Generator
 * Based on Matthew Strom's article: https://matthewstrom.com/writing/generating-color-palettes
 *
 * Generates color palettes using the OKHsl color space for better perceptual uniformity.
 * Requires a library like colorjs.io or culori for OKHsl to sRGB conversion.
 */

// utility functions
const YtoL = (Y) => {
  if (Y <= 0.0088564516) {
    return Y * 903.2962962;
  } else {
    return 116 * Math.pow(Y, 1 / 3) - 16;
  }
};

const toe = (l) => {
  const k_1 = 0.206;
  const k_2 = 0.03;
  const k_3 = (1 + k_1) / (1 + k_2);

  return (
    0.5 *
    (k_3 * l -
      k_1 +
      Math.sqrt((k_3 * l - k_1) * (k_3 * l - k_1) + 4 * k_2 * k_3 * l))
  );
};

const normalizeScaleNumber = (scaleNumber, maxScaleNumber) =>
  scaleNumber / maxScaleNumber;

// hue, chroma, and lightness functions
const computeScaleHue = (scaleValue, baseHue) => baseHue + 5 * (1 - scaleValue);

const computeScaleChroma = (scaleValue, minChroma, maxChroma) => {
  const chromaDifference = maxChroma - minChroma;
  return (
    -4 * chromaDifference * Math.pow(scaleValue, 2) +
    4 * chromaDifference * scaleValue +
    minChroma
  );
};

const computeScaleLightness = (scaleValue, backgroundY) => {
  let foregroundY;
  if (backgroundY > 0.18) {
    foregroundY = (backgroundY + 0.05) / Math.exp(3.04 * scaleValue) - 0.05;
  } else {
    foregroundY = Math.exp(3.04 * scaleValue) * (backgroundY + 0.05) - 0.05;
  }

  return toe(YtoL(foregroundY));
};

// color generator function
const computeColorAtScaleNumber = (
  scaleNumber,
  maxScaleNumber,
  baseHue,
  minChroma,
  maxChroma,
  backgroundY,
) => {
  // create an OKHsl color object; this might look different depending on what library you use
  const okhslColor = {};
  // normalize scale number
  const scaleValue = normalizeScaleNumber(scaleNumber, maxScaleNumber);
  // compute color values
  okhslColor.h = computeScaleHue(scaleValue, baseHue);
  okhslColor.s = computeScaleChroma(scaleValue, minChroma, maxChroma);
  okhslColor.l = computeScaleLightness(scaleValue, backgroundY);
  // convert OKHsl to sRGB hex; this will look different depending on what library you use
  return convertToHex(okhslColor);
};

// Export functions for use in other modules
export {
  YtoL,
  toe,
  normalizeScaleNumber,
  computeScaleHue,
  computeScaleChroma,
  computeScaleLightness,
  computeColorAtScaleNumber,
};

// TODO: Implement convertToHex function using colorjs.io or culori
// Example with culori:
// import { okhsl, rgb, formatHex } from 'culori';
// const convertToHex = (okhslColor) => {
//   const rgbColor = rgb(okhsl(okhslColor));
//   return formatHex(rgbColor);
// };
