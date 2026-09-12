import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ZoomIn, ZoomOut, Eye, Layers } from 'lucide-react';

interface Vessel3DProps {
  Ri: number; // lumen radius in mm
  h: number; // wall thickness in mm
  cvRatio: number;
  norm: { t: number; n: number }[];
  Tc: number;
  wallColor: string;
  heartRate: number;
  velocityMax?: number;
}

export const Vessel3D: React.FC<Vessel3DProps> = ({
  Ri,
  h,
  cvRatio,
  norm,
  Tc,
  wallColor,
  heartRate,
  velocityMax = 0.95,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    wallMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial> | null;
    lumenMesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshStandardMaterial> | null;
    crossSectionRing: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial> | null;
    particles: THREE.Mesh[];
    group: THREE.Group | null;
    raf: number | null;
    liveParams: {
      norm: { t: number; n: number }[];
      Tc: number;
      lumenBase: number;
      wallBase: number;
      cvRatio: number;
      wallColor: string;
      cutaway: boolean;
    };
  }>({
    renderer: null,
    scene: null,
    camera: null,
    wallMesh: null,
    lumenMesh: null,
    crossSectionRing: null,
    particles: [],
    group: null,
    raf: null,
    liveParams: {
      norm: [],
      Tc: 0.8,
      lumenBase: 1,
      wallBase: 1.15,
      cvRatio: 1,
      wallColor: '#10B981',
      cutaway: false,
    },
  });

  const [cutaway, setCutaway] = useState(false);
  const [currentStrain, setCurrentStrain] = useState(0);
  const [currentDiameter, setCurrentDiameter] = useState(Ri * 2);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 50);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.6);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const group = new THREE.Group();
    group.rotation.z = Math.PI / 2.2;
    group.rotation.x = 0.25;
    scene.add(group);

    const LEN = 5.2;

    // Outer Vascular Wall (Adventitia + Media)
    // Using thetaLength for cutaway support
    const wallGeo = new THREE.CylinderGeometry(1.2, 1.2, LEN, 48, 1, true, 0, Math.PI * 2);
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallColor),
      transparent: true,
      opacity: 0.38,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    group.add(wallMesh);

    // Inner Endothelial Lumen Mesh
    const lumenGeo = new THREE.CylinderGeometry(1.0, 1.0, LEN, 48, 1, true, 0, Math.PI * 2);
    const lumenMat = new THREE.MeshStandardMaterial({
      color: 0xd93829,
      roughness: 0.4,
      emissive: 0x4a0705,
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
    });
    const lumenMesh = new THREE.Mesh(lumenGeo, lumenMat);
    group.add(lumenMesh);

    // Vessel End Boundary Rings
    const ringGeo = new THREE.TorusGeometry(1.0, 0.045, 12, 48);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.5 });
    const topRing = new THREE.Mesh(ringGeo, ringMat);
    topRing.position.y = LEN / 2;
    topRing.rotation.x = Math.PI / 2;
    group.add(topRing);

    const botRing = new THREE.Mesh(ringGeo, ringMat);
    botRing.position.y = -LEN / 2;
    botRing.rotation.x = Math.PI / 2;
    group.add(botRing);

    // Cross section indicator ring
    const crossRingGeo = new THREE.RingGeometry(0.98, 1.2, 32);
    const crossRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const crossRingMesh = new THREE.Mesh(crossRingGeo, crossRingMat);
    crossRingMesh.rotation.x = Math.PI / 2;
    group.add(crossRingMesh);

    // Flowing Blood Cells / Particle Field
    const PARTICLE_COUNT = 16;
    const pGeo = new THREE.SphereGeometry(0.09, 10, 10);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0xff7b6b,
      emissive: 0xd93829,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const particles: THREE.Mesh[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = new THREE.Mesh(pGeo, pMat);
      const y0 = -LEN / 2 + (i / PARTICLE_COUNT) * LEN;
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * 0.45;
      p.position.set(Math.cos(ang) * rad, y0, Math.sin(ang) * rad);
      p.userData = { y: y0, ang, rad, speedMult: 0.8 + Math.random() * 0.4 };
      group.add(p);
      particles.push(p);
    }

    // Camera Orbit Controller (Native Touch & Mouse)
    const orbit = {
      theta: 0.6,
      phi: 1.25,
      radius: 7.2,
      dragging: false,
      lastX: 0,
      lastY: 0,
    };

    const updateCameraPos = () => {
      camera.position.set(
        orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta),
        orbit.radius * Math.cos(orbit.phi),
        orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta)
      );
      camera.lookAt(0, 0, 0);
    };
    updateCameraPos();

    const handlePointerDown = (e: PointerEvent) => {
      orbit.dragging = true;
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
      mount.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!orbit.dragging) return;
      const dx = e.clientX - orbit.lastX;
      const dy = e.clientY - orbit.lastY;
      orbit.theta -= dx * 0.007;
      orbit.phi = Math.max(0.3, Math.min(2.8, orbit.phi - dy * 0.007));
      orbit.lastX = e.clientX;
      orbit.lastY = e.clientY;
      updateCameraPos();
    };

    const handlePointerUp = (e: PointerEvent) => {
      orbit.dragging = false;
      try {
        mount.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      orbit.radius = Math.max(3.8, Math.min(12, orbit.radius + e.deltaY * 0.008));
      updateCameraPos();
    };

    mount.addEventListener('pointerdown', handlePointerDown);
    mount.addEventListener('pointermove', handlePointerMove);
    mount.addEventListener('pointerup', handlePointerUp);
    mount.addEventListener('pointercancel', handlePointerUp);
    mount.addEventListener('wheel', handleWheel, { passive: false });

    // Handle Resize
    const handleResize = () => {
      if (!mount || !renderer || !camera) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(mount);

    stateRef.current = {
      renderer,
      scene,
      camera,
      wallMesh,
      lumenMesh,
      crossSectionRing: crossRingMesh,
      particles,
      group,
      raf: null,
      liveParams: {
        norm,
        Tc,
        lumenBase: Ri * 0.35,
        wallBase: (Ri + h) * 0.35,
        cvRatio,
        wallColor,
        cutaway,
      },
    };

    const clock = new THREE.Clock();

    const animate = () => {
      const s = stateRef.current;
      if (!s.renderer || !s.scene || !s.camera || !s.wallMesh || !s.lumenMesh) return;

      const elapsed = clock.getElapsedTime();
      const p = s.liveParams;
      const cycleTime = p.Tc || 0.8;
      const tau = elapsed % cycleTime;

      // Find normalized pressure pulse value at current time
      let normPressure = 0.5;
      if (p.norm && p.norm.length > 0) {
        const frac = tau / cycleTime;
        const idx = Math.min(p.norm.length - 1, Math.floor(frac * p.norm.length));
        normPressure = p.norm[idx]?.n ?? 0.5;
      }

      // Vascular wall pulsatile elasticity
      const lumenBase = p.lumenBase || 1.0;
      const wallBase = p.wallBase || 1.15;
      const pulseAmp = 0.04 + 0.16 * Math.min(p.cvRatio, 1.5);

      const dynamicLumenScale = lumenBase * (0.94 + 0.16 * normPressure * pulseAmp * 4.5);
      const dynamicWallScale = wallBase * (0.96 + 0.12 * normPressure * pulseAmp * 4.0);

      s.lumenMesh.scale.set(dynamicLumenScale, 1, dynamicLumenScale);
      s.wallMesh.scale.set(dynamicWallScale, 1, dynamicWallScale);

      // Blood particles flow velocity modulated by cardiac ejection
      const flowVelocity = 1.6 + 4.2 * normPressure;
      s.particles.forEach((pt) => {
        pt.userData.y += flowVelocity * (1 / 60) * pt.userData.speedMult;
        if (pt.userData.y > LEN / 2) {
          pt.userData.y -= LEN;
        }
        pt.position.y = pt.userData.y;
        const curR = pt.userData.rad * dynamicLumenScale;
        pt.position.x = Math.cos(pt.userData.ang) * curR;
        pt.position.z = Math.sin(pt.userData.ang) * curR;
      });

      // Update live HUD metrics at throttled frame
      if (Math.random() < 0.1) {
        const strainPct = +(((dynamicLumenScale - lumenBase) / lumenBase) * 100).toFixed(1);
        setCurrentStrain(strainPct);
        setCurrentDiameter(+(Ri * 2 * (dynamicLumenScale / lumenBase)).toFixed(2));
      }

      s.renderer.render(s.scene, s.camera);
      s.raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (stateRef.current.raf) {
        cancelAnimationFrame(stateRef.current.raf);
      }
      ro.disconnect();
      mount.removeEventListener('pointerdown', handlePointerDown);
      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerup', handlePointerUp);
      mount.removeEventListener('pointercancel', handlePointerUp);
      mount.removeEventListener('wheel', handleWheel);

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }

      wallGeo.dispose();
      wallMat.dispose();
      lumenGeo.dispose();
      lumenMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      crossRingGeo.dispose();
      crossRingMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Update dynamic values when props change
  useEffect(() => {
    const s = stateRef.current;
    if (!s.wallMesh || !s.lumenMesh) return;

    const sceneScale = 0.38;
    s.wallMesh.material.color.set(wallColor);
    s.liveParams = {
      norm,
      Tc,
      lumenBase: Ri * sceneScale,
      wallBase: (Ri + h) * sceneScale,
      cvRatio,
      wallColor,
      cutaway,
    };
  }, [Ri, h, cvRatio, norm, Tc, wallColor, cutaway]);

  const toggleCutaway = () => {
    setCutaway((prev) => !prev);
    const s = stateRef.current;
    if (!s.wallMesh || !s.lumenMesh || !s.group) return;

    const nextCutaway = !cutaway;
    const angle = nextCutaway ? Math.PI * 1.5 : Math.PI * 2;
    const LEN = 5.2;

    s.wallMesh.geometry.dispose();
    s.lumenMesh.geometry.dispose();

    s.wallMesh.geometry = new THREE.CylinderGeometry(1.2, 1.2, LEN, 48, 1, true, 0, angle);
    s.lumenMesh.geometry = new THREE.CylinderGeometry(1.0, 1.0, LEN, 48, 1, true, 0, angle);
  };

  const resetCamera = () => {
    const s = stateRef.current;
    if (!s.camera) return;
    s.camera.position.set(4.2, 3.1, 5.3);
    s.camera.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[280px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 shadow-sm">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: wallColor }} />
          <span className="text-[11px] font-mono text-slate-200 font-semibold tracking-wide">
            CCA DIGITAL TWIN (3D)
          </span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={toggleCutaway}
            title="Toggle Cut-plane / Cross Section View"
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 border transition-all ${
              cutaway
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers size={13} />
            <span className="hidden sm:inline">{cutaway ? '3/4 Cut' : 'Full Cylinder'}</span>
          </button>

          <button
            onClick={resetCamera}
            title="Reset 3D Orientation"
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>

      {/* Bottom HUD Metrics */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-300">
        <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-3 shadow-md">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lumen Diameter</span>
            <span className="font-bold text-white text-xs">{currentDiameter} mm</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Pulsatile Strain</span>
            <span className="font-bold text-emerald-400 text-xs">{currentStrain >= 0 ? `+${currentStrain}` : currentStrain}%</span>
          </div>
          <div className="h-4 w-px bg-slate-700 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Wall Thickness</span>
            <span className="font-bold text-amber-300 text-xs">{h.toFixed(3)} mm</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-400 text-[10px] hidden md:flex items-center gap-1.5">
          <span>Drag to orbit · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
