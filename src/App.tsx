import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./App.css";

interface ImageItem {
  src: string;
  alt: string;
  price: number;
  category: string;
}

interface PrintSize {
  label: string;
  price: number;
}

interface CartItem {
  image: ImageItem;
  size: PrintSize;
  quantity: number;
}

interface OrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  note: string;
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
    youtube: "https://www.youtube.com/channel/UC5ajwH9c05c5igTEhgrtrAw/join",
    facebook: "https://www.facebook.com/martin.sirovica",
  };
  // ============================================================

  // ============================================================
  // DONATION UNLOCK CODE — change this to any secret word/code
  // you share with donors after they donate.
  // ============================================================
  const DONATION_CODE = "martin2024";
  // ============================================================

  // ============================================================
  // EMAILJS CONFIG — sign up free at https://www.emailjs.com
  // Replace these with your Service ID, Template ID, Public Key
  // ============================================================
  const EMAILJS_SERVICE_ID = "service_e1rteh8";
  const EMAILJS_TEMPLATE_ID = "template_q1b4kkq";
  const EMAILJS_PUBLIC_KEY = "KXG425G7qulDtfOeK";
  // ============================================================

  // ============================================================
  // PRINT SIZES & PRICES — edit to suit your offerings
  // ============================================================
  const PRINT_SIZES: PrintSize[] = [
    { label: "10×15 cm", price: 9.99 },
    { label: "20×30 cm", price: 19.99 },
    { label: "30×45 cm", price: 34.99 },
    { label: "40×60 cm", price: 49.99 },
    { label: "50×75 cm", price: 69.99 },
  ];
  // ============================================================

  // Automatically load all images from ./assets/martinslike/
  // (Place your own images into src/assets/martinslike/)
  const imageModules = import.meta.glob("./assets/martinslike/*.jpeg", {
    eager: true,
  }) as Record<string, { default: string }>;

  // Map each filename to a category. Update these to match your images.
  // Any filename not listed here will be assigned "Priroda".
  const categoryMap: Record<string, string> = {
    // ── Crkve ────────────────────────────────────────────────
    "Crkva .jpeg": "Crkve",
    "Crkva.jpeg": "Crkve",
    "Gospa Hipodrom Zagreb.jpeg": "Crkve",
    "Gospin Park Stenjevec 2025..jpeg": "Crkve",
    "Gospin perivoj - Majka Božja.jpeg": "Crkve",
    "Majka Božja Okićka - Dan Svih Svetih 2025..jpeg": "Crkve",
    "Majka Božja Volavska Čudotvorna - Južni portal.jpeg": "Crkve",
    "Majka Božja Volavska Čudotvorna - Velika Gospa 2019..jpeg": "Crkve",
    "Marija Bistrica.jpeg": "Crkve",
    "Marija Bistrica 2.jpeg": "Crkve",
    "Sveti Duje - Peristil, Split 2025..jpeg": "Crkve",
    "Sveti Lovro Vivodina.jpeg": "Crkve",
    "Sveti Martin pod Okić gradom - Astrofoto 2025..jpeg": "Crkve",
    "Sveti Martin pod Okićem - 2025..jpeg": "Crkve",
    // ── Znamenitosti ─────────────────────────────────────────
    "Dedin pogled s Terihajskog brega na Okić grad - 2024..jpeg":
      "Znamenitosti",
    "Karta Zagreb i okolica, Coronelli 1686..jpeg": "Znamenitosti",
    "Okić grad iz Konšćice - 2024..jpeg": "Znamenitosti",
    "Okić grad nad morem magle s vrha Japetića - 2025..jpeg": "Znamenitosti",
    "Okić grad s Klaka u magli - 2024..jpeg": "Znamenitosti",
    // ── Događaji ─────────────────────────────────────────────
    "Hrvatski Sokol Sinj Hipodrom.jpeg": "Događaji",
    "Kralju Dmitre Zvonimire Hipodrom Zagreb.jpeg": "Događaji",
    // ── Priroda ──────────────────────────────────────────────
    "Astrofoto Sava.jpeg": "Priroda",
    "Crna Mlaka Potok - Brebrenica.jpeg": "Priroda",
    "Jarun.jpeg": "Priroda",
    "Jastrebarsko s vrha Japetića - 2025..jpeg": "Priroda",
    "Jezero Peruča Cetina.jpeg": "Priroda",
    "Julijske Alpe s vrha Japetića - 2025..jpeg": "Priroda",
    "Planinarski dom Žitnica na Japetiću 2025..jpeg": "Priroda",
    "Plešivica i Okić grad nad morem magle s vrha Japetića 2025..jpeg":
      "Priroda",
    "Prozor-Cetina.jpeg": "Priroda",
    "Sava.jpeg": "Priroda",
    "Slap Brisalo - Slapnica Žumberak 2025..jpeg": "Priroda",
    "Svibanj potok Volavje.jpeg": "Priroda",
    "Sveta Gera s vrha Japetića - 2025..jpeg": "Priroda",
    "Trag u Beskraju - Zlarin 2023..jpeg": "Priroda",
    "Vatra.jpeg": "Priroda",
    "Zlarin 2023..jpeg": "Priroda",
    "Žumberak Slapnica.jpeg": "Priroda",
    "Žumberak Slapnica 3.jpeg": "Priroda",
    "Žumberak Slapnica 4.jpeg": "Priroda",
    "Žumberak Slapnica 5.jpeg": "Priroda",
    "Žumberak Slapnica 6.jpeg": "Priroda",
    "Žumberak Slapnica 7.jpeg": "Priroda",
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

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("gallery-favorites");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const CATEGORY_ORDER = [
    "Sve",
    "Crkve",
    "Znamenitosti",
    "Događaji",
    "Priroda",
  ];

  const categories = [
    ...CATEGORY_ORDER.filter(
      (c) => c === "Sve" || images.some((img) => img.category === c),
    ),
    ...(favorites.size > 0 ? ["Favoriti"] : []),
    // Any category not in the predefined order goes at the end
    ...Array.from(new Set(images.map((img) => img.category))).filter(
      (c) => !CATEGORY_ORDER.includes(c),
    ),
  ];

  const [selectedCategory, setSelectedCategory] = useState("Sve");
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
  const slideshowRef = useRef<number | null>(null);
  // Holds preloaded Image objects so the browser doesn't GC them before painting
  const preloadedImages = useRef<Map<string, HTMLImageElement>>(new Map());

  // Dedicated state for background image URL
  const [backgroundUrl, setBackgroundUrl] = useState<string>("");
  const [showLightbox, setShowLightbox] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockInput, setUnlockInput] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  // Shop state
  const [productModalImage, setProductModalImage] = useState<ImageItem | null>(
    null,
  );
  const [selectedSize, setSelectedSize] = useState<PrintSize>(PRINT_SIZES[1]);
  const [productQty, setProductQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "paypal" | "pouzece" | null
  >(null);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    note: "",
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handleUnlockSubmit = () => {
    if (unlockInput.trim() === DONATION_CODE) {
      setShowUnlockModal(false);
      setUnlockInput("");
      setUnlockError(false);
    } else {
      setUnlockError(true);
    }
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.size.price * item.quantity,
    0,
  );
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openProductModal = (image: ImageItem) => {
    setProductModalImage(image);
    setSelectedSize(PRINT_SIZES[1]);
    setProductQty(1);
  };

  const addToCart = () => {
    if (!productModalImage) return;
    setCart((prev) => {
      const existing = prev.findIndex(
        (i) =>
          i.image.src === productModalImage.src &&
          i.size.label === selectedSize.label,
      );
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = {
          ...next[existing],
          quantity: next[existing].quantity + productQty,
        };
        return next;
      }
      return [
        ...prev,
        { image: productModalImage, size: selectedSize, quantity: productQty },
      ];
    });
    setProductModalImage(null);
    setShowCart(true);
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const submitOrder = async () => {
    if (
      !orderForm.name ||
      !orderForm.email ||
      !orderForm.phone ||
      !orderForm.address ||
      !orderForm.city
    ) {
      setOrderError("Molim ispunite sva obavezna polja.");
      return;
    }
    setOrderSubmitting(true);
    setOrderError("");
    const itemsList = cart
      .map(
        (i) =>
          `${i.image.alt} — ${i.size.label} × ${i.quantity} kom = ${(
            i.size.price * i.quantity
          ).toFixed(2)} €`,
      )
      .join("\n");
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: "martin.sirovica@gmail.com",
          to_name: "Martin Sirovica",
          reply_to: orderForm.email,
          customer_name: orderForm.name,
          customer_email: orderForm.email,
          customer_phone: orderForm.phone,
          customer_address: `${orderForm.address}, ${orderForm.city}`,
          order_items: itemsList,
          order_total: `${cartTotal.toFixed(2)} €`,
          payment_method: "Pouzeće",
          note: orderForm.note || "—",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setOrderSubmitted(true);
      setCart([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setOrderError(`Slanje nije uspjelo: ${msg}`);
    } finally {
      setOrderSubmitting(false);
    }
  };

  const toggleFavorite = (src: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      localStorage.setItem("gallery-favorites", JSON.stringify([...next]));
      return next;
    });
  };

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
    selectedCategory === "Sve"
      ? images
      : selectedCategory === "Favoriti"
        ? images.filter((img) => favorites.has(img.src))
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox) {
        if (e.key === "Escape") setShowLightbox(false);
        if (e.key === "ArrowRight")
          setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
        if (e.key === "ArrowLeft")
          setCurrentIndex(
            (prev) =>
              (prev - 1 + filteredImages.length) % filteredImages.length,
          );
      } else if (!showGridView) {
        if (e.key === "ArrowRight")
          setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
        if (e.key === "ArrowLeft")
          setCurrentIndex(
            (prev) =>
              (prev - 1 + filteredImages.length) % filteredImages.length,
          );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, showGridView, filteredImages.length]);

  // Slideshow autoplay
  useEffect(() => {
    if (isPlaying) {
      slideshowRef.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
      }, 1800);
    }
    return () => {
      if (slideshowRef.current) {
        window.clearInterval(slideshowRef.current);
        slideshowRef.current = null;
      }
    };
  }, [isPlaying, filteredImages.length]);

  // Preload neighbors immediately when the index changes so the next swipe
  // never shows a white frame while the browser fetches the image.
  useEffect(() => {
    const preload = (src: string) => {
      if (preloadedImages.current.has(src)) return;
      const el = new window.Image();
      el.src = src;
      preloadedImages.current.set(src, el);
    };
    // Preload 4 ahead and 2 behind
    for (let offset = -2; offset <= 4; offset++) {
      const idx =
        (currentIndex + offset + filteredImages.length) % filteredImages.length;
      if (filteredImages[idx]) preload(filteredImages[idx].src);
    }
  }, [currentIndex, filteredImages]);

  // After the LCP settles, silently preload every remaining image so that
  // no matter how fast the user swipes there are no more white flashes.
  useEffect(() => {
    const tid = window.setTimeout(() => {
      filteredImages.forEach((img) => {
        if (!preloadedImages.current.has(img.src)) {
          const el = new window.Image();
          el.src = img.src;
          preloadedImages.current.set(img.src, el);
        }
      });
    }, 1500);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent right-click saving and common download shortcuts
  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
      }
    };
    const preventShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "s" || e.key === "u" || e.key === "p")) {
        e.preventDefault();
      }
    };
    document.addEventListener("contextmenu", preventRightClick);
    document.addEventListener("keydown", preventShortcuts);
    return () => {
      document.removeEventListener("contextmenu", preventRightClick);
      document.removeEventListener("keydown", preventShortcuts);
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
        title={showGridView ? "Full Screen View" : "Toggle Grid View"}
      >
        {showGridView ? "⛶" : "⊞"}
      </button>
      <button
        className="cart-btn-fixed"
        onClick={() => setShowCart(true)}
        title="Košarica"
      >
        🛒
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
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
                    key={currentImage.src}
                    src={currentImage.src}
                    alt={currentImage.alt}
                    className="carousel-image current"
                    style={{ zIndex: 1 }}
                    draggable={false}
                    fetchPriority="high"
                    decoding="sync"
                    onContextMenu={(e) => e.preventDefault()}
                    onClick={() => {
                      if (!isDragging && !hasDragged.current) {
                        openProductModal(currentImage);
                      }
                    }}
                  />
                )}
                {swipedImage && (
                  <img
                    src={swipedImage.src}
                    alt={swipedImage.alt}
                    className="carousel-image current"
                    draggable={false}
                    decoding="sync"
                    onContextMenu={(e) => e.preventDefault()}
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
                {currentImage && !isDragging && (
                  <div className="carousel-image-hover-overlay">
                    <span className="carousel-image-hover-name">
                      {currentImage.alt}
                    </span>
                    <button
                      className="carousel-add-to-cart-btn"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        openProductModal(currentImage);
                      }}
                    >
                      🛒 Dodaj u košaricu
                    </button>
                  </div>
                )}
                <div className="watermark-overlay" />
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
              <p className="image-counter">
                {currentIndex + 1} / {filteredImages.length}
              </p>
            </div>
            <div className="image-actions">
              <button
                className={`action-button favorite-btn${
                  currentImage && favorites.has(currentImage.src)
                    ? " active"
                    : ""
                }`}
                onClick={() => currentImage && toggleFavorite(currentImage.src)}
                title={
                  currentImage && favorites.has(currentImage.src)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {currentImage && favorites.has(currentImage.src) ? "♥" : "♡"}
              </button>
              <button
                className={`action-button slideshow-btn${isPlaying ? " active" : ""}`}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>
              <button
                className="action-button zoom-btn"
                onClick={() => setShowLightbox(true)}
                title="View fullscreen"
              >
                ⤢
              </button>
              <button
                className="action-button cart-btn"
                onClick={() => currentImage && openProductModal(currentImage)}
                title="Dodaj u košaricu"
              >
                🛒
              </button>
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
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="support-link youtube"
                  title="YouTube"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  YouTube
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
                <img
                  src={img.src}
                  alt={img.alt}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  onContextMenu={(e) => e.preventDefault()}
                />
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
              onClick={() => openProductModal(image)}
            >
              <img
                src={image.src}
                alt={image.alt}
                draggable={false}
                loading="lazy"
                decoding="async"
                onContextMenu={(e) => e.preventDefault()}
              />
              <div className="watermark-overlay" />
              <div className="grid-item-info">
                <p className="grid-item-title">{image.alt}</p>
              </div>
              <button
                className={`grid-favorite-btn${favorites.has(image.src) ? " active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(image.src);
                }}
                title={
                  favorites.has(image.src)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                {favorites.has(image.src) ? "♥" : "♡"}
              </button>
            </div>
          ))}
        </div>
      )}
      {/* ── PRODUCT SIZE MODAL ──────────────────────── */}
      {productModalImage && (
        <div
          className="shop-overlay"
          onClick={() => setProductModalImage(null)}
        >
          <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="shop-close"
              onClick={() => setProductModalImage(null)}
            >
              ✕
            </button>
            <div className="shop-modal-inner">
              <div className="shop-preview-wrap">
                <img
                  src={productModalImage.src}
                  alt={productModalImage.alt}
                  className="shop-preview"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <div className="watermark-overlay" />
              </div>
              <div className="shop-details">
                <h2 className="shop-title">{productModalImage.alt}</h2>
                <p className="shop-subtitle">Odaberite dimenzije ispisa</p>
                <div className="shop-sizes">
                  {PRINT_SIZES.map((size) => (
                    <button
                      key={size.label}
                      className={`shop-size-btn${selectedSize.label === size.label ? " active" : ""}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      <span className="shop-size-label">{size.label}</span>
                      <span className="shop-size-price">
                        {size.price.toFixed(2)} €
                      </span>
                    </button>
                  ))}
                </div>
                <div className="shop-qty-row">
                  <label className="shop-qty-label">Količina</label>
                  <div className="shop-qty-controls">
                    <button
                      className="shop-qty-btn"
                      onClick={() => setProductQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span className="shop-qty-value">{productQty}</span>
                    <button
                      className="shop-qty-btn"
                      onClick={() => setProductQty((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="shop-total">
                  Ukupno:{" "}
                  <strong>
                    {(selectedSize.price * productQty).toFixed(2)} €
                  </strong>
                </p>
                <button className="shop-add-btn" onClick={addToCart}>
                  Dodaj u košaricu
                </button>
                <button
                  className="shop-back-btn"
                  onClick={() => setProductModalImage(null)}
                >
                  &#8592; Natrag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CART MODAL ──────────────────────────────── */}
      {showCart && (
        <div className="shop-overlay" onClick={() => setShowCart(false)}>
          <div
            className="cart-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-modal-header">
              <h2>Košarica</h2>
              <button className="shop-close" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">Košarica je prazna.</p>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item, idx) => (
                    <div key={idx} className="cart-row">
                      <img
                        src={item.image.src}
                        alt={item.image.alt}
                        className="cart-row-img"
                        draggable={false}
                        loading="lazy"
                        decoding="async"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      <div className="cart-row-info">
                        <p className="cart-row-title">{item.image.alt}</p>
                        <p className="cart-row-meta">
                          {item.size.label} × {item.quantity} kom
                        </p>
                        <p className="cart-row-price">
                          {(item.size.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                      <button
                        className="cart-row-remove"
                        onClick={() => removeFromCart(idx)}
                        title="Ukloni"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <p className="cart-footer-total">
                    Ukupno: <strong>{cartTotal.toFixed(2)} €</strong>
                  </p>
                  <button
                    className="cart-checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                      setPaymentMethod(null);
                      setOrderSubmitted(false);
                      setOrderError("");
                    }}
                  >
                    Naruči
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CHECKOUT MODAL ──────────────────────────── */}
      {showCheckout && (
        <div
          className="shop-overlay"
          onClick={() => {
            if (!orderSubmitting) setShowCheckout(false);
          }}
        >
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h2>
                {orderSubmitted ? "Narudžba primljena ✅" : "Odabir plaćanja"}
              </h2>
              {!orderSubmitting && (
                <button
                  className="shop-close"
                  onClick={() => setShowCheckout(false)}
                >
                  ✕
                </button>
              )}
            </div>

            {orderSubmitted ? (
              <div className="order-success">
                <p>
                  Hvala na narudžbi! Javit ću se što prije na vaš e-mail ili
                  telefon.
                </p>
                <button
                  className="cart-checkout-btn"
                  onClick={() => setShowCheckout(false)}
                >
                  Zatvori
                </button>
              </div>
            ) : (
              <>
                {/* Order summary */}
                <div className="checkout-summary">
                  {cart.map((item, idx) => (
                    <div key={idx} className="checkout-summary-row">
                      <span>
                        {item.image.alt} — {item.size.label} × {item.quantity}
                      </span>
                      <span>
                        {(item.size.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                  <div className="checkout-summary-total">
                    <span>Ukupno</span>
                    <strong>{cartTotal.toFixed(2)} €</strong>
                  </div>
                </div>

                {/* Payment method */}
                <p className="checkout-label">Način plaćanja</p>
                <div className="checkout-methods">
                  <button
                    className={`checkout-method-btn${
                      paymentMethod === "paypal" ? " active" : ""
                    }`}
                    onClick={() => setPaymentMethod("paypal")}
                  >
                    💳 Online (PayPal)
                  </button>
                  <button
                    className={`checkout-method-btn${
                      paymentMethod === "pouzece" ? " active" : ""
                    }`}
                    onClick={() => setPaymentMethod("pouzece")}
                  >
                    📦 Pouzeće
                  </button>
                </div>

                {paymentMethod === "paypal" && (
                  <div className="checkout-paypal">
                    <p>
                      Bit ćete preusmjereni na PayPal za plaćanje iznosa od{" "}
                      <strong>{cartTotal.toFixed(2)} €</strong>. Nakon plaćanja
                      kontaktirajte me da dogovorimo dostavu.
                    </p>
                    <a
                      href={`${socialLinks.paypal}/${cartTotal.toFixed(2)}EUR`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cart-checkout-btn"
                      onClick={() => setShowCheckout(false)}
                    >
                      Plati putem PayPal
                    </a>
                  </div>
                )}

                {paymentMethod === "pouzece" && (
                  <div className="checkout-form">
                    <p className="checkout-form-note">
                      Ispunite obrazac i ja ću vam se javiti za potvrdu.
                    </p>
                    <div className="checkout-fields">
                      <input
                        className="checkout-input"
                        placeholder="Ime i prezime *"
                        value={orderForm.name}
                        onChange={(e) =>
                          setOrderForm((f) => ({ ...f, name: e.target.value }))
                        }
                      />
                      <input
                        className="checkout-input"
                        placeholder="E-mail *"
                        type="email"
                        value={orderForm.email}
                        onChange={(e) =>
                          setOrderForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="checkout-input"
                        placeholder="Telefon *"
                        type="tel"
                        value={orderForm.phone}
                        onChange={(e) =>
                          setOrderForm((f) => ({
                            ...f,
                            phone: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="checkout-input"
                        placeholder="Adresa dostave *"
                        value={orderForm.address}
                        onChange={(e) =>
                          setOrderForm((f) => ({
                            ...f,
                            address: e.target.value,
                          }))
                        }
                      />
                      <input
                        className="checkout-input"
                        placeholder="Grad / Poštanski broj *"
                        value={orderForm.city}
                        onChange={(e) =>
                          setOrderForm((f) => ({ ...f, city: e.target.value }))
                        }
                      />
                      <textarea
                        className="checkout-input checkout-textarea"
                        placeholder="Napomena (nije obavezno)"
                        value={orderForm.note}
                        onChange={(e) =>
                          setOrderForm((f) => ({ ...f, note: e.target.value }))
                        }
                      />
                    </div>
                    {orderError && (
                      <p className="checkout-error">{orderError}</p>
                    )}
                    <button
                      className="cart-checkout-btn"
                      onClick={submitOrder}
                      disabled={orderSubmitting}
                    >
                      {orderSubmitting ? "Slanje..." : "Pošalji narudžbu"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showUnlockModal && (
        <div
          className="unlock-overlay"
          onClick={() => {
            setShowUnlockModal(false);
            setUnlockInput("");
            setUnlockError(false);
          }}
        >
          <div className="unlock-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="unlock-title">🔓 Donors Only</h2>
            <p className="unlock-desc">
              Download access is available to donors. After donating, you will
              receive an unlock code.
            </p>
            <input
              className={`unlock-input${unlockError ? " error" : ""}`}
              type="password"
              placeholder="Enter your donation code"
              value={unlockInput}
              onChange={(e) => {
                setUnlockInput(e.target.value);
                setUnlockError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlockSubmit()}
              autoFocus
            />
            {unlockError && (
              <p className="unlock-error">Incorrect code. Please try again.</p>
            )}
            <div className="unlock-actions">
              <button className="unlock-submit" onClick={handleUnlockSubmit}>
                Unlock
              </button>
              <button
                className="unlock-cancel"
                onClick={() => {
                  setShowUnlockModal(false);
                  setUnlockInput("");
                  setUnlockError(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showLightbox && currentImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setShowLightbox(false)}
        >
          <button
            className="lightbox-close"
            onClick={() => setShowLightbox(false)}
          >
            ✕
          </button>
          <button
            className="lightbox-nav lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(
                (prev) =>
                  (prev - 1 + filteredImages.length) % filteredImages.length,
              );
            }}
          >
            ‹
          </button>
          <div
            className="lightbox-img-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage.src}
              alt={currentImage.alt}
              className="lightbox-image"
              draggable={false}
              loading="lazy"
              decoding="async"
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="watermark-overlay" />
          </div>
          <button
            className="lightbox-nav lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
            }}
          >
            ›
          </button>
          <div
            className="lightbox-caption"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="lightbox-title">{currentImage.alt}</span>
            <span className="lightbox-count">
              {currentIndex + 1} / {filteredImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
