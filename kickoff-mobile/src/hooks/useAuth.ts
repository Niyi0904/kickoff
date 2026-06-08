import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useIsLeagueManager = () => {
  const { isLeagueManager } = useAuth();
  return isLeagueManager;
};

export const useIsAdmin = () => {
  const { isAdmin } = useAuth();
  return isAdmin;
};

export const useIsTeamManager = (teamId?: string) => {
  const { userRole, isLeagueManager } = useAuth();
  if (isLeagueManager) return true;
  if (userRole?.role === 'team_manager') {
    return !teamId || userRole.teamId === teamId;
  }
  return false;
};

export const useUserTeamId = () => {
  const { teamId } = useAuth();
  return teamId;
};
