export const formatDateOnly = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};