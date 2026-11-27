// The kawasemi theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in kawasemi.settings.json and the generated kawasemi.settings.ts;
// change them with `astryx experimental theme editor set kawasemi ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {kawasemiSettings} from './kawasemi.settings';

export const kawasemiTheme = defineTheme({
  extends: kawasemiSettings,
  name: 'kawasemi',
});
