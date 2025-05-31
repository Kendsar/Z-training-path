import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, subMonths, addMonths, isSameDay, isPast, isFuture } from 'date-fns';
import { useWorkoutsStore } from '../stores/workoutsStore';
import { useProfileStore } from '../stores/profileStore';
import WorkoutList from '../components/workouts/WorkoutList';
import WorkoutForm from '../components/workouts/WorkoutForm';
import StatsSection from '../components/stats/StatsSection';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [existingWorkout, setExistingWorkout] = useState<any>(null);
  
  const { workouts, fetchWorkouts } = useWorkoutsStore();
  const { profile, fetchProfile } = useProfileStore();
  
  useEffect(() => {
    fetchWorkouts();
    fetchProfile();
  }, [fetchWorkouts, fetchProfile]);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startWeekday = getDay(monthStart);
  
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const getDayWorkouts = (day: Date) => {
    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date);
      return isSameDay(workoutDate, day);
    });
  };
  
  const handleDateClick = (day: Date) => {
    if (!isToday(day)) {
      toast.error('Workouts can only be added for today');
      return;
    }
    
    const dayWorkouts = getDayWorkouts(day);
    if (dayWorkouts.length > 0) {
      setExistingWorkout(dayWorkouts[0]);
    } else {
      setExistingWorkout(null);
    }
    
    setSelectedDate(day);
    setShowWorkoutForm(true);
  };
  
  const handleCloseForm = () => {
    setShowWorkoutForm(false);
    setSelectedDate(null);
    setExistingWorkout(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-col space-y-6">
            <section className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Training Calendar</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={prevMonth}
                    className="btn btn-ghost btn-sm"
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-lg font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </h3>
                  <button 
                    onClick={nextMonth}
                    className="btn btn-ghost btn-sm"
                    aria-label="Next month"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {WEEKDAYS.map((day) => (
                  <div 
                    key={day} 
                    className="text-center text-sm font-medium text-zinc-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startWeekday }).map((_, index) => (
                  <div key={`empty-${index}`} className="calendar-day calendar-day-other-month" />
                ))}
                
                {monthDays.map((day) => {
                  const dayWorkouts = getDayWorkouts(day);
                  const isCurrentDay = isToday(day);
                  const workout = dayWorkouts[0];
                  
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => handleDateClick(day)}
                      disabled={!isCurrentDay}
                      className={`calendar-day calendar-day-current-month
                        ${isCurrentDay ? 'calendar-day-today' : ''}
                        ${dayWorkouts.length > 0 ? 'calendar-day-with-workout' : ''}
                        ${selectedDate && isSameDay(day, selectedDate) ? 'bg-primary-500 text-white' : ''}
                        ${!isCurrentDay ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <span className="mt-1">{format(day, 'd')}</span>
                      {workout && (
                        <span className={`calendar-workout-badge ${
                          workout.is_rest_day ? 'bg-success-500' : 'bg-primary-500'
                        }`} title={workout.name}>
                          {workout.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
            
            <section className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {format(currentMonth, 'MMMM')} Workouts
                </h2>
              </div>
              
              <WorkoutList 
                workouts={workouts.filter(workout => {
                  const workoutDate = new Date(workout.date);
                  return isSameMonth(workoutDate, currentMonth);
                })}
              />
            </section>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <StatsSection profile={profile} workouts={workouts} />
        </div>
      </div>
      
      {showWorkoutForm && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold">
                {existingWorkout ? 'Edit Workout' : 'Add Workout'} - {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <button 
                onClick={handleCloseForm}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <WorkoutForm 
                date={selectedDate}
                existingWorkout={existingWorkout}
                onClose={handleCloseForm} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}