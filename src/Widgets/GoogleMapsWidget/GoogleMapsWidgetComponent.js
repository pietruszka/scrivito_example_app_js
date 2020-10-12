import * as React from "react";
import * as Scrivito from "scrivito";
import { Cookies } from "react-cookie-consent";

import googleMapsApiKey from "../../utils/googleMapsApiKey";
import googleMapsImageUrl from "../../utils/googleMapsImageUrl";
import cookieConsentGiven, {
  resolveCookieConsent,
} from "../../utils/cookieConsentGiven";
import "./GoogleMapsWidget.scss";

const maxWidth = 640;

class GoogleMapsWidgetComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      elementHeight: 0,
      elementWidth: 0,
      height: null,
      width: null,
      allowCookies: shouldAllowCookies(),
    };

    this.outerDivRef = React.createRef();

    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    cookieConsentGiven().then(() =>
      this.setState((prev) => ({
        ...prev,
        allowCookies: shouldAllowCookies(),
      }))
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    const elementWidth = this.outerDivRef.current.offsetWidth;
    const elementHeight = this.outerDivRef.current.offsetHeight;

    if (
      this.state.elementWidth !== elementWidth ||
      this.state.elementHeight !== elementHeight
    ) {
      let width = elementWidth;
      let height = elementHeight;

      if (width > maxWidth) {
        width = maxWidth;

        const factor = elementHeight / elementWidth;
        height = Math.round(maxWidth * factor);
      }

      this.setState({
        elementHeight,
        elementWidth,
        height,
        width,
      });
    }
  }

  render() {
    const address =
      this.props.widget.get("address") || "Brandenburg Gate, Berlin, Germany";
    const zoom = this.props.widget.get("zoom") || "15";
    const apiKey = googleMapsApiKey();
    const mapType = this.props.widget.get("mapType") || "static";

    let style = {};
    let interactiveMap;

    if (mapType === "static") {
      style = {
        background: "no-repeat center / cover",
        backgroundImage: `url(${this.googleMapsImageUrl({
          address,
          apiKey,
          zoom,
        })})`,
      };
    }

    if (mapType === "interactive") {
      if (this.state.allowCookies) {
        interactiveMap = (
          <InteractiveMap
            address={address}
            zoom={zoom}
            apiKey={apiKey}
            mapType={mapType}
          />
        );
      } else {
        interactiveMap = <NoCookiesNotification />;
      }
    }

    return (
      <div ref={this.outerDivRef} className="google-maps-widget" style={style}>
        {interactiveMap}
        <Widgets widget={this.props.widget} mapType={mapType} />
      </div>
    );
  }

  googleMapsImageUrl({ address, apiKey, zoom }) {
    if (!this.state.height || !this.state.width) {
      // wait for the real height/width to not consume to much rate from google.
      return "";
    }

    // See all options at https://developers.google.com/maps/documentation/static-maps/intro
    const params = {
      size: `${this.state.width}x${this.state.height}`,
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
}

function shouldAllowCookies() {
  const root = Scrivito.Obj.root();
  const cookieConsentLink = root.get("cookieConsentLink");

  if (!cookieConsentLink) return false;

  const cookieConsentLinkUrl = Scrivito.urlFor(cookieConsentLink);
  const isCookieAccepted = Cookies.get().CookieConsent === "true";

  return cookieConsentLinkUrl.length > 0 && isCookieAccepted;
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

function NoCookiesNotification() {
  return (
    <div className="no-cookies-notification">
      <div className="consent-content">
        Please accept our Cookie Policy to view Google Maps.
      </div>
      <div>
        <button
          className="cookie-button btn btn-primary"
          onClick={acceptCookie}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

function acceptCookie() {
  Cookies.set("CookieConsent", "true");

  resolveCookieConsent();
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
