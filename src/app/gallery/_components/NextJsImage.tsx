import { RenderImageContext, RenderImageProps } from "react-photo-album";
import "react-photo-album/rows.css";
import React, { useEffect, useRef, useState } from "react";

export const LazyImage = (
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && imgRef.current) {
          console.log("isIntersecting", entry.isIntersecting);
          setIsInView(true);
          observer.unobserve(imgRef.current);
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={imgRef}
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      {isInView ? (
        <div className="relative w-full h-full">
          <img
            src={photo.src}
            alt={alt}
            title={title}
            sizes={sizes}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: 0,
            }}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.opacity = "1";
              const blurDiv = img.nextElementSibling as HTMLDivElement;
              if (blurDiv) {
                blurDiv.style.opacity = "0";
              }
            }}
          />
          <div
            className="absolute inset-0 bg-gray-200 transition-opacity duration-300 ease-in-out"
            style={{
              backgroundImage: `url(${(photo as any).blurDataURL || ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            position: "relative",
            aspectRatio: `${width} / ${height}`,
            background: "#f0f0f0",
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

//  function NextJsImage(
//   { alt = "", title, sizes }: RenderImageProps,
//   { photo, width, height }: RenderImageContext
// ) {
//   return (
//     <div
//       style={{
//         width: "100%",
//         position: "relative",
//         aspectRatio: `${width} / ${height}`,
//       }}
//     >
//       <Image
//         fill
//         src={photo}
//         alt={alt}
//         title={title}
//         sizes={sizes}
//         loading="lazy"
//         placeholder={"blurDataURL" in photo ? "blur" : undefined}
//       />
//     </div>
//   );
// }

export default LazyImage;
