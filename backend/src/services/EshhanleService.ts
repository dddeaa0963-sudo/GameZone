import axios, { AxiosInstance, AxiosError } from 'axios';

export interface EshhanleErrorResponse {
  status: 'ERROR';
  error_code: number;
  message: string;
}

export class EshhanleError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = 'EshhanleError';
    this.code = code;
  }
}

class EshhanleService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://eshhanle.online',
      headers: {
        'api-token': 'esh_live_f845e6a162dec1a6122748bdfc39540542ddbc9f14042e531d225bc25926f968',
        'Accept': 'application/json'
      },
      // Ensure we don't throw on standard HTTP errors so we can handle custom error_code
      validateStatus: () => true 
    });
  }

  /**
   * Internal Error Handler
   */
  private handleError(data: any): void {
    if (data && data.status === 'ERROR') {
      const code = data.error_code;
      let errorMessage = data.message || 'Unknown error occurred';

      switch (code) {
        case 120:
        case 121:
          errorMessage = 'خطأ في رمز الوصول (Token).';
          break;
        case 122:
          errorMessage = 'خدمة API غير مفعلة للحساب.';
          break;
        case 123:
          errorMessage = 'IP غير مسموح.';
          break;
        case 130:
          errorMessage = 'الموقع في وضع الصيانة.';
          break;
        case 100:
          errorMessage = 'الرصيد غير كافٍ.';
          break;
        case 105:
        case 106:
        case 112:
        case 113:
          errorMessage = 'يوجد خطأ في الكمية المطلوبة.';
          break;
        case 107:
          errorMessage = 'معرّف اللاعب (Player ID) محظور.';
          break;
        case 108:
          errorMessage = 'التحقق الثنائي مطلوب.';
          break;
        case 109:
        case 110:
          errorMessage = 'المنتج غير موجود أو غير متاح حالياً.';
          break;
        case 111:
          errorMessage = 'يرجى إعادة المحاولة بعد دقيقة.';
          break;
        case 114:
        case 500:
          errorMessage = 'تعذر معالجة الطلب من المزود.';
          break;
      }

      throw new EshhanleError(code, errorMessage);
    }
  }

  /**
   * جلب بيانات الحساب (Profile)
   */
  public async getProfile() {
    try {
      const response = await this.client.get('/client/api/profile');
      this.handleError(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof EshhanleError) throw error;
      throw new Error('فشل الاتصال بمزود الخدمة (Profile)');
    }
  }

  /**
   * جلب الأقسام أو المنتجات داخل قسم
   * @param categoryId رقم القسم (0 للرئيسي)
   */
  public async getContent(categoryId: number | string = 0) {
    try {
      const response = await this.client.get(`/client/api/content/${categoryId}`);
      this.handleError(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof EshhanleError) throw error;
      throw new Error('فشل الاتصال بمزود الخدمة (Content)');
    }
  }

  /**
   * جلب المنتجات
   * @param productsId (اختياري) معرفات المنتجات مفصولة بفاصلة
   * @param base (اختياري) 1 لجلب البيانات المختصرة
   */
  public async getProducts(productsId?: string, base?: number) {
    try {
      const params: any = {};
      if (productsId) params.products_id = productsId;
      if (base) params.base = base;

      const response = await this.client.get('/client/api/products', { params });
      this.handleError(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof EshhanleError) throw error;
      throw new Error('فشل الاتصال بمزود الخدمة (Products)');
    }
  }

  /**
   * إنشاء طلب جديد
   * @param productId معرف المنتج
   * @param qty الكمية
   * @param playerId معرّف اللاعب أو الحقل المطلوب
   * @param orderUuid (اختياري) معرّف فريد لتجنب تكرار الطلب
   */
  public async createOrder(productId: string | number, qty: number, playerId: string, orderUuid?: string) {
    try {
      const params: any = { qty, playerId };
      if (orderUuid) params.order_uuid = orderUuid;

      const response = await this.client.get(`/client/api/newOrder/${productId}/`, { params });
      this.handleError(response.data);
      return response.data; // Expected: { status: "OK", data: { order_id: "...", status: "wait" } }
    } catch (error) {
      if (error instanceof EshhanleError) throw error;
      throw new Error('فشل الاتصال بمزود الخدمة عند إنشاء الطلب');
    }
  }

  /**
   * التحقق من حالة الطلبات
   * @param orders مصفوفة من أرقام الطلبات (أو UUIDs)
   * @param isUuid إذا كانت المعرفات هي UUIDs يجب تمرير true
   */
  public async checkOrders(orders: string[], isUuid: boolean = false) {
    try {
      const params: any = { orders: `[${orders.join(',')}]` };
      if (isUuid) params.uuid = 1;

      const response = await this.client.get('/client/api/check', { params });
      this.handleError(response.data);
      return response.data;
    } catch (error) {
      if (error instanceof EshhanleError) throw error;
      throw new Error('فشل الاتصال بمزود الخدمة (Check Orders)');
    }
  }
}

export default new EshhanleService();
