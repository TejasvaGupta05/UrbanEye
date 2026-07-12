import { useRef, useMemo, useState, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Individual building component
function Building({ position, height, width, depth, color, emissiveColor, emissiveIntensity = 0.1 }) {
    const meshRef = useRef();
    const [hovered, setHovered] = useState(false);
    
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.material.emissiveIntensity = hovered 
                ? 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3 
                : emissiveIntensity;
        }
    });

    return (
        <mesh 
            ref={meshRef}
            position={[position[0], height / 2, position[2]]} 
            castShadow 
            receiveShadow
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
            onPointerOut={() => setHovered(false)}
        >
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial 
                color={hovered ? '#818cf8' : color} 
                emissive={emissiveColor || color}
                emissiveIntensity={emissiveIntensity}
                metalness={0.6}
                roughness={0.3}
                transparent
                opacity={0.9}
            />
            {height > 3 && (
                <pointLight 
                    position={[0, height / 2 + 0.2, 0]} 
                    intensity={0.3} 
                    color={emissiveColor || '#6366f1'} 
                    distance={3} 
                />
            )}
        </mesh>
    );
}

// Animated grid floor
function GridFloor({ activeLayer }) {
    const gridRef = useRef();
    
    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    const gridColor = activeLayer === 'thermal' ? '#f97316' : activeLayer === 'water' ? '#3b82f6' : '#6366f1';

    return (
        <group>
            <mesh ref={gridRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[60, 60]} />
                <meshStandardMaterial color="#0f172a" transparent opacity={0.9} />
            </mesh>
            <gridHelper args={[60, 60, gridColor, '#1e293b']} position={[0, 0, 0]} />
        </group>
    );
}

// Floating data particles using raw Three.js buffer
function DataParticles({ count = 150, activeLayer }) {
    const particlesRef = useRef();
    
    const [posArray] = useState(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40;
            pos[i * 3 + 1] = Math.random() * 20 + 1;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        return pos;
    });

    const bufferGeom = useMemo(() => {
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(posArray, 3));
        return geom;
    }, [posArray]);

    useFrame((state) => {
        if (particlesRef.current) {
            const arr = particlesRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                arr[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.003;
                if (arr[i * 3 + 1] > 25) arr[i * 3 + 1] = 1;
            }
            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const particleColor = activeLayer === 'thermal' ? '#fb923c' : activeLayer === 'water' ? '#60a5fa' : '#a5b4fc';

    return (
        <points ref={particlesRef} geometry={bufferGeom}>
            <pointsMaterial size={0.08} color={particleColor} transparent opacity={0.7} sizeAttenuation />
        </points>
    );
}

// Hotspot markers for incidents
function HotspotMarker({ position, color = '#ef4444', pulseSpeed = 2 }) {
    const ringRef = useRef();
    const sphereRef = useRef();
    
    useFrame((state) => {
        if (ringRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3;
            ringRef.current.scale.set(scale, scale, 1);
            ringRef.current.material.opacity = 0.6 - Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3;
        }
        if (sphereRef.current) {
            sphereRef.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
        }
    });

    return (
        <group position={position}>
            {/* Pulse ring */}
            <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.4, 0.6, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            {/* Core sphere */}
            <mesh ref={sphereRef} position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
            </mesh>
            {/* Vertical beam */}
            <mesh position={[0, 3, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 6, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            {/* Ground glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
                <circleGeometry args={[1.5, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.08} />
            </mesh>
            <pointLight position={[0, 1, 0]} intensity={1} color={color} distance={4} />
        </group>
    );
}

// Road paths
function Roads() {
    return (
        <group>
            {[[-15, 0], [0, 0], [15, 0]].map((pos, i) => (
                <mesh key={`road-h-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[pos[0], 0.02, 0]}>
                    <planeGeometry args={[1.2, 50]} />
                    <meshStandardMaterial color="#1e293b" emissive="#334155" emissiveIntensity={0.2} />
                </mesh>
            ))}
            {[[-15, 0], [0, 0], [15, 0]].map((pos, i) => (
                <mesh key={`road-v-${i}`} rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.02, pos[0]]}>
                    <planeGeometry args={[1.2, 50]} />
                    <meshStandardMaterial color="#1e293b" emissive="#334155" emissiveIntensity={0.2} />
                </mesh>
            ))}
        </group>
    );
}

// Main city scene
function CityScene({ activeLayer }) {
    const groupRef = useRef();
    
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.02;
        }
    });

    const buildings = useMemo(() => {
        const bldgs = [];
        const zones = [
            { x: [-8, 8], z: [-8, 8], heightRange: [3, 8], count: 25, colors: ['#6366f1', '#818cf8', '#4f46e5', '#7c3aed'] },
            { x: [-25, -10], z: [-20, 20], heightRange: [1, 3], count: 20, colors: ['#334155', '#475569', '#3b82f6', '#1e40af'] },
            { x: [10, 25], z: [-20, 20], heightRange: [1, 3], count: 20, colors: ['#334155', '#475569', '#3b82f6', '#1e40af'] },
            { x: [-20, 20], z: [-25, -12], heightRange: [1.5, 4], count: 15, colors: ['#64748b', '#475569', '#94a3b8'] },
        ];

        let id = 0;
        zones.forEach(zone => {
            for (let i = 0; i < zone.count; i++) {
                const x = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]);
                const z = zone.z[0] + Math.random() * (zone.z[1] - zone.z[0]);
                const height = zone.heightRange[0] + Math.random() * (zone.heightRange[1] - zone.heightRange[0]);
                const width = 0.8 + Math.random() * 1.5;
                const depth = 0.8 + Math.random() * 1.5;
                const color = zone.colors[Math.floor(Math.random() * zone.colors.length)];
                
                let finalColor = color;
                let emissiveColor = color;
                if (activeLayer === 'thermal') {
                    const heat = height / 8;
                    finalColor = heat > 0.6 ? '#ef4444' : heat > 0.3 ? '#f97316' : '#eab308';
                    emissiveColor = finalColor;
                } else if (activeLayer === 'water') {
                    finalColor = Math.random() > 0.5 ? '#0ea5e9' : '#1e40af';
                    emissiveColor = '#3b82f6';
                }

                bldgs.push({ id: id++, position: [x, 0, z], height, width, depth, color: finalColor, emissiveColor,
                    emissiveIntensity: activeLayer === 'thermal' ? 0.4 : activeLayer === 'water' ? 0.3 : 0.1
                });
            }
        });
        return bldgs;
    }, [activeLayer]);

    const hotspots = useMemo(() => [
        { position: [5, 0, 5], color: '#ef4444', pulseSpeed: 2.5 },
        { position: [-12, 0, 8], color: '#f97316', pulseSpeed: 2 },
        { position: [18, 0, -6], color: '#eab308', pulseSpeed: 1.5 },
        { position: [-5, 0, -15], color: '#ef4444', pulseSpeed: 3 },
        { position: [10, 0, 15], color: '#22c55e', pulseSpeed: 1 },
    ], []);

    return (
        <group ref={groupRef}>
            <GridFloor activeLayer={activeLayer} />
            <Roads />
            {buildings.map(b => (
                <Building key={b.id} {...b} />
            ))}
            {hotspots.map((h, i) => (
                <HotspotMarker key={i} {...h} />
            ))}
            <DataParticles activeLayer={activeLayer} />
        </group>
    );
}

// Loading fallback inside canvas
function Loader() {
    const meshRef = useRef();
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 2;
            meshRef.current.rotation.x = state.clock.elapsedTime;
        }
    });
    return (
        <mesh ref={meshRef}>
            <octahedronGeometry args={[1]} />
            <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} wireframe />
        </mesh>
    );
}

// Main exported component
export default function DigitalTwinCity({ activeLayer = 'infrastructure' }) {
    return (
        <Canvas
            shadows
            camera={{ position: [25, 20, 25], fov: 50, near: 0.1, far: 200 }}
            style={{ background: 'transparent' }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 1.5]}
        >
            <ambientLight intensity={0.3} />
            <directionalLight 
                position={[20, 30, 10]} 
                intensity={0.8} 
                castShadow 
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <pointLight position={[0, 15, 0]} intensity={0.5} color="#6366f1" />
            
            {activeLayer === 'thermal' && <pointLight position={[0, 20, 0]} intensity={1} color="#f97316" />}
            {activeLayer === 'water' && <pointLight position={[0, 20, 0]} intensity={1} color="#3b82f6" />}
            
            <Stars radius={100} depth={50} count={2000} factor={3} saturation={0} fade speed={1} />
            <fog attach="fog" args={[activeLayer === 'thermal' ? '#1a0a00' : activeLayer === 'water' ? '#000a1a' : '#0a0a1a', 30, 80]} />
            
            <Suspense fallback={<Loader />}>
                <CityScene activeLayer={activeLayer} />
            </Suspense>
            
            <OrbitControls 
                enablePan
                enableZoom
                enableRotate
                minPolarAngle={0.2}
                maxPolarAngle={Math.PI / 2.2}
                minDistance={10}
                maxDistance={60}
                autoRotate
                autoRotateSpeed={0.3}
            />
        </Canvas>
    );
}
