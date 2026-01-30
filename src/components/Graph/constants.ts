/**
 To people who handle this codebase in the future. Ik this can be complex to understand. But bear with me
 Its inspired by the git graph component of github. You might have doubts of the choices made for the entire graphs section and I will address them here.

 1) Glowing effect & Mobile Performance: The CSS 'box shadow' and SVG filters will cause it to lag on mobile. Your console's view mobile mode might show smooth loading but the graph will be laggy, trust me. We intentionally disabled them on mobile (`isMobile` prop). If you see "boring" flat colors on mobile, it's a feature, not a bug. Uncomment the code in vite.config.ts and run the command npm run dev -- --host 0.0.0.0 and use the link with your ip in terminal on your phone to view it if you don't believe me.

 2) Adding Pages: This graph component is made so if you need to add pages in the future, you can do it easily. If you play around with the configs, you will understand. (Give it to AI if you don't get it)

 3) Session Storage: The animation only plays once. We check 'sessionStorage' in 'GitGraph.tsx'. If you want to see the intro again, clear your storage or open an incognito window. Simple.

 4) SVG Stacking: We map 'edges' before 'nodes' in 'GitGraph.tsx'. SVG doesn't support z-index. Use your brain, lines must be drawn first so they appear *behind* the nodes.

 5) Coordinates: The graph relies on hardcoded coordinates (1200x800 Desktop / 400x800 Mobile). If you change the aspect ratio, things will get squished. Stick to these dimensions or expect to do some math. Don't say I didn't warn you. 


  1. DESKTOP LAYOUT (Horizontal Tree):
    - Structure:
      * Origin (White): Starts at (50, 400).
      * Main Branch: Horizontal line.
      * Branches:
          - Yellow (About): Upper Left.
          - Cyan (Join Us): Main Horizontal continuation (Right).
          - Purple (Projects): Upper Right (Splits from Cyan).
          - Red (Blogs): Bottom Center (Splits from Main).
          - Blue (Events): Bottom Right (Splits from Cyan).
    - Nodes:
      * 'start': The origin point.
      * 'commit': Intermediate nodes (dots) representing git commits.
      * 'nav': Interactive nodes (with icons/rings) that link to pages.
  2. DESKTOP EDGES:
    - Connects nodes using Bezier curves (`M x1 y1 C cp1x cp1y, cp2x cp2y, x2 y2`).
    - Labels: Text placed along the path (e.g., "INTERESTED? JOIN US!").
    - Animations: Timings (`delay`, `duration`) create the "drawing" effect on load.
  3. MOBILE LAYOUT (Vertical/Upside Down Tree):
    - Coordinates: Defined in a 400x800 coordinate space (SVG).
    - optimized for vertical scrolling.
    - Structure:
      * Root at Top Center.
      * Splits into branches going Downward and Outward.
      * Alternating Left/Right alignment for labels to maximize screen space.
 
   5. ADVANCED CONFIGURATION (Examples):
     - activePath: ['e1', 'e_p1', 'e_b1', 'e_b2']
       * Defines the specific sequence of Edge IDs that should "glow" when this Node is hovered.
       * It usually traces the path backwards from the Node to the Root (e1).
       * Example: For "Projects", it lights up Main(e1) -> Join Us Trunk(e_p1) -> Projects Branch(e_b1) -> Projects Leaf(e_b2).
     - Edge Labels (e.g., labelOffset: '35%', labelAnchor: 'start'):
       * Controls precise text positioning along the SVG curve.
       * labelOffset: '35%' means the text begins at 35% of the total path length.
       * labelAnchor: 'start' means text flows forward from that point (left-aligned relative to the point).
       * Use 'middle' for centering labels on a segment, and 'start'/'end' for fine-tuning near bends.
   IMPORTANT:
  - The IDs used for nodes (e.g., 'nav_projects') essentially act as internal keys.
  - Recent updates have SWAPPED the visual roles of some nodes on Desktop to better
    fit the design (e.g., the "Projects" ID might now visually represent "Join Us").
    Always refer to the `label` and `path` properties for the actual content.

    Signing off - Nitansh Shankar (I hope I don't have to add any pages or make marjor changes to this code in future)
 */

import type { NodeType, GraphNode, GraphEdge } from '../../types/graph';

export type { NodeType, GraphNode, GraphEdge };

// Get colors from CSS variables for theme support
const getColor = (colorVar: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
};

const COLORS = {
  get neutral() { return getColor('--color-neutral') || '#ffffff'; },
  get about() { return getColor('--color-about') || '#facc15'; },     // Yellow
  get join() { return getColor('--color-projects') || '#00ffd5'; },   // Cyan (Recycled from projects var)
  get projects() { return getColor('--color-blogs') || '#a855f7'; },  // Purple (Recycled from blogs var)
  get blogs() { return getColor('--color-events') || '#ff3366'; },    // Red (Recycled from events var)
  get events() { return getColor('--color-contact') || '#2979ff'; },  // Blue (Recycled from contact var)
  get activity() { return getColor('--color-activity') || '#22c55e'; }, // Green (New)
};


export const DESKTOP_NODES: GraphNode[] = [
  // Origin
  { id: 'init', x: 50, y: 400, type: 'start', delay: 0, color: COLORS.neutral },

  // SPLIT 1: FOUNDATION (x=150) - People & Blogs
  { id: 'c_split_1', x: 150, y: 400, type: 'commit', delay: 0.5, color: COLORS.neutral },

  // People Hub (Top)
  { id: 'c_people_hub', x: 300, y: 280, type: 'commit', delay: 0.8, color: COLORS.about, activePath: ['e_t1', 'e_people_hub'] },
  // Leaves
  { id: 'nav_about', x: 500, y: 200, type: 'nav', label: 'About', path: '/about', delay: 1.3, description: 'People behind the club', color: COLORS.about, activePath: ['e_t1', 'e_people_hub', 'e_about'] },
  { id: 'nav_members', x: 450, y: 320, type: 'nav', label: 'Members', path: '/members', delay: 1.3, description: 'Meet the team', color: COLORS.about, activePath: ['e_t1', 'e_people_hub', 'e_members'] },

  // Blogs (Bottom)
  { id: 'nav_events', x: 400, y: 550, type: 'nav', label: 'Blogs', path: '/blogs', delay: 1.0, description: 'Technical posts', color: COLORS.blogs, activePath: ['e_t1', 'e_blogs'] },


  // SPLIT 2: ACTION (x=550) - Projects & Events
  { id: 'c_split_2', x: 550, y: 400, type: 'commit', delay: 0.7, color: COLORS.neutral },

  // Projects Hub (Top)
  { id: 'c_projects_hub', x: 700, y: 280, type: 'commit', delay: 1.0, color: COLORS.projects, activePath: ['e_t1', 'e_t2', 'e_projects_hub'] },
  // Leaves
  { id: 'nav_idea_wall', x: 950, y: 150, type: 'nav', label: 'Idea Wall', path: '/idea-wall', delay: 1.5, description: 'New ideas', color: COLORS.projects, activePath: ['e_t1', 'e_t2', 'e_projects_hub', 'e_idea'] },
  { id: 'nav_graveyard', x: 950, y: 300, type: 'nav', label: 'Graveyard', path: '/graveyard', delay: 1.5, description: 'Past projects', color: COLORS.projects, activePath: ['e_t1', 'e_t2', 'e_projects_hub', 'e_grave'] },

  // Updates/Events Hub (Bottom)
  { id: 'c_updates_hub', x: 700, y: 520, type: 'commit', delay: 1.0, color: '#2979ff', activePath: ['e_t1', 'e_t2', 'e_updates_hub'] },
  // Leaves
  { id: 'nav_activity', x: 950, y: 480, type: 'nav', label: 'Activity', path: '/activity', delay: 1.5, description: 'Recent happenings', color: '#2979ff', activePath: ['e_t1', 'e_t2', 'e_updates_hub', 'e_activity'] },
  { id: 'nav_contact', x: 950, y: 630, type: 'nav', label: 'Events', path: '/events', delay: 1.5, description: 'Workshops', color: '#2979ff', activePath: ['e_t1', 'e_t2', 'e_updates_hub', 'e_events_leaf'] },


  // END: Join Us (Cyan) - Main Trunk
  { id: 'nav_projects', x: 1000, y: 400, type: 'nav', label: 'Join Us', path: '/contact', delay: 1.8, description: 'Join and contribute', color: COLORS.join, activePath: ['e_t1', 'e_t2', 'e_end'] },
];


export const DESKTOP_EDGES: GraphEdge[] = [
  // MAIN TRUNK SEGMENTS
  { id: 'e_t1', from: 'init', to: 'c_split_1', delay: 0, duration: 0.4, label: 'Main', color: '#ffffff', labelDy: -35 },
  { id: 'e_t2', from: 'c_split_1', to: 'c_split_2', delay: 0.5, duration: 0.4, color: '#00ffd5', label: 'EXPLORE CLUB', labelDy: -10, labelOffset: '50%', labelAnchor: 'middle' },
  { id: 'e_end', from: 'c_split_2', to: 'nav_projects', delay: 1.4, duration: 0.5, color: '#00ffd5', label: 'INTERESTED? JOIN US!', labelDy: -15, labelOffset: '60%', labelAnchor: 'middle' },


  // SPLIT 1: PEOPLE (Top) & BLOGS (Bottom)
  // People (Top Hub)
  { id: 'e_people_hub', from: 'c_split_1', to: 'c_people_hub', delay: 0.6, duration: 0.4, label: 'PEOPLE', color: '#facc15', labelDy: -15, labelOffset: '60%', labelAnchor: 'end' },
  { id: 'e_about', from: 'c_people_hub', to: 'nav_about', delay: 1.0, duration: 0.4, label: 'About', color: '#facc15', labelDy: -10, labelOffset: '50%' },
  { id: 'e_members', from: 'c_people_hub', to: 'nav_members', delay: 1.0, duration: 0.4, label: 'Members', color: '#facc15', labelDy: 20, labelOffset: '50%' },

  // Blogs (Bottom Direct)
  { id: 'e_blogs', from: 'c_split_1', to: 'nav_events', delay: 0.6, duration: 0.5, label: 'WRITTEN BY US', color: '#ff3366', labelDy: 10, labelOffset: '40%', labelAnchor: 'start' },


  // SPLIT 2: PROJECTS (Top) & EVENTS (Bottom)
  // Projects (Top Hub)
  { id: 'e_projects_hub', from: 'c_split_2', to: 'c_projects_hub', delay: 0.8, duration: 0.4, color: '#a855f7', label: 'PROJECTS', labelDy: -20, labelOffset: '60%', labelAnchor: 'end' },
  { id: 'e_idea', from: 'c_projects_hub', to: 'nav_idea_wall', delay: 1.2, duration: 0.4, label: 'Idea Wall', color: '#a855f7', labelDy: -10, labelOffset: '50%' },
  { id: 'e_graveyard', from: 'c_projects_hub', to: 'nav_graveyard', delay: 1.2, duration: 0.4, label: 'Graveyard', color: '#a855f7', labelDy: 20, labelOffset: '50%' },

  // Events/Updates (Bottom Hub)
  { id: 'e_updates_hub', from: 'c_split_2', to: 'c_updates_hub', delay: 0.8, duration: 0.4, color: '#2979ff', label: 'UPDATES', labelDy: 20, labelOffset: '60%', labelAnchor: 'start' },
  { id: 'e_activity', from: 'c_updates_hub', to: 'nav_activity', delay: 1.2, duration: 0.4, label: 'Activity', color: '#2979ff', labelDy: -5, labelOffset: '50%' },
  { id: 'e_events_leaf', from: 'c_updates_hub', to: 'nav_contact', delay: 1.2, duration: 0.4, label: 'Events', color: '#2979ff', labelDy: 20, labelOffset: '50%' },
];

// Mobile Layout (Upside Down Tree)
export const MOBILE_NODES: GraphNode[] = [
  // Root (Top Center)
  { id: 'init', x: 200, y: 150, type: 'start', delay: 0, color: COLORS.neutral },
  { id: 'c1', x: 200, y: 230, type: 'commit', delay: 0.5, color: COLORS.neutral },

  // Branch Split 1: About (Left) & Projects (Right)
  { id: 'c2_a', x: 110, y: 290, type: 'commit', delay: 0.7, color: COLORS.about },
  { id: 'nav_about', x: 110, y: 360, type: 'nav', label: 'About', path: '/about', delay: 1.0, color: COLORS.about, activePath: ['e1', 'e_a1', 'e_a2'], align: 'left' }, // Outward

  { id: 'c2_p', x: 290, y: 290, type: 'commit', delay: 0.7, color: COLORS.join },
  { id: 'nav_projects', x: 290, y: 360, type: 'nav', label: 'Projects', path: '/projects', delay: 1.0, color: COLORS.join, activePath: ['e1', 'e_p1', 'e_p2'], align: 'right' }, // Outward

  // Center continue
  { id: 'c2', x: 200, y: 330, type: 'commit', delay: 1.2, color: COLORS.neutral },

  // Branch Split 2: Events (Left) & Blogs (Right)
  { id: 'c3_e', x: 110, y: 450, type: 'commit', delay: 1.5, color: COLORS.blogs },
  { id: 'nav_events', x: 110, y: 520, type: 'nav', label: 'Events', path: '/events', delay: 1.8, color: COLORS.blogs, activePath: ['e1', 'e_2', 'e_e1', 'e_e2'], align: 'left' }, // Outward

  { id: 'c3_b', x: 290, y: 450, type: 'commit', delay: 1.5, color: COLORS.projects },
  { id: 'nav_blogs', x: 290, y: 520, type: 'nav', label: 'Blogs', path: '/blogs', delay: 1.8, color: COLORS.projects, activePath: ['e1', 'e_2', 'e_b1', 'e_b2'], align: 'right' }, // Outward

  // Center continue to End
  { id: 'c3', x: 200, y: 590, type: 'commit', delay: 2.0, color: COLORS.events },
  { id: 'nav_contact', x: 200, y: 630, type: 'nav', label: 'Join Us', path: '/contact', delay: 2.3, color: COLORS.events, activePath: ['e1', 'e_2', 'e3', 'e_c1'], align: 'right' },
];

export const MOBILE_EDGES: GraphEdge[] = [
  // Root to First Split
  { id: 'e1', from: 'init', to: 'c1', delay: 0, duration: 0.6 },
  { id: 'e_a1', from: 'c1', to: 'c2_a', delay: 0.5, duration: 0.5 }, // Left
  { id: 'e_p1', from: 'c1', to: 'c2_p', delay: 0.5, duration: 0.5 }, // Right
  { id: 'e_c_1', from: 'c1', to: 'c2', delay: 0.8, duration: 0.6 }, // Center down

  { id: 'e_a2', from: 'c2_a', to: 'nav_about', delay: 0.8, duration: 0.4 },
  { id: 'e_p2', from: 'c2_p', to: 'nav_projects', delay: 0.8, duration: 0.4 },

  // Second Split
  { id: 'e_e1', from: 'c2', to: 'c3_e', delay: 1.3, duration: 0.5 }, // Left
  { id: 'e_b1', from: 'c2', to: 'c3_b', delay: 1.3, duration: 0.5 }, // Right
  { id: 'e_c_2', from: 'c2', to: 'c3', delay: 1.6, duration: 0.6 }, // Center down

  { id: 'e_e2', from: 'c3_e', to: 'nav_events', delay: 1.6, duration: 0.4 },
  { id: 'e_b2', from: 'c3_b', to: 'nav_blogs', delay: 1.6, duration: 0.4 },

  // Final Node
  { id: 'e_c1', from: 'c3', to: 'nav_contact', delay: 2.1, duration: 0.4 },
];
