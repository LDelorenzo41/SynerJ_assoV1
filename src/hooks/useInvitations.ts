// ============================================================
// HOOK POUR LA GESTION DES INVITATIONS
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import InvitationService from '../services/InvitationService';
import type {
  ClubInvitation,
  ClubInvitationWithDetails,
  ClubInvitationLink,
  CreateEmailInvitationData,
  CreateInvitationLinkData,
  InvitationStats,
  SendInvitationEmailsResponse,
  AcceptInvitationResponse,
  UseInvitationLinkResponse,
} from '../types/invitations';

// ============================================================
// HOOK: useInvitations (pour gérer les invitations d'un club)
// ============================================================

interface UseInvitationsReturn {
  invitations: ClubInvitationWithDetails[];
  links: ClubInvitationLink[];
  stats: InvitationStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions pour invitations email
  sendInvitations: (data: CreateEmailInvitationData) => Promise<SendInvitationEmailsResponse>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  deleteInvitation: (invitationId: string) => Promise<void>;
  resendInvitation: (invitationId: string) => Promise<void>;
  
  // Actions pour liens
  createLink: (data: CreateInvitationLinkData) => Promise<ClubInvitationLink>;
  deactivateLink: (linkId: string) => Promise<void>;
  deleteLink: (linkId: string) => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
}

export const useInvitations = (clubId: string): UseInvitationsReturn => {
  const [invitations, setInvitations] = useState<ClubInvitationWithDetails[]>([]);
  const [links, setLinks] = useState<ClubInvitationLink[]>([]);
  const [stats, setStats] = useState<InvitationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les données
  const loadData = useCallback(async () => {
    if (!clubId) return;

    try {
      setLoading(true);
      setError(null);

      // Charger en parallèle
      const [invitationsData, linksData, statsData] = await Promise.all([
        InvitationService.getInvitations({ club_id: clubId }),
        InvitationService.getInvitationLinks({ club_id: clubId }),
        InvitationService.getInvitationStats(clubId),
      ]);

      setInvitations(invitationsData);
      setLinks(linksData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Erreur lors du chargement des invitations:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  // Charger au montage
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Envoyer des invitations par email
  const sendInvitations = async (
    data: CreateEmailInvitationData
  ): Promise<SendInvitationEmailsResponse> => {
    try {
      const result = await InvitationService.sendEmailInvitations(data);
      await loadData(); // Recharger les données
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  // Révoquer une invitation
  const revokeInvitation = async (invitationId: string): Promise<void> => {
    try {
      await InvitationService.revokeInvitation(invitationId);
      await loadData();
    } catch (err: any) {
      throw err;
    }
  };

  // Supprimer une invitation
  const deleteInvitation = async (invitationId: string): Promise<void> => {
    try {
      await InvitationService.deleteInvitation(invitationId);
      await loadData();
    } catch (err: any) {
      throw err;
    }
  };

  // Renvoyer une invitation
  const resendInvitation = async (invitationId: string): Promise<void> => {
    try {
      await InvitationService.resendInvitation(invitationId);
      await loadData();
    } catch (err: any) {
      throw err;
    }
  };

  // Créer un lien d'invitation
  const createLink = async (
    data: CreateInvitationLinkData
  ): Promise<ClubInvitationLink> => {
    try {
      const link = await InvitationService.createInvitationLink(data);
      await loadData();
      return link;
    } catch (err: any) {
      throw err;
    }
  };

  // Désactiver un lien
  const deactivateLink = async (linkId: string): Promise<void> => {
    try {
      await InvitationService.deactivateInvitationLink(linkId);
      await loadData();
    } catch (err: any) {
      throw err;
    }
  };

  // Supprimer un lien
  const deleteLink = async (linkId: string): Promise<void> => {
    try {
      await InvitationService.deleteInvitationLink(linkId);
      await loadData();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    invitations,
    links,
    stats,
    loading,
    error,
    sendInvitations,
    revokeInvitation,
    deleteInvitation,
    resendInvitation,
    createLink,
    deactivateLink,
    deleteLink,
    refresh: loadData,
  };
};

// ============================================================
// HOOK: useInvitationByToken (pour accepter une invitation email)
// ============================================================

interface UseInvitationByTokenReturn {
  invitation: ClubInvitationWithDetails | null;
  loading: boolean;
  error: string | null;
  accepting: boolean;
  acceptInvitation: () => Promise<AcceptInvitationResponse>;
}

export const useInvitationByToken = (token: string): UseInvitationByTokenReturn => {
  const [invitation, setInvitation] = useState<ClubInvitationWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await InvitationService.getInvitationByToken(token);
        setInvitation(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement de l\'invitation:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();
  }, [token]);

  const acceptInvitation = async (): Promise<AcceptInvitationResponse> => {
    try {
      setAccepting(true);
      const result = await InvitationService.acceptEmailInvitation(token);
      return result;
    } catch (err: any) {
      throw err;
    } finally {
      setAccepting(false);
    }
  };

  return {
    invitation,
    loading,
    error,
    accepting,
    acceptInvitation,
  };
};

// ============================================================
// HOOK: useInvitationLinkByCode (pour utiliser un lien d'invitation)
// ============================================================

interface UseInvitationLinkByCodeReturn {
  link: ClubInvitationLink | null;
  loading: boolean;
  error: string | null;
  using: boolean;
  useLink: () => Promise<UseInvitationLinkResponse>;
}

export const useInvitationLinkByCode = (code: string): UseInvitationLinkByCodeReturn => {
  const [link, setLink] = useState<ClubInvitationLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [using, setUsing] = useState(false);

  useEffect(() => {
    const loadLink = async () => {
      if (!code) return;

      try {
        setLoading(true);
        setError(null);
        const data = await InvitationService.getInvitationLinkByCode(code);
        setLink(data);
      } catch (err: any) {
        console.error('Erreur lors du chargement du lien:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadLink();
  }, [code]);

  const useLink = async (): Promise<UseInvitationLinkResponse> => {
    try {
      setUsing(true);
      const result = await InvitationService.useInvitationLink(code);
      return result;
    } catch (err: any) {
      throw err;
    } finally {
      setUsing(false);
    }
  };

  return {
    link,
    loading,
    error,
    using,
    useLink,
  };
};