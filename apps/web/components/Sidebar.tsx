import { useState, useEffect, useRef, ReactNode } from "react";
interface SidebarProps {
  children: ReactNode;
}
export default function Sidebar({ children }: SidebarProps) {
  const [width, setWidth] = useState(0);
  const isDragging = useRef(false);

  const maxWidth = 300;

  const startDragging = () => {
    isDragging.current = true;
  };

  const stopDragging = () => {
    isDragging.current = false;
  };
  const handleMouseMove = (e: MouseEvent) => {
    onDragging(e.clientX);
  };
  const onDragging = (clientX: number) => {
    if (isDragging.current) {
      const newWidth = Math.min(clientX, maxWidth);
      setWidth(newWidth);
    }
  };
  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      onDragging(touch.clientX);
    }
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, []);

  return (
    <>
      <div
        className="fixed top-0 left-0 h-full bg-gray-800 text-white shadow-lg z-50 overflow-y-hidden transition-all duration-100"
        style={{ width }}
      >
        <div className="p-4 ">{children}</div>
      </div>

      <div
        className="fixed top-0 left-0 h-full w-2 bg-blue-500 z-50 lg:hidden cursor-ew-resize"
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      />
    </>
  );
}
