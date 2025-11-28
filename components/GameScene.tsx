import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Cloud, Float, Sparkles, SpotLight, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { FishConfig, GameState, PlayerStats, FishType, WeatherType } from '../types';
import { playGameSound } from '../constants';

// --- Assets & Geometries ---

const Boat = ({ positionRef, reelSpeed, outfit }: { positionRef: React.MutableRefObject<number>, reelSpeed: number, outfit: string }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lastX = useRef(0);
  const tilt = useRef(0);
  const headlightTarget = useRef(new THREE.Object3D());

  useEffect(() => {
      // Set initial target position for headlights relative to world (will update in loop)
      headlightTarget.current.position.set(0, 0, 10);
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
        const currentX = positionRef.current;
        groupRef.current.position.x = currentX;
        
        // Calculate velocity for tilt effect
        const velocity = (currentX - lastX.current) / delta;
        
        // Target tilt based on velocity (moving right = tilt left)
        const targetTilt = -Math.max(-0.5, Math.min(0.5, velocity * 0.05));
        
        // Smoothly interpolate tilt
        tilt.current = THREE.MathUtils.lerp(tilt.current, targetTilt, delta * 5);
        
        // Apply wobble
        const wobble = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        groupRef.current.rotation.z = tilt.current + wobble;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;

        // Update headlight target to be in front of the boat
        headlightTarget.current.position.set(currentX, -2, 8);
        headlightTarget.current.updateMatrixWorld();

        lastX.current = currentX;
    }
  });

  // Calculate light intensity based on reel speed (better engines = brighter lights)
  const lightIntensity = 5 + (reelSpeed * 10);
  const isNeon = outfit === 'Neon Hull';
  const isGold = outfit === 'Golden Hull';

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {/* Headlights */}
      <group position={[0, 1.5, 2]}>
          <primitive object={headlightTarget.current} />
          <SpotLight
            position={[0.8, 0, 0]}
            target={headlightTarget.current}
            angle={0.5}
            penumbra={0.5}
            intensity={lightIntensity}
            castShadow
            color="#fff"
            distance={25}
            attenuation={5}
            anglePower={4}
          />
          <SpotLight
            position={[-0.8, 0, 0]}
            target={headlightTarget.current}
            angle={0.5}
            penumbra={0.5}
            intensity={lightIntensity}
            castShadow
            color="#fff"
            distance={25}
            attenuation={5}
            anglePower={4}
          />
          
          {/* Physical Lantern Models */}
          <group position={[0.8, 0, 0]}>
             <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.15, 0.3]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
             <mesh position={[0, 0, 0.26]}>
                 <sphereGeometry args={[0.15]} />
                 <meshBasicMaterial color="#fffee0" />
             </mesh>
          </group>
          <group position={[-0.8, 0, 0]}>
             <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]}>
                 <cylinderGeometry args={[0.2, 0.15, 0.3]} />
                 <meshStandardMaterial color="#333" />
             </mesh>
             <mesh position={[0, 0, 0.26]}>
                 <sphereGeometry args={[0.15]} />
                 <meshBasicMaterial color="#fffee0" />
             </mesh>
          </group>
      </group>

      {/* Hull */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial 
          color={isGold ? '#ffd700' : (isNeon ? '#0f172a' : '#8B4513')} 
          roughness={isGold ? 0.2 : 0.8} 
          metalness={isGold ? 0.8 : 0}
          emissive={isNeon ? '#06b6d4' : '#000'}
          emissiveIntensity={isNeon ? 0.5 : 0}
        />
      </mesh>
      {/* Deck */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.8, 0.1, 3.8]} />
        <meshStandardMaterial color={isGold ? '#eab308' : '#A0522D'} roughness={0.9} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.5, -1]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color={isGold ? '#fbbf24' : '#F4A460'} />
      </mesh>
      {/* Details */}
      <mesh position={[0, 2.3, -1]} rotation={[0,0,0]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Dynamic Engine Visuals based on Reel Speed */}
      {reelSpeed > 0 && (
          <group position={[0, 0.8, 2.1]}>
              <mesh rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.6]} />
                  <meshStandardMaterial color="#333" />
              </mesh>
              <mesh position={[0, -0.4, 0]} rotation={[Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.05, 0.15, 0.3]} />
                  <meshStandardMaterial color="#111" />
              </mesh>
              {/* Turbo Prop (v1+) */}
              {reelSpeed >= 0.2 && (
                  <mesh position={[0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                      <meshStandardMaterial color="#555" />
                  </mesh>
              )}
               {/* Dual Turbo (v1+) */}
               {reelSpeed >= 0.2 && (
                  <mesh position={[-0.3, 0, 0]} rotation={[Math.PI/2, 0, 0]}>
                      <cylinderGeometry args={[0.1, 0.1, 0.5]} />
                      <meshStandardMaterial color="#555" />
                  </mesh>
              )}
              {/* Nuclear Reactor Glow (v3+) */}
              {reelSpeed >= 0.6 && (
                   <mesh position={[0, 0.2, 0]}>
                      <sphereGeometry args={[0.15]} />
                      <meshStandardMaterial color="#39ff14" emissive="#39ff14" emissiveIntensity={2} />
                  </mesh>
              )}
          </group>
      )}
    </group>
  );
};

const Fisherman = ({ outfit, positionRef, luck }: { outfit: string, positionRef: React.MutableRefObject<number>, luck: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
      if (groupRef.current) {
          groupRef.current.position.x = positionRef.current;
      }
  });
  
  const isGolden = outfit === 'Golden Suit';
  const isCyber = outfit === 'Cyber Punk';

  return (
    <group ref={groupRef} position={[0, 2, -0.5]}>
      {/* Luck Particles */}
      {luck > 0 && (
          <Sparkles count={10 + Math.floor(luck * 5)} scale={2} size={4 + luck} speed={0.4} opacity={0.5} color={luck > 2 ? "#d946ef" : "#fbbf24"} position={[0, 1, 0]} />
      )}

      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 4, 8]} />
        <meshStandardMaterial 
            color={isGolden ? '#ffd700' : (isCyber ? '#111' : (outfit === 'Pirate Hat' ? '#1f2937' : (outfit === 'Astro Helm' ? '#e2e8f0' : '#ef4444')))} 
            roughness={isGolden ? 0.3 : 0.7}
            metalness={isGolden ? 0.8 : 0}
            emissive={isCyber ? '#d946ef' : '#000'}
            emissiveIntensity={isCyber ? 1 : 0}
        />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffdecb" />
      </mesh>
      
      {/* --- Hats & Outfits --- */}
      
      {/* Captain Hat */}
      {outfit === 'Captain Hat' && (
         <group position={[0, 0.9, 0]}>
             <mesh>
                 <cylinderGeometry args={[0.35, 0.35, 0.1, 16]} />
                 <meshStandardMaterial color="white" />
             </mesh>
             <mesh position={[0, 0.1, 0]}>
                 <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
                 <meshStandardMaterial color="white" />
             </mesh>
             <mesh position={[0, 0.1, 0.25]} rotation={[0.2, 0, 0]}>
                 <boxGeometry args={[0.3, 0.05, 0.3]} />
                 <meshStandardMaterial color="black" />
             </mesh>
         </group>
      )}
      
      {/* Pirate Hat */}
      {outfit === 'Pirate Hat' && (
          <group position={[0, 0.9, 0]}>
              <mesh scale={[1, 0.5, 0.5]} rotation={[0,0,0.2]}>
                  <cylinderGeometry args={[0.6, 0.6, 0.4, 3]} />
                  <meshStandardMaterial color="#1e1b4b" />
              </mesh>
              <mesh position={[0, 0.2, 0.3]}>
                  <sphereGeometry args={[0.1]} />
                  <meshStandardMaterial color="#eab308" />
              </mesh>
          </group>
      )}
      
      {/* Astro Helm */}
      {outfit === 'Astro Helm' && (
          <group position={[0, 0.7, 0]}>
              <mesh>
                  <sphereGeometry args={[0.45, 32, 32]} />
                  <meshStandardMaterial color="white" transparent opacity={0.3} roughness={0} metalness={0.8} />
              </mesh>
              <mesh position={[0, -0.4, 0]}>
                   <cylinderGeometry args={[0.4, 0.4, 0.2]} />
                   <meshStandardMaterial color="#94a3b8" />
              </mesh>
          </group>
      )}

      {/* Cyber Visor */}
      {isCyber && (
          <mesh position={[0, 0.75, 0.25]}>
              <boxGeometry args={[0.4, 0.1, 0.2]} />
              <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>
      )}
      
    </group>
  );
};

const WeatherEffects = ({ weather }: { weather: WeatherType }) => {
    // Rain Logic
    const rainCount = 1000;
    const rainGeo = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = [];
        for(let i=0; i<rainCount; i++) {
            pos.push((Math.random() - 0.5) * 40); // x
            pos.push(Math.random() * 20); // y
            pos.push((Math.random() - 0.5) * 20); // z
        }
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        return geo;
    }, []);
    
    const rainRef = useRef<THREE.Points>(null);
    const [flash, setFlash] = useState(0);

    useFrame((state, delta) => {
        // Rain Animation
        if (weather === 'RAINY' && rainRef.current) {
            const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
            for(let i=1; i<positions.length; i+=3) {
                positions[i] -= 15 * delta;
                if (positions[i] < -5) positions[i] = 20;
            }
            rainRef.current.geometry.attributes.position.needsUpdate = true;
            
            // Lightning Logic
            if (Math.random() < 0.005) { // 0.5% chance per frame
                setFlash(1);
                playGameSound('thunder', 1);
            }
        }
        
        if (flash > 0) {
            setFlash(f => Math.max(0, f - delta * 3)); // Fade out lightning
        }
    });

    return (
        <group>
            {weather === 'RAINY' && (
                <>
                    <points ref={rainRef} geometry={rainGeo}>
                        <pointsMaterial color="#aaa" size={0.1} transparent opacity={0.6} />
                    </points>
                    <Cloud position={[0, 10, 0]} opacity={0.8} speed={0.4} width={20} depth={5} segments={20} color="#334155" />
                    <ambientLight intensity={0.2 + flash} color={flash > 0 ? "#a5f3fc" : "#fff"} />
                </>
            )}
            {weather === 'FOGGY' && (
                <fog attach="fog" args={['#0f172a', 5, 25]} />
            )}
            {weather === 'SUNNY' && (
                 <ambientLight intensity={0.6} />
            )}
        </group>
    )
}

// --- Visual Effects ---

const Ripple: React.FC<{ x: number, z: number, onComplete: () => void }> = ({ x, z, onComplete }) => {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.scale.x += delta * 4;
            ref.current.scale.y += delta * 4;
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity -= delta * 1.5;
            if (mat.opacity <= 0) onComplete();
        }
    });
    return (
        <mesh ref={ref} position={[x, 0.05, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.4, 32]} />
            <meshBasicMaterial color="white" transparent opacity={0.6} />
        </mesh>
    );
};

// --- Fluid Line Component (Swaying Rope + Tension) ---

const FluidLine = ({ hookRef, fishes }: { hookRef: React.MutableRefObject<any>, fishes: FishConfig[] }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    
    useFrame((state) => {
        if (!meshRef.current) return;
        
        const length = hookRef.current.length;
        const time = state.clock.elapsedTime;
        const caughtId = hookRef.current.caughtFishId;
        const isRetracting = hookRef.current.state === 'RETRACTING';
        
        // Calculate Line Tension
        let tension = 0;
        if (isRetracting && caughtId) {
            const fish = fishes.find(f => f.id === caughtId);
            if (fish) {
                // Heavier fish = more tension (0 to 1+)
                tension = Math.min(2, fish.weight / 60); 
            }
        }

        // Visualize Tension
        if (materialRef.current) {
            if (tension > 0.2) {
                // Glow Red/Orange under tension
                const t = Math.min(1, tension - 0.2);
                const color = new THREE.Color('#e2e8f0').lerp(new THREE.Color('#ef4444'), t);
                materialRef.current.color = color;
                materialRef.current.emissive = new THREE.Color('#ef4444');
                materialRef.current.emissiveIntensity = t;
            } else {
                materialRef.current.color.set('#e2e8f0');
                materialRef.current.emissive.set('#000');
                materialRef.current.emissiveIntensity = 0;
            }
        }

        // Curve Calculation
        // Add vibration noise to control point if under tension
        const vibration = tension > 0 ? Math.sin(time * 50) * 0.1 * tension : 0;
        
        // Normal sway
        const swayX = Math.sin(time * 3 + length) * (0.1 + length * 0.05);
        const swayZ = Math.cos(time * 2.5) * (0.1 + length * 0.05);

        const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0), // Start at rod tip
            new THREE.Vector3(
                swayX + vibration, // Mid X
                -length * 0.55, // Mid Y
                swayZ + vibration // Mid Z
            ),
            new THREE.Vector3(0, -length, 0) // End at hook
        );
        
        // Dispose old geometry
        if (meshRef.current.geometry) meshRef.current.geometry.dispose();
        
        // Create Tube: Thinner if under high tension (stretching)
        const thickness = 0.03 * (1 - (tension * 0.2));
        meshRef.current.geometry = new THREE.TubeGeometry(curve, 10, thickness, 5, false);
    });

    return (
        <mesh ref={meshRef} position={[0, -0.5, 0]}>
            <meshStandardMaterial ref={materialRef} color="#e2e8f0" transparent opacity={0.9} roughness={0.5} />
        </mesh>
    );
};

// --- Logic Components ---

interface FishProps {
  config: FishConfig;
  onUpdate: (id: string, pos: THREE.Vector3) => void;
  caught: boolean;
  hookTipRef: React.MutableRefObject<THREE.Vector3>;
  hookStateRef: React.MutableRefObject<{ state: string }>;
  weather: WeatherType;
}

const ProceduralFish = ({ color, type }: { color: string, type: FishType }) => {
    const isGiant = type === FishType.GIANT || type === FishType.LARGE;
    const isTiny = type === FishType.TINY;
    
    // Refs for materials to update color based on depth
    const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const tailMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const dorsalMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const fin1MatRef = useRef<THREE.MeshStandardMaterial>(null);
    const fin2MatRef = useRef<THREE.MeshStandardMaterial>(null);

    const groupRef = useRef<THREE.Group>(null);
    const tailRef = useRef<THREE.Group>(null);

    const baseColorObj = useMemo(() => new THREE.Color(color), [color]);
    const deepColorObj = useMemo(() => new THREE.Color('#001020'), []);

    useFrame(({ clock }) => {
        // Animation
        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(clock.elapsedTime * 15) * 0.4;
        }

        // Depth-based color shift
        if (groupRef.current) {
            const worldPos = new THREE.Vector3();
            groupRef.current.getWorldPosition(worldPos);
            
            // Map depth: 0 (surface) to -15 (deep)
            const depth = Math.min(0, worldPos.y);
            const depthFactor = Math.min(1, Math.abs(depth) / 25); // Max effect at -25
            
            const displayColor = baseColorObj.clone().lerp(deepColorObj, depthFactor * 0.8);

            // Apply color to all materials
            if (bodyMatRef.current) bodyMatRef.current.color = displayColor;
            if (tailMatRef.current) tailMatRef.current.color = displayColor;
            if (dorsalMatRef.current) dorsalMatRef.current.color = displayColor;
            if (fin1MatRef.current) fin1MatRef.current.color = displayColor;
            if (fin2MatRef.current) fin2MatRef.current.color = displayColor;
            
            // Adjust emissive for visibility in deep
            if (bodyMatRef.current) {
                bodyMatRef.current.emissive = displayColor;
                bodyMatRef.current.emissiveIntensity = 0.2 - (depthFactor * 0.15); // Less emissive deep down
            }
        }
    });

    return (
        <group ref={groupRef}>
            {/* Body: Deformed Sphere for better organic shape */}
            <mesh scale={[1, isGiant ? 0.8 : 0.6, isTiny ? 0.3 : 0.4]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshStandardMaterial 
                    ref={bodyMatRef}
                    color={color} 
                    roughness={0.2} 
                    metalness={0.1}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </mesh>
            
            {/* Tail */}
            <group ref={tailRef} position={[-0.4, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.2, 0, 0]}>
                    <coneGeometry args={[0.25, 0.4, 3]} />
                    <meshStandardMaterial ref={tailMatRef} color={color} roughness={0.3} />
                </mesh>
            </group>

            {/* Dorsal Fin */}
            <mesh position={[0.1, 0.35, 0]} rotation={[0, 0, -0.2]}>
                <boxGeometry args={[0.3, 0.3, 0.05]} />
                <meshStandardMaterial ref={dorsalMatRef} color={color} />
            </mesh>

            {/* Side Fin */}
            <mesh position={[0.1, -0.1, 0.2]} rotation={[0.5, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.05, 0.15]} />
                <meshStandardMaterial ref={fin1MatRef} color={color} />
            </mesh>
             <mesh position={[0.1, -0.1, -0.2]} rotation={[-0.5, 0.5, 0]}>
                <boxGeometry args={[0.2, 0.05, 0.15]} />
                <meshStandardMaterial ref={fin2MatRef} color={color} />
            </mesh>

            {/* Eyes (Keep static colors) */}
            <group position={[0.35, 0.1, 0]}>
                <mesh position={[0, 0, 0.15]}>
                    <sphereGeometry args={[0.06]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                <mesh position={[0.04, 0, 0.17]}>
                    <sphereGeometry args={[0.03]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                
                <mesh position={[0, 0, -0.15]}>
                    <sphereGeometry args={[0.06]} />
                    <meshStandardMaterial color="white" />
                </mesh>
                 <mesh position={[0.04, 0, -0.17]}>
                    <sphereGeometry args={[0.03]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>
        </group>
    );
};

const Fish: React.FC<FishProps> = ({ config, onUpdate, caught, hookTipRef, hookStateRef, weather }) => {
  const ref = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const [isRejoining, setIsRejoining] = useState(false);
  
  const SPEED = config.speed * 0.01;
  const RANGE = 15; 
  
  // AI State
  const aiState = useRef({
      state: 'PATROL' as 'PATROL' | 'FLEE' | 'RETURN',
      // The "School Center" is where the fish spawned
      schoolX: config.schoolCenter[0],
      schoolY: config.schoolCenter[1],
      fleeDir: 1,
      randomOffset: Math.random() * 100
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    
    if (caught) {
        ref.current.scale.set(0,0,0);
        return;
    }

    const fishPos = ref.current.position;
    const hookPos = hookTipRef.current;
    const distToHook = fishPos.distanceTo(hookPos);
    const isHookActive = hookStateRef.current.state !== 'IDLE';

    // Environmental Effects
    const time = state.clock.elapsedTime;
    const currentForce = Math.sin(time * 0.5) * 0.002; 
    fishPos.x += currentForce;

    let rejoining = false;

    // --- State Transitions ---
    const FLEE_DIST = 2.5; 

    if (aiState.current.state === 'PATROL') {
        if (isHookActive && distToHook < FLEE_DIST) {
            aiState.current.state = 'FLEE';
            aiState.current.fleeDir = fishPos.x > hookPos.x ? 1 : -1;
        }
    } else if (aiState.current.state === 'FLEE') {
        if (!isHookActive || distToHook > 8) {
            aiState.current.state = 'RETURN';
        }
    } else if (aiState.current.state === 'RETURN') {
        const distToHome = Math.sqrt(
            Math.pow(fishPos.x - aiState.current.schoolX, 2) + 
            Math.pow(fishPos.y - aiState.current.schoolY, 2)
        );

        if (distToHome < 4) {
             rejoining = true;
        }

        if (distToHome < 1.0) {
            aiState.current.state = 'PATROL';
        }

        if (isHookActive && distToHook < 3) {
            aiState.current.state = 'FLEE';
            aiState.current.fleeDir = fishPos.x > hookPos.x ? 1 : -1;
        }
    }

    if (rejoining !== isRejoining) {
        setIsRejoining(rejoining);
    }

    // --- Visual AI Indicators (Aura) ---
    if (auraRef.current) {
        if (aiState.current.state === 'FLEE') {
            auraRef.current.visible = true;
            (auraRef.current.material as THREE.MeshBasicMaterial).color.set('#ef4444'); // Red
            const pulse = 1 + Math.sin(time * 20) * 0.3; // Fast pulse
            auraRef.current.scale.setScalar(pulse);
        } else if (aiState.current.state === 'RETURN') {
            auraRef.current.visible = true;
            (auraRef.current.material as THREE.MeshBasicMaterial).color.set('#eab308'); // Yellow
            const pulse = 1 + Math.sin(time * 5) * 0.1; // Slow pulse
            auraRef.current.scale.setScalar(pulse);
        } else {
            auraRef.current.visible = false;
        }
    }

    // --- Behavior Execution ---
    if (aiState.current.state === 'FLEE') {
        // Flee from hook
        fishPos.x += aiState.current.fleeDir * (SPEED * 4);
        const verticalFlee = fishPos.y > hookPos.y ? 1 : -1;
        fishPos.y += verticalFlee * (SPEED * 2);

        // COHESION: Slight pull towards school center while fleeing
        const dx = aiState.current.schoolX - fishPos.x;
        const dy = aiState.current.schoolY - fishPos.y;
        fishPos.x += dx * 0.005; 
        fishPos.y += dy * 0.005;

        // Face flee direction
        const targetRotY = aiState.current.fleeDir === 1 ? 0 : Math.PI;
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotY, 0.1);
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, verticalFlee * 0.5, 0.1);

    } else if (aiState.current.state === 'RETURN') {
        // Vector towards school home
        const dx = aiState.current.schoolX - fishPos.x;
        const dy = aiState.current.schoolY - fishPos.y;
        
        fishPos.x += dx * 0.02; // Smooth lerp return
        fishPos.y += dy * 0.02;

        // Face towards home
        const targetRotY = dx > 0 ? 0 : Math.PI;
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotY, 0.1);
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, 0.1);

    } else {
        // 'PATROL'
        fishPos.x += config.direction * SPEED;

        if (fishPos.x > RANGE || fishPos.x < -RANGE) {
           fishPos.x = Math.max(-RANGE, Math.min(RANGE, fishPos.x));
           config.direction *= -1;
        }

        // Standard Orientation
        const targetRotY = config.direction === 1 ? 0 : Math.PI;
        ref.current.rotation.y = targetRotY;
        ref.current.rotation.z = Math.sin(time * 5 + aiState.current.randomOffset) * 0.05; 
    }

    onUpdate(config.id, fishPos.clone());
  });
  
  const isMutant = config.type === FishType.MUTANT;

  return (
    <group ref={ref} position={[config.x, config.y, 0]}>
       <Float 
        speed={aiState.current.state === 'FLEE' ? 15 : 2} 
        rotationIntensity={aiState.current.state === 'FLEE' ? 0.5 : 0.2} 
        floatIntensity={0.2}
       >
         {/* AI Aura Indicator */}
         <mesh ref={auraRef} visible={false}>
             <sphereGeometry args={[0.8, 16, 16]} />
             <meshBasicMaterial transparent opacity={0.3} wireframe />
         </mesh>
         
         {/* Rejoining School Effect */}
         {isRejoining && (
             <Sparkles count={5} scale={1.2} size={2} color="#fbbf24" speed={2} opacity={0.8} />
         )}

         {/* Use new ProceduralFish component */}
         <group scale={config.scale}>
            <ProceduralFish color={config.color} type={config.type} />
         </group>

         {/* Mutant Extras */}
         {isMutant && (
            <Sparkles count={8} scale={2} size={3} speed={0.4} opacity={1} color={config.color} />
         )}
       </Float>
    </group>
  );
};

// --- Physics Logic Component ---

interface GamePhysicsProps {
  hookStateRef: React.MutableRefObject<any>;
  hookTipPosRef: React.MutableRefObject<THREE.Vector3>;
  boatXRef: React.MutableRefObject<number>;
  inputKeysRef: React.MutableRefObject<{ left: boolean, right: boolean }>;
  fishPositions: Map<string, THREE.Vector3>;
  fishes: FishConfig[];
  inventory: PlayerStats['inventory'];
  onCatch: (fish: FishConfig) => void;
  setFishes: React.Dispatch<React.SetStateAction<FishConfig[]>>;
  setFishing: (fishing: boolean) => void;
  onRipple: (pos: THREE.Vector3) => void;
}

const GamePhysics = ({ hookStateRef, hookTipPosRef, boatXRef, inputKeysRef, fishPositions, fishes, inventory, onCatch, setFishes, setFishing, onRipple }: GamePhysicsProps) => {
  const lastSoundTime = useRef(0);
  const lastTipY = useRef(2);

  useFrame((state, delta) => {
      const hook = hookStateRef.current;
      const now = state.clock.elapsedTime;
      
      // 1. Handle Boat Movement (Only if Idle)
      if (hook.state === 'IDLE') {
          const BOAT_SPEED = 10;
          if (inputKeysRef.current.left) {
              boatXRef.current -= BOAT_SPEED * delta;
          }
          if (inputKeysRef.current.right) {
              boatXRef.current += BOAT_SPEED * delta;
          }
          // Clamp Boat Position
          boatXRef.current = Math.max(-12, Math.min(12, boatXRef.current));
      }

      // 2. Calculate Hook Physics
      const startPos = new THREE.Vector3(boatXRef.current, 2, 2);
      const dir = new THREE.Vector3(-Math.sin(hook.angle), -Math.cos(hook.angle), 0);
      const tipPos = startPos.clone().add(dir.multiplyScalar(hook.length));
      
      hookTipPosRef.current.copy(tipPos);

      // Water Ripple Detection (Surface Entry/Exit)
      const currentY = tipPos.y;
      const prevY = lastTipY.current;
      
      if ((prevY > 0 && currentY <= 0) || (prevY < 0 && currentY >= 0)) {
           // Crossed surface
           onRipple(new THREE.Vector3(tipPos.x, 0, tipPos.z));
           playGameSound('splash');
      }
      lastTipY.current = currentY;

      if (hook.state === 'IDLE') {
           const t = now * 1.5;
           hook.angle = Math.sin(t) * 0.9;
           hook.length = 1;
      } else if (hook.state === 'CASTING') {
          hook.length += 8 * delta; 

          if (hook.length > 15 || tipPos.x < -15 || tipPos.x > 15) {
              hook.state = 'RETRACTING';
          }

          if (!hook.caughtFishId) {
             fishPositions.forEach((pos, id) => {
                 const dist = pos.distanceTo(tipPos);
                 // Check Collision
                 const hitDist = 2.5 + (inventory.hookSize * 0.5); 
                 if (dist < hitDist) {
                     const fish = fishes.find(f => f.id === id);
                     if (fish) {
                         hook.caughtFishId = id;
                         hook.state = 'RETRACTING';
                         playGameSound('splash'); 
                         onRipple(new THREE.Vector3(tipPos.x, 0, tipPos.z));
                     }
                 }
             });
          }
      } else if (hook.state === 'RETRACTING') {
          let speed = 7 * (1 + inventory.reelSpeed);
          let tension = 0;

          if (hook.caughtFishId) {
              const fish = fishes.find(f => f.id === hook.caughtFishId);
              if (fish) {
                  // Weight calculation for drag
                  const weightFactor = fish.weight / 250;
                  speed *= Math.max(0.4, 1 - weightFactor);
                  tension = Math.min(2, weightFactor * 4);
              }
          }
          
          // Play reeling sound occasionally, intensity based on tension
          // Faster clicks if faster speed, but lower pitch if higher tension
          const clickRate = 0.1 - (inventory.reelSpeed * 0.02);
          if (now - lastSoundTime.current > Math.max(0.04, clickRate)) {
              playGameSound('reel', tension + (inventory.reelSpeed * 0.5));
              lastSoundTime.current = now;
          }

          hook.length -= speed * delta;
          
          if (hook.length <= 1) {
              hook.length = 1;
              hook.state = 'IDLE';
              if (hook.caughtFishId) {
                  const fish = fishes.find(f => f.id === hook.caughtFishId);
                  if (fish) {
                      onCatch(fish);
                      setFishes(prev => prev.filter(f => f.id !== fish.id));
                      fishPositions.delete(fish.id);
                      playGameSound('success'); 
                  }
                  hook.caughtFishId = null;
              }
              setFishing(false);
          }
      }
  });
  return null;
};

// --- Camera Controller ---

const CameraRig = ({ boatXRef }: { boatXRef: React.MutableRefObject<number> }) => {
    const { camera } = useThree();
    useFrame((state, delta) => {
        // Smoothly follow boat X
        const targetX = boatXRef.current * 0.5; // Parallax effect (don't follow 1:1)
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 2);
        camera.lookAt(targetX, 0, 0); // Keep looking at center/boat
    });
    return null;
};

// --- Visual Components ---

const HookTip = ({ visualRef, fishes, hookSize }: { visualRef: any, fishes: FishConfig[], hookSize: number }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(() => {
        if(ref.current) {
            ref.current.position.y = -visualRef.current.length;
        }
    });
    
    const caughtId = visualRef.current.caughtFishId;
    const fish = fishes.find(f => f.id === caughtId);
    
    // Scale visual hook based on upgrade level
    const hookScale = 1 + (hookSize * 0.5);

    return (
        <group ref={ref}>
             {/* BOBBER */}
             <group position={[0, 0.8, 0]}>
                 <mesh castShadow>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshStandardMaterial color="white" />
                 </mesh>
                 <mesh position={[0, 0.05, 0]}>
                     <sphereGeometry args={[0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
                     <meshStandardMaterial color="#ef4444" />
                 </mesh>
                 <mesh position={[0, 0.2, 0]}>
                     <cylinderGeometry args={[0.02, 0.02, 0.3]} />
                     <meshStandardMaterial color="#ef4444" />
                 </mesh>
             </group>

            {/* HOOK */}
            <mesh rotation={[0,0,Math.PI]} scale={[hookScale, hookScale, hookScale]} castShadow>
                <torusGeometry args={[0.3, 0.08, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#333" roughness={0.2} metalness={0.8} />
            </mesh>
            
            {/* CAUGHT FISH VISUAL */}
            {fish && (
                 <group position={[0, -0.5, 0]} rotation={[0,0,Math.PI/2]} scale={fish.scale}>
                     <ProceduralFish color={fish.color} type={fish.type} />
                </group>
            )}
        </group>
    )
}

const HookVisual = ({ hookRef, fishes, boatXRef, hookSize }: { hookRef: React.MutableRefObject<any>, fishes: FishConfig[], boatXRef: React.MutableRefObject<number>, hookSize: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const rodRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current || !rodRef.current) return;
        const { angle, state: hookState } = hookRef.current;
        
        // Sync with Boat Position
        groupRef.current.position.x = boatXRef.current;

        groupRef.current.rotation.z = angle;
        
        let targetPitch = -0.5;
        if (hookState === 'CASTING') {
            targetPitch = 0.1;
        } else if (hookState === 'RETRACTING') {
            targetPitch = -0.8;
            if (hookRef.current.caughtFishId) {
                 targetPitch += Math.sin(state.clock.elapsedTime * 30) * 0.05;
            }
        } else {
            targetPitch += Math.sin(state.clock.elapsedTime * 2) * 0.05;
        }

        rodRef.current.rotation.x = THREE.MathUtils.lerp(rodRef.current.rotation.x, targetPitch, 0.1);
    });

    return (
        <group position={[0, 2, 2]}>
             <group ref={groupRef}>
                 <group ref={rodRef}>
                     <mesh position={[0, 0, -1.5]} rotation={[Math.PI/2, 0, 0]} castShadow>
                         <cylinderGeometry args={[0.03, 0.08, 3, 12]} /> 
                         <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.5} />
                     </mesh>
                     <mesh position={[0, 0, -2.8]} rotation={[Math.PI/2, 0, 0]}>
                         <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                         <meshStandardMaterial color="#0f172a" />
                     </mesh>
                     <mesh position={[0, -0.15, -2.4]} rotation={[0, 0, Math.PI/2]}>
                         <cylinderGeometry args={[0.15, 0.15, 0.15]} />
                         <meshStandardMaterial color="#94a3b8" metalness={0.8} />
                     </mesh>
                      <mesh position={[0.1, -0.15, -2.4]} rotation={[0, 0, Math.PI/2]}>
                         <boxGeometry args={[0.05, 0.3, 0.05]} />
                         <meshStandardMaterial color="#1e293b" />
                     </mesh>
                 </group>

                 {/* Pass hookRef down for tension visuals */}
                 <FluidLine hookRef={hookRef} fishes={fishes} />

                 <HookTip visualRef={hookRef} fishes={fishes} hookSize={hookSize} />
             </group>
        </group>
    );
}

// --- Main Scene Wrapper ---

interface GameSceneProps {
  gameState: GameState;
  fishes: FishConfig[];
  setFishes: React.Dispatch<React.SetStateAction<FishConfig[]>>;
  onCatch: (fish: FishConfig) => void;
  inventory: PlayerStats['inventory'];
  weather: WeatherType;
}

export const GameScene = ({ gameState, fishes, setFishes, onCatch, inventory, weather }: GameSceneProps) => {
  const [fishing, setFishing] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; z: number }[]>([]);
  
  const fishPositions = useRef(new Map<string, THREE.Vector3>()).current;
  const hookTipPosRef = useRef(new THREE.Vector3(0, -100, 0));
  
  // Boat Physics State
  const boatXRef = useRef(0);
  const inputKeysRef = useRef({ left: false, right: false });

  const hookStateRef = useRef({
      state: 'IDLE' as 'IDLE' | 'CASTING' | 'RETRACTING',
      angle: 0,
      length: 1,
      caughtFishId: null as string | null
  });

  const handlePointerDown = () => {
    if (gameState !== GameState.PLAYING) return;
    if (hookStateRef.current.state === 'IDLE') {
        setFishing(true);
        hookStateRef.current.state = 'CASTING';
        playGameSound('cast');
    }
  };

  const handleAddRipple = (pos: THREE.Vector3) => {
      const id = Date.now() + Math.random();
      setRipples(prev => [...prev, { id, x: pos.x, z: pos.z }]);
  };

  const handleRippleComplete = (id: number) => {
      setRipples(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handlePointerDown();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          inputKeysRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          inputKeysRef.current.right = true;
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
          inputKeysRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
          inputKeysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  return (
    <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }} onPointerDown={handlePointerDown}>
      <CameraRig boatXRef={boatXRef} />
      <WeatherEffects weather={weather} />
      
      {weather !== 'RAINY' && <Sky sunPosition={[100, 20, 100]} />}
      {weather === 'RAINY' && <color attach="background" args={['#0f172a']} />}

      <pointLight position={[10, 10, 10]} intensity={weather === 'RAINY' ? 0.5 : 1} castShadow />
      
      {/* Dynamic Wavy Water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 20, 20]} />
        <MeshDistortMaterial 
          color="#0ea5e9" 
          transparent 
          opacity={0.8} 
          distort={0.4} 
          speed={2} 
          roughness={0.2} 
        />
      </mesh>
      
      {/* Dynamic Water Ripples */}
      {ripples.map(r => (
          <Ripple key={r.id} x={r.x} z={r.z} onComplete={() => handleRippleComplete(r.id)} />
      ))}

      <Boat positionRef={boatXRef} reelSpeed={inventory.reelSpeed} outfit={inventory.outfit} />
      <Fisherman outfit={inventory.outfit} positionRef={boatXRef} luck={inventory.luck} />
      
      <GamePhysics 
        hookStateRef={hookStateRef}
        hookTipPosRef={hookTipPosRef}
        boatXRef={boatXRef}
        inputKeysRef={inputKeysRef}
        fishPositions={fishPositions}
        fishes={fishes}
        inventory={inventory}
        onCatch={onCatch}
        setFishes={setFishes}
        setFishing={setFishing}
        onRipple={handleAddRipple}
      />

      <HookVisual hookRef={hookStateRef} fishes={fishes} boatXRef={boatXRef} hookSize={inventory.hookSize} />

      {fishes.map(fish => (
        <Fish 
            key={fish.id} 
            config={fish} 
            caught={hookStateRef.current.caughtFishId === fish.id}
            onUpdate={(id, pos) => fishPositions.set(id, pos)}
            hookTipRef={hookTipPosRef}
            hookStateRef={hookStateRef}
            weather={weather}
        />
      ))}
      
      {weather !== 'FOGGY' && <Cloud position={[-10, 8, -10]} speed={0.2} opacity={0.5} />}
      {weather !== 'FOGGY' && <Cloud position={[10, 6, -15]} speed={0.2} opacity={0.5} />}
    </Canvas>
  );
};