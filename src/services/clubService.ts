import { supabase } from '../lib/supabase';

export class ClubService {
  /**
   * Supprime un club et met à jour le statut de ses membres en "Supporter"
   * @param clubId - ID du club à supprimer
   * @throws Error si la suppression échoue
   */
  static async deleteClub(clubId: string): Promise<void> {
    try {
      // Étape 1: Récupérer tous les membres et admins du club
      const { data: members, error: fetchError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('club_id', clubId)
        .in('role', ['Member', 'Club Admin']);

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération des membres: ${fetchError.message}`);
      }

      // Étape 2: Mettre à jour le rôle de tous les membres vers "Supporter"
      if (members && members.length > 0) {
        const memberIds = members.map(m => m.id);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'Supporter' })
          .in('id', memberIds);

        if (updateError) {
          throw new Error(`Erreur lors de la mise à jour des membres: ${updateError.message}`);
        }

        console.log(`${members.length} membre(s) ont été convertis en Supporters`);
      }

      // Étape 3: Supprimer le club
      // Les cascades automatiques vont gérer:
      // - club_id -> NULL dans profiles (ON DELETE SET NULL)
      // - Suppression des events (ON DELETE CASCADE)
      // - Suppression des user_clubs (ON DELETE CASCADE)
      const { error: deleteError } = await supabase
        .from('clubs')
        .delete()
        .eq('id', clubId);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression du club: ${deleteError.message}`);
      }

      console.log('Club supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur dans deleteClub:', error);
      throw new Error(`Impossible de supprimer le club: ${error.message}`);
    }
  }

  /**
   * Récupère les informations sur un club et ses membres
   * Utile pour afficher des avertissements avant suppression
   */
  static async getClubDeletionInfo(clubId: string): Promise<{
    clubName: string;
    memberCount: number;
    eventCount: number;
  }> {
    try {
      // Récupérer les infos du club
      const { data: club, error: clubError } = await supabase
        .from('clubs')
        .select('name')
        .eq('id', clubId)
        .single();

      if (clubError) throw clubError;

      // Compter les membres
      const { count: memberCount, error: memberError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (memberError) throw memberError;

      // Compter les événements
      const { count: eventCount, error: eventError } = await supabase
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (eventError) throw eventError;

      return {
        clubName: club.name,
        memberCount: memberCount || 0,
        eventCount: eventCount || 0,
      };
    } catch (error: any) {
      console.error('Erreur dans getClubDeletionInfo:', error);
      throw new Error(`Impossible de récupérer les informations: ${error.message}`);
    }
  }
}