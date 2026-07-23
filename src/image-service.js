/**
 * Pass through remote media URLs during static builds.
 *
 * The production media bucket is already optimized and served by the R2
 * custom domain. Avoid fetching all remote assets during the Pages build.
 */
const imageService = {
  validateOptions(options) {
    return options;
  },

  getURL(options) {
    if (typeof options.src === 'string') return options.src;
    return options.src?.src ?? '';
  },

  getHTMLAttributes(options) {
    const {
      src: _src,
      format: _format,
      quality: _quality,
      fit: _fit,
      position: _position,
      layout: _layout,
      widths: _widths,
      densities: _densities,
      sizes: _sizes,
      ...attributes
    } = options;
    return attributes;
  },
};

export default imageService;
