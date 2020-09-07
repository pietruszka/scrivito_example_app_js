import * as React from "react";
import * as Scrivito from "scrivito";
import Lightbox from "react-images";
import { Carousel } from "react-responsive-carousel";
import Modal from "react-modal";

import fullScreenWidthPixels from "../../utils/fullScreenWidthPixels";
import InPlaceEditingPlaceholder from "../../Components/InPlaceEditingPlaceholder";
import TagList from "../../Components/TagList";
import isImage from "../../utils/isImage";
import "./ThumbnailGalleryWidget.scss";

class ThumbnailGalleryComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentImage: 0,
      lightboxIsOpen: false,
      currentTag: "",
      isOpen: false,
      isHidden: true,
      activeImage: 0,
    };

    this.openLightbox = this.openLightbox.bind(this);
    this.closeLightbox = this.closeLightbox.bind(this);
    this.gotoPrevious = this.gotoPrevious.bind(this);
    this.gotoNext = this.gotoNext.bind(this);
    this.gotoImage = this.gotoImage.bind(this);
    this.setTag = this.setTag.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.showImage = this.showImage.bind(this);
  }

  openLightbox(index, event) {
    event.preventDefault();
    this.setState({
      currentImage: index,
      lightboxIsOpen: true,
    });
  }

  closeLightbox() {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false,
    });
  }

  gotoPrevious() {
    this.setState({
      currentImage: this.state.currentImage - 1,
    });
  }

  gotoNext() {
    this.setState({
      currentImage: this.state.currentImage + 1,
    });
  }

  gotoImage(index) {
    this.setState({
      currentImage: index,
    });
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

  showImage() {
    this.setState({ isHidden: false });
  }

  render() {
    const { widget } = this.props;
    const images = widget
      .get("images")
      .filter((subWidget) => isImage(subWidget.get("image")));
    const lightboxImages = images.map((image) => lightboxOptions(image));

    if (!images.length) {
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
                openLightbox={(event) => this.openLightbox(imageIndex, event)}
                currentTag={this.state.currentTag}
              />
            ))}
          </div>
          <Lightbox
            images={lightboxImages}
            currentImage={this.state.currentImage}
            isOpen={this.state.lightboxIsOpen}
            onClickImage={this.handleClickImage}
            onClickNext={this.gotoNext}
            onClickPrev={this.gotoPrevious}
            onClickThumbnail={this.gotoImage}
            onClose={this.closeLightbox}
            showThumbnails
            backdropClosesModal
          />
        </div>
        <div className="row thumbnail-gallery-widget--wrapper">
          {images.map((image, imageIndex) => (
            <Thumbnail
              key={image.id()}
              widget={image}
              openLightbox={() => {
                this.openModal(imageIndex);
              }}
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
        >
          <span
            onClick={() => {
              this.setState({ isOpen: false });
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
                return lightboxImages.map((image, index) => {
                  return (
                    <Scrivito.BackgroundImageTag
                      key={index}
                      style={{
                        background: {
                          image: `url("${image.thumbnail}")`,
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
              {images.map((imageWidget, imageIndex) => {
                const image = imageWidget.get("image");

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
                      content={imageWidget}
                      attribute="image"
                      className="image"
                      alt={image.get("alternativeText")}
                    />
                    <div className="details">
                      <div className="description">
                        {[
                          imageWidget.get("title"),
                          imageWidget.get("subtitle"),
                        ].join(" - ")}
                      </div>
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
const Thumbnail = Scrivito.connect(({ widget, openLightbox, currentTag }) => {
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
        onClick={openLightbox}
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

function lightboxOptions(galleryImageWidget) {
  const image = galleryImageWidget.get("image");
  const binary = image.get("blob");
  const srcUrl = binary.optimizeFor({ width: fullScreenWidthPixels() }).url();
  const alt = image.get("alternativeText");

  return {
    src: srcUrl,
    thumbnail: srcUrl,
    caption: [
      galleryImageWidget.get("title"),
      galleryImageWidget.get("subtitle"),
    ].join(" - "),
    alt,
  };
}
