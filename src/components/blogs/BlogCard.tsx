import { motion } from 'framer-motion';
import { Calendar, User, Tag } from 'lucide-react';
import type { Blog } from '../../types/blog';

interface BlogCardProps {
  blog: Blog;
  onClick?: () => void;
}

const BlogCard = ({ blog, onClick }: BlogCardProps) => {
  const formattedDate = blog.published_at
    ? new Date(blog.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : 'Pending';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, scale: 1.012 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      onClick={onClick}
      className="group relative bg-zinc-950/40 backdrop-blur-sm border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-800 transition-all duration-300 cursor-pointer"
    >
      {/* Cover Image */}
      {blog.cover_image_url ? (
        <div className="relative h-44 overflow-hidden">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
        </div>
      ) : (
        <div className="h-28 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(0,255,213,0.05))' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-5xl font-heading font-black opacity-10"
              style={{ background: 'linear-gradient(135deg, #00ffd5, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              {blog.title.charAt(0)}
            </span>
          </div>
          {/* Top divider */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(168,85,247,0.12)] text-purple-400 border border-purple-500/20"
              >
                <Tag size={9} />
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-[11px] text-zinc-600">+{blog.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-bold text-zinc-200 group-hover:text-white transition-colors duration-200 line-clamp-2 leading-snug">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-zinc-600 text-xs leading-relaxed line-clamp-2">
          {blog.content.slice(0, 150)}...
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <User size={12} className="text-cyan-500" />
            <span>{blog.author_name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-600">
            <Calendar size={11} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Hover gradient shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/4 via-transparent to-cyan-500/4" />
      </div>
    </motion.article>
  );
};

export default BlogCard;
