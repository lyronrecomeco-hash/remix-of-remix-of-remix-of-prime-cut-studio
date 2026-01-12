// Custom Edge - Ultra Modern Animated Flow Edge
import { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
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
  markerEnd,
}: EdgeProps) => {
  const edgeData = data as CustomEdgeData;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      {/* Gradient Definitions */}
      <defs>
        {/* Main gradient - smooth blue to green transition */}
        <linearGradient id={`edge-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(217 91% 60%)" />
          <stop offset="50%" stopColor="hsl(190 90% 50%)" />
          <stop offset="100%" stopColor="hsl(142 76% 46%)" />
        </linearGradient>
        
        {/* Glow filter for selected state */}
        <filter id={`edge-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Animated particle gradient */}
        <linearGradient id={`particle-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(217 91% 70%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(142 76% 60%)" stopOpacity="1" />
          <stop offset="100%" stopColor="hsl(142 76% 46%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Glow effect layer - only when selected */}
      {selected && (
        <BaseEdge
          path={edgePath}
          style={{
            strokeWidth: 10,
            stroke: 'hsl(217 91% 60% / 0.3)',
            filter: 'blur(6px)',
            strokeLinecap: 'round',
          }}
        />
      )}
      
      {/* Main edge - solid gradient line */}
      <BaseEdge
        path={edgePath}
        style={{
          strokeWidth: 3,
          stroke: `url(#edge-gradient-${id})`,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        markerEnd={markerEnd}
      />

      {/* Animated flow particle - primary */}
      <circle r="5" fill="hsl(142 76% 50%)">
        <animateMotion 
          dur="1.5s" 
          repeatCount="indefinite" 
          path={edgePath}
        />
        <animate
          attributeName="r"
          values="4;6;4"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.7;1;0.7"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Secondary flow particle - follows behind */}
      <circle r="3" fill="hsl(190 90% 55%)">
        <animateMotion 
          dur="1.5s" 
          repeatCount="indefinite" 
          path={edgePath}
          begin="0.5s"
        />
        <animate
          attributeName="opacity"
          values="0.5;0.9;0.5"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Tertiary flow particle - smallest */}
      <circle r="2" fill="hsl(217 91% 65%)">
        <animateMotion 
          dur="1.5s" 
          repeatCount="indefinite" 
          path={edgePath}
          begin="1s"
        />
        <animate
          attributeName="opacity"
          values="0.4;0.8;0.4"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

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
