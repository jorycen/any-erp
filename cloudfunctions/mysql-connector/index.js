// 云函数入口文件
const cloud = require('wx-server-sdk');
const mysql = require('mysql2/promise');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 微信云函数桥接 MySQL 示例 (mysql-connector)
 * 作用：小程序前端通过云函数中转，直接访问外部 MySQL 数据库
 */
exports.main = async (event, context) => {
  const { action, params } = event;
  
  // 1. 配置 MySQL 数据库连接 (建议从环境变量或云后台配置读取)
  const dbConfig = {
    host: 'YOUR_MYSQL_HOST', // 您的公网 IP 或云内部 IP
    user: 'YOUR_MYSQL_USER',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'ainuoyun_erp',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
  };

  let connection;
  try {
    // 2. 建立连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Cloud Function Connected to MySQL');

    // 3. 根据 Action 执行不同的 SQL
    switch (action) {
      case 'QUERY_USER':
        const [users] = await connection.execute('SELECT USER_ID, USERNAME, ROLE FROM T_USER WHERE USER_ID = ?', [params.userId]);
        return { success: true, data: users[0] };
      
      case 'BATCH_SQL':
        // 执行传入的原始 SQL (仅限内部或高权限使用)
        const [results] = await connection.execute(params.sql, params.values || []);
        return { success: true, data: results };

      default:
        return { success: false, message: 'Unsupported Action: ' + action };
    }
  } catch (error) {
    console.error('❌ MySQL Connection/Query Failed:', error);
    return { success: false, error: error.message };
  } finally {
    if (connection) await connection.end();
  }
};
