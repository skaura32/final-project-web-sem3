const dbConfig = {
    user: 'kritika',
    password: 'j007@j007',
    server: 'LAPTOP-P8TVVSSQ\\SQLEXPRESS',
    database: 'bow_course_registration',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    port: 1433
};

console.log('🔧 Using SQL Server Authentication');
console.log('   User:', dbConfig.user);
console.log('   Server:', dbConfig.server);
console.log('   Database:', dbConfig.database);

module.exports = dbConfig;