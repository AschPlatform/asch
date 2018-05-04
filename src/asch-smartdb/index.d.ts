export namespace AschCore
{
	//declarations/Block.d.ts
	/// <reference types="node" />
	export interface BlockHeader extends Entity {
	    height: number;
	    id?: string;
	    timestamp?: number;
	    payloadLength?: number;
	    payloadHash?: string;
	    prevBlockId?: string;
	    pointId?: string;
	    pointHeight?: number;
	    delegate?: string;
	    signature?: string;
	    count?: number;
	}
	export type BigNumber = number;
	export interface Transaction extends Entity {
	    id: string;
	    blockId: string;
	    type: number;
	    timestamp: number;
	    senderPublicKey: Buffer;
	    senderId: string;
	    recipientId: string;
	    amount: BigNumber;
	    fee: BigNumber;
	    signature?: Buffer;
	    signSignature?: Buffer;
	    signatures?: string;
	    args?: string;
	    message?: string;
	}
	export interface Block extends BlockHeader {
	    transactions?: Array<Transaction>;
	}

	//declarations/BlockCache.d.ts
	export class BlockCache {
	    constructor(maxCachedCount: number);
	    isCached(height: number): boolean;
	    readonly cachedHeightRange: {
	        min: number;
	        max: number;
	    };
	    put(block: Block): void;
	    get(height: number): MaybeUndefined<Block>;
	    getById(id: string): MaybeUndefined<Block>;
	    evit(fromHeight: number, toHeight: number): void;
	}

	//declarations/Common.d.ts
	export interface ObjectLiteral {
	    [key: string]: any;
	}
	export type JsonObject = ObjectLiteral;
	export type Entity = ObjectLiteral;
	export interface KeyObject {
	    key: string;
	    keyJson: JsonObject;
	}
	export type EntityKey = string | number | KeyObject;
	export type Partial<T> = {
	    [P in keyof T]?: T[P];
	};
	export type ReadonlyPartial<T> = {
	    readonly [P in keyof T]: T[P];
	};
	export type FilterFunction<T> = (e: T) => boolean;
	export type KeyValuePair = {
	    key: string;
	    value: any;
	};
	export type Callback<TResult> = (err: Error | null, data: TResult) => void;
	export function makeJsonObject<T>(iterable: Iterable<T>, getKey: (t: T) => string, getValue: (t: T) => any): JsonObject;
	export function deepCopy<T>(src: T): T;
	export function partial<T>(src: T, ...keys: Array<string>): Partial<T>;
	export function isPrimitiveKey(key: any): boolean;
	export class CodeContractError extends Error {
	    constructor(message: string);
	}
	export type ContractCondition = boolean | (() => boolean);
	export type ContractMessage = string | (() => string);
	export type MaybeUndefined<T> = T | undefined;
	export type Nullable<T> = T | null | undefined;
	export type ContractVerifyResult = {
	    result: boolean;
	    message: Nullable<string>;
	};
	export type VerifyFunction = () => ContractVerifyResult;
	export class CodeContract {
	    static verify(condition: ContractCondition, message: ContractMessage): void;
	    static argument(argName: string, verify: VerifyFunction | ContractCondition, message?: ContractMessage): void;
	    static notNull(arg: any): ContractVerifyResult;
	    static notNullOrEmpty(str: Nullable<string>): ContractVerifyResult;
	    static notNullOrWhitespace(str: Nullable<string>): ContractVerifyResult;
	}

	//declarations/DbSession.d.ts
	export type SaveHistoryAction = (version: number, history: Map<string, EntityChanges>) => void;
	export class DbSession {
	    constructor(connection: DbConnection, cacheOptions?: EntityCacheOptions, sessionName?: string);
	    readonly isOpen: boolean;
	    readonly entityCache: EntityCache;
	    syncSchema(schema: ModelSchema): Promise<void>;
	    registerSchema(...schemas: Array<ModelSchema>): void;
	    close(): Promise<void>;
	    attachHistory(history: Map<number, Array<EntityChangesItem>>): void;
	    getAllCached<TEntity>(model: ModelNameOrType<TEntity>, filter?: FilterFunction<TEntity>, track?: boolean): Array<TEntity>;
	    attach<TEntity>(schema: ModelSchema, key: EntityKey): MaybeUndefined<TEntity>;
	    getAll<TEntity>(model: ModelNameOrType<TEntity>, track?: boolean): Promise<Array<TEntity>>;
	    getMany<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition, track?: boolean, cache?: boolean): Promise<Array<TEntity>>;
	    query<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, fields?: Array<string>, join?: JsonObject): Promise<Array<TEntity>>;
	    queryByJson<TEntity>(model: ModelNameOrType<TEntity>, params: JsonObject): Promise<Array<TEntity>>;
	    exists<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition): Promise<boolean>;
	    count<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition): Promise<number>;
	    create<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey, entity?: TEntity): TEntity;
	    load<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey): Promise<MaybeUndefined<TEntity>>;
	    getChanges(): Array<EntityChangesItem>;
	    loadCached<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey, track?: boolean): MaybeUndefined<TEntity>;
	    /**
	     * Save changes to database
	     * @returns serial number for saveChanges
	     */
	    saveChanges(serial?: number): Promise<number>;
	    /**
	     * Rollback saved changes
	     * @param changesNO ,this value should be returned by @see saveChanges()
	     */
	    rollbackChanges(serial: number): Promise<number>;
	    clearHistoryBefore(serial: number): void;
	    readonly historyVersion: {
	        min: number;
	        max: number;
	    };
	    update<TEntity>(entity: TEntity): void;
	    delete<TEntity>(entity: TEntity): void;
	    beginTransaction(): Promise<DBTransaction>;
	}

	//declarations/EntityCache.d.ts
	/**
	 * cache options
	 */
	export type EntityCacheOptions = {
	    default: number;
	    [model: string]: number | ((model: string) => number);
	};
	export interface EntityCache {
	    models: Array<string>;
	    clear(modelName?: string): void;
	    get<TEntity>(modelName: string, key: EntityKey): MaybeUndefined<TEntity>;
	    getAll<TEntity>(modelName: string, filter?: FilterFunction<TEntity>): MaybeUndefined<Array<TEntity>>;
	    put(modelName: string, key: EntityKey, entity: Entity): void;
	    evit(modelName: string, key: EntityKey): void;
	    exists(modelName: string, key: EntityKey): boolean;
	    existsModel(modelName: string): boolean;
	}
	export class LRUEntityCache implements EntityCache {
	    constructor(options?: EntityCacheOptions);
	    clear(modelName?: string): void;
	    readonly models: string[];
	    get<TEntity>(modelName: string, key: EntityKey): MaybeUndefined<TEntity>;
	    getAll<TEntity>(modelName: string, filter?: FilterFunction<TEntity>): MaybeUndefined<Array<TEntity>>;
	    put(modelName: string, key: EntityKey, entity: Entity): void;
	    evit(modelName: string, key: EntityKey): void;
	    exists(modelName: string, key: EntityKey): boolean;
	    existsModel(modelName: string): boolean;
	    dumpCache(): string;
	}

	//declarations/LevelBlock.d.ts
	export class LevelBlock {
	    constructor(dir: string, levelOptions?: {});
	    open(): Promise<void>;
	    close(): Promise<void>;
	    readonly lastBlockHeight: number;
	    appendBlock(block: BlockHeader, changes: Array<EntityChangesItem>): Promise<void>;
	    getBlock(height: number): Promise<MaybeUndefined<BlockHeader>>;
	    getHistoryChanges(minHeight: number, maxHeight: number): Promise<Map<number, Array<EntityChangesItem>>>;
	    deleteLastBlock(height: number): Promise<void>;
	    getBlockById(blockId: string): Promise<MaybeUndefined<BlockHeader>>;
	    getBlocksByHeightRange(minHeight: number, maxHeight: number): Promise<Array<BlockHeader>>;
	    getBlocksByIds(blockIds: Array<string>): Promise<Array<BlockHeader>>;
	}

	//declarations/Log.d.ts
	export enum LogLevel {
	    All = 127,
	    Trace = 64,
	    Debug = 32,
	    Log = 16,
	    Info = 8,
	    Warn = 4,
	    Error = 2,
	    Fatal = 1,
	    None = 0,
	}
	export interface Logger {
	    logLevel: LogLevel;
	    readonly infoEnabled: boolean;
	    readonly traceEnabled: boolean;
	    readonly logEnabled: boolean;
	    readonly debugEnabled: boolean;
	    readonly warnEnabled: boolean;
	    readonly errorEnaled: boolean;
	    readonly fatalEnabled: boolean;
	    trace(msg: string, ...params: any[]): void;
	    debug(msg: string, ...params: any[]): void;
	    log(msg: string, ...params: any[]): void;
	    info(msg: string, ...params: any[]): void;
	    warn(msg: string, ...params: any[]): void;
	    error(msg: string, err: Error): void;
	    fatal(msg: string, err: Error): void;
	}
	export class LogManager {
	    static defaultLevel: LogLevel;
	    static logFactory: () => Logger;
	    static getLogger(loggerName?: string, level?: LogLevel): Logger;
	}

	//declarations/Model.d.ts
	export type Constructor<T> = {
	    new (): T;
	};
	export type ModelNameOrType<TEntity> = string | Constructor<TEntity>;
	export enum FieldTypes {
	    String = "String",
	    Number = "Number",
	    BigInt = "BigInt",
	    Text = "Text",
	}
	export type FieldType = string | FieldTypes;
	export interface Field {
	    name: string;
	    type: FieldType;
	    length?: number;
	    index?: boolean;
	    not_null?: boolean;
	    primary_key?: boolean;
	    composite_key?: boolean;
	    default?: number | string | null;
	}
	export interface Schema {
	    table?: string;
	    memory?: boolean;
	    readonly?: boolean;
	    local?: boolean;
	    tableFields: Array<Field>;
	}
	export class CompositeKey implements KeyObject {
	    constructor(keyObject: JsonObject);
	    static make<TEntity>(schema: ModelSchema, entity: TEntity): CompositeKey;
	    static fromString(keyJsonString: string): CompositeKey;
	    readonly keyJson: JsonObject;
	    readonly key: string;
	    toString(): string;
	}
	export function isCompositeKey(key: any): boolean;
	export class ModelSchema {
	    constructor(schema: Schema, name: string);
	    getFieldTypes(schema: Schema): Map<string, string>;
	    readonly schemaObject: Schema;
	    readonly isCompsiteKey: boolean;
	    readonly primaryKey: MaybeUndefined<string>;
	    readonly compositeKeys: string[];
	    readonly fieldNames: Array<string>;
	    readonly indexes: Array<string>;
	    readonly modelName: string;
	    readonly isLocal: boolean;
	    readonly isReadonly: boolean;
	    readonly memCached: boolean;
	    setKey<TEntity>(entity: TEntity, key: EntityKey): TEntity;
	    getKey<TEntity>(entity: TEntity): EntityKey;
	    newEntity<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey): TEntity;
	    copyProperties<TEntity>(dest: TEntity, src: TEntity, includeKey?: boolean): void;
	}

	//declarations/SmartDB.d.ts
	/// <reference types="node" />
	import { EventEmitter } from 'events';
	export type SmartDBOptions = {
	    /**
	     * cached history count(block count), used to rollback block
	     * @default 10
	     */
	    historyForRollback?: number;
	    /**
	     * clean persisted history automatically
	     * @default false
	     */
	    autoCleanPersistedHistory?: boolean;
	    /**
	     * cached last block count
	     * @default 10
	     */
	    cachedBlockCount?: number;
	    /**
	     * max cached entity count, config it per model, LRU
	     * sample: { User: 200, Trans: 5000 } max cached 200s User ，5000 for Trans
	     * @default 5000 each model
	     */
	    entityCacheOptions?: EntityCacheOptions;
	};
	/**
	 * ORM like to operate blockchain data
	 * @event ready emmit after initialized
	 * @event close emmit after closed
	 */
	export class SmartDB extends EventEmitter {
	    /**
	     * Constructor
	     * NOTIC : you need call init before use SmartDB
	     * @param dbPath path of blockchain db
	     * @param levelBlockDir path of block header db
	     * @param options of SmartDB
	     */
	    constructor(dbPath: string, levelBlockDir: string, options?: SmartDBOptions);
	    /**
	     * initialize SmartDB , you need call this before use SmartDB
	     * @param schemas table schemas in Database
	     */
	    init(schemas: Array<ModelSchema>): Promise<void>;
	    /**
	     * free resources
	     */
	    close(): Promise<void>;
	    /**
	     * height of last block
	     */
	    readonly lastBlockHeight: number;
	    /**
	     * blocks count
	     */
	    readonly blocksCount: number;
	    /**
	     * begin a new block
	     * @param blockHeader
	     */
	    beginBlock(block: Block): void;
	    /**
	     * commit block changes
	     */
	    commitBlock(): Promise<number>;
	    /**
	     * rollback block changes
	     * @param height rollback to height(exclude)
	     */
	    rollbackBlock(height?: number): Promise<void>;
	    /**
	     * save local tables (not in block --- which define in schema by local : true) changes to database
	     * @returns serial number for changes
	     */
	    saveLocalChanges(): Promise<number>;
	    /**
	     * rollback local tables changes saveLocalChanges
	     * @param serial serial number return from saveLocalChanges
	     */
	    rollbackLocalChanges(serial: number): Promise<void>;
	    /**
	     * get entity key
	     * @param model model modelName or model type
	     * @param entity entity
	     */
	    getEntityKey<TEntity>(model: ModelNameOrType<TEntity>, entity: TEntity): MaybeUndefined<EntityKey>;
	    /**
	     * get tracking entity by key
	     * @param model model modelName or model type
	     * @param key entity key
	     * @returns tracked entity or undefined
	     */
	    attach<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey): MaybeUndefined<TEntity>;
	    /**
	     * create a new entity which change will be tracked and persistented (by saveChanges) automatically
	     * @param model modelName or model type
	     * @param key entity key which uniqued in database
	     * @param entity prototype entity which properties will copy to result entity
	     * @returns tracking entity
	     */
	    create<TEntity>(model: ModelNameOrType<TEntity>, keyOrEntity: EntityKey | TEntity): TEntity;
	    /**
	     * update a entity
	     * @param model modelName or model type
	     * @param entity
	     */
	    /**
	     * delete a entity
	     * @param model modelName or model type
	     * @param entity
	     */
	    delete<TEntity>(model: ModelNameOrType<TEntity>, entity: TEntity): void;
	    /**
	     * load entity from cache and database
	     * @param model model name or model type
	     * @param key key of entity
	     */
	    get<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey): Promise<MaybeUndefined<TEntity>>;
	    /**
	     * load entity from database by condition
	     * @param model model name or model type
	     * @param condition see type SqlCondition
	     */
	    getBy<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition): Promise<MaybeUndefined<TEntity>>;
	    /**
	   * get entities from database
	   * @param model model name or model type
	   * @param condition find condition, see type SqlCondition
	   * @param track track and cache result if true
	   */
	    getMany<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition, track?: boolean): Promise<Array<TEntity>>;
	    /**
	     * load entity from cache only
	     * @param model model name or model type
	     * @param key key of entity
	     * @param track track result
	     * @returns tracked entity from cache
	     */
	    getCached<TEntity>(model: ModelNameOrType<TEntity>, key: EntityKey, track?: boolean): MaybeUndefined<TEntity>;
	    /**
	     * get all cached entities
	     * @param model model name or model type
	     * @param track track result
	     */
	    getAllCached<TEntity>(model: ModelNameOrType<TEntity>, filter?: FilterFunction<TEntity>, track?: boolean): Array<TEntity>;
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
	    find<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, fields?: Array<string>, join?: JsonObject): Promise<Array<Entity>>;
	    /**
	     * find entities from database
	     * @param model model name or model type
	     * @param params mango like query params object
	     */
	    findOne<TEntity>(model: ModelNameOrType<TEntity>, params: JsonObject): Promise<MaybeUndefined<Entity>>;
	    /**
	   * find entities from database
	   * @param model model name or model type
	   * @param params mango like query params object
	   */
	    findAll<TEntity>(model: ModelNameOrType<TEntity>, params: JsonObject): Promise<Array<Entity>>;
	    /**
	     * query if exists record by specified condition
	     * @param model model name or model type
	     * @param condition query condition, see type SqlCondition
	     */
	    exists<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition): Promise<boolean>;
	    /**
	     * count records count by specified condition
	     * @param model model name or model type
	     * @param condition query condition, see type SqlCondition
	     */
	    count<TEntity>(model: ModelNameOrType<TEntity>, condition: SqlCondition): Promise<number>;
	    /**
	     * get block header by height
	     * @param height block height
	     */
	    getBlockByHeight(height: number, withTransactions?: boolean): Promise<MaybeUndefined<Block>>;
	    /**
	     * get block header by block id
	     * @param blockId block id
	     */
	    getBlockById(blockId: string, withTransactions?: boolean): Promise<MaybeUndefined<Block>>;
	    /**
	     * get block headers by height range
	     * @param minHeight min height(included)
	     * @param maxHeight max height(included)
	     */
	    getBlocksByHeightRange(minHeight: number, maxHeight: number, withTransactions?: boolean): Promise<Array<Block>>;
	    /**
	     * get block headers by block id array
	     * @param blockIds array of block id
	     */
	    getBlocksByIds(blockIds: Array<string>, withTransactions?: boolean): Promise<Array<Block>>;
	}

	//declarations/KVDB/LevelDB.d.ts
	export type GetIndexValueFunc = (key: any, value: JsonObject) => any;
	export type IndexField = {
	    fieldName: string;
	    calcIndex?: GetIndexValueFunc;
	};
	export class SubLevelMeta {
	    subName: string;
	    keyField: string;
	    indexFields: Array<IndexField>;
	    constructor(subName: string, keyField: string, indexFields?: IndexField[]);
	    existsIndex(fieldName: string): boolean;
	    addIndex(fieldName: string, calcIndex: GetIndexValueFunc): this;
	    removeIndex(fieldName: any): this;
	}
	export interface LevelReadableStream extends ReadableStream {
	    on(eventName: string, callback: Function): LevelReadableStream;
	}
	export interface LevelGet {
	    get<T>(key: any, options?: JsonObject, getCallback?: Callback<T>): Promise<T>;
	    createReadStream(options?: JsonObject): LevelReadableStream;
	    createKeyStream(options?: JsonObject): LevelReadableStream;
	    createValueStream(options?: JsonObject): LevelReadableStream;
	}
	export interface LevelOperation {
	    put<T>(key: any, value: T, options?: JsonObject, callback?: Callback<void>): Promise<void>;
	    del(key: any, delCallback?: Callback<void>): Promise<void>;
	    batch(operArray: Array<JsonObject>, options?: JsonObject): Promise<void>;
	}
	export interface IndexedLevel extends LevelGet, LevelOperation {
	    name: string;
	    indexes: Array<IndexField>;
	    byIndex(indexField: string): LevelGet;
	    getBy(indexField: string, key: any, getCallback?: Callback<JsonObject>): Promise<JsonObject>;
	}
	export class LevelDB {
	    constructor(dbDir: string, meta: Array<SubLevelMeta>, options?: {});
	    readonly level: any;
	    getSubLevel(subName: string): IndexedLevel;
	    open(openCallback?: Callback<any>): Promise<void> | null;
	    close(closeCallback?: Callback<any>): Promise<void> | null;
	    readonly isOpen: any;
	    readonly isClosed: any;
	}

	//declarations/SQLDB/DbConnection.d.ts
	export type ConnectionOptions = {
	    [keys in 'storage' | 'userName' | 'password' | 'database']?: any;
	};
	export interface SqlExecuteResult {
	    lastInsertRowId: string;
	    rowsEffected: number;
	}
	export interface DbConnection {
	    connectionOptions: ConnectionOptions;
	    isConnected: boolean;
	    connect(): Promise<boolean>;
	    disconnect(): Promise<boolean>;
	    runScript(sql: string): Promise<void>;
	    query(sql: string, parameters?: SqlParameters): Promise<Array<any>>;
	    querySync(sql: string, parameters?: SqlParameters): Array<any>;
	    execute(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): Promise<SqlExecuteResult>;
	    executeSync(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): SqlExecuteResult;
	    executeBatchSync(sqls: Array<SqlAndParameters>): Array<SqlExecuteResult>;
	    executeBatch(sqls: Array<SqlAndParameters>): Promise<Array<SqlExecuteResult>>;
	    beginTrans(): Promise<DBTransaction>;
	}
	export interface DBTransaction {
	    commit(): Promise<void>;
	    rollback(): Promise<void>;
	}

	//declarations/SQLDB/SqlBuilder.d.ts
	export const MULTI_SQL_SEPARATOR = ";";
	export enum SqlType {
	    Schema = 0,
	    Select = 1,
	    Insert = 2,
	    Update = 3,
	    Delete = 4,
	    Other = 9,
	}
	export type SqlParameters = Array<any> | JsonObject;
	export type SqlAndParameters = {
	    type: SqlType;
	    query: string;
	    parameters?: SqlParameters;
	    expectEffected?: boolean;
	};
	export type UnaryOperators = '$null' | '$is' | '$isnot';
	export type BinaryOperators = '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte' | '$like' | '$field' | '$in' | '$nin' | '$between';
	export type RelationOperators = '$not' | '$and' | '$or';
	export type SelectExpression = {
	    select: {
	        table: string;
	        fields?: Array<string>;
	        where?: string;
	        [key: string]: any;
	    };
	};
	export type ValueExpression = string | number;
	export type FieldValueExpression = {
	    [field: string]: string | number;
	};
	export type FieldArrayValueExpression = {
	    [field: string]: Array<string | number>;
	};
	export type NullCompareExpression = {
	    $null: string;
	} | {
	    [oper in '$is' | 'isnot']?: {
	        [field: string]: null;
	    };
	};
	export type ValueCompareExpression = FieldValueExpression | {
	    [field: string]: {
	        [oper in '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte']?: ValueExpression | SelectExpression;
	    };
	};
	export type ArrayCompareExpression = FieldArrayValueExpression | {
	    [field: string]: {
	        [oper in '$between' | '$in' | '$nin']?: Array<ValueExpression> | SelectExpression;
	    };
	};
	export type LikeExpression = {
	    [key: string]: {
	        $like: string;
	    };
	};
	export type CompareExpression = ValueCompareExpression | ArrayCompareExpression | LikeExpression | NullCompareExpression;
	export type RelationExpression = Array<CompareExpression> | {
	    $not: CompareExpression | RelationExpression;
	} | {
	    [oper in '$and' | '$or']?: Array<CompareExpression> | Array<RelationExpression>;
	};
	export type SqlCondition = CompareExpression | RelationExpression;
	export type LimitAndOffset = {
	    limit?: number;
	    offset?: number;
	};
	export type SqlResultRange = number | LimitAndOffset;
	export type SqlOrderItem = {
	    [field: string]: 'ASC' | 'DESC' | 1 | -1;
	};
	export type SqlOrder = SqlOrderItem | Array<SqlOrderItem>;
	export interface SqlBuilder {
	    buildSchema(schema: ModelSchema): string;
	    buildInsert(schema: ModelSchema, fieldValues: JsonObject): SqlAndParameters;
	    buildDelete(schema: ModelSchema, key: EntityKey): SqlAndParameters;
	    buildUpdate(schema: ModelSchema, key: EntityKey, fieldValues: JsonObject, version: number): SqlAndParameters;
	    buildSelect(schema: ModelSchema, params: JsonObject): SqlAndParameters;
	    buildSelect(schema: ModelSchema, fields: Array<string>, where: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, join?: JsonObject): SqlAndParameters;
	}
	export class JsonSqlBuilder implements SqlBuilder {
	    buildSchema(schema: ModelSchema): string;
	    buildInsert(schema: ModelSchema, fieldValues: JsonObject): SqlAndParameters;
	    buildDelete(schema: ModelSchema, key: EntityKey): SqlAndParameters;
	    buildUpdate(schema: ModelSchema, key: EntityKey, fieldValues: JsonObject, version: number): SqlAndParameters;
	    buildSelect(schema: ModelSchema, fieldsOrParams: Array<string> | JsonObject, where?: SqlCondition, resultRange?: SqlResultRange, sort?: SqlOrder, join?: JsonObject): SqlAndParameters;
	}

	//declarations/SQLDB/SqliteConnection.d.ts
	export class SqliteConnection implements DbConnection {
	    constructor(options: ConnectionOptions);
	    readonly connectionOptions: ConnectionOptions;
	    readonly isConnected: boolean;
	    connect(): Promise<boolean>;
	    disconnect(): Promise<boolean>;
	    query(sql: string, parameters?: SqlParameters): Promise<Array<any>>;
	    querySync(sql: string, parameters?: SqlParameters): Array<any>;
	    executeBatchSync(sqls: Array<SqlAndParameters>): Array<SqlExecuteResult>;
	    executeBatch(sqls: Array<SqlAndParameters>): Promise<Array<SqlExecuteResult>>;
	    executeSync(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): SqlExecuteResult;
	    execute(sql: string, parameters?: SqlParameters, throwIfNoneEffected?: boolean): Promise<SqlExecuteResult>;
	    runScript(sql: string): Promise<void>;
	    beginTrans(): Promise<DBTransaction>;
	}

	//declarations/SQLDB/SqliteWrapper.d.ts
	export class SqliteWrapper {
	    constructor();
	    open(dbFilePath: string, callback?: Callback<boolean>): boolean;
	    readonly isConnected: boolean;
	    asynOpen(dbFilePath: string): Promise<boolean>;
	    close(callback?: Callback<boolean>): boolean;
	    asynClose(): Promise<boolean>;
	    execute(sql: string, parameters?: SqlParameters, callback?: Callback<SqlExecuteResult>): SqlExecuteResult;
	    query(sql: string, parameters?: SqlParameters, callback?: Callback<Array<any>>): Array<any>;
	    executeBatch(sqls: Array<SqlAndParameters>, onExecuted?: (ret: SqlExecuteResult, s: SqlAndParameters) => void, callback?: Callback<Array<SqlExecuteResult>>): Array<SqlExecuteResult>;
	    asynExecute(sql: any, parameters?: SqlParameters): Promise<SqlExecuteResult>;
	    asynQuery(sql: string, parameters?: SqlParameters): Promise<Array<any>>;
	    asyncExecuteBatch(sqls: Array<SqlAndParameters>, onExecuted?: (ret: SqlExecuteResult, s: SqlAndParameters) => void): Promise<Array<SqlExecuteResult>>;
	}

	//declarations/StateTracker/EntityProxy.d.ts
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
	export enum EntityState {
	    Transient = -1,
	    Persistent = 0,
	    New = 1,
	    Modified = 2,
	    Deleted = 3,
	}
	export enum EntityChangeType {
	    New = 1,
	    Modify = 2,
	    Delete = 3,
	}
	export interface PropertyChange {
	    name: string;
	    original: any;
	    current: any;
	}
	export interface EntityChanges {
	    dbVersion: number;
	    type: EntityChangeType;
	    propertiesChanges: Array<PropertyChange>;
	}
	export interface EntityExtension {
	    _version_: number;
	    __detached__: boolean;
	    __tracking__: boolean;
	    __schema__: ModelSchema;
	    __tracker__: EntityTracker;
	    __state__: EntityState;
	    __tmpChanges__: Nullable<EntityChanges>;
	}
	export interface Proxied<T> extends EntityExtension {
	}
	export class EntityProxy {
	    constructor(tracker: EntityTracker);
	    static isExtended(entity: Entity): boolean;
	    static isProxied(entity: Entity): boolean;
	    static convertToProxied<TEntity>(entity: Entity): Proxied<TEntity>;
	    static proxyToEntity(proxied: Proxied<Entity>): Entity;
	    static isNormalProperty(propertyName: string): boolean;
	    static isDirty(entity: Entity): boolean;
	    /**
	     * Make entity wrapped by proxy so that state changes can be detected and collected
	     * @param entity Entity create manual
	     * @param model Model Name
	     */
	    proxyNew<TEntity>(entity: TEntity, schema: ModelSchema): Proxied<TEntity>;
	    /**
	     * Make entity wrapped by proxy so that state changes can be detected
	     * @param entity Entity loaded from database. ATTENSTION: ensure that has property '_version_'
	     * @param model Model Name
	     */
	    proxyPersistent<TEntity>(entity: Entity, schema: ModelSchema): Proxied<TEntity>;
	}

	//declarations/StateTracker/EntityTracker.d.ts
	export type EntityTrackerAction = (model: string, entity: Entity, changes: EntityChanges) => void;
	export interface EntityTracker {
	    readonly trackingEntities: Iterable<Entity>;
	    isTracking(schema: ModelSchema, key: EntityKey): boolean;
	    trackNew(schema: ModelSchema, entity: Entity): Entity;
	    trackPersistent(schema: ModelSchema, entity: Entity): Entity;
	    trackDelete(schema: ModelSchema, entity: Entity): void;
	    stopTrack(schema: ModelSchema, entity: Entity): void;
	    stopTrackAll(): void;
	    acceptChanges(historyVersion: number): void;
	    rejectChanges(): void;
	    rollbackChanges(historyVersion: number): void;
	}
	export type ModelAndKey = string;
	export type EntityChangesItem = {
	    modelAndKey: ModelAndKey;
	    changes: MaybeUndefined<EntityChanges>;
	};
	export class ProxiedEntityTracker implements EntityTracker {
	    constructor(cache: EntityCache);
	    splitModelAndKey(modelAndKey: ModelAndKey): {
	        model: string;
	        key: EntityKey;
	    };
	    attachHistory(history: Map<number, Array<EntityChangesItem>>): void;
	    readonly historyVersion: {
	        min: number;
	        max: number;
	    };
	    attach(pe: Proxied<any>): void;
	    getLastChanges(pe: Proxied<any>): MaybeUndefined<EntityChanges>;
	    getChangesUntil(historyVersion: number): Array<Map<ModelAndKey, EntityChanges>>;
	    readonly trackingEntities: Iterable<Entity>;
	    isTracking(schema: ModelSchema, key: EntityKey): boolean;
	    getTrackingEntity<TEntity>(schema: ModelSchema, key: EntityKey): MaybeUndefined<Proxied<TEntity>>;
	    trackNew<TEntity>(schema: ModelSchema, entity: TEntity): TEntity;
	    trackDelete(schema: ModelSchema, entity: Entity): void;
	    trackPersistent<TEntity>(schema: ModelSchema, entity: TEntity): TEntity;
	    stopTrack(schema: ModelSchema, entity: Entity): void;
	    stopTrackAll(): void;
	    getTrackingChanges(): Array<EntityChangesItem>;
	    detectChanges(): Array<{
	        entity: Proxied<any>;
	        changes: MaybeUndefined<EntityChanges>;
	    }>;
	    acceptChanges(historyVersion: number): void;
	    rejectChanges(): void;
	    rollbackChanges(historyVersion: number): void;
	    clearHistory(historyVersion: number): void;
	    dumpHistory(): string;
	}
	export class TrackerSqlBuilder {
	    constructor(tracker: ProxiedEntityTracker, models: Map<string, ModelSchema>, sqlBuilder: SqlBuilder);
	    readonly entityTracker: ProxiedEntityTracker;
	    buildChangeSqls(): Array<SqlAndParameters>;
	    buildRollbackChangeSqls(historyVersion: number): Array<SqlAndParameters>;
	}

}