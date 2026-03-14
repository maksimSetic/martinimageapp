import { useState, useRef, useEffect } from "react";
import "./App.css";

interface ImageItem {
  src: string;
  alt: string;
  price: number;
  category: string;
}

function App() {
  // Automatically load all images from ./assets/martinslike/
  // (Place your own images into src/assets/martinslike/)
  const imageModules = import.meta.glob("./assets/martinslike/*.jpeg", {
    eager: true,
  }) as Record<string, { default: string }>;

  // Map each filename to a category. Update these to match your images.
  // Any filename not listed here will be assigned "Ostalo".
  const categoryMap: Record<string, string> = {
    "AstrofotoSava.jpeg": "Priroda",
    "Crkva.jpeg": "Crkve",
    "Crkva2.jpeg": "Crkve",
    "Crkva3.jpeg": "Crkve",
    "Crkva4.jpeg": "Crkve",
    "Crkva5.jpeg": "Crkve",
    "Crkva6.jpeg": "Crkve",
    "Crkva7.jpeg": "Crkve",
    "Crkva8.jpeg": "Crkve",
    "CrkvaStenjevec.jpeg": "Crkve",
    "CrnaMlakaPotokBrebrenica.jpeg": "Priroda",
    "GospaHipodromZagreb.jpeg": "Zagreb",
    "HrvatskiSokolSinjHipodrom.jpeg": "Događaji",
    "JarunZagreb.jpeg": "Zagreb",
    "JezeroPeručaCetina.jpeg": "Priroda",
    "KartaZagreb.jpeg": "Zagreb",
    "KraljuDmitreZvonimireHipodromZagreb.jpeg": "Događaji",
    "MarijaBistrica.jpeg": "Crkve",
    "MarijaBistrica2.jpeg": "Crkve",
    "OkićGrad.jpeg": "Znamenitosti",
    "OkićGrad2.jpeg": "Znamenitosti",
    "OkićGrad3.jpeg": "Znamenitosti",
    "OkićGrad4.jpeg": "Znamenitosti",
    "Panorama s Japetića 2.jpeg": "Priroda",
    "Panorama s Japetića 3.jpeg": "Priroda",
    "Panorama s Japetića 4.jpeg": "Priroda",
    "Panorama s Japetića 5.jpeg": "Priroda",
    "Panorama s Japetića 6.jpeg": "Priroda",
    "Panorama s Japetića.jpeg": "Priroda",
    "Prozor-Cetina.jpeg": "Priroda",
    "SavaZagreb.jpeg": "Zagreb",
    "SvetiLovroVivodina.jpeg": "Crkve",
    "Svibanj potok Volavje.jpeg": "Priroda",
    "Trag u Beskraju - Zlarin 2023..jpeg": "Znamenitosti",
    "Vatra.jpeg": "Priroda",
    "Zlarin 2023..jpeg": "Znamenitosti",
    "ŽumberakSlapnica.jpeg": "Priroda",
    "ŽumberakSlapnica2.jpeg": "Priroda",
    "ŽumberakSlapnica3.jpeg": "Priroda",
    "ŽumberakSlapnica4.jpeg": "Priroda",
    "ŽumberakSlapnica5.jpeg": "Priroda",
    "ŽumberakSlapnica6.jpeg": "Priroda",
    "ŽumberSlapnica6.jpeg": "Priroda",
  };

  // Only keep unique images by src
  const seenSrc = new Set<string>();
  const images: ImageItem[] = Object.entries(imageModules)
    .map(([modulePath, mod], index) => {
      const filename = modulePath.split("/").pop()?.split("\\").pop() ?? "";
      const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
      return {
        src: mod.default,
        alt: nameWithoutExt,
        price: 29.99 + index * 5,
        category: categoryMap[filename] ?? "Priroda",
      };
    })
    .filter((img) => {
      if (seenSrc.has(img.src)) return false;
      seenSrc.add(img.src);
      return true;
    });

  const categories = [
    "All",
    ...Array.from(new Set(images.map((img) => img.category))),
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(
      0,
      images.findIndex((img) => img.alt === "Crna Mlaka Potok - Brebrenica"),
    ),
  );
  const [showGridView, setShowGridView] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [dragOffset, setDragOffset] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | "up" | "down" | null
  >(null);
  const [swipedImage, setSwipedImage] = useState<ImageItem | null>(null);
  const targetIndex = useRef(0);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const hasDragged = useRef(false);
  const swipeTimeout = useRef<number | null>(null);

  // Dedicated state for background image URL
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingSwipe) return;
    if (swipeTimeout.current) {
      window.clearTimeout(swipeTimeout.current);
      swipeTimeout.current = null;
    }

    const currentImage = filteredImages[currentIndex];
    setSwipedImage(currentImage || null);

    // Determine the next image that should appear underneath while dragging
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    targetIndex.current = nextIndex;

    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    setDragOffset(0);
    setDragOffsetY(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    event.preventDefault();
    hasDragged.current = true;
    setDragOffset(event.clientX - dragStartX.current);
    setDragOffsetY(event.clientY - dragStartY.current);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const threshold = 60;
    const absX = Math.abs(dragOffset);
    const absY = Math.abs(dragOffsetY);

    let direction: "left" | "right" | "up" | "down" | null = null;

    if (absX > absY) {
      if (dragOffset <= -threshold) {
        direction = "left";
      } else if (dragOffset >= threshold) {
        direction = "right";
      }
    } else {
      if (dragOffsetY <= -threshold) {
        direction = "up";
      } else if (dragOffsetY >= threshold) {
        direction = "down";
      }
    }

    if (direction) {
      const nextIndex = targetIndex.current;

      setSwipeDirection(direction);
      setIsAnimatingSwipe(true);
      setIsDragging(false);

      setCurrentIndex(nextIndex);

      const distance = 1300;
      if (direction === "left") {
        setDragOffset(-distance);
        setDragOffsetY(0);
      } else if (direction === "right") {
        setDragOffset(distance);
        setDragOffsetY(0);
      } else if (direction === "up") {
        setDragOffset(0);
        setDragOffsetY(-distance);
      } else if (direction === "down") {
        setDragOffset(0);
        setDragOffsetY(distance);
      }

      swipeTimeout.current = window.setTimeout(() => {
        setIsAnimatingSwipe(false);
        setSwipeDirection(null);
        setDragOffset(0);
        setDragOffsetY(0);
        setSwipedImage(null);
      }, 250);
    } else {
      setDragOffset(0);
      setDragOffsetY(0);
      setIsDragging(false);
      setSwipedImage(null);
    }

    hasDragged.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = () => {
    setDragOffset(0);
    setDragOffsetY(0);
    setIsDragging(false);
    setSwipedImage(null);
    hasDragged.current = false;
  };

  const filteredImages =
    selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const currentImage = filteredImages[currentIndex];

  // Sync background image to always match the visible image
  useEffect(() => {
    if (!showGridView && filteredImages[currentIndex]) {
      setBackgroundUrl(filteredImages[currentIndex].src);
    } else if (showGridView && filteredImages.length > 0) {
      // In grid view, show the background of the currently selected image
      setBackgroundUrl(filteredImages[currentIndex]?.src || "");
    }
  }, [currentIndex, filteredImages, showGridView]);

  const nextImage = () => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % filteredImages.length;
      return next;
    });
  };

  const prevImage = () => {
    setCurrentIndex((prev) => {
      const next = (prev - 1 + filteredImages.length) % filteredImages.length;
      return next;
    });
  };

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentIndex(0);
  };

  useEffect(() => {
    return () => {
      if (swipeTimeout.current) {
        window.clearTimeout(swipeTimeout.current);
      }
    };
  }, []);

  const currentTransform = (() => {
    if (isAnimatingSwipe && swipeDirection) {
      const distance = 1200;
      switch (swipeDirection) {
        case "left":
          return `translateX(${-distance}px) rotate(-25deg)`;
        case "right":
          return `translateX(${distance}px) rotate(25deg)`;
        case "up":
          return `translateY(${-distance}px) rotate(-25deg)`;
        case "down":
          return `translateY(${distance}px) rotate(25deg)`;
      }
    }

    const rotate = dragOffset / 10;
    return `translate(${dragOffset}px, ${dragOffsetY}px) rotate(${rotate}deg)`;
  })();

  const currentTransition = isDragging ? "none" : "transform 0.35s ease";

  return (
    <div className="app">
      <div
        className="background"
        style={{
          backgroundImage: backgroundUrl
            ? `url("${backgroundUrl}")`
            : undefined,
        }}
      ></div>
      <div className="header">
        <h1>Martin Sirovica</h1>
        <div className="header-buttons">
          <button
            className="mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            title="Menu"
          >
            ☰
          </button>
        </div>
        {showMobileMenu && (
          <div className="mobile-menu">
            <div className="mobile-menu-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`mobile-category-button ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => {
                    selectCategory(category);
                    setShowMobileMenu(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="mobile-menu-divider"></div>
            <button
              className="mobile-menu-item"
              onClick={() => {
                setShowGridView(true);
                setShowMobileMenu(false);
              }}
            >
              Grid View
            </button>
          </div>
        )}
      </div>
      <button
        className="grid-button-fixed"
        onClick={() => setShowGridView(!showGridView)}
        title="Toggle Grid View"
      >
        ⊞
      </button>
      {!showGridView ? (
        <div className="carousel-container desktop-layout">
          {/* main display area */}
          <div className="main-display">
            <div className="carousel-content">
              <div
                className={`image-wrapper${isDragging ? " dragging" : ""}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                {currentImage && !isDragging && (
                  <img
                    src={currentImage.src}
                    alt={currentImage.alt}
                    className="carousel-image current"
                    style={{ zIndex: 1 }}
                    onClick={() => {
                      if (!isDragging && !hasDragged.current) {
                        setShowGridView(true);
                      }
                    }}
                  />
                )}
                {swipedImage && (
                  <img
                    src={swipedImage.src}
                    alt={swipedImage.alt}
                    className="carousel-image current"
                    style={{
                      transform: currentTransform,
                      transition: currentTransition,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      zIndex: 2,
                    }}
                  />
                )}
              </div>
              <div className="nav-buttons-container">
                <button
                  className="nav-button prev"
                  onClick={() => prevImage()}
                  disabled={filteredImages.length <= 1}
                >
                  &lt;
                </button>
                <button
                  className="nav-button next"
                  onClick={() => nextImage()}
                  disabled={filteredImages.length <= 1}
                >
                  &gt;
                </button>
              </div>
            </div>
            <div className="image-info">
              <p className="image-title">{filteredImages[currentIndex]?.alt}</p>
            </div>
            <div className="support-section">
              <span className="support-label">Podržite me</span>
              <div className="support-links">
                <a
                  href="https://www.paypal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link paypal"
                  title="PayPal"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
                  </svg>
                  PayPal
                </a>
                <a
                  href="https://www.patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link patreon"
                  title="Patreon"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623 4.75 0 8.615-3.868 8.615-8.623C24 4.36 20.136.48 15.385.48z" />
                  </svg>
                  Patreon
                </a>
              </div>
            </div>
          </div>
          {/* thumbnail sidebar */}
          <div className="thumbnail-sidebar">
            {filteredImages.map((img, idx) => (
              <div
                key={idx}
                className={`thumbnail-item ${idx === currentIndex ? "active" : ""}`}
                onClick={() => {
                  setCurrentIndex(idx);
                }}
              >
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid-view">
          {filteredImages.map((image, index) => (
            <div
              key={index}
              className="grid-item"
              onClick={() => {
                setCurrentIndex(index);
                setShowGridView(false);
              }}
            >
              <img src={image.src} alt={image.alt} />
              <div className="grid-item-info">
                <p className="grid-item-title">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
