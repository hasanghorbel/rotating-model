"use client";

import { loadGLTFModel } from "@/lib/model"; //model.js path
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function Model() {
    const refBody = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [renderer, setRenderer] = useState<any>();
    const [_camera, setCamera] = useState<any>();
    const [target] = useState(new THREE.Vector3(0, -0.5, 0));
    const [initialCameraPosition] = useState(
        new THREE.Vector3(50, 0, 0)
    );

    const [scene] = useState(new THREE.Scene());
    const [_controls, setControls] = useState<any>();

    const handleWindowResize = useCallback(() => {
        const { current: container } = refBody;
        if (container && renderer) {
            const scW = container.clientWidth;
            const scH = container.clientHeight;

            renderer.setSize(scW, scH);
        }
    }, [renderer]);

    const easeOutCirc = (x: number) => {
        return Math.sqrt(1 - Math.pow(x - 1, 4));
    };

    useEffect(() => {
        const { current: container } = refBody;
        if (container && !renderer) {
            const scW = container.clientWidth;
            const scH = container.clientHeight;

            const renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(scW, scH);
            container.appendChild(renderer.domElement);
            setRenderer(renderer);

            const scale = scH * 0.0025;
            const camera = new THREE.OrthographicCamera(
                -scale,
                scale,
                scale,
                -scale / 2,
                0.01,
                50000,
            );
            camera.position.copy(initialCameraPosition);
            camera.lookAt(target);
            setCamera(camera);

            const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
            scene.add(ambientLight);

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.autoRotate = true;
            controls.target = target;
            setControls(controls);

            loadGLTFModel(scene, `model/scene.gltf`, { // model path
                receiveShadow: false,
                castShadow: false,
            })
                .then(() => {
                    animate();
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(true);
                });

            let req: any = null;
            let frame = 0;
            const animate = () => {
                req = requestAnimationFrame(animate);

                frame = frame <= 100 ? frame + 1 : frame;

                if (frame <= 100) {
                    const p = initialCameraPosition;
                    const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20;

                    camera.position.y = 10;
                    camera.position.x =
                        p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed);
                    camera.position.z =
                        p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed);
                    camera.lookAt(target);
                } else {
                    controls.update();
                }

                renderer.render(scene, camera);
            };

            return () => {
                console.log("unmount");
                cancelAnimationFrame(req);
                renderer.dispose();
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize, false);
        return () => {
            window.removeEventListener("resize", handleWindowResize, false);
        };
    }, [renderer, handleWindowResize]);

    return (
            <div className="flex justify-center h-[30rem]">

                <div
                    ref={refBody}
                    className="relative items-center m-0 h-full w-full cursor-pointer bg-transparent"
                >
                    {loading && <p>loading..</p>}
                </div>
            </div>
    );
};


