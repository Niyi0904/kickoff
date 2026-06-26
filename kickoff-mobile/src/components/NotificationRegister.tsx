import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { registerForPushNotificationsAsync } from '../lib/notifications';

export const NotificationRegister: React.FC = () => {
  const { user } = useAuth();
  const registeredRef = useRef(false);

  useEffect(() => {
    if (user && !registeredRef.current) {
      registeredRef.current = true;
      registerForPushNotificationsAsync(user.uid).catch(() => {});
    }
    if (!user) {
      registeredRef.current = false;
    }
  }, [user]);

  return null;
};
