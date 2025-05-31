import { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useWorkoutsStore } from '../../stores/workoutsStore';
import { Workout } from '../../types/workout';
import { Dumbbell, Clock, Trash2, Edit, X, Save, Moon } from 'lucide-react';

interface WorkoutListProps {
  workouts: Workout[];
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Workout>>({});
  
  const { deleteWorkout, updateWorkout } = useWorkoutsStore();
  
  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout.id);
    setEditForm({
      name: workout.name,
      sport_type: workout.sport_type,
      duration: workout.duration,
      notes: workout.notes,
      is_rest_day: workout.is_rest_day,
    });
  };
  
  const handleUpdate = async () => {
    if (!editingWorkout || (!editForm.is_rest_day && (!editForm.name || !editForm.sport_type))) {
      toast.error('Name and sport type are required');
      return;
    }
    
    try {
      await updateWorkout(editingWorkout, editForm);
      toast.success('Workout updated successfully');
      setEditingWorkout(null);
      setEditForm({});
    } catch (error: any) {
      toast.error(error.message || 'Failed to update workout');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(id);
        toast.success('Workout deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete workout');
      }
    }
  };
  
  if (workouts.length === 0) {
    return (
      <div className="py-8 text-center">
        <Dumbbell size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400">No workouts for this month yet.</p>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
          Click on a day in the calendar to add your first workout!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div
          key={workout.id}
          className={`border rounded-lg p-4 ${
            workout.is_rest_day 
              ? 'border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20' 
              : 'border-zinc-200 dark:border-zinc-700'
          }`}
        >
          {editingWorkout === workout.id ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={editForm.is_rest_day}
                      onChange={(e) => setEditForm({ ...editForm, is_rest_day: e.target.checked })}
                    />
                    <div className={`w-10 h-6 rounded-full transition ${
                      editForm.is_rest_day ? 'bg-success-500' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}>
                      <div className={`absolute w-4 h-4 rounded-full transition-transform transform bg-white top-1 left-1 ${
                        editForm.is_rest_day ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium">Rest Day</span>
                </label>
                <Moon className={`w-5 h-5 ${editForm.is_rest_day ? 'text-success-500' : 'text-zinc-400'}`} />
              </div>

              <div>
                <label htmlFor={`edit-name-${workout.id}`} className="form-label text-xs">
                  Name
                </label>
                <input
                  id={`edit-name-${workout.id}`}
                  type="text"
                  value={editForm.is_rest_day ? 'Rest Day' : (editForm.name || '')}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="input"
                  placeholder="Workout name"
                  required={!editForm.is_rest_day}
                  disabled={editForm.is_rest_day}
                />
              </div>
              
              <div>
                <label htmlFor={`edit-sport-${workout.id}`} className="form-label text-xs">
                  Sport Type
                </label>
                <input
                  id={`edit-sport-${workout.id}`}
                  type="text"
                  value={editForm.is_rest_day ? 'Rest' : (editForm.sport_type || '')}
                  onChange={(e) => setEditForm({ ...editForm, sport_type: e.target.value })}
                  className="input"
                  placeholder="Sport type"
                  required={!editForm.is_rest_day}
                  disabled={editForm.is_rest_day}
                />
              </div>
              
              <div>
                <label htmlFor={`edit-duration-${workout.id}`} className="form-label text-xs">
                  Duration (minutes)
                </label>
                <input
                  id={`edit-duration-${workout.id}`}
                  type="number"
                  value={editForm.duration || ''}
                  onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) || undefined })}
                  className="input"
                  placeholder="Duration in minutes"
                  min="1"
                  disabled={editForm.is_rest_day}
                />
              </div>
              
              <div>
                <label htmlFor={`edit-notes-${workout.id}`} className="form-label text-xs">
                  Notes
                </label>
                <textarea
                  id={`edit-notes-${workout.id}`}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="textarea"
                  placeholder="Additional notes"
                  disabled={editForm.is_rest_day}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setEditingWorkout(null);
                    setEditForm({});
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <X size={16} className="mr-1" />
                  Cancel
                </button>
                <button onClick={handleUpdate} className="btn btn-primary btn-sm">
                  <Save size={16} className="mr-1" />
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between">
                <div className="flex items-center">
                  <h3 className="font-semibold">{workout.name}</h3>
                  {workout.is_rest_day && (
                    <Moon size={16} className="ml-2 text-success-500" />
                  )}
                </div>
                <div className="badge badge-secondary">
                  {workout.sport_type}
                </div>
              </div>
              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
              </div>
              
              {!workout.is_rest_day && workout.duration && (
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 flex items-center">
                  <Clock size={14} className="mr-1" />
                  {workout.duration} minutes
                </div>
              )}
              
              {!workout.is_rest_day && workout.notes && (
                <div className="mt-2 text-sm border-t border-zinc-100 dark:border-zinc-800 pt-2">
                  {workout.notes}
                </div>
              )}
              
              <div className="mt-3 pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(workout)}
                  className="btn btn-ghost btn-sm"
                  aria-label="Edit workout"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Delete workout"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}