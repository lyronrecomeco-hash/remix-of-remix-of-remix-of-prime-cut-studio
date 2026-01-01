import { useState, useCallback, ChangeEvent } from 'react';

export const formatCNPJ = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  } else if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }
};

export const useCNPJMask = (initialValue: string = '') => {
  const [value, setValue] = useState(formatCNPJ(initialValue));
  const [rawValue, setRawValue] = useState(initialValue.replace(/\D/g, ''));

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '').slice(0, 14);
    setRawValue(digits);
    setValue(formatCNPJ(digits));
  }, []);

  const isValid = rawValue.length === 14;

  const reset = useCallback(() => {
    setValue('');
    setRawValue('');
  }, []);

  const setInitialValue = useCallback((val: string) => {
    const digits = val.replace(/\D/g, '');
    setRawValue(digits);
    setValue(formatCNPJ(digits));
  }, []);

  return {
    value,
    rawValue,
    onChange: handleChange,
    isValid,
    reset,
    setInitialValue,
  };
};

export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) / 100 : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue || 0);
};

export const useCurrencyMask = (initialValue: number = 0) => {
  const [value, setValue] = useState(formatCurrency(initialValue));
  const [rawValue, setRawValue] = useState(initialValue);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const digits = input.replace(/\D/g, '');
    const numValue = parseInt(digits, 10) / 100 || 0;
    setRawValue(numValue);
    setValue(formatCurrency(numValue));
  }, []);

  const reset = useCallback(() => {
    setValue(formatCurrency(0));
    setRawValue(0);
  }, []);

  const setInitialValue = useCallback((val: number) => {
    setRawValue(val);
    setValue(formatCurrency(val));
  }, []);

  return {
    value,
    rawValue,
    onChange: handleChange,
    reset,
    setInitialValue,
  };
};
