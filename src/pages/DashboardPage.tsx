import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import AccountCard from '../components/dashboard/AccountCard';
import TransactionsList from '../components/dashboard/TransactionsList';
import { ArrowUpRight, ArrowDownLeft, CreditCard, RefreshCw } from 'lucide-react';
import TransactionModal from '../components/transactions/TransactionModal';
import CreateAccountModal from '../components/accounts/CreateAccountModal';

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
  const { currentUser, userData } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] = useState<'deposit' | 'withdrawal' | 'transfer' | null>(null);

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

        accountsSnapshot.forEach((doc) => {
          accountsList.push({
            id: doc.id,
            ...doc.data() as Account
          });
        });

        setAccounts(accountsList);

        // Fetch recent transactions
        const transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc'),
          limit(5)
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList: Transaction[] = [];

        transactionsSnapshot.forEach((doc) => {
          transactionsList.push({
            id: doc.id,
            ...doc.data() as Transaction
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

  const handleQuickAction = (action: 'transfer' | 'deposit' | 'withdrawal' | 'newAccount') => {
    if (action === 'newAccount') {
      setIsAccountModalOpen(true);
    } else {
      setSelectedTransactionType(action);
      setIsTransactionModalOpen(true);
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  };

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {userData?.fullName}!</h1>
          <p className="mt-1 text-sm text-gray-500">Here's an overview of your finances.</p>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Total Balance</h2>
            <p className="mt-2 text-3xl font-semibold text-gray-900">${getTotalBalance().toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Active Accounts</h2>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{accounts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-sm font-medium text-gray-500">Recent Transactions</h2>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{transactions.length}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAction('transfer')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <span className="font-medium">Transfer</span>
            </button>
            <button
              onClick={() => handleQuickAction('deposit')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                <ArrowDownLeft className="h-5 w-5" />
              </div>
              <span className="font-medium">Deposit</span>
            </button>
            <button
              onClick={() => handleQuickAction('newAccount')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-3">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="font-medium">New Account</span>
            </button>
            <button
              onClick={() => handleQuickAction('withdrawal')}
              className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mr-3">
                <RefreshCw className="h-5 w-5" />
              </div>
              <span className="font-medium">Withdraw</span>
            </button>
          </div>
        </div>

        {/* Accounts */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Accounts</h2>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + Add New Account
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              + New Transaction
            </button>
          </div>
          <TransactionsList transactions={transactions} />
        </div>

        {/* Modals */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => {
            setIsTransactionModalOpen(false);
            setSelectedTransactionType(null);
          }}
          onSuccess={(transaction) => {
            setTransactions([transaction, ...transactions]);
            setIsTransactionModalOpen(false);
          }}
          initialTransactionType={selectedTransactionType}
        />

        <CreateAccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSuccess={(account) => {
            setAccounts([...accounts, account]);
            setIsAccountModalOpen(false);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default DashboardPage;