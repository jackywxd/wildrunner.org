import { NextPage } from "next";
import React, { useMemo } from "react";
import { galleries } from "#site/content";
import { RdPhoto } from "@/lib/veliteUtils";
import { Link } from "@/components/transition/react-transition-progress/next";
import { Icon } from "@iconify-icon/react";
import SwiperLightbox from "@/components/swiper/SwiperLightbox";

const GalleryPage: NextPage = () => {
  // to increase performance, we need to memoize the featured images
  // if its length is larger than 20, let's splice it to 20
  const featuredImages = useMemo(() => {
    const featured = galleries.reduce((acc, gallery) => {
      return acc.concat(gallery.images.filter((image) => image.featured));
    }, [] as RdPhoto[]);
    return featured.length > 20 ? featured.slice(0, 20) : featured;
  }, [galleries]);

  // for each gallery, we also need to find if it its not empty and if it has more than 10 images
  // if so, let's splice it to 10; after that sort the galleries by created date
  const galleriesWithMoreThan10Images = useMemo(() => {
    return galleries
      .filter((gallery) => gallery.images.length > 0)
      .sort((a, b) => {
        const dateA = new Date(a?.created ?? 0);
        const dateB = new Date(b?.created ?? 0);
        return dateB.getTime() - dateA.getTime();
      })
      .map((gallery) => {
        return gallery.images.length > 10
          ? { ...gallery, images: gallery.images.slice(0, 10) }
          : gallery;
      });
  }, [galleries]);

  return (
    <>
      <div className="prose-article flex flex-col gap-4">
        <section className="-mx-content">
          <h1 className="px-content mb-2">精选照片</h1>
          <SwiperLightbox
            images={featuredImages}
            autoplay={true}
            featured={true}
          ></SwiperLightbox>
        </section>
        {galleriesWithMoreThan10Images.map((gallery) => (
          <section key={gallery.slug} className="-mx-content">
            <button className="group btn btn-ghost btn-lg rounded-2xl mb-2 outline-transparent border-none p-0">
              <Link
                href={`gallery/${gallery.slug}`}
                className="px-content flex items-center not-prose"
              >
                <h1 className="text-h1">{gallery.name}</h1>
                <Icon
                  className="text-h2 transition-apple group-hover:translate-x-1/3"
                  icon="heroicons:chevron-right"
                  inline
                />
              </Link>
            </button>
            <SwiperLightbox
              images={gallery.images}
              maxHeight={160}
            ></SwiperLightbox>
          </section>
        ))}
      </div>
    </>
  );
};

export default GalleryPage;
