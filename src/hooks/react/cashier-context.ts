import { createContext } from 'react';
import type { PaymentContext } from '../cashier2';

export const CashierContext = createContext<{ cashier: PaymentContext } | null>(null);
