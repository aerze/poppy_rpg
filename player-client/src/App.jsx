import "./App.scss";
import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { Main } from "./components/main";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { SocketContext, SocketProvider } from "./context/socket";
import { createBrowserRouter, Link, Navigate, RouterProvider, useNavigate } from "react-router-dom";
import ErrorPage from "./pages/error";
import { HUD } from "./components/hud";
import { CharacterScene } from "./scenes/character";
import { FieldScene } from "./scenes/field/field";
import { Town } from "./pages/town";
import { Character } from "./pages/character";

const hasNative = document && (document.elementsFromPoint || document.msElementsFromPoint);

function getDropTargetElementsAtPoint(x, y, dropTargets) {
  return dropTargets.filter((t) => {
    const rect = t.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y <= rect.bottom && y >= rect.top;
  });
}

// use custom function only if elementsFromPoint is not supported
const backendOptions = {
  enableMouseEvents: true,
  getDropTargetElementsAtPoint: !hasNative && getDropTargetElementsAtPoint,
};

export function Redirect() {
  const { connected } = useContext(SocketContext);

  if (!connected) {
    return <Navigate to="/app/menu" replace={true} />;
  } else {
    return <Navigate to="/app/🐸" replace={true} />;
  }
}

const router = createBrowserRouter([
  {
    errorElement: <Redirect />,
  },
  {
    path: "/app",
    element: <Redirect />,
    // errorElement: <ErrorPage />,
  },

  {
    path: "/app/menu",
    element: <Main />,
    // errorElement: <ErrorPage />,
  },
  {
    path: "/app/🐸",
    element: <HUD />,
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="🏡"></Navigate>,
      },
      {
        path: "🏡",
        element: <Town></Town>,
      },
      {
        path: "🤔",
        element: <Character />,
      },
      {
        path: "✨",
        element: <FieldScene></FieldScene>,
      },
      {
        path: "🪅",
        element: (
          <div>
            <div className="hud-top-buffer"></div>
            <h2> party </h2>
          </div>
        ),
      },
      {
        path: "⚖️",
        element: (
          <div>
            <div className="hud-top-buffer"></div>
            <h2> shops </h2>
          </div>
        ),
      },
      {
        path: "⚜️",
        element: (
          <div>
            <div className="hud-top-buffer"></div>
            <h2> guild </h2>
          </div>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <SocketProvider>
      <DndProvider backend={TouchBackend} options={backendOptions}>
        <RouterProvider router={router}></RouterProvider>
      </DndProvider>
    </SocketProvider>
  );
}

export default App;
