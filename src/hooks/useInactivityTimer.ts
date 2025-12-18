import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const CHECK_INTERVAL = 30000; // Check every 30 seconds

export const useInactivityTimer = () => {
  const { user, updateActivity, checkInactivity, logout } = useAuthStore();
  const { toast } = useToast();

  const handleActivity = useCallback(() => {
    if (user) {
      updateActivity();
    }
  }, [user, updateActivity]);

  useEffect(() => {
    if (!user) return;

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check inactivity periodically
    const intervalId = setInterval(() => {
      if (checkInactivity()) {
        toast({
          title: "Session expirée",
          description: "Vous avez été déconnecté pour inactivité.",
          variant: "destructive",
        });
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(intervalId);
    };
  }, [user, handleActivity, checkInactivity, toast]);

  return { logout };
};
