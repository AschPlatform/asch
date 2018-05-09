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
    appendBlock(block, changes) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!block || !block.id || !block.delegate || block.height === undefined)
                throw new Error(`Invalid block data`);
            yield this.historyDb.put(block.height, changes);
            yield this.blockDb.batch([
                { type: 'put', key: block.height, value: block },
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: { height: block.height } }
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
                { type: 'put', key: LAST_BLOCK_HEIGHT_KEY, value: { height: height - 1 } }
            ]);
            yield this.historyDb.del(height);
            this.lastHeight--;
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
            // return await ((minHeight, maxHeight) => {
            //   return new Promise( (res, rej) => {
            //     let blocks = new Array<BlockHeader>()      
            //     this.blockDb.createReadStream({ start: minHeight, end: maxHeight})
            //       .on('data', data => blocks.push(data) )
            //       .on('error', e => rej(e) )
            //       .on('end', () => res(blocks) )
            //   })
            // })(minHeight, maxHeight) as Array<BlockHeader>
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
    /**
     * get block header by height
     * @param height block height
     */
    getBlockByHeight(height, withTransactions = false) {
        return __awaiter(this, void 0, void 0, function* () {
            Common_1.CodeContract.argument('height', height >= 0, 'height must great or equal zero');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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Q0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDekYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBRSxDQUFDO29CQUM1RixNQUFLO2dCQUNQLEtBQUssOEJBQWdCLENBQUMsTUFBTTtvQkFDMUIsSUFBSSxNQUFNLEdBQUcsdUJBQWMsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUN4RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDekQsTUFBSzthQUNSO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU07SUFDZixDQUFDO0NBRUY7QUE1REQsOENBNERDOzs7Ozs7Ozs7Ozs7QUN4YkQsMkM7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsMkM7Ozs7Ozs7Ozs7O0FDQUEsc0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiYXNjaC1zbWFydGRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gb2JqZWN0IHdpdGggYWxsIGNvbXBpbGVkIFdlYkFzc2VtYmx5Lk1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18udyA9IHt9O1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9JbmRleC50c1wiKTtcbiIsImltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vQmxvY2snXG5cbmV4cG9ydCBjbGFzcyBCbG9ja0NhY2hlIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8bnVtYmVyLCBCbG9jaz4oKVxuICBwcml2YXRlIG1pbkhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhDYWNoZWRDb3VudCA6IG51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgdGhpcy5tYXhIZWlnaHQgPj0gMCAmJiBibG9jay5oZWlnaHQgIT09IHRoaXMubWF4SGVpZ2h0ICsgMSApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgKCdpbnZhbGlkIGJsb2NrIGhlaWdodCcpXG5cbiAgICB0aGlzLmNhY2hlLnNldCggYmxvY2suaGVpZ2h0LCBibG9jayApXG4gICAgdGhpcy5tYXhIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgICBcbiAgICBpZiAoIHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heENhY2hlZENvdW50ICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoIHRoaXMubWluSGVpZ2h0KysgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQoIGhlaWdodDogbnVtYmVyICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChoZWlnaHQpXG4gIH1cblxuICBwdWJsaWMgZ2V0QnlJZCggaWQ6IHN0cmluZyApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBmb3IoIGNvbnN0IGIgb2YgdGhpcy5jYWNoZS52YWx1ZXMoKSApIHtcbiAgICAgIGlmICggYi5pZCEgPT09IGlkICkgcmV0dXJuIGJcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV2aXQoIGZyb21IZWlnaHQ6IG51bWJlciwgdG9IZWlnaHQ6IG51bWJlciApIHtcbiAgICBsZXQgbWluID0gTWF0aC5taW4oIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBsZXQgbWF4ID0gTWF0aC5tYXgoIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBpZiAoIG1pbiA+IHRoaXMubWF4SGVpZ2h0IHx8IG1heCA8IHRoaXMubWluSGVpZ2h0ICkgcmV0dXJuIFxuICAgIFxuICAgIG1pbiA9IE1hdGgubWF4KCBtaW4sIHRoaXMubWluSGVpZ2h0IClcbiAgICBtYXggPSBNYXRoLm1pbiggbWF4LCB0aGlzLm1pbkhlaWdodCApXG4gICAgZm9yICggbGV0IGhlaWdodCA9IG1pbjsgaGVpZ2h0IDw9IG1heDsgaGVpZ2h0KysgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZShoZWlnaHQpXG4gICAgfVxuICB9XG59IiwiaW1wb3J0IHsgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0TGl0ZXJhbCB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IE9iamVjdExpdGVyYWxcbmV4cG9ydCB0eXBlIEVudGl0eSA9IE9iamVjdExpdGVyYWxcblxuZXhwb3J0IGludGVyZmFjZSBLZXlPYmplY3QgeyBcbiAga2V5IDogc3RyaW5nXG4gIGtleUpzb24gOiBKc29uT2JqZWN0XG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSA6IEpzb25PYmplY3Qge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdpdGVyYWJsZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBpdGVyYWJsZSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRLZXknLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0S2V5ICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldFZhbHVlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldFZhbHVlICkpXG5cbiAgbGV0IHJldCA9IHt9XG4gIGZvciAobGV0IGl0ZW0gb2YgaXRlcmFibGUpIHtcbiAgICByZXRbZ2V0S2V5KGl0ZW0pXSA9IGdldFZhbHVlKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHJldCBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpYWw8VD4oIHNyYyA6IFQsIC4uLmtleXMgOiBBcnJheTxzdHJpbmc+ICk6IFBhcnRpYWw8VD4ge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdzcmMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggc3JjICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2tleXMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCgga2V5cyApKVxuXG4gIGxldCByZXN1bHQgPSAgeyB9XG4gIGZvciAoIGxldCBrIG9mIFsuLi5rZXlzXSApIHJlc3VsdFtrXSA9IHNyY1trXVxuICByZXR1cm4gcmVzdWx0IGFzIFBhcnRpYWw8VD5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJpbWl0aXZlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoICFrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGlzU3RyaW5nKCBrZXkgKSB8fCBpc051bWJlcigga2V5IClcbn1cblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciggbWVzc2FnZSA6IHN0cmluZyApIHtcbiAgICBzdXBlciggJ0NvZGUgY29udHJhY3QgRXJyb3IsJysgbWVzc2FnZSApXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29udHJhY3RDb25kaXRpb24gPSBib29sZWFuIHwgKCAoKSA9PiBib29sZWFuIClcbmV4cG9ydCB0eXBlIENvbnRyYWN0TWVzc2FnZSAgID0gc3RyaW5nICB8ICggKCkgPT4gc3RyaW5nIClcblxuZXhwb3J0IHR5cGUgTWF5YmVVbmRlZmluZWQ8VD4gPSBUIHwgdW5kZWZpbmVkXG5leHBvcnQgdHlwZSBOdWxsYWJsZTxUPiA9IFQgfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0VmVyaWZ5UmVzdWx0ID0geyByZXN1bHQgOiBib29sZWFuLCBtZXNzYWdlOiBOdWxsYWJsZTxzdHJpbmc+IH0gXG5leHBvcnQgdHlwZSBWZXJpZnlGdW5jdGlvbiA9ICgpID0+IENvbnRyYWN0VmVyaWZ5UmVzdWx0XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3Qge1xuICBwdWJsaWMgc3RhdGljIHZlcmlmeSggY29uZGl0aW9uOiBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSA6IENvbnRyYWN0TWVzc2FnZSApIDogdm9pZCB7XG4gICAgaWYgKCBjb25kaXRpb24gPT09IHVuZGVmaW5lZCB8fCBjb25kaXRpb24gPT09IG51bGwgKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyaWZ5IGNvbmRpdGlvbicpXG5cbiAgICBjb25zdCBjb25kID0gaXNGdW5jdGlvbihjb25kaXRpb24pID8gKGNvbmRpdGlvbiBhcyBGdW5jdGlvbikoKSA6IGNvbmRpdGlvblxuICAgIGNvbnN0IG1zZyA9IGlzRnVuY3Rpb24obWVzc2FnZSkgPyAobWVzc2FnZSBhcyBGdW5jdGlvbikoKSA6IG1lc3NhZ2VcblxuICAgIGlmICghY29uZCkgdGhyb3cgbmV3IENvZGVDb250cmFjdEVycm9yKCBtc2cgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhcmd1bWVudCggYXJnTmFtZTogc3RyaW5nLCB2ZXJpZnk6IFZlcmlmeUZ1bmN0aW9uIHwgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2U/IDogQ29udHJhY3RNZXNzYWdlICk6IHZvaWQge1xuICAgIGlmICggIWFyZ05hbWUgfHwgIXZlcmlmeSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcmdOYW1lIG9yIHZlcmlmeSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgaWYgKCAhbWVzc2FnZSApIHtcbiAgICAgIGNvbnN0IHZyID0gICh2ZXJpZnkgYXMgVmVyaWZ5RnVuY3Rpb24pKClcbiAgICAgIENvZGVDb250cmFjdC52ZXJpZnkoIHZyLnJlc3VsdCwgYGFyZ3VtZW50ICcke2FyZ05hbWV9JyAke3ZyLm1lc3NhZ2V9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIENvZGVDb250cmFjdC52ZXJpZnkodmVyaWZ5IGFzIENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlISkgICAgXG4gIH1cblxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbCggYXJnIDogYW55ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXJnICE9PSBudWxsICYmIGFyZyAhPT0gdW5kZWZpbmVkXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yRW1wdHkoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsKHN0cikgJiYgc3RyICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIGVtcHR5J1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPcldoaXRlc3BhY2UoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsT3JFbXB0eSggc3RyICkgJiYgKCBzdHIgYXMgc3RyaW5nICkudHJpbSgpICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIHdoaXRlc3BhY2UnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG59XG5cblxuIiwiaW1wb3J0IHsgRW50aXR5Q2FjaGUsIExSVUVudGl0eUNhY2hlLCBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyLCBNVUxUSV9TUUxfU0VQQVJBVE9SIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRW50aXR5LCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgUHJveGllZEVudGl0eVRyYWNrZXIsIFRyYWNrZXJTcWxCdWlsZGVyLCBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlFeHRlbnNpb24gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIFNhdmVIaXN0b3J5QWN0aW9uID0gKCB2ZXJzaW9uOiBudW1iZXIsIGhpc3Rvcnk6IE1hcDxzdHJpbmcsIEVudGl0eUNoYW5nZXM+ICkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgRGJTZXNzaW9uIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNlc3Npb25DYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgc3FsQnVpbGRlciA6IEpzb25TcWxCdWlsZGVyXG4gIHByaXZhdGUgdHJhY2tlclNxbEJ1aWxkZXI6IFRyYWNrZXJTcWxCdWlsZGVyXG4gIHByaXZhdGUgZW50aXR5VHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgc2Vzc2lvblNlcmlhbCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbiwgY2FjaGVPcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zLCBzZXNzaW9uTmFtZT86IHN0cmluZykge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoIERiU2Vzc2lvbi5uYW1lICsgKCBzZXNzaW9uTmFtZSA9PT0gdW5kZWZpbmVkID8gJycgOiBgXyR7c2Vzc2lvbk5hbWV9YCkgIClcbiAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSAtMVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogdm9pZCB7XG4gICAgdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSkuZm9yRWFjaCggc3FsPT4ge1xuICAgICAgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGVTeW5jKCBzcWwgKVxuICAgIH0pXG4gIH1cblxuICBwdWJsaWMgcmVnaXN0ZXJTY2hlbWEoLi4uc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiB2b2lkIHtcbiAgICBzY2hlbWFzLmZvckVhY2goIHMgPT4gdGhpcy5tb2RlbHMuc2V0KHMubW9kZWxOYW1lLCBzKSApXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZTogc3RyaW5nKSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobW9kZWxOYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke21vZGVsTmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeUNsYXNzPFRFbnRpdHk+KGNsYXp6OiBDb25zdHJ1Y3RvcjxURW50aXR5PikgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KGNsYXp6Lm5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7Y2xhenoubmFtZX0nIClgKVxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWE8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsKSA6IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeUNsYXNzKG1vZGVsKVxuICB9XG5cbiAgcHJvdGVjdGVkIG1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSgge30sIGtleSApXG4gIH1cblxuICBwcm90ZWN0ZWQgdHJhY2tQZXJzaXN0ZW50RW50aXRpZXM8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsICBlbnRpdGllcyA6IEFycmF5PFRFbnRpdHk+LCBjYWNoZSA9IHRydWUgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFRFbnRpdHk+KClcbiAgICBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHNjaGVtYSwgZSkgKVxuICAgICAgY2FjaGUgJiYgdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkoZSkgLCBlIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCByZXNldChjbGVhckNhY2hlOiBib29sZWFuID0gZmFsc2UpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnN0b3BUcmFja0FsbCgpXG4gICAgaWYgKCBjbGVhckNhY2hlICkgdGhpcy5lbnRpdHlDYWNoZS5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY2xvc2UoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMucmVzZXQoIHRydWUgKVxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5kaXNjb25uZWN0KClcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KTogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICB9XG5cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IGVudGl0aWVzID0gdGhpcy5lbnRpdHlDYWNoZS5nZXRBbGw8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGZpbHRlciApIHx8IFtdXG5cbiAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gdHJhY2tlZCBhcyBPYmplY3QgYXMgVEVudGl0eVxuXG4gICAgbGV0IGNhY2hlZCA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0PFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBrZXkgKVxuICAgIHJldHVybiAoIGNhY2hlZCA9PT0gdW5kZWZpbmVkICkgPyB1bmRlZmluZWQgOiBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoIHNjaGVtYSwgY2FjaGVkIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRBbGw8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcblxuICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCAmJiB0aGlzLmVudGl0eUNhY2hlLmV4aXN0c01vZGVsKHNjaGVtYS5tb2RlbE5hbWUpICkge1xuICAgICAgbGV0IGVudGl0aWVzID0gdGhpcy5lbnRpdHlDYWNoZS5nZXRBbGw8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUgKSB8fCBbXVxuICAgICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzIFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRNYW55KCBtb2RlbCwgeyB9LCB0cmFjayApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlLCBjYWNoZSA9IHRydWUgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uKVxuICAgIFxuICAgIGxldCBlbnRpdGllcyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggY2FjaGUgKSBlbnRpdGllcy5mb3JFYWNoKCBlID0+IHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpLCBlICkpXG5cbiAgICByZXR1cm4gIXRyYWNrID8gZW50aXRpZXMgOlxuICAgICAgdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz86IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24sIHJlc3VsdFJhbmdlLCBzb3J0LCBqb2luKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeUJ5SnNvbjxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgcGFyYW1zKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwgKVxuXG4gICAgbGV0IHsgcXVlcnkgLCBwYXJhbWV0ZXJzfSA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdCggc2NoZW1hLCBbXSAsIGNvbmRpdGlvbiApIFxuICAgIHF1ZXJ5ID0gYHNlbGVjdCBleGlzdHMoJHtxdWVyeS5yZXBsYWNlKE1VTFRJX1NRTF9TRVBBUkFUT1IsICcnKX0pIGFzIGV4aXN0YFxuICAgIGNvbnN0IHJldCA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeSggcXVlcnksIHBhcmFtZXRlcnMgKVxuICAgIFxuICAgIHJldHVybiBpc0FycmF5KHJldCkgJiYgcGFyc2VJbnQocmV0WzBdWydleGlzdCddKSA+IDAgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCByZXQgPSBhd2FpdCB0aGlzLnF1ZXJ5QnlKc29uKCBtb2RlbCwgeyBmaWVsZHMgOiAnY291bnQoKikgYXMgY291bnQnLCBjb25kaXRpb246IGNvbmRpdGlvbiB9IClcbiAgICByZXR1cm4gaXNBcnJheShyZXQpID8gcGFyc2VJbnQocmV0WzBdWydjb3VudCddKSA6IDAgXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCAga2V5OiBFbnRpdHlLZXksIGVudGl0eT8gOiBURW50aXR5KSA6IFRFbnRpdHkgeyAgICBcbiAgICBpZiAoICFrZXkgKSB0aHJvdyBuZXcgRXJyb3IoJ2VudGl0eSBrZXkgY2FuIG5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgdGhlRW50aXR5ID0gc2NoZW1hLm5ld0VudGl0eSggbW9kZWwsIGtleSApXG4gICAgZW50aXR5ICYmIHNjaGVtYS5jb3B5UHJvcGVydGllcyggdGhlRW50aXR5LCBlbnRpdHkgKVxuXG4gICAgbGV0IGV4aXN0cyA9IHRoaXMuc2Vzc2lvbkNhY2hlLmV4aXN0cyhzY2hlbWEubW9kZWxOYW1lLCBrZXkpIHx8IHRoaXMuZW50aXR5VHJhY2tlci5pc1RyYWNraW5nKHNjaGVtYSwga2V5KVxuICAgIGlmICggZXhpc3RzICkgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgZXhpc3RzIGFscmVhZHkgKCBtb2RlbCA9ICcke3NjaGVtYS5tb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApIGApXG4gICAgICBcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrTmV3KHNjaGVtYSwgdGhlRW50aXR5KSBhcyBURW50aXR5XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgbG9hZEVudGl0eUJ5S2V5KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG4gICAgY29uc3Qgd2hlcmUgPSB0aGlzLm1ha2VCeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgd2hlcmUpXG5cbiAgICBjb25zdCByb3dzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgaWYgKCByb3dzLmxlbmd0aCA+IDEgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBrZXkgaXMgZHVwbGljYXRlZCAoIG1vZGVsID0gJyR7bW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKWAgKVxuICAgIH1cblxuICAgIHJldHVybiByb3dzLmxlbmd0aCA9PT0gMSA/IHJvd3NbMF0gOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBsb2FkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgY2FjaGVkID0gdGhpcy5sb2FkQ2FjaGVkKCBtb2RlbCwga2V5LCB0cnVlIClcbiAgICBpZiAoIGNhY2hlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIGNhY2hlZFxuICBcbiAgICBjb25zdCBtb2RlbE5hbWUgPSB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gbW9kZWwgOiBtb2RlbC5uYW1lXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUoIG1vZGVsTmFtZSApIVxuXG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgKSByZXR1cm4gdHJhY2tlZCEgYXMgT2JqZWN0IGFzIFRFbnRpdHlcbiAgICBcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGtleSwgZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCh0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpLCBlbnRpdHkpIGFzIFRFbnRpdHkgIFxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0NoYW5nZXMoKVxuICB9XG5cbiAgcHVibGljIGxvYWRDYWNoZWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICwgdHJhY2sgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCBwZSAmJiB0cmFjayApIHJldHVybiBwZSBhcyBFbnRpdHkgYXMgVEVudGl0eVxuXG4gICAgY29uc3QgZW50aXR5ID0gdGhpcy5zZXNzaW9uQ2FjaGUuZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZSwga2V5KVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgfHwgISB0cmFjayApIHJldHVybiBlbnRpdHlcblxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHNjaGVtYSwgZW50aXR5KSBhcyBURW50aXR5IFxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBzYXZlQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVDaGFuZ2VzKHNlcmlhbD8gOiBudW1iZXIpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCByZXRTZXJpYWwgPSBzZXJpYWwgfHwgKyt0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgIFxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkQ2hhbmdlU3FscygpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goIHNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8PSBzZXJpYWwgKSByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgKCBzZXJpYWwgPSAke3NlcmlhbH0gKWApXG5cbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZFJvbGxiYWNrQ2hhbmdlU3FscyhzZXJpYWwgKyAxKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKHNxbHMpIFxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcblxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwgKyAxKVxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gc2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWApXG4gICAgICByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsOiBudW1iZXIgKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5jbGVhckhpc3RvcnkoIHNlcmlhbCApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCk6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuaGlzdG9yeVZlcnNpb25cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIC8vIGRvIG5vdGhpbmcgLlxuICB9XG5cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrRGVsZXRlKChlbnRpdHkgYXMgT2JqZWN0IGFzIEVudGl0eUV4dGVuc2lvbikuX19zY2hlbWFfXywgIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zYWN0aW9uKCkgOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICB9ICBcblxufSIsImltcG9ydCAqIGFzIExSVSBmcm9tICdscnUtY2FjaGUnXG5pbXBvcnQgeyBFbnRpdHksIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEtleU9iamVjdCwgRmlsdGVyRnVuY3Rpb24sIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc051bWJlciwgaXNGdW5jdGlvbiwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcblxuLyoqXG4gKiBjYWNoZSBvcHRpb25zXG4gKi9cbmV4cG9ydCB0eXBlIEVudGl0eUNhY2hlT3B0aW9ucyA9IHsgXG4gIGRlZmF1bHQgOiBudW1iZXIsXG4gIFttb2RlbDogc3RyaW5nXTogIG51bWJlciB8ICggKCBtb2RlbDogc3RyaW5nICkgPT4gbnVtYmVyIClcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDYWNoZSB7XG4gIG1vZGVscyA6IEFycmF5PHN0cmluZz5cbiAgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkXG4gIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+XG4gIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksICBlbnRpdHk6IEVudGl0eSkgOiB2b2lkXG4gIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWRcbiAgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuICBcbiAgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgTFJVRW50aXR5Q2FjaGUgaW1wbGVtZW50cyBFbnRpdHlDYWNoZSB7XG4gIHByaXZhdGUgc3RhdGljIE1JTl9DQUNIRURfQ09VTlQgPSAxMDBcbiAgcHJpdmF0ZSBzdGF0aWMgREVGVUxUX01BWF9DQUNIRURfQ09VTlQgPSAxMDAwMFxuXG4gIHByaXZhdGUgb3B0aW9uczogRW50aXR5Q2FjaGVPcHRpb25zXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgbW9kZWxDYWNoZXMgOiBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgeyBkZWZhdWx0IDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlQgfVxuICAgIC8vIGZvciggbGV0IGsgaW4gdGhpcy5vcHRpb25zICkgXG4gICAgLy8gICB0aGlzLm9wdGlvbnNba10gPSBpc051bWJlcih0aGlzLm9wdGlvbnNba10pID8gdGhpcy5vcHRpb25zW2tdIDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoTFJVRW50aXR5Q2FjaGUubmFtZSlcbiAgICB0aGlzLm1vZGVsQ2FjaGVzID0gbmV3IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+KClcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUgOiBzdHJpbmcsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UsIHRocm93SWZOb3RFeGlzdHMgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxMUlUuQ2FjaGU8RW50aXR5S2V5LCBFbnRpdHk+PiB7XG4gICAgaWYgKCBjcmVhdGVJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgeyBcbiAgICAgIC8vIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAvLyAgIG1heDogNTAwLFxuICAgICAgLy8gICBsZW5ndGg6IGZ1bmN0aW9uIChuLCBrZXkpIHsgcmV0dXJuIG4gKiAyICsga2V5Lmxlbmd0aCB9LFxuICAgICAgLy8gICAvL2Rpc3Bvc2U6IGZ1bmN0aW9uIChrZXksIG4pIHsgbi5jbG9zZSgpIH0sXG4gICAgICAvLyAgIG1heEFnZTogMTAwMCAqIDYwICogNjAgXG4gICAgICAvLyB9XG4gICAgICBsZXQgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXI7XG4gICAgICBpZiAoICF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkobW9kZWxOYW1lKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0XG4gICAgICBlbHNlIGlmICggaXNOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKVxuICAgICAgZWxzZSBpZiAoIGlzRnVuY3Rpb24odGhpcy5vcHRpb25zW21vZGVsTmFtZV0pKVxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9ICggdGhpcy5vcHRpb25zW21vZGVsTmFtZV0gYXMgKG1vZGVsKT0+IG51bWJlciApKCBtb2RlbE5hbWUgKVxuICAgICAgZWxzZSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgICBtYXhDYWNoZWRDb3VudCA9IE1hdGgubWF4KCBMUlVFbnRpdHlDYWNoZS5NSU5fQ0FDSEVEX0NPVU5ULCBtYXhDYWNoZWRDb3VudCApXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLnNldChtb2RlbE5hbWUsIG5ldyBMUlU8c3RyaW5nLCBFbnRpdHk+KCBtYXhDYWNoZWRDb3VudCApIClcbiAgICB9XG4gICAgIGlmICggdGhyb3dJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgXG4gICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2RlbCBjYWNoZSAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApICBkb2VzIG5vdCBleGlzdHNgKSBcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLm1vZGVsQ2FjaGVzLmdldChtb2RlbE5hbWUpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2FjaGVLZXkoIGtleTogRW50aXR5S2V5ICkgOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByaW1pdGl2ZUtleShrZXkpID8ga2V5IGFzIG51bWJlciB8IHN0cmluZyA6ICgga2V5IGFzIEtleU9iamVjdCApLmtleVxuICB9XG5cbiAgcHVibGljIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZCB7ICAgIFxuICAgIGlmICggaXNTdHJpbmcobW9kZWxOYW1lKSApIHtcbiAgICAgIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgdHJ1ZSApIS5yZXNldCgpXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLmRlbGV0ZSggbW9kZWxOYW1lIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmb3IgKCBsZXQgYyBvZiB0aGlzLm1vZGVsQ2FjaGVzLnZhbHVlcygpICkge1xuICAgICAgYy5yZXNldCgpXG4gICAgfVxuICAgIHRoaXMubW9kZWxDYWNoZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbHMoKSA6IHN0cmluZ1tdIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIGZvciggbGV0IG0gb2YgdGhpcy5tb2RlbENhY2hlcy5rZXlzKCkgKSB7XG4gICAgICByZXN1bHQucHVzaCggbSApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbiAgcHVibGljIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuXG4gICAgcmV0dXJuICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpID8gdW5kZWZpbmVkIDpcbiAgICAgIG1vZGVsQ2FjaGUhLmhhcyhjYWNoZUtleSkgPyBtb2RlbENhY2hlIS5nZXQoY2FjaGVLZXkpIGFzIFRFbnRpdHkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGxldCBjYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lIClcbiAgICBpZiAoIGNhY2hlID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjYWNoZS5mb3JFYWNoKCBlID0+IHtcbiAgICAgICghZmlsdGVyIHx8IChmaWx0ZXIgJiYgZmlsdGVyKCBlIGFzIFRFbnRpdHkgKSkpICYmIHJlc3VsdC5wdXNoKCBlIGFzIFRFbnRpdHkgKSBcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBlbnRpdHk6IEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHB1dCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7a2V5fSwgZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApICAgIFxuICAgIHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUsIHRydWUpIS5zZXQodGhpcy5nZXRDYWNoZUtleShrZXkpLCBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZCB7XG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYGV2aXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2NhY2hlS2V5fWApXG5cbiAgICBjb25zdCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBpZiAobW9kZWxDYWNoZSkgbW9kZWxDYWNoZS5kZWwoY2FjaGVLZXkpXG4gIH1cbiAgXG4gIHB1YmxpYyBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldChtb2RlbE5hbWUsICB0aGlzLmdldENhY2hlS2V5KCBrZXkgKSkgIT09IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIGZhbHNlICkgIT09IHVuZGVmaW5lZFxuICB9XG5cblxuICBwdWJsaWMgZHVtcENhY2hlKCkgOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgQ0FDSEUgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHRoaXMubW9kZWxDYWNoZXMuZm9yRWFjaCggKGNhY2hlLCBtb2RlbCkgPT4ge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLU1vZGVsICR7bW9kZWx9LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBjYWNoZS5mb3JFYWNoKCAoIGVudGl0eSwga2V5ICkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gYGtleSA9ICR7dGhpcy5nZXRDYWNoZUtleSgga2V5ICl9LCBlbnRpdHkgPSB7JHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfX0gXFxuYFxuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgIH0pICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgc2RiIGZyb20gJy4vU21hcnREQidcbmltcG9ydCAqIGFzIG1vZGVsIGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgKiBhcyBibG9jayBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9jayA9IGJsb2NrLkJsb2NrXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YmxldmVsIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBwcm9taXNpZnkoY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pIDogUHJvbWlzZTxUPlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0QnkoaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPEpzb25PYmplY3Q+KTogUHJvbWlzZTxKc29uT2JqZWN0PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1YmxldmVsLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1YmxldmVsKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5sZXZlbGRiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzdWIgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHN1YiApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+ICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5sZXZlbGRiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IHByb21pc2lmeShnZXRDYWxsYmFjaylcbiAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleChpbmRleEZpZWxkKVxuICAgIHJldHVybiBhd2FpdCBpbmRleExldmVsLmdldDxUPihrZXksIGdldENhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBwcm9taXNpZnkocHV0Q2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoZGVsQ2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLmRlbChrZXksIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5sZXZlbGRiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeSggaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT4pXG5cbiAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgIHRoaXMubGV2ZWxkYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgdGhpcy5sZXZlbGRiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEhlaWdodCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKCBkaXIgOiBzdHJpbmcsIGxldmVsT3B0aW9ucyA9IHt9ICkge1xuICAgIC8qIFxuICAgICAgeyBpZCg2NCksIHRpbWVzdGFtcChiaWdpbnQpLCBoZWlnaHQoYmlnaW50KSwgcGF5bG9hZExlbmd0aChiaWdpbnQpLCBwYXlsb2FkSGFzaCg2NCksIHByZXZCbG9ja0lkKDY0KSwgXG4gICAgICAgIHBvaW50SWQoNjQpLCBwb2ludEhlaWdodChiaWdpbnQpLCBkZWxlZ2F0ZSg2NCksIHNpZ25hdHVyZSgxMjgpLCBjb3VudChiaWdpbnQpIH1cbiAgICAqL1xuICAgIGNvbnN0IGJsb2NrTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2JsaycsICdoZWlnaHQnLCBbXG4gICAgICB7IGZpZWxkTmFtZTogJ2lkJyB9LCBcbiAgICAgIHsgZmllbGROYW1lOiAnZGVsZWdhdGUnIH1cbiAgICBdKVxuICAgIGNvbnN0IGNoYW5nZXNMb2dNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnaGlzJywgJ2hlaWdodCcsIFtdKVxuICAgIFxuICAgIHRoaXMuZGIgPSBuZXcgTGV2ZWxEQiggZGlyLCBbYmxvY2tNZXRhLCBjaGFuZ2VzTG9nTWV0YV0sIGxldmVsT3B0aW9ucyApXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gLTFcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB7IGhlaWdodCB9ID0gIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8eyBoZWlnaHQ6IG51bWJlciB9PihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlIFxuXG4gICAgICBsZXQgbGFzdEhlaWdodCA9IHsgaGVpZ2h0OiAtMSB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrRGIucHV0KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgbGFzdEhlaWdodClcbiAgICAgIHJldHVybiBsYXN0SGVpZ2h0LmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIub3BlbigpXG4gICAgdGhpcy5ibG9ja0RiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnYmxrJylcbiAgICB0aGlzLmhpc3RvcnlEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2hpcycpXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RIZWlnaHQgXG4gIH1cblxuICBwcml2YXRlIGlzS2V5Tm90Rm91bmRFcnJvcihlKSA6IGJvb2xlYW4geyBcbiAgICByZXR1cm4gZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXBwZW5kQmxvY2soIGJsb2NrIDogQmxvY2tIZWFkZXIsIGNoYW5nZXM6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWJsb2NrIHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUgfHwgYmxvY2suaGVpZ2h0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogeyBoZWlnaHQ6IGJsb2NrLmhlaWdodCB9IH0gXSlcblxuICAgIHRoaXMubGFzdEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBoZWlnaHQgLSAxIH0gfSBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RIZWlnaHQgLS1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tEYi5nZXRCeSgnaWQnLCBibG9ja0lkKVxuICAgIHJldHVybiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgPyB1bmRlZmluZWQgOiBibG9ja3NbMF1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIC8vIHJldHVybiBhd2FpdCAoKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSA9PiB7XG4gICAgLy8gICByZXR1cm4gbmV3IFByb21pc2UoIChyZXMsIHJlaikgPT4ge1xuICAgIC8vICAgICBsZXQgYmxvY2tzID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpICAgICAgXG4gICAgLy8gICAgIHRoaXMuYmxvY2tEYi5jcmVhdGVSZWFkU3RyZWFtKHsgc3RhcnQ6IG1pbkhlaWdodCwgZW5kOiBtYXhIZWlnaHR9KVxuICAgIC8vICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gYmxvY2tzLnB1c2goZGF0YSkgKVxuICAgIC8vICAgICAgIC5vbignZXJyb3InLCBlID0+IHJlaihlKSApXG4gICAgLy8gICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXMoYmxvY2tzKSApXG4gICAgLy8gICB9KVxuICAgIC8vIH0pKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSBhcyBBcnJheTxCbG9ja0hlYWRlcj5cbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodCA7IGggPD0gbWF4SGVpZ2h0OyBoKysgKSB7XG4gICAgICBsZXQgYmxvY2sgPSBhd2FpdCB0aGlzLmdldEJsb2NrKGgpXG4gICAgICBibG9jayAmJiByZXN1bHQucHVzaCggYmxvY2shIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SWRzKCBibG9ja0lkcyA6IEFycmF5PHN0cmluZz4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgQXJyYXk8QmxvY2tIZWFkZXI+KClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGJsb2NrSWRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgbGV0IGJsb2NrID0gYXdhaXQgdGhpcy5nZXRCbG9ja0J5SWQoIGJsb2NrSWRzW2ldIClcbiAgICAgIGJsb2NrICYmIHJldC5wdXNoKCBibG9jayApXG4gICAgfVxuICAgIHJldHVybiByZXRcbiAgfVxufSIsImV4cG9ydCBlbnVtIExvZ0xldmVsIHtcbiAgQWxsICAgID0gMTI4IC0gMSxcbiAgVHJhY2UgID0gNjQsXG4gIERlYnVnICA9IDMyLFxuICBMb2cgICAgPSAxNixcbiAgSW5mbyAgID0gOCxcbiAgV2FybiAgID0gNCxcbiAgRXJyb3IgID0gMixcbiAgRmF0YWwgID0gMSxcbiAgTm9uZSAgID0gMFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlciB7XG4gIGxvZ0xldmVsIDogTG9nTGV2ZWxcbiAgcmVhZG9ubHkgaW5mb0VuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSB0cmFjZUVuYWJsZWQgOiBib29sZWFuXG4gIHJlYWRvbmx5IGxvZ0VuYWJsZWQgICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZGVidWdFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSB3YXJuRW5hYmxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGVycm9yRW5hbGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgZmF0YWxFbmFibGVkIDogYm9vbGVhblxuXG4gIHRyYWNlKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBkZWJ1ZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICBpbmZvKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zIDogYW55W10gKTogdm9pZFxuICB3YXJuKCBtc2c6IHN0cmluZyAsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbiAgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yICk6IHZvaWRcbn1cblxuY2xhc3MgTG9nZ2VyQWRhcHRlciBpbXBsZW1lbnRzIExvZ2dlciB7XG4gIHByaXZhdGUgbGV2ZWwgOiBMb2dMZXZlbFxuICBwcml2YXRlIG5hbWUgOiBzdHJpbmdcbiAgcHJpdmF0ZSBmb3JtYXQgOiBib29sZWFuXG4gIHByaXZhdGUgZ2V0TG9nZ2VyIDogKCkgPT4gTG9nZ2VyXG5cbiAgcHVibGljIGdldCBpbmZvRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkluZm8pICA+IDAgfVxuICBwdWJsaWMgZ2V0IHRyYWNlRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuVHJhY2UpID4gMCB9XG4gIHB1YmxpYyBnZXQgZGVidWdFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5EZWJ1ZykgPiAwIH1cbiAgcHVibGljIGdldCBsb2dFbmFibGVkKCkgICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkxvZykgICA+IDAgfVxuICBwdWJsaWMgZ2V0IHdhcm5FbmFibGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuV2FybikgID4gMCB9XG4gIHB1YmxpYyBnZXQgZXJyb3JFbmFsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5FcnJvcikgPiAwIH1cbiAgcHVibGljIGdldCBmYXRhbEVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLkZhdGFsKSA+IDAgfVxuXG4gIHB1YmxpYyBnZXQgbG9nTGV2ZWwoKSB7IHJldHVybiB0aGlzLmxldmVsIH1cbiAgcHVibGljIHNldCBsb2dMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkgeyB0aGlzLmxldmVsID0gbGV2ZWwgfVxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihnZXRMb2dnZXI6ICgpID0+IExvZ2dlciwgZm9ybWF0TWVzc2FnZSA9IGZhbHNlLCBsb2dnZXJOYW1lOiBzdHJpbmcsIGxldmVsID0gTG9nTGV2ZWwuQWxsICkge1xuICAgIHRoaXMubmFtZSA9IGxvZ2dlck5hbWVcbiAgICB0aGlzLmxldmVsID0gbGV2ZWxcbiAgICB0aGlzLmdldExvZ2dlciA9IGdldExvZ2dlclxuICAgIHRoaXMuZm9ybWF0ID0gZm9ybWF0TWVzc2FnZVxuICB9XG5cbiAgcHJvdGVjdGVkIGZyb21hdE1lc3NhZ2UoIG1zZzogc3RyaW5nLCBsb2dUeXBlOiBzdHJpbmcgKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke25ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IFske2xvZ1R5cGV9XSBbJHt0aGlzLm5hbWV9XSAke21zZ31gXG4gIH1cblxuICBwdWJsaWMgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdJTkZPJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5pbmZvKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnREVCVUcnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgbG9nKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0xPRycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdUUkFDRScgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZGVidWcoIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyB3YXJuKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ1dBUk4nIClcbiAgICB0aGlzLmdldExvZ2dlcigpLndhcm4oIG1zZywgLi4ucGFyYW1zIClcbiAgfVxuXG4gIHB1YmxpYyBlcnJvciggbXNnOiBzdHJpbmcsIGVycjogRXJyb3IpOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0VSUk9SJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5lcnJvciggbXNnLCBlcnIpXG4gIH1cblxuICBwdWJsaWMgZmF0YWwoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdGQVRBTCcgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBMb2dNYW5hZ2VyIHtcbiAgcHJpdmF0ZSBzdGF0aWMgZGVmYXVsdExvZ0xldmVsID0gTG9nTGV2ZWwuQWxsXG4gIHByaXZhdGUgc3RhdGljIGNyZWF0ZUxvZ2dlciA9ICgpID0+ICBjb25zb2xlIGFzIE9iamVjdCBhcyBMb2dnZXIgXG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dnZXIgPSBuZXcgTG9nZ2VyQWRhcHRlciggTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsICdkZWZhdWx0JywgTG9nTWFuYWdlci5kZWZhdWx0TG9nTGV2ZWwgKVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGRlZmF1bHRMZXZlbCggbGV2ZWw6IExvZ0xldmVsICkge1xuICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsID0gbGV2ZWxcbiAgfVxuICBcbiAgcHVibGljIHN0YXRpYyBzZXQgbG9nRmFjdG9yeSAoIHZhbHVlOiAoKSA9PiBMb2dnZXIgKSB7XG4gICAgTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIgPSB2YWx1ZVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRMb2dnZXIobG9nZ2VyTmFtZT86IHN0cmluZywgbGV2ZWw/IDogTG9nTGV2ZWwpIDogTG9nZ2VyIHtcbiAgICByZXR1cm4gbG9nZ2VyTmFtZSA/IFxuICAgICAgbmV3IExvZ2dlckFkYXB0ZXIoTG9nTWFuYWdlci5jcmVhdGVMb2dnZXIsIHRydWUsIGxvZ2dlck5hbWUsIGxldmVsIHx8IExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsKSA6IFxuICAgICAgTG9nTWFuYWdlci5kZWZhdWx0TG9nZ2VyO1xuICB9XG59XG4iLCJpbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIEtleU9iamVjdCwgQ29kZUNvbnRyYWN0IGFzIERCQywgcGFydGlhbCwgSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcblxuZXhwb3J0IHR5cGUgQ29uc3RydWN0b3I8VD4gPSB7IG5ldygpIDogVCB9XG5leHBvcnQgdHlwZSBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gPSBzdHJpbmcgfCBDb25zdHJ1Y3RvcjxURW50aXR5PlxuXG5leHBvcnQgZW51bSBGaWVsZFR5cGVzIHtcbiAgU3RyaW5nICAgPSAnU3RyaW5nJyxcbiAgTnVtYmVyICAgPSAnTnVtYmVyJyxcbiAgQmlnSW50ICAgPSAnQmlnSW50JyxcbiAgVGV4dCAgICAgPSAnVGV4dCdcbn1cblxuZXhwb3J0IHR5cGUgRmllbGRUeXBlID0gc3RyaW5nIHwgRmllbGRUeXBlc1xuXG5leHBvcnQgaW50ZXJmYWNlIEZpZWxkIHtcbiAgbmFtZTogc3RyaW5nLFxuICB0eXBlOiBGaWVsZFR5cGUsXG4gIGxlbmd0aD86IG51bWJlciAsXG4gIGluZGV4PzogYm9vbGVhbixcbiAgbm90X251bGw/OiBib29sZWFuLFxuICBwcmltYXJ5X2tleT8gOiBib29sZWFuLFxuICBjb21wb3NpdGVfa2V5PyA6IGJvb2xlYW4sXG4gIGRlZmF1bHQ/OiBudW1iZXJ8c3RyaW5nfG51bGxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWEge1xuICB0YWJsZT8gOiBzdHJpbmcsXG4gIG1lbW9yeT8gOiBib29sZWFuLFxuICByZWFkb25seT8gOiBib29sZWFuLFxuICBsb2NhbD8gOiBib29sZWFuLFxuICB0YWJsZUZpZWxkcyA6IEFycmF5PEZpZWxkPlxufVxuXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlS2V5IGltcGxlbWVudHMgS2V5T2JqZWN0IHtcbiAgcHJpdmF0ZSBrZXlPYmplY3QgOiBKc29uT2JqZWN0XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBrZXlPYmplY3QgOiBKc29uT2JqZWN0ICkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleU9iamVjdCcsICgpID0+IERCQy5ub3ROdWxsKGtleU9iamVjdCkpXG5cbiAgICB0aGlzLmtleU9iamVjdCA9IGtleU9iamVjdFxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBtYWtlPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBURW50aXR5ICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsICgpID0+IERCQy5ub3ROdWxsKHNjaGVtYSkpXG4gICAgREJDLmFyZ3VtZW50KCAnc2NoZW1hJywgc2NoZW1hLmlzQ29tcHNpdGVLZXksICdtb2RlbCBtdXN0IGluZGVudGlmeSBieSBjb21wb3NpdGUga2V5JylcbiAgICBEQkMuYXJndW1lbnQoICdlbnRpdHknLCAoKSA9PiBEQkMubm90TnVsbChlbnRpdHkpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoIHBhcnRpYWwoZW50aXR5LCAuLi5zY2hlbWEuY29tcG9zaXRlS2V5cykgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKCBrZXlKc29uU3RyaW5nOiBzdHJpbmcgKSA6IENvbXBvc2l0ZUtleSB7XG4gICAgREJDLmFyZ3VtZW50KCAna2V5SnNvblN0cmluZycsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGtleUpzb25TdHJpbmcpKVxuXG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVLZXkoSlNPTi5wYXJzZSgga2V5SnNvblN0cmluZyApLmtleU9iamVjdClcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5SnNvbigpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMua2V5T2JqZWN0XG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcgeyBcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgdG9TdHJpbmcoKSA6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMua2V5XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9zaXRlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoISBrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleS5rZXlKc29uXG59XG5cbmV4cG9ydCBjbGFzcyBNb2RlbFNjaGVtYSB7XG4gIHByaXZhdGUgc2NoZW1hOiBTY2hlbWFcbiAgcHJpdmF0ZSBuYW1lOiBzdHJpbmdcbiAgcHJpdmF0ZSBtZW1vcnk6IGJvb2xlYW5cbiAgcHJpdmF0ZSByZWFkb25seTogYm9vbGVhblxuICBwcml2YXRlIGxvY2FsOiBib29sZWFuXG5cbiAgcHJpdmF0ZSBwS2V5OiBNYXliZVVuZGVmaW5lZDxzdHJpbmc+XG4gIHByaXZhdGUgY0tleXM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZHM6IEFycmF5PHN0cmluZz5cbiAgcHJpdmF0ZSBhbGxGaWVsZFR5cGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+XG4gIHByaXZhdGUgYWxsSW5kZXhlczogQXJyYXk8c3RyaW5nPlxuXG4gIGNvbnN0cnVjdG9yKHNjaGVtYTogU2NoZW1hLCBuYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNjaGVtYSA9IE9iamVjdC5hc3NpZ24oe30gLCBzY2hlbWEpXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMubWVtb3J5ID0gc2NoZW1hLm1lbW9yeSA9PT0gdHJ1ZVxuICAgIHRoaXMucmVhZG9ubHkgPSBzY2hlbWEucmVhZG9ubHkgPT09IHRydWVcbiAgICB0aGlzLmxvY2FsID0gc2NoZW1hLmxvY2FsID09PSB0cnVlXG4gICAgdGhpcy5hdHRhY2hWZXJzaW9uRmllbGQoIHRoaXMuc2NoZW1hIClcbiAgICB0aGlzLnBhcnNlRmllbGRzKClcbiAgfVxuXG4gIHByaXZhdGUgYXR0YWNoVmVyc2lvbkZpZWxkKCBzY2hlbWEgOiBTY2hlbWEgKSB7XG4gICAgaWYgKCBzY2hlbWEudGFibGVGaWVsZHMuZmluZCggZiA9PiBmLm5hbWUgPT09ICdfdmVyc2lvbl8nKSApIHJldHVyblxuICAgIHNjaGVtYS50YWJsZUZpZWxkcy5wdXNoKHtcbiAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLFxuICAgICAgdHlwZTogRmllbGRUeXBlcy5OdW1iZXIsXG4gICAgICBkZWZhdWx0OiAwICAgICBcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIHR5cGVcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICFpbmNsdWRlS2V5ICYmICggdGhpcy5jS2V5cy5pbmRleE9mKGYpID49IDAgfHwgZiA9PT0gdGhpcy5wcmltYXJ5S2V5ICkgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogQXJyYXk8c3RyaW5nPlxuICBidWlsZEluc2VydCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkRGVsZXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFVwZGF0ZSggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXksIGZpZWxkVmFsdWVzIDogSnNvbk9iamVjdCwgdmVyc2lvbjogbnVtYmVyKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGRTZWxlY3QoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkczogQXJyYXk8c3RyaW5nPiwgd2hlcmUgOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbn1cblxuZXhwb3J0IGNsYXNzIEpzb25TcWxCdWlsZGVyIGltcGxlbWVudHMgU3FsQnVpbGRlciB7XG5cbiAgcHJpdmF0ZSBnZXRUYWJsZU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gY2hhbmdlQ2FzZS5zbmFrZUNhc2UobW9kZWxOYW1lKSArICdzJ1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQcmltYXJ5S2V5Q29uZGl0aW9uKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkgKCB7fSwgIGtleSApXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTY2hlbWEgKHNjaGVtYTogTW9kZWxTY2hlbWEpIDogQXJyYXk8c3RyaW5nPiB7XG4gICAgbGV0IHNxbHMgPSBuZXcgQXJyYXk8c3RyaW5nPigpIFxuICAgIGNvbnN0IHNjaGVtYU9iamVjdCA9IE9iamVjdC5hc3NpZ24oeyB0eXBlOiAnY3JlYXRlJ30sIGRlZXBDb3B5KHNjaGVtYS5zY2hlbWFPYmplY3QpKSBcbiAgICAvLyBUT0RPOiBnZW5lcmF0ZSBjb21wb3NpdGUga2V5IHNxbFxuICAgIGxldCBzY2hlbWFTcWwgPSBKc29uU3FsLmJ1aWxkKHNjaGVtYU9iamVjdClcbiAgICBzcWxzLnB1c2goc2NoZW1hU3FsLnF1ZXJ5KVxuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBzY2hlbWEuaW5kZXhlcy5mb3JFYWNoKCBmaWVsZCA9PiB7XG4gICAgICBzcWxzLnB1c2goSnNvblNxbC5idWlsZCh7XG4gICAgICAgIHR5cGU6ICdpbmRleCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIG5hbWU6IHRhYmxlTmFtZSArICdfJyArIGZpZWxkLFxuICAgICAgICBpbmRleE9uOiBmaWVsZFxuICAgICAgfSkucXVlcnkpXG4gICAgfSlcblxuICAgIHJldHVybiBzcWxzXG4gIH1cblxuICBwdWJsaWMgYnVpbGRJbnNlcnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkluc2VydCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oIHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICdpbnNlcnQnLFxuICAgICAgdGFibGU6IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpLFxuICAgICAgdmFsdWVzOiBmaWVsZFZhbHVlc1xuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLkRlbGV0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICBjb25kaXRpb246IHRoaXMuZ2V0UHJpbWFyeUtleUNvbmRpdGlvbihzY2hlbWEsIGtleSlcbiAgICB9KSlcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFVwZGF0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpOiBTcWxBbmRQYXJhbWV0ZXJzIHsgICAgXG4gICAgLy8gY29uc3QgbW9kaWZpZXIgPSB0aGlzLmVzY2FwZVNpbmdsZVF1b3RlKGZpZWxkVmFsdWVzKVxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG5cbiAgICBsZXQgY29uZGl0aW9uID0gdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbmRpdGlvblsnX3ZlcnNpb25fJ10gPSB2ZXJzaW9uICBcblxuICAgIGxldCBzcCA9IHsgdHlwZTogU3FsVHlwZS5VcGRhdGUgfVxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHNwLCBKc29uU3FsLmJ1aWxkKHtcbiAgICAgIHR5cGU6ICd1cGRhdGUnLFxuICAgICAgdGFibGU6IHRhYmxlTmFtZSxcbiAgICAgIG1vZGlmaWVyOiBmaWVsZFZhbHVlcyxcbiAgICAgIGNvbmRpdGlvbjogY29uZGl0aW9uXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGRTZWxlY3Qoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzT3JQYXJhbXM6IEFycmF5PHN0cmluZz4gfCBKc29uT2JqZWN0LCB3aGVyZT8gOiBTcWxDb25kaXRpb24sIFxuICAgIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBqb2luPyA6IEpzb25PYmplY3QgKTogU3FsQW5kUGFyYW1ldGVycyB7XG5cbiAgICBjb25zdCB0YWJsZU5hbWUgPSB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKVxuICAgIFxuICAgIGxldCBxdWVyeU9wdGlvbnMgOiBKc29uT2JqZWN0XG4gICAgaWYgKCAhaXNBcnJheSggZmllbGRzT3JQYXJhbXMgKSApIHtcbiAgICAgIGxldCBwYXJhbXMgPSBmaWVsZHNPclBhcmFtcyBhcyBKc29uT2JqZWN0XG4gICAgICBxdWVyeU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKCB7IHR5cGU6ICdzZWxlY3QnLCB0YWJsZTogdGFibGVOYW1lIH0sIHBhcmFtcyApXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGZpZWxkcyA9IGZpZWxkc09yUGFyYW1zIHx8IHNjaGVtYS5maWVsZE5hbWVzLm1hcCggZiA9PiBzY2hlbWEuc2NoZW1hT2JqZWN0LnRhYmxlICsgJy4nICsgZiApXG4gICAgICBsZXQgbG8gOiBMaW1pdEFuZE9mZnNldCA9IGlzTnVtYmVyKCByZXN1bHRSYW5nZSApID8gIHsgbGltaXQgOiByZXN1bHRSYW5nZSB9IDogcmVzdWx0UmFuZ2UgfHwgeyB9XG4gICAgICBsZXQgb3JkZXIgPSBzb3J0IHx8IHt9XG4gICAgICBmb3IgKCBsZXQga2V5IG9mIFJlZmxlY3Qub3duS2V5cyhvcmRlcikgICkge1xuICAgICAgICBsZXQgb3JkZXJWYWx1ZSA9IG9yZGVyW2tleV0gfHwgLTFcbiAgICAgICAgb3JkZXJba2V5XSA9IChvcmRlclZhbHVlID09PSAnQVNDJykgPyAxIDogKCAob3JkZXJWYWx1ZSA9PT0gJ0RFU0MnKSA/IC0xIDogb3JkZXJWYWx1ZSApXG4gICAgICB9XG5cbiAgICAgIHF1ZXJ5T3B0aW9ucyA9IHtcbiAgICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICAgIHRhYmxlOiB0YWJsZU5hbWUsXG4gICAgICAgIGZpZWxkczogZmllbGRzLFxuICAgICAgICBjb25kaXRpb246IHdoZXJlLFxuICAgICAgICBsaW1pdDogbG8ubGltaXQsXG4gICAgICAgIG9mZnNldDogbG8ub2Zmc2V0LFxuICAgICAgICBzb3J0OiBvcmRlcixcbiAgICAgICAgam9pbjogam9pblxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuU2VsZWN0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZChxdWVyeU9wdGlvbnMpKVxuICB9XG59IiwiaW1wb3J0IHsgU3FsaXRlV3JhcHBlciB9IGZyb20gJy4vU3FsaXRlV3JhcHBlcidcbmltcG9ydCB7IE1VTFRJX1NRTF9TRVBBUkFUT1IsIFNxbEFuZFBhcmFtZXRlcnMsIFNxbFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBEYkNvbm5lY3Rpb24sIERCVHJhbnNhY3Rpb24sIENvbm5lY3Rpb25PcHRpb25zLCBTcWxFeGVjdXRlUmVzdWx0IH0gZnJvbSAnLi9EYkNvbm5lY3Rpb24nXG5cblxuY2xhc3MgU3FsaXRlVHJhbnNhY3Rpb24gaW1wbGVtZW50cyBEQlRyYW5zYWN0aW9uIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uIDogRGJDb25uZWN0aW9uXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uKSB7XG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbW1pdCgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ0NPTU1JVDsnKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZSgnUk9MTEJBQ0s7JykgXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFNxbGl0ZUNvbm5lY3Rpb24gaW1wbGVtZW50cyBEYkNvbm5lY3Rpb24ge1xuICBwcml2YXRlIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9uc1xuICBwcml2YXRlIHNxbGl0ZSA6IFNxbGl0ZVdyYXBwZXJcblxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyA6IENvbm5lY3Rpb25PcHRpb25zICkge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLnNxbGl0ZSA9IG5ldyBTcWxpdGVXcmFwcGVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29ubmVjdGlvbk9wdGlvbnMoKTogQ29ubmVjdGlvbk9wdGlvbnMge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5hc3luT3BlbiggdGhpcy5vcHRpb25zLnN0b3JhZ2UgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luQ2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5KHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5blF1ZXJ5KHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBxdWVyeVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKSA6IEFycmF5PGFueT4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5xdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0OiBTcWxFeGVjdXRlUmVzdWx0ICkge1xuICAgIGlmICggcmVzdWx0LnJvd3NFZmZlY3RlZCA9PT0gMCkgIHRocm93IG5ldyBFcnJvcignTm9uZSByb3cgZWZmZWN0ZWQnKVxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaFN5bmMoIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLnNxbGl0ZS5leGVjdXRlQmF0Y2goIHNxbHMgfHwgW10gLCB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlQmF0Y2goIHNxbHMgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNxbGl0ZS5hc3luY0V4ZWN1dGVCYXRjaCggc3FscyB8fCBbXSwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQgKSBcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlU3luYyhzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIHRocm93SWZOb25lRWZmZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZSkgOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgcGFyYW1ldGVycylcbiAgICB0aHJvd0lmTm9uZUVmZmVjdGVkICYmIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkKCByZXN1bHQgKVxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4ZWN1dGUoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkV4ZWN1dGUoIHNxbCwgcGFyYW1ldGVycyApXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcnVuU2NyaXB0KHNxbDogc3RyaW5nKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIHNxbC5zcGxpdCggTVVMVElfU1FMX1NFUEFSQVRPUiApLmZvckVhY2goXG4gICAgICBhc3luYyBzcWw9PiBhd2FpdCAoc3FsLnRyaW0oKSAhPT0gJycpICYmIHRoaXMuc3FsaXRlLmV4ZWN1dGUoc3FsLCBbXSlcbiAgICApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYmVnaW5UcmFucygpOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGUoJ0JFR0lOIFRSQU5TQUNUSU9OOycpXG4gICAgcmV0dXJuIG5ldyBTcWxpdGVUcmFuc2FjdGlvbih0aGlzKVxuICB9XG59IiwiaW1wb3J0IHsgcHJvbWlzaWZ5IH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IENhbGxiYWNrIH0gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nTWFuYWdlciwgTG9nZ2VyIH0gZnJvbSAnLi4vTG9nJ1xuaW1wb3J0IHsgU3FsUGFyYW1ldGVycywgU3FsQW5kUGFyYW1ldGVycyB9IGZyb20gJy4vU3FsQnVpbGRlcidcblxuaW1wb3J0ICogYXMgRGF0YWJhc2UgZnJvbSAnYmV0dGVyLXNxbGl0ZTMnXG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVXcmFwcGVyIHtcbiAgcHJpdmF0ZSBkYiA6IERhdGFiYXNlXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU3FsaXRlV3JhcHBlci5uYW1lKVxuICB9XG5cbiAgcHVibGljIG9wZW4oZGJGaWxlUGF0aDogc3RyaW5nLCBjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICB0aGlzLmRiID0gbmV3IERhdGFiYXNlKGRiRmlsZVBhdGgpXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIG9wZW4gKCBkYiA9ICR7ZGJGaWxlUGF0aH0gKWAgKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nvbm5lY3RlZCgpIDogYm9vbGVhbiB7IHJldHVybiB0aGlzLmRiLm9wZW4gfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luT3BlbihkYkZpbGVQYXRoOiBzdHJpbmcpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLm9wZW4pLmNhbGwodGhpcywgZGJGaWxlUGF0aClcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjYWxsYmFjaz86IENhbGxiYWNrPGJvb2xlYW4+KSA6IGJvb2xlYW4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHRydWUgfVxuICAgIHRyeSB7XG4gICAgICBpZiAoIHRoaXMuZGIgJiYgdGhpcy5pc0Nvbm5lY3RlZCApIHtcbiAgICAgICAgdGhpcy5kYi5jbG9zZSgpIFxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoIGBTVUNDRVNTIGNsb3NlYCApXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgY2xvc2VkIGFscmVhZHlgKVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldCA9IHsgZXJyOiBlcnIsIHJlc3VsdCA6IGZhbHNlIH0gIFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoIGBGQUlMRCBjbG9zZWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHQgICAgXG4gIH1cblxuICBwdWJsaWMgYXN5bkNsb3NlKCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuY2xvc2UpLmNhbGwodGhpcylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxTcWxFeGVjdXRlUmVzdWx0Pik6IFNxbEV4ZWN1dGVSZXN1bHQge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IHsgbGFzdEluc2VydFJvd0lkOiAnMCcsIHJvd3NFZmZlY3RlZDogMCB9IH1cbiAgICB0cnkgeyAgICAgIFxuICAgICAgY29uc3Qgc3FsUmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkucnVuKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICByZXQucmVzdWx0ID0geyBcbiAgICAgICAgbGFzdEluc2VydFJvd0lkIDogc3FsUmVzdWx0Lmxhc3RJbnNlcnRST1dJRC50b1N0cmluZygpLFxuICAgICAgICByb3dzRWZmZWN0ZWQ6IHNxbFJlc3VsdC5jaGFuZ2VzIFxuICAgICAgfVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGV4ZWN1dGUgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIGVmZmVjdGVkID0gJHtyZXQucmVzdWx0LnJvd3NFZmZlY3RlZH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9YCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfSAgICBcbiAgICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgcXVlcnkoc3FsIDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxhbnk+PiApIDogQXJyYXk8YW55PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PGFueT4oKSB9XG4gICAgdHJ5IHtcbiAgICAgIHJldC5yZXN1bHQgPSB0aGlzLmRiLnByZXBhcmUoc3FsKS5hbGwocGFyYW1ldGVycyB8fCBbXSlcbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfSwgcmVzdWx0IGNvdW50ID0gJHtyZXQucmVzdWx0Lmxlbmd0aH1gKVxuICAgIH1cbiAgICBjYXRjaChlcnIpIHtcbiAgICAgIHJldC5lcnIgPSBlcnJcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBxdWVyeSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICBcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkLCBjYWxsYmFjaz86IENhbGxiYWNrPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiAgKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiBuZXcgQXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4oKSB9IFxuICAgIGxldCBzcWwgOiBTcWxBbmRQYXJhbWV0ZXJzIHwgdW5kZWZpbmVkXG4gICAgdHJ5IHtcbiAgICAgIHNxbHMuZm9yRWFjaCggcyA9PiB7XG4gICAgICAgIHNxbCA9IHNcbiAgICAgICAgbGV0IGV4ZWNSZXQgPSB0aGlzLmV4ZWN1dGUoIHMucXVlcnksIHMucGFyYW1ldGVycyApXG4gICAgICAgIG9uRXhlY3V0ZWQgJiYgb25FeGVjdXRlZCggZXhlY1JldCwgcyApICBcbiAgICAgICAgcmV0LnJlc3VsdC5wdXNoKCBleGVjUmV0IClcbiAgICAgIH0pXG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZUJhdGNoLCBzcWwgPSAke3NxbCEucXVlcnl9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShzcWwhLnBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH1cblxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKCByZXQuZXJyLCByZXQucmVzdWx0IClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5FeGVjdXRlKHNxbCwgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMuZXhlY3V0ZSkuY2FsbCh0aGlzLCBzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5blF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICByZXR1cm4gcHJvbWlzaWZ5KHRoaXMucXVlcnkpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jRXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4sIG9uRXhlY3V0ZWQ/OiAocmV0IDogU3FsRXhlY3V0ZVJlc3VsdCwgcyA6IFNxbEFuZFBhcmFtZXRlcnMgKSA9PiB2b2lkICkgOiBQcm9taXNlPEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGVCYXRjaCkuY2FsbCggdGhpcywgc3Fscywgb25FeGVjdXRlZCApXG4gIH1cblxufSIsImltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCB7IGlzU3RyaW5nIH0gZnJvbSAndXRpbCdcbmltcG9ydCB7IEVudGl0eUtleSwgQ29kZUNvbnRyYWN0IGFzIERCQywgTWF5YmVVbmRlZmluZWQsIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTGV2ZWxCbG9jayB9IGZyb20gJy4vTGV2ZWxCbG9jaydcbmltcG9ydCB7IERiU2Vzc2lvbiB9IGZyb20gJy4vRGJTZXNzaW9uJ1xuaW1wb3J0IHsgSnNvbk9iamVjdCwgRW50aXR5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgU3FsaXRlQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvU3FsaXRlQ29ubmVjdGlvbidcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBNb2RlbE5hbWVPclR5cGUsIENvbnN0cnVjdG9yLCBpc0NvbXBvc2l0ZUtleSB9IGZyb20gJy4vTW9kZWwnO1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IEVudGl0eVByb3h5IH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5UHJveHknXG5pbXBvcnQgeyBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBCbG9ja0hlYWRlciwgQmxvY2ssIFRyYW5zYWN0aW9uIH0gZnJvbSAnLi9CbG9jaydcbmltcG9ydCB7IEJsb2NrQ2FjaGUgfSBmcm9tICcuL0Jsb2NrQ2FjaGUnXG5cbnR5cGUgTmFtZWRIb29rPFRGdW5jPiA9IHsgbmFtZTogc3RyaW5nLCBob29rIDogVEZ1bmMgfVxuZXhwb3J0IHR5cGUgQ29tbWl0QmxvY2tIb29rID0gKCBibG9jayA6IEJsb2NrICkgPT4gdm9pZFxuZXhwb3J0IHR5cGUgUm9sbGJhY2tCbG9ja0hvb2sgPSAoIGZyb21IZWlnaHQgOiBudW1iZXIsIHRvSGVpZ2h0IDogbnVtYmVyICkgPT4gdm9pZFxuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBjYWNoZWQgbGFzdCBibG9jayBjb3VudCBcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGNhY2hlZEJsb2NrQ291bnQ/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCA1MDAwIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGhvbGRMb2NrcyA6IFNldDxzdHJpbmc+XG4gIHByaXZhdGUgY29tbWl0QmxvY2tIb29rczogQXJyYXk8TmFtZWRIb29rPENvbW1pdEJsb2NrSG9vaz4+XG4gIHByaXZhdGUgcm9sbGJhY2tCbG9ja0hvb2tzOiBBcnJheTxOYW1lZEhvb2s8Um9sbGJhY2tCbG9ja0hvb2s+PlxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLmhvbGRMb2NrcyA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxDb21taXRCbG9ja0hvb2s+PigpXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MgPSBuZXcgQXJyYXk8TmFtZWRIb29rPFJvbGxiYWNrQmxvY2tIb29rPj4oKVxuICAgIHRoaXMuc2NoZW1hcyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoU21hcnREQi5uYW1lKVxuICAgIHRoaXMuYmxvY2tEQiA9IG5ldyBMZXZlbEJsb2NrKGxldmVsQmxvY2tEaXIpXG4gICAgdGhpcy5jYWNoZWRCbG9ja3MgPSBuZXcgQmxvY2tDYWNoZSggdGhpcy5vcHRpb25zLmNhY2hlZEJsb2NrQ291bnQhIClcbiAgICB0aGlzLmNvbm5lY3Rpb24gPSBuZXcgU3FsaXRlQ29ubmVjdGlvbih7IHN0b3JhZ2U6IGRiUGF0aCB9KVxuICAgIHRoaXMuYmxvY2tTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdCbG9jaycpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24gPSBuZXcgRGJTZXNzaW9uKHRoaXMuY29ubmVjdGlvbiwgdGhpcy5vcHRpb25zLmVudGl0eUNhY2hlT3B0aW9ucywgJ0xvY2FsJylcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiAsIHRocm93SWZVbmRlZmluZWQgPSBmYWxzZSwgdGhyb3dJZlJlYWRvbmx5ID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8TW9kZWxTY2hlbWE+IHtcbiAgICBjb25zdCBtb2RlbE5hbWUgPSBpc1N0cmluZyggbW9kZWwgKSA/IFN0cmluZyhtb2RlbCkgOiAoIG1vZGVsIGFzIENvbnN0cnVjdG9yPFRFbnRpdHk+ICkubmFtZSBcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5zY2hlbWFzLmdldChtb2RlbE5hbWUpIFxuICAgIHRocm93SWZVbmRlZmluZWQgJiYgREJDLnZlcmlmeSggc2NoZW1hICE9PSB1bmRlZmluZWQsIGB1bnJlZ2lzdGVyZWQgbW9kZWwgJyR7IG1vZGVsTmFtZSB9J2ApXG4gICAgdGhyb3dJZlJlYWRvbmx5ICYmIERCQy52ZXJpZnkoICFzY2hlbWEhLmlzUmVhZG9ubHksIGBtb2RlbCAnJHsgbW9kZWxOYW1lIH0nIGlzIHJlYWRvbmx5YClcblxuICAgIHJldHVybiBzY2hlbWFcbiAgfVxuXG4gIHByaXZhdGUgZ2V0U2Vzc2lvbjxURW50aXR5Piggc2NoZW1hIDogTW9kZWxTY2hlbWEgKSA6IERiU2Vzc2lvbiB7IFxuICAgIHJldHVybiBzY2hlbWEhLmlzTG9jYWwgPyB0aGlzLmxvY2FsU2Vzc2lvbiA6IHRoaXMuYmxvY2tTZXNzaW9uXG4gIH1cblxuICBwcml2YXRlIHByZUNvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGJsb2NrICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Q29tbWl0QmxvY2soIGJsb2NrOiBCbG9jayApIHtcbiAgICB0aGlzLmVtaXQoJ25ld0Jsb2NrJywgYmxvY2spXG4gIH1cblxuICBwcml2YXRlIHByZVJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZvckVhY2goIG5oID0+IG5oLmhvb2soIGZyb20sIHRvICkgKVxuICB9XG5cbiAgcHJpdmF0ZSBwb3N0Um9sbGJhY2tCbG9jayggZnJvbSA6IG51bWJlciwgdG8gOiBudW1iZXIgKSB7XG4gICAgdGhpcy5lbWl0KCdyb2xsYmFja0Jsb2NrJywgeyBmcm9tLCB0byB9IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciBjb21taXQgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGJsb2NrICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyQ29tbWl0QmxvY2tIb29rKCBuYW1lOiBzdHJpbmcsIGhvb2tGdW5jOiBDb21taXRCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5jb21taXRCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcbiAgICBcbiAgICB0aGlzLmNvbW1pdEJsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2sgOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqL1xuICBwdWJsaWMgdW5yZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kSW5kZXgoIG5oID0+IG5oLm5hbWUgPT09IG5hbWUudHJpbSgpIClcbiAgICBpZiAoIGluZGV4ID49IDAgKSB0aGlzLmNvbW1pdEJsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG4gIC8qKlxuICAgKiByZWdpc3RlciByb2xsYmFjayBibG9jayBob29rLCB3aGljaCB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgY29tbWl0IGJsb2NrXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKiBAcGFyYW0gaG9va0Z1bmMgaG9vayBmdW5jdGlvbiAsICggZnJvbUhlaWdodCwgdG9IZWlnaHQgKSA9PiB2b2lkXG4gICAqL1xuICBwdWJsaWMgcmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogUm9sbGJhY2tCbG9ja0hvb2sgKSB7XG4gICAgREJDLmFyZ3VtZW50KCAnaG9va0Z1bmMnLCAoKSA9PiBEQkMubm90TnVsbChob29rRnVuYykpXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsICgpID0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKG5hbWUpKSAgICBcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZChuaD0+bmgubmFtZSA9PT0gbmFtZS50cmltKCkpID09PSB1bmRlZmluZWQsIFxuICAgICAgYGhvb2sgbmFtZWQgJyR7bmFtZX0nIGV4aXN0IGFscmVhZHlgKVxuXG4gICAgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MucHVzaCh7IG5hbWUsIGhvb2s6IGhvb2tGdW5jIH0pXG4gIH1cblxuICAvKipcbiAgICogdW5yZWdpc3RlciByb2xsYmFjayBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJSb2xsYmFja0Jsb2NrSG9vayggbmFtZTogc3RyaW5nICkge1xuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgIFxuXG4gICAgbGV0IGluZGV4ID0gdGhpcy5yb2xsYmFja0Jsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5yb2xsYmFja0Jsb2NrSG9va3Muc2xpY2UoIGluZGV4IClcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBmb3IoIGNvbnN0IHNjaGVtYSBvZiBzY2hlbWFzICkge1xuICAgICAgdGhpcy5zY2hlbWFzLnNldCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hIClcbiAgICAgIGxldCBzZXNzaW9uID0gdGhpcy5nZXRTZXNzaW9uKCBzY2hlbWEgKVxuXG4gICAgICBzZXNzaW9uLnJlZ2lzdGVyU2NoZW1hKHNjaGVtYSlcbiAgICAgIHNlc3Npb24uc3luY1NjaGVtYShzY2hlbWEpXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBzeW5jIHNjaGVtYSBtb2RlbCA9ICR7c2NoZW1hLm1vZGVsTmFtZX0gYClcblxuICAgICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICkgeyBcbiAgICAgICAgbGV0IGl0ZW1zID0gYXdhaXQgc2Vzc2lvbi5nZXRNYW55KCBzY2hlbWEubW9kZWxOYW1lLCB7fSwgZmFsc2UsIHRydWUgKVxuICAgICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBtb2RlbCAke3NjaGVtYS5tb2RlbE5hbWV9IGNhY2hlZCAke2l0ZW1zLmxlbmd0aH0gZW50aXRpZXMgYClcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5lbWl0KCAncmVhZHknLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmcmVlIHJlc291cmNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5jbG9zZSgpXG4gICAgXG4gICAgdGhpcy5lbWl0KCdjbG9zZWQnLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBoZWlnaHQgb2YgbGFzdCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tEQi5sYXN0QmxvY2tIZWlnaHRcbiAgfVxuXG4gIC8qKlxuICAgKiBibG9ja3MgY291bnRcbiAgICovXG4gIHB1YmxpYyBnZXQgYmxvY2tzQ291bnQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMVxuICB9XG5cbiAgLyoqXG4gICAqIGxhc3QgY29tbWl0ZWQgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrKCkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIC8vIFRPRE86IHJldHVybiBsYXN0IGJsb2NrIGNvcHkgP1xuICAgIHJldHVybiB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0IClcbiAgfVxuXG4gIC8qKlxuICAgKiBob2xkIGEgbG9jayBuYW1lIHdoaWNoIG9ubHkgc3VjY2VlZCBpbiBmaXJzdCB0aW1lIG9mIGVhY2ggYmxvY2suXG4gICAqIEBwYXJhbSBsb2NrTmFtZSBsb2NrIG5hbWVcbiAgICogQHBhcmFtIG5vdFRocm93IGRvIG5vdCB0aHJvdyBleGNlcHRpb24gaWYgbG9jayBmYWlsZWRcbiAgICovXG4gIHB1YmxpYyBsb2NrSW5DdXJyZW50QmxvY2soIGxvY2tOYW1lOiBzdHJpbmcsIG5vdFRocm93ID0gZmFsc2UgKSA6IGJvb2xlYW4ge1xuICAgIGlmICggIXRoaXMuaG9sZExvY2tzLmhhcyggbG9ja05hbWUgKSApIHtcbiAgICAgIHRoaXMuaG9sZExvY2tzLmFkZCggbG9ja05hbWUgKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAoICFub3RUaHJvdyApIHRocm93IG5ldyBFcnJvcihgJHtsb2NrTmFtZX0gZXhpc3RzIGFscmVhZHlgKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsIGJsb2NrLmhlaWdodCA9PT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxLCBgaW52YWxpZCBibG9jayBoZWlnaHQgJHtibG9jay5oZWlnaHR9LCBsYXN0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIFxuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGJsb2NrIGhlaWdodCA9ICR7YmxvY2suaGVpZ2h0fWApXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHR9YClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlQ29tbWl0QmxvY2soIHRoaXMuY3VycmVudEJsb2NrIClcblxuICAgIGxldCBibG9ja0hlYWRlciA9IE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShibG9ja0hlYWRlciwgJ3RyYW5zYWN0aW9ucycpXG4gICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmFwcGVuZEJsb2NrKCBibG9ja0hlYWRlciwgdGhpcy5ibG9ja1Nlc3Npb24uZ2V0Q2hhbmdlcygpIClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uc2F2ZUNoYW5nZXMoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCApXG4gICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5Rm9yUm9sbGJhY2shIClcbiAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLnB1dCggdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RDb21taXRCbG9jayggdGhpcy5sYXN0QmxvY2shIClcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7IFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGNvbW1pdEJsb2NrICggaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgZnJvbUhlaWdodCA9IHRoaXMuY3VycmVudEJsb2NrID8gdGhpcy5jdXJyZW50QmxvY2shLmhlaWdodCA6IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgdG9IZWlnaHQgPSBoZWlnaHQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGFzdEJsb2NrSGVpZ2h0IDogaGVpZ2h0XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlUm9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0IClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIClcbiAgICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoIHRvSGVpZ2h0IClcbiAgICAgIHdoaWxlKCB0aGlzLmxhc3RCbG9ja0hlaWdodCA+IHRvSGVpZ2h0ICkge1xuICAgICAgICBhd2FpdCB0aGlzLmJsb2NrREIuZGVsZXRlTGFzdEJsb2NrKCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLmV2aXQoIHRoaXMubGFzdEJsb2NrSGVpZ2h0LCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gICAgICB9XG4gICAgICB0aGlzLmN1cnJlbnRCbG9jayA9IG51bGxcbiAgICAgIC8vIGVtaXQgZXZlbnRcbiAgICAgIHRoaXMucG9zdFJvbGxiYWNrQmxvY2soIGZyb21IZWlnaHQsICB0b0hlaWdodCApICAgICAgXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+IDAsIGBzZXJpYWwgbXVzdCBncmVhdCB0aGFuIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgZW50aXR5IGtleVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRFbnRpdHlLZXk8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlLZXk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG4gICAgXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwsIHRydWUpIVxuICAgIHJldHVybiBzY2hlbWEuZ2V0S2V5KCBlbnRpdHkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0cmFja2luZyBlbnRpdHkgYnkga2V5IFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCkgPT4gREJDLm5vdE51bGwoa2V5KSApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmF0dGFjaCggc2NoZW1hLCBrZXkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIG5ldyBlbnRpdHkgd2hpY2ggY2hhbmdlIHdpbGwgYmUgdHJhY2tlZCBhbmQgcGVyc2lzdGVudGVkIChieSBzYXZlQ2hhbmdlcykgYXV0b21hdGljYWxseVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5IHdoaWNoIHVuaXF1ZWQgaW4gZGF0YWJhc2VcbiAgICogQHBhcmFtIGVudGl0eSBwcm90b3R5cGUgZW50aXR5IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBjb3B5IHRvIHJlc3VsdCBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tpbmcgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5T3JFbnRpdHk6IEVudGl0eUtleSB8IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5T3JFbnRpdHknLCAoKT0+IERCQy5ub3ROdWxsKGtleU9yRW50aXR5KSlcbiAgICBcbiAgICBsZXQga2V5IDogRW50aXR5S2V5XG4gICAgbGV0IGVudGl0eTogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG5cbiAgICBpZiAoIGlzUHJpbWl0aXZlS2V5KCBrZXlPckVudGl0eSApIHx8IGlzQ29tcG9zaXRlS2V5KCBrZXlPckVudGl0eSApICkgeyBcbiAgICAgIGtleSA9IGtleU9yRW50aXR5IGFzIEVudGl0eUtleSBcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbnRpdHkgPSBrZXlPckVudGl0eSBhcyBURW50aXR5XG4gICAgICBrZXkgPSBzY2hlbWEuZ2V0S2V5KGVudGl0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSB0cmFja2luZyBlbnRpdHlgIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbilcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcblxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZ2V0IGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRNYW55KG1vZGVsLCBjb25kaXRpb24sIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgb25seVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWRDYWNoZWQobW9kZWwsIGtleSwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGFsbCBjYWNoZWQgZW50aXRpZXNcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+LCAgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0QWxsQ2FjaGVkKCBtb2RlbCwgZmlsdGVyLCB0cmFjayApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHJlc3VsdFJhbmdlIGxpbWl0IGFuZCBvZmZzZXQgb2YgcmVzdWx0cyBudW1iZXIgb3IganNvbiwgZWc6IDEwIG9yIHsgbGltaXQgOiAxMCwgb2Zmc2V0IDogMSB9IFxuICAgKiBAcGFyYW0gc29ydCBqc29uIHsgZmllbGROYW1lIDogJ0FTQycgfCAnREVTQycgfSAsIGVnOiB7IG5hbWUgOiAnQVNDJywgYWdlIDogJ0RFU0MnIH1cbiAgICogQHBhcmFtIGZpZWxkcyByZXN1bHQgZmllbGRzLCBkZWZhdWx0IGlzIGFsbCBmaWVsZHNcbiAgICogQHBhcmFtIG9mZnNldCBvZmZzZXQgb2YgcmVzdWx0IHNldCAgXG4gICAqIEBwYXJhbSBqb2luIGpvaW4gaW5mbyBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgXG4gICAgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeShtb2RlbCwgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgZmllbGRzLCBqb2luKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZE9uZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGxldCBpdGVtcyA9IGF3YWl0IHRoaXMuZmluZEFsbCggbW9kZWwsIHBhcmFtcyApXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBwYXJhbXMgPSAnJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfScgKWApXG4gICAgXG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGl0ZW1zWzBdXG4gIH1cblxuICAgIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHBhcmFtcyBtYW5nbyBsaWtlIHF1ZXJ5IHBhcmFtcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeUJ5SnNvbiggbW9kZWwsIHBhcmFtcyApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBxdWVyeSBpZiBleGlzdHMgcmVjb3JkIGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZXhpc3RzKG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICAvKipcbiAgICogY291bnQgcmVjb3JkcyBjb3VudCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jb3VudChtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tzIDogQXJyYXk8QmxvY2tIZWFkZXI+LCAgZ2V0VHJhbnNhY3Rpb25zOiAoKSA9PiBQcm9taXNlPEFycmF5PFRyYW5zYWN0aW9uPj4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgbGV0IHRyYW5zR3JvdXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8VHJhbnNhY3Rpb24+PigpXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IGdldFRyYW5zYWN0aW9ucygpXG5cbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCggdCA9PiB7XG4gICAgICBpZiAoIXRyYW5zR3JvdXAuaGFzKCB0LmJsb2NrSWQgKSkgdHJhbnNHcm91cC5zZXQoIHQuYmxvY2tJZCwgbmV3IEFycmF5PFRyYW5zYWN0aW9uPigpIClcbiAgICAgIHRyYW5zR3JvdXAuZ2V0KCB0LmJsb2NrSWQgKSEucHVzaCggdCApXG4gICAgfSApXG5cbiAgICBibG9ja3MuZm9yRWFjaCggYiA9PiBiWyd0cmFuc2FjdGlvbnMnXSA9IHRyYW5zR3JvdXAuZ2V0KGIuaWQhKSApXG4gICAgcmV0dXJuIGJsb2NrcyBhcyBBcnJheTxCbG9jaz5cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGhlaWdodFxuICAgKiBAcGFyYW0gaGVpZ2h0IGJsb2NrIGhlaWdodFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlIZWlnaHQoIGhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPj0gMCAsICdoZWlnaHQgbXVzdCBncmVhdCBvciBlcXVhbCB6ZXJvJylcbiAgICBcbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNhY2hlZEJsb2Nrcy5nZXQoaGVpZ2h0KVxuICAgIGlmICggY2FjaGVkQmxvY2sgKSByZXR1cm4gY2FjaGVkQmxvY2tcblxuICAgIGxldCBibG9ja0hlYWRlciA9IGF3YWl0IHRoaXMuYmxvY2tEQi5nZXRCbG9jayggaGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGJsb2NrIGlkXG4gICAqIEBwYXJhbSBibG9ja0lkIGJsb2NrIGlkIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlJZCggYmxvY2tJZCA6IHN0cmluZywgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnYmxvY2tJZCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoYmxvY2tJZCkpXG5cbiAgICBsZXQgY2FjaGVkQmxvY2sgPSB0aGlzLmNhY2hlZEJsb2Nrcy5nZXRCeUlkKCBibG9ja0lkIClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2tCeUlkKCBibG9ja0lkIClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zIHx8IGJsb2NrSGVhZGVyID09PSB1bmRlZmluZWQgICkgcmV0dXJuIGJsb2NrSGVhZGVyXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy5hdHRhY2hUcmFuc2FjdGlvbnMoIFtibG9ja0hlYWRlciFdICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiBibG9ja0hlYWRlciEuaWQhIH0pIClbMF1cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBoZWlnaHQgcmFuZ2VcbiAgICogQHBhcmFtIG1pbkhlaWdodCBtaW4gaGVpZ2h0KGluY2x1ZGVkKVxuICAgKiBAcGFyYW0gbWF4SGVpZ2h0IG1heCBoZWlnaHQoaW5jbHVkZWQpXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0QmxvY2tzQnlIZWlnaHRSYW5nZSggbWluSGVpZ2h0IDogbnVtYmVyLCBtYXhIZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21pbkhlaWdodCwgbWF4SGVpZ2h0JywgbWluSGVpZ2h0ID49IDAgJiYgbWF4SGVpZ2h0ID49IG1pbkhlaWdodCwgJ21pbkhlaWdodCBvciBtYXhIZWlnaHQgaXMgaW52YWxpZCcpXG5cbiAgICAvLyBUT0RPOiBvYnRhaW4gYmxvY2tzIGZyb20gY2FjaGVcbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCwgbWF4SGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBibG9jayBpZCBhcnJheVxuICAgKiBAcGFyYW0gYmxvY2tJZHMgYXJyYXkgb2YgYmxvY2sgaWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+LCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkcycsICgpID0+IERCQy5ub3ROdWxsKGJsb2NrSWRzKSApXG5cbiAgICAvLyBUT0RPOiBvYnRhaW4gYmxvY2tzIGZyb20gY2FjaGVcbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SWRzKGJsb2NrSWRzKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG59IiwiaW1wb3J0IHsgRW50aXR5LCAgTnVsbGFibGUgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgRW50aXR5VHJhY2tlciwgUHJveGllZEVudGl0eVRyYWNrZXIgfSBmcm9tICcuL0VudGl0eVRyYWNrZXInXG5cbi8qKiAgICAgXG4gKiAgICAgU1RBVEUgVFJBTlNGRVIgICAgICAgICAgICAgICAgICBBQ1RJT04gICAgICAgICAgICAgICAgVFJBQ0sgICAgICBDQUNIRVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgICA/ICAgICAgICAgLT4gcGVyc2l0ZW50ICAgICAgc2Vzc2lvbi5sb2FkICAgICAgICAgICAgIHRyYWNrICAgICBjYWNoZVxuICogICAgICA/ICAgICAgICAgLT4gbmV3ICAgICAgICAgICAgc2Vzc2lvbi5jcmVhdGUgICAgICAgICAgIHRyYWNrICAgICAgIC0gIFxuICogcGVyc2lzdGVudCAgICAgLT4gbW9kaWZpZWQgICAgICAgc2V0IHByb3BlcnR5ICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IGRlbGV0ZWQgICAgICAgIHNlc3Npb24uZGVsICAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBuZXcgfCBtb2RpZmllZCAtPiBwcmVzaXN0ZW50ICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAga2VlcCAgICAgY2FjaGV8dXBkYXRlIFxuICogZGVsZXRlZCAgICAgICAgLT4gdHJhbnNpZW50ICAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGV2aXQgICAgICAgZXZpdFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmV4cG9ydCBlbnVtIEVudGl0eVN0YXRlIHtcbiAgVHJhbnNpZW50ICA9IC0xLFxuICBQZXJzaXN0ZW50ID0gMCxcbiAgXG4gIE5ldyAgICAgICAgPSAxLFxuICBNb2RpZmllZCAgID0gMixcbiAgRGVsZXRlZCAgICA9IDMsXG59XG5cbmV4cG9ydCBlbnVtIEVudGl0eUNoYW5nZVR5cGUge1xuICBOZXcgICAgICAgPSAxLFxuICBNb2RpZnkgICAgPSAyLFxuICBEZWxldGUgICAgPSAzLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50IDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19zY2hlbWFfXyAgICAgOiBNb2RlbFNjaGVtYVxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX190bXBDaGFuZ2VzX18gOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlcjtcblxuICBjb25zdHJ1Y3Rvcih0cmFja2VyOiBFbnRpdHlUcmFja2VyKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0V4dGVuZGVkKGVudGl0eTogRW50aXR5KSB7XG4gICAgcmV0dXJuIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zY2hlbWFfXycpICYmIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zdGF0ZV9fJylcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNQcm94aWVkKGVudGl0eTogRW50aXR5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBFbnRpdHlQcm94eS5pc0V4dGVuZGVkKGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY29udmVydFRvUHJveGllZDxURW50aXR5PihlbnRpdHk6IEVudGl0eSkgOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgUHJveGllZCBFbnRpdHlgKVxuICAgIFxuICAgIHJldHVybiBlbnRpdHkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBwcm94eVRvRW50aXR5KHByb3hpZWQ6IFByb3hpZWQ8RW50aXR5Pik6IEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IHt9XG4gICAgZm9yKCBsZXQgayBpbiBwcm94aWVkICkge1xuICAgICAgaWYgKCBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGspICkgZW50aXR5W2tdID0gcHJveGllZFtrXVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlICkgOiBURW50aXR5IHtcbiAgICBsZXQgcmVzdWx0ID0gIE9iamVjdC5hc3NpZ24oe1xuICAgICAgX3ZlcnNpb25fICAgICAgOiAxLFxuICAgICAgX19kZXRhY2hlZF9fICAgOiBmYWxzZSxcbiAgICAgIF9fc3RhdGVfXyAgICAgIDogc3RhdGUsXG4gICAgICBfX3NjaGVtYV9fICAgICA6IHNjaGVtYSxcbiAgICAgIF9fdHJhY2tlcl9fICAgIDogdGhpcy50cmFja2VyLCBcbiAgICAgIF9fdHJhY2tpbmdfXyAgIDogdHJ1ZSxcbiAgICAgIF9fdG1wQ2hhbmdlc19fIDogbnVsbFxuICAgIH0sIGVudGl0eSlcbiAgICBcbiAgICByZXN1bHQuX3ZlcnNpb25fID0gcmVzdWx0Ll92ZXJzaW9uXyB8fCAxXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIG9uUHJvcGVydHlTZXQoZW50aXR5OiBFbnRpdHksIHByb3BlcnR5TmFtZTogUHJvcGVydHlLZXksIHZhbHVlOiBhbnksIHJlY2VpdmVyOiBhbnkpIDogYm9vbGVhbiB7ICAgICAgXG4gICAgY29uc3QgZXh0ID0gZW50aXR5IGFzIEVudGl0eUV4dGVuc2lvbiBcbiAgICBjb25zdCBuYW1lID0gcHJvcGVydHlOYW1lLnRvU3RyaW5nKClcblxuICAgIGlmICggIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkobmFtZSkgfHwgIWV4dC5fX3RyYWNraW5nX18gIHx8IHZhbHVlID09PSBlbnRpdHlbcHJvcGVydHlOYW1lXSApIHtcbiAgICAgIGVudGl0eVtwcm9wZXJ0eU5hbWVdID0gdmFsdWVcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZCB8fCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByb3BlcnR5IGFmdGVyIGRlbGV0ZWRgKVxuICAgIH1cbiAgICBcbiAgICBsZXQgc2NoZW1hID0gZXh0Ll9fc2NoZW1hX19cbiAgICBpZiAoIHNjaGVtYS5pc1JlYWRvbmx5ICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSByZWFkb25seSBtb2RlbCAnJHtzY2hlbWEubW9kZWxOYW1lfSdgKVxuICAgIH1cblxuICAgIGlmICggc2NoZW1hLnByaW1hcnlLZXkgPT09IG5hbWUgfHwgc2NoZW1hLmNvbXBvc2l0ZUtleXMuaW5kZXhPZihuYW1lKSA+PSAwICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4gbm90IG1vZGlmeSBwcmltYXJ5IGZpZWxkIHByb3BlcnR5YClcbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX2RldGFjaGVkX18gKSB7XG4gICAgICAoIGV4dC5fX3RyYWNrZXJfXyBhcyBQcm94aWVkRW50aXR5VHJhY2tlcikuYXR0YWNoKCByZWNlaXZlciBhcyBQcm94aWVkPGFueT4gKVxuICAgICAgZXh0Ll9fZGV0YWNoZWRfXyA9IGZhbHNlXG4gICAgfVxuICAgIFxuICAgIGlmICggZXh0Ll9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuUGVyc2lzdGVudCApIHtcbiAgICAgIGV4dC5fdmVyc2lvbl8gKytcbiAgICAgIGV4dC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5Nb2RpZmllZFxuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fID0geyAgICAgICAgXG4gICAgICAgIHR5cGUgOiBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeSwgICAgICAgIFxuICAgICAgICBkYlZlcnNpb246IGV4dC5fdmVyc2lvbl8sXG4gICAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPih7IFxuICAgICAgICAgIG5hbWU6ICdfdmVyc2lvbl8nLCBvcmlnaW5hbDogZXh0Ll92ZXJzaW9uXyAtIDEsIGN1cnJlbnQ6IGV4dC5fdmVyc2lvbl8gXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCApIHtcbiAgICAgIGV4dC5fX3RtcENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMucHVzaCh7IG5hbWU6IG5hbWUsIG9yaWdpbmFsOiBleHRbbmFtZV0sIGN1cnJlbnQ6IHZhbHVlIH0pXG4gICAgfVxuXG4gICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzRGlydHkoIGVudGl0eTogRW50aXR5ICkgOiBib29sZWFuIHtcbiAgICBjb25zdCBzdGF0ZSA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KS5fX3N0YXRlX19cbiAgICByZXR1cm4gISAoIHN0YXRlID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50IHx8IHN0YXRlID09PSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQgKVxuICAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZFxuICAgKiBAcGFyYW0gZW50aXR5IEVudGl0eSBjcmVhdGUgbWFudWFsXG4gICAqIEBwYXJhbSBtb2RlbCBNb2RlbCBOYW1lXG4gICAqL1xuICBwdWJsaWMgcHJveHlOZXc8VEVudGl0eT4oIGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSApOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBsZXQgZXh0ZW5kZWQgPSB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoIGVudGl0eSwgc2NoZW1hLCAgRW50aXR5U3RhdGUuTmV3IClcbiAgICByZXR1cm4gbmV3IFByb3h5KGV4dGVuZGVkLCB7IHNldCA6IHRoaXMub25Qcm9wZXJ0eVNldCB9KSBhcyBQcm94aWVkPFRFbnRpdHk+XG4gIH1cblxuICAvKipcbiAgICogTWFrZSBlbnRpdHkgd3JhcHBlZCBieSBwcm94eSBzbyB0aGF0IHN0YXRlIGNoYW5nZXMgY2FuIGJlIGRldGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGxvYWRlZCBmcm9tIGRhdGFiYXNlLiBBVFRFTlNUSU9OOiBlbnN1cmUgdGhhdCBoYXMgcHJvcGVydHkgJ192ZXJzaW9uXydcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eVBlcnNpc3RlbnQ8VEVudGl0eT4oIGVudGl0eTogRW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9ICB0aGlzLmF0dGFjaEV4dGVuZFByb3BlcnRpZXMoZW50aXR5LCBzY2hlbWEsIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxufVxuXG4iLCJpbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlDYWNoZSB9IGZyb20gJy4uL0VudGl0eUNhY2hlJztcbmltcG9ydCB7IE1vZGVsU2NoZW1hLCBDb21wb3NpdGVLZXkgfSBmcm9tICcuLi9Nb2RlbCc7XG5pbXBvcnQgeyBFbnRpdHksIEVudGl0eUtleSwgbWFrZUpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi4vQ29tbW9uJztcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eVByb3h5LCBQcm9wZXJ0eUNoYW5nZSwgUHJveGllZCwgRW50aXR5U3RhdGUsIEVudGl0eUNoYW5nZVR5cGUgfSBmcm9tICcuL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgU3FsQW5kUGFyYW1ldGVycywgU3FsQnVpbGRlciB9IGZyb20gJy4uL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBpc051bWJlciwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IHR5cGUgRW50aXR5VHJhY2tlckFjdGlvbiA9IChtb2RlbDogc3RyaW5nLCBlbnRpdHk6IEVudGl0eSwgY2hhbmdlcyA6IEVudGl0eUNoYW5nZXMpID0+IHZvaWRcblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlUcmFja2VyIHtcbiAgcmVhZG9ubHkgdHJhY2tpbmdFbnRpdGllcyA6IEl0ZXJhYmxlPEVudGl0eT5cblxuICBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhblxuICB0cmFja05ldyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja1BlcnNpc3RlbnQoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlcbiAgdHJhY2tEZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogRW50aXR5ICk6IHZvaWRcblxuICBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkXG4gIHN0b3BUcmFja0FsbCgpOiB2b2lkXG5cbiAgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbiAgcmVqZWN0Q2hhbmdlcygpIDogdm9pZFxuICByb2xsYmFja0NoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkXG59XG5cbi8vIGV4cG9ydCBjbGFzcyBNb2RlbEFuZEtleSB7XG4vLyAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IG1vZGVsQW5kS2V5U2VwYXJhdG9yID0gJyEjISdcblxuLy8gICBwcml2YXRlIG1vZGVsTmFtZSA6IHN0cmluZ1xuLy8gICBwcml2YXRlIGVudGl0eUtleSA6IEVudGl0eUtleVxuXG4vLyAgIHB1YmxpYyBjb25zdHJ1Y3RvciggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIHtcbi8vICAgICB0aGlzLm1vZGVsTmFtZSA9IG1vZGVsXG4vLyAgICAgdGhpcy5lbnRpdHlLZXkgPSBrZXlcbi8vICAgfVxuXG4vLyAgIHB1YmxpYyBnZXQgbW9kZWwoKSB7IHJldHVybiB0aGlzLm1vZGVsTmFtZSB9XG4vLyAgIHB1YmxpYyBnZXQga2V5KCkgeyByZXR1cm4gdGhpcy5lbnRpdHlLZXkgfVxuXG4vLyAgIHB1YmxpYyB0b1N0cmluZygpIHtcbi8vICAgICByZXR1cm4gXG4vLyAgIH1cbi8vIH1cbmV4cG9ydCB0eXBlIE1vZGVsQW5kS2V5ID0gc3RyaW5nXG5cbmV4cG9ydCB0eXBlIEVudGl0eUNoYW5nZXNJdGVtID0geyBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfVxuXG5leHBvcnQgY2xhc3MgUHJveGllZEVudGl0eVRyYWNrZXIgaW1wbGVtZW50cyBFbnRpdHlUcmFja2VyIHsgIFxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIHByb3h5IDogRW50aXR5UHJveHlcbiAgcHJpdmF0ZSBjYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgbWluVmVyc2lvbiA6IG51bWJlclxuICBwcml2YXRlIGN1cnJlbnRWZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgaGlzdG9yeSA6IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+XG4gIHByaXZhdGUgYWxsVHJhY2tpbmdFbnRpdGllcyA6IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihjYWNoZTogRW50aXR5Q2FjaGUpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFByb3hpZWRFbnRpdHlUcmFja2VyLm5hbWUpXG4gICAgdGhpcy5wcm94eSA9IG5ldyBFbnRpdHlQcm94eSh0aGlzKVxuICAgIHRoaXMuY2FjaGUgPSBjYWNoZVxuICAgIHRoaXMuaGlzdG9yeSA9IG5ldyBNYXA8bnVtYmVyLCBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgUHJveGllZDxhbnk+PigpXG4gICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSAtMVxuICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSAtMVxuICB9XG5cbiAgcHJvdGVjdGVkIGVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5ICkge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoIHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKTtcbiAgICBpZiAoIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IG1vZGVsPSR7c2NoZW1hLm1vZGVsTmFtZX0ga2V5PSR7c2NoZW1hLmdldEtleShlbnRpdHkpfSBpcyB0cmFja2luZ2ApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCBtYWtlTW9kZWxBbmRLZXkoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBNb2RlbEFuZEtleSB7XG4gICAgbGV0IG1rID0geyBtOiBzY2hlbWEubW9kZWxOYW1lLCBrOiBrZXl9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBtayApXG4gIH1cblxuICBwdWJsaWMgc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgOiBNb2RlbEFuZEtleSApIDogeyBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSB9IHtcbiAgICBsZXQgbWsgPSBKU09OLnBhcnNlKCBtb2RlbEFuZEtleSApXG4gICAgbGV0IGtleSA9IGlzU3RyaW5nKG1rLmspIHx8IGlzTnVtYmVyKG1rLmspID8gbWsuayA6IG5ldyBDb21wb3NpdGVLZXkobWsuay5rZXlPYmplY3QpXG4gICAgcmV0dXJuIHsgbW9kZWwgOiBtay5tLCBrZXk6IGtleSB9XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0SGlzdG9yeUJ5VmVyc2lvbiggaGlzdG9yeVZlcnNpb246IG51bWJlciwgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSApOiBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+IHtcbiAgICBpZiAoIXRoaXMuaGlzdG9yeS5oYXMoaGlzdG9yeVZlcnNpb24pICYmIGNyZWF0ZUlmTm90RXhpc3RzIClcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQoaGlzdG9yeVZlcnNpb24sIG5ldyBNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+KCkpXG5cbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LmdldChoaXN0b3J5VmVyc2lvbikhXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0TW9kZWxBbmRLZXkoIHBlOiBQcm94aWVkPGFueT4gKTogTW9kZWxBbmRLZXkge1xuICAgIHJldHVybiB0aGlzLm1ha2VNb2RlbEFuZEtleShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSkpXG4gIH1cblxuICBwcm90ZWN0ZWQgc2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzLCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICkgOiB2b2lkIHtcbiAgICB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oaGlzdG9yeVZlcnNpb24sIHRydWUpLnNldCggdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXMpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PiApOiB2b2lkIHtcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBhdHRhY2hIaXN0b3J5IGhpc3RvcnkgaW5mbyA9ICR7SlNPTi5zdHJpbmdpZnkodGhpcy5oaXN0b3J5VmVyc2lvbil9YClcblxuICAgIGhpc3RvcnkuZm9yRWFjaCggKGNoYW5nZXMsIHZlcnNpb24pID0+IHtcbiAgICAgIGxldCBjaGFuZ2VzTWFwID0gbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKVxuICAgICAgY2hhbmdlcy5mb3JFYWNoKCBjID0+IGNoYW5nZXNNYXAuc2V0KCBjLm1vZGVsQW5kS2V5LCBjLmNoYW5nZXMhICkpXG4gICAgICB0aGlzLmhpc3Rvcnkuc2V0KHZlcnNpb24sIGNoYW5nZXNNYXAgKVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy5sb2cuaW5mb0VuYWJsZWQpIHtcbiAgICAgIGxldCBoZWlnaHRJbmZvID0gbmV3IEFycmF5PG51bWJlcj4oKVxuICAgICAgaGlzdG9yeS5mb3JFYWNoKCAoYywgaCkgPT4gaGVpZ2h0SW5mby5wdXNoKGgpIClcbiAgICAgIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgYXR0YWNoSGlzdG9yeSBoZWlnaHQgPSAke0pTT04uc3RyaW5naWZ5KGhlaWdodEluZm8pfWApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCBoaXN0b3J5VmVyc2lvbigpIDogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHsgbWluOiB0aGlzLm1pblZlcnNpb24sIG1heDogdGhpcy5jdXJyZW50VmVyc2lvbiB9XG4gIH1cblxuICBwdWJsaWMgYXR0YWNoKCBwZTogUHJveGllZDxhbnk+ICkgOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgcGUpXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXRMYXN0Q2hhbmdlcyggcGU6IFByb3hpZWQ8YW55PiApIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghRW50aXR5UHJveHkuaXNEaXJ0eShwZSkpIHJldHVybiB1bmRlZmluZWRcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6IFxuICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkIDogXG4gICAgICAgIHJldHVybiBwZS5fX3RtcENoYW5nZXNfXyFcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb246IG51bWJlciApOiBBcnJheTxNYXA8TW9kZWxBbmRLZXksIEVudGl0eUNoYW5nZXM+PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gbmV3IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICBsZXQgdG1wVmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cblxuICAgIHdoaWxlICggdG1wVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiApIHtcbiAgICAgIGxldCBoaXN0b3J5ID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRtcFZlcnNpb24pXG4gICAgICBoaXN0b3J5ICYmIHJlc3VsdC5wdXNoKGhpc3RvcnkpICAgICAgXG4gICAgICB0bXBWZXJzaW9uLS1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGdldCB0cmFja2luZ0VudGl0aWVzKCkgOiBJdGVyYWJsZTxFbnRpdHk+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnZhbHVlcygpXG4gIH1cblxuICBwdWJsaWMgaXNUcmFja2luZyhzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuaGFzKCB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBrZXkpIClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKTogTWF5YmVVbmRlZmluZWQ8UHJveGllZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHRyYWNraW5nS2V5ID0gdGhpcy5tYWtlTW9kZWxBbmRLZXkoc2NoZW1hLCBrZXkpXG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXModHJhY2tpbmdLZXkpID8gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmdldCh0cmFja2luZ0tleSkgYXMgUHJveGllZDxURW50aXR5PiA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIHRyYWNrTmV3PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkgeyBcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eU5ldyhlbnRpdHksIHNjaGVtYSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZCB7XG4gICAgbGV0IHByb3hpZWQgPSBFbnRpdHlQcm94eS5jb252ZXJ0VG9Qcm94aWVkKGVudGl0eSlcbiAgICBpZiAoIHByb3hpZWQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHByb3hpZWQuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgfSBcbiAgICBlbHNlIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgICAvLyBUT0RPOiDlhYjkv67mlLnlho3liKDpmaTvvIzpnIDopoHmgaLlpI3liLDku4DkuYjnirbmgIHvvJ9cbiAgICAgIHByb3hpZWQuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5EZWxldGVkXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHRyYWNrUGVyc2lzdGVudDxURW50aXR5PihzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IFRFbnRpdHkpOiBURW50aXR5IHtcbiAgICB0aGlzLmVuc3VyZU5vVHJhY2tpbmcoIHNjaGVtYSwgZW50aXR5IClcblxuICAgIGxldCBwcm94aWVkID0gdGhpcy5wcm94eS5wcm94eVBlcnNpc3RlbnQoZW50aXR5LCBzY2hlbWEpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLnNldCh0aGlzLmdldE1vZGVsQW5kS2V5KHByb3hpZWQpLCBwcm94aWVkKVxuICAgIHJldHVybiBwcm94aWVkIGFzIEVudGl0eSBhcyBURW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmRlbGV0ZSh0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIHNjaGVtYS5nZXRLZXkoZW50aXR5KSkpXG4gIH1cblxuICBwdWJsaWMgc3RvcFRyYWNrQWxsKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0VHJhY2tpbmdDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgRW50aXR5UHJveHkuaXNEaXJ0eShwZSkgJiYgXG4gICAgICByZXN1bHQucHVzaCh7IG1vZGVsQW5kS2V5IDogdGhpcy5nZXRNb2RlbEFuZEtleShwZSksIGNoYW5nZXM6IHRoaXMuZ2V0TGFzdENoYW5nZXMocGUpIH0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZGV0ZWN0Q2hhbmdlcygpIDogQXJyYXk8e2VudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8e2VudGl0eTogUHJveGllZDxhbnk+LCBjaGFuZ2VzIDogTWF5YmVVbmRlZmluZWQ8RW50aXR5Q2hhbmdlcz4gfT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgZW50aXR5OiBwZSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSl9KVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhlbnRpdHk6IEVudGl0eSwgZGJWZXJzaW9uOiBudW1iZXIsIGlzTmV3ID0gdHJ1ZSkgOiBFbnRpdHlDaGFuZ2VzIHtcbiAgICBsZXQgcHJvcGVyaXRlc0NoYW5nZSA9IG5ldyBBcnJheTxQcm9wZXJ0eUNoYW5nZT4oKVxuICAgIGZvciAoY29uc3Qga2V5IGluIGVudGl0eSkge1xuICAgICAgaWYgKCFFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGtleSkpIGNvbnRpbnVlXG4gICAgICBwcm9wZXJpdGVzQ2hhbmdlLnB1c2goIGlzTmV3ID8gXG4gICAgICAgIHsgbmFtZToga2V5LCBvcmlnaW5hbDogdW5kZWZpbmVkLCBjdXJyZW50OiBlbnRpdHlba2V5XSB9IDpcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBlbnRpdHlba2V5XSwgY3VycmVudDogIHVuZGVmaW5lZCB9ICAgICAgIFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0eXBlIDogaXNOZXcgPyBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgZGJWZXJzaW9uOiBkYlZlcnNpb24sICAgICAgXG4gICAgICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IHByb3Blcml0ZXNDaGFuZ2VcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgbWFya1N0YXRlQW5kU2F2ZUhpc3Rvcnk8VEVudGl0eT4oIHBlOiBQcm94aWVkPFRFbnRpdHk+LCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IHZvaWQge1xuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE5FVyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgdHJ1ZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgREVMRVRFIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSksIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTU9ESUZJRUQgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGNoYW5nZXMgPSAke0pTT04uc3RyaW5naWZ5KHBlLl9fdG1wQ2hhbmdlc19fKX1gKVxuICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHBlLl9fdG1wQ2hhbmdlc19fISwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgICAgICBicmVha1xuICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmcgXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDogXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFjY2VwdENoYW5nZXMoaGlzdG9yeVZlcnNpb246IG51bWJlcikgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBjb25zdCBzY2hlbWEgPSBwZS5fX3NjaGVtYV9fXG4gICAgICBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5OZXcgfHwgcGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCkgXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpLCBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSApXG4gICAgICBlbHNlIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLkRlbGV0ZWQpXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSlcbiAgICAgIC8vIGVsc2UgJ3RyYW5zaWVudCcgfCAncGVyc2lzdGVudCcgZG8gbm90aGluZ1xuICAgICAgdGhpcy5tYXJrU3RhdGVBbmRTYXZlSGlzdG9yeShwZSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uID0gaGlzdG9yeVZlcnNpb25cbiAgICAgIHBlLl9fZGV0YWNoZWRfXyA9IHRydWVcbiAgICB9KSAgXG4gICAgXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICB0aGlzLm1pblZlcnNpb24gPSB0aGlzLm1pblZlcnNpb24gPT09IC0xID8gaGlzdG9yeVZlcnNpb24gOiB0aGlzLm1pblZlcnNpb25cbiAgICBcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuICB9XG4gIFxuICBwcm90ZWN0ZWQgcm9sbGJhY2tDYWNoZUNoYW5nZXMoIG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBjaGFuZ2VzOiBFbnRpdHlDaGFuZ2VzICk6IHZvaWQge1xuICAgIHN3aXRjaChjaGFuZ2VzLnR5cGUpIHtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KG1vZGVsLCBrZXkpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OlxuICAgICAgICBsZXQgZSA9IHRoaXMuY2FjaGUuZ2V0KCBtb2RlbCwga2V5IClcbiAgICAgICAgaWYgKCBlID09PSB1bmRlZmluZWQgKSByZXR1cm5cbiAgICAgICAgY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IGUhW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGUgKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTogXG4gICAgICAgIGNvbnN0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KCBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjID0+IGMubmFtZSwgYyA9PiBjLm9yaWdpbmFsKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZW50aXR5IClcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVqZWN0Q2hhbmdlcygpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IGZhbHNlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18hLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gcGVbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICAgIHBlLl9fdHJhY2tpbmdfXyA9IHRydWVcbiAgICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlBlcnNpc3RlbnQ6XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OlxuICAgICAgfVxuICAgIH0pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGByZWplY3RDaGFuZ2VzIFZlcnNpb24gPSA/YClcbiAgfVxuICBcbiAgcHVibGljIHJvbGxiYWNrQ2hhbmdlcyggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSA6IHZvaWQgeyAgICBcbiAgICBjb25zdCBmcm9tID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7aGlzdG9yeVZlcnNpb259YClcblxuICAgIHRoaXMucmVqZWN0Q2hhbmdlcygpXG4gICAgd2hpbGUoIGhpc3RvcnlWZXJzaW9uIDw9IHRoaXMuY3VycmVudFZlcnNpb24gKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzTWFwID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgICBjaGFuZ2VzTWFwICYmIGNoYW5nZXNNYXAuZm9yRWFjaCggKCBjaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5ICkgXG4gICAgICAgIHRoaXMucm9sbGJhY2tDYWNoZUNoYW5nZXMobWsubW9kZWwsIG1rLmtleSwgY2hhbmdlcylcbiAgICAgIH0pXG4gICAgICB0aGlzLmN1cnJlbnRWZXJzaW9uIC0tXG4gICAgfVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHBlLl9fZGV0YWNoZWRfXyA9IHRydWUpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLm1pblZlcnNpb24gPSBNYXRoLm1pbih0aGlzLm1pblZlcnNpb24sIHRoaXMuY3VycmVudFZlcnNpb24pXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke3RoaXMuY3VycmVudFZlcnNpb259YClcbiAgfVxuXG4gIHB1YmxpYyBjbGVhckhpc3RvcnkoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkge1xuICAgIGlmICggdGhpcy5taW5WZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uIHx8IHRoaXMuY3VycmVudFZlcnNpb24gPCBoaXN0b3J5VmVyc2lvbiApIHJldHVyblxuICAgIGZvciggbGV0IHZlciA9IHRoaXMubWluVmVyc2lvbjsgdmVyIDwgaGlzdG9yeVZlcnNpb247IHZlcisrICkge1xuICAgICAgdGhpcy5oaXN0b3J5LmRlbGV0ZSh2ZXIpXG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBkdW1wQ2hhbmdlcyggZWM6IEVudGl0eUNoYW5nZXMgKTogc3RyaW5nIHtcbiAgICBsZXQgcHJvcGVydHlDaGFuZ2VzID0gJydcbiAgICBlYy5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKHBjID0+IHByb3BlcnR5Q2hhbmdlcyArPSBgJHtwYy5uYW1lfTogJHtwYy5vcmlnaW5hbH0gLT4gJHtwYy5jdXJyZW50fSwgYClcblxuICAgIHJldHVybiBgZGJWZXJzaW9uPSR7ZWMuZGJWZXJzaW9ufSwgdHlwZT0ke2VjLnR5cGV9LCBbJHtwcm9wZXJ0eUNoYW5nZXN9XWBcbiAgfVxuXG4gIHB1YmxpYyBkdW1wSGlzdG9yeSgpIDogc3RyaW5nIHtcbiAgICBsZXQgdmVyc2lvbiA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICBsZXQgcmVzdWx0ID0gYC0tLS0tLS0tLS0tLS0tICBEVU1QIEhJU1RPUlkgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHdoaWxlKCB2ZXJzaW9uID49IHRoaXMubWluVmVyc2lvbiApIHtcbiAgICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS12ZXJzaW9uICR7dmVyc2lvbn0tLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICAgIGxldCBoaXMgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24oIHZlcnNpb24gKVxuICAgICAgaGlzICYmIGhpcy5mb3JFYWNoKCAoIGVjLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmR1bXBDaGFuZ2VzKCBlYyApXG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICAgIGNvbnN0IG1zZyA9IGB0eXBlPSR7bWsubW9kZWx9LCBrZXk9JHttay5rZXl9LCBjaGFuZ2VzPXske2NoYW5nZXN9fSBcXG5gXG4gICAgICAgIHJlc3VsdCArPSBtc2dcbiAgICAgIH0pXG4gICAgICByZXN1bHQgKz0gJ1xcbidcbiAgICAgIHZlcnNpb24tLVxuICAgIH0gICAgXG4gICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLSAgIEVORCAgIERVTVAgIC0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgIHJldHVybiByZXN1bHRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJhY2tlclNxbEJ1aWxkZXIge1xuICBwcml2YXRlIHRyYWNrZXI6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgbW9kZWxzOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT5cbiAgcHJpdmF0ZSBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCB0cmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXIsIG1vZGVscyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPiwgc3FsQnVpbGRlcjogU3FsQnVpbGRlciApIHtcbiAgICB0aGlzLnRyYWNrZXIgPSB0cmFja2VyXG4gICAgdGhpcy5tb2RlbHMgPSBtb2RlbHNcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBzcWxCdWlsZGVyXG4gIH1cbiAgXG4gIHB1YmxpYyBnZXQgZW50aXR5VHJhY2tlcigpIHsgcmV0dXJuIHRoaXMudHJhY2tlciB9XG5cbiAgcHVibGljIGJ1aWxkQ2hhbmdlU3FscygpIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4oKVxuICAgIHRoaXMudHJhY2tlci5kZXRlY3RDaGFuZ2VzKCkuZm9yRWFjaCggZWMgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKGVjLmVudGl0eSkgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIGJ1aWxkU3FsQW5kUGFyYW1ldGVycyhwZSA6UHJveGllZDxhbnk+KSA6IFNxbEFuZFBhcmFtZXRlcnMgeyAgXG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXcgOlxuICAgICAgICBjb25zdCBuZXdFbnRpdHkgPSBPYmplY3QuYXNzaWduKHsgX3ZlcnNpb25fIDogcGUuX3ZlcnNpb25fIH0sICBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSApXG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoIHBlLl9fc2NoZW1hX18sIG5ld0VudGl0eSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBsZXQgZW50aXR5Q2hhbmdlcyA9IHRoaXMudHJhY2tlci5nZXRMYXN0Q2hhbmdlcyhwZSkhXG4gICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoIGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMgLCBjPT4gYy5uYW1lLCBjPT4gYy5jdXJyZW50IClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uIC0gMSApXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVudGl0eSBzdGF0ZSAnJHtwZS5fX3N0YXRlX199J2ApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb24gKS5mb3JFYWNoKCBoaXMgPT4gaGlzLmZvckVhY2goICggZW50aXR5Q2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICBjb25zdCBtayA9IHRoaXMudHJhY2tlci5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobWsubW9kZWwpXG4gICAgICBzd2l0Y2goZW50aXR5Q2hhbmdlcy50eXBlKSB7XG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXc6XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHNjaGVtYSEsIG1rLmtleSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTogXG4gICAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUoc2NoZW1hISwgbWsua2V5LCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiApKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6XG4gICAgICAgICAgbGV0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydChzY2hlbWEhLCBlbnRpdHkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSkpXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbn1cblxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmV0dGVyLXNxbGl0ZTNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbmdlLWNhc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb24tc3FsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXNlY29uZGFyeVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zdWJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJscnUtY2FjaGVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9