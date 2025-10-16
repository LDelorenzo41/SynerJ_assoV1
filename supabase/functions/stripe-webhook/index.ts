// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature'
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret');
      return new Response('Webhook secret not configured', {
        status: 400
      });
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', {
        status: 400
      });
    }

    console.log('Webhook event received:', event.type);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);

        const associationId = session.metadata?.association_id;

        if (!associationId) {
          console.error('❌ No association_id in metadata');
          break;
        }

        // Récupère les détails de la subscription pour avoir current_period_end
        let subscriptionEndDate = null;
        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            if (subscription.current_period_end) {
              subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
            }
          } catch (err) {
            console.error('Error retrieving subscription:', err);
          }
        }

        // Update association with Stripe IDs
        const updateData: any = {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          stripe_subscription_status: 'active'
        };

        if (subscriptionEndDate) {
          updateData.subscription_current_period_end = subscriptionEndDate;
        }

        const { error: updateError } = await supabase
          .from('associations')
          .update(updateData)
          .eq('id', associationId);

        if (updateError) {
          console.error('❌ Error updating association:', updateError);
        } else {
          console.log('✅ Association updated successfully:', associationId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription updated:', subscription.id);

        const updateData: any = {
          stripe_subscription_status: subscription.status,
        };

        // Ajoute la date seulement si elle existe
        if (subscription.current_period_end) {
          updateData.subscription_current_period_end = new Date(subscription.current_period_end * 1000).toISOString();
        }

        const { error: updateError } = await supabase
          .from('associations')
          .update(updateData)
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('❌ Error updating subscription status:', updateError);
        } else {
          console.log('✅ Subscription status updated:', subscription.status);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription deleted:', subscription.id);

        const { error: updateError } = await supabase
          .from('associations')
          .update({
            stripe_subscription_status: 'canceled'
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('❌ Error updating subscription to canceled:', updateError);
        } else {
          console.log('✅ Subscription marked as canceled');
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('⚠️ Payment failed for invoice:', invoice.id);

        if (invoice.subscription) {
          const { error: updateError } = await supabase
            .from('associations')
            .update({
              stripe_subscription_status: 'past_due'
            })
            .eq('stripe_subscription_id', invoice.subscription as string);

          if (updateError) {
            console.error('❌ Error updating subscription to past_due:', updateError);
          } else {
            console.log('✅ Subscription marked as past_due');
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('✅ Payment succeeded for invoice:', invoice.id);

        if (invoice.subscription) {
          const { error: updateError } = await supabase
            .from('associations')
            .update({
              stripe_subscription_status: 'active'
            })
            .eq('stripe_subscription_id', invoice.subscription as string);

          if (updateError) {
            console.error('❌ Error updating subscription to active:', updateError);
          } else {
            console.log('✅ Subscription marked as active after payment');
          }
        }
        break;
      }

      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Webhook error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});