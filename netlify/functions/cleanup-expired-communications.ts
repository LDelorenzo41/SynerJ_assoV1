// netlify/functions/cleanup-expired-communications.ts
import { Handler, schedule } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Clé service, pas anon

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const handler: Handler = schedule("0 2 * * *", async (event) => {
  console.log('🧹 Début du nettoyage des communications expirées...');
  
  try {
    const now = new Date().toISOString();
    
    // 1. Récupérer les communications expirées
    const { data: expiredCommunications, error: fetchError } = await supabase
      .from('communications')
      .select('id, title')
      .not('expires_at', 'is', null)
      .lt('expires_at', now);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
    }

    if (!expiredCommunications || expiredCommunications.length === 0) {
      console.log('✅ Aucune communication expirée à nettoyer');
      return { statusCode: 200, body: JSON.stringify({ message: 'Aucune communication expirée' }) };
    }

    const expiredIds = expiredCommunications.map(c => c.id);
    console.log(`🔍 ${expiredIds.length} communication(s) expirée(s) trouvée(s)`);

    // 2. Supprimer les notifications associées
    const { data: deletedNotifications, error: notifError } = await supabase
      .from('notifications')
      .delete()
      .eq('type', 'nouvelle_communication')
      .in('metadata->>communication_id', expiredIds)
      .select('id');

    if (notifError) {
      console.error('❌ Erreur suppression notifications:', notifError);
    } else {
      console.log(`🗑️ ${deletedNotifications?.length || 0} notification(s) supprimée(s)`);
    }

    // 3. Supprimer les communications expirées
    const { data: deletedCommunications, error: commError } = await supabase
      .from('communications')
      .delete()
      .in('id', expiredIds)
      .select('id, title');

    if (commError) {
      console.error('❌ Erreur suppression communications:', commError);
      return { statusCode: 500, body: JSON.stringify({ error: commError.message }) };
    }

    const deletedCount = deletedCommunications?.length || 0;
    console.log(`✅ ${deletedCount} communication(s) expirée(s) supprimée(s)`);

    // 4. Log détaillé
    deletedCommunications?.forEach(comm => {
      console.log(`   - "${comm.title}" (${comm.id})`);
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Nettoyage terminé : ${deletedCount} communications et ${deletedNotifications?.length || 0} notifications supprimées`,
        deletedCommunications: deletedCount,
        deletedNotifications: deletedNotifications?.length || 0
      })
    };

  } catch (error: any) {
    console.error('💥 Erreur critique lors du nettoyage:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
});