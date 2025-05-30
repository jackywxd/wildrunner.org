"use client";

import React, { useEffect, useRef, useState } from "react";
import PhotoSwipeLightbox from "photoswipe/lightbox";
import "photoswipe/style.css";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";

import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import PhotoCard from "@/components/PhotoCard";
import { RdPhoto } from "@/lib/veliteUtils";
import min from "lodash/min";
import { motion, AnimatePresence } from "framer-motion";
import { transitionApple } from "@/styles/framer-motion";
import { Icon } from "@iconify-icon/react";
// import { cn } from "@/lib/cn";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import { formatDateTime } from "@//store/day";

// function ExifPanel(props: { showExif: boolean; rdPhoto: RdPhoto }) {
//   dayjs.extend(customParseFormat);
//   const format = "YYYY:MM:DD HH:mm:ss";
//   let photoDateTime = "未知拍摄时间";
//   if (props.rdPhoto?.exif?.exif?.DateTimeOriginal?.description) {
//     photoDateTime = formatDateTime(
//       props.rdPhoto.exif?.exif?.DateTimeOriginal?.description,
//       format
//     );
//   }
//   let photoTimeZone = "未知时区";
//   if (props.rdPhoto?.exif?.exif?.OffsetTimeOriginal?.description) {
//     const match =
//       props.rdPhoto.exif?.exif?.OffsetTimeOriginal?.description.match(
//         /^([+-])(\d{2}):(\d{2})$/
//       );
//     photoTimeZone = `UTC${match![1]}${match![2]}`;
//   }

//   return (
//     <div
//       className={cn(
//         "rd-card fixed backdrop-blur-bg top-[60px] right-[16px] max-w-[300px] max-h-[calc(100vh-120px)] z-[999999] p-4 flex flex-col gap-4",
//         props.showExif ? "" : "translate-x-[calc(100%+20px)]"
//       )}
//     >
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-lg mx-0.5 icon-[formkit--datetime]" />
//         {photoDateTime}, {photoTimeZone}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-xl icon-[fluent--slide-size-24-regular]" />
//         {props.rdPhoto?.width} x {props.rdPhoto?.height}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-xl icon-[heroicons--camera]" />
//         {props.rdPhoto?.exif?.exif?.Make?.description ?? "未知制造商"}
//         {`, `}
//         {props.rdPhoto?.exif?.exif?.Model?.description ?? "未知型号"}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-xl icon-[iconoir--lens]" />
//         {props.rdPhoto?.exif?.exif?.LensModel?.description ?? "未知镜头"}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-2xl -mx-0.5 icon-[circum--ruler]" />
//         {props.rdPhoto?.exif?.exif?.FocalLength?.description ?? "未知焦距"}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-2xl -mx-0.5 icon-[material-symbols-light--shutter-speed-outline-rounded]" />
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-xl icon-[ph--aperture-light]" />
//         {props.rdPhoto?.exif?.exif?.FNumber?.description ?? "未知光圈"}
//       </div>
//       <div className="flex flex-row gap-2 items-center">
//         <span className="text-xl icon-[carbon--iso]" />
//         {props.rdPhoto?.exif?.exif?.ISOSpeedRatings?.description ?? "未知 ISO"}
//       </div>
//     </div>
//   );
// }

const SwiperLightbox: React.FC<{
  images: RdPhoto[];
  autoplay?: boolean;
  maxHeight?: number;
  featured?: boolean;
}> = ({ images, autoplay = false, maxHeight = 360, featured = false }) => {
  const swiperRef = useRef<SwiperRef>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [maxWidth, setMaxWidth] = useState<number>(0);
  const [maxH, setMaxH] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(true);
  const [lightboxActive, setLightboxActive] = useState<boolean>(false);
  // const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showExif, setShowExif] = useState<boolean>(false);

  useEffect(() => {
    if (!swiperRef.current) return;
    setMaxWidth(swiperRef.current.swiper.width - 64);
    setMaxH(min([(maxWidth / 3) * 2, maxHeight])!);
    setIsMobile(swiperRef.current.swiper.width <= 768);
    setSwiperAutoplay(autoplay);
  }, [autoplay, maxHeight, maxWidth]);

  useEffect(() => {
    if (!galleryRef.current) return;
    let lightbox = new PhotoSwipeLightbox({
      dataSource: images,
      gallery: galleryRef.current,
      children: ".swiper-slide a",
      loop: true,
      bgOpacity: 1,
      // bgOpacity: 0.1,
      // initialZoomLevel: 0.05,
      closeTitle: "关闭 (Esc)",
      zoomTitle: "放大 (单击图片)",
      arrowPrevTitle: "上一张(左方向键)",
      arrowNextTitle: "下一张(右方向键)",
      errorMsg: "发生错误：无法加载图片",
      paddingFn: (viewportSize, itemData, index) => {
        return {
          top: viewportSize.x < 768 ? 60 : 0,
          bottom: 0,
          left: 0,
          right: 0,
        };
      },
      pswpModule: () => import("photoswipe"),
    });
    lightbox.on("contentActivate", ({ content }) => {
      setLightboxActive(true);
      // setActiveIndex(content.index);
      // swiperRef.current!.swiper.slideToLoop(content.index, 300);
      swiperRef.current!.swiper.slideTo(content.index, 300);
      // setShowExif(true);
    });
    lightbox.on("contentResize", ({ content, width, height }) => {
      // console.log("contentResize", content, width, height);
    });
    lightbox.on("close", () => {
      setLightboxActive(false);
      setShowExif(false);
    });
    lightbox.on("destroy", () => {
      setSwiperAutoplay(autoplay);
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, []);

  const setSwiperAutoplay = (to: boolean) => {
    if (!swiperRef.current) return;
    if (to) {
      swiperRef.current.swiper.autoplay.start();
    } else {
      swiperRef.current.swiper.autoplay.stop();
    }
  };

  return (
    <>
      <AnimatePresence>
        {lightboxActive && (
          <motion.button
            data-theme="dark"
            aria-label="显示照片信息"
            onTap={() => {
              setShowExif(!showExif);
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitionApple}
            style={{
              position: "fixed",
              top: 0,
              right: "106px",
              width: "50px",
              height: "60px",
              zIndex: 999999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "transparent",
            }}
          >
            <Icon icon="entypo:info-with-circle" width="18" height="18" />
          </motion.button>
        )}
      </AnimatePresence>
      {/* <ExifPanel
        showExif={showExif}
        rdPhoto={images[(activeIndex + 1) % images.length]}
      /> */}
      <div ref={galleryRef}>
        {/*activeIndex={activeIndex}*/}
        <Swiper
          ref={swiperRef}
          className="my-swiper"
          spaceBetween={16}
          slidesPerView={"auto"}
          centeredSlides={isMobile}
          grabCursor={true}
          autoplay={
            autoplay
              ? {
                  delay: 5000,
                  disableOnInteraction: true,
                  pauseOnMouseEnter: true,
                }
              : false
          }
          loop={true}
          modules={[Autoplay, Pagination]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={image.slug} style={{ width: "auto" }}>
              <a
                href={image.src}
                data-pswp-width={image.width}
                data-pswp-height={image.height}
                onClick={() => setSwiperAutoplay(false)}
              >
                <PhotoCard
                  key={image.slug}
                  item={image}
                  maxWidth={maxWidth}
                  maxHeight={maxH}
                  priority={true}
                  isMobile={isMobile}
                  className="carousel-item"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default SwiperLightbox;
