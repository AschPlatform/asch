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
        this.holdLocks.clear();
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
                this.holdLocks.clear();
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
                this.holdLocks.clear();
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
     * @param track track and cache result if true
     */
    getBy(model, condition, track = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('model', () => Common_1.CodeContract.notNull(model));
            Common_1.CodeContract.argument('condition', () => Common_1.CodeContract.notNull(condition));
            let schema = this.getSchema(model, true);
            let items = yield this.getSession(schema).getMany(model, condition);
            if (items.length > 1)
                throw new Error(`many entities found ( model = '${schema.modelName}' , condition = '${JSON.stringify(condition)}' )`);
            if (items.length === 0)
                return undefined;
            let entity = items[0];
            return track ? this.attach(model, this.getEntityKey(model, entity)) : entity;
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
        const trackingKey = this.makeModelAndKey(pe.__schema__, pe.__schema__.getKey(pe));
        if (this.allTrackingEntities.has(trackingKey))
            throw new Error('exists another tracked entity');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSwyQzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJhc2NoLXNtYXJ0ZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIHdhc20gbW9kdWxlc1xuIFx0dmFyIGluc3RhbGxlZFdhc21Nb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgY29tcGlsZWQgV2ViQXNzZW1ibHkuTW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL0luZGV4LnRzXCIpO1xuIiwiaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9CbG9jaydcblxuZXhwb3J0IGNsYXNzIEJsb2NrQ2FjaGUge1xuICBwcml2YXRlIGNhY2hlID0gbmV3IE1hcDxudW1iZXIsIEJsb2NrPigpXG4gIHByaXZhdGUgbWluSGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhIZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heENhY2hlZENvdW50IDogbnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhDYWNoZWRDb3VudCA6IG51bWJlciApIHtcbiAgICB0aGlzLm1heENhY2hlZENvdW50ID0gbWF4Q2FjaGVkQ291bnRcbiAgfVxuXG4gIHB1YmxpYyBpc0NhY2hlZCggaGVpZ2h0OiBudW1iZXIgKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBoZWlnaHQgPiAwICYmIGhlaWdodCA+PSB0aGlzLm1pbkhlaWdodCAmJiBoZWlnaHQgPD0gdGhpcy5tYXhIZWlnaHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY2FjaGVkSGVpZ2h0UmFuZ2UoKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbiA6IHRoaXMubWluSGVpZ2h0LCBtYXg6IHRoaXMubWF4SGVpZ2h0IH1cbiAgfVxuXG4gIHB1YmxpYyBwdXQoIGJsb2NrOiBCbG9jayApIHtcbiAgICBpZiAoICF0aGlzLmlzQ2FjaGVkKCBibG9jay5oZWlnaHQgKSAmJiB0aGlzLm1heEhlaWdodCA+PSAwICYmIGJsb2NrLmhlaWdodCAhPT0gdGhpcy5tYXhIZWlnaHQgKyAxIClcbiAgICAgIHRocm93IG5ldyBFcnJvciAoJ2ludmFsaWQgYmxvY2sgaGVpZ2h0JylcblxuICAgIHRoaXMuY2FjaGUuc2V0KCBibG9jay5oZWlnaHQsIGJsb2NrIClcbiAgICB0aGlzLm1heEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICAgIFxuICAgIGlmICggdGhpcy5jYWNoZS5zaXplID49IHRoaXMubWF4Q2FjaGVkQ291bnQgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZSggdGhpcy5taW5IZWlnaHQrKyApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCggaGVpZ2h0OiBudW1iZXIgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGhlaWdodClcbiAgfVxuXG4gIHB1YmxpYyBnZXRCeUlkKCBpZDogc3RyaW5nICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGZvciggY29uc3QgYiBvZiB0aGlzLmNhY2hlLnZhbHVlcygpICkge1xuICAgICAgaWYgKCBiLmlkISA9PT0gaWQgKSByZXR1cm4gYlxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXZpdCggZnJvbUhlaWdodDogbnVtYmVyLCB0b0hlaWdodDogbnVtYmVyICkge1xuICAgIGxldCBtaW4gPSBNYXRoLm1pbiggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGxldCBtYXggPSBNYXRoLm1heCggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGlmICggbWluID4gdGhpcy5tYXhIZWlnaHQgfHwgbWF4IDwgdGhpcy5taW5IZWlnaHQgKSByZXR1cm4gXG4gICAgXG4gICAgbWluID0gTWF0aC5tYXgoIG1pbiwgdGhpcy5taW5IZWlnaHQgKVxuICAgIG1heCA9IE1hdGgubWluKCBtYXgsIHRoaXMubWluSGVpZ2h0IClcbiAgICBmb3IgKCBsZXQgaGVpZ2h0ID0gbWluOyBoZWlnaHQgPD0gbWF4OyBoZWlnaHQrKyApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGhlaWdodClcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RMaXRlcmFsIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgdHlwZSBKc29uT2JqZWN0ID0gT2JqZWN0TGl0ZXJhbFxuZXhwb3J0IHR5cGUgRW50aXR5ID0gT2JqZWN0TGl0ZXJhbFxuXG5leHBvcnQgaW50ZXJmYWNlIEtleU9iamVjdCB7IFxuICBrZXkgOiBzdHJpbmdcbiAga2V5SnNvbiA6IEpzb25PYmplY3Rcbn1cbmV4cG9ydCB0eXBlIEVudGl0eUtleSA9IHN0cmluZyB8IG51bWJlciB8IEtleU9iamVjdFxuXG5leHBvcnQgdHlwZSBQYXJ0aWFsPFQ+ID0ge1xuICBbUCBpbiBrZXlvZiBUXT86IFRbUF1cbn1cblxuZXhwb3J0IHR5cGUgUmVhZG9ubHlQYXJ0aWFsPFQ+ID0ge1xuICByZWFkb25seSBbUCBpbiBrZXlvZiBUXTogVFtQXTtcbn1cblxuZXhwb3J0IHR5cGUgRmlsdGVyRnVuY3Rpb248VD4gPSAoIGUgOiBUICkgPT4gYm9vbGVhblxuXG5leHBvcnQgdHlwZSBLZXlWYWx1ZVBhaXIgPSB7IGtleTogc3RyaW5nLCB2YWx1ZTogYW55IH1cbmV4cG9ydCB0eXBlIENhbGxiYWNrPFRSZXN1bHQ+ID0gKCBlcnI6IEVycm9yfG51bGwsIGRhdGE6IFRSZXN1bHQgKSA9PiB2b2lkXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSnNvbk9iamVjdDxUPihpdGVyYWJsZTogSXRlcmFibGU8VD4sIGdldEtleTogKHQgOiBUKSA9PiBzdHJpbmcsIGdldFZhbHVlOiAodDogVCkgPT4gYW55ICApIDogSnNvbk9iamVjdCB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2l0ZXJhYmxlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGl0ZXJhYmxlICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldEtleScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRLZXkgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0VmFsdWUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0VmFsdWUgKSlcblxuICBsZXQgcmV0ID0ge31cbiAgZm9yIChsZXQgaXRlbSBvZiBpdGVyYWJsZSkge1xuICAgIHJldFtnZXRLZXkoaXRlbSldID0gZ2V0VmFsdWUoaXRlbSlcbiAgfVxuICByZXR1cm4gcmV0IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVlcENvcHk8VD4oc3JjIDogVCkgOiBUIHtcbiAgaWYgKCAhc3JjICkgcmV0dXJuIHNyY1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzcmMpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbDxUPiggc3JjIDogVCwgLi4ua2V5cyA6IEFycmF5PHN0cmluZz4gKTogUGFydGlhbDxUPiB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ3NyYycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBzcmMgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAna2V5cycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBrZXlzICkpXG5cbiAgbGV0IHJlc3VsdCA9ICB7IH1cbiAgZm9yICggbGV0IGsgb2YgWy4uLmtleXNdICkgcmVzdWx0W2tdID0gc3JjW2tdXG4gIHJldHVybiByZXN1bHQgYXMgUGFydGlhbDxUPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICggIWtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4gaXNTdHJpbmcoIGtleSApIHx8IGlzTnVtYmVyKCBrZXkgKVxufVxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCBtZXNzYWdlIDogc3RyaW5nICkge1xuICAgIHN1cGVyKCAnQ29kZSBjb250cmFjdCBFcnJvciwnKyBtZXNzYWdlIClcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDb250cmFjdENvbmRpdGlvbiA9IGJvb2xlYW4gfCAoICgpID0+IGJvb2xlYW4gKVxuZXhwb3J0IHR5cGUgQ29udHJhY3RNZXNzYWdlICAgPSBzdHJpbmcgIHwgKCAoKSA9PiBzdHJpbmcgKVxuXG5leHBvcnQgdHlwZSBNYXliZVVuZGVmaW5lZDxUPiA9IFQgfCB1bmRlZmluZWRcbmV4cG9ydCB0eXBlIE51bGxhYmxlPFQ+ID0gVCB8IG51bGwgfCB1bmRlZmluZWRcblxuZXhwb3J0IHR5cGUgQ29udHJhY3RWZXJpZnlSZXN1bHQgPSB7IHJlc3VsdCA6IGJvb2xlYW4sIG1lc3NhZ2U6IE51bGxhYmxlPHN0cmluZz4gfSBcbmV4cG9ydCB0eXBlIFZlcmlmeUZ1bmN0aW9uID0gKCkgPT4gQ29udHJhY3RWZXJpZnlSZXN1bHRcblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdCB7XG4gIHB1YmxpYyBzdGF0aWMgdmVyaWZ5KCBjb25kaXRpb246IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlIDogQ29udHJhY3RNZXNzYWdlICkgOiB2b2lkIHtcbiAgICBpZiAoIGNvbmRpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IGNvbmRpdGlvbiA9PT0gbnVsbCApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJpZnkgY29uZGl0aW9uJylcblxuICAgIGNvbnN0IGNvbmQgPSBpc0Z1bmN0aW9uKGNvbmRpdGlvbikgPyAoY29uZGl0aW9uIGFzIEZ1bmN0aW9uKSgpIDogY29uZGl0aW9uXG4gICAgY29uc3QgbXNnID0gaXNGdW5jdGlvbihtZXNzYWdlKSA/IChtZXNzYWdlIGFzIEZ1bmN0aW9uKSgpIDogbWVzc2FnZVxuXG4gICAgaWYgKCFjb25kKSB0aHJvdyBuZXcgQ29kZUNvbnRyYWN0RXJyb3IoIG1zZyApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFyZ3VtZW50KCBhcmdOYW1lOiBzdHJpbmcsIHZlcmlmeTogVmVyaWZ5RnVuY3Rpb24gfCBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZT8gOiBDb250cmFjdE1lc3NhZ2UgKTogdm9pZCB7XG4gICAgaWYgKCAhYXJnTmFtZSB8fCAhdmVyaWZ5ICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ05hbWUgb3IgdmVyaWZ5IGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBpZiAoICFtZXNzYWdlICkge1xuICAgICAgY29uc3QgdnIgPSAgKHZlcmlmeSBhcyBWZXJpZnlGdW5jdGlvbikoKVxuICAgICAgQ29kZUNvbnRyYWN0LnZlcmlmeSggdnIucmVzdWx0LCBgYXJndW1lbnQgJyR7YXJnTmFtZX0nICR7dnIubWVzc2FnZX1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgQ29kZUNvbnRyYWN0LnZlcmlmeSh2ZXJpZnkgYXMgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UhKSAgICBcbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsKCBhcmcgOiBhbnkgKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhcmcgIT09IG51bGwgJiYgYXJnICE9PSB1bmRlZmluZWRcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JFbXB0eSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGwoc3RyKSAmJiBzdHIgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3IgZW1wdHknXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yV2hpdGVzcGFjZSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGxPckVtcHR5KCBzdHIgKSAmJiAoIHN0ciBhcyBzdHJpbmcgKS50cmltKCkgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3Igd2hpdGVzcGFjZSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbn1cblxuXG4iLCJpbXBvcnQgeyBFbnRpdHlDYWNoZSwgTFJVRW50aXR5Q2FjaGUsIEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciB9IGZyb20gJy4vTW9kZWwnO1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBKc29uU3FsQnVpbGRlciwgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIsIE1VTFRJX1NRTF9TRVBBUkFUT1IgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBFbnRpdHksIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEZpbHRlckZ1bmN0aW9uIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBQcm94aWVkRW50aXR5VHJhY2tlciwgVHJhY2tlclNxbEJ1aWxkZXIsIEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eUV4dGVuc2lvbiB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAndXRpbCdcblxuZXhwb3J0IHR5cGUgU2F2ZUhpc3RvcnlBY3Rpb24gPSAoIHZlcnNpb246IG51bWJlciwgaGlzdG9yeTogTWFwPHN0cmluZywgRW50aXR5Q2hhbmdlcz4gKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBEYlNlc3Npb24ge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNvbm5lY3Rpb246IERiQ29ubmVjdGlvblxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc2Vzc2lvbkNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBzcWxCdWlsZGVyIDogSnNvblNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSB0cmFja2VyU3FsQnVpbGRlcjogVHJhY2tlclNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSBlbnRpdHlUcmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBzZXNzaW9uU2VyaWFsIDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uLCBjYWNoZU9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMsIHNlc3Npb25OYW1lPzogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRGJTZXNzaW9uLm5hbWUgKyAoIHNlc3Npb25OYW1lID09PSB1bmRlZmluZWQgPyAnJyA6IGBfJHtzZXNzaW9uTmFtZX1gKSAgKVxuICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IC0xXG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgIHRoaXMubW9kZWxzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUgPSBuZXcgTFJVRW50aXR5Q2FjaGUoY2FjaGVPcHRpb25zKVxuICAgIHRoaXMuc3FsQnVpbGRlciA9IG5ldyBKc29uU3FsQnVpbGRlcigpXG4gICAgdGhpcy5lbnRpdHlUcmFja2VyID0gbmV3IFByb3hpZWRFbnRpdHlUcmFja2VyKCB0aGlzLnNlc3Npb25DYWNoZSApXG4gICAgdGhpcy50cmFja2VyU3FsQnVpbGRlciA9IG5ldyBUcmFja2VyU3FsQnVpbGRlciggdGhpcy5lbnRpdHlUcmFja2VyLCB0aGlzLm1vZGVscywgdGhpcy5zcWxCdWlsZGVyIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gJiYgdGhpcy5jb25uZWN0aW9uLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgZ2V0IGVudGl0eUNhY2hlKCk6IEVudGl0eUNhY2hlIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uQ2FjaGVcbiAgfVxuXG4gIHB1YmxpYyBzeW5jU2NoZW1hKHNjaGVtYTogTW9kZWxTY2hlbWEpOiB2b2lkIHtcbiAgICB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTY2hlbWEoc2NoZW1hKS5mb3JFYWNoKCBzcWw9PiB7XG4gICAgICB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZVN5bmMoIHNxbCApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNjaGVtYSguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IHZvaWQge1xuICAgIHNjaGVtYXMuZm9yRWFjaCggcyA9PiB0aGlzLm1vZGVscy5zZXQocy5tb2RlbE5hbWUsIHMpIClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtb2RlbE5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5Q2xhc3M8VEVudGl0eT4oY2xheno6IENvbnN0cnVjdG9yPFRFbnRpdHk+KSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQoY2xhenoubmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHtjbGF6ei5uYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiApIHtcbiAgICByZXR1cm4gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWwpIDogXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5Q2xhc3MobW9kZWwpXG4gIH1cblxuICBwcm90ZWN0ZWQgbWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5KCB7fSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCB0cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgIGVudGl0aWVzIDogQXJyYXk8VEVudGl0eT4sIGNhY2hlID0gdHJ1ZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlKSApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShlKSAsIGUgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0KGNsZWFyQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuc3RvcFRyYWNrQWxsKClcbiAgICBpZiAoIGNsZWFyQ2FjaGUgKSB0aGlzLmVudGl0eUNhY2hlLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZXNldCggdHJ1ZSApXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwgZmlsdGVyICkgfHwgW11cblxuICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiB0cmFja2VkIGFzIE9iamVjdCBhcyBURW50aXR5XG5cbiAgICBsZXQgY2FjaGVkID0gdGhpcy5lbnRpdHlDYWNoZS5nZXQ8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgcmV0dXJuICggY2FjaGVkID09PSB1bmRlZmluZWQgKSA/IHVuZGVmaW5lZCA6IFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBjYWNoZWQgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEFsbDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuXG4gICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICYmIHRoaXMuZW50aXR5Q2FjaGUuZXhpc3RzTW9kZWwoc2NoZW1hLm1vZGVsTmFtZSkgKSB7XG4gICAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSApIHx8IFtdXG4gICAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldE1hbnkoIG1vZGVsLCB7IH0sIHRyYWNrIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UsIGNhY2hlID0gdHJ1ZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24pXG4gICAgXG4gICAgbGV0IGVudGl0aWVzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgaWYgKCBjYWNoZSApIGVudGl0aWVzLmZvckVhY2goIGUgPT4gdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkoZSksIGUgKSlcblxuICAgIHJldHVybiAhdHJhY2sgPyBlbnRpdGllcyA6XG4gICAgICB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnk8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPzogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGpvaW4pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5QnlKc29uPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBwYXJhbXMpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCApXG5cbiAgICBsZXQgeyBxdWVyeSAsIHBhcmFtZXRlcnN9ID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KCBzY2hlbWEsIFtdICwgY29uZGl0aW9uICkgXG4gICAgcXVlcnkgPSBgc2VsZWN0IGV4aXN0cygke3F1ZXJ5LnJlcGxhY2UoTVVMVElfU1FMX1NFUEFSQVRPUiwgJycpfSkgYXMgZXhpc3RgXG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KCBxdWVyeSwgcGFyYW1ldGVycyApXG4gICAgXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSAmJiBwYXJzZUludChyZXRbMF1bJ2V4aXN0J10pID4gMCBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHJldCA9IGF3YWl0IHRoaXMucXVlcnlCeUpzb24oIG1vZGVsLCB7IGZpZWxkcyA6ICdjb3VudCgqKSBhcyBjb3VudCcsIGNvbmRpdGlvbjogY29uZGl0aW9uIH0gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgZXhpc3RzID0gdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKHNjaGVtYS5tb2RlbE5hbWUsIGtleSkgfHwgdGhpcy5lbnRpdHlUcmFja2VyLmlzVHJhY2tpbmcoc2NoZW1hLCBrZXkpXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nICkgYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXksIHRydWUgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZSggbW9kZWxOYW1lICkhXG5cbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCApIHJldHVybiB0cmFja2VkISBhcyBPYmplY3QgYXMgVEVudGl0eVxuICAgIFxuICAgIGNvbnN0IGVudGl0eSA9IGF3YWl0IHRoaXMubG9hZEVudGl0eUJ5S2V5KCBtb2RlbE5hbWUsIGtleSApXG4gICAgaWYgKCBlbnRpdHkgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcbiAgICBcbiAgICB0aGlzLnNlc3Npb25DYWNoZS5wdXQoIG1vZGVsTmFtZSwga2V5LCBlbnRpdHkgKVxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSksIGVudGl0eSkgYXMgVEVudGl0eSAgXG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nQ2hhbmdlcygpXG4gIH1cblxuICBwdWJsaWMgbG9hZENhY2hlZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgLCB0cmFjayA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuXG4gICAgY29uc3QgcGUgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHkoIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHBlICYmIHRyYWNrICkgcmV0dXJuIHBlIGFzIEVudGl0eSBhcyBURW50aXR5XG5cbiAgICBjb25zdCBlbnRpdHkgPSB0aGlzLnNlc3Npb25DYWNoZS5nZXQ8VEVudGl0eT4obW9kZWxOYW1lLCBrZXkpXG4gICAgaWYgKCBlbnRpdHkgPT09IHVuZGVmaW5lZCB8fCAhIHRyYWNrICkgcmV0dXJuIGVudGl0eVxuXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlbnRpdHkpIGFzIFRFbnRpdHkgXG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIHNhdmVDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgc2F2ZUNoYW5nZXMoc2VyaWFsPyA6IG51bWJlcikgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHJldFNlcmlhbCA9IHNlcmlhbCB8fCArK3RoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRDaGFuZ2VTcWxzKClcbiAgICBjb25zdCB0cmFucyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5iZWdpblRyYW5zKClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVCYXRjaCggc3FscyApXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuICAgICAgXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIuYWNjZXB0Q2hhbmdlcyggcmV0U2VyaWFsICkgXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSByZXRTZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgICAgcmV0dXJuIHJldFNlcmlhbFxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJlamVjdENoYW5nZXMoKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJvbGxiYWNrIHNhdmVkIGNoYW5nZXNcbiAgICogQHBhcmFtIGNoYW5nZXNOTyAsdGhpcyB2YWx1ZSBzaG91bGQgYmUgcmV0dXJuZWQgYnkgQHNlZSBzYXZlQ2hhbmdlcygpIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQ2hhbmdlcyggc2VyaWFsOiBudW1iZXIgKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiggdGhpcy5zZXNzaW9uU2VyaWFsIDw9IHNlcmlhbCApIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcblxuICAgIGNvbnN0IGZyb20gPSB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyAoIHNlcmlhbCA9ICR7c2VyaWFsfSApYClcblxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKHNlcmlhbCArIDEpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goc3FscykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbCArIDEpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSBzZXJpYWxcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxuICBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMUlVFbnRpdHlDYWNoZSBpbXBsZW1lbnRzIEVudGl0eUNhY2hlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUlOX0NBQ0hFRF9DT1VOVCA9IDEwMFxuICBwcml2YXRlIHN0YXRpYyBERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCA9IDEwMDAwXG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBFbnRpdHlDYWNoZU9wdGlvbnNcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBtb2RlbENhY2hlcyA6IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGRlZmF1bHQgOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCB9XG4gICAgLy8gZm9yKCBsZXQgayBpbiB0aGlzLm9wdGlvbnMgKSBcbiAgICAvLyAgIHRoaXMub3B0aW9uc1trXSA9IGlzTnVtYmVyKHRoaXMub3B0aW9uc1trXSkgPyB0aGlzLm9wdGlvbnNba10gOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihMUlVFbnRpdHlDYWNoZS5uYW1lKVxuICAgIHRoaXMubW9kZWxDYWNoZXMgPSBuZXcgTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj4oKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2RlbENhY2hlKG1vZGVsTmFtZSA6IHN0cmluZywgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSwgdGhyb3dJZk5vdEV4aXN0cyA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPExSVS5DYWNoZTxFbnRpdHlLZXksIEVudGl0eT4+IHtcbiAgICBpZiAoIGNyZWF0ZUlmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSB7IFxuICAgICAgLy8gY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIC8vICAgbWF4OiA1MDAsXG4gICAgICAvLyAgIGxlbmd0aDogZnVuY3Rpb24gKG4sIGtleSkgeyByZXR1cm4gbiAqIDIgKyBrZXkubGVuZ3RoIH0sXG4gICAgICAvLyAgIC8vZGlzcG9zZTogZnVuY3Rpb24gKGtleSwgbikgeyBuLmNsb3NlKCkgfSxcbiAgICAgIC8vICAgbWF4QWdlOiAxMDAwICogNjAgKiA2MCBcbiAgICAgIC8vIH1cbiAgICAgIGxldCBtYXhDYWNoZWRDb3VudCA6IG51bWJlcjtcbiAgICAgIGlmICggIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlbE5hbWUpICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gdGhpcy5vcHRpb25zLmRlZmF1bHRcbiAgICAgIGVsc2UgaWYgKCBpc051bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pXG4gICAgICBlbHNlIGlmICggaXNGdW5jdGlvbih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkpXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gKCB0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSBhcyAobW9kZWwpPT4gbnVtYmVyICkoIG1vZGVsTmFtZSApXG4gICAgICBlbHNlIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICAgIG1heENhY2hlZENvdW50ID0gTWF0aC5tYXgoIExSVUVudGl0eUNhY2hlLk1JTl9DQUNIRURfQ09VTlQsIG1heENhY2hlZENvdW50IClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuc2V0KG1vZGVsTmFtZSwgbmV3IExSVTxzdHJpbmcsIEVudGl0eT4oIG1heENhY2hlZENvdW50ICkgKVxuICAgIH1cbiAgICAgaWYgKCB0aHJvd0lmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSBcbiAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsIGNhY2hlICggbmFtZSA9ICcke21vZGVsTmFtZX0nICkgIGRvZXMgbm90IGV4aXN0c2ApIFxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMubW9kZWxDYWNoZXMuZ2V0KG1vZGVsTmFtZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDYWNoZUtleSgga2V5OiBFbnRpdHlLZXkgKSA6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlS2V5KGtleSkgPyBrZXkgYXMgbnVtYmVyIHwgc3RyaW5nIDogKCBrZXkgYXMgS2V5T2JqZWN0ICkua2V5XG4gIH1cblxuICBwdWJsaWMgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkIHsgICAgXG4gICAgaWYgKCBpc1N0cmluZyhtb2RlbE5hbWUpICkge1xuICAgICAgdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCB0cnVlICkhLnJlc2V0KClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuZGVsZXRlKCBtb2RlbE5hbWUgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZvciAoIGxldCBjIG9mIHRoaXMubW9kZWxDYWNoZXMudmFsdWVzKCkgKSB7XG4gICAgICBjLnJlc2V0KClcbiAgICB9XG4gICAgdGhpcy5tb2RlbENhY2hlcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVscygpIDogc3RyaW5nW10ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgZm9yKCBsZXQgbSBvZiB0aGlzLm1vZGVsQ2FjaGVzLmtleXMoKSApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCBtIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG5cbiAgICByZXR1cm4gIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkgPyB1bmRlZmluZWQgOlxuICAgICAgbW9kZWxDYWNoZSEuaGFzKGNhY2hlS2V5KSA/IG1vZGVsQ2FjaGUhLmdldChjYWNoZUtleSkgYXMgVEVudGl0eSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4ge1xuICAgICAgKCFmaWx0ZXIgfHwgKGZpbHRlciAmJiBmaWx0ZXIoIGUgYXMgVEVudGl0eSApKSkgJiYgcmVzdWx0LnB1c2goIGUgYXMgVEVudGl0eSApIFxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGVudGl0eTogRW50aXR5KSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcHV0IGNhY2hlLCBtb2RlbCA9ICR7bW9kZWxOYW1lfSwga2V5ID0gJHtrZXl9LCBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KGVudGl0eSl9YCkgICAgXG4gICAgdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSwgdHJ1ZSkhLnNldCh0aGlzLmdldENhY2hlS2V5KGtleSksIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBldml0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiB2b2lkIHtcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgZXZpdCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7Y2FjaGVLZXl9YClcblxuICAgIGNvbnN0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGlmIChtb2RlbENhY2hlKSBtb2RlbENhY2hlLmRlbChjYWNoZUtleSlcbiAgfVxuICBcbiAgcHVibGljIGV4aXN0cyhtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KG1vZGVsTmFtZSwgIHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgZmFsc2UgKSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuXG4gIHB1YmxpYyBkdW1wQ2FjaGUoKSA6IHN0cmluZyB7XG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBDQUNIRSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgdGhpcy5tb2RlbENhY2hlcy5mb3JFYWNoKCAoY2FjaGUsIG1vZGVsKSA9PiB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tTW9kZWwgJHttb2RlbH0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGNhY2hlLmZvckVhY2goICggZW50aXR5LCBrZXkgKSA9PiB7XG4gICAgICAgIHJlc3VsdCArPSBga2V5ID0gJHt0aGlzLmdldENhY2hlS2V5KCBrZXkgKX0sIGVudGl0eSA9IHske0pTT04uc3RyaW5naWZ5KGVudGl0eSl9fSBcXG5gXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgfSkgICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbn0iLCJpbXBvcnQgKiBhcyBzZGIgZnJvbSAnLi9TbWFydERCJ1xuaW1wb3J0ICogYXMgbW9kZWwgZnJvbSAnLi9Nb2RlbCdcbmltcG9ydCAqIGFzIGJsb2NrIGZyb20gJy4vQmxvY2snXG5pbXBvcnQgKiBhcyBzZXNzaW9uIGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0ICogYXMgc3FsaXRlIGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCAqIGFzIGNvbm4gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5cbmV4cG9ydCBuYW1lc3BhY2UgQXNjaENvcmUge1xuICBleHBvcnQgY29uc3QgU21hcnREQiA9IHNkYi5TbWFydERCXG4gIGV4cG9ydCBjb25zdCBNb2RlbFNjaGVtYSA9IG1vZGVsLk1vZGVsU2NoZW1hXG4gIGV4cG9ydCB0eXBlIEJsb2NrID0gYmxvY2suQmxvY2tcbiAgZXhwb3J0IGNvbnN0IERiU2Vzc2lvbiA9IHNlc3Npb24uRGJTZXNzaW9uXG4gIGV4cG9ydCB0eXBlIERiQ29ubmVjdGlvbiA9IGNvbm4uRGJDb25uZWN0aW9uXG4gIGV4cG9ydCBjb25zdCBTcWxpdGVDb25uZWN0aW9uID0gc3FsaXRlLlNxbGl0ZUNvbm5lY3Rpb25cbn0gXG4iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIENhbGxiYWNrLCBNYXliZVVuZGVmaW5lZH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0ICogYXMgc3ViIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhjYWxsYmFjayA6IENhbGxiYWNrPGFueT4gfCB1bmRlZmluZWQgKSA6IHsgY2FsbGJhY2s6IENhbGxiYWNrPGFueT4sIHByb21pc2U6IFByb21pc2U8YW55PnxudWxsIH0ge1xuICBsZXQgcHJvbWlzZSA9IG51bGxcblxuICBpZiAoICFjYWxsYmFjayApIHtcbiAgICBjYWxsYmFjayA9IG1ha2VQcm9taXNlKClcbiAgICBwcm9taXNlID0gY2FsbGJhY2tbJ3Byb21pc2UnXVxuICB9XG5cbiAgcmV0dXJueyBjYWxsYmFjaywgcHJvbWlzZSB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxSZWFkYWJsZVN0cmVhbSBleHRlbmRzIFJlYWRhYmxlU3RyZWFtIHtcbiAgb24oIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjayA6IEZ1bmN0aW9uICkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGV2ZWxHZXQge1xuICBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM/OiBKc29uT2JqZWN0LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4pIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxUPj5cbiAgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtXG4gIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBMZXZlbE9wZXJhdGlvbiB7XG4gIHB1dDxUPihrZXkgOiBhbnksIHZhbHVlIDogVCwgb3B0aW9ucz86IEpzb25PYmplY3QsIGNhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBkZWwoa2V5OiBhbnksIGRlbENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPlxuICBiYXRjaChvcGVyQXJyYXk6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPzogSnNvbk9iamVjdCkgOiBQcm9taXNlPHZvaWQ+IFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEluZGV4ZWRMZXZlbCBleHRlbmRzIExldmVsR2V0LCBMZXZlbE9wZXJhdGlvbiB7XG4gIG5hbWUgOiBzdHJpbmdcbiAgaW5kZXhlcyA6IEFycmF5PEluZGV4RmllbGQ+XG4gIGJ5SW5kZXgoaW5kZXhGaWVsZDogc3RyaW5nKSA6IExldmVsR2V0XG4gIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4pOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFQ+PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1Yi5TdWJsZXZlbFxuXG4gIGNvbnN0cnVjdG9yKGRiRGlyIDogc3RyaW5nLCBtZXRhIDogQXJyYXk8U3ViTGV2ZWxNZXRhPiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5kYkRpciA9IGRiRGlyXG4gICAgdGhpcy5zdWJNZXRhcyA9IG5ldyBBcnJheTxTdWJMZXZlbE1ldGE+KCkuY29uY2F0KG1ldGEpXG4gICAgdGhpcy5zdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgSW5kZXhlZExldmVsPigpXG4gICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBpbml0KCkge1xuICAgIHRoaXMubGV2ZWxkYiA9IGxldmVsKCB0aGlzLmRiRGlyLCB7IHZhbHVlRW5jb2Rpbmc6ICdqc29uJyB9IClcbiAgICB0aGlzLnN1YkxldmVsZGIgPSBzdWIodGhpcy5sZXZlbGRiKVxuICAgIHRoaXMuc3ViTWV0YXMuZm9yRWFjaChzID0+IHRoaXMucmVnaXN0ZXJTdWJMZXZlbChzKSlcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJTdWJMZXZlbCggbWV0YTogU3ViTGV2ZWxNZXRhICkge1xuICAgIGNvbnN0IHN1YiA9IHRoaXMuc3ViTGV2ZWxkYi5zdWJsZXZlbChtZXRhLnN1Yk5hbWUpXG4gICAgY29uc3QgaW5kZXhlZFN1YiA9IG5ldyBJbmRleGVkU3ViTGV2ZWwoc3ViLCBtZXRhLnN1Yk5hbWUsIG1ldGEua2V5RmllbGQsIC4uLm1ldGEuaW5kZXhGaWVsZHMpICAgIFxuICAgIHRoaXMuc3ViTGV2ZWxzLnNldCggbWV0YS5zdWJOYW1lLCBpbmRleGVkU3ViKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0tleU5vdEZvdW5kRXJyb3IoIGVycjogRXJyb3IgKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlcnIgJiYgZXJyLm5hbWUgPT09ICdOb3RGb3VuZEVycm9yJyBcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhvcGVuQ2FsbGJhY2spXG5cbiAgICBpZiAodGhpcy5pc09wZW4pIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBcbiAgICAoYXN5bmMoKT0+IHsgXG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLmluaXQoKVxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKSAgICAgIFxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVyciwgc2VsZilcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNsb3NlQ2FsbGJhY2s/IDogQ2FsbGJhY2s8YW55PikgOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhjbG9zZUNhbGxiYWNrKVxuICAgIFxuICAgIGlmICh0aGlzLmlzQ2xvc2VkKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG5cbiAgICAoYXN5bmMoKT0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHRoaXMubGV2ZWxkYi5jbG9zZSgpXG4gICAgICAgIHRoaXMubGV2ZWxkYiA9IG51bGxcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZilcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIpXG4gICAgICB9ICBcbiAgICB9KSgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGdldCBpc09wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYiAmJiB0aGlzLmxldmVsZGIuaXNPcGVuKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDbG9zZWQoKSB7XG4gICAgcmV0dXJuICghdGhpcy5sZXZlbGRiKSB8fCB0aGlzLmxldmVsZGIuaXNDbG9zZWQoKVxuICB9XG5cbiAgcHVibGljIGR1bXAoKSA6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKCAocmVzLCByZWopID0+IHtcbiAgICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpICAgICAgXG4gICAgICB0aGlzLmxldmVsZGIuY3JlYXRlUmVhZFN0cmVhbSgpXG4gICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gcmVzdWx0LnB1c2goYGtleT0gJHtkYXRhLmtleX0sIHZhbHVlPSAke2RhdGEudmFsdWV9YCkgKVxuICAgICAgICAub24oJ2Vycm9yJywgZSA9PiByZWooZSkgKVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHJlcyhyZXN1bHQuam9pbignXFxyXFxuJykpIClcbiAgICB9KVxuICB9XG59XG5cbmNsYXNzIEluZGV4ZWRTdWJMZXZlbCBpbXBsZW1lbnRzIEluZGV4ZWRMZXZlbCB7XG4gIHByaXZhdGUgc3ViTmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGtleUZpZWxkIDogc3RyaW5nXG4gIHByaXZhdGUgaW5kZXhBcnJheSA6IEFycmF5PEluZGV4RmllbGQ+XG4gIHByaXZhdGUgaW5kZXhlZFN1YkxldmVscyA6IE1hcDxzdHJpbmcsIExldmVsR2V0PlxuICBwcml2YXRlIHN1YkxldmVsRGIgOiBhbnlcblxuICBwdWJsaWMgZ2V0IG5hbWUoKSB7IHJldHVybiB0aGlzLnN1Yk5hbWUgfVxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSB7IHJldHVybiB0aGlzLmluZGV4QXJyYXkgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggc3VibGV2ZWw6IGFueSwgc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZCA6IHN0cmluZywgLi4uaW5kZXhGaWVsZHMgOiBBcnJheTxJbmRleEZpZWxkPikge1xuICAgIHRoaXMuc3ViTGV2ZWxEYiA9IHN1YmxldmVsXG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhBcnJheSA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpLmNvbmNhdCguLi5pbmRleEZpZWxkcylcbiAgICB0aGlzLmluZGV4ZWRTdWJMZXZlbHMgPSBuZXcgTWFwPHN0cmluZywgTGV2ZWxHZXQ+KClcbiAgICB0aGlzLmluZGV4QXJyYXkuZm9yRWFjaCggZiA9PiB7XG4gICAgICBsZXQgc2Vub25kYXJ5ID0gU2Vub25kYXJ5KCBzdWJsZXZlbCwgZi5maWVsZE5hbWUsIGYuY2FsY0luZGV4IClcbiAgICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscy5zZXQoIGYuZmllbGROYW1lLCBzZW5vbmRhcnkgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlGaWVsZFxuICB9XG4gIFxuICBwcml2YXRlIGtleU5vdEZvdW5kVGhlblVuZGVmaW5lZDxUPiggY2FsbGJhY2s/OiBDYWxsYmFjazxNYXliZVVuZGVmaW5lZDxUPj4gKSA6IE1heWJlVW5kZWZpbmVkPENhbGxiYWNrPE1heWJlVW5kZWZpbmVkPFQ+Pj4ge1xuICAgIHJldHVybiAhY2FsbGJhY2sgPyB1bmRlZmluZWQgOiAoIGVyciA6IEVycm9yLCBkYXRhOiBUICkgPT4ge1xuICAgICAgY2FsbGJhY2soICBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvciggZXJyICkgPyBudWxsIDogZXJyICwgZGF0YSApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldDxUPihrZXk6IGFueSwgb3B0aW9uczogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8TWF5YmVVbmRlZmluZWQ8VD4+ICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VD4+IHtcbiAgICBjb25zdCBrZXlMZXZlbCA9IHRoaXMuc3ViTGV2ZWxEYiBhcyBJbmRleGVkU3ViTGV2ZWwgXG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBtYWtlUHJvbWlzaWZ5T3JDYWxsYmFjayhnZXRDYWxsYmFjaylcbiAgICB0cnkge1xuICAgICAga2V5TGV2ZWwuZ2V0PFQ+KGtleSwgb3B0aW9ucywgdGhpcy5rZXlOb3RGb3VuZFRoZW5VbmRlZmluZWQoY2FsbGJhY2spKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIExldmVsREIuaXNLZXlOb3RGb3VuZEVycm9yKGVycikgPyB1bmRlZmluZWQgOiBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBieUluZGV4KCBpbmRleEZpZWxkTmFtZSA6IHN0cmluZyApIDogTGV2ZWxHZXQge1xuICAgIGNvbnN0IGxldmVsR2V0ID0gIHRoaXMuaW5kZXhlZFN1YkxldmVscy5nZXQoaW5kZXhGaWVsZE5hbWUpXG4gICAgaWYgKCAhbGV2ZWxHZXQgKSB0aHJvdyBuZXcgRXJyb3IoYE5vIHN1Y2ggaW5kZXggZmllbGQgPSAnJHtpbmRleEZpZWxkTmFtZX0nYClcblxuICAgIHJldHVybiBsZXZlbEdldFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJ5PFQ+KGluZGV4RmllbGQgOiBzdHJpbmcsIGtleTogYW55LCBnZXRDYWxsYmFjaz8gOiBDYWxsYmFjazxUPik6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGluZGV4TGV2ZWwgPSB0aGlzLmJ5SW5kZXgoIGluZGV4RmllbGQgKVxuXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKGdldENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICBpbmRleExldmVsLmdldDxUPihrZXksIHRoaXMua2V5Tm90Rm91bmRUaGVuVW5kZWZpbmVkKGNhbGxiYWNrKSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBMZXZlbERCLmlzS2V5Tm90Rm91bmRFcnJvcihlcnIpID8gdW5kZWZpbmVkIDogZXJyLCB1bmRlZmluZWQpXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcHV0PFQ+KGtleTogYW55LCB2YWx1ZTogVCwgcHV0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKHB1dENhbGxiYWNrKVxuICAgIHRyeSB7XG4gICAgICB0aGlzLnN1YkxldmVsRGIucHV0KGtleSwgdmFsdWUsIGNhbGxiYWNrKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgY2FsbGJhY2soIGVyciwgdW5kZWZpbmVkKVxuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gbWFrZVByb21pc2lmeU9yQ2FsbGJhY2soZGVsQ2FsbGJhY2spXG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc3ViTGV2ZWxEYi5kZWwoa2V5LCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IG9yZ2luYWxDYWxsYmFjayA9IGhhc09wdGlvbnMgPyBiYXRjaENhbGxiYWNrIDogb3B0aW9ucyBhcyBDYWxsYmFjazxhbnk+XG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IG1ha2VQcm9taXNpZnlPckNhbGxiYWNrKCBvcmdpbmFsQ2FsbGJhY2sgKVxuICAgIHRyeSB7XG4gICAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgICAgdGhpcy5zdWJMZXZlbERiLmJhdGNoKGFycmF5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5zdWJMZXZlbERiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIGNhbGxiYWNrKCBlcnIsIHVuZGVmaW5lZClcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZUtleVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5zdWJMZXZlbERiLmNyZWF0ZUtleVN0cmVhbShvcHRpb25zKVxuICB9XG5cbiAgcHVibGljIGNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW0ge1xuICAgIHJldHVybiB0aGlzLnN1YkxldmVsRGIuY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucylcbiAgfVxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEhlaWdodCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKCBkaXIgOiBzdHJpbmcsIGxldmVsT3B0aW9ucyA9IHt9ICkge1xuICAgIC8qIFxuICAgICAgeyBpZCg2NCksIHRpbWVzdGFtcChiaWdpbnQpLCBoZWlnaHQoYmlnaW50KSwgcGF5bG9hZExlbmd0aChiaWdpbnQpLCBwYXlsb2FkSGFzaCg2NCksIHByZXZCbG9ja0lkKDY0KSwgXG4gICAgICAgIHBvaW50SWQoNjQpLCBwb2ludEhlaWdodChiaWdpbnQpLCBkZWxlZ2F0ZSg2NCksIHNpZ25hdHVyZSgxMjgpLCBjb3VudChiaWdpbnQpIH1cbiAgICAqL1xuICAgIGNvbnN0IGJsb2NrTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2JsaycsICdoZWlnaHQnLCBbXG4gICAgICB7IGZpZWxkTmFtZTogJ2lkJyB9LCBcbiAgICAgIHsgZmllbGROYW1lOiAnZGVsZWdhdGUnIH1cbiAgICBdKVxuICAgIGNvbnN0IGNoYW5nZXNMb2dNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnaGlzJywgJ2hlaWdodCcsIFtdKVxuICAgIFxuICAgIHRoaXMuZGIgPSBuZXcgTGV2ZWxEQiggZGlyLCBbYmxvY2tNZXRhLCBjaGFuZ2VzTG9nTWV0YV0sIGxldmVsT3B0aW9ucyApXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gLTFcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IGxhc3RCbG9ja0hlaWdodEl0ZW0gPSBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0PEJsb2NrSGVhZGVyPihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KSBcbiAgICBpZiAoIGxhc3RCbG9ja0hlaWdodEl0ZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxhc3RCbG9ja0hlaWdodEl0ZW0gPSB0aGlzLmdldExhc3RIZWlnaHRKc29uKCAtMSApXG4gICAgICBhd2FpdCB0aGlzLmJsb2NrRGIucHV0KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgbGFzdEJsb2NrSGVpZ2h0SXRlbSlcbiAgICB9XG4gICAgcmV0dXJuIGxhc3RCbG9ja0hlaWdodEl0ZW0uaGVpZ2h0ICBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIub3BlbigpXG4gICAgdGhpcy5ibG9ja0RiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnYmxrJylcbiAgICB0aGlzLmhpc3RvcnlEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2hpcycpXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RIZWlnaHQgXG4gIH1cblxuICBwcml2YXRlIGlzS2V5Tm90Rm91bmRFcnJvcihlKSA6IGJvb2xlYW4geyBcbiAgICByZXR1cm4gZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwcml2YXRlIGdldExhc3RIZWlnaHRKc29uKCBsYXN0SGVpZ2h0OiBudW1iZXIgKSA6IEJsb2NrSGVhZGVyIHtcbiAgICByZXR1cm4ge1xuICAgICAgaGVpZ2h0IDogbGFzdEhlaWdodCxcbiAgICAgIGlkIDogJ05VTEwnLFxuICAgICAgZGVsZWdhdGUgOiAnTlVMTCdcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXBwZW5kQmxvY2soIGJsb2NrIDogQmxvY2tIZWFkZXIsIGNoYW5nZXM6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWJsb2NrIHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUgfHwgYmxvY2suaGVpZ2h0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogdGhpcy5nZXRMYXN0SGVpZ2h0SnNvbihibG9jay5oZWlnaHQpIH1cbiAgIF0pXG5cbiAgICB0aGlzLmxhc3RIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9jayggaGVpZ2h0IDogbnVtYmVyICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmJsb2NrRGIuZ2V0PEJsb2NrSGVhZGVyPihoZWlnaHQpXG4gICAgfVxuICAgIGNhdGNoKGUpIHtcbiAgICAgIGlmICghdGhpcy5pc0tleU5vdEZvdW5kRXJyb3IoZSkpIHRocm93IGVcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEhpc3RvcnlDaGFuZ2VzKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0OiBudW1iZXIgKSA6IFByb21pc2U8TWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pj4ge1xuICAgIGxldCByZXQgID0gbmV3IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4oKVxuICAgIGZvciggbGV0IGggPSBtaW5IZWlnaHQ7IGggPCBtYXhIZWlnaHQ7IGgrKyApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXMgPSBhd2FpdCB0aGlzLmhpc3RvcnlEYi5nZXQ8QXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PihoKVxuICAgICAgY2hhbmdlcyAmJiByZXQuc2V0KCBoLCBjaGFuZ2VzIClcbiAgICB9XG4gICAgcmV0dXJuIHJldCBcbiAgfVxuICBcbiAgcHVibGljIGFzeW5jIGRlbGV0ZUxhc3RCbG9jayggaGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoaGVpZ2h0ICE9PSB0aGlzLmxhc3RCbG9ja0hlaWdodClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBsYXN0IGJsb2NrIGhlaWdodCAnJHtoZWlnaHR9J2ApXG5cbiAgICBhd2FpdCB0aGlzLmJsb2NrRGIuYmF0Y2goW1xuICAgICAgeyB0eXBlOiAnZGVsJywga2V5IDogaGVpZ2h0IH0sXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHZhbHVlOiB0aGlzLmdldExhc3RIZWlnaHRKc29uKCBoZWlnaHQgLSAxICkgfSBcbiAgICBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RIZWlnaHQgLS1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXRCeTxCbG9ja0hlYWRlcj4oJ2lkJywgYmxvY2tJZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBoID0gbWluSGVpZ2h0IDsgaCA8PSBtYXhIZWlnaHQ7IGgrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2soaClcbiAgICAgIGJsb2NrICYmIHJlc3VsdC5wdXNoKCBibG9jayEgKVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlJZHMoIGJsb2NrSWRzIDogQXJyYXk8c3RyaW5nPiApIDogUHJvbWlzZTxBcnJheTxCbG9ja0hlYWRlcj4+IHtcbiAgICBsZXQgcmV0ICA9IG5ldyBBcnJheTxCbG9ja0hlYWRlcj4oKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgYmxvY2tJZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrQnlJZCggYmxvY2tJZHNbaV0gKVxuICAgICAgYmxvY2sgJiYgcmV0LnB1c2goIGJsb2NrIClcbiAgICB9XG4gICAgcmV0dXJuIHJldFxuICB9XG59IiwiZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xuICBBbGwgICAgPSAxMjggLSAxLFxuICBUcmFjZSAgPSA2NCxcbiAgRGVidWcgID0gMzIsXG4gIExvZyAgICA9IDE2LFxuICBJbmZvICAgPSA4LFxuICBXYXJuICAgPSA0LFxuICBFcnJvciAgPSAyLFxuICBGYXRhbCAgPSAxLFxuICBOb25lICAgPSAwXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nTGV2ZWwgOiBMb2dMZXZlbFxuICByZWFkb25seSBpbmZvRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IHRyYWNlRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgbG9nRW5hYmxlZCAgIDogYm9vbGVhblxuICByZWFkb25seSBkZWJ1Z0VuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IHdhcm5FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZXJyb3JFbmFsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBmYXRhbEVuYWJsZWQgOiBib29sZWFuXG5cbiAgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIHdhcm4oIG1zZzogc3RyaW5nICwgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxuICBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IgKTogdm9pZFxufVxuXG5jbGFzcyBMb2dnZXJBZGFwdGVyIGltcGxlbWVudHMgTG9nZ2VyIHtcbiAgcHJpdmF0ZSBsZXZlbCA6IExvZ0xldmVsXG4gIHByaXZhdGUgbmFtZSA6IHN0cmluZ1xuICBwcml2YXRlIGZvcm1hdCA6IGJvb2xlYW5cbiAgcHJpdmF0ZSBnZXRMb2dnZXIgOiAoKSA9PiBMb2dnZXJcblxuICBwdWJsaWMgZ2V0IGluZm9FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuSW5mbykgID4gMCB9XG4gIHB1YmxpYyBnZXQgdHJhY2VFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5UcmFjZSkgPiAwIH1cbiAgcHVibGljIGdldCBkZWJ1Z0VuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkRlYnVnKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGxvZ0VuYWJsZWQoKSAgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuTG9nKSAgID4gMCB9XG4gIHB1YmxpYyBnZXQgd2FybkVuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5XYXJuKSAgPiAwIH1cbiAgcHVibGljIGdldCBlcnJvckVuYWxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkVycm9yKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGZhdGFsRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRmF0YWwpID4gMCB9XG5cbiAgcHVibGljIGdldCBsb2dMZXZlbCgpIHsgcmV0dXJuIHRoaXMubGV2ZWwgfVxuICBwdWJsaWMgc2V0IGxvZ0xldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7IHRoaXMubGV2ZWwgPSBsZXZlbCB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGdldExvZ2dlcjogKCkgPT4gTG9nZ2VyLCBmb3JtYXRNZXNzYWdlID0gZmFsc2UsIGxvZ2dlck5hbWU6IHN0cmluZywgbGV2ZWwgPSBMb2dMZXZlbC5BbGwgKSB7XG4gICAgdGhpcy5uYW1lID0gbG9nZ2VyTmFtZVxuICAgIHRoaXMubGV2ZWwgPSBsZXZlbFxuICAgIHRoaXMuZ2V0TG9nZ2VyID0gZ2V0TG9nZ2VyXG4gICAgdGhpcy5mb3JtYXQgPSBmb3JtYXRNZXNzYWdlXG4gIH1cblxuICBwcm90ZWN0ZWQgZnJvbWF0TWVzc2FnZSggbXNnOiBzdHJpbmcsIGxvZ1R5cGU6IHN0cmluZyApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7bmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoKX0gWyR7bG9nVHlwZX1dIFske3RoaXMubmFtZX1dICR7bXNnfWBcbiAgfVxuXG4gIHB1YmxpYyBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0lORk8nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmluZm8oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdERUJVRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBsb2coIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnTE9HJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1RSQUNFJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIHdhcm4oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnV0FSTicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkud2FybiggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRVJST1InIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxuXG4gIHB1YmxpYyBmYXRhbCggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0ZBVEFMJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIExvZ01hbmFnZXIge1xuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nTGV2ZWwgPSBMb2dMZXZlbC5BbGxcbiAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlTG9nZ2VyID0gKCkgPT4gIGNvbnNvbGUgYXMgT2JqZWN0IGFzIExvZ2dlciBcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ2dlciA9IG5ldyBMb2dnZXJBZGFwdGVyKCBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgJ2RlZmF1bHQnLCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCApXG5cbiAgcHVibGljIHN0YXRpYyBzZXQgZGVmYXVsdExldmVsKCBsZXZlbDogTG9nTGV2ZWwgKSB7XG4gICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgPSBsZXZlbFxuICB9XG4gIFxuICBwdWJsaWMgc3RhdGljIHNldCBsb2dGYWN0b3J5ICggdmFsdWU6ICgpID0+IExvZ2dlciApIHtcbiAgICBMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciA9IHZhbHVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldExvZ2dlcihsb2dnZXJOYW1lPzogc3RyaW5nLCBsZXZlbD8gOiBMb2dMZXZlbCkgOiBMb2dnZXIge1xuICAgIHJldHVybiBsb2dnZXJOYW1lID8gXG4gICAgICBuZXcgTG9nZ2VyQWRhcHRlcihMb2dNYW5hZ2VyLmNyZWF0ZUxvZ2dlciwgdHJ1ZSwgbG9nZ2VyTmFtZSwgbGV2ZWwgfHwgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwpIDogXG4gICAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dnZXI7XG4gIH1cbn1cbiIsImltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEVudGl0eUtleSwgS2V5T2JqZWN0LCBDb2RlQ29udHJhY3QgYXMgREJDLCBwYXJ0aWFsLCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCB9IGZyb20gJy4vQ29tbW9uJ1xuXG5leHBvcnQgdHlwZSBDb25zdHJ1Y3RvcjxUPiA9IHsgbmV3KCkgOiBUIH1cbmV4cG9ydCB0eXBlIE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiA9IHN0cmluZyB8IENvbnN0cnVjdG9yPFRFbnRpdHk+XG5cbmV4cG9ydCBlbnVtIEZpZWxkVHlwZXMge1xuICBTdHJpbmcgICA9ICdTdHJpbmcnLFxuICBOdW1iZXIgICA9ICdOdW1iZXInLFxuICBCaWdJbnQgICA9ICdCaWdJbnQnLFxuICBUZXh0ICAgICA9ICdUZXh0J1xufVxuXG5leHBvcnQgdHlwZSBGaWVsZFR5cGUgPSBzdHJpbmcgfCBGaWVsZFR5cGVzXG5cbmV4cG9ydCBpbnRlcmZhY2UgRmllbGQge1xuICBuYW1lOiBzdHJpbmcsXG4gIHR5cGU6IEZpZWxkVHlwZSxcbiAgbGVuZ3RoPzogbnVtYmVyICxcbiAgaW5kZXg/OiBib29sZWFuLFxuICBub3RfbnVsbD86IGJvb2xlYW4sXG4gIHByaW1hcnlfa2V5PyA6IGJvb2xlYW4sXG4gIGNvbXBvc2l0ZV9rZXk/IDogYm9vbGVhbixcbiAgZGVmYXVsdD86IG51bWJlcnxzdHJpbmd8bnVsbFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFNjaGVtYSB7XG4gIHRhYmxlPyA6IHN0cmluZyxcbiAgbWVtb3J5PyA6IGJvb2xlYW4sXG4gIHJlYWRvbmx5PyA6IGJvb2xlYW4sXG4gIGxvY2FsPyA6IGJvb2xlYW4sXG4gIHRhYmxlRmllbGRzIDogQXJyYXk8RmllbGQ+XG59XG5cbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVLZXkgaW1wbGVtZW50cyBLZXlPYmplY3Qge1xuICBwcml2YXRlIGtleU9iamVjdCA6IEpzb25PYmplY3RcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIGtleU9iamVjdCA6IEpzb25PYmplY3QgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5T2JqZWN0JywgKCkgPT4gREJDLm5vdE51bGwoa2V5T2JqZWN0KSlcblxuICAgIHRoaXMua2V5T2JqZWN0ID0ga2V5T2JqZWN0XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG1ha2U8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IFRFbnRpdHkgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgKCkgPT4gREJDLm5vdE51bGwoc2NoZW1hKSlcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCBzY2hlbWEuaXNDb21wc2l0ZUtleSwgJ21vZGVsIG11c3QgaW5kZW50aWZ5IGJ5IGNvbXBvc2l0ZSBrZXknKVxuICAgIERCQy5hcmd1bWVudCggJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkpXG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUtleSggcGFydGlhbChlbnRpdHksIC4uLnNjaGVtYS5jb21wb3NpdGVLZXlzKSApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoIGtleUpzb25TdHJpbmc6IHN0cmluZyApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlKc29uU3RyaW5nJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2Uoa2V5SnNvblN0cmluZykpXG5cbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZUtleShKU09OLnBhcnNlKCBrZXlKc29uU3RyaW5nICkua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIGdldCBrZXlKc29uKCkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5rZXlPYmplY3RcbiAgfVxuICBcbiAgcHVibGljIGdldCBrZXkoKSA6IHN0cmluZyB7IFxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyB0b1N0cmluZygpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5rZXlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb3NpdGVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICghIGtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4ga2V5LmtleUpzb25cbn1cblxuZXhwb3J0IGNsYXNzIE1vZGVsU2NoZW1hIHtcbiAgcHJpdmF0ZSBzY2hlbWE6IFNjaGVtYVxuICBwcml2YXRlIG5hbWU6IHN0cmluZ1xuICBwcml2YXRlIG1lbW9yeTogYm9vbGVhblxuICBwcml2YXRlIHJlYWRvbmx5OiBib29sZWFuXG4gIHByaXZhdGUgbG9jYWw6IGJvb2xlYW5cblxuICBwcml2YXRlIHBLZXk6IE1heWJlVW5kZWZpbmVkPHN0cmluZz5cbiAgcHJpdmF0ZSBjS2V5czogQXJyYXk8c3RyaW5nPlxuICBwcml2YXRlIGFsbEZpZWxkczogQXJyYXk8c3RyaW5nPlxuICBwcml2YXRlIGFsbEZpZWxkVHlwZXM6IE1hcDxzdHJpbmcsIHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxJbmRleGVzOiBBcnJheTxzdHJpbmc+XG5cbiAgY29uc3RydWN0b3Ioc2NoZW1hOiBTY2hlbWEsIG5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuc2NoZW1hID0gT2JqZWN0LmFzc2lnbih7fSAsIHNjaGVtYSlcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5tZW1vcnkgPSBzY2hlbWEubWVtb3J5ID09PSB0cnVlXG4gICAgdGhpcy5yZWFkb25seSA9IHNjaGVtYS5yZWFkb25seSA9PT0gdHJ1ZVxuICAgIHRoaXMubG9jYWwgPSBzY2hlbWEubG9jYWwgPT09IHRydWVcbiAgICB0aGlzLmF0dGFjaFZlcnNpb25GaWVsZCggdGhpcy5zY2hlbWEgKVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBhdHRhY2hWZXJzaW9uRmllbGQoIHNjaGVtYSA6IFNjaGVtYSApIHtcbiAgICBpZiAoIHNjaGVtYS50YWJsZUZpZWxkcy5maW5kKCBmID0+IGYubmFtZSA9PT0gJ192ZXJzaW9uXycpICkgcmV0dXJuXG4gICAgc2NoZW1hLnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGNvbnZlcnRUeXBlKCB0eXBlIDogRmllbGRUeXBlICkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gdHlwZVxuICB9XG4gIFxuICBwcml2YXRlIHBhcnNlRmllbGRzKCkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgcHJpbWFyeUtleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLnByaW1hcnlfa2V5ID09PSB0cnVlICkgLm1hcCggZj0+IGYubmFtZSApXG4gICAgdGhpcy5jS2V5cyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlcihmID0+IGYuY29tcG9zaXRlX2tleSA9PT0gdHJ1ZSApLm1hcCggZj0+IGYubmFtZSApXG5cbiAgICB0aGlzLnBLZXkgPSBwcmltYXJ5S2V5cy5sZW5ndGggPT09IDEgPyBwcmltYXJ5S2V5c1swXSA6IHVuZGVmaW5lZFxuXG4gICAgbGV0IGtleVZhbGlkID0gKCB0aGlzLnBLZXkgIT09IHVuZGVmaW5lZCApICE9PSAoIHRoaXMuY0tleXMubGVuZ3RoID4gMSApIFxuICAgIGlmICggIWtleVZhbGlkICkgdGhyb3cgbmV3IEVycm9yKGBtb2RlbCBtdXN0IGhhdmUgcHJpbWFyeSBrZXkgb3IgY29tcG9zaXRlIGtleXMsIGJ1dCBjYW4gbm90IGJvdGhgKVxuXG4gICAgdGhpcy5hbGxGaWVsZFR5cGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKVxuICAgIHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gdGhpcy5hbGxGaWVsZFR5cGVzLnNldCggZi5uYW1lLCB0aGlzLmNvbnZlcnRUeXBlKGYudHlwZSkpIClcbiAgICB0aGlzLmFsbEZpZWxkcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLm1hcCggZiA9PiBmLm5hbWUpXG4gICAgdGhpcy5hbGxJbmRleGVzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKCBmID0+IGYuaW5kZXggPT09IHRydWUgKS5tYXAoIGYgPT4gZi5uYW1lIClcbiAgfVxuXG4gIHB1YmxpYyBnZXRGaWVsZFR5cGVzKHNjaGVtYTogU2NoZW1hKTogTWFwPHN0cmluZywgc3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsRmllbGRUeXBlc1xuICB9XG5cbiAgcHVibGljIGdldCBzY2hlbWFPYmplY3QoKSA6IFNjaGVtYSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29tcHNpdGVLZXkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvc2l0ZUtleXMubGVuZ3RoID4gMSBcbiAgfVxuXG4gIHB1YmxpYyBnZXQgcHJpbWFyeUtleSgpIDogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMucEtleVxuICB9XG5cbiAgcHVibGljIGdldCBjb21wb3NpdGVLZXlzKCkgOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuY0tleXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgZmllbGROYW1lcygpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsRmllbGRzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGluZGV4ZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEluZGV4ZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbW9kZWxOYW1lKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNMb2NhbCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubG9jYWxcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNSZWFkb25seSgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVhZG9ubHlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbWVtQ2FjaGVkKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tZW1vcnlcbiAgfVxuXG4gIHB1YmxpYyBzZXRLZXk8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwga2V5OiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGlmICggIXRoaXMuaXNDb21wc2l0ZUtleSApIHtcbiAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXkhXSA9IGtleVxuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjayA9IGtleSBhcyBDb21wb3NpdGVLZXlcbiAgICAgIHRoaXMuY0tleXMuZm9yRWFjaCggZiA9PiBlbnRpdHlbZl0gPSBjay5rZXlKc29uW2ZdIClcbiAgICB9XG4gICAgcmV0dXJuIGVudGl0eVxuICB9XG5cbiAgcHVibGljIGdldEtleTxURW50aXR5PihlbnRpdHkgOiBURW50aXR5KSA6IEVudGl0eUtleSB7XG4gICAgcmV0dXJuIHRoaXMuaXNDb21wc2l0ZUtleSA/IFxuICAgICAgQ29tcG9zaXRlS2V5Lm1ha2UoIHRoaXMsIGVudGl0eSApIDpcbiAgICAgIGVudGl0eVt0aGlzLnByaW1hcnlLZXkhXVxuICB9XG5cbiAgcHVibGljIG5ld0VudGl0eTxURW50aXR5PiAoIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleSA6IEVudGl0eUtleSApIDogVEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IGlzU3RyaW5nKG1vZGVsKSA/IFxuICAgICAgeyB9IGFzIFRFbnRpdHkgOiBcbiAgICAgIG5ldyAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkoKVxuXG4gICAgcmV0dXJuIHRoaXMuc2V0S2V5KCBlbnRpdHksIGtleSApXG4gIH1cblxuICBwdWJsaWMgY29weVByb3BlcnRpZXM8VEVudGl0eT4oIGRlc3Q6IFRFbnRpdHksIHNyYyA6IFRFbnRpdHksIGluY2x1ZGVLZXkgPSBmYWxzZSApIHtcbiAgICB0aGlzLmFsbEZpZWxkcy5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGlmICggIWluY2x1ZGVLZXkgJiYgKCB0aGlzLmNLZXlzLmluZGV4T2YoZikgPj0gMCB8fCBmID09PSB0aGlzLnByaW1hcnlLZXkgKSApIHJldHVyblxuICAgICAgZGVzdFtmXSA9IHNyY1tmXVxuICAgIH0pXG4gIH1cbn0iLCJpbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5S2V5LCBkZWVwQ29weSB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IGlzQXJyYXksIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IEpzb25TcWwgPSByZXF1aXJlKCdqc29uLXNxbCcpKHsgc2VwYXJhdGVkVmFsdWVzOiBmYWxzZSB9KVxuY29uc3QgY2hhbmdlQ2FzZSA9IHJlcXVpcmUoJ2NoYW5nZS1jYXNlJylcblxuZXhwb3J0IGNvbnN0IE1VTFRJX1NRTF9TRVBBUkFUT1IgPSAnOydcblxuLy8gJ2NyZWF0ZSd8J3NlbGVjdCd8J3VwZGF0ZSd8J3JlbW92ZSd8J290aGVyJ1xuZXhwb3J0IGVudW0gU3FsVHlwZSB7XG4gIFNjaGVtYSA9IDAsXG4gIFNlbGVjdCA9IDEsXG4gIEluc2VydCA9IDIgLFxuICBVcGRhdGUgPSAzLFxuICBEZWxldGUgPSA0LFxuICBPdGhlciAgPSA5XG59XG5cbmV4cG9ydCB0eXBlIFNxbFBhcmFtZXRlcnMgPSBBcnJheTxhbnk+IHwgSnNvbk9iamVjdFxuZXhwb3J0IHR5cGUgU3FsQW5kUGFyYW1ldGVycyA9IHsgXG4gIHR5cGU6IFNxbFR5cGUsICBcbiAgcXVlcnk6IHN0cmluZywgXG4gIHBhcmFtZXRlcnM/IDogU3FsUGFyYW1ldGVycyxcbiAgZXhwZWN0RWZmZWN0ZWQ/IDogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSBVbmFyeU9wZXJhdG9ycyA9ICckbnVsbCd8JyRpcyd8JyRpc25vdCdcbmV4cG9ydCB0eXBlIEJpbmFyeU9wZXJhdG9ycyA9ICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSd8JyRsaWtlJ3wnJGZpZWxkJ3wnJGluJ3wnJG5pbid8JyRiZXR3ZWVuJ1xuZXhwb3J0IHR5cGUgUmVsYXRpb25PcGVyYXRvcnMgPSAnJG5vdCd8JyRhbmQnfCckb3InXG5cbmV4cG9ydCB0eXBlIFNlbGVjdEV4cHJlc3Npb24gPSB7XG4gIHNlbGVjdCA6IHtcbiAgICB0YWJsZSA6IHN0cmluZyxcbiAgICBmaWVsZHM/IDogQXJyYXk8c3RyaW5nPixcbiAgICB3aGVyZT8gOiBzdHJpbmcsXG4gICAgW2tleSA6IHN0cmluZ10gOiBhbnlcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBWYWx1ZUV4cHJlc3Npb24gPSBzdHJpbmcgfCBudW1iZXJcbmV4cG9ydCB0eXBlIEZpZWxkVmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogc3RyaW5nIHwgbnVtYmVyIH1cbmV4cG9ydCB0eXBlIEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gPSB7IFtmaWVsZCA6IHN0cmluZ10gOiBBcnJheTxzdHJpbmcgfCBudW1iZXI+IH1cbmV4cG9ydCB0eXBlIE51bGxDb21wYXJlRXhwcmVzc2lvbiA9IHsgJG51bGwgOiBzdHJpbmcgfSB8IHsgW29wZXIgaW4gJyRpcyd8J2lzbm90J10/IDogeyBbZmllbGQgOiBzdHJpbmddIDogbnVsbH0gfVxuXG5leHBvcnQgdHlwZSBWYWx1ZUNvbXBhcmVFeHByZXNzaW9uID0gRmllbGRWYWx1ZUV4cHJlc3Npb24gfCB7IFtmaWVsZCA6IHN0cmluZ10gOiB7IFtvcGVyIGluICckZXEnfCckbmUnfCckZ3QnfCckbHQnfCckZ3RlJ3wnJGx0ZSddPyA6IFZhbHVlRXhwcmVzc2lvbiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBBcnJheUNvbXBhcmVFeHByZXNzaW9uID0gRmllbGRBcnJheVZhbHVlRXhwcmVzc2lvbiB8IHsgIFtmaWVsZCA6IHN0cmluZ10gOiB7IFtvcGVyIGluICckYmV0d2Vlbid8JyRpbid8JyRuaW4nXT8gOiBBcnJheTxWYWx1ZUV4cHJlc3Npb24+IHwgU2VsZWN0RXhwcmVzc2lvbiB9IH1cbmV4cG9ydCB0eXBlIExpa2VFeHByZXNzaW9uID0geyBba2V5IDogc3RyaW5nXTogeyAkbGlrZSA6IHN0cmluZyB9IH0gXG5cbmV4cG9ydCB0eXBlIENvbXBhcmVFeHByZXNzaW9uID0gVmFsdWVDb21wYXJlRXhwcmVzc2lvbiB8IEFycmF5Q29tcGFyZUV4cHJlc3Npb24gfCBMaWtlRXhwcmVzc2lvbiB8IE51bGxDb21wYXJlRXhwcmVzc2lvblxuZXhwb3J0IHR5cGUgUmVsYXRpb25FeHByZXNzaW9uID0gQXJyYXk8Q29tcGFyZUV4cHJlc3Npb24+IHwgLy8gVGhlICRhbmQgaXMgb21pdHRlZCBcbiAgeyAkbm90IDogQ29tcGFyZUV4cHJlc3Npb24gfCBSZWxhdGlvbkV4cHJlc3Npb24gfSB8IFxuICB7IFtvcGVyIGluICckYW5kJ3wgJyRvciddPyA6IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IEFycmF5PFJlbGF0aW9uRXhwcmVzc2lvbj4gfVxuIFxuZXhwb3J0IHR5cGUgU3FsQ29uZGl0aW9uID0gQ29tcGFyZUV4cHJlc3Npb24gfCBSZWxhdGlvbkV4cHJlc3Npb25cblxuZXhwb3J0IHR5cGUgTGltaXRBbmRPZmZzZXQgPSB7XG4gIGxpbWl0PyA6IG51bWJlcixcbiAgb2Zmc2V0PyA6IG51bWJlclxufVxuZXhwb3J0IHR5cGUgU3FsUmVzdWx0UmFuZ2UgPSBudW1iZXIgfCBMaW1pdEFuZE9mZnNldFxuXG5leHBvcnQgdHlwZSBTcWxPcmRlckl0ZW0gPSB7XG4gIFtmaWVsZCA6IHN0cmluZ10gOiAnQVNDJyB8ICdERVNDJyB8IDEgfCAtMSBcbn1cblxuZXhwb3J0IHR5cGUgU3FsT3JkZXIgPSBTcWxPcmRlckl0ZW0gfCBBcnJheTxTcWxPcmRlckl0ZW0+XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3FsQnVpbGRlciB7XG4gIGJ1aWxkU2NoZW1hKCBzY2hlbWE6IE1vZGVsU2NoZW1hICkgOiBBcnJheTxzdHJpbmc+XG4gIGJ1aWxkSW5zZXJ0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGREZWxldGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzOiBBcnJheTxzdHJpbmc+LCB3aGVyZSA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICBsZXQgc3FscyA9IG5ldyBBcnJheTxzdHJpbmc+KCkgXG4gICAgY29uc3Qgc2NoZW1hT2JqZWN0ID0gT2JqZWN0LmFzc2lnbih7IHR5cGU6ICdjcmVhdGUnfSwgZGVlcENvcHkoc2NoZW1hLnNjaGVtYU9iamVjdCkpIFxuICAgIC8vIFRPRE86IGdlbmVyYXRlIGNvbXBvc2l0ZSBrZXkgc3FsXG4gICAgbGV0IHNjaGVtYVNxbCA9IEpzb25TcWwuYnVpbGQoc2NoZW1hT2JqZWN0KVxuICAgIHNxbHMucHVzaChzY2hlbWFTcWwucXVlcnkpXG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIHNjaGVtYS5pbmRleGVzLmZvckVhY2goIGZpZWxkID0+IHtcbiAgICAgIHNxbHMucHVzaChKc29uU3FsLmJ1aWxkKHtcbiAgICAgICAgdHlwZTogJ2luZGV4JyxcbiAgICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgICAgbmFtZTogdGFibGVOYW1lICsgJ18nICsgZmllbGQsXG4gICAgICAgIGluZGV4T246IGZpZWxkXG4gICAgICB9KS5xdWVyeSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIHNxbHNcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNlbGVjdChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZHNPclBhcmFtczogQXJyYXk8c3RyaW5nPiB8IEpzb25PYmplY3QsIHdoZXJlPyA6IFNxbENvbmRpdGlvbiwgXG4gICAgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApOiBTcWxBbmRQYXJhbWV0ZXJzIHtcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgXG4gICAgbGV0IHF1ZXJ5T3B0aW9ucyA6IEpzb25PYmplY3RcbiAgICBpZiAoICFpc0FycmF5KCBmaWVsZHNPclBhcmFtcyApICkge1xuICAgICAgbGV0IHBhcmFtcyA9IGZpZWxkc09yUGFyYW1zIGFzIEpzb25PYmplY3RcbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oIHsgdHlwZTogJ3NlbGVjdCcsIHRhYmxlOiB0YWJsZU5hbWUgfSwgcGFyYW1zIClcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsZXQgZmllbGRzID0gZmllbGRzT3JQYXJhbXMgfHwgc2NoZW1hLmZpZWxkTmFtZXMubWFwKCBmID0+IHNjaGVtYS5zY2hlbWFPYmplY3QudGFibGUgKyAnLicgKyBmIClcbiAgICAgIGxldCBsbyA6IExpbWl0QW5kT2Zmc2V0ID0gaXNOdW1iZXIoIHJlc3VsdFJhbmdlICkgPyAgeyBsaW1pdCA6IHJlc3VsdFJhbmdlIH0gOiByZXN1bHRSYW5nZSB8fCB7IH1cbiAgICAgIGxldCBvcmRlciA9IHNvcnQgfHwge31cbiAgICAgIGZvciAoIGxldCBrZXkgb2YgUmVmbGVjdC5vd25LZXlzKG9yZGVyKSAgKSB7XG4gICAgICAgIGxldCBvcmRlclZhbHVlID0gb3JkZXJba2V5XSB8fCAtMVxuICAgICAgICBvcmRlcltrZXldID0gKG9yZGVyVmFsdWUgPT09ICdBU0MnKSA/IDEgOiAoIChvcmRlclZhbHVlID09PSAnREVTQycpID8gLTEgOiBvcmRlclZhbHVlIClcbiAgICAgIH1cblxuICAgICAgcXVlcnlPcHRpb25zID0ge1xuICAgICAgICB0eXBlOiAnc2VsZWN0JyxcbiAgICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgICAgZmllbGRzOiBmaWVsZHMsXG4gICAgICAgIGNvbmRpdGlvbjogd2hlcmUsXG4gICAgICAgIGxpbWl0OiBsby5saW1pdCxcbiAgICAgICAgb2Zmc2V0OiBsby5vZmZzZXQsXG4gICAgICAgIHNvcnQ6IG9yZGVyLFxuICAgICAgICBqb2luOiBqb2luXG4gICAgICB9XG4gICAgfVxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5TZWxlY3QgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHF1ZXJ5T3B0aW9ucykpXG4gIH1cbn0iLCJpbXBvcnQgeyBTcWxpdGVXcmFwcGVyIH0gZnJvbSAnLi9TcWxpdGVXcmFwcGVyJ1xuaW1wb3J0IHsgTVVMVElfU1FMX1NFUEFSQVRPUiwgU3FsQW5kUGFyYW1ldGVycywgU3FsUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiwgQ29ubmVjdGlvbk9wdGlvbnMsIFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcblxuXG5jbGFzcyBTcWxpdGVUcmFuc2FjdGlvbiBpbXBsZW1lbnRzIERCVHJhbnNhY3Rpb24ge1xuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cblxuICBjb25zdHJ1Y3Rvcihjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBjb25uZWN0aW9uXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29tbWl0KCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnQ09NTUlUOycpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2soKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdST0xMQkFDSzsnKSBcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU3FsaXRlQ29ubmVjdGlvbiBpbXBsZW1lbnRzIERiQ29ubmVjdGlvbiB7XG4gIHByaXZhdGUgb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zXG4gIHByaXZhdGUgc3FsaXRlIDogU3FsaXRlV3JhcHBlclxuXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnMgKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuc3FsaXRlID0gbmV3IFNxbGl0ZVdyYXBwZXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBjb25uZWN0aW9uT3B0aW9ucygpOiBDb25uZWN0aW9uT3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9uc1xuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmFzeW5PcGVuKCB0aGlzLm9wdGlvbnMuc3RvcmFnZSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGlzY29ubmVjdCgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5DbG9zZSgpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luUXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5U3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLnF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHByaXZhdGUgZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQ6IFNxbEV4ZWN1dGVSZXN1bHQgKSB7XG4gICAgaWYgKCByZXN1bHQucm93c0VmZmVjdGVkID09PSAwKSAgdGhyb3cgbmV3IEVycm9yKCdOb25lIHJvdyBlZmZlY3RlZCcpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoU3luYyggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuc3FsaXRlLmV4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSAsIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+ICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCApIFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG5cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luRXhlY3V0ZSggc3FsLCBwYXJhbWV0ZXJzIClcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBydW5TY3JpcHQoc3FsOiBzdHJpbmcpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgc3FsLnNwbGl0KCBNVUxUSV9TUUxfU0VQQVJBVE9SICkuZm9yRWFjaChcbiAgICAgIGFzeW5jIHNxbD0+IGF3YWl0IChzcWwudHJpbSgpICE9PSAnJykgJiYgdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIFtdKVxuICAgIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zKCk6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZSgnQkVHSU4gVFJBTlNBQ1RJT047JylcbiAgICByZXR1cm4gbmV3IFNxbGl0ZVRyYW5zYWN0aW9uKHRoaXMpXG4gIH1cbn0iLCJpbXBvcnQgeyBwcm9taXNpZnkgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgQ2FsbGJhY2sgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dNYW5hZ2VyLCBMb2dnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBTcWxQYXJhbWV0ZXJzLCBTcWxBbmRQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuXG5pbXBvcnQgKiBhcyBEYXRhYmFzZSBmcm9tICdiZXR0ZXItc3FsaXRlMydcblxuZXhwb3J0IGNsYXNzIFNxbGl0ZVdyYXBwZXIge1xuICBwcml2YXRlIGRiIDogRGF0YWJhc2VcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTcWxpdGVXcmFwcGVyLm5hbWUpXG4gIH1cblxuICBwdWJsaWMgb3BlbihkYkZpbGVQYXRoOiBzdHJpbmcsIGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGIgPSBuZXcgRGF0YWJhc2UoZGJGaWxlUGF0aClcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1Mgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCkgOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZGIub3BlbiB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5PcGVuKGRiRmlsZVBhdGg6IHN0cmluZykgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMub3BlbikuY2FsbCh0aGlzLCBkYkZpbGVQYXRoKVxuICB9XG5cbiAgcHVibGljIGNsb3NlKGNhbGxiYWNrPzogQ2FsbGJhY2s8Ym9vbGVhbj4pIDogYm9vbGVhbiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogdHJ1ZSB9XG4gICAgdHJ5IHtcbiAgICAgIGlmICggdGhpcy5kYiAmJiB0aGlzLmlzQ29ubmVjdGVkICkge1xuICAgICAgICB0aGlzLmRiLmNsb3NlKCkgXG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZSggYFNVQ0NFU1MgY2xvc2VgIClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBjbG9zZWQgYWxyZWFkeWApXG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0ID0geyBlcnI6IGVyciwgcmVzdWx0IDogZmFsc2UgfSAgXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvciggYEZBSUxEIGNsb3NlYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdCAgICBcbiAgfVxuXG4gIHB1YmxpYyBhc3luQ2xvc2UoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5jbG9zZSkuY2FsbCh0aGlzKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPFNxbEV4ZWN1dGVSZXN1bHQ+KTogU3FsRXhlY3V0ZVJlc3VsdCB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogeyBsYXN0SW5zZXJ0Um93SWQ6ICcwJywgcm93c0VmZmVjdGVkOiAwIH0gfVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBjb25zdCBzcWxSZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5ydW4ocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHJldC5yZXN1bHQgPSB7IFxuICAgICAgICBsYXN0SW5zZXJ0Um93SWQgOiBzcWxSZXN1bHQubGFzdEluc2VydFJPV0lELnRvU3RyaW5nKCksXG4gICAgICAgIHJvd3NFZmZlY3RlZDogc3FsUmVzdWx0LmNoYW5nZXMgXG4gICAgICB9XG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgZXhlY3V0ZSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgZWZmZWN0ZWQgPSAke3JldC5yZXN1bHQucm93c0VmZmVjdGVkfWApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PGFueT4+ICkgOiBBcnJheTxhbnk+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8YW55PigpIH1cbiAgICB0cnkge1xuICAgICAgcmV0LnJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLmFsbChwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCByZXN1bHQgY291bnQgPSAke3JldC5yZXN1bHQubGVuZ3RofWApXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHF1ZXJ5IHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+ICApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PigpIH0gXG4gICAgbGV0IHNxbCA6IFNxbEFuZFBhcmFtZXRlcnMgfCB1bmRlZmluZWRcbiAgICB0cnkge1xuICAgICAgc3Fscy5mb3JFYWNoKCBzID0+IHtcbiAgICAgICAgc3FsID0gc1xuICAgICAgICBsZXQgZXhlY1JldCA9IHRoaXMuZXhlY3V0ZSggcy5xdWVyeSwgcy5wYXJhbWV0ZXJzIClcbiAgICAgICAgb25FeGVjdXRlZCAmJiBvbkV4ZWN1dGVkKCBleGVjUmV0LCBzICkgIFxuICAgICAgICByZXQucmVzdWx0LnB1c2goIGV4ZWNSZXQgKVxuICAgICAgfSlcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlQmF0Y2gsIHNxbCA9ICR7c3FsIS5xdWVyeX0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHNxbCEucGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soIHJldC5lcnIsIHJldC5yZXN1bHQgKVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bkV4ZWN1dGUoc3FsLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlKS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luUXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycyk6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5xdWVyeSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiwgb25FeGVjdXRlZD86IChyZXQgOiBTcWxFeGVjdXRlUmVzdWx0LCBzIDogU3FsQW5kUGFyYW1ldGVycyApID0+IHZvaWQgKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZUJhdGNoKS5jYWxsKCB0aGlzLCBzcWxzLCBvbkV4ZWN1dGVkIClcbiAgfVxuXG59IiwiaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSAnZXZlbnRzJ1xuaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBDb2RlQ29udHJhY3QgYXMgREJDLCBNYXliZVVuZGVmaW5lZCwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMZXZlbEJsb2NrIH0gZnJvbSAnLi9MZXZlbEJsb2NrJ1xuaW1wb3J0IHsgRGJTZXNzaW9uIH0gZnJvbSAnLi9EYlNlc3Npb24nXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBFbnRpdHksIEZpbHRlckZ1bmN0aW9uIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBTcWxpdGVDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9TcWxpdGVDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IsIGlzQ29tcG9zaXRlS2V5IH0gZnJvbSAnLi9Nb2RlbCc7XG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgRW50aXR5UHJveHkgfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBTcWxDb25kaXRpb24sIFNxbFJlc3VsdFJhbmdlLCBTcWxPcmRlciB9IGZyb20gJy4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IEJsb2NrSGVhZGVyLCBCbG9jaywgVHJhbnNhY3Rpb24gfSBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0IHsgQmxvY2tDYWNoZSB9IGZyb20gJy4vQmxvY2tDYWNoZSdcblxudHlwZSBOYW1lZEhvb2s8VEZ1bmM+ID0geyBuYW1lOiBzdHJpbmcsIGhvb2sgOiBURnVuYyB9XG5leHBvcnQgdHlwZSBDb21taXRCbG9ja0hvb2sgPSAoIGJsb2NrIDogQmxvY2sgKSA9PiB2b2lkXG5leHBvcnQgdHlwZSBSb2xsYmFja0Jsb2NrSG9vayA9ICggZnJvbUhlaWdodCA6IG51bWJlciwgdG9IZWlnaHQgOiBudW1iZXIgKSA9PiB2b2lkXG5cbmV4cG9ydCB0eXBlIFNtYXJ0REJPcHRpb25zID0ge1xuICAvKipcbiAgICogY2FjaGVkIGhpc3RvcnkgY291bnQoYmxvY2sgY291bnQpLCB1c2VkIHRvIHJvbGxiYWNrIGJsb2NrXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBoaXN0b3J5Rm9yUm9sbGJhY2s/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBjbGVhbiBwZXJzaXN0ZWQgaGlzdG9yeSBhdXRvbWF0aWNhbGx5XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5PyA6IGJvb2xlYW4sXG5cbiAgLyoqXG4gICAqIGNhY2hlZCBsYXN0IGJsb2NrIGNvdW50IFxuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgY2FjaGVkQmxvY2tDb3VudD8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIG1heCBjYWNoZWQgZW50aXR5IGNvdW50LCBjb25maWcgaXQgcGVyIG1vZGVsLCBMUlUgIFxuICAgKiBzYW1wbGU6IHsgVXNlcjogMjAwLCBUcmFuczogNTAwMCB9IG1heCBjYWNoZWQgMjAwcyBVc2VyIO+8jDUwMDAgZm9yIFRyYW5zXG4gICAqIEBkZWZhdWx0IDUwMDAgZWFjaCBtb2RlbFxuICAgKi9cbiAgZW50aXR5Q2FjaGVPcHRpb25zPyA6IEVudGl0eUNhY2hlT3B0aW9uc1xuXG59XG5cbi8qKlxuICogT1JNIGxpa2UgdG8gb3BlcmF0ZSBibG9ja2NoYWluIGRhdGFcbiAqIEBldmVudCByZWFkeSBlbW1pdCBhZnRlciBpbml0aWFsaXplZFxuICogQGV2ZW50IGNsb3NlIGVtbWl0IGFmdGVyIGNsb3NlZFxuICovXG5leHBvcnQgY2xhc3MgU21hcnREQiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgb3B0aW9ucyA6IFNtYXJ0REJPcHRpb25zXG4gIHByaXZhdGUgaG9sZExvY2tzIDogU2V0PHN0cmluZz5cbiAgcHJpdmF0ZSBjb21taXRCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj5cbiAgcHJpdmF0ZSByb2xsYmFja0Jsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+XG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgY2FjaGVkQmxvY2tzIDogQmxvY2tDYWNoZVxuICBwcml2YXRlIHNjaGVtYXMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG4gIHByaXZhdGUgYmxvY2tTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgbG9jYWxTZXNzaW9uIDogRGJTZXNzaW9uXG4gIHByaXZhdGUgYmxvY2tEQiA6IExldmVsQmxvY2tcbiAgcHJpdmF0ZSBjdXJyZW50QmxvY2sgOiBCbG9jayB8IG51bGxcblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgXG4gICAqIE5PVElDIDogeW91IG5lZWQgY2FsbCBpbml0IGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gZGJQYXRoIHBhdGggb2YgYmxvY2tjaGFpbiBkYlxuICAgKiBAcGFyYW0gbGV2ZWxCbG9ja0RpciBwYXRoIG9mIGJsb2NrIGhlYWRlciBkYlxuICAgKiBAcGFyYW0gb3B0aW9ucyBvZiBTbWFydERCXG4gICAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoIGRiUGF0aDogc3RyaW5nLCBsZXZlbEJsb2NrRGlyOiBzdHJpbmcsIG9wdGlvbnM/IDogU21hcnREQk9wdGlvbnMgKSB7XG4gICAgREJDLmFyZ3VtZW50KCdkYlBhdGgnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGRiUGF0aCkpXG4gICAgREJDLmFyZ3VtZW50KCdsZXZlbEJsb2NrRGlyJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShsZXZlbEJsb2NrRGlyKSlcblxuICAgIHN1cGVyKClcbiAgICB0aGlzLm9wdGlvbnMgPSAge1xuICAgICAgY2FjaGVkQmxvY2tDb3VudCA6IDEwLFxuICAgICAgaGlzdG9yeUZvclJvbGxiYWNrIDogMTAsXG4gICAgICBhdXRvQ2xlYW5QZXJzaXN0ZWRIaXN0b3J5IDogZmFsc2UsICAgICAgXG4gICAgICBlbnRpdHlDYWNoZU9wdGlvbnMgOiB7IGRlZmF1bHQgOiA1MDAwIH1cbiAgICB9IHx8IG9wdGlvbnNcblxuICAgIHRoaXMuaG9sZExvY2tzID0gbmV3IFNldDxzdHJpbmc+KClcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MgPSBuZXcgQXJyYXk8TmFtZWRIb29rPENvbW1pdEJsb2NrSG9vaz4+KClcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Um9sbGJhY2tCbG9ja0hvb2s+PigpXG4gICAgdGhpcy5zY2hlbWFzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihTbWFydERCLm5hbWUpXG4gICAgdGhpcy5ibG9ja0RCID0gbmV3IExldmVsQmxvY2sobGV2ZWxCbG9ja0RpcilcbiAgICB0aGlzLmNhY2hlZEJsb2NrcyA9IG5ldyBCbG9ja0NhY2hlKCB0aGlzLm9wdGlvbnMuY2FjaGVkQmxvY2tDb3VudCEgKVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IG5ldyBTcWxpdGVDb25uZWN0aW9uKHsgc3RvcmFnZTogZGJQYXRoIH0pXG4gICAgdGhpcy5ibG9ja1Nlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0Jsb2NrJylcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnTG9jYWwnKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRTY2hlbWE8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICwgdGhyb3dJZlVuZGVmaW5lZCA9IGZhbHNlLCB0aHJvd0lmUmVhZG9ubHkgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxNb2RlbFNjaGVtYT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IGlzU3RyaW5nKCBtb2RlbCApID8gU3RyaW5nKG1vZGVsKSA6ICggbW9kZWwgYXMgQ29uc3RydWN0b3I8VEVudGl0eT4gKS5uYW1lIFxuICAgIFxuICAgIGxldCBzY2hlbWEgPSB0aGlzLnNjaGVtYXMuZ2V0KG1vZGVsTmFtZSkgXG4gICAgdGhyb3dJZlVuZGVmaW5lZCAmJiBEQkMudmVyaWZ5KCBzY2hlbWEgIT09IHVuZGVmaW5lZCwgYHVucmVnaXN0ZXJlZCBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nYClcbiAgICB0aHJvd0lmUmVhZG9ubHkgJiYgREJDLnZlcmlmeSggIXNjaGVtYSEuaXNSZWFkb25seSwgYG1vZGVsICckeyBtb2RlbE5hbWUgfScgaXMgcmVhZG9ubHlgKVxuXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRTZXNzaW9uPFRFbnRpdHk+KCBzY2hlbWEgOiBNb2RlbFNjaGVtYSApIDogRGJTZXNzaW9uIHsgXG4gICAgcmV0dXJuIHNjaGVtYSEuaXNMb2NhbCA/IHRoaXMubG9jYWxTZXNzaW9uIDogdGhpcy5ibG9ja1Nlc3Npb25cbiAgfVxuXG4gIHByaXZhdGUgcHJlQ29tbWl0QmxvY2soIGJsb2NrOiBCbG9jayApIHtcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZm9yRWFjaCggbmggPT4gbmguaG9vayggYmxvY2sgKSApXG4gIH1cblxuICBwcml2YXRlIHBvc3RDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuZW1pdCgnbmV3QmxvY2snLCBibG9jaylcbiAgfVxuXG4gIHByaXZhdGUgcHJlUm9sbGJhY2tCbG9jayggZnJvbSA6IG51bWJlciwgdG8gOiBudW1iZXIgKSB7XG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZm9yRWFjaCggbmggPT4gbmguaG9vayggZnJvbSwgdG8gKSApXG4gIH1cblxuICBwcml2YXRlIHBvc3RSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLmVtaXQoJ3JvbGxiYWNrQmxvY2snLCB7IGZyb20sIHRvIH0gKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rLCB3aGljaCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgY29tbWl0IGJsb2NrXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKiBAcGFyYW0gaG9va0Z1bmMgaG9vayBmdW5jdGlvbiAsICggYmxvY2sgKSA9PiB2b2lkXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IENvbW1pdEJsb2NrSG9vayApIHtcbiAgICBEQkMuYXJndW1lbnQoICdob29rRnVuYycsICgpID0+IERCQy5ub3ROdWxsKGhvb2tGdW5jKSlcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgIFxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZChuaD0+bmgubmFtZSA9PT0gbmFtZS50cmltKCkpID09PSB1bmRlZmluZWQsIFxuICAgICAgYGhvb2sgbmFtZWQgJyR7bmFtZX0nIGV4aXN0IGFscmVhZHlgKVxuICAgIFxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5wdXNoKHsgbmFtZSwgaG9vayA6IGhvb2tGdW5jIH0pXG4gIH1cblxuICAvKipcbiAgICogdW5yZWdpc3RlciBjb21taXQgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyQ29tbWl0QmxvY2tIb29rKCBuYW1lOiBzdHJpbmcgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgIFxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5jb21taXRCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMuY29tbWl0QmxvY2tIb29rcy5zbGljZSggaW5kZXggKVxuICB9XG5cbiAgLyoqXG4gICAqIHJlZ2lzdGVyIHJvbGxiYWNrIGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBmcm9tSGVpZ2h0LCB0b0hlaWdodCApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlclJvbGxiYWNrQmxvY2tIb29rKCBuYW1lOiBzdHJpbmcsIGhvb2tGdW5jOiBSb2xsYmFja0Jsb2NrSG9vayApIHtcbiAgICBEQkMuYXJndW1lbnQoICdob29rRnVuYycsICgpID0+IERCQy5ub3ROdWxsKGhvb2tGdW5jKSlcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgIFxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG5cbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5wdXNoKHsgbmFtZSwgaG9vazogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIHJvbGxiYWNrIGJsb2NrIGhvb2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3RlclJvbGxiYWNrQmxvY2tIb29rKCBuYW1lOiBzdHJpbmcgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5maW5kSW5kZXgoIG5oID0+IG5oLm5hbWUgPT09IG5hbWUudHJpbSgpIClcbiAgICBpZiAoIGluZGV4ID49IDAgKSB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5zbGljZSggaW5kZXggKVxuICB9XG5cblxuICAvKipcbiAgICogaW5pdGlhbGl6ZSBTbWFydERCICwgeW91IG5lZWQgY2FsbCB0aGlzIGJlZm9yZSB1c2UgU21hcnREQlxuICAgKiBAcGFyYW0gc2NoZW1hcyB0YWJsZSBzY2hlbWFzIGluIERhdGFiYXNlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaW5pdChzY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnc2NoZW1hcycsICgpPT4gREJDLm5vdE51bGwoc2NoZW1hcykpXG5cbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY29ubmVjdCgpICAgIFxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5vcGVuKClcblxuICAgIGZvciggY29uc3Qgc2NoZW1hIG9mIHNjaGVtYXMgKSB7XG4gICAgICB0aGlzLnNjaGVtYXMuc2V0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEgKVxuICAgICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb24oIHNjaGVtYSApXG5cbiAgICAgIHNlc3Npb24ucmVnaXN0ZXJTY2hlbWEoc2NoZW1hKVxuICAgICAgc2Vzc2lvbi5zeW5jU2NoZW1hKHNjaGVtYSlcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYHN5bmMgc2NoZW1hIG1vZGVsID0gJHtzY2hlbWEubW9kZWxOYW1lfSBgKVxuXG4gICAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSB7IFxuICAgICAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnkoIHNjaGVtYS5tb2RlbE5hbWUsIHt9LCBmYWxzZSwgdHJ1ZSApXG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYG1vZGVsICR7c2NoZW1hLm1vZGVsTmFtZX0gY2FjaGVkICR7aXRlbXMubGVuZ3RofSBlbnRpdGllcyBgKVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmVtaXQoICdyZWFkeScsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGZyZWUgcmVzb3VyY2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmNsb3NlKClcbiAgICBcbiAgICB0aGlzLmVtaXQoJ2Nsb3NlZCcsIHRoaXMgKVxuICB9XG5cbiAgLyoqXG4gICAqIGhlaWdodCBvZiBsYXN0IGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9ja0hlaWdodCgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5ibG9ja0RCLmxhc3RCbG9ja0hlaWdodFxuICB9XG5cbiAgLyoqXG4gICAqIGJsb2NrcyBjb3VudFxuICAgKi9cbiAgcHVibGljIGdldCBibG9ja3NDb3VudCgpIDogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxXG4gIH1cblxuICAvKipcbiAgICogbGFzdCBjb21taXRlZCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2soKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgLy8gVE9ETzogcmV0dXJuIGxhc3QgYmxvY2sgY29weSA/XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkQmxvY2tzLmdldCggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICB9XG5cbiAgLyoqXG4gICAqIGhvbGQgYSBsb2NrIG5hbWUgd2hpY2ggb25seSBzdWNjZWVkIGluIGZpcnN0IHRpbWUgb2YgZWFjaCBibG9jay5cbiAgICogQHBhcmFtIGxvY2tOYW1lIGxvY2sgbmFtZVxuICAgKiBAcGFyYW0gbm90VGhyb3cgZG8gbm90IHRocm93IGV4Y2VwdGlvbiBpZiBsb2NrIGZhaWxlZFxuICAgKi9cbiAgcHVibGljIGxvY2tJbkN1cnJlbnRCbG9jayggbG9ja05hbWU6IHN0cmluZywgbm90VGhyb3cgPSBmYWxzZSApIDogYm9vbGVhbiB7XG4gICAgaWYgKCAhdGhpcy5ob2xkTG9ja3MuaGFzKCBsb2NrTmFtZSApICkge1xuICAgICAgdGhpcy5ob2xkTG9ja3MuYWRkKCBsb2NrTmFtZSApXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIGlmICggIW5vdFRocm93ICkgdGhyb3cgbmV3IEVycm9yKGAke2xvY2tOYW1lfSBleGlzdHMgYWxyZWFkeWApXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBiZWdpbiBhIG5ldyBibG9ja1xuICAgKiBAcGFyYW0gYmxvY2tIZWFkZXIgXG4gICAqL1xuICBwdWJsaWMgYmVnaW5CbG9jayggYmxvY2s6IEJsb2NrICkgOiB2b2lkIHtcbiAgICAvLyBUT0RPOiB2ZXJpZnkgYmxvY2tIZWFkZXIgaGVyZVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCAoKT0+IERCQy5ub3ROdWxsKGJsb2NrKSlcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgYmxvY2suaGVpZ2h0ID09PSB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDEsIGBpbnZhbGlkIGJsb2NrIGhlaWdodCAke2Jsb2NrLmhlaWdodH0sIGxhc3QgPSAke3RoaXMubGFzdEJsb2NrSGVpZ2h0fWApXG4gICAgXG4gICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGJsb2NrIGhlaWdodCA9ICR7YmxvY2suaGVpZ2h0fWApXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHR9YClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlQ29tbWl0QmxvY2soIHRoaXMuY3VycmVudEJsb2NrIClcblxuICAgIGxldCBibG9ja0hlYWRlciA9IE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShibG9ja0hlYWRlciwgJ3RyYW5zYWN0aW9ucycpXG4gICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmFwcGVuZEJsb2NrKCBibG9ja0hlYWRlciwgdGhpcy5ibG9ja1Nlc3Npb24uZ2V0Q2hhbmdlcygpIClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uc2F2ZUNoYW5nZXMoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCApXG4gICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5Rm9yUm9sbGJhY2shIClcbiAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLnB1dCggdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgICAgdGhpcy5ob2xkTG9ja3MuY2xlYXIoKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RDb21taXRCbG9jayggdGhpcy5sYXN0QmxvY2shIClcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7IFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGNvbW1pdEJsb2NrICggaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgZnJvbUhlaWdodCA9IHRoaXMuY3VycmVudEJsb2NrID8gdGhpcy5jdXJyZW50QmxvY2shLmhlaWdodCA6IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgdG9IZWlnaHQgPSBoZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGFzdEJsb2NrSGVpZ2h0IDogaGVpZ2h0XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlUm9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0IClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIClcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIHRvSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+IHRvSGVpZ2h0ICkge1xuICAgICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLmV2aXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0LCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICB9XG4gICAgICB0aGlzLmhvbGRMb2Nrcy5jbGVhcigpXG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdFJvbGxiYWNrQmxvY2soIGZyb21IZWlnaHQsICB0b0hlaWdodCApICAgICAgXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+IDAsIGBzZXJpYWwgbXVzdCBncmVhdCB0aGFuIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgZW50aXR5IGtleVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRFbnRpdHlLZXk8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlLZXk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG4gICAgXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwsIHRydWUpIVxuICAgIHJldHVybiBzY2hlbWEuZ2V0S2V5KCBlbnRpdHkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0cmFja2luZyBlbnRpdHkgYnkga2V5IFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCkgPT4gREJDLm5vdE51bGwoa2V5KSApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmF0dGFjaCggc2NoZW1hLCBrZXkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIG5ldyBlbnRpdHkgd2hpY2ggY2hhbmdlIHdpbGwgYmUgdHJhY2tlZCBhbmQgcGVyc2lzdGVudGVkIChieSBzYXZlQ2hhbmdlcykgYXV0b21hdGljYWxseVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5IHdoaWNoIHVuaXF1ZWQgaW4gZGF0YWJhc2VcbiAgICogQHBhcmFtIGVudGl0eSBwcm90b3R5cGUgZW50aXR5IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBjb3B5IHRvIHJlc3VsdCBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tpbmcgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5T3JFbnRpdHk6IEVudGl0eUtleSB8IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5T3JFbnRpdHknLCAoKT0+IERCQy5ub3ROdWxsKGtleU9yRW50aXR5KSlcbiAgICBcbiAgICBsZXQga2V5IDogRW50aXR5S2V5XG4gICAgbGV0IGVudGl0eTogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG5cbiAgICBpZiAoIGlzUHJpbWl0aXZlS2V5KCBrZXlPckVudGl0eSApIHx8IGlzQ29tcG9zaXRlS2V5KCBrZXlPckVudGl0eSApICkgeyBcbiAgICAgIGtleSA9IGtleU9yRW50aXR5IGFzIEVudGl0eUtleSBcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbnRpdHkgPSBrZXlPckVudGl0eSBhcyBURW50aXR5XG4gICAgICBrZXkgPSBzY2hlbWEuZ2V0S2V5KGVudGl0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSB0cmFja2luZyBlbnRpdHlgIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIGFuZCBjYWNoZSByZXN1bHQgaWYgdHJ1ZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJ5PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdjb25kaXRpb24nLCAoKT0+IERCQy5ub3ROdWxsKGNvbmRpdGlvbikpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0TWFueTxURW50aXR5Pihtb2RlbCwgY29uZGl0aW9uKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgY29uZGl0aW9uID0gJyR7SlNPTi5zdHJpbmdpZnkoY29uZGl0aW9uKX0nIClgKVxuICAgIFxuICAgIGlmICggaXRlbXMubGVuZ3RoID09PSAwICkgIHJldHVybiB1bmRlZmluZWQgXG4gICAgXG4gICAgbGV0IGVudGl0eSA9IGl0ZW1zWzBdIFxuICAgIHJldHVybiB0cmFjayA/IHRoaXMuYXR0YWNoKCBtb2RlbCwgdGhpcy5nZXRFbnRpdHlLZXkobW9kZWwsIGVudGl0eSkhICkgOiBlbnRpdHlcbiAgfVxuXG4gICAgLyoqXG4gICAqIGdldCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gZmluZCBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIGFuZCBjYWNoZSByZXN1bHQgaWYgdHJ1ZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0TWFueShtb2RlbCwgY29uZGl0aW9uLCB0cmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBmcm9tIGNhY2hlXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgLCB0cmFjayA9IGZhbHNlICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkQ2FjaGVkKG1vZGVsLCBrZXksIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldEFsbENhY2hlZCggbW9kZWwsIGZpbHRlciwgdHJhY2sgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmV4aXN0cyhtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvdW50IHJlY29yZHMgY291bnQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY291bnQobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBhdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrcyA6IEFycmF5PEJsb2NrSGVhZGVyPiwgIGdldFRyYW5zYWN0aW9uczogKCkgPT4gUHJvbWlzZTxBcnJheTxUcmFuc2FjdGlvbj4+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIGxldCB0cmFuc0dyb3VwID0gbmV3IE1hcDxzdHJpbmcsIEFycmF5PFRyYW5zYWN0aW9uPj4oKVxuICAgIGxldCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBnZXRUcmFuc2FjdGlvbnMoKVxuXG4gICAgdHJhbnNhY3Rpb25zLmZvckVhY2goIHQgPT4ge1xuICAgICAgaWYgKCF0cmFuc0dyb3VwLmhhcyggdC5ibG9ja0lkICkpIHRyYW5zR3JvdXAuc2V0KCB0LmJsb2NrSWQsIG5ldyBBcnJheTxUcmFuc2FjdGlvbj4oKSApXG4gICAgICB0cmFuc0dyb3VwLmdldCggdC5ibG9ja0lkICkhLnB1c2goIHQgKVxuICAgIH0gKVxuXG4gICAgYmxvY2tzLmZvckVhY2goIGIgPT4gYlsndHJhbnNhY3Rpb25zJ10gPSB0cmFuc0dyb3VwLmdldChiLmlkISkgKVxuICAgIHJldHVybiBibG9ja3MgYXMgQXJyYXk8QmxvY2s+XG4gIH1cblxuICBwcml2YXRlIGNvcHlDYWNoZWRCbG9jayggZ2V0Q2FjaGVCbG9jayA6ICgpID0+IE1heWJlVW5kZWZpbmVkPEJsb2NrPiwgd2l0aFRyYW5zYWN0aW9ucyA6IGJvb2xlYW4gKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgbGV0IGNhY2hlZEJsb2NrID0gZ2V0Q2FjaGVCbG9jaygpXG4gICAgaWYgKCBjYWNoZWRCbG9jayA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIFxuICAgIGxldCByZXN1bHQgPSBPYmplY3QuYXNzaWduKHt9LCBjYWNoZWRCbG9jaylcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkge1xuICAgICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSggcmVzdWx0LCAndHJhbnNhY3Rpb25zJylcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgaGVpZ2h0XG4gICAqIEBwYXJhbSBoZWlnaHQgYmxvY2sgaGVpZ2h0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUhlaWdodCggaGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2hlaWdodCcsIGhlaWdodCA+PSAwICwgJ2hlaWdodCBtdXN0IGdyZWF0IG9yIGVxdWFsIHplcm8nKVxuICAgIFxuICAgIGxldCBjYWNoZWRCbG9jayA9IHRoaXMuY29weUNhY2hlZEJsb2NrKCAoKSA9PiB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoaGVpZ2h0KSwgd2l0aFRyYW5zYWN0aW9ucyApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrKCBoZWlnaHQgKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgfHwgYmxvY2tIZWFkZXIgPT09IHVuZGVmaW5lZCAgKSByZXR1cm4gYmxvY2tIZWFkZXJcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggW2Jsb2NrSGVhZGVyIV0gLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IGJsb2NrSGVhZGVyIS5pZCEgfSkgKVswXVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBibG9jayBoZWFkZXIgYnkgYmxvY2sgaWRcbiAgICogQHBhcmFtIGJsb2NrSWQgYmxvY2sgaWQgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tCeUlkKCBibG9ja0lkIDogc3RyaW5nLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShibG9ja0lkKSlcblxuICAgIGxldCBjYWNoZWRCbG9jayA9IHRoaXMuY29weUNhY2hlZEJsb2NrKCAoKSA9PiB0aGlzLmNhY2hlZEJsb2Nrcy5nZXRCeUlkKGJsb2NrSWQpLCB3aXRoVHJhbnNhY3Rpb25zIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tCeUlkKCBibG9ja0lkIClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBoZWlnaHQgcmFuZ2VcbiAgICogQHBhcmFtIG1pbkhlaWdodCBtaW4gaGVpZ2h0KGluY2x1ZGVkKVxuICAgKiBAcGFyYW0gbWF4SGVpZ2h0IG1heCBoZWlnaHQoaW5jbHVkZWQpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0IDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21pbkhlaWdodCwgbWF4SGVpZ2h0JywgbWluSGVpZ2h0ID49IDAgJiYgbWF4SGVpZ2h0ID49IG1pbkhlaWdodCwgJ21pbkhlaWdodCBvciBtYXhIZWlnaHQgaXMgaW52YWxpZCcpXG4gICBcbiAgICAvLyBUT0RPOiBvYnRhaW4gYmxvY2tzIGZyb20gY2FjaGVcbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCwgbWF4SGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBibG9jayBpZCBhcnJheVxuICAgKiBAcGFyYW0gYmxvY2tJZHMgYXJyYXkgb2YgYmxvY2sgaWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+LCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkcycsICgpID0+IERCQy5ub3ROdWxsKGJsb2NrSWRzKSApXG5cbiAgICAvLyBUT0RPOiBvYnRhaW4gYmxvY2tzIGZyb20gY2FjaGVcbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SWRzKGJsb2NrSWRzKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG59IiwiaW1wb3J0IHsgRW50aXR5LCAgTnVsbGFibGUgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgRW50aXR5VHJhY2tlciwgUHJveGllZEVudGl0eVRyYWNrZXIgfSBmcm9tICcuL0VudGl0eVRyYWNrZXInXG5cbi8qKiAgICAgXG4gKiAgICAgU1RBVEUgVFJBTlNGRVIgICAgICAgICAgICAgICAgICBBQ1RJT04gICAgICAgICAgICAgICAgVFJBQ0sgICAgICBDQUNIRVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgICA/ICAgICAgICAgLT4gcGVyc2l0ZW50ICAgICAgc2Vzc2lvbi5sb2FkICAgICAgICAgICAgIHRyYWNrICAgICBjYWNoZVxuICogICAgICA/ICAgICAgICAgLT4gbmV3ICAgICAgICAgICAgc2Vzc2lvbi5jcmVhdGUgICAgICAgICAgIHRyYWNrICAgICAgIC0gIFxuICogcGVyc2lzdGVudCAgICAgLT4gbW9kaWZpZWQgICAgICAgc2V0IHByb3BlcnR5ICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IGRlbGV0ZWQgICAgICAgIHNlc3Npb24uZGVsICAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBuZXcgfCBtb2RpZmllZCAtPiBwcmVzaXN0ZW50ICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAga2VlcCAgICAgY2FjaGV8dXBkYXRlIFxuICogZGVsZXRlZCAgICAgICAgLT4gdHJhbnNpZW50ICAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGV2aXQgICAgICAgZXZpdFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmV4cG9ydCBlbnVtIEVudGl0eVN0YXRlIHtcbiAgVHJhbnNpZW50ICA9IC0xLFxuICBQZXJzaXN0ZW50ID0gMCxcbiAgXG4gIE5ldyAgICAgICAgPSAxLFxuICBNb2RpZmllZCAgID0gMixcbiAgRGVsZXRlZCAgICA9IDMsXG59XG5cbmV4cG9ydCBlbnVtIEVudGl0eUNoYW5nZVR5cGUge1xuICBOZXcgICAgICAgPSAxLFxuICBNb2RpZnkgICAgPSAyLFxuICBEZWxldGUgICAgPSAzLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50IDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19zY2hlbWFfXyAgICAgOiBNb2RlbFNjaGVtYVxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX190bXBDaGFuZ2VzX18gOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlcjtcblxuICBjb25zdHJ1Y3Rvcih0cmFja2VyOiBFbnRpdHlUcmFja2VyKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0V4dGVuZGVkKGVudGl0eTogRW50aXR5KSB7XG4gICAgcmV0dXJuIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zY2hlbWFfXycpICYmIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zdGF0ZV9fJylcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNQcm94aWVkKGVudGl0eTogRW50aXR5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBFbnRpdHlQcm94eS5pc0V4dGVuZGVkKGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY29udmVydFRvUHJveGllZDxURW50aXR5PihlbnRpdHk6IEVudGl0eSkgOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgUHJveGllZCBFbnRpdHlgKVxuICAgIFxuICAgIHJldHVybiBlbnRpdHkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBwcm94eVRvRW50aXR5KHByb3hpZWQ6IFByb3hpZWQ8RW50aXR5Pik6IEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IHt9XG4gICAgZm9yKCBsZXQgayBpbiBwcm94aWVkICkge1xuICAgICAgaWYgKCBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGspICkgZW50aXR5W2tdID0gcHJveGllZFtrXVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlICkgOiBURW50aXR5IHtcbiAgICBsZXQgcmVzdWx0ID0gIE9iamVjdC5hc3NpZ24oe1xuICAgICAgX3ZlcnNpb25fICAgICAgOiAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fdG1wQ2hhbmdlc19fIDogbnVsbFxuICAgIH0sIGVudGl0eSlcbiAgICBcbiAgICByZXN1bHQuX3ZlcnNpb25fID0gcmVzdWx0Ll92ZXJzaW9uXyB8fCAxXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIG9uUHJvcGVydHlTZXQoZW50aXR5OiBFbnRpdHksIHByb3BlcnR5TmFtZTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnksIHJlY2VpdmVyOiBhbnkpIDogYm9vbGVhbiB7ICAgICAgXG4gICAgY29uc3QgZXh0ID0gZW50aXR5IGFzIEVudGl0eUV4dGVuc2lvbiBcbiAgICBjb25zdCBuYW1lID0gcHJvcGVydHlOYW1lLnRvU3RyaW5nKClcblxuICAgIGlmICggIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkobmFtZSkgfHwgIWV4dC5fX3RyYWNraW5nX18gIHx8IHZhbHVlID09PSBlbnRpdHlbcHJvcGVydHlOYW1lXSApIHtcbiAgICAgIGVudGl0eVtwcm9wZXJ0eU5hbWVdID0gdmFsdWVcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByb3BlcnR5IGFmdGVyIGRlbGV0ZWRgKVxuICAgIH1cbiAgICBcbiAgICBsZXQgc2NoZW1hID0gZXh0Ll9fc2NoZW1hX19cbiAgICBpZiAoIHNjaGVtYS5pc1JlYWRvbmx5ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSByZWFkb25seSBtb2RlbCAnJHtzY2hlbWEubW9kZWxOYW1lfSdgKVxuICAgIH1cblxuICAgIGlmICggc2NoZW1hLnByaW1hcnlLZXkgPT09IG5hbWUgfHwgc2NoZW1hLmNvbXBvc2l0ZUtleXMuaW5kZXhPZihuYW1lKSA+PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcmltYXJ5IGZpZWxkIHByb3BlcnR5YClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX2RldGFjaGVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlcikuYXR0YWNoKCByZWNlaXZlciBhcyBQcm94aWVkPGFueT4gKVxuICAgICAgZXh0Ll9fZGV0YWNoZWRfXyA9IGZhbHNlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuUGVyc2lzdGVudCApIHtcbiAgICAgIGV4dC5fdmVyc2lvbl8gKytcbiAgICAgIGV4dC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5Nb2RpZmllZFxuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fID0geyAgICAgICAgXG4gICAgICAgIHR5cGUgOiBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSwgICAgICAgIFxuICAgICAgICBkYlZlcnNpb246IGV4dC5fdmVyc2lvbl8sXG4gICAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPih7IFxuICAgICAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLCBvcmlnaW5hbDogZXh0Ll92ZXJzaW9uXyAtIDEsIGN1cnJlbnQ6IGV4dC5fdmVyc2lvbl8gXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIGV4dC5fX3RtcENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMucHVzaCh7IG5hbWU6IG5hbWUsIG9yaWdpbmFsOiBleHRbbmFtZV0sIGN1cnJlbnQ6IHZhbHVlIH0pXG4gICAgfVxuXG4gICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRGlydHkoIGVudGl0eTogRW50aXR5ICkgOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGF0ZSA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KS5fX3N0YXRlX19cbiAgICByZXR1cm4gISAoIHN0YXRlID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50IHx8IHN0YXRlID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eSBjcmVhdGUgbWFudWFsXG4gICAqIEBwYXJhbSBtb2RlbCBNb2RlbCBOYW1lXG4gICAqL1xuICBwdWJsaWMgcHJveHlOZXc8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoIGVudGl0eSwgc2NoZW1hLCAgRW50aXR5U3RhdGUuTmV3IClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCB9KSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBlbnRpdHkgd3JhcHBlZCBieSBwcm94eSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgY2FuIGJlIGRldGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGxvYWRlZCBmcm9tIGRhdGFiYXNlLiBBVFRFTlNUSU9OOiBlbnN1cmUgdGhhdCBoYXMgcHJvcGVydHkgJ192ZXJzaW9uXydcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eVBlcnNpc3RlbnQ8VEVudGl0eT4oIGVudGl0eTogRW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlDYWNoZSB9IGZyb20gJy4uL0VudGl0eUNhY2hlJztcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBDb21wb3NpdGVLZXkgfSBmcm9tICcuLi9Nb2RlbCc7XG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJztcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eVByb3h5LCBQcm9wZXJ0eUNoYW5nZSwgUHJveGllZCwgRW50aXR5U3RhdGUsIEVudGl0eUNoYW5nZVR5cGUgfSBmcm9tICcuL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgU3FsQW5kUGFyYW1ldGVycywgU3FsQnVpbGRlciB9IGZyb20gJy4uL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBpc051bWJlciwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IHR5cGUgRW50aXR5VHJhY2tlckFjdGlvbiA9IChtb2RlbDogc3RyaW5nLCBlbnRpdHk6IEVudGl0eSwgY2hhbmdlcyA6IEVudGl0eUNoYW5nZXMpID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWRcblxuICBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkXG4gIHN0b3BUcmFja0FsbCgpOiB2b2lkXG5cbiAgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbiAgcmVqZWN0Q2hhbmdlcygpIDogdm9pZFxuICByb2xsYmFja0NoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkXG59XG5cbi8vIGV4cG9ydCBjbGFzcyBNb2RlbEFuZEtleSB7XG4vLyAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IG1vZGVsQW5kS2V5U2VwYXJhdG9yID0gJyEjISdcblxuLy8gICBwcml2YXRlIG1vZGVsTmFtZSA6IHN0cmluZ1xuLy8gICBwcml2YXRlIGVudGl0eUtleSA6IEVudGl0eUtleVxuXG4vLyAgIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIHtcbi8vICAgICB0aGlzLm1vZGVsTmFtZSA9IG1vZGVsXG4vLyAgICAgdGhpcy5lbnRpdHlLZXkgPSBrZXlcbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBnZXQgbW9kZWwoKSB7IHJldHVybiB0aGlzLm1vZGVsTmFtZSB9XG4vLyAgIHB1YmxpYyBnZXQga2V5KCkgeyByZXR1cm4gdGhpcy5lbnRpdHlLZXkgfVxuXG4vLyAgIHB1YmxpYyB0b1N0cmluZygpIHtcbi8vICAgICByZXR1cm4gXG4vLyAgIH1cbi8vIH1cbmV4cG9ydCB0eXBlIE1vZGVsQW5kS2V5ID0gc3RyaW5nXG5cbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHsgIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgaGlzdG9yeSA6IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+XG4gIHByaXZhdGUgYWxsVHJhY2tpbmdFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IG1rID0geyBtOiBzY2hlbWEubW9kZWxOYW1lLCBrOiBrZXl9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBtayApXG4gIH1cblxuICBwdWJsaWMgc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSApIDogeyBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSB9IHtcbiAgICBsZXQgbWsgPSBKU09OLnBhcnNlKCBtb2RlbEFuZEtleSApXG4gICAgbGV0IGtleSA9IGlzU3RyaW5nKG1rLmspIHx8IGlzTnVtYmVyKG1rLmspID8gbWsuayA6IG5ldyBDb21wb3NpdGVLZXkobWsuay5rZXlPYmplY3QpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBtay5tLCBrZXk6IGtleSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PiApOiB2b2lkIHtcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBhdHRhY2hIaXN0b3J5IGhpc3RvcnkgaW5mbyA9ICR7SlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5VmVyc2lvbil9YClcblxuICAgIGhpc3RvcnkuZm9yRWFjaCggKGNoYW5nZXMsIHZlcnNpb24pID0+IHtcbiAgICAgIGxldCBjaGFuZ2VzTWFwID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKVxuICAgICAgY2hhbmdlcy5mb3JFYWNoKCBjID0+IGNoYW5nZXNNYXAuc2V0KCBjLm1vZGVsQW5kS2V5LCBjLmNoYW5nZXMhICkpXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KHZlcnNpb24sIGNoYW5nZXNNYXAgKVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5sb2cuaW5mb0VuYWJsZWQpIHtcbiAgICAgIGxldCBoZWlnaHRJbmZvID0gbmV3IEFycmF5PG51bWJlcj4oKVxuICAgICAgaGlzdG9yeS5mb3JFYWNoKCAoYywgaCkgPT4gaGVpZ2h0SW5mby5wdXNoKGgpIClcbiAgICAgIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgYXR0YWNoSGlzdG9yeSBoZWlnaHQgPSAke0pTT04uc3RyaW5naWZ5KGhlaWdodEluZm8pfWApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluOiB0aGlzLm1pblZlcnNpb24sIG1heDogdGhpcy5jdXJyZW50VmVyc2lvbiB9XG4gIH1cblxuICBwdWJsaWMgYXR0YWNoKCBwZTogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KCBwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdleGlzdHMgYW5vdGhlciB0cmFja2VkIGVudGl0eScpXG4gICAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUgKVxuICB9XG4gIFxuICBwdWJsaWMgZ2V0TGFzdENoYW5nZXMoIHBlOiBQcm94aWVkPGFueT4gKSA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzRGlydHkocGUpKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOiBcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6IFxuICAgICAgICByZXR1cm4gcGUuX190bXBDaGFuZ2VzX18hXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgbGV0IHRtcFZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG5cbiAgICB3aGlsZSAoIHRtcFZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gKSB7XG4gICAgICBsZXQgaGlzdG9yeSA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0bXBWZXJzaW9uKVxuICAgICAgaGlzdG9yeSAmJiByZXN1bHQucHVzaChoaXN0b3J5KSAgICAgIFxuICAgICAgdG1wVmVyc2lvbi0tXG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgdHJhY2tpbmdFbnRpdGllcygpIDogSXRlcmFibGU8RW50aXR5PiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy52YWx1ZXMoKVxuICB9XG5cbiAgcHVibGljIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyggdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwga2V5KSApXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICk6IE1heWJlVW5kZWZpbmVkPFByb3hpZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCB0cmFja2luZ0tleSA9IHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwga2V5KVxuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKHRyYWNraW5nS2V5KSA/IHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5nZXQodHJhY2tpbmdLZXkpIGFzIFByb3hpZWQ8VEVudGl0eT4gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyB0cmFja05ldzxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHsgXG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlOZXcoZW50aXR5LCBzY2hlbWEpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWQge1xuICAgIGxldCBwcm94aWVkID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpXG4gICAgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgIH0gXG4gICAgZWxzZSBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgICAgLy8gVE9ETzog5YWI5L+u5pS55YaN5Yig6Zmk77yM6ZyA6KaB5oGi5aSN5Yiw5LuA5LmI54q25oCB77yfXG4gICAgICBwcm94aWVkLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuRGVsZXRlZFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyB0cmFja1BlcnNpc3RlbnQ8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7XG4gICAgdGhpcy5lbnN1cmVOb1RyYWNraW5nKCBzY2hlbWEsIGVudGl0eSApXG5cbiAgICBsZXQgcHJveGllZCA9IHRoaXMucHJveHkucHJveHlQZXJzaXN0ZW50KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5kZWxldGUodGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpKVxuICB9XG5cbiAgcHVibGljIHN0b3BUcmFja0FsbCgpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nQ2hhbmdlcygpIDogQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBtb2RlbEFuZEtleSA6IHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKSB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGRldGVjdENoYW5nZXMoKSA6IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHtlbnRpdHk6IFByb3hpZWQ8YW55PiwgY2hhbmdlcyA6IE1heWJlVW5kZWZpbmVkPEVudGl0eUNoYW5nZXM+IH0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IGVudGl0eTogcGUsIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMoZW50aXR5OiBFbnRpdHksIGRiVmVyc2lvbjogbnVtYmVyLCBpc05ldyA9IHRydWUpIDogRW50aXR5Q2hhbmdlcyB7XG4gICAgbGV0IHByb3Blcml0ZXNDaGFuZ2UgPSBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KClcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBlbnRpdHkpIHtcbiAgICAgIGlmICghRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShrZXkpKSBjb250aW51ZVxuICAgICAgcHJvcGVyaXRlc0NoYW5nZS5wdXNoKCBpc05ldyA/IFxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IHVuZGVmaW5lZCwgY3VycmVudDogZW50aXR5W2tleV0gfSA6XG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogZW50aXR5W2tleV0sIGN1cnJlbnQ6ICB1bmRlZmluZWQgfSAgICAgICBcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZSA6IGlzTmV3ID8gRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZSxcbiAgICAgIGRiVmVyc2lvbjogZGJWZXJzaW9uLCAgICAgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBwcm9wZXJpdGVzQ2hhbmdlXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgaGlzdG9yeVZlcnNpb246IG51bWJlciApOiB2b2lkIHtcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBORVcgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYERFTEVURSBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE1PRElGSUVEIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBjaGFuZ2VzID0gJHtKU09OLnN0cmluZ2lmeShwZS5fX3RtcENoYW5nZXNfXyl9YClcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCBwZS5fX3RtcENoYW5nZXNfXyEsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nIFxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6IFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgY29uc3Qgc2NoZW1hID0gcGUuX19zY2hlbWFfX1xuICAgICAgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQpIFxuICAgICAgICB0aGlzLmNhY2hlLnB1dChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSwgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkgKVxuICAgICAgZWxzZSBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkKVxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSkpXG4gICAgICAvLyBlbHNlICd0cmFuc2llbnQnIHwgJ3BlcnNpc3RlbnQnIGRvIG5vdGhpbmdcbiAgICAgIHRoaXMubWFya1N0YXRlQW5kU2F2ZUhpc3RvcnkocGUsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IGhpc3RvcnlWZXJzaW9uXG4gICAgICBwZS5fX2RldGFjaGVkX18gPSB0cnVlXG4gICAgfSkgIFxuICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5taW5WZXJzaW9uID0gdGhpcy5taW5WZXJzaW9uID09PSAtMSA/IGhpc3RvcnlWZXJzaW9uIDogdGhpcy5taW5WZXJzaW9uXG4gICAgXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIHJvbGxiYWNrQ2FjaGVDaGFuZ2VzKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgY2hhbmdlczogRW50aXR5Q2hhbmdlcyApOiB2b2lkIHtcbiAgICBzd2l0Y2goY2hhbmdlcy50eXBlKSB7XG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3IDogXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChtb2RlbCwga2V5KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTpcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNhY2hlLmdldCggbW9kZWwsIGtleSApXG4gICAgICAgIGlmICggZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuXG4gICAgICAgIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBlIVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlIClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6IFxuICAgICAgICBjb25zdCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdCggY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYyA9PiBjLm5hbWUsIGMgPT4gYy5vcmlnaW5hbClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGVudGl0eSApXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDpcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcmVqZWN0Q2hhbmdlcyBWZXJzaW9uID0gP2ApXG4gIH1cbiAgXG4gIHB1YmxpYyByb2xsYmFja0NoYW5nZXMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLnJlamVjdENoYW5nZXMoKVxuICAgIHdoaWxlKCBoaXN0b3J5VmVyc2lvbiA8PSB0aGlzLmN1cnJlbnRWZXJzaW9uICkge1xuICAgICAgY29uc3QgY2hhbmdlc01hcCA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgICAgY2hhbmdlc01hcCAmJiBjaGFuZ2VzTWFwLmZvckVhY2goICggY2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApIFxuICAgICAgICB0aGlzLnJvbGxiYWNrQ2FjaGVDaGFuZ2VzKG1rLm1vZGVsLCBtay5rZXksIGNoYW5nZXMpXG4gICAgICB9KVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiAtLVxuICAgIH1cblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiBwZS5fX2RldGFjaGVkX18gPSB0cnVlKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5taW5WZXJzaW9uID0gTWF0aC5taW4odGhpcy5taW5WZXJzaW9uLCB0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHt0aGlzLmN1cnJlbnRWZXJzaW9ufWApXG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5KCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIHtcbiAgICBpZiAoIHRoaXMubWluVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiB8fCB0aGlzLmN1cnJlbnRWZXJzaW9uIDwgaGlzdG9yeVZlcnNpb24gKSByZXR1cm5cbiAgICBmb3IoIGxldCB2ZXIgPSB0aGlzLm1pblZlcnNpb247IHZlciA8IGhpc3RvcnlWZXJzaW9uOyB2ZXIrKyApIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5kZWxldGUodmVyKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHVtcENoYW5nZXMoIGVjOiBFbnRpdHlDaGFuZ2VzICk6IHN0cmluZyB7XG4gICAgbGV0IHByb3BlcnR5Q2hhbmdlcyA9ICcnXG4gICAgZWMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaChwYyA9PiBwcm9wZXJ0eUNoYW5nZXMgKz0gYCR7cGMubmFtZX06ICR7cGMub3JpZ2luYWx9IC0+ICR7cGMuY3VycmVudH0sIGApXG5cbiAgICByZXR1cm4gYGRiVmVyc2lvbj0ke2VjLmRiVmVyc2lvbn0sIHR5cGU9JHtlYy50eXBlfSwgWyR7cHJvcGVydHlDaGFuZ2VzfV1gXG4gIH1cblxuICBwdWJsaWMgZHVtcEhpc3RvcnkoKSA6IHN0cmluZyB7XG4gICAgbGV0IHZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBISVNUT1JZICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB3aGlsZSggdmVyc2lvbiA+PSB0aGlzLm1pblZlcnNpb24gKSB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tdmVyc2lvbiAke3ZlcnNpb259LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBsZXQgaGlzID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKCB2ZXJzaW9uIClcbiAgICAgIGhpcyAmJiBoaXMuZm9yRWFjaCggKCBlYywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGxldCBjaGFuZ2VzID0gdGhpcy5kdW1wQ2hhbmdlcyggZWMgKVxuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgICBjb25zdCBtc2cgPSBgdHlwZT0ke21rLm1vZGVsfSwga2V5PSR7bWsua2V5fSwgY2hhbmdlcz17JHtjaGFuZ2VzfX0gXFxuYFxuICAgICAgICByZXN1bHQgKz0gbXNnXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgICB2ZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYWNrZXJTcWxCdWlsZGVyIHtcbiAgcHJpdmF0ZSB0cmFja2VyOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc3FsQnVpbGRlcjogU3FsQnVpbGRlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyLCBtb2RlbHMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4sIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXIgKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICAgIHRoaXMubW9kZWxzID0gbW9kZWxzXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gc3FsQnVpbGRlclxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGVudGl0eVRyYWNrZXIoKSB7IHJldHVybiB0aGlzLnRyYWNrZXIgfVxuXG4gIHB1YmxpYyBidWlsZENoYW5nZVNxbHMoKSA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZGV0ZWN0Q2hhbmdlcygpLmZvckVhY2goIGVjID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLmJ1aWxkU3FsQW5kUGFyYW1ldGVycyhlYy5lbnRpdHkpIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBidWlsZFNxbEFuZFBhcmFtZXRlcnMocGUgOlByb3hpZWQ8YW55PikgOiBTcWxBbmRQYXJhbWV0ZXJzIHsgIFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDpcbiAgICAgICAgY29uc3QgbmV3RW50aXR5ID0gT2JqZWN0LmFzc2lnbih7IF92ZXJzaW9uXyA6IHBlLl92ZXJzaW9uXyB9LCAgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KCBwZS5fX3NjaGVtYV9fLCBuZXdFbnRpdHkpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDpcbiAgICAgICAgbGV0IGVudGl0eUNoYW5nZXMgPSB0aGlzLnRyYWNrZXIuZ2V0TGFzdENoYW5nZXMocGUpIVxuICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KCBlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzICwgYz0+IGMubmFtZSwgYz0+IGMuY3VycmVudCApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpLCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiAtIDEgKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gICAgICBkZWZhdWx0IDogXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBlbnRpdHkgc3RhdGUgJyR7cGUuX19zdGF0ZV9ffSdgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBidWlsZFJvbGxiYWNrQ2hhbmdlU3FscyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKTogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5nZXRDaGFuZ2VzVW50aWwoIGhpc3RvcnlWZXJzaW9uICkuZm9yRWFjaCggaGlzID0+IGhpcy5mb3JFYWNoKCAoIGVudGl0eUNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgY29uc3QgbWsgPSB0aGlzLnRyYWNrZXIuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1rLm1vZGVsKVxuICAgICAgc3dpdGNoKGVudGl0eUNoYW5nZXMudHlwZSkge1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3OlxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZERlbGV0ZShzY2hlbWEhLCBtay5rZXkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6IFxuICAgICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHNjaGVtYSEsIG1rLmtleSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gKSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOlxuICAgICAgICAgIGxldCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoc2NoZW1hISwgZW50aXR5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH0pKVxuICAgIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG59XG5cblxuXG5cbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJldHRlci1zcWxpdGUzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNoYW5nZS1jYXNlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV2ZW50c1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJqc29uLXNxbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zZWNvbmRhcnlcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc3VibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibHJ1LWNhY2hlXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInV0aWxcIik7Il0sInNvdXJjZVJvb3QiOiIifQ==