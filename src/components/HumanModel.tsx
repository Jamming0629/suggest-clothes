'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Text } from '@react-three/drei';
import * as THREE from 'three';

// FBXローダーをインポート
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

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

// CGモデルを読み込むコンポーネント
function CGModel({ 
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
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [error, setError] = useState<string | null>(null);

  // FBXモデルを読み込み
  useEffect(() => {
    const loadModel = async () => {
      try {
        // FBXローダーを使用してモデルを読み込み
        const loader = new FBXLoader();
        loader.load(
          '/models/model.fbx',
          (object: THREE.Group) => {
            // モデルのスケールと位置を調整
            object.scale.setScalar(0.01); // スケールを調整
            object.position.set(0, 0, 0);
            
            // 体型に基づいてスケールを調整
            const bodyScale = bodyType === 'slim' ? 0.9 : bodyType === 'plus' ? 1.1 : 1.0;
            const heightScale = height === 'short' ? 0.9 : height === 'tall' ? 1.1 : 1.0;
            object.scale.multiplyScalar(bodyScale * heightScale);
            
            setModel(object);
          },
          (progress: ProgressEvent) => {
            console.log('モデル読み込み中:', (progress.loaded / progress.total * 100) + '%');
          },
          (error: unknown) => {
            console.error('モデル読み込みエラー:', error);
            setError('モデルの読み込みに失敗しました');
          }
        );
      } catch (err) {
        console.error('モデル読み込みエラー:', err);
        setError('モデルの読み込みに失敗しました');
      }
    };

    loadModel();
  }, [bodyType, height]);

  // アニメーション
  useFrame((state) => {
    if (group.current && model) {
      // ゆっくりとした回転アニメーション
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  // エラーが発生した場合のフォールバック
  if (error) {
    return (
      <group>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {error}
        </Text>
      </group>
    );
  }

  // モデルが読み込まれていない場合のローディング表示
  if (!model) {
    return (
      <group>
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={group}>
      {/* CGモデルを表示 */}
      <primitive object={model} />
      
      {/* 服のオーバーレイ（必要に応じて） */}
      {selectedClothing && (
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.5, 0.1, 0.3]} />
          <meshStandardMaterial 
            color={selectedClothing.color === 'black' ? '#1a1a1a' : 
                   selectedClothing.color === 'white' ? '#ffffff' :
                   selectedClothing.color === 'blue' ? '#3b82f6' :
                   selectedClothing.color === 'red' ? '#ef4444' :
                   selectedClothing.color === 'green' ? '#10b981' :
                   selectedClothing.color === 'gray' ? '#6b7280' :
                   selectedClothing.color === 'beige' ? '#d1d5db' : '#6b7280'}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}
      
      {/* 床 */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
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
        
        {/* CGモデル */}
        <CGModel 
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