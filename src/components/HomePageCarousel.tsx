import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomePageCarouselProps {
  children: React.ReactNode[];
  onPageChange?: (page: number) => void;
}

export function HomePageCarousel({
  children,
  onPageChange,
}: HomePageCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const goToPage = useCallback(
    (page: number) => {
      setDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [currentPage, onPageChange],
  );

  const goToNext = useCallback(() => {
    if (currentPage < children.length - 1) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, children.length, goToPage]);

  const goToPrevious = useCallback(() => {
    if (currentPage > 0) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    },
    [goToPrevious, goToNext],
  );

  return (
    <div
      className="flex flex-col h-full"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 页面指示器 */}
      <div className="flex justify-center gap-2 py-3">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => goToPage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentPage
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50 w-2"
            }`}
          />
        ))}
      </div>

      {/* 翻页内容 */}
      <div className="flex-1 relative overflow-hidden">
        {/* 左箭头 */}
        {currentPage > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        )}

        {/* 右箭头 */}
        {currentPage < children.length - 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        )}

        {/* 页面动画 */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (direction: number) => ({
                x: direction > 0 ? 1000 : -1000,
                opacity: 0,
              }),
              center: {
                zIndex: 1,
                x: 0,
                opacity: 1,
              },
              exit: (direction: number) => ({
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 overflow-y-auto"
          >
            {children[currentPage]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
