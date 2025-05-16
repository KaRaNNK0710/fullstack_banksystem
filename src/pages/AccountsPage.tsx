import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import AccountCard from '../components/dashboard/AccountCard';
import { Plus } from 'lucide-react';
import CreateAccountModal from '../components/accounts/CreateAccountModal';

interface Account {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

const AccountsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!currentUser) return;

      try {
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userId', '==', currentUser.uid)
        );
        const accountsSnapshot = await getDocs(accountsQuery);
        const accountsList: Account[] = [];

        accountsSnapshot.forEach((doc) => {
          const accountData = doc.data() as Account;
          accountsList.push({
            id: doc.id,
            ...accountData
          });
        });

        setAccounts(accountsList);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [currentUser]);

  // Sample data for testing if no real data exists
  useEffect(() => {
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
    }
  }, [loading, accounts.length]);

  return (
    <PageLayout>
      <div className="pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your Accounts</h1>
            <p className="mt-1 text-sm text-gray-500">Manage all your banking accounts in one place.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-4 w-4" /> New Account
          </button>
        </div>

        {/* Account Types Filter */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium">
              All Accounts
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              Savings
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              Checking
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">
              Investment
            </button>
          </div>
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

        {/* Create Account Modal */}
        <CreateAccountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newAccount) => {
            setAccounts([...accounts, newAccount]);
            setIsModalOpen(false);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default AccountsPage;