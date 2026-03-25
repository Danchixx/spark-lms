import { motion } from "framer-motion";

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const PageTransition = ({ children, className = "", style = {} }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`page-transition-wrapper ${className}`}
      style={{ width: "100%", ...style }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
