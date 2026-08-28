import React, { useState } from 'react';
import { Shield, X, CheckCircle, Delete, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinSetupStep: 1 | 2;
  setPinSetupStep: (step: 1 | 2) => void;
  tempPin: string;
  setTempPin: (pin: string) => void;
  pinInput: string;
  setPinInput: (pin: string) => void;
  onComplete: (pin: string) => void;
}

const PinSetupModal: React.FC<PinSetupModalProps> = ({
  isOpen,
  onClose,
  pinSetupStep,
  setPinSetupStep,
  tempPin,
  setTempPin,
  pinInput,
  setPinInput,
  onComplete
}) => {
  const [errorAnimation, setErrorAnimation] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: number) => {
    if (pinInput.length < 4) {
      const newPin = pinInput + num;
      setPinInput(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          if (pinSetupStep === 1) {
            setTempPin(newPin);
            setPinInput('');
            setPinSetupStep(2);
          } else {
            if (newPin === tempPin) {
              onComplete(newPin);
              onClose();
            } else {
              setErrorAnimation(true);
              setTimeout(() => {
                setErrorAnimation(false);
                setPinInput('');
              }, 400);
            }
          }
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(pinInput.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mt-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            {pinSetupStep === 1 ? 'تعيين رمز الحماية' : 'تأكيد رمز الحماية'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
            {pinSetupStep === 1 ? 'أدخل 4 أرقام لرمز الحماية الخاص بك' : 'قم بتأكيد الرمز الذي أدخلته'}
          </p>

          <motion.div 
            animate={errorAnimation ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex gap-4 mb-10" 
            dir="ltr"
          >
            {[0, 1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  i < pinInput.length 
                    ? 'bg-blue-600 scale-125 shadow-[0_0_10px_rgba(37,99,235,0.5)]' 
                    : 'bg-gray-200 dark:bg-gray-800'
                }`} 
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-3 gap-4 w-full" dir="ltr">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-2xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeyPress(0)}
              className="h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white text-2xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="h-16 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 text-2xl flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-95"
            >
              <Delete className="w-8 h-8" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PinSetupModal;
