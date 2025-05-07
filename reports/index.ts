import { BalanceSheet } from './BalanceSheet/BalanceSheet';
import { GeneralLedger } from './GeneralLedger/GeneralLedger';
import { GSTR1 } from './GoodsAndServiceTax/GSTR1';
import { GSTR2 } from './GoodsAndServiceTax/GSTR2';
import { ProfitAndLoss } from './ProfitAndLoss/ProfitAndLoss';
import { TrialBalance } from './TrialBalance/TrialBalance';
import { StockBalance } from './inventory/StockBalance';
import { StockLedger } from './inventory/StockLedger';
import { CashFlow} from './CashFlow/CashFlow'
import {GeneralJournal} from './GeneralJournal/GeneralJournal'
import {ChangesInEquity} from './ChangesInEquity/ChangesInEquity'

export const reports = {
  GeneralLedger,
  ProfitAndLoss,
  BalanceSheet,
  TrialBalance,
  CashFlow,
  GeneralJournal,
  ChangesInEquity,
  GSTR1,
  GSTR2,
  StockLedger,
  StockBalance,
} as const;
