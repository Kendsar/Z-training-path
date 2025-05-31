import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useProfileStore } from '../../stores/profileStore';
import { Gift, Timer, Trophy, Sparkles, Crown, Star, Award } from 'lucide-react';
import { toast } from 'sonner';

const SPIN_DURATION = 5000; // 5 seconds
const TOTAL_SEGMENTS = 12;

interface WheelSegment {
  label: string;
  type: 'kai_points' | 'title' | 'skin';
  value: string | number;
  color: string;
  darkColor: string;
  icon: typeof Gift;
}

const segments: WheelSegment[] = [
  { label: '100 KP', type: 'kai_points', value: 100, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Dragon Warrior', type: 'title', value: 'Dragon Warrior', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Trophy },
  { label: '200 KP', type: 'kai_points', value: 200, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Golden Aura', type: 'skin', value: 'Golden Aura', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Sparkles },
  { label: '500 KP', type: 'kai_points', value: 500, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Ki Master', type: 'title', value: 'Ki Master', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Crown },
  { label: '1000 KP', type: 'kai_points', value: 1000, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Blue Ki Flame', type: 'skin', value: 'Blue Ki Flame', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Star },
  { label: '200 KP', type: 'kai_points', value: 200, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Ultra Instinct', type: 'title', value: 'Ultra Instinct', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Crown },
  { label: '100 KP', type: 'kai_points', value: 100, color: 'bg-kai-500', darkColor: 'dark:bg-kai-600', icon: Gift },
  { label: 'Divine Energy', type: 'skin', value: 'Divine Energy', color: 'bg-primary-500', darkColor: 'dark:bg-primary-600', icon: Sparkles },
];

export default function WheelOfHonor() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const [canSpin, setCanSpin] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [currentReward, setCurrentReward] = useState<WheelSegment | null>(null);
  const controls = useAnimation();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    checkSpinEligibility();
    const interval = setInterval(checkSpinEligibility, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSpinEligibility = async () => {
    try {
      const { data: eligibilityData, error: eligibilityError } = await supabase
        .rpc('check_spin_eligibility', { user_id: profile?.id });

      if (eligibilityError) throw eligibilityError;

      const { data: nextSpinData, error: nextSpinError } = await supabase
        .rpc('get_next_spin_time', { user_id: profile?.id });

      if (nextSpinError) throw nextSpinError;

      setNextSpinTime(nextSpinData ? new Date(nextSpinData) : null);
      setCanSpin(eligibilityData);
    } catch (error) {
      console.error('Error checking spin eligibility:', error);
    }
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spin-wheel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to spin wheel');
      }

      const { reward } = await response.json();
      const matchingSegment = segments.find(s => s.type === reward.type && s.value === reward.value);
      setCurrentReward(matchingSegment || null);
      
      // Animate wheel
      const rotations = 5; // Number of full rotations
      if (!matchingSegment) {
        toast.error("Invalid reward received");
        return;
      }
      const segmentIndex = segments.indexOf(matchingSegment);
      const segmentAngle = (360 / TOTAL_SEGMENTS);
      const randomOffset = Math.random() * segmentAngle; // pour rendre l’atterrissage plus naturel
      const targetAngle = 360 - (segmentAngle * segmentIndex) + randomOffset;
      const totalDegrees = (rotations * 360) + targetAngle;

      await controls.start({
        rotate: totalDegrees,
        transition: {
          duration: SPIN_DURATION / 1000,
          ease: [0.34, 1.56, 0.64, 1],
        },
      });

      setShowReward(true);
      await fetchProfile();
      await checkSpinEligibility();
    } catch (error) {
      toast.error('Failed to spin the wheel');
      console.error('Error spinning wheel:', error);
    } finally {
      setIsSpinning(false);
    }
  };

  const getTimeRemaining = () => {
    if (!nextSpinTime) return '';
    
    const now = new Date();
    const diff = nextSpinTime.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const closeRewardModal = () => {
    setShowReward(false);
    setCurrentReward(null);
  };
  
  const labelRotation = angle > 180 ? -angle + 180 : -angle;


  return (
    <div className="flex flex-col items-center p-6 card">
      <h2 className="text-2xl font-bold mb-6">Wheel of Honor</h2>
      
      <div className="relative w-64 h-64 mb-6">
        {/* Wheel */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden shadow-lg"
          animate={controls}
          style={{ transformOrigin: 'center' }}
        >
          <div className="relative w-full h-full">
            {segments.map((segment, i) => {
              const Icon = segment.icon;
              const angle = (i * 360) / TOTAL_SEGMENTS;
              return (
                <div
                  key={i}
                  className={`absolute w-1/2 h-1/2 origin-bottom-right ${segment.color} ${segment.darkColor}`}
                  style={{
                    transform: `rotate(${angle}deg)`,
                  }}
                >

<div
  className="absolute text-white text-xs whitespace-nowrap flex items-center"
  style={{
    left: '25%',
    top: '50%',
    transform: `rotate(${labelRotation}deg) translateX(-50%) translateY(-50%)`,
    transformOrigin: 'left center',
  }}
>
  <Icon size={16} className="inline-block mr-1" />
  <span>{segment.label}</span>
</div>




                </div>
              );
            })}
          </div>
        </motion.div>
        
        {/* Center pin */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-lg z-10 border-2 border-primary-500" />
        </div>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -ml-3 w-6 h-6">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-kai-500" />
        </div>
      </div>
      
      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={!canSpin || isSpinning}
        className={`btn btn-primary btn-lg w-full max-w-xs mb-4 ${
          (!canSpin || isSpinning) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isSpinning ? (
          <span className="flex items-center">
            <Gift className="mr-2 animate-spin" />
            Spinning...
          </span>
        ) : canSpin ? (
          <span className="flex items-center">
            <Gift className="mr-2" />
            Spin the Wheel
          </span>
        ) : (
          <span className="flex items-center">
            <Timer className="mr-2" />
            {getTimeRemaining()}
          </span>
        )}
      </button>
      
      {/* Stats */}
      <div className="w-full max-w-xs grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Trophy className="w-5 h-5 mx-auto mb-1 text-primary-500" />
          <div className="text-sm font-medium">Titles</div>
          <div className="text-2xl font-bold text-primary-500">
            {profile?.titles_count || 0}
          </div>
        </div>
        <div className="text-center p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-primary-500" />
          <div className="text-sm font-medium">Skins</div>
          <div className="text-2xl font-bold text-primary-500">
            {profile?.skins_count || 0}
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showReward && currentReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-4">
                {currentReward.type === 'kai_points' && <Gift className="w-8 h-8 text-white" />}
                {currentReward.type === 'title' && <Crown className="w-8 h-8 text-white" />}
                {currentReward.type === 'skin' && <Sparkles className="w-8 h-8 text-white" />}
              </div>
              <h3 className="text-xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg mb-4">
                {currentReward.type === 'kai_points' && `You won ${currentReward.value} Kai Points! 🎉`}
                {currentReward.type === 'title' && `You unlocked the "${currentReward.value}" title! 👑`}
                {currentReward.type === 'skin' && `You unlocked the "${currentReward.value}" skin! ✨`}
              </p>
              <button
                onClick={closeRewardModal}
                className="btn btn-primary btn-lg w-full"
              >
                Awesome!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}