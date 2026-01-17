import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
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
    latLngToVector3(marker.latitude, marker.longitude, 2.02),
    [marker.latitude, marker.longitude]
  );
  
  const color = getStatusColor(marker.status);
  const baseScale = isSelected ? 0.045 : hovered ? 0.04 : 0.028;
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle pulse animation for critical markers
      if (marker.status === 'critical') {
        const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.15 + 1;
        meshRef.current.scale.setScalar(baseScale * pulse);
      }
    }
    if (ringRef.current && (hovered || isSelected)) {
      ringRef.current.rotation.z += 0.02;
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
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Outer glow ring when hovered/selected */}
      {(hovered || isSelected) && (
        <mesh ref={ringRef} scale={baseScale * 2.5}>
          <ringGeometry args={[0.8, 1, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Tooltip on hover */}
      {(hovered || isSelected) && (
        <Html
          position={[0, 0.12, 0]}
          center
          style={{
            transition: 'all 0.2s',
            opacity: 1,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-2xl min-w-[200px]">
            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{marker.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{marker.category}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span 
                className="w-2 h-2 rounded-full shadow-lg" 
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              />
              <span className="text-xs font-medium" style={{ color }}>
                {marker.status === 'critical' ? 'Alta Oportunidade' : 
                 marker.status === 'warning' ? 'Média Oportunidade' : 'Baixa Oportunidade'}
              </span>
            </div>
            {marker.isNightBusiness && (
              <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                <span>🌙</span> Negócio Noturno
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

// Realistic Earth globe with procedural texture
const EarthGlobe = ({ autoRotate }: { autoRotate: boolean }) => {
  const globeRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (autoRotate) {
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.0008;
      }
      if (cloudsRef.current) {
        cloudsRef.current.rotation.y += 0.0003;
      }
    }
  });
  
  // Create realistic Earth texture
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    // Deep ocean gradient
    const oceanGradient = ctx.createLinearGradient(0, 0, 0, 1024);
    oceanGradient.addColorStop(0, '#0a1628');
    oceanGradient.addColorStop(0.2, '#0d2847');
    oceanGradient.addColorStop(0.4, '#0f3460');
    oceanGradient.addColorStop(0.5, '#1a4d7c');
    oceanGradient.addColorStop(0.6, '#0f3460');
    oceanGradient.addColorStop(0.8, '#0d2847');
    oceanGradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = oceanGradient;
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Add ocean depth variation
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const alpha = Math.random() * 0.08;
      const size = Math.random() * 3 + 1;
      ctx.fillStyle = `rgba(30, 80, 140, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Land color function
    const drawLand = (path: Path2D, baseColor: string, highlightColor: string) => {
      // Main land
      const gradient = ctx.createRadialGradient(1024, 512, 0, 1024, 512, 1024);
      gradient.addColorStop(0, highlightColor);
      gradient.addColorStop(1, baseColor);
      ctx.fillStyle = gradient;
      ctx.fill(path);
      
      // Add terrain texture
      ctx.save();
      ctx.clip(path);
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 1024;
        const alpha = Math.random() * 0.15;
        ctx.fillStyle = `rgba(60, 100, 60, ${alpha})`;
        ctx.fillRect(x, y, Math.random() * 4 + 1, Math.random() * 4 + 1);
      }
      ctx.restore();
    };
    
    // North America
    const northAmerica = new Path2D();
    northAmerica.moveTo(180, 180);
    northAmerica.bezierCurveTo(280, 120, 380, 150, 420, 200);
    northAmerica.bezierCurveTo(450, 280, 420, 350, 380, 420);
    northAmerica.bezierCurveTo(350, 460, 300, 480, 280, 470);
    northAmerica.bezierCurveTo(220, 450, 180, 400, 160, 340);
    northAmerica.bezierCurveTo(140, 280, 120, 220, 180, 180);
    drawLand(northAmerica, '#1a3d2e', '#2d5a45');
    
    // South America
    const southAmerica = new Path2D();
    southAmerica.moveTo(340, 500);
    southAmerica.bezierCurveTo(380, 520, 400, 580, 390, 660);
    southAmerica.bezierCurveTo(380, 740, 350, 820, 320, 850);
    southAmerica.bezierCurveTo(290, 870, 270, 840, 280, 780);
    southAmerica.bezierCurveTo(290, 700, 300, 620, 310, 540);
    southAmerica.bezierCurveTo(320, 510, 330, 495, 340, 500);
    drawLand(southAmerica, '#1a3d2e', '#2d5a45');
    
    // Europe
    const europe = new Path2D();
    europe.moveTo(920, 200);
    europe.bezierCurveTo(980, 180, 1050, 200, 1100, 240);
    europe.bezierCurveTo(1120, 280, 1100, 340, 1050, 360);
    europe.bezierCurveTo(1000, 380, 940, 360, 900, 320);
    europe.bezierCurveTo(870, 280, 880, 230, 920, 200);
    drawLand(europe, '#1f4035', '#2d5a45');
    
    // Africa
    const africa = new Path2D();
    africa.moveTo(920, 380);
    africa.bezierCurveTo(1000, 360, 1080, 400, 1120, 480);
    africa.bezierCurveTo(1150, 560, 1130, 660, 1080, 720);
    africa.bezierCurveTo(1020, 780, 940, 760, 900, 700);
    africa.bezierCurveTo(860, 640, 850, 560, 870, 480);
    africa.bezierCurveTo(890, 420, 880, 390, 920, 380);
    drawLand(africa, '#3d5c3a', '#4a7048');
    
    // Asia
    const asia = new Path2D();
    asia.moveTo(1120, 180);
    asia.bezierCurveTo(1280, 140, 1480, 180, 1600, 260);
    asia.bezierCurveTo(1700, 320, 1720, 420, 1680, 500);
    asia.bezierCurveTo(1620, 580, 1500, 560, 1400, 520);
    asia.bezierCurveTo(1300, 480, 1200, 440, 1160, 380);
    asia.bezierCurveTo(1120, 320, 1100, 240, 1120, 180);
    drawLand(asia, '#1a3d2e', '#2d5a45');
    
    // Australia
    const australia = new Path2D();
    australia.moveTo(1560, 640);
    australia.bezierCurveTo(1640, 620, 1720, 660, 1760, 720);
    australia.bezierCurveTo(1780, 780, 1740, 840, 1680, 860);
    australia.bezierCurveTo(1600, 880, 1520, 840, 1500, 780);
    australia.bezierCurveTo(1480, 720, 1500, 660, 1560, 640);
    drawLand(australia, '#5c4a32', '#7a6242');
    
    // Add ice caps
    ctx.fillStyle = 'rgba(230, 240, 250, 0.9)';
    ctx.beginPath();
    ctx.ellipse(1024, 60, 800, 80, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(1024, 970, 600, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle city lights (glowing dots)
    const cities = [
      [300, 350], [350, 280], [280, 400], // NA
      [330, 550], [320, 620], // SA
      [950, 280], [980, 320], [1020, 290], // EU
      [980, 500], [1020, 560], // AF
      [1300, 320], [1450, 380], [1520, 300], [1600, 350], // Asia
      [1620, 720], [1680, 750], // AU
    ];
    
    cities.forEach(([x, y]) => {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 15);
      grd.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
      grd.addColorStop(0.5, 'rgba(255, 150, 50, 0.2)');
      grd.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);
  
  // Create bump map for terrain relief
  const bumpTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1024, 512);
    
    // Add noise for terrain
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const brightness = Math.floor(Math.random() * 60);
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.fillRect(x, y, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
  
  // Clouds texture
  const cloudsTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, 2048, 1024);
    
    // Draw cloud formations
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 2048;
      const y = Math.random() * 1024;
      const radius = Math.random() * 80 + 20;
      const opacity = Math.random() * 0.3 + 0.1;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <group ref={globeRef}>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial 
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Clouds layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.025, 64, 64]} />
        <meshStandardMaterial 
          map={cloudsTexture}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>
      
      {/* Atmosphere rim */}
      <mesh>
        <sphereGeometry args={[2.08, 64, 64]} />
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          uniforms={{
            glowColor: { value: new THREE.Color('#4a9eff') }
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(glowColor, intensity * 0.4);
            }
          `}
        />
      </mesh>
    </group>
  );
};

// Camera controller
const CameraController = ({ autoRotate }: { autoRotate: boolean }) => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      autoRotate={false}
      minDistance={2.8}
      maxDistance={8}
      dampingFactor={0.08}
      enableDamping={true}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
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
      {/* Lighting setup for realistic look */}
      <ambientLight intensity={0.15} />
      <directionalLight 
        position={[5, 3, 5]} 
        intensity={1.8} 
        color="#fff5e6"
        castShadow
      />
      <directionalLight 
        position={[-5, -2, -5]} 
        intensity={0.3} 
        color="#4a9eff"
      />
      <pointLight position={[0, 10, 0]} intensity={0.2} color="#fff" />
      
      {/* Subtle star background */}
      <Stars 
        radius={300} 
        depth={100} 
        count={3000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.3}
      />
      
      <EarthGlobe autoRotate={autoRotate} />
      
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
    <div className="w-full h-full rounded-xl overflow-hidden" style={{ background: 'radial-gradient(ellipse at center, #0f1729 0%, #030712 100%)' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
      >
        <color attach="background" args={['#030712']} />
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
