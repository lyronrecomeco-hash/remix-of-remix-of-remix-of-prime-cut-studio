import { useRef, useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture, Environment } from '@react-three/drei';
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

// Fresnel shader for realistic atmosphere glow
const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  uniform float power;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), power);
    
    vec3 atmosphereColor = glowColor;
    float alpha = fresnel * intensity;
    
    // Add subtle gradient from edge
    alpha *= smoothstep(0.0, 0.5, fresnel);
    
    gl_FragColor = vec4(atmosphereColor, alpha);
  }
`;

// Inner atmosphere glow shader
const innerAtmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    
    vec3 innerColor = mix(glowColor, vec3(0.6, 0.8, 1.0), 0.3);
    float alpha = fresnel * intensity * 0.6;
    
    gl_FragColor = vec4(innerColor, alpha);
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
    latLngToVector3(marker.latitude, marker.longitude, 2.02),
    [marker.latitude, marker.longitude]
  );
  
  const color = getStatusColor(marker.status);
  const baseScale = isSelected ? 0.045 : hovered ? 0.04 : 0.028;
  
  useFrame((state) => {
    if (meshRef.current) {
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

// Realistic Earth with NASA textures
const RealisticEarth = ({ autoRotate }: { autoRotate: boolean }) => {
  const globeRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // Load real NASA textures
  const [dayMap, nightMap, cloudsMap] = useTexture([
    '/textures/earth_daymap.jpg',
    '/textures/earth_nightmap.jpg',
    '/textures/earth_clouds.jpg',
  ]);
  
  // Configure textures
  useEffect(() => {
    [dayMap, nightMap, cloudsMap].forEach(texture => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.anisotropy = 16;
    });
  }, [dayMap, nightMap, cloudsMap]);
  
  // Create procedural bump map for terrain relief
  const bumpMap = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Base dark
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size * 2, size);
    
    // Add terrain noise
    const imageData = ctx.getImageData(0, 0, size * 2, size);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 40 + Math.sin(i * 0.001) * 20;
      data[i] = noise;
      data[i + 1] = noise;
      data[i + 2] = noise;
      data[i + 3] = 255;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);
  
  // Create specular map for ocean reflections
  const specularMap = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Draw based on day texture - oceans bright, land dark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size * 2, size);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }, []);
  
  useFrame((state) => {
    if (autoRotate) {
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.0005;
      }
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Main Earth sphere with realistic materials */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.015}
          specularMap={specularMap}
          specular={new THREE.Color(0x333333)}
          shininess={15}
        />
      </mesh>
      
      {/* Night lights layer - subtle visibility on dark side */}
      <mesh>
        <sphereGeometry args={[2.001, 128, 128]} />
        <meshBasicMaterial
          map={nightMap}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Clouds layer with rotation */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.015, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Inner atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.04, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={{
            glowColor: { value: new THREE.Color('#93c5fd') },
            intensity: { value: 0.6 }
          }}
          vertexShader={atmosphereVertexShader}
          fragmentShader={innerAtmosphereFragmentShader}
        />
      </mesh>
      
      {/* Outer atmosphere glow - Fresnel effect */}
      <mesh scale={1.08}>
        <sphereGeometry args={[2, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={{
            glowColor: { value: new THREE.Color('#60a5fa') },
            intensity: { value: 1.2 },
            power: { value: 4.0 }
          }}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
        />
      </mesh>
      
      {/* Subtle outer halo */}
      <mesh scale={1.15}>
        <sphereGeometry args={[2, 32, 32]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          uniforms={{
            glowColor: { value: new THREE.Color('#3b82f6') },
            intensity: { value: 0.3 },
            power: { value: 6.0 }
          }}
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
        />
      </mesh>
    </group>
  );
};

// Camera controller with smooth controls
const CameraController = ({ autoRotate }: { autoRotate: boolean }) => {
  return (
    <OrbitControls
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      autoRotate={false}
      minDistance={2.8}
      maxDistance={8}
      dampingFactor={0.05}
      enableDamping={true}
      rotateSpeed={0.4}
      zoomSpeed={0.6}
    />
  );
};

// Cinematic lighting setup
const CinematicLighting = () => {
  return (
    <>
      {/* Main sun light */}
      <directionalLight 
        position={[10, 5, 8]} 
        intensity={2.5} 
        color="#fff8f0"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Rim light for depth */}
      <directionalLight 
        position={[-8, 3, -5]} 
        intensity={0.4} 
        color="#a5b4fc"
      />
      
      {/* Ambient fill */}
      <ambientLight intensity={0.12} color="#e0e7ff" />
      
      {/* Top accent */}
      <pointLight 
        position={[0, 8, 0]} 
        intensity={0.3} 
        color="#ffffff" 
      />
      
      {/* Bottom fill - space reflection */}
      <pointLight 
        position={[0, -5, 0]} 
        intensity={0.1} 
        color="#1e3a5f" 
      />
    </>
  );
};

// Main scene with everything
const GlobeScene = ({ 
  markers, 
  onMarkerClick, 
  autoRotate, 
  showAtmosphere,
  selectedMarkerId 
}: Globe3DProps & { selectedMarkerId: string | null }) => {
  return (
    <>
      <CinematicLighting />
      
      {/* Deep space background */}
      <color attach="background" args={['#030712']} />
      
      {/* Subtle stars */}
      <Stars 
        radius={400} 
        depth={60} 
        count={4000} 
        factor={3} 
        saturation={0.1} 
        fade 
        speed={0.2}
      />
      
      {/* Nebula-like background glow */}
      <mesh position={[0, 0, -50]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial 
          color="#0a1628" 
          transparent 
          opacity={0.3}
        />
      </mesh>
      
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
      
      <CameraController autoRotate={autoRotate} />
    </>
  );
};

// Loading component
const GlobeLoading = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto" />
      <p className="text-white/60 text-sm mt-4">Carregando globo...</p>
    </div>
  </div>
);

export const Globe3D = ({ markers, onMarkerClick, autoRotate, showAtmosphere }: Globe3DProps) => {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const handleMarkerClick = (marker: BusinessMarker) => {
    setSelectedMarkerId(marker.id);
    onMarkerClick(marker);
  };
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {!isLoaded && <GlobeLoading />}
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }}
        shadows
        dpr={[1, 2]}
        onCreated={() => setIsLoaded(true)}
      >
        <Suspense fallback={null}>
          <GlobeScene
            markers={markers}
            onMarkerClick={handleMarkerClick}
            autoRotate={autoRotate}
            showAtmosphere={showAtmosphere}
            selectedMarkerId={selectedMarkerId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
