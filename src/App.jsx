import React, { useState } from 'react';
import Layout from './components/Layout';
import Converter from './components/Converter';
import Settings from './components/Settings';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Layout onSettingsClick={() => setSettingsOpen(true)}>
        <Converter onOpenSettings={() => setSettingsOpen(true)} />
      </Layout>
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default App;
