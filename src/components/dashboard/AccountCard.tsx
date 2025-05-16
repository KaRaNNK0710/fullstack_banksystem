import React from 'react';
import { CreditCard, TrendingUp, Eye, EyeOff } from 'lucide-react';

interface AccountCardProps {
  accountType: string;
  accountNumber: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({
  accountType,
  accountNumber,
  balance,
  currency,
  isActive
}) => {
  const [showBalance, setShowBalance] = React.useState(false);

  const formatAccountNumber = (num: string) => {
    // Show last 4 digits, hide the rest
    return '••••' + num.slice(-4);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ${
      isActive ? 'bg-gradient-to-r from-indigo-800 to-indigo-600' : 'bg-gray-600'
    }`}>
      <div className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{accountType} Account</p>
            <h3 className="mt-1 text-white text-xl font-bold flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              {formatAccountNumber(accountNumber)}
            </h3>
          </div>
          <div>
            <button 
              onClick={toggleBalanceVisibility}
              className="text-indigo-200 hover:text-white transition-colors duration-200"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-indigo-200 text-xs">Current Balance</p>
          <p className="text-white text-2xl font-bold mt-1 flex items-center">
            {showBalance ? formatCurrency(balance, currency) : '••••••'}
            <TrendingUp className="ml-2 h-5 w-5 text-green-400" />
          </p>
        </div>

        <div className="absolute bottom-0 right-0 opacity-10">
          <CreditCard size={120} />
        </div>
      </div>
      
      <div className="bg-indigo-900 bg-opacity-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-100'
          }`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <button className="text-sm font-medium text-white hover:underline">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountCard;