import cron from 'node-cron';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';
import EshhanleService from './EshhanleService';

export const startSyncService = () => {
  // Sync products every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const productsData = await EshhanleService.getProducts();
      if (!productsData || productsData.status !== 'OK') {
        console.error('[SyncService] Invalid response from provider', productsData);
        return;
      }
      
      const providerProducts = productsData.data || [];
      const markupPercentage = 15;
      const localProducts = await Product.find({ apiMapping: { $exists: true, $ne: '' } });

      for (const localProd of localProducts) {
        const providerProdId = localProd.apiMapping;
        const providerProd = providerProducts.find((p: any) => p.product_id.toString() === providerProdId);
        
        if (providerProd) {
          const costPrice = parseFloat(providerProd.price) || 0;
          const newPrice = costPrice + (costPrice * (markupPercentage / 100));
          
          if (localProd.storeType === 'quantities') {
            localProd.unitPriceUSD = parseFloat(newPrice.toFixed(3));
          } else {
            localProd.price = parseFloat(newPrice.toFixed(3));
          }
          
          if (providerProd.available === false) {
             localProd.status = 'Inactive';
          } else {
             localProd.status = 'Active';
          }
          await localProd.save();
        }
      }
    } catch (error) {
      console.error('[SyncService] Error during products sync:', error);
    }
  });

  // Sync orders every 5 seconds
  setInterval(async () => {
    try {
      const pendingOrders = await Order.find({ status: 'processing', providerOrderId: { $exists: true, $ne: null } });
      if (pendingOrders.length === 0) return;
      const providerOrderIds = pendingOrders.map(o => o.providerOrderId);
      
      const checkRes = await EshhanleService.checkOrders(providerOrderIds);
      if (checkRes && checkRes.status === 'OK' && checkRes.data) {
         
         const dataItems = Array.isArray(checkRes.data) ? checkRes.data : Object.values(checkRes.data);

         for (const providerOrderInfo of dataItems) {
            // Using order_id or id from provider data
            const order = pendingOrders.find(o => String(o.providerOrderId) === String((providerOrderInfo as any).order_id || (providerOrderInfo as any).id));
            if (order) {
               const oldStatus = order.status;
               const pStatus = (providerOrderInfo as any).status;
               
               if (pStatus === 'accepted' || pStatus === 'completed') {
                  order.status = 'accepted';
                  order.responseInfo = 'تم التنفيذ بنجاح (مُزامن تلقائي)';
               } else if (pStatus === 'rejected' || pStatus === 'canceled' || pStatus === 'refunded') {
                  order.status = 'rejected';
                  order.responseInfo = `مرفوض من المزود (مُزامن تلقائي)`;
                  
                  // Refund user
                  const user = await User.findOne({ $or: [{ email: order.userEmail }, { _id: order.userId }] });
                  if (user) {
                      const orderPrice = parseFloat(String(order.price).split(' ')[0]);
                      user.balance = (user.balance || 0) + orderPrice;
                      await user.save();
                  }
               }
               
               if (oldStatus !== order.status) {
                  await order.save();
               }
            }
         }
      }
    } catch (error: any) {
      console.error('[SyncService] Error during orders sync:', error.message || error);
    }
  }, 5000);
};
