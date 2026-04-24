import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───────────────────────────────────────────────────────────

interface HierarchyNode {
  [key: string]: HierarchyNode;
}

interface Hierarchy {
  root: string;
  tree: HierarchyNode | Record<string, never>;
  depth?: number;
  has_cycle?: true;
}

interface Summary {
  total_trees: number;
  total_cycles: number;
  largest_tree_root: string;
}

interface ApiResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: Summary;
}

// ─── Constants ───────────────────────────────────────────────────────

const VALID_NODE_REGEX = /^([A-Z])->([A-Z])$/;

// ─── Processing Functions ────────────────────────────────────────────

function isValidEntry(entry: string): { valid: boolean; parent?: string; child?: string } {
  const trimmed = entry.trim();
  const match = trimmed.match(VALID_NODE_REGEX);
  if (!match) return { valid: false };
  const parent = match[1];
  const child = match[2];
  // Self-loop is invalid
  if (parent === child) return { valid: false };
  return { valid: true, parent, child };
}

function processEdges(
  data: string[]
): {
  validEdges: { parent: string; child: string }[];
  invalidEntries: string[];
  duplicateEdges: string[];
} {
  const invalidEntries: string[] = [];
  const validEdges: { parent: string; child: string }[] = [];
  const seenEdges = new Set<string>();
  const duplicateEdges: string[] = [];

  for (const entry of data) {
    const result = isValidEntry(entry);
    if (!result.valid) {
      invalidEntries.push(entry);
      continue;
    }

    const edgeKey = `${result.parent}->${result.child}`;
    if (seenEdges.has(edgeKey)) {
      // Only add to duplicate_edges once regardless of how many times it repeats
      if (!duplicateEdges.includes(edgeKey)) {
        duplicateEdges.push(edgeKey);
      }
    } else {
      seenEdges.add(edgeKey);
      validEdges.push({ parent: result.parent, child: result.child });
    }
  }

  return { validEdges, invalidEntries, duplicateEdges };
}

function buildGroups(
  edges: { parent: string; child: string }[]
): Map<string, { parent: string; child: string }[]> {
  // Build adjacency lists (parent -> children) and track all nodes
  const childrenOf = new Map<string, Set<string>>();
  const allNodes = new Set<string>();
  const firstAppearance = new Map<string, number>(); // track input order

  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    allNodes.add(edge.parent);
    allNodes.add(edge.child);
    if (!firstAppearance.has(edge.parent)) firstAppearance.set(edge.parent, i);
    if (!firstAppearance.has(edge.child)) firstAppearance.set(edge.child, i);

    if (!childrenOf.has(edge.parent)) childrenOf.set(edge.parent, new Set());
    childrenOf.get(edge.parent)!.add(edge.child);
  }

  // Find root candidates: nodes that never appear as a child
  const childNodes = new Set<string>();
  for (const edge of edges) {
    childNodes.add(edge.child);
  }

  // Collect all roots (both true roots and cycle roots) in input order
  const allRoots: string[] = [];
  const seenRoots = new Set<string>();

  // First: true roots (nodes that never appear as child) in input order
  for (const edge of edges) {
    const candidate = edge.parent;
    if (!childNodes.has(candidate) && !seenRoots.has(candidate)) {
      allRoots.push(candidate);
      seenRoots.add(candidate);
    }
  }

  // Group edges by their root
  const groups = new Map<string, { parent: string; child: string }[]>();
  const visited = new Set<string>();

  // BFS to find all edges reachable from a root
  function collectGroup(root: string): { parent: string; child: string }[] {
    const groupEdges: { parent: string; child: string }[] = [];
    const queue = [root];
    const groupNodes = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (groupNodes.has(current)) continue;
      groupNodes.add(current);
      visited.add(current);

      const children = childrenOf.get(current);
      if (children) {
        for (const child of children) {
          groupEdges.push({ parent: current, child });
          if (!groupNodes.has(child)) {
            queue.push(child);
          }
        }
      }
    }

    return groupEdges;
  }

  // Process from known roots first (already in input order)
  for (const root of allRoots) {
    if (!visited.has(root)) {
      const group = collectGroup(root);
      groups.set(root, group);
    }
  }

  // Handle pure cycles: nodes that all appear as children (no root found)
  // Process them in input order of their first appearance
  const cycleNodes: string[] = [];
  for (const node of allNodes) {
    if (!visited.has(node)) {
      cycleNodes.push(node);
    }
  }
  // Sort cycle nodes by first appearance in input
  cycleNodes.sort((a, b) => (firstAppearance.get(a) ?? Infinity) - (firstAppearance.get(b) ?? Infinity));

  for (const node of cycleNodes) {
    if (!visited.has(node)) {
      // This node is part of a pure cycle
      const groupEdges: { parent: string; child: string }[] = [];
      const queue = [node];
      const groupNodes = new Set<string>();

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (groupNodes.has(current)) continue;
        groupNodes.add(current);
        visited.add(current);

        const children = childrenOf.get(current);
        if (children) {
          for (const child of children) {
            groupEdges.push({ parent: current, child });
            if (!groupNodes.has(child)) {
              queue.push(child);
            }
          }
        }
      }

      // Use lexicographically smallest node as root for pure cycles
      const sortedNodes = Array.from(groupNodes).sort();
      if (!groups.has(sortedNodes[0])) {
        groups.set(sortedNodes[0], groupEdges);
      }
    }
  }

  return groups;
}

function hasCycle(edges: { parent: string; child: string }[], root: string): boolean {
  // Build adjacency map for this group
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.parent)) adj.set(edge.parent, []);
    adj.get(edge.parent)!.push(edge.child);
  }

  // DFS cycle detection from root
  const white = new Set<string>(); // unvisited
  const gray = new Set<string>(); // in current path

  // Collect all nodes in this group
  const allNodes = new Set<string>();
  for (const edge of edges) {
    allNodes.add(edge.parent);
    allNodes.add(edge.child);
  }
  for (const n of allNodes) white.add(n);

  function dfs(node: string): boolean {
    white.delete(node);
    gray.add(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (gray.has(neighbor)) {
        return true; // cycle found
      }
      if (white.has(neighbor)) {
        if (dfs(neighbor)) return true;
      }
    }

    gray.delete(node);
    return false;
  }

  return dfs(root);
}

function buildTree(edges: { parent: string; child: string }[], root: string): HierarchyNode {
  // Build adjacency map
  const childrenMap = new Map<string, string[]>();
  for (const edge of edges) {
    if (!childrenMap.has(edge.parent)) childrenMap.set(edge.parent, []);
    childrenMap.get(edge.parent)!.push(edge.child);
  }

  // Recursive tree building
  function buildNode(node: string): HierarchyNode {
    const children = childrenMap.get(node) || [];
    const result: HierarchyNode = {};
    for (const child of children.sort()) {
      result[child] = buildNode(child);
    }
    return result;
  }

  const tree: HierarchyNode = {};
  tree[root] = buildNode(root);
  return tree;
}

function calculateDepth(tree: HierarchyNode): number {
  // Depth = number of nodes on the longest root-to-leaf path
  function dfs(node: HierarchyNode): number {
    const keys = Object.keys(node);
    if (keys.length === 0) return 0; // empty {} means no more nodes
    let maxChild = 0;
    for (const key of keys) {
      maxChild = Math.max(maxChild, dfs(node[key]));
    }
    return 1 + maxChild;
  }

  return dfs(tree);
}

function processHierarchies(
  edges: { parent: string; child: string }[]
): { hierarchies: Hierarchy[]; summary: Summary } {
  // Handle diamond/multi-parent case: first-encountered parent wins
  const assignedParent = new Map<string, string>(); // child -> first parent
  const filteredEdges: { parent: string; child: string }[] = [];
  for (const edge of edges) {
    if (!assignedParent.has(edge.child)) {
      assignedParent.set(edge.child, edge.parent);
      filteredEdges.push(edge);
    }
    // else: silently discard (multi-parent)
  }

  const groups = buildGroups(filteredEdges);
  
  // Track first appearance order of each root in the edge list
  const firstAppearance = new Map<string, number>();
  for (let i = 0; i < edges.length; i++) {
    for (const node of [edges[i].parent, edges[i].child]) {
      if (!firstAppearance.has(node)) firstAppearance.set(node, i);
    }
  }

  const hierarchies: Hierarchy[] = [];
  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = '';
  let largestDepth = 0;

  // Collect all groups with their roots and build hierarchies
  const groupEntries: { root: string; hierarchy: Hierarchy }[] = [];

  for (const [root, groupEdges] of groups) {
    const cyclic = hasCycle(groupEdges, root);

    if (cyclic) {
      const h: Hierarchy = {
        root,
        tree: {},
        has_cycle: true,
      };
      groupEntries.push({ root, hierarchy: h });
      totalCycles++;
    } else {
      const tree = buildTree(groupEdges, root);
      const depth = calculateDepth(tree);

      const h: Hierarchy = {
        root,
        tree,
        depth,
      };
      groupEntries.push({ root, hierarchy: h });

      totalTrees++;

      if (depth > largestDepth || (depth === largestDepth && root < largestTreeRoot)) {
        largestDepth = depth;
        largestTreeRoot = root;
      }
    }
  }

  // Sort by first appearance in input
  groupEntries.sort((a, b) => {
    const posA = firstAppearance.get(a.root) ?? Infinity;
    const posB = firstAppearance.get(b.root) ?? Infinity;
    return posA - posB;
  });

  const sortedHierarchies = groupEntries.map(e => e.hierarchy);

  return {
    hierarchies: sortedHierarchies,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

// ─── Main Handler ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data: string[] = body.data;

    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: 'Invalid request: "data" must be an array' },
        { status: 400 }
      );
    }

    // Process edges
    const { validEdges, invalidEntries, duplicateEdges } = processEdges(data);

    // Build hierarchies
    const { hierarchies, summary } = processHierarchies(validEdges);

    const response: ApiResponse = {
      user_id: 'rahul_kumar_15082003',
      email_id: 'rahul.kumar@srmist.edu.in',
      college_roll_number: 'RA2311004010023',
      hierarchies,
      invalid_entries: invalidEntries,
      duplicate_edges: duplicateEdges,
      summary,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
