"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { RdPhoto } from "@/lib/veliteUtils";
import { useWindowSize } from "usehooks-ts";
import { calculateDisplayedDimensions } from "@/lib/utils";

interface IPhotoCardProps {
  item: RdPhoto;
  maxWidth?: number;
  maxHeight?: number;
  isMobile?: boolean;
  priority?: boolean;
  className?: string;
}

const PhotoCard: React.FC<IPhotoCardProps> = ({
  item: photo,
  maxWidth,
  maxHeight,
  isMobile = false,
  priority = true,
  className,
}) => {
  const { src, slug, width, height, blurDataURL } = photo;
  const [isInView, setIsInView] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const { displayedWidth, displayedHeight } = useMemo(() => {
    return calculateDisplayedDimensions(
      width,
      height,
      maxWidth ?? windowWidth,
      maxHeight ?? windowHeight
    );
  }, [width, height, maxWidth, windowWidth, maxHeight, windowHeight]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && cardRef.current) {
          setIsInView(true);
          observer.unobserve(cardRef.current);
        }
      },
      {
        rootMargin: "100px",
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  return (
    <div ref={cardRef} key={`photo-container-${slug}`} className={className}>
      {isInView ? (
        <Image
          ref={imgRef}
          src={src}
          alt={`cover image`}
          className="rounded-2xl"
          width={displayedWidth}
          height={displayedHeight}
          placeholder="blur"
          blurDataURL={blurDataURL}
          quality={70}
          loading="lazy"
          style={{
            margin: 0,
            width: displayedWidth,
            height: displayedHeight,
          }}
        />
      ) : (
        <div className="rounded-2xl h-full bg-gray-200"></div>
      )}
    </div>
  );
};

export default React.memo(PhotoCard);
