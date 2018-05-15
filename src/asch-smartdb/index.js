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
        return this.setKey(entity, key);
    }
    copyProperties(dest, src, includeKey = false) {
        this.allFields.forEach(f => {
            let needCopy = !includeKey && (this.cKeys.indexOf(f) >= 0 || f === this.primaryKey) && src[f] !== undefined;
            if (needCopy)
                return;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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Qzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJhc2NoLXNtYXJ0ZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIHdhc20gbW9kdWxlc1xuIFx0dmFyIGluc3RhbGxlZFdhc21Nb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgY29tcGlsZWQgV2ViQXNzZW1ibHkuTW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL0luZGV4LnRzXCIpO1xuIiwiaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9CbG9jaydcblxuZXhwb3J0IGNsYXNzIEJsb2NrQ2FjaGUge1xuICBwcml2YXRlIGNhY2hlID0gbmV3IE1hcDxudW1iZXIsIEJsb2NrPigpXG4gIHByaXZhdGUgbWluSGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhIZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heENhY2hlZENvdW50IDogbnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhDYWNoZWRDb3VudCA6IG51bWJlciApIHtcbiAgICB0aGlzLm1heENhY2hlZENvdW50ID0gbWF4Q2FjaGVkQ291bnRcbiAgfVxuXG4gIHB1YmxpYyBpc0NhY2hlZCggaGVpZ2h0OiBudW1iZXIgKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBoZWlnaHQgPiAwICYmIGhlaWdodCA+PSB0aGlzLm1pbkhlaWdodCAmJiBoZWlnaHQgPD0gdGhpcy5tYXhIZWlnaHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY2FjaGVkSGVpZ2h0UmFuZ2UoKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbiA6IHRoaXMubWluSGVpZ2h0LCBtYXg6IHRoaXMubWF4SGVpZ2h0IH1cbiAgfVxuXG4gIHB1YmxpYyBwdXQoIGJsb2NrOiBCbG9jayApIHtcbiAgICBpZiAoICF0aGlzLmlzQ2FjaGVkKCBibG9jay5oZWlnaHQgKSAmJiB0aGlzLm1heEhlaWdodCA+PSAwICYmIGJsb2NrLmhlaWdodCAhPT0gdGhpcy5tYXhIZWlnaHQgKyAxIClcbiAgICAgIHRocm93IG5ldyBFcnJvciAoJ2ludmFsaWQgYmxvY2sgaGVpZ2h0JylcblxuICAgIHRoaXMuY2FjaGUuc2V0KCBibG9jay5oZWlnaHQsIGJsb2NrIClcbiAgICB0aGlzLm1heEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICAgIFxuICAgIGlmICggdGhpcy5jYWNoZS5zaXplID49IHRoaXMubWF4Q2FjaGVkQ291bnQgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZSggdGhpcy5taW5IZWlnaHQrKyApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCggaGVpZ2h0OiBudW1iZXIgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGhlaWdodClcbiAgfVxuXG4gIHB1YmxpYyBnZXRCeUlkKCBpZDogc3RyaW5nICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGZvciggY29uc3QgYiBvZiB0aGlzLmNhY2hlLnZhbHVlcygpICkge1xuICAgICAgaWYgKCBiLmlkISA9PT0gaWQgKSByZXR1cm4gYlxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXZpdCggZnJvbUhlaWdodDogbnVtYmVyLCB0b0hlaWdodDogbnVtYmVyICkge1xuICAgIGxldCBtaW4gPSBNYXRoLm1pbiggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGxldCBtYXggPSBNYXRoLm1heCggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGlmICggbWluID4gdGhpcy5tYXhIZWlnaHQgfHwgbWF4IDwgdGhpcy5taW5IZWlnaHQgKSByZXR1cm4gXG4gICAgXG4gICAgbWluID0gTWF0aC5tYXgoIG1pbiwgdGhpcy5taW5IZWlnaHQgKVxuICAgIG1heCA9IE1hdGgubWluKCBtYXgsIHRoaXMubWluSGVpZ2h0IClcbiAgICBmb3IgKCBsZXQgaGVpZ2h0ID0gbWluOyBoZWlnaHQgPD0gbWF4OyBoZWlnaHQrKyApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGhlaWdodClcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RMaXRlcmFsIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgdHlwZSBKc29uT2JqZWN0ID0gT2JqZWN0TGl0ZXJhbFxuZXhwb3J0IHR5cGUgRW50aXR5ID0gT2JqZWN0TGl0ZXJhbFxuXG5leHBvcnQgaW50ZXJmYWNlIEtleU9iamVjdCB7IFxuICBrZXkgOiBzdHJpbmdcbiAga2V5SnNvbiA6IEpzb25PYmplY3Rcbn1cbmV4cG9ydCB0eXBlIEVudGl0eUtleSA9IHN0cmluZyB8IG51bWJlciB8IEtleU9iamVjdFxuXG5leHBvcnQgdHlwZSBQYXJ0aWFsPFQ+ID0ge1xuICBbUCBpbiBrZXlvZiBUXT86IFRbUF1cbn1cblxuZXhwb3J0IHR5cGUgUmVhZG9ubHlQYXJ0aWFsPFQ+ID0ge1xuICByZWFkb25seSBbUCBpbiBrZXlvZiBUXTogVFtQXTtcbn1cblxuZXhwb3J0IHR5cGUgRmlsdGVyRnVuY3Rpb248VD4gPSAoIGUgOiBUICkgPT4gYm9vbGVhblxuXG5leHBvcnQgdHlwZSBLZXlWYWx1ZVBhaXIgPSB7IGtleTogc3RyaW5nLCB2YWx1ZTogYW55IH1cbmV4cG9ydCB0eXBlIENhbGxiYWNrPFRSZXN1bHQ+ID0gKCBlcnI6IEVycm9yfG51bGwsIGRhdGE6IFRSZXN1bHQgKSA9PiB2b2lkXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSnNvbk9iamVjdDxUPihpdGVyYWJsZTogSXRlcmFibGU8VD4sIGdldEtleTogKHQgOiBUKSA9PiBzdHJpbmcsIGdldFZhbHVlOiAodDogVCkgPT4gYW55ICApIDogSnNvbk9iamVjdCB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2l0ZXJhYmxlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGl0ZXJhYmxlICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldEtleScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRLZXkgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0VmFsdWUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0VmFsdWUgKSlcblxuICBsZXQgcmV0ID0ge31cbiAgZm9yIChsZXQgaXRlbSBvZiBpdGVyYWJsZSkge1xuICAgIHJldFtnZXRLZXkoaXRlbSldID0gZ2V0VmFsdWUoaXRlbSlcbiAgfVxuICByZXR1cm4gcmV0IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVlcENvcHk8VD4oc3JjIDogVCkgOiBUIHtcbiAgaWYgKCAhc3JjICkgcmV0dXJuIHNyY1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzcmMpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbDxUPiggc3JjIDogVCwga2V5c09yS2V5RmlsdGVyIDogQXJyYXk8c3RyaW5nPiB8ICgoa2V5IDogc3RyaW5nKSA9PiBib29sZWFuKSApOiBQYXJ0aWFsPFQ+IHtcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnc3JjJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIHNyYyApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdrZXlzT3JLZXlGaWx0ZXInLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCgga2V5c09yS2V5RmlsdGVyICkpXG5cbiAgbGV0IGtleXMgPSBpc0Z1bmN0aW9uKGtleXNPcktleUZpbHRlcikgPyBcbiAgICBPYmplY3Qua2V5cyhzcmMpLmZpbHRlcigga2V5c09yS2V5RmlsdGVyIGFzICgoa2V5IDogc3RyaW5nKSA9PiBib29sZWFuKSApIDpcbiAgICBrZXlzT3JLZXlGaWx0ZXIgYXMgQXJyYXk8c3RyaW5nPlxuXG4gIGxldCByZXN1bHQgPSB7IH1cbiAgZm9yICggbGV0IGsgb2Yga2V5cyApIHJlc3VsdFtrXSA9IHNyY1trXVxuICByZXR1cm4gcmVzdWx0IGFzIFBhcnRpYWw8VD5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJpbWl0aXZlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoICFrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGlzU3RyaW5nKCBrZXkgKSB8fCBpc051bWJlcigga2V5IClcbn1cblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciggbWVzc2FnZSA6IHN0cmluZyApIHtcbiAgICBzdXBlciggJ0NvZGUgY29udHJhY3QgRXJyb3IsJysgbWVzc2FnZSApXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29udHJhY3RDb25kaXRpb24gPSBib29sZWFuIHwgKCAoKSA9PiBib29sZWFuIClcbmV4cG9ydCB0eXBlIENvbnRyYWN0TWVzc2FnZSAgID0gc3RyaW5nICB8ICggKCkgPT4gc3RyaW5nIClcblxuZXhwb3J0IHR5cGUgTWF5YmVVbmRlZmluZWQ8VD4gPSBUIHwgdW5kZWZpbmVkXG5leHBvcnQgdHlwZSBOdWxsYWJsZTxUPiA9IFQgfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0VmVyaWZ5UmVzdWx0ID0geyByZXN1bHQgOiBib29sZWFuLCBtZXNzYWdlOiBOdWxsYWJsZTxzdHJpbmc+IH0gXG5leHBvcnQgdHlwZSBWZXJpZnlGdW5jdGlvbiA9ICgpID0+IENvbnRyYWN0VmVyaWZ5UmVzdWx0XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3Qge1xuICBwdWJsaWMgc3RhdGljIHZlcmlmeSggY29uZGl0aW9uOiBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSA6IENvbnRyYWN0TWVzc2FnZSApIDogdm9pZCB7XG4gICAgaWYgKCBjb25kaXRpb24gPT09IHVuZGVmaW5lZCB8fCBjb25kaXRpb24gPT09IG51bGwgKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyaWZ5IGNvbmRpdGlvbicpXG5cbiAgICBjb25zdCBjb25kID0gaXNGdW5jdGlvbihjb25kaXRpb24pID8gKGNvbmRpdGlvbiBhcyBGdW5jdGlvbikoKSA6IGNvbmRpdGlvblxuICAgIGNvbnN0IG1zZyA9IGlzRnVuY3Rpb24obWVzc2FnZSkgPyAobWVzc2FnZSBhcyBGdW5jdGlvbikoKSA6IG1lc3NhZ2VcblxuICAgIGlmICghY29uZCkgdGhyb3cgbmV3IENvZGVDb250cmFjdEVycm9yKCBtc2cgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhcmd1bWVudCggYXJnTmFtZTogc3RyaW5nLCB2ZXJpZnk6IFZlcmlmeUZ1bmN0aW9uIHwgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2U/IDogQ29udHJhY3RNZXNzYWdlICk6IHZvaWQge1xuICAgIGlmICggIWFyZ05hbWUgfHwgIXZlcmlmeSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcmdOYW1lIG9yIHZlcmlmeSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgaWYgKCAhbWVzc2FnZSApIHtcbiAgICAgIGNvbnN0IHZyID0gICh2ZXJpZnkgYXMgVmVyaWZ5RnVuY3Rpb24pKClcbiAgICAgIENvZGVDb250cmFjdC52ZXJpZnkoIHZyLnJlc3VsdCwgYGFyZ3VtZW50ICcke2FyZ05hbWV9JyAke3ZyLm1lc3NhZ2V9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIENvZGVDb250cmFjdC52ZXJpZnkodmVyaWZ5IGFzIENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlISkgICAgXG4gIH1cblxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbCggYXJnIDogYW55ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXJnICE9PSBudWxsICYmIGFyZyAhPT0gdW5kZWZpbmVkXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yRW1wdHkoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsKHN0cikgJiYgc3RyICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIGVtcHR5J1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPcldoaXRlc3BhY2UoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsT3JFbXB0eSggc3RyICkgJiYgKCBzdHIgYXMgc3RyaW5nICkudHJpbSgpICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIHdoaXRlc3BhY2UnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG59XG5cblxuIiwiaW1wb3J0IHsgRW50aXR5Q2FjaGUsIExSVUVudGl0eUNhY2hlLCBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IgfSBmcm9tICcuL01vZGVsJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBKc29uU3FsQnVpbGRlciwgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIsIE1VTFRJX1NRTF9TRVBBUkFUT1IgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBFbnRpdHksIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEZpbHRlckZ1bmN0aW9uIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBQcm94aWVkRW50aXR5VHJhY2tlciwgVHJhY2tlclNxbEJ1aWxkZXIsIEVudGl0eUNoYW5nZXNJdGVtLCBNb2RlbEFuZEtleSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlFeHRlbnNpb24sIFByb3hpZWQsIEVudGl0eVN0YXRlIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTYXZlSGlzdG9yeUFjdGlvbiA9ICggdmVyc2lvbjogbnVtYmVyLCBoaXN0b3J5OiBNYXA8c3RyaW5nLCBFbnRpdHlDaGFuZ2VzPiApID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIERiU2Vzc2lvbiB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY29ubmVjdGlvbjogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzZXNzaW9uQ2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIHNxbEJ1aWxkZXIgOiBKc29uU3FsQnVpbGRlclxuICBwcml2YXRlIHRyYWNrZXJTcWxCdWlsZGVyOiBUcmFja2VyU3FsQnVpbGRlclxuICBwcml2YXRlIGVudGl0eVRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIGhvbGRMb2NrcyA6IE1hcDxzdHJpbmcsIGJvb2xlYW4+XG4gIHByaXZhdGUgc2Vzc2lvblNlcmlhbCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbiwgY2FjaGVPcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zLCBzZXNzaW9uTmFtZT86IHN0cmluZykge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoIERiU2Vzc2lvbi5uYW1lICsgKCBzZXNzaW9uTmFtZSA9PT0gdW5kZWZpbmVkID8gJycgOiBgXyR7c2Vzc2lvbk5hbWV9YCkgIClcbiAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSAtMVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMuaG9sZExvY2tzID0gbmV3IE1hcDxzdHJpbmcsIGJvb2xlYW4+KClcbiAgICB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyID0gbmV3IFRyYWNrZXJTcWxCdWlsZGVyKCB0aGlzLmVudGl0eVRyYWNrZXIsIHRoaXMubW9kZWxzLCB0aGlzLnNxbEJ1aWxkZXIgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWU6IHN0cmluZykgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1vZGVsTmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlDbGFzczxURW50aXR5PihjbGF6ejogQ29uc3RydWN0b3I8VEVudGl0eT4pIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChjbGF6ei5uYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke2NsYXp6Lm5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICkge1xuICAgIHJldHVybiB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbCkgOiBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlDbGFzcyhtb2RlbClcbiAgfVxuXG4gIHByb3RlY3RlZCBtYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkoIHt9LCBrZXkgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCAgZW50aXRpZXMgOiBBcnJheTxURW50aXR5PiwgY2FjaGUgPSB0cnVlLCByZWZyZXNoSWZUcmFja2luZyA9IGZhbHNlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICBsZXQga2V5ID0gc2NoZW1hLmdldEtleShlKSBcbiAgICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgICBsZXQgcHJveGllZCA9IHJlZnJlc2hJZlRyYWNraW5nICYmIHRyYWNrZWQgIT09IHVuZGVmaW5lZCA/IFxuICAgICAgICB0cmFja2VkIGFzIGFueSBhcyBURW50aXR5IDogXG4gICAgICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hLCBlKVxuICAgICAgcmVzdWx0LnB1c2goIHByb3hpZWQgKVxuICAgICAgY2FjaGUgJiYgdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIGtleSwgZSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVzZXQoY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5zdG9wVHJhY2tBbGwoKVxuICAgIGlmICggY2xlYXJDYWNoZSApIHRoaXMuZW50aXR5Q2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgcHJvdGVjdGVkIHVuZGVmaW5lZElmRGVsZXRlZDxURW50aXR5PiggcHJveGllZCA6IFByb3hpZWQ8VEVudGl0eT4gKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICByZXR1cm4gKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkgPyBcbiAgICAgIHVuZGVmaW5lZCA6IFxuICAgICAgcHJveGllZCBhcyBPYmplY3QgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbiAmJiB0aGlzLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW50aXR5Q2FjaGUoKTogRW50aXR5Q2FjaGUge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25DYWNoZVxuICB9XG5cbiAgcHVibGljIHN5bmNTY2hlbWEoc2NoZW1hOiBNb2RlbFNjaGVtYSk6IHZvaWQge1xuICAgIHRoaXMuc3FsQnVpbGRlci5idWlsZFNjaGVtYShzY2hlbWEpLmZvckVhY2goIHNxbD0+IHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbi5leGVjdXRlU3luYyggc3FsIClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2NoZW1hKC4uLnNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogdm9pZCB7XG4gICAgc2NoZW1hcy5mb3JFYWNoKCBzID0+IHRoaXMubW9kZWxzLnNldChzLm1vZGVsTmFtZSwgcykgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlc2V0KCB0cnVlIClcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZGlzY29ubmVjdCgpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pik6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDYWNoZWQ8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCBlbnRpdHlNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBURW50aXR5PigpXG4gICAgbmV3IEFycmF5PFByb3hpZWQ8YW55Pj4oLi4udGhpcy5lbnRpdHlUcmFja2VyLnRyYWNraW5nRW50aXRpZXMgYXMgSXRlcmFibGU8UHJveGllZDxhbnk+PiApXG4gICAgICAuZmlsdGVyKCBwZSA9PiBwZS5fX3NjaGVtYV9fLm1vZGVsTmFtZSA9PT0gc2NoZW1hLm1vZGVsTmFtZSAmJiBwZS5fX3N0YXRlX18gIT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgJiYgcGUuX19zdGF0ZV9fICE9PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgICAgLmZvckVhY2goIHBlID0+IGVudGl0eU1hcC5zZXQoIHRoaXMuZW50aXR5VHJhY2tlci5nZXRNb2RlbEFuZEtleShwZSksIHBlIGFzIGFueSBhcyBURW50aXR5KSApXG5cbiAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwgZmlsdGVyIClcbiAgICBlbnRpdGllcyAmJiBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHtcbiAgICAgIGxldCBrZXkgPSB0aGlzLmVudGl0eVRyYWNrZXIubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIHNjaGVtYS5nZXRLZXkoZSkgKVxuICAgICAgaWYgKCAhZW50aXR5TWFwLmhhcyhrZXkpKSB7XG4gICAgICAgIGxldCBwZSA9IHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoIHNjaGVtYSwgZSApXG4gICAgICAgIGVudGl0eU1hcC5zZXQoIGtleSwgcGUgKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZpbHRlciA/IFsuLi5lbnRpdHlNYXAudmFsdWVzKCldLmZpbHRlciggZmlsdGVyICkgOiBbLi4uZW50aXR5TWFwLnZhbHVlcygpXVxuICB9XG5cbiAgcHVibGljIGF0dGFjaDxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIHRoaXMudW5kZWZpbmVkSWZEZWxldGVkKHRyYWNrZWQpXG5cbiAgICBsZXQgY2FjaGVkID0gdGhpcy5lbnRpdHlDYWNoZS5nZXQ8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgcmV0dXJuICggY2FjaGVkID09PSB1bmRlZmluZWQgKSA/IHVuZGVmaW5lZCA6IFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBjYWNoZWQgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEFsbDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuXG4gICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICYmIHRoaXMuZW50aXR5Q2FjaGUuZXhpc3RzTW9kZWwoc2NoZW1hLm1vZGVsTmFtZSkgKSB7XG4gICAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSApIHx8IFtdXG4gICAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSwgdHJ1ZSApIDogZW50aXRpZXMgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldE1hbnkoIG1vZGVsLCB7IH0sIHRyYWNrIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UsIGNhY2hlID0gdHJ1ZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24pXG4gICAgXG4gICAgbGV0IGVudGl0aWVzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgY2FjaGUgJiYgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShlKSwgZSApKVxuXG4gICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzICAgICBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeTxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBmaWVsZHM/OiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgam9pbilcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnlCeUpzb248VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHBhcmFtcylcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhpc3RzPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsIClcblxuICAgIGxldCB7IHF1ZXJ5ICwgcGFyYW1ldGVyc30gPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3QoIHNjaGVtYSwgW10gLCBjb25kaXRpb24gKSBcbiAgICBxdWVyeSA9IGBzZWxlY3QgZXhpc3RzKCR7cXVlcnkucmVwbGFjZShNVUxUSV9TUUxfU0VQQVJBVE9SLCAnJyl9KSBhcyBleGlzdGBcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoIHF1ZXJ5LCBwYXJhbWV0ZXJzIClcbiAgICBcbiAgICByZXR1cm4gaXNBcnJheShyZXQpICYmIHBhcnNlSW50KHJldFswXVsnZXhpc3QnXSkgPiAwIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgcmV0ID0gYXdhaXQgdGhpcy5xdWVyeUJ5SnNvbiggbW9kZWwsIHsgZmllbGRzIDogJ2NvdW50KCopIGFzIGNvdW50JywgY29uZGl0aW9uOiBjb25kaXRpb24gfSApXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSA/IHBhcnNlSW50KHJldFswXVsnY291bnQnXSkgOiAwIFxuICB9XG5cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgIGtleTogRW50aXR5S2V5LCBlbnRpdHk/IDogVEVudGl0eSkgOiBURW50aXR5IHsgICAgXG4gICAgaWYgKCAha2V5ICkgdGhyb3cgbmV3IEVycm9yKCdlbnRpdHkga2V5IGNhbiBub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IHRoZUVudGl0eSA9IHNjaGVtYS5uZXdFbnRpdHkoIG1vZGVsLCBrZXkgKVxuICAgIGVudGl0eSAmJiBzY2hlbWEuY29weVByb3BlcnRpZXMoIHRoZUVudGl0eSwgZW50aXR5IClcblxuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5KHNjaGVtYSwga2V5KVxuICAgIGxldCBleGlzdHMgPSB0cmFja2VkICE9PSB1bmRlZmluZWQgfHwgdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKCBzY2hlbWEubW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZXhpc3RzICkgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgZXhpc3RzIGFscmVhZHkgKCBtb2RlbCA9ICcke3NjaGVtYS5tb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXksIHRydWUgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZSggbW9kZWxOYW1lICkhXG5cbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCApIHJldHVybiB0aGlzLnVuZGVmaW5lZElmRGVsZXRlZCh0cmFja2VkKVxuICAgIFxuICAgIGNvbnN0IGVudGl0eSA9IGF3YWl0IHRoaXMubG9hZEVudGl0eUJ5S2V5KCBtb2RlbE5hbWUsIGtleSApXG4gICAgaWYgKCBlbnRpdHkgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcbiAgICBcbiAgICB0aGlzLnNlc3Npb25DYWNoZS5wdXQoIG1vZGVsTmFtZSwga2V5LCBlbnRpdHkgKVxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSksIGVudGl0eSkgYXMgVEVudGl0eSAgXG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nQ2hhbmdlcygpXG4gIH1cblxuICBwdWJsaWMgbG9hZENhY2hlZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgLCB0cmFjayA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuXG4gICAgY29uc3QgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCAmJiB0cmFjayApIHJldHVybiB0aGlzLnVuZGVmaW5lZElmRGVsZXRlZCh0cmFja2VkKVxuXG4gICAgY29uc3QgZW50aXR5ID0gdGhpcy5zZXNzaW9uQ2FjaGUuZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZSwga2V5KVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgfHwgISB0cmFjayApIHJldHVybiBlbnRpdHlcblxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHNjaGVtYSwgZW50aXR5KSBhcyBURW50aXR5IFxuICB9XG5cbiAgcHVibGljIGxvY2tJblRoaXNTZXNzaW9uKCBsb2NrTmFtZTogc3RyaW5nLCBub3RUaHJvdyA9IGZhbHNlICkgOiBib29sZWFuIHtcbiAgICBpZiAoICF0aGlzLmhvbGRMb2Nrcy5oYXMoIGxvY2tOYW1lICkgKSB7XG4gICAgICB0aGlzLmhvbGRMb2Nrcy5zZXQoIGxvY2tOYW1lLCB0aGlzLmVudGl0eVRyYWNrZXIuaXNDb25maXJtaW5nIClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCAhbm90VGhyb3cgKSB0aHJvdyBuZXcgRXJyb3IoYCR7bG9ja05hbWV9IGV4aXN0cyBhbHJlYWR5YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3Igc2F2ZUNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlQ2hhbmdlcyhzZXJpYWw/IDogbnVtYmVyKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgcmV0U2VyaWFsID0gc2VyaWFsIHx8ICsrdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICBcbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZENoYW5nZVNxbHMoKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKCBzcWxzIClcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG4gICAgICBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5hY2NlcHRDaGFuZ2VzKCByZXRTZXJpYWwgKSBcbiAgICAgIHRoaXMuaG9sZExvY2tzLmNsZWFyKClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHJldFNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgICByZXR1cm4gcmV0U2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucmVqZWN0Q2hhbmdlcygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUm9sbGJhY2sgc2F2ZWQgY2hhbmdlc1xuICAgKiBAcGFyYW0gY2hhbmdlc05PICx0aGlzIHZhbHVlIHNob3VsZCBiZSByZXR1cm5lZCBieSBAc2VlIHNhdmVDaGFuZ2VzKCkgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tDaGFuZ2VzKCBzZXJpYWw6IG51bWJlciApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmKCB0aGlzLnNlc3Npb25TZXJpYWwgPD0gc2VyaWFsICkgcmV0dXJuIHRoaXMuc2Vzc2lvblNlcmlhbFxuXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzICggc2VyaWFsID0gJHtzZXJpYWx9IClgKVxuXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoc2VyaWFsICsgMSlcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkgeyAgICAgIFxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaChzcWxzKSBcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG5cbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yb2xsYmFja0NoYW5nZXMoc2VyaWFsICsgMSlcbiAgICAgIHRoaXMuaG9sZExvY2tzLmNsZWFyKClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgKVxuICAgICAgcmV0dXJuIHRoaXMuc2Vzc2lvblNlcmlhbFxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbDogbnVtYmVyICkge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuY2xlYXJIaXN0b3J5KCBzZXJpYWwgKVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmhpc3RvcnlWZXJzaW9uXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICAvLyBkbyBub3RoaW5nIC5cbiAgfVxuXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja0RlbGV0ZSgoZW50aXR5IGFzIE9iamVjdCBhcyBFbnRpdHlFeHRlbnNpb24pLl9fc2NoZW1hX18sICBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFuc2FjdGlvbigpIDogUHJvbWlzZTxEQlRyYW5zYWN0aW9uPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgfSAgXG5cbiAgcHVibGljIGJlZ2luRW50aXR5VHJhbnNhY3Rpb24oKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5iZWdpbkNvbmZpcm0oKVxuICB9XG5cbiAgcHVibGljIGNvbW1pdEVudGl0eVRyYW5zYWN0aW9uKCkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuY29uZmlybSgpIFxuICAgIHRoaXMuaG9sZExvY2tzLmZvckVhY2goICh2LCBrKSA9PiB0aGlzLmhvbGRMb2Nrc1trXSA9IGZhbHNlIClcbiAgfVxuXG4gIHB1YmxpYyByb2xsYmFja0VudGl0eVRyYW5zYWN0aW9uKCkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuY2FuY2VsQ29uZmlybSgpXG4gICAgXG4gICAgbGV0IHJlbW92ZUtleXMgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgdGhpcy5ob2xkTG9ja3MuZm9yRWFjaCggKHYsIGspID0+IHJlbW92ZUtleXMucHVzaChrKSApXG4gICAgcmVtb3ZlS2V5cy5mb3JFYWNoKCBrID0+IHRoaXMuaG9sZExvY2tzLmRlbGV0ZShrKSlcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBMUlUgZnJvbSAnbHJ1LWNhY2hlJ1xuaW1wb3J0IHsgRW50aXR5LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBLZXlPYmplY3QsIEZpbHRlckZ1bmN0aW9uLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzRnVuY3Rpb24sIGlzU3RyaW5nIH0gZnJvbSAndXRpbCc7XG5cbi8qKlxuICogY2FjaGUgb3B0aW9uc1xuICovXG5leHBvcnQgdHlwZSBFbnRpdHlDYWNoZU9wdGlvbnMgPSB7IFxuICBkZWZhdWx0IDogbnVtYmVyLFxuICBbbW9kZWw6IHN0cmluZ106ICBudW1iZXIgfCAoICggbW9kZWw6IHN0cmluZyApID0+IG51bWJlciApXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2FjaGUge1xuICBtb2RlbHMgOiBBcnJheTxzdHJpbmc+XG4gIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZFxuICBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PlxuICBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCAgZW50aXR5OiBFbnRpdHkpIDogdm9pZFxuICBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkXG4gIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiAgXG4gIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIExSVUVudGl0eUNhY2hlIGltcGxlbWVudHMgRW50aXR5Q2FjaGUge1xuICBwcml2YXRlIHN0YXRpYyBNSU5fQ0FDSEVEX0NPVU5UID0gMTAwXG4gIHByaXZhdGUgc3RhdGljIERFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UID0gMTAwMDBcblxuICBwcml2YXRlIG9wdGlvbnM6IEVudGl0eUNhY2hlT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIG1vZGVsQ2FjaGVzIDogTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHsgZGVmYXVsdCA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UIH1cbiAgICAvLyBmb3IoIGxldCBrIGluIHRoaXMub3B0aW9ucyApIFxuICAgIC8vICAgdGhpcy5vcHRpb25zW2tdID0gaXNOdW1iZXIodGhpcy5vcHRpb25zW2tdKSA/IHRoaXMub3B0aW9uc1trXSA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKExSVUVudGl0eUNhY2hlLm5hbWUpXG4gICAgdGhpcy5tb2RlbENhY2hlcyA9IG5ldyBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PigpXG4gIH1cblxuICBwcml2YXRlIGdldE1vZGVsQ2FjaGUobW9kZWxOYW1lIDogc3RyaW5nLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlLCB0aHJvd0lmTm90RXhpc3RzID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TFJVLkNhY2hlPEVudGl0eUtleSwgRW50aXR5Pj4ge1xuICAgIGlmICggY3JlYXRlSWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIHsgXG4gICAgICAvLyBjb25zdCBvcHRpb25zID0ge1xuICAgICAgLy8gICBtYXg6IDUwMCxcbiAgICAgIC8vICAgbGVuZ3RoOiBmdW5jdGlvbiAobiwga2V5KSB7IHJldHVybiBuICogMiArIGtleS5sZW5ndGggfSxcbiAgICAgIC8vICAgLy9kaXNwb3NlOiBmdW5jdGlvbiAoa2V5LCBuKSB7IG4uY2xvc2UoKSB9LFxuICAgICAgLy8gICBtYXhBZ2U6IDEwMDAgKiA2MCAqIDYwIFxuICAgICAgLy8gfVxuICAgICAgbGV0IG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuICAgICAgaWYgKCAhdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KG1vZGVsTmFtZSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdFxuICAgICAgZWxzZSBpZiAoIGlzTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IE51bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSlcbiAgICAgIGVsc2UgaWYgKCBpc0Z1bmN0aW9uKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSlcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSAoIHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdIGFzIChtb2RlbCk9PiBudW1iZXIgKSggbW9kZWxOYW1lIClcbiAgICAgIGVsc2UgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgICAgbWF4Q2FjaGVkQ291bnQgPSBNYXRoLm1heCggTFJVRW50aXR5Q2FjaGUuTUlOX0NBQ0hFRF9DT1VOVCwgbWF4Q2FjaGVkQ291bnQgKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5zZXQobW9kZWxOYW1lLCBuZXcgTFJVPHN0cmluZywgRW50aXR5PiggbWF4Q2FjaGVkQ291bnQgKSApXG4gICAgfVxuICAgICBpZiAoIHRocm93SWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIFxuICAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kZWwgY2FjaGUgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKSAgZG9lcyBub3QgZXhpc3RzYCkgXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5tb2RlbENhY2hlcy5nZXQobW9kZWxOYW1lKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldENhY2hlS2V5KCBrZXk6IEVudGl0eUtleSApIDogbnVtYmVyIHwgc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmltaXRpdmVLZXkoa2V5KSA/IGtleSBhcyBudW1iZXIgfCBzdHJpbmcgOiAoIGtleSBhcyBLZXlPYmplY3QgKS5rZXlcbiAgfVxuXG4gIHB1YmxpYyBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWQgeyAgICBcbiAgICBpZiAoIGlzU3RyaW5nKG1vZGVsTmFtZSkgKSB7XG4gICAgICB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIHRydWUgKSEucmVzZXQoKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5kZWxldGUoIG1vZGVsTmFtZSApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICggbGV0IGMgb2YgdGhpcy5tb2RlbENhY2hlcy52YWx1ZXMoKSApIHtcbiAgICAgIGMucmVzZXQoKVxuICAgIH1cbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxzKCkgOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICBmb3IoIGxldCBtIG9mIHRoaXMubW9kZWxDYWNoZXMua2V5cygpICkge1xuICAgICAgcmVzdWx0LnB1c2goIG0gKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcblxuICAgIHJldHVybiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSA/IHVuZGVmaW5lZCA6XG4gICAgICBtb2RlbENhY2hlIS5oYXMoY2FjaGVLZXkpID8gbW9kZWxDYWNoZSEuZ2V0KGNhY2hlS2V5KSBhcyBURW50aXR5IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBsZXQgY2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSApXG4gICAgaWYgKCBjYWNoZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY2FjaGUuZm9yRWFjaCggZSA9PiB7XG4gICAgICAoIWZpbHRlciB8fCAoZmlsdGVyICYmIGZpbHRlciggZSBhcyBURW50aXR5ICkpKSAmJiByZXN1bHQucHVzaCggZSBhcyBURW50aXR5ICkgXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgZW50aXR5OiBFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBwdXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2tleX0sIGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX1gKSAgICBcbiAgICB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lLCB0cnVlKSEuc2V0KHRoaXMuZ2V0Q2FjaGVLZXkoa2V5KSwgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWQge1xuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBldml0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtjYWNoZUtleX1gKVxuXG4gICAgY29uc3QgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgaWYgKG1vZGVsQ2FjaGUpIG1vZGVsQ2FjaGUuZGVsKGNhY2hlS2V5KVxuICB9XG4gIFxuICBwdWJsaWMgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXQobW9kZWxOYW1lLCAgdGhpcy5nZXRDYWNoZUtleSgga2V5ICkpICE9PSB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCBmYWxzZSApICE9PSB1bmRlZmluZWRcbiAgfVxuXG5cbiAgcHVibGljIGR1bXBDYWNoZSgpIDogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIENBQ0hFICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmZvckVhY2goIChjYWNoZSwgbW9kZWwpID0+IHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS1Nb2RlbCAke21vZGVsfS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgY2FjaGUuZm9yRWFjaCggKCBlbnRpdHksIGtleSApID0+IHtcbiAgICAgICAgcmVzdWx0ICs9IGBrZXkgPSAke3RoaXMuZ2V0Q2FjaGVLZXkoIGtleSApfSwgZW50aXR5ID0geyR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX19IFxcbmBcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICB9KSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxufSIsImltcG9ydCAqIGFzIHNkYiBmcm9tICcuL1NtYXJ0REInXG5pbXBvcnQgKiBhcyBtb2RlbCBmcm9tICcuL01vZGVsJ1xuaW1wb3J0ICogYXMgYmxvY2sgZnJvbSAnLi9CbG9jaydcbmltcG9ydCAqIGFzIHNlc3Npb24gZnJvbSAnLi9EYlNlc3Npb24nXG5pbXBvcnQgKiBhcyBzcWxpdGUgZnJvbSAnLi9TUUxEQi9TcWxpdGVDb25uZWN0aW9uJ1xuaW1wb3J0ICogYXMgY29ubiBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcblxuZXhwb3J0IG5hbWVzcGFjZSBBc2NoQ29yZSB7XG4gIGV4cG9ydCBjb25zdCBTbWFydERCID0gc2RiLlNtYXJ0REJcbiAgZXhwb3J0IGNvbnN0IE1vZGVsU2NoZW1hID0gbW9kZWwuTW9kZWxTY2hlbWFcbiAgZXhwb3J0IHR5cGUgQmxvY2sgPSBibG9jay5CbG9ja1xuICBleHBvcnQgY29uc3QgRGJTZXNzaW9uID0gc2Vzc2lvbi5EYlNlc3Npb25cbiAgZXhwb3J0IHR5cGUgRGJDb25uZWN0aW9uID0gY29ubi5EYkNvbm5lY3Rpb25cbiAgZXhwb3J0IGNvbnN0IFNxbGl0ZUNvbm5lY3Rpb24gPSBzcWxpdGUuU3FsaXRlQ29ubmVjdGlvblxufSBcbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgQ2FsbGJhY2ssIE1heWJlVW5kZWZpbmVkfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgKiBhcyBzdWIgZnJvbSAnbGV2ZWwtc3VibGV2ZWwnXG5cbmNvbnN0IGxldmVsID0gcmVxdWlyZSgnbGV2ZWwnKVxuY29uc3QgU2Vub25kYXJ5ID0gcmVxdWlyZSgnbGV2ZWwtc2Vjb25kYXJ5JylcblxuZXhwb3J0IHR5cGUgR2V0SW5kZXhWYWx1ZUZ1bmMgPSAoa2V5OiBhbnksIHZhbHVlOiBKc29uT2JqZWN0KSA9PiBhbnlcbmV4cG9ydCB0eXBlIEluZGV4RmllbGQgPSB7IGZpZWxkTmFtZTogc3RyaW5nLCBjYWxjSW5kZXg/OiBHZXRJbmRleFZhbHVlRnVuYyB9XG5cbmV4cG9ydCBjbGFzcyBTdWJMZXZlbE1ldGEge1xuICBwdWJsaWMgc3ViTmFtZTogc3RyaW5nXG4gIHB1YmxpYyBrZXlGaWVsZCA6IHN0cmluZ1xuICBwdWJsaWMgaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkOiBzdHJpbmcsIGluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkpIHtcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdChpbmRleEZpZWxkcylcbiAgfVxuXG4gIHByaXZhdGUgZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXhGaWVsZHMuZmluZEluZGV4KGl0ZW0gPT4gZmllbGROYW1lID09PSBpdGVtLmZpZWxkTmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNJbmRleChmaWVsZE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpID4gLTFcbiAgfVxuXG4gIHB1YmxpYyBhZGRJbmRleChmaWVsZE5hbWUgOiBzdHJpbmcsIGNhbGNJbmRleCA6IEdldEluZGV4VmFsdWVGdW5jKTogdGhpcyB7XG4gICAgaWYgKHRoaXMuZXhpc3RzSW5kZXgoZmllbGROYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW5kZXggb2YgZmllbGQgJyR7ZmllbGROYW1lfScgYWxyZWFkeSBleGlzdHNgKVxuXG4gICAgdGhpcy5pbmRleEZpZWxkcy5wdXNoKHsgZmllbGROYW1lLCBjYWxjSW5kZXggfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUluZGV4KGZpZWxkTmFtZSk6IHRoaXMge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKVxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgdGhpcy5pbmRleEZpZWxkcy5zbGljZShpZHgsIDEpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2UoKSA6IENhbGxiYWNrPGFueT4ge1xuICBsZXQgY2FsbGJhY2tcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNhbGxiYWNrID0gKGVyciwgdmFsdWUpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSh2YWx1ZSlcbiAgfSlcbiAgY2FsbGJhY2sucHJvbWlzZSA9IHByb21pc2VcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGNhbGxiYWNrIDogQ2FsbGJhY2s8YW55PiB8IHVuZGVmaW5lZCApIDogeyBjYWxsYmFjazogQ2FsbGJhY2s8YW55PiwgcHJvbWlzZTogUHJvbWlzZTxhbnk+fG51bGwgfSB7XG4gIGxldCBwcm9taXNlID0gbnVsbFxuXG4gIGlmICggIWNhbGxiYWNrICkge1xuICAgIGNhbGxiYWNrID0gbWFrZVByb21pc2UoKVxuICAgIHByb21pc2UgPSBjYWxsYmFja1sncHJvbWlzZSddXG4gIH1cblxuICByZXR1cm57IGNhbGxiYWNrLCBwcm9taXNlIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbFJlYWRhYmxlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVTdHJlYW0ge1xuICBvbiggZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrIDogRnVuY3Rpb24gKSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbEdldCB7XG4gIGdldDxUPihrZXk6IGFueSwgb3B0aW9ucz86IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PikgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+Pik6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+XG59XG5cbmV4cG9ydCBjbGFzcyBMZXZlbERCIHsgIFxuICBwcml2YXRlIGRiRGlyIDogc3RyaW5nXG4gIHByaXZhdGUgc3ViTWV0YXMgOiBBcnJheTxTdWJMZXZlbE1ldGE+XG4gIHByaXZhdGUgc3ViTGV2ZWxzIDogTWFwPHN0cmluZywgSW5kZXhlZExldmVsPlxuICBwcml2YXRlIGxldmVsZGIgOiBhbnlcbiAgcHJpdmF0ZSBzdWJMZXZlbGRiIDogc3ViLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1Yih0aGlzLmxldmVsZGIpXG4gICAgdGhpcy5zdWJNZXRhcy5mb3JFYWNoKHMgPT4gdGhpcy5yZWdpc3RlclN1YkxldmVsKHMpKVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlclN1YkxldmVsKCBtZXRhOiBTdWJMZXZlbE1ldGEgKSB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbGRiLnN1YmxldmVsKG1ldGEuc3ViTmFtZSlcbiAgICBjb25zdCBpbmRleGVkU3ViID0gbmV3IEluZGV4ZWRTdWJMZXZlbChzdWIsIG1ldGEuc3ViTmFtZSwgbWV0YS5rZXlGaWVsZCwgLi4ubWV0YS5pbmRleEZpZWxkcykgICAgXG4gICAgdGhpcy5zdWJMZXZlbHMuc2V0KCBtZXRhLnN1Yk5hbWUsIGluZGV4ZWRTdWIpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzS2V5Tm90Rm91bmRFcnJvciggZXJyOiBFcnJvciApIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGVyciAmJiBlcnIubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHVibGljIGdldCBsZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiXG4gIH1cblxuICBwdWJsaWMgZ2V0U3ViTGV2ZWwoIHN1Yk5hbWU6IHN0cmluZyApIDogSW5kZXhlZExldmVsIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVscy5nZXQoc3ViTmFtZSlcbiAgICBpZiAoICFzdWIgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc3ViTGV2ZWwgbmFtZSA9ICcke3N1Yk5hbWV9J2ApXG5cbiAgICByZXR1cm4gc3ViXG4gIH1cblxuICBwdWJsaWMgb3BlbihvcGVuQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55Pik6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKG9wZW5DYWxsYmFjaylcblxuICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuICAgIFxuICAgIChhc3luYygpPT4geyBcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpICAgICAgXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyLCBzZWxmKVxuICAgICAgfVxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2xvc2VDYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KSA6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cblxuICBwdWJsaWMgZHVtcCgpIDogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXMsIHJlaikgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KCkgICAgICBcbiAgICAgIHRoaXMubGV2ZWxkYi5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICAgICAgLm9uKCdkYXRhJywgZGF0YSA9PiByZXN1bHQucHVzaChga2V5PSAke2RhdGEua2V5fSwgdmFsdWU9ICR7ZGF0YS52YWx1ZX1gKSApXG4gICAgICAgIC5vbignZXJyb3InLCBlID0+IHJlaihlKSApXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzKHJlc3VsdC5qb2luKCdcXHJcXG4nKSkgKVxuICAgIH0pXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgc3ViTGV2ZWxEYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5zdWJMZXZlbERiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzZW5vbmRhcnkgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHNlbm9uZGFyeSApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHByaXZhdGUga2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkPFQ+KCBjYWxsYmFjaz86IENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+PiApIDogTWF5YmVVbmRlZmluZWQ8Q2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+PiB7XG4gICAgcmV0dXJuICFjYWxsYmFjayA/IHVuZGVmaW5lZCA6ICggZXJyIDogRXJyb3IsIGRhdGE6IFQgKSA9PiB7XG4gICAgICBjYWxsYmFjayggIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKCBlcnIgKSA/IG51bGwgOiBlcnIgLCBkYXRhIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zOiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4gKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5zdWJMZXZlbERiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGdldENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCB0aGlzLmtleU5vdEZvdW5kVGhlblVuZGVmaW5lZChjYWxsYmFjaykpXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggTGV2ZWxEQi5pc0tleU5vdEZvdW5kRXJyb3IoZXJyKSA/IHVuZGVmaW5lZCA6IGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleCggaW5kZXhGaWVsZCApXG5cbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZ2V0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIGluZGV4TGV2ZWwuZ2V0PFQ+KGtleSwgdGhpcy5rZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQoY2FsbGJhY2spKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKGVycikgPyB1bmRlZmluZWQgOiBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdXQ8VD4oa2V5OiBhbnksIHZhbHVlOiBULCBwdXRDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2socHV0Q2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3ViTGV2ZWxEYi5wdXQoa2V5LCB2YWx1ZSwgY2FsbGJhY2spXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICBjYWxsYmFjayggZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhkZWxDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAgdGhpcy5zdWJMZXZlbERiLmRlbChrZXksIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJhdGNoKGFycmF5IDogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/IDogSnNvbk9iamVjdCwgYmF0Y2hDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApIHJldHVybiB0aGlzLnN1YkxldmVsRGIuYmF0Y2goKVxuXG4gICAgbGV0IGhhc09wdGlvbnMgPSBvcHRpb25zICYmICghaXNGdW5jdGlvbihvcHRpb25zKSlcbiAgICBsZXQgb3JnaW5hbENhbGxiYWNrID0gaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT5cbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soIG9yZ2luYWxDYWxsYmFjayApXG4gICAgdHJ5IHtcbiAgICAgIGlmIChoYXNPcHRpb25zKVxuICAgICAgICB0aGlzLnN1YkxldmVsRGIuYmF0Y2goYXJyYXksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgICAgZWxzZVxuICAgICAgICB0aGlzLnN1YkxldmVsRGIuYmF0Y2goYXJyYXksIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zKVxuICB9XG59XG4iLCJpbXBvcnQgeyBMZXZlbERCLCBJbmRleGVkTGV2ZWwsIFN1YkxldmVsTWV0YSB9IGZyb20gJy4vS1ZEQi9MZXZlbERCJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrSGVhZGVyIH0gZnJvbSAnLi9CbG9jaydcblxuY29uc3QgTEFTVF9CTE9DS19IRUlHSFRfS0VZID0gJ19fbGFzdF9ibG9ja19oZWlnaHRfXydcblxuZXhwb3J0IGNsYXNzIExldmVsQmxvY2sge1xuICBwcml2YXRlIGRiIDogTGV2ZWxEQlxuICBwcml2YXRlIGJsb2NrRGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBoaXN0b3J5RGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBsYXN0SGVpZ2h0IDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoIGRpciA6IHN0cmluZywgbGV2ZWxPcHRpb25zID0ge30gKSB7XG4gICAgLyogXG4gICAgICB7IGlkKDY0KSwgdGltZXN0YW1wKGJpZ2ludCksIGhlaWdodChiaWdpbnQpLCBwYXlsb2FkTGVuZ3RoKGJpZ2ludCksIHBheWxvYWRIYXNoKDY0KSwgcHJldkJsb2NrSWQoNjQpLCBcbiAgICAgICAgcG9pbnRJZCg2NCksIHBvaW50SGVpZ2h0KGJpZ2ludCksIGRlbGVnYXRlKDY0KSwgc2lnbmF0dXJlKDEyOCksIGNvdW50KGJpZ2ludCkgfVxuICAgICovXG4gICAgY29uc3QgYmxvY2tNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnYmxrJywgJ2hlaWdodCcsIFtcbiAgICAgIHsgZmllbGROYW1lOiAnaWQnIH0sIFxuICAgICAgeyBmaWVsZE5hbWU6ICdkZWxlZ2F0ZScgfVxuICAgIF0pXG4gICAgY29uc3QgY2hhbmdlc0xvZ01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdoaXMnLCAnaGVpZ2h0JywgW10pXG4gICAgXG4gICAgdGhpcy5kYiA9IG5ldyBMZXZlbERCKCBkaXIsIFtibG9ja01ldGEsIGNoYW5nZXNMb2dNZXRhXSwgbGV2ZWxPcHRpb25zIClcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSAtMVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgbGFzdEJsb2NrSGVpZ2h0SXRlbSA9IGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwge30pIFxuICAgIGlmICggbGFzdEJsb2NrSGVpZ2h0SXRlbSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbGFzdEJsb2NrSGVpZ2h0SXRlbSA9IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oIC0xIClcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5wdXQoTEFTVF9CTE9DS19IRUlHSFRfS0VZLCBsYXN0QmxvY2tIZWlnaHRJdGVtKVxuICAgIH1cbiAgICByZXR1cm4gbGFzdEJsb2NrSGVpZ2h0SXRlbS5oZWlnaHQgIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIG9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5vcGVuKClcbiAgICB0aGlzLmJsb2NrRGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdibGsnKVxuICAgIHRoaXMuaGlzdG9yeURiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnaGlzJylcbiAgICB0aGlzLmxhc3RIZWlnaHQgPSBhd2FpdCB0aGlzLmdldExhc3RCbG9ja0hlaWdodEZyb21EYigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5jbG9zZSgpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGxhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHsgXG4gICAgcmV0dXJuIHRoaXMubGFzdEhlaWdodCBcbiAgfVxuXG4gIHByaXZhdGUgaXNLZXlOb3RGb3VuZEVycm9yKGUpIDogYm9vbGVhbiB7IFxuICAgIHJldHVybiBlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFzdEhlaWdodEpzb24oIGxhc3RIZWlnaHQ6IG51bWJlciApIDogQmxvY2tIZWFkZXIge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQgOiBsYXN0SGVpZ2h0LFxuICAgICAgaWQgOiAnTlVMTCcsXG4gICAgICBkZWxlZ2F0ZSA6ICdOVUxMJ1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhcHBlbmRCbG9jayggYmxvY2sgOiBCbG9ja0hlYWRlciwgY2hhbmdlczogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+ICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghYmxvY2sgfHwgIWJsb2NrLmlkIHx8ICFibG9jay5kZWxlZ2F0ZSB8fCBibG9jay5oZWlnaHQgPT09IHVuZGVmaW5lZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBibG9jayBkYXRhYClcblxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLnB1dChibG9jay5oZWlnaHQsIGNoYW5nZXMpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IGJsb2NrLmhlaWdodCwgdmFsdWU6IGJsb2NrIH0sXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHZhbHVlOiB0aGlzLmdldExhc3RIZWlnaHRKc29uKGJsb2NrLmhlaWdodCkgfVxuICAgXSlcblxuICAgIHRoaXMubGFzdEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oIGhlaWdodCAtIDEgKSB9IFxuICAgIF0pXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIuZGVsKCBoZWlnaHQgKVxuICAgIFxuICAgIHRoaXMubGFzdEhlaWdodCAtLVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZyApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldEJ5PEJsb2NrSGVhZGVyPignaWQnLCBibG9ja0lkKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKVxuICAgIGZvciggbGV0IGggPSBtaW5IZWlnaHQgOyBoIDw9IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9jayhoKVxuICAgICAgYmxvY2sgJiYgcmVzdWx0LnB1c2goIGJsb2NrISApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXQgID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBibG9ja0lkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2tCeUlkKCBibG9ja0lkc1tpXSApXG4gICAgICBibG9jayAmJiByZXQucHVzaCggYmxvY2sgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG4gIH1cbn0iLCJleHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIEFsbCAgICA9IDEyOCAtIDEsXG4gIFRyYWNlICA9IDY0LFxuICBEZWJ1ZyAgPSAzMixcbiAgTG9nICAgID0gMTYsXG4gIEluZm8gICA9IDgsXG4gIFdhcm4gICA9IDQsXG4gIEVycm9yICA9IDIsXG4gIEZhdGFsICA9IDEsXG4gIE5vbmUgICA9IDBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2dMZXZlbCA6IExvZ0xldmVsXG4gIHJlYWRvbmx5IGluZm9FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgdHJhY2VFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSBsb2dFbmFibGVkICAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGRlYnVnRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgd2FybkVuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBlcnJvckVuYWxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGZhdGFsRW5hYmxlZCA6IGJvb2xlYW5cblxuICB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgd2FybiggbXNnOiBzdHJpbmcgLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG4gIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG59XG5cbmNsYXNzIExvZ2dlckFkYXB0ZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBwcml2YXRlIGxldmVsIDogTG9nTGV2ZWxcbiAgcHJpdmF0ZSBuYW1lIDogc3RyaW5nXG4gIHByaXZhdGUgZm9ybWF0IDogYm9vbGVhblxuICBwcml2YXRlIGdldExvZ2dlciA6ICgpID0+IExvZ2dlclxuXG4gIHB1YmxpYyBnZXQgaW5mb0VuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5JbmZvKSAgPiAwIH1cbiAgcHVibGljIGdldCB0cmFjZUVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLlRyYWNlKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGRlYnVnRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRGVidWcpID4gMCB9XG4gIHB1YmxpYyBnZXQgbG9nRW5hYmxlZCgpICAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5Mb2cpICAgPiAwIH1cbiAgcHVibGljIGdldCB3YXJuRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLldhcm4pICA+IDAgfVxuICBwdWJsaWMgZ2V0IGVycm9yRW5hbGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRXJyb3IpID4gMCB9XG4gIHB1YmxpYyBnZXQgZmF0YWxFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5GYXRhbCkgPiAwIH1cblxuICBwdWJsaWMgZ2V0IGxvZ0xldmVsKCkgeyByZXR1cm4gdGhpcy5sZXZlbCB9XG4gIHB1YmxpYyBzZXQgbG9nTGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHsgdGhpcy5sZXZlbCA9IGxldmVsIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoZ2V0TG9nZ2VyOiAoKSA9PiBMb2dnZXIsIGZvcm1hdE1lc3NhZ2UgPSBmYWxzZSwgbG9nZ2VyTmFtZTogc3RyaW5nLCBsZXZlbCA9IExvZ0xldmVsLkFsbCApIHtcbiAgICB0aGlzLm5hbWUgPSBsb2dnZXJOYW1lXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gICAgdGhpcy5nZXRMb2dnZXIgPSBnZXRMb2dnZXJcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdE1lc3NhZ2VcbiAgfVxuXG4gIHByb3RlY3RlZCBmcm9tYXRNZXNzYWdlKCBtc2c6IHN0cmluZywgbG9nVHlwZTogc3RyaW5nICkgOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSBbJHtsb2dUeXBlfV0gWyR7dGhpcy5uYW1lfV0gJHttc2d9YFxuICB9XG5cbiAgcHVibGljIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnSU5GTycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuaW5mbyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0RFQlVHJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdMT0cnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnVFJBQ0UnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgd2FybiggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdXQVJOJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS53YXJuKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdFUlJPUicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG5cbiAgcHVibGljIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRkFUQUwnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTG9nTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dMZXZlbCA9IExvZ0xldmVsLkFsbFxuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVMb2dnZXIgPSAoKSA9PiAgY29uc29sZSBhcyBPYmplY3QgYXMgTG9nZ2VyIFxuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nZ2VyID0gbmV3IExvZ2dlckFkYXB0ZXIoIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCAnZGVmYXVsdCcsIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsIClcblxuICBwdWJsaWMgc3RhdGljIHNldCBkZWZhdWx0TGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHtcbiAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCA9IGxldmVsXG4gIH1cbiAgXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGxvZ0ZhY3RvcnkgKCB2YWx1ZTogKCkgPT4gTG9nZ2VyICkge1xuICAgIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyID0gdmFsdWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TG9nZ2VyKGxvZ2dlck5hbWU/OiBzdHJpbmcsIGxldmVsPyA6IExvZ0xldmVsKSA6IExvZ2dlciB7XG4gICAgcmV0dXJuIGxvZ2dlck5hbWUgPyBcbiAgICAgIG5ldyBMb2dnZXJBZGFwdGVyKExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCBsb2dnZXJOYW1lLCBsZXZlbCB8fCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCkgOiBcbiAgICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ2dlcjtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBLZXlPYmplY3QsIENvZGVDb250cmFjdCBhcyBEQkMsIHBhcnRpYWwsIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0geyBuZXcoKSA6IFQgfVxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ID0gc3RyaW5nIHwgQ29uc3RydWN0b3I8VEVudGl0eT5cblxuZXhwb3J0IGVudW0gRmllbGRUeXBlcyB7XG4gIFN0cmluZyAgID0gJ1N0cmluZycsXG4gIE51bWJlciAgID0gJ051bWJlcicsXG4gIEJpZ0ludCAgID0gJ0JpZ0ludCcsXG4gIFRleHQgICAgID0gJ1RleHQnXG59XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IHN0cmluZyB8IEZpZWxkVHlwZXNcblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZCB7XG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogRmllbGRUeXBlLFxuICBsZW5ndGg/OiBudW1iZXIgLFxuICBpbmRleD86IGJvb2xlYW4sXG4gIG5vdF9udWxsPzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgY29tcG9zaXRlX2tleT8gOiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUga2V5T2JqZWN0IDogSnNvbk9iamVjdFxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcigga2V5T2JqZWN0IDogSnNvbk9iamVjdCApIHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlPYmplY3QnLCAoKSA9PiBEQkMubm90TnVsbChrZXlPYmplY3QpKVxuXG4gICAgdGhpcy5rZXlPYmplY3QgPSBrZXlPYmplY3RcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbWFrZTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogVEVudGl0eSApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCAoKSA9PiBEQkMubm90TnVsbChzY2hlbWEpKVxuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsIHNjaGVtYS5pc0NvbXBzaXRlS2V5LCAnbW9kZWwgbXVzdCBpbmRlbnRpZnkgYnkgY29tcG9zaXRlIGtleScpXG4gICAgREJDLmFyZ3VtZW50KCAnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KCBwYXJ0aWFsKGVudGl0eSwgc2NoZW1hLmNvbXBvc2l0ZUtleXMpIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZygga2V5SnNvblN0cmluZzogc3RyaW5nICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleUpzb25TdHJpbmcnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShrZXlKc29uU3RyaW5nKSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KEpTT04ucGFyc2UoIGtleUpzb25TdHJpbmcgKS5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleUpzb24oKSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmtleU9iamVjdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBvc2l0ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCEga2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBrZXkua2V5SnNvblxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgcEtleTogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPlxuICBwcml2YXRlIGNLZXlzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMuYXR0YWNoVmVyc2lvbkZpZWxkKCB0aGlzLnNjaGVtYSApXG4gICAgdGhpcy5wYXJzZUZpZWxkcygpXG4gIH1cblxuICBwcml2YXRlIGF0dGFjaFZlcnNpb25GaWVsZCggc2NoZW1hIDogU2NoZW1hICkge1xuICAgIGlmICggc2NoZW1hLnRhYmxlRmllbGRzLmZpbmQoIGYgPT4gZi5uYW1lID09PSAnX3ZlcnNpb25fJykgKSByZXR1cm5cbiAgICBzY2hlbWEudGFibGVGaWVsZHMucHVzaCh7XG4gICAgICBuYW1lOiAnX3ZlcnNpb25fJyxcbiAgICAgIHR5cGU6IEZpZWxkVHlwZXMuTnVtYmVyLFxuICAgICAgZGVmYXVsdDogMCAgICAgXG4gICAgfSlcbiAgfVxuXG4gIHByaXZhdGUgY29udmVydFR5cGUoIHR5cGUgOiBGaWVsZFR5cGUgKSA6IHN0cmluZyB7IFxuICAgIHJldHVybiB0eXBlXG4gIH1cbiAgXG4gIHByaXZhdGUgcGFyc2VGaWVsZHMoKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBwcmltYXJ5S2V5cyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlcihmID0+IGYucHJpbWFyeV9rZXkgPT09IHRydWUgKSAubWFwKCBmPT4gZi5uYW1lIClcbiAgICB0aGlzLmNLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5jb21wb3NpdGVfa2V5ID09PSB0cnVlICkubWFwKCBmPT4gZi5uYW1lIClcblxuICAgIHRoaXMucEtleSA9IHByaW1hcnlLZXlzLmxlbmd0aCA9PT0gMSA/IHByaW1hcnlLZXlzWzBdIDogdW5kZWZpbmVkXG5cbiAgICBsZXQga2V5VmFsaWQgPSAoIHRoaXMucEtleSAhPT0gdW5kZWZpbmVkICkgIT09ICggdGhpcy5jS2V5cy5sZW5ndGggPiAxICkgXG4gICAgaWYgKCAha2V5VmFsaWQgKSB0aHJvdyBuZXcgRXJyb3IoYG1vZGVsIG11c3QgaGF2ZSBwcmltYXJ5IGtleSBvciBjb21wb3NpdGUga2V5cywgYnV0IGNhbiBub3QgYm90aGApXG5cbiAgICB0aGlzLmFsbEZpZWxkVHlwZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpXG4gICAgdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZm9yRWFjaCggZiA9PiB0aGlzLmFsbEZpZWxkVHlwZXMuc2V0KCBmLm5hbWUsIHRoaXMuY29udmVydFR5cGUoZi50eXBlKSkgKVxuICAgIHRoaXMuYWxsRmllbGRzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMubWFwKCBmID0+IGYubmFtZSlcbiAgICB0aGlzLmFsbEluZGV4ZXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5pbmRleCA9PT0gdHJ1ZSApLm1hcCggZiA9PiBmLm5hbWUgKVxuICB9XG5cbiAgcHVibGljIGdldEZpZWxkVHlwZXMoc2NoZW1hOiBTY2hlbWEpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZFR5cGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjaGVtYU9iamVjdCgpIDogU2NoZW1hIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb21wc2l0ZUtleSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9zaXRlS2V5cy5sZW5ndGggPiAxIFxuICB9XG5cbiAgcHVibGljIGdldCBwcmltYXJ5S2V5KCkgOiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5wS2V5XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbXBvc2l0ZUtleXMoKSA6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5jS2V5c1xuICB9XG5cbiAgcHVibGljIGdldCBmaWVsZE5hbWVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZHNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsSW5kZXhlc1xuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbE5hbWUoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubmFtZVxuICB9XG5cbiAgcHVibGljIGdldCBpc0xvY2FsKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sb2NhbFxuICB9XG5cbiAgcHVibGljIGdldCBpc1JlYWRvbmx5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5yZWFkb25seVxuICB9XG5cbiAgcHVibGljIGdldCBtZW1DYWNoZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1lbW9yeVxuICB9XG5cbiAgcHVibGljIHNldEtleTxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBrZXk6IEVudGl0eUtleSApIDogVEVudGl0eSB7XG4gICAgaWYgKCAhdGhpcy5pc0NvbXBzaXRlS2V5ICkge1xuICAgICAgZW50aXR5W3RoaXMucHJpbWFyeUtleSFdID0ga2V5XG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGNrID0ga2V5IGFzIENvbXBvc2l0ZUtleVxuICAgICAgdGhpcy5jS2V5cy5mb3JFYWNoKCBmID0+IGVudGl0eVtmXSA9IGNrLmtleUpzb25bZl0gKVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgZ2V0S2V5PFRFbnRpdHk+KGVudGl0eSA6IFRFbnRpdHkpIDogRW50aXR5S2V5IHtcbiAgICByZXR1cm4gdGhpcy5pc0NvbXBzaXRlS2V5ID8gXG4gICAgICBDb21wb3NpdGVLZXkubWFrZSggdGhpcywgZW50aXR5ICkgOlxuICAgICAgZW50aXR5W3RoaXMucHJpbWFyeUtleSFdXG4gIH1cblxuICBwdWJsaWMgbmV3RW50aXR5PFRFbnRpdHk+ICggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5IDogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBsZXQgZW50aXR5ID0gaXNTdHJpbmcobW9kZWwpID8gXG4gICAgICB7IH0gYXMgVEVudGl0eSA6IFxuICAgICAgbmV3ICggbW9kZWwgYXMgQ29uc3RydWN0b3I8VEVudGl0eT4gKSgpXG5cbiAgICByZXR1cm4gdGhpcy5zZXRLZXkoIGVudGl0eSwga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBjb3B5UHJvcGVydGllczxURW50aXR5PiggZGVzdDogVEVudGl0eSwgc3JjIDogVEVudGl0eSwgaW5jbHVkZUtleSA9IGZhbHNlICkge1xuICAgIHRoaXMuYWxsRmllbGRzLmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IG5lZWRDb3B5ID0gIWluY2x1ZGVLZXkgJiYgKCB0aGlzLmNLZXlzLmluZGV4T2YoZikgPj0gMCB8fCBmID09PSB0aGlzLnByaW1hcnlLZXkgKSAmJiBzcmNbZl0gIT09IHVuZGVmaW5lZFxuICAgICAgaWYgKCBuZWVkQ29weSApIHJldHVybiBcbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogQXJyYXk8c3RyaW5nPlxuICBidWlsZEluc2VydCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFVwZGF0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmUgOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbn1cblxuZXhwb3J0IGNsYXNzIEpzb25TcWxCdWlsZGVyIGltcGxlbWVudHMgU3FsQnVpbGRlciB7XG5cbiAgcHJpdmF0ZSBnZXRUYWJsZU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY2hhbmdlQ2FzZS5zbmFrZUNhc2UobW9kZWxOYW1lKSArICdzJ1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmltYXJ5S2V5Q29uZGl0aW9uKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkgKCB7fSwgIGtleSApXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTY2hlbWEgKHNjaGVtYTogTW9kZWxTY2hlbWEpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgbGV0IHNxbHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpIFxuICAgIGNvbnN0IHNjaGVtYU9iamVjdCA9IE9iamVjdC5hc3NpZ24oeyB0eXBlOiAnY3JlYXRlJ30sIGRlZXBDb3B5KHNjaGVtYS5zY2hlbWFPYmplY3QpKSBcbiAgICAvLyBUT0RPOiBnZW5lcmF0ZSBjb21wb3NpdGUga2V5IHNxbFxuICAgIGxldCBzY2hlbWFTcWwgPSBKc29uU3FsLmJ1aWxkKHNjaGVtYU9iamVjdClcbiAgICBzcWxzLnB1c2goc2NoZW1hU3FsLnF1ZXJ5KVxuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBzY2hlbWEuaW5kZXhlcy5mb3JFYWNoKCBmaWVsZCA9PiB7XG4gICAgICBzcWxzLnB1c2goSnNvblNxbC5idWlsZCh7XG4gICAgICAgIHR5cGU6ICdpbmRleCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIG5hbWU6IHRhYmxlTmFtZSArICdfJyArIGZpZWxkLFxuICAgICAgICBpbmRleE9uOiBmaWVsZFxuICAgICAgfSkucXVlcnkpXG4gICAgfSlcblxuICAgIHJldHVybiBzcWxzXG4gIH1cblxuICBwdWJsaWMgYnVpbGRJbnNlcnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkluc2VydCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdpbnNlcnQnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgdmFsdWVzOiBmaWVsZFZhbHVlc1xuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkRlbGV0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICBjb25kaXRpb246IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFVwZGF0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpOiBTcWxBbmRQYXJhbWV0ZXJzIHsgICAgXG4gICAgLy8gY29uc3QgbW9kaWZpZXIgPSB0aGlzLmVzY2FwZVNpbmdsZVF1b3RlKGZpZWxkVmFsdWVzKVxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG5cbiAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbmRpdGlvblsnX3ZlcnNpb25fJ10gPSB2ZXJzaW9uICBcblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5VcGRhdGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIG1vZGlmaWVyOiBmaWVsZFZhbHVlcyxcbiAgICAgIGNvbmRpdGlvbjogY29uZGl0aW9uXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTZWxlY3Qoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzT3JQYXJhbXM6IEFycmF5PHN0cmluZz4gfCBKc29uT2JqZWN0LCB3aGVyZT8gOiBTcWxDb25kaXRpb24sIFxuICAgIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKTogU3FsQW5kUGFyYW1ldGVycyB7XG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIFxuICAgIGxldCBxdWVyeU9wdGlvbnMgOiBKc29uT2JqZWN0XG4gICAgaWYgKCAhaXNBcnJheSggZmllbGRzT3JQYXJhbXMgKSApIHtcbiAgICAgIGxldCBwYXJhbXMgPSBmaWVsZHNPclBhcmFtcyBhcyBKc29uT2JqZWN0XG4gICAgICBxdWVyeU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7IHR5cGU6ICdzZWxlY3QnLCB0YWJsZTogdGFibGVOYW1lIH0sIHBhcmFtcyApXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGZpZWxkcyA9IGZpZWxkc09yUGFyYW1zIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG4gICAgICBsZXQgbG8gOiBMaW1pdEFuZE9mZnNldCA9IGlzTnVtYmVyKCByZXN1bHRSYW5nZSApID8gIHsgbGltaXQgOiByZXN1bHRSYW5nZSB9IDogcmVzdWx0UmFuZ2UgfHwgeyB9XG4gICAgICBsZXQgb3JkZXIgPSBzb3J0IHx8IHt9XG4gICAgICBmb3IgKCBsZXQga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhvcmRlcikgICkge1xuICAgICAgICBsZXQgb3JkZXJWYWx1ZSA9IG9yZGVyW2tleV0gfHwgLTFcbiAgICAgICAgb3JkZXJba2V5XSA9IChvcmRlclZhbHVlID09PSAnQVNDJykgPyAxIDogKCAob3JkZXJWYWx1ZSA9PT0gJ0RFU0MnKSA/IC0xIDogb3JkZXJWYWx1ZSApXG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIGZpZWxkczogZmllbGRzLFxuICAgICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgICBsaW1pdDogbG8ubGltaXQsXG4gICAgICAgIG9mZnNldDogbG8ub2Zmc2V0LFxuICAgICAgICBzb3J0OiBvcmRlcixcbiAgICAgICAgam9pbjogam9pblxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuU2VsZWN0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZChxdWVyeU9wdGlvbnMpKVxuICB9XG59IiwiaW1wb3J0IHsgU3FsaXRlV3JhcHBlciB9IGZyb20gJy4vU3FsaXRlV3JhcHBlcidcbmltcG9ydCB7IE1VTFRJX1NRTF9TRVBBUkFUT1IsIFNxbEFuZFBhcmFtZXRlcnMsIFNxbFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24sIENvbm5lY3Rpb25PcHRpb25zLCBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5cblxuY2xhc3MgU3FsaXRlVHJhbnNhY3Rpb24gaW1wbGVtZW50cyBEQlRyYW5zYWN0aW9uIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbW1pdCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ0NPTU1JVDsnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0s7JykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OOycpXG4gICAgcmV0dXJuIG5ldyBTcWxpdGVUcmFuc2FjdGlvbih0aGlzKVxuICB9XG59IiwiaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nTWFuYWdlciwgTG9nZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgU3FsUGFyYW1ldGVycywgU3FsQW5kUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcblxuaW1wb3J0ICogYXMgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnXG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVXcmFwcGVyIHtcbiAgcHJpdmF0ZSBkYiA6IERhdGFiYXNlXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU3FsaXRlV3JhcHBlci5uYW1lKVxuICB9XG5cbiAgcHVibGljIG9wZW4oZGJGaWxlUGF0aDogc3RyaW5nLCBjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiRmlsZVBhdGgpXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAgKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRiLm9wZW4gfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luT3BlbihkYkZpbGVQYXRoOiBzdHJpbmcpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLm9wZW4pLmNhbGwodGhpcywgZGJGaWxlUGF0aClcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRoaXMuZGIgJiYgdGhpcy5pc0Nvbm5lY3RlZCApIHtcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpIFxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIGNsb3NlYCApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgY2xvc2VkIGFscmVhZHlgKVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBjbG9zZWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIGVmZmVjdGVkID0gJHtyZXQucmVzdWx0LnJvd3NFZmZlY3RlZH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxhbnk+PiApIDogQXJyYXk8YW55PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PGFueT4oKSB9XG4gICAgdHJ5IHtcbiAgICAgIHJldC5yZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5hbGwocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShzcWwhLnBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCByZXQuZXJyLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBFbnRpdHlLZXksIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciwgaXNDb21wb3NpdGVLZXkgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlQcm94eSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snXG5pbXBvcnQgeyBCbG9ja0NhY2hlIH0gZnJvbSAnLi9CbG9ja0NhY2hlJ1xuXG50eXBlIE5hbWVkSG9vazxURnVuYz4gPSB7IG5hbWU6IHN0cmluZywgaG9vayA6IFRGdW5jIH1cbmV4cG9ydCB0eXBlIENvbW1pdEJsb2NrSG9vayA9ICggYmxvY2sgOiBCbG9jayApID0+IHZvaWRcbmV4cG9ydCB0eXBlIFJvbGxiYWNrQmxvY2tIb29rID0gKCBmcm9tSGVpZ2h0IDogbnVtYmVyLCB0b0hlaWdodCA6IG51bWJlciApID0+IHZvaWRcblxuZXhwb3J0IHR5cGUgU21hcnREQk9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBjYWNoZWQgaGlzdG9yeSBjb3VudChibG9jayBjb3VudCksIHVzZWQgdG8gcm9sbGJhY2sgYmxvY2tcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGhpc3RvcnlGb3JSb2xsYmFjaz8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIGNsZWFuIHBlcnNpc3RlZCBoaXN0b3J5IGF1dG9tYXRpY2FsbHlcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9DbGVhblBlcnNpc3RlZEhpc3Rvcnk/IDogYm9vbGVhbixcblxuICAvKipcbiAgICogY2FjaGVkIGxhc3QgYmxvY2sgY291bnQgXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBjYWNoZWRCbG9ja0NvdW50PyA6IG51bWJlcixcblxuICAvKipcbiAgICogbWF4IGNhY2hlZCBlbnRpdHkgY291bnQsIGNvbmZpZyBpdCBwZXIgbW9kZWwsIExSVSAgXG4gICAqIHNhbXBsZTogeyBVc2VyOiAyMDAsIFRyYW5zOiA1MDAwIH0gbWF4IGNhY2hlZCAyMDBzIFVzZXIg77yMNTAwMCBmb3IgVHJhbnNcbiAgICogQGRlZmF1bHQgNTAwMCBlYWNoIG1vZGVsXG4gICAqL1xuICBlbnRpdHlDYWNoZU9wdGlvbnM/IDogRW50aXR5Q2FjaGVPcHRpb25zXG5cbn1cblxuLyoqXG4gKiBPUk0gbGlrZSB0byBvcGVyYXRlIGJsb2NrY2hhaW4gZGF0YVxuICogQGV2ZW50IHJlYWR5IGVtbWl0IGFmdGVyIGluaXRpYWxpemVkXG4gKiBAZXZlbnQgY2xvc2UgZW1taXQgYWZ0ZXIgY2xvc2VkXG4gKi9cbmV4cG9ydCBjbGFzcyBTbWFydERCIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBvcHRpb25zIDogU21hcnREQk9wdGlvbnNcbiAgcHJpdmF0ZSBjb21taXRCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj5cbiAgcHJpdmF0ZSByb2xsYmFja0Jsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+XG4gIHByaXZhdGUgY2FjaGVkQmxvY2tzIDogQmxvY2tDYWNoZVxuICBwcml2YXRlIHNjaGVtYXMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgYmxvY2tTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgbG9jYWxTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgYmxvY2tEQiA6IExldmVsQmxvY2tcbiAgcHJpdmF0ZSBjdXJyZW50QmxvY2sgOiBCbG9jayB8IG51bGxcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgXG4gICAqIE5PVElDIDogeW91IG5lZWQgY2FsbCBpbml0IGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gZGJQYXRoIHBhdGggb2YgYmxvY2tjaGFpbiBkYlxuICAgKiBAcGFyYW0gbGV2ZWxCbG9ja0RpciBwYXRoIG9mIGJsb2NrIGhlYWRlciBkYlxuICAgKiBAcGFyYW0gb3B0aW9ucyBvZiBTbWFydERCXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRiUGF0aDogc3RyaW5nLCBsZXZlbEJsb2NrRGlyOiBzdHJpbmcsIG9wdGlvbnM/IDogU21hcnREQk9wdGlvbnMgKSB7XG4gICAgREJDLmFyZ3VtZW50KCdkYlBhdGgnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGRiUGF0aCkpXG4gICAgREJDLmFyZ3VtZW50KCdsZXZlbEJsb2NrRGlyJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShsZXZlbEJsb2NrRGlyKSlcblxuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdGlvbnMgPSAge1xuICAgICAgY2FjaGVkQmxvY2tDb3VudCA6IDEwLFxuICAgICAgaGlzdG9yeUZvclJvbGxiYWNrIDogMTAsXG4gICAgICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5IDogZmFsc2UsICAgICAgXG4gICAgICBlbnRpdHlDYWNoZU9wdGlvbnMgOiB7IGRlZmF1bHQgOiA1MDAwIH1cbiAgICB9IHx8IG9wdGlvbnNcblxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj4oKVxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+KClcbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgcHJpdmF0ZSBwcmVDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBibG9jayApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdENvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5lbWl0KCduZXdCbG9jaycsIGJsb2NrKVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBmcm9tLCB0byApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdFJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMuZW1pdCgncm9sbGJhY2tCbG9jaycsIHsgZnJvbSwgdG8gfSApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBibG9jayApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogQ29tbWl0QmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG4gICAgXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rIDogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5jb21taXRCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGZyb21IZWlnaHQsIHRvSGVpZ2h0ICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IFJvbGxiYWNrQmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcblxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBpbml0aWFsaXplIFNtYXJ0REIgLCB5b3UgbmVlZCBjYWxsIHRoaXMgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBzY2hlbWFzIHRhYmxlIHNjaGVtYXMgaW4gRGF0YWJhc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBpbml0KHNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzY2hlbWFzJywgKCk9PiBEQkMubm90TnVsbChzY2hlbWFzKSlcblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5jb25uZWN0KCkgICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLm9wZW4oKVxuXG4gICAgZm9yKCBjb25zdCBzY2hlbWEgb2Ygc2NoZW1hcyApIHtcbiAgICAgIHRoaXMuc2NoZW1hcy5zZXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYSApXG4gICAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbiggc2NoZW1hIClcblxuICAgICAgc2Vzc2lvbi5yZWdpc3RlclNjaGVtYShzY2hlbWEpXG4gICAgICBzZXNzaW9uLnN5bmNTY2hlbWEoc2NoZW1hKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgc3luYyBzY2hlbWEgbW9kZWwgPSAke3NjaGVtYS5tb2RlbE5hbWV9IGApXG5cbiAgICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIHsgXG4gICAgICAgIGxldCBpdGVtcyA9IGF3YWl0IHNlc3Npb24uZ2V0TWFueSggc2NoZW1hLm1vZGVsTmFtZSwge30sIGZhbHNlLCB0cnVlIClcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgbW9kZWwgJHtzY2hlbWEubW9kZWxOYW1lfSBjYWNoZWQgJHtpdGVtcy5sZW5ndGh9IGVudGl0aWVzIGApXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZW1pdCggJ3JlYWR5JywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogZnJlZSByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuY2xvc2UoKVxuICAgIFxuICAgIHRoaXMuZW1pdCgnY2xvc2VkJywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogaGVpZ2h0IG9mIGxhc3QgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJsb2NrREIubGFzdEJsb2NrSGVpZ2h0XG4gIH1cblxuICAvKipcbiAgICogYmxvY2tzIGNvdW50XG4gICAqL1xuICBwdWJsaWMgZ2V0IGJsb2Nrc0NvdW50KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDFcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXN0IGNvbW1pdGVkIGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9jaygpIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICAvLyBUT0RPOiByZXR1cm4gbGFzdCBibG9jayBjb3B5ID9cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gIH1cblxuICAvKipcbiAgICogaG9sZCBhIGxvY2sgbmFtZSB3aGljaCBvbmx5IHN1Y2NlZWQgaW4gZmlyc3QgdGltZSBvZiBlYWNoIGJsb2NrLlxuICAgKiBAcGFyYW0gbG9ja05hbWUgbG9jayBuYW1lXG4gICAqIEBwYXJhbSBub3RUaHJvdyBkbyBub3QgdGhyb3cgZXhjZXB0aW9uIGlmIGxvY2sgZmFpbGVkXG4gICAqL1xuICBwdWJsaWMgbG9ja0luQ3VycmVudEJsb2NrKCBsb2NrTmFtZTogc3RyaW5nLCBub3RUaHJvdyA9IGZhbHNlICkgOiBib29sZWFuIHtcbiAgIHJldHVybiB0aGlzLmJsb2NrU2Vzc2lvbi5sb2NrSW5UaGlzU2Vzc2lvbiggbG9ja05hbWUsIG5vdFRocm93KVxuICB9XG5cbiAgLyoqXG4gICAqIGJlZ2luIGEgY29udHJhY3QgdHJhbnNhY3Rpb24gd2hpY2ggZWZmZWN0IGVudGl0aWVzIGluIG1lbW9yeVxuICAgKi9cbiAgcHVibGljIGJlZ2luQ29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmJlZ2luRW50aXR5VHJhbnNhY3Rpb24oKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgY29tbWl0Q29udHJhY3QoKSA6IHZvaWQge1xuICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNvbW1pdEVudGl0eVRyYW5zYWN0aW9uKClcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgcm9sbGJhY2tDb250cmFjdCgpIDogdm9pZCB7XG4gICAgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tFbnRpdHlUcmFuc2FjdGlvbigpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBiZWdpbiBhIG5ldyBibG9ja1xuICAgKiBAcGFyYW0gYmxvY2tIZWFkZXIgXG4gICAqL1xuICBwdWJsaWMgYmVnaW5CbG9jayggYmxvY2s6IEJsb2NrICkgOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB2ZXJpZnkgYmxvY2tIZWFkZXIgaGVyZVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCAoKT0+IERCQy5ub3ROdWxsKGJsb2NrKSlcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgYmxvY2suaGVpZ2h0ID09PSB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDEsIGBpbnZhbGlkIGJsb2NrIGhlaWdodCAke2Jsb2NrLmhlaWdodH0sIGxhc3QgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgXG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYmxvY2sgaGVpZ2h0ID0gJHtibG9jay5oZWlnaHR9YClcbiAgICB0aGlzLmN1cnJlbnRCbG9jayA9IGJsb2NrXG4gIH1cblxuICAvKipcbiAgICogY29tbWl0IGJsb2NrIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb21taXRCbG9jaygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudEJsb2NrKSB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgYmxvY2sgaXMgbnVsbCcpXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrLmhlaWdodH1gKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVDb21taXRCbG9jayggdGhpcy5jdXJyZW50QmxvY2sgKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGJsb2NrSGVhZGVyLCAndHJhbnNhY3Rpb25zJylcbiAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIGJsb2NrSGVhZGVyLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5zYXZlQ2hhbmdlcyggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IClcbiAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IC0gdGhpcy5vcHRpb25zLmhpc3RvcnlGb3JSb2xsYmFjayEgKVxuICAgICAgdGhpcy5jYWNoZWRCbG9ja3MucHV0KCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdENvbW1pdEJsb2NrKCB0aGlzLmxhc3RCbG9jayEgKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHsgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgY29tbWl0QmxvY2sgKCBoZWlnaHQgPSAke3RoaXMuY3VycmVudEJsb2NrIS5oZWlnaHR9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKHRoaXMuY3VycmVudEJsb2NrLmhlaWdodClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBibG9jayBjaGFuZ2VzXG4gICAqIEBwYXJhbSBoZWlnaHQgcm9sbGJhY2sgdG8gaGVpZ2h0KGV4Y2x1ZGUpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tCbG9jayggaGVpZ2h0PzogbnVtYmVyICkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2hlaWdodCcsICFoZWlnaHQgfHwgaGVpZ2h0IDw9IHRoaXMubGFzdEJsb2NrSGVpZ2h0LCBcbiAgICAgIGBoZWlnaHQgbXVzdCBsZXNzIG9yIGVxdWFsIGxhc3RCbG9ja0hlaWdodCAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG5cbiAgICBjb25zdCBmcm9tSGVpZ2h0ID0gdGhpcy5jdXJyZW50QmxvY2sgPyB0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0IDogdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICBjb25zdCB0b0hlaWdodCA9IGhlaWdodCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sYXN0QmxvY2tIZWlnaHQgOiBoZWlnaHRcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIC8vIGZvciBob29rXG4gICAgdGhpcy5wcmVSb2xsYmFja0Jsb2NrKCBmcm9tSGVpZ2h0LCAgdG9IZWlnaHQgKVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZlciA9IHRoaXMuYmxvY2tTZXNzaW9uLmhpc3RvcnlWZXJzaW9uO1xuICAgICAgaWYgKCBmcm9tSGVpZ2h0IDwgdmVyLm1pbiApIHsgLy8gbG9hZCBoaXN0b3J5IGZyb20gbGV2ZWxkYiwgaWYgY2FjaGVkIGhpc3RvcnkgbGVzcyB0aGFuIHJvbGxiYWNrIGhlaWdodCBcbiAgICAgICAgbGV0IGhpc3RvcnkgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0SGlzdG9yeUNoYW5nZXMoIGZyb21IZWlnaHQsIHZlci5taW4gKVxuICAgICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyggdG9IZWlnaHQgKVxuICAgICAgd2hpbGUoIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID4gdG9IZWlnaHQgKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2soIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgICAgdGhpcy5jYWNoZWRCbG9ja3MuZXZpdCggdGhpcy5sYXN0QmxvY2tIZWlnaHQsIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgICAgIH1cbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuICAgICAgLy8gZW1pdCBldmVudFxuICAgICAgdGhpcy5wb3N0Um9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0ICkgICAgICBcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1Mgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWApXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWAsIGVycilcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBzYXZlIGxvY2FsIHRhYmxlcyAobm90IGluIGJsb2NrIC0tLSB3aGljaCBkZWZpbmUgaW4gc2NoZW1hIGJ5IGxvY2FsIDogdHJ1ZSkgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUxvY2FsQ2hhbmdlcygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgc2VyaWFsID0gYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uc2F2ZUNoYW5nZXMoKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsIClcbiAgICByZXR1cm4gc2VyaWFsXG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgbG9jYWwgdGFibGVzIGNoYW5nZXMgc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKiBAcGFyYW0gc2VyaWFsIHNlcmlhbCBudW1iZXIgcmV0dXJuIGZyb20gc2F2ZUxvY2FsQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrTG9jYWxDaGFuZ2VzKHNlcmlhbDogbnVtYmVyKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2VyaWFsJywgc2VyaWFsID49IDAsIGBzZXJpYWwgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGVudGl0eSBrZXlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgZ2V0RW50aXR5S2V5PFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKTogTWF5YmVVbmRlZmluZWQ8RW50aXR5S2V5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuICAgIFxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsLCB0cnVlKSFcbiAgICByZXR1cm4gc2NoZW1hLmdldEtleSggZW50aXR5IClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgdHJhY2tpbmcgZW50aXR5ICBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBQYXJ0aWFsPFRFbnRpdHk+ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuXG4gICAgbGV0IGtleSA9IHRoaXMuZ2V0RW50aXR5S2V5KCBtb2RlbCwgIGVudGl0eSApXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBrZXkgIT09IHVuZGVmaW5lZCAsICdjYW4gbm90IGdldCBlbnRpdHkga2V5JyApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmxvYWQoIG1vZGVsLCBrZXkhIClcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSBuZXcgZW50aXR5IHdoaWNoIGNoYW5nZSB3aWxsIGJlIHRyYWNrZWQgYW5kIHBlcnNpc3RlbnRlZCAoYnkgc2F2ZUNoYW5nZXMpIGF1dG9tYXRpY2FsbHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleSB3aGljaCB1bmlxdWVkIGluIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBlbnRpdHkgcHJvdG90eXBlIGVudGl0eSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgY29weSB0byByZXN1bHQgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNraW5nIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleU9yRW50aXR5OiBFbnRpdHlLZXkgfCBURW50aXR5KSA6IFRFbnRpdHkge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleU9yRW50aXR5JywgKCk9PiBEQkMubm90TnVsbChrZXlPckVudGl0eSkpXG4gICAgXG4gICAgbGV0IGtleSA6IEVudGl0eUtleVxuICAgIGxldCBlbnRpdHk6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuXG4gICAgaWYgKCBpc1ByaW1pdGl2ZUtleSgga2V5T3JFbnRpdHkgKSB8fCBpc0NvbXBvc2l0ZUtleSgga2V5T3JFbnRpdHkgKSApIHsgXG4gICAgICBrZXkgPSBrZXlPckVudGl0eSBhcyBFbnRpdHlLZXkgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZW50aXR5ID0ga2V5T3JFbnRpdHkgYXMgVEVudGl0eVxuICAgICAga2V5ID0gc2NoZW1hLmdldEtleShlbnRpdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmNyZWF0ZShtb2RlbCwga2V5LCBlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogdXBkYXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgLy8gcHVibGljIHVwZGF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gIC8vICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgLy8gICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHByb3hpZWQgb2JqZWN0YCApXG5cbiAgLy8gICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgLy8gICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkudXBkYXRlKGVudGl0eSlcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBkZWxldGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCAnaXMgbm90IGEgdHJhY2tpbmcgZW50aXR5JyApXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmRlbGV0ZShlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBhbmQgZGF0YWJhc2VcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gZGF0YWJhc2UgYnkgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb248VEVudGl0eT4oc2NoZW1hISlcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnk8VEVudGl0eT4obW9kZWwsIGNvbmRpdGlvbiwgdHJ1ZSwgdHJ1ZSApXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcbiAgICBcbiAgICByZXR1cm4gKCBpdGVtcy5sZW5ndGggPT09IDEgKSA/IGl0ZW1zWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICAgIC8qKlxuICAgKiBnZXQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIGZpbmQgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbiwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBvbmx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5LCB0cnVlKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGZpbHRlciBmaWx0ZXIgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+ICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRBbGxDYWNoZWQoIG1vZGVsLCBmaWx0ZXIgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5leGlzdHMobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBjb3VudCByZWNvcmRzIGNvdW50IGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmNvdW50KG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja3MgOiBBcnJheTxCbG9ja0hlYWRlcj4sICBnZXRUcmFuc2FjdGlvbnM6ICgpID0+IFByb21pc2U8QXJyYXk8VHJhbnNhY3Rpb24+PiApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBsZXQgdHJhbnNHcm91cCA9IG5ldyBNYXA8c3RyaW5nLCBBcnJheTxUcmFuc2FjdGlvbj4+KClcbiAgICBsZXQgdHJhbnNhY3Rpb25zID0gYXdhaXQgZ2V0VHJhbnNhY3Rpb25zKClcblxuICAgIHRyYW5zYWN0aW9ucy5mb3JFYWNoKCB0ID0+IHtcbiAgICAgIGlmICghdHJhbnNHcm91cC5oYXMoIHQuYmxvY2tJZCApKSB0cmFuc0dyb3VwLnNldCggdC5ibG9ja0lkLCBuZXcgQXJyYXk8VHJhbnNhY3Rpb24+KCkgKVxuICAgICAgdHJhbnNHcm91cC5nZXQoIHQuYmxvY2tJZCApIS5wdXNoKCB0IClcbiAgICB9IClcblxuICAgIGJsb2Nrcy5mb3JFYWNoKCBiID0+IGJbJ3RyYW5zYWN0aW9ucyddID0gdHJhbnNHcm91cC5nZXQoYi5pZCEpIClcbiAgICByZXR1cm4gYmxvY2tzIGFzIEFycmF5PEJsb2NrPlxuICB9XG5cbiAgcHJpdmF0ZSBjb3B5Q2FjaGVkQmxvY2soIGdldENhY2hlQmxvY2sgOiAoKSA9PiBNYXliZVVuZGVmaW5lZDxCbG9jaz4sIHdpdGhUcmFuc2FjdGlvbnMgOiBib29sZWFuICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGxldCBjYWNoZWRCbG9jayA9IGdldENhY2hlQmxvY2soKVxuICAgIGlmICggY2FjaGVkQmxvY2sgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcbiAgICBcbiAgICBsZXQgcmVzdWx0ID0gT2JqZWN0LmFzc2lnbih7fSwgY2FjaGVkQmxvY2spXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHtcbiAgICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoIHJlc3VsdCwgJ3RyYW5zYWN0aW9ucycpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGhlaWdodFxuICAgKiBAcGFyYW0gaGVpZ2h0IGJsb2NrIGhlaWdodFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlIZWlnaHQoIGhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPj0gMCAsICdoZWlnaHQgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvJylcbiAgICBcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KGhlaWdodCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9jayggaGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGJsb2NrIGlkXG4gICAqIEBwYXJhbSBibG9ja0lkIGJsb2NrIGlkIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZywgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNvcHlDYWNoZWRCbG9jayggKCkgPT4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0QnlJZChibG9ja0lkKSwgd2l0aFRyYW5zYWN0aW9ucyApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtaW5IZWlnaHQsIG1heEhlaWdodCcsIG1pbkhlaWdodCA+PSAwICYmIG1heEhlaWdodCA+PSBtaW5IZWlnaHQsICdtaW5IZWlnaHQgb3IgbWF4SGVpZ2h0IGlzIGludmFsaWQnKVxuICAgXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQsIG1heEhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgYmxvY2sgaWQgYXJyYXlcbiAgICogQHBhcmFtIGJsb2NrSWRzIGFycmF5IG9mIGJsb2NrIGlkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZHMnLCAoKSA9PiBEQkMubm90TnVsbChibG9ja0lkcykgKVxuXG4gICAgLy8gVE9ETzogb2J0YWluIGJsb2NrcyBmcm9tIGNhY2hlXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUlkcyhibG9ja0lkcylcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxufSIsImltcG9ydCB7IEVudGl0eSwgIE51bGxhYmxlLCBwYXJ0aWFsIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEVudGl0eVRyYWNrZXIsIFByb3hpZWRFbnRpdHlUcmFja2VyIH0gZnJvbSAnLi9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuXG4vKiogICAgIFxuICogICAgIFNUQVRFIFRSQU5TRkVSICAgICAgICAgICAgICAgICAgQUNUSU9OICAgICAgICAgICAgICAgIFRSQUNLICAgICAgQ0FDSEVcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgICAgPyAgICAgICAgIC0+IHBlcnNpdGVudCAgICAgIHNlc3Npb24ubG9hZCAgICAgICAgICAgICB0cmFjayAgICAgY2FjaGVcbiAqICAgICAgPyAgICAgICAgIC0+IG5ldyAgICAgICAgICAgIHNlc3Npb24uY3JlYXRlICAgICAgICAgICB0cmFjayAgICAgICAtICBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IG1vZGlmaWVkICAgICAgIHNldCBwcm9wZXJ0eSAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBkZWxldGVkICAgICAgICBzZXNzaW9uLmRlbCAgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogbmV3IHwgbW9kaWZpZWQgLT4gcHJlc2lzdGVudCAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGtlZXAgICAgIGNhY2hlfHVwZGF0ZSBcbiAqIGRlbGV0ZWQgICAgICAgIC0+IHRyYW5zaWVudCAgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBldml0ICAgICAgIGV2aXRcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5leHBvcnQgZW51bSBFbnRpdHlTdGF0ZSB7XG4gIFRyYW5zaWVudCAgPSAtMSxcbiAgUGVyc2lzdGVudCA9IDAsXG4gIFxuICBOZXcgICAgICAgID0gMSxcbiAgTW9kaWZpZWQgICA9IDIsXG4gIERlbGV0ZWQgICAgPSAzLFxufVxuXG5leHBvcnQgZW51bSBFbnRpdHlDaGFuZ2VUeXBlIHtcbiAgTmV3ICAgICAgID0gMSxcbiAgTW9kaWZ5ICAgID0gMixcbiAgRGVsZXRlICAgID0gMyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZSB7XG4gIG5hbWUgICAgIDogc3RyaW5nXG4gIG9yaWdpbmFsIDogYW55XG4gIGN1cnJlbnQgIDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19jb25maXJtZWRfXyAgOiBib29sZWFuXG4gIF9fc2NoZW1hX18gICAgIDogTW9kZWxTY2hlbWEgIFxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX19jaGFuZ2VzX18gICAgOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxuICBfX3VuY29uZmlybWVkQ2hhbmdlc19fICA6IE51bGxhYmxlPEVudGl0eUNoYW5nZXM+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJveGllZDxUPiBleHRlbmRzIEVudGl0eUV4dGVuc2lvbiB7XG4gIFxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5UHJveHkge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHRyYWNrZXIgOiBFbnRpdHlUcmFja2VyXG5cbiAgY29uc3RydWN0b3IodHJhY2tlcjogRW50aXR5VHJhY2tlcikge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBFbnRpdHlQcm94eS5uYW1lIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNFeHRlbmRlZChlbnRpdHk6IEVudGl0eSkge1xuICAgIHJldHVybiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc2NoZW1hX18nKSAmJiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc3RhdGVfXycpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzUHJveGllZChlbnRpdHk6IEVudGl0eSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gRW50aXR5UHJveHkuaXNFeHRlbmRlZChlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbnZlcnRUb1Byb3hpZWQ8VEVudGl0eT4oZW50aXR5OiBFbnRpdHkpIDogUHJveGllZDxURW50aXR5PiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFByb3hpZWQgRW50aXR5YClcbiAgICBcbiAgICByZXR1cm4gZW50aXR5IGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcHJveHlUb0VudGl0eShwcm94aWVkOiBQcm94aWVkPEVudGl0eT4sIGNvbnRhaW5zVmVyc2lvbiA9IHRydWUgKTogRW50aXR5IHtcbiAgICByZXR1cm4gY29udGFpbnNWZXJzaW9uID8gXG4gICAgICBwYXJ0aWFsKCBwcm94aWVkLCBwID0+IEVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkocCkgKSA6XG4gICAgICBwYXJ0aWFsKCBwcm94aWVkLCBwID0+IHAgIT09ICdfdmVyc2lvbl8nICYmICBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KHApIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNOb3JtYWxQcm9wZXJ0eShwcm9wZXJ0eU5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKCBwcm9wZXJ0eU5hbWUubGVuZ3RoIDw9IDQgKSB8fCBcbiAgICAgICggcHJvcGVydHlOYW1lWzBdICE9PSBwcm9wZXJ0eU5hbWVbMV0gKSB8fCAoIHByb3BlcnR5TmFtZVswXSAhPT0gJ18nICkgfHxcbiAgICAgICggIXByb3BlcnR5TmFtZS5lbmRzV2l0aCgnX18nKSApIFxuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaEV4dGVuZFByb3BlcnRpZXM8VEVudGl0eT4oZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBzdGF0ZTogRW50aXR5U3RhdGUsICBjb25maXJtZWQgOiBib29sZWFuICkgOiBURW50aXR5IHtcbiAgICBsZXQgcmVzdWx0ID0gIE9iamVjdC5hc3NpZ24oe1xuICAgICAgX3ZlcnNpb25fICAgICAgOiAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX2NvbmZpcm1lZF9fICA6IGNvbmZpcm1lZCxcbiAgICAgIF9fc2NoZW1hX18gICAgIDogc2NoZW1hLFxuICAgICAgX190cmFja2VyX18gICAgOiB0aGlzLnRyYWNrZXIsIFxuICAgICAgX190cmFja2luZ19fICAgOiB0cnVlLFxuICAgICAgX19jaGFuZ2VzX18gICAgOiBudWxsLFxuICAgICAgX191bmNvbmZpcm1lZENoYW5nZXNfXyA6IG51bGxcbiAgICB9LCBlbnRpdHkpXG4gICAgXG4gICAgcmVzdWx0Ll92ZXJzaW9uXyA9IHJlc3VsdC5fdmVyc2lvbl8gfHwgMVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBzdGF0aWMgaW5pdENoYW5nZXMoIGV4dCA6IEVudGl0eUV4dGVuc2lvbiAsIGNoYW5nZVR5cGUgPSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSApIHtcbiAgICBpZiAoY2hhbmdlVHlwZSA9PT0gRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnkpIGV4dC5fX2NoYW5nZXNfXyA9IHtcbiAgICAgIHR5cGUgOiBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSwgICAgICAgIFxuICAgICAgZGJWZXJzaW9uOiBleHQuX3ZlcnNpb25fICxcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPih7IFxuICAgICAgICBuYW1lOiAnX3ZlcnNpb25fJywgb3JpZ2luYWw6IGV4dC5fdmVyc2lvbl8gLSAxLCBjdXJyZW50OiBleHQuX3ZlcnNpb25fIFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9IHtcbiAgICAgIHR5cGUgOiBjaGFuZ2VUeXBlLCAgICAgICAgXG4gICAgICBkYlZlcnNpb246IGV4dC5fdmVyc2lvbl8gLFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UHJvcGVydHlLZXlzKCBlbnRpdHkgOiBFbnRpdHkgKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgcmV0dXJuIGV4dC5fX3NjaGVtYV9fLmZpZWxkTmFtZXNcbiAgfVxuXG4gIHByb3RlY3RlZCBvblByb3BlcnR5U2V0KGVudGl0eTogRW50aXR5LCBwcm9wZXJ0eUtleTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnksIHJlY2VpdmVyOiBhbnkpIDogYm9vbGVhbiB7ICAgICAgXG4gICAgY29uc3QgZXh0ID0gZW50aXR5IGFzIEVudGl0eUV4dGVuc2lvbiBcbiAgICBjb25zdCBuYW1lID0gcHJvcGVydHlLZXkudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eUtleV0gKSB7XG4gICAgICBlbnRpdHlbcHJvcGVydHlLZXldID0gdmFsdWVcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByb3BlcnR5IGFmdGVyIGRlbGV0ZWRgKVxuICAgIH1cbiAgICBcbiAgICBsZXQgc2NoZW1hID0gZXh0Ll9fc2NoZW1hX19cbiAgICBpZiAoIHNjaGVtYS5pc1JlYWRvbmx5ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSByZWFkb25seSBtb2RlbCAnJHtzY2hlbWEubW9kZWxOYW1lfSdgKVxuICAgIH1cblxuICAgIGlmICggc2NoZW1hLnByaW1hcnlLZXkgPT09IG5hbWUgfHwgc2NoZW1hLmNvbXBvc2l0ZUtleXMuaW5kZXhPZihuYW1lKSA+PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcmltYXJ5IGtleSBvciBjb21wb3NpdGUga2V5IHByb3BlcnR5YClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX2RldGFjaGVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlcikuYXR0YWNoKCByZWNlaXZlciBhcyBQcm94aWVkPGFueT4gKVxuICAgICAgZXh0Ll9fZGV0YWNoZWRfXyA9IGZhbHNlXG4gICAgfVxuXG4gICAgRW50aXR5UHJveHkucmVjb3JkUHJvcGVydHlDaGFuZ2VzKCBleHQsIHByb3BlcnR5S2V5LCB2YWx1ZSApXG4gICAgZW50aXR5W3Byb3BlcnR5S2V5XSA9IHZhbHVlXG4gICAgXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHByb3RlY3RlZCBzdGF0aWMgcmVjb3JkUHJvcGVydHlDaGFuZ2VzKCBleHQgOiBFbnRpdHlFeHRlbnNpb24sIGtleSA6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55ICkge1xuICAgIGxldCBzdGFydENvbmZpcm0gPSBmYWxzZVxuICAgIGlmICggZXh0Ll9fdHJhY2tlcl9fLmlzQ29uZmlybWluZyAmJiBleHQuX19jb25maXJtZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyICkucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggZXh0IClcbiAgICAgIHN0YXJ0Q29uZmlybSA9IHRydWVcbiAgICAgIGV4dC5fX2NvbmZpcm1lZF9fID0gZmFsc2VcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKSB7XG4gICAgICBleHQuX3ZlcnNpb25fICsrXG4gICAgICBleHQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuTW9kaWZpZWRcbiAgICAgIEVudGl0eVByb3h5LmluaXRDaGFuZ2VzKCBleHQgKSAgICAgXG4gICAgfVxuXG4gICAgbGV0IHByb3BlcnRpZXNDaGFuZ2VzIDogTnVsbGFibGU8QXJyYXk8UHJvcGVydHlDaGFuZ2U+PiA9IG51bGwgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHsgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX19jb25maXJtZWRfXyA/ICBcbiAgICAgICAgZXh0Ll9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlczogXG4gICAgICAgIGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcyAgIFxuICAgIH1cbiAgICBlbHNlIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3ICYmIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgKSB7XG4gICAgICBzdGFydENvbmZpcm0gJiYgRW50aXR5UHJveHkuaW5pdENoYW5nZXMoIGV4dCwgRW50aXR5Q2hhbmdlVHlwZS5OZXcgKVxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgPSBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9PT0gbnVsbCA/IHVuZGVmaW5lZCA6IGV4dC5fX3VuY29uZmlybWVkQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlc1xuICAgIH1cblxuICAgIGxldCBuYW1lID0ga2V5LnRvU3RyaW5nKClcbiAgICBwcm9wZXJ0aWVzQ2hhbmdlcyAmJiBwcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcsIGNvbmZpcm1lZClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCwgb3duS2V5cyA6IHRoaXMuZ2V0UHJvcGVydHlLZXlzIH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgLCBjb25maXJtZWQgOiBib29sZWFuICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQsICBjb25maXJtZWQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0LCBvd25LZXlzIDogdGhpcy5nZXRQcm9wZXJ0eUtleXMgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIGNvbmZpcm1DaGFuZ2VzPFRFbnRpdHk+KCBwZSA6IFByb3hpZWQ8VEVudGl0eT4gKSA6IHZvaWQge1xuICAgIGlmICggcGUuX19jb25maXJtZWRfXyApIHtcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oJ2NvbmZpcm0gd2hlbiBjb25maXJtZWQnKVxuICAgICAgcmV0dXJuIFxuICAgIH1cbiAgICBcbiAgICBsZXQgdG1wQ2hhbmdlcyA9IHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX19cbiAgICBpZiAoIHRtcENoYW5nZXMgJiYgcGUuX19jaGFuZ2VzX18gKSB7XG4gICAgICBwZS5fX2NoYW5nZXNfXy5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKCAuLi50bXBDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzIClcbiAgICB9XG4gICAgZWxzZSBpZiAoICFwZS5fX2NoYW5nZXNfXyApIHtcbiAgICAgIHBlLl9fY2hhbmdlc19fID0gT2JqZWN0LmFzc2lnbih7fSwgdG1wQ2hhbmdlcylcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBfX3VuY29uZmlybWVkQ2hhbmdlc19fID09PSBudWxsICYmIF9fY2hhbmdlc19fICE9PSBudWxsXG4gICAgfVxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiAoIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpIClcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxDaGFuZ2VzPFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX2NvbmZpcm1lZF9fICkge1xuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbygnY2FuY2VsIHdoZW4gY29uZmlybWVkJylcbiAgICAgIHJldHVybiBcbiAgICB9IFxuICAgIFxuICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiBcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIHBjID0+IHBlW3BjLm5hbWVdID0gcGMub3JpZ2luYWwgKSBcbiAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgcGUuX19zdGF0ZV9fID0gcGUuX19jaGFuZ2VzX18gPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmICggcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KCkgKVxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgQ29tcG9zaXRlS2V5IH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIEVudGl0eVRyYWNrZXJBY3Rpb24gPSAoIG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcyApID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5KTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcblxuICBpc0NvbmZpcm1pbmcgOiBib29sZWFuXG4gIGJlZ2luQ29uZmlybSgpIDogdm9pZFxuICBjb25maXJtKCkgOiB2b2lkXG4gIGNhbmNlbENvbmZpcm0oKSA6IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuZXhwb3J0IHR5cGUgUHJveGllZEVudGl0eUFuZENoYW5nZXMgPSB7IGVudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHsgIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY29uZmlybWluZyA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG4gIHByaXZhdGUgdW5jb25maXJtZWRFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuY29uZmlybWluZyA9IGZhbHNlICAgIFxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG5cbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHB1YmxpYyBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IG1rID0geyBtOiBzY2hlbWEubW9kZWxOYW1lLCBrOiBrZXl9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBtayApXG4gIH1cblxuICBwdWJsaWMgc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSApIDogeyBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSB9IHtcbiAgICBsZXQgbWsgPSBKU09OLnBhcnNlKCBtb2RlbEFuZEtleSApXG4gICAgbGV0IGtleSA9IGlzU3RyaW5nKG1rLmspIHx8IGlzTnVtYmVyKG1rLmspID8gbWsuayA6IG5ldyBDb21wb3NpdGVLZXkobWsuay5rZXlPYmplY3QpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBtay5tLCBrZXk6IGtleSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwdWJsaWMgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlVHJhY2tpbmdUcmFuc2lzZW50RW50aXRpZXMoKSB7XG4gICAgbGV0IGtleXMgPSBuZXcgQXJyYXk8TW9kZWxBbmRLZXk+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggKGVudGl0eSwga2V5KSA9PiBlbnRpdHkuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgJiYga2V5cy5wdXNoKGtleSkpXG4gICAga2V5cy5mb3JFYWNoKCBrZXkgPT4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZShrZXkpIClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSk7XG4gICAgaWYgKCB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4aXN0cyBhbm90aGVyIHRyYWNrZWQgZW50aXR5JylcbiAgICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSApXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRMYXN0Q2hhbmdlcyggcGU6IFByb3hpZWQ8YW55PiApIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNEaXJ0eShwZSkpIHJldHVybiB1bmRlZmluZWRcbiAgICAvLyBUT0RPOiBjaGVjayBpZiBjb25maXJtaW5nID9cbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDogXG4gICAgICAgIHJldHVybiBwZS5fX2NoYW5nZXNfXyFcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb246IG51bWJlciApOiBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICBsZXQgdG1wVmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cblxuICAgIHdoaWxlICggdG1wVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiApIHtcbiAgICAgIGxldCBoaXN0b3J5ID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRtcFZlcnNpb24pXG4gICAgICBoaXN0b3J5ICYmIHJlc3VsdC5wdXNoKGhpc3RvcnkpICAgICAgXG4gICAgICB0bXBWZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwga2V5KSApXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0TW9kZWxBbmRLZXkoIHBlIClcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuc2V0KCBrZXksIHBlIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25maXJtaW5nKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25maXJtaW5nXG4gIH1cblxuICBwdWJsaWMgYmVnaW5Db25maXJtKCkgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSB0cnVlXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCdCRUdJTiBiZWdpbkNvbmZpcm0nKVxuICB9XG5cbiAgcHVibGljIGNvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNvbmZpcm1OZXcoIHBlICkgXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTW9kaWZpZWQgKVxuICAgICAgICB0aGlzLmNvbmZpcm1Nb2RpZnkoIHBlIClcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5EZWxldGVkIClcbiAgICAgICAgdGhpcy5jb25maXJtZWREZWxldGUoIHBlIClcbiAgICB9KVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5yZW1vdmVUcmFja2luZ1RyYW5zaXNlbnRFbnRpdGllcygpXG4gICAgdGhpcy5jb25maXJtaW5nID0gZmFsc2VcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoJ1NVQ0NFU1MgY29uZmlybSAnKVxuICB9XG5cbiAgcHVibGljIGNhbmNlbENvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSApIFxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk1vZGlmaWVkIClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZE1vZGlmeSggcGUgKVxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLkRlbGV0ZWQgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSApXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuVHJhbnNpZW50IClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZERlbGV0ZSggcGUgKVxuICAgIH0pXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLnJlbW92ZVRyYWNraW5nVHJhbnNpc2VudEVudGl0aWVzKClcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSBmYWxzZVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSgnU1VDQ0VTUyBjYW5jZWxDb25maXJtICcpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEsICF0aGlzLmlzQ29uZmlybWluZylcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG5cbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIFxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgXG4gICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkgcmV0dXJuXG4gICAgXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG4gICAgcHJveGllZC5fX2NvbmZpcm1lZF9fID0gIXRoaXMuY29uZmlybWluZ1xuICAgIFxuICAgIHN3aXRjaCAoIHByb3hpZWQuX19zdGF0ZV9fICkge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1OZXcoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgbGV0IG5ld1RoZW5Nb2RpZnkgPSBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmIFxuICAgICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXy50eXBlID09PSBFbnRpdHlDaGFuZ2VUeXBlLk5ld1xuICAgICAgXG4gICAgaWYgKCBuZXdUaGVuTW9kaWZ5ICkgeyAgICAgIFxuICAgICAgdGhpcy5wcm94eS5jYW5jZWxDaGFuZ2VzKCBwZSApXG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH1cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1Nb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNvbmZpcm1DaGFuZ2VzKCBwZSApXG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuY2VsVW5jb25maXJtZWRNb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNhbmNlbENoYW5nZXMoIHBlIClcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25maXJtZWREZWxldGUoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk5ldyBcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCApIHtcbiAgICAgIGxldCBtb2RpZmllZCA9ICAoIHBlLl9fY2hhbmdlc19fICYmIHBlLl9fY2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmxlbmd0aCA+IDAgKVxuICAgICAgcGUuX19zdGF0ZV9fID0gbW9kaWZpZWQgPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgXG4gICAgaWYgKCBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICkgeyBcbiAgICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuXG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hLCAhdGhpcy5jb25maXJtaW5nKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PFByb3hpZWRFbnRpdHlBbmRDaGFuZ2VzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxQcm94aWVkRW50aXR5QW5kQ2hhbmdlcz4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgZW50aXR5OiBwZSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSl9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhlbnRpdHk6IEVudGl0eSwgZGJWZXJzaW9uOiBudW1iZXIsIGlzTmV3ID0gdHJ1ZSkgOiBFbnRpdHlDaGFuZ2VzIHtcbiAgICBsZXQgcHJvcGVyaXRlc0NoYW5nZSA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIGZvciAoY29uc3Qga2V5IGluIGVudGl0eSkge1xuICAgICAgaWYgKCFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGtleSkpIGNvbnRpbnVlXG4gICAgICBwcm9wZXJpdGVzQ2hhbmdlLnB1c2goIGlzTmV3ID8gXG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogdW5kZWZpbmVkLCBjdXJyZW50OiBlbnRpdHlba2V5XSB9IDpcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBlbnRpdHlba2V5XSwgY3VycmVudDogIHVuZGVmaW5lZCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fY2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fY2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fY2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm0oKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSksIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTpcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNhY2hlLmdldCggbW9kZWwsIGtleSApXG4gICAgICAgIGlmICggZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuXG4gICAgICAgIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBlIVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlIClcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTogXG4gICAgICAgIGNvbnN0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KCBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjID0+IGMubmFtZSwgYyA9PiBjLm9yaWdpbmFsKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZW50aXR5IClcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbENvbmZpcm0oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX19jaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OlxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGByZWplY3RDaGFuZ2VzIFZlcnNpb24gPSA/YClcbiAgfVxuICBcbiAgcHVibGljIHJvbGxiYWNrQ2hhbmdlcyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMucmVqZWN0Q2hhbmdlcygpXG4gICAgd2hpbGUoIGhpc3RvcnlWZXJzaW9uIDw9IHRoaXMuY3VycmVudFZlcnNpb24gKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzTWFwID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgICBjaGFuZ2VzTWFwICYmIGNoYW5nZXNNYXAuZm9yRWFjaCggKCBjaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5ICkgXG4gICAgICAgIHRoaXMucm9sbGJhY2tDYWNoZUNoYW5nZXMobWsubW9kZWwsIG1rLmtleSwgY2hhbmdlcylcbiAgICAgIH0pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uIC0tXG4gICAgfVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHBlLl9fZGV0YWNoZWRfXyA9IHRydWUpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSBNYXRoLm1pbih0aGlzLm1pblZlcnNpb24sIHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuY3VycmVudFZlcnNpb259YClcbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnkoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkge1xuICAgIGlmICggdGhpcy5taW5WZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uIHx8IHRoaXMuY3VycmVudFZlcnNpb24gPCBoaXN0b3J5VmVyc2lvbiApIHJldHVyblxuICAgIGZvciggbGV0IHZlciA9IHRoaXMubWluVmVyc2lvbjsgdmVyIDwgaGlzdG9yeVZlcnNpb247IHZlcisrICkge1xuICAgICAgdGhpcy5oaXN0b3J5LmRlbGV0ZSh2ZXIpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkdW1wQ2hhbmdlcyggZWM6IEVudGl0eUNoYW5nZXMgKTogc3RyaW5nIHtcbiAgICBsZXQgcHJvcGVydHlDaGFuZ2VzID0gJydcbiAgICBlYy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKHBjID0+IHByb3BlcnR5Q2hhbmdlcyArPSBgJHtwYy5uYW1lfTogJHtwYy5vcmlnaW5hbH0gLT4gJHtwYy5jdXJyZW50fSwgYClcblxuICAgIHJldHVybiBgZGJWZXJzaW9uPSR7ZWMuZGJWZXJzaW9ufSwgdHlwZT0ke2VjLnR5cGV9LCBbJHtwcm9wZXJ0eUNoYW5nZXN9XWBcbiAgfVxuXG4gIHB1YmxpYyBkdW1wSGlzdG9yeSgpIDogc3RyaW5nIHtcbiAgICBsZXQgdmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIEhJU1RPUlkgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHdoaWxlKCB2ZXJzaW9uID49IHRoaXMubWluVmVyc2lvbiApIHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS12ZXJzaW9uICR7dmVyc2lvbn0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGxldCBoaXMgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oIHZlcnNpb24gKVxuICAgICAgaGlzICYmIGhpcy5mb3JFYWNoKCAoIGVjLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmR1bXBDaGFuZ2VzKCBlYyApXG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICAgIGNvbnN0IG1zZyA9IGB0eXBlPSR7bWsubW9kZWx9LCBrZXk9JHttay5rZXl9LCBjaGFuZ2VzPXske2NoYW5nZXN9fSBcXG5gXG4gICAgICAgIHJlc3VsdCArPSBtc2dcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICAgIHZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhY2tlclNxbEJ1aWxkZXIge1xuICBwcml2YXRlIHRyYWNrZXI6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXIsIG1vZGVscyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPiwgc3FsQnVpbGRlcjogU3FsQnVpbGRlciApIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5tb2RlbHMgPSBtb2RlbHNcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBzcWxCdWlsZGVyXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQgZW50aXR5VHJhY2tlcigpIHsgcmV0dXJuIHRoaXMudHJhY2tlciB9XG5cbiAgcHVibGljIGJ1aWxkQ2hhbmdlU3FscygpIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5kZXRlY3RDaGFuZ2VzKCkuZm9yRWFjaCggZWMgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKGVjLmVudGl0eSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkU3FsQW5kUGFyYW1ldGVycyhwZSA6UHJveGllZDxhbnk+KSA6IFNxbEFuZFBhcmFtZXRlcnMgeyAgXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOlxuICAgICAgICBjb25zdCBuZXdFbnRpdHkgPSAgRW50aXR5UHJveHkucHJveHlUb0VudGl0eSggcGUsIHRydWUgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBuZXdFbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==