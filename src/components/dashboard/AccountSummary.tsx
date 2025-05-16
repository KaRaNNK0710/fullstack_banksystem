import React from 'react';
import { TrendingUp, CreditCard, AlertTriangle } from 'lucide-react';

interface AccountSummaryProps {
  totalBalance: number;
  totalAccounts: number;
}

const AccountSummary: React.FC<AccountSummaryProps> = ({ totalBalance, totalAccounts }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Total Balance */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Balance
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalBalance)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              View all accounts
            </a>
          </div>
        </div>
      </div>

      {/* Active Accounts */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Accounts
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {totalAccounts}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Add new account
            </a>
          </div>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Transactions
                </dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    0
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-3">
          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              View all transactions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;