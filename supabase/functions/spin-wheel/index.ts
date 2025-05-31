import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewardConfig {
  type: 'kai_points' | 'title' | 'skin';
  value: any;
  weight: number;
}

const REWARDS: RewardConfig[] = [
  { type: 'kai_points', value: 100, weight: 40 },
  { type: 'kai_points', value: 200, weight: 30 },
  { type: 'kai_points', value: 500, weight: 15 },
  { type: 'kai_points', value: 1000, weight: 5 },
  { type: 'title', value: 'Dragon Warrior', weight: 3 },
  { type: 'title', value: 'Ki Master', weight: 2 },
  { type: 'title', value: 'Ultra Instinct', weight: 1 },
  { type: 'skin', value: 'Golden Aura', weight: 2 },
  { type: 'skin', value: 'Blue Ki Flame', weight: 1.5 },
  { type: 'skin', value: 'Divine Energy', weight: 0.5 },
];

function selectReward(): RewardConfig {
  const totalWeight = REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const reward of REWARDS) {
    random -= reward.weight;
    if (random <= 0) {
      return reward;
    }
  }
  
  return REWARDS[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Get the user ID from the JWT
    const authHeader = req.headers.get('Authorization')!;
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check eligibility
    const { data: eligibleData, error: eligibleError } = await supabaseClient.rpc(
      'check_spin_eligibility',
      { user_id: user.id }
    );

    if (eligibleError) {
      throw new Error('Failed to check eligibility');
    }

    if (!eligibleData) {
      throw new Error('Not eligible to spin yet');
    }

    // Select reward
    const reward = selectReward();

    // Record the spin
    const { error: spinError } = await supabaseClient
      .from('wheel_spins')
      .insert({
        user_id: user.id,
        reward_type: reward.type,
        reward_value: reward.value,
      });

    if (spinError) {
      throw new Error('Failed to record spin');
    }

    // Apply reward
    switch (reward.type) {
      case 'kai_points':
        await supabaseClient.rpc('add_kai_points', {
          user_id: user.id,
          points: reward.value,
        });
        break;

      case 'title':
        await supabaseClient
          .from('user_titles')
          .insert({
            user_id: user.id,
            title: reward.value,
          })
          .select()
          .single();
        break;

      case 'skin':
        await supabaseClient
          .from('user_skins')
          .insert({
            user_id: user.id,
            skin: reward.value,
          })
          .select()
          .single();
        break;
    }

    return new Response(
      JSON.stringify({ reward }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});