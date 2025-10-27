// ============================================================
// SERVICE POUR LA GESTION DES INVITATIONS DE MEMBRES
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  ClubInvitation,
  ClubInvitationWithDetails,
  ClubInvitationLink,
  ClubInvitationLinkWithDetails,
  CreateEmailInvitationData,
  CreateInvitationLinkData,
  SendInvitationEmailsResponse,
  AcceptInvitationResponse,
  UseInvitationLinkResponse,
  InvitationStats,
  GetInvitationsParams,
  GetInvitationLinksParams,
  InvitationRole,
} from '../types/invitations';

class InvitationService {
  
  // ============================================================
  // INVITATIONS PAR EMAIL
  // ============================================================

  /**
   * Créer et envoyer des invitations par email
   */
  async sendEmailInvitations(
    data: CreateEmailInvitationData
  ): Promise<SendInvitationEmailsResponse> {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Appeler la Edge Function
      const { data: result, error } = await supabase.functions.invoke(
        'send-invitation-emails',
        {
          body: {
            club_id: data.club_id,
            emails: data.emails,
            role: data.role,
            personal_message: data.personal_message,
            invited_by: user.id,
          },
        }
      );

      if (error) throw error;

      return result as SendInvitationEmailsResponse;
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi des invitations:', error);
      throw error;
    }
  }

  /**
   * Récupérer les invitations par email d'un club
   */
  async getInvitations(
    params: GetInvitationsParams
  ): Promise<ClubInvitationWithDetails[]> {
    try {
      let query = supabase
        .from('club_invitations_with_details')
        .select('*')
        .eq('club_id', params.club_id)
        .order('created_at', { ascending: false });

      if (params.status) {
        query = query.eq('status', params.status);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  }

  /**
   * Récupérer une invitation par son token
   */
  async getInvitationByToken(token: string): Promise<ClubInvitationWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('club_invitations_with_details')
        .select('*')
        .eq('token', token)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération de l\'invitation:', error);
      throw error;
    }
  }

  /**
   * Accepter une invitation par email
   */
  async acceptEmailInvitation(token: string): Promise<AcceptInvitationResponse> {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Vous devez être connecté pour accepter une invitation');
      }

      // Récupérer l'invitation
      const invitation = await this.getInvitationByToken(token);
      if (!invitation) {
        throw new Error('Invitation introuvable');
      }

      // Vérifier le statut
      if (invitation.status !== 'pending') {
        throw new Error('Cette invitation n\'est plus valide');
      }

      // Vérifier l'expiration
      if (new Date(invitation.expires_at) < new Date()) {
        // Marquer comme expirée
        await supabase
          .from('club_invitations')
          .update({ status: 'expired' })
          .eq('id', invitation.id);
        
        throw new Error('Cette invitation a expiré');
      }

      // Vérifier que l'email correspond et récupérer le club_id
const { data: profile } = await supabase
  .from('profiles')
  .select('email, club_id')
  .eq('id', user.id)
  .single();

      if (!profile || profile.email !== invitation.email) {
        throw new Error('Cette invitation n\'est pas destinée à ce compte');
      }

      // Vérifier si déjà membre
      if (profile.club_id === invitation.club_id) {
        throw new Error('Vous êtes déjà membre de ce club');
      }

      // Mettre à jour le profil de l'utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          club_id: invitation.club_id,
          role: invitation.role,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Marquer l'invitation comme acceptée
      const { error: invitationError } = await supabase
        .from('club_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: user.id,
        })
        .eq('id', invitation.id);

      if (invitationError) throw invitationError;

      // Créer une notification pour l'inviteur
      await supabase
        .from('notifications')
        .insert({
          user_id: invitation.invited_by,
          type: 'nouveau_club', // Réutiliser un type existant ou créer un nouveau
          title: 'Invitation acceptée',
          message: `${profile.email} a accepté votre invitation à rejoindre ${invitation.club_name}`,
          is_read: false,
        });

      return {
        success: true,
        club_id: invitation.club_id,
        club_name: invitation.club_name,
        role: invitation.role as InvitationRole,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'acceptation de l\'invitation:', error);
      throw error;
    }
  }

  /**
   * Révoquer une invitation
   */
  async revokeInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('club_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de la révocation de l\'invitation:', error);
      throw error;
    }
  }

  /**
   * Supprimer une invitation
   */
  async deleteInvitation(invitationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('club_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'invitation:', error);
      throw error;
    }
  }

  /**
   * Renvoyer une invitation
   */
  async resendInvitation(invitationId: string): Promise<void> {
    try {
      // Récupérer l'invitation
      const { data: invitation, error: fetchError } = await supabase
        .from('club_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        throw new Error('Invitation introuvable');
      }

      // Révoquer l'ancienne
      await this.revokeInvitation(invitationId);

      // Créer une nouvelle invitation
      await this.sendEmailInvitations({
        club_id: invitation.club_id,
        emails: [invitation.email],
        role: invitation.role,
        personal_message: invitation.personal_message,
      });
    } catch (error: any) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      throw error;
    }
  }

  // ============================================================
  // LIENS D'INVITATION
  // ============================================================

  /**
   * Créer un lien d'invitation partagé
   */
  async createInvitationLink(
    data: CreateInvitationLinkData
  ): Promise<ClubInvitationLink> {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Générer un code unique
      const { data: codeResult, error: codeError } = await supabase
        .rpc('generate_invitation_code');

      if (codeError) throw codeError;
      const code = codeResult as string;

      // Créer le lien d'invitation
      const { data: link, error } = await supabase
        .from('club_invitation_links')
        .insert({
          club_id: data.club_id,
          created_by: user.id,
          code,
          default_role: data.default_role,
          max_uses: data.max_uses || null,
          expires_at: data.expires_at || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return link;
    } catch (error: any) {
      console.error('Erreur lors de la création du lien d\'invitation:', error);
      throw error;
    }
  }

  /**
   * Récupérer les liens d'invitation d'un club
   */
  async getInvitationLinks(
    params: GetInvitationLinksParams
  ): Promise<ClubInvitationLink[]> {
    try {
      let query = supabase
        .from('club_invitation_links')
        .select('*')
        .eq('club_id', params.club_id)
        .order('created_at', { ascending: false });

      if (params.is_active !== undefined) {
        query = query.eq('is_active', params.is_active);
      }

      if (params.limit) {
        query = query.limit(params.limit);
      }

      if (params.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      console.error('Erreur lors de la récupération des liens:', error);
      throw error;
    }
  }

  /**
   * Récupérer un lien d'invitation par son code
   */
  async getInvitationLinkByCode(code: string): Promise<ClubInvitationLink | null> {
    try {
      const { data, error } = await supabase
        .from('club_invitation_links')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du lien:', error);
      throw error;
    }
  }

  /**
   * Utiliser un lien d'invitation
   */
  async useInvitationLink(code: string): Promise<UseInvitationLinkResponse> {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Vous devez être connecté pour utiliser ce lien');
      }

      // Récupérer le lien
      const link = await this.getInvitationLinkByCode(code);
      if (!link) {
        throw new Error('Lien d\'invitation introuvable');
      }

      // Vérifier si actif
      if (!link.is_active) {
        throw new Error('Ce lien d\'invitation n\'est plus actif');
      }

      // Vérifier l'expiration
      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        throw new Error('Ce lien d\'invitation a expiré');
      }

      // Vérifier le nombre d'utilisations
      if (link.max_uses && link.current_uses >= link.max_uses) {
        throw new Error('Ce lien d\'invitation a atteint sa limite d\'utilisations');
      }

      // Récupérer le profil de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('club_id')
        .eq('id', user.id)
        .single();

      // Vérifier si déjà membre
      if (profile && profile.club_id === link.club_id) {
        return {
          success: true,
          club_id: link.club_id,
          club_name: '', // Sera rempli plus tard
          role: link.default_role as InvitationRole,
          already_member: true,
        };
      }

      // Vérifier si l'utilisateur a déjà utilisé ce lien
      const { data: existingUse } = await supabase
        .from('club_invitation_link_uses')
        .select('id')
        .eq('invitation_link_id', link.id)
        .eq('user_id', user.id)
        .single();

      if (existingUse) {
        throw new Error('Vous avez déjà utilisé ce lien d\'invitation');
      }

      // Mettre à jour le profil de l'utilisateur
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          club_id: link.club_id,
          role: link.default_role,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Enregistrer l'utilisation du lien
      const { error: useError } = await supabase
        .from('club_invitation_link_uses')
        .insert({
          invitation_link_id: link.id,
          user_id: user.id,
        });

      if (useError) throw useError;

      // Récupérer le nom du club
      const { data: club } = await supabase
        .from('clubs')
        .select('name')
        .eq('id', link.club_id)
        .single();

      // Créer une notification pour le créateur du lien
      await supabase
        .from('notifications')
        .insert({
          user_id: link.created_by,
          type: 'nouveau_club',
          title: 'Nouveau membre via lien d\'invitation',
          message: `Un nouveau membre a rejoint votre club via le lien ${code}`,
          is_read: false,
        });

      return {
        success: true,
        club_id: link.club_id,
        club_name: club?.name || '',
        role: link.default_role as InvitationRole,
        already_member: false,
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'utilisation du lien:', error);
      throw error;
    }
  }

  /**
   * Désactiver un lien d'invitation
   */
  async deactivateInvitationLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('club_invitation_links')
        .update({ is_active: false })
        .eq('id', linkId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de la désactivation du lien:', error);
      throw error;
    }
  }

  /**
   * Supprimer un lien d'invitation
   */
  async deleteInvitationLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('club_invitation_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du lien:', error);
      throw error;
    }
  }

  // ============================================================
  // STATISTIQUES
  // ============================================================

  /**
   * Récupérer les statistiques d'invitations d'un club
   */
  async getInvitationStats(clubId: string): Promise<InvitationStats> {
    try {
      // Récupérer toutes les invitations par email
      const { data: invitations, error: invitationsError } = await supabase
        .from('club_invitations')
        .select('status')
        .eq('club_id', clubId);

      if (invitationsError) throw invitationsError;

      // Compter par statut
      const totalInvitations = invitations?.length || 0;
      const pendingInvitations = invitations?.filter(i => i.status === 'pending').length || 0;
      const acceptedInvitations = invitations?.filter(i => i.status === 'accepted').length || 0;
      const expiredInvitations = invitations?.filter(i => i.status === 'expired').length || 0;
      const revokedInvitations = invitations?.filter(i => i.status === 'revoked').length || 0;

      // Calculer le taux d'acceptation
      const acceptanceRate = totalInvitations > 0 
        ? Math.round((acceptedInvitations / totalInvitations) * 100) 
        : 0;

      // Récupérer les liens d'invitation
      const { data: links, error: linksError } = await supabase
        .from('club_invitation_links')
        .select('is_active')
        .eq('club_id', clubId);

      if (linksError) throw linksError;

      const totalLinks = links?.length || 0;
      const activeLinks = links?.filter(l => l.is_active).length || 0;

      // Compter les utilisations de liens
      const { count: totalLinkUses, error: usesError } = await supabase
        .from('club_invitation_link_uses')
        .select('id', { count: 'exact', head: true })
        .in('invitation_link_id', links?.map(l => (l as any).id) || []);

      if (usesError) throw usesError;

      return {
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        expiredInvitations,
        revokedInvitations,
        acceptanceRate,
        totalLinks,
        activeLinks,
        totalLinkUses: totalLinkUses || 0,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

export default new InvitationService();