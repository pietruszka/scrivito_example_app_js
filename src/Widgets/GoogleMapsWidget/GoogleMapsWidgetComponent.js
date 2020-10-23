import * as React from "react";
import * as Scrivito from "scrivito";

import { useCookieConsent } from "../../Components/CookieConsentContext";
import googleMapsApiKey from "../../utils/googleMapsApiKey";
import googleMapsImageUrl from "../../utils/googleMapsImageUrl";
import "./GoogleMapsWidget.scss";

const maxWidth = 640;

function GoogleMapsWidgetComponent(props) {
  const address =
    props.widget.get("address") || "Brandenburg Gate, Berlin, Germany";
  const zoom = props.widget.get("zoom") || "15";
  const apiKey = googleMapsApiKey();
  const mapType = props.widget.get("mapType") || "static";
  const [elementBoundary, setElementBoundary] = React.useState({
    elementHeight: 0,
    elementWidth: 0,
    height: null,
    width: null,
  });

  const { cookieConsentChoice, acceptCookieConsent } = useCookieConsent();

  const outerDivRef = React.useRef(null);

  React.useEffect(() => {
    handleResize(outerDivRef.current, elementBoundary, setElementBoundary);

    window.addEventListener("resize", () =>
      handleResize(outerDivRef.current, elementBoundary, setElementBoundary)
    );

    return () => {
      window.removeEventListener("resize", () =>
        handleResize(outerDivRef.current, elementBoundary, setElementBoundary)
      );
    };
  }, []);

  function handleResize(ref, state, setState) {
    if (ref) {
      const elementWidth = ref.offsetWidth;
      const elementHeight = ref.offsetHeight;

      if (
        state.elementWidth !== elementWidth ||
        state.elementHeight !== elementHeight
      ) {
        let width = elementWidth;
        let height = elementHeight;

        if (width > maxWidth) {
          width = maxWidth;

          const factor = elementHeight / elementWidth;
          height = Math.round(maxWidth * factor);
        }

        setState({
          elementHeight,
          elementWidth,
          height,
          width,
        });
      }
    }
  }

  let style = {};

  if (mapType === "static") {
    style = {
      background: "no-repeat center / cover",
      backgroundImage: `url(${getUrl({
        elementBoundary,
        address,
        apiKey,
        zoom,
      })})`,
    };
  }

  let interactiveMap;

  if (mapType === "interactive") {
    if (cookieConsentChoice === "accepted") {
      interactiveMap = (
        <InteractiveMap
          address={address}
          zoom={zoom}
          apiKey={apiKey}
          mapType={mapType}
        />
      );
    } else {
      interactiveMap = (
        <NoCookiesNotification onAcceptCookiesClick={acceptCookieConsent} />
      );
    }
  }

  return (
    <div ref={outerDivRef} className="google-maps-widget" style={style}>
      {interactiveMap}
      <Widgets widget={props.widget} mapType={mapType} />
    </div>
  );
}

function getUrl({ elementBoundary, address, apiKey, zoom }) {
  if (!elementBoundary.height || !elementBoundary.width) {
    // wait for the real height/width to not consume to much rate from google.
    return "";
  }

  // See all options at https://developers.google.com/maps/documentation/static-maps/intro
  const params = {
    size: `${elementBoundary.width}x${elementBoundary.height}`,
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

function InteractiveMap({ address, apiKey, zoom, mapType }) {
  if (mapType !== "interactive") {
    return null;
  }

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
