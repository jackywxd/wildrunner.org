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
        <img
          src={photo.src}
          alt={alt}
          title={title}
          sizes={sizes}
          loading="lazy"
        />
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
