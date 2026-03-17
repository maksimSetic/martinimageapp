import { useState, useRef, useEffect } from "react";
import "./App.css";

interface ImageItem {
  src: string;
  alt: string;
  price: number;
  category: string;
}

function App() {
  // ============================================================
  // SOCIAL & SUPPORT LINKS — update these with your own URLs
  // ============================================================
  const socialLinks = {
    paypal: "https://www.paypal.com/paypalme/MartinSirovica",
    patreon: "https://www.patreon.com/YOUR_USERNAME",
    kofi: "https://ko-fi.com/martinsirovica",
    email: "mailto:martin.sirovica@gmail.com",
    instagram: "https://www.instagram.com/martin_sirovica",
    facebook: "https://www.facebook.com/martin.sirovica",
  };
  // ============================================================

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
                  href={socialLinks.paypal}
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
                  href={socialLinks.patreon}
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
                <a
                  href={socialLinks.kofi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link kofi"
                  title="Ko-fi"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.147.095-.372.026c-.225-.068-.187-.396-.187-.396l-.463-9.819h4.85l-.463 9.819s.038.328-.187.396c-.225.069-.372-.026-.372-.026zm4.305-3.455c-.643.658-1.558.995-2.467.995-.941 0-1.857-.366-2.494-1.062l4.961-3.976v4.043zm6.732 2.012c-.619 3.176-3.621 3.397-3.621 3.397l-.463-9.819h2.438l-.234 7.806c1.135-.234 1.673-1.135 1.88-1.384z" />
                  </svg>
                  Ko-fi
                </a>
                <a
                  href={socialLinks.email}
                  className="support-link email"
                  title="E-mail"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  E-mail
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link instagram"
                  title="Instagram"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link facebook"
                  title="Facebook"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
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
