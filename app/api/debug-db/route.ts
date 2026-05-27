import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
  const ddlUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL

  const debugInfo: any = {
    env: {
      has_POSTGRES_URL: !!process.env.POSTGRES_URL,
      has_POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING,
      has_DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL_preview: maskUrl(process.env.POSTGRES_URL),
      POSTGRES_URL_NON_POOLING_preview: maskUrl(process.env.POSTGRES_URL_NON_POOLING),
      DATABASE_URL_preview: maskUrl(process.env.DATABASE_URL),
    },
    tests: {}
  }

  // Test direct connection with POSTGRES_URL
  if (dbUrl) {
    try {
      const sql = postgres(dbUrl, { ssl: 'require', max: 1, timeout: 5 })
      const result = await sql`SELECT 1 as connected`
      debugInfo.tests.postgres_url = { success: true, result }
      await sql.end()
    } catch (err: any) {
      debugInfo.tests.postgres_url = {
        success: false,
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          detail: err.detail,
          hint: err.hint,
          stack: err.stack
        }
      }
    }
  }

  // Test direct connection with POSTGRES_URL_NON_POOLING
  if (ddlUrl) {
    try {
      const sql = postgres(ddlUrl, { ssl: 'require', max: 1, timeout: 5 })
      const result = await sql`SELECT 1 as connected`
      debugInfo.tests.postgres_url_non_pooling = { success: true, result }
      
      // Test creating a temp table or checking schema table list
      try {
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `
        debugInfo.tests.existing_tables = tables
      } catch (tableErr: any) {
        debugInfo.tests.existing_tables_error = tableErr.message
      }

      await sql.end()
    } catch (err: any) {
      debugInfo.tests.postgres_url_non_pooling = {
        success: false,
        error: {
          name: err.name,
          message: err.message,
          code: err.code,
          detail: err.detail,
          hint: err.hint,
          stack: err.stack
        }
      }
    }
  }

  return NextResponse.json(debugInfo)
}

function maskUrl(url: string | undefined): string {
  if (!url) return 'undefined'
  try {
    return url.replace(/:[^:@]+@/, ':***@').substring(0, 50) + '...'
  } catch {
    return 'invalid_url_format'
  }
}
