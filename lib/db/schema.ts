import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

export const raffles = pgTable('raffles', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  prizeDescription: text('prize_description'),
  winnerCount: integer('winner_count').notNull(),
  totalEntries: integer('total_entries').notNull(),
  merkleRoot: text('merkle_root').notNull(),
  commitTimestamp: integer('commit_timestamp').notNull(), // Unix epoch timestamp
  drawn: boolean('drawn').default(false).notNull(),
  seed: text('seed'),
  drawAlgorithm: text('draw_algorithm').default('cTRNG-keccak256-v1').notNull(),
  cosmicProof: jsonb('cosmic_proof'),
  rawEntries: text('raw_entries').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const raffleWinners = pgTable('raffle_winners', {
  id: uuid('id').primaryKey().defaultRandom(),
  raffleId: uuid('raffle_id').references(() => raffles.id, { onDelete: 'cascade' }).notNull(),
  index: integer('index').notNull(),
  username: text('username').notNull(),
  merkleProof: jsonb('merkle_proof').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('raffle_winners_raffle_id_idx').on(table.raffleId),
]);

export type Raffle = typeof raffles.$inferSelect;
export type NewRaffle = typeof raffles.$inferInsert;
export type RaffleWinner = typeof raffleWinners.$inferSelect;
export type NewRaffleWinner = typeof raffleWinners.$inferInsert;
