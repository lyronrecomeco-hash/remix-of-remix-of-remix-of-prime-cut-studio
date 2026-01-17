import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { BusinessMarker } from './types';

interface Globe3DProps {
  markers: BusinessMarker[];
  onMarkerClick: (marker: BusinessMarker) => void;
  autoRotate: boolean;
  showAtmosphere: boolean;
}

// Convert lat/lng to 3D position on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

// Status color mapping
const getStatusColor = (status: BusinessMarker['status']): string => {
  switch (status) {
    case 'critical': return '#ef4444';
    case 'warning': return '#f59e0b';
    case 'good': return '#22c55e';
    default: return '#6b7280';
  }
};

// Clean atmosphere shader - Apple Maps style
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 lightDirection;
  
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    
    // Fresnel effect - stronger at edges
    float fresnel = 1.0 - dot(viewDirection, vNormal);
    fresnel = pow(fresnel, 3.5);
    
    // Soft atmosphere color gradient
    vec3 atmosphereColor = mix(
      vec3(0.4, 0.7, 1.0),  // Light blue
      vec3(0.2, 0.5, 0.9),  // Deeper blue
      fresnel
    );
    
    // Very soft, subtle glow
    float alpha = fresnel * 0.5;
    alpha = smoothstep(0.0, 1.0, alpha);
    
    gl_FragColor = vec4(atmosphereColor, alpha * 0.6);
  }
`;

// Individual marker component
const MarkerPoint = ({ 
  marker, 
  onClick,
  isSelected 
}: { 
  marker: BusinessMarker; 
  onClick: () => void;
  isSelected: boolean;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const position = useMemo(() => 
    latLngToVector3(marker.latitude, marker.longitude, 2.01),
    [marker.latitude, marker.longitude]
  );
  
  const color = getStatusColor(marker.status);
  const baseScale = isSelected ? 0.04 : hovered ? 0.035 : 0.025;
  
  useFrame((state) => {
    if (meshRef.current) {
      if (marker.status === 'critical') {
        const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.12 + 1;
        meshRef.current.scale.setScalar(baseScale * pulse);
      }
    }
    if (ringRef.current && (hovered || isSelected)) {
      ringRef.current.rotation.z += 0.015;
    }
  });
  
  return (
    <group position={position}>
      {/* Main dot */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={baseScale}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={baseScale * 1.8}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Tooltip on hover */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.1, 0]}
          center
          style={{
            transition: 'all 0.15s ease-out',
            opacity: 1,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{marker.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{marker.category}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs" style={{ color }}>
                {marker.status === 'critical' ? 'Alta Oportunidade' : 
                 marker.status === 'warning' ? 'Média Oportunidade' : 'Baixa Oportunidade'}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Clean realistic Earth
const RealisticEarth = ({ autoRotate }: { autoRotate: boolean }) => {
  const globeRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load NASA textures
  const [dayMap, cloudsMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_clouds.jpg',
  ]);
  
  useEffect(() => {
    dayMap.anisotropy = 16;
    cloudsMap.anisotropy = 8;
  }, [dayMap, cloudsMap]);
  
  useFrame(() => {
    if (autoRotate && globeRef.current) {
      globeRef.current.rotation.y += 0.0004;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.00015;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Earth */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Clouds - subtle */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.008, 48, 48]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>
      
      {/* Single clean atmosphere glow */}
      <mesh scale={1.02}>
        <sphereGeometry args={[2, 48, 48]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{
            lightDirection: { value: new THREE.Vector3(1, 0.5, 1).normalize() }
          }}
        />
      </mesh>
    </group>
  );
};

// Camera controller
const CameraController = () => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={7}
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
    />
  );
};

// Main scene
const GlobeScene = ({ 
  markers, 
  onMarkerClick, 
  autoRotate, 
  selectedMarkerId 
}: Omit<Globe3DProps, 'showAtmosphere'> & { selectedMarkerId: string | null }) => {
  return (
    <>
      {/* Clean lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.5} 
        color="#ffffff"
      />
      <directionalLight 
        position={[-3, -1, -3]} 
        intensity={0.3} 
        color="#88aaff"
      />
      
      {/* Minimal stars */}
      <Stars 
        radius={300} 
        depth={50} 
        count={2000} 
        factor={2} 
        saturation={0} 
        fade 
        speed={0.3}
      />
      
      <Suspense fallback={null}>
        <RealisticEarth autoRotate={autoRotate} />
      </Suspense>
      
      {markers.map((marker) => (
        <MarkerPoint
          key={marker.id}
          marker={marker}
          onClick={() => onMarkerClick(marker)}
          isSelected={marker.id === selectedMarkerId}
        />
      ))}
      
      <CameraController />
    </>
  );
};

export const Globe3D = ({ markers, onMarkerClick, autoRotate, showAtmosphere }: Globe3DProps) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  
  const handleMarkerClick = (marker: BusinessMarker) => {
    setSelectedMarkerId(marker.id);
    onMarkerClick(marker);
  };

  return (
    <div className="w-full h-full bg-[#0a0f1a]">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 45
        }}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <GlobeScene
            markers={markers}
            onMarkerClick={handleMarkerClick}
            autoRotate={autoRotate}
            selectedMarkerId={selectedMarkerId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
