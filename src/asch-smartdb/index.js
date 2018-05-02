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
            cache && this.entityCache.put(schema.modelName, e, schema.getKey(e));
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
    findMany(model, condition, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, condition);
            let entities = yield this.connection.query(sql.query, sql.parameters);
            return !track ? entities :
                this.trackPersistentEntities(schema, entities);
        });
    }
    query(model, condition, fields, limit, offset, sort, join) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            const sql = this.sqlBuilder.buildSelect(schema, schema.fieldNames, condition, limit, offset, sort, join);
            return yield this.connection.query(sql.query, sql.parameters);
        });
    }
    exists(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            let { query, parameters } = this.sqlBuilder.buildSelect(schema, [], condition);
            query = `select exists(${query}) as exist`;
            const ret = yield this.connection.query(query, parameters);
            return util_1.isArray(ret) && parseInt(ret[0]['exist']) > 0;
        });
    }
    count(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            let ret = yield this.query(model, condition, ['count(*) as count']);
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
            this.sessionCache.put(modelName, entity, key);
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
                yield this.connection.executeBatchSync(...sqls);
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
                for (const sql of sqls)
                    yield this.connection.execute(sql.query, sql.parameters);
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
    put(modelName, entity, key) {
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
    buildSelect(schema, fields, where, limit, offset, sort, join) {
        const tableName = this.getTableName(schema.modelName);
        fields = fields || schema.fieldNames.map(f => schema.schemaObject.table + '.' + f);
        let queryOptions = {
            type: 'select',
            table: tableName,
            fields: fields,
            condition: where,
            limit: limit,
            offset: offset,
            sort: sort,
            join: join
        };
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
    executeBatchSync(...sqls) {
        return this.sqlite.executeBatch(sqls || [], this.ensureExecuteEffected);
    }
    executeBatch(...sqls) {
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
            this.log.traceEnabled && this.log.trace(`SUCCESS execute sql = ${sql}, param = ${JSON.stringify(parameters)}, effected = ${ret.result.rowsEffected}`);
        }
        catch (err) {
            ret.err = err;
            this.log.errorEnaled && this.log.error(`FAILD execute sql = ${sql}, param = ${JSON.stringify(parameters)}`, err);
        }
        callback && callback(ret.err, ret.result);
        return ret.result;
    }
    query(sql, parameters, callback) {
        let ret = { err: null, result: new Array() };
        try {
            ret.result = this.db.prepare(sql).all(parameters || []);
            this.log.traceEnabled && this.log.trace(`SUCCESS query sql = ${sql}, param = ${JSON.stringify(parameters)}, result count = ${ret.result.length}`);
        }
        catch (err) {
            ret.err = err;
            this.log.errorEnaled && this.log.error(`FAILD query sql = ${sql}, param = ${JSON.stringify(parameters)}`, err);
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
            this.log.errorEnaled && this.log.error(`FAILD executeBatch, sql = ${sql.query}, param = ${JSON.stringify(sql.parameters)}`, err);
        }
        callback && callback(null, ret.result);
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
        return util_1.promisify(this.executeBatch).call(this, ...sqls, onExecuted);
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
const Common_1 = __webpack_require__(/*! ./Common */ "./src/Common.ts");
const LevelBlock_1 = __webpack_require__(/*! ./LevelBlock */ "./src/LevelBlock.ts");
const DbSession_1 = __webpack_require__(/*! ./DbSession */ "./src/DbSession.ts");
const SqliteConnection_1 = __webpack_require__(/*! ./SQLDB/SqliteConnection */ "./src/SQLDB/SqliteConnection.ts");
const Log_1 = __webpack_require__(/*! ./Log */ "./src/Log.ts");
const EntityProxy_1 = __webpack_require__(/*! ./StateTracker/EntityProxy */ "./src/StateTracker/EntityProxy.ts");
const events_1 = __webpack_require__(/*! events */ "events");
const util_1 = __webpack_require__(/*! util */ "util");
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
                    yield session.findAll(schema.modelName);
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
                if (from < ver.min) // load history from leveldb, if cached history less than rollback height 
                    this.blockSession.attachHistory(yield this.blockDB.getHistoryChanges(from, ver.min - 1));
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
     * create a new entity which change will be tracked and persistented (by saveChanges) automatically
     * @param model modelName or model type
     * @param key entity key which uniqued in database
     * @param entity prototype entity which properties will copy to result entity
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
        Common_1.CodeContract.argument('entity', entity && EntityProxy_1.EntityProxy.isProxied(entity), `is not a proxied object`);
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
     * @param condition find condition, see type SqlCondition
     * @param track track and cache result if true
     */
    findMany(model, condition, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).findMany(model, condition, track);
        });
    }
    /**
     * query entities from database
     * @param model model name or model type
     * @param condition query condition, see type SqlCondition
     * @param limit limit of result count
     * @param sort sort
     * @param fields result fields, default is all fields
     * @param offset offset of result set
     * @param join join info
     */
    query(model, condition, limit, sort, fields, offset, join) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).query(model, condition, fields, limit, offset, sort, join);
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
    /**
     * last persisted block height
     */
    getLastBlockHeight() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.blockDB.getLastBlockHeight();
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
            return yield this.attachTransactions(blockHeaders, () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { $in: { blockId: blockHeaders.map(b => b.id) } }); }));
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
            return yield this.attachTransactions(blockHeaders, () => __awaiter(this, void 0, void 0, function* () { return yield this.blockSession.query('Transaction', { $in: { blockId: blockHeaders.map(b => b.id) } }); }));
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
        let keyString = schema.isCompsiteKey ? key.key : key.toString();
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
                this.cache.put(schema.modelName, EntityProxy_1.EntityProxy.proxyToEntity(pe), schema.getKey(pe));
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
                this.cache.put(model, e, key);
                break;
            case EntityProxy_1.EntityChangeType.Delete:
                const entity = Common_1.makeJsonObject(changes.propertiesChanges, c => c.name, c => c.original);
                this.cache.put(model, entity, key);
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
        this.log.traceEnabled && this.log.trace(`BEGIN rollbackChanges Version : ${from} -> ${this.historyVersion}`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUM7UUFDdEIsY0FBUyxHQUFZLENBQUM7UUFJNUIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjO0lBQ3RDLENBQUM7SUFFTSxRQUFRLENBQUUsTUFBYztRQUM3QixPQUFPLE1BQU0sR0FB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Q0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3hDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsTUFBTSxDQUFFO1FBQzVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQ3pDLENBQUM7SUFFTSxLQUFLLENBQUUsR0FBVyxFQUFFLEdBQUcsTUFBYTtRQUN6QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBRTtRQUM3RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBRTtJQUMxQyxDQUFDO0lBRU0sR0FBRyxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDdkMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxLQUFLLENBQUU7UUFDM0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDMUMsQ0FBQztJQUVNLEtBQUssQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3pDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQzFDLENBQUM7SUFFTSxJQUFJLENBQUUsR0FB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LHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFMUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1FBQzFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFlBQVksQ0FBVyxLQUFnQyxFQUFFLE1BQWlDLEVBQUcsS0FBSyxHQUFHLEtBQUs7UUFDL0cscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsWUFBWSxDQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFFO0lBQ3RFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNVLFFBQVEsQ0FBVyxLQUFnQyxFQUFFLFNBQXVCLEVBQUUsS0FBSyxHQUFHLEtBQUs7O1lBQ3RHLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7WUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsUUFB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QixDQUFDLE1BQU07b0JBQzFCLElBQUksTUFBTSxHQUFHLHVCQUFjLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDeEYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQUs7YUFDUjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNO0lBQ2YsQ0FBQztDQUVGO0FBN0RELDhDQTZEQzs7Ozs7Ozs7Ozs7O0FDdGFELDJDOzs7Ozs7Ozs7OztBQ0FBLHdDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHNDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6ImFzY2gtc21hcnRkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5kZXgudHNcIik7XG4iLCJpbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJ1xuXG5leHBvcnQgY2xhc3MgQmxvY2tDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KClcbiAgcHJpdmF0ZSBtaW5IZWlnaHQgOiBudW1iZXIgPSAwXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gMFxuICBwcml2YXRlIG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgYmxvY2suaGVpZ2h0ICE9PSB0aGlzLm1heEhlaWdodCArIDEgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICgnaW52YWxpZCBibG9jayBoZWlnaHQnKVxuXG4gICAgdGhpcy5jYWNoZS5zZXQoIGJsb2NrLmhlaWdodCwgYmxvY2sgKVxuICAgIHRoaXMubWF4SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gICAgXG4gICAgaWYgKCB0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhDYWNoZWRDb3VudCApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKCB0aGlzLm1pbkhlaWdodCsrIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0KCBoZWlnaHQ6IG51bWJlciApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoaGVpZ2h0KVxuICB9XG5cbiAgcHVibGljIGdldEJ5SWQoIGlkOiBzdHJpbmcgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgZm9yKCBjb25zdCBiIG9mIHRoaXMuY2FjaGUudmFsdWVzKCkgKSB7XG4gICAgICBpZiAoIGIuaWQhID09PSBpZCApIHJldHVybiBiXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBldml0KCBmcm9tSGVpZ2h0OiBudW1iZXIsIHRvSGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgbGV0IG1pbiA9IE1hdGgubWluKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgbGV0IG1heCA9IE1hdGgubWF4KCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgaWYgKCBtaW4gPiB0aGlzLm1heEhlaWdodCB8fCBtYXggPCB0aGlzLm1pbkhlaWdodCApIHJldHVybiBcbiAgICBcbiAgICBtaW4gPSBNYXRoLm1heCggbWluLCB0aGlzLm1pbkhlaWdodCApXG4gICAgbWF4ID0gTWF0aC5taW4oIG1heCwgdGhpcy5taW5IZWlnaHQgKVxuICAgIGZvciAoIGxldCBoZWlnaHQgPSBtaW47IGhlaWdodCA8PSBtYXg7IGhlaWdodCsrICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoaGVpZ2h0KVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBLZXlPYmplY3QgPSB7IFxuICBrZXkgOiBzdHJpbmcsXG4gIGtleVBhcnQgKG5hbWU6IHN0cmluZykgOiBzdHJpbmcgfCBudW1iZXIgXG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSB7XG4gIGxldCByZXQgPSB7fVxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG4gICAgcmV0W2dldEtleShpdGVtKV0gPSBnZXRWYWx1ZShpdGVtKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciggbWVzc2FnZSA6IHN0cmluZyApIHtcbiAgICBzdXBlciggJ0NvZGUgY29udHJhY3QgRXJyb3IsJysgbWVzc2FnZSApXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29udHJhY3RDb25kaXRpb24gPSBib29sZWFuIHwgKCAoKSA9PiBib29sZWFuIClcbmV4cG9ydCB0eXBlIENvbnRyYWN0TWVzc2FnZSAgID0gc3RyaW5nICB8ICggKCkgPT4gc3RyaW5nIClcblxuZXhwb3J0IHR5cGUgTWF5YmVVbmRlZmluZWQ8VD4gPSBUIHwgdW5kZWZpbmVkXG5leHBvcnQgdHlwZSBOdWxsYWJsZTxUPiA9IFQgfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0VmVyaWZ5UmVzdWx0ID0geyByZXN1bHQgOiBib29sZWFuLCBtZXNzYWdlOiBOdWxsYWJsZTxzdHJpbmc+IH0gXG5leHBvcnQgdHlwZSBWZXJpZnlGdW5jdGlvbiA9ICgpID0+IENvbnRyYWN0VmVyaWZ5UmVzdWx0XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3Qge1xuICBwdWJsaWMgc3RhdGljIHZlcmlmeSggY29uZGl0aW9uOiBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSA6IENvbnRyYWN0TWVzc2FnZSApIDogdm9pZCB7XG4gICAgaWYgKCBjb25kaXRpb24gPT09IHVuZGVmaW5lZCB8fCBjb25kaXRpb24gPT09IG51bGwgKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyaWZ5IGNvbmRpdGlvbicpXG5cbiAgICBjb25zdCBjb25kID0gaXNGdW5jdGlvbihjb25kaXRpb24pID8gKGNvbmRpdGlvbiBhcyBGdW5jdGlvbikoKSA6IGNvbmRpdGlvblxuICAgIGNvbnN0IG1zZyA9IGlzRnVuY3Rpb24obWVzc2FnZSkgPyAobWVzc2FnZSBhcyBGdW5jdGlvbikoKSA6IG1lc3NhZ2VcblxuICAgIGlmICghY29uZCkgdGhyb3cgbmV3IENvZGVDb250cmFjdEVycm9yKCBtc2cgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhcmd1bWVudCggYXJnTmFtZTogc3RyaW5nLCB2ZXJpZnk6IFZlcmlmeUZ1bmN0aW9uIHwgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2U/IDogQ29udHJhY3RNZXNzYWdlICk6IHZvaWQge1xuICAgIGlmICggIWFyZ05hbWUgfHwgIXZlcmlmeSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcmdOYW1lIG9yIHZlcmlmeSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgaWYgKCAhbWVzc2FnZSApIHtcbiAgICAgIGNvbnN0IHZyID0gICh2ZXJpZnkgYXMgVmVyaWZ5RnVuY3Rpb24pKClcbiAgICAgIENvZGVDb250cmFjdC52ZXJpZnkoIHZyLnJlc3VsdCwgYGFyZ3VtZW50ICcke2FyZ05hbWV9JyAke3ZyLm1lc3NhZ2V9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIENvZGVDb250cmFjdC52ZXJpZnkodmVyaWZ5IGFzIENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlISkgICAgXG4gIH1cblxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbCggYXJnIDogYW55ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXJnICE9PSBudWxsICYmIGFyZyAhPT0gdW5kZWZpbmVkXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yRW1wdHkoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsKHN0cikgJiYgc3RyICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIGVtcHR5J1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPcldoaXRlc3BhY2UoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsT3JFbXB0eSggc3RyICkgJiYgKCBzdHIgYXMgc3RyaW5nICkudHJpbSgpICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIHdoaXRlc3BhY2UnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG59XG5cblxuIiwiaW1wb3J0IHsgRW50aXR5Q2FjaGUsIExSVUVudGl0eUNhY2hlLCBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEVudGl0eSwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFByb3hpZWRFbnRpdHlUcmFja2VyLCBUcmFja2VyU3FsQnVpbGRlciwgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5RXh0ZW5zaW9uIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTYXZlSGlzdG9yeUFjdGlvbiA9ICggdmVyc2lvbjogbnVtYmVyLCBoaXN0b3J5OiBNYXA8c3RyaW5nLCBFbnRpdHlDaGFuZ2VzPiApID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIERiU2Vzc2lvbiB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY29ubmVjdGlvbjogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzZXNzaW9uQ2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIHNxbEJ1aWxkZXIgOiBKc29uU3FsQnVpbGRlclxuICBwcml2YXRlIHRyYWNrZXJTcWxCdWlsZGVyOiBUcmFja2VyU3FsQnVpbGRlclxuICBwcml2YXRlIGVudGl0eVRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIHNlc3Npb25TZXJpYWwgOiBudW1iZXJcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24sIGNhY2hlT3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucywgc2Vzc2lvbk5hbWU/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBEYlNlc3Npb24ubmFtZSArICggc2Vzc2lvbk5hbWUgPT09IHVuZGVmaW5lZCA/ICcnIDogYF8ke3Nlc3Npb25OYW1lfWApICApXG4gICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gMFxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSlcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucnVuU2NyaXB0KHNxbClcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNjaGVtYSguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IHZvaWQge1xuICAgIHNjaGVtYXMuZm9yRWFjaCggcyA9PiB0aGlzLm1vZGVscy5zZXQocy5tb2RlbE5hbWUsIHMpIClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtb2RlbE5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5Q2xhc3M8VEVudGl0eT4oY2xheno6IENvbnN0cnVjdG9yPFRFbnRpdHk+KSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQoY2xhenoubmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHtjbGF6ei5uYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiApIHtcbiAgICByZXR1cm4gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWwpIDogXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5Q2xhc3MobW9kZWwpXG4gIH1cblxuICBwcm90ZWN0ZWQgbWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5KCB7fSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCB0cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgIGVudGl0aWVzIDogQXJyYXk8VEVudGl0eT4sIGNhY2hlID0gdHJ1ZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlKSApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgZSAsIHNjaGVtYS5nZXRLZXkoZSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0KGNsZWFyQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuc3RvcFRyYWNrQWxsKClcbiAgICBpZiAoIGNsZWFyQ2FjaGUgKSB0aGlzLmVudGl0eUNhY2hlLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZXNldCggdHJ1ZSApXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwgZmlsdGVyICkgfHwgW11cblxuICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSB7XG4gICAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSApIHx8IFtdXG4gICAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBhd2FpdCB0aGlzLmZpbmRNYW55KCBtb2RlbCwgeyB9LCB0cmFjayApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZmluZE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24pXG4gICAgXG4gICAgbGV0IGVudGl0aWVzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgcmV0dXJuICF0cmFjayA/IGVudGl0aWVzIDpcbiAgICAgIHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgZmllbGRzPzogQXJyYXk8c3RyaW5nPiwgbGltaXQ/IDogbnVtYmVyICwgb2Zmc2V0PyA6IG51bWJlciwgc29ydD8gOiBKc29uT2JqZWN0LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uLCBsaW1pdCwgb2Zmc2V0LCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeX0pIGFzIGV4aXN0YFxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeSggcXVlcnksIHBhcmFtZXRlcnMgKVxuICAgIFxuICAgIHJldHVybiBpc0FycmF5KHJldCkgJiYgcGFyc2VJbnQocmV0WzBdWydleGlzdCddKSA+IDAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCByZXQgPSBhd2FpdCB0aGlzLnF1ZXJ5KCBtb2RlbCwgY29uZGl0aW9uLCBbJ2NvdW50KCopIGFzIGNvdW50J10gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgZXhpc3RzID0gdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKHNjaGVtYS5tb2RlbE5hbWUsIGtleSkgfHwgdGhpcy5lbnRpdHlUcmFja2VyLmlzVHJhY2tpbmcoc2NoZW1hLCB0aGVFbnRpdHkpXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nICkgYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXkgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGVudGl0eSEsIGtleSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KHNjaGVtYSwga2V5KVxuICAgIGlmICggcGUgKSByZXR1cm4gcGUgYXMgRW50aXR5IGFzIFRFbnRpdHlcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldChtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlbnRpdHkpIGFzIFRFbnRpdHkgXG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIHNhdmVDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUNoYW5nZXMoc2VyaWFsPyA6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJldFNlcmlhbCA9IHNlcmlhbCB8fCArK3RoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRDaGFuZ2VTcWxzKClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaFN5bmMoIC4uLnNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8IHNlcmlhbCApIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcblxuICAgIGNvbnN0IGZyb20gPSB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyAoIHNlcmlhbCA9ICR7c2VyaWFsfSApYClcblxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKHNlcmlhbClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkgeyAgICAgIFxuICAgICAgZm9yIChjb25zdCBzcWwgb2Ygc3FscykgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbCAtIDFcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc1ByaW1pdGl2ZSB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+XG4gIHB1dChtb2RlbE5hbWU6IHN0cmluZywgZW50aXR5OiBFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiB2b2lkXG4gIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWRcbiAgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuICBcbn1cblxuZXhwb3J0IGNsYXNzIExSVUVudGl0eUNhY2hlIGltcGxlbWVudHMgRW50aXR5Q2FjaGUge1xuICBwcml2YXRlIHN0YXRpYyBNSU5fQ0FDSEVEX0NPVU5UID0gMTAwXG4gIHByaXZhdGUgc3RhdGljIERFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UID0gMTAwMDBcblxuICBwcml2YXRlIG9wdGlvbnM6IEVudGl0eUNhY2hlT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIG1vZGVsQ2FjaGVzIDogTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHsgZGVmYXVsdCA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UIH1cbiAgICAvLyBmb3IoIGxldCBrIGluIHRoaXMub3B0aW9ucyApIFxuICAgIC8vICAgdGhpcy5vcHRpb25zW2tdID0gaXNOdW1iZXIodGhpcy5vcHRpb25zW2tdKSA/IHRoaXMub3B0aW9uc1trXSA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKExSVUVudGl0eUNhY2hlLm5hbWUpXG4gICAgdGhpcy5tb2RlbENhY2hlcyA9IG5ldyBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PigpXG4gIH1cblxuICBwcml2YXRlIGdldE1vZGVsQ2FjaGUobW9kZWxOYW1lIDogc3RyaW5nLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlLCB0aHJvd0lmTm90RXhpc3RzID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TFJVLkNhY2hlPEVudGl0eUtleSwgRW50aXR5Pj4ge1xuICAgIGlmICggY3JlYXRlSWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIHsgXG4gICAgICAvLyBjb25zdCBvcHRpb25zID0ge1xuICAgICAgLy8gICBtYXg6IDUwMCxcbiAgICAgIC8vICAgbGVuZ3RoOiBmdW5jdGlvbiAobiwga2V5KSB7IHJldHVybiBuICogMiArIGtleS5sZW5ndGggfSxcbiAgICAgIC8vICAgLy9kaXNwb3NlOiBmdW5jdGlvbiAoa2V5LCBuKSB7IG4uY2xvc2UoKSB9LFxuICAgICAgLy8gICBtYXhBZ2U6IDEwMDAgKiA2MCAqIDYwIFxuICAgICAgLy8gfVxuICAgICAgbGV0IG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuICAgICAgaWYgKCAhdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KG1vZGVsTmFtZSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdFxuICAgICAgZWxzZSBpZiAoIGlzTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IE51bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSlcbiAgICAgIGVsc2UgaWYgKCBpc0Z1bmN0aW9uKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSlcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSAoIHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdIGFzIChtb2RlbCk9PiBudW1iZXIgKSggbW9kZWxOYW1lIClcbiAgICAgIGVsc2UgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgICAgbWF4Q2FjaGVkQ291bnQgPSBNYXRoLm1heCggTFJVRW50aXR5Q2FjaGUuTUlOX0NBQ0hFRF9DT1VOVCwgbWF4Q2FjaGVkQ291bnQgKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5zZXQobW9kZWxOYW1lLCBuZXcgTFJVPHN0cmluZywgRW50aXR5PiggbWF4Q2FjaGVkQ291bnQgKSApXG4gICAgfVxuICAgICBpZiAoIHRocm93SWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIFxuICAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kZWwgY2FjaGUgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKSAgZG9lcyBub3QgZXhpc3RzYCkgXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5tb2RlbENhY2hlcy5nZXQobW9kZWxOYW1lKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldENhY2hlS2V5KCBrZXk6IEVudGl0eUtleSApIDogbnVtYmVyIHwgc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmltaXRpdmUoa2V5KSA/IGtleSBhcyBudW1iZXIgfCBzdHJpbmcgOiAoIGtleSBhcyBLZXlPYmplY3QgKS5rZXlcbiAgfVxuXG4gIHB1YmxpYyBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWQgeyAgICBcbiAgICBpZiAoIGlzU3RyaW5nKG1vZGVsTmFtZSkgKSB7XG4gICAgICB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIHRydWUgKSEucmVzZXQoKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5kZWxldGUoIG1vZGVsTmFtZSApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICggbGV0IGMgb2YgdGhpcy5tb2RlbENhY2hlcy52YWx1ZXMoKSApIHtcbiAgICAgIGMucmVzZXQoKVxuICAgIH1cbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxzKCkgOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICBmb3IoIGxldCBtIG9mIHRoaXMubW9kZWxDYWNoZXMua2V5cygpICkge1xuICAgICAgcmVzdWx0LnB1c2goIG0gKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcblxuICAgIHJldHVybiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSA/IHVuZGVmaW5lZCA6XG4gICAgICBtb2RlbENhY2hlIS5oYXMoY2FjaGVLZXkpID8gbW9kZWxDYWNoZSEuZ2V0KGNhY2hlS2V5KSBhcyBURW50aXR5IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBsZXQgY2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSApXG4gICAgaWYgKCBjYWNoZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY2FjaGUuZm9yRWFjaCggZSA9PiB7XG4gICAgICBmaWx0ZXIgJiYgZmlsdGVyKCBlIGFzIFRFbnRpdHkgICkgJiYgcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApIFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIHB1dChtb2RlbE5hbWU6IHN0cmluZywgZW50aXR5OiBFbnRpdHksIGtleTogRW50aXR5S2V5KSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcHV0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSBrZXkgPSAke2tleX0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApICAgIFxuICAgIHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUsIHRydWUpIS5zZXQodGhpcy5nZXRDYWNoZUtleShrZXkpLCBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZCB7XG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYGV2aXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9IGtleSA9ICR7Y2FjaGVLZXl9YClcblxuICAgIGNvbnN0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGlmIChtb2RlbENhY2hlKSBtb2RlbENhY2hlLmRlbChjYWNoZUtleSlcbiAgfVxuICBcbiAgcHVibGljIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG1vZGVsTmFtZSwgIHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZHVtcENhY2hlKCkgOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgQ0FDSEUgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHRoaXMubW9kZWxDYWNoZXMuZm9yRWFjaCggKGNhY2hlLCBtb2RlbCkgPT4ge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLU1vZGVsICR7bW9kZWx9LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBjYWNoZS5mb3JFYWNoKCAoIGVudGl0eSwga2V5ICkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gYGtleSA9ICR7dGhpcy5nZXRDYWNoZUtleSgga2V5ICl9LCBlbnRpdHkgPSB7JHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfX0gXFxuYFxuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgIH0pICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgc2RiIGZyb20gJy4vU21hcnREQidcbmltcG9ydCAqIGFzIG1vZGVsIGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgKiBhcyBibG9jayBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9jayA9IGJsb2NrLkJsb2NrXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YmxldmVsIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBwcm9taXNpZnkoY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pIDogUHJvbWlzZTxUPlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0QnkoaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPEpzb25PYmplY3Q+KTogUHJvbWlzZTxKc29uT2JqZWN0PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1YmxldmVsLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1YmxldmVsKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5sZXZlbGRiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzdWIgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHN1YiApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+ICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5sZXZlbGRiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IHByb21pc2lmeShnZXRDYWxsYmFjaylcbiAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleChpbmRleEZpZWxkKVxuICAgIHJldHVybiBhd2FpdCBpbmRleExldmVsLmdldDxUPihrZXksIGdldENhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBwcm9taXNpZnkocHV0Q2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoZGVsQ2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLmRlbChrZXksIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5sZXZlbGRiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeSggaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT4pXG5cbiAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgIHRoaXMubGV2ZWxkYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgdGhpcy5sZXZlbGRiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEJsb2NrSGVpZ2h0IDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoIGRpciA6IHN0cmluZywgbGV2ZWxPcHRpb25zID0ge30gKSB7XG4gICAgLyogXG4gICAgICB7IGlkKDY0KSwgdGltZXN0YW1wKGJpZ2ludCksIGhlaWdodChiaWdpbnQpLCBwYXlsb2FkTGVuZ3RoKGJpZ2ludCksIHBheWxvYWRIYXNoKDY0KSwgcHJldkJsb2NrSWQoNjQpLCBcbiAgICAgICAgcG9pbnRJZCg2NCksIHBvaW50SGVpZ2h0KGJpZ2ludCksIGRlbGVnYXRlKDY0KSwgc2lnbmF0dXJlKDEyOCksIGNvdW50KGJpZ2ludCkgfVxuICAgICovXG4gICAgY29uc3QgYmxvY2tNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnYmxrJywgJ2hlaWdodCcsIFtcbiAgICAgIHsgZmllbGROYW1lOiAnaWQnIH0sIFxuICAgICAgeyBmaWVsZE5hbWU6ICdkZWxlZ2F0ZScgfVxuICAgIF0pXG4gICAgY29uc3QgY2hhbmdlc0xvZ01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdoaXMnLCAnaGVpZ2h0JywgW10pXG4gICAgXG4gICAgdGhpcy5kYiA9IG5ldyBMZXZlbERCKCBkaXIsIFtibG9ja01ldGEsIGNoYW5nZXNMb2dNZXRhXSwgbGV2ZWxPcHRpb25zIClcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IDBcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB7IGhlaWdodCB9ID0gIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8eyBoZWlnaHQ6IG51bWJlciB9PihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlIFxuXG4gICAgICBsZXQgbGFzdEhlaWdodCA9IHsgaGVpZ2h0OiAwIH1cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5wdXQoTEFTVF9CTE9DS19IRUlHSFRfS0VZLCBsYXN0SGVpZ2h0KVxuICAgICAgcmV0dXJuIGxhc3RIZWlnaHQuaGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIG9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5vcGVuKClcbiAgICB0aGlzLmJsb2NrRGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdibGsnKVxuICAgIHRoaXMuaGlzdG9yeURiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnaGlzJylcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IGF3YWl0IHRoaXMuZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRMYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCBcbiAgfVxuXG4gIHByaXZhdGUgaXNLZXlOb3RGb3VuZEVycm9yKGUpIDogYm9vbGVhbiB7IFxuICAgIHJldHVybiBlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhcHBlbmRCbG9jayggYmxvY2sgOiBCbG9ja0hlYWRlciwgY2hhbmdlczogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+ICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghYmxvY2sgfHwgIWJsb2NrLmhlaWdodCB8fCAhYmxvY2suaWQgfHwgIWJsb2NrLmRlbGVnYXRlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJsb2NrIGRhdGFgKVxuXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIucHV0KGJsb2NrLmhlaWdodCwgY2hhbmdlcylcbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogYmxvY2suaGVpZ2h0LCB2YWx1ZTogYmxvY2sgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBibG9jay5oZWlnaHQgfSB9IF0pXG5cbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBoZWlnaHQgLSAxIH0gfSBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCAtLVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZyApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgYmxvY2tzID0gYXdhaXQgdGhpcy5ibG9ja0RiLmdldEJ5KCdpZCcsIGJsb2NrSWQpXG4gICAgcmV0dXJuIChibG9ja3MubGVuZ3RoID09PSAwKSA/IHVuZGVmaW5lZCA6IGJsb2Nrc1swXVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgcmV0dXJuIGF3YWl0ICgobWluSGVpZ2h0LCBtYXhIZWlnaHQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIGxldCBibG9ja3MgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KCkgICAgICBcbiAgICAgICAgdGhpcy5ibG9ja0RiLmNyZWF0ZVJlYWRTdHJlYW0oeyBzdGFydDogbWluSGVpZ2h0LCBlbmQ6IG1heEhlaWdodH0pXG4gICAgICAgICAgLm9uKCdkYXRhJywgZGF0YSA9PiBibG9ja3MucHVzaChkYXRhKSApXG4gICAgICAgICAgLm9uKCdlcnJvcicsIGUgPT4gcmVqKGUpIClcbiAgICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlcyhibG9ja3MpIClcbiAgICAgIH0pXG4gICAgfSkobWluSGVpZ2h0LCBtYXhIZWlnaHQpIGFzIEFycmF5PEJsb2NrSGVhZGVyPlxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCAuLi5ibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgS2V5T2JqZWN0LCBDb2RlQ29udHJhY3QgYXMgREJDIH0gZnJvbSAnLi9Db21tb24nO1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUPiA9IHsgbmV3KCkgOiBUIH1cbmV4cG9ydCB0eXBlIE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiA9IHN0cmluZyB8IENvbnN0cnVjdG9yPFRFbnRpdHk+XG5cbmV4cG9ydCBlbnVtIEZpZWxkVHlwZXMge1xuICBTdHJpbmcgICA9ICdTdHJpbmcnLFxuICBOdW1iZXIgICA9ICdOdW1iZXInLFxuICBCaWdJbnQgICA9ICdCaWdJbnQnLFxuICBUZXh0ICAgICA9ICdUZXh0J1xufVxuXG5leHBvcnQgdHlwZSBGaWVsZFR5cGUgPSBzdHJpbmcgfCBGaWVsZFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENPTVBPU0lURV9LRVlfU0VQQVJBVE9SID0gJ18mXydcbiAgcHJpdmF0ZSBlbnRpdHkgOiBFbnRpdHlcbiAgcHJpdmF0ZSBmaWVsZHMgOiBBcnJheTxzdHJpbmc+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbnRpdHk6IEVudGl0eSwgLi4uZmllbGRzOiBBcnJheTxzdHJpbmc+ICkge1xuICAgIHRoaXMuZW50aXR5ID0gZW50aXR5XG4gICAgdGhpcy5maWVsZHMgPSBuZXcgQXJyYXk8c3RyaW5nPiguLi5maWVsZHMpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1ha2VLZXkoIC4uLnZhbHVlcyA6IEFycmF5PHN0cmluZ3xudW1iZXI+ICkgOiBzdHJpbmcge1xuICAgIERCQy5hcmd1bWVudCggJ3ZhbHVlcycsICB2YWx1ZXMgJiYgdmFsdWVzLmxlbmd0aCA+IDEgLCAndmFsdWVzIG11c3QgY29udGFpbnMgbW9yZSB0aGFuIDEgaXRlbScgKVxuXG4gICAgcmV0dXJuIG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPiguLi52YWx1ZXMpLmpvaW4oIENvbXBvc2l0ZUtleS5DT01QT1NJVEVfS0VZX1NFUEFSQVRPUiApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIHsgXG4gICAgbGV0IHZhbHVlcyA9IG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPigpXG4gICAgdGhpcy5maWVsZHMuZm9yRWFjaCggZiA9PiB2YWx1ZXMucHVzaCggdGhpcy5lbnRpdHlbZl0gKSApXG4gICAgcmV0dXJuIENvbXBvc2l0ZUtleS5tYWtlS2V5KCAuLi52YWx1ZXMgKVxuICB9XG5cbiAgcHVibGljIGtleVBhcnQoIG5hbWU6IHN0cmluZyApIDogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlbbmFtZV1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgYWxsS2V5RmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gRmllbGRUeXBlcy5TdHJpbmcgfHwgdHlwZSA9PT0gRmllbGRUeXBlcy5UZXh0ID8gXG4gICAgICAnU3RyaW5nJyA6IFxuICAgICAgJ051bWJlcidcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7XG4gICAgY29uc3QgcGtGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApLm1hcCggZj0+IGYubmFtZSApXG4gICAgaWYgKCAhcGtGaWVsZHMgfHwgcGtGaWVsZHMubGVuZ3RoIDwgMSApIHRocm93IG5ldyBFcnJvcihgcHJpbWFyeSBrZXkgaXMgdW5kZWZpbmVkYClcblxuICAgIHRoaXMuYWxsS2V5RmllbGRzID0gcGtGaWVsZHNcbiAgICB0aGlzLmFsbEZpZWxkVHlwZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpXG4gICAgdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZm9yRWFjaCggZiA9PiB0aGlzLmFsbEZpZWxkVHlwZXMuc2V0KCBmLm5hbWUsIHRoaXMuY29udmVydFR5cGUoZi50eXBlKSkgKVxuICAgIHRoaXMuYWxsRmllbGRzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMubWFwKCBmID0+IGYubmFtZSlcbiAgICB0aGlzLmFsbEluZGV4ZXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5pbmRleCA9PT0gdHJ1ZSApLm1hcCggZiA9PiBmLm5hbWUgKVxuICB9XG5cbiAgcHVibGljIGdldEZpZWxkVHlwZXMoc2NoZW1hOiBTY2hlbWEpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZFR5cGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjaGVtYU9iamVjdCgpIDogU2NoZW1hIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb21wc2l0ZUtleSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IHN0cmluZyB7XG4gICAgaWYgKCB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPiAxICkgdGhyb3cgRXJyb3IoYG1vZGVsICcke3RoaXMubW9kZWxOYW1lfScgaWRlbnRpZmllZCBieSBjb21wb3NpdGUga2V5YClcbiAgICByZXR1cm4gdGhpcy5hbGxLZXlGaWVsZHNbMF1cbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5RmllbGRzKCkgOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5XSA9IGtleVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjayA9IGtleSBhcyBDb21wb3NpdGVLZXlcbiAgICAgIHRoaXMua2V5RmllbGRzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5UGFydChmKSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPT09IDEgPyBcbiAgICAgIGVudGl0eVt0aGlzLmFsbEtleUZpZWxkc1swXV0gOlxuICAgICAgbmV3IENvbXBvc2l0ZUtleSggZW50aXR5LCAuLi50aGlzLmFsbEtleUZpZWxkcylcbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICEgaW5jbHVkZUtleSAmJiB0aGlzLmtleUZpZWxkcy5pbmRleE9mKGYpID49IDAgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG5cbn0iLCJpbXBvcnQgeyBNb2RlbFNjaGVtYSwgRmllbGRUeXBlcyB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5S2V5LCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcblxuY29uc3QgSnNvblNxbCA9IHJlcXVpcmUoJ2pzb24tc3FsJykoeyBzZXBhcmF0ZWRWYWx1ZXM6IGZhbHNlIH0pXG5jb25zdCBjaGFuZ2VDYXNlID0gcmVxdWlyZSgnY2hhbmdlLWNhc2UnKVxuXG5leHBvcnQgY29uc3QgTVVMVElfU1FMX1NFUEFSQVRPUiA9ICcvLzsvLydcblxuLy8gJ2NyZWF0ZSd8J3NlbGVjdCd8J3VwZGF0ZSd8J3JlbW92ZSd8J290aGVyJ1xuZXhwb3J0IGVudW0gU3FsVHlwZSB7XG4gIFNjaGVtYSA9IDAsXG4gIFNlbGVjdCA9IDEsXG4gIEluc2VydCA9IDIgLFxuICBVcGRhdGUgPSAzLFxuICBEZWxldGUgPSA0LFxuICBPdGhlciAgPSA5XG59XG5cbmV4cG9ydCB0eXBlIFNxbFBhcmFtZXRlcnMgPSBBcnJheTxhbnk+IHwgSnNvbk9iamVjdFxuZXhwb3J0IHR5cGUgU3FsQW5kUGFyYW1ldGVycyA9IHsgXG4gIHR5cGU6IFNxbFR5cGUsICBcbiAgcXVlcnk6IHN0cmluZywgXG4gIHBhcmFtZXRlcnM/IDogU3FsUGFyYW1ldGVycyxcbiAgZXhwZWN0RWZmZWN0ZWQ/IDogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBVbmFyeU9wZXJhdG9ycyA9ICckbnVsbCd8JyRpcyd8JyRpc25vdCdcbmV4cG9ydCB0eXBlIEJpbmFyeU9wZXJhdG9ycyA9ICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSd8JyRsaWtlJ3wnJGZpZWxkJ3wnJGluJ3wnJG5pbid8JyRiZXR3ZWVuJ1xuZXhwb3J0IHR5cGUgUmVsYXRpb25PcGVyYXRvcnMgPSAnJG5vdCd8JyRhbmQnfCckb3InXG5cbmV4cG9ydCB0eXBlIFNlbGVjdEV4cHJlc3Npb24gPSB7XG4gIHNlbGVjdCA6IHtcbiAgICB0YWJsZSA6IHN0cmluZyxcbiAgICBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPixcbiAgICB3aGVyZT8gOiBzdHJpbmcsXG4gICAgW2tleSA6IHN0cmluZ10gOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBBcnJheVZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IEFycmF5PHN0cmluZyB8IG51bWJlcj4gfVxuZXhwb3J0IHR5cGUgTnVsbENvbXBhcmVFeHByZXNzaW9uID0geyAkbnVsbCA6IHN0cmluZyB9IHwgeyBbb3BlciBpbiAnJGlzJ3wnaXNub3QnXT8gOiB7IFtmaWVsZCA6IHN0cmluZ10gOiBudWxsfSB9XG5cbmV4cG9ydCB0eXBlIFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gPSB7IFtvcGVyIGluICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSddPyA6IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgU2VsZWN0RXhwcmVzc2lvbiB9IHwgRmllbGRWYWx1ZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIEFycmF5Q29tcGFyZUV4cHJlc3Npb24gPSB7IFtvcGVyIGluICckYmV0d2Vlbid8JyRpbid8JyRuaW4nXT8gOiBBcnJheVZhbHVlRXhwcmVzc2lvbiB8IFNlbGVjdEV4cHJlc3Npb24gfSBcbmV4cG9ydCB0eXBlIExpa2VFeHByZXNzaW9uID0geyAkbGlrZTogeyBba2V5IDogc3RyaW5nXSA6IHN0cmluZyB9IH1cblxuZXhwb3J0IHR5cGUgQ29tcGFyZUV4cHJlc3Npb24gPSBWYWx1ZUNvbXBhcmVFeHByZXNzaW9uIHwgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiB8IExpa2VFeHByZXNzaW9uIHwgTnVsbENvbXBhcmVFeHByZXNzaW9uXG5leHBvcnQgdHlwZSBSZWxhdGlvbkV4cHJlc3Npb24gPSBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCAvLyBUaGUgJGFuZCBpcyBvbWl0dGVkIFxuICB7ICRub3QgOiBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvbiB9IHwgXG4gIHsgW29wZXIgaW4gJyRhbmQnfCAnJG9yJ10/IDogQXJyYXk8Q29tcGFyZUV4cHJlc3Npb24+IHwgQXJyYXk8UmVsYXRpb25FeHByZXNzaW9uPiB9XG4gXG5leHBvcnQgdHlwZSBTcWxDb25kaXRpb24gPSBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvblxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSA6IChzY2hlbWE6IE1vZGVsU2NoZW1hKSA9PiBzdHJpbmdcbiAgYnVpbGRJbnNlcnQgOiAoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KSA9PiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlIDogKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogYW55KSA9PiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlIDogKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogYW55LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcikgPT4gU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCA6IChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZHM6IEFycmF5PHN0cmluZz4sIHdoZXJlIDogU3FsQ29uZGl0aW9uLCBsaW1pdD86IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyLCBzb3J0PyA6IEFycmF5PEpzb25PYmplY3Q+fEpzb25PYmplY3QsIGpvaW4/IDogSnNvbk9iamVjdCkgPT4gU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBzdHJpbmcge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gZGF0YWJhc2UgZG8gbm90IHN1cHBvcnQgY29tcG9zaXRlIGtleSAgIFxuICAgIGlmICggc2NoZW1hLmlzQ29tcHNpdGVLZXkgKSB7IFxuICAgICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gZi5wcmltYXJ5X2tleSA9IGZhbHNlIClcbiAgICB9XG4gICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fscy5qb2luKCBNVUxUSV9TUUxfU0VQQVJBVE9SIClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIC8vIHByaXZhdGUgZGV0ZXJtaW5lU29ydCggdGFibGVOYW1lOiBzdHJpbmcsIHNvcnQgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgc29ydCB8fCB7fVxuICAvLyAgIGlmICh0eXBlb2Ygc29ydCA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGlmIChzb3J0ID09PSAndGltZXN0YW1wJykge1xuICAvLyAgICAgICBzb3J0ID0gJ3QuJyArIHNvcnRcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHNvcnQgPSB0YWJsZU5hbWUgKyAnLicgKyBzb3J0XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2Ygc29ydCA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gc29ydCkge1xuICAvLyAgICAgICBpZiAoayA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgLy8gICAgICAgICBzb3J0Wyd0LicgKyBrXSA9IHNvcnRba11cbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBzb3J0W3RhYmxlTmFtZSArICcuJyArIGtdID0gc29ydFtrXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGRlbGV0ZSBzb3J0W2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBzb3J0XG4gIC8vIH1cblxuICAvLyBwcml2YXRlIGRldGVybWluZVdoZXJlKCB0YWJsZU5hbWU6IHN0cmluZywgd2hlcmUgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgbGV0IGNvbmRpdGlvbiA9IHt9IHx8IHdoZXJlIFxuICAvLyAgIGlmIChBcnJheS5pc0FycmF5KGNvbmRpdGlvbikpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5zbGljZSgpXG4gIC8vICAgICBmb3IgKGxldCBpIGluIGNvbmRpdGlvbikge1xuICAvLyAgICAgICBmb3IgKGxldCBrIGluIGNvbmRpdGlvbltpXSkge1xuICAvLyAgICAgICAgIGNvbmRpdGlvbltpXVt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltpXVtrXVxuICAvLyAgICAgICAgIGRlbGV0ZSBjb25kaXRpb25baV1ba11cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmRpdGlvbilcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gY29uZGl0aW9uKSB7XG4gIC8vICAgICAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltrXVxuICAvLyAgICAgICBkZWxldGUgY29uZGl0aW9uW2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLl9kZWxldGVkXyddID0gMFxuICAvLyB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBsaW1pdD86IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyLCBcbiAgICBzb3J0PyA6IEFycmF5PEpzb25PYmplY3Q+fEpzb25PYmplY3QsIGpvaW4/IDogSnNvbk9iamVjdCApOiBTcWxBbmRQYXJhbWV0ZXJzIHtcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgZmllbGRzID0gZmllbGRzIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG5cbiAgICBsZXQgcXVlcnlPcHRpb25zID0ge1xuICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgZmllbGRzOiBmaWVsZHMsXG4gICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICBzb3J0OiBzb3J0LFxuICAgICAgam9pbjogam9pblxuICAgIH1cblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5TZWxlY3QgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHF1ZXJ5T3B0aW9ucykpXG4gIH1cbn0iLCJpbXBvcnQgeyBTcWxpdGVXcmFwcGVyIH0gZnJvbSAnLi9TcWxpdGVXcmFwcGVyJ1xuaW1wb3J0IHsgTVVMVElfU1FMX1NFUEFSQVRPUiwgU3FsQW5kUGFyYW1ldGVycywgU3FsUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiwgQ29ubmVjdGlvbk9wdGlvbnMsIFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcblxuXG5jbGFzcyBTcWxpdGVUcmFuc2FjdGlvbiBpbXBsZW1lbnRzIERCVHJhbnNhY3Rpb24ge1xuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29tbWl0KCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnQ09NTUlUJylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByb2xsYmFjaygpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ1JPTExCQUNLJykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIC4uLnNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIC4uLnNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OJylcbiAgICByZXR1cm4gbmV3IFNxbGl0ZVRyYW5zYWN0aW9uKHRoaXMpXG4gIH1cbn0iLCJpbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dNYW5hZ2VyLCBMb2dnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBTcWxQYXJhbWV0ZXJzLCBTcWxBbmRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuXG5pbXBvcnQgKiBhcyBEYXRhYmFzZSBmcm9tICdiZXR0ZXItc3FsaXRlMydcblxuZXhwb3J0IGNsYXNzIFNxbGl0ZVdyYXBwZXIge1xuICBwcml2YXRlIGRiIDogRGF0YWJhc2VcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTcWxpdGVXcmFwcGVyLm5hbWUpXG4gIH1cblxuICBwdWJsaWMgb3BlbihkYkZpbGVQYXRoOiBzdHJpbmcsIGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJGaWxlUGF0aClcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1Mgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAsIGVyciApXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIGV4ZWN1dGUgc3FsID0gJHtzcWx9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICB9ICAgIFxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PGFueT4+ICkgOiBBcnJheTxhbnk+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8YW55PigpIH1cbiAgICB0cnkge1xuICAgICAgcmV0LnJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLmFsbChwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHF1ZXJ5IHNxbCA9ICR7c3FsfSwgcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0sIHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkoc3FsIS5wYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCBudWxsLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgLi4uc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEVudGl0eUtleSwgQ29kZUNvbnRyYWN0IGFzIERCQywgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciAgfSBmcm9tICcuL01vZGVsJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IEVudGl0eVByb3h5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgU3FsQ29uZGl0aW9uIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHsgQmxvY2tDYWNoZSB9IGZyb20gJy4vQmxvY2tDYWNoZSc7XG5cblxuZXhwb3J0IHR5cGUgU21hcnREQk9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBjYWNoZWQgaGlzdG9yeSBjb3VudChibG9jayBjb3VudCksIHVzZWQgdG8gcm9sbGJhY2sgYmxvY2tcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGhpc3RvcnlGb3JSb2xsYmFjaz8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIGNsZWFuIHBlcnNpc3RlZCBoaXN0b3J5IGF1dG9tYXRpY2FsbHlcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9DbGVhblBlcnNpc3RlZEhpc3Rvcnk/IDogYm9vbGVhbixcblxuICAvKipcbiAgICogY2FjaGVkIGxhc3QgYmxvY2sgY291bnQgXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBjYWNoZWRCbG9ja0NvdW50PyA6IG51bWJlcixcblxuICAvKipcbiAgICogbWF4IGNhY2hlZCBlbnRpdHkgY291bnQsIGNvbmZpZyBpdCBwZXIgbW9kZWwsIExSVSAgXG4gICAqIHNhbXBsZTogeyBVc2VyOiAyMDAsIFRyYW5zOiA1MDAwIH0gbWF4IGNhY2hlZCAyMDBzIFVzZXIg77yMNTAwMCBmb3IgVHJhbnNcbiAgICogQGRlZmF1bHQgMTAwMDBzIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoLi4uc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBzY2hlbWFzLmZvckVhY2goIGFzeW5jIHNjaGVtYSA9PiB7XG4gICAgICB0aGlzLnNjaGVtYXMuc2V0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEgKVxuICAgICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb24oIHNjaGVtYSApXG4gICAgICBhd2FpdCBzZXNzaW9uLnJlZ2lzdGVyU2NoZW1hKHNjaGVtYSlcbiAgICAgIGF3YWl0IHNlc3Npb24uc3luY1NjaGVtYShzY2hlbWEpXG4gICAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSBhd2FpdCBzZXNzaW9uLmZpbmRBbGwoIHNjaGVtYS5tb2RlbE5hbWUgKVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCAncmVhZHknLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmcmVlIHJlc291cmNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5jbG9zZSgpXG4gICAgXG4gICAgdGhpcy5lbWl0KCdjbG9zZWQnLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBoZWlnaHQgb2YgbGFzdCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tEQi5nZXRMYXN0QmxvY2tIZWlnaHQoKVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gT2JqZWN0LmFzc2lnbigge30sIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICBibG9ja0hlYWRlci50cmFuc2FjdGlvbnMgPSB1bmRlZmluZWRcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIGJsb2NrSGVhZGVyLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnNhdmVDaGFuZ2VzKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgKVxuICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeUZvclJvbGxiYWNrISApXG4gICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5wdXQoIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBjb21taXRCbG9jayBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHsgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgY29tbWl0QmxvY2sgZmFpbGVkICggaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2sodGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0KVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGJsb2NrIGNoYW5nZXNcbiAgICogQHBhcmFtIGhlaWdodCByb2xsYmFjayB0byBoZWlnaHQoZXhjbHVkZSlcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0Jsb2NrKCBoZWlnaHQ/OiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgIWhlaWdodCB8fCBoZWlnaHQgPD0gdGhpcy5sYXN0QmxvY2tIZWlnaHQsIFxuICAgICAgYGhlaWdodCBtdXN0IGxlc3Mgb3IgZXF1YWwgbGFzdEJsb2NrSGVpZ2h0ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcblxuICAgIGNvbnN0IGJsb2NrSGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgZnJvbSA9IGJsb2NrSGVpZ2h0XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHZlciA9IHRoaXMuYmxvY2tTZXNzaW9uLmhpc3RvcnlWZXJzaW9uO1xuICAgICAgaWYgKCBmcm9tIDwgdmVyLm1pbiApIC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmF0dGFjaEhpc3RvcnkoYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tLCB2ZXIubWluIC0gMSApKVxuXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIGJsb2NrSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+PSBibG9ja0hlaWdodCApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5ldml0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCwgdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGByb2xsYmFja0Jsb2NrIGhlaWdodCA6ICR7ZnJvbX0gLT4gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYHJvbGxiYWNrQmxvY2sgZmFpbGVkICggaGVpZ2h0IDogJHtmcm9tfSAtPiAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fSApYCwgZXJyKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNhdmUgbG9jYWwgdGFibGVzIChub3QgaW4gYmxvY2sgLS0tIHdoaWNoIGRlZmluZSBpbiBzY2hlbWEgYnkgbG9jYWwgOiB0cnVlKSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlTG9jYWxDaGFuZ2VzKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBzZXJpYWwgPSBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5zYXZlQ2hhbmdlcygpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWwgKVxuICAgIHJldHVybiBzZXJpYWxcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBsb2NhbCB0YWJsZXMgY2hhbmdlcyBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqIEBwYXJhbSBzZXJpYWwgc2VyaWFsIG51bWJlciByZXR1cm4gZnJvbSBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tMb2NhbENoYW5nZXMoc2VyaWFsOiBudW1iZXIpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzZXJpYWwnLCBzZXJpYWwgPiAwLCBgc2VyaWFsIG11c3QgZ3JlYXQgdGhhbiB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIGEgbmV3IGVudGl0eSB3aGljaCBjaGFuZ2Ugd2lsbCBiZSB0cmFja2VkIGFuZCBwZXJzaXN0ZW50ZWQgKGJ5IHNhdmVDaGFuZ2VzKSBhdXRvbWF0aWNhbGx5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGVudGl0eSBrZXkgd2hpY2ggdW5pcXVlZCBpbiBkYXRhYmFzZVxuICAgKiBAcGFyYW0gZW50aXR5IHByb3RvdHlwZSBlbnRpdHkgd2hpY2ggcHJvcGVydGllcyB3aWxsIGNvcHkgdG8gcmVzdWx0IGVudGl0eVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5LCBlbnRpdHk/OiBURW50aXR5KSA6IFRFbnRpdHkge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSlcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmNyZWF0ZShtb2RlbCwga2V5LCBlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogdXBkYXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgLy8gcHVibGljIHVwZGF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gIC8vICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgLy8gICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHByb3hpZWQgb2JqZWN0YCApXG5cbiAgLy8gICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgLy8gICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkudXBkYXRlKGVudGl0eSlcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBkZWxldGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmZpbmRNYW55KG1vZGVsLCBjb25kaXRpb24pXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBjb25kaXRpb24gPSAnJHtKU09OLnN0cmluZ2lmeShjb25kaXRpb24pfScgKWApXG5cbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbXNbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldEFsbENhY2hlZCggbW9kZWwsIGZpbHRlciwgdHJhY2sgKVxuICB9XG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIGZpbmQgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSB0cmFjayB0cmFjayBhbmQgY2FjaGUgcmVzdWx0IGlmIHRydWVcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kTWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5maW5kTWFueShtb2RlbCwgY29uZGl0aW9uLCB0cmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBxdWVyeSBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSBsaW1pdCBsaW1pdCBvZiByZXN1bHQgY291bnRcbiAgICogQHBhcmFtIHNvcnQgc29ydFxuICAgKiBAcGFyYW0gZmllbGRzIHJlc3VsdCBmaWVsZHMsIGRlZmF1bHQgaXMgYWxsIGZpZWxkc1xuICAgKiBAcGFyYW0gb2Zmc2V0IG9mZnNldCBvZiByZXN1bHQgc2V0ICBcbiAgICogQHBhcmFtIGpvaW4gam9pbiBpbmZvIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCBsaW1pdD8gOiBudW1iZXIsIHNvcnQ/IDogSnNvbk9iamVjdCxcbiAgICBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPiwgb2Zmc2V0PyA6IG51bWJlciwgIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeShtb2RlbCwgY29uZGl0aW9uLCBmaWVsZHMsIGxpbWl0LCBvZmZzZXQsIHNvcnQsIGpvaW4pXG4gIH1cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmV4aXN0cyhtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvdW50IHJlY29yZHMgY291bnQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY291bnQobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXN0IHBlcnNpc3RlZCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRMYXN0QmxvY2tIZWlnaHQoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRMYXN0QmxvY2tIZWlnaHQoKVxuICB9XG5cblxuICBwcm90ZWN0ZWQgYXN5bmMgYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja3MgOiBBcnJheTxCbG9ja0hlYWRlcj4sICBnZXRUcmFuc2FjdGlvbnM6ICgpID0+IFByb21pc2U8QXJyYXk8VHJhbnNhY3Rpb24+PiApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBsZXQgdHJhbnNHcm91cCA9IG5ldyBNYXA8c3RyaW5nLCBBcnJheTxUcmFuc2FjdGlvbj4+KClcbiAgICBsZXQgdHJhbnNhY3Rpb25zID0gYXdhaXQgZ2V0VHJhbnNhY3Rpb25zKClcblxuICAgIHRyYW5zYWN0aW9ucy5mb3JFYWNoKCB0ID0+IHtcbiAgICAgIGlmICghdHJhbnNHcm91cC5oYXMoIHQuYmxvY2tJZCApKSB0cmFuc0dyb3VwLnNldCggdC5ibG9ja0lkLCBuZXcgQXJyYXk8VHJhbnNhY3Rpb24+KCkgKVxuICAgICAgdHJhbnNHcm91cC5nZXQoIHQuYmxvY2tJZCApIS5wdXNoKCB0IClcbiAgICB9IClcblxuICAgIGJsb2Nrcy5mb3JFYWNoKCBiID0+IGJbJ3RyYW5zYWN0aW9ucyddID0gdHJhbnNHcm91cC5nZXQoYi5pZCEpIClcbiAgICByZXR1cm4gYmxvY2tzIGFzIEFycmF5PEJsb2NrPlxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgaGVpZ2h0XG4gICAqIEBwYXJhbSBoZWlnaHQgYmxvY2sgaGVpZ2h0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUhlaWdodCggaGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2hlaWdodCcsIGhlaWdodCA+IDAgLCAnaGVpZ2h0IG11c3QgZ3JlYXQgdGhhbiB6ZXJvJylcbiAgICBcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoaGVpZ2h0KVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9jayggaGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGJsb2NrIGlkXG4gICAqIEBwYXJhbSBibG9ja0lkIGJsb2NrIGlkIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZywgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNhY2hlZEJsb2Nrcy5nZXRCeUlkKCBibG9ja0lkIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tCeUlkKCBibG9ja0lkIClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBoZWlnaHQgcmFuZ2VcbiAgICogQHBhcmFtIG1pbkhlaWdodCBtaW4gaGVpZ2h0KGluY2x1ZGVkKVxuICAgKiBAcGFyYW0gbWF4SGVpZ2h0IG1heCBoZWlnaHQoaW5jbHVkZWQpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0IDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21pbkhlaWdodCwgbWF4SGVpZ2h0JywgbWluSGVpZ2h0ID4gMCAmJiBtYXhIZWlnaHQgPj0gbWluSGVpZ2h0LCAnbWluSGVpZ2h0IG9yIG1heEhlaWdodCBpcyBpbnZhbGlkJylcblxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0LCBtYXhIZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgJGluIDogeyBibG9ja0lkIDogIGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBibG9jayBpZCBhcnJheVxuICAgKiBAcGFyYW0gYmxvY2tJZHMgYXJyYXkgb2YgYmxvY2sgaWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+LCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkcycsICgpID0+IERCQy5ub3ROdWxsKGJsb2NrSWRzKSApXG5cbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SWRzKC4uLmJsb2NrSWRzKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgJGluIDogeyBibG9ja0lkIDogIGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxufSIsImltcG9ydCB7IEVudGl0eSwgIE51bGxhYmxlIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEVudGl0eVRyYWNrZXIsIFByb3hpZWRFbnRpdHlUcmFja2VyIH0gZnJvbSAnLi9FbnRpdHlUcmFja2VyJ1xuXG4vKiogICAgIFxuICogICAgIFNUQVRFIFRSQU5TRkVSICAgICAgICAgICAgICAgICAgQUNUSU9OICAgICAgICAgICAgICAgIFRSQUNLICAgICAgQ0FDSEVcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqICAgICAgPyAgICAgICAgIC0+IHBlcnNpdGVudCAgICAgIHNlc3Npb24ubG9hZCAgICAgICAgICAgICB0cmFjayAgICAgY2FjaGVcbiAqICAgICAgPyAgICAgICAgIC0+IG5ldyAgICAgICAgICAgIHNlc3Npb24uY3JlYXRlICAgICAgICAgICB0cmFjayAgICAgICAtICBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IG1vZGlmaWVkICAgICAgIHNldCBwcm9wZXJ0eSAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBkZWxldGVkICAgICAgICBzZXNzaW9uLmRlbCAgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogbmV3IHwgbW9kaWZpZWQgLT4gcHJlc2lzdGVudCAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGtlZXAgICAgIGNhY2hlfHVwZGF0ZSBcbiAqIGRlbGV0ZWQgICAgICAgIC0+IHRyYW5zaWVudCAgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBldml0ICAgICAgIGV2aXRcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqL1xuXG5leHBvcnQgZW51bSBFbnRpdHlTdGF0ZSB7XG4gIFRyYW5zaWVudCAgPSAtMSxcbiAgUGVyc2lzdGVudCA9IDAsXG4gIFxuICBOZXcgICAgICAgID0gMSxcbiAgTW9kaWZpZWQgICA9IDIsXG4gIERlbGV0ZWQgICAgPSAzLFxufVxuXG5leHBvcnQgZW51bSBFbnRpdHlDaGFuZ2VUeXBlIHtcbiAgTmV3ICAgICAgID0gMSxcbiAgTW9kaWZ5ICAgID0gMixcbiAgRGVsZXRlICAgID0gMyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9wZXJ0eUNoYW5nZSB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgb3JpZ2luYWwgOiBhbnlcbiAgY3VycmVudCA6IGFueVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNoYW5nZXMge1xuICBkYlZlcnNpb24gICAgICAgICA6IG51bWJlclxuICB0eXBlICAgICAgICAgICAgICA6IEVudGl0eUNoYW5nZVR5cGVcbiAgcHJvcGVydGllc0NoYW5nZXMgOiBBcnJheTxQcm9wZXJ0eUNoYW5nZT5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlFeHRlbnNpb24ge1xuICBfdmVyc2lvbl8gICAgICA6IG51bWJlclxuICBfX2RldGFjaGVkX18gICA6IGJvb2xlYW5cbiAgX190cmFja2luZ19fICAgOiBib29sZWFuXG4gIF9fc2NoZW1hX18gICAgIDogTW9kZWxTY2hlbWFcbiAgX190cmFja2VyX18gICAgOiBFbnRpdHlUcmFja2VyXG4gIF9fc3RhdGVfXyAgICAgIDogRW50aXR5U3RhdGUgXG4gIF9fdG1wQ2hhbmdlc19fIDogTnVsbGFibGU8RW50aXR5Q2hhbmdlcz5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm94aWVkPFQ+IGV4dGVuZHMgRW50aXR5RXh0ZW5zaW9uIHtcbiAgXG59XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHlQcm94eSB7XG4gIHByaXZhdGUgdHJhY2tlciA6IEVudGl0eVRyYWNrZXI7XG5cbiAgY29uc3RydWN0b3IodHJhY2tlcjogRW50aXR5VHJhY2tlcikge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNFeHRlbmRlZChlbnRpdHk6IEVudGl0eSkge1xuICAgIHJldHVybiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc2NoZW1hX18nKSAmJiBlbnRpdHkuaGFzT3duUHJvcGVydHkoJ19fc3RhdGVfXycpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzUHJveGllZChlbnRpdHk6IEVudGl0eSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gRW50aXR5UHJveHkuaXNFeHRlbmRlZChlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNvbnZlcnRUb1Byb3hpZWQ8VEVudGl0eT4oZW50aXR5OiBFbnRpdHkpIDogUHJveGllZDxURW50aXR5PiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFByb3hpZWQgRW50aXR5YClcbiAgICBcbiAgICByZXR1cm4gZW50aXR5IGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgcHJveHlUb0VudGl0eShwcm94aWVkOiBQcm94aWVkPEVudGl0eT4pOiBFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSB7fVxuICAgIGZvciggbGV0IGsgaW4gcHJveGllZCApIHtcbiAgICAgIGlmICggRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrKSApIGVudGl0eVtrXSA9IHByb3hpZWRba11cbiAgICB9XG4gICAgcmV0dXJuIGVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc05vcm1hbFByb3BlcnR5KHByb3BlcnR5TmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiBwcm9wZXJ0eU5hbWUgJiYgKCFwcm9wZXJ0eU5hbWUuc3RhcnRzV2l0aCgnX18nKSAmJiAhcHJvcGVydHlOYW1lLmVuZHNXaXRoKCdfXycpKVxuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaEV4dGVuZFByb3BlcnRpZXM8VEVudGl0eT4oZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBzdGF0ZTogRW50aXR5U3RhdGUgKSA6IFRFbnRpdHkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHtcbiAgICAgIF92ZXJzaW9uXyAgICAgIDogZW50aXR5WydfdmVyc2lvbl8nXSB8fCAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fdG1wQ2hhbmdlc19fIDogbnVsbFxuICAgIH0sIGVudGl0eSlcbiAgfVxuXG4gIHByb3RlY3RlZCBvblByb3BlcnR5U2V0KGVudGl0eTogRW50aXR5LCBwcm9wZXJ0eU5hbWU6IFByb3BlcnR5S2V5LCB2YWx1ZTogYW55LCByZWNlaXZlcjogYW55KSA6IGJvb2xlYW4geyAgICAgIFxuICAgIGNvbnN0IGV4dCA9IGVudGl0eSBhcyBFbnRpdHlFeHRlbnNpb24gXG4gICAgY29uc3QgbmFtZSA9IHByb3BlcnR5TmFtZS50b1N0cmluZygpXG5cbiAgICBpZiAoICFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KG5hbWUpIHx8ICFleHQuX190cmFja2luZ19fICB8fCB2YWx1ZSA9PT0gZW50aXR5W3Byb3BlcnR5TmFtZV0gKSB7XG4gICAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBcbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQgfHwgZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcm9wZXJ0eSBhZnRlciBkZWxldGVkYClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3NjaGVtYV9fLmlzUmVhZG9ubHkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHJlYWRvbmx5IG1vZGVsICcke2V4dC5fX3NjaGVtYV9fLm1vZGVsTmFtZX0nYClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3NjaGVtYV9fLmtleUZpZWxkcy5pbmRleE9mKG5hbWUpID49IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByaW1hcnkgZmllbGQgcHJvcGVydHlgKVxuICAgIH1cblxuICAgIGlmICggZXh0Ll9fZGV0YWNoZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyKS5hdHRhY2goIHJlY2VpdmVyIGFzIFByb3hpZWQ8YW55PiApXG4gICAgICBleHQuX19kZXRhY2hlZF9fID0gZmFsc2VcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBleHQuX190bXBDaGFuZ2VzX18gPSB7ICAgICAgICBcbiAgICAgICAgdHlwZSA6IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5LCAgICAgICAgXG4gICAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyxcbiAgICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KHsgXG4gICAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgICB9XG5cbiAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgKTogUHJveGllZDxURW50aXR5PiB7XG4gICAgbGV0IGV4dGVuZGVkID0gIHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyhlbnRpdHksIHNjaGVtYSwgRW50aXR5U3RhdGUuUGVyc2lzdGVudCApXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnO1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJztcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlQcm94eSwgUHJvcGVydHlDaGFuZ2UsIFByb3hpZWQsIEVudGl0eVN0YXRlLCBFbnRpdHlDaGFuZ2VUeXBlIH0gZnJvbSAnLi9FbnRpdHlQcm94eSdcbmltcG9ydCB7IFNxbEFuZFBhcmFtZXRlcnMsIFNxbEJ1aWxkZXIgfSBmcm9tICcuLi9TUUxEQi9TcWxCdWlsZGVyJ1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcykgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbn1cblxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbW9kZWxBbmRLZXlTZXBhcmF0b3IgPSAnISMhJ1xuXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgcHJveHkgOiBFbnRpdHlQcm94eVxuICBwcml2YXRlIGNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBtaW5WZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY3VycmVudFZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhY2hlOiBFbnRpdHlDYWNoZSkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoUHJveGllZEVudGl0eVRyYWNrZXIubmFtZSlcbiAgICB0aGlzLnByb3h5ID0gbmV3IEVudGl0eVByb3h5KHRoaXMpXG4gICAgdGhpcy5jYWNoZSA9IGNhY2hlXG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcbiAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IC0xXG4gICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IC0xXG4gIH1cblxuICBwcm90ZWN0ZWQgZW5zdXJlTm9UcmFja2luZyggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkgKSB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgbW9kZWw9JHtzY2hlbWEubW9kZWxOYW1lfSBrZXk9JHtzY2hlbWEuZ2V0S2V5KGVudGl0eSl9IGlzIHRyYWNraW5nYClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIG1ha2VNb2RlbEFuZEtleShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IE1vZGVsQW5kS2V5IHtcbiAgICBsZXQga2V5U3RyaW5nID0gc2NoZW1hLmlzQ29tcHNpdGVLZXkgPyAoIGtleSBhcyBDb21wb3NpdGVLZXkgKS5rZXkgOiBrZXkudG9TdHJpbmcoKSBcbiAgICByZXR1cm4gYCR7c2NoZW1hLm1vZGVsTmFtZX0ke1Byb3hpZWRFbnRpdHlUcmFja2VyLm1vZGVsQW5kS2V5U2VwYXJhdG9yfSEhJHtrZXlTdHJpbmd9YFxuICB9XG5cbiAgcHVibGljIHNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXkgKSA6IHsgbW9kZWw6IHN0cmluZywga2V5OiBhbnkgfSB7XG4gICAgY29uc3QgYXJyYXkgPSAgbW9kZWxBbmRLZXkuc3BsaXQoUHJveGllZEVudGl0eVRyYWNrZXIubW9kZWxBbmRLZXlTZXBhcmF0b3IpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBhcnJheVswXSwga2V5OiBhcnJheVsxXSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PiApOiB2b2lkIHtcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBhdHRhY2hIaXN0b3J5IGhpc3RvcnkgaW5mbyA9ICR7SlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5VmVyc2lvbil9YClcblxuICAgIGhpc3RvcnkuZm9yRWFjaCggKGNoYW5nZXMsIHZlcnNpb24pID0+IHtcbiAgICAgIGxldCBjaGFuZ2VzTWFwID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKVxuICAgICAgY2hhbmdlcy5mb3JFYWNoKCBjID0+IGNoYW5nZXNNYXAuc2V0KCBjLm1vZGVsQW5kS2V5LCBjLmNoYW5nZXMhICkpXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KHZlcnNpb24sIGNoYW5nZXNNYXAgKVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5sb2cuaW5mb0VuYWJsZWQpIHtcbiAgICAgIGxldCBoZWlnaHRJbmZvID0gbmV3IEFycmF5PG51bWJlcj4oKVxuICAgICAgaGlzdG9yeS5mb3JFYWNoKCAoYywgaCkgPT4gaGVpZ2h0SW5mby5wdXNoKGgpIClcbiAgICAgIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgYXR0YWNoSGlzdG9yeSBoZWlnaHQgPSAke0pTT04uc3RyaW5naWZ5KGhlaWdodEluZm8pfWApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluOiB0aGlzLm1pblZlcnNpb24sIG1heDogdGhpcy5jdXJyZW50VmVyc2lvbiB9XG4gIH1cblxuICBwdWJsaWMgYXR0YWNoKCBwZTogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUpXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRMYXN0Q2hhbmdlcyggcGU6IFByb3hpZWQ8YW55PiApIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNEaXJ0eShwZSkpIHJldHVybiB1bmRlZmluZWRcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDogXG4gICAgICAgIHJldHVybiBwZS5fX3RtcENoYW5nZXNfXyFcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb246IG51bWJlciApOiBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICBsZXQgdG1wVmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cblxuICAgIHdoaWxlICggdG1wVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiApIHtcbiAgICAgIGxldCBoaXN0b3J5ID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRtcFZlcnNpb24pXG4gICAgICBoaXN0b3J5ICYmIHJlc3VsdC5wdXNoKGhpc3RvcnkpICAgICAgXG4gICAgICB0bXBWZXJzaW9uLS1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCB0cmFja2luZ0VudGl0aWVzKCkgOiBJdGVyYWJsZTxFbnRpdHk+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnZhbHVlcygpXG4gIH1cblxuICBwdWJsaWMgaXNUcmFja2luZyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKCB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpIClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKTogTWF5YmVVbmRlZmluZWQ8UHJveGllZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBrZXkpXG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpID8gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmdldCh0cmFja2luZ0tleSkgYXMgUHJveGllZDxURW50aXR5PiA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIHRyYWNrTmV3PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkgeyBcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eU5ldyhlbnRpdHksIHNjaGVtYSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZCB7XG4gICAgbGV0IHByb3hpZWQgPSBFbnRpdHlQcm94eS5jb252ZXJ0VG9Qcm94aWVkKGVudGl0eSlcbiAgICBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgfSBcbiAgICBlbHNlIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAvLyBUT0RPOiDlhYjkv67mlLnlho3liKDpmaTvvIzpnIDopoHmgaLlpI3liLDku4DkuYjnirbmgIHvvJ9cbiAgICAgIHByb3hpZWQuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHRyYWNrUGVyc2lzdGVudDxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHtcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eVBlcnNpc3RlbnQoZW50aXR5LCBzY2hlbWEpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZSh0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIHNjaGVtYS5nZXRLZXkoZW50aXR5KSkpXG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IG1vZGVsQW5kS2V5IDogdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpIH0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZGV0ZWN0Q2hhbmdlcygpIDogQXJyYXk8e2VudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8e2VudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgZW50aXR5OiBwZSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSl9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhlbnRpdHk6IEVudGl0eSwgZGJWZXJzaW9uOiBudW1iZXIsIGlzTmV3ID0gdHJ1ZSkgOiBFbnRpdHlDaGFuZ2VzIHtcbiAgICBsZXQgcHJvcGVyaXRlc0NoYW5nZSA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIGZvciAoY29uc3Qga2V5IGluIGVudGl0eSkge1xuICAgICAgaWYgKCFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGtleSkpIGNvbnRpbnVlXG4gICAgICBwcm9wZXJpdGVzQ2hhbmdlLnB1c2goIGlzTmV3ID8gXG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogbnVsbCwgY3VycmVudDogZW50aXR5W2tleV0gfSA6XG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogZW50aXR5W2tleV0sIGN1cnJlbnQ6ICBudWxsIH0gICAgICAgXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGUgOiBpc05ldyA/IEVudGl0eUNoYW5nZVR5cGUuTmV3IDogRW50aXR5Q2hhbmdlVHlwZS5EZWxldGUsXG4gICAgICBkYlZlcnNpb246IGRiVmVyc2lvbiwgICAgICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogcHJvcGVyaXRlc0NoYW5nZVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtYXJrU3RhdGVBbmRTYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogdm9pZCB7XG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTkVXIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBERUxFVEUgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBNT0RJRklFRCBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gY2hhbmdlcyA9ICR7SlNPTi5zdHJpbmdpZnkocGUuX190bXBDaGFuZ2VzX18pfWApXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgcGUuX190bXBDaGFuZ2VzX18hLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgIGJyZWFrXG4gICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZyBcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OiBcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSksIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgZWxzZSBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkKVxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSkpXG4gICAgICAvLyBlbHNlICd0cmFuc2llbnQnIHwgJ3BlcnNpc3RlbnQnIGRvIG5vdGhpbmdcbiAgICAgIHRoaXMubWFya1N0YXRlQW5kU2F2ZUhpc3RvcnkocGUsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IGhpc3RvcnlWZXJzaW9uXG4gICAgICBwZS5fX2RldGFjaGVkX18gPSB0cnVlXG4gICAgfSkgIFxuICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5taW5WZXJzaW9uID0gdGhpcy5taW5WZXJzaW9uID09PSAtMSA/IGhpc3RvcnlWZXJzaW9uIDogdGhpcy5taW5WZXJzaW9uXG4gICAgXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIHJvbGxiYWNrQ2FjaGVDaGFuZ2VzKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgY2hhbmdlczogRW50aXR5Q2hhbmdlcyApOiB2b2lkIHtcbiAgICBzd2l0Y2goY2hhbmdlcy50eXBlKSB7XG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3IDogXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChtb2RlbCwga2V5KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTpcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNhY2hlLmdldCggbW9kZWwsIGtleSApXG4gICAgICAgIGlmICggZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuXG4gICAgICAgIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBlIVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwgZSwga2V5IClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6IFxuICAgICAgICBjb25zdCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdCggY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYyA9PiBjLm5hbWUsIGMgPT4gYy5vcmlnaW5hbClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBlbnRpdHksIGtleSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gcGVbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IHRydWVcbiAgICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OlxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGByZWplY3RDaGFuZ2VzIFZlcnNpb24gPSA/YClcbiAgfVxuICBcbiAgcHVibGljIHJvbGxiYWNrQ2hhbmdlcyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7dGhpcy5oaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5yZWplY3RDaGFuZ2VzKClcbiAgICB3aGlsZSggaGlzdG9yeVZlcnNpb24gPD0gdGhpcy5jdXJyZW50VmVyc2lvbiApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXNNYXAgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICAgIGNoYW5nZXNNYXAgJiYgY2hhbmdlc01hcC5mb3JFYWNoKCAoIGNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKSBcbiAgICAgICAgdGhpcy5yb2xsYmFja0NhY2hlQ2hhbmdlcyhtay5tb2RlbCwgbWsua2V5LCBjaGFuZ2VzKVxuICAgICAgfSlcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gLS1cbiAgICB9XG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4gcGUuX19kZXRhY2hlZF9fID0gdHJ1ZSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IE1hdGgubWluKHRoaXMubWluVmVyc2lvbiwgdGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7dGhpcy5jdXJyZW50VmVyc2lvbn1gKVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeSggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSB7XG4gICAgaWYgKCB0aGlzLm1pblZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gfHwgdGhpcy5jdXJyZW50VmVyc2lvbiA8IGhpc3RvcnlWZXJzaW9uICkgcmV0dXJuXG4gICAgZm9yKCBsZXQgdmVyID0gdGhpcy5taW5WZXJzaW9uOyB2ZXIgPCBoaXN0b3J5VmVyc2lvbjsgdmVyKysgKSB7XG4gICAgICB0aGlzLmhpc3RvcnkuZGVsZXRlKHZlcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGR1bXBDaGFuZ2VzKCBlYzogRW50aXR5Q2hhbmdlcyApOiBzdHJpbmcge1xuICAgIGxldCBwcm9wZXJ0eUNoYW5nZXMgPSAnJ1xuICAgIGVjLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2gocGMgPT4gcHJvcGVydHlDaGFuZ2VzICs9IGAke3BjLm5hbWV9OiAke3BjLm9yaWdpbmFsfSAtPiAke3BjLmN1cnJlbnR9LCBgKVxuXG4gICAgcmV0dXJuIGBkYlZlcnNpb249JHtlYy5kYlZlcnNpb259LCB0eXBlPSR7ZWMudHlwZX0sIFske3Byb3BlcnR5Q2hhbmdlc31dYFxuICB9XG5cbiAgcHVibGljIGR1bXBIaXN0b3J5KCkgOiBzdHJpbmcge1xuICAgIGxldCB2ZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgSElTVE9SWSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgd2hpbGUoIHZlcnNpb24gPj0gdGhpcy5taW5WZXJzaW9uICkge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLXZlcnNpb24gJHt2ZXJzaW9ufS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgbGV0IGhpcyA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbiggdmVyc2lvbiApXG4gICAgICBoaXMgJiYgaGlzLmZvckVhY2goICggZWMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBsZXQgY2hhbmdlcyA9IHRoaXMuZHVtcENoYW5nZXMoIGVjIClcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgICAgY29uc3QgbXNnID0gYHR5cGU9JHttay5tb2RlbH0sIGtleT0ke21rLmtleX0sIGNoYW5nZXM9eyR7Y2hhbmdlc319IFxcbmBcbiAgICAgICAgcmVzdWx0ICs9IG1zZ1xuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgICAgdmVyc2lvbi0tXG4gICAgfSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFja2VyU3FsQnVpbGRlciB7XG4gIHByaXZhdGUgdHJhY2tlcjogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlciwgbW9kZWxzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+LCBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyICkge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLm1vZGVscyA9IG1vZGVsc1xuICAgIHRoaXMuc3FsQnVpbGRlciA9IHNxbEJ1aWxkZXJcbiAgfVxuICBcbiAgcHVibGljIGdldCBlbnRpdHlUcmFja2VyKCkgeyByZXR1cm4gdGhpcy50cmFja2VyIH1cblxuICBwdWJsaWMgYnVpbGRDaGFuZ2VTcWxzKCkgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmRldGVjdENoYW5nZXMoKS5mb3JFYWNoKCBlYyA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5idWlsZFNxbEFuZFBhcmFtZXRlcnMoZWMuZW50aXR5KSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKHBlIDpQcm94aWVkPGFueT4pIDogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgY29uc3QgZW50aXR5ID0gRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSlcbiAgICBcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6XG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoIHBlLl9fc2NoZW1hX18sIGVudGl0eSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBsZXQgZW50aXR5Q2hhbmdlcyA9IHRoaXMudHJhY2tlci5nZXRMYXN0Q2hhbmdlcyhwZSkhXG4gICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoIGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMgLCBjPT4gYy5uYW1lLCBjPT4gYy5jdXJyZW50IClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uIC0gMSApXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVudGl0eSBzdGF0ZSAnJHtwZS5fX3N0YXRlX199J2ApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb24gKS5mb3JFYWNoKCBoaXMgPT4gaGlzLmZvckVhY2goICggZW50aXR5Q2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICBjb25zdCBtayA9IHRoaXMudHJhY2tlci5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobWsubW9kZWwpXG4gICAgICBzd2l0Y2goZW50aXR5Q2hhbmdlcy50eXBlKSB7XG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXc6XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHNjaGVtYSEsIG1rLmtleSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTogXG4gICAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUoc2NoZW1hISwgbWsua2V5LCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiApKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6XG4gICAgICAgICAgbGV0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydChzY2hlbWEhLCBlbnRpdHkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSkpXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbn1cblxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmV0dGVyLXNxbGl0ZTNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbmdlLWNhc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb24tc3FsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXNlY29uZGFyeVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zdWJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJscnUtY2FjaGVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9