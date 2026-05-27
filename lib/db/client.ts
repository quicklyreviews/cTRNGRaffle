import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import crypto from 'crypto'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { raffles as rafflesTable, raffleWinners as raffleWinnersTable } from './schema'
import * as schema from './schema'

// Instantiate a dummy drizzle client purely to extract its perfect TypeScript typings
const dummyClient = {} as any
const originalDb = drizzle(dummyClient, { schema })

// Detect production database connection URL
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
const isProdDb = !!dbUrl;

let pgClient: any;
let prodDbInstance: any;
let schemaEnsured = false;

async function ensureSchema(client: any) {
  if (schemaEnsured) return;
  try {
    console.log('🚀 [DATABASE] Ensuring database tables exist...');
    
    // Try to create uuid-ossp extension
    try {
      await client`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    } catch (e) {
      console.log('ℹ️ [DATABASE] Skip uuid-ossp extension check (non-superuser or already present).');
    }

    // Create raffles table (commit_timestamp must be BIGINT to hold 13-digit millisecond timestamps)
    await client`
      CREATE TABLE IF NOT EXISTS raffles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        prize_description TEXT,
        winner_count INTEGER NOT NULL,
        total_entries INTEGER NOT NULL,
        merkle_root TEXT NOT NULL,
        commit_timestamp BIGINT NOT NULL,
        drawn BOOLEAN DEFAULT FALSE NOT NULL,
        seed TEXT,
        draw_algorithm TEXT DEFAULT 'cTRNG-keccak256-v1' NOT NULL,
        cosmic_proof JSONB,
        raw_entries TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;

    // Create raffle_winners table
    await client`
      CREATE TABLE IF NOT EXISTS raffle_winners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
        index INTEGER NOT NULL,
        username TEXT NOT NULL,
        merkle_proof JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      )
    `;

    // Create index
    await client`
      CREATE INDEX IF NOT EXISTS raffle_winners_raffle_id_idx ON raffle_winners(raffle_id)
    `;
    
    console.log('✅ [DATABASE] Database tables verified & ready.');
    schemaEnsured = true;
  } catch (err) {
    console.error('❌ [DATABASE] Failed to ensure schema:', err);
  }
}

if (isProdDb) {
  console.log('🔌 [DATABASE] Production database connection string detected. Connecting to PostgreSQL...');
  try {
    pgClient = postgres(dbUrl, { ssl: 'require', max: 10 });
    prodDbInstance = drizzle(pgClient, { schema });
    // Trigger schema creation asynchronously on startup
    ensureSchema(pgClient);
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL client:', err);
  }
}

// Path to the local JSON file database
const DB_FILE = join(process.cwd(), 'lib', 'db', 'db.json')

interface DatabaseState {
  raffles: any[]
  raffleWinners: any[]
}

function loadDb(): DatabaseState {
  try {
    if (existsSync(DB_FILE)) {
      const data = readFileSync(DB_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Error loading local JSON DB:', e)
  }
  return { raffles: [], raffleWinners: [] }
}

function saveDb(state: DatabaseState) {
  try {
    const dir = dirname(DB_FILE)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8')
  } catch (e) {
    console.error('Error saving local JSON DB:', e)
  }
}

// Ensure the db file exists
if (!existsSync(DB_FILE)) {
  saveDb({ raffles: [], raffleWinners: [] })
}

class MockQueryBuilder {
  private tableName: 'raffles' | 'raffleWinners'
  private filters: ((item: any) => boolean)[] = []
  private sortFn: ((a: any, b: any) => number) | null = null
  private limitCount: number | null = null

  constructor(tableName: 'raffles' | 'raffleWinners') {
    this.tableName = tableName
  }

  from(table: any) {
    return this
  }

  where(expression: any) {
    if (expression) {
      const extracted: { colName: string; targetVal: any }[] = []
      
      const extract = (expr: any) => {
        if (!expr) return
        if (expr.queryChunks) {
          const chunks = expr.queryChunks
          for (let i = 0; i < chunks.length; i++) {
            const c = chunks[i]
            if (c && typeof c.name === 'string') {
              let targetVal: any = undefined
              for (let j = i + 1; j < chunks.length; j++) {
                const nextChunk = chunks[j]
                if (nextChunk && nextChunk.value !== undefined && !Array.isArray(nextChunk.value) && typeof nextChunk.value !== 'object') {
                  targetVal = nextChunk.value
                  break
                }
              }
              if (targetVal !== undefined) {
                extracted.push({ colName: c.name, targetVal })
              }
            } else if (c && c.queryChunks) {
              extract(c)
            }
          }
        }
      }
      
      extract(expression)
      
      for (const filter of extracted) {
        const colName = filter.colName
        const targetVal = filter.targetVal
        const camelColName = colName.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        this.filters.push((item) => {
          const val = item[colName] !== undefined ? item[colName] : item[camelColName]
          return val === targetVal
        })
      }
    }
    return this
  }

  orderBy(expression: any) {
    // Sort by createdAt descending
    this.sortFn = (a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeB - timeA
    }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any): Promise<any> {
    const promise = (async () => {
      const state = loadDb()
      let data = [...state[this.tableName]]

      for (const filter of this.filters) {
        data = data.filter(filter)
      }

      if (this.sortFn) {
        data.sort(this.sortFn)
      }

      if (this.limitCount !== null) {
        data = data.slice(0, this.limitCount)
      }

      return data
    })()
    return promise.then(onfulfilled, onrejected)
  }
}

class MockInsertBuilder {
  private tableName: 'raffles' | 'raffleWinners'
  private valuesToInsert: any[] = []

  constructor(tableName: 'raffles' | 'raffleWinners', values: any) {
    this.tableName = tableName
    this.valuesToInsert = Array.isArray(values) ? values : [values]
  }

  returning() {
    const state = loadDb()
    const insertedItems: any[] = []

    for (const val of this.valuesToInsert) {
      const item = {
        id: val.id || crypto.randomUUID(),
        createdAt: val.createdAt || new Date().toISOString(),
        ...val,
      }
      state[this.tableName].push(item)
      insertedItems.push(item)
    }

    saveDb(state)

    return {
      then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any): Promise<any> {
        return Promise.resolve(insertedItems).then(onfulfilled, onrejected)
      }
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any): Promise<any> {
    const state = loadDb()
    const insertedItems: any[] = []

    for (const val of this.valuesToInsert) {
      const item = {
        id: val.id || crypto.randomUUID(),
        createdAt: val.createdAt || new Date().toISOString(),
        ...val,
      }
      state[this.tableName].push(item)
      insertedItems.push(item)
    }

    saveDb(state)

    const result = Array.isArray(this.valuesToInsert) ? insertedItems : insertedItems[0]
    return Promise.resolve(result).then(onfulfilled, onrejected)
  }
}

class MockUpdateBuilder {
  private tableName: 'raffles' | 'raffleWinners'
  private updateData: any
  private filters: ((item: any) => boolean)[] = []

  constructor(tableName: 'raffles' | 'raffleWinners', data: any) {
    this.tableName = tableName
    this.updateData = data
  }

  where(expression: any) {
    if (expression) {
      const extracted: { colName: string; targetVal: any }[] = []
      
      const extract = (expr: any) => {
        if (!expr) return
        if (expr.queryChunks) {
          const chunks = expr.queryChunks
          for (let i = 0; i < chunks.length; i++) {
            const c = chunks[i]
            if (c && typeof c.name === 'string') {
              let targetVal: any = undefined
              for (let j = i + 1; j < chunks.length; j++) {
                const nextChunk = chunks[j]
                if (nextChunk && nextChunk.value !== undefined && !Array.isArray(nextChunk.value) && typeof nextChunk.value !== 'object') {
                  targetVal = nextChunk.value
                  break
                }
              }
              if (targetVal !== undefined) {
                extracted.push({ colName: c.name, targetVal })
              }
            } else if (c && c.queryChunks) {
              extract(c)
            }
          }
        }
      }
      
      extract(expression)
      
      for (const filter of extracted) {
        const colName = filter.colName
        const targetVal = filter.targetVal
        const camelColName = colName.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
        this.filters.push((item) => {
          const val = item[colName] !== undefined ? item[colName] : item[camelColName]
          return val === targetVal
        })
      }
    }
    return this
  }

  returning() {
    const state = loadDb()
    const updatedItems: any[] = []

    state[this.tableName] = state[this.tableName].map((item) => {
      let matches = true
      for (const filter of this.filters) {
        if (!filter(item)) {
          matches = false
          break
        }
      }

      if (matches) {
        const updated = {
          ...item,
          ...this.updateData,
        }
        updatedItems.push(updated)
        return updated
      }
      return item
    })

    saveDb(state)

    return {
      then(onfulfilled?: (value: any[]) => any, onrejected?: (reason: any) => any): Promise<any> {
        return Promise.resolve(updatedItems).then(onfulfilled, onrejected)
      }
    }
  }
}

const mockDb = {
  select: () => {
    return {
      from: (table: any) => {
        const tableName = (table === rafflesTable) ? 'raffles' : 'raffleWinners'
        return new MockQueryBuilder(tableName)
      }
    }
  },
  insert: (table: any) => {
    const tableName = (table === rafflesTable) ? 'raffles' : 'raffleWinners'
    return {
      values: (values: any) => {
        return new MockInsertBuilder(tableName, values)
      }
    }
  },
  update: (table: any) => {
    const tableName = (table === rafflesTable) ? 'raffles' : 'raffleWinners'
    return {
      set: (data: any) => {
        return new MockUpdateBuilder(tableName, data)
      }
    }
  }
}

export const db = (isProdDb && prodDbInstance ? prodDbInstance : mockDb) as unknown as typeof originalDb
export type DB = typeof db
