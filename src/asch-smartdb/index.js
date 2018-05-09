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
function partial(src, ...keys) {
    CodeContract.argument('src', () => CodeContract.notNull(src));
    CodeContract.argument('keys', () => CodeContract.notNull(keys));
    let result = {};
    for (let k of [...keys])
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
        this.trackerSqlBuilder = new EntityTracker_1.TrackerSqlBuilder(this.entityTracker, this.models, this.sqlBuilder);
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
    attach(schema, key) {
        let tracked = this.entityTracker.getTrackingEntity(schema, key);
        if (tracked !== undefined)
            return tracked;
        let cached = this.entityCache.get(schema.modelName, key);
        return (cached === undefined) ? undefined :
            this.entityTracker.trackPersistent(schema, cached);
    }
    getAll(model, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const schema = this.getSchema(model);
            if (schema.memCached && this.entityCache.existsModel(schema.modelName)) {
                let entities = this.entityCache.getAll(schema.modelName) || [];
                return track ? this.trackPersistentEntities(schema, entities, false) : entities;
            }
            return yield this.getMany(model, {}, track);
        });
    }
    getMany(model, condition, track = false, cache = true) {
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
        let exists = this.sessionCache.exists(schema.modelName, key) || this.entityTracker.isTracking(schema, key);
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
            const cached = this.loadCached(model, key, true);
            if (cached !== undefined)
                return cached;
            const modelName = typeof model === 'string' ? model : model.name;
            const schema = this.getSchemaByName(modelName);
            let tracked = this.entityTracker.getTrackingEntity(schema, key);
            if (tracked)
                return tracked;
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
        const pe = this.entityTracker.getTrackingEntity(schema, key);
        if (pe && track)
            return pe;
        const entity = this.sessionCache.get(modelName, key);
        if (entity === undefined || !track)
            return entity;
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
    get(key, options, getCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const keyLevel = this.subLevelDb;
            let { callback, promise } = makePromisifyOrCallback(getCallback);
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
            // Senondary( this.leveldb, indexField )
            //  let items =  await (() => {
            //     return new Promise( (res, rej) => {
            //       let blocks = new Array<T>()      
            //       indexLevel.createReadStream()
            //         .on('data', data => blocks.push(data) )
            //         .on('error', e => rej(e) )
            //         .on('end', () => res(blocks) )
            //     })
            //   })() as Array<T>
            const indexLevel = this.byIndex(indexField);
            let { callback, promise } = makePromisifyOrCallback(getCallback);
            indexLevel.get(key, callback);
            return promise;
        });
    }
    put(key, value, putCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = makePromisifyOrCallback(putCallback);
            this.subLevelDb.put(key, value, callback);
            return promise;
        });
    }
    del(key, delCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let { callback, promise } = makePromisifyOrCallback(delCallback);
            this.subLevelDb.del(key, callback);
            return promise;
        });
    }
    batch(array, options, batchCallback) {
        return __awaiter(this, arguments, void 0, function* () {
            if (arguments.length === 0)
                return this.subLevelDb.batch();
            let hasOptions = options && (!util_1.isFunction(options));
            let { callback, promise } = makePromisifyOrCallback(hasOptions ? batchCallback : options);
            if (hasOptions)
                this.subLevelDb.batch(array, options, callback);
            else
                this.subLevelDb.batch(array, callback);
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
            try {
                let { height } = yield this.blockDb.get(LAST_BLOCK_HEIGHT_KEY, {});
                return height;
            }
            catch (e) {
                if (!this.isKeyNotFoundError(e))
                    throw e;
                let lastHeight = { height: -1 };
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
        return new CompositeKey(Common_1.partial(entity, ...schema.compositeKeys));
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
        this.holdLocks = new Set();
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
        if (!this.holdLocks.has(lockName)) {
            this.holdLocks.add(lockName);
            return true;
        }
        if (!notThrow)
            throw new Error(`${lockName} exists already`);
        return false;
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
            Common_1.CodeContract.argument('serial', serial > 0, `serial must great than zero`);
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
     * get tracking entity by key
     * @param model model modelName or model type
     * @param key entity key
     * @returns tracked entity or undefined
     */
    attach(model, key) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
        let schema = this.getSchema(model, true, true);
        return this.getSession(schema).attach(schema, key);
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
            let items = yield this.getSession(schema).getMany(model, condition);
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
            return yield this.getSession(schema).getMany(model, condition, track);
        });
    }
    /**
     * load entity from cache only
     * @param model model name or model type
     * @param key key of entity
     * @param track track result
     * @returns tracked entity from cache
     */
    getCached(model, key, track = false) {
        Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
        Common_1.CodeContract.argument('key', () => Common_1.CodeContract.notNull(key));
        let schema = this.getSchema(model, true);
        return this.getSession(schema).loadCached(model, key, track);
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
        return (propertyName.length <= 4) ||
            (propertyName[0] !== propertyName[1]) || (propertyName[0] !== '_') ||
            (!propertyName.endsWith('__'));
    }
    attachExtendProperties(entity, schema, state) {
        let result = Object.assign({
            _version_: 1,
            __detached__: false,
            __state__: state,
            __schema__: schema,
            __tracker__: this.tracker,
            __tracking__: true,
            __tmpChanges__: null
        }, entity);
        result._version_ = result._version_ || 1;
        return result;
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
        let schema = ext.__schema__;
        if (schema.isReadonly) {
            throw new Error(`Can not modify readonly model '${schema.modelName}'`);
        }
        if (schema.primaryKey === name || schema.compositeKeys.indexOf(name) >= 0) {
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
const Model_1 = __webpack_require__(/*! ../Model */ "./src/Model.ts");
const Common_1 = __webpack_require__(/*! ../Common */ "./src/Common.ts");
const EntityProxy_1 = __webpack_require__(/*! ./EntityProxy */ "./src/StateTracker/EntityProxy.ts");
const util_1 = __webpack_require__(/*! util */ "util");
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
    isTracking(schema, key) {
        return this.allTrackingEntities.has(this.makeModelAndKey(schema, key));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUztJQUMzRSxDQUFDO0lBRUQsSUFBVyxpQkFBaUI7UUFDMUIsT0FBTyxFQUFFLEdBQUcsRUFBRyxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO0lBQ3RELENBQUM7SUFFTSxHQUFHLENBQUUsS0FBWTtRQUN0QixJQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBRSxLQUFLLENBQUMsTUFBTSxDQUFFLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUM7WUFDL0YsTUFBTSxJQUFJLEtBQUssQ0FBRSxzQkFBc0IsQ0FBQztRQUUxQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBRTtRQUNyQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNO1FBRTdCLElBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRztZQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBRSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUU7U0FDdEM7SUFDSCxDQUFDO0lBRU0sR0FBRyxDQUFFLE1BQWM7UUFDeEIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVNLE9BQU8sQ0FBRSxFQUFVO1FBQ3hCLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRztZQUNwQyxJQUFLLENBQUMsQ0FBQyxFQUFHLEtBQUssRUFBRTtnQkFBRyxPQUFPLENBQUM7U0FDN0I7UUFDRCxPQUFPLFNBQVM7SUFDbEIsQ0FBQztJQUVNLElBQUksQ0FBRSxVQUFrQixFQUFFLFFBQWdCO1FBQy9DLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBRTtRQUMxQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLFVBQVUsRUFBRSxRQUFRLENBQUU7UUFDMUMsSUFBSyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVM7WUFBRyxPQUFNO1FBRTFELEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFFO1FBQ3JDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFFO1FBQ3JDLEtBQU0sSUFBSSxNQUFNLEdBQUcsR0FBRyxFQUFFLE1BQU0sSUFBSSxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUc7WUFDaEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1NBQzFCO0lBQ0gsQ0FBQztDQUNGO0FBcERELGdDQW9EQzs7Ozs7Ozs7Ozs7Ozs7O0FDdkRELHVEQUFzRDtBQTRCdEQsd0JBQWtDLFFBQXFCLEVBQUUsTUFBeUIsRUFBRSxRQUF1QjtJQUN6RyxZQUFZLENBQUMsUUFBUSxDQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFFLFFBQVEsQ0FBRSxDQUFDO0lBQzFFLFlBQVksQ0FBQyxRQUFRLENBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUUsTUFBTSxDQUFFLENBQUM7SUFDdEUsWUFBWSxDQUFDLFFBQVEsQ0FBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBRSxRQUFRLENBQUUsQ0FBQztJQUUxRSxJQUFJLEdBQUcsR0FBRyxFQUFFO0lBQ1osS0FBSyxJQUFJLElBQUksSUFBSSxRQUFRLEVBQUU7UUFDekIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7S0FDbkM7SUFDRCxPQUFPLEdBQUc7QUFDWixDQUFDO0FBVkQsd0NBVUM7QUFFRCxrQkFBNEIsR0FBTztJQUNqQyxJQUFLLENBQUMsR0FBRztRQUFHLE9BQU8sR0FBRztJQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN4QyxDQUFDO0FBSEQsNEJBR0M7QUFFRCxpQkFBNEIsR0FBTyxFQUFFLEdBQUcsSUFBb0I7SUFDMUQsWUFBWSxDQUFDLFFBQVEsQ0FBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBRSxHQUFHLENBQUUsQ0FBQztJQUNoRSxZQUFZLENBQUMsUUFBUSxDQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFFLElBQUksQ0FBRSxDQUFDO0lBRWxFLElBQUksTUFBTSxHQUFJLEVBQUc7SUFDakIsS0FBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0MsT0FBTyxNQUFvQjtBQUM3QixDQUFDO0FBUEQsMEJBT0M7QUFFRCx3QkFBZ0MsR0FBUztJQUN2QyxJQUFLLENBQUMsR0FBRztRQUFHLE9BQU8sS0FBSztJQUN4QixPQUFPLGVBQVEsQ0FBRSxHQUFHLENBQUUsSUFBSSxlQUFRLENBQUUsR0FBRyxDQUFFO0FBQzNDLENBQUM7QUFIRCx3Q0FHQztBQUVELHVCQUErQixTQUFRLEtBQUs7SUFDMUMsWUFBYSxPQUFnQjtRQUMzQixLQUFLLENBQUUsc0JBQXNCLEdBQUUsT0FBTyxDQUFFO0lBQzFDLENBQUM7Q0FDRjtBQUpELDhDQUlDO0FBV0Q7SUFDUyxNQUFNLENBQUMsTUFBTSxDQUFFLFNBQTRCLEVBQUUsT0FBeUI7UUFDM0UsSUFBSyxTQUFTLEtBQUssU0FBUyxJQUFJLFNBQVMsS0FBSyxJQUFJO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQztRQUVoRyxNQUFNLElBQUksR0FBRyxpQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxTQUFzQixFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDMUUsTUFBTSxHQUFHLEdBQUcsaUJBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUUsT0FBb0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPO1FBRW5FLElBQUksQ0FBQyxJQUFJO1lBQUUsTUFBTSxJQUFJLGlCQUFpQixDQUFFLEdBQUcsQ0FBRTtJQUMvQyxDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBRSxPQUFlLEVBQUUsTUFBMEMsRUFBRSxPQUEwQjtRQUM3RyxJQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTTtZQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLCtDQUErQyxDQUFDO1FBRWxFLElBQUssQ0FBQyxPQUFPLEVBQUc7WUFDZCxNQUFNLEVBQUUsR0FBSyxNQUF5QixFQUFFO1lBQ3hDLFlBQVksQ0FBQyxNQUFNLENBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxhQUFhLE9BQU8sS0FBSyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDdEUsT0FBTTtTQUNQO1FBRUQsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUEyQixFQUFFLE9BQVEsQ0FBQztJQUM1RCxDQUFDO0lBR00sTUFBTSxDQUFDLE9BQU8sQ0FBRSxHQUFTO1FBQzlCLE1BQU0sTUFBTSxHQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxLQUFLLFNBQVM7UUFDakQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDZCQUE2QjtRQUVsRSxPQUFPLEVBQUUsTUFBTSxFQUFHLE9BQU8sRUFBRTtJQUM3QixDQUFDO0lBRU0sTUFBTSxDQUFDLGNBQWMsQ0FBRSxHQUFxQjtRQUNqRCxNQUFNLE1BQU0sR0FBSSxZQUFZLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7UUFFM0UsT0FBTyxFQUFFLE1BQU0sRUFBRyxPQUFPLEVBQUU7SUFDN0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBRSxHQUFxQjtRQUN0RCxNQUFNLE1BQU0sR0FBSSxZQUFZLENBQUMsY0FBYyxDQUFFLEdBQUcsQ0FBRSxJQUFNLEdBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO1FBQ3JGLE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQywyQ0FBMkM7UUFFaEYsT0FBTyxFQUFFLE1BQU0sRUFBRyxPQUFPLEVBQUU7SUFDN0IsQ0FBQztDQUVGO0FBN0NELG9DQTZDQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2SEQsdUZBQStFO0FBRy9FLGdHQUFnSDtBQUVoSCx1SEFBeUc7QUFFekcsK0RBQTBDO0FBQzFDLHVEQUE4QjtBQUk5QjtJQVVFLFlBQVksVUFBd0IsRUFBRSxZQUFpQyxFQUFFLFdBQW9CO1FBQzNGLElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQVUsQ0FBQyxTQUFTLENBQUUsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFFLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxXQUFXLEVBQUUsQ0FBQyxDQUFHO1FBQzFHLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVTtRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxFQUF1QjtRQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksNEJBQWMsQ0FBQyxZQUFZLENBQUM7UUFDcEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLDJCQUFjLEVBQUU7UUFDdEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLG9DQUFvQixDQUFFLElBQUksQ0FBQyxZQUFZLENBQUU7UUFDbEUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksaUNBQWlCLENBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUU7SUFDcEcsQ0FBQztJQUVELElBQVcsTUFBTTtRQUNmLE9BQU8sSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVc7SUFDdkQsQ0FBQztJQUVELElBQVcsV0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxZQUFZO0lBQzFCLENBQUM7SUFFTSxVQUFVLENBQUMsTUFBbUI7UUFDbkMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFFLEdBQUcsR0FBRTtZQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBRSxHQUFHLENBQUU7UUFDcEMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLGNBQWMsQ0FBQyxHQUFHLE9BQTRCO1FBQ25ELE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFFO0lBQ3pELENBQUM7SUFFUyxlQUFlLENBQUMsU0FBaUI7UUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQ3pDLElBQUssQ0FBQyxNQUFNO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsU0FBUyxLQUFLLENBQUM7UUFDOUUsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVTLGdCQUFnQixDQUFVLEtBQTJCO1FBQzdELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDMUMsSUFBSyxDQUFDLE1BQU07WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLGdDQUFnQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDL0UsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVTLFNBQVMsQ0FBVyxLQUErQjtRQUMzRCxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO0lBQ2hDLENBQUM7SUFFUyxrQkFBa0IsQ0FBQyxNQUFtQixFQUFFLEdBQWM7UUFDOUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFFLEVBQUUsRUFBRSxHQUFHLENBQUU7SUFDakMsQ0FBQztJQUVTLHVCQUF1QixDQUFXLE1BQW1CLEVBQUcsUUFBeUIsRUFBRSxLQUFLLEdBQUcsSUFBSTtRQUN2RyxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBVztRQUNqQyxRQUFRLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFFO1lBQzVELEtBQUssSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBQyxDQUFFO1FBQ3pFLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFUyxLQUFLLENBQUMsYUFBc0IsS0FBSztRQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRTtRQUNqQyxJQUFLLFVBQVU7WUFBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtJQUM1QyxDQUFDO0lBRVksS0FBSzs7WUFDaEIsSUFBSSxDQUFDLEtBQUssQ0FBRSxJQUFJLENBQUU7WUFDbEIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtRQUNwQyxDQUFDO0tBQUE7SUFFTSxhQUFhLENBQUUsT0FBOEM7UUFDbEUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUUsT0FBTyxDQUFFO0lBQzdDLENBQUM7SUFFTSxZQUFZLENBQVcsS0FBK0IsRUFBRSxNQUFpQyxFQUFFLEtBQUssR0FBRyxLQUFLO1FBQzdHLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3BDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFXLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFFLElBQUksRUFBRTtRQUVqRixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVE7SUFDbkYsQ0FBQztJQUVNLE1BQU0sQ0FBVyxNQUFtQixFQUFFLEdBQWM7UUFDekQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBVyxNQUFNLEVBQUUsR0FBRyxDQUFFO1FBQzFFLElBQUssT0FBTyxLQUFLLFNBQVM7WUFBRyxPQUFPLE9BQTRCO1FBRWhFLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFXLE1BQU0sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFFO1FBQ25FLE9BQU8sQ0FBRSxNQUFNLEtBQUssU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFFLE1BQU0sRUFBRSxNQUFNLENBQUU7SUFDeEQsQ0FBQztJQUVZLE1BQU0sQ0FBVyxLQUErQixFQUFFLEtBQUssR0FBRyxLQUFLOztZQUMxRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUVwQyxJQUFLLE1BQU0sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFHO2dCQUN4RSxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBVyxNQUFNLENBQUMsU0FBUyxDQUFFLElBQUksRUFBRTtnQkFDekUsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBRSxDQUFDLENBQUMsQ0FBQyxRQUFRO2FBQ2xGO1lBRUQsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUUsS0FBSyxFQUFFLEVBQUcsRUFBRSxLQUFLLENBQUU7UUFDaEQsQ0FBQztLQUFBO0lBRVksT0FBTyxDQUFXLEtBQWdDLEVBQUUsU0FBdUIsRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLEtBQUssR0FBRyxJQUFJOztZQUNuSCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUM7WUFFN0UsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDckUsSUFBSyxLQUFLO2dCQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUM7WUFFbEcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyx1QkFBdUIsQ0FBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBRTtRQUMzRCxDQUFDO0tBQUE7SUFFWSxLQUFLLENBQVUsS0FBK0IsRUFBRSxTQUF3QixFQUFFLFdBQTZCLEVBQUUsSUFBZ0IsRUFBRSxNQUFzQixFQUFFLElBQWtCOztZQUNoTCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUNwQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDdEcsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUMvRCxDQUFDO0tBQUE7SUFFWSxXQUFXLENBQVUsS0FBK0IsRUFBRSxNQUFtQjs7WUFDcEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDcEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN2RCxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDO1FBQy9ELENBQUM7S0FBQTtJQUVZLE1BQU0sQ0FBVSxLQUErQixFQUFFLFNBQXdCOztZQUNwRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssQ0FBRTtZQUV0QyxJQUFJLEVBQUUsS0FBSyxFQUFHLFVBQVUsRUFBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUcsU0FBUyxDQUFFO1lBQ2pGLEtBQUssR0FBRyxpQkFBaUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQ0FBbUIsRUFBRSxFQUFFLENBQUMsWUFBWTtZQUMzRSxNQUFNLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFFLEtBQUssRUFBRSxVQUFVLENBQUU7WUFFNUQsT0FBTyxjQUFPLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdEQsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUFVLEtBQStCLEVBQUUsU0FBd0I7O1lBQ25GLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBRSxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUcsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFFO1lBQ2pHLE9BQU8sY0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckQsQ0FBQztLQUFBO0lBRU0sTUFBTSxDQUFVLEtBQWdDLEVBQUcsR0FBYyxFQUFFLE1BQWlCO1FBQ3pGLElBQUssQ0FBQyxHQUFHO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQztRQUV0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztRQUNwQyxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUU7UUFDOUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBRTtRQUVwRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7UUFDMUcsSUFBSyxNQUFNO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBb0MsTUFBTSxDQUFDLFNBQVMsWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUV4RyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQVk7SUFDbEUsQ0FBQztJQUVlLGVBQWUsQ0FBQyxTQUFpQixFQUFFLEdBQWM7O1lBQy9ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDO1lBQzlDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDO1lBQ2xELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQztZQUV6RSxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUNuRSxJQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO2dCQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxTQUFTLFlBQVksR0FBRyxLQUFLLENBQUU7YUFDdkY7WUFFRCxPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFDaEQsQ0FBQztLQUFBO0lBRVksSUFBSSxDQUFVLEtBQWdDLEVBQUUsR0FBYzs7WUFDekUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBRTtZQUNsRCxJQUFLLE1BQU0sS0FBSyxTQUFTO2dCQUFHLE9BQU8sTUFBTTtZQUV6QyxNQUFNLFNBQVMsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUk7WUFDaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBRSxTQUFTLENBQUc7WUFFakQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBVyxNQUFNLEVBQUUsR0FBRyxDQUFFO1lBQzFFLElBQUssT0FBTztnQkFBRyxPQUFPLE9BQTZCO1lBRW5ELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBRSxTQUFTLEVBQUUsR0FBRyxDQUFFO1lBQzNELElBQUssTUFBTSxLQUFLLFNBQVM7Z0JBQUcsT0FBTyxTQUFTO1lBRTVDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFFO1lBQy9DLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLENBQVk7UUFDL0YsQ0FBQztLQUFBO0lBRU0sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsRUFBRTtJQUNoRCxDQUFDO0lBRU0sVUFBVSxDQUFVLEtBQWdDLEVBQUUsR0FBYyxFQUFHLEtBQUssR0FBRyxLQUFLO1FBQ3pGLE1BQU0sU0FBUyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSTtRQUNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQztRQUU5QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFFLE1BQU0sRUFBRSxHQUFHLENBQUU7UUFDOUQsSUFBSyxFQUFFLElBQUksS0FBSztZQUFHLE9BQU8sRUFBdUI7UUFFakQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQVUsU0FBUyxFQUFFLEdBQUcsQ0FBQztRQUM3RCxJQUFLLE1BQU0sS0FBSyxTQUFTLElBQUksQ0FBRSxLQUFLO1lBQUcsT0FBTyxNQUFNO1FBRXBELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBWTtJQUN0RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ1UsV0FBVyxDQUFDLE1BQWdCOztZQUN2QyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtZQUNoRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsU0FBUyxJQUFJLENBQUM7WUFFdEYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRTtZQUNyRCxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1lBQ2hELElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBRSxJQUFJLENBQUU7Z0JBQzFDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRTtnQkFFcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUUsU0FBUyxDQUFFO2dCQUM3QyxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVM7Z0JBRTlCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxTQUFTLElBQUksQ0FBQztnQkFDeEYsT0FBTyxTQUFTO2FBQ2pCO1lBQ0QsT0FBTSxHQUFHLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLFNBQVMsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDMUYsTUFBTSxLQUFLLENBQUMsUUFBUSxFQUFFO2dCQUN0QixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRTtnQkFDbEMsTUFBTSxHQUFHO2FBQ1Y7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVSxlQUFlLENBQUUsTUFBYzs7WUFDMUMsSUFBSSxJQUFJLENBQUMsYUFBYSxJQUFJLE1BQU07Z0JBQUcsT0FBTyxJQUFJLENBQUMsYUFBYTtZQUU1RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYTtZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsTUFBTSxJQUFJLENBQUM7WUFFdkYsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDdkUsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRTtZQUNoRCxJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUN4QyxNQUFNLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBRXBCLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTTtnQkFFM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUNBQXFDLElBQUksT0FBTyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUM7Z0JBQzlHLE9BQU8sSUFBSSxDQUFDLGFBQWE7YUFDMUI7WUFDRCxPQUFNLEdBQUcsRUFBRTtnQkFDVCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsSUFBSSxPQUFPLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ2hILE1BQU0sS0FBSyxDQUFDLFFBQVEsRUFBRTtnQkFDdEIsTUFBTSxHQUFHO2FBQ1Y7UUFDSCxDQUFDO0tBQUE7SUFFTSxrQkFBa0IsQ0FBRSxNQUFjO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUUsTUFBTSxDQUFFO0lBQ2xELENBQUM7SUFFRCxJQUFXLGNBQWM7UUFDdkIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWM7SUFDMUMsQ0FBQztJQUVNLE1BQU0sQ0FBVSxNQUFlO1FBQ3BDLGVBQWU7SUFDakIsQ0FBQztJQUVNLE1BQU0sQ0FBVSxNQUFlO1FBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFFLE1BQW9DLENBQUMsVUFBVSxFQUFHLE1BQU0sQ0FBQztJQUMzRixDQUFDO0lBRVksZ0JBQWdCOztZQUMzQixPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUU7UUFDM0MsQ0FBQztLQUFBO0NBRUY7QUE5UkQsOEJBOFJDOzs7Ozs7Ozs7Ozs7Ozs7QUMxU0QsOERBQWdDO0FBQ2hDLHdFQUF3RztBQUN4RywrREFBMEM7QUFDMUMsdURBQXNEO0FBcUJ0RDtJQVFFLFlBQW9CLE9BQTRCO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLEVBQUUsT0FBTyxFQUFHLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRTtRQUM5RSxnQ0FBZ0M7UUFDaEMsMkdBQTJHO1FBRTNHLElBQUksQ0FBQyxHQUFHLEdBQUcsZ0JBQVUsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztRQUNwRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFxQztJQUNqRSxDQUFDO0lBRU8sYUFBYSxDQUFDLFNBQWtCLEVBQUUsaUJBQWlCLEdBQUcsS0FBSyxFQUFFLGdCQUFnQixHQUFHLEtBQUs7UUFDM0YsSUFBSyxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQzFELG9CQUFvQjtZQUNwQixjQUFjO1lBQ2QsNkRBQTZEO1lBQzdELGdEQUFnRDtZQUNoRCw0QkFBNEI7WUFDNUIsSUFBSTtZQUNKLElBQUksY0FBdUIsQ0FBQztZQUM1QixJQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDO2dCQUMxQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPO2lCQUNsQyxJQUFLLGVBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN6QyxjQUFjLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQzdDLElBQUssaUJBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMzQyxjQUFjLEdBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQXVCLENBQUUsU0FBUyxDQUFFOztnQkFFN0UsY0FBYyxHQUFHLGNBQWMsQ0FBQyx1QkFBdUI7WUFFekQsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUUsY0FBYyxDQUFDLGdCQUFnQixFQUFFLGNBQWMsQ0FBRTtZQUM1RSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxHQUFHLENBQWtCLGNBQWMsQ0FBRSxDQUFFO1NBQzVFO1FBQ0EsSUFBSyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztZQUN2RCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixTQUFTLHNCQUFzQixDQUFDO1FBRTVFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO0lBQ3hDLENBQUM7SUFFUyxXQUFXLENBQUUsR0FBYztRQUNuQyxPQUFPLHVCQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQXNCLENBQUMsQ0FBQyxDQUFHLEdBQWtCLENBQUMsR0FBRztJQUNoRixDQUFDO0lBRU0sS0FBSyxDQUFDLFNBQW1CO1FBQzlCLElBQUssZUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFHO1lBQ3pCLElBQUksQ0FBQyxhQUFhLENBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUcsQ0FBQyxLQUFLLEVBQUU7WUFDckQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUUsU0FBUyxDQUFFO1lBQ3BDLE9BQU07U0FDUDtRQUNELEtBQU0sSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRztZQUN6QyxDQUFDLENBQUMsS0FBSyxFQUFFO1NBQ1Y7UUFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtJQUMxQixDQUFDO0lBRUQsSUFBVyxNQUFNO1FBQ2YsSUFBSSxNQUFNLEdBQUcsSUFBSSxLQUFLLEVBQVU7UUFDaEMsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFHO1lBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFO1NBQ2pCO1FBQ0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVNLEdBQUcsQ0FBVSxTQUFpQixFQUFFLEdBQWM7UUFDbkQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7UUFDOUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBRSxHQUFHLENBQUU7UUFFdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNuRCxVQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFXLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBWSxDQUFDLENBQUMsQ0FBQyxTQUFTO0lBQ2hGLENBQUM7SUFFTSxNQUFNLENBQVUsU0FBaUIsRUFBRSxNQUFpQztRQUN6RSxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBVztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFFLFNBQVMsQ0FBRTtRQUMzQyxJQUFLLEtBQUssS0FBSyxTQUFTO1lBQUcsT0FBTyxTQUFTO1FBRTNDLEtBQUssQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDakIsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUUsQ0FBWSxDQUFFLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUUsQ0FBWSxDQUFFO1FBQ2hGLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFTSxHQUFHLENBQUMsU0FBaUIsRUFBRSxHQUFjLEVBQUUsTUFBYztRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsU0FBUyxXQUFXLEdBQUcsY0FBYyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDNUgsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDO0lBQ3pFLENBQUM7SUFFTSxJQUFJLENBQUMsU0FBaUIsRUFBRSxHQUFjO1FBQzNDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUUsR0FBRyxDQUFFO1FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixTQUFTLFdBQVcsUUFBUSxFQUFFLENBQUM7UUFFOUYsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUM7UUFDaEQsSUFBSSxVQUFVO1lBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7SUFDMUMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxTQUFpQixFQUFFLEdBQWM7UUFDN0MsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRyxJQUFJLENBQUMsV0FBVyxDQUFFLEdBQUcsQ0FBRSxDQUFDLEtBQUssU0FBUztJQUNwRSxDQUFDO0lBRU0sV0FBVyxDQUFDLFNBQWlCO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBRSxLQUFLLFNBQVM7SUFDcEUsQ0FBQztJQUdNLFNBQVM7UUFDZCxJQUFJLE1BQU0sR0FBRyxrREFBa0Q7UUFDL0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7WUFDekMsTUFBTSxJQUFJLHVCQUF1QixLQUFLLG9CQUFvQjtZQUMxRCxLQUFLLENBQUMsT0FBTyxDQUFFLENBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRyxFQUFFO2dCQUMvQixNQUFNLElBQUksU0FBUyxJQUFJLENBQUMsV0FBVyxDQUFFLEdBQUcsQ0FBRSxlQUFlLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU07WUFDdkYsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxJQUFJLElBQUk7UUFDaEIsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxJQUFJLGlEQUFpRDtRQUMzRCxPQUFPLE1BQU07SUFDZixDQUFDOztBQXZIYywrQkFBZ0IsR0FBRyxHQUFHO0FBQ3RCLHNDQUF1QixHQUFHLEtBQUs7QUFGaEQsd0NBMEhDOzs7Ozs7Ozs7Ozs7Ozs7QUNsSkQscUVBQWdDO0FBQ2hDLG1FQUFnQztBQUVoQyw2RUFBc0M7QUFDdEMsc0dBQWtEO0FBR2xELElBQWlCLFFBQVEsQ0FPeEI7QUFQRCxXQUFpQixRQUFRO0lBQ1YsZ0JBQU8sR0FBRyxHQUFHLENBQUMsT0FBTztJQUNyQixvQkFBVyxHQUFHLEtBQUssQ0FBQyxXQUFXO0lBRS9CLGtCQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVM7SUFFN0IseUJBQWdCLEdBQUcsTUFBTSxDQUFDLGdCQUFnQjtBQUN6RCxDQUFDLEVBUGdCLFFBQVEsR0FBUixnQkFBUSxLQUFSLGdCQUFRLFFBT3hCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ2RELHVEQUFpQztBQUVqQyx3RUFBcUM7QUFFckMsTUFBTSxLQUFLLEdBQUcsbUJBQU8sQ0FBQyxvQkFBTyxDQUFDO0FBQzlCLE1BQU0sU0FBUyxHQUFHLG1CQUFPLENBQUMsd0NBQWlCLENBQUM7QUFLNUM7SUFLRSxZQUFtQixPQUFlLEVBQUUsUUFBZ0IsRUFBRSxXQUFXLEdBQUcsSUFBSSxLQUFLLEVBQWM7UUFDekYsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPO1FBQ3RCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUTtRQUN4QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksS0FBSyxFQUFjLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztJQUNoRSxDQUFDO0lBRU8sb0JBQW9CLENBQUMsU0FBa0I7UUFDN0MsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3pFLENBQUM7SUFFTSxXQUFXLENBQUMsU0FBaUI7UUFDbEMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxRQUFRLENBQUMsU0FBa0IsRUFBRSxTQUE2QjtRQUMvRCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsbUJBQW1CLFNBQVMsa0JBQWtCLENBQUM7UUFFakUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUM7UUFDL0MsT0FBTyxJQUFJO0lBQ2IsQ0FBQztJQUVNLFdBQVcsQ0FBQyxTQUFTO1FBQzFCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUM7UUFDaEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDWixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO1FBQ0QsT0FBTyxJQUFJO0lBQ2IsQ0FBQztDQUNGO0FBbENELG9DQWtDQztBQUVEO0lBQ0UsSUFBSSxRQUFRO0lBQ1osSUFBSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDN0MsUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7SUFDL0QsQ0FBQyxDQUFDO0lBQ0YsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPO0lBQzFCLE9BQU8sUUFBUTtBQUNqQixDQUFDO0FBRUQsaUNBQWlDLFFBQW9DO0lBQ25FLElBQUksT0FBTyxHQUFHLElBQUk7SUFFbEIsSUFBSyxDQUFDLFFBQVEsRUFBRztRQUNmLFFBQVEsR0FBRyxXQUFXLEVBQUU7UUFDeEIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7S0FDOUI7SUFFRCxPQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUM3QixDQUFDO0FBMEJEO0lBT0UsWUFBWSxLQUFjLEVBQUUsSUFBMEIsRUFBRSxPQUFPLEdBQUcsRUFBRTtRQUNsRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUs7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEtBQUssRUFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ3RELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQXdCO1FBQ2hELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSTtJQUNyQixDQUFDO0lBRWEsSUFBSTs7WUFDaEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBRTtZQUM3RCxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ25DLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7S0FBQTtJQUVPLGdCQUFnQixDQUFFLElBQWtCO1FBQzFDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDbEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxlQUFlLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDN0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7SUFDL0MsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU87SUFDckIsQ0FBQztJQUVNLFdBQVcsQ0FBRSxPQUFlO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztRQUN2QyxJQUFLLENBQUMsR0FBRztZQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsNEJBQTRCLE9BQU8sR0FBRyxDQUFDO1FBRW5FLE9BQU8sR0FBRztJQUNaLENBQUM7SUFFTSxJQUFJLENBQUMsWUFBNkI7UUFDdkMsSUFBSSxJQUFJLEdBQUcsSUFBSTtRQUNmLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsWUFBWSxDQUFDO1FBRWpFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7WUFDdEMsT0FBTyxPQUFPO1NBQ2Y7UUFFRCxDQUFDLEdBQU8sRUFBRTtZQUNSLElBQUk7Z0JBQ0YsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNqQixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO2FBQ3ZDO1lBQ0QsT0FBTSxHQUFHLEVBQUU7Z0JBQ1QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQzthQUN0QztRQUNILENBQUMsRUFBQyxFQUFFO1FBRUosT0FBTyxPQUFPO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsYUFBOEI7UUFDekMsSUFBSSxJQUFJLEdBQUcsSUFBSTtRQUNmLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsYUFBYSxDQUFDO1FBRWxFLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixPQUFPLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO1lBQ3RDLE9BQU8sT0FBTztTQUNmO1FBRUQsQ0FBQyxHQUFPLEVBQUU7WUFDUixJQUFJO2dCQUNGLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSTtnQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQzthQUN2QztZQUNELE9BQU0sR0FBRyxFQUFFO2dCQUNULE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQzthQUNoQztRQUNILENBQUMsRUFBQyxFQUFFO1FBRUosT0FBTyxPQUFPO0lBQ2hCLENBQUM7SUFFRCxJQUFXLE1BQU07UUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7SUFDOUMsQ0FBQztJQUVELElBQVcsUUFBUTtRQUNqQixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7SUFDbkQsQ0FBQztJQUVNLElBQUk7UUFDVCxPQUFPLElBQUksT0FBTyxDQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO1lBQy9CLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxFQUFVO1lBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7aUJBQzVCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBRTtpQkFDMUUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBRTtpQkFDekIsRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFFO1FBQy9DLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQW5HRCwwQkFtR0M7QUFFRDtJQU9FLElBQVcsSUFBSSxLQUFLLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBQyxDQUFDO0lBQ3pDLElBQVcsT0FBTyxLQUFLLE9BQU8sSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDO0lBRS9DLFlBQW9CLFFBQWEsRUFBRSxPQUFlLEVBQUUsUUFBaUIsRUFBRSxHQUFHLFdBQStCO1FBQ3ZHLElBQUksQ0FBQyxVQUFVLEdBQUcsUUFBUTtRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU87UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxLQUFLLEVBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxXQUFXLENBQUM7UUFDaEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxFQUFvQjtRQUNuRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRTtZQUMzQixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBRTtZQUMvRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFFO1FBQ3JELENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFXLEdBQUc7UUFDWixPQUFPLElBQUksQ0FBQyxRQUFRO0lBQ3RCLENBQUM7SUFFWSxHQUFHLENBQUksR0FBUSxFQUFFLE9BQW1CLEVBQUUsV0FBMEI7O1lBQzNFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUE2QjtZQUNuRCxJQUFJLEVBQUUsUUFBUSxFQUFHLE9BQU8sRUFBRSxHQUFHLHVCQUF1QixDQUFDLFdBQVcsQ0FBQztZQUNqRSxRQUFRLENBQUMsR0FBRyxDQUFJLEdBQUcsRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDO1lBRXZDLE9BQU8sT0FBTztRQUNoQixDQUFDO0tBQUE7SUFFTSxPQUFPLENBQUUsY0FBdUI7UUFDckMsTUFBTSxRQUFRLEdBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDM0QsSUFBSyxDQUFDLFFBQVE7WUFBRyxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixjQUFjLEdBQUcsQ0FBQztRQUU3RSxPQUFPLFFBQVE7SUFDakIsQ0FBQztJQUVZLEtBQUssQ0FBSSxVQUFtQixFQUFFLEdBQVEsRUFBRSxXQUEwQjs7WUFFN0Usd0NBQXdDO1lBQ3hDLCtCQUErQjtZQUMvQiwwQ0FBMEM7WUFDMUMsMENBQTBDO1lBQzFDLHNDQUFzQztZQUN0QyxrREFBa0Q7WUFDbEQscUNBQXFDO1lBQ3JDLHlDQUF5QztZQUN6QyxTQUFTO1lBQ1QscUJBQXFCO1lBQ3JCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUUsVUFBVSxDQUFFO1lBRTdDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxDQUFDO1lBRWhFLFVBQVUsQ0FBQyxHQUFHLENBQUksR0FBRyxFQUFFLFFBQVEsQ0FBQztZQUVoQyxPQUFPLE9BQU87UUFDaEIsQ0FBQztLQUFBO0lBRVksR0FBRyxDQUFJLEdBQVEsRUFBRSxLQUFRLEVBQUUsV0FBNkI7O1lBQ25FLElBQUksRUFBRSxRQUFRLEVBQUcsT0FBTyxFQUFFLEdBQUcsdUJBQXVCLENBQUMsV0FBVyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDO1lBRXpDLE9BQU8sT0FBTztRQUNoQixDQUFDO0tBQUE7SUFFWSxHQUFHLENBQUMsR0FBUSxFQUFFLFdBQTZCOztZQUN0RCxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLHVCQUF1QixDQUFDLFdBQVcsQ0FBQztZQUNoRSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO1lBRWxDLE9BQU8sT0FBTztRQUNoQixDQUFDO0tBQUE7SUFFWSxLQUFLLENBQUMsS0FBeUIsRUFBRSxPQUFxQixFQUFFLGFBQStCOztZQUNsRyxJQUFLLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFBRyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFO1lBRTVELElBQUksVUFBVSxHQUFHLE9BQU8sSUFBSSxDQUFDLENBQUMsaUJBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNsRCxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLHVCQUF1QixDQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUF3QixDQUFDO1lBRTNHLElBQUksVUFBVTtnQkFDWixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQzs7Z0JBRS9DLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7WUFFeEMsT0FBTyxPQUFPO1FBQ2hCLENBQUM7S0FBQTtJQUVNLGdCQUFnQixDQUFDLE9BQW9CO1FBQzFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7SUFDbEQsQ0FBQztJQUVNLGVBQWUsQ0FBQyxPQUFvQjtRQUN6QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQztJQUNqRCxDQUFDO0lBRU0saUJBQWlCLENBQUMsT0FBb0I7UUFDM0MsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztJQUNuRCxDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcFNELHFGQUFvRTtBQUtwRSxNQUFNLHFCQUFxQixHQUFHLHVCQUF1QjtBQUVyRDtJQU1FLFlBQWEsR0FBWSxFQUFFLFlBQVksR0FBRyxFQUFFO1FBQzFDOzs7VUFHRTtRQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO1lBQ2xELEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtZQUNuQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7U0FDMUIsQ0FBQztRQUNGLE1BQU0sY0FBYyxHQUFHLElBQUksc0JBQVksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQztRQUU1RCxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksaUJBQU8sQ0FBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLEVBQUUsWUFBWSxDQUFFO1FBQ3ZFLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFYSx3QkFBd0I7O1lBQ3BDLElBQUk7Z0JBQ0YsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFJLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQXFCLHFCQUFxQixFQUFFLEVBQUUsQ0FBQztnQkFDdkYsT0FBTyxNQUFNO2FBQ2Q7WUFDRCxPQUFNLENBQUMsRUFBRTtnQkFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQztvQkFBRSxNQUFNLENBQUM7Z0JBRXhDLElBQUksVUFBVSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUMvQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQztnQkFDekQsT0FBTyxVQUFVLENBQUMsTUFBTTthQUN6QjtRQUNILENBQUM7S0FBQTtJQUVZLElBQUk7O1lBQ2YsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRTtZQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUN6QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztZQUMzQyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFO1FBQ3pELENBQUM7S0FBQTtJQUVZLEtBQUs7O1lBQ2hCLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7UUFDdkIsQ0FBQztLQUFBO0lBRUQsSUFBVyxlQUFlO1FBQ3hCLE9BQU8sSUFBSSxDQUFDLFVBQVU7SUFDeEIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLENBQUM7UUFDMUIsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLGVBQWU7SUFDbkMsQ0FBQztJQUVPLGlCQUFpQixDQUFFLFVBQWtCO1FBQzNDLE9BQU87WUFDTCxNQUFNLEVBQUcsVUFBVTtZQUNuQixFQUFFLEVBQUcsTUFBTTtZQUNYLFFBQVEsRUFBRyxNQUFNO1NBQ2xCO0lBQ0gsQ0FBQztJQUVZLFdBQVcsQ0FBRSxLQUFtQixFQUFFLE9BQWlDOztZQUM5RSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxTQUFTO2dCQUN0RSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDO1lBRXZDLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUM7WUFDL0MsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztnQkFDdkIsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7Z0JBQ2pELEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUcscUJBQXFCLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7YUFDM0YsQ0FBQztZQUVELElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE1BQU07UUFDaEMsQ0FBQztLQUFBO0lBRVksUUFBUSxDQUFFLE1BQWU7O1lBQ3BDLElBQUk7Z0JBQ0YsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFjLE1BQU0sQ0FBQzthQUNuRDtZQUNELE9BQU0sQ0FBQyxFQUFFO2dCQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO29CQUFFLE1BQU0sQ0FBQzthQUN6QztZQUNELE9BQU8sU0FBUztRQUNsQixDQUFDO0tBQUE7SUFFWSxpQkFBaUIsQ0FBRSxTQUFpQixFQUFFLFNBQWlCOztZQUNsRSxJQUFJLEdBQUcsR0FBSSxJQUFJLEdBQUcsRUFBb0M7WUFDdEQsS0FBSyxJQUFJLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRztnQkFDM0MsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBMkIsQ0FBQyxDQUFDO2dCQUNyRSxPQUFPLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLEVBQUUsT0FBTyxDQUFFO2FBQ2pDO1lBQ0QsT0FBTyxHQUFHO1FBQ1osQ0FBQztLQUFBO0lBRVksZUFBZSxDQUFFLE1BQWU7O1lBQzNDLElBQUksTUFBTSxLQUFLLElBQUksQ0FBQyxlQUFlO2dCQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixNQUFNLEdBQUcsQ0FBQztZQUUxRCxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO2dCQUN2QixFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFHLE1BQU0sRUFBRTtnQkFDN0IsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRyxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFFLE1BQU0sR0FBRyxDQUFDLENBQUUsRUFBRTthQUMxRixDQUFDO1lBQ0YsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxNQUFNLENBQUU7WUFFbEMsSUFBSSxDQUFDLFVBQVUsRUFBRztRQUNwQixDQUFDO0tBQUE7SUFFWSxZQUFZLENBQUUsT0FBZ0I7O1lBQ3pDLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBYyxJQUFJLEVBQUUsT0FBTyxDQUFDO1FBQzdELENBQUM7S0FBQTtJQUVZLHNCQUFzQixDQUFFLFNBQWlCLEVBQUUsU0FBa0I7O1lBQ3hFLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxFQUFlO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQUcsU0FBUyxFQUFHLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUc7Z0JBQzdDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFFLEtBQU0sQ0FBRTthQUMvQjtZQUNELE9BQU8sTUFBTTtRQUNmLENBQUM7S0FBQTtJQUVZLGNBQWMsQ0FBRSxRQUF3Qjs7WUFDbkQsSUFBSSxHQUFHLEdBQUksSUFBSSxLQUFLLEVBQWU7WUFDbkMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUc7Z0JBQ3pDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUU7Z0JBQ2xELEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBRTthQUMzQjtZQUNELE9BQU8sR0FBRztRQUNaLENBQUM7S0FBQTtDQUNGO0FBaElELGdDQWdJQzs7Ozs7Ozs7Ozs7Ozs7O0FDdklELElBQVksUUFVWDtBQVZELFdBQVksUUFBUTtJQUNsQix1Q0FBZ0I7SUFDaEIsMENBQVc7SUFDWCwwQ0FBVztJQUNYLHNDQUFXO0lBQ1gsdUNBQVU7SUFDVix1Q0FBVTtJQUNWLHlDQUFVO0lBQ1YseUNBQVU7SUFDVix1Q0FBVTtBQUNaLENBQUMsRUFWVyxRQUFRLEdBQVIsZ0JBQVEsS0FBUixnQkFBUSxRQVVuQjtBQXFCRDtJQU1FLElBQVcsV0FBVyxLQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBSSxDQUFDLEVBQUMsQ0FBQztJQUN0RSxJQUFXLFlBQVksS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUM7SUFDdEUsSUFBVyxZQUFZLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO0lBQ3RFLElBQVcsVUFBVSxLQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBSyxDQUFDLEVBQUMsQ0FBQztJQUN0RSxJQUFXLFdBQVcsS0FBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUksQ0FBQyxFQUFDLENBQUM7SUFDdEUsSUFBVyxXQUFXLEtBQU0sT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBQyxDQUFDO0lBQ3RFLElBQVcsWUFBWSxLQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQztJQUV0RSxJQUFXLFFBQVEsS0FBSyxPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztJQUMzQyxJQUFXLFFBQVEsQ0FBRSxLQUFlLElBQUssSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEVBQUMsQ0FBQztJQUU3RCxZQUFtQixTQUF1QixFQUFFLGFBQWEsR0FBRyxLQUFLLEVBQUUsVUFBa0IsRUFBRSxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUc7UUFDekcsSUFBSSxDQUFDLElBQUksR0FBRyxVQUFVO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSztRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxhQUFhO0lBQzdCLENBQUM7SUFFUyxhQUFhLENBQUUsR0FBVyxFQUFFLE9BQWU7UUFDbkQsT0FBTyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsa0JBQWtCLEVBQUUsS0FBSyxPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksS0FBSyxHQUFHLEVBQUU7SUFDaEYsQ0FBQztJQUVNLElBQUksQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3hDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsTUFBTSxDQUFFO1FBQzVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQ3pDLENBQUM7SUFFTSxLQUFLLENBQUUsR0FBVyxFQUFFLEdBQUcsTUFBYTtRQUN6QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBRTtRQUM3RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBRTtJQUMxQyxDQUFDO0lBRU0sR0FBRyxDQUFFLEdBQVcsRUFBRSxHQUFHLE1BQWE7UUFDdkMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLEdBQUcsRUFBRSxLQUFLLENBQUU7UUFDM0QsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBRSxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUU7SUFDMUMsQ0FBQztJQUVNLEtBQUssQ0FBRSxHQUFXLEVBQUUsR0FBRyxNQUFhO1FBQ3pDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFFO0lBQzFDLENBQUM7SUFFTSxJQUFJLENBQUUsR0FBVyxFQUFFLEdBQUcsTUFBYTtRQUN4QyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBRTtRQUM1RCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFFLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBRTtJQUN6QyxDQUFDO0lBRU0sS0FBSyxDQUFFLEdBQVcsRUFBRSxHQUFVO1FBQ25DLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNuQyxDQUFDO0lBRU0sS0FBSyxDQUFFLEdBQVcsRUFBRSxHQUFVO1FBQ25DLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBRSxHQUFHLEVBQUUsT0FBTyxDQUFFO1FBQzdELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNuQyxDQUFDO0NBQ0Y7QUFFRDtJQUtTLE1BQU0sS0FBSyxZQUFZLENBQUUsS0FBZTtRQUM3QyxVQUFVLENBQUMsZUFBZSxHQUFHLEtBQUs7SUFDcEMsQ0FBQztJQUVNLE1BQU0sS0FBSyxVQUFVLENBQUcsS0FBbUI7UUFDaEQsVUFBVSxDQUFDLFlBQVksR0FBRyxLQUFLO0lBQ2pDLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQW1CLEVBQUUsS0FBaUI7UUFDNUQsT0FBTyxVQUFVLENBQUMsQ0FBQztZQUNqQixJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxJQUFJLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ25HLFVBQVUsQ0FBQyxhQUFhLENBQUM7SUFDN0IsQ0FBQzs7QUFoQmMsMEJBQWUsR0FBRyxRQUFRLENBQUMsR0FBRztBQUM5Qix1QkFBWSxHQUFHLEdBQUcsRUFBRSxDQUFFLE9BQTJCO0FBQ2pELHdCQUFhLEdBQUcsSUFBSSxhQUFhLENBQUUsVUFBVSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxlQUFlLENBQUU7QUFIMUgsZ0NBa0JDOzs7Ozs7Ozs7Ozs7Ozs7QUNqSEQsdURBQStCO0FBQy9CLHdFQUF5RztBQUt6RyxJQUFZLFVBS1g7QUFMRCxXQUFZLFVBQVU7SUFDcEIsK0JBQW1CO0lBQ25CLCtCQUFtQjtJQUNuQiwrQkFBbUI7SUFDbkIsMkJBQWlCO0FBQ25CLENBQUMsRUFMVyxVQUFVLEdBQVYsa0JBQVUsS0FBVixrQkFBVSxRQUtyQjtBQXVCRDtJQUdFLFlBQW9CLFNBQXNCO1FBQ3hDLHFCQUFHLENBQUMsUUFBUSxDQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV4RCxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVM7SUFDNUIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxJQUFJLENBQVcsTUFBbUIsRUFBRSxNQUFnQjtRQUNoRSxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQscUJBQUcsQ0FBQyxRQUFRLENBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxhQUFhLEVBQUUsdUNBQXVDLENBQUM7UUFDdEYscUJBQUcsQ0FBQyxRQUFRLENBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWxELE9BQU8sSUFBSSxZQUFZLENBQUUsZ0JBQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUU7SUFDckUsQ0FBQztJQUVNLE1BQU0sQ0FBQyxVQUFVLENBQUUsYUFBcUI7UUFDN0MscUJBQUcsQ0FBQyxRQUFRLENBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsbUJBQW1CLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFNUUsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFFLGFBQWEsQ0FBRSxDQUFDLFNBQVMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFNBQVM7SUFDdkIsQ0FBQztJQUVELElBQVcsR0FBRztRQUNaLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxRQUFRO1FBQ2IsT0FBTyxJQUFJLENBQUMsR0FBRztJQUNqQixDQUFDO0NBQ0Y7QUFsQ0Qsb0NBa0NDO0FBRUQsd0JBQWdDLEdBQVM7SUFDdkMsSUFBSSxDQUFFLEdBQUc7UUFBRyxPQUFPLEtBQUs7SUFDeEIsT0FBTyxHQUFHLENBQUMsT0FBTztBQUNwQixDQUFDO0FBSEQsd0NBR0M7QUFFRDtJQWFFLFlBQVksTUFBYyxFQUFFLElBQVk7UUFDdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRyxNQUFNLENBQUM7UUFDeEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJO1FBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sS0FBSyxJQUFJO1FBQ3BDLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsS0FBSyxJQUFJO1FBQ3hDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxJQUFJLENBQUMsTUFBTSxDQUFFO1FBQ3RDLElBQUksQ0FBQyxXQUFXLEVBQUU7SUFDcEIsQ0FBQztJQUVPLGtCQUFrQixDQUFFLE1BQWU7UUFDekMsSUFBSyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssV0FBVyxDQUFDO1lBQUcsT0FBTTtRQUNuRSxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztZQUN0QixJQUFJLEVBQUUsV0FBVztZQUNqQixJQUFJLEVBQUUsVUFBVSxDQUFDLE1BQU07WUFDdkIsT0FBTyxFQUFFLENBQUM7U0FDWCxDQUFDO0lBQ0osQ0FBQztJQUVPLFdBQVcsQ0FBRSxJQUFnQjtRQUNuQyxPQUFPLElBQUk7SUFDYixDQUFDO0lBRU8sV0FBVztRQUNqQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxLQUFLLElBQUksQ0FBRSxDQUFFLEdBQUcsQ0FBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFO1FBQ25HLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBRTtRQUU3RixJQUFJLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7UUFFakUsSUFBSSxRQUFRLEdBQUcsQ0FBRSxJQUFJLENBQUMsSUFBSSxLQUFLLFNBQVMsQ0FBRSxLQUFLLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFO1FBQ3hFLElBQUssQ0FBQyxRQUFRO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQztRQUVuRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFrQjtRQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUU7UUFDakcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzFELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFFO0lBQzlGLENBQUM7SUFFTSxhQUFhLENBQUMsTUFBYztRQUNqQyxPQUFPLElBQUksQ0FBQyxhQUFhO0lBQzNCLENBQUM7SUFFRCxJQUFXLFlBQVk7UUFDckIsT0FBTyxJQUFJLENBQUMsTUFBTTtJQUNwQixDQUFDO0lBRUQsSUFBVyxhQUFhO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztJQUN0QyxDQUFDO0lBRUQsSUFBVyxVQUFVO1FBQ25CLE9BQU8sSUFBSSxDQUFDLElBQUk7SUFDbEIsQ0FBQztJQUVELElBQVcsYUFBYTtRQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLO0lBQ25CLENBQUM7SUFFRCxJQUFXLFVBQVU7UUFDbkIsT0FBTyxJQUFJLENBQUMsU0FBUztJQUN2QixDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFVBQVU7SUFDeEIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxJQUFJO0lBQ2xCLENBQUM7SUFFRCxJQUFXLE9BQU87UUFDaEIsT0FBTyxJQUFJLENBQUMsS0FBSztJQUNuQixDQUFDO0lBRUQsSUFBVyxVQUFVO1FBQ25CLE9BQU8sSUFBSSxDQUFDLFFBQVE7SUFDdEIsQ0FBQztJQUVELElBQVcsU0FBUztRQUNsQixPQUFPLElBQUksQ0FBQyxNQUFNO0lBQ3BCLENBQUM7SUFFTSxNQUFNLENBQVcsTUFBZSxFQUFFLEdBQWM7UUFDckQsSUFBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUc7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFXLENBQUMsR0FBRyxHQUFHO1NBQy9CO2FBQ0k7WUFDSCxNQUFNLEVBQUUsR0FBRyxHQUFtQjtZQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFFO1NBQ3JEO1FBQ0QsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVNLE1BQU0sQ0FBVSxNQUFnQjtRQUNyQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6QixZQUFZLENBQUMsSUFBSSxDQUFFLElBQUksRUFBRSxNQUFNLENBQUUsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVyxDQUFDO0lBQzVCLENBQUM7SUFFTSxTQUFTLENBQVksS0FBK0IsRUFBRSxHQUFlO1FBQzFFLElBQUksTUFBTSxHQUFHLGVBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEVBQWMsQ0FBQyxDQUFDO1lBQ2hCLElBQU0sS0FBK0IsRUFBRTtRQUV6QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUUsTUFBTSxFQUFFLEdBQUcsQ0FBRTtJQUNuQyxDQUFDO0lBRU0sY0FBYyxDQUFXLElBQWEsRUFBRSxHQUFhLEVBQUUsVUFBVSxHQUFHLEtBQUs7UUFDOUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDMUIsSUFBSyxDQUFDLFVBQVUsSUFBSSxDQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFVBQVUsQ0FBRTtnQkFBRyxPQUFNO1lBQ3BGLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQTlIRCxrQ0E4SEM7Ozs7Ozs7Ozs7Ozs7OztBQ3hNRCx5RUFBMkQ7QUFDM0QsdURBQXlDO0FBRXpDLE1BQU0sT0FBTyxHQUFHLG1CQUFPLENBQUMsMEJBQVUsQ0FBQyxDQUFDLEVBQUUsZUFBZSxFQUFFLEtBQUssRUFBRSxDQUFDO0FBQy9ELE1BQU0sVUFBVSxHQUFHLG1CQUFPLENBQUMsZ0NBQWEsQ0FBQztBQUU1QiwyQkFBbUIsR0FBRyxHQUFHO0FBRXRDLDhDQUE4QztBQUM5QyxJQUFZLE9BT1g7QUFQRCxXQUFZLE9BQU87SUFDakIseUNBQVU7SUFDVix5Q0FBVTtJQUNWLHlDQUFVO0lBQ1YseUNBQVU7SUFDVix5Q0FBVTtJQUNWLHVDQUFVO0FBQ1osQ0FBQyxFQVBXLE9BQU8sR0FBUCxlQUFPLEtBQVAsZUFBTyxRQU9sQjtBQTRERDtJQUVVLFlBQVksQ0FBQyxTQUFpQjtRQUNwQyxPQUFPLFVBQVUsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRztJQUM5QyxDQUFDO0lBRU8sc0JBQXNCLENBQUUsTUFBbUIsRUFBRSxHQUFjO1FBQ2pFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBRyxFQUFFLEVBQUcsR0FBRyxDQUFFO0lBQ25DLENBQUM7SUFFTSxXQUFXLENBQUUsTUFBbUI7UUFDckMsSUFBSSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQVU7UUFDOUIsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsRUFBRSxpQkFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwRixtQ0FBbUM7UUFDbkMsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBRTFCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNyRCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7Z0JBQ3RCLElBQUksRUFBRSxPQUFPO2dCQUNiLEtBQUssRUFBRSxTQUFTO2dCQUNoQixJQUFJLEVBQUUsU0FBUyxHQUFHLEdBQUcsR0FBRyxLQUFLO2dCQUM3QixPQUFPLEVBQUUsS0FBSzthQUNmLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDWCxDQUFDLENBQUM7UUFFRixPQUFPLElBQUk7SUFDYixDQUFDO0lBRU0sV0FBVyxDQUFDLE1BQW1CLEVBQUUsV0FBd0I7UUFDOUQsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNqQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFDdEMsSUFBSSxFQUFFLFFBQVE7WUFDZCxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxXQUFXO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXLENBQUMsTUFBbUIsRUFBRSxHQUFjO1FBQ3BELElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDakMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3JDLElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztZQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7U0FDcEQsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVNLFdBQVcsQ0FBQyxNQUFtQixFQUFFLEdBQWMsRUFBRSxXQUF3QixFQUFFLE9BQWU7UUFDL0YsdURBQXVEO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUVyRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztRQUN4RCxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsT0FBTztRQUVoQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO1FBQ2pDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUNyQyxJQUFJLEVBQUUsUUFBUTtZQUNkLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFNBQVMsRUFBRSxTQUFTO1NBQ3JCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXLENBQUMsTUFBbUIsRUFBRSxjQUEwQyxFQUFFLEtBQXFCLEVBQ3ZHLFdBQTZCLEVBQUUsSUFBZ0IsRUFBRSxJQUFrQjtRQUVuRSxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFFckQsSUFBSSxZQUF5QjtRQUM3QixJQUFLLENBQUMsY0FBTyxDQUFFLGNBQWMsQ0FBRSxFQUFHO1lBQ2hDLElBQUksTUFBTSxHQUFHLGNBQTRCO1lBQ3pDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEVBQUUsTUFBTSxDQUFFO1NBQzdFO2FBQ0k7WUFDSCxJQUFJLE1BQU0sR0FBRyxjQUFjLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFFO1lBQ2hHLElBQUksRUFBRSxHQUFvQixlQUFRLENBQUUsV0FBVyxDQUFFLENBQUMsQ0FBQyxDQUFFLEVBQUUsS0FBSyxFQUFHLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLElBQUksRUFBRztZQUNqRyxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRTtZQUN0QixLQUFNLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUk7Z0JBQ3pDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFFO2FBQ3hGO1lBRUQsWUFBWSxHQUFHO2dCQUNiLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxTQUFTO2dCQUNoQixNQUFNLEVBQUUsTUFBTTtnQkFDZCxTQUFTLEVBQUUsS0FBSztnQkFDaEIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLO2dCQUNmLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTtnQkFDakIsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsSUFBSSxFQUFFLElBQUk7YUFDWDtTQUNGO1FBQ0QsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNqQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdkQsQ0FBQztDQUNGO0FBakdELHdDQWlHQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM5S0QsbUdBQStDO0FBQy9DLDBGQUFtRjtBQUluRjtJQUdFLFlBQVksVUFBd0I7UUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVO0lBQzlCLENBQUM7SUFFWSxNQUFNOztZQUNqQixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUMxQyxDQUFDO0tBQUE7SUFFWSxRQUFROztZQUNuQixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUM1QyxDQUFDO0tBQUE7Q0FDRjtBQUVEO0lBSUUsWUFBYSxPQUEyQjtRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU87UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLDZCQUFhLEVBQUU7SUFDbkMsQ0FBQztJQUVELElBQVcsaUJBQWlCO1FBQzFCLE9BQU8sSUFBSSxDQUFDLE9BQU87SUFDckIsQ0FBQztJQUVELElBQVcsV0FBVztRQUNwQixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVztJQUNoQyxDQUFDO0lBRVksT0FBTzs7WUFDbEIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBRTtRQUNyRCxDQUFDO0tBQUE7SUFFWSxVQUFVOztZQUNyQixPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7UUFDdEMsQ0FBQztLQUFBO0lBRVksS0FBSyxDQUFDLEdBQVcsRUFBRSxVQUEwQjs7WUFDeEQsT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUM7UUFDckQsQ0FBQztLQUFBO0lBRU0sU0FBUyxDQUFDLEdBQVcsRUFBRSxVQUEwQjtRQUN0RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUM7SUFDM0MsQ0FBQztJQUVPLHFCQUFxQixDQUFFLE1BQXdCO1FBQ3JELElBQUssTUFBTSxDQUFDLFlBQVksS0FBSyxDQUFDO1lBQUcsTUFBTSxJQUFJLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztJQUN2RSxDQUFDO0lBRU0sZ0JBQWdCLENBQUUsSUFBOEI7UUFDckQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBRSxJQUFJLElBQUksRUFBRSxFQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQztJQUMzRSxDQUFDO0lBRVksWUFBWSxDQUFFLElBQThCOztZQUN2RCxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBRSxJQUFJLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBRTtRQUN0RixDQUFDO0tBQUE7SUFFTSxXQUFXLENBQUMsR0FBVyxFQUFFLFVBQTBCLEVBQUUsc0JBQStCLEtBQUs7UUFDOUYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztRQUNuRCxtQkFBbUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUUsTUFBTSxDQUFFO1FBRTNELE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFWSxPQUFPLENBQUMsR0FBVyxFQUFFLFVBQTBCLEVBQUUsc0JBQStCLEtBQUs7O1lBQ2hHLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBRTtZQUMvRCxtQkFBbUIsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUUsTUFBTSxDQUFFO1lBRTNELE9BQU8sTUFBTTtRQUNmLENBQUM7S0FBQTtJQUVZLFNBQVMsQ0FBQyxHQUFXOztZQUNoQyxHQUFHLENBQUMsS0FBSyxDQUFFLGdDQUFtQixDQUFFLENBQUMsT0FBTyxDQUN0QyxDQUFNLEdBQUcsSUFBRSxnREFBQyxjQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsS0FDdEU7UUFDSCxDQUFDO0tBQUE7SUFFWSxVQUFVOztZQUNyQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7WUFDeEMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQztRQUNwQyxDQUFDO0tBQUE7Q0FDRjtBQXJFRCw0Q0FxRUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUZELHVEQUFnQztBQUdoQyxnRUFBMkM7QUFHM0MsNkVBQTBDO0FBRTFDO0lBSUU7UUFDRSxJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7SUFDckQsQ0FBQztJQUVNLElBQUksQ0FBQyxVQUFrQixFQUFFLFFBQTRCO1FBQzFELElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsSUFBSSxFQUFFO1FBQ3ZDLElBQUk7WUFDRixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSx1QkFBdUIsVUFBVSxJQUFJLENBQUU7U0FDakY7UUFDRCxPQUFNLEdBQUcsRUFBRTtZQUNULEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFHLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxxQkFBcUIsVUFBVSxJQUFJLEVBQUUsR0FBRyxDQUFFO1lBQ2xGLElBQUssQ0FBQyxRQUFRO2dCQUFHLE1BQU0sR0FBRztTQUMzQjtRQUVELFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLE1BQU07SUFDbkIsQ0FBQztJQUVELElBQVcsV0FBVyxLQUFlLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQztJQUU3QyxRQUFRLENBQUMsVUFBa0I7O1lBQ3RDLE9BQU8sZ0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUM7UUFDcEQsQ0FBQztLQUFBO0lBRU0sS0FBSyxDQUFDLFFBQTRCO1FBQ3ZDLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsSUFBSSxFQUFFO1FBQ3ZDLElBQUk7WUFDRixJQUFLLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRztnQkFDakMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUUsZUFBZSxDQUFFO2FBQzNEO2lCQUNJO2dCQUNILElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2FBQ3hEO1NBQ0Y7UUFDRCxPQUFNLEdBQUcsRUFBRTtZQUNULEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFHLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBRSxhQUFhLEVBQUUsR0FBRyxDQUFFO1lBQzVELElBQUssQ0FBQyxRQUFRO2dCQUFHLE1BQU0sR0FBRztTQUMzQjtRQUVELFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLE1BQU07SUFDbkIsQ0FBQztJQUVNLFNBQVM7UUFDZCxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDekMsQ0FBQztJQUVNLE9BQU8sQ0FBQyxHQUFXLEVBQUUsVUFBMEIsRUFBRSxRQUFxQztRQUMzRixJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRyxJQUFJLEVBQUUsTUFBTSxFQUFHLEVBQUUsZUFBZSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDNUUsSUFBSTtZQUNGLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDO1lBQzVELEdBQUcsQ0FBQyxNQUFNLEdBQUc7Z0JBQ1gsZUFBZSxFQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFO2dCQUN0RCxZQUFZLEVBQUUsU0FBUyxDQUFDLE9BQU87YUFDaEM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsR0FBRyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JKO1FBQ0QsT0FBTSxHQUFHLEVBQUU7WUFDVCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUc7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUU7WUFDaEgsSUFBSyxDQUFDLFFBQVE7Z0JBQUcsTUFBTSxHQUFHO1NBQzNCO1FBRUQsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDekMsT0FBTyxHQUFHLENBQUMsTUFBTTtJQUNuQixDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQVksRUFBRSxVQUEwQixFQUFFLFFBQStCO1FBQ3BGLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxFQUFHLElBQUksRUFBRSxNQUFNLEVBQUcsSUFBSSxLQUFLLEVBQU8sRUFBRTtRQUNuRCxJQUFJO1lBQ0YsR0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztZQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsR0FBRyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLG9CQUFvQixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pKO1FBQ0QsT0FBTSxHQUFHLEVBQUU7WUFDVCxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUc7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsR0FBRyxZQUFZLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUU7WUFDOUcsSUFBSyxDQUFDLFFBQVE7Z0JBQUcsTUFBTSxHQUFHO1NBQzNCO1FBRUQsUUFBUSxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDekMsT0FBTyxHQUFHLENBQUMsTUFBTTtJQUNuQixDQUFDO0lBRU0sWUFBWSxDQUFFLElBQThCLEVBQUUsVUFBb0UsRUFBRSxRQUE0QztRQUNySyxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsRUFBRyxJQUFJLEVBQUUsTUFBTSxFQUFHLElBQUksS0FBSyxFQUFvQixFQUFFO1FBQ2hFLElBQUksR0FBa0M7UUFDdEMsSUFBSTtZQUNGLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hCLEdBQUcsR0FBRyxDQUFDO2dCQUNQLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFFO2dCQUNuRCxVQUFVLElBQUksVUFBVSxDQUFFLE9BQU8sRUFBRSxDQUFDLENBQUU7Z0JBQ3RDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFFLE9BQU8sQ0FBRTtZQUM1QixDQUFDLENBQUM7U0FDSDtRQUNELE9BQU8sR0FBRyxFQUFHO1lBQ1gsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHO1lBQ2IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEdBQUksQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUU7WUFDbEksSUFBSyxDQUFDLFFBQVE7Z0JBQUcsTUFBTSxHQUFHO1NBQzNCO1FBRUQsUUFBUSxJQUFJLFFBQVEsQ0FBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsTUFBTTtJQUNuQixDQUFDO0lBRVksV0FBVyxDQUFDLEdBQUcsRUFBRSxVQUEwQjs7WUFDdEQsT0FBTyxnQkFBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUM7UUFDNUQsQ0FBQztLQUFBO0lBRVksU0FBUyxDQUFDLEdBQVksRUFBRSxVQUEwQjs7WUFDN0QsT0FBTyxnQkFBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUM7UUFDMUQsQ0FBQztLQUFBO0lBRU0saUJBQWlCLENBQUUsSUFBOEIsRUFBRSxVQUFvRTtRQUM1SCxPQUFPLGdCQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBRTtJQUNwRSxDQUFDO0NBRUY7QUE1SEQsc0NBNEhDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BJRCw2REFBcUM7QUFDckMsdURBQStCO0FBQy9CLHdFQUEwRjtBQUMxRixvRkFBeUM7QUFDekMsaUZBQXVDO0FBRXZDLGtIQUEyRDtBQUMzRCxxRUFBb0Y7QUFFcEYsK0RBQTBDO0FBQzFDLGlIQUF3RDtBQUl4RCxvRkFBeUM7QUFrQ3pDOzs7O0dBSUc7QUFDSCxhQUFxQixTQUFRLHFCQUFZO0lBY3ZDOzs7Ozs7T0FNRztJQUNILFlBQW9CLE1BQWMsRUFBRSxhQUFxQixFQUFFLE9BQXlCO1FBQ2xGLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVELHFCQUFHLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLG1CQUFtQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTFFLEtBQUssRUFBRTtRQUNQLElBQUksQ0FBQyxPQUFPLEdBQUk7WUFDZCxnQkFBZ0IsRUFBRyxFQUFFO1lBQ3JCLGtCQUFrQixFQUFHLEVBQUU7WUFDdkIseUJBQXlCLEVBQUcsS0FBSztZQUNqQyxrQkFBa0IsRUFBRyxFQUFFLE9BQU8sRUFBRyxJQUFJLEVBQUU7U0FDeEMsSUFBSSxPQUFPO1FBRVosSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsRUFBVTtRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxLQUFLLEVBQThCO1FBQy9ELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLEtBQUssRUFBZ0M7UUFDbkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBdUI7UUFDN0MsSUFBSSxDQUFDLEdBQUcsR0FBRyxnQkFBVSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzdDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSx1QkFBVSxDQUFDLGFBQWEsQ0FBQztRQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksdUJBQVUsQ0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFpQixDQUFFO1FBQ3BFLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsQ0FBQztRQUMzRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDO1FBQzVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxxQkFBUyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLENBQUM7SUFDOUYsQ0FBQztJQUVPLFNBQVMsQ0FBVyxLQUFnQyxFQUFHLGdCQUFnQixHQUFHLEtBQUssRUFBRSxlQUFlLEdBQUcsS0FBSztRQUM5RyxNQUFNLFNBQVMsR0FBRyxlQUFRLENBQUUsS0FBSyxDQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUcsS0FBK0IsQ0FBQyxJQUFJO1FBRTVGLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUN4QyxnQkFBZ0IsSUFBSSxxQkFBRyxDQUFDLE1BQU0sQ0FBRSxNQUFNLEtBQUssU0FBUyxFQUFFLHVCQUF3QixTQUFVLEdBQUcsQ0FBQztRQUM1RixlQUFlLElBQUkscUJBQUcsQ0FBQyxNQUFNLENBQUUsQ0FBQyxNQUFPLENBQUMsVUFBVSxFQUFFLFVBQVcsU0FBVSxlQUFlLENBQUM7UUFFekYsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVPLFVBQVUsQ0FBVyxNQUFvQjtRQUMvQyxPQUFPLE1BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZO0lBQ2hFLENBQUM7SUFFTyxjQUFjLENBQUUsS0FBWTtRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxLQUFLLENBQUUsQ0FBRTtJQUN6RCxDQUFDO0lBRU8sZUFBZSxDQUFFLEtBQVk7UUFDbkMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFTyxnQkFBZ0IsQ0FBRSxJQUFhLEVBQUUsRUFBVztRQUNsRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBRSxJQUFJLEVBQUUsRUFBRSxDQUFFLENBQUU7SUFDOUQsQ0FBQztJQUVPLGlCQUFpQixDQUFFLElBQWEsRUFBRSxFQUFXO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFFO0lBQzNDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ksdUJBQXVCLENBQUUsSUFBWSxFQUFFLFFBQXlCO1FBQ3JFLHFCQUFHLENBQUMsUUFBUSxDQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RCxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxTQUFTLEVBQ3pGLGVBQWUsSUFBSSxpQkFBaUIsQ0FBQztRQUV2QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRyxRQUFRLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0kseUJBQXlCLENBQUUsSUFBWTtRQUM1QyxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUU7UUFDNUUsSUFBSyxLQUFLLElBQUksQ0FBQztZQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUUsS0FBSyxDQUFFO0lBQ3hELENBQUM7SUFFRDs7OztPQUlHO0lBQ0kseUJBQXlCLENBQUUsSUFBWSxFQUFFLFFBQTJCO1FBQ3pFLHFCQUFHLENBQUMsUUFBUSxDQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0RCxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMxRCxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUUsR0FBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxTQUFTLEVBQzNGLGVBQWUsSUFBSSxpQkFBaUIsQ0FBQztRQUV2QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUN4RCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ksMkJBQTJCLENBQUUsSUFBWTtRQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUU7UUFDOUUsSUFBSyxLQUFLLElBQUksQ0FBQztZQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUUsS0FBSyxDQUFFO0lBQzFELENBQUM7SUFHRDs7O09BR0c7SUFDVSxJQUFJLENBQUMsT0FBNEI7O1lBQzVDLHFCQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUVsRCxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFFekIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUc7Z0JBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFFO2dCQUM1QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFFLE1BQU0sQ0FBRTtnQkFFdkMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO2dCQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsTUFBTSxDQUFDLFNBQVMsR0FBRyxDQUFDO2dCQUVqRixJQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUc7b0JBQ3RCLElBQUksS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDLE9BQU8sQ0FBRSxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO29CQUN0RSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLE1BQU0sQ0FBQyxTQUFTLFdBQVcsS0FBSyxDQUFDLE1BQU0sWUFBWSxDQUFDO2lCQUNwRzthQUNGO1lBQUEsQ0FBQztZQUVGLElBQUksQ0FBQyxJQUFJLENBQUUsT0FBTyxFQUFFLElBQUksQ0FBRTtRQUM1QixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNVLEtBQUs7O1lBQ2hCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUU7WUFDL0IsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRTtZQUMvQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBRTFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBRTtRQUM1QixDQUFDO0tBQUE7SUFFRDs7T0FFRztJQUNILElBQVcsZUFBZTtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZTtJQUNyQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFXLFdBQVc7UUFDcEIsT0FBTyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsSUFBVyxTQUFTO1FBQ2xCLGlDQUFpQztRQUNqQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxlQUFlLENBQUU7SUFDdEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxrQkFBa0IsQ0FBRSxRQUFnQixFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQzNELElBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUUsRUFBRztZQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBRSxRQUFRLENBQUU7WUFDOUIsT0FBTyxJQUFJO1NBQ1o7UUFFRCxJQUFLLENBQUMsUUFBUTtZQUFHLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxRQUFRLGlCQUFpQixDQUFDO1FBQzlELE9BQU8sS0FBSztJQUNkLENBQUM7SUFFRDs7O09BR0c7SUFDSSxVQUFVLENBQUUsS0FBWTtRQUM3QixnQ0FBZ0M7UUFDaEMscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxFQUFFLHdCQUF3QixLQUFLLENBQUMsTUFBTSxZQUFZLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV4SSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzdFLElBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSztJQUMzQixDQUFDO0lBRUQ7O09BRUc7SUFDVSxXQUFXOztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQztZQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNqRyxXQUFXO1lBQ1gsSUFBSSxDQUFDLGNBQWMsQ0FBRSxJQUFJLENBQUMsWUFBWSxDQUFFO1lBRXhDLElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUU7WUFDeEQsT0FBTyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxDQUFDO1lBRW5ELE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUU7WUFDN0UsSUFBSTtnQkFDRixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFFO2dCQUMvRCxJQUFJLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQW1CLENBQUU7Z0JBQ25HLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxZQUFZLENBQUU7Z0JBQzFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSTtnQkFDeEIsYUFBYTtnQkFDYixJQUFJLENBQUMsZUFBZSxDQUFFLElBQUksQ0FBQyxTQUFVLENBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzdGLE9BQU8sSUFBSSxDQUFDLGVBQWU7YUFDNUI7WUFDRCxPQUFPLEdBQUcsRUFBRztnQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsSUFBSSxDQUFDLFlBQWEsQ0FBQyxNQUFNLElBQUksRUFBRSxHQUFHLENBQUM7Z0JBQzFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQzVELE1BQU0sR0FBRzthQUNWO1FBQ0gsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1UsYUFBYSxDQUFFLE1BQWU7O1lBQ3pDLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksSUFBSSxDQUFDLGVBQWUsRUFDOUQsNkNBQTZDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUV0RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWU7WUFDdkYsTUFBTSxRQUFRLEdBQUcsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsTUFBTTtZQUNyRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsVUFBVSxPQUFPLFFBQVEsSUFBSSxDQUFDO1lBQ3hHLFdBQVc7WUFDWCxJQUFJLENBQUMsZ0JBQWdCLENBQUUsVUFBVSxFQUFHLFFBQVEsQ0FBRTtZQUU5QyxJQUFJO2dCQUNGLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDO2dCQUM3QyxJQUFLLFVBQVUsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFHLEVBQUUsMEVBQTBFO29CQUN0RyxJQUFJLE9BQU8sR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUUsVUFBVSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUU7b0JBQ3pFLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFFLE9BQU8sQ0FBRTtpQkFDM0M7Z0JBQ0QsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBRSxRQUFRLENBQUU7Z0JBQ25ELE9BQU8sSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLEVBQUc7b0JBQ3ZDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBRTtvQkFDMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFFO2lCQUNyRTtnQkFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUk7Z0JBQ3hCLGFBQWE7Z0JBQ2IsSUFBSSxDQUFDLGlCQUFpQixDQUFFLFVBQVUsRUFBRyxRQUFRLENBQUU7Z0JBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG9DQUFvQyxVQUFVLE9BQU8sUUFBUSxJQUFJLENBQUM7YUFDekc7WUFDRCxPQUFPLEdBQUcsRUFBRztnQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsVUFBVSxPQUFPLFFBQVEsSUFBSSxFQUFFLEdBQUcsQ0FBQztnQkFDNUcsTUFBTSxHQUFHO2FBQ1Y7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDVSxnQkFBZ0I7O1lBQzNCLElBQUksTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUU7WUFDbEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBRSxNQUFNLENBQUU7WUFDOUMsT0FBTyxNQUFNO1FBQ2YsQ0FBQztLQUFBO0lBRUQ7OztPQUdHO0lBQ1Usb0JBQW9CLENBQUMsTUFBYzs7WUFDOUMscUJBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxDQUFDLEVBQUUsNkJBQTZCLENBQUM7WUFFakUsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7WUFDL0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUM7UUFDOUMsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNJLFlBQVksQ0FBVyxLQUErQixFQUFFLE1BQWU7UUFDNUUscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBRTtRQUVsRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUU7UUFDM0MsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFFLE1BQU0sQ0FBRTtJQUNoQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQVcsS0FBK0IsRUFBRSxHQUFjO1FBQ3JFLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMvQyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUU7UUFFNUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFHLElBQUksQ0FBRTtRQUNqRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFFLE1BQU0sRUFBRSxHQUFHLENBQUU7SUFDdEQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLE1BQU0sQ0FBVyxLQUFnQyxFQUFFLFdBQWdDO1FBQ3hGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFMUQsSUFBSSxHQUFlO1FBQ25CLElBQUksTUFBK0I7UUFDbkMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFHLElBQUksQ0FBRTtRQUVqRCxJQUFLLHVCQUFjLENBQUUsV0FBVyxDQUFFLElBQUksc0JBQWMsQ0FBRSxXQUFXLENBQUUsRUFBRztZQUNwRSxHQUFHLEdBQUcsV0FBd0I7U0FDL0I7YUFDSTtZQUNILE1BQU0sR0FBRyxXQUFzQjtZQUMvQixHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7U0FDNUI7UUFFRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDO0lBQzNELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsdUZBQXVGO0lBQ3ZGLG9EQUFvRDtJQUNwRCxnR0FBZ0c7SUFFaEcscURBQXFEO0lBQ3JELDRDQUE0QztJQUM1QyxJQUFJO0lBRUo7Ozs7T0FJRztJQUNJLE1BQU0sQ0FBVyxLQUFnQyxFQUFFLE1BQWU7UUFDdkUscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUkseUJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsMEJBQTBCLENBQUU7UUFFNUYsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBRTtRQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDekMsQ0FBQztJQUVEOzs7O09BSUc7SUFDVSxHQUFHLENBQVcsS0FBZ0MsRUFBRSxHQUFjOztZQUN6RSxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMscUJBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRTFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUN4RCxDQUFDO0tBQUE7SUFFRDs7OztPQUlHO0lBQ1UsS0FBSyxDQUFXLEtBQWdDLEVBQUUsU0FBdUI7O1lBQ3BGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5QyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdEQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLElBQUksS0FBSyxHQUFHLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQztZQUNwRSxJQUFLLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsTUFBTyxDQUFDLFNBQVMsb0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQztZQUV4SCxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztLQUFBO0lBRUM7Ozs7O0tBS0M7SUFDVSxPQUFPLENBQVcsS0FBZ0MsRUFBRSxTQUF1QixFQUFFLEtBQUssR0FBRyxLQUFLOztZQUNyRyxxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQztRQUN4RSxDQUFDO0tBQUE7SUFFRDs7Ozs7O09BTUc7SUFDSSxTQUFTLENBQVcsS0FBZ0MsRUFBRSxHQUFjLEVBQUcsS0FBSyxHQUFHLEtBQUs7UUFDekYscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLHFCQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUUxQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7UUFDMUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQztJQUMvRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLFlBQVksQ0FBVyxLQUFnQyxFQUFFLE1BQWlDLEVBQUcsS0FBSyxHQUFHLEtBQUs7UUFDL0cscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTlDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtRQUMxQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsWUFBWSxDQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFFO0lBQ3RFLENBQUM7SUFHRDs7Ozs7Ozs7O09BU0c7SUFDVSxJQUFJLENBQVcsS0FBZ0MsRUFBRSxTQUF3QixFQUFFLFdBQTZCLEVBQ25ILElBQWdCLEVBQUUsTUFBdUIsRUFBRSxJQUFrQjs7WUFDN0QscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUM7UUFDaEcsQ0FBQztLQUFBO0lBR0Q7Ozs7T0FJRztJQUNVLE9BQU8sQ0FBVyxLQUFnQyxFQUFFLE1BQW1COztZQUNsRixJQUFJLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRTtZQUMvQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7WUFDMUMsSUFBSyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7Z0JBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsa0NBQWtDLE1BQU8sQ0FBQyxTQUFTLGlCQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFbEgsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2xELENBQUM7S0FBQTtJQUVDOzs7O0tBSUM7SUFDVSxPQUFPLENBQVcsS0FBZ0MsRUFBRSxNQUFtQjs7WUFDbEYscUJBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEdBQUUsRUFBRSxDQUFDLHFCQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTlDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUUsS0FBSyxFQUFFLElBQUksQ0FBRTtZQUMxQyxPQUFPLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFPLENBQUMsQ0FBQyxXQUFXLENBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBRTtRQUNwRSxDQUFDO0tBQUE7SUFHRDs7OztPQUlHO0lBQ1UsTUFBTSxDQUFVLEtBQStCLEVBQUUsU0FBd0I7O1lBQ3BGLHFCQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUU5QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFFLEtBQUssRUFBRSxJQUFJLENBQUU7WUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUM7UUFDaEUsQ0FBQztLQUFBO0lBRUQ7Ozs7T0FJRztJQUNVLEtBQUssQ0FBVSxLQUErQixFQUFFLFNBQXdCOztZQUNuRixxQkFBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRSxFQUFFLENBQUMscUJBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBRSxLQUFLLEVBQUUsSUFBSSxDQUFFO1lBQzFDLE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDO1FBQy9ELENBQUM7S0FBQTtJQUVlLGtCQUFrQixDQUFFLE1BQTJCLEVBQUcsZUFBa0Q7O1lBQ2xILElBQUksVUFBVSxHQUFHLElBQUksR0FBRyxFQUE4QjtZQUN0RCxJQUFJLFlBQVksR0FBRyxNQUFNLGVBQWUsRUFBRTtZQUUxQyxZQUFZLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQyxFQUFFO2dCQUN4QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsT0FBTyxDQUFFO29CQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssRUFBZSxDQUFFO2dCQUN2RixVQUFVLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxPQUFPLENBQUcsQ0FBQyxJQUFJLENBQUUsQ0FBQyxDQUFFO1lBQ3hDLENBQUMsQ0FBRTtZQUVILE1BQU0sQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRyxDQUFDLENBQUU7WUFDaEUsT0FBTyxNQUFzQjtRQUMvQixDQUFDO0tBQUE7SUFFTyxlQUFlLENBQUUsYUFBMkMsRUFBRSxnQkFBMEI7UUFDOUYsSUFBSSxXQUFXLEdBQUcsYUFBYSxFQUFFO1FBQ2pDLElBQUssV0FBVyxLQUFLLFNBQVM7WUFBRyxPQUFPLFNBQVM7UUFFakQsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDO1FBQzNDLElBQUssQ0FBQyxnQkFBZ0IsRUFBRztZQUN2QixPQUFPLENBQUMsY0FBYyxDQUFFLE1BQU0sRUFBRSxjQUFjLENBQUM7U0FDaEQ7UUFDRCxPQUFPLE1BQU07SUFDZixDQUFDO0lBRUQ7OztPQUdHO0lBQ1UsZ0JBQWdCLENBQUUsTUFBZSxFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQ3RFLHFCQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLElBQUksQ0FBQyxFQUFHLGlDQUFpQyxDQUFDO1lBRXZFLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLENBQUU7WUFDL0YsSUFBSyxXQUFXO2dCQUFHLE9BQU8sV0FBVztZQUVyQyxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFFLE1BQU0sQ0FBRTtZQUN2RCxJQUFLLENBQUMsZ0JBQWdCLElBQUksV0FBVyxLQUFLLFNBQVM7Z0JBQUksT0FBTyxXQUFXO1lBRXpFLE9BQU8sTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUUsQ0FBQyxXQUFZLENBQUMsRUFBRyxHQUFTLEVBQUUsZ0RBQ2hFLGFBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQWMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFHLFdBQVksQ0FBQyxFQUFHLEVBQUUsQ0FBQyxLQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLFlBQVksQ0FBRSxPQUFnQixFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQ25FLHFCQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFFLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlELElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsZ0JBQWdCLENBQUU7WUFDcEcsSUFBSyxXQUFXO2dCQUFHLE9BQU8sV0FBVztZQUVyQyxJQUFJLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFFLE9BQU8sQ0FBRTtZQUM1RCxJQUFLLENBQUMsZ0JBQWdCLElBQUksV0FBVyxLQUFLLFNBQVM7Z0JBQUksT0FBTyxXQUFXO1lBRXpFLE9BQU8sTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUUsQ0FBQyxXQUFZLENBQUMsRUFBRyxHQUFTLEVBQUUsZ0RBQ2hFLGFBQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQWMsYUFBYSxFQUFFLEVBQUUsT0FBTyxFQUFHLFdBQVksQ0FBQyxFQUFHLEVBQUUsQ0FBQyxLQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2xHLENBQUM7S0FBQTtJQUVEOzs7O09BSUc7SUFDVSxzQkFBc0IsQ0FBRSxTQUFrQixFQUFFLFNBQWtCLEVBQUUsZ0JBQWdCLEdBQUcsS0FBSzs7WUFDbkcscUJBQUcsQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxJQUFJLENBQUMsSUFBSSxTQUFTLElBQUksU0FBUyxFQUFFLG1DQUFtQyxDQUFDO1lBRW5ILGlDQUFpQztZQUNqQyxJQUFJLFlBQVksR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLENBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBRTtZQUNwRixJQUFLLENBQUMsZ0JBQWdCO2dCQUFHLE9BQU8sWUFBNEI7WUFFNUQsT0FBTyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBRSxZQUFZLEVBQUcsR0FBUyxFQUFFLGdEQUM5RCxhQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFjLGFBQWEsRUFBRSxFQUFFLE9BQU8sRUFBRyxFQUFFLEdBQUcsRUFBRyxZQUFZLENBQUMsR0FBRyxDQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUcsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxLQUFFO1FBQ3ZILENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNVLGNBQWMsQ0FBRSxRQUF3QixFQUFFLGdCQUFnQixHQUFHLEtBQUs7O1lBQzdFLHFCQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxxQkFBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBRTtZQUV0RCxpQ0FBaUM7WUFDakMsSUFBSSxZQUFZLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUM7WUFDOUQsSUFBSyxDQUFDLGdCQUFnQjtnQkFBRyxPQUFPLFlBQTRCO1lBRTVELE9BQU8sTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUUsWUFBWSxFQUFHLEdBQVMsRUFBRSxnREFDOUQsYUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBYyxhQUFhLEVBQUUsRUFBRSxPQUFPLEVBQUcsRUFBRSxHQUFHLEVBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFHLENBQUUsRUFBRSxFQUFFLENBQUMsS0FBRTtRQUN2SCxDQUFDO0tBQUE7Q0FDRjtBQWptQkQsMEJBaW1CQzs7Ozs7Ozs7Ozs7Ozs7O0FDbHBCRDs7Ozs7Ozs7OztHQVVHO0FBRUgsSUFBWSxXQU9YO0FBUEQsV0FBWSxXQUFXO0lBQ3JCLHdEQUFlO0lBQ2YseURBQWM7SUFFZCwyQ0FBYztJQUNkLHFEQUFjO0lBQ2QsbURBQWM7QUFDaEIsQ0FBQyxFQVBXLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBT3RCO0FBRUQsSUFBWSxnQkFJWDtBQUpELFdBQVksZ0JBQWdCO0lBQzFCLHFEQUFhO0lBQ2IsMkRBQWE7SUFDYiwyREFBYTtBQUNmLENBQUMsRUFKVyxnQkFBZ0IsR0FBaEIsd0JBQWdCLEtBQWhCLHdCQUFnQixRQUkzQjtBQTRCRDtJQUdFLFlBQVksT0FBc0I7UUFDaEMsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQWM7UUFDckMsT0FBTyxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO0lBQ2xGLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQWM7UUFDcEMsT0FBTyxXQUFXLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztJQUN2QyxDQUFDO0lBRU0sTUFBTSxDQUFDLGdCQUFnQixDQUFVLE1BQWM7UUFDcEQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQztRQUU3RSxPQUFPLE1BQTBCO0lBQ25DLENBQUM7SUFFTSxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQXdCO1FBQ2xELElBQUksTUFBTSxHQUFHLEVBQUU7UUFDZixLQUFLLElBQUksQ0FBQyxJQUFJLE9BQU8sRUFBRztZQUN0QixJQUFLLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDOUQ7UUFDRCxPQUFPLE1BQU07SUFDZixDQUFDO0lBRU0sTUFBTSxDQUFDLGdCQUFnQixDQUFDLFlBQXFCO1FBQ2xELE9BQU8sQ0FBRSxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBRTtZQUNqQyxDQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUU7WUFDdEUsQ0FBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUU7SUFDcEMsQ0FBQztJQUVTLHNCQUFzQixDQUFVLE1BQWUsRUFBRSxNQUFtQixFQUFFLEtBQWtCO1FBQ2hHLElBQUksTUFBTSxHQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDMUIsU0FBUyxFQUFRLENBQUM7WUFDbEIsWUFBWSxFQUFLLEtBQUs7WUFDdEIsU0FBUyxFQUFRLEtBQUs7WUFDdEIsVUFBVSxFQUFPLE1BQU07WUFDdkIsV0FBVyxFQUFNLElBQUksQ0FBQyxPQUFPO1lBQzdCLFlBQVksRUFBSyxJQUFJO1lBQ3JCLGNBQWMsRUFBRyxJQUFJO1NBQ3RCLEVBQUUsTUFBTSxDQUFDO1FBRVYsTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLENBQUM7UUFDeEMsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVTLGFBQWEsQ0FBQyxNQUFjLEVBQUUsWUFBeUIsRUFBRSxLQUFVLEVBQUUsUUFBYTtRQUMxRixNQUFNLEdBQUcsR0FBRyxNQUF5QjtRQUNyQyxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFO1FBRXBDLElBQUssQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFLLEtBQUssS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUc7WUFDakcsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUs7WUFDNUIsT0FBTyxJQUFJO1NBQ1o7UUFFRCxJQUFLLEdBQUcsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsU0FBUyxLQUFLLFdBQVcsQ0FBQyxTQUFTLEVBQUc7WUFDdEYsTUFBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztTQUN6RDtRQUVELElBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxVQUFVO1FBQzNCLElBQUssTUFBTSxDQUFDLFVBQVUsRUFBRztZQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxNQUFNLENBQUMsU0FBUyxHQUFHLENBQUM7U0FDdkU7UUFFRCxJQUFLLE1BQU0sQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRztZQUMzRSxNQUFNLElBQUksS0FBSyxDQUFDLHVDQUF1QyxDQUFDO1NBQ3pEO1FBRUQsSUFBSyxHQUFHLENBQUMsWUFBWSxFQUFHO1lBQ3BCLEdBQUcsQ0FBQyxXQUFvQyxDQUFDLE1BQU0sQ0FBRSxRQUF3QixDQUFFO1lBQzdFLEdBQUcsQ0FBQyxZQUFZLEdBQUcsS0FBSztTQUN6QjtRQUVELElBQUssR0FBRyxDQUFDLFNBQVMsS0FBSyxXQUFXLENBQUMsVUFBVSxFQUFHO1lBQzlDLEdBQUcsQ0FBQyxTQUFTLEVBQUc7WUFDaEIsR0FBRyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsUUFBUTtZQUNwQyxHQUFHLENBQUMsY0FBYyxHQUFHO2dCQUNuQixJQUFJLEVBQUcsZ0JBQWdCLENBQUMsTUFBTTtnQkFDOUIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO2dCQUN4QixpQkFBaUIsRUFBRyxJQUFJLEtBQUssQ0FBaUI7b0JBQzVDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsU0FBUztpQkFDdkUsQ0FBQzthQUNIO1NBQ0Y7UUFFRCxJQUFLLEdBQUcsQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLFFBQVEsRUFBRztZQUM1QyxHQUFHLENBQUMsY0FBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDaEc7UUFFRCxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSztRQUM1QixPQUFPLElBQUk7SUFDYixDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBRSxNQUFjO1FBQ25DLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTO1FBQzVELE9BQU8sQ0FBRSxDQUFFLEtBQUssS0FBSyxXQUFXLENBQUMsVUFBVSxJQUFJLEtBQUssS0FBSyxXQUFXLENBQUMsU0FBUyxDQUFFO0lBQ2pGLENBQUM7SUFFRjs7OztPQUlHO0lBQ0ksUUFBUSxDQUFXLE1BQWUsRUFBRSxNQUFtQjtRQUM1RCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRyxXQUFXLENBQUMsR0FBRyxDQUFFO1FBQzlFLE9BQU8sSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBcUI7SUFDOUUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxlQUFlLENBQVcsTUFBYyxFQUFFLE1BQW1CO1FBQ2xFLElBQUksUUFBUSxHQUFJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUU7UUFDcEYsT0FBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLEVBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFxQjtJQUM5RSxDQUFDO0NBQ0Y7QUF6SEQsa0NBeUhDOzs7Ozs7Ozs7Ozs7Ozs7QUNsTEQsZ0VBQTJDO0FBRTNDLHNFQUFxRDtBQUNyRCx5RUFBOEU7QUFDOUUsb0dBQWtIO0FBRWxILHVEQUEwQztBQTBDMUM7SUFTRSxZQUFtQixLQUFrQjtRQUNuQyxJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFVLENBQUMsU0FBUyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQztRQUMxRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUM7UUFDbEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLO1FBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQTJDO1FBQ2pFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLEdBQUcsRUFBNkI7UUFFL0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVTLGdCQUFnQixDQUFFLE1BQW1CLEVBQUUsTUFBYztRQUM3RCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDekUsSUFBSyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQztZQUM1QyxNQUFNLElBQUksS0FBSyxDQUFDLGdCQUFnQixNQUFNLENBQUMsU0FBUyxRQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUNoRyxDQUFDO0lBRVMsZUFBZSxDQUFDLE1BQW1CLEVBQUUsR0FBYztRQUMzRCxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFFLEVBQUUsQ0FBRTtJQUM3QixDQUFDO0lBRU0sZ0JBQWdCLENBQUUsV0FBeUI7UUFDaEQsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBRSxXQUFXLENBQUU7UUFDbEMsSUFBSSxHQUFHLEdBQUcsZUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxlQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLG9CQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDcEYsT0FBTyxFQUFFLEtBQUssRUFBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDbkMsQ0FBQztJQUVTLG1CQUFtQixDQUFFLGNBQXNCLEVBQUUsaUJBQWlCLEdBQUcsS0FBSztRQUM5RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksaUJBQWlCO1lBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxJQUFJLEdBQUcsRUFBOEIsQ0FBQztRQUV6RSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBRTtJQUMxQyxDQUFDO0lBRVMsY0FBYyxDQUFFLEVBQWdCO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFFUyxXQUFXLENBQVcsRUFBb0IsRUFBRSxPQUFzQixFQUFFLGNBQXNCO1FBQ2xHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSxhQUFhLENBQUUsT0FBOEM7UUFDbEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsc0NBQXNDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUM7UUFFbEgsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRTtZQUNwQyxJQUFJLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBOEI7WUFDdEQsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsT0FBUSxDQUFFLENBQUM7WUFDbEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBRTtRQUN4QyxDQUFDLENBQUM7UUFFRixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO1lBQ3hCLElBQUksVUFBVSxHQUFHLElBQUksS0FBSyxFQUFVO1lBQ3BDLE9BQU8sQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFFO1lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7U0FDOUU7SUFDSCxDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRTtJQUMzRCxDQUFDO0lBRU0sTUFBTSxDQUFFLEVBQWdCO1FBQzdCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7SUFDNUQsQ0FBQztJQUVNLGNBQWMsQ0FBRSxFQUFnQjtRQUNyQyxJQUFJLENBQUMseUJBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQUUsT0FBTyxTQUFTO1FBQzlDLFFBQU8sRUFBRSxDQUFDLFNBQVMsRUFBRTtZQUNuQixLQUFLLHlCQUFXLENBQUMsR0FBRztnQkFDbEIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO1lBQzlELEtBQUsseUJBQVcsQ0FBQyxPQUFPO2dCQUN0QixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUM7WUFDL0QsS0FBSyx5QkFBVyxDQUFDLFFBQVE7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLGNBQWU7WUFDM0I7Z0JBQ0MsT0FBTyxTQUFTO1NBQ2xCO0lBQ0gsQ0FBQztJQUVNLGVBQWUsQ0FBRSxjQUFzQjtRQUM1QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBbUM7UUFDM0QsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWM7UUFFcEMsT0FBUSxVQUFVLElBQUksY0FBYyxFQUFHO1lBQ3JDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7WUFDbEQsT0FBTyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQy9CLFVBQVUsRUFBRTtTQUNiO1FBRUQsT0FBTyxNQUFNO0lBQ2YsQ0FBQztJQUVELElBQVcsZ0JBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRTtJQUMxQyxDQUFDO0lBRU0sVUFBVSxDQUFDLE1BQW1CLEVBQUUsR0FBYztRQUNuRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUU7SUFDM0UsQ0FBQztJQUVNLGlCQUFpQixDQUFXLE1BQW1CLEVBQUUsR0FBYztRQUNwRSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7UUFDckQsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBcUIsQ0FBQyxDQUFDLENBQUMsU0FBUztJQUM5SCxDQUFDO0lBRU0sUUFBUSxDQUFVLE1BQW1CLEVBQUUsTUFBZTtRQUMzRCxJQUFJLENBQUMsZ0JBQWdCLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRTtRQUV2QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDO1FBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDbkUsT0FBTyxPQUE0QjtJQUNyQyxDQUFDO0lBRU0sV0FBVyxDQUFDLE1BQW1CLEVBQUUsTUFBZTtRQUNyRCxJQUFJLE9BQU8sR0FBRyx5QkFBVyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUNsRCxJQUFLLE9BQU8sQ0FBQyxTQUFTLEtBQUsseUJBQVcsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLFNBQVMsS0FBSyx5QkFBVyxDQUFDLFNBQVMsRUFBRztZQUMxRixPQUFPLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsU0FBUztTQUMxQzthQUNJLElBQUssT0FBTyxDQUFDLFNBQVMsS0FBSyx5QkFBVyxDQUFDLFFBQVEsRUFBRztZQUNyRCxPQUFPLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsT0FBTztZQUN2QywwQkFBMEI7WUFDMUIsT0FBTyxDQUFDLGNBQWMsR0FBRyxJQUFJO1NBQzlCO2FBQ0k7WUFDSCxPQUFPLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsT0FBTztTQUN4QztJQUNILENBQUM7SUFFTSxlQUFlLENBQVUsTUFBbUIsRUFBRSxNQUFlO1FBQ2xFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFFO1FBRXZDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDeEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sQ0FBQztRQUNuRSxPQUFPLE9BQTRCO0lBQ3JDLENBQUM7SUFFTSxTQUFTLENBQUMsTUFBbUIsRUFBRSxNQUFjO1FBQ2xELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFFTSxZQUFZO1FBQ2pCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7SUFDbEMsQ0FBQztJQUVNLGtCQUFrQjtRQUN2QixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBcUI7UUFDM0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRTtZQUNyQyx5QkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLEVBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzFGLENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFTSxhQUFhO1FBQ2xCLElBQUksTUFBTSxHQUFHLElBQUksS0FBSyxFQUFvRTtRQUMxRixJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFFLEVBQUUsQ0FBQyxFQUFFO1lBQ3JDLHlCQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUM7UUFDRixPQUFPLE1BQU07SUFDZixDQUFDO0lBRVMsd0JBQXdCLENBQUMsTUFBYyxFQUFFLFNBQWlCLEVBQUUsS0FBSyxHQUFHLElBQUk7UUFDaEYsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLEtBQUssRUFBa0I7UUFDbEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7WUFDeEIsSUFBSSxDQUFDLHlCQUFXLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO2dCQUFFLFNBQVE7WUFDaEQsZ0JBQWdCLENBQUMsSUFBSSxDQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUM1QixFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUQsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFHLFNBQVMsRUFBRSxDQUMxRDtTQUNGO1FBRUQsT0FBTztZQUNMLElBQUksRUFBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLDhCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsOEJBQWdCLENBQUMsTUFBTTtZQUM3RCxTQUFTLEVBQUUsU0FBUztZQUNwQixpQkFBaUIsRUFBRyxnQkFBZ0I7U0FDckM7SUFDSCxDQUFDO0lBRVMsdUJBQXVCLENBQVcsRUFBb0IsRUFBRSxjQUFzQjtRQUN0RixRQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUU7WUFDbkIsS0FBSyx5QkFBVyxDQUFDLEdBQUc7Z0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGlCQUFpQixjQUFjLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxjQUFjLENBQUM7Z0JBQzNGLEVBQUUsQ0FBQyxTQUFTLEdBQUcseUJBQVcsQ0FBQyxVQUFVO2dCQUNyQyxNQUFLO1lBQ1AsS0FBSyx5QkFBVyxDQUFDLE9BQU87Z0JBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG9CQUFvQixjQUFjLGFBQWEsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZJLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxjQUFjLENBQUM7Z0JBQzVGLEVBQUUsQ0FBQyxTQUFTLEdBQUcseUJBQVcsQ0FBQyxTQUFTO2dCQUNwQyxNQUFLO1lBQ1AsS0FBSyx5QkFBVyxDQUFDLFFBQVE7Z0JBQ3ZCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHNCQUFzQixjQUFjLGNBQWMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztnQkFDOUgsRUFBRSxDQUFDLFNBQVMsR0FBRyx5QkFBVyxDQUFDLFVBQVU7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxjQUFlLEVBQUUsY0FBYyxDQUFDO2dCQUN4RCxFQUFFLENBQUMsY0FBYyxHQUFHLElBQUk7Z0JBQ3hCLE1BQUs7WUFDUCx3QkFBd0I7WUFDeEIsS0FBSyx5QkFBVyxDQUFDLFVBQVUsQ0FBQztZQUM1QixLQUFLLHlCQUFXLENBQUMsU0FBUyxDQUFDO1NBQzVCO0lBQ0gsQ0FBQztJQUVNLGFBQWEsQ0FBQyxjQUFzQjtRQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQ0FBaUMsY0FBYyxFQUFFLENBQUM7UUFFMUYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRTtZQUNyQyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUMsVUFBVTtZQUM1QixJQUFJLEVBQUUsQ0FBQyxTQUFTLEtBQUsseUJBQVcsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLFNBQVMsS0FBSyx5QkFBVyxDQUFDLFFBQVE7Z0JBQzNFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSx5QkFBVyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBRTtpQkFDaEYsSUFBSSxFQUFFLENBQUMsU0FBUyxLQUFLLHlCQUFXLENBQUMsT0FBTztnQkFDM0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3RELDZDQUE2QztZQUM3QyxJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxFQUFFLGNBQWMsQ0FBQztZQUNoRCxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWM7WUFDcEMsRUFBRSxDQUFDLFlBQVksR0FBRyxJQUFJO1FBQ3hCLENBQUMsQ0FBQztRQUVGLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7UUFDaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVO1FBRTNFLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxjQUFjLEVBQUUsQ0FBQztJQUM5RixDQUFDO0lBRVMsb0JBQW9CLENBQUUsS0FBYSxFQUFFLEdBQWMsRUFBRSxPQUFzQjtRQUNuRixRQUFPLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDbkIsS0FBSyw4QkFBZ0IsQ0FBQyxHQUFHO2dCQUN2QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO2dCQUMzQixNQUFLO1lBQ1AsS0FBSyw4QkFBZ0IsQ0FBQyxNQUFNO2dCQUMxQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxLQUFLLEVBQUUsR0FBRyxDQUFFO2dCQUNwQyxJQUFLLENBQUMsS0FBSyxTQUFTO29CQUFHLE9BQU07Z0JBQzdCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUU7Z0JBQ2pFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFFO2dCQUMvQixNQUFLO1lBQ1AsS0FBSyw4QkFBZ0IsQ0FBQyxNQUFNO2dCQUMxQixNQUFNLE1BQU0sR0FBRyx1QkFBYyxDQUFFLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO2dCQUN2RixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBRTtnQkFDcEMsTUFBSztTQUNSO0lBQ0gsQ0FBQztJQUVNLGFBQWE7UUFDbEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRTtZQUNyQyxRQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUU7Z0JBQ25CLEtBQUsseUJBQVcsQ0FBQyxHQUFHO29CQUNsQixFQUFFLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsU0FBUztvQkFDcEMsTUFBSztnQkFDUCxLQUFLLHlCQUFXLENBQUMsUUFBUTtvQkFDdkIsRUFBRSxDQUFDLFlBQVksR0FBRyxLQUFLO29CQUN2QixFQUFFLENBQUMsY0FBZSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBRTtvQkFDNUUsRUFBRSxDQUFDLFlBQVksR0FBRyxJQUFJO29CQUN0QixFQUFFLENBQUMsY0FBYyxHQUFHLElBQUk7b0JBQ3hCLEVBQUUsQ0FBQyxTQUFTLEdBQUcseUJBQVcsQ0FBQyxVQUFVO29CQUNyQyxNQUFLO2dCQUNQLEtBQUsseUJBQVcsQ0FBQyxPQUFPO29CQUN0QixFQUFFLENBQUMsU0FBUyxHQUFHLHlCQUFXLENBQUMsVUFBVTtvQkFDckMsTUFBSztnQkFDUCx1QkFBdUI7Z0JBQ3ZCLEtBQUsseUJBQVcsQ0FBQyxVQUFVLENBQUM7Z0JBQzVCLEtBQUsseUJBQVcsQ0FBQyxTQUFTLENBQUM7YUFDNUI7UUFDSCxDQUFDLENBQUM7UUFDRixJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztJQUN0RSxDQUFDO0lBRU0sZUFBZSxDQUFFLGNBQXVCO1FBQzdDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjO1FBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxJQUFJLE9BQU8sY0FBYyxFQUFFLENBQUM7UUFFdkcsSUFBSSxDQUFDLGFBQWEsRUFBRTtRQUNwQixPQUFPLGNBQWMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFHO1lBQzdDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO1lBQ2hFLFVBQVUsSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFFLENBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRyxFQUFFO2dCQUMzRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUUsV0FBVyxDQUFFO2dCQUMvQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQztZQUN0RCxDQUFDLENBQUM7WUFDRixJQUFJLENBQUMsY0FBYyxFQUFHO1NBQ3ZCO1FBRUQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQy9ELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUU7UUFFaEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUNoRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSxPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUNoSCxDQUFDO0lBRU0sWUFBWSxDQUFFLGNBQXVCO1FBQzFDLElBQUssSUFBSSxDQUFDLFVBQVUsSUFBSSxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjO1lBQUcsT0FBTTtRQUN2RixLQUFLLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxHQUFHLGNBQWMsRUFBRSxHQUFHLEVBQUUsRUFBRztZQUM1RCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRU8sV0FBVyxDQUFFLEVBQWlCO1FBQ3BDLElBQUksZUFBZSxHQUFHLEVBQUU7UUFDeEIsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGVBQWUsSUFBSSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFFBQVEsT0FBTyxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUM7UUFFdEcsT0FBTyxhQUFhLEVBQUUsQ0FBQyxTQUFTLFVBQVUsRUFBRSxDQUFDLElBQUksTUFBTSxlQUFlLEdBQUc7SUFDM0UsQ0FBQztJQUVNLFdBQVc7UUFDaEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWM7UUFDakMsSUFBSSxNQUFNLEdBQUcsb0RBQW9EO1FBQ2pFLE9BQU8sT0FBTyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUc7WUFDbEMsTUFBTSxJQUFJLHlCQUF5QixPQUFPLG9CQUFvQjtZQUM5RCxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUUsT0FBTyxDQUFFO1lBQzdDLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFFLENBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRyxFQUFFO2dCQUN4QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFFLEVBQUUsQ0FBRTtnQkFDcEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRTtnQkFDL0MsTUFBTSxHQUFHLEdBQUcsUUFBUSxFQUFFLENBQUMsS0FBSyxTQUFTLEVBQUUsQ0FBQyxHQUFHLGNBQWMsT0FBTyxNQUFNO2dCQUN0RSxNQUFNLElBQUksR0FBRztZQUNmLENBQUMsQ0FBQztZQUNGLE1BQU0sSUFBSSxJQUFJO1lBQ2QsT0FBTyxFQUFFO1NBQ1Y7UUFDRCxNQUFNLElBQUksaURBQWlEO1FBQzNELE9BQU8sTUFBTTtJQUNmLENBQUM7Q0FDRjtBQTFVRCxvREEwVUM7QUFFRDtJQUtFLFlBQW9CLE9BQThCLEVBQUUsTUFBaUMsRUFBRSxVQUFzQjtRQUMzRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU87UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNO1FBQ3BCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVTtJQUM5QixDQUFDO0lBRUQsSUFBVyxhQUFhLEtBQUssT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFDLENBQUM7SUFFM0MsZUFBZTtRQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBb0I7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUUsRUFBRSxDQUFDLEVBQUU7WUFDekMsTUFBTSxDQUFDLElBQUksQ0FBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFFO1FBQ3RELENBQUMsQ0FBQztRQUNGLE9BQU8sTUFBTTtJQUNmLENBQUM7SUFFUyxxQkFBcUIsQ0FBQyxFQUFnQjtRQUM5QyxRQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUU7WUFDbkIsS0FBSyx5QkFBVyxDQUFDLEdBQUc7Z0JBQ2xCLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUcsRUFBRSxDQUFDLFNBQVMsRUFBRSxFQUFHLHlCQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFFO2dCQUM5RixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFFLEVBQUUsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO1lBQy9ELEtBQUsseUJBQVcsQ0FBQyxRQUFRO2dCQUN2QixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUU7Z0JBQ3BELElBQUksT0FBTyxHQUFHLHVCQUFjLENBQUUsYUFBYSxDQUFDLGlCQUFpQixFQUFHLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRTtnQkFDM0YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBRTtZQUNwSCxLQUFLLHlCQUFXLENBQUMsT0FBTztnQkFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdFO2dCQUNFLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxTQUFTLEdBQUcsQ0FBQztTQUM1RDtJQUNILENBQUM7SUFFTSx1QkFBdUIsQ0FBRSxjQUF1QjtRQUNyRCxJQUFJLE1BQU0sR0FBRyxJQUFJLEtBQUssRUFBb0I7UUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUUsY0FBYyxDQUFFLENBQUMsT0FBTyxDQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUcsRUFBRTtZQUMzRyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFFLFdBQVcsQ0FBRTtZQUN2RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ3hDLFFBQU8sYUFBYSxDQUFDLElBQUksRUFBRTtnQkFDekIsS0FBSyw4QkFBZ0IsQ0FBQyxHQUFHO29CQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU8sRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pELE1BQUs7Z0JBQ1AsS0FBSyw4QkFBZ0IsQ0FBQyxNQUFNO29CQUMxQixJQUFJLE9BQU8sR0FBRyx1QkFBYyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7b0JBQ3pGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTyxFQUFFLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxTQUFTLENBQUUsQ0FBQztvQkFDNUYsTUFBSztnQkFDUCxLQUFLLDhCQUFnQixDQUFDLE1BQU07b0JBQzFCLElBQUksTUFBTSxHQUFHLHVCQUFjLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDeEYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQUs7YUFDUjtRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxNQUFNO0lBQ2YsQ0FBQztDQUVGO0FBNURELDhDQTREQzs7Ozs7Ozs7Ozs7O0FDeGJELDJDOzs7Ozs7Ozs7OztBQ0FBLHdDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLHFDOzs7Ozs7Ozs7OztBQ0FBLGtDOzs7Ozs7Ozs7OztBQ0FBLDRDOzs7Ozs7Ozs7OztBQ0FBLDJDOzs7Ozs7Ozs7OztBQ0FBLHNDOzs7Ozs7Ozs7OztBQ0FBLGlDIiwiZmlsZSI6ImFzY2gtc21hcnRkYi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgd2FzbSBtb2R1bGVzXG4gXHR2YXIgaW5zdGFsbGVkV2FzbU1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIG9iamVjdCB3aXRoIGFsbCBjb21waWxlZCBXZWJBc3NlbWJseS5Nb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLncgPSB7fTtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvSW5kZXgudHNcIik7XG4iLCJpbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2sgfSBmcm9tICcuL0Jsb2NrJ1xuXG5leHBvcnQgY2xhc3MgQmxvY2tDYWNoZSB7XG4gIHByaXZhdGUgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgQmxvY2s+KClcbiAgcHJpdmF0ZSBtaW5IZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heEhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG1heENhY2hlZENvdW50IDogbnVtYmVyICkge1xuICAgIHRoaXMubWF4Q2FjaGVkQ291bnQgPSBtYXhDYWNoZWRDb3VudFxuICB9XG5cbiAgcHVibGljIGlzQ2FjaGVkKCBoZWlnaHQ6IG51bWJlciApIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGhlaWdodCA+IDAgJiYgaGVpZ2h0ID49IHRoaXMubWluSGVpZ2h0ICYmIGhlaWdodCA8PSB0aGlzLm1heEhlaWdodFxuICB9XG5cbiAgcHVibGljIGdldCBjYWNoZWRIZWlnaHRSYW5nZSgpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluIDogdGhpcy5taW5IZWlnaHQsIG1heDogdGhpcy5tYXhIZWlnaHQgfVxuICB9XG5cbiAgcHVibGljIHB1dCggYmxvY2s6IEJsb2NrICkge1xuICAgIGlmICggIXRoaXMuaXNDYWNoZWQoIGJsb2NrLmhlaWdodCApICYmIHRoaXMubWF4SGVpZ2h0ID49IDAgJiYgYmxvY2suaGVpZ2h0ICE9PSB0aGlzLm1heEhlaWdodCArIDEgKVxuICAgICAgdGhyb3cgbmV3IEVycm9yICgnaW52YWxpZCBibG9jayBoZWlnaHQnKVxuXG4gICAgdGhpcy5jYWNoZS5zZXQoIGJsb2NrLmhlaWdodCwgYmxvY2sgKVxuICAgIHRoaXMubWF4SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gICAgXG4gICAgaWYgKCB0aGlzLmNhY2hlLnNpemUgPj0gdGhpcy5tYXhDYWNoZWRDb3VudCApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKCB0aGlzLm1pbkhlaWdodCsrIClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0KCBoZWlnaHQ6IG51bWJlciApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQoaGVpZ2h0KVxuICB9XG5cbiAgcHVibGljIGdldEJ5SWQoIGlkOiBzdHJpbmcgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgZm9yKCBjb25zdCBiIG9mIHRoaXMuY2FjaGUudmFsdWVzKCkgKSB7XG4gICAgICBpZiAoIGIuaWQhID09PSBpZCApIHJldHVybiBiXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBldml0KCBmcm9tSGVpZ2h0OiBudW1iZXIsIHRvSGVpZ2h0OiBudW1iZXIgKSB7XG4gICAgbGV0IG1pbiA9IE1hdGgubWluKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgbGV0IG1heCA9IE1hdGgubWF4KCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApXG4gICAgaWYgKCBtaW4gPiB0aGlzLm1heEhlaWdodCB8fCBtYXggPCB0aGlzLm1pbkhlaWdodCApIHJldHVybiBcbiAgICBcbiAgICBtaW4gPSBNYXRoLm1heCggbWluLCB0aGlzLm1pbkhlaWdodCApXG4gICAgbWF4ID0gTWF0aC5taW4oIG1heCwgdGhpcy5taW5IZWlnaHQgKVxuICAgIGZvciAoIGxldCBoZWlnaHQgPSBtaW47IGhlaWdodCA8PSBtYXg7IGhlaWdodCsrICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoaGVpZ2h0KVxuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE9iamVjdExpdGVyYWwge1xuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmV4cG9ydCB0eXBlIEpzb25PYmplY3QgPSBPYmplY3RMaXRlcmFsXG5leHBvcnQgdHlwZSBFbnRpdHkgPSBPYmplY3RMaXRlcmFsXG5cbmV4cG9ydCBpbnRlcmZhY2UgS2V5T2JqZWN0IHsgXG4gIGtleSA6IHN0cmluZ1xuICBrZXlKc29uIDogSnNvbk9iamVjdFxufVxuZXhwb3J0IHR5cGUgRW50aXR5S2V5ID0gc3RyaW5nIHwgbnVtYmVyIHwgS2V5T2JqZWN0XG5cbmV4cG9ydCB0eXBlIFBhcnRpYWw8VD4gPSB7XG4gIFtQIGluIGtleW9mIFRdPzogVFtQXVxufVxuXG5leHBvcnQgdHlwZSBSZWFkb25seVBhcnRpYWw8VD4gPSB7XG4gIHJlYWRvbmx5IFtQIGluIGtleW9mIFRdOiBUW1BdO1xufVxuXG5leHBvcnQgdHlwZSBGaWx0ZXJGdW5jdGlvbjxUPiA9ICggZSA6IFQgKSA9PiBib29sZWFuXG5cbmV4cG9ydCB0eXBlIEtleVZhbHVlUGFpciA9IHsga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkgfVxuZXhwb3J0IHR5cGUgQ2FsbGJhY2s8VFJlc3VsdD4gPSAoIGVycjogRXJyb3J8bnVsbCwgZGF0YTogVFJlc3VsdCApID0+IHZvaWRcblxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VKc29uT2JqZWN0PFQ+KGl0ZXJhYmxlOiBJdGVyYWJsZTxUPiwgZ2V0S2V5OiAodCA6IFQpID0+IHN0cmluZywgZ2V0VmFsdWU6ICh0OiBUKSA9PiBhbnkgICkgOiBKc29uT2JqZWN0IHtcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnaXRlcmFibGUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggaXRlcmFibGUgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0S2V5JywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldEtleSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRWYWx1ZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRWYWx1ZSApKVxuXG4gIGxldCByZXQgPSB7fVxuICBmb3IgKGxldCBpdGVtIG9mIGl0ZXJhYmxlKSB7XG4gICAgcmV0W2dldEtleShpdGVtKV0gPSBnZXRWYWx1ZShpdGVtKVxuICB9XG4gIHJldHVybiByZXQgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWVwQ29weTxUPihzcmMgOiBUKSA6IFQge1xuICBpZiAoICFzcmMgKSByZXR1cm4gc3JjXG4gIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHNyYykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0aWFsPFQ+KCBzcmMgOiBULCAuLi5rZXlzIDogQXJyYXk8c3RyaW5nPiApOiBQYXJ0aWFsPFQ+IHtcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnc3JjJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIHNyYyApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdrZXlzJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGtleXMgKSlcblxuICBsZXQgcmVzdWx0ID0gIHsgfVxuICBmb3IgKCBsZXQgayBvZiBbLi4ua2V5c10gKSByZXN1bHRba10gPSBzcmNba11cbiAgcmV0dXJuIHJlc3VsdCBhcyBQYXJ0aWFsPFQ+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ByaW1pdGl2ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCAha2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBpc1N0cmluZygga2V5ICkgfHwgaXNOdW1iZXIoIGtleSApXG59XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoIG1lc3NhZ2UgOiBzdHJpbmcgKSB7XG4gICAgc3VwZXIoICdDb2RlIGNvbnRyYWN0IEVycm9yLCcrIG1lc3NhZ2UgKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0Q29uZGl0aW9uID0gYm9vbGVhbiB8ICggKCkgPT4gYm9vbGVhbiApXG5leHBvcnQgdHlwZSBDb250cmFjdE1lc3NhZ2UgICA9IHN0cmluZyAgfCAoICgpID0+IHN0cmluZyApXG5cbmV4cG9ydCB0eXBlIE1heWJlVW5kZWZpbmVkPFQ+ID0gVCB8IHVuZGVmaW5lZFxuZXhwb3J0IHR5cGUgTnVsbGFibGU8VD4gPSBUIHwgbnVsbCB8IHVuZGVmaW5lZFxuXG5leHBvcnQgdHlwZSBDb250cmFjdFZlcmlmeVJlc3VsdCA9IHsgcmVzdWx0IDogYm9vbGVhbiwgbWVzc2FnZTogTnVsbGFibGU8c3RyaW5nPiB9IFxuZXhwb3J0IHR5cGUgVmVyaWZ5RnVuY3Rpb24gPSAoKSA9PiBDb250cmFjdFZlcmlmeVJlc3VsdFxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0IHtcbiAgcHVibGljIHN0YXRpYyB2ZXJpZnkoIGNvbmRpdGlvbjogQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UgOiBDb250cmFjdE1lc3NhZ2UgKSA6IHZvaWQge1xuICAgIGlmICggY29uZGl0aW9uID09PSB1bmRlZmluZWQgfHwgY29uZGl0aW9uID09PSBudWxsICkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHZlcmlmeSBjb25kaXRpb24nKVxuXG4gICAgY29uc3QgY29uZCA9IGlzRnVuY3Rpb24oY29uZGl0aW9uKSA/IChjb25kaXRpb24gYXMgRnVuY3Rpb24pKCkgOiBjb25kaXRpb25cbiAgICBjb25zdCBtc2cgPSBpc0Z1bmN0aW9uKG1lc3NhZ2UpID8gKG1lc3NhZ2UgYXMgRnVuY3Rpb24pKCkgOiBtZXNzYWdlXG5cbiAgICBpZiAoIWNvbmQpIHRocm93IG5ldyBDb2RlQ29udHJhY3RFcnJvciggbXNnIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYXJndW1lbnQoIGFyZ05hbWU6IHN0cmluZywgdmVyaWZ5OiBWZXJpZnlGdW5jdGlvbiB8IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlPyA6IENvbnRyYWN0TWVzc2FnZSApOiB2b2lkIHtcbiAgICBpZiAoICFhcmdOYW1lIHx8ICF2ZXJpZnkgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcignYXJnTmFtZSBvciB2ZXJpZnkgY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGlmICggIW1lc3NhZ2UgKSB7XG4gICAgICBjb25zdCB2ciA9ICAodmVyaWZ5IGFzIFZlcmlmeUZ1bmN0aW9uKSgpXG4gICAgICBDb2RlQ29udHJhY3QudmVyaWZ5KCB2ci5yZXN1bHQsIGBhcmd1bWVudCAnJHthcmdOYW1lfScgJHt2ci5tZXNzYWdlfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBDb2RlQ29udHJhY3QudmVyaWZ5KHZlcmlmeSBhcyBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSEpICAgIFxuICB9XG5cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGwoIGFyZyA6IGFueSApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIGFyZyAhPT0gbnVsbCAmJiBhcmcgIT09IHVuZGVmaW5lZFxuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPckVtcHR5KCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbChzdHIpICYmIHN0ciAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciBlbXB0eSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JXaGl0ZXNwYWNlKCBzdHI6IE51bGxhYmxlPHN0cmluZz4gKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBDb2RlQ29udHJhY3Qubm90TnVsbE9yRW1wdHkoIHN0ciApICYmICggc3RyIGFzIHN0cmluZyApLnRyaW0oKSAhPT0gJydcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCBvciB3aGl0ZXNwYWNlJ1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxufVxuXG5cbiIsImltcG9ydCB7IEVudGl0eUNhY2hlLCBMUlVFbnRpdHlDYWNoZSwgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yIH0gZnJvbSAnLi9Nb2RlbCc7XG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IEpzb25TcWxCdWlsZGVyLCBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciwgTVVMVElfU1FMX1NFUEFSQVRPUiB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEVudGl0eSwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFByb3hpZWRFbnRpdHlUcmFja2VyLCBUcmFja2VyU3FsQnVpbGRlciwgRW50aXR5Q2hhbmdlc0l0ZW0gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlUcmFja2VyJ1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5RXh0ZW5zaW9uIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzQXJyYXkgfSBmcm9tICd1dGlsJ1xuXG5leHBvcnQgdHlwZSBTYXZlSGlzdG9yeUFjdGlvbiA9ICggdmVyc2lvbjogbnVtYmVyLCBoaXN0b3J5OiBNYXA8c3RyaW5nLCBFbnRpdHlDaGFuZ2VzPiApID0+IHZvaWRcblxuZXhwb3J0IGNsYXNzIERiU2Vzc2lvbiB7XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY29ubmVjdGlvbjogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzZXNzaW9uQ2FjaGUgOiBFbnRpdHlDYWNoZVxuICBwcml2YXRlIHNxbEJ1aWxkZXIgOiBKc29uU3FsQnVpbGRlclxuICBwcml2YXRlIHRyYWNrZXJTcWxCdWlsZGVyOiBUcmFja2VyU3FsQnVpbGRlclxuICBwcml2YXRlIGVudGl0eVRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIHNlc3Npb25TZXJpYWwgOiBudW1iZXJcblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24sIGNhY2hlT3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucywgc2Vzc2lvbk5hbWU/OiBzdHJpbmcpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKCBEYlNlc3Npb24ubmFtZSArICggc2Vzc2lvbk5hbWUgPT09IHVuZGVmaW5lZCA/ICcnIDogYF8ke3Nlc3Npb25OYW1lfWApICApXG4gICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gLTFcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gICAgdGhpcy5tb2RlbHMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLnNlc3Npb25DYWNoZSA9IG5ldyBMUlVFbnRpdHlDYWNoZShjYWNoZU9wdGlvbnMpXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gbmV3IEpzb25TcWxCdWlsZGVyKClcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIgPSBuZXcgUHJveGllZEVudGl0eVRyYWNrZXIoIHRoaXMuc2Vzc2lvbkNhY2hlIClcbiAgICB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyID0gbmV3IFRyYWNrZXJTcWxCdWlsZGVyKCB0aGlzLmVudGl0eVRyYWNrZXIsIHRoaXMubW9kZWxzLCB0aGlzLnNxbEJ1aWxkZXIgKVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuY29ubmVjdGlvbiAmJiB0aGlzLmNvbm5lY3Rpb24uaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZW50aXR5Q2FjaGUoKTogRW50aXR5Q2FjaGUge1xuICAgIHJldHVybiB0aGlzLnNlc3Npb25DYWNoZVxuICB9XG5cbiAgcHVibGljIHN5bmNTY2hlbWEoc2NoZW1hOiBNb2RlbFNjaGVtYSk6IHZvaWQge1xuICAgIHRoaXMuc3FsQnVpbGRlci5idWlsZFNjaGVtYShzY2hlbWEpLmZvckVhY2goIHNxbD0+IHtcbiAgICAgIHRoaXMuY29ubmVjdGlvbi5leGVjdXRlU3luYyggc3FsIClcbiAgICB9KVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2NoZW1hKC4uLnNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogdm9pZCB7XG4gICAgc2NoZW1hcy5mb3JFYWNoKCBzID0+IHRoaXMubW9kZWxzLnNldChzLm1vZGVsTmFtZSwgcykgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWU6IHN0cmluZykgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1vZGVsTmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlDbGFzczxURW50aXR5PihjbGF6ejogQ29uc3RydWN0b3I8VEVudGl0eT4pIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChjbGF6ei5uYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke2NsYXp6Lm5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICkge1xuICAgIHJldHVybiB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbCkgOiBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlDbGFzcyhtb2RlbClcbiAgfVxuXG4gIHByb3RlY3RlZCBtYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkoIHt9LCBrZXkgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCAgZW50aXRpZXMgOiBBcnJheTxURW50aXR5PiwgY2FjaGUgPSB0cnVlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGUpIClcbiAgICAgIGNhY2hlICYmIHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpICwgZSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVzZXQoY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5zdG9wVHJhY2tBbGwoKVxuICAgIGlmICggY2xlYXJDYWNoZSApIHRoaXMuZW50aXR5Q2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlc2V0KCB0cnVlIClcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZGlzY29ubmVjdCgpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pik6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDYWNoZWQ8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKSB8fCBbXVxuXG4gICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzIFxuICB9XG5cbiAgcHVibGljIGF0dGFjaDxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIHRyYWNrZWQgYXMgT2JqZWN0IGFzIFRFbnRpdHlcblxuICAgIGxldCBjYWNoZWQgPSB0aGlzLmVudGl0eUNhY2hlLmdldDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICByZXR1cm4gKCBjYWNoZWQgPT09IHVuZGVmaW5lZCApID8gdW5kZWZpbmVkIDogXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KCBzY2hlbWEsIGNhY2hlZCApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgJiYgdGhpcy5lbnRpdHlDYWNoZS5leGlzdHNNb2RlbChzY2hlbWEubW9kZWxOYW1lKSApIHtcbiAgICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0TWFueSggbW9kZWwsIHsgfSwgdHJhY2sgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSwgY2FjaGUgPSB0cnVlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbilcbiAgICBcbiAgICBsZXQgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIGNhY2hlICkgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShlKSwgZSApKVxuXG4gICAgcmV0dXJuICF0cmFjayA/IGVudGl0aWVzIDpcbiAgICAgIHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeTxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBmaWVsZHM/OiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgam9pbilcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnlCeUpzb248VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHBhcmFtcylcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhpc3RzPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsIClcblxuICAgIGxldCB7IHF1ZXJ5ICwgcGFyYW1ldGVyc30gPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3QoIHNjaGVtYSwgW10gLCBjb25kaXRpb24gKSBcbiAgICBxdWVyeSA9IGBzZWxlY3QgZXhpc3RzKCR7cXVlcnkucmVwbGFjZShNVUxUSV9TUUxfU0VQQVJBVE9SLCAnJyl9KSBhcyBleGlzdGBcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoIHF1ZXJ5LCBwYXJhbWV0ZXJzIClcbiAgICBcbiAgICByZXR1cm4gaXNBcnJheShyZXQpICYmIHBhcnNlSW50KHJldFswXVsnZXhpc3QnXSkgPiAwIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgcmV0ID0gYXdhaXQgdGhpcy5xdWVyeUJ5SnNvbiggbW9kZWwsIHsgZmllbGRzIDogJ2NvdW50KCopIGFzIGNvdW50JywgY29uZGl0aW9uOiBjb25kaXRpb24gfSApXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSA/IHBhcnNlSW50KHJldFswXVsnY291bnQnXSkgOiAwIFxuICB9XG5cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgIGtleTogRW50aXR5S2V5LCBlbnRpdHk/IDogVEVudGl0eSkgOiBURW50aXR5IHsgICAgXG4gICAgaWYgKCAha2V5ICkgdGhyb3cgbmV3IEVycm9yKCdlbnRpdHkga2V5IGNhbiBub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IHRoZUVudGl0eSA9IHNjaGVtYS5uZXdFbnRpdHkoIG1vZGVsLCBrZXkgKVxuICAgIGVudGl0eSAmJiBzY2hlbWEuY29weVByb3BlcnRpZXMoIHRoZUVudGl0eSwgZW50aXR5IClcblxuICAgIGxldCBleGlzdHMgPSB0aGlzLnNlc3Npb25DYWNoZS5leGlzdHMoc2NoZW1hLm1vZGVsTmFtZSwga2V5KSB8fCB0aGlzLmVudGl0eVRyYWNrZXIuaXNUcmFja2luZyhzY2hlbWEsIGtleSlcbiAgICBpZiAoIGV4aXN0cyApIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGV4aXN0cyBhbHJlYWR5ICggbW9kZWwgPSAnJHtzY2hlbWEubW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKSBgKVxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja05ldyhzY2hlbWEsIHRoZUVudGl0eSkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWRFbnRpdHlCeUtleShtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuICAgIGNvbnN0IHdoZXJlID0gdGhpcy5tYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIHdoZXJlKVxuXG4gICAgY29uc3Qgcm93cyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggcm93cy5sZW5ndGggPiAxICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkga2V5IGlzIGR1cGxpY2F0ZWQgKCBtb2RlbCA9ICcke21vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgIClcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cy5sZW5ndGggPT09IDEgPyByb3dzWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbG9hZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMubG9hZENhY2hlZCggbW9kZWwsIGtleSwgdHJ1ZSApXG4gICAgaWYgKCBjYWNoZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiBjYWNoZWRcbiAgXG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKCBtb2RlbE5hbWUgKSFcblxuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICkgcmV0dXJuIHRyYWNrZWQhIGFzIE9iamVjdCBhcyBURW50aXR5XG4gICAgXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgdGhpcy5sb2FkRW50aXR5QnlLZXkoIG1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIFxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlLnB1dCggbW9kZWxOYW1lLCBrZXksIGVudGl0eSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG5cbiAgICBjb25zdCBwZSA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eSggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggcGUgJiYgdHJhY2sgKSByZXR1cm4gcGUgYXMgRW50aXR5IGFzIFRFbnRpdHlcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldDxURW50aXR5Pihtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkIHx8ICEgdHJhY2sgKSByZXR1cm4gZW50aXR5XG5cbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGVudGl0eSkgYXMgVEVudGl0eSBcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3Igc2F2ZUNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlQ2hhbmdlcyhzZXJpYWw/IDogbnVtYmVyKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgcmV0U2VyaWFsID0gc2VyaWFsIHx8ICsrdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICBcbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZENoYW5nZVNxbHMoKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKCBzcWxzIClcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG4gICAgICBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5hY2NlcHRDaGFuZ2VzKCByZXRTZXJpYWwgKSBcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHJldFNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgICByZXR1cm4gcmV0U2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucmVqZWN0Q2hhbmdlcygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUm9sbGJhY2sgc2F2ZWQgY2hhbmdlc1xuICAgKiBAcGFyYW0gY2hhbmdlc05PICx0aGlzIHZhbHVlIHNob3VsZCBiZSByZXR1cm5lZCBieSBAc2VlIHNhdmVDaGFuZ2VzKCkgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tDaGFuZ2VzKCBzZXJpYWw6IG51bWJlciApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmKCB0aGlzLnNlc3Npb25TZXJpYWwgPD0gc2VyaWFsICkgcmV0dXJuIHRoaXMuc2Vzc2lvblNlcmlhbFxuXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzICggc2VyaWFsID0gJHtzZXJpYWx9IClgKVxuXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoc2VyaWFsICsgMSlcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkgeyAgICAgIFxuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaChzcWxzKSBcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG5cbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yb2xsYmFja0NoYW5nZXMoc2VyaWFsICsgMSlcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgKVxuICAgICAgcmV0dXJuIHRoaXMuc2Vzc2lvblNlcmlhbFxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbDogbnVtYmVyICkge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuY2xlYXJIaXN0b3J5KCBzZXJpYWwgKVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmhpc3RvcnlWZXJzaW9uXG4gIH1cblxuICBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICAvLyBkbyBub3RoaW5nIC5cbiAgfVxuXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja0RlbGV0ZSgoZW50aXR5IGFzIE9iamVjdCBhcyBFbnRpdHlFeHRlbnNpb24pLl9fc2NoZW1hX18sICBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFuc2FjdGlvbigpIDogUHJvbWlzZTxEQlRyYW5zYWN0aW9uPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgfSAgXG5cbn0iLCJpbXBvcnQgKiBhcyBMUlUgZnJvbSAnbHJ1LWNhY2hlJ1xuaW1wb3J0IHsgRW50aXR5LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBLZXlPYmplY3QsIEZpbHRlckZ1bmN0aW9uLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNOdW1iZXIsIGlzRnVuY3Rpb24sIGlzU3RyaW5nIH0gZnJvbSAndXRpbCc7XG5cbi8qKlxuICogY2FjaGUgb3B0aW9uc1xuICovXG5leHBvcnQgdHlwZSBFbnRpdHlDYWNoZU9wdGlvbnMgPSB7IFxuICBkZWZhdWx0IDogbnVtYmVyLFxuICBbbW9kZWw6IHN0cmluZ106ICBudW1iZXIgfCAoICggbW9kZWw6IHN0cmluZyApID0+IG51bWJlciApXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2FjaGUge1xuICBtb2RlbHMgOiBBcnJheTxzdHJpbmc+XG4gIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZFxuICBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PlxuICBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCAgZW50aXR5OiBFbnRpdHkpIDogdm9pZFxuICBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkXG4gIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiAgXG4gIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIExSVUVudGl0eUNhY2hlIGltcGxlbWVudHMgRW50aXR5Q2FjaGUge1xuICBwcml2YXRlIHN0YXRpYyBNSU5fQ0FDSEVEX0NPVU5UID0gMTAwXG4gIHByaXZhdGUgc3RhdGljIERFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UID0gMTAwMDBcblxuICBwcml2YXRlIG9wdGlvbnM6IEVudGl0eUNhY2hlT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIG1vZGVsQ2FjaGVzIDogTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj5cblxuICBwdWJsaWMgY29uc3RydWN0b3IoIG9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHsgZGVmYXVsdCA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UIH1cbiAgICAvLyBmb3IoIGxldCBrIGluIHRoaXMub3B0aW9ucyApIFxuICAgIC8vICAgdGhpcy5vcHRpb25zW2tdID0gaXNOdW1iZXIodGhpcy5vcHRpb25zW2tdKSA/IHRoaXMub3B0aW9uc1trXSA6IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKExSVUVudGl0eUNhY2hlLm5hbWUpXG4gICAgdGhpcy5tb2RlbENhY2hlcyA9IG5ldyBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PigpXG4gIH1cblxuICBwcml2YXRlIGdldE1vZGVsQ2FjaGUobW9kZWxOYW1lIDogc3RyaW5nLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlLCB0aHJvd0lmTm90RXhpc3RzID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TFJVLkNhY2hlPEVudGl0eUtleSwgRW50aXR5Pj4ge1xuICAgIGlmICggY3JlYXRlSWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIHsgXG4gICAgICAvLyBjb25zdCBvcHRpb25zID0ge1xuICAgICAgLy8gICBtYXg6IDUwMCxcbiAgICAgIC8vICAgbGVuZ3RoOiBmdW5jdGlvbiAobiwga2V5KSB7IHJldHVybiBuICogMiArIGtleS5sZW5ndGggfSxcbiAgICAgIC8vICAgLy9kaXNwb3NlOiBmdW5jdGlvbiAoa2V5LCBuKSB7IG4uY2xvc2UoKSB9LFxuICAgICAgLy8gICBtYXhBZ2U6IDEwMDAgKiA2MCAqIDYwIFxuICAgICAgLy8gfVxuICAgICAgbGV0IG1heENhY2hlZENvdW50IDogbnVtYmVyO1xuICAgICAgaWYgKCAhdGhpcy5vcHRpb25zLmhhc093blByb3BlcnR5KG1vZGVsTmFtZSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSB0aGlzLm9wdGlvbnMuZGVmYXVsdFxuICAgICAgZWxzZSBpZiAoIGlzTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IE51bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSlcbiAgICAgIGVsc2UgaWYgKCBpc0Z1bmN0aW9uKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKSlcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSAoIHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdIGFzIChtb2RlbCk9PiBudW1iZXIgKSggbW9kZWxOYW1lIClcbiAgICAgIGVsc2UgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgICAgbWF4Q2FjaGVkQ291bnQgPSBNYXRoLm1heCggTFJVRW50aXR5Q2FjaGUuTUlOX0NBQ0hFRF9DT1VOVCwgbWF4Q2FjaGVkQ291bnQgKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5zZXQobW9kZWxOYW1lLCBuZXcgTFJVPHN0cmluZywgRW50aXR5PiggbWF4Q2FjaGVkQ291bnQgKSApXG4gICAgfVxuICAgICBpZiAoIHRocm93SWZOb3RFeGlzdHMgJiYgIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkpIFxuICAgICAgIHRocm93IG5ldyBFcnJvcihgTW9kZWwgY2FjaGUgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKSAgZG9lcyBub3QgZXhpc3RzYCkgXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5tb2RlbENhY2hlcy5nZXQobW9kZWxOYW1lKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldENhY2hlS2V5KCBrZXk6IEVudGl0eUtleSApIDogbnVtYmVyIHwgc3RyaW5nIHtcbiAgICByZXR1cm4gaXNQcmltaXRpdmVLZXkoa2V5KSA/IGtleSBhcyBudW1iZXIgfCBzdHJpbmcgOiAoIGtleSBhcyBLZXlPYmplY3QgKS5rZXlcbiAgfVxuXG4gIHB1YmxpYyBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWQgeyAgICBcbiAgICBpZiAoIGlzU3RyaW5nKG1vZGVsTmFtZSkgKSB7XG4gICAgICB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIHRydWUgKSEucmVzZXQoKVxuICAgICAgdGhpcy5tb2RlbENhY2hlcy5kZWxldGUoIG1vZGVsTmFtZSApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZm9yICggbGV0IGMgb2YgdGhpcy5tb2RlbENhY2hlcy52YWx1ZXMoKSApIHtcbiAgICAgIGMucmVzZXQoKVxuICAgIH1cbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxzKCkgOiBzdHJpbmdbXSB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxzdHJpbmc+KClcbiAgICBmb3IoIGxldCBtIG9mIHRoaXMubW9kZWxDYWNoZXMua2V5cygpICkge1xuICAgICAgcmVzdWx0LnB1c2goIG0gKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQ8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcblxuICAgIHJldHVybiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSA/IHVuZGVmaW5lZCA6XG4gICAgICBtb2RlbENhY2hlIS5oYXMoY2FjaGVLZXkpID8gbW9kZWxDYWNoZSEuZ2V0KGNhY2hlS2V5KSBhcyBURW50aXR5IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBsZXQgY2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSApXG4gICAgaWYgKCBjYWNoZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICAgY2FjaGUuZm9yRWFjaCggZSA9PiB7XG4gICAgICAoIWZpbHRlciB8fCAoZmlsdGVyICYmIGZpbHRlciggZSBhcyBURW50aXR5ICkpKSAmJiByZXN1bHQucHVzaCggZSBhcyBURW50aXR5ICkgXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgZW50aXR5OiBFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBwdXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2tleX0sIGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX1gKSAgICBcbiAgICB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lLCB0cnVlKSEuc2V0KHRoaXMuZ2V0Q2FjaGVLZXkoa2V5KSwgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWQge1xuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBldml0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtjYWNoZUtleX1gKVxuXG4gICAgY29uc3QgbW9kZWxDYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUpXG4gICAgaWYgKG1vZGVsQ2FjaGUpIG1vZGVsQ2FjaGUuZGVsKGNhY2hlS2V5KVxuICB9XG4gIFxuICBwdWJsaWMgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXQobW9kZWxOYW1lLCAgdGhpcy5nZXRDYWNoZUtleSgga2V5ICkpICE9PSB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCBmYWxzZSApICE9PSB1bmRlZmluZWRcbiAgfVxuXG5cbiAgcHVibGljIGR1bXBDYWNoZSgpIDogc3RyaW5nIHtcbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIENBQ0hFICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB0aGlzLm1vZGVsQ2FjaGVzLmZvckVhY2goIChjYWNoZSwgbW9kZWwpID0+IHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS1Nb2RlbCAke21vZGVsfS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgY2FjaGUuZm9yRWFjaCggKCBlbnRpdHksIGtleSApID0+IHtcbiAgICAgICAgcmVzdWx0ICs9IGBrZXkgPSAke3RoaXMuZ2V0Q2FjaGVLZXkoIGtleSApfSwgZW50aXR5ID0geyR7SlNPTi5zdHJpbmdpZnkoZW50aXR5KX19IFxcbmBcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICB9KSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxufSIsImltcG9ydCAqIGFzIHNkYiBmcm9tICcuL1NtYXJ0REInXG5pbXBvcnQgKiBhcyBtb2RlbCBmcm9tICcuL01vZGVsJ1xuaW1wb3J0ICogYXMgYmxvY2sgZnJvbSAnLi9CbG9jaydcbmltcG9ydCAqIGFzIHNlc3Npb24gZnJvbSAnLi9EYlNlc3Npb24nXG5pbXBvcnQgKiBhcyBzcWxpdGUgZnJvbSAnLi9TUUxEQi9TcWxpdGVDb25uZWN0aW9uJ1xuaW1wb3J0ICogYXMgY29ubiBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcblxuZXhwb3J0IG5hbWVzcGFjZSBBc2NoQ29yZSB7XG4gIGV4cG9ydCBjb25zdCBTbWFydERCID0gc2RiLlNtYXJ0REJcbiAgZXhwb3J0IGNvbnN0IE1vZGVsU2NoZW1hID0gbW9kZWwuTW9kZWxTY2hlbWFcbiAgZXhwb3J0IHR5cGUgQmxvY2sgPSBibG9jay5CbG9ja1xuICBleHBvcnQgY29uc3QgRGJTZXNzaW9uID0gc2Vzc2lvbi5EYlNlc3Npb25cbiAgZXhwb3J0IHR5cGUgRGJDb25uZWN0aW9uID0gY29ubi5EYkNvbm5lY3Rpb25cbiAgZXhwb3J0IGNvbnN0IFNxbGl0ZUNvbm5lY3Rpb24gPSBzcWxpdGUuU3FsaXRlQ29ubmVjdGlvblxufSBcbiIsImltcG9ydCB7IGlzRnVuY3Rpb24gfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgKiBhcyBzdWIgZnJvbSAnbGV2ZWwtc3VibGV2ZWwnXG5cbmNvbnN0IGxldmVsID0gcmVxdWlyZSgnbGV2ZWwnKVxuY29uc3QgU2Vub25kYXJ5ID0gcmVxdWlyZSgnbGV2ZWwtc2Vjb25kYXJ5JylcblxuZXhwb3J0IHR5cGUgR2V0SW5kZXhWYWx1ZUZ1bmMgPSAoa2V5OiBhbnksIHZhbHVlOiBKc29uT2JqZWN0KSA9PiBhbnlcbmV4cG9ydCB0eXBlIEluZGV4RmllbGQgPSB7IGZpZWxkTmFtZTogc3RyaW5nLCBjYWxjSW5kZXg/OiBHZXRJbmRleFZhbHVlRnVuYyB9XG5cbmV4cG9ydCBjbGFzcyBTdWJMZXZlbE1ldGEge1xuICBwdWJsaWMgc3ViTmFtZTogc3RyaW5nXG4gIHB1YmxpYyBrZXlGaWVsZCA6IHN0cmluZ1xuICBwdWJsaWMgaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkOiBzdHJpbmcsIGluZGV4RmllbGRzID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkpIHtcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdChpbmRleEZpZWxkcylcbiAgfVxuXG4gIHByaXZhdGUgZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXhGaWVsZHMuZmluZEluZGV4KGl0ZW0gPT4gZmllbGROYW1lID09PSBpdGVtLmZpZWxkTmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBleGlzdHNJbmRleChmaWVsZE5hbWU6IHN0cmluZykgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5maW5kSW5kZXhPZkZpZWxkTmFtZShmaWVsZE5hbWUpID4gLTFcbiAgfVxuXG4gIHB1YmxpYyBhZGRJbmRleChmaWVsZE5hbWUgOiBzdHJpbmcsIGNhbGNJbmRleCA6IEdldEluZGV4VmFsdWVGdW5jKTogdGhpcyB7XG4gICAgaWYgKHRoaXMuZXhpc3RzSW5kZXgoZmllbGROYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW5kZXggb2YgZmllbGQgJyR7ZmllbGROYW1lfScgYWxyZWFkeSBleGlzdHNgKVxuXG4gICAgdGhpcy5pbmRleEZpZWxkcy5wdXNoKHsgZmllbGROYW1lLCBjYWxjSW5kZXggfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlbW92ZUluZGV4KGZpZWxkTmFtZSk6IHRoaXMge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKVxuICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgdGhpcy5pbmRleEZpZWxkcy5zbGljZShpZHgsIDEpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZnVuY3Rpb24gbWFrZVByb21pc2UoKSA6IENhbGxiYWNrPGFueT4ge1xuICBsZXQgY2FsbGJhY2tcbiAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNhbGxiYWNrID0gKGVyciwgdmFsdWUpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSh2YWx1ZSlcbiAgfSlcbiAgY2FsbGJhY2sucHJvbWlzZSA9IHByb21pc2VcbiAgcmV0dXJuIGNhbGxiYWNrXG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGNhbGxiYWNrIDogQ2FsbGJhY2s8YW55PiB8IHVuZGVmaW5lZCApIDogeyBjYWxsYmFjazogQ2FsbGJhY2s8YW55PiwgcHJvbWlzZTogUHJvbWlzZTxhbnk+fG51bGwgfSB7XG4gIGxldCBwcm9taXNlID0gbnVsbFxuXG4gIGlmICggIWNhbGxiYWNrICkge1xuICAgIGNhbGxiYWNrID0gbWFrZVByb21pc2UoKVxuICAgIHByb21pc2UgPSBjYWxsYmFja1sncHJvbWlzZSddXG4gIH1cblxuICByZXR1cm57IGNhbGxiYWNrLCBwcm9taXNlIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbFJlYWRhYmxlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVTdHJlYW0ge1xuICBvbiggZXZlbnROYW1lOiBzdHJpbmcsIGNhbGxiYWNrIDogRnVuY3Rpb24gKSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbEdldCB7XG4gIGdldDxUPihrZXk6IGFueSwgb3B0aW9ucz86IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KSA6IFByb21pc2U8VD5cbiAgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbE9wZXJhdGlvbiB7XG4gIHB1dDxUPihrZXkgOiBhbnksIHZhbHVlIDogVCwgb3B0aW9ucz86IEpzb25PYmplY3QsIGNhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBiYXRjaChvcGVyQXJyYXk6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPzogSnNvbk9iamVjdCkgOiBQcm9taXNlPHZvaWQ+IFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4ZWRMZXZlbCBleHRlbmRzIExldmVsR2V0LCBMZXZlbE9wZXJhdGlvbiB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgaW5kZXhlcyA6IEFycmF5PEluZGV4RmllbGQ+XG4gIGJ5SW5kZXgoaW5kZXhGaWVsZDogc3RyaW5nKSA6IExldmVsR2V0XG4gIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPik6IFByb21pc2U8VD5cbn1cblxuZXhwb3J0IGNsYXNzIExldmVsREIgeyAgXG4gIHByaXZhdGUgZGJEaXIgOiBzdHJpbmdcbiAgcHJpdmF0ZSBzdWJNZXRhcyA6IEFycmF5PFN1YkxldmVsTWV0YT5cbiAgcHJpdmF0ZSBzdWJMZXZlbHMgOiBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuICBwcml2YXRlIHN1YkxldmVsZGIgOiBzdWIuU3VibGV2ZWxcblxuICBjb25zdHJ1Y3RvcihkYkRpciA6IHN0cmluZywgbWV0YSA6IEFycmF5PFN1YkxldmVsTWV0YT4sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZGJEaXIgPSBkYkRpclxuICAgIHRoaXMuc3ViTWV0YXMgPSBuZXcgQXJyYXk8U3ViTGV2ZWxNZXRhPigpLmNvbmNhdChtZXRhKVxuICAgIHRoaXMuc3ViTGV2ZWxzID0gbmV3IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD4oKVxuICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgaW5pdCgpIHtcbiAgICB0aGlzLmxldmVsZGIgPSBsZXZlbCggdGhpcy5kYkRpciwgeyB2YWx1ZUVuY29kaW5nOiAnanNvbicgfSApXG4gICAgdGhpcy5zdWJMZXZlbGRiID0gc3ViKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhvcGVuQ2FsbGJhY2spXG5cbiAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBcbiAgICAoYXN5bmMoKT0+IHsgXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKVxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKSAgICAgIFxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVyciwgc2VsZilcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNsb3NlQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55PikgOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhjbG9zZUNhbGxiYWNrKVxuICAgIFxuICAgIGlmICh0aGlzLmlzQ2xvc2VkKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG5cbiAgICAoYXN5bmMoKT0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubGV2ZWxkYi5jbG9zZSgpXG4gICAgICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIpXG4gICAgICB9ICBcbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYiAmJiB0aGlzLmxldmVsZGIuaXNPcGVuKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuICghdGhpcy5sZXZlbGRiKSB8fCB0aGlzLmxldmVsZGIuaXNDbG9zZWQoKVxuICB9XG5cbiAgcHVibGljIGR1bXAoKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzLCByZWopID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpICAgICAgXG4gICAgICB0aGlzLmxldmVsZGIuY3JlYXRlUmVhZFN0cmVhbSgpXG4gICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gcmVzdWx0LnB1c2goYGtleT0gJHtkYXRhLmtleX0sIHZhbHVlPSAke2RhdGEudmFsdWV9YCkgKVxuICAgICAgICAub24oJ2Vycm9yJywgZSA9PiByZWooZSkgKVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlcyhyZXN1bHQuam9pbignXFxyXFxuJykpIClcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIEluZGV4ZWRTdWJMZXZlbCBpbXBsZW1lbnRzIEluZGV4ZWRMZXZlbCB7XG4gIHByaXZhdGUgc3ViTmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGtleUZpZWxkIDogc3RyaW5nXG4gIHByaXZhdGUgaW5kZXhBcnJheSA6IEFycmF5PEluZGV4RmllbGQ+XG4gIHByaXZhdGUgaW5kZXhlZFN1YkxldmVscyA6IE1hcDxzdHJpbmcsIExldmVsR2V0PlxuICBwcml2YXRlIHN1YkxldmVsRGIgOiBhbnlcblxuICBwdWJsaWMgZ2V0IG5hbWUoKSB7IHJldHVybiB0aGlzLnN1Yk5hbWUgfVxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSB7IHJldHVybiB0aGlzLmluZGV4QXJyYXkgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3VibGV2ZWw6IGFueSwgc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZCA6IHN0cmluZywgLi4uaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPikge1xuICAgIHRoaXMuc3ViTGV2ZWxEYiA9IHN1YmxldmVsXG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhBcnJheSA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdCguLi5pbmRleEZpZWxkcylcbiAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgTGV2ZWxHZXQ+KClcbiAgICB0aGlzLmluZGV4QXJyYXkuZm9yRWFjaCggZiA9PiB7XG4gICAgICBsZXQgc2Vub25kYXJ5ID0gU2Vub25kYXJ5KCBzdWJsZXZlbCwgZi5maWVsZE5hbWUsIGYuY2FsY0luZGV4IClcbiAgICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscy5zZXQoIGYuZmllbGROYW1lLCBzZW5vbmRhcnkgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlGaWVsZFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zOiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPiApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBrZXlMZXZlbCA9IHRoaXMuc3ViTGV2ZWxEYiBhcyBJbmRleGVkU3ViTGV2ZWwgXG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhnZXRDYWxsYmFjaylcbiAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgIFxuICAgIC8vIFNlbm9uZGFyeSggdGhpcy5sZXZlbGRiLCBpbmRleEZpZWxkIClcbiAgICAvLyAgbGV0IGl0ZW1zID0gIGF3YWl0ICgoKSA9PiB7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZSggKHJlcywgcmVqKSA9PiB7XG4gICAgLy8gICAgICAgbGV0IGJsb2NrcyA9IG5ldyBBcnJheTxUPigpICAgICAgXG4gICAgLy8gICAgICAgaW5kZXhMZXZlbC5jcmVhdGVSZWFkU3RyZWFtKClcbiAgICAvLyAgICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gYmxvY2tzLnB1c2goZGF0YSkgKVxuICAgIC8vICAgICAgICAgLm9uKCdlcnJvcicsIGUgPT4gcmVqKGUpIClcbiAgICAvLyAgICAgICAgIC5vbignZW5kJywgKCkgPT4gcmVzKGJsb2NrcykgKVxuICAgIC8vICAgICB9KVxuICAgIC8vICAgfSkoKSBhcyBBcnJheTxUPlxuICAgIGNvbnN0IGluZGV4TGV2ZWwgPSB0aGlzLmJ5SW5kZXgoIGluZGV4RmllbGQgKVxuXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGdldENhbGxiYWNrKVxuIFxuICAgIGluZGV4TGV2ZWwuZ2V0PFQ+KGtleSwgY2FsbGJhY2spXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhwdXRDYWxsYmFjaylcbiAgICB0aGlzLnN1YkxldmVsRGIucHV0KGtleSwgdmFsdWUsIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGRlbENhbGxiYWNrKVxuICAgIHRoaXMuc3ViTGV2ZWxEYi5kZWwoa2V5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmF0Y2goYXJyYXkgOiBBcnJheTxKc29uT2JqZWN0Piwgb3B0aW9ucz8gOiBKc29uT2JqZWN0LCBiYXRjaENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCBhcmd1bWVudHMubGVuZ3RoID09PSAwICkgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaCgpXG5cbiAgICBsZXQgaGFzT3B0aW9ucyA9IG9wdGlvbnMgJiYgKCFpc0Z1bmN0aW9uKG9wdGlvbnMpKVxuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayggaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT4pXG5cbiAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgIHRoaXMuc3ViTGV2ZWxEYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgdGhpcy5zdWJMZXZlbERiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMuc3ViTGV2ZWxEYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cbn1cbiIsImltcG9ydCB7IExldmVsREIsIEluZGV4ZWRMZXZlbCwgU3ViTGV2ZWxNZXRhIH0gZnJvbSAnLi9LVkRCL0xldmVsREInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIgfSBmcm9tICcuL0Jsb2NrJ1xuXG5jb25zdCBMQVNUX0JMT0NLX0hFSUdIVF9LRVkgPSAnX19sYXN0X2Jsb2NrX2hlaWdodF9fJ1xuXG5leHBvcnQgY2xhc3MgTGV2ZWxCbG9jayB7XG4gIHByaXZhdGUgZGIgOiBMZXZlbERCXG4gIHByaXZhdGUgYmxvY2tEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGhpc3RvcnlEYiA6IEluZGV4ZWRMZXZlbFxuICBwcml2YXRlIGxhc3RIZWlnaHQgOiBudW1iZXJcblxuICBjb25zdHJ1Y3RvciggZGlyIDogc3RyaW5nLCBsZXZlbE9wdGlvbnMgPSB7fSApIHtcbiAgICAvKiBcbiAgICAgIHsgaWQoNjQpLCB0aW1lc3RhbXAoYmlnaW50KSwgaGVpZ2h0KGJpZ2ludCksIHBheWxvYWRMZW5ndGgoYmlnaW50KSwgcGF5bG9hZEhhc2goNjQpLCBwcmV2QmxvY2tJZCg2NCksIFxuICAgICAgICBwb2ludElkKDY0KSwgcG9pbnRIZWlnaHQoYmlnaW50KSwgZGVsZWdhdGUoNjQpLCBzaWduYXR1cmUoMTI4KSwgY291bnQoYmlnaW50KSB9XG4gICAgKi9cbiAgICBjb25zdCBibG9ja01ldGEgPSBuZXcgU3ViTGV2ZWxNZXRhKCdibGsnLCAnaGVpZ2h0JywgW1xuICAgICAgeyBmaWVsZE5hbWU6ICdpZCcgfSwgXG4gICAgICB7IGZpZWxkTmFtZTogJ2RlbGVnYXRlJyB9XG4gICAgXSlcbiAgICBjb25zdCBjaGFuZ2VzTG9nTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2hpcycsICdoZWlnaHQnLCBbXSlcbiAgICBcbiAgICB0aGlzLmRiID0gbmV3IExldmVsREIoIGRpciwgW2Jsb2NrTWV0YSwgY2hhbmdlc0xvZ01ldGFdLCBsZXZlbE9wdGlvbnMgKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IC0xXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGdldExhc3RCbG9ja0hlaWdodEZyb21EYigpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHRyeSB7XG4gICAgICBsZXQgeyBoZWlnaHQgfSA9ICBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0PHsgaGVpZ2h0OiBudW1iZXIgfT4oTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB7fSlcbiAgICAgIHJldHVybiBoZWlnaHRcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZSBcblxuICAgICAgbGV0IGxhc3RIZWlnaHQgPSB7IGhlaWdodDogLTEgfVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RiLnB1dChMQVNUX0JMT0NLX0hFSUdIVF9LRVksIGxhc3RIZWlnaHQpXG4gICAgICByZXR1cm4gbGFzdEhlaWdodC5oZWlnaHRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgb3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLm9wZW4oKVxuICAgIHRoaXMuYmxvY2tEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2JsaycpXG4gICAgdGhpcy5oaXN0b3J5RGIgPSB0aGlzLmRiLmdldFN1YkxldmVsKCdoaXMnKVxuICAgIHRoaXMubGFzdEhlaWdodCA9IGF3YWl0IHRoaXMuZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmRiLmNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIgeyBcbiAgICByZXR1cm4gdGhpcy5sYXN0SGVpZ2h0IFxuICB9XG5cbiAgcHJpdmF0ZSBpc0tleU5vdEZvdW5kRXJyb3IoZSkgOiBib29sZWFuIHsgXG4gICAgcmV0dXJuIGUubmFtZSA9PT0gJ05vdEZvdW5kRXJyb3InIFxuICB9XG5cbiAgcHJpdmF0ZSBnZXRMYXN0SGVpZ2h0SnNvbiggbGFzdEhlaWdodDogbnVtYmVyICkgOiBCbG9ja0hlYWRlciB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGhlaWdodCA6IGxhc3RIZWlnaHQsXG4gICAgICBpZCA6ICdOVUxMJyxcbiAgICAgIGRlbGVnYXRlIDogJ05VTEwnXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFwcGVuZEJsb2NrKCBibG9jayA6IEJsb2NrSGVhZGVyLCBjaGFuZ2VzOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4gKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFibG9jayB8fCAhYmxvY2suaWQgfHwgIWJsb2NrLmRlbGVnYXRlIHx8IGJsb2NrLmhlaWdodCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGJsb2NrIGRhdGFgKVxuXG4gICAgYXdhaXQgdGhpcy5oaXN0b3J5RGIucHV0KGJsb2NrLmhlaWdodCwgY2hhbmdlcylcbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogYmxvY2suaGVpZ2h0LCB2YWx1ZTogYmxvY2sgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHRoaXMuZ2V0TGFzdEhlaWdodEpzb24oYmxvY2suaGVpZ2h0KSB9XG4gICBdKVxuXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYmxvY2suaGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2soIGhlaWdodCA6IG51bWJlciApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5ibG9ja0RiLmdldDxCbG9ja0hlYWRlcj4oaGVpZ2h0KVxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRIaXN0b3J5Q2hhbmdlcyggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodDogbnVtYmVyICkgOiBQcm9taXNlPE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0OyBoIDwgbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzID0gYXdhaXQgdGhpcy5oaXN0b3J5RGIuZ2V0PEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oaClcbiAgICAgIGNoYW5nZXMgJiYgcmV0LnNldCggaCwgY2hhbmdlcyApXG4gICAgfVxuICAgIHJldHVybiByZXQgXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBkZWxldGVMYXN0QmxvY2soIGhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGhlaWdodCAhPT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbGFzdCBibG9jayBoZWlnaHQgJyR7aGVpZ2h0fSdgKVxuXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RiLmJhdGNoKFtcbiAgICAgIHsgdHlwZTogJ2RlbCcsIGtleSA6IGhlaWdodCB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbiggaGVpZ2h0IC0gMSApIH0gXG4gICAgXSlcbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5kZWwoIGhlaWdodCApXG4gICAgXG4gICAgdGhpcy5sYXN0SGVpZ2h0IC0tXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrSGVhZGVyPj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0Qnk8QmxvY2tIZWFkZXI+KCdpZCcsIGJsb2NrSWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0OiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodCA7IGggPD0gbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrKGgpXG4gICAgICBibG9jayAmJiByZXN1bHQucHVzaCggYmxvY2shIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIEtleU9iamVjdCwgQ29kZUNvbnRyYWN0IGFzIERCQywgcGFydGlhbCwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSB7IG5ldygpIDogVCB9XG5leHBvcnQgdHlwZSBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gPSBzdHJpbmcgfCBDb25zdHJ1Y3RvcjxURW50aXR5PlxuXG5leHBvcnQgZW51bSBGaWVsZFR5cGVzIHtcbiAgU3RyaW5nICAgPSAnU3RyaW5nJyxcbiAgTnVtYmVyICAgPSAnTnVtYmVyJyxcbiAgQmlnSW50ICAgPSAnQmlnSW50JyxcbiAgVGV4dCAgICAgPSAnVGV4dCdcbn1cblxuZXhwb3J0IHR5cGUgRmllbGRUeXBlID0gc3RyaW5nIHwgRmllbGRUeXBlc1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBwcmltYXJ5X2tleT8gOiBib29sZWFuLFxuICBjb21wb3NpdGVfa2V5PyA6IGJvb2xlYW4sXG4gIGRlZmF1bHQ/OiBudW1iZXJ8c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWEge1xuICB0YWJsZT8gOiBzdHJpbmcsXG4gIG1lbW9yeT8gOiBib29sZWFuLFxuICByZWFkb25seT8gOiBib29sZWFuLFxuICBsb2NhbD8gOiBib29sZWFuLFxuICB0YWJsZUZpZWxkcyA6IEFycmF5PEZpZWxkPlxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlS2V5IGltcGxlbWVudHMgS2V5T2JqZWN0IHtcbiAgcHJpdmF0ZSBrZXlPYmplY3QgOiBKc29uT2JqZWN0XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBrZXlPYmplY3QgOiBKc29uT2JqZWN0ICkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleU9iamVjdCcsICgpID0+IERCQy5ub3ROdWxsKGtleU9iamVjdCkpXG5cbiAgICB0aGlzLmtleU9iamVjdCA9IGtleU9iamVjdFxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYWtlPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBURW50aXR5ICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsICgpID0+IERCQy5ub3ROdWxsKHNjaGVtYSkpXG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgc2NoZW1hLmlzQ29tcHNpdGVLZXksICdtb2RlbCBtdXN0IGluZGVudGlmeSBieSBjb21wb3NpdGUga2V5JylcbiAgICBEQkMuYXJndW1lbnQoICdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoIHBhcnRpYWwoZW50aXR5LCAuLi5zY2hlbWEuY29tcG9zaXRlS2V5cykgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKCBrZXlKc29uU3RyaW5nOiBzdHJpbmcgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5SnNvblN0cmluZycsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGtleUpzb25TdHJpbmcpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoSlNPTi5wYXJzZSgga2V5SnNvblN0cmluZyApLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5SnNvbigpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMua2V5T2JqZWN0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9zaXRlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoISBrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleS5rZXlKc29uXG59XG5cbmV4cG9ydCBjbGFzcyBNb2RlbFNjaGVtYSB7XG4gIHByaXZhdGUgc2NoZW1hOiBTY2hlbWFcbiAgcHJpdmF0ZSBuYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBtZW1vcnk6IGJvb2xlYW5cbiAgcHJpdmF0ZSByZWFkb25seTogYm9vbGVhblxuICBwcml2YXRlIGxvY2FsOiBib29sZWFuXG5cbiAgcHJpdmF0ZSBwS2V5OiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+XG4gIHByaXZhdGUgY0tleXM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZHM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZFR5cGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG4gIHByaXZhdGUgYWxsSW5kZXhlczogQXJyYXk8c3RyaW5nPlxuXG4gIGNvbnN0cnVjdG9yKHNjaGVtYTogU2NoZW1hLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNjaGVtYSA9IE9iamVjdC5hc3NpZ24oe30gLCBzY2hlbWEpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMubWVtb3J5ID0gc2NoZW1hLm1lbW9yeSA9PT0gdHJ1ZVxuICAgIHRoaXMucmVhZG9ubHkgPSBzY2hlbWEucmVhZG9ubHkgPT09IHRydWVcbiAgICB0aGlzLmxvY2FsID0gc2NoZW1hLmxvY2FsID09PSB0cnVlXG4gICAgdGhpcy5hdHRhY2hWZXJzaW9uRmllbGQoIHRoaXMuc2NoZW1hIClcbiAgICB0aGlzLnBhcnNlRmllbGRzKClcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoVmVyc2lvbkZpZWxkKCBzY2hlbWEgOiBTY2hlbWEgKSB7XG4gICAgaWYgKCBzY2hlbWEudGFibGVGaWVsZHMuZmluZCggZiA9PiBmLm5hbWUgPT09ICdfdmVyc2lvbl8nKSApIHJldHVyblxuICAgIHNjaGVtYS50YWJsZUZpZWxkcy5wdXNoKHtcbiAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLFxuICAgICAgdHlwZTogRmllbGRUeXBlcy5OdW1iZXIsXG4gICAgICBkZWZhdWx0OiAwICAgICBcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIHR5cGVcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICFpbmNsdWRlS2V5ICYmICggdGhpcy5jS2V5cy5pbmRleE9mKGYpID49IDAgfHwgZiA9PT0gdGhpcy5wcmltYXJ5S2V5ICkgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogQXJyYXk8c3RyaW5nPlxuICBidWlsZEluc2VydCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFVwZGF0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmUgOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbn1cblxuZXhwb3J0IGNsYXNzIEpzb25TcWxCdWlsZGVyIGltcGxlbWVudHMgU3FsQnVpbGRlciB7XG5cbiAgcHJpdmF0ZSBnZXRUYWJsZU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY2hhbmdlQ2FzZS5zbmFrZUNhc2UobW9kZWxOYW1lKSArICdzJ1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmltYXJ5S2V5Q29uZGl0aW9uKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkgKCB7fSwgIGtleSApXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTY2hlbWEgKHNjaGVtYTogTW9kZWxTY2hlbWEpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgbGV0IHNxbHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpIFxuICAgIGNvbnN0IHNjaGVtYU9iamVjdCA9IE9iamVjdC5hc3NpZ24oeyB0eXBlOiAnY3JlYXRlJ30sIGRlZXBDb3B5KHNjaGVtYS5zY2hlbWFPYmplY3QpKSBcbiAgICAvLyBUT0RPOiBnZW5lcmF0ZSBjb21wb3NpdGUga2V5IHNxbFxuICAgIGxldCBzY2hlbWFTcWwgPSBKc29uU3FsLmJ1aWxkKHNjaGVtYU9iamVjdClcbiAgICBzcWxzLnB1c2goc2NoZW1hU3FsLnF1ZXJ5KVxuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBzY2hlbWEuaW5kZXhlcy5mb3JFYWNoKCBmaWVsZCA9PiB7XG4gICAgICBzcWxzLnB1c2goSnNvblNxbC5idWlsZCh7XG4gICAgICAgIHR5cGU6ICdpbmRleCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIG5hbWU6IHRhYmxlTmFtZSArICdfJyArIGZpZWxkLFxuICAgICAgICBpbmRleE9uOiBmaWVsZFxuICAgICAgfSkucXVlcnkpXG4gICAgfSlcblxuICAgIHJldHVybiBzcWxzXG4gIH1cblxuICBwdWJsaWMgYnVpbGRJbnNlcnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkluc2VydCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdpbnNlcnQnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgdmFsdWVzOiBmaWVsZFZhbHVlc1xuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkRlbGV0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICBjb25kaXRpb246IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFVwZGF0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpOiBTcWxBbmRQYXJhbWV0ZXJzIHsgICAgXG4gICAgLy8gY29uc3QgbW9kaWZpZXIgPSB0aGlzLmVzY2FwZVNpbmdsZVF1b3RlKGZpZWxkVmFsdWVzKVxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG5cbiAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbmRpdGlvblsnX3ZlcnNpb25fJ10gPSB2ZXJzaW9uICBcblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5VcGRhdGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIG1vZGlmaWVyOiBmaWVsZFZhbHVlcyxcbiAgICAgIGNvbmRpdGlvbjogY29uZGl0aW9uXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTZWxlY3Qoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzT3JQYXJhbXM6IEFycmF5PHN0cmluZz4gfCBKc29uT2JqZWN0LCB3aGVyZT8gOiBTcWxDb25kaXRpb24sIFxuICAgIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKTogU3FsQW5kUGFyYW1ldGVycyB7XG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIFxuICAgIGxldCBxdWVyeU9wdGlvbnMgOiBKc29uT2JqZWN0XG4gICAgaWYgKCAhaXNBcnJheSggZmllbGRzT3JQYXJhbXMgKSApIHtcbiAgICAgIGxldCBwYXJhbXMgPSBmaWVsZHNPclBhcmFtcyBhcyBKc29uT2JqZWN0XG4gICAgICBxdWVyeU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7IHR5cGU6ICdzZWxlY3QnLCB0YWJsZTogdGFibGVOYW1lIH0sIHBhcmFtcyApXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGZpZWxkcyA9IGZpZWxkc09yUGFyYW1zIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG4gICAgICBsZXQgbG8gOiBMaW1pdEFuZE9mZnNldCA9IGlzTnVtYmVyKCByZXN1bHRSYW5nZSApID8gIHsgbGltaXQgOiByZXN1bHRSYW5nZSB9IDogcmVzdWx0UmFuZ2UgfHwgeyB9XG4gICAgICBsZXQgb3JkZXIgPSBzb3J0IHx8IHt9XG4gICAgICBmb3IgKCBsZXQga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhvcmRlcikgICkge1xuICAgICAgICBsZXQgb3JkZXJWYWx1ZSA9IG9yZGVyW2tleV0gfHwgLTFcbiAgICAgICAgb3JkZXJba2V5XSA9IChvcmRlclZhbHVlID09PSAnQVNDJykgPyAxIDogKCAob3JkZXJWYWx1ZSA9PT0gJ0RFU0MnKSA/IC0xIDogb3JkZXJWYWx1ZSApXG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIGZpZWxkczogZmllbGRzLFxuICAgICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgICBsaW1pdDogbG8ubGltaXQsXG4gICAgICAgIG9mZnNldDogbG8ub2Zmc2V0LFxuICAgICAgICBzb3J0OiBvcmRlcixcbiAgICAgICAgam9pbjogam9pblxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuU2VsZWN0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZChxdWVyeU9wdGlvbnMpKVxuICB9XG59IiwiaW1wb3J0IHsgU3FsaXRlV3JhcHBlciB9IGZyb20gJy4vU3FsaXRlV3JhcHBlcidcbmltcG9ydCB7IE1VTFRJX1NRTF9TRVBBUkFUT1IsIFNxbEFuZFBhcmFtZXRlcnMsIFNxbFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24sIENvbm5lY3Rpb25PcHRpb25zLCBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5cblxuY2xhc3MgU3FsaXRlVHJhbnNhY3Rpb24gaW1wbGVtZW50cyBEQlRyYW5zYWN0aW9uIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbW1pdCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ0NPTU1JVDsnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0s7JykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OOycpXG4gICAgcmV0dXJuIG5ldyBTcWxpdGVUcmFuc2FjdGlvbih0aGlzKVxuICB9XG59IiwiaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nTWFuYWdlciwgTG9nZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgU3FsUGFyYW1ldGVycywgU3FsQW5kUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcblxuaW1wb3J0ICogYXMgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnXG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVXcmFwcGVyIHtcbiAgcHJpdmF0ZSBkYiA6IERhdGFiYXNlXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU3FsaXRlV3JhcHBlci5uYW1lKVxuICB9XG5cbiAgcHVibGljIG9wZW4oZGJGaWxlUGF0aDogc3RyaW5nLCBjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiRmlsZVBhdGgpXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAgKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRiLm9wZW4gfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luT3BlbihkYkZpbGVQYXRoOiBzdHJpbmcpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLm9wZW4pLmNhbGwodGhpcywgZGJGaWxlUGF0aClcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRoaXMuZGIgJiYgdGhpcy5pc0Nvbm5lY3RlZCApIHtcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpIFxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIGNsb3NlYCApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgY2xvc2VkIGFscmVhZHlgKVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBjbG9zZWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIGVmZmVjdGVkID0gJHtyZXQucmVzdWx0LnJvd3NFZmZlY3RlZH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxhbnk+PiApIDogQXJyYXk8YW55PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PGFueT4oKSB9XG4gICAgdHJ5IHtcbiAgICAgIHJldC5yZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5hbGwocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShzcWwhLnBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCByZXQuZXJyLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEVudGl0eUtleSwgQ29kZUNvbnRyYWN0IGFzIERCQywgTWF5YmVVbmRlZmluZWQsIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTGV2ZWxCbG9jayB9IGZyb20gJy4vTGV2ZWxCbG9jaydcbmltcG9ydCB7IERiU2Vzc2lvbiB9IGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsaXRlQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yLCBpc0NvbXBvc2l0ZUtleSB9IGZyb20gJy4vTW9kZWwnO1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IEVudGl0eVByb3h5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBCbG9ja0hlYWRlciwgQmxvY2ssIFRyYW5zYWN0aW9uIH0gZnJvbSAnLi9CbG9jaydcbmltcG9ydCB7IEJsb2NrQ2FjaGUgfSBmcm9tICcuL0Jsb2NrQ2FjaGUnXG5cbnR5cGUgTmFtZWRIb29rPFRGdW5jPiA9IHsgbmFtZTogc3RyaW5nLCBob29rIDogVEZ1bmMgfVxuZXhwb3J0IHR5cGUgQ29tbWl0QmxvY2tIb29rID0gKCBibG9jayA6IEJsb2NrICkgPT4gdm9pZFxuZXhwb3J0IHR5cGUgUm9sbGJhY2tCbG9ja0hvb2sgPSAoIGZyb21IZWlnaHQgOiBudW1iZXIsIHRvSGVpZ2h0IDogbnVtYmVyICkgPT4gdm9pZFxuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBjYWNoZWQgbGFzdCBibG9jayBjb3VudCBcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGNhY2hlZEJsb2NrQ291bnQ/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCA1MDAwIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGhvbGRMb2NrcyA6IFNldDxzdHJpbmc+XG4gIHByaXZhdGUgY29tbWl0QmxvY2tIb29rczogQXJyYXk8TmFtZWRIb29rPENvbW1pdEJsb2NrSG9vaz4+XG4gIHByaXZhdGUgcm9sbGJhY2tCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Um9sbGJhY2tCbG9ja0hvb2s+PlxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLmhvbGRMb2NrcyA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxDb21taXRCbG9ja0hvb2s+PigpXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MgPSBuZXcgQXJyYXk8TmFtZWRIb29rPFJvbGxiYWNrQmxvY2tIb29rPj4oKVxuICAgIHRoaXMuc2NoZW1hcyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU21hcnREQi5uYW1lKVxuICAgIHRoaXMuYmxvY2tEQiA9IG5ldyBMZXZlbEJsb2NrKGxldmVsQmxvY2tEaXIpXG4gICAgdGhpcy5jYWNoZWRCbG9ja3MgPSBuZXcgQmxvY2tDYWNoZSggdGhpcy5vcHRpb25zLmNhY2hlZEJsb2NrQ291bnQhIClcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBuZXcgU3FsaXRlQ29ubmVjdGlvbih7IHN0b3JhZ2U6IGRiUGF0aCB9KVxuICAgIHRoaXMuYmxvY2tTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdCbG9jaycpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0xvY2FsJylcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiAsIHRocm93SWZVbmRlZmluZWQgPSBmYWxzZSwgdGhyb3dJZlJlYWRvbmx5ID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TW9kZWxTY2hlbWE+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBpc1N0cmluZyggbW9kZWwgKSA/IFN0cmluZyhtb2RlbCkgOiAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkubmFtZSBcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5zY2hlbWFzLmdldChtb2RlbE5hbWUpIFxuICAgIHRocm93SWZVbmRlZmluZWQgJiYgREJDLnZlcmlmeSggc2NoZW1hICE9PSB1bmRlZmluZWQsIGB1bnJlZ2lzdGVyZWQgbW9kZWwgJyR7IG1vZGVsTmFtZSB9J2ApXG4gICAgdGhyb3dJZlJlYWRvbmx5ICYmIERCQy52ZXJpZnkoICFzY2hlbWEhLmlzUmVhZG9ubHksIGBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nIGlzIHJlYWRvbmx5YClcblxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2Vzc2lvbjxURW50aXR5Piggc2NoZW1hIDogTW9kZWxTY2hlbWEgKSA6IERiU2Vzc2lvbiB7IFxuICAgIHJldHVybiBzY2hlbWEhLmlzTG9jYWwgPyB0aGlzLmxvY2FsU2Vzc2lvbiA6IHRoaXMuYmxvY2tTZXNzaW9uXG4gIH1cblxuICBwcml2YXRlIHByZUNvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGJsb2NrICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Q29tbWl0QmxvY2soIGJsb2NrOiBCbG9jayApIHtcbiAgICB0aGlzLmVtaXQoJ25ld0Jsb2NrJywgYmxvY2spXG4gIH1cblxuICBwcml2YXRlIHByZVJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGZyb20sIHRvICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Um9sbGJhY2tCbG9jayggZnJvbSA6IG51bWJlciwgdG8gOiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbWl0KCdyb2xsYmFja0Jsb2NrJywgeyBmcm9tLCB0byB9IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciBjb21taXQgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGJsb2NrICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyQ29tbWl0QmxvY2tIb29rKCBuYW1lOiBzdHJpbmcsIGhvb2tGdW5jOiBDb21taXRCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcbiAgICBcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2sgOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kSW5kZXgoIG5oID0+IG5oLm5hbWUgPT09IG5hbWUudHJpbSgpIClcbiAgICBpZiAoIGluZGV4ID49IDAgKSB0aGlzLmNvbW1pdEJsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciByb2xsYmFjayBibG9jayBob29rLCB3aGljaCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgY29tbWl0IGJsb2NrXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKiBAcGFyYW0gaG9va0Z1bmMgaG9vayBmdW5jdGlvbiAsICggZnJvbUhlaWdodCwgdG9IZWlnaHQgKSA9PiB2b2lkXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogUm9sbGJhY2tCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZChuaD0+bmgubmFtZSA9PT0gbmFtZS50cmltKCkpID09PSB1bmRlZmluZWQsIFxuICAgICAgYGhvb2sgbmFtZWQgJyR7bmFtZX0nIGV4aXN0IGFscmVhZHlgKVxuXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2s6IGhvb2tGdW5jIH0pXG4gIH1cblxuICAvKipcbiAgICogdW5yZWdpc3RlciByb2xsYmFjayBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgIFxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBmb3IoIGNvbnN0IHNjaGVtYSBvZiBzY2hlbWFzICkge1xuICAgICAgdGhpcy5zY2hlbWFzLnNldCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hIClcbiAgICAgIGxldCBzZXNzaW9uID0gdGhpcy5nZXRTZXNzaW9uKCBzY2hlbWEgKVxuXG4gICAgICBzZXNzaW9uLnJlZ2lzdGVyU2NoZW1hKHNjaGVtYSlcbiAgICAgIHNlc3Npb24uc3luY1NjaGVtYShzY2hlbWEpXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBzeW5jIHNjaGVtYSBtb2RlbCA9ICR7c2NoZW1hLm1vZGVsTmFtZX0gYClcblxuICAgICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICkgeyBcbiAgICAgICAgbGV0IGl0ZW1zID0gYXdhaXQgc2Vzc2lvbi5nZXRNYW55KCBzY2hlbWEubW9kZWxOYW1lLCB7fSwgZmFsc2UsIHRydWUgKVxuICAgICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBtb2RlbCAke3NjaGVtYS5tb2RlbE5hbWV9IGNhY2hlZCAke2l0ZW1zLmxlbmd0aH0gZW50aXRpZXMgYClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5lbWl0KCAncmVhZHknLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmcmVlIHJlc291cmNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5jbG9zZSgpXG4gICAgXG4gICAgdGhpcy5lbWl0KCdjbG9zZWQnLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBoZWlnaHQgb2YgbGFzdCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tEQi5sYXN0QmxvY2tIZWlnaHRcbiAgfVxuXG4gIC8qKlxuICAgKiBibG9ja3MgY291bnRcbiAgICovXG4gIHB1YmxpYyBnZXQgYmxvY2tzQ291bnQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMVxuICB9XG5cbiAgLyoqXG4gICAqIGxhc3QgY29tbWl0ZWQgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrKCkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIC8vIFRPRE86IHJldHVybiBsYXN0IGJsb2NrIGNvcHkgP1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgfVxuXG4gIC8qKlxuICAgKiBob2xkIGEgbG9jayBuYW1lIHdoaWNoIG9ubHkgc3VjY2VlZCBpbiBmaXJzdCB0aW1lIG9mIGVhY2ggYmxvY2suXG4gICAqIEBwYXJhbSBsb2NrTmFtZSBsb2NrIG5hbWVcbiAgICogQHBhcmFtIG5vdFRocm93IGRvIG5vdCB0aHJvdyBleGNlcHRpb24gaWYgbG9jayBmYWlsZWRcbiAgICovXG4gIHB1YmxpYyBsb2NrSW5DdXJyZW50QmxvY2soIGxvY2tOYW1lOiBzdHJpbmcsIG5vdFRocm93ID0gZmFsc2UgKSA6IGJvb2xlYW4ge1xuICAgIGlmICggIXRoaXMuaG9sZExvY2tzLmhhcyggbG9ja05hbWUgKSApIHtcbiAgICAgIHRoaXMuaG9sZExvY2tzLmFkZCggbG9ja05hbWUgKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoICFub3RUaHJvdyApIHRocm93IG5ldyBFcnJvcihgJHtsb2NrTmFtZX0gZXhpc3RzIGFscmVhZHlgKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsIGJsb2NrLmhlaWdodCA9PT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxLCBgaW52YWxpZCBibG9jayBoZWlnaHQgJHtibG9jay5oZWlnaHR9LCBsYXN0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIFxuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGJsb2NrIGhlaWdodCA9ICR7YmxvY2suaGVpZ2h0fWApXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHR9YClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlQ29tbWl0QmxvY2soIHRoaXMuY3VycmVudEJsb2NrIClcblxuICAgIGxldCBibG9ja0hlYWRlciA9IE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShibG9ja0hlYWRlciwgJ3RyYW5zYWN0aW9ucycpXG4gICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmFwcGVuZEJsb2NrKCBibG9ja0hlYWRlciwgdGhpcy5ibG9ja1Nlc3Npb24uZ2V0Q2hhbmdlcygpIClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uc2F2ZUNoYW5nZXMoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCApXG4gICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5Rm9yUm9sbGJhY2shIClcbiAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLnB1dCggdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RDb21taXRCbG9jayggdGhpcy5sYXN0QmxvY2shIClcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7IFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGNvbW1pdEJsb2NrICggaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgZnJvbUhlaWdodCA9IHRoaXMuY3VycmVudEJsb2NrID8gdGhpcy5jdXJyZW50QmxvY2shLmhlaWdodCA6IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgdG9IZWlnaHQgPSBoZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGFzdEJsb2NrSGVpZ2h0IDogaGVpZ2h0XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlUm9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0IClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIClcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIHRvSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+IHRvSGVpZ2h0ICkge1xuICAgICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLmV2aXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0LCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdFJvbGxiYWNrQmxvY2soIGZyb21IZWlnaHQsICB0b0hlaWdodCApICAgICAgXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+IDAsIGBzZXJpYWwgbXVzdCBncmVhdCB0aGFuIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgZW50aXR5IGtleVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRFbnRpdHlLZXk8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlLZXk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG4gICAgXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwsIHRydWUpIVxuICAgIHJldHVybiBzY2hlbWEuZ2V0S2V5KCBlbnRpdHkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0cmFja2luZyBlbnRpdHkgYnkga2V5IFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCkgPT4gREJDLm5vdE51bGwoa2V5KSApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmF0dGFjaCggc2NoZW1hLCBrZXkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIG5ldyBlbnRpdHkgd2hpY2ggY2hhbmdlIHdpbGwgYmUgdHJhY2tlZCBhbmQgcGVyc2lzdGVudGVkIChieSBzYXZlQ2hhbmdlcykgYXV0b21hdGljYWxseVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5IHdoaWNoIHVuaXF1ZWQgaW4gZGF0YWJhc2VcbiAgICogQHBhcmFtIGVudGl0eSBwcm90b3R5cGUgZW50aXR5IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBjb3B5IHRvIHJlc3VsdCBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tpbmcgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5T3JFbnRpdHk6IEVudGl0eUtleSB8IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5T3JFbnRpdHknLCAoKT0+IERCQy5ub3ROdWxsKGtleU9yRW50aXR5KSlcbiAgICBcbiAgICBsZXQga2V5IDogRW50aXR5S2V5XG4gICAgbGV0IGVudGl0eTogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG5cbiAgICBpZiAoIGlzUHJpbWl0aXZlS2V5KCBrZXlPckVudGl0eSApIHx8IGlzQ29tcG9zaXRlS2V5KCBrZXlPckVudGl0eSApICkgeyBcbiAgICAgIGtleSA9IGtleU9yRW50aXR5IGFzIEVudGl0eUtleSBcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbnRpdHkgPSBrZXlPckVudGl0eSBhcyBURW50aXR5XG4gICAgICBrZXkgPSBzY2hlbWEuZ2V0S2V5KGVudGl0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSB0cmFja2luZyBlbnRpdHlgIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbilcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcblxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZ2V0IGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRNYW55KG1vZGVsLCBjb25kaXRpb24sIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgb25seVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWRDYWNoZWQobW9kZWwsIGtleSwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGFsbCBjYWNoZWQgZW50aXRpZXNcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+LCAgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0QWxsQ2FjaGVkKCBtb2RlbCwgZmlsdGVyLCB0cmFjayApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHJlc3VsdFJhbmdlIGxpbWl0IGFuZCBvZmZzZXQgb2YgcmVzdWx0cyBudW1iZXIgb3IganNvbiwgZWc6IDEwIG9yIHsgbGltaXQgOiAxMCwgb2Zmc2V0IDogMSB9IFxuICAgKiBAcGFyYW0gc29ydCBqc29uIHsgZmllbGROYW1lIDogJ0FTQycgfCAnREVTQycgfSAsIGVnOiB7IG5hbWUgOiAnQVNDJywgYWdlIDogJ0RFU0MnIH1cbiAgICogQHBhcmFtIGZpZWxkcyByZXN1bHQgZmllbGRzLCBkZWZhdWx0IGlzIGFsbCBmaWVsZHNcbiAgICogQHBhcmFtIG9mZnNldCBvZmZzZXQgb2YgcmVzdWx0IHNldCAgXG4gICAqIEBwYXJhbSBqb2luIGpvaW4gaW5mbyBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgXG4gICAgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeShtb2RlbCwgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgZmllbGRzLCBqb2luKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZE9uZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGxldCBpdGVtcyA9IGF3YWl0IHRoaXMuZmluZEFsbCggbW9kZWwsIHBhcmFtcyApXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBwYXJhbXMgPSAnJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfScgKWApXG4gICAgXG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGl0ZW1zWzBdXG4gIH1cblxuICAgIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHBhcmFtcyBtYW5nbyBsaWtlIHF1ZXJ5IHBhcmFtcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeUJ5SnNvbiggbW9kZWwsIHBhcmFtcyApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBxdWVyeSBpZiBleGlzdHMgcmVjb3JkIGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZXhpc3RzKG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICAvKipcbiAgICogY291bnQgcmVjb3JkcyBjb3VudCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jb3VudChtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tzIDogQXJyYXk8QmxvY2tIZWFkZXI+LCAgZ2V0VHJhbnNhY3Rpb25zOiAoKSA9PiBQcm9taXNlPEFycmF5PFRyYW5zYWN0aW9uPj4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgbGV0IHRyYW5zR3JvdXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8VHJhbnNhY3Rpb24+PigpXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IGdldFRyYW5zYWN0aW9ucygpXG5cbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCggdCA9PiB7XG4gICAgICBpZiAoIXRyYW5zR3JvdXAuaGFzKCB0LmJsb2NrSWQgKSkgdHJhbnNHcm91cC5zZXQoIHQuYmxvY2tJZCwgbmV3IEFycmF5PFRyYW5zYWN0aW9uPigpIClcbiAgICAgIHRyYW5zR3JvdXAuZ2V0KCB0LmJsb2NrSWQgKSEucHVzaCggdCApXG4gICAgfSApXG5cbiAgICBibG9ja3MuZm9yRWFjaCggYiA9PiBiWyd0cmFuc2FjdGlvbnMnXSA9IHRyYW5zR3JvdXAuZ2V0KGIuaWQhKSApXG4gICAgcmV0dXJuIGJsb2NrcyBhcyBBcnJheTxCbG9jaz5cbiAgfVxuXG4gIHByaXZhdGUgY29weUNhY2hlZEJsb2NrKCBnZXRDYWNoZUJsb2NrIDogKCkgPT4gTWF5YmVVbmRlZmluZWQ8QmxvY2s+LCB3aXRoVHJhbnNhY3Rpb25zIDogYm9vbGVhbiApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSBnZXRDYWNoZUJsb2NrKClcbiAgICBpZiAoIGNhY2hlZEJsb2NrID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgbGV0IHJlc3VsdCA9IE9iamVjdC5hc3NpZ24oe30sIGNhY2hlZEJsb2NrKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSB7XG4gICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KCByZXN1bHQsICd0cmFuc2FjdGlvbnMnKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBoZWlnaHRcbiAgICogQHBhcmFtIGhlaWdodCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SGVpZ2h0KCBoZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgaGVpZ2h0ID49IDAgLCAnaGVpZ2h0IG11c3QgZ3JlYXQgb3IgZXF1YWwgemVybycpXG4gICAgXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldChoZWlnaHQpLCB3aXRoVHJhbnNhY3Rpb25zIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2soIGhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBibG9jayBpZFxuICAgKiBAcGFyYW0gYmxvY2tJZCBibG9jayBpZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWQnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGJsb2NrSWQpKVxuXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jb3B5Q2FjaGVkQmxvY2soICgpID0+IHRoaXMuY2FjaGVkQmxvY2tzLmdldEJ5SWQoYmxvY2tJZCksIHdpdGhUcmFuc2FjdGlvbnMgKVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9ja0J5SWQoIGJsb2NrSWQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGhlaWdodCByYW5nZVxuICAgKiBAcGFyYW0gbWluSGVpZ2h0IG1pbiBoZWlnaHQoaW5jbHVkZWQpXG4gICAqIEBwYXJhbSBtYXhIZWlnaHQgbWF4IGhlaWdodChpbmNsdWRlZClcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQgOiBudW1iZXIsIG1heEhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnbWluSGVpZ2h0LCBtYXhIZWlnaHQnLCBtaW5IZWlnaHQgPj0gMCAmJiBtYXhIZWlnaHQgPj0gbWluSGVpZ2h0LCAnbWluSGVpZ2h0IG9yIG1heEhlaWdodCBpcyBpbnZhbGlkJylcbiAgIFxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0LCBtYXhIZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXJzIGJ5IGJsb2NrIGlkIGFycmF5XG4gICAqIEBwYXJhbSBibG9ja0lkcyBhcnJheSBvZiBibG9jayBpZFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4sIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWRzJywgKCkgPT4gREJDLm5vdE51bGwoYmxvY2tJZHMpIClcblxuICAgIC8vIFRPRE86IG9idGFpbiBibG9ja3MgZnJvbSBjYWNoZVxuICAgIGxldCBibG9ja0hlYWRlcnMgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tzQnlJZHMoYmxvY2tJZHMpXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyApIHJldHVybiBibG9ja0hlYWRlcnMgYXMgQXJyYXk8QmxvY2s+XG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrSGVhZGVycyAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogeyAkaW4gOiBibG9ja0hlYWRlcnMubWFwKCBiID0+IGIuaWQhICkgfSB9KSApXG4gIH1cbn0iLCJpbXBvcnQgeyBFbnRpdHksICBOdWxsYWJsZSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hIH0gZnJvbSAnLi4vTW9kZWwnXG5pbXBvcnQgeyBFbnRpdHlUcmFja2VyLCBQcm94aWVkRW50aXR5VHJhY2tlciB9IGZyb20gJy4vRW50aXR5VHJhY2tlcidcblxuLyoqICAgICBcbiAqICAgICBTVEFURSBUUkFOU0ZFUiAgICAgICAgICAgICAgICAgIEFDVElPTiAgICAgICAgICAgICAgICBUUkFDSyAgICAgIENBQ0hFXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgICAgID8gICAgICAgICAtPiBwZXJzaXRlbnQgICAgICBzZXNzaW9uLmxvYWQgICAgICAgICAgICAgdHJhY2sgICAgIGNhY2hlXG4gKiAgICAgID8gICAgICAgICAtPiBuZXcgICAgICAgICAgICBzZXNzaW9uLmNyZWF0ZSAgICAgICAgICAgdHJhY2sgICAgICAgLSAgXG4gKiBwZXJzaXN0ZW50ICAgICAtPiBtb2RpZmllZCAgICAgICBzZXQgcHJvcGVydHkgICAgICAgICAgICAga2VlcCAgICAgICBrZWVwIFxuICogcGVyc2lzdGVudCAgICAgLT4gZGVsZXRlZCAgICAgICAgc2Vzc2lvbi5kZWwgICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIG5ldyB8IG1vZGlmaWVkIC0+IHByZXNpc3RlbnQgICAgIHNlc3Npb24uc2F2ZUNoYW5nZXMgICAgICBrZWVwICAgICBjYWNoZXx1cGRhdGUgXG4gKiBkZWxldGVkICAgICAgICAtPiB0cmFuc2llbnQgICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAgZXZpdCAgICAgICBldml0XG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKi9cblxuZXhwb3J0IGVudW0gRW50aXR5U3RhdGUge1xuICBUcmFuc2llbnQgID0gLTEsXG4gIFBlcnNpc3RlbnQgPSAwLFxuICBcbiAgTmV3ICAgICAgICA9IDEsXG4gIE1vZGlmaWVkICAgPSAyLFxuICBEZWxldGVkICAgID0gMyxcbn1cblxuZXhwb3J0IGVudW0gRW50aXR5Q2hhbmdlVHlwZSB7XG4gIE5ldyAgICAgICA9IDEsXG4gIE1vZGlmeSAgICA9IDIsXG4gIERlbGV0ZSAgICA9IDMsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvcGVydHlDaGFuZ2Uge1xuICBuYW1lIDogc3RyaW5nXG4gIG9yaWdpbmFsIDogYW55XG4gIGN1cnJlbnQgOiBhbnlcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDaGFuZ2VzIHtcbiAgZGJWZXJzaW9uICAgICAgICAgOiBudW1iZXJcbiAgdHlwZSAgICAgICAgICAgICAgOiBFbnRpdHlDaGFuZ2VUeXBlXG4gIHByb3BlcnRpZXNDaGFuZ2VzIDogQXJyYXk8UHJvcGVydHlDaGFuZ2U+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5RXh0ZW5zaW9uIHtcbiAgX3ZlcnNpb25fICAgICAgOiBudW1iZXJcbiAgX19kZXRhY2hlZF9fICAgOiBib29sZWFuXG4gIF9fdHJhY2tpbmdfXyAgIDogYm9vbGVhblxuICBfX3NjaGVtYV9fICAgICA6IE1vZGVsU2NoZW1hXG4gIF9fdHJhY2tlcl9fICAgIDogRW50aXR5VHJhY2tlclxuICBfX3N0YXRlX18gICAgICA6IEVudGl0eVN0YXRlIFxuICBfX3RtcENoYW5nZXNfXyA6IE51bGxhYmxlPEVudGl0eUNoYW5nZXM+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJveGllZDxUPiBleHRlbmRzIEVudGl0eUV4dGVuc2lvbiB7XG4gIFxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5UHJveHkge1xuICBwcml2YXRlIHRyYWNrZXIgOiBFbnRpdHlUcmFja2VyO1xuXG4gIGNvbnN0cnVjdG9yKHRyYWNrZXI6IEVudGl0eVRyYWNrZXIpIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRXh0ZW5kZWQoZW50aXR5OiBFbnRpdHkpIHtcbiAgICByZXR1cm4gZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3NjaGVtYV9fJykgJiYgZW50aXR5Lmhhc093blByb3BlcnR5KCdfX3N0YXRlX18nKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc1Byb3hpZWQoZW50aXR5OiBFbnRpdHkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEVudGl0eVByb3h5LmlzRXh0ZW5kZWQoZW50aXR5KVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjb252ZXJ0VG9Qcm94aWVkPFRFbnRpdHk+KGVudGl0eTogRW50aXR5KSA6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSkpIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBQcm94aWVkIEVudGl0eWApXG4gICAgXG4gICAgcmV0dXJuIGVudGl0eSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHByb3h5VG9FbnRpdHkocHJveGllZDogUHJveGllZDxFbnRpdHk+KTogRW50aXR5IHtcbiAgICBsZXQgZW50aXR5ID0ge31cbiAgICBmb3IoIGxldCBrIGluIHByb3hpZWQgKSB7XG4gICAgICBpZiAoIEVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoaykgKSBlbnRpdHlba10gPSBwcm94aWVkW2tdXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNOb3JtYWxQcm9wZXJ0eShwcm9wZXJ0eU5hbWUgOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gKCBwcm9wZXJ0eU5hbWUubGVuZ3RoIDw9IDQgKSB8fCBcbiAgICAgICggcHJvcGVydHlOYW1lWzBdICE9PSBwcm9wZXJ0eU5hbWVbMV0gKSB8fCAoIHByb3BlcnR5TmFtZVswXSAhPT0gJ18nICkgfHxcbiAgICAgICggIXByb3BlcnR5TmFtZS5lbmRzV2l0aCgnX18nKSApIFxuICB9XG5cbiAgcHJvdGVjdGVkIGF0dGFjaEV4dGVuZFByb3BlcnRpZXM8VEVudGl0eT4oZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBzdGF0ZTogRW50aXR5U3RhdGUgKSA6IFRFbnRpdHkge1xuICAgIGxldCByZXN1bHQgPSAgT2JqZWN0LmFzc2lnbih7XG4gICAgICBfdmVyc2lvbl8gICAgICA6IDEsXG4gICAgICBfX2RldGFjaGVkX18gICA6IGZhbHNlLFxuICAgICAgX19zdGF0ZV9fICAgICAgOiBzdGF0ZSxcbiAgICAgIF9fc2NoZW1hX18gICAgIDogc2NoZW1hLFxuICAgICAgX190cmFja2VyX18gICAgOiB0aGlzLnRyYWNrZXIsIFxuICAgICAgX190cmFja2luZ19fICAgOiB0cnVlLFxuICAgICAgX190bXBDaGFuZ2VzX18gOiBudWxsXG4gICAgfSwgZW50aXR5KVxuICAgIFxuICAgIHJlc3VsdC5fdmVyc2lvbl8gPSByZXN1bHQuX3ZlcnNpb25fIHx8IDFcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSwgcmVjZWl2ZXI6IGFueSkgOiBib29sZWFuIHsgICAgICBcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWUudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eU5hbWVdICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJvcGVydHkgYWZ0ZXIgZGVsZXRlZGApXG4gICAgfVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSBleHQuX19zY2hlbWFfX1xuICAgIGlmICggc2NoZW1hLmlzUmVhZG9ubHkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHJlYWRvbmx5IG1vZGVsICcke3NjaGVtYS5tb2RlbE5hbWV9J2ApXG4gICAgfVxuXG4gICAgaWYgKCBzY2hlbWEucHJpbWFyeUtleSA9PT0gbmFtZSB8fCBzY2hlbWEuY29tcG9zaXRlS2V5cy5pbmRleE9mKG5hbWUpID49IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByaW1hcnkgZmllbGQgcHJvcGVydHlgKVxuICAgIH1cblxuICAgIGlmICggZXh0Ll9fZGV0YWNoZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyKS5hdHRhY2goIHJlY2VpdmVyIGFzIFByb3hpZWQ8YW55PiApXG4gICAgICBleHQuX19kZXRhY2hlZF9fID0gZmFsc2VcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBleHQuX190bXBDaGFuZ2VzX18gPSB7ICAgICAgICBcbiAgICAgICAgdHlwZSA6IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5LCAgICAgICAgXG4gICAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyxcbiAgICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KHsgXG4gICAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgICB9XG5cbiAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgKTogUHJveGllZDxURW50aXR5PiB7XG4gICAgbGV0IGV4dGVuZGVkID0gIHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyhlbnRpdHksIHNjaGVtYSwgRW50aXR5U3RhdGUuUGVyc2lzdGVudCApXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnO1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJztcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nO1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcykgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbn1cblxuLy8gZXhwb3J0IGNsYXNzIE1vZGVsQW5kS2V5IHtcbi8vICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbW9kZWxBbmRLZXlTZXBhcmF0b3IgPSAnISMhJ1xuXG4vLyAgIHByaXZhdGUgbW9kZWxOYW1lIDogc3RyaW5nXG4vLyAgIHByaXZhdGUgZW50aXR5S2V5IDogRW50aXR5S2V5XG5cbi8vICAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkge1xuLy8gICAgIHRoaXMubW9kZWxOYW1lID0gbW9kZWxcbi8vICAgICB0aGlzLmVudGl0eUtleSA9IGtleVxuLy8gICB9XG5cbi8vICAgcHVibGljIGdldCBtb2RlbCgpIHsgcmV0dXJuIHRoaXMubW9kZWxOYW1lIH1cbi8vICAgcHVibGljIGdldCBrZXkoKSB7IHJldHVybiB0aGlzLmVudGl0eUtleSB9XG5cbi8vICAgcHVibGljIHRvU3RyaW5nKCkge1xuLy8gICAgIHJldHVybiBcbi8vICAgfVxuLy8gfVxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcblxuZXhwb3J0IHR5cGUgRW50aXR5Q2hhbmdlc0l0ZW0gPSB7IG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXksIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5cbmV4cG9ydCBjbGFzcyBQcm94aWVkRW50aXR5VHJhY2tlciBpbXBsZW1lbnRzIEVudGl0eVRyYWNrZXIgeyAgXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgcHJveHkgOiBFbnRpdHlQcm94eVxuICBwcml2YXRlIGNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBtaW5WZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY3VycmVudFZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhY2hlOiBFbnRpdHlDYWNoZSkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoUHJveGllZEVudGl0eVRyYWNrZXIubmFtZSlcbiAgICB0aGlzLnByb3h5ID0gbmV3IEVudGl0eVByb3h5KHRoaXMpXG4gICAgdGhpcy5jYWNoZSA9IGNhY2hlXG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcbiAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IC0xXG4gICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IC0xXG4gIH1cblxuICBwcm90ZWN0ZWQgZW5zdXJlTm9UcmFja2luZyggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkgKSB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgbW9kZWw9JHtzY2hlbWEubW9kZWxOYW1lfSBrZXk9JHtzY2hlbWEuZ2V0S2V5KGVudGl0eSl9IGlzIHRyYWNraW5nYClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIG1ha2VNb2RlbEFuZEtleShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IE1vZGVsQW5kS2V5IHtcbiAgICBsZXQgbWsgPSB7IG06IHNjaGVtYS5tb2RlbE5hbWUsIGs6IGtleX1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIG1rIClcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5IH0ge1xuICAgIGxldCBtayA9IEpTT04ucGFyc2UoIG1vZGVsQW5kS2V5IClcbiAgICBsZXQga2V5ID0gaXNTdHJpbmcobWsuaykgfHwgaXNOdW1iZXIobWsuaykgPyBtay5rIDogbmV3IENvbXBvc2l0ZUtleShtay5rLmtleU9iamVjdClcbiAgICByZXR1cm4geyBtb2RlbCA6IG1rLm0sIGtleToga2V5IH1cbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRIaXN0b3J5QnlWZXJzaW9uKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlICk6IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghdGhpcy5oaXN0b3J5LmhhcyhoaXN0b3J5VmVyc2lvbikgJiYgY3JlYXRlSWZOb3RFeGlzdHMgKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldChoaXN0b3J5VmVyc2lvbiwgbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKSlcblxuICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2V0KGhpc3RvcnlWZXJzaW9uKSFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRNb2RlbEFuZEtleSggcGU6IFByb3hpZWQ8YW55PiApOiBNb2RlbEFuZEtleSB7XG4gICAgcmV0dXJuIHRoaXMubWFrZU1vZGVsQW5kS2V5KHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgfVxuXG4gIHByb3RlY3RlZCBzYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMsIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKSA6IHZvaWQge1xuICAgIHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbihoaXN0b3J5VmVyc2lvbiwgdHJ1ZSkuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlcylcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSlcbiAgfVxuICBcbiAgcHVibGljIGdldExhc3RDaGFuZ2VzKCBwZTogUHJveGllZDxhbnk+ICkgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBcbiAgICAgICAgcmV0dXJuIHBlLl9fdG1wQ2hhbmdlc19fIVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4oKVxuICAgIGxldCB0bXBWZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuXG4gICAgd2hpbGUgKCB0bXBWZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uICkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odG1wVmVyc2lvbilcbiAgICAgIGhpc3RvcnkgJiYgcmVzdWx0LnB1c2goaGlzdG9yeSkgICAgICBcbiAgICAgIHRtcFZlcnNpb24tLVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRyYWNraW5nRW50aXRpZXMoKSA6IEl0ZXJhYmxlPEVudGl0eT4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMudmFsdWVzKClcbiAgfVxuXG4gIHB1YmxpYyBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXMoIHRoaXMubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIGtleSkgKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApOiBNYXliZVVuZGVmaW5lZDxQcm94aWVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIGtleSlcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkgPyB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZ2V0KHRyYWNraW5nS2V5KSBhcyBQcm94aWVkPFRFbnRpdHk+IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgdHJhY2tOZXc8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7IFxuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5TmV3KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICB9IFxuICAgIGVsc2UgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgIC8vIFRPRE86IOWFiOS/ruaUueWGjeWIoOmZpO+8jOmcgOimgeaBouWkjeWIsOS7gOS5iOeKtuaAge+8n1xuICAgICAgcHJveGllZC5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdHJhY2tQZXJzaXN0ZW50PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkge1xuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5UGVyc2lzdGVudChlbnRpdHksIHNjaGVtYSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZGVsZXRlKHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2tBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0NoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgbW9kZWxBbmRLZXkgOiB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSkgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBkZXRlY3RDaGFuZ2VzKCkgOiBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBlbnRpdHk6IHBlLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKX0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKGVudGl0eTogRW50aXR5LCBkYlZlcnNpb246IG51bWJlciwgaXNOZXcgPSB0cnVlKSA6IEVudGl0eUNoYW5nZXMge1xuICAgIGxldCBwcm9wZXJpdGVzQ2hhbmdlID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZW50aXR5KSB7XG4gICAgICBpZiAoIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoa2V5KSkgY29udGludWVcbiAgICAgIHByb3Blcml0ZXNDaGFuZ2UucHVzaCggaXNOZXcgPyBcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiB1bmRlZmluZWQsIGN1cnJlbnQ6IGVudGl0eVtrZXldIH0gOlxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IGVudGl0eVtrZXldLCBjdXJyZW50OiAgdW5kZWZpbmVkIH0gICAgICAgXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGUgOiBpc05ldyA/IEVudGl0eUNoYW5nZVR5cGUuTmV3IDogRW50aXR5Q2hhbmdlVHlwZS5EZWxldGUsXG4gICAgICBkYlZlcnNpb246IGRiVmVyc2lvbiwgICAgICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogcHJvcGVyaXRlc0NoYW5nZVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtYXJrU3RhdGVBbmRTYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogdm9pZCB7XG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTkVXIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBERUxFVEUgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBNT0RJRklFRCBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gY2hhbmdlcyA9ICR7SlNPTi5zdHJpbmdpZnkocGUuX190bXBDaGFuZ2VzX18pfWApXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgcGUuX190bXBDaGFuZ2VzX18hLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgIGJyZWFrXG4gICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZyBcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OiBcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSksIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6XG4gICAgICAgIGxldCBlID0gdGhpcy5jYWNoZS5nZXQoIG1vZGVsLCBrZXkgKVxuICAgICAgICBpZiAoIGUgPT09IHVuZGVmaW5lZCApIHJldHVyblxuICAgICAgICBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gZSFbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZSApXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOiBcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGMgPT4gYy5uYW1lLCBjID0+IGMub3JpZ2luYWwpXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlbnRpdHkgKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gZmFsc2VcbiAgICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBwZVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gdHJ1ZVxuICAgICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6XG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHJlamVjdENoYW5nZXMgVmVyc2lvbiA9ID9gKVxuICB9XG4gIFxuICBwdWJsaWMgcm9sbGJhY2tDaGFuZ2VzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5yZWplY3RDaGFuZ2VzKClcbiAgICB3aGlsZSggaGlzdG9yeVZlcnNpb24gPD0gdGhpcy5jdXJyZW50VmVyc2lvbiApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXNNYXAgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICAgIGNoYW5nZXNNYXAgJiYgY2hhbmdlc01hcC5mb3JFYWNoKCAoIGNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKSBcbiAgICAgICAgdGhpcy5yb2xsYmFja0NhY2hlQ2hhbmdlcyhtay5tb2RlbCwgbWsua2V5LCBjaGFuZ2VzKVxuICAgICAgfSlcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gLS1cbiAgICB9XG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4gcGUuX19kZXRhY2hlZF9fID0gdHJ1ZSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IE1hdGgubWluKHRoaXMubWluVmVyc2lvbiwgdGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7dGhpcy5jdXJyZW50VmVyc2lvbn1gKVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeSggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSB7XG4gICAgaWYgKCB0aGlzLm1pblZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gfHwgdGhpcy5jdXJyZW50VmVyc2lvbiA8IGhpc3RvcnlWZXJzaW9uICkgcmV0dXJuXG4gICAgZm9yKCBsZXQgdmVyID0gdGhpcy5taW5WZXJzaW9uOyB2ZXIgPCBoaXN0b3J5VmVyc2lvbjsgdmVyKysgKSB7XG4gICAgICB0aGlzLmhpc3RvcnkuZGVsZXRlKHZlcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGR1bXBDaGFuZ2VzKCBlYzogRW50aXR5Q2hhbmdlcyApOiBzdHJpbmcge1xuICAgIGxldCBwcm9wZXJ0eUNoYW5nZXMgPSAnJ1xuICAgIGVjLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2gocGMgPT4gcHJvcGVydHlDaGFuZ2VzICs9IGAke3BjLm5hbWV9OiAke3BjLm9yaWdpbmFsfSAtPiAke3BjLmN1cnJlbnR9LCBgKVxuXG4gICAgcmV0dXJuIGBkYlZlcnNpb249JHtlYy5kYlZlcnNpb259LCB0eXBlPSR7ZWMudHlwZX0sIFske3Byb3BlcnR5Q2hhbmdlc31dYFxuICB9XG5cbiAgcHVibGljIGR1bXBIaXN0b3J5KCkgOiBzdHJpbmcge1xuICAgIGxldCB2ZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgSElTVE9SWSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgd2hpbGUoIHZlcnNpb24gPj0gdGhpcy5taW5WZXJzaW9uICkge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLXZlcnNpb24gJHt2ZXJzaW9ufS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgbGV0IGhpcyA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbiggdmVyc2lvbiApXG4gICAgICBoaXMgJiYgaGlzLmZvckVhY2goICggZWMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBsZXQgY2hhbmdlcyA9IHRoaXMuZHVtcENoYW5nZXMoIGVjIClcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgICAgY29uc3QgbXNnID0gYHR5cGU9JHttay5tb2RlbH0sIGtleT0ke21rLmtleX0sIGNoYW5nZXM9eyR7Y2hhbmdlc319IFxcbmBcbiAgICAgICAgcmVzdWx0ICs9IG1zZ1xuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgICAgdmVyc2lvbi0tXG4gICAgfSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFja2VyU3FsQnVpbGRlciB7XG4gIHByaXZhdGUgdHJhY2tlcjogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlciwgbW9kZWxzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+LCBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyICkge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLm1vZGVscyA9IG1vZGVsc1xuICAgIHRoaXMuc3FsQnVpbGRlciA9IHNxbEJ1aWxkZXJcbiAgfVxuICBcbiAgcHVibGljIGdldCBlbnRpdHlUcmFja2VyKCkgeyByZXR1cm4gdGhpcy50cmFja2VyIH1cblxuICBwdWJsaWMgYnVpbGRDaGFuZ2VTcWxzKCkgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmRldGVjdENoYW5nZXMoKS5mb3JFYWNoKCBlYyA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5idWlsZFNxbEFuZFBhcmFtZXRlcnMoZWMuZW50aXR5KSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKHBlIDpQcm94aWVkPGFueT4pIDogU3FsQW5kUGFyYW1ldGVycyB7ICBcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6XG4gICAgICAgIGNvbnN0IG5ld0VudGl0eSA9IE9iamVjdC5hc3NpZ24oeyBfdmVyc2lvbl8gOiBwZS5fdmVyc2lvbl8gfSwgIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydCggcGUuX19zY2hlbWFfXywgbmV3RW50aXR5KVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6XG4gICAgICAgIGxldCBlbnRpdHlDaGFuZ2VzID0gdGhpcy50cmFja2VyLmdldExhc3RDaGFuZ2VzKHBlKSFcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdCggZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcyAsIGM9PiBjLm5hbWUsIGM9PiBjLmN1cnJlbnQgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gLSAxIClcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6XG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZW50aXR5IHN0YXRlICcke3BlLl9fc3RhdGVfX30nYClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICk6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbiApLmZvckVhY2goIGhpcyA9PiBoaXMuZm9yRWFjaCggKCBlbnRpdHlDaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgIGNvbnN0IG1rID0gdGhpcy50cmFja2VyLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtay5tb2RlbClcbiAgICAgIHN3aXRjaChlbnRpdHlDaGFuZ2VzLnR5cGUpIHtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldzpcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUoc2NoZW1hISwgbWsua2V5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OiBcbiAgICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShzY2hlbWEhLCBtay5rZXksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uICkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTpcbiAgICAgICAgICBsZXQgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KHNjaGVtYSEsIGVudGl0eSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9KSlcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxufVxuXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiZXR0ZXItc3FsaXRlM1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFuZ2UtY2FzZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbi1zcWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc2Vjb25kYXJ5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXN1YmxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxydS1jYWNoZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dGlsXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=