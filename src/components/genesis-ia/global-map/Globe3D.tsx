import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Sphere } from '@react-three/drei';
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
    case 'critical': return '#ef4444'; // Red
    case 'warning': return '#f59e0b'; // Yellow/Orange
    case 'good': return '#22c55e'; // Green
    default: return '#6b7280';
  }
};

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
  const [hovered, setHovered] = useState(false);
  
  const position = useMemo(() => 
    latLngToVector3(marker.latitude, marker.longitude, 2.02),
    [marker.latitude, marker.longitude]
  );
  
  const color = getStatusColor(marker.status);
  const scale = isSelected ? 0.06 : hovered ? 0.05 : 0.035;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse animation for critical markers
      if (marker.status === 'critical') {
        const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 1;
        meshRef.current.scale.setScalar(scale * pulse);
      }
    }
  });
  
  return (
    <group position={position}>
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
        scale={scale}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={hovered || isSelected ? 2 : 0.8}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={scale * 2}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial 
          color={color} 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
      {/* Tooltip on hover */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.15, 0]}
          center
          style={{
            transition: 'all 0.2s',
            opacity: 1,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-background/95 backdrop-blur-md border border-border rounded-lg px-3 py-2 shadow-xl min-w-[180px]">
            <p className="font-semibold text-sm truncate">{marker.name}</p>
            <p className="text-xs text-muted-foreground truncate">{marker.category}</p>
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">
                {marker.status === 'critical' ? 'Alta Oportunidade' : 
                 marker.status === 'warning' ? 'Média Oportunidade' : 'Baixa Oportunidade'}
              </span>
            </div>
            {marker.isNightBusiness && (
              <p className="text-xs text-purple-400 mt-1">🌙 Negócio Noturno</p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Earth globe component
const EarthGlobe = ({ autoRotate }: { autoRotate: boolean }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += 0.001;
    }
  });
  
  // Create a more detailed earth texture procedurally
  const earthMaterial = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Ocean gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0c1445');
    gradient.addColorStop(0.3, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(0.7, '#0f172a');
    gradient.addColorStop(1, '#0c1445');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);
    
    // Add some noise/texture
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const alpha = Math.random() * 0.1;
      ctx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    // Landmasses (simplified)
    ctx.fillStyle = 'rgba(30, 58, 95, 0.8)';
    
    // North America
    ctx.beginPath();
    ctx.ellipse(200, 150, 100, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // South America
    ctx.beginPath();
    ctx.ellipse(280, 320, 50, 100, 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Europe/Africa
    ctx.beginPath();
    ctx.ellipse(520, 200, 60, 150, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Asia
    ctx.beginPath();
    ctx.ellipse(700, 180, 150, 100, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Australia
    ctx.beginPath();
    ctx.ellipse(820, 350, 50, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.8,
      metalness: 0.1,
    });
  }, []);
  
  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <primitive object={earthMaterial} attach="material" />
    </mesh>
  );
};

// Atmosphere glow
const Atmosphere = () => {
  return (
    <Sphere args={[2.1, 64, 64]}>
      <meshBasicMaterial
        color="#4f9eff"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

// Grid lines on globe
const GlobeGrid = () => {
  const gridRef = useRef<THREE.LineSegments>(null);
  
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    
    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      for (let lng = 0; lng < 360; lng += 5) {
        const v1 = latLngToVector3(lat, lng, 2.01);
        const v2 = latLngToVector3(lat, lng + 5, 2.01);
        vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      }
    }
    
    // Longitude lines
    for (let lng = 0; lng < 360; lng += 30) {
      for (let lat = -80; lat < 80; lat += 5) {
        const v1 = latLngToVector3(lat, lng, 2.01);
        const v2 = latLngToVector3(lat + 5, lng, 2.01);
        vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
      }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, []);
  
  return (
    <lineSegments ref={gridRef} geometry={gridGeometry}>
      <lineBasicMaterial color="#334155" transparent opacity={0.3} />
    </lineSegments>
  );
};

// Camera controller
const CameraController = ({ autoRotate }: { autoRotate: boolean }) => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      autoRotate={autoRotate}
      autoRotateSpeed={0.5}
      minDistance={2.5}
      maxDistance={10}
      dampingFactor={0.05}
      enableDamping={true}
    />
  );
};

// Main scene
const GlobeScene = ({ 
  markers, 
  onMarkerClick, 
  autoRotate, 
  showAtmosphere,
  selectedMarkerId 
}: Globe3DProps & { selectedMarkerId: string | null }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f9eff" />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      <EarthGlobe autoRotate={autoRotate} />
      <GlobeGrid />
      
      {showAtmosphere && <Atmosphere />}
      
      {markers.map((marker) => (
        <MarkerPoint
          key={marker.id}
          marker={marker}
          onClick={() => onMarkerClick(marker)}
          isSelected={marker.id === selectedMarkerId}
        />
      ))}
      
      <CameraController autoRotate={autoRotate} />
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
    <div className="w-full h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 5, 15]} />
        <GlobeScene
          markers={markers}
          onMarkerClick={handleMarkerClick}
          autoRotate={autoRotate}
          showAtmosphere={showAtmosphere}
          selectedMarkerId={selectedMarkerId}
        />
      </Canvas>
    </div>
  );
};
