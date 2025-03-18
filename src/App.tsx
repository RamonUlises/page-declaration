import { useState } from "react";
import { motion } from "framer-motion";

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

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-violet-500">
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
            onTouchStart={moveNoButton} // Esto hace que en móviles también se mueva
            animate={{ x: noPosition.x, y: noPosition.y }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            No 💔
          </motion.button>
        </div>
      </div>
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${modalVisible ? "" : "hidden"}`}>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">¡Gracias por decir que sí! 💖</h2>
          <p className="mb-4">Eres la mejor, Vera. Estoy muy feliz de que seas mi novia.</p>
          <button
            onClick={() => setModalVisible(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Cerrar
          </button>
      </div>
      </div>
    </>
  );
}

export default App;
