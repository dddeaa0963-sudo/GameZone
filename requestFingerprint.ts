const requestFingerprintLogic = async (action: 'setup' | 'verify', currentUser: any, showNotification: any) => {
    try {
      if (!window.PublicKeyCredential) {
        // Fallback to simulation if WebAuthn is completely unsupported (e.g. HTTP or older browsers)
        return new Promise<boolean>((resolve) => {
          setTimeout(() => {
            resolve(window.confirm(`جهازك لا يدعم البصمة أو الاتصال غير آمن (HTTP). هل تريد ${action === 'setup' ? 'تفعيل' : 'تأكيد'} البصمة وهمياً للمتابعة؟`));
          }, 300);
        });
      }
      
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      if (action === 'setup') {
        const userId = new Uint8Array(16);
        crypto.getRandomValues(userId);
        
        await navigator.credentials.create({
          publicKey: {
            challenge: challenge,
            rp: { name: "Store App" },
            user: {
              id: userId,
              name: currentUser?.email || "user@example.com",
              displayName: currentUser?.name || "User"
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 }
            ],
            authenticatorSelection: { 
              authenticatorAttachment: "platform", 
              userVerification: "required" 
            },
            timeout: 60000,
            attestation: "none"
          }
        });
        return true;
      } else {
        await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            userVerification: "required",
            timeout: 60000
          }
        });
        return true;
      }
    } catch (e: any) {
      console.error('WebAuthn Error:', e);
      if (e.message && e.message.includes('feature is not enabled')) {
         // Iframe policy error - fallback to simulation for AI Studio Preview
         return new Promise<boolean>((resolve) => {
           setTimeout(() => {
             resolve(window.confirm(`بيئة المعاينة تمنع البصمة. هل تريد ${action === 'setup' ? 'تفعيل' : 'تأكيد'} البصمة وهمياً للمتابعة؟`));
           }, 300);
         });
      } else if (e.name === 'NotAllowedError') {
         showNotification('error', 'تم رفض إذن البصمة أو تم الإلغاء');
      } else if (e.name === 'NotSupportedError') {
         showNotification('error', 'جهازك لا يدعم البصمة');
      } else {
         showNotification('error', 'فشلت عملية المصادقة بالبصمة');
      }
      return false;
    }
  };
