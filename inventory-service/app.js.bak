const express = require('express');
const cors = require('cors');

const app = express();
const port = 3002;

// 中间件
app.use(cors());
app.use(express.json());

// 模拟商品库存数据
const inventory = new Map([
    ['PROD001', { name: 'iPhone 15 Pro', stock: 50, reserved: 0 }],
    ['PROD002', { name: 'MacBook Air', stock: 30, reserved: 0 }],
    ['PROD003', { name: 'AirPods Pro', stock: 100, reserved: 0 }]
]);

// 库存操作日志
const stockLogs = [];

// 记录库存操作日志
function logStockOperation(operation, productId, quantity, orderId, result) {
    const log = {
        timestamp: new Date().toISOString(),
        operation,
        productId,
        quantity,
        orderId,
        result,
        currentStock: inventory.get(productId)?.stock || 0
    };
    stockLogs.push(log);
    console.log(`📊 库存操作日志:`, log);
}

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'inventory-service',
        timestamp: new Date().toISOString()
    });
});

// 检查库存接口
app.post('/check-stock', (req, res) => {
    try {
        const { productId, quantity, orderId } = req.body;
        
        // 验证输入
        if (!productId || !quantity) {
            return res.status(400).json({
                error: true,
                message: '缺少必要参数：productId, quantity'
            });
        }

        console.log(`🔍 检查库存请求: 商品=${productId}, 数量=${quantity}, 订单=${orderId}`);
        
        // 检查商品是否存在
        const product = inventory.get(productId);
        if (!product) {
            logStockOperation('check', productId, quantity, orderId, 'product_not_found');
            return res.status(404).json({
                error: true,
                message: '商品不存在',
                available: false,
                productId,
                requestedQuantity: quantity
            });
        }
        
        // 计算可用库存
        const availableStock = product.stock - product.reserved;
        const isAvailable = availableStock >= quantity;
        
        if (isAvailable) {
            // 库存充足，预留库存
            product.reserved += quantity;
            inventory.set(productId, product);
            
            logStockOperation('reserve', productId, quantity, orderId, 'success');
            
            console.log(`✅ 库存充足: ${product.name}, 可用=${availableStock}, 需求=${quantity}`);
            
            res.json({
                success: true,
                available: true,
                productId,
                productName: product.name,
                requestedQuantity: quantity,
                availableStock: availableStock - quantity, // 预留后的可用库存
                totalStock: product.stock,
                reservedStock: product.reserved,
                message: '库存充足，已预留'
            });
        } else {
            logStockOperation('check', productId, quantity, orderId, 'insufficient');
            
            console.log(`❌ 库存不足: ${product.name}, 可用=${availableStock}, 需求=${quantity}`);
            
            res.json({
                success: true,
                available: false,
                productId,
                productName: product.name,
                requestedQuantity: quantity,
                availableStock,
                totalStock: product.stock,
                reservedStock: product.reserved,
                message: '库存不足'
            });
        }
        
    } catch (error) {
        console.error('❌ 检查库存失败:', error);
        res.status(500).json({
            error: true,
            message: '库存检查失败：' + error.message
        });
    }
});

// 释放预留库存接口
app.post('/release-stock', (req, res) => {
    try {
        const { productId, quantity, orderId } = req.body;
        
        const product = inventory.get(productId);
        if (!product) {
            return res.status(404).json({
                error: true,
                message: '商品不存在'
            });
        }
        
        const releaseQuantity = Math.min(quantity, product.reserved);
        product.reserved -= releaseQuantity;
        inventory.set(productId, product);
        
        logStockOperation('release', productId, releaseQuantity, orderId, 'success');
        
        console.log(`🔓 释放预留库存: ${product.name}, 数量=${releaseQuantity}`);
        
        res.json({
            success: true,
            productId,
            productName: product.name,
            releasedQuantity: releaseQuantity,
            availableStock: product.stock - product.reserved,
            reservedStock: product.reserved
        });
        
    } catch (error) {
        console.error('❌ 释放库存失败:', error);
        res.status(500).json({
            error: true,
            message: '释放库存失败：' + error.message
        });
    }
});

// 确认库存扣减接口
app.post('/confirm-stock', (req, res) => {
    try {
        const { productId, quantity, orderId } = req.body;
        
        const product = inventory.get(productId);
        if (!product) {
            return res.status(404).json({
                error: true,
                message: '商品不存在'
            });
        }
        
        const confirmQuantity = Math.min(quantity, product.reserved);
        product.stock -= confirmQuantity;
        product.reserved -= confirmQuantity;
        inventory.set(productId, product);
        
        logStockOperation('confirm', productId, confirmQuantity, orderId, 'success');
        
        console.log(`✅ 确认库存扣减: ${product.name}, 数量=${confirmQuantity}`);
        
        res.json({
            success: true,
            productId,
            productName: product.name,
            confirmedQuantity: confirmQuantity,
            remainingStock: product.stock,
            reservedStock: product.reserved
        });
        
    } catch (error) {
        console.error('❌ 确认库存失败:', error);
        res.status(500).json({
            error: true,
            message: '确认库存失败：' + error.message
        });
    }
});

// 查询库存接口
app.get('/stock/:productId', (req, res) => {
    const { productId } = req.params;
    const product = inventory.get(productId);
    
    if (!product) {
        return res.status(404).json({
            error: true,
            message: '商品不存在'
        });
    }
    
    res.json({
        success: true,
        productId,
        productName: product.name,
        totalStock: product.stock,
        reservedStock: product.reserved,
        availableStock: product.stock - product.reserved
    });
});

// 获取所有库存接口
app.get('/stock', (req, res) => {
    const stockList = Array.from(inventory.entries()).map(([productId, product]) => ({
        productId,
        productName: product.name,
        totalStock: product.stock,
        reservedStock: product.reserved,
        availableStock: product.stock - product.reserved
    }));
    
    res.json({
        success: true,
        count: stockList.length,
        inventory: stockList
    });
});

// 获取库存操作日志
app.get('/logs', (req, res) => {
    res.json({
        success: true,
        count: stockLogs.length,
        logs: stockLogs.slice(-50) // 返回最近50条日志
    });
});

// 启动服务
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 库存服务启动成功！`);
    console.log(`📍 服务地址: http://0.0.0.0:${port}`);
    console.log(`📋 健康检查: http://0.0.0.0:${port}/health`);
    console.log(`📦 初始库存:`);
    inventory.forEach((product, productId) => {
        console.log(`  - ${productId}: ${product.name} (库存: ${product.stock})`);
    });
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
