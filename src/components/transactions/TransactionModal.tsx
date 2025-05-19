import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { X } from 'lucide-react';

interface Account {
  id: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
  initialTransactionType?: 'deposit' | 'withdrawal' | 'transfer' | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTransactionType
}) => {
  const { currentUser } = useAuth();
  const [type, setType] = useState<'deposit' | 'withdrawal' | 'transfer'>(
    initialTransactionType || 'deposit'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!currentUser) return;

      try {
        const accountsQuery = query(
          collection(db, 'accounts'),
          where('userId', '==', currentUser.uid),
          where('isActive', '==', true)
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
        
        // Set default account if available
        if (accountsList.length > 0) {
          setFromAccount(accountsList[0].id);
          setToAccount(accountsList.length > 1 ? accountsList[1].id : accountsList[0].id);
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    if (isOpen) {
      fetchAccounts();
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a transaction');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!description) {
      setError('Please enter a description');
      return;
    }

    if (type === 'transfer' && (!fromAccount || !toAccount)) {
      setError('Please select accounts for transfer');
      return;
    }

    if (type === 'withdrawal' && !fromAccount) {
      setError('Please select an account');
      return;
    }

    if (type === 'deposit' && !toAccount) {
      setError('Please select an account');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find account objects
      const fromAccountObj = accounts.find(acc => acc.id === fromAccount);
      const toAccountObj = accounts.find(acc => acc.id === toAccount);
      
      // Check if enough balance for withdrawal or transfer
      if ((type === 'withdrawal' || type === 'transfer') && 
          fromAccountObj && 
          fromAccountObj.balance < parseFloat(amount)) {
        setError('Insufficient balance for this transaction');
        setLoading(false);
        return;
      }

      // Prepare transaction data
      const transactionData = {
        userId: currentUser.uid,
        type,
        amount: parseFloat(amount),
        currency: type === 'transfer' ? fromAccountObj?.currency : toAccountObj?.currency,
        description,
        date: new Date().toISOString(),
        counterparty: counterparty || undefined,
        fromAccountId: type === 'deposit' ? null : fromAccount,
        toAccountId: type === 'withdrawal' ? null : toAccount,
      };

      // Create transaction document
      const docRef = await addDoc(collection(db, 'transactions'), transactionData);
      
      // Update account balances
      if (type === 'withdrawal' && fromAccountObj) {
        await updateDoc(doc(db, 'accounts', fromAccount), {
          balance: fromAccountObj.balance - parseFloat(amount)
        });
      } else if (type === 'deposit' && toAccountObj) {
        await updateDoc(doc(db, 'accounts', toAccount), {
          balance: toAccountObj.balance + parseFloat(amount)
        });
      } else if (type === 'transfer' && fromAccountObj && toAccountObj) {
        await updateDoc(doc(db, 'accounts', fromAccount), {
          balance: fromAccountObj.balance - parseFloat(amount)
        });
        await updateDoc(doc(db, 'accounts', toAccount), {
          balance: toAccountObj.balance + parseFloat(amount)
        });
      }
      
      onSuccess({
        id: docRef.id,
        type,
        amount: parseFloat(amount),
        currency: type === 'transfer' ? fromAccountObj?.currency || 'USD' : toAccountObj?.currency || 'USD',
        description,
        date: new Date().toISOString(),
        counterparty: counterparty || undefined
      });
      
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    New Transaction
                  </h3>
                  <button 
                    onClick={onClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Transaction Type
                    </label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium rounded-md ${
                          type === 'deposit' 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setType('deposit')}
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium rounded-md ${
                          type === 'withdrawal' 
                            ? 'bg-red-100 text-red-800 border border-red-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setType('withdrawal')}
                      >
                        Withdrawal
                      </button>
                      <button
                        type="button"
                        className={`py-2 px-4 text-sm font-medium rounded-md ${
                          type === 'transfer' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => setType('transfer')}
                      >
                        Transfer
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">USD</span>
                      </div>
                    </div>
                  </div>

                  {(type === 'withdrawal' || type === 'transfer') && (
                    <div className="mb-4">
                      <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">
                        From Account
                      </label>
                      <select
                        id="fromAccount"
                        value={fromAccount}
                        onChange={(e) => setFromAccount(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                        required
                      >
                        <option value="">Select account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.accountType} ({account.accountNumber}) - Balance: ${account.balance}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {(type === 'deposit' || type === 'transfer') && (
                    <div className="mb-4">
                      <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700">
                        To Account
                      </label>
                      <select
                        id="toAccount"
                        value={toAccount}
                        onChange={(e) => setToAccount(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                        required
                      >
                        <option value="">Select account</option>
                        {accounts.map((account) => (
                          <option 
                            key={account.id} 
                            value={account.id}
                            disabled={type === 'transfer' && account.id === fromAccount}
                          >
                            {account.accountType} ({account.accountNumber}) - Balance: ${account.balance}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Transaction description"
                      required
                    />
                  </div>

                  {(type === 'deposit' || type === 'transfer') && (
                    <div className="mb-4">
                      <label htmlFor="counterparty" className="block text-sm font-medium text-gray-700">
                        {type === 'deposit' ? 'Source' : 'Recipient'}
                      </label>
                      <input
                        type="text"
                        id="counterparty"
                        value={counterparty}
                        onChange={(e) => setCounterparty(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={type === 'deposit' ? 'e.g., Salary, Refund' : 'e.g., John Doe, Rent'}
                      />
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Create Transaction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;