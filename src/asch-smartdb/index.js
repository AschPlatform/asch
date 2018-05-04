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
        this.minHeight = 0;
        this.maxHeight = 0;
        this.maxCachedCount = maxCachedCount;
    }
    isCached(height) {
        return height > 0 && height >= this.minHeight && height <= this.maxHeight;
    }
    get cachedHeightRange() {
        return { min: this.minHeight, max: this.maxHeight };
    }
    put(block) {
        if (!this.isCached(block.height) && block.height !== this.maxHeight + 1)
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
const Log_1 = __webpack_require__(/*! ./Log */ "./src/Log.ts");
const util_1 = __webpack_require__(/*! util */ "util");
class DbSession {
    constructor(connection, cacheOptions, sessionName) {
        this.log = Log_1.LogManager.getLogger(DbSession.name + (sessionName === undefined ? '' : `_${sessionName}`));
        this.sessionSerial = 0;
        this.connection = connection;
        this.models = new Map();
        this.sessionCache = new EntityCache_1.LRUEntityCache(cacheOptions);
        this.sqlBuilder = new SqlBuilder_1.JsonSqlBuilder();
        this.entityTracker = new EntityTracker_1.ProxiedEntityTracker(this.sessionCache);
        this.trackerSqlBuilder = new EntityTracker_1.TrackerSqlBuilder(this.entityTracker, this.models, this.sqlBuilder);
    }
    get isOpen() {
        return this.connection && this.connection.isConnected;
    }
    get entityCache() {
        return this.sessionCache;
    }
    syncSchema(schema) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = this.sqlBuilder.buildSchema(schema);
            yield this.connection.runScript(sql);
        });
    }
    registerSchema(...schemas) {
        schemas.forEach(s => this.models.set(s.modelName, s));
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
    trackPersistentEntities(schema, entities, cache = true) {
        let result = new Array();
        entities.forEach(e => {
            result.push(this.entityTracker.trackPersistent(schema, e));
            cache && this.entityCache.put(schema.modelName, schema.getKey(e), e);
        });
        return result;
    }
    reset(clearCache = false) {
        this.entityTracker.stopTrackAll();
        if (clearCache)
            this.entityCache.clear();
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
        return track ? this.trackPersistentEntities(schema, entities, false) : entities;
    }
    attach(schema, entity) {
        const key = schema.getKey(entity);
        let tracked = this.entityTracker.getTrackingEntity(schema, key);
        if (tracked !== undefined)
            return tracked;
        let cached = this.entityCache.get(schema.modelName, key);
        return (cached === undefined) ? undefined :
            this.entityTracker.trackPersistent(schema, cached);
    }
    findAll(model, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            if (schema.memCached) {
                let entities = this.entityCache.getAll(schema.modelName) || [];
                return track ? this.trackPersistentEntities(schema, entities, false) : entities;
            }
            return yield this.findMany(model, {}, track);
        });
    }
    findMany(model, condition, track = false, cache = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, condition);
            let entities = yield this.connection.query(sql.query, sql.parameters);
            if (cache)
                entities.forEach(e => this.entityCache.put(schema.modelName, schema.getKey(e), e));
            return !track ? entities :
                this.trackPersistentEntities(schema, entities, false);
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
            query = `select exists(${query.replace(';', '')}) as exist`;
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
        let exists = this.sessionCache.exists(schema.modelName, key) || this.entityTracker.isTracking(schema, theEntity);
        if (exists)
            throw new Error(`entity exists already ( model = '${schema.modelName}' key = '${key}' ) `);
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
            const cached = this.loadCached(model, key);
            if (cached !== undefined)
                return cached;
            const modelName = typeof model === 'string' ? model : model.name;
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
    loadCached(model, key) {
        const modelName = typeof model === 'string' ? model : model.name;
        const schema = this.getSchemaByName(modelName);
        const pe = this.entityTracker.getTrackingEntity(schema, key);
        if (pe)
            return pe;
        const entity = this.sessionCache.get(modelName, key);
        if (entity === undefined)
            return undefined;
        return this.entityTracker.trackPersistent(schema, entity);
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
            if (this.sessionSerial < serial)
                return this.sessionSerial;
            const from = this.sessionSerial;
            this.log.traceEnabled && this.log.trace(`BEGIN rollbackChanges ( serial = ${serial} )`);
            const sqls = this.trackerSqlBuilder.buildRollbackChangeSqls(serial);
            const trans = yield this.connection.beginTrans();
            try {
                yield this.connection.executeBatch(sqls);
                yield trans.commit();
                this.entityTracker.rollbackChanges(serial);
                this.sessionSerial = serial - 1;
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
        return util_1.isPrimitive(key) ? key : key.key;
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
            filter && filter(e) && result.push(e);
        });
        return result;
    }
    put(modelName, key, entity) {
        this.log.traceEnabled && this.log.trace(`put cache, model = ${modelName} key = ${key} entity = ${JSON.stringify(entity)}`);
        this.getModelCache(modelName, true).set(this.getCacheKey(key), entity);
    }
    evit(modelName, key) {
        let cacheKey = this.getCacheKey(key);
        this.log.traceEnabled && this.log.trace(`evit cache, model = ${modelName} key = ${cacheKey}`);
        const modelCache = this.getModelCache(modelName);
        if (modelCache)
            modelCache.del(cacheKey);
    }
    exists(modelName, key) {
        return this.get(modelName, this.getCacheKey(key)) !== undefined;
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
const sublevel = __webpack_require__(/*! level-sublevel */ "level-sublevel");
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
function promisify(callback) {
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
            this.subLeveldb = sublevel(this.leveldb);
            this.subMetas.forEach(s => this.registerSubLevel(s));
        });
    }
    registerSubLevel(meta) {
        const sub = this.subLeveldb.sublevel(meta.subName);
        const indexedSub = new IndexedSubLevel(sub, meta.subName, meta.keyField, ...meta.indexFields);
        this.subLevels.set(meta.subName, indexedSub);
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
        let { callback, promise } = promisify(openCallback);
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
        let { callback, promise } = promisify(closeCallback);
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
}
exports.LevelDB = LevelDB;
class IndexedSubLevel {
    get name() { return this.subName; }
    get indexes() { return this.indexArray; }
    constructor(sublevel, subName, keyField, ...indexFields) {
        this.leveldb = sublevel;
        this.subName = subName;
        this.keyField = keyField;
        this.indexArray = new Array().concat(...indexFields);
        this.indexedSubLevels = new Map();
        this.indexArray.forEach(f => {
            let sub = Senondary(sublevel, f.fieldName, f.calcIndex);
            this.indexedSubLevels.set(f.fieldName, sub);
        });
    }
    get key() {
        return this.keyField;
    }
    get(key, options, getCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyLevel = this.leveldb;
            let { callback, promise } = promisify(getCallback);
            keyLevel.get(key, options, callback);
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
            return yield indexLevel.get(key, getCallback);
        });
    }
    put(key, value, putCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = promisify(putCallback);
            this.leveldb.put(key, value, callback);
            return promise;
        });
    }
    del(key, delCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = promisify(delCallback);
            this.leveldb.del(key, callback);
            return promise;
        });
    }
    batch(array, options, batchCallback) {
        return __awaiter(this, arguments, void 0, function* () {
            if (arguments.length === 0)
                return this.leveldb.batch();
            let hasOptions = options && (!util_1.isFunction(options));
            let { callback, promise } = promisify(hasOptions ? batchCallback : options);
            if (hasOptions)
                this.leveldb.batch(array, options, callback);
            else
                this.leveldb.batch(array, callback);
            return promise;
        });
    }
    createReadStream(options) {
        return this.leveldb.createReadStream(options);
    }
    createKeyStream(options) {
        return this.leveldb.createKeyStream(options);
    }
    createValueStream(options) {
        return this.leveldb.createValueStream(options);
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
        this.lastBlockHeight = 0;
    }
    getLastBlockHeightFromDb() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { height } = yield this.blockDb.get(LAST_BLOCK_HEIGHT_KEY, {});
                return height;
            }
            catch (e) {
                if (!this.isKeyNotFoundError(e))
                    throw e;
                let lastHeight = { height: 0 };
                yield this.blockDb.put(LAST_BLOCK_HEIGHT_KEY, lastHeight);
                return lastHeight.height;
            }
        });
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.open();
            this.blockDb = this.db.getSubLevel('blk');
            this.historyDb = this.db.getSubLevel('his');
            this.lastBlockHeight = yield this.getLastBlockHeightFromDb();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.close();
        });
    }
    getLastBlockHeight() {
        return this.lastBlockHeight;
    }
    isKeyNotFoundError(e) {
        return e.name === 'NotFoundError';
    }
    appendBlock(block, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!block || !block.height || !block.id || !block.delegate)
                throw new Error(`Invalid block data`);
            yield this.historyDb.put(block.height, changes);
            yield this.blockDb.batch([
                { type: 'put', key: block.height, value: block },
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: { height: block.height } }
            ]);
            this.lastBlockHeight = block.height;
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
                throw new Error(`Invalid last block height '${height}'`);
            yield this.blockDb.batch([
                { type: 'del', key: height },
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: { height: height - 1 } }
            ]);
            yield this.historyDb.del(height);
            this.lastBlockHeight--;
        });
    }
    getBlockById(blockId) {
        return __awaiter(this, void 0, void 0, function* () {
            let blocks = yield this.blockDb.getBy('id', blockId);
            return (blocks.length === 0) ? undefined : blocks[0];
        });
    }
    getBlocksByHeightRange(minHeight, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ((minHeight, maxHeight) => {
                return new Promise((res, rej) => {
                    let blocks = new Array();
                    this.blockDb.createReadStream({ start: minHeight, end: maxHeight })
                        .on('data', data => blocks.push(data))
                        .on('error', e => rej(e))
                        .on('end', () => res(blocks));
                });
            })(minHeight, maxHeight);
        });
    }
    getBlocksByIds(...blockIds) {
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
    constructor(entity, ...fields) {
        this.entity = entity;
        this.fields = new Array(...fields);
    }
    static makeKey(...values) {
        Common_1.CodeContract.argument('values', values && values.length > 1, 'values must contains more than 1 item');
        return new Array(...values).join(CompositeKey.COMPOSITE_KEY_SEPARATOR);
    }
    get key() {
        let values = new Array();
        this.fields.forEach(f => values.push(this.entity[f]));
        return CompositeKey.makeKey(...values);
    }
    keyPart(name) {
        return this.entity[name];
    }
}
CompositeKey.COMPOSITE_KEY_SEPARATOR = '_&_';
exports.CompositeKey = CompositeKey;
class ModelSchema {
    constructor(schema, name) {
        this.schema = Object.assign({}, schema);
        this.name = name;
        this.memory = schema.memory === true;
        this.readonly = schema.readonly === true;
        this.local = schema.local === true;
        this.parseFields();
    }
    convertType(type) {
        return type === FieldTypes.String || type === FieldTypes.Text ?
            'String' :
            'Number';
    }
    parseFields() {
        const pkFields = this.schema.tableFields.filter(f => f.primary_key === true).map(f => f.name);
        if (!pkFields || pkFields.length < 1)
            throw new Error(`primary key is undefined`);
        this.allKeyFields = pkFields;
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
        return this.allKeyFields.length > 1;
    }
    get primaryKey() {
        if (this.allKeyFields.length > 1)
            throw Error(`model '${this.modelName}' identified by composite key`);
        return this.allKeyFields[0];
    }
    get keyFields() {
        return this.allKeyFields;
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
            this.keyFields.forEach(f => entity[f] = ck.keyPart(f));
        }
        return entity;
    }
    getKey(entity) {
        return this.allKeyFields.length === 1 ?
            entity[this.allKeyFields[0]] :
            new CompositeKey(entity, ...this.allKeyFields);
    }
    newEntity(model, key) {
        let entity = util_1.isString(model) ?
            {} :
            new model();
        return this.setKey(entity, key);
    }
    copyProperties(dest, src, includeKey = false) {
        this.allFields.forEach(f => {
            if (!includeKey && this.keyFields.indexOf(f) >= 0)
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
const Model_1 = __webpack_require__(/*! ../Model */ "./src/Model.ts");
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const util_1 = __webpack_require__(/*! util */ "util");
const JsonSql = __webpack_require__(/*! json-sql */ "json-sql")({ separatedValues: false });
const changeCase = __webpack_require__(/*! change-case */ "change-case");
exports.MULTI_SQL_SEPARATOR = '//;//';
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
        // database do not support composite key   
        if (schema.isCompsiteKey) {
            schemaObject.tableFields.forEach(f => f.primary_key = false);
        }
        schemaObject.tableFields.push({
            name: '_version_',
            type: Model_1.FieldTypes.Number,
            default: 0
        });
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
        return sqls.join(exports.MULTI_SQL_SEPARATOR);
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
    // private determineSort( tableName: string, sort : string|JsonObject ): any{
    //   sort || {}
    //   if (typeof sort === 'string') {
    //     if (sort === 'timestamp') {
    //       sort = 't.' + sort
    //     } else {
    //       sort = tableName + '.' + sort
    //     }
    //   } else if (typeof sort === 'object') {
    //     for (let k in sort) {
    //       if (k === 'timestamp') {
    //         sort['t.' + k] = sort[k]
    //       } else {
    //         sort[tableName + '.' + k] = sort[k]
    //       }
    //       delete sort[k]
    //     }
    //   }
    //   return sort
    // }
    // private determineWhere( tableName: string, where : string|JsonObject ): any{
    //   let condition = {} || where 
    //   if (Array.isArray(condition)) {
    //     condition = condition.slice()
    //     for (let i in condition) {
    //       for (let k in condition[i]) {
    //         condition[i][tableName + '.' + k] = condition[i][k]
    //         delete condition[i][k]
    //       }
    //     }
    //   } else if (typeof condition === 'object') {
    //     condition = Object.assign({}, condition)
    //     for (let k in condition) {
    //       condition[tableName + '.' + k] = condition[k]
    //       delete condition[k]
    //     }
    //   }
    //   condition[tableName + '._deleted_'] = 0
    // }
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
            yield this.connection.execute('COMMIT');
        });
    }
    rollback() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connection.execute('ROLLBACK');
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
            yield this.execute('BEGIN TRANSACTION');
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
    /**
     * initialize SmartDB , you need call this before use SmartDB
     * @param schemas table schemas in Database
     */
    init(schemas) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('schemas', () => Common_1.CodeContract.notNull(schemas));
            yield this.connection.connect();
            yield this.blockDB.open();
            schemas.forEach((schema) => __awaiter(this, void 0, void 0, function* () {
                this.schemas.set(schema.modelName, schema);
                let session = this.getSession(schema);
                yield session.registerSchema(schema);
                yield session.syncSchema(schema);
                if (schema.memCached)
                    yield session.findAll(schema.modelName, true);
            }));
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
        return this.blockDB.getLastBlockHeight();
    }
    /**
     * blocks count
     */
    get blocksCount() {
        return this.lastBlockHeight + 1;
    }
    /**
     * begin a new block
     * @param blockHeader
     */
    beginBlock(block) {
        // TODO: verify blockHeader here
        Common_1.CodeContract.argument('block', () => Common_1.CodeContract.notNull(block));
        this.currentBlock = block;
    }
    /**
     * commit block changes
     */
    commitBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentBlock)
                throw new Error('Current block is null');
            let blockHeader = Object.assign({}, this.currentBlock);
            blockHeader.transactions = undefined;
            yield this.blockDB.appendBlock(blockHeader, this.blockSession.getChanges());
            try {
                yield this.blockSession.saveChanges(this.currentBlock.height);
                this.blockSession.clearHistoryBefore(this.currentBlock.height - this.options.historyForRollback);
                this.cachedBlocks.put(this.currentBlock);
                this.currentBlock = null;
                this.log.infoEnabled && this.log.info(`commitBlock height = ${this.lastBlockHeight}`);
                return this.lastBlockHeight;
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`commitBlock failed ( height = ${this.lastBlockHeight} )`, err);
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
            const blockHeight = height || this.lastBlockHeight;
            const from = blockHeight;
            try {
                const ver = this.blockSession.historyVersion;
                if (from < ver.min) { // load history from leveldb, if cached history less than rollback height 
                    this.blockSession.attachHistory(yield this.blockDB.getHistoryChanges(from, ver.min - 1));
                }
                yield this.blockSession.rollbackChanges(blockHeight);
                while (this.lastBlockHeight >= blockHeight) {
                    yield this.blockDB.deleteLastBlock(this.lastBlockHeight);
                    this.cachedBlocks.evit(this.lastBlockHeight, this.lastBlockHeight);
                }
                this.currentBlock = null;
                this.log.infoEnabled && this.log.info(`rollbackBlock height : ${from} -> ${this.lastBlockHeight}`);
            }
            catch (err) {
                this.log.errorEnaled && this.log.error(`rollbackBlock failed ( height : ${from} -> ${this.lastBlockHeight} )`, err);
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
            Common_1.CodeContract.argument('serial', serial > 0, `serial must great than zero`);
            yield this.localSession.rollbackChanges(serial);
            this.localSession.clearHistoryBefore(serial);
        });
    }
    /**
     * refresh entity and tracking given entity, WARN: entity may be changed
     * @param model model modelName or model type
     * @param entity entity
     * @returns tracked entity or undefined
     */
    attach(model, entity) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('entity', () => Common_1.CodeContract.notNull(entity));
        let schema = this.getSchema(model, true, true);
        return this.getSession(schema).attach(schema, entity);
    }
    /**
     * create a new entity which change will be tracked and persistented (by saveChanges) automatically
     * @param model modelName or model type
     * @param key entity key which uniqued in database
     * @param entity prototype entity which properties will copy to result entity
     * @returns tracking entity
     */
    create(model, key, entity) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
        let schema = this.getSchema(model, true, true);
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
        Common_1.CodeContract.argument('entity', entity && EntityProxy_1.EntityProxy.isProxied(entity), `is not a tracking entity`);
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
     */
    getBy(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            Common_1.CodeContract.argument('condition', () => Common_1.CodeContract.notNull(condition));
            let schema = this.getSchema(model, true);
            let items = yield this.getSession(schema).findMany(model, condition);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}' , condition = '${JSON.stringify(condition)}' )`);
            return items.length === 0 ? undefined : items[0];
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
            return yield this.getSession(schema).findMany(model, condition, track);
        });
    }
    /**
     * load entity from cache only
     * @param model model name or model type
     * @param key key of entity
     */
    getCached(model, key) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).loadCached(model, key);
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
    /**
     * get block header by height
     * @param height block height
     */
    getBlockByHeight(height, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('height', height > 0, 'height must great than zero');
            let cachedBlock = this.cachedBlocks.get(height);
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
            let cachedBlock = this.cachedBlocks.getById(blockId);
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
            Common_1.CodeContract.argument('minHeight, maxHeight', minHeight > 0 && maxHeight >= minHeight, 'minHeight or maxHeight is invalid');
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
            let blockHeaders = yield this.blockDB.getBlocksByIds(...blockIds);
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
    static proxyToEntity(proxied) {
        let entity = {};
        for (let k in proxied) {
            if (EntityProxy.isNormalProperty(k))
                entity[k] = proxied[k];
        }
        return entity;
    }
    static isNormalProperty(propertyName) {
        return propertyName && (!propertyName.startsWith('__') && !propertyName.endsWith('__'));
    }
    attachExtendProperties(entity, schema, state) {
        return Object.assign({
            _version_: entity['_version_'] || 1,
            __detached__: false,
            __state__: state,
            __schema__: schema,
            __tracker__: this.tracker,
            __tracking__: true,
            __tmpChanges__: null
        }, entity);
    }
    onPropertySet(entity, propertyName, value, receiver) {
        const ext = entity;
        const name = propertyName.toString();
        if (!EntityProxy.isNormalProperty(name) || !ext.__tracking__ || value === entity[propertyName]) {
            entity[propertyName] = value;
            return true;
        }
        if (ext.__state__ === EntityState.Deleted || ext.__state__ === EntityState.Transient) {
            throw new Error(`Can not modify property after deleted`);
        }
        if (ext.__schema__.isReadonly) {
            throw new Error(`Can not modify readonly model '${ext.__schema__.modelName}'`);
        }
        if (ext.__schema__.keyFields.indexOf(name) >= 0) {
            throw new Error(`Can not modify primary field property`);
        }
        if (ext.__detached__) {
            ext.__tracker__.attach(receiver);
            ext.__detached__ = false;
        }
        if (ext.__state__ === EntityState.Persistent) {
            ext._version_++;
            ext.__state__ = EntityState.Modified;
            ext.__tmpChanges__ = {
                type: EntityChangeType.Modify,
                dbVersion: ext._version_,
                propertiesChanges: new Array({
                    name: '_version_', original: ext._version_ - 1, current: ext._version_
                })
            };
        }
        if (ext.__state__ === EntityState.Modified) {
            ext.__tmpChanges__.propertiesChanges.push({ name: name, original: ext[name], current: value });
        }
        entity[propertyName] = value;
        return true;
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
    proxyNew(entity, schema) {
        let extended = this.attachExtendProperties(entity, schema, EntityState.New);
        return new Proxy(extended, { set: this.onPropertySet });
    }
    /**
     * Make entity wrapped by proxy so that state changes can be detected
     * @param entity Entity loaded from database. ATTENSTION: ensure that has property '_version_'
     * @param model Model Name
     */
    proxyPersistent(entity, schema) {
        let extended = this.attachExtendProperties(entity, schema, EntityState.Persistent);
        return new Proxy(extended, { set: this.onPropertySet });
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
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const EntityProxy_1 = __webpack_require__(/*! ./EntityProxy */ "./src/StateTracker/EntityProxy.ts");
class ProxiedEntityTracker {
    constructor(cache) {
        this.log = Log_1.LogManager.getLogger(ProxiedEntityTracker.name);
        this.proxy = new EntityProxy_1.EntityProxy(this);
        this.cache = cache;
        this.history = new Map();
        this.allTrackingEntities = new Map();
        this.minVersion = -1;
        this.currentVersion = -1;
    }
    ensureNoTracking(schema, entity) {
        const trackingKey = this.makeModelAndKey(schema, schema.getKey(entity));
        if (this.allTrackingEntities.has(trackingKey))
            throw new Error(`entity model=${schema.modelName} key=${schema.getKey(entity)} is tracking`);
    }
    makeModelAndKey(schema, key) {
        let keyString = schema.isCompsiteKey ? key.key : String(key);
        return `${schema.modelName}${ProxiedEntityTracker.modelAndKeySeparator}!!${keyString}`;
    }
    splitModelAndKey(modelAndKey) {
        const array = modelAndKey.split(ProxiedEntityTracker.modelAndKeySeparator);
        return { model: array[0], key: array[1] };
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
        this.allTrackingEntities.set(this.getModelAndKey(pe), pe);
    }
    getLastChanges(pe) {
        if (!EntityProxy_1.EntityProxy.isDirty(pe))
            return undefined;
        switch (pe.__state__) {
            case EntityProxy_1.EntityState.New:
                return this.createNewOrDeleteChanges(pe, pe._version_, true);
            case EntityProxy_1.EntityState.Deleted:
                return this.createNewOrDeleteChanges(pe, pe._version_, false);
            case EntityProxy_1.EntityState.Modified:
                return pe.__tmpChanges__;
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
    isTracking(schema, entity) {
        return this.allTrackingEntities.has(this.makeModelAndKey(schema, schema.getKey(entity)));
    }
    getTrackingEntity(schema, key) {
        const trackingKey = this.makeModelAndKey(schema, key);
        return this.allTrackingEntities.has(trackingKey) ? this.allTrackingEntities.get(trackingKey) : undefined;
    }
    trackNew(schema, entity) {
        this.ensureNoTracking(schema, entity);
        let proxied = this.proxy.proxyNew(entity, schema);
        this.allTrackingEntities.set(this.getModelAndKey(proxied), proxied);
        return proxied;
    }
    trackDelete(schema, entity) {
        let proxied = EntityProxy_1.EntityProxy.convertToProxied(entity);
        if (proxied.__state__ === EntityProxy_1.EntityState.New || proxied.__state__ === EntityProxy_1.EntityState.Transient) {
            proxied.__state__ = EntityProxy_1.EntityState.Transient;
        }
        else if (proxied.__state__ === EntityProxy_1.EntityState.Modified) {
            proxied.__state__ = EntityProxy_1.EntityState.Deleted;
            // TODO: 先修改再删除，需要恢复到什么状态？
            proxied.__tmpChanges__ = null;
        }
        else {
            proxied.__state__ = EntityProxy_1.EntityState.Deleted;
        }
    }
    trackPersistent(schema, entity) {
        this.ensureNoTracking(schema, entity);
        let proxied = this.proxy.proxyPersistent(entity, schema);
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
                { name: key, original: null, current: entity[key] } :
                { name: key, original: entity[key], current: null });
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
                this.log.traceEnabled && this.log.trace(`MODIFIED Version = ${historyVersion} changes = ${JSON.stringify(pe.__tmpChanges__)}`);
                pe.__state__ = EntityProxy_1.EntityState.Persistent;
                this.saveHistory(pe, pe.__tmpChanges__, historyVersion);
                pe.__tmpChanges__ = null;
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
        this.allTrackingEntities.forEach(pe => {
            switch (pe.__state__) {
                case EntityProxy_1.EntityState.New:
                    pe.__state__ = EntityProxy_1.EntityState.Transient;
                    break;
                case EntityProxy_1.EntityState.Modified:
                    pe.__tracking__ = false;
                    pe.__tmpChanges__.propertiesChanges.forEach(c => pe[c.name] = c.original);
                    pe.__tracking__ = true;
                    pe.__tmpChanges__ = null;
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
ProxiedEntityTracker.modelAndKeySeparator = '!#!';
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
        const entity = EntityProxy_1.EntityProxy.proxyToEntity(pe);
        switch (pe.__state__) {
            case EntityProxy_1.EntityState.New:
                return this.sqlBuilder.buildInsert(pe.__schema__, entity);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUM7UUFDdEIsY0FBUyxHQUFZLENBQUM7UUFJNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjO0lBQ3RDLENBQUM7SUFFTSxRQUFRLENBQUUsTUFBYztRQUM3QixPQUFPLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksTUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTO0lBQzNFLENBQUM7SUFFRCxJQUFXLGlCQUFpQjtRQUMxQixPQUFPLEVBQUUsR0FBRyxFQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7SUFDdEQsQ0FBQztJQUVNLEdBQUcsQ0FBRSxLQUFZO1FBQ3RCLElBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFFLEtBQUssQ0FBQyxNQUFNLENBQUUsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQztZQUN4RSxNQUFNLElBQUksS0FBSyxDQUFFLHNCQUFzQixDQUFDO1FBRTFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFFO1FBQ3JDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU07UUFFN0IsSUFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFHO1lBQzVDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBRTtTQUN0QztJQUNILENBQUM7SUFFTSxHQUFHLENBQUUsTUFBYztRQUN4QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztJQUMvQixDQUFDO0lBRU0sT0FBTyxDQUFFLEVBQVU7UUFDeEIsS0FBSyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFHO1lBQ3BDLElBQUssQ0FBQyxDQUFDLEVBQUcsS0FBSyxFQUFFO2dCQUFHLE9BQU8sQ0FBQztTQUM3QjtRQUNELE9BQU8sU0FBUztJQUNsQixDQUFDO0lBRU0sSUFBSSxDQUFFLFVBQWtCLEVBQUUsUUFBZ0I7UUFDL0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBRSxVQUFVLEVBQUUsUUFBUSxDQUFFO1FBQzFDLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBRTtRQUMxQyxJQUFLLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUztZQUFHLE9BQU07UUFFMUQsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUU7UUFDckMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUU7UUFDckMsS0FBTSxJQUFJLE1BQU0sR0FBRyxHQUFHLEVBQUUsTUFBTSxJQUFJLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRztZQUNoRCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDMUI7SUFDSCxDQUFDO0NBQ0Y7QUFwREQsZ0NBb0RDOzs7Ozs7Ozs7Ozs7Ozs7QUN2REQsdURBQWlDO0FBMkJqQyx3QkFBa0MsUUFBcUIsRUFBRSxNQUF5QixFQUFFLFFBQXVCO0lBQ3pHLElBQUksR0FBRyxHQUFHLEVBQUU7SUFDWixLQUFLLElBQUksSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUN6QixHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztLQUNuQztJQUNELE9BQU8sR0FBRztBQUNaLENBQUM7QUFORCx3Q0FNQztBQUVELGtCQUE0QixHQUFPO0lBQ2pDLElBQUssQ0FBQyxHQUFHO1FBQUcsT0FBTyxHQUFHO0lBQ3RCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFIRCw0QkFHQztBQUVELHVCQUErQixTQUFRLEtBQUs7SUFDMUMsWUFBYSxPQUFnQjtRQUMzQixLQUFLLENBQUUsc0JBQXNCLEdBQUUsT0FBTyxDQUFFO0lBQzFDLENBQUM7Q0FDRjtBQUpELDhDQUlDO0FBV0Q7SUFDUyxNQUFNLENBQUMsTUFBTSxDQUFFLFNBQTRCLEVBQUUsT0FBeUI7UUFDM0UsSUFBSyxTQUFTLEtBQUssU0FBUyxJQUFJLFNBQVMsS0FBSyxJQUFJO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUVoRyxNQUFNLElBQUksR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxTQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDMUUsTUFBTSxHQUFHLEdBQUcsaUJBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsT0FBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBRW5FLElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxJQUFJLGlCQUFpQixDQUFFLEdBQUcsQ0FBRTtJQUMvQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBRSxPQUFlLEVBQUUsTUFBMEMsRUFBRSxPQUEwQjtRQUM3RyxJQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDO1FBRWxFLElBQUssQ0FBQyxPQUFPLEVBQUc7WUFDZCxNQUFNLEVBQUUsR0FBSyxNQUF5QixFQUFFO1lBQ3hDLFlBQVksQ0FBQyxNQUFNLENBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLE9BQU8sS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEUsT0FBTTtTQUNQO1FBRUQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUEyQixFQUFFLE9BQVEsQ0FBQztJQUM1RCxDQUFDO0lBR00sTUFBTSxDQUFDLE9BQU8sQ0FBRSxHQUFTO1FBQzlCLE1BQU0sTUFBTSxHQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFNBQVM7UUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtRQUVsRSxPQUFPLEVBQUUsTUFBTSxFQUFHLE9BQU8sRUFBRTtJQUM3QixDQUFDO0lBRU0sTUFBTSxDQUFDLGNBQWMsQ0FBRSxHQUFxQjtRQUNqRCxNQUFNLE1BQU0sR0FBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7UUFFM0UsT0FBTyxFQUFFLE1BQU0sRUFBRyxPQUFPLEVBQUU7SUFDN0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBRSxHQUFxQjtRQUN0RCxNQUFNLE1BQU0sR0FBSSxZQUFZLENBQUMsY0FBYyxDQUFFLEdBQUcsQ0FBRSxJQUFNLEdBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFaEYsT0FBTyxFQUFFLE1BQU0sRUFBRyxPQUFPLEVBQUU7SUFDN0IsQ0FBQztDQUVGO0FBN0NELG9DQTZDQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNwR0QsdUZBQStFO0FBRy9FLGdHQUEyRjtBQUUzRix1SEFBeUc7QUFFekcsK0RBQTBDO0FBQzFDLHVEQUE4QjtBQUk5QjtJQVVFLFlBQVksVUFBd0IsRUFBRSxZQUFpQyxFQUFFLFdBQW9CO1FBQzNGLElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQVUsQ0FBQyxTQUFTLENBQUUsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFFLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFHO1FBQzFHLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQztRQUN0QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVU7UUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsRUFBdUI7UUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLDRCQUFjLENBQUMsWUFBWSxDQUFDO1FBQ3BELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSwyQkFBYyxFQUFFO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxvQ0FBb0IsQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFFO1FBQ2xFLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGlDQUFpQixDQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFFO0lBQ3BHLENBQUM7SUFFRCxJQUFXLE1BQU07UUFDZixPQUFPLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXO0lBQ3ZELENBQUM7SUFFRCxJQUFXLFdBQVc7UUFDcEIsT0FBTyxJQUFJLENBQUMsWUFBWTtJQUMxQixDQUFDO0lBRVksVUFBVSxDQUFDLE1BQW1COztZQUN6QyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7WUFDL0MsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7UUFDdEMsQ0FBQztLQUFBO0lBRU0sY0FBYyxDQUFDLEdBQUcsT0FBNEI7UUFDbkQsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUU7SUFDekQsQ0FBQztJQUVTLGVBQWUsQ0FBQyxTQUFpQjtRQUN6QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDekMsSUFBSyxDQUFDLE1BQU07WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxTQUFTLEtBQUssQ0FBQztRQUM5RSxPQUFPLE1BQU07SUFDZixDQUFDO0lBRVMsZ0JBQWdCLENBQVUsS0FBMkI7UUFDN0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztRQUMxQyxJQUFLLENBQUMsTUFBTTtZQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0NBQWdDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQztRQUMvRSxPQUFPLE1BQU07SUFDZixDQUFDO0lBRVMsU0FBUyxDQUFXLEtBQStCO1FBQzNELE9BQU8sT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7SUFDaEMsQ0FBQztJQUVTLGtCQUFrQixDQUFDLE1BQW1CLEVBQUUsR0FBYztRQUM5RCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFLEdBQUcsQ0FBRTtJQUNqQyxDQUFDO0lBRVMsdUJBQXVCLENBQVcsTUFBbUIsRUFBRyxRQUF5QixFQUFFLEtBQUssR0FBRyxJQUFJO1FBQ3ZHLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxFQUFXO1FBQ2pDLFFBQVEsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUU7WUFDNUQsS0FBSyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUU7UUFDekUsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVTLEtBQUssQ0FBQyxhQUFzQixLQUFLO1FBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFO1FBQ2pDLElBQUssVUFBVTtZQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFO0lBQzVDLENBQUM7SUFFWSxLQUFLOztZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFFLElBQUksQ0FBRTtZQUNsQixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1FBQ3BDLENBQUM7S0FBQTtJQUVNLGFBQWEsQ0FBRSxPQUE4QztRQUNsRSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBRSxPQUFPLENBQUU7SUFDN0MsQ0FBQztJQUVNLFlBQVksQ0FBVyxLQUErQixFQUFFLE1BQWlDLEVBQUUsS0FBSyxHQUFHLEtBQUs7UUFDN0csTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7UUFDcEMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQVcsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUUsSUFBSSxFQUFFO1FBRWpGLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUTtJQUNuRixDQUFDO0lBRU0sTUFBTSxDQUFXLE1BQW1CLEVBQUUsTUFBZTtRQUMxRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFXLE1BQU0sRUFBRSxHQUFHLENBQUU7UUFDMUUsSUFBSyxPQUFPLEtBQUssU0FBUztZQUFHLE9BQU8sT0FBNEI7UUFFaEUsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQVcsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUU7UUFDbkUsT0FBTyxDQUFFLE1BQU0sS0FBSyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtJQUN4RCxDQUFDO0lBRVksT0FBTyxDQUFXLEtBQStCLEVBQUUsS0FBSyxHQUFHLEtBQUs7O1lBQzNFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBRXBDLElBQUssTUFBTSxDQUFDLFNBQVMsRUFBRztnQkFDdEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQVcsTUFBTSxDQUFDLFNBQVMsQ0FBRSxJQUFJLEVBQUU7Z0JBQ3pFLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUTthQUNsRjtZQUVELE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFFLEtBQUssRUFBRSxFQUFHLEVBQUUsS0FBSyxDQUFFO1FBQ2pELENBQUM7S0FBQTtJQUVZLFFBQVEsQ0FBVyxLQUFnQyxFQUFFLFNBQXVCLEVBQUUsS0FBSyxHQUFHLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSTs7WUFDcEgsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO1lBRTdFLElBQUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQ3JFLElBQUssS0FBSztnQkFBRyxRQUFRLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1lBRWxHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLENBQUMsdUJBQXVCLENBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUU7UUFDM0QsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUFVLEtBQStCLEVBQUUsU0FBd0IsRUFBRSxXQUE2QixFQUFFLElBQWdCLEVBQUUsTUFBc0IsRUFBRSxJQUFrQjs7WUFDaEwsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQ3RHLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUM7UUFDL0QsQ0FBQztLQUFBO0lBRVksV0FBVyxDQUFVLEtBQStCLEVBQUUsTUFBbUI7O1lBQ3BGLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ3BDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDdkQsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFWSxNQUFNLENBQVUsS0FBK0IsRUFBRSxTQUF3Qjs7WUFDcEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLENBQUU7WUFFdEMsSUFBSSxFQUFFLEtBQUssRUFBRyxVQUFVLEVBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBRSxNQUFNLEVBQUUsRUFBRSxFQUFHLFNBQVMsQ0FBRTtZQUNqRixLQUFLLEdBQUcsaUJBQWlCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxZQUFZO1lBQzNELE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBRTtZQUU1RCxPQUFPLGNBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUN0RCxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQVUsS0FBK0IsRUFBRSxTQUF3Qjs7WUFDbkYsSUFBSSxHQUFHLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFFLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUU7WUFDakcsT0FBTyxjQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDO0tBQUE7SUFFTSxNQUFNLENBQVUsS0FBZ0MsRUFBRyxHQUFjLEVBQUUsTUFBaUI7UUFDekYsSUFBSyxDQUFDLEdBQUc7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDO1FBRXRFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3BDLElBQUksU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBRTtRQUM5QyxNQUFNLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBRSxTQUFTLEVBQUUsTUFBTSxDQUFFO1FBRXBELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQztRQUNoSCxJQUFLLE1BQU07WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLG9DQUFvQyxNQUFNLENBQUMsU0FBUyxZQUFZLEdBQUcsTUFBTSxDQUFDO1FBRXhHLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBWTtJQUNsRSxDQUFDO0lBRWUsZUFBZSxDQUFDLFNBQWlCLEVBQUUsR0FBYzs7WUFDL0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7WUFDOUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7WUFDbEQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO1lBRXpFLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDO1lBQ25FLElBQUssSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUc7Z0JBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLFNBQVMsWUFBWSxHQUFHLEtBQUssQ0FBRTthQUN2RjtZQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztRQUNoRCxDQUFDO0tBQUE7SUFFWSxJQUFJLENBQVUsS0FBZ0MsRUFBRSxHQUFjOztZQUN6RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUU7WUFDNUMsSUFBSyxNQUFNLEtBQUssU0FBUztnQkFBRyxPQUFPLE1BQU07WUFFekMsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJO1lBQ2hFLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBRSxTQUFTLEVBQUUsR0FBRyxDQUFFO1lBQzNELElBQUssTUFBTSxLQUFLLFNBQVM7Z0JBQUcsT0FBTyxTQUFTO1lBRTVDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFFO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLENBQVk7UUFDL0YsQ0FBQztLQUFBO0lBRU0sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRTtJQUNoRCxDQUFDO0lBRU0sVUFBVSxDQUFVLEtBQWdDLEVBQUUsR0FBYztRQUN6RSxNQUFNLFNBQVMsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7UUFDaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUM7UUFFOUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBVSxNQUFNLEVBQUUsR0FBRyxDQUFDO1FBQ3JFLElBQUssRUFBRTtZQUFHLE9BQU8sRUFBdUI7UUFFeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQztRQUNwRCxJQUFLLE1BQU0sS0FBSyxTQUFTO1lBQUcsT0FBTyxTQUFTO1FBRTVDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBWTtJQUN0RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ1UsV0FBVyxDQUFDLE1BQWdCOztZQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsU0FBUyxJQUFJLENBQUM7WUFFdEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRTtZQUNyRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ2hELElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBRSxJQUFJLENBQUU7Z0JBQzFDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFFcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUUsU0FBUyxDQUFFO2dCQUM3QyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVM7Z0JBRTlCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxTQUFTLElBQUksQ0FBQztnQkFDeEYsT0FBTyxTQUFTO2FBQ2pCO1lBQ0QsT0FBTSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLFNBQVMsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDMUYsTUFBTSxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRTtnQkFDbEMsTUFBTSxHQUFHO2FBQ1Y7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVSxlQUFlLENBQUUsTUFBYzs7WUFDMUMsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU07Z0JBQUcsT0FBTyxJQUFJLENBQUMsYUFBYTtZQUUzRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYTtZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsTUFBTSxJQUFJLENBQUM7WUFFdkYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQztZQUNuRSxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ2hELElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFFcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sR0FBRyxDQUFDO2dCQUUvQixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSxPQUFPLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQztnQkFDOUcsT0FBTyxJQUFJLENBQUMsYUFBYTthQUMxQjtZQUNELE9BQU0sR0FBRyxFQUFFO2dCQUNULElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxJQUFJLE9BQU8sSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDaEgsTUFBTSxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUN0QixNQUFNLEdBQUc7YUFDVjtRQUNILENBQUM7S0FBQTtJQUVNLGtCQUFrQixDQUFFLE1BQWM7UUFDdkMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBRSxNQUFNLENBQUU7SUFDbEQsQ0FBQztJQUVELElBQVcsY0FBYztRQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYztJQUMxQyxDQUFDO0lBRU0sTUFBTSxDQUFVLE1BQWU7UUFDcEMsZUFBZTtJQUNqQixDQUFDO0lBRU0sTUFBTSxDQUFVLE1BQWU7UUFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUUsTUFBb0MsQ0FBQyxVQUFVLEVBQUcsTUFBTSxDQUFDO0lBQzNGLENBQUM7SUFFWSxnQkFBZ0I7O1lBQzNCLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtRQUMzQyxDQUFDO0tBQUE7Q0FFRjtBQXpSRCw4QkF5UkM7Ozs7Ozs7Ozs7Ozs7OztBQ3JTRCw4REFBZ0M7QUFFaEMsK0RBQTBDO0FBQzFDLHVEQUFtRTtBQW9CbkU7SUFRRSxZQUFvQixPQUE0QjtRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLE9BQU8sRUFBRyxjQUFjLENBQUMsdUJBQXVCLEVBQUU7UUFDOUUsZ0NBQWdDO1FBQ2hDLDJHQUEyRztRQUUzRyxJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFVLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBcUM7SUFDakUsQ0FBQztJQUVPLGFBQWEsQ0FBQyxTQUFrQixFQUFFLGlCQUFpQixHQUFHLEtBQUssRUFBRSxnQkFBZ0IsR0FBRyxLQUFLO1FBQzNGLElBQUssaUJBQWlCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUMxRCxvQkFBb0I7WUFDcEIsY0FBYztZQUNkLDZEQUE2RDtZQUM3RCxnREFBZ0Q7WUFDaEQsNEJBQTRCO1lBQzVCLElBQUk7WUFDSixJQUFJLGNBQXVCLENBQUM7WUFDNUIsSUFBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQztnQkFDMUMsY0FBYyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztpQkFDbEMsSUFBSyxlQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDekMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUM3QyxJQUFLLGlCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0MsY0FBYyxHQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUF1QixDQUFFLFNBQVMsQ0FBRTs7Z0JBRTdFLGNBQWMsR0FBRyxjQUFjLENBQUMsdUJBQXVCO1lBRXpELGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUU7WUFDNUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksR0FBRyxDQUFrQixjQUFjLENBQUUsQ0FBRTtTQUM1RTtRQUNBLElBQUssZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7WUFDdkQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsU0FBUyxzQkFBc0IsQ0FBQztRQUU1RSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztJQUN4QyxDQUFDO0lBRVMsV0FBVyxDQUFFLEdBQWM7UUFDbkMsT0FBTyxrQkFBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFzQixDQUFDLENBQUMsQ0FBRyxHQUFrQixDQUFDLEdBQUc7SUFDN0UsQ0FBQztJQUVNLEtBQUssQ0FBQyxTQUFtQjtRQUM5QixJQUFLLGVBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRztZQUN6QixJQUFJLENBQUMsYUFBYSxDQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFHLENBQUMsS0FBSyxFQUFFO1lBQ3JELElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFFLFNBQVMsQ0FBRTtZQUNwQyxPQUFNO1NBQ1A7UUFDRCxLQUFNLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEVBQUc7WUFDekMsQ0FBQyxDQUFDLEtBQUssRUFBRTtTQUNWO1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7SUFDMUIsQ0FBQztJQUVELElBQVcsTUFBTTtRQUNmLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxFQUFVO1FBQ2hDLEtBQUssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRztZQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRTtTQUNqQjtRQUNELE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFTSxHQUFHLENBQVUsU0FBaUIsRUFBRSxHQUFjO1FBQ25ELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBQzlDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsR0FBRyxDQUFFO1FBRXRDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbkQsVUFBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQVksQ0FBQyxDQUFDLENBQUMsU0FBUztJQUNoRixDQUFDO0lBRU0sTUFBTSxDQUFVLFNBQWlCLEVBQUUsTUFBaUM7UUFDekUsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQVc7UUFDakMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBRSxTQUFTLENBQUU7UUFDM0MsSUFBSyxLQUFLLEtBQUssU0FBUztZQUFHLE9BQU8sU0FBUztRQUUzQyxLQUFLLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ2pCLE1BQU0sSUFBSSxNQUFNLENBQUUsQ0FBWSxDQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBRSxDQUFZLENBQUU7UUFDbEUsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVNLEdBQUcsQ0FBQyxTQUFpQixFQUFFLEdBQWMsRUFBRSxNQUFjO1FBQzFELElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixTQUFTLFVBQVUsR0FBRyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUMxSCxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUM7SUFDekUsQ0FBQztJQUVNLElBQUksQ0FBQyxTQUFpQixFQUFFLEdBQWM7UUFDM0MsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxHQUFHLENBQUU7UUFDdEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLFNBQVMsVUFBVSxRQUFRLEVBQUUsQ0FBQztRQUU3RixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQztRQUNoRCxJQUFJLFVBQVU7WUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQztJQUMxQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQWlCLEVBQUUsR0FBYztRQUM3QyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsR0FBRyxDQUFFLENBQUMsS0FBSyxTQUFTO0lBQ3BFLENBQUM7SUFFTSxTQUFTO1FBQ2QsSUFBSSxNQUFNLEdBQUcsa0RBQWtEO1FBQy9ELElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pDLE1BQU0sSUFBSSx1QkFBdUIsS0FBSyxvQkFBb0I7WUFDMUQsS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUcsRUFBRTtnQkFDL0IsTUFBTSxJQUFJLFNBQVMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxHQUFHLENBQUUsZUFBZSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNO1lBQ3ZGLENBQUMsQ0FBQztZQUNGLE1BQU0sSUFBSSxJQUFJO1FBQ2hCLENBQUMsQ0FBQztRQUNGLE1BQU0sSUFBSSxpREFBaUQ7UUFDM0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQzs7QUFsSGMsK0JBQWdCLEdBQUcsR0FBRztBQUN0QixzQ0FBdUIsR0FBRyxLQUFLO0FBRmhELHdDQXFIQzs7Ozs7Ozs7Ozs7Ozs7O0FDNUlELHFFQUFnQztBQUNoQyxtRUFBZ0M7QUFFaEMsNkVBQXNDO0FBQ3RDLHNHQUFrRDtBQUdsRCxJQUFpQixRQUFRLENBT3hCO0FBUEQsV0FBaUIsUUFBUTtJQUNWLGdCQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU87SUFDckIsb0JBQVcsR0FBRyxLQUFLLENBQUMsV0FBVztJQUUvQixrQkFBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTO0lBRTdCLHlCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0I7QUFDekQsQ0FBQyxFQVBnQixRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQU94Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNkRCx1REFBaUM7QUFFakMsNkVBQTBDO0FBRTFDLE1BQU0sS0FBSyxHQUFHLG1CQUFPLENBQUMsb0JBQU8sQ0FBQztBQUM5QixNQUFNLFNBQVMsR0FBRyxtQkFBTyxDQUFDLHdDQUFpQixDQUFDO0FBSzVDO0lBS0UsWUFBbUIsT0FBZSxFQUFFLFFBQWdCLEVBQUUsV0FBVyxHQUFHLElBQUksS0FBSyxFQUFjO1FBQ3pGLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVE7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLEtBQUssRUFBYyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDaEUsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFNBQWtCO1FBQzdDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN6RSxDQUFDO0lBRU0sV0FBVyxDQUFDLFNBQWlCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sUUFBUSxDQUFDLFNBQWtCLEVBQUUsU0FBNkI7UUFDL0QsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQztZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixTQUFTLGtCQUFrQixDQUFDO1FBRWpFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQy9DLE9BQU8sSUFBSTtJQUNiLENBQUM7SUFFTSxXQUFXLENBQUMsU0FBUztRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDO1FBQ2hELElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ1osSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUMvQjtRQUNELE9BQU8sSUFBSTtJQUNiLENBQUM7Q0FDRjtBQWxDRCxvQ0FrQ0M7QUFFRDtJQUNFLElBQUksUUFBUTtJQUNaLElBQUksT0FBTyxHQUFHLElBQUksT0FBTyxDQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQzdDLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQy9ELENBQUMsQ0FBQztJQUNGLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTztJQUMxQixPQUFPLFFBQVE7QUFDakIsQ0FBQztBQUVELG1CQUFtQixRQUFvQztJQUNyRCxJQUFJLE9BQU8sR0FBRyxJQUFJO0lBRWxCLElBQUssQ0FBQyxRQUFRLEVBQUc7UUFDZixRQUFRLEdBQUcsV0FBVyxFQUFFO1FBQ3hCLE9BQU8sR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0tBQzlCO0lBRUQsT0FBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUU7QUFDN0IsQ0FBQztBQTBCRDtJQU9FLFlBQVksS0FBYyxFQUFFLElBQTBCLEVBQUUsT0FBTyxHQUFHLEVBQUU7UUFDbEUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxLQUFLLEVBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUN0RCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksR0FBRyxFQUF3QjtRQUNoRCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUk7SUFDckIsQ0FBQztJQUVhLElBQUk7O1lBQ2hCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLENBQUU7WUFDN0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQUE7SUFFTyxnQkFBZ0IsQ0FBRSxJQUFrQjtRQUMxQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ2xELE1BQU0sVUFBVSxHQUFHLElBQUksZUFBZSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzdGLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDO0lBQy9DLENBQUM7SUFFRCxJQUFXLEtBQUs7UUFDZCxPQUFPLElBQUksQ0FBQyxPQUFPO0lBQ3JCLENBQUM7SUFFTSxXQUFXLENBQUUsT0FBZTtRQUNqQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDdkMsSUFBSyxDQUFDLEdBQUc7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixPQUFPLEdBQUcsQ0FBQztRQUVuRSxPQUFPLEdBQUc7SUFDWixDQUFDO0lBRU0sSUFBSSxDQUFDLFlBQTZCO1FBQ3ZDLElBQUksSUFBSSxHQUFHLElBQUk7UUFDZixJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7UUFFbkQsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2YsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQztZQUN0QyxPQUFPLE9BQU87U0FDZjtRQUVELENBQUMsR0FBTyxFQUFFO1lBQ1IsSUFBSTtnQkFDRixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ2pCLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7YUFDdkM7WUFDRCxPQUFNLEdBQUcsRUFBRTtnQkFDVCxPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDO2FBQ3RDO1FBQ0gsQ0FBQyxFQUFDLEVBQUU7UUFFSixPQUFPLE9BQU87SUFDaEIsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUE4QjtRQUN6QyxJQUFJLElBQUksR0FBRyxJQUFJO1FBQ2YsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsYUFBYSxDQUFDO1FBRXBELElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQ3RDLE9BQU8sT0FBTztTQUNmO1FBRUQsQ0FBQyxHQUFPLEVBQUU7WUFDUixJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSTtnQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzthQUN2QztZQUNELE9BQU0sR0FBRyxFQUFFO2dCQUNULE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQzthQUNoQztRQUNILENBQUMsRUFBQyxFQUFFO1FBRUosT0FBTyxPQUFPO0lBQ2hCLENBQUM7SUFFRCxJQUFXLE1BQU07UUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7SUFDOUMsQ0FBQztJQUVELElBQVcsUUFBUTtRQUNqQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7SUFDbkQsQ0FBQztDQUNGO0FBekZELDBCQXlGQztBQUVEO0lBT0UsSUFBVyxJQUFJLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7SUFDekMsSUFBVyxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFDLENBQUM7SUFFL0MsWUFBb0IsUUFBYSxFQUFFLE9BQWUsRUFBRSxRQUFpQixFQUFFLEdBQUcsV0FBK0I7UUFDdkcsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVE7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLEtBQUssRUFBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQztRQUNoRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQW9CO1FBQ25ELElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFO1lBQzNCLElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFFO1lBQ3pELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUU7UUFDL0MsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQVcsR0FBRztRQUNaLE9BQU8sSUFBSSxDQUFDLFFBQVE7SUFDdEIsQ0FBQztJQUVZLEdBQUcsQ0FBSSxHQUFRLEVBQUUsT0FBbUIsRUFBRSxXQUEwQjs7WUFDM0UsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQTBCO1lBQ2hELElBQUksRUFBRSxRQUFRLEVBQUcsT0FBTyxFQUFFLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztZQUNuRCxRQUFRLENBQUMsR0FBRyxDQUFJLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO1lBRXZDLE9BQU8sT0FBTztRQUNoQixDQUFDO0tBQUE7SUFFTSxPQUFPLENBQUUsY0FBdUI7UUFDckMsTUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDM0QsSUFBSyxDQUFDLFFBQVE7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixjQUFjLEdBQUcsQ0FBQztRQUU3RSxPQUFPLFFBQVE7SUFDakIsQ0FBQztJQUVZLEtBQUssQ0FBSSxVQUFtQixFQUFFLEdBQVEsRUFBRSxXQUEwQjs7WUFDN0UsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7WUFDM0MsT0FBTyxNQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUksR0FBRyxFQUFFLFdBQVcsQ0FBQztRQUNsRCxDQUFDO0tBQUE7SUFFWSxHQUFHLENBQUksR0FBUSxFQUFFLEtBQVEsRUFBRSxXQUE2Qjs7WUFDbkUsSUFBSSxFQUFFLFFBQVEsRUFBRyxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDO1lBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1lBRXRDLE9BQU8sT0FBTztRQUNoQixDQUFDO0tBQUE7SUFFWSxHQUFHLENBQUMsR0FBUSxFQUFFLFdBQTZCOztZQUN0RCxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7WUFDbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztZQUUvQixPQUFPLE9BQU87UUFDaEIsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUFDLEtBQXlCLEVBQUUsT0FBcUIsRUFBRSxhQUErQjs7WUFDbEcsSUFBSyxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUcsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtZQUV6RCxJQUFJLFVBQVUsR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDLGlCQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEQsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsR0FBRyxTQUFTLENBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE9BQXdCLENBQUM7WUFFN0YsSUFBSSxVQUFVO2dCQUNaLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDOztnQkFFNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztZQUVyQyxPQUFPLE9BQU87UUFDaEIsQ0FBQztLQUFBO0lBRU0sZ0JBQWdCLENBQUMsT0FBb0I7UUFDMUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztJQUMvQyxDQUFDO0lBRU0sZUFBZSxDQUFDLE9BQW9CO1FBQ3pDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDO0lBQzlDLENBQUM7SUFFTSxpQkFBaUIsQ0FBQyxPQUFvQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDO0lBQ2hELENBQUM7Q0FFRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzUUQscUZBQW9FO0FBS3BFLE1BQU0scUJBQXFCLEdBQUcsdUJBQXVCO0FBRXJEO0lBTUUsWUFBYSxHQUFZLEVBQUUsWUFBWSxHQUFHLEVBQUU7UUFDMUM7OztVQUdFO1FBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUU7WUFDbEQsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFO1lBQ25CLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRTtTQUMxQixDQUFDO1FBQ0YsTUFBTSxjQUFjLEdBQUcsSUFBSSxzQkFBWSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBRTVELElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxpQkFBTyxDQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsRUFBRSxZQUFZLENBQUU7UUFDdkUsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDO0lBQzFCLENBQUM7SUFFYSx3QkFBd0I7O1lBQ3BDLElBQUk7Z0JBQ0YsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFJLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQXFCLHFCQUFxQixFQUFFLEVBQUUsQ0FBQztnQkFDdkYsT0FBTyxNQUFNO2FBQ2Q7WUFDRCxPQUFNLENBQUMsRUFBRTtnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztvQkFBRSxNQUFNLENBQUM7Z0JBRXhDLElBQUksVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxVQUFVLENBQUM7Z0JBQ3pELE9BQU8sVUFBVSxDQUFDLE1BQU07YUFDekI7UUFDSCxDQUFDO0tBQUE7SUFFWSxJQUFJOztZQUNmLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUU7WUFDcEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDekMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDM0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtRQUM5RCxDQUFDO0tBQUE7SUFFWSxLQUFLOztZQUNoQixNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFO1FBQ3ZCLENBQUM7S0FBQTtJQUVNLGtCQUFrQjtRQUN2QixPQUFPLElBQUksQ0FBQyxlQUFlO0lBQzdCLENBQUM7SUFFTyxrQkFBa0IsQ0FBQyxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLElBQUksS0FBSyxlQUFlO0lBQ25DLENBQUM7SUFFWSxXQUFXLENBQUUsS0FBbUIsRUFBRSxPQUFpQzs7WUFDOUUsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7Z0JBQ3pELE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUM7WUFFdkMsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztZQUMvQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUN2QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRTtnQkFDakQsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRyxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO2FBQUUsQ0FBQztZQUVsRixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQyxNQUFNO1FBQ3JDLENBQUM7S0FBQTtJQUVZLFFBQVEsQ0FBRSxNQUFlOztZQUNwQyxJQUFJO2dCQUNGLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBYyxNQUFNLENBQUM7YUFDbkQ7WUFDRCxPQUFNLENBQUMsRUFBRTtnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztvQkFBRSxNQUFNLENBQUM7YUFDekM7WUFDRCxPQUFPLFNBQVM7UUFDbEIsQ0FBQztLQUFBO0lBRVksaUJBQWlCLENBQUUsU0FBaUIsRUFBRSxTQUFpQjs7WUFDbEUsSUFBSSxHQUFHLEdBQUksSUFBSSxHQUFHLEVBQW9DO1lBQ3RELEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUc7Z0JBQzNDLE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQTJCLENBQUMsQ0FBQztnQkFDckUsT0FBTyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQyxFQUFFLE9BQU8sQ0FBRTthQUNqQztZQUNELE9BQU8sR0FBRztRQUNaLENBQUM7S0FBQTtJQUVZLGVBQWUsQ0FBRSxNQUFlOztZQUMzQyxJQUFJLE1BQU0sS0FBSyxJQUFJLENBQUMsZUFBZTtnQkFDakMsTUFBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsTUFBTSxHQUFHLENBQUM7WUFFMUQsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDdkIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRyxNQUFNLEVBQUU7Z0JBQzdCLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUcscUJBQXFCLEVBQUUsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsRUFBRTthQUFFLENBQUM7WUFDaEYsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUU7WUFFbEMsSUFBSSxDQUFDLGVBQWUsRUFBRztRQUN6QixDQUFDO0tBQUE7SUFFWSxZQUFZLENBQUUsT0FBZ0I7O1lBQ3pDLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQztZQUNwRCxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7S0FBQTtJQUVZLHNCQUFzQixDQUFFLFNBQWlCLEVBQUUsU0FBa0I7O1lBQ3hFLE9BQU8sTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNyQyxPQUFPLElBQUksT0FBTyxDQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO29CQUMvQixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBZTtvQkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBQyxDQUFDO3lCQUMvRCxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBRTt5QkFDdEMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBRTt5QkFDekIsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUU7Z0JBQ2xDLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQXVCO1FBQ2hELENBQUM7S0FBQTtJQUVZLGNBQWMsQ0FBRSxHQUFHLFFBQXdCOztZQUN0RCxJQUFJLEdBQUcsR0FBSSxJQUFJLEtBQUssRUFBZTtZQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRztnQkFDekMsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBRTtnQkFDbEQsS0FBSyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFO2FBQzNCO1lBQ0QsT0FBTyxHQUFHO1FBQ1osQ0FBQztLQUFBO0NBQ0Y7QUExSEQsZ0NBMEhDOzs7Ozs7Ozs7Ozs7Ozs7QUNqSUQsSUFBWSxRQVVYO0FBVkQsV0FBWSxRQUFRO0lBQ2xCLHVDQUFnQjtJQUNoQiwwQ0FBVztJQUNYLDBDQUFXO0lBQ1gsc0NBQVc7SUFDWCx1Q0FBVTtJQUNWLHVDQUFVO0lBQ1YseUNBQVU7SUFDVix5Q0FBVTtJQUNWLHVDQUFVO0FBQ1osQ0FBQyxFQVZXLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBVW5CO0FBcUJEO0lBTUUsSUFBVyxXQUFXLEtBQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFJLENBQUMsRUFBQyxDQUFDO0lBQ3RFLElBQVcsWUFBWSxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztJQUN0RSxJQUFXLFlBQVksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUM7SUFDdEUsSUFBVyxVQUFVLEtBQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFLLENBQUMsRUFBQyxDQUFDO0lBQ3RFLElBQVcsV0FBVyxLQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLEVBQUMsQ0FBQztJQUN0RSxJQUFXLFdBQVcsS0FBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUM7SUFDdEUsSUFBVyxZQUFZLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO0lBRXRFLElBQVcsUUFBUSxLQUFLLE9BQU8sSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDO0lBQzNDLElBQVcsUUFBUSxDQUFFLEtBQWUsSUFBSyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssRUFBQyxDQUFDO0lBRTdELFlBQW1CLFNBQXVCLEVBQUUsYUFBYSxHQUFHLEtBQUssRUFBRSxVQUFrQixFQUFFLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRztRQUN6RyxJQUFJLENBQUMsSUFBSSxHQUFHLFVBQVU7UUFDdEIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWE7SUFDN0IsQ0FBQztJQUVTLGFBQWEsQ0FBRSxHQUFXLEVBQUUsT0FBZTtRQUNuRCxPQUFPLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTtJQUNoRixDQUFDO0lBRU0sSUFBSSxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDeEMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxNQUFNLENBQUU7UUFDNUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDekMsQ0FBQztJQUVNLEtBQUssQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3pDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQzFDLENBQUM7SUFFTSxHQUFHLENBQUUsR0FBVyxFQUFFLEdBQUcsTUFBYTtRQUN2QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLEtBQUssQ0FBRTtRQUMzRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBRTtJQUMxQyxDQUFDO0lBRU0sS0FBSyxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDekMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxPQUFPLENBQUU7UUFDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDMUMsQ0FBQztJQUVNLElBQUksQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3hDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsTUFBTSxDQUFFO1FBQzVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQ3pDLENBQUM7SUFFTSxLQUFLLENBQUUsR0FBVyxFQUFFLEdBQVU7UUFDbkMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxPQUFPLENBQUU7UUFDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ25DLENBQUM7SUFFTSxLQUFLLENBQUUsR0FBVyxFQUFFLEdBQVU7UUFDbkMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxPQUFPLENBQUU7UUFDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQUVEO0lBS1MsTUFBTSxLQUFLLFlBQVksQ0FBRSxLQUFlO1FBQzdDLFVBQVUsQ0FBQyxlQUFlLEdBQUcsS0FBSztJQUNwQyxDQUFDO0lBRU0sTUFBTSxLQUFLLFVBQVUsQ0FBRyxLQUFtQjtRQUNoRCxVQUFVLENBQUMsWUFBWSxHQUFHLEtBQUs7SUFDakMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBbUIsRUFBRSxLQUFpQjtRQUM1RCxPQUFPLFVBQVUsQ0FBQyxDQUFDO1lBQ2pCLElBQUksYUFBYSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxLQUFLLElBQUksVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDbkcsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUM3QixDQUFDOztBQWhCYywwQkFBZSxHQUFHLFFBQVEsQ0FBQyxHQUFHO0FBQzlCLHVCQUFZLEdBQUcsR0FBRyxFQUFFLENBQUUsT0FBMkI7QUFDakQsd0JBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBRSxVQUFVLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLGVBQWUsQ0FBRTtBQUgxSCxnQ0FrQkM7Ozs7Ozs7Ozs7Ozs7OztBQ2pIRCx1REFBK0I7QUFDL0Isd0VBQTZFO0FBSzdFLElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUNwQiwrQkFBbUI7SUFDbkIsK0JBQW1CO0lBQ25CLCtCQUFtQjtJQUNuQiwyQkFBaUI7QUFDbkIsQ0FBQyxFQUxXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBS3JCO0FBdUJEO0lBS0UsWUFBb0IsTUFBYyxFQUFFLEdBQUcsTUFBcUI7UUFDMUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxLQUFLLENBQVMsR0FBRyxNQUFNLENBQUM7SUFDNUMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxPQUFPLENBQUUsR0FBRyxNQUE2QjtRQUNyRCxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxRQUFRLEVBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHLHVDQUF1QyxDQUFFO1FBRWhHLE9BQU8sSUFBSSxLQUFLLENBQWdCLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFFLFlBQVksQ0FBQyx1QkFBdUIsQ0FBRTtJQUN6RixDQUFDO0lBRUQsSUFBVyxHQUFHO1FBQ1osSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQWlCO1FBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUU7UUFDekQsT0FBTyxZQUFZLENBQUMsT0FBTyxDQUFFLEdBQUcsTUFBTSxDQUFFO0lBQzFDLENBQUM7SUFFTSxPQUFPLENBQUUsSUFBWTtRQUMxQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQzFCLENBQUM7O0FBdkJ1QixvQ0FBdUIsR0FBRyxLQUFLO0FBRHpELG9DQXlCQztBQUVEO0lBWUUsWUFBWSxNQUFjLEVBQUUsSUFBWTtRQUN0QyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFHLE1BQU0sQ0FBQztRQUN4QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUk7UUFDaEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxLQUFLLElBQUk7UUFDcEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxLQUFLLElBQUk7UUFDeEMsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUk7UUFDbEMsSUFBSSxDQUFDLFdBQVcsRUFBRTtJQUNwQixDQUFDO0lBRU8sV0FBVyxDQUFFLElBQWdCO1FBQ25DLE9BQU8sSUFBSSxLQUFLLFVBQVUsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RCxRQUFRLENBQUMsQ0FBQztZQUNWLFFBQVE7SUFDWixDQUFDO0lBRU8sV0FBVztRQUNqQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFO1FBQ2hHLElBQUssQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUVuRixJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVE7UUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEdBQUcsRUFBa0I7UUFDOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFFO1FBQ2pHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMxRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEtBQUssSUFBSSxDQUFFLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBRTtJQUM5RixDQUFDO0lBRU0sYUFBYSxDQUFDLE1BQWM7UUFDakMsT0FBTyxJQUFJLENBQUMsYUFBYTtJQUMzQixDQUFDO0lBRUQsSUFBVyxZQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLE1BQU07SUFDcEIsQ0FBQztJQUVELElBQVcsYUFBYTtRQUN0QixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7SUFDckMsQ0FBQztJQUVELElBQVcsVUFBVTtRQUNuQixJQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUM7WUFBRyxNQUFNLEtBQUssQ0FBQyxVQUFVLElBQUksQ0FBQyxTQUFTLCtCQUErQixDQUFDO1FBQ3hHLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxZQUFZO0lBQzFCLENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDbkIsT0FBTyxJQUFJLENBQUMsU0FBUztJQUN2QixDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVU7SUFDeEIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxJQUFJO0lBQ2xCLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSztJQUNuQixDQUFDO0lBRUQsSUFBVyxVQUFVO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVE7SUFDdEIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNO0lBQ3BCLENBQUM7SUFFTSxNQUFNLENBQVcsTUFBZSxFQUFFLEdBQWM7UUFDckQsSUFBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUc7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxHQUFHO1NBQzlCO2FBQ0k7WUFDSCxNQUFNLEVBQUUsR0FBRyxHQUFtQjtZQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFFO1NBQ3pEO1FBQ0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVNLE1BQU0sQ0FBVSxNQUFnQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLFlBQVksQ0FBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ25ELENBQUM7SUFFTSxTQUFTLENBQVksS0FBK0IsRUFBRSxHQUFlO1FBQzFFLElBQUksTUFBTSxHQUFHLGVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEVBQWMsQ0FBQyxDQUFDO1lBQ2hCLElBQU0sS0FBK0IsRUFBRTtRQUV6QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBRTtJQUNuQyxDQUFDO0lBRU0sY0FBYyxDQUFXLElBQWEsRUFBRSxHQUFhLEVBQUUsVUFBVSxHQUFHLEtBQUs7UUFDOUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDMUIsSUFBSyxDQUFFLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2dCQUFHLE9BQU07WUFDNUQsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUVGO0FBbkhELGtDQW1IQzs7Ozs7Ozs7Ozs7Ozs7O0FDaExELHNFQUFrRDtBQUNsRCx5RUFBMkQ7QUFDM0QsdURBQXlDO0FBRXpDLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsMEJBQVUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQy9ELE1BQU0sVUFBVSxHQUFHLG1CQUFPLENBQUMsZ0NBQWEsQ0FBQztBQUU1QiwyQkFBbUIsR0FBRyxPQUFPO0FBRTFDLDhDQUE4QztBQUM5QyxJQUFZLE9BT1g7QUFQRCxXQUFZLE9BQU87SUFDakIseUNBQVU7SUFDVix5Q0FBVTtJQUNWLHlDQUFVO0lBQ1YseUNBQVU7SUFDVix5Q0FBVTtJQUNWLHVDQUFVO0FBQ1osQ0FBQyxFQVBXLE9BQU8sR0FBUCxlQUFPLEtBQVAsZUFBTyxRQU9sQjtBQTRERDtJQUVVLFlBQVksQ0FBQyxTQUFpQjtRQUNwQyxPQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRztJQUM5QyxDQUFDO0lBRU8sc0JBQXNCLENBQUUsTUFBbUIsRUFBRSxHQUFjO1FBQ2pFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBRyxFQUFFLEVBQUcsR0FBRyxDQUFFO0lBQ25DLENBQUM7SUFFTSxXQUFXLENBQUUsTUFBbUI7UUFDckMsSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQVU7UUFDOUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsRUFBRSxpQkFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRiwyQ0FBMkM7UUFDM0MsSUFBSyxNQUFNLENBQUMsYUFBYSxFQUFHO1lBQzFCLFlBQVksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUU7U0FDL0Q7UUFDRCxZQUFZLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUM1QixJQUFJLEVBQUUsV0FBVztZQUNqQixJQUFJLEVBQUUsa0JBQVUsQ0FBQyxNQUFNO1lBQ3ZCLE9BQU8sRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUVGLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUUxQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDckQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFDLEVBQUU7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUN0QixJQUFJLEVBQUUsT0FBTztnQkFDYixLQUFLLEVBQUUsU0FBUztnQkFDaEIsSUFBSSxFQUFFLFNBQVMsR0FBRyxHQUFHLEdBQUcsS0FBSztnQkFDN0IsT0FBTyxFQUFFLEtBQUs7YUFDZixDQUFDLENBQUMsS0FBSyxDQUFDO1FBQ1gsQ0FBQyxDQUFDO1FBRUYsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFFLDJCQUFtQixDQUFFO0lBQ3pDLENBQUM7SUFFTSxXQUFXLENBQUMsTUFBbUIsRUFBRSxXQUF3QjtRQUM5RCxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2pDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUN0QyxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7WUFDMUMsTUFBTSxFQUFFLFdBQVc7U0FDcEIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLFdBQVcsQ0FBQyxNQUFtQixFQUFFLEdBQWM7UUFDcEQsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNqQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDckMsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQzFDLFNBQVMsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUNwRCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sV0FBVyxDQUFDLE1BQW1CLEVBQUUsR0FBYyxFQUFFLFdBQXdCLEVBQUUsT0FBZTtRQUMvRix1REFBdUQ7UUFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRXJELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1FBQ3hELFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxPQUFPO1FBRWhDLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDakMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3JDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLFNBQVM7WUFDaEIsUUFBUSxFQUFFLFdBQVc7WUFDckIsU0FBUyxFQUFFLFNBQVM7U0FDckIsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELDZFQUE2RTtJQUM3RSxlQUFlO0lBQ2Ysb0NBQW9DO0lBQ3BDLGtDQUFrQztJQUNsQywyQkFBMkI7SUFDM0IsZUFBZTtJQUNmLHNDQUFzQztJQUN0QyxRQUFRO0lBQ1IsMkNBQTJDO0lBQzNDLDRCQUE0QjtJQUM1QixpQ0FBaUM7SUFDakMsbUNBQW1DO0lBQ25DLGlCQUFpQjtJQUNqQiw4Q0FBOEM7SUFDOUMsVUFBVTtJQUNWLHVCQUF1QjtJQUN2QixRQUFRO0lBQ1IsTUFBTTtJQUNOLGdCQUFnQjtJQUNoQixJQUFJO0lBRUosK0VBQStFO0lBQy9FLGlDQUFpQztJQUNqQyxvQ0FBb0M7SUFDcEMsb0NBQW9DO0lBQ3BDLGlDQUFpQztJQUNqQyxzQ0FBc0M7SUFDdEMsOERBQThEO0lBQzlELGlDQUFpQztJQUNqQyxVQUFVO0lBQ1YsUUFBUTtJQUNSLGdEQUFnRDtJQUNoRCwrQ0FBK0M7SUFDL0MsaUNBQWlDO0lBQ2pDLHNEQUFzRDtJQUN0RCw0QkFBNEI7SUFDNUIsUUFBUTtJQUNSLE1BQU07SUFDTiw0Q0FBNEM7SUFDNUMsSUFBSTtJQUVHLFdBQVcsQ0FBQyxNQUFtQixFQUFFLGNBQTBDLEVBQUUsS0FBcUIsRUFDdkcsV0FBNkIsRUFBRSxJQUFnQixFQUFFLElBQWtCO1FBRW5FLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUVyRCxJQUFJLFlBQXlCO1FBQzdCLElBQUssQ0FBQyxjQUFPLENBQUUsY0FBYyxDQUFFLEVBQUc7WUFDaEMsSUFBSSxNQUFNLEdBQUcsY0FBNEI7WUFDekMsWUFBWSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsRUFBRSxNQUFNLENBQUU7U0FDN0U7YUFDSTtZQUNILElBQUksTUFBTSxHQUFHLGNBQWMsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUU7WUFDaEcsSUFBSSxFQUFFLEdBQW9CLGVBQVEsQ0FBRSxXQUFXLENBQUUsQ0FBQyxDQUFDLENBQUUsRUFBRSxLQUFLLEVBQUcsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsSUFBSSxFQUFHO1lBQ2pHLElBQUksS0FBSyxHQUFHLElBQUksSUFBSSxFQUFFO1lBQ3RCLEtBQU0sSUFBSSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBSTtnQkFDekMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUUsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUU7YUFDeEY7WUFFRCxZQUFZLEdBQUc7Z0JBQ2IsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLFNBQVM7Z0JBQ2hCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUs7Z0JBQ2YsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNO2dCQUNqQixJQUFJLEVBQUUsS0FBSztnQkFDWCxJQUFJLEVBQUUsSUFBSTthQUNYO1NBQ0Y7UUFDRCxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2pDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0Y7QUFuSkQsd0NBbUpDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2hPRCxtR0FBK0M7QUFDL0MsMEZBQW1GO0FBSW5GO0lBR0UsWUFBWSxVQUF3QjtRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVU7SUFDOUIsQ0FBQztJQUVZLE1BQU07O1lBQ2pCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1FBQ3pDLENBQUM7S0FBQTtJQUVZLFFBQVE7O1lBQ25CLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQzNDLENBQUM7S0FBQTtDQUNGO0FBRUQ7SUFJRSxZQUFhLE9BQTJCO1FBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksNkJBQWEsRUFBRTtJQUNuQyxDQUFDO0lBRUQsSUFBVyxpQkFBaUI7UUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTztJQUNyQixDQUFDO0lBRUQsSUFBVyxXQUFXO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXO0lBQ2hDLENBQUM7SUFFWSxPQUFPOztZQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFFO1FBQ3JELENBQUM7S0FBQTtJQUVZLFVBQVU7O1lBQ3JCLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtRQUN0QyxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQUMsR0FBVyxFQUFFLFVBQTBCOztZQUN4RCxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztRQUNyRCxDQUFDO0tBQUE7SUFFTSxTQUFTLENBQUMsR0FBVyxFQUFFLFVBQTBCO1FBQ3RELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztJQUMzQyxDQUFDO0lBRU8scUJBQXFCLENBQUUsTUFBd0I7UUFDckQsSUFBSyxNQUFNLENBQUMsWUFBWSxLQUFLLENBQUM7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixDQUFDO0lBQ3ZFLENBQUM7SUFFTSxnQkFBZ0IsQ0FBRSxJQUE4QjtRQUNyRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFFLElBQUksSUFBSSxFQUFFLEVBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0lBQzNFLENBQUM7SUFFWSxZQUFZLENBQUUsSUFBOEI7O1lBQ3ZELE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFFLElBQUksSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixDQUFFO1FBQ3RGLENBQUM7S0FBQTtJQUVNLFdBQVcsQ0FBQyxHQUFXLEVBQUUsVUFBMEIsRUFBRSxzQkFBK0IsS0FBSztRQUM5RixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDO1FBQ25ELG1CQUFtQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBRSxNQUFNLENBQUU7UUFFM0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVZLE9BQU8sQ0FBQyxHQUFXLEVBQUUsVUFBMEIsRUFBRSxzQkFBK0IsS0FBSzs7WUFDaEcsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBRSxHQUFHLEVBQUUsVUFBVSxDQUFFO1lBQy9ELG1CQUFtQixJQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBRSxNQUFNLENBQUU7WUFFM0QsT0FBTyxNQUFNO1FBQ2YsQ0FBQztLQUFBO0lBRVksU0FBUyxDQUFDLEdBQVc7O1lBQ2hDLEdBQUcsQ0FBQyxLQUFLLENBQUUsZ0NBQW1CLENBQUUsQ0FBQyxPQUFPLENBQ3RDLENBQU0sR0FBRyxJQUFFLGdEQUFDLGNBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEtBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxLQUN0RTtRQUNILENBQUM7S0FBQTtJQUVZLFVBQVU7O1lBQ3JCLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztZQUN2QyxPQUFPLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQ3BDLENBQUM7S0FBQTtDQUNGO0FBckVELDRDQXFFQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxRkQsdURBQWdDO0FBR2hDLGdFQUEyQztBQUczQyw2RUFBMEM7QUFFMUM7SUFJRTtRQUNFLElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQVUsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQztJQUNyRCxDQUFDO0lBRU0sSUFBSSxDQUFDLFVBQWtCLEVBQUUsUUFBNEI7UUFDMUQsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLE1BQU0sRUFBRyxJQUFJLEVBQUU7UUFDdkMsSUFBSTtZQUNGLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLHVCQUF1QixVQUFVLElBQUksQ0FBRTtTQUNqRjtRQUNELE9BQU0sR0FBRyxFQUFFO1lBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUcsS0FBSyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLHFCQUFxQixVQUFVLElBQUksRUFBRSxHQUFHLENBQUU7WUFDbEYsSUFBSyxDQUFDLFFBQVE7Z0JBQUcsTUFBTSxHQUFHO1NBQzNCO1FBRUQsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDekMsT0FBTyxHQUFHLENBQUMsTUFBTTtJQUNuQixDQUFDO0lBRUQsSUFBVyxXQUFXLEtBQWUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBQyxDQUFDO0lBRTdDLFFBQVEsQ0FBQyxVQUFrQjs7WUFDdEMsT0FBTyxnQkFBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQztRQUNwRCxDQUFDO0tBQUE7SUFFTSxLQUFLLENBQUMsUUFBNEI7UUFDdkMsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLE1BQU0sRUFBRyxJQUFJLEVBQUU7UUFDdkMsSUFBSTtZQUNGLElBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFHO2dCQUNqQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxlQUFlLENBQUU7YUFDM0Q7aUJBQ0k7Z0JBQ0gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7YUFDeEQ7U0FDRjtRQUNELE9BQU0sR0FBRyxFQUFFO1lBQ1QsR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUcsS0FBSyxFQUFFO1lBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLGFBQWEsRUFBRSxHQUFHLENBQUU7WUFDNUQsSUFBSyxDQUFDLFFBQVE7Z0JBQUcsTUFBTSxHQUFHO1NBQzNCO1FBRUQsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDekMsT0FBTyxHQUFHLENBQUMsTUFBTTtJQUNuQixDQUFDO0lBRU0sU0FBUztRQUNkLE9BQU8sZ0JBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQUN6QyxDQUFDO0lBRU0sT0FBTyxDQUFDLEdBQVcsRUFBRSxVQUEwQixFQUFFLFFBQXFDO1FBQzNGLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsRUFBRSxlQUFlLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUM1RSxJQUFJO1lBQ0YsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsSUFBSSxFQUFFLENBQUM7WUFDNUQsR0FBRyxDQUFDLE1BQU0sR0FBRztnQkFDWCxlQUFlLEVBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RELFlBQVksRUFBRSxTQUFTLENBQUMsT0FBTzthQUNoQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHlCQUF5QixHQUFHLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDcko7UUFDRCxPQUFNLEdBQUcsRUFBRTtZQUNULEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRztZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFFLHVCQUF1QixHQUFHLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBRTtZQUNqSCxJQUFLLENBQUMsUUFBUTtnQkFBRyxNQUFNLEdBQUc7U0FDM0I7UUFFRCxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUN6QyxPQUFPLEdBQUcsQ0FBQyxNQUFNO0lBQ25CLENBQUM7SUFFTSxLQUFLLENBQUMsR0FBWSxFQUFFLFVBQTBCLEVBQUUsUUFBK0I7UUFDcEYsSUFBSSxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUcsSUFBSSxFQUFFLE1BQU0sRUFBRyxJQUFJLEtBQUssRUFBTyxFQUFFO1FBQ25ELElBQUk7WUFDRixHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixHQUFHLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDako7UUFDRCxPQUFNLEdBQUcsRUFBRTtZQUNULEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRztZQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHFCQUFxQixHQUFHLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBRTtZQUM5RyxJQUFLLENBQUMsUUFBUTtnQkFBRyxNQUFNLEdBQUc7U0FDM0I7UUFFRCxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUN6QyxPQUFPLEdBQUcsQ0FBQyxNQUFNO0lBQ25CLENBQUM7SUFFTSxZQUFZLENBQUUsSUFBOEIsRUFBRSxVQUFvRSxFQUFFLFFBQTRDO1FBQ3JLLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsSUFBSSxLQUFLLEVBQW9CLEVBQUU7UUFDaEUsSUFBSSxHQUFrQztRQUN0QyxJQUFJO1lBQ0YsSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRTtnQkFDaEIsR0FBRyxHQUFHLENBQUM7Z0JBQ1AsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUU7Z0JBQ25ELFVBQVUsSUFBSSxVQUFVLENBQUUsT0FBTyxFQUFFLENBQUMsQ0FBRTtnQkFDdEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsT0FBTyxDQUFFO1lBQzVCLENBQUMsQ0FBQztTQUNIO1FBQ0QsT0FBTyxHQUFHLEVBQUc7WUFDWCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUc7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsR0FBSSxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBRTtZQUNsSSxJQUFLLENBQUMsUUFBUTtnQkFBRyxNQUFNLEdBQUc7U0FDM0I7UUFFRCxRQUFRLElBQUksUUFBUSxDQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBRTtRQUMzQyxPQUFPLEdBQUcsQ0FBQyxNQUFNO0lBQ25CLENBQUM7SUFFWSxXQUFXLENBQUMsR0FBRyxFQUFFLFVBQTBCOztZQUN0RCxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQztRQUM1RCxDQUFDO0tBQUE7SUFFWSxTQUFTLENBQUMsR0FBWSxFQUFFLFVBQTBCOztZQUM3RCxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQztRQUMxRCxDQUFDO0tBQUE7SUFFTSxpQkFBaUIsQ0FBRSxJQUE4QixFQUFFLFVBQW9FO1FBQzVILE9BQU8sZ0JBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFFO0lBQ3BFLENBQUM7Q0FFRjtBQTVIRCxzQ0E0SEM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcElELDZEQUFxQztBQUNyQyx1REFBK0I7QUFDL0Isd0VBQXlFO0FBQ3pFLG9GQUF5QztBQUN6QyxpRkFBdUM7QUFFdkMsa0hBQTJEO0FBRzNELCtEQUEwQztBQUMxQyxpSEFBd0Q7QUFJeEQsb0ZBQXlDO0FBK0J6Qzs7OztHQUlHO0FBQ0gsYUFBcUIsU0FBUSxxQkFBWTtJQVd2Qzs7Ozs7O09BTUc7SUFDSCxZQUFvQixNQUFjLEVBQUUsYUFBcUIsRUFBRSxPQUF5QjtRQUNsRixxQkFBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1RCxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUUxRSxLQUFLLEVBQUU7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFJO1lBQ2QsZ0JBQWdCLEVBQUcsRUFBRTtZQUNyQixrQkFBa0IsRUFBRyxFQUFFO1lBQ3ZCLHlCQUF5QixFQUFHLEtBQUs7WUFDakMsa0JBQWtCLEVBQUcsRUFBRSxPQUFPLEVBQUcsSUFBSSxFQUFFO1NBQ3hDLElBQUksT0FBTztRQUVaLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXVCO1FBQzdDLElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM3QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksdUJBQVUsQ0FBQyxhQUFhLENBQUM7UUFDNUMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHVCQUFVLENBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBaUIsQ0FBRTtRQUNwRSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksbUNBQWdCLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDM0QsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHFCQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQztRQUM1RixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDO0lBQzlGLENBQUM7SUFFTyxTQUFTLENBQVcsS0FBZ0MsRUFBRyxnQkFBZ0IsR0FBRyxLQUFLLEVBQUUsZUFBZSxHQUFHLEtBQUs7UUFDOUcsTUFBTSxTQUFTLEdBQUcsZUFBUSxDQUFFLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFHLEtBQStCLENBQUMsSUFBSTtRQUU1RixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUM7UUFDeEMsZ0JBQWdCLElBQUkscUJBQUcsQ0FBQyxNQUFNLENBQUUsTUFBTSxLQUFLLFNBQVMsRUFBRSx1QkFBd0IsU0FBVSxHQUFHLENBQUM7UUFDNUYsZUFBZSxJQUFJLHFCQUFHLENBQUMsTUFBTSxDQUFFLENBQUMsTUFBTyxDQUFDLFVBQVUsRUFBRSxVQUFXLFNBQVUsZUFBZSxDQUFDO1FBRXpGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFTyxVQUFVLENBQVcsTUFBb0I7UUFDL0MsT0FBTyxNQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWTtJQUNoRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ1UsSUFBSSxDQUFDLE9BQTRCOztZQUM1QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbEQsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRTtZQUMvQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBRXpCLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBTSxNQUFNLEVBQUMsRUFBRTtnQkFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUU7Z0JBQzVDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUUsTUFBTSxDQUFFO2dCQUV2QyxNQUFNLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDO2dCQUNwQyxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUVoQyxJQUFLLE1BQU0sQ0FBQyxTQUFTO29CQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBRTtZQUN6RSxDQUFDLEVBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxJQUFJLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBRTtRQUM1QixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNVLEtBQUs7O1lBQ2hCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtZQUMvQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBRTFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBRTtRQUM1QixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNILElBQVcsZUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUU7SUFDMUMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBVyxXQUFXO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUUsS0FBWTtRQUM3QixnQ0FBZ0M7UUFDaEMscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDVSxXQUFXOztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQztZQUVoRSxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFFO1lBQ3hELFdBQVcsQ0FBQyxZQUFZLEdBQUcsU0FBUztZQUNwQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFFO1lBRTdFLElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBRTtnQkFDL0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFtQixDQUFFO2dCQUNuRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFFO2dCQUMxQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUk7Z0JBRXhCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHdCQUF3QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3JGLE9BQU8sSUFBSSxDQUFDLGVBQWU7YUFDNUI7WUFDRCxPQUFPLEdBQUcsRUFBRztnQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDdEcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQztnQkFDNUQsTUFBTSxHQUFHO2FBQ1Y7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVSxhQUFhLENBQUUsTUFBZTs7WUFDekMscUJBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZSxFQUM5RCw2Q0FBNkMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXRFLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsZUFBZTtZQUNsRCxNQUFNLElBQUksR0FBRyxXQUFXO1lBQ3hCLElBQUk7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUM7Z0JBQzdDLElBQUssSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUcsRUFBRSwwRUFBMEU7b0JBQ2hHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUUsQ0FBQztpQkFDM0Y7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBRSxXQUFXLENBQUU7Z0JBQ3RELE9BQU8sSUFBSSxDQUFDLGVBQWUsSUFBSSxXQUFXLEVBQUc7b0JBQzNDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBRTtvQkFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFFO2lCQUNyRTtnQkFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUk7Z0JBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixJQUFJLE9BQU8sSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO2FBQ25HO1lBQ0QsT0FBTyxHQUFHLEVBQUc7Z0JBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsbUNBQW1DLElBQUksT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLEVBQUUsR0FBRyxDQUFDO2dCQUNuSCxNQUFNLEdBQUc7YUFDVjtRQUNILENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLGdCQUFnQjs7WUFDM0IsSUFBSSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRTtZQUNsRCxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFFLE1BQU0sQ0FBRTtZQUM5QyxPQUFPLE1BQU07UUFDZixDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVSxvQkFBb0IsQ0FBQyxNQUFjOztZQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSw2QkFBNkIsQ0FBQztZQUVqRSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztZQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUM5QyxDQUFDO0tBQUE7SUFFRDs7Ozs7T0FLRztJQUNJLE1BQU0sQ0FBVyxLQUErQixFQUFFLE1BQWU7UUFDdEUscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBRTtRQUVsRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLEVBQUcsSUFBSSxDQUFFO1FBQ2pELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtJQUN6RCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFXLEtBQWdDLEVBQUUsR0FBYyxFQUFFLE1BQWdCO1FBQ3hGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFHLElBQUksQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDO0lBQzVELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsdUZBQXVGO0lBQ3ZGLG9EQUFvRDtJQUNwRCxnR0FBZ0c7SUFFaEcscURBQXFEO0lBQ3JELDRDQUE0QztJQUM1QyxJQUFJO0lBRUo7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBVyxLQUFnQyxFQUFFLE1BQWU7UUFDdkUscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUkseUJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsMEJBQTBCLENBQUU7UUFFNUYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBRTtRQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7O09BSUc7SUFDVSxHQUFHLENBQVcsS0FBZ0MsRUFBRSxHQUFjOztZQUN6RSxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMscUJBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ1UsS0FBSyxDQUFXLEtBQWdDLEVBQUUsU0FBdUI7O1lBQ3BGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztZQUNyRSxJQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsTUFBTyxDQUFDLFNBQVMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUV4SCxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUFBO0lBRUM7Ozs7O0tBS0M7SUFDVSxPQUFPLENBQVcsS0FBZ0MsRUFBRSxTQUF1QixFQUFFLEtBQUssR0FBRyxLQUFLOztZQUNyRyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztRQUN6RSxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ0ksU0FBUyxDQUFXLEtBQWdDLEVBQUUsR0FBYztRQUN6RSxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUMscUJBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDeEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxZQUFZLENBQVcsS0FBZ0MsRUFBRSxNQUFpQyxFQUFHLEtBQUssR0FBRyxLQUFLO1FBQy9HLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUU5QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7UUFDMUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLFlBQVksQ0FBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBRTtJQUN0RSxDQUFDO0lBR0Q7Ozs7Ozs7OztPQVNHO0lBQ1UsSUFBSSxDQUFXLEtBQWdDLEVBQUUsU0FBd0IsRUFBRSxXQUE2QixFQUNuSCxJQUFnQixFQUFFLE1BQXVCLEVBQUUsSUFBa0I7O1lBQzdELHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7WUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDO1FBQ2hHLENBQUM7S0FBQTtJQUdEOzs7O09BSUc7SUFDVSxPQUFPLENBQVcsS0FBZ0MsRUFBRSxNQUFtQjs7WUFDbEYsSUFBSSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUU7WUFDL0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLElBQUssS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxNQUFPLENBQUMsU0FBUyxpQkFBaUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBRWxILE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQUE7SUFFQzs7OztLQUlDO0lBQ1UsT0FBTyxDQUFXLEtBQWdDLEVBQUUsTUFBbUI7O1lBQ2xGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7WUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsV0FBVyxDQUFFLEtBQUssRUFBRSxNQUFNLENBQUU7UUFDcEUsQ0FBQztLQUFBO0lBR0Q7Ozs7T0FJRztJQUNVLE1BQU0sQ0FBVSxLQUErQixFQUFFLFNBQXdCOztZQUNwRixxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO1FBQ2hFLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxLQUFLLENBQVUsS0FBK0IsRUFBRSxTQUF3Qjs7WUFDbkYscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFZSxrQkFBa0IsQ0FBRSxNQUEyQixFQUFHLGVBQWtEOztZQUNsSCxJQUFJLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBOEI7WUFDdEQsSUFBSSxZQUFZLEdBQUcsTUFBTSxlQUFlLEVBQUU7WUFFMUMsWUFBWSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBRTtvQkFBRSxVQUFVLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLEVBQWUsQ0FBRTtnQkFDdkYsVUFBVSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsT0FBTyxDQUFHLENBQUMsSUFBSSxDQUFFLENBQUMsQ0FBRTtZQUN4QyxDQUFDLENBQUU7WUFFSCxNQUFNLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFO1lBQ2hFLE9BQU8sTUFBc0I7UUFDL0IsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1UsZ0JBQWdCLENBQUUsTUFBZSxFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQ3RFLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLEdBQUcsQ0FBQyxFQUFHLDZCQUE2QixDQUFDO1lBRWxFLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQztZQUMvQyxJQUFLLFdBQVc7Z0JBQUcsT0FBTyxXQUFXO1lBRXJDLElBQUksV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUUsTUFBTSxDQUFFO1lBQ3ZELElBQUssQ0FBQyxnQkFBZ0IsSUFBSSxXQUFXLEtBQUssU0FBUztnQkFBSSxPQUFPLFdBQVc7WUFFekUsT0FBTyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxDQUFDLFdBQVksQ0FBQyxFQUFHLEdBQVMsRUFBRSxnREFDaEUsYUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBYyxhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUcsV0FBWSxDQUFDLEVBQUcsRUFBRSxDQUFDLEtBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEcsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1UsWUFBWSxDQUFFLE9BQWdCLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSzs7WUFDbkUscUJBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFOUQsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUUsT0FBTyxDQUFFO1lBQ3RELElBQUssV0FBVztnQkFBRyxPQUFPLFdBQVc7WUFFckMsSUFBSSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBRSxPQUFPLENBQUU7WUFDNUQsSUFBSyxDQUFDLGdCQUFnQixJQUFJLFdBQVcsS0FBSyxTQUFTO2dCQUFJLE9BQU8sV0FBVztZQUV6RSxPQUFPLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFFLENBQUMsV0FBWSxDQUFDLEVBQUcsR0FBUyxFQUFFLGdEQUNoRSxhQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFjLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRyxXQUFZLENBQUMsRUFBRyxFQUFFLENBQUMsS0FBRSxDQUFDLENBQUMsQ0FBQztRQUNsRyxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ1Usc0JBQXNCLENBQUUsU0FBa0IsRUFBRSxTQUFrQixFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQ25HLHFCQUFHLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLFNBQVMsR0FBRyxDQUFDLElBQUksU0FBUyxJQUFJLFNBQVMsRUFBRSxtQ0FBbUMsQ0FBQztZQUVsSCxJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBRTtZQUNwRixJQUFLLENBQUMsZ0JBQWdCO2dCQUFHLE9BQU8sWUFBNEI7WUFFNUQsT0FBTyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxZQUFZLEVBQUcsR0FBUyxFQUFFLGdEQUM5RCxhQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFjLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRyxFQUFFLEdBQUcsRUFBRyxZQUFZLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxLQUFFO1FBQ3ZILENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLGNBQWMsQ0FBRSxRQUF3QixFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQzdFLHFCQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBRTtZQUV0RCxJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQ2pFLElBQUssQ0FBQyxnQkFBZ0I7Z0JBQUcsT0FBTyxZQUE0QjtZQUU1RCxPQUFPLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFFLFlBQVksRUFBRyxHQUFTLEVBQUUsZ0RBQzlELGFBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQWMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFHLEVBQUUsR0FBRyxFQUFHLFlBQVksQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFFLEVBQUUsRUFBRSxDQUFDLEtBQUU7UUFDdkgsQ0FBQztLQUFBO0NBQ0Y7QUF6Y0QsMEJBeWNDOzs7Ozs7Ozs7Ozs7Ozs7QUN2ZkQ7Ozs7Ozs7Ozs7R0FVRztBQUVILElBQVksV0FPWDtBQVBELFdBQVksV0FBVztJQUNyQix3REFBZTtJQUNmLHlEQUFjO0lBRWQsMkNBQWM7SUFDZCxxREFBYztJQUNkLG1EQUFjO0FBQ2hCLENBQUMsRUFQVyxXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQU90QjtBQUVELElBQVksZ0JBSVg7QUFKRCxXQUFZLGdCQUFnQjtJQUMxQixxREFBYTtJQUNiLDJEQUFhO0lBQ2IsMkRBQWE7QUFDZixDQUFDLEVBSlcsZ0JBQWdCLEdBQWhCLHdCQUFnQixLQUFoQix3QkFBZ0IsUUFJM0I7QUE0QkQ7SUFHRSxZQUFZLE9BQXNCO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFjO1FBQ3JDLE9BQU8sTUFBTSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsSUFBSSxNQUFNLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQztJQUNsRixDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFjO1FBQ3BDLE9BQU8sV0FBVyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDdkMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBVSxNQUFjO1FBQ3BELElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsd0JBQXdCLENBQUM7UUFFN0UsT0FBTyxNQUEwQjtJQUNuQyxDQUFDO0lBRU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUF3QjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFO1FBQ2YsS0FBSyxJQUFJLENBQUMsSUFBSSxPQUFPLEVBQUc7WUFDdEIsSUFBSyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO2dCQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFxQjtRQUNsRCxPQUFPLFlBQVksSUFBSSxDQUFDLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVTLHNCQUFzQixDQUFVLE1BQWUsRUFBRSxNQUFtQixFQUFFLEtBQWtCO1FBQ2hHLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUNuQixTQUFTLEVBQVEsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUM7WUFDekMsWUFBWSxFQUFLLEtBQUs7WUFDdEIsU0FBUyxFQUFRLEtBQUs7WUFDdEIsVUFBVSxFQUFPLE1BQU07WUFDdkIsV0FBVyxFQUFNLElBQUksQ0FBQyxPQUFPO1lBQzdCLFlBQVksRUFBSyxJQUFJO1lBQ3JCLGNBQWMsRUFBRyxJQUFJO1NBQ3RCLEVBQUUsTUFBTSxDQUFDO0lBQ1osQ0FBQztJQUVTLGFBQWEsQ0FBQyxNQUFjLEVBQUUsWUFBeUIsRUFBRSxLQUFVLEVBQUUsUUFBYTtRQUMxRixNQUFNLEdBQUcsR0FBRyxNQUF5QjtRQUNyQyxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFO1FBRXBDLElBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFLLEtBQUssS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUc7WUFDakcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUs7WUFDNUIsT0FBTyxJQUFJO1NBQ1o7UUFFRCxJQUFLLEdBQUcsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUc7WUFDdEYsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztTQUN6RDtRQUVELElBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUc7WUFDL0IsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLEdBQUcsQ0FBQztTQUMvRTtRQUVELElBQUssR0FBRyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRztZQUNqRCxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDO1NBQ3pEO1FBRUQsSUFBSyxHQUFHLENBQUMsWUFBWSxFQUFHO1lBQ3BCLEdBQUcsQ0FBQyxXQUFvQyxDQUFDLE1BQU0sQ0FBRSxRQUF3QixDQUFFO1lBQzdFLEdBQUcsQ0FBQyxZQUFZLEdBQUcsS0FBSztTQUN6QjtRQUVELElBQUssR0FBRyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsVUFBVSxFQUFHO1lBQzlDLEdBQUcsQ0FBQyxTQUFTLEVBQUc7WUFDaEIsR0FBRyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUTtZQUNwQyxHQUFHLENBQUMsY0FBYyxHQUFHO2dCQUNuQixJQUFJLEVBQUcsZ0JBQWdCLENBQUMsTUFBTTtnQkFDOUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO2dCQUN4QixpQkFBaUIsRUFBRyxJQUFJLEtBQUssQ0FBaUI7b0JBQzVDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUztpQkFDdkUsQ0FBQzthQUNIO1NBQ0Y7UUFFRCxJQUFLLEdBQUcsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLFFBQVEsRUFBRztZQUM1QyxHQUFHLENBQUMsY0FBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDaEc7UUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSztRQUM1QixPQUFPLElBQUk7SUFDYixDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBRSxNQUFjO1FBQ25DLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTO1FBQzVELE9BQU8sQ0FBRSxDQUFFLEtBQUssS0FBSyxXQUFXLENBQUMsVUFBVSxJQUFJLEtBQUssS0FBSyxXQUFXLENBQUMsU0FBUyxDQUFFO0lBQ2pGLENBQUM7SUFFRjs7OztPQUlHO0lBQ0ksUUFBUSxDQUFXLE1BQWUsRUFBRSxNQUFtQjtRQUM1RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRyxXQUFXLENBQUMsR0FBRyxDQUFFO1FBQzlFLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBcUI7SUFDOUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxlQUFlLENBQVcsTUFBYyxFQUFFLE1BQW1CO1FBQ2xFLElBQUksUUFBUSxHQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUU7UUFDcEYsT0FBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFxQjtJQUM5RSxDQUFDO0NBQ0Y7QUFuSEQsa0NBbUhDOzs7Ozs7Ozs7Ozs7Ozs7QUM1S0QsZ0VBQTJDO0FBRzNDLHlFQUE2RTtBQUM3RSxvR0FBa0g7QUEyQ2xIO0lBV0UsWUFBbUIsS0FBa0I7UUFDbkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBVSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHlCQUFXLENBQUMsSUFBSSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztRQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUEyQztRQUNqRSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxHQUFHLEVBQTZCO1FBRS9ELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFUyxnQkFBZ0IsQ0FBRSxNQUFtQixFQUFFLE1BQWM7UUFDN0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUssSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7WUFDNUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsTUFBTSxDQUFDLFNBQVMsUUFBUSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7SUFDaEcsQ0FBQztJQUVTLGVBQWUsQ0FBQyxNQUFtQixFQUFFLEdBQWM7UUFDM0QsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUcsR0FBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDaEYsT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTLEdBQUcsb0JBQW9CLENBQUMsb0JBQW9CLEtBQUssU0FBUyxFQUFFO0lBQ3hGLENBQUM7SUFFTSxnQkFBZ0IsQ0FBRSxXQUF5QjtRQUNoRCxNQUFNLEtBQUssR0FBSSxXQUFXLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLG9CQUFvQixDQUFDO1FBQzNFLE9BQU8sRUFBRSxLQUFLLEVBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDNUMsQ0FBQztJQUVTLG1CQUFtQixDQUFFLGNBQXNCLEVBQUUsaUJBQWlCLEdBQUcsS0FBSztRQUM5RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksaUJBQWlCO1lBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUV6RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBRTtJQUMxQyxDQUFDO0lBRVMsY0FBYyxDQUFFLEVBQWdCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFUyxXQUFXLENBQVcsRUFBb0IsRUFBRSxPQUFzQixFQUFFLGNBQXNCO1FBQ2xHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSxhQUFhLENBQUUsT0FBOEM7UUFDbEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0NBQXNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFFbEgsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNwQyxJQUFJLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBOEI7WUFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBUSxDQUFFLENBQUM7WUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBRTtRQUN4QyxDQUFDLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1lBQ3hCLElBQUksVUFBVSxHQUFHLElBQUksS0FBSyxFQUFVO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFFO1lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7U0FDOUU7SUFDSCxDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtJQUMzRCxDQUFDO0lBRU0sTUFBTSxDQUFFLEVBQWdCO1FBQzdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVNLGNBQWMsQ0FBRSxFQUFnQjtRQUNyQyxJQUFJLENBQUMseUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQUUsT0FBTyxTQUFTO1FBQzlDLFFBQU8sRUFBRSxDQUFDLFNBQVMsRUFBRTtZQUNuQixLQUFLLHlCQUFXLENBQUMsR0FBRztnQkFDbEIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO1lBQzlELEtBQUsseUJBQVcsQ0FBQyxPQUFPO2dCQUN0QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDL0QsS0FBSyx5QkFBVyxDQUFDLFFBQVE7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLGNBQWU7WUFDM0I7Z0JBQ0MsT0FBTyxTQUFTO1NBQ2xCO0lBQ0gsQ0FBQztJQUVNLGVBQWUsQ0FBRSxjQUFzQjtRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBbUM7UUFDM0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWM7UUFFcEMsT0FBUSxVQUFVLElBQUksY0FBYyxFQUFHO1lBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7WUFDbEQsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQy9CLFVBQVUsRUFBRTtTQUNiO1FBRUQsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVELElBQVcsZ0JBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtJQUMxQyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQW1CLEVBQUUsTUFBYztRQUNuRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFFO0lBQzdGLENBQUM7SUFFTSxpQkFBaUIsQ0FBVyxNQUFtQixFQUFFLEdBQWM7UUFDcEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1FBQ3JELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQXFCLENBQUMsQ0FBQyxDQUFDLFNBQVM7SUFDOUgsQ0FBQztJQUVNLFFBQVEsQ0FBVSxNQUFtQixFQUFFLE1BQWU7UUFDM0QsSUFBSSxDQUFDLGdCQUFnQixDQUFFLE1BQU0sRUFBRSxNQUFNLENBQUU7UUFFdkMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztRQUNqRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDO1FBQ25FLE9BQU8sT0FBNEI7SUFDckMsQ0FBQztJQUVNLFdBQVcsQ0FBQyxNQUFtQixFQUFFLE1BQWU7UUFDckQsSUFBSSxPQUFPLEdBQUcseUJBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUM7UUFDbEQsSUFBSyxPQUFPLENBQUMsU0FBUyxLQUFLLHlCQUFXLENBQUMsR0FBRyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEtBQUsseUJBQVcsQ0FBQyxTQUFTLEVBQUc7WUFDMUYsT0FBTyxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLFNBQVM7U0FDMUM7YUFDSSxJQUFLLE9BQU8sQ0FBQyxTQUFTLEtBQUsseUJBQVcsQ0FBQyxRQUFRLEVBQUc7WUFDckQsT0FBTyxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLE9BQU87WUFDdkMsMEJBQTBCO1lBQzFCLE9BQU8sQ0FBQyxjQUFjLEdBQUcsSUFBSTtTQUM5QjthQUNJO1lBQ0gsT0FBTyxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLE9BQU87U0FDeEM7SUFDSCxDQUFDO0lBRU0sZUFBZSxDQUFVLE1BQW1CLEVBQUUsTUFBZTtRQUNsRSxJQUFJLENBQUMsZ0JBQWdCLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtRQUV2QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ3hELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDbkUsT0FBTyxPQUE0QjtJQUNyQyxDQUFDO0lBRU0sU0FBUyxDQUFDLE1BQW1CLEVBQUUsTUFBYztRQUNsRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN0RixDQUFDO0lBRU0sWUFBWTtRQUNqQixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFO0lBQ2xDLENBQUM7SUFFTSxrQkFBa0I7UUFDdkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQXFCO1FBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUU7WUFDckMseUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO2dCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxFQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMxRixDQUFDLENBQUM7UUFDRixPQUFPLE1BQU07SUFDZixDQUFDO0lBRU0sYUFBYTtRQUNsQixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBb0U7UUFDMUYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRTtZQUNyQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDO1FBQ0YsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVTLHdCQUF3QixDQUFDLE1BQWMsRUFBRSxTQUFpQixFQUFFLEtBQUssR0FBRyxJQUFJO1FBQ2hGLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLEVBQWtCO1FBQ2xELEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxFQUFFO1lBQ3hCLElBQUksQ0FBQyx5QkFBVyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQztnQkFBRSxTQUFRO1lBQ2hELGdCQUFnQixDQUFDLElBQUksQ0FBRSxLQUFLLENBQUMsQ0FBQztnQkFDNUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3JELEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRyxJQUFJLEVBQUUsQ0FDckQ7U0FDRjtRQUVELE9BQU87WUFDTCxJQUFJLEVBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyw4QkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLDhCQUFnQixDQUFDLE1BQU07WUFDN0QsU0FBUyxFQUFFLFNBQVM7WUFDcEIsaUJBQWlCLEVBQUcsZ0JBQWdCO1NBQ3JDO0lBQ0gsQ0FBQztJQUVTLHVCQUF1QixDQUFXLEVBQW9CLEVBQUUsY0FBc0I7UUFDdEYsUUFBTyxFQUFFLENBQUMsU0FBUyxFQUFFO1lBQ25CLEtBQUsseUJBQVcsQ0FBQyxHQUFHO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsY0FBYyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNwSSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsY0FBYyxDQUFDO2dCQUMzRixFQUFFLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsVUFBVTtnQkFDckMsTUFBSztZQUNQLEtBQUsseUJBQVcsQ0FBQyxPQUFPO2dCQUN0QixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsY0FBYyxhQUFhLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN2SSxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUUsY0FBYyxDQUFDO2dCQUM1RixFQUFFLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsU0FBUztnQkFDcEMsTUFBSztZQUNQLEtBQUsseUJBQVcsQ0FBQyxRQUFRO2dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsY0FBYyxjQUFjLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7Z0JBQzlILEVBQUUsQ0FBQyxTQUFTLEdBQUcseUJBQVcsQ0FBQyxVQUFVO2dCQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsY0FBZSxFQUFFLGNBQWMsQ0FBQztnQkFDeEQsRUFBRSxDQUFDLGNBQWMsR0FBRyxJQUFJO2dCQUN4QixNQUFLO1lBQ1Asd0JBQXdCO1lBQ3hCLEtBQUsseUJBQVcsQ0FBQyxVQUFVLENBQUM7WUFDNUIsS0FBSyx5QkFBVyxDQUFDLFNBQVMsQ0FBQztTQUM1QjtJQUNILENBQUM7SUFFTSxhQUFhLENBQUMsY0FBc0I7UUFDekMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaUNBQWlDLGNBQWMsRUFBRSxDQUFDO1FBRTFGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUU7WUFDckMsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLFVBQVU7WUFDNUIsSUFBSSxFQUFFLENBQUMsU0FBUyxLQUFLLHlCQUFXLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUsseUJBQVcsQ0FBQyxRQUFRO2dCQUMzRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUseUJBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUU7aUJBQ2hGLElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyx5QkFBVyxDQUFDLE9BQU87Z0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN0RCw2Q0FBNkM7WUFDN0MsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxjQUFjLENBQUM7WUFDaEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjO1lBQ3BDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSTtRQUN4QixDQUFDLENBQUM7UUFFRixJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFO1FBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVTtRQUUzRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsY0FBYyxFQUFFLENBQUM7SUFDOUYsQ0FBQztJQUVTLG9CQUFvQixDQUFFLEtBQWEsRUFBRSxHQUFjLEVBQUUsT0FBc0I7UUFDbkYsUUFBTyxPQUFPLENBQUMsSUFBSSxFQUFFO1lBQ25CLEtBQUssOEJBQWdCLENBQUMsR0FBRztnQkFDdkIsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztnQkFDM0IsTUFBSztZQUNQLEtBQUssOEJBQWdCLENBQUMsTUFBTTtnQkFDMUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBRTtnQkFDcEMsSUFBSyxDQUFDLEtBQUssU0FBUztvQkFBRyxPQUFNO2dCQUM3QixPQUFPLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFFO2dCQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBRTtnQkFDL0IsTUFBSztZQUNQLEtBQUssOEJBQWdCLENBQUMsTUFBTTtnQkFDMUIsTUFBTSxNQUFNLEdBQUcsdUJBQWMsQ0FBRSxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztnQkFDdkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUU7Z0JBQ3BDLE1BQUs7U0FDUjtJQUNILENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUU7WUFDckMsUUFBTyxFQUFFLENBQUMsU0FBUyxFQUFFO2dCQUNuQixLQUFLLHlCQUFXLENBQUMsR0FBRztvQkFDbEIsRUFBRSxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLFNBQVM7b0JBQ3BDLE1BQUs7Z0JBQ1AsS0FBSyx5QkFBVyxDQUFDLFFBQVE7b0JBQ3ZCLEVBQUUsQ0FBQyxZQUFZLEdBQUcsS0FBSztvQkFDdkIsRUFBRSxDQUFDLGNBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUU7b0JBQzVFLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSTtvQkFDdEIsRUFBRSxDQUFDLGNBQWMsR0FBRyxJQUFJO29CQUN4QixFQUFFLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsVUFBVTtvQkFDckMsTUFBSztnQkFDUCxLQUFLLHlCQUFXLENBQUMsT0FBTztvQkFDdEIsRUFBRSxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLFVBQVU7b0JBQ3JDLE1BQUs7Z0JBQ1AsdUJBQXVCO2dCQUN2QixLQUFLLHlCQUFXLENBQUMsVUFBVSxDQUFDO2dCQUM1QixLQUFLLHlCQUFXLENBQUMsU0FBUyxDQUFDO2FBQzVCO1FBQ0gsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUM7SUFDdEUsQ0FBQztJQUVNLGVBQWUsQ0FBRSxjQUF1QjtRQUM3QyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYztRQUNoQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsSUFBSSxPQUFPLGNBQWMsRUFBRSxDQUFDO1FBRXZHLElBQUksQ0FBQyxhQUFhLEVBQUU7UUFDcEIsT0FBTyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRztZQUM3QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQztZQUNoRSxVQUFVLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBRSxDQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUcsRUFBRTtnQkFDM0QsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRTtnQkFDL0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUM7WUFDdEQsQ0FBQyxDQUFDO1lBQ0YsSUFBSSxDQUFDLGNBQWMsRUFBRztTQUN2QjtRQUVELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMvRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsS0FBSyxFQUFFO1FBRWhDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDaEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUNBQXFDLElBQUksT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDaEgsQ0FBQztJQUVNLFlBQVksQ0FBRSxjQUF1QjtRQUMxQyxJQUFLLElBQUksQ0FBQyxVQUFVLElBQUksY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztZQUFHLE9BQU07UUFDdkYsS0FBSyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsR0FBRyxjQUFjLEVBQUUsR0FBRyxFQUFFLEVBQUc7WUFDNUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQUVPLFdBQVcsQ0FBRSxFQUFpQjtRQUNwQyxJQUFJLGVBQWUsR0FBRyxFQUFFO1FBQ3hCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxlQUFlLElBQUksR0FBRyxFQUFFLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxRQUFRLE9BQU8sRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDO1FBRXRHLE9BQU8sYUFBYSxFQUFFLENBQUMsU0FBUyxVQUFVLEVBQUUsQ0FBQyxJQUFJLE1BQU0sZUFBZSxHQUFHO0lBQzNFLENBQUM7SUFFTSxXQUFXO1FBQ2hCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjO1FBQ2pDLElBQUksTUFBTSxHQUFHLG9EQUFvRDtRQUNqRSxPQUFPLE9BQU8sSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFHO1lBQ2xDLE1BQU0sSUFBSSx5QkFBeUIsT0FBTyxvQkFBb0I7WUFDOUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFFLE9BQU8sQ0FBRTtZQUM3QyxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUcsRUFBRTtnQkFDeEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxFQUFFLENBQUU7Z0JBQ3BDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxXQUFXLENBQUU7Z0JBQy9DLE1BQU0sR0FBRyxHQUFHLFFBQVEsRUFBRSxDQUFDLEtBQUssU0FBUyxFQUFFLENBQUMsR0FBRyxjQUFjLE9BQU8sTUFBTTtnQkFDdEUsTUFBTSxJQUFJLEdBQUc7WUFDZixDQUFDLENBQUM7WUFDRixNQUFNLElBQUksSUFBSTtZQUNkLE9BQU8sRUFBRTtTQUNWO1FBQ0QsTUFBTSxJQUFJLGlEQUFpRDtRQUMzRCxPQUFPLE1BQU07SUFDZixDQUFDOztBQXpVdUIseUNBQW9CLEdBQUcsS0FBSztBQUR0RCxvREEyVUM7QUFFRDtJQUtFLFlBQW9CLE9BQThCLEVBQUUsTUFBaUMsRUFBRSxVQUFzQjtRQUMzRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU87UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVTtJQUM5QixDQUFDO0lBRUQsSUFBVyxhQUFhLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7SUFFM0MsZUFBZTtRQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBb0I7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUU7WUFDekMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFFO1FBQ3RELENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFUyxxQkFBcUIsQ0FBQyxFQUFnQjtRQUM5QyxNQUFNLE1BQU0sR0FBRyx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFFNUMsUUFBTyxFQUFFLENBQUMsU0FBUyxFQUFFO1lBQ25CLEtBQUsseUJBQVcsQ0FBQyxHQUFHO2dCQUNsQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDO1lBQzVELEtBQUsseUJBQVcsQ0FBQyxRQUFRO2dCQUN2QixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUU7Z0JBQ3BELElBQUksT0FBTyxHQUFHLHVCQUFjLENBQUUsYUFBYSxDQUFDLGlCQUFpQixFQUFHLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRTtnQkFDM0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBRTtZQUNwSCxLQUFLLHlCQUFXLENBQUMsT0FBTztnQkFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdFO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQztTQUM1RDtJQUNILENBQUM7SUFFTSx1QkFBdUIsQ0FBRSxjQUF1QjtRQUNyRCxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBb0I7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUUsY0FBYyxDQUFFLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUcsRUFBRTtZQUMzRyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRTtZQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3hDLFFBQU8sYUFBYSxDQUFDLElBQUksRUFBRTtnQkFDekIsS0FBSyw4QkFBZ0IsQ0FBQyxHQUFHO29CQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pELE1BQUs7Z0JBQ1AsS0FBSyw4QkFBZ0IsQ0FBQyxNQUFNO29CQUMxQixJQUFJLE9BQU8sR0FBRyx1QkFBYyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ3pGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUUsQ0FBQztvQkFDNUYsTUFBSztnQkFDUCxLQUFLLDhCQUFnQixDQUFDLE1BQU07b0JBQzFCLElBQUksTUFBTSxHQUFHLHVCQUFjLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDeEYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQUs7YUFDUjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNO0lBQ2YsQ0FBQztDQUVGO0FBN0RELDhDQTZEQzs7Ozs7Ozs7Ozs7O0FDemJELDJDOzs7Ozs7Ozs7OztBQ0FBLHdDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHNDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6ImFzY2gtc21hcnRkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5kZXgudHNcIik7XG4iLCJpbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJ1xuXG5leHBvcnQgY2xhc3MgQmxvY2tDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KClcbiAgcHJpdmF0ZSBtaW5IZWlnaHQgOiBudW1iZXIgPSAwXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gMFxuICBwcml2YXRlIG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgYmxvY2suaGVpZ2h0ICE9PSB0aGlzLm1heEhlaWdodCArIDEgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICgnaW52YWxpZCBibG9jayBoZWlnaHQnKVxuXG4gICAgdGhpcy5jYWNoZS5zZXQoIGJsb2NrLmhlaWdodCwgYmxvY2sgKVxuICAgIHRoaXMubWF4SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gICAgXG4gICAgaWYgKCB0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhDYWNoZWRDb3VudCApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKCB0aGlzLm1pbkhlaWdodCsrIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0KCBoZWlnaHQ6IG51bWJlciApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoaGVpZ2h0KVxuICB9XG5cbiAgcHVibGljIGdldEJ5SWQoIGlkOiBzdHJpbmcgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgZm9yKCBjb25zdCBiIG9mIHRoaXMuY2FjaGUudmFsdWVzKCkgKSB7XG4gICAgICBpZiAoIGIuaWQhID09PSBpZCApIHJldHVybiBiXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBldml0KCBmcm9tSGVpZ2h0OiBudW1iZXIsIHRvSGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgbGV0IG1pbiA9IE1hdGgubWluKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgbGV0IG1heCA9IE1hdGgubWF4KCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgaWYgKCBtaW4gPiB0aGlzLm1heEhlaWdodCB8fCBtYXggPCB0aGlzLm1pbkhlaWdodCApIHJldHVybiBcbiAgICBcbiAgICBtaW4gPSBNYXRoLm1heCggbWluLCB0aGlzLm1pbkhlaWdodCApXG4gICAgbWF4ID0gTWF0aC5taW4oIG1heCwgdGhpcy5taW5IZWlnaHQgKVxuICAgIGZvciAoIGxldCBoZWlnaHQgPSBtaW47IGhlaWdodCA8PSBtYXg7IGhlaWdodCsrICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoaGVpZ2h0KVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBLZXlPYmplY3QgPSB7IFxuICBrZXkgOiBzdHJpbmcsXG4gIGtleVBhcnQgKG5hbWU6IHN0cmluZykgOiBzdHJpbmcgfCBudW1iZXIgXG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSB7XG4gIGxldCByZXQgPSB7fVxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG4gICAgcmV0W2dldEtleShpdGVtKV0gPSBnZXRWYWx1ZShpdGVtKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciggbWVzc2FnZSA6IHN0cmluZyApIHtcbiAgICBzdXBlciggJ0NvZGUgY29udHJhY3QgRXJyb3IsJysgbWVzc2FnZSApXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29udHJhY3RDb25kaXRpb24gPSBib29sZWFuIHwgKCAoKSA9PiBib29sZWFuIClcbmV4cG9ydCB0eXBlIENvbnRyYWN0TWVzc2FnZSAgID0gc3RyaW5nICB8ICggKCkgPT4gc3RyaW5nIClcblxuZXhwb3J0IHR5cGUgTWF5YmVVbmRlZmluZWQ8VD4gPSBUIHwgdW5kZWZpbmVkXG5leHBvcnQgdHlwZSBOdWxsYWJsZTxUPiA9IFQgfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0VmVyaWZ5UmVzdWx0ID0geyByZXN1bHQgOiBib29sZWFuLCBtZXNzYWdlOiBOdWxsYWJsZTxzdHJpbmc+IH0gXG5leHBvcnQgdHlwZSBWZXJpZnlGdW5jdGlvbiA9ICgpID0+IENvbnRyYWN0VmVyaWZ5UmVzdWx0XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3Qge1xuICBwdWJsaWMgc3RhdGljIHZlcmlmeSggY29uZGl0aW9uOiBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSA6IENvbnRyYWN0TWVzc2FnZSApIDogdm9pZCB7XG4gICAgaWYgKCBjb25kaXRpb24gPT09IHVuZGVmaW5lZCB8fCBjb25kaXRpb24gPT09IG51bGwgKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyaWZ5IGNvbmRpdGlvbicpXG5cbiAgICBjb25zdCBjb25kID0gaXNGdW5jdGlvbihjb25kaXRpb24pID8gKGNvbmRpdGlvbiBhcyBGdW5jdGlvbikoKSA6IGNvbmRpdGlvblxuICAgIGNvbnN0IG1zZyA9IGlzRnVuY3Rpb24obWVzc2FnZSkgPyAobWVzc2FnZSBhcyBGdW5jdGlvbikoKSA6IG1lc3NhZ2VcblxuICAgIGlmICghY29uZCkgdGhyb3cgbmV3IENvZGVDb250cmFjdEVycm9yKCBtc2cgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhcmd1bWVudCggYXJnTmFtZTogc3RyaW5nLCB2ZXJpZnk6IFZlcmlmeUZ1bmN0aW9uIHwgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2U/IDogQ29udHJhY3RNZXNzYWdlICk6IHZvaWQge1xuICAgIGlmICggIWFyZ05hbWUgfHwgIXZlcmlmeSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcmdOYW1lIG9yIHZlcmlmeSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgaWYgKCAhbWVzc2FnZSApIHtcbiAgICAgIGNvbnN0IHZyID0gICh2ZXJpZnkgYXMgVmVyaWZ5RnVuY3Rpb24pKClcbiAgICAgIENvZGVDb250cmFjdC52ZXJpZnkoIHZyLnJlc3VsdCwgYGFyZ3VtZW50ICcke2FyZ05hbWV9JyAke3ZyLm1lc3NhZ2V9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIENvZGVDb250cmFjdC52ZXJpZnkodmVyaWZ5IGFzIENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlISkgICAgXG4gIH1cblxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbCggYXJnIDogYW55ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXJnICE9PSBudWxsICYmIGFyZyAhPT0gdW5kZWZpbmVkXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yRW1wdHkoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsKHN0cikgJiYgc3RyICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIGVtcHR5J1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPcldoaXRlc3BhY2UoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsT3JFbXB0eSggc3RyICkgJiYgKCBzdHIgYXMgc3RyaW5nICkudHJpbSgpICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIHdoaXRlc3BhY2UnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG59XG5cblxuIiwiaW1wb3J0IHsgRW50aXR5Q2FjaGUsIExSVUVudGl0eUNhY2hlLCBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRW50aXR5LCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgUHJveGllZEVudGl0eVRyYWNrZXIsIFRyYWNrZXJTcWxCdWlsZGVyLCBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlFeHRlbnNpb24gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIFNhdmVIaXN0b3J5QWN0aW9uID0gKCB2ZXJzaW9uOiBudW1iZXIsIGhpc3Rvcnk6IE1hcDxzdHJpbmcsIEVudGl0eUNoYW5nZXM+ICkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgRGJTZXNzaW9uIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNlc3Npb25DYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgc3FsQnVpbGRlciA6IEpzb25TcWxCdWlsZGVyXG4gIHByaXZhdGUgdHJhY2tlclNxbEJ1aWxkZXI6IFRyYWNrZXJTcWxCdWlsZGVyXG4gIHByaXZhdGUgZW50aXR5VHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgc2Vzc2lvblNlcmlhbCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbiwgY2FjaGVPcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zLCBzZXNzaW9uTmFtZT86IHN0cmluZykge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoIERiU2Vzc2lvbi5uYW1lICsgKCBzZXNzaW9uTmFtZSA9PT0gdW5kZWZpbmVkID8gJycgOiBgXyR7c2Vzc2lvbk5hbWV9YCkgIClcbiAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSAwXG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgIHRoaXMubW9kZWxzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUgPSBuZXcgTFJVRW50aXR5Q2FjaGUoY2FjaGVPcHRpb25zKVxuICAgIHRoaXMuc3FsQnVpbGRlciA9IG5ldyBKc29uU3FsQnVpbGRlcigpXG4gICAgdGhpcy5lbnRpdHlUcmFja2VyID0gbmV3IFByb3hpZWRFbnRpdHlUcmFja2VyKCB0aGlzLnNlc3Npb25DYWNoZSApXG4gICAgdGhpcy50cmFja2VyU3FsQnVpbGRlciA9IG5ldyBUcmFja2VyU3FsQnVpbGRlciggdGhpcy5lbnRpdHlUcmFja2VyLCB0aGlzLm1vZGVscywgdGhpcy5zcWxCdWlsZGVyIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gJiYgdGhpcy5jb25uZWN0aW9uLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgZ2V0IGVudGl0eUNhY2hlKCk6IEVudGl0eUNhY2hlIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uQ2FjaGVcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzeW5jU2NoZW1hKHNjaGVtYTogTW9kZWxTY2hlbWEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTY2hlbWEoc2NoZW1hKVxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5ydW5TY3JpcHQoc3FsKVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2NoZW1hKC4uLnNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogdm9pZCB7XG4gICAgc2NoZW1hcy5mb3JFYWNoKCBzID0+IHRoaXMubW9kZWxzLnNldChzLm1vZGVsTmFtZSwgcykgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWU6IHN0cmluZykgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1vZGVsTmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlDbGFzczxURW50aXR5PihjbGF6ejogQ29uc3RydWN0b3I8VEVudGl0eT4pIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChjbGF6ei5uYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke2NsYXp6Lm5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICkge1xuICAgIHJldHVybiB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbCkgOiBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlDbGFzcyhtb2RlbClcbiAgfVxuXG4gIHByb3RlY3RlZCBtYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkoIHt9LCBrZXkgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCAgZW50aXRpZXMgOiBBcnJheTxURW50aXR5PiwgY2FjaGUgPSB0cnVlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGUpIClcbiAgICAgIGNhY2hlICYmIHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpICwgZSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVzZXQoY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5zdG9wVHJhY2tBbGwoKVxuICAgIGlmICggY2xlYXJDYWNoZSApIHRoaXMuZW50aXR5Q2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlc2V0KCB0cnVlIClcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZGlzY29ubmVjdCgpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pik6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDYWNoZWQ8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKSB8fCBbXVxuXG4gICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzIFxuICB9XG5cbiAgcHVibGljIGF0dGFjaDxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3Qga2V5ID0gc2NoZW1hLmdldEtleShlbnRpdHkpXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiB0cmFja2VkIGFzIE9iamVjdCBhcyBURW50aXR5XG5cbiAgICBsZXQgY2FjaGVkID0gdGhpcy5lbnRpdHlDYWNoZS5nZXQ8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgcmV0dXJuICggY2FjaGVkID09PSB1bmRlZmluZWQgKSA/IHVuZGVmaW5lZCA6IFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBjYWNoZWQgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGZpbmRBbGw8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcblxuICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIHtcbiAgICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZmluZE1hbnkoIG1vZGVsLCB7IH0sIHRyYWNrIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmaW5kTWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlLCBjYWNoZSA9IHRydWUgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uKVxuICAgIFxuICAgIGxldCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggY2FjaGUgKSBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpLCBlICkpXG5cbiAgICByZXR1cm4gIXRyYWNrID8gZW50aXRpZXMgOlxuICAgICAgdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz86IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeUJ5SnNvbjxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgcGFyYW1zKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeS5yZXBsYWNlKCc7JywgJycpfSkgYXMgZXhpc3RgXG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KCBxdWVyeSwgcGFyYW1ldGVycyApXG4gICAgXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSAmJiBwYXJzZUludChyZXRbMF1bJ2V4aXN0J10pID4gMCBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHJldCA9IGF3YWl0IHRoaXMucXVlcnlCeUpzb24oIG1vZGVsLCB7IGZpZWxkcyA6ICdjb3VudCgqKSBhcyBjb3VudCcsIGNvbmRpdGlvbjogY29uZGl0aW9uIH0gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgZXhpc3RzID0gdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKHNjaGVtYS5tb2RlbE5hbWUsIGtleSkgfHwgdGhpcy5lbnRpdHlUcmFja2VyLmlzVHJhY2tpbmcoc2NoZW1hLCB0aGVFbnRpdHkpXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nICkgYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXkgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGtleSwgZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCh0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpLCBlbnRpdHkpIGFzIFRFbnRpdHkgIFxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0NoYW5nZXMoKVxuICB9XG5cbiAgcHVibGljIGxvYWRDYWNoZWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuXG4gICAgY29uc3QgcGUgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oc2NoZW1hLCBrZXkpXG4gICAgaWYgKCBwZSApIHJldHVybiBwZSBhcyBFbnRpdHkgYXMgVEVudGl0eVxuXG4gICAgY29uc3QgZW50aXR5ID0gdGhpcy5zZXNzaW9uQ2FjaGUuZ2V0KG1vZGVsTmFtZSwga2V5KVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGVudGl0eSkgYXMgVEVudGl0eSBcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3Igc2F2ZUNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlQ2hhbmdlcyhzZXJpYWw/IDogbnVtYmVyKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgcmV0U2VyaWFsID0gc2VyaWFsIHx8ICsrdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICBcbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZENoYW5nZVNxbHMoKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKCBzcWxzIClcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG4gICAgICBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5hY2NlcHRDaGFuZ2VzKCByZXRTZXJpYWwgKSBcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHJldFNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgICByZXR1cm4gcmV0U2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucmVqZWN0Q2hhbmdlcygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUm9sbGJhY2sgc2F2ZWQgY2hhbmdlc1xuICAgKiBAcGFyYW0gY2hhbmdlc05PICx0aGlzIHZhbHVlIHNob3VsZCBiZSByZXR1cm5lZCBieSBAc2VlIHNhdmVDaGFuZ2VzKCkgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tDaGFuZ2VzKCBzZXJpYWw6IG51bWJlciApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmKCB0aGlzLnNlc3Npb25TZXJpYWwgPCBzZXJpYWwgKSByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgKCBzZXJpYWwgPSAke3NlcmlhbH0gKWApXG5cbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZFJvbGxiYWNrQ2hhbmdlU3FscyhzZXJpYWwpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goc3FscykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbCAtIDFcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc1ByaW1pdGl2ZSB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxufVxuXG5leHBvcnQgY2xhc3MgTFJVRW50aXR5Q2FjaGUgaW1wbGVtZW50cyBFbnRpdHlDYWNoZSB7XG4gIHByaXZhdGUgc3RhdGljIE1JTl9DQUNIRURfQ09VTlQgPSAxMDBcbiAgcHJpdmF0ZSBzdGF0aWMgREVGVUxUX01BWF9DQUNIRURfQ09VTlQgPSAxMDAwMFxuXG4gIHByaXZhdGUgb3B0aW9uczogRW50aXR5Q2FjaGVPcHRpb25zXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgbW9kZWxDYWNoZXMgOiBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgeyBkZWZhdWx0IDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlQgfVxuICAgIC8vIGZvciggbGV0IGsgaW4gdGhpcy5vcHRpb25zICkgXG4gICAgLy8gICB0aGlzLm9wdGlvbnNba10gPSBpc051bWJlcih0aGlzLm9wdGlvbnNba10pID8gdGhpcy5vcHRpb25zW2tdIDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoTFJVRW50aXR5Q2FjaGUubmFtZSlcbiAgICB0aGlzLm1vZGVsQ2FjaGVzID0gbmV3IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+KClcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUgOiBzdHJpbmcsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UsIHRocm93SWZOb3RFeGlzdHMgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxMUlUuQ2FjaGU8RW50aXR5S2V5LCBFbnRpdHk+PiB7XG4gICAgaWYgKCBjcmVhdGVJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgeyBcbiAgICAgIC8vIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAvLyAgIG1heDogNTAwLFxuICAgICAgLy8gICBsZW5ndGg6IGZ1bmN0aW9uIChuLCBrZXkpIHsgcmV0dXJuIG4gKiAyICsga2V5Lmxlbmd0aCB9LFxuICAgICAgLy8gICAvL2Rpc3Bvc2U6IGZ1bmN0aW9uIChrZXksIG4pIHsgbi5jbG9zZSgpIH0sXG4gICAgICAvLyAgIG1heEFnZTogMTAwMCAqIDYwICogNjAgXG4gICAgICAvLyB9XG4gICAgICBsZXQgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXI7XG4gICAgICBpZiAoICF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkobW9kZWxOYW1lKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0XG4gICAgICBlbHNlIGlmICggaXNOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKVxuICAgICAgZWxzZSBpZiAoIGlzRnVuY3Rpb24odGhpcy5vcHRpb25zW21vZGVsTmFtZV0pKVxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9ICggdGhpcy5vcHRpb25zW21vZGVsTmFtZV0gYXMgKG1vZGVsKT0+IG51bWJlciApKCBtb2RlbE5hbWUgKVxuICAgICAgZWxzZSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgICBtYXhDYWNoZWRDb3VudCA9IE1hdGgubWF4KCBMUlVFbnRpdHlDYWNoZS5NSU5fQ0FDSEVEX0NPVU5ULCBtYXhDYWNoZWRDb3VudCApXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLnNldChtb2RlbE5hbWUsIG5ldyBMUlU8c3RyaW5nLCBFbnRpdHk+KCBtYXhDYWNoZWRDb3VudCApIClcbiAgICB9XG4gICAgIGlmICggdGhyb3dJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgXG4gICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2RlbCBjYWNoZSAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApICBkb2VzIG5vdCBleGlzdHNgKSBcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLm1vZGVsQ2FjaGVzLmdldChtb2RlbE5hbWUpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2FjaGVLZXkoIGtleTogRW50aXR5S2V5ICkgOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByaW1pdGl2ZShrZXkpID8ga2V5IGFzIG51bWJlciB8IHN0cmluZyA6ICgga2V5IGFzIEtleU9iamVjdCApLmtleVxuICB9XG5cbiAgcHVibGljIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZCB7ICAgIFxuICAgIGlmICggaXNTdHJpbmcobW9kZWxOYW1lKSApIHtcbiAgICAgIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgdHJ1ZSApIS5yZXNldCgpXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLmRlbGV0ZSggbW9kZWxOYW1lIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmb3IgKCBsZXQgYyBvZiB0aGlzLm1vZGVsQ2FjaGVzLnZhbHVlcygpICkge1xuICAgICAgYy5yZXNldCgpXG4gICAgfVxuICAgIHRoaXMubW9kZWxDYWNoZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbHMoKSA6IHN0cmluZ1tdIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIGZvciggbGV0IG0gb2YgdGhpcy5tb2RlbENhY2hlcy5rZXlzKCkgKSB7XG4gICAgICByZXN1bHQucHVzaCggbSApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbiAgcHVibGljIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuXG4gICAgcmV0dXJuICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpID8gdW5kZWZpbmVkIDpcbiAgICAgIG1vZGVsQ2FjaGUhLmhhcyhjYWNoZUtleSkgPyBtb2RlbENhY2hlIS5nZXQoY2FjaGVLZXkpIGFzIFRFbnRpdHkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGxldCBjYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lIClcbiAgICBpZiAoIGNhY2hlID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjYWNoZS5mb3JFYWNoKCBlID0+IHtcbiAgICAgIGZpbHRlciAmJiBmaWx0ZXIoIGUgYXMgVEVudGl0eSAgKSAmJiByZXN1bHQucHVzaCggZSBhcyBURW50aXR5ICkgXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgZW50aXR5OiBFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBwdXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9IGtleSA9ICR7a2V5fSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KGVudGl0eSl9YCkgICAgXG4gICAgdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSwgdHJ1ZSkhLnNldCh0aGlzLmdldENhY2hlS2V5KGtleSksIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgZXZpdCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0ga2V5ID0gJHtjYWNoZUtleX1gKVxuXG4gICAgY29uc3QgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgaWYgKG1vZGVsQ2FjaGUpIG1vZGVsQ2FjaGUuZGVsKGNhY2hlS2V5KVxuICB9XG4gIFxuICBwdWJsaWMgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXQobW9kZWxOYW1lLCAgdGhpcy5nZXRDYWNoZUtleSgga2V5ICkpICE9PSB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBkdW1wQ2FjaGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBDQUNIRSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgdGhpcy5tb2RlbENhY2hlcy5mb3JFYWNoKCAoY2FjaGUsIG1vZGVsKSA9PiB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tTW9kZWwgJHttb2RlbH0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGNhY2hlLmZvckVhY2goICggZW50aXR5LCBrZXkgKSA9PiB7XG4gICAgICAgIHJlc3VsdCArPSBga2V5ID0gJHt0aGlzLmdldENhY2hlS2V5KCBrZXkgKX0sIGVudGl0eSA9IHske0pTT04uc3RyaW5naWZ5KGVudGl0eSl9fSBcXG5gXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgfSkgICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBzZGIgZnJvbSAnLi9TbWFydERCJ1xuaW1wb3J0ICogYXMgbW9kZWwgZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCAqIGFzIGJsb2NrIGZyb20gJy4vQmxvY2snXG5pbXBvcnQgKiBhcyBzZXNzaW9uIGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0ICogYXMgc3FsaXRlIGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCAqIGFzIGNvbm4gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5cbmV4cG9ydCBuYW1lc3BhY2UgQXNjaENvcmUge1xuICBleHBvcnQgY29uc3QgU21hcnREQiA9IHNkYi5TbWFydERCXG4gIGV4cG9ydCBjb25zdCBNb2RlbFNjaGVtYSA9IG1vZGVsLk1vZGVsU2NoZW1hXG4gIGV4cG9ydCB0eXBlIEJsb2NrID0gYmxvY2suQmxvY2tcbiAgZXhwb3J0IGNvbnN0IERiU2Vzc2lvbiA9IHNlc3Npb24uRGJTZXNzaW9uXG4gIGV4cG9ydCB0eXBlIERiQ29ubmVjdGlvbiA9IGNvbm4uRGJDb25uZWN0aW9uXG4gIGV4cG9ydCBjb25zdCBTcWxpdGVDb25uZWN0aW9uID0gc3FsaXRlLlNxbGl0ZUNvbm5lY3Rpb25cbn0gXG4iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0ICogYXMgc3VibGV2ZWwgZnJvbSAnbGV2ZWwtc3VibGV2ZWwnXG5cbmNvbnN0IGxldmVsID0gcmVxdWlyZSgnbGV2ZWwnKVxuY29uc3QgU2Vub25kYXJ5ID0gcmVxdWlyZSgnbGV2ZWwtc2Vjb25kYXJ5JylcblxuZXhwb3J0IHR5cGUgR2V0SW5kZXhWYWx1ZUZ1bmMgPSAoa2V5OiBhbnksIHZhbHVlOiBKc29uT2JqZWN0KSA9PiBhbnlcbmV4cG9ydCB0eXBlIEluZGV4RmllbGQgPSB7IGZpZWxkTmFtZTogc3RyaW5nLCBjYWxjSW5kZXg/OiBHZXRJbmRleFZhbHVlRnVuYyB9XG5cbmV4cG9ydCBjbGFzcyBTdWJMZXZlbE1ldGEge1xuICBwdWJsaWMgc3ViTmFtZTogc3RyaW5nXG4gIHB1YmxpYyBrZXlGaWVsZCA6IHN0cmluZ1xuICBwdWJsaWMgaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkOiBzdHJpbmcsIGluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkpIHtcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdChpbmRleEZpZWxkcylcbiAgfVxuXG4gIHByaXZhdGUgZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXhGaWVsZHMuZmluZEluZGV4KGl0ZW0gPT4gZmllbGROYW1lID09PSBpdGVtLmZpZWxkTmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNJbmRleChmaWVsZE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpID4gLTFcbiAgfVxuXG4gIHB1YmxpYyBhZGRJbmRleChmaWVsZE5hbWUgOiBzdHJpbmcsIGNhbGNJbmRleCA6IEdldEluZGV4VmFsdWVGdW5jKTogdGhpcyB7XG4gICAgaWYgKHRoaXMuZXhpc3RzSW5kZXgoZmllbGROYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW5kZXggb2YgZmllbGQgJyR7ZmllbGROYW1lfScgYWxyZWFkeSBleGlzdHNgKVxuXG4gICAgdGhpcy5pbmRleEZpZWxkcy5wdXNoKHsgZmllbGROYW1lLCBjYWxjSW5kZXggfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUluZGV4KGZpZWxkTmFtZSk6IHRoaXMge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKVxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgdGhpcy5pbmRleEZpZWxkcy5zbGljZShpZHgsIDEpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2UoKSA6IENhbGxiYWNrPGFueT4ge1xuICBsZXQgY2FsbGJhY2tcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNhbGxiYWNrID0gKGVyciwgdmFsdWUpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSh2YWx1ZSlcbiAgfSlcbiAgY2FsbGJhY2sucHJvbWlzZSA9IHByb21pc2VcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmZ1bmN0aW9uIHByb21pc2lmeShjYWxsYmFjayA6IENhbGxiYWNrPGFueT4gfCB1bmRlZmluZWQgKSA6IHsgY2FsbGJhY2s6IENhbGxiYWNrPGFueT4sIHByb21pc2U6IFByb21pc2U8YW55PnxudWxsIH0ge1xuICBsZXQgcHJvbWlzZSA9IG51bGxcblxuICBpZiAoICFjYWxsYmFjayApIHtcbiAgICBjYWxsYmFjayA9IG1ha2VQcm9taXNlKClcbiAgICBwcm9taXNlID0gY2FsbGJhY2tbJ3Byb21pc2UnXVxuICB9XG5cbiAgcmV0dXJueyBjYWxsYmFjaywgcHJvbWlzZSB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxSZWFkYWJsZVN0cmVhbSBleHRlbmRzIFJlYWRhYmxlU3RyZWFtIHtcbiAgb24oIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjayA6IEZ1bmN0aW9uICkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxHZXQge1xuICBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPikgOiBQcm9taXNlPFQ+XG4gIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxuICBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxPcGVyYXRpb24ge1xuICBwdXQ8VD4oa2V5IDogYW55LCB2YWx1ZSA6IFQsIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBjYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD5cbiAgYmF0Y2gob3BlckFycmF5OiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz86IEpzb25PYmplY3QpIDogUHJvbWlzZTx2b2lkPiBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmRleGVkTGV2ZWwgZXh0ZW5kcyBMZXZlbEdldCwgTGV2ZWxPcGVyYXRpb24ge1xuICBuYW1lIDogc3RyaW5nXG4gIGluZGV4ZXMgOiBBcnJheTxJbmRleEZpZWxkPlxuICBieUluZGV4KGluZGV4RmllbGQ6IHN0cmluZykgOiBMZXZlbEdldFxuICBnZXRCeShpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8SnNvbk9iamVjdD4pOiBQcm9taXNlPEpzb25PYmplY3Q+XG59XG5cbmV4cG9ydCBjbGFzcyBMZXZlbERCIHsgIFxuICBwcml2YXRlIGRiRGlyIDogc3RyaW5nXG4gIHByaXZhdGUgc3ViTWV0YXMgOiBBcnJheTxTdWJMZXZlbE1ldGE+XG4gIHByaXZhdGUgc3ViTGV2ZWxzIDogTWFwPHN0cmluZywgSW5kZXhlZExldmVsPlxuICBwcml2YXRlIGxldmVsZGIgOiBhbnlcbiAgcHJpdmF0ZSBzdWJMZXZlbGRiIDogc3VibGV2ZWwuU3VibGV2ZWxcblxuICBjb25zdHJ1Y3RvcihkYkRpciA6IHN0cmluZywgbWV0YSA6IEFycmF5PFN1YkxldmVsTWV0YT4sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZGJEaXIgPSBkYkRpclxuICAgIHRoaXMuc3ViTWV0YXMgPSBuZXcgQXJyYXk8U3ViTGV2ZWxNZXRhPigpLmNvbmNhdChtZXRhKVxuICAgIHRoaXMuc3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD4oKVxuICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpIHtcbiAgICB0aGlzLmxldmVsZGIgPSBsZXZlbCggdGhpcy5kYkRpciwgeyB2YWx1ZUVuY29kaW5nOiAnanNvbicgfSApXG4gICAgdGhpcy5zdWJMZXZlbGRiID0gc3VibGV2ZWwodGhpcy5sZXZlbGRiKVxuICAgIHRoaXMuc3ViTWV0YXMuZm9yRWFjaChzID0+IHRoaXMucmVnaXN0ZXJTdWJMZXZlbChzKSlcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJTdWJMZXZlbCggbWV0YTogU3ViTGV2ZWxNZXRhICkge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxkYi5zdWJsZXZlbChtZXRhLnN1Yk5hbWUpXG4gICAgY29uc3QgaW5kZXhlZFN1YiA9IG5ldyBJbmRleGVkU3ViTGV2ZWwoc3ViLCBtZXRhLnN1Yk5hbWUsIG1ldGEua2V5RmllbGQsIC4uLm1ldGEuaW5kZXhGaWVsZHMpICAgIFxuICAgIHRoaXMuc3ViTGV2ZWxzLnNldCggbWV0YS5zdWJOYW1lLCBpbmRleGVkU3ViKVxuICB9XG5cbiAgcHVibGljIGdldCBsZXZlbCgpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiXG4gIH1cblxuICBwdWJsaWMgZ2V0U3ViTGV2ZWwoIHN1Yk5hbWU6IHN0cmluZyApIDogSW5kZXhlZExldmVsIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVscy5nZXQoc3ViTmFtZSlcbiAgICBpZiAoICFzdWIgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggc3ViTGV2ZWwgbmFtZSA9ICcke3N1Yk5hbWV9J2ApXG5cbiAgICByZXR1cm4gc3ViXG4gIH1cblxuICBwdWJsaWMgb3BlbihvcGVuQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55Pik6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeShvcGVuQ2FsbGJhY2spXG5cbiAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBcbiAgICAoYXN5bmMoKT0+IHsgXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKVxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKSAgICAgIFxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVyciwgc2VsZilcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNsb3NlQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55PikgOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoY2xvc2VDYWxsYmFjaylcbiAgICBcbiAgICBpZiAodGhpcy5pc0Nsb3NlZCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuXG4gICAgKGFzeW5jKCk9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmxldmVsZGIuY2xvc2UoKVxuICAgICAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyKVxuICAgICAgfSAgXG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIgJiYgdGhpcy5sZXZlbGRiLmlzT3BlbigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ2xvc2VkKCkge1xuICAgIHJldHVybiAoIXRoaXMubGV2ZWxkYikgfHwgdGhpcy5sZXZlbGRiLmlzQ2xvc2VkKClcbiAgfVxufVxuXG5jbGFzcyBJbmRleGVkU3ViTGV2ZWwgaW1wbGVtZW50cyBJbmRleGVkTGV2ZWwge1xuICBwcml2YXRlIHN1Yk5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBrZXlGaWVsZCA6IHN0cmluZ1xuICBwcml2YXRlIGluZGV4QXJyYXkgOiBBcnJheTxJbmRleEZpZWxkPlxuICBwcml2YXRlIGluZGV4ZWRTdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBMZXZlbEdldD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG5cbiAgcHVibGljIGdldCBuYW1lKCkgeyByZXR1cm4gdGhpcy5zdWJOYW1lIH1cbiAgcHVibGljIGdldCBpbmRleGVzKCkgeyByZXR1cm4gdGhpcy5pbmRleEFycmF5IH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHN1YmxldmVsOiBhbnksIHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQgOiBzdHJpbmcsIC4uLmluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD4pIHtcbiAgICB0aGlzLmxldmVsZGIgPSBzdWJsZXZlbFxuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4QXJyYXkgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoLi4uaW5kZXhGaWVsZHMpXG4gICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIExldmVsR2V0PigpXG4gICAgdGhpcy5pbmRleEFycmF5LmZvckVhY2goIGYgPT4ge1xuICAgICAgbGV0IHN1YiA9IFNlbm9uZGFyeSggc3VibGV2ZWwsIGYuZmllbGROYW1lLCBmLmNhbGNJbmRleCApXG4gICAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuc2V0KCBmLmZpZWxkTmFtZSwgc3ViIClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIGdldCBrZXkoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5RmllbGRcbiAgfVxuICBcbiAgcHVibGljIGFzeW5jIGdldDxUPihrZXk6IGFueSwgb3B0aW9uczogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4gKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3Qga2V5TGV2ZWwgPSB0aGlzLmxldmVsZGIgYXMgSW5kZXhlZFN1YkxldmVsIFxuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGdldENhbGxiYWNrKVxuICAgIGtleUxldmVsLmdldDxUPihrZXksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgIFxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYnlJbmRleCggaW5kZXhGaWVsZE5hbWUgOiBzdHJpbmcgKSA6IExldmVsR2V0IHtcbiAgICBjb25zdCBsZXZlbEdldCA9ICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMuZ2V0KGluZGV4RmllbGROYW1lKVxuICAgIGlmICggIWxldmVsR2V0ICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIGluZGV4IGZpZWxkID0gJyR7aW5kZXhGaWVsZE5hbWV9J2ApXG5cbiAgICByZXR1cm4gbGV2ZWxHZXRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxUPihpbmRleEZpZWxkIDogc3RyaW5nLCBrZXk6IGFueSwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBpbmRleExldmVsID0gdGhpcy5ieUluZGV4KGluZGV4RmllbGQpXG4gICAgcmV0dXJuIGF3YWl0IGluZGV4TGV2ZWwuZ2V0PFQ+KGtleSwgZ2V0Q2FsbGJhY2spXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcHV0PFQ+KGtleTogYW55LCB2YWx1ZTogVCwgcHV0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IHByb21pc2lmeShwdXRDYWxsYmFjaylcbiAgICB0aGlzLmxldmVsZGIucHV0KGtleSwgdmFsdWUsIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeShkZWxDYWxsYmFjaylcbiAgICB0aGlzLmxldmVsZGIuZGVsKGtleSwgY2FsbGJhY2spXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJhdGNoKGFycmF5IDogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/IDogSnNvbk9iamVjdCwgYmF0Y2hDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICggYXJndW1lbnRzLmxlbmd0aCA9PT0gMCApIHJldHVybiB0aGlzLmxldmVsZGIuYmF0Y2goKVxuXG4gICAgbGV0IGhhc09wdGlvbnMgPSBvcHRpb25zICYmICghaXNGdW5jdGlvbihvcHRpb25zKSlcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KCBoYXNPcHRpb25zID8gYmF0Y2hDYWxsYmFjayA6IG9wdGlvbnMgYXMgQ2FsbGJhY2s8YW55PilcblxuICAgIGlmIChoYXNPcHRpb25zKVxuICAgICAgdGhpcy5sZXZlbGRiLmJhdGNoKGFycmF5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBlbHNlXG4gICAgICB0aGlzLmxldmVsZGIuYmF0Y2goYXJyYXksIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIuY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZUtleVN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIuY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG59XG4iLCJpbXBvcnQgeyBMZXZlbERCLCBJbmRleGVkTGV2ZWwsIFN1YkxldmVsTWV0YSB9IGZyb20gJy4vS1ZEQi9MZXZlbERCJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrSGVhZGVyIH0gZnJvbSAnLi9CbG9jaydcblxuY29uc3QgTEFTVF9CTE9DS19IRUlHSFRfS0VZID0gJ19fbGFzdF9ibG9ja19oZWlnaHRfXydcblxuZXhwb3J0IGNsYXNzIExldmVsQmxvY2sge1xuICBwcml2YXRlIGRiIDogTGV2ZWxEQlxuICBwcml2YXRlIGJsb2NrRGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBoaXN0b3J5RGIgOiBJbmRleGVkTGV2ZWxcbiAgcHJpdmF0ZSBsYXN0QmxvY2tIZWlnaHQgOiBudW1iZXJcblxuICBjb25zdHJ1Y3RvciggZGlyIDogc3RyaW5nLCBsZXZlbE9wdGlvbnMgPSB7fSApIHtcbiAgICAvKiBcbiAgICAgIHsgaWQoNjQpLCB0aW1lc3RhbXAoYmlnaW50KSwgaGVpZ2h0KGJpZ2ludCksIHBheWxvYWRMZW5ndGgoYmlnaW50KSwgcGF5bG9hZEhhc2goNjQpLCBwcmV2QmxvY2tJZCg2NCksIFxuICAgICAgICBwb2ludElkKDY0KSwgcG9pbnRIZWlnaHQoYmlnaW50KSwgZGVsZWdhdGUoNjQpLCBzaWduYXR1cmUoMTI4KSwgY291bnQoYmlnaW50KSB9XG4gICAgKi9cbiAgICBjb25zdCBibG9ja01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdibGsnLCAnaGVpZ2h0JywgW1xuICAgICAgeyBmaWVsZE5hbWU6ICdpZCcgfSwgXG4gICAgICB7IGZpZWxkTmFtZTogJ2RlbGVnYXRlJyB9XG4gICAgXSlcbiAgICBjb25zdCBjaGFuZ2VzTG9nTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2hpcycsICdoZWlnaHQnLCBbXSlcbiAgICBcbiAgICB0aGlzLmRiID0gbmV3IExldmVsREIoIGRpciwgW2Jsb2NrTWV0YSwgY2hhbmdlc0xvZ01ldGFdLCBsZXZlbE9wdGlvbnMgKVxuICAgIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID0gMFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBnZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICB0cnkge1xuICAgICAgbGV0IHsgaGVpZ2h0IH0gPSAgYXdhaXQgdGhpcy5ibG9ja0RiLmdldDx7IGhlaWdodDogbnVtYmVyIH0+KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwge30pXG4gICAgICByZXR1cm4gaGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKGUpIHtcbiAgICAgIGlmICghdGhpcy5pc0tleU5vdEZvdW5kRXJyb3IoZSkpIHRocm93IGUgXG5cbiAgICAgIGxldCBsYXN0SGVpZ2h0ID0geyBoZWlnaHQ6IDAgfVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RiLnB1dChMQVNUX0JMT0NLX0hFSUdIVF9LRVksIGxhc3RIZWlnaHQpXG4gICAgICByZXR1cm4gbGFzdEhlaWdodC5oZWlnaHRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgb3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLm9wZW4oKVxuICAgIHRoaXMuYmxvY2tEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2JsaycpXG4gICAgdGhpcy5oaXN0b3J5RGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdoaXMnKVxuICAgIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldExhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHsgXG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0IFxuICB9XG5cbiAgcHJpdmF0ZSBpc0tleU5vdEZvdW5kRXJyb3IoZSkgOiBib29sZWFuIHsgXG4gICAgcmV0dXJuIGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFwcGVuZEJsb2NrKCBibG9jayA6IEJsb2NrSGVhZGVyLCBjaGFuZ2VzOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4gKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFibG9jayB8fCAhYmxvY2suaGVpZ2h0IHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogeyBoZWlnaHQ6IGJsb2NrLmhlaWdodCB9IH0gXSlcblxuICAgIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2soIGhlaWdodCA6IG51bWJlciApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oaGVpZ2h0KVxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIaXN0b3J5Q2hhbmdlcyggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyICkgOiBQcm9taXNlPE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0OyBoIDwgbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gYXdhaXQgdGhpcy5oaXN0b3J5RGIuZ2V0PEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oaClcbiAgICAgIGNoYW5nZXMgJiYgcmV0LnNldCggaCwgY2hhbmdlcyApXG4gICAgfVxuICAgIHJldHVybiByZXQgXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBkZWxldGVMYXN0QmxvY2soIGhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGhlaWdodCAhPT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgbGFzdCBibG9jayBoZWlnaHQgJyR7aGVpZ2h0fSdgKVxuXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ2RlbCcsIGtleSA6IGhlaWdodCB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogeyBoZWlnaHQ6IGhlaWdodCAtIDEgfSB9IF0pXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIuZGVsKCBoZWlnaHQgKVxuICAgIFxuICAgIHRoaXMubGFzdEJsb2NrSGVpZ2h0IC0tXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCBibG9ja3MgPSBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0QnkoJ2lkJywgYmxvY2tJZClcbiAgICByZXR1cm4gKGJsb2Nrcy5sZW5ndGggPT09IDApID8gdW5kZWZpbmVkIDogYmxvY2tzWzBdXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICByZXR1cm4gYXdhaXQgKChtaW5IZWlnaHQsIG1heEhlaWdodCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzLCByZWopID0+IHtcbiAgICAgICAgbGV0IGJsb2NrcyA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKSAgICAgIFxuICAgICAgICB0aGlzLmJsb2NrRGIuY3JlYXRlUmVhZFN0cmVhbSh7IHN0YXJ0OiBtaW5IZWlnaHQsIGVuZDogbWF4SGVpZ2h0fSlcbiAgICAgICAgICAub24oJ2RhdGEnLCBkYXRhID0+IGJsb2Nrcy5wdXNoKGRhdGEpIClcbiAgICAgICAgICAub24oJ2Vycm9yJywgZSA9PiByZWooZSkgKVxuICAgICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzKGJsb2NrcykgKVxuICAgICAgfSlcbiAgICB9KShtaW5IZWlnaHQsIG1heEhlaWdodCkgYXMgQXJyYXk8QmxvY2tIZWFkZXI+XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIC4uLmJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYmxvY2tJZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrQnlJZCggYmxvY2tJZHNbaV0gKVxuICAgICAgYmxvY2sgJiYgcmV0LnB1c2goIGJsb2NrIClcbiAgICB9XG4gICAgcmV0dXJuIHJldFxuICB9XG59IiwiZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xuICBBbGwgICAgPSAxMjggLSAxLFxuICBUcmFjZSAgPSA2NCxcbiAgRGVidWcgID0gMzIsXG4gIExvZyAgICA9IDE2LFxuICBJbmZvICAgPSA4LFxuICBXYXJuICAgPSA0LFxuICBFcnJvciAgPSAyLFxuICBGYXRhbCAgPSAxLFxuICBOb25lICAgPSAwXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nTGV2ZWwgOiBMb2dMZXZlbFxuICByZWFkb25seSBpbmZvRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IHRyYWNlRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgbG9nRW5hYmxlZCAgIDogYm9vbGVhblxuICByZWFkb25seSBkZWJ1Z0VuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IHdhcm5FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZXJyb3JFbmFsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBmYXRhbEVuYWJsZWQgOiBib29sZWFuXG5cbiAgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIHdhcm4oIG1zZzogc3RyaW5nICwgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxuICBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxufVxuXG5jbGFzcyBMb2dnZXJBZGFwdGVyIGltcGxlbWVudHMgTG9nZ2VyIHtcbiAgcHJpdmF0ZSBsZXZlbCA6IExvZ0xldmVsXG4gIHByaXZhdGUgbmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGZvcm1hdCA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBnZXRMb2dnZXIgOiAoKSA9PiBMb2dnZXJcblxuICBwdWJsaWMgZ2V0IGluZm9FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuSW5mbykgID4gMCB9XG4gIHB1YmxpYyBnZXQgdHJhY2VFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5UcmFjZSkgPiAwIH1cbiAgcHVibGljIGdldCBkZWJ1Z0VuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkRlYnVnKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGxvZ0VuYWJsZWQoKSAgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuTG9nKSAgID4gMCB9XG4gIHB1YmxpYyBnZXQgd2FybkVuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5XYXJuKSAgPiAwIH1cbiAgcHVibGljIGdldCBlcnJvckVuYWxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkVycm9yKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGZhdGFsRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRmF0YWwpID4gMCB9XG5cbiAgcHVibGljIGdldCBsb2dMZXZlbCgpIHsgcmV0dXJuIHRoaXMubGV2ZWwgfVxuICBwdWJsaWMgc2V0IGxvZ0xldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7IHRoaXMubGV2ZWwgPSBsZXZlbCB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGdldExvZ2dlcjogKCkgPT4gTG9nZ2VyLCBmb3JtYXRNZXNzYWdlID0gZmFsc2UsIGxvZ2dlck5hbWU6IHN0cmluZywgbGV2ZWwgPSBMb2dMZXZlbC5BbGwgKSB7XG4gICAgdGhpcy5uYW1lID0gbG9nZ2VyTmFtZVxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbFxuICAgIHRoaXMuZ2V0TG9nZ2VyID0gZ2V0TG9nZ2VyXG4gICAgdGhpcy5mb3JtYXQgPSBmb3JtYXRNZXNzYWdlXG4gIH1cblxuICBwcm90ZWN0ZWQgZnJvbWF0TWVzc2FnZSggbXNnOiBzdHJpbmcsIGxvZ1R5cGU6IHN0cmluZyApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0gWyR7bG9nVHlwZX1dIFske3RoaXMubmFtZX1dICR7bXNnfWBcbiAgfVxuXG4gIHB1YmxpYyBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0lORk8nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmluZm8oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdERUJVRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnTE9HJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1RSQUNFJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHdhcm4oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnV0FSTicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkud2FybiggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRVJST1InIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxuXG4gIHB1YmxpYyBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0ZBVEFMJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvZ01hbmFnZXIge1xuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nTGV2ZWwgPSBMb2dMZXZlbC5BbGxcbiAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlTG9nZ2VyID0gKCkgPT4gIGNvbnNvbGUgYXMgT2JqZWN0IGFzIExvZ2dlciBcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ2dlciA9IG5ldyBMb2dnZXJBZGFwdGVyKCBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgJ2RlZmF1bHQnLCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCApXG5cbiAgcHVibGljIHN0YXRpYyBzZXQgZGVmYXVsdExldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7XG4gICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgPSBsZXZlbFxuICB9XG4gIFxuICBwdWJsaWMgc3RhdGljIHNldCBsb2dGYWN0b3J5ICggdmFsdWU6ICgpID0+IExvZ2dlciApIHtcbiAgICBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciA9IHZhbHVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldExvZ2dlcihsb2dnZXJOYW1lPzogc3RyaW5nLCBsZXZlbD8gOiBMb2dMZXZlbCkgOiBMb2dnZXIge1xuICAgIHJldHVybiBsb2dnZXJOYW1lID8gXG4gICAgICBuZXcgTG9nZ2VyQWRhcHRlcihMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgbG9nZ2VyTmFtZSwgbGV2ZWwgfHwgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwpIDogXG4gICAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dnZXI7XG4gIH1cbn1cbiIsImltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBLZXlPYmplY3QsIENvZGVDb250cmFjdCBhcyBEQkMgfSBmcm9tICcuL0NvbW1vbic7XG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0geyBuZXcoKSA6IFQgfVxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ID0gc3RyaW5nIHwgQ29uc3RydWN0b3I8VEVudGl0eT5cblxuZXhwb3J0IGVudW0gRmllbGRUeXBlcyB7XG4gIFN0cmluZyAgID0gJ1N0cmluZycsXG4gIE51bWJlciAgID0gJ051bWJlcicsXG4gIEJpZ0ludCAgID0gJ0JpZ0ludCcsXG4gIFRleHQgICAgID0gJ1RleHQnXG59XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IHN0cmluZyB8IEZpZWxkVHlwZXNcblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZCB7XG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogRmllbGRUeXBlLFxuICBsZW5ndGg/OiBudW1iZXIgLFxuICBpbmRleD86IGJvb2xlYW4sXG4gIG5vdF9udWxsPzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgY29tcG9zaXRlX2tleT8gOiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENPTVBPU0lURV9LRVlfU0VQQVJBVE9SID0gJ18mXydcbiAgcHJpdmF0ZSBlbnRpdHkgOiBFbnRpdHlcbiAgcHJpdmF0ZSBmaWVsZHMgOiBBcnJheTxzdHJpbmc+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbnRpdHk6IEVudGl0eSwgLi4uZmllbGRzOiBBcnJheTxzdHJpbmc+ICkge1xuICAgIHRoaXMuZW50aXR5ID0gZW50aXR5XG4gICAgdGhpcy5maWVsZHMgPSBuZXcgQXJyYXk8c3RyaW5nPiguLi5maWVsZHMpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1ha2VLZXkoIC4uLnZhbHVlcyA6IEFycmF5PHN0cmluZ3xudW1iZXI+ICkgOiBzdHJpbmcge1xuICAgIERCQy5hcmd1bWVudCggJ3ZhbHVlcycsICB2YWx1ZXMgJiYgdmFsdWVzLmxlbmd0aCA+IDEgLCAndmFsdWVzIG11c3QgY29udGFpbnMgbW9yZSB0aGFuIDEgaXRlbScgKVxuXG4gICAgcmV0dXJuIG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPiguLi52YWx1ZXMpLmpvaW4oIENvbXBvc2l0ZUtleS5DT01QT1NJVEVfS0VZX1NFUEFSQVRPUiApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIHsgXG4gICAgbGV0IHZhbHVlcyA9IG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPigpXG4gICAgdGhpcy5maWVsZHMuZm9yRWFjaCggZiA9PiB2YWx1ZXMucHVzaCggdGhpcy5lbnRpdHlbZl0gKSApXG4gICAgcmV0dXJuIENvbXBvc2l0ZUtleS5tYWtlS2V5KCAuLi52YWx1ZXMgKVxuICB9XG5cbiAgcHVibGljIGtleVBhcnQoIG5hbWU6IHN0cmluZyApIDogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlbbmFtZV1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgYWxsS2V5RmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gRmllbGRUeXBlcy5TdHJpbmcgfHwgdHlwZSA9PT0gRmllbGRUeXBlcy5UZXh0ID8gXG4gICAgICAnU3RyaW5nJyA6IFxuICAgICAgJ051bWJlcidcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7XG4gICAgY29uc3QgcGtGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApLm1hcCggZj0+IGYubmFtZSApXG4gICAgaWYgKCAhcGtGaWVsZHMgfHwgcGtGaWVsZHMubGVuZ3RoIDwgMSApIHRocm93IG5ldyBFcnJvcihgcHJpbWFyeSBrZXkgaXMgdW5kZWZpbmVkYClcblxuICAgIHRoaXMuYWxsS2V5RmllbGRzID0gcGtGaWVsZHNcbiAgICB0aGlzLmFsbEZpZWxkVHlwZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpXG4gICAgdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZm9yRWFjaCggZiA9PiB0aGlzLmFsbEZpZWxkVHlwZXMuc2V0KCBmLm5hbWUsIHRoaXMuY29udmVydFR5cGUoZi50eXBlKSkgKVxuICAgIHRoaXMuYWxsRmllbGRzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMubWFwKCBmID0+IGYubmFtZSlcbiAgICB0aGlzLmFsbEluZGV4ZXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5pbmRleCA9PT0gdHJ1ZSApLm1hcCggZiA9PiBmLm5hbWUgKVxuICB9XG5cbiAgcHVibGljIGdldEZpZWxkVHlwZXMoc2NoZW1hOiBTY2hlbWEpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZFR5cGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjaGVtYU9iamVjdCgpIDogU2NoZW1hIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb21wc2l0ZUtleSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IHN0cmluZyB7XG4gICAgaWYgKCB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPiAxICkgdGhyb3cgRXJyb3IoYG1vZGVsICcke3RoaXMubW9kZWxOYW1lfScgaWRlbnRpZmllZCBieSBjb21wb3NpdGUga2V5YClcbiAgICByZXR1cm4gdGhpcy5hbGxLZXlGaWVsZHNbMF1cbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5RmllbGRzKCkgOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5XSA9IGtleVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjayA9IGtleSBhcyBDb21wb3NpdGVLZXlcbiAgICAgIHRoaXMua2V5RmllbGRzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5UGFydChmKSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPT09IDEgPyBcbiAgICAgIGVudGl0eVt0aGlzLmFsbEtleUZpZWxkc1swXV0gOlxuICAgICAgbmV3IENvbXBvc2l0ZUtleSggZW50aXR5LCAuLi50aGlzLmFsbEtleUZpZWxkcylcbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICEgaW5jbHVkZUtleSAmJiB0aGlzLmtleUZpZWxkcy5pbmRleE9mKGYpID49IDAgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG5cbn0iLCJpbXBvcnQgeyBNb2RlbFNjaGVtYSwgRmllbGRUeXBlcyB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5S2V5LCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IGlzQXJyYXksIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IEpzb25TcWwgPSByZXF1aXJlKCdqc29uLXNxbCcpKHsgc2VwYXJhdGVkVmFsdWVzOiBmYWxzZSB9KVxuY29uc3QgY2hhbmdlQ2FzZSA9IHJlcXVpcmUoJ2NoYW5nZS1jYXNlJylcblxuZXhwb3J0IGNvbnN0IE1VTFRJX1NRTF9TRVBBUkFUT1IgPSAnLy87Ly8nXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogc3RyaW5nXG4gIGJ1aWxkSW5zZXJ0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGREZWxldGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzOiBBcnJheTxzdHJpbmc+LCB3aGVyZSA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBzdHJpbmcge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gZGF0YWJhc2UgZG8gbm90IHN1cHBvcnQgY29tcG9zaXRlIGtleSAgIFxuICAgIGlmICggc2NoZW1hLmlzQ29tcHNpdGVLZXkgKSB7IFxuICAgICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gZi5wcmltYXJ5X2tleSA9IGZhbHNlIClcbiAgICB9XG4gICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fscy5qb2luKCBNVUxUSV9TUUxfU0VQQVJBVE9SIClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIC8vIHByaXZhdGUgZGV0ZXJtaW5lU29ydCggdGFibGVOYW1lOiBzdHJpbmcsIHNvcnQgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgc29ydCB8fCB7fVxuICAvLyAgIGlmICh0eXBlb2Ygc29ydCA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGlmIChzb3J0ID09PSAndGltZXN0YW1wJykge1xuICAvLyAgICAgICBzb3J0ID0gJ3QuJyArIHNvcnRcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHNvcnQgPSB0YWJsZU5hbWUgKyAnLicgKyBzb3J0XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2Ygc29ydCA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gc29ydCkge1xuICAvLyAgICAgICBpZiAoayA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgLy8gICAgICAgICBzb3J0Wyd0LicgKyBrXSA9IHNvcnRba11cbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBzb3J0W3RhYmxlTmFtZSArICcuJyArIGtdID0gc29ydFtrXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGRlbGV0ZSBzb3J0W2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBzb3J0XG4gIC8vIH1cblxuICAvLyBwcml2YXRlIGRldGVybWluZVdoZXJlKCB0YWJsZU5hbWU6IHN0cmluZywgd2hlcmUgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgbGV0IGNvbmRpdGlvbiA9IHt9IHx8IHdoZXJlIFxuICAvLyAgIGlmIChBcnJheS5pc0FycmF5KGNvbmRpdGlvbikpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5zbGljZSgpXG4gIC8vICAgICBmb3IgKGxldCBpIGluIGNvbmRpdGlvbikge1xuICAvLyAgICAgICBmb3IgKGxldCBrIGluIGNvbmRpdGlvbltpXSkge1xuICAvLyAgICAgICAgIGNvbmRpdGlvbltpXVt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltpXVtrXVxuICAvLyAgICAgICAgIGRlbGV0ZSBjb25kaXRpb25baV1ba11cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmRpdGlvbilcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gY29uZGl0aW9uKSB7XG4gIC8vICAgICAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltrXVxuICAvLyAgICAgICBkZWxldGUgY29uZGl0aW9uW2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLl9kZWxldGVkXyddID0gMFxuICAvLyB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkc09yUGFyYW1zOiBBcnJheTxzdHJpbmc+IHwgSnNvbk9iamVjdCwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBcbiAgICByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgam9pbj8gOiBKc29uT2JqZWN0ICk6IFNxbEFuZFBhcmFtZXRlcnMge1xuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBcbiAgICBsZXQgcXVlcnlPcHRpb25zIDogSnNvbk9iamVjdFxuICAgIGlmICggIWlzQXJyYXkoIGZpZWxkc09yUGFyYW1zICkgKSB7XG4gICAgICBsZXQgcGFyYW1zID0gZmllbGRzT3JQYXJhbXMgYXMgSnNvbk9iamVjdFxuICAgICAgcXVlcnlPcHRpb25zID0gT2JqZWN0LmFzc2lnbiggeyB0eXBlOiAnc2VsZWN0JywgdGFibGU6IHRhYmxlTmFtZSB9LCBwYXJhbXMgKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxldCBmaWVsZHMgPSBmaWVsZHNPclBhcmFtcyB8fCBzY2hlbWEuZmllbGROYW1lcy5tYXAoIGYgPT4gc2NoZW1hLnNjaGVtYU9iamVjdC50YWJsZSArICcuJyArIGYgKVxuICAgICAgbGV0IGxvIDogTGltaXRBbmRPZmZzZXQgPSBpc051bWJlciggcmVzdWx0UmFuZ2UgKSA/ICB7IGxpbWl0IDogcmVzdWx0UmFuZ2UgfSA6IHJlc3VsdFJhbmdlIHx8IHsgfVxuICAgICAgbGV0IG9yZGVyID0gc29ydCB8fCB7fVxuICAgICAgZm9yICggbGV0IGtleSBvZiBSZWZsZWN0Lm93bktleXMob3JkZXIpICApIHtcbiAgICAgICAgbGV0IG9yZGVyVmFsdWUgPSBvcmRlcltrZXldIHx8IC0xXG4gICAgICAgIG9yZGVyW2tleV0gPSAob3JkZXJWYWx1ZSA9PT0gJ0FTQycpID8gMSA6ICggKG9yZGVyVmFsdWUgPT09ICdERVNDJykgPyAtMSA6IG9yZGVyVmFsdWUgKVxuICAgICAgfVxuXG4gICAgICBxdWVyeU9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBmaWVsZHM6IGZpZWxkcyxcbiAgICAgICAgY29uZGl0aW9uOiB3aGVyZSxcbiAgICAgICAgbGltaXQ6IGxvLmxpbWl0LFxuICAgICAgICBvZmZzZXQ6IGxvLm9mZnNldCxcbiAgICAgICAgc29ydDogb3JkZXIsXG4gICAgICAgIGpvaW46IGpvaW5cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlNlbGVjdCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQocXVlcnlPcHRpb25zKSlcbiAgfVxufSIsImltcG9ydCB7IFNxbGl0ZVdyYXBwZXIgfSBmcm9tICcuL1NxbGl0ZVdyYXBwZXInXG5pbXBvcnQgeyBNVUxUSV9TUUxfU0VQQVJBVE9SLCBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uLCBDb25uZWN0aW9uT3B0aW9ucywgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuXG5cbmNsYXNzIFNxbGl0ZVRyYW5zYWN0aW9uIGltcGxlbWVudHMgREJUcmFuc2FjdGlvbiB7XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbikge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb21taXQoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdDT01NSVQnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0snKSBcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3FsaXRlQ29ubmVjdGlvbiBpbXBsZW1lbnRzIERiQ29ubmVjdGlvbiB7XG4gIHByaXZhdGUgb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zXG4gIHByaXZhdGUgc3FsaXRlIDogU3FsaXRlV3JhcHBlclxuXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnMgKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuc3FsaXRlID0gbmV3IFNxbGl0ZVdyYXBwZXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBjb25uZWN0aW9uT3B0aW9ucygpOiBDb25uZWN0aW9uT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9uc1xuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmFzeW5PcGVuKCB0aGlzLm9wdGlvbnMuc3RvcmFnZSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGlzY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5DbG9zZSgpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luUXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5U3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLnF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQ6IFNxbEV4ZWN1dGVSZXN1bHQgKSB7XG4gICAgaWYgKCByZXN1bHQucm93c0VmZmVjdGVkID09PSAwKSAgdGhyb3cgbmV3IEVycm9yKCdOb25lIHJvdyBlZmZlY3RlZCcpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoU3luYyggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmV4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSAsIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCApIFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luRXhlY3V0ZSggc3FsLCBwYXJhbWV0ZXJzIClcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW5TY3JpcHQoc3FsOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgc3FsLnNwbGl0KCBNVUxUSV9TUUxfU0VQQVJBVE9SICkuZm9yRWFjaChcbiAgICAgIGFzeW5jIHNxbD0+IGF3YWl0IChzcWwudHJpbSgpICE9PSAnJykgJiYgdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIFtdKVxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zKCk6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZSgnQkVHSU4gVFJBTlNBQ1RJT04nKVxuICAgIHJldHVybiBuZXcgU3FsaXRlVHJhbnNhY3Rpb24odGhpcylcbiAgfVxufSIsImltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ01hbmFnZXIsIExvZ2dlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IFNxbFBhcmFtZXRlcnMsIFNxbEFuZFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5cbmltcG9ydCAqIGFzIERhdGFiYXNlIGZyb20gJ2JldHRlci1zcWxpdGUzJ1xuXG5leHBvcnQgY2xhc3MgU3FsaXRlV3JhcHBlciB7XG4gIHByaXZhdGUgZGIgOiBEYXRhYmFzZVxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNxbGl0ZVdyYXBwZXIubmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKGRiRmlsZVBhdGg6IHN0cmluZywgY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5kYiA9IG5ldyBEYXRhYmFzZShkYkZpbGVQYXRoKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgIClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0ICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5DbG9zZSgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmNsb3NlKS5jYWxsKHRoaXMpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8U3FsRXhlY3V0ZVJlc3VsdD4pOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB7IGxhc3RJbnNlcnRSb3dJZDogJzAnLCByb3dzRWZmZWN0ZWQ6IDAgfSB9XG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGNvbnN0IHNxbFJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLnJ1bihwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgcmV0LnJlc3VsdCA9IHsgXG4gICAgICAgIGxhc3RJbnNlcnRSb3dJZCA6IHNxbFJlc3VsdC5sYXN0SW5zZXJ0Uk9XSUQudG9TdHJpbmcoKSxcbiAgICAgICAgcm93c0VmZmVjdGVkOiBzcWxSZXN1bHQuY2hhbmdlcyBcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PGFueT4+ICkgOiBBcnJheTxhbnk+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8YW55PigpIH1cbiAgICB0cnkge1xuICAgICAgcmV0LnJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLmFsbChwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCByZXN1bHQgY291bnQgPSAke3JldC5yZXN1bHQubGVuZ3RofWApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+ICApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PigpIH0gXG4gICAgbGV0IHNxbCA6IFNxbEFuZFBhcmFtZXRlcnMgfCB1bmRlZmluZWRcbiAgICB0cnkge1xuICAgICAgc3Fscy5mb3JFYWNoKCBzID0+IHtcbiAgICAgICAgc3FsID0gc1xuICAgICAgICBsZXQgZXhlY1JldCA9IHRoaXMuZXhlY3V0ZSggcy5xdWVyeSwgcy5wYXJhbWV0ZXJzIClcbiAgICAgICAgb25FeGVjdXRlZCAmJiBvbkV4ZWN1dGVkKCBleGVjUmV0LCBzICkgIFxuICAgICAgICByZXQucmVzdWx0LnB1c2goIGV4ZWNSZXQgKVxuICAgICAgfSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlQmF0Y2gsIHNxbCA9ICR7c3FsIS5xdWVyeX0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHNxbCEucGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soIHJldC5lcnIsIHJldC5yZXN1bHQgKVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bkV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlKS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luUXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5xdWVyeSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQgKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZUJhdGNoKS5jYWxsKCB0aGlzLCBzcWxzLCBvbkV4ZWN1dGVkIClcbiAgfVxuXG59IiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBDb2RlQ29udHJhY3QgYXMgREJDLCBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgTGV2ZWxCbG9jayB9IGZyb20gJy4vTGV2ZWxCbG9jaydcbmltcG9ydCB7IERiU2Vzc2lvbiB9IGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsaXRlQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yICB9IGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgRW50aXR5UHJveHkgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEJsb2NrSGVhZGVyLCBCbG9jaywgVHJhbnNhY3Rpb24gfSBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0IHsgQmxvY2tDYWNoZSB9IGZyb20gJy4vQmxvY2tDYWNoZSdcblxuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBjYWNoZWQgbGFzdCBibG9jayBjb3VudCBcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGNhY2hlZEJsb2NrQ291bnQ/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCA1MDAwIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBzY2hlbWFzLmZvckVhY2goIGFzeW5jIHNjaGVtYSA9PiB7XG4gICAgICB0aGlzLnNjaGVtYXMuc2V0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEgKVxuICAgICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb24oIHNjaGVtYSApXG5cbiAgICAgIGF3YWl0IHNlc3Npb24ucmVnaXN0ZXJTY2hlbWEoc2NoZW1hKVxuICAgICAgYXdhaXQgc2Vzc2lvbi5zeW5jU2NoZW1hKHNjaGVtYSlcblxuICAgICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICkgYXdhaXQgc2Vzc2lvbi5maW5kQWxsKCBzY2hlbWEubW9kZWxOYW1lLCB0cnVlIClcbiAgICB9KTtcblxuICAgIHRoaXMuZW1pdCggJ3JlYWR5JywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogZnJlZSByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuY2xvc2UoKVxuICAgIFxuICAgIHRoaXMuZW1pdCgnY2xvc2VkJywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogaGVpZ2h0IG9mIGxhc3QgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJsb2NrREIuZ2V0TGFzdEJsb2NrSGVpZ2h0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBibG9ja3MgY291bnRcbiAgICovXG4gIHB1YmxpYyBnZXQgYmxvY2tzQ291bnQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICBibG9ja0hlYWRlci50cmFuc2FjdGlvbnMgPSB1bmRlZmluZWRcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIGJsb2NrSGVhZGVyLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnNhdmVDaGFuZ2VzKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgKVxuICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeUZvclJvbGxiYWNrISApXG4gICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5wdXQoIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHsgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgY29tbWl0QmxvY2sgZmFpbGVkICggaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2sodGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0KVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGJsb2NrIGNoYW5nZXNcbiAgICogQHBhcmFtIGhlaWdodCByb2xsYmFjayB0byBoZWlnaHQoZXhjbHVkZSlcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0Jsb2NrKCBoZWlnaHQ/OiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgIWhlaWdodCB8fCBoZWlnaHQgPD0gdGhpcy5sYXN0QmxvY2tIZWlnaHQsIFxuICAgICAgYGhlaWdodCBtdXN0IGxlc3Mgb3IgZXF1YWwgbGFzdEJsb2NrSGVpZ2h0ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcblxuICAgIGNvbnN0IGJsb2NrSGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgZnJvbSA9IGJsb2NrSGVpZ2h0XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZlciA9IHRoaXMuYmxvY2tTZXNzaW9uLmhpc3RvcnlWZXJzaW9uO1xuICAgICAgaWYgKCBmcm9tIDwgdmVyLm1pbiApIHsgLy8gbG9hZCBoaXN0b3J5IGZyb20gbGV2ZWxkYiwgaWYgY2FjaGVkIGhpc3RvcnkgbGVzcyB0aGFuIHJvbGxiYWNrIGhlaWdodCBcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeShhd2FpdCB0aGlzLmJsb2NrREIuZ2V0SGlzdG9yeUNoYW5nZXMoIGZyb20sIHZlci5taW4gLSAxICkpXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIGJsb2NrSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+PSBibG9ja0hlaWdodCApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5ldml0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCwgdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGByb2xsYmFja0Jsb2NrIGhlaWdodCA6ICR7ZnJvbX0gLT4gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYHJvbGxiYWNrQmxvY2sgZmFpbGVkICggaGVpZ2h0IDogJHtmcm9tfSAtPiAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fSApYCwgZXJyKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNhdmUgbG9jYWwgdGFibGVzIChub3QgaW4gYmxvY2sgLS0tIHdoaWNoIGRlZmluZSBpbiBzY2hlbWEgYnkgbG9jYWwgOiB0cnVlKSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlTG9jYWxDaGFuZ2VzKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBzZXJpYWwgPSBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5zYXZlQ2hhbmdlcygpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWwgKVxuICAgIHJldHVybiBzZXJpYWxcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBsb2NhbCB0YWJsZXMgY2hhbmdlcyBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqIEBwYXJhbSBzZXJpYWwgc2VyaWFsIG51bWJlciByZXR1cm4gZnJvbSBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tMb2NhbENoYW5nZXMoc2VyaWFsOiBudW1iZXIpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzZXJpYWwnLCBzZXJpYWwgPiAwLCBgc2VyaWFsIG11c3QgZ3JlYXQgdGhhbiB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogcmVmcmVzaCBlbnRpdHkgYW5kIHRyYWNraW5nIGdpdmVuIGVudGl0eSwgV0FSTjogZW50aXR5IG1heSBiZSBjaGFuZ2VkXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IGVudGl0eVxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBvciB1bmRlZmluZWRcbiAgICovXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpIClcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgLCB0cnVlKSFcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuYXR0YWNoKCBzY2hlbWEsIGVudGl0eSApXG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIGEgbmV3IGVudGl0eSB3aGljaCBjaGFuZ2Ugd2lsbCBiZSB0cmFja2VkIGFuZCBwZXJzaXN0ZW50ZWQgKGJ5IHNhdmVDaGFuZ2VzKSBhdXRvbWF0aWNhbGx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGVudGl0eSBrZXkgd2hpY2ggdW5pcXVlZCBpbiBkYXRhYmFzZVxuICAgKiBAcGFyYW0gZW50aXR5IHByb3RvdHlwZSBlbnRpdHkgd2hpY2ggcHJvcGVydGllcyB3aWxsIGNvcHkgdG8gcmVzdWx0IGVudGl0eVxuICAgKiBAcmV0dXJucyB0cmFja2luZyBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSwgZW50aXR5PzogVEVudGl0eSkgOiBURW50aXR5IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jcmVhdGUobW9kZWwsIGtleSwgZW50aXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIHVwZGF0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIC8vIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAvLyAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gIC8vICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSBwcm94aWVkIG9iamVjdGAgKVxuXG4gIC8vICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gIC8vICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLnVwZGF0ZShlbnRpdHkpXG4gIC8vIH1cblxuICAvKipcbiAgICogZGVsZXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHRyYWNraW5nIGVudGl0eWAgKVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5kZWxldGUoZW50aXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgYW5kIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWQobW9kZWwsIGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGRhdGFiYXNlIGJ5IGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJ5PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdjb25kaXRpb24nLCAoKT0+IERCQy5ub3ROdWxsKGNvbmRpdGlvbikpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZmluZE1hbnkobW9kZWwsIGNvbmRpdGlvbilcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcblxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZ2V0IGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5maW5kTWFueShtb2RlbCwgY29uZGl0aW9uLCB0cmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldEFsbENhY2hlZCggbW9kZWwsIGZpbHRlciwgdHJhY2sgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmV4aXN0cyhtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvdW50IHJlY29yZHMgY291bnQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY291bnQobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBhdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrcyA6IEFycmF5PEJsb2NrSGVhZGVyPiwgIGdldFRyYW5zYWN0aW9uczogKCkgPT4gUHJvbWlzZTxBcnJheTxUcmFuc2FjdGlvbj4+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIGxldCB0cmFuc0dyb3VwID0gbmV3IE1hcDxzdHJpbmcsIEFycmF5PFRyYW5zYWN0aW9uPj4oKVxuICAgIGxldCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBnZXRUcmFuc2FjdGlvbnMoKVxuXG4gICAgdHJhbnNhY3Rpb25zLmZvckVhY2goIHQgPT4ge1xuICAgICAgaWYgKCF0cmFuc0dyb3VwLmhhcyggdC5ibG9ja0lkICkpIHRyYW5zR3JvdXAuc2V0KCB0LmJsb2NrSWQsIG5ldyBBcnJheTxUcmFuc2FjdGlvbj4oKSApXG4gICAgICB0cmFuc0dyb3VwLmdldCggdC5ibG9ja0lkICkhLnB1c2goIHQgKVxuICAgIH0gKVxuXG4gICAgYmxvY2tzLmZvckVhY2goIGIgPT4gYlsndHJhbnNhY3Rpb25zJ10gPSB0cmFuc0dyb3VwLmdldChiLmlkISkgKVxuICAgIHJldHVybiBibG9ja3MgYXMgQXJyYXk8QmxvY2s+XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBoZWlnaHRcbiAgICogQHBhcmFtIGhlaWdodCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SGVpZ2h0KCBoZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgaGVpZ2h0ID4gMCAsICdoZWlnaHQgbXVzdCBncmVhdCB0aGFuIHplcm8nKVxuICAgIFxuICAgIGxldCBjYWNoZWRCbG9jayA9IHRoaXMuY2FjaGVkQmxvY2tzLmdldChoZWlnaHQpXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrKCBoZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgYmxvY2sgaWRcbiAgICogQHBhcmFtIGJsb2NrSWQgYmxvY2sgaWQgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShibG9ja0lkKSlcblxuICAgIGxldCBjYWNoZWRCbG9jayA9IHRoaXMuY2FjaGVkQmxvY2tzLmdldEJ5SWQoIGJsb2NrSWQgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja0J5SWQoIGJsb2NrSWQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGhlaWdodCByYW5nZVxuICAgKiBAcGFyYW0gbWluSGVpZ2h0IG1pbiBoZWlnaHQoaW5jbHVkZWQpXG4gICAqIEBwYXJhbSBtYXhIZWlnaHQgbWF4IGhlaWdodChpbmNsdWRlZClcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQgOiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnbWluSGVpZ2h0LCBtYXhIZWlnaHQnLCBtaW5IZWlnaHQgPiAwICYmIG1heEhlaWdodCA+PSBtaW5IZWlnaHQsICdtaW5IZWlnaHQgb3IgbWF4SGVpZ2h0IGlzIGludmFsaWQnKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQsIG1heEhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgYmxvY2sgaWQgYXJyYXlcbiAgICogQHBhcmFtIGJsb2NrSWRzIGFycmF5IG9mIGJsb2NrIGlkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZHMnLCAoKSA9PiBEQkMubm90TnVsbChibG9ja0lkcykgKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVycyA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUlkcyguLi5ibG9ja0lkcylcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxufSIsImltcG9ydCB7IEVudGl0eSwgIE51bGxhYmxlIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEVudGl0eVRyYWNrZXIsIFByb3hpZWRFbnRpdHlUcmFja2VyIH0gZnJvbSAnLi9FbnRpdHlUcmFja2VyJ1xuXG4vKiogICAgIFxuICogICAgIFNUQVRFIFRSQU5TRkVSICAgICAgICAgICAgICAgICAgQUNUSU9OICAgICAgICAgICAgICAgIFRSQUNLICAgICAgQ0FDSEVcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgICAgPyAgICAgICAgIC0+IHBlcnNpdGVudCAgICAgIHNlc3Npb24ubG9hZCAgICAgICAgICAgICB0cmFjayAgICAgY2FjaGVcbiAqICAgICAgPyAgICAgICAgIC0+IG5ldyAgICAgICAgICAgIHNlc3Npb24uY3JlYXRlICAgICAgICAgICB0cmFjayAgICAgICAtICBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IG1vZGlmaWVkICAgICAgIHNldCBwcm9wZXJ0eSAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBkZWxldGVkICAgICAgICBzZXNzaW9uLmRlbCAgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogbmV3IHwgbW9kaWZpZWQgLT4gcHJlc2lzdGVudCAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGtlZXAgICAgIGNhY2hlfHVwZGF0ZSBcbiAqIGRlbGV0ZWQgICAgICAgIC0+IHRyYW5zaWVudCAgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBldml0ICAgICAgIGV2aXRcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5leHBvcnQgZW51bSBFbnRpdHlTdGF0ZSB7XG4gIFRyYW5zaWVudCAgPSAtMSxcbiAgUGVyc2lzdGVudCA9IDAsXG4gIFxuICBOZXcgICAgICAgID0gMSxcbiAgTW9kaWZpZWQgICA9IDIsXG4gIERlbGV0ZWQgICAgPSAzLFxufVxuXG5leHBvcnQgZW51bSBFbnRpdHlDaGFuZ2VUeXBlIHtcbiAgTmV3ICAgICAgID0gMSxcbiAgTW9kaWZ5ICAgID0gMixcbiAgRGVsZXRlICAgID0gMyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZSB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgb3JpZ2luYWwgOiBhbnlcbiAgY3VycmVudCA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNoYW5nZXMge1xuICBkYlZlcnNpb24gICAgICAgICA6IG51bWJlclxuICB0eXBlICAgICAgICAgICAgICA6IEVudGl0eUNoYW5nZVR5cGVcbiAgcHJvcGVydGllc0NoYW5nZXMgOiBBcnJheTxQcm9wZXJ0eUNoYW5nZT5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlFeHRlbnNpb24ge1xuICBfdmVyc2lvbl8gICAgICA6IG51bWJlclxuICBfX2RldGFjaGVkX18gICA6IGJvb2xlYW5cbiAgX190cmFja2luZ19fICAgOiBib29sZWFuXG4gIF9fc2NoZW1hX18gICAgIDogTW9kZWxTY2hlbWFcbiAgX190cmFja2VyX18gICAgOiBFbnRpdHlUcmFja2VyXG4gIF9fc3RhdGVfXyAgICAgIDogRW50aXR5U3RhdGUgXG4gIF9fdG1wQ2hhbmdlc19fIDogTnVsbGFibGU8RW50aXR5Q2hhbmdlcz5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm94aWVkPFQ+IGV4dGVuZHMgRW50aXR5RXh0ZW5zaW9uIHtcbiAgXG59XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHlQcm94eSB7XG4gIHByaXZhdGUgdHJhY2tlciA6IEVudGl0eVRyYWNrZXI7XG5cbiAgY29uc3RydWN0b3IodHJhY2tlcjogRW50aXR5VHJhY2tlcikge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNFeHRlbmRlZChlbnRpdHk6IEVudGl0eSkge1xuICAgIHJldHVybiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc2NoZW1hX18nKSAmJiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc3RhdGVfXycpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzUHJveGllZChlbnRpdHk6IEVudGl0eSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gRW50aXR5UHJveHkuaXNFeHRlbmRlZChlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbnZlcnRUb1Byb3hpZWQ8VEVudGl0eT4oZW50aXR5OiBFbnRpdHkpIDogUHJveGllZDxURW50aXR5PiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFByb3hpZWQgRW50aXR5YClcbiAgICBcbiAgICByZXR1cm4gZW50aXR5IGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcHJveHlUb0VudGl0eShwcm94aWVkOiBQcm94aWVkPEVudGl0eT4pOiBFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSB7fVxuICAgIGZvciggbGV0IGsgaW4gcHJveGllZCApIHtcbiAgICAgIGlmICggRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrKSApIGVudGl0eVtrXSA9IHByb3hpZWRba11cbiAgICB9XG4gICAgcmV0dXJuIGVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc05vcm1hbFByb3BlcnR5KHByb3BlcnR5TmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiBwcm9wZXJ0eU5hbWUgJiYgKCFwcm9wZXJ0eU5hbWUuc3RhcnRzV2l0aCgnX18nKSAmJiAhcHJvcGVydHlOYW1lLmVuZHNXaXRoKCdfXycpKVxuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaEV4dGVuZFByb3BlcnRpZXM8VEVudGl0eT4oZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBzdGF0ZTogRW50aXR5U3RhdGUgKSA6IFRFbnRpdHkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgIF92ZXJzaW9uXyAgICAgIDogZW50aXR5WydfdmVyc2lvbl8nXSB8fCAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fdG1wQ2hhbmdlc19fIDogbnVsbFxuICAgIH0sIGVudGl0eSlcbiAgfVxuXG4gIHByb3RlY3RlZCBvblByb3BlcnR5U2V0KGVudGl0eTogRW50aXR5LCBwcm9wZXJ0eU5hbWU6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSA6IGJvb2xlYW4geyAgICAgIFxuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZS50b1N0cmluZygpXG5cbiAgICBpZiAoICFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KG5hbWUpIHx8ICFleHQuX190cmFja2luZ19fICB8fCB2YWx1ZSA9PT0gZW50aXR5W3Byb3BlcnR5TmFtZV0gKSB7XG4gICAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcm9wZXJ0eSBhZnRlciBkZWxldGVkYClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3NjaGVtYV9fLmlzUmVhZG9ubHkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHJlYWRvbmx5IG1vZGVsICcke2V4dC5fX3NjaGVtYV9fLm1vZGVsTmFtZX0nYClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3NjaGVtYV9fLmtleUZpZWxkcy5pbmRleE9mKG5hbWUpID49IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByaW1hcnkgZmllbGQgcHJvcGVydHlgKVxuICAgIH1cblxuICAgIGlmICggZXh0Ll9fZGV0YWNoZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyKS5hdHRhY2goIHJlY2VpdmVyIGFzIFByb3hpZWQ8YW55PiApXG4gICAgICBleHQuX19kZXRhY2hlZF9fID0gZmFsc2VcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBleHQuX190bXBDaGFuZ2VzX18gPSB7ICAgICAgICBcbiAgICAgICAgdHlwZSA6IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5LCAgICAgICAgXG4gICAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyxcbiAgICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KHsgXG4gICAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgICB9XG5cbiAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgKTogUHJveGllZDxURW50aXR5PiB7XG4gICAgbGV0IGV4dGVuZGVkID0gIHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyhlbnRpdHksIHNjaGVtYSwgRW50aXR5U3RhdGUuUGVyc2lzdGVudCApXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnO1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJztcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlQcm94eSwgUHJvcGVydHlDaGFuZ2UsIFByb3hpZWQsIEVudGl0eVN0YXRlLCBFbnRpdHlDaGFuZ2VUeXBlIH0gZnJvbSAnLi9FbnRpdHlQcm94eSdcbmltcG9ydCB7IFNxbEFuZFBhcmFtZXRlcnMsIFNxbEJ1aWxkZXIgfSBmcm9tICcuLi9TUUxEQi9TcWxCdWlsZGVyJ1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcykgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbn1cblxuLy8gZXhwb3J0IGNsYXNzIE1vZGVsQW5kS2V5IHtcbi8vICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbW9kZWxBbmRLZXlTZXBhcmF0b3IgPSAnISMhJ1xuXG4vLyAgIHByaXZhdGUgbW9kZWxOYW1lIDogc3RyaW5nXG4vLyAgIHByaXZhdGUgZW50aXR5S2V5IDogRW50aXR5S2V5XG5cbi8vICAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkge1xuLy8gICAgIHRoaXMubW9kZWxOYW1lID0gbW9kZWxcbi8vICAgICB0aGlzLmVudGl0eUtleSA9IGtleVxuLy8gICB9XG5cbi8vICAgcHVibGljIGdldCBtb2RlbCgpIHsgcmV0dXJuIHRoaXMubW9kZWxOYW1lIH1cbi8vICAgcHVibGljIGdldCBrZXkoKSB7IHJldHVybiB0aGlzLmVudGl0eUtleSB9XG5cbi8vICAgcHVibGljIHRvU3RyaW5nKCkge1xuLy8gICAgIHJldHVybiBcbi8vICAgfVxuLy8gfVxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcblxuZXhwb3J0IHR5cGUgRW50aXR5Q2hhbmdlc0l0ZW0gPSB7IG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXksIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5cbmV4cG9ydCBjbGFzcyBQcm94aWVkRW50aXR5VHJhY2tlciBpbXBsZW1lbnRzIEVudGl0eVRyYWNrZXIge1xuICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBtb2RlbEFuZEtleVNlcGFyYXRvciA9ICchIyEnXG4gIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgaGlzdG9yeSA6IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+XG4gIHByaXZhdGUgYWxsVHJhY2tpbmdFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IGtleVN0cmluZyA9IHNjaGVtYS5pc0NvbXBzaXRlS2V5ID8gKCBrZXkgYXMgQ29tcG9zaXRlS2V5ICkua2V5IDogU3RyaW5nKGtleSkgXG4gICAgcmV0dXJuIGAke3NjaGVtYS5tb2RlbE5hbWV9JHtQcm94aWVkRW50aXR5VHJhY2tlci5tb2RlbEFuZEtleVNlcGFyYXRvcn0hISR7a2V5U3RyaW5nfWBcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogYW55IH0ge1xuICAgIGNvbnN0IGFycmF5ID0gIG1vZGVsQW5kS2V5LnNwbGl0KFByb3hpZWRFbnRpdHlUcmFja2VyLm1vZGVsQW5kS2V5U2VwYXJhdG9yKVxuICAgIHJldHVybiB7IG1vZGVsIDogYXJyYXlbMF0sIGtleTogYXJyYXlbMV0gfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEhpc3RvcnlCeVZlcnNpb24oIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UgKTogTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCF0aGlzLmhpc3RvcnkuaGFzKGhpc3RvcnlWZXJzaW9uKSAmJiBjcmVhdGVJZk5vdEV4aXN0cyApXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KGhpc3RvcnlWZXJzaW9uLCBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpKVxuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5nZXQoaGlzdG9yeVZlcnNpb24pIVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldE1vZGVsQW5kS2V5KCBwZTogUHJveGllZDxhbnk+ICk6IE1vZGVsQW5kS2V5IHtcbiAgICByZXR1cm4gdGhpcy5tYWtlTW9kZWxBbmRLZXkocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgY2hhbmdlczogRW50aXR5Q2hhbmdlcywgaGlzdG9yeVZlcnNpb246IG51bWJlciApIDogdm9pZCB7XG4gICAgdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKGhpc3RvcnlWZXJzaW9uLCB0cnVlKS5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4gKTogdm9pZCB7XG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYXR0YWNoSGlzdG9yeSBoaXN0b3J5IGluZm8gPSAke0pTT04uc3RyaW5naWZ5KHRoaXMuaGlzdG9yeVZlcnNpb24pfWApXG5cbiAgICBoaXN0b3J5LmZvckVhY2goIChjaGFuZ2VzLCB2ZXJzaW9uKSA9PiB7XG4gICAgICBsZXQgY2hhbmdlc01hcCA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KClcbiAgICAgIGNoYW5nZXMuZm9yRWFjaCggYyA9PiBjaGFuZ2VzTWFwLnNldCggYy5tb2RlbEFuZEtleSwgYy5jaGFuZ2VzISApKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldCh2ZXJzaW9uLCBjaGFuZ2VzTWFwIClcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMubG9nLmluZm9FbmFibGVkKSB7XG4gICAgICBsZXQgaGVpZ2h0SW5mbyA9IG5ldyBBcnJheTxudW1iZXI+KClcbiAgICAgIGhpc3RvcnkuZm9yRWFjaCggKGMsIGgpID0+IGhlaWdodEluZm8ucHVzaChoKSApXG4gICAgICB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIGF0dGFjaEhpc3RvcnkgaGVpZ2h0ID0gJHtKU09OLnN0cmluZ2lmeShoZWlnaHRJbmZvKX1gKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbjogdGhpcy5taW5WZXJzaW9uLCBtYXg6IHRoaXMuY3VycmVudFZlcnNpb24gfVxuICB9XG5cbiAgcHVibGljIGF0dGFjaCggcGU6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIHBlKVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0TGFzdENoYW5nZXMoIHBlOiBQcm94aWVkPGFueT4gKSA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzRGlydHkocGUpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IFxuICAgICAgICByZXR1cm4gcGUuX190bXBDaGFuZ2VzX18hXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgbGV0IHRtcFZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG5cbiAgICB3aGlsZSAoIHRtcFZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0bXBWZXJzaW9uKVxuICAgICAgaGlzdG9yeSAmJiByZXN1bHQucHVzaChoaXN0b3J5KSAgICAgIFxuICAgICAgdG1wVmVyc2lvbi0tXG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSApXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWQge1xuICAgIGxldCBwcm94aWVkID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpXG4gICAgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH0gXG4gICAgZWxzZSBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgICAgLy8gVE9ETzog5YWI5L+u5pS55YaN5Yig6Zmk77yM6ZyA6KaB5oGi5aSN5Yiw5LuA5LmI54q25oCB77yfXG4gICAgICBwcm94aWVkLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IGVudGl0eTogcGUsIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMoZW50aXR5OiBFbnRpdHksIGRiVmVyc2lvbjogbnVtYmVyLCBpc05ldyA9IHRydWUpIDogRW50aXR5Q2hhbmdlcyB7XG4gICAgbGV0IHByb3Blcml0ZXNDaGFuZ2UgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHkpIHtcbiAgICAgIGlmICghRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrZXkpKSBjb250aW51ZVxuICAgICAgcHJvcGVyaXRlc0NoYW5nZS5wdXNoKCBpc05ldyA/IFxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IG51bGwsIGN1cnJlbnQ6IGVudGl0eVtrZXldIH0gOlxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IGVudGl0eVtrZXldLCBjdXJyZW50OiAgbnVsbCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fdG1wQ2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fdG1wQ2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBwZS5fX3NjaGVtYV9fXG4gICAgICBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCkgXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpLCBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSApXG4gICAgICBlbHNlIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQpXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSlcbiAgICAgIC8vIGVsc2UgJ3RyYW5zaWVudCcgfCAncGVyc2lzdGVudCcgZG8gbm90aGluZ1xuICAgICAgdGhpcy5tYXJrU3RhdGVBbmRTYXZlSGlzdG9yeShwZSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uID0gaGlzdG9yeVZlcnNpb25cbiAgICAgIHBlLl9fZGV0YWNoZWRfXyA9IHRydWVcbiAgICB9KSAgXG4gICAgXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLm1pblZlcnNpb24gPSB0aGlzLm1pblZlcnNpb24gPT09IC0xID8gaGlzdG9yeVZlcnNpb24gOiB0aGlzLm1pblZlcnNpb25cbiAgICBcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuICB9XG4gIFxuICBwcm90ZWN0ZWQgcm9sbGJhY2tDYWNoZUNoYW5nZXMoIG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzICk6IHZvaWQge1xuICAgIHN3aXRjaChjaGFuZ2VzLnR5cGUpIHtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KG1vZGVsLCBrZXkpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OlxuICAgICAgICBsZXQgZSA9IHRoaXMuY2FjaGUuZ2V0KCBtb2RlbCwga2V5IClcbiAgICAgICAgaWYgKCBlID09PSB1bmRlZmluZWQgKSByZXR1cm5cbiAgICAgICAgY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IGUhW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGUgKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTogXG4gICAgICAgIGNvbnN0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KCBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjID0+IGMubmFtZSwgYyA9PiBjLm9yaWdpbmFsKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZW50aXR5IClcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gcGVbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IHRydWVcbiAgICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OlxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGByZWplY3RDaGFuZ2VzIFZlcnNpb24gPSA/YClcbiAgfVxuICBcbiAgcHVibGljIHJvbGxiYWNrQ2hhbmdlcyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMucmVqZWN0Q2hhbmdlcygpXG4gICAgd2hpbGUoIGhpc3RvcnlWZXJzaW9uIDw9IHRoaXMuY3VycmVudFZlcnNpb24gKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzTWFwID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgICBjaGFuZ2VzTWFwICYmIGNoYW5nZXNNYXAuZm9yRWFjaCggKCBjaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5ICkgXG4gICAgICAgIHRoaXMucm9sbGJhY2tDYWNoZUNoYW5nZXMobWsubW9kZWwsIG1rLmtleSwgY2hhbmdlcylcbiAgICAgIH0pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uIC0tXG4gICAgfVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHBlLl9fZGV0YWNoZWRfXyA9IHRydWUpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSBNYXRoLm1pbih0aGlzLm1pblZlcnNpb24sIHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuY3VycmVudFZlcnNpb259YClcbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnkoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkge1xuICAgIGlmICggdGhpcy5taW5WZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uIHx8IHRoaXMuY3VycmVudFZlcnNpb24gPCBoaXN0b3J5VmVyc2lvbiApIHJldHVyblxuICAgIGZvciggbGV0IHZlciA9IHRoaXMubWluVmVyc2lvbjsgdmVyIDwgaGlzdG9yeVZlcnNpb247IHZlcisrICkge1xuICAgICAgdGhpcy5oaXN0b3J5LmRlbGV0ZSh2ZXIpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkdW1wQ2hhbmdlcyggZWM6IEVudGl0eUNoYW5nZXMgKTogc3RyaW5nIHtcbiAgICBsZXQgcHJvcGVydHlDaGFuZ2VzID0gJydcbiAgICBlYy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKHBjID0+IHByb3BlcnR5Q2hhbmdlcyArPSBgJHtwYy5uYW1lfTogJHtwYy5vcmlnaW5hbH0gLT4gJHtwYy5jdXJyZW50fSwgYClcblxuICAgIHJldHVybiBgZGJWZXJzaW9uPSR7ZWMuZGJWZXJzaW9ufSwgdHlwZT0ke2VjLnR5cGV9LCBbJHtwcm9wZXJ0eUNoYW5nZXN9XWBcbiAgfVxuXG4gIHB1YmxpYyBkdW1wSGlzdG9yeSgpIDogc3RyaW5nIHtcbiAgICBsZXQgdmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIEhJU1RPUlkgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHdoaWxlKCB2ZXJzaW9uID49IHRoaXMubWluVmVyc2lvbiApIHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS12ZXJzaW9uICR7dmVyc2lvbn0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGxldCBoaXMgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oIHZlcnNpb24gKVxuICAgICAgaGlzICYmIGhpcy5mb3JFYWNoKCAoIGVjLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmR1bXBDaGFuZ2VzKCBlYyApXG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICAgIGNvbnN0IG1zZyA9IGB0eXBlPSR7bWsubW9kZWx9LCBrZXk9JHttay5rZXl9LCBjaGFuZ2VzPXske2NoYW5nZXN9fSBcXG5gXG4gICAgICAgIHJlc3VsdCArPSBtc2dcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICAgIHZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhY2tlclNxbEJ1aWxkZXIge1xuICBwcml2YXRlIHRyYWNrZXI6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXIsIG1vZGVscyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPiwgc3FsQnVpbGRlcjogU3FsQnVpbGRlciApIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5tb2RlbHMgPSBtb2RlbHNcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBzcWxCdWlsZGVyXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQgZW50aXR5VHJhY2tlcigpIHsgcmV0dXJuIHRoaXMudHJhY2tlciB9XG5cbiAgcHVibGljIGJ1aWxkQ2hhbmdlU3FscygpIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5kZXRlY3RDaGFuZ2VzKCkuZm9yRWFjaCggZWMgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKGVjLmVudGl0eSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkU3FsQW5kUGFyYW1ldGVycyhwZSA6UHJveGllZDxhbnk+KSA6IFNxbEFuZFBhcmFtZXRlcnMge1xuICAgIGNvbnN0IGVudGl0eSA9IEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpXG4gICAgXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBlbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==