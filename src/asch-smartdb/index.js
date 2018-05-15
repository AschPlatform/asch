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
            let items = yield session.getMany(model, condition, false, true);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}', condition = '${JSON.stringify(condition)}' )`);
            return this.attach(model, items[0]);
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
        ext.__tracker__.isConfirming &&  ext.__tracker__.registerUnconfirmedEntity( ext );
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
            pe.__changes__ = deepCopy(tmpChanges);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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ekQsTUFBSzthQUNSO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU07SUFDZixDQUFDO0NBRUY7QUE1REQsOENBNERDOzs7Ozs7Ozs7Ozs7QUNuaUJELDJDOzs7Ozs7Ozs7OztBQ0FBLHdDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHNDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6ImFzY2gtc21hcnRkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5kZXgudHNcIik7XG4iLCJpbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJ1xuXG5leHBvcnQgY2xhc3MgQmxvY2tDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KClcbiAgcHJpdmF0ZSBtaW5IZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heEhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1heENhY2hlZENvdW50IDogbnVtYmVyICkge1xuICAgIHRoaXMubWF4Q2FjaGVkQ291bnQgPSBtYXhDYWNoZWRDb3VudFxuICB9XG5cbiAgcHVibGljIGlzQ2FjaGVkKCBoZWlnaHQ6IG51bWJlciApIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhlaWdodCA+IDAgJiYgaGVpZ2h0ID49IHRoaXMubWluSGVpZ2h0ICYmIGhlaWdodCA8PSB0aGlzLm1heEhlaWdodFxuICB9XG5cbiAgcHVibGljIGdldCBjYWNoZWRIZWlnaHRSYW5nZSgpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluIDogdGhpcy5taW5IZWlnaHQsIG1heDogdGhpcy5tYXhIZWlnaHQgfVxuICB9XG5cbiAgcHVibGljIHB1dCggYmxvY2s6IEJsb2NrICkge1xuICAgIGlmICggIXRoaXMuaXNDYWNoZWQoIGJsb2NrLmhlaWdodCApICYmIHRoaXMubWF4SGVpZ2h0ID49IDAgJiYgYmxvY2suaGVpZ2h0ICE9PSB0aGlzLm1heEhlaWdodCArIDEgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICgnaW52YWxpZCBibG9jayBoZWlnaHQnKVxuXG4gICAgdGhpcy5jYWNoZS5zZXQoIGJsb2NrLmhlaWdodCwgYmxvY2sgKVxuICAgIHRoaXMubWF4SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gICAgXG4gICAgaWYgKCB0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhDYWNoZWRDb3VudCApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKCB0aGlzLm1pbkhlaWdodCsrIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0KCBoZWlnaHQ6IG51bWJlciApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoaGVpZ2h0KVxuICB9XG5cbiAgcHVibGljIGdldEJ5SWQoIGlkOiBzdHJpbmcgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgZm9yKCBjb25zdCBiIG9mIHRoaXMuY2FjaGUudmFsdWVzKCkgKSB7XG4gICAgICBpZiAoIGIuaWQhID09PSBpZCApIHJldHVybiBiXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBldml0KCBmcm9tSGVpZ2h0OiBudW1iZXIsIHRvSGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgbGV0IG1pbiA9IE1hdGgubWluKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgbGV0IG1heCA9IE1hdGgubWF4KCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgaWYgKCBtaW4gPiB0aGlzLm1heEhlaWdodCB8fCBtYXggPCB0aGlzLm1pbkhlaWdodCApIHJldHVybiBcbiAgICBcbiAgICBtaW4gPSBNYXRoLm1heCggbWluLCB0aGlzLm1pbkhlaWdodCApXG4gICAgbWF4ID0gTWF0aC5taW4oIG1heCwgdGhpcy5taW5IZWlnaHQgKVxuICAgIGZvciAoIGxldCBoZWlnaHQgPSBtaW47IGhlaWdodCA8PSBtYXg7IGhlaWdodCsrICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoaGVpZ2h0KVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5T2JqZWN0IHsgXG4gIGtleSA6IHN0cmluZ1xuICBrZXlKc29uIDogSnNvbk9iamVjdFxufVxuZXhwb3J0IHR5cGUgRW50aXR5S2V5ID0gc3RyaW5nIHwgbnVtYmVyIHwgS2V5T2JqZWN0XG5cbmV4cG9ydCB0eXBlIFBhcnRpYWw8VD4gPSB7XG4gIFtQIGluIGtleW9mIFRdPzogVFtQXVxufVxuXG5leHBvcnQgdHlwZSBSZWFkb25seVBhcnRpYWw8VD4gPSB7XG4gIHJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdO1xufVxuXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jdGlvbjxUPiA9ICggZSA6IFQgKSA9PiBib29sZWFuXG5cbmV4cG9ydCB0eXBlIEtleVZhbHVlUGFpciA9IHsga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkgfVxuZXhwb3J0IHR5cGUgQ2FsbGJhY2s8VFJlc3VsdD4gPSAoIGVycjogRXJyb3J8bnVsbCwgZGF0YTogVFJlc3VsdCApID0+IHZvaWRcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VKc29uT2JqZWN0PFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiwgZ2V0S2V5OiAodCA6IFQpID0+IHN0cmluZywgZ2V0VmFsdWU6ICh0OiBUKSA9PiBhbnkgICkgOiBKc29uT2JqZWN0IHtcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnaXRlcmFibGUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggaXRlcmFibGUgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0S2V5JywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldEtleSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRWYWx1ZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRWYWx1ZSApKVxuXG4gIGxldCByZXQgPSB7fVxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG4gICAgcmV0W2dldEtleShpdGVtKV0gPSBnZXRWYWx1ZShpdGVtKVxuICB9XG4gIHJldHVybiByZXQgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQ29weTxUPihzcmMgOiBUKSA6IFQge1xuICBpZiAoICFzcmMgKSByZXR1cm4gc3JjXG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNyYykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsPFQ+KCBzcmMgOiBULCBrZXlzT3JLZXlGaWx0ZXIgOiBBcnJheTxzdHJpbmc+IHwgKChrZXkgOiBzdHJpbmcpID0+IGJvb2xlYW4pICk6IFBhcnRpYWw8VD4ge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdzcmMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggc3JjICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2tleXNPcktleUZpbHRlcicsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBrZXlzT3JLZXlGaWx0ZXIgKSlcblxuICBsZXQga2V5cyA9IGlzRnVuY3Rpb24oa2V5c09yS2V5RmlsdGVyKSA/IFxuICAgIE9iamVjdC5rZXlzKHNyYykuZmlsdGVyKCBrZXlzT3JLZXlGaWx0ZXIgYXMgKChrZXkgOiBzdHJpbmcpID0+IGJvb2xlYW4pICkgOlxuICAgIGtleXNPcktleUZpbHRlciBhcyBBcnJheTxzdHJpbmc+XG5cbiAgbGV0IHJlc3VsdCA9IHsgfVxuICBmb3IgKCBsZXQgayBvZiBrZXlzICkgcmVzdWx0W2tdID0gc3JjW2tdXG4gIHJldHVybiByZXN1bHQgYXMgUGFydGlhbDxUPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICggIWtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4gaXNTdHJpbmcoIGtleSApIHx8IGlzTnVtYmVyKCBrZXkgKVxufVxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCBtZXNzYWdlIDogc3RyaW5nICkge1xuICAgIHN1cGVyKCAnQ29kZSBjb250cmFjdCBFcnJvciwnKyBtZXNzYWdlIClcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDb250cmFjdENvbmRpdGlvbiA9IGJvb2xlYW4gfCAoICgpID0+IGJvb2xlYW4gKVxuZXhwb3J0IHR5cGUgQ29udHJhY3RNZXNzYWdlICAgPSBzdHJpbmcgIHwgKCAoKSA9PiBzdHJpbmcgKVxuXG5leHBvcnQgdHlwZSBNYXliZVVuZGVmaW5lZDxUPiA9IFQgfCB1bmRlZmluZWRcbmV4cG9ydCB0eXBlIE51bGxhYmxlPFQ+ID0gVCB8IG51bGwgfCB1bmRlZmluZWRcblxuZXhwb3J0IHR5cGUgQ29udHJhY3RWZXJpZnlSZXN1bHQgPSB7IHJlc3VsdCA6IGJvb2xlYW4sIG1lc3NhZ2U6IE51bGxhYmxlPHN0cmluZz4gfSBcbmV4cG9ydCB0eXBlIFZlcmlmeUZ1bmN0aW9uID0gKCkgPT4gQ29udHJhY3RWZXJpZnlSZXN1bHRcblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdCB7XG4gIHB1YmxpYyBzdGF0aWMgdmVyaWZ5KCBjb25kaXRpb246IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlIDogQ29udHJhY3RNZXNzYWdlICkgOiB2b2lkIHtcbiAgICBpZiAoIGNvbmRpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IGNvbmRpdGlvbiA9PT0gbnVsbCApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJpZnkgY29uZGl0aW9uJylcblxuICAgIGNvbnN0IGNvbmQgPSBpc0Z1bmN0aW9uKGNvbmRpdGlvbikgPyAoY29uZGl0aW9uIGFzIEZ1bmN0aW9uKSgpIDogY29uZGl0aW9uXG4gICAgY29uc3QgbXNnID0gaXNGdW5jdGlvbihtZXNzYWdlKSA/IChtZXNzYWdlIGFzIEZ1bmN0aW9uKSgpIDogbWVzc2FnZVxuXG4gICAgaWYgKCFjb25kKSB0aHJvdyBuZXcgQ29kZUNvbnRyYWN0RXJyb3IoIG1zZyApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFyZ3VtZW50KCBhcmdOYW1lOiBzdHJpbmcsIHZlcmlmeTogVmVyaWZ5RnVuY3Rpb24gfCBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZT8gOiBDb250cmFjdE1lc3NhZ2UgKTogdm9pZCB7XG4gICAgaWYgKCAhYXJnTmFtZSB8fCAhdmVyaWZ5ICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ05hbWUgb3IgdmVyaWZ5IGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBpZiAoICFtZXNzYWdlICkge1xuICAgICAgY29uc3QgdnIgPSAgKHZlcmlmeSBhcyBWZXJpZnlGdW5jdGlvbikoKVxuICAgICAgQ29kZUNvbnRyYWN0LnZlcmlmeSggdnIucmVzdWx0LCBgYXJndW1lbnQgJyR7YXJnTmFtZX0nICR7dnIubWVzc2FnZX1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgQ29kZUNvbnRyYWN0LnZlcmlmeSh2ZXJpZnkgYXMgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UhKSAgICBcbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsKCBhcmcgOiBhbnkgKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhcmcgIT09IG51bGwgJiYgYXJnICE9PSB1bmRlZmluZWRcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JFbXB0eSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGwoc3RyKSAmJiBzdHIgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3IgZW1wdHknXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yV2hpdGVzcGFjZSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGxPckVtcHR5KCBzdHIgKSAmJiAoIHN0ciBhcyBzdHJpbmcgKS50cmltKCkgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3Igd2hpdGVzcGFjZSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbn1cblxuXG4iLCJpbXBvcnQgeyBFbnRpdHlDYWNoZSwgTFJVRW50aXR5Q2FjaGUsIEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciB9IGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IEpzb25TcWxCdWlsZGVyLCBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciwgTVVMVElfU1FMX1NFUEFSQVRPUiB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEVudGl0eSwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFByb3hpZWRFbnRpdHlUcmFja2VyLCBUcmFja2VyU3FsQnVpbGRlciwgRW50aXR5Q2hhbmdlc0l0ZW0sIE1vZGVsQW5kS2V5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eUV4dGVuc2lvbiwgUHJveGllZCwgRW50aXR5U3RhdGUgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIFNhdmVIaXN0b3J5QWN0aW9uID0gKCB2ZXJzaW9uOiBudW1iZXIsIGhpc3Rvcnk6IE1hcDxzdHJpbmcsIEVudGl0eUNoYW5nZXM+ICkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgRGJTZXNzaW9uIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNlc3Npb25DYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgc3FsQnVpbGRlciA6IEpzb25TcWxCdWlsZGVyXG4gIHByaXZhdGUgdHJhY2tlclNxbEJ1aWxkZXI6IFRyYWNrZXJTcWxCdWlsZGVyXG4gIHByaXZhdGUgZW50aXR5VHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgaG9sZExvY2tzIDogTWFwPHN0cmluZywgYm9vbGVhbj5cbiAgcHJpdmF0ZSBzZXNzaW9uU2VyaWFsIDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uLCBjYWNoZU9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMsIHNlc3Npb25OYW1lPzogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRGJTZXNzaW9uLm5hbWUgKyAoIHNlc3Npb25OYW1lID09PSB1bmRlZmluZWQgPyAnJyA6IGBfJHtzZXNzaW9uTmFtZX1gKSAgKVxuICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IC0xXG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgIHRoaXMubW9kZWxzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUgPSBuZXcgTFJVRW50aXR5Q2FjaGUoY2FjaGVPcHRpb25zKVxuICAgIHRoaXMuc3FsQnVpbGRlciA9IG5ldyBKc29uU3FsQnVpbGRlcigpXG4gICAgdGhpcy5lbnRpdHlUcmFja2VyID0gbmV3IFByb3hpZWRFbnRpdHlUcmFja2VyKCB0aGlzLnNlc3Npb25DYWNoZSApXG4gICAgdGhpcy5ob2xkTG9ja3MgPSBuZXcgTWFwPHN0cmluZywgYm9vbGVhbj4oKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZTogc3RyaW5nKSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobW9kZWxOYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke21vZGVsTmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeUNsYXNzPFRFbnRpdHk+KGNsYXp6OiBDb25zdHJ1Y3RvcjxURW50aXR5PikgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KGNsYXp6Lm5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7Y2xhenoubmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWE8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsKSA6IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeUNsYXNzKG1vZGVsKVxuICB9XG5cbiAgcHJvdGVjdGVkIG1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSgge30sIGtleSApXG4gIH1cblxuICBwcm90ZWN0ZWQgdHJhY2tQZXJzaXN0ZW50RW50aXRpZXM8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsICBlbnRpdGllcyA6IEFycmF5PFRFbnRpdHk+LCBjYWNoZSA9IHRydWUsIHJlZnJlc2hJZlRyYWNraW5nID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHtcbiAgICAgIGxldCBrZXkgPSBzY2hlbWEuZ2V0S2V5KGUpIFxuICAgICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICAgIGxldCBwcm94aWVkID0gcmVmcmVzaElmVHJhY2tpbmcgJiYgdHJhY2tlZCAhPT0gdW5kZWZpbmVkID8gXG4gICAgICAgIHRyYWNrZWQgYXMgYW55IGFzIFRFbnRpdHkgOiBcbiAgICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudDxURW50aXR5PihzY2hlbWEsIGUpXG4gICAgICByZXN1bHQucHVzaCggcHJveGllZCApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwga2V5LCBlIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCByZXNldChjbGVhckNhY2hlOiBib29sZWFuID0gZmFsc2UpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnN0b3BUcmFja0FsbCgpXG4gICAgaWYgKCBjbGVhckNhY2hlICkgdGhpcy5lbnRpdHlDYWNoZS5jbGVhcigpXG4gIH1cblxuICBwcm90ZWN0ZWQgdW5kZWZpbmVkSWZEZWxldGVkPFRFbnRpdHk+KCBwcm94aWVkIDogUHJveGllZDxURW50aXR5PiApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIHJldHVybiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSA/IFxuICAgICAgdW5kZWZpbmVkIDogXG4gICAgICBwcm94aWVkIGFzIE9iamVjdCBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogdm9pZCB7XG4gICAgdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSkuZm9yRWFjaCggc3FsPT4ge1xuICAgICAgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVTeW5jKCBzcWwgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJTY2hlbWEoLi4uc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiB2b2lkIHtcbiAgICBzY2hlbWFzLmZvckVhY2goIHMgPT4gdGhpcy5tb2RlbHMuc2V0KHMubW9kZWxOYW1lLCBzKSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucmVzZXQoIHRydWUgKVxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5kaXNjb25uZWN0KClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KTogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICB9XG5cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+ICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IGVudGl0eU1hcCA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIFRFbnRpdHk+KClcbiAgICBuZXcgQXJyYXk8UHJveGllZDxhbnk+PiguLi50aGlzLmVudGl0eVRyYWNrZXIudHJhY2tpbmdFbnRpdGllcyBhcyBJdGVyYWJsZTxQcm94aWVkPGFueT4+IClcbiAgICAgIC5maWx0ZXIoIHBlID0+IHBlLl9fc2NoZW1hX18ubW9kZWxOYW1lID09PSBzY2hlbWEubW9kZWxOYW1lICYmIHBlLl9fc3RhdGVfXyAhPT0gRW50aXR5U3RhdGUuRGVsZXRlZCAmJiBwZS5fX3N0YXRlX18gIT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICAgICAuZm9yRWFjaCggcGUgPT4gZW50aXR5TWFwLnNldCggdGhpcy5lbnRpdHlUcmFja2VyLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUgYXMgYW55IGFzIFRFbnRpdHkpIClcblxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKVxuICAgIGVudGl0aWVzICYmIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgbGV0IGtleSA9IHRoaXMuZW50aXR5VHJhY2tlci5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlKSApXG4gICAgICBpZiAoICFlbnRpdHlNYXAuaGFzKGtleSkpIHtcbiAgICAgICAgbGV0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBlIClcbiAgICAgICAgZW50aXR5TWFwLnNldCgga2V5LCBwZSApXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZmlsdGVyID8gWy4uLmVudGl0eU1hcC52YWx1ZXMoKV0uZmlsdGVyKCBmaWx0ZXIgKSA6IFsuLi5lbnRpdHlNYXAudmFsdWVzKCldXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcblxuICAgIGxldCBjYWNoZWQgPSB0aGlzLmVudGl0eUNhY2hlLmdldDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICByZXR1cm4gKCBjYWNoZWQgPT09IHVuZGVmaW5lZCApID8gdW5kZWZpbmVkIDogXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KCBzY2hlbWEsIGNhY2hlZCApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgJiYgdGhpcy5lbnRpdHlDYWNoZS5leGlzdHNNb2RlbChzY2hlbWEubW9kZWxOYW1lKSApIHtcbiAgICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlLCB0cnVlICkgOiBlbnRpdGllcyBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0TWFueSggbW9kZWwsIHsgfSwgdHJhY2sgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSwgY2FjaGUgPSB0cnVlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbilcbiAgICBcbiAgICBsZXQgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBjYWNoZSAmJiBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpLCBlICkpXG5cbiAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz86IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeUJ5SnNvbjxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgcGFyYW1zKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeS5yZXBsYWNlKE1VTFRJX1NRTF9TRVBBUkFUT1IsICcnKX0pIGFzIGV4aXN0YFxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeSggcXVlcnksIHBhcmFtZXRlcnMgKVxuICAgIFxuICAgIHJldHVybiBpc0FycmF5KHJldCkgJiYgcGFyc2VJbnQocmV0WzBdWydleGlzdCddKSA+IDAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCByZXQgPSBhd2FpdCB0aGlzLnF1ZXJ5QnlKc29uKCBtb2RlbCwgeyBmaWVsZHMgOiAnY291bnQoKikgYXMgY291bnQnLCBjb25kaXRpb246IGNvbmRpdGlvbiB9IClcbiAgICByZXR1cm4gaXNBcnJheShyZXQpID8gcGFyc2VJbnQocmV0WzBdWydjb3VudCddKSA6IDAgXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCAga2V5OiBFbnRpdHlLZXksIGVudGl0eT8gOiBURW50aXR5KSA6IFRFbnRpdHkgeyAgICBcbiAgICBpZiAoICFrZXkgKSB0aHJvdyBuZXcgRXJyb3IoJ2VudGl0eSBrZXkgY2FuIG5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgdGhlRW50aXR5ID0gc2NoZW1hLm5ld0VudGl0eSggbW9kZWwsIGtleSApXG4gICAgZW50aXR5ICYmIHNjaGVtYS5jb3B5UHJvcGVydGllcyggdGhlRW50aXR5LCBlbnRpdHkgKVxuXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHkoc2NoZW1hLCBrZXkpXG4gICAgbGV0IGV4aXN0cyA9IHRyYWNrZWQgIT09IHVuZGVmaW5lZCB8fCB0aGlzLnNlc3Npb25DYWNoZS5leGlzdHMoIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgKVxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja05ldyhzY2hlbWEsIHRoZUVudGl0eSkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWRFbnRpdHlCeUtleShtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuICAgIGNvbnN0IHdoZXJlID0gdGhpcy5tYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIHdoZXJlKVxuXG4gICAgY29uc3Qgcm93cyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggcm93cy5sZW5ndGggPiAxICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkga2V5IGlzIGR1cGxpY2F0ZWQgKCBtb2RlbCA9ICcke21vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgIClcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cy5sZW5ndGggPT09IDEgPyByb3dzWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbG9hZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMubG9hZENhY2hlZCggbW9kZWwsIGtleSwgdHJ1ZSApXG4gICAgaWYgKCBjYWNoZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiBjYWNoZWRcbiAgXG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKCBtb2RlbE5hbWUgKSFcblxuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICkgcmV0dXJuIHRoaXMudW5kZWZpbmVkSWZEZWxldGVkKHRyYWNrZWQpXG4gICAgXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgdGhpcy5sb2FkRW50aXR5QnlLZXkoIG1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIFxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlLnB1dCggbW9kZWxOYW1lLCBrZXksIGVudGl0eSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG5cbiAgICBjb25zdCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICYmIHRyYWNrICkgcmV0dXJuIHRoaXMudW5kZWZpbmVkSWZEZWxldGVkKHRyYWNrZWQpXG5cbiAgICBjb25zdCBlbnRpdHkgPSB0aGlzLnNlc3Npb25DYWNoZS5nZXQ8VEVudGl0eT4obW9kZWxOYW1lLCBrZXkpXG4gICAgaWYgKCBlbnRpdHkgPT09IHVuZGVmaW5lZCB8fCAhIHRyYWNrICkgcmV0dXJuIGVudGl0eVxuXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlbnRpdHkpIGFzIFRFbnRpdHkgXG4gIH1cblxuICBwdWJsaWMgbG9ja0luVGhpc1Nlc3Npb24oIGxvY2tOYW1lOiBzdHJpbmcsIG5vdFRocm93ID0gZmFsc2UgKSA6IGJvb2xlYW4ge1xuICAgIGlmICggIXRoaXMuaG9sZExvY2tzLmhhcyggbG9ja05hbWUgKSApIHtcbiAgICAgIHRoaXMuaG9sZExvY2tzLnNldCggbG9ja05hbWUsIHRoaXMuZW50aXR5VHJhY2tlci5pc0NvbmZpcm1pbmcgKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoICFub3RUaHJvdyApIHRocm93IG5ldyBFcnJvcihgJHtsb2NrTmFtZX0gZXhpc3RzIGFscmVhZHlgKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBzYXZlQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVDaGFuZ2VzKHNlcmlhbD8gOiBudW1iZXIpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCByZXRTZXJpYWwgPSBzZXJpYWwgfHwgKyt0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgIFxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkQ2hhbmdlU3FscygpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goIHNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8PSBzZXJpYWwgKSByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgKCBzZXJpYWwgPSAke3NlcmlhbH0gKWApXG5cbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZFJvbGxiYWNrQ2hhbmdlU3FscyhzZXJpYWwgKyAxKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKHNxbHMpIFxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcblxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwgKyAxKVxuICAgICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gc2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWApXG4gICAgICByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsOiBudW1iZXIgKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5jbGVhckhpc3RvcnkoIHNlcmlhbCApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCk6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuaGlzdG9yeVZlcnNpb25cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIC8vIGRvIG5vdGhpbmcgLlxuICB9XG5cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrRGVsZXRlKChlbnRpdHkgYXMgT2JqZWN0IGFzIEVudGl0eUV4dGVuc2lvbikuX19zY2hlbWFfXywgIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zYWN0aW9uKCkgOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICB9ICBcblxuICBwdWJsaWMgYmVnaW5FbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmJlZ2luQ29uZmlybSgpXG4gIH1cblxuICBwdWJsaWMgY29tbWl0RW50aXR5VHJhbnNhY3Rpb24oKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5jb25maXJtKCkgXG4gICAgdGhpcy5ob2xkTG9ja3MuZm9yRWFjaCggKHYsIGspID0+IHRoaXMuaG9sZExvY2tzW2tdID0gZmFsc2UgKVxuICB9XG5cbiAgcHVibGljIHJvbGxiYWNrRW50aXR5VHJhbnNhY3Rpb24oKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5jYW5jZWxDb25maXJtKClcbiAgICBcbiAgICBsZXQgcmVtb3ZlS2V5cyA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICB0aGlzLmhvbGRMb2Nrcy5mb3JFYWNoKCAodiwgaykgPT4gcmVtb3ZlS2V5cy5wdXNoKGspIClcbiAgICByZW1vdmVLZXlzLmZvckVhY2goIGsgPT4gdGhpcy5ob2xkTG9ja3MuZGVsZXRlKGspKVxuICB9XG4gIFxufSIsImltcG9ydCAqIGFzIExSVSBmcm9tICdscnUtY2FjaGUnXG5pbXBvcnQgeyBFbnRpdHksIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEtleU9iamVjdCwgRmlsdGVyRnVuY3Rpb24sIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc051bWJlciwgaXNGdW5jdGlvbiwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcblxuLyoqXG4gKiBjYWNoZSBvcHRpb25zXG4gKi9cbmV4cG9ydCB0eXBlIEVudGl0eUNhY2hlT3B0aW9ucyA9IHsgXG4gIGRlZmF1bHQgOiBudW1iZXIsXG4gIFttb2RlbDogc3RyaW5nXTogIG51bWJlciB8ICggKCBtb2RlbDogc3RyaW5nICkgPT4gbnVtYmVyIClcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDYWNoZSB7XG4gIG1vZGVscyA6IEFycmF5PHN0cmluZz5cbiAgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkXG4gIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+XG4gIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksICBlbnRpdHk6IEVudGl0eSkgOiB2b2lkXG4gIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWRcbiAgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuICBcbiAgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgTFJVRW50aXR5Q2FjaGUgaW1wbGVtZW50cyBFbnRpdHlDYWNoZSB7XG4gIHByaXZhdGUgc3RhdGljIE1JTl9DQUNIRURfQ09VTlQgPSAxMDBcbiAgcHJpdmF0ZSBzdGF0aWMgREVGVUxUX01BWF9DQUNIRURfQ09VTlQgPSAxMDAwMFxuXG4gIHByaXZhdGUgb3B0aW9uczogRW50aXR5Q2FjaGVPcHRpb25zXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgbW9kZWxDYWNoZXMgOiBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgeyBkZWZhdWx0IDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlQgfVxuICAgIC8vIGZvciggbGV0IGsgaW4gdGhpcy5vcHRpb25zICkgXG4gICAgLy8gICB0aGlzLm9wdGlvbnNba10gPSBpc051bWJlcih0aGlzLm9wdGlvbnNba10pID8gdGhpcy5vcHRpb25zW2tdIDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoTFJVRW50aXR5Q2FjaGUubmFtZSlcbiAgICB0aGlzLm1vZGVsQ2FjaGVzID0gbmV3IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+KClcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUgOiBzdHJpbmcsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UsIHRocm93SWZOb3RFeGlzdHMgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxMUlUuQ2FjaGU8RW50aXR5S2V5LCBFbnRpdHk+PiB7XG4gICAgaWYgKCBjcmVhdGVJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgeyBcbiAgICAgIC8vIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAvLyAgIG1heDogNTAwLFxuICAgICAgLy8gICBsZW5ndGg6IGZ1bmN0aW9uIChuLCBrZXkpIHsgcmV0dXJuIG4gKiAyICsga2V5Lmxlbmd0aCB9LFxuICAgICAgLy8gICAvL2Rpc3Bvc2U6IGZ1bmN0aW9uIChrZXksIG4pIHsgbi5jbG9zZSgpIH0sXG4gICAgICAvLyAgIG1heEFnZTogMTAwMCAqIDYwICogNjAgXG4gICAgICAvLyB9XG4gICAgICBsZXQgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXI7XG4gICAgICBpZiAoICF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkobW9kZWxOYW1lKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0XG4gICAgICBlbHNlIGlmICggaXNOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKVxuICAgICAgZWxzZSBpZiAoIGlzRnVuY3Rpb24odGhpcy5vcHRpb25zW21vZGVsTmFtZV0pKVxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9ICggdGhpcy5vcHRpb25zW21vZGVsTmFtZV0gYXMgKG1vZGVsKT0+IG51bWJlciApKCBtb2RlbE5hbWUgKVxuICAgICAgZWxzZSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgICBtYXhDYWNoZWRDb3VudCA9IE1hdGgubWF4KCBMUlVFbnRpdHlDYWNoZS5NSU5fQ0FDSEVEX0NPVU5ULCBtYXhDYWNoZWRDb3VudCApXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLnNldChtb2RlbE5hbWUsIG5ldyBMUlU8c3RyaW5nLCBFbnRpdHk+KCBtYXhDYWNoZWRDb3VudCApIClcbiAgICB9XG4gICAgIGlmICggdGhyb3dJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgXG4gICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2RlbCBjYWNoZSAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApICBkb2VzIG5vdCBleGlzdHNgKSBcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLm1vZGVsQ2FjaGVzLmdldChtb2RlbE5hbWUpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2FjaGVLZXkoIGtleTogRW50aXR5S2V5ICkgOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByaW1pdGl2ZUtleShrZXkpID8ga2V5IGFzIG51bWJlciB8IHN0cmluZyA6ICgga2V5IGFzIEtleU9iamVjdCApLmtleVxuICB9XG5cbiAgcHVibGljIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZCB7ICAgIFxuICAgIGlmICggaXNTdHJpbmcobW9kZWxOYW1lKSApIHtcbiAgICAgIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgdHJ1ZSApIS5yZXNldCgpXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLmRlbGV0ZSggbW9kZWxOYW1lIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmb3IgKCBsZXQgYyBvZiB0aGlzLm1vZGVsQ2FjaGVzLnZhbHVlcygpICkge1xuICAgICAgYy5yZXNldCgpXG4gICAgfVxuICAgIHRoaXMubW9kZWxDYWNoZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbHMoKSA6IHN0cmluZ1tdIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIGZvciggbGV0IG0gb2YgdGhpcy5tb2RlbENhY2hlcy5rZXlzKCkgKSB7XG4gICAgICByZXN1bHQucHVzaCggbSApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbiAgcHVibGljIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuXG4gICAgcmV0dXJuICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpID8gdW5kZWZpbmVkIDpcbiAgICAgIG1vZGVsQ2FjaGUhLmhhcyhjYWNoZUtleSkgPyBtb2RlbENhY2hlIS5nZXQoY2FjaGVLZXkpIGFzIFRFbnRpdHkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGxldCBjYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lIClcbiAgICBpZiAoIGNhY2hlID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjYWNoZS5mb3JFYWNoKCBlID0+IHtcbiAgICAgICghZmlsdGVyIHx8IChmaWx0ZXIgJiYgZmlsdGVyKCBlIGFzIFRFbnRpdHkgKSkpICYmIHJlc3VsdC5wdXNoKCBlIGFzIFRFbnRpdHkgKSBcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBlbnRpdHk6IEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHB1dCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7a2V5fSwgZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApICAgIFxuICAgIHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUsIHRydWUpIS5zZXQodGhpcy5nZXRDYWNoZUtleShrZXkpLCBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZCB7XG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYGV2aXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2NhY2hlS2V5fWApXG5cbiAgICBjb25zdCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBpZiAobW9kZWxDYWNoZSkgbW9kZWxDYWNoZS5kZWwoY2FjaGVLZXkpXG4gIH1cbiAgXG4gIHB1YmxpYyBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldChtb2RlbE5hbWUsICB0aGlzLmdldENhY2hlS2V5KCBrZXkgKSkgIT09IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIGZhbHNlICkgIT09IHVuZGVmaW5lZFxuICB9XG5cblxuICBwdWJsaWMgZHVtcENhY2hlKCkgOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgQ0FDSEUgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHRoaXMubW9kZWxDYWNoZXMuZm9yRWFjaCggKGNhY2hlLCBtb2RlbCkgPT4ge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLU1vZGVsICR7bW9kZWx9LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBjYWNoZS5mb3JFYWNoKCAoIGVudGl0eSwga2V5ICkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gYGtleSA9ICR7dGhpcy5nZXRDYWNoZUtleSgga2V5ICl9LCBlbnRpdHkgPSB7JHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfX0gXFxuYFxuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgIH0pICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgc2RiIGZyb20gJy4vU21hcnREQidcbmltcG9ydCAqIGFzIG1vZGVsIGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgKiBhcyBibG9jayBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0ICogYXMgbG9nIGZyb20gJy4vTG9nJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9jayA9IGJsb2NrLkJsb2NrXG4gIGV4cG9ydCB0eXBlIExvZ01hbmFnZXIgPSBsb2cuTG9nTWFuYWdlclxuICBleHBvcnQgdHlwZSBMb2dMZXZlbCA9IGxvZy5Mb2dMZXZlbFxuICBleHBvcnQgY29uc3QgRGJTZXNzaW9uID0gc2Vzc2lvbi5EYlNlc3Npb25cbiAgZXhwb3J0IHR5cGUgRGJDb25uZWN0aW9uID0gY29ubi5EYkNvbm5lY3Rpb25cbiAgZXhwb3J0IGNvbnN0IFNxbGl0ZUNvbm5lY3Rpb24gPSBzcWxpdGUuU3FsaXRlQ29ubmVjdGlvblxufSBcbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgQ2FsbGJhY2ssIE1heWJlVW5kZWZpbmVkfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgKiBhcyBzdWIgZnJvbSAnbGV2ZWwtc3VibGV2ZWwnXG5cbmNvbnN0IGxldmVsID0gcmVxdWlyZSgnbGV2ZWwnKVxuY29uc3QgU2Vub25kYXJ5ID0gcmVxdWlyZSgnbGV2ZWwtc2Vjb25kYXJ5JylcblxuZXhwb3J0IHR5cGUgR2V0SW5kZXhWYWx1ZUZ1bmMgPSAoa2V5OiBhbnksIHZhbHVlOiBKc29uT2JqZWN0KSA9PiBhbnlcbmV4cG9ydCB0eXBlIEluZGV4RmllbGQgPSB7IGZpZWxkTmFtZTogc3RyaW5nLCBjYWxjSW5kZXg/OiBHZXRJbmRleFZhbHVlRnVuYyB9XG5cbmV4cG9ydCBjbGFzcyBTdWJMZXZlbE1ldGEge1xuICBwdWJsaWMgc3ViTmFtZTogc3RyaW5nXG4gIHB1YmxpYyBrZXlGaWVsZCA6IHN0cmluZ1xuICBwdWJsaWMgaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkOiBzdHJpbmcsIGluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkpIHtcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdChpbmRleEZpZWxkcylcbiAgfVxuXG4gIHByaXZhdGUgZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXhGaWVsZHMuZmluZEluZGV4KGl0ZW0gPT4gZmllbGROYW1lID09PSBpdGVtLmZpZWxkTmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNJbmRleChmaWVsZE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpID4gLTFcbiAgfVxuXG4gIHB1YmxpYyBhZGRJbmRleChmaWVsZE5hbWUgOiBzdHJpbmcsIGNhbGNJbmRleCA6IEdldEluZGV4VmFsdWVGdW5jKTogdGhpcyB7XG4gICAgaWYgKHRoaXMuZXhpc3RzSW5kZXgoZmllbGROYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW5kZXggb2YgZmllbGQgJyR7ZmllbGROYW1lfScgYWxyZWFkeSBleGlzdHNgKVxuXG4gICAgdGhpcy5pbmRleEZpZWxkcy5wdXNoKHsgZmllbGROYW1lLCBjYWxjSW5kZXggfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUluZGV4KGZpZWxkTmFtZSk6IHRoaXMge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKVxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgdGhpcy5pbmRleEZpZWxkcy5zbGljZShpZHgsIDEpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2UoKSA6IENhbGxiYWNrPGFueT4ge1xuICBsZXQgY2FsbGJhY2tcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNhbGxiYWNrID0gKGVyciwgdmFsdWUpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSh2YWx1ZSlcbiAgfSlcbiAgY2FsbGJhY2sucHJvbWlzZSA9IHByb21pc2VcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGNhbGxiYWNrIDogQ2FsbGJhY2s8YW55PiB8IHVuZGVmaW5lZCApIDogeyBjYWxsYmFjazogQ2FsbGJhY2s8YW55PiwgcHJvbWlzZTogUHJvbWlzZTxhbnk+fG51bGwgfSB7XG4gIGxldCBwcm9taXNlID0gbnVsbFxuXG4gIGlmICggIWNhbGxiYWNrICkge1xuICAgIGNhbGxiYWNrID0gbWFrZVByb21pc2UoKVxuICAgIHByb21pc2UgPSBjYWxsYmFja1sncHJvbWlzZSddXG4gIH1cblxuICByZXR1cm57IGNhbGxiYWNrLCBwcm9taXNlIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbFJlYWRhYmxlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVTdHJlYW0ge1xuICBvbiggZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrIDogRnVuY3Rpb24gKSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbEdldCB7XG4gIGdldDxUPihrZXk6IGFueSwgb3B0aW9ucz86IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PikgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+Pik6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+XG59XG5cbmV4cG9ydCBjbGFzcyBMZXZlbERCIHsgIFxuICBwcml2YXRlIGRiRGlyIDogc3RyaW5nXG4gIHByaXZhdGUgc3ViTWV0YXMgOiBBcnJheTxTdWJMZXZlbE1ldGE+XG4gIHByaXZhdGUgc3ViTGV2ZWxzIDogTWFwPHN0cmluZywgSW5kZXhlZExldmVsPlxuICBwcml2YXRlIGxldmVsZGIgOiBhbnlcbiAgcHJpdmF0ZSBzdWJMZXZlbGRiIDogc3ViLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1Yih0aGlzLmxldmVsZGIpXG4gICAgdGhpcy5zdWJNZXRhcy5mb3JFYWNoKHMgPT4gdGhpcy5yZWdpc3RlclN1YkxldmVsKHMpKVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlclN1YkxldmVsKCBtZXRhOiBTdWJMZXZlbE1ldGEgKSB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbGRiLnN1YmxldmVsKG1ldGEuc3ViTmFtZSlcbiAgICBjb25zdCBpbmRleGVkU3ViID0gbmV3IEluZGV4ZWRTdWJMZXZlbChzdWIsIG1ldGEuc3ViTmFtZSwgbWV0YS5rZXlGaWVsZCwgLi4ubWV0YS5pbmRleEZpZWxkcykgICAgXG4gICAgdGhpcy5zdWJMZXZlbHMuc2V0KCBtZXRhLnN1Yk5hbWUsIGluZGV4ZWRTdWIpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzS2V5Tm90Rm91bmRFcnJvciggZXJyOiBFcnJvciApIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVyciAmJiBlcnIubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHVibGljIGdldCBsZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiXG4gIH1cblxuICBwdWJsaWMgZ2V0U3ViTGV2ZWwoIHN1Yk5hbWU6IHN0cmluZyApIDogSW5kZXhlZExldmVsIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVscy5nZXQoc3ViTmFtZSlcbiAgICBpZiAoICFzdWIgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc3ViTGV2ZWwgbmFtZSA9ICcke3N1Yk5hbWV9J2ApXG5cbiAgICByZXR1cm4gc3ViXG4gIH1cblxuICBwdWJsaWMgb3BlbihvcGVuQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55Pik6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKG9wZW5DYWxsYmFjaylcblxuICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuICAgIFxuICAgIChhc3luYygpPT4geyBcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpICAgICAgXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyLCBzZWxmKVxuICAgICAgfVxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2xvc2VDYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KSA6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cblxuICBwdWJsaWMgZHVtcCgpIDogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXMsIHJlaikgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KCkgICAgICBcbiAgICAgIHRoaXMubGV2ZWxkYi5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICAgICAgLm9uKCdkYXRhJywgZGF0YSA9PiByZXN1bHQucHVzaChga2V5PSAke2RhdGEua2V5fSwgdmFsdWU9ICR7ZGF0YS52YWx1ZX1gKSApXG4gICAgICAgIC5vbignZXJyb3InLCBlID0+IHJlaihlKSApXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzKHJlc3VsdC5qb2luKCdcXHJcXG4nKSkgKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgc3ViTGV2ZWxEYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5zdWJMZXZlbERiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzZW5vbmRhcnkgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHNlbm9uZGFyeSApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHByaXZhdGUga2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkPFQ+KCBjYWxsYmFjaz86IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PiApIDogTWF5YmVVbmRlZmluZWQ8Q2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+PiB7XG4gICAgcmV0dXJuICFjYWxsYmFjayA/IHVuZGVmaW5lZCA6ICggZXJyIDogRXJyb3IsIGRhdGE6IFQgKSA9PiB7XG4gICAgICBjYWxsYmFjayggIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKCBlcnIgKSA/IG51bGwgOiBlcnIgLCBkYXRhIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zOiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4gKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5zdWJMZXZlbERiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGdldENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCB0aGlzLmtleU5vdEZvdW5kVGhlblVuZGVmaW5lZChjYWxsYmFjaykpXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoZXJyKSA/IHVuZGVmaW5lZCA6IGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleCggaW5kZXhGaWVsZCApXG5cbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZ2V0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIGluZGV4TGV2ZWwuZ2V0PFQ+KGtleSwgdGhpcy5rZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQoY2FsbGJhY2spKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKGVycikgPyB1bmRlZmluZWQgOiBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdXQ8VD4oa2V5OiBhbnksIHZhbHVlOiBULCBwdXRDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2socHV0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3ViTGV2ZWxEYi5wdXQoa2V5LCB2YWx1ZSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhkZWxDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgdGhpcy5zdWJMZXZlbERiLmRlbChrZXksIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJhdGNoKGFycmF5IDogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/IDogSnNvbk9iamVjdCwgYmF0Y2hDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApIHJldHVybiB0aGlzLnN1YkxldmVsRGIuYmF0Y2goKVxuXG4gICAgbGV0IGhhc09wdGlvbnMgPSBvcHRpb25zICYmICghaXNGdW5jdGlvbihvcHRpb25zKSlcbiAgICBsZXQgb3JnaW5hbENhbGxiYWNrID0gaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT5cbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soIG9yZ2luYWxDYWxsYmFjayApXG4gICAgdHJ5IHtcbiAgICAgIGlmIChoYXNPcHRpb25zKVxuICAgICAgICB0aGlzLnN1YkxldmVsRGIuYmF0Y2goYXJyYXksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICB0aGlzLnN1YkxldmVsRGIuYmF0Y2goYXJyYXksIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zKVxuICB9XG59XG4iLCJpbXBvcnQgeyBMZXZlbERCLCBJbmRleGVkTGV2ZWwsIFN1YkxldmVsTWV0YSB9IGZyb20gJy4vS1ZEQi9MZXZlbERCJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrSGVhZGVyIH0gZnJvbSAnLi9CbG9jaydcblxuY29uc3QgTEFTVF9CTE9DS19IRUlHSFRfS0VZID0gJ19fbGFzdF9ibG9ja19oZWlnaHRfXydcblxuZXhwb3J0IGNsYXNzIExldmVsQmxvY2sge1xuICBwcml2YXRlIGRiIDogTGV2ZWxEQlxuICBwcml2YXRlIGJsb2NrRGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBoaXN0b3J5RGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBsYXN0SGVpZ2h0IDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoIGRpciA6IHN0cmluZywgbGV2ZWxPcHRpb25zID0ge30gKSB7XG4gICAgLyogXG4gICAgICB7IGlkKDY0KSwgdGltZXN0YW1wKGJpZ2ludCksIGhlaWdodChiaWdpbnQpLCBwYXlsb2FkTGVuZ3RoKGJpZ2ludCksIHBheWxvYWRIYXNoKDY0KSwgcHJldkJsb2NrSWQoNjQpLCBcbiAgICAgICAgcG9pbnRJZCg2NCksIHBvaW50SGVpZ2h0KGJpZ2ludCksIGRlbGVnYXRlKDY0KSwgc2lnbmF0dXJlKDEyOCksIGNvdW50KGJpZ2ludCkgfVxuICAgICovXG4gICAgY29uc3QgYmxvY2tNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnYmxrJywgJ2hlaWdodCcsIFtcbiAgICAgIHsgZmllbGROYW1lOiAnaWQnIH0sIFxuICAgICAgeyBmaWVsZE5hbWU6ICdkZWxlZ2F0ZScgfVxuICAgIF0pXG4gICAgY29uc3QgY2hhbmdlc0xvZ01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdoaXMnLCAnaGVpZ2h0JywgW10pXG4gICAgXG4gICAgdGhpcy5kYiA9IG5ldyBMZXZlbERCKCBkaXIsIFtibG9ja01ldGEsIGNoYW5nZXNMb2dNZXRhXSwgbGV2ZWxPcHRpb25zIClcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSAtMVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgbGFzdEJsb2NrSGVpZ2h0SXRlbSA9IGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwge30pIFxuICAgIGlmICggbGFzdEJsb2NrSGVpZ2h0SXRlbSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbGFzdEJsb2NrSGVpZ2h0SXRlbSA9IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oIC0xIClcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5wdXQoTEFTVF9CTE9DS19IRUlHSFRfS0VZLCBsYXN0QmxvY2tIZWlnaHRJdGVtKVxuICAgIH1cbiAgICByZXR1cm4gbGFzdEJsb2NrSGVpZ2h0SXRlbS5oZWlnaHQgIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIG9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5vcGVuKClcbiAgICB0aGlzLmJsb2NrRGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdibGsnKVxuICAgIHRoaXMuaGlzdG9yeURiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnaGlzJylcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSBhd2FpdCB0aGlzLmdldExhc3RCbG9ja0hlaWdodEZyb21EYigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5jbG9zZSgpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGxhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHsgXG4gICAgcmV0dXJuIHRoaXMubGFzdEhlaWdodCBcbiAgfVxuXG4gIHByaXZhdGUgaXNLZXlOb3RGb3VuZEVycm9yKGUpIDogYm9vbGVhbiB7IFxuICAgIHJldHVybiBlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFzdEhlaWdodEpzb24oIGxhc3RIZWlnaHQ6IG51bWJlciApIDogQmxvY2tIZWFkZXIge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQgOiBsYXN0SGVpZ2h0LFxuICAgICAgaWQgOiAnTlVMTCcsXG4gICAgICBkZWxlZ2F0ZSA6ICdOVUxMJ1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhcHBlbmRCbG9jayggYmxvY2sgOiBCbG9ja0hlYWRlciwgY2hhbmdlczogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+ICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghYmxvY2sgfHwgIWJsb2NrLmlkIHx8ICFibG9jay5kZWxlZ2F0ZSB8fCBibG9jay5oZWlnaHQgPT09IHVuZGVmaW5lZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBibG9jayBkYXRhYClcblxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLnB1dChibG9jay5oZWlnaHQsIGNoYW5nZXMpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IGJsb2NrLmhlaWdodCwgdmFsdWU6IGJsb2NrIH0sXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHZhbHVlOiB0aGlzLmdldExhc3RIZWlnaHRKc29uKGJsb2NrLmhlaWdodCkgfVxuICAgXSlcblxuICAgIHRoaXMubGFzdEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oIGhlaWdodCAtIDEgKSB9IFxuICAgIF0pXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIuZGVsKCBoZWlnaHQgKVxuICAgIFxuICAgIHRoaXMubGFzdEhlaWdodCAtLVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZyApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldEJ5PEJsb2NrSGVhZGVyPignaWQnLCBibG9ja0lkKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKVxuICAgIGZvciggbGV0IGggPSBtaW5IZWlnaHQgOyBoIDw9IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9jayhoKVxuICAgICAgYmxvY2sgJiYgcmVzdWx0LnB1c2goIGJsb2NrISApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXQgID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBibG9ja0lkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2tCeUlkKCBibG9ja0lkc1tpXSApXG4gICAgICBibG9jayAmJiByZXQucHVzaCggYmxvY2sgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG4gIH1cbn0iLCJleHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIEFsbCAgICA9IDEyOCAtIDEsXG4gIFRyYWNlICA9IDY0LFxuICBEZWJ1ZyAgPSAzMixcbiAgTG9nICAgID0gMTYsXG4gIEluZm8gICA9IDgsXG4gIFdhcm4gICA9IDQsXG4gIEVycm9yICA9IDIsXG4gIEZhdGFsICA9IDEsXG4gIE5vbmUgICA9IDBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2dMZXZlbCA6IExvZ0xldmVsXG4gIHJlYWRvbmx5IGluZm9FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgdHJhY2VFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSBsb2dFbmFibGVkICAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGRlYnVnRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgd2FybkVuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBlcnJvckVuYWxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGZhdGFsRW5hYmxlZCA6IGJvb2xlYW5cblxuICB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgd2FybiggbXNnOiBzdHJpbmcgLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG4gIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG59XG5cbmNsYXNzIExvZ2dlckFkYXB0ZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBwcml2YXRlIGxldmVsIDogTG9nTGV2ZWxcbiAgcHJpdmF0ZSBuYW1lIDogc3RyaW5nXG4gIHByaXZhdGUgZm9ybWF0IDogYm9vbGVhblxuICBwcml2YXRlIGdldExvZ2dlciA6ICgpID0+IExvZ2dlclxuXG4gIHB1YmxpYyBnZXQgaW5mb0VuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5JbmZvKSAgPiAwIH1cbiAgcHVibGljIGdldCB0cmFjZUVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLlRyYWNlKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGRlYnVnRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRGVidWcpID4gMCB9XG4gIHB1YmxpYyBnZXQgbG9nRW5hYmxlZCgpICAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5Mb2cpICAgPiAwIH1cbiAgcHVibGljIGdldCB3YXJuRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLldhcm4pICA+IDAgfVxuICBwdWJsaWMgZ2V0IGVycm9yRW5hbGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRXJyb3IpID4gMCB9XG4gIHB1YmxpYyBnZXQgZmF0YWxFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5GYXRhbCkgPiAwIH1cblxuICBwdWJsaWMgZ2V0IGxvZ0xldmVsKCkgeyByZXR1cm4gdGhpcy5sZXZlbCB9XG4gIHB1YmxpYyBzZXQgbG9nTGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHsgdGhpcy5sZXZlbCA9IGxldmVsIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoZ2V0TG9nZ2VyOiAoKSA9PiBMb2dnZXIsIGZvcm1hdE1lc3NhZ2UgPSBmYWxzZSwgbG9nZ2VyTmFtZTogc3RyaW5nLCBsZXZlbCA9IExvZ0xldmVsLkFsbCApIHtcbiAgICB0aGlzLm5hbWUgPSBsb2dnZXJOYW1lXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gICAgdGhpcy5nZXRMb2dnZXIgPSBnZXRMb2dnZXJcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdE1lc3NhZ2VcbiAgfVxuXG4gIHByb3RlY3RlZCBmcm9tYXRNZXNzYWdlKCBtc2c6IHN0cmluZywgbG9nVHlwZTogc3RyaW5nICkgOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSBbJHtsb2dUeXBlfV0gWyR7dGhpcy5uYW1lfV0gJHttc2d9YFxuICB9XG5cbiAgcHVibGljIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnSU5GTycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuaW5mbyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0RFQlVHJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdMT0cnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnVFJBQ0UnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgd2FybiggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdXQVJOJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS53YXJuKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdFUlJPUicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG5cbiAgcHVibGljIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRkFUQUwnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTG9nTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dMZXZlbCA9IExvZ0xldmVsLkFsbFxuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVMb2dnZXIgPSAoKSA9PiAgY29uc29sZSBhcyBPYmplY3QgYXMgTG9nZ2VyIFxuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nZ2VyID0gbmV3IExvZ2dlckFkYXB0ZXIoIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCAnZGVmYXVsdCcsIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsIClcblxuICBwdWJsaWMgc3RhdGljIHNldCBkZWZhdWx0TGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHtcbiAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCA9IGxldmVsXG4gIH1cbiAgXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGxvZ0ZhY3RvcnkgKCB2YWx1ZTogKCkgPT4gTG9nZ2VyICkge1xuICAgIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyID0gdmFsdWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TG9nZ2VyKGxvZ2dlck5hbWU/OiBzdHJpbmcsIGxldmVsPyA6IExvZ0xldmVsKSA6IExvZ2dlciB7XG4gICAgcmV0dXJuIGxvZ2dlck5hbWUgPyBcbiAgICAgIG5ldyBMb2dnZXJBZGFwdGVyKExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCBsb2dnZXJOYW1lLCBsZXZlbCB8fCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCkgOiBcbiAgICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ2dlcjtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBLZXlPYmplY3QsIENvZGVDb250cmFjdCBhcyBEQkMsIHBhcnRpYWwsIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0geyBuZXcoKSA6IFQgfVxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ID0gc3RyaW5nIHwgQ29uc3RydWN0b3I8VEVudGl0eT5cblxuZXhwb3J0IGVudW0gRmllbGRUeXBlcyB7XG4gIFN0cmluZyAgID0gJ1N0cmluZycsXG4gIE51bWJlciAgID0gJ051bWJlcicsXG4gIEJpZ0ludCAgID0gJ0JpZ0ludCcsXG4gIFRleHQgICAgID0gJ1RleHQnXG59XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IHN0cmluZyB8IEZpZWxkVHlwZXNcblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZCB7XG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogRmllbGRUeXBlLFxuICBsZW5ndGg/OiBudW1iZXIgLFxuICBpbmRleD86IGJvb2xlYW4sXG4gIG5vdF9udWxsPzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgY29tcG9zaXRlX2tleT8gOiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUga2V5T2JqZWN0IDogSnNvbk9iamVjdFxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcigga2V5T2JqZWN0IDogSnNvbk9iamVjdCApIHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlPYmplY3QnLCAoKSA9PiBEQkMubm90TnVsbChrZXlPYmplY3QpKVxuXG4gICAgdGhpcy5rZXlPYmplY3QgPSBrZXlPYmplY3RcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbWFrZTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogVEVudGl0eSApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCAoKSA9PiBEQkMubm90TnVsbChzY2hlbWEpKVxuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsIHNjaGVtYS5pc0NvbXBzaXRlS2V5LCAnbW9kZWwgbXVzdCBpbmRlbnRpZnkgYnkgY29tcG9zaXRlIGtleScpXG4gICAgREJDLmFyZ3VtZW50KCAnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KCBwYXJ0aWFsKGVudGl0eSwgc2NoZW1hLmNvbXBvc2l0ZUtleXMpIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZygga2V5SnNvblN0cmluZzogc3RyaW5nICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleUpzb25TdHJpbmcnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShrZXlKc29uU3RyaW5nKSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KEpTT04ucGFyc2UoIGtleUpzb25TdHJpbmcgKS5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleUpzb24oKSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmtleU9iamVjdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBvc2l0ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCEga2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBrZXkua2V5SnNvblxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgcEtleTogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPlxuICBwcml2YXRlIGNLZXlzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMuYXR0YWNoVmVyc2lvbkZpZWxkKCB0aGlzLnNjaGVtYSApXG4gICAgdGhpcy5wYXJzZUZpZWxkcygpXG4gIH1cblxuICBwcml2YXRlIGF0dGFjaFZlcnNpb25GaWVsZCggc2NoZW1hIDogU2NoZW1hICkge1xuICAgIGlmICggc2NoZW1hLnRhYmxlRmllbGRzLmZpbmQoIGYgPT4gZi5uYW1lID09PSAnX3ZlcnNpb25fJykgKSByZXR1cm5cbiAgICBzY2hlbWEudGFibGVGaWVsZHMucHVzaCh7XG4gICAgICBuYW1lOiAnX3ZlcnNpb25fJyxcbiAgICAgIHR5cGU6IEZpZWxkVHlwZXMuTnVtYmVyLFxuICAgICAgZGVmYXVsdDogMCAgICAgXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFR5cGUoIHR5cGUgOiBGaWVsZFR5cGUgKSA6IHN0cmluZyB7IFxuICAgIHJldHVybiB0eXBlXG4gIH1cbiAgXG4gIHByaXZhdGUgcGFyc2VGaWVsZHMoKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBwcmltYXJ5S2V5cyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlcihmID0+IGYucHJpbWFyeV9rZXkgPT09IHRydWUgKSAubWFwKCBmPT4gZi5uYW1lIClcbiAgICB0aGlzLmNLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5jb21wb3NpdGVfa2V5ID09PSB0cnVlICkubWFwKCBmPT4gZi5uYW1lIClcblxuICAgIHRoaXMucEtleSA9IHByaW1hcnlLZXlzLmxlbmd0aCA9PT0gMSA/IHByaW1hcnlLZXlzWzBdIDogdW5kZWZpbmVkXG5cbiAgICBsZXQga2V5VmFsaWQgPSAoIHRoaXMucEtleSAhPT0gdW5kZWZpbmVkICkgIT09ICggdGhpcy5jS2V5cy5sZW5ndGggPiAxICkgXG4gICAgaWYgKCAha2V5VmFsaWQgKSB0aHJvdyBuZXcgRXJyb3IoYG1vZGVsIG11c3QgaGF2ZSBwcmltYXJ5IGtleSBvciBjb21wb3NpdGUga2V5cywgYnV0IGNhbiBub3QgYm90aGApXG5cbiAgICB0aGlzLmFsbEZpZWxkVHlwZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpXG4gICAgdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZm9yRWFjaCggZiA9PiB0aGlzLmFsbEZpZWxkVHlwZXMuc2V0KCBmLm5hbWUsIHRoaXMuY29udmVydFR5cGUoZi50eXBlKSkgKVxuICAgIHRoaXMuYWxsRmllbGRzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMubWFwKCBmID0+IGYubmFtZSlcbiAgICB0aGlzLmFsbEluZGV4ZXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5pbmRleCA9PT0gdHJ1ZSApLm1hcCggZiA9PiBmLm5hbWUgKVxuICB9XG5cbiAgcHVibGljIGdldEZpZWxkVHlwZXMoc2NoZW1hOiBTY2hlbWEpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZFR5cGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjaGVtYU9iamVjdCgpIDogU2NoZW1hIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb21wc2l0ZUtleSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9zaXRlS2V5cy5sZW5ndGggPiAxIFxuICB9XG5cbiAgcHVibGljIGdldCBwcmltYXJ5S2V5KCkgOiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5wS2V5XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbXBvc2l0ZUtleXMoKSA6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5jS2V5c1xuICB9XG5cbiAgcHVibGljIGdldCBmaWVsZE5hbWVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZHNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsSW5kZXhlc1xuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbE5hbWUoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubmFtZVxuICB9XG5cbiAgcHVibGljIGdldCBpc0xvY2FsKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhbFxuICB9XG5cbiAgcHVibGljIGdldCBpc1JlYWRvbmx5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkb25seVxuICB9XG5cbiAgcHVibGljIGdldCBtZW1DYWNoZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1lbW9yeVxuICB9XG5cbiAgcHVibGljIHNldEtleTxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBrZXk6IEVudGl0eUtleSApIDogVEVudGl0eSB7XG4gICAgaWYgKCAhdGhpcy5pc0NvbXBzaXRlS2V5ICkge1xuICAgICAgZW50aXR5W3RoaXMucHJpbWFyeUtleSFdID0ga2V5XG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGNrID0ga2V5IGFzIENvbXBvc2l0ZUtleVxuICAgICAgdGhpcy5jS2V5cy5mb3JFYWNoKCBmID0+IGVudGl0eVtmXSA9IGNrLmtleUpzb25bZl0gKVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgZ2V0S2V5PFRFbnRpdHk+KGVudGl0eSA6IFRFbnRpdHkpIDogRW50aXR5S2V5IHtcbiAgICByZXR1cm4gdGhpcy5pc0NvbXBzaXRlS2V5ID8gXG4gICAgICBDb21wb3NpdGVLZXkubWFrZSggdGhpcywgZW50aXR5ICkgOlxuICAgICAgZW50aXR5W3RoaXMucHJpbWFyeUtleSFdXG4gIH1cblxuICBwdWJsaWMgbmV3RW50aXR5PFRFbnRpdHk+ICggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5IDogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBsZXQgZW50aXR5ID0gaXNTdHJpbmcobW9kZWwpID8gXG4gICAgICB7IH0gYXMgVEVudGl0eSA6IFxuICAgICAgbmV3ICggbW9kZWwgYXMgQ29uc3RydWN0b3I8VEVudGl0eT4gKSgpXG5cbiAgICB0aGlzLnNldERlZmF1bHRWYWx1ZXMoIGVudGl0eSApXG4gICAgcmV0dXJuIHRoaXMuc2V0S2V5KCBlbnRpdHksIGtleSApXG4gIH1cblxuICBwcm90ZWN0ZWQgc2V0RGVmYXVsdFZhbHVlczxURW50aXR5PiggZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGYuZGVmYXVsdCAhPT0gdW5kZWZpbmVkICYmICggZW50aXR5W2YubmFtZV0gPSBmLmRlZmF1bHQgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgY29weVByb3BlcnRpZXM8VEVudGl0eT4oIGRlc3Q6IFRFbnRpdHksIHNyYyA6IFRFbnRpdHksIGluY2x1ZGVLZXkgPSBmYWxzZSApIHtcbiAgICB0aGlzLmFsbEZpZWxkcy5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBuZWVkQ29weSA9IChpbmNsdWRlS2V5IHx8ICggdGhpcy5jS2V5cy5pbmRleE9mKGYpIDwgMCAmJiBmICE9PSB0aGlzLnByaW1hcnlLZXkgKSkgJiYgc3JjW2ZdICE9PSB1bmRlZmluZWRcbiAgICAgIGlmICggbmVlZENvcHkgKSBkZXN0W2ZdID0gc3JjW2ZdXG4gICAgfSlcbiAgfVxufSIsImltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBFbnRpdHlLZXksIGRlZXBDb3B5IH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgaXNBcnJheSwgaXNOdW1iZXIgfSBmcm9tICd1dGlsJztcblxuY29uc3QgSnNvblNxbCA9IHJlcXVpcmUoJ2pzb24tc3FsJykoeyBzZXBhcmF0ZWRWYWx1ZXM6IGZhbHNlIH0pXG5jb25zdCBjaGFuZ2VDYXNlID0gcmVxdWlyZSgnY2hhbmdlLWNhc2UnKVxuXG5leHBvcnQgY29uc3QgTVVMVElfU1FMX1NFUEFSQVRPUiA9ICc7J1xuXG4vLyAnY3JlYXRlJ3wnc2VsZWN0J3wndXBkYXRlJ3wncmVtb3ZlJ3wnb3RoZXInXG5leHBvcnQgZW51bSBTcWxUeXBlIHtcbiAgU2NoZW1hID0gMCxcbiAgU2VsZWN0ID0gMSxcbiAgSW5zZXJ0ID0gMiAsXG4gIFVwZGF0ZSA9IDMsXG4gIERlbGV0ZSA9IDQsXG4gIE90aGVyICA9IDlcbn1cblxuZXhwb3J0IHR5cGUgU3FsUGFyYW1ldGVycyA9IEFycmF5PGFueT4gfCBKc29uT2JqZWN0XG5leHBvcnQgdHlwZSBTcWxBbmRQYXJhbWV0ZXJzID0geyBcbiAgdHlwZTogU3FsVHlwZSwgIFxuICBxdWVyeTogc3RyaW5nLCBcbiAgcGFyYW1ldGVycz8gOiBTcWxQYXJhbWV0ZXJzLFxuICBleHBlY3RFZmZlY3RlZD8gOiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIFVuYXJ5T3BlcmF0b3JzID0gJyRudWxsJ3wnJGlzJ3wnJGlzbm90J1xuZXhwb3J0IHR5cGUgQmluYXJ5T3BlcmF0b3JzID0gJyRlcSd8JyRuZSd8JyRndCd8JyRsdCd8JyRndGUnfCckbHRlJ3wnJGxpa2UnfCckZmllbGQnfCckaW4nfCckbmluJ3wnJGJldHdlZW4nXG5leHBvcnQgdHlwZSBSZWxhdGlvbk9wZXJhdG9ycyA9ICckbm90J3wnJGFuZCd8JyRvcidcblxuZXhwb3J0IHR5cGUgU2VsZWN0RXhwcmVzc2lvbiA9IHtcbiAgc2VsZWN0IDoge1xuICAgIHRhYmxlIDogc3RyaW5nLFxuICAgIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LFxuICAgIHdoZXJlPyA6IHN0cmluZyxcbiAgICBba2V5IDogc3RyaW5nXSA6IGFueVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIFZhbHVlRXhwcmVzc2lvbiA9IHN0cmluZyB8IG51bWJlclxuZXhwb3J0IHR5cGUgRmllbGRWYWx1ZUV4cHJlc3Npb24gPSB7IFtmaWVsZCA6IHN0cmluZ10gOiBzdHJpbmcgfCBudW1iZXIgfVxuZXhwb3J0IHR5cGUgRmllbGRBcnJheVZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IEFycmF5PHN0cmluZyB8IG51bWJlcj4gfVxuZXhwb3J0IHR5cGUgTnVsbENvbXBhcmVFeHByZXNzaW9uID0geyAkbnVsbCA6IHN0cmluZyB9IHwgeyBbb3BlciBpbiAnJGlzJ3wnaXNub3QnXT8gOiB7IFtmaWVsZCA6IHN0cmluZ10gOiBudWxsfSB9XG5cbmV4cG9ydCB0eXBlIFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gPSBGaWVsZFZhbHVlRXhwcmVzc2lvbiB8IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHsgW29wZXIgaW4gJyRlcSd8JyRuZSd8JyRndCd8JyRsdCd8JyRndGUnfCckbHRlJ10/IDogVmFsdWVFeHByZXNzaW9uIHwgU2VsZWN0RXhwcmVzc2lvbiB9IH1cbmV4cG9ydCB0eXBlIEFycmF5Q29tcGFyZUV4cHJlc3Npb24gPSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uIHwgeyAgW2ZpZWxkIDogc3RyaW5nXSA6IHsgW29wZXIgaW4gJyRiZXR3ZWVuJ3wnJGluJ3wnJG5pbiddPyA6IEFycmF5PFZhbHVlRXhwcmVzc2lvbj4gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgTGlrZUV4cHJlc3Npb24gPSB7IFtrZXkgOiBzdHJpbmddOiB7ICRsaWtlIDogc3RyaW5nIH0gfSBcblxuZXhwb3J0IHR5cGUgQ29tcGFyZUV4cHJlc3Npb24gPSBWYWx1ZUNvbXBhcmVFeHByZXNzaW9uIHwgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiB8IExpa2VFeHByZXNzaW9uIHwgTnVsbENvbXBhcmVFeHByZXNzaW9uXG5leHBvcnQgdHlwZSBSZWxhdGlvbkV4cHJlc3Npb24gPSBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCAvLyBUaGUgJGFuZCBpcyBvbWl0dGVkIFxuICB7ICRub3QgOiBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvbiB9IHwgXG4gIHsgW29wZXIgaW4gJyRhbmQnfCAnJG9yJ10/IDogQXJyYXk8Q29tcGFyZUV4cHJlc3Npb24+IHwgQXJyYXk8UmVsYXRpb25FeHByZXNzaW9uPiB9XG4gXG5leHBvcnQgdHlwZSBTcWxDb25kaXRpb24gPSBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvblxuXG5leHBvcnQgdHlwZSBMaW1pdEFuZE9mZnNldCA9IHtcbiAgbGltaXQ/IDogbnVtYmVyLFxuICBvZmZzZXQ/IDogbnVtYmVyXG59XG5leHBvcnQgdHlwZSBTcWxSZXN1bHRSYW5nZSA9IG51bWJlciB8IExpbWl0QW5kT2Zmc2V0XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVySXRlbSA9IHtcbiAgW2ZpZWxkIDogc3RyaW5nXSA6ICdBU0MnIHwgJ0RFU0MnIHwgMSB8IC0xIFxufVxuXG5leHBvcnQgdHlwZSBTcWxPcmRlciA9IFNxbE9yZGVySXRlbSB8IEFycmF5PFNxbE9yZGVySXRlbT5cblxuZXhwb3J0IGludGVyZmFjZSBTcWxCdWlsZGVyIHtcbiAgYnVpbGRTY2hlbWEoIHNjaGVtYTogTW9kZWxTY2hlbWEgKSA6IEFycmF5PHN0cmluZz5cbiAgYnVpbGRJbnNlcnQoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZERlbGV0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRVcGRhdGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcikgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkU2VsZWN0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkU2VsZWN0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZHM6IEFycmF5PHN0cmluZz4sIHdoZXJlIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG59XG5cbmV4cG9ydCBjbGFzcyBKc29uU3FsQnVpbGRlciBpbXBsZW1lbnRzIFNxbEJ1aWxkZXIge1xuXG4gIHByaXZhdGUgZ2V0VGFibGVOYW1lKG1vZGVsTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGNoYW5nZUNhc2Uuc25ha2VDYXNlKG1vZGVsTmFtZSkgKyAncydcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UHJpbWFyeUtleUNvbmRpdGlvbiggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5ICgge30sICBrZXkgKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkU2NoZW1hIChzY2hlbWE6IE1vZGVsU2NoZW1hKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gVE9ETzogZ2VuZXJhdGUgY29tcG9zaXRlIGtleSBzcWxcbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fsc1xuICB9XG5cbiAgcHVibGljIGJ1aWxkSW5zZXJ0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCk6IFNxbEFuZFBhcmFtZXRlcnMge1xuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5JbnNlcnQgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKCBzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAnaW5zZXJ0JyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIHZhbHVlczogZmllbGRWYWx1ZXNcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZERlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IFNxbEFuZFBhcmFtZXRlcnMge1xuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5EZWxldGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdyZW1vdmUnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgY29uZGl0aW9uOiB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRVcGRhdGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKTogU3FsQW5kUGFyYW1ldGVycyB7ICAgIFxuICAgIC8vIGNvbnN0IG1vZGlmaWVyID0gdGhpcy5lc2NhcGVTaW5nbGVRdW90ZShmaWVsZFZhbHVlcylcbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuXG4gICAgbGV0IGNvbmRpdGlvbiA9IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICBjb25kaXRpb25bJ192ZXJzaW9uXyddID0gdmVyc2lvbiAgXG5cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuVXBkYXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAndXBkYXRlJyxcbiAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICBtb2RpZmllcjogZmllbGRWYWx1ZXMsXG4gICAgICBjb25kaXRpb246IGNvbmRpdGlvblxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkc09yUGFyYW1zOiBBcnJheTxzdHJpbmc+IHwgSnNvbk9iamVjdCwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBcbiAgICByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgam9pbj8gOiBKc29uT2JqZWN0ICk6IFNxbEFuZFBhcmFtZXRlcnMge1xuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBcbiAgICBsZXQgcXVlcnlPcHRpb25zIDogSnNvbk9iamVjdFxuICAgIGlmICggIWlzQXJyYXkoIGZpZWxkc09yUGFyYW1zICkgKSB7XG4gICAgICBsZXQgcGFyYW1zID0gZmllbGRzT3JQYXJhbXMgYXMgSnNvbk9iamVjdFxuICAgICAgcXVlcnlPcHRpb25zID0gT2JqZWN0LmFzc2lnbiggeyB0eXBlOiAnc2VsZWN0JywgdGFibGU6IHRhYmxlTmFtZSB9LCBwYXJhbXMgKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxldCBmaWVsZHMgPSBmaWVsZHNPclBhcmFtcyB8fCBzY2hlbWEuZmllbGROYW1lcy5tYXAoIGYgPT4gc2NoZW1hLnNjaGVtYU9iamVjdC50YWJsZSArICcuJyArIGYgKVxuICAgICAgbGV0IGxvIDogTGltaXRBbmRPZmZzZXQgPSBpc051bWJlciggcmVzdWx0UmFuZ2UgKSA/ICB7IGxpbWl0IDogcmVzdWx0UmFuZ2UgfSA6IHJlc3VsdFJhbmdlIHx8IHsgfVxuICAgICAgbGV0IG9yZGVyID0gc29ydCB8fCB7fVxuICAgICAgZm9yICggbGV0IGtleSBvZiBSZWZsZWN0Lm93bktleXMob3JkZXIpICApIHtcbiAgICAgICAgbGV0IG9yZGVyVmFsdWUgPSBvcmRlcltrZXldIHx8IC0xXG4gICAgICAgIG9yZGVyW2tleV0gPSAob3JkZXJWYWx1ZSA9PT0gJ0FTQycpID8gMSA6ICggKG9yZGVyVmFsdWUgPT09ICdERVNDJykgPyAtMSA6IG9yZGVyVmFsdWUgKVxuICAgICAgfVxuXG4gICAgICBxdWVyeU9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBmaWVsZHM6IGZpZWxkcyxcbiAgICAgICAgY29uZGl0aW9uOiB3aGVyZSxcbiAgICAgICAgbGltaXQ6IGxvLmxpbWl0LFxuICAgICAgICBvZmZzZXQ6IGxvLm9mZnNldCxcbiAgICAgICAgc29ydDogb3JkZXIsXG4gICAgICAgIGpvaW46IGpvaW5cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlNlbGVjdCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQocXVlcnlPcHRpb25zKSlcbiAgfVxufSIsImltcG9ydCB7IFNxbGl0ZVdyYXBwZXIgfSBmcm9tICcuL1NxbGl0ZVdyYXBwZXInXG5pbXBvcnQgeyBNVUxUSV9TUUxfU0VQQVJBVE9SLCBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uLCBDb25uZWN0aW9uT3B0aW9ucywgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuXG5cbmNsYXNzIFNxbGl0ZVRyYW5zYWN0aW9uIGltcGxlbWVudHMgREJUcmFuc2FjdGlvbiB7XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbikge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb21taXQoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdDT01NSVQ7JylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByb2xsYmFjaygpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ1JPTExCQUNLOycpIFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVDb25uZWN0aW9uIGltcGxlbWVudHMgRGJDb25uZWN0aW9uIHtcbiAgcHJpdmF0ZSBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnNcbiAgcHJpdmF0ZSBzcWxpdGUgOiBTcWxpdGVXcmFwcGVyXG5cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9ucyApIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5zcWxpdGUgPSBuZXcgU3FsaXRlV3JhcHBlcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbm5lY3Rpb25PcHRpb25zKCk6IENvbm5lY3Rpb25PcHRpb25zIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuYXN5bk9wZW4oIHRoaXMub3B0aW9ucy5zdG9yYWdlIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkaXNjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5RdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgcXVlcnlTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUucXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdDogU3FsRXhlY3V0ZVJlc3VsdCApIHtcbiAgICBpZiAoIHJlc3VsdC5yb3dzRWZmZWN0ZWQgPT09IDApICB0aHJvdyBuZXcgRXJyb3IoJ05vbmUgcm93IGVmZmVjdGVkJylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2hTeW5jKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuZXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdICwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgfHwgW10sIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkICkgXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogU3FsRXhlY3V0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIHBhcmFtZXRlcnMpXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5FeGVjdXRlKCBzcWwsIHBhcmFtZXRlcnMgKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1blNjcmlwdChzcWw6IHN0cmluZykgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBzcWwuc3BsaXQoIE1VTFRJX1NRTF9TRVBBUkFUT1IgKS5mb3JFYWNoKFxuICAgICAgYXN5bmMgc3FsPT4gYXdhaXQgKHNxbC50cmltKCkgIT09ICcnKSAmJiB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgW10pXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnMoKTogUHJvbWlzZTxEQlRyYW5zYWN0aW9uPiB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlKCdCRUdJTiBUUkFOU0FDVElPTjsnKVxuICAgIHJldHVybiBuZXcgU3FsaXRlVHJhbnNhY3Rpb24odGhpcylcbiAgfVxufSIsImltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ01hbmFnZXIsIExvZ2dlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IFNxbFBhcmFtZXRlcnMsIFNxbEFuZFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5cbmltcG9ydCAqIGFzIERhdGFiYXNlIGZyb20gJ2JldHRlci1zcWxpdGUzJ1xuXG5leHBvcnQgY2xhc3MgU3FsaXRlV3JhcHBlciB7XG4gIHByaXZhdGUgZGIgOiBEYXRhYmFzZVxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNxbGl0ZVdyYXBwZXIubmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKGRiRmlsZVBhdGg6IHN0cmluZywgY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5kYiA9IG5ldyBEYXRhYmFzZShkYkZpbGVQYXRoKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgIClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0ICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5DbG9zZSgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmNsb3NlKS5jYWxsKHRoaXMpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8U3FsRXhlY3V0ZVJlc3VsdD4pOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB7IGxhc3RJbnNlcnRSb3dJZDogJzAnLCByb3dzRWZmZWN0ZWQ6IDAgfSB9XG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGNvbnN0IHNxbFJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLnJ1bihwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgcmV0LnJlc3VsdCA9IHsgXG4gICAgICAgIGxhc3RJbnNlcnRSb3dJZCA6IHNxbFJlc3VsdC5sYXN0SW5zZXJ0Uk9XSUQudG9TdHJpbmcoKSxcbiAgICAgICAgcm93c0VmZmVjdGVkOiBzcWxSZXN1bHQuY2hhbmdlcyBcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIHF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8YW55Pj4gKSA6IEFycmF5PGFueT4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxhbnk+KCkgfVxuICAgIHRyeSB7XG4gICAgICByZXQucmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkuYWxsKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIHJlc3VsdCBjb3VudCA9ICR7cmV0LnJlc3VsdC5sZW5ndGh9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCwgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4gICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+KCkgfSBcbiAgICBsZXQgc3FsIDogU3FsQW5kUGFyYW1ldGVycyB8IHVuZGVmaW5lZFxuICAgIHRyeSB7XG4gICAgICBzcWxzLmZvckVhY2goIHMgPT4ge1xuICAgICAgICBzcWwgPSBzXG4gICAgICAgIGxldCBleGVjUmV0ID0gdGhpcy5leGVjdXRlKCBzLnF1ZXJ5LCBzLnBhcmFtZXRlcnMgKVxuICAgICAgICBvbkV4ZWN1dGVkICYmIG9uRXhlY3V0ZWQoIGV4ZWNSZXQsIHMgKSAgXG4gICAgICAgIHJldC5yZXN1bHQucHVzaCggZXhlY1JldCApXG4gICAgICB9KVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGV4ZWN1dGVCYXRjaCwgc3FsID0gJHtzcWwhLnF1ZXJ5fSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkoc3FsIS5wYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayggcmV0LmVyciwgcmV0LnJlc3VsdCApXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luRXhlY3V0ZShzcWwsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGUpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5RdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLnF1ZXJ5KS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luY0V4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlQmF0Y2gpLmNhbGwoIHRoaXMsIHNxbHMsIG9uRXhlY3V0ZWQgKVxuICB9XG5cbn0iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuaW1wb3J0IHsgRW50aXR5S2V5LCBDb2RlQ29udHJhY3QgYXMgREJDLCBNYXliZVVuZGVmaW5lZCwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMZXZlbEJsb2NrIH0gZnJvbSAnLi9MZXZlbEJsb2NrJ1xuaW1wb3J0IHsgRGJTZXNzaW9uIH0gZnJvbSAnLi9EYlNlc3Npb24nXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBFbnRpdHksIEZpbHRlckZ1bmN0aW9uIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBTcWxpdGVDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9TcWxpdGVDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IsIGlzQ29tcG9zaXRlS2V5IH0gZnJvbSAnLi9Nb2RlbCc7XG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgRW50aXR5UHJveHkgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEJsb2NrSGVhZGVyLCBCbG9jaywgVHJhbnNhY3Rpb24gfSBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0IHsgQmxvY2tDYWNoZSB9IGZyb20gJy4vQmxvY2tDYWNoZSdcblxudHlwZSBOYW1lZEhvb2s8VEZ1bmM+ID0geyBuYW1lOiBzdHJpbmcsIGhvb2sgOiBURnVuYyB9XG5leHBvcnQgdHlwZSBDb21taXRCbG9ja0hvb2sgPSAoIGJsb2NrIDogQmxvY2sgKSA9PiB2b2lkXG5leHBvcnQgdHlwZSBSb2xsYmFja0Jsb2NrSG9vayA9ICggZnJvbUhlaWdodCA6IG51bWJlciwgdG9IZWlnaHQgOiBudW1iZXIgKSA9PiB2b2lkXG5cbmV4cG9ydCB0eXBlIFNtYXJ0REJPcHRpb25zID0ge1xuICAvKipcbiAgICogY2FjaGVkIGhpc3RvcnkgY291bnQoYmxvY2sgY291bnQpLCB1c2VkIHRvIHJvbGxiYWNrIGJsb2NrXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBoaXN0b3J5Rm9yUm9sbGJhY2s/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBjbGVhbiBwZXJzaXN0ZWQgaGlzdG9yeSBhdXRvbWF0aWNhbGx5XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5PyA6IGJvb2xlYW4sXG5cbiAgLyoqXG4gICAqIGNhY2hlZCBsYXN0IGJsb2NrIGNvdW50IFxuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgY2FjaGVkQmxvY2tDb3VudD8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIG1heCBjYWNoZWQgZW50aXR5IGNvdW50LCBjb25maWcgaXQgcGVyIG1vZGVsLCBMUlUgIFxuICAgKiBzYW1wbGU6IHsgVXNlcjogMjAwLCBUcmFuczogNTAwMCB9IG1heCBjYWNoZWQgMjAwcyBVc2VyIO+8jDUwMDAgZm9yIFRyYW5zXG4gICAqIEBkZWZhdWx0IDUwMDAgZWFjaCBtb2RlbFxuICAgKi9cbiAgZW50aXR5Q2FjaGVPcHRpb25zPyA6IEVudGl0eUNhY2hlT3B0aW9uc1xuXG59XG5cbi8qKlxuICogT1JNIGxpa2UgdG8gb3BlcmF0ZSBibG9ja2NoYWluIGRhdGFcbiAqIEBldmVudCByZWFkeSBlbW1pdCBhZnRlciBpbml0aWFsaXplZFxuICogQGV2ZW50IGNsb3NlIGVtbWl0IGFmdGVyIGNsb3NlZFxuICovXG5leHBvcnQgY2xhc3MgU21hcnREQiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgb3B0aW9ucyA6IFNtYXJ0REJPcHRpb25zXG4gIHByaXZhdGUgY29tbWl0QmxvY2tIb29rczogQXJyYXk8TmFtZWRIb29rPENvbW1pdEJsb2NrSG9vaz4+XG4gIHByaXZhdGUgcm9sbGJhY2tCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Um9sbGJhY2tCbG9ja0hvb2s+PlxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MgPSBuZXcgQXJyYXk8TmFtZWRIb29rPENvbW1pdEJsb2NrSG9vaz4+KClcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Um9sbGJhY2tCbG9ja0hvb2s+PigpXG4gICAgdGhpcy5zY2hlbWFzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTbWFydERCLm5hbWUpXG4gICAgdGhpcy5ibG9ja0RCID0gbmV3IExldmVsQmxvY2sobGV2ZWxCbG9ja0RpcilcbiAgICB0aGlzLmNhY2hlZEJsb2NrcyA9IG5ldyBCbG9ja0NhY2hlKCB0aGlzLm9wdGlvbnMuY2FjaGVkQmxvY2tDb3VudCEgKVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IG5ldyBTcWxpdGVDb25uZWN0aW9uKHsgc3RvcmFnZTogZGJQYXRoIH0pXG4gICAgdGhpcy5ibG9ja1Nlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0Jsb2NrJylcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnTG9jYWwnKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRTY2hlbWE8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICwgdGhyb3dJZlVuZGVmaW5lZCA9IGZhbHNlLCB0aHJvd0lmUmVhZG9ubHkgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxNb2RlbFNjaGVtYT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IGlzU3RyaW5nKCBtb2RlbCApID8gU3RyaW5nKG1vZGVsKSA6ICggbW9kZWwgYXMgQ29uc3RydWN0b3I8VEVudGl0eT4gKS5uYW1lIFxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLnNjaGVtYXMuZ2V0KG1vZGVsTmFtZSkgXG4gICAgdGhyb3dJZlVuZGVmaW5lZCAmJiBEQkMudmVyaWZ5KCBzY2hlbWEgIT09IHVuZGVmaW5lZCwgYHVucmVnaXN0ZXJlZCBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nYClcbiAgICB0aHJvd0lmUmVhZG9ubHkgJiYgREJDLnZlcmlmeSggIXNjaGVtYSEuaXNSZWFkb25seSwgYG1vZGVsICckeyBtb2RlbE5hbWUgfScgaXMgcmVhZG9ubHlgKVxuXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXNzaW9uPFRFbnRpdHk+KCBzY2hlbWEgOiBNb2RlbFNjaGVtYSApIDogRGJTZXNzaW9uIHsgXG4gICAgcmV0dXJuIHNjaGVtYSEuaXNMb2NhbCA/IHRoaXMubG9jYWxTZXNzaW9uIDogdGhpcy5ibG9ja1Nlc3Npb25cbiAgfVxuXG4gIHByaXZhdGUgcHJlQ29tbWl0QmxvY2soIGJsb2NrOiBCbG9jayApIHtcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZm9yRWFjaCggbmggPT4gbmguaG9vayggYmxvY2sgKSApXG4gIH1cblxuICBwcml2YXRlIHBvc3RDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuZW1pdCgnbmV3QmxvY2snLCBibG9jaylcbiAgfVxuXG4gIHByaXZhdGUgcHJlUm9sbGJhY2tCbG9jayggZnJvbSA6IG51bWJlciwgdG8gOiBudW1iZXIgKSB7XG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZm9yRWFjaCggbmggPT4gbmguaG9vayggZnJvbSwgdG8gKSApXG4gIH1cblxuICBwcml2YXRlIHBvc3RSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLmVtaXQoJ3JvbGxiYWNrQmxvY2snLCB7IGZyb20sIHRvIH0gKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rLCB3aGljaCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgY29tbWl0IGJsb2NrXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKiBAcGFyYW0gaG9va0Z1bmMgaG9vayBmdW5jdGlvbiAsICggYmxvY2sgKSA9PiB2b2lkXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IENvbW1pdEJsb2NrSG9vayApIHtcbiAgICBEQkMuYXJndW1lbnQoICdob29rRnVuYycsICgpID0+IERCQy5ub3ROdWxsKGhvb2tGdW5jKSlcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgIFxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZChuaD0+bmgubmFtZSA9PT0gbmFtZS50cmltKCkpID09PSB1bmRlZmluZWQsIFxuICAgICAgYGhvb2sgbmFtZWQgJyR7bmFtZX0nIGV4aXN0IGFscmVhZHlgKVxuICAgIFxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5wdXNoKHsgbmFtZSwgaG9vayA6IGhvb2tGdW5jIH0pXG4gIH1cblxuICAvKipcbiAgICogdW5yZWdpc3RlciBjb21taXQgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyQ29tbWl0QmxvY2tIb29rKCBuYW1lOiBzdHJpbmcgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgIFxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5jb21taXRCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMuY29tbWl0QmxvY2tIb29rcy5zbGljZSggaW5kZXggKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyIHJvbGxiYWNrIGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlclJvbGxiYWNrQmxvY2tIb29rKCBuYW1lOiBzdHJpbmcsIGhvb2tGdW5jOiBSb2xsYmFja0Jsb2NrSG9vayApIHtcbiAgICBEQkMuYXJndW1lbnQoICdob29rRnVuYycsICgpID0+IERCQy5ub3ROdWxsKGhvb2tGdW5jKSlcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgIFxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG5cbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5wdXNoKHsgbmFtZSwgaG9vazogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIHJvbGxiYWNrIGJsb2NrIGhvb2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3RlclJvbGxiYWNrQmxvY2tIb29rKCBuYW1lOiBzdHJpbmcgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5maW5kSW5kZXgoIG5oID0+IG5oLm5hbWUgPT09IG5hbWUudHJpbSgpIClcbiAgICBpZiAoIGluZGV4ID49IDAgKSB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5zbGljZSggaW5kZXggKVxuICB9XG5cblxuICAvKipcbiAgICogaW5pdGlhbGl6ZSBTbWFydERCICwgeW91IG5lZWQgY2FsbCB0aGlzIGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gc2NoZW1hcyB0YWJsZSBzY2hlbWFzIGluIERhdGFiYXNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaW5pdChzY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2NoZW1hcycsICgpPT4gREJDLm5vdE51bGwoc2NoZW1hcykpXG5cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY29ubmVjdCgpICAgIFxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5vcGVuKClcblxuICAgIGZvciggY29uc3Qgc2NoZW1hIG9mIHNjaGVtYXMgKSB7XG4gICAgICB0aGlzLnNjaGVtYXMuc2V0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEgKVxuICAgICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb24oIHNjaGVtYSApXG5cbiAgICAgIHNlc3Npb24ucmVnaXN0ZXJTY2hlbWEoc2NoZW1hKVxuICAgICAgc2Vzc2lvbi5zeW5jU2NoZW1hKHNjaGVtYSlcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYHN5bmMgc2NoZW1hIG1vZGVsID0gJHtzY2hlbWEubW9kZWxOYW1lfSBgKVxuXG4gICAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSB7IFxuICAgICAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnkoIHNjaGVtYS5tb2RlbE5hbWUsIHt9LCBmYWxzZSwgdHJ1ZSApXG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYG1vZGVsICR7c2NoZW1hLm1vZGVsTmFtZX0gY2FjaGVkICR7aXRlbXMubGVuZ3RofSBlbnRpdGllcyBgKVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmVtaXQoICdyZWFkeScsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGZyZWUgcmVzb3VyY2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmNsb3NlKClcbiAgICBcbiAgICB0aGlzLmVtaXQoJ2Nsb3NlZCcsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGhlaWdodCBvZiBsYXN0IGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja0RCLmxhc3RCbG9ja0hlaWdodFxuICB9XG5cbiAgLyoqXG4gICAqIGJsb2NrcyBjb3VudFxuICAgKi9cbiAgcHVibGljIGdldCBibG9ja3NDb3VudCgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxXG4gIH1cblxuICAvKipcbiAgICogbGFzdCBjb21taXRlZCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2soKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgLy8gVE9ETzogcmV0dXJuIGxhc3QgYmxvY2sgY29weSA/XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkQmxvY2tzLmdldCggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICB9XG5cbiAgLyoqXG4gICAqIGhvbGQgYSBsb2NrIG5hbWUgd2hpY2ggb25seSBzdWNjZWVkIGluIGZpcnN0IHRpbWUgb2YgZWFjaCBibG9jay5cbiAgICogQHBhcmFtIGxvY2tOYW1lIGxvY2sgbmFtZVxuICAgKiBAcGFyYW0gbm90VGhyb3cgZG8gbm90IHRocm93IGV4Y2VwdGlvbiBpZiBsb2NrIGZhaWxlZFxuICAgKi9cbiAgcHVibGljIGxvY2tJbkN1cnJlbnRCbG9jayggbG9ja05hbWU6IHN0cmluZywgbm90VGhyb3cgPSBmYWxzZSApIDogYm9vbGVhbiB7XG4gICByZXR1cm4gdGhpcy5ibG9ja1Nlc3Npb24ubG9ja0luVGhpc1Nlc3Npb24oIGxvY2tOYW1lLCBub3RUaHJvdylcbiAgfVxuXG4gIC8qKlxuICAgKiBiZWdpbiBhIGNvbnRyYWN0IHRyYW5zYWN0aW9uIHdoaWNoIGVmZmVjdCBlbnRpdGllcyBpbiBtZW1vcnlcbiAgICovXG4gIHB1YmxpYyBiZWdpbkNvbnRyYWN0KCkgOiB2b2lkIHtcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbi5iZWdpbkVudGl0eVRyYW5zYWN0aW9uKClcbiAgfVxuXG4gIC8qKlxuICAgKiBjb21taXQgY29udHJhY3QgdHJhbnNhY3Rpb24gd2hpY2ggZWZmZWN0IGVudGl0aWVzIGluIG1lbW9yeVxuICAgKi9cbiAgcHVibGljIGNvbW1pdENvbnRyYWN0KCkgOiB2b2lkIHtcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jb21taXRFbnRpdHlUcmFuc2FjdGlvbigpXG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgY29udHJhY3QgdHJhbnNhY3Rpb24gd2hpY2ggZWZmZWN0IGVudGl0aWVzIGluIG1lbW9yeVxuICAgKi9cbiAgcHVibGljIHJvbGxiYWNrQ29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLnJvbGxiYWNrRW50aXR5VHJhbnNhY3Rpb24oKVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsIGJsb2NrLmhlaWdodCA9PT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxLCBgaW52YWxpZCBibG9jayBoZWlnaHQgJHtibG9jay5oZWlnaHR9LCBsYXN0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIFxuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGJsb2NrIGhlaWdodCA9ICR7YmxvY2suaGVpZ2h0fWApXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHR9YClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlQ29tbWl0QmxvY2soIHRoaXMuY3VycmVudEJsb2NrIClcblxuICAgIGxldCBibG9ja0hlYWRlciA9IE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShibG9ja0hlYWRlciwgJ3RyYW5zYWN0aW9ucycpXG4gICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmFwcGVuZEJsb2NrKCBibG9ja0hlYWRlciwgdGhpcy5ibG9ja1Nlc3Npb24uZ2V0Q2hhbmdlcygpIClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uc2F2ZUNoYW5nZXMoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCApXG4gICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5Rm9yUm9sbGJhY2shIClcbiAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLnB1dCggdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RDb21taXRCbG9jayggdGhpcy5sYXN0QmxvY2shIClcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7IFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGNvbW1pdEJsb2NrICggaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgZnJvbUhlaWdodCA9IHRoaXMuY3VycmVudEJsb2NrID8gdGhpcy5jdXJyZW50QmxvY2shLmhlaWdodCA6IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgdG9IZWlnaHQgPSBoZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGFzdEJsb2NrSGVpZ2h0IDogaGVpZ2h0XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlUm9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0IClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIClcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIHRvSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+IHRvSGVpZ2h0ICkge1xuICAgICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLmV2aXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0LCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdFJvbGxiYWNrQmxvY2soIGZyb21IZWlnaHQsICB0b0hlaWdodCApICAgICAgXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+PSAwLCBgc2VyaWFsIG11c3QgZ3JlYXQgb3IgZXF1YWwgemVyb2ApIFxuXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24ucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoc2VyaWFsKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBlbnRpdHkga2V5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IGVudGl0eVxuICAgKi9cbiAgcHVibGljIGdldEVudGl0eUtleTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICk6IE1heWJlVW5kZWZpbmVkPEVudGl0eUtleT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpIClcbiAgICBcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbCwgdHJ1ZSkhXG4gICAgcmV0dXJuIHNjaGVtYS5nZXRLZXkoIGVudGl0eSApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IHRyYWNraW5nIGVudGl0eSAgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IGVudGl0eVxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBvciB1bmRlZmluZWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBhdHRhY2g8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogUGFydGlhbDxURW50aXR5PiApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpIClcblxuICAgIGxldCBrZXkgPSB0aGlzLmdldEVudGl0eUtleSggbW9kZWwsICBlbnRpdHkgKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5Jywga2V5ICE9PSB1bmRlZmluZWQgLCAnY2FuIG5vdCBnZXQgZW50aXR5IGtleScgKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hKS5sb2FkKCBtb2RlbCwga2V5ISApXG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIGEgbmV3IGVudGl0eSB3aGljaCBjaGFuZ2Ugd2lsbCBiZSB0cmFja2VkIGFuZCBwZXJzaXN0ZW50ZWQgKGJ5IHNhdmVDaGFuZ2VzKSBhdXRvbWF0aWNhbGx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGVudGl0eSBrZXkgd2hpY2ggdW5pcXVlZCBpbiBkYXRhYmFzZVxuICAgKiBAcGFyYW0gZW50aXR5IHByb3RvdHlwZSBlbnRpdHkgd2hpY2ggcHJvcGVydGllcyB3aWxsIGNvcHkgdG8gcmVzdWx0IGVudGl0eVxuICAgKiBAcmV0dXJucyB0cmFja2luZyBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXlPckVudGl0eTogRW50aXR5S2V5IHwgVEVudGl0eSkgOiBURW50aXR5IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXlPckVudGl0eScsICgpPT4gREJDLm5vdE51bGwoa2V5T3JFbnRpdHkpKVxuICAgIFxuICAgIGxldCBrZXkgOiBFbnRpdHlLZXlcbiAgICBsZXQgZW50aXR5OiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgLCB0cnVlKSFcblxuICAgIGlmICggaXNQcmltaXRpdmVLZXkoIGtleU9yRW50aXR5ICkgfHwgaXNDb21wb3NpdGVLZXkoIGtleU9yRW50aXR5ICkgKSB7IFxuICAgICAga2V5ID0ga2V5T3JFbnRpdHkgYXMgRW50aXR5S2V5IFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGVudGl0eSA9IGtleU9yRW50aXR5IGFzIFRFbnRpdHlcbiAgICAgIGtleSA9IHNjaGVtYS5nZXRLZXkoZW50aXR5KVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hKS5jcmVhdGUobW9kZWwsIGtleSwgZW50aXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIHVwZGF0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIC8vIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAvLyAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gIC8vICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSBwcm94aWVkIG9iamVjdGAgKVxuXG4gIC8vICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gIC8vICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnVwZGF0ZShlbnRpdHkpXG4gIC8vIH1cblxuICAvKipcbiAgICogZGVsZXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgJ2lzIG5vdCBhIHRyYWNraW5nIGVudGl0eScgKVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5kZWxldGUoZW50aXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgYW5kIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWQobW9kZWwsIGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGRhdGFiYXNlIGJ5IGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2NvbmRpdGlvbicsICgpPT4gREJDLm5vdE51bGwoY29uZGl0aW9uKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGxldCBzZXNzaW9uID0gdGhpcy5nZXRTZXNzaW9uPFRFbnRpdHk+KHNjaGVtYSEpXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgc2Vzc2lvbi5nZXRNYW55PFRFbnRpdHk+KG1vZGVsLCBjb25kaXRpb24sIGZhbHNlLCB0cnVlIClcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JywgY29uZGl0aW9uID0gJyR7SlNPTi5zdHJpbmdpZnkoY29uZGl0aW9uKX0nIClgKVxuICAgIFxuICAgIHJldHVybiB0aGlzLmF0dGFjaCggbW9kZWwsIGl0ZW1zWzBdKVxuICB9XG5cbiAgICAvKipcbiAgICogZ2V0IGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRNYW55KG1vZGVsLCBjb25kaXRpb24sIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgb25seVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBmcm9tIGNhY2hlXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWRDYWNoZWQobW9kZWwsIGtleSwgdHJ1ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYWxsIGNhY2hlZCBlbnRpdGllc1xuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBmaWx0ZXIgZmlsdGVyIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0QWxsQ2FjaGVkKCBtb2RlbCwgZmlsdGVyIClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gcmVzdWx0UmFuZ2UgbGltaXQgYW5kIG9mZnNldCBvZiByZXN1bHRzIG51bWJlciBvciBqc29uLCBlZzogMTAgb3IgeyBsaW1pdCA6IDEwLCBvZmZzZXQgOiAxIH0gXG4gICAqIEBwYXJhbSBzb3J0IGpzb24geyBmaWVsZE5hbWUgOiAnQVNDJyB8ICdERVNDJyB9ICwgZWc6IHsgbmFtZSA6ICdBU0MnLCBhZ2UgOiAnREVTQycgfVxuICAgKiBAcGFyYW0gZmllbGRzIHJlc3VsdCBmaWVsZHMsIGRlZmF1bHQgaXMgYWxsIGZpZWxkc1xuICAgKiBAcGFyYW0gb2Zmc2V0IG9mZnNldCBvZiByZXN1bHQgc2V0ICBcbiAgICogQHBhcmFtIGpvaW4gam9pbiBpbmZvIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBcbiAgICBzb3J0PyA6IFNxbE9yZGVyLCBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnF1ZXJ5KG1vZGVsLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBmaWVsZHMsIGpvaW4pXG4gIH1cblxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHBhcmFtcyBtYW5nbyBsaWtlIHF1ZXJ5IHBhcmFtcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kT25lPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5maW5kQWxsKCBtb2RlbCwgcGFyYW1zIClcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIHBhcmFtcyA9ICcke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9JyApYClcbiAgICBcbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbXNbMF1cbiAgfVxuXG4gICAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRBbGw8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnF1ZXJ5QnlKc29uKCBtb2RlbCwgcGFyYW1zIClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIHF1ZXJ5IGlmIGV4aXN0cyByZWNvcmQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZXhpc3RzPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZXhpc3RzKG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICAvKipcbiAgICogY291bnQgcmVjb3JkcyBjb3VudCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jb3VudChtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tzIDogQXJyYXk8QmxvY2tIZWFkZXI+LCAgZ2V0VHJhbnNhY3Rpb25zOiAoKSA9PiBQcm9taXNlPEFycmF5PFRyYW5zYWN0aW9uPj4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgbGV0IHRyYW5zR3JvdXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8VHJhbnNhY3Rpb24+PigpXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IGdldFRyYW5zYWN0aW9ucygpXG5cbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCggdCA9PiB7XG4gICAgICBpZiAoIXRyYW5zR3JvdXAuaGFzKCB0LmJsb2NrSWQgKSkgdHJhbnNHcm91cC5zZXQoIHQuYmxvY2tJZCwgbmV3IEFycmF5PFRyYW5zYWN0aW9uPigpIClcbiAgICAgIHRyYW5zR3JvdXAuZ2V0KCB0LmJsb2NrSWQgKSEucHVzaCggdCApXG4gICAgfSApXG5cbiAgICBibG9ja3MuZm9yRWFjaCggYiA9PiBiWyd0cmFuc2FjdGlvbnMnXSA9IHRyYW5zR3JvdXAuZ2V0KGIuaWQhKSApXG4gICAgcmV0dXJuIGJsb2NrcyBhcyBBcnJheTxCbG9jaz5cbiAgfVxuXG4gIHByaXZhdGUgY29weUNhY2hlZEJsb2NrKCBnZXRDYWNoZUJsb2NrIDogKCkgPT4gTWF5YmVVbmRlZmluZWQ8QmxvY2s+LCB3aXRoVHJhbnNhY3Rpb25zIDogYm9vbGVhbiApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSBnZXRDYWNoZUJsb2NrKClcbiAgICBpZiAoIGNhY2hlZEJsb2NrID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgbGV0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oe30sIGNhY2hlZEJsb2NrKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCByZXN1bHQsICd0cmFuc2FjdGlvbnMnKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBoZWlnaHRcbiAgICogQHBhcmFtIGhlaWdodCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SGVpZ2h0KCBoZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgaGVpZ2h0ID49IDAgLCAnaGVpZ2h0IG11c3QgZ3JlYXQgb3IgZXF1YWwgemVybycpXG4gICAgXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldChoZWlnaHQpLCB3aXRoVHJhbnNhY3Rpb25zIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2soIGhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBibG9jayBpZFxuICAgKiBAcGFyYW0gYmxvY2tJZCBibG9jayBpZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWQnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGJsb2NrSWQpKVxuXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldEJ5SWQoYmxvY2tJZCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja0J5SWQoIGJsb2NrSWQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGhlaWdodCByYW5nZVxuICAgKiBAcGFyYW0gbWluSGVpZ2h0IG1pbiBoZWlnaHQoaW5jbHVkZWQpXG4gICAqIEBwYXJhbSBtYXhIZWlnaHQgbWF4IGhlaWdodChpbmNsdWRlZClcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQgOiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnbWluSGVpZ2h0LCBtYXhIZWlnaHQnLCBtaW5IZWlnaHQgPj0gMCAmJiBtYXhIZWlnaHQgPj0gbWluSGVpZ2h0LCAnbWluSGVpZ2h0IG9yIG1heEhlaWdodCBpcyBpbnZhbGlkJylcbiAgIFxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0LCBtYXhIZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGJsb2NrIGlkIGFycmF5XG4gICAqIEBwYXJhbSBibG9ja0lkcyBhcnJheSBvZiBibG9jayBpZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4sIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWRzJywgKCkgPT4gREJDLm5vdE51bGwoYmxvY2tJZHMpIClcblxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlJZHMoYmxvY2tJZHMpXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cbn0iLCJpbXBvcnQgeyBFbnRpdHksICBOdWxsYWJsZSwgcGFydGlhbCB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHlUcmFja2VyLCBQcm94aWVkRW50aXR5VHJhY2tlciB9IGZyb20gJy4vRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcblxuLyoqICAgICBcbiAqICAgICBTVEFURSBUUkFOU0ZFUiAgICAgICAgICAgICAgICAgIEFDVElPTiAgICAgICAgICAgICAgICBUUkFDSyAgICAgIENBQ0hFXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgID8gICAgICAgICAtPiBwZXJzaXRlbnQgICAgICBzZXNzaW9uLmxvYWQgICAgICAgICAgICAgdHJhY2sgICAgIGNhY2hlXG4gKiAgICAgID8gICAgICAgICAtPiBuZXcgICAgICAgICAgICBzZXNzaW9uLmNyZWF0ZSAgICAgICAgICAgdHJhY2sgICAgICAgLSAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBtb2RpZmllZCAgICAgICBzZXQgcHJvcGVydHkgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogcGVyc2lzdGVudCAgICAgLT4gZGVsZXRlZCAgICAgICAgc2Vzc2lvbi5kZWwgICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIG5ldyB8IG1vZGlmaWVkIC0+IHByZXNpc3RlbnQgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBrZWVwICAgICBjYWNoZXx1cGRhdGUgXG4gKiBkZWxldGVkICAgICAgICAtPiB0cmFuc2llbnQgICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAgZXZpdCAgICAgICBldml0XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdGUge1xuICBUcmFuc2llbnQgID0gLTEsXG4gIFBlcnNpc3RlbnQgPSAwLFxuICBcbiAgTmV3ICAgICAgICA9IDEsXG4gIE1vZGlmaWVkICAgPSAyLFxuICBEZWxldGVkICAgID0gMyxcbn1cblxuZXhwb3J0IGVudW0gRW50aXR5Q2hhbmdlVHlwZSB7XG4gIE5ldyAgICAgICA9IDEsXG4gIE1vZGlmeSAgICA9IDIsXG4gIERlbGV0ZSAgICA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2Uge1xuICBuYW1lICAgICA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50ICA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNoYW5nZXMge1xuICBkYlZlcnNpb24gICAgICAgICA6IG51bWJlclxuICB0eXBlICAgICAgICAgICAgICA6IEVudGl0eUNoYW5nZVR5cGVcbiAgcHJvcGVydGllc0NoYW5nZXMgOiBBcnJheTxQcm9wZXJ0eUNoYW5nZT5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlFeHRlbnNpb24ge1xuICBfdmVyc2lvbl8gICAgICA6IG51bWJlclxuICBfX2RldGFjaGVkX18gICA6IGJvb2xlYW5cbiAgX190cmFja2luZ19fICAgOiBib29sZWFuXG4gIF9fY29uZmlybWVkX18gIDogYm9vbGVhblxuICBfX3NjaGVtYV9fICAgICA6IE1vZGVsU2NoZW1hICBcbiAgX190cmFja2VyX18gICAgOiBFbnRpdHlUcmFja2VyXG4gIF9fc3RhdGVfXyAgICAgIDogRW50aXR5U3RhdGUgXG4gIF9fY2hhbmdlc19fICAgIDogTnVsbGFibGU8RW50aXR5Q2hhbmdlcz5cbiAgX191bmNvbmZpcm1lZENoYW5nZXNfXyAgOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlclxuXG4gIGNvbnN0cnVjdG9yKHRyYWNrZXI6IEVudGl0eVRyYWNrZXIpIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRW50aXR5UHJveHkubmFtZSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRXh0ZW5kZWQoZW50aXR5OiBFbnRpdHkpIHtcbiAgICByZXR1cm4gZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3NjaGVtYV9fJykgJiYgZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3N0YXRlX18nKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc1Byb3hpZWQoZW50aXR5OiBFbnRpdHkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVudGl0eVByb3h5LmlzRXh0ZW5kZWQoZW50aXR5KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjb252ZXJ0VG9Qcm94aWVkPFRFbnRpdHk+KGVudGl0eTogRW50aXR5KSA6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSkpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQcm94aWVkIEVudGl0eWApXG4gICAgXG4gICAgcmV0dXJuIGVudGl0eSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHByb3h5VG9FbnRpdHkocHJveGllZDogUHJveGllZDxFbnRpdHk+LCBjb250YWluc1ZlcnNpb24gPSB0cnVlICk6IEVudGl0eSB7XG4gICAgcmV0dXJuIGNvbnRhaW5zVmVyc2lvbiA/IFxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KHApICkgOlxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBwICE9PSAnX3ZlcnNpb25fJyAmJiAgRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShwKSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlLCAgY29uZmlybWVkIDogYm9vbGVhbiApIDogVEVudGl0eSB7XG4gICAgbGV0IHJlc3VsdCA9ICBPYmplY3QuYXNzaWduKHtcbiAgICAgIF92ZXJzaW9uXyAgICAgIDogMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19jb25maXJtZWRfXyAgOiBjb25maXJtZWQsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fY2hhbmdlc19fICAgIDogbnVsbCxcbiAgICAgIF9fdW5jb25maXJtZWRDaGFuZ2VzX18gOiBudWxsXG4gICAgfSwgZW50aXR5KVxuICAgIFxuICAgIHJlc3VsdC5fdmVyc2lvbl8gPSByZXN1bHQuX3ZlcnNpb25fIHx8IDFcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIGluaXRDaGFuZ2VzKCBleHQgOiBFbnRpdHlFeHRlbnNpb24gLCBjaGFuZ2VUeXBlID0gRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnkgKSB7XG4gICAgaWYgKGNoYW5nZVR5cGUgPT09IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5KSBleHQuX19jaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnksICAgICAgICBcbiAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyAsXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oeyBcbiAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZXh0Ll9fdW5jb25maXJtZWRDaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogY2hhbmdlVHlwZSwgICAgICAgIFxuICAgICAgZGJWZXJzaW9uOiBleHQuX3ZlcnNpb25fICxcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFByb3BlcnR5S2V5cyggZW50aXR5IDogRW50aXR5ICkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIHJldHVybiBleHQuX19zY2hlbWFfXy5maWVsZE5hbWVzXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSA6IGJvb2xlYW4geyAgICAgIFxuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5S2V5LnRvU3RyaW5nKClcblxuICAgIGlmICggIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkobmFtZSkgfHwgIWV4dC5fX3RyYWNraW5nX18gIHx8IHZhbHVlID09PSBlbnRpdHlbcHJvcGVydHlLZXldICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5S2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcm9wZXJ0eSBhZnRlciBkZWxldGVkYClcbiAgICB9XG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IGV4dC5fX3NjaGVtYV9fXG4gICAgaWYgKCBzY2hlbWEuaXNSZWFkb25seSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcmVhZG9ubHkgbW9kZWwgJyR7c2NoZW1hLm1vZGVsTmFtZX0nYClcbiAgICB9XG5cbiAgICBpZiAoIHNjaGVtYS5wcmltYXJ5S2V5ID09PSBuYW1lIHx8IHNjaGVtYS5jb21wb3NpdGVLZXlzLmluZGV4T2YobmFtZSkgPj0gMCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJpbWFyeSBrZXkgb3IgY29tcG9zaXRlIGtleSBwcm9wZXJ0eWApXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19kZXRhY2hlZF9fICkge1xuICAgICAgKCBleHQuX190cmFja2VyX18gYXMgUHJveGllZEVudGl0eVRyYWNrZXIpLmF0dGFjaCggcmVjZWl2ZXIgYXMgUHJveGllZDxhbnk+IClcbiAgICAgIGV4dC5fX2RldGFjaGVkX18gPSBmYWxzZVxuICAgIH1cblxuICAgIEVudGl0eVByb3h5LnJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0LCBwcm9wZXJ0eUtleSwgdmFsdWUgKVxuICAgIGVudGl0eVtwcm9wZXJ0eUtleV0gPSB2YWx1ZVxuICAgIFxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIHJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0IDogRW50aXR5RXh0ZW5zaW9uLCBrZXkgOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSApIHtcbiAgICBsZXQgc3RhcnRDb25maXJtID0gZmFsc2VcbiAgICBpZiAoIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgJiYgZXh0Ll9fY29uZmlybWVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlciApLnJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIGV4dCApXG4gICAgICBzdGFydENvbmZpcm0gPSB0cnVlXG4gICAgICBleHQuX19jb25maXJtZWRfXyA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBFbnRpdHlQcm94eS5pbml0Q2hhbmdlcyggZXh0ICkgICAgIFxuICAgIH1cblxuICAgIGxldCBwcm9wZXJ0aWVzQ2hhbmdlcyA6IE51bGxhYmxlPEFycmF5PFByb3BlcnR5Q2hhbmdlPj4gPSBudWxsIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7ICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzID0gZXh0Ll9fY29uZmlybWVkX18gPyAgXG4gICAgICAgIGV4dC5fX2NoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXM6IFxuICAgICAgICBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgICBcbiAgICB9XG4gICAgZWxzZSBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyAmJiBleHQuX190cmFja2VyX18uaXNDb25maXJtaW5nICkge1xuICAgICAgc3RhcnRDb25maXJtICYmIEVudGl0eVByb3h5LmluaXRDaGFuZ2VzKCBleHQsIEVudGl0eUNoYW5nZVR5cGUuTmV3IClcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzID0gZXh0Ll9fdW5jb25maXJtZWRDaGFuZ2VzX18gPT09IG51bGwgPyB1bmRlZmluZWQgOiBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXNcbiAgICB9XG5cbiAgICBsZXQgbmFtZSA9IGtleS50b1N0cmluZygpXG4gICAgcHJvcGVydGllc0NoYW5nZXMgJiYgcHJvcGVydGllc0NoYW5nZXMucHVzaCh7IG5hbWU6IG5hbWUsIG9yaWdpbmFsOiBleHRbbmFtZV0sIGN1cnJlbnQ6IHZhbHVlIH0pXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRGlydHkoIGVudGl0eTogRW50aXR5ICkgOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGF0ZSA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KS5fX3N0YXRlX19cbiAgICByZXR1cm4gISAoIHN0YXRlID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50IHx8IHN0YXRlID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eSBjcmVhdGUgbWFudWFsXG4gICAqIEBwYXJhbSBtb2RlbCBNb2RlbCBOYW1lXG4gICAqL1xuICBwdWJsaWMgcHJveHlOZXc8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgY29uZmlybWVkIDogYm9vbGVhbiApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoIGVudGl0eSwgc2NoZW1hLCAgRW50aXR5U3RhdGUuTmV3LCBjb25maXJtZWQpXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQsIG93bktleXMgOiB0aGlzLmdldFByb3BlcnR5S2V5cyB9KSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBlbnRpdHkgd3JhcHBlZCBieSBwcm94eSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgY2FuIGJlIGRldGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGxvYWRlZCBmcm9tIGRhdGFiYXNlLiBBVFRFTlNUSU9OOiBlbnN1cmUgdGhhdCBoYXMgcHJvcGVydHkgJ192ZXJzaW9uXydcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eVBlcnNpc3RlbnQ8VEVudGl0eT4oIGVudGl0eTogRW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICwgY29uZmlybWVkIDogYm9vbGVhbiApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSAgdGhpcy5hdHRhY2hFeHRlbmRQcm9wZXJ0aWVzKGVudGl0eSwgc2NoZW1hLCBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50LCAgY29uZmlybWVkIClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCwgb3duS2V5cyA6IHRoaXMuZ2V0UHJvcGVydHlLZXlzIH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBjb25maXJtQ2hhbmdlczxURW50aXR5PiggcGUgOiBQcm94aWVkPFRFbnRpdHk+ICkgOiB2b2lkIHtcbiAgICBpZiAoIHBlLl9fY29uZmlybWVkX18gKSB7XG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKCdjb25maXJtIHdoZW4gY29uZmlybWVkJylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgXG4gICAgbGV0IHRtcENoYW5nZXMgPSBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fXG4gICAgaWYgKCB0bXBDaGFuZ2VzICYmIHBlLl9fY2hhbmdlc19fICkge1xuICAgICAgcGUuX19jaGFuZ2VzX18ucHJvcGVydGllc0NoYW5nZXMucHVzaCggLi4udG1wQ2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcyApXG4gICAgfVxuICAgIGVsc2UgaWYgKCAhcGUuX19jaGFuZ2VzX18gKSB7XG4gICAgICBwZS5fX2NoYW5nZXNfXyA9IE9iamVjdC5hc3NpZ24oe30sIHRtcENoYW5nZXMpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gX191bmNvbmZpcm1lZENoYW5nZXNfXyA9PT0gbnVsbCAmJiBfX2NoYW5nZXNfXyAhPT0gbnVsbFxuICAgIH1cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18gJiYgKCBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKSApXG4gIH1cblxuICBwdWJsaWMgY2FuY2VsQ2hhbmdlczxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4gKSA6IHZvaWQge1xuICAgIGlmICggcGUuX19jb25maXJtZWRfXyApIHtcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oJ2NhbmNlbCB3aGVuIGNvbmZpcm1lZCcpXG4gICAgICByZXR1cm4gXG4gICAgfSBcbiAgICBcbiAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18gJiYgXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBwYyA9PiBwZVtwYy5uYW1lXSA9IHBjLm9yaWdpbmFsICkgXG4gICAgcGUuX190cmFja2luZ19fID0gdHJ1ZVxuICAgIGlmICggcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IHBlLl9fY2hhbmdlc19fID8gRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgfVxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiAoIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpIClcbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlDYWNoZSB9IGZyb20gJy4uL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgRW50aXR5LCBFbnRpdHlLZXksIG1ha2VKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eVByb3h5LCBQcm9wZXJ0eUNoYW5nZSwgUHJveGllZCwgRW50aXR5U3RhdGUsIEVudGl0eUNoYW5nZVR5cGUgfSBmcm9tICcuL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgU3FsQW5kUGFyYW1ldGVycywgU3FsQnVpbGRlciB9IGZyb20gJy4uL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBpc051bWJlciwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKCBtb2RlbDogc3RyaW5nLCBlbnRpdHk6IEVudGl0eSwgY2hhbmdlcyA6IEVudGl0eUNoYW5nZXMgKSA9PiB2b2lkXG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5VHJhY2tlciB7XG4gIHJlYWRvbmx5IHRyYWNraW5nRW50aXRpZXMgOiBJdGVyYWJsZTxFbnRpdHk+XG5cbiAgaXNUcmFja2luZyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IGJvb2xlYW5cbiAgdHJhY2tOZXcoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tQZXJzaXN0ZW50KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSk6IHZvaWRcblxuICBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkXG4gIHN0b3BUcmFja0FsbCgpOiB2b2lkXG5cbiAgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbiAgcmVqZWN0Q2hhbmdlcygpIDogdm9pZFxuICByb2xsYmFja0NoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkXG5cbiAgaXNDb25maXJtaW5nIDogYm9vbGVhblxuICBiZWdpbkNvbmZpcm0oKSA6IHZvaWRcbiAgY29uZmlybSgpIDogdm9pZFxuICBjYW5jZWxDb25maXJtKCkgOiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIE1vZGVsQW5kS2V5ID0gc3RyaW5nXG5leHBvcnQgdHlwZSBFbnRpdHlDaGFuZ2VzSXRlbSA9IHsgbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH1cbmV4cG9ydCB0eXBlIFByb3hpZWRFbnRpdHlBbmRDaGFuZ2VzID0geyBlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH1cblxuZXhwb3J0IGNsYXNzIFByb3hpZWRFbnRpdHlUcmFja2VyIGltcGxlbWVudHMgRW50aXR5VHJhY2tlciB7ICBcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBwcm94eSA6IEVudGl0eVByb3h5XG4gIHByaXZhdGUgY2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIG1pblZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBjdXJyZW50VmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGNvbmZpcm1pbmcgOiBib29sZWFuXG4gIHByaXZhdGUgaGlzdG9yeSA6IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+XG4gIHByaXZhdGUgYWxsVHJhY2tpbmdFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuICBwcml2YXRlIHVuY29uZmlybWVkRW50aXRpZXMgOiBNYXA8TW9kZWxBbmRLZXksIFByb3hpZWQ8YW55Pj5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoY2FjaGU6IEVudGl0eUNhY2hlKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihQcm94aWVkRW50aXR5VHJhY2tlci5uYW1lKVxuICAgIHRoaXMucHJveHkgPSBuZXcgRW50aXR5UHJveHkodGhpcylcbiAgICB0aGlzLmNhY2hlID0gY2FjaGVcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSBmYWxzZSAgICBcbiAgICB0aGlzLmhpc3RvcnkgPSBuZXcgTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcyA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIFByb3hpZWQ8YW55Pj4oKVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcyA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIFByb3hpZWQ8YW55Pj4oKVxuXG4gICAgdGhpcy5taW5WZXJzaW9uID0gLTFcbiAgICB0aGlzLmN1cnJlbnRWZXJzaW9uID0gLTFcbiAgfVxuXG4gIHByb3RlY3RlZCBlbnN1cmVOb1RyYWNraW5nKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSApIHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIHNjaGVtYS5nZXRLZXkoZW50aXR5KSk7XG4gICAgaWYgKCB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBtb2RlbD0ke3NjaGVtYS5tb2RlbE5hbWV9IGtleT0ke3NjaGVtYS5nZXRLZXkoZW50aXR5KX0gaXMgdHJhY2tpbmdgKVxuICB9XG4gIFxuICBwdWJsaWMgbWFrZU1vZGVsQW5kS2V5KHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogTW9kZWxBbmRLZXkge1xuICAgIGxldCBtayA9IHsgbTogc2NoZW1hLm1vZGVsTmFtZSwgazoga2V5fVxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSggbWsgKVxuICB9XG5cbiAgcHVibGljIHNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXkgKSA6IHsgbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXkgfSB7XG4gICAgbGV0IG1rID0gSlNPTi5wYXJzZSggbW9kZWxBbmRLZXkgKVxuICAgIGxldCBrZXkgPSBpc1N0cmluZyhtay5rKSB8fCBpc051bWJlcihtay5rKSA/IG1rLmsgOiBuZXcgQ29tcG9zaXRlS2V5KG1rLmsua2V5T2JqZWN0KVxuICAgIHJldHVybiB7IG1vZGVsIDogbWsubSwga2V5OiBrZXkgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEhpc3RvcnlCeVZlcnNpb24oIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UgKTogTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCF0aGlzLmhpc3RvcnkuaGFzKGhpc3RvcnlWZXJzaW9uKSAmJiBjcmVhdGVJZk5vdEV4aXN0cyApXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KGhpc3RvcnlWZXJzaW9uLCBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpKVxuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5nZXQoaGlzdG9yeVZlcnNpb24pIVxuICB9XG5cbiAgcHVibGljIGdldE1vZGVsQW5kS2V5KCBwZTogUHJveGllZDxhbnk+ICk6IE1vZGVsQW5kS2V5IHtcbiAgICByZXR1cm4gdGhpcy5tYWtlTW9kZWxBbmRLZXkocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgY2hhbmdlczogRW50aXR5Q2hhbmdlcywgaGlzdG9yeVZlcnNpb246IG51bWJlciApIDogdm9pZCB7XG4gICAgdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKGhpc3RvcnlWZXJzaW9uLCB0cnVlKS5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzKVxuICB9XG5cbiAgcHJvdGVjdGVkIHJlbW92ZVRyYWNraW5nVHJhbnNpc2VudEVudGl0aWVzKCkge1xuICAgIGxldCBrZXlzID0gbmV3IEFycmF5PE1vZGVsQW5kS2V5PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIChlbnRpdHksIGtleSkgPT4gZW50aXR5Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICYmIGtleXMucHVzaChrZXkpKVxuICAgIGtleXMuZm9yRWFjaCgga2V5ID0+IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUoa2V5KSApXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PiApOiB2b2lkIHtcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBhdHRhY2hIaXN0b3J5IGhpc3RvcnkgaW5mbyA9ICR7SlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5VmVyc2lvbil9YClcblxuICAgIGhpc3RvcnkuZm9yRWFjaCggKGNoYW5nZXMsIHZlcnNpb24pID0+IHtcbiAgICAgIGxldCBjaGFuZ2VzTWFwID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKVxuICAgICAgY2hhbmdlcy5mb3JFYWNoKCBjID0+IGNoYW5nZXNNYXAuc2V0KCBjLm1vZGVsQW5kS2V5LCBjLmNoYW5nZXMhICkpXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KHZlcnNpb24sIGNoYW5nZXNNYXAgKVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5sb2cuaW5mb0VuYWJsZWQpIHtcbiAgICAgIGxldCBoZWlnaHRJbmZvID0gbmV3IEFycmF5PG51bWJlcj4oKVxuICAgICAgaGlzdG9yeS5mb3JFYWNoKCAoYywgaCkgPT4gaGVpZ2h0SW5mby5wdXNoKGgpIClcbiAgICAgIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgYXR0YWNoSGlzdG9yeSBoZWlnaHQgPSAke0pTT04uc3RyaW5naWZ5KGhlaWdodEluZm8pfWApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluOiB0aGlzLm1pblZlcnNpb24sIG1heDogdGhpcy5jdXJyZW50VmVyc2lvbiB9XG4gIH1cblxuICBwdWJsaWMgYXR0YWNoKCBwZTogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KCBwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdleGlzdHMgYW5vdGhlciB0cmFja2VkIGVudGl0eScpXG4gICAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUgKVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0TGFzdENoYW5nZXMoIHBlOiBQcm94aWVkPGFueT4gKSA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzRGlydHkocGUpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgLy8gVE9ETzogY2hlY2sgaWYgY29uZmlybWluZyA/XG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IFxuICAgICAgICByZXR1cm4gcGUuX19jaGFuZ2VzX18hXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgbGV0IHRtcFZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG5cbiAgICB3aGlsZSAoIHRtcFZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0bXBWZXJzaW9uKVxuICAgICAgaGlzdG9yeSAmJiByZXN1bHQucHVzaChoaXN0b3J5KSAgICAgIFxuICAgICAgdG1wVmVyc2lvbi0tXG4gICAgfSAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRyYWNraW5nRW50aXRpZXMoKSA6IEl0ZXJhYmxlPEVudGl0eT4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMudmFsdWVzKClcbiAgfVxuXG4gIHB1YmxpYyBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXMoIHRoaXMubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIGtleSkgKVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBjb25zdCBrZXkgPSB0aGlzLmdldE1vZGVsQW5kS2V5KCBwZSApXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLnNldCgga2V5LCBwZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29uZmlybWluZygpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZmlybWluZ1xuICB9XG5cbiAgcHVibGljIGJlZ2luQ29uZmlybSgpIDogdm9pZCB7XG4gICAgdGhpcy5jb25maXJtaW5nID0gdHJ1ZVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSgnQkVHSU4gYmVnaW5Db25maXJtJylcbiAgfVxuXG4gIHB1YmxpYyBjb25maXJtKCkgOiB2b2lkIHtcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuZm9yRWFjaCggcGUgPT4geyBcbiAgICAgIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTmV3IClcbiAgICAgICAgdGhpcy5jb25maXJtTmV3KCBwZSApIFxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk1vZGlmaWVkIClcbiAgICAgICAgdGhpcy5jb25maXJtTW9kaWZ5KCBwZSApXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuRGVsZXRlZCApXG4gICAgICAgIHRoaXMuY29uZmlybWVkRGVsZXRlKCBwZSApXG4gICAgfSlcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMucmVtb3ZlVHJhY2tpbmdUcmFuc2lzZW50RW50aXRpZXMoKVxuICAgIHRoaXMuY29uZmlybWluZyA9IGZhbHNlXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCdTVUNDRVNTIGNvbmZpcm0gJylcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxDb25maXJtKCkgOiB2b2lkIHtcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuZm9yRWFjaCggcGUgPT4geyBcbiAgICAgIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTmV3IClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZE5ldyggcGUgKSBcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApXG4gICAgICAgIHRoaXMuY2FuY2VsVW5jb25maXJtZWRNb2RpZnkoIHBlIClcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5EZWxldGVkIClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZERlbGV0ZSggcGUgKVxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICAgICAgIHRoaXMuY2FuY2VsVW5jb25maXJtZWREZWxldGUoIHBlIClcbiAgICB9KVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5yZW1vdmVUcmFja2luZ1RyYW5zaXNlbnRFbnRpdGllcygpXG4gICAgdGhpcy5jb25maXJtaW5nID0gZmFsc2VcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoJ1NVQ0NFU1MgY2FuY2VsQ29uZmlybSAnKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApOiBNYXliZVVuZGVmaW5lZDxQcm94aWVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIGtleSlcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkgPyB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZ2V0KHRyYWNraW5nS2V5KSBhcyBQcm94aWVkPFRFbnRpdHk+IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgdHJhY2tOZXc8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7IFxuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5TmV3KGVudGl0eSwgc2NoZW1hLCAhdGhpcy5pc0NvbmZpcm1pbmcpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHRoaXMuY29uZmlybWluZyAmJiB0aGlzLnJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIHByb3hpZWQgKVxuXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZCB7XG4gICAgbGV0IHByb3hpZWQgPSBFbnRpdHlQcm94eS5jb252ZXJ0VG9Qcm94aWVkKGVudGl0eSlcbiAgICBcbiAgICBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IFxuICAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHJldHVyblxuICAgIFxuICAgIHRoaXMuY29uZmlybWluZyAmJiB0aGlzLnJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIHByb3hpZWQgKVxuICAgIHByb3hpZWQuX19jb25maXJtZWRfXyA9ICF0aGlzLmNvbmZpcm1pbmdcbiAgICBcbiAgICBzd2l0Y2ggKCBwcm94aWVkLl9fc3RhdGVfXyApIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDogXG4gICAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBjb25maXJtTmV3KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHByb3RlY3RlZCBjYW5jZWxVbmNvbmZpcm1lZE5ldyggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGxldCBuZXdUaGVuTW9kaWZ5ID0gcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiBcbiAgICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18udHlwZSA9PT0gRW50aXR5Q2hhbmdlVHlwZS5OZXdcbiAgICAgIFxuICAgIGlmICggbmV3VGhlbk1vZGlmeSApIHsgICAgICBcbiAgICAgIHRoaXMucHJveHkuY2FuY2VsQ2hhbmdlcyggcGUgKVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICB9XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25maXJtTW9kaWZ5KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgdGhpcy5wcm94eS5jb25maXJtQ2hhbmdlcyggcGUgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkTW9kaWZ5KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgdGhpcy5wcm94eS5jYW5jZWxDaGFuZ2VzKCBwZSApXG4gIH1cblxuICBwcm90ZWN0ZWQgY29uZmlybWVkRGVsZXRlKCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHByb3RlY3RlZCBjYW5jZWxVbmNvbmZpcm1lZERlbGV0ZSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGlmICggcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5OZXcgXG4gICAgfVxuICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgKSB7XG4gICAgICBsZXQgbW9kaWZpZWQgPSAgKCBwZS5fX2NoYW5nZXNfXyAmJiBwZS5fX2NoYW5nZXNfXy5wcm9wZXJ0aWVzQ2hhbmdlcy5sZW5ndGggPiAwIClcbiAgICAgIHBlLl9fc3RhdGVfXyA9IG1vZGlmaWVkID8gRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgfVxuICAgIFxuICAgIGlmICggcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyApIHsgXG4gICAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIH1cblxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gIH1cblxuICBwdWJsaWMgdHJhY2tQZXJzaXN0ZW50PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkge1xuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5UGVyc2lzdGVudChlbnRpdHksIHNjaGVtYSwgIXRoaXMuY29uZmlybWluZylcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZGVsZXRlKHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2tBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0NoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgbW9kZWxBbmRLZXkgOiB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSkgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBkZXRlY3RDaGFuZ2VzKCkgOiBBcnJheTxQcm94aWVkRW50aXR5QW5kQ2hhbmdlcz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8UHJveGllZEVudGl0eUFuZENoYW5nZXM+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IGVudGl0eTogcGUsIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMoZW50aXR5OiBFbnRpdHksIGRiVmVyc2lvbjogbnVtYmVyLCBpc05ldyA9IHRydWUpIDogRW50aXR5Q2hhbmdlcyB7XG4gICAgbGV0IHByb3Blcml0ZXNDaGFuZ2UgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHkpIHtcbiAgICAgIGlmICghRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrZXkpKSBjb250aW51ZVxuICAgICAgcHJvcGVyaXRlc0NoYW5nZS5wdXNoKCBpc05ldyA/IFxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IHVuZGVmaW5lZCwgY3VycmVudDogZW50aXR5W2tleV0gfSA6XG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogZW50aXR5W2tleV0sIGN1cnJlbnQ6ICB1bmRlZmluZWQgfSAgICAgICBcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZSA6IGlzTmV3ID8gRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZSxcbiAgICAgIGRiVmVyc2lvbjogZGJWZXJzaW9uLCAgICAgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBwcm9wZXJpdGVzQ2hhbmdlXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgaGlzdG9yeVZlcnNpb246IG51bWJlciApOiB2b2lkIHtcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBORVcgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYERFTEVURSBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE1PRElGSUVEIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBjaGFuZ2VzID0gJHtKU09OLnN0cmluZ2lmeShwZS5fX2NoYW5nZXNfXyl9YClcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCBwZS5fX2NoYW5nZXNfXyEsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX2NoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nIFxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6IFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZCB7XG4gICAgdGhpcy5jb25maXJtKClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBwZS5fX3NjaGVtYV9fXG4gICAgICBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCkgXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpLCBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSApXG4gICAgICBlbHNlIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQpXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSlcbiAgICAgIC8vIGVsc2UgJ3RyYW5zaWVudCcgfCAncGVyc2lzdGVudCcgZG8gbm90aGluZ1xuICAgICAgdGhpcy5tYXJrU3RhdGVBbmRTYXZlSGlzdG9yeShwZSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uID0gaGlzdG9yeVZlcnNpb25cbiAgICAgIHBlLl9fZGV0YWNoZWRfXyA9IHRydWVcbiAgICB9KSAgXG4gICAgXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLm1pblZlcnNpb24gPSB0aGlzLm1pblZlcnNpb24gPT09IC0xID8gaGlzdG9yeVZlcnNpb24gOiB0aGlzLm1pblZlcnNpb25cbiAgICBcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuICB9XG4gIFxuICBwcm90ZWN0ZWQgcm9sbGJhY2tDYWNoZUNoYW5nZXMoIG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzICk6IHZvaWQge1xuICAgIHN3aXRjaChjaGFuZ2VzLnR5cGUpIHtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KG1vZGVsLCBrZXkpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6XG4gICAgICAgIGxldCBlID0gdGhpcy5jYWNoZS5nZXQoIG1vZGVsLCBrZXkgKVxuICAgICAgICBpZiAoIGUgPT09IHVuZGVmaW5lZCApIHJldHVyblxuICAgICAgICBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gZSFbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZSApXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6IFxuICAgICAgICBjb25zdCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdCggY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYyA9PiBjLm5hbWUsIGMgPT4gYy5vcmlnaW5hbClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGVudGl0eSApXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5jYW5jZWxDb25maXJtKClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gZmFsc2VcbiAgICAgICAgICBwZS5fX2NoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBwZVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gdHJ1ZVxuICAgICAgICAgIHBlLl9fY2hhbmdlc19fID0gbnVsbFxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDpcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcmVqZWN0Q2hhbmdlcyBWZXJzaW9uID0gP2ApXG4gIH1cbiAgXG4gIHB1YmxpYyByb2xsYmFja0NoYW5nZXMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLnJlamVjdENoYW5nZXMoKVxuICAgIHdoaWxlKCBoaXN0b3J5VmVyc2lvbiA8PSB0aGlzLmN1cnJlbnRWZXJzaW9uICkge1xuICAgICAgY29uc3QgY2hhbmdlc01hcCA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgICAgY2hhbmdlc01hcCAmJiBjaGFuZ2VzTWFwLmZvckVhY2goICggY2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApIFxuICAgICAgICB0aGlzLnJvbGxiYWNrQ2FjaGVDaGFuZ2VzKG1rLm1vZGVsLCBtay5rZXksIGNoYW5nZXMpXG4gICAgICB9KVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiAtLVxuICAgIH1cblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiBwZS5fX2RldGFjaGVkX18gPSB0cnVlKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5taW5WZXJzaW9uID0gTWF0aC5taW4odGhpcy5taW5WZXJzaW9uLCB0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHt0aGlzLmN1cnJlbnRWZXJzaW9ufWApXG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5KCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIHtcbiAgICBpZiAoIHRoaXMubWluVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiB8fCB0aGlzLmN1cnJlbnRWZXJzaW9uIDwgaGlzdG9yeVZlcnNpb24gKSByZXR1cm5cbiAgICBmb3IoIGxldCB2ZXIgPSB0aGlzLm1pblZlcnNpb247IHZlciA8IGhpc3RvcnlWZXJzaW9uOyB2ZXIrKyApIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5kZWxldGUodmVyKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHVtcENoYW5nZXMoIGVjOiBFbnRpdHlDaGFuZ2VzICk6IHN0cmluZyB7XG4gICAgbGV0IHByb3BlcnR5Q2hhbmdlcyA9ICcnXG4gICAgZWMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaChwYyA9PiBwcm9wZXJ0eUNoYW5nZXMgKz0gYCR7cGMubmFtZX06ICR7cGMub3JpZ2luYWx9IC0+ICR7cGMuY3VycmVudH0sIGApXG5cbiAgICByZXR1cm4gYGRiVmVyc2lvbj0ke2VjLmRiVmVyc2lvbn0sIHR5cGU9JHtlYy50eXBlfSwgWyR7cHJvcGVydHlDaGFuZ2VzfV1gXG4gIH1cblxuICBwdWJsaWMgZHVtcEhpc3RvcnkoKSA6IHN0cmluZyB7XG4gICAgbGV0IHZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBISVNUT1JZICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB3aGlsZSggdmVyc2lvbiA+PSB0aGlzLm1pblZlcnNpb24gKSB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tdmVyc2lvbiAke3ZlcnNpb259LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBsZXQgaGlzID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKCB2ZXJzaW9uIClcbiAgICAgIGhpcyAmJiBoaXMuZm9yRWFjaCggKCBlYywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGxldCBjaGFuZ2VzID0gdGhpcy5kdW1wQ2hhbmdlcyggZWMgKVxuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgICBjb25zdCBtc2cgPSBgdHlwZT0ke21rLm1vZGVsfSwga2V5PSR7bWsua2V5fSwgY2hhbmdlcz17JHtjaGFuZ2VzfX0gXFxuYFxuICAgICAgICByZXN1bHQgKz0gbXNnXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgICB2ZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYWNrZXJTcWxCdWlsZGVyIHtcbiAgcHJpdmF0ZSB0cmFja2VyOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc3FsQnVpbGRlcjogU3FsQnVpbGRlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyLCBtb2RlbHMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4sIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXIgKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICAgIHRoaXMubW9kZWxzID0gbW9kZWxzXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gc3FsQnVpbGRlclxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGVudGl0eVRyYWNrZXIoKSB7IHJldHVybiB0aGlzLnRyYWNrZXIgfVxuXG4gIHB1YmxpYyBidWlsZENoYW5nZVNxbHMoKSA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZGV0ZWN0Q2hhbmdlcygpLmZvckVhY2goIGVjID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLmJ1aWxkU3FsQW5kUGFyYW1ldGVycyhlYy5lbnRpdHkpIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBidWlsZFNxbEFuZFBhcmFtZXRlcnMocGUgOlByb3hpZWQ8YW55PikgOiBTcWxBbmRQYXJhbWV0ZXJzIHsgIFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDpcbiAgICAgICAgY29uc3QgbmV3RW50aXR5ID0gIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkoIHBlLCB0cnVlIClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydCggcGUuX19zY2hlbWFfXywgbmV3RW50aXR5KVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6XG4gICAgICAgIGxldCBlbnRpdHlDaGFuZ2VzID0gdGhpcy50cmFja2VyLmdldExhc3RDaGFuZ2VzKHBlKSFcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdCggZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcyAsIGM9PiBjLm5hbWUsIGM9PiBjLmN1cnJlbnQgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gLSAxIClcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6XG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZW50aXR5IHN0YXRlICcke3BlLl9fc3RhdGVfX30nYClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICk6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbiApLmZvckVhY2goIGhpcyA9PiBoaXMuZm9yRWFjaCggKCBlbnRpdHlDaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgIGNvbnN0IG1rID0gdGhpcy50cmFja2VyLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtay5tb2RlbClcbiAgICAgIHN3aXRjaChlbnRpdHlDaGFuZ2VzLnR5cGUpIHtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldzpcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUoc2NoZW1hISwgbWsua2V5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OiBcbiAgICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShzY2hlbWEhLCBtay5rZXksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uICkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTpcbiAgICAgICAgICBsZXQgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KHNjaGVtYSEsIGVudGl0eSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9KSlcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxufVxuXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiZXR0ZXItc3FsaXRlM1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFuZ2UtY2FzZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbi1zcWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc2Vjb25kYXJ5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXN1YmxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxydS1jYWNoZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dGlsXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=