"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface CelestialSphereProps {
  hue?: number;
  speed?: number;
  zoom?: number;
  particleSize?: number;
  cloudIntensity?: number;
  starDensity?: number;
  interactive?: boolean;
  className?: string;
}

export default function CelestialSphere({
  hue = 220.0,
  speed = 0.32,
  zoom = 1.15,
  particleSize = 2.45,
  cloudIntensity = 1.25,
  starDensity = 0.72,
  interactive = false,
  className = "",
}: CelestialSphereProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frameId = 0;

    const mouse = new THREE.Vector2(0.5, 0.5);

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_hue;
      uniform float u_zoom;
      uniform float u_particle_size;
      uniform float u_cloud_intensity;
      uniform float u_star_density;

      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
      }

      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.52;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(st);
          st = mat2(1.7, 1.2, -1.2, 1.7) * st + 0.03;
          amplitude *= 0.54;
        }
        return value;
      }

      float stars(vec2 uv, float density) {
        float s = random(uv * (680.0 * density));
        float c = step(0.99835, s);
        float twinkle = 0.55 + 0.45 * sin(u_time * 2.0 + s * 60.0);
        return c * twinkle * smoothstep(0.99835, 1.0, s);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        uv *= u_zoom;

        vec2 mouse_normalized = u_mouse / u_resolution;
        float autoWave = sin(u_time * 0.55 + uv.y * 1.7) * 0.055;
        float autoDrift = cos(u_time * 0.33 + uv.x * 1.15) * 0.045;
        uv += vec2(autoWave, autoDrift);
        uv += (mouse_normalized - 0.5) * 0.06;

        float t = u_time * 0.09;
        float baseNoise = fbm(uv * 1.25 + vec2(t, -t * 0.7));
        float detailNoise = fbm(uv * 2.6 - vec2(t * 1.4, -t * 1.1));
        float driftNoise = fbm(uv * 0.75 + vec2(-t * 0.6, t * 0.4));

        float nebulaMask = smoothstep(0.2, 1.0, baseNoise * 0.7 + detailNoise * 0.5 + driftNoise * 0.35);
        float nebula = pow(nebulaMask, 1.35) * u_cloud_intensity;

        vec3 deepBlue = vec3(0.006, 0.02, 0.07);
        vec3 nebulaA = hsl2rgb(vec3(u_hue / 360.0 + 0.02, 0.78, 0.54));
        vec3 nebulaB = hsl2rgb(vec3(u_hue / 360.0 + 0.09, 0.82, 0.50));
        vec3 nebulaC = vec3(0.46, 0.52, 0.98);

        float blend1 = clamp(baseNoise * 1.25, 0.0, 1.0);
        float blend2 = clamp(detailNoise * 1.4, 0.0, 1.0);

        vec3 cloudColor = mix(nebulaA, nebulaB, blend1);
        cloudColor = mix(cloudColor, nebulaC, blend2 * 0.35);
        vec3 color = deepBlue + cloudColor * nebula;

        float horizonGlow = smoothstep(0.9, 0.0, length(uv * vec2(0.9, 1.15)));
        color += vec3(0.01, 0.03, 0.09) * horizonGlow * 0.8;

        float coreGlow = smoothstep(0.95, 0.0, length((uv - vec2(0.25, -0.08)) * vec2(0.72, 1.0)));
        vec3 glowColor = vec3(0.18, 0.42, 0.95);
        color += glowColor * coreGlow * 0.75;

        float starLayer1 = stars(vUv + vec2(t * 0.04, 0.0), u_star_density);
        float starLayer2 = stars(vUv * 1.7 - vec2(0.0, t * 0.03), u_star_density * 0.72);
        float starField = (starLayer1 + starLayer2 * 0.75) * u_particle_size;
        color += vec3(starField);

        color = pow(color, vec3(1.03));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      material.uniforms.u_resolution.value.set(rect.width, rect.height);
      camera.updateProjectionMatrix();
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
      material.uniforms.u_mouse.value.set(mouse.x, mount.clientHeight - mouse.y);
    };

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    mount.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2() },
        u_mouse: { value: new THREE.Vector2() },
        u_hue: { value: hue },
        u_zoom: { value: zoom },
        u_particle_size: { value: particleSize },
        u_cloud_intensity: { value: cloudIntensity },
        u_star_density: { value: starDensity },
      },
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const animate = () => {
      material.uniforms.u_time.value += 0.0035 * speed;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    if (interactive && !prefersReducedMotion) {
      window.addEventListener("mousemove", onMouseMove);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      if (interactive && !prefersReducedMotion) {
        window.removeEventListener("mousemove", onMouseMove);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [cloudIntensity, hue, interactive, particleSize, speed, starDensity, zoom]);

  return <div ref={mountRef} className={className || "h-full w-full"} />;
}
