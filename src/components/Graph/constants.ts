import type { NodeType, GraphNode, GraphEdge } from '../../types/graph';

export type { NodeType, GraphNode, GraphEdge };

// Get colors from CSS variables for theme support
const getColor = (colorVar: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
};

const COLORS = {
    get neutral() { return getColor('--color-neutral') || '#ffffff'; },
    get about() { return getColor('--color-about') || '#facc15'; },
    get projects() { return getColor('--color-projects') || '#00ffd5'; },
    get events() { return getColor('--color-events') || '#ff3366'; },
    get blogs() { return getColor('--color-blogs') || '#a855f7'; },
    get contact() { return getColor('--color-contact') || '#2979ff'; },
};


export const DESKTOP_NODES: GraphNode[] = [
    // Origin
    { id: 'init', x: 50, y: 400, type: 'start', delay: 0, color: COLORS.neutral },

    // First Commit
    { id: 'c1', x: 200, y: 400, type: 'commit', delay: 0.5, color: COLORS.neutral },

    // About (Yellow) 
    { id: 'c2_a', x: 400, y: 180, type: 'commit', delay: 0.8, color: COLORS.about },
    { id: 'nav_about', x: 650, y: 80, type: 'nav', label: 'About', path: '/about', delay: 1.4, description: 'People behind the club', color: COLORS.about, activePath: ['e1', 'e_a1', 'e_a2'] },

    //  Blogs (Cyan) 
    { id: 'c2_p', x: 650, y: 400, type: 'commit', delay: 1.0, color: COLORS.projects },
    { id: 'nav_projects', x: 1000, y: 400, type: 'nav', label: 'Blogs', path: '/blogs', delay: 1.8, description: 'Technical posts and write-ups', color: COLORS.projects, activePath: ['e1', 'e_p1', 'e_p2'] },

    // Projects (Purple)
    { id: 'c3_b', x: 800, y: 250, type: 'commit', delay: 1.5, color: COLORS.blogs },
    { id: 'nav_blogs', x: 1050, y: 180, type: 'nav', label: 'Projects', path: '/projects', delay: 2.1, description: 'Open-source work by the community', color: COLORS.blogs, activePath: ['e1', 'e_p1', 'e_b1', 'e_b2'] },

    //  Join Us (Red) 
    { id: 'c2_e', x: 450, y: 650, type: 'commit', delay: 1.1, color: COLORS.events },
    { id: 'nav_events', x: 750, y: 750, type: 'nav', label: 'Join Us', path: '/contact', delay: 1.9, description: 'Join and contribute', color: COLORS.events, activePath: ['e1', 'e_e1', 'e_e2'] },

    // Event (Blue)
    { id: 'nav_contact', x: 1050, y: 550, type: 'nav', label: 'Events', path: '/events', delay: 2.2, description: 'Workshops & hackathons', color: COLORS.contact, activePath: ['e1', 'e_p1', 'e_c1'] },
];

export const DESKTOP_EDGES: GraphEdge[] = [
    // Init -> C1 (Base Line) - White
    { id: 'e1', from: 'init', to: 'c1', delay: 0, duration: 0.6, label: 'main', color: '#ffffff' },

    // C1 -> About Chain - Yellow   
    { id: 'e_a1', from: 'c1', to: 'c2_a', delay: 0.5, duration: 0.4, label: 'GET TO KNOW US', color: '#facc15', labelDy: -15, labelOffset: '90%', labelAnchor: 'end' },
    { id: 'e_a2', from: 'c2_a', to: 'nav_about', delay: 0.9, duration: 0.6, color: '#facc15' },

    // C1 -> Blogs Chain - Cyan 
    { id: 'e_p1', from: 'c1', to: 'c2_p', delay: 0.6, duration: 0.5, label: 'TECHNICAL WRITING BY THE COMMUNITY', color: '#00ffd5', labelDy: -15, labelOffset: '95%', labelAnchor: 'end' },
    { id: 'e_p2', from: 'c2_p', to: 'nav_projects', delay: 1.1, duration: 0.8, color: '#00ffd5' },

    // C1 -> Events Chain - Red 
    { id: 'e_e1', from: 'c1', to: 'c2_e', delay: 0.6, duration: 0.5, label: 'INTERESTED? JOIN US!', color: '#ff3366', labelDy: -15, labelOffset: '90%', labelAnchor: 'end' },
    { id: 'e_e2', from: 'c2_e', to: 'nav_events', delay: 1.1, duration: 0.8, color: '#ff3366' },

    // Projects -> Blogs Split - Purple 
    { id: 'e_b1', from: 'c2_p', to: 'c3_b', delay: 1.1, duration: 0.4, label: 'OUR WORKS', color: '#a855f7', labelDy: -15, labelOffset: '95%', labelAnchor: 'end' },
    { id: 'e_b2', from: 'c3_b', to: 'nav_blogs', delay: 1.5, duration: 0.6, color: '#a855f7' },

    // Projects -> Contact Split - Blue 
    { id: 'e_c1', from: 'c2_p', to: 'nav_contact', delay: 1.1, duration: 1.0, label: 'HOSTED BY US FOR YOU', color: '#2979ff', labelDy: 25, labelOffset: '70%', labelAnchor: 'end' },
];

// Mobile Layout (Vertical)
export const MOBILE_NODES: GraphNode[] = [
    { id: 'init', x: 50, y: 140, type: 'start', delay: 0, color: COLORS.neutral },
    { id: 'c1', x: 50, y: 240, type: 'commit', delay: 0.5, color: COLORS.neutral },

    // About
    { id: 'nav_about', x: 120, y: 240, type: 'nav', label: 'About', path: '/about', delay: 0.8, color: COLORS.about, activePath: ['e1', 'e_a'] },

    // Projects
    { id: 'c2', x: 50, y: 360, type: 'commit', delay: 0.9, color: COLORS.projects },
    { id: 'nav_projects', x: 120, y: 360, type: 'nav', label: 'Projects', path: '/projects', delay: 1.3, color: COLORS.projects, activePath: ['e1', 'e_p1', 'e_p2'] },

    // Events
    { id: 'c3', x: 50, y: 480, type: 'commit', delay: 1.3, color: COLORS.events },
    { id: 'nav_events', x: 120, y: 480, type: 'nav', label: 'Events', path: '/events', delay: 1.7, color: COLORS.events, activePath: ['e1', 'e_p1', 'e_e1', 'e_e2'] },

    // Blogs
    { id: 'c4', x: 50, y: 600, type: 'commit', delay: 1.7, color: COLORS.blogs },
    { id: 'nav_blogs', x: 120, y: 600, type: 'nav', label: 'Blogs', path: '/blogs', delay: 2.1, color: COLORS.blogs, activePath: ['e1', 'e_p1', 'e_e1', 'e_b1', 'e_b2'] },

    // Contact
    { id: 'c5', x: 50, y: 720, type: 'commit', delay: 2.1, color: COLORS.contact },
    { id: 'nav_contact', x: 120, y: 720, type: 'nav', label: 'Contact', path: '/contact', delay: 2.5, color: COLORS.contact, activePath: ['e1', 'e_p1', 'e_e1', 'e_b1', 'e_c1', 'e_c2'] },
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

    { id: 'e_c1', from: 'c4', to: 'c5', delay: 1.7, duration: 0.5 },
    { id: 'e_c2', from: 'c5', to: 'nav_contact', delay: 2.1, duration: 0.4 },
];
