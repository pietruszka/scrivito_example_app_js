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
      isOpen: false,
      activeImage: 0,
    };

    this.setTag = this.setTag.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  setTag(tag) {
    this.setState({
      currentTag: tag,
    });
  }

  openModal(activeImage) {
    this.setState({ isOpen: true, activeImage });
  }

  closeModal() {
    this.setState({ isOpen: false });
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
        <div className="row thumbnail-gallery-widget--wrapper">
          {images.map((image, imageIndex) => (
            <Thumbnail
              key={image.id()}
              widget={image}
              onClick={() => this.openModal(imageIndex)}
              currentTag={this.state.currentTag}
            />
          ))}
        </div>
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={(e) => {
            e.stopPropagation();

            this.closeModal();
          }}
          shouldCloseOnOverlayClick
          shouldFocusAfterRender
          shouldCloseOnEsc
          ariaHideApp={false}
          portalClassName="ReactModalPortal--thumbnail-gallery-widget"
        >
          <span
            onClick={(e) => {
              e.stopPropagation();

              this.closeModal();
            }}
          >
            <Carousel
              axis="horizontal"
              showIndicators={false}
              showStatus={false}
              selectedItem={this.state.activeImage}
              useKeyboardArrows
              thumbWidth={50}
              swipeable
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
                        this.setState({ activeImage: index });

                        e.stopPropagation();
                      }}
                    />
                  );
                });
              }}
              renderArrowNext={(clickHandler, hasNext) => {
                return (
                  hasNext && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();

                        clickHandler();
                      }}
                      className="arrow next"
                    />
                  )
                );
              }}
              renderArrowPrev={(clickHandler, hasPrevious) => {
                return (
                  hasPrevious && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();

                        clickHandler();
                      }}
                      className="arrow prev"
                    />
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

                        this.closeModal();
                      }}
                    >
                      <span className="close" />
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
