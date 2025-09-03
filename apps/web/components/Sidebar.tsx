import { useState, useEffect, useRef, ReactNode } from "react";

interface SidebarProps {
  children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const maxWidth = 300;

  const openSidebar = () => {
    setIsOpen(true);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch && touch.clientX < 50) {
      isDragging.current = true;
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging.current) {
      const touch = e.touches[0];
      if (touch && touch.clientX > 100) {
        openSidebar();
        isDragging.current = false;
      }
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };
  const handleMouseDown = (e: MouseEvent) => {
    if (e.clientX < 50) {
      isDragging.current = true;
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && e.clientX > 100) {
      openSidebar();
      isDragging.current = false;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };
  const handleClickOutside = (e: MouseEvent | TouchEvent) => {
    if (isDragging.current || !isOpen) return;
    if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
      closeSidebar();
    }
  };

  useEffect(() => {
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: maxWidth }}
      >
        <div className="p-4 h-full overflow-y-auto">{children}</div>
      </div>
      <div
        className="fixed top-0 left-0 h-full w-2 bg-blue-500 z-50 lg:hidden cursor-ew-resize"
        onClick={openSidebar}
      />

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
