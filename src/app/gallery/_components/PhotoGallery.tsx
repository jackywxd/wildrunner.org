"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import React from "react";
import PhotoAlbum from "react-photo-album";
import type { Gallery } from "#site/content";
import NextJsImage from "@/app/gallery/_components/NextJsImage";

export const PhotoGallery: React.FC<{ gallery: Gallery }> = ({ gallery }) => {
  const [index, setIndex] = useState(-1);

  const photos = gallery.images.map((img) => {
    return {
      src: img.src,
      width: img.width,
      height: img.height,
      blurDataURL: img.blurDataURL,
    };
  });

  return (
    <>
      <PhotoAlbum
        layout="rows"
        targetRowHeight={350}
        // layout="masonry"
        // columns={(containerWidth) => {
        //   if (containerWidth < 768) return 2;
        //   if (containerWidth < 1280) return 3;
        //   return 4;
        // }}
        photos={photos}
        render={{ image: NextJsImage }}
        defaultContainerWidth={1280}
        sizes={{ size: "calc(1280px)" }}
        onClick={({ index }) => setIndex(index)}
      />
      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        // enable optional lightbox plugins
        plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
      />
    </>
  );
};

export default PhotoGallery;
