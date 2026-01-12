// Custom Edge - Modern Animated Bezier Edge
import { memo, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
  useReactFlow,
} from '@xyflow/react';
import { X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CustomEdgeData {
  label?: string;
  animated?: boolean;
}

export const CustomEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
  markerEnd,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const edgeData = data as CustomEdgeData;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.3,
  });

  const onEdgeDelete = useCallback(() => {
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  }, [id, setEdges]);

  return (
    <>
      {/* Glow effect layer */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 12,
          stroke: selected ? 'hsl(var(--primary) / 0.3)' : 'transparent',
          filter: selected ? 'blur(4px)' : 'none',
        }}
      />
      
      {/* Main edge - solid line with gradient */}
      <defs>
        <linearGradient id={`edge-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(142 76% 36%)" stopOpacity="0.9" />
        </linearGradient>
        
        {/* Animated dash pattern */}
        <pattern id={`flow-pattern-${id}`} patternUnits="userSpaceOnUse" width="16" height="2">
          <circle cx="2" cy="1" r="1.5" fill="hsl(var(--primary))">
            <animate 
              attributeName="cx" 
              values="0;16" 
              dur="0.8s" 
              repeatCount="indefinite"
            />
          </circle>
        </pattern>
      </defs>

      {/* Base solid edge */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 3,
          stroke: `url(#edge-gradient-${id})`,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
      />

      {/* Animated particles overlay */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 6,
          stroke: 'transparent',
          strokeLinecap: 'round',
        }}
        markerEnd={markerEnd}
      />
      
      {/* Flow animation - moving dot */}
      <circle r="4" fill="hsl(var(--primary))">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        <animate
          attributeName="r"
          values="3;5;3"
          dur="1s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Secondary trail particle */}
      <circle r="2.5" fill="hsl(142 76% 36%)">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} begin="0.3s" />
        <animate
          attributeName="opacity"
          values="0.4;0.8;0.4"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Label and delete button */}
      <EdgeLabelRenderer>
        <div
          className={cn(
            "absolute pointer-events-auto nodrag nopan",
            "transform -translate-x-1/2 -translate-y-1/2"
          )}
          style={{
            left: labelX,
            top: labelY,
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1"
          >
            {/* Connection indicator */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              "bg-card/90 backdrop-blur-sm border border-border/50",
              "shadow-lg text-xs font-medium",
              selected && "border-primary/50 ring-2 ring-primary/20"
            )}>
              <Zap className="w-3 h-3 text-primary" />
              {edgeData?.label && (
                <span className="text-muted-foreground">{edgeData.label}</span>
              )}
            </div>

            {/* Delete button - shows on hover/select */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: selected ? 1 : 0 }}
              onClick={onEdgeDelete}
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                "bg-destructive text-destructive-foreground",
                "shadow-lg hover:scale-110 transition-transform"
              )}
            >
              <X className="w-3 h-3" />
            </motion.button>
          </motion.div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
