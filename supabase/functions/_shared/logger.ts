/**
 * Structured logging for the edge functions.
 *
 * Every line is a single JSON object on one line, which is what the Supabase
 * log explorer can actually filter on — `console.log` with interpolated strings
 * is only greppable. Each run gets an id, so one invocation's lines can be
 * pulled out of a day's worth of cron output with a single filter:
 *
 *     select * from edge_logs where json_extract(body, '$.run_id') = '...'
 *
 * Usage:
 *
 *     const run = createRunLogger('github-sync');
 *     run.info('repos.fetched', { count: repos.length });
 *     run.count('repos_upserted');
 *     run.finish('ok');
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface RunLogger {
    /** Correlates every line emitted by one invocation. */
    readonly runId: string;
    debug(event: string, fields?: Record<string, unknown>): void;
    info(event: string, fields?: Record<string, unknown>): void;
    warn(event: string, fields?: Record<string, unknown>): void;
    error(event: string, fields?: Record<string, unknown>): void;
    /** Increment a named counter. Reported in the closing summary line. */
    count(name: string, by?: number): void;
    /** Current counter snapshot. */
    counters(): Record<string, number>;
    /** Milliseconds since the run started. */
    elapsedMs(): number;
    /**
     * Emit the closing summary line. Returns the payload so it can be included
     * in the HTTP response body, giving the caller the run id to quote in a bug
     * report.
     */
    finish(outcome: 'ok' | 'error', fields?: Record<string, unknown>): {
        run_id: string;
        outcome: string;
        duration_ms: number;
        counters: Record<string, number>;
    };
}

/**
 * Serializes an unknown thrown value. `catch (err)` gives `unknown`, and a
 * bare interpolation of an Error yields "[object Object]" — which is precisely
 * the case where you most want the message and stack.
 */
export function describeError(err: unknown): Record<string, unknown> {
    if (err instanceof Error) {
        return { error_name: err.name, error_message: err.message, error_stack: err.stack };
    }
    return { error_message: String(err) };
}

export function createRunLogger(fn: string, runId: string = crypto.randomUUID()): RunLogger {
    const startedAt = Date.now();
    const tally: Record<string, number> = {};

    const emit = (level: LogLevel, event: string, fields: Record<string, unknown> = {}) => {
        const line = JSON.stringify({
            ts: new Date().toISOString(),
            level,
            fn,
            run_id: runId,
            event,
            ...fields,
        });
        // Keep warn/error on the error stream so existing severity filters work.
        if (level === 'error' || level === 'warn') {
            console.error(line);
        } else {
            console.log(line);
        }
    };

    return {
        runId,
        debug: (event, fields) => emit('debug', event, fields),
        info: (event, fields) => emit('info', event, fields),
        warn: (event, fields) => emit('warn', event, fields),
        error: (event, fields) => emit('error', event, fields),
        count: (name, by = 1) => {
            tally[name] = (tally[name] ?? 0) + by;
        },
        counters: () => ({ ...tally }),
        elapsedMs: () => Date.now() - startedAt,
        finish: (outcome, fields = {}) => {
            const summary = {
                run_id: runId,
                outcome,
                duration_ms: Date.now() - startedAt,
                counters: { ...tally },
            };
            emit(outcome === 'ok' ? 'info' : 'error', 'run.finished', { ...summary, ...fields });
            return summary;
        },
    };
}
