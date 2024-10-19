import Image from "next/image";
import { RenderImageContext, RenderImageProps } from "react-photo-album";
import "react-photo-album/rows.css";

export default function NextJsImage(
  { alt = "", title, sizes }: RenderImageProps,
  { photo, width, height }: RenderImageContext
) {
  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        aspectRatio: `${width} / ${height}`,
      }}
    >
      <Image
        fill
        src={photo}
        alt={alt}
        title={title}
        sizes={sizes}
        loading="lazy"
        placeholder={"blurDataURL" in photo ? "blur" : undefined}
      />
    </div>
  );
}
