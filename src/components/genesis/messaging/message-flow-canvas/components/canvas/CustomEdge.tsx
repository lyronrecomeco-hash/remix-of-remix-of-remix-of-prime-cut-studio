// Custom Edge - Clean Modern Flow Edge
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  EdgeProps,
} from '@xyflow/react';
import { cn } from '@/lib/utils';

interface CustomEdgeData {
  label?: string;
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
}: EdgeProps) => {
  const edgeData = data as CustomEdgeData;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      {/* Glow effect when selected */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="hsl(var(--primary) / 0.3)"
          strokeWidth={12}
          strokeLinecap="round"
          style={{ filter: 'blur(8px)' }}
        />
      )}

      {/* Main edge path */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 2.5,
          stroke: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.4)',
          strokeLinecap: 'round',
          transition: 'stroke 0.2s ease',
        }}
      />

      {/* Animated flow dot */}
      <circle r="4" fill="hsl(var(--primary))">
        <animateMotion 
          dur="2s" 
          repeatCount="indefinite" 
          path={edgePath}
        />
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Arrow head */}
      <circle 
        cx={targetX} 
        cy={targetY} 
        r="6" 
        fill="hsl(var(--primary))"
        style={{
          filter: selected ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : 'none',
        }}
      />

      {/* Label renderer */}
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            className={cn(
              "absolute pointer-events-none nodrag nopan",
              "transform -translate-x-1/2 -translate-y-1/2"
            )}
            style={{
              left: labelX,
              top: labelY,
            }}
          >
            <div className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              "bg-card/95 backdrop-blur-sm border border-border/60",
              "shadow-lg text-muted-foreground",
              selected && "border-primary/50 ring-2 ring-primary/20 text-foreground"
            )}>
              {edgeData.label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
