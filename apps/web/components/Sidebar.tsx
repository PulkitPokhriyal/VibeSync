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
    // Only allow closing on mobile
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
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
    if (window.innerWidth < 1024 && e.clientX < 50) {
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
    if (window.innerWidth >= 1024 || isDragging.current || !isOpen) {
      return;
    }
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      <div
        ref={sidebarRef}
        className={`
          h-full text-white shadow-lg z-50 overflow-y-auto 
          transition-transform duration-300 flex-shrink-0
          fixed top-0 left-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto lg:rounded-lg
          bg-gray-800
          lg:glassmorphism
        `}
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
