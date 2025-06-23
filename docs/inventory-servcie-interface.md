该 Express 应用提供以下接口，用于管理库存服务：

1. **健康检查接口**  
   - **路径**: `GET /health`  
   - **描述**: 返回服务健康状态信息。  
   - **响应**: JSON 对象，包含状态、服务名称和时间戳。  
     ```json
     {
       "status": "healthy",
       "service": "inventory-service",
       "timestamp": "YYYY-MM-DDTHH:mm:ss.sssZ"
     }
     ```

2. **检查库存接口**  
   - **路径**: `POST /check-stock`  
   - **描述**: 检查指定商品的库存充足并预留库存。  
   - **请求体**:  
     ```json
     {
       "productId": "商品ID",
       // 必须，字符串
       "quantity": "请求数量",
       // 必须，整数
       "orderId": "订单ID"         
     // 可选，字符串
     }
     ```  
   - **响应**:  
     - 成功且库存充足：返回商品详情、预留后的库存信息。  
     - 成功但库存不足：返回库存不足的信息。  
     - 错误（400）：商品不存在或缺少参数。  
     - 错误（500）：服务器内部错误。  
     ```json
     {
       "success": true,
       // 或false
       "available": true/false,
       // 库存是否充足
       "productId": "商品ID",
       "productName": "商品名称",
       "requestedQuantity": "请求数量",
       "availableStock": "可用库存",
       // 预留后的可用库存
       "totalStock": "总库存量",
       "reservedStock": "已预留的库存",
       "message": "库存充足，已预留库存" 或 "库存不足"
     }
     ```

3. **释放预留库存接口**  
   - **路径**: `POST /release-stock`  
   - **描述**: 释放指定商品的预留库存。  
   - **请求体**:  
     ```json
     {
       "productId": "商品ID",
       // 必须，字符串
       "quantity": "释放数量",
       // 必须，整数
       "orderId": "订单ID"         
     // 可选，字符串
     }
     ```  
   - **响应**:  
     - 成功：返回释放的商品信息和更新后的库存状态。  
     - 错误（404）：商品不存在。  
     - 错误（500）：服务器内部错误。  
     ```json
     {
       "success": true,
       "productId": "商品ID",
       "productName": "商品名称",
       "releasedQuantity": "释放数量",
       "availableStock": "可用库存",
       "reservedStock": "已预留库存"
     }
     ```

4. **确认库存扣减接口**  
   - **路径**: `POST /confirm-stock`  
   - **描述**: 确认扣减指定商品的库存和预留库存。  
   - **请求体**:  
     ```json
     {
       "productId": "商品ID",
       // 必须，字符串
       "quantity": "扣减数量",
       // 必须，整数
       "orderId": "订单ID"         
     // 可选，字符串
     }
     ```  
   - **响应**:  
     - 成功：返回扣减的商品信息和剩余库存状态。  
     - 错误（404）：商品不存在。  
     - 错误（500）：服务器内部错误。  
     ```json
     {
       "success": true,
       "productId": "商品ID",
       "productName": "商品名称",
       "confirmedQuantity": "确认扣减数量",
       "remainingStock": "剩余库存",
       "reservedStock": "已预留库存"
     }
     ```

5. **查询单个商品库存接口**  
   - **路径**: `GET /stock/:productId`  
   - **描述**: 查询指定商品的库存信息。  
   - **参数**:  
     - `productId`（路径参数）：商品 ID。  
   - **响应**:  
     - 成功：返回商品的库存详情。  
     - 错误（404）：商品不存在。  
     ```json
     {
       "success": true,
       "productId": "商品ID",
       "productName": "商品名称",
       "totalStock": "总库存量",
       "reservedStock": "已预留库存",
       "availableStock": "可用库存"
     }
     ```

6. **查询所有库存接口**  
   - **路径**: `GET /stock`  
   - **描述**: 返回所有商品的库存信息列表。  
   - **响应**:  
     ```json
     {
       "success": true,
       "count": "商品数量",
       "inventory": [
         {
           "productId": "商品ID",
           "productName": "商品名称",
           "totalStock": "总库存量",
           "reservedStock": "已预留库存",
           "availableStock": "可用库存"
         },
         ...
       ]
     }
     ```

7. **获取库存操作日志接口**  
   - **路径**: `GET /logs`  
   - **描述**: 返回最近 50 条库存操作日志。  
   - **响应**:  
     ```json
     {
       "success": true,
       "count": "日志数量",
       "logs": [
         {
           "timestamp": "操作时间",
           "operation": "操作类型",
           "productId": "商品ID",
           "quantity": "操作数量",
           "orderId": "订单ID",
           "result": "操作结果",
           "currentStock": "当前库存"
         },
         ...
       ]
     }
     ```

### 总结
该应用提供了一个完整的库存管理 REST API，支持健康检查、库存检查与预留、释放预留库存、确认库存扣减、查询库存状态以及查看操作日志等功能。所有接口均返回 JSON 格式的响应，并包含详细的成功或错误信息。
