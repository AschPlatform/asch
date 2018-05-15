module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/Index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/BlockCache.ts":
/*!***************************!*\
  !*** ./src/BlockCache.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class BlockCache {
    constructor(maxCachedCount) {
        this.cache = new Map();
        this.minHeight = -1;
        this.maxHeight = -1;
        this.maxCachedCount = maxCachedCount;
    }
    isCached(height) {
        return height > 0 && height >= this.minHeight && height <= this.maxHeight;
    }
    get cachedHeightRange() {
        return { min: this.minHeight, max: this.maxHeight };
    }
    put(block) {
        if (!this.isCached(block.height) && this.maxHeight >= 0 && block.height !== this.maxHeight + 1)
            throw new Error('invalid block height');
        this.cache.set(block.height, block);
        this.maxHeight = block.height;
        if (this.cache.size >= this.maxCachedCount) {
            this.cache.delete(this.minHeight++);
        }
    }
    get(height) {
        return this.cache.get(height);
    }
    getById(id) {
        for (const b of this.cache.values()) {
            if (b.id === id)
                return b;
        }
        return undefined;
    }
    evit(fromHeight, toHeight) {
        let min = Math.min(fromHeight, toHeight);
        let max = Math.max(fromHeight, toHeight);
        if (min > this.maxHeight || max < this.minHeight)
            return;
        min = Math.max(min, this.minHeight);
        max = Math.min(max, this.minHeight);
        for (let height = min; height <= max; height++) {
            this.cache.delete(height);
        }
    }
}
exports.BlockCache = BlockCache;


/***/ }),

/***/ "./src/Common.ts":
/*!***********************!*\
  !*** ./src/Common.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(/*! util */ "util");
function makeJsonObject(iterable, getKey, getValue) {
    CodeContract.argument('iterable', () => CodeContract.notNull(iterable));
    CodeContract.argument('getKey', () => CodeContract.notNull(getKey));
    CodeContract.argument('getValue', () => CodeContract.notNull(getValue));
    let ret = {};
    for (let item of iterable) {
        ret[getKey(item)] = getValue(item);
    }
    return ret;
}
exports.makeJsonObject = makeJsonObject;
function deepCopy(src) {
    if (!src)
        return src;
    return JSON.parse(JSON.stringify(src));
}
exports.deepCopy = deepCopy;
function partial(src, keysOrKeyFilter) {
    CodeContract.argument('src', () => CodeContract.notNull(src));
    CodeContract.argument('keysOrKeyFilter', () => CodeContract.notNull(keysOrKeyFilter));
    let keys = util_1.isFunction(keysOrKeyFilter) ?
        Object.keys(src).filter(keysOrKeyFilter) :
        keysOrKeyFilter;
    let result = {};
    for (let k of keys)
        result[k] = src[k];
    return result;
}
exports.partial = partial;
function isPrimitiveKey(key) {
    if (!key)
        return false;
    return util_1.isString(key) || util_1.isNumber(key);
}
exports.isPrimitiveKey = isPrimitiveKey;
class CodeContractError extends Error {
    constructor(message) {
        super('Code contract Error,' + message);
    }
}
exports.CodeContractError = CodeContractError;
class CodeContract {
    static verify(condition, message) {
        if (condition === undefined || condition === null)
            throw new Error('Invalid verify condition');
        const cond = util_1.isFunction(condition) ? condition() : condition;
        const msg = util_1.isFunction(message) ? message() : message;
        if (!cond)
            throw new CodeContractError(msg);
    }
    static argument(argName, verify, message) {
        if (!argName || !verify)
            throw new Error('argName or verify cannot be null or undefined');
        if (!message) {
            const vr = verify();
            CodeContract.verify(vr.result, `argument '${argName}' ${vr.message}`);
            return;
        }
        CodeContract.verify(verify, message);
    }
    static notNull(arg) {
        const result = arg !== null && arg !== undefined;
        const message = result ? undefined : 'cannot be null or undefined';
        return { result, message };
    }
    static notNullOrEmpty(str) {
        const result = CodeContract.notNull(str) && str !== '';
        const message = result ? undefined : 'cannot be null or undefined or empty';
        return { result, message };
    }
    static notNullOrWhitespace(str) {
        const result = CodeContract.notNullOrEmpty(str) && str.trim() !== '';
        const message = result ? undefined : 'cannot be null or undefined or whitespace';
        return { result, message };
    }
}
exports.CodeContract = CodeContract;


/***/ }),

/***/ "./src/DbSession.ts":
/*!**************************!*\
  !*** ./src/DbSession.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EntityCache_1 = __webpack_require__(/*! ./EntityCache */ "./src/EntityCache.ts");
const SqlBuilder_1 = __webpack_require__(/*! ./SQLDB/SqlBuilder */ "./src/SQLDB/SqlBuilder.ts");
const EntityTracker_1 = __webpack_require__(/*! ./StateTracker/EntityTracker */ "./src/StateTracker/EntityTracker.ts");
const EntityProxy_1 = __webpack_require__(/*! ./StateTracker/EntityProxy */ "./src/StateTracker/EntityProxy.ts");
const Log_1 = __webpack_require__(/*! ./Log */ "./src/Log.ts");
const util_1 = __webpack_require__(/*! util */ "util");
class DbSession {
    constructor(connection, cacheOptions, sessionName) {
        this.log = Log_1.LogManager.getLogger(DbSession.name + (sessionName === undefined ? '' : `_${sessionName}`));
        this.sessionSerial = -1;
        this.connection = connection;
        this.models = new Map();
        this.sessionCache = new EntityCache_1.LRUEntityCache(cacheOptions);
        this.sqlBuilder = new SqlBuilder_1.JsonSqlBuilder();
        this.entityTracker = new EntityTracker_1.ProxiedEntityTracker(this.sessionCache);
        this.holdLocks = new Map();
        this.trackerSqlBuilder = new EntityTracker_1.TrackerSqlBuilder(this.entityTracker, this.models, this.sqlBuilder);
    }
    getSchemaByName(modelName) {
        const schema = this.models.get(modelName);
        if (!schema)
            throw new Error(`unregistered model ( name = '${modelName}' )`);
        return schema;
    }
    getSchemaByClass(clazz) {
        const schema = this.models.get(clazz.name);
        if (!schema)
            throw new Error(`unregistered model ( name = '${clazz.name}' )`);
        return schema;
    }
    getSchema(model) {
        return typeof model === 'string' ?
            this.getSchemaByName(model) :
            this.getSchemaByClass(model);
    }
    makeByKeyCondition(schema, key) {
        return schema.setKey({}, key);
    }
    trackPersistentEntities(schema, entities, cache = true, refreshIfTracking = false) {
        let result = new Array();
        entities.forEach(e => {
            let key = schema.getKey(e);
            let tracked = this.entityTracker.getTrackingEntity(schema, key);
            let proxied = refreshIfTracking && tracked !== undefined ?
                tracked :
                this.entityTracker.trackPersistent(schema, e);
            result.push(proxied);
            cache && this.entityCache.put(schema.modelName, key, e);
        });
        return result;
    }
    reset(clearCache = false) {
        this.entityTracker.stopTrackAll();
        if (clearCache)
            this.entityCache.clear();
    }
    undefinedIfDeleted(proxied) {
        return (proxied.__state__ === EntityProxy_1.EntityState.Deleted || proxied.__state__ === EntityProxy_1.EntityState.Transient) ?
            undefined :
            proxied;
    }
    get isOpen() {
        return this.connection && this.connection.isConnected;
    }
    get entityCache() {
        return this.sessionCache;
    }
    syncSchema(schema) {
        this.sqlBuilder.buildSchema(schema).forEach(sql => {
            this.connection.executeSync(sql);
        });
    }
    registerSchema(...schemas) {
        schemas.forEach(s => this.models.set(s.modelName, s));
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            this.reset(true);
            yield this.connection.disconnect();
        });
    }
    attachHistory(history) {
        this.entityTracker.attachHistory(history);
    }
    getAllCached(model, filter) {
        const schema = this.getSchema(model);
        let entityMap = new Map();
        new Array(...this.entityTracker.trackingEntities)
            .filter(pe => pe.__schema__.modelName === schema.modelName && pe.__state__ !== EntityProxy_1.EntityState.Deleted && pe.__state__ !== EntityProxy_1.EntityState.Transient)
            .forEach(pe => entityMap.set(this.entityTracker.getModelAndKey(pe), pe));
        let entities = this.entityCache.getAll(schema.modelName, filter);
        entities && entities.forEach(e => {
            let key = this.entityTracker.makeModelAndKey(schema, schema.getKey(e));
            if (!entityMap.has(key)) {
                let pe = this.entityTracker.trackPersistent(schema, e);
                entityMap.set(key, pe);
            }
        });
        return filter ? [...entityMap.values()].filter(filter) : [...entityMap.values()];
    }
    attach(schema, key) {
        let tracked = this.entityTracker.getTrackingEntity(schema, key);
        if (tracked !== undefined)
            return this.undefinedIfDeleted(tracked);
        let cached = this.entityCache.get(schema.modelName, key);
        return (cached === undefined) ? undefined :
            this.entityTracker.trackPersistent(schema, cached);
    }
    getAll(model, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            if (schema.memCached && this.entityCache.existsModel(schema.modelName)) {
                let entities = this.entityCache.getAll(schema.modelName) || [];
                return track ? this.trackPersistentEntities(schema, entities, false, true) : entities;
            }
            return yield this.getMany(model, {}, track);
        });
    }
    getMany(model, condition, track = false, cache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, condition);
            let entities = yield this.connection.query(sql.query, sql.parameters);
            cache && entities.forEach(e => this.entityCache.put(schema.modelName, schema.getKey(e), e));
            return track ? this.trackPersistentEntities(schema, entities, false) : entities;
        });
    }
    query(model, condition, resultRange, sort, fields, join) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, condition, resultRange, sort, join);
            return yield this.connection.query(sql.query, sql.parameters);
        });
    }
    queryByJson(model, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, params);
            return yield this.connection.query(sql.query, sql.parameters);
        });
    }
    exists(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            let { query, parameters } = this.sqlBuilder.buildSelect(schema, [], condition);
            query = `select exists(${query.replace(SqlBuilder_1.MULTI_SQL_SEPARATOR, '')}) as exist`;
            const ret = yield this.connection.query(query, parameters);
            return util_1.isArray(ret) && parseInt(ret[0]['exist']) > 0;
        });
    }
    count(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.queryByJson(model, { fields: 'count(*) as count', condition: condition });
            return util_1.isArray(ret) ? parseInt(ret[0]['count']) : 0;
        });
    }
    create(model, key, entity) {
        if (!key)
            throw new Error('entity key can not be null or undefined');
        const schema = this.getSchema(model);
        let theEntity = schema.newEntity(model, key);
        entity && schema.copyProperties(theEntity, entity);
        let tracked = this.entityTracker.getTrackingEntity(schema, key);
        let exists = tracked !== undefined || this.sessionCache.exists(schema.modelName, key);
        if (exists)
            throw new Error(`entity exists already ( model = '${schema.modelName}' key = '${key}' )`);
        return this.entityTracker.trackNew(schema, theEntity);
    }
    loadEntityByKey(modelName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchemaByName(modelName);
            const where = this.makeByKeyCondition(schema, key);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, where);
            const rows = yield this.connection.query(sql.query, sql.parameters);
            if (rows.length > 1) {
                throw new Error(`entity key is duplicated ( model = '${modelName}' key = '${key}' )`);
            }
            return rows.length === 1 ? rows[0] : undefined;
        });
    }
    load(model, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = this.loadCached(model, key, true);
            if (cached !== undefined)
                return cached;
            const modelName = typeof model === 'string' ? model : model.name;
            const schema = this.getSchemaByName(modelName);
            let tracked = this.entityTracker.getTrackingEntity(schema, key);
            if (tracked)
                return this.undefinedIfDeleted(tracked);
            const entity = yield this.loadEntityByKey(modelName, key);
            if (entity === undefined)
                return undefined;
            this.sessionCache.put(modelName, key, entity);
            return this.entityTracker.trackPersistent(this.getSchemaByName(modelName), entity);
        });
    }
    getChanges() {
        return this.entityTracker.getTrackingChanges();
    }
    loadCached(model, key, track = false) {
        const modelName = typeof model === 'string' ? model : model.name;
        const schema = this.getSchemaByName(modelName);
        const tracked = this.entityTracker.getTrackingEntity(schema, key);
        if (tracked && track)
            return this.undefinedIfDeleted(tracked);
        const entity = this.sessionCache.get(modelName, key);
        if (entity === undefined || !track)
            return entity;
        return this.entityTracker.trackPersistent(schema, entity);
    }
    lockInThisSession(lockName, notThrow = false) {
        if (!this.holdLocks.has(lockName)) {
            this.holdLocks.set(lockName, this.entityTracker.isConfirming);
            return true;
        }
        if (!notThrow)
            throw new Error(`${lockName} exists already`);
        return false;
    }
    /**
     * Save changes to database
     * @returns serial number for saveChanges
     */
    saveChanges(serial) {
        return __awaiter(this, void 0, void 0, function* () {
            const retSerial = serial || ++this.sessionSerial;
            this.log.traceEnabled && this.log.trace(`BEGIN saveChanges ( serial = ${retSerial} )`);
            const sqls = this.trackerSqlBuilder.buildChangeSqls();
            const trans = yield this.connection.beginTrans();
            try {
                yield this.connection.executeBatch(sqls);
                yield trans.commit();
                this.entityTracker.acceptChanges(retSerial);
                this.holdLocks.clear();
                this.sessionSerial = retSerial;
                this.log.traceEnabled && this.log.trace(`SUCCESS saveChanges ( serial = ${retSerial} )`);
                return retSerial;
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`FAILD saveChanges ( serial = ${retSerial} )`, err);
                yield trans.rollback();
                this.entityTracker.rejectChanges();
                throw err;
            }
        });
    }
    /**
     * Rollback saved changes
     * @param changesNO ,this value should be returned by @see saveChanges()
     */
    rollbackChanges(serial) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sessionSerial <= serial)
                return this.sessionSerial;
            const from = this.sessionSerial;
            this.log.traceEnabled && this.log.trace(`BEGIN rollbackChanges ( serial = ${serial} )`);
            const sqls = this.trackerSqlBuilder.buildRollbackChangeSqls(serial + 1);
            const trans = yield this.connection.beginTrans();
            try {
                yield this.connection.executeBatch(sqls);
                yield trans.commit();
                this.entityTracker.rollbackChanges(serial + 1);
                this.holdLocks.clear();
                this.sessionSerial = serial;
                this.log.traceEnabled && this.log.trace(`SUCCESS rollbackChanges (serial : ${from} -> ${this.sessionSerial})`);
                return this.sessionSerial;
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`FAILD rollbackChanges (serial : ${from} -> ${this.sessionSerial})`, err);
                yield trans.rollback();
                throw err;
            }
        });
    }
    clearHistoryBefore(serial) {
        return this.entityTracker.clearHistory(serial);
    }
    get historyVersion() {
        return this.entityTracker.historyVersion;
    }
    update(entity) {
        // do nothing .
    }
    delete(entity) {
        this.entityTracker.trackDelete(entity.__schema__, entity);
    }
    beginTransaction() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.connection.beginTrans();
        });
    }
    beginEntityTransaction() {
        this.entityTracker.beginConfirm();
    }
    commitEntityTransaction() {
        this.entityTracker.confirm();
        this.holdLocks.forEach((v, k) => this.holdLocks[k] = false);
    }
    rollbackEntityTransaction() {
        this.entityTracker.cancelConfirm();
        let removeKeys = new Array();
        this.holdLocks.forEach((v, k) => v && removeKeys.push(k));
        removeKeys.forEach(k => this.holdLocks.delete(k));
    }
}
exports.DbSession = DbSession;


/***/ }),

/***/ "./src/EntityCache.ts":
/*!****************************!*\
  !*** ./src/EntityCache.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const LRU = __webpack_require__(/*! lru-cache */ "lru-cache");
const Common_1 = __webpack_require__(/*! ./Common */ "./src/Common.ts");
const Log_1 = __webpack_require__(/*! ./Log */ "./src/Log.ts");
const util_1 = __webpack_require__(/*! util */ "util");
class LRUEntityCache {
    constructor(options) {
        this.options = options || { default: LRUEntityCache.DEFULT_MAX_CACHED_COUNT };
        // for( let k in this.options ) 
        //   this.options[k] = isNumber(this.options[k]) ? this.options[k] : LRUEntityCache.DEFULT_MAX_CACHED_COUNT
        this.log = Log_1.LogManager.getLogger(LRUEntityCache.name);
        this.modelCaches = new Map();
    }
    getModelCache(modelName, createIfNotExists = false, throwIfNotExists = false) {
        if (createIfNotExists && !this.modelCaches.has(modelName)) {
            // const options = {
            //   max: 500,
            //   length: function (n, key) { return n * 2 + key.length },
            //   //dispose: function (key, n) { n.close() },
            //   maxAge: 1000 * 60 * 60 
            // }
            let maxCachedCount;
            if (!this.options.hasOwnProperty(modelName))
                maxCachedCount = this.options.default;
            else if (util_1.isNumber(this.options[modelName]))
                maxCachedCount = Number(this.options[modelName]);
            else if (util_1.isFunction(this.options[modelName]))
                maxCachedCount = this.options[modelName](modelName);
            else
                maxCachedCount = LRUEntityCache.DEFULT_MAX_CACHED_COUNT;
            maxCachedCount = Math.max(LRUEntityCache.MIN_CACHED_COUNT, maxCachedCount);
            this.modelCaches.set(modelName, new LRU(maxCachedCount));
        }
        if (throwIfNotExists && !this.modelCaches.has(modelName))
            throw new Error(`Model cache ( name = '${modelName}' )  does not exists`);
        return this.modelCaches.get(modelName);
    }
    getCacheKey(key) {
        return Common_1.isPrimitiveKey(key) ? key : key.key;
    }
    clear(modelName) {
        if (util_1.isString(modelName)) {
            this.getModelCache(modelName, false, true).reset();
            this.modelCaches.delete(modelName);
            return;
        }
        for (let c of this.modelCaches.values()) {
            c.reset();
        }
        this.modelCaches.clear();
    }
    get models() {
        let result = new Array();
        for (let m of this.modelCaches.keys()) {
            result.push(m);
        }
        return result;
    }
    get(modelName, key) {
        let modelCache = this.getModelCache(modelName);
        let cacheKey = this.getCacheKey(key);
        return !this.modelCaches.has(modelName) ? undefined :
            modelCache.has(cacheKey) ? modelCache.get(cacheKey) : undefined;
    }
    getAll(modelName, filter) {
        let result = new Array();
        let cache = this.getModelCache(modelName);
        if (cache === undefined)
            return undefined;
        cache.forEach(e => {
            (!filter || (filter && filter(e))) && result.push(e);
        });
        return result;
    }
    put(modelName, key, entity) {
        this.log.traceEnabled && this.log.trace(`put cache, model = ${modelName}, key = ${key}, entity = ${JSON.stringify(entity)}`);
        this.getModelCache(modelName, true).set(this.getCacheKey(key), entity);
    }
    evit(modelName, key) {
        let cacheKey = this.getCacheKey(key);
        this.log.traceEnabled && this.log.trace(`evit cache, model = ${modelName}, key = ${cacheKey}`);
        const modelCache = this.getModelCache(modelName);
        if (modelCache)
            modelCache.del(cacheKey);
    }
    exists(modelName, key) {
        return this.get(modelName, this.getCacheKey(key)) !== undefined;
    }
    existsModel(modelName) {
        return this.getModelCache(modelName, false, false) !== undefined;
    }
    dumpCache() {
        let result = `--------------  DUMP CACHE  ----------------\n\n`;
        this.modelCaches.forEach((cache, model) => {
            result += `--------------Model ${model}----------------\n`;
            cache.forEach((entity, key) => {
                result += `key = ${this.getCacheKey(key)}, entity = {${JSON.stringify(entity)}} \n`;
            });
            result += '\n';
        });
        result += `--------------   END   DUMP  ----------------\n`;
        return result;
    }
}
LRUEntityCache.MIN_CACHED_COUNT = 100;
LRUEntityCache.DEFULT_MAX_CACHED_COUNT = 10000;
exports.LRUEntityCache = LRUEntityCache;


/***/ }),

/***/ "./src/Index.ts":
/*!**********************!*\
  !*** ./src/Index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const sdb = __webpack_require__(/*! ./SmartDB */ "./src/SmartDB.ts");
const model = __webpack_require__(/*! ./Model */ "./src/Model.ts");
const session = __webpack_require__(/*! ./DbSession */ "./src/DbSession.ts");
const sqlite = __webpack_require__(/*! ./SQLDB/SqliteConnection */ "./src/SQLDB/SqliteConnection.ts");
var AschCore;
(function (AschCore) {
    AschCore.SmartDB = sdb.SmartDB;
    AschCore.ModelSchema = model.ModelSchema;
    AschCore.DbSession = session.DbSession;
    AschCore.SqliteConnection = sqlite.SqliteConnection;
})(AschCore = exports.AschCore || (exports.AschCore = {}));


/***/ }),

/***/ "./src/KVDB/LevelDB.ts":
/*!*****************************!*\
  !*** ./src/KVDB/LevelDB.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(/*! util */ "util");
const sub = __webpack_require__(/*! level-sublevel */ "level-sublevel");
const level = __webpack_require__(/*! level */ "level");
const Senondary = __webpack_require__(/*! level-secondary */ "level-secondary");
class SubLevelMeta {
    constructor(subName, keyField, indexFields = new Array()) {
        this.subName = subName;
        this.keyField = keyField;
        this.indexFields = new Array().concat(indexFields);
    }
    findIndexOfFieldName(fieldName) {
        return this.indexFields.findIndex(item => fieldName === item.fieldName);
    }
    existsIndex(fieldName) {
        return this.findIndexOfFieldName(fieldName) > -1;
    }
    addIndex(fieldName, calcIndex) {
        if (this.existsIndex(fieldName))
            throw new Error(`Index of field '${fieldName}' already exists`);
        this.indexFields.push({ fieldName, calcIndex });
        return this;
    }
    removeIndex(fieldName) {
        const idx = this.findIndexOfFieldName(fieldName);
        if (idx > -1) {
            this.indexFields.slice(idx, 1);
        }
        return this;
    }
}
exports.SubLevelMeta = SubLevelMeta;
function makePromise() {
    let callback;
    let promise = new Promise((resolve, reject) => {
        callback = (err, value) => err ? reject(err) : resolve(value);
    });
    callback.promise = promise;
    return callback;
}
function makePromisifyOrCallback(callback) {
    let promise = null;
    if (!callback) {
        callback = makePromise();
        promise = callback['promise'];
    }
    return { callback, promise };
}
class LevelDB {
    constructor(dbDir, meta, options = {}) {
        this.dbDir = dbDir;
        this.subMetas = new Array().concat(meta);
        this.subLevels = new Map();
        this.leveldb = null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.leveldb = level(this.dbDir, { valueEncoding: 'json' });
            this.subLeveldb = sub(this.leveldb);
            this.subMetas.forEach(s => this.registerSubLevel(s));
        });
    }
    registerSubLevel(meta) {
        const sub = this.subLeveldb.sublevel(meta.subName);
        const indexedSub = new IndexedSubLevel(sub, meta.subName, meta.keyField, ...meta.indexFields);
        this.subLevels.set(meta.subName, indexedSub);
    }
    static isKeyNotFoundError(err) {
        return err && err.name === 'NotFoundError';
    }
    get level() {
        return this.leveldb;
    }
    getSubLevel(subName) {
        const sub = this.subLevels.get(subName);
        if (!sub)
            throw new Error(`No such subLevel name = '${subName}'`);
        return sub;
    }
    open(openCallback) {
        let self = this;
        let { callback, promise } = makePromisifyOrCallback(openCallback);
        if (this.isOpen) {
            process.nextTick(callback, null, self);
            return promise;
        }
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.init();
                process.nextTick(callback, null, self);
            }
            catch (err) {
                process.nextTick(callback, err, self);
            }
        }))();
        return promise;
    }
    close(closeCallback) {
        let self = this;
        let { callback, promise } = makePromisifyOrCallback(closeCallback);
        if (this.isClosed) {
            process.nextTick(callback, null, self);
            return promise;
        }
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.leveldb.close();
                this.leveldb = null;
                process.nextTick(callback, null, self);
            }
            catch (err) {
                process.nextTick(callback, err);
            }
        }))();
        return promise;
    }
    get isOpen() {
        return this.leveldb && this.leveldb.isOpen();
    }
    get isClosed() {
        return (!this.leveldb) || this.leveldb.isClosed();
    }
    dump() {
        return new Promise((res, rej) => {
            let result = new Array();
            this.leveldb.createReadStream()
                .on('data', data => result.push(`key= ${data.key}, value= ${data.value}`))
                .on('error', e => rej(e))
                .on('end', () => res(result.join('\r\n')));
        });
    }
}
exports.LevelDB = LevelDB;
class IndexedSubLevel {
    get name() { return this.subName; }
    get indexes() { return this.indexArray; }
    constructor(sublevel, subName, keyField, ...indexFields) {
        this.subLevelDb = sublevel;
        this.subName = subName;
        this.keyField = keyField;
        this.indexArray = new Array().concat(...indexFields);
        this.indexedSubLevels = new Map();
        this.indexArray.forEach(f => {
            let senondary = Senondary(sublevel, f.fieldName, f.calcIndex);
            this.indexedSubLevels.set(f.fieldName, senondary);
        });
    }
    get key() {
        return this.keyField;
    }
    keyNotFoundThenUndefined(callback) {
        return !callback ? undefined : (err, data) => {
            callback(LevelDB.isKeyNotFoundError(err) ? null : err, data);
        };
    }
    get(key, options, getCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyLevel = this.subLevelDb;
            let { callback, promise } = makePromisifyOrCallback(getCallback);
            try {
                keyLevel.get(key, options, this.keyNotFoundThenUndefined(callback));
            }
            catch (err) {
                callback(LevelDB.isKeyNotFoundError(err) ? undefined : err, undefined);
            }
            return promise;
        });
    }
    byIndex(indexFieldName) {
        const levelGet = this.indexedSubLevels.get(indexFieldName);
        if (!levelGet)
            throw new Error(`No such index field = '${indexFieldName}'`);
        return levelGet;
    }
    getBy(indexField, key, getCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const indexLevel = this.byIndex(indexField);
            let { callback, promise } = makePromisifyOrCallback(getCallback);
            try {
                indexLevel.get(key, this.keyNotFoundThenUndefined(callback));
            }
            catch (err) {
                callback(LevelDB.isKeyNotFoundError(err) ? undefined : err, undefined);
            }
            return promise;
        });
    }
    put(key, value, putCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = makePromisifyOrCallback(putCallback);
            try {
                this.subLevelDb.put(key, value, callback);
            }
            catch (err) {
                callback(err, undefined);
            }
            return promise;
        });
    }
    del(key, delCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = makePromisifyOrCallback(delCallback);
            try {
                this.subLevelDb.del(key, callback);
            }
            catch (err) {
                callback(err, undefined);
            }
            return promise;
        });
    }
    batch(array, options, batchCallback) {
        return __awaiter(this, arguments, void 0, function* () {
            if (arguments.length === 0)
                return this.subLevelDb.batch();
            let hasOptions = options && (!util_1.isFunction(options));
            let orginalCallback = hasOptions ? batchCallback : options;
            let { callback, promise } = makePromisifyOrCallback(orginalCallback);
            try {
                if (hasOptions)
                    this.subLevelDb.batch(array, options, callback);
                else
                    this.subLevelDb.batch(array, callback);
            }
            catch (err) {
                callback(err, undefined);
            }
            return promise;
        });
    }
    createReadStream(options) {
        return this.subLevelDb.createReadStream(options);
    }
    createKeyStream(options) {
        return this.subLevelDb.createKeyStream(options);
    }
    createValueStream(options) {
        return this.subLevelDb.createValueStream(options);
    }
}


/***/ }),

/***/ "./src/LevelBlock.ts":
/*!***************************!*\
  !*** ./src/LevelBlock.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LevelDB_1 = __webpack_require__(/*! ./KVDB/LevelDB */ "./src/KVDB/LevelDB.ts");
const LAST_BLOCK_HEIGHT_KEY = '__last_block_height__';
class LevelBlock {
    constructor(dir, levelOptions = {}) {
        /*
          { id(64), timestamp(bigint), height(bigint), payloadLength(bigint), payloadHash(64), prevBlockId(64),
            pointId(64), pointHeight(bigint), delegate(64), signature(128), count(bigint) }
        */
        const blockMeta = new LevelDB_1.SubLevelMeta('blk', 'height', [
            { fieldName: 'id' },
            { fieldName: 'delegate' }
        ]);
        const changesLogMeta = new LevelDB_1.SubLevelMeta('his', 'height', []);
        this.db = new LevelDB_1.LevelDB(dir, [blockMeta, changesLogMeta], levelOptions);
        this.lastHeight = -1;
    }
    getLastBlockHeightFromDb() {
        return __awaiter(this, void 0, void 0, function* () {
            let lastBlockHeightItem = yield this.blockDb.get(LAST_BLOCK_HEIGHT_KEY, {});
            if (lastBlockHeightItem === undefined) {
                lastBlockHeightItem = this.getLastHeightJson(-1);
                yield this.blockDb.put(LAST_BLOCK_HEIGHT_KEY, lastBlockHeightItem);
            }
            return lastBlockHeightItem.height;
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.open();
            this.blockDb = this.db.getSubLevel('blk');
            this.historyDb = this.db.getSubLevel('his');
            this.lastHeight = yield this.getLastBlockHeightFromDb();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.close();
        });
    }
    get lastBlockHeight() {
        return this.lastHeight;
    }
    isKeyNotFoundError(e) {
        return e.name === 'NotFoundError';
    }
    getLastHeightJson(lastHeight) {
        return {
            height: lastHeight,
            id: 'NULL',
            delegate: 'NULL'
        };
    }
    appendBlock(block, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!block || !block.id || !block.delegate || block.height === undefined)
                throw new Error(`Invalid block data`);
            yield this.historyDb.put(block.height, changes);
            yield this.blockDb.batch([
                { type: 'put', key: block.height, value: block },
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: this.getLastHeightJson(block.height) }
            ]);
            this.lastHeight = block.height;
        });
    }
    getBlock(height) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.blockDb.get(height);
            }
            catch (e) {
                if (!this.isKeyNotFoundError(e))
                    throw e;
            }
            return undefined;
        });
    }
    getHistoryChanges(minHeight, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = new Map();
            for (let h = minHeight; h < maxHeight; h++) {
                const changes = yield this.historyDb.get(h);
                changes && ret.set(h, changes);
            }
            return ret;
        });
    }
    deleteLastBlock(height) {
        return __awaiter(this, void 0, void 0, function* () {
            if (height !== this.lastBlockHeight)
                throw new Error(`invalid last block height '${height}'`);
            yield this.blockDb.batch([
                { type: 'del', key: height },
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: this.getLastHeightJson(height - 1) }
            ]);
            yield this.historyDb.del(height);
            this.lastHeight--;
        });
    }
    getBlockById(blockId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.blockDb.getBy('id', blockId);
        });
    }
    getBlocksByHeightRange(minHeight, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = new Array();
            for (let h = minHeight; h <= maxHeight; h++) {
                let block = yield this.getBlock(h);
                block && result.push(block);
            }
            return result;
        });
    }
    getBlocksByIds(blockIds) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = new Array();
            for (let i = 0; i < blockIds.length; i++) {
                let block = yield this.getBlockById(blockIds[i]);
                block && ret.push(block);
            }
            return ret;
        });
    }
}
exports.LevelBlock = LevelBlock;


/***/ }),

/***/ "./src/Log.ts":
/*!********************!*\
  !*** ./src/Log.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["All"] = 127] = "All";
    LogLevel[LogLevel["Trace"] = 64] = "Trace";
    LogLevel[LogLevel["Debug"] = 32] = "Debug";
    LogLevel[LogLevel["Log"] = 16] = "Log";
    LogLevel[LogLevel["Info"] = 8] = "Info";
    LogLevel[LogLevel["Warn"] = 4] = "Warn";
    LogLevel[LogLevel["Error"] = 2] = "Error";
    LogLevel[LogLevel["Fatal"] = 1] = "Fatal";
    LogLevel[LogLevel["None"] = 0] = "None";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class LoggerAdapter {
    get infoEnabled() { return (this.level & LogLevel.Info) > 0; }
    get traceEnabled() { return (this.level & LogLevel.Trace) > 0; }
    get debugEnabled() { return (this.level & LogLevel.Debug) > 0; }
    get logEnabled() { return (this.level & LogLevel.Log) > 0; }
    get warnEnabled() { return (this.level & LogLevel.Warn) > 0; }
    get errorEnaled() { return (this.level & LogLevel.Error) > 0; }
    get fatalEnabled() { return (this.level & LogLevel.Fatal) > 0; }
    get logLevel() { return this.level; }
    set logLevel(level) { this.level = level; }
    constructor(getLogger, formatMessage = false, loggerName, level = LogLevel.All) {
        this.name = loggerName;
        this.level = level;
        this.getLogger = getLogger;
        this.format = formatMessage;
    }
    fromatMessage(msg, logType) {
        return `${new Date().toLocaleTimeString()} [${logType}] [${this.name}] ${msg}`;
    }
    info(msg, ...params) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'INFO');
        this.getLogger().info(msg, ...params);
    }
    debug(msg, ...params) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'DEBUG');
        this.getLogger().debug(msg, ...params);
    }
    log(msg, ...params) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'LOG');
        this.getLogger().debug(msg, ...params);
    }
    trace(msg, ...params) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'TRACE');
        this.getLogger().debug(msg, ...params);
    }
    warn(msg, ...params) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'WARN');
        this.getLogger().warn(msg, ...params);
    }
    error(msg, err) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'ERROR');
        this.getLogger().error(msg, err);
    }
    fatal(msg, err) {
        msg = !this.format ? msg : this.fromatMessage(msg, 'FATAL');
        this.getLogger().error(msg, err);
    }
}
class LogManager {
    static set defaultLevel(level) {
        LogManager.defaultLogLevel = level;
    }
    static set logFactory(value) {
        LogManager.createLogger = value;
    }
    static getLogger(loggerName, level) {
        return loggerName ?
            new LoggerAdapter(LogManager.createLogger, true, loggerName, level || LogManager.defaultLogLevel) :
            LogManager.defaultLogger;
    }
}
LogManager.defaultLogLevel = LogLevel.All;
LogManager.createLogger = () => console;
LogManager.defaultLogger = new LoggerAdapter(LogManager.createLogger, true, 'default', LogManager.defaultLogLevel);
exports.LogManager = LogManager;


/***/ }),

/***/ "./src/Model.ts":
/*!**********************!*\
  !*** ./src/Model.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(/*! util */ "util");
const Common_1 = __webpack_require__(/*! ./Common */ "./src/Common.ts");
var FieldTypes;
(function (FieldTypes) {
    FieldTypes["String"] = "String";
    FieldTypes["Number"] = "Number";
    FieldTypes["BigInt"] = "BigInt";
    FieldTypes["Text"] = "Text";
})(FieldTypes = exports.FieldTypes || (exports.FieldTypes = {}));
class CompositeKey {
    constructor(keyObject) {
        Common_1.CodeContract.argument('keyObject', () => Common_1.CodeContract.notNull(keyObject));
        this.keyObject = keyObject;
    }
    static make(schema, entity) {
        Common_1.CodeContract.argument('schema', () => Common_1.CodeContract.notNull(schema));
        Common_1.CodeContract.argument('schema', schema.isCompsiteKey, 'model must indentify by composite key');
        Common_1.CodeContract.argument('entity', () => Common_1.CodeContract.notNull(entity));
        return new CompositeKey(Common_1.partial(entity, schema.compositeKeys));
    }
    static fromString(keyJsonString) {
        Common_1.CodeContract.argument('keyJsonString', () => Common_1.CodeContract.notNullOrWhitespace(keyJsonString));
        return new CompositeKey(JSON.parse(keyJsonString).keyObject);
    }
    get keyJson() {
        return this.keyObject;
    }
    get key() {
        return JSON.stringify(this.keyObject);
    }
    toString() {
        return this.key;
    }
}
exports.CompositeKey = CompositeKey;
function isCompositeKey(key) {
    if (!key)
        return false;
    return key.keyJson;
}
exports.isCompositeKey = isCompositeKey;
class ModelSchema {
    constructor(schema, name) {
        this.schema = Object.assign({}, schema);
        this.name = name;
        this.memory = schema.memory === true;
        this.readonly = schema.readonly === true;
        this.local = schema.local === true;
        this.attachVersionField(this.schema);
        this.parseFields();
    }
    attachVersionField(schema) {
        if (schema.tableFields.find(f => f.name === '_version_'))
            return;
        schema.tableFields.push({
            name: '_version_',
            type: FieldTypes.Number,
            default: 0
        });
    }
    convertType(type) {
        return type;
    }
    parseFields() {
        const primaryKeys = this.schema.tableFields.filter(f => f.primary_key === true).map(f => f.name);
        this.cKeys = this.schema.tableFields.filter(f => f.composite_key === true).map(f => f.name);
        this.pKey = primaryKeys.length === 1 ? primaryKeys[0] : undefined;
        let keyValid = (this.pKey !== undefined) !== (this.cKeys.length > 1);
        if (!keyValid)
            throw new Error(`model must have primary key or composite keys, but can not both`);
        this.allFieldTypes = new Map();
        this.schema.tableFields.forEach(f => this.allFieldTypes.set(f.name, this.convertType(f.type)));
        this.allFields = this.schema.tableFields.map(f => f.name);
        this.allIndexes = this.schema.tableFields.filter(f => f.index === true).map(f => f.name);
    }
    getFieldTypes(schema) {
        return this.allFieldTypes;
    }
    get schemaObject() {
        return this.schema;
    }
    get isCompsiteKey() {
        return this.compositeKeys.length > 1;
    }
    get primaryKey() {
        return this.pKey;
    }
    get compositeKeys() {
        return this.cKeys;
    }
    get fieldNames() {
        return this.allFields;
    }
    get indexes() {
        return this.allIndexes;
    }
    get modelName() {
        return this.name;
    }
    get isLocal() {
        return this.local;
    }
    get isReadonly() {
        return this.readonly;
    }
    get memCached() {
        return this.memory;
    }
    setKey(entity, key) {
        if (!this.isCompsiteKey) {
            entity[this.primaryKey] = key;
        }
        else {
            const ck = key;
            this.cKeys.forEach(f => entity[f] = ck.keyJson[f]);
        }
        return entity;
    }
    getKey(entity) {
        return this.isCompsiteKey ?
            CompositeKey.make(this, entity) :
            entity[this.primaryKey];
    }
    newEntity(model, key) {
        let entity = util_1.isString(model) ?
            {} :
            new model();
        this.setDefaultValues(entity);
        return this.setKey(entity, key);
    }
    setDefaultValues(entity) {
        this.schema.tableFields.forEach(f => {
            f.default !== undefined && (entity[f.name] = f.default);
        });
    }
    copyProperties(dest, src, includeKey = false) {
        this.allFields.forEach(f => {
            let needCopy = (includeKey || (this.cKeys.indexOf(f) < 0 && f !== this.primaryKey)) && src[f] !== undefined;
            if (needCopy)
                dest[f] = src[f];
        });
    }
}
exports.ModelSchema = ModelSchema;


/***/ }),

/***/ "./src/SQLDB/SqlBuilder.ts":
/*!*********************************!*\
  !*** ./src/SQLDB/SqlBuilder.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const util_1 = __webpack_require__(/*! util */ "util");
const JsonSql = __webpack_require__(/*! json-sql */ "json-sql")({ separatedValues: false });
const changeCase = __webpack_require__(/*! change-case */ "change-case");
exports.MULTI_SQL_SEPARATOR = ';';
// 'create'|'select'|'update'|'remove'|'other'
var SqlType;
(function (SqlType) {
    SqlType[SqlType["Schema"] = 0] = "Schema";
    SqlType[SqlType["Select"] = 1] = "Select";
    SqlType[SqlType["Insert"] = 2] = "Insert";
    SqlType[SqlType["Update"] = 3] = "Update";
    SqlType[SqlType["Delete"] = 4] = "Delete";
    SqlType[SqlType["Other"] = 9] = "Other";
})(SqlType = exports.SqlType || (exports.SqlType = {}));
class JsonSqlBuilder {
    getTableName(modelName) {
        return changeCase.snakeCase(modelName) + 's';
    }
    getPrimaryKeyCondition(schema, key) {
        return schema.setKey({}, key);
    }
    buildSchema(schema) {
        let sqls = new Array();
        const schemaObject = Object.assign({ type: 'create' }, Common_1.deepCopy(schema.schemaObject));
        // TODO: generate composite key sql
        let schemaSql = JsonSql.build(schemaObject);
        sqls.push(schemaSql.query);
        const tableName = this.getTableName(schema.modelName);
        schema.indexes.forEach(field => {
            sqls.push(JsonSql.build({
                type: 'index',
                table: tableName,
                name: tableName + '_' + field,
                indexOn: field
            }).query);
        });
        return sqls;
    }
    buildInsert(schema, fieldValues) {
        let sp = { type: SqlType.Insert };
        return Object.assign(sp, JsonSql.build({
            type: 'insert',
            table: this.getTableName(schema.modelName),
            values: fieldValues
        }));
    }
    buildDelete(schema, key) {
        let sp = { type: SqlType.Delete };
        return Object.assign(sp, JsonSql.build({
            type: 'remove',
            table: this.getTableName(schema.modelName),
            condition: this.getPrimaryKeyCondition(schema, key)
        }));
    }
    buildUpdate(schema, key, fieldValues, version) {
        // const modifier = this.escapeSingleQuote(fieldValues)
        const tableName = this.getTableName(schema.modelName);
        let condition = this.getPrimaryKeyCondition(schema, key);
        condition['_version_'] = version;
        let sp = { type: SqlType.Update };
        return Object.assign(sp, JsonSql.build({
            type: 'update',
            table: tableName,
            modifier: fieldValues,
            condition: condition
        }));
    }
    buildSelect(schema, fieldsOrParams, where, resultRange, sort, join) {
        const tableName = this.getTableName(schema.modelName);
        let queryOptions;
        if (!util_1.isArray(fieldsOrParams)) {
            let params = fieldsOrParams;
            queryOptions = Object.assign({ type: 'select', table: tableName }, params);
        }
        else {
            let fields = fieldsOrParams || schema.fieldNames.map(f => schema.schemaObject.table + '.' + f);
            let lo = util_1.isNumber(resultRange) ? { limit: resultRange } : resultRange || {};
            let order = sort || {};
            for (let key of Reflect.ownKeys(order)) {
                let orderValue = order[key] || -1;
                order[key] = (orderValue === 'ASC') ? 1 : ((orderValue === 'DESC') ? -1 : orderValue);
            }
            queryOptions = {
                type: 'select',
                table: tableName,
                fields: fields,
                condition: where,
                limit: lo.limit,
                offset: lo.offset,
                sort: order,
                join: join
            };
        }
        let sp = { type: SqlType.Select };
        return Object.assign(sp, JsonSql.build(queryOptions));
    }
}
exports.JsonSqlBuilder = JsonSqlBuilder;


/***/ }),

/***/ "./src/SQLDB/SqliteConnection.ts":
/*!***************************************!*\
  !*** ./src/SQLDB/SqliteConnection.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const SqliteWrapper_1 = __webpack_require__(/*! ./SqliteWrapper */ "./src/SQLDB/SqliteWrapper.ts");
const SqlBuilder_1 = __webpack_require__(/*! ./SqlBuilder */ "./src/SQLDB/SqlBuilder.ts");
class SqliteTransaction {
    constructor(connection) {
        this.connection = connection;
    }
    commit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.execute('COMMIT;');
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.execute('ROLLBACK;');
        });
    }
}
class SqliteConnection {
    constructor(options) {
        this.options = options;
        this.sqlite = new SqliteWrapper_1.SqliteWrapper();
    }
    get connectionOptions() {
        return this.options;
    }
    get isConnected() {
        return this.sqlite.isConnected;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sqlite.asynOpen(this.options.storage);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sqlite.asynClose();
        });
    }
    query(sql, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sqlite.asynQuery(sql, parameters);
        });
    }
    querySync(sql, parameters) {
        return this.sqlite.query(sql, parameters);
    }
    ensureExecuteEffected(result) {
        if (result.rowsEffected === 0)
            throw new Error('None row effected');
    }
    executeBatchSync(sqls) {
        return this.sqlite.executeBatch(sqls || [], this.ensureExecuteEffected);
    }
    executeBatch(sqls) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.sqlite.asyncExecuteBatch(sqls || [], this.ensureExecuteEffected);
        });
    }
    executeSync(sql, parameters, throwIfNoneEffected = false) {
        const result = this.sqlite.execute(sql, parameters);
        throwIfNoneEffected && this.ensureExecuteEffected(result);
        return result;
    }
    execute(sql, parameters, throwIfNoneEffected = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.sqlite.asynExecute(sql, parameters);
            throwIfNoneEffected && this.ensureExecuteEffected(result);
            return result;
        });
    }
    runScript(sql) {
        return __awaiter(this, void 0, void 0, function* () {
            sql.split(SqlBuilder_1.MULTI_SQL_SEPARATOR).forEach((sql) => __awaiter(this, void 0, void 0, function* () { return (yield (sql.trim() !== '')) && this.sqlite.execute(sql, []); }));
        });
    }
    beginTrans() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.execute('BEGIN TRANSACTION;');
            return new SqliteTransaction(this);
        });
    }
}
exports.SqliteConnection = SqliteConnection;


/***/ }),

/***/ "./src/SQLDB/SqliteWrapper.ts":
/*!************************************!*\
  !*** ./src/SQLDB/SqliteWrapper.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __webpack_require__(/*! util */ "util");
const Log_1 = __webpack_require__(/*! ../Log */ "./src/Log.ts");
const Database = __webpack_require__(/*! better-sqlite3 */ "better-sqlite3");
class SqliteWrapper {
    constructor() {
        this.log = Log_1.LogManager.getLogger(SqliteWrapper.name);
    }
    open(dbFilePath, callback) {
        let ret = { err: null, result: true };
        try {
            this.db = new Database(dbFilePath);
            this.log.traceEnabled && this.log.trace(`SUCCESS open ( db = ${dbFilePath} )`);
        }
        catch (err) {
            ret = { err: err, result: false };
            this.log.errorEnaled && this.log.error(`FAILD open ( db = ${dbFilePath} )`, err);
            if (!callback)
                throw err;
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    get isConnected() { return this.db.open; }
    asynOpen(dbFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(this.open).call(this, dbFilePath);
        });
    }
    close(callback) {
        let ret = { err: null, result: true };
        try {
            if (this.db && this.isConnected) {
                this.db.close();
                this.log.traceEnabled && this.log.trace(`SUCCESS close`);
            }
            else {
                this.log.infoEnabled && this.log.info(`closed already`);
            }
        }
        catch (err) {
            ret = { err: err, result: false };
            this.log.errorEnaled && this.log.error(`FAILD close`, err);
            if (!callback)
                throw err;
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    asynClose() {
        return util_1.promisify(this.close).call(this);
    }
    execute(sql, parameters, callback) {
        let ret = { err: null, result: { lastInsertRowId: '0', rowsEffected: 0 } };
        try {
            const sqlResult = this.db.prepare(sql).run(parameters || []);
            ret.result = {
                lastInsertRowId: sqlResult.lastInsertROWID.toString(),
                rowsEffected: sqlResult.changes
            };
            this.log.traceEnabled && this.log.trace(`SUCCESS execute sql = ${sql} param = ${JSON.stringify(parameters)}, effected = ${ret.result.rowsEffected}`);
        }
        catch (err) {
            ret.err = err;
            this.log.errorEnaled && this.log.error(`FAILD execute sql = ${sql} param = ${JSON.stringify(parameters)}`, err);
            if (!callback)
                throw err;
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    query(sql, parameters, callback) {
        let ret = { err: null, result: new Array() };
        try {
            ret.result = this.db.prepare(sql).all(parameters || []);
            this.log.traceEnabled && this.log.trace(`SUCCESS query sql = ${sql} param = ${JSON.stringify(parameters)}, result count = ${ret.result.length}`);
        }
        catch (err) {
            ret.err = err;
            this.log.errorEnaled && this.log.error(`FAILD query sql = ${sql} param = ${JSON.stringify(parameters)}`, err);
            if (!callback)
                throw err;
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    executeBatch(sqls, onExecuted, callback) {
        let ret = { err: null, result: new Array() };
        let sql;
        try {
            sqls.forEach(s => {
                sql = s;
                let execRet = this.execute(s.query, s.parameters);
                onExecuted && onExecuted(execRet, s);
                ret.result.push(execRet);
            });
        }
        catch (err) {
            ret.err = err;
            this.log.errorEnaled && this.log.error(`FAILD executeBatch, sql = ${sql.query} param = ${JSON.stringify(sql.parameters)}`, err);
            if (!callback)
                throw err;
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    asynExecute(sql, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(this.execute).call(this, sql, parameters);
        });
    }
    asynQuery(sql, parameters) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.promisify(this.query).call(this, sql, parameters);
        });
    }
    asyncExecuteBatch(sqls, onExecuted) {
        return util_1.promisify(this.executeBatch).call(this, sqls, onExecuted);
    }
}
exports.SqliteWrapper = SqliteWrapper;


/***/ }),

/***/ "./src/SmartDB.ts":
/*!************************!*\
  !*** ./src/SmartDB.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __webpack_require__(/*! events */ "events");
const util_1 = __webpack_require__(/*! util */ "util");
const Common_1 = __webpack_require__(/*! ./Common */ "./src/Common.ts");
const LevelBlock_1 = __webpack_require__(/*! ./LevelBlock */ "./src/LevelBlock.ts");
const DbSession_1 = __webpack_require__(/*! ./DbSession */ "./src/DbSession.ts");
const SqliteConnection_1 = __webpack_require__(/*! ./SQLDB/SqliteConnection */ "./src/SQLDB/SqliteConnection.ts");
const Model_1 = __webpack_require__(/*! ./Model */ "./src/Model.ts");
const Log_1 = __webpack_require__(/*! ./Log */ "./src/Log.ts");
const EntityProxy_1 = __webpack_require__(/*! ./StateTracker/EntityProxy */ "./src/StateTracker/EntityProxy.ts");
const BlockCache_1 = __webpack_require__(/*! ./BlockCache */ "./src/BlockCache.ts");
/**
 * ORM like to operate blockchain data
 * @event ready emmit after initialized
 * @event close emmit after closed
 */
class SmartDB extends events_1.EventEmitter {
    /**
     * Constructor
     * NOTIC : you need call init before use SmartDB
     * @param dbPath path of blockchain db
     * @param levelBlockDir path of block header db
     * @param options of SmartDB
     */
    constructor(dbPath, levelBlockDir, options) {
        Common_1.CodeContract.argument('dbPath', () => Common_1.CodeContract.notNullOrWhitespace(dbPath));
        Common_1.CodeContract.argument('levelBlockDir', () => Common_1.CodeContract.notNullOrWhitespace(levelBlockDir));
        super();
        this.options = {
            cachedBlockCount: 10,
            historyForRollback: 10,
            autoCleanPersistedHistory: false,
            entityCacheOptions: { default: 5000 }
        } || options;
        this.commitBlockHooks = new Array();
        this.rollbackBlockHooks = new Array();
        this.schemas = new Map();
        this.log = Log_1.LogManager.getLogger(SmartDB.name);
        this.blockDB = new LevelBlock_1.LevelBlock(levelBlockDir);
        this.cachedBlocks = new BlockCache_1.BlockCache(this.options.cachedBlockCount);
        this.connection = new SqliteConnection_1.SqliteConnection({ storage: dbPath });
        this.blockSession = new DbSession_1.DbSession(this.connection, this.options.entityCacheOptions, 'Block');
        this.localSession = new DbSession_1.DbSession(this.connection, this.options.entityCacheOptions, 'Local');
    }
    getSchema(model, throwIfUndefined = false, throwIfReadonly = false) {
        const modelName = util_1.isString(model) ? String(model) : model.name;
        let schema = this.schemas.get(modelName);
        throwIfUndefined && Common_1.CodeContract.verify(schema !== undefined, `unregistered model '${modelName}'`);
        throwIfReadonly && Common_1.CodeContract.verify(!schema.isReadonly, `model '${modelName}' is readonly`);
        return schema;
    }
    getSession(schema) {
        return schema.isLocal ? this.localSession : this.blockSession;
    }
    preCommitBlock(block) {
        this.commitBlockHooks.forEach(nh => nh.hook(block));
    }
    postCommitBlock(block) {
        this.emit('newBlock', block);
    }
    preRollbackBlock(from, to) {
        this.rollbackBlockHooks.forEach(nh => nh.hook(from, to));
    }
    postRollbackBlock(from, to) {
        this.emit('rollbackBlock', { from, to });
    }
    /**
     * register commit block hook, which will be called before commit block
     * @param name hook name
     * @param hookFunc hook function , ( block ) => void
     */
    registerCommitBlockHook(name, hookFunc) {
        Common_1.CodeContract.argument('hookFunc', () => Common_1.CodeContract.notNull(hookFunc));
        Common_1.CodeContract.argument('name', () => Common_1.CodeContract.notNullOrWhitespace(name));
        Common_1.CodeContract.argument('name', this.commitBlockHooks.find(nh => nh.name === name.trim()) === undefined, `hook named '${name}' exist already`);
        this.commitBlockHooks.push({ name, hook: hookFunc });
    }
    /**
     * unregister commit block hook
     * @param name hook name
     */
    unregisterCommitBlockHook(name) {
        Common_1.CodeContract.argument('name', () => Common_1.CodeContract.notNullOrWhitespace(name));
        let index = this.commitBlockHooks.findIndex(nh => nh.name === name.trim());
        if (index >= 0)
            this.commitBlockHooks.slice(index);
    }
    /**
     * register rollback block hook, which will be called before commit block
     * @param name hook name
     * @param hookFunc hook function , ( fromHeight, toHeight ) => void
     */
    registerRollbackBlockHook(name, hookFunc) {
        Common_1.CodeContract.argument('hookFunc', () => Common_1.CodeContract.notNull(hookFunc));
        Common_1.CodeContract.argument('name', () => Common_1.CodeContract.notNullOrWhitespace(name));
        Common_1.CodeContract.argument('name', this.rollbackBlockHooks.find(nh => nh.name === name.trim()) === undefined, `hook named '${name}' exist already`);
        this.rollbackBlockHooks.push({ name, hook: hookFunc });
    }
    /**
     * unregister rollback block hook
     * @param name hook name
     */
    unregisterRollbackBlockHook(name) {
        Common_1.CodeContract.argument('name', () => Common_1.CodeContract.notNullOrWhitespace(name));
        let index = this.rollbackBlockHooks.findIndex(nh => nh.name === name.trim());
        if (index >= 0)
            this.rollbackBlockHooks.slice(index);
    }
    /**
     * initialize SmartDB , you need call this before use SmartDB
     * @param schemas table schemas in Database
     */
    init(schemas) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('schemas', () => Common_1.CodeContract.notNull(schemas));
            yield this.connection.connect();
            yield this.blockDB.open();
            for (const schema of schemas) {
                this.schemas.set(schema.modelName, schema);
                let session = this.getSession(schema);
                session.registerSchema(schema);
                session.syncSchema(schema);
                this.log.infoEnabled && this.log.info(`sync schema model = ${schema.modelName} `);
                if (schema.memCached) {
                    let items = yield session.getMany(schema.modelName, {}, false, true);
                    this.log.infoEnabled && this.log.info(`model ${schema.modelName} cached ${items.length} entities `);
                }
            }
            ;
            this.emit('ready', this);
        });
    }
    /**
     * free resources
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.blockSession.close();
            yield this.localSession.close();
            yield this.blockDB.close();
            this.emit('closed', this);
        });
    }
    /**
     * height of last block
     */
    get lastBlockHeight() {
        return this.blockDB.lastBlockHeight;
    }
    /**
     * blocks count
     */
    get blocksCount() {
        return this.lastBlockHeight + 1;
    }
    /**
     * last commited block
     */
    get lastBlock() {
        // TODO: return last block copy ?
        return this.cachedBlocks.get(this.lastBlockHeight);
    }
    /**
     * hold a lock name which only succeed in first time of each block.
     * @param lockName lock name
     * @param notThrow do not throw exception if lock failed
     */
    lockInCurrentBlock(lockName, notThrow = false) {
        return this.blockSession.lockInThisSession(lockName, notThrow);
    }
    /**
     * begin a contract transaction which effect entities in memory
     */
    beginContract() {
        this.blockSession.beginEntityTransaction();
    }
    /**
     * commit contract transaction which effect entities in memory
     */
    commitContract() {
        this.blockSession.commitEntityTransaction();
    }
    /**
     * rollback contract transaction which effect entities in memory
     */
    rollbackContract() {
        this.blockSession.rollbackEntityTransaction();
    }
    /**
     * begin a new block
     * @param blockHeader
     */
    beginBlock(block) {
        // TODO: verify blockHeader here
        Common_1.CodeContract.argument('block', () => Common_1.CodeContract.notNull(block));
        Common_1.CodeContract.argument('block', block.height === this.lastBlockHeight + 1, `invalid block height ${block.height}, last = ${this.lastBlockHeight}`);
        this.log.infoEnabled && this.log.info(`BEGIN block height = ${block.height}`);
        this.currentBlock = block;
    }
    /**
     * commit block changes
     */
    commitBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentBlock)
                throw new Error('Current block is null');
            this.log.traceEnabled && this.log.trace(`BEGIN commitBlock height = ${this.currentBlock.height}`);
            // for hook
            this.preCommitBlock(this.currentBlock);
            let blockHeader = Object.assign({}, this.currentBlock);
            Reflect.deleteProperty(blockHeader, 'transactions');
            yield this.blockDB.appendBlock(blockHeader, this.blockSession.getChanges());
            try {
                yield this.blockSession.saveChanges(this.currentBlock.height);
                this.blockSession.clearHistoryBefore(this.currentBlock.height - this.options.historyForRollback);
                this.cachedBlocks.put(this.currentBlock);
                this.currentBlock = null;
                // emit event
                this.postCommitBlock(this.lastBlock);
                this.log.infoEnabled && this.log.info(`SUCCESS commitBlock height = ${this.lastBlockHeight}`);
                return this.lastBlockHeight;
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`FAILD commitBlock ( height = ${this.currentBlock.height} )`, err);
                yield this.blockDB.deleteLastBlock(this.currentBlock.height);
                throw err;
            }
        });
    }
    /**
     * rollback block changes
     * @param height rollback to height(exclude)
     */
    rollbackBlock(height) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('height', !height || height <= this.lastBlockHeight, `height must less or equal lastBlockHeight ${this.lastBlockHeight}`);
            const fromHeight = this.currentBlock ? this.currentBlock.height : this.lastBlockHeight;
            const toHeight = height === undefined ? this.lastBlockHeight : height;
            this.log.traceEnabled && this.log.trace(`BEGIN rollbackBlock ( height : ${fromHeight} -> ${toHeight} )`);
            // for hook
            this.preRollbackBlock(fromHeight, toHeight);
            try {
                const ver = this.blockSession.historyVersion;
                if (fromHeight < ver.min) { // load history from leveldb, if cached history less than rollback height 
                    let history = yield this.blockDB.getHistoryChanges(fromHeight, ver.min);
                    this.blockSession.attachHistory(history);
                }
                yield this.blockSession.rollbackChanges(toHeight);
                while (this.lastBlockHeight > toHeight) {
                    yield this.blockDB.deleteLastBlock(this.lastBlockHeight);
                    this.cachedBlocks.evit(this.lastBlockHeight, this.lastBlockHeight);
                }
                this.currentBlock = null;
                // emit event
                this.postRollbackBlock(fromHeight, toHeight);
                this.log.infoEnabled && this.log.info(`SUCCESS rollbackBlock ( height : ${fromHeight} -> ${toHeight} )`);
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`FAILD rollbackBlock ( height : ${fromHeight} -> ${toHeight} )`, err);
                throw err;
            }
        });
    }
    /**
     * save local tables (not in block --- which define in schema by local : true) changes to database
     * @returns serial number for changes
     */
    saveLocalChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            let serial = yield this.localSession.saveChanges();
            this.localSession.clearHistoryBefore(serial);
            return serial;
        });
    }
    /**
     * rollback local tables changes saveLocalChanges
     * @param serial serial number return from saveLocalChanges
     */
    rollbackLocalChanges(serial) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('serial', serial >= 0, `serial must great or equal zero`);
            yield this.localSession.rollbackChanges(serial);
            this.localSession.clearHistoryBefore(serial);
        });
    }
    /**
     * get entity key
     * @param model model modelName or model type
     * @param entity entity
     */
    getEntityKey(model, entity) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('entity', () => Common_1.CodeContract.notNull(entity));
        const schema = this.getSchema(model, true);
        return schema.getKey(entity);
    }
    /**
     * get tracking entity
     * @param model model modelName or model type
     * @param entity entity
     * @returns tracked entity or undefined
     */
    attach(model, entity) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            Common_1.CodeContract.argument('entity', () => Common_1.CodeContract.notNull(entity));
            let key = this.getEntityKey(model, entity);
            Common_1.CodeContract.argument('entity', key !== undefined, 'can not get entity key');
            let schema = this.getSchema(model, true, true);
            return this.getSession(schema).load(model, key);
        });
    }
    /**
     * create a new entity which change will be tracked and persistented (by saveChanges) automatically
     * @param model modelName or model type
     * @param key entity key which uniqued in database
     * @param entity prototype entity which properties will copy to result entity
     * @returns tracking entity
     */
    create(model, keyOrEntity) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('keyOrEntity', () => Common_1.CodeContract.notNull(keyOrEntity));
        let key;
        let entity;
        let schema = this.getSchema(model, true, true);
        if (Common_1.isPrimitiveKey(keyOrEntity) || Model_1.isCompositeKey(keyOrEntity)) {
            key = keyOrEntity;
        }
        else {
            entity = keyOrEntity;
            key = schema.getKey(entity);
        }
        return this.getSession(schema).create(model, key, entity);
    }
    /**
     * update a entity
     * @param model modelName or model type
     * @param entity
     */
    // public update<TEntity>( model : ModelNameOrType<TEntity>, entity: TEntity ) : void {
    //   DBC.argument('model', () => DBC.notNull(model))
    //   DBC.argument('entity', entity && EntityProxy.isProxied(entity), `is not a proxied object` )
    //   let schema = this.getSchema( model, true, true )
    //   this.getSession(schema!).update(entity)
    // }
    /**
     * delete a entity
     * @param model modelName or model type
     * @param entity
     */
    delete(model, entity) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('entity', entity && EntityProxy_1.EntityProxy.isProxied(entity), 'is not a tracking entity');
        let schema = this.getSchema(model, true, true);
        this.getSession(schema).delete(entity);
    }
    /**
     * load entity from cache and database
     * @param model model name or model type
     * @param key key of entity
     */
    get(model, key) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).load(model, key);
        });
    }
    /**
     * load entity from database by condition
     * @param model model name or model type
     * @param condition see type SqlCondition
     * @param track track and cache result if true
     */
    getBy(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            Common_1.CodeContract.argument('condition', () => Common_1.CodeContract.notNull(condition));
            let schema = this.getSchema(model, true);
            let session = this.getSession(schema);
            let items = yield session.getMany(model, condition, false, true);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}', condition = '${JSON.stringify(condition)}' )`);
            return items.length === 0 ? undefined : this.attach(model, items[0]);
        });
    }
    /**
   * get entities from database
   * @param model model name or model type
   * @param condition find condition, see type SqlCondition
   * @param track track and cache result if true
   */
    getMany(model, condition, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).getMany(model, condition, track);
        });
    }
    /**
     * load entity from cache only
     * @param model model name or model type
     * @param key key of entity
     * @returns tracked entity from cache
     */
    getCached(model, key) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).loadCached(model, key, true);
    }
    /**
     * get all cached entities
     * @param model model name or model type
     * @param filter filter result
     */
    getAllCached(model, filter) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).getAllCached(model, filter);
    }
    /**
     * find entities from database
     * @param model model name or model type
     * @param condition query condition, see type SqlCondition
     * @param resultRange limit and offset of results number or json, eg: 10 or { limit : 10, offset : 1 }
     * @param sort json { fieldName : 'ASC' | 'DESC' } , eg: { name : 'ASC', age : 'DESC' }
     * @param fields result fields, default is all fields
     * @param offset offset of result set
     * @param join join info
     */
    find(model, condition, resultRange, sort, fields, join) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).query(model, condition, resultRange, sort, fields, join);
        });
    }
    /**
     * find entities from database
     * @param model model name or model type
     * @param params mango like query params object
     */
    findOne(model, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = yield this.findAll(model, params);
            let schema = this.getSchema(model, true);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}' , params = '${JSON.stringify(params)}' )`);
            return items.length === 0 ? undefined : items[0];
        });
    }
    /**
   * find entities from database
   * @param model model name or model type
   * @param params mango like query params object
   */
    findAll(model, params) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).queryByJson(model, params);
        });
    }
    /**
     * query if exists record by specified condition
     * @param model model name or model type
     * @param condition query condition, see type SqlCondition
     */
    exists(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).exists(model, condition);
        });
    }
    /**
     * count records count by specified condition
     * @param model model name or model type
     * @param condition query condition, see type SqlCondition
     */
    count(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).count(model, condition);
        });
    }
    attachTransactions(blocks, getTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let transGroup = new Map();
            let transactions = yield getTransactions();
            transactions.forEach(t => {
                if (!transGroup.has(t.blockId))
                    transGroup.set(t.blockId, new Array());
                transGroup.get(t.blockId).push(t);
            });
            blocks.forEach(b => b['transactions'] = transGroup.get(b.id));
            return blocks;
        });
    }
    copyCachedBlock(getCacheBlock, withTransactions) {
        let cachedBlock = getCacheBlock();
        if (cachedBlock === undefined)
            return undefined;
        let result = Object.assign({}, cachedBlock);
        if (!withTransactions) {
            Reflect.deleteProperty(result, 'transactions');
        }
        return result;
    }
    /**
     * get block header by height
     * @param height block height
     */
    getBlockByHeight(height, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('height', height >= 0, 'height must great or equal zero');
            let cachedBlock = this.copyCachedBlock(() => this.cachedBlocks.get(height), withTransactions);
            if (cachedBlock)
                return cachedBlock;
            let blockHeader = yield this.blockDB.getBlock(height);
            if (!withTransactions || blockHeader === undefined)
                return blockHeader;
            return yield this.attachTransactions([blockHeader], () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { blockId: blockHeader.id }); }))[0];
        });
    }
    /**
     * get block header by block id
     * @param blockId block id
     */
    getBlockById(blockId, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('blockId', () => Common_1.CodeContract.notNullOrWhitespace(blockId));
            let cachedBlock = this.copyCachedBlock(() => this.cachedBlocks.getById(blockId), withTransactions);
            if (cachedBlock)
                return cachedBlock;
            let blockHeader = yield this.blockDB.getBlockById(blockId);
            if (!withTransactions || blockHeader === undefined)
                return blockHeader;
            return yield this.attachTransactions([blockHeader], () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { blockId: blockHeader.id }); }))[0];
        });
    }
    /**
     * get block headers by height range
     * @param minHeight min height(included)
     * @param maxHeight max height(included)
     */
    getBlocksByHeightRange(minHeight, maxHeight, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('minHeight, maxHeight', minHeight >= 0 && maxHeight >= minHeight, 'minHeight or maxHeight is invalid');
            // TODO: obtain blocks from cache
            let blockHeaders = yield this.blockDB.getBlocksByHeightRange(minHeight, maxHeight);
            if (!withTransactions)
                return blockHeaders;
            return yield this.attachTransactions(blockHeaders, () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { blockId: { $in: blockHeaders.map(b => b.id) } }); }));
        });
    }
    /**
     * get block headers by block id array
     * @param blockIds array of block id
     */
    getBlocksByIds(blockIds, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('blockIds', () => Common_1.CodeContract.notNull(blockIds));
            // TODO: obtain blocks from cache
            let blockHeaders = yield this.blockDB.getBlocksByIds(blockIds);
            if (!withTransactions)
                return blockHeaders;
            return yield this.attachTransactions(blockHeaders, () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { blockId: { $in: blockHeaders.map(b => b.id) } }); }));
        });
    }
}
exports.SmartDB = SmartDB;


/***/ }),

/***/ "./src/StateTracker/EntityProxy.ts":
/*!*****************************************!*\
  !*** ./src/StateTracker/EntityProxy.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const Log_1 = __webpack_require__(/*! ../Log */ "./src/Log.ts");
/**
 *     STATE TRANSFER                  ACTION                TRACK      CACHE
 * ----------------------------------------------------------------------------
 *      ?         -> persitent      session.load             track     cache
 *      ?         -> new            session.create           track       -
 * persistent     -> modified       set property             keep       keep
 * persistent     -> deleted        session.del              keep       keep
 * new | modified -> presistent     session.saveChanges      keep     cache|update
 * deleted        -> transient      session.saveChanges      evit       evit
 * -------------------------------------------------------------------------------
 */
var EntityState;
(function (EntityState) {
    EntityState[EntityState["Transient"] = -1] = "Transient";
    EntityState[EntityState["Persistent"] = 0] = "Persistent";
    EntityState[EntityState["New"] = 1] = "New";
    EntityState[EntityState["Modified"] = 2] = "Modified";
    EntityState[EntityState["Deleted"] = 3] = "Deleted";
})(EntityState = exports.EntityState || (exports.EntityState = {}));
var EntityChangeType;
(function (EntityChangeType) {
    EntityChangeType[EntityChangeType["New"] = 1] = "New";
    EntityChangeType[EntityChangeType["Modify"] = 2] = "Modify";
    EntityChangeType[EntityChangeType["Delete"] = 3] = "Delete";
})(EntityChangeType = exports.EntityChangeType || (exports.EntityChangeType = {}));
class EntityProxy {
    constructor(tracker) {
        this.tracker = tracker;
        this.log = Log_1.LogManager.getLogger(EntityProxy.name);
    }
    static isExtended(entity) {
        return entity.hasOwnProperty('__schema__') && entity.hasOwnProperty('__state__');
    }
    static isProxied(entity) {
        return EntityProxy.isExtended(entity);
    }
    static convertToProxied(entity) {
        if (!EntityProxy.isProxied(entity))
            throw new Error(`Invalid Proxied Entity`);
        return entity;
    }
    static proxyToEntity(proxied, containsVersion = true) {
        return containsVersion ?
            Common_1.partial(proxied, p => EntityProxy.isNormalProperty(p)) :
            Common_1.partial(proxied, p => p !== '_version_' && EntityProxy.isNormalProperty(p));
    }
    static isNormalProperty(propertyName) {
        return (propertyName.length <= 4) ||
            (propertyName[0] !== propertyName[1]) || (propertyName[0] !== '_') ||
            (!propertyName.endsWith('__'));
    }
    attachExtendProperties(entity, schema, state, confirmed) {
        let result = Object.assign({
            _version_: 1,
            __detached__: false,
            __state__: state,
            __confirmed__: confirmed,
            __schema__: schema,
            __tracker__: this.tracker,
            __tracking__: true,
            __changes__: null,
            __unconfirmedChanges__: null
        }, entity);
        result._version_ = result._version_ || 1;
        return result;
    }
    static initChanges(ext, changeType = EntityChangeType.Modify) {
        if (changeType === EntityChangeType.Modify)
            ext.__changes__ = {
                type: EntityChangeType.Modify,
                dbVersion: ext._version_,
                propertiesChanges: new Array({
                    name: '_version_', original: ext._version_ - 1, current: ext._version_
                })
            };
        ext.__unconfirmedChanges__ = {
            type: changeType,
            dbVersion: ext._version_,
            propertiesChanges: new Array()
        };
    }
    getPropertyKeys(entity) {
        const ext = entity;
        return ext.__schema__.fieldNames;
    }
    onPropertySet(entity, propertyKey, value, receiver) {
        const ext = entity;
        const name = propertyKey.toString();
        if (!EntityProxy.isNormalProperty(name) || !ext.__tracking__ || value === entity[propertyKey]) {
            entity[propertyKey] = value;
            return true;
        }
        if (ext.__state__ === EntityState.Deleted || ext.__state__ === EntityState.Transient) {
            throw new Error(`Can not modify property after deleted`);
        }
        let schema = ext.__schema__;
        if (schema.isReadonly) {
            throw new Error(`Can not modify readonly model '${schema.modelName}'`);
        }
        if (schema.primaryKey === name || schema.compositeKeys.indexOf(name) >= 0) {
            throw new Error(`Can not modify primary key or composite key property`);
        }
        if (ext.__detached__) {
            ext.__tracker__.attach(receiver);
            ext.__detached__ = false;
        }
        EntityProxy.recordPropertyChanges(ext, propertyKey, value);
        entity[propertyKey] = value;
        return true;
    }
    static recordPropertyChanges(ext, key, value) {
        let startConfirm = false;
        if (ext.__tracker__.isConfirming && ext.__confirmed__) {
            startConfirm = true;
            ext.__confirmed__ = false;
        }
        ext.__tracker__.isConfirming && ext.__tracker__.registerUnconfirmedEntity(ext);
        if (ext.__state__ === EntityState.Persistent) {
            ext._version_++;
            ext.__state__ = EntityState.Modified;
            EntityProxy.initChanges(ext);
        }
        let propertiesChanges = null;
        if (ext.__state__ === EntityState.Modified) {
            propertiesChanges = ext.__confirmed__ ?
                ext.__changes__.propertiesChanges :
                ext.__unconfirmedChanges__.propertiesChanges;
        }
        else if (ext.__state__ === EntityState.New && ext.__tracker__.isConfirming) {
            startConfirm && EntityProxy.initChanges(ext, EntityChangeType.New);
            propertiesChanges = ext.__unconfirmedChanges__ === null ? undefined : ext.__unconfirmedChanges__.propertiesChanges;
        }
        let name = key.toString();
        propertiesChanges && propertiesChanges.push({ name: name, original: ext[name], current: value });
    }
    static isDirty(entity) {
        const state = EntityProxy.convertToProxied(entity).__state__;
        return !(state === EntityState.Persistent || state === EntityState.Transient);
    }
    /**
     * Make entity wrapped by proxy so that state changes can be detected and collected
     * @param entity Entity create manual
     * @param model Model Name
     */
    proxyNew(entity, schema, confirmed) {
        let extended = this.attachExtendProperties(entity, schema, EntityState.New, confirmed);
        return new Proxy(extended, { set: this.onPropertySet, ownKeys: this.getPropertyKeys });
    }
    /**
     * Make entity wrapped by proxy so that state changes can be detected
     * @param entity Entity loaded from database. ATTENSTION: ensure that has property '_version_'
     * @param model Model Name
     */
    proxyPersistent(entity, schema, confirmed) {
        let extended = this.attachExtendProperties(entity, schema, EntityState.Persistent, confirmed);
        return new Proxy(extended, { set: this.onPropertySet, ownKeys: this.getPropertyKeys });
    }
    confirmChanges(pe) {
        if (pe.__confirmed__) {
            this.log.infoEnabled && this.log.info('confirm when confirmed');
            return;
        }
        let tmpChanges = pe.__unconfirmedChanges__;
        if (tmpChanges && pe.__changes__) {
            pe.__changes__.propertiesChanges.push(...tmpChanges.propertiesChanges);
        }
        else if (!pe.__changes__) {
            pe.__changes__ = Common_1.deepCopy(tmpChanges);
        }
        else {
            // __unconfirmedChanges__ === null && __changes__ !== null
        }
        pe.__confirmed__ = true;
        pe.__unconfirmedChanges__ && (pe.__unconfirmedChanges__.propertiesChanges = new Array());
    }
    cancelChanges(pe) {
        if (pe.__confirmed__) {
            this.log.infoEnabled && this.log.info('cancel when confirmed');
            return;
        }
        pe.__tracking__ = false;
        pe.__unconfirmedChanges__ &&
            pe.__unconfirmedChanges__.propertiesChanges.forEach(pc => pe[pc.name] = pc.original);
        pe.__tracking__ = true;
        if (pe.__state__ === EntityState.Modified) {
            pe.__state__ = pe.__changes__ ? EntityState.Modified : EntityState.Persistent;
        }
        pe.__confirmed__ = true;
        pe.__unconfirmedChanges__ && (pe.__unconfirmedChanges__.propertiesChanges = new Array());
    }
}
exports.EntityProxy = EntityProxy;


/***/ }),

/***/ "./src/StateTracker/EntityTracker.ts":
/*!*******************************************!*\
  !*** ./src/StateTracker/EntityTracker.ts ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Log_1 = __webpack_require__(/*! ../Log */ "./src/Log.ts");
const Model_1 = __webpack_require__(/*! ../Model */ "./src/Model.ts");
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const EntityProxy_1 = __webpack_require__(/*! ./EntityProxy */ "./src/StateTracker/EntityProxy.ts");
const util_1 = __webpack_require__(/*! util */ "util");
class ProxiedEntityTracker {
    constructor(cache) {
        this.log = Log_1.LogManager.getLogger(ProxiedEntityTracker.name);
        this.proxy = new EntityProxy_1.EntityProxy(this);
        this.cache = cache;
        this.confirming = false;
        this.history = new Map();
        this.allTrackingEntities = new Map();
        this.unconfirmedEntities = new Map();
        this.minVersion = -1;
        this.currentVersion = -1;
    }
    ensureNoTracking(schema, entity) {
        const trackingKey = this.makeModelAndKey(schema, schema.getKey(entity));
        if (this.allTrackingEntities.has(trackingKey))
            throw new Error(`entity model=${schema.modelName} key=${schema.getKey(entity)} is tracking`);
    }
    makeModelAndKey(schema, key) {
        let mk = { m: schema.modelName, k: key };
        return JSON.stringify(mk);
    }
    splitModelAndKey(modelAndKey) {
        let mk = JSON.parse(modelAndKey);
        let key = util_1.isString(mk.k) || util_1.isNumber(mk.k) ? mk.k : new Model_1.CompositeKey(mk.k.keyObject);
        return { model: mk.m, key: key };
    }
    getHistoryByVersion(historyVersion, createIfNotExists = false) {
        if (!this.history.has(historyVersion) && createIfNotExists)
            this.history.set(historyVersion, new Map());
        return this.history.get(historyVersion);
    }
    getModelAndKey(pe) {
        return this.makeModelAndKey(pe.__schema__, pe.__schema__.getKey(pe));
    }
    saveHistory(pe, changes, historyVersion) {
        this.getHistoryByVersion(historyVersion, true).set(this.getModelAndKey(pe), changes);
    }
    removeTrackingTransisentEntities() {
        let keys = new Array();
        this.allTrackingEntities.forEach((entity, key) => entity.__state__ === EntityProxy_1.EntityState.Transient && keys.push(key));
        keys.forEach(key => this.allTrackingEntities.delete(key));
    }
    attachHistory(history) {
        this.log.infoEnabled && this.log.info(`BEGIN attachHistory history info = ${JSON.stringify(this.historyVersion)}`);
        history.forEach((changes, version) => {
            let changesMap = new Map();
            changes.forEach(c => changesMap.set(c.modelAndKey, c.changes));
            this.history.set(version, changesMap);
        });
        if (this.log.infoEnabled) {
            let heightInfo = new Array();
            history.forEach((c, h) => heightInfo.push(h));
            this.log.info(`SUCCESS attachHistory height = ${JSON.stringify(heightInfo)}`);
        }
    }
    get historyVersion() {
        return { min: this.minVersion, max: this.currentVersion };
    }
    attach(pe) {
        const trackingKey = this.makeModelAndKey(pe.__schema__, pe.__schema__.getKey(pe));
        if (this.allTrackingEntities.has(trackingKey))
            throw new Error('exists another tracked entity');
        this.allTrackingEntities.set(this.getModelAndKey(pe), pe);
    }
    getLastChanges(pe) {
        if (!EntityProxy_1.EntityProxy.isDirty(pe))
            return undefined;
        // TODO: check if confirming ?
        switch (pe.__state__) {
            case EntityProxy_1.EntityState.New:
                return this.createNewOrDeleteChanges(pe, pe._version_, true);
            case EntityProxy_1.EntityState.Deleted:
                return this.createNewOrDeleteChanges(pe, pe._version_, false);
            case EntityProxy_1.EntityState.Modified:
                return pe.__changes__;
            default:
                return undefined;
        }
    }
    getChangesUntil(historyVersion) {
        const result = new Array();
        let tmpVersion = this.currentVersion;
        while (tmpVersion >= historyVersion) {
            let history = this.getHistoryByVersion(tmpVersion);
            history && result.push(history);
            tmpVersion--;
        }
        return result;
    }
    get trackingEntities() {
        return this.allTrackingEntities.values();
    }
    isTracking(schema, key) {
        return this.allTrackingEntities.has(this.makeModelAndKey(schema, key));
    }
    registerUnconfirmedEntity(pe) {
        const key = this.getModelAndKey(pe);
        this.unconfirmedEntities.set(key, pe);
    }
    get isConfirming() {
        return this.confirming;
    }
    beginConfirm() {
        this.confirming = true;
        this.log.traceEnabled && this.log.trace('BEGIN beginConfirm');
    }
    confirm() {
        this.unconfirmedEntities.forEach(pe => {
            if (pe.__state__ === EntityProxy_1.EntityState.New)
                this.confirmNew(pe);
            else if (pe.__state__ === EntityProxy_1.EntityState.Modified)
                this.confirmModify(pe);
            else if (pe.__state__ === EntityProxy_1.EntityState.Deleted)
                this.confirmedDelete(pe);
        });
        this.unconfirmedEntities.clear();
        this.removeTrackingTransisentEntities();
        this.confirming = false;
        this.log.traceEnabled && this.log.trace('SUCCESS confirm ');
    }
    cancelConfirm() {
        this.unconfirmedEntities.forEach(pe => {
            if (pe.__state__ === EntityProxy_1.EntityState.New)
                this.cancelUnconfirmedNew(pe);
            else if (pe.__state__ === EntityProxy_1.EntityState.Modified)
                this.cancelUnconfirmedModify(pe);
            else if (pe.__state__ === EntityProxy_1.EntityState.Deleted)
                this.cancelUnconfirmedDelete(pe);
            else if (pe.__state__ === EntityProxy_1.EntityState.Transient)
                this.cancelUnconfirmedDelete(pe);
        });
        this.unconfirmedEntities.clear();
        this.removeTrackingTransisentEntities();
        this.confirming = false;
        this.log.traceEnabled && this.log.trace('SUCCESS cancelConfirm ');
    }
    getTrackingEntity(schema, key) {
        const trackingKey = this.makeModelAndKey(schema, key);
        return this.allTrackingEntities.has(trackingKey) ? this.allTrackingEntities.get(trackingKey) : undefined;
    }
    trackNew(schema, entity) {
        this.ensureNoTracking(schema, entity);
        let proxied = this.proxy.proxyNew(entity, schema, !this.isConfirming);
        this.allTrackingEntities.set(this.getModelAndKey(proxied), proxied);
        this.confirming && this.registerUnconfirmedEntity(proxied);
        return proxied;
    }
    trackDelete(schema, entity) {
        let proxied = EntityProxy_1.EntityProxy.convertToProxied(entity);
        if (proxied.__state__ === EntityProxy_1.EntityState.Deleted ||
            proxied.__state__ === EntityProxy_1.EntityState.Transient)
            return;
        this.confirming && this.registerUnconfirmedEntity(proxied);
        proxied.__confirmed__ = !this.confirming;
        switch (proxied.__state__) {
            case EntityProxy_1.EntityState.New:
                proxied.__state__ = EntityProxy_1.EntityState.Transient;
                break;
            case EntityProxy_1.EntityState.Modified:
                proxied.__state__ = EntityProxy_1.EntityState.Deleted;
                break;
            case EntityProxy_1.EntityState.Persistent:
                proxied.__state__ = EntityProxy_1.EntityState.Deleted;
                break;
        }
    }
    confirmNew(pe) {
        pe.__confirmed__ = true;
    }
    cancelUnconfirmedNew(pe) {
        let newThenModify = pe.__unconfirmedChanges__ &&
            pe.__unconfirmedChanges__.type === EntityProxy_1.EntityChangeType.New;
        if (newThenModify) {
            this.proxy.cancelChanges(pe);
        }
        else {
            pe.__state__ = EntityProxy_1.EntityState.Transient;
        }
        pe.__confirmed__ = true;
    }
    confirmModify(pe) {
        this.proxy.confirmChanges(pe);
    }
    cancelUnconfirmedModify(pe) {
        this.proxy.cancelChanges(pe);
    }
    confirmedDelete(pe) {
        pe.__confirmed__ = true;
    }
    cancelUnconfirmedDelete(pe) {
        if (pe.__state__ === EntityProxy_1.EntityState.Transient) {
            pe.__state__ = EntityProxy_1.EntityState.New;
        }
        else if (pe.__state__ === EntityProxy_1.EntityState.Deleted) {
            let modified = (pe.__changes__ && pe.__changes__.propertiesChanges.length > 0);
            pe.__state__ = modified ? EntityProxy_1.EntityState.Modified : EntityProxy_1.EntityState.Persistent;
        }
        if (pe.__unconfirmedChanges__) {
            pe.__unconfirmedChanges__.propertiesChanges = new Array();
        }
        pe.__confirmed__ = true;
    }
    trackPersistent(schema, entity) {
        this.ensureNoTracking(schema, entity);
        let proxied = this.proxy.proxyPersistent(entity, schema, !this.confirming);
        this.allTrackingEntities.set(this.getModelAndKey(proxied), proxied);
        return proxied;
    }
    stopTrack(schema, entity) {
        this.allTrackingEntities.delete(this.makeModelAndKey(schema, schema.getKey(entity)));
    }
    stopTrackAll() {
        this.allTrackingEntities.clear();
    }
    getTrackingChanges() {
        let result = new Array();
        this.allTrackingEntities.forEach(pe => {
            EntityProxy_1.EntityProxy.isDirty(pe) &&
                result.push({ modelAndKey: this.getModelAndKey(pe), changes: this.getLastChanges(pe) });
        });
        return result;
    }
    detectChanges() {
        let result = new Array();
        this.allTrackingEntities.forEach(pe => {
            EntityProxy_1.EntityProxy.isDirty(pe) &&
                result.push({ entity: pe, changes: this.getLastChanges(pe) });
        });
        return result;
    }
    createNewOrDeleteChanges(entity, dbVersion, isNew = true) {
        let properitesChange = new Array();
        for (const key in entity) {
            if (!EntityProxy_1.EntityProxy.isNormalProperty(key))
                continue;
            properitesChange.push(isNew ?
                { name: key, original: undefined, current: entity[key] } :
                { name: key, original: entity[key], current: undefined });
        }
        return {
            type: isNew ? EntityProxy_1.EntityChangeType.New : EntityProxy_1.EntityChangeType.Delete,
            dbVersion: dbVersion,
            propertiesChanges: properitesChange
        };
    }
    markStateAndSaveHistory(pe, historyVersion) {
        switch (pe.__state__) {
            case EntityProxy_1.EntityState.New:
                this.log.traceEnabled && this.log.trace(`NEW Version = ${historyVersion} entity = ${JSON.stringify(EntityProxy_1.EntityProxy.proxyToEntity(pe))}`);
                this.saveHistory(pe, this.createNewOrDeleteChanges(pe, pe._version_, true), historyVersion);
                pe.__state__ = EntityProxy_1.EntityState.Persistent;
                break;
            case EntityProxy_1.EntityState.Deleted:
                this.log.traceEnabled && this.log.trace(`DELETE Version = ${historyVersion} entity = ${JSON.stringify(EntityProxy_1.EntityProxy.proxyToEntity(pe))}`);
                this.saveHistory(pe, this.createNewOrDeleteChanges(pe, pe._version_, false), historyVersion);
                pe.__state__ = EntityProxy_1.EntityState.Transient;
                break;
            case EntityProxy_1.EntityState.Modified:
                this.log.traceEnabled && this.log.trace(`MODIFIED Version = ${historyVersion} changes = ${JSON.stringify(pe.__changes__)} unconfirmed = ${JSON.stringify(pe.__unconfirmedChanges__)}`);
                pe.__state__ = EntityProxy_1.EntityState.Persistent;
                this.saveHistory(pe, pe.__changes__, historyVersion);
                pe.__changes__ = null;
                break;
            // otherwise do nothing 
            case EntityProxy_1.EntityState.Persistent:
            case EntityProxy_1.EntityState.Transient:
        }
    }
    acceptChanges(historyVersion) {
        this.log.traceEnabled && this.log.trace(`BEGIN acceptChanges Version = ${historyVersion}`);
        this.allTrackingEntities.forEach(pe => {
            const schema = pe.__schema__;
            if (pe.__state__ === EntityProxy_1.EntityState.New || pe.__state__ === EntityProxy_1.EntityState.Modified)
                this.cache.put(schema.modelName, schema.getKey(pe), EntityProxy_1.EntityProxy.proxyToEntity(pe));
            else if (pe.__state__ === EntityProxy_1.EntityState.Deleted)
                this.cache.evit(schema.modelName, schema.getKey(pe));
            // else 'transient' | 'persistent' do nothing
            this.markStateAndSaveHistory(pe, historyVersion);
            this.currentVersion = historyVersion;
            pe.__detached__ = true;
        });
        this.allTrackingEntities.clear();
        this.minVersion = this.minVersion === -1 ? historyVersion : this.minVersion;
        this.log.traceEnabled && this.log.trace(`SUCCESS acceptChanges Version = ${historyVersion}`);
    }
    rollbackCacheChanges(model, key, changes) {
        switch (changes.type) {
            case EntityProxy_1.EntityChangeType.New:
                this.cache.evit(model, key);
                break;
            case EntityProxy_1.EntityChangeType.Modify:
                let e = this.cache.get(model, key);
                if (e === undefined)
                    return;
                changes.propertiesChanges.forEach(c => e[c.name] = c.original);
                this.cache.put(model, key, e);
                break;
            case EntityProxy_1.EntityChangeType.Delete:
                const entity = Common_1.makeJsonObject(changes.propertiesChanges, c => c.name, c => c.original);
                this.cache.put(model, key, entity);
                break;
        }
    }
    rejectChanges() {
        this.cancelConfirm();
        this.allTrackingEntities.forEach(pe => {
            switch (pe.__state__) {
                case EntityProxy_1.EntityState.New:
                    pe.__state__ = EntityProxy_1.EntityState.Transient;
                    break;
                case EntityProxy_1.EntityState.Modified:
                    pe.__tracking__ = false;
                    pe.__changes__.propertiesChanges.forEach(c => pe[c.name] = c.original);
                    pe.__tracking__ = true;
                    pe.__changes__ = null;
                    pe.__state__ = EntityProxy_1.EntityState.Persistent;
                    break;
                case EntityProxy_1.EntityState.Deleted:
                    pe.__state__ = EntityProxy_1.EntityState.Persistent;
                    break;
                // otherwise do nothing
                case EntityProxy_1.EntityState.Persistent:
                case EntityProxy_1.EntityState.Transient:
            }
        });
        this.log.traceEnabled && this.log.trace(`rejectChanges Version = ?`);
    }
    rollbackChanges(historyVersion) {
        const from = this.currentVersion;
        this.log.traceEnabled && this.log.trace(`BEGIN rollbackChanges Version : ${from} -> ${historyVersion}`);
        this.rejectChanges();
        while (historyVersion <= this.currentVersion) {
            const changesMap = this.getHistoryByVersion(this.currentVersion);
            changesMap && changesMap.forEach((changes, modelAndKey) => {
                const mk = this.splitModelAndKey(modelAndKey);
                this.rollbackCacheChanges(mk.model, mk.key, changes);
            });
            this.currentVersion--;
        }
        this.allTrackingEntities.forEach(pe => pe.__detached__ = true);
        this.allTrackingEntities.clear();
        this.minVersion = Math.min(this.minVersion, this.currentVersion);
        this.log.traceEnabled && this.log.trace(`SUCCESS rollbackChanges Version : ${from} -> ${this.currentVersion}`);
    }
    clearHistory(historyVersion) {
        if (this.minVersion >= historyVersion || this.currentVersion < historyVersion)
            return;
        for (let ver = this.minVersion; ver < historyVersion; ver++) {
            this.history.delete(ver);
        }
    }
    dumpChanges(ec) {
        let propertyChanges = '';
        ec.propertiesChanges.forEach(pc => propertyChanges += `${pc.name}: ${pc.original} -> ${pc.current}, `);
        return `dbVersion=${ec.dbVersion}, type=${ec.type}, [${propertyChanges}]`;
    }
    dumpHistory() {
        let version = this.currentVersion;
        let result = `--------------  DUMP HISTORY  ----------------\n\n`;
        while (version >= this.minVersion) {
            result += `--------------version ${version}----------------\n`;
            let his = this.getHistoryByVersion(version);
            his && his.forEach((ec, modelAndKey) => {
                let changes = this.dumpChanges(ec);
                const mk = this.splitModelAndKey(modelAndKey);
                const msg = `type=${mk.model}, key=${mk.key}, changes={${changes}} \n`;
                result += msg;
            });
            result += '\n';
            version--;
        }
        result += `--------------   END   DUMP  ----------------\n`;
        return result;
    }
}
exports.ProxiedEntityTracker = ProxiedEntityTracker;
class TrackerSqlBuilder {
    constructor(tracker, models, sqlBuilder) {
        this.tracker = tracker;
        this.models = models;
        this.sqlBuilder = sqlBuilder;
    }
    get entityTracker() { return this.tracker; }
    buildChangeSqls() {
        let result = new Array();
        this.tracker.detectChanges().forEach(ec => {
            result.push(this.buildSqlAndParameters(ec.entity));
        });
        return result;
    }
    buildSqlAndParameters(pe) {
        switch (pe.__state__) {
            case EntityProxy_1.EntityState.New:
                const newEntity = EntityProxy_1.EntityProxy.proxyToEntity(pe, true);
                return this.sqlBuilder.buildInsert(pe.__schema__, newEntity);
            case EntityProxy_1.EntityState.Modified:
                let entityChanges = this.tracker.getLastChanges(pe);
                let changes = Common_1.makeJsonObject(entityChanges.propertiesChanges, c => c.name, c => c.current);
                return this.sqlBuilder.buildUpdate(pe.__schema__, pe.__schema__.getKey(pe), changes, entityChanges.dbVersion - 1);
            case EntityProxy_1.EntityState.Deleted:
                return this.sqlBuilder.buildDelete(pe.__schema__, pe.__schema__.getKey(pe));
            default:
                throw new Error(`Invalid entity state '${pe.__state__}'`);
        }
    }
    buildRollbackChangeSqls(historyVersion) {
        let result = new Array();
        this.tracker.getChangesUntil(historyVersion).forEach(his => his.forEach((entityChanges, modelAndKey) => {
            const mk = this.tracker.splitModelAndKey(modelAndKey);
            const schema = this.models.get(mk.model);
            switch (entityChanges.type) {
                case EntityProxy_1.EntityChangeType.New:
                    result.push(this.sqlBuilder.buildDelete(schema, mk.key));
                    break;
                case EntityProxy_1.EntityChangeType.Modify:
                    let changes = Common_1.makeJsonObject(entityChanges.propertiesChanges, c => c.name, c => c.original);
                    result.push(this.sqlBuilder.buildUpdate(schema, mk.key, changes, entityChanges.dbVersion));
                    break;
                case EntityProxy_1.EntityChangeType.Delete:
                    let entity = Common_1.makeJsonObject(entityChanges.propertiesChanges, c => c.name, c => c.original);
                    result.push(this.sqlBuilder.buildInsert(schema, entity));
                    break;
            }
        }));
        return result;
    }
}
exports.TrackerSqlBuilder = TrackerSqlBuilder;


/***/ }),

/***/ "better-sqlite3":
/*!*********************************!*\
  !*** external "better-sqlite3" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("better-sqlite3");

/***/ }),

/***/ "change-case":
/*!******************************!*\
  !*** external "change-case" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("change-case");

/***/ }),

/***/ "events":
/*!*************************!*\
  !*** external "events" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("events");

/***/ }),

/***/ "json-sql":
/*!***************************!*\
  !*** external "json-sql" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("json-sql");

/***/ }),

/***/ "level":
/*!************************!*\
  !*** external "level" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("level");

/***/ }),

/***/ "level-secondary":
/*!**********************************!*\
  !*** external "level-secondary" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("level-secondary");

/***/ }),

/***/ "level-sublevel":
/*!*********************************!*\
  !*** external "level-sublevel" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("level-sublevel");

/***/ }),

/***/ "lru-cache":
/*!****************************!*\
  !*** external "lru-cache" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lru-cache");

/***/ }),

/***/ "util":
/*!***********************!*\
  !*** external "util" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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QUFDLENBQUMsUUFBUSxDQUFDO29CQUN4RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDekQsTUFBSzthQUNSO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU07SUFDZixDQUFDO0NBRUY7QUE1REQsOENBNERDOzs7Ozs7Ozs7Ozs7QUNsaUJELDJDOzs7Ozs7Ozs7OztBQ0FBLHdDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHNDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6ImFzY2gtc21hcnRkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5kZXgudHNcIik7XG4iLCJpbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJ1xuXG5leHBvcnQgY2xhc3MgQmxvY2tDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KClcbiAgcHJpdmF0ZSBtaW5IZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heEhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1heENhY2hlZENvdW50IDogbnVtYmVyICkge1xuICAgIHRoaXMubWF4Q2FjaGVkQ291bnQgPSBtYXhDYWNoZWRDb3VudFxuICB9XG5cbiAgcHVibGljIGlzQ2FjaGVkKCBoZWlnaHQ6IG51bWJlciApIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhlaWdodCA+IDAgJiYgaGVpZ2h0ID49IHRoaXMubWluSGVpZ2h0ICYmIGhlaWdodCA8PSB0aGlzLm1heEhlaWdodFxuICB9XG5cbiAgcHVibGljIGdldCBjYWNoZWRIZWlnaHRSYW5nZSgpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluIDogdGhpcy5taW5IZWlnaHQsIG1heDogdGhpcy5tYXhIZWlnaHQgfVxuICB9XG5cbiAgcHVibGljIHB1dCggYmxvY2s6IEJsb2NrICkge1xuICAgIGlmICggIXRoaXMuaXNDYWNoZWQoIGJsb2NrLmhlaWdodCApICYmIHRoaXMubWF4SGVpZ2h0ID49IDAgJiYgYmxvY2suaGVpZ2h0ICE9PSB0aGlzLm1heEhlaWdodCArIDEgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICgnaW52YWxpZCBibG9jayBoZWlnaHQnKVxuXG4gICAgdGhpcy5jYWNoZS5zZXQoIGJsb2NrLmhlaWdodCwgYmxvY2sgKVxuICAgIHRoaXMubWF4SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gICAgXG4gICAgaWYgKCB0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhDYWNoZWRDb3VudCApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKCB0aGlzLm1pbkhlaWdodCsrIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0KCBoZWlnaHQ6IG51bWJlciApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoaGVpZ2h0KVxuICB9XG5cbiAgcHVibGljIGdldEJ5SWQoIGlkOiBzdHJpbmcgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgZm9yKCBjb25zdCBiIG9mIHRoaXMuY2FjaGUudmFsdWVzKCkgKSB7XG4gICAgICBpZiAoIGIuaWQhID09PSBpZCApIHJldHVybiBiXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBldml0KCBmcm9tSGVpZ2h0OiBudW1iZXIsIHRvSGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgbGV0IG1pbiA9IE1hdGgubWluKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgbGV0IG1heCA9IE1hdGgubWF4KCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgaWYgKCBtaW4gPiB0aGlzLm1heEhlaWdodCB8fCBtYXggPCB0aGlzLm1pbkhlaWdodCApIHJldHVybiBcbiAgICBcbiAgICBtaW4gPSBNYXRoLm1heCggbWluLCB0aGlzLm1pbkhlaWdodCApXG4gICAgbWF4ID0gTWF0aC5taW4oIG1heCwgdGhpcy5taW5IZWlnaHQgKVxuICAgIGZvciAoIGxldCBoZWlnaHQgPSBtaW47IGhlaWdodCA8PSBtYXg7IGhlaWdodCsrICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoaGVpZ2h0KVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5T2JqZWN0IHsgXG4gIGtleSA6IHN0cmluZ1xuICBrZXlKc29uIDogSnNvbk9iamVjdFxufVxuZXhwb3J0IHR5cGUgRW50aXR5S2V5ID0gc3RyaW5nIHwgbnVtYmVyIHwgS2V5T2JqZWN0XG5cbmV4cG9ydCB0eXBlIFBhcnRpYWw8VD4gPSB7XG4gIFtQIGluIGtleW9mIFRdPzogVFtQXVxufVxuXG5leHBvcnQgdHlwZSBSZWFkb25seVBhcnRpYWw8VD4gPSB7XG4gIHJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdO1xufVxuXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jdGlvbjxUPiA9ICggZSA6IFQgKSA9PiBib29sZWFuXG5cbmV4cG9ydCB0eXBlIEtleVZhbHVlUGFpciA9IHsga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkgfVxuZXhwb3J0IHR5cGUgQ2FsbGJhY2s8VFJlc3VsdD4gPSAoIGVycjogRXJyb3J8bnVsbCwgZGF0YTogVFJlc3VsdCApID0+IHZvaWRcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VKc29uT2JqZWN0PFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiwgZ2V0S2V5OiAodCA6IFQpID0+IHN0cmluZywgZ2V0VmFsdWU6ICh0OiBUKSA9PiBhbnkgICkgOiBKc29uT2JqZWN0IHtcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnaXRlcmFibGUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggaXRlcmFibGUgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0S2V5JywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldEtleSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRWYWx1ZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRWYWx1ZSApKVxuXG4gIGxldCByZXQgPSB7fVxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG4gICAgcmV0W2dldEtleShpdGVtKV0gPSBnZXRWYWx1ZShpdGVtKVxuICB9XG4gIHJldHVybiByZXQgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQ29weTxUPihzcmMgOiBUKSA6IFQge1xuICBpZiAoICFzcmMgKSByZXR1cm4gc3JjXG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNyYykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsPFQ+KCBzcmMgOiBULCBrZXlzT3JLZXlGaWx0ZXIgOiBBcnJheTxzdHJpbmc+IHwgKChrZXkgOiBzdHJpbmcpID0+IGJvb2xlYW4pICk6IFBhcnRpYWw8VD4ge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdzcmMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggc3JjICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2tleXNPcktleUZpbHRlcicsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBrZXlzT3JLZXlGaWx0ZXIgKSlcblxuICBsZXQga2V5cyA9IGlzRnVuY3Rpb24oa2V5c09yS2V5RmlsdGVyKSA/IFxuICAgIE9iamVjdC5rZXlzKHNyYykuZmlsdGVyKCBrZXlzT3JLZXlGaWx0ZXIgYXMgKChrZXkgOiBzdHJpbmcpID0+IGJvb2xlYW4pICkgOlxuICAgIGtleXNPcktleUZpbHRlciBhcyBBcnJheTxzdHJpbmc+XG5cbiAgbGV0IHJlc3VsdCA9IHsgfVxuICBmb3IgKCBsZXQgayBvZiBrZXlzICkgcmVzdWx0W2tdID0gc3JjW2tdXG4gIHJldHVybiByZXN1bHQgYXMgUGFydGlhbDxUPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICggIWtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4gaXNTdHJpbmcoIGtleSApIHx8IGlzTnVtYmVyKCBrZXkgKVxufVxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCBtZXNzYWdlIDogc3RyaW5nICkge1xuICAgIHN1cGVyKCAnQ29kZSBjb250cmFjdCBFcnJvciwnKyBtZXNzYWdlIClcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDb250cmFjdENvbmRpdGlvbiA9IGJvb2xlYW4gfCAoICgpID0+IGJvb2xlYW4gKVxuZXhwb3J0IHR5cGUgQ29udHJhY3RNZXNzYWdlICAgPSBzdHJpbmcgIHwgKCAoKSA9PiBzdHJpbmcgKVxuXG5leHBvcnQgdHlwZSBNYXliZVVuZGVmaW5lZDxUPiA9IFQgfCB1bmRlZmluZWRcbmV4cG9ydCB0eXBlIE51bGxhYmxlPFQ+ID0gVCB8IG51bGwgfCB1bmRlZmluZWRcblxuZXhwb3J0IHR5cGUgQ29udHJhY3RWZXJpZnlSZXN1bHQgPSB7IHJlc3VsdCA6IGJvb2xlYW4sIG1lc3NhZ2U6IE51bGxhYmxlPHN0cmluZz4gfSBcbmV4cG9ydCB0eXBlIFZlcmlmeUZ1bmN0aW9uID0gKCkgPT4gQ29udHJhY3RWZXJpZnlSZXN1bHRcblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdCB7XG4gIHB1YmxpYyBzdGF0aWMgdmVyaWZ5KCBjb25kaXRpb246IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlIDogQ29udHJhY3RNZXNzYWdlICkgOiB2b2lkIHtcbiAgICBpZiAoIGNvbmRpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IGNvbmRpdGlvbiA9PT0gbnVsbCApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJpZnkgY29uZGl0aW9uJylcblxuICAgIGNvbnN0IGNvbmQgPSBpc0Z1bmN0aW9uKGNvbmRpdGlvbikgPyAoY29uZGl0aW9uIGFzIEZ1bmN0aW9uKSgpIDogY29uZGl0aW9uXG4gICAgY29uc3QgbXNnID0gaXNGdW5jdGlvbihtZXNzYWdlKSA/IChtZXNzYWdlIGFzIEZ1bmN0aW9uKSgpIDogbWVzc2FnZVxuXG4gICAgaWYgKCFjb25kKSB0aHJvdyBuZXcgQ29kZUNvbnRyYWN0RXJyb3IoIG1zZyApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFyZ3VtZW50KCBhcmdOYW1lOiBzdHJpbmcsIHZlcmlmeTogVmVyaWZ5RnVuY3Rpb24gfCBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZT8gOiBDb250cmFjdE1lc3NhZ2UgKTogdm9pZCB7XG4gICAgaWYgKCAhYXJnTmFtZSB8fCAhdmVyaWZ5ICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ05hbWUgb3IgdmVyaWZ5IGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBpZiAoICFtZXNzYWdlICkge1xuICAgICAgY29uc3QgdnIgPSAgKHZlcmlmeSBhcyBWZXJpZnlGdW5jdGlvbikoKVxuICAgICAgQ29kZUNvbnRyYWN0LnZlcmlmeSggdnIucmVzdWx0LCBgYXJndW1lbnQgJyR7YXJnTmFtZX0nICR7dnIubWVzc2FnZX1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgQ29kZUNvbnRyYWN0LnZlcmlmeSh2ZXJpZnkgYXMgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UhKSAgICBcbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsKCBhcmcgOiBhbnkgKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhcmcgIT09IG51bGwgJiYgYXJnICE9PSB1bmRlZmluZWRcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JFbXB0eSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGwoc3RyKSAmJiBzdHIgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3IgZW1wdHknXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yV2hpdGVzcGFjZSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGxPckVtcHR5KCBzdHIgKSAmJiAoIHN0ciBhcyBzdHJpbmcgKS50cmltKCkgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3Igd2hpdGVzcGFjZSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbn1cblxuXG4iLCJpbXBvcnQgeyBFbnRpdHlDYWNoZSwgTFJVRW50aXR5Q2FjaGUsIEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciB9IGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IEpzb25TcWxCdWlsZGVyLCBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciwgTVVMVElfU1FMX1NFUEFSQVRPUiB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEVudGl0eSwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFByb3hpZWRFbnRpdHlUcmFja2VyLCBUcmFja2VyU3FsQnVpbGRlciwgRW50aXR5Q2hhbmdlc0l0ZW0sIE1vZGVsQW5kS2V5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eUV4dGVuc2lvbiwgUHJveGllZCwgRW50aXR5U3RhdGUgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIFNhdmVIaXN0b3J5QWN0aW9uID0gKCB2ZXJzaW9uOiBudW1iZXIsIGhpc3Rvcnk6IE1hcDxzdHJpbmcsIEVudGl0eUNoYW5nZXM+ICkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgRGJTZXNzaW9uIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNlc3Npb25DYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgc3FsQnVpbGRlciA6IEpzb25TcWxCdWlsZGVyXG4gIHByaXZhdGUgdHJhY2tlclNxbEJ1aWxkZXI6IFRyYWNrZXJTcWxCdWlsZGVyXG4gIHByaXZhdGUgZW50aXR5VHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgaG9sZExvY2tzIDogTWFwPHN0cmluZywgYm9vbGVhbj5cbiAgcHJpdmF0ZSBzZXNzaW9uU2VyaWFsIDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uLCBjYWNoZU9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMsIHNlc3Npb25OYW1lPzogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRGJTZXNzaW9uLm5hbWUgKyAoIHNlc3Npb25OYW1lID09PSB1bmRlZmluZWQgPyAnJyA6IGBfJHtzZXNzaW9uTmFtZX1gKSAgKVxuICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IC0xXG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgIHRoaXMubW9kZWxzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUgPSBuZXcgTFJVRW50aXR5Q2FjaGUoY2FjaGVPcHRpb25zKVxuICAgIHRoaXMuc3FsQnVpbGRlciA9IG5ldyBKc29uU3FsQnVpbGRlcigpXG4gICAgdGhpcy5lbnRpdHlUcmFja2VyID0gbmV3IFByb3hpZWRFbnRpdHlUcmFja2VyKCB0aGlzLnNlc3Npb25DYWNoZSApXG4gICAgdGhpcy5ob2xkTG9ja3MgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZTogc3RyaW5nKSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobW9kZWxOYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke21vZGVsTmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeUNsYXNzPFRFbnRpdHk+KGNsYXp6OiBDb25zdHJ1Y3RvcjxURW50aXR5PikgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KGNsYXp6Lm5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7Y2xhenoubmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWE8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsKSA6IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeUNsYXNzKG1vZGVsKVxuICB9XG5cbiAgcHJvdGVjdGVkIG1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSgge30sIGtleSApXG4gIH1cblxuICBwcm90ZWN0ZWQgdHJhY2tQZXJzaXN0ZW50RW50aXRpZXM8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsICBlbnRpdGllcyA6IEFycmF5PFRFbnRpdHk+LCBjYWNoZSA9IHRydWUsIHJlZnJlc2hJZlRyYWNraW5nID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHtcbiAgICAgIGxldCBrZXkgPSBzY2hlbWEuZ2V0S2V5KGUpIFxuICAgICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICAgIGxldCBwcm94aWVkID0gcmVmcmVzaElmVHJhY2tpbmcgJiYgdHJhY2tlZCAhPT0gdW5kZWZpbmVkID8gXG4gICAgICAgIHRyYWNrZWQgYXMgYW55IGFzIFRFbnRpdHkgOiBcbiAgICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudDxURW50aXR5PihzY2hlbWEsIGUpXG4gICAgICByZXN1bHQucHVzaCggcHJveGllZCApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwga2V5LCBlIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCByZXNldChjbGVhckNhY2hlOiBib29sZWFuID0gZmFsc2UpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnN0b3BUcmFja0FsbCgpXG4gICAgaWYgKCBjbGVhckNhY2hlICkgdGhpcy5lbnRpdHlDYWNoZS5jbGVhcigpXG4gIH1cblxuICBwcm90ZWN0ZWQgdW5kZWZpbmVkSWZEZWxldGVkPFRFbnRpdHk+KCBwcm94aWVkIDogUHJveGllZDxURW50aXR5PiApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIHJldHVybiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSA/IFxuICAgICAgdW5kZWZpbmVkIDogXG4gICAgICBwcm94aWVkIGFzIE9iamVjdCBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogdm9pZCB7XG4gICAgdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSkuZm9yRWFjaCggc3FsPT4ge1xuICAgICAgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVTeW5jKCBzcWwgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJTY2hlbWEoLi4uc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiB2b2lkIHtcbiAgICBzY2hlbWFzLmZvckVhY2goIHMgPT4gdGhpcy5tb2RlbHMuc2V0KHMubW9kZWxOYW1lLCBzKSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucmVzZXQoIHRydWUgKVxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5kaXNjb25uZWN0KClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KTogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICB9XG5cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+ICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IGVudGl0eU1hcCA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIFRFbnRpdHk+KClcbiAgICBuZXcgQXJyYXk8UHJveGllZDxhbnk+PiguLi50aGlzLmVudGl0eVRyYWNrZXIudHJhY2tpbmdFbnRpdGllcyBhcyBJdGVyYWJsZTxQcm94aWVkPGFueT4+IClcbiAgICAgIC5maWx0ZXIoIHBlID0+IHBlLl9fc2NoZW1hX18ubW9kZWxOYW1lID09PSBzY2hlbWEubW9kZWxOYW1lICYmIHBlLl9fc3RhdGVfXyAhPT0gRW50aXR5U3RhdGUuRGVsZXRlZCAmJiBwZS5fX3N0YXRlX18gIT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICAgICAuZm9yRWFjaCggcGUgPT4gZW50aXR5TWFwLnNldCggdGhpcy5lbnRpdHlUcmFja2VyLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUgYXMgYW55IGFzIFRFbnRpdHkpIClcblxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKVxuICAgIGVudGl0aWVzICYmIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgbGV0IGtleSA9IHRoaXMuZW50aXR5VHJhY2tlci5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlKSApXG4gICAgICBpZiAoICFlbnRpdHlNYXAuaGFzKGtleSkpIHtcbiAgICAgICAgbGV0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBlIClcbiAgICAgICAgZW50aXR5TWFwLnNldCgga2V5LCBwZSApXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZmlsdGVyID8gWy4uLmVudGl0eU1hcC52YWx1ZXMoKV0uZmlsdGVyKCBmaWx0ZXIgKSA6IFsuLi5lbnRpdHlNYXAudmFsdWVzKCldXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcblxuICAgIGxldCBjYWNoZWQgPSB0aGlzLmVudGl0eUNhY2hlLmdldDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICByZXR1cm4gKCBjYWNoZWQgPT09IHVuZGVmaW5lZCApID8gdW5kZWZpbmVkIDogXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KCBzY2hlbWEsIGNhY2hlZCApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgJiYgdGhpcy5lbnRpdHlDYWNoZS5leGlzdHNNb2RlbChzY2hlbWEubW9kZWxOYW1lKSApIHtcbiAgICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlLCB0cnVlICkgOiBlbnRpdGllcyBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0TWFueSggbW9kZWwsIHsgfSwgdHJhY2sgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSwgY2FjaGUgPSB0cnVlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbilcbiAgICBcbiAgICBsZXQgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBjYWNoZSAmJiBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpLCBlICkpXG5cbiAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz86IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeUJ5SnNvbjxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgcGFyYW1zKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeS5yZXBsYWNlKE1VTFRJX1NRTF9TRVBBUkFUT1IsICcnKX0pIGFzIGV4aXN0YFxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeSggcXVlcnksIHBhcmFtZXRlcnMgKVxuICAgIFxuICAgIHJldHVybiBpc0FycmF5KHJldCkgJiYgcGFyc2VJbnQocmV0WzBdWydleGlzdCddKSA+IDAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCByZXQgPSBhd2FpdCB0aGlzLnF1ZXJ5QnlKc29uKCBtb2RlbCwgeyBmaWVsZHMgOiAnY291bnQoKikgYXMgY291bnQnLCBjb25kaXRpb246IGNvbmRpdGlvbiB9IClcbiAgICByZXR1cm4gaXNBcnJheShyZXQpID8gcGFyc2VJbnQocmV0WzBdWydjb3VudCddKSA6IDAgXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCAga2V5OiBFbnRpdHlLZXksIGVudGl0eT8gOiBURW50aXR5KSA6IFRFbnRpdHkgeyAgICBcbiAgICBpZiAoICFrZXkgKSB0aHJvdyBuZXcgRXJyb3IoJ2VudGl0eSBrZXkgY2FuIG5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgdGhlRW50aXR5ID0gc2NoZW1hLm5ld0VudGl0eSggbW9kZWwsIGtleSApXG4gICAgZW50aXR5ICYmIHNjaGVtYS5jb3B5UHJvcGVydGllcyggdGhlRW50aXR5LCBlbnRpdHkgKVxuXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHkoc2NoZW1hLCBrZXkpXG4gICAgbGV0IGV4aXN0cyA9IHRyYWNrZWQgIT09IHVuZGVmaW5lZCB8fCB0aGlzLnNlc3Npb25DYWNoZS5leGlzdHMoIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgKVxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja05ldyhzY2hlbWEsIHRoZUVudGl0eSkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWRFbnRpdHlCeUtleShtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuICAgIGNvbnN0IHdoZXJlID0gdGhpcy5tYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIHdoZXJlKVxuXG4gICAgY29uc3Qgcm93cyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggcm93cy5sZW5ndGggPiAxICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkga2V5IGlzIGR1cGxpY2F0ZWQgKCBtb2RlbCA9ICcke21vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgIClcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cy5sZW5ndGggPT09IDEgPyByb3dzWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbG9hZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMubG9hZENhY2hlZCggbW9kZWwsIGtleSwgdHJ1ZSApXG4gICAgaWYgKCBjYWNoZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiBjYWNoZWRcbiAgXG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKCBtb2RlbE5hbWUgKSFcblxuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICkgcmV0dXJuIHRoaXMudW5kZWZpbmVkSWZEZWxldGVkKHRyYWNrZWQpXG4gICAgXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgdGhpcy5sb2FkRW50aXR5QnlLZXkoIG1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIFxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlLnB1dCggbW9kZWxOYW1lLCBrZXksIGVudGl0eSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG5cbiAgICBjb25zdCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICYmIHRyYWNrICkgcmV0dXJuIHRoaXMudW5kZWZpbmVkSWZEZWxldGVkKHRyYWNrZWQpXG5cbiAgICBjb25zdCBlbnRpdHkgPSB0aGlzLnNlc3Npb25DYWNoZS5nZXQ8VEVudGl0eT4obW9kZWxOYW1lLCBrZXkpXG4gICAgaWYgKCBlbnRpdHkgPT09IHVuZGVmaW5lZCB8fCAhIHRyYWNrICkgcmV0dXJuIGVudGl0eVxuXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlbnRpdHkpIGFzIFRFbnRpdHkgXG4gIH1cblxuICBwdWJsaWMgbG9ja0luVGhpc1Nlc3Npb24oIGxvY2tOYW1lOiBzdHJpbmcsIG5vdFRocm93ID0gZmFsc2UgKSA6IGJvb2xlYW4ge1xuICAgIGlmICggIXRoaXMuaG9sZExvY2tzLmhhcyggbG9ja05hbWUgKSApIHtcbiAgICAgIHRoaXMuaG9sZExvY2tzLnNldCggbG9ja05hbWUsIHRoaXMuZW50aXR5VHJhY2tlci5pc0NvbmZpcm1pbmcgKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoICFub3RUaHJvdyApIHRocm93IG5ldyBFcnJvcihgJHtsb2NrTmFtZX0gZXhpc3RzIGFscmVhZHlgKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBzYXZlQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVDaGFuZ2VzKHNlcmlhbD8gOiBudW1iZXIpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCByZXRTZXJpYWwgPSBzZXJpYWwgfHwgKyt0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgIFxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkQ2hhbmdlU3FscygpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goIHNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8PSBzZXJpYWwgKSByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgKCBzZXJpYWwgPSAke3NlcmlhbH0gKWApXG5cbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZFJvbGxiYWNrQ2hhbmdlU3FscyhzZXJpYWwgKyAxKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKHNxbHMpIFxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcblxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwgKyAxKVxuICAgICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gc2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWApXG4gICAgICByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsOiBudW1iZXIgKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5jbGVhckhpc3RvcnkoIHNlcmlhbCApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCk6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuaGlzdG9yeVZlcnNpb25cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIC8vIGRvIG5vdGhpbmcgLlxuICB9XG5cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrRGVsZXRlKChlbnRpdHkgYXMgT2JqZWN0IGFzIEVudGl0eUV4dGVuc2lvbikuX19zY2hlbWFfXywgIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zYWN0aW9uKCkgOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICB9ICBcblxuICBwdWJsaWMgYmVnaW5FbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmJlZ2luQ29uZmlybSgpXG4gIH1cblxuICBwdWJsaWMgY29tbWl0RW50aXR5VHJhbnNhY3Rpb24oKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5jb25maXJtKCkgXG4gICAgdGhpcy5ob2xkTG9ja3MuZm9yRWFjaCggKHYsIGspID0+IHRoaXMuaG9sZExvY2tzW2tdID0gZmFsc2UgKVxuICB9XG5cbiAgcHVibGljIHJvbGxiYWNrRW50aXR5VHJhbnNhY3Rpb24oKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5jYW5jZWxDb25maXJtKClcbiAgICBcbiAgICBsZXQgcmVtb3ZlS2V5cyA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICB0aGlzLmhvbGRMb2Nrcy5mb3JFYWNoKCAodiwgaykgPT4gdiAmJiByZW1vdmVLZXlzLnB1c2goaykgKVxuICAgIHJlbW92ZUtleXMuZm9yRWFjaCggayA9PiB0aGlzLmhvbGRMb2Nrcy5kZWxldGUoaykpXG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxuICBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMUlVFbnRpdHlDYWNoZSBpbXBsZW1lbnRzIEVudGl0eUNhY2hlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUlOX0NBQ0hFRF9DT1VOVCA9IDEwMFxuICBwcml2YXRlIHN0YXRpYyBERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCA9IDEwMDAwXG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBFbnRpdHlDYWNoZU9wdGlvbnNcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBtb2RlbENhY2hlcyA6IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGRlZmF1bHQgOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCB9XG4gICAgLy8gZm9yKCBsZXQgayBpbiB0aGlzLm9wdGlvbnMgKSBcbiAgICAvLyAgIHRoaXMub3B0aW9uc1trXSA9IGlzTnVtYmVyKHRoaXMub3B0aW9uc1trXSkgPyB0aGlzLm9wdGlvbnNba10gOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihMUlVFbnRpdHlDYWNoZS5uYW1lKVxuICAgIHRoaXMubW9kZWxDYWNoZXMgPSBuZXcgTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj4oKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2RlbENhY2hlKG1vZGVsTmFtZSA6IHN0cmluZywgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSwgdGhyb3dJZk5vdEV4aXN0cyA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPExSVS5DYWNoZTxFbnRpdHlLZXksIEVudGl0eT4+IHtcbiAgICBpZiAoIGNyZWF0ZUlmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSB7IFxuICAgICAgLy8gY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIC8vICAgbWF4OiA1MDAsXG4gICAgICAvLyAgIGxlbmd0aDogZnVuY3Rpb24gKG4sIGtleSkgeyByZXR1cm4gbiAqIDIgKyBrZXkubGVuZ3RoIH0sXG4gICAgICAvLyAgIC8vZGlzcG9zZTogZnVuY3Rpb24gKGtleSwgbikgeyBuLmNsb3NlKCkgfSxcbiAgICAgIC8vICAgbWF4QWdlOiAxMDAwICogNjAgKiA2MCBcbiAgICAgIC8vIH1cbiAgICAgIGxldCBtYXhDYWNoZWRDb3VudCA6IG51bWJlcjtcbiAgICAgIGlmICggIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlbE5hbWUpICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gdGhpcy5vcHRpb25zLmRlZmF1bHRcbiAgICAgIGVsc2UgaWYgKCBpc051bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pXG4gICAgICBlbHNlIGlmICggaXNGdW5jdGlvbih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkpXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gKCB0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSBhcyAobW9kZWwpPT4gbnVtYmVyICkoIG1vZGVsTmFtZSApXG4gICAgICBlbHNlIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICAgIG1heENhY2hlZENvdW50ID0gTWF0aC5tYXgoIExSVUVudGl0eUNhY2hlLk1JTl9DQUNIRURfQ09VTlQsIG1heENhY2hlZENvdW50IClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuc2V0KG1vZGVsTmFtZSwgbmV3IExSVTxzdHJpbmcsIEVudGl0eT4oIG1heENhY2hlZENvdW50ICkgKVxuICAgIH1cbiAgICAgaWYgKCB0aHJvd0lmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSBcbiAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsIGNhY2hlICggbmFtZSA9ICcke21vZGVsTmFtZX0nICkgIGRvZXMgbm90IGV4aXN0c2ApIFxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMubW9kZWxDYWNoZXMuZ2V0KG1vZGVsTmFtZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDYWNoZUtleSgga2V5OiBFbnRpdHlLZXkgKSA6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlS2V5KGtleSkgPyBrZXkgYXMgbnVtYmVyIHwgc3RyaW5nIDogKCBrZXkgYXMgS2V5T2JqZWN0ICkua2V5XG4gIH1cblxuICBwdWJsaWMgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkIHsgICAgXG4gICAgaWYgKCBpc1N0cmluZyhtb2RlbE5hbWUpICkge1xuICAgICAgdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCB0cnVlICkhLnJlc2V0KClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuZGVsZXRlKCBtb2RlbE5hbWUgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZvciAoIGxldCBjIG9mIHRoaXMubW9kZWxDYWNoZXMudmFsdWVzKCkgKSB7XG4gICAgICBjLnJlc2V0KClcbiAgICB9XG4gICAgdGhpcy5tb2RlbENhY2hlcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVscygpIDogc3RyaW5nW10ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgZm9yKCBsZXQgbSBvZiB0aGlzLm1vZGVsQ2FjaGVzLmtleXMoKSApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCBtIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG5cbiAgICByZXR1cm4gIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkgPyB1bmRlZmluZWQgOlxuICAgICAgbW9kZWxDYWNoZSEuaGFzKGNhY2hlS2V5KSA/IG1vZGVsQ2FjaGUhLmdldChjYWNoZUtleSkgYXMgVEVudGl0eSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4ge1xuICAgICAgKCFmaWx0ZXIgfHwgKGZpbHRlciAmJiBmaWx0ZXIoIGUgYXMgVEVudGl0eSApKSkgJiYgcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApIFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGVudGl0eTogRW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcHV0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtrZXl9LCBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KGVudGl0eSl9YCkgICAgXG4gICAgdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSwgdHJ1ZSkhLnNldCh0aGlzLmdldENhY2hlS2V5KGtleSksIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgZXZpdCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7Y2FjaGVLZXl9YClcblxuICAgIGNvbnN0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGlmIChtb2RlbENhY2hlKSBtb2RlbENhY2hlLmRlbChjYWNoZUtleSlcbiAgfVxuICBcbiAgcHVibGljIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG1vZGVsTmFtZSwgIHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgZmFsc2UgKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuXG4gIHB1YmxpYyBkdW1wQ2FjaGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBDQUNIRSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgdGhpcy5tb2RlbENhY2hlcy5mb3JFYWNoKCAoY2FjaGUsIG1vZGVsKSA9PiB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tTW9kZWwgJHttb2RlbH0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGNhY2hlLmZvckVhY2goICggZW50aXR5LCBrZXkgKSA9PiB7XG4gICAgICAgIHJlc3VsdCArPSBga2V5ID0gJHt0aGlzLmdldENhY2hlS2V5KCBrZXkgKX0sIGVudGl0eSA9IHske0pTT04uc3RyaW5naWZ5KGVudGl0eSl9fSBcXG5gXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgfSkgICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBzZGIgZnJvbSAnLi9TbWFydERCJ1xuaW1wb3J0ICogYXMgbW9kZWwgZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCAqIGFzIGJsb2NrIGZyb20gJy4vQmxvY2snXG5pbXBvcnQgKiBhcyBzZXNzaW9uIGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0ICogYXMgc3FsaXRlIGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCAqIGFzIGNvbm4gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnLi9Mb2cnXG5cbmV4cG9ydCBuYW1lc3BhY2UgQXNjaENvcmUge1xuICBleHBvcnQgY29uc3QgU21hcnREQiA9IHNkYi5TbWFydERCXG4gIGV4cG9ydCBjb25zdCBNb2RlbFNjaGVtYSA9IG1vZGVsLk1vZGVsU2NoZW1hXG4gIGV4cG9ydCB0eXBlIEJsb2NrID0gYmxvY2suQmxvY2tcbiAgZXhwb3J0IHR5cGUgTG9nTWFuYWdlciA9IGxvZy5Mb2dNYW5hZ2VyXG4gIGV4cG9ydCB0eXBlIExvZ0xldmVsID0gbG9nLkxvZ0xldmVsXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjaywgTWF5YmVVbmRlZmluZWR9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YiBmcm9tICdsZXZlbC1zdWJsZXZlbCdcblxuY29uc3QgbGV2ZWwgPSByZXF1aXJlKCdsZXZlbCcpXG5jb25zdCBTZW5vbmRhcnkgPSByZXF1aXJlKCdsZXZlbC1zZWNvbmRhcnknKVxuXG5leHBvcnQgdHlwZSBHZXRJbmRleFZhbHVlRnVuYyA9IChrZXk6IGFueSwgdmFsdWU6IEpzb25PYmplY3QpID0+IGFueVxuZXhwb3J0IHR5cGUgSW5kZXhGaWVsZCA9IHsgZmllbGROYW1lOiBzdHJpbmcsIGNhbGNJbmRleD86IEdldEluZGV4VmFsdWVGdW5jIH1cblxuZXhwb3J0IGNsYXNzIFN1YkxldmVsTWV0YSB7XG4gIHB1YmxpYyBzdWJOYW1lOiBzdHJpbmdcbiAgcHVibGljIGtleUZpZWxkIDogc3RyaW5nXG4gIHB1YmxpYyBpbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQ6IHN0cmluZywgaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKSkge1xuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KGluZGV4RmllbGRzKVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleEZpZWxkcy5maW5kSW5kZXgoaXRlbSA9PiBmaWVsZE5hbWUgPT09IGl0ZW0uZmllbGROYW1lKVxuICB9XG5cbiAgcHVibGljIGV4aXN0c0luZGV4KGZpZWxkTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSkgPiAtMVxuICB9XG5cbiAgcHVibGljIGFkZEluZGV4KGZpZWxkTmFtZSA6IHN0cmluZywgY2FsY0luZGV4IDogR2V0SW5kZXhWYWx1ZUZ1bmMpOiB0aGlzIHtcbiAgICBpZiAodGhpcy5leGlzdHNJbmRleChmaWVsZE5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbmRleCBvZiBmaWVsZCAnJHtmaWVsZE5hbWV9JyBhbHJlYWR5IGV4aXN0c2ApXG5cbiAgICB0aGlzLmluZGV4RmllbGRzLnB1c2goeyBmaWVsZE5hbWUsIGNhbGNJbmRleCB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlSW5kZXgoZmllbGROYW1lKTogdGhpcyB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpXG4gICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICB0aGlzLmluZGV4RmllbGRzLnNsaWNlKGlkeCwgMSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZSgpIDogQ2FsbGJhY2s8YW55PiB7XG4gIGxldCBjYWxsYmFja1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY2FsbGJhY2sgPSAoZXJyLCB2YWx1ZSkgPT4gZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHZhbHVlKVxuICB9KVxuICBjYWxsYmFjay5wcm9taXNlID0gcHJvbWlzZVxuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+XG4gIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxPcGVyYXRpb24ge1xuICBwdXQ8VD4oa2V5IDogYW55LCB2YWx1ZSA6IFQsIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBjYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgYmF0Y2gob3BlckFycmF5OiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz86IEpzb25PYmplY3QpIDogUHJvbWlzZTx2b2lkPiBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRleGVkTGV2ZWwgZXh0ZW5kcyBMZXZlbEdldCwgTGV2ZWxPcGVyYXRpb24ge1xuICBuYW1lIDogc3RyaW5nXG4gIGluZGV4ZXMgOiBBcnJheTxJbmRleEZpZWxkPlxuICBieUluZGV4KGluZGV4RmllbGQ6IHN0cmluZykgOiBMZXZlbEdldFxuICBnZXRCeTxUPihpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+KTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj5cbn1cblxuZXhwb3J0IGNsYXNzIExldmVsREIgeyAgXG4gIHByaXZhdGUgZGJEaXIgOiBzdHJpbmdcbiAgcHJpdmF0ZSBzdWJNZXRhcyA6IEFycmF5PFN1YkxldmVsTWV0YT5cbiAgcHJpdmF0ZSBzdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuICBwcml2YXRlIHN1YkxldmVsZGIgOiBzdWIuU3VibGV2ZWxcblxuICBjb25zdHJ1Y3RvcihkYkRpciA6IHN0cmluZywgbWV0YSA6IEFycmF5PFN1YkxldmVsTWV0YT4sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZGJEaXIgPSBkYkRpclxuICAgIHRoaXMuc3ViTWV0YXMgPSBuZXcgQXJyYXk8U3ViTGV2ZWxNZXRhPigpLmNvbmNhdChtZXRhKVxuICAgIHRoaXMuc3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD4oKVxuICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpIHtcbiAgICB0aGlzLmxldmVsZGIgPSBsZXZlbCggdGhpcy5kYkRpciwgeyB2YWx1ZUVuY29kaW5nOiAnanNvbicgfSApXG4gICAgdGhpcy5zdWJMZXZlbGRiID0gc3ViKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNLZXlOb3RGb3VuZEVycm9yKCBlcnI6IEVycm9yICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXJyICYmIGVyci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwdWJsaWMgZ2V0IGxldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGJcbiAgfVxuXG4gIHB1YmxpYyBnZXRTdWJMZXZlbCggc3ViTmFtZTogc3RyaW5nICkgOiBJbmRleGVkTGV2ZWwge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxzLmdldChzdWJOYW1lKVxuICAgIGlmICggIXN1YiApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBzdWJMZXZlbCBuYW1lID0gJyR7c3ViTmFtZX0nYClcblxuICAgIHJldHVybiBzdWJcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKG9wZW5DYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KTogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2sob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soY2xvc2VDYWxsYmFjaylcbiAgICBcbiAgICBpZiAodGhpcy5pc0Nsb3NlZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuXG4gICAgKGFzeW5jKCk9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxldmVsZGIuY2xvc2UoKVxuICAgICAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyKVxuICAgICAgfSAgXG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIgJiYgdGhpcy5sZXZlbGRiLmlzT3BlbigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiAoIXRoaXMubGV2ZWxkYikgfHwgdGhpcy5sZXZlbGRiLmlzQ2xvc2VkKClcbiAgfVxuXG4gIHB1YmxpYyBkdW1wKCkgOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlcywgcmVqKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKSAgICAgIFxuICAgICAgdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0oKVxuICAgICAgICAub24oJ2RhdGEnLCBkYXRhID0+IHJlc3VsdC5wdXNoKGBrZXk9ICR7ZGF0YS5rZXl9LCB2YWx1ZT0gJHtkYXRhLnZhbHVlfWApIClcbiAgICAgICAgLm9uKCdlcnJvcicsIGUgPT4gcmVqKGUpIClcbiAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXMocmVzdWx0LmpvaW4oJ1xcclxcbicpKSApXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBJbmRleGVkU3ViTGV2ZWwgaW1wbGVtZW50cyBJbmRleGVkTGV2ZWwge1xuICBwcml2YXRlIHN1Yk5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBrZXlGaWVsZCA6IHN0cmluZ1xuICBwcml2YXRlIGluZGV4QXJyYXkgOiBBcnJheTxJbmRleEZpZWxkPlxuICBwcml2YXRlIGluZGV4ZWRTdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBMZXZlbEdldD5cbiAgcHJpdmF0ZSBzdWJMZXZlbERiIDogYW55XG5cbiAgcHVibGljIGdldCBuYW1lKCkgeyByZXR1cm4gdGhpcy5zdWJOYW1lIH1cbiAgcHVibGljIGdldCBpbmRleGVzKCkgeyByZXR1cm4gdGhpcy5pbmRleEFycmF5IH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN1YmxldmVsOiBhbnksIHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQgOiBzdHJpbmcsIC4uLmluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD4pIHtcbiAgICB0aGlzLnN1YkxldmVsRGIgPSBzdWJsZXZlbFxuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4QXJyYXkgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoLi4uaW5kZXhGaWVsZHMpXG4gICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIExldmVsR2V0PigpXG4gICAgdGhpcy5pbmRleEFycmF5LmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IHNlbm9uZGFyeSA9IFNlbm9uZGFyeSggc3VibGV2ZWwsIGYuZmllbGROYW1lLCBmLmNhbGNJbmRleCApXG4gICAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuc2V0KCBmLmZpZWxkTmFtZSwgc2Vub25kYXJ5IClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGdldCBrZXkoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5RmllbGRcbiAgfVxuICBcbiAgcHJpdmF0ZSBrZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQ8VD4oIGNhbGxiYWNrPzogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+ICkgOiBNYXliZVVuZGVmaW5lZDxDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4+IHtcbiAgICByZXR1cm4gIWNhbGxiYWNrID8gdW5kZWZpbmVkIDogKCBlcnIgOiBFcnJvciwgZGF0YTogVCApID0+IHtcbiAgICAgIGNhbGxiYWNrKCAgTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoIGVyciApID8gbnVsbCA6IGVyciAsIGRhdGEgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PiApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PiB7XG4gICAgY29uc3Qga2V5TGV2ZWwgPSB0aGlzLnN1YkxldmVsRGIgYXMgSW5kZXhlZFN1YkxldmVsIFxuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZ2V0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIGtleUxldmVsLmdldDxUPihrZXksIG9wdGlvbnMsIHRoaXMua2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkKGNhbGxiYWNrKSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvcihlcnIpID8gdW5kZWZpbmVkIDogZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYnlJbmRleCggaW5kZXhGaWVsZE5hbWUgOiBzdHJpbmcgKSA6IExldmVsR2V0IHtcbiAgICBjb25zdCBsZXZlbEdldCA9ICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuZ2V0KGluZGV4RmllbGROYW1lKVxuICAgIGlmICggIWxldmVsR2V0ICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIGluZGV4IGZpZWxkID0gJyR7aW5kZXhGaWVsZE5hbWV9J2ApXG5cbiAgICByZXR1cm4gbGV2ZWxHZXRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxUPihpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBpbmRleExldmVsID0gdGhpcy5ieUluZGV4KCBpbmRleEZpZWxkIClcblxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhnZXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgaW5kZXhMZXZlbC5nZXQ8VD4oa2V5LCB0aGlzLmtleU5vdEZvdW5kVGhlblVuZGVmaW5lZChjYWxsYmFjaykpXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoZXJyKSA/IHVuZGVmaW5lZCA6IGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhwdXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgdGhpcy5zdWJMZXZlbERiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGRlbENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN1YkxldmVsRGIuZGVsKGtleSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmF0Y2goYXJyYXkgOiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz8gOiBKc29uT2JqZWN0LCBiYXRjaENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaCgpXG5cbiAgICBsZXQgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCFpc0Z1bmN0aW9uKG9wdGlvbnMpKVxuICAgIGxldCBvcmdpbmFsQ2FsbGJhY2sgPSBoYXNPcHRpb25zID8gYmF0Y2hDYWxsYmFjayA6IG9wdGlvbnMgYXMgQ2FsbGJhY2s8YW55PlxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayggb3JnaW5hbENhbGxiYWNrIClcbiAgICB0cnkge1xuICAgICAgaWYgKGhhc09wdGlvbnMpXG4gICAgICAgIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaChhcnJheSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cbn1cbiIsImltcG9ydCB7IExldmVsREIsIEluZGV4ZWRMZXZlbCwgU3ViTGV2ZWxNZXRhIH0gZnJvbSAnLi9LVkRCL0xldmVsREInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIgfSBmcm9tICcuL0Jsb2NrJ1xuXG5jb25zdCBMQVNUX0JMT0NLX0hFSUdIVF9LRVkgPSAnX19sYXN0X2Jsb2NrX2hlaWdodF9fJ1xuXG5leHBvcnQgY2xhc3MgTGV2ZWxCbG9jayB7XG4gIHByaXZhdGUgZGIgOiBMZXZlbERCXG4gIHByaXZhdGUgYmxvY2tEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGhpc3RvcnlEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGxhc3RIZWlnaHQgOiBudW1iZXJcblxuICBjb25zdHJ1Y3RvciggZGlyIDogc3RyaW5nLCBsZXZlbE9wdGlvbnMgPSB7fSApIHtcbiAgICAvKiBcbiAgICAgIHsgaWQoNjQpLCB0aW1lc3RhbXAoYmlnaW50KSwgaGVpZ2h0KGJpZ2ludCksIHBheWxvYWRMZW5ndGgoYmlnaW50KSwgcGF5bG9hZEhhc2goNjQpLCBwcmV2QmxvY2tJZCg2NCksIFxuICAgICAgICBwb2ludElkKDY0KSwgcG9pbnRIZWlnaHQoYmlnaW50KSwgZGVsZWdhdGUoNjQpLCBzaWduYXR1cmUoMTI4KSwgY291bnQoYmlnaW50KSB9XG4gICAgKi9cbiAgICBjb25zdCBibG9ja01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdibGsnLCAnaGVpZ2h0JywgW1xuICAgICAgeyBmaWVsZE5hbWU6ICdpZCcgfSwgXG4gICAgICB7IGZpZWxkTmFtZTogJ2RlbGVnYXRlJyB9XG4gICAgXSlcbiAgICBjb25zdCBjaGFuZ2VzTG9nTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2hpcycsICdoZWlnaHQnLCBbXSlcbiAgICBcbiAgICB0aGlzLmRiID0gbmV3IExldmVsREIoIGRpciwgW2Jsb2NrTWV0YSwgY2hhbmdlc0xvZ01ldGFdLCBsZXZlbE9wdGlvbnMgKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IC0xXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldExhc3RCbG9ja0hlaWdodEZyb21EYigpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBsYXN0QmxvY2tIZWlnaHRJdGVtID0gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB7fSkgXG4gICAgaWYgKCBsYXN0QmxvY2tIZWlnaHRJdGVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsYXN0QmxvY2tIZWlnaHRJdGVtID0gdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbiggLTEgKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RiLnB1dChMQVNUX0JMT0NLX0hFSUdIVF9LRVksIGxhc3RCbG9ja0hlaWdodEl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBsYXN0QmxvY2tIZWlnaHRJdGVtLmhlaWdodCAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgb3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLm9wZW4oKVxuICAgIHRoaXMuYmxvY2tEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2JsaycpXG4gICAgdGhpcy5oaXN0b3J5RGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdoaXMnKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IGF3YWl0IHRoaXMuZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIgeyBcbiAgICByZXR1cm4gdGhpcy5sYXN0SGVpZ2h0IFxuICB9XG5cbiAgcHJpdmF0ZSBpc0tleU5vdEZvdW5kRXJyb3IoZSkgOiBib29sZWFuIHsgXG4gICAgcmV0dXJuIGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHJpdmF0ZSBnZXRMYXN0SGVpZ2h0SnNvbiggbGFzdEhlaWdodDogbnVtYmVyICkgOiBCbG9ja0hlYWRlciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlaWdodCA6IGxhc3RIZWlnaHQsXG4gICAgICBpZCA6ICdOVUxMJyxcbiAgICAgIGRlbGVnYXRlIDogJ05VTEwnXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFwcGVuZEJsb2NrKCBibG9jayA6IEJsb2NrSGVhZGVyLCBjaGFuZ2VzOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4gKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFibG9jayB8fCAhYmxvY2suaWQgfHwgIWJsb2NrLmRlbGVnYXRlIHx8IGJsb2NrLmhlaWdodCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJsb2NrIGRhdGFgKVxuXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIucHV0KGJsb2NrLmhlaWdodCwgY2hhbmdlcylcbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogYmxvY2suaGVpZ2h0LCB2YWx1ZTogYmxvY2sgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oYmxvY2suaGVpZ2h0KSB9XG4gICBdKVxuXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2soIGhlaWdodCA6IG51bWJlciApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oaGVpZ2h0KVxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIaXN0b3J5Q2hhbmdlcyggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyICkgOiBQcm9taXNlPE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0OyBoIDwgbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gYXdhaXQgdGhpcy5oaXN0b3J5RGIuZ2V0PEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oaClcbiAgICAgIGNoYW5nZXMgJiYgcmV0LnNldCggaCwgY2hhbmdlcyApXG4gICAgfVxuICAgIHJldHVybiByZXQgXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBkZWxldGVMYXN0QmxvY2soIGhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGhlaWdodCAhPT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbGFzdCBibG9jayBoZWlnaHQgJyR7aGVpZ2h0fSdgKVxuXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ2RlbCcsIGtleSA6IGhlaWdodCB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbiggaGVpZ2h0IC0gMSApIH0gXG4gICAgXSlcbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5kZWwoIGhlaWdodCApXG4gICAgXG4gICAgdGhpcy5sYXN0SGVpZ2h0IC0tXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0Qnk8QmxvY2tIZWFkZXI+KCdpZCcsIGJsb2NrSWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodCA7IGggPD0gbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrKGgpXG4gICAgICBibG9jayAmJiByZXN1bHQucHVzaCggYmxvY2shIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIEtleU9iamVjdCwgQ29kZUNvbnRyYWN0IGFzIERCQywgcGFydGlhbCwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSB7IG5ldygpIDogVCB9XG5leHBvcnQgdHlwZSBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gPSBzdHJpbmcgfCBDb25zdHJ1Y3RvcjxURW50aXR5PlxuXG5leHBvcnQgZW51bSBGaWVsZFR5cGVzIHtcbiAgU3RyaW5nICAgPSAnU3RyaW5nJyxcbiAgTnVtYmVyICAgPSAnTnVtYmVyJyxcbiAgQmlnSW50ICAgPSAnQmlnSW50JyxcbiAgVGV4dCAgICAgPSAnVGV4dCdcbn1cblxuZXhwb3J0IHR5cGUgRmllbGRUeXBlID0gc3RyaW5nIHwgRmllbGRUeXBlc1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBwcmltYXJ5X2tleT8gOiBib29sZWFuLFxuICBjb21wb3NpdGVfa2V5PyA6IGJvb2xlYW4sXG4gIGRlZmF1bHQ/OiBudW1iZXJ8c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWEge1xuICB0YWJsZT8gOiBzdHJpbmcsXG4gIG1lbW9yeT8gOiBib29sZWFuLFxuICByZWFkb25seT8gOiBib29sZWFuLFxuICBsb2NhbD8gOiBib29sZWFuLFxuICB0YWJsZUZpZWxkcyA6IEFycmF5PEZpZWxkPlxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlS2V5IGltcGxlbWVudHMgS2V5T2JqZWN0IHtcbiAgcHJpdmF0ZSBrZXlPYmplY3QgOiBKc29uT2JqZWN0XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBrZXlPYmplY3QgOiBKc29uT2JqZWN0ICkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleU9iamVjdCcsICgpID0+IERCQy5ub3ROdWxsKGtleU9iamVjdCkpXG5cbiAgICB0aGlzLmtleU9iamVjdCA9IGtleU9iamVjdFxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYWtlPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBURW50aXR5ICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsICgpID0+IERCQy5ub3ROdWxsKHNjaGVtYSkpXG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgc2NoZW1hLmlzQ29tcHNpdGVLZXksICdtb2RlbCBtdXN0IGluZGVudGlmeSBieSBjb21wb3NpdGUga2V5JylcbiAgICBEQkMuYXJndW1lbnQoICdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoIHBhcnRpYWwoZW50aXR5LCBzY2hlbWEuY29tcG9zaXRlS2V5cykgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKCBrZXlKc29uU3RyaW5nOiBzdHJpbmcgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5SnNvblN0cmluZycsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGtleUpzb25TdHJpbmcpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoSlNPTi5wYXJzZSgga2V5SnNvblN0cmluZyApLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5SnNvbigpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMua2V5T2JqZWN0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9zaXRlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoISBrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleS5rZXlKc29uXG59XG5cbmV4cG9ydCBjbGFzcyBNb2RlbFNjaGVtYSB7XG4gIHByaXZhdGUgc2NoZW1hOiBTY2hlbWFcbiAgcHJpdmF0ZSBuYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBtZW1vcnk6IGJvb2xlYW5cbiAgcHJpdmF0ZSByZWFkb25seTogYm9vbGVhblxuICBwcml2YXRlIGxvY2FsOiBib29sZWFuXG5cbiAgcHJpdmF0ZSBwS2V5OiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+XG4gIHByaXZhdGUgY0tleXM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZHM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZFR5cGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG4gIHByaXZhdGUgYWxsSW5kZXhlczogQXJyYXk8c3RyaW5nPlxuXG4gIGNvbnN0cnVjdG9yKHNjaGVtYTogU2NoZW1hLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNjaGVtYSA9IE9iamVjdC5hc3NpZ24oe30gLCBzY2hlbWEpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMubWVtb3J5ID0gc2NoZW1hLm1lbW9yeSA9PT0gdHJ1ZVxuICAgIHRoaXMucmVhZG9ubHkgPSBzY2hlbWEucmVhZG9ubHkgPT09IHRydWVcbiAgICB0aGlzLmxvY2FsID0gc2NoZW1hLmxvY2FsID09PSB0cnVlXG4gICAgdGhpcy5hdHRhY2hWZXJzaW9uRmllbGQoIHRoaXMuc2NoZW1hIClcbiAgICB0aGlzLnBhcnNlRmllbGRzKClcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoVmVyc2lvbkZpZWxkKCBzY2hlbWEgOiBTY2hlbWEgKSB7XG4gICAgaWYgKCBzY2hlbWEudGFibGVGaWVsZHMuZmluZCggZiA9PiBmLm5hbWUgPT09ICdfdmVyc2lvbl8nKSApIHJldHVyblxuICAgIHNjaGVtYS50YWJsZUZpZWxkcy5wdXNoKHtcbiAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLFxuICAgICAgdHlwZTogRmllbGRUeXBlcy5OdW1iZXIsXG4gICAgICBkZWZhdWx0OiAwICAgICBcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIHR5cGVcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHRoaXMuc2V0RGVmYXVsdFZhbHVlcyggZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5zZXRLZXkoIGVudGl0eSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCBzZXREZWZhdWx0VmFsdWVzPFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4ge1xuICAgICAgZi5kZWZhdWx0ICE9PSB1bmRlZmluZWQgJiYgKCBlbnRpdHlbZi5uYW1lXSA9IGYuZGVmYXVsdCApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBjb3B5UHJvcGVydGllczxURW50aXR5PiggZGVzdDogVEVudGl0eSwgc3JjIDogVEVudGl0eSwgaW5jbHVkZUtleSA9IGZhbHNlICkge1xuICAgIHRoaXMuYWxsRmllbGRzLmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IG5lZWRDb3B5ID0gKGluY2x1ZGVLZXkgfHwgKCB0aGlzLmNLZXlzLmluZGV4T2YoZikgPCAwICYmIGYgIT09IHRoaXMucHJpbWFyeUtleSApKSAmJiBzcmNbZl0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKCBuZWVkQ29weSApIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogQXJyYXk8c3RyaW5nPlxuICBidWlsZEluc2VydCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFVwZGF0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmUgOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbn1cblxuZXhwb3J0IGNsYXNzIEpzb25TcWxCdWlsZGVyIGltcGxlbWVudHMgU3FsQnVpbGRlciB7XG5cbiAgcHJpdmF0ZSBnZXRUYWJsZU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY2hhbmdlQ2FzZS5zbmFrZUNhc2UobW9kZWxOYW1lKSArICdzJ1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmltYXJ5S2V5Q29uZGl0aW9uKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkgKCB7fSwgIGtleSApXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTY2hlbWEgKHNjaGVtYTogTW9kZWxTY2hlbWEpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgbGV0IHNxbHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpIFxuICAgIGNvbnN0IHNjaGVtYU9iamVjdCA9IE9iamVjdC5hc3NpZ24oeyB0eXBlOiAnY3JlYXRlJ30sIGRlZXBDb3B5KHNjaGVtYS5zY2hlbWFPYmplY3QpKSBcbiAgICAvLyBUT0RPOiBnZW5lcmF0ZSBjb21wb3NpdGUga2V5IHNxbFxuICAgIGxldCBzY2hlbWFTcWwgPSBKc29uU3FsLmJ1aWxkKHNjaGVtYU9iamVjdClcbiAgICBzcWxzLnB1c2goc2NoZW1hU3FsLnF1ZXJ5KVxuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBzY2hlbWEuaW5kZXhlcy5mb3JFYWNoKCBmaWVsZCA9PiB7XG4gICAgICBzcWxzLnB1c2goSnNvblNxbC5idWlsZCh7XG4gICAgICAgIHR5cGU6ICdpbmRleCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIG5hbWU6IHRhYmxlTmFtZSArICdfJyArIGZpZWxkLFxuICAgICAgICBpbmRleE9uOiBmaWVsZFxuICAgICAgfSkucXVlcnkpXG4gICAgfSlcblxuICAgIHJldHVybiBzcWxzXG4gIH1cblxuICBwdWJsaWMgYnVpbGRJbnNlcnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkluc2VydCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdpbnNlcnQnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgdmFsdWVzOiBmaWVsZFZhbHVlc1xuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkRlbGV0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICBjb25kaXRpb246IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFVwZGF0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpOiBTcWxBbmRQYXJhbWV0ZXJzIHsgICAgXG4gICAgLy8gY29uc3QgbW9kaWZpZXIgPSB0aGlzLmVzY2FwZVNpbmdsZVF1b3RlKGZpZWxkVmFsdWVzKVxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG5cbiAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbmRpdGlvblsnX3ZlcnNpb25fJ10gPSB2ZXJzaW9uICBcblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5VcGRhdGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIG1vZGlmaWVyOiBmaWVsZFZhbHVlcyxcbiAgICAgIGNvbmRpdGlvbjogY29uZGl0aW9uXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTZWxlY3Qoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzT3JQYXJhbXM6IEFycmF5PHN0cmluZz4gfCBKc29uT2JqZWN0LCB3aGVyZT8gOiBTcWxDb25kaXRpb24sIFxuICAgIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKTogU3FsQW5kUGFyYW1ldGVycyB7XG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIFxuICAgIGxldCBxdWVyeU9wdGlvbnMgOiBKc29uT2JqZWN0XG4gICAgaWYgKCAhaXNBcnJheSggZmllbGRzT3JQYXJhbXMgKSApIHtcbiAgICAgIGxldCBwYXJhbXMgPSBmaWVsZHNPclBhcmFtcyBhcyBKc29uT2JqZWN0XG4gICAgICBxdWVyeU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7IHR5cGU6ICdzZWxlY3QnLCB0YWJsZTogdGFibGVOYW1lIH0sIHBhcmFtcyApXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGZpZWxkcyA9IGZpZWxkc09yUGFyYW1zIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG4gICAgICBsZXQgbG8gOiBMaW1pdEFuZE9mZnNldCA9IGlzTnVtYmVyKCByZXN1bHRSYW5nZSApID8gIHsgbGltaXQgOiByZXN1bHRSYW5nZSB9IDogcmVzdWx0UmFuZ2UgfHwgeyB9XG4gICAgICBsZXQgb3JkZXIgPSBzb3J0IHx8IHt9XG4gICAgICBmb3IgKCBsZXQga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhvcmRlcikgICkge1xuICAgICAgICBsZXQgb3JkZXJWYWx1ZSA9IG9yZGVyW2tleV0gfHwgLTFcbiAgICAgICAgb3JkZXJba2V5XSA9IChvcmRlclZhbHVlID09PSAnQVNDJykgPyAxIDogKCAob3JkZXJWYWx1ZSA9PT0gJ0RFU0MnKSA/IC0xIDogb3JkZXJWYWx1ZSApXG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIGZpZWxkczogZmllbGRzLFxuICAgICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgICBsaW1pdDogbG8ubGltaXQsXG4gICAgICAgIG9mZnNldDogbG8ub2Zmc2V0LFxuICAgICAgICBzb3J0OiBvcmRlcixcbiAgICAgICAgam9pbjogam9pblxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuU2VsZWN0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZChxdWVyeU9wdGlvbnMpKVxuICB9XG59IiwiaW1wb3J0IHsgU3FsaXRlV3JhcHBlciB9IGZyb20gJy4vU3FsaXRlV3JhcHBlcidcbmltcG9ydCB7IE1VTFRJX1NRTF9TRVBBUkFUT1IsIFNxbEFuZFBhcmFtZXRlcnMsIFNxbFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24sIENvbm5lY3Rpb25PcHRpb25zLCBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5cblxuY2xhc3MgU3FsaXRlVHJhbnNhY3Rpb24gaW1wbGVtZW50cyBEQlRyYW5zYWN0aW9uIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbW1pdCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ0NPTU1JVDsnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0s7JykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OOycpXG4gICAgcmV0dXJuIG5ldyBTcWxpdGVUcmFuc2FjdGlvbih0aGlzKVxuICB9XG59IiwiaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nTWFuYWdlciwgTG9nZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgU3FsUGFyYW1ldGVycywgU3FsQW5kUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcblxuaW1wb3J0ICogYXMgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnXG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVXcmFwcGVyIHtcbiAgcHJpdmF0ZSBkYiA6IERhdGFiYXNlXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU3FsaXRlV3JhcHBlci5uYW1lKVxuICB9XG5cbiAgcHVibGljIG9wZW4oZGJGaWxlUGF0aDogc3RyaW5nLCBjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiRmlsZVBhdGgpXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAgKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRiLm9wZW4gfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luT3BlbihkYkZpbGVQYXRoOiBzdHJpbmcpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLm9wZW4pLmNhbGwodGhpcywgZGJGaWxlUGF0aClcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRoaXMuZGIgJiYgdGhpcy5pc0Nvbm5lY3RlZCApIHtcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpIFxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIGNsb3NlYCApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgY2xvc2VkIGFscmVhZHlgKVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBjbG9zZWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIGVmZmVjdGVkID0gJHtyZXQucmVzdWx0LnJvd3NFZmZlY3RlZH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxhbnk+PiApIDogQXJyYXk8YW55PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PGFueT4oKSB9XG4gICAgdHJ5IHtcbiAgICAgIHJldC5yZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5hbGwocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShzcWwhLnBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCByZXQuZXJyLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBFbnRpdHlLZXksIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciwgaXNDb21wb3NpdGVLZXkgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlQcm94eSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snXG5pbXBvcnQgeyBCbG9ja0NhY2hlIH0gZnJvbSAnLi9CbG9ja0NhY2hlJ1xuXG50eXBlIE5hbWVkSG9vazxURnVuYz4gPSB7IG5hbWU6IHN0cmluZywgaG9vayA6IFRGdW5jIH1cbmV4cG9ydCB0eXBlIENvbW1pdEJsb2NrSG9vayA9ICggYmxvY2sgOiBCbG9jayApID0+IHZvaWRcbmV4cG9ydCB0eXBlIFJvbGxiYWNrQmxvY2tIb29rID0gKCBmcm9tSGVpZ2h0IDogbnVtYmVyLCB0b0hlaWdodCA6IG51bWJlciApID0+IHZvaWRcblxuZXhwb3J0IHR5cGUgU21hcnREQk9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBjYWNoZWQgaGlzdG9yeSBjb3VudChibG9jayBjb3VudCksIHVzZWQgdG8gcm9sbGJhY2sgYmxvY2tcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGhpc3RvcnlGb3JSb2xsYmFjaz8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIGNsZWFuIHBlcnNpc3RlZCBoaXN0b3J5IGF1dG9tYXRpY2FsbHlcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9DbGVhblBlcnNpc3RlZEhpc3Rvcnk/IDogYm9vbGVhbixcblxuICAvKipcbiAgICogY2FjaGVkIGxhc3QgYmxvY2sgY291bnQgXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBjYWNoZWRCbG9ja0NvdW50PyA6IG51bWJlcixcblxuICAvKipcbiAgICogbWF4IGNhY2hlZCBlbnRpdHkgY291bnQsIGNvbmZpZyBpdCBwZXIgbW9kZWwsIExSVSAgXG4gICAqIHNhbXBsZTogeyBVc2VyOiAyMDAsIFRyYW5zOiA1MDAwIH0gbWF4IGNhY2hlZCAyMDBzIFVzZXIg77yMNTAwMCBmb3IgVHJhbnNcbiAgICogQGRlZmF1bHQgNTAwMCBlYWNoIG1vZGVsXG4gICAqL1xuICBlbnRpdHlDYWNoZU9wdGlvbnM/IDogRW50aXR5Q2FjaGVPcHRpb25zXG5cbn1cblxuLyoqXG4gKiBPUk0gbGlrZSB0byBvcGVyYXRlIGJsb2NrY2hhaW4gZGF0YVxuICogQGV2ZW50IHJlYWR5IGVtbWl0IGFmdGVyIGluaXRpYWxpemVkXG4gKiBAZXZlbnQgY2xvc2UgZW1taXQgYWZ0ZXIgY2xvc2VkXG4gKi9cbmV4cG9ydCBjbGFzcyBTbWFydERCIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBvcHRpb25zIDogU21hcnREQk9wdGlvbnNcbiAgcHJpdmF0ZSBjb21taXRCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj5cbiAgcHJpdmF0ZSByb2xsYmFja0Jsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+XG4gIHByaXZhdGUgY2FjaGVkQmxvY2tzIDogQmxvY2tDYWNoZVxuICBwcml2YXRlIHNjaGVtYXMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgYmxvY2tTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgbG9jYWxTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgYmxvY2tEQiA6IExldmVsQmxvY2tcbiAgcHJpdmF0ZSBjdXJyZW50QmxvY2sgOiBCbG9jayB8IG51bGxcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgXG4gICAqIE5PVElDIDogeW91IG5lZWQgY2FsbCBpbml0IGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gZGJQYXRoIHBhdGggb2YgYmxvY2tjaGFpbiBkYlxuICAgKiBAcGFyYW0gbGV2ZWxCbG9ja0RpciBwYXRoIG9mIGJsb2NrIGhlYWRlciBkYlxuICAgKiBAcGFyYW0gb3B0aW9ucyBvZiBTbWFydERCXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRiUGF0aDogc3RyaW5nLCBsZXZlbEJsb2NrRGlyOiBzdHJpbmcsIG9wdGlvbnM/IDogU21hcnREQk9wdGlvbnMgKSB7XG4gICAgREJDLmFyZ3VtZW50KCdkYlBhdGgnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGRiUGF0aCkpXG4gICAgREJDLmFyZ3VtZW50KCdsZXZlbEJsb2NrRGlyJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShsZXZlbEJsb2NrRGlyKSlcblxuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdGlvbnMgPSAge1xuICAgICAgY2FjaGVkQmxvY2tDb3VudCA6IDEwLFxuICAgICAgaGlzdG9yeUZvclJvbGxiYWNrIDogMTAsXG4gICAgICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5IDogZmFsc2UsICAgICAgXG4gICAgICBlbnRpdHlDYWNoZU9wdGlvbnMgOiB7IGRlZmF1bHQgOiA1MDAwIH1cbiAgICB9IHx8IG9wdGlvbnNcblxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj4oKVxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+KClcbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgcHJpdmF0ZSBwcmVDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBibG9jayApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdENvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5lbWl0KCduZXdCbG9jaycsIGJsb2NrKVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBmcm9tLCB0byApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdFJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMuZW1pdCgncm9sbGJhY2tCbG9jaycsIHsgZnJvbSwgdG8gfSApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBibG9jayApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogQ29tbWl0QmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG4gICAgXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rIDogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5jb21taXRCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGZyb21IZWlnaHQsIHRvSGVpZ2h0ICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IFJvbGxiYWNrQmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcblxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBpbml0aWFsaXplIFNtYXJ0REIgLCB5b3UgbmVlZCBjYWxsIHRoaXMgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBzY2hlbWFzIHRhYmxlIHNjaGVtYXMgaW4gRGF0YWJhc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBpbml0KHNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzY2hlbWFzJywgKCk9PiBEQkMubm90TnVsbChzY2hlbWFzKSlcblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5jb25uZWN0KCkgICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLm9wZW4oKVxuXG4gICAgZm9yKCBjb25zdCBzY2hlbWEgb2Ygc2NoZW1hcyApIHtcbiAgICAgIHRoaXMuc2NoZW1hcy5zZXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYSApXG4gICAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbiggc2NoZW1hIClcblxuICAgICAgc2Vzc2lvbi5yZWdpc3RlclNjaGVtYShzY2hlbWEpXG4gICAgICBzZXNzaW9uLnN5bmNTY2hlbWEoc2NoZW1hKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgc3luYyBzY2hlbWEgbW9kZWwgPSAke3NjaGVtYS5tb2RlbE5hbWV9IGApXG5cbiAgICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIHsgXG4gICAgICAgIGxldCBpdGVtcyA9IGF3YWl0IHNlc3Npb24uZ2V0TWFueSggc2NoZW1hLm1vZGVsTmFtZSwge30sIGZhbHNlLCB0cnVlIClcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgbW9kZWwgJHtzY2hlbWEubW9kZWxOYW1lfSBjYWNoZWQgJHtpdGVtcy5sZW5ndGh9IGVudGl0aWVzIGApXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZW1pdCggJ3JlYWR5JywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogZnJlZSByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuY2xvc2UoKVxuICAgIFxuICAgIHRoaXMuZW1pdCgnY2xvc2VkJywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogaGVpZ2h0IG9mIGxhc3QgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJsb2NrREIubGFzdEJsb2NrSGVpZ2h0XG4gIH1cblxuICAvKipcbiAgICogYmxvY2tzIGNvdW50XG4gICAqL1xuICBwdWJsaWMgZ2V0IGJsb2Nrc0NvdW50KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDFcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXN0IGNvbW1pdGVkIGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9jaygpIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICAvLyBUT0RPOiByZXR1cm4gbGFzdCBibG9jayBjb3B5ID9cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gIH1cblxuICAvKipcbiAgICogaG9sZCBhIGxvY2sgbmFtZSB3aGljaCBvbmx5IHN1Y2NlZWQgaW4gZmlyc3QgdGltZSBvZiBlYWNoIGJsb2NrLlxuICAgKiBAcGFyYW0gbG9ja05hbWUgbG9jayBuYW1lXG4gICAqIEBwYXJhbSBub3RUaHJvdyBkbyBub3QgdGhyb3cgZXhjZXB0aW9uIGlmIGxvY2sgZmFpbGVkXG4gICAqL1xuICBwdWJsaWMgbG9ja0luQ3VycmVudEJsb2NrKCBsb2NrTmFtZTogc3RyaW5nLCBub3RUaHJvdyA9IGZhbHNlICkgOiBib29sZWFuIHtcbiAgIHJldHVybiB0aGlzLmJsb2NrU2Vzc2lvbi5sb2NrSW5UaGlzU2Vzc2lvbiggbG9ja05hbWUsIG5vdFRocm93KVxuICB9XG5cbiAgLyoqXG4gICAqIGJlZ2luIGEgY29udHJhY3QgdHJhbnNhY3Rpb24gd2hpY2ggZWZmZWN0IGVudGl0aWVzIGluIG1lbW9yeVxuICAgKi9cbiAgcHVibGljIGJlZ2luQ29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmJlZ2luRW50aXR5VHJhbnNhY3Rpb24oKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgY29tbWl0Q29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNvbW1pdEVudGl0eVRyYW5zYWN0aW9uKClcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgcm9sbGJhY2tDb250cmFjdCgpIDogdm9pZCB7XG4gICAgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tFbnRpdHlUcmFuc2FjdGlvbigpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBiZWdpbiBhIG5ldyBibG9ja1xuICAgKiBAcGFyYW0gYmxvY2tIZWFkZXIgXG4gICAqL1xuICBwdWJsaWMgYmVnaW5CbG9jayggYmxvY2s6IEJsb2NrICkgOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB2ZXJpZnkgYmxvY2tIZWFkZXIgaGVyZVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCAoKT0+IERCQy5ub3ROdWxsKGJsb2NrKSlcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgYmxvY2suaGVpZ2h0ID09PSB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDEsIGBpbnZhbGlkIGJsb2NrIGhlaWdodCAke2Jsb2NrLmhlaWdodH0sIGxhc3QgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgXG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYmxvY2sgaGVpZ2h0ID0gJHtibG9jay5oZWlnaHR9YClcbiAgICB0aGlzLmN1cnJlbnRCbG9jayA9IGJsb2NrXG4gIH1cblxuICAvKipcbiAgICogY29tbWl0IGJsb2NrIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb21taXRCbG9jaygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudEJsb2NrKSB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgYmxvY2sgaXMgbnVsbCcpXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrLmhlaWdodH1gKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVDb21taXRCbG9jayggdGhpcy5jdXJyZW50QmxvY2sgKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGJsb2NrSGVhZGVyLCAndHJhbnNhY3Rpb25zJylcbiAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIGJsb2NrSGVhZGVyLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5zYXZlQ2hhbmdlcyggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IClcbiAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IC0gdGhpcy5vcHRpb25zLmhpc3RvcnlGb3JSb2xsYmFjayEgKVxuICAgICAgdGhpcy5jYWNoZWRCbG9ja3MucHV0KCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdENvbW1pdEJsb2NrKCB0aGlzLmxhc3RCbG9jayEgKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHsgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgY29tbWl0QmxvY2sgKCBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrIS5oZWlnaHR9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKHRoaXMuY3VycmVudEJsb2NrLmhlaWdodClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBibG9jayBjaGFuZ2VzXG4gICAqIEBwYXJhbSBoZWlnaHQgcm9sbGJhY2sgdG8gaGVpZ2h0KGV4Y2x1ZGUpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tCbG9jayggaGVpZ2h0PzogbnVtYmVyICkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2hlaWdodCcsICFoZWlnaHQgfHwgaGVpZ2h0IDw9IHRoaXMubGFzdEJsb2NrSGVpZ2h0LCBcbiAgICAgIGBoZWlnaHQgbXVzdCBsZXNzIG9yIGVxdWFsIGxhc3RCbG9ja0hlaWdodCAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG5cbiAgICBjb25zdCBmcm9tSGVpZ2h0ID0gdGhpcy5jdXJyZW50QmxvY2sgPyB0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0IDogdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICBjb25zdCB0b0hlaWdodCA9IGhlaWdodCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sYXN0QmxvY2tIZWlnaHQgOiBoZWlnaHRcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVSb2xsYmFja0Jsb2NrKCBmcm9tSGVpZ2h0LCAgdG9IZWlnaHQgKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZlciA9IHRoaXMuYmxvY2tTZXNzaW9uLmhpc3RvcnlWZXJzaW9uO1xuICAgICAgaWYgKCBmcm9tSGVpZ2h0IDwgdmVyLm1pbiApIHsgLy8gbG9hZCBoaXN0b3J5IGZyb20gbGV2ZWxkYiwgaWYgY2FjaGVkIGhpc3RvcnkgbGVzcyB0aGFuIHJvbGxiYWNrIGhlaWdodCBcbiAgICAgICAgbGV0IGhpc3RvcnkgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0SGlzdG9yeUNoYW5nZXMoIGZyb21IZWlnaHQsIHZlci5taW4gKVxuICAgICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyggdG9IZWlnaHQgKVxuICAgICAgd2hpbGUoIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID4gdG9IZWlnaHQgKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2soIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgICAgdGhpcy5jYWNoZWRCbG9ja3MuZXZpdCggdGhpcy5sYXN0QmxvY2tIZWlnaHQsIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuICAgICAgLy8gZW1pdCBldmVudFxuICAgICAgdGhpcy5wb3N0Um9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0ICkgICAgICBcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1Mgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWApXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWAsIGVycilcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzYXZlIGxvY2FsIHRhYmxlcyAobm90IGluIGJsb2NrIC0tLSB3aGljaCBkZWZpbmUgaW4gc2NoZW1hIGJ5IGxvY2FsIDogdHJ1ZSkgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUxvY2FsQ2hhbmdlcygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgc2VyaWFsID0gYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uc2F2ZUNoYW5nZXMoKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsIClcbiAgICByZXR1cm4gc2VyaWFsXG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgbG9jYWwgdGFibGVzIGNoYW5nZXMgc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKiBAcGFyYW0gc2VyaWFsIHNlcmlhbCBudW1iZXIgcmV0dXJuIGZyb20gc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrTG9jYWxDaGFuZ2VzKHNlcmlhbDogbnVtYmVyKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2VyaWFsJywgc2VyaWFsID49IDAsIGBzZXJpYWwgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGVudGl0eSBrZXlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgZ2V0RW50aXR5S2V5PFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKTogTWF5YmVVbmRlZmluZWQ8RW50aXR5S2V5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuICAgIFxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsLCB0cnVlKSFcbiAgICByZXR1cm4gc2NoZW1hLmdldEtleSggZW50aXR5IClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgdHJhY2tpbmcgZW50aXR5ICBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBQYXJ0aWFsPFRFbnRpdHk+ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuXG4gICAgbGV0IGtleSA9IHRoaXMuZ2V0RW50aXR5S2V5KCBtb2RlbCwgIGVudGl0eSApXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBrZXkgIT09IHVuZGVmaW5lZCAsICdjYW4gbm90IGdldCBlbnRpdHkga2V5JyApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmxvYWQoIG1vZGVsLCBrZXkhIClcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSBuZXcgZW50aXR5IHdoaWNoIGNoYW5nZSB3aWxsIGJlIHRyYWNrZWQgYW5kIHBlcnNpc3RlbnRlZCAoYnkgc2F2ZUNoYW5nZXMpIGF1dG9tYXRpY2FsbHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleSB3aGljaCB1bmlxdWVkIGluIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBlbnRpdHkgcHJvdG90eXBlIGVudGl0eSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgY29weSB0byByZXN1bHQgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNraW5nIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleU9yRW50aXR5OiBFbnRpdHlLZXkgfCBURW50aXR5KSA6IFRFbnRpdHkge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleU9yRW50aXR5JywgKCk9PiBEQkMubm90TnVsbChrZXlPckVudGl0eSkpXG4gICAgXG4gICAgbGV0IGtleSA6IEVudGl0eUtleVxuICAgIGxldCBlbnRpdHk6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuXG4gICAgaWYgKCBpc1ByaW1pdGl2ZUtleSgga2V5T3JFbnRpdHkgKSB8fCBpc0NvbXBvc2l0ZUtleSgga2V5T3JFbnRpdHkgKSApIHsgXG4gICAgICBrZXkgPSBrZXlPckVudGl0eSBhcyBFbnRpdHlLZXkgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZW50aXR5ID0ga2V5T3JFbnRpdHkgYXMgVEVudGl0eVxuICAgICAga2V5ID0gc2NoZW1hLmdldEtleShlbnRpdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmNyZWF0ZShtb2RlbCwga2V5LCBlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogdXBkYXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgLy8gcHVibGljIHVwZGF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gIC8vICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgLy8gICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHByb3hpZWQgb2JqZWN0YCApXG5cbiAgLy8gICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgLy8gICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkudXBkYXRlKGVudGl0eSlcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBkZWxldGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCAnaXMgbm90IGEgdHJhY2tpbmcgZW50aXR5JyApXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmRlbGV0ZShlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBhbmQgZGF0YWJhc2VcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gZGF0YWJhc2UgYnkgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb248VEVudGl0eT4oc2NoZW1hISlcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnk8VEVudGl0eT4obW9kZWwsIGNvbmRpdGlvbiwgZmFsc2UsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nLCBjb25kaXRpb24gPSAnJHtKU09OLnN0cmluZ2lmeShjb25kaXRpb24pfScgKWApXG4gICAgXG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IHRoaXMuYXR0YWNoKCBtb2RlbCwgaXRlbXNbMF0pXG4gIH1cblxuICAgIC8qKlxuICAgKiBnZXQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIGZpbmQgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbiwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBvbmx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5LCB0cnVlKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGZpbHRlciBmaWx0ZXIgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+ICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRBbGxDYWNoZWQoIG1vZGVsLCBmaWx0ZXIgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5leGlzdHMobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBjb3VudCByZWNvcmRzIGNvdW50IGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmNvdW50KG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja3MgOiBBcnJheTxCbG9ja0hlYWRlcj4sICBnZXRUcmFuc2FjdGlvbnM6ICgpID0+IFByb21pc2U8QXJyYXk8VHJhbnNhY3Rpb24+PiApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBsZXQgdHJhbnNHcm91cCA9IG5ldyBNYXA8c3RyaW5nLCBBcnJheTxUcmFuc2FjdGlvbj4+KClcbiAgICBsZXQgdHJhbnNhY3Rpb25zID0gYXdhaXQgZ2V0VHJhbnNhY3Rpb25zKClcblxuICAgIHRyYW5zYWN0aW9ucy5mb3JFYWNoKCB0ID0+IHtcbiAgICAgIGlmICghdHJhbnNHcm91cC5oYXMoIHQuYmxvY2tJZCApKSB0cmFuc0dyb3VwLnNldCggdC5ibG9ja0lkLCBuZXcgQXJyYXk8VHJhbnNhY3Rpb24+KCkgKVxuICAgICAgdHJhbnNHcm91cC5nZXQoIHQuYmxvY2tJZCApIS5wdXNoKCB0IClcbiAgICB9IClcblxuICAgIGJsb2Nrcy5mb3JFYWNoKCBiID0+IGJbJ3RyYW5zYWN0aW9ucyddID0gdHJhbnNHcm91cC5nZXQoYi5pZCEpIClcbiAgICByZXR1cm4gYmxvY2tzIGFzIEFycmF5PEJsb2NrPlxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5Q2FjaGVkQmxvY2soIGdldENhY2hlQmxvY2sgOiAoKSA9PiBNYXliZVVuZGVmaW5lZDxCbG9jaz4sIHdpdGhUcmFuc2FjdGlvbnMgOiBib29sZWFuICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGxldCBjYWNoZWRCbG9jayA9IGdldENhY2hlQmxvY2soKVxuICAgIGlmICggY2FjaGVkQmxvY2sgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcbiAgICBcbiAgICBsZXQgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbih7fSwgY2FjaGVkQmxvY2spXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHtcbiAgICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIHJlc3VsdCwgJ3RyYW5zYWN0aW9ucycpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGhlaWdodFxuICAgKiBAcGFyYW0gaGVpZ2h0IGJsb2NrIGhlaWdodFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlIZWlnaHQoIGhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPj0gMCAsICdoZWlnaHQgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvJylcbiAgICBcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KGhlaWdodCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9jayggaGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGJsb2NrIGlkXG4gICAqIEBwYXJhbSBibG9ja0lkIGJsb2NrIGlkIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZywgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0QnlJZChibG9ja0lkKSwgd2l0aFRyYW5zYWN0aW9ucyApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtaW5IZWlnaHQsIG1heEhlaWdodCcsIG1pbkhlaWdodCA+PSAwICYmIG1heEhlaWdodCA+PSBtaW5IZWlnaHQsICdtaW5IZWlnaHQgb3IgbWF4SGVpZ2h0IGlzIGludmFsaWQnKVxuICAgXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQsIG1heEhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgYmxvY2sgaWQgYXJyYXlcbiAgICogQHBhcmFtIGJsb2NrSWRzIGFycmF5IG9mIGJsb2NrIGlkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZHMnLCAoKSA9PiBEQkMubm90TnVsbChibG9ja0lkcykgKVxuXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUlkcyhibG9ja0lkcylcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxufSIsImltcG9ydCB7IEVudGl0eSwgIE51bGxhYmxlLCBwYXJ0aWFsLCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHlUcmFja2VyLCBQcm94aWVkRW50aXR5VHJhY2tlciB9IGZyb20gJy4vRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcblxuLyoqICAgICBcbiAqICAgICBTVEFURSBUUkFOU0ZFUiAgICAgICAgICAgICAgICAgIEFDVElPTiAgICAgICAgICAgICAgICBUUkFDSyAgICAgIENBQ0hFXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgID8gICAgICAgICAtPiBwZXJzaXRlbnQgICAgICBzZXNzaW9uLmxvYWQgICAgICAgICAgICAgdHJhY2sgICAgIGNhY2hlXG4gKiAgICAgID8gICAgICAgICAtPiBuZXcgICAgICAgICAgICBzZXNzaW9uLmNyZWF0ZSAgICAgICAgICAgdHJhY2sgICAgICAgLSAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBtb2RpZmllZCAgICAgICBzZXQgcHJvcGVydHkgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogcGVyc2lzdGVudCAgICAgLT4gZGVsZXRlZCAgICAgICAgc2Vzc2lvbi5kZWwgICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIG5ldyB8IG1vZGlmaWVkIC0+IHByZXNpc3RlbnQgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBrZWVwICAgICBjYWNoZXx1cGRhdGUgXG4gKiBkZWxldGVkICAgICAgICAtPiB0cmFuc2llbnQgICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAgZXZpdCAgICAgICBldml0XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdGUge1xuICBUcmFuc2llbnQgID0gLTEsXG4gIFBlcnNpc3RlbnQgPSAwLFxuICBcbiAgTmV3ICAgICAgICA9IDEsXG4gIE1vZGlmaWVkICAgPSAyLFxuICBEZWxldGVkICAgID0gMyxcbn1cblxuZXhwb3J0IGVudW0gRW50aXR5Q2hhbmdlVHlwZSB7XG4gIE5ldyAgICAgICA9IDEsXG4gIE1vZGlmeSAgICA9IDIsXG4gIERlbGV0ZSAgICA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2Uge1xuICBuYW1lICAgICA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50ICA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNoYW5nZXMge1xuICBkYlZlcnNpb24gICAgICAgICA6IG51bWJlclxuICB0eXBlICAgICAgICAgICAgICA6IEVudGl0eUNoYW5nZVR5cGVcbiAgcHJvcGVydGllc0NoYW5nZXMgOiBBcnJheTxQcm9wZXJ0eUNoYW5nZT5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlFeHRlbnNpb24ge1xuICBfdmVyc2lvbl8gICAgICA6IG51bWJlclxuICBfX2RldGFjaGVkX18gICA6IGJvb2xlYW5cbiAgX190cmFja2luZ19fICAgOiBib29sZWFuXG4gIF9fY29uZmlybWVkX18gIDogYm9vbGVhblxuICBfX3NjaGVtYV9fICAgICA6IE1vZGVsU2NoZW1hICBcbiAgX190cmFja2VyX18gICAgOiBFbnRpdHlUcmFja2VyXG4gIF9fc3RhdGVfXyAgICAgIDogRW50aXR5U3RhdGUgXG4gIF9fY2hhbmdlc19fICAgIDogTnVsbGFibGU8RW50aXR5Q2hhbmdlcz5cbiAgX191bmNvbmZpcm1lZENoYW5nZXNfXyAgOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlclxuXG4gIGNvbnN0cnVjdG9yKHRyYWNrZXI6IEVudGl0eVRyYWNrZXIpIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRW50aXR5UHJveHkubmFtZSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRXh0ZW5kZWQoZW50aXR5OiBFbnRpdHkpIHtcbiAgICByZXR1cm4gZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3NjaGVtYV9fJykgJiYgZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3N0YXRlX18nKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc1Byb3hpZWQoZW50aXR5OiBFbnRpdHkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVudGl0eVByb3h5LmlzRXh0ZW5kZWQoZW50aXR5KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjb252ZXJ0VG9Qcm94aWVkPFRFbnRpdHk+KGVudGl0eTogRW50aXR5KSA6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSkpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQcm94aWVkIEVudGl0eWApXG4gICAgXG4gICAgcmV0dXJuIGVudGl0eSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHByb3h5VG9FbnRpdHkocHJveGllZDogUHJveGllZDxFbnRpdHk+LCBjb250YWluc1ZlcnNpb24gPSB0cnVlICk6IEVudGl0eSB7XG4gICAgcmV0dXJuIGNvbnRhaW5zVmVyc2lvbiA/IFxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KHApICkgOlxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBwICE9PSAnX3ZlcnNpb25fJyAmJiAgRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShwKSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlLCAgY29uZmlybWVkIDogYm9vbGVhbiApIDogVEVudGl0eSB7XG4gICAgbGV0IHJlc3VsdCA9ICBPYmplY3QuYXNzaWduKHtcbiAgICAgIF92ZXJzaW9uXyAgICAgIDogMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19jb25maXJtZWRfXyAgOiBjb25maXJtZWQsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fY2hhbmdlc19fICAgIDogbnVsbCxcbiAgICAgIF9fdW5jb25maXJtZWRDaGFuZ2VzX18gOiBudWxsXG4gICAgfSwgZW50aXR5KVxuICAgIFxuICAgIHJlc3VsdC5fdmVyc2lvbl8gPSByZXN1bHQuX3ZlcnNpb25fIHx8IDFcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIGluaXRDaGFuZ2VzKCBleHQgOiBFbnRpdHlFeHRlbnNpb24gLCBjaGFuZ2VUeXBlID0gRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnkgKSB7XG4gICAgaWYgKGNoYW5nZVR5cGUgPT09IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5KSBleHQuX19jaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnksICAgICAgICBcbiAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyAsXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oeyBcbiAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZXh0Ll9fdW5jb25maXJtZWRDaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogY2hhbmdlVHlwZSwgICAgICAgIFxuICAgICAgZGJWZXJzaW9uOiBleHQuX3ZlcnNpb25fICxcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFByb3BlcnR5S2V5cyggZW50aXR5IDogRW50aXR5ICkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIHJldHVybiBleHQuX19zY2hlbWFfXy5maWVsZE5hbWVzXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSA6IGJvb2xlYW4geyAgICAgIFxuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5S2V5LnRvU3RyaW5nKClcblxuICAgIGlmICggIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkobmFtZSkgfHwgIWV4dC5fX3RyYWNraW5nX18gIHx8IHZhbHVlID09PSBlbnRpdHlbcHJvcGVydHlLZXldICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5S2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcm9wZXJ0eSBhZnRlciBkZWxldGVkYClcbiAgICB9XG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IGV4dC5fX3NjaGVtYV9fXG4gICAgaWYgKCBzY2hlbWEuaXNSZWFkb25seSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcmVhZG9ubHkgbW9kZWwgJyR7c2NoZW1hLm1vZGVsTmFtZX0nYClcbiAgICB9XG5cbiAgICBpZiAoIHNjaGVtYS5wcmltYXJ5S2V5ID09PSBuYW1lIHx8IHNjaGVtYS5jb21wb3NpdGVLZXlzLmluZGV4T2YobmFtZSkgPj0gMCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJpbWFyeSBrZXkgb3IgY29tcG9zaXRlIGtleSBwcm9wZXJ0eWApXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19kZXRhY2hlZF9fICkge1xuICAgICAgKCBleHQuX190cmFja2VyX18gYXMgUHJveGllZEVudGl0eVRyYWNrZXIpLmF0dGFjaCggcmVjZWl2ZXIgYXMgUHJveGllZDxhbnk+IClcbiAgICAgIGV4dC5fX2RldGFjaGVkX18gPSBmYWxzZVxuICAgIH1cblxuICAgIEVudGl0eVByb3h5LnJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0LCBwcm9wZXJ0eUtleSwgdmFsdWUgKVxuICAgIGVudGl0eVtwcm9wZXJ0eUtleV0gPSB2YWx1ZVxuICAgIFxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIHJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0IDogRW50aXR5RXh0ZW5zaW9uLCBrZXkgOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSApIHtcbiAgICBsZXQgc3RhcnRDb25maXJtID0gZmFsc2VcbiAgICBpZiAoIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgJiYgZXh0Ll9fY29uZmlybWVkX18gKSB7XG4gICAgICBzdGFydENvbmZpcm0gPSB0cnVlXG4gICAgICBleHQuX19jb25maXJtZWRfXyA9IGZhbHNlXG4gICAgfVxuXG4gICAgZXh0Ll9fdHJhY2tlcl9fLmlzQ29uZmlybWluZyAmJiAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlciApLnJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIGV4dCApXG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKSB7XG4gICAgICBleHQuX3ZlcnNpb25fICsrXG4gICAgICBleHQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuTW9kaWZpZWRcbiAgICAgIEVudGl0eVByb3h5LmluaXRDaGFuZ2VzKCBleHQgKSAgICAgXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnRpZXNDaGFuZ2VzIDogTnVsbGFibGU8QXJyYXk8UHJvcGVydHlDaGFuZ2U+PiA9IG51bGwgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHsgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX19jb25maXJtZWRfXyA/ICBcbiAgICAgICAgZXh0Ll9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlczogXG4gICAgICAgIGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyAgIFxuICAgIH1cbiAgICBlbHNlIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3ICYmIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgKSB7XG4gICAgICBzdGFydENvbmZpcm0gJiYgRW50aXR5UHJveHkuaW5pdENoYW5nZXMoIGV4dCwgRW50aXR5Q2hhbmdlVHlwZS5OZXcgKVxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlc1xuICAgIH1cblxuICAgIGxldCBuYW1lID0ga2V5LnRvU3RyaW5nKClcbiAgICBwcm9wZXJ0aWVzQ2hhbmdlcyAmJiBwcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcsIGNvbmZpcm1lZClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCwgb3duS2V5cyA6IHRoaXMuZ2V0UHJvcGVydHlLZXlzIH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQsICBjb25maXJtZWQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0LCBvd25LZXlzIDogdGhpcy5nZXRQcm9wZXJ0eUtleXMgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIGNvbmZpcm1DaGFuZ2VzPFRFbnRpdHk+KCBwZSA6IFByb3hpZWQ8VEVudGl0eT4gKSA6IHZvaWQge1xuICAgIGlmICggcGUuX19jb25maXJtZWRfXyApIHtcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oJ2NvbmZpcm0gd2hlbiBjb25maXJtZWQnKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICBcbiAgICBsZXQgdG1wQ2hhbmdlcyA9IHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX19cbiAgICBpZiAoIHRtcENoYW5nZXMgJiYgcGUuX19jaGFuZ2VzX18gKSB7XG4gICAgICBwZS5fX2NoYW5nZXNfXy5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKCAuLi50bXBDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzIClcbiAgICB9XG4gICAgZWxzZSBpZiAoICFwZS5fX2NoYW5nZXNfXyApIHtcbiAgICAgIHBlLl9fY2hhbmdlc19fID0gZGVlcENvcHkoIHRtcENoYW5nZXMgKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIF9fdW5jb25maXJtZWRDaGFuZ2VzX18gPT09IG51bGwgJiYgX19jaGFuZ2VzX18gIT09IG51bGxcbiAgICB9XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmICggcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KCkgKVxuICB9XG5cbiAgcHVibGljIGNhbmNlbENoYW5nZXM8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+ICkgOiB2b2lkIHtcbiAgICBpZiAoIHBlLl9fY29uZmlybWVkX18gKSB7XG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKCdjYW5jZWwgd2hlbiBjb25maXJtZWQnKVxuICAgICAgcmV0dXJuIFxuICAgIH0gXG4gICAgXG4gICAgcGUuX190cmFja2luZ19fID0gZmFsc2VcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmIFxuICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18ucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggcGMgPT4gcGVbcGMubmFtZV0gPSBwYy5vcmlnaW5hbCApIFxuICAgIHBlLl9fdHJhY2tpbmdfXyA9IHRydWVcbiAgICBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7XG4gICAgICBwZS5fX3N0YXRlX18gPSBwZS5fX2NoYW5nZXNfXyA/IEVudGl0eVN0YXRlLk1vZGlmaWVkIDogRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgIH1cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18gJiYgKCBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKSApXG4gIH1cbn1cblxuIiwiaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgRW50aXR5Q2FjaGUgfSBmcm9tICcuLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBDb21wb3NpdGVLZXkgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlQcm94eSwgUHJvcGVydHlDaGFuZ2UsIFByb3hpZWQsIEVudGl0eVN0YXRlLCBFbnRpdHlDaGFuZ2VUeXBlIH0gZnJvbSAnLi9FbnRpdHlQcm94eSdcbmltcG9ydCB7IFNxbEFuZFBhcmFtZXRlcnMsIFNxbEJ1aWxkZXIgfSBmcm9tICcuLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcblxuZXhwb3J0IHR5cGUgRW50aXR5VHJhY2tlckFjdGlvbiA9ICggbW9kZWw6IHN0cmluZywgZW50aXR5OiBFbnRpdHksIGNoYW5nZXMgOiBFbnRpdHlDaGFuZ2VzICkgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkpOiB2b2lkXG5cbiAgc3RvcFRyYWNrKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogdm9pZFxuICBzdG9wVHJhY2tBbGwoKTogdm9pZFxuXG4gIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkXG4gIHJlamVjdENoYW5nZXMoKSA6IHZvaWRcbiAgcm9sbGJhY2tDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuXG4gIGlzQ29uZmlybWluZyA6IGJvb2xlYW5cbiAgYmVnaW5Db25maXJtKCkgOiB2b2lkXG4gIGNvbmZpcm0oKSA6IHZvaWRcbiAgY2FuY2VsQ29uZmlybSgpIDogdm9pZFxufVxuXG5leHBvcnQgdHlwZSBNb2RlbEFuZEtleSA9IHN0cmluZ1xuZXhwb3J0IHR5cGUgRW50aXR5Q2hhbmdlc0l0ZW0gPSB7IG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXksIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5leHBvcnQgdHlwZSBQcm94aWVkRW50aXR5QW5kQ2hhbmdlcyA9IHsgZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5cbmV4cG9ydCBjbGFzcyBQcm94aWVkRW50aXR5VHJhY2tlciBpbXBsZW1lbnRzIEVudGl0eVRyYWNrZXIgeyAgXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgcHJveHkgOiBFbnRpdHlQcm94eVxuICBwcml2YXRlIGNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBtaW5WZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY3VycmVudFZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBjb25maXJtaW5nIDogYm9vbGVhblxuICBwcml2YXRlIGhpc3RvcnkgOiBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PlxuICBwcml2YXRlIGFsbFRyYWNraW5nRW50aXRpZXMgOiBNYXA8TW9kZWxBbmRLZXksIFByb3hpZWQ8YW55Pj5cbiAgcHJpdmF0ZSB1bmNvbmZpcm1lZEVudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhY2hlOiBFbnRpdHlDYWNoZSkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoUHJveGllZEVudGl0eVRyYWNrZXIubmFtZSlcbiAgICB0aGlzLnByb3h5ID0gbmV3IEVudGl0eVByb3h5KHRoaXMpXG4gICAgdGhpcy5jYWNoZSA9IGNhY2hlXG4gICAgdGhpcy5jb25maXJtaW5nID0gZmFsc2UgICAgXG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcblxuICAgIHRoaXMubWluVmVyc2lvbiA9IC0xXG4gICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IC0xXG4gIH1cblxuICBwcm90ZWN0ZWQgZW5zdXJlTm9UcmFja2luZyggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkgKSB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgbW9kZWw9JHtzY2hlbWEubW9kZWxOYW1lfSBrZXk9JHtzY2hlbWEuZ2V0S2V5KGVudGl0eSl9IGlzIHRyYWNraW5nYClcbiAgfVxuICBcbiAgcHVibGljIG1ha2VNb2RlbEFuZEtleShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IE1vZGVsQW5kS2V5IHtcbiAgICBsZXQgbWsgPSB7IG06IHNjaGVtYS5tb2RlbE5hbWUsIGs6IGtleX1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIG1rIClcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5IH0ge1xuICAgIGxldCBtayA9IEpTT04ucGFyc2UoIG1vZGVsQW5kS2V5IClcbiAgICBsZXQga2V5ID0gaXNTdHJpbmcobWsuaykgfHwgaXNOdW1iZXIobWsuaykgPyBtay5rIDogbmV3IENvbXBvc2l0ZUtleShtay5rLmtleU9iamVjdClcbiAgICByZXR1cm4geyBtb2RlbCA6IG1rLm0sIGtleToga2V5IH1cbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRIaXN0b3J5QnlWZXJzaW9uKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlICk6IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghdGhpcy5oaXN0b3J5LmhhcyhoaXN0b3J5VmVyc2lvbikgJiYgY3JlYXRlSWZOb3RFeGlzdHMgKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldChoaXN0b3J5VmVyc2lvbiwgbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKSlcblxuICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2V0KGhpc3RvcnlWZXJzaW9uKSFcbiAgfVxuXG4gIHB1YmxpYyBnZXRNb2RlbEFuZEtleSggcGU6IFByb3hpZWQ8YW55PiApOiBNb2RlbEFuZEtleSB7XG4gICAgcmV0dXJuIHRoaXMubWFrZU1vZGVsQW5kS2V5KHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgfVxuXG4gIHByb3RlY3RlZCBzYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMsIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKSA6IHZvaWQge1xuICAgIHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbihoaXN0b3J5VmVyc2lvbiwgdHJ1ZSkuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlcylcbiAgfVxuXG4gIHByb3RlY3RlZCByZW1vdmVUcmFja2luZ1RyYW5zaXNlbnRFbnRpdGllcygpIHtcbiAgICBsZXQga2V5cyA9IG5ldyBBcnJheTxNb2RlbEFuZEtleT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCAoZW50aXR5LCBrZXkpID0+IGVudGl0eS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCAmJiBrZXlzLnB1c2goa2V5KSlcbiAgICBrZXlzLmZvckVhY2goIGtleSA9PiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZGVsZXRlKGtleSkgKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4gKTogdm9pZCB7XG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYXR0YWNoSGlzdG9yeSBoaXN0b3J5IGluZm8gPSAke0pTT04uc3RyaW5naWZ5KHRoaXMuaGlzdG9yeVZlcnNpb24pfWApXG5cbiAgICBoaXN0b3J5LmZvckVhY2goIChjaGFuZ2VzLCB2ZXJzaW9uKSA9PiB7XG4gICAgICBsZXQgY2hhbmdlc01hcCA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KClcbiAgICAgIGNoYW5nZXMuZm9yRWFjaCggYyA9PiBjaGFuZ2VzTWFwLnNldCggYy5tb2RlbEFuZEtleSwgYy5jaGFuZ2VzISApKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldCh2ZXJzaW9uLCBjaGFuZ2VzTWFwIClcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMubG9nLmluZm9FbmFibGVkKSB7XG4gICAgICBsZXQgaGVpZ2h0SW5mbyA9IG5ldyBBcnJheTxudW1iZXI+KClcbiAgICAgIGhpc3RvcnkuZm9yRWFjaCggKGMsIGgpID0+IGhlaWdodEluZm8ucHVzaChoKSApXG4gICAgICB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIGF0dGFjaEhpc3RvcnkgaGVpZ2h0ID0gJHtKU09OLnN0cmluZ2lmeShoZWlnaHRJbmZvKX1gKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbjogdGhpcy5taW5WZXJzaW9uLCBtYXg6IHRoaXMuY3VycmVudFZlcnNpb24gfVxuICB9XG5cbiAgcHVibGljIGF0dGFjaCggcGU6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggcGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcignZXhpc3RzIGFub3RoZXIgdHJhY2tlZCBlbnRpdHknKVxuICAgICAgXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIHBlIClcbiAgfVxuICBcbiAgcHVibGljIGdldExhc3RDaGFuZ2VzKCBwZTogUHJveGllZDxhbnk+ICkgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIC8vIFRPRE86IGNoZWNrIGlmIGNvbmZpcm1pbmcgP1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBcbiAgICAgICAgcmV0dXJuIHBlLl9fY2hhbmdlc19fIVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4oKVxuICAgIGxldCB0bXBWZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuXG4gICAgd2hpbGUgKCB0bXBWZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uICkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odG1wVmVyc2lvbilcbiAgICAgIGhpc3RvcnkgJiYgcmVzdWx0LnB1c2goaGlzdG9yeSkgICAgICBcbiAgICAgIHRtcFZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCB0cmFja2luZ0VudGl0aWVzKCkgOiBJdGVyYWJsZTxFbnRpdHk+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnZhbHVlcygpXG4gIH1cblxuICBwdWJsaWMgaXNUcmFja2luZyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKCB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBrZXkpIClcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclVuY29uZmlybWVkRW50aXR5KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgY29uc3Qga2V5ID0gdGhpcy5nZXRNb2RlbEFuZEtleSggcGUgKVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5zZXQoIGtleSwgcGUgKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbmZpcm1pbmcoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbmZpcm1pbmdcbiAgfVxuXG4gIHB1YmxpYyBiZWdpbkNvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMuY29uZmlybWluZyA9IHRydWVcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoJ0JFR0lOIGJlZ2luQ29uZmlybScpXG4gIH1cblxuICBwdWJsaWMgY29uZmlybSgpIDogdm9pZCB7XG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmZvckVhY2goIHBlID0+IHsgXG4gICAgICBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk5ldyApXG4gICAgICAgIHRoaXMuY29uZmlybU5ldyggcGUgKSBcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApXG4gICAgICAgIHRoaXMuY29uZmlybU1vZGlmeSggcGUgKVxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLkRlbGV0ZWQgKVxuICAgICAgICB0aGlzLmNvbmZpcm1lZERlbGV0ZSggcGUgKVxuICAgIH0pXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLnJlbW92ZVRyYWNraW5nVHJhbnNpc2VudEVudGl0aWVzKClcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSBmYWxzZVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSgnU1VDQ0VTUyBjb25maXJtICcpXG4gIH1cblxuICBwdWJsaWMgY2FuY2VsQ29uZmlybSgpIDogdm9pZCB7XG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmZvckVhY2goIHBlID0+IHsgXG4gICAgICBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk5ldyApXG4gICAgICAgIHRoaXMuY2FuY2VsVW5jb25maXJtZWROZXcoIHBlICkgXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTW9kaWZpZWQgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkTW9kaWZ5KCBwZSApXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuRGVsZXRlZCApXG4gICAgICAgIHRoaXMuY2FuY2VsVW5jb25maXJtZWREZWxldGUoIHBlIClcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSApXG4gICAgfSlcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMucmVtb3ZlVHJhY2tpbmdUcmFuc2lzZW50RW50aXRpZXMoKVxuICAgIHRoaXMuY29uZmlybWluZyA9IGZhbHNlXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCdTVUNDRVNTIGNhbmNlbENvbmZpcm0gJylcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKTogTWF5YmVVbmRlZmluZWQ8UHJveGllZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBrZXkpXG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpID8gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmdldCh0cmFja2luZ0tleSkgYXMgUHJveGllZDxURW50aXR5PiA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIHRyYWNrTmV3PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkgeyBcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eU5ldyhlbnRpdHksIHNjaGVtYSwgIXRoaXMuaXNDb25maXJtaW5nKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICB0aGlzLmNvbmZpcm1pbmcgJiYgdGhpcy5yZWdpc3RlclVuY29uZmlybWVkRW50aXR5KCBwcm94aWVkIClcblxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWQge1xuICAgIGxldCBwcm94aWVkID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpXG4gICAgXG4gICAgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBcbiAgICAgICAgIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSByZXR1cm5cbiAgICBcbiAgICB0aGlzLmNvbmZpcm1pbmcgJiYgdGhpcy5yZWdpc3RlclVuY29uZmlybWVkRW50aXR5KCBwcm94aWVkIClcbiAgICBwcm94aWVkLl9fY29uZmlybWVkX18gPSAhdGhpcy5jb25maXJtaW5nXG4gICAgXG4gICAgc3dpdGNoICggcHJveGllZC5fX3N0YXRlX18gKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6XG4gICAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgY29uZmlybU5ldyggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuY2VsVW5jb25maXJtZWROZXcoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBsZXQgbmV3VGhlbk1vZGlmeSA9IHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18gJiYgXG4gICAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fLnR5cGUgPT09IEVudGl0eUNoYW5nZVR5cGUuTmV3XG4gICAgICBcbiAgICBpZiAoIG5ld1RoZW5Nb2RpZnkgKSB7ICAgICAgXG4gICAgICB0aGlzLnByb3h5LmNhbmNlbENoYW5nZXMoIHBlIClcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgfVxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgY29uZmlybU1vZGlmeSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHRoaXMucHJveHkuY29uZmlybUNoYW5nZXMoIHBlIClcbiAgfVxuXG4gIHByb3RlY3RlZCBjYW5jZWxVbmNvbmZpcm1lZE1vZGlmeSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHRoaXMucHJveHkuY2FuY2VsQ2hhbmdlcyggcGUgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1lZERlbGV0ZSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuY2VsVW5jb25maXJtZWREZWxldGUoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuTmV3IFxuICAgIH1cbiAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkICkge1xuICAgICAgbGV0IG1vZGlmaWVkID0gICggcGUuX19jaGFuZ2VzX18gJiYgcGUuX19jaGFuZ2VzX18ucHJvcGVydGllc0NoYW5nZXMubGVuZ3RoID4gMCApXG4gICAgICBwZS5fX3N0YXRlX18gPSBtb2RpZmllZCA/IEVudGl0eVN0YXRlLk1vZGlmaWVkIDogRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgIH1cbiAgICBcbiAgICBpZiAoIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18gKSB7IFxuICAgICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICB9XG5cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHVibGljIHRyYWNrUGVyc2lzdGVudDxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHtcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eVBlcnNpc3RlbnQoZW50aXR5LCBzY2hlbWEsICF0aGlzLmNvbmZpcm1pbmcpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZSh0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIHNjaGVtYS5nZXRLZXkoZW50aXR5KSkpXG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IG1vZGVsQW5kS2V5IDogdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpIH0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZGV0ZWN0Q2hhbmdlcygpIDogQXJyYXk8UHJveGllZEVudGl0eUFuZENoYW5nZXM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFByb3hpZWRFbnRpdHlBbmRDaGFuZ2VzPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBlbnRpdHk6IHBlLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKX0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKGVudGl0eTogRW50aXR5LCBkYlZlcnNpb246IG51bWJlciwgaXNOZXcgPSB0cnVlKSA6IEVudGl0eUNoYW5nZXMge1xuICAgIGxldCBwcm9wZXJpdGVzQ2hhbmdlID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZW50aXR5KSB7XG4gICAgICBpZiAoIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoa2V5KSkgY29udGludWVcbiAgICAgIHByb3Blcml0ZXNDaGFuZ2UucHVzaCggaXNOZXcgPyBcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiB1bmRlZmluZWQsIGN1cnJlbnQ6IGVudGl0eVtrZXldIH0gOlxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IGVudGl0eVtrZXldLCBjdXJyZW50OiAgdW5kZWZpbmVkIH0gICAgICAgXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGUgOiBpc05ldyA/IEVudGl0eUNoYW5nZVR5cGUuTmV3IDogRW50aXR5Q2hhbmdlVHlwZS5EZWxldGUsXG4gICAgICBkYlZlcnNpb246IGRiVmVyc2lvbiwgICAgICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogcHJvcGVyaXRlc0NoYW5nZVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtYXJrU3RhdGVBbmRTYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogdm9pZCB7XG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTkVXIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBERUxFVEUgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBNT0RJRklFRCBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gY2hhbmdlcyA9ICR7SlNPTi5zdHJpbmdpZnkocGUuX19jaGFuZ2VzX18pfSB1bmNvbmZpcm1lZCA9ICR7SlNPTi5zdHJpbmdpZnkocGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyl9YClcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCBwZS5fX2NoYW5nZXNfXyEsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX2NoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nIFxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6IFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgY29uc3Qgc2NoZW1hID0gcGUuX19zY2hlbWFfX1xuICAgICAgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQpIFxuICAgICAgICB0aGlzLmNhY2hlLnB1dChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSwgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkgKVxuICAgICAgZWxzZSBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkKVxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSkpXG4gICAgICAvLyBlbHNlICd0cmFuc2llbnQnIHwgJ3BlcnNpc3RlbnQnIGRvIG5vdGhpbmdcbiAgICAgIHRoaXMubWFya1N0YXRlQW5kU2F2ZUhpc3RvcnkocGUsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IGhpc3RvcnlWZXJzaW9uXG4gICAgICBwZS5fX2RldGFjaGVkX18gPSB0cnVlXG4gICAgfSkgIFxuICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5taW5WZXJzaW9uID0gdGhpcy5taW5WZXJzaW9uID09PSAtMSA/IGhpc3RvcnlWZXJzaW9uIDogdGhpcy5taW5WZXJzaW9uXG4gICAgXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIHJvbGxiYWNrQ2FjaGVDaGFuZ2VzKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgY2hhbmdlczogRW50aXR5Q2hhbmdlcyApOiB2b2lkIHtcbiAgICBzd2l0Y2goY2hhbmdlcy50eXBlKSB7XG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3IDogXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChtb2RlbCwga2V5KVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OlxuICAgICAgICBsZXQgZSA9IHRoaXMuY2FjaGUuZ2V0KCBtb2RlbCwga2V5IClcbiAgICAgICAgaWYgKCBlID09PSB1bmRlZmluZWQgKSByZXR1cm5cbiAgICAgICAgY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IGUhW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGUgKVxuICAgICAgICBicmVha1xuXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOiBcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGMgPT4gYy5uYW1lLCBjID0+IGMub3JpZ2luYWwpXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlbnRpdHkgKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuY2FuY2VsQ29uZmlybSgpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgICAgICAgcGUuX19jaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gcGVbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IHRydWVcbiAgICAgICAgICBwZS5fX2NoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcblxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6XG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHJlamVjdENoYW5nZXMgVmVyc2lvbiA9ID9gKVxuICB9XG4gIFxuICBwdWJsaWMgcm9sbGJhY2tDaGFuZ2VzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5yZWplY3RDaGFuZ2VzKClcbiAgICB3aGlsZSggaGlzdG9yeVZlcnNpb24gPD0gdGhpcy5jdXJyZW50VmVyc2lvbiApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXNNYXAgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICAgIGNoYW5nZXNNYXAgJiYgY2hhbmdlc01hcC5mb3JFYWNoKCAoIGNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKSBcbiAgICAgICAgdGhpcy5yb2xsYmFja0NhY2hlQ2hhbmdlcyhtay5tb2RlbCwgbWsua2V5LCBjaGFuZ2VzKVxuICAgICAgfSlcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gLS1cbiAgICB9XG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4gcGUuX19kZXRhY2hlZF9fID0gdHJ1ZSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IE1hdGgubWluKHRoaXMubWluVmVyc2lvbiwgdGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7dGhpcy5jdXJyZW50VmVyc2lvbn1gKVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeSggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSB7XG4gICAgaWYgKCB0aGlzLm1pblZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gfHwgdGhpcy5jdXJyZW50VmVyc2lvbiA8IGhpc3RvcnlWZXJzaW9uICkgcmV0dXJuXG4gICAgZm9yKCBsZXQgdmVyID0gdGhpcy5taW5WZXJzaW9uOyB2ZXIgPCBoaXN0b3J5VmVyc2lvbjsgdmVyKysgKSB7XG4gICAgICB0aGlzLmhpc3RvcnkuZGVsZXRlKHZlcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGR1bXBDaGFuZ2VzKCBlYzogRW50aXR5Q2hhbmdlcyApOiBzdHJpbmcge1xuICAgIGxldCBwcm9wZXJ0eUNoYW5nZXMgPSAnJ1xuICAgIGVjLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2gocGMgPT4gcHJvcGVydHlDaGFuZ2VzICs9IGAke3BjLm5hbWV9OiAke3BjLm9yaWdpbmFsfSAtPiAke3BjLmN1cnJlbnR9LCBgKVxuXG4gICAgcmV0dXJuIGBkYlZlcnNpb249JHtlYy5kYlZlcnNpb259LCB0eXBlPSR7ZWMudHlwZX0sIFske3Byb3BlcnR5Q2hhbmdlc31dYFxuICB9XG5cbiAgcHVibGljIGR1bXBIaXN0b3J5KCkgOiBzdHJpbmcge1xuICAgIGxldCB2ZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgSElTVE9SWSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgd2hpbGUoIHZlcnNpb24gPj0gdGhpcy5taW5WZXJzaW9uICkge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLXZlcnNpb24gJHt2ZXJzaW9ufS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgbGV0IGhpcyA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbiggdmVyc2lvbiApXG4gICAgICBoaXMgJiYgaGlzLmZvckVhY2goICggZWMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBsZXQgY2hhbmdlcyA9IHRoaXMuZHVtcENoYW5nZXMoIGVjIClcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgICAgY29uc3QgbXNnID0gYHR5cGU9JHttay5tb2RlbH0sIGtleT0ke21rLmtleX0sIGNoYW5nZXM9eyR7Y2hhbmdlc319IFxcbmBcbiAgICAgICAgcmVzdWx0ICs9IG1zZ1xuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgICAgdmVyc2lvbi0tXG4gICAgfSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFja2VyU3FsQnVpbGRlciB7XG4gIHByaXZhdGUgdHJhY2tlcjogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlciwgbW9kZWxzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+LCBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyICkge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLm1vZGVscyA9IG1vZGVsc1xuICAgIHRoaXMuc3FsQnVpbGRlciA9IHNxbEJ1aWxkZXJcbiAgfVxuICBcbiAgcHVibGljIGdldCBlbnRpdHlUcmFja2VyKCkgeyByZXR1cm4gdGhpcy50cmFja2VyIH1cblxuICBwdWJsaWMgYnVpbGRDaGFuZ2VTcWxzKCkgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmRldGVjdENoYW5nZXMoKS5mb3JFYWNoKCBlYyA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5idWlsZFNxbEFuZFBhcmFtZXRlcnMoZWMuZW50aXR5KSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKHBlIDpQcm94aWVkPGFueT4pIDogU3FsQW5kUGFyYW1ldGVycyB7ICBcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6XG4gICAgICAgIGNvbnN0IG5ld0VudGl0eSA9ICBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KCBwZSwgdHJ1ZSApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoIHBlLl9fc2NoZW1hX18sIG5ld0VudGl0eSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBsZXQgZW50aXR5Q2hhbmdlcyA9IHRoaXMudHJhY2tlci5nZXRMYXN0Q2hhbmdlcyhwZSkhXG4gICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoIGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMgLCBjPT4gYy5uYW1lLCBjPT4gYy5jdXJyZW50IClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uIC0gMSApXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVudGl0eSBzdGF0ZSAnJHtwZS5fX3N0YXRlX199J2ApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb24gKS5mb3JFYWNoKCBoaXMgPT4gaGlzLmZvckVhY2goICggZW50aXR5Q2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICBjb25zdCBtayA9IHRoaXMudHJhY2tlci5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobWsubW9kZWwpXG4gICAgICBzd2l0Y2goZW50aXR5Q2hhbmdlcy50eXBlKSB7XG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXc6XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHNjaGVtYSEsIG1rLmtleSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTogXG4gICAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUoc2NoZW1hISwgbWsua2V5LCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiApKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6XG4gICAgICAgICAgbGV0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydChzY2hlbWEhLCBlbnRpdHkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSkpXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbn1cblxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmV0dGVyLXNxbGl0ZTNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbmdlLWNhc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb24tc3FsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXNlY29uZGFyeVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zdWJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJscnUtY2FjaGVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9