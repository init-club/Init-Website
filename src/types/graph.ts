export type NodeType = 'start' | 'commit' | 'nav' | 'merge';

export interface GraphNode {
    id: string;
    x: number;
    y: number;
    type: NodeType;
    label?: string;
    path?: string; // Route path if nav node
    delay?: number; // Animation trigger delay
    description?: string; // Hover description
    activePath?: string[]; // IDs of edges to highlight on hover
    color?: string; // Custom accent color
    align?: 'left' | 'right' | 'top'; // Text alignment relative to node
}

export interface GraphEdge {
    id: string;
    from: string;
    to: string;
    delay: number;
    duration: number;
    label?: string;
    labelDy?: number | string;
    labelOffset?: number | string;
    labelAnchor?: 'start' | 'middle' | 'end';
    color?: string; // Edge color for glow
}
