import * as React from "react";

const CookieConsentContext = React.createContext({});

export function CookieConsentProvider(props) {
  const [cookieConsentChoice, setCookieConsentChoice] = React.useState(() =>
    getCookieConsent()
  );

  function updateCookieConsent(consent) {
    localStorage.setItem("CookieConsent", consent);

    setCookieConsentChoice(consent);
  }

  return (
    <CookieConsentContext.Provider
      value={{
        cookieConsentChoice,
        acceptCookieConsent: () => updateCookieConsent("accepted"),
        declineCookieConsent: () => updateCookieConsent("declined"),
      }}
    >
      {props.children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return React.useContext(CookieConsentContext);
}

export function cookieConsentUrl() {
  const root = Scrivito.Obj.root();

  if (!root) {
    return null;
  }

  const cookieConsentLink = root.get("cookieConsentLink");

  if (!cookieConsentLink) {
    return null;
  }

  return {
    url: Scrivito.urlFor(cookieConsentLink),
    title: cookieConsentLink.title() || "Learn more »",
  };
}

function getCookieConsent() {
  return localStorage.getItem("CookieConsent") || "undecided";
}
