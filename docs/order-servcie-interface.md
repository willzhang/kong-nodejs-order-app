该 Express 应用提供以下 REST API 接口，用于订单管理功能：

1. **健康检查接口**  
   - **路径**: `/health`  
   - **方法**: `GET`  
   - **描述**: 返回订单服务的健康状态信息。  
   - **响应**: JSON 对象，包含状态、服务名称和时间戳。  
     ```json
     {
       "status": "healthy",
       "service": "order-service",
       "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
     }
     ```

2. **创建订单接口**  
   - **路径**: `/orders`  
   - **方法**: `POST`  
   - **描述**: 创建新订单并通过 Kong 网关调用库存服务检查库存。  
   - **请求体**:  
     ```json
     {
       "productId": "商品ID",      // 必须，字符串
       "quantity": "数量",        // 必须，整数
       "customerName": "客户名称" // 必须，字符串
     }
     ```  
   - **响应**:  
     - 成功**: 返回订单详情，包括订单状态和库存检查结果。  
     - 错误（400）**: 缺少必要参数或数量无效（≤ 0）。  
     - 错误（500）**: 库存检查失败或服务器内部错误。  
     ```json
     // 成功响应
     {
       "success": true,
       "orderId": "订单ID",
       "productId": "商品ID",
       "quantity": "数量",
       "customerName": "客户名称",
       "status": "confirmed/canceled", // 库存充足/不足
       "stockStatus": "sufficient/insufficient/check_failed",
       "stockInfo": { /* 库存服务返回的库存信息 */ },
       "createdAt": "创建时间戳"
     }
     // 错误响应
     {
       "error": true,
        "message": "错误信息",
       "orderId": "订单ID", // 如果适用
       "details": "详细错误信息" // 如果适用
     }
     ```

3. **查询单个订单接口**  
   - **路径**: `/orders/:orderId`  
   - **方法**: `GET`  
   - **描述**: 根据订单 ID 查询订单详情。  
   - **参数**:  
     - `orderId`（路径参数）：订单 ID。  
   - **响应**:  
     - 成功**: 返回订单的完整信息。  
     - 错误（404）**: 订单不存在。  
     ```json
     // 成功响应
     {
       "orderId": "订单ID",
       "productId": "商品ID",
       "quantity": "数量",
       "customerName": "客户名称",
       "status": "订单状态",
       "stockStatus": "库存状态",
       "createdAt": "创建时间戳",
       "stockInfo": { /* 库存信息 */ },
       "error": "错误信息" // 如果适用
     }
     // 错误响应
     {
       "error": true,
       "message": "订单不存在"
     }
     ```

4. **获取所有订单接口**  
   - **路径**: `/orders`  
   - **方法**: `GET`  
   - **描述**: 返回所有订单的列表。  
   - **响应**:  
     ```json
     {
       "success": true,
       "count": "订单数量",
       "orders": [
         {
           "orderId": "订单ID",
           "productId": "商品ID",
           "quantity": "数量",
           "customerName": "客户名称",
           "status": "订单状态",
           "stockStatus": "库存状态",
           "createdAt": "创建时间戳",
           "stockInfo": { /* 库存信息 */ },
           "error": "错误信息" // 如果适用
         },
         ...
       ]
     }
     ```

### 总结
该应用提供了一个订单管理 REST API，支持健康检查、创建订单（与库存服务交互）、查询单个订单和获取所有订单等功能。所有接口均返回 JSON 格式的响应，并包含详细的成功或错误信息。订单创建过程中通过 Kong 网关调用库存服务（位于 `http://192.168.73.11:8000/inventory-service/check-stock`）来检查库存状态。
