export const useFormat = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '';
  }

  return num.toLocaleString('pt-br', {
    style: 'currency',
    currency: 'BRL',
  });
};
