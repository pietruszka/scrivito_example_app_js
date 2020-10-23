import * as React from "react";
import * as Scrivito from "scrivito";

import {
  cookieConsentUrl,
  useCookieConsent,
} from "../../Components/CookieConsentContext";
import googleMapsApiKey from "../../utils/googleMapsApiKey";
import googleMapsImageUrl from "../../utils/googleMapsImageUrl";
import "./GoogleMapsWidget.scss";

const maxWidth = 640;

function GoogleMapsWidgetComponent(props) {
  const address =
    props.widget.get("address") || "Brandenburg Gate, Berlin, Germany";
  const zoom = props.widget.get("zoom") || "15";
  const apiKey = googleMapsApiKey();
  const consentUrl = cookieConsentUrl();
  const mapType = props.widget.get("mapType") || "static";
  const [elementBoundary, setElementBoundary] = React.useState({
    elementHeight: 0,
    elementWidth: 0,
    height: null,
    width: null,
  });
  const [isVisible, setIsVisible] = React.useState(false);

  const { cookieConsentChoice, acceptCookieConsent } = useCookieConsent();

  const widgetRef = React.useRef(null);

  React.useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    if (!consentUrl || cookieConsentChoice === "accepted") {
      setIsVisible(true);
    }
  }, [consentUrl, cookieConsentChoice]);

  function handleResize() {
    const currentRef = widgetRef.current;

    if (currentRef) {
      const elementWidth = currentRef.offsetWidth;
      const elementHeight = currentRef.offsetHeight;

      if (
        elementBoundary.elementWidth !== elementWidth ||
        elementBoundary.elementHeight !== elementHeight
      ) {
        let width = elementWidth;
        let height = elementHeight;

        if (width > maxWidth) {
          width = maxWidth;

          const factor = elementHeight / elementWidth;
          height = Math.round(maxWidth * factor);
        }

        setElementBoundary({
          elementHeight,
          elementWidth,
          height,
          width,
        });
      }
    }
  }

  let style = {};
  let interactiveMap;

  if (!isVisible) {
    interactiveMap = (
      <NoCookiesNotification onAcceptCookiesClick={acceptCookieConsent} />
    );
  } else {
    if (mapType === "static") {
      style = {
        background: "no-repeat center / cover",
        backgroundImage: `url(${getMapUrl({
          dimmension: elementBoundary,
          address,
          apiKey,
          zoom,
        })})`,
      };
    }

    if (mapType === "interactive") {
      interactiveMap = (
        <InteractiveMap address={address} zoom={zoom} apiKey={apiKey} />
      );
    }
  }

  return (
    <div ref={widgetRef} className="google-maps-widget" style={style}>
      {interactiveMap}
      <Widgets widget={props.widget} mapType={mapType} />
    </div>
  );
}

function getMapUrl({ dimmension, address, apiKey, zoom }) {
  if (!dimmension.height || !dimmension.width) {
    // wait for the real height/width to not consume to much rate from google.
    return "";
  }

  // See all options at https://developers.google.com/maps/documentation/static-maps/intro
  const params = {
    size: `${dimmension.width}x${dimmension.height}`,
    scale: 2, // with scale 2 google maps allows more pixels.
    markers: `color:red|${address}`,
    zoom,
    ie: "UTF8",
  };

  if (apiKey) {
    params.key = apiKey;
  }

  return googleMapsImageUrl(params);
}

function InteractiveMap({ address, apiKey, zoom }) {
  const url = `https://www.google.com/maps/embed/v1/place?q=${address}&key=${apiKey}&zoom=${zoom}`;

  return (
    <iframe
      sandbox="allow-scripts allow-same-origin"
      title="Interactive Map"
      frameBorder="0"
      style={{ border: 0 }}
      src={url}
      loading="lazy"
    />
  );
}

function NoCookiesNotification({ onAcceptCookiesClick }) {
  return (
    <div className="no-cookies-notification">
      <div className="consent-content">
        Please accept our Cookie Policy to view Google Maps.
      </div>
      <div>
        <button
          className="cookie-button btn btn-primary"
          onClick={onAcceptCookiesClick}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

const Widgets = Scrivito.connect(({ widget, mapType }) => {
  if (widget.get("showWidgets") !== "yes") {
    return null;
  }

  const containerClasses = ["container", "container-initial"];
  if (mapType === "interactive") {
    containerClasses.push("d-flex", "flex-row-reverse");
  }

  return (
    <div className={containerClasses.join(" ")}>
      <div className="col-lg-3 col-md-4 col-sm-5 container-initial">
        <Scrivito.ContentTag
          content={widget}
          attribute="content"
          className={"card card-theme"}
        />
      </div>
    </div>
  );
});

Scrivito.provideComponent("GoogleMapsWidget", GoogleMapsWidgetComponent);
