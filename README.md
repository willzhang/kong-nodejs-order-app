# kong-nodejs-order-app

部署三个服务，一个前端A，两个后端B和C，A调B，然后触发B调C。
B和C都会注册到kong网关，A调用B，B调用C都是通过kong网关地址192.168.73.11来调用。
