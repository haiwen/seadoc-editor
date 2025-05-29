/** (1/4) initialize config object */
let config = {
  serviceUrl: '', // required
  name: '**', // required, current user's name
  username: '**', // required
  password: '**', // required
  avatarURL: '**', // required, current user's avatar_url
  contact_email: '**',
  lib_name: '**',
  repoID: '', // required
  dirPath: '/', // required
  docPath: '', // required
  docName: '', // required
  docUuid: '', // required
  sdocServer: '', // required
  accessToken: '', // required
  isDevelopment: true,
  isOpenSocket: false,
  lang: 'en',
  assetsUrl: '', // required
  isShowInternalLink: false, // required
  isStarIconShown: false // for star/unstar sdoc
};

/** (2/4) load local development settings ./setting.local.js (if exist) */
try {
  config.local = require('./setting.local.js').default || {};
  config = { ...config, ...{ loadVerbose: true }, ...config.local };
  config.loadVerbose && console.log('[SeaTable Plugin Development] Configuration merged with "./src/setting.local.js" (this message can be disabled by adding `loadVerbose: false` to the local development settings)');
  delete config.local;
  delete config.loadVerbose;
} catch (error) {
  // fall-through by intention
  console.error('[SeaTable Plugin Development] Please create "./src/setting.local.js" (from `setting.local.dist.js`)');
  throw error;
}

/** (3/4) remove server trailing slash(es) (if any, common configuration error)*/
if (config.serviceUrl !== config.serviceUrl.replace(/\/+$/, '')) {
  console.log(`[SeaTable Plugin Development] Server "${config.server}" trailing slash(es) removed (this message will go away by correcting the \`server: ...\` entry in the local development settings)`);
  config.serviceUrl = config.serviceUrl.replace(/\/+$/, '');
}

/* (4/4) init window.seafileConfig  */
window.seafileConfig = config;
