import qe from './iqeEnablement';
import { bootstrap, chromeInit } from './entry';
import initializeJWT from './initialize-jwt';
import { createFetchPermissionsWatcher } from '../rbac/fetchPermissions';
import { LibJWT } from '../auth';
import { ChromeAPI, ChromeUser } from '@redhat-cloud-services/types';

/**
 * Create a chrome API instance
 * @param {object} jwt JWT auth functions
 * @param {object} insights existing insights instance
 */
const createChromeInstance = (jwt: LibJWT, insights: Partial<ChromeAPI>, globalConfig: { chrome?: { ssoUrl?: string } }) => {
  const libjwt = jwt;
  const chromeInstance = {
    cache: undefined,
  };

  const jwtResolver = initializeJWT(libjwt, chromeInstance);
  const init = () => {
    /**
     * Mutate the root element to enable QA during app init.
     * Previously was done from applications after react-dom render.
     */
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.setAttribute('data-ouia-safe', 'true');
    }

    const initializedChrome: ChromeAPI = {
      ...window.insights.chrome,
      ...chromeInit(),
    };
    window.insights.chrome = initializedChrome;

    return initializedChrome;
  };

  /**
   * here we need to init the qe plugin
   * the "contract" is we will do this before anyone
   * calls/finishes getUser
   * this only does something if the correct localstorage
   * vars are set
   */
  const getUser = (): Promise<ChromeUser | undefined | void> => {
    qe.init();
    return libjwt.initPromise.then(libjwt.jwt.getUserInfo).catch(() => {
      libjwt.jwt.logoutAllTabs();
    });
  };

  /**
   * Guard async cache dependent functions until cache is created
   * @param {function} fn function that requires global chrome cache
   * @returns {Promise}
   */
  const bufferAsyncFunction = (fn: (...args: any[]) => any) => {
    if (chromeInstance.cache) {
      return fn;
    }

    /**
     * Wait for JWT initialization to happen and cache initialization in chrome instance
     */
    return (...args: any[]) => jwtResolver.then(() => fn(...(args || [])));
  };

  const fetchPermissions = bufferAsyncFunction(createFetchPermissionsWatcher());

  const bootstrapFunctions = bootstrap(libjwt, init, getUser, globalConfig);
  const chromeFunctions = {
    ...bootstrapFunctions,
    chrome: {
      ...bootstrapFunctions.chrome,
      getUserPermissions: async (app = '', bypassCache?: boolean) => {
        await getUser();
        return fetchPermissions(libjwt.jwt.getEncodedToken(), app, bypassCache);
      },
    },
  };

  return {
    ...insights,
    ...chromeFunctions,
  };
};

export default createChromeInstance;
