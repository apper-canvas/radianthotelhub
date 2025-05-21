import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const HotelIcon = getIcon('hotel');
const HomeIcon = getIcon('home');

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="flex justify-center mb-6">
          <HotelIcon className="h-24 w-24 text-primary/70" />
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        
        <p className="text-surface-600 dark:text-surface-400 mb-8">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        
        <Link to="/" className="btn btn-primary mx-auto flex items-center justify-center gap-2 max-w-xs">
          <HomeIcon className="h-5 w-5" />
          Return to Dashboard
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;