import { useMemo, type ReactElement } from 'react';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { Trophy, Medal, Loader2, AlertCircle, Award, GitCommitHorizontal } from 'lucide-react';
import { fetchLeaderboard } from '../../utils/fetchers';
import { SWR_KEYS } from '../../utils/swrKeys';

interface ContributionStat {
  month: number;
  year: number;
  score: number;
  score_adjustment: number;
}

interface LeaderboardMember {
  id: string;
  username: string;
  name: string;
  avatar_url: string | null;
  custom_title: string | null;
  contribution_stats?: ContributionStat[];
}

interface RankedMember extends LeaderboardMember {
  totalScore: number;
  rank: number;
}

// Same all-time score calculation used on the admin roster (MembersAdmin.tsx):
// sum every monthly contribution_stats row (score already folds in any adjustment).
const getTotalScore = (member: LeaderboardMember) =>
  member.contribution_stats?.reduce((acc, s) => acc + (s.score || 0), 0) || 0;

// Cap how many members render — change to 20 if you'd rather show more.
const MAX_DISPLAYED = 15;

const EXCLUDED_USERNAMES = ['TheInitClub'];

const podiumStyles: Record<number, { ring: string; glow: string; badge: string; icon: ReactElement }> = {
  1: {
    ring: 'border-yellow-400/40',
    glow: 'shadow-[0_0_30px_rgba(250,204,21,0.15)]',
    badge: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
    icon: <Trophy size={16} className="text-yellow-300" />,
  },
  2: {
    ring: 'border-zinc-300/30',
    glow: 'shadow-[0_0_24px_rgba(212,212,216,0.1)]',
    badge: 'bg-zinc-300/10 text-zinc-200 border-zinc-300/25',
    icon: <Medal size={16} className="text-zinc-300" />,
  },
  3: {
    ring: 'border-amber-600/40',
    glow: 'shadow-[0_0_24px_rgba(217,119,6,0.12)]',
    badge: 'bg-amber-600/10 text-amber-400 border-amber-600/30',
    icon: <Medal size={16} className="text-amber-500" />,
  },
};

function Avatar({ member, size = 44 }: { member: LeaderboardMember; size?: number }) {
  if (member.avatar_url) {
    return (
      <img
        src={member.avatar_url}
        alt={member.name || member.username}
        className="rounded-full object-cover border border-zinc-800"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: 'linear-gradient(135deg, #a855f7, #00ffd5)',
      }}
    >
      {(member.name || member.username || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export default function Leaderboard() {
  const { data, error, isLoading } = useSWR(SWR_KEYS.LEADERBOARD, fetchLeaderboard);

  const ranked: RankedMember[] = useMemo(() => {
    if (!data) return [];
    return [...data]
      .map((m: LeaderboardMember) => ({ ...m, totalScore: getTotalScore(m) }))
      .filter((m) => m.totalScore > 0 && !EXCLUDED_USERNAMES.some(
        (u) => u.toLowerCase() === m.username?.toLowerCase()
      ))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, MAX_DISPLAYED)
      .map((m, i) => ({ ...m, rank: i + 1 }));
  }, [data]);

  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-4">
          <AlertCircle size={40} className="text-zinc-700" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">Couldn't load the leaderboard</h3>
        <p className="text-zinc-600 text-sm">Please try refreshing the page.</p>
      </div>
    );
  }

  if (ranked.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex justify-center mb-4">
          <Trophy size={40} className="text-zinc-700" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-2">No contributions yet</h3>
        <p className="text-zinc-600 text-sm">Points will show up here as members start contributing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Podium for the top 3 */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 items-end">
          {/* Reorder visually so #1 sits tallest in the middle on larger screens */}
          {[topThree[1], topThree[0], topThree[2]].map((member, idx) => {
            if (!member) return <div key={`empty-${idx}`} className="hidden sm:block" />;
            const style = podiumStyles[member.rank];
            const isFirst = member.rank === 1;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`relative flex flex-col items-center justify-center text-center rounded-2xl border bg-zinc-950/60 backdrop-blur-sm px-5 ${style.ring} ${style.glow} ${
                  isFirst
                    ? 'min-h-[272px] py-8 sm:-translate-y-3'
                    : 'min-h-[228px] py-6'
                }`}
              >
                <span className={`absolute -top-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.badge}`}>
                  {style.icon}
                  #{member.rank}
                </span>
                <Avatar member={member} size={isFirst ? 68 : 56} />
                <p className="mt-3 font-bold text-white text-sm truncate max-w-full">
                  {member.name || member.username}
                </p>
                <p className="text-zinc-500 text-xs">@{member.username}</p>
                {member.custom_title && (
                  <div className="flex items-center gap-1 mt-2 bg-purple-500/5 border border-purple-500/10 px-2 py-0.5 rounded-full">
                    <Award size={10} className="text-purple-400 shrink-0" />
                    <span className="text-[10px] text-purple-300 font-medium truncate">{member.custom_title}</span>
                  </div>
                )}
                <p className={`mt-3 font-black text-white ${isFirst ? 'text-3xl' : 'text-2xl'}`} style={{ fontFamily: 'var(--font-heading)' }}>
                  {member.totalScore}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-zinc-600">points</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Remaining ranked members */}
      {rest.length > 0 && (
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 overflow-hidden">
          {rest.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`flex items-center gap-4 px-4 py-3 ${idx !== rest.length - 1 ? 'border-b border-zinc-900' : ''}`}
            >
              <span className="w-7 shrink-0 text-center text-sm font-bold text-zinc-500">
                {member.rank}
              </span>
              <Avatar member={member} size={36} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm truncate">{member.name || member.username}</p>
                <p className="text-zinc-600 text-xs truncate">@{member.username}</p>
              </div>
              {member.custom_title && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/5 border border-purple-500/10 rounded-full text-[10px] text-purple-300 font-medium shrink-0">
                  <Award size={10} />
                  {member.custom_title}
                </span>
              )}
              <div className="flex items-center gap-1.5 shrink-0">
                <GitCommitHorizontal size={12} className="text-zinc-600" />
                <span className="font-bold text-white text-sm">{member.totalScore}</span>
                <span className="text-zinc-600 text-xs">pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
