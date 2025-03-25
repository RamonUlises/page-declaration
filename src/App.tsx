import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutAtropos } from "./components/LayoutAtropos";
import { Tetris } from "./components/Tetris";
import { TresRaya } from "./components/TresRaya";
import { Solitario } from "./components/Solitario";

import p5 from "p5";
import { ReactP5Wrapper } from "react-p5-wrapper";

interface Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  size: number;
}

export type modal = "modal" | "tetris" | "tresRaya" | "Solitario" | null;

function App() {
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [modalVisible, setModalVisible] = useState<modal>(null);
  const [counter, setCounter] = useState(0);

  const moveNoButton = () => {
    const randomX = Math.floor(Math.random() * 600) - 350;
    const randomY = Math.floor(Math.random() * 600) - 350;
    setNoPosition({ x: randomX, y: randomY });
    setCounter(counter + 1);
  };

  const particles: Particle[] = [];
  const mouse = { x: 0, y: 0 };

  const sketch = (p: p5) => {
    p.setup = () => {
      p.createCanvas(window.innerWidth, window.innerHeight);
      const canvas = p.select('canvas');
      if (canvas) {
        canvas.style('position', 'absolute');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '-1');
      }
      
      for (let i = 0; i < 2000; i++) {
        particles.push({
          pos: p.createVector(p.random(p.width), p.random(p.height)),
          vel: p.createVector(p.random(-1, 1), p.random(-1, 1)),
          acc: p.createVector(0, 0),
          size: p.random(3, 3),
        });
      }
    };

    p.draw = () => {
      p.background(20);
      particles.forEach((particle) => {
        const force = p.createVector(mouse.x - particle.pos.x, mouse.y - particle.pos.y);
        const distance = force.mag();
        if (distance < 100) {
          force.setMag(-0.5);
        } else {
          force.setMag(0);
        }
        particle.acc = force;
        particle.vel.add(particle.acc);
        particle.vel.limit(2);
        particle.pos.add(particle.vel);

        if (particle.pos.x > p.width) particle.pos.x = 0;
        if (particle.pos.x < 0) particle.pos.x = p.width;
        if (particle.pos.y > p.height) particle.pos.y = 0;
        if (particle.pos.y < 0) particle.pos.y = p.height;

        p.fill(255);
        p.noStroke();
        p.ellipse(particle.pos.x, particle.pos.y, particle.size);
      });
    };

    p.mouseMoved = () => {
      mouse.x = p.mouseX;
      mouse.y = p.mouseY;
    };
  };

  return (
    <>
      <div className={`${modalVisible === null ? "flex" : "hidden"} z-10 flex-col items-center justify-center h-screen absolute w-full`}>
        <ReactP5Wrapper sketch={sketch} />
        <div className="bg-purple-600 p-4 rounded-md">
          <h1 className="text-3xl font-bold mb-8 text-white">
            Veronica, ¿puedo ser tu novio? ❤️
          </h1>
          <p className="text-xl text-white mb-4">
            {counter > 5 && `¡Acepta no seas asi! :(`}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setModalVisible("modal")}
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
          modalVisible === "modal" ? "" : "hidden"
        }`}
      >
        <LayoutAtropos innerClass="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">¡Gracias por decir que sí! 💖</h2>
          <p className="mb-4">Eres la mejor, Vera. Estoy muy feliz de que seas mi novia.</p>
          <button
            onClick={() => setModalVisible(null)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
          >
            Cerrar
          </button>
          <button onClick={() => setModalVisible("tetris")} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 ml-4 cursor-pointer">
            Jugar al tetris
          </button>
          <button onClick={() => setModalVisible("tresRaya")} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-4 cursor-pointer">
            Jugar al tres en raya
          </button>
          <button onClick={() => setModalVisible("Solitario")} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 ml-4 cursor-pointer">
            Jugar solitario
          </button>
        </LayoutAtropos>
      </div>
      <Tetris visible={modalVisible} setVisible={setModalVisible} />
      <TresRaya visible={modalVisible} setVisible={setModalVisible} />
      <Solitario visible={modalVisible} setVisible={setModalVisible} />
    </>
  );
}

export default App;
