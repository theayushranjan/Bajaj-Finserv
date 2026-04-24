'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  GitBranch,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Cpu,
  TreePine,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Layers,
  Ban,
} from 'lucide-react';

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

const EXAMPLE_DATA = `A->B, A->C, B->D, C->E, E->F, X->Y, Y->Z, Z->X, P->Q, Q->R, G->H, G->H, G->I, hello, 1->2, A->`;

const TREE_COLORS = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', node: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', node: 'bg-violet-100 text-violet-800 border-violet-300', dot: 'bg-violet-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', node: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', node: 'bg-rose-100 text-rose-800 border-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', node: 'bg-cyan-100 text-cyan-800 border-cyan-300', dot: 'bg-cyan-500' },
  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', node: 'bg-orange-100 text-orange-800 border-orange-300', dot: 'bg-orange-500' },
];

// ─── Tree Visualization Component ────────────────────────────────────

function TreeNode({ label, nodeChildren, depth = 0, colorIdx = 0 }: {
  label: string;
  nodeChildren: HierarchyNode;
  depth?: number;
  colorIdx?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const childKeys = Object.keys(nodeChildren);
  const hasChildren = childKeys.length > 0;
  const color = TREE_COLORS[colorIdx % TREE_COLORS.length];
  const delay = depth * 80;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="flex flex-col"
    >
      <div className="flex items-center gap-2">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors shrink-0"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && (
          <div className="w-5 flex justify-center shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${color.dot}`} />
          </div>
        )}
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-semibold border ${color.node} transition-all hover:shadow-sm`}>
          {label}
        </span>
      </div>

      {hasChildren && expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-7 pl-4 border-l-2 border-dashed border-muted-foreground/20 mt-1 flex flex-col gap-1.5"
        >
          {childKeys.sort().map((key) => (
            <TreeNode
              key={key}
              label={key}
              nodeChildren={nodeChildren[key]}
              depth={depth + 1}
              colorIdx={colorIdx}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Cycle Visualization Component ───────────────────────────────────

function CycleVisualization({ root, edges }: { root: string; edges: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center gap-3 py-4"
    >
      <div className="relative flex items-center justify-center gap-2">
        <div className="animate-spin-slow absolute -inset-4 rounded-full border-2 border-dashed border-orange-300/60" />
        {edges.map((edge, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-semibold bg-orange-100 text-orange-800 border border-orange-300">
              {edge}
            </span>
            {i < edges.length - 1 && (
              <ArrowRight className="inline w-3.5 h-3.5 text-orange-400 mx-1" />
            )}
          </motion.span>
        ))}
        <ArrowRight className="w-4 h-4 text-orange-500 mx-1" />
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-mono font-semibold bg-orange-200 text-orange-900 border border-orange-400">
          {root}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Hierarchy Card Component ────────────────────────────────────────

function HierarchyCard({ hierarchy, index }: { hierarchy: Hierarchy; index: number }) {
  const colorIdx = index % TREE_COLORS.length;
  const color = TREE_COLORS[colorIdx];

  // For cycles, extract edges from root
  if (hierarchy.has_cycle) {
    // We need to show cycle info
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Card className={`overflow-hidden border-2 ${color.border}`}>
          <CardHeader className={`pb-3 ${color.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-100">
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-orange-800">
                    Root: {hierarchy.root}
                  </CardTitle>
                  <CardDescription className="text-xs text-orange-600/70">
                    Cyclic group detected
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs font-semibold gap-1">
                <AlertCircle className="w-3 h-3" />
                CYCLE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-4 px-5">
            <CycleVisualization root={hierarchy.root} edges={[]} />
            <div className="mt-2 p-3 rounded-lg bg-orange-50/50 border border-orange-100">
              <p className="text-xs text-orange-700 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                This group contains a cycle. The node <strong>{hierarchy.root}</strong> was assigned as root (lexicographically smallest).
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const tree = hierarchy.tree as HierarchyNode;
  const rootKey = hierarchy.root;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden border-2 ${color.border} hover:shadow-lg transition-shadow duration-300`}>
        <CardHeader className={`pb-3 ${color.bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${color.node}`}>
                <TreePine className={`w-4 h-4 ${color.text}`} />
              </div>
              <div>
                <CardTitle className={`text-base font-bold ${color.text}`}>
                  Root: {hierarchy.root}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Valid hierarchy tree
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`bg-white/80 ${color.text} border ${color.border} text-xs font-semibold gap-1`}>
                <Layers className="w-3 h-3" />
                Depth: {hierarchy.depth}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-4 px-5">
          <div className="flex flex-col gap-0.5">
            <TreeNode
              label={rootKey}
              nodeChildren={tree[rootKey] || {}}
              depth={0}
              colorIdx={colorIdx}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Summary Stats Component ─────────────────────────────────────────

function SummaryCard({ summary }: { summary: Summary }) {
  const stats = [
    {
      label: 'Valid Trees',
      value: summary.total_trees,
      icon: <TreePine className="w-5 h-5" />,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Cycles Detected',
      value: summary.total_cycles,
      icon: <RotateCcw className="w-5 h-5" />,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      label: 'Largest Tree',
      value: summary.largest_tree_root || '-',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      border: 'border-violet-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-2 border-primary/20 glow-primary">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Analysis Summary</CardTitle>
              <CardDescription className="text-xs">Overview of the processed hierarchy data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
                className={`p-4 rounded-xl border ${stat.border} ${stat.bg} text-center`}
              >
                <div className={`${stat.color} mb-2 flex justify-center`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Metadata Component ──────────────────────────────────────────────

function MetadataSection({ response }: { response: ApiResponse }) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const fields = [
    { label: 'User ID', value: response.user_id },
    { label: 'Email', value: response.email_id },
    { label: 'Roll Number', value: response.college_roll_number },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <Cpu className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Response Metadata</CardTitle>
              <CardDescription className="text-xs">Identity fields from the API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2.5">
            {fields.map((field) => (
              <div
                key={field.label}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50 group hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 w-24">
                    {field.label}
                  </span>
                  <span className="text-sm font-mono text-foreground truncate">
                    {field.value}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(field.value, field.label)}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-muted"
                >
                  {copied === field.label ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Invalid Entries Component ───────────────────────────────────────

function InvalidEntriesSection({ entries }: { entries: string[] }) {
  if (entries.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-red-200/60">
        <CardHeader className="pb-3 bg-red-50/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100">
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-red-800">Invalid Entries</CardTitle>
              <CardDescription className="text-xs text-red-600/70">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'} did not match the valid format (X-&gt;Y)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {entries.map((entry, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-mono text-xs">
                  &ldquo;{entry}&rdquo;
                </Badge>
              </motion.span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Duplicate Edges Component ───────────────────────────────────────

function DuplicateEdgesSection({ edges }: { edges: string[] }) {
  if (edges.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-amber-200/60">
        <CardHeader className="pb-3 bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100">
              <Copy className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-amber-800">Duplicate Edges</CardTitle>
              <CardDescription className="text-xs text-amber-600/70">
                {edges.length} {edges.length === 1 ? 'edge' : 'edges'} appeared more than once
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {edges.map((edge, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-mono text-xs">
                  {edge}
                </Badge>
              </motion.span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── JSON Response Component ─────────────────────────────────────────

function JsonResponse({ response }: { response: ApiResponse }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [response]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
                <Cpu className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base font-bold">Raw JSON Response</CardTitle>
                <CardDescription className="text-xs">Complete API response payload</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="text-xs gap-1.5">
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="bg-slate-950 text-slate-50 rounded-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed custom-scrollbar max-h-80 overflow-y-auto">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
      {[1, 2].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24 ml-7" />
            <Skeleton className="h-8 w-20 ml-14" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────────

export default function Home() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const parseInput = useCallback((text: string): string[] => {
    return text
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, []);

  const handleSubmit = useCallback(async () => {
    const data = parseInput(input);
    if (data.length === 0) {
      setError('Please enter at least one node relationship (e.g., A->B)');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);
    setResponseTime(null);

    const start = performance.now();

    try {
      const res = await fetch('/api/bfhl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      const elapsed = Math.round(performance.now() - start);
      setResponseTime(elapsed);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const json = await res.json();
      setResponse(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [input, parseInput]);

  const handleLoadExample = useCallback(() => {
    setInput(EXAMPLE_DATA);
    setError(null);
    setResponse(null);
  }, []);

  const handleClear = useCallback(() => {
    setInput('');
    setError(null);
    setResponse(null);
    setResponseTime(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header className="hero-gradient border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">SRM Full Stack Challenge</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight gradient-text mb-3">
              Hierarchy Analyzer
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build hierarchical trees from node relationships, detect cycles, and visualize the structure.
              Enter edges in the format <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">X-&gt;Y</code> to get started.
            </p>
          </motion.div>
        </div>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ── Input Section ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-2 border-primary/20 glow-primary">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Input Data</CardTitle>
                  <CardDescription className="text-xs">
                    Enter node relationships separated by commas, semicolons, or new lines
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Example: A->B, A->C, B->D, C->E, E->F\nYou can also use new lines:\nX->Y\nY->Z`}
                  className="font-mono text-sm min-h-[120px] resize-y leading-relaxed bg-muted/20 focus:bg-white transition-colors"
                  disabled={loading}
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/60 font-medium">
                  {parseInput(input).length} {parseInput(input).length === 1 ? 'entry' : 'entries'}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={loading || parseInput(input).length === 0}
                  className="flex-1 sm:flex-none gap-2 font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4" />
                      Analyze Hierarchy
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleLoadExample}
                    disabled={loading}
                    className="text-xs gap-1.5"
                    size="sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    Load Example
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    disabled={loading}
                    className="text-xs gap-1.5"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
                {!loading && responseTime !== null && (
                  <div className="hidden sm:flex items-center gap-1.5 ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                    <span className="text-xs text-emerald-600 font-medium">{responseTime}ms</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Error Display ──────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive" className="border-red-200">
                <AlertCircle className="w-4 h-4" />
                <AlertTitle className="font-semibold text-sm">Analysis Failed</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading Skeleton ───────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Response Display ───────────────────────────────────── */}
        <AnimatePresence>
          {response && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <SummaryCard summary={response.summary} />

              {/* Response Time on mobile */}
              {responseTime !== null && (
                <div className="sm:hidden flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                  <span className="text-xs text-emerald-600 font-medium">
                    Response time: {responseTime}ms
                  </span>
                </div>
              )}

              <Separator className="opacity-40" />

              {/* Metadata */}
              <MetadataSection response={response} />

              <Separator className="opacity-40" />

              {/* Hierarchies */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TreePine className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-bold">Hierarchy Trees</h2>
                  <Badge variant="secondary" className="text-xs">
                    {response.hierarchies.length} {response.hierarchies.length === 1 ? 'group' : 'groups'}
                  </Badge>
                </div>
                <div className="grid gap-4">
                  {response.hierarchies.map((h, i) => (
                    <HierarchyCard key={h.root} hierarchy={h} index={i} />
                  ))}
                </div>
              </div>

              {/* Invalid Entries */}
              {(response.invalid_entries.length > 0 || response.duplicate_edges.length > 0) && (
                <>
                  <Separator className="opacity-40" />
                  <InvalidEntriesSection entries={response.invalid_entries} />
                  <DuplicateEdgesSection edges={response.duplicate_edges} />
                </>
              )}

              <Separator className="opacity-40" />

              {/* Raw JSON */}
              <JsonResponse response={response} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Empty State ────────────────────────────────────────── */}
        {!response && !loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
              <GitBranch className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">
              No data analyzed yet
            </h3>
            <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
              Enter your node relationships above and click &quot;Analyze Hierarchy&quot; to see the results,
              or load the example data to try it out.
            </p>
          </motion.div>
        )}
      </main>

      {/* ── Sticky Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-muted/20 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Hierarchy Analyzer &mdash; SRM Full Stack Engineering Challenge
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Built with</span>
              <span className="font-semibold">Next.js</span>
              <span>&bull;</span>
              <span className="font-semibold">TypeScript</span>
              <span>&bull;</span>
              <span className="font-semibold">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
