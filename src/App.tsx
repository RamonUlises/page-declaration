import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LayoutAtropos } from "./components/LayoutAtropos";
import * as THREE from "three";

function App() {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [modalVisible, setModalVisible] = useState(false);
  const [counter, setCounter] = useState(0);

  const moveNoButton = () => {
    const randomX = Math.floor(Math.random() * 600) - 350;
    const randomY = Math.floor(Math.random() * 600) - 350;
    setNoPosition({ x: randomX, y: randomY });
    setCounter(counter + 1);
  };

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    // Crear escena, cámara y renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Cargar la textura de un corazón rojo
    const textureLoader = new THREE.TextureLoader();
    const heartTexture = textureLoader.load(
      'public/corazon.webp' // Aquí debes poner la URL de la imagen del corazón rojo
    );

    // Crear partículas con forma de corazón
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10; // Posición X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10; // Posición Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // Posición Z
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      size: 0.5, // Tamaño de la partícula
      map: heartTexture, // Usar la textura de corazón
      transparent: true, // Hacer transparente para ver el corazón
      depthWrite: false, // Asegura que las partículas estén por detrás
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animar las partículas
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.x += 0.01;
      particles.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Limpieza al desmontar el componente
    return () => {
      if (rendererRef.current && rendererRef.current.domElement) {
        document.body.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <>
      <div className="z-10 flex flex-col items-center justify-center h-screen absolute w-full">
        <div className="bg-purple-600 p-4 rounded-md">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Vera, ¿puedo ser tu novio? ❤️
          </h1>
          <p className="text-xl text-white mb-4">
            {counter > 5 && `¡Acepta no seas asi! :(`}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setModalVisible(true)}
              className="bg-green-500 text-white px-6 py-2 rounded-lg text-xl hover:bg-green-600 cursor-pointer"
            >
              Sí 💖
            </button>
            <motion.button
              className="bg-red-500 text-white px-6 py-2 rounded-lg text-xl"
              onMouseEnter={moveNoButton}
              onTouchStart={moveNoButton}
              animate={{ x: noPosition.x, y: noPosition.y }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              No 💔
            </motion.button>
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
          modalVisible ? "" : "hidden"
        }`}
      >
        <LayoutAtropos innerClass="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">¡Gracias por decir que sí! 💖</h2>
          <p className="mb-4">Eres la mejor, Vera. Estoy muy feliz de que seas mi novia.</p>
          <button
            onClick={() => setModalVisible(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Cerrar
          </button>
        </LayoutAtropos>
      </div>
    </>
  );
}

export default App;
