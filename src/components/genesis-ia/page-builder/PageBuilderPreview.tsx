import { 
  SandpackProvider, 
  SandpackPreview
} from '@codesandbox/sandpack-react';
import { memo } from 'react';

interface PageBuilderPreviewProps {
  code: string;
}

// Template files for Sandpack
const getFiles = (pageCode: string) => ({
  '/App.tsx': `import Page from './Page';

export default function App() {
  return <Page />;
}`,
  '/Page.tsx': pageCode,
  '/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
  '/styles.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
}

::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #475569;
}`,
});

// Dependencies for Sandpack
const dependencies = {
  'framer-motion': '^10.16.4',
  'lucide-react': '^0.292.0',
};

const PageBuilderPreviewComponent = ({ code }: PageBuilderPreviewProps) => {
  return (
    <div className="h-full w-full">
      <SandpackProvider
        template="react-ts"
        theme="dark"
        files={getFiles(code)}
        customSetup={{
          dependencies,
        }}
        options={{
          externalResources: [
            'https://cdn.tailwindcss.com',
          ],
          classes: {
            'sp-wrapper': 'h-full',
            'sp-layout': 'h-full',
            'sp-stack': 'h-full',
          },
        }}
      >
        <div className="h-full">
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
            style={{ height: '100%' }}
          />
        </div>
      </SandpackProvider>
    </div>
  );
};

export const PageBuilderPreview = memo(PageBuilderPreviewComponent);
