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
    getAllCached(model, filter, track = false) {
        const schema = this.getSchema(model);
        let entities = this.entityCache.getAll(schema.modelName, filter) || [];
        return track ? this.trackPersistentEntities(schema, entities, false, true) : entities;
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
            if (!includeKey && (this.cKeys.indexOf(f) >= 0 || f === this.primaryKey))
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
     * @param track track result
     */
    getAllCached(model, filter, track = false) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).getAllCached(model, filter, track);
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
            pe.__changes__ = tmpChanges;
        }
        else {
            // __unconfirmedChanges__ === null && __changes__ !== null
        }
        pe.__confirmed__ = true;
        pe.__unconfirmedChanges__ = null;
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
        pe.__unconfirmedChanges__ = null;
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
                const newEntity = Object.assign({ _version_: pe._version_ }, EntityProxy_1.EntityProxy.proxyToEntity(pe));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsMkM7Ozs7Ozs7Ozs7O0FDQUEsc0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiYXNjaC1zbWFydGRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gb2JqZWN0IHdpdGggYWxsIGNvbXBpbGVkIFdlYkFzc2VtYmx5Lk1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18udyA9IHt9O1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9JbmRleC50c1wiKTtcbiIsImltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vQmxvY2snXG5cbmV4cG9ydCBjbGFzcyBCbG9ja0NhY2hlIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8bnVtYmVyLCBCbG9jaz4oKVxuICBwcml2YXRlIG1pbkhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhDYWNoZWRDb3VudCA6IG51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgdGhpcy5tYXhIZWlnaHQgPj0gMCAmJiBibG9jay5oZWlnaHQgIT09IHRoaXMubWF4SGVpZ2h0ICsgMSApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgKCdpbnZhbGlkIGJsb2NrIGhlaWdodCcpXG5cbiAgICB0aGlzLmNhY2hlLnNldCggYmxvY2suaGVpZ2h0LCBibG9jayApXG4gICAgdGhpcy5tYXhIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgICBcbiAgICBpZiAoIHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heENhY2hlZENvdW50ICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoIHRoaXMubWluSGVpZ2h0KysgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQoIGhlaWdodDogbnVtYmVyICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChoZWlnaHQpXG4gIH1cblxuICBwdWJsaWMgZ2V0QnlJZCggaWQ6IHN0cmluZyApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBmb3IoIGNvbnN0IGIgb2YgdGhpcy5jYWNoZS52YWx1ZXMoKSApIHtcbiAgICAgIGlmICggYi5pZCEgPT09IGlkICkgcmV0dXJuIGJcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV2aXQoIGZyb21IZWlnaHQ6IG51bWJlciwgdG9IZWlnaHQ6IG51bWJlciApIHtcbiAgICBsZXQgbWluID0gTWF0aC5taW4oIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBsZXQgbWF4ID0gTWF0aC5tYXgoIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBpZiAoIG1pbiA+IHRoaXMubWF4SGVpZ2h0IHx8IG1heCA8IHRoaXMubWluSGVpZ2h0ICkgcmV0dXJuIFxuICAgIFxuICAgIG1pbiA9IE1hdGgubWF4KCBtaW4sIHRoaXMubWluSGVpZ2h0IClcbiAgICBtYXggPSBNYXRoLm1pbiggbWF4LCB0aGlzLm1pbkhlaWdodCApXG4gICAgZm9yICggbGV0IGhlaWdodCA9IG1pbjsgaGVpZ2h0IDw9IG1heDsgaGVpZ2h0KysgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZShoZWlnaHQpXG4gICAgfVxuICB9XG59IiwiaW1wb3J0IHsgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0TGl0ZXJhbCB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IE9iamVjdExpdGVyYWxcbmV4cG9ydCB0eXBlIEVudGl0eSA9IE9iamVjdExpdGVyYWxcblxuZXhwb3J0IGludGVyZmFjZSBLZXlPYmplY3QgeyBcbiAga2V5IDogc3RyaW5nXG4gIGtleUpzb24gOiBKc29uT2JqZWN0XG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSA6IEpzb25PYmplY3Qge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdpdGVyYWJsZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBpdGVyYWJsZSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRLZXknLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0S2V5ICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldFZhbHVlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldFZhbHVlICkpXG5cbiAgbGV0IHJldCA9IHt9XG4gIGZvciAobGV0IGl0ZW0gb2YgaXRlcmFibGUpIHtcbiAgICByZXRbZ2V0S2V5KGl0ZW0pXSA9IGdldFZhbHVlKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHJldCBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpYWw8VD4oIHNyYyA6IFQsIGtleXNPcktleUZpbHRlciA6IEFycmF5PHN0cmluZz4gfCAoKGtleSA6IHN0cmluZykgPT4gYm9vbGVhbikgKTogUGFydGlhbDxUPiB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ3NyYycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBzcmMgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAna2V5c09yS2V5RmlsdGVyJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGtleXNPcktleUZpbHRlciApKVxuXG4gIGxldCBrZXlzID0gaXNGdW5jdGlvbihrZXlzT3JLZXlGaWx0ZXIpID8gXG4gICAgT2JqZWN0LmtleXMoc3JjKS5maWx0ZXIoIGtleXNPcktleUZpbHRlciBhcyAoKGtleSA6IHN0cmluZykgPT4gYm9vbGVhbikgKSA6XG4gICAga2V5c09yS2V5RmlsdGVyIGFzIEFycmF5PHN0cmluZz5cblxuICBsZXQgcmVzdWx0ID0geyB9XG4gIGZvciAoIGxldCBrIG9mIGtleXMgKSByZXN1bHRba10gPSBzcmNba11cbiAgcmV0dXJuIHJlc3VsdCBhcyBQYXJ0aWFsPFQ+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCAha2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBpc1N0cmluZygga2V5ICkgfHwgaXNOdW1iZXIoIGtleSApXG59XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoIG1lc3NhZ2UgOiBzdHJpbmcgKSB7XG4gICAgc3VwZXIoICdDb2RlIGNvbnRyYWN0IEVycm9yLCcrIG1lc3NhZ2UgKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0Q29uZGl0aW9uID0gYm9vbGVhbiB8ICggKCkgPT4gYm9vbGVhbiApXG5leHBvcnQgdHlwZSBDb250cmFjdE1lc3NhZ2UgICA9IHN0cmluZyAgfCAoICgpID0+IHN0cmluZyApXG5cbmV4cG9ydCB0eXBlIE1heWJlVW5kZWZpbmVkPFQ+ID0gVCB8IHVuZGVmaW5lZFxuZXhwb3J0IHR5cGUgTnVsbGFibGU8VD4gPSBUIHwgbnVsbCB8IHVuZGVmaW5lZFxuXG5leHBvcnQgdHlwZSBDb250cmFjdFZlcmlmeVJlc3VsdCA9IHsgcmVzdWx0IDogYm9vbGVhbiwgbWVzc2FnZTogTnVsbGFibGU8c3RyaW5nPiB9IFxuZXhwb3J0IHR5cGUgVmVyaWZ5RnVuY3Rpb24gPSAoKSA9PiBDb250cmFjdFZlcmlmeVJlc3VsdFxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0IHtcbiAgcHVibGljIHN0YXRpYyB2ZXJpZnkoIGNvbmRpdGlvbjogQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UgOiBDb250cmFjdE1lc3NhZ2UgKSA6IHZvaWQge1xuICAgIGlmICggY29uZGl0aW9uID09PSB1bmRlZmluZWQgfHwgY29uZGl0aW9uID09PSBudWxsICkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcmlmeSBjb25kaXRpb24nKVxuXG4gICAgY29uc3QgY29uZCA9IGlzRnVuY3Rpb24oY29uZGl0aW9uKSA/IChjb25kaXRpb24gYXMgRnVuY3Rpb24pKCkgOiBjb25kaXRpb25cbiAgICBjb25zdCBtc2cgPSBpc0Z1bmN0aW9uKG1lc3NhZ2UpID8gKG1lc3NhZ2UgYXMgRnVuY3Rpb24pKCkgOiBtZXNzYWdlXG5cbiAgICBpZiAoIWNvbmQpIHRocm93IG5ldyBDb2RlQ29udHJhY3RFcnJvciggbXNnIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYXJndW1lbnQoIGFyZ05hbWU6IHN0cmluZywgdmVyaWZ5OiBWZXJpZnlGdW5jdGlvbiB8IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlPyA6IENvbnRyYWN0TWVzc2FnZSApOiB2b2lkIHtcbiAgICBpZiAoICFhcmdOYW1lIHx8ICF2ZXJpZnkgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJnTmFtZSBvciB2ZXJpZnkgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGlmICggIW1lc3NhZ2UgKSB7XG4gICAgICBjb25zdCB2ciA9ICAodmVyaWZ5IGFzIFZlcmlmeUZ1bmN0aW9uKSgpXG4gICAgICBDb2RlQ29udHJhY3QudmVyaWZ5KCB2ci5yZXN1bHQsIGBhcmd1bWVudCAnJHthcmdOYW1lfScgJHt2ci5tZXNzYWdlfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBDb2RlQ29udHJhY3QudmVyaWZ5KHZlcmlmeSBhcyBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSEpICAgIFxuICB9XG5cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGwoIGFyZyA6IGFueSApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGFyZyAhPT0gbnVsbCAmJiBhcmcgIT09IHVuZGVmaW5lZFxuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPckVtcHR5KCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbChzdHIpICYmIHN0ciAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciBlbXB0eSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JXaGl0ZXNwYWNlKCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbE9yRW1wdHkoIHN0ciApICYmICggc3RyIGFzIHN0cmluZyApLnRyaW0oKSAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciB3aGl0ZXNwYWNlJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxufVxuXG5cbiIsImltcG9ydCB7IEVudGl0eUNhY2hlLCBMUlVFbnRpdHlDYWNoZSwgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyLCBNVUxUSV9TUUxfU0VQQVJBVE9SIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRW50aXR5LCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgUHJveGllZEVudGl0eVRyYWNrZXIsIFRyYWNrZXJTcWxCdWlsZGVyLCBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlFeHRlbnNpb24sIFByb3hpZWQsIEVudGl0eVN0YXRlIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTYXZlSGlzdG9yeUFjdGlvbiA9ICggdmVyc2lvbjogbnVtYmVyLCBoaXN0b3J5OiBNYXA8c3RyaW5nLCBFbnRpdHlDaGFuZ2VzPiApID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIERiU2Vzc2lvbiB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY29ubmVjdGlvbjogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzZXNzaW9uQ2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIHNxbEJ1aWxkZXIgOiBKc29uU3FsQnVpbGRlclxuICBwcml2YXRlIHRyYWNrZXJTcWxCdWlsZGVyOiBUcmFja2VyU3FsQnVpbGRlclxuICBwcml2YXRlIGVudGl0eVRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIGhvbGRMb2NrcyA6IE1hcDxzdHJpbmcsIGJvb2xlYW4+XG4gIHByaXZhdGUgc2Vzc2lvblNlcmlhbCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbiwgY2FjaGVPcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zLCBzZXNzaW9uTmFtZT86IHN0cmluZykge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoIERiU2Vzc2lvbi5uYW1lICsgKCBzZXNzaW9uTmFtZSA9PT0gdW5kZWZpbmVkID8gJycgOiBgXyR7c2Vzc2lvbk5hbWV9YCkgIClcbiAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSAtMVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMuaG9sZExvY2tzID0gbmV3IE1hcDxzdHJpbmcsIGJvb2xlYW4+KClcbiAgICB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyID0gbmV3IFRyYWNrZXJTcWxCdWlsZGVyKCB0aGlzLmVudGl0eVRyYWNrZXIsIHRoaXMubW9kZWxzLCB0aGlzLnNxbEJ1aWxkZXIgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWU6IHN0cmluZykgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1vZGVsTmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlDbGFzczxURW50aXR5PihjbGF6ejogQ29uc3RydWN0b3I8VEVudGl0eT4pIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChjbGF6ei5uYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke2NsYXp6Lm5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICkge1xuICAgIHJldHVybiB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbCkgOiBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlDbGFzcyhtb2RlbClcbiAgfVxuXG4gIHByb3RlY3RlZCBtYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkoIHt9LCBrZXkgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCAgZW50aXRpZXMgOiBBcnJheTxURW50aXR5PiwgY2FjaGUgPSB0cnVlLCByZWZyZXNoSWZUcmFja2luZyA9IGZhbHNlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICBsZXQga2V5ID0gc2NoZW1hLmdldEtleShlKSBcbiAgICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgICBsZXQgcHJveGllZCA9IHJlZnJlc2hJZlRyYWNraW5nICYmIHRyYWNrZWQgIT09IHVuZGVmaW5lZCA/IFxuICAgICAgICB0cmFja2VkIGFzIGFueSBhcyBURW50aXR5IDogXG4gICAgICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hLCBlKVxuICAgICAgcmVzdWx0LnB1c2goIHByb3hpZWQgKVxuICAgICAgY2FjaGUgJiYgdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIGtleSwgZSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVzZXQoY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5zdG9wVHJhY2tBbGwoKVxuICAgIGlmICggY2xlYXJDYWNoZSApIHRoaXMuZW50aXR5Q2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgcHJvdGVjdGVkIHVuZGVmaW5lZElmRGVsZXRlZDxURW50aXR5PiggcHJveGllZCA6IFByb3hpZWQ8VEVudGl0eT4gKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICByZXR1cm4gKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkgPyBcbiAgICAgIHVuZGVmaW5lZCA6IFxuICAgICAgcHJveGllZCBhcyBPYmplY3QgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbiAmJiB0aGlzLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW50aXR5Q2FjaGUoKTogRW50aXR5Q2FjaGUge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25DYWNoZVxuICB9XG5cbiAgcHVibGljIHN5bmNTY2hlbWEoc2NoZW1hOiBNb2RlbFNjaGVtYSk6IHZvaWQge1xuICAgIHRoaXMuc3FsQnVpbGRlci5idWlsZFNjaGVtYShzY2hlbWEpLmZvckVhY2goIHNxbD0+IHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbi5leGVjdXRlU3luYyggc3FsIClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2NoZW1hKC4uLnNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogdm9pZCB7XG4gICAgc2NoZW1hcy5mb3JFYWNoKCBzID0+IHRoaXMubW9kZWxzLnNldChzLm1vZGVsTmFtZSwgcykgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlc2V0KCB0cnVlIClcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZGlzY29ubmVjdCgpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pik6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDYWNoZWQ8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKSB8fCBbXVxuXG4gICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgLCB0cnVlICkgOiBlbnRpdGllcyBcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiB0aGlzLnVuZGVmaW5lZElmRGVsZXRlZCh0cmFja2VkKVxuXG4gICAgbGV0IGNhY2hlZCA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0PFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBrZXkgKVxuICAgIHJldHVybiAoIGNhY2hlZCA9PT0gdW5kZWZpbmVkICkgPyB1bmRlZmluZWQgOiBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoIHNjaGVtYSwgY2FjaGVkIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRBbGw8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcblxuICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCAmJiB0aGlzLmVudGl0eUNhY2hlLmV4aXN0c01vZGVsKHNjaGVtYS5tb2RlbE5hbWUpICkge1xuICAgICAgbGV0IGVudGl0aWVzID0gdGhpcy5lbnRpdHlDYWNoZS5nZXRBbGw8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUgKSB8fCBbXVxuICAgICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UsIHRydWUgKSA6IGVudGl0aWVzIFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRNYW55KCBtb2RlbCwgeyB9LCB0cmFjayApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlLCBjYWNoZSA9IHRydWUgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uKVxuICAgIFxuICAgIGxldCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGNhY2hlICYmIGVudGl0aWVzLmZvckVhY2goIGUgPT4gdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkoZSksIGUgKSlcblxuICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXM8VEVudGl0eT4oIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyAgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnk8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPzogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGpvaW4pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5QnlKc29uPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBwYXJhbXMpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCApXG5cbiAgICBsZXQgeyBxdWVyeSAsIHBhcmFtZXRlcnN9ID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KCBzY2hlbWEsIFtdICwgY29uZGl0aW9uICkgXG4gICAgcXVlcnkgPSBgc2VsZWN0IGV4aXN0cygke3F1ZXJ5LnJlcGxhY2UoTVVMVElfU1FMX1NFUEFSQVRPUiwgJycpfSkgYXMgZXhpc3RgXG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KCBxdWVyeSwgcGFyYW1ldGVycyApXG4gICAgXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSAmJiBwYXJzZUludChyZXRbMF1bJ2V4aXN0J10pID4gMCBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHJldCA9IGF3YWl0IHRoaXMucXVlcnlCeUpzb24oIG1vZGVsLCB7IGZpZWxkcyA6ICdjb3VudCgqKSBhcyBjb3VudCcsIGNvbmRpdGlvbjogY29uZGl0aW9uIH0gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eShzY2hlbWEsIGtleSlcbiAgICBsZXQgZXhpc3RzID0gdHJhY2tlZCAhPT0gdW5kZWZpbmVkIHx8IHRoaXMuc2Vzc2lvbkNhY2hlLmV4aXN0cyggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGV4aXN0cyApIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGV4aXN0cyBhbHJlYWR5ICggbW9kZWwgPSAnJHtzY2hlbWEubW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKWApXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrTmV3KHNjaGVtYSwgdGhlRW50aXR5KSBhcyBURW50aXR5XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgbG9hZEVudGl0eUJ5S2V5KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG4gICAgY29uc3Qgd2hlcmUgPSB0aGlzLm1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgd2hlcmUpXG5cbiAgICBjb25zdCByb3dzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgaWYgKCByb3dzLmxlbmd0aCA+IDEgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBrZXkgaXMgZHVwbGljYXRlZCAoIG1vZGVsID0gJyR7bW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKWAgKVxuICAgIH1cblxuICAgIHJldHVybiByb3dzLmxlbmd0aCA9PT0gMSA/IHJvd3NbMF0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2FkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgY2FjaGVkID0gdGhpcy5sb2FkQ2FjaGVkKCBtb2RlbCwga2V5LCB0cnVlIClcbiAgICBpZiAoIGNhY2hlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIGNhY2hlZFxuICBcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUoIG1vZGVsTmFtZSApIVxuXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcbiAgICBcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGtleSwgZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCh0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpLCBlbnRpdHkpIGFzIFRFbnRpdHkgIFxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0NoYW5nZXMoKVxuICB9XG5cbiAgcHVibGljIGxvYWRDYWNoZWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICwgdHJhY2sgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgJiYgdHJhY2sgKSByZXR1cm4gdGhpcy51bmRlZmluZWRJZkRlbGV0ZWQodHJhY2tlZClcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldDxURW50aXR5Pihtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkIHx8ICEgdHJhY2sgKSByZXR1cm4gZW50aXR5XG5cbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGVudGl0eSkgYXMgVEVudGl0eSBcbiAgfVxuXG4gIHB1YmxpYyBsb2NrSW5UaGlzU2Vzc2lvbiggbG9ja05hbWU6IHN0cmluZywgbm90VGhyb3cgPSBmYWxzZSApIDogYm9vbGVhbiB7XG4gICAgaWYgKCAhdGhpcy5ob2xkTG9ja3MuaGFzKCBsb2NrTmFtZSApICkge1xuICAgICAgdGhpcy5ob2xkTG9ja3Muc2V0KCBsb2NrTmFtZSwgdGhpcy5lbnRpdHlUcmFja2VyLmlzQ29uZmlybWluZyApXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmICggIW5vdFRocm93ICkgdGhyb3cgbmV3IEVycm9yKGAke2xvY2tOYW1lfSBleGlzdHMgYWxyZWFkeWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIHNhdmVDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUNoYW5nZXMoc2VyaWFsPyA6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJldFNlcmlhbCA9IHNlcmlhbCB8fCArK3RoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRDaGFuZ2VTcWxzKClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaCggc3FscyApXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuICAgICAgXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIuYWNjZXB0Q2hhbmdlcyggcmV0U2VyaWFsICkgXG4gICAgICB0aGlzLmhvbGRMb2Nrcy5jbGVhcigpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSByZXRTZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgICAgcmV0dXJuIHJldFNlcmlhbFxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJlamVjdENoYW5nZXMoKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvbGxiYWNrIHNhdmVkIGNoYW5nZXNcbiAgICogQHBhcmFtIGNoYW5nZXNOTyAsdGhpcyB2YWx1ZSBzaG91bGQgYmUgcmV0dXJuZWQgYnkgQHNlZSBzYXZlQ2hhbmdlcygpIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQ2hhbmdlcyggc2VyaWFsOiBudW1iZXIgKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiggdGhpcy5zZXNzaW9uU2VyaWFsIDw9IHNlcmlhbCApIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcblxuICAgIGNvbnN0IGZyb20gPSB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyAoIHNlcmlhbCA9ICR7c2VyaWFsfSApYClcblxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKHNlcmlhbCArIDEpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goc3FscykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbCArIDEpXG4gICAgICB0aGlzLmhvbGRMb2Nrcy5jbGVhcigpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSBzZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG4gIHB1YmxpYyBiZWdpbkVudGl0eVRyYW5zYWN0aW9uKCkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYmVnaW5Db25maXJtKClcbiAgfVxuXG4gIHB1YmxpYyBjb21taXRFbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmNvbmZpcm0oKSBcbiAgICB0aGlzLmhvbGRMb2Nrcy5mb3JFYWNoKCAodiwgaykgPT4gdGhpcy5ob2xkTG9ja3Nba10gPSBmYWxzZSApXG4gIH1cblxuICBwdWJsaWMgcm9sbGJhY2tFbnRpdHlUcmFuc2FjdGlvbigpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmNhbmNlbENvbmZpcm0oKVxuICAgIFxuICAgIGxldCByZW1vdmVLZXlzID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIHRoaXMuaG9sZExvY2tzLmZvckVhY2goICh2LCBrKSA9PiByZW1vdmVLZXlzLnB1c2goaykgKVxuICAgIHJlbW92ZUtleXMuZm9yRWFjaCggayA9PiB0aGlzLmhvbGRMb2Nrcy5kZWxldGUoaykpXG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxuICBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMUlVFbnRpdHlDYWNoZSBpbXBsZW1lbnRzIEVudGl0eUNhY2hlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUlOX0NBQ0hFRF9DT1VOVCA9IDEwMFxuICBwcml2YXRlIHN0YXRpYyBERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCA9IDEwMDAwXG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBFbnRpdHlDYWNoZU9wdGlvbnNcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBtb2RlbENhY2hlcyA6IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGRlZmF1bHQgOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCB9XG4gICAgLy8gZm9yKCBsZXQgayBpbiB0aGlzLm9wdGlvbnMgKSBcbiAgICAvLyAgIHRoaXMub3B0aW9uc1trXSA9IGlzTnVtYmVyKHRoaXMub3B0aW9uc1trXSkgPyB0aGlzLm9wdGlvbnNba10gOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihMUlVFbnRpdHlDYWNoZS5uYW1lKVxuICAgIHRoaXMubW9kZWxDYWNoZXMgPSBuZXcgTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj4oKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2RlbENhY2hlKG1vZGVsTmFtZSA6IHN0cmluZywgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSwgdGhyb3dJZk5vdEV4aXN0cyA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPExSVS5DYWNoZTxFbnRpdHlLZXksIEVudGl0eT4+IHtcbiAgICBpZiAoIGNyZWF0ZUlmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSB7IFxuICAgICAgLy8gY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIC8vICAgbWF4OiA1MDAsXG4gICAgICAvLyAgIGxlbmd0aDogZnVuY3Rpb24gKG4sIGtleSkgeyByZXR1cm4gbiAqIDIgKyBrZXkubGVuZ3RoIH0sXG4gICAgICAvLyAgIC8vZGlzcG9zZTogZnVuY3Rpb24gKGtleSwgbikgeyBuLmNsb3NlKCkgfSxcbiAgICAgIC8vICAgbWF4QWdlOiAxMDAwICogNjAgKiA2MCBcbiAgICAgIC8vIH1cbiAgICAgIGxldCBtYXhDYWNoZWRDb3VudCA6IG51bWJlcjtcbiAgICAgIGlmICggIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlbE5hbWUpICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gdGhpcy5vcHRpb25zLmRlZmF1bHRcbiAgICAgIGVsc2UgaWYgKCBpc051bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pXG4gICAgICBlbHNlIGlmICggaXNGdW5jdGlvbih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkpXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gKCB0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSBhcyAobW9kZWwpPT4gbnVtYmVyICkoIG1vZGVsTmFtZSApXG4gICAgICBlbHNlIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICAgIG1heENhY2hlZENvdW50ID0gTWF0aC5tYXgoIExSVUVudGl0eUNhY2hlLk1JTl9DQUNIRURfQ09VTlQsIG1heENhY2hlZENvdW50IClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuc2V0KG1vZGVsTmFtZSwgbmV3IExSVTxzdHJpbmcsIEVudGl0eT4oIG1heENhY2hlZENvdW50ICkgKVxuICAgIH1cbiAgICAgaWYgKCB0aHJvd0lmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSBcbiAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsIGNhY2hlICggbmFtZSA9ICcke21vZGVsTmFtZX0nICkgIGRvZXMgbm90IGV4aXN0c2ApIFxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMubW9kZWxDYWNoZXMuZ2V0KG1vZGVsTmFtZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDYWNoZUtleSgga2V5OiBFbnRpdHlLZXkgKSA6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlS2V5KGtleSkgPyBrZXkgYXMgbnVtYmVyIHwgc3RyaW5nIDogKCBrZXkgYXMgS2V5T2JqZWN0ICkua2V5XG4gIH1cblxuICBwdWJsaWMgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkIHsgICAgXG4gICAgaWYgKCBpc1N0cmluZyhtb2RlbE5hbWUpICkge1xuICAgICAgdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCB0cnVlICkhLnJlc2V0KClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuZGVsZXRlKCBtb2RlbE5hbWUgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZvciAoIGxldCBjIG9mIHRoaXMubW9kZWxDYWNoZXMudmFsdWVzKCkgKSB7XG4gICAgICBjLnJlc2V0KClcbiAgICB9XG4gICAgdGhpcy5tb2RlbENhY2hlcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVscygpIDogc3RyaW5nW10ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgZm9yKCBsZXQgbSBvZiB0aGlzLm1vZGVsQ2FjaGVzLmtleXMoKSApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCBtIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG5cbiAgICByZXR1cm4gIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkgPyB1bmRlZmluZWQgOlxuICAgICAgbW9kZWxDYWNoZSEuaGFzKGNhY2hlS2V5KSA/IG1vZGVsQ2FjaGUhLmdldChjYWNoZUtleSkgYXMgVEVudGl0eSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4ge1xuICAgICAgKCFmaWx0ZXIgfHwgKGZpbHRlciAmJiBmaWx0ZXIoIGUgYXMgVEVudGl0eSApKSkgJiYgcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApIFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGVudGl0eTogRW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcHV0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtrZXl9LCBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KGVudGl0eSl9YCkgICAgXG4gICAgdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSwgdHJ1ZSkhLnNldCh0aGlzLmdldENhY2hlS2V5KGtleSksIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgZXZpdCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7Y2FjaGVLZXl9YClcblxuICAgIGNvbnN0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGlmIChtb2RlbENhY2hlKSBtb2RlbENhY2hlLmRlbChjYWNoZUtleSlcbiAgfVxuICBcbiAgcHVibGljIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG1vZGVsTmFtZSwgIHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgZmFsc2UgKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuXG4gIHB1YmxpYyBkdW1wQ2FjaGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBDQUNIRSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgdGhpcy5tb2RlbENhY2hlcy5mb3JFYWNoKCAoY2FjaGUsIG1vZGVsKSA9PiB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tTW9kZWwgJHttb2RlbH0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGNhY2hlLmZvckVhY2goICggZW50aXR5LCBrZXkgKSA9PiB7XG4gICAgICAgIHJlc3VsdCArPSBga2V5ID0gJHt0aGlzLmdldENhY2hlS2V5KCBrZXkgKX0sIGVudGl0eSA9IHske0pTT04uc3RyaW5naWZ5KGVudGl0eSl9fSBcXG5gXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgfSkgICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBzZGIgZnJvbSAnLi9TbWFydERCJ1xuaW1wb3J0ICogYXMgbW9kZWwgZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCAqIGFzIGJsb2NrIGZyb20gJy4vQmxvY2snXG5pbXBvcnQgKiBhcyBzZXNzaW9uIGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0ICogYXMgc3FsaXRlIGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCAqIGFzIGNvbm4gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5cbmV4cG9ydCBuYW1lc3BhY2UgQXNjaENvcmUge1xuICBleHBvcnQgY29uc3QgU21hcnREQiA9IHNkYi5TbWFydERCXG4gIGV4cG9ydCBjb25zdCBNb2RlbFNjaGVtYSA9IG1vZGVsLk1vZGVsU2NoZW1hXG4gIGV4cG9ydCB0eXBlIEJsb2NrID0gYmxvY2suQmxvY2tcbiAgZXhwb3J0IGNvbnN0IERiU2Vzc2lvbiA9IHNlc3Npb24uRGJTZXNzaW9uXG4gIGV4cG9ydCB0eXBlIERiQ29ubmVjdGlvbiA9IGNvbm4uRGJDb25uZWN0aW9uXG4gIGV4cG9ydCBjb25zdCBTcWxpdGVDb25uZWN0aW9uID0gc3FsaXRlLlNxbGl0ZUNvbm5lY3Rpb25cbn0gXG4iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIENhbGxiYWNrLCBNYXliZVVuZGVmaW5lZH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0ICogYXMgc3ViIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhjYWxsYmFjayA6IENhbGxiYWNrPGFueT4gfCB1bmRlZmluZWQgKSA6IHsgY2FsbGJhY2s6IENhbGxiYWNrPGFueT4sIHByb21pc2U6IFByb21pc2U8YW55PnxudWxsIH0ge1xuICBsZXQgcHJvbWlzZSA9IG51bGxcblxuICBpZiAoICFjYWxsYmFjayApIHtcbiAgICBjYWxsYmFjayA9IG1ha2VQcm9taXNlKClcbiAgICBwcm9taXNlID0gY2FsbGJhY2tbJ3Byb21pc2UnXVxuICB9XG5cbiAgcmV0dXJueyBjYWxsYmFjaywgcHJvbWlzZSB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxSZWFkYWJsZVN0cmVhbSBleHRlbmRzIFJlYWRhYmxlU3RyZWFtIHtcbiAgb24oIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjayA6IEZ1bmN0aW9uICkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxHZXQge1xuICBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4pIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj5cbiAgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbE9wZXJhdGlvbiB7XG4gIHB1dDxUPihrZXkgOiBhbnksIHZhbHVlIDogVCwgb3B0aW9ucz86IEpzb25PYmplY3QsIGNhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBiYXRjaChvcGVyQXJyYXk6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPzogSnNvbk9iamVjdCkgOiBQcm9taXNlPHZvaWQ+IFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4ZWRMZXZlbCBleHRlbmRzIExldmVsR2V0LCBMZXZlbE9wZXJhdGlvbiB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgaW5kZXhlcyA6IEFycmF5PEluZGV4RmllbGQ+XG4gIGJ5SW5kZXgoaW5kZXhGaWVsZDogc3RyaW5nKSA6IExldmVsR2V0XG4gIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4pOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1Yi5TdWJsZXZlbFxuXG4gIGNvbnN0cnVjdG9yKGRiRGlyIDogc3RyaW5nLCBtZXRhIDogQXJyYXk8U3ViTGV2ZWxNZXRhPiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5kYkRpciA9IGRiRGlyXG4gICAgdGhpcy5zdWJNZXRhcyA9IG5ldyBBcnJheTxTdWJMZXZlbE1ldGE+KCkuY29uY2F0KG1ldGEpXG4gICAgdGhpcy5zdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgSW5kZXhlZExldmVsPigpXG4gICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0KCkge1xuICAgIHRoaXMubGV2ZWxkYiA9IGxldmVsKCB0aGlzLmRiRGlyLCB7IHZhbHVlRW5jb2Rpbmc6ICdqc29uJyB9IClcbiAgICB0aGlzLnN1YkxldmVsZGIgPSBzdWIodGhpcy5sZXZlbGRiKVxuICAgIHRoaXMuc3ViTWV0YXMuZm9yRWFjaChzID0+IHRoaXMucmVnaXN0ZXJTdWJMZXZlbChzKSlcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJTdWJMZXZlbCggbWV0YTogU3ViTGV2ZWxNZXRhICkge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxkYi5zdWJsZXZlbChtZXRhLnN1Yk5hbWUpXG4gICAgY29uc3QgaW5kZXhlZFN1YiA9IG5ldyBJbmRleGVkU3ViTGV2ZWwoc3ViLCBtZXRhLnN1Yk5hbWUsIG1ldGEua2V5RmllbGQsIC4uLm1ldGEuaW5kZXhGaWVsZHMpICAgIFxuICAgIHRoaXMuc3ViTGV2ZWxzLnNldCggbWV0YS5zdWJOYW1lLCBpbmRleGVkU3ViKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0tleU5vdEZvdW5kRXJyb3IoIGVycjogRXJyb3IgKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlcnIgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhvcGVuQ2FsbGJhY2spXG5cbiAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBcbiAgICAoYXN5bmMoKT0+IHsgXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKVxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKSAgICAgIFxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVyciwgc2VsZilcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNsb3NlQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55PikgOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhjbG9zZUNhbGxiYWNrKVxuICAgIFxuICAgIGlmICh0aGlzLmlzQ2xvc2VkKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG5cbiAgICAoYXN5bmMoKT0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubGV2ZWxkYi5jbG9zZSgpXG4gICAgICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIpXG4gICAgICB9ICBcbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYiAmJiB0aGlzLmxldmVsZGIuaXNPcGVuKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuICghdGhpcy5sZXZlbGRiKSB8fCB0aGlzLmxldmVsZGIuaXNDbG9zZWQoKVxuICB9XG5cbiAgcHVibGljIGR1bXAoKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzLCByZWopID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpICAgICAgXG4gICAgICB0aGlzLmxldmVsZGIuY3JlYXRlUmVhZFN0cmVhbSgpXG4gICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gcmVzdWx0LnB1c2goYGtleT0gJHtkYXRhLmtleX0sIHZhbHVlPSAke2RhdGEudmFsdWV9YCkgKVxuICAgICAgICAub24oJ2Vycm9yJywgZSA9PiByZWooZSkgKVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlcyhyZXN1bHQuam9pbignXFxyXFxuJykpIClcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIEluZGV4ZWRTdWJMZXZlbCBpbXBsZW1lbnRzIEluZGV4ZWRMZXZlbCB7XG4gIHByaXZhdGUgc3ViTmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGtleUZpZWxkIDogc3RyaW5nXG4gIHByaXZhdGUgaW5kZXhBcnJheSA6IEFycmF5PEluZGV4RmllbGQ+XG4gIHByaXZhdGUgaW5kZXhlZFN1YkxldmVscyA6IE1hcDxzdHJpbmcsIExldmVsR2V0PlxuICBwcml2YXRlIHN1YkxldmVsRGIgOiBhbnlcblxuICBwdWJsaWMgZ2V0IG5hbWUoKSB7IHJldHVybiB0aGlzLnN1Yk5hbWUgfVxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSB7IHJldHVybiB0aGlzLmluZGV4QXJyYXkgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3VibGV2ZWw6IGFueSwgc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZCA6IHN0cmluZywgLi4uaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPikge1xuICAgIHRoaXMuc3ViTGV2ZWxEYiA9IHN1YmxldmVsXG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhBcnJheSA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdCguLi5pbmRleEZpZWxkcylcbiAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgTGV2ZWxHZXQ+KClcbiAgICB0aGlzLmluZGV4QXJyYXkuZm9yRWFjaCggZiA9PiB7XG4gICAgICBsZXQgc2Vub25kYXJ5ID0gU2Vub25kYXJ5KCBzdWJsZXZlbCwgZi5maWVsZE5hbWUsIGYuY2FsY0luZGV4IClcbiAgICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscy5zZXQoIGYuZmllbGROYW1lLCBzZW5vbmRhcnkgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlGaWVsZFxuICB9XG4gIFxuICBwcml2YXRlIGtleU5vdEZvdW5kVGhlblVuZGVmaW5lZDxUPiggY2FsbGJhY2s/OiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4gKSA6IE1heWJlVW5kZWZpbmVkPENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+Pj4ge1xuICAgIHJldHVybiAhY2FsbGJhY2sgPyB1bmRlZmluZWQgOiAoIGVyciA6IEVycm9yLCBkYXRhOiBUICkgPT4ge1xuICAgICAgY2FsbGJhY2soICBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvciggZXJyICkgPyBudWxsIDogZXJyICwgZGF0YSApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldDxUPihrZXk6IGFueSwgb3B0aW9uczogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+ICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+IHtcbiAgICBjb25zdCBrZXlMZXZlbCA9IHRoaXMuc3ViTGV2ZWxEYiBhcyBJbmRleGVkU3ViTGV2ZWwgXG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhnZXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAga2V5TGV2ZWwuZ2V0PFQ+KGtleSwgb3B0aW9ucywgdGhpcy5rZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQoY2FsbGJhY2spKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKGVycikgPyB1bmRlZmluZWQgOiBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBieUluZGV4KCBpbmRleEZpZWxkTmFtZSA6IHN0cmluZyApIDogTGV2ZWxHZXQge1xuICAgIGNvbnN0IGxldmVsR2V0ID0gIHRoaXMuaW5kZXhlZFN1YkxldmVscy5nZXQoaW5kZXhGaWVsZE5hbWUpXG4gICAgaWYgKCAhbGV2ZWxHZXQgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggaW5kZXggZmllbGQgPSAnJHtpbmRleEZpZWxkTmFtZX0nYClcblxuICAgIHJldHVybiBsZXZlbEdldFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPik6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGluZGV4TGV2ZWwgPSB0aGlzLmJ5SW5kZXgoIGluZGV4RmllbGQgKVxuXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGdldENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICBpbmRleExldmVsLmdldDxUPihrZXksIHRoaXMua2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkKGNhbGxiYWNrKSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvcihlcnIpID8gdW5kZWZpbmVkIDogZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcHV0PFQ+KGtleTogYW55LCB2YWx1ZTogVCwgcHV0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKHB1dENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN1YkxldmVsRGIucHV0KGtleSwgdmFsdWUsIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZGVsQ2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3ViTGV2ZWxEYi5kZWwoa2V5LCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IG9yZ2luYWxDYWxsYmFjayA9IGhhc09wdGlvbnMgPyBiYXRjaENhbGxiYWNrIDogb3B0aW9ucyBhcyBDYWxsYmFjazxhbnk+XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKCBvcmdpbmFsQ2FsbGJhY2sgKVxuICAgIHRyeSB7XG4gICAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgICAgdGhpcy5zdWJMZXZlbERiLmJhdGNoKGFycmF5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5zdWJMZXZlbERiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZUtleVN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucylcbiAgfVxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEhlaWdodCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKCBkaXIgOiBzdHJpbmcsIGxldmVsT3B0aW9ucyA9IHt9ICkge1xuICAgIC8qIFxuICAgICAgeyBpZCg2NCksIHRpbWVzdGFtcChiaWdpbnQpLCBoZWlnaHQoYmlnaW50KSwgcGF5bG9hZExlbmd0aChiaWdpbnQpLCBwYXlsb2FkSGFzaCg2NCksIHByZXZCbG9ja0lkKDY0KSwgXG4gICAgICAgIHBvaW50SWQoNjQpLCBwb2ludEhlaWdodChiaWdpbnQpLCBkZWxlZ2F0ZSg2NCksIHNpZ25hdHVyZSgxMjgpLCBjb3VudChiaWdpbnQpIH1cbiAgICAqL1xuICAgIGNvbnN0IGJsb2NrTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2JsaycsICdoZWlnaHQnLCBbXG4gICAgICB7IGZpZWxkTmFtZTogJ2lkJyB9LCBcbiAgICAgIHsgZmllbGROYW1lOiAnZGVsZWdhdGUnIH1cbiAgICBdKVxuICAgIGNvbnN0IGNoYW5nZXNMb2dNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnaGlzJywgJ2hlaWdodCcsIFtdKVxuICAgIFxuICAgIHRoaXMuZGIgPSBuZXcgTGV2ZWxEQiggZGlyLCBbYmxvY2tNZXRhLCBjaGFuZ2VzTG9nTWV0YV0sIGxldmVsT3B0aW9ucyApXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gLTFcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IGxhc3RCbG9ja0hlaWdodEl0ZW0gPSBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0PEJsb2NrSGVhZGVyPihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KSBcbiAgICBpZiAoIGxhc3RCbG9ja0hlaWdodEl0ZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxhc3RCbG9ja0hlaWdodEl0ZW0gPSB0aGlzLmdldExhc3RIZWlnaHRKc29uKCAtMSApXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrRGIucHV0KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgbGFzdEJsb2NrSGVpZ2h0SXRlbSlcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RCbG9ja0hlaWdodEl0ZW0uaGVpZ2h0ICBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIub3BlbigpXG4gICAgdGhpcy5ibG9ja0RiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnYmxrJylcbiAgICB0aGlzLmhpc3RvcnlEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2hpcycpXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RIZWlnaHQgXG4gIH1cblxuICBwcml2YXRlIGlzS2V5Tm90Rm91bmRFcnJvcihlKSA6IGJvb2xlYW4geyBcbiAgICByZXR1cm4gZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwcml2YXRlIGdldExhc3RIZWlnaHRKc29uKCBsYXN0SGVpZ2h0OiBudW1iZXIgKSA6IEJsb2NrSGVhZGVyIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVpZ2h0IDogbGFzdEhlaWdodCxcbiAgICAgIGlkIDogJ05VTEwnLFxuICAgICAgZGVsZWdhdGUgOiAnTlVMTCdcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXBwZW5kQmxvY2soIGJsb2NrIDogQmxvY2tIZWFkZXIsIGNoYW5nZXM6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWJsb2NrIHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUgfHwgYmxvY2suaGVpZ2h0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbihibG9jay5oZWlnaHQpIH1cbiAgIF0pXG5cbiAgICB0aGlzLmxhc3RIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9jayggaGVpZ2h0IDogbnVtYmVyICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0PEJsb2NrSGVhZGVyPihoZWlnaHQpXG4gICAgfVxuICAgIGNhdGNoKGUpIHtcbiAgICAgIGlmICghdGhpcy5pc0tleU5vdEZvdW5kRXJyb3IoZSkpIHRocm93IGVcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEhpc3RvcnlDaGFuZ2VzKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0OiBudW1iZXIgKSA6IFByb21pc2U8TWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pj4ge1xuICAgIGxldCByZXQgID0gbmV3IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oKVxuICAgIGZvciggbGV0IGggPSBtaW5IZWlnaHQ7IGggPCBtYXhIZWlnaHQ7IGgrKyApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSBhd2FpdCB0aGlzLmhpc3RvcnlEYi5nZXQ8QXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PihoKVxuICAgICAgY2hhbmdlcyAmJiByZXQuc2V0KCBoLCBjaGFuZ2VzIClcbiAgICB9XG4gICAgcmV0dXJuIHJldCBcbiAgfVxuICBcbiAgcHVibGljIGFzeW5jIGRlbGV0ZUxhc3RCbG9jayggaGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoaGVpZ2h0ICE9PSB0aGlzLmxhc3RCbG9ja0hlaWdodClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBsYXN0IGJsb2NrIGhlaWdodCAnJHtoZWlnaHR9J2ApXG5cbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAnZGVsJywga2V5IDogaGVpZ2h0IH0sXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHZhbHVlOiB0aGlzLmdldExhc3RIZWlnaHRKc29uKCBoZWlnaHQgLSAxICkgfSBcbiAgICBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RIZWlnaHQgLS1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXRCeTxCbG9ja0hlYWRlcj4oJ2lkJywgYmxvY2tJZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0IDsgaCA8PSBtYXhIZWlnaHQ7IGgrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2soaClcbiAgICAgIGJsb2NrICYmIHJlc3VsdC5wdXNoKCBibG9jayEgKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYmxvY2tJZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrQnlJZCggYmxvY2tJZHNbaV0gKVxuICAgICAgYmxvY2sgJiYgcmV0LnB1c2goIGJsb2NrIClcbiAgICB9XG4gICAgcmV0dXJuIHJldFxuICB9XG59IiwiZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xuICBBbGwgICAgPSAxMjggLSAxLFxuICBUcmFjZSAgPSA2NCxcbiAgRGVidWcgID0gMzIsXG4gIExvZyAgICA9IDE2LFxuICBJbmZvICAgPSA4LFxuICBXYXJuICAgPSA0LFxuICBFcnJvciAgPSAyLFxuICBGYXRhbCAgPSAxLFxuICBOb25lICAgPSAwXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nTGV2ZWwgOiBMb2dMZXZlbFxuICByZWFkb25seSBpbmZvRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IHRyYWNlRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgbG9nRW5hYmxlZCAgIDogYm9vbGVhblxuICByZWFkb25seSBkZWJ1Z0VuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IHdhcm5FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZXJyb3JFbmFsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBmYXRhbEVuYWJsZWQgOiBib29sZWFuXG5cbiAgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIHdhcm4oIG1zZzogc3RyaW5nICwgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxuICBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxufVxuXG5jbGFzcyBMb2dnZXJBZGFwdGVyIGltcGxlbWVudHMgTG9nZ2VyIHtcbiAgcHJpdmF0ZSBsZXZlbCA6IExvZ0xldmVsXG4gIHByaXZhdGUgbmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGZvcm1hdCA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBnZXRMb2dnZXIgOiAoKSA9PiBMb2dnZXJcblxuICBwdWJsaWMgZ2V0IGluZm9FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuSW5mbykgID4gMCB9XG4gIHB1YmxpYyBnZXQgdHJhY2VFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5UcmFjZSkgPiAwIH1cbiAgcHVibGljIGdldCBkZWJ1Z0VuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkRlYnVnKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGxvZ0VuYWJsZWQoKSAgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuTG9nKSAgID4gMCB9XG4gIHB1YmxpYyBnZXQgd2FybkVuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5XYXJuKSAgPiAwIH1cbiAgcHVibGljIGdldCBlcnJvckVuYWxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkVycm9yKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGZhdGFsRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRmF0YWwpID4gMCB9XG5cbiAgcHVibGljIGdldCBsb2dMZXZlbCgpIHsgcmV0dXJuIHRoaXMubGV2ZWwgfVxuICBwdWJsaWMgc2V0IGxvZ0xldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7IHRoaXMubGV2ZWwgPSBsZXZlbCB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGdldExvZ2dlcjogKCkgPT4gTG9nZ2VyLCBmb3JtYXRNZXNzYWdlID0gZmFsc2UsIGxvZ2dlck5hbWU6IHN0cmluZywgbGV2ZWwgPSBMb2dMZXZlbC5BbGwgKSB7XG4gICAgdGhpcy5uYW1lID0gbG9nZ2VyTmFtZVxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbFxuICAgIHRoaXMuZ2V0TG9nZ2VyID0gZ2V0TG9nZ2VyXG4gICAgdGhpcy5mb3JtYXQgPSBmb3JtYXRNZXNzYWdlXG4gIH1cblxuICBwcm90ZWN0ZWQgZnJvbWF0TWVzc2FnZSggbXNnOiBzdHJpbmcsIGxvZ1R5cGU6IHN0cmluZyApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0gWyR7bG9nVHlwZX1dIFske3RoaXMubmFtZX1dICR7bXNnfWBcbiAgfVxuXG4gIHB1YmxpYyBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0lORk8nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmluZm8oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdERUJVRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnTE9HJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1RSQUNFJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHdhcm4oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnV0FSTicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkud2FybiggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRVJST1InIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxuXG4gIHB1YmxpYyBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0ZBVEFMJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvZ01hbmFnZXIge1xuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nTGV2ZWwgPSBMb2dMZXZlbC5BbGxcbiAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlTG9nZ2VyID0gKCkgPT4gIGNvbnNvbGUgYXMgT2JqZWN0IGFzIExvZ2dlciBcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ2dlciA9IG5ldyBMb2dnZXJBZGFwdGVyKCBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgJ2RlZmF1bHQnLCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCApXG5cbiAgcHVibGljIHN0YXRpYyBzZXQgZGVmYXVsdExldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7XG4gICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgPSBsZXZlbFxuICB9XG4gIFxuICBwdWJsaWMgc3RhdGljIHNldCBsb2dGYWN0b3J5ICggdmFsdWU6ICgpID0+IExvZ2dlciApIHtcbiAgICBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciA9IHZhbHVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldExvZ2dlcihsb2dnZXJOYW1lPzogc3RyaW5nLCBsZXZlbD8gOiBMb2dMZXZlbCkgOiBMb2dnZXIge1xuICAgIHJldHVybiBsb2dnZXJOYW1lID8gXG4gICAgICBuZXcgTG9nZ2VyQWRhcHRlcihMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgbG9nZ2VyTmFtZSwgbGV2ZWwgfHwgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwpIDogXG4gICAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dnZXI7XG4gIH1cbn1cbiIsImltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEVudGl0eUtleSwgS2V5T2JqZWN0LCBDb2RlQ29udHJhY3QgYXMgREJDLCBwYXJ0aWFsLCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUPiA9IHsgbmV3KCkgOiBUIH1cbmV4cG9ydCB0eXBlIE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiA9IHN0cmluZyB8IENvbnN0cnVjdG9yPFRFbnRpdHk+XG5cbmV4cG9ydCBlbnVtIEZpZWxkVHlwZXMge1xuICBTdHJpbmcgICA9ICdTdHJpbmcnLFxuICBOdW1iZXIgICA9ICdOdW1iZXInLFxuICBCaWdJbnQgICA9ICdCaWdJbnQnLFxuICBUZXh0ICAgICA9ICdUZXh0J1xufVxuXG5leHBvcnQgdHlwZSBGaWVsZFR5cGUgPSBzdHJpbmcgfCBGaWVsZFR5cGVzXG5cbmV4cG9ydCBpbnRlcmZhY2UgRmllbGQge1xuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6IEZpZWxkVHlwZSxcbiAgbGVuZ3RoPzogbnVtYmVyICxcbiAgaW5kZXg/OiBib29sZWFuLFxuICBub3RfbnVsbD86IGJvb2xlYW4sXG4gIHByaW1hcnlfa2V5PyA6IGJvb2xlYW4sXG4gIGNvbXBvc2l0ZV9rZXk/IDogYm9vbGVhbixcbiAgZGVmYXVsdD86IG51bWJlcnxzdHJpbmd8bnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNjaGVtYSB7XG4gIHRhYmxlPyA6IHN0cmluZyxcbiAgbWVtb3J5PyA6IGJvb2xlYW4sXG4gIHJlYWRvbmx5PyA6IGJvb2xlYW4sXG4gIGxvY2FsPyA6IGJvb2xlYW4sXG4gIHRhYmxlRmllbGRzIDogQXJyYXk8RmllbGQ+XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVLZXkgaW1wbGVtZW50cyBLZXlPYmplY3Qge1xuICBwcml2YXRlIGtleU9iamVjdCA6IEpzb25PYmplY3RcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGtleU9iamVjdCA6IEpzb25PYmplY3QgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5T2JqZWN0JywgKCkgPT4gREJDLm5vdE51bGwoa2V5T2JqZWN0KSlcblxuICAgIHRoaXMua2V5T2JqZWN0ID0ga2V5T2JqZWN0XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1ha2U8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IFRFbnRpdHkgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgKCkgPT4gREJDLm5vdE51bGwoc2NoZW1hKSlcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCBzY2hlbWEuaXNDb21wc2l0ZUtleSwgJ21vZGVsIG11c3QgaW5kZW50aWZ5IGJ5IGNvbXBvc2l0ZSBrZXknKVxuICAgIERCQy5hcmd1bWVudCggJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkpXG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUtleSggcGFydGlhbChlbnRpdHksIHNjaGVtYS5jb21wb3NpdGVLZXlzKSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoIGtleUpzb25TdHJpbmc6IHN0cmluZyApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlKc29uU3RyaW5nJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2Uoa2V5SnNvblN0cmluZykpXG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUtleShKU09OLnBhcnNlKCBrZXlKc29uU3RyaW5nICkua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIGdldCBrZXlKc29uKCkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5rZXlPYmplY3RcbiAgfVxuICBcbiAgcHVibGljIGdldCBrZXkoKSA6IHN0cmluZyB7IFxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb3NpdGVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICghIGtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4ga2V5LmtleUpzb25cbn1cblxuZXhwb3J0IGNsYXNzIE1vZGVsU2NoZW1hIHtcbiAgcHJpdmF0ZSBzY2hlbWE6IFNjaGVtYVxuICBwcml2YXRlIG5hbWU6IHN0cmluZ1xuICBwcml2YXRlIG1lbW9yeTogYm9vbGVhblxuICBwcml2YXRlIHJlYWRvbmx5OiBib29sZWFuXG4gIHByaXZhdGUgbG9jYWw6IGJvb2xlYW5cblxuICBwcml2YXRlIHBLZXk6IE1heWJlVW5kZWZpbmVkPHN0cmluZz5cbiAgcHJpdmF0ZSBjS2V5czogQXJyYXk8c3RyaW5nPlxuICBwcml2YXRlIGFsbEZpZWxkczogQXJyYXk8c3RyaW5nPlxuICBwcml2YXRlIGFsbEZpZWxkVHlwZXM6IE1hcDxzdHJpbmcsIHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxJbmRleGVzOiBBcnJheTxzdHJpbmc+XG5cbiAgY29uc3RydWN0b3Ioc2NoZW1hOiBTY2hlbWEsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuc2NoZW1hID0gT2JqZWN0LmFzc2lnbih7fSAsIHNjaGVtYSlcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5tZW1vcnkgPSBzY2hlbWEubWVtb3J5ID09PSB0cnVlXG4gICAgdGhpcy5yZWFkb25seSA9IHNjaGVtYS5yZWFkb25seSA9PT0gdHJ1ZVxuICAgIHRoaXMubG9jYWwgPSBzY2hlbWEubG9jYWwgPT09IHRydWVcbiAgICB0aGlzLmF0dGFjaFZlcnNpb25GaWVsZCggdGhpcy5zY2hlbWEgKVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hWZXJzaW9uRmllbGQoIHNjaGVtYSA6IFNjaGVtYSApIHtcbiAgICBpZiAoIHNjaGVtYS50YWJsZUZpZWxkcy5maW5kKCBmID0+IGYubmFtZSA9PT0gJ192ZXJzaW9uXycpICkgcmV0dXJuXG4gICAgc2NoZW1hLnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRUeXBlKCB0eXBlIDogRmllbGRUeXBlICkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gdHlwZVxuICB9XG4gIFxuICBwcml2YXRlIHBhcnNlRmllbGRzKCkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgcHJpbWFyeUtleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLnByaW1hcnlfa2V5ID09PSB0cnVlICkgLm1hcCggZj0+IGYubmFtZSApXG4gICAgdGhpcy5jS2V5cyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlcihmID0+IGYuY29tcG9zaXRlX2tleSA9PT0gdHJ1ZSApLm1hcCggZj0+IGYubmFtZSApXG5cbiAgICB0aGlzLnBLZXkgPSBwcmltYXJ5S2V5cy5sZW5ndGggPT09IDEgPyBwcmltYXJ5S2V5c1swXSA6IHVuZGVmaW5lZFxuXG4gICAgbGV0IGtleVZhbGlkID0gKCB0aGlzLnBLZXkgIT09IHVuZGVmaW5lZCApICE9PSAoIHRoaXMuY0tleXMubGVuZ3RoID4gMSApIFxuICAgIGlmICggIWtleVZhbGlkICkgdGhyb3cgbmV3IEVycm9yKGBtb2RlbCBtdXN0IGhhdmUgcHJpbWFyeSBrZXkgb3IgY29tcG9zaXRlIGtleXMsIGJ1dCBjYW4gbm90IGJvdGhgKVxuXG4gICAgdGhpcy5hbGxGaWVsZFR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKVxuICAgIHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gdGhpcy5hbGxGaWVsZFR5cGVzLnNldCggZi5uYW1lLCB0aGlzLmNvbnZlcnRUeXBlKGYudHlwZSkpIClcbiAgICB0aGlzLmFsbEZpZWxkcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLm1hcCggZiA9PiBmLm5hbWUpXG4gICAgdGhpcy5hbGxJbmRleGVzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKCBmID0+IGYuaW5kZXggPT09IHRydWUgKS5tYXAoIGYgPT4gZi5uYW1lIClcbiAgfVxuXG4gIHB1YmxpYyBnZXRGaWVsZFR5cGVzKHNjaGVtYTogU2NoZW1hKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsRmllbGRUeXBlc1xuICB9XG5cbiAgcHVibGljIGdldCBzY2hlbWFPYmplY3QoKSA6IFNjaGVtYSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29tcHNpdGVLZXkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvc2l0ZUtleXMubGVuZ3RoID4gMSBcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJpbWFyeUtleSgpIDogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMucEtleVxuICB9XG5cbiAgcHVibGljIGdldCBjb21wb3NpdGVLZXlzKCkgOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuY0tleXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZmllbGROYW1lcygpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsRmllbGRzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEluZGV4ZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxOYW1lKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNMb2NhbCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYWxcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNSZWFkb25seSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVhZG9ubHlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVtQ2FjaGVkKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlcbiAgfVxuXG4gIHB1YmxpYyBzZXRLZXk8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwga2V5OiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGlmICggIXRoaXMuaXNDb21wc2l0ZUtleSApIHtcbiAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXkhXSA9IGtleVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjayA9IGtleSBhcyBDb21wb3NpdGVLZXlcbiAgICAgIHRoaXMuY0tleXMuZm9yRWFjaCggZiA9PiBlbnRpdHlbZl0gPSBjay5rZXlKc29uW2ZdIClcbiAgICB9XG4gICAgcmV0dXJuIGVudGl0eVxuICB9XG5cbiAgcHVibGljIGdldEtleTxURW50aXR5PihlbnRpdHkgOiBURW50aXR5KSA6IEVudGl0eUtleSB7XG4gICAgcmV0dXJuIHRoaXMuaXNDb21wc2l0ZUtleSA/IFxuICAgICAgQ29tcG9zaXRlS2V5Lm1ha2UoIHRoaXMsIGVudGl0eSApIDpcbiAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXkhXVxuICB9XG5cbiAgcHVibGljIG5ld0VudGl0eTxURW50aXR5PiAoIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleSA6IEVudGl0eUtleSApIDogVEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IGlzU3RyaW5nKG1vZGVsKSA/IFxuICAgICAgeyB9IGFzIFRFbnRpdHkgOiBcbiAgICAgIG5ldyAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkoKVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0S2V5KCBlbnRpdHksIGtleSApXG4gIH1cblxuICBwdWJsaWMgY29weVByb3BlcnRpZXM8VEVudGl0eT4oIGRlc3Q6IFRFbnRpdHksIHNyYyA6IFRFbnRpdHksIGluY2x1ZGVLZXkgPSBmYWxzZSApIHtcbiAgICB0aGlzLmFsbEZpZWxkcy5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGlmICggIWluY2x1ZGVLZXkgJiYgKCB0aGlzLmNLZXlzLmluZGV4T2YoZikgPj0gMCB8fCBmID09PSB0aGlzLnByaW1hcnlLZXkgKSApIHJldHVyblxuICAgICAgZGVzdFtmXSA9IHNyY1tmXVxuICAgIH0pXG4gIH1cbn0iLCJpbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5S2V5LCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IGlzQXJyYXksIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IEpzb25TcWwgPSByZXF1aXJlKCdqc29uLXNxbCcpKHsgc2VwYXJhdGVkVmFsdWVzOiBmYWxzZSB9KVxuY29uc3QgY2hhbmdlQ2FzZSA9IHJlcXVpcmUoJ2NoYW5nZS1jYXNlJylcblxuZXhwb3J0IGNvbnN0IE1VTFRJX1NRTF9TRVBBUkFUT1IgPSAnOydcblxuLy8gJ2NyZWF0ZSd8J3NlbGVjdCd8J3VwZGF0ZSd8J3JlbW92ZSd8J290aGVyJ1xuZXhwb3J0IGVudW0gU3FsVHlwZSB7XG4gIFNjaGVtYSA9IDAsXG4gIFNlbGVjdCA9IDEsXG4gIEluc2VydCA9IDIgLFxuICBVcGRhdGUgPSAzLFxuICBEZWxldGUgPSA0LFxuICBPdGhlciAgPSA5XG59XG5cbmV4cG9ydCB0eXBlIFNxbFBhcmFtZXRlcnMgPSBBcnJheTxhbnk+IHwgSnNvbk9iamVjdFxuZXhwb3J0IHR5cGUgU3FsQW5kUGFyYW1ldGVycyA9IHsgXG4gIHR5cGU6IFNxbFR5cGUsICBcbiAgcXVlcnk6IHN0cmluZywgXG4gIHBhcmFtZXRlcnM/IDogU3FsUGFyYW1ldGVycyxcbiAgZXhwZWN0RWZmZWN0ZWQ/IDogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBVbmFyeU9wZXJhdG9ycyA9ICckbnVsbCd8JyRpcyd8JyRpc25vdCdcbmV4cG9ydCB0eXBlIEJpbmFyeU9wZXJhdG9ycyA9ICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSd8JyRsaWtlJ3wnJGZpZWxkJ3wnJGluJ3wnJG5pbid8JyRiZXR3ZWVuJ1xuZXhwb3J0IHR5cGUgUmVsYXRpb25PcGVyYXRvcnMgPSAnJG5vdCd8JyRhbmQnfCckb3InXG5cbmV4cG9ydCB0eXBlIFNlbGVjdEV4cHJlc3Npb24gPSB7XG4gIHNlbGVjdCA6IHtcbiAgICB0YWJsZSA6IHN0cmluZyxcbiAgICBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPixcbiAgICB3aGVyZT8gOiBzdHJpbmcsXG4gICAgW2tleSA6IHN0cmluZ10gOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBWYWx1ZUV4cHJlc3Npb24gPSBzdHJpbmcgfCBudW1iZXJcbmV4cG9ydCB0eXBlIEZpZWxkVmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogc3RyaW5nIHwgbnVtYmVyIH1cbmV4cG9ydCB0eXBlIEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gPSB7IFtmaWVsZCA6IHN0cmluZ10gOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IH1cbmV4cG9ydCB0eXBlIE51bGxDb21wYXJlRXhwcmVzc2lvbiA9IHsgJG51bGwgOiBzdHJpbmcgfSB8IHsgW29wZXIgaW4gJyRpcyd8J2lzbm90J10/IDogeyBbZmllbGQgOiBzdHJpbmddIDogbnVsbH0gfVxuXG5leHBvcnQgdHlwZSBWYWx1ZUNvbXBhcmVFeHByZXNzaW9uID0gRmllbGRWYWx1ZUV4cHJlc3Npb24gfCB7IFtmaWVsZCA6IHN0cmluZ10gOiB7IFtvcGVyIGluICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSddPyA6IFZhbHVlRXhwcmVzc2lvbiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBBcnJheUNvbXBhcmVFeHByZXNzaW9uID0gRmllbGRBcnJheVZhbHVlRXhwcmVzc2lvbiB8IHsgIFtmaWVsZCA6IHN0cmluZ10gOiB7IFtvcGVyIGluICckYmV0d2Vlbid8JyRpbid8JyRuaW4nXT8gOiBBcnJheTxWYWx1ZUV4cHJlc3Npb24+IHwgU2VsZWN0RXhwcmVzc2lvbiB9IH1cbmV4cG9ydCB0eXBlIExpa2VFeHByZXNzaW9uID0geyBba2V5IDogc3RyaW5nXTogeyAkbGlrZSA6IHN0cmluZyB9IH0gXG5cbmV4cG9ydCB0eXBlIENvbXBhcmVFeHByZXNzaW9uID0gVmFsdWVDb21wYXJlRXhwcmVzc2lvbiB8IEFycmF5Q29tcGFyZUV4cHJlc3Npb24gfCBMaWtlRXhwcmVzc2lvbiB8IE51bGxDb21wYXJlRXhwcmVzc2lvblxuZXhwb3J0IHR5cGUgUmVsYXRpb25FeHByZXNzaW9uID0gQXJyYXk8Q29tcGFyZUV4cHJlc3Npb24+IHwgLy8gVGhlICRhbmQgaXMgb21pdHRlZCBcbiAgeyAkbm90IDogQ29tcGFyZUV4cHJlc3Npb24gfCBSZWxhdGlvbkV4cHJlc3Npb24gfSB8IFxuICB7IFtvcGVyIGluICckYW5kJ3wgJyRvciddPyA6IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IEFycmF5PFJlbGF0aW9uRXhwcmVzc2lvbj4gfVxuIFxuZXhwb3J0IHR5cGUgU3FsQ29uZGl0aW9uID0gQ29tcGFyZUV4cHJlc3Npb24gfCBSZWxhdGlvbkV4cHJlc3Npb25cblxuZXhwb3J0IHR5cGUgTGltaXRBbmRPZmZzZXQgPSB7XG4gIGxpbWl0PyA6IG51bWJlcixcbiAgb2Zmc2V0PyA6IG51bWJlclxufVxuZXhwb3J0IHR5cGUgU3FsUmVzdWx0UmFuZ2UgPSBudW1iZXIgfCBMaW1pdEFuZE9mZnNldFxuXG5leHBvcnQgdHlwZSBTcWxPcmRlckl0ZW0gPSB7XG4gIFtmaWVsZCA6IHN0cmluZ10gOiAnQVNDJyB8ICdERVNDJyB8IDEgfCAtMSBcbn1cblxuZXhwb3J0IHR5cGUgU3FsT3JkZXIgPSBTcWxPcmRlckl0ZW0gfCBBcnJheTxTcWxPcmRlckl0ZW0+XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3FsQnVpbGRlciB7XG4gIGJ1aWxkU2NoZW1hKCBzY2hlbWE6IE1vZGVsU2NoZW1hICkgOiBBcnJheTxzdHJpbmc+XG4gIGJ1aWxkSW5zZXJ0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGREZWxldGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzOiBBcnJheTxzdHJpbmc+LCB3aGVyZSA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICBsZXQgc3FscyA9IG5ldyBBcnJheTxzdHJpbmc+KCkgXG4gICAgY29uc3Qgc2NoZW1hT2JqZWN0ID0gT2JqZWN0LmFzc2lnbih7IHR5cGU6ICdjcmVhdGUnfSwgZGVlcENvcHkoc2NoZW1hLnNjaGVtYU9iamVjdCkpIFxuICAgIC8vIFRPRE86IGdlbmVyYXRlIGNvbXBvc2l0ZSBrZXkgc3FsXG4gICAgbGV0IHNjaGVtYVNxbCA9IEpzb25TcWwuYnVpbGQoc2NoZW1hT2JqZWN0KVxuICAgIHNxbHMucHVzaChzY2hlbWFTcWwucXVlcnkpXG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIHNjaGVtYS5pbmRleGVzLmZvckVhY2goIGZpZWxkID0+IHtcbiAgICAgIHNxbHMucHVzaChKc29uU3FsLmJ1aWxkKHtcbiAgICAgICAgdHlwZTogJ2luZGV4JyxcbiAgICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgICAgbmFtZTogdGFibGVOYW1lICsgJ18nICsgZmllbGQsXG4gICAgICAgIGluZGV4T246IGZpZWxkXG4gICAgICB9KS5xdWVyeSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHNxbHNcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNlbGVjdChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZHNPclBhcmFtczogQXJyYXk8c3RyaW5nPiB8IEpzb25PYmplY3QsIHdoZXJlPyA6IFNxbENvbmRpdGlvbiwgXG4gICAgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApOiBTcWxBbmRQYXJhbWV0ZXJzIHtcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgXG4gICAgbGV0IHF1ZXJ5T3B0aW9ucyA6IEpzb25PYmplY3RcbiAgICBpZiAoICFpc0FycmF5KCBmaWVsZHNPclBhcmFtcyApICkge1xuICAgICAgbGV0IHBhcmFtcyA9IGZpZWxkc09yUGFyYW1zIGFzIEpzb25PYmplY3RcbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oIHsgdHlwZTogJ3NlbGVjdCcsIHRhYmxlOiB0YWJsZU5hbWUgfSwgcGFyYW1zIClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsZXQgZmllbGRzID0gZmllbGRzT3JQYXJhbXMgfHwgc2NoZW1hLmZpZWxkTmFtZXMubWFwKCBmID0+IHNjaGVtYS5zY2hlbWFPYmplY3QudGFibGUgKyAnLicgKyBmIClcbiAgICAgIGxldCBsbyA6IExpbWl0QW5kT2Zmc2V0ID0gaXNOdW1iZXIoIHJlc3VsdFJhbmdlICkgPyAgeyBsaW1pdCA6IHJlc3VsdFJhbmdlIH0gOiByZXN1bHRSYW5nZSB8fCB7IH1cbiAgICAgIGxldCBvcmRlciA9IHNvcnQgfHwge31cbiAgICAgIGZvciAoIGxldCBrZXkgb2YgUmVmbGVjdC5vd25LZXlzKG9yZGVyKSAgKSB7XG4gICAgICAgIGxldCBvcmRlclZhbHVlID0gb3JkZXJba2V5XSB8fCAtMVxuICAgICAgICBvcmRlcltrZXldID0gKG9yZGVyVmFsdWUgPT09ICdBU0MnKSA/IDEgOiAoIChvcmRlclZhbHVlID09PSAnREVTQycpID8gLTEgOiBvcmRlclZhbHVlIClcbiAgICAgIH1cblxuICAgICAgcXVlcnlPcHRpb25zID0ge1xuICAgICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgICAgZmllbGRzOiBmaWVsZHMsXG4gICAgICAgIGNvbmRpdGlvbjogd2hlcmUsXG4gICAgICAgIGxpbWl0OiBsby5saW1pdCxcbiAgICAgICAgb2Zmc2V0OiBsby5vZmZzZXQsXG4gICAgICAgIHNvcnQ6IG9yZGVyLFxuICAgICAgICBqb2luOiBqb2luXG4gICAgICB9XG4gICAgfVxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5TZWxlY3QgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHF1ZXJ5T3B0aW9ucykpXG4gIH1cbn0iLCJpbXBvcnQgeyBTcWxpdGVXcmFwcGVyIH0gZnJvbSAnLi9TcWxpdGVXcmFwcGVyJ1xuaW1wb3J0IHsgTVVMVElfU1FMX1NFUEFSQVRPUiwgU3FsQW5kUGFyYW1ldGVycywgU3FsUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiwgQ29ubmVjdGlvbk9wdGlvbnMsIFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcblxuXG5jbGFzcyBTcWxpdGVUcmFuc2FjdGlvbiBpbXBsZW1lbnRzIERCVHJhbnNhY3Rpb24ge1xuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29tbWl0KCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnQ09NTUlUOycpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2soKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdST0xMQkFDSzsnKSBcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3FsaXRlQ29ubmVjdGlvbiBpbXBsZW1lbnRzIERiQ29ubmVjdGlvbiB7XG4gIHByaXZhdGUgb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zXG4gIHByaXZhdGUgc3FsaXRlIDogU3FsaXRlV3JhcHBlclxuXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnMgKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuc3FsaXRlID0gbmV3IFNxbGl0ZVdyYXBwZXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBjb25uZWN0aW9uT3B0aW9ucygpOiBDb25uZWN0aW9uT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9uc1xuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmFzeW5PcGVuKCB0aGlzLm9wdGlvbnMuc3RvcmFnZSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGlzY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5DbG9zZSgpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luUXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5U3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLnF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQ6IFNxbEV4ZWN1dGVSZXN1bHQgKSB7XG4gICAgaWYgKCByZXN1bHQucm93c0VmZmVjdGVkID09PSAwKSAgdGhyb3cgbmV3IEVycm9yKCdOb25lIHJvdyBlZmZlY3RlZCcpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoU3luYyggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmV4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSAsIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCApIFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luRXhlY3V0ZSggc3FsLCBwYXJhbWV0ZXJzIClcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW5TY3JpcHQoc3FsOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgc3FsLnNwbGl0KCBNVUxUSV9TUUxfU0VQQVJBVE9SICkuZm9yRWFjaChcbiAgICAgIGFzeW5jIHNxbD0+IGF3YWl0IChzcWwudHJpbSgpICE9PSAnJykgJiYgdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIFtdKVxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zKCk6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZSgnQkVHSU4gVFJBTlNBQ1RJT047JylcbiAgICByZXR1cm4gbmV3IFNxbGl0ZVRyYW5zYWN0aW9uKHRoaXMpXG4gIH1cbn0iLCJpbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dNYW5hZ2VyLCBMb2dnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBTcWxQYXJhbWV0ZXJzLCBTcWxBbmRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuXG5pbXBvcnQgKiBhcyBEYXRhYmFzZSBmcm9tICdiZXR0ZXItc3FsaXRlMydcblxuZXhwb3J0IGNsYXNzIFNxbGl0ZVdyYXBwZXIge1xuICBwcml2YXRlIGRiIDogRGF0YWJhc2VcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTcWxpdGVXcmFwcGVyLm5hbWUpXG4gIH1cblxuICBwdWJsaWMgb3BlbihkYkZpbGVQYXRoOiBzdHJpbmcsIGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJGaWxlUGF0aClcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1Mgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCkgOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZGIub3BlbiB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5PcGVuKGRiRmlsZVBhdGg6IHN0cmluZykgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMub3BlbikuY2FsbCh0aGlzLCBkYkZpbGVQYXRoKVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIGlmICggdGhpcy5kYiAmJiB0aGlzLmlzQ29ubmVjdGVkICkge1xuICAgICAgICB0aGlzLmRiLmNsb3NlKCkgXG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1MgY2xvc2VgIClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBjbG9zZWQgYWxyZWFkeWApXG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIGNsb3NlYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdCAgICBcbiAgfVxuXG4gIHB1YmxpYyBhc3luQ2xvc2UoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5jbG9zZSkuY2FsbCh0aGlzKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPFNxbEV4ZWN1dGVSZXN1bHQ+KTogU3FsRXhlY3V0ZVJlc3VsdCB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogeyBsYXN0SW5zZXJ0Um93SWQ6ICcwJywgcm93c0VmZmVjdGVkOiAwIH0gfVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBjb25zdCBzcWxSZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5ydW4ocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHJldC5yZXN1bHQgPSB7IFxuICAgICAgICBsYXN0SW5zZXJ0Um93SWQgOiBzcWxSZXN1bHQubGFzdEluc2VydFJPV0lELnRvU3RyaW5nKCksXG4gICAgICAgIHJvd3NFZmZlY3RlZDogc3FsUmVzdWx0LmNoYW5nZXMgXG4gICAgICB9XG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgZXhlY3V0ZSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgZWZmZWN0ZWQgPSAke3JldC5yZXN1bHQucm93c0VmZmVjdGVkfWApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PGFueT4+ICkgOiBBcnJheTxhbnk+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8YW55PigpIH1cbiAgICB0cnkge1xuICAgICAgcmV0LnJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLmFsbChwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCByZXN1bHQgY291bnQgPSAke3JldC5yZXN1bHQubGVuZ3RofWApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+ICApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PigpIH0gXG4gICAgbGV0IHNxbCA6IFNxbEFuZFBhcmFtZXRlcnMgfCB1bmRlZmluZWRcbiAgICB0cnkge1xuICAgICAgc3Fscy5mb3JFYWNoKCBzID0+IHtcbiAgICAgICAgc3FsID0gc1xuICAgICAgICBsZXQgZXhlY1JldCA9IHRoaXMuZXhlY3V0ZSggcy5xdWVyeSwgcy5wYXJhbWV0ZXJzIClcbiAgICAgICAgb25FeGVjdXRlZCAmJiBvbkV4ZWN1dGVkKCBleGVjUmV0LCBzICkgIFxuICAgICAgICByZXQucmVzdWx0LnB1c2goIGV4ZWNSZXQgKVxuICAgICAgfSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlQmF0Y2gsIHNxbCA9ICR7c3FsIS5xdWVyeX0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHNxbCEucGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soIHJldC5lcnIsIHJldC5yZXN1bHQgKVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bkV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlKS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luUXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5xdWVyeSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQgKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZUJhdGNoKS5jYWxsKCB0aGlzLCBzcWxzLCBvbkV4ZWN1dGVkIClcbiAgfVxuXG59IiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcbmltcG9ydCB7IEVudGl0eUtleSwgQ29kZUNvbnRyYWN0IGFzIERCQywgTWF5YmVVbmRlZmluZWQsIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTGV2ZWxCbG9jayB9IGZyb20gJy4vTGV2ZWxCbG9jaydcbmltcG9ydCB7IERiU2Vzc2lvbiB9IGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsaXRlQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yLCBpc0NvbXBvc2l0ZUtleSB9IGZyb20gJy4vTW9kZWwnO1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IEVudGl0eVByb3h5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBCbG9ja0hlYWRlciwgQmxvY2ssIFRyYW5zYWN0aW9uIH0gZnJvbSAnLi9CbG9jaydcbmltcG9ydCB7IEJsb2NrQ2FjaGUgfSBmcm9tICcuL0Jsb2NrQ2FjaGUnXG5cbnR5cGUgTmFtZWRIb29rPFRGdW5jPiA9IHsgbmFtZTogc3RyaW5nLCBob29rIDogVEZ1bmMgfVxuZXhwb3J0IHR5cGUgQ29tbWl0QmxvY2tIb29rID0gKCBibG9jayA6IEJsb2NrICkgPT4gdm9pZFxuZXhwb3J0IHR5cGUgUm9sbGJhY2tCbG9ja0hvb2sgPSAoIGZyb21IZWlnaHQgOiBudW1iZXIsIHRvSGVpZ2h0IDogbnVtYmVyICkgPT4gdm9pZFxuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBjYWNoZWQgbGFzdCBibG9jayBjb3VudCBcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGNhY2hlZEJsb2NrQ291bnQ/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCA1MDAwIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGNvbW1pdEJsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxDb21taXRCbG9ja0hvb2s+PlxuICBwcml2YXRlIHJvbGxiYWNrQmxvY2tIb29rczogQXJyYXk8TmFtZWRIb29rPFJvbGxiYWNrQmxvY2tIb29rPj5cbiAgcHJpdmF0ZSBjYWNoZWRCbG9ja3MgOiBCbG9ja0NhY2hlXG4gIHByaXZhdGUgc2NoZW1hcyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBibG9ja1Nlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBsb2NhbFNlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBibG9ja0RCIDogTGV2ZWxCbG9ja1xuICBwcml2YXRlIGN1cnJlbnRCbG9jayA6IEJsb2NrIHwgbnVsbFxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvciBcbiAgICogTk9USUMgOiB5b3UgbmVlZCBjYWxsIGluaXQgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBkYlBhdGggcGF0aCBvZiBibG9ja2NoYWluIGRiXG4gICAqIEBwYXJhbSBsZXZlbEJsb2NrRGlyIHBhdGggb2YgYmxvY2sgaGVhZGVyIGRiXG4gICAqIEBwYXJhbSBvcHRpb25zIG9mIFNtYXJ0REJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGJQYXRoOiBzdHJpbmcsIGxldmVsQmxvY2tEaXI6IHN0cmluZywgb3B0aW9ucz8gOiBTbWFydERCT3B0aW9ucyApIHtcbiAgICBEQkMuYXJndW1lbnQoJ2RiUGF0aCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoZGJQYXRoKSlcbiAgICBEQkMuYXJndW1lbnQoJ2xldmVsQmxvY2tEaXInLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGxldmVsQmxvY2tEaXIpKVxuXG4gICAgc3VwZXIoKVxuICAgIHRoaXMub3B0aW9ucyA9ICB7XG4gICAgICBjYWNoZWRCbG9ja0NvdW50IDogMTAsXG4gICAgICBoaXN0b3J5Rm9yUm9sbGJhY2sgOiAxMCxcbiAgICAgIGF1dG9DbGVhblBlcnNpc3RlZEhpc3RvcnkgOiBmYWxzZSwgICAgICBcbiAgICAgIGVudGl0eUNhY2hlT3B0aW9ucyA6IHsgZGVmYXVsdCA6IDUwMDAgfVxuICAgIH0gfHwgb3B0aW9uc1xuXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxDb21taXRCbG9ja0hvb2s+PigpXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MgPSBuZXcgQXJyYXk8TmFtZWRIb29rPFJvbGxiYWNrQmxvY2tIb29rPj4oKVxuICAgIHRoaXMuc2NoZW1hcyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU21hcnREQi5uYW1lKVxuICAgIHRoaXMuYmxvY2tEQiA9IG5ldyBMZXZlbEJsb2NrKGxldmVsQmxvY2tEaXIpXG4gICAgdGhpcy5jYWNoZWRCbG9ja3MgPSBuZXcgQmxvY2tDYWNoZSggdGhpcy5vcHRpb25zLmNhY2hlZEJsb2NrQ291bnQhIClcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBuZXcgU3FsaXRlQ29ubmVjdGlvbih7IHN0b3JhZ2U6IGRiUGF0aCB9KVxuICAgIHRoaXMuYmxvY2tTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdCbG9jaycpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0xvY2FsJylcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiAsIHRocm93SWZVbmRlZmluZWQgPSBmYWxzZSwgdGhyb3dJZlJlYWRvbmx5ID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TW9kZWxTY2hlbWE+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBpc1N0cmluZyggbW9kZWwgKSA/IFN0cmluZyhtb2RlbCkgOiAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkubmFtZSBcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5zY2hlbWFzLmdldChtb2RlbE5hbWUpIFxuICAgIHRocm93SWZVbmRlZmluZWQgJiYgREJDLnZlcmlmeSggc2NoZW1hICE9PSB1bmRlZmluZWQsIGB1bnJlZ2lzdGVyZWQgbW9kZWwgJyR7IG1vZGVsTmFtZSB9J2ApXG4gICAgdGhyb3dJZlJlYWRvbmx5ICYmIERCQy52ZXJpZnkoICFzY2hlbWEhLmlzUmVhZG9ubHksIGBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nIGlzIHJlYWRvbmx5YClcblxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2Vzc2lvbjxURW50aXR5Piggc2NoZW1hIDogTW9kZWxTY2hlbWEgKSA6IERiU2Vzc2lvbiB7IFxuICAgIHJldHVybiBzY2hlbWEhLmlzTG9jYWwgPyB0aGlzLmxvY2FsU2Vzc2lvbiA6IHRoaXMuYmxvY2tTZXNzaW9uXG4gIH1cblxuICBwcml2YXRlIHByZUNvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGJsb2NrICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Q29tbWl0QmxvY2soIGJsb2NrOiBCbG9jayApIHtcbiAgICB0aGlzLmVtaXQoJ25ld0Jsb2NrJywgYmxvY2spXG4gIH1cblxuICBwcml2YXRlIHByZVJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGZyb20sIHRvICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Um9sbGJhY2tCbG9jayggZnJvbSA6IG51bWJlciwgdG8gOiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbWl0KCdyb2xsYmFja0Jsb2NrJywgeyBmcm9tLCB0byB9IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciBjb21taXQgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGJsb2NrICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyQ29tbWl0QmxvY2tIb29rKCBuYW1lOiBzdHJpbmcsIGhvb2tGdW5jOiBDb21taXRCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcbiAgICBcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2sgOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kSW5kZXgoIG5oID0+IG5oLm5hbWUgPT09IG5hbWUudHJpbSgpIClcbiAgICBpZiAoIGluZGV4ID49IDAgKSB0aGlzLmNvbW1pdEJsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciByb2xsYmFjayBibG9jayBob29rLCB3aGljaCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgY29tbWl0IGJsb2NrXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKiBAcGFyYW0gaG9va0Z1bmMgaG9vayBmdW5jdGlvbiAsICggZnJvbUhlaWdodCwgdG9IZWlnaHQgKSA9PiB2b2lkXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogUm9sbGJhY2tCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZChuaD0+bmgubmFtZSA9PT0gbmFtZS50cmltKCkpID09PSB1bmRlZmluZWQsIFxuICAgICAgYGhvb2sgbmFtZWQgJyR7bmFtZX0nIGV4aXN0IGFscmVhZHlgKVxuXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2s6IGhvb2tGdW5jIH0pXG4gIH1cblxuICAvKipcbiAgICogdW5yZWdpc3RlciByb2xsYmFjayBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgIFxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBmb3IoIGNvbnN0IHNjaGVtYSBvZiBzY2hlbWFzICkge1xuICAgICAgdGhpcy5zY2hlbWFzLnNldCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hIClcbiAgICAgIGxldCBzZXNzaW9uID0gdGhpcy5nZXRTZXNzaW9uKCBzY2hlbWEgKVxuXG4gICAgICBzZXNzaW9uLnJlZ2lzdGVyU2NoZW1hKHNjaGVtYSlcbiAgICAgIHNlc3Npb24uc3luY1NjaGVtYShzY2hlbWEpXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBzeW5jIHNjaGVtYSBtb2RlbCA9ICR7c2NoZW1hLm1vZGVsTmFtZX0gYClcblxuICAgICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICkgeyBcbiAgICAgICAgbGV0IGl0ZW1zID0gYXdhaXQgc2Vzc2lvbi5nZXRNYW55KCBzY2hlbWEubW9kZWxOYW1lLCB7fSwgZmFsc2UsIHRydWUgKVxuICAgICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBtb2RlbCAke3NjaGVtYS5tb2RlbE5hbWV9IGNhY2hlZCAke2l0ZW1zLmxlbmd0aH0gZW50aXRpZXMgYClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5lbWl0KCAncmVhZHknLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmcmVlIHJlc291cmNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5jbG9zZSgpXG4gICAgXG4gICAgdGhpcy5lbWl0KCdjbG9zZWQnLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBoZWlnaHQgb2YgbGFzdCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tEQi5sYXN0QmxvY2tIZWlnaHRcbiAgfVxuXG4gIC8qKlxuICAgKiBibG9ja3MgY291bnRcbiAgICovXG4gIHB1YmxpYyBnZXQgYmxvY2tzQ291bnQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMVxuICB9XG5cbiAgLyoqXG4gICAqIGxhc3QgY29tbWl0ZWQgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrKCkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIC8vIFRPRE86IHJldHVybiBsYXN0IGJsb2NrIGNvcHkgP1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgfVxuXG4gIC8qKlxuICAgKiBob2xkIGEgbG9jayBuYW1lIHdoaWNoIG9ubHkgc3VjY2VlZCBpbiBmaXJzdCB0aW1lIG9mIGVhY2ggYmxvY2suXG4gICAqIEBwYXJhbSBsb2NrTmFtZSBsb2NrIG5hbWVcbiAgICogQHBhcmFtIG5vdFRocm93IGRvIG5vdCB0aHJvdyBleGNlcHRpb24gaWYgbG9jayBmYWlsZWRcbiAgICovXG4gIHB1YmxpYyBsb2NrSW5DdXJyZW50QmxvY2soIGxvY2tOYW1lOiBzdHJpbmcsIG5vdFRocm93ID0gZmFsc2UgKSA6IGJvb2xlYW4ge1xuICAgcmV0dXJuIHRoaXMuYmxvY2tTZXNzaW9uLmxvY2tJblRoaXNTZXNzaW9uKCBsb2NrTmFtZSwgbm90VGhyb3cpXG4gIH1cblxuICAvKipcbiAgICogYmVnaW4gYSBjb250cmFjdCB0cmFuc2FjdGlvbiB3aGljaCBlZmZlY3QgZW50aXRpZXMgaW4gbWVtb3J5XG4gICAqL1xuICBwdWJsaWMgYmVnaW5Db250cmFjdCgpIDogdm9pZCB7XG4gICAgdGhpcy5ibG9ja1Nlc3Npb24uYmVnaW5FbnRpdHlUcmFuc2FjdGlvbigpXG4gIH1cblxuICAvKipcbiAgICogY29tbWl0IGNvbnRyYWN0IHRyYW5zYWN0aW9uIHdoaWNoIGVmZmVjdCBlbnRpdGllcyBpbiBtZW1vcnlcbiAgICovXG4gIHB1YmxpYyBjb21taXRDb250cmFjdCgpIDogdm9pZCB7XG4gICAgdGhpcy5ibG9ja1Nlc3Npb24uY29tbWl0RW50aXR5VHJhbnNhY3Rpb24oKVxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGNvbnRyYWN0IHRyYW5zYWN0aW9uIHdoaWNoIGVmZmVjdCBlbnRpdGllcyBpbiBtZW1vcnlcbiAgICovXG4gIHB1YmxpYyByb2xsYmFja0NvbnRyYWN0KCkgOiB2b2lkIHtcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0VudGl0eVRyYW5zYWN0aW9uKClcbiAgfVxuICBcbiAgLyoqXG4gICAqIGJlZ2luIGEgbmV3IGJsb2NrXG4gICAqIEBwYXJhbSBibG9ja0hlYWRlciBcbiAgICovXG4gIHB1YmxpYyBiZWdpbkJsb2NrKCBibG9jazogQmxvY2sgKSA6IHZvaWQge1xuICAgIC8vIFRPRE86IHZlcmlmeSBibG9ja0hlYWRlciBoZXJlXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsICgpPT4gREJDLm5vdE51bGwoYmxvY2spKVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCBibG9jay5oZWlnaHQgPT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMSwgYGludmFsaWQgYmxvY2sgaGVpZ2h0ICR7YmxvY2suaGVpZ2h0fSwgbGFzdCA9ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcbiAgICBcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBibG9jayBoZWlnaHQgPSAke2Jsb2NrLmhlaWdodH1gKVxuICAgIHRoaXMuY3VycmVudEJsb2NrID0gYmxvY2tcbiAgfVxuXG4gIC8qKlxuICAgKiBjb21taXQgYmxvY2sgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvbW1pdEJsb2NrKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICghdGhpcy5jdXJyZW50QmxvY2spIHRocm93IG5ldyBFcnJvcignQ3VycmVudCBibG9jayBpcyBudWxsJylcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGNvbW1pdEJsb2NrIGhlaWdodCA9ICR7dGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0fWApXG4gICAgLy8gZm9yIGhvb2tcbiAgICB0aGlzLnByZUNvbW1pdEJsb2NrKCB0aGlzLmN1cnJlbnRCbG9jayApXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBPYmplY3QuYXNzaWduKCB7fSwgdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoYmxvY2tIZWFkZXIsICd0cmFuc2FjdGlvbnMnKVxuICAgIFxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5hcHBlbmRCbG9jayggYmxvY2tIZWFkZXIsIHRoaXMuYmxvY2tTZXNzaW9uLmdldENoYW5nZXMoKSApXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnNhdmVDaGFuZ2VzKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgKVxuICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeUZvclJvbGxiYWNrISApXG4gICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5wdXQoIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuICAgICAgLy8gZW1pdCBldmVudFxuICAgICAgdGhpcy5wb3N0Q29tbWl0QmxvY2soIHRoaXMubGFzdEJsb2NrISApXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIGNvbW1pdEJsb2NrIGhlaWdodCA9ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcbiAgICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodFxuICAgIH1cbiAgICBjYXRjaCggZXJyICkgeyBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBjb21taXRCbG9jayAoIGhlaWdodCA9ICR7dGhpcy5jdXJyZW50QmxvY2shLmhlaWdodH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2sodGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0KVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGJsb2NrIGNoYW5nZXNcbiAgICogQHBhcmFtIGhlaWdodCByb2xsYmFjayB0byBoZWlnaHQoZXhjbHVkZSlcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0Jsb2NrKCBoZWlnaHQ/OiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgIWhlaWdodCB8fCBoZWlnaHQgPD0gdGhpcy5sYXN0QmxvY2tIZWlnaHQsIFxuICAgICAgYGhlaWdodCBtdXN0IGxlc3Mgb3IgZXF1YWwgbGFzdEJsb2NrSGVpZ2h0ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcblxuICAgIGNvbnN0IGZyb21IZWlnaHQgPSB0aGlzLmN1cnJlbnRCbG9jayA/IHRoaXMuY3VycmVudEJsb2NrIS5oZWlnaHQgOiB0aGlzLmxhc3RCbG9ja0hlaWdodFxuICAgIGNvbnN0IHRvSGVpZ2h0ID0gaGVpZ2h0ID09PSB1bmRlZmluZWQgPyB0aGlzLmxhc3RCbG9ja0hlaWdodCA6IGhlaWdodFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tCbG9jayAoIGhlaWdodCA6ICR7ZnJvbUhlaWdodH0gLT4gJHt0b0hlaWdodH0gKWApXG4gICAgLy8gZm9yIGhvb2tcbiAgICB0aGlzLnByZVJvbGxiYWNrQmxvY2soIGZyb21IZWlnaHQsICB0b0hlaWdodCApXG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgdmVyID0gdGhpcy5ibG9ja1Nlc3Npb24uaGlzdG9yeVZlcnNpb247XG4gICAgICBpZiAoIGZyb21IZWlnaHQgPCB2ZXIubWluICkgeyAvLyBsb2FkIGhpc3RvcnkgZnJvbSBsZXZlbGRiLCBpZiBjYWNoZWQgaGlzdG9yeSBsZXNzIHRoYW4gcm9sbGJhY2sgaGVpZ2h0IFxuICAgICAgICBsZXQgaGlzdG9yeSA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRIaXN0b3J5Q2hhbmdlcyggZnJvbUhlaWdodCwgdmVyLm1pbiApXG4gICAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tDaGFuZ2VzKCB0b0hlaWdodCApXG4gICAgICB3aGlsZSggdGhpcy5sYXN0QmxvY2tIZWlnaHQgPiB0b0hlaWdodCApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5ldml0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCwgdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RSb2xsYmFja0Jsb2NrKCBmcm9tSGVpZ2h0LCAgdG9IZWlnaHQgKSAgICAgIFxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYCwgZXJyKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNhdmUgbG9jYWwgdGFibGVzIChub3QgaW4gYmxvY2sgLS0tIHdoaWNoIGRlZmluZSBpbiBzY2hlbWEgYnkgbG9jYWwgOiB0cnVlKSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlTG9jYWxDaGFuZ2VzKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBzZXJpYWwgPSBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5zYXZlQ2hhbmdlcygpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWwgKVxuICAgIHJldHVybiBzZXJpYWxcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBsb2NhbCB0YWJsZXMgY2hhbmdlcyBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqIEBwYXJhbSBzZXJpYWwgc2VyaWFsIG51bWJlciByZXR1cm4gZnJvbSBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tMb2NhbENoYW5nZXMoc2VyaWFsOiBudW1iZXIpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzZXJpYWwnLCBzZXJpYWwgPj0gMCwgYHNlcmlhbCBtdXN0IGdyZWF0IG9yIGVxdWFsIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgZW50aXR5IGtleVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRFbnRpdHlLZXk8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlLZXk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG4gICAgXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwsIHRydWUpIVxuICAgIHJldHVybiBzY2hlbWEuZ2V0S2V5KCBlbnRpdHkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0cmFja2luZyBlbnRpdHkgIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tlZCBlbnRpdHkgb3IgdW5kZWZpbmVkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgYXR0YWNoPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFBhcnRpYWw8VEVudGl0eT4gKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG5cbiAgICBsZXQga2V5ID0gdGhpcy5nZXRFbnRpdHlLZXkoIG1vZGVsLCAgZW50aXR5IClcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGtleSAhPT0gdW5kZWZpbmVkICwgJ2NhbiBub3QgZ2V0IGVudGl0eSBrZXknIClcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgLCB0cnVlKSFcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkubG9hZCggbW9kZWwsIGtleSEgKVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIG5ldyBlbnRpdHkgd2hpY2ggY2hhbmdlIHdpbGwgYmUgdHJhY2tlZCBhbmQgcGVyc2lzdGVudGVkIChieSBzYXZlQ2hhbmdlcykgYXV0b21hdGljYWxseVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5IHdoaWNoIHVuaXF1ZWQgaW4gZGF0YWJhc2VcbiAgICogQHBhcmFtIGVudGl0eSBwcm90b3R5cGUgZW50aXR5IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBjb3B5IHRvIHJlc3VsdCBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tpbmcgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5T3JFbnRpdHk6IEVudGl0eUtleSB8IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5T3JFbnRpdHknLCAoKT0+IERCQy5ub3ROdWxsKGtleU9yRW50aXR5KSlcbiAgICBcbiAgICBsZXQga2V5IDogRW50aXR5S2V5XG4gICAgbGV0IGVudGl0eTogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG5cbiAgICBpZiAoIGlzUHJpbWl0aXZlS2V5KCBrZXlPckVudGl0eSApIHx8IGlzQ29tcG9zaXRlS2V5KCBrZXlPckVudGl0eSApICkgeyBcbiAgICAgIGtleSA9IGtleU9yRW50aXR5IGFzIEVudGl0eUtleSBcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbnRpdHkgPSBrZXlPckVudGl0eSBhcyBURW50aXR5XG4gICAgICBrZXkgPSBzY2hlbWEuZ2V0S2V5KGVudGl0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksICdpcyBub3QgYSB0cmFja2luZyBlbnRpdHknIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIGFuZCBjYWNoZSByZXN1bHQgaWYgdHJ1ZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJ5PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdjb25kaXRpb24nLCAoKT0+IERCQy5ub3ROdWxsKGNvbmRpdGlvbikpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbjxURW50aXR5PihzY2hlbWEhKVxuICAgIGxldCBpdGVtcyA9IGF3YWl0IHNlc3Npb24uZ2V0TWFueTxURW50aXR5Pihtb2RlbCwgY29uZGl0aW9uLCB0cnVlLCB0cnVlIClcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JywgY29uZGl0aW9uID0gJyR7SlNPTi5zdHJpbmdpZnkoY29uZGl0aW9uKX0nIClgKVxuICAgIFxuICAgIHJldHVybiAoIGl0ZW1zLmxlbmd0aCA9PT0gMSApID8gaXRlbXNbMF0gOiB1bmRlZmluZWRcbiAgfVxuXG4gICAgLyoqXG4gICAqIGdldCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gZmluZCBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIGFuZCBjYWNoZSByZXN1bHQgaWYgdHJ1ZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0TWFueShtb2RlbCwgY29uZGl0aW9uLCB0cmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tlZCBlbnRpdHkgZnJvbSBjYWNoZVxuICAgKi9cbiAgcHVibGljIGdldENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkQ2FjaGVkKG1vZGVsLCBrZXksIHRydWUpXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGFsbCBjYWNoZWQgZW50aXRpZXNcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRBbGxDYWNoZWQoIG1vZGVsLCBmaWx0ZXIsIHRyYWNrIClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gcmVzdWx0UmFuZ2UgbGltaXQgYW5kIG9mZnNldCBvZiByZXN1bHRzIG51bWJlciBvciBqc29uLCBlZzogMTAgb3IgeyBsaW1pdCA6IDEwLCBvZmZzZXQgOiAxIH0gXG4gICAqIEBwYXJhbSBzb3J0IGpzb24geyBmaWVsZE5hbWUgOiAnQVNDJyB8ICdERVNDJyB9ICwgZWc6IHsgbmFtZSA6ICdBU0MnLCBhZ2UgOiAnREVTQycgfVxuICAgKiBAcGFyYW0gZmllbGRzIHJlc3VsdCBmaWVsZHMsIGRlZmF1bHQgaXMgYWxsIGZpZWxkc1xuICAgKiBAcGFyYW0gb2Zmc2V0IG9mZnNldCBvZiByZXN1bHQgc2V0ICBcbiAgICogQHBhcmFtIGpvaW4gam9pbiBpbmZvIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBcbiAgICBzb3J0PyA6IFNxbE9yZGVyLCBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnF1ZXJ5KG1vZGVsLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBmaWVsZHMsIGpvaW4pXG4gIH1cblxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHBhcmFtcyBtYW5nbyBsaWtlIHF1ZXJ5IHBhcmFtcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kT25lPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5maW5kQWxsKCBtb2RlbCwgcGFyYW1zIClcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIHBhcmFtcyA9ICcke0pTT04uc3RyaW5naWZ5KHBhcmFtcyl9JyApYClcbiAgICBcbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbXNbMF1cbiAgfVxuXG4gICAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRBbGw8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnF1ZXJ5QnlKc29uKCBtb2RlbCwgcGFyYW1zIClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIHF1ZXJ5IGlmIGV4aXN0cyByZWNvcmQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZXhpc3RzPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZXhpc3RzKG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICAvKipcbiAgICogY291bnQgcmVjb3JkcyBjb3VudCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jb3VudChtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tzIDogQXJyYXk8QmxvY2tIZWFkZXI+LCAgZ2V0VHJhbnNhY3Rpb25zOiAoKSA9PiBQcm9taXNlPEFycmF5PFRyYW5zYWN0aW9uPj4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgbGV0IHRyYW5zR3JvdXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8VHJhbnNhY3Rpb24+PigpXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IGdldFRyYW5zYWN0aW9ucygpXG5cbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCggdCA9PiB7XG4gICAgICBpZiAoIXRyYW5zR3JvdXAuaGFzKCB0LmJsb2NrSWQgKSkgdHJhbnNHcm91cC5zZXQoIHQuYmxvY2tJZCwgbmV3IEFycmF5PFRyYW5zYWN0aW9uPigpIClcbiAgICAgIHRyYW5zR3JvdXAuZ2V0KCB0LmJsb2NrSWQgKSEucHVzaCggdCApXG4gICAgfSApXG5cbiAgICBibG9ja3MuZm9yRWFjaCggYiA9PiBiWyd0cmFuc2FjdGlvbnMnXSA9IHRyYW5zR3JvdXAuZ2V0KGIuaWQhKSApXG4gICAgcmV0dXJuIGJsb2NrcyBhcyBBcnJheTxCbG9jaz5cbiAgfVxuXG4gIHByaXZhdGUgY29weUNhY2hlZEJsb2NrKCBnZXRDYWNoZUJsb2NrIDogKCkgPT4gTWF5YmVVbmRlZmluZWQ8QmxvY2s+LCB3aXRoVHJhbnNhY3Rpb25zIDogYm9vbGVhbiApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSBnZXRDYWNoZUJsb2NrKClcbiAgICBpZiAoIGNhY2hlZEJsb2NrID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgbGV0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oe30sIGNhY2hlZEJsb2NrKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCByZXN1bHQsICd0cmFuc2FjdGlvbnMnKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBoZWlnaHRcbiAgICogQHBhcmFtIGhlaWdodCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SGVpZ2h0KCBoZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgaGVpZ2h0ID49IDAgLCAnaGVpZ2h0IG11c3QgZ3JlYXQgb3IgZXF1YWwgemVybycpXG4gICAgXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldChoZWlnaHQpLCB3aXRoVHJhbnNhY3Rpb25zIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2soIGhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBibG9jayBpZFxuICAgKiBAcGFyYW0gYmxvY2tJZCBibG9jayBpZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWQnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGJsb2NrSWQpKVxuXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldEJ5SWQoYmxvY2tJZCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja0J5SWQoIGJsb2NrSWQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGhlaWdodCByYW5nZVxuICAgKiBAcGFyYW0gbWluSGVpZ2h0IG1pbiBoZWlnaHQoaW5jbHVkZWQpXG4gICAqIEBwYXJhbSBtYXhIZWlnaHQgbWF4IGhlaWdodChpbmNsdWRlZClcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQgOiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnbWluSGVpZ2h0LCBtYXhIZWlnaHQnLCBtaW5IZWlnaHQgPj0gMCAmJiBtYXhIZWlnaHQgPj0gbWluSGVpZ2h0LCAnbWluSGVpZ2h0IG9yIG1heEhlaWdodCBpcyBpbnZhbGlkJylcbiAgIFxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0LCBtYXhIZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGJsb2NrIGlkIGFycmF5XG4gICAqIEBwYXJhbSBibG9ja0lkcyBhcnJheSBvZiBibG9jayBpZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4sIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWRzJywgKCkgPT4gREJDLm5vdE51bGwoYmxvY2tJZHMpIClcblxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlJZHMoYmxvY2tJZHMpXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cbn0iLCJpbXBvcnQgeyBFbnRpdHksICBOdWxsYWJsZSwgcGFydGlhbCB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHlUcmFja2VyLCBQcm94aWVkRW50aXR5VHJhY2tlciB9IGZyb20gJy4vRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcblxuLyoqICAgICBcbiAqICAgICBTVEFURSBUUkFOU0ZFUiAgICAgICAgICAgICAgICAgIEFDVElPTiAgICAgICAgICAgICAgICBUUkFDSyAgICAgIENBQ0hFXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgID8gICAgICAgICAtPiBwZXJzaXRlbnQgICAgICBzZXNzaW9uLmxvYWQgICAgICAgICAgICAgdHJhY2sgICAgIGNhY2hlXG4gKiAgICAgID8gICAgICAgICAtPiBuZXcgICAgICAgICAgICBzZXNzaW9uLmNyZWF0ZSAgICAgICAgICAgdHJhY2sgICAgICAgLSAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBtb2RpZmllZCAgICAgICBzZXQgcHJvcGVydHkgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogcGVyc2lzdGVudCAgICAgLT4gZGVsZXRlZCAgICAgICAgc2Vzc2lvbi5kZWwgICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIG5ldyB8IG1vZGlmaWVkIC0+IHByZXNpc3RlbnQgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBrZWVwICAgICBjYWNoZXx1cGRhdGUgXG4gKiBkZWxldGVkICAgICAgICAtPiB0cmFuc2llbnQgICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAgZXZpdCAgICAgICBldml0XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdGUge1xuICBUcmFuc2llbnQgID0gLTEsXG4gIFBlcnNpc3RlbnQgPSAwLFxuICBcbiAgTmV3ICAgICAgICA9IDEsXG4gIE1vZGlmaWVkICAgPSAyLFxuICBEZWxldGVkICAgID0gMyxcbn1cblxuZXhwb3J0IGVudW0gRW50aXR5Q2hhbmdlVHlwZSB7XG4gIE5ldyAgICAgICA9IDEsXG4gIE1vZGlmeSAgICA9IDIsXG4gIERlbGV0ZSAgICA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2Uge1xuICBuYW1lICAgICA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50ICA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNoYW5nZXMge1xuICBkYlZlcnNpb24gICAgICAgICA6IG51bWJlclxuICB0eXBlICAgICAgICAgICAgICA6IEVudGl0eUNoYW5nZVR5cGVcbiAgcHJvcGVydGllc0NoYW5nZXMgOiBBcnJheTxQcm9wZXJ0eUNoYW5nZT5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlFeHRlbnNpb24ge1xuICBfdmVyc2lvbl8gICAgICA6IG51bWJlclxuICBfX2RldGFjaGVkX18gICA6IGJvb2xlYW5cbiAgX190cmFja2luZ19fICAgOiBib29sZWFuXG4gIF9fY29uZmlybWVkX18gIDogYm9vbGVhblxuICBfX3NjaGVtYV9fICAgICA6IE1vZGVsU2NoZW1hICBcbiAgX190cmFja2VyX18gICAgOiBFbnRpdHlUcmFja2VyXG4gIF9fc3RhdGVfXyAgICAgIDogRW50aXR5U3RhdGUgXG4gIF9fY2hhbmdlc19fICAgIDogTnVsbGFibGU8RW50aXR5Q2hhbmdlcz5cbiAgX191bmNvbmZpcm1lZENoYW5nZXNfXyAgOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlclxuXG4gIGNvbnN0cnVjdG9yKHRyYWNrZXI6IEVudGl0eVRyYWNrZXIpIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRW50aXR5UHJveHkubmFtZSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRXh0ZW5kZWQoZW50aXR5OiBFbnRpdHkpIHtcbiAgICByZXR1cm4gZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3NjaGVtYV9fJykgJiYgZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3N0YXRlX18nKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc1Byb3hpZWQoZW50aXR5OiBFbnRpdHkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVudGl0eVByb3h5LmlzRXh0ZW5kZWQoZW50aXR5KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjb252ZXJ0VG9Qcm94aWVkPFRFbnRpdHk+KGVudGl0eTogRW50aXR5KSA6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSkpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQcm94aWVkIEVudGl0eWApXG4gICAgXG4gICAgcmV0dXJuIGVudGl0eSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHByb3h5VG9FbnRpdHkocHJveGllZDogUHJveGllZDxFbnRpdHk+LCBjb250YWluc1ZlcnNpb24gPSB0cnVlICk6IEVudGl0eSB7XG4gICAgcmV0dXJuIGNvbnRhaW5zVmVyc2lvbiA/IFxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KHApICkgOlxuICAgICAgcGFydGlhbCggcHJveGllZCwgcCA9PiBwICE9PSAnX3ZlcnNpb25fJyAmJiAgRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShwKSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlLCAgY29uZmlybWVkIDogYm9vbGVhbiApIDogVEVudGl0eSB7XG4gICAgbGV0IHJlc3VsdCA9ICBPYmplY3QuYXNzaWduKHtcbiAgICAgIF92ZXJzaW9uXyAgICAgIDogMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19jb25maXJtZWRfXyAgOiBjb25maXJtZWQsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fY2hhbmdlc19fICAgIDogbnVsbCxcbiAgICAgIF9fdW5jb25maXJtZWRDaGFuZ2VzX18gOiBudWxsXG4gICAgfSwgZW50aXR5KVxuICAgIFxuICAgIHJlc3VsdC5fdmVyc2lvbl8gPSByZXN1bHQuX3ZlcnNpb25fIHx8IDFcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIGluaXRDaGFuZ2VzKCBleHQgOiBFbnRpdHlFeHRlbnNpb24gLCBjaGFuZ2VUeXBlID0gRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnkgKSB7XG4gICAgaWYgKGNoYW5nZVR5cGUgPT09IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5KSBleHQuX19jaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnksICAgICAgICBcbiAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyAsXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oeyBcbiAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgZXh0Ll9fdW5jb25maXJtZWRDaGFuZ2VzX18gPSB7XG4gICAgICB0eXBlIDogY2hhbmdlVHlwZSwgICAgICAgIFxuICAgICAgZGJWZXJzaW9uOiBleHQuX3ZlcnNpb25fICxcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFByb3BlcnR5S2V5cyggZW50aXR5IDogRW50aXR5ICkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIHJldHVybiBleHQuX19zY2hlbWFfXy5maWVsZE5hbWVzXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlLZXk6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSA6IGJvb2xlYW4geyAgICAgIFxuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5S2V5LnRvU3RyaW5nKClcblxuICAgIGlmICggIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkobmFtZSkgfHwgIWV4dC5fX3RyYWNraW5nX18gIHx8IHZhbHVlID09PSBlbnRpdHlbcHJvcGVydHlLZXldICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5S2V5XSA9IHZhbHVlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcm9wZXJ0eSBhZnRlciBkZWxldGVkYClcbiAgICB9XG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IGV4dC5fX3NjaGVtYV9fXG4gICAgaWYgKCBzY2hlbWEuaXNSZWFkb25seSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcmVhZG9ubHkgbW9kZWwgJyR7c2NoZW1hLm1vZGVsTmFtZX0nYClcbiAgICB9XG5cbiAgICBpZiAoIHNjaGVtYS5wcmltYXJ5S2V5ID09PSBuYW1lIHx8IHNjaGVtYS5jb21wb3NpdGVLZXlzLmluZGV4T2YobmFtZSkgPj0gMCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJpbWFyeSBrZXkgb3IgY29tcG9zaXRlIGtleSBwcm9wZXJ0eWApXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19kZXRhY2hlZF9fICkge1xuICAgICAgKCBleHQuX190cmFja2VyX18gYXMgUHJveGllZEVudGl0eVRyYWNrZXIpLmF0dGFjaCggcmVjZWl2ZXIgYXMgUHJveGllZDxhbnk+IClcbiAgICAgIGV4dC5fX2RldGFjaGVkX18gPSBmYWxzZVxuICAgIH1cblxuICAgIEVudGl0eVByb3h5LnJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0LCBwcm9wZXJ0eUtleSwgdmFsdWUgKVxuICAgIGVudGl0eVtwcm9wZXJ0eUtleV0gPSB2YWx1ZVxuICAgIFxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwcm90ZWN0ZWQgc3RhdGljIHJlY29yZFByb3BlcnR5Q2hhbmdlcyggZXh0IDogRW50aXR5RXh0ZW5zaW9uLCBrZXkgOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSApIHtcbiAgICBsZXQgc3RhcnRDb25maXJtID0gZmFsc2VcbiAgICBpZiAoIGV4dC5fX3RyYWNrZXJfXy5pc0NvbmZpcm1pbmcgJiYgZXh0Ll9fY29uZmlybWVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlciApLnJlZ2lzdGVyVW5jb25maXJtZWRFbnRpdHkoIGV4dCApXG4gICAgICBzdGFydENvbmZpcm0gPSB0cnVlXG4gICAgICBleHQuX19jb25maXJtZWRfXyA9IGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBFbnRpdHlQcm94eS5pbml0Q2hhbmdlcyggZXh0ICkgICAgIFxuICAgIH1cblxuICAgIGxldCBwcm9wZXJ0aWVzQ2hhbmdlcyA6IE51bGxhYmxlPEFycmF5PFByb3BlcnR5Q2hhbmdlPj4gPSBudWxsIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7ICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzID0gZXh0Ll9fY29uZmlybWVkX18gPyAgXG4gICAgICAgIGV4dC5fX2NoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXM6IFxuICAgICAgICBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMgICBcbiAgICB9XG4gICAgZWxzZSBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyAmJiBleHQuX190cmFja2VyX18uaXNDb25maXJtaW5nICkge1xuICAgICAgc3RhcnRDb25maXJtICYmIEVudGl0eVByb3h5LmluaXRDaGFuZ2VzKCBleHQsIEVudGl0eUNoYW5nZVR5cGUuTmV3IClcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzID0gZXh0Ll9fdW5jb25maXJtZWRDaGFuZ2VzX18gPT09IG51bGwgPyB1bmRlZmluZWQgOiBleHQuX191bmNvbmZpcm1lZENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXNcbiAgICB9XG5cbiAgICBsZXQgbmFtZSA9IGtleS50b1N0cmluZygpXG4gICAgcHJvcGVydGllc0NoYW5nZXMgJiYgcHJvcGVydGllc0NoYW5nZXMucHVzaCh7IG5hbWU6IG5hbWUsIG9yaWdpbmFsOiBleHRbbmFtZV0sIGN1cnJlbnQ6IHZhbHVlIH0pXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRGlydHkoIGVudGl0eTogRW50aXR5ICkgOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGF0ZSA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KS5fX3N0YXRlX19cbiAgICByZXR1cm4gISAoIHN0YXRlID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50IHx8IHN0YXRlID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eSBjcmVhdGUgbWFudWFsXG4gICAqIEBwYXJhbSBtb2RlbCBNb2RlbCBOYW1lXG4gICAqL1xuICBwdWJsaWMgcHJveHlOZXc8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgY29uZmlybWVkIDogYm9vbGVhbiApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoIGVudGl0eSwgc2NoZW1hLCAgRW50aXR5U3RhdGUuTmV3LCBjb25maXJtZWQpXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQsIG93bktleXMgOiB0aGlzLmdldFByb3BlcnR5S2V5cyB9KSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBlbnRpdHkgd3JhcHBlZCBieSBwcm94eSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgY2FuIGJlIGRldGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGxvYWRlZCBmcm9tIGRhdGFiYXNlLiBBVFRFTlNUSU9OOiBlbnN1cmUgdGhhdCBoYXMgcHJvcGVydHkgJ192ZXJzaW9uXydcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eVBlcnNpc3RlbnQ8VEVudGl0eT4oIGVudGl0eTogRW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICwgY29uZmlybWVkIDogYm9vbGVhbiApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSAgdGhpcy5hdHRhY2hFeHRlbmRQcm9wZXJ0aWVzKGVudGl0eSwgc2NoZW1hLCBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50LCAgY29uZmlybWVkIClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCwgb3duS2V5cyA6IHRoaXMuZ2V0UHJvcGVydHlLZXlzIH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBjb25maXJtQ2hhbmdlczxURW50aXR5PiggcGUgOiBQcm94aWVkPFRFbnRpdHk+ICkgOiB2b2lkIHtcbiAgICBpZiAoIHBlLl9fY29uZmlybWVkX18gKSB7XG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKCdjb25maXJtIHdoZW4gY29uZmlybWVkJylcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgXG4gICAgbGV0IHRtcENoYW5nZXMgPSBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fXG4gICAgaWYgKCB0bXBDaGFuZ2VzICYmIHBlLl9fY2hhbmdlc19fICkge1xuICAgICAgcGUuX19jaGFuZ2VzX18ucHJvcGVydGllc0NoYW5nZXMucHVzaCggLi4udG1wQ2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcyApXG4gICAgfVxuICAgIGVsc2UgaWYgKCAhcGUuX19jaGFuZ2VzX18gKSB7XG4gICAgICBwZS5fX2NoYW5nZXNfXyA9IHRtcENoYW5nZXNcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBfX3VuY29uZmlybWVkQ2hhbmdlc19fID09PSBudWxsICYmIF9fY2hhbmdlc19fICE9PSBudWxsXG4gICAgfVxuICAgIHBlLl9fY29uZmlybWVkX18gPSB0cnVlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyA9IG51bGxcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxDaGFuZ2VzPFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX2NvbmZpcm1lZF9fICkge1xuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbygnY2FuY2VsIHdoZW4gY29uZmlybWVkJylcbiAgICAgIHJldHVybiBcbiAgICB9IFxuICAgIFxuICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXyAmJiBcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIHBjID0+IHBlW3BjLm5hbWVdID0gcGMub3JpZ2luYWwgKSBcbiAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgcGUuX19zdGF0ZV9fID0gcGUuX19jaGFuZ2VzX18gPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgICBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fID0gbnVsbFxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgQ29tcG9zaXRlS2V5IH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIEVudGl0eVRyYWNrZXJBY3Rpb24gPSAoIG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcyApID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5KTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcblxuICBpc0NvbmZpcm1pbmcgOiBib29sZWFuXG4gIGJlZ2luQ29uZmlybSgpIDogdm9pZFxuICBjb25maXJtKCkgOiB2b2lkXG4gIGNhbmNlbENvbmZpcm0oKSA6IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuZXhwb3J0IHR5cGUgUHJveGllZEVudGl0eUFuZENoYW5nZXMgPSB7IGVudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHsgIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY29uZmlybWluZyA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG4gIHByaXZhdGUgdW5jb25maXJtZWRFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuY29uZmlybWluZyA9IGZhbHNlICAgIFxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG5cbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IG1rID0geyBtOiBzY2hlbWEubW9kZWxOYW1lLCBrOiBrZXl9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBtayApXG4gIH1cblxuICBwdWJsaWMgc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSApIDogeyBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSB9IHtcbiAgICBsZXQgbWsgPSBKU09OLnBhcnNlKCBtb2RlbEFuZEtleSApXG4gICAgbGV0IGtleSA9IGlzU3RyaW5nKG1rLmspIHx8IGlzTnVtYmVyKG1rLmspID8gbWsuayA6IG5ldyBDb21wb3NpdGVLZXkobWsuay5rZXlPYmplY3QpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBtay5tLCBrZXk6IGtleSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwcm90ZWN0ZWQgcmVtb3ZlVHJhY2tpbmdUcmFuc2lzZW50RW50aXRpZXMoKSB7XG4gICAgbGV0IGtleXMgPSBuZXcgQXJyYXk8TW9kZWxBbmRLZXk+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggKGVudGl0eSwga2V5KSA9PiBlbnRpdHkuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgJiYga2V5cy5wdXNoKGtleSkpXG4gICAga2V5cy5mb3JFYWNoKCBrZXkgPT4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZShrZXkpIClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSk7XG4gICAgaWYgKCB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4aXN0cyBhbm90aGVyIHRyYWNrZWQgZW50aXR5JylcbiAgICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSApXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRMYXN0Q2hhbmdlcyggcGU6IFByb3hpZWQ8YW55PiApIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNEaXJ0eShwZSkpIHJldHVybiB1bmRlZmluZWRcbiAgICAvLyBUT0RPOiBjaGVjayBpZiBjb25maXJtaW5nID9cbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDogXG4gICAgICAgIHJldHVybiBwZS5fX2NoYW5nZXNfXyFcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb246IG51bWJlciApOiBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICBsZXQgdG1wVmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cblxuICAgIHdoaWxlICggdG1wVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiApIHtcbiAgICAgIGxldCBoaXN0b3J5ID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRtcFZlcnNpb24pXG4gICAgICBoaXN0b3J5ICYmIHJlc3VsdC5wdXNoKGhpc3RvcnkpICAgICAgXG4gICAgICB0bXBWZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwga2V5KSApXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcGUgOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0TW9kZWxBbmRLZXkoIHBlIClcbiAgICB0aGlzLnVuY29uZmlybWVkRW50aXRpZXMuc2V0KCBrZXksIHBlIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25maXJtaW5nKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25maXJtaW5nXG4gIH1cblxuICBwdWJsaWMgYmVnaW5Db25maXJtKCkgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSB0cnVlXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCdCRUdJTiBiZWdpbkNvbmZpcm0nKVxuICB9XG5cbiAgcHVibGljIGNvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNvbmZpcm1OZXcoIHBlICkgXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuTW9kaWZpZWQgKVxuICAgICAgICB0aGlzLmNvbmZpcm1Nb2RpZnkoIHBlIClcbiAgICAgIGVsc2UgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5EZWxldGVkIClcbiAgICAgICAgdGhpcy5jb25maXJtZWREZWxldGUoIHBlIClcbiAgICB9KVxuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5yZW1vdmVUcmFja2luZ1RyYW5zaXNlbnRFbnRpdGllcygpXG4gICAgdGhpcy5jb25maXJtaW5nID0gZmFsc2VcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoJ1NVQ0NFU1MgY29uZmlybSAnKVxuICB9XG5cbiAgcHVibGljIGNhbmNlbENvbmZpcm0oKSA6IHZvaWQge1xuICAgIHRoaXMudW5jb25maXJtZWRFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7IFxuICAgICAgaWYgKCBwZS5fX3N0YXRlX18gPT09ICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSApIFxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLk1vZGlmaWVkIClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZE1vZGlmeSggcGUgKVxuICAgICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gIEVudGl0eVN0YXRlLkRlbGV0ZWQgKVxuICAgICAgICB0aGlzLmNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSApXG4gICAgICBlbHNlIGlmICggcGUuX19zdGF0ZV9fID09PSAgRW50aXR5U3RhdGUuVHJhbnNpZW50IClcbiAgICAgICAgdGhpcy5jYW5jZWxVbmNvbmZpcm1lZERlbGV0ZSggcGUgKVxuICAgIH0pXG4gICAgdGhpcy51bmNvbmZpcm1lZEVudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLnJlbW92ZVRyYWNraW5nVHJhbnNpc2VudEVudGl0aWVzKClcbiAgICB0aGlzLmNvbmZpcm1pbmcgPSBmYWxzZVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSgnU1VDQ0VTUyBjYW5jZWxDb25maXJtICcpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEsICF0aGlzLmlzQ29uZmlybWluZylcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG5cbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIFxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgXG4gICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkgcmV0dXJuXG4gICAgXG4gICAgdGhpcy5jb25maXJtaW5nICYmIHRoaXMucmVnaXN0ZXJVbmNvbmZpcm1lZEVudGl0eSggcHJveGllZCApXG4gICAgcHJveGllZC5fX2NvbmZpcm1lZF9fID0gIXRoaXMuY29uZmlybWluZ1xuICAgIFxuICAgIHN3aXRjaCAoIHByb3hpZWQuX19zdGF0ZV9fICkge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1OZXcoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkTmV3KCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgbGV0IG5ld1RoZW5Nb2RpZnkgPSBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICYmIFxuICAgICAgcGUuX191bmNvbmZpcm1lZENoYW5nZXNfXy50eXBlID09PSBFbnRpdHlDaGFuZ2VUeXBlLk5ld1xuICAgICAgXG4gICAgaWYgKCBuZXdUaGVuTW9kaWZ5ICkgeyAgICAgIFxuICAgICAgdGhpcy5wcm94eS5jYW5jZWxDaGFuZ2VzKCBwZSApXG4gICAgfSBcbiAgICBlbHNlIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH1cbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNvbmZpcm1Nb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNvbmZpcm1DaGFuZ2VzKCBwZSApXG4gIH1cblxuICBwcm90ZWN0ZWQgY2FuY2VsVW5jb25maXJtZWRNb2RpZnkoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLnByb3h5LmNhbmNlbENoYW5nZXMoIHBlIClcbiAgfVxuXG4gIHByb3RlY3RlZCBjb25maXJtZWREZWxldGUoIHBlIDogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBwZS5fX2NvbmZpcm1lZF9fID0gdHJ1ZVxuICB9XG5cbiAgcHJvdGVjdGVkIGNhbmNlbFVuY29uZmlybWVkRGVsZXRlKCBwZSA6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgaWYgKCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk5ldyBcbiAgICB9XG4gICAgZWxzZSBpZiAoIHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCApIHtcbiAgICAgIGxldCBtb2RpZmllZCA9ICAoIHBlLl9fY2hhbmdlc19fICYmIHBlLl9fY2hhbmdlc19fLnByb3BlcnRpZXNDaGFuZ2VzLmxlbmd0aCA+IDAgKVxuICAgICAgcGUuX19zdGF0ZV9fID0gbW9kaWZpZWQgPyBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICB9XG4gICAgXG4gICAgaWYgKCBwZS5fX3VuY29uZmlybWVkQ2hhbmdlc19fICkgeyBcbiAgICAgIHBlLl9fdW5jb25maXJtZWRDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgfVxuXG4gICAgcGUuX19jb25maXJtZWRfXyA9IHRydWVcbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hLCAhdGhpcy5jb25maXJtaW5nKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PFByb3hpZWRFbnRpdHlBbmRDaGFuZ2VzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxQcm94aWVkRW50aXR5QW5kQ2hhbmdlcz4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgZW50aXR5OiBwZSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSl9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhlbnRpdHk6IEVudGl0eSwgZGJWZXJzaW9uOiBudW1iZXIsIGlzTmV3ID0gdHJ1ZSkgOiBFbnRpdHlDaGFuZ2VzIHtcbiAgICBsZXQgcHJvcGVyaXRlc0NoYW5nZSA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIGZvciAoY29uc3Qga2V5IGluIGVudGl0eSkge1xuICAgICAgaWYgKCFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGtleSkpIGNvbnRpbnVlXG4gICAgICBwcm9wZXJpdGVzQ2hhbmdlLnB1c2goIGlzTmV3ID8gXG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogdW5kZWZpbmVkLCBjdXJyZW50OiBlbnRpdHlba2V5XSB9IDpcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBlbnRpdHlba2V5XSwgY3VycmVudDogIHVuZGVmaW5lZCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fY2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fY2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fY2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmNvbmZpcm0oKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSksIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6XG4gICAgICAgIGxldCBlID0gdGhpcy5jYWNoZS5nZXQoIG1vZGVsLCBrZXkgKVxuICAgICAgICBpZiAoIGUgPT09IHVuZGVmaW5lZCApIHJldHVyblxuICAgICAgICBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gZSFbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZSApXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOiBcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGMgPT4gYy5uYW1lLCBjID0+IGMub3JpZ2luYWwpXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlbnRpdHkgKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuY2FuY2VsQ29uZmlybSgpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fY2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX19jaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDpcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcmVqZWN0Q2hhbmdlcyBWZXJzaW9uID0gP2ApXG4gIH1cbiAgXG4gIHB1YmxpYyByb2xsYmFja0NoYW5nZXMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLnJlamVjdENoYW5nZXMoKVxuICAgIHdoaWxlKCBoaXN0b3J5VmVyc2lvbiA8PSB0aGlzLmN1cnJlbnRWZXJzaW9uICkge1xuICAgICAgY29uc3QgY2hhbmdlc01hcCA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgICAgY2hhbmdlc01hcCAmJiBjaGFuZ2VzTWFwLmZvckVhY2goICggY2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApIFxuICAgICAgICB0aGlzLnJvbGxiYWNrQ2FjaGVDaGFuZ2VzKG1rLm1vZGVsLCBtay5rZXksIGNoYW5nZXMpXG4gICAgICB9KVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiAtLVxuICAgIH1cblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiBwZS5fX2RldGFjaGVkX18gPSB0cnVlKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5taW5WZXJzaW9uID0gTWF0aC5taW4odGhpcy5taW5WZXJzaW9uLCB0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHt0aGlzLmN1cnJlbnRWZXJzaW9ufWApXG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5KCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIHtcbiAgICBpZiAoIHRoaXMubWluVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiB8fCB0aGlzLmN1cnJlbnRWZXJzaW9uIDwgaGlzdG9yeVZlcnNpb24gKSByZXR1cm5cbiAgICBmb3IoIGxldCB2ZXIgPSB0aGlzLm1pblZlcnNpb247IHZlciA8IGhpc3RvcnlWZXJzaW9uOyB2ZXIrKyApIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5kZWxldGUodmVyKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHVtcENoYW5nZXMoIGVjOiBFbnRpdHlDaGFuZ2VzICk6IHN0cmluZyB7XG4gICAgbGV0IHByb3BlcnR5Q2hhbmdlcyA9ICcnXG4gICAgZWMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaChwYyA9PiBwcm9wZXJ0eUNoYW5nZXMgKz0gYCR7cGMubmFtZX06ICR7cGMub3JpZ2luYWx9IC0+ICR7cGMuY3VycmVudH0sIGApXG5cbiAgICByZXR1cm4gYGRiVmVyc2lvbj0ke2VjLmRiVmVyc2lvbn0sIHR5cGU9JHtlYy50eXBlfSwgWyR7cHJvcGVydHlDaGFuZ2VzfV1gXG4gIH1cblxuICBwdWJsaWMgZHVtcEhpc3RvcnkoKSA6IHN0cmluZyB7XG4gICAgbGV0IHZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBISVNUT1JZICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB3aGlsZSggdmVyc2lvbiA+PSB0aGlzLm1pblZlcnNpb24gKSB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tdmVyc2lvbiAke3ZlcnNpb259LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBsZXQgaGlzID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKCB2ZXJzaW9uIClcbiAgICAgIGhpcyAmJiBoaXMuZm9yRWFjaCggKCBlYywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGxldCBjaGFuZ2VzID0gdGhpcy5kdW1wQ2hhbmdlcyggZWMgKVxuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgICBjb25zdCBtc2cgPSBgdHlwZT0ke21rLm1vZGVsfSwga2V5PSR7bWsua2V5fSwgY2hhbmdlcz17JHtjaGFuZ2VzfX0gXFxuYFxuICAgICAgICByZXN1bHQgKz0gbXNnXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgICB2ZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYWNrZXJTcWxCdWlsZGVyIHtcbiAgcHJpdmF0ZSB0cmFja2VyOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc3FsQnVpbGRlcjogU3FsQnVpbGRlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyLCBtb2RlbHMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4sIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXIgKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICAgIHRoaXMubW9kZWxzID0gbW9kZWxzXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gc3FsQnVpbGRlclxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGVudGl0eVRyYWNrZXIoKSB7IHJldHVybiB0aGlzLnRyYWNrZXIgfVxuXG4gIHB1YmxpYyBidWlsZENoYW5nZVNxbHMoKSA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZGV0ZWN0Q2hhbmdlcygpLmZvckVhY2goIGVjID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLmJ1aWxkU3FsQW5kUGFyYW1ldGVycyhlYy5lbnRpdHkpIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBidWlsZFNxbEFuZFBhcmFtZXRlcnMocGUgOlByb3hpZWQ8YW55PikgOiBTcWxBbmRQYXJhbWV0ZXJzIHsgIFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDpcbiAgICAgICAgY29uc3QgbmV3RW50aXR5ID0gT2JqZWN0LmFzc2lnbih7IF92ZXJzaW9uXyA6IHBlLl92ZXJzaW9uXyB9LCAgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBuZXdFbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==