import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import AccountCard from '../components/dashboard/AccountCard';
import TransactionsList from '../components/dashboard/TransactionsList';
import { Plus, CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import AccountSummary from '../components/dashboard/AccountSummary';

interface Account {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  date: string;
  counterparty?: string;
}

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    const fetchAccountsAndTransactions = async () => {
      if (!currentUser) return;

      try {
        // Fetch accounts
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userId', '==', currentUser.uid)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        const accountsList: Account[] = [];
        let total = 0;

        accountsSnapshot.forEach((doc) => {
          const accountData = doc.data() as Account;
          accountsList.push({
            id: doc.id,
            ...accountData
          });
          total += accountData.balance;
        });

        setAccounts(accountsList);
        setTotalBalance(total);

        // Fetch recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(10)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList: Transaction[] = [];

        transactionsSnapshot.forEach((doc) => {
          const transactionData = doc.data() as Transaction;
          transactionsList.push({
            id: doc.id,
            ...transactionData
          });
        });

        setTransactions(transactionsList);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountsAndTransactions();
  }, [currentUser]);

  // Sample data for testing if no real data exists
  useEffect(() => {
    if (!loading && transactions.length === 0) {
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          type: 'deposit',
          amount: 1500,
          currency: 'USD',
          description: 'Salary Deposit',
          date: new Date().toISOString(),
          counterparty: 'ACME Corp'
        },
        {
          id: '2',
          type: 'withdrawal',
          amount: 120,
          currency: 'USD',
          description: 'ATM Withdrawal',
          date: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '3',
          type: 'transfer',
          amount: 350,
          currency: 'USD',
          description: 'Money Transfer',
          date: new Date(Date.now() - 172800000).toISOString(),
          counterparty: 'John Doe'
        }
      ];
      setTransactions(sampleTransactions);
    }

    if (!loading && accounts.length === 0) {
      const sampleAccounts: Account[] = [
        {
          id: '1',
          accountType: 'Savings',
          accountNumber: 'SAV-123456',
          balance: 2500,
          currency: 'USD',
          isActive: true
        },
        {
          id: '2',
          accountType: 'Checking',
          accountNumber: 'CHK-789012',
          balance: 1200,
          currency: 'USD',
          isActive: true
        }
      ];
      setAccounts(sampleAccounts);
      setTotalBalance(sampleAccounts.reduce((sum, account) => sum + account.balance, 0));
    }
  }, [loading, transactions.length, accounts.length]);

  return (
    <PageLayout>
      <div className="pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome back!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your finances.</p>
        </div>

        {/* Account Summary */}
        <AccountSummary totalBalance={totalBalance} totalAccounts={accounts.length} />

        {/* Quick Actions */}
        <div className="mt-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                <ArrowUpRight size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Transfer</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                <ArrowDownLeft size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">Deposit</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
                <CreditCard size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">New Account</span>
            </button>
            <button className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
                <RefreshCw size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">History</span>
            </button>
          </div>
        </div>

        {/* Accounts Section */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Accounts</h2>
            <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none">
              <Plus className="mr-1 h-4 w-4" /> New Account
            </button>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 h-48 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  accountType={account.accountType}
                  accountNumber={account.accountNumber}
                  balance={account.balance}
                  currency={account.currency}
                  isActive={account.isActive}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          {loading ? (
            <div className="bg-white rounded-lg shadow h-64 animate-pulse"></div>
          ) : (
            <TransactionsList transactions={transactions} />
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;