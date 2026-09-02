import { motion } from 'framer-motion';
import {
  ExternalLink,
  Phone,
  UserRound,
} from 'lucide-react';

import type {
  IdeaWallEntry,
} from '../../types/ideaWall';

interface IdeaWallSubmissionCardProps {
  entry: IdeaWallEntry;
}

export default function IdeaWallSubmissionCard({
  entry,
}: IdeaWallSubmissionCardProps) {
  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
        scale: 1.012,
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 30,
      }}
      className="
        group relative
        bg-zinc-950/40
        backdrop-blur-sm
        border border-zinc-900
        rounded-2xl
        overflow-hidden
        hover:border-cyan-500/20
        transition-all duration-300
      "
    >
      {/* Header */}
      <div
        className="h-16 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,255,213,0.07), rgba(168,85,247,0.07))',
        }}
      >
        <div
          className="
            absolute top-0 left-0 right-0
            h-[1px]
            bg-gradient-to-r
            from-transparent
            via-cyan-500/40
            to-transparent
          "
        />

        <div
          className="
            absolute top-3.5 left-4
            inline-flex items-center
            px-2 py-0.5
            rounded-full
            text-[10px]
            font-semibold
            uppercase
            tracking-wider
            text-cyan-300
            border border-cyan-500/20
            bg-cyan-500/5
          "
        >
          Community Submission
        </div>

        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-zinc-950
            via-zinc-950/20
            to-transparent
          "
        />
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">

        {/* Repository Name */}
        <h3
          className="
            text-base
            font-bold
            text-zinc-200
            group-hover:text-white
            transition-colors
            duration-200
            line-clamp-1
            font-mono
          "
        >
          {entry.repository_name}
        </h3>

        {/* Owner */}
        <div
          className="
            flex items-center gap-2
            text-xs text-zinc-400
          "
        >
          <UserRound
            size={13}
            className="text-cyan-400"
          />

          <span>Submitted by</span>

          <span
            className="
              font-semibold
              text-zinc-200
            "
          >
            {entry.full_name}
          </span>
        </div>

        {/* Description */}
        <p
          className="
            text-zinc-600
            text-xs
            leading-relaxed
            line-clamp-3
            min-h-[3rem]
          "
        >
          {entry.repository_description ||
            'No repository description provided.'}
        </p>

        {/* Phone */}
        <div
          className="
            pt-2
            border-t
            border-zinc-900
          "
        >
          <div
            className="
              flex items-start gap-2
              text-xs text-zinc-500
            "
          >
            <Phone
              size={13}
              className="
                mt-0.5
                text-emerald-400
                shrink-0
              "
            />

            <div>
              <div
                className="
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-zinc-600
                  font-mono
                "
              >
                Phone
              </div>

              <div
                className="
                  text-zinc-300
                  break-all
                "
              >
                {entry.phone_number ||
                  'Not provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Repository Button */}
        <div
          className="
            pt-3
            border-t
            border-zinc-900
          "
        >
          <a
            href={entry.repository_link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full
              inline-flex
              items-center
              justify-center
              gap-2
              px-3
              py-2
              rounded-lg
              text-xs
              font-semibold
              text-white
              transition-all
              duration-200
              hover:scale-[1.02]
              active:scale-[0.98]
            "
            style={{
              background:
                'linear-gradient(90deg, rgba(0,255,213,0.15), rgba(168,85,247,0.15))',
              border:
                '1px solid rgba(0,255,213,0.2)',
            }}
          >
            View Repository
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}