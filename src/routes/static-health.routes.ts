import express from 'express';
import type { StaticHealthRoutesDeps } from './types';

export function registerStaticAndHealthRoutes(app: express.Application, deps: StaticHealthRoutesDeps): void {
  // Static file serving for non-conflicting paths
  app.use('/public', express.static('public'));
  // Serve static files with cache-busting for JS files
  app.use(express.static('public', {
      setHeaders: (res, path) => {
          if (path.endsWith('.js')) {
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
          }
      }
  }));
  app.use('/src/resources', express.static('src/resources'));
  
  // Comprehensive health check endpoint
  app.get('/health', async (req, res) => {
    const startTime = Date.now();
    const gitInfo = deps.getGitInfo();
    const healthData: Record<string, unknown> = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      git: {
        commit: gitInfo.commit,
        shortCommit: gitInfo.shortCommit,
        branch: gitInfo.branch,
        commitDate: gitInfo.commitDate,
        commitMessage: gitInfo.commitMessage,
        commitAuthor: gitInfo.commitAuthor,
        commitEmail: gitInfo.commitEmail,
      }
    };
  
    try {
      // System resource information
      const memUsage = process.memoryUsage();
      healthData.resources = {
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        },
        cpu: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      };
  
      // Database health check
      try {
        const dbStartTime = Date.now();
        
        // Test database connection - check if deps.dataSource is initialized
        if (!deps.dataSource) {
          throw new Error('DataSource not initialized');
        }
        
        const pool = deps.dataSource.getPool();
        if (!pool) {
          throw new Error('Database connection pool not initialized');
        }
        
        const client = await pool.connect();
        
        // Check if GUEST user exists
        const guestUserResult = await client.query(
          'SELECT id, username, role FROM users WHERE role = $1 OR username = $2',
          ['GUEST', 'guest']
        );
        
        // Count total guest decks
        const guestDecksResult = await client.query(
          'SELECT COUNT(*) as count FROM decks WHERE user_id IN (SELECT id FROM users WHERE role = $1 OR username = $2)',
          ['GUEST', 'guest']
        );
        
        // Get database stats
        const dbStatsResult = await client.query(`
          SELECT 
            (SELECT COUNT(*) FROM users) as total_users,
            (SELECT COUNT(*) FROM decks) as total_decks,
            (SELECT COUNT(*) FROM deck_cards) as total_deck_cards,
            (SELECT COUNT(*) FROM characters) as total_characters,
            (SELECT COUNT(*) FROM special_cards) as total_special_cards,
            (SELECT COUNT(*) FROM power_cards) as total_power_cards
        `);
        
        // Get latest migration information
        const migrationResult = await client.query(`
          SELECT 
            version,
            description,
            type,
            script,
            checksum,
            installed_by,
            installed_on,
            execution_time,
            success,
            installed_rank
          FROM flyway_schema_history 
          ORDER BY installed_rank DESC 
          LIMIT 1
        `);
        
        // Get total migration count
        const _migrationCountResult = await client.query(`
          SELECT COUNT(*) as total_migrations FROM flyway_schema_history
        `);
        
        // Get migration status summary
        const _migrationStatusResult = await client.query(`
          SELECT 
            COUNT(CASE WHEN success = true THEN 1 END) as successful_migrations,
            COUNT(CASE WHEN success = false THEN 1 END) as failed_migrations,
            MAX(installed_on) as last_migration_date
          FROM flyway_schema_history
        `);
        
        client.release();
        
        const dbLatency = Date.now() - dbStartTime;
        
        healthData.database = {
          status: 'OK',
          latency: `${dbLatency}ms`,
          connection: 'Active',
          guestUser: {
            exists: guestUserResult.rows.length > 0,
            count: guestUserResult.rows.length,
            users: (guestUserResult.rows as { id: string; username: string; role: string }[]).map((row) => ({
              id: row.id,
              username: row.username,
              role: row.role
            }))
          },
          guestDecks: {
            total: parseInt((guestDecksResult.rows[0] as { count: string }).count)
          },
          stats: {
            totalUsers: parseInt((dbStatsResult.rows[0] as { total_users: string }).total_users),
            totalDecks: parseInt((dbStatsResult.rows[0] as { total_decks: string }).total_decks),
            totalDeckCards: parseInt((dbStatsResult.rows[0] as { total_deck_cards: string }).total_deck_cards),
            totalCharacters: parseInt((dbStatsResult.rows[0] as { total_characters: string }).total_characters),
            totalSpecialCards: parseInt((dbStatsResult.rows[0] as { total_special_cards: string }).total_special_cards),
            totalPowerCards: parseInt((dbStatsResult.rows[0] as { total_power_cards: string }).total_power_cards)
          },
          migrations: {
            latest: migrationResult.rows.length > 0 ? (() => {
              const m = migrationResult.rows[0] as { version: string; description: string; type: string; script: string; checksum: number; installed_by: string; installed_on: string; execution_time: number; success: boolean; installed_rank: number };
              return { version: m.version, description: m.description, type: m.type, script: m.script, checksum: m.checksum, installedBy: m.installed_by, installedOn: m.installed_on, executionTime: m.execution_time, success: m.success, installedRank: m.installed_rank };
            })() : null,
          }
        };
        
      } catch (dbError) {
        healthData.database = {
          status: 'ERROR',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error',
          connection: 'Failed'
        };
        // Database errors are non-critical - server can still respond
        healthData.status = 'DEGRADED';
      }
  
  
      // Calculate total response time
      const totalLatency = Date.now() - startTime;
      healthData.latency = `${totalLatency}ms`;
  
      // Set appropriate HTTP status code
      // Always return 200 unless there's a critical server error
      // DEGRADED status (database issues) is acceptable for health checks
      const httpStatus = healthData.status === 'ERROR' ? 503 : 200;
  
      res.status(httpStatus).json(healthData);
  
    } catch (error) {
      // Critical error - server is unhealthy
      healthData.status = 'ERROR';
      healthData.error = error instanceof Error ? error.message : 'Unknown error';
      healthData.latency = `${Date.now() - startTime}ms`;
      
      res.status(503).json(healthData);
    }
  });
}
