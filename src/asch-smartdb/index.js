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
                throw new Error(`Invalid last block height '${height}'`);
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
        this.parseFields();
    }
    convertType(type) {
        return type === FieldTypes.String || type === FieldTypes.Text ?
            'String' :
            'Number';
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
const Model_1 = __webpack_require__(/*! ../Model */ "./src/Model.ts");
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
        // database do not support composite key   
        // if ( schema.isCompsiteKey ) { 
        //   schemaObject.tableFields.forEach( f => f.primary_key = false )
        // }
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
                yield session.syncSchema(schema);
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
            const toHeight = height || this.lastBlockHeight;
            this.log.traceEnabled && this.log.trace(`BEGIN rollbackBlock ( height : ${fromHeight} -> ${toHeight} )`);
            // for hook
            this.preRollbackBlock(fromHeight, toHeight);
            try {
                const ver = this.blockSession.historyVersion;
                if (fromHeight < ver.min) { // load history from leveldb, if cached history less than rollback height 
                    let history = yield this.blockDB.getHistoryChanges(fromHeight, ver.min - 1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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TUFBTTtJQUNmLENBQUM7Q0FFRjtBQTdERCw4Q0E2REM7Ozs7Ozs7Ozs7OztBQ3piRCwyQzs7Ozs7Ozs7Ozs7QUNBQSx3Qzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxxQzs7Ozs7Ozs7Ozs7QUNBQSxrQzs7Ozs7Ozs7Ozs7QUNBQSw0Qzs7Ozs7Ozs7Ozs7QUNBQSwyQzs7Ozs7Ozs7Ozs7QUNBQSxzQzs7Ozs7Ozs7Ozs7QUNBQSxpQyIsImZpbGUiOiJhc2NoLXNtYXJ0ZGIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIHdhc20gbW9kdWxlc1xuIFx0dmFyIGluc3RhbGxlZFdhc21Nb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBvYmplY3Qgd2l0aCBhbGwgY29tcGlsZWQgV2ViQXNzZW1ibHkuTW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy53ID0ge307XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL0luZGV4LnRzXCIpO1xuIiwiaW1wb3J0IHsgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IEJsb2NrIH0gZnJvbSAnLi9CbG9jaydcblxuZXhwb3J0IGNsYXNzIEJsb2NrQ2FjaGUge1xuICBwcml2YXRlIGNhY2hlID0gbmV3IE1hcDxudW1iZXIsIEJsb2NrPigpXG4gIHByaXZhdGUgbWluSGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhIZWlnaHQgOiBudW1iZXIgPSAtMVxuICBwcml2YXRlIG1heENhY2hlZENvdW50IDogbnVtYmVyXG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBtYXhDYWNoZWRDb3VudCA6IG51bWJlciApIHtcbiAgICB0aGlzLm1heENhY2hlZENvdW50ID0gbWF4Q2FjaGVkQ291bnRcbiAgfVxuXG4gIHB1YmxpYyBpc0NhY2hlZCggaGVpZ2h0OiBudW1iZXIgKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBoZWlnaHQgPiAwICYmIGhlaWdodCA+PSB0aGlzLm1pbkhlaWdodCAmJiBoZWlnaHQgPD0gdGhpcy5tYXhIZWlnaHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY2FjaGVkSGVpZ2h0UmFuZ2UoKSA6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB7IG1pbiA6IHRoaXMubWluSGVpZ2h0LCBtYXg6IHRoaXMubWF4SGVpZ2h0IH1cbiAgfVxuXG4gIHB1YmxpYyBwdXQoIGJsb2NrOiBCbG9jayApIHtcbiAgICBpZiAoICF0aGlzLmlzQ2FjaGVkKCBibG9jay5oZWlnaHQgKSAmJiB0aGlzLm1heEhlaWdodCA+PSAwICYmIGJsb2NrLmhlaWdodCAhPT0gdGhpcy5tYXhIZWlnaHQgKyAxIClcbiAgICAgIHRocm93IG5ldyBFcnJvciAoJ2ludmFsaWQgYmxvY2sgaGVpZ2h0JylcblxuICAgIHRoaXMuY2FjaGUuc2V0KCBibG9jay5oZWlnaHQsIGJsb2NrIClcbiAgICB0aGlzLm1heEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICAgIFxuICAgIGlmICggdGhpcy5jYWNoZS5zaXplID49IHRoaXMubWF4Q2FjaGVkQ291bnQgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZSggdGhpcy5taW5IZWlnaHQrKyApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGdldCggaGVpZ2h0OiBudW1iZXIgKSA6IE1heWJlVW5kZWZpbmVkPEJsb2NrPiB7XG4gICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KGhlaWdodClcbiAgfVxuXG4gIHB1YmxpYyBnZXRCeUlkKCBpZDogc3RyaW5nICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIGZvciggY29uc3QgYiBvZiB0aGlzLmNhY2hlLnZhbHVlcygpICkge1xuICAgICAgaWYgKCBiLmlkISA9PT0gaWQgKSByZXR1cm4gYlxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgZXZpdCggZnJvbUhlaWdodDogbnVtYmVyLCB0b0hlaWdodDogbnVtYmVyICkge1xuICAgIGxldCBtaW4gPSBNYXRoLm1pbiggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGxldCBtYXggPSBNYXRoLm1heCggZnJvbUhlaWdodCwgdG9IZWlnaHQgKVxuICAgIGlmICggbWluID4gdGhpcy5tYXhIZWlnaHQgfHwgbWF4IDwgdGhpcy5taW5IZWlnaHQgKSByZXR1cm4gXG4gICAgXG4gICAgbWluID0gTWF0aC5tYXgoIG1pbiwgdGhpcy5taW5IZWlnaHQgKVxuICAgIG1heCA9IE1hdGgubWluKCBtYXgsIHRoaXMubWluSGVpZ2h0IClcbiAgICBmb3IgKCBsZXQgaGVpZ2h0ID0gbWluOyBoZWlnaHQgPD0gbWF4OyBoZWlnaHQrKyApIHtcbiAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGhlaWdodClcbiAgICB9XG4gIH1cbn0iLCJpbXBvcnQgeyBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIgfSBmcm9tICd1dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBPYmplY3RMaXRlcmFsIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5leHBvcnQgdHlwZSBKc29uT2JqZWN0ID0gT2JqZWN0TGl0ZXJhbFxuZXhwb3J0IHR5cGUgRW50aXR5ID0gT2JqZWN0TGl0ZXJhbFxuXG5leHBvcnQgaW50ZXJmYWNlIEtleU9iamVjdCB7IFxuICBrZXkgOiBzdHJpbmdcbiAga2V5SnNvbiA6IEpzb25PYmplY3Rcbn1cbmV4cG9ydCB0eXBlIEVudGl0eUtleSA9IHN0cmluZyB8IG51bWJlciB8IEtleU9iamVjdFxuXG5leHBvcnQgdHlwZSBQYXJ0aWFsPFQ+ID0ge1xuICBbUCBpbiBrZXlvZiBUXT86IFRbUF1cbn1cblxuZXhwb3J0IHR5cGUgUmVhZG9ubHlQYXJ0aWFsPFQ+ID0ge1xuICByZWFkb25seSBbUCBpbiBrZXlvZiBUXTogVFtQXTtcbn1cblxuZXhwb3J0IHR5cGUgRmlsdGVyRnVuY3Rpb248VD4gPSAoIGUgOiBUICkgPT4gYm9vbGVhblxuXG5leHBvcnQgdHlwZSBLZXlWYWx1ZVBhaXIgPSB7IGtleTogc3RyaW5nLCB2YWx1ZTogYW55IH1cbmV4cG9ydCB0eXBlIENhbGxiYWNrPFRSZXN1bHQ+ID0gKCBlcnI6IEVycm9yfG51bGwsIGRhdGE6IFRSZXN1bHQgKSA9PiB2b2lkXG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlSnNvbk9iamVjdDxUPihpdGVyYWJsZTogSXRlcmFibGU8VD4sIGdldEtleTogKHQgOiBUKSA9PiBzdHJpbmcsIGdldFZhbHVlOiAodDogVCkgPT4gYW55ICApIDogSnNvbk9iamVjdCB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2l0ZXJhYmxlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGl0ZXJhYmxlICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldEtleScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBnZXRLZXkgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAnZ2V0VmFsdWUnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0VmFsdWUgKSlcblxuICBsZXQgcmV0ID0ge31cbiAgZm9yIChsZXQgaXRlbSBvZiBpdGVyYWJsZSkge1xuICAgIHJldFtnZXRLZXkoaXRlbSldID0gZ2V0VmFsdWUoaXRlbSlcbiAgfVxuICByZXR1cm4gcmV0IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVlcENvcHk8VD4oc3JjIDogVCkgOiBUIHtcbiAgaWYgKCAhc3JjICkgcmV0dXJuIHNyY1xuICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzcmMpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFydGlhbDxUPiggc3JjIDogVCwgLi4ua2V5cyA6IEFycmF5PHN0cmluZz4gKTogUGFydGlhbDxUPiB7XG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ3NyYycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBzcmMgKSlcbiAgQ29kZUNvbnRyYWN0LmFyZ3VtZW50KCAna2V5cycsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBrZXlzICkpXG5cbiAgbGV0IHJlc3VsdCA9ICB7IH1cbiAgZm9yICggbGV0IGsgb2YgWy4uLmtleXNdICkgcmVzdWx0W2tdID0gc3JjW2tdXG4gIHJldHVybiByZXN1bHQgYXMgUGFydGlhbDxUPlxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmltaXRpdmVLZXkoIGtleSA6IGFueSApIDogYm9vbGVhbiB7XG4gIGlmICggIWtleSApIHJldHVybiBmYWxzZVxuICByZXR1cm4gaXNTdHJpbmcoIGtleSApIHx8IGlzTnVtYmVyKCBrZXkgKVxufVxuXG5leHBvcnQgY2xhc3MgQ29kZUNvbnRyYWN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKCBtZXNzYWdlIDogc3RyaW5nICkge1xuICAgIHN1cGVyKCAnQ29kZSBjb250cmFjdCBFcnJvciwnKyBtZXNzYWdlIClcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBDb250cmFjdENvbmRpdGlvbiA9IGJvb2xlYW4gfCAoICgpID0+IGJvb2xlYW4gKVxuZXhwb3J0IHR5cGUgQ29udHJhY3RNZXNzYWdlICAgPSBzdHJpbmcgIHwgKCAoKSA9PiBzdHJpbmcgKVxuXG5leHBvcnQgdHlwZSBNYXliZVVuZGVmaW5lZDxUPiA9IFQgfCB1bmRlZmluZWRcbmV4cG9ydCB0eXBlIE51bGxhYmxlPFQ+ID0gVCB8IG51bGwgfCB1bmRlZmluZWRcblxuZXhwb3J0IHR5cGUgQ29udHJhY3RWZXJpZnlSZXN1bHQgPSB7IHJlc3VsdCA6IGJvb2xlYW4sIG1lc3NhZ2U6IE51bGxhYmxlPHN0cmluZz4gfSBcbmV4cG9ydCB0eXBlIFZlcmlmeUZ1bmN0aW9uID0gKCkgPT4gQ29udHJhY3RWZXJpZnlSZXN1bHRcblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdCB7XG4gIHB1YmxpYyBzdGF0aWMgdmVyaWZ5KCBjb25kaXRpb246IENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlIDogQ29udHJhY3RNZXNzYWdlICkgOiB2b2lkIHtcbiAgICBpZiAoIGNvbmRpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IGNvbmRpdGlvbiA9PT0gbnVsbCApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB2ZXJpZnkgY29uZGl0aW9uJylcblxuICAgIGNvbnN0IGNvbmQgPSBpc0Z1bmN0aW9uKGNvbmRpdGlvbikgPyAoY29uZGl0aW9uIGFzIEZ1bmN0aW9uKSgpIDogY29uZGl0aW9uXG4gICAgY29uc3QgbXNnID0gaXNGdW5jdGlvbihtZXNzYWdlKSA/IChtZXNzYWdlIGFzIEZ1bmN0aW9uKSgpIDogbWVzc2FnZVxuXG4gICAgaWYgKCFjb25kKSB0aHJvdyBuZXcgQ29kZUNvbnRyYWN0RXJyb3IoIG1zZyApXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFyZ3VtZW50KCBhcmdOYW1lOiBzdHJpbmcsIHZlcmlmeTogVmVyaWZ5RnVuY3Rpb24gfCBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZT8gOiBDb250cmFjdE1lc3NhZ2UgKTogdm9pZCB7XG4gICAgaWYgKCAhYXJnTmFtZSB8fCAhdmVyaWZ5ICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FyZ05hbWUgb3IgdmVyaWZ5IGNhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCcpXG5cbiAgICBpZiAoICFtZXNzYWdlICkge1xuICAgICAgY29uc3QgdnIgPSAgKHZlcmlmeSBhcyBWZXJpZnlGdW5jdGlvbikoKVxuICAgICAgQ29kZUNvbnRyYWN0LnZlcmlmeSggdnIucmVzdWx0LCBgYXJndW1lbnQgJyR7YXJnTmFtZX0nICR7dnIubWVzc2FnZX1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgQ29kZUNvbnRyYWN0LnZlcmlmeSh2ZXJpZnkgYXMgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2UhKSAgICBcbiAgfVxuXG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsKCBhcmcgOiBhbnkgKTogQ29udHJhY3RWZXJpZnlSZXN1bHQge1xuICAgIGNvbnN0IHJlc3VsdCA9ICBhcmcgIT09IG51bGwgJiYgYXJnICE9PSB1bmRlZmluZWRcbiAgICBjb25zdCBtZXNzYWdlID0gcmVzdWx0ID8gdW5kZWZpbmVkIDogJ2Nhbm5vdCBiZSBudWxsIG9yIHVuZGVmaW5lZCdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBub3ROdWxsT3JFbXB0eSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGwoc3RyKSAmJiBzdHIgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3IgZW1wdHknXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yV2hpdGVzcGFjZSggc3RyOiBOdWxsYWJsZTxzdHJpbmc+ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgQ29kZUNvbnRyYWN0Lm5vdE51bGxPckVtcHR5KCBzdHIgKSAmJiAoIHN0ciBhcyBzdHJpbmcgKS50cmltKCkgIT09ICcnXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQgb3Igd2hpdGVzcGFjZSdcblxuICAgIHJldHVybiB7IHJlc3VsdCAsIG1lc3NhZ2UgfVxuICB9XG5cbn1cblxuXG4iLCJpbXBvcnQgeyBFbnRpdHlDYWNoZSwgTFJVRW50aXR5Q2FjaGUsIEVudGl0eUNhY2hlT3B0aW9ucyB9IGZyb20gJy4vRW50aXR5Q2FjaGUnXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciB9IGZyb20gJy4vTW9kZWwnO1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uIH0gZnJvbSAnLi9TUUxEQi9EYkNvbm5lY3Rpb24nXG5pbXBvcnQgeyBKc29uU3FsQnVpbGRlciwgU3FsQ29uZGl0aW9uLCBTcWxSZXN1bHRSYW5nZSwgU3FsT3JkZXIsIE1VTFRJX1NRTF9TRVBBUkFUT1IgfSBmcm9tICcuL1NRTERCL1NxbEJ1aWxkZXInXG5pbXBvcnQgeyBFbnRpdHksIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEZpbHRlckZ1bmN0aW9uIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBQcm94aWVkRW50aXR5VHJhY2tlciwgVHJhY2tlclNxbEJ1aWxkZXIsIEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXMsIEVudGl0eUV4dGVuc2lvbiB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc0FycmF5IH0gZnJvbSAndXRpbCdcblxuZXhwb3J0IHR5cGUgU2F2ZUhpc3RvcnlBY3Rpb24gPSAoIHZlcnNpb246IG51bWJlciwgaGlzdG9yeTogTWFwPHN0cmluZywgRW50aXR5Q2hhbmdlcz4gKSA9PiB2b2lkXG5cbmV4cG9ydCBjbGFzcyBEYlNlc3Npb24ge1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNvbm5lY3Rpb246IERiQ29ubmVjdGlvblxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc2Vzc2lvbkNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBzcWxCdWlsZGVyIDogSnNvblNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSB0cmFja2VyU3FsQnVpbGRlcjogVHJhY2tlclNxbEJ1aWxkZXJcbiAgcHJpdmF0ZSBlbnRpdHlUcmFja2VyIDogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBzZXNzaW9uU2VyaWFsIDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbjogRGJDb25uZWN0aW9uLCBjYWNoZU9wdGlvbnM/OiBFbnRpdHlDYWNoZU9wdGlvbnMsIHNlc3Npb25OYW1lPzogc3RyaW5nKSB7XG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlciggRGJTZXNzaW9uLm5hbWUgKyAoIHNlc3Npb25OYW1lID09PSB1bmRlZmluZWQgPyAnJyA6IGBfJHtzZXNzaW9uTmFtZX1gKSAgKVxuICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IC0xXG4gICAgdGhpcy5jb25uZWN0aW9uID0gY29ubmVjdGlvblxuICAgIHRoaXMubW9kZWxzID0gbmV3IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPigpXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUgPSBuZXcgTFJVRW50aXR5Q2FjaGUoY2FjaGVPcHRpb25zKVxuICAgIHRoaXMuc3FsQnVpbGRlciA9IG5ldyBKc29uU3FsQnVpbGRlcigpXG4gICAgdGhpcy5lbnRpdHlUcmFja2VyID0gbmV3IFByb3hpZWRFbnRpdHlUcmFja2VyKCB0aGlzLnNlc3Npb25DYWNoZSApXG4gICAgdGhpcy50cmFja2VyU3FsQnVpbGRlciA9IG5ldyBUcmFja2VyU3FsQnVpbGRlciggdGhpcy5lbnRpdHlUcmFja2VyLCB0aGlzLm1vZGVscywgdGhpcy5zcWxCdWlsZGVyIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNPcGVuKCkge1xuICAgIHJldHVybiB0aGlzLmNvbm5lY3Rpb24gJiYgdGhpcy5jb25uZWN0aW9uLmlzQ29ubmVjdGVkXG4gIH1cblxuICBwdWJsaWMgZ2V0IGVudGl0eUNhY2hlKCk6IEVudGl0eUNhY2hlIHtcbiAgICByZXR1cm4gdGhpcy5zZXNzaW9uQ2FjaGVcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzeW5jU2NoZW1hKHNjaGVtYTogTW9kZWxTY2hlbWEpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTY2hlbWEoc2NoZW1hKVxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5ydW5TY3JpcHQoc3FsKVxuICB9XG5cbiAgcHVibGljIHJlZ2lzdGVyU2NoZW1hKC4uLnNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogdm9pZCB7XG4gICAgc2NoZW1hcy5mb3JFYWNoKCBzID0+IHRoaXMubW9kZWxzLnNldChzLm1vZGVsTmFtZSwgcykgKVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWU6IHN0cmluZykgOiBNb2RlbFNjaGVtYSB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5tb2RlbHMuZ2V0KG1vZGVsTmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hQnlDbGFzczxURW50aXR5PihjbGF6ejogQ29uc3RydWN0b3I8VEVudGl0eT4pIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChjbGF6ei5uYW1lKVxuICAgIGlmICggIXNjaGVtYSApIHRocm93IG5ldyBFcnJvcihgdW5yZWdpc3RlcmVkIG1vZGVsICggbmFtZSA9ICcke2NsYXp6Lm5hbWV9JyApYClcbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0U2NoZW1hPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ICkge1xuICAgIHJldHVybiB0eXBlb2YgbW9kZWwgPT09ICdzdHJpbmcnID8gXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbCkgOiBcbiAgICAgIHRoaXMuZ2V0U2NoZW1hQnlDbGFzcyhtb2RlbClcbiAgfVxuXG4gIHByb3RlY3RlZCBtYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpIDogSnNvbk9iamVjdCB7XG4gICAgcmV0dXJuIHNjaGVtYS5zZXRLZXkoIHt9LCBrZXkgKVxuICB9XG5cbiAgcHJvdGVjdGVkIHRyYWNrUGVyc2lzdGVudEVudGl0aWVzPFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCAgZW50aXRpZXMgOiBBcnJheTxURW50aXR5PiwgY2FjaGUgPSB0cnVlICkgOiBBcnJheTxURW50aXR5PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGUpIClcbiAgICAgIGNhY2hlICYmIHRoaXMuZW50aXR5Q2FjaGUucHV0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KGUpICwgZSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVzZXQoY2xlYXJDYWNoZTogYm9vbGVhbiA9IGZhbHNlKSA6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5zdG9wVHJhY2tBbGwoKVxuICAgIGlmICggY2xlYXJDYWNoZSApIHRoaXMuZW50aXR5Q2FjaGUuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLnJlc2V0KCB0cnVlIClcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZGlzY29ubmVjdCgpXG4gIH1cblxuICBwdWJsaWMgYXR0YWNoSGlzdG9yeSggaGlzdG9yeTogTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+Pik6IHZvaWQge1xuICAgIHRoaXMuZW50aXR5VHJhY2tlci5hdHRhY2hIaXN0b3J5KCBoaXN0b3J5IClcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGxDYWNoZWQ8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lLCBmaWx0ZXIgKSB8fCBbXVxuXG4gICAgcmV0dXJuIHRyYWNrID8gdGhpcy50cmFja1BlcnNpc3RlbnRFbnRpdGllcyggc2NoZW1hLCBlbnRpdGllcywgZmFsc2UgKSA6IGVudGl0aWVzIFxuICB9XG5cbiAgcHVibGljIGF0dGFjaDxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBsZXQgdHJhY2tlZCA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eTxURW50aXR5Piggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggdHJhY2tlZCAhPT0gdW5kZWZpbmVkICkgcmV0dXJuIHRyYWNrZWQgYXMgT2JqZWN0IGFzIFRFbnRpdHlcblxuICAgIGxldCBjYWNoZWQgPSB0aGlzLmVudGl0eUNhY2hlLmdldDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwga2V5IClcbiAgICByZXR1cm4gKCBjYWNoZWQgPT09IHVuZGVmaW5lZCApID8gdW5kZWZpbmVkIDogXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KCBzY2hlbWEsIGNhY2hlZCApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0QWxsPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG5cbiAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgJiYgdGhpcy5lbnRpdHlDYWNoZS5leGlzdHNNb2RlbChzY2hlbWEubW9kZWxOYW1lKSApIHtcbiAgICAgIGxldCBlbnRpdGllcyA9IHRoaXMuZW50aXR5Q2FjaGUuZ2V0QWxsPFRFbnRpdHk+KCBzY2hlbWEubW9kZWxOYW1lICkgfHwgW11cbiAgICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0TWFueSggbW9kZWwsIHsgfSwgdHJhY2sgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSwgY2FjaGUgPSB0cnVlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbilcbiAgICBcbiAgICBsZXQgZW50aXRpZXMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIGNhY2hlICkgZW50aXRpZXMuZm9yRWFjaCggZSA9PiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShlKSwgZSApKVxuXG4gICAgcmV0dXJuICF0cmFjayA/IGVudGl0aWVzIDpcbiAgICAgIHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeTxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24sIHJlc3VsdFJhbmdlPyA6IFNxbFJlc3VsdFJhbmdlLCBzb3J0PyA6IFNxbE9yZGVyLCBmaWVsZHM/OiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBzY2hlbWEuZmllbGROYW1lcywgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgam9pbilcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnlCeUpzb248VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHBhcmFtcylcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhpc3RzPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsIClcblxuICAgIGxldCB7IHF1ZXJ5ICwgcGFyYW1ldGVyc30gPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3QoIHNjaGVtYSwgW10gLCBjb25kaXRpb24gKSBcbiAgICBxdWVyeSA9IGBzZWxlY3QgZXhpc3RzKCR7cXVlcnkucmVwbGFjZShNVUxUSV9TUUxfU0VQQVJBVE9SLCAnJyl9KSBhcyBleGlzdGBcbiAgICBjb25zdCByZXQgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoIHF1ZXJ5LCBwYXJhbWV0ZXJzIClcbiAgICBcbiAgICByZXR1cm4gaXNBcnJheShyZXQpICYmIHBhcnNlSW50KHJldFswXVsnZXhpc3QnXSkgPiAwIFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNvdW50PFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBsZXQgcmV0ID0gYXdhaXQgdGhpcy5xdWVyeUJ5SnNvbiggbW9kZWwsIHsgZmllbGRzIDogJ2NvdW50KCopIGFzIGNvdW50JywgY29uZGl0aW9uOiBjb25kaXRpb24gfSApXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSA/IHBhcnNlSW50KHJldFswXVsnY291bnQnXSkgOiAwIFxuICB9XG5cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgIGtleTogRW50aXR5S2V5LCBlbnRpdHk/IDogVEVudGl0eSkgOiBURW50aXR5IHsgICAgXG4gICAgaWYgKCAha2V5ICkgdGhyb3cgbmV3IEVycm9yKCdlbnRpdHkga2V5IGNhbiBub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgbGV0IHRoZUVudGl0eSA9IHNjaGVtYS5uZXdFbnRpdHkoIG1vZGVsLCBrZXkgKVxuICAgIGVudGl0eSAmJiBzY2hlbWEuY29weVByb3BlcnRpZXMoIHRoZUVudGl0eSwgZW50aXR5IClcblxuICAgIGxldCBleGlzdHMgPSB0aGlzLnNlc3Npb25DYWNoZS5leGlzdHMoc2NoZW1hLm1vZGVsTmFtZSwga2V5KSB8fCB0aGlzLmVudGl0eVRyYWNrZXIuaXNUcmFja2luZyhzY2hlbWEsIGtleSlcbiAgICBpZiAoIGV4aXN0cyApIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGV4aXN0cyBhbHJlYWR5ICggbW9kZWwgPSAnJHtzY2hlbWEubW9kZWxOYW1lfScga2V5ID0gJyR7a2V5fScgKSBgKVxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja05ldyhzY2hlbWEsIHRoZUVudGl0eSkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGxvYWRFbnRpdHlCeUtleShtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKVxuICAgIGNvbnN0IHdoZXJlID0gdGhpcy5tYWtlQnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIHdoZXJlKVxuXG4gICAgY29uc3Qgcm93cyA9IGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICAgIGlmICggcm93cy5sZW5ndGggPiAxICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkga2V5IGlzIGR1cGxpY2F0ZWQgKCBtb2RlbCA9ICcke21vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nIClgIClcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cy5sZW5ndGggPT09IDEgPyByb3dzWzBdIDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgbG9hZDxURW50aXR5Pihtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkpIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIGNvbnN0IGNhY2hlZCA9IHRoaXMubG9hZENhY2hlZCggbW9kZWwsIGtleSwgdHJ1ZSApXG4gICAgaWYgKCBjYWNoZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiBjYWNoZWRcbiAgXG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKCBtb2RlbE5hbWUgKSFcblxuICAgIGxldCB0cmFja2VkID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCB0cmFja2VkICkgcmV0dXJuIHRyYWNrZWQhIGFzIE9iamVjdCBhcyBURW50aXR5XG4gICAgXG4gICAgY29uc3QgZW50aXR5ID0gYXdhaXQgdGhpcy5sb2FkRW50aXR5QnlLZXkoIG1vZGVsTmFtZSwga2V5IClcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIFxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlLnB1dCggbW9kZWxOYW1lLCBrZXksIGVudGl0eSApXG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQodGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lKSwgZW50aXR5KSBhcyBURW50aXR5ICBcbiAgfVxuXG4gIHB1YmxpYyBnZXRDaGFuZ2VzKCkgOiBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdDaGFuZ2VzKClcbiAgfVxuXG4gIHB1YmxpYyBsb2FkQ2FjaGVkPFRFbnRpdHk+KG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpXG5cbiAgICBjb25zdCBwZSA9IHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0VudGl0eSggc2NoZW1hLCBrZXkgKVxuICAgIGlmICggcGUgJiYgdHJhY2sgKSByZXR1cm4gcGUgYXMgRW50aXR5IGFzIFRFbnRpdHlcblxuICAgIGNvbnN0IGVudGl0eSA9IHRoaXMuc2Vzc2lvbkNhY2hlLmdldDxURW50aXR5Pihtb2RlbE5hbWUsIGtleSlcbiAgICBpZiAoIGVudGl0eSA9PT0gdW5kZWZpbmVkIHx8ICEgdHJhY2sgKSByZXR1cm4gZW50aXR5XG5cbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudChzY2hlbWEsIGVudGl0eSkgYXMgVEVudGl0eSBcbiAgfVxuXG4gIC8qKlxuICAgKiBTYXZlIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3Igc2F2ZUNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlQ2hhbmdlcyhzZXJpYWw/IDogbnVtYmVyKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgcmV0U2VyaWFsID0gc2VyaWFsIHx8ICsrdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICBcbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZENoYW5nZVNxbHMoKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKCBzcWxzIClcbiAgICAgIGF3YWl0IHRyYW5zLmNvbW1pdCgpXG4gICAgICBcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5hY2NlcHRDaGFuZ2VzKCByZXRTZXJpYWwgKSBcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHJldFNlcmlhbFxuXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWApXG4gICAgICByZXR1cm4gcmV0U2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucmVqZWN0Q2hhbmdlcygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUm9sbGJhY2sgc2F2ZWQgY2hhbmdlc1xuICAgKiBAcGFyYW0gY2hhbmdlc05PICx0aGlzIHZhbHVlIHNob3VsZCBiZSByZXR1cm5lZCBieSBAc2VlIHNhdmVDaGFuZ2VzKCkgXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tDaGFuZ2VzKCBzZXJpYWw6IG51bWJlciApOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmKCB0aGlzLnNlc3Npb25TZXJpYWwgPD0gc2VyaWFsICkgcmV0dXJuIHRoaXMuc2Vzc2lvblNlcmlhbFxuXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuc2Vzc2lvblNlcmlhbFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gcm9sbGJhY2tDaGFuZ2VzICggc2VyaWFsID0gJHtzZXJpYWx9IClgKVxuXG4gICAgY29uc3Qgc3FscyA9IHRoaXMudHJhY2tlclNxbEJ1aWxkZXIuYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoc2VyaWFsKVxuICAgIGNvbnN0IHRyYW5zID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICAgIHRyeSB7ICAgICAgXG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uZXhlY3V0ZUJhdGNoKHNxbHMpIFxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcblxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSBzZXJpYWwgLSAxXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgKHNlcmlhbCA6ICR7ZnJvbX0gLT4gJHt0aGlzLnNlc3Npb25TZXJpYWx9KWApXG4gICAgICByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgfVxuICAgIGNhdGNoKGVycikge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYCwgZXJyKVxuICAgICAgYXdhaXQgdHJhbnMucm9sbGJhY2soKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeUJlZm9yZSggc2VyaWFsOiBudW1iZXIgKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5jbGVhckhpc3RvcnkoIHNlcmlhbCApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCk6IHsgbWluOiBudW1iZXIsIG1heDogbnVtYmVyIH0ge1xuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIuaGlzdG9yeVZlcnNpb25cbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGU8VEVudGl0eT4oZW50aXR5OiBURW50aXR5KSA6IHZvaWQge1xuICAgIC8vIGRvIG5vdGhpbmcgLlxuICB9XG5cbiAgcHVibGljIGRlbGV0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrRGVsZXRlKChlbnRpdHkgYXMgT2JqZWN0IGFzIEVudGl0eUV4dGVuc2lvbikuX19zY2hlbWFfXywgIGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiZWdpblRyYW5zYWN0aW9uKCkgOiBQcm9taXNlPERCVHJhbnNhY3Rpb24+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb25uZWN0aW9uLmJlZ2luVHJhbnMoKVxuICB9ICBcblxufSIsImltcG9ydCAqIGFzIExSVSBmcm9tICdscnUtY2FjaGUnXG5pbXBvcnQgeyBFbnRpdHksIE1heWJlVW5kZWZpbmVkLCBFbnRpdHlLZXksIEtleU9iamVjdCwgRmlsdGVyRnVuY3Rpb24sIGlzUHJpbWl0aXZlS2V5IH0gZnJvbSAnLi9Db21tb24nO1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBpc051bWJlciwgaXNGdW5jdGlvbiwgaXNTdHJpbmcgfSBmcm9tICd1dGlsJztcblxuLyoqXG4gKiBjYWNoZSBvcHRpb25zXG4gKi9cbmV4cG9ydCB0eXBlIEVudGl0eUNhY2hlT3B0aW9ucyA9IHsgXG4gIGRlZmF1bHQgOiBudW1iZXIsXG4gIFttb2RlbDogc3RyaW5nXTogIG51bWJlciB8ICggKCBtb2RlbDogc3RyaW5nICkgPT4gbnVtYmVyIClcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDYWNoZSB7XG4gIG1vZGVscyA6IEFycmF5PHN0cmluZz5cbiAgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkXG4gIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgZ2V0QWxsPFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4pIDogTWF5YmVVbmRlZmluZWQ8QXJyYXk8VEVudGl0eT4+XG4gIHB1dChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXksICBlbnRpdHk6IEVudGl0eSkgOiB2b2lkXG4gIGV2aXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IHZvaWRcbiAgZXhpc3RzKG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBib29sZWFuICBcbiAgZXhpc3RzTW9kZWwobW9kZWxOYW1lOiBzdHJpbmcpIDogYm9vbGVhblxufVxuXG5leHBvcnQgY2xhc3MgTFJVRW50aXR5Q2FjaGUgaW1wbGVtZW50cyBFbnRpdHlDYWNoZSB7XG4gIHByaXZhdGUgc3RhdGljIE1JTl9DQUNIRURfQ09VTlQgPSAxMDBcbiAgcHJpdmF0ZSBzdGF0aWMgREVGVUxUX01BWF9DQUNIRURfQ09VTlQgPSAxMDAwMFxuXG4gIHByaXZhdGUgb3B0aW9uczogRW50aXR5Q2FjaGVPcHRpb25zXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgbW9kZWxDYWNoZXMgOiBNYXA8c3RyaW5nLCBMUlUuQ2FjaGU8c3RyaW5nLCBFbnRpdHk+PlxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvciggb3B0aW9ucz86IEVudGl0eUNhY2hlT3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgeyBkZWZhdWx0IDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlQgfVxuICAgIC8vIGZvciggbGV0IGsgaW4gdGhpcy5vcHRpb25zICkgXG4gICAgLy8gICB0aGlzLm9wdGlvbnNba10gPSBpc051bWJlcih0aGlzLm9wdGlvbnNba10pID8gdGhpcy5vcHRpb25zW2tdIDogTFJVRW50aXR5Q2FjaGUuREVGVUxUX01BWF9DQUNIRURfQ09VTlRcblxuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoTFJVRW50aXR5Q2FjaGUubmFtZSlcbiAgICB0aGlzLm1vZGVsQ2FjaGVzID0gbmV3IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+KClcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUgOiBzdHJpbmcsIGNyZWF0ZUlmTm90RXhpc3RzID0gZmFsc2UsIHRocm93SWZOb3RFeGlzdHMgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxMUlUuQ2FjaGU8RW50aXR5S2V5LCBFbnRpdHk+PiB7XG4gICAgaWYgKCBjcmVhdGVJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgeyBcbiAgICAgIC8vIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAvLyAgIG1heDogNTAwLFxuICAgICAgLy8gICBsZW5ndGg6IGZ1bmN0aW9uIChuLCBrZXkpIHsgcmV0dXJuIG4gKiAyICsga2V5Lmxlbmd0aCB9LFxuICAgICAgLy8gICAvL2Rpc3Bvc2U6IGZ1bmN0aW9uIChrZXksIG4pIHsgbi5jbG9zZSgpIH0sXG4gICAgICAvLyAgIG1heEFnZTogMTAwMCAqIDYwICogNjAgXG4gICAgICAvLyB9XG4gICAgICBsZXQgbWF4Q2FjaGVkQ291bnQgOiBudW1iZXI7XG4gICAgICBpZiAoICF0aGlzLm9wdGlvbnMuaGFzT3duUHJvcGVydHkobW9kZWxOYW1lKSApIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IHRoaXMub3B0aW9ucy5kZWZhdWx0XG4gICAgICBlbHNlIGlmICggaXNOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gTnVtYmVyKHRoaXMub3B0aW9uc1ttb2RlbE5hbWVdKVxuICAgICAgZWxzZSBpZiAoIGlzRnVuY3Rpb24odGhpcy5vcHRpb25zW21vZGVsTmFtZV0pKVxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9ICggdGhpcy5vcHRpb25zW21vZGVsTmFtZV0gYXMgKG1vZGVsKT0+IG51bWJlciApKCBtb2RlbE5hbWUgKVxuICAgICAgZWxzZSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgICBtYXhDYWNoZWRDb3VudCA9IE1hdGgubWF4KCBMUlVFbnRpdHlDYWNoZS5NSU5fQ0FDSEVEX0NPVU5ULCBtYXhDYWNoZWRDb3VudCApXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLnNldChtb2RlbE5hbWUsIG5ldyBMUlU8c3RyaW5nLCBFbnRpdHk+KCBtYXhDYWNoZWRDb3VudCApIClcbiAgICB9XG4gICAgIGlmICggdGhyb3dJZk5vdEV4aXN0cyAmJiAhdGhpcy5tb2RlbENhY2hlcy5oYXMobW9kZWxOYW1lKSkgXG4gICAgICAgdGhyb3cgbmV3IEVycm9yKGBNb2RlbCBjYWNoZSAoIG5hbWUgPSAnJHttb2RlbE5hbWV9JyApICBkb2VzIG5vdCBleGlzdHNgKSBcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLm1vZGVsQ2FjaGVzLmdldChtb2RlbE5hbWUpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q2FjaGVLZXkoIGtleTogRW50aXR5S2V5ICkgOiBudW1iZXIgfCBzdHJpbmcge1xuICAgIHJldHVybiBpc1ByaW1pdGl2ZUtleShrZXkpID8ga2V5IGFzIG51bWJlciB8IHN0cmluZyA6ICgga2V5IGFzIEtleU9iamVjdCApLmtleVxuICB9XG5cbiAgcHVibGljIGNsZWFyKG1vZGVsTmFtZT8gOiBzdHJpbmcpIDogdm9pZCB7ICAgIFxuICAgIGlmICggaXNTdHJpbmcobW9kZWxOYW1lKSApIHtcbiAgICAgIHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lLCBmYWxzZSwgdHJ1ZSApIS5yZXNldCgpXG4gICAgICB0aGlzLm1vZGVsQ2FjaGVzLmRlbGV0ZSggbW9kZWxOYW1lIClcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBmb3IgKCBsZXQgYyBvZiB0aGlzLm1vZGVsQ2FjaGVzLnZhbHVlcygpICkge1xuICAgICAgYy5yZXNldCgpXG4gICAgfVxuICAgIHRoaXMubW9kZWxDYWNoZXMuY2xlYXIoKVxuICB9XG5cbiAgcHVibGljIGdldCBtb2RlbHMoKSA6IHN0cmluZ1tdIHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PHN0cmluZz4oKVxuICAgIGZvciggbGV0IG0gb2YgdGhpcy5tb2RlbENhY2hlcy5rZXlzKCkgKSB7XG4gICAgICByZXN1bHQucHVzaCggbSApXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuICBcbiAgcHVibGljIGdldDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT4ge1xuICAgIGxldCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBsZXQgY2FjaGVLZXkgPSB0aGlzLmdldENhY2hlS2V5KCBrZXkgKVxuXG4gICAgcmV0dXJuICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpID8gdW5kZWZpbmVkIDpcbiAgICAgIG1vZGVsQ2FjaGUhLmhhcyhjYWNoZUtleSkgPyBtb2RlbENhY2hlIS5nZXQoY2FjaGVLZXkpIGFzIFRFbnRpdHkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIHB1YmxpYyBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGxldCBjYWNoZSA9IHRoaXMuZ2V0TW9kZWxDYWNoZSggbW9kZWxOYW1lIClcbiAgICBpZiAoIGNhY2hlID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICBjYWNoZS5mb3JFYWNoKCBlID0+IHtcbiAgICAgICghZmlsdGVyIHx8IChmaWx0ZXIgJiYgZmlsdGVyKCBlIGFzIFRFbnRpdHkgKSkpICYmIHJlc3VsdC5wdXNoKCBlIGFzIFRFbnRpdHkgKSBcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBlbnRpdHk6IEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHB1dCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7a2V5fSwgZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApICAgIFxuICAgIHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUsIHRydWUpIS5zZXQodGhpcy5nZXRDYWNoZUtleShrZXkpLCBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZCB7XG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYGV2aXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2NhY2hlS2V5fWApXG5cbiAgICBjb25zdCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBpZiAobW9kZWxDYWNoZSkgbW9kZWxDYWNoZS5kZWwoY2FjaGVLZXkpXG4gIH1cbiAgXG4gIHB1YmxpYyBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldChtb2RlbE5hbWUsICB0aGlzLmdldENhY2hlS2V5KCBrZXkgKSkgIT09IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIGZhbHNlICkgIT09IHVuZGVmaW5lZFxuICB9XG5cblxuICBwdWJsaWMgZHVtcENhY2hlKCkgOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgQ0FDSEUgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHRoaXMubW9kZWxDYWNoZXMuZm9yRWFjaCggKGNhY2hlLCBtb2RlbCkgPT4ge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLU1vZGVsICR7bW9kZWx9LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBjYWNoZS5mb3JFYWNoKCAoIGVudGl0eSwga2V5ICkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gYGtleSA9ICR7dGhpcy5nZXRDYWNoZUtleSgga2V5ICl9LCBlbnRpdHkgPSB7JHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfX0gXFxuYFxuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgIH0pICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgc2RiIGZyb20gJy4vU21hcnREQidcbmltcG9ydCAqIGFzIG1vZGVsIGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgKiBhcyBibG9jayBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9jayA9IGJsb2NrLkJsb2NrXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YmxldmVsIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBwcm9taXNpZnkoY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pIDogUHJvbWlzZTxUPlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0QnkoaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPEpzb25PYmplY3Q+KTogUHJvbWlzZTxKc29uT2JqZWN0PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1YmxldmVsLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1YmxldmVsKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5sZXZlbGRiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzdWIgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHN1YiApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+ICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5sZXZlbGRiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IHByb21pc2lmeShnZXRDYWxsYmFjaylcbiAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleChpbmRleEZpZWxkKVxuICAgIHJldHVybiBhd2FpdCBpbmRleExldmVsLmdldDxUPihrZXksIGdldENhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBwcm9taXNpZnkocHV0Q2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoZGVsQ2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLmRlbChrZXksIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5sZXZlbGRiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeSggaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT4pXG5cbiAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgIHRoaXMubGV2ZWxkYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgdGhpcy5sZXZlbGRiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEhlaWdodCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKCBkaXIgOiBzdHJpbmcsIGxldmVsT3B0aW9ucyA9IHt9ICkge1xuICAgIC8qIFxuICAgICAgeyBpZCg2NCksIHRpbWVzdGFtcChiaWdpbnQpLCBoZWlnaHQoYmlnaW50KSwgcGF5bG9hZExlbmd0aChiaWdpbnQpLCBwYXlsb2FkSGFzaCg2NCksIHByZXZCbG9ja0lkKDY0KSwgXG4gICAgICAgIHBvaW50SWQoNjQpLCBwb2ludEhlaWdodChiaWdpbnQpLCBkZWxlZ2F0ZSg2NCksIHNpZ25hdHVyZSgxMjgpLCBjb3VudChiaWdpbnQpIH1cbiAgICAqL1xuICAgIGNvbnN0IGJsb2NrTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2JsaycsICdoZWlnaHQnLCBbXG4gICAgICB7IGZpZWxkTmFtZTogJ2lkJyB9LCBcbiAgICAgIHsgZmllbGROYW1lOiAnZGVsZWdhdGUnIH1cbiAgICBdKVxuICAgIGNvbnN0IGNoYW5nZXNMb2dNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnaGlzJywgJ2hlaWdodCcsIFtdKVxuICAgIFxuICAgIHRoaXMuZGIgPSBuZXcgTGV2ZWxEQiggZGlyLCBbYmxvY2tNZXRhLCBjaGFuZ2VzTG9nTWV0YV0sIGxldmVsT3B0aW9ucyApXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gLTFcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB7IGhlaWdodCB9ID0gIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8eyBoZWlnaHQ6IG51bWJlciB9PihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlIFxuXG4gICAgICBsZXQgbGFzdEhlaWdodCA9IHsgaGVpZ2h0OiAtMSB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrRGIucHV0KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgbGFzdEhlaWdodClcbiAgICAgIHJldHVybiBsYXN0SGVpZ2h0LmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIub3BlbigpXG4gICAgdGhpcy5ibG9ja0RiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnYmxrJylcbiAgICB0aGlzLmhpc3RvcnlEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2hpcycpXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RIZWlnaHQgXG4gIH1cblxuICBwcml2YXRlIGlzS2V5Tm90Rm91bmRFcnJvcihlKSA6IGJvb2xlYW4geyBcbiAgICByZXR1cm4gZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXBwZW5kQmxvY2soIGJsb2NrIDogQmxvY2tIZWFkZXIsIGNoYW5nZXM6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWJsb2NrIHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUgfHwgYmxvY2suaGVpZ2h0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogeyBoZWlnaHQ6IGJsb2NrLmhlaWdodCB9IH0gXSlcblxuICAgIHRoaXMubGFzdEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBoZWlnaHQgLSAxIH0gfSBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RIZWlnaHQgLS1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tEYi5nZXRCeSgnaWQnLCBibG9ja0lkKVxuICAgIHJldHVybiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgPyB1bmRlZmluZWQgOiBibG9ja3NbMF1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIHJldHVybiBhd2FpdCAoKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXMsIHJlaikgPT4ge1xuICAgICAgICBsZXQgYmxvY2tzID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpICAgICAgXG4gICAgICAgIHRoaXMuYmxvY2tEYi5jcmVhdGVSZWFkU3RyZWFtKHsgc3RhcnQ6IG1pbkhlaWdodCwgZW5kOiBtYXhIZWlnaHR9KVxuICAgICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gYmxvY2tzLnB1c2goZGF0YSkgKVxuICAgICAgICAgIC5vbignZXJyb3InLCBlID0+IHJlaihlKSApXG4gICAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXMoYmxvY2tzKSApXG4gICAgICB9KVxuICAgIH0pKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSBhcyBBcnJheTxCbG9ja0hlYWRlcj5cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXQgID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBibG9ja0lkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2tCeUlkKCBibG9ja0lkc1tpXSApXG4gICAgICBibG9jayAmJiByZXQucHVzaCggYmxvY2sgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG4gIH1cbn0iLCJleHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIEFsbCAgICA9IDEyOCAtIDEsXG4gIFRyYWNlICA9IDY0LFxuICBEZWJ1ZyAgPSAzMixcbiAgTG9nICAgID0gMTYsXG4gIEluZm8gICA9IDgsXG4gIFdhcm4gICA9IDQsXG4gIEVycm9yICA9IDIsXG4gIEZhdGFsICA9IDEsXG4gIE5vbmUgICA9IDBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2dMZXZlbCA6IExvZ0xldmVsXG4gIHJlYWRvbmx5IGluZm9FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgdHJhY2VFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSBsb2dFbmFibGVkICAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGRlYnVnRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgd2FybkVuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBlcnJvckVuYWxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGZhdGFsRW5hYmxlZCA6IGJvb2xlYW5cblxuICB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgd2FybiggbXNnOiBzdHJpbmcgLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG4gIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG59XG5cbmNsYXNzIExvZ2dlckFkYXB0ZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBwcml2YXRlIGxldmVsIDogTG9nTGV2ZWxcbiAgcHJpdmF0ZSBuYW1lIDogc3RyaW5nXG4gIHByaXZhdGUgZm9ybWF0IDogYm9vbGVhblxuICBwcml2YXRlIGdldExvZ2dlciA6ICgpID0+IExvZ2dlclxuXG4gIHB1YmxpYyBnZXQgaW5mb0VuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5JbmZvKSAgPiAwIH1cbiAgcHVibGljIGdldCB0cmFjZUVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLlRyYWNlKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGRlYnVnRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRGVidWcpID4gMCB9XG4gIHB1YmxpYyBnZXQgbG9nRW5hYmxlZCgpICAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5Mb2cpICAgPiAwIH1cbiAgcHVibGljIGdldCB3YXJuRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLldhcm4pICA+IDAgfVxuICBwdWJsaWMgZ2V0IGVycm9yRW5hbGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRXJyb3IpID4gMCB9XG4gIHB1YmxpYyBnZXQgZmF0YWxFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5GYXRhbCkgPiAwIH1cblxuICBwdWJsaWMgZ2V0IGxvZ0xldmVsKCkgeyByZXR1cm4gdGhpcy5sZXZlbCB9XG4gIHB1YmxpYyBzZXQgbG9nTGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHsgdGhpcy5sZXZlbCA9IGxldmVsIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoZ2V0TG9nZ2VyOiAoKSA9PiBMb2dnZXIsIGZvcm1hdE1lc3NhZ2UgPSBmYWxzZSwgbG9nZ2VyTmFtZTogc3RyaW5nLCBsZXZlbCA9IExvZ0xldmVsLkFsbCApIHtcbiAgICB0aGlzLm5hbWUgPSBsb2dnZXJOYW1lXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gICAgdGhpcy5nZXRMb2dnZXIgPSBnZXRMb2dnZXJcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdE1lc3NhZ2VcbiAgfVxuXG4gIHByb3RlY3RlZCBmcm9tYXRNZXNzYWdlKCBtc2c6IHN0cmluZywgbG9nVHlwZTogc3RyaW5nICkgOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSBbJHtsb2dUeXBlfV0gWyR7dGhpcy5uYW1lfV0gJHttc2d9YFxuICB9XG5cbiAgcHVibGljIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnSU5GTycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuaW5mbyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0RFQlVHJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdMT0cnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnVFJBQ0UnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgd2FybiggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdXQVJOJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS53YXJuKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdFUlJPUicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG5cbiAgcHVibGljIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRkFUQUwnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTG9nTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dMZXZlbCA9IExvZ0xldmVsLkFsbFxuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVMb2dnZXIgPSAoKSA9PiAgY29uc29sZSBhcyBPYmplY3QgYXMgTG9nZ2VyIFxuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nZ2VyID0gbmV3IExvZ2dlckFkYXB0ZXIoIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCAnZGVmYXVsdCcsIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsIClcblxuICBwdWJsaWMgc3RhdGljIHNldCBkZWZhdWx0TGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHtcbiAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCA9IGxldmVsXG4gIH1cbiAgXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGxvZ0ZhY3RvcnkgKCB2YWx1ZTogKCkgPT4gTG9nZ2VyICkge1xuICAgIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyID0gdmFsdWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TG9nZ2VyKGxvZ2dlck5hbWU/OiBzdHJpbmcsIGxldmVsPyA6IExvZ0xldmVsKSA6IExvZ2dlciB7XG4gICAgcmV0dXJuIGxvZ2dlck5hbWUgPyBcbiAgICAgIG5ldyBMb2dnZXJBZGFwdGVyKExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCBsb2dnZXJOYW1lLCBsZXZlbCB8fCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCkgOiBcbiAgICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ2dlcjtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBLZXlPYmplY3QsIENvZGVDb250cmFjdCBhcyBEQkMsIHBhcnRpYWwsIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0geyBuZXcoKSA6IFQgfVxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ID0gc3RyaW5nIHwgQ29uc3RydWN0b3I8VEVudGl0eT5cblxuZXhwb3J0IGVudW0gRmllbGRUeXBlcyB7XG4gIFN0cmluZyAgID0gJ1N0cmluZycsXG4gIE51bWJlciAgID0gJ051bWJlcicsXG4gIEJpZ0ludCAgID0gJ0JpZ0ludCcsXG4gIFRleHQgICAgID0gJ1RleHQnXG59XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IHN0cmluZyB8IEZpZWxkVHlwZXNcblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZCB7XG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogRmllbGRUeXBlLFxuICBsZW5ndGg/OiBudW1iZXIgLFxuICBpbmRleD86IGJvb2xlYW4sXG4gIG5vdF9udWxsPzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgY29tcG9zaXRlX2tleT8gOiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUga2V5T2JqZWN0IDogSnNvbk9iamVjdFxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcigga2V5T2JqZWN0IDogSnNvbk9iamVjdCApIHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlPYmplY3QnLCAoKSA9PiBEQkMubm90TnVsbChrZXlPYmplY3QpKVxuXG4gICAgdGhpcy5rZXlPYmplY3QgPSBrZXlPYmplY3RcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbWFrZTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogVEVudGl0eSApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCAoKSA9PiBEQkMubm90TnVsbChzY2hlbWEpKVxuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsIHNjaGVtYS5pc0NvbXBzaXRlS2V5LCAnbW9kZWwgbXVzdCBpbmRlbnRpZnkgYnkgY29tcG9zaXRlIGtleScpXG4gICAgREJDLmFyZ3VtZW50KCAnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KCBwYXJ0aWFsKGVudGl0eSwgLi4uc2NoZW1hLmNvbXBvc2l0ZUtleXMpIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZygga2V5SnNvblN0cmluZzogc3RyaW5nICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleUpzb25TdHJpbmcnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShrZXlKc29uU3RyaW5nKSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KEpTT04ucGFyc2UoIGtleUpzb25TdHJpbmcgKS5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleUpzb24oKSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmtleU9iamVjdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBvc2l0ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCEga2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBrZXkua2V5SnNvblxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgcEtleTogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPlxuICBwcml2YXRlIGNLZXlzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gRmllbGRUeXBlcy5TdHJpbmcgfHwgdHlwZSA9PT0gRmllbGRUeXBlcy5UZXh0ID8gXG4gICAgICAnU3RyaW5nJyA6IFxuICAgICAgJ051bWJlcidcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICFpbmNsdWRlS2V5ICYmICggdGhpcy5jS2V5cy5pbmRleE9mKGYpID49IDAgfHwgZiA9PT0gdGhpcy5wcmltYXJ5S2V5ICkgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEsIEZpZWxkVHlwZXMgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogc3RyaW5nXG4gIGJ1aWxkSW5zZXJ0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGREZWxldGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzOiBBcnJheTxzdHJpbmc+LCB3aGVyZSA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBzdHJpbmcge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gZGF0YWJhc2UgZG8gbm90IHN1cHBvcnQgY29tcG9zaXRlIGtleSAgIFxuICAgIC8vIGlmICggc2NoZW1hLmlzQ29tcHNpdGVLZXkgKSB7IFxuICAgIC8vICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gZi5wcmltYXJ5X2tleSA9IGZhbHNlIClcbiAgICAvLyB9XG4gICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fscy5qb2luKCBNVUxUSV9TUUxfU0VQQVJBVE9SIClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIC8vIHByaXZhdGUgZGV0ZXJtaW5lU29ydCggdGFibGVOYW1lOiBzdHJpbmcsIHNvcnQgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgc29ydCB8fCB7fVxuICAvLyAgIGlmICh0eXBlb2Ygc29ydCA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGlmIChzb3J0ID09PSAndGltZXN0YW1wJykge1xuICAvLyAgICAgICBzb3J0ID0gJ3QuJyArIHNvcnRcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHNvcnQgPSB0YWJsZU5hbWUgKyAnLicgKyBzb3J0XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2Ygc29ydCA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gc29ydCkge1xuICAvLyAgICAgICBpZiAoayA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgLy8gICAgICAgICBzb3J0Wyd0LicgKyBrXSA9IHNvcnRba11cbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBzb3J0W3RhYmxlTmFtZSArICcuJyArIGtdID0gc29ydFtrXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGRlbGV0ZSBzb3J0W2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBzb3J0XG4gIC8vIH1cblxuICAvLyBwcml2YXRlIGRldGVybWluZVdoZXJlKCB0YWJsZU5hbWU6IHN0cmluZywgd2hlcmUgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgbGV0IGNvbmRpdGlvbiA9IHt9IHx8IHdoZXJlIFxuICAvLyAgIGlmIChBcnJheS5pc0FycmF5KGNvbmRpdGlvbikpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5zbGljZSgpXG4gIC8vICAgICBmb3IgKGxldCBpIGluIGNvbmRpdGlvbikge1xuICAvLyAgICAgICBmb3IgKGxldCBrIGluIGNvbmRpdGlvbltpXSkge1xuICAvLyAgICAgICAgIGNvbmRpdGlvbltpXVt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltpXVtrXVxuICAvLyAgICAgICAgIGRlbGV0ZSBjb25kaXRpb25baV1ba11cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmRpdGlvbilcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gY29uZGl0aW9uKSB7XG4gIC8vICAgICAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltrXVxuICAvLyAgICAgICBkZWxldGUgY29uZGl0aW9uW2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLl9kZWxldGVkXyddID0gMFxuICAvLyB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkc09yUGFyYW1zOiBBcnJheTxzdHJpbmc+IHwgSnNvbk9iamVjdCwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBcbiAgICByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgam9pbj8gOiBKc29uT2JqZWN0ICk6IFNxbEFuZFBhcmFtZXRlcnMge1xuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBcbiAgICBsZXQgcXVlcnlPcHRpb25zIDogSnNvbk9iamVjdFxuICAgIGlmICggIWlzQXJyYXkoIGZpZWxkc09yUGFyYW1zICkgKSB7XG4gICAgICBsZXQgcGFyYW1zID0gZmllbGRzT3JQYXJhbXMgYXMgSnNvbk9iamVjdFxuICAgICAgcXVlcnlPcHRpb25zID0gT2JqZWN0LmFzc2lnbiggeyB0eXBlOiAnc2VsZWN0JywgdGFibGU6IHRhYmxlTmFtZSB9LCBwYXJhbXMgKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxldCBmaWVsZHMgPSBmaWVsZHNPclBhcmFtcyB8fCBzY2hlbWEuZmllbGROYW1lcy5tYXAoIGYgPT4gc2NoZW1hLnNjaGVtYU9iamVjdC50YWJsZSArICcuJyArIGYgKVxuICAgICAgbGV0IGxvIDogTGltaXRBbmRPZmZzZXQgPSBpc051bWJlciggcmVzdWx0UmFuZ2UgKSA/ICB7IGxpbWl0IDogcmVzdWx0UmFuZ2UgfSA6IHJlc3VsdFJhbmdlIHx8IHsgfVxuICAgICAgbGV0IG9yZGVyID0gc29ydCB8fCB7fVxuICAgICAgZm9yICggbGV0IGtleSBvZiBSZWZsZWN0Lm93bktleXMob3JkZXIpICApIHtcbiAgICAgICAgbGV0IG9yZGVyVmFsdWUgPSBvcmRlcltrZXldIHx8IC0xXG4gICAgICAgIG9yZGVyW2tleV0gPSAob3JkZXJWYWx1ZSA9PT0gJ0FTQycpID8gMSA6ICggKG9yZGVyVmFsdWUgPT09ICdERVNDJykgPyAtMSA6IG9yZGVyVmFsdWUgKVxuICAgICAgfVxuXG4gICAgICBxdWVyeU9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBmaWVsZHM6IGZpZWxkcyxcbiAgICAgICAgY29uZGl0aW9uOiB3aGVyZSxcbiAgICAgICAgbGltaXQ6IGxvLmxpbWl0LFxuICAgICAgICBvZmZzZXQ6IGxvLm9mZnNldCxcbiAgICAgICAgc29ydDogb3JkZXIsXG4gICAgICAgIGpvaW46IGpvaW5cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlNlbGVjdCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQocXVlcnlPcHRpb25zKSlcbiAgfVxufSIsImltcG9ydCB7IFNxbGl0ZVdyYXBwZXIgfSBmcm9tICcuL1NxbGl0ZVdyYXBwZXInXG5pbXBvcnQgeyBNVUxUSV9TUUxfU0VQQVJBVE9SLCBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uLCBDb25uZWN0aW9uT3B0aW9ucywgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuXG5cbmNsYXNzIFNxbGl0ZVRyYW5zYWN0aW9uIGltcGxlbWVudHMgREJUcmFuc2FjdGlvbiB7XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbikge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb21taXQoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdDT01NSVQ7JylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByb2xsYmFjaygpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ1JPTExCQUNLOycpIFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVDb25uZWN0aW9uIGltcGxlbWVudHMgRGJDb25uZWN0aW9uIHtcbiAgcHJpdmF0ZSBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnNcbiAgcHJpdmF0ZSBzcWxpdGUgOiBTcWxpdGVXcmFwcGVyXG5cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9ucyApIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5zcWxpdGUgPSBuZXcgU3FsaXRlV3JhcHBlcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbm5lY3Rpb25PcHRpb25zKCk6IENvbm5lY3Rpb25PcHRpb25zIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuYXN5bk9wZW4oIHRoaXMub3B0aW9ucy5zdG9yYWdlIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkaXNjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5RdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgcXVlcnlTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUucXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdDogU3FsRXhlY3V0ZVJlc3VsdCApIHtcbiAgICBpZiAoIHJlc3VsdC5yb3dzRWZmZWN0ZWQgPT09IDApICB0aHJvdyBuZXcgRXJyb3IoJ05vbmUgcm93IGVmZmVjdGVkJylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2hTeW5jKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuZXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdICwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgfHwgW10sIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkICkgXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogU3FsRXhlY3V0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIHBhcmFtZXRlcnMpXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5FeGVjdXRlKCBzcWwsIHBhcmFtZXRlcnMgKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1blNjcmlwdChzcWw6IHN0cmluZykgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBzcWwuc3BsaXQoIE1VTFRJX1NRTF9TRVBBUkFUT1IgKS5mb3JFYWNoKFxuICAgICAgYXN5bmMgc3FsPT4gYXdhaXQgKHNxbC50cmltKCkgIT09ICcnKSAmJiB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgW10pXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnMoKTogUHJvbWlzZTxEQlRyYW5zYWN0aW9uPiB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlKCdCRUdJTiBUUkFOU0FDVElPTjsnKVxuICAgIHJldHVybiBuZXcgU3FsaXRlVHJhbnNhY3Rpb24odGhpcylcbiAgfVxufSIsImltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ01hbmFnZXIsIExvZ2dlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IFNxbFBhcmFtZXRlcnMsIFNxbEFuZFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5cbmltcG9ydCAqIGFzIERhdGFiYXNlIGZyb20gJ2JldHRlci1zcWxpdGUzJ1xuXG5leHBvcnQgY2xhc3MgU3FsaXRlV3JhcHBlciB7XG4gIHByaXZhdGUgZGIgOiBEYXRhYmFzZVxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNxbGl0ZVdyYXBwZXIubmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKGRiRmlsZVBhdGg6IHN0cmluZywgY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5kYiA9IG5ldyBEYXRhYmFzZShkYkZpbGVQYXRoKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgIClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0ICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5DbG9zZSgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmNsb3NlKS5jYWxsKHRoaXMpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8U3FsRXhlY3V0ZVJlc3VsdD4pOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB7IGxhc3RJbnNlcnRSb3dJZDogJzAnLCByb3dzRWZmZWN0ZWQ6IDAgfSB9XG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGNvbnN0IHNxbFJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLnJ1bihwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgcmV0LnJlc3VsdCA9IHsgXG4gICAgICAgIGxhc3RJbnNlcnRSb3dJZCA6IHNxbFJlc3VsdC5sYXN0SW5zZXJ0Uk9XSUQudG9TdHJpbmcoKSxcbiAgICAgICAgcm93c0VmZmVjdGVkOiBzcWxSZXN1bHQuY2hhbmdlcyBcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIHF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8YW55Pj4gKSA6IEFycmF5PGFueT4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxhbnk+KCkgfVxuICAgIHRyeSB7XG4gICAgICByZXQucmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkuYWxsKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIHJlc3VsdCBjb3VudCA9ICR7cmV0LnJlc3VsdC5sZW5ndGh9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCwgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4gICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+KCkgfSBcbiAgICBsZXQgc3FsIDogU3FsQW5kUGFyYW1ldGVycyB8IHVuZGVmaW5lZFxuICAgIHRyeSB7XG4gICAgICBzcWxzLmZvckVhY2goIHMgPT4ge1xuICAgICAgICBzcWwgPSBzXG4gICAgICAgIGxldCBleGVjUmV0ID0gdGhpcy5leGVjdXRlKCBzLnF1ZXJ5LCBzLnBhcmFtZXRlcnMgKVxuICAgICAgICBvbkV4ZWN1dGVkICYmIG9uRXhlY3V0ZWQoIGV4ZWNSZXQsIHMgKSAgXG4gICAgICAgIHJldC5yZXN1bHQucHVzaCggZXhlY1JldCApXG4gICAgICB9KVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGV4ZWN1dGVCYXRjaCwgc3FsID0gJHtzcWwhLnF1ZXJ5fSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkoc3FsIS5wYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayggcmV0LmVyciwgcmV0LnJlc3VsdCApXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luRXhlY3V0ZShzcWwsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGUpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5RdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLnF1ZXJ5KS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luY0V4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlQmF0Y2gpLmNhbGwoIHRoaXMsIHNxbHMsIG9uRXhlY3V0ZWQgKVxuICB9XG5cbn0iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciwgaXNDb21wb3NpdGVLZXkgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlQcm94eSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snXG5pbXBvcnQgeyBCbG9ja0NhY2hlIH0gZnJvbSAnLi9CbG9ja0NhY2hlJ1xuXG50eXBlIE5hbWVkSG9vazxURnVuYz4gPSB7IG5hbWU6IHN0cmluZywgaG9vayA6IFRGdW5jIH1cbmV4cG9ydCB0eXBlIENvbW1pdEJsb2NrSG9vayA9ICggYmxvY2sgOiBCbG9jayApID0+IHZvaWRcbmV4cG9ydCB0eXBlIFJvbGxiYWNrQmxvY2tIb29rID0gKCBmcm9tSGVpZ2h0IDogbnVtYmVyLCB0b0hlaWdodCA6IG51bWJlciApID0+IHZvaWRcblxuZXhwb3J0IHR5cGUgU21hcnREQk9wdGlvbnMgPSB7XG4gIC8qKlxuICAgKiBjYWNoZWQgaGlzdG9yeSBjb3VudChibG9jayBjb3VudCksIHVzZWQgdG8gcm9sbGJhY2sgYmxvY2tcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGhpc3RvcnlGb3JSb2xsYmFjaz8gOiBudW1iZXIsXG5cbiAgLyoqXG4gICAqIGNsZWFuIHBlcnNpc3RlZCBoaXN0b3J5IGF1dG9tYXRpY2FsbHlcbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9DbGVhblBlcnNpc3RlZEhpc3Rvcnk/IDogYm9vbGVhbixcblxuICAvKipcbiAgICogY2FjaGVkIGxhc3QgYmxvY2sgY291bnQgXG4gICAqIEBkZWZhdWx0IDEwXG4gICAqL1xuICBjYWNoZWRCbG9ja0NvdW50PyA6IG51bWJlcixcblxuICAvKipcbiAgICogbWF4IGNhY2hlZCBlbnRpdHkgY291bnQsIGNvbmZpZyBpdCBwZXIgbW9kZWwsIExSVSAgXG4gICAqIHNhbXBsZTogeyBVc2VyOiAyMDAsIFRyYW5zOiA1MDAwIH0gbWF4IGNhY2hlZCAyMDBzIFVzZXIg77yMNTAwMCBmb3IgVHJhbnNcbiAgICogQGRlZmF1bHQgNTAwMCBlYWNoIG1vZGVsXG4gICAqL1xuICBlbnRpdHlDYWNoZU9wdGlvbnM/IDogRW50aXR5Q2FjaGVPcHRpb25zXG5cbn1cblxuLyoqXG4gKiBPUk0gbGlrZSB0byBvcGVyYXRlIGJsb2NrY2hhaW4gZGF0YVxuICogQGV2ZW50IHJlYWR5IGVtbWl0IGFmdGVyIGluaXRpYWxpemVkXG4gKiBAZXZlbnQgY2xvc2UgZW1taXQgYWZ0ZXIgY2xvc2VkXG4gKi9cbmV4cG9ydCBjbGFzcyBTbWFydERCIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgcHJpdmF0ZSBvcHRpb25zIDogU21hcnREQk9wdGlvbnNcbiAgcHJpdmF0ZSBob2xkTG9ja3MgOiBTZXQ8c3RyaW5nPlxuICBwcml2YXRlIGNvbW1pdEJsb2NrSG9va3M6IEFycmF5PE5hbWVkSG9vazxDb21taXRCbG9ja0hvb2s+PlxuICBwcml2YXRlIHJvbGxiYWNrQmxvY2tIb29rczogQXJyYXk8TmFtZWRIb29rPFJvbGxiYWNrQmxvY2tIb29rPj5cbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjYWNoZWRCbG9ja3MgOiBCbG9ja0NhY2hlXG4gIHByaXZhdGUgc2NoZW1hcyA6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIGNvbm5lY3Rpb24gOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBibG9ja1Nlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBsb2NhbFNlc3Npb24gOiBEYlNlc3Npb25cbiAgcHJpdmF0ZSBibG9ja0RCIDogTGV2ZWxCbG9ja1xuICBwcml2YXRlIGN1cnJlbnRCbG9jayA6IEJsb2NrIHwgbnVsbFxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3RvciBcbiAgICogTk9USUMgOiB5b3UgbmVlZCBjYWxsIGluaXQgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBkYlBhdGggcGF0aCBvZiBibG9ja2NoYWluIGRiXG4gICAqIEBwYXJhbSBsZXZlbEJsb2NrRGlyIHBhdGggb2YgYmxvY2sgaGVhZGVyIGRiXG4gICAqIEBwYXJhbSBvcHRpb25zIG9mIFNtYXJ0REJcbiAgICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggZGJQYXRoOiBzdHJpbmcsIGxldmVsQmxvY2tEaXI6IHN0cmluZywgb3B0aW9ucz8gOiBTbWFydERCT3B0aW9ucyApIHtcbiAgICBEQkMuYXJndW1lbnQoJ2RiUGF0aCcsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UoZGJQYXRoKSlcbiAgICBEQkMuYXJndW1lbnQoJ2xldmVsQmxvY2tEaXInLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGxldmVsQmxvY2tEaXIpKVxuXG4gICAgc3VwZXIoKVxuICAgIHRoaXMub3B0aW9ucyA9ICB7XG4gICAgICBjYWNoZWRCbG9ja0NvdW50IDogMTAsXG4gICAgICBoaXN0b3J5Rm9yUm9sbGJhY2sgOiAxMCxcbiAgICAgIGF1dG9DbGVhblBlcnNpc3RlZEhpc3RvcnkgOiBmYWxzZSwgICAgICBcbiAgICAgIGVudGl0eUNhY2hlT3B0aW9ucyA6IHsgZGVmYXVsdCA6IDUwMDAgfVxuICAgIH0gfHwgb3B0aW9uc1xuXG4gICAgdGhpcy5ob2xkTG9ja3MgPSBuZXcgU2V0PHN0cmluZz4oKVxuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcyA9IG5ldyBBcnJheTxOYW1lZEhvb2s8Q29tbWl0QmxvY2tIb29rPj4oKVxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzID0gbmV3IEFycmF5PE5hbWVkSG9vazxSb2xsYmFja0Jsb2NrSG9vaz4+KClcbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgcHJpdmF0ZSBwcmVDb21taXRCbG9jayggYmxvY2s6IEJsb2NrICkge1xuICAgIHRoaXMuY29tbWl0QmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBibG9jayApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdENvbW1pdEJsb2NrKCBibG9jazogQmxvY2sgKSB7XG4gICAgdGhpcy5lbWl0KCduZXdCbG9jaycsIGJsb2NrKVxuICB9XG5cbiAgcHJpdmF0ZSBwcmVSb2xsYmFja0Jsb2NrKCBmcm9tIDogbnVtYmVyLCB0byA6IG51bWJlciApIHtcbiAgICB0aGlzLnJvbGxiYWNrQmxvY2tIb29rcy5mb3JFYWNoKCBuaCA9PiBuaC5ob29rKCBmcm9tLCB0byApIClcbiAgfVxuXG4gIHByaXZhdGUgcG9zdFJvbGxiYWNrQmxvY2soIGZyb20gOiBudW1iZXIsIHRvIDogbnVtYmVyICkge1xuICAgIHRoaXMuZW1pdCgncm9sbGJhY2tCbG9jaycsIHsgZnJvbSwgdG8gfSApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgY29tbWl0IGJsb2NrIGhvb2ssIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGJlZm9yZSBjb21taXQgYmxvY2tcbiAgICogQHBhcmFtIG5hbWUgaG9vayBuYW1lXG4gICAqIEBwYXJhbSBob29rRnVuYyBob29rIGZ1bmN0aW9uICwgKCBibG9jayApID0+IHZvaWRcbiAgICovXG4gIHB1YmxpYyByZWdpc3RlckNvbW1pdEJsb2NrSG9vayggbmFtZTogc3RyaW5nLCBob29rRnVuYzogQ29tbWl0QmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMuY29tbWl0QmxvY2tIb29rcy5maW5kKG5oPT5uaC5uYW1lID09PSBuYW1lLnRyaW0oKSkgPT09IHVuZGVmaW5lZCwgXG4gICAgICBgaG9vayBuYW1lZCAnJHtuYW1lfScgZXhpc3QgYWxyZWFkeWApXG4gICAgXG4gICAgdGhpcy5jb21taXRCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rIDogaG9va0Z1bmMgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1bnJlZ2lzdGVyIGNvbW1pdCBibG9jayBob29rXG4gICAqIEBwYXJhbSBuYW1lIGhvb2sgbmFtZVxuICAgKi9cbiAgcHVibGljIHVucmVnaXN0ZXJDb21taXRCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICAgXG5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmNvbW1pdEJsb2NrSG9va3MuZmluZEluZGV4KCBuaCA9PiBuaC5uYW1lID09PSBuYW1lLnRyaW0oKSApXG4gICAgaWYgKCBpbmRleCA+PSAwICkgdGhpcy5jb21taXRCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuICAvKipcbiAgICogcmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9vaywgd2hpY2ggd2lsbCBiZSBjYWxsZWQgYmVmb3JlIGNvbW1pdCBibG9ja1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICogQHBhcmFtIGhvb2tGdW5jIGhvb2sgZnVuY3Rpb24gLCAoIGZyb21IZWlnaHQsIHRvSGVpZ2h0ICkgPT4gdm9pZFxuICAgKi9cbiAgcHVibGljIHJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZywgaG9va0Z1bmM6IFJvbGxiYWNrQmxvY2tIb29rICkge1xuICAgIERCQy5hcmd1bWVudCggJ2hvb2tGdW5jJywgKCkgPT4gREJDLm5vdE51bGwoaG9va0Z1bmMpKVxuICAgIERCQy5hcmd1bWVudCggJ25hbWUnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShuYW1lKSkgICAgXG4gICAgREJDLmFyZ3VtZW50KCAnbmFtZScsIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmQobmg9Pm5oLm5hbWUgPT09IG5hbWUudHJpbSgpKSA9PT0gdW5kZWZpbmVkLCBcbiAgICAgIGBob29rIG5hbWVkICcke25hbWV9JyBleGlzdCBhbHJlYWR5YClcblxuICAgIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnB1c2goeyBuYW1lLCBob29rOiBob29rRnVuYyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIHVucmVnaXN0ZXIgcm9sbGJhY2sgYmxvY2sgaG9va1xuICAgKiBAcGFyYW0gbmFtZSBob29rIG5hbWVcbiAgICovXG4gIHB1YmxpYyB1bnJlZ2lzdGVyUm9sbGJhY2tCbG9ja0hvb2soIG5hbWU6IHN0cmluZyApIHtcbiAgICBEQkMuYXJndW1lbnQoICduYW1lJywgKCkgPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobmFtZSkpICBcblxuICAgIGxldCBpbmRleCA9IHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLmZpbmRJbmRleCggbmggPT4gbmgubmFtZSA9PT0gbmFtZS50cmltKCkgKVxuICAgIGlmICggaW5kZXggPj0gMCApIHRoaXMucm9sbGJhY2tCbG9ja0hvb2tzLnNsaWNlKCBpbmRleCApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBpbml0aWFsaXplIFNtYXJ0REIgLCB5b3UgbmVlZCBjYWxsIHRoaXMgYmVmb3JlIHVzZSBTbWFydERCXG4gICAqIEBwYXJhbSBzY2hlbWFzIHRhYmxlIHNjaGVtYXMgaW4gRGF0YWJhc2VcbiAgICovXG4gIHB1YmxpYyBhc3luYyBpbml0KHNjaGVtYXMgOiBBcnJheTxNb2RlbFNjaGVtYT4pIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzY2hlbWFzJywgKCk9PiBEQkMubm90TnVsbChzY2hlbWFzKSlcblxuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5jb25uZWN0KCkgICAgXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLm9wZW4oKVxuXG4gICAgZm9yKCBjb25zdCBzY2hlbWEgb2Ygc2NoZW1hcyApIHtcbiAgICAgIHRoaXMuc2NoZW1hcy5zZXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYSApXG4gICAgICBsZXQgc2Vzc2lvbiA9IHRoaXMuZ2V0U2Vzc2lvbiggc2NoZW1hIClcblxuICAgICAgc2Vzc2lvbi5yZWdpc3RlclNjaGVtYShzY2hlbWEpXG4gICAgICBhd2FpdCBzZXNzaW9uLnN5bmNTY2hlbWEoc2NoZW1hKVxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgc3luYyBzY2hlbWEgbW9kZWwgPSAke3NjaGVtYS5tb2RlbE5hbWV9IGApXG5cbiAgICAgIGlmICggc2NoZW1hLm1lbUNhY2hlZCApIHsgXG4gICAgICAgIGxldCBpdGVtcyA9IGF3YWl0IHNlc3Npb24uZ2V0TWFueSggc2NoZW1hLm1vZGVsTmFtZSwge30sIGZhbHNlLCB0cnVlIClcbiAgICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgbW9kZWwgJHtzY2hlbWEubW9kZWxOYW1lfSBjYWNoZWQgJHtpdGVtcy5sZW5ndGh9IGVudGl0aWVzIGApXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZW1pdCggJ3JlYWR5JywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogZnJlZSByZXNvdXJjZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLmNsb3NlKClcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIuY2xvc2UoKVxuICAgIFxuICAgIHRoaXMuZW1pdCgnY2xvc2VkJywgdGhpcyApXG4gIH1cblxuICAvKipcbiAgICogaGVpZ2h0IG9mIGxhc3QgYmxvY2tcbiAgICovXG4gIHB1YmxpYyBnZXQgbGFzdEJsb2NrSGVpZ2h0KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmJsb2NrREIubGFzdEJsb2NrSGVpZ2h0XG4gIH1cblxuICAvKipcbiAgICogYmxvY2tzIGNvdW50XG4gICAqL1xuICBwdWJsaWMgZ2V0IGJsb2Nrc0NvdW50KCkgOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodCArIDFcbiAgfVxuXG4gIC8qKlxuICAgKiBsYXN0IGNvbW1pdGVkIGJsb2NrXG4gICAqL1xuICBwdWJsaWMgZ2V0IGxhc3RCbG9jaygpIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICAvLyBUT0RPOiByZXR1cm4gbGFzdCBibG9jayBjb3B5ID9cbiAgICByZXR1cm4gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCApXG4gIH1cblxuICAvKipcbiAgICogaG9sZCBhIGxvY2sgbmFtZSB3aGljaCBvbmx5IHN1Y2NlZWQgaW4gZmlyc3QgdGltZSBvZiBlYWNoIGJsb2NrLlxuICAgKiBAcGFyYW0gbG9ja05hbWUgbG9jayBuYW1lXG4gICAqIEBwYXJhbSBub3RUaHJvdyBkbyBub3QgdGhyb3cgZXhjZXB0aW9uIGlmIGxvY2sgZmFpbGVkXG4gICAqL1xuICBwdWJsaWMgbG9ja0luQ3VycmVudEJsb2NrKCBsb2NrTmFtZTogc3RyaW5nLCBub3RUaHJvdyA9IGZhbHNlICkgOiBib29sZWFuIHtcbiAgICBpZiAoICF0aGlzLmhvbGRMb2Nrcy5oYXMoIGxvY2tOYW1lICkgKSB7XG4gICAgICB0aGlzLmhvbGRMb2Nrcy5hZGQoIGxvY2tOYW1lIClcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKCAhbm90VGhyb3cgKSB0aHJvdyBuZXcgRXJyb3IoYCR7bG9ja05hbWV9IGV4aXN0cyBhbHJlYWR5YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBcbiAgLyoqXG4gICAqIGJlZ2luIGEgbmV3IGJsb2NrXG4gICAqIEBwYXJhbSBibG9ja0hlYWRlciBcbiAgICovXG4gIHB1YmxpYyBiZWdpbkJsb2NrKCBibG9jazogQmxvY2sgKSA6IHZvaWQge1xuICAgIC8vIFRPRE86IHZlcmlmeSBibG9ja0hlYWRlciBoZXJlXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsICgpPT4gREJDLm5vdE51bGwoYmxvY2spKVxuICAgIERCQy5hcmd1bWVudCgnYmxvY2snLCBibG9jay5oZWlnaHQgPT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMSwgYGludmFsaWQgYmxvY2sgaGVpZ2h0ICR7YmxvY2suaGVpZ2h0fSwgbGFzdCA9ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcbiAgICBcbiAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBCRUdJTiBibG9jayBoZWlnaHQgPSAke2Jsb2NrLmhlaWdodH1gKVxuICAgIHRoaXMuY3VycmVudEJsb2NrID0gYmxvY2tcbiAgfVxuXG4gIC8qKlxuICAgKiBjb21taXQgYmxvY2sgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNvbW1pdEJsb2NrKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICghdGhpcy5jdXJyZW50QmxvY2spIHRocm93IG5ldyBFcnJvcignQ3VycmVudCBibG9jayBpcyBudWxsJylcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIGNvbW1pdEJsb2NrIGhlaWdodCA9ICR7dGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0fWApXG4gICAgLy8gZm9yIGhvb2tcbiAgICB0aGlzLnByZUNvbW1pdEJsb2NrKCB0aGlzLmN1cnJlbnRCbG9jayApXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBPYmplY3QuYXNzaWduKCB7fSwgdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgIFJlZmxlY3QuZGVsZXRlUHJvcGVydHkoYmxvY2tIZWFkZXIsICd0cmFuc2FjdGlvbnMnKVxuICAgIFxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5hcHBlbmRCbG9jayggYmxvY2tIZWFkZXIsIHRoaXMuYmxvY2tTZXNzaW9uLmdldENoYW5nZXMoKSApXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnNhdmVDaGFuZ2VzKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgKVxuICAgICAgdGhpcy5ibG9ja1Nlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCB0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeUZvclJvbGxiYWNrISApXG4gICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5wdXQoIHRoaXMuY3VycmVudEJsb2NrIClcbiAgICAgIHRoaXMuY3VycmVudEJsb2NrID0gbnVsbFxuICAgICAgLy8gZW1pdCBldmVudFxuICAgICAgdGhpcy5wb3N0Q29tbWl0QmxvY2soIHRoaXMubGFzdEJsb2NrISApXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIGNvbW1pdEJsb2NrIGhlaWdodCA9ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcbiAgICAgIHJldHVybiB0aGlzLmxhc3RCbG9ja0hlaWdodFxuICAgIH1cbiAgICBjYXRjaCggZXJyICkgeyBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCBjb21taXRCbG9jayAoIGhlaWdodCA9ICR7dGhpcy5jdXJyZW50QmxvY2shLmhlaWdodH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5kZWxldGVMYXN0QmxvY2sodGhpcy5jdXJyZW50QmxvY2suaGVpZ2h0KVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGJsb2NrIGNoYW5nZXNcbiAgICogQHBhcmFtIGhlaWdodCByb2xsYmFjayB0byBoZWlnaHQoZXhjbHVkZSlcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0Jsb2NrKCBoZWlnaHQ/OiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgIWhlaWdodCB8fCBoZWlnaHQgPD0gdGhpcy5sYXN0QmxvY2tIZWlnaHQsIFxuICAgICAgYGhlaWdodCBtdXN0IGxlc3Mgb3IgZXF1YWwgbGFzdEJsb2NrSGVpZ2h0ICR7dGhpcy5sYXN0QmxvY2tIZWlnaHR9YClcblxuICAgIGNvbnN0IGZyb21IZWlnaHQgPSB0aGlzLmN1cnJlbnRCbG9jayA/IHRoaXMuY3VycmVudEJsb2NrIS5oZWlnaHQgOiB0aGlzLmxhc3RCbG9ja0hlaWdodFxuICAgIGNvbnN0IHRvSGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICAvLyBmb3IgaG9va1xuICAgIHRoaXMucHJlUm9sbGJhY2tCbG9jayggZnJvbUhlaWdodCwgIHRvSGVpZ2h0IClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIC0gMSApXG4gICAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tDaGFuZ2VzKCB0b0hlaWdodCApXG4gICAgICB3aGlsZSggdGhpcy5sYXN0QmxvY2tIZWlnaHQgPiB0b0hlaWdodCApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5ldml0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCwgdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICAvLyBlbWl0IGV2ZW50XG4gICAgICB0aGlzLnBvc3RSb2xsYmFja0Jsb2NrKCBmcm9tSGVpZ2h0LCAgdG9IZWlnaHQgKSAgICAgIFxuICAgICAgdGhpcy5sb2cuaW5mb0VuYWJsZWQgJiYgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYClcbiAgICB9XG4gICAgY2F0Y2goIGVyciApIHtcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKGBGQUlMRCByb2xsYmFja0Jsb2NrICggaGVpZ2h0IDogJHtmcm9tSGVpZ2h0fSAtPiAke3RvSGVpZ2h0fSApYCwgZXJyKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHNhdmUgbG9jYWwgdGFibGVzIChub3QgaW4gYmxvY2sgLS0tIHdoaWNoIGRlZmluZSBpbiBzY2hlbWEgYnkgbG9jYWwgOiB0cnVlKSBjaGFuZ2VzIHRvIGRhdGFiYXNlXG4gICAqIEByZXR1cm5zIHNlcmlhbCBudW1iZXIgZm9yIGNoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyBzYXZlTG9jYWxDaGFuZ2VzKCkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBzZXJpYWwgPSBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5zYXZlQ2hhbmdlcygpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWwgKVxuICAgIHJldHVybiBzZXJpYWxcbiAgfVxuXG4gIC8qKlxuICAgKiByb2xsYmFjayBsb2NhbCB0YWJsZXMgY2hhbmdlcyBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqIEBwYXJhbSBzZXJpYWwgc2VyaWFsIG51bWJlciByZXR1cm4gZnJvbSBzYXZlTG9jYWxDaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgcm9sbGJhY2tMb2NhbENoYW5nZXMoc2VyaWFsOiBudW1iZXIpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdzZXJpYWwnLCBzZXJpYWwgPiAwLCBgc2VyaWFsIG11c3QgZ3JlYXQgdGhhbiB6ZXJvYCkgXG5cbiAgICBhd2FpdCB0aGlzLmxvY2FsU2Vzc2lvbi5yb2xsYmFja0NoYW5nZXMoc2VyaWFsKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uLmNsZWFySGlzdG9yeUJlZm9yZShzZXJpYWwpXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGVudGl0eSBrZXlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgZ2V0RW50aXR5S2V5PFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKTogTWF5YmVVbmRlZmluZWQ8RW50aXR5S2V5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2VudGl0eScsICgpID0+IERCQy5ub3ROdWxsKGVudGl0eSkgKVxuICAgIFxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsLCB0cnVlKSFcbiAgICByZXR1cm4gc2NoZW1hLmdldEtleSggZW50aXR5IClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgdHJhY2tpbmcgZW50aXR5IGJ5IGtleSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleVxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBvciB1bmRlZmluZWRcbiAgICovXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpID0+IERCQy5ub3ROdWxsKGtleSkgKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hKS5hdHRhY2goIHNjaGVtYSwga2V5IClcbiAgfVxuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSBuZXcgZW50aXR5IHdoaWNoIGNoYW5nZSB3aWxsIGJlIHRyYWNrZWQgYW5kIHBlcnNpc3RlbnRlZCAoYnkgc2F2ZUNoYW5nZXMpIGF1dG9tYXRpY2FsbHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkgZW50aXR5IGtleSB3aGljaCB1bmlxdWVkIGluIGRhdGFiYXNlXG4gICAqIEBwYXJhbSBlbnRpdHkgcHJvdG90eXBlIGVudGl0eSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgY29weSB0byByZXN1bHQgZW50aXR5XG4gICAqIEByZXR1cm5zIHRyYWNraW5nIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGNyZWF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleU9yRW50aXR5OiBFbnRpdHlLZXkgfCBURW50aXR5KSA6IFRFbnRpdHkge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleU9yRW50aXR5JywgKCk9PiBEQkMubm90TnVsbChrZXlPckVudGl0eSkpXG4gICAgXG4gICAgbGV0IGtleSA6IEVudGl0eUtleVxuICAgIGxldCBlbnRpdHk6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+XG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSAsIHRydWUpIVxuXG4gICAgaWYgKCBpc1ByaW1pdGl2ZUtleSgga2V5T3JFbnRpdHkgKSB8fCBpc0NvbXBvc2l0ZUtleSgga2V5T3JFbnRpdHkgKSApIHsgXG4gICAgICBrZXkgPSBrZXlPckVudGl0eSBhcyBFbnRpdHlLZXkgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgZW50aXR5ID0ga2V5T3JFbnRpdHkgYXMgVEVudGl0eVxuICAgICAga2V5ID0gc2NoZW1hLmdldEtleShlbnRpdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmNyZWF0ZShtb2RlbCwga2V5LCBlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogdXBkYXRlIGEgZW50aXR5XG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbE5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gZW50aXR5IFxuICAgKi9cbiAgLy8gcHVibGljIHVwZGF0ZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApIDogdm9pZCB7XG4gIC8vICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpID0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgLy8gICBEQkMuYXJndW1lbnQoJ2VudGl0eScsIGVudGl0eSAmJiBFbnRpdHlQcm94eS5pc1Byb3hpZWQoZW50aXR5KSwgYGlzIG5vdCBhIHByb3hpZWQgb2JqZWN0YCApXG5cbiAgLy8gICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgLy8gICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkudXBkYXRlKGVudGl0eSlcbiAgLy8gfVxuXG4gIC8qKlxuICAgKiBkZWxldGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgdHJhY2tpbmcgZW50aXR5YCApXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSwgdHJ1ZSApXG4gICAgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmRlbGV0ZShlbnRpdHkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBjYWNoZSBhbmQgZGF0YWJhc2VcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2tleScsICgpPT4gREJDLm5vdE51bGwoa2V5KSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkubG9hZChtb2RlbCwga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gZGF0YWJhc2UgYnkgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcbiAgICBEQkMuYXJndW1lbnQoJ2NvbmRpdGlvbicsICgpPT4gREJDLm5vdE51bGwoY29uZGl0aW9uKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGxldCBpdGVtcyA9IGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRNYW55KG1vZGVsLCBjb25kaXRpb24pXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBjb25kaXRpb24gPSAnJHtKU09OLnN0cmluZ2lmeShjb25kaXRpb24pfScgKWApXG5cbiAgICByZXR1cm4gaXRlbXMubGVuZ3RoID09PSAwID8gdW5kZWZpbmVkIDogaXRlbXNbMF1cbiAgfVxuXG4gICAgLyoqXG4gICAqIGdldCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gZmluZCBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIGFuZCBjYWNoZSByZXN1bHQgaWYgdHJ1ZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldE1hbnk8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb246IFNxbENvbmRpdGlvbiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0TWFueShtb2RlbCwgY29uZGl0aW9uLCB0cmFjaylcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIG9ubHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0ga2V5IGtleSBvZiBlbnRpdHlcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKiBAcmV0dXJucyB0cmFja2VkIGVudGl0eSBmcm9tIGNhY2hlXG4gICAqL1xuICBwdWJsaWMgZ2V0Q2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgLCB0cmFjayA9IGZhbHNlICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkQ2FjaGVkKG1vZGVsLCBrZXksIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCBhbGwgY2FjaGVkIGVudGl0aWVzXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHRyYWNrIHRyYWNrIHJlc3VsdFxuICAgKi9cbiAgcHVibGljIGdldEFsbENhY2hlZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PiwgIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldEFsbENhY2hlZCggbW9kZWwsIGZpbHRlciwgdHJhY2sgKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqIEBwYXJhbSByZXN1bHRSYW5nZSBsaW1pdCBhbmQgb2Zmc2V0IG9mIHJlc3VsdHMgbnVtYmVyIG9yIGpzb24sIGVnOiAxMCBvciB7IGxpbWl0IDogMTAsIG9mZnNldCA6IDEgfSBcbiAgICogQHBhcmFtIHNvcnQganNvbiB7IGZpZWxkTmFtZSA6ICdBU0MnIHwgJ0RFU0MnIH0gLCBlZzogeyBuYW1lIDogJ0FTQycsIGFnZSA6ICdERVNDJyB9XG4gICAqIEBwYXJhbSBmaWVsZHMgcmVzdWx0IGZpZWxkcywgZGVmYXVsdCBpcyBhbGwgZmllbGRzXG4gICAqIEBwYXJhbSBvZmZzZXQgb2Zmc2V0IG9mIHJlc3VsdCBzZXQgIFxuICAgKiBAcGFyYW0gam9pbiBqb2luIGluZm8gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbiA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIFxuICAgIHNvcnQ/IDogU3FsT3JkZXIsIGZpZWxkcz8gOiBBcnJheTxzdHJpbmc+LCBqb2luPyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnkobW9kZWwsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGZpZWxkcywgam9pbilcbiAgfVxuXG5cbiAgLyoqXG4gICAqIGZpbmQgZW50aXRpZXMgZnJvbSBkYXRhYmFzZSBcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gcGFyYW1zIG1hbmdvIGxpa2UgcXVlcnkgcGFyYW1zIG9iamVjdFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGZpbmRPbmU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBwYXJhbXMgOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEVudGl0eT4+IHtcbiAgICBsZXQgaXRlbXMgPSBhd2FpdCB0aGlzLmZpbmRBbGwoIG1vZGVsLCBwYXJhbXMgKVxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIGlmICggaXRlbXMubGVuZ3RoID4gMSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtYW55IGVudGl0aWVzIGZvdW5kICggbW9kZWwgPSAnJHtzY2hlbWEhLm1vZGVsTmFtZX0nICwgcGFyYW1zID0gJyR7SlNPTi5zdHJpbmdpZnkocGFyYW1zKX0nIClgKVxuICAgIFxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZEFsbDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8RW50aXR5Pj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkucXVlcnlCeUpzb24oIG1vZGVsLCBwYXJhbXMgKVxuICB9XG5cblxuICAvKipcbiAgICogcXVlcnkgaWYgZXhpc3RzIHJlY29yZCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBleGlzdHM8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmV4aXN0cyhtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIGNvdW50IHJlY29yZHMgY291bnQgYnkgc3BlY2lmaWVkIGNvbmRpdGlvblxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBjb25kaXRpb24gcXVlcnkgY29uZGl0aW9uLCBzZWUgdHlwZSBTcWxDb25kaXRpb24gXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY291bnQ8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuY291bnQobW9kZWwsIGNvbmRpdGlvbilcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBhdHRhY2hUcmFuc2FjdGlvbnMoIGJsb2NrcyA6IEFycmF5PEJsb2NrSGVhZGVyPiwgIGdldFRyYW5zYWN0aW9uczogKCkgPT4gUHJvbWlzZTxBcnJheTxUcmFuc2FjdGlvbj4+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrPj4ge1xuICAgIGxldCB0cmFuc0dyb3VwID0gbmV3IE1hcDxzdHJpbmcsIEFycmF5PFRyYW5zYWN0aW9uPj4oKVxuICAgIGxldCB0cmFuc2FjdGlvbnMgPSBhd2FpdCBnZXRUcmFuc2FjdGlvbnMoKVxuXG4gICAgdHJhbnNhY3Rpb25zLmZvckVhY2goIHQgPT4ge1xuICAgICAgaWYgKCF0cmFuc0dyb3VwLmhhcyggdC5ibG9ja0lkICkpIHRyYW5zR3JvdXAuc2V0KCB0LmJsb2NrSWQsIG5ldyBBcnJheTxUcmFuc2FjdGlvbj4oKSApXG4gICAgICB0cmFuc0dyb3VwLmdldCggdC5ibG9ja0lkICkhLnB1c2goIHQgKVxuICAgIH0gKVxuXG4gICAgYmxvY2tzLmZvckVhY2goIGIgPT4gYlsndHJhbnNhY3Rpb25zJ10gPSB0cmFuc0dyb3VwLmdldChiLmlkISkgKVxuICAgIHJldHVybiBibG9ja3MgYXMgQXJyYXk8QmxvY2s+XG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBoZWlnaHRcbiAgICogQHBhcmFtIGhlaWdodCBibG9jayBoZWlnaHRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SGVpZ2h0KCBoZWlnaHQgOiBudW1iZXIsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPEJsb2NrPj4ge1xuICAgIERCQy5hcmd1bWVudCgnaGVpZ2h0JywgaGVpZ2h0ID49IDAgLCAnaGVpZ2h0IG11c3QgZ3JlYXQgb3IgZXF1YWwgemVybycpXG4gICAgXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KGhlaWdodClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2soIGhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBibG9jayBpZFxuICAgKiBAcGFyYW0gYmxvY2tJZCBibG9jayBpZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWQnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGJsb2NrSWQpKVxuXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0QnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtaW5IZWlnaHQsIG1heEhlaWdodCcsIG1pbkhlaWdodCA+IDAgJiYgbWF4SGVpZ2h0ID49IG1pbkhlaWdodCwgJ21pbkhlaWdodCBvciBtYXhIZWlnaHQgaXMgaW52YWxpZCcpXG5cbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCwgbWF4SGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBibG9jayBpZCBhcnJheVxuICAgKiBAcGFyYW0gYmxvY2tJZHMgYXJyYXkgb2YgYmxvY2sgaWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+LCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkcycsICgpID0+IERCQy5ub3ROdWxsKGJsb2NrSWRzKSApXG5cbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SWRzKGJsb2NrSWRzKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG59IiwiaW1wb3J0IHsgRW50aXR5LCAgTnVsbGFibGUgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgRW50aXR5VHJhY2tlciwgUHJveGllZEVudGl0eVRyYWNrZXIgfSBmcm9tICcuL0VudGl0eVRyYWNrZXInXG5cbi8qKiAgICAgXG4gKiAgICAgU1RBVEUgVFJBTlNGRVIgICAgICAgICAgICAgICAgICBBQ1RJT04gICAgICAgICAgICAgICAgVFJBQ0sgICAgICBDQUNIRVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgICA/ICAgICAgICAgLT4gcGVyc2l0ZW50ICAgICAgc2Vzc2lvbi5sb2FkICAgICAgICAgICAgIHRyYWNrICAgICBjYWNoZVxuICogICAgICA/ICAgICAgICAgLT4gbmV3ICAgICAgICAgICAgc2Vzc2lvbi5jcmVhdGUgICAgICAgICAgIHRyYWNrICAgICAgIC0gIFxuICogcGVyc2lzdGVudCAgICAgLT4gbW9kaWZpZWQgICAgICAgc2V0IHByb3BlcnR5ICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IGRlbGV0ZWQgICAgICAgIHNlc3Npb24uZGVsICAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBuZXcgfCBtb2RpZmllZCAtPiBwcmVzaXN0ZW50ICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAga2VlcCAgICAgY2FjaGV8dXBkYXRlIFxuICogZGVsZXRlZCAgICAgICAgLT4gdHJhbnNpZW50ICAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGV2aXQgICAgICAgZXZpdFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmV4cG9ydCBlbnVtIEVudGl0eVN0YXRlIHtcbiAgVHJhbnNpZW50ICA9IC0xLFxuICBQZXJzaXN0ZW50ID0gMCxcbiAgXG4gIE5ldyAgICAgICAgPSAxLFxuICBNb2RpZmllZCAgID0gMixcbiAgRGVsZXRlZCAgICA9IDMsXG59XG5cbmV4cG9ydCBlbnVtIEVudGl0eUNoYW5nZVR5cGUge1xuICBOZXcgICAgICAgPSAxLFxuICBNb2RpZnkgICAgPSAyLFxuICBEZWxldGUgICAgPSAzLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50IDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19zY2hlbWFfXyAgICAgOiBNb2RlbFNjaGVtYVxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX190bXBDaGFuZ2VzX18gOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlcjtcblxuICBjb25zdHJ1Y3Rvcih0cmFja2VyOiBFbnRpdHlUcmFja2VyKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0V4dGVuZGVkKGVudGl0eTogRW50aXR5KSB7XG4gICAgcmV0dXJuIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zY2hlbWFfXycpICYmIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zdGF0ZV9fJylcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNQcm94aWVkKGVudGl0eTogRW50aXR5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBFbnRpdHlQcm94eS5pc0V4dGVuZGVkKGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY29udmVydFRvUHJveGllZDxURW50aXR5PihlbnRpdHk6IEVudGl0eSkgOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgUHJveGllZCBFbnRpdHlgKVxuICAgIFxuICAgIHJldHVybiBlbnRpdHkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBwcm94eVRvRW50aXR5KHByb3hpZWQ6IFByb3hpZWQ8RW50aXR5Pik6IEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IHt9XG4gICAgZm9yKCBsZXQgayBpbiBwcm94aWVkICkge1xuICAgICAgaWYgKCBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGspICkgZW50aXR5W2tdID0gcHJveGllZFtrXVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlICkgOiBURW50aXR5IHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICBfdmVyc2lvbl8gICAgICA6IGVudGl0eVsnX3ZlcnNpb25fJ10gfHwgMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19zY2hlbWFfXyAgICAgOiBzY2hlbWEsXG4gICAgICBfX3RyYWNrZXJfXyAgICA6IHRoaXMudHJhY2tlciwgXG4gICAgICBfX3RyYWNraW5nX18gICA6IHRydWUsXG4gICAgICBfX3RtcENoYW5nZXNfXyA6IG51bGxcbiAgICB9LCBlbnRpdHkpXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSwgcmVjZWl2ZXI6IGFueSkgOiBib29sZWFuIHsgICAgICBcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWUudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eU5hbWVdICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJvcGVydHkgYWZ0ZXIgZGVsZXRlZGApXG4gICAgfVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSBleHQuX19zY2hlbWFfX1xuICAgIGlmICggc2NoZW1hLmlzUmVhZG9ubHkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHJlYWRvbmx5IG1vZGVsICcke3NjaGVtYS5tb2RlbE5hbWV9J2ApXG4gICAgfVxuXG4gICAgaWYgKCBzY2hlbWEucHJpbWFyeUtleSA9PT0gbmFtZSB8fCBzY2hlbWEuY29tcG9zaXRlS2V5cy5pbmRleE9mKG5hbWUpID49IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByaW1hcnkgZmllbGQgcHJvcGVydHlgKVxuICAgIH1cblxuICAgIGlmICggZXh0Ll9fZGV0YWNoZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyKS5hdHRhY2goIHJlY2VpdmVyIGFzIFByb3hpZWQ8YW55PiApXG4gICAgICBleHQuX19kZXRhY2hlZF9fID0gZmFsc2VcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBleHQuX190bXBDaGFuZ2VzX18gPSB7ICAgICAgICBcbiAgICAgICAgdHlwZSA6IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5LCAgICAgICAgXG4gICAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyxcbiAgICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KHsgXG4gICAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgICB9XG5cbiAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgKTogUHJveGllZDxURW50aXR5PiB7XG4gICAgbGV0IGV4dGVuZGVkID0gIHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyhlbnRpdHksIHNjaGVtYSwgRW50aXR5U3RhdGUuUGVyc2lzdGVudCApXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnO1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJztcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nO1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcykgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbn1cblxuLy8gZXhwb3J0IGNsYXNzIE1vZGVsQW5kS2V5IHtcbi8vICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbW9kZWxBbmRLZXlTZXBhcmF0b3IgPSAnISMhJ1xuXG4vLyAgIHByaXZhdGUgbW9kZWxOYW1lIDogc3RyaW5nXG4vLyAgIHByaXZhdGUgZW50aXR5S2V5IDogRW50aXR5S2V5XG5cbi8vICAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkge1xuLy8gICAgIHRoaXMubW9kZWxOYW1lID0gbW9kZWxcbi8vICAgICB0aGlzLmVudGl0eUtleSA9IGtleVxuLy8gICB9XG5cbi8vICAgcHVibGljIGdldCBtb2RlbCgpIHsgcmV0dXJuIHRoaXMubW9kZWxOYW1lIH1cbi8vICAgcHVibGljIGdldCBrZXkoKSB7IHJldHVybiB0aGlzLmVudGl0eUtleSB9XG5cbi8vICAgcHVibGljIHRvU3RyaW5nKCkge1xuLy8gICAgIHJldHVybiBcbi8vICAgfVxuLy8gfVxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcblxuZXhwb3J0IHR5cGUgRW50aXR5Q2hhbmdlc0l0ZW0gPSB7IG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXksIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5cbmV4cG9ydCBjbGFzcyBQcm94aWVkRW50aXR5VHJhY2tlciBpbXBsZW1lbnRzIEVudGl0eVRyYWNrZXIgeyAgXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgcHJveHkgOiBFbnRpdHlQcm94eVxuICBwcml2YXRlIGNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBtaW5WZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY3VycmVudFZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhY2hlOiBFbnRpdHlDYWNoZSkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoUHJveGllZEVudGl0eVRyYWNrZXIubmFtZSlcbiAgICB0aGlzLnByb3h5ID0gbmV3IEVudGl0eVByb3h5KHRoaXMpXG4gICAgdGhpcy5jYWNoZSA9IGNhY2hlXG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcbiAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IC0xXG4gICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IC0xXG4gIH1cblxuICBwcm90ZWN0ZWQgZW5zdXJlTm9UcmFja2luZyggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkgKSB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgbW9kZWw9JHtzY2hlbWEubW9kZWxOYW1lfSBrZXk9JHtzY2hlbWEuZ2V0S2V5KGVudGl0eSl9IGlzIHRyYWNraW5nYClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIG1ha2VNb2RlbEFuZEtleShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IE1vZGVsQW5kS2V5IHtcbiAgICBsZXQgbWsgPSB7IG06IHNjaGVtYS5tb2RlbE5hbWUsIGs6IGtleX1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIG1rIClcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5IH0ge1xuICAgIGxldCBtayA9IEpTT04ucGFyc2UoIG1vZGVsQW5kS2V5IClcbiAgICBsZXQga2V5ID0gaXNTdHJpbmcobWsuaykgfHwgaXNOdW1iZXIobWsuaykgPyBtay5rIDogbmV3IENvbXBvc2l0ZUtleShtay5rLmtleU9iamVjdClcbiAgICByZXR1cm4geyBtb2RlbCA6IG1rLm0sIGtleToga2V5IH1cbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRIaXN0b3J5QnlWZXJzaW9uKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlICk6IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghdGhpcy5oaXN0b3J5LmhhcyhoaXN0b3J5VmVyc2lvbikgJiYgY3JlYXRlSWZOb3RFeGlzdHMgKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldChoaXN0b3J5VmVyc2lvbiwgbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKSlcblxuICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2V0KGhpc3RvcnlWZXJzaW9uKSFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRNb2RlbEFuZEtleSggcGU6IFByb3hpZWQ8YW55PiApOiBNb2RlbEFuZEtleSB7XG4gICAgcmV0dXJuIHRoaXMubWFrZU1vZGVsQW5kS2V5KHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgfVxuXG4gIHByb3RlY3RlZCBzYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMsIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKSA6IHZvaWQge1xuICAgIHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbihoaXN0b3J5VmVyc2lvbiwgdHJ1ZSkuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlcylcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSlcbiAgfVxuICBcbiAgcHVibGljIGdldExhc3RDaGFuZ2VzKCBwZTogUHJveGllZDxhbnk+ICkgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBcbiAgICAgICAgcmV0dXJuIHBlLl9fdG1wQ2hhbmdlc19fIVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4oKVxuICAgIGxldCB0bXBWZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuXG4gICAgd2hpbGUgKCB0bXBWZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uICkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odG1wVmVyc2lvbilcbiAgICAgIGhpc3RvcnkgJiYgcmVzdWx0LnB1c2goaGlzdG9yeSkgICAgICBcbiAgICAgIHRtcFZlcnNpb24tLVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRyYWNraW5nRW50aXRpZXMoKSA6IEl0ZXJhYmxlPEVudGl0eT4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMudmFsdWVzKClcbiAgfVxuXG4gIHB1YmxpYyBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXMoIHRoaXMubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIGtleSkgKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApOiBNYXliZVVuZGVmaW5lZDxQcm94aWVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIGtleSlcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkgPyB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZ2V0KHRyYWNraW5nS2V5KSBhcyBQcm94aWVkPFRFbnRpdHk+IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgdHJhY2tOZXc8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7IFxuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5TmV3KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICB9IFxuICAgIGVsc2UgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgIC8vIFRPRE86IOWFiOS/ruaUueWGjeWIoOmZpO+8jOmcgOimgeaBouWkjeWIsOS7gOS5iOeKtuaAge+8n1xuICAgICAgcHJveGllZC5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdHJhY2tQZXJzaXN0ZW50PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkge1xuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5UGVyc2lzdGVudChlbnRpdHksIHNjaGVtYSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZGVsZXRlKHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2tBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0NoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgbW9kZWxBbmRLZXkgOiB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSkgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBkZXRlY3RDaGFuZ2VzKCkgOiBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBlbnRpdHk6IHBlLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKX0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKGVudGl0eTogRW50aXR5LCBkYlZlcnNpb246IG51bWJlciwgaXNOZXcgPSB0cnVlKSA6IEVudGl0eUNoYW5nZXMge1xuICAgIGxldCBwcm9wZXJpdGVzQ2hhbmdlID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZW50aXR5KSB7XG4gICAgICBpZiAoIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoa2V5KSkgY29udGludWVcbiAgICAgIHByb3Blcml0ZXNDaGFuZ2UucHVzaCggaXNOZXcgPyBcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiB1bmRlZmluZWQsIGN1cnJlbnQ6IGVudGl0eVtrZXldIH0gOlxuICAgICAgICB7IG5hbWU6IGtleSwgb3JpZ2luYWw6IGVudGl0eVtrZXldLCBjdXJyZW50OiAgdW5kZWZpbmVkIH0gICAgICAgXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGUgOiBpc05ldyA/IEVudGl0eUNoYW5nZVR5cGUuTmV3IDogRW50aXR5Q2hhbmdlVHlwZS5EZWxldGUsXG4gICAgICBkYlZlcnNpb246IGRiVmVyc2lvbiwgICAgICBcbiAgICAgIHByb3BlcnRpZXNDaGFuZ2VzIDogcHJvcGVyaXRlc0NoYW5nZVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBtYXJrU3RhdGVBbmRTYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKTogdm9pZCB7XG4gICAgc3dpdGNoKHBlLl9fc3RhdGVfXykge1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgTkVXIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBlbnRpdHkgPSAke0pTT04uc3RyaW5naWZ5KEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpKX1gKVxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBERUxFVEUgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIGZhbHNlKSwgaGlzdG9yeVZlcnNpb24pXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBNT0RJRklFRCBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gY2hhbmdlcyA9ICR7SlNPTi5zdHJpbmdpZnkocGUuX190bXBDaGFuZ2VzX18pfWApXG4gICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgcGUuX190bXBDaGFuZ2VzX18hLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgIGJyZWFrXG4gICAgICAvLyBvdGhlcndpc2UgZG8gbm90aGluZyBcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuVHJhbnNpZW50OiBcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWNjZXB0Q2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWQge1xuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gYWNjZXB0Q2hhbmdlcyBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHBlLl9fc2NoZW1hX19cbiAgICAgIGlmIChwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwZS5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkKSBcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSksIEVudGl0eVByb3h5LnByb3h5VG9FbnRpdHkocGUpIClcbiAgICAgIGVsc2UgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuRGVsZXRlZClcbiAgICAgICAgdGhpcy5jYWNoZS5ldml0KHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkocGUpKVxuICAgICAgLy8gZWxzZSAndHJhbnNpZW50JyB8ICdwZXJzaXN0ZW50JyBkbyBub3RoaW5nXG4gICAgICB0aGlzLm1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5KHBlLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gPSBoaXN0b3J5VmVyc2lvblxuICAgICAgcGUuX19kZXRhY2hlZF9fID0gdHJ1ZVxuICAgIH0pICBcbiAgICBcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIHRoaXMubWluVmVyc2lvbiA9IHRoaXMubWluVmVyc2lvbiA9PT0gLTEgPyBoaXN0b3J5VmVyc2lvbiA6IHRoaXMubWluVmVyc2lvblxuICAgIFxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG4gIH1cbiAgXG4gIHByb3RlY3RlZCByb2xsYmFja0NhY2hlQ2hhbmdlcyggbW9kZWw6IHN0cmluZywga2V5OiBFbnRpdHlLZXksIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMgKTogdm9pZCB7XG4gICAgc3dpdGNoKGNoYW5nZXMudHlwZSkge1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldyA6IFxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQobW9kZWwsIGtleSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5Nb2RpZnk6XG4gICAgICAgIGxldCBlID0gdGhpcy5jYWNoZS5nZXQoIG1vZGVsLCBrZXkgKVxuICAgICAgICBpZiAoIGUgPT09IHVuZGVmaW5lZCApIHJldHVyblxuICAgICAgICBjaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2goIGMgPT4gZSFbYy5uYW1lXSA9IGMub3JpZ2luYWwgKVxuICAgICAgICB0aGlzLmNhY2hlLnB1dCggbW9kZWwsIGtleSwgZSApXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuRGVsZXRlOiBcbiAgICAgICAgY29uc3QgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGMgPT4gYy5uYW1lLCBjID0+IGMub3JpZ2luYWwpXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlbnRpdHkgKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RDaGFuZ2VzKCk6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3OlxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlRyYW5zaWVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQ6XG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gZmFsc2VcbiAgICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyEucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBwZVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgICAgcGUuX190cmFja2luZ19fID0gdHJ1ZVxuICAgICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fID0gbnVsbFxuICAgICAgICAgIHBlLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLlBlcnNpc3RlbnRcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQ6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuUGVyc2lzdGVudDpcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6XG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHJlamVjdENoYW5nZXMgVmVyc2lvbiA9ID9gKVxuICB9XG4gIFxuICBwdWJsaWMgcm9sbGJhY2tDaGFuZ2VzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IGZyb20gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHtoaXN0b3J5VmVyc2lvbn1gKVxuXG4gICAgdGhpcy5yZWplY3RDaGFuZ2VzKClcbiAgICB3aGlsZSggaGlzdG9yeVZlcnNpb24gPD0gdGhpcy5jdXJyZW50VmVyc2lvbiApIHtcbiAgICAgIGNvbnN0IGNoYW5nZXNNYXAgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICAgIGNoYW5nZXNNYXAgJiYgY2hhbmdlc01hcC5mb3JFYWNoKCAoIGNoYW5nZXMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKSBcbiAgICAgICAgdGhpcy5yb2xsYmFja0NhY2hlQ2hhbmdlcyhtay5tb2RlbCwgbWsua2V5LCBjaGFuZ2VzKVxuICAgICAgfSlcbiAgICAgIHRoaXMuY3VycmVudFZlcnNpb24gLS1cbiAgICB9XG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4gcGUuX19kZXRhY2hlZF9fID0gdHJ1ZSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IE1hdGgubWluKHRoaXMubWluVmVyc2lvbiwgdGhpcy5jdXJyZW50VmVyc2lvbilcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1Mgcm9sbGJhY2tDaGFuZ2VzIFZlcnNpb24gOiAke2Zyb219IC0+ICR7dGhpcy5jdXJyZW50VmVyc2lvbn1gKVxuICB9XG5cbiAgcHVibGljIGNsZWFySGlzdG9yeSggaGlzdG9yeVZlcnNpb24gOiBudW1iZXIgKSB7XG4gICAgaWYgKCB0aGlzLm1pblZlcnNpb24gPj0gaGlzdG9yeVZlcnNpb24gfHwgdGhpcy5jdXJyZW50VmVyc2lvbiA8IGhpc3RvcnlWZXJzaW9uICkgcmV0dXJuXG4gICAgZm9yKCBsZXQgdmVyID0gdGhpcy5taW5WZXJzaW9uOyB2ZXIgPCBoaXN0b3J5VmVyc2lvbjsgdmVyKysgKSB7XG4gICAgICB0aGlzLmhpc3RvcnkuZGVsZXRlKHZlcilcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGR1bXBDaGFuZ2VzKCBlYzogRW50aXR5Q2hhbmdlcyApOiBzdHJpbmcge1xuICAgIGxldCBwcm9wZXJ0eUNoYW5nZXMgPSAnJ1xuICAgIGVjLnByb3BlcnRpZXNDaGFuZ2VzLmZvckVhY2gocGMgPT4gcHJvcGVydHlDaGFuZ2VzICs9IGAke3BjLm5hbWV9OiAke3BjLm9yaWdpbmFsfSAtPiAke3BjLmN1cnJlbnR9LCBgKVxuXG4gICAgcmV0dXJuIGBkYlZlcnNpb249JHtlYy5kYlZlcnNpb259LCB0eXBlPSR7ZWMudHlwZX0sIFske3Byb3BlcnR5Q2hhbmdlc31dYFxuICB9XG5cbiAgcHVibGljIGR1bXBIaXN0b3J5KCkgOiBzdHJpbmcge1xuICAgIGxldCB2ZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgSElTVE9SWSAgLS0tLS0tLS0tLS0tLS0tLVxcblxcbmAgXG4gICAgd2hpbGUoIHZlcnNpb24gPj0gdGhpcy5taW5WZXJzaW9uICkge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLXZlcnNpb24gJHt2ZXJzaW9ufS0tLS0tLS0tLS0tLS0tLS1cXG5gIFxuICAgICAgbGV0IGhpcyA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbiggdmVyc2lvbiApXG4gICAgICBoaXMgJiYgaGlzLmZvckVhY2goICggZWMsIG1vZGVsQW5kS2V5ICkgPT4ge1xuICAgICAgICBsZXQgY2hhbmdlcyA9IHRoaXMuZHVtcENoYW5nZXMoIGVjIClcbiAgICAgICAgY29uc3QgbWsgPSB0aGlzLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgICAgY29uc3QgbXNnID0gYHR5cGU9JHttay5tb2RlbH0sIGtleT0ke21rLmtleX0sIGNoYW5nZXM9eyR7Y2hhbmdlc319IFxcbmBcbiAgICAgICAgcmVzdWx0ICs9IG1zZ1xuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgICAgdmVyc2lvbi0tXG4gICAgfSAgICBcbiAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tICAgRU5EICAgRFVNUCAgLS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFja2VyU3FsQnVpbGRlciB7XG4gIHByaXZhdGUgdHJhY2tlcjogUHJveGllZEVudGl0eVRyYWNrZXJcbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXJcblxuICBwdWJsaWMgY29uc3RydWN0b3IoIHRyYWNrZXIgOiBQcm94aWVkRW50aXR5VHJhY2tlciwgbW9kZWxzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+LCBzcWxCdWlsZGVyOiBTcWxCdWlsZGVyICkge1xuICAgIHRoaXMudHJhY2tlciA9IHRyYWNrZXJcbiAgICB0aGlzLm1vZGVscyA9IG1vZGVsc1xuICAgIHRoaXMuc3FsQnVpbGRlciA9IHNxbEJ1aWxkZXJcbiAgfVxuICBcbiAgcHVibGljIGdldCBlbnRpdHlUcmFja2VyKCkgeyByZXR1cm4gdGhpcy50cmFja2VyIH1cblxuICBwdWJsaWMgYnVpbGRDaGFuZ2VTcWxzKCkgOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmRldGVjdENoYW5nZXMoKS5mb3JFYWNoKCBlYyA9PiB7XG4gICAgICByZXN1bHQucHVzaCggdGhpcy5idWlsZFNxbEFuZFBhcmFtZXRlcnMoZWMuZW50aXR5KSApXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgYnVpbGRTcWxBbmRQYXJhbWV0ZXJzKHBlIDpQcm94aWVkPGFueT4pIDogU3FsQW5kUGFyYW1ldGVycyB7XG4gICAgY29uc3QgZW50aXR5ID0gRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSlcbiAgICBcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldyA6XG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRJbnNlcnQoIHBlLl9fc2NoZW1hX18sIGVudGl0eSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOlxuICAgICAgICBsZXQgZW50aXR5Q2hhbmdlcyA9IHRoaXMudHJhY2tlci5nZXRMYXN0Q2hhbmdlcyhwZSkhXG4gICAgICAgIGxldCBjaGFuZ2VzID0gbWFrZUpzb25PYmplY3QoIGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMgLCBjPT4gYy5uYW1lLCBjPT4gYy5jdXJyZW50IClcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShwZS5fX3NjaGVtYV9fLCBwZS5fX3NjaGVtYV9fLmdldEtleShwZSksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uIC0gMSApXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLkRlbGV0ZWQgOlxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgICAgIGRlZmF1bHQgOiBcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGVudGl0eSBzdGF0ZSAnJHtwZS5fX3N0YXRlX199J2ApXG4gICAgfVxuICB9XG5cbiAgcHVibGljIGJ1aWxkUm9sbGJhY2tDaGFuZ2VTcWxzKCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApOiBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxTcWxBbmRQYXJhbWV0ZXJzPigpXG4gICAgdGhpcy50cmFja2VyLmdldENoYW5nZXNVbnRpbCggaGlzdG9yeVZlcnNpb24gKS5mb3JFYWNoKCBoaXMgPT4gaGlzLmZvckVhY2goICggZW50aXR5Q2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICBjb25zdCBtayA9IHRoaXMudHJhY2tlci5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApXG4gICAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQobWsubW9kZWwpXG4gICAgICBzd2l0Y2goZW50aXR5Q2hhbmdlcy50eXBlKSB7XG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5OZXc6XG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkRGVsZXRlKHNjaGVtYSEsIG1rLmtleSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTogXG4gICAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdChlbnRpdHlDaGFuZ2VzLnByb3BlcnRpZXNDaGFuZ2VzLCBjPT4gYy5uYW1lLCBjPT4gYy5vcmlnaW5hbClcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGRVcGRhdGUoc2NoZW1hISwgbWsua2V5LCBjaGFuZ2VzLCBlbnRpdHlDaGFuZ2VzLmRiVmVyc2lvbiApKVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6XG4gICAgICAgICAgbGV0IGVudGl0eSA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydChzY2hlbWEhLCBlbnRpdHkpKVxuICAgICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfSkpXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbn1cblxuXG5cblxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmV0dGVyLXNxbGl0ZTNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY2hhbmdlLWNhc2VcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZXZlbnRzXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImpzb24tc3FsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXNlY29uZGFyeVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJsZXZlbC1zdWJsZXZlbFwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJscnUtY2FjaGVcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwidXRpbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9