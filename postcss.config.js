const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const postcssNested = require('postcss-nested');
const postcssNormalize = require('postcss-normalize');

module.exports = {
  plugins: [
    postcssNested,
    tailwindcss,
    autoprefixer,
    postcssNormalize({
      forceImport: true,
    }),
  ],
};