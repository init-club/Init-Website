import { useState, useEffect } from 'react';

interface GlitchTextProps {
    text: string;
    delay?: number;
    className?: string;
    trigger?: boolean;
}

const CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const GlitchText = ({ text, delay = 0, className = '', trigger }: GlitchTextProps) => {
    const [displayText, setDisplayText] = useState('');

    // Original Load Animation
    useEffect(() => {
        let iterations = 0;

        const startTimeout = setTimeout(() => {
            const interval = setInterval(() => {
                setDisplayText(() =>
                    text
                        .split('')
                        .map((_char, index) => {
                            if (index < iterations) {
                                return text[index];
                            }
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        })
                        .join('')
                );

                if (iterations >= text.length) {
                    clearInterval(interval);
                }

                iterations += 1 / 2;
            }, 40);

            return () => clearInterval(interval);
        }, delay * 1000);

        return () => {
            clearTimeout(startTimeout);
        };
    }, [text, delay]);

    // Re-trigger Logic 
    useEffect(() => {
        // If trigger is false - reset immediately to clear text
        if (!trigger) {
            setDisplayText(text);
            return;
        }

        let iterations = 0;
        const interval = setInterval(() => {
            setDisplayText(() =>
                text
                    .split('')
                    .map((_char, index) => {
                        if (index < iterations) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join('')
            );

            if (iterations >= text.length) {
                clearInterval(interval);
            }

            iterations += 1 / 2;
        }, 30);

        return () => {
            clearInterval(interval);
            setDisplayText(text); // Ensure resets on interruption
        };
    }, [trigger, text]);

    return (
        <span className={className}>
            {displayText || text}
        </span>
    );
};
