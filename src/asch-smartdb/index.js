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
        this.holdLocks.forEach((v, k) => removeKeys.push(k));
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
            let items = yield session.getMany(model, condition, true, true);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}', condition = '${JSON.stringify(condition)}' )`);
            return (items.length === 1) ? items[0] : undefined;
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
            ext.__tracker__.registerUnconfirmedEntity(ext);
            startConfirm = true;
            ext.__confirmed__ = false;
        }
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
            pe.__changes__ = Object.assign({}, tmpChanges);
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
                this.log.traceEnabled && this.log.trace(`MODIFIED Version = ${historyVersion} changes = ${JSON.stringify(pe.__changes__)}`);
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
        this.confirm();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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LENBQUMsTUFBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN6RCxNQUFLO2FBQ1I7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUVILE9BQU8sTUFBTTtJQUNmLENBQUM7Q0FFRjtBQTVERCw4Q0E0REM7Ozs7Ozs7Ozs7OztBQ25pQkQsMkM7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsMkM7Ozs7Ozs7Ozs7O0FDQUEsc0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiYXNjaC1zbWFydGRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gb2JqZWN0IHdpdGggYWxsIGNvbXBpbGVkIFdlYkFzc2VtYmx5Lk1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18udyA9IHt9O1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9JbmRleC50c1wiKTtcbiIsImltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vQmxvY2snXG5cbmV4cG9ydCBjbGFzcyBCbG9ja0NhY2hlIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8bnVtYmVyLCBCbG9jaz4oKVxuICBwcml2YXRlIG1pbkhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhDYWNoZWRDb3VudCA6IG51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgdGhpcy5tYXhIZWlnaHQgPj0gMCAmJiBibG9jay5oZWlnaHQgIT09IHRoaXMubWF4SGVpZ2h0ICsgMSApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgKCdpbnZhbGlkIGJsb2NrIGhlaWdodCcpXG5cbiAgICB0aGlzLmNhY2hlLnNldCggYmxvY2suaGVpZ2h0LCBibG9jayApXG4gICAgdGhpcy5tYXhIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgICBcbiAgICBpZiAoIHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heENhY2hlZENvdW50ICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoIHRoaXMubWluSGVpZ2h0KysgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQoIGhlaWdodDogbnVtYmVyICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChoZWlnaHQpXG4gIH1cblxuICBwdWJsaWMgZ2V0QnlJZCggaWQ6IHN0cmluZyApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBmb3IoIGNvbnN0IGIgb2YgdGhpcy5jYWNoZS52YWx1ZXMoKSApIHtcbiAgICAgIGlmICggYi5pZCEgPT09IGlkICkgcmV0dXJuIGJcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV2aXQoIGZyb21IZWlnaHQ6IG51bWJlciwgdG9IZWlnaHQ6IG51bWJlciApIHtcbiAgICBsZXQgbWluID0gTWF0aC5taW4oIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBsZXQgbWF4ID0gTWF0aC5tYXgoIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBpZiAoIG1pbiA+IHRoaXMubWF4SGVpZ2h0IHx8IG1heCA8IHRoaXMubWluSGVpZ2h0ICkgcmV0dXJuIFxuICAgIFxuICAgIG1pbiA9IE1hdGgubWF4KCBtaW4sIHRoaXMubWluSGVpZ2h0IClcbiAgICBtYXggPSBNYXRoLm1pbiggbWF4LCB0aGlzLm1pbkhlaWdodCApXG4gICAgZm9yICggbGV0IGhlaWdodCA9IG1pbjsgaGVpZ2h0IDw9IG1heDsgaGVpZ2h0KysgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZShoZWlnaHQpXG4gICAgfVxuICB9XG59IiwiaW1wb3J0IHsgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0TGl0ZXJhbCB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IE9iamVjdExpdGVyYWxcbmV4cG9ydCB0eXBlIEVudGl0eSA9IE9iamVjdExpdGVyYWxcblxuZXhwb3J0IGludGVyZmFjZSBLZXlPYmplY3QgeyBcbiAga2V5IDogc3RyaW5nXG4gIGtleUpzb24gOiBKc29uT2JqZWN0XG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSA6IEpzb25PYmplY3Qge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdpdGVyYWJsZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBpdGVyYWJsZSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRLZXknLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0S2V5ICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldFZhbHVlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldFZhbHVlICkpXG5cbiAgbGV0IHJldCA9IHt9XG4gIGZvciAobGV0IGl0ZW0gb2YgaXRlcmFibGUpIHtcbiAgICByZXRbZ2V0S2V5KGl0ZW0pXSA9IGdldFZhbHVlKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHJldCBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpYWw8VD4oIHNyYyA6IFQsIGtleXNPcktleUZpbHRlciA6IEFycmF5PHN0cmluZz4gfCAoKGtleSA6IHN0cmluZykgPT4gYm9vbGVhbikgKTogUGFydGlhbDxUPiB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ3NyYycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBzcmMgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAna2V5c09yS2V5RmlsdGVyJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGtleXNPcktleUZpbHRlciApKVxuXG4gIGxldCBrZXlzID0gaXNGdW5jdGlvbihrZXlzT3JLZXlGaWx0ZXIpID8gXG4gICAgT2JqZWN0LmtleXMoc3JjKS5maWx0ZXIoIGtleXNPcktleUZpbHRlciBhcyAoKGtleSA6IHN0cmluZykgPT4gYm9vbGVhbikgKSA6XG4gICAga2V5c09yS2V5RmlsdGVyIGFzIEFycmF5PHN0cmluZz5cblxuICBsZXQgcmVzdWx0ID0geyB9XG4gIGZvciAoIGxldCBrIG9mIGtleXMgKSByZXN1bHRba10gPSBzcmNba11cbiAgcmV0dXJuIHJlc3VsdCBhcyBQYXJ0aWFsPFQ+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCAha2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBpc1N0cmluZygga2V5ICkgfHwgaXNOdW1iZXIoIGtleSApXG59XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoIG1lc3NhZ2UgOiBzdHJpbmcgKSB7XG4gICAgc3VwZXIoICdDb2RlIGNvbnRyYWN0IEVycm9yLCcrIG1lc3NhZ2UgKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0Q29uZGl0aW9uID0gYm9vbGVhbiB8ICggKCkgPT4gYm9vbGVhbiApXG5leHBvcnQgdHlwZSBDb250cmFjdE1lc3NhZ2UgICA9IHN0cmluZyAgfCAoICgpID0+IHN0cmluZyApXG5cbmV4cG9ydCB0eXBlIE1heWJlVW5kZWZpbmVkPFQ+ID0gVCB8IHVuZGVmaW5lZFxuZXhwb3J0IHR5cGUgTnVsbGFibGU8VD4gPSBUIHwgbnVsbCB8IHVuZGVmaW5lZFxuXG5leHBvcnQgdHlwZSBDb250cmFjdFZlcmlmeVJlc3VsdCA9IHsgcmVzdWx0IDogYm9vbGVhbiwgbWVzc2FnZTogTnVsbGFibGU8c3RyaW5nPiB9IFxuZXhwb3J0IHR5cGUgVmVyaWZ5RnVuY3Rpb24gPSAoKSA9PiBDb250cmFjdFZlcmlmeVJlc3VsdFxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0IHtcbiAgcHVibGljIHN0YXRpYyB2ZXJpZnkoIGNvbmRpdGlvbjogQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UgOiBDb250cmFjdE1lc3NhZ2UgKSA6IHZvaWQge1xuICAgIGlmICggY29uZGl0aW9uID09PSB1bmRlZmluZWQgfHwgY29uZGl0aW9uID09PSBudWxsICkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcmlmeSBjb25kaXRpb24nKVxuXG4gICAgY29uc3QgY29uZCA9IGlzRnVuY3Rpb24oY29uZGl0aW9uKSA/IChjb25kaXRpb24gYXMgRnVuY3Rpb24pKCkgOiBjb25kaXRpb25cbiAgICBjb25zdCBtc2cgPSBpc0Z1bmN0aW9uKG1lc3NhZ2UpID8gKG1lc3NhZ2UgYXMgRnVuY3Rpb24pKCkgOiBtZXNzYWdlXG5cbiAgICBpZiAoIWNvbmQpIHRocm93IG5ldyBDb2RlQ29udHJhY3RFcnJvciggbXNnIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYXJndW1lbnQoIGFyZ05hbWU6IHN0cmluZywgdmVyaWZ5OiBWZXJpZnlGdW5jdGlvbiB8IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlPyA6IENvbnRyYWN0TWVzc2FnZSApOiB2b2lkIHtcbiAgICBpZiAoICFhcmdOYW1lIHx8ICF2ZXJpZnkgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJnTmFtZSBvciB2ZXJpZnkgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGlmICggIW1lc3NhZ2UgKSB7XG4gICAgICBjb25zdCB2ciA9ICAodmVyaWZ5IGFzIFZlcmlmeUZ1bmN0aW9uKSgpXG4gICAgICBDb2RlQ29udHJhY3QudmVyaWZ5KCB2ci5yZXN1bHQsIGBhcmd1bWVudCAnJHthcmdOYW1lfScgJHt2ci5tZXNzYWdlfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBDb2RlQ29udHJhY3QudmVyaWZ5KHZlcmlmeSBhcyBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSEpICAgIFxuICB9XG5cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGwoIGFyZyA6IGFueSApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGFyZyAhPT0gbnVsbCAmJiBhcmcgIT09IHVuZGVmaW5lZFxuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPckVtcHR5KCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbChzdHIpICYmIHN0ciAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciBlbXB0eSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JXaGl0ZXNwYWNlKCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbE9yRW1wdHkoIHN0ciApICYmICggc3RyIGFzIHN0cmluZyApLnRyaW0oKSAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciB3aGl0ZXNwYWNlJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxufVxuXG5cbiIsImltcG9ydCB7IEVudGl0eUNhY2hlLCBMUlVFbnRpdHlDYWNoZSwgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyLCBNVUxUSV9TUUxfU0VQQVJBVE9SIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRW50aXR5LCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgUHJveGllZEVudGl0eVRyYWNrZXIsIFRyYWNrZXJTcWxCdWlsZGVyLCBFbnRpdHlDaGFuZ2VzSXRlbSwgTW9kZWxBbmRLZXkgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5RXh0ZW5zaW9uLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAndXRpbCdcblxuZXhwb3J0IHR5cGUgU2F2ZUhpc3RvcnlBY3Rpb24gPSAoIHZlcnNpb246IG51bWJlciwgaGlzdG9yeTogTWFwPHN0cmluZywgRW50aXR5Q2hhbmdlcz4gKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBEYlNlc3Npb24ge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNvbm5lY3Rpb246IERiQ29ubmVjdGlvblxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc2Vzc2lvbkNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBzcWxCdWlsZGVyIDogSnNvblNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSB0cmFja2VyU3FsQnVpbGRlcjogVHJhY2tlclNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSBlbnRpdHlUcmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBob2xkTG9ja3MgOiBNYXA8c3RyaW5nLCBib29sZWFuPlxuICBwcml2YXRlIHNlc3Npb25TZXJpYWwgOiBudW1iZXJcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24sIGNhY2hlT3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucywgc2Vzc2lvbk5hbWU/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBEYlNlc3Npb24ubmFtZSArICggc2Vzc2lvbk5hbWUgPT09IHVuZGVmaW5lZCA/ICcnIDogYF8ke3Nlc3Npb25OYW1lfWApICApXG4gICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gLTFcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgdGhpcy5tb2RlbHMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLnNlc3Npb25DYWNoZSA9IG5ldyBMUlVFbnRpdHlDYWNoZShjYWNoZU9wdGlvbnMpXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gbmV3IEpzb25TcWxCdWlsZGVyKClcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIgPSBuZXcgUHJveGllZEVudGl0eVRyYWNrZXIoIHRoaXMuc2Vzc2lvbkNhY2hlIClcbiAgICB0aGlzLmhvbGRMb2NrcyA9IG5ldyBNYXA8c3RyaW5nLCBib29sZWFuPigpXG4gICAgdGhpcy50cmFja2VyU3FsQnVpbGRlciA9IG5ldyBUcmFja2VyU3FsQnVpbGRlciggdGhpcy5lbnRpdHlUcmFja2VyLCB0aGlzLm1vZGVscywgdGhpcy5zcWxCdWlsZGVyIClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtb2RlbE5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5Q2xhc3M8VEVudGl0eT4oY2xheno6IENvbnN0cnVjdG9yPFRFbnRpdHk+KSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQoY2xhenoubmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHtjbGF6ei5uYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiApIHtcbiAgICByZXR1cm4gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWwpIDogXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5Q2xhc3MobW9kZWwpXG4gIH1cblxuICBwcm90ZWN0ZWQgbWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5KCB7fSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCB0cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgIGVudGl0aWVzIDogQXJyYXk8VEVudGl0eT4sIGNhY2hlID0gdHJ1ZSwgcmVmcmVzaElmVHJhY2tpbmcgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgbGV0IGtleSA9IHNjaGVtYS5nZXRLZXkoZSkgXG4gICAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgICAgbGV0IHByb3hpZWQgPSByZWZyZXNoSWZUcmFja2luZyAmJiB0cmFja2VkICE9PSB1bmRlZmluZWQgPyBcbiAgICAgICAgdHJhY2tlZCBhcyBhbnkgYXMgVEVudGl0eSA6IFxuICAgICAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50PFRFbnRpdHk+KHNjaGVtYSwgZSlcbiAgICAgIHJlc3VsdC5wdXNoKCBwcm94aWVkIClcbiAgICAgIGNhY2hlICYmIHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBrZXksIGUgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0KGNsZWFyQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuc3RvcFRyYWNrQWxsKClcbiAgICBpZiAoIGNsZWFyQ2FjaGUgKSB0aGlzLmVudGl0eUNhY2hlLmNsZWFyKClcbiAgfVxuXG4gIHByb3RlY3RlZCB1bmRlZmluZWRJZkRlbGV0ZWQ8VEVudGl0eT4oIHByb3hpZWQgOiBQcm94aWVkPFRFbnRpdHk+ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgcmV0dXJuICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApID8gXG4gICAgICB1bmRlZmluZWQgOiBcbiAgICAgIHByb3hpZWQgYXMgT2JqZWN0IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gJiYgdGhpcy5jb25uZWN0aW9uLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgZ2V0IGVudGl0eUNhY2hlKCk6IEVudGl0eUNhY2hlIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uQ2FjaGVcbiAgfVxuXG4gIHB1YmxpYyBzeW5jU2NoZW1hKHNjaGVtYTogTW9kZWxTY2hlbWEpOiB2b2lkIHtcbiAgICB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTY2hlbWEoc2NoZW1hKS5mb3JFYWNoKCBzcWw9PiB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZVN5bmMoIHNxbCApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNjaGVtYSguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IHZvaWQge1xuICAgIHNjaGVtYXMuZm9yRWFjaCggcyA9PiB0aGlzLm1vZGVscy5zZXQocy5tb2RlbE5hbWUsIHMpIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZXNldCggdHJ1ZSApXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4gKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgZW50aXR5TWFwID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgVEVudGl0eT4oKVxuICAgIG5ldyBBcnJheTxQcm94aWVkPGFueT4+KC4uLnRoaXMuZW50aXR5VHJhY2tlci50cmFja2luZ0VudGl0aWVzIGFzIEl0ZXJhYmxlPFByb3hpZWQ8YW55Pj4gKVxuICAgICAgLmZpbHRlciggcGUgPT4gcGUuX19zY2hlbWFfXy5tb2RlbE5hbWUgPT09IHNjaGVtYS5tb2RlbE5hbWUgJiYgcGUuX19zdGF0ZV9fICE9PSBFbnRpdHlTdGF0ZS5EZWxldGVkICYmIHBlLl9fc3RhdGVfXyAhPT0gRW50aXR5U3RhdGUuVHJhbnNpZW50IClcbiAgICAgIC5mb3JFYWNoKCBwZSA9PiBlbnRpdHlNYXAuc2V0KCB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSBhcyBhbnkgYXMgVEVudGl0eSkgKVxuXG4gICAgbGV0IGVudGl0aWVzID0gdGhpcy5lbnRpdHlDYWNoZS5nZXRBbGw8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGZpbHRlciApXG4gICAgZW50aXRpZXMgJiYgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICBsZXQga2V5ID0gdGhpcy5lbnRpdHlUcmFja2VyLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGUpIClcbiAgICAgIGlmICggIWVudGl0eU1hcC5oYXMoa2V5KSkge1xuICAgICAgICBsZXQgcGUgPSB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KCBzY2hlbWEsIGUgKVxuICAgICAgICBlbnRpdHlNYXAuc2V0KCBrZXksIHBlIClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmaWx0ZXIgPyBbLi4uZW50aXR5TWFwLnZhbHVlcygpXS5maWx0ZXIoIGZpbHRlciApIDogWy4uLmVudGl0eU1hcC52YWx1ZXMoKV1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiB0aGlzLnVuZGVmaW5lZElmRGVsZXRlZCh0cmFja2VkKVxuXG4gICAgbGV0IGNhY2hlZCA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0PFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBrZXkgKVxuICAgIHJldHVybiAoIGNhY2hlZCA9PT0gdW5kZWZpbmVkICkgPyB1bmRlZmluZWQgOiBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoIHNjaGVtYSwgY2FjaGVkIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRBbGw8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcblxuICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCAmJiB0aGlzLmVudGl0eUNhY2hlLmV4aXN0c01vZGVsKHNjaGVtYS5tb2RlbE5hbWUpICkge1xuICAgICAgbGV0IGVudGl0aWVzID0gdGhpcy5lbnRpdHlDYWNoZS5nZXRBbGw8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUgKSB8fCBbXVxuICAgICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UsIHRydWUgKSA6IGVudGl0aWVzIFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRNYW55KCBtb2RlbCwgeyB9LCB0cmFjayApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlLCBjYWNoZSA9IHRydWUgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uKVxuICAgIFxuICAgIGxldCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGNhY2hlICYmIGVudGl0aWVzLmZvckVhY2goIGUgPT4gdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkoZSksIGUgKSlcblxuICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXM8VEVudGl0eT4oIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyAgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnk8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPzogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGpvaW4pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5QnlKc29uPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBwYXJhbXMpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCApXG5cbiAgICBsZXQgeyBxdWVyeSAsIHBhcmFtZXRlcnN9ID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KCBzY2hlbWEsIFtdICwgY29uZGl0aW9uICkgXG4gICAgcXVlcnkgPSBgc2VsZWN0IGV4aXN0cygke3F1ZXJ5LnJlcGxhY2UoTVVMVElfU1FMX1NFUEFSQVRPUiwgJycpfSkgYXMgZXhpc3RgXG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KCBxdWVyeSwgcGFyYW1ldGVycyApXG4gICAgXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSAmJiBwYXJzZUludChyZXRbMF1bJ2V4aXN0J10pID4gMCBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHJldCA9IGF3YWl0IHRoaXMucXVlcnlCeUpzb24oIG1vZGVsLCB7IGZpZWxkcyA6ICdjb3VudCgqKSBhcyBjb3VudCcsIGNvbmRpdGlvbjogY29uZGl0aW9uIH0gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eShzY2hlbWEsIGtleSlcbiAgICBsZXQgZXhpc3RzID0gdHJhY2tlZCAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuc2Vzc2lvbkNhY2hlLmV4aXN0cyggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGV4aXN0cyApIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGV4aXN0cyBhbHJlYWR5ICggbW9kZWwgPSAnJHtzY2hlbWEubW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKWApXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrTmV3KHNjaGVtYSwgdGhlRW50aXR5KSBhcyBURW50aXR5XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgbG9hZEVudGl0eUJ5S2V5KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG4gICAgY29uc3Qgd2hlcmUgPSB0aGlzLm1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgd2hlcmUpXG5cbiAgICBjb25zdCByb3dzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgaWYgKCByb3dzLmxlbmd0aCA+IDEgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBrZXkgaXMgZHVwbGljYXRlZCAoIG1vZGVsID0gJyR7bW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKWAgKVxuICAgIH1cblxuICAgIHJldHVybiByb3dzLmxlbmd0aCA9PT0gMSA/IHJvd3NbMF0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2FkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgY2FjaGVkID0gdGhpcy5sb2FkQ2FjaGVkKCBtb2RlbCwga2V5LCB0cnVlIClcbiAgICBpZiAoIGNhY2hlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIGNhY2hlZFxuICBcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUoIG1vZGVsTmFtZSApIVxuXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcbiAgICBcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGtleSwgZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCh0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpLCBlbnRpdHkpIGFzIFRFbnRpdHkgIFxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0NoYW5nZXMoKVxuICB9XG5cbiAgcHVibGljIGxvYWRDYWNoZWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICwgdHJhY2sgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgJiYgdHJhY2sgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldDxURW50aXR5Pihtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkIHx8ICEgdHJhY2sgKSByZXR1cm4gZW50aXR5XG5cbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGVudGl0eSkgYXMgVEVudGl0eSBcbiAgfVxuXG4gIHB1YmxpYyBsb2NrSW5UaGlzU2Vzc2lvbiggbG9ja05hbWU6IHN0cmluZywgbm90VGhyb3cgPSBmYWxzZSApIDogYm9vbGVhbiB7XG4gICAgaWYgKCAhdGhpcy5ob2xkTG9ja3MuaGFzKCBsb2NrTmFtZSApICkge1xuICAgICAgdGhpcy5ob2xkTG9ja3Muc2V0KCBsb2NrTmFtZSwgdGhpcy5lbnRpdHlUcmFja2VyLmlzQ29uZmlybWluZyApXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmICggIW5vdFRocm93ICkgdGhyb3cgbmV3IEVycm9yKGAke2xvY2tOYW1lfSBleGlzdHMgYWxyZWFkeWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIHNhdmVDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUNoYW5nZXMoc2VyaWFsPyA6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJldFNlcmlhbCA9IHNlcmlhbCB8fCArK3RoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRDaGFuZ2VTcWxzKClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaCggc3FscyApXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuICAgICAgXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIuYWNjZXB0Q2hhbmdlcyggcmV0U2VyaWFsICkgXG4gICAgICB0aGlzLmhvbGRMb2Nrcy5jbGVhcigpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSByZXRTZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgICAgcmV0dXJuIHJldFNlcmlhbFxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJlamVjdENoYW5nZXMoKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvbGxiYWNrIHNhdmVkIGNoYW5nZXNcbiAgICogQHBhcmFtIGNoYW5nZXNOTyAsdGhpcyB2YWx1ZSBzaG91bGQgYmUgcmV0dXJuZWQgYnkgQHNlZSBzYXZlQ2hhbmdlcygpIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQ2hhbmdlcyggc2VyaWFsOiBudW1iZXIgKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiggdGhpcy5zZXNzaW9uU2VyaWFsIDw9IHNlcmlhbCApIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcblxuICAgIGNvbnN0IGZyb20gPSB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyAoIHNlcmlhbCA9ICR7c2VyaWFsfSApYClcblxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKHNlcmlhbCArIDEpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goc3FscykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbCArIDEpXG4gICAgICB0aGlzLmhvbGRMb2Nrcy5jbGVhcigpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSBzZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG4gIHB1YmxpYyBiZWdpbkVudGl0eVRyYW5zYWN0aW9uKCkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYmVnaW5Db25maXJtKClcbiAgfVxuXG4gIHB1YmxpYyBjb21taXRFbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmNvbmZpcm0oKSBcbiAgICB0aGlzLmhvbGRMb2Nrcy5mb3JFYWNoKCAodiwgaykgPT4gdGhpcy5ob2xkTG9ja3Nba10gPSBmYWxzZSApXG4gIH1cblxuICBwdWJsaWMgcm9sbGJhY2tFbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmNhbmNlbENvbmZpcm0oKVxuICAgIFxuICAgIGxldCByZW1vdmVLZXlzID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIHRoaXMuaG9sZExvY2tzLmZvckVhY2goICh2LCBrKSA9PiByZW1vdmVLZXlzLnB1c2goaykgKVxuICAgIHJlbW92ZUtleXMuZm9yRWFjaCggayA9PiB0aGlzLmhvbGRMb2Nrcy5kZWxldGUoaykpXG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxuICBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMUlVFbnRpdHlDYWNoZSBpbXBsZW1lbnRzIEVudGl0eUNhY2hlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUlOX0NBQ0hFRF9DT1VOVCA9IDEwMFxuICBwcml2YXRlIHN0YXRpYyBERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCA9IDEwMDAwXG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBFbnRpdHlDYWNoZU9wdGlvbnNcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBtb2RlbENhY2hlcyA6IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGRlZmF1bHQgOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCB9XG4gICAgLy8gZm9yKCBsZXQgayBpbiB0aGlzLm9wdGlvbnMgKSBcbiAgICAvLyAgIHRoaXMub3B0aW9uc1trXSA9IGlzTnVtYmVyKHRoaXMub3B0aW9uc1trXSkgPyB0aGlzLm9wdGlvbnNba10gOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihMUlVFbnRpdHlDYWNoZS5uYW1lKVxuICAgIHRoaXMubW9kZWxDYWNoZXMgPSBuZXcgTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj4oKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2RlbENhY2hlKG1vZGVsTmFtZSA6IHN0cmluZywgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSwgdGhyb3dJZk5vdEV4aXN0cyA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPExSVS5DYWNoZTxFbnRpdHlLZXksIEVudGl0eT4+IHtcbiAgICBpZiAoIGNyZWF0ZUlmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSB7IFxuICAgICAgLy8gY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIC8vICAgbWF4OiA1MDAsXG4gICAgICAvLyAgIGxlbmd0aDogZnVuY3Rpb24gKG4sIGtleSkgeyByZXR1cm4gbiAqIDIgKyBrZXkubGVuZ3RoIH0sXG4gICAgICAvLyAgIC8vZGlzcG9zZTogZnVuY3Rpb24gKGtleSwgbikgeyBuLmNsb3NlKCkgfSxcbiAgICAgIC8vICAgbWF4QWdlOiAxMDAwICogNjAgKiA2MCBcbiAgICAgIC8vIH1cbiAgICAgIGxldCBtYXhDYWNoZWRDb3VudCA6IG51bWJlcjtcbiAgICAgIGlmICggIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlbE5hbWUpICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gdGhpcy5vcHRpb25zLmRlZmF1bHRcbiAgICAgIGVsc2UgaWYgKCBpc051bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pXG4gICAgICBlbHNlIGlmICggaXNGdW5jdGlvbih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkpXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gKCB0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSBhcyAobW9kZWwpPT4gbnVtYmVyICkoIG1vZGVsTmFtZSApXG4gICAgICBlbHNlIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICAgIG1heENhY2hlZENvdW50ID0gTWF0aC5tYXgoIExSVUVudGl0eUNhY2hlLk1JTl9DQUNIRURfQ09VTlQsIG1heENhY2hlZENvdW50IClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuc2V0KG1vZGVsTmFtZSwgbmV3IExSVTxzdHJpbmcsIEVudGl0eT4oIG1heENhY2hlZENvdW50ICkgKVxuICAgIH1cbiAgICAgaWYgKCB0aHJvd0lmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSBcbiAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsIGNhY2hlICggbmFtZSA9ICcke21vZGVsTmFtZX0nICkgIGRvZXMgbm90IGV4aXN0c2ApIFxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMubW9kZWxDYWNoZXMuZ2V0KG1vZGVsTmFtZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDYWNoZUtleSgga2V5OiBFbnRpdHlLZXkgKSA6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlS2V5KGtleSkgPyBrZXkgYXMgbnVtYmVyIHwgc3RyaW5nIDogKCBrZXkgYXMgS2V5T2JqZWN0ICkua2V5XG4gIH1cblxuICBwdWJsaWMgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkIHsgICAgXG4gICAgaWYgKCBpc1N0cmluZyhtb2RlbE5hbWUpICkge1xuICAgICAgdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCB0cnVlICkhLnJlc2V0KClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuZGVsZXRlKCBtb2RlbE5hbWUgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZvciAoIGxldCBjIG9mIHRoaXMubW9kZWxDYWNoZXMudmFsdWVzKCkgKSB7XG4gICAgICBjLnJlc2V0KClcbiAgICB9XG4gICAgdGhpcy5tb2RlbENhY2hlcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVscygpIDogc3RyaW5nW10ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgZm9yKCBsZXQgbSBvZiB0aGlzLm1vZGVsQ2FjaGVzLmtleXMoKSApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCBtIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG5cbiAgICByZXR1cm4gIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkgPyB1bmRlZmluZWQgOlxuICAgICAgbW9kZWxDYWNoZSEuaGFzKGNhY2hlS2V5KSA/IG1vZGVsQ2FjaGUhLmdldChjYWNoZUtleSkgYXMgVEVudGl0eSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4ge1xuICAgICAgKCFmaWx0ZXIgfHwgKGZpbHRlciAmJiBmaWx0ZXIoIGUgYXMgVEVudGl0eSApKSkgJiYgcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApIFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGVudGl0eTogRW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcHV0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtrZXl9LCBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KGVudGl0eSl9YCkgICAgXG4gICAgdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSwgdHJ1ZSkhLnNldCh0aGlzLmdldENhY2hlS2V5KGtleSksIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgZXZpdCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7Y2FjaGVLZXl9YClcblxuICAgIGNvbnN0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGlmIChtb2RlbENhY2hlKSBtb2RlbENhY2hlLmRlbChjYWNoZUtleSlcbiAgfVxuICBcbiAgcHVibGljIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG1vZGVsTmFtZSwgIHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgZmFsc2UgKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuXG4gIHB1YmxpYyBkdW1wQ2FjaGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBDQUNIRSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgdGhpcy5tb2RlbENhY2hlcy5mb3JFYWNoKCAoY2FjaGUsIG1vZGVsKSA9PiB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tTW9kZWwgJHttb2RlbH0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGNhY2hlLmZvckVhY2goICggZW50aXR5LCBrZXkgKSA9PiB7XG4gICAgICAgIHJlc3VsdCArPSBga2V5ID0gJHt0aGlzLmdldENhY2hlS2V5KCBrZXkgKX0sIGVudGl0eSA9IHske0pTT04uc3RyaW5naWZ5KGVudGl0eSl9fSBcXG5gXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgfSkgICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBzZGIgZnJvbSAnLi9TbWFydERCJ1xuaW1wb3J0ICogYXMgbW9kZWwgZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCAqIGFzIGJsb2NrIGZyb20gJy4vQmxvY2snXG5pbXBvcnQgKiBhcyBzZXNzaW9uIGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0ICogYXMgc3FsaXRlIGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCAqIGFzIGNvbm4gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBsb2cgZnJvbSAnLi9Mb2cnXG5cbmV4cG9ydCBuYW1lc3BhY2UgQXNjaENvcmUge1xuICBleHBvcnQgY29uc3QgU21hcnREQiA9IHNkYi5TbWFydERCXG4gIGV4cG9ydCBjb25zdCBNb2RlbFNjaGVtYSA9IG1vZGVsLk1vZGVsU2NoZW1hXG4gIGV4cG9ydCB0eXBlIEJsb2NrID0gYmxvY2suQmxvY2tcbiAgZXhwb3J0IHR5cGUgTG9nTWFuYWdlciA9IGxvZy5Mb2dNYW5hZ2VyXG4gIGV4cG9ydCB0eXBlIExvZ0xldmVsID0gbG9nLkxvZ0xldmVsXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjaywgTWF5YmVVbmRlZmluZWR9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YiBmcm9tICdsZXZlbC1zdWJsZXZlbCdcblxuY29uc3QgbGV2ZWwgPSByZXF1aXJlKCdsZXZlbCcpXG5jb25zdCBTZW5vbmRhcnkgPSByZXF1aXJlKCdsZXZlbC1zZWNvbmRhcnknKVxuXG5leHBvcnQgdHlwZSBHZXRJbmRleFZhbHVlRnVuYyA9IChrZXk6IGFueSwgdmFsdWU6IEpzb25PYmplY3QpID0+IGFueVxuZXhwb3J0IHR5cGUgSW5kZXhGaWVsZCA9IHsgZmllbGROYW1lOiBzdHJpbmcsIGNhbGNJbmRleD86IEdldEluZGV4VmFsdWVGdW5jIH1cblxuZXhwb3J0IGNsYXNzIFN1YkxldmVsTWV0YSB7XG4gIHB1YmxpYyBzdWJOYW1lOiBzdHJpbmdcbiAgcHVibGljIGtleUZpZWxkIDogc3RyaW5nXG4gIHB1YmxpYyBpbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQ6IHN0cmluZywgaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKSkge1xuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KGluZGV4RmllbGRzKVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleEZpZWxkcy5maW5kSW5kZXgoaXRlbSA9PiBmaWVsZE5hbWUgPT09IGl0ZW0uZmllbGROYW1lKVxuICB9XG5cbiAgcHVibGljIGV4aXN0c0luZGV4KGZpZWxkTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSkgPiAtMVxuICB9XG5cbiAgcHVibGljIGFkZEluZGV4KGZpZWxkTmFtZSA6IHN0cmluZywgY2FsY0luZGV4IDogR2V0SW5kZXhWYWx1ZUZ1bmMpOiB0aGlzIHtcbiAgICBpZiAodGhpcy5leGlzdHNJbmRleChmaWVsZE5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbmRleCBvZiBmaWVsZCAnJHtmaWVsZE5hbWV9JyBhbHJlYWR5IGV4aXN0c2ApXG5cbiAgICB0aGlzLmluZGV4RmllbGRzLnB1c2goeyBmaWVsZE5hbWUsIGNhbGNJbmRleCB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlSW5kZXgoZmllbGROYW1lKTogdGhpcyB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpXG4gICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICB0aGlzLmluZGV4RmllbGRzLnNsaWNlKGlkeCwgMSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZSgpIDogQ2FsbGJhY2s8YW55PiB7XG4gIGxldCBjYWxsYmFja1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY2FsbGJhY2sgPSAoZXJyLCB2YWx1ZSkgPT4gZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHZhbHVlKVxuICB9KVxuICBjYWxsYmFjay5wcm9taXNlID0gcHJvbWlzZVxuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+XG4gIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxPcGVyYXRpb24ge1xuICBwdXQ8VD4oa2V5IDogYW55LCB2YWx1ZSA6IFQsIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBjYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgYmF0Y2gob3BlckFycmF5OiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz86IEpzb25PYmplY3QpIDogUHJvbWlzZTx2b2lkPiBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRleGVkTGV2ZWwgZXh0ZW5kcyBMZXZlbEdldCwgTGV2ZWxPcGVyYXRpb24ge1xuICBuYW1lIDogc3RyaW5nXG4gIGluZGV4ZXMgOiBBcnJheTxJbmRleEZpZWxkPlxuICBieUluZGV4KGluZGV4RmllbGQ6IHN0cmluZykgOiBMZXZlbEdldFxuICBnZXRCeTxUPihpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+KTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj5cbn1cblxuZXhwb3J0IGNsYXNzIExldmVsREIgeyAgXG4gIHByaXZhdGUgZGJEaXIgOiBzdHJpbmdcbiAgcHJpdmF0ZSBzdWJNZXRhcyA6IEFycmF5PFN1YkxldmVsTWV0YT5cbiAgcHJpdmF0ZSBzdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuICBwcml2YXRlIHN1YkxldmVsZGIgOiBzdWIuU3VibGV2ZWxcblxuICBjb25zdHJ1Y3RvcihkYkRpciA6IHN0cmluZywgbWV0YSA6IEFycmF5PFN1YkxldmVsTWV0YT4sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZGJEaXIgPSBkYkRpclxuICAgIHRoaXMuc3ViTWV0YXMgPSBuZXcgQXJyYXk8U3ViTGV2ZWxNZXRhPigpLmNvbmNhdChtZXRhKVxuICAgIHRoaXMuc3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD4oKVxuICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpIHtcbiAgICB0aGlzLmxldmVsZGIgPSBsZXZlbCggdGhpcy5kYkRpciwgeyB2YWx1ZUVuY29kaW5nOiAnanNvbicgfSApXG4gICAgdGhpcy5zdWJMZXZlbGRiID0gc3ViKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNLZXlOb3RGb3VuZEVycm9yKCBlcnI6IEVycm9yICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gZXJyICYmIGVyci5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwdWJsaWMgZ2V0IGxldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGJcbiAgfVxuXG4gIHB1YmxpYyBnZXRTdWJMZXZlbCggc3ViTmFtZTogc3RyaW5nICkgOiBJbmRleGVkTGV2ZWwge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxzLmdldChzdWJOYW1lKVxuICAgIGlmICggIXN1YiApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBzdWJMZXZlbCBuYW1lID0gJyR7c3ViTmFtZX0nYClcblxuICAgIHJldHVybiBzdWJcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKG9wZW5DYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KTogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2sob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soY2xvc2VDYWxsYmFjaylcbiAgICBcbiAgICBpZiAodGhpcy5pc0Nsb3NlZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuXG4gICAgKGFzeW5jKCk9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxldmVsZGIuY2xvc2UoKVxuICAgICAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyKVxuICAgICAgfSAgXG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIgJiYgdGhpcy5sZXZlbGRiLmlzT3BlbigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiAoIXRoaXMubGV2ZWxkYikgfHwgdGhpcy5sZXZlbGRiLmlzQ2xvc2VkKClcbiAgfVxuXG4gIHB1YmxpYyBkdW1wKCkgOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlcywgcmVqKSA9PiB7XG4gICAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKSAgICAgIFxuICAgICAgdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0oKVxuICAgICAgICAub24oJ2RhdGEnLCBkYXRhID0+IHJlc3VsdC5wdXNoKGBrZXk9ICR7ZGF0YS5rZXl9LCB2YWx1ZT0gJHtkYXRhLnZhbHVlfWApIClcbiAgICAgICAgLm9uKCdlcnJvcicsIGUgPT4gcmVqKGUpIClcbiAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXMocmVzdWx0LmpvaW4oJ1xcclxcbicpKSApXG4gICAgfSlcbiAgfVxufVxuXG5jbGFzcyBJbmRleGVkU3ViTGV2ZWwgaW1wbGVtZW50cyBJbmRleGVkTGV2ZWwge1xuICBwcml2YXRlIHN1Yk5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBrZXlGaWVsZCA6IHN0cmluZ1xuICBwcml2YXRlIGluZGV4QXJyYXkgOiBBcnJheTxJbmRleEZpZWxkPlxuICBwcml2YXRlIGluZGV4ZWRTdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBMZXZlbEdldD5cbiAgcHJpdmF0ZSBzdWJMZXZlbERiIDogYW55XG5cbiAgcHVibGljIGdldCBuYW1lKCkgeyByZXR1cm4gdGhpcy5zdWJOYW1lIH1cbiAgcHVibGljIGdldCBpbmRleGVzKCkgeyByZXR1cm4gdGhpcy5pbmRleEFycmF5IH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN1YmxldmVsOiBhbnksIHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQgOiBzdHJpbmcsIC4uLmluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD4pIHtcbiAgICB0aGlzLnN1YkxldmVsRGIgPSBzdWJsZXZlbFxuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4QXJyYXkgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoLi4uaW5kZXhGaWVsZHMpXG4gICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIExldmVsR2V0PigpXG4gICAgdGhpcy5pbmRleEFycmF5LmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IHNlbm9uZGFyeSA9IFNlbm9uZGFyeSggc3VibGV2ZWwsIGYuZmllbGROYW1lLCBmLmNhbGNJbmRleCApXG4gICAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuc2V0KCBmLmZpZWxkTmFtZSwgc2Vub25kYXJ5IClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGdldCBrZXkoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5RmllbGRcbiAgfVxuICBcbiAgcHJpdmF0ZSBrZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQ8VD4oIGNhbGxiYWNrPzogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+ICkgOiBNYXliZVVuZGVmaW5lZDxDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4+IHtcbiAgICByZXR1cm4gIWNhbGxiYWNrID8gdW5kZWZpbmVkIDogKCBlcnIgOiBFcnJvciwgZGF0YTogVCApID0+IHtcbiAgICAgIGNhbGxiYWNrKCAgTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoIGVyciApID8gbnVsbCA6IGVyciAsIGRhdGEgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PiApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PiB7XG4gICAgY29uc3Qga2V5TGV2ZWwgPSB0aGlzLnN1YkxldmVsRGIgYXMgSW5kZXhlZFN1YkxldmVsIFxuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZ2V0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIGtleUxldmVsLmdldDxUPihrZXksIG9wdGlvbnMsIHRoaXMua2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkKGNhbGxiYWNrKSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvcihlcnIpID8gdW5kZWZpbmVkIDogZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYnlJbmRleCggaW5kZXhGaWVsZE5hbWUgOiBzdHJpbmcgKSA6IExldmVsR2V0IHtcbiAgICBjb25zdCBsZXZlbEdldCA9ICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuZ2V0KGluZGV4RmllbGROYW1lKVxuICAgIGlmICggIWxldmVsR2V0ICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIGluZGV4IGZpZWxkID0gJyR7aW5kZXhGaWVsZE5hbWV9J2ApXG5cbiAgICByZXR1cm4gbGV2ZWxHZXRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxUPihpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBpbmRleExldmVsID0gdGhpcy5ieUluZGV4KCBpbmRleEZpZWxkIClcblxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhnZXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgaW5kZXhMZXZlbC5nZXQ8VD4oa2V5LCB0aGlzLmtleU5vdEZvdW5kVGhlblVuZGVmaW5lZChjYWxsYmFjaykpXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoZXJyKSA/IHVuZGVmaW5lZCA6IGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhwdXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgdGhpcy5zdWJMZXZlbERiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGRlbENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN1YkxldmVsRGIuZGVsKGtleSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmF0Y2goYXJyYXkgOiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz8gOiBKc29uT2JqZWN0LCBiYXRjaENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaCgpXG5cbiAgICBsZXQgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCFpc0Z1bmN0aW9uKG9wdGlvbnMpKVxuICAgIGxldCBvcmdpbmFsQ2FsbGJhY2sgPSBoYXNPcHRpb25zID8gYmF0Y2hDYWxsYmFjayA6IG9wdGlvbnMgYXMgQ2FsbGJhY2s8YW55PlxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayggb3JnaW5hbENhbGxiYWNrIClcbiAgICB0cnkge1xuICAgICAgaWYgKGhhc09wdGlvbnMpXG4gICAgICAgIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaChhcnJheSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cbn1cbiIsImltcG9ydCB7IExldmVsREIsIEluZGV4ZWRMZXZlbCwgU3ViTGV2ZWxNZXRhIH0gZnJvbSAnLi9LVkRCL0xldmVsREInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIgfSBmcm9tICcuL0Jsb2NrJ1xuXG5jb25zdCBMQVNUX0JMT0NLX0hFSUdIVF9LRVkgPSAnX19sYXN0X2Jsb2NrX2hlaWdodF9fJ1xuXG5leHBvcnQgY2xhc3MgTGV2ZWxCbG9jayB7XG4gIHByaXZhdGUgZGIgOiBMZXZlbERCXG4gIHByaXZhdGUgYmxvY2tEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGhpc3RvcnlEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGxhc3RIZWlnaHQgOiBudW1iZXJcblxuICBjb25zdHJ1Y3RvciggZGlyIDogc3RyaW5nLCBsZXZlbE9wdGlvbnMgPSB7fSApIHtcbiAgICAvKiBcbiAgICAgIHsgaWQoNjQpLCB0aW1lc3RhbXAoYmlnaW50KSwgaGVpZ2h0KGJpZ2ludCksIHBheWxvYWRMZW5ndGgoYmlnaW50KSwgcGF5bG9hZEhhc2goNjQpLCBwcmV2QmxvY2tJZCg2NCksIFxuICAgICAgICBwb2ludElkKDY0KSwgcG9pbnRIZWlnaHQoYmlnaW50KSwgZGVsZWdhdGUoNjQpLCBzaWduYXR1cmUoMTI4KSwgY291bnQoYmlnaW50KSB9XG4gICAgKi9cbiAgICBjb25zdCBibG9ja01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdibGsnLCAnaGVpZ2h0JywgW1xuICAgICAgeyBmaWVsZE5hbWU6ICdpZCcgfSwgXG4gICAgICB7IGZpZWxkTmFtZTogJ2RlbGVnYXRlJyB9XG4gICAgXSlcbiAgICBjb25zdCBjaGFuZ2VzTG9nTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2hpcycsICdoZWlnaHQnLCBbXSlcbiAgICBcbiAgICB0aGlzLmRiID0gbmV3IExldmVsREIoIGRpciwgW2Jsb2NrTWV0YSwgY2hhbmdlc0xvZ01ldGFdLCBsZXZlbE9wdGlvbnMgKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IC0xXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldExhc3RCbG9ja0hlaWdodEZyb21EYigpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBsYXN0QmxvY2tIZWlnaHRJdGVtID0gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB7fSkgXG4gICAgaWYgKCBsYXN0QmxvY2tIZWlnaHRJdGVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsYXN0QmxvY2tIZWlnaHRJdGVtID0gdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbiggLTEgKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RiLnB1dChMQVNUX0JMT0NLX0hFSUdIVF9LRVksIGxhc3RCbG9ja0hlaWdodEl0ZW0pXG4gICAgfVxuICAgIHJldHVybiBsYXN0QmxvY2tIZWlnaHRJdGVtLmhlaWdodCAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgb3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLm9wZW4oKVxuICAgIHRoaXMuYmxvY2tEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2JsaycpXG4gICAgdGhpcy5oaXN0b3J5RGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdoaXMnKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IGF3YWl0IHRoaXMuZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIgeyBcbiAgICByZXR1cm4gdGhpcy5sYXN0SGVpZ2h0IFxuICB9XG5cbiAgcHJpdmF0ZSBpc0tleU5vdEZvdW5kRXJyb3IoZSkgOiBib29sZWFuIHsgXG4gICAgcmV0dXJuIGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHJpdmF0ZSBnZXRMYXN0SGVpZ2h0SnNvbiggbGFzdEhlaWdodDogbnVtYmVyICkgOiBCbG9ja0hlYWRlciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlaWdodCA6IGxhc3RIZWlnaHQsXG4gICAgICBpZCA6ICdOVUxMJyxcbiAgICAgIGRlbGVnYXRlIDogJ05VTEwnXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFwcGVuZEJsb2NrKCBibG9jayA6IEJsb2NrSGVhZGVyLCBjaGFuZ2VzOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4gKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFibG9jayB8fCAhYmxvY2suaWQgfHwgIWJsb2NrLmRlbGVnYXRlIHx8IGJsb2NrLmhlaWdodCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJsb2NrIGRhdGFgKVxuXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIucHV0KGJsb2NrLmhlaWdodCwgY2hhbmdlcylcbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogYmxvY2suaGVpZ2h0LCB2YWx1ZTogYmxvY2sgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oYmxvY2suaGVpZ2h0KSB9XG4gICBdKVxuXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2soIGhlaWdodCA6IG51bWJlciApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oaGVpZ2h0KVxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIaXN0b3J5Q2hhbmdlcyggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyICkgOiBQcm9taXNlPE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0OyBoIDwgbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gYXdhaXQgdGhpcy5oaXN0b3J5RGIuZ2V0PEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oaClcbiAgICAgIGNoYW5nZXMgJiYgcmV0LnNldCggaCwgY2hhbmdlcyApXG4gICAgfVxuICAgIHJldHVybiByZXQgXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBkZWxldGVMYXN0QmxvY2soIGhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGhlaWdodCAhPT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbGFzdCBibG9jayBoZWlnaHQgJyR7aGVpZ2h0fSdgKVxuXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ2RlbCcsIGtleSA6IGhlaWdodCB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbiggaGVpZ2h0IC0gMSApIH0gXG4gICAgXSlcbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5kZWwoIGhlaWdodCApXG4gICAgXG4gICAgdGhpcy5sYXN0SGVpZ2h0IC0tXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0Qnk8QmxvY2tIZWFkZXI+KCdpZCcsIGJsb2NrSWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodCA7IGggPD0gbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrKGgpXG4gICAgICBibG9jayAmJiByZXN1bHQucHVzaCggYmxvY2shIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIEtleU9iamVjdCwgQ29kZUNvbnRyYWN0IGFzIERCQywgcGFydGlhbCwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSB7IG5ldygpIDogVCB9XG5leHBvcnQgdHlwZSBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gPSBzdHJpbmcgfCBDb25zdHJ1Y3RvcjxURW50aXR5PlxuXG5leHBvcnQgZW51bSBGaWVsZFR5cGVzIHtcbiAgU3RyaW5nICAgPSAnU3RyaW5nJyxcbiAgTnVtYmVyICAgPSAnTnVtYmVyJyxcbiAgQmlnSW50ICAgPSAnQmlnSW50JyxcbiAgVGV4dCAgICAgPSAnVGV4dCdcbn1cblxuZXhwb3J0IHR5cGUgRmllbGRUeXBlID0gc3RyaW5nIHwgRmllbGRUeXBlc1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBwcmltYXJ5X2tleT8gOiBib29sZWFuLFxuICBjb21wb3NpdGVfa2V5PyA6IGJvb2xlYW4sXG4gIGRlZmF1bHQ/OiBudW1iZXJ8c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWEge1xuICB0YWJsZT8gOiBzdHJpbmcsXG4gIG1lbW9yeT8gOiBib29sZWFuLFxuICByZWFkb25seT8gOiBib29sZWFuLFxuICBsb2NhbD8gOiBib29sZWFuLFxuICB0YWJsZUZpZWxkcyA6IEFycmF5PEZpZWxkPlxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlS2V5IGltcGxlbWVudHMgS2V5T2JqZWN0IHtcbiAgcHJpdmF0ZSBrZXlPYmplY3QgOiBKc29uT2JqZWN0XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBrZXlPYmplY3QgOiBKc29uT2JqZWN0ICkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleU9iamVjdCcsICgpID0+IERCQy5ub3ROdWxsKGtleU9iamVjdCkpXG5cbiAgICB0aGlzLmtleU9iamVjdCA9IGtleU9iamVjdFxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYWtlPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBURW50aXR5ICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsICgpID0+IERCQy5ub3ROdWxsKHNjaGVtYSkpXG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgc2NoZW1hLmlzQ29tcHNpdGVLZXksICdtb2RlbCBtdXN0IGluZGVudGlmeSBieSBjb21wb3NpdGUga2V5JylcbiAgICBEQkMuYXJndW1lbnQoICdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoIHBhcnRpYWwoZW50aXR5LCBzY2hlbWEuY29tcG9zaXRlS2V5cykgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKCBrZXlKc29uU3RyaW5nOiBzdHJpbmcgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5SnNvblN0cmluZycsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGtleUpzb25TdHJpbmcpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoSlNPTi5wYXJzZSgga2V5SnNvblN0cmluZyApLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5SnNvbigpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMua2V5T2JqZWN0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9zaXRlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoISBrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleS5rZXlKc29uXG59XG5cbmV4cG9ydCBjbGFzcyBNb2RlbFNjaGVtYSB7XG4gIHByaXZhdGUgc2NoZW1hOiBTY2hlbWFcbiAgcHJpdmF0ZSBuYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBtZW1vcnk6IGJvb2xlYW5cbiAgcHJpdmF0ZSByZWFkb25seTogYm9vbGVhblxuICBwcml2YXRlIGxvY2FsOiBib29sZWFuXG5cbiAgcHJpdmF0ZSBwS2V5OiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+XG4gIHByaXZhdGUgY0tleXM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZHM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZFR5cGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG4gIHByaXZhdGUgYWxsSW5kZXhlczogQXJyYXk8c3RyaW5nPlxuXG4gIGNvbnN0cnVjdG9yKHNjaGVtYTogU2NoZW1hLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNjaGVtYSA9IE9iamVjdC5hc3NpZ24oe30gLCBzY2hlbWEpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMubWVtb3J5ID0gc2NoZW1hLm1lbW9yeSA9PT0gdHJ1ZVxuICAgIHRoaXMucmVhZG9ubHkgPSBzY2hlbWEucmVhZG9ubHkgPT09IHRydWVcbiAgICB0aGlzLmxvY2FsID0gc2NoZW1hLmxvY2FsID09PSB0cnVlXG4gICAgdGhpcy5hdHRhY2hWZXJzaW9uRmllbGQoIHRoaXMuc2NoZW1hIClcbiAgICB0aGlzLnBhcnNlRmllbGRzKClcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoVmVyc2lvbkZpZWxkKCBzY2hlbWEgOiBTY2hlbWEgKSB7XG4gICAgaWYgKCBzY2hlbWEudGFibGVGaWVsZHMuZmluZCggZiA9PiBmLm5hbWUgPT09ICdfdmVyc2lvbl8nKSApIHJldHVyblxuICAgIHNjaGVtYS50YWJsZUZpZWxkcy5wdXNoKHtcbiAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLFxuICAgICAgdHlwZTogRmllbGRUeXBlcy5OdW1iZXIsXG4gICAgICBkZWZhdWx0OiAwICAgICBcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIHR5cGVcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHRoaXMuc2V0RGVmYXVsdFZhbHVlcyggZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5zZXRLZXkoIGVudGl0eSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCBzZXREZWZhdWx0VmFsdWVzPFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4ge1xuICAgICAgZi5kZWZhdWx0ICE9PSB1bmRlZmluZWQgJiYgKCBlbnRpdHlbZi5uYW1lXSA9IGYuZGVmYXVsdCApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBjb3B5UHJvcGVydGllczxURW50aXR5PiggZGVzdDogVEVudGl0eSwgc3JjIDogVEVudGl0eSwgaW5jbHVkZUtleSA9IGZhbHNlICkge1xuICAgIHRoaXMuYWxsRmllbGRzLmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IG5lZWRDb3B5ID0gKGluY2x1ZGVLZXkgfHwgKCB0aGlzLmNLZXlzLmluZGV4T2YoZikgPCAwICYmIGYgIT09IHRoaXMucHJpbWFyeUtleSApKSAmJiBzcmNbZl0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKCBuZWVkQ29weSApIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogQXJyYXk8c3RyaW5nPlxuICBidWlsZEluc2VydCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFVwZGF0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmUgOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbn1cblxuZXhwb3J0IGNsYXNzIEpzb25TcWxCdWlsZGVyIGltcGxlbWVudHMgU3FsQnVpbGRlciB7XG5cbiAgcHJpdmF0ZSBnZXRUYWJsZU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY2hhbmdlQ2FzZS5zbmFrZUNhc2UobW9kZWxOYW1lKSArICdzJ1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmltYXJ5S2V5Q29uZGl0aW9uKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkgKCB7fSwgIGtleSApXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTY2hlbWEgKHNjaGVtYTogTW9kZWxTY2hlbWEpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgbGV0IHNxbHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpIFxuICAgIGNvbnN0IHNjaGVtYU9iamVjdCA9IE9iamVjdC5hc3NpZ24oeyB0eXBlOiAnY3JlYXRlJ30sIGRlZXBDb3B5KHNjaGVtYS5zY2hlbWFPYmplY3QpKSBcbiAgICAvLyBUT0RPOiBnZW5lcmF0ZSBjb21wb3NpdGUga2V5IHNxbFxuICAgIGxldCBzY2hlbWFTcWwgPSBKc29uU3FsLmJ1aWxkKHNjaGVtYU9iamVjdClcbiAgICBzcWxzLnB1c2goc2NoZW1hU3FsLnF1ZXJ5KVxuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBzY2hlbWEuaW5kZXhlcy5mb3JFYWNoKCBmaWVsZCA9PiB7XG4gICAgICBzcWxzLnB1c2goSnNvblNxbC5idWlsZCh7XG4gICAgICAgIHR5cGU6ICdpbmRleCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIG5hbWU6IHRhYmxlTmFtZSArICdfJyArIGZpZWxkLFxuICAgICAgICBpbmRleE9uOiBmaWVsZFxuICAgICAgfSkucXVlcnkpXG4gICAgfSlcblxuICAgIHJldHVybiBzcWxzXG4gIH1cblxuICBwdWJsaWMgYnVpbGRJbnNlcnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkluc2VydCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdpbnNlcnQnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgdmFsdWVzOiBmaWVsZFZhbHVlc1xuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkRlbGV0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICBjb25kaXRpb246IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFVwZGF0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpOiBTcWxBbmRQYXJhbWV0ZXJzIHsgICAgXG4gICAgLy8gY29uc3QgbW9kaWZpZXIgPSB0aGlzLmVzY2FwZVNpbmdsZVF1b3RlKGZpZWxkVmFsdWVzKVxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG5cbiAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbmRpdGlvblsnX3ZlcnNpb25fJ10gPSB2ZXJzaW9uICBcblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5VcGRhdGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIG1vZGlmaWVyOiBmaWVsZFZhbHVlcyxcbiAgICAgIGNvbmRpdGlvbjogY29uZGl0aW9uXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTZWxlY3Qoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzT3JQYXJhbXM6IEFycmF5PHN0cmluZz4gfCBKc29uT2JqZWN0LCB3aGVyZT8gOiBTcWxDb25kaXRpb24sIFxuICAgIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKTogU3FsQW5kUGFyYW1ldGVycyB7XG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIFxuICAgIGxldCBxdWVyeU9wdGlvbnMgOiBKc29uT2JqZWN0XG4gICAgaWYgKCAhaXNBcnJheSggZmllbGRzT3JQYXJhbXMgKSApIHtcbiAgICAgIGxldCBwYXJhbXMgPSBmaWVsZHNPclBhcmFtcyBhcyBKc29uT2JqZWN0XG4gICAgICBxdWVyeU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7IHR5cGU6ICdzZWxlY3QnLCB0YWJsZTogdGFibGVOYW1lIH0sIHBhcmFtcyApXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGZpZWxkcyA9IGZpZWxkc09yUGFyYW1zIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG4gICAgICBsZXQgbG8gOiBMaW1pdEFuZE9mZnNldCA9IGlzTnVtYmVyKCByZXN1bHRSYW5nZSApID8gIHsgbGltaXQgOiByZXN1bHRSYW5nZSB9IDogcmVzdWx0UmFuZ2UgfHwgeyB9XG4gICAgICBsZXQgb3JkZXIgPSBzb3J0IHx8IHt9XG4gICAgICBmb3IgKCBsZXQga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhvcmRlcikgICkge1xuICAgICAgICBsZXQgb3JkZXJWYWx1ZSA9IG9yZGVyW2tleV0gfHwgLTFcbiAgICAgICAgb3JkZXJba2V5XSA9IChvcmRlclZhbHVlID09PSAnQVNDJykgPyAxIDogKCAob3JkZXJWYWx1ZSA9PT0gJ0RFU0MnKSA/IC0xIDogb3JkZXJWYWx1ZSApXG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIGZpZWxkczogZmllbGRzLFxuICAgICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgICBsaW1pdDogbG8ubGltaXQsXG4gICAgICAgIG9mZnNldDogbG8ub2Zmc2V0LFxuICAgICAgICBzb3J0OiBvcmRlcixcbiAgICAgICAgam9pbjogam9pblxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuU2VsZWN0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZChxdWVyeU9wdGlvbnMpKVxuICB9XG59IiwiaW1wb3J0IHsgU3FsaXRlV3JhcHBlciB9IGZyb20gJy4vU3FsaXRlV3JhcHBlcidcbmltcG9ydCB7IE1VTFRJX1NRTF9TRVBBUkFUT1IsIFNxbEFuZFBhcmFtZXRlcnMsIFNxbFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24sIENvbm5lY3Rpb25PcHRpb25zLCBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5cblxuY2xhc3MgU3FsaXRlVHJhbnNhY3Rpb24gaW1wbGVtZW50cyBEQlRyYW5zYWN0aW9uIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbW1pdCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ0NPTU1JVDsnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0s7JykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OOycpXG4gICAgcmV0dXJuIG5ldyBTcWxpdGVUcmFuc2FjdGlvbih0aGlzKVxuICB9XG59IiwiaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nTWFuYWdlciwgTG9nZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgU3FsUGFyYW1ldGVycywgU3FsQW5kUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcblxuaW1wb3J0ICogYXMgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnXG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVXcmFwcGVyIHtcbiAgcHJpdmF0ZSBkYiA6IERhdGFiYXNlXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU3FsaXRlV3JhcHBlci5uYW1lKVxuICB9XG5cbiAgcHVibGljIG9wZW4oZGJGaWxlUGF0aDogc3RyaW5nLCBjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiRmlsZVBhdGgpXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAgKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRiLm9wZW4gfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luT3BlbihkYkZpbGVQYXRoOiBzdHJpbmcpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLm9wZW4pLmNhbGwodGhpcywgZGJGaWxlUGF0aClcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRoaXMuZGIgJiYgdGhpcy5pc0Nvbm5lY3RlZCApIHtcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpIFxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIGNsb3NlYCApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgY2xvc2VkIGFscmVhZHlgKVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBjbG9zZWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIGVmZmVjdGVkID0gJHtyZXQucmVzdWx0LnJvd3NFZmZlY3RlZH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxhbnk+PiApIDogQXJyYXk8YW55PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PGFueT4oKSB9XG4gICAgdHJ5IHtcbiAgICAgIHJldC5yZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5hbGwocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShzcWwhLnBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCByZXQuZXJyLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBFbnRpdHlLZXksIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciwgaXNDb21wb3NpdGVLZXkgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlQcm94eSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snXG5pbXBvcnQgeyBCbG9ja0NhY2hlIH0gZnJvbSAnLi9CbG9ja0NhY2hlJ1xuXG50eXBlIE5hbWVkSG9vazxURnVuYz4gPSB7IG5hbWU6IHN0cmluZywgaG9vayA6IFRGdW5jIH1cbmV4cG9ydCB0eXBlIENvbW1pdEJsb2NrSG9vayA9ICggYmxvY2sgOiBCbG9jayApID0+IHZvaWRcbmV4cG9ydCB0eXBlIFJvbGxiYWNrQmxvY2tIb29rID0gKCBmcm9tSGVpZ2h0IDogbnVtYmVyLCB0b0hlaWdodCA6IG51bWJlciApID0+IHZvaWRcblxuZXhwb3J0IHR5cGUgU21hcnREQk9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBjYWNoZWQgaGlzdG9yeSBjb3VudChibG9jayBjb3VudCksIHVzZWQgdG8gcm9sbGJhY2sgYmxvY2tcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGhpc3RvcnlGb3JSb2xsYmFjaz8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIGNsZWFuIHBlcnNpc3RlZCBoaXN0b3J5IGF1dG9tYXRpY2FsbHlcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9DbGVhblBlcnNpc3RlZEhpc3Rvcnk/IDogYm9vbGVhbixcblxuICAvKipcbiAgICogY2FjaGVkIGxhc3QgYmxvY2sgY291bnQgXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBjYWNoZWRCbG9ja0NvdW50PyA6IG51bWJlcixcblxuICAvKipcbiAgICogbWF4IGNhY2hlZCBlbnRpdHkgY291bnQsIGNvbmZpZyBpdCBwZXIgbW9kZWwsIExSVSAgXG4gICAqIHNhbXBsZTogeyBVc2VyOiAyMDAsIFRyYW5zOiA1MDAwIH0gbWF4IGNhY2hlZCAyMDBzIFVzZXIg77yMNTAwMCBmb3IgVHJhbnNcbiAgICogQGRlZmF1bHQgNTAwMCBlYWNoIG1vZGVsXG4gICAqL1xuICBlbnRpdHlDYWNoZU9wdGlvbnM/IDogRW50aXR5Q2FjaGVPcHRpb25zXG5cbn1cblxuLyoqXG4gKiBPUk0gbGlrZSB0byBvcGVyYXRlIGJsb2NrY2hhaW4gZGF0YVxuICogQGV2ZW50IHJlYWR5IGVtbWl0IGFmdGVyIGluaXRpYWxpemVkXG4gKiBAZXZlbnQgY2xvc2UgZW1taXQgYWZ0ZXIgY2xvc2VkXG4gKi9cbmV4cG9ydCBjbGFzcyBTbWFydERCIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBvcHRpb25zIDogU21hcnREQk9wdGlvbnNcbiAgcHJpdmF0ZSBjb21taXRCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj5cbiAgcHJpdmF0ZSByb2xsYmFja0Jsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+XG4gIHByaXZhdGUgY2FjaGVkQmxvY2tzIDogQmxvY2tDYWNoZVxuICBwcml2YXRlIHNjaGVtYXMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgYmxvY2tTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgbG9jYWxTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgYmxvY2tEQiA6IExldmVsQmxvY2tcbiAgcHJpdmF0ZSBjdXJyZW50QmxvY2sgOiBCbG9jayB8IG51bGxcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgXG4gICAqIE5PVElDIDogeW91IG5lZWQgY2FsbCBpbml0IGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gZGJQYXRoIHBhdGggb2YgYmxvY2tjaGFpbiBkYlxuICAgKiBAcGFyYW0gbGV2ZWxCbG9ja0RpciBwYXRoIG9mIGJsb2NrIGhlYWRlciBkYlxuICAgKiBAcGFyYW0gb3B0aW9ucyBvZiBTbWFydERCXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRiUGF0aDogc3RyaW5nLCBsZXZlbEJsb2NrRGlyOiBzdHJpbmcsIG9wdGlvbnM/IDogU21hcnREQk9wdGlvbnMgKSB7XG4gICAgREJDLmFyZ3VtZW50KCdkYlBhdGgnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGRiUGF0aCkpXG4gICAgREJDLmFyZ3VtZW50KCdsZXZlbEJsb2NrRGlyJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShsZXZlbEJsb2NrRGlyKSlcblxuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdGlvbnMgPSAge1xuICAgICAgY2FjaGVkQmxvY2tDb3VudCA6IDEwLFxuICAgICAgaGlzdG9yeUZvclJvbGxiYWNrIDogMTAsXG4gICAgICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5IDogZmFsc2UsICAgICAgXG4gICAgICBlbnRpdHlDYWNoZU9wdGlvbnMgOiB7IGRlZmF1bHQgOiA1MDAwIH1cbiAgICB9IHx8IG9wdGlvbnNcblxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj4oKVxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+KClcbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgcHJpdmF0ZSBwcmVDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBibG9jayApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdENvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5lbWl0KCduZXdCbG9jaycsIGJsb2NrKVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBmcm9tLCB0byApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdFJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMuZW1pdCgncm9sbGJhY2tCbG9jaycsIHsgZnJvbSwgdG8gfSApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBibG9jayApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogQ29tbWl0QmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG4gICAgXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rIDogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5jb21taXRCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGZyb21IZWlnaHQsIHRvSGVpZ2h0ICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IFJvbGxiYWNrQmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcblxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBpbml0aWFsaXplIFNtYXJ0REIgLCB5b3UgbmVlZCBjYWxsIHRoaXMgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBzY2hlbWFzIHRhYmxlIHNjaGVtYXMgaW4gRGF0YWJhc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBpbml0KHNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzY2hlbWFzJywgKCk9PiBEQkMubm90TnVsbChzY2hlbWFzKSlcblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5jb25uZWN0KCkgICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLm9wZW4oKVxuXG4gICAgZm9yKCBjb25zdCBzY2hlbWEgb2Ygc2NoZW1hcyApIHtcbiAgICAgIHRoaXMuc2NoZW1hcy5zZXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYSApXG4gICAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbiggc2NoZW1hIClcblxuICAgICAgc2Vzc2lvbi5yZWdpc3RlclNjaGVtYShzY2hlbWEpXG4gICAgICBzZXNzaW9uLnN5bmNTY2hlbWEoc2NoZW1hKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgc3luYyBzY2hlbWEgbW9kZWwgPSAke3NjaGVtYS5tb2RlbE5hbWV9IGApXG5cbiAgICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIHsgXG4gICAgICAgIGxldCBpdGVtcyA9IGF3YWl0IHNlc3Npb24uZ2V0TWFueSggc2NoZW1hLm1vZGVsTmFtZSwge30sIGZhbHNlLCB0cnVlIClcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgbW9kZWwgJHtzY2hlbWEubW9kZWxOYW1lfSBjYWNoZWQgJHtpdGVtcy5sZW5ndGh9IGVudGl0aWVzIGApXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZW1pdCggJ3JlYWR5JywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogZnJlZSByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuY2xvc2UoKVxuICAgIFxuICAgIHRoaXMuZW1pdCgnY2xvc2VkJywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogaGVpZ2h0IG9mIGxhc3QgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJsb2NrREIubGFzdEJsb2NrSGVpZ2h0XG4gIH1cblxuICAvKipcbiAgICogYmxvY2tzIGNvdW50XG4gICAqL1xuICBwdWJsaWMgZ2V0IGJsb2Nrc0NvdW50KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDFcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXN0IGNvbW1pdGVkIGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9jaygpIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICAvLyBUT0RPOiByZXR1cm4gbGFzdCBibG9jayBjb3B5ID9cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gIH1cblxuICAvKipcbiAgICogaG9sZCBhIGxvY2sgbmFtZSB3aGljaCBvbmx5IHN1Y2NlZWQgaW4gZmlyc3QgdGltZSBvZiBlYWNoIGJsb2NrLlxuICAgKiBAcGFyYW0gbG9ja05hbWUgbG9jayBuYW1lXG4gICAqIEBwYXJhbSBub3RUaHJvdyBkbyBub3QgdGhyb3cgZXhjZXB0aW9uIGlmIGxvY2sgZmFpbGVkXG4gICAqL1xuICBwdWJsaWMgbG9ja0luQ3VycmVudEJsb2NrKCBsb2NrTmFtZTogc3RyaW5nLCBub3RUaHJvdyA9IGZhbHNlICkgOiBib29sZWFuIHtcbiAgIHJldHVybiB0aGlzLmJsb2NrU2Vzc2lvbi5sb2NrSW5UaGlzU2Vzc2lvbiggbG9ja05hbWUsIG5vdFRocm93KVxuICB9XG5cbiAgLyoqXG4gICAqIGJlZ2luIGEgY29udHJhY3QgdHJhbnNhY3Rpb24gd2hpY2ggZWZmZWN0IGVudGl0aWVzIGluIG1lbW9yeVxuICAgKi9cbiAgcHVibGljIGJlZ2luQ29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmJlZ2luRW50aXR5VHJhbnNhY3Rpb24oKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgY29tbWl0Q29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNvbW1pdEVudGl0eVRyYW5zYWN0aW9uKClcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgcm9sbGJhY2tDb250cmFjdCgpIDogdm9pZCB7XG4gICAgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tFbnRpdHlUcmFuc2FjdGlvbigpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBiZWdpbiBhIG5ldyBibG9ja1xuICAgKiBAcGFyYW0gYmxvY2tIZWFkZXIgXG4gICAqL1xuICBwdWJsaWMgYmVnaW5CbG9jayggYmxvY2s6IEJsb2NrICkgOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB2ZXJpZnkgYmxvY2tIZWFkZXIgaGVyZVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCAoKT0+IERCQy5ub3ROdWxsKGJsb2NrKSlcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgYmxvY2suaGVpZ2h0ID09PSB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDEsIGBpbnZhbGlkIGJsb2NrIGhlaWdodCAke2Jsb2NrLmhlaWdodH0sIGxhc3QgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgXG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYmxvY2sgaGVpZ2h0ID0gJHtibG9jay5oZWlnaHR9YClcbiAgICB0aGlzLmN1cnJlbnRCbG9jayA9IGJsb2NrXG4gIH1cblxuICAvKipcbiAgICogY29tbWl0IGJsb2NrIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb21taXRCbG9jaygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudEJsb2NrKSB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgYmxvY2sgaXMgbnVsbCcpXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrLmhlaWdodH1gKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVDb21taXRCbG9jayggdGhpcy5jdXJyZW50QmxvY2sgKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGJsb2NrSGVhZGVyLCAndHJhbnNhY3Rpb25zJylcbiAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIGJsb2NrSGVhZGVyLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5zYXZlQ2hhbmdlcyggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IClcbiAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IC0gdGhpcy5vcHRpb25zLmhpc3RvcnlGb3JSb2xsYmFjayEgKVxuICAgICAgdGhpcy5jYWNoZWRCbG9ja3MucHV0KCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdENvbW1pdEJsb2NrKCB0aGlzLmxhc3RCbG9jayEgKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHsgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgY29tbWl0QmxvY2sgKCBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrIS5oZWlnaHR9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKHRoaXMuY3VycmVudEJsb2NrLmhlaWdodClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBibG9jayBjaGFuZ2VzXG4gICAqIEBwYXJhbSBoZWlnaHQgcm9sbGJhY2sgdG8gaGVpZ2h0KGV4Y2x1ZGUpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tCbG9jayggaGVpZ2h0PzogbnVtYmVyICkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2hlaWdodCcsICFoZWlnaHQgfHwgaGVpZ2h0IDw9IHRoaXMubGFzdEJsb2NrSGVpZ2h0LCBcbiAgICAgIGBoZWlnaHQgbXVzdCBsZXNzIG9yIGVxdWFsIGxhc3RCbG9ja0hlaWdodCAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG5cbiAgICBjb25zdCBmcm9tSGVpZ2h0ID0gdGhpcy5jdXJyZW50QmxvY2sgPyB0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0IDogdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICBjb25zdCB0b0hlaWdodCA9IGhlaWdodCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sYXN0QmxvY2tIZWlnaHQgOiBoZWlnaHRcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVSb2xsYmFja0Jsb2NrKCBmcm9tSGVpZ2h0LCAgdG9IZWlnaHQgKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZlciA9IHRoaXMuYmxvY2tTZXNzaW9uLmhpc3RvcnlWZXJzaW9uO1xuICAgICAgaWYgKCBmcm9tSGVpZ2h0IDwgdmVyLm1pbiApIHsgLy8gbG9hZCBoaXN0b3J5IGZyb20gbGV2ZWxkYiwgaWYgY2FjaGVkIGhpc3RvcnkgbGVzcyB0aGFuIHJvbGxiYWNrIGhlaWdodCBcbiAgICAgICAgbGV0IGhpc3RvcnkgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0SGlzdG9yeUNoYW5nZXMoIGZyb21IZWlnaHQsIHZlci5taW4gKVxuICAgICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyggdG9IZWlnaHQgKVxuICAgICAgd2hpbGUoIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID4gdG9IZWlnaHQgKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2soIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgICAgdGhpcy5jYWNoZWRCbG9ja3MuZXZpdCggdGhpcy5sYXN0QmxvY2tIZWlnaHQsIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuICAgICAgLy8gZW1pdCBldmVudFxuICAgICAgdGhpcy5wb3N0Um9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0ICkgICAgICBcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1Mgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWApXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWAsIGVycilcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzYXZlIGxvY2FsIHRhYmxlcyAobm90IGluIGJsb2NrIC0tLSB3aGljaCBkZWZpbmUgaW4gc2NoZW1hIGJ5IGxvY2FsIDogdHJ1ZSkgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUxvY2FsQ2hhbmdlcygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgc2VyaWFsID0gYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uc2F2ZUNoYW5nZXMoKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsIClcbiAgICByZXR1cm4gc2VyaWFsXG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgbG9jYWwgdGFibGVzIGNoYW5nZXMgc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKiBAcGFyYW0gc2VyaWFsIHNlcmlhbCBudW1iZXIgcmV0dXJuIGZyb20gc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrTG9jYWxDaGFuZ2VzKHNlcmlhbDogbnVtYmVyKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2VyaWFsJywgc2VyaWFsID49IDAsIGBzZXJpYWwgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGVudGl0eSBrZXlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgZ2V0RW50aXR5S2V5PFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKTogTWF5YmVVbmRlZmluZWQ8RW50aXR5S2V5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuICAgIFxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsLCB0cnVlKSFcbiAgICByZXR1cm4gc2NoZW1hLmdldEtleSggZW50aXR5IClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgdHJhY2tpbmcgZW50aXR5ICBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBQYXJ0aWFsPFRFbnRpdHk+ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuXG4gICAgbGV0IGtleSA9IHRoaXMuZ2V0RW50aXR5S2V5KCBtb2RlbCwgIGVudGl0eSApXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBrZXkgIT09IHVuZGVmaW5lZCAsICdjYW4gbm90IGdldCBlbnRpdHkga2V5JyApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmxvYWQoIG1vZGVsLCBrZXkhIClcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSBuZXcgZW50aXR5IHdoaWNoIGNoYW5nZSB3aWxsIGJlIHRyYWNrZWQgYW5kIHBlcnNpc3RlbnRlZCAoYnkgc2F2ZUNoYW5nZXMpIGF1dG9tYXRpY2FsbHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleSB3aGljaCB1bmlxdWVkIGluIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBlbnRpdHkgcHJvdG90eXBlIGVudGl0eSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgY29weSB0byByZXN1bHQgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNraW5nIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleU9yRW50aXR5OiBFbnRpdHlLZXkgfCBURW50aXR5KSA6IFRFbnRpdHkge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleU9yRW50aXR5JywgKCk9PiBEQkMubm90TnVsbChrZXlPckVudGl0eSkpXG4gICAgXG4gICAgbGV0IGtleSA6IEVudGl0eUtleVxuICAgIGxldCBlbnRpdHk6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuXG4gICAgaWYgKCBpc1ByaW1pdGl2ZUtleSgga2V5T3JFbnRpdHkgKSB8fCBpc0NvbXBvc2l0ZUtleSgga2V5T3JFbnRpdHkgKSApIHsgXG4gICAgICBrZXkgPSBrZXlPckVudGl0eSBhcyBFbnRpdHlLZXkgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZW50aXR5ID0ga2V5T3JFbnRpdHkgYXMgVEVudGl0eVxuICAgICAga2V5ID0gc2NoZW1hLmdldEtleShlbnRpdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmNyZWF0ZShtb2RlbCwga2V5LCBlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogdXBkYXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgLy8gcHVibGljIHVwZGF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gIC8vICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgLy8gICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHByb3hpZWQgb2JqZWN0YCApXG5cbiAgLy8gICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgLy8gICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkudXBkYXRlKGVudGl0eSlcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBkZWxldGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCAnaXMgbm90IGEgdHJhY2tpbmcgZW50aXR5JyApXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmRlbGV0ZShlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBhbmQgZGF0YWJhc2VcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gZGF0YWJhc2UgYnkgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb248VEVudGl0eT4oc2NoZW1hISlcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnk8VEVudGl0eT4obW9kZWwsIGNvbmRpdGlvbiwgdHJ1ZSwgdHJ1ZSApXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcbiAgICBcbiAgICByZXR1cm4gKCBpdGVtcy5sZW5ndGggPT09IDEgKSA/IGl0ZW1zWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICAgIC8qKlxuICAgKiBnZXQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIGZpbmQgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbiwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBvbmx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5LCB0cnVlKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGZpbHRlciBmaWx0ZXIgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+ICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRBbGxDYWNoZWQoIG1vZGVsLCBmaWx0ZXIgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5leGlzdHMobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBjb3VudCByZWNvcmRzIGNvdW50IGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmNvdW50KG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja3MgOiBBcnJheTxCbG9ja0hlYWRlcj4sICBnZXRUcmFuc2FjdGlvbnM6ICgpID0+IFByb21pc2U8QXJyYXk8VHJhbnNhY3Rpb24+PiApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBsZXQgdHJhbnNHcm91cCA9IG5ldyBNYXA8c3RyaW5nLCBBcnJheTxUcmFuc2FjdGlvbj4+KClcbiAgICBsZXQgdHJhbnNhY3Rpb25zID0gYXdhaXQgZ2V0VHJhbnNhY3Rpb25zKClcblxuICAgIHRyYW5zYWN0aW9ucy5mb3JFYWNoKCB0ID0+IHtcbiAgICAgIGlmICghdHJhbnNHcm91cC5oYXMoIHQuYmxvY2tJZCApKSB0cmFuc0dyb3VwLnNldCggdC5ibG9ja0lkLCBuZXcgQXJyYXk8VHJhbnNhY3Rpb24+KCkgKVxuICAgICAgdHJhbnNHcm91cC5nZXQoIHQuYmxvY2tJZCApIS5wdXNoKCB0IClcbiAgICB9IClcblxuICAgIGJsb2Nrcy5mb3JFYWNoKCBiID0+IGJbJ3RyYW5zYWN0aW9ucyddID0gdHJhbnNHcm91cC5nZXQoYi5pZCEpIClcbiAgICByZXR1cm4gYmxvY2tzIGFzIEFycmF5PEJsb2NrPlxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5Q2FjaGVkQmxvY2soIGdldENhY2hlQmxvY2sgOiAoKSA9PiBNYXliZVVuZGVmaW5lZDxCbG9jaz4sIHdpdGhUcmFuc2FjdGlvbnMgOiBib29sZWFuICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGxldCBjYWNoZWRCbG9jayA9IGdldENhY2hlQmxvY2soKVxuICAgIGlmICggY2FjaGVkQmxvY2sgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcbiAgICBcbiAgICBsZXQgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbih7fSwgY2FjaGVkQmxvY2spXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHtcbiAgICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIHJlc3VsdCwgJ3RyYW5zYWN0aW9ucycpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGhlaWdodFxuICAgKiBAcGFyYW0gaGVpZ2h0IGJsb2NrIGhlaWdodFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlIZWlnaHQoIGhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPj0gMCAsICdoZWlnaHQgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvJylcbiAgICBcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KGhlaWdodCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9jayggaGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGJsb2NrIGlkXG4gICAqIEBwYXJhbSBibG9ja0lkIGJsb2NrIGlkIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZywgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0QnlJZChibG9ja0lkKSwgd2l0aFRyYW5zYWN0aW9ucyApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtaW5IZWlnaHQsIG1heEhlaWdodCcsIG1pbkhlaWdodCA+PSAwICYmIG1heEhlaWdodCA+PSBtaW5IZWlnaHQsICdtaW5IZWlnaHQgb3IgbWF4SGVpZ2h0IGlzIGludmFsaWQnKVxuICAgXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQsIG1heEhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgYmxvY2sgaWQgYXJyYXlcbiAgICogQHBhcmFtIGJsb2NrSWRzIGFycmF5IG9mIGJsb2NrIGlkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZHMnLCAoKSA9PiBEQkMubm90TnVsbChibG9ja0lkcykgKVxuXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUlkcyhibG9ja0lkcylcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxufSIsImltcG9ydCB7IEVudGl0eSwgIE51bGxhYmxlLCBwYXJ0aWFsIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEVudGl0eVRyYWNrZXIsIFByb3hpZWRFbnRpdHlUcmFja2VyIH0gZnJvbSAnLi9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuXG4vKiogICAgIFxuICogICAgIFNUQVRFIFRSQU5TRkVSICAgICAgICAgICAgICAgICAgQUNUSU9OICAgICAgICAgICAgICAgIFRSQUNLICAgICAgQ0FDSEVcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgICAgPyAgICAgICAgIC0+IHBlcnNpdGVudCAgICAgIHNlc3Npb24ubG9hZCAgICAgICAgICAgICB0cmFjayAgICAgY2FjaGVcbiAqICAgICAgPyAgICAgICAgIC0+IG5ldyAgICAgICAgICAgIHNlc3Npb24uY3JlYXRlICAgICAgICAgICB0cmFjayAgICAgICAtICBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IG1vZGlmaWVkICAgICAgIHNldCBwcm9wZXJ0eSAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBkZWxldGVkICAgICAgICBzZXNzaW9uLmRlbCAgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogbmV3IHwgbW9kaWZpZWQgLT4gcHJlc2lzdGVudCAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGtlZXAgICAgIGNhY2hlfHVwZGF0ZSBcbiAqIGRlbGV0ZWQgICAgICAgIC0+IHRyYW5zaWVudCAgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBldml0ICAgICAgIGV2aXRcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5leHBvcnQgZW51bSBFbnRpdHlTdGF0ZSB7XG4gIFRyYW5zaWVudCAgPSAtMSxcbiAgUGVyc2lzdGVudCA9IDAsXG4gIFxuICBOZXcgICAgICAgID0gMSxcbiAgTW9kaWZpZWQgICA9IDIsXG4gIERlbGV0ZWQgICAgPSAzLFxufVxuXG5leHBvcnQgZW51bSBFbnRpdHlDaGFuZ2VUeXBlIHtcbiAgTmV3ICAgICAgID0gMSxcbiAgTW9kaWZ5ICAgID0gMixcbiAgRGVsZXRlICAgID0gMyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZSB7XG4gIG5hbWUgICAgIDogc3RyaW5nXG4gIG9yaWdpbmFsIDogYW55XG4gIGN1cnJlbnQgIDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19jb25maXJtZWRfXyAgOiBib29sZWFuXG4gIF9fc2NoZW1hX18gICAgIDogTW9kZWxTY2hlbWEgIFxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX19jaGFuZ2VzX18gICAgOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxuICBfX3VuY29uZmlybWVkQ2hhbmdlc19fICA6IE51bGxhYmxlPEVudGl0eUNoYW5nZXM+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJveGllZDxUPiBleHRlbmRzIEVudGl0eUV4dGVuc2lvbiB7XG4gIFxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5UHJveHkge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHRyYWNrZXIgOiBFbnRpdHlUcmFja2VyXG5cbiAgY29uc3RydWN0b3IodHJhY2tlcjogRW50aXR5VHJhY2tlcikge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBFbnRpdHlQcm94eS5uYW1lIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNFeHRlbmRlZChlbnRpdHk6IEVudGl0eSkge1xuICAgIHJldHVybiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc2NoZW1hX18nKSAmJiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc3RhdGVfXycpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzUHJveGllZChlbnRpdHk6IEVudGl0eSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gRW50aXR5UHJveHkuaXNFeHRlbmRlZChlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbnZlcnRUb1Byb3hpZWQ8VEVudGl0eT4oZW50aXR5OiBFbnRpdHkpIDogUHJveGllZDxURW50aXR5PiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFByb3hpZWQgRW50aXR5YClcbiAgICBcbiAgICByZXR1cm4gZW50aXR5IGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcHJveHlUb0VudGl0eShwcm94aWVkOiBQcm94aWVkPEVudGl0eT4sIGNvbnRhaW5zVmVyc2lvbiA9IHRydWUgKTogRW50aXR5IHtcbiAgICByZXR1cm4gY29udGFpbnNWZXJzaW9uID8gXG4gICAgICBwYXJ0aWFsKCBwcm94aWVkLCBwID0+IEVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkocCkgKSA6XG4gICAgICBwYXJ0aWFsKCBwcm94aWVkLCBwID0+IHAgIT09ICdfdmVyc2lvbl8nICYmICBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KHApIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNOb3JtYWxQcm9wZXJ0eShwcm9wZXJ0eU5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKCBwcm9wZXJ0eU5hbWUubGVuZ3RoIDw9IDQgKSB8fCBcbiAgICAgICggcHJvcGVydHlOYW1lWzBdICE9PSBwcm9wZXJ0eU5hbWVbMV0gKSB8fCAoIHByb3BlcnR5TmFtZVswXSAhPT0gJ18nICkgfHxcbiAgICAgICggIXByb3BlcnR5TmFtZS5lbmRzV2l0aCgnX18nKSApIFxuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaEV4dGVuZFByb3BlcnRpZXM8VEVudGl0eT4oZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBzdGF0ZTogRW50aXR5U3RhdGUsICBjb25maXJtZWQgOiBib29sZWFuICkgOiBURW50aXR5IHtcbiAgICBsZXQgcmVzdWx0ID0gIE9iamVjdC5hc3NpZ24oe1xuICAgICAgX3ZlcnNpb25fICAgICAgOiAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX2NvbmZpcm1lZF9fICA6IGNvbmZpcm1lZCxcbiAgICAgIF9fc2NoZW1hX18gICAgIDogc2NoZW1hLFxuICAgICAgX190cmFja2VyX18gICAgOiB0aGlzLnRyYWNrZXIsIFxuICAgICAgX190cmFja2luZ19fICAgOiB0cnVlLFxuICAgICAgX19jaGFuZ2VzX18gICAgOiBudWxsLFxuICAgICAgX191bmNvbmZpcm1lZENoYW5nZXNfXyA6IG51bGxcbiAgICB9LCBlbnRpdHkpXG4gICAgXG4gICAgcmVzdWx0Ll92ZXJzaW9uXyA9IHJlc3VsdC5fdmVyc2lvbl8gfHwgMVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBzdGF0aWMgaW5pdENoYW5nZXMoIGV4dCA6IEVudGl0eUV4dGVuc2lvbiAsIGNoYW5nZVR5cGUgPSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSApIHtcbiAgICBpZiAoY2hhbmdlVHlwZSA9PT0gRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnkpIGV4dC5fX2NoYW5nZXNfXyA9IHtcbiAgICAgIHR5cGUgOiBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSwgICAgICAgIFxuICAgICAgZGJWZXJzaW9uOiBleHQuX3ZlcnNpb25fICxcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPih7IFxuICAgICAgICBuYW1lOiAnX3ZlcnNpb25fJywgb3JpZ2luYWw6IGV4dC5fdmVyc2lvbl8gLSAxLCBjdXJyZW50OiBleHQuX3ZlcnNpb25fIFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9IHtcbiAgICAgIHR5cGUgOiBjaGFuZ2VUeXBlLCAgICAgICAgXG4gICAgICBkYlZlcnNpb246IGV4dC5fdmVyc2lvbl8gLFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UHJvcGVydHlLZXlzKCBlbnRpdHkgOiBFbnRpdHkgKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgcmV0dXJuIGV4dC5fX3NjaGVtYV9fLmZpZWxkTmFtZXNcbiAgfVxuXG4gIHByb3RlY3RlZCBvblByb3BlcnR5U2V0KGVudGl0eTogRW50aXR5LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnksIHJlY2VpdmVyOiBhbnkpIDogYm9vbGVhbiB7ICAgICAgXG4gICAgY29uc3QgZXh0ID0gZW50aXR5IGFzIEVudGl0eUV4dGVuc2lvbiBcbiAgICBjb25zdCBuYW1lID0gcHJvcGVydHlLZXkudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eUtleV0gKSB7XG4gICAgICBlbnRpdHlbcHJvcGVydHlLZXldID0gdmFsdWVcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByb3BlcnR5IGFmdGVyIGRlbGV0ZWRgKVxuICAgIH1cbiAgICBcbiAgICBsZXQgc2NoZW1hID0gZXh0Ll9fc2NoZW1hX19cbiAgICBpZiAoIHNjaGVtYS5pc1JlYWRvbmx5ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSByZWFkb25seSBtb2RlbCAnJHtzY2hlbWEubW9kZWxOYW1lfSdgKVxuICAgIH1cblxuICAgIGlmICggc2NoZW1hLnByaW1hcnlLZXkgPT09IG5hbWUgfHwgc2NoZW1hLmNvbXBvc2l0ZUtleXMuaW5kZXhPZihuYW1lKSA+PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcmltYXJ5IGtleSBvciBjb21wb3NpdGUga2V5IHByb3BlcnR5YClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX2RldGFjaGVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlcikuYXR0YWNoKCByZWNlaXZlciBhcyBQcm94aWVkPGFueT4gKVxuICAgICAgZXh0Ll9fZGV0YWNoZWRfXyA9IGZhbHNlXG4gICAgfVxuXG4gICAgRW50aXR5UHJveHkucmVjb3JkUHJvcGVydHlDaGFuZ2VzKCBleHQsIHByb3BlcnR5S2V5LCB2YWx1ZSApXG4gICAgZW50aXR5W3Byb3BlcnR5S2V5XSA9IHZhbHVlXG4gICAgXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHByb3RlY3RlZCBzdGF0aWMgcmVjb3JkUHJvcGVydHlDaGFuZ2VzKCBleHQgOiBFbnRpdHlFeHRlbnNpb24sIGtleSA6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55ICkge1xuICAgIGxldCBzdGFydENvbmZpcm0gPSBmYWxzZVxuICAgIGlmICggZXh0Ll9fdHJhY2tlcl9fLmlzQ29uZmlybWluZyAmJiBleHQuX19jb25maXJtZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyICkucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggZXh0IClcbiAgICAgIHN0YXJ0Q29uZmlybSA9IHRydWVcbiAgICAgIGV4dC5fX2NvbmZpcm1lZF9fID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKSB7XG4gICAgICBleHQuX3ZlcnNpb25fICsrXG4gICAgICBleHQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuTW9kaWZpZWRcbiAgICAgIEVudGl0eVByb3h5LmluaXRDaGFuZ2VzKCBleHQgKSAgICAgXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnRpZXNDaGFuZ2VzIDogTnVsbGFibGU8QXJyYXk8UHJvcGVydHlDaGFuZ2U+PiA9IG51bGwgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHsgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX19jb25maXJtZWRfXyA/ICBcbiAgICAgICAgZXh0Ll9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlczogXG4gICAgICAgIGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyAgIFxuICAgIH1cbiAgICBlbHNlIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3ICYmIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgKSB7XG4gICAgICBzdGFydENvbmZpcm0gJiYgRW50aXR5UHJveHkuaW5pdENoYW5nZXMoIGV4dCwgRW50aXR5Q2hhbmdlVHlwZS5OZXcgKVxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlc1xuICAgIH1cblxuICAgIGxldCBuYW1lID0ga2V5LnRvU3RyaW5nKClcbiAgICBwcm9wZXJ0aWVzQ2hhbmdlcyAmJiBwcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcsIGNvbmZpcm1lZClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCwgb3duS2V5cyA6IHRoaXMuZ2V0UHJvcGVydHlLZXlzIH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQsICBjb25maXJtZWQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0LCBvd25LZXlzIDogdGhpcy5nZXRQcm9wZXJ0eUtleXMgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIGNvbmZpcm1DaGFuZ2VzPFRFbnRpdHk+KCBwZSA6IFByb3hpZWQ8VEVudGl0eT4gKSA6IHZvaWQge1xuICAgIGlmICggcGUuX19jb25maXJtZWRfXyApIHtcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oJ2NvbmZpcm0gd2hlbiBjb25maXJtZWQnKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICBcbiAgICBsZXQgdG1wQ2hhbmdlcyA9IHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX19cbiAgICBpZiAoIHRtcENoYW5nZXMgJiYgcGUuX19jaGFuZ2VzX18gKSB7XG4gICAgICBwZS5fX2NoYW5nZXNfXy5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKCAuLi50bXBDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzIClcbiAgICB9XG4gICAgZWxzZSBpZiAoICFwZS5fX2NoYW5nZXNfXyApIHtcbiAgICAgIHBlLl9fY2hhbmdlc19fID0gT2JqZWN0LmFzc2lnbih7fSwgdG1wQ2hhbmdlcylcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBfX3VuY29uZmlybWVkQ2hhbmdlc19fID09PSBudWxsICYmIF9fY2hhbmdlc19fICE9PSBudWxsXG4gICAgfVxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiAoIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpIClcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxDaGFuZ2VzPFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX2NvbmZpcm1lZF9fICkge1xuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbygnY2FuY2VsIHdoZW4gY29uZmlybWVkJylcbiAgICAgIHJldHVybiBcbiAgICB9IFxuICAgIFxuICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiBcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIHBjID0+IHBlW3BjLm5hbWVdID0gcGMub3JpZ2luYWwgKSBcbiAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgcGUuX19zdGF0ZV9fID0gcGUuX19jaGFuZ2VzX18gPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmICggcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KCkgKVxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgQ29tcG9zaXRlS2V5IH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIEVudGl0eVRyYWNrZXJBY3Rpb24gPSAoIG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcyApID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5KTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcblxuICBpc0NvbmZpcm1pbmcgOiBib29sZWFuXG4gIGJlZ2luQ29uZmlybSgpIDogdm9pZFxuICBjb25maXJtKCkgOiB2b2lkXG4gIGNhbmNlbENvbmZpcm0oKSA6IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuZXhwb3J0IHR5cGUgUHJveGllZEVudGl0eUFuZENoYW5nZXMgPSB7IGVudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHsgIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY29uZmlybWluZyA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG4gIHByaXZhdGUgdW5jb25maXJtZWRFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuY29uZmlybWluZyA9IGZhbHNlICAgIFxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG5cbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHB1YmxpYyBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IG1rID0geyBtOiBzY2hlbWEubW9kZWxOYW1lLCBrOiBrZXl9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBtayApXG4gIH1cblxuICBwdWJsaWMgc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSApIDogeyBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSB9IHtcbiAgICBsZXQgbWsgPSBKU09OLnBhcnNlKCBtb2RlbEFuZEtleSApXG4gICAgbGV0IGtleSA9IGlzU3RyaW5nKG1rLmspIHx8IGlzTnVtYmVyKG1rLmspID8gbWsuayA6IG5ldyBDb21wb3NpdGVLZXkobWsuay5rZXlPYmplY3QpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBtay5tLCBrZXk6IGtleSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwdWJsaWMgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlVHJhY2tpbmdUcmFuc2lzZW50RW50aXRpZXMoKSB7XG4gICAgbGV0IGtleXMgPSBuZXcgQXJyYXk8TW9kZWxBbmRLZXk+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggKGVudGl0eSwga2V5KSA9PiBlbnRpdHkuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgJiYga2V5cy5wdXNoKGtleSkpXG4gICAga2V5cy5mb3JFYWNoKCBrZXkgPT4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZShrZXkpIClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSk7XG4gICAgaWYgKCB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4aXN0cyBhbm90aGVyIHRyYWNrZWQgZW50aXR5JylcbiAgICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSApXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRMYXN0Q2hhbmdlcyggcGU6IFByb3hpZWQ8YW55PiApIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNEaXJ0eShwZSkpIHJldHVybiB1bmRlZmluZWRcbiAgICAvLyBUT0RPOiBjaGVjayBpZiBjb25maXJtaW5nID9cbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDogXG4gICAgICAgIHJldHVybiBwZS5fX2NoYW5nZXNfXyFcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb246IG51bWJlciApOiBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICBsZXQgdG1wVmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cblxuICAgIHdoaWxlICggdG1wVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiApIHtcbiAgICAgIGxldCBoaXN0b3J5ID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRtcFZlcnNpb24pXG4gICAgICBoaXN0b3J5ICYmIHJlc3VsdC5wdXNoKGhpc3RvcnkpICAgICAgXG4gICAgICB0bXBWZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwga2V5KSApXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0TW9kZWxBbmRLZXkoIHBlIClcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuc2V0KCBrZXksIHBlIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25maXJtaW5nKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25maXJtaW5nXG4gIH1cblxuICBwdWJsaWMgYmVnaW5Db25maXJtKCkgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSB0cnVlXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCdCRUdJTiBiZWdpbkNvbmZpcm0nKVxuICB9XG5cbiAgcHVibGljIGNvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNvbmZpcm1OZXcoIHBlICkgXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTW9kaWZpZWQgKVxuICAgICAgICB0aGlzLmNvbmZpcm1Nb2RpZnkoIHBlIClcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5EZWxldGVkIClcbiAgICAgICAgdGhpcy5jb25maXJtZWREZWxldGUoIHBlIClcbiAgICB9KVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5yZW1vdmVUcmFja2luZ1RyYW5zaXNlbnRFbnRpdGllcygpXG4gICAgdGhpcy5jb25maXJtaW5nID0gZmFsc2VcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoJ1NVQ0NFU1MgY29uZmlybSAnKVxuICB9XG5cbiAgcHVibGljIGNhbmNlbENvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSApIFxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk1vZGlmaWVkIClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZE1vZGlmeSggcGUgKVxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLkRlbGV0ZWQgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSApXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuVHJhbnNpZW50IClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZERlbGV0ZSggcGUgKVxuICAgIH0pXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLnJlbW92ZVRyYWNraW5nVHJhbnNpc2VudEVudGl0aWVzKClcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSBmYWxzZVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSgnU1VDQ0VTUyBjYW5jZWxDb25maXJtICcpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEsICF0aGlzLmlzQ29uZmlybWluZylcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG5cbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIFxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgXG4gICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkgcmV0dXJuXG4gICAgXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG4gICAgcHJveGllZC5fX2NvbmZpcm1lZF9fID0gIXRoaXMuY29uZmlybWluZ1xuICAgIFxuICAgIHN3aXRjaCAoIHByb3hpZWQuX19zdGF0ZV9fICkge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1OZXcoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgbGV0IG5ld1RoZW5Nb2RpZnkgPSBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmIFxuICAgICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXy50eXBlID09PSBFbnRpdHlDaGFuZ2VUeXBlLk5ld1xuICAgICAgXG4gICAgaWYgKCBuZXdUaGVuTW9kaWZ5ICkgeyAgICAgIFxuICAgICAgdGhpcy5wcm94eS5jYW5jZWxDaGFuZ2VzKCBwZSApXG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH1cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1Nb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNvbmZpcm1DaGFuZ2VzKCBwZSApXG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuY2VsVW5jb25maXJtZWRNb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNhbmNlbENoYW5nZXMoIHBlIClcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25maXJtZWREZWxldGUoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk5ldyBcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCApIHtcbiAgICAgIGxldCBtb2RpZmllZCA9ICAoIHBlLl9fY2hhbmdlc19fICYmIHBlLl9fY2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmxlbmd0aCA+IDAgKVxuICAgICAgcGUuX19zdGF0ZV9fID0gbW9kaWZpZWQgPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgXG4gICAgaWYgKCBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICkgeyBcbiAgICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuXG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hLCAhdGhpcy5jb25maXJtaW5nKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PFByb3hpZWRFbnRpdHlBbmRDaGFuZ2VzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxQcm94aWVkRW50aXR5QW5kQ2hhbmdlcz4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgZW50aXR5OiBwZSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSl9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhlbnRpdHk6IEVudGl0eSwgZGJWZXJzaW9uOiBudW1iZXIsIGlzTmV3ID0gdHJ1ZSkgOiBFbnRpdHlDaGFuZ2VzIHtcbiAgICBsZXQgcHJvcGVyaXRlc0NoYW5nZSA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIGZvciAoY29uc3Qga2V5IGluIGVudGl0eSkge1xuICAgICAgaWYgKCFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGtleSkpIGNvbnRpbnVlXG4gICAgICBwcm9wZXJpdGVzQ2hhbmdlLnB1c2goIGlzTmV3ID8gXG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogdW5kZWZpbmVkLCBjdXJyZW50OiBlbnRpdHlba2V5XSB9IDpcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBlbnRpdHlba2V5XSwgY3VycmVudDogIHVuZGVmaW5lZCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fY2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fY2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fY2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm0oKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSksIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTpcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNhY2hlLmdldCggbW9kZWwsIGtleSApXG4gICAgICAgIGlmICggZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuXG4gICAgICAgIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBlIVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlIClcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTogXG4gICAgICAgIGNvbnN0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KCBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjID0+IGMubmFtZSwgYyA9PiBjLm9yaWdpbmFsKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZW50aXR5IClcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbENvbmZpcm0oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX19jaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OlxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGByZWplY3RDaGFuZ2VzIFZlcnNpb24gPSA/YClcbiAgfVxuICBcbiAgcHVibGljIHJvbGxiYWNrQ2hhbmdlcyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMucmVqZWN0Q2hhbmdlcygpXG4gICAgd2hpbGUoIGhpc3RvcnlWZXJzaW9uIDw9IHRoaXMuY3VycmVudFZlcnNpb24gKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzTWFwID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgICBjaGFuZ2VzTWFwICYmIGNoYW5nZXNNYXAuZm9yRWFjaCggKCBjaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5ICkgXG4gICAgICAgIHRoaXMucm9sbGJhY2tDYWNoZUNoYW5nZXMobWsubW9kZWwsIG1rLmtleSwgY2hhbmdlcylcbiAgICAgIH0pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uIC0tXG4gICAgfVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHBlLl9fZGV0YWNoZWRfXyA9IHRydWUpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSBNYXRoLm1pbih0aGlzLm1pblZlcnNpb24sIHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuY3VycmVudFZlcnNpb259YClcbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnkoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkge1xuICAgIGlmICggdGhpcy5taW5WZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uIHx8IHRoaXMuY3VycmVudFZlcnNpb24gPCBoaXN0b3J5VmVyc2lvbiApIHJldHVyblxuICAgIGZvciggbGV0IHZlciA9IHRoaXMubWluVmVyc2lvbjsgdmVyIDwgaGlzdG9yeVZlcnNpb247IHZlcisrICkge1xuICAgICAgdGhpcy5oaXN0b3J5LmRlbGV0ZSh2ZXIpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkdW1wQ2hhbmdlcyggZWM6IEVudGl0eUNoYW5nZXMgKTogc3RyaW5nIHtcbiAgICBsZXQgcHJvcGVydHlDaGFuZ2VzID0gJydcbiAgICBlYy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKHBjID0+IHByb3BlcnR5Q2hhbmdlcyArPSBgJHtwYy5uYW1lfTogJHtwYy5vcmlnaW5hbH0gLT4gJHtwYy5jdXJyZW50fSwgYClcblxuICAgIHJldHVybiBgZGJWZXJzaW9uPSR7ZWMuZGJWZXJzaW9ufSwgdHlwZT0ke2VjLnR5cGV9LCBbJHtwcm9wZXJ0eUNoYW5nZXN9XWBcbiAgfVxuXG4gIHB1YmxpYyBkdW1wSGlzdG9yeSgpIDogc3RyaW5nIHtcbiAgICBsZXQgdmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIEhJU1RPUlkgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHdoaWxlKCB2ZXJzaW9uID49IHRoaXMubWluVmVyc2lvbiApIHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS12ZXJzaW9uICR7dmVyc2lvbn0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGxldCBoaXMgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oIHZlcnNpb24gKVxuICAgICAgaGlzICYmIGhpcy5mb3JFYWNoKCAoIGVjLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmR1bXBDaGFuZ2VzKCBlYyApXG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICAgIGNvbnN0IG1zZyA9IGB0eXBlPSR7bWsubW9kZWx9LCBrZXk9JHttay5rZXl9LCBjaGFuZ2VzPXske2NoYW5nZXN9fSBcXG5gXG4gICAgICAgIHJlc3VsdCArPSBtc2dcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICAgIHZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhY2tlclNxbEJ1aWxkZXIge1xuICBwcml2YXRlIHRyYWNrZXI6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXIsIG1vZGVscyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPiwgc3FsQnVpbGRlcjogU3FsQnVpbGRlciApIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5tb2RlbHMgPSBtb2RlbHNcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBzcWxCdWlsZGVyXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQgZW50aXR5VHJhY2tlcigpIHsgcmV0dXJuIHRoaXMudHJhY2tlciB9XG5cbiAgcHVibGljIGJ1aWxkQ2hhbmdlU3FscygpIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5kZXRlY3RDaGFuZ2VzKCkuZm9yRWFjaCggZWMgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKGVjLmVudGl0eSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkU3FsQW5kUGFyYW1ldGVycyhwZSA6UHJveGllZDxhbnk+KSA6IFNxbEFuZFBhcmFtZXRlcnMgeyAgXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOlxuICAgICAgICBjb25zdCBuZXdFbnRpdHkgPSAgRW50aXR5UHJveHkucHJveHlUb0VudGl0eSggcGUsIHRydWUgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBuZXdFbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==