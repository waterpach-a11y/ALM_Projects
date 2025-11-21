/**
 * Vérifie si une date d'échéance est dépassée
 * @param dueDate - La date d'échéance (peut être un Timestamp Firestore ou une Date)
 * @param status - Le statut actuel de l'élément
 * @returns true si la date est dépassée et le statut n'est pas "done"
 */
export const isOverdue = (dueDate: any, status?: string): boolean => {
  if (!dueDate) return false;
  
  // Si le statut est "done", l'élément n'est pas en retard
  if (status === 'done') return false;
  
  let date: Date | null = null;
  
  // Gérer les Timestamps Firestore
  if (dueDate?.toDate) {
    date = dueDate.toDate() as Date;
  } else if (dueDate instanceof Date) {
    date = dueDate;
  } else if (typeof dueDate === 'string') {
    date = new Date(dueDate);
  }
  
  if (!date || isNaN(date.getTime())) return false;
  
  // Comparer avec la date actuelle (sans l'heure)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
};

/**
 * Calcule le nombre de jours de retard
 * @param dueDate - La date d'échéance
 * @returns Le nombre de jours de retard (0 si pas en retard)
 */
export const getDaysOverdue = (dueDate: any): number => {
  if (!dueDate) return 0;
  
  let date: Date | null = null;
  
  if (dueDate?.toDate) {
    date = dueDate.toDate() as Date;
  } else if (dueDate instanceof Date) {
    date = dueDate;
  } else if (typeof dueDate === 'string') {
    date = new Date(dueDate);
  }
  
  if (!date || isNaN(date.getTime())) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  
  if (due >= today) return 0;
  
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

