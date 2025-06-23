const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3001;

// Kong网关地址
const KONG_GATEWAY = 'http://192.168.73.11:8000';

// 中间件
app.use(cors());
app.use(express.json());

// 模拟订单数据库
const orders = new Map();

// 生成订单ID
function generateOrderId() {
    return 'ORD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'order-service',
        timestamp: new Date().toISOString()
    });
});

// 创建订单接口
app.post('/orders', async (req, res) => {
    try {
        const { productId, quantity, customerName } = req.body;
        
        // 验证输入
        if (!productId || !quantity || !customerName) {
            return res.status(400).json({
                error: true,
                message: '缺少必要参数：productId, quantity, customerName'
            });
        }

        if (quantity <= 0) {
            return res.status(400).json({
                error: true,
                message: '数量必须大于0'
            });
        }

        const orderId = generateOrderId();
        
        console.log(`📝 收到订单请求: ${orderId}, 商品: ${productId}, 数量: ${quantity}, 客户: ${customerName}`);
        
        // 创建订单记录
        const order = {
            orderId,
            productId,
            quantity,
            customerName,
            status: 'pending',
            createdAt: new Date().toISOString(),
            stockStatus: 'checking'
        };
        
        orders.set(orderId, order);
        
        try {
            // 调用后端C (库存服务) 检查库存
            console.log(`🔍 调用库存服务检查商品 ${productId} 的库存...`);
            
            const stockResponse = await axios.post(`${KONG_GATEWAY}/inventory-service/check-stock`, {
                productId,
                quantity,
                orderId
            }, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const stockData = stockResponse.data;
            console.log(`📦 库存检查结果:`, stockData);
            
            // 更新订单状态
            order.stockStatus = stockData.available ? 'sufficient' : 'insufficient';
            order.status = stockData.available ? 'confirmed' : 'cancelled';
            order.stockInfo = stockData;
            
            orders.set(orderId, order);
            
            // 返回订单信息
            res.json({
                success: true,
                orderId: order.orderId,
                productId: order.productId,
                quantity: order.quantity,
                customerName: order.customerName,
                status: order.status,
                stockStatus: order.stockStatus,
                stockInfo: stockData,
                createdAt: order.createdAt
            });
            
        } catch (stockError) {
            console.error('❌ 调用库存服务失败:', stockError.message);
            
            // 更新订单状态为错误
            order.status = 'error';
            order.stockStatus = 'check_failed';
            order.error = stockError.message;
            orders.set(orderId, order);
            
            res.status(500).json({
                error: true,
                message: '库存检查失败，请稍后重试',
                orderId: orderId,
                details: stockError.message
            });
        }
        
    } catch (error) {
        console.error('❌ 创建订单失败:', error);
        res.status(500).json({
            error: true,
            message: '创建订单失败：' + error.message
        });
    }
});

// 查询订单接口
app.get('/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = orders.get(orderId);
    
    if (!order) {
        return res.status(404).json({
            error: true,
            message: '订单不存在'
        });
    }
    
    res.json(order);
});

// 获取所有订单接口
app.get('/orders', (req, res) => {
    const allOrders = Array.from(orders.values());
    res.json({
        success: true,
        count: allOrders.length,
        orders: allOrders
    });
});

// 启动服务
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 订单服务启动成功！`);
    console.log(`📍 服务地址: http://0.0.0.0:${port}`);
    console.log(`🌐 Kong网关: ${KONG_GATEWAY}`);
    console.log(`📋 健康检查: http://0.0.0.0:${port}/health`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('📴 收到SIGTERM信号，正在关闭服务...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 收到SIGINT信号，正在关闭服务...');
    process.exit(0);
});
