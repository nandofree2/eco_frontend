export const formatDateOnly = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatYmdToDmy = (ymd: string | null | undefined): string => {
  if (!ymd) return '';
  const datePart = ymd.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

export const parseDmyToYmd = (dmy: string | null | undefined): string => {
  if (!dmy) return '';
  const clean = dmy.replace(/[^0-9]/g, '');
  if (clean.length !== 8) return '';
  const day = clean.slice(0, 2);
  const month = clean.slice(2, 4);
  const year = clean.slice(4, 8);
  const ymd = `${year}-${month}-${day}`;
  const d = new Date(ymd);
  return !isNaN(d.getTime()) ? ymd : '';
};

export const formatDateInput = (val: string, prevVal: string): string => {
  const isDeleting = val.length < prevVal.length;
  let clean = val.replace(/[^0-9]/g, '');
  if (clean.length > 8) {
    clean = clean.slice(0, 8);
  }
  
  if (!isDeleting) {
    if (clean.length > 2) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
    if (clean.length > 4) {
      clean = clean.slice(0, 5) + '/' + clean.slice(5);
    }
  } else {
    if (clean.length > 4) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2, 4) + '/' + clean.slice(4);
    } else if (clean.length > 2) {
      clean = clean.slice(0, 2) + '/' + clean.slice(2);
    }
  }
  return clean;
};