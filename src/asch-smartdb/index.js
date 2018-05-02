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
    getAllCached(model, track = false) {
        const schema = this.getSchema(model);
        return this.entityCache.getAll(schema.modelName) || [];
    }
    findAll(model, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            if (schema.memCached) {
                let entities = this.entityCache.getAll(schema.modelName);
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
    getAll(modelName) {
        let result = new Array();
        let cache = this.getModelCache(modelName);
        if (cache === undefined)
            return undefined;
        cache.forEach(e => result.push(e));
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
            historyForRollback: 10,
            autoCleanPersistedHistory: false,
            entityCacheOptions: { default: 5000 }
        } || options;
        this.schemas = new Map();
        this.log = Log_1.LogManager.getLogger(SmartDB.name);
        this.blockDB = new LevelBlock_1.LevelBlock(levelBlockDir);
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
    init(...schemas) {
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
    beginBlock(blockHeader) {
        // TODO: verify blockHeader here
        Common_1.CodeContract.argument('blockHeader', () => Common_1.CodeContract.notNull(blockHeader));
        this.currentBlock = blockHeader;
    }
    /**
     * commit block changes
     */
    commitBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.currentBlock)
                throw new Error('Current block is null');
            yield this.blockDB.appendBlock(this.currentBlock, this.blockSession.getChanges());
            try {
                yield this.blockSession.saveChanges(this.currentBlock.height);
                this.blockSession.clearHistoryBefore(this.currentBlock.height - this.options.historyForRollback);
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
     * @param condition see @type SqlCondition
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
    getAllCached(model, track = false) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).getAllCached(model, track);
    }
    /**
     * find entities from database
     * @param model model name or model type
     * @param condition find condition see @type SqlCondition
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
     * @param condition query condition see @type SqlCondition
     * @param fields result fields, default is all fields
     * @param limit limit of result count
     * @param offset offset of result set
     * @param sort sort
     * @param join join info
     */
    query(model, condition, fields, limit, offset, sort, join) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).query(model, condition, fields, limit, offset, sort, join);
        });
    }
    /**
     * query if exists record by specified condition
     * @param model model name or model type
     * @param condition query condition see @type SqlCondition
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
     * @param condition query condition see @type SqlCondition
     */
    count(model, condition) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            let schema = this.getSchema(model, true);
            return yield this.getSession(schema).count(model, condition);
        });
    }
    /**
     * get block header by height
     * @param height block height
     */
    getBlockByHeight(height) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('height', height > 0, 'height must great than zero');
            return yield this.blockDB.getBlock(height);
        });
    }
    /**
     * get block header by block id
     * @param blockId block id
     */
    getBlockById(blockId) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('blockId', () => Common_1.CodeContract.notNullOrWhitespace(blockId));
            return yield this.blockDB.getBlockById(blockId);
        });
    }
    /**
     * get block headers by height range
     * @param minHeight min height(included)
     * @param maxHeight max height(included)
     */
    getBlocksByHeightRange(minHeight, maxHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('minHeight, maxHeight', minHeight > 0 && maxHeight >= minHeight, 'minHeight or maxHeight is invalid');
            return yield this.blockDB.getBlocksByHeightRange(minHeight, maxHeight);
        });
    }
    /**
     * get block headers by block id array
     * @param blockIds array of block id
     */
    getBlocksByIds(...blockIds) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('blockIds', () => Common_1.CodeContract.notNull(blockIds));
            return yield this.blockDB.getBlocksByIds(...blockIds);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3pFQSx1REFBaUM7QUF1Q2pDLHdCQUFrQyxRQUFxQixFQUFFLE1BQXlCLEVBQUUsUUFBdUI7SUFDekcsSUFBSSxHQUFHLEdBQUcsRUFBRTtJQUNaLEtBQUssSUFBSSxJQUFJLElBQUksUUFBUSxFQUFFO1FBQ3pCLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxHQUFHO0FBQ1osQ0FBQztBQU5ELHdDQU1D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O0lBRU0sSUFBSSxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDeEMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxNQUFNLENBQUU7UUFDNUQsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDekMsQ0FBQztJQUVNLEtBQUssQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3pDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQzFDLENBQUM7SUFFTSxHQUFHLENBQUUsR0FBVyxFQUFFLEdBQUcsTUFBYTtRQUN2QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLEtBQUssQ0FBRTtRQUMzRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBRTtJQUMxQyxDQUFDO0lBRU0sS0FBSyxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDekMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxPQUFPLENBQUU7UUFDN0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDMUMsQ0FBQztJQUVNLElB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Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiYXNjaC1zbWFydGRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gb2JqZWN0IHdpdGggYWxsIGNvbXBpbGVkIFdlYkFzc2VtYmx5Lk1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18udyA9IHt9O1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9JbmRleC50c1wiKTtcbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBLZXlPYmplY3QgPSB7IFxuICBrZXkgOiBzdHJpbmcsXG4gIGtleVBhcnQgKG5hbWU6IHN0cmluZykgOiBzdHJpbmcgfCBudW1iZXIgXG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmxvY2tIZWFkZXIge1xuICBoZWlnaHQgOiBudW1iZXJcbiAgaWQ/IDogc3RyaW5nXG4gIHRpbWVzdGFtcD8gOiBudW1iZXJcbiAgcGF5bG9hZExlbmd0aD8gOiBudW1iZXJcbiAgcGF5bG9hZEhhc2g/IDogc3RyaW5nXG4gIHByZXZCbG9ja0lkPyA6IHN0cmluZ1xuICBwb2ludElkPyA6IHN0cmluZ1xuICBwb2ludEhlaWdodD8gOiBudW1iZXJcbiAgZGVsZWdhdGU/IDogc3RyaW5nXG4gIHNpZ25hdHVyZT8gOiBzdHJpbmdcbiAgY291bnQ/IDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIEtleVZhbHVlUGFpciA9IHsga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkgfVxuZXhwb3J0IHR5cGUgQ2FsbGJhY2s8VFJlc3VsdD4gPSAoIGVycjogRXJyb3J8bnVsbCwgZGF0YTogVFJlc3VsdCApID0+IHZvaWRcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VKc29uT2JqZWN0PFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiwgZ2V0S2V5OiAodCA6IFQpID0+IHN0cmluZywgZ2V0VmFsdWU6ICh0OiBUKSA9PiBhbnkgICkge1xuICBsZXQgcmV0ID0ge31cbiAgZm9yIChsZXQgaXRlbSBvZiBpdGVyYWJsZSkge1xuICAgIHJldFtnZXRLZXkoaXRlbSldID0gZ2V0VmFsdWUoaXRlbSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQ29weTxUPihzcmMgOiBUKSA6IFQge1xuICBpZiAoICFzcmMgKSByZXR1cm4gc3JjXG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNyYykpXG59XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoIG1lc3NhZ2UgOiBzdHJpbmcgKSB7XG4gICAgc3VwZXIoICdDb2RlIGNvbnRyYWN0IEVycm9yLCcrIG1lc3NhZ2UgKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0Q29uZGl0aW9uID0gYm9vbGVhbiB8ICggKCkgPT4gYm9vbGVhbiApXG5leHBvcnQgdHlwZSBDb250cmFjdE1lc3NhZ2UgICA9IHN0cmluZyAgfCAoICgpID0+IHN0cmluZyApXG5cbmV4cG9ydCB0eXBlIE1heWJlVW5kZWZpbmVkPFQ+ID0gVCB8IHVuZGVmaW5lZFxuZXhwb3J0IHR5cGUgTnVsbGFibGU8VD4gPSBUIHwgbnVsbCB8IHVuZGVmaW5lZFxuXG5leHBvcnQgdHlwZSBDb250cmFjdFZlcmlmeVJlc3VsdCA9IHsgcmVzdWx0IDogYm9vbGVhbiwgbWVzc2FnZTogTnVsbGFibGU8c3RyaW5nPiB9IFxuZXhwb3J0IHR5cGUgVmVyaWZ5RnVuY3Rpb24gPSAoKSA9PiBDb250cmFjdFZlcmlmeVJlc3VsdFxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0IHtcbiAgcHVibGljIHN0YXRpYyB2ZXJpZnkoIGNvbmRpdGlvbjogQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UgOiBDb250cmFjdE1lc3NhZ2UgKSA6IHZvaWQge1xuICAgIGlmICggY29uZGl0aW9uID09PSB1bmRlZmluZWQgfHwgY29uZGl0aW9uID09PSBudWxsICkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcmlmeSBjb25kaXRpb24nKVxuXG4gICAgY29uc3QgY29uZCA9IGlzRnVuY3Rpb24oY29uZGl0aW9uKSA/IChjb25kaXRpb24gYXMgRnVuY3Rpb24pKCkgOiBjb25kaXRpb25cbiAgICBjb25zdCBtc2cgPSBpc0Z1bmN0aW9uKG1lc3NhZ2UpID8gKG1lc3NhZ2UgYXMgRnVuY3Rpb24pKCkgOiBtZXNzYWdlXG5cbiAgICBpZiAoIWNvbmQpIHRocm93IG5ldyBDb2RlQ29udHJhY3RFcnJvciggbXNnIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYXJndW1lbnQoIGFyZ05hbWU6IHN0cmluZywgdmVyaWZ5OiBWZXJpZnlGdW5jdGlvbiB8IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlPyA6IENvbnRyYWN0TWVzc2FnZSApOiB2b2lkIHtcbiAgICBpZiAoICFhcmdOYW1lIHx8ICF2ZXJpZnkgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJnTmFtZSBvciB2ZXJpZnkgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGlmICggIW1lc3NhZ2UgKSB7XG4gICAgICBjb25zdCB2ciA9ICAodmVyaWZ5IGFzIFZlcmlmeUZ1bmN0aW9uKSgpXG4gICAgICBDb2RlQ29udHJhY3QudmVyaWZ5KCB2ci5yZXN1bHQsIGBhcmd1bWVudCAnJHthcmdOYW1lfScgJHt2ci5tZXNzYWdlfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBDb2RlQ29udHJhY3QudmVyaWZ5KHZlcmlmeSBhcyBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSEpICAgIFxuICB9XG5cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGwoIGFyZyA6IGFueSApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGFyZyAhPT0gbnVsbCAmJiBhcmcgIT09IHVuZGVmaW5lZFxuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPckVtcHR5KCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbChzdHIpICYmIHN0ciAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciBlbXB0eSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JXaGl0ZXNwYWNlKCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbE9yRW1wdHkoIHN0ciApICYmICggc3RyIGFzIHN0cmluZyApLnRyaW0oKSAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciB3aGl0ZXNwYWNlJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxufVxuXG5cbiIsImltcG9ydCB7IEVudGl0eUNhY2hlLCBMUlVFbnRpdHlDYWNoZSwgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi9Nb2RlbCc7XG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IEpzb25TcWxCdWlsZGVyLCBTcWxDb25kaXRpb24gfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBFbnRpdHksIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXkgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFByb3hpZWRFbnRpdHlUcmFja2VyLCBUcmFja2VyU3FsQnVpbGRlciwgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5RXh0ZW5zaW9uIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTYXZlSGlzdG9yeUFjdGlvbiA9ICggdmVyc2lvbjogbnVtYmVyLCBoaXN0b3J5OiBNYXA8c3RyaW5nLCBFbnRpdHlDaGFuZ2VzPiApID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIERiU2Vzc2lvbiB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY29ubmVjdGlvbjogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzZXNzaW9uQ2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIHNxbEJ1aWxkZXIgOiBKc29uU3FsQnVpbGRlclxuICBwcml2YXRlIHRyYWNrZXJTcWxCdWlsZGVyOiBUcmFja2VyU3FsQnVpbGRlclxuICBwcml2YXRlIGVudGl0eVRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIHNlc3Npb25TZXJpYWwgOiBudW1iZXJcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24sIGNhY2hlT3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucywgc2Vzc2lvbk5hbWU/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBEYlNlc3Npb24ubmFtZSArICggc2Vzc2lvbk5hbWUgPT09IHVuZGVmaW5lZCA/ICcnIDogYF8ke3Nlc3Npb25OYW1lfWApICApXG4gICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gMFxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSlcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucnVuU2NyaXB0KHNxbClcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNjaGVtYSguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IHZvaWQge1xuICAgIHNjaGVtYXMuZm9yRWFjaCggcyA9PiB0aGlzLm1vZGVscy5zZXQocy5tb2RlbE5hbWUsIHMpIClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtb2RlbE5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5Q2xhc3M8VEVudGl0eT4oY2xheno6IENvbnN0cnVjdG9yPFRFbnRpdHk+KSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQoY2xhenoubmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHtjbGF6ei5uYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiApIHtcbiAgICByZXR1cm4gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWwpIDogXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5Q2xhc3MobW9kZWwpXG4gIH1cblxuICBwcm90ZWN0ZWQgbWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5KCB7fSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCB0cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgIGVudGl0aWVzIDogQXJyYXk8VEVudGl0eT4sIGNhY2hlID0gdHJ1ZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlKSApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgZSAsIHNjaGVtYS5nZXRLZXkoZSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0KGNsZWFyQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuc3RvcFRyYWNrQWxsKClcbiAgICBpZiAoIGNsZWFyQ2FjaGUgKSB0aGlzLmVudGl0eUNhY2hlLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZXNldCggdHJ1ZSApXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSB7XG4gICAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSApIVxuICAgICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzIFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5maW5kTWFueSggbW9kZWwsIHsgfSwgdHJhY2sgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGZpbmRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uKVxuICAgIFxuICAgIGxldCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIHJldHVybiAhdHJhY2sgPyBlbnRpdGllcyA6XG4gICAgICB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeTxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIGZpZWxkcz86IEFycmF5PHN0cmluZz4sIGxpbWl0PyA6IG51bWJlciAsIG9mZnNldD8gOiBudW1iZXIsIHNvcnQ/IDogSnNvbk9iamVjdCwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uLCBsaW1pdCwgb2Zmc2V0LCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeX0pIGFzIGV4aXN0YFxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeSggcXVlcnksIHBhcmFtZXRlcnMgKVxuICAgIFxuICAgIHJldHVybiBpc0FycmF5KHJldCkgJiYgcGFyc2VJbnQocmV0WzBdWydleGlzdCddKSA+IDAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCByZXQgPSBhd2FpdCB0aGlzLnF1ZXJ5KCBtb2RlbCwgY29uZGl0aW9uLCBbJ2NvdW50KCopIGFzIGNvdW50J10gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgZXhpc3RzID0gdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKHNjaGVtYS5tb2RlbE5hbWUsIGtleSkgfHwgdGhpcy5lbnRpdHlUcmFja2VyLmlzVHJhY2tpbmcoc2NoZW1hLCB0aGVFbnRpdHkpXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nICkgYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXkgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGVudGl0eSEsIGtleSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KHNjaGVtYSwga2V5KVxuICAgIGlmICggcGUgKSByZXR1cm4gcGUgYXMgRW50aXR5IGFzIFRFbnRpdHlcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldChtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlbnRpdHkpIGFzIFRFbnRpdHkgXG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIHNhdmVDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUNoYW5nZXMoc2VyaWFsPyA6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJldFNlcmlhbCA9IHNlcmlhbCB8fCArK3RoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRDaGFuZ2VTcWxzKClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaFN5bmMoIC4uLnNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8IHNlcmlhbCApIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcblxuICAgIGNvbnN0IGZyb20gPSB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyAoIHNlcmlhbCA9ICR7c2VyaWFsfSApYClcblxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKHNlcmlhbClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkgeyAgICAgIFxuICAgICAgZm9yIChjb25zdCBzcWwgb2Ygc3FscykgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbCAtIDFcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc051bWJlciwgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzUHJpbWl0aXZlIH0gZnJvbSAndXRpbCc7XG5cbi8qKlxuICogY2FjaGUgb3B0aW9uc1xuICovXG5leHBvcnQgdHlwZSBFbnRpdHlDYWNoZU9wdGlvbnMgPSB7IFxuICBkZWZhdWx0IDogbnVtYmVyLFxuICBbbW9kZWw6IHN0cmluZ106ICBudW1iZXIgfCAoICggbW9kZWw6IHN0cmluZyApID0+IG51bWJlciApXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2FjaGUge1xuICBtb2RlbHMgOiBBcnJheTxzdHJpbmc+XG4gIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZFxuICBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcpIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+XG4gIHB1dChtb2RlbE5hbWU6IHN0cmluZywgZW50aXR5OiBFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiB2b2lkXG4gIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWRcbiAgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuICBcbn1cblxuZXhwb3J0IGNsYXNzIExSVUVudGl0eUNhY2hlIGltcGxlbWVudHMgRW50aXR5Q2FjaGUge1xuICBwcml2YXRlIHN0YXRpYyBNSU5fQ0FDSEVEX0NPVU5UID0gMTAwXG4gIHByaXZhdGUgc3RhdGljIERFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UID0gMTAwMDBcblxuICBwcml2YXRlIG9wdGlvbnM6IEVudGl0eUNhY2hlT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIG1vZGVsQ2FjaGVzIDogTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHsgZGVmYXVsdCA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UIH1cbiAgICAvLyBmb3IoIGxldCBrIGluIHRoaXMub3B0aW9ucyApIFxuICAgIC8vICAgdGhpcy5vcHRpb25zW2tdID0gaXNOdW1iZXIodGhpcy5vcHRpb25zW2tdKSA/IHRoaXMub3B0aW9uc1trXSA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKExSVUVudGl0eUNhY2hlLm5hbWUpXG4gICAgdGhpcy5tb2RlbENhY2hlcyA9IG5ldyBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PigpXG4gIH1cblxuICBwcml2YXRlIGdldE1vZGVsQ2FjaGUobW9kZWxOYW1lIDogc3RyaW5nLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlLCB0aHJvd0lmTm90RXhpc3RzID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TFJVLkNhY2hlPEVudGl0eUtleSwgRW50aXR5Pj4ge1xuICAgIGlmICggY3JlYXRlSWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIHsgXG4gICAgICAvLyBjb25zdCBvcHRpb25zID0ge1xuICAgICAgLy8gICBtYXg6IDUwMCxcbiAgICAgIC8vICAgbGVuZ3RoOiBmdW5jdGlvbiAobiwga2V5KSB7IHJldHVybiBuICogMiArIGtleS5sZW5ndGggfSxcbiAgICAgIC8vICAgLy9kaXNwb3NlOiBmdW5jdGlvbiAoa2V5LCBuKSB7IG4uY2xvc2UoKSB9LFxuICAgICAgLy8gICBtYXhBZ2U6IDEwMDAgKiA2MCAqIDYwIFxuICAgICAgLy8gfVxuICAgICAgbGV0IG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuICAgICAgaWYgKCAhdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KG1vZGVsTmFtZSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdFxuICAgICAgZWxzZSBpZiAoIGlzTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IE51bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSlcbiAgICAgIGVsc2UgaWYgKCBpc0Z1bmN0aW9uKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSlcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSAoIHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdIGFzIChtb2RlbCk9PiBudW1iZXIgKSggbW9kZWxOYW1lIClcbiAgICAgIGVsc2UgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgICAgbWF4Q2FjaGVkQ291bnQgPSBNYXRoLm1heCggTFJVRW50aXR5Q2FjaGUuTUlOX0NBQ0hFRF9DT1VOVCwgbWF4Q2FjaGVkQ291bnQgKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5zZXQobW9kZWxOYW1lLCBuZXcgTFJVPHN0cmluZywgRW50aXR5PiggbWF4Q2FjaGVkQ291bnQgKSApXG4gICAgfVxuICAgICBpZiAoIHRocm93SWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIFxuICAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kZWwgY2FjaGUgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKSAgZG9lcyBub3QgZXhpc3RzYCkgXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5tb2RlbENhY2hlcy5nZXQobW9kZWxOYW1lKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldENhY2hlS2V5KCBrZXk6IEVudGl0eUtleSApIDogbnVtYmVyIHwgc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmltaXRpdmUoa2V5KSA/IGtleSBhcyBudW1iZXIgfCBzdHJpbmcgOiAoIGtleSBhcyBLZXlPYmplY3QgKS5rZXlcbiAgfVxuXG4gIHB1YmxpYyBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWQgeyAgICBcbiAgICBpZiAoIGlzU3RyaW5nKG1vZGVsTmFtZSkgKSB7XG4gICAgICB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIHRydWUgKSEucmVzZXQoKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5kZWxldGUoIG1vZGVsTmFtZSApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICggbGV0IGMgb2YgdGhpcy5tb2RlbENhY2hlcy52YWx1ZXMoKSApIHtcbiAgICAgIGMucmVzZXQoKVxuICAgIH1cbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxzKCkgOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICBmb3IoIGxldCBtIG9mIHRoaXMubW9kZWxDYWNoZXMua2V5cygpICkge1xuICAgICAgcmVzdWx0LnB1c2goIG0gKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcblxuICAgIHJldHVybiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSA/IHVuZGVmaW5lZCA6XG4gICAgICBtb2RlbENhY2hlIS5oYXMoY2FjaGVLZXkpID8gbW9kZWxDYWNoZSEuZ2V0KGNhY2hlS2V5KSBhcyBURW50aXR5IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nKSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4gcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApKVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHB1dCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0ga2V5ID0gJHtrZXl9IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX1gKSAgICBcbiAgICB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lLCB0cnVlKSEuc2V0KHRoaXMuZ2V0Q2FjaGVLZXkoa2V5KSwgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWQge1xuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBldml0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSBrZXkgPSAke2NhY2hlS2V5fWApXG5cbiAgICBjb25zdCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBpZiAobW9kZWxDYWNoZSkgbW9kZWxDYWNoZS5kZWwoY2FjaGVLZXkpXG4gIH1cbiAgXG4gIHB1YmxpYyBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldChtb2RlbE5hbWUsICB0aGlzLmdldENhY2hlS2V5KCBrZXkgKSkgIT09IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGR1bXBDYWNoZSgpIDogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIENBQ0hFICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmZvckVhY2goIChjYWNoZSwgbW9kZWwpID0+IHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS1Nb2RlbCAke21vZGVsfS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgY2FjaGUuZm9yRWFjaCggKCBlbnRpdHksIGtleSApID0+IHtcbiAgICAgICAgcmVzdWx0ICs9IGBrZXkgPSAke3RoaXMuZ2V0Q2FjaGVLZXkoIGtleSApfSwgZW50aXR5ID0geyR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX19IFxcbmBcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICB9KSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxufSIsImltcG9ydCAqIGFzIHNkYiBmcm9tICcuL1NtYXJ0REInXG5pbXBvcnQgKiBhcyBtb2RlbCBmcm9tICcuL01vZGVsJ1xuaW1wb3J0ICogYXMgY29tbW9uIGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9ja0hlYWRlciA9IGNvbW1vbi5CbG9ja0hlYWRlclxuICBleHBvcnQgY29uc3QgRGJTZXNzaW9uID0gc2Vzc2lvbi5EYlNlc3Npb25cbiAgZXhwb3J0IHR5cGUgRGJDb25uZWN0aW9uID0gY29ubi5EYkNvbm5lY3Rpb25cbiAgZXhwb3J0IGNvbnN0IFNxbGl0ZUNvbm5lY3Rpb24gPSBzcWxpdGUuU3FsaXRlQ29ubmVjdGlvblxufSBcbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgKiBhcyBzdWJsZXZlbCBmcm9tICdsZXZlbC1zdWJsZXZlbCdcblxuY29uc3QgbGV2ZWwgPSByZXF1aXJlKCdsZXZlbCcpXG5jb25zdCBTZW5vbmRhcnkgPSByZXF1aXJlKCdsZXZlbC1zZWNvbmRhcnknKVxuXG5leHBvcnQgdHlwZSBHZXRJbmRleFZhbHVlRnVuYyA9IChrZXk6IGFueSwgdmFsdWU6IEpzb25PYmplY3QpID0+IGFueVxuZXhwb3J0IHR5cGUgSW5kZXhGaWVsZCA9IHsgZmllbGROYW1lOiBzdHJpbmcsIGNhbGNJbmRleD86IEdldEluZGV4VmFsdWVGdW5jIH1cblxuZXhwb3J0IGNsYXNzIFN1YkxldmVsTWV0YSB7XG4gIHB1YmxpYyBzdWJOYW1lOiBzdHJpbmdcbiAgcHVibGljIGtleUZpZWxkIDogc3RyaW5nXG4gIHB1YmxpYyBpbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKHN1Yk5hbWU6IHN0cmluZywga2V5RmllbGQ6IHN0cmluZywgaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKSkge1xuICAgIHRoaXMuc3ViTmFtZSA9IHN1Yk5hbWVcbiAgICB0aGlzLmtleUZpZWxkID0ga2V5RmllbGRcbiAgICB0aGlzLmluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KGluZGV4RmllbGRzKVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5pbmRleEZpZWxkcy5maW5kSW5kZXgoaXRlbSA9PiBmaWVsZE5hbWUgPT09IGl0ZW0uZmllbGROYW1lKVxuICB9XG5cbiAgcHVibGljIGV4aXN0c0luZGV4KGZpZWxkTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSkgPiAtMVxuICB9XG5cbiAgcHVibGljIGFkZEluZGV4KGZpZWxkTmFtZSA6IHN0cmluZywgY2FsY0luZGV4IDogR2V0SW5kZXhWYWx1ZUZ1bmMpOiB0aGlzIHtcbiAgICBpZiAodGhpcy5leGlzdHNJbmRleChmaWVsZE5hbWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbmRleCBvZiBmaWVsZCAnJHtmaWVsZE5hbWV9JyBhbHJlYWR5IGV4aXN0c2ApXG5cbiAgICB0aGlzLmluZGV4RmllbGRzLnB1c2goeyBmaWVsZE5hbWUsIGNhbGNJbmRleCB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlSW5kZXgoZmllbGROYW1lKTogdGhpcyB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpXG4gICAgaWYgKGlkeCA+IC0xKSB7XG4gICAgICB0aGlzLmluZGV4RmllbGRzLnNsaWNlKGlkeCwgMSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzZSgpIDogQ2FsbGJhY2s8YW55PiB7XG4gIGxldCBjYWxsYmFja1xuICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY2FsbGJhY2sgPSAoZXJyLCB2YWx1ZSkgPT4gZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKHZhbHVlKVxuICB9KVxuICBjYWxsYmFjay5wcm9taXNlID0gcHJvbWlzZVxuICByZXR1cm4gY2FsbGJhY2tcbn1cblxuZnVuY3Rpb24gcHJvbWlzaWZ5KGNhbGxiYWNrIDogQ2FsbGJhY2s8YW55PiB8IHVuZGVmaW5lZCApIDogeyBjYWxsYmFjazogQ2FsbGJhY2s8YW55PiwgcHJvbWlzZTogUHJvbWlzZTxhbnk+fG51bGwgfSB7XG4gIGxldCBwcm9taXNlID0gbnVsbFxuXG4gIGlmICggIWNhbGxiYWNrICkge1xuICAgIGNhbGxiYWNrID0gbWFrZVByb21pc2UoKVxuICAgIHByb21pc2UgPSBjYWxsYmFja1sncHJvbWlzZSddXG4gIH1cblxuICByZXR1cm57IGNhbGxiYWNrLCBwcm9taXNlIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbFJlYWRhYmxlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVTdHJlYW0ge1xuICBvbiggZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrIDogRnVuY3Rpb24gKSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbEdldCB7XG4gIGdldDxUPihrZXk6IGFueSwgb3B0aW9ucz86IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KSA6IFByb21pc2U8VD5cbiAgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbE9wZXJhdGlvbiB7XG4gIHB1dDxUPihrZXkgOiBhbnksIHZhbHVlIDogVCwgb3B0aW9ucz86IEpzb25PYmplY3QsIGNhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBiYXRjaChvcGVyQXJyYXk6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPzogSnNvbk9iamVjdCkgOiBQcm9taXNlPHZvaWQ+IFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4ZWRMZXZlbCBleHRlbmRzIExldmVsR2V0LCBMZXZlbE9wZXJhdGlvbiB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgaW5kZXhlcyA6IEFycmF5PEluZGV4RmllbGQ+XG4gIGJ5SW5kZXgoaW5kZXhGaWVsZDogc3RyaW5nKSA6IExldmVsR2V0XG4gIGdldEJ5KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxKc29uT2JqZWN0Pik6IFByb21pc2U8SnNvbk9iamVjdD5cbn1cblxuZXhwb3J0IGNsYXNzIExldmVsREIgeyAgXG4gIHByaXZhdGUgZGJEaXIgOiBzdHJpbmdcbiAgcHJpdmF0ZSBzdWJNZXRhcyA6IEFycmF5PFN1YkxldmVsTWV0YT5cbiAgcHJpdmF0ZSBzdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuICBwcml2YXRlIHN1YkxldmVsZGIgOiBzdWJsZXZlbC5TdWJsZXZlbFxuXG4gIGNvbnN0cnVjdG9yKGRiRGlyIDogc3RyaW5nLCBtZXRhIDogQXJyYXk8U3ViTGV2ZWxNZXRhPiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5kYkRpciA9IGRiRGlyXG4gICAgdGhpcy5zdWJNZXRhcyA9IG5ldyBBcnJheTxTdWJMZXZlbE1ldGE+KCkuY29uY2F0KG1ldGEpXG4gICAgdGhpcy5zdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgSW5kZXhlZExldmVsPigpXG4gICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0KCkge1xuICAgIHRoaXMubGV2ZWxkYiA9IGxldmVsKCB0aGlzLmRiRGlyLCB7IHZhbHVlRW5jb2Rpbmc6ICdqc29uJyB9IClcbiAgICB0aGlzLnN1YkxldmVsZGIgPSBzdWJsZXZlbCh0aGlzLmxldmVsZGIpXG4gICAgdGhpcy5zdWJNZXRhcy5mb3JFYWNoKHMgPT4gdGhpcy5yZWdpc3RlclN1YkxldmVsKHMpKVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlclN1YkxldmVsKCBtZXRhOiBTdWJMZXZlbE1ldGEgKSB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbGRiLnN1YmxldmVsKG1ldGEuc3ViTmFtZSlcbiAgICBjb25zdCBpbmRleGVkU3ViID0gbmV3IEluZGV4ZWRTdWJMZXZlbChzdWIsIG1ldGEuc3ViTmFtZSwgbWV0YS5rZXlGaWVsZCwgLi4ubWV0YS5pbmRleEZpZWxkcykgICAgXG4gICAgdGhpcy5zdWJMZXZlbHMuc2V0KCBtZXRhLnN1Yk5hbWUsIGluZGV4ZWRTdWIpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGxldmVsKCkge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGJcbiAgfVxuXG4gIHB1YmxpYyBnZXRTdWJMZXZlbCggc3ViTmFtZTogc3RyaW5nICkgOiBJbmRleGVkTGV2ZWwge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxzLmdldChzdWJOYW1lKVxuICAgIGlmICggIXN1YiApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBzdWJMZXZlbCBuYW1lID0gJyR7c3ViTmFtZX0nYClcblxuICAgIHJldHVybiBzdWJcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKG9wZW5DYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KTogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KG9wZW5DYWxsYmFjaylcblxuICAgIGlmICh0aGlzLmlzT3Blbikge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIHJldHVybiBwcm9taXNlXG4gICAgfVxuICAgIFxuICAgIChhc3luYygpPT4geyBcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMuaW5pdCgpXG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpICAgICAgXG4gICAgICB9XG4gICAgICBjYXRjaChlcnIpIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgZXJyLCBzZWxmKVxuICAgICAgfVxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2xvc2VDYWxsYmFjaz8gOiBDYWxsYmFjazxhbnk+KSA6IFByb21pc2U8dm9pZD58bnVsbCB7XG4gICAgbGV0IHNlbGYgPSB0aGlzXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeShjbG9zZUNhbGxiYWNrKVxuICAgIFxuICAgIGlmICh0aGlzLmlzQ2xvc2VkKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG5cbiAgICAoYXN5bmMoKT0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubGV2ZWxkYi5jbG9zZSgpXG4gICAgICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIpXG4gICAgICB9ICBcbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYiAmJiB0aGlzLmxldmVsZGIuaXNPcGVuKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuICghdGhpcy5sZXZlbGRiKSB8fCB0aGlzLmxldmVsZGIuaXNDbG9zZWQoKVxuICB9XG59XG5cbmNsYXNzIEluZGV4ZWRTdWJMZXZlbCBpbXBsZW1lbnRzIEluZGV4ZWRMZXZlbCB7XG4gIHByaXZhdGUgc3ViTmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGtleUZpZWxkIDogc3RyaW5nXG4gIHByaXZhdGUgaW5kZXhBcnJheSA6IEFycmF5PEluZGV4RmllbGQ+XG4gIHByaXZhdGUgaW5kZXhlZFN1YkxldmVscyA6IE1hcDxzdHJpbmcsIExldmVsR2V0PlxuICBwcml2YXRlIGxldmVsZGIgOiBhbnlcblxuICBwdWJsaWMgZ2V0IG5hbWUoKSB7IHJldHVybiB0aGlzLnN1Yk5hbWUgfVxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSB7IHJldHVybiB0aGlzLmluZGV4QXJyYXkgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3VibGV2ZWw6IGFueSwgc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZCA6IHN0cmluZywgLi4uaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPikge1xuICAgIHRoaXMubGV2ZWxkYiA9IHN1YmxldmVsXG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhBcnJheSA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdCguLi5pbmRleEZpZWxkcylcbiAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgTGV2ZWxHZXQ+KClcbiAgICB0aGlzLmluZGV4QXJyYXkuZm9yRWFjaCggZiA9PiB7XG4gICAgICBsZXQgc3ViID0gU2Vub25kYXJ5KCBzdWJsZXZlbCwgZi5maWVsZE5hbWUsIGYuY2FsY0luZGV4IClcbiAgICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscy5zZXQoIGYuZmllbGROYW1lLCBzdWIgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlGaWVsZFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zOiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPiApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBrZXlMZXZlbCA9IHRoaXMubGV2ZWxkYiBhcyBJbmRleGVkU3ViTGV2ZWwgXG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoZ2V0Q2FsbGJhY2spXG4gICAga2V5TGV2ZWwuZ2V0PFQ+KGtleSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBieUluZGV4KCBpbmRleEZpZWxkTmFtZSA6IHN0cmluZyApIDogTGV2ZWxHZXQge1xuICAgIGNvbnN0IGxldmVsR2V0ID0gIHRoaXMuaW5kZXhlZFN1YkxldmVscy5nZXQoaW5kZXhGaWVsZE5hbWUpXG4gICAgaWYgKCAhbGV2ZWxHZXQgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggaW5kZXggZmllbGQgPSAnJHtpbmRleEZpZWxkTmFtZX0nYClcblxuICAgIHJldHVybiBsZXZlbEdldFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPik6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGluZGV4TGV2ZWwgPSB0aGlzLmJ5SW5kZXgoaW5kZXhGaWVsZClcbiAgICByZXR1cm4gYXdhaXQgaW5kZXhMZXZlbC5nZXQ8VD4oa2V5LCBnZXRDYWxsYmFjaylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBwdXQ8VD4oa2V5OiBhbnksIHZhbHVlOiBULCBwdXRDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrICwgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KHB1dENhbGxiYWNrKVxuICAgIHRoaXMubGV2ZWxkYi5wdXQoa2V5LCB2YWx1ZSwgY2FsbGJhY2spXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGRlbENhbGxiYWNrKVxuICAgIHRoaXMubGV2ZWxkYi5kZWwoa2V5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmF0Y2goYXJyYXkgOiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz8gOiBKc29uT2JqZWN0LCBiYXRjaENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkgcmV0dXJuIHRoaXMubGV2ZWxkYi5iYXRjaCgpXG5cbiAgICBsZXQgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCFpc0Z1bmN0aW9uKG9wdGlvbnMpKVxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoIGhhc09wdGlvbnMgPyBiYXRjaENhbGxiYWNrIDogb3B0aW9ucyBhcyBDYWxsYmFjazxhbnk+KVxuXG4gICAgaWYgKGhhc09wdGlvbnMpXG4gICAgICB0aGlzLmxldmVsZGIuYmF0Y2goYXJyYXksIG9wdGlvbnMsIGNhbGxiYWNrKVxuICAgIGVsc2VcbiAgICAgIHRoaXMubGV2ZWxkYi5iYXRjaChhcnJheSwgY2FsbGJhY2spXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLmxldmVsZGIuY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnMpXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zKVxuICB9XG5cbn1cbiIsImltcG9ydCB7IExldmVsREIsIEluZGV4ZWRMZXZlbCwgU3ViTGV2ZWxNZXRhIH0gZnJvbSAnLi9LVkRCL0xldmVsREInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBCbG9ja0hlYWRlciwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbic7XG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEJsb2NrSGVpZ2h0IDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoIGRpciA6IHN0cmluZywgbGV2ZWxPcHRpb25zID0ge30gKSB7XG4gICAgLyogXG4gICAgICB7IGlkKDY0KSwgdGltZXN0YW1wKGJpZ2ludCksIGhlaWdodChiaWdpbnQpLCBwYXlsb2FkTGVuZ3RoKGJpZ2ludCksIHBheWxvYWRIYXNoKDY0KSwgcHJldkJsb2NrSWQoNjQpLCBcbiAgICAgICAgcG9pbnRJZCg2NCksIHBvaW50SGVpZ2h0KGJpZ2ludCksIGRlbGVnYXRlKDY0KSwgc2lnbmF0dXJlKDEyOCksIGNvdW50KGJpZ2ludCkgfVxuICAgICovXG4gICAgY29uc3QgYmxvY2tNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnYmxrJywgJ2hlaWdodCcsIFtcbiAgICAgIHsgZmllbGROYW1lOiAnaWQnIH0sIFxuICAgICAgeyBmaWVsZE5hbWU6ICdkZWxlZ2F0ZScgfVxuICAgIF0pXG4gICAgY29uc3QgY2hhbmdlc0xvZ01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdoaXMnLCAnaGVpZ2h0JywgW10pXG4gICAgXG4gICAgdGhpcy5kYiA9IG5ldyBMZXZlbERCKCBkaXIsIFtibG9ja01ldGEsIGNoYW5nZXNMb2dNZXRhXSwgbGV2ZWxPcHRpb25zIClcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IDBcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB7IGhlaWdodCB9ID0gIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8eyBoZWlnaHQ6IG51bWJlciB9PihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlIFxuXG4gICAgICBsZXQgbGFzdEhlaWdodCA9IHsgaGVpZ2h0OiAwIH1cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5wdXQoTEFTVF9CTE9DS19IRUlHSFRfS0VZLCBsYXN0SGVpZ2h0KVxuICAgICAgcmV0dXJuIGxhc3RIZWlnaHQuaGVpZ2h0XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIG9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5kYi5vcGVuKClcbiAgICB0aGlzLmJsb2NrRGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdibGsnKVxuICAgIHRoaXMuaGlzdG9yeURiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnaGlzJylcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IGF3YWl0IHRoaXMuZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRMYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCBcbiAgfVxuXG4gIHByaXZhdGUgaXNLZXlOb3RGb3VuZEVycm9yKGUpIDogYm9vbGVhbiB7IFxuICAgIHJldHVybiBlLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhcHBlbmRCbG9jayggYmxvY2sgOiBCbG9ja0hlYWRlciwgY2hhbmdlczogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+ICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghYmxvY2sgfHwgIWJsb2NrLmhlaWdodCB8fCAhYmxvY2suaWQgfHwgIWJsb2NrLmRlbGVnYXRlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJsb2NrIGRhdGFgKVxuXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIucHV0KGJsb2NrLmhlaWdodCwgY2hhbmdlcylcbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogYmxvY2suaGVpZ2h0LCB2YWx1ZTogYmxvY2sgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBibG9jay5oZWlnaHQgfSB9IF0pXG5cbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBoZWlnaHQgLSAxIH0gfSBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RCbG9ja0hlaWdodCAtLVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZyApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgYmxvY2tzID0gYXdhaXQgdGhpcy5ibG9ja0RiLmdldEJ5KCdpZCcsIGJsb2NrSWQpXG4gICAgcmV0dXJuIChibG9ja3MubGVuZ3RoID09PSAwKSA/IHVuZGVmaW5lZCA6IGJsb2Nrc1swXVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgcmV0dXJuIGF3YWl0ICgobWluSGVpZ2h0LCBtYXhIZWlnaHQpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlcywgcmVqKSA9PiB7XG4gICAgICAgIGxldCBibG9ja3MgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KCkgICAgICBcbiAgICAgICAgdGhpcy5ibG9ja0RiLmNyZWF0ZVJlYWRTdHJlYW0oeyBzdGFydDogbWluSGVpZ2h0LCBlbmQ6IG1heEhlaWdodH0pXG4gICAgICAgICAgLm9uKCdkYXRhJywgZGF0YSA9PiBibG9ja3MucHVzaChkYXRhKSApXG4gICAgICAgICAgLm9uKCdlcnJvcicsIGUgPT4gcmVqKGUpIClcbiAgICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlcyhibG9ja3MpIClcbiAgICAgIH0pXG4gICAgfSkobWluSGVpZ2h0LCBtYXhIZWlnaHQpIGFzIEFycmF5PEJsb2NrSGVhZGVyPlxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCAuLi5ibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgS2V5T2JqZWN0LCBDb2RlQ29udHJhY3QgYXMgREJDIH0gZnJvbSAnLi9Db21tb24nO1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUPiA9IHsgbmV3KCkgOiBUIH1cbmV4cG9ydCB0eXBlIE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiA9IHN0cmluZyB8IENvbnN0cnVjdG9yPFRFbnRpdHk+XG5cbmV4cG9ydCBlbnVtIEZpZWxkVHlwZXMge1xuICBTdHJpbmcgICA9ICdTdHJpbmcnLFxuICBOdW1iZXIgICA9ICdOdW1iZXInLFxuICBCaWdJbnQgICA9ICdCaWdJbnQnLFxuICBUZXh0ICAgICA9ICdUZXh0J1xufVxuXG5leHBvcnQgdHlwZSBGaWVsZFR5cGUgPSBzdHJpbmcgfCBGaWVsZFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENPTVBPU0lURV9LRVlfU0VQQVJBVE9SID0gJ18mXydcbiAgcHJpdmF0ZSBlbnRpdHkgOiBFbnRpdHlcbiAgcHJpdmF0ZSBmaWVsZHMgOiBBcnJheTxzdHJpbmc+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBlbnRpdHk6IEVudGl0eSwgLi4uZmllbGRzOiBBcnJheTxzdHJpbmc+ICkge1xuICAgIHRoaXMuZW50aXR5ID0gZW50aXR5XG4gICAgdGhpcy5maWVsZHMgPSBuZXcgQXJyYXk8c3RyaW5nPiguLi5maWVsZHMpXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1ha2VLZXkoIC4uLnZhbHVlcyA6IEFycmF5PHN0cmluZ3xudW1iZXI+ICkgOiBzdHJpbmcge1xuICAgIERCQy5hcmd1bWVudCggJ3ZhbHVlcycsICB2YWx1ZXMgJiYgdmFsdWVzLmxlbmd0aCA+IDEgLCAndmFsdWVzIG11c3QgY29udGFpbnMgbW9yZSB0aGFuIDEgaXRlbScgKVxuXG4gICAgcmV0dXJuIG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPiguLi52YWx1ZXMpLmpvaW4oIENvbXBvc2l0ZUtleS5DT01QT1NJVEVfS0VZX1NFUEFSQVRPUiApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIHsgXG4gICAgbGV0IHZhbHVlcyA9IG5ldyBBcnJheTxzdHJpbmd8bnVtYmVyPigpXG4gICAgdGhpcy5maWVsZHMuZm9yRWFjaCggZiA9PiB2YWx1ZXMucHVzaCggdGhpcy5lbnRpdHlbZl0gKSApXG4gICAgcmV0dXJuIENvbXBvc2l0ZUtleS5tYWtlS2V5KCAuLi52YWx1ZXMgKVxuICB9XG5cbiAgcHVibGljIGtleVBhcnQoIG5hbWU6IHN0cmluZyApIDogc3RyaW5nIHwgbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlbbmFtZV1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgYWxsS2V5RmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gRmllbGRUeXBlcy5TdHJpbmcgfHwgdHlwZSA9PT0gRmllbGRUeXBlcy5UZXh0ID8gXG4gICAgICAnU3RyaW5nJyA6IFxuICAgICAgJ051bWJlcidcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7XG4gICAgY29uc3QgcGtGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApLm1hcCggZj0+IGYubmFtZSApXG4gICAgaWYgKCAhcGtGaWVsZHMgfHwgcGtGaWVsZHMubGVuZ3RoIDwgMSApIHRocm93IG5ldyBFcnJvcihgcHJpbWFyeSBrZXkgaXMgdW5kZWZpbmVkYClcblxuICAgIHRoaXMuYWxsS2V5RmllbGRzID0gcGtGaWVsZHNcbiAgICB0aGlzLmFsbEZpZWxkVHlwZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpXG4gICAgdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZm9yRWFjaCggZiA9PiB0aGlzLmFsbEZpZWxkVHlwZXMuc2V0KCBmLm5hbWUsIHRoaXMuY29udmVydFR5cGUoZi50eXBlKSkgKVxuICAgIHRoaXMuYWxsRmllbGRzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMubWFwKCBmID0+IGYubmFtZSlcbiAgICB0aGlzLmFsbEluZGV4ZXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoIGYgPT4gZi5pbmRleCA9PT0gdHJ1ZSApLm1hcCggZiA9PiBmLm5hbWUgKVxuICB9XG5cbiAgcHVibGljIGdldEZpZWxkVHlwZXMoc2NoZW1hOiBTY2hlbWEpOiBNYXA8c3RyaW5nLCBzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxGaWVsZFR5cGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IHNjaGVtYU9iamVjdCgpIDogU2NoZW1hIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWFcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb21wc2l0ZUtleSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IHN0cmluZyB7XG4gICAgaWYgKCB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPiAxICkgdGhyb3cgRXJyb3IoYG1vZGVsICcke3RoaXMubW9kZWxOYW1lfScgaWRlbnRpZmllZCBieSBjb21wb3NpdGUga2V5YClcbiAgICByZXR1cm4gdGhpcy5hbGxLZXlGaWVsZHNbMF1cbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5RmllbGRzKCkgOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuYWxsS2V5RmllbGRzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5XSA9IGtleVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjayA9IGtleSBhcyBDb21wb3NpdGVLZXlcbiAgICAgIHRoaXMua2V5RmllbGRzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5UGFydChmKSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmFsbEtleUZpZWxkcy5sZW5ndGggPT09IDEgPyBcbiAgICAgIGVudGl0eVt0aGlzLmFsbEtleUZpZWxkc1swXV0gOlxuICAgICAgbmV3IENvbXBvc2l0ZUtleSggZW50aXR5LCAuLi50aGlzLmFsbEtleUZpZWxkcylcbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICEgaW5jbHVkZUtleSAmJiB0aGlzLmtleUZpZWxkcy5pbmRleE9mKGYpID49IDAgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG5cbn0iLCJpbXBvcnQgeyBNb2RlbFNjaGVtYSwgRmllbGRUeXBlcyB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5S2V5LCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcblxuY29uc3QgSnNvblNxbCA9IHJlcXVpcmUoJ2pzb24tc3FsJykoeyBzZXBhcmF0ZWRWYWx1ZXM6IGZhbHNlIH0pXG5jb25zdCBjaGFuZ2VDYXNlID0gcmVxdWlyZSgnY2hhbmdlLWNhc2UnKVxuXG5leHBvcnQgY29uc3QgTVVMVElfU1FMX1NFUEFSQVRPUiA9ICcvLzsvLydcblxuLy8gJ2NyZWF0ZSd8J3NlbGVjdCd8J3VwZGF0ZSd8J3JlbW92ZSd8J290aGVyJ1xuZXhwb3J0IGVudW0gU3FsVHlwZSB7XG4gIFNjaGVtYSA9IDAsXG4gIFNlbGVjdCA9IDEsXG4gIEluc2VydCA9IDIgLFxuICBVcGRhdGUgPSAzLFxuICBEZWxldGUgPSA0LFxuICBPdGhlciAgPSA5XG59XG5cbmV4cG9ydCB0eXBlIFNxbFBhcmFtZXRlcnMgPSBBcnJheTxhbnk+IHwgSnNvbk9iamVjdFxuZXhwb3J0IHR5cGUgU3FsQW5kUGFyYW1ldGVycyA9IHsgXG4gIHR5cGU6IFNxbFR5cGUsICBcbiAgcXVlcnk6IHN0cmluZywgXG4gIHBhcmFtZXRlcnM/IDogU3FsUGFyYW1ldGVycyxcbiAgZXhwZWN0RWZmZWN0ZWQ/IDogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBVbmFyeU9wZXJhdG9ycyA9ICckbnVsbCd8JyRpcyd8JyRpc25vdCdcbmV4cG9ydCB0eXBlIEJpbmFyeU9wZXJhdG9ycyA9ICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSd8JyRsaWtlJ3wnJGZpZWxkJ3wnJGluJ3wnJG5pbid8JyRiZXR3ZWVuJ1xuZXhwb3J0IHR5cGUgUmVsYXRpb25PcGVyYXRvcnMgPSAnJG5vdCd8JyRhbmQnfCckb3InXG5cbmV4cG9ydCB0eXBlIFNlbGVjdEV4cHJlc3Npb24gPSB7XG4gIHNlbGVjdCA6IHtcbiAgICB0YWJsZSA6IHN0cmluZyxcbiAgICBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPixcbiAgICB3aGVyZT8gOiBzdHJpbmcsXG4gICAgW2tleSA6IHN0cmluZ10gOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBBcnJheVZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IEFycmF5PHN0cmluZyB8IG51bWJlcj4gfVxuZXhwb3J0IHR5cGUgTnVsbENvbXBhcmVFeHByZXNzaW9uID0geyAkbnVsbCA6IHN0cmluZyB9IHwgeyBbb3BlciBpbiAnJGlzJ3wnaXNub3QnXT8gOiB7IFtmaWVsZCA6IHN0cmluZ10gOiBudWxsfSB9XG5cbmV4cG9ydCB0eXBlIFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gPSB7IFtvcGVyIGluICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSddPyA6IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgU2VsZWN0RXhwcmVzc2lvbiB9IHwgRmllbGRWYWx1ZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIEFycmF5Q29tcGFyZUV4cHJlc3Npb24gPSB7IFtvcGVyIGluICckYmV0d2Vlbid8JyRpbid8JyRuaW4nXT8gOiBBcnJheVZhbHVlRXhwcmVzc2lvbiB8IFNlbGVjdEV4cHJlc3Npb24gfSBcbmV4cG9ydCB0eXBlIExpa2VFeHByZXNzaW9uID0geyAkbGlrZTogeyBba2V5IDogc3RyaW5nXSA6IHN0cmluZyB9IH1cblxuZXhwb3J0IHR5cGUgQ29tcGFyZUV4cHJlc3Npb24gPSBWYWx1ZUNvbXBhcmVFeHByZXNzaW9uIHwgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiB8IExpa2VFeHByZXNzaW9uIHwgTnVsbENvbXBhcmVFeHByZXNzaW9uXG5leHBvcnQgdHlwZSBSZWxhdGlvbkV4cHJlc3Npb24gPSBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCAvLyBUaGUgJGFuZCBpcyBvbWl0dGVkIFxuICB7ICRub3QgOiBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvbiB9IHwgXG4gIHsgW29wZXIgaW4gJyRhbmQnfCAnJG9yJ10/IDogQXJyYXk8Q29tcGFyZUV4cHJlc3Npb24+IHwgQXJyYXk8UmVsYXRpb25FeHByZXNzaW9uPiB9XG4gXG5leHBvcnQgdHlwZSBTcWxDb25kaXRpb24gPSBDb21wYXJlRXhwcmVzc2lvbiB8IFJlbGF0aW9uRXhwcmVzc2lvblxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSA6IChzY2hlbWE6IE1vZGVsU2NoZW1hKSA9PiBzdHJpbmdcbiAgYnVpbGRJbnNlcnQgOiAoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KSA9PiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlIDogKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogYW55KSA9PiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlIDogKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogYW55LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcikgPT4gU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCA6IChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZHM6IEFycmF5PHN0cmluZz4sIHdoZXJlIDogU3FsQ29uZGl0aW9uLCBsaW1pdD86IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyLCBzb3J0PyA6IEFycmF5PEpzb25PYmplY3Q+fEpzb25PYmplY3QsIGpvaW4/IDogSnNvbk9iamVjdCkgPT4gU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBzdHJpbmcge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gZGF0YWJhc2UgZG8gbm90IHN1cHBvcnQgY29tcG9zaXRlIGtleSAgIFxuICAgIGlmICggc2NoZW1hLmlzQ29tcHNpdGVLZXkgKSB7IFxuICAgICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gZi5wcmltYXJ5X2tleSA9IGZhbHNlIClcbiAgICB9XG4gICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fscy5qb2luKCBNVUxUSV9TUUxfU0VQQVJBVE9SIClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIC8vIHByaXZhdGUgZGV0ZXJtaW5lU29ydCggdGFibGVOYW1lOiBzdHJpbmcsIHNvcnQgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgc29ydCB8fCB7fVxuICAvLyAgIGlmICh0eXBlb2Ygc29ydCA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGlmIChzb3J0ID09PSAndGltZXN0YW1wJykge1xuICAvLyAgICAgICBzb3J0ID0gJ3QuJyArIHNvcnRcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHNvcnQgPSB0YWJsZU5hbWUgKyAnLicgKyBzb3J0XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2Ygc29ydCA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gc29ydCkge1xuICAvLyAgICAgICBpZiAoayA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgLy8gICAgICAgICBzb3J0Wyd0LicgKyBrXSA9IHNvcnRba11cbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBzb3J0W3RhYmxlTmFtZSArICcuJyArIGtdID0gc29ydFtrXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGRlbGV0ZSBzb3J0W2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBzb3J0XG4gIC8vIH1cblxuICAvLyBwcml2YXRlIGRldGVybWluZVdoZXJlKCB0YWJsZU5hbWU6IHN0cmluZywgd2hlcmUgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgbGV0IGNvbmRpdGlvbiA9IHt9IHx8IHdoZXJlIFxuICAvLyAgIGlmIChBcnJheS5pc0FycmF5KGNvbmRpdGlvbikpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5zbGljZSgpXG4gIC8vICAgICBmb3IgKGxldCBpIGluIGNvbmRpdGlvbikge1xuICAvLyAgICAgICBmb3IgKGxldCBrIGluIGNvbmRpdGlvbltpXSkge1xuICAvLyAgICAgICAgIGNvbmRpdGlvbltpXVt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltpXVtrXVxuICAvLyAgICAgICAgIGRlbGV0ZSBjb25kaXRpb25baV1ba11cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmRpdGlvbilcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gY29uZGl0aW9uKSB7XG4gIC8vICAgICAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltrXVxuICAvLyAgICAgICBkZWxldGUgY29uZGl0aW9uW2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLl9kZWxldGVkXyddID0gMFxuICAvLyB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBsaW1pdD86IG51bWJlciwgb2Zmc2V0PzogbnVtYmVyLCBcbiAgICBzb3J0PyA6IEFycmF5PEpzb25PYmplY3Q+fEpzb25PYmplY3QsIGpvaW4/IDogSnNvbk9iamVjdCApOiBTcWxBbmRQYXJhbWV0ZXJzIHtcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgZmllbGRzID0gZmllbGRzIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG5cbiAgICBsZXQgcXVlcnlPcHRpb25zID0ge1xuICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgZmllbGRzOiBmaWVsZHMsXG4gICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgbGltaXQ6IGxpbWl0LFxuICAgICAgb2Zmc2V0OiBvZmZzZXQsXG4gICAgICBzb3J0OiBzb3J0LFxuICAgICAgam9pbjogam9pblxuICAgIH1cblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5TZWxlY3QgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHF1ZXJ5T3B0aW9ucykpXG4gIH1cbn0iLCJpbXBvcnQgeyBTcWxpdGVXcmFwcGVyIH0gZnJvbSAnLi9TcWxpdGVXcmFwcGVyJ1xuaW1wb3J0IHsgTVVMVElfU1FMX1NFUEFSQVRPUiwgU3FsQW5kUGFyYW1ldGVycywgU3FsUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiwgQ29ubmVjdGlvbk9wdGlvbnMsIFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcblxuXG5jbGFzcyBTcWxpdGVUcmFuc2FjdGlvbiBpbXBsZW1lbnRzIERCVHJhbnNhY3Rpb24ge1xuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29tbWl0KCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnQ09NTUlUJylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByb2xsYmFjaygpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ1JPTExCQUNLJykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIC4uLnNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIC4uLnNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OJylcbiAgICByZXR1cm4gbmV3IFNxbGl0ZVRyYW5zYWN0aW9uKHRoaXMpXG4gIH1cbn0iLCJpbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dNYW5hZ2VyLCBMb2dnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBTcWxQYXJhbWV0ZXJzLCBTcWxBbmRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuXG5pbXBvcnQgKiBhcyBEYXRhYmFzZSBmcm9tICdiZXR0ZXItc3FsaXRlMydcblxuZXhwb3J0IGNsYXNzIFNxbGl0ZVdyYXBwZXIge1xuICBwcml2YXRlIGRiIDogRGF0YWJhc2VcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTcWxpdGVXcmFwcGVyLm5hbWUpXG4gIH1cblxuICBwdWJsaWMgb3BlbihkYkZpbGVQYXRoOiBzdHJpbmcsIGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJGaWxlUGF0aClcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1Mgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAsIGVyciApXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIGV4ZWN1dGUgc3FsID0gJHtzcWx9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICB9ICAgIFxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PGFueT4+ICkgOiBBcnJheTxhbnk+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8YW55PigpIH1cbiAgICB0cnkge1xuICAgICAgcmV0LnJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLmFsbChwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHF1ZXJ5IHNxbCA9ICR7c3FsfSwgcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0sIHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9LCBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkoc3FsIS5wYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCBudWxsLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgLi4uc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEVudGl0eUtleSwgQmxvY2tIZWFkZXIsIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBMZXZlbEJsb2NrIH0gZnJvbSAnLi9MZXZlbEJsb2NrJ1xuaW1wb3J0IHsgRGJTZXNzaW9uIH0gZnJvbSAnLi9EYlNlc3Npb24nXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBFbnRpdHkgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciAgfSBmcm9tICcuL01vZGVsJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IEVudGl0eVByb3h5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgU3FsQ29uZGl0aW9uIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCAxMDAwMHMgZWFjaCBtb2RlbFxuICAgKi9cbiAgZW50aXR5Q2FjaGVPcHRpb25zPyA6IEVudGl0eUNhY2hlT3B0aW9uc1xuXG59XG5cbi8qKlxuICogT1JNIGxpa2UgdG8gb3BlcmF0ZSBibG9ja2NoYWluIGRhdGFcbiAqIEBldmVudCByZWFkeSBlbW1pdCBhZnRlciBpbml0aWFsaXplZFxuICogQGV2ZW50IGNsb3NlIGVtbWl0IGFmdGVyIGNsb3NlZFxuICovXG5leHBvcnQgY2xhc3MgU21hcnREQiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgb3B0aW9ucyA6IFNtYXJ0REJPcHRpb25zXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgc2NoZW1hcyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBibG9ja1Nlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBsb2NhbFNlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBibG9ja0RCIDogTGV2ZWxCbG9ja1xuICBwcml2YXRlIGN1cnJlbnRCbG9jayA6IEJsb2NrSGVhZGVyIHwgbnVsbFxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvciBcbiAgICogTk9USUMgOiB5b3UgbmVlZCBjYWxsIGluaXQgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBkYlBhdGggcGF0aCBvZiBibG9ja2NoYWluIGRiXG4gICAqIEBwYXJhbSBsZXZlbEJsb2NrRGlyIHBhdGggb2YgYmxvY2sgaGVhZGVyIGRiXG4gICAqIEBwYXJhbSBvcHRpb25zIG9mIFNtYXJ0REJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGJQYXRoOiBzdHJpbmcsIGxldmVsQmxvY2tEaXI6IHN0cmluZywgb3B0aW9ucz8gOiBTbWFydERCT3B0aW9ucyApIHtcbiAgICBEQkMuYXJndW1lbnQoJ2RiUGF0aCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoZGJQYXRoKSlcbiAgICBEQkMuYXJndW1lbnQoJ2xldmVsQmxvY2tEaXInLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGxldmVsQmxvY2tEaXIpKVxuXG4gICAgc3VwZXIoKVxuICAgIHRoaXMub3B0aW9ucyA9ICB7XG4gICAgICBoaXN0b3J5Rm9yUm9sbGJhY2sgOiAxMCxcbiAgICAgIGF1dG9DbGVhblBlcnNpc3RlZEhpc3RvcnkgOiBmYWxzZSxcbiAgICAgIGVudGl0eUNhY2hlT3B0aW9ucyA6IHsgZGVmYXVsdCA6IDUwMDAgfVxuICAgIH0gfHwgb3B0aW9uc1xuXG4gICAgdGhpcy5zY2hlbWFzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTbWFydERCLm5hbWUpXG4gICAgdGhpcy5ibG9ja0RCID0gbmV3IExldmVsQmxvY2sobGV2ZWxCbG9ja0RpcilcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBuZXcgU3FsaXRlQ29ubmVjdGlvbih7IHN0b3JhZ2U6IGRiUGF0aCB9KVxuICAgIHRoaXMuYmxvY2tTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdCbG9jaycpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0xvY2FsJylcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiAsIHRocm93SWZVbmRlZmluZWQgPSBmYWxzZSwgdGhyb3dJZlJlYWRvbmx5ID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TW9kZWxTY2hlbWE+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBpc1N0cmluZyggbW9kZWwgKSA/IFN0cmluZyhtb2RlbCkgOiAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkubmFtZSBcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5zY2hlbWFzLmdldChtb2RlbE5hbWUpIFxuICAgIHRocm93SWZVbmRlZmluZWQgJiYgREJDLnZlcmlmeSggc2NoZW1hICE9PSB1bmRlZmluZWQsIGB1bnJlZ2lzdGVyZWQgbW9kZWwgJyR7IG1vZGVsTmFtZSB9J2ApXG4gICAgdGhyb3dJZlJlYWRvbmx5ICYmIERCQy52ZXJpZnkoICFzY2hlbWEhLmlzUmVhZG9ubHksIGBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nIGlzIHJlYWRvbmx5YClcblxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2Vzc2lvbjxURW50aXR5Piggc2NoZW1hIDogTW9kZWxTY2hlbWEgKSA6IERiU2Vzc2lvbiB7IFxuICAgIHJldHVybiBzY2hlbWEhLmlzTG9jYWwgPyB0aGlzLmxvY2FsU2Vzc2lvbiA6IHRoaXMuYmxvY2tTZXNzaW9uXG4gIH1cblxuICAvKipcbiAgICogaW5pdGlhbGl6ZSBTbWFydERCICwgeW91IG5lZWQgY2FsbCB0aGlzIGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gc2NoZW1hcyB0YWJsZSBzY2hlbWFzIGluIERhdGFiYXNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaW5pdCguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2NoZW1hcycsICgpPT4gREJDLm5vdE51bGwoc2NoZW1hcykpXG5cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY29ubmVjdCgpICAgIFxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5vcGVuKClcblxuICAgIHNjaGVtYXMuZm9yRWFjaCggYXN5bmMgc2NoZW1hID0+IHtcbiAgICAgIHRoaXMuc2NoZW1hcy5zZXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYSApXG4gICAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbiggc2NoZW1hIClcbiAgICAgIGF3YWl0IHNlc3Npb24ucmVnaXN0ZXJTY2hlbWEoc2NoZW1hKVxuICAgICAgYXdhaXQgc2Vzc2lvbi5zeW5jU2NoZW1hKHNjaGVtYSlcbiAgICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIGF3YWl0IHNlc3Npb24uZmluZEFsbCggc2NoZW1hLm1vZGVsTmFtZSApXG4gICAgfSk7XG5cbiAgICB0aGlzLmVtaXQoICdyZWFkeScsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGZyZWUgcmVzb3VyY2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmNsb3NlKClcbiAgICBcbiAgICB0aGlzLmVtaXQoJ2Nsb3NlZCcsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGhlaWdodCBvZiBsYXN0IGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja0RCLmdldExhc3RCbG9ja0hlaWdodCgpXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBiZWdpbiBhIG5ldyBibG9ja1xuICAgKiBAcGFyYW0gYmxvY2tIZWFkZXIgXG4gICAqL1xuICBwdWJsaWMgYmVnaW5CbG9jayggYmxvY2tIZWFkZXI6IEJsb2NrSGVhZGVyICkgOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB2ZXJpZnkgYmxvY2tIZWFkZXIgaGVyZVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2tIZWFkZXInLCAoKT0+IERCQy5ub3ROdWxsKGJsb2NrSGVhZGVyKSlcbiAgICBcbiAgICB0aGlzLmN1cnJlbnRCbG9jayA9IGJsb2NrSGVhZGVyXG4gIH1cblxuICAvKipcbiAgICogY29tbWl0IGJsb2NrIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb21taXRCbG9jaygpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAoIXRoaXMuY3VycmVudEJsb2NrKSB0aHJvdyBuZXcgRXJyb3IoJ0N1cnJlbnQgYmxvY2sgaXMgbnVsbCcpXG5cbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuYXBwZW5kQmxvY2soIHRoaXMuY3VycmVudEJsb2NrLCB0aGlzLmJsb2NrU2Vzc2lvbi5nZXRDaGFuZ2VzKCkgKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5zYXZlQ2hhbmdlcyggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IClcbiAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZSggdGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0IC0gdGhpcy5vcHRpb25zLmhpc3RvcnlGb3JSb2xsYmFjayEgKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG5cbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNvbW1pdEJsb2NrIGhlaWdodCA9ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcbiAgICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodFxuICAgIH1cbiAgICBjYXRjaCggZXJyICkgeyBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBjb21taXRCbG9jayBmYWlsZWQgKCBoZWlnaHQgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgYmxvY2tIZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICBjb25zdCBmcm9tID0gYmxvY2tIZWlnaHRcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmVyID0gdGhpcy5ibG9ja1Nlc3Npb24uaGlzdG9yeVZlcnNpb247XG4gICAgICBpZiAoIGZyb20gPCB2ZXIubWluICkgLy8gbG9hZCBoaXN0b3J5IGZyb20gbGV2ZWxkYiwgaWYgY2FjaGVkIGhpc3RvcnkgbGVzcyB0aGFuIHJvbGxiYWNrIGhlaWdodCBcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeShhd2FpdCB0aGlzLmJsb2NrREIuZ2V0SGlzdG9yeUNoYW5nZXMoIGZyb20sIHZlci5taW4gLSAxICkpXG5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyggYmxvY2tIZWlnaHQgKVxuICAgICAgd2hpbGUoIHRoaXMubGFzdEJsb2NrSGVpZ2h0ID49IGJsb2NrSGVpZ2h0ICkge1xuICAgICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYHJvbGxiYWNrQmxvY2sgaGVpZ2h0IDogJHtmcm9tfSAtPiAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgcm9sbGJhY2tCbG9jayBmYWlsZWQgKCBoZWlnaHQgOiAke2Zyb219IC0+ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+IDAsIGBzZXJpYWwgbXVzdCBncmVhdCB0aGFuIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSBuZXcgZW50aXR5IHdoaWNoIGNoYW5nZSB3aWxsIGJlIHRyYWNrZWQgYW5kIHBlcnNpc3RlbnRlZCAoYnkgc2F2ZUNoYW5nZXMpIGF1dG9tYXRpY2FsbHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleSB3aGljaCB1bmlxdWVkIGluIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBlbnRpdHkgcHJvdG90eXBlIGVudGl0eSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgY29weSB0byByZXN1bHQgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXksIGVudGl0eT86IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgLCB0cnVlKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSBwcm94aWVkIG9iamVjdGAgKVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5kZWxldGUoZW50aXR5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgYW5kIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBrZXkgb2YgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWQobW9kZWwsIGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGRhdGFiYXNlIGJ5IGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gc2VlIEB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmZpbmRNYW55KG1vZGVsLCBjb25kaXRpb24pXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBjb25kaXRpb24gPSAnJHtKU09OLnN0cmluZ2lmeShjb25kaXRpb24pfScgKWApXG5cbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbXNbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZENhY2hlZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldEFsbENhY2hlZCggbW9kZWwsIHRyYWNrIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiBzZWUgQHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZmluZE1hbnkobW9kZWwsIGNvbmRpdGlvbiwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogcXVlcnkgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiBzZWUgQHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gZmllbGRzIHJlc3VsdCBmaWVsZHMsIGRlZmF1bHQgaXMgYWxsIGZpZWxkc1xuICAgKiBAcGFyYW0gbGltaXQgbGltaXQgb2YgcmVzdWx0IGNvdW50XG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXRcbiAgICogQHBhcmFtIHNvcnQgc29ydFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcXVlcnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIFxuICAgIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBsaW1pdD8gOiBudW1iZXIgLCBvZmZzZXQ/IDogbnVtYmVyLCBzb3J0PyA6IEpzb25PYmplY3QsIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeShtb2RlbCwgY29uZGl0aW9uLCBmaWVsZHMsIGxpbWl0LCBvZmZzZXQsIHNvcnQsIGpvaW4pXG4gIH1cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24gc2VlIEB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmV4aXN0cyhtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvdW50IHJlY29yZHMgY291bnQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uIHNlZSBAdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY291bnQobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgaGVpZ2h0XG4gICAqIEBwYXJhbSBoZWlnaHQgYmxvY2sgaGVpZ2h0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUhlaWdodCggaGVpZ2h0IDogbnVtYmVyICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPiAwICwgJ2hlaWdodCBtdXN0IGdyZWF0IHRoYW4gemVybycpXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrKCBoZWlnaHQgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgYmxvY2sgaWRcbiAgICogQHBhcmFtIGJsb2NrSWQgYmxvY2sgaWQgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIERCQy5hcmd1bWVudCgnbWluSGVpZ2h0LCBtYXhIZWlnaHQnLCBtaW5IZWlnaHQgPiAwICYmIG1heEhlaWdodCA+PSBtaW5IZWlnaHQsICdtaW5IZWlnaHQgb3IgbWF4SGVpZ2h0IGlzIGludmFsaWQnKVxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQsIG1heEhlaWdodCApXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgYmxvY2sgaWQgYXJyYXlcbiAgICogQHBhcmFtIGJsb2NrSWRzIGFycmF5IG9mIGJsb2NrIGlkXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIC4uLmJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWRzJywgKCkgPT4gREJDLm5vdE51bGwoYmxvY2tJZHMpIClcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlJZHMoLi4uYmxvY2tJZHMpXG4gIH1cbn0iLCJpbXBvcnQgeyBFbnRpdHksICBOdWxsYWJsZSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHlUcmFja2VyLCBQcm94aWVkRW50aXR5VHJhY2tlciB9IGZyb20gJy4vRW50aXR5VHJhY2tlcidcblxuLyoqICAgICBcbiAqICAgICBTVEFURSBUUkFOU0ZFUiAgICAgICAgICAgICAgICAgIEFDVElPTiAgICAgICAgICAgICAgICBUUkFDSyAgICAgIENBQ0hFXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgID8gICAgICAgICAtPiBwZXJzaXRlbnQgICAgICBzZXNzaW9uLmxvYWQgICAgICAgICAgICAgdHJhY2sgICAgIGNhY2hlXG4gKiAgICAgID8gICAgICAgICAtPiBuZXcgICAgICAgICAgICBzZXNzaW9uLmNyZWF0ZSAgICAgICAgICAgdHJhY2sgICAgICAgLSAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBtb2RpZmllZCAgICAgICBzZXQgcHJvcGVydHkgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogcGVyc2lzdGVudCAgICAgLT4gZGVsZXRlZCAgICAgICAgc2Vzc2lvbi5kZWwgICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIG5ldyB8IG1vZGlmaWVkIC0+IHByZXNpc3RlbnQgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBrZWVwICAgICBjYWNoZXx1cGRhdGUgXG4gKiBkZWxldGVkICAgICAgICAtPiB0cmFuc2llbnQgICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAgZXZpdCAgICAgICBldml0XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdGUge1xuICBUcmFuc2llbnQgID0gLTEsXG4gIFBlcnNpc3RlbnQgPSAwLFxuICBcbiAgTmV3ICAgICAgICA9IDEsXG4gIE1vZGlmaWVkICAgPSAyLFxuICBEZWxldGVkICAgID0gMyxcbn1cblxuZXhwb3J0IGVudW0gRW50aXR5Q2hhbmdlVHlwZSB7XG4gIE5ldyAgICAgICA9IDEsXG4gIE1vZGlmeSAgICA9IDIsXG4gIERlbGV0ZSAgICA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2Uge1xuICBuYW1lIDogc3RyaW5nXG4gIG9yaWdpbmFsIDogYW55XG4gIGN1cnJlbnQgOiBhbnlcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDaGFuZ2VzIHtcbiAgZGJWZXJzaW9uICAgICAgICAgOiBudW1iZXJcbiAgdHlwZSAgICAgICAgICAgICAgOiBFbnRpdHlDaGFuZ2VUeXBlXG4gIHByb3BlcnRpZXNDaGFuZ2VzIDogQXJyYXk8UHJvcGVydHlDaGFuZ2U+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5RXh0ZW5zaW9uIHtcbiAgX3ZlcnNpb25fICAgICAgOiBudW1iZXJcbiAgX19kZXRhY2hlZF9fICAgOiBib29sZWFuXG4gIF9fdHJhY2tpbmdfXyAgIDogYm9vbGVhblxuICBfX3NjaGVtYV9fICAgICA6IE1vZGVsU2NoZW1hXG4gIF9fdHJhY2tlcl9fICAgIDogRW50aXR5VHJhY2tlclxuICBfX3N0YXRlX18gICAgICA6IEVudGl0eVN0YXRlIFxuICBfX3RtcENoYW5nZXNfXyA6IE51bGxhYmxlPEVudGl0eUNoYW5nZXM+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJveGllZDxUPiBleHRlbmRzIEVudGl0eUV4dGVuc2lvbiB7XG4gIFxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5UHJveHkge1xuICBwcml2YXRlIHRyYWNrZXIgOiBFbnRpdHlUcmFja2VyO1xuXG4gIGNvbnN0cnVjdG9yKHRyYWNrZXI6IEVudGl0eVRyYWNrZXIpIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRXh0ZW5kZWQoZW50aXR5OiBFbnRpdHkpIHtcbiAgICByZXR1cm4gZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3NjaGVtYV9fJykgJiYgZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3N0YXRlX18nKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc1Byb3hpZWQoZW50aXR5OiBFbnRpdHkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVudGl0eVByb3h5LmlzRXh0ZW5kZWQoZW50aXR5KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjb252ZXJ0VG9Qcm94aWVkPFRFbnRpdHk+KGVudGl0eTogRW50aXR5KSA6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSkpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQcm94aWVkIEVudGl0eWApXG4gICAgXG4gICAgcmV0dXJuIGVudGl0eSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHByb3h5VG9FbnRpdHkocHJveGllZDogUHJveGllZDxFbnRpdHk+KTogRW50aXR5IHtcbiAgICBsZXQgZW50aXR5ID0ge31cbiAgICBmb3IoIGxldCBrIGluIHByb3hpZWQgKSB7XG4gICAgICBpZiAoIEVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoaykgKSBlbnRpdHlba10gPSBwcm94aWVkW2tdXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNOb3JtYWxQcm9wZXJ0eShwcm9wZXJ0eU5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gcHJvcGVydHlOYW1lICYmICghcHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoJ19fJykgJiYgIXByb3BlcnR5TmFtZS5lbmRzV2l0aCgnX18nKSlcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlICkgOiBURW50aXR5IHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICBfdmVyc2lvbl8gICAgICA6IGVudGl0eVsnX3ZlcnNpb25fJ10gfHwgMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19zY2hlbWFfXyAgICAgOiBzY2hlbWEsXG4gICAgICBfX3RyYWNrZXJfXyAgICA6IHRoaXMudHJhY2tlciwgXG4gICAgICBfX3RyYWNraW5nX18gICA6IHRydWUsXG4gICAgICBfX3RtcENoYW5nZXNfXyA6IG51bGxcbiAgICB9LCBlbnRpdHkpXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSwgcmVjZWl2ZXI6IGFueSkgOiBib29sZWFuIHsgICAgICBcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWUudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eU5hbWVdICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJvcGVydHkgYWZ0ZXIgZGVsZXRlZGApXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zY2hlbWFfXy5pc1JlYWRvbmx5ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSByZWFkb25seSBtb2RlbCAnJHtleHQuX19zY2hlbWFfXy5tb2RlbE5hbWV9J2ApXG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zY2hlbWFfXy5rZXlGaWVsZHMuaW5kZXhPZihuYW1lKSA+PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcmltYXJ5IGZpZWxkIHByb3BlcnR5YClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX2RldGFjaGVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlcikuYXR0YWNoKCByZWNlaXZlciBhcyBQcm94aWVkPGFueT4gKVxuICAgICAgZXh0Ll9fZGV0YWNoZWRfXyA9IGZhbHNlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuUGVyc2lzdGVudCApIHtcbiAgICAgIGV4dC5fdmVyc2lvbl8gKytcbiAgICAgIGV4dC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5Nb2RpZmllZFxuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fID0geyAgICAgICAgXG4gICAgICAgIHR5cGUgOiBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSwgICAgICAgIFxuICAgICAgICBkYlZlcnNpb246IGV4dC5fdmVyc2lvbl8sXG4gICAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPih7IFxuICAgICAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLCBvcmlnaW5hbDogZXh0Ll92ZXJzaW9uXyAtIDEsIGN1cnJlbnQ6IGV4dC5fdmVyc2lvbl8gXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIGV4dC5fX3RtcENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMucHVzaCh7IG5hbWU6IG5hbWUsIG9yaWdpbmFsOiBleHRbbmFtZV0sIGN1cnJlbnQ6IHZhbHVlIH0pXG4gICAgfVxuXG4gICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRGlydHkoIGVudGl0eTogRW50aXR5ICkgOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGF0ZSA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KS5fX3N0YXRlX19cbiAgICByZXR1cm4gISAoIHN0YXRlID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50IHx8IHN0YXRlID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eSBjcmVhdGUgbWFudWFsXG4gICAqIEBwYXJhbSBtb2RlbCBNb2RlbCBOYW1lXG4gICAqL1xuICBwdWJsaWMgcHJveHlOZXc8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoIGVudGl0eSwgc2NoZW1hLCAgRW50aXR5U3RhdGUuTmV3IClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCB9KSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBlbnRpdHkgd3JhcHBlZCBieSBwcm94eSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgY2FuIGJlIGRldGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGxvYWRlZCBmcm9tIGRhdGFiYXNlLiBBVFRFTlNUSU9OOiBlbnN1cmUgdGhhdCBoYXMgcHJvcGVydHkgJ192ZXJzaW9uXydcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eVBlcnNpc3RlbnQ8VEVudGl0eT4oIGVudGl0eTogRW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlDYWNoZSB9IGZyb20gJy4uL0VudGl0eUNhY2hlJztcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBDb21wb3NpdGVLZXkgfSBmcm9tICcuLi9Nb2RlbCc7XG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcblxuZXhwb3J0IHR5cGUgRW50aXR5VHJhY2tlckFjdGlvbiA9IChtb2RlbDogc3RyaW5nLCBlbnRpdHk6IEVudGl0eSwgY2hhbmdlcyA6IEVudGl0eUNoYW5nZXMpID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWRcblxuICBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkXG4gIHN0b3BUcmFja0FsbCgpOiB2b2lkXG5cbiAgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbiAgcmVqZWN0Q2hhbmdlcygpIDogdm9pZFxuICByb2xsYmFja0NoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkXG59XG5cbmV4cG9ydCB0eXBlIE1vZGVsQW5kS2V5ID0gc3RyaW5nXG5leHBvcnQgdHlwZSBFbnRpdHlDaGFuZ2VzSXRlbSA9IHsgbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH1cblxuZXhwb3J0IGNsYXNzIFByb3hpZWRFbnRpdHlUcmFja2VyIGltcGxlbWVudHMgRW50aXR5VHJhY2tlciB7XG4gIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IG1vZGVsQW5kS2V5U2VwYXJhdG9yID0gJyEjISdcblxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgaGlzdG9yeSA6IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+XG4gIHByaXZhdGUgYWxsVHJhY2tpbmdFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IGtleVN0cmluZyA9IHNjaGVtYS5pc0NvbXBzaXRlS2V5ID8gKCBrZXkgYXMgQ29tcG9zaXRlS2V5ICkua2V5IDoga2V5LnRvU3RyaW5nKCkgXG4gICAgcmV0dXJuIGAke3NjaGVtYS5tb2RlbE5hbWV9JHtQcm94aWVkRW50aXR5VHJhY2tlci5tb2RlbEFuZEtleVNlcGFyYXRvcn0hISR7a2V5U3RyaW5nfWBcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogYW55IH0ge1xuICAgIGNvbnN0IGFycmF5ID0gIG1vZGVsQW5kS2V5LnNwbGl0KFByb3hpZWRFbnRpdHlUcmFja2VyLm1vZGVsQW5kS2V5U2VwYXJhdG9yKVxuICAgIHJldHVybiB7IG1vZGVsIDogYXJyYXlbMF0sIGtleTogYXJyYXlbMV0gfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldEhpc3RvcnlCeVZlcnNpb24oIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UgKTogTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCF0aGlzLmhpc3RvcnkuaGFzKGhpc3RvcnlWZXJzaW9uKSAmJiBjcmVhdGVJZk5vdEV4aXN0cyApXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KGhpc3RvcnlWZXJzaW9uLCBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpKVxuXG4gICAgcmV0dXJuIHRoaXMuaGlzdG9yeS5nZXQoaGlzdG9yeVZlcnNpb24pIVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldE1vZGVsQW5kS2V5KCBwZTogUHJveGllZDxhbnk+ICk6IE1vZGVsQW5kS2V5IHtcbiAgICByZXR1cm4gdGhpcy5tYWtlTW9kZWxBbmRLZXkocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgY2hhbmdlczogRW50aXR5Q2hhbmdlcywgaGlzdG9yeVZlcnNpb246IG51bWJlciApIDogdm9pZCB7XG4gICAgdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKGhpc3RvcnlWZXJzaW9uLCB0cnVlKS5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4gKTogdm9pZCB7XG4gICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgQkVHSU4gYXR0YWNoSGlzdG9yeSBoaXN0b3J5IGluZm8gPSAke0pTT04uc3RyaW5naWZ5KHRoaXMuaGlzdG9yeVZlcnNpb24pfWApXG5cbiAgICBoaXN0b3J5LmZvckVhY2goIChjaGFuZ2VzLCB2ZXJzaW9uKSA9PiB7XG4gICAgICBsZXQgY2hhbmdlc01hcCA9IG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KClcbiAgICAgIGNoYW5nZXMuZm9yRWFjaCggYyA9PiBjaGFuZ2VzTWFwLnNldCggYy5tb2RlbEFuZEtleSwgYy5jaGFuZ2VzISApKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldCh2ZXJzaW9uLCBjaGFuZ2VzTWFwIClcbiAgICB9KVxuXG4gICAgaWYgKHRoaXMubG9nLmluZm9FbmFibGVkKSB7XG4gICAgICBsZXQgaGVpZ2h0SW5mbyA9IG5ldyBBcnJheTxudW1iZXI+KClcbiAgICAgIGhpc3RvcnkuZm9yRWFjaCggKGMsIGgpID0+IGhlaWdodEluZm8ucHVzaChoKSApXG4gICAgICB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIGF0dGFjaEhpc3RvcnkgaGVpZ2h0ID0gJHtKU09OLnN0cmluZ2lmeShoZWlnaHRJbmZvKX1gKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbjogdGhpcy5taW5WZXJzaW9uLCBtYXg6IHRoaXMuY3VycmVudFZlcnNpb24gfVxuICB9XG5cbiAgcHVibGljIGF0dGFjaCggcGU6IFByb3hpZWQ8YW55PiApIDogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIHBlKVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0TGFzdENoYW5nZXMoIHBlOiBQcm94aWVkPGFueT4gKSA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzRGlydHkocGUpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IFxuICAgICAgICByZXR1cm4gcGUuX190bXBDaGFuZ2VzX18hXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgbGV0IHRtcFZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG5cbiAgICB3aGlsZSAoIHRtcFZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0bXBWZXJzaW9uKVxuICAgICAgaGlzdG9yeSAmJiByZXN1bHQucHVzaChoaXN0b3J5KSAgICAgIFxuICAgICAgdG1wVmVyc2lvbi0tXG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSApXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWQge1xuICAgIGxldCBwcm94aWVkID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpXG4gICAgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH0gXG4gICAgZWxzZSBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgICAgLy8gVE9ETzog5YWI5L+u5pS55YaN5Yig6Zmk77yM6ZyA6KaB5oGi5aSN5Yiw5LuA5LmI54q25oCB77yfXG4gICAgICBwcm94aWVkLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IGVudGl0eTogcGUsIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMoZW50aXR5OiBFbnRpdHksIGRiVmVyc2lvbjogbnVtYmVyLCBpc05ldyA9IHRydWUpIDogRW50aXR5Q2hhbmdlcyB7XG4gICAgbGV0IHByb3Blcml0ZXNDaGFuZ2UgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHkpIHtcbiAgICAgIGlmICghRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrZXkpKSBjb250aW51ZVxuICAgICAgcHJvcGVyaXRlc0NoYW5nZS5wdXNoKCBpc05ldyA/IFxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IG51bGwsIGN1cnJlbnQ6IGVudGl0eVtrZXldIH0gOlxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IGVudGl0eVtrZXldLCBjdXJyZW50OiAgbnVsbCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fdG1wQ2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fdG1wQ2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBwZS5fX3NjaGVtYV9fXG4gICAgICBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCkgXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KHNjaGVtYS5tb2RlbE5hbWUsIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpLCBzY2hlbWEuZ2V0S2V5KHBlKSlcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6XG4gICAgICAgIGxldCBlID0gdGhpcy5jYWNoZS5nZXQoIG1vZGVsLCBrZXkgKVxuICAgICAgICBpZiAoIGUgPT09IHVuZGVmaW5lZCApIHJldHVyblxuICAgICAgICBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gZSFbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGUsIGtleSApXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOiBcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGMgPT4gYy5uYW1lLCBjID0+IGMub3JpZ2luYWwpXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwgZW50aXR5LCBrZXkpXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDpcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcmVqZWN0Q2hhbmdlcyBWZXJzaW9uID0gP2ApXG4gIH1cbiAgXG4gIHB1YmxpYyByb2xsYmFja0NoYW5nZXMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuaGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMucmVqZWN0Q2hhbmdlcygpXG4gICAgd2hpbGUoIGhpc3RvcnlWZXJzaW9uIDw9IHRoaXMuY3VycmVudFZlcnNpb24gKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzTWFwID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgICBjaGFuZ2VzTWFwICYmIGNoYW5nZXNNYXAuZm9yRWFjaCggKCBjaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5ICkgXG4gICAgICAgIHRoaXMucm9sbGJhY2tDYWNoZUNoYW5nZXMobWsubW9kZWwsIG1rLmtleSwgY2hhbmdlcylcbiAgICAgIH0pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uIC0tXG4gICAgfVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHBlLl9fZGV0YWNoZWRfXyA9IHRydWUpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSBNYXRoLm1pbih0aGlzLm1pblZlcnNpb24sIHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuY3VycmVudFZlcnNpb259YClcbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnkoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkge1xuICAgIGlmICggdGhpcy5taW5WZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uIHx8IHRoaXMuY3VycmVudFZlcnNpb24gPCBoaXN0b3J5VmVyc2lvbiApIHJldHVyblxuICAgIGZvciggbGV0IHZlciA9IHRoaXMubWluVmVyc2lvbjsgdmVyIDwgaGlzdG9yeVZlcnNpb247IHZlcisrICkge1xuICAgICAgdGhpcy5oaXN0b3J5LmRlbGV0ZSh2ZXIpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkdW1wQ2hhbmdlcyggZWM6IEVudGl0eUNoYW5nZXMgKTogc3RyaW5nIHtcbiAgICBsZXQgcHJvcGVydHlDaGFuZ2VzID0gJydcbiAgICBlYy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKHBjID0+IHByb3BlcnR5Q2hhbmdlcyArPSBgJHtwYy5uYW1lfTogJHtwYy5vcmlnaW5hbH0gLT4gJHtwYy5jdXJyZW50fSwgYClcblxuICAgIHJldHVybiBgZGJWZXJzaW9uPSR7ZWMuZGJWZXJzaW9ufSwgdHlwZT0ke2VjLnR5cGV9LCBbJHtwcm9wZXJ0eUNoYW5nZXN9XWBcbiAgfVxuXG4gIHB1YmxpYyBkdW1wSGlzdG9yeSgpIDogc3RyaW5nIHtcbiAgICBsZXQgdmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIEhJU1RPUlkgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHdoaWxlKCB2ZXJzaW9uID49IHRoaXMubWluVmVyc2lvbiApIHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS12ZXJzaW9uICR7dmVyc2lvbn0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGxldCBoaXMgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oIHZlcnNpb24gKVxuICAgICAgaGlzICYmIGhpcy5mb3JFYWNoKCAoIGVjLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmR1bXBDaGFuZ2VzKCBlYyApXG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICAgIGNvbnN0IG1zZyA9IGB0eXBlPSR7bWsubW9kZWx9LCBrZXk9JHttay5rZXl9LCBjaGFuZ2VzPXske2NoYW5nZXN9fSBcXG5gXG4gICAgICAgIHJlc3VsdCArPSBtc2dcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICAgIHZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhY2tlclNxbEJ1aWxkZXIge1xuICBwcml2YXRlIHRyYWNrZXI6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXIsIG1vZGVscyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPiwgc3FsQnVpbGRlcjogU3FsQnVpbGRlciApIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5tb2RlbHMgPSBtb2RlbHNcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBzcWxCdWlsZGVyXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQgZW50aXR5VHJhY2tlcigpIHsgcmV0dXJuIHRoaXMudHJhY2tlciB9XG5cbiAgcHVibGljIGJ1aWxkQ2hhbmdlU3FscygpIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5kZXRlY3RDaGFuZ2VzKCkuZm9yRWFjaCggZWMgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKGVjLmVudGl0eSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkU3FsQW5kUGFyYW1ldGVycyhwZSA6UHJveGllZDxhbnk+KSA6IFNxbEFuZFBhcmFtZXRlcnMge1xuICAgIGNvbnN0IGVudGl0eSA9IEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpXG4gICAgXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBlbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==