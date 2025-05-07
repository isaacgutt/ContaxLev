import { t } from 'fyo';
import {
  AccountRootType,
  AccountRootTypeEnum,
} from 'models/baseModels/Account/types';
import {
  AccountReport,
  convertAccountRootNodesToAccountList,
} from 'reports/AccountReport';
import { ReportData, RootTypeRow } from 'reports/types';
import { getMapFromList } from 'utils';

export class ChangesInEquity extends AccountReport {
  static title = t`Statement of Changes in Equity`;
  static reportName = 'changes-equity';
  loading = false;

  get rootTypes(): AccountRootType[] {
    return [
      AccountRootTypeEnum.Equity,
    ];
  }

  async setReportData(filter?: string, force?: boolean) {
    this.loading = true;
    if (force || filter !== 'hideGroupAmounts') {
      await this._setRawData();
    }

    const map = this._getGroupedMap(true, 'account');
    const rangeGroupedMap = await this._getGroupedByDateRanges(map);
    const accountTree = await this._getAccountTree(rangeGroupedMap);

    for (const name of Object.keys(accountTree)) {
      const { rootType } = accountTree[name];
      if (this.rootTypes.includes(rootType)) {
        continue;
      }

      delete accountTree[name];
    }

    const rootTypeRows: RootTypeRow[] = this.rootTypes
      .map((rootType) => {
        const rootNodes = this.getRootNodes(rootType, accountTree)!;
        const rootList = convertAccountRootNodesToAccountList(rootNodes);
        return {
          rootType,
          rootNodes,
          rows: this.getReportRowsFromAccountList(rootList),
        };
      })
      .filter((row) => !!row.rootNodes.length);

    this.reportData = this.getReportDataFromRows(
      getMapFromList(rootTypeRows, 'rootType')
    );
    this.loading = false;
  }

  getReportDataFromRows(
    rootTypeRows: Record<AccountRootType, RootTypeRow | undefined>
  ): ReportData {
    const typeNameList = [
      {
        rootType: AccountRootTypeEnum.Equity,
        totalName: t`Total Equity (Credit)`,
      },
    ];

    const reportData: ReportData = [];
    const emptyRow = this.getEmptyRow();
    for (const { rootType, totalName } of typeNameList) {
      const row = rootTypeRows[rootType];
      if (!row) {
        continue;
      }

      reportData.push(...row.rows);

      if (row.rootNodes.length) {
        const totalNode = this.getTotalNode(row.rootNodes, totalName);
        const totalRow = this.getRowFromAccountListNode(totalNode);
        reportData.push(totalRow);
      }

      reportData.push(emptyRow);
    }

    if (reportData.at(-1)?.isEmpty) {
      reportData.pop();
    }

    return reportData;
  }

  getTotalNode(roots: AccountTreeNode[], totalRowName: string): AccountListNode {
    const total: AccountListNode = {
      name: totalRowName,
      account: totalRowName,
      debit: 0,
      credit: 0,
      balance: 0,
      children: [],
    };

    for (const root of roots) {
      total.debit += root.debit;
      total.credit += root.credit;
      total.balance += root.balance;
    }

    return total;
  }

  getRowFromAccountListNode(account: AccountListNode): ReportRow {
    const row: ReportRow = { cells: [] };

    for (const col of this.getColumns()) {
      let value = account[col.fieldname as keyof AccountListNode];
      const rawValue = value;

      if (value === null || value === undefined) {
        value = '';
      }

      if (typeof value === 'number') {
        value = this.fyo.format(value, col.fieldtype);
      }

      row.cells.push({
        value: String(value),
        rawValue,
        align: col.align ?? 'left',
        width: col.width ?? 1,
      });
    }

    return row;
  }

  getColumns(): ColumnField[] {
    return [
      {
        label: '#',
        fieldtype: 'Int',
        fieldname: 'index',
        align: 'right',
        width: 0.5,
      },
      {
        label: t`Account`,
        fieldtype: 'Link',
        fieldname: 'account',
        width: 1.5,
      },
      {
        label: t`Date`,
        fieldtype: 'Date',
        fieldname: 'date',
      },
      {
        label: t`Debit`,
        fieldtype: 'Currency',
        fieldname: 'debit',
        align: 'right',
        width: 1.25,
      },
      {
        label: t`Credit`,
        fieldtype: 'Currency',
        fieldname: 'credit',
        align: 'right',
        width: 1.25,
      },
      {
        label: t`Balance`,
        fieldtype: 'Currency',
        fieldname: 'balance',
        align: 'right',
        width: 1.25,
      },
      {
        label: t`Party`,
        fieldtype: 'Link',
        fieldname: 'party',
      },
      {
        label: t`Ref Name`,
        fieldtype: 'Data',
        fieldname: 'referenceName',
      },
      {
        label: t`Ref Type`,
        fieldtype: 'Data',
        fieldname: 'referenceType',
      },
      {
        label: t`Reverted`,
        fieldtype: 'Check',
        fieldname: 'reverted',
      },
    ] as ColumnField[];
  }
}