import * as React from "react";
import * as Scrivito from "scrivito";
import { Carousel } from "react-responsive-carousel";
import Modal from "react-modal";

import InPlaceEditingPlaceholder from "../../Components/InPlaceEditingPlaceholder";
import TagList from "../../Components/TagList";
import isImage from "../../utils/isImage";
import "./ThumbnailGalleryWidget.scss";

class ThumbnailGalleryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTag: "",
      lightboxIsOpen: false,
      currentImage: 0,
    };

    this.setTag = this.setTag.bind(this);
    this.openLightbox = this.openLightbox.bind(this);
    this.closeLightbox = this.closeLightbox.bind(this);
  }

  setTag(tag) {
    this.setState({
      currentTag: tag,
    });
  }

  openLightbox(currentImage) {
    this.setState({ lightboxIsOpen: true, currentImage });
  }

  closeLightbox() {
    this.setState({ lightboxIsOpen: false });
  }

  render() {
    const { widget } = this.props;
    const images = widget
      .get("images")
      .filter((subWidget) => isImage(subWidget.get("image")));
    const lightboxImages = images.map(getLightboxOptions);

    if (images.length === 0) {
      return (
        <InPlaceEditingPlaceholder center>
          Select images in the widget properties.
        </InPlaceEditingPlaceholder>
      );
    }

    return (
      <div>
        <TagList
          showTags={widget.get("showTags") === "yes"}
          tags={allTags(images)}
          currentTag={this.state.currentTag}
          setTag={this.setTag}
        />
        <div>
          <div className="row thumbnail-gallery-widget--wrapper">
            {images.map((image, imageIndex) => (
              <Thumbnail
                key={image.id()}
                widget={image}
                onClick={() => this.openLightbox(imageIndex)}
                currentTag={this.state.currentTag}
              />
            ))}
          </div>
          <Modal
            isOpen={this.state.lightboxIsOpen}
            onRequestClose={(e) => {
              e.stopPropagation();

              this.closeLightbox();
            }}
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
            ariaHideApp={false}
            portalClassName="ReactModalPortal--thumbnail-gallery-widget"
            onAfterOpen={() => {
              const carousel = document.querySelector(".carousel-root");

              if (carousel) carousel.focus();
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();

                this.closeLightbox();
              }}
            >
              <Carousel
                showIndicators={false}
                showStatus={false}
                selectedItem={this.state.currentImage}
                useKeyboardArrows
                thumbWidth={50}
                renderThumbs={() => {
                  return lightboxImages.map(({ image }, index) => {
                    return (
                      <Scrivito.BackgroundImageTag
                        key={index}
                        style={{
                          background: {
                            image: image.get("image"),
                            size: "cover",
                            position: "center",
                          },
                        }}
                        onClick={(e) => {
                          this.setState({ currentImage: index });

                          e.stopPropagation();
                        }}
                      />
                    );
                  });
                }}
                renderArrowNext={(clickHandler, hasNext) => {
                  return (
                    hasNext && (
                      <button
                        title="Next (Right arrow key)"
                        onClick={(e) => {
                          e.stopPropagation();

                          clickHandler();
                        }}
                        className="arrows"
                      >
                        <span className="arrow next" />
                      </button>
                    )
                  );
                }}
                renderArrowPrev={(clickHandler, hasPrevious) => {
                  return (
                    hasPrevious && (
                      <button
                        title="Previous (Left arrow key)"
                        onClick={(e) => {
                          e.stopPropagation();

                          clickHandler();
                        }}
                        className="arrows"
                      >
                        <span className="arrow prev" />
                      </button>
                    )
                  );
                }}
              >
                {lightboxImages.map(({ image, caption, alt }, imageIndex) => {
                  return (
                    <div
                      key={imageIndex}
                      className="image-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div
                        className="close-bar"
                        onClick={(e) => {
                          e.stopPropagation();

                          this.closeLightbox();
                        }}
                      >
                        <button title="Close (Esc)" className="close-button">
                          <span className="close" />
                        </button>
                      </div>
                      <Scrivito.ImageTag
                        content={image}
                        attribute="image"
                        className="image"
                        alt={alt}
                      />
                      <div className="details">
                        <div className="description">{caption}</div>
                        <div className="status">{`${imageIndex + 1} of ${
                          images.length
                        }`}</div>
                      </div>
                    </div>
                  );
                })}
              </Carousel>
            </span>
          </Modal>
        </div>
      </div>
    );
  }
}

Scrivito.provideComponent("ThumbnailGalleryWidget", ThumbnailGalleryComponent);

/* eslint-disable jsx-a11y/anchor-is-valid */
const Thumbnail = Scrivito.connect(({ widget, onClick, currentTag }) => {
  const title = widget.get("title");
  const subtitle = widget.get("subtitle");
  const image = widget.get("image");
  const tags = widget.get("tags");

  const classNames = [
    "col-md-3",
    "col-sm-4",
    "col-6",
    "gutter0",
    "thumbnail-gallery-widget",
  ];
  if (currentTag && !tags.includes(currentTag)) {
    classNames.push("squeezed");
  }

  return (
    <div className={classNames.join(" ")}>
      <Scrivito.BackgroundImageTag
        className="thumbnail-gallery-widget--image"
        style={{ background: { image } }}
      />
      <a
        href="#"
        className="thumbnail-gallery-widget--content-wrapper"
        onClick={onClick}
      >
        <span className="thumbnail-gallery-widget--content">
          <i className="fa fa-camera" aria-hidden="true" />
          <span className="title">{title}</span>
          <span className="subtitle">{subtitle}</span>
        </span>
      </a>
    </div>
  );
});
/* eslint-enable jsx-a11y/anchor-is-valid */

function allTags(images) {
  const tagsArray = images.map((image) => image.get("tags"));

  // flatten tags
  const tags = tagsArray.reduce((a, b) => a.concat(b), []);

  // unique tags
  const uniqueTags = [...new Set(tags)];

  // sort tags
  return uniqueTags.sort();
}

function getLightboxOptions(galleryImageWidget) {
  const image = galleryImageWidget.get("image");
  const alt = image.get("alternativeText");
  const title = galleryImageWidget.get("title");
  const subtitle = galleryImageWidget.get("subtitle");

  return {
    caption: [title, subtitle].join(" - "),
    alt,
    image: galleryImageWidget,
  };
}
