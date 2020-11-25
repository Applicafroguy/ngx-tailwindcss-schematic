module.exports = (isProd) => ({
    prefix: '',
    future: {
      removeDeprecatedGapUtilities: true,
      purgeLayersByDefault: true,
    },
    purge: {
      enabled: isProd,
      content: ['./**/*.html', './**/*.html', '**/*.ts'],
    },
    theme: {
    },
    variants: {
    },
    plugins: [],
  });
  