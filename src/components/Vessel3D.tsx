import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Layers, ShieldAlert, Sparkles, Compass } from 'lucide-react';

interface Vessel3DProps {
  Ri: number; // lumen radius in mm
  h: number; // wall thickness in mm
  cvRatio: number;
  norm: { t: number; n: number }[];
  Tc: number;
  wallColor: string;
  heartRate: number;
  velocityMax?: number;
  stenosisPercent?: number; // 0 to 70%
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
  stenosisPercent = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cutaway, setCutaway] = useState(false);
  const [showPlaque, setShowPlaque] = useState(stenosisPercent > 0);
  const [currentStrain, setCurrentStrain] = useState(0);
  const [currentDiameter, setCurrentDiameter] = useState(Ri * 2);
  const [currentWss, setCurrentWss] = useState(1.4); // Wall Shear Stress in Pa
  const [autoRotate, setAutoRotate] = useState(false);

  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    wallMesh: THREE.Mesh | null;
    lumenMesh: THREE.Mesh | null;
    plaqueMesh: THREE.Mesh | null;
    crossSectionRing: THREE.Mesh | null;
    particles: THREE.Mesh[];
    group: THREE.Group | null;
    raf: number | null;
    orbit: {
      theta: number;
      phi: number;
      radius: number;
      dragging: boolean;
      lastX: number;
      lastY: number;
    };
    liveParams: {
      norm: { t: number; n: number }[];
      Tc: number;
      lumenBase: number;
      wallBase: number;
      cvRatio: number;
      wallColor: string;
      cutaway: boolean;
      showPlaque: boolean;
      autoRotate: boolean;
    };
  }>({
    renderer: null,
    scene: null,
    camera: null,
    wallMesh: null,
    lumenMesh: null,
    plaqueMesh: null,
    crossSectionRing: null,
    particles: [],
    group: null,
    raf: null,
    orbit: {
      theta: 0.6,
      phi: 1.25,
      radius: 7.2,
      dragging: false,
      lastX: 0,
      lastY: 0,
    },
    liveParams: {
      norm: [],
      Tc: 0.8,
      lumenBase: 1,
      wallBase: 1.15,
      cvRatio: 1,
      wallColor: '#10B981',
      cutaway: false,
      showPlaque: false,
      autoRotate: false,
    },
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 50);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.domElement.id = 'vasctwin-vessel-canvas';
      renderer.domElement.className = 'w-full h-full block';
    } catch (e) {
      console.warn('WebGL not supported or initialization failed:', e);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.7);
    dirLight2.position.set(-4, -2, -3);
    scene.add(dirLight2);

    const group = new THREE.Group();
    group.rotation.z = Math.PI / 2.2;
    group.rotation.x = 0.25;
    scene.add(group);

    const LEN = 5.4;

    // Outer Vascular Wall (Adventitia + Media)
    const wallGeo = new THREE.CylinderGeometry(1.25, 1.25, LEN, 48, 1, true, 0, Math.PI * 2);
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

    // Atherosclerotic Plaque Layer (Focal Intimal thickening)
    const plaqueGeo = new THREE.SphereGeometry(0.55, 24, 24);
    plaqueGeo.scale(1.4, 2.2, 0.6);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.6,
      metalness: 0.05,
      emissive: 0x854d0e,
      emissiveIntensity: 0.3,
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0.65, 0, 0);
    plaqueMesh.visible = showPlaque;
    group.add(plaqueMesh);

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
    const crossRingGeo = new THREE.RingGeometry(0.98, 1.25, 32);
    const crossRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    const crossRingMesh = new THREE.Mesh(crossRingGeo, crossRingMat);
    crossRingMesh.rotation.x = Math.PI / 2;
    group.add(crossRingMesh);

    // Flowing Blood Cells / Particle Field (RBCs)
    const PARTICLE_COUNT = 22;
    const pGeo = new THREE.SphereGeometry(0.08, 10, 10);
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
      p.userData = { y: y0, ang, rad, speedMult: 0.85 + Math.random() * 0.35 };
      group.add(p);
      particles.push(p);
    }

    // Camera Orbit Controller
    const orbit = stateRef.current.orbit;

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
      plaqueMesh,
      crossSectionRing: crossRingMesh,
      particles,
      group,
      raf: null,
      orbit,
      liveParams: {
        norm,
        Tc,
        lumenBase: Ri * 0.35,
        wallBase: (Ri + h) * 0.35,
        cvRatio,
        wallColor,
        cutaway,
        showPlaque,
        autoRotate,
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

      if (p.autoRotate && s.group) {
        s.group.rotation.y += 0.008;
      }

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
      const flowVelocity = 1.8 + 4.5 * normPressure;
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
        const curD = +(Ri * 2 * (dynamicLumenScale / lumenBase)).toFixed(2);
        // Wall Shear Stress (Poiseuille formula: tau = 4*mu*Q / (pi*R^3))
        // Normal ~ 1.0 - 2.5 Pa, modulated dynamically
        const wssVal = +(1.1 + normPressure * 1.35 * (3.0 / Math.max(Ri, 1.5))).toFixed(2);

        setCurrentStrain(strainPct);
        setCurrentDiameter(curD);
        setCurrentWss(wssVal);
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
      plaqueGeo.dispose();
      plaqueMat.dispose();
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
    (s.wallMesh.material as THREE.MeshStandardMaterial).color.set(wallColor);
    if (s.plaqueMesh) {
      s.plaqueMesh.visible = showPlaque;
    }
    s.liveParams = {
      norm,
      Tc,
      lumenBase: Ri * sceneScale,
      wallBase: (Ri + h) * sceneScale,
      cvRatio,
      wallColor,
      cutaway,
      showPlaque,
      autoRotate,
    };
  }, [Ri, h, cvRatio, norm, Tc, wallColor, cutaway, showPlaque, autoRotate]);

  const toggleCutaway = () => {
    const nextCutaway = !cutaway;
    setCutaway(nextCutaway);
    const s = stateRef.current;
    if (!s.wallMesh || !s.lumenMesh) return;

    const angle = nextCutaway ? Math.PI * 1.5 : Math.PI * 2;
    const LEN = 5.4;

    s.wallMesh.geometry.dispose();
    s.lumenMesh.geometry.dispose();

    s.wallMesh.geometry = new THREE.CylinderGeometry(1.25, 1.25, LEN, 48, 1, true, 0, angle);
    s.lumenMesh.geometry = new THREE.CylinderGeometry(1.0, 1.0, LEN, 48, 1, true, 0, angle);
  };

  const togglePlaque = () => {
    setShowPlaque((prev) => !prev);
  };

  const toggleAutoRotate = () => {
    setAutoRotate((prev) => !prev);
  };

  const resetCamera = () => {
    const s = stateRef.current;
    if (!s.camera) return;
    s.orbit.theta = 0.6;
    s.orbit.phi = 1.25;
    s.orbit.radius = 7.2;
    s.camera.position.set(4.2, 3.1, 5.3);
    s.camera.lookAt(0, 0, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[340px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between">
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/70 shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: wallColor }} />
          <span className="text-xs font-mono text-slate-100 font-bold tracking-wide">
            CAROTID 3D DIGITAL TWIN
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 ml-1">
            {heartRate} BPM
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* 3/4 Cutaway Toggle */}
          <button
            type="button"
            onClick={toggleCutaway}
            title="Toggle Cutaway (Cross-section view into lumen)"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              cutaway
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-sm'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers size={14} />
            <span className="hidden sm:inline">{cutaway ? '3/4 Cutaway' : 'Solid Tube'}</span>
          </button>

          {/* Plaque / Stenosis Toggle */}
          <button
            type="button"
            onClick={togglePlaque}
            title="Toggle Atherosclerotic Plaque Simulation"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              showPlaque
                ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert size={14} />
            <span className="hidden sm:inline">{showPlaque ? 'Plaque ON' : 'Plaque'}</span>
          </button>

          {/* Auto Rotate */}
          <button
            type="button"
            onClick={toggleAutoRotate}
            title="Toggle Auto-Rotation"
            className={`p-1.5 rounded-xl text-xs flex items-center border transition cursor-pointer ${
              autoRotate
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Compass size={14} />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={resetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700 hover:bg-slate-700 transition cursor-pointer"
          >
            <RotateCw size={14} />
          </button>
        </div>
      </div>

      {/* Anatomy Legend Badges */}
      <div className="absolute top-14 left-3 pointer-events-none hidden md:flex flex-col gap-1.5 text-[11px] font-mono">
        <div className="bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          <span>Tunica Intima & Lumen</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-800 flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: wallColor }} />
          <span>Tunica Media & Adventitia (Stiffness)</span>
        </div>
        {showPlaque && (
          <div className="bg-slate-900/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-amber-500/40 flex items-center gap-2 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Focal Atheroma Plaque</span>
          </div>
        )}
      </div>

      {/* Bottom HUD Metrics (Large, High Contrast, Direct) */}
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none text-slate-200">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/70 flex items-center gap-4 sm:gap-6 shadow-lg">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Lumen Dia</span>
            <span className="font-extrabold text-white text-sm sm:text-base">{currentDiameter} <span className="text-[11px] text-slate-400 font-normal">mm</span></span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Dynamic Strain</span>
            <span className="font-extrabold text-emerald-400 text-sm sm:text-base">
              {currentStrain >= 0 ? `+${currentStrain}` : currentStrain}%
            </span>
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Wall Shear Stress</span>
            <span className="font-extrabold text-cyan-300 text-sm sm:text-base">{currentWss} <span className="text-[11px] text-slate-400 font-normal">Pa</span></span>
          </div>

          <div className="h-6 w-px bg-slate-700 hidden sm:block" />

          <div className="hidden sm:block">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Wall Thickness</span>
            <span className="font-extrabold text-amber-300 text-sm sm:text-base">{h.toFixed(3)} <span className="text-[11px] text-slate-400 font-normal">mm</span></span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-400 text-[11px] hidden lg:flex items-center gap-1.5 font-medium">
          <span>Click & drag to rotate · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};

