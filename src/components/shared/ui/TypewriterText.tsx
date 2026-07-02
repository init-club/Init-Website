import { motion } from 'framer-motion';

interface TypewriterTextProps {
    text: string;
    delay?: number;
    speed?: number;
    className?: string;
}

export const TypewriterText = ({ text, delay = 0, speed = 0.05, className = '' }: TypewriterTextProps) => {
    return (
        <span className={className}>
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                        delay: delay + (i * speed),
                        duration: 0.05
                    }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
};
