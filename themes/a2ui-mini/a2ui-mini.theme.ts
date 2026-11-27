// The a2ui-mini theme. `astryx experimental theme editor` wrote this file once and never changes it again.
// The checked settings live in a2ui-mini.settings.json and the generated a2ui-mini.settings.ts;
// change them with `astryx experimental theme editor set a2ui-mini ...`. Add your own changes below: they win over the settings.
import {defineTheme} from '@astryxdesign/core/theme';
import {a2uiMiniSettings} from './a2ui-mini.settings';

export const a2uiMiniTheme = defineTheme({
  extends: a2uiMiniSettings,
  name: 'a2ui-mini',
});
