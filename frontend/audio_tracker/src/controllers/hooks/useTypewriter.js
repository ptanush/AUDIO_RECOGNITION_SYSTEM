import { useState, useEffect, useCallback } from "react";

/**
 * Custom typewriter hook — types, pauses, deletes, loops.
 * @param {string[]} phrases - Array of strings to cycle through
 * @param {object} opts - { typeSpeed, deleteSpeed, pauseMs }
 */
export default function useTypewriter(
  phrases,
  { typeSpeed = 55, deleteSpeed = 30, pauseMs = 2000 } = {}
) {
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const current = phrases[phraseIdx];

    if (!isDeleting) {
      // Typing forward
      if (charIdx < current.length) {
        setCharIdx((c) => c + 1);
        setText(current.slice(0, charIdx + 1));
      } else {
        // Done typing, pause then start deleting
        setTimeout(() => setIsDeleting(true), pauseMs);
        return;
      }
    } else {
      // Deleting
      if (charIdx > 0) {
        setCharIdx((c) => c - 1);
        setText(current.slice(0, charIdx - 1));
      } else {
        // Done deleting, move to next phrase
        setIsDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }
    }
  }, [charIdx, isDeleting, phraseIdx, phrases, pauseMs]);

  useEffect(() => {
    const speed = isDeleting ? deleteSpeed : typeSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, deleteSpeed, typeSpeed]);

  return text;
}
