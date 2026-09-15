// Developer: Bhavesh Bharatkumar Gehlot
// Enrollment Number: 250140119026

export const addToSearchHistory = (location: { locationId?: string; name: string; state?: string }) => {
  if (typeof window === 'undefined') return;
  
  const history = JSON.parse(localStorage.getItem('kiran_history') || '[]');
  // Nayi city ko top par rakho, aur duplicate hata do. Maximum 10 history save rakho.
  const newHistory = [location, ...history.filter((h: any) => h.name !== location.name)].slice(0, 10);
  
  localStorage.setItem('kiran_history', JSON.stringify(newHistory));
};

export const getSearchHistory = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('kiran_history') || '[]');
};

export const clearSearchHistory = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('kiran_history');
};