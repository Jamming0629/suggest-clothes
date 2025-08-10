'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface HumanModelProps {
  selectedClothing?: {
    id: string;
    name: string;
    category: string;
    color: string;
  } | null;
  bodyType?: 'slim' | 'average' | 'plus';
  height?: 'short' | 'medium' | 'tall';
  hairStyle?: 'short' | 'medium' | 'long';
  skinTone?: string;
}

// シンプルな人体モデルコンポーネント
function SimpleHumanModel({ 
  selectedClothing,
  bodyType = 'average',
  height = 'medium',
  skinTone = '#fbbf24'
}: { 
  selectedClothing?: HumanModelProps['selectedClothing'];
  bodyType: string;
  height: string;
  skinTone: string;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // 体型と身長に基づくスケール計算
  const bodyScale = bodyType === 'slim' ? 0.8 : bodyType === 'plus' ? 1.2 : 1.0;
  const heightScale = height === 'short' ? 0.8 : height === 'tall' ? 1.2 : 1.0;
  const totalScale = bodyScale * heightScale;

  // 選択された服の色を取得
  const clothingColor = selectedClothing?.color || '#cccccc';

  useFrame((state) => {
    if (group.current) {
      // ゆっくりとした回転アニメーション
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group} scale={totalScale}>
      {/* 頭部 */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      {/* 髪型 */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#2d1b0e" />
      </mesh>

      {/* 胴体（シャツ/トップス） */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.6, 0.2]} />
        <meshStandardMaterial color={clothingColor} />
      </mesh>

      {/* 腕（左） */}
      <mesh position={[-0.3, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      {/* 腕（右） */}
      <mesh position={[0.3, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.5]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      {/* 手（左） */}
      <mesh position={[-0.3, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      {/* 手（右） */}
      <mesh position={[0.3, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      {/* 脚（左） */}
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* 脚（右） */}
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* 足（左） */}
      <mesh position={[-0.15, 0, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* 足（右） */}
      <mesh position={[0.15, 0, 0.1]} castShadow>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>

      {/* 選択された服の表示 */}
      {selectedClothing && (
        <group>
          {/* 服の説明テキスト */}
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.8, 0.3, 0.1]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default function HumanModel({ 
  selectedClothing, 
  bodyType = 'average',
  height = 'medium',
  hairStyle = 'medium',
  skinTone = '#fbbf24'
}: HumanModelProps) {
  return (
    <div className="w-full h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 3]} />
        
        {/* ライティング */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, 10, -10]} intensity={0.5} />
        
        {/* シンプルな人体モデル */}
        <SimpleHumanModel 
          selectedClothing={selectedClothing}
          bodyType={bodyType}
          height={height}
          skinTone={skinTone}
        />
        
        {/* カメラコントロール */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          target={[0, 1.2, 0]}
        />
      </Canvas>
    </div>
  );
} 