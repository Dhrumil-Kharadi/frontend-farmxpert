import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import '../styles/components/OfflineIndicator.css';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="offline-indicator">
            <div className="offline-content">
                <WifiOff size={18} />
                <span>You are currently offline. Some features may be unavailable.</span>
            </div>
        </div>
    );
};

export default OfflineIndicator;
