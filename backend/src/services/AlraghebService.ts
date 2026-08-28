import axios from 'axios';
import crypto from 'crypto';

class AlraghebService {
  private baseURL = 'https://api.alragheb-store.com';
  private apiToken = '7288e5b653f4417472fc5b9e872e1c3e5d03cdadd4840bf3';

  private getClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'api-token': this.apiToken,
        'Accept': 'application/json'
      }
    });
  }

  private handleError(error: any) {
    if (error.response && error.response.data) {
      const data = error.response.data;
      const code = data.error_code || data.code;
      let message = data.message || 'Unknown error occurred';

      switch (code) {
        case 120: message = 'Api Token is required!'; break;
        case 121: message = 'Token error'; break;
        case 122: message = 'Not allowed to use API'; break;
        case 123: message = 'IP not allowed'; break;
        case 130: message = 'The site is under maintenance'; break;
        case 100: message = 'Insufficient balance'; break;
        case 105: message = 'Quantity not available'; break;
        case 106: message = 'Quantity not allowed'; break;
        case 107: message = 'Player ID blocked'; break;
        case 108: message = '2FA required'; break;
        case 109: message = 'Product deleted or not found'; break;
        case 110: message = 'Product not available now'; break;
        case 111: message = 'Try again after 1 minute'; break;
        case 112: message = 'Quantity is too small'; break;
        case 113: message = 'Quantity is too large'; break;
        case 114:
        case 500: message = 'Unknown error from provider'; break;
      }

      throw { code, message, originalError: data };
    }
    throw { code: 500, message: error.message || 'Network error' };
  }

  async getProfile() {
    try {
      const response = await this.getClient().get('/client/api/profile');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getContent(categoryId: number | string = 0) {
    try {
      const response = await this.getClient().get(`/client/api/content/${categoryId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProducts(productIds?: string[], base: boolean = false) {
    try {
      let url = '/client/api/products';
      const params = new URLSearchParams();
      if (productIds && productIds.length > 0) {
        params.append('products_id', productIds.join(','));
      }
      if (base) {
        params.append('base', '1');
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await this.getClient().get(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createOrder(productId: string | number, qty: number, playerId: string, orderUuid?: string) {
    try {
      const uuid = orderUuid || crypto.randomUUID();
      const response = await this.getClient().get(
        `/client/api/newOrder/${productId}/params?qty=${qty}&playerId=${encodeURIComponent(playerId)}&order_uuid=${uuid}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async checkOrders(orderIds: string[], useUuid: boolean = false) {
    try {
      const idsParam = JSON.stringify(orderIds);
      let url = `/client/api/check?orders=${encodeURIComponent(idsParam)}`;
      if (useUuid) {
        url += '&uuid=1';
      }
      const response = await this.getClient().get(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default new AlraghebService();
