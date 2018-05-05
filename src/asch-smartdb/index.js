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
            filter && filter(e) && result.push(e);
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
                session.registerSchema(schema);
                yield session.syncSchema(schema);
                this.log.infoEnabled && this.log.info(`sync schema model = ${schema.modelName} `);
                if (schema.memCached) {
                    let items = yield session.getMany(schema.modelName, {}, false, true);
                    this.log.infoEnabled && this.log.info(`model ${schema.modelName} cached ${items.length} entities `);
                }
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
        return this.blockDB.lastBlockHeight;
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
            let blockHeader = Object.assign({}, this.currentBlock);
            Reflect.deleteProperty(blockHeader, 'transactions');
            yield this.blockDB.appendBlock(blockHeader, this.blockSession.getChanges());
            try {
                yield this.blockSession.saveChanges(this.currentBlock.height);
                this.blockSession.clearHistoryBefore(this.currentBlock.height - this.options.historyForRollback);
                this.cachedBlocks.put(this.currentBlock);
                this.currentBlock = null;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0Jsb2NrQ2FjaGUudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0NvbW1vbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvRGJTZXNzaW9uLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9FbnRpdHlDYWNoZS50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvSW5kZXgudHMiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiLy4vc3JjL0tWREIvTGV2ZWxEQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTGV2ZWxCbG9jay50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvTG9nLnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9Nb2RlbC50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsQnVpbGRlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlQ29ubmVjdGlvbi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU1FMREIvU3FsaXRlV3JhcHBlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU21hcnREQi50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvLi9zcmMvU3RhdGVUcmFja2VyL0VudGl0eVByb3h5LnRzIiwid2VicGFjazovL2FzY2gtc21hcnRkYi8uL3NyYy9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlci50cyIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJiZXR0ZXItc3FsaXRlM1wiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImNoYW5nZS1jYXNlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwiZXZlbnRzXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwianNvbi1zcWxcIiIsIndlYnBhY2s6Ly9hc2NoLXNtYXJ0ZGIvZXh0ZXJuYWwgXCJsZXZlbFwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXNlY29uZGFyeVwiIiwid2VicGFjazovL2FzY2gtc21hcnRkYi9leHRlcm5hbCBcImxldmVsLXN1YmxldmVsXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwibHJ1LWNhY2hlXCIiLCJ3ZWJwYWNrOi8vYXNjaC1zbWFydGRiL2V4dGVybmFsIFwidXRpbFwiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlEQUFpRCxjQUFjO0FBQy9EOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ3RFQTtJQU1FLFlBQW9CLGNBQXVCO1FBTG5DLFVBQUssR0FBRyxJQUFJLEdBQUcsRUFBaUI7UUFDaEMsY0FBUyxHQUFZLENBQUMsQ0FBQztRQUN2QixjQUFTLEdBQVksQ0FBQyxDQUFDO1FBSTdCLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYztJQUN0QyxDQUFDO0lBRU0sUUFBUSxDQUFFLE1BQWM7UUFDN0IsT0FB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QUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekQsTUFBSztnQkFDUCxLQUFLLDhCQUFnQixDQUFDLE1BQU07b0JBQzFCLElBQUksT0FBTyxHQUFHLHVCQUFjLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztvQkFDekYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFPLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLFNBQVMsQ0FBRSxDQUFDO29CQUM1RixNQUFLO2dCQUNQLEtBQUssOEJBQWdCLENBQUMsTUFBTTtvQkFDMUIsSUFBSSxNQUFNLEdBQUcsdUJBQWMsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO29CQUN4RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDekQsTUFBSzthQUNSO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU07SUFDZixDQUFDO0NBRUY7QUE3REQsOENBNkRDOzs7Ozs7Ozs7Ozs7QUN6YkQsMkM7Ozs7Ozs7Ozs7O0FDQUEsd0M7Ozs7Ozs7Ozs7O0FDQUEsbUM7Ozs7Ozs7Ozs7O0FDQUEscUM7Ozs7Ozs7Ozs7O0FDQUEsa0M7Ozs7Ozs7Ozs7O0FDQUEsNEM7Ozs7Ozs7Ozs7O0FDQUEsMkM7Ozs7Ozs7Ozs7O0FDQUEsc0M7Ozs7Ozs7Ozs7O0FDQUEsaUMiLCJmaWxlIjoiYXNjaC1zbWFydGRiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyB3YXNtIG1vZHVsZXNcbiBcdHZhciBpbnN0YWxsZWRXYXNtTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gb2JqZWN0IHdpdGggYWxsIGNvbXBpbGVkIFdlYkFzc2VtYmx5Lk1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18udyA9IHt9O1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9JbmRleC50c1wiKTtcbiIsImltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9jayB9IGZyb20gJy4vQmxvY2snXG5cbmV4cG9ydCBjbGFzcyBCbG9ja0NhY2hlIHtcbiAgcHJpdmF0ZSBjYWNoZSA9IG5ldyBNYXA8bnVtYmVyLCBCbG9jaz4oKVxuICBwcml2YXRlIG1pbkhlaWdodCA6IG51bWJlciA9IC0xXG4gIHByaXZhdGUgbWF4SGVpZ2h0IDogbnVtYmVyID0gLTFcbiAgcHJpdmF0ZSBtYXhDYWNoZWRDb3VudCA6IG51bWJlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggbWF4Q2FjaGVkQ291bnQgOiBudW1iZXIgKSB7XG4gICAgdGhpcy5tYXhDYWNoZWRDb3VudCA9IG1heENhY2hlZENvdW50XG4gIH1cblxuICBwdWJsaWMgaXNDYWNoZWQoIGhlaWdodDogbnVtYmVyICkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gaGVpZ2h0ID4gMCAmJiBoZWlnaHQgPj0gdGhpcy5taW5IZWlnaHQgJiYgaGVpZ2h0IDw9IHRoaXMubWF4SGVpZ2h0XG4gIH1cblxuICBwdWJsaWMgZ2V0IGNhY2hlZEhlaWdodFJhbmdlKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW4gOiB0aGlzLm1pbkhlaWdodCwgbWF4OiB0aGlzLm1heEhlaWdodCB9XG4gIH1cblxuICBwdWJsaWMgcHV0KCBibG9jazogQmxvY2sgKSB7XG4gICAgaWYgKCAhdGhpcy5pc0NhY2hlZCggYmxvY2suaGVpZ2h0ICkgJiYgdGhpcy5tYXhIZWlnaHQgPj0gMCAmJiBibG9jay5oZWlnaHQgIT09IHRoaXMubWF4SGVpZ2h0ICsgMSApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgKCdpbnZhbGlkIGJsb2NrIGhlaWdodCcpXG5cbiAgICB0aGlzLmNhY2hlLnNldCggYmxvY2suaGVpZ2h0LCBibG9jayApXG4gICAgdGhpcy5tYXhIZWlnaHQgPSBibG9jay5oZWlnaHRcbiAgICBcbiAgICBpZiAoIHRoaXMuY2FjaGUuc2l6ZSA+PSB0aGlzLm1heENhY2hlZENvdW50ICkge1xuICAgICAgdGhpcy5jYWNoZS5kZWxldGUoIHRoaXMubWluSGVpZ2h0KysgKVxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQoIGhlaWdodDogbnVtYmVyICkgOiBNYXliZVVuZGVmaW5lZDxCbG9jaz4ge1xuICAgIHJldHVybiB0aGlzLmNhY2hlLmdldChoZWlnaHQpXG4gIH1cblxuICBwdWJsaWMgZ2V0QnlJZCggaWQ6IHN0cmluZyApIDogTWF5YmVVbmRlZmluZWQ8QmxvY2s+IHtcbiAgICBmb3IoIGNvbnN0IGIgb2YgdGhpcy5jYWNoZS52YWx1ZXMoKSApIHtcbiAgICAgIGlmICggYi5pZCEgPT09IGlkICkgcmV0dXJuIGJcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV2aXQoIGZyb21IZWlnaHQ6IG51bWJlciwgdG9IZWlnaHQ6IG51bWJlciApIHtcbiAgICBsZXQgbWluID0gTWF0aC5taW4oIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBsZXQgbWF4ID0gTWF0aC5tYXgoIGZyb21IZWlnaHQsIHRvSGVpZ2h0IClcbiAgICBpZiAoIG1pbiA+IHRoaXMubWF4SGVpZ2h0IHx8IG1heCA8IHRoaXMubWluSGVpZ2h0ICkgcmV0dXJuIFxuICAgIFxuICAgIG1pbiA9IE1hdGgubWF4KCBtaW4sIHRoaXMubWluSGVpZ2h0IClcbiAgICBtYXggPSBNYXRoLm1pbiggbWF4LCB0aGlzLm1pbkhlaWdodCApXG4gICAgZm9yICggbGV0IGhlaWdodCA9IG1pbjsgaGVpZ2h0IDw9IG1heDsgaGVpZ2h0KysgKSB7XG4gICAgICB0aGlzLmNhY2hlLmRlbGV0ZShoZWlnaHQpXG4gICAgfVxuICB9XG59IiwiaW1wb3J0IHsgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyIH0gZnJvbSAndXRpbCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT2JqZWN0TGl0ZXJhbCB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IHR5cGUgSnNvbk9iamVjdCA9IE9iamVjdExpdGVyYWxcbmV4cG9ydCB0eXBlIEVudGl0eSA9IE9iamVjdExpdGVyYWxcblxuZXhwb3J0IGludGVyZmFjZSBLZXlPYmplY3QgeyBcbiAga2V5IDogc3RyaW5nXG4gIGtleUpzb24gOiBKc29uT2JqZWN0XG59XG5leHBvcnQgdHlwZSBFbnRpdHlLZXkgPSBzdHJpbmcgfCBudW1iZXIgfCBLZXlPYmplY3RcblxuZXhwb3J0IHR5cGUgUGFydGlhbDxUPiA9IHtcbiAgW1AgaW4ga2V5b2YgVF0/OiBUW1BdXG59XG5cbmV4cG9ydCB0eXBlIFJlYWRvbmx5UGFydGlhbDxUPiA9IHtcbiAgcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF07XG59XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZ1bmN0aW9uPFQ+ID0gKCBlIDogVCApID0+IGJvb2xlYW5cblxuZXhwb3J0IHR5cGUgS2V5VmFsdWVQYWlyID0geyBrZXk6IHN0cmluZywgdmFsdWU6IGFueSB9XG5leHBvcnQgdHlwZSBDYWxsYmFjazxUUmVzdWx0PiA9ICggZXJyOiBFcnJvcnxudWxsLCBkYXRhOiBUUmVzdWx0ICkgPT4gdm9pZFxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUpzb25PYmplY3Q8VD4oaXRlcmFibGU6IEl0ZXJhYmxlPFQ+LCBnZXRLZXk6ICh0IDogVCkgPT4gc3RyaW5nLCBnZXRWYWx1ZTogKHQ6IFQpID0+IGFueSAgKSA6IEpzb25PYmplY3Qge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdpdGVyYWJsZScsICgpID0+IENvZGVDb250cmFjdC5ub3ROdWxsKCBpdGVyYWJsZSApKVxuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdnZXRLZXknLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggZ2V0S2V5ICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2dldFZhbHVlJywgKCkgPT4gQ29kZUNvbnRyYWN0Lm5vdE51bGwoIGdldFZhbHVlICkpXG5cbiAgbGV0IHJldCA9IHt9XG4gIGZvciAobGV0IGl0ZW0gb2YgaXRlcmFibGUpIHtcbiAgICByZXRbZ2V0S2V5KGl0ZW0pXSA9IGdldFZhbHVlKGl0ZW0pXG4gIH1cbiAgcmV0dXJuIHJldCBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBDb3B5PFQ+KHNyYyA6IFQpIDogVCB7XG4gIGlmICggIXNyYyApIHJldHVybiBzcmNcbiAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3JjKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpYWw8VD4oIHNyYyA6IFQsIC4uLmtleXMgOiBBcnJheTxzdHJpbmc+ICk6IFBhcnRpYWw8VD4ge1xuICBDb2RlQ29udHJhY3QuYXJndW1lbnQoICdzcmMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCggc3JjICkpXG4gIENvZGVDb250cmFjdC5hcmd1bWVudCggJ2tleXMnLCAoKSA9PiBDb2RlQ29udHJhY3Qubm90TnVsbCgga2V5cyApKVxuXG4gIGxldCByZXN1bHQgPSAgeyB9XG4gIGZvciAoIGxldCBrIG9mIFsuLi5rZXlzXSApIHJlc3VsdFtrXSA9IHNyY1trXVxuICByZXR1cm4gcmVzdWx0IGFzIFBhcnRpYWw8VD5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUHJpbWl0aXZlS2V5KCBrZXkgOiBhbnkgKSA6IGJvb2xlYW4ge1xuICBpZiAoICFrZXkgKSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGlzU3RyaW5nKCBrZXkgKSB8fCBpc051bWJlcigga2V5IClcbn1cblxuZXhwb3J0IGNsYXNzIENvZGVDb250cmFjdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciggbWVzc2FnZSA6IHN0cmluZyApIHtcbiAgICBzdXBlciggJ0NvZGUgY29udHJhY3QgRXJyb3IsJysgbWVzc2FnZSApXG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgQ29udHJhY3RDb25kaXRpb24gPSBib29sZWFuIHwgKCAoKSA9PiBib29sZWFuIClcbmV4cG9ydCB0eXBlIENvbnRyYWN0TWVzc2FnZSAgID0gc3RyaW5nICB8ICggKCkgPT4gc3RyaW5nIClcblxuZXhwb3J0IHR5cGUgTWF5YmVVbmRlZmluZWQ8VD4gPSBUIHwgdW5kZWZpbmVkXG5leHBvcnQgdHlwZSBOdWxsYWJsZTxUPiA9IFQgfCBudWxsIHwgdW5kZWZpbmVkXG5cbmV4cG9ydCB0eXBlIENvbnRyYWN0VmVyaWZ5UmVzdWx0ID0geyByZXN1bHQgOiBib29sZWFuLCBtZXNzYWdlOiBOdWxsYWJsZTxzdHJpbmc+IH0gXG5leHBvcnQgdHlwZSBWZXJpZnlGdW5jdGlvbiA9ICgpID0+IENvbnRyYWN0VmVyaWZ5UmVzdWx0XG5cbmV4cG9ydCBjbGFzcyBDb2RlQ29udHJhY3Qge1xuICBwdWJsaWMgc3RhdGljIHZlcmlmeSggY29uZGl0aW9uOiBDb250cmFjdENvbmRpdGlvbiwgbWVzc2FnZSA6IENvbnRyYWN0TWVzc2FnZSApIDogdm9pZCB7XG4gICAgaWYgKCBjb25kaXRpb24gPT09IHVuZGVmaW5lZCB8fCBjb25kaXRpb24gPT09IG51bGwgKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdmVyaWZ5IGNvbmRpdGlvbicpXG5cbiAgICBjb25zdCBjb25kID0gaXNGdW5jdGlvbihjb25kaXRpb24pID8gKGNvbmRpdGlvbiBhcyBGdW5jdGlvbikoKSA6IGNvbmRpdGlvblxuICAgIGNvbnN0IG1zZyA9IGlzRnVuY3Rpb24obWVzc2FnZSkgPyAobWVzc2FnZSBhcyBGdW5jdGlvbikoKSA6IG1lc3NhZ2VcblxuICAgIGlmICghY29uZCkgdGhyb3cgbmV3IENvZGVDb250cmFjdEVycm9yKCBtc2cgKVxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhcmd1bWVudCggYXJnTmFtZTogc3RyaW5nLCB2ZXJpZnk6IFZlcmlmeUZ1bmN0aW9uIHwgQ29udHJhY3RDb25kaXRpb24sIG1lc3NhZ2U/IDogQ29udHJhY3RNZXNzYWdlICk6IHZvaWQge1xuICAgIGlmICggIWFyZ05hbWUgfHwgIXZlcmlmeSApIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdhcmdOYW1lIG9yIHZlcmlmeSBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKVxuXG4gICAgaWYgKCAhbWVzc2FnZSApIHtcbiAgICAgIGNvbnN0IHZyID0gICh2ZXJpZnkgYXMgVmVyaWZ5RnVuY3Rpb24pKClcbiAgICAgIENvZGVDb250cmFjdC52ZXJpZnkoIHZyLnJlc3VsdCwgYGFyZ3VtZW50ICcke2FyZ05hbWV9JyAke3ZyLm1lc3NhZ2V9YClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIENvZGVDb250cmFjdC52ZXJpZnkodmVyaWZ5IGFzIENvbnRyYWN0Q29uZGl0aW9uLCBtZXNzYWdlISkgICAgXG4gIH1cblxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbCggYXJnIDogYW55ICk6IENvbnRyYWN0VmVyaWZ5UmVzdWx0IHtcbiAgICBjb25zdCByZXN1bHQgPSAgYXJnICE9PSBudWxsICYmIGFyZyAhPT0gdW5kZWZpbmVkXG4gICAgY29uc3QgbWVzc2FnZSA9IHJlc3VsdCA/IHVuZGVmaW5lZCA6ICdjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbm90TnVsbE9yRW1wdHkoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsKHN0cikgJiYgc3RyICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIGVtcHR5J1xuXG4gICAgcmV0dXJuIHsgcmVzdWx0ICwgbWVzc2FnZSB9XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIG5vdE51bGxPcldoaXRlc3BhY2UoIHN0cjogTnVsbGFibGU8c3RyaW5nPiApOiBDb250cmFjdFZlcmlmeVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gIENvZGVDb250cmFjdC5ub3ROdWxsT3JFbXB0eSggc3RyICkgJiYgKCBzdHIgYXMgc3RyaW5nICkudHJpbSgpICE9PSAnJ1xuICAgIGNvbnN0IG1lc3NhZ2UgPSByZXN1bHQgPyB1bmRlZmluZWQgOiAnY2Fubm90IGJlIG51bGwgb3IgdW5kZWZpbmVkIG9yIHdoaXRlc3BhY2UnXG5cbiAgICByZXR1cm4geyByZXN1bHQgLCBtZXNzYWdlIH1cbiAgfVxuXG59XG5cblxuIiwiaW1wb3J0IHsgRW50aXR5Q2FjaGUsIExSVUVudGl0eUNhY2hlLCBFbnRpdHlDYWNoZU9wdGlvbnMgfSBmcm9tICcuL0VudGl0eUNhY2hlJ1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIE1vZGVsTmFtZU9yVHlwZSwgQ29uc3RydWN0b3IgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiwgREJUcmFuc2FjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgSnNvblNxbEJ1aWxkZXIsIFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyLCBNVUxUSV9TUUxfU0VQQVJBVE9SIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRW50aXR5LCBKc29uT2JqZWN0LCBNYXliZVVuZGVmaW5lZCwgRW50aXR5S2V5LCBGaWx0ZXJGdW5jdGlvbiB9IGZyb20gJy4vQ29tbW9uJ1xuaW1wb3J0IHsgUHJveGllZEVudGl0eVRyYWNrZXIsIFRyYWNrZXJTcWxCdWlsZGVyLCBFbnRpdHlDaGFuZ2VzSXRlbSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVRyYWNrZXInXG5pbXBvcnQgeyBFbnRpdHlDaGFuZ2VzLCBFbnRpdHlFeHRlbnNpb24gfSBmcm9tICcuL1N0YXRlVHJhY2tlci9FbnRpdHlQcm94eSdcbmltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4vTG9nJ1xuaW1wb3J0IHsgaXNBcnJheSB9IGZyb20gJ3V0aWwnXG5cbmV4cG9ydCB0eXBlIFNhdmVIaXN0b3J5QWN0aW9uID0gKCB2ZXJzaW9uOiBudW1iZXIsIGhpc3Rvcnk6IE1hcDxzdHJpbmcsIEVudGl0eUNoYW5nZXM+ICkgPT4gdm9pZFxuXG5leHBvcnQgY2xhc3MgRGJTZXNzaW9uIHtcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBEYkNvbm5lY3Rpb25cbiAgcHJpdmF0ZSBtb2RlbHM6IE1hcDxzdHJpbmcsIE1vZGVsU2NoZW1hPlxuICBwcml2YXRlIHNlc3Npb25DYWNoZSA6IEVudGl0eUNhY2hlXG4gIHByaXZhdGUgc3FsQnVpbGRlciA6IEpzb25TcWxCdWlsZGVyXG4gIHByaXZhdGUgdHJhY2tlclNxbEJ1aWxkZXI6IFRyYWNrZXJTcWxCdWlsZGVyXG4gIHByaXZhdGUgZW50aXR5VHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyXG4gIHByaXZhdGUgc2Vzc2lvblNlcmlhbCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbiwgY2FjaGVPcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zLCBzZXNzaW9uTmFtZT86IHN0cmluZykge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoIERiU2Vzc2lvbi5uYW1lICsgKCBzZXNzaW9uTmFtZSA9PT0gdW5kZWZpbmVkID8gJycgOiBgXyR7c2Vzc2lvbk5hbWV9YCkgIClcbiAgICB0aGlzLnNlc3Npb25TZXJpYWwgPSAtMVxuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgICB0aGlzLm1vZGVscyA9IG5ldyBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4oKVxuICAgIHRoaXMuc2Vzc2lvbkNhY2hlID0gbmV3IExSVUVudGl0eUNhY2hlKGNhY2hlT3B0aW9ucylcbiAgICB0aGlzLnNxbEJ1aWxkZXIgPSBuZXcgSnNvblNxbEJ1aWxkZXIoKVxuICAgIHRoaXMuZW50aXR5VHJhY2tlciA9IG5ldyBQcm94aWVkRW50aXR5VHJhY2tlciggdGhpcy5zZXNzaW9uQ2FjaGUgKVxuICAgIHRoaXMudHJhY2tlclNxbEJ1aWxkZXIgPSBuZXcgVHJhY2tlclNxbEJ1aWxkZXIoIHRoaXMuZW50aXR5VHJhY2tlciwgdGhpcy5tb2RlbHMsIHRoaXMuc3FsQnVpbGRlciApXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uICYmIHRoaXMuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZFxuICB9XG5cbiAgcHVibGljIGdldCBlbnRpdHlDYWNoZSgpOiBFbnRpdHlDYWNoZSB7XG4gICAgcmV0dXJuIHRoaXMuc2Vzc2lvbkNhY2hlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgc3luY1NjaGVtYShzY2hlbWE6IE1vZGVsU2NoZW1hKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2NoZW1hKHNjaGVtYSlcbiAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucnVuU2NyaXB0KHNxbClcbiAgfVxuXG4gIHB1YmxpYyByZWdpc3RlclNjaGVtYSguLi5zY2hlbWFzIDogQXJyYXk8TW9kZWxTY2hlbWE+KSA6IHZvaWQge1xuICAgIHNjaGVtYXMuZm9yRWFjaCggcyA9PiB0aGlzLm1vZGVscy5zZXQocy5tb2RlbE5hbWUsIHMpIClcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRTY2hlbWFCeU5hbWUobW9kZWxOYW1lOiBzdHJpbmcpIDogTW9kZWxTY2hlbWEge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtb2RlbE5hbWUpXG4gICAgaWYgKCAhc2NoZW1hICkgdGhyb3cgbmV3IEVycm9yKGB1bnJlZ2lzdGVyZWQgbW9kZWwgKCBuYW1lID0gJyR7bW9kZWxOYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYUJ5Q2xhc3M8VEVudGl0eT4oY2xheno6IENvbnN0cnVjdG9yPFRFbnRpdHk+KSA6IE1vZGVsU2NoZW1hIHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLm1vZGVscy5nZXQoY2xhenoubmFtZSlcbiAgICBpZiAoICFzY2hlbWEgKSB0aHJvdyBuZXcgRXJyb3IoYHVucmVnaXN0ZXJlZCBtb2RlbCAoIG5hbWUgPSAnJHtjbGF6ei5uYW1lfScgKWApXG4gICAgcmV0dXJuIHNjaGVtYVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiApIHtcbiAgICByZXR1cm4gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IFxuICAgICAgdGhpcy5nZXRTY2hlbWFCeU5hbWUobW9kZWwpIDogXG4gICAgICB0aGlzLmdldFNjaGVtYUJ5Q2xhc3MobW9kZWwpXG4gIH1cblxuICBwcm90ZWN0ZWQgbWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiBzY2hlbWEuc2V0S2V5KCB7fSwga2V5IClcbiAgfVxuXG4gIHByb3RlY3RlZCB0cmFja1BlcnNpc3RlbnRFbnRpdGllczxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgIGVudGl0aWVzIDogQXJyYXk8VEVudGl0eT4sIGNhY2hlID0gdHJ1ZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8VEVudGl0eT4oKVxuICAgIGVudGl0aWVzLmZvckVhY2goIGUgPT4ge1xuICAgICAgcmVzdWx0LnB1c2goIHRoaXMuZW50aXR5VHJhY2tlci50cmFja1BlcnNpc3RlbnQoc2NoZW1hLCBlKSApXG4gICAgICBjYWNoZSAmJiB0aGlzLmVudGl0eUNhY2hlLnB1dCggc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShlKSAsIGUgKVxuICAgIH0pXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHJvdGVjdGVkIHJlc2V0KGNsZWFyQ2FjaGU6IGJvb2xlYW4gPSBmYWxzZSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuc3RvcFRyYWNrQWxsKClcbiAgICBpZiAoIGNsZWFyQ2FjaGUgKSB0aGlzLmVudGl0eUNhY2hlLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjbG9zZSgpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5yZXNldCggdHJ1ZSApXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgcHVibGljIGF0dGFjaEhpc3RvcnkoIGhpc3Rvcnk6IE1hcDxudW1iZXIsIEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPj4pOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIuYXR0YWNoSGlzdG9yeSggaGlzdG9yeSApXG4gIH1cblxuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBmaWx0ZXI/IDogRmlsdGVyRnVuY3Rpb248VEVudGl0eT4sIHRyYWNrID0gZmFsc2UgKSA6IEFycmF5PFRFbnRpdHk+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSwgZmlsdGVyICkgfHwgW11cblxuICAgIHJldHVybiB0cmFjayA/IHRoaXMudHJhY2tQZXJzaXN0ZW50RW50aXRpZXMoIHNjaGVtYSwgZW50aXRpZXMsIGZhbHNlICkgOiBlbnRpdGllcyBcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2g8VEVudGl0eT4oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IHRyYWNrZWQgPSB0aGlzLmVudGl0eVRyYWNrZXIuZ2V0VHJhY2tpbmdFbnRpdHk8VEVudGl0eT4oIHNjaGVtYSwga2V5IClcbiAgICBpZiAoIHRyYWNrZWQgIT09IHVuZGVmaW5lZCApIHJldHVybiB0cmFja2VkIGFzIE9iamVjdCBhcyBURW50aXR5XG5cbiAgICBsZXQgY2FjaGVkID0gdGhpcy5lbnRpdHlDYWNoZS5nZXQ8VEVudGl0eT4oIHNjaGVtYS5tb2RlbE5hbWUsIGtleSApXG4gICAgcmV0dXJuICggY2FjaGVkID09PSB1bmRlZmluZWQgKSA/IHVuZGVmaW5lZCA6IFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCggc2NoZW1hLCBjYWNoZWQgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEFsbDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgdHJhY2sgPSBmYWxzZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuXG4gICAgaWYgKCBzY2hlbWEubWVtQ2FjaGVkICYmIHRoaXMuZW50aXR5Q2FjaGUuZXhpc3RzTW9kZWwoc2NoZW1hLm1vZGVsTmFtZSkgKSB7XG4gICAgICBsZXQgZW50aXRpZXMgPSB0aGlzLmVudGl0eUNhY2hlLmdldEFsbDxURW50aXR5Piggc2NoZW1hLm1vZGVsTmFtZSApIHx8IFtdXG4gICAgICByZXR1cm4gdHJhY2sgPyB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApIDogZW50aXRpZXMgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldE1hbnkoIG1vZGVsLCB7IH0sIHRyYWNrIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRNYW55PFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uOiBTcWxDb25kaXRpb24sIHRyYWNrID0gZmFsc2UsIGNhY2hlID0gdHJ1ZSApIDogUHJvbWlzZTxBcnJheTxURW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCBjb25kaXRpb24pXG4gICAgXG4gICAgbGV0IGVudGl0aWVzID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbC5xdWVyeSwgc3FsLnBhcmFtZXRlcnMpXG4gICAgaWYgKCBjYWNoZSApIGVudGl0aWVzLmZvckVhY2goIGUgPT4gdGhpcy5lbnRpdHlDYWNoZS5wdXQoIHNjaGVtYS5tb2RlbE5hbWUsIHNjaGVtYS5nZXRLZXkoZSksIGUgKSlcblxuICAgIHJldHVybiAhdHJhY2sgPyBlbnRpdGllcyA6XG4gICAgICB0aGlzLnRyYWNrUGVyc2lzdGVudEVudGl0aWVzKCBzY2hlbWEsIGVudGl0aWVzLCBmYWxzZSApXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgcXVlcnk8VEVudGl0eT4obW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPzogQXJyYXk8c3RyaW5nPiwgam9pbj8gOiBKc29uT2JqZWN0ICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwpXG4gICAgY29uc3Qgc3FsID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KHNjaGVtYSwgc2NoZW1hLmZpZWxkTmFtZXMsIGNvbmRpdGlvbiwgcmVzdWx0UmFuZ2UsIHNvcnQsIGpvaW4pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHF1ZXJ5QnlKc29uPFRFbnRpdHk+KG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8QXJyYXk8VEVudGl0eT4+IHtcbiAgICBjb25zdCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYShtb2RlbClcbiAgICBjb25zdCBzcWwgPSB0aGlzLnNxbEJ1aWxkZXIuYnVpbGRTZWxlY3Qoc2NoZW1hLCBwYXJhbXMpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5xdWVyeShzcWwucXVlcnksIHNxbC5wYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCApXG5cbiAgICBsZXQgeyBxdWVyeSAsIHBhcmFtZXRlcnN9ID0gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkU2VsZWN0KCBzY2hlbWEsIFtdICwgY29uZGl0aW9uICkgXG4gICAgcXVlcnkgPSBgc2VsZWN0IGV4aXN0cygke3F1ZXJ5LnJlcGxhY2UoTVVMVElfU1FMX1NFUEFSQVRPUiwgJycpfSkgYXMgZXhpc3RgXG4gICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KCBxdWVyeSwgcGFyYW1ldGVycyApXG4gICAgXG4gICAgcmV0dXJuIGlzQXJyYXkocmV0KSAmJiBwYXJzZUludChyZXRbMF1bJ2V4aXN0J10pID4gMCBcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHJldCA9IGF3YWl0IHRoaXMucXVlcnlCeUpzb24oIG1vZGVsLCB7IGZpZWxkcyA6ICdjb3VudCgqKSBhcyBjb3VudCcsIGNvbmRpdGlvbjogY29uZGl0aW9uIH0gKVxuICAgIHJldHVybiBpc0FycmF5KHJldCkgPyBwYXJzZUludChyZXRbMF1bJ2NvdW50J10pIDogMCBcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGU8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sICBrZXk6IEVudGl0eUtleSwgZW50aXR5PyA6IFRFbnRpdHkpIDogVEVudGl0eSB7ICAgIFxuICAgIGlmICggIWtleSApIHRocm93IG5ldyBFcnJvcignZW50aXR5IGtleSBjYW4gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJylcblxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKG1vZGVsKVxuICAgIGxldCB0aGVFbnRpdHkgPSBzY2hlbWEubmV3RW50aXR5KCBtb2RlbCwga2V5IClcbiAgICBlbnRpdHkgJiYgc2NoZW1hLmNvcHlQcm9wZXJ0aWVzKCB0aGVFbnRpdHksIGVudGl0eSApXG5cbiAgICBsZXQgZXhpc3RzID0gdGhpcy5zZXNzaW9uQ2FjaGUuZXhpc3RzKHNjaGVtYS5tb2RlbE5hbWUsIGtleSkgfHwgdGhpcy5lbnRpdHlUcmFja2VyLmlzVHJhY2tpbmcoc2NoZW1hLCBrZXkpXG4gICAgaWYgKCBleGlzdHMgKSB0aHJvdyBuZXcgRXJyb3IoYGVudGl0eSBleGlzdHMgYWxyZWFkeSAoIG1vZGVsID0gJyR7c2NoZW1hLm1vZGVsTmFtZX0nIGtleSA9ICcke2tleX0nICkgYClcbiAgICAgIFxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tOZXcoc2NoZW1hLCB0aGVFbnRpdHkpIGFzIFRFbnRpdHlcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3luYyBsb2FkRW50aXR5QnlLZXkobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcbiAgICBjb25zdCB3aGVyZSA9IHRoaXMubWFrZUJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIGNvbnN0IHNxbCA9IHRoaXMuc3FsQnVpbGRlci5idWlsZFNlbGVjdChzY2hlbWEsIHNjaGVtYS5maWVsZE5hbWVzLCB3aGVyZSlcblxuICAgIGNvbnN0IHJvd3MgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24ucXVlcnkoc3FsLnF1ZXJ5LCBzcWwucGFyYW1ldGVycylcbiAgICBpZiAoIHJvd3MubGVuZ3RoID4gMSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZW50aXR5IGtleSBpcyBkdXBsaWNhdGVkICggbW9kZWwgPSAnJHttb2RlbE5hbWV9JyBrZXkgPSAnJHtrZXl9JyApYCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3MubGVuZ3RoID09PSAxID8gcm93c1swXSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGxvYWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5KSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8VEVudGl0eT4+IHtcbiAgICBjb25zdCBjYWNoZWQgPSB0aGlzLmxvYWRDYWNoZWQoIG1vZGVsLCBrZXkgKVxuICAgIGlmICggY2FjaGVkICE9PSB1bmRlZmluZWQgKSByZXR1cm4gY2FjaGVkXG4gIFxuICAgIGNvbnN0IG1vZGVsTmFtZSA9IHR5cGVvZiBtb2RlbCA9PT0gJ3N0cmluZycgPyBtb2RlbCA6IG1vZGVsLm5hbWVcbiAgICBjb25zdCBlbnRpdHkgPSBhd2FpdCB0aGlzLmxvYWRFbnRpdHlCeUtleSggbW9kZWxOYW1lLCBrZXkgKVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgXG4gICAgdGhpcy5zZXNzaW9uQ2FjaGUucHV0KCBtb2RlbE5hbWUsIGtleSwgZW50aXR5IClcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLnRyYWNrUGVyc2lzdGVudCh0aGlzLmdldFNjaGVtYUJ5TmFtZShtb2RlbE5hbWUpLCBlbnRpdHkpIGFzIFRFbnRpdHkgIFxuICB9XG5cbiAgcHVibGljIGdldENoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5nZXRUcmFja2luZ0NoYW5nZXMoKVxuICB9XG5cbiAgcHVibGljIGxvYWRDYWNoZWQ8VEVudGl0eT4obW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICwgdHJhY2sgPSBmYWxzZSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gdHlwZW9mIG1vZGVsID09PSAnc3RyaW5nJyA/IG1vZGVsIDogbW9kZWwubmFtZVxuICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hQnlOYW1lKG1vZGVsTmFtZSlcblxuICAgIGNvbnN0IHBlID0gdGhpcy5lbnRpdHlUcmFja2VyLmdldFRyYWNraW5nRW50aXR5KCBzY2hlbWEsIGtleSApXG4gICAgaWYgKCBwZSAmJiB0cmFjayApIHJldHVybiBwZSBhcyBFbnRpdHkgYXMgVEVudGl0eVxuXG4gICAgY29uc3QgZW50aXR5ID0gdGhpcy5zZXNzaW9uQ2FjaGUuZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZSwga2V5KVxuICAgIGlmICggZW50aXR5ID09PSB1bmRlZmluZWQgfHwgISB0cmFjayApIHJldHVybiBlbnRpdHlcblxuICAgIHJldHVybiB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tQZXJzaXN0ZW50KHNjaGVtYSwgZW50aXR5KSBhcyBURW50aXR5IFxuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY2hhbmdlcyB0byBkYXRhYmFzZVxuICAgKiBAcmV0dXJucyBzZXJpYWwgbnVtYmVyIGZvciBzYXZlQ2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVDaGFuZ2VzKHNlcmlhbD8gOiBudW1iZXIpIDogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBjb25zdCByZXRTZXJpYWwgPSBzZXJpYWwgfHwgKyt0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHNhdmVDaGFuZ2VzICggc2VyaWFsID0gJHtyZXRTZXJpYWx9IClgKVxuICAgIFxuICAgIGNvbnN0IHNxbHMgPSB0aGlzLnRyYWNrZXJTcWxCdWlsZGVyLmJ1aWxkQ2hhbmdlU3FscygpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goIHNxbHMgKVxuICAgICAgYXdhaXQgdHJhbnMuY29tbWl0KClcbiAgICAgIFxuICAgICAgdGhpcy5lbnRpdHlUcmFja2VyLmFjY2VwdENoYW5nZXMoIHJldFNlcmlhbCApIFxuICAgICAgdGhpcy5zZXNzaW9uU2VyaWFsID0gcmV0U2VyaWFsXG5cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBzYXZlQ2hhbmdlcyAoIHNlcmlhbCA9ICR7cmV0U2VyaWFsfSApYClcbiAgICAgIHJldHVybiByZXRTZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgc2F2ZUNoYW5nZXMgKCBzZXJpYWwgPSAke3JldFNlcmlhbH0gKWAsIGVycilcbiAgICAgIGF3YWl0IHRyYW5zLnJvbGxiYWNrKClcbiAgICAgIHRoaXMuZW50aXR5VHJhY2tlci5yZWplY3RDaGFuZ2VzKClcbiAgICAgIHRocm93IGVyclxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSb2xsYmFjayBzYXZlZCBjaGFuZ2VzXG4gICAqIEBwYXJhbSBjaGFuZ2VzTk8gLHRoaXMgdmFsdWUgc2hvdWxkIGJlIHJldHVybmVkIGJ5IEBzZWUgc2F2ZUNoYW5nZXMoKSBcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0NoYW5nZXMoIHNlcmlhbDogbnVtYmVyICk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYoIHRoaXMuc2Vzc2lvblNlcmlhbCA8PSBzZXJpYWwgKSByZXR1cm4gdGhpcy5zZXNzaW9uU2VyaWFsXG5cbiAgICBjb25zdCBmcm9tID0gdGhpcy5zZXNzaW9uU2VyaWFsXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiByb2xsYmFja0NoYW5nZXMgKCBzZXJpYWwgPSAke3NlcmlhbH0gKWApXG5cbiAgICBjb25zdCBzcWxzID0gdGhpcy50cmFja2VyU3FsQnVpbGRlci5idWlsZFJvbGxiYWNrQ2hhbmdlU3FscyhzZXJpYWwpXG4gICAgY29uc3QgdHJhbnMgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlQmF0Y2goc3FscykgXG4gICAgICBhd2FpdCB0cmFucy5jb21taXQoKVxuXG4gICAgICB0aGlzLmVudGl0eVRyYWNrZXIucm9sbGJhY2tDaGFuZ2VzKHNlcmlhbClcbiAgICAgIHRoaXMuc2Vzc2lvblNlcmlhbCA9IHNlcmlhbCAtIDFcblxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIHJvbGxiYWNrQ2hhbmdlcyAoc2VyaWFsIDogJHtmcm9tfSAtPiAke3RoaXMuc2Vzc2lvblNlcmlhbH0pYClcbiAgICAgIHJldHVybiB0aGlzLnNlc3Npb25TZXJpYWxcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcm9sbGJhY2tDaGFuZ2VzIChzZXJpYWwgOiAke2Zyb219IC0+ICR7dGhpcy5zZXNzaW9uU2VyaWFsfSlgLCBlcnIpXG4gICAgICBhd2FpdCB0cmFucy5yb2xsYmFjaygpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5QmVmb3JlKCBzZXJpYWw6IG51bWJlciApIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdHlUcmFja2VyLmNsZWFySGlzdG9yeSggc2VyaWFsIClcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaGlzdG9yeVZlcnNpb24oKTogeyBtaW46IG51bWJlciwgbWF4OiBudW1iZXIgfSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXR5VHJhY2tlci5oaXN0b3J5VmVyc2lvblxuICB9XG5cbiAgcHVibGljIHVwZGF0ZTxURW50aXR5PihlbnRpdHk6IFRFbnRpdHkpIDogdm9pZCB7XG4gICAgLy8gZG8gbm90aGluZyAuXG4gIH1cblxuICBwdWJsaWMgZGVsZXRlPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmVudGl0eVRyYWNrZXIudHJhY2tEZWxldGUoKGVudGl0eSBhcyBPYmplY3QgYXMgRW50aXR5RXh0ZW5zaW9uKS5fX3NjaGVtYV9fLCAgZW50aXR5KVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnNhY3Rpb24oKSA6IFByb21pc2U8REJUcmFuc2FjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uYmVnaW5UcmFucygpXG4gIH0gIFxuXG59IiwiaW1wb3J0ICogYXMgTFJVIGZyb20gJ2xydS1jYWNoZSdcbmltcG9ydCB7IEVudGl0eSwgTWF5YmVVbmRlZmluZWQsIEVudGl0eUtleSwgS2V5T2JqZWN0LCBGaWx0ZXJGdW5jdGlvbiwgaXNQcmltaXRpdmVLZXkgfSBmcm9tICcuL0NvbW1vbic7XG5pbXBvcnQgeyBMb2dnZXIsIExvZ01hbmFnZXIgfSBmcm9tICcuL0xvZydcbmltcG9ydCB7IGlzTnVtYmVyLCBpc0Z1bmN0aW9uLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG4vKipcbiAqIGNhY2hlIG9wdGlvbnNcbiAqL1xuZXhwb3J0IHR5cGUgRW50aXR5Q2FjaGVPcHRpb25zID0geyBcbiAgZGVmYXVsdCA6IG51bWJlcixcbiAgW21vZGVsOiBzdHJpbmddOiAgbnVtYmVyIHwgKCAoIG1vZGVsOiBzdHJpbmcgKSA9PiBudW1iZXIgKVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNhY2hlIHtcbiAgbW9kZWxzIDogQXJyYXk8c3RyaW5nPlxuICBjbGVhcihtb2RlbE5hbWU/IDogc3RyaW5nKSA6IHZvaWRcbiAgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PlxuICBnZXRBbGw8VEVudGl0eT4obW9kZWxOYW1lOiBzdHJpbmcsIGZpbHRlcj8gOiBGaWx0ZXJGdW5jdGlvbjxURW50aXR5PikgOiBNYXliZVVuZGVmaW5lZDxBcnJheTxURW50aXR5Pj5cbiAgcHV0KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgIGVudGl0eTogRW50aXR5KSA6IHZvaWRcbiAgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZFxuICBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4gIFxuICBleGlzdHNNb2RlbChtb2RlbE5hbWU6IHN0cmluZykgOiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBMUlVFbnRpdHlDYWNoZSBpbXBsZW1lbnRzIEVudGl0eUNhY2hlIHtcbiAgcHJpdmF0ZSBzdGF0aWMgTUlOX0NBQ0hFRF9DT1VOVCA9IDEwMFxuICBwcml2YXRlIHN0YXRpYyBERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCA9IDEwMDAwXG5cbiAgcHJpdmF0ZSBvcHRpb25zOiBFbnRpdHlDYWNoZU9wdGlvbnNcbiAgcHJpdmF0ZSBsb2cgOiBMb2dnZXJcbiAgcHJpdmF0ZSBtb2RlbENhY2hlcyA6IE1hcDxzdHJpbmcsIExSVS5DYWNoZTxzdHJpbmcsIEVudGl0eT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBvcHRpb25zPzogRW50aXR5Q2FjaGVPcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7IGRlZmF1bHQgOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVCB9XG4gICAgLy8gZm9yKCBsZXQgayBpbiB0aGlzLm9wdGlvbnMgKSBcbiAgICAvLyAgIHRoaXMub3B0aW9uc1trXSA9IGlzTnVtYmVyKHRoaXMub3B0aW9uc1trXSkgPyB0aGlzLm9wdGlvbnNba10gOiBMUlVFbnRpdHlDYWNoZS5ERUZVTFRfTUFYX0NBQ0hFRF9DT1VOVFxuXG4gICAgdGhpcy5sb2cgPSBMb2dNYW5hZ2VyLmdldExvZ2dlcihMUlVFbnRpdHlDYWNoZS5uYW1lKVxuICAgIHRoaXMubW9kZWxDYWNoZXMgPSBuZXcgTWFwPHN0cmluZywgTFJVLkNhY2hlPHN0cmluZywgRW50aXR5Pj4oKVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRNb2RlbENhY2hlKG1vZGVsTmFtZSA6IHN0cmluZywgY3JlYXRlSWZOb3RFeGlzdHMgPSBmYWxzZSwgdGhyb3dJZk5vdEV4aXN0cyA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPExSVS5DYWNoZTxFbnRpdHlLZXksIEVudGl0eT4+IHtcbiAgICBpZiAoIGNyZWF0ZUlmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSB7IFxuICAgICAgLy8gY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIC8vICAgbWF4OiA1MDAsXG4gICAgICAvLyAgIGxlbmd0aDogZnVuY3Rpb24gKG4sIGtleSkgeyByZXR1cm4gbiAqIDIgKyBrZXkubGVuZ3RoIH0sXG4gICAgICAvLyAgIC8vZGlzcG9zZTogZnVuY3Rpb24gKGtleSwgbikgeyBuLmNsb3NlKCkgfSxcbiAgICAgIC8vICAgbWF4QWdlOiAxMDAwICogNjAgKiA2MCBcbiAgICAgIC8vIH1cbiAgICAgIGxldCBtYXhDYWNoZWRDb3VudCA6IG51bWJlcjtcbiAgICAgIGlmICggIXRoaXMub3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShtb2RlbE5hbWUpICkgXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gdGhpcy5vcHRpb25zLmRlZmF1bHRcbiAgICAgIGVsc2UgaWYgKCBpc051bWJlcih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkgKSBcbiAgICAgICAgbWF4Q2FjaGVkQ291bnQgPSBOdW1iZXIodGhpcy5vcHRpb25zW21vZGVsTmFtZV0pXG4gICAgICBlbHNlIGlmICggaXNGdW5jdGlvbih0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSkpXG4gICAgICAgIG1heENhY2hlZENvdW50ID0gKCB0aGlzLm9wdGlvbnNbbW9kZWxOYW1lXSBhcyAobW9kZWwpPT4gbnVtYmVyICkoIG1vZGVsTmFtZSApXG4gICAgICBlbHNlIFxuICAgICAgICBtYXhDYWNoZWRDb3VudCA9IExSVUVudGl0eUNhY2hlLkRFRlVMVF9NQVhfQ0FDSEVEX0NPVU5UXG5cbiAgICAgIG1heENhY2hlZENvdW50ID0gTWF0aC5tYXgoIExSVUVudGl0eUNhY2hlLk1JTl9DQUNIRURfQ09VTlQsIG1heENhY2hlZENvdW50IClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuc2V0KG1vZGVsTmFtZSwgbmV3IExSVTxzdHJpbmcsIEVudGl0eT4oIG1heENhY2hlZENvdW50ICkgKVxuICAgIH1cbiAgICAgaWYgKCB0aHJvd0lmTm90RXhpc3RzICYmICF0aGlzLm1vZGVsQ2FjaGVzLmhhcyhtb2RlbE5hbWUpKSBcbiAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE1vZGVsIGNhY2hlICggbmFtZSA9ICcke21vZGVsTmFtZX0nICkgIGRvZXMgbm90IGV4aXN0c2ApIFxuICAgICAgXG4gICAgcmV0dXJuIHRoaXMubW9kZWxDYWNoZXMuZ2V0KG1vZGVsTmFtZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRDYWNoZUtleSgga2V5OiBFbnRpdHlLZXkgKSA6IG51bWJlciB8IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUHJpbWl0aXZlS2V5KGtleSkgPyBrZXkgYXMgbnVtYmVyIHwgc3RyaW5nIDogKCBrZXkgYXMgS2V5T2JqZWN0ICkua2V5XG4gIH1cblxuICBwdWJsaWMgY2xlYXIobW9kZWxOYW1lPyA6IHN0cmluZykgOiB2b2lkIHsgICAgXG4gICAgaWYgKCBpc1N0cmluZyhtb2RlbE5hbWUpICkge1xuICAgICAgdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUsIGZhbHNlLCB0cnVlICkhLnJlc2V0KClcbiAgICAgIHRoaXMubW9kZWxDYWNoZXMuZGVsZXRlKCBtb2RlbE5hbWUgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZvciAoIGxldCBjIG9mIHRoaXMubW9kZWxDYWNoZXMudmFsdWVzKCkgKSB7XG4gICAgICBjLnJlc2V0KClcbiAgICB9XG4gICAgdGhpcy5tb2RlbENhY2hlcy5jbGVhcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVscygpIDogc3RyaW5nW10ge1xuICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXk8c3RyaW5nPigpXG4gICAgZm9yKCBsZXQgbSBvZiB0aGlzLm1vZGVsQ2FjaGVzLmtleXMoKSApIHtcbiAgICAgIHJlc3VsdC5wdXNoKCBtIClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0PFRFbnRpdHk+KG1vZGVsTmFtZTogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkgOiBNYXliZVVuZGVmaW5lZDxURW50aXR5PiB7XG4gICAgbGV0IG1vZGVsQ2FjaGUgPSB0aGlzLmdldE1vZGVsQ2FjaGUobW9kZWxOYW1lKVxuICAgIGxldCBjYWNoZUtleSA9IHRoaXMuZ2V0Q2FjaGVLZXkoIGtleSApXG5cbiAgICByZXR1cm4gIXRoaXMubW9kZWxDYWNoZXMuaGFzKG1vZGVsTmFtZSkgPyB1bmRlZmluZWQgOlxuICAgICAgbW9kZWxDYWNoZSEuaGFzKGNhY2hlS2V5KSA/IG1vZGVsQ2FjaGUhLmdldChjYWNoZUtleSkgYXMgVEVudGl0eSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGdldEFsbDxURW50aXR5Pihtb2RlbE5hbWU6IHN0cmluZywgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+KSA6IE1heWJlVW5kZWZpbmVkPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxURW50aXR5PigpXG4gICAgbGV0IGNhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKCBtb2RlbE5hbWUgKVxuICAgIGlmICggY2FjaGUgPT09IHVuZGVmaW5lZCApIHJldHVybiB1bmRlZmluZWRcblxuICAgIGNhY2hlLmZvckVhY2goIGUgPT4ge1xuICAgICAgZmlsdGVyICYmIGZpbHRlciggZSBhcyBURW50aXR5ICApICYmIHJlc3VsdC5wdXNoKCBlIGFzIFRFbnRpdHkgKSBcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBwdXQobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5LCBlbnRpdHk6IEVudGl0eSkgOiB2b2lkIHtcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYHB1dCBjYWNoZSwgbW9kZWwgPSAke21vZGVsTmFtZX0sIGtleSA9ICR7a2V5fSwgZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfWApICAgIFxuICAgIHRoaXMuZ2V0TW9kZWxDYWNoZShtb2RlbE5hbWUsIHRydWUpIS5zZXQodGhpcy5nZXRDYWNoZUtleShrZXkpLCBlbnRpdHkpXG4gIH1cblxuICBwdWJsaWMgZXZpdChtb2RlbE5hbWU6IHN0cmluZywga2V5OiBFbnRpdHlLZXkpIDogdm9pZCB7XG4gICAgbGV0IGNhY2hlS2V5ID0gdGhpcy5nZXRDYWNoZUtleSgga2V5IClcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYGV2aXQgY2FjaGUsIG1vZGVsID0gJHttb2RlbE5hbWV9LCBrZXkgPSAke2NhY2hlS2V5fWApXG5cbiAgICBjb25zdCBtb2RlbENhY2hlID0gdGhpcy5nZXRNb2RlbENhY2hlKG1vZGVsTmFtZSlcbiAgICBpZiAobW9kZWxDYWNoZSkgbW9kZWxDYWNoZS5kZWwoY2FjaGVLZXkpXG4gIH1cbiAgXG4gIHB1YmxpYyBleGlzdHMobW9kZWxOYW1lOiBzdHJpbmcsIGtleTogRW50aXR5S2V5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldChtb2RlbE5hbWUsICB0aGlzLmdldENhY2hlS2V5KCBrZXkgKSkgIT09IHVuZGVmaW5lZFxuICB9XG5cbiAgcHVibGljIGV4aXN0c01vZGVsKG1vZGVsTmFtZTogc3RyaW5nKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldE1vZGVsQ2FjaGUoIG1vZGVsTmFtZSwgZmFsc2UsIGZhbHNlICkgIT09IHVuZGVmaW5lZFxuICB9XG5cblxuICBwdWJsaWMgZHVtcENhY2hlKCkgOiBzdHJpbmcge1xuICAgIGxldCByZXN1bHQgPSBgLS0tLS0tLS0tLS0tLS0gIERVTVAgQ0FDSEUgIC0tLS0tLS0tLS0tLS0tLS1cXG5cXG5gIFxuICAgIHRoaXMubW9kZWxDYWNoZXMuZm9yRWFjaCggKGNhY2hlLCBtb2RlbCkgPT4ge1xuICAgICAgcmVzdWx0ICs9IGAtLS0tLS0tLS0tLS0tLU1vZGVsICR7bW9kZWx9LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBjYWNoZS5mb3JFYWNoKCAoIGVudGl0eSwga2V5ICkgPT4ge1xuICAgICAgICByZXN1bHQgKz0gYGtleSA9ICR7dGhpcy5nZXRDYWNoZUtleSgga2V5ICl9LCBlbnRpdHkgPSB7JHtKU09OLnN0cmluZ2lmeShlbnRpdHkpfX0gXFxuYFxuICAgICAgfSlcbiAgICAgIHJlc3VsdCArPSAnXFxuJ1xuICAgIH0pICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbiAgXG59IiwiaW1wb3J0ICogYXMgc2RiIGZyb20gJy4vU21hcnREQidcbmltcG9ydCAqIGFzIG1vZGVsIGZyb20gJy4vTW9kZWwnXG5pbXBvcnQgKiBhcyBibG9jayBmcm9tICcuL0Jsb2NrJ1xuaW1wb3J0ICogYXMgc2Vzc2lvbiBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCAqIGFzIHNxbGl0ZSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgKiBhcyBjb25uIGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuXG5leHBvcnQgbmFtZXNwYWNlIEFzY2hDb3JlIHtcbiAgZXhwb3J0IGNvbnN0IFNtYXJ0REIgPSBzZGIuU21hcnREQlxuICBleHBvcnQgY29uc3QgTW9kZWxTY2hlbWEgPSBtb2RlbC5Nb2RlbFNjaGVtYVxuICBleHBvcnQgdHlwZSBCbG9jayA9IGJsb2NrLkJsb2NrXG4gIGV4cG9ydCBjb25zdCBEYlNlc3Npb24gPSBzZXNzaW9uLkRiU2Vzc2lvblxuICBleHBvcnQgdHlwZSBEYkNvbm5lY3Rpb24gPSBjb25uLkRiQ29ubmVjdGlvblxuICBleHBvcnQgY29uc3QgU3FsaXRlQ29ubmVjdGlvbiA9IHNxbGl0ZS5TcWxpdGVDb25uZWN0aW9uXG59IFxuIiwiaW1wb3J0IHsgaXNGdW5jdGlvbiB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBKc29uT2JqZWN0LCBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCAqIGFzIHN1YmxldmVsIGZyb20gJ2xldmVsLXN1YmxldmVsJ1xuXG5jb25zdCBsZXZlbCA9IHJlcXVpcmUoJ2xldmVsJylcbmNvbnN0IFNlbm9uZGFyeSA9IHJlcXVpcmUoJ2xldmVsLXNlY29uZGFyeScpXG5cbmV4cG9ydCB0eXBlIEdldEluZGV4VmFsdWVGdW5jID0gKGtleTogYW55LCB2YWx1ZTogSnNvbk9iamVjdCkgPT4gYW55XG5leHBvcnQgdHlwZSBJbmRleEZpZWxkID0geyBmaWVsZE5hbWU6IHN0cmluZywgY2FsY0luZGV4PzogR2V0SW5kZXhWYWx1ZUZ1bmMgfVxuXG5leHBvcnQgY2xhc3MgU3ViTGV2ZWxNZXRhIHtcbiAgcHVibGljIHN1Yk5hbWU6IHN0cmluZ1xuICBwdWJsaWMga2V5RmllbGQgOiBzdHJpbmdcbiAgcHVibGljIGluZGV4RmllbGRzIDogQXJyYXk8SW5kZXhGaWVsZD5cblxuICBwdWJsaWMgY29uc3RydWN0b3Ioc3ViTmFtZTogc3RyaW5nLCBrZXlGaWVsZDogc3RyaW5nLCBpbmRleEZpZWxkcyA9IG5ldyBBcnJheTxJbmRleEZpZWxkPigpKSB7XG4gICAgdGhpcy5zdWJOYW1lID0gc3ViTmFtZVxuICAgIHRoaXMua2V5RmllbGQgPSBrZXlGaWVsZFxuICAgIHRoaXMuaW5kZXhGaWVsZHMgPSBuZXcgQXJyYXk8SW5kZXhGaWVsZD4oKS5jb25jYXQoaW5kZXhGaWVsZHMpXG4gIH1cblxuICBwcml2YXRlIGZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSA6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmluZGV4RmllbGRzLmZpbmRJbmRleChpdGVtID0+IGZpZWxkTmFtZSA9PT0gaXRlbS5maWVsZE5hbWUpXG4gIH1cblxuICBwdWJsaWMgZXhpc3RzSW5kZXgoZmllbGROYW1lOiBzdHJpbmcpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZmluZEluZGV4T2ZGaWVsZE5hbWUoZmllbGROYW1lKSA+IC0xXG4gIH1cblxuICBwdWJsaWMgYWRkSW5kZXgoZmllbGROYW1lIDogc3RyaW5nLCBjYWxjSW5kZXggOiBHZXRJbmRleFZhbHVlRnVuYyk6IHRoaXMge1xuICAgIGlmICh0aGlzLmV4aXN0c0luZGV4KGZpZWxkTmFtZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEluZGV4IG9mIGZpZWxkICcke2ZpZWxkTmFtZX0nIGFscmVhZHkgZXhpc3RzYClcblxuICAgIHRoaXMuaW5kZXhGaWVsZHMucHVzaCh7IGZpZWxkTmFtZSwgY2FsY0luZGV4IH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVJbmRleChmaWVsZE5hbWUpOiB0aGlzIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmZpbmRJbmRleE9mRmllbGROYW1lKGZpZWxkTmFtZSlcbiAgICBpZiAoaWR4ID4gLTEpIHtcbiAgICAgIHRoaXMuaW5kZXhGaWVsZHMuc2xpY2UoaWR4LCAxKVxuICAgIH1cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VQcm9taXNlKCkgOiBDYWxsYmFjazxhbnk+IHtcbiAgbGV0IGNhbGxiYWNrXG4gIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjYWxsYmFjayA9IChlcnIsIHZhbHVlKSA9PiBlcnIgPyByZWplY3QoZXJyKSA6IHJlc29sdmUodmFsdWUpXG4gIH0pXG4gIGNhbGxiYWNrLnByb21pc2UgPSBwcm9taXNlXG4gIHJldHVybiBjYWxsYmFja1xufVxuXG5mdW5jdGlvbiBwcm9taXNpZnkoY2FsbGJhY2sgOiBDYWxsYmFjazxhbnk+IHwgdW5kZWZpbmVkICkgOiB7IGNhbGxiYWNrOiBDYWxsYmFjazxhbnk+LCBwcm9taXNlOiBQcm9taXNlPGFueT58bnVsbCB9IHtcbiAgbGV0IHByb21pc2UgPSBudWxsXG5cbiAgaWYgKCAhY2FsbGJhY2sgKSB7XG4gICAgY2FsbGJhY2sgPSBtYWtlUHJvbWlzZSgpXG4gICAgcHJvbWlzZSA9IGNhbGxiYWNrWydwcm9taXNlJ11cbiAgfVxuXG4gIHJldHVybnsgY2FsbGJhY2ssIHByb21pc2UgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsUmVhZGFibGVTdHJlYW0gZXh0ZW5kcyBSZWFkYWJsZVN0cmVhbSB7XG4gIG9uKCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2sgOiBGdW5jdGlvbiApIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsR2V0IHtcbiAgZ2V0PFQ+KGtleTogYW55LCBvcHRpb25zPzogSnNvbk9iamVjdCwgZ2V0Q2FsbGJhY2s/IDogQ2FsbGJhY2s8VD4pIDogUHJvbWlzZTxUPlxuICBjcmVhdGVSZWFkU3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlS2V5U3RyZWFtKG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IExldmVsUmVhZGFibGVTdHJlYW1cbiAgY3JlYXRlVmFsdWVTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIExldmVsT3BlcmF0aW9uIHtcbiAgcHV0PFQ+KGtleSA6IGFueSwgdmFsdWUgOiBULCBvcHRpb25zPzogSnNvbk9iamVjdCwgY2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGRlbChrZXk6IGFueSwgZGVsQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+XG4gIGJhdGNoKG9wZXJBcnJheTogQXJyYXk8SnNvbk9iamVjdD4sIG9wdGlvbnM/OiBKc29uT2JqZWN0KSA6IFByb21pc2U8dm9pZD4gXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5kZXhlZExldmVsIGV4dGVuZHMgTGV2ZWxHZXQsIExldmVsT3BlcmF0aW9uIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBpbmRleGVzIDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgYnlJbmRleChpbmRleEZpZWxkOiBzdHJpbmcpIDogTGV2ZWxHZXRcbiAgZ2V0QnkoaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPEpzb25PYmplY3Q+KTogUHJvbWlzZTxKc29uT2JqZWN0PlxufVxuXG5leHBvcnQgY2xhc3MgTGV2ZWxEQiB7ICBcbiAgcHJpdmF0ZSBkYkRpciA6IHN0cmluZ1xuICBwcml2YXRlIHN1Yk1ldGFzIDogQXJyYXk8U3ViTGV2ZWxNZXRhPlxuICBwcml2YXRlIHN1YkxldmVscyA6IE1hcDxzdHJpbmcsIEluZGV4ZWRMZXZlbD5cbiAgcHJpdmF0ZSBsZXZlbGRiIDogYW55XG4gIHByaXZhdGUgc3ViTGV2ZWxkYiA6IHN1YmxldmVsLlN1YmxldmVsXG5cbiAgY29uc3RydWN0b3IoZGJEaXIgOiBzdHJpbmcsIG1ldGEgOiBBcnJheTxTdWJMZXZlbE1ldGE+LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmRiRGlyID0gZGJEaXJcbiAgICB0aGlzLnN1Yk1ldGFzID0gbmV3IEFycmF5PFN1YkxldmVsTWV0YT4oKS5jb25jYXQobWV0YSlcbiAgICB0aGlzLnN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBJbmRleGVkTGV2ZWw+KClcbiAgICB0aGlzLmxldmVsZGIgPSBudWxsXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGluaXQoKSB7XG4gICAgdGhpcy5sZXZlbGRiID0gbGV2ZWwoIHRoaXMuZGJEaXIsIHsgdmFsdWVFbmNvZGluZzogJ2pzb24nIH0gKVxuICAgIHRoaXMuc3ViTGV2ZWxkYiA9IHN1YmxldmVsKHRoaXMubGV2ZWxkYilcbiAgICB0aGlzLnN1Yk1ldGFzLmZvckVhY2gocyA9PiB0aGlzLnJlZ2lzdGVyU3ViTGV2ZWwocykpXG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU3ViTGV2ZWwoIG1ldGE6IFN1YkxldmVsTWV0YSApIHtcbiAgICBjb25zdCBzdWIgPSB0aGlzLnN1YkxldmVsZGIuc3VibGV2ZWwobWV0YS5zdWJOYW1lKVxuICAgIGNvbnN0IGluZGV4ZWRTdWIgPSBuZXcgSW5kZXhlZFN1YkxldmVsKHN1YiwgbWV0YS5zdWJOYW1lLCBtZXRhLmtleUZpZWxkLCAuLi5tZXRhLmluZGV4RmllbGRzKSAgICBcbiAgICB0aGlzLnN1YkxldmVscy5zZXQoIG1ldGEuc3ViTmFtZSwgaW5kZXhlZFN1YilcbiAgfVxuXG4gIHB1YmxpYyBnZXQgbGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYlxuICB9XG5cbiAgcHVibGljIGdldFN1YkxldmVsKCBzdWJOYW1lOiBzdHJpbmcgKSA6IEluZGV4ZWRMZXZlbCB7XG4gICAgY29uc3Qgc3ViID0gdGhpcy5zdWJMZXZlbHMuZ2V0KHN1Yk5hbWUpXG4gICAgaWYgKCAhc3ViICkgdGhyb3cgbmV3IEVycm9yKGBObyBzdWNoIHN1YkxldmVsIG5hbWUgPSAnJHtzdWJOYW1lfSdgKVxuXG4gICAgcmV0dXJuIHN1YlxuICB9XG5cbiAgcHVibGljIG9wZW4ob3BlbkNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pOiBQcm9taXNlPHZvaWQ+fG51bGwge1xuICAgIGxldCBzZWxmID0gdGhpc1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkob3BlbkNhbGxiYWNrKVxuXG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgcmV0dXJuIHByb21pc2VcbiAgICB9XG4gICAgXG4gICAgKGFzeW5jKCk9PiB7IFxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5pbml0KClcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjaywgbnVsbCwgc2VsZikgICAgICBcbiAgICAgIH1cbiAgICAgIGNhdGNoKGVycikge1xuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBlcnIsIHNlbGYpXG4gICAgICB9XG4gICAgfSkoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBjbG9zZShjbG9zZUNhbGxiYWNrPyA6IENhbGxiYWNrPGFueT4pIDogUHJvbWlzZTx2b2lkPnxudWxsIHtcbiAgICBsZXQgc2VsZiA9IHRoaXNcbiAgICBsZXQgeyBjYWxsYmFjaywgcHJvbWlzZSB9ID0gcHJvbWlzaWZ5KGNsb3NlQ2FsbGJhY2spXG4gICAgXG4gICAgaWYgKHRoaXMuaXNDbG9zZWQpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIG51bGwsIHNlbGYpXG4gICAgICByZXR1cm4gcHJvbWlzZVxuICAgIH1cblxuICAgIChhc3luYygpPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5sZXZlbGRiLmNsb3NlKClcbiAgICAgICAgdGhpcy5sZXZlbGRiID0gbnVsbFxuICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGNhbGxiYWNrLCBudWxsLCBzZWxmKVxuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soY2FsbGJhY2ssIGVycilcbiAgICAgIH0gIFxuICAgIH0pKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzT3BlbigpIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiICYmIHRoaXMubGV2ZWxkYi5pc09wZW4oKVxuICB9XG5cbiAgcHVibGljIGdldCBpc0Nsb3NlZCgpIHtcbiAgICByZXR1cm4gKCF0aGlzLmxldmVsZGIpIHx8IHRoaXMubGV2ZWxkYi5pc0Nsb3NlZCgpXG4gIH1cbn1cblxuY2xhc3MgSW5kZXhlZFN1YkxldmVsIGltcGxlbWVudHMgSW5kZXhlZExldmVsIHtcbiAgcHJpdmF0ZSBzdWJOYW1lIDogc3RyaW5nXG4gIHByaXZhdGUga2V5RmllbGQgOiBzdHJpbmdcbiAgcHJpdmF0ZSBpbmRleEFycmF5IDogQXJyYXk8SW5kZXhGaWVsZD5cbiAgcHJpdmF0ZSBpbmRleGVkU3ViTGV2ZWxzIDogTWFwPHN0cmluZywgTGV2ZWxHZXQ+XG4gIHByaXZhdGUgbGV2ZWxkYiA6IGFueVxuXG4gIHB1YmxpYyBnZXQgbmFtZSgpIHsgcmV0dXJuIHRoaXMuc3ViTmFtZSB9XG4gIHB1YmxpYyBnZXQgaW5kZXhlcygpIHsgcmV0dXJuIHRoaXMuaW5kZXhBcnJheSB9XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBzdWJsZXZlbDogYW55LCBzdWJOYW1lOiBzdHJpbmcsIGtleUZpZWxkIDogc3RyaW5nLCAuLi5pbmRleEZpZWxkcyA6IEFycmF5PEluZGV4RmllbGQ+KSB7XG4gICAgdGhpcy5sZXZlbGRiID0gc3VibGV2ZWxcbiAgICB0aGlzLnN1Yk5hbWUgPSBzdWJOYW1lXG4gICAgdGhpcy5rZXlGaWVsZCA9IGtleUZpZWxkXG4gICAgdGhpcy5pbmRleEFycmF5ID0gbmV3IEFycmF5PEluZGV4RmllbGQ+KCkuY29uY2F0KC4uLmluZGV4RmllbGRzKVxuICAgIHRoaXMuaW5kZXhlZFN1YkxldmVscyA9IG5ldyBNYXA8c3RyaW5nLCBMZXZlbEdldD4oKVxuICAgIHRoaXMuaW5kZXhBcnJheS5mb3JFYWNoKCBmID0+IHtcbiAgICAgIGxldCBzdWIgPSBTZW5vbmRhcnkoIHN1YmxldmVsLCBmLmZpZWxkTmFtZSwgZi5jYWxjSW5kZXggKVxuICAgICAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLnNldCggZi5maWVsZE5hbWUsIHN1YiApXG4gICAgfSlcbiAgfVxuXG4gIHB1YmxpYyBnZXQga2V5KCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleUZpZWxkXG4gIH1cbiAgXG4gIHB1YmxpYyBhc3luYyBnZXQ8VD4oa2V5OiBhbnksIG9wdGlvbnM6IEpzb25PYmplY3QsIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+ICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IGtleUxldmVsID0gdGhpcy5sZXZlbGRiIGFzIEluZGV4ZWRTdWJMZXZlbCBcbiAgICBsZXQgeyBjYWxsYmFjayAsIHByb21pc2UgfSA9IHByb21pc2lmeShnZXRDYWxsYmFjaylcbiAgICBrZXlMZXZlbC5nZXQ8VD4oa2V5LCBvcHRpb25zLCBjYWxsYmFjaylcbiAgICBcbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbiAgcHVibGljIGJ5SW5kZXgoIGluZGV4RmllbGROYW1lIDogc3RyaW5nICkgOiBMZXZlbEdldCB7XG4gICAgY29uc3QgbGV2ZWxHZXQgPSAgdGhpcy5pbmRleGVkU3ViTGV2ZWxzLmdldChpbmRleEZpZWxkTmFtZSlcbiAgICBpZiAoICFsZXZlbEdldCApIHRocm93IG5ldyBFcnJvcihgTm8gc3VjaCBpbmRleCBmaWVsZCA9ICcke2luZGV4RmllbGROYW1lfSdgKVxuXG4gICAgcmV0dXJuIGxldmVsR2V0XG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0Qnk8VD4oaW5kZXhGaWVsZCA6IHN0cmluZywga2V5OiBhbnksIGdldENhbGxiYWNrPyA6IENhbGxiYWNrPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgaW5kZXhMZXZlbCA9IHRoaXMuYnlJbmRleChpbmRleEZpZWxkKVxuICAgIHJldHVybiBhd2FpdCBpbmRleExldmVsLmdldDxUPihrZXksIGdldENhbGxiYWNrKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHB1dDxUPihrZXk6IGFueSwgdmFsdWU6IFQsIHB1dENhbGxiYWNrPyA6IENhbGxiYWNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IHsgY2FsbGJhY2sgLCBwcm9taXNlIH0gPSBwcm9taXNpZnkocHV0Q2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLnB1dChrZXksIHZhbHVlLCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZGVsKGtleTogYW55LCBkZWxDYWxsYmFjaz8gOiBDYWxsYmFjazx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGxldCB7IGNhbGxiYWNrLCBwcm9taXNlIH0gPSBwcm9taXNpZnkoZGVsQ2FsbGJhY2spXG4gICAgdGhpcy5sZXZlbGRiLmRlbChrZXksIGNhbGxiYWNrKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBiYXRjaChhcnJheSA6IEFycmF5PEpzb25PYmplY3Q+LCBvcHRpb25zPyA6IEpzb25PYmplY3QsIGJhdGNoQ2FsbGJhY2s/IDogQ2FsbGJhY2s8dm9pZD4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIGFyZ3VtZW50cy5sZW5ndGggPT09IDAgKSByZXR1cm4gdGhpcy5sZXZlbGRiLmJhdGNoKClcblxuICAgIGxldCBoYXNPcHRpb25zID0gb3B0aW9ucyAmJiAoIWlzRnVuY3Rpb24ob3B0aW9ucykpXG4gICAgbGV0IHsgY2FsbGJhY2ssIHByb21pc2UgfSA9IHByb21pc2lmeSggaGFzT3B0aW9ucyA/IGJhdGNoQ2FsbGJhY2sgOiBvcHRpb25zIGFzIENhbGxiYWNrPGFueT4pXG5cbiAgICBpZiAoaGFzT3B0aW9ucylcbiAgICAgIHRoaXMubGV2ZWxkYi5iYXRjaChhcnJheSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZWxzZVxuICAgICAgdGhpcy5sZXZlbGRiLmJhdGNoKGFycmF5LCBjYWxsYmFjaylcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxuICBwdWJsaWMgY3JlYXRlUmVhZFN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVJlYWRTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVLZXlTdHJlYW0ob3B0aW9ucz86IEpzb25PYmplY3QpIDogTGV2ZWxSZWFkYWJsZVN0cmVhbSB7XG4gICAgcmV0dXJuIHRoaXMubGV2ZWxkYi5jcmVhdGVLZXlTdHJlYW0ob3B0aW9ucylcbiAgfVxuXG4gIHB1YmxpYyBjcmVhdGVWYWx1ZVN0cmVhbShvcHRpb25zPzogSnNvbk9iamVjdCkgOiBMZXZlbFJlYWRhYmxlU3RyZWFtIHtcbiAgICByZXR1cm4gdGhpcy5sZXZlbGRiLmNyZWF0ZVZhbHVlU3RyZWFtKG9wdGlvbnMpXG4gIH1cblxufVxuIiwiaW1wb3J0IHsgTGV2ZWxEQiwgSW5kZXhlZExldmVsLCBTdWJMZXZlbE1ldGEgfSBmcm9tICcuL0tWREIvTGV2ZWxEQidcbmltcG9ydCB7IEVudGl0eUNoYW5nZXNJdGVtIH0gZnJvbSAnLi9TdGF0ZVRyYWNrZXIvRW50aXR5VHJhY2tlcidcbmltcG9ydCB7IE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5pbXBvcnQgeyBCbG9ja0hlYWRlciB9IGZyb20gJy4vQmxvY2snXG5cbmNvbnN0IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSA9ICdfX2xhc3RfYmxvY2tfaGVpZ2h0X18nXG5cbmV4cG9ydCBjbGFzcyBMZXZlbEJsb2NrIHtcbiAgcHJpdmF0ZSBkYiA6IExldmVsREJcbiAgcHJpdmF0ZSBibG9ja0RiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgaGlzdG9yeURiIDogSW5kZXhlZExldmVsXG4gIHByaXZhdGUgbGFzdEhlaWdodCA6IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yKCBkaXIgOiBzdHJpbmcsIGxldmVsT3B0aW9ucyA9IHt9ICkge1xuICAgIC8qIFxuICAgICAgeyBpZCg2NCksIHRpbWVzdGFtcChiaWdpbnQpLCBoZWlnaHQoYmlnaW50KSwgcGF5bG9hZExlbmd0aChiaWdpbnQpLCBwYXlsb2FkSGFzaCg2NCksIHByZXZCbG9ja0lkKDY0KSwgXG4gICAgICAgIHBvaW50SWQoNjQpLCBwb2ludEhlaWdodChiaWdpbnQpLCBkZWxlZ2F0ZSg2NCksIHNpZ25hdHVyZSgxMjgpLCBjb3VudChiaWdpbnQpIH1cbiAgICAqL1xuICAgIGNvbnN0IGJsb2NrTWV0YSA9IG5ldyBTdWJMZXZlbE1ldGEoJ2JsaycsICdoZWlnaHQnLCBbXG4gICAgICB7IGZpZWxkTmFtZTogJ2lkJyB9LCBcbiAgICAgIHsgZmllbGROYW1lOiAnZGVsZWdhdGUnIH1cbiAgICBdKVxuICAgIGNvbnN0IGNoYW5nZXNMb2dNZXRhID0gbmV3IFN1YkxldmVsTWV0YSgnaGlzJywgJ2hlaWdodCcsIFtdKVxuICAgIFxuICAgIHRoaXMuZGIgPSBuZXcgTGV2ZWxEQiggZGlyLCBbYmxvY2tNZXRhLCBjaGFuZ2VzTG9nTWV0YV0sIGxldmVsT3B0aW9ucyApXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gLTFcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZ2V0TGFzdEJsb2NrSGVpZ2h0RnJvbURiKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCB7IGhlaWdodCB9ID0gIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8eyBoZWlnaHQ6IG51bWJlciB9PihMQVNUX0JMT0NLX0hFSUdIVF9LRVksIHt9KVxuICAgICAgcmV0dXJuIGhlaWdodFxuICAgIH1cbiAgICBjYXRjaChlKSB7XG4gICAgICBpZiAoIXRoaXMuaXNLZXlOb3RGb3VuZEVycm9yKGUpKSB0aHJvdyBlIFxuXG4gICAgICBsZXQgbGFzdEhlaWdodCA9IHsgaGVpZ2h0OiAtMSB9XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrRGIucHV0KExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgbGFzdEhlaWdodClcbiAgICAgIHJldHVybiBsYXN0SGVpZ2h0LmhlaWdodFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBvcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIub3BlbigpXG4gICAgdGhpcy5ibG9ja0RiID0gdGhpcy5kYi5nZXRTdWJMZXZlbCgnYmxrJylcbiAgICB0aGlzLmhpc3RvcnlEYiA9IHRoaXMuZGIuZ2V0U3ViTGV2ZWwoJ2hpcycpXG4gICAgdGhpcy5sYXN0SGVpZ2h0ID0gYXdhaXQgdGhpcy5nZXRMYXN0QmxvY2tIZWlnaHRGcm9tRGIoKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuZGIuY2xvc2UoKVxuICB9XG5cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7IFxuICAgIHJldHVybiB0aGlzLmxhc3RIZWlnaHQgXG4gIH1cblxuICBwcml2YXRlIGlzS2V5Tm90Rm91bmRFcnJvcihlKSA6IGJvb2xlYW4geyBcbiAgICByZXR1cm4gZS5uYW1lID09PSAnTm90Rm91bmRFcnJvcicgXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgYXBwZW5kQmxvY2soIGJsb2NrIDogQmxvY2tIZWFkZXIsIGNoYW5nZXM6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIWJsb2NrIHx8ICFibG9jay5pZCB8fCAhYmxvY2suZGVsZWdhdGUgfHwgYmxvY2suaGVpZ2h0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgYmxvY2sgZGF0YWApXG5cbiAgICBhd2FpdCB0aGlzLmhpc3RvcnlEYi5wdXQoYmxvY2suaGVpZ2h0LCBjaGFuZ2VzKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdwdXQnLCBrZXkgOiBibG9jay5oZWlnaHQsIHZhbHVlOiBibG9jayB9LFxuICAgICAgeyB0eXBlOiAncHV0Jywga2V5IDogTEFTVF9CTE9DS19IRUlHSFRfS0VZLCB2YWx1ZTogeyBoZWlnaHQ6IGJsb2NrLmhlaWdodCB9IH0gXSlcblxuICAgIHRoaXMubGFzdEhlaWdodCA9IGJsb2NrLmhlaWdodFxuICB9XG5cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKTogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9ja0hlYWRlcj4+IHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuYmxvY2tEYi5nZXQ8QmxvY2tIZWFkZXI+KGhlaWdodClcbiAgICB9XG4gICAgY2F0Y2goZSkge1xuICAgICAgaWYgKCF0aGlzLmlzS2V5Tm90Rm91bmRFcnJvcihlKSkgdGhyb3cgZVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZ2V0SGlzdG9yeUNoYW5nZXMoIG1pbkhlaWdodDogbnVtYmVyLCBtYXhIZWlnaHQ6IG51bWJlciApIDogUHJvbWlzZTxNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+PiB7XG4gICAgbGV0IHJldCAgPSBuZXcgTWFwPG51bWJlciwgQXJyYXk8RW50aXR5Q2hhbmdlc0l0ZW0+PigpXG4gICAgZm9yKCBsZXQgaCA9IG1pbkhlaWdodDsgaCA8IG1heEhlaWdodDsgaCsrICkge1xuICAgICAgY29uc3QgY2hhbmdlcyA9IGF3YWl0IHRoaXMuaGlzdG9yeURiLmdldDxBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+KGgpXG4gICAgICBjaGFuZ2VzICYmIHJldC5zZXQoIGgsIGNoYW5nZXMgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0IFxuICB9XG4gIFxuICBwdWJsaWMgYXN5bmMgZGVsZXRlTGFzdEJsb2NrKCBoZWlnaHQgOiBudW1iZXIgKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChoZWlnaHQgIT09IHRoaXMubGFzdEJsb2NrSGVpZ2h0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGxhc3QgYmxvY2sgaGVpZ2h0ICcke2hlaWdodH0nYClcblxuICAgIGF3YWl0IHRoaXMuYmxvY2tEYi5iYXRjaChbXG4gICAgICB7IHR5cGU6ICdkZWwnLCBrZXkgOiBoZWlnaHQgfSxcbiAgICAgIHsgdHlwZTogJ3B1dCcsIGtleSA6IExBU1RfQkxPQ0tfSEVJR0hUX0tFWSwgdmFsdWU6IHsgaGVpZ2h0OiBoZWlnaHQgLSAxIH0gfSBdKVxuICAgIGF3YWl0IHRoaXMuaGlzdG9yeURiLmRlbCggaGVpZ2h0IClcbiAgICBcbiAgICB0aGlzLmxhc3RIZWlnaHQgLS1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2tIZWFkZXI+PiB7XG4gICAgbGV0IGJsb2NrcyA9IGF3YWl0IHRoaXMuYmxvY2tEYi5nZXRCeSgnaWQnLCBibG9ja0lkKVxuICAgIHJldHVybiAoYmxvY2tzLmxlbmd0aCA9PT0gMCkgPyB1bmRlZmluZWQgOiBibG9ja3NbMF1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUhlaWdodFJhbmdlKCBtaW5IZWlnaHQ6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIHJldHVybiBhd2FpdCAoKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoIChyZXMsIHJlaikgPT4ge1xuICAgICAgICBsZXQgYmxvY2tzID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpICAgICAgXG4gICAgICAgIHRoaXMuYmxvY2tEYi5jcmVhdGVSZWFkU3RyZWFtKHsgc3RhcnQ6IG1pbkhlaWdodCwgZW5kOiBtYXhIZWlnaHR9KVxuICAgICAgICAgIC5vbignZGF0YScsIGRhdGEgPT4gYmxvY2tzLnB1c2goZGF0YSkgKVxuICAgICAgICAgIC5vbignZXJyb3InLCBlID0+IHJlaihlKSApXG4gICAgICAgICAgLm9uKCdlbmQnLCAoKSA9PiByZXMoYmxvY2tzKSApXG4gICAgICB9KVxuICAgIH0pKG1pbkhlaWdodCwgbWF4SGVpZ2h0KSBhcyBBcnJheTxCbG9ja0hlYWRlcj5cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+ICkgOiBQcm9taXNlPEFycmF5PEJsb2NrSGVhZGVyPj4ge1xuICAgIGxldCByZXQgID0gbmV3IEFycmF5PEJsb2NrSGVhZGVyPigpXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBibG9ja0lkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGxldCBibG9jayA9IGF3YWl0IHRoaXMuZ2V0QmxvY2tCeUlkKCBibG9ja0lkc1tpXSApXG4gICAgICBibG9jayAmJiByZXQucHVzaCggYmxvY2sgKVxuICAgIH1cbiAgICByZXR1cm4gcmV0XG4gIH1cbn0iLCJleHBvcnQgZW51bSBMb2dMZXZlbCB7XG4gIEFsbCAgICA9IDEyOCAtIDEsXG4gIFRyYWNlICA9IDY0LFxuICBEZWJ1ZyAgPSAzMixcbiAgTG9nICAgID0gMTYsXG4gIEluZm8gICA9IDgsXG4gIFdhcm4gICA9IDQsXG4gIEVycm9yICA9IDIsXG4gIEZhdGFsICA9IDEsXG4gIE5vbmUgICA9IDBcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2dnZXIge1xuICBsb2dMZXZlbCA6IExvZ0xldmVsXG4gIHJlYWRvbmx5IGluZm9FbmFibGVkICA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgdHJhY2VFbmFibGVkIDogYm9vbGVhblxuICByZWFkb25seSBsb2dFbmFibGVkICAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGRlYnVnRW5hYmxlZCA6IGJvb2xlYW5cbiAgcmVhZG9ubHkgd2FybkVuYWJsZWQgIDogYm9vbGVhblxuICByZWFkb25seSBlcnJvckVuYWxlZCAgOiBib29sZWFuXG4gIHJlYWRvbmx5IGZhdGFsRW5hYmxlZCA6IGJvb2xlYW5cblxuICB0cmFjZSggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgZGVidWcoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgaW5mbyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtcyA6IGFueVtdICk6IHZvaWRcbiAgd2FybiggbXNnOiBzdHJpbmcgLCAuLi5wYXJhbXMgOiBhbnlbXSApOiB2b2lkXG4gIGVycm9yKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG4gIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvciApOiB2b2lkXG59XG5cbmNsYXNzIExvZ2dlckFkYXB0ZXIgaW1wbGVtZW50cyBMb2dnZXIge1xuICBwcml2YXRlIGxldmVsIDogTG9nTGV2ZWxcbiAgcHJpdmF0ZSBuYW1lIDogc3RyaW5nXG4gIHByaXZhdGUgZm9ybWF0IDogYm9vbGVhblxuICBwcml2YXRlIGdldExvZ2dlciA6ICgpID0+IExvZ2dlclxuXG4gIHB1YmxpYyBnZXQgaW5mb0VuYWJsZWQoKSAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5JbmZvKSAgPiAwIH1cbiAgcHVibGljIGdldCB0cmFjZUVuYWJsZWQoKSB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLlRyYWNlKSA+IDAgfVxuICBwdWJsaWMgZ2V0IGRlYnVnRW5hYmxlZCgpIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRGVidWcpID4gMCB9XG4gIHB1YmxpYyBnZXQgbG9nRW5hYmxlZCgpICAgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5Mb2cpICAgPiAwIH1cbiAgcHVibGljIGdldCB3YXJuRW5hYmxlZCgpICB7IHJldHVybiAodGhpcy5sZXZlbCAmIExvZ0xldmVsLldhcm4pICA+IDAgfVxuICBwdWJsaWMgZ2V0IGVycm9yRW5hbGVkKCkgIHsgcmV0dXJuICh0aGlzLmxldmVsICYgTG9nTGV2ZWwuRXJyb3IpID4gMCB9XG4gIHB1YmxpYyBnZXQgZmF0YWxFbmFibGVkKCkgeyByZXR1cm4gKHRoaXMubGV2ZWwgJiBMb2dMZXZlbC5GYXRhbCkgPiAwIH1cblxuICBwdWJsaWMgZ2V0IGxvZ0xldmVsKCkgeyByZXR1cm4gdGhpcy5sZXZlbCB9XG4gIHB1YmxpYyBzZXQgbG9nTGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHsgdGhpcy5sZXZlbCA9IGxldmVsIH1cblxuICBwdWJsaWMgY29uc3RydWN0b3IoZ2V0TG9nZ2VyOiAoKSA9PiBMb2dnZXIsIGZvcm1hdE1lc3NhZ2UgPSBmYWxzZSwgbG9nZ2VyTmFtZTogc3RyaW5nLCBsZXZlbCA9IExvZ0xldmVsLkFsbCApIHtcbiAgICB0aGlzLm5hbWUgPSBsb2dnZXJOYW1lXG4gICAgdGhpcy5sZXZlbCA9IGxldmVsXG4gICAgdGhpcy5nZXRMb2dnZXIgPSBnZXRMb2dnZXJcbiAgICB0aGlzLmZvcm1hdCA9IGZvcm1hdE1lc3NhZ2VcbiAgfVxuXG4gIHByb3RlY3RlZCBmcm9tYXRNZXNzYWdlKCBtc2c6IHN0cmluZywgbG9nVHlwZTogc3RyaW5nICkgOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtuZXcgRGF0ZSgpLnRvTG9jYWxlVGltZVN0cmluZygpfSBbJHtsb2dUeXBlfV0gWyR7dGhpcy5uYW1lfV0gJHttc2d9YFxuICB9XG5cbiAgcHVibGljIGluZm8oIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnSU5GTycgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuaW5mbyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGRlYnVnKCBtc2c6IHN0cmluZywgLi4ucGFyYW1zOiBhbnlbXSApOiB2b2lkIHtcbiAgICBtc2cgPSAhdGhpcy5mb3JtYXQgPyBtc2cgOiB0aGlzLmZyb21hdE1lc3NhZ2UoIG1zZywgJ0RFQlVHJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS5kZWJ1ZyggbXNnLCAuLi5wYXJhbXMgKVxuICB9XG5cbiAgcHVibGljIGxvZyggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdMT0cnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgdHJhY2UoIG1zZzogc3RyaW5nLCAuLi5wYXJhbXM6IGFueVtdICk6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnVFJBQ0UnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmRlYnVnKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgd2FybiggbXNnOiBzdHJpbmcsIC4uLnBhcmFtczogYW55W10gKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdXQVJOJyApXG4gICAgdGhpcy5nZXRMb2dnZXIoKS53YXJuKCBtc2csIC4uLnBhcmFtcyApXG4gIH1cblxuICBwdWJsaWMgZXJyb3IoIG1zZzogc3RyaW5nLCBlcnI6IEVycm9yKTogdm9pZCB7XG4gICAgbXNnID0gIXRoaXMuZm9ybWF0ID8gbXNnIDogdGhpcy5mcm9tYXRNZXNzYWdlKCBtc2csICdFUlJPUicgKVxuICAgIHRoaXMuZ2V0TG9nZ2VyKCkuZXJyb3IoIG1zZywgZXJyKVxuICB9XG5cbiAgcHVibGljIGZhdGFsKCBtc2c6IHN0cmluZywgZXJyOiBFcnJvcik6IHZvaWQge1xuICAgIG1zZyA9ICF0aGlzLmZvcm1hdCA/IG1zZyA6IHRoaXMuZnJvbWF0TWVzc2FnZSggbXNnLCAnRkFUQUwnIClcbiAgICB0aGlzLmdldExvZ2dlcigpLmVycm9yKCBtc2csIGVycilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTG9nTWFuYWdlciB7XG4gIHByaXZhdGUgc3RhdGljIGRlZmF1bHRMb2dMZXZlbCA9IExvZ0xldmVsLkFsbFxuICBwcml2YXRlIHN0YXRpYyBjcmVhdGVMb2dnZXIgPSAoKSA9PiAgY29uc29sZSBhcyBPYmplY3QgYXMgTG9nZ2VyIFxuICBwcml2YXRlIHN0YXRpYyBkZWZhdWx0TG9nZ2VyID0gbmV3IExvZ2dlckFkYXB0ZXIoIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCAnZGVmYXVsdCcsIExvZ01hbmFnZXIuZGVmYXVsdExvZ0xldmVsIClcblxuICBwdWJsaWMgc3RhdGljIHNldCBkZWZhdWx0TGV2ZWwoIGxldmVsOiBMb2dMZXZlbCApIHtcbiAgICBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCA9IGxldmVsXG4gIH1cbiAgXG4gIHB1YmxpYyBzdGF0aWMgc2V0IGxvZ0ZhY3RvcnkgKCB2YWx1ZTogKCkgPT4gTG9nZ2VyICkge1xuICAgIExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyID0gdmFsdWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TG9nZ2VyKGxvZ2dlck5hbWU/OiBzdHJpbmcsIGxldmVsPyA6IExvZ0xldmVsKSA6IExvZ2dlciB7XG4gICAgcmV0dXJuIGxvZ2dlck5hbWUgPyBcbiAgICAgIG5ldyBMb2dnZXJBZGFwdGVyKExvZ01hbmFnZXIuY3JlYXRlTG9nZ2VyLCB0cnVlLCBsb2dnZXJOYW1lLCBsZXZlbCB8fCBMb2dNYW5hZ2VyLmRlZmF1bHRMb2dMZXZlbCkgOiBcbiAgICAgIExvZ01hbmFnZXIuZGVmYXVsdExvZ2dlcjtcbiAgfVxufVxuIiwiaW1wb3J0IHsgaXNTdHJpbmcgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgRW50aXR5S2V5LCBLZXlPYmplY3QsIENvZGVDb250cmFjdCBhcyBEQkMsIHBhcnRpYWwsIEpzb25PYmplY3QsIE1heWJlVW5kZWZpbmVkIH0gZnJvbSAnLi9Db21tb24nXG5cbmV4cG9ydCB0eXBlIENvbnN0cnVjdG9yPFQ+ID0geyBuZXcoKSA6IFQgfVxuZXhwb3J0IHR5cGUgTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+ID0gc3RyaW5nIHwgQ29uc3RydWN0b3I8VEVudGl0eT5cblxuZXhwb3J0IGVudW0gRmllbGRUeXBlcyB7XG4gIFN0cmluZyAgID0gJ1N0cmluZycsXG4gIE51bWJlciAgID0gJ051bWJlcicsXG4gIEJpZ0ludCAgID0gJ0JpZ0ludCcsXG4gIFRleHQgICAgID0gJ1RleHQnXG59XG5cbmV4cG9ydCB0eXBlIEZpZWxkVHlwZSA9IHN0cmluZyB8IEZpZWxkVHlwZXNcblxuZXhwb3J0IGludGVyZmFjZSBGaWVsZCB7XG4gIG5hbWU6IHN0cmluZyxcbiAgdHlwZTogRmllbGRUeXBlLFxuICBsZW5ndGg/OiBudW1iZXIgLFxuICBpbmRleD86IGJvb2xlYW4sXG4gIG5vdF9udWxsPzogYm9vbGVhbixcbiAgcHJpbWFyeV9rZXk/IDogYm9vbGVhbixcbiAgY29tcG9zaXRlX2tleT8gOiBib29sZWFuLFxuICBkZWZhdWx0PzogbnVtYmVyfHN0cmluZ3xudWxsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hIHtcbiAgdGFibGU/IDogc3RyaW5nLFxuICBtZW1vcnk/IDogYm9vbGVhbixcbiAgcmVhZG9ubHk/IDogYm9vbGVhbixcbiAgbG9jYWw/IDogYm9vbGVhbixcbiAgdGFibGVGaWVsZHMgOiBBcnJheTxGaWVsZD5cbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZUtleSBpbXBsZW1lbnRzIEtleU9iamVjdCB7XG4gIHByaXZhdGUga2V5T2JqZWN0IDogSnNvbk9iamVjdFxuXG4gIHB1YmxpYyBjb25zdHJ1Y3Rvcigga2V5T2JqZWN0IDogSnNvbk9iamVjdCApIHtcbiAgICBEQkMuYXJndW1lbnQoICdrZXlPYmplY3QnLCAoKSA9PiBEQkMubm90TnVsbChrZXlPYmplY3QpKVxuXG4gICAgdGhpcy5rZXlPYmplY3QgPSBrZXlPYmplY3RcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgbWFrZTxURW50aXR5Piggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5IDogVEVudGl0eSApIDogQ29tcG9zaXRlS2V5IHtcbiAgICBEQkMuYXJndW1lbnQoICdzY2hlbWEnLCAoKSA9PiBEQkMubm90TnVsbChzY2hlbWEpKVxuICAgIERCQy5hcmd1bWVudCggJ3NjaGVtYScsIHNjaGVtYS5pc0NvbXBzaXRlS2V5LCAnbW9kZWwgbXVzdCBpbmRlbnRpZnkgYnkgY29tcG9zaXRlIGtleScpXG4gICAgREJDLmFyZ3VtZW50KCAnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KCBwYXJ0aWFsKGVudGl0eSwgLi4uc2NoZW1hLmNvbXBvc2l0ZUtleXMpIClcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZnJvbVN0cmluZygga2V5SnNvblN0cmluZzogc3RyaW5nICkgOiBDb21wb3NpdGVLZXkge1xuICAgIERCQy5hcmd1bWVudCggJ2tleUpzb25TdHJpbmcnLCAoKSA9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShrZXlKc29uU3RyaW5nKSlcblxuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlS2V5KEpTT04ucGFyc2UoIGtleUpzb25TdHJpbmcgKS5rZXlPYmplY3QpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGtleUpzb24oKSA6IEpzb25PYmplY3Qge1xuICAgIHJldHVybiB0aGlzLmtleU9iamVjdFxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGtleSgpIDogc3RyaW5nIHsgXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMua2V5T2JqZWN0KVxuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKCkgOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmtleVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbXBvc2l0ZUtleSgga2V5IDogYW55ICkgOiBib29sZWFuIHtcbiAgaWYgKCEga2V5ICkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiBrZXkua2V5SnNvblxufVxuXG5leHBvcnQgY2xhc3MgTW9kZWxTY2hlbWEge1xuICBwcml2YXRlIHNjaGVtYTogU2NoZW1hXG4gIHByaXZhdGUgbmFtZTogc3RyaW5nXG4gIHByaXZhdGUgbWVtb3J5OiBib29sZWFuXG4gIHByaXZhdGUgcmVhZG9ubHk6IGJvb2xlYW5cbiAgcHJpdmF0ZSBsb2NhbDogYm9vbGVhblxuXG4gIHByaXZhdGUgcEtleTogTWF5YmVVbmRlZmluZWQ8c3RyaW5nPlxuICBwcml2YXRlIGNLZXlzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRzOiBBcnJheTxzdHJpbmc+XG4gIHByaXZhdGUgYWxsRmllbGRUeXBlczogTWFwPHN0cmluZywgc3RyaW5nPlxuICBwcml2YXRlIGFsbEluZGV4ZXM6IEFycmF5PHN0cmluZz5cblxuICBjb25zdHJ1Y3RvcihzY2hlbWE6IFNjaGVtYSwgbmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zY2hlbWEgPSBPYmplY3QuYXNzaWduKHt9ICwgc2NoZW1hKVxuICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICB0aGlzLm1lbW9yeSA9IHNjaGVtYS5tZW1vcnkgPT09IHRydWVcbiAgICB0aGlzLnJlYWRvbmx5ID0gc2NoZW1hLnJlYWRvbmx5ID09PSB0cnVlXG4gICAgdGhpcy5sb2NhbCA9IHNjaGVtYS5sb2NhbCA9PT0gdHJ1ZVxuICAgIHRoaXMucGFyc2VGaWVsZHMoKVxuICB9XG5cbiAgcHJpdmF0ZSBjb252ZXJ0VHlwZSggdHlwZSA6IEZpZWxkVHlwZSApIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdHlwZSA9PT0gRmllbGRUeXBlcy5TdHJpbmcgfHwgdHlwZSA9PT0gRmllbGRUeXBlcy5UZXh0ID8gXG4gICAgICAnU3RyaW5nJyA6IFxuICAgICAgJ051bWJlcidcbiAgfVxuICBcbiAgcHJpdmF0ZSBwYXJzZUZpZWxkcygpIDogdm9pZCB7ICAgIFxuICAgIGNvbnN0IHByaW1hcnlLZXlzID0gdGhpcy5zY2hlbWEudGFibGVGaWVsZHMuZmlsdGVyKGYgPT4gZi5wcmltYXJ5X2tleSA9PT0gdHJ1ZSApIC5tYXAoIGY9PiBmLm5hbWUgKVxuICAgIHRoaXMuY0tleXMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5maWx0ZXIoZiA9PiBmLmNvbXBvc2l0ZV9rZXkgPT09IHRydWUgKS5tYXAoIGY9PiBmLm5hbWUgKVxuXG4gICAgdGhpcy5wS2V5ID0gcHJpbWFyeUtleXMubGVuZ3RoID09PSAxID8gcHJpbWFyeUtleXNbMF0gOiB1bmRlZmluZWRcblxuICAgIGxldCBrZXlWYWxpZCA9ICggdGhpcy5wS2V5ICE9PSB1bmRlZmluZWQgKSAhPT0gKCB0aGlzLmNLZXlzLmxlbmd0aCA+IDEgKSBcbiAgICBpZiAoICFrZXlWYWxpZCApIHRocm93IG5ldyBFcnJvcihgbW9kZWwgbXVzdCBoYXZlIHByaW1hcnkga2V5IG9yIGNvbXBvc2l0ZSBrZXlzLCBidXQgY2FuIG5vdCBib3RoYClcblxuICAgIHRoaXMuYWxsRmllbGRUeXBlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcbiAgICB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5mb3JFYWNoKCBmID0+IHRoaXMuYWxsRmllbGRUeXBlcy5zZXQoIGYubmFtZSwgdGhpcy5jb252ZXJ0VHlwZShmLnR5cGUpKSApXG4gICAgdGhpcy5hbGxGaWVsZHMgPSB0aGlzLnNjaGVtYS50YWJsZUZpZWxkcy5tYXAoIGYgPT4gZi5uYW1lKVxuICAgIHRoaXMuYWxsSW5kZXhlcyA9IHRoaXMuc2NoZW1hLnRhYmxlRmllbGRzLmZpbHRlciggZiA9PiBmLmluZGV4ID09PSB0cnVlICkubWFwKCBmID0+IGYubmFtZSApXG4gIH1cblxuICBwdWJsaWMgZ2V0RmllbGRUeXBlcyhzY2hlbWE6IFNjaGVtYSk6IE1hcDxzdHJpbmcsIHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkVHlwZXNcbiAgfVxuXG4gIHB1YmxpYyBnZXQgc2NoZW1hT2JqZWN0KCkgOiBTY2hlbWEge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYVxuICB9XG5cbiAgcHVibGljIGdldCBpc0NvbXBzaXRlS2V5KCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb3NpdGVLZXlzLmxlbmd0aCA+IDEgXG4gIH1cblxuICBwdWJsaWMgZ2V0IHByaW1hcnlLZXkoKSA6IE1heWJlVW5kZWZpbmVkPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLnBLZXlcbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29tcG9zaXRlS2V5cygpIDogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmNLZXlzXG4gIH1cblxuICBwdWJsaWMgZ2V0IGZpZWxkTmFtZXMoKSA6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLmFsbEZpZWxkc1xuICB9XG5cbiAgcHVibGljIGdldCBpbmRleGVzKCkgOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5hbGxJbmRleGVzXG4gIH1cblxuICBwdWJsaWMgZ2V0IG1vZGVsTmFtZSgpIDogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzTG9jYWwoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxvY2FsXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzUmVhZG9ubHkoKSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJlYWRvbmx5XG4gIH1cblxuICBwdWJsaWMgZ2V0IG1lbUNhY2hlZCgpIDogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWVtb3J5XG4gIH1cblxuICBwdWJsaWMgc2V0S2V5PFRFbnRpdHk+KCBlbnRpdHk6IFRFbnRpdHksIGtleTogRW50aXR5S2V5ICkgOiBURW50aXR5IHtcbiAgICBpZiAoICF0aGlzLmlzQ29tcHNpdGVLZXkgKSB7XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV0gPSBrZXlcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgY2sgPSBrZXkgYXMgQ29tcG9zaXRlS2V5XG4gICAgICB0aGlzLmNLZXlzLmZvckVhY2goIGYgPT4gZW50aXR5W2ZdID0gY2sua2V5SnNvbltmXSApXG4gICAgfVxuICAgIHJldHVybiBlbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBnZXRLZXk8VEVudGl0eT4oZW50aXR5IDogVEVudGl0eSkgOiBFbnRpdHlLZXkge1xuICAgIHJldHVybiB0aGlzLmlzQ29tcHNpdGVLZXkgPyBcbiAgICAgIENvbXBvc2l0ZUtleS5tYWtlKCB0aGlzLCBlbnRpdHkgKSA6XG4gICAgICBlbnRpdHlbdGhpcy5wcmltYXJ5S2V5IV1cbiAgfVxuXG4gIHB1YmxpYyBuZXdFbnRpdHk8VEVudGl0eT4gKCBtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXkgOiBFbnRpdHlLZXkgKSA6IFRFbnRpdHkge1xuICAgIGxldCBlbnRpdHkgPSBpc1N0cmluZyhtb2RlbCkgPyBcbiAgICAgIHsgfSBhcyBURW50aXR5IDogXG4gICAgICBuZXcgKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApKClcblxuICAgIHJldHVybiB0aGlzLnNldEtleSggZW50aXR5LCBrZXkgKVxuICB9XG5cbiAgcHVibGljIGNvcHlQcm9wZXJ0aWVzPFRFbnRpdHk+KCBkZXN0OiBURW50aXR5LCBzcmMgOiBURW50aXR5LCBpbmNsdWRlS2V5ID0gZmFsc2UgKSB7XG4gICAgdGhpcy5hbGxGaWVsZHMuZm9yRWFjaCggZiA9PiB7XG4gICAgICBpZiAoICFpbmNsdWRlS2V5ICYmICggdGhpcy5jS2V5cy5pbmRleE9mKGYpID49IDAgfHwgZiA9PT0gdGhpcy5wcmltYXJ5S2V5ICkgKSByZXR1cm5cbiAgICAgIGRlc3RbZl0gPSBzcmNbZl1cbiAgICB9KVxuICB9XG59IiwiaW1wb3J0IHsgTW9kZWxTY2hlbWEsIEZpZWxkVHlwZXMgfSBmcm9tICcuLi9Nb2RlbCdcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eUtleSwgZGVlcENvcHkgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBpc0FycmF5LCBpc051bWJlciB9IGZyb20gJ3V0aWwnO1xuXG5jb25zdCBKc29uU3FsID0gcmVxdWlyZSgnanNvbi1zcWwnKSh7IHNlcGFyYXRlZFZhbHVlczogZmFsc2UgfSlcbmNvbnN0IGNoYW5nZUNhc2UgPSByZXF1aXJlKCdjaGFuZ2UtY2FzZScpXG5cbmV4cG9ydCBjb25zdCBNVUxUSV9TUUxfU0VQQVJBVE9SID0gJzsnXG5cbi8vICdjcmVhdGUnfCdzZWxlY3QnfCd1cGRhdGUnfCdyZW1vdmUnfCdvdGhlcidcbmV4cG9ydCBlbnVtIFNxbFR5cGUge1xuICBTY2hlbWEgPSAwLFxuICBTZWxlY3QgPSAxLFxuICBJbnNlcnQgPSAyICxcbiAgVXBkYXRlID0gMyxcbiAgRGVsZXRlID0gNCxcbiAgT3RoZXIgID0gOVxufVxuXG5leHBvcnQgdHlwZSBTcWxQYXJhbWV0ZXJzID0gQXJyYXk8YW55PiB8IEpzb25PYmplY3RcbmV4cG9ydCB0eXBlIFNxbEFuZFBhcmFtZXRlcnMgPSB7IFxuICB0eXBlOiBTcWxUeXBlLCAgXG4gIHF1ZXJ5OiBzdHJpbmcsIFxuICBwYXJhbWV0ZXJzPyA6IFNxbFBhcmFtZXRlcnMsXG4gIGV4cGVjdEVmZmVjdGVkPyA6IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgVW5hcnlPcGVyYXRvcnMgPSAnJG51bGwnfCckaXMnfCckaXNub3QnXG5leHBvcnQgdHlwZSBCaW5hcnlPcGVyYXRvcnMgPSAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnfCckbGlrZSd8JyRmaWVsZCd8JyRpbid8JyRuaW4nfCckYmV0d2VlbidcbmV4cG9ydCB0eXBlIFJlbGF0aW9uT3BlcmF0b3JzID0gJyRub3QnfCckYW5kJ3wnJG9yJ1xuXG5leHBvcnQgdHlwZSBTZWxlY3RFeHByZXNzaW9uID0ge1xuICBzZWxlY3QgOiB7XG4gICAgdGFibGUgOiBzdHJpbmcsXG4gICAgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sXG4gICAgd2hlcmU/IDogc3RyaW5nLFxuICAgIFtrZXkgOiBzdHJpbmddIDogYW55XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgVmFsdWVFeHByZXNzaW9uID0gc3RyaW5nIHwgbnVtYmVyXG5leHBvcnQgdHlwZSBGaWVsZFZhbHVlRXhwcmVzc2lvbiA9IHsgW2ZpZWxkIDogc3RyaW5nXSA6IHN0cmluZyB8IG51bWJlciB9XG5leHBvcnQgdHlwZSBGaWVsZEFycmF5VmFsdWVFeHByZXNzaW9uID0geyBbZmllbGQgOiBzdHJpbmddIDogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiB9XG5leHBvcnQgdHlwZSBOdWxsQ29tcGFyZUV4cHJlc3Npb24gPSB7ICRudWxsIDogc3RyaW5nIH0gfCB7IFtvcGVyIGluICckaXMnfCdpc25vdCddPyA6IHsgW2ZpZWxkIDogc3RyaW5nXSA6IG51bGx9IH1cblxuZXhwb3J0IHR5cGUgVmFsdWVDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkVmFsdWVFeHByZXNzaW9uIHwgeyBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGVxJ3wnJG5lJ3wnJGd0J3wnJGx0J3wnJGd0ZSd8JyRsdGUnXT8gOiBWYWx1ZUV4cHJlc3Npb24gfCBTZWxlY3RFeHByZXNzaW9uIH0gfVxuZXhwb3J0IHR5cGUgQXJyYXlDb21wYXJlRXhwcmVzc2lvbiA9IEZpZWxkQXJyYXlWYWx1ZUV4cHJlc3Npb24gfCB7ICBbZmllbGQgOiBzdHJpbmddIDogeyBbb3BlciBpbiAnJGJldHdlZW4nfCckaW4nfCckbmluJ10/IDogQXJyYXk8VmFsdWVFeHByZXNzaW9uPiB8IFNlbGVjdEV4cHJlc3Npb24gfSB9XG5leHBvcnQgdHlwZSBMaWtlRXhwcmVzc2lvbiA9IHsgW2tleSA6IHN0cmluZ106IHsgJGxpa2UgOiBzdHJpbmcgfSB9IFxuXG5leHBvcnQgdHlwZSBDb21wYXJlRXhwcmVzc2lvbiA9IFZhbHVlQ29tcGFyZUV4cHJlc3Npb24gfCBBcnJheUNvbXBhcmVFeHByZXNzaW9uIHwgTGlrZUV4cHJlc3Npb24gfCBOdWxsQ29tcGFyZUV4cHJlc3Npb25cbmV4cG9ydCB0eXBlIFJlbGF0aW9uRXhwcmVzc2lvbiA9IEFycmF5PENvbXBhcmVFeHByZXNzaW9uPiB8IC8vIFRoZSAkYW5kIGlzIG9taXR0ZWQgXG4gIHsgJG5vdCA6IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uIH0gfCBcbiAgeyBbb3BlciBpbiAnJGFuZCd8ICckb3InXT8gOiBBcnJheTxDb21wYXJlRXhwcmVzc2lvbj4gfCBBcnJheTxSZWxhdGlvbkV4cHJlc3Npb24+IH1cbiBcbmV4cG9ydCB0eXBlIFNxbENvbmRpdGlvbiA9IENvbXBhcmVFeHByZXNzaW9uIHwgUmVsYXRpb25FeHByZXNzaW9uXG5cbmV4cG9ydCB0eXBlIExpbWl0QW5kT2Zmc2V0ID0ge1xuICBsaW1pdD8gOiBudW1iZXIsXG4gIG9mZnNldD8gOiBudW1iZXJcbn1cbmV4cG9ydCB0eXBlIFNxbFJlc3VsdFJhbmdlID0gbnVtYmVyIHwgTGltaXRBbmRPZmZzZXRcblxuZXhwb3J0IHR5cGUgU3FsT3JkZXJJdGVtID0ge1xuICBbZmllbGQgOiBzdHJpbmddIDogJ0FTQycgfCAnREVTQycgfCAxIHwgLTEgXG59XG5cbmV4cG9ydCB0eXBlIFNxbE9yZGVyID0gU3FsT3JkZXJJdGVtIHwgQXJyYXk8U3FsT3JkZXJJdGVtPlxuXG5leHBvcnQgaW50ZXJmYWNlIFNxbEJ1aWxkZXIge1xuICBidWlsZFNjaGVtYSggc2NoZW1hOiBNb2RlbFNjaGVtYSApIDogc3RyaW5nXG4gIGJ1aWxkSW5zZXJ0KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QgKSA6IFNxbEFuZFBhcmFtZXRlcnNcbiAgYnVpbGREZWxldGUoIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBTcWxBbmRQYXJhbWV0ZXJzXG4gIGJ1aWxkVXBkYXRlKCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSwgZmllbGRWYWx1ZXMgOiBKc29uT2JqZWN0LCB2ZXJzaW9uOiBudW1iZXIpIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xuICBidWlsZFNlbGVjdCggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZmllbGRzOiBBcnJheTxzdHJpbmc+LCB3aGVyZSA6IFNxbENvbmRpdGlvbiwgcmVzdWx0UmFuZ2U/IDogU3FsUmVzdWx0UmFuZ2UsIHNvcnQ/IDogU3FsT3JkZXIsIGpvaW4/IDogSnNvbk9iamVjdCApIDogU3FsQW5kUGFyYW1ldGVyc1xufVxuXG5leHBvcnQgY2xhc3MgSnNvblNxbEJ1aWxkZXIgaW1wbGVtZW50cyBTcWxCdWlsZGVyIHtcblxuICBwcml2YXRlIGdldFRhYmxlTmFtZShtb2RlbE5hbWU6IHN0cmluZykge1xuICAgIHJldHVybiBjaGFuZ2VDYXNlLnNuYWtlQ2FzZShtb2RlbE5hbWUpICsgJ3MnXG4gIH1cblxuICBwcml2YXRlIGdldFByaW1hcnlLZXlDb25kaXRpb24oIHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5ICkgOiBKc29uT2JqZWN0IHtcbiAgICByZXR1cm4gc2NoZW1hLnNldEtleSAoIHt9LCAga2V5IClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZFNjaGVtYSAoc2NoZW1hOiBNb2RlbFNjaGVtYSkgOiBzdHJpbmcge1xuICAgIGxldCBzcWxzID0gbmV3IEFycmF5PHN0cmluZz4oKSBcbiAgICBjb25zdCBzY2hlbWFPYmplY3QgPSBPYmplY3QuYXNzaWduKHsgdHlwZTogJ2NyZWF0ZSd9LCBkZWVwQ29weShzY2hlbWEuc2NoZW1hT2JqZWN0KSkgXG4gICAgLy8gZGF0YWJhc2UgZG8gbm90IHN1cHBvcnQgY29tcG9zaXRlIGtleSAgIFxuICAgIC8vIGlmICggc2NoZW1hLmlzQ29tcHNpdGVLZXkgKSB7IFxuICAgIC8vICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLmZvckVhY2goIGYgPT4gZi5wcmltYXJ5X2tleSA9IGZhbHNlIClcbiAgICAvLyB9XG4gICAgc2NoZW1hT2JqZWN0LnRhYmxlRmllbGRzLnB1c2goe1xuICAgICAgbmFtZTogJ192ZXJzaW9uXycsXG4gICAgICB0eXBlOiBGaWVsZFR5cGVzLk51bWJlcixcbiAgICAgIGRlZmF1bHQ6IDAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgc2NoZW1hU3FsID0gSnNvblNxbC5idWlsZChzY2hlbWFPYmplY3QpXG4gICAgc3Fscy5wdXNoKHNjaGVtYVNxbC5xdWVyeSlcblxuICAgIGNvbnN0IHRhYmxlTmFtZSA9IHRoaXMuZ2V0VGFibGVOYW1lKHNjaGVtYS5tb2RlbE5hbWUpXG4gICAgc2NoZW1hLmluZGV4ZXMuZm9yRWFjaCggZmllbGQgPT4ge1xuICAgICAgc3Fscy5wdXNoKEpzb25TcWwuYnVpbGQoe1xuICAgICAgICB0eXBlOiAnaW5kZXgnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBuYW1lOiB0YWJsZU5hbWUgKyAnXycgKyBmaWVsZCxcbiAgICAgICAgaW5kZXhPbjogZmllbGRcbiAgICAgIH0pLnF1ZXJ5KVxuICAgIH0pXG5cbiAgICByZXR1cm4gc3Fscy5qb2luKCBNVUxUSV9TUUxfU0VQQVJBVE9SIClcbiAgfVxuXG4gIHB1YmxpYyBidWlsZEluc2VydChzY2hlbWE6IE1vZGVsU2NoZW1hLCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuSW5zZXJ0IH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbiggc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ2luc2VydCcsXG4gICAgICB0YWJsZTogdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSksXG4gICAgICB2YWx1ZXM6IGZpZWxkVmFsdWVzXG4gICAgfSkpXG4gIH1cblxuICBwdWJsaWMgYnVpbGREZWxldGUoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBsZXQgc3AgPSB7IHR5cGU6IFNxbFR5cGUuRGVsZXRlIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihzcCwgSnNvblNxbC5idWlsZCh7XG4gICAgICB0eXBlOiAncmVtb3ZlJyxcbiAgICAgIHRhYmxlOiB0aGlzLmdldFRhYmxlTmFtZShzY2hlbWEubW9kZWxOYW1lKSxcbiAgICAgIGNvbmRpdGlvbjogdGhpcy5nZXRQcmltYXJ5S2V5Q29uZGl0aW9uKHNjaGVtYSwga2V5KVxuICAgIH0pKVxuICB9XG5cbiAgcHVibGljIGJ1aWxkVXBkYXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5LCBmaWVsZFZhbHVlcyA6IEpzb25PYmplY3QsIHZlcnNpb246IG51bWJlcik6IFNxbEFuZFBhcmFtZXRlcnMgeyAgICBcbiAgICAvLyBjb25zdCBtb2RpZmllciA9IHRoaXMuZXNjYXBlU2luZ2xlUXVvdGUoZmllbGRWYWx1ZXMpXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcblxuICAgIGxldCBjb25kaXRpb24gPSB0aGlzLmdldFByaW1hcnlLZXlDb25kaXRpb24oc2NoZW1hLCBrZXkpXG4gICAgY29uZGl0aW9uWydfdmVyc2lvbl8nXSA9IHZlcnNpb24gIFxuXG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlVwZGF0ZSB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQoe1xuICAgICAgdHlwZTogJ3VwZGF0ZScsXG4gICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgbW9kaWZpZXI6IGZpZWxkVmFsdWVzLFxuICAgICAgY29uZGl0aW9uOiBjb25kaXRpb25cbiAgICB9KSlcbiAgfVxuXG4gIC8vIHByaXZhdGUgZGV0ZXJtaW5lU29ydCggdGFibGVOYW1lOiBzdHJpbmcsIHNvcnQgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgc29ydCB8fCB7fVxuICAvLyAgIGlmICh0eXBlb2Ygc29ydCA9PT0gJ3N0cmluZycpIHtcbiAgLy8gICAgIGlmIChzb3J0ID09PSAndGltZXN0YW1wJykge1xuICAvLyAgICAgICBzb3J0ID0gJ3QuJyArIHNvcnRcbiAgLy8gICAgIH0gZWxzZSB7XG4gIC8vICAgICAgIHNvcnQgPSB0YWJsZU5hbWUgKyAnLicgKyBzb3J0XG4gIC8vICAgICB9XG4gIC8vICAgfSBlbHNlIGlmICh0eXBlb2Ygc29ydCA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gc29ydCkge1xuICAvLyAgICAgICBpZiAoayA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgLy8gICAgICAgICBzb3J0Wyd0LicgKyBrXSA9IHNvcnRba11cbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICBzb3J0W3RhYmxlTmFtZSArICcuJyArIGtdID0gc29ydFtrXVxuICAvLyAgICAgICB9XG4gIC8vICAgICAgIGRlbGV0ZSBzb3J0W2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIHJldHVybiBzb3J0XG4gIC8vIH1cblxuICAvLyBwcml2YXRlIGRldGVybWluZVdoZXJlKCB0YWJsZU5hbWU6IHN0cmluZywgd2hlcmUgOiBzdHJpbmd8SnNvbk9iamVjdCApOiBhbnl7XG4gIC8vICAgbGV0IGNvbmRpdGlvbiA9IHt9IHx8IHdoZXJlIFxuICAvLyAgIGlmIChBcnJheS5pc0FycmF5KGNvbmRpdGlvbikpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi5zbGljZSgpXG4gIC8vICAgICBmb3IgKGxldCBpIGluIGNvbmRpdGlvbikge1xuICAvLyAgICAgICBmb3IgKGxldCBrIGluIGNvbmRpdGlvbltpXSkge1xuICAvLyAgICAgICAgIGNvbmRpdGlvbltpXVt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltpXVtrXVxuICAvLyAgICAgICAgIGRlbGV0ZSBjb25kaXRpb25baV1ba11cbiAgLy8gICAgICAgfVxuICAvLyAgICAgfVxuICAvLyAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbmRpdGlvbiA9PT0gJ29iamVjdCcpIHtcbiAgLy8gICAgIGNvbmRpdGlvbiA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmRpdGlvbilcbiAgLy8gICAgIGZvciAobGV0IGsgaW4gY29uZGl0aW9uKSB7XG4gIC8vICAgICAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLicgKyBrXSA9IGNvbmRpdGlvbltrXVxuICAvLyAgICAgICBkZWxldGUgY29uZGl0aW9uW2tdXG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyAgIGNvbmRpdGlvblt0YWJsZU5hbWUgKyAnLl9kZWxldGVkXyddID0gMFxuICAvLyB9XG5cbiAgcHVibGljIGJ1aWxkU2VsZWN0KHNjaGVtYTogTW9kZWxTY2hlbWEsIGZpZWxkc09yUGFyYW1zOiBBcnJheTxzdHJpbmc+IHwgSnNvbk9iamVjdCwgd2hlcmU/IDogU3FsQ29uZGl0aW9uLCBcbiAgICByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgc29ydD8gOiBTcWxPcmRlciwgam9pbj8gOiBKc29uT2JqZWN0ICk6IFNxbEFuZFBhcmFtZXRlcnMge1xuXG4gICAgY29uc3QgdGFibGVOYW1lID0gdGhpcy5nZXRUYWJsZU5hbWUoc2NoZW1hLm1vZGVsTmFtZSlcbiAgICBcbiAgICBsZXQgcXVlcnlPcHRpb25zIDogSnNvbk9iamVjdFxuICAgIGlmICggIWlzQXJyYXkoIGZpZWxkc09yUGFyYW1zICkgKSB7XG4gICAgICBsZXQgcGFyYW1zID0gZmllbGRzT3JQYXJhbXMgYXMgSnNvbk9iamVjdFxuICAgICAgcXVlcnlPcHRpb25zID0gT2JqZWN0LmFzc2lnbiggeyB0eXBlOiAnc2VsZWN0JywgdGFibGU6IHRhYmxlTmFtZSB9LCBwYXJhbXMgKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxldCBmaWVsZHMgPSBmaWVsZHNPclBhcmFtcyB8fCBzY2hlbWEuZmllbGROYW1lcy5tYXAoIGYgPT4gc2NoZW1hLnNjaGVtYU9iamVjdC50YWJsZSArICcuJyArIGYgKVxuICAgICAgbGV0IGxvIDogTGltaXRBbmRPZmZzZXQgPSBpc051bWJlciggcmVzdWx0UmFuZ2UgKSA/ICB7IGxpbWl0IDogcmVzdWx0UmFuZ2UgfSA6IHJlc3VsdFJhbmdlIHx8IHsgfVxuICAgICAgbGV0IG9yZGVyID0gc29ydCB8fCB7fVxuICAgICAgZm9yICggbGV0IGtleSBvZiBSZWZsZWN0Lm93bktleXMob3JkZXIpICApIHtcbiAgICAgICAgbGV0IG9yZGVyVmFsdWUgPSBvcmRlcltrZXldIHx8IC0xXG4gICAgICAgIG9yZGVyW2tleV0gPSAob3JkZXJWYWx1ZSA9PT0gJ0FTQycpID8gMSA6ICggKG9yZGVyVmFsdWUgPT09ICdERVNDJykgPyAtMSA6IG9yZGVyVmFsdWUgKVxuICAgICAgfVxuXG4gICAgICBxdWVyeU9wdGlvbnMgPSB7XG4gICAgICAgIHR5cGU6ICdzZWxlY3QnLFxuICAgICAgICB0YWJsZTogdGFibGVOYW1lLFxuICAgICAgICBmaWVsZHM6IGZpZWxkcyxcbiAgICAgICAgY29uZGl0aW9uOiB3aGVyZSxcbiAgICAgICAgbGltaXQ6IGxvLmxpbWl0LFxuICAgICAgICBvZmZzZXQ6IGxvLm9mZnNldCxcbiAgICAgICAgc29ydDogb3JkZXIsXG4gICAgICAgIGpvaW46IGpvaW5cbiAgICAgIH1cbiAgICB9XG4gICAgbGV0IHNwID0geyB0eXBlOiBTcWxUeXBlLlNlbGVjdCB9XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oc3AsIEpzb25TcWwuYnVpbGQocXVlcnlPcHRpb25zKSlcbiAgfVxufSIsImltcG9ydCB7IFNxbGl0ZVdyYXBwZXIgfSBmcm9tICcuL1NxbGl0ZVdyYXBwZXInXG5pbXBvcnQgeyBNVUxUSV9TUUxfU0VQQVJBVE9SLCBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxQYXJhbWV0ZXJzIH0gZnJvbSAnLi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgRGJDb25uZWN0aW9uLCBEQlRyYW5zYWN0aW9uLCBDb25uZWN0aW9uT3B0aW9ucywgU3FsRXhlY3V0ZVJlc3VsdCB9IGZyb20gJy4vRGJDb25uZWN0aW9uJ1xuXG5cbmNsYXNzIFNxbGl0ZVRyYW5zYWN0aW9uIGltcGxlbWVudHMgREJUcmFuc2FjdGlvbiB7XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuXG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb246IERiQ29ubmVjdGlvbikge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb21taXQoKSA6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY29ubmVjdGlvbi5leGVjdXRlKCdDT01NSVQ7JylcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByb2xsYmFjaygpIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmV4ZWN1dGUoJ1JPTExCQUNLOycpIFxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTcWxpdGVDb25uZWN0aW9uIGltcGxlbWVudHMgRGJDb25uZWN0aW9uIHtcbiAgcHJpdmF0ZSBvcHRpb25zIDogQ29ubmVjdGlvbk9wdGlvbnNcbiAgcHJpdmF0ZSBzcWxpdGUgOiBTcWxpdGVXcmFwcGVyXG5cbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgOiBDb25uZWN0aW9uT3B0aW9ucyApIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5zcWxpdGUgPSBuZXcgU3FsaXRlV3JhcHBlcigpXG4gIH1cblxuICBwdWJsaWMgZ2V0IGNvbm5lY3Rpb25PcHRpb25zKCk6IENvbm5lY3Rpb25PcHRpb25zIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zXG4gIH1cblxuICBwdWJsaWMgZ2V0IGlzQ29ubmVjdGVkKCkgOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuaXNDb25uZWN0ZWRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuYXN5bk9wZW4oIHRoaXMub3B0aW9ucy5zdG9yYWdlIClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBkaXNjb25uZWN0KCkgOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bkNsb3NlKClcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBxdWVyeShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMpIDogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5RdWVyeShzcWwsIHBhcmFtZXRlcnMpXG4gIH1cblxuICBwdWJsaWMgcXVlcnlTeW5jKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycykgOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUucXVlcnkoc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHJpdmF0ZSBlbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdDogU3FsRXhlY3V0ZVJlc3VsdCApIHtcbiAgICBpZiAoIHJlc3VsdC5yb3dzRWZmZWN0ZWQgPT09IDApICB0aHJvdyBuZXcgRXJyb3IoJ05vbmUgcm93IGVmZmVjdGVkJylcbiAgfVxuXG4gIHB1YmxpYyBleGVjdXRlQmF0Y2hTeW5jKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5zcWxpdGUuZXhlY3V0ZUJhdGNoKCBzcWxzIHx8IFtdICwgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQpXG4gIH1cblxuICBwdWJsaWMgYXN5bmMgZXhlY3V0ZUJhdGNoKCBzcWxzIDogQXJyYXk8U3FsQW5kUGFyYW1ldGVycz4gKSA6IFByb21pc2U8QXJyYXk8U3FsRXhlY3V0ZVJlc3VsdD4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zcWxpdGUuYXN5bmNFeGVjdXRlQmF0Y2goIHNxbHMgfHwgW10sIHRoaXMuZW5zdXJlRXhlY3V0ZUVmZmVjdGVkICkgXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZVN5bmMoc3FsOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzLCB0aHJvd0lmTm9uZUVmZmVjdGVkOiBib29sZWFuID0gZmFsc2UpIDogU3FsRXhlY3V0ZVJlc3VsdCB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5zcWxpdGUuZXhlY3V0ZShzcWwsIHBhcmFtZXRlcnMpXG4gICAgdGhyb3dJZk5vbmVFZmZlY3RlZCAmJiB0aGlzLmVuc3VyZUV4ZWN1dGVFZmZlY3RlZCggcmVzdWx0IClcblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBleGVjdXRlKHNxbDogc3RyaW5nLCBwYXJhbWV0ZXJzPzogU3FsUGFyYW1ldGVycywgdGhyb3dJZk5vbmVFZmZlY3RlZDogYm9vbGVhbiA9IGZhbHNlKSA6IFByb21pc2U8U3FsRXhlY3V0ZVJlc3VsdD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuc3FsaXRlLmFzeW5FeGVjdXRlKCBzcWwsIHBhcmFtZXRlcnMgKVxuICAgIHRocm93SWZOb25lRWZmZWN0ZWQgJiYgdGhpcy5lbnN1cmVFeGVjdXRlRWZmZWN0ZWQoIHJlc3VsdCApXG4gICAgXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgcHVibGljIGFzeW5jIHJ1blNjcmlwdChzcWw6IHN0cmluZykgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBzcWwuc3BsaXQoIE1VTFRJX1NRTF9TRVBBUkFUT1IgKS5mb3JFYWNoKFxuICAgICAgYXN5bmMgc3FsPT4gYXdhaXQgKHNxbC50cmltKCkgIT09ICcnKSAmJiB0aGlzLnNxbGl0ZS5leGVjdXRlKHNxbCwgW10pXG4gICAgKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGJlZ2luVHJhbnMoKTogUHJvbWlzZTxEQlRyYW5zYWN0aW9uPiB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRlKCdCRUdJTiBUUkFOU0FDVElPTjsnKVxuICAgIHJldHVybiBuZXcgU3FsaXRlVHJhbnNhY3Rpb24odGhpcylcbiAgfVxufSIsImltcG9ydCB7IHByb21pc2lmeSB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBDYWxsYmFjayB9IGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCB7IFNxbEV4ZWN1dGVSZXN1bHQgfSBmcm9tICcuL0RiQ29ubmVjdGlvbidcbmltcG9ydCB7IExvZ01hbmFnZXIsIExvZ2dlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IFNxbFBhcmFtZXRlcnMsIFNxbEFuZFBhcmFtZXRlcnMgfSBmcm9tICcuL1NxbEJ1aWxkZXInXG5cbmltcG9ydCAqIGFzIERhdGFiYXNlIGZyb20gJ2JldHRlci1zcWxpdGUzJ1xuXG5leHBvcnQgY2xhc3MgU3FsaXRlV3JhcHBlciB7XG4gIHByaXZhdGUgZGIgOiBEYXRhYmFzZVxuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNxbGl0ZVdyYXBwZXIubmFtZSlcbiAgfVxuXG4gIHB1YmxpYyBvcGVuKGRiRmlsZVBhdGg6IHN0cmluZywgY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgdGhpcy5kYiA9IG5ldyBEYXRhYmFzZShkYkZpbGVQYXRoKVxuICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBvcGVuICggZGIgPSAke2RiRmlsZVBhdGh9IClgIClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgb3BlbiAoIGRiID0gJHtkYkZpbGVQYXRofSApYCwgZXJyIClcbiAgICAgIGlmICggIWNhbGxiYWNrICkgdGhyb3cgZXJyXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrKHJldC5lcnIsIHJldC5yZXN1bHQpXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBnZXQgaXNDb25uZWN0ZWQoKSA6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5kYi5vcGVuIH1cblxuICBwdWJsaWMgYXN5bmMgYXN5bk9wZW4oZGJGaWxlUGF0aDogc3RyaW5nKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5vcGVuKS5jYWxsKHRoaXMsIGRiRmlsZVBhdGgpXG4gIH1cblxuICBwdWJsaWMgY2xvc2UoY2FsbGJhY2s/OiBDYWxsYmFjazxib29sZWFuPikgOiBib29sZWFuIHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB0cnVlIH1cbiAgICB0cnkge1xuICAgICAgaWYgKCB0aGlzLmRiICYmIHRoaXMuaXNDb25uZWN0ZWQgKSB7XG4gICAgICAgIHRoaXMuZGIuY2xvc2UoKSBcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKCBgU1VDQ0VTUyBjbG9zZWAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYGNsb3NlZCBhbHJlYWR5YClcbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQgPSB7IGVycjogZXJyLCByZXN1bHQgOiBmYWxzZSB9ICBcbiAgICAgIHRoaXMubG9nLmVycm9yRW5hbGVkICYmIHRoaXMubG9nLmVycm9yKCBgRkFJTEQgY2xvc2VgLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhyZXQuZXJyLCByZXQucmVzdWx0KVxuICAgIHJldHVybiByZXQucmVzdWx0ICAgIFxuICB9XG5cbiAgcHVibGljIGFzeW5DbG9zZSgpIDogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmNsb3NlKS5jYWxsKHRoaXMpXG4gIH1cblxuICBwdWJsaWMgZXhlY3V0ZShzcWw6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8U3FsRXhlY3V0ZVJlc3VsdD4pOiBTcWxFeGVjdXRlUmVzdWx0IHtcbiAgICBsZXQgcmV0ID0geyBlcnIgOiBudWxsLCByZXN1bHQgOiB7IGxhc3RJbnNlcnRSb3dJZDogJzAnLCByb3dzRWZmZWN0ZWQ6IDAgfSB9XG4gICAgdHJ5IHsgICAgICBcbiAgICAgIGNvbnN0IHNxbFJlc3VsdCA9IHRoaXMuZGIucHJlcGFyZShzcWwpLnJ1bihwYXJhbWV0ZXJzIHx8IFtdKVxuICAgICAgcmV0LnJlc3VsdCA9IHsgXG4gICAgICAgIGxhc3RJbnNlcnRSb3dJZCA6IHNxbFJlc3VsdC5sYXN0SW5zZXJ0Uk9XSUQudG9TdHJpbmcoKSxcbiAgICAgICAgcm93c0VmZmVjdGVkOiBzcWxSZXN1bHQuY2hhbmdlcyBcbiAgICAgIH1cbiAgICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyBleGVjdXRlIHNxbCA9ICR7c3FsfSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkocGFyYW1ldGVycyl9LCBlZmZlY3RlZCA9ICR7cmV0LnJlc3VsdC5yb3dzRWZmZWN0ZWR9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgZXhlY3V0ZSBzcWwgPSAke3NxbH0gcGFyYW0gPSAke0pTT04uc3RyaW5naWZ5KHBhcmFtZXRlcnMpfWAsIGVyciApXG4gICAgICBpZiAoICFjYWxsYmFjayApIHRocm93IGVyclxuICAgIH0gICAgXG4gICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIHF1ZXJ5KHNxbCA6IHN0cmluZywgcGFyYW1ldGVycz86IFNxbFBhcmFtZXRlcnMsIGNhbGxiYWNrPzogQ2FsbGJhY2s8QXJyYXk8YW55Pj4gKSA6IEFycmF5PGFueT4ge1xuICAgIGxldCByZXQgPSB7IGVyciA6IG51bGwsIHJlc3VsdCA6IG5ldyBBcnJheTxhbnk+KCkgfVxuICAgIHRyeSB7XG4gICAgICByZXQucmVzdWx0ID0gdGhpcy5kYi5wcmVwYXJlKHNxbCkuYWxsKHBhcmFtZXRlcnMgfHwgW10pXG4gICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYFNVQ0NFU1MgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX0sIHJlc3VsdCBjb3VudCA9ICR7cmV0LnJlc3VsdC5sZW5ndGh9YClcbiAgICB9XG4gICAgY2F0Y2goZXJyKSB7XG4gICAgICByZXQuZXJyID0gZXJyXG4gICAgICB0aGlzLmxvZy5lcnJvckVuYWxlZCAmJiB0aGlzLmxvZy5lcnJvcihgRkFJTEQgcXVlcnkgc3FsID0gJHtzcWx9IHBhcmFtID0gJHtKU09OLnN0cmluZ2lmeShwYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9ICAgIFxuICAgXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmV0LmVyciwgcmV0LnJlc3VsdClcbiAgICByZXR1cm4gcmV0LnJlc3VsdFxuICB9XG5cbiAgcHVibGljIGV4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCwgY2FsbGJhY2s/OiBDYWxsYmFjazxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4gICkgOiBBcnJheTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgbGV0IHJldCA9IHsgZXJyIDogbnVsbCwgcmVzdWx0IDogbmV3IEFycmF5PFNxbEV4ZWN1dGVSZXN1bHQ+KCkgfSBcbiAgICBsZXQgc3FsIDogU3FsQW5kUGFyYW1ldGVycyB8IHVuZGVmaW5lZFxuICAgIHRyeSB7XG4gICAgICBzcWxzLmZvckVhY2goIHMgPT4ge1xuICAgICAgICBzcWwgPSBzXG4gICAgICAgIGxldCBleGVjUmV0ID0gdGhpcy5leGVjdXRlKCBzLnF1ZXJ5LCBzLnBhcmFtZXRlcnMgKVxuICAgICAgICBvbkV4ZWN1dGVkICYmIG9uRXhlY3V0ZWQoIGV4ZWNSZXQsIHMgKSAgXG4gICAgICAgIHJldC5yZXN1bHQucHVzaCggZXhlY1JldCApXG4gICAgICB9KVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgcmV0LmVyciA9IGVyclxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGV4ZWN1dGVCYXRjaCwgc3FsID0gJHtzcWwhLnF1ZXJ5fSBwYXJhbSA9ICR7SlNPTi5zdHJpbmdpZnkoc3FsIS5wYXJhbWV0ZXJzKX1gLCBlcnIgKVxuICAgICAgaWYgKCAhY2FsbGJhY2sgKSB0aHJvdyBlcnJcbiAgICB9XG5cbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayggcmV0LmVyciwgcmV0LnJlc3VsdCApXG4gICAgcmV0dXJuIHJldC5yZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBhc3luRXhlY3V0ZShzcWwsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxTcWxFeGVjdXRlUmVzdWx0PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLmV4ZWN1dGUpLmNhbGwodGhpcywgc3FsLCBwYXJhbWV0ZXJzKVxuICB9XG5cbiAgcHVibGljIGFzeW5jIGFzeW5RdWVyeShzcWwgOiBzdHJpbmcsIHBhcmFtZXRlcnM/OiBTcWxQYXJhbWV0ZXJzKTogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgcmV0dXJuIHByb21pc2lmeSh0aGlzLnF1ZXJ5KS5jYWxsKHRoaXMsIHNxbCwgcGFyYW1ldGVycylcbiAgfVxuXG4gIHB1YmxpYyBhc3luY0V4ZWN1dGVCYXRjaCggc3FscyA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+LCBvbkV4ZWN1dGVkPzogKHJldCA6IFNxbEV4ZWN1dGVSZXN1bHQsIHMgOiBTcWxBbmRQYXJhbWV0ZXJzICkgPT4gdm9pZCApIDogUHJvbWlzZTxBcnJheTxTcWxFeGVjdXRlUmVzdWx0Pj4ge1xuICAgIHJldHVybiBwcm9taXNpZnkodGhpcy5leGVjdXRlQmF0Y2gpLmNhbGwoIHRoaXMsIHNxbHMsIG9uRXhlY3V0ZWQgKVxuICB9XG5cbn0iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgeyBpc1N0cmluZyB9IGZyb20gJ3V0aWwnXG5pbXBvcnQgeyBFbnRpdHlLZXksIENvZGVDb250cmFjdCBhcyBEQkMsIE1heWJlVW5kZWZpbmVkLCBpc1ByaW1pdGl2ZUtleSB9IGZyb20gJy4vQ29tbW9uJztcbmltcG9ydCB7IExldmVsQmxvY2sgfSBmcm9tICcuL0xldmVsQmxvY2snXG5pbXBvcnQgeyBEYlNlc3Npb24gfSBmcm9tICcuL0RiU2Vzc2lvbidcbmltcG9ydCB7IEpzb25PYmplY3QsIEVudGl0eSwgRmlsdGVyRnVuY3Rpb24gfSBmcm9tICcuL0NvbW1vbidcbmltcG9ydCB7IFNxbGl0ZUNvbm5lY3Rpb24gfSBmcm9tICcuL1NRTERCL1NxbGl0ZUNvbm5lY3Rpb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSwgTW9kZWxOYW1lT3JUeXBlLCBDb25zdHJ1Y3RvciwgaXNDb21wb3NpdGVLZXkgfSBmcm9tICcuL01vZGVsJztcbmltcG9ydCB7IERiQ29ubmVjdGlvbiB9IGZyb20gJy4vU1FMREIvRGJDb25uZWN0aW9uJ1xuaW1wb3J0IHsgTG9nZ2VyLCBMb2dNYW5hZ2VyIH0gZnJvbSAnLi9Mb2cnXG5pbXBvcnQgeyBFbnRpdHlQcm94eSB9IGZyb20gJy4vU3RhdGVUcmFja2VyL0VudGl0eVByb3h5J1xuaW1wb3J0IHsgRW50aXR5Q2FjaGVPcHRpb25zIH0gZnJvbSAnLi9FbnRpdHlDYWNoZSdcbmltcG9ydCB7IFNxbENvbmRpdGlvbiwgU3FsUmVzdWx0UmFuZ2UsIFNxbE9yZGVyIH0gZnJvbSAnLi9TUUxEQi9TcWxCdWlsZGVyJ1xuaW1wb3J0IHsgQmxvY2tIZWFkZXIsIEJsb2NrLCBUcmFuc2FjdGlvbiB9IGZyb20gJy4vQmxvY2snXG5pbXBvcnQgeyBCbG9ja0NhY2hlIH0gZnJvbSAnLi9CbG9ja0NhY2hlJ1xuXG5leHBvcnQgdHlwZSBTbWFydERCT3B0aW9ucyA9IHtcbiAgLyoqXG4gICAqIGNhY2hlZCBoaXN0b3J5IGNvdW50KGJsb2NrIGNvdW50KSwgdXNlZCB0byByb2xsYmFjayBibG9ja1xuICAgKiBAZGVmYXVsdCAxMFxuICAgKi9cbiAgaGlzdG9yeUZvclJvbGxiYWNrPyA6IG51bWJlcixcblxuICAvKipcbiAgICogY2xlYW4gcGVyc2lzdGVkIGhpc3RvcnkgYXV0b21hdGljYWxseVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeT8gOiBib29sZWFuLFxuXG4gIC8qKlxuICAgKiBjYWNoZWQgbGFzdCBibG9jayBjb3VudCBcbiAgICogQGRlZmF1bHQgMTBcbiAgICovXG4gIGNhY2hlZEJsb2NrQ291bnQ/IDogbnVtYmVyLFxuXG4gIC8qKlxuICAgKiBtYXggY2FjaGVkIGVudGl0eSBjb3VudCwgY29uZmlnIGl0IHBlciBtb2RlbCwgTFJVICBcbiAgICogc2FtcGxlOiB7IFVzZXI6IDIwMCwgVHJhbnM6IDUwMDAgfSBtYXggY2FjaGVkIDIwMHMgVXNlciDvvIw1MDAwIGZvciBUcmFuc1xuICAgKiBAZGVmYXVsdCA1MDAwIGVhY2ggbW9kZWxcbiAgICovXG4gIGVudGl0eUNhY2hlT3B0aW9ucz8gOiBFbnRpdHlDYWNoZU9wdGlvbnNcblxufVxuXG4vKipcbiAqIE9STSBsaWtlIHRvIG9wZXJhdGUgYmxvY2tjaGFpbiBkYXRhXG4gKiBAZXZlbnQgcmVhZHkgZW1taXQgYWZ0ZXIgaW5pdGlhbGl6ZWRcbiAqIEBldmVudCBjbG9zZSBlbW1pdCBhZnRlciBjbG9zZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFNtYXJ0REIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBwcml2YXRlIG9wdGlvbnMgOiBTbWFydERCT3B0aW9uc1xuICBwcml2YXRlIGxvZyA6IExvZ2dlclxuICBwcml2YXRlIGNhY2hlZEJsb2NrcyA6IEJsb2NrQ2FjaGVcbiAgcHJpdmF0ZSBzY2hlbWFzIDogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgY29ubmVjdGlvbiA6IERiQ29ubmVjdGlvblxuICBwcml2YXRlIGJsb2NrU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGxvY2FsU2Vzc2lvbiA6IERiU2Vzc2lvblxuICBwcml2YXRlIGJsb2NrREIgOiBMZXZlbEJsb2NrXG4gIHByaXZhdGUgY3VycmVudEJsb2NrIDogQmxvY2sgfCBudWxsXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdG9yIFxuICAgKiBOT1RJQyA6IHlvdSBuZWVkIGNhbGwgaW5pdCBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIGRiUGF0aCBwYXRoIG9mIGJsb2NrY2hhaW4gZGJcbiAgICogQHBhcmFtIGxldmVsQmxvY2tEaXIgcGF0aCBvZiBibG9jayBoZWFkZXIgZGJcbiAgICogQHBhcmFtIG9wdGlvbnMgb2YgU21hcnREQlxuICAgKi9cbiAgcHVibGljIGNvbnN0cnVjdG9yKCBkYlBhdGg6IHN0cmluZywgbGV2ZWxCbG9ja0Rpcjogc3RyaW5nLCBvcHRpb25zPyA6IFNtYXJ0REJPcHRpb25zICkge1xuICAgIERCQy5hcmd1bWVudCgnZGJQYXRoJywgKCk9PiBEQkMubm90TnVsbE9yV2hpdGVzcGFjZShkYlBhdGgpKVxuICAgIERCQy5hcmd1bWVudCgnbGV2ZWxCbG9ja0RpcicsICgpPT4gREJDLm5vdE51bGxPcldoaXRlc3BhY2UobGV2ZWxCbG9ja0RpcikpXG5cbiAgICBzdXBlcigpXG4gICAgdGhpcy5vcHRpb25zID0gIHtcbiAgICAgIGNhY2hlZEJsb2NrQ291bnQgOiAxMCxcbiAgICAgIGhpc3RvcnlGb3JSb2xsYmFjayA6IDEwLFxuICAgICAgYXV0b0NsZWFuUGVyc2lzdGVkSGlzdG9yeSA6IGZhbHNlLCAgICAgIFxuICAgICAgZW50aXR5Q2FjaGVPcHRpb25zIDogeyBkZWZhdWx0IDogNTAwMCB9XG4gICAgfSB8fCBvcHRpb25zXG5cbiAgICB0aGlzLnNjaGVtYXMgPSBuZXcgTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+KClcbiAgICB0aGlzLmxvZyA9IExvZ01hbmFnZXIuZ2V0TG9nZ2VyKFNtYXJ0REIubmFtZSlcbiAgICB0aGlzLmJsb2NrREIgPSBuZXcgTGV2ZWxCbG9jayhsZXZlbEJsb2NrRGlyKVxuICAgIHRoaXMuY2FjaGVkQmxvY2tzID0gbmV3IEJsb2NrQ2FjaGUoIHRoaXMub3B0aW9ucy5jYWNoZWRCbG9ja0NvdW50ISApXG4gICAgdGhpcy5jb25uZWN0aW9uID0gbmV3IFNxbGl0ZUNvbm5lY3Rpb24oeyBzdG9yYWdlOiBkYlBhdGggfSlcbiAgICB0aGlzLmJsb2NrU2Vzc2lvbiA9IG5ldyBEYlNlc3Npb24odGhpcy5jb25uZWN0aW9uLCB0aGlzLm9wdGlvbnMuZW50aXR5Q2FjaGVPcHRpb25zLCAnQmxvY2snKVxuICAgIHRoaXMubG9jYWxTZXNzaW9uID0gbmV3IERiU2Vzc2lvbih0aGlzLmNvbm5lY3Rpb24sIHRoaXMub3B0aW9ucy5lbnRpdHlDYWNoZU9wdGlvbnMsICdMb2NhbCcpXG4gIH1cblxuICBwcml2YXRlIGdldFNjaGVtYTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4gLCB0aHJvd0lmVW5kZWZpbmVkID0gZmFsc2UsIHRocm93SWZSZWFkb25seSA9IGZhbHNlKSA6IE1heWJlVW5kZWZpbmVkPE1vZGVsU2NoZW1hPiB7XG4gICAgY29uc3QgbW9kZWxOYW1lID0gaXNTdHJpbmcoIG1vZGVsICkgPyBTdHJpbmcobW9kZWwpIDogKCBtb2RlbCBhcyBDb25zdHJ1Y3RvcjxURW50aXR5PiApLm5hbWUgXG4gICAgXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuc2NoZW1hcy5nZXQobW9kZWxOYW1lKSBcbiAgICB0aHJvd0lmVW5kZWZpbmVkICYmIERCQy52ZXJpZnkoIHNjaGVtYSAhPT0gdW5kZWZpbmVkLCBgdW5yZWdpc3RlcmVkIG1vZGVsICckeyBtb2RlbE5hbWUgfSdgKVxuICAgIHRocm93SWZSZWFkb25seSAmJiBEQkMudmVyaWZ5KCAhc2NoZW1hIS5pc1JlYWRvbmx5LCBgbW9kZWwgJyR7IG1vZGVsTmFtZSB9JyBpcyByZWFkb25seWApXG5cbiAgICByZXR1cm4gc2NoZW1hXG4gIH1cblxuICBwcml2YXRlIGdldFNlc3Npb248VEVudGl0eT4oIHNjaGVtYSA6IE1vZGVsU2NoZW1hICkgOiBEYlNlc3Npb24geyBcbiAgICByZXR1cm4gc2NoZW1hIS5pc0xvY2FsID8gdGhpcy5sb2NhbFNlc3Npb24gOiB0aGlzLmJsb2NrU2Vzc2lvblxuICB9XG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgU21hcnREQiAsIHlvdSBuZWVkIGNhbGwgdGhpcyBiZWZvcmUgdXNlIFNtYXJ0REJcbiAgICogQHBhcmFtIHNjaGVtYXMgdGFibGUgc2NoZW1hcyBpbiBEYXRhYmFzZVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGluaXQoc2NoZW1hcyA6IEFycmF5PE1vZGVsU2NoZW1hPikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NjaGVtYXMnLCAoKT0+IERCQy5ub3ROdWxsKHNjaGVtYXMpKVxuXG4gICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLmNvbm5lY3QoKSAgICBcbiAgICBhd2FpdCB0aGlzLmJsb2NrREIub3BlbigpXG5cbiAgICBzY2hlbWFzLmZvckVhY2goIGFzeW5jIHNjaGVtYSA9PiB7XG4gICAgICB0aGlzLnNjaGVtYXMuc2V0KCBzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEgKVxuICAgICAgbGV0IHNlc3Npb24gPSB0aGlzLmdldFNlc3Npb24oIHNjaGVtYSApXG5cbiAgICAgIHNlc3Npb24ucmVnaXN0ZXJTY2hlbWEoc2NoZW1hKVxuICAgICAgYXdhaXQgc2Vzc2lvbi5zeW5jU2NoZW1hKHNjaGVtYSlcbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYHN5bmMgc2NoZW1hIG1vZGVsID0gJHtzY2hlbWEubW9kZWxOYW1lfSBgKVxuXG4gICAgICBpZiAoIHNjaGVtYS5tZW1DYWNoZWQgKSB7IFxuICAgICAgICBsZXQgaXRlbXMgPSBhd2FpdCBzZXNzaW9uLmdldE1hbnkoIHNjaGVtYS5tb2RlbE5hbWUsIHt9LCBmYWxzZSwgdHJ1ZSApXG4gICAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYG1vZGVsICR7c2NoZW1hLm1vZGVsTmFtZX0gY2FjaGVkICR7aXRlbXMubGVuZ3RofSBlbnRpdGllcyBgKVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5lbWl0KCAncmVhZHknLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBmcmVlIHJlc291cmNlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGNsb3NlKCkgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5jbG9zZSgpXG4gICAgYXdhaXQgdGhpcy5sb2NhbFNlc3Npb24uY2xvc2UoKVxuICAgIGF3YWl0IHRoaXMuYmxvY2tEQi5jbG9zZSgpXG4gICAgXG4gICAgdGhpcy5lbWl0KCdjbG9zZWQnLCB0aGlzIClcbiAgfVxuXG4gIC8qKlxuICAgKiBoZWlnaHQgb2YgbGFzdCBibG9ja1xuICAgKi9cbiAgcHVibGljIGdldCBsYXN0QmxvY2tIZWlnaHQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tEQi5sYXN0QmxvY2tIZWlnaHRcbiAgfVxuXG4gIC8qKlxuICAgKiBibG9ja3MgY291bnRcbiAgICovXG4gIHB1YmxpYyBnZXQgYmxvY2tzQ291bnQoKSA6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0ICsgMVxuICB9XG4gIFxuICAvKipcbiAgICogYmVnaW4gYSBuZXcgYmxvY2tcbiAgICogQHBhcmFtIGJsb2NrSGVhZGVyIFxuICAgKi9cbiAgcHVibGljIGJlZ2luQmxvY2soIGJsb2NrOiBCbG9jayApIDogdm9pZCB7XG4gICAgLy8gVE9ETzogdmVyaWZ5IGJsb2NrSGVhZGVyIGhlcmVcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrJywgKCk9PiBEQkMubm90TnVsbChibG9jaykpXG4gICAgREJDLmFyZ3VtZW50KCdibG9jaycsIGJsb2NrLmhlaWdodCA9PT0gdGhpcy5sYXN0QmxvY2tIZWlnaHQgKyAxLCBgaW52YWxpZCBibG9jayBoZWlnaHQgJHtibG9jay5oZWlnaHR9LCBsYXN0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgIFxuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGJsb2NrIGhlaWdodCA9ICR7YmxvY2suaGVpZ2h0fWApXG4gICAgdGhpcy5jdXJyZW50QmxvY2sgPSBibG9ja1xuICB9XG5cbiAgLyoqXG4gICAqIGNvbW1pdCBibG9jayBjaGFuZ2VzXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgY29tbWl0QmxvY2soKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKCF0aGlzLmN1cnJlbnRCbG9jaykgdGhyb3cgbmV3IEVycm9yKCdDdXJyZW50IGJsb2NrIGlzIG51bGwnKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgQkVHSU4gY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHR9YClcblxuICAgIGxldCBibG9ja0hlYWRlciA9IE9iamVjdC5hc3NpZ24oIHt9LCB0aGlzLmN1cnJlbnRCbG9jayApXG4gICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eShibG9ja0hlYWRlciwgJ3RyYW5zYWN0aW9ucycpXG4gICAgYXdhaXQgdGhpcy5ibG9ja0RCLmFwcGVuZEJsb2NrKCBibG9ja0hlYWRlciwgdGhpcy5ibG9ja1Nlc3Npb24uZ2V0Q2hhbmdlcygpIClcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24uc2F2ZUNoYW5nZXMoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCApXG4gICAgICB0aGlzLmJsb2NrU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHRoaXMuY3VycmVudEJsb2NrLmhlaWdodCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5Rm9yUm9sbGJhY2shIClcbiAgICAgIHRoaXMuY2FjaGVkQmxvY2tzLnB1dCggdGhpcy5jdXJyZW50QmxvY2sgKVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG5cbiAgICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYFNVQ0NFU1MgY29tbWl0QmxvY2sgaGVpZ2h0ID0gJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuICAgICAgcmV0dXJuIHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgfVxuICAgIGNhdGNoKCBlcnIgKSB7IFxuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIGNvbW1pdEJsb2NrICggaGVpZ2h0ID0gJHt0aGlzLmN1cnJlbnRCbG9jayEuaGVpZ2h0fSApYCwgZXJyKVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayh0aGlzLmN1cnJlbnRCbG9jay5oZWlnaHQpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcm9sbGJhY2sgYmxvY2sgY2hhbmdlc1xuICAgKiBAcGFyYW0gaGVpZ2h0IHJvbGxiYWNrIHRvIGhlaWdodChleGNsdWRlKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIHJvbGxiYWNrQmxvY2soIGhlaWdodD86IG51bWJlciApIDogUHJvbWlzZTx2b2lkPiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCAhaGVpZ2h0IHx8IGhlaWdodCA8PSB0aGlzLmxhc3RCbG9ja0hlaWdodCwgXG4gICAgICBgaGVpZ2h0IG11c3QgbGVzcyBvciBlcXVhbCBsYXN0QmxvY2tIZWlnaHQgJHt0aGlzLmxhc3RCbG9ja0hlaWdodH1gKVxuXG4gICAgY29uc3QgZnJvbUhlaWdodCA9IHRoaXMuY3VycmVudEJsb2NrID8gdGhpcy5jdXJyZW50QmxvY2shLmhlaWdodCA6IHRoaXMubGFzdEJsb2NrSGVpZ2h0XG4gICAgY29uc3QgdG9IZWlnaHQgPSBoZWlnaHQgfHwgdGhpcy5sYXN0QmxvY2tIZWlnaHRcbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIFxuICAgIHRyeSB7XG4gICAgICBjb25zdCB2ZXIgPSB0aGlzLmJsb2NrU2Vzc2lvbi5oaXN0b3J5VmVyc2lvbjtcbiAgICAgIGlmICggZnJvbUhlaWdodCA8IHZlci5taW4gKSB7IC8vIGxvYWQgaGlzdG9yeSBmcm9tIGxldmVsZGIsIGlmIGNhY2hlZCBoaXN0b3J5IGxlc3MgdGhhbiByb2xsYmFjayBoZWlnaHQgXG4gICAgICAgIGxldCBoaXN0b3J5ID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEhpc3RvcnlDaGFuZ2VzKCBmcm9tSGVpZ2h0LCB2ZXIubWluIC0gMSApXG4gICAgICAgIHRoaXMuYmxvY2tTZXNzaW9uLmF0dGFjaEhpc3RvcnkoIGhpc3RvcnkgKVxuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucm9sbGJhY2tDaGFuZ2VzKCB0b0hlaWdodCApXG4gICAgICB3aGlsZSggdGhpcy5sYXN0QmxvY2tIZWlnaHQgPiB0b0hlaWdodCApIHtcbiAgICAgICAgYXdhaXQgdGhpcy5ibG9ja0RCLmRlbGV0ZUxhc3RCbG9jayggdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgICB0aGlzLmNhY2hlZEJsb2Nrcy5ldml0KCB0aGlzLmxhc3RCbG9ja0hlaWdodCwgdGhpcy5sYXN0QmxvY2tIZWlnaHQgKVxuICAgICAgfVxuICAgICAgdGhpcy5jdXJyZW50QmxvY2sgPSBudWxsXG4gICAgICB0aGlzLmxvZy5pbmZvRW5hYmxlZCAmJiB0aGlzLmxvZy5pbmZvKGBTVUNDRVNTIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgKVxuICAgIH1cbiAgICBjYXRjaCggZXJyICkge1xuICAgICAgdGhpcy5sb2cuZXJyb3JFbmFsZWQgJiYgdGhpcy5sb2cuZXJyb3IoYEZBSUxEIHJvbGxiYWNrQmxvY2sgKCBoZWlnaHQgOiAke2Zyb21IZWlnaHR9IC0+ICR7dG9IZWlnaHR9IClgLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogc2F2ZSBsb2NhbCB0YWJsZXMgKG5vdCBpbiBibG9jayAtLS0gd2hpY2ggZGVmaW5lIGluIHNjaGVtYSBieSBsb2NhbCA6IHRydWUpIGNoYW5nZXMgdG8gZGF0YWJhc2VcbiAgICogQHJldHVybnMgc2VyaWFsIG51bWJlciBmb3IgY2hhbmdlc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIHNhdmVMb2NhbENoYW5nZXMoKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgbGV0IHNlcmlhbCA9IGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnNhdmVDaGFuZ2VzKClcbiAgICB0aGlzLmxvY2FsU2Vzc2lvbi5jbGVhckhpc3RvcnlCZWZvcmUoIHNlcmlhbCApXG4gICAgcmV0dXJuIHNlcmlhbFxuICB9XG5cbiAgLyoqXG4gICAqIHJvbGxiYWNrIGxvY2FsIHRhYmxlcyBjaGFuZ2VzIHNhdmVMb2NhbENoYW5nZXNcbiAgICogQHBhcmFtIHNlcmlhbCBzZXJpYWwgbnVtYmVyIHJldHVybiBmcm9tIHNhdmVMb2NhbENoYW5nZXNcbiAgICovXG4gIHB1YmxpYyBhc3luYyByb2xsYmFja0xvY2FsQ2hhbmdlcyhzZXJpYWw6IG51bWJlcikgOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBEQkMuYXJndW1lbnQoJ3NlcmlhbCcsIHNlcmlhbCA+IDAsIGBzZXJpYWwgbXVzdCBncmVhdCB0aGFuIHplcm9gKSBcblxuICAgIGF3YWl0IHRoaXMubG9jYWxTZXNzaW9uLnJvbGxiYWNrQ2hhbmdlcyhzZXJpYWwpXG4gICAgdGhpcy5sb2NhbFNlc3Npb24uY2xlYXJIaXN0b3J5QmVmb3JlKHNlcmlhbClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgZW50aXR5IGtleVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBlbnRpdHlcbiAgICovXG4gIHB1YmxpYyBnZXRFbnRpdHlLZXk8VEVudGl0eT4oIG1vZGVsOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGVudGl0eTogVEVudGl0eSApOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlLZXk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgKCkgPT4gREJDLm5vdE51bGwoZW50aXR5KSApXG4gICAgXG4gICAgY29uc3Qgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEobW9kZWwsIHRydWUpIVxuICAgIHJldHVybiBzY2hlbWEuZ2V0S2V5KCBlbnRpdHkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGdldCB0cmFja2luZyBlbnRpdHkgYnkga2V5IFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IG9yIHVuZGVmaW5lZFxuICAgKi9cbiAgcHVibGljIGF0dGFjaDxURW50aXR5PiggbW9kZWw6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5OiBFbnRpdHlLZXkgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCkgPT4gREJDLm5vdE51bGwoa2V5KSApXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG4gICAgcmV0dXJuIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEpLmF0dGFjaCggc2NoZW1hLCBrZXkgKVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIG5ldyBlbnRpdHkgd2hpY2ggY2hhbmdlIHdpbGwgYmUgdHJhY2tlZCBhbmQgcGVyc2lzdGVudGVkIChieSBzYXZlQ2hhbmdlcykgYXV0b21hdGljYWxseVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGtleSBlbnRpdHkga2V5IHdoaWNoIHVuaXF1ZWQgaW4gZGF0YWJhc2VcbiAgICogQHBhcmFtIGVudGl0eSBwcm90b3R5cGUgZW50aXR5IHdoaWNoIHByb3BlcnRpZXMgd2lsbCBjb3B5IHRvIHJlc3VsdCBlbnRpdHlcbiAgICogQHJldHVybnMgdHJhY2tpbmcgZW50aXR5XG4gICAqL1xuICBwdWJsaWMgY3JlYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5Piwga2V5T3JFbnRpdHk6IEVudGl0eUtleSB8IFRFbnRpdHkpIDogVEVudGl0eSB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5T3JFbnRpdHknLCAoKT0+IERCQy5ub3ROdWxsKGtleU9yRW50aXR5KSlcbiAgICBcbiAgICBsZXQga2V5IDogRW50aXR5S2V5XG4gICAgbGV0IGVudGl0eTogTWF5YmVVbmRlZmluZWQ8VEVudGl0eT5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlICwgdHJ1ZSkhXG5cbiAgICBpZiAoIGlzUHJpbWl0aXZlS2V5KCBrZXlPckVudGl0eSApIHx8IGlzQ29tcG9zaXRlS2V5KCBrZXlPckVudGl0eSApICkgeyBcbiAgICAgIGtleSA9IGtleU9yRW50aXR5IGFzIEVudGl0eUtleSBcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBlbnRpdHkgPSBrZXlPckVudGl0eSBhcyBURW50aXR5XG4gICAgICBrZXkgPSBzY2hlbWEuZ2V0S2V5KGVudGl0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSkuY3JlYXRlKG1vZGVsLCBrZXksIGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiB1cGRhdGUgYSBlbnRpdHlcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsTmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBlbnRpdHkgXG4gICAqL1xuICAvLyBwdWJsaWMgdXBkYXRlPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZW50aXR5OiBURW50aXR5ICkgOiB2b2lkIHtcbiAgLy8gICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCkgPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAvLyAgIERCQy5hcmd1bWVudCgnZW50aXR5JywgZW50aXR5ICYmIEVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpLCBgaXMgbm90IGEgcHJveGllZCBvYmplY3RgIClcblxuICAvLyAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUsIHRydWUgKVxuICAvLyAgIHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS51cGRhdGUoZW50aXR5KVxuICAvLyB9XG5cbiAgLyoqXG4gICAqIGRlbGV0ZSBhIGVudGl0eVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWxOYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGVudGl0eSBcbiAgICovXG4gIHB1YmxpYyBkZWxldGU8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBlbnRpdHk6IFRFbnRpdHkgKSA6IHZvaWQge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKSA9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdlbnRpdHknLCBlbnRpdHkgJiYgRW50aXR5UHJveHkuaXNQcm94aWVkKGVudGl0eSksIGBpcyBub3QgYSB0cmFja2luZyBlbnRpdHlgIClcbiAgICBcbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlLCB0cnVlIClcbiAgICB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZGVsZXRlKGVudGl0eSlcbiAgfVxuXG4gIC8qKlxuICAgKiBsb2FkIGVudGl0eSBmcm9tIGNhY2hlIGFuZCBkYXRhYmFzZVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldDxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGtleTogRW50aXR5S2V5ICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgna2V5JywgKCk9PiBEQkMubm90TnVsbChrZXkpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5sb2FkKG1vZGVsLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogbG9hZCBlbnRpdHkgZnJvbSBkYXRhYmFzZSBieSBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCeTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uICkgOiBQcm9taXNlPE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuICAgIERCQy5hcmd1bWVudCgnY29uZGl0aW9uJywgKCk9PiBEQkMubm90TnVsbChjb25kaXRpb24pKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgbGV0IGl0ZW1zID0gYXdhaXQgdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmdldE1hbnkobW9kZWwsIGNvbmRpdGlvbilcbiAgICBpZiAoIGl0ZW1zLmxlbmd0aCA+IDEgKSBcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWFueSBlbnRpdGllcyBmb3VuZCAoIG1vZGVsID0gJyR7c2NoZW1hIS5tb2RlbE5hbWV9JyAsIGNvbmRpdGlvbiA9ICcke0pTT04uc3RyaW5naWZ5KGNvbmRpdGlvbil9JyApYClcblxuICAgIHJldHVybiBpdGVtcy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBpdGVtc1swXVxuICB9XG5cbiAgICAvKipcbiAgICogZ2V0IGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBmaW5kIGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgYW5kIGNhY2hlIHJlc3VsdCBpZiB0cnVlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0TWFueTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIGNvbmRpdGlvbjogU3FsQ29uZGl0aW9uLCB0cmFjayA9IGZhbHNlICkgOiBQcm9taXNlPEFycmF5PFRFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5nZXRNYW55KG1vZGVsLCBjb25kaXRpb24sIHRyYWNrKVxuICB9XG5cbiAgLyoqXG4gICAqIGxvYWQgZW50aXR5IGZyb20gY2FjaGUgb25seVxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBrZXkga2V5IG9mIGVudGl0eVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqIEByZXR1cm5zIHRyYWNrZWQgZW50aXR5IGZyb20gY2FjaGVcbiAgICovXG4gIHB1YmxpYyBnZXRDYWNoZWQ8VEVudGl0eT4oIG1vZGVsIDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBrZXk6IEVudGl0eUtleSAsIHRyYWNrID0gZmFsc2UgKSA6IE1heWJlVW5kZWZpbmVkPFRFbnRpdHk+IHtcbiAgICBEQkMuYXJndW1lbnQoJ21vZGVsJywgKCk9PiBEQkMubm90TnVsbChtb2RlbCkpXG4gICAgREJDLmFyZ3VtZW50KCdrZXknLCAoKT0+IERCQy5ub3ROdWxsKGtleSkpXG5cbiAgICBsZXQgc2NoZW1hID0gdGhpcy5nZXRTY2hlbWEoIG1vZGVsLCB0cnVlIClcbiAgICByZXR1cm4gdGhpcy5nZXRTZXNzaW9uKHNjaGVtYSEpLmxvYWRDYWNoZWQobW9kZWwsIGtleSwgdHJhY2spXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGFsbCBjYWNoZWQgZW50aXRpZXNcbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gdHJhY2sgdHJhY2sgcmVzdWx0XG4gICAqL1xuICBwdWJsaWMgZ2V0QWxsQ2FjaGVkPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgZmlsdGVyPyA6IEZpbHRlckZ1bmN0aW9uPFRFbnRpdHk+LCAgdHJhY2sgPSBmYWxzZSApIDogQXJyYXk8VEVudGl0eT4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZ2V0QWxsQ2FjaGVkKCBtb2RlbCwgZmlsdGVyLCB0cmFjayApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICogQHBhcmFtIHJlc3VsdFJhbmdlIGxpbWl0IGFuZCBvZmZzZXQgb2YgcmVzdWx0cyBudW1iZXIgb3IganNvbiwgZWc6IDEwIG9yIHsgbGltaXQgOiAxMCwgb2Zmc2V0IDogMSB9IFxuICAgKiBAcGFyYW0gc29ydCBqc29uIHsgZmllbGROYW1lIDogJ0FTQycgfCAnREVTQycgfSAsIGVnOiB7IG5hbWUgOiAnQVNDJywgYWdlIDogJ0RFU0MnIH1cbiAgICogQHBhcmFtIGZpZWxkcyByZXN1bHQgZmllbGRzLCBkZWZhdWx0IGlzIGFsbCBmaWVsZHNcbiAgICogQHBhcmFtIG9mZnNldCBvZmZzZXQgb2YgcmVzdWx0IHNldCAgXG4gICAqIEBwYXJhbSBqb2luIGpvaW4gaW5mbyBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgY29uZGl0aW9uIDogU3FsQ29uZGl0aW9uLCByZXN1bHRSYW5nZT8gOiBTcWxSZXN1bHRSYW5nZSwgXG4gICAgc29ydD8gOiBTcWxPcmRlciwgZmllbGRzPyA6IEFycmF5PHN0cmluZz4sIGpvaW4/IDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeShtb2RlbCwgY29uZGl0aW9uLCByZXN1bHRSYW5nZSwgc29ydCwgZmllbGRzLCBqb2luKVxuICB9XG5cblxuICAvKipcbiAgICogZmluZCBlbnRpdGllcyBmcm9tIGRhdGFiYXNlIFxuICAgKiBAcGFyYW0gbW9kZWwgbW9kZWwgbmFtZSBvciBtb2RlbCB0eXBlXG4gICAqIEBwYXJhbSBwYXJhbXMgbWFuZ28gbGlrZSBxdWVyeSBwYXJhbXMgb2JqZWN0XG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZmluZE9uZTxURW50aXR5PiggbW9kZWwgOiBNb2RlbE5hbWVPclR5cGU8VEVudGl0eT4sIHBhcmFtcyA6IEpzb25PYmplY3QgKSA6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8RW50aXR5Pj4ge1xuICAgIGxldCBpdGVtcyA9IGF3YWl0IHRoaXMuZmluZEFsbCggbW9kZWwsIHBhcmFtcyApXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgaWYgKCBpdGVtcy5sZW5ndGggPiAxICkgXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYG1hbnkgZW50aXRpZXMgZm91bmQgKCBtb2RlbCA9ICcke3NjaGVtYSEubW9kZWxOYW1lfScgLCBwYXJhbXMgPSAnJHtKU09OLnN0cmluZ2lmeShwYXJhbXMpfScgKWApXG4gICAgXG4gICAgcmV0dXJuIGl0ZW1zLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGl0ZW1zWzBdXG4gIH1cblxuICAgIC8qKlxuICAgKiBmaW5kIGVudGl0aWVzIGZyb20gZGF0YWJhc2UgXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIHBhcmFtcyBtYW5nbyBsaWtlIHF1ZXJ5IHBhcmFtcyBvYmplY3RcbiAgICovXG4gIHB1YmxpYyBhc3luYyBmaW5kQWxsPFRFbnRpdHk+KCBtb2RlbCA6IE1vZGVsTmFtZU9yVHlwZTxURW50aXR5PiwgcGFyYW1zIDogSnNvbk9iamVjdCApIDogUHJvbWlzZTxBcnJheTxFbnRpdHk+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5xdWVyeUJ5SnNvbiggbW9kZWwsIHBhcmFtcyApXG4gIH1cblxuXG4gIC8qKlxuICAgKiBxdWVyeSBpZiBleGlzdHMgcmVjb3JkIGJ5IHNwZWNpZmllZCBjb25kaXRpb25cbiAgICogQHBhcmFtIG1vZGVsIG1vZGVsIG5hbWUgb3IgbW9kZWwgdHlwZVxuICAgKiBAcGFyYW0gY29uZGl0aW9uIHF1ZXJ5IGNvbmRpdGlvbiwgc2VlIHR5cGUgU3FsQ29uZGl0aW9uIFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGV4aXN0czxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIERCQy5hcmd1bWVudCgnbW9kZWwnLCAoKT0+IERCQy5ub3ROdWxsKG1vZGVsKSlcblxuICAgIGxldCBzY2hlbWEgPSB0aGlzLmdldFNjaGVtYSggbW9kZWwsIHRydWUgKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLmdldFNlc3Npb24oc2NoZW1hISkuZXhpc3RzKG1vZGVsLCBjb25kaXRpb24pXG4gIH1cblxuICAvKipcbiAgICogY291bnQgcmVjb3JkcyBjb3VudCBieSBzcGVjaWZpZWQgY29uZGl0aW9uXG4gICAqIEBwYXJhbSBtb2RlbCBtb2RlbCBuYW1lIG9yIG1vZGVsIHR5cGVcbiAgICogQHBhcmFtIGNvbmRpdGlvbiBxdWVyeSBjb25kaXRpb24sIHNlZSB0eXBlIFNxbENvbmRpdGlvbiBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBjb3VudDxURW50aXR5Pihtb2RlbDogTW9kZWxOYW1lT3JUeXBlPFRFbnRpdHk+LCBjb25kaXRpb24gOiBTcWxDb25kaXRpb24gKSA6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgREJDLmFyZ3VtZW50KCdtb2RlbCcsICgpPT4gREJDLm5vdE51bGwobW9kZWwpKVxuXG4gICAgbGV0IHNjaGVtYSA9IHRoaXMuZ2V0U2NoZW1hKCBtb2RlbCwgdHJ1ZSApXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0U2Vzc2lvbihzY2hlbWEhKS5jb3VudChtb2RlbCwgY29uZGl0aW9uKVxuICB9XG5cbiAgcHJvdGVjdGVkIGFzeW5jIGF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tzIDogQXJyYXk8QmxvY2tIZWFkZXI+LCAgZ2V0VHJhbnNhY3Rpb25zOiAoKSA9PiBQcm9taXNlPEFycmF5PFRyYW5zYWN0aW9uPj4gKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgbGV0IHRyYW5zR3JvdXAgPSBuZXcgTWFwPHN0cmluZywgQXJyYXk8VHJhbnNhY3Rpb24+PigpXG4gICAgbGV0IHRyYW5zYWN0aW9ucyA9IGF3YWl0IGdldFRyYW5zYWN0aW9ucygpXG5cbiAgICB0cmFuc2FjdGlvbnMuZm9yRWFjaCggdCA9PiB7XG4gICAgICBpZiAoIXRyYW5zR3JvdXAuaGFzKCB0LmJsb2NrSWQgKSkgdHJhbnNHcm91cC5zZXQoIHQuYmxvY2tJZCwgbmV3IEFycmF5PFRyYW5zYWN0aW9uPigpIClcbiAgICAgIHRyYW5zR3JvdXAuZ2V0KCB0LmJsb2NrSWQgKSEucHVzaCggdCApXG4gICAgfSApXG5cbiAgICBibG9ja3MuZm9yRWFjaCggYiA9PiBiWyd0cmFuc2FjdGlvbnMnXSA9IHRyYW5zR3JvdXAuZ2V0KGIuaWQhKSApXG4gICAgcmV0dXJuIGJsb2NrcyBhcyBBcnJheTxCbG9jaz5cbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVyIGJ5IGhlaWdodFxuICAgKiBAcGFyYW0gaGVpZ2h0IGJsb2NrIGhlaWdodFxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2NrQnlIZWlnaHQoIGhlaWdodCA6IG51bWJlciwgd2l0aFRyYW5zYWN0aW9ucyA9IGZhbHNlICk6IFByb21pc2U8TWF5YmVVbmRlZmluZWQ8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdoZWlnaHQnLCBoZWlnaHQgPiAwICwgJ2hlaWdodCBtdXN0IGdyZWF0IHRoYW4gemVybycpXG4gICAgXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0KGhlaWdodClcbiAgICBpZiAoIGNhY2hlZEJsb2NrICkgcmV0dXJuIGNhY2hlZEJsb2NrXG5cbiAgICBsZXQgYmxvY2tIZWFkZXIgPSBhd2FpdCB0aGlzLmJsb2NrREIuZ2V0QmxvY2soIGhlaWdodCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlciBieSBibG9jayBpZFxuICAgKiBAcGFyYW0gYmxvY2tJZCBibG9jayBpZCBcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja0J5SWQoIGJsb2NrSWQgOiBzdHJpbmcsIHdpdGhUcmFuc2FjdGlvbnMgPSBmYWxzZSApIDogUHJvbWlzZTxNYXliZVVuZGVmaW5lZDxCbG9jaz4+IHtcbiAgICBEQkMuYXJndW1lbnQoJ2Jsb2NrSWQnLCAoKT0+IERCQy5ub3ROdWxsT3JXaGl0ZXNwYWNlKGJsb2NrSWQpKVxuXG4gICAgbGV0IGNhY2hlZEJsb2NrID0gdGhpcy5jYWNoZWRCbG9ja3MuZ2V0QnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCBjYWNoZWRCbG9jayApIHJldHVybiBjYWNoZWRCbG9ja1xuXG4gICAgbGV0IGJsb2NrSGVhZGVyID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2NrQnlJZCggYmxvY2tJZCApXG4gICAgaWYgKCAhd2l0aFRyYW5zYWN0aW9ucyB8fCBibG9ja0hlYWRlciA9PT0gdW5kZWZpbmVkICApIHJldHVybiBibG9ja0hlYWRlclxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBbYmxvY2tIZWFkZXIhXSAsIGFzeW5jICgpID0+XG4gICAgICBhd2FpdCB0aGlzLmJsb2NrU2Vzc2lvbi5xdWVyeTxUcmFuc2FjdGlvbj4oJ1RyYW5zYWN0aW9uJywgeyBibG9ja0lkIDogYmxvY2tIZWFkZXIhLmlkISB9KSApWzBdXG4gIH1cblxuICAvKipcbiAgICogZ2V0IGJsb2NrIGhlYWRlcnMgYnkgaGVpZ2h0IHJhbmdlXG4gICAqIEBwYXJhbSBtaW5IZWlnaHQgbWluIGhlaWdodChpbmNsdWRlZClcbiAgICogQHBhcmFtIG1heEhlaWdodCBtYXggaGVpZ2h0KGluY2x1ZGVkKVxuICAgKi9cbiAgcHVibGljIGFzeW5jIGdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCA6IG51bWJlciwgbWF4SGVpZ2h0IDogbnVtYmVyLCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdtaW5IZWlnaHQsIG1heEhlaWdodCcsIG1pbkhlaWdodCA+IDAgJiYgbWF4SGVpZ2h0ID49IG1pbkhlaWdodCwgJ21pbkhlaWdodCBvciBtYXhIZWlnaHQgaXMgaW52YWxpZCcpXG5cbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SGVpZ2h0UmFuZ2UoIG1pbkhlaWdodCwgbWF4SGVpZ2h0IClcbiAgICBpZiAoICF3aXRoVHJhbnNhY3Rpb25zICkgcmV0dXJuIGJsb2NrSGVhZGVycyBhcyBBcnJheTxCbG9jaz5cblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmF0dGFjaFRyYW5zYWN0aW9ucyggYmxvY2tIZWFkZXJzICwgYXN5bmMgKCkgPT5cbiAgICAgIGF3YWl0IHRoaXMuYmxvY2tTZXNzaW9uLnF1ZXJ5PFRyYW5zYWN0aW9uPignVHJhbnNhY3Rpb24nLCB7IGJsb2NrSWQgOiB7ICRpbiA6IGJsb2NrSGVhZGVycy5tYXAoIGIgPT4gYi5pZCEgKSB9IH0pIClcbiAgfVxuXG4gIC8qKlxuICAgKiBnZXQgYmxvY2sgaGVhZGVycyBieSBibG9jayBpZCBhcnJheVxuICAgKiBAcGFyYW0gYmxvY2tJZHMgYXJyYXkgb2YgYmxvY2sgaWRcbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRCbG9ja3NCeUlkcyggYmxvY2tJZHMgOiBBcnJheTxzdHJpbmc+LCB3aXRoVHJhbnNhY3Rpb25zID0gZmFsc2UgKSA6IFByb21pc2U8QXJyYXk8QmxvY2s+PiB7XG4gICAgREJDLmFyZ3VtZW50KCdibG9ja0lkcycsICgpID0+IERCQy5ub3ROdWxsKGJsb2NrSWRzKSApXG5cbiAgICBsZXQgYmxvY2tIZWFkZXJzID0gYXdhaXQgdGhpcy5ibG9ja0RCLmdldEJsb2Nrc0J5SWRzKGJsb2NrSWRzKVxuICAgIGlmICggIXdpdGhUcmFuc2FjdGlvbnMgKSByZXR1cm4gYmxvY2tIZWFkZXJzIGFzIEFycmF5PEJsb2NrPlxuXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuYXR0YWNoVHJhbnNhY3Rpb25zKCBibG9ja0hlYWRlcnMgLCBhc3luYyAoKSA9PlxuICAgICAgYXdhaXQgdGhpcy5ibG9ja1Nlc3Npb24ucXVlcnk8VHJhbnNhY3Rpb24+KCdUcmFuc2FjdGlvbicsIHsgYmxvY2tJZCA6IHsgJGluIDogYmxvY2tIZWFkZXJzLm1hcCggYiA9PiBiLmlkISApIH0gfSkgKVxuICB9XG59IiwiaW1wb3J0IHsgRW50aXR5LCAgTnVsbGFibGUgfSBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgeyBNb2RlbFNjaGVtYSB9IGZyb20gJy4uL01vZGVsJ1xuaW1wb3J0IHsgRW50aXR5VHJhY2tlciwgUHJveGllZEVudGl0eVRyYWNrZXIgfSBmcm9tICcuL0VudGl0eVRyYWNrZXInXG5cbi8qKiAgICAgXG4gKiAgICAgU1RBVEUgVFJBTlNGRVIgICAgICAgICAgICAgICAgICBBQ1RJT04gICAgICAgICAgICAgICAgVFJBQ0sgICAgICBDQUNIRVxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgICA/ICAgICAgICAgLT4gcGVyc2l0ZW50ICAgICAgc2Vzc2lvbi5sb2FkICAgICAgICAgICAgIHRyYWNrICAgICBjYWNoZVxuICogICAgICA/ICAgICAgICAgLT4gbmV3ICAgICAgICAgICAgc2Vzc2lvbi5jcmVhdGUgICAgICAgICAgIHRyYWNrICAgICAgIC0gIFxuICogcGVyc2lzdGVudCAgICAgLT4gbW9kaWZpZWQgICAgICAgc2V0IHByb3BlcnR5ICAgICAgICAgICAgIGtlZXAgICAgICAga2VlcCBcbiAqIHBlcnNpc3RlbnQgICAgIC0+IGRlbGV0ZWQgICAgICAgIHNlc3Npb24uZGVsICAgICAgICAgICAgICBrZWVwICAgICAgIGtlZXAgXG4gKiBuZXcgfCBtb2RpZmllZCAtPiBwcmVzaXN0ZW50ICAgICBzZXNzaW9uLnNhdmVDaGFuZ2VzICAgICAga2VlcCAgICAgY2FjaGV8dXBkYXRlIFxuICogZGVsZXRlZCAgICAgICAgLT4gdHJhbnNpZW50ICAgICAgc2Vzc2lvbi5zYXZlQ2hhbmdlcyAgICAgIGV2aXQgICAgICAgZXZpdFxuICogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICovXG5cbmV4cG9ydCBlbnVtIEVudGl0eVN0YXRlIHtcbiAgVHJhbnNpZW50ICA9IC0xLFxuICBQZXJzaXN0ZW50ID0gMCxcbiAgXG4gIE5ldyAgICAgICAgPSAxLFxuICBNb2RpZmllZCAgID0gMixcbiAgRGVsZXRlZCAgICA9IDMsXG59XG5cbmV4cG9ydCBlbnVtIEVudGl0eUNoYW5nZVR5cGUge1xuICBOZXcgICAgICAgPSAxLFxuICBNb2RpZnkgICAgPSAyLFxuICBEZWxldGUgICAgPSAzLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3BlcnR5Q2hhbmdlIHtcbiAgbmFtZSA6IHN0cmluZ1xuICBvcmlnaW5hbCA6IGFueVxuICBjdXJyZW50IDogYW55XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q2hhbmdlcyB7XG4gIGRiVmVyc2lvbiAgICAgICAgIDogbnVtYmVyXG4gIHR5cGUgICAgICAgICAgICAgIDogRW50aXR5Q2hhbmdlVHlwZVxuICBwcm9wZXJ0aWVzQ2hhbmdlcyA6IEFycmF5PFByb3BlcnR5Q2hhbmdlPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUV4dGVuc2lvbiB7XG4gIF92ZXJzaW9uXyAgICAgIDogbnVtYmVyXG4gIF9fZGV0YWNoZWRfXyAgIDogYm9vbGVhblxuICBfX3RyYWNraW5nX18gICA6IGJvb2xlYW5cbiAgX19zY2hlbWFfXyAgICAgOiBNb2RlbFNjaGVtYVxuICBfX3RyYWNrZXJfXyAgICA6IEVudGl0eVRyYWNrZXJcbiAgX19zdGF0ZV9fICAgICAgOiBFbnRpdHlTdGF0ZSBcbiAgX190bXBDaGFuZ2VzX18gOiBOdWxsYWJsZTxFbnRpdHlDaGFuZ2VzPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb3hpZWQ8VD4gZXh0ZW5kcyBFbnRpdHlFeHRlbnNpb24ge1xuICBcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eVByb3h5IHtcbiAgcHJpdmF0ZSB0cmFja2VyIDogRW50aXR5VHJhY2tlcjtcblxuICBjb25zdHJ1Y3Rvcih0cmFja2VyOiBFbnRpdHlUcmFja2VyKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBpc0V4dGVuZGVkKGVudGl0eTogRW50aXR5KSB7XG4gICAgcmV0dXJuIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zY2hlbWFfXycpICYmIGVudGl0eS5oYXNPd25Qcm9wZXJ0eSgnX19zdGF0ZV9fJylcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNQcm94aWVkKGVudGl0eTogRW50aXR5KSA6IGJvb2xlYW4ge1xuICAgIHJldHVybiBFbnRpdHlQcm94eS5pc0V4dGVuZGVkKGVudGl0eSlcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY29udmVydFRvUHJveGllZDxURW50aXR5PihlbnRpdHk6IEVudGl0eSkgOiBQcm94aWVkPFRFbnRpdHk+IHtcbiAgICBpZiAoIUVudGl0eVByb3h5LmlzUHJveGllZChlbnRpdHkpKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgUHJveGllZCBFbnRpdHlgKVxuICAgIFxuICAgIHJldHVybiBlbnRpdHkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBwcm94eVRvRW50aXR5KHByb3hpZWQ6IFByb3hpZWQ8RW50aXR5Pik6IEVudGl0eSB7XG4gICAgbGV0IGVudGl0eSA9IHt9XG4gICAgZm9yKCBsZXQgayBpbiBwcm94aWVkICkge1xuICAgICAgaWYgKCBFbnRpdHlQcm94eS5pc05vcm1hbFByb3BlcnR5KGspICkgZW50aXR5W2tdID0gcHJveGllZFtrXVxuICAgIH1cbiAgICByZXR1cm4gZW50aXR5XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGlzTm9ybWFsUHJvcGVydHkocHJvcGVydHlOYW1lIDogc3RyaW5nKSB7XG4gICAgcmV0dXJuICggcHJvcGVydHlOYW1lLmxlbmd0aCA8PSA0ICkgfHwgXG4gICAgICAoIHByb3BlcnR5TmFtZVswXSAhPT0gcHJvcGVydHlOYW1lWzFdICkgfHwgKCBwcm9wZXJ0eU5hbWVbMF0gIT09ICdfJyApIHx8XG4gICAgICAoICFwcm9wZXJ0eU5hbWUuZW5kc1dpdGgoJ19fJykgKSBcbiAgfVxuXG4gIHByb3RlY3RlZCBhdHRhY2hFeHRlbmRQcm9wZXJ0aWVzPFRFbnRpdHk+KGVudGl0eTogVEVudGl0eSwgc2NoZW1hOiBNb2RlbFNjaGVtYSwgc3RhdGU6IEVudGl0eVN0YXRlICkgOiBURW50aXR5IHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICBfdmVyc2lvbl8gICAgICA6IGVudGl0eVsnX3ZlcnNpb25fJ10gfHwgMSxcbiAgICAgIF9fZGV0YWNoZWRfXyAgIDogZmFsc2UsXG4gICAgICBfX3N0YXRlX18gICAgICA6IHN0YXRlLFxuICAgICAgX19zY2hlbWFfXyAgICAgOiBzY2hlbWEsXG4gICAgICBfX3RyYWNrZXJfXyAgICA6IHRoaXMudHJhY2tlciwgXG4gICAgICBfX3RyYWNraW5nX18gICA6IHRydWUsXG4gICAgICBfX3RtcENoYW5nZXNfXyA6IG51bGxcbiAgICB9LCBlbnRpdHkpXG4gIH1cblxuICBwcm90ZWN0ZWQgb25Qcm9wZXJ0eVNldChlbnRpdHk6IEVudGl0eSwgcHJvcGVydHlOYW1lOiBQcm9wZXJ0eUtleSwgdmFsdWU6IGFueSwgcmVjZWl2ZXI6IGFueSkgOiBib29sZWFuIHsgICAgICBcbiAgICBjb25zdCBleHQgPSBlbnRpdHkgYXMgRW50aXR5RXh0ZW5zaW9uIFxuICAgIGNvbnN0IG5hbWUgPSBwcm9wZXJ0eU5hbWUudG9TdHJpbmcoKVxuXG4gICAgaWYgKCAhRW50aXR5UHJveHkuaXNOb3JtYWxQcm9wZXJ0eShuYW1lKSB8fCAhZXh0Ll9fdHJhY2tpbmdfXyAgfHwgdmFsdWUgPT09IGVudGl0eVtwcm9wZXJ0eU5hbWVdICkge1xuICAgICAgZW50aXR5W3Byb3BlcnR5TmFtZV0gPSB2YWx1ZVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkIHx8IGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuIG5vdCBtb2RpZnkgcHJvcGVydHkgYWZ0ZXIgZGVsZXRlZGApXG4gICAgfVxuICAgIFxuICAgIGxldCBzY2hlbWEgPSBleHQuX19zY2hlbWFfX1xuICAgIGlmICggc2NoZW1hLmlzUmVhZG9ubHkgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHJlYWRvbmx5IG1vZGVsICcke3NjaGVtYS5tb2RlbE5hbWV9J2ApXG4gICAgfVxuXG4gICAgaWYgKCBzY2hlbWEucHJpbWFyeUtleSA9PT0gbmFtZSB8fCBzY2hlbWEuY29tcG9zaXRlS2V5cy5pbmRleE9mKG5hbWUpID49IDAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbiBub3QgbW9kaWZ5IHByaW1hcnkgZmllbGQgcHJvcGVydHlgKVxuICAgIH1cblxuICAgIGlmICggZXh0Ll9fZGV0YWNoZWRfXyApIHtcbiAgICAgICggZXh0Ll9fdHJhY2tlcl9fIGFzIFByb3hpZWRFbnRpdHlUcmFja2VyKS5hdHRhY2goIHJlY2VpdmVyIGFzIFByb3hpZWQ8YW55PiApXG4gICAgICBleHQuX19kZXRhY2hlZF9fID0gZmFsc2VcbiAgICB9XG4gICAgXG4gICAgaWYgKCBleHQuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50ICkge1xuICAgICAgZXh0Ll92ZXJzaW9uXyArK1xuICAgICAgZXh0Ll9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLk1vZGlmaWVkXG4gICAgICBleHQuX190bXBDaGFuZ2VzX18gPSB7ICAgICAgICBcbiAgICAgICAgdHlwZSA6IEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5LCAgICAgICAgXG4gICAgICAgIGRiVmVyc2lvbjogZXh0Ll92ZXJzaW9uXyxcbiAgICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBuZXcgQXJyYXk8UHJvcGVydHlDaGFuZ2U+KHsgXG4gICAgICAgICAgbmFtZTogJ192ZXJzaW9uXycsIG9yaWdpbmFsOiBleHQuX3ZlcnNpb25fIC0gMSwgY3VycmVudDogZXh0Ll92ZXJzaW9uXyBcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIGV4dC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk1vZGlmaWVkICkge1xuICAgICAgZXh0Ll9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5wdXNoKHsgbmFtZTogbmFtZSwgb3JpZ2luYWw6IGV4dFtuYW1lXSwgY3VycmVudDogdmFsdWUgfSlcbiAgICB9XG5cbiAgICBlbnRpdHlbcHJvcGVydHlOYW1lXSA9IHZhbHVlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgaXNEaXJ0eSggZW50aXR5OiBFbnRpdHkgKSA6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHN0YXRlID0gRW50aXR5UHJveHkuY29udmVydFRvUHJveGllZChlbnRpdHkpLl9fc3RhdGVfX1xuICAgIHJldHVybiAhICggc3RhdGUgPT09IEVudGl0eVN0YXRlLlBlcnNpc3RlbnQgfHwgc3RhdGUgPT09IEVudGl0eVN0YXRlLlRyYW5zaWVudCApXG4gICB9XG5cbiAgLyoqXG4gICAqIE1ha2UgZW50aXR5IHdyYXBwZWQgYnkgcHJveHkgc28gdGhhdCBzdGF0ZSBjaGFuZ2VzIGNhbiBiZSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkXG4gICAqIEBwYXJhbSBlbnRpdHkgRW50aXR5IGNyZWF0ZSBtYW51YWxcbiAgICogQHBhcmFtIG1vZGVsIE1vZGVsIE5hbWVcbiAgICovXG4gIHB1YmxpYyBwcm94eU5ldzxURW50aXR5PiggZW50aXR5OiBURW50aXR5LCBzY2hlbWE6IE1vZGVsU2NoZW1hICk6IFByb3hpZWQ8VEVudGl0eT4ge1xuICAgIGxldCBleHRlbmRlZCA9IHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyggZW50aXR5LCBzY2hlbWEsICBFbnRpdHlTdGF0ZS5OZXcgKVxuICAgIHJldHVybiBuZXcgUHJveHkoZXh0ZW5kZWQsIHsgc2V0IDogdGhpcy5vblByb3BlcnR5U2V0IH0pIGFzIFByb3hpZWQ8VEVudGl0eT5cbiAgfVxuXG4gIC8qKlxuICAgKiBNYWtlIGVudGl0eSB3cmFwcGVkIGJ5IHByb3h5IHNvIHRoYXQgc3RhdGUgY2hhbmdlcyBjYW4gYmUgZGV0ZWN0ZWRcbiAgICogQHBhcmFtIGVudGl0eSBFbnRpdHkgbG9hZGVkIGZyb20gZGF0YWJhc2UuIEFUVEVOU1RJT046IGVuc3VyZSB0aGF0IGhhcyBwcm9wZXJ0eSAnX3ZlcnNpb25fJ1xuICAgKiBAcGFyYW0gbW9kZWwgTW9kZWwgTmFtZVxuICAgKi9cbiAgcHVibGljIHByb3h5UGVyc2lzdGVudDxURW50aXR5PiggZW50aXR5OiBFbnRpdHksIHNjaGVtYTogTW9kZWxTY2hlbWEgKTogUHJveGllZDxURW50aXR5PiB7XG4gICAgbGV0IGV4dGVuZGVkID0gIHRoaXMuYXR0YWNoRXh0ZW5kUHJvcGVydGllcyhlbnRpdHksIHNjaGVtYSwgRW50aXR5U3RhdGUuUGVyc2lzdGVudCApXG4gICAgcmV0dXJuIG5ldyBQcm94eShleHRlbmRlZCwgeyBzZXQgOiB0aGlzLm9uUHJvcGVydHlTZXQgfSkgYXMgUHJveGllZDxURW50aXR5PlxuICB9XG59XG5cbiIsImltcG9ydCB7IExvZ2dlciwgTG9nTWFuYWdlciB9IGZyb20gJy4uL0xvZydcbmltcG9ydCB7IEVudGl0eUNhY2hlIH0gZnJvbSAnLi4vRW50aXR5Q2FjaGUnO1xuaW1wb3J0IHsgTW9kZWxTY2hlbWEsIENvbXBvc2l0ZUtleSB9IGZyb20gJy4uL01vZGVsJztcbmltcG9ydCB7IEVudGl0eSwgRW50aXR5S2V5LCBtYWtlSnNvbk9iamVjdCwgTWF5YmVVbmRlZmluZWQgfSBmcm9tICcuLi9Db21tb24nO1xuaW1wb3J0IHsgRW50aXR5Q2hhbmdlcywgRW50aXR5UHJveHksIFByb3BlcnR5Q2hhbmdlLCBQcm94aWVkLCBFbnRpdHlTdGF0ZSwgRW50aXR5Q2hhbmdlVHlwZSB9IGZyb20gJy4vRW50aXR5UHJveHknXG5pbXBvcnQgeyBTcWxBbmRQYXJhbWV0ZXJzLCBTcWxCdWlsZGVyIH0gZnJvbSAnLi4vU1FMREIvU3FsQnVpbGRlcidcbmltcG9ydCB7IGlzTnVtYmVyLCBpc1N0cmluZyB9IGZyb20gJ3V0aWwnO1xuXG5leHBvcnQgdHlwZSBFbnRpdHlUcmFja2VyQWN0aW9uID0gKG1vZGVsOiBzdHJpbmcsIGVudGl0eTogRW50aXR5LCBjaGFuZ2VzIDogRW50aXR5Q2hhbmdlcykgPT4gdm9pZFxuXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eVRyYWNrZXIge1xuICByZWFkb25seSB0cmFja2luZ0VudGl0aWVzIDogSXRlcmFibGU8RW50aXR5PlxuXG4gIGlzVHJhY2tpbmcoc2NoZW1hOiBNb2RlbFNjaGVtYSwga2V5OiBFbnRpdHlLZXkpOiBib29sZWFuXG4gIHRyYWNrTmV3KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogRW50aXR5KTogRW50aXR5XG4gIHRyYWNrUGVyc2lzdGVudChzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVxuICB0cmFja0RlbGV0ZShzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHkgOiBFbnRpdHkgKTogdm9pZFxuXG4gIHN0b3BUcmFjayhzY2hlbWE6IE1vZGVsU2NoZW1hLCBlbnRpdHk6IEVudGl0eSk6IHZvaWRcbiAgc3RvcFRyYWNrQWxsKCk6IHZvaWRcblxuICBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZFxuICByZWplY3RDaGFuZ2VzKCkgOiB2b2lkXG4gIHJvbGxiYWNrQ2hhbmdlcyhoaXN0b3J5VmVyc2lvbjogbnVtYmVyKSA6IHZvaWRcbn1cblxuLy8gZXhwb3J0IGNsYXNzIE1vZGVsQW5kS2V5IHtcbi8vICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgbW9kZWxBbmRLZXlTZXBhcmF0b3IgPSAnISMhJ1xuXG4vLyAgIHByaXZhdGUgbW9kZWxOYW1lIDogc3RyaW5nXG4vLyAgIHByaXZhdGUgZW50aXR5S2V5IDogRW50aXR5S2V5XG5cbi8vICAgcHVibGljIGNvbnN0cnVjdG9yKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSkge1xuLy8gICAgIHRoaXMubW9kZWxOYW1lID0gbW9kZWxcbi8vICAgICB0aGlzLmVudGl0eUtleSA9IGtleVxuLy8gICB9XG5cbi8vICAgcHVibGljIGdldCBtb2RlbCgpIHsgcmV0dXJuIHRoaXMubW9kZWxOYW1lIH1cbi8vICAgcHVibGljIGdldCBrZXkoKSB7IHJldHVybiB0aGlzLmVudGl0eUtleSB9XG5cbi8vICAgcHVibGljIHRvU3RyaW5nKCkge1xuLy8gICAgIHJldHVybiBcbi8vICAgfVxuLy8gfVxuZXhwb3J0IHR5cGUgTW9kZWxBbmRLZXkgPSBzdHJpbmdcblxuZXhwb3J0IHR5cGUgRW50aXR5Q2hhbmdlc0l0ZW0gPSB7IG1vZGVsQW5kS2V5IDogTW9kZWxBbmRLZXksIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9XG5cbmV4cG9ydCBjbGFzcyBQcm94aWVkRW50aXR5VHJhY2tlciBpbXBsZW1lbnRzIEVudGl0eVRyYWNrZXIgeyAgXG4gIHByaXZhdGUgbG9nIDogTG9nZ2VyXG4gIHByaXZhdGUgcHJveHkgOiBFbnRpdHlQcm94eVxuICBwcml2YXRlIGNhY2hlIDogRW50aXR5Q2FjaGVcbiAgcHJpdmF0ZSBtaW5WZXJzaW9uIDogbnVtYmVyXG4gIHByaXZhdGUgY3VycmVudFZlcnNpb24gOiBudW1iZXJcbiAgcHJpdmF0ZSBoaXN0b3J5IDogTWFwPG51bWJlciwgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj5cbiAgcHJpdmF0ZSBhbGxUcmFja2luZ0VudGl0aWVzIDogTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKGNhY2hlOiBFbnRpdHlDYWNoZSkge1xuICAgIHRoaXMubG9nID0gTG9nTWFuYWdlci5nZXRMb2dnZXIoUHJveGllZEVudGl0eVRyYWNrZXIubmFtZSlcbiAgICB0aGlzLnByb3h5ID0gbmV3IEVudGl0eVByb3h5KHRoaXMpXG4gICAgdGhpcy5jYWNoZSA9IGNhY2hlXG4gICAgdGhpcy5oaXN0b3J5ID0gbmV3IE1hcDxudW1iZXIsIE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+KClcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBQcm94aWVkPGFueT4+KClcbiAgIFxuICAgIHRoaXMubWluVmVyc2lvbiA9IC0xXG4gICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IC0xXG4gIH1cblxuICBwcm90ZWN0ZWQgZW5zdXJlTm9UcmFja2luZyggc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkgKSB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleSggc2NoZW1hLCBzY2hlbWEuZ2V0S2V5KGVudGl0eSkpO1xuICAgIGlmICggdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkpIFxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlbnRpdHkgbW9kZWw9JHtzY2hlbWEubW9kZWxOYW1lfSBrZXk9JHtzY2hlbWEuZ2V0S2V5KGVudGl0eSl9IGlzIHRyYWNraW5nYClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIG1ha2VNb2RlbEFuZEtleShzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSk6IE1vZGVsQW5kS2V5IHtcbiAgICBsZXQgbWsgPSB7IG06IHNjaGVtYS5tb2RlbE5hbWUsIGs6IGtleX1cbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIG1rIClcbiAgfVxuXG4gIHB1YmxpYyBzcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSA6IE1vZGVsQW5kS2V5ICkgOiB7IG1vZGVsOiBzdHJpbmcsIGtleTogRW50aXR5S2V5IH0ge1xuICAgIGxldCBtayA9IEpTT04ucGFyc2UoIG1vZGVsQW5kS2V5IClcbiAgICBsZXQga2V5ID0gaXNTdHJpbmcobWsuaykgfHwgaXNOdW1iZXIobWsuaykgPyBtay5rIDogbmV3IENvbXBvc2l0ZUtleShtay5rLmtleU9iamVjdClcbiAgICByZXR1cm4geyBtb2RlbCA6IG1rLm0sIGtleToga2V5IH1cbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRIaXN0b3J5QnlWZXJzaW9uKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyLCBjcmVhdGVJZk5vdEV4aXN0cyA9IGZhbHNlICk6IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4ge1xuICAgIGlmICghdGhpcy5oaXN0b3J5LmhhcyhoaXN0b3J5VmVyc2lvbikgJiYgY3JlYXRlSWZOb3RFeGlzdHMgKVxuICAgICAgdGhpcy5oaXN0b3J5LnNldChoaXN0b3J5VmVyc2lvbiwgbmV3IE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4oKSlcblxuICAgIHJldHVybiB0aGlzLmhpc3RvcnkuZ2V0KGhpc3RvcnlWZXJzaW9uKSFcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRNb2RlbEFuZEtleSggcGU6IFByb3hpZWQ8YW55PiApOiBNb2RlbEFuZEtleSB7XG4gICAgcmV0dXJuIHRoaXMubWFrZU1vZGVsQW5kS2V5KHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSlcbiAgfVxuXG4gIHByb3RlY3RlZCBzYXZlSGlzdG9yeTxURW50aXR5PiggcGU6IFByb3hpZWQ8VEVudGl0eT4sIGNoYW5nZXM6IEVudGl0eUNoYW5nZXMsIGhpc3RvcnlWZXJzaW9uOiBudW1iZXIgKSA6IHZvaWQge1xuICAgIHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbihoaXN0b3J5VmVyc2lvbiwgdHJ1ZSkuc2V0KCB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlcylcbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2hIaXN0b3J5KCBoaXN0b3J5OiBNYXA8bnVtYmVyLCBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4+ICk6IHZvaWQge1xuICAgIHRoaXMubG9nLmluZm9FbmFibGVkICYmIHRoaXMubG9nLmluZm8oYEJFR0lOIGF0dGFjaEhpc3RvcnkgaGlzdG9yeSBpbmZvID0gJHtKU09OLnN0cmluZ2lmeSh0aGlzLmhpc3RvcnlWZXJzaW9uKX1gKVxuXG4gICAgaGlzdG9yeS5mb3JFYWNoKCAoY2hhbmdlcywgdmVyc2lvbikgPT4ge1xuICAgICAgbGV0IGNoYW5nZXNNYXAgPSBuZXcgTWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPigpXG4gICAgICBjaGFuZ2VzLmZvckVhY2goIGMgPT4gY2hhbmdlc01hcC5zZXQoIGMubW9kZWxBbmRLZXksIGMuY2hhbmdlcyEgKSlcbiAgICAgIHRoaXMuaGlzdG9yeS5zZXQodmVyc2lvbiwgY2hhbmdlc01hcCApXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmxvZy5pbmZvRW5hYmxlZCkge1xuICAgICAgbGV0IGhlaWdodEluZm8gPSBuZXcgQXJyYXk8bnVtYmVyPigpXG4gICAgICBoaXN0b3J5LmZvckVhY2goIChjLCBoKSA9PiBoZWlnaHRJbmZvLnB1c2goaCkgKVxuICAgICAgdGhpcy5sb2cuaW5mbyhgU1VDQ0VTUyBhdHRhY2hIaXN0b3J5IGhlaWdodCA9ICR7SlNPTi5zdHJpbmdpZnkoaGVpZ2h0SW5mbyl9YClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0IGhpc3RvcnlWZXJzaW9uKCkgOiB7IG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciB9IHtcbiAgICByZXR1cm4geyBtaW46IHRoaXMubWluVmVyc2lvbiwgbWF4OiB0aGlzLmN1cnJlbnRWZXJzaW9uIH1cbiAgfVxuXG4gIHB1YmxpYyBhdHRhY2goIHBlOiBQcm94aWVkPGFueT4gKSA6IHZvaWQge1xuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQoIHRoaXMuZ2V0TW9kZWxBbmRLZXkocGUpLCBwZSlcbiAgfVxuICBcbiAgcHVibGljIGdldExhc3RDaGFuZ2VzKCBwZTogUHJveGllZDxhbnk+ICkgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB7XG4gICAgaWYgKCFFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCB0cnVlKVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkIDogXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZU5ld09yRGVsZXRlQ2hhbmdlcyhwZSwgcGUuX3ZlcnNpb25fLCBmYWxzZSlcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTW9kaWZpZWQgOiBcbiAgICAgICAgcmV0dXJuIHBlLl9fdG1wQ2hhbmdlc19fIVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbjogbnVtYmVyICk6IEFycmF5PE1hcDxNb2RlbEFuZEtleSwgRW50aXR5Q2hhbmdlcz4+IHtcbiAgICBjb25zdCByZXN1bHQgPSBuZXcgQXJyYXk8TWFwPE1vZGVsQW5kS2V5LCBFbnRpdHlDaGFuZ2VzPj4oKVxuICAgIGxldCB0bXBWZXJzaW9uID0gdGhpcy5jdXJyZW50VmVyc2lvblxuXG4gICAgd2hpbGUgKCB0bXBWZXJzaW9uID49IGhpc3RvcnlWZXJzaW9uICkge1xuICAgICAgbGV0IGhpc3RvcnkgPSB0aGlzLmdldEhpc3RvcnlCeVZlcnNpb24odG1wVmVyc2lvbilcbiAgICAgIGhpc3RvcnkgJiYgcmVzdWx0LnB1c2goaGlzdG9yeSkgICAgICBcbiAgICAgIHRtcFZlcnNpb24tLVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwdWJsaWMgZ2V0IHRyYWNraW5nRW50aXRpZXMoKSA6IEl0ZXJhYmxlPEVudGl0eT4ge1xuICAgIHJldHVybiB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMudmFsdWVzKClcbiAgfVxuXG4gIHB1YmxpYyBpc1RyYWNraW5nKHNjaGVtYTogTW9kZWxTY2hlbWEsIGtleTogRW50aXR5S2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5oYXMoIHRoaXMubWFrZU1vZGVsQW5kS2V5KCBzY2hlbWEsIGtleSkgKVxuICB9XG5cbiAgcHVibGljIGdldFRyYWNraW5nRW50aXR5PFRFbnRpdHk+KCBzY2hlbWE6IE1vZGVsU2NoZW1hLCBrZXk6IEVudGl0eUtleSApOiBNYXliZVVuZGVmaW5lZDxQcm94aWVkPFRFbnRpdHk+PiB7XG4gICAgY29uc3QgdHJhY2tpbmdLZXkgPSB0aGlzLm1ha2VNb2RlbEFuZEtleShzY2hlbWEsIGtleSlcbiAgICByZXR1cm4gdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmhhcyh0cmFja2luZ0tleSkgPyB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZ2V0KHRyYWNraW5nS2V5KSBhcyBQcm94aWVkPFRFbnRpdHk+IDogdW5kZWZpbmVkXG4gIH1cblxuICBwdWJsaWMgdHJhY2tOZXc8VEVudGl0eT4oc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBURW50aXR5KTogVEVudGl0eSB7IFxuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5TmV3KGVudGl0eSwgc2NoZW1hKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5zZXQodGhpcy5nZXRNb2RlbEFuZEtleShwcm94aWVkKSwgcHJveGllZClcbiAgICByZXR1cm4gcHJveGllZCBhcyBFbnRpdHkgYXMgVEVudGl0eVxuICB9XG5cbiAgcHVibGljIHRyYWNrRGVsZXRlKHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eSA6IEVudGl0eSApOiB2b2lkIHtcbiAgICBsZXQgcHJveGllZCA9IEVudGl0eVByb3h5LmNvbnZlcnRUb1Byb3hpZWQoZW50aXR5KVxuICAgIGlmICggcHJveGllZC5fX3N0YXRlX18gPT09IEVudGl0eVN0YXRlLk5ldyB8fCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuVHJhbnNpZW50ICkge1xuICAgICAgcHJveGllZC5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5UcmFuc2llbnRcbiAgICB9IFxuICAgIGVsc2UgaWYgKCBwcm94aWVkLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQgKSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICAgIC8vIFRPRE86IOWFiOS/ruaUueWGjeWIoOmZpO+8jOmcgOimgeaBouWkjeWIsOS7gOS5iOeKtuaAge+8n1xuICAgICAgcHJveGllZC5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBwcm94aWVkLl9fc3RhdGVfXyA9IEVudGl0eVN0YXRlLkRlbGV0ZWRcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdHJhY2tQZXJzaXN0ZW50PFRFbnRpdHk+KHNjaGVtYTogTW9kZWxTY2hlbWEsIGVudGl0eTogVEVudGl0eSk6IFRFbnRpdHkge1xuICAgIHRoaXMuZW5zdXJlTm9UcmFja2luZyggc2NoZW1hLCBlbnRpdHkgKVxuXG4gICAgbGV0IHByb3hpZWQgPSB0aGlzLnByb3h5LnByb3h5UGVyc2lzdGVudChlbnRpdHksIHNjaGVtYSlcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuc2V0KHRoaXMuZ2V0TW9kZWxBbmRLZXkocHJveGllZCksIHByb3hpZWQpXG4gICAgcmV0dXJuIHByb3hpZWQgYXMgRW50aXR5IGFzIFRFbnRpdHlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2soc2NoZW1hOiBNb2RlbFNjaGVtYSwgZW50aXR5OiBFbnRpdHkpOiB2b2lkIHtcbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZGVsZXRlKHRoaXMubWFrZU1vZGVsQW5kS2V5KHNjaGVtYSwgc2NoZW1hLmdldEtleShlbnRpdHkpKSlcbiAgfVxuXG4gIHB1YmxpYyBzdG9wVHJhY2tBbGwoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmNsZWFyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUcmFja2luZ0NoYW5nZXMoKSA6IEFycmF5PEVudGl0eUNoYW5nZXNJdGVtPiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTxFbnRpdHlDaGFuZ2VzSXRlbT4oKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiB7XG4gICAgICBFbnRpdHlQcm94eS5pc0RpcnR5KHBlKSAmJiBcbiAgICAgIHJlc3VsdC5wdXNoKHsgbW9kZWxBbmRLZXkgOiB0aGlzLmdldE1vZGVsQW5kS2V5KHBlKSwgY2hhbmdlczogdGhpcy5nZXRMYXN0Q2hhbmdlcyhwZSkgfSlcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHB1YmxpYyBkZXRlY3RDaGFuZ2VzKCkgOiBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PiB7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheTx7ZW50aXR5OiBQcm94aWVkPGFueT4sIGNoYW5nZXMgOiBNYXliZVVuZGVmaW5lZDxFbnRpdHlDaGFuZ2VzPiB9PigpXG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIEVudGl0eVByb3h5LmlzRGlydHkocGUpICYmIFxuICAgICAgcmVzdWx0LnB1c2goeyBlbnRpdHk6IHBlLCBjaGFuZ2VzOiB0aGlzLmdldExhc3RDaGFuZ2VzKHBlKX0pXG4gICAgfSlcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKGVudGl0eTogRW50aXR5LCBkYlZlcnNpb246IG51bWJlciwgaXNOZXcgPSB0cnVlKSA6IEVudGl0eUNoYW5nZXMge1xuICAgIGxldCBwcm9wZXJpdGVzQ2hhbmdlID0gbmV3IEFycmF5PFByb3BlcnR5Q2hhbmdlPigpXG4gICAgZm9yIChjb25zdCBrZXkgaW4gZW50aXR5KSB7XG4gICAgICBpZiAoIUVudGl0eVByb3h5LmlzTm9ybWFsUHJvcGVydHkoa2V5KSkgY29udGludWVcbiAgICAgIHByb3Blcml0ZXNDaGFuZ2UucHVzaCggaXNOZXcgPyBcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBudWxsLCBjdXJyZW50OiBlbnRpdHlba2V5XSB9IDpcbiAgICAgICAgeyBuYW1lOiBrZXksIG9yaWdpbmFsOiBlbnRpdHlba2V5XSwgY3VycmVudDogIG51bGwgfSAgICAgICBcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdHlwZSA6IGlzTmV3ID8gRW50aXR5Q2hhbmdlVHlwZS5OZXcgOiBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZSxcbiAgICAgIGRiVmVyc2lvbjogZGJWZXJzaW9uLCAgICAgIFxuICAgICAgcHJvcGVydGllc0NoYW5nZXMgOiBwcm9wZXJpdGVzQ2hhbmdlXG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIG1hcmtTdGF0ZUFuZFNhdmVIaXN0b3J5PFRFbnRpdHk+KCBwZTogUHJveGllZDxURW50aXR5PiwgaGlzdG9yeVZlcnNpb246IG51bWJlciApOiB2b2lkIHtcbiAgICBzd2l0Y2gocGUuX19zdGF0ZV9fKSB7XG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk5ldzpcbiAgICAgICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBORVcgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259IGVudGl0eSA9ICR7SlNPTi5zdHJpbmdpZnkoRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkpfWApXG4gICAgICAgIHRoaXMuc2F2ZUhpc3RvcnkocGUsIHRoaXMuY3JlYXRlTmV3T3JEZWxldGVDaGFuZ2VzKHBlLCBwZS5fdmVyc2lvbl8sIHRydWUpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5EZWxldGVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYERFTEVURSBWZXJzaW9uID0gJHtoaXN0b3J5VmVyc2lvbn0gZW50aXR5ID0gJHtKU09OLnN0cmluZ2lmeShFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKSl9YClcbiAgICAgICAgdGhpcy5zYXZlSGlzdG9yeShwZSwgdGhpcy5jcmVhdGVOZXdPckRlbGV0ZUNoYW5nZXMocGUsIHBlLl92ZXJzaW9uXywgZmFsc2UpLCBoaXN0b3J5VmVyc2lvbilcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEVudGl0eVN0YXRlLk1vZGlmaWVkOlxuICAgICAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYE1PRElGSUVEIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufSBjaGFuZ2VzID0gJHtKU09OLnN0cmluZ2lmeShwZS5fX3RtcENoYW5nZXNfXyl9YClcbiAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICB0aGlzLnNhdmVIaXN0b3J5KHBlLCBwZS5fX3RtcENoYW5nZXNfXyEsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgICBwZS5fX3RtcENoYW5nZXNfXyA9IG51bGxcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIG90aGVyd2lzZSBkbyBub3RoaW5nIFxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5UcmFuc2llbnQ6IFxuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhY2NlcHRDaGFuZ2VzKGhpc3RvcnlWZXJzaW9uOiBudW1iZXIpIDogdm9pZCB7XG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBCRUdJTiBhY2NlcHRDaGFuZ2VzIFZlcnNpb24gPSAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLmFsbFRyYWNraW5nRW50aXRpZXMuZm9yRWFjaCggcGUgPT4ge1xuICAgICAgY29uc3Qgc2NoZW1hID0gcGUuX19zY2hlbWFfX1xuICAgICAgaWYgKHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTmV3IHx8IHBlLl9fc3RhdGVfXyA9PT0gRW50aXR5U3RhdGUuTW9kaWZpZWQpIFxuICAgICAgICB0aGlzLmNhY2hlLnB1dChzY2hlbWEubW9kZWxOYW1lLCBzY2hlbWEuZ2V0S2V5KHBlKSwgRW50aXR5UHJveHkucHJveHlUb0VudGl0eShwZSkgKVxuICAgICAgZWxzZSBpZiAocGUuX19zdGF0ZV9fID09PSBFbnRpdHlTdGF0ZS5EZWxldGVkKVxuICAgICAgICB0aGlzLmNhY2hlLmV2aXQoc2NoZW1hLm1vZGVsTmFtZSwgc2NoZW1hLmdldEtleShwZSkpXG4gICAgICAvLyBlbHNlICd0cmFuc2llbnQnIHwgJ3BlcnNpc3RlbnQnIGRvIG5vdGhpbmdcbiAgICAgIHRoaXMubWFya1N0YXRlQW5kU2F2ZUhpc3RvcnkocGUsIGhpc3RvcnlWZXJzaW9uKVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiA9IGhpc3RvcnlWZXJzaW9uXG4gICAgICBwZS5fX2RldGFjaGVkX18gPSB0cnVlXG4gICAgfSkgIFxuICAgIFxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgdGhpcy5taW5WZXJzaW9uID0gdGhpcy5taW5WZXJzaW9uID09PSAtMSA/IGhpc3RvcnlWZXJzaW9uIDogdGhpcy5taW5WZXJzaW9uXG4gICAgXG4gICAgdGhpcy5sb2cudHJhY2VFbmFibGVkICYmIHRoaXMubG9nLnRyYWNlKGBTVUNDRVNTIGFjY2VwdENoYW5nZXMgVmVyc2lvbiA9ICR7aGlzdG9yeVZlcnNpb259YClcbiAgfVxuICBcbiAgcHJvdGVjdGVkIHJvbGxiYWNrQ2FjaGVDaGFuZ2VzKCBtb2RlbDogc3RyaW5nLCBrZXk6IEVudGl0eUtleSwgY2hhbmdlczogRW50aXR5Q2hhbmdlcyApOiB2b2lkIHtcbiAgICBzd2l0Y2goY2hhbmdlcy50eXBlKSB7XG4gICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTmV3IDogXG4gICAgICAgIHRoaXMuY2FjaGUuZXZpdChtb2RlbCwga2V5KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk1vZGlmeTpcbiAgICAgICAgbGV0IGUgPSB0aGlzLmNhY2hlLmdldCggbW9kZWwsIGtleSApXG4gICAgICAgIGlmICggZSA9PT0gdW5kZWZpbmVkICkgcmV0dXJuXG4gICAgICAgIGNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaCggYyA9PiBlIVtjLm5hbWVdID0gYy5vcmlnaW5hbCApXG4gICAgICAgIHRoaXMuY2FjaGUucHV0KCBtb2RlbCwga2V5LCBlIClcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgRW50aXR5Q2hhbmdlVHlwZS5EZWxldGU6IFxuICAgICAgICBjb25zdCBlbnRpdHkgPSBtYWtlSnNvbk9iamVjdCggY2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYyA9PiBjLm5hbWUsIGMgPT4gYy5vcmlnaW5hbClcbiAgICAgICAgdGhpcy5jYWNoZS5wdXQoIG1vZGVsLCBrZXksIGVudGl0eSApXG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlamVjdENoYW5nZXMoKTogdm9pZCB7XG4gICAgdGhpcy5hbGxUcmFja2luZ0VudGl0aWVzLmZvckVhY2goIHBlID0+IHtcbiAgICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5OZXc6XG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuVHJhbnNpZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZDpcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSBmYWxzZVxuICAgICAgICAgIHBlLl9fdG1wQ2hhbmdlc19fIS5wcm9wZXJ0aWVzQ2hhbmdlcy5mb3JFYWNoKCBjID0+IHBlW2MubmFtZV0gPSBjLm9yaWdpbmFsIClcbiAgICAgICAgICBwZS5fX3RyYWNraW5nX18gPSB0cnVlXG4gICAgICAgICAgcGUuX190bXBDaGFuZ2VzX18gPSBudWxsXG4gICAgICAgICAgcGUuX19zdGF0ZV9fID0gRW50aXR5U3RhdGUuUGVyc2lzdGVudFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZDpcbiAgICAgICAgICBwZS5fX3N0YXRlX18gPSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLy8gb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5QZXJzaXN0ZW50OlxuICAgICAgICBjYXNlIEVudGl0eVN0YXRlLlRyYW5zaWVudDpcbiAgICAgIH1cbiAgICB9KVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgcmVqZWN0Q2hhbmdlcyBWZXJzaW9uID0gP2ApXG4gIH1cbiAgXG4gIHB1YmxpYyByb2xsYmFja0NoYW5nZXMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICkgOiB2b2lkIHsgICAgXG4gICAgY29uc3QgZnJvbSA9IHRoaXMuY3VycmVudFZlcnNpb25cbiAgICB0aGlzLmxvZy50cmFjZUVuYWJsZWQgJiYgdGhpcy5sb2cudHJhY2UoYEJFR0lOIHJvbGxiYWNrQ2hhbmdlcyBWZXJzaW9uIDogJHtmcm9tfSAtPiAke2hpc3RvcnlWZXJzaW9ufWApXG5cbiAgICB0aGlzLnJlamVjdENoYW5nZXMoKVxuICAgIHdoaWxlKCBoaXN0b3J5VmVyc2lvbiA8PSB0aGlzLmN1cnJlbnRWZXJzaW9uICkge1xuICAgICAgY29uc3QgY2hhbmdlc01hcCA9IHRoaXMuZ2V0SGlzdG9yeUJ5VmVyc2lvbih0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgICAgY2hhbmdlc01hcCAmJiBjaGFuZ2VzTWFwLmZvckVhY2goICggY2hhbmdlcywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGNvbnN0IG1rID0gdGhpcy5zcGxpdE1vZGVsQW5kS2V5KCBtb2RlbEFuZEtleSApIFxuICAgICAgICB0aGlzLnJvbGxiYWNrQ2FjaGVDaGFuZ2VzKG1rLm1vZGVsLCBtay5rZXksIGNoYW5nZXMpXG4gICAgICB9KVxuICAgICAgdGhpcy5jdXJyZW50VmVyc2lvbiAtLVxuICAgIH1cblxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5mb3JFYWNoKCBwZSA9PiBwZS5fX2RldGFjaGVkX18gPSB0cnVlKVxuICAgIHRoaXMuYWxsVHJhY2tpbmdFbnRpdGllcy5jbGVhcigpXG4gICAgXG4gICAgdGhpcy5taW5WZXJzaW9uID0gTWF0aC5taW4odGhpcy5taW5WZXJzaW9uLCB0aGlzLmN1cnJlbnRWZXJzaW9uKVxuICAgIHRoaXMubG9nLnRyYWNlRW5hYmxlZCAmJiB0aGlzLmxvZy50cmFjZShgU1VDQ0VTUyByb2xsYmFja0NoYW5nZXMgVmVyc2lvbiA6ICR7ZnJvbX0gLT4gJHt0aGlzLmN1cnJlbnRWZXJzaW9ufWApXG4gIH1cblxuICBwdWJsaWMgY2xlYXJIaXN0b3J5KCBoaXN0b3J5VmVyc2lvbiA6IG51bWJlciApIHtcbiAgICBpZiAoIHRoaXMubWluVmVyc2lvbiA+PSBoaXN0b3J5VmVyc2lvbiB8fCB0aGlzLmN1cnJlbnRWZXJzaW9uIDwgaGlzdG9yeVZlcnNpb24gKSByZXR1cm5cbiAgICBmb3IoIGxldCB2ZXIgPSB0aGlzLm1pblZlcnNpb247IHZlciA8IGhpc3RvcnlWZXJzaW9uOyB2ZXIrKyApIHtcbiAgICAgIHRoaXMuaGlzdG9yeS5kZWxldGUodmVyKVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZHVtcENoYW5nZXMoIGVjOiBFbnRpdHlDaGFuZ2VzICk6IHN0cmluZyB7XG4gICAgbGV0IHByb3BlcnR5Q2hhbmdlcyA9ICcnXG4gICAgZWMucHJvcGVydGllc0NoYW5nZXMuZm9yRWFjaChwYyA9PiBwcm9wZXJ0eUNoYW5nZXMgKz0gYCR7cGMubmFtZX06ICR7cGMub3JpZ2luYWx9IC0+ICR7cGMuY3VycmVudH0sIGApXG5cbiAgICByZXR1cm4gYGRiVmVyc2lvbj0ke2VjLmRiVmVyc2lvbn0sIHR5cGU9JHtlYy50eXBlfSwgWyR7cHJvcGVydHlDaGFuZ2VzfV1gXG4gIH1cblxuICBwdWJsaWMgZHVtcEhpc3RvcnkoKSA6IHN0cmluZyB7XG4gICAgbGV0IHZlcnNpb24gPSB0aGlzLmN1cnJlbnRWZXJzaW9uXG4gICAgbGV0IHJlc3VsdCA9IGAtLS0tLS0tLS0tLS0tLSAgRFVNUCBISVNUT1JZICAtLS0tLS0tLS0tLS0tLS0tXFxuXFxuYCBcbiAgICB3aGlsZSggdmVyc2lvbiA+PSB0aGlzLm1pblZlcnNpb24gKSB7XG4gICAgICByZXN1bHQgKz0gYC0tLS0tLS0tLS0tLS0tdmVyc2lvbiAke3ZlcnNpb259LS0tLS0tLS0tLS0tLS0tLVxcbmAgXG4gICAgICBsZXQgaGlzID0gdGhpcy5nZXRIaXN0b3J5QnlWZXJzaW9uKCB2ZXJzaW9uIClcbiAgICAgIGhpcyAmJiBoaXMuZm9yRWFjaCggKCBlYywgbW9kZWxBbmRLZXkgKSA9PiB7XG4gICAgICAgIGxldCBjaGFuZ2VzID0gdGhpcy5kdW1wQ2hhbmdlcyggZWMgKVxuICAgICAgICBjb25zdCBtayA9IHRoaXMuc3BsaXRNb2RlbEFuZEtleSggbW9kZWxBbmRLZXkgKVxuICAgICAgICBjb25zdCBtc2cgPSBgdHlwZT0ke21rLm1vZGVsfSwga2V5PSR7bWsua2V5fSwgY2hhbmdlcz17JHtjaGFuZ2VzfX0gXFxuYFxuICAgICAgICByZXN1bHQgKz0gbXNnXG4gICAgICB9KVxuICAgICAgcmVzdWx0ICs9ICdcXG4nXG4gICAgICB2ZXJzaW9uLS1cbiAgICB9ICAgIFxuICAgIHJlc3VsdCArPSBgLS0tLS0tLS0tLS0tLS0gICBFTkQgICBEVU1QICAtLS0tLS0tLS0tLS0tLS0tXFxuYCBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYWNrZXJTcWxCdWlsZGVyIHtcbiAgcHJpdmF0ZSB0cmFja2VyOiBQcm94aWVkRW50aXR5VHJhY2tlclxuICBwcml2YXRlIG1vZGVsczogTWFwPHN0cmluZywgTW9kZWxTY2hlbWE+XG4gIHByaXZhdGUgc3FsQnVpbGRlcjogU3FsQnVpbGRlclxuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvciggdHJhY2tlciA6IFByb3hpZWRFbnRpdHlUcmFja2VyLCBtb2RlbHMgOiBNYXA8c3RyaW5nLCBNb2RlbFNjaGVtYT4sIHNxbEJ1aWxkZXI6IFNxbEJ1aWxkZXIgKSB7XG4gICAgdGhpcy50cmFja2VyID0gdHJhY2tlclxuICAgIHRoaXMubW9kZWxzID0gbW9kZWxzXG4gICAgdGhpcy5zcWxCdWlsZGVyID0gc3FsQnVpbGRlclxuICB9XG4gIFxuICBwdWJsaWMgZ2V0IGVudGl0eVRyYWNrZXIoKSB7IHJldHVybiB0aGlzLnRyYWNrZXIgfVxuXG4gIHB1YmxpYyBidWlsZENoYW5nZVNxbHMoKSA6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZGV0ZWN0Q2hhbmdlcygpLmZvckVhY2goIGVjID0+IHtcbiAgICAgIHJlc3VsdC5wdXNoKCB0aGlzLmJ1aWxkU3FsQW5kUGFyYW1ldGVycyhlYy5lbnRpdHkpIClcbiAgICB9KVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIHByb3RlY3RlZCBidWlsZFNxbEFuZFBhcmFtZXRlcnMocGUgOlByb3hpZWQ8YW55PikgOiBTcWxBbmRQYXJhbWV0ZXJzIHtcbiAgICBjb25zdCBlbnRpdHkgPSBFbnRpdHlQcm94eS5wcm94eVRvRW50aXR5KHBlKVxuICAgIFxuICAgIHN3aXRjaChwZS5fX3N0YXRlX18pIHtcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuTmV3IDpcbiAgICAgICAgcmV0dXJuIHRoaXMuc3FsQnVpbGRlci5idWlsZEluc2VydCggcGUuX19zY2hlbWFfXywgZW50aXR5KVxuICAgICAgY2FzZSBFbnRpdHlTdGF0ZS5Nb2RpZmllZCA6XG4gICAgICAgIGxldCBlbnRpdHlDaGFuZ2VzID0gdGhpcy50cmFja2VyLmdldExhc3RDaGFuZ2VzKHBlKSFcbiAgICAgICAgbGV0IGNoYW5nZXMgPSBtYWtlSnNvbk9iamVjdCggZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcyAsIGM9PiBjLm5hbWUsIGM9PiBjLmN1cnJlbnQgKVxuICAgICAgICByZXR1cm4gdGhpcy5zcWxCdWlsZGVyLmJ1aWxkVXBkYXRlKHBlLl9fc2NoZW1hX18sIHBlLl9fc2NoZW1hX18uZ2V0S2V5KHBlKSwgY2hhbmdlcywgZW50aXR5Q2hhbmdlcy5kYlZlcnNpb24gLSAxIClcbiAgICAgIGNhc2UgRW50aXR5U3RhdGUuRGVsZXRlZCA6XG4gICAgICAgIHJldHVybiB0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUocGUuX19zY2hlbWFfXywgcGUuX19zY2hlbWFfXy5nZXRLZXkocGUpKVxuICAgICAgZGVmYXVsdCA6IFxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZW50aXR5IHN0YXRlICcke3BlLl9fc3RhdGVfX30nYClcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYnVpbGRSb2xsYmFja0NoYW5nZVNxbHMoIGhpc3RvcnlWZXJzaW9uIDogbnVtYmVyICk6IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+IHtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IEFycmF5PFNxbEFuZFBhcmFtZXRlcnM+KClcbiAgICB0aGlzLnRyYWNrZXIuZ2V0Q2hhbmdlc1VudGlsKCBoaXN0b3J5VmVyc2lvbiApLmZvckVhY2goIGhpcyA9PiBoaXMuZm9yRWFjaCggKCBlbnRpdHlDaGFuZ2VzLCBtb2RlbEFuZEtleSApID0+IHtcbiAgICAgIGNvbnN0IG1rID0gdGhpcy50cmFja2VyLnNwbGl0TW9kZWxBbmRLZXkoIG1vZGVsQW5kS2V5IClcbiAgICAgIGNvbnN0IHNjaGVtYSA9IHRoaXMubW9kZWxzLmdldChtay5tb2RlbClcbiAgICAgIHN3aXRjaChlbnRpdHlDaGFuZ2VzLnR5cGUpIHtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLk5ldzpcbiAgICAgICAgICByZXN1bHQucHVzaCh0aGlzLnNxbEJ1aWxkZXIuYnVpbGREZWxldGUoc2NoZW1hISwgbWsua2V5KSlcbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIEVudGl0eUNoYW5nZVR5cGUuTW9kaWZ5OiBcbiAgICAgICAgICBsZXQgY2hhbmdlcyA9IG1ha2VKc29uT2JqZWN0KGVudGl0eUNoYW5nZXMucHJvcGVydGllc0NoYW5nZXMsIGM9PiBjLm5hbWUsIGM9PiBjLm9yaWdpbmFsKVxuICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuc3FsQnVpbGRlci5idWlsZFVwZGF0ZShzY2hlbWEhLCBtay5rZXksIGNoYW5nZXMsIGVudGl0eUNoYW5nZXMuZGJWZXJzaW9uICkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSBFbnRpdHlDaGFuZ2VUeXBlLkRlbGV0ZTpcbiAgICAgICAgICBsZXQgZW50aXR5ID0gbWFrZUpzb25PYmplY3QoZW50aXR5Q2hhbmdlcy5wcm9wZXJ0aWVzQ2hhbmdlcywgYz0+IGMubmFtZSwgYz0+IGMub3JpZ2luYWwpXG4gICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5zcWxCdWlsZGVyLmJ1aWxkSW5zZXJ0KHNjaGVtYSEsIGVudGl0eSkpXG4gICAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9KSlcbiAgICBcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxufVxuXG5cblxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiZXR0ZXItc3FsaXRlM1wiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJjaGFuZ2UtY2FzZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJldmVudHNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbi1zcWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWxcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwibGV2ZWwtc2Vjb25kYXJ5XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxldmVsLXN1YmxldmVsXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImxydS1jYWNoZVwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJ1dGlsXCIpOyJdLCJzb3VyY2VSb290IjoiIn0=