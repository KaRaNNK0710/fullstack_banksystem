import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import TransactionsList from '../components/dashboard/TransactionsList';
import { Calendar, Filter, Download } from 'lucide-react';
import TransactionModal from '../components/transactions/TransactionModal';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;
  currency: string;
  description: string;
  date: string;
  counterparty?: string;
}

const TransactionsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('last30');
  const [transactionType, setTransactionType] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;

      try {
        // Get date for filtering
        let startDate = new Date();
        if (dateRange === 'last30') {
          startDate.setDate(startDate.getDate() - 30);
        } else if (dateRange === 'last90') {
          startDate.setDate(startDate.getDate() - 90);
        } else if (dateRange === 'last365') {
          startDate.setDate(startDate.getDate() - 365);
        }

        // Create query
        let transactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', currentUser.uid),
          where('date', '>=', startDate.toISOString()),
          orderBy('date', 'desc')
        );

        // Add type filter if needed
        if (transactionType !== 'all') {
          transactionsQuery = query(
            collection(db, 'transactions'),
            where('userId', '==', currentUser.uid),
            where('type', '==', transactionType),
            where('date', '>=', startDate.toISOString()),
            orderBy('date', 'desc')
          );
        }

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
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentUser, dateRange, transactionType]);

  // Sample data for testing if no real data exists
  useEffect(() => {
    if (!loading && transactions.length === 0) {
      // Create transactions for the last 30 days
      const sampleTransactions: Transaction[] = [];
      const now = new Date();
      
      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        const type = ['deposit', 'withdrawal', 'transfer'][Math.floor(Math.random() * 3)] as 'deposit' | 'withdrawal' | 'transfer';
        const amount = Math.floor(Math.random() * 1000) + 10;
        
        let description = '';
        let counterparty = undefined;
        
        if (type === 'deposit') {
          description = 'Deposit';
          counterparty = ['Salary', 'Interest', 'Refund', 'Transfer'][Math.floor(Math.random() * 4)];
        } else if (type === 'withdrawal') {
          description = ['ATM Withdrawal', 'Online Purchase', 'Bill Payment', 'Subscription'][Math.floor(Math.random() * 4)];
        } else {
          description = 'Money Transfer';
          counterparty = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Lee'][Math.floor(Math.random() * 4)];
        }
        
        sampleTransactions.push({
          id: `sample-${i}`,
          type,
          amount,
          currency: 'USD',
          description,
          date: date.toISOString(),
          counterparty
        });
      }
      
      setTransactions(sampleTransactions);
    }
  }, [loading, transactions.length]);

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDateRange(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionType(e.target.value);
  };

  return (
    <PageLayout>
      <div className="pb-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Transactions</h1>
            <p className="mt-1 text-sm text-gray-500">Review your transaction history.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Transaction
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700 mr-4">Filters:</span>
              
              <div className="relative inline-block w-36 mr-4">
                <select
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="last30">Last 30 days</option>
                  <option value="last90">Last 90 days</option>
                  <option value="last365">Last year</option>
                  <option value="all">All time</option>
                </select>
              </div>
              
              <div className="relative inline-block w-36">
                <select
                  value={transactionType}
                  onChange={handleTypeChange}
                  className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2">
                <Calendar className="h-4 w-4 mr-1" />
                Custom Date
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow h-64 animate-pulse"></div>
        ) : (
          <TransactionsList transactions={transactions} />
        )}

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newTransaction) => {
            setTransactions([newTransaction, ...transactions]);
            setIsModalOpen(false);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default TransactionsPage;