import { MODULE_LINK_TYPES } from "./moduleLinkTypes";

const extractResults = (data) => (Array.isArray(data) ? data : data?.results ?? []);

// Registered slot with no endpoint configured - resolves empty so the picker
// shows a "coming soon" state instead of crashing (e.g. a module with no
// flat "list all records" choices endpoint on this backend).
const EMPTY_PROVIDER = { isEmpty: true, load: async () => [] };

/**
 * Builds a "/" command data source: which modules exist (static, see
 * moduleLinkTypes.js) and how to fetch+cache+search each module's entities.
 * One instance should be created per host app (or shared across hosts running
 * in the same JS runtime, e.g. main-app + a module-federated remote), since
 * the fetch cache lives in this closure - creating multiple instances means
 * multiple independent caches and duplicate network requests.
 *
 * @param {object} options
 * @param {() => object} options.getApiService - thunk returning the axios
 *   instance to fetch with, resolved lazily on first use (not at call time)
 *   so a host can construct this before its own auth/context is ready.
 * @param {Object<string, {endpoint: string, normalize: (raw:object) => {id, title}}>} options.endpoints
 *   - per-moduleKey config. A moduleKey with no entry here still appears in
 *   the module list (if present in `modules`) but its entity provider is
 *   registered empty ("coming soon"), matching how finance/drive/workflow
 *   behave today.
 * @param {Array<{moduleKey, label}>} [options.modules] - defaults to the
 *   canonical MODULE_LINK_TYPES; override only to restrict/extend the list.
 */
export function createModuleLinkDataSource({ getApiService, endpoints = {}, modules = MODULE_LINK_TYPES } = {}) {
  const cache = {};
  const pending = {};

  function loadEntities(moduleKey) {
    const config = endpoints[moduleKey];
    if (!config) return Promise.resolve([]);
    if (cache[moduleKey]) return Promise.resolve(cache[moduleKey]);
    if (!pending[moduleKey]) {
      const apiService = getApiService();
      pending[moduleKey] = apiService
        .get(config.endpoint)
        .then((res) => {
          const list = extractResults(res.data).map(config.normalize);
          cache[moduleKey] = list;
          return list;
        })
        .finally(() => {
          delete pending[moduleKey];
        });
    }
    return pending[moduleKey];
  }

  function searchModules(query) {
    const q = (query || "").trim().toLowerCase();
    return q ? modules.filter((module) => module.label.toLowerCase().includes(q)) : modules;
  }

  function getEntityProvider(moduleKey) {
    if (!endpoints[moduleKey]) return EMPTY_PROVIDER;
    return {
      isEmpty: false,
      load: async (query) => {
        const items = await loadEntities(moduleKey);
        const q = (query || "").trim().toLowerCase();
        return (q ? items.filter((item) => item.title?.toLowerCase().includes(q)) : items).map((item) => ({
          id: item.id,
          label: item.title,
        }));
      },
    };
  }

  function findEntity(moduleKey, id) {
    return (cache[moduleKey] || []).find((item) => String(item.id) === String(id));
  }

  return {
    searchModules,
    getEntityProvider,
    findEntity,
    // Raw normalized records ({id, title, ...whatever `normalize` adds}),
    // unfiltered and un-mapped-to-{id,label} - for callers that need more
    // than the picker's display shape (e.g. a filter dropdown that also
    // needs `type`/`projectId`).
    loadEntities,
  };
}

export default createModuleLinkDataSource;
