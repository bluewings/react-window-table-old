import themeConfig from './config/docz/theme';
import modifyBundlerConfig from './config/docz/modifyBundler';

// doczrc.js
const autoprefixer = require('autoprefixer');

export default {
  themeConfig,
  modifyBundlerConfig,
  // modifyBundlerConfig: (config) => {
  //   config.resolve.extensions.push('.pug');
  //   config.module.rules.push({
  //     test: /\.pug$/,
  //     // use: ['style-loader', 'css-loader', 'sass-loader'],
  //     use: [
  //       require.resolve('babel-loader'),
  //       {
  //         loader: require.resolve('pug-as-jsx-loader'),
  //         options: {
  //           // resolveComponents: {
  //           //   Intl: 'useIntl/FormattedMessage',
  //           // },
  //           resolveVariables: {
  //             // intl: 'useIntl/intl',
  //             cx: 'classnames',
  //           },
  //           transpiledFile: true,
  //           autoUpdateJsFile: true,
  //         },
  //       },
  //     ],
  //   });

  //   config.module.rules.push({
  //     test: /\.(css|scss)$/,
  //     include: /\/src\/components\//,
  //     use: [
  //       require.resolve('style-loader'),
  //       {
  //         loader: require.resolve('css-loader'),
  //         options: {
  //           importLoaders: 1,
  //           sourceMap: true,
  //           modules: true,
  //           localIdentName: '[name]-[local]-[hash:base64:5]',
  //         },
  //       },
  //       {
  //         loader: require.resolve('postcss-loader'),
  //         options: {
  //           // Necessary for external CSS imports to work
  //           // https://github.com/facebookincubator/create-react-app/issues/2677
  //           ident: 'postcss',
  //           plugins: () => [
  //             require('postcss-flexbugs-fixes'),
  //             // 'postcss-flexbugs-fixes',
  //             autoprefixer({
  //               browsers: [
  //                 '>1%',
  //                 'last 4 versions',
  //                 'Firefox ESR',
  //                 'not ie < 9', // React doesn't support IE8 anyway
  //               ],
  //               flexbox: 'no-2009',
  //             }),
  //           ],
  //         },
  //       },
  //       require.resolve('sass-loader'),
  //     ],
  //   });


  //   return config;
  // },
};
