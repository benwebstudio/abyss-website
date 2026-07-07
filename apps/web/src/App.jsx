
import React from 'react';
import TransitionSection from './components/TransitionSection.jsx';
import ScrollVideoSection from './components/ScrollVideoSection.jsx';
import DiscoverSection from './components/DiscoverSection.jsx';
import ContactSection from './components/ContactSection.jsx';
import GlobalGlowCursor from './components/GlobalGlowCursor.jsx';
import SoundToggle from './components/SoundToggle.jsx';

function App() {
  return (
    <>
      <TransitionSection />
      <ScrollVideoSection />
      <DiscoverSection />
      <ContactSection />
      <SoundToggle />
      <GlobalGlowCursor />
    </>
  );
}

export default App;
