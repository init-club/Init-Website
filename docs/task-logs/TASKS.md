# Tasks

| #    | Task                                                                  | Status         |
|------|-----------------------------------------------------------------------|----------------|
| S-A1 | Limit how often someone can submit a form                             | Pending        |
| S-A2 | Limit the maximum size of a form submission                           | Partially done |
| S-A3 | Validate all submitted values on the server side, not only in React   | Partially done |
| S-A4 | Test what user / member / admin are each allowed to do                | Partially done |
| S-B1 | Review RLS policies for every important table                         | Done           |
| S-B2 | Check admin-only RPC functions verify the correct role                | Partially done |
| S-B3 | Confirm service-role keys and GitHub tokens are server-side only      | Done           |
| S-B4 | Add repeatable security tests for public / member / admin             | Pending        |
| S-C1 | Review scroll on all pages — phone, touchpad, mouse                   | Done           |
| S-C2 | Resolve the issue raised in GitHub                                    | Pending        |
| S-D1 | Review the leaderboard and fix its representation on phones           | Done           |
| S-E1 | Identify and fix the first-load GitHub sync loop                      | Done           |
| S-F1 | Complete the unfinished pages                                         | Pending        |
| S-F2 | Revise the working of pages that are done                             | Pending        |
| S-F3 | Centre the profile button dropdown on home                            | Done           |
| L-A1 | Unit tests for important helpers and business rules                   | Done           |
| L-A2 | Database/RLS tests for permission rules                               | Pending        |
| L-A3 | End-to-end tests for critical flows                                   | Pending        |
| L-B1 | Run install, lint, type-check, build and tests in GitHub Actions      | Done           |
| L-B2 | Block merges when critical checks fail                                | Pending        |
| L-B3 | Keep deployment steps consistent between local and production         | Partially done |
| L-C1 | Use structured logs for GitHub sync jobs                              | Done           |
| L-C2 | Give each sync run an ID                                              | Done           |
| L-C3 | Track success, failure, retry count, records changed                  | Done           |
| L-C4 | Basic monitoring for important backend failures                       | Pending        |
| L-D1 | Make sync jobs safe to run more than once                             | Pending        |
| L-D2 | Keep retry, rate-limit and partial-failure handling clear             | Partially done |
| L-D3 | Avoid unnecessary repeated API calls                                  | Pending        |
| L-D4 | Consider background processing as usage grows                         | Pending        |
| L-E1 | Document what React, PostgreSQL functions and Edge Functions each own | Pending        |
| L-E2 | Keep a single source of truth for schema and database logic           | Pending        |
| L-E3 | Add indexes when real usage shows slow queries                        | Pending        |
| L-E4 | Document backup and restore procedures                                | Pending        |
| L-F1 | Keep shared UI components consistent                                  | Pending        |
| L-F2 | Move repeated business logic into reusable utilities                  | Partially done |
| L-F3 | Keep data fetching patterns consistent across pages                   | Pending        |
| L-F4 | Reduce duplicated queries and duplicated state handling               | Partially done |
| L-G1 | Test important pages with keyboard navigation                         | Partially done |
| L-G2 | Check form labels, focus states, button names, readable contrast      | Partially done |
| L-G3 | Test the dashboard and forms carefully on smaller screens             | Pending        |
