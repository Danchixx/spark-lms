import { motion } from "framer-motion";
import SparkLogo from "../../common/SparkLogo/sparklogo.png";

const LeftPanel = ({ subtitle }) => {
  return (
    <>
      <style>{`
        .left-panel {
          width: 100%;
          flex-shrink: 0;
          background: linear-gradient(135deg, #FFC794 0%, #FF9A3F 30%, #FE8315 60%);          border-radius: 0 55% 55% 0 / 0 50% 50% 0;
          display: flex;
          flex-direction: column;
          position: relative;
          min-height: calc(100vh - 62px);
          z-index: 1;
          overflow: hidden;
          box-sizing: border-box;
          padding: 60px 50px 60px 60px;
        }
        
        /* Fixed center section - always in the middle */
        .left-panel-center {
          position: absolute;
          top: 50%;
          left: 60px;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8rem;
        }
        
        .left-panel-logo-circle {
          width: 200px;
          height: 200px;
          min-width: 200px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          flex-shrink: 0;
        }
        
        .left-panel-logo-circle img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 5px;
          box-sizing: border-box;
        }
        
        .left-panel-text {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 42px;
          line-height: 1.15;
          flex-shrink: 0;
        }
        
        /* Subtitle positioned at bottom */
        .left-panel-subtitle {
          color: rgba(255,255,255,0.85);
          font-size: 13px;
          line-height: 1.6;
          max-width: 320px;
          margin-top: auto; /* Pushes to bottom */
          padding-top: 40px; /* Minimum space from center content */
        }

        /* Tablet adjustments */
        @media (max-width: 1024px) {
          .left-panel {
            padding: 40px 40px 40px 30px;
            border-radius: 0 50% 50% 0 / 0 45% 45% 0;
          }
          .left-panel-center {
            left: 30px;
            gap: 16px;
          }
          .left-panel-logo-circle {
            width: 100px;
            height: 100px;
            min-width: 100px;
          }
          .left-panel-text {
            font-size: 32px;
          }
        }

        /* Mobile view */
        @media (max-width: 767px) {
          .left-panel {
            width: 100%;
            min-height: unset;
            border-radius: 0;
            padding: 36px 24px;
            align-items: center;
            display: flex;
            flex-direction: column;
          }
          
          .left-panel-center {
            position: relative;
            top: auto;
            left: auto;
            transform: none;
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }
          
          .left-panel-logo-circle {
            width: 100px;
            height: 100px;
            min-width: 100px;
          }
          
          .left-panel-text {
            font-size: 36px;
            text-align: center;
          }
          
          .left-panel-subtitle {
            text-align: center;
            max-width: 100%;
            margin-top: 40px;
            padding-top: 0;
          }
        }
      `}</style>

      <div className="left-panel">
        {/* Center section - fixed in middle, unaffected by subtitle */}
        <div className="left-panel-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="left-panel-logo-circle"
          >
            <img src={SparkLogo} alt="Spark Logo" />
          </motion.div>
          <div className="left-panel-text">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              style={{ color: "#1a1a1a" }}
            >LEARN.</motion.div>
            <br></br>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              style={{ color: "rgb(213,213,213)" }}
            >GROW.</motion.div>
            <br></br>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
              style={{ color: "white" }}
            >SPARK.</motion.div>
          </div>
        </div>

        {/* Subtitle at bottom */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="left-panel-subtitle"
        >
          {subtitle}
        </motion.div>
      </div>
    </>
  );
};

export default LeftPanel;