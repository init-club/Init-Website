import { motion } from 'framer-motion';
import { Calendar, User, Tag } from 'lucide-react';
import type { Blog } from '../types/blog';

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className="group relative bg-black/50 border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer"
    >
      {/* Cover Image */}
      {blog.cover_image_url ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="text-6xl font-heading text-white/20">{blog.title.charAt(0)}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                <Tag size={10} />
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-400 text-sm line-clamp-2">
          {blog.content.slice(0, 150)}...
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <User size={14} className="text-cyan-400" />
            <span>{blog.author_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 blur-xl" />
      </div>
    </motion.article>
  );
};

export default BlogCard;
