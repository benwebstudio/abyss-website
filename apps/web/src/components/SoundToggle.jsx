import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SOUND_EVENT = 'abyss:soundchange';

function SoundToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(SOUND_EVENT, { detail: { enabled: false } })
    );
  }, []);

  const toggleSound = () => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    window.dispatchEvent(
      new CustomEvent(SOUND_EVENT, { detail: { enabled: nextEnabled } })
    );
  };

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={toggleSound}
      className="abyss-button fixed right-4 top-[4.45rem] z-[120] flex items-center gap-2 rounded-full px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.16em] sm:right-5 sm:top-[4.8rem] sm:px-4 sm:text-[10px]"
    >
      {enabled ? (
        <Volume2 className="h-3.5 w-3.5 text-cyan-100" strokeWidth={1.4} />
      ) : (
        <VolumeX className="h-3.5 w-3.5 text-cyan-200/65" strokeWidth={1.4} />
      )}
      <span>{enabled ? 'Sound On' : 'Sound Off'}</span>
    </button>
  );
}

export default SoundToggle;
