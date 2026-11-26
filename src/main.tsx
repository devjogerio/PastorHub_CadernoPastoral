
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import { iniciarRedirecionamento } from "./home-redirect";

  iniciarRedirecionamento();

  createRoot(document.getElementById("root")!).render(<App />);
  
