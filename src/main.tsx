import { Analytics } from "@vercel/analytics/react";
import "leaflet/dist/leaflet.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ArchivedView from "./ArchivedView";
import "./index.css";

// Mode "Archivé permanent" activable/désactivable via la variable
// d'environnement VITE_ARCHIVED. Mettre VITE_ARCHIVED="true" pour n'afficher
// que le message de fermeture ; toute autre valeur (ou absente) réactive le
// site complet.
const SITE_ARCHIVED = import.meta.env.VITE_ARCHIVED === "true";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {SITE_ARCHIVED ? <ArchivedView /> : <App />}
    <Analytics />
  </React.StrictMode>,
);
