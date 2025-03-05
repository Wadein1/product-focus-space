
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Preload the logo image to ensure it's available quickly
const preloadLogo = new Image();
preloadLogo.src = '/lovable-uploads/34b85765-bc96-4327-8ece-c29748c2e1a1.png';

createRoot(document.getElementById("root")!).render(<App />);
