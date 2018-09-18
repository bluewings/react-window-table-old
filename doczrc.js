import { themeConfig, htmlContext } from './config/docz/theme';
import { modifyBundlerConfig } from './config/docz/modifyBundler';

export default {
  title: 'react-window-table',
  description: 'React table component that supports fixed columns inspired by react-window.',
  themeConfig,
  modifyBundlerConfig,
  htmlContext,
  dest: 'docs',
  base: '/react-window-table/',
  hashRouter: true,
};
