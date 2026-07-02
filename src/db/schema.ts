import { pgTable, uuid, pgEnum, text, bigint, boolean, integer, timestamp, date, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// Custom Enum for Blogs
export const blogStatusEnum = pgEnum('blog_status', ['pending', 'published', 'rejected']);

// 1. Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  authUserId: uuid('auth_user_id'),
  githubId: bigint('github_id', { mode: 'number' }).notNull().unique(),
  username: text('username').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  role: text('role').default('member'),
  isCoreMember: boolean('is_core_member').default(false),
  teamName: text('team_name'),
  isTeamLeader: boolean('is_team_leader').default(false),
  isActive: boolean('is_active').default(true),
  profileCompleted: boolean('profile_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  linkedinUrl: text('linkedin_url'),
  instagramUrl: text('instagram_url'),
  githubUrl: text('github_url'),
  rollNo: text('roll_no'),
  customTitle: text('custom_title'),
});

// 2. Repositories table
export const repositories = pgTable('repositories', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  githubRepoId: bigint('github_repo_id', { mode: 'number' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  htmlUrl: text('html_url').notNull(),
  isArchived: boolean('is_archived').default(false),
  isFeatured: boolean('is_featured').default(false),
  stars: integer('stars').default(0),
  forks: integer('forks').default(0),
  pushedAt: timestamp('pushed_at', { withTimezone: true }),
  lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
  archivalReason: text('archival_reason'),
  isRevivable: boolean('is_revivable').default(true),
  topics: jsonb('topics'),
  difficulty: text('difficulty'),
  projectStatus: text('project_status'),
  videoUrl: text('video_url'),
  homepage: text('homepage'),
});

// 3. Pull Requests table
export const pullRequests = pgTable('pull_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  githubPrId: bigint('github_pr_id', { mode: 'number' }).notNull().unique(),
  repoId: bigint('repo_id', { mode: 'number' }).references(() => repositories.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  state: text('state'),
  mergedAt: timestamp('merged_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }),
});

// 4. Contribution Stats table
export const contributionStats = pgTable('contribution_stats', {
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  commitCount: integer('commit_count').default(0),
  prCount: integer('pr_count').default(0),
  score: integer('score').default(0),
  scoreAdjustment: integer('score_adjustment').default(0).notNull(),
  adjustmentReason: text('adjustment_reason'),
  lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.userId, t.month, t.year] })
]);

// 5. Blogs table
export const blogs = pgTable('blogs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  rollNo: text('roll_no'),
  phoneNumber: text('phone_number'),
  tags: text('tags').array(),
  authorName: text('author_name'),
  status: blogStatusEnum('status').default('pending'),
  coverImageUrl: text('cover_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// 6. Attendance Sessions
export const attendanceSessions = pgTable('attendance_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  sessionDate: date('session_date'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
});

// 7. Attendance Records
export const attendanceRecords = pgTable('attendance_records', {
  sessionId: uuid('session_id').references(() => attendanceSessions.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status'),
}, (t) => [
  primaryKey({ columns: [t.sessionId, t.userId] })
]);

// 8. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  performedById: uuid('performed_by_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: text('action_type').notNull(),
  targetId: text('target_id'),
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  tableName: text('table_name'),
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
});

// 9. Site Settings table
export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  allowPublicBlogs: boolean('allow_public_blogs').default(true).notNull(),
  discordLink: text('discord_link').default('').notNull(),
  instagramLink: text('instagram_link').default('').notNull(),
  linkedinLink: text('linkedin_link').default('').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// 10. Forms table
export const forms = pgTable('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('draft'),
  fields: jsonb('fields').default('[]').notNull(),
  settings: jsonb('settings').default('{}').notNull(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  revision: integer('revision').default(1).notNull(),
});

// 11. Normalized Form Items table
export const formItems = pgTable('form_items', {
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  itemId: text('item_id').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  required: boolean('required').default(false).notNull(),
  position: integer('position').notNull(),
  config: jsonb('config').default('{}').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.formId, t.itemId] })
]);

// 12. Form Item Options table
export const formItemOptions = pgTable('form_item_options', {
  formId: uuid('form_id').notNull(),
  itemId: text('item_id').notNull(),
  optionId: text('option_id').notNull(),
  label: text('label').notNull(),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  primaryKey({ columns: [t.formId, t.itemId, t.optionId] })
]);

// 13. Form Responses table
export const formResponses = pgTable('form_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  answers: jsonb('answers').default('{}').notNull(),
  respondent: jsonb('respondent').default('{}'),
  metadata: jsonb('metadata').default('{}'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).defaultNow(),
});
