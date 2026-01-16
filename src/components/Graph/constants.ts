import type { NodeType, GraphNode, GraphEdge } from '../../types/graph';

export type { NodeType, GraphNode, GraphEdge };

const COLORS = {
    neutral: '#ffffff',
    about: '#facc15',
    projects: '#00ffd5',
    events: '#ff3366',
    blogs: '#a855f7',
    contact: '#2979ff',
};


export const DESKTOP_NODES: GraphNode[] = [
    // Origin
    { id: 'init', x: 50, y: 400, type: 'start', delay: 0, color: COLORS.neutral },

    // First Commit
    { id: 'c1', x: 200, y: 400, type: 'commit', delay: 0.5, color: COLORS.neutral },

    // Top branch: About (Yellow)
    { id: 'c2_a', x: 350, y: 200, type: 'commit', delay: 0.8, color: COLORS.about },
    { id: 'nav_about', x: 550, y: 100, type: 'nav', label: 'About', path: '/about', delay: 1.4, description: 'About The Club', color: COLORS.about, activePath: ['e1', 'e_a1', 'e_a2'] },

    // Main line: Projects (Cyan)
    { id: 'c2_p', x: 500, y: 400, type: 'commit', delay: 1.0, color: COLORS.projects },
    { id: 'nav_projects', x: 850, y: 400, type: 'nav', label: 'Blogs', path: '/blogs', delay: 1.8, description: 'Tech Posts', color: COLORS.projects, activePath: ['e1', 'e_p1', 'e_p2'] },

    // Split from Projects up: Blogs (Purple)
    { id: 'c3_b', x: 700, y: 250, type: 'commit', delay: 1.5, color: COLORS.blogs },
    { id: 'nav_blogs', x: 950, y: 180, type: 'nav', label: 'Projects', path: '/projects', delay: 2.1, description: 'Our Projects', color: COLORS.blogs, activePath: ['e1', 'e_p1', 'e_b1', 'e_b2'] },

    // Bottom branch: Events (Red)
    { id: 'c2_e', x: 450, y: 600, type: 'commit', delay: 1.1, color: COLORS.events },
    { id: 'nav_events', x: 700, y: 750, type: 'nav', label: 'Join Us', path: '/contact', delay: 1.9, description: 'Join Us', color: COLORS.events, activePath: ['e1', 'e_e1', 'e_e2'] },

    // Split from Projects down: Contact (Blue)
    { id: 'nav_contact', x: 1050, y: 550, type: 'nav', label: 'Events', path: '/events', delay: 2.2, description: 'Hosted By Us', color: COLORS.contact, activePath: ['e1', 'e_p1', 'e_c1'] },
];

export const DESKTOP_EDGES: GraphEdge[] = [
    // Init -> C1 (Base Line) - White
    { id: 'e1', from: 'init', to: 'c1', delay: 0, duration: 0.6, label: 'main', color: '#ffffff' },

    // C1 -> About Chain - Yellow
    { id: 'e_a1', from: 'c1', to: 'c2_a', delay: 0.5, duration: 0.4, label: 'Come To Know Us', color: '#facc15' },
    { id: 'e_a2', from: 'c2_a', to: 'nav_about', delay: 0.9, duration: 0.6, color: '#facc15' },

    // C1 -> Projects Chain - Cyan
    { id: 'e_p1', from: 'c1', to: 'c2_p', delay: 0.6, duration: 0.5, label: 'Check Out Our Latest Posts', color: '#00ffd5' },
    { id: 'e_p2', from: 'c2_p', to: 'nav_projects', delay: 1.1, duration: 0.8, color: '#00ffd5' },

    // C1 -> Events Chain - Red
    { id: 'e_e1', from: 'c1', to: 'c2_e', delay: 0.6, duration: 0.5, label: 'Be A Part Of The Club', color: '#ff3366' },
    { id: 'e_e2', from: 'c2_e', to: 'nav_events', delay: 1.1, duration: 0.8, color: '#ff3366' },

    // Projects -> Blogs Split - Purple
    { id: 'e_b1', from: 'c2_p', to: 'c3_b', delay: 1.1, duration: 0.4, label: 'Help Us Build Our Projects', color: '#a855f7' },
    { id: 'e_b2', from: 'c3_b', to: 'nav_blogs', delay: 1.5, duration: 0.6, color: '#a855f7' },

    // Projects -> Contact Split - Blue
    { id: 'e_c1', from: 'c2_p', to: 'nav_contact', delay: 1.1, duration: 1.0, label: 'Past/Upcoming Events', color: '#2979ff' },
];

// Mobile Layout (Vertical)
export const MOBILE_NODES: GraphNode[] = [
    { id: 'init', x: 50, y: 50, type: 'start', delay: 0, color: COLORS.neutral },
    { id: 'c1', x: 50, y: 150, type: 'commit', delay: 0.5, color: COLORS.neutral },

    // About
    { id: 'nav_about', x: 120, y: 150, type: 'nav', label: 'About', path: '/about', delay: 0.8, color: COLORS.about, activePath: ['e1', 'e_a'] },

    // Projects
    { id: 'c2', x: 50, y: 300, type: 'commit', delay: 0.9, color: COLORS.projects },
    { id: 'nav_projects', x: 120, y: 300, type: 'nav', label: 'Projects', path: '/projects', delay: 1.3, color: COLORS.projects, activePath: ['e1', 'e_p1', 'e_p2'] },

    // Events
    { id: 'c3', x: 50, y: 450, type: 'commit', delay: 1.3, color: COLORS.events },
    { id: 'nav_events', x: 120, y: 450, type: 'nav', label: 'Events', path: '/events', delay: 1.7, color: COLORS.events, activePath: ['e1', 'e_p1', 'e_e1', 'e_e2'] },

    // Blogs
    { id: 'c4', x: 50, y: 600, type: 'commit', delay: 1.7, color: COLORS.blogs },
    { id: 'nav_blogs', x: 120, y: 600, type: 'nav', label: 'Blogs', path: '/blogs', delay: 2.1, color: COLORS.blogs, activePath: ['e1', 'e_p1', 'e_e1', 'e_b1', 'e_b2'] },

    // Contact
    { id: 'nav_contact', x: 50, y: 750, type: 'nav', label: 'Contact', path: '/contact', delay: 2.1, color: COLORS.contact, activePath: ['e1', 'e_p1', 'e_e1', 'e_b1', 'e_c'] },
];

export const MOBILE_EDGES: GraphEdge[] = [
    { id: 'e1', from: 'init', to: 'c1', delay: 0, duration: 0.6 },

    { id: 'e_a', from: 'c1', to: 'nav_about', delay: 0.5, duration: 0.4 },

    { id: 'e_p1', from: 'c1', to: 'c2', delay: 0.5, duration: 0.5 },
    { id: 'e_p2', from: 'c2', to: 'nav_projects', delay: 0.9, duration: 0.4 },

    { id: 'e_e1', from: 'c2', to: 'c3', delay: 0.9, duration: 0.5 },
    { id: 'e_e2', from: 'c3', to: 'nav_events', delay: 1.3, duration: 0.4 },

    { id: 'e_b1', from: 'c3', to: 'c4', delay: 1.3, duration: 0.5 },
    { id: 'e_b2', from: 'c4', to: 'nav_blogs', delay: 1.7, duration: 0.4 },

    { id: 'e_c', from: 'c4', to: 'nav_contact', delay: 1.7, duration: 0.5 },
];
