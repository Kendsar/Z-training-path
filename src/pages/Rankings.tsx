import { useState, useEffect } from 'react';
import { useProfileStore } from '../stores/profileStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Crown, Award, TrendingUp, Filter, ChevronUp, ChevronDown, Zap, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

type RankingPeriod = 'global' | 'monthly' | 'weekly';
type SortField = 'kai_points' | 'streak' | 'rank';

interface RankingUser {
  id: string;
  username: string;
  kai_points: number;
  current_rank: string;
  current_streak: number;
  equipped_title: string | null;
  equipped_skin: string | null;
}

interface Interaction {
  id: string;
  type: 'energy_salute' | 'encouragement_beam';
  created_at: string;
}

const rankIcons = {
  'Human Form': Star,
  'Initiate Saiyan': Star,
  'Saiyan': Flame,
  'Super Saiyan': Crown,
  'SSJ2': Crown,
  'SSJ3': Crown,
  'Blue Sign': Star,
  'Final Form': Trophy,
  'God Form': Crown,
};

const rankColors = {
  'Human Form': 'bg-zinc-500',
  'Initiate Saiyan': 'bg-blue-500',
  'Saiyan': 'bg-indigo-500',
  'Super Saiyan': 'bg-yellow-500',
  'SSJ2': 'bg-amber-500',
  'SSJ3': 'bg-orange-500',
  'Blue Sign': 'bg-cyan-500',
  'Final Form': 'bg-purple-500',
  'God Form': 'bg-red-500',
};

export default function Rankings() {
  const [period, setPeriod] = useState<RankingPeriod>('global');
  const [sortField, setSortField] = useState<SortField>('kai_points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [interactions, setInteractions] = useState<Record<string, Interaction[]>>({});
  const { profile } = useProfileStore();

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_rankings', {
          p_period: period,
          p_sort_field: sortField,
          p_sort_direction: sortDirection,
          p_page: page,
          p_page_size: 20
        });

      if (error) throw error;

      if (data) {
        setRankings(page === 1 ? data : [...rankings, ...data]);
        setHasMore(data.length === 20);
      }
    } catch (error) {
      console.error('Error fetching rankings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInteractions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .in('receiver_id', rankings.map(user => user.id))
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const groupedInteractions = data.reduce((acc: Record<string, Interaction[]>, interaction) => {
        if (!acc[interaction.receiver_id]) {
          acc[interaction.receiver_id] = [];
        }
        acc[interaction.receiver_id].push(interaction);
        return acc;
      }, {});

      setInteractions(groupedInteractions);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  };

  useEffect(() => {
    setPage(1);
    setRankings([]);
    setIsLoading(true);
    fetchRankings();
  }, [period, sortField, sortDirection]);

  useEffect(() => {
    if (rankings.length > 0) {
      fetchInteractions();
    }
  }, [rankings]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sendInteraction = async (userId: string, type: 'energy_salute' | 'encouragement_beam') => {
    try {
      const { data, error } = await supabase
        .rpc('send_interaction', {
          receiver_id: userId,
          interaction_type: type
        });

      if (error) throw error;

      toast.success(`${type === 'energy_salute' ? 'Energy Salute' : 'Encouragement Beam'} sent!`);
      fetchInteractions();
    } catch (error: any) {
      if (error.message.includes('unique_daily_interaction')) {
        toast.error('You can only send one interaction of each type per user per day');
      } else {
        toast.error('Failed to send interaction');
      }
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    fetchRankings();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Scouter Rankings</h1>
          
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setPeriod('global')}
                className={`btn ${period === 'global' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Global
              </button>
              <button
                onClick={() => setPeriod('monthly')}
                className={`btn ${period === 'monthly' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriod('weekly')}
                className={`btn ${period === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Warrior
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('kai_points')}
                  >
                    <div className="flex items-center">
                      Kai Points
                      {sortField === 'kai_points' && (
                        sortDirection === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('streak')}
                  >
                    <div className="flex items-center">
                      Streak
                      {sortField === 'streak' && (
                        sortDirection === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {rankings.map((user, index) => {
                  const isCurrentUser = user.id === profile?.id;
                  const RankIcon = rankIcons[user.current_rank as keyof typeof rankIcons] || Star;
                  const rankColor = rankColors[user.current_rank as keyof typeof rankColors] || 'bg-zinc-500';
                  const userInteractions = interactions[user.id] || [];
                  
                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${
                        isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                      } hover:bg-zinc-50 dark:hover:bg-zinc-800/50`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="font-bold mr-2">{index + 1}</span>
                          <div className={`w-8 h-8 rounded-full ${rankColor} flex items-center justify-center text-white`}>
                            <RankIcon size={16} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.equipped_skin ? (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
                              {user.username.slice(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold">
                              {user.username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="text-sm font-medium">
                              {user.username}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {user.current_rank}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Flame className="w-4 h-4 text-kai-500 mr-1" />
                          {user.kai_points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                          {user.current_streak} days
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {!isCurrentUser && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => sendInteraction(user.id, 'energy_salute')}
                              className="btn btn-ghost btn-sm tooltip"
                              data-tip="Send Energy Salute"
                              disabled={userInteractions.some(i => i.type === 'energy_salute')}
                            >
                              <Zap
                                size={16}
                                className={userInteractions.some(i => i.type === 'energy_salute')
                                  ? 'text-zinc-400'
                                  : 'text-yellow-500 animate-pulse'
                                }
                              />
                            </button>
                            <button
                              onClick={() => sendInteraction(user.id, 'encouragement_beam')}
                              className="btn btn-ghost btn-sm tooltip"
                              data-tip="Send Encouragement Beam"
                              disabled={userInteractions.some(i => i.type === 'encouragement_beam')}
                            >
                              <Sparkles
                                size={16}
                                className={userInteractions.some(i => i.type === 'encouragement_beam')
                                  ? 'text-zinc-400'
                                  : 'text-blue-500 animate-pulse'
                                }
                              />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            </div>
          ) : hasMore ? (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                className="btn btn-ghost btn-md"
              >
                Load More
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}